const staticCache = "site-cache-v1";
const dynamicCache = "site-dynamic-cache-v1";
const resourceToPrecache = ["/"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(staticCache).then((cache) => {
			return cache.addAll(resourceToPrecache);
		})
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList
					.filter((key) => key !== staticCache && key !== dynamicCache)
					.map((key) => caches.delete(key))
			);
		})
	);
});

self.addEventListener("fetch", (event) => {
	// console.log("Fetch intercepted for:", event.request.url);
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			return (
				cachedResponse ||
				fetch(event.request)
					.then((fetchRes) => {
						return caches.open(dynamicCache).then((cache) => {
							// if (caches.match(`${event.request.url}`)) {
							// 	cache.delete(`${event.request.url}`);
							// 	cache.put(event.request.url, fetchRes.clone());
							// 	return fetchRes;
							// } else {
							// cache.add(`${event.request.url}`);
							return fetchRes;
							// }
						});
					})
					.catch(() => caches.match("./imgs/animation.gif"))
			);
		})
	);
});
