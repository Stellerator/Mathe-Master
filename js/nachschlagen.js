/* Mathe-Master · Nachschlagen: alle Steckbriefe der freigeschalteten Kapitel an einer Stelle (nur lesen, ohne Mini-Check).
   Auch Bausteine für die Fehlersteckbriefe in der Auswertung. */
(function(){
"use strict";
const MM = window.MM, el = MM.el, T = MM.T, tex = MM.tex;
const U = () => MM.UI;
const app = () => document.getElementById("app");

/* Kompakte Steckbrief-Ansicht: Formel, Text, Merke, Wichtig und alle Rechenbeispiele */
function steckLite(host, k, key){
  const sb = k.def.steckbriefe[key]; if (!sb) return;
  const box = el("div", { class: "slite" });
  if (sb.formel) box.appendChild(el("div", { class: "formel" }, tex(sb.formel)));
  box.appendChild(el("p", {}, T(sb.text)));
  if (sb.merke) box.appendChild(el("p", { class: "merke" }, `<span class="tag">Merke</span><br>${T(sb.merke)}`));
  if (sb.falle) box.appendChild(el("p", { class: "falle" }, `<span class="tag">Wichtig</span><br>${T(sb.falle)}`));
  host.appendChild(box);
  if (sb.beispiele && MM.Stepper) sb.beispiele.forEach(b => MM.Stepper.mount(box, b));
  return box; }

/* Welche Karten darf man schon lesen? Erledigte und die nächste offene (wie im Lernpfad). Lehrkraft: alle. */
function reachable(k){
  const u = U(), keys = k.def.steckOrder; const firstOpen = keys.findIndex(key => !u.P.cards[u.cid(k, key)]);
  return keys.map((key, i) => u.teacher || firstOpen === -1 || i <= firstOpen); }

function homeButtons(){
  const b = el("button", { class: "tab trophy", "aria-label": "Steckbriefe nachschlagen", title: "Alle Steckbriefe nachschlagen" }, `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="9.5" r="5.8"/><path d="M13.8 13.8L19.5 19.5"/><path d="M7 8.2h5M7 10.8h3.4"/></svg>`);
  b.addEventListener("click", renderList); return [b]; }

function renderList(){
  const u = U(); u.view(false);
  u.bar("← Lernpfad", u.renderHome, "Mathe-Master", "Nachschlagen", u.themeSwitch());
  const main = el("main", { class: "nach" }); app().appendChild(main);
  main.appendChild(el("p", { class: "muted" }, "Hier stehen alle Steckbriefe mit Rechenbeispielen. Zum Wiederholen, wenn du bei einer Aufgabe hängst."));
  let any = false;
  u.okIds().forEach(id => { const k = u.getK(id); if (!k) return; any = true; const reach = reachable(k);
    const sec = el("section", {}); sec.appendChild(el("h3", {}, `<span class="nr">${k.nr}</span>${k.titel}`)); const grid = el("div", { class: "grid" });
    k.def.steckOrder.forEach((key, i) => { if (!reach[i]) return; const sb = k.def.steckbriefe[key]; const done = !!u.P.cards[u.cid(k, key)];
      const b = el("button", {}, `${T(sb.titel)}<small>${done ? "gelesen ✓" : "als Nächstes im Lernpfad"}</small>`);
      b.addEventListener("click", () => renderDetail(k, key)); grid.appendChild(b); });
    sec.appendChild(grid); main.appendChild(sec); });
  if (!any) main.appendChild(el("p", { class: "muted" }, "Noch kein Kapitel freigeschaltet.")); }

function renderDetail(k, key){
  const u = U(); u.view(true); const sb = k.def.steckbriefe[key];
  u.bar("← Nachschlagen", renderList, `Kapitel ${k.nr} · Steckbrief`, T(sb.titel), u.themeSwitch());
  const stage = el("div", { class: "fstage" }); app().appendChild(stage);
  const card = el("article", { class: "fcard" }); const tx = el("div", { class: "ftext" }), side = el("div", { class: "fside" }); card.append(tx, side); stage.appendChild(card);
  tx.appendChild(el("h3", {}, T(sb.titel)));
  if (sb.formel) tx.appendChild(el("div", { class: "formel" }, tex(sb.formel)));
  tx.appendChild(el("p", {}, T(sb.text)));
  if (sb.merke) tx.appendChild(el("p", { class: "merke" }, `<span class="tag">Merke</span><br>${T(sb.merke)}`));
  if (sb.falle) tx.appendChild(el("p", { class: "falle" }, `<span class="tag">Wichtig</span><br>${T(sb.falle)}`));
  /* Mit Grafik: Grafik rechts, Beispiele unter dem Text. Ohne Grafik: Beispiele rechts, so bleibt keine Hälfte leer. */
  if (sb.viz){ sb.viz(side); if (sb.beispiele && MM.Stepper) sb.beispiele.forEach(b => MM.Stepper.mount(tx, b)); }
  else if (sb.beispiele && sb.beispiele.length && MM.Stepper) sb.beispiele.forEach(b => MM.Stepper.mount(side, b));
  else card.classList.add("solo"); }

function open(kid, key){ const k = U().getK(kid); if (k && k.def.steckbriefe[key]) renderDetail(k, key); else renderList(); }

MM.Nachschlagen = { homeButtons, renderList, renderDetail, open, steckLite };
})();
