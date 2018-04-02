const cacheResources = () => {
  return caches.open('v1')
  .then((cache) => {
    return cache.addAll([
      '/bundle.js'
    ])
  })
}

const serveCached = (request) => {
  return caches.match(request)
  .then((response) => {
    if (response !== undefined) return response
    if (response === undefined) return fetch(request)
  })
}

self.addEventListener('install', (e) => {
  console.log('install', e)
  e.waitUntil(cacheResources())
})

self.addEventListener('fetch', (e) => {
  console.log('fetch', e)
  e.respondWith(serveCached(e.request))
})
