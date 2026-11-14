// Bondline service worker: keeps the app working offline.
// Change VERSION whenever you upload new files so phones and laptops pick up the update.
// Fonts, icons and the libraries in /vendor/ live in a separate cache (STATIC) that survives updates,
// so an update only re-downloads the app itself. Bump STATIC only if you replace one of those files.
const VERSION='bondline-v29-1';
const STATIC='bondline-static-1';
const CORE=["./", "./index.html", "./app.js", "./boot.js", "./landing.js", "./manifest.webmanifest", "./firebase-config.js", "./pro-config.js", "./guide-data.js", "./bondle-core.js", "./bondle-data.js", "./bondle-science.js", "./bondle/", "./bondle/bondle.js", "./bondle/bondle.css", "./extras.css", "./assets/track.js"];
// Needed offline from the start: sign-in/sync, 3D models, and the fonts the notebook uses.
const STATIC_ASSETS=["./vendor/firebase-app-compat.js", "./vendor/firebase-auth-compat.js", "./vendor/firebase-firestore-compat.js", "./vendor/three.min.js", "./icons/icon-32.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png", "./fonts/bricolage-grotesque-latin-400-normal.woff2", "./fonts/bricolage-grotesque-latin-600-normal.woff2", "./fonts/bricolage-grotesque-latin-700-normal.woff2", "./fonts/source-serif-4-latin-400-normal.woff2", "./fonts/source-serif-4-greek-400-normal.woff2", "./fonts/source-serif-4-latin-600-normal.woff2", "./fonts/source-serif-4-greek-600-normal.woff2", "./fonts/source-serif-4-latin-400-italic.woff2", "./fonts/source-serif-4-greek-400-italic.woff2", "./fonts/caveat-latin-400-normal.woff2", "./fonts/jetbrains-mono-latin-400-normal.woff2", "./fonts/caveat-latin-600-normal.woff2", "./fonts/jetbrains-mono-latin-600-normal.woff2", "./fonts/nunito-latin-400-normal.woff2", "./fonts/nunito-latin-700-normal.woff2", "./fonts/nunito-latin-400-italic.woff2"];
// The maths, PDF and PowerPoint libraries (about 3 MB) are saved the first time they're used.
const isStatic=p=>/^\/(vendor|fonts|icons)\//.test(p);
self.addEventListener('install',e=>{e.waitUntil(Promise.all([
  caches.open(VERSION).then(c=>c.addAll(CORE)),
  caches.open(STATIC).then(c=>Promise.all(STATIC_ASSETS.map(u=>c.match(u).then(hit=>hit||c.add(u)))))
]).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION&&k!==STATIC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  const path=url.pathname;
  if(req.mode==='navigate'||/\/(firebase-config|app|guide-data|boot|landing|pro-config|bondle-core|bondle-data|bondle-science|bondle\/bondle)\.js$|\/bondle\/bondle\.css$|\/extras\.css$/.test(path)){
    // Pages and app code: try the network first so updates arrive, fall back to the saved copy offline.
    // Only the app page itself is stored as index.html; other pages (such as /privacy/) keep their own copy.
    const key=req.mode==='navigate'&&(path==='/'||path.endsWith('/index.html')&&path.split('/').length===2)?'./index.html':req;
    e.respondWith(fetch(req).then(r=>{if(r.ok&&r.type==='basic'){const c=r.clone();caches.open(VERSION).then(x=>x.put(key,c))}return r}).catch(()=>caches.match(key).then(r=>r||caches.match('./index.html'))));
    return;
  }
  const store=isStatic(path)?STATIC:VERSION;
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok&&r.type==='basic'){const c=r.clone();caches.open(store).then(x=>x.put(req,c))}return r})));
});
