// The deploy workflow replaces __BUILD__ with the commit id, so every push is a new version
const VERSION="luma-mrt-__BUILD__";
const SHELL=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
// A new version waits until the user taps Refresh in the app (see "skipWaiting" message below)
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"})))));});
self.addEventListener("message",e=>{if(e.data==="skipWaiting") self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Network first, saving a copy for offline use
function networkFirst(req,key){
  return fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(key||req,c));}return r;})
    .catch(()=>caches.match(key||req).then(hit=>hit||Response.error()));
}
self.addEventListener("fetch",e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=="GET") return;
  // Pages and the event list: always try for the latest
  // Skip the browser's HTTP cache (GitHub Pages allows 10 minutes) so a new version shows straight away
  if(req.mode==="navigate"){e.respondWith(networkFirst(new Request(req.url,{cache:"no-cache",credentials:"same-origin"}),"index.html"));return;}
  if(url.origin===location.origin&&url.pathname.endsWith("/events.json")){e.respondWith(networkFirst(req,"events.json"));return;}
  // App files and Google Fonts: serve from cache, refresh in the background
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(VERSION).then(async c=>{const hit=await c.match(req);
      const net=fetch(req).then(r=>{if(r.ok||r.type==="opaque") c.put(req,r.clone());return r;}).catch(()=>hit);
      return hit||net;}));
  }
});
