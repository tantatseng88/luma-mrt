// Bump VERSION whenever index.html changes so phones pick up the new copy
const VERSION="luma-mrt-v1";
const SHELL=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=="GET") return;
  // Pages: try the network first so updates show, fall back to the cached copy offline
  if(req.mode==="navigate"){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put("index.html",c));return r;}).catch(()=>caches.match("index.html")));return;}
  // App files and Google Fonts: serve from cache, refresh in the background
  if(url.origin===location.origin||/fonts.(googleapis|gstatic).com$/.test(url.hostname)){
    e.respondWith(caches.open(VERSION).then(async c=>{const hit=await c.match(req);
      const net=fetch(req).then(r=>{if(r.ok||r.type==="opaque") c.put(req,r.clone());return r;}).catch(()=>hit);
      return hit||net;}));
  }
});
