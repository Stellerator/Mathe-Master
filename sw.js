/* Mathe-Master · Service Worker: macht die App offline nutzbar.
   Strategie: Netz zuerst (damit Updates sofort ankommen), bei Funkloch oder Zeitüberschreitung die gespeicherte Kopie.
   Bei neuen Versionen CACHE hochzählen (nicht zwingend, die Dateien werden ohnehin erneuert). */
const CACHE = "mathe-master-v5";
const CORE = ["./", "index.html", "app.css", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-192.png", "icon-512.png", "js/core.js", "js/terms.js", "js/tasks.js", "js/fx.js", "js/proof.js", "js/ui.js", "js/nachweis.js", "kapitel/liste.js", "kapitel/mathegym.js", "vendor/katex/katex.min.css", "vendor/katex/katex.min.js", "vendor/katex/fonts/KaTeX_AMS-Regular.woff2", "vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2", "vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2", "vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2", "vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2", "vendor/katex/fonts/KaTeX_Main-Bold.woff2", "vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2", "vendor/katex/fonts/KaTeX_Main-Italic.woff2", "vendor/katex/fonts/KaTeX_Main-Regular.woff2", "vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2", "vendor/katex/fonts/KaTeX_Math-Italic.woff2", "vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2", "vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2", "vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2", "vendor/katex/fonts/KaTeX_Script-Regular.woff2", "vendor/katex/fonts/KaTeX_Size1-Regular.woff2", "vendor/katex/fonts/KaTeX_Size2-Regular.woff2", "vendor/katex/fonts/KaTeX_Size3-Regular.woff2", "vendor/katex/fonts/KaTeX_Size4-Regular.woff2", "vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2"];
const key = u => { const x = new URL(u, self.location.href); return x.origin + x.pathname; };

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(p =>
    fetch(new Request(p, {cache: "reload"})).then(r => { if (r.ok) return c.put(key(p), r); }).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const k = key(r.url);
    const fromNet = fetch(r).then(res => { if (res && res.ok) cache.put(k, res.clone()); return res; });
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000));
    try { return await Promise.race([fromNet, timeout]); }
    catch (err) {
      const hit = await cache.match(k) || (r.mode === "navigate" ? await cache.match(key("index.html")) : null);
      if (hit) return hit;
      return fromNet.catch(() => new Response("", {status: 504}));
    }
  })());
});
