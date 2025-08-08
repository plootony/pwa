// Service Worker for NewsPortal PWA
const CACHE_NAME = 'newsportal-v1.0.0';
const STATIC_CACHE = 'newsportal-static-v1.0.0';
const DYNAMIC_CACHE = 'newsportal-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    './',
    './index.html',
    './src/main.js',
    './src/style.css',
    './manifest.json',
    './public/icon-192x192.png',
    './public/icon-512x512.png',
    // Add fonts
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
    'https://jsonplaceholder.typicode.com/posts',
    'https://jsonplaceholder.typicode.com/users'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle different types of requests
    if (request.method === 'GET') {
        // Handle API requests
        if (url.origin === 'https://jsonplaceholder.typicode.com') {
            event.respondWith(handleApiRequest(request));
        }
        // Handle static files
        else if (STATIC_FILES.some(file => request.url.includes(file.replace('./', '')))) {
            event.respondWith(handleStaticRequest(request));
        }
        // Handle navigation requests
        else if (request.mode === 'navigate') {
            event.respondWith(handleNavigationRequest(request));
        }
        // Handle other requests
        else {
            event.respondWith(handleDynamicRequest(request));
        }
    }
});

// Handle API requests with cache-first strategy for offline support
async function handleApiRequest(request) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        // Try to fetch from network first
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                // Cache the response for offline use
                cache.put(request, networkResponse.clone());
                return networkResponse;
            }
        } catch (networkError) {
            console.log('Service Worker: Network failed, serving from cache');
        }
        
        // Serve from cache if available
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback
        return new Response(
            JSON.stringify({ 
                error: 'Offline', 
                message: 'Нет подключения к интернету' 
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Service Worker: API request error', error);
        return new Response(
            JSON.stringify({ 
                error: 'Error', 
                message: 'Произошла ошибка' 
            }),
            {
                status: 500,
                statusText: 'Internal Server Error',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static files with cache-first strategy
async function handleStaticRequest(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network and cache
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Static request error', error);
        // Fallback to cache
        const cache = await caches.open(STATIC_CACHE);
        return cache.match(request) || new Response('File not found', { status: 404 });
    }
}

// Handle navigation requests - always serve index.html for SPA
async function handleNavigationRequest(request) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        // Serve cached index.html for offline navigation
        const cache = await caches.open(STATIC_CACHE);
        const cachedIndex = await cache.match('./index.html');
        
        if (cachedIndex) {
            return cachedIndex;
        }
        
        return new Response(
            '<h1>Приложение недоступно</h1><p>Нет подключения к интернету</p>',
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

// Handle other dynamic requests
async function handleDynamicRequest(request) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        
        // Try network first
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
                return networkResponse;
            }
        } catch (networkError) {
            console.log('Service Worker: Network failed for dynamic request');
        }
        
        // Fallback to cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Content not available offline', { status: 503 });
    } catch (error) {
        console.error('Service Worker: Dynamic request error', error);
        return new Response('Request failed', { status: 500 });
    }
}

// Handle background sync for future enhancements
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Implement background sync logic here
        // For example, sync cached user actions when back online
        console.log('Service Worker: Performing background sync');
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
    }
}

// Handle push notifications (for future enhancements)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: './public/icon-192x192.png',
            badge: './public/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: data.url,
            actions: [
                {
                    action: 'explore',
                    title: 'Открыть',
                    icon: './public/icon-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Закрыть'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow(event.notification.data || './')
        );
    }
});

// Handle message events from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then(cache => cache.addAll(event.data.urls))
        );
    }
});

console.log('Service Worker: Loaded successfully');