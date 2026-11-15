/* Mathe-Master · Arbeiten: gemischte Übung und Probearbeit
   Gemischte Übung (früher „Übungsarbeit“): Aufgaben nur für dich (Zahlen aus dem Aktivierungscode), Rechnen im Heft, danach Lösung kontrollieren und selbst bewerten
   (richtig / teilweise / nicht gelöst). Probearbeit: wenige gemischte Aufgaben mit Richtzeit, keine Rückmeldung nach der einzelnen Aufgabe,
   Auswertung mit Musterlösungen erst am Ende.
   Beides ändert keinen Lernstand (Steckbriefe, Levels, Bestwerte). Ergebnisse gehen ins Fehlerprofil (P.x.stat) und in P.x.arb. */
(function(){
"use strict";
const MM = window.MM, el = MM.el, T = MM.T, tex = MM.tex, tn = MM.tn;
const U = () => MM.UI, W = () => MM.Wiederholung, E = () => MM.Eingabe;
const app = () => document.getElementById("app");
const X = () => { const P = U().P; P.x = P.x || {}; return P.x; };
const ARB = () => { const x = X(); x.arb = x.arb || []; return x.arb; };
const fmt = iso => { const a = iso.split("-"); return +a[2] + "." + +a[1] + "."; };
const N_UEB = 8, N_PROBE = 5, MIN_PRO_AUFGABE = 4;
const ident = () => (MM.Nachweis && MM.Nachweis.ident) || null;

/* ---------- Aufgaben auswählen ---------- */
const retry = g => { for (let q = 0; q < 300; q++){ const r = g(); if (r) return r; } return null; };
const gEntry = g => typeof g === "function" ? { g } : g;
function makeTask(t){
  const lv = t.lv;
  if (lv.gens){ const e = gEntry(MM.one(lv.gens)); const task = retry(e.g); return task ? { task, topic: t, steck: e.steck } : null; }
  const list = lv.make(); return list && list.length ? { task: MM.one(list), topic: t, steck: null, pool: list } : null; }
function roulette(ws){ let tot = ws.reduce((a, b) => a + b, 0), r = Math.random() * tot; for (let i = 0; i < ws.length; i++){ r -= ws[i]; if (r <= 0) return i; } return ws.length - 1; }
/* o: {needSpec, steps (Mindestzahl Mehrschritt-Aufgaben), max (je Thema)} */
function pickItems(ts, N, o){
  const out = [], cnt = {}, fail = {}; let max = o.max || 1, guard = 0;
  const add = it => { out.push(it); cnt[it.topic.key] = (cnt[it.topic.key] || 0) + 1; };
  const okItem = it => it && (!o.needSpec || (it.task.spec && (it.task.spec.steps || it.task.spec.opts || it.task.spec.answer !== undefined || it.task.spec.fn || it.task.spec.rel || it.task.spec.ax || it.task.spec.valid)));
  if (o.steps){ for (const t of MM.shuffle(ts)){ if (out.length >= o.steps) break;
      for (let k = 0; k < 8; k++){ const it = makeTask(t); if (it && it.task.spec && it.task.spec.steps){ add(it); break; } } } }
  while (out.length < N && guard++ < 600){
    const pool = ts.filter(t => (cnt[t.key] || 0) < max && (fail[t.key] || 0) < 6); if (!pool.length){ if (max < 2){ max = 2; continue; } break; }
    const t = pool[roulette(pool.map(p => W().weight(p, false)))]; const it = makeTask(t);
    if (!okItem(it)){ fail[t.key] = (fail[t.key] || 0) + 1; continue; } add(it); }
  return MM.shuffle(out); }
function buildPaper(kids, seed){ return MM.withSeed(seed, () => { const ts = W().topics(kids); return pickItems(ts, N_UEB, { needSpec: true, steps: 2, max: 1 }); }); }
function buildProbe(kid, seed){ return MM.withSeed(seed, () => { const ts = W().topics([kid]); return pickItems(ts, N_PROBE, { needSpec: false, steps: 0, max: 1 }); }); }

/* ---------- Musterlösung aus der Aufgaben-Spezifikation ---------- */
function solHtml(sp){
  if (!sp) return "";
  const e = E(), bx = v => e.needsFraction(v) ? e.bruchTex(v) : tn(v); let s = "";
  if (sp.opts){ const g = sp.opts.find(o => o.ok); s = "<b>Richtig:</b> " + T(g ? g.t : ""); }
  else if (sp.rel !== undefined && sp.bound !== undefined){ s = "<b>Lösung:</b> " + tex(e.ineqTex(sp.rel, sp.bound, sp.v) + ((sp.v || "x") === "x" ? ",\\ \\text{also}\\ " + e.lsgTex(sp.rel, sp.bound) : "")); }
  else if (sp.ax !== undefined){ s = "<b>Lösung:</b> " + tex("S(" + bx(sp.ax) + "|" + bx(sp.ay) + ")"); }
  else if (sp.valid && sp.solTex){ s = "<b>Ein Beispiel:</b> " + (sp.kind === "term" || sp.kind === undefined ? tex((sp.prefix || "f(x)=") + sp.solTex) : tex(sp.solTex)); }
  else if (sp.fn && sp.solTex){ s = "<b>Lösung:</b> " + tex((sp.prefix || "f(x)=") + sp.solTex); }
  else if (sp.answer !== undefined){ s = "<b>Lösung:</b> " + tex(sp.solTex || bx(sp.answer)) + (sp.unit ? " " + T(sp.unit) : ""); }
  if (sp.erkl) s += "<br>" + T(sp.erkl);
  return s; }

/* ---------- Gemeinsames Gerüst für eine Aufgabe ---------- */
function frame(titleLeft, onBack, eyebrow, title, right){
  const u = U(); u.view(true);
  const hd = u.bar(titleLeft, onBack, eyebrow, title, right || null);
  const split = el("div", { class: "split" }), viz = el("section", { class: "viz" }), panel = el("section", { class: "panel" }); split.append(viz, panel); app().appendChild(split);
  return { hd, split, viz, panel }; }
function taskParts(F, label){
  MM.cleanup(); F.viz.innerHTML = ""; F.panel.innerHTML = ""; F.panel.scrollTop = 0;
  const eb = el("div", { class: "ptop" }, `<span class="eyebrow">${label}</span>`), pr = el("p", { class: "prompt" }), hints = el("div", { class: "pbody" }), body = el("div", { class: "pbody" }), fb = el("div", {}), acts = el("div", { class: "actions" });
  F.panel.append(eb, pr, hints, body, fb, acts);
  return { eb, pr, hints, body, fb, acts, plain: "" }; }
function baseApi(F, P, extra){
  const cap = { prompt: "" };
  const api = { viz: F.viz, panel: F.panel, body: P.body, actions: P.acts,
    prompt: s => { P.pr.innerHTML = s; cap.prompt = s; }, hint: s => { P.hints.appendChild(el("p", { class: "hint" }, s)); }, badge: s => { P.eb.appendChild(el("span", { class: "pred" }, s)); },
    cv: (cls = "") => MM.mkcv(F.viz, cls), legend: html => { const l = el("div", { class: "legend" }, html); F.viz.appendChild(l); return l; },
    situation: (s, l) => { F.viz.appendChild(el("div", { class: "situ" }, `<span class="eyebrow">${l || "Situation"}</span><p>${s}</p>`)); } };
  Object.assign(api, extra || {}); api._cap = cap; return api; }

/* ---------- Auswertung (gemeinsam) ---------- */
// items: [{task, topic, steck}], score: [0..1 pro Aufgabe oder null], kind: "probe"|"ueb"
function summary(items, score, kind, meta){
  const u = U(); u.view(false);
  u.bar("← Wiederholen", renderMenu, "Mathe-Master", kind === "probe" ? "Probearbeit: Auswertung" : "Gemischte Übung: Auswertung", u.themeSwitch());
  const main = el("main", { class: "arbeit" }); app().appendChild(main);
  const N = items.length, full = score.filter(s => s === 1).length, half = score.filter(s => s === 0.5).length;
  const pts = score.reduce((a, s) => a + (s || 0), 0);
  const card = el("section", { class: "card win" });
  card.innerHTML = `<span class="eyebrow">${kind === "probe" ? "Probearbeit" : "Gemischte Übung"}${meta.titel ? " · " + meta.titel : ""}</span><h3>${full} von ${N} Aufgaben gelöst${half ? `, ${half} teilweise` : ""}</h3>` +
    (meta.min !== undefined ? `<p class="muted">Bearbeitungszeit: ${meta.min} Min. (Richtzeit ${meta.soll} Min.)</p>` : "") +
    `<p>${W() && W().endText ? W().endText(pts, N) : ""}</p>`;
  main.appendChild(card);
  /* Themen */
  const per = {}; items.forEach((it, i) => { const k = it.topic.key; (per[k] = per[k] || { t: it.topic, s: 0, n: 0, items: [] }); per[k].s += score[i] || 0; per[k].n++; per[k].items.push(it); });
  const strong = Object.values(per).filter(x => x.s === x.n), weak = Object.values(per).filter(x => x.s < x.n);
  if (strong.length){ const sec = el("section", { class: "card" }); sec.appendChild(el("h3", {}, "Das hat geklappt")); strong.forEach(x => sec.appendChild(el("p", { class: "topic" }, `✓ ${T(x.t.titel)} · Level ${x.t.n + 1}`))); main.appendChild(sec); }
  if (weak.length){ const sec = el("section", { class: "card" }); sec.appendChild(el("h3", {}, "Hier lohnt sich noch Übung"));
    weak.forEach(x => sec.appendChild(el("p", { class: "topic" }, `${T(x.t.titel)} · Level ${x.t.n + 1}`)));
    if (W() && W().startFocus){ const b = el("button", { class: "btn" }, "Gezielt üben (neue Zahlen)"); b.addEventListener("click", () => W().startFocus(weak.map(x => x.t.key))); sec.appendChild(b); }
    /* Fehlersteckbriefe */
    const keys = new Set(); weak.forEach(x => x.items.forEach(it => { const k = U().steckKey(x.t.k, x.t.typ, it); if (k) keys.add(x.t.k.id + "|" + k); }));
    if (keys.size && MM.Nachschlagen){ const fs = el("div", { class: "fsteck" }); fs.appendChild(el("h4", {}, "Dazu passen diese Steckbriefe"));
      [...keys].forEach(ck => { const [kid, key] = ck.split("|"); const k = U().getK(kid); const sb = k.def.steckbriefe[key]; const det = el("details", { class: "fsd" }); det.appendChild(el("summary", {}, "Steckbrief: " + T(sb.titel)));
        det.addEventListener("toggle", () => { if (det.open && !det._d){ det._d = true; MM.Nachschlagen.steckLite(det, k, key); } }); fs.appendChild(det); }); sec.appendChild(fs); }
    main.appendChild(sec); }
  /* Musterlösungen */
  const rev = el("section", { class: "card" }); rev.appendChild(el("h3", {}, "Aufgaben mit Musterlösung"));
  items.forEach((it, i) => { const s = score[i], mark = s === 1 ? "✓" : s === 0.5 ? "½" : "✗"; const det = el("details", { class: "fsd" });
    const sp = it.task.spec; const q = sp && sp.q ? T(sp.q).replace(/<[^>]+>/g, " ") : "";
    det.appendChild(el("summary", {}, `${mark} Aufgabe ${i + 1} · ${T(it.topic.titel)}`));
    const inner = el("div", { class: "slite" }); inner.innerHTML = (sp && sp.q ? `<p>${T(sp.q)}</p>` : "") + `<p>${(it.fbHtml && !(sp && solHtml(sp))) ? it.fbHtml : solHtml(sp) || it.fbHtml || "Siehe Aufgabe."}</p>`;
    det.appendChild(inner); rev.appendChild(det); });
  main.appendChild(rev);
  const acts = el("div", { class: "row" }); const again = el("button", { class: "btn" }, kind === "probe" ? "Noch eine Probearbeit" : "Neue gemischte Übung"); again.addEventListener("click", renderMenu);
  const home = el("button", { class: "btn ghost" }, "Zum Lernpfad"); home.addEventListener("click", u.renderHome); acts.append(again, home); main.appendChild(acts);
  MM.Fx.snd.level(pts >= N); }
function record(items, score, kind, meta){
  items.forEach((it, i) => { const s = score[i]; U().logRes(it.topic.key, s === 1 ? true : s === 0.5 ? 0.5 : 1); });
  const arr = ARB(); arr.push({ t: kind, d: MM.todayIso(), h: score.filter(s => s === 1).length, p: score.filter(s => s === 0.5).length, n: items.length, k: meta.kids || [] }); if (arr.length > 40) arr.splice(0, arr.length - 40);
  U().save(); }

/* ---------- Probearbeit ---------- */
function playProbe(items, meta){
  const N = items.length, soll = N * MIN_PRO_AUFGABE, t0 = Date.now(); const score = new Array(N).fill(null); let i = 0, ticking = null;
  const timer = el("span", { class: "score" }, "");
  const F = frame("← Abbrechen", () => { stopT(); renderMenu(); }, "Probearbeit" + (meta.titel ? " · " + meta.titel : ""), "Aufgabe 1 von " + N, timer);
  const stopT = () => { if (ticking){ clearInterval(ticking); ticking = null; } };
  const tick = () => { if (!document.body.contains(timer)){ stopT(); return; } const s = Math.floor((Date.now() - t0) / 1000), m = Math.floor(s / 60);
    timer.textContent = `Richtzeit ${soll} Min. · bisher ${m}:${String(s % 60).padStart(2, "0")}` + (m >= soll ? " · in Ruhe zu Ende arbeiten" : ""); };
  ticking = setInterval(tick, 1000); tick();
  const setTitle = () => { const h = F.hd.querySelector("h2"); if (h) h.textContent = `Aufgabe ${i + 1} von ${N}`; };
  function next(){ if (i + 1 < N){ i++; run(); } else ende(); }
  function run(){
    setTitle(); const it = items[i]; const P = taskParts(F, `Aufgabe ${i + 1} von ${N} · Probearbeit`);
    const done = el("div", { class: "card" }, "<b>Antwort gespeichert.</b>"); let fin = false;
    const api = baseApi(F, P, {
      feedback: (ok, html) => { it.fbHtml = (ok ? "" : "") + html; },
      finish: ok => { if (fin) return; fin = true; score[i] = ok ? 1 : 0; F.viz.innerHTML = ""; F.panel.querySelectorAll(".situ").forEach(x => x.remove()); P.body.innerHTML = ""; P.fb.innerHTML = ""; P.acts.innerHTML = ""; P.hints.innerHTML = ""; P.pr.innerHTML = ""; P.eb.querySelectorAll(".pred").forEach(x => x.remove());
        P.pr.appendChild(done); const b = el("button", { class: "btn" }, i + 1 < N ? "Nächste Aufgabe →" : "Abgeben →"); b.addEventListener("click", next); P.acts.appendChild(b); } });
    try { it.task.run(api); } catch (e) { console.error(e); P.panel && P.body.appendChild(el("p", { class: "hint" }, "Diese Aufgabe konnte nicht geladen werden.")); api.finish(false); return; }
    U().fitLayout(F.split, F.viz, F.panel);
    if (!fin){ const sk = el("button", { class: "btn ghost" }, "Überspringen"); sk.addEventListener("click", () => { if (fin) return; fin = true; score[i] = 0; it.fbHtml = ""; MM.cleanup(); next(); }); P.acts.appendChild(sk); }
  }
  function ende(){ stopT(); const min = Math.max(1, Math.round((Date.now() - t0) / 60000)); MM.cleanup(); record(items, score, "probe", { kids: [meta.kid] }); summary(items, score, "probe", { titel: meta.titel, min, soll }); }
  run(); }

/* ---------- Gemischte Übung (Rechnen im Heft) ---------- */
function playPaper(items, meta){
  const N = items.length; const score = new Array(N).fill(null); let i = 0;
  const track = el("div", { class: "track", "aria-label": "Fortschritt" });
  const F = frame("← Abbrechen", renderMenu, "Gemischte Übung" + (meta.titel ? " · " + meta.titel : ""), "Aufgabe 1 von " + N, track);
  const draw = () => { track.innerHTML = [...Array(N)].map((_, q) => `<i class="${score[q] === 1 ? "ok" : score[q] === 0.5 ? "" : score[q] === 0 ? "bad" : ""}${q === i && score[q] === null ? " cur" : ""}"></i>`).join("") + `<span>${score.filter(s => s !== null).length} bearbeitet</span>`; };
  const setTitle = () => { const h = F.hd.querySelector("h2"); if (h) h.textContent = `Aufgabe ${i + 1} von ${N}`; };
  function next(){ if (i + 1 < N){ i++; run(); } else { MM.cleanup(); record(items, score, "ueb", { kids: meta.kids }); summary(items, score, "ueb", { titel: meta.titel }); } }
  function run(){
    setTitle(); draw(); const it = items[i], sp = it.task.spec; const P = taskParts(F, `Aufgabe ${i + 1} von ${N}`);
    const rate = (s, extra) => { if (score[i] !== null) return; score[i] = s; draw(); P.acts.innerHTML = ""; const b = el("button", { class: "btn" }, i + 1 < N ? "Weiter →" : "Auswertung →"); b.addEventListener("click", next); P.acts.appendChild(b); };
    if (sp && sp.steps){ /* Heft-Aufgabe mit Punkteraster: läuft wie gewohnt */
      const api = baseApi(F, P, { feedback: (ok, html, title) => U().feedbackInto(P.fb, ok, html, title), finish: (ok, det) => { it.fbHtml = ""; const c = det && det.self; rate(c === "r" ? 1 : c === "t" ? 0.5 : 0); } });
      try { it.task.run(api); } catch (e) { console.error(e); rate(0); } U().fitLayout(F.split, F.viz, F.panel); return; }
    /* Papier-Modus: Aufgabe sehen, im Heft rechnen, Lösung kontrollieren, selbst bewerten */
    const sink = { body: el("div"), acts: el("div") }; const api = baseApi(F, { eb: P.eb, pr: P.pr, hints: P.hints, body: sink.body, acts: sink.acts }, { feedback() {}, finish() {} });
    try { it.task.run(api); } catch (e) { console.error(e); rate(0); return; }
    U().fitLayout(F.split, F.viz, F.panel);
    P.body.appendChild(el("div", { class: "heft sheet" }, "<b>Löse die Aufgabe im Heft.</b>"));
    const show = el("button", { class: "btn" }, "Lösung kontrollieren"); P.acts.appendChild(show);
    show.addEventListener("click", () => { show.remove(); const sol = el("div", { class: "raster" }); sol.innerHTML = `<p>${solHtml(sp) || "Siehe Erklärung."}</p><p><b>Wie ist es dir gelungen?</b></p>`;
      const sb = el("div", { class: "selfbtns" }); [[1, "richtig gelöst"], [0.5, "teilweise richtig"], [0, "nicht gelöst"]].forEach(([s, t]) => { const b = el("button", { class: "btn ghost" }, t); b.addEventListener("click", () => { sb.querySelectorAll("button").forEach(x => x.disabled = true); rate(s); }); sb.appendChild(b); });
      sol.appendChild(sb); P.body.appendChild(sol); }); }
  run(); }

/* ---------- Karten für die Seite „Wiederholen“ ---------- */
const back = () => (MM.Wiederholung ? MM.Wiederholung.renderRep() : U().renderHome());
function renderMenu(){ back(); }
function homeButtons(){ return []; }   // kein eigenes Symbol mehr: Probearbeit und gemischte Übung liegen unter „Wiederholen“
function menuCards(main){
  const u = U(); const ids = u.okIds().map(id => u.getK(id)).filter(Boolean); if (!ids.length) return;

  /* Probearbeit: ein Blatt über den ganzen Stoff bis zur Klassenarbeit (kapitel/probeblaetter.js) */
  const PB = MM.Probeblatt, pa = el("section", { class: "card sec sec-probe" }), pk = PB && PB.has() ? PB.kapitel() : [];
  pa.innerHTML = `<h3>${MM.RepIcon ? MM.RepIcon("probe") : ""}Probearbeit</h3>` + (pk.length
    ? `<p>Ein Blatt mit Aufgaben aus dem gesamten Stoff bis zur Klassenarbeit (Kapitel ${PB.kNamen(pk)}), so wie in der Klassenarbeit: mehrere mehrteilige Aufgaben (a, b, c), <b>${MM.PROBEARBEIT.min} Minuten</b> Bearbeitungszeit. Du rechnest im Heft und deckst danach mit einem Klick die Musterlösung auf. Jede Probearbeit hat andere Aufgaben.</p>${PB.nochText() ? `<p class="muted">${PB.nochText()}</p>` : ""}`
    : `<p class="muted">Sobald Kapitel freigeschaltet sind, findest du hier die Probearbeit.</p>`);
  if (pk.length){ const go2 = el("button", { class: "btn big" }, "Probearbeit öffnen"); go2.addEventListener("click", () => PB.show({ kids: pk })); const row2 = el("div", { class: "row" }); row2.appendChild(go2); pa.appendChild(row2); }
  main.appendChild(pa);

}
function historyCard(){
  const last = ARB().slice(-5).reverse(); if (!last.length) return null;
  return el("div", { class: "sub" }, `<h4>Probearbeiten, die du geschafft hast</h4>` + last.map(a => `<div class="topic"><span>${fmt(a.d)} · ${a.t === "probe" ? "Probearbeit" : "Gemischte Übung"}</span><span>${a.h} von ${a.n} gelöst${a.p ? `, ${a.p} teilweise` : ""}</span></div>`).join("")); }

MM.Arbeit = { menuCards, historyCard, homeButtons, renderMenu, buildPaper, buildProbe, solHtml, playPaper, playProbe };
})();
