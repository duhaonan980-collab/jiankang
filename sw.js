/* ============================================
   热量营养检测 - Service Worker
   版本: v3.13.60
   功能: 离线缓存、App Shell、照片缓存
   ============================================ */

const CACHE_VERSION = 'v148';
const APP_SHELL = 'calorie-app-shell-' + CACHE_VERSION;
const PHOTO_CACHE = 'calorie-photos-' + CACHE_VERSION;

// App Shell 资源列表（核心文件，首次安装时预缓存）
// v3.13.57：补上 ing-alias.js / weight-tips.js ——
// 之前漏了这两个，离线时它们加载失败（菜谱算不出营养、getFoodWeightTip 报错）。
// SW 改成缓存优先后，缓存里必须凑齐首屏全部文件，否则离线打开直接坏。
const APP_SHELL_FILES = [
  './',
  './index.html',
  './sw.js',
  './favicon.png',
  './apple-touch-icon.png',
  './foods.js',
  './recipes.js',
  './ing-alias.js',
  './weight-tips.js'
];

/* v3.13.60 A1：后台整组回源的状态。
   cacheFirstAppShell 让首屏秒开，但永不回源 = 把旧代码焊死。
   现在页面导航时后台把整组拉齐、全部成功才一次性写入，离线/失败一个都不写。 */
let SHELL_REFRESHING = false;
let LAST_SHELL_REFRESH = 0;
const SHELL_REFRESH_COOLDOWN = 30 * 60 * 1000;  // 30 分钟，避免每次打开都拉 700KB

// ==================== INSTALL ====================
let IS_UPDATE = false; // 是否为"更新安装"（页面已有旧版本在运行）
self.addEventListener('install', (event) => {
  IS_UPDATE = !!self.registration.active;
  console.log('[SW] 安装中... v' + CACHE_VERSION);
  event.waitUntil(
    caches.open(APP_SHELL).then((cache) => {
      console.log('[SW] 预缓存 App Shell');
      return cache.addAll(APP_SHELL_FILES).catch((err) => {
        console.warn('[SW] 部分资源预缓存失败:', err);
      });
    }).then(() => {
      // 立即激活，不等待旧 SW
      return self.skipWaiting();
    })
  );
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活 v' + CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 清除所有旧版本缓存（包括 shell 和 photos）
          if (cacheName.startsWith('calorie-app-shell-') || cacheName.startsWith('calorie-photos-')) {
            if (cacheName !== APP_SHELL && cacheName !== PHOTO_CACHE) {
              console.log('[SW] 清除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          }
        })
      );
    }).then(() => {
      // 接管所有页面，并强制刷新（让客户端拉新 HTML）
      return self.clients.claim().then(() => {
        return self.clients.matchAll().then((clients) => {
          // 只有"旧版本被替换"时才通知客户端刷新；首次安装不打扰
          if (!IS_UPDATE) return;
          clients.forEach((client) => {
            if (client.navigate) {
              client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
            }
          });
        });
      });
    })
  );
});

// ==================== FETCH ====================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const { pathname } = url;

  // 跳过非 GET 请求
  if (event.request.method !== 'GET') return;

  // 处理应用核心文件请求（Cache First：命中缓存立刻返回，零网络等待）
  //
  // v3.13.57：原来是 Network First（联网优先拿新代码），代价是**每次打开都要等网络**
  // ——首屏 599KB 全部走网络往返，手机上就是"打开慢一点"。
  // 改成缓存优先：打开直接读本地缓存（秒开），
  // 版本更新交给页面侧的「联网探测 + 版本检查」在后台做（见 index.html 的 autoCheckUpdate）。
  if (
    pathname.endsWith('.html') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname === '/' ||
    pathname.endsWith('/')
  ) {
    /* v3.13.60 A1：只在页面导航时触发一次后台整组回源，不阻塞首屏。
       shouldRefreshShell 做 30 分钟节流；离线或整组拉不齐时静默跳过。 */
    if ((event.request.mode === 'navigate' || pathname.endsWith('index.html')) && shouldRefreshShell()) {
      event.waitUntil(refreshAppShell());
    }
    event.respondWith(cacheFirstAppShell(event.request));
    return;
  }

  // 处理照片/图片请求（Cache First）
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // 其他请求：网络优先，失败时使用缓存
  event.respondWith(networkFirst(event.request));
});

// ==================== CACHE STRATEGIES ====================

/**
 * Cache First：优先使用缓存，无缓存时才请求网络
 * 适用于：照片、图片等不常变的资源
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PHOTO_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // 离线时，返回缓存中的任何图片作为降级
    return caches.match(request);
  }
}

/**
 * Cache First（App Shell）：命中缓存立刻返回，不等网络
 * 适用于：index.html / foods.js / recipes.js 等首屏核心文件
 *
 * v3.13.57：新增。原来这些文件走 Network First，每次打开都要等网络往返 → 打开慢。
 * 现在打开直接读缓存（秒开）；没有缓存（首次安装）才走网络并写入缓存。
 * 版本更新由页面侧后台检查后调 forceUpdate 完成。
 */
async function cacheFirstAppShell(request) {
  /* v3.13.59：版本探针（sw.js?ping= / ?ts=）永远走网络，不读缓存也不写缓存。
     以前每次版本检查都 cache.put 一条带时间戳的新 key，缓存会无限膨胀；
     更糟的是探针若命中旧缓存，版本比对就永远相等 → 检测不到新版本。 */
  const url = new URL(request.url);
  if (url.searchParams.has('ping') || url.searchParams.has('ts')) {
    try { return await fetch(request); }
    catch (e) { return caches.match('./sw.js'); }
  }
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cacheCopy = response.clone();
      caches.open(APP_SHELL).then((cache) => {
        cache.put(request, cacheCopy);
      });
    }
    return response;
  } catch (err) {
    // 离线且没缓存 → 页面请求回退到已缓存的 index.html
    if (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }
    throw err;
  }
}

/**
 * Network First：优先网络，失败时使用缓存
 * 适用于：可能更新的内容
 *
 * v3.13.44：加了超时兜底 —— 网络慢的时候不等它，直接给缓存，
 * 保证 App 打开不会干等（网络优先 + 超时回退 = 又新又不卡）。
 */
async function networkFirst(request) {
  // 超时兜底：3 秒内网络没响应就用缓存，不让用户干等
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve('__TIMEOUT__'), 3000);
  });
  try {
    const netPromise = fetch(request).then((response) => {
      if (response && response.ok) {
        const cacheCopy = response.clone();
        caches.open(APP_SHELL).then((cache) => {
          cache.put(request, cacheCopy);
        });
      }
      return response;
    });
    const result = await Promise.race([netPromise, timeout]);
    if (result !== '__TIMEOUT__') return result;
    // 超时了：后台继续跑网络请求（更新缓存），当前先用缓存响应
    netPromise.catch(() => {});
    const cached = await caches.match(request);
    if (cached) return cached;
    return await netPromise;
  } catch (err) {
    // 离线时，从缓存获取
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // 如果是页面请求，返回离线降级
    if (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
      return caches.match('./index.html');
    }
    throw err;
  }
}

/**
 * Stale While Revalidate：先返回缓存，同时后台更新
 * 适用于：应用核心文件
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cacheCopy = response.clone();
      caches.open(APP_SHELL).then((cache) => {
        cache.put(request, cacheCopy);
      });
    }
    return response;
  }).catch(() => {
    // 网络失败时忽略
  });

  // 立即返回缓存（如果有），同时后台更新
  return cached || fetchPromise;
}

/* ===== v3.13.60 A1 后台整组回源（原子切换）=====
   为什么不用上面那个 staleWhileRevalidate：它是「按请求逐个」后台更新，
   任一文件失败就会出现「新 index.html + 旧 foods.js」的混搭，比全是旧版更糟。
   这里改成整组预取 → 全部成功后才按序写入，且 index.html 最后写。 */
function shouldRefreshShell() {
  if (SHELL_REFRESHING) return false;
  return (Date.now() - LAST_SHELL_REFRESH) > SHELL_REFRESH_COOLDOWN;
}
async function refreshAppShell() {
  if (SHELL_REFRESHING) return;
  SHELL_REFRESHING = true;
  LAST_SHELL_REFRESH = Date.now();
  try {
    const items = [];
    for (const file of APP_SHELL_FILES) {
      /* SW 内部发起的 fetch 不会再被自己的 fetch 事件拦截 */
      const res = await fetch(new Request(file, { cache: 'no-store' }));
      if (!res || !res.ok) throw new Error('prefetch failed: ' + file);
      items.push({ key: file, body: res.clone() });
    }
    const isHtml = (k) => (k === './' || k.endsWith('index.html'));
    const ordered = items.filter(x => !isHtml(x.key)).concat(items.filter(x => isHtml(x.key)));
    const cache = await caches.open(APP_SHELL);
    for (const item of ordered) {
      await cache.put(new Request(item.key), item.body.clone());
    }
    console.log('[SW] App Shell 整组后台刷新完成 v' + CACHE_VERSION);
  } catch (e) {
    /* 任一失败 / 离线 → 一个都不写，缓存保持旧版完整；5 分钟后再试 */
    LAST_SHELL_REFRESH = Date.now() - SHELL_REFRESH_COOLDOWN + 5 * 60 * 1000;
    console.warn('[SW] 后台刷新跳过（离线或整组未拉齐）:', e && e.message);
  } finally {
    SHELL_REFRESHING = false;
  }
}

// ==================== MESSAGE HANDLING ====================
// 接收来自主页面的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // 清除照片缓存指令
  if (event.data && event.data.type === 'CLEAR_PHOTO_CACHE') {
    event.waitUntil(
      caches.delete(PHOTO_CACHE).then(() => {
        // 通知所有客户端缓存已清除
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'PHOTO_CACHE_CLEARED' });
          });
        });
      })
    );
  }
});

// ==================== PUSH NOTIFICATION ====================
// 可选：每日提醒推送
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '记得记录今日食物哦！',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🥗</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🥗</text></svg>',
    vibrate: [200, 100, 200],
    tag: 'calorie-reminder'
  };

  event.waitUntil(
    self.registration.showNotification('热量营养检测', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // 如果已有打开的应用窗口，聚焦它
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});

console.log('[SW] Service Worker 已加载 - v' + CACHE_VERSION);
