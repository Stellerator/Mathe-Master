/* Mathe-Master · Plus-Aufgaben (freiwillig, außerhalb des Pflichtwegs)
   Definition: kapitel/forder.js. Stand: P.x.fo[kapitel][i] = Tag der Lösung. Eigenes Siegel in „Meine Erfolge“, eigene Spalte in der Nachweise-App.
   Beliebig viele Versuche mit neuen Zahlen. Schaltet nichts frei und zählt nicht für Level oder Siegel des Lernpfads. */
(function(){
"use strict";
const MM = window.MM, el = MM.el, T = MM.T;
const U = () => MM.UI, app = () => document.getElementById("app");
const FO = () => { const P = U().P; P.x = P.x || {}; P.x.fo = P.x.fo || {}; return P.x.fo; };
const list = kid => (MM.FORDER && MM.FORDER[kid]) || [];
const has = kid => list(kid).length > 0;
const solved = (kid, i) => !!(FO()[kid] && FO()[kid][i]);
function progress(kid){ const L = list(kid), n = L.filter((_, i) => solved(kid, i)).length; return { n, total: L.length, done: L.length > 0 && n === L.length }; }
const STAR = `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 1.6l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L1.8 6.9l5-.7z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`;

/* Kleine Kachel am Ende des Lernpfads (kleiner als die Stationen). Nur wenn es Plus-Aufgaben gibt. */
function pathTile(kid){
  if (!has(kid)) return null; const p = progress(kid);
  const b = el("button", { class: "station plus-mini" + (p.done ? " done" : ""), type: "button", "aria-label": "Plus-Aufgaben" + (p.done ? ", alle gelöst" : p.n ? ", " + p.n + " gelöst" : "") });
  b.innerHTML = `<span class="num" aria-hidden="true">${p.done ? "✓" : "+"}</span><span class="pm-t"><b>Plus-Aufgaben</b><small>${p.done ? "alle gelöst" : p.n ? p.n + " gelöst" : "zum Knobeln"}</small></span>`;
  b.addEventListener("click", () => renderPage(kid)); return b; }
const button = pathTile;

/* Seite: drei Aufgaben */
function renderPage(kid){
  const u = U(); u.view(false); const k = u.getK(kid), L = list(kid);
  u.bar("← Lernpfad", u.renderHome, k ? `Kapitel ${k.nr}` : "Kapitel", "Plus-Aufgaben", u.themeSwitch());
  const main = el("main", { class: "fo-page" }); app().appendChild(main);
  const p = progress(kid);
  main.appendChild(el("p", { class: "muted" }, "Hier denkst du anders als im Lernpfad: rückwärts, Fehler finden, mehrere Schritte. Jede Aufgabe darfst du beliebig oft mit neuen Zahlen versuchen."));
  if (p.done) main.appendChild(el("div", { class: "fo-seal" }, `<b>Plus-Siegel erhalten ✓</b><span>Du hast alle Plus-Aufgaben dieses Kapitels gelöst. Das Siegel liegt unter „Meine Erfolge“.</span>`));
  else if (p.n) main.appendChild(el("p", { class: "geschafft" }, `<b>${p.n} ${p.n === 1 ? "Aufgabe" : "Aufgaben"} gelöst.</b>`));
  L.forEach((f, i) => { const ok = solved(kid, i); const c = el("button", { class: "fo-card" + (ok ? " done" : ""), type: "button" });
    c.innerHTML = `<span class="fo-n">${ok ? "✓" : i + 1}</span><span class="fo-t"><b>${T(f.titel)}</b><small>${T(f.kurz)}</small></span><span class="go">${ok ? "Nochmal →" : "Öffnen →"}</span>`;
    c.addEventListener("click", () => playTask(kid, i)); main.appendChild(c); }); }

/* eine Aufgabe, beliebig oft mit neuen Zahlen */
function playTask(kid, i){
  const u = U(), f = list(kid)[i], k = u.getK(kid); if (!f) return renderPage(kid);
  let task = null; for (let q = 0; q < 300 && !task; q++) task = f.g();
  if (!task){ renderPage(kid); return; }
  u.view(true); const hd = u.bar("← Plus-Aufgaben", () => renderPage(kid), `${k ? "Kapitel " + k.nr + " · " : ""}Plus-Aufgabe ${i + 1}`, T(f.titel), null);
  const split = el("div", { class: "split" }), viz = el("section", { class: "viz" }), panel = el("section", { class: "panel" }); split.append(viz, panel); app().appendChild(split);
  const eb = el("div", { class: "ptop" }, `<span class="eyebrow">${T(f.kurz)}</span>`), pr = el("p", { class: "prompt" }), hints = el("div", { class: "pbody" }), body = el("div", { class: "pbody" }), fb = el("div", {}), acts = el("div", { class: "actions" });
  panel.append(eb, pr, hints, body, fb, acts); let fin = false;
  const api = { viz, panel, body, actions: acts, prompt: t => { pr.innerHTML = t; }, hint: t => { hints.appendChild(el("p", { class: "hint" }, t)); }, badge: t => { eb.appendChild(el("span", { class: "pred" }, t)); },
    cv: (cls = "") => MM.mkcv(viz, cls), legend: html => { const l = el("div", { class: "legend" }, html); viz.appendChild(l); return l; },
    situation: (t, l) => { viz.appendChild(el("div", { class: "situ" }, `<span class="eyebrow">${l || "Situation"}</span><p>${t}</p>`)); },
    feedback: (ok, html, title) => u.feedbackInto(fb, ok, html, title),
    finish: ok => { if (fin) return; fin = true; acts.innerHTML = ""; const wasDone = progress(kid).done;
      if (ok){ const fo = FO(); fo[kid] = fo[kid] || {}; if (!fo[kid][i]) fo[kid][i] = MM.todayIso(); u.save(); }
      const row = el("div", { class: "row" });
      if (ok){ const p = progress(kid);
        if (p.done && !wasDone){ const s = el("div", { class: "fo-seal" }, `<b>Plus-Siegel erhalten ✓</b><span>Alle Plus-Aufgaben dieses Kapitels sind gelöst.</span>`); acts.appendChild(s); MM.Fx.snd.level(true); MM.Fx.confetti(panel, 40); }
        const b = el("button", { class: "btn" }, "Zu den Plus-Aufgaben →"); b.addEventListener("click", () => renderPage(kid)); row.appendChild(b); }
      else { const b = el("button", { class: "btn" }, "Nochmal mit neuen Zahlen"); b.addEventListener("click", () => playTask(kid, i)); const z = el("button", { class: "btn ghost" }, "Zurück"); z.addEventListener("click", () => renderPage(kid)); row.append(b, z); }
      acts.appendChild(row); } };
  try { task.run(api); } catch (e) { console.error(e); panel.appendChild(el("p", { class: "hint" }, "Diese Aufgabe konnte nicht geladen werden.")); }
  u.fitLayout(split, viz, panel); }

/* Siegel-Karte für „Meine Erfolge“ */
function regalCard(kid, seal){
  if (!has(kid)) return null; const p = progress(kid);
  const b = el("button", { class: "trophy-card" + (p.done ? " full" : "") + " forder" });
  b.innerHTML = `${seal(p.done)}<span class="eyebrow">Extrameile</span><b>Plus-Aufgaben</b><span class="stamp">${p.n} / ${p.total}</span><span class="tst">${p.done ? "Gemeistert" : "zum Knobeln"}</span>`;
  b.addEventListener("click", () => renderPage(kid)); return b; }

MM.Forder = { has, list, progress, button, pathTile, renderPage, playTask, regalCard, solved };
})();
