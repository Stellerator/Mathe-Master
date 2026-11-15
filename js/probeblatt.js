/* Mathe-Master · Probearbeit als Blatt
   Ein Aufgabenblatt über den ganzen Stoff bis zur Klassenarbeit (45 Minuten), im Heft zu bearbeiten. Aus jedem „Platz“ (Kapitel/Thema)
   kommt eine Aufgabe aus einem kleinen Pool aufs Blatt (Daten: kapitel/probeblaetter.js). Die Version wechselt mit jeder Probearbeit,
   innerhalb eines Platzes kommt erst jede Aufgabe einmal dran. Die Musterlösung wird mit einem Klick aufgedeckt.
   Danach kann man sich je Aufgabe selbst einschätzen; das Ergebnis geht in P.x.arb (wie bisher bei der Probearbeit). */
(function(){
"use strict";
const MM = window.MM, el = MM.el, T = MM.T;
const U = () => MM.UI;
const app = () => document.getElementById("app");
const cfg = () => MM.PROBEARBEIT || { min: 45, slots: [] };
const has = () => cfg().slots.length > 0;
const letters = "abcdefgh";

/* ---------- Welche Kapitel kommen aufs Blatt? ---------- */
/* Nächster Klassenarbeits-Termin (termine.js); ohne Termin oder ohne Kapitelliste: alle freigeschalteten Kapitel. */
function terminKapitel(){ const today = MM.todayIso();
  const next = (MM.TERMINE || []).filter(t => t.datum >= today).sort((a, b) => a.datum.localeCompare(b.datum))[0];
  return next && next.kapitel && next.kapitel.length ? next.kapitel : null; }
function kapitel(){
  const ok = U().okIds(), inSlots = new Set(cfg().slots.map(s => s.kapitel));
  return (terminKapitel() || ok).filter(k => ok.includes(k) && inSlots.has(k)); }
/* Kapitel der Klassenarbeit, die für die Schüler noch nicht sichtbar sind: Die Probearbeit wächst mit, sobald sie freigeschaltet werden. */
function noch(){
  const ok = U().okIds(), inSlots = new Set(cfg().slots.map(s => s.kapitel)), tk = terminKapitel(); return tk ? tk.filter(k => !ok.includes(k) && inSlots.has(k)) : []; }
function nochText(){
  const L = noch().map(id => { const e = (MM.LISTE || []).find(x => x.id === id); return e ? e.nr : id; }); if (!L.length) return "";
  return L.length === 1 ? `Kapitel ${L[0]} kommt noch dazu.` : `Die Kapitel ${L.slice(0, -1).join(", ")} und ${L[L.length - 1]} kommen noch dazu.`; }

/* ---------- Auswahl: eine Aufgabe je Platz, Version n ---------- */
function hash(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function permutation(n, seed){ const r = rng(seed), a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/* Platz-Index: In jedem Durchgang (Länge = Poolgröße) kommt jede Aufgabe genau einmal vor, die Reihenfolge wechselt je Durchgang. */
function pick(slot, n, who){ const len = slot.pool.length, cyc = Math.floor(n / len), pos = n % len; return permutation(len, hash(who + "|" + slot.id + "|" + cyc))[pos]; }
function build(kids, n, who){ return cfg().slots.filter(s => kids.includes(s.kapitel)).map(s => ({ slot: s, idx: pick(s, n, who), task: s.pool[pick(s, n, who)] })); }

/* ---------- Koordinatensystem für die Musterlösung (SVG) ---------- */
const NS = "http://www.w3.org/2000/svg";
const nf = v => String(+v.toFixed(2)).replace(".", ",");
function graphSvg(g){
  const W = 380, mL = 46, mR = 16, mT = 14, mB = 40;
  const [x0, x1] = g.x, [y0, y1] = g.y, [sx, sy] = g.schritt || [1, 1];
  const pw = W - mL - mR, ph = Math.max(150, Math.min(300, pw * (y1 - y0) / (x1 - x0))), H = ph + mT + mB;
  const X = v => mL + (v - x0) / (x1 - x0) * pw, Y = v => mT + ph - (v - y0) / (y1 - y0) * ph;
  let s = `<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" class="gsvg" role="img" aria-label="Musterzeichnung">`;
  for (let v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) s += `<line x1="${X(v)}" y1="${mT}" x2="${X(v)}" y2="${mT + ph}" stroke="var(--grid)" stroke-width="1"/><text x="${X(v)}" y="${mT + ph + 15}" text-anchor="middle" font-size="10" fill="var(--muted)">${nf(v)}</text>`;
  for (let v = Math.ceil(y0 / sy) * sy; v <= y1 + 1e-9; v += sy) s += `<line x1="${mL}" y1="${Y(v)}" x2="${mL + pw}" y2="${Y(v)}" stroke="var(--grid)" stroke-width="1"/><text x="${mL - 6}" y="${Y(v) + 3}" text-anchor="end" font-size="10" fill="var(--muted)">${nf(v)}</text>`;
  const ax = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="var(--ink)" stroke-width="1.6"/>`;
  s += ax(mL, mT + ph, mL + pw, mT + ph) + ax(mL, mT, mL, mT + ph);
  if (y0 < 0 && y1 > 0) s += ax(mL, Y(0), mL + pw, Y(0));
  if (x0 < 0 && x1 > 0) s += ax(X(0), mT, X(0), mT + ph);
  s += `<text x="${mL + pw}" y="${mT + ph + 32}" text-anchor="end" font-size="11" fill="var(--ink)">${g.xl || "x"}</text><text x="${mL - 36}" y="${mT + 6}" font-size="11" fill="var(--ink)">${g.yl || "y"}</text>`;
  const cols = ["var(--wave,#1d5bbd)", "var(--mark,#d97f00)"];
  (g.linien || []).forEach((l, i) => { const a = l.von !== undefined ? l.von : x0, b = l.bis !== undefined ? l.bis : x1, c = cols[i % 2];
    s += `<line x1="${X(a)}" y1="${Y(l.m * a + l.b)}" x2="${X(b)}" y2="${Y(l.m * b + l.b)}" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`;
    const lab = l.name.replace(/^K_(\w)$/, "K$1"), lx = b - (b - a) * 0.12; s += `<text x="${X(lx)}" y="${Y(l.m * lx + l.b) - 7}" font-size="12" font-weight="700" fill="${c}">${lab}</text>`; });
  (g.punkte || []).forEach(p => { s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4" fill="var(--ink)"/>`; if (p.name) s += `<text x="${X(p.x) + 7}" y="${Y(p.y) - 7}" font-size="12" font-weight="700" fill="var(--ink)">${p.name}(${nf(p.x)}|${nf(p.y)})</text>`; });
  return s + `</svg>`; }

const tabHtml = tb => `<div class="tabwrap"><table class="wtab"><tbody><tr>${tb.kopf.map((c, i) => i ? `<td>${T(c)}</td>` : `<th>${T(c)}</th>`).join("")}</tr>` +
  tb.zeilen.map(r => `<tr>${r.map((c, i) => i ? `<td>${T(c)}</td>` : `<th>${T(c)}</th>`).join("")}</tr>`).join("") + `</tbody></table></div>`;
const kNamen = kids => { const nr = kids.map(k => { const kk = U().getK(k); return kk ? kk.nr : k; }); return nr.length > 1 ? nr.slice(0, -1).join(", ") + " und " + nr[nr.length - 1] : String(nr[0] || ""); };
const nProbe = () => { const P = U().P; return ((P.x && P.x.arb) || []).filter(a => a.t === "probe").length; };
const who = () => (MM.Nachweis && MM.Nachweis.ident && MM.Nachweis.ident.id) || "gast";

/* ---------- Blatt anzeigen ---------- */
function show(o){
  o = o || {}; const kids = o.kids || kapitel(); if (!kids.length) return;
  const n = o.n !== undefined ? o.n : nProbe(), items = build(kids, n, who()), u = U(), c = cfg(); u.view(false);
  const back = () => (MM.Wiederholung ? MM.Wiederholung.renderRep() : u.renderHome());
  u.bar("← Wiederholen", back, "Mathe-Master", "Probearbeit", u.themeSwitch());
  const main = el("main", { class: "arbeit blatt" }); app().appendChild(main);
  const nAuf = items.length, nTeile = items.reduce((a, it) => a + it.task.teile.length, 0);
  const head = el("section", { class: "card" });
  head.innerHTML = `<span class="eyebrow">Probearbeit · Version ${n + 1}</span><h3>Alle Kapitel bis zur Klassenarbeit</h3>` +
    `<p>${nAuf} Aufgaben aus den Kapiteln ${kNamen(kids)}, Bearbeitungszeit <b>${c.min} Minuten</b>. Bearbeite sie im Heft und schreibe so, dass man deinen Weg nachvollziehen kann, wie in der Klassenarbeit. Erst danach deckst du die Musterlösung auf.</p>` + (nochText() ? `<p class="muted">${nochText()} Die Probearbeit wird dann länger.</p>` : "");
  const bar = el("div", { class: "row noprint" });
  const solBtn = el("button", { class: "btn big", "aria-pressed": "false" }, "Musterlösung anzeigen");
  const prt = el("button", { class: "btn ghost" }, "Drucken"); prt.addEventListener("click", () => window.print());
  const other = el("button", { class: "btn ghost" }, "Andere Version"); other.addEventListener("click", () => show({ kids, n: n + 1 }));
  bar.append(solBtn, prt, other); head.appendChild(bar); main.appendChild(head);

  const sols = [], rate = new Array(nAuf).fill(null), rateBoxes = [];
  items.forEach((it, ai) => {
    const a = it.task, card = el("section", { class: "card aufg" }), kk = u.getK(it.slot.kapitel);
    let h = `<h3><span class="anr">${ai + 1}</span> Aufgabe ${ai + 1}<span class="ktag">Kapitel ${kk ? kk.nr : it.slot.kapitel}</span></h3>`;
    if (a.intro) h += `<p>${T(a.intro)}</p>`;
    (a.tabellen || (a.tabelle ? [a.tabelle] : [])).forEach(tb => { h += tabHtml(tb); });
    h += `<ol class="teile">` + a.teile.map((t, ti) => `<li><div class="q"><span class="bu">${letters[ti]})</span><span>${T(t.q)}</span></div><div class="mlos" hidden><span class="mtag">Musterlösung</span><p>${T(t.l)}</p>${t.graph ? graphSvg(t.graph) : ""}</div></li>`).join("") + `</ol>`;
    card.innerHTML = h; main.appendChild(card); sols.push(...card.querySelectorAll(".mlos"));
    const rb = el("div", { class: "rate noprint", hidden: "" }); rb.appendChild(el("span", { class: "muted" }, "Wie ist es dir gelungen?"));
    [[1, "richtig"], [0.5, "teilweise"], [0, "nicht gelöst"]].forEach(([s, t]) => { const b = el("button", { class: "btn ghost sm", "aria-pressed": "false" }, t);
      b.addEventListener("click", () => { rate[ai] = s; rb.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); upd(); }); rb.appendChild(b); });
    card.appendChild(rb); rateBoxes.push(rb); });

  const fin = el("section", { class: "card noprint", hidden: "" });
  const saveBtn = el("button", { class: "btn big", disabled: "" }, "Ergebnis speichern");
  const msg = el("p", { class: "muted" }, "Schätze dich bei jeder Aufgabe ein, dann kannst du das Ergebnis speichern.");
  fin.append(msg, saveBtn); main.appendChild(fin);
  const upd = () => { saveBtn.disabled = !rate.every(r => r !== null); };
  saveBtn.addEventListener("click", () => {
    const P = u.P; P.x = P.x || {}; P.x.arb = P.x.arb || [];
    P.x.arb.push({ t: "probe", d: MM.todayIso(), h: rate.filter(r => r === 1).length, p: rate.filter(r => r === 0.5).length, n: nAuf, k: kids.slice() });
    if (P.x.arb.length > 40) P.x.arb.splice(0, P.x.arb.length - 40);
    u.save(); saveBtn.disabled = true; msg.textContent = "Gespeichert. Du findest es unter „Mein Stand“ auf der Seite Wiederholen."; });
  let shown = false;
  solBtn.addEventListener("click", () => { shown = !shown; sols.forEach(s => { s.hidden = !shown; }); rateBoxes.forEach(r => { r.hidden = !shown; }); fin.hidden = !shown;
    solBtn.textContent = shown ? "Musterlösung verbergen" : "Musterlösung anzeigen"; solBtn.setAttribute("aria-pressed", String(shown)); });
  main.dataset.teile = String(nTeile); window.scrollTo(0, 0); }

MM.Probeblatt = { has, kapitel, noch, nochText, build, show, graphSvg, kNamen };
})();
