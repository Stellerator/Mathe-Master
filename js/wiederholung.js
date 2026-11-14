/* Mathe-Master · Wiederholen
   Ziel (Klassenarbeit) setzen, Übungsrhythmus empfehlen, freiwilliger Streak,
   gemischte Runde aus allen freigeschalteten Aufgaben (Fehlerthemen häufiger, Abstand zum letzten Üben).
   Verändert keinen Lernstand (Steckbriefe, Levels, Bestwerte). Schreibt nur in P.x. */
(function(){
"use strict";
const MM = window.MM, el = MM.el, T = MM.T;
const U = () => MM.UI;
const app = () => document.getElementById("app");
const DAY = 864e5, RUNDE = 10;
const X = () => { const P = U().P; P.x = P.x || {}; return P.x; };
const REP = () => { const x = X(); x.rep = x.rep || {}; x.rep.rounds = x.rep.rounds || []; return x.rep; };
const dnum = iso => { const a = String(iso).split("-").map(Number); return Math.round(Date.UTC(a[0], a[1]-1, a[2]) / DAY); };
const daysTo = iso => dnum(iso) - dnum(MM.todayIso());
const fmt = iso => { const a = iso.split("-"); return +a[2] + "." + +a[1] + "." + a[0]; };
const agoTxt = ts => { if (!ts) return "noch nicht geübt"; const d = Math.floor((Date.now() - ts) / DAY); return d <= 0 ? "heute geübt" : d === 1 ? "zuletzt geübt gestern" : "zuletzt geübt vor " + d + " Tagen"; };

/* ---------- Themen (Challenge × Level) ---------- */
function topics(kapitelFilter){
  const u = U(), out = [], st = (X().stat) || {};
  u.okIds().forEach(kid => { if (kapitelFilter && kapitelFilter.length && !kapitelFilter.includes(kid)) return;
    const k = u.getK(kid); if (!k) return; const D = k.def;
    D.challOrder.forEach((typ, i) => { if (!u.chOpen(k, i)) return; const def = D.challenges[typ], id = u.chId(k, typ);
      def.levels.forEach((lv, n) => { if (!u.lvOpen(id, n)) return; const key = id + ":" + n;
        out.push({ key, k, typ, n, lv, kid, titel: def.titel, lname: lv.name, stat: st[key] || null }); }); }); });
  return out; }
function weight(t, focus){
  const s = t.stat; let w;
  if (!s || !s.a) w = 1.2;
  else { const rate = s.f / s.a, days = (Date.now() - s.t) / DAY;
    w = 0.5 + 2.5 * rate + Math.min(2, days / 7) * 0.6; if (days < 1 && rate < 0.2) w *= 0.4; }
  return focus ? w * w : w; }
function roulette(list, ws){ let tot = ws.reduce((a, b) => a + b, 0), r = Math.random() * tot; for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return i; } return list.length - 1; }
/* Level im neuen Format (gens): eine Aufgabe aus einem zufällig gewählten Generator */
function genTask(gens){ const e = MM.one(gens), g = typeof e === "function" ? e : e.g; for (let q = 0; q < 300; q++){ const r = g(); if (r) return r; } throw new Error("keine Aufgabe"); }
const SIZES = [5, 8, 10, 15, 20];
const roundSize = p => (p && p.n > 0) ? p.n : RUNDE;
/* Rückmeldung nach einer Runde: freundlich, aber passend zum Ergebnis */
function endText(hits, N){ const r = N ? hits / N : 0;
  if (r >= 1) return "Fehlerfrei. Stark!";
  if (r >= 0.8) return "Sehr gut.";
  if (r >= 0.6) return "Gut, das meiste sitzt schon.";
  if (r >= 0.4) return "Ein Teil sitzt schon. Die Themen unten lohnen sich noch.";
  return "Das war eine Übungsrunde, noch keine Prüfung. Schau dir unten die Themen an und versuche es gleich noch einmal."; }
function buildRound(plan, focus, keys){
  const ts = topics(plan && plan.kapitel).filter(t => !keys || keys.includes(t.key)); if (!ts.length) return [];
  const N = roundSize(plan), cap = Math.max(2, Math.ceil(N / ts.length)), cnt = {}, out = []; let guard = 0;
  while (out.length < N && guard++ < 400) {
    const pool = ts.filter(t => (cnt[t.key] || 0) < cap); if (!pool.length) break;
    const t = pool[roulette(pool, pool.map(p => weight(p, focus)))];
    let tasks; try { tasks = t.lv.gens ? [genTask(t.lv.gens)] : t.lv.make(); } catch (e) { cnt[t.key] = 9; continue; }
    if (!tasks || !tasks.length) { cnt[t.key] = 9; continue; }
    cnt[t.key] = (cnt[t.key] || 0) + 1; out.push({ topic: t, task: MM.one(tasks) }); }
  return out; }

/* ---------- Plan, Serie ---------- */
function plan(){ const p = REP().plan; return p && p.datum && daysTo(p.datum) >= 0 ? p : null; }
const lastRoundDays = () => { const r = REP().rounds; return r.length ? daysTo(r[r.length-1].d) : null; };
const roundsToday = () => REP().rounds.filter(r => r.d === MM.todayIso()).length;
function rhythm(p){ const d = daysTo(p.datum);
  if (d > 14) return { gap: 2, txt: "etwa jeden zweiten Tag eine Runde" };
  if (d > 7) return { gap: 1, txt: "fast täglich eine Runde" };
  return { gap: 1, txt: "täglich eine kurze Runde" }; }
function dueToday(p){ if (!p || roundsToday() > 0) return false; const l = lastRoundDays(); const g = rhythm(p).gap; return l === null || -l >= g; }
function streak(){ const days = X().days || {}; const ds = Object.keys(days).map(dnum).sort((a, b) => b - a);
  if (!ds.length || dnum(MM.todayIso()) - ds[0] > 2) return 0; let c = 1; for (let i = 1; i < ds.length; i++) { if (ds[i-1] - ds[i] <= 2) c++; else break; } return c; }
function save(){ U().save(); }

/* ---------- Kopfzeile: kleine Flamme (freiwillig), Klick öffnet ein Fenster ---------- */
/* Nur wenn ein Ziel gesetzt ist und die Option „Übungs-Serie anzeigen“ eingeschaltet wurde. Sichtbar vor und nach der heutigen Runde. */
const FLAME = (w) => `<svg class="flameico" width="${w}" height="${w}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5c.6 3.4 5.2 6.2 5.2 11.3a5.2 5.2 0 0 1-10.4 0c0-2.1.9-3.5 2-4.7.3 1.7 1 2.5 1.9 2.9C10.2 8.8 11.3 5.2 12 1.5z" fill="#f97316"/><path d="M12 22a3.1 3.1 0 0 1-3.1-3.1c0-1.7 1.2-2.6 2.1-3.9.4 1.1 1 1.5 1.7 1.8.7.6 1.5 1.3 1.5 2.1A3.1 3.1 0 0 1 12 22z" fill="#fde68a"/></svg>`;
function flameState(){ const p = plan(); if (!p || !p.serie) return null; const nt = roundsToday(); return { p, s: streak(), nt, done: nt > 0, due: dueToday(p), n: roundSize(p) }; }
function flamePopup(){
  const st = flameState(); if (!st) return; const u = U();
  const box = el("div", { class: "flamepop" });
  const head = st.s ? `Serie: ${st.s} ${st.s === 1 ? "Tag" : "Tage"}` : "Starte deine Serie";
  const sub = st.done ? `Heute geschafft ✓ · ${st.nt} ${st.nt === 1 ? "Runde" : "Runden"}` : (st.due ? "Heute ist eine Runde empfohlen" : "Eine kurze Runde hält deine Serie lebendig") + ` · ${st.n} Aufgaben`;
  box.innerHTML = FLAME(56) + `<h3>${head}</h3><p class="muted">${sub}<br>${st.p.titel} am ${fmt(st.p.datum)}</p>`;
  let close; const go = el("button", { class: "btn big" }, st.done ? "Noch eine Runde →" : "Jetzt üben →");
  go.addEventListener("click", () => { close(); start(st.p, false); });
  const page = el("button", { class: "linkbtn" }, "Zur Übungsseite"); page.addEventListener("click", () => { close(); renderRep(); });
  const cl = el("button", { class: "linkbtn" }, "Schließen"); cl.addEventListener("click", () => close());
  const row = el("div", { class: "row", style: "justify-content:center" }); row.append(page, cl);
  box.append(go, row); close = u.openModal(box); }
function flameButton(){
  const st = flameState(); if (!st) return null;
  const b = el("button", { class: "tab trophy flamebtn" + (st.done ? " done" : ""), "aria-label": (st.s ? `Serie: ${st.s} ${st.s === 1 ? "Tag" : "Tage"}. ` : "") + (st.done ? "Heute geschafft" : "Heute noch üben"), title: st.s ? `Serie: ${st.s} ${st.s === 1 ? "Tag" : "Tage"}` : "Übungs-Serie" }, FLAME(24));
  if (!st.done) b.appendChild(el("i", { class: "ndot", title: "Heute noch keine Runde" }));
  if (st.s) b.appendChild(el("span", { class: "fnum", "aria-hidden": "true" }, st.s > 99 ? "99+" : String(st.s)));
  b.addEventListener("click", flamePopup); return b; }

/* ---------- Startseite: Knopf ---------- */
function homeButtons(){
  const b = el("button", { class: "tab trophy", "aria-label": "Wiederholen", title: "Wiederholen und auf die Klassenarbeit üben" }, `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a7 7 0 0 1 12-4.9"/><path d="M16.5 2.5v4h-4"/><path d="M18 11a7 7 0 0 1-12 4.9"/><path d="M5.5 19.5v-4h4"/></svg>`);
  if (dueToday(plan()) && !(flameState())) b.appendChild(el("i", { class: "ndot", title: "Heute ist eine Runde empfohlen" }));
  b.addEventListener("click", renderRep); const f = flameButton(); return f ? [b, f] : [b]; }

/* ---------- Übersicht ---------- */
function renderRep(){
  const u = U(); u.view(false);
  u.bar("← Lernpfad", u.renderHome, "Mathe-Master", "Wiederholen", u.themeSwitch());
  const main = el("main", { class: "rep" }); app().appendChild(main);
  const p = plan(), all = topics(p && p.kapitel);

  /* Ziel */
  const goal = el("section", { class: "card" }); main.appendChild(goal);
  const kaps = u.okIds().map(id => u.getK(id)).filter(Boolean);
  const sizeSelect = cur => { const sel = el("select", { "aria-label": "Aufgaben pro Runde" }); SIZES.forEach(n => sel.appendChild(el("option", { value: String(n) }, n + " Aufgaben"))); sel.value = String(cur || RUNDE); return sel; };
  const kapBoxes = chosen => { const wrap = el("div", { class: "kaps" }), cbs = [];
    kaps.forEach(k => { const l = el("label", { class: "row" }); const cb = el("input", { type: "checkbox" }); cb.value = k.id; cb.checked = !chosen || !chosen.length || chosen.includes(k.id); cbs.push(cb); l.append(cb, document.createTextNode(" Kapitel " + k.nr + " · " + k.titel)); wrap.appendChild(l); });
    wrap.value = () => { const ids = cbs.filter(c => c.checked).map(c => c.value); return ids.length === kaps.length ? [] : ids; }; wrap.count = () => cbs.filter(c => c.checked).length; return wrap; };
  if (!p) {
    goal.innerHTML = `<h3>Dein Ziel</h3><p class="muted">Stelle dein Ziel ein: Termin der Klassenarbeit, Aufgaben pro Runde und die Kapitel, die dran sind. Die App empfiehlt dir dann einen Übungsrhythmus. Das ist freiwillig.</p>`;
    const row = el("div", { class: "row" }); const sel = el("select", { "aria-label": "Termin wählen" });
    (MM.TERMINE || []).filter(t => daysTo(t.datum) >= 0).forEach(t => sel.appendChild(el("option", { value: t.datum + "|" + t.id }, `${t.titel} · ${fmt(t.datum)}`)));
    sel.appendChild(el("option", { value: "eigen" }, "Eigenes Datum …"));
    const dt = el("input", { type: "date", "aria-label": "Eigenes Datum", min: MM.todayIso() }); dt.hidden = sel.value !== "eigen";
    const terminKap = () => { if (sel.value === "eigen") return []; const t = (MM.TERMINE || []).find(q => q.id === sel.value.split("|")[1]); return (t && t.kapitel) || []; };
    let boxes = kapBoxes(terminKap()); const boxHost = el("div", {}); boxHost.appendChild(boxes);
    sel.addEventListener("change", () => { dt.hidden = sel.value !== "eigen"; boxHost.innerHTML = ""; boxes = kapBoxes(terminKap()); boxHost.appendChild(boxes); });
    row.append(sel, dt);
    const nRow = el("div", { class: "row" }); const nSel = sizeSelect(RUNDE); nRow.append(el("span", {}, "Pro Runde:"), nSel);
    const go = el("button", { class: "btn" }, "Ziel setzen"); const msg = el("p", { class: "muted" });
    go.addEventListener("click", () => { let datum, titel = "Klassenarbeit", id = "eigen";
      if (sel.value === "eigen") { datum = dt.value; if (!datum || daysTo(datum) < 0) { msg.textContent = "Bitte ein Datum in der Zukunft wählen."; return; } titel = "Mein Ziel"; }
      else { const t = (MM.TERMINE || []).find(q => q.id === sel.value.split("|")[1]); datum = t.datum; titel = t.titel; id = t.id; }
      if (!boxes.count()){ msg.textContent = "Wähle mindestens ein Kapitel."; return; }
      REP().plan = { datum, titel, id, kapitel: boxes.value(), n: +nSel.value, start: MM.todayIso(), serie: false }; save(); renderRep(); });
    goal.append(row, nRow, el("p", { class: "muted" }, "Diese Kapitel kommen dran:"), boxHost, go, msg);
    if (!(MM.TERMINE || []).length) sel.value = "eigen", dt.hidden = false;
  } else {
    const d = daysTo(p.datum), r = rhythm(p), seit = REP().rounds.filter(q => dnum(q.d) >= dnum(p.start)).length, n = roundSize(p);
    goal.innerHTML = `<h3>Dein Ziel: ${p.titel} am ${fmt(p.datum)}</h3><p>${d === 0 ? "<b>Heute ist es so weit.</b>" : d === 1 ? "<b>Morgen</b> ist es so weit." : ""} Empfehlung: ${r.txt} (je ${n} Aufgaben, etwa ${n} Minuten).</p>
      <p class="geschafft">${seit ? `<b>${seit} ${seit === 1 ? "Runde" : "Runden"} geschafft.</b> Das zählt.` : `Die erste Runde fehlt noch. Sie dauert nur etwa ${n} Minuten.`}</p>`;
    const row = el("div", { class: "row" });
    const sv = el("label", { class: "row" }); const cb = el("input", { type: "checkbox" }); cb.checked = !!p.serie;
    cb.addEventListener("change", () => { p.serie = cb.checked; save(); renderRep(); });
    sv.append(cb, document.createTextNode(" Übungs-Serie anzeigen und beim Öffnen erinnern")); row.appendChild(sv);
    const rm = el("button", { class: "linkbtn" }, "Ziel entfernen"); rm.addEventListener("click", () => { delete REP().plan; save(); renderRep(); });
    row.appendChild(rm); goal.appendChild(row);
    /* anpassen: Aufgaben pro Runde und Kapitel */
    const det = el("details", { class: "fsd" }); det.appendChild(el("summary", {}, "Anpassen: Aufgaben pro Runde und Kapitel"));
    const nRow = el("div", { class: "row" }); const nSel = sizeSelect(n); nRow.append(el("span", {}, "Pro Runde:"), nSel); nSel.addEventListener("change", () => { p.n = +nSel.value; save(); renderRep(); });
    const bx = kapBoxes(p.kapitel); bx.addEventListener("change", () => { if (!bx.count()) return; p.kapitel = bx.value(); save(); renderRep(); });
    det.append(nRow, el("p", { class: "muted" }, "Diese Kapitel kommen dran:"), bx); goal.appendChild(det);
    if (p.serie) { const s = streak(); goal.appendChild(el("p", { class: "streak" }, s ? `Serie: ${s} ${s === 1 ? "Tag" : "Tage"}` : "Serie: noch nicht gestartet")); goal.appendChild(el("p", { class: "muted" }, "Ein freier Tag dazwischen ist erlaubt. Nach zwei Tagen Pause beginnt die Serie neu.")); }
  }

  /* Heute */
  const today = el("section", { class: "card" }); main.appendChild(today);
  if (!all.length) { today.innerHTML = `<h3>Heute üben</h3><p class="muted">Sobald du die ersten Level geschafft hast, kannst du hier gemischt wiederholen.</p>`; }
  else {
    const due = dueToday(p), nt = roundsToday();
    today.innerHTML = `<h3>Heute üben</h3><p>${p ? (nt ? `<b>Heute geschafft.</b> Eine weitere Runde ist freiwillig.` : due ? "<b>Heute ist eine Runde empfohlen.</b>" : "Heute musst du nichts tun. Eine Runde schadet aber nicht.") : "Gemischte Aufgaben aus allen Kapiteln, die du schon freigeschaltet hast."} ${roundSize(p)} Aufgaben, Themen mit Fehlern kommen öfter.</p>`;
    const row = el("div", { class: "row" });
    const b1 = el("button", { class: "btn big" }, `Runde starten (${roundSize(p)} Aufgaben)`); b1.addEventListener("click", () => start(p, false));
    row.appendChild(b1);
    if (all.some(t => t.stat && t.stat.a >= 3 && t.stat.f / t.stat.a >= 0.3)) { const b2 = el("button", { class: "btn ghost" }, "Nur Schwerpunkte"); b2.addEventListener("click", () => start(p, true)); row.appendChild(b2); }
    today.appendChild(row); }

  /* Probearbeit und Übungsarbeit */
  if (MM.Arbeit) MM.Arbeit.menuCards(main);

  /* Schwerpunkte */
  const rated = all.filter(t => t.stat && t.stat.a >= 3).map(t => ({ t, ok: Math.round(100 * (1 - t.stat.f / t.stat.a)) }));
  const stark = rated.filter(x => x.ok >= 80).sort((a, b) => b.ok - a.ok).slice(0, 4);
  const uebung = rated.filter(x => x.ok < 80).sort((a, b) => a.ok - b.ok).slice(0, 3);
  const row = x => el("div", { class: "topic" }, `<span>${T(x.t.titel)} · Level ${x.t.n + 1}<br><i>${agoTxt(x.t.stat.t)}</i></span><div class="bar2" aria-hidden="true"><b style="width:${x.ok}%"></b></div><span class="muted">${x.ok} % richtig</span>`);
  if (stark.length) { const sec = el("section", { class: "card" }); sec.appendChild(el("h3", {}, "Das sitzt schon")); const box = el("div", { class: "topics" }); stark.forEach(x => box.appendChild(row(x))); sec.appendChild(box); main.appendChild(sec); }
  if (uebung.length) { const sec = el("section", { class: "card" }); sec.appendChild(el("h3", {}, "Hier lohnt sich noch Übung")); const box = el("div", { class: "topics" }); uebung.forEach(x => box.appendChild(row(x))); sec.appendChild(box); main.appendChild(sec); }
  const hc = MM.Arbeit && MM.Arbeit.historyCard(); if (hc) main.appendChild(hc);
  const rr = REP().rounds.slice(-5).reverse();
  if (rr.length) main.appendChild(el("section", { class: "card" }, `<h3>Letzte Runden</h3>` + rr.map(q => `<div class="topic"><span>${fmt(q.d)}</span><span>${q.h} von ${q.n} richtig</span></div>`).join("")));
}

/* ---------- Runde spielen ---------- */
function start(p, focus, keys){ const e = buildRound(p, focus, keys); if (!e.length) { renderRep(); return; } playRound(e, p); }
const startFocus = keys => start(plan(), true, keys);
function playRound(entries, p){
  const u = U(); u.view(true); const N = entries.length, res = []; let i = 0;
  const track = el("div", { class: "track", "aria-label": "Fortschritt in der Runde" });
  u.bar("← Wiederholen", renderRep, "Wiederholung", "Gemischte Runde", track);
  const split = el("div", { class: "split" }), viz = el("section", { class: "viz" }), panel = el("section", { class: "panel" }); split.append(viz, panel); app().appendChild(split);
  const drawTrack = () => { track.innerHTML = [...Array(N)].map((_, q) => `<i class="${res[q] === true ? "ok" : res[q] === false ? "bad" : ""}${q === i && res[q] === undefined ? " cur" : ""}"></i>`).join("") + `<span>Aufgabe ${Math.min(i + 1, N)} / ${N}</span>`; };
  function run(){
    MM.cleanup(); viz.innerHTML = ""; panel.innerHTML = ""; panel.scrollTop = 0; drawTrack();
    const en = entries[i], t = en.topic;
    const eb = el("div", { class: "ptop" }, `<span class="eyebrow">Aufgabe ${i + 1} von ${N} · ${T(t.titel)}</span>`);
    const ag = el("p", { class: "ago" }, agoTxt(t.stat && t.stat.t));
    const pr = el("p", { class: "prompt" }), hints = el("div", { class: "pbody" }), body = el("div", { class: "pbody" }), fb = el("div", {}), acts = el("div", { class: "actions" });
    panel.append(eb, pr, hints, body, fb, acts);
    const api = { viz, panel, body, actions: acts,
      prompt: s => { pr.innerHTML = s; }, hint: s => { hints.appendChild(el("p", { class: "hint" }, s)); },
      badge: s => { eb.appendChild(el("span", { class: "pred" }, s)); },
      cv: (cls = "") => MM.mkcv(viz, cls),
      legend: html => { const l = el("div", { class: "legend" }, html); viz.appendChild(l); return l; },
      situation: (s, l) => { viz.appendChild(el("div", { class: "situ" }, `<span class="eyebrow">${l || "Situation"}</span><p>${s}</p>`)); },
      feedback: (ok, html, title) => u.feedbackInto(fb, ok, html, title),
      finish: ok => { if (res[i] !== undefined) return; res[i] = !!ok; u.logRes(t.key, !!ok); t.stat = (X().stat || {})[t.key]; drawTrack(); acts.innerHTML = "";
        const w = el("button", { class: "btn" }, i + 1 < N ? "Weiter →" : "Auswertung →"); w.addEventListener("click", () => { i++; i < N ? run() : ende(); }); acts.appendChild(w);
        requestAnimationFrame(() => { try { panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" }); } catch (e) {} }); } };
    panel.insertBefore(ag, pr);
    try { en.task.run(api); } catch (e) { console.error(e); panel.appendChild(el("p", { class: "hint" }, "Diese Aufgabe konnte nicht geladen werden.")); api.finish(true); }
    u.fitLayout(split, viz, panel);
  }
  function ende(){
    MM.cleanup(); split.remove(); const hits = res.filter(Boolean).length;
    const r = REP(); r.rounds.push({ d: MM.todayIso(), h: hits, n: N }); if (r.rounds.length > 120) r.rounds.splice(0, r.rounds.length - 120); save();
    const card = el("div", { class: "endcard" });
    card.innerHTML = `<span class="eyebrow">Wiederholung</span><span class="big">${hits} / ${N}</span><span class="muted">richtig im ersten Versuch</span>`;
    const miss = {}; entries.forEach((e, q) => { if (res[q] === false) miss[e.topic.key] = e.topic; });
    const ms = Object.values(miss);
    card.appendChild(el("h3", {}, endText(hits, N)));
    card.appendChild(el("p", { class: "msg" }, ms.length ? "Hier lohnt sich ein zweiter Blick:" : "Alle Themen saßen."));
    if (ms.length) { const ul = el("ul", { style: "text-align:left;margin:6px auto;max-width:420px" }); ms.forEach(t => ul.appendChild(el("li", {}, `${T(t.titel)} · Level ${t.n + 1} (${t.lname})`))); card.appendChild(ul); }
    if (p && p.serie) { const s = streak(); card.appendChild(el("p", { class: "streak" }, `Serie: ${s} ${s === 1 ? "Tag" : "Tage"}`)); }
    const acts = el("div", { class: "actions", style: "justify-content:center;margin-top:8px" });
    const bt = (t, f, g) => { const b = el("button", { class: "btn" + (g ? " ghost" : "") }, t); b.addEventListener("click", f); acts.appendChild(b); };
    bt("Noch eine Runde", () => start(p, false)); bt("Zur Übersicht", renderRep, true); bt("Zum Lernpfad", u.renderHome, true);
    card.appendChild(acts); app().appendChild(card); card.classList.add("win"); MM.Fx.snd.level(hits === N);
  }
  run();
}

MM.Wiederholung = { endText, roundSize, flamePopup, flameButton, startFocus, homeButtons, renderRep, topics, buildRound, streak, rhythm, plan, weight };
})();
