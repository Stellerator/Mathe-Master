/* Mathe-Master · Hausaufgaben (Pflicht, getrennt vom Lernpfad)
   Definition: kapitel/hausaufgaben.js. Stand: P.x.ha[id]. Schaltet nichts frei und zählt nicht für Level oder Siegel.
   Zahlen je Person aus dem Aktivierungscode (Seed). Pflicht heißt bearbeitet: beste Runde zählt, Zeitstempel der Bearbeitung ist maßgeblich. */
(function(){
"use strict";
const MM = window.MM, el = MM.el, T = MM.T;
const U = () => MM.UI, app = () => document.getElementById("app");
const X = () => { const P = U().P; P.x = P.x || {}; return P.x; };
const HAS = () => (X().ha = X().ha || {});
const defs = () => (Array.isArray(MM.HAUSAUFGABEN) ? MM.HAUSAUFGABEN : []).filter(h => h && h.id && h.titel && h.frist && Array.isArray(h.teile) && h.teile.length);
const ident = () => (MM.Nachweis && MM.Nachweis.ident) || null;
const p2 = n => String(n).padStart(2, "0");
const nowIso = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const fmtD = iso => { const a = iso.slice(0, 10).split("-"); return +a[2] + "." + +a[1] + "."; };
const fmtDT = iso => fmtD(iso) + " " + iso.slice(11, 16) + " Uhr";
const visible = h => U().teacher || !h.start || h.start <= MM.todayIso();
const schwelle = (h, i) => { const t = h.teile[i]; return t.schwelle || Math.ceil((t.n || 5) * 0.6); };
const retry = g => { for (let q = 0; q < 300; q++){ const r = g(); if (r) return r; } return null; };

/* ---------- Stand ---------- */
function state(h){ const all = HAS(); const s = all[h.id] = all[h.id] || { a: {}, p: null, m: null, done: "" };
  s.f = h.frist; s.ti = h.titel; s.k = h.teile.length; return s; }
function partDone(h, s, i){ const t = h.teile[i];
  if (t.typ === "app") return !!(s.a[i] && s.a[i].b >= schwelle(h, i));
  if (t.typ === "papier") return !!(s.p && s.p.v);
  if (t.typ === "mathegym") return !!(s.m && s.m.ts);
  return false; }
function update(h){ const s = state(h); s.dn = h.teile.filter((_, i) => partDone(h, s, i)).length;
  if (s.dn === h.teile.length && !s.done) s.done = nowIso();
  U().save(); return s; }
/* "done" | "late" | "partial" | "open" */
function status(h){ const s = HAS()[h.id]; if (!s) return "open"; const n = h.teile.filter((_, i) => partDone(h, s, i)).length;
  if (n === h.teile.length && s.done) return s.done.slice(0, 10) <= h.frist ? "done" : "late";
  return n ? "partial" : "open"; }
const progress = h => { const s = HAS()[h.id]; return s ? h.teile.filter((_, i) => partDone(h, s, i)).length : 0; };

/* ---------- Aufgaben der App-Teile (Zahlen aus dem Code) ---------- */
function makeItems(part, seed){
  const D = MM.kapitel[part.kapitel], def = D && D.challenges[part.challenge], lv = def && def.levels[(part.level || 1) - 1]; if (!lv) return [];
  return MM.withSeed(seed, () => { let tasks;
    if (lv.gens) tasks = MM.shuffle(lv.gens.slice()).map(e => retry(typeof e === "function" ? e : e.g)).filter(Boolean);
    else tasks = lv.make();
    return tasks.slice(0, part.n || 5).map(t => ({ task: t })); }); }
const topicKey = (part) => { const k = U().getK(part.kapitel); return k ? U().chId(k, part.challenge) + ":" + ((part.level || 1) - 1) : null; };

/* ---------- Markierung der passenden Challenge-Kachel im Lernpfad ----------
   Von „sichtbar ab“ bis zum Fristtag: Kachel hervorgehoben mit „HA · Level 2“. Ist die Hausaufgabe erledigt, bleibt ein ruhiges „HA ✓“. */
function mark(kid, typ){
  const today = MM.todayIso(); const open = [], done = []; let frist = "";
  defs().forEach(h => { if ((h.start && h.start > today) || h.frist < today) return;
    h.teile.forEach(t => { if (t.typ === "app" && t.kapitel === kid && t.challenge === typ){ const st = status(h);
      if (st === "done" || st === "late") done.push(t.level || 1); else { open.push(t.level || 1); if (!frist || h.frist < frist) frist = h.frist; } } }); });
  if (!open.length && !done.length) return null;
  const uniq = a => [...new Set(a)].sort((x, y) => x - y);
  return { open: open.length > 0, levels: uniq(open.length ? open : done), frist }; }

/* ---------- Startseite: eigener Bereich ---------- */
function homeCard(){
  const list = defs().filter(visible); if (!list.length) return null;
  const st = h => status(h), doneN = list.filter(h => st(h) === "done" || st(h) === "late").length;
  const sec = el("section", { class: "ha-card" });
  sec.innerHTML = `<div class="ha-head"><h3>Hausaufgaben</h3><span class="muted">${doneN} von ${list.length} erledigt</span></div>`;
  const today = MM.todayIso();
  list.slice().sort((a, b) => a.frist.localeCompare(b.frist)).forEach(h => { const s = st(h), n = progress(h);
    const row = el("button", { class: "ha-row " + s, type: "button" });
    const chip = s === "done" ? "✓ erledigt" : s === "late" ? "✓ erledigt (nach der Frist)" : n ? `${n} von ${h.teile.length} Teilen` : "noch offen";
    row.innerHTML = `<span class="ha-t"><b>${T(h.titel)}</b><small>${(s === "done" || s === "late") ? "" : (h.frist < today ? "Frist war am " : "bis ") + fmtD(h.frist)}</small></span><span class="ha-chip">${chip}</span>`;
    row.addEventListener("click", () => renderHa(h.id)); sec.appendChild(row); });
  return sec; }

/* ---------- Seite einer Hausaufgabe ---------- */
function renderHa(id){
  const h = defs().find(x => x.id === id); const u = U(); u.view(false);
  u.bar("← Startseite", u.renderHome, "Hausaufgabe", h ? T(h.titel) : "Hausaufgabe", u.themeSwitch());
  const main = el("main", { class: "ha" }); app().appendChild(main);
  if (!h){ main.appendChild(el("p", { class: "muted" }, "Diese Hausaufgabe gibt es nicht mehr.")); return; }
  if (!ident()){ const c = el("section", { class: "card" }); c.innerHTML = `<h3>Zuerst den Nachweis aktivieren</h3><p>Damit du deine eigenen Zahlen bekommst und deine Hausaufgaben abgeben kannst, brauchst du den Aktivierungscode von deiner Lehrkraft (unter „Meine Erfolge“).</p>`;
    const b = el("button", { class: "btn" }, "Zu „Meine Erfolge“"); b.addEventListener("click", () => MM.Nachweis.renderRegal()); c.appendChild(b); main.appendChild(c); return; }
  const s = state(h), stt = status(h), n = progress(h);
  const head = el("section", { class: "card ha-status " + stt });
  head.innerHTML = stt === "done" ? `<h3>✓ Geschafft</h3><p>Bearbeitet am ${fmtDT(s.done)}. Frist war ${fmtD(h.frist)}</p>` : stt === "late" ? `<h3>✓ Geschafft</h3><p>Bearbeitet am ${fmtDT(s.done)}, nach der Frist (${fmtD(h.frist)}).</p>`
    : `<h3>${n ? `${n} von ${h.teile.length} Teilen geschafft` : "Los geht's"}</h3><p>Bis ${fmtD(h.frist)}. „Bearbeitet“ reicht, es muss nicht perfekt sein.</p>`;
  main.appendChild(head);
  h.teile.forEach((t, i) => main.appendChild(partCard(h, s, t, i)));
  const ab = el("section", { class: "card" }); ab.innerHTML = `<h3>Abgeben</h3><p class="muted">Mit „Stand senden“ gibst du alle Hausaufgaben der Woche in einer Datei ab. Maßgeblich ist, wann du bearbeitet hast, nicht wann du sendest.</p>`;
  const sb = el("button", { class: "btn" }, "Stand senden"); sb.addEventListener("click", () => MM.Nachweis.sendModal()); ab.appendChild(sb); main.appendChild(ab); }

function partCard(h, s, t, i){
  const done = partDone(h, s, i), c = el("section", { class: "card ha-part" + (done ? " done" : "") });
  const mark = done ? "✓ " : "";
  if (t.typ === "app"){
    const b = s.a[i], need = schwelle(h, i);
    c.innerHTML = `<h3>${mark}${T(t.titel)}</h3><p>${t.n || 5} Aufgaben, mindestens ${need} im ersten Versuch richtig. Mehrere Runden sind erlaubt, die beste zählt.${b ? `<br><b>Beste Runde: ${b.b} von ${b.n}</b>` : ""}</p>`;
    const go = el("button", { class: "btn" }, b ? "Neue Runde (neue Zahlen)" : "Aufgaben starten"); go.addEventListener("click", () => playRound(h, i)); c.appendChild(go); }
  else if (t.typ === "papier"){
    c.innerHTML = `<h3>${mark}${T(t.titel)}</h3><p>Bearbeite diese Aufgabe im Heft. Wie sicher fühlst du dich dabei?</p>`;
    const row = el("div", { class: "ampel" });
    [["s", "✓ sicher", "ok"], ["g", "~ geht so", "mid"], ["u", "? unsicher", "low"]].forEach(([v, lab, cl]) => { const b = el("button", { class: "btn ghost " + cl, "aria-pressed": String(!!(s.p && s.p.v === v)), type: "button" }, lab);
      b.addEventListener("click", () => { s.p = { v, ts: nowIso() }; update(h); renderHa(h.id); }); row.appendChild(b); });
    c.appendChild(row); }
  else if (t.typ === "mathegym"){
    c.innerHTML = `<h3>${mark}${T(t.titel)}</h3><p>Erledige den Auftrag im Mathegym und bestätige dann hier.</p>`;
    const row = el("div", { class: "row" });
    if (t.url){ const a = el("a", { class: "btn ghost", href: t.url, target: "_blank", rel: "noopener" }, "Mathegym öffnen ↗"); row.appendChild(a); }
    const b = el("button", { class: "btn", type: "button", "aria-pressed": String(!!(s.m && s.m.ts)) }, s.m && s.m.ts ? "✓ Erledigt" : "Habe ich erledigt");
    b.addEventListener("click", () => { if (s.m && s.m.ts) return; s.m = { ts: nowIso() }; update(h); renderHa(h.id); }); row.appendChild(b); c.appendChild(row); }
  return c; }

/* ---------- Runde mit den eigenen Zahlen ---------- */
function playRound(h, i){
  const u = U(), part = h.teile[i], s = state(h), id = ident(); if (!id) return renderHa(h.id);
  const att = ((s.a[i] && s.a[i].k) || 0) + 1, items = makeItems(part, `${id.id}|${h.id}|${i}|${att}`), N = items.length, key = topicKey(part), need = schwelle(h, i);
  if (!N){ renderHa(h.id); return; }
  u.view(true); const res = []; let q = 0;
  const track = el("div", { class: "track", "aria-label": "Fortschritt" });
  u.bar("← Hausaufgabe", () => renderHa(h.id), "Hausaufgabe · " + T(h.titel), T(part.titel), track);
  const split = el("div", { class: "split" }), viz = el("section", { class: "viz" }), panel = el("section", { class: "panel" }); split.append(viz, panel); app().appendChild(split);
  const draw = () => { track.innerHTML = [...Array(N)].map((_, k) => `<i class="${res[k] === true ? "ok" : res[k] === false ? "bad" : ""}${k === q && res[k] === undefined ? " cur" : ""}"></i>`).join("") + `<span>${res.filter(Boolean).length} richtig</span>`; };
  function run(){
    MM.cleanup(); viz.innerHTML = ""; panel.innerHTML = ""; panel.scrollTop = 0; draw();
    const eb = el("div", { class: "ptop" }, `<span class="eyebrow">Aufgabe ${q + 1} von ${N}</span>`), pr = el("p", { class: "prompt" }), hints = el("div", { class: "pbody" }), body = el("div", { class: "pbody" }), fb = el("div", {}), acts = el("div", { class: "actions" });
    panel.append(eb, pr, hints, body, fb, acts);
    const api = { viz, panel, body, actions: acts, prompt: t => { pr.innerHTML = t; }, hint: t => { hints.appendChild(el("p", { class: "hint" }, t)); }, badge: t => { eb.appendChild(el("span", { class: "pred" }, t)); },
      cv: (cls = "") => MM.mkcv(viz, cls), legend: html => { const l = el("div", { class: "legend" }, html); viz.appendChild(l); return l; },
      situation: (t, l) => { viz.appendChild(el("div", { class: "situ" }, `<span class="eyebrow">${l || "Situation"}</span><p>${t}</p>`)); },
      feedback: (ok, html, title) => u.feedbackInto(fb, ok, html, title),
      finish: ok => { if (res[q] !== undefined) return; res[q] = !!ok; if (key) u.logRes(key, !!ok); draw(); acts.innerHTML = "";
        const w = el("button", { class: "btn" }, q + 1 < N ? "Weiter →" : "Auswertung →"); w.addEventListener("click", () => { q++; q < N ? run() : ende(); }); acts.appendChild(w); } };
    try { items[q].task.run(api); } catch (e) { console.error(e); panel.appendChild(el("p", { class: "hint" }, "Diese Aufgabe konnte nicht geladen werden.")); api.finish(true); }
    u.fitLayout(split, viz, panel); }
  function ende(){
    MM.cleanup(); split.remove(); const hits = res.filter(Boolean).length, prev = s.a[i];
    s.a[i] = { b: Math.max(prev ? prev.b : 0, hits), n: N, s: need, k: att, ts: nowIso() }; update(h);
    const ok = hits >= need, card = el("div", { class: "endcard " + (ok ? "win" : "lose") });
    card.innerHTML = `<span class="eyebrow">Hausaufgabe</span><span class="big">${hits} / ${N}</span><span class="muted">richtig im ersten Versuch</span><h3>${ok ? "Teil geschafft ✓" : "Noch nicht ganz"}</h3><p class="msg">${ok ? "Das reicht für diesen Teil." : `Du brauchst ${need}. Probiere es mit neuen Zahlen noch einmal, die beste Runde zählt.`}</p>`;
    const acts = el("div", { class: "actions", style: "justify-content:center;margin-top:8px" });
    if (!ok){ const b = el("button", { class: "btn" }, "Neue Runde (neue Zahlen)"); b.addEventListener("click", () => playRound(h, i)); acts.appendChild(b); }
    const back = el("button", { class: "btn" + (ok ? "" : " ghost") }, "Zur Hausaufgabe"); back.addEventListener("click", () => renderHa(h.id)); acts.appendChild(back); card.appendChild(acts); app().appendChild(card);
    if (ok) MM.Fx.snd.level(hits === N); else MM.Fx.snd.miss(); }
  run(); }

MM.Hausaufgaben = { mark, homeCard, renderHa, status, progress, makeItems, defs, state, update };
})();
