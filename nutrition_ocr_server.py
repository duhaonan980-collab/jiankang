# -*- coding: utf-8 -*-
"""
营养成分表 OCR 后端代理（本地小服务）
====================================
作用：PWA 前端（浏览器）无法直连百度 OCR（跨域被浏览器拦截），
     这里起一个本地服务中转：前端把照片 base64 发过来，
     本服务去百度换 token、调高精度 OCR，再把「识别文本 + 解析好的营养成分」返回。

运行：  python nutrition_ocr_server.py
默认监听 127.0.0.1:8765（0.0.0.0 便于手机局域网访问，见下方 PORT/HOST）。
自测：  python nutrition_ocr_server.py --selftest    # 只测解析函数，不发网络请求

依赖：仅 Python 标准库（http.server / urllib），无需 pip 安装任何包。
"""

import base64
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# ===================== 配置 =====================
API_KEY = "MKeYHzTrKOybmcKvGj5K36vs"
SECRET_KEY = "9DBG08CbYaPxsvvJ4arFhoWSvZwMHxqm"

HOST = "0.0.0.0"          # 0.0.0.0 = 允许局域网（手机）访问；只本机用可改 127.0.0.1
PORT = 8765

# OCR 接口：优先高精度 accurate_basic，无权限(6/17/19)时自动降级到标准版 general_basic
OCR_PATHS = [
    "/rest/2.0/ocr/v1/accurate_basic",   # 高精度版（需在控制台开通；未开通会报 error_code 6）
    "/rest/2.0/ocr/v1/general_basic",    # 标准版（默认开通）
]
NO_PERMISSION_CODES = (6, 17, 19)

TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token"
OCR_URL = "https://aip.baidubce.com"

# token 缓存（内存 + 过期时间；百度 token 有效期 30 天）
_token = {"value": None, "expires": 0.0}
TOKEN_TTL = 29 * 24 * 3600  # 29 天，提前刷新


# ===================== 营养成分解析 =====================
def _num_in_text(s):
    """取字符串里第一个数字（返回字符串，保留原样）。"""
    m = re.search(r"(\d+(?:\.\d+)?)", s)
    return m.group(1) if m else None


def _locate(lines, keys, exclude=()):
    """找到第一个含某 key 的行（跳过含 exclude 中任何词的行），返回 (行索引, key)。"""
    for i, line in enumerate(lines):
        if any(e in line for e in exclude):
            continue
        for k in keys:
            if k in line:
                return i, k
    return None, None


def _field(lines, keys, exclude=()):
    """取某营养项的数值：优先「关键词同行」取数字，找不到就去「下一行」找。
    返回 (数值字符串, 数值所在行)。找不到返回 (None, None)。
    兼容两种 OCR 排版：'能量1590千焦'（同行）和 '能量' + '1590千焦'（换行）。"""
    i, key = _locate(lines, keys, exclude)
    if i is None:
        return None, None
    line = lines[i]
    rest = line[line.find(key) + len(key):]
    v = _num_in_text(rest)
    if v is not None:
        return v, line
    for j in range(i + 1, min(i + 3, len(lines))):
        v = _num_in_text(lines[j])
        if v is not None:
            return v, lines[j]
    return None, None


def _energy_kcal(value_line):
    """value_line 形如 '1590千焦' / '1590 千焦' / '295千卡'，返回千卡数值。"""
    m = re.search(r"(\d+(?:\.\d+)?)", value_line)
    if not m:
        return None
    val = float(m.group(1))
    tail = value_line.lower()
    if "千焦" in tail or "kj" in tail:
        return val / 4.184
    return val  # 千卡 / kcal / 大卡 / 卡 均视为千卡


def parse_nutrition(texts):
    """
    输入：OCR 识别出的多行文本（list[str]）。
    输出：dict，字段与前端 food 结构对应（每 100g 基准）。
    """
    compact = [t.replace(" ", "").replace("\u3000", "") for t in texts]  # 去空格/全角空格
    out = {
        "name": "",
        "cal": 0, "p": 0.0, "c": 0.0, "f": 0.0,
        "fi": 0.0, "va": 0, "vc": 0.0, "sodium_mg": 0.0,
        "per100": True,
    }

    # 能量 / 热量（需按数值所在行判断单位）
    v, vline = _field(compact, ("能量", "热量", "卡路里"))
    if v is not None:
        kc = _energy_kcal(vline)
        if kc is not None:
            out["cal"] = round(kc)

    # 蛋白质
    v, _ = _field(compact, ("蛋白质", "蛋白"))
    if v is not None:
        out["p"] = round(float(v), 1)

    # 脂肪（排除 饱和脂肪 / 反式脂肪 / 不饱和脂肪）
    v, _ = _field(compact, ("脂肪",), exclude=("饱和", "反式", "不饱和"))
    if v is not None:
        out["f"] = round(float(v), 1)

    # 碳水化合物
    v, _ = _field(compact, ("碳水化合物", "碳水"))
    if v is not None:
        out["c"] = round(float(v), 1)

    # 膳食纤维
    v, _ = _field(compact, ("膳食纤维", "纤维"))
    if v is not None:
        out["fi"] = round(float(v), 1)

    # 维生素 A / C（营养表通常不标，有则取）
    v, _ = _field(compact, ("维生素A", "维A"))
    if v is not None:
        out["va"] = int(round(float(v)))
    v, _ = _field(compact, ("维生素C", "维C"))
    if v is not None:
        out["vc"] = round(float(v), 1)

    # 钠（毫克）
    v, _ = _field(compact, ("钠",))
    if v is not None:
        out["sodium_mg"] = round(float(v), 1)

    # 判断基准：每100克 / 每100毫升 视为 per100
    serving_keys = ("每份", "每袋", "每瓶", "每包", "每支", "每罐", "每盒", "每片", "每颗", "serving")
    all_text = "\n".join(compact)
    if any(k in all_text for k in serving_keys):
        out["per100"] = False
    if any(k in all_text for k in ("每100克", "每100g", "每100毫升", "每100ml", "每100ML")):
        out["per100"] = True

    return out


# ===================== 百度 API =====================
def get_access_token():
    if _token["value"] and time.time() < _token["expires"]:
        return _token["value"]

    params = urllib.parse.urlencode({
        "grant_type": "client_credentials",
        "client_id": API_KEY,
        "client_secret": SECRET_KEY,
    })
    url = TOKEN_URL + "?" + params
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    token = data.get("access_token")
    if not token:
        raise RuntimeError("获取 access_token 失败: %s" % data)
    _token["value"] = token
    _token["expires"] = time.time() + TOKEN_TTL
    return token


def _call_ocr(path, token, body):
    req = urllib.request.Request(OCR_URL + path + "?access_token=" + token, data=body)
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


_FRIENDLY = {
    6: "应用未开通「文字识别」接口，请到百度智能云控制台编辑该应用并勾选文字识别接口",
    17: "免费额度今日已用完（每日限次），明天再来或购买次数包",
    18: "QPS 超限（免费版并发 2），稍后重试",
    19: "请求总量超限，免费额度已用完",
    110: "access_token 失效（已自动重试）",
    111: "access_token 过期（已自动重试）",
    216200: "图片为空，请重新拍摄",
    216201: "图片格式错误，仅支持 PNG/JPG/JPEG/BMP",
    216202: "图片尺寸不合法",
}


def _describe_error(data):
    code = data.get("error_code")
    base = "OCR 失败: %s %s" % (code, data.get("error_msg"))
    hint = _FRIENDLY.get(code)
    return base + ("｜" + hint if hint else "")


def ocr_image(b64):
    """调用 OCR，返回 words_result 文本列表。失败抛异常。"""
    token = get_access_token()
    body = urllib.parse.urlencode({"image": b64}).encode("utf-8")

    data = None
    for path in OCR_PATHS:
        data = _call_ocr(path, token, body)
        if data.get("error_code") in (110, 111):  # token 失效，刷新后重试同接口
            _token["value"] = None
            _token["expires"] = 0.0
            token = get_access_token()
            data = _call_ocr(path, token, body)
        if not data.get("error_code"):
            break
        if data.get("error_code") in NO_PERMISSION_CODES:
            continue  # 该接口无权限，降级到下一个
        # 其他错误直接抛出
        raise RuntimeError(_describe_error(data))
    else:
        raise RuntimeError(_describe_error(data))

    return [w.get("words", "") for w in data.get("words_result", [])]


# ===================== HTTP 服务 =====================
class Handler(BaseHTTPRequestHandler):
    server_version = "NutritionOcrProxy/1.0"

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        self._json({
            "ok": True,
            "service": "nutrition-ocr-proxy",
            "hint": "POST /ocr with JSON {\"image\": \"<base64 or dataURL>\"}",
        })

    def do_POST(self):
        if self.path.rstrip("/") != "/ocr":
            self._json({"ok": False, "error": "not found"}, status=404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            payload = json.loads(raw.decode("utf-8"))
            image = payload.get("image", "")
            if not image:
                self._json({"ok": False, "error": "缺少 image 字段"}, status=400)
                return
            # 兼容 dataURL 前缀
            if "," in image and image.lstrip().startswith("data:"):
                image = image.split(",", 1)[1]
            texts = ocr_image(image)
            parsed = parse_nutrition(texts)
            self._json({"ok": True, "texts": texts, "parsed": parsed})
        except Exception as e:  # noqa: BLE001
            self._json({"ok": False, "error": str(e)}, status=502)

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))


def selftest():
    # 用例 1：真实 OCR 输出——标签与数值被拆成两行（百度 actual 行为）
    real_ocr = [
        "营养成分表", "项目", "每100克", "NRV%",
        "能量", "1590千焦", "19%",
        "蛋白质", "8.4克", "14%",
        "脂肪", "5.5克", "9%",
        "碳水化合物", "40.2克", "13%",
        "膳食纤维", "1.6克", "6%",
        "钠", "300毫克", "15%",
    ]
    print("== 用例1：换行拆分（真实 OCR）==")
    print(json.dumps(parse_nutrition(real_ocr), ensure_ascii=False, indent=2))

    # 用例 2：同行合并 + 千卡单位 + 每份标注
    sample2 = ["营养成分表", "能量 295 千卡", "蛋白质 12.3 克", "脂肪 4.0 克", "碳水化合物 50.0 克", "每份 30 克"]
    print("== 用例2：同行合并 + 千卡 + 每份 ==")
    print(json.dumps(parse_nutrition(sample2), ensure_ascii=False, indent=2))

    # 用例 3：含饱和脂肪/反式脂肪，应只取总脂肪
    sample3 = ["能量 1590千焦", "蛋白质 8.4克", "脂肪 5.5克", "饱和脂肪 2.0克", "反式脂肪 0克", "碳水化合物 40.2克"]
    print("== 用例3：排除饱和/反式脂肪 ==")
    print(json.dumps(parse_nutrition(sample3), ensure_ascii=False, indent=2))


def main():
    if "--selftest" in sys.argv:
        selftest()
        return
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    print("营养成分表 OCR 服务已启动:")
    print("  本机访问:  http://127.0.0.1:%d" % PORT)
    print("  OCR 接口:  POST http://127.0.0.1:%d/ocr" % PORT)
    print("  停止服务:  按 Ctrl+C")
    print("  （手机局域网访问：把前端 OCR_SERVER 改成 http://<本机IP>:%d）" % PORT)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")


if __name__ == "__main__":
    main()
