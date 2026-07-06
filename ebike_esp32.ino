/*
 * ============================================
 *   电瓶车续航助手 - ESP32 里程同步模块
 * ============================================
 * 
 * 功能：霍尔传感器计圈 -> 累计里程 -> WiFi AP -> PWA fetch读取
 * 
 * 硬件接线：
 *   ESP32 GPIO4  <---> 霍尔传感器信号脚 (A3144/44E)
 *   ESP32 3.3V   <---> 霍尔传感器 VCC
 *   ESP32 GND    <---> 霍尔传感器 GND
 *   磁铁粘贴在轮辋内侧/刹车盘旁，传感器固定在车叉上（间距2-5mm）
 * 
 * WiFi：AP模式，SSID=EBIKE_ESP32，密码=12345678
 * IP：192.168.4.1
 * 
 * API：
 *   GET  /data    -> {"odo":1234.56,"speed":25.3,"pulses":617280}
 *   POST /setodo  -> {"odo":1234.5}  (初始化里程)
 *   GET  /info    -> 设备信息
 *   GET  /        -> 状态页面
 */

#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>

// ============ 用户配置区 ============
#define HALL_PIN          4       // 霍尔传感器接的GPIO引脚
#define WHEEL_CIRCUMFERENCE 2.0   // 轮周长(米) — 改成你轮胎的实际值！
// 常见轮胎周长参考：
//   16寸 ~1.30m | 20寸 ~1.58m | 24寸 ~1.90m | 26寸 ~2.07m
// ====================================

Preferences prefs;
WebServer server(80);

volatile unsigned long pulseCount = 0;    // 总脉冲数（圈数）
volatile unsigned long lastPulseTime = 0; // 上次脉冲时间（测速用）
volatile float currentSpeed = 0;          // 当前速度 km/h
float totalOdo = 0;                       // 总里程(米) — 非volatile，主循环更新

// 中断：霍尔传感器每转一圈触发一次
void IRAM_ATTR onPulse() {
  unsigned long now = millis();
  unsigned long interval = now - lastPulseTime;

  pulseCount++;

  // 速度 = 周长 / 间隔 * 3.6 (m/s -> km/h)
  if (interval > 0 && interval < 5000) {
    currentSpeed = (WHEEL_CIRCUMFERENCE / 1000.0) / (interval / 1000.0) * 3.6;
  }
  lastPulseTime = now;
}

// ---- HTTP 处理函数 ----

// GET /data — 返回当前里程和速度
void handleData() {
  float speed = (millis() - lastPulseTime > 3000) ? 0 : currentSpeed;
  String json = "{\"odo\":" + String(totalOdo / 1000.0, 2) +
                ",\"speed\":" + String(speed, 1) +
                ",\"pulses\":" + String(pulseCount) + "}";
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// POST /setodo — 设置初始里程（首次使用时PWA自动推送）
void handleSetOdo() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    int idx = body.indexOf("\"odo\":");
    if (idx >= 0) {
      String valStr = body.substring(idx + 6);
      int endIdx = valStr.indexOf("}");
      if (endIdx >= 0) valStr = valStr.substring(0, endIdx);
      valStr.trim();
      float newOdo = valStr.toFloat();
      totalOdo = newOdo * 1000.0;  // km -> m
      pulseCount = (unsigned long)(totalOdo / WHEEL_CIRCUMFERENCE);
      prefs.putFloat("totalOdo", totalOdo);
      prefs.putULong("pulseCount", pulseCount);

      Serial.printf("Set odo: %.2f km\n", totalOdo / 1000.0);
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(200, "application/json", "{\"ok\":true,\"odo\":" + String(totalOdo / 1000.0, 2) + "}");
      return;
    }
  }
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(400, "application/json", "{\"ok\":false}");
}

// GET /info — 设备信息
void handleInfo() {
  String json = "{\"device\":\"EBIKE_ESP32\",\"wheel\":" + String(WHEEL_CIRCUMFERENCE) +
                ",\"odo\":" + String(totalOdo / 1000.0, 2) + "}";
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// GET / — 状态页面
void handleRoot() {
  float speed = (millis() - lastPulseTime > 3000) ? 0 : currentSpeed;
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>";
  html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<style>body{font-family:monospace;text-align:center;padding:40px;background:#1a1a2e;color:#eee}";
  html += "h1{color:#0f3460}p{margin:8px}.val{color:#e94560;font-size:1.2em}hr{border:0.5px solid #333;margin:20px}</style>";
  html += "</head><body>";
  html += "<h1>Ebike ESP32</h1>";
  html += "<p>WiFi: EBIKE_ESP32</p>";
  html += "<p>IP: 192.168.4.1</p>";
  html += "<hr>";
  html += "<p>Odo: <span class='val'>" + String(totalOdo / 1000.0, 2) + " km</span></p>";
  html += "<p>Speed: <span class='val'>" + String(speed, 1) + " km/h</span></p>";
  html += "<p>Pulses: <span class='val'>" + String(pulseCount) + "</span></p>";
  html += "<p>Wheel: <span class='val'>" + String(WHEEL_CIRCUMFERENCE) + " m</span></p>";
  html += "<hr>";
  html += "<p>GET /data | POST /setodo | GET /info</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== EBIKE ESP32 ===");

  // 从闪存加载里程（断电不丢）
  prefs.begin("ebike", false);
  totalOdo = prefs.getFloat("totalOdo", 0);
  pulseCount = prefs.getULong("pulseCount", 0);
  Serial.printf("Loaded: odo=%.2f km, pulses=%lu\n", totalOdo / 1000.0, pulseCount);

  // 霍尔传感器中断
  pinMode(HALL_PIN, INPUT_PULLUP);
  attachInterrupt(HALL_PIN, onPulse, FALLING);

  // WiFi AP
  WiFi.softAP("EBIKE_ESP32", "12345678");
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());

  // HTTP 路由
  server.on("/", handleRoot);
  server.on("/data", HTTP_GET, handleData);
  server.on("/setodo", HTTP_POST, handleSetOdo);
  server.on("/info", HTTP_GET, handleInfo);
  // CORS 预检
  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
      server.send(204);
    } else {
      server.send(404, "text/plain", "Not Found");
    }
  });

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();

  // 主循环同步脉冲计数到里程（避免在ISR中做浮点运算）
  static unsigned long lastPulseCount = 0;
  noInterrupts();
  unsigned long currentPulses = pulseCount;
  interrupts();
  if (currentPulses != lastPulseCount) {
    totalOdo += (currentPulses - lastPulseCount) * WHEEL_CIRCUMFERENCE;
    lastPulseCount = currentPulses;
  }

  // 速度衰减（3秒无脉冲归零）
  if (millis() - lastPulseTime > 3000) {
    currentSpeed = 0;
  }

  // 每秒保存到闪存（防断电丢失）
  static unsigned long lastSave = 0;
  if (millis() - lastSave > 1000) {
    lastSave = millis();
    prefs.putFloat("totalOdo", totalOdo);
    prefs.putULong("pulseCount", pulseCount);
  }
}
