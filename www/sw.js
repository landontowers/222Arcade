const CACHE_NAME = 'minigames-v1';
const ASSETS = [
    './',
    './index.html',
    './css/main.css',
    './css/retro.css',
    './js/main.js',
    './js/audio.js',
    './js/games/bang.js',
    './js/games/rowing.js',
    './js/games/math.js',
    './js/games/color.js',
    './assets/images/referee.png',
    './assets/images/boat_blue.png',
    './assets/images/boat_red.png',
    './assets/images/water.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

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
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
