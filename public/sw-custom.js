// Service Worker Customizado - Venlo PWA
const CACHE_VERSION = 'venlo-v2';
const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  dynamic: `${CACHE_VERSION}-dynamic`,
  images: `${CACHE_VERSION}-images`,
  api: `${CACHE_VERSION}-api`,
  pages: `${CACHE_VERSION}-pages`,
};

// Não limitar - cachear tudo
const CACHE_LIMITS = {
  static: 200,
  dynamic: 200,
  images: 500,
  api: 100,
  pages: 100,
};

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.json',
];

// Install - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Cache AGRESSIVO para funcionar 100% offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome extensions e outros protocolos
  if (!url.protocol.startsWith('http')) return;

  // Skip URLs externas (exceto Supabase)
  if (url.origin !== self.location.origin && !url.origin.includes('supabase.co')) {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
    // API requests - Cache first com network fallback (para funcionar offline)
    event.respondWith(cacheFirstWithNetworkUpdate(request, CACHE_NAMES.api));
  } else if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    // Images - Cache first sempre
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.images));
  } else if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.url.includes('/_next/static/') ||
    /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname)
  ) {
    // Static assets - Cache first sempre
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.static));
  } else if (request.mode === 'navigate' || request.destination === 'document') {
    // Pages/HTML - Cache first com network update
    event.respondWith(cacheFirstWithNetworkUpdate(request, CACHE_NAMES.pages));
  } else {
    // Tudo mais - Cache first
    event.respondWith(cacheFirstWithNetworkUpdate(request, CACHE_NAMES.dynamic));
  }
});

// Network First Strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback to offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Cache First Strategy - Sempre retorna do cache se existir
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Se falhar e não tiver cache, retorna erro
    throw error;
  }
}

// Cache First com Network Update em background
async function cacheFirstWithNetworkUpdate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  // Sempre tenta atualizar em background (se online)
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(cacheName);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null); // Ignora erros de rede

  // Se tem cache, retorna imediatamente
  if (cachedResponse) {
    return cachedResponse;
  }

  // Se não tem cache, aguarda a rede
  try {
    const response = await fetchPromise;
    if (response && response.ok) {
      return response;
    }
  } catch (error) {
    // Ignora erro
  }

  // Fallback para offline page se for navegação
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
  }

  // Retorna erro se não conseguiu nada
  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');
