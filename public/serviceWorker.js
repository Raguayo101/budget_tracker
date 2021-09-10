const STATIC_CACHE = 'my-site-cache-v1';
const RUNTIME_CACHE = 'data-cache-v1';

const NEED_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/public/icons/icon-192x192.png',
    '/public/icons/icon-512x512',
    '/public/style.css',
    '/manifest.webmanifest',
    '/db.js',

];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(STATIC_NAME)
            .then(cache => {
                console.log('open cache');
                return cache.addAll(NEED_TO_CACHE)
            })
    );
});

self.addEventListener('fetch', e => {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches
                .open(RUNTIME_CACHE)
                .then(cache => {
                    return fetch(e.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(e.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(error => {
                            return cache.match(e.request)
                        });
                }).catch(error => console.log(error))
        );
        return;
    }

    e.respondWith(
        fetch(e.request.catch(() => {
            return caches.match(e.request).then(res => {
                if (res) {
                    return res;
                } else if (e.resquest.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            })
        })
        ))
});