const CACHE_NAME = 'ebike-helper-v12';
const ASSETS = [
  './',
  './index.html'
];

// 1. 安装时：把网页塞进手机本地缓存
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. 激活时：清理掉以前的旧缓存（如果有的话）
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 拦截请求：核心逻辑（有网时走网络并偷偷更新缓存，没网时走本地缓存秒开）
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // 哪怕本地有缓存，只要有网络，就去服务器请求最新的看一眼
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => {
        // 报错说明彻底没网，静默失败，直接返回本地缓存即可
      });
      
      // 优先返回本地缓存（实现无网秒开），如果没有再返回网络请求
      return cachedResponse || fetchPromise;
    })
  );
});

// 监听从 index.html 发来的"跳过等待"强制更新指令
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});