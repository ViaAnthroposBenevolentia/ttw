/// <reference lib="webworker" />
import { immutable, assets, prerendered } from '$app/manifest';
import { version } from '$app/env';

declare const self: ServiceWorkerGlobalScope;
const worker = self;
const cacheName = `ttw-${version}`;
const paths = new Set(
	[...immutable, ...assets, ...prerendered].map(
		({ path }) => new URL(path || '.', worker.registration.scope).pathname
	)
);

worker.addEventListener('install', (event) => {
	event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll([...paths])));
	// A new version waits until existing tabs close, preserving their matching assets.
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys();
			await Promise.all(
				names
					.filter((name) => name.startsWith('ttw-') && name !== cacheName)
					.map((name) => caches.delete(name))
			);
			await worker.clients.claim();
		})()
	);
});

worker.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	if (event.request.method !== 'GET' || url.origin !== worker.location.origin) return;
	const path = url.pathname;
	if (!paths.has(path)) return;
	event.respondWith(
		(async () => {
			const cache = await caches.open(cacheName);
			const cached = await cache.match(path);
			if (cached) return cached;
			const response = await fetch(event.request);
			if (response.ok) await cache.put(path, response.clone());
			return response;
		})()
	);
});
