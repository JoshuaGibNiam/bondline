// Bondline service worker: keeps the app working offline.
// Change VERSION whenever you upload new files so phones and laptops pick up the update.
const VERSION='bondline-v14';
const ASSETS=["./", "./index.html", "./app.js", "./boot.js", "./manifest.webmanifest", "./vendor/jspdf.umd.min.js", "./vendor/html2canvas.min.js", "./vendor/three.min.js", "./vendor/tex-svg-full.js", "./vendor/firebase-app-compat.js", "./vendor/firebase-auth-compat.js", "./vendor/firebase-firestore-compat.js", "./firebase-config.js", "./icons/icon-32.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png", "./fonts/bricolage-grotesque-latin-400-normal.woff2", "./fonts/bricolage-grotesque-latin-600-normal.woff2", "./fonts/bricolage-grotesque-latin-700-normal.woff2", "./fonts/source-serif-4-latin-400-normal.woff2", "./fonts/source-serif-4-greek-400-normal.woff2", "./fonts/source-serif-4-latin-600-normal.woff2", "./fonts/source-serif-4-greek-600-normal.woff2", "./fonts/source-serif-4-latin-400-italic.woff2", "./fonts/source-serif-4-greek-400-italic.woff2", "./fonts/caveat-latin-400-normal.woff2", "./fonts/jetbrains-mono-latin-400-normal.woff2", "./fonts/caveat-latin-600-normal.woff2", "./fonts/jetbrains-mono-latin-600-normal.woff2", "./fonts/nunito-latin-400-normal.woff2", "./fonts/nunito-latin-700-normal.woff2", "./fonts/nunito-latin-400-italic.woff2"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  if(req.mode==='navigate'||/\/(firebase-config|app|boot)\.js$/.test(new URL(req.url).pathname)){
    // Pages: try the network first so updates arrive, fall back to the saved copy offline.
    const key=req.mode==='navigate'?'./index.html':req;
    e.respondWith(fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(key,c))}return r}).catch(()=>caches.match(key)));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c))}return r})));
});
