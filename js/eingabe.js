/* Mathe-Master · Eingabe-Aufgaben (V2)
   Einlesen von Zahlen und Termen (nachsichtig), Aufgabentypen mit Eingabefeld, offene Aufgaben,
   Heft-Aufgabe mit Selbstkontrolle und Schritt-für-Schritt-Beispiele für Steckbriefe.
   Gedacht für Tablet mit Hardware-Tastatur; ohne Tastatur erscheint die normale Bildschirmtastatur. */
(function(){
"use strict";
const MM = window.MM;
const { el, T, tex, tn, ts } = MM;

/* ---------- Einlesen ---------- */
function norm(s){
  return String(s == null ? "" : s).toLowerCase()
    .replace(/[\u2212\u2010-\u2015]/g, "-").replace(/[·⋅×∙]/g, "*").replace(/[÷:]/g, "/")
    .replace(/²/g, "^2").replace(/³/g, "^3").replace(/,/g, ".").replace(/\s+/g, ""); }
const stripName = s => s.replace(/^(?:[a-z]\d?\(x\)|[a-z]\d?)=/, "");

/* Rekursiver Parser: Zahlen, x, + - * / ^, Klammern, versteckte Mal-Zeichen (2x, 2(x+1), x(x+1)). */
function parse(src){
  const s = stripName(norm(src)); if (!s) return null; let i = 0;
  const peek = () => s[i];
  function atom(){
    const c = peek();
    if (c === "x"){ i++; return x => x; }
    if (c === "("){ i++; const e = expr(); if (peek() !== ")") throw 0; i++; return e; }
    const m = /^(?:\d+(?:\.\d+)?|\.\d+)/.exec(s.slice(i)); if (!m) throw 0; i += m[0].length; const v = parseFloat(m[0]); return () => v; }
  function power(){ let b = atom(); if (peek() === "^"){ i++; const e = unary(), bb = b; b = x => Math.pow(bb(x), e(x)); } return b; }
  function unary(){ const c = peek();
    if (c === "-"){ i++; const u = unary(); return x => -u(x); }
    if (c === "+"){ i++; return unary(); }
    return power(); }
  function term(){ let a = unary();
    for (;;){ const c = peek(), aa = a;
      if (c === "*"){ i++; const b = unary(); a = x => aa(x) * b(x); }
      else if (c === "/"){ i++; const b = unary(); a = x => aa(x) / b(x); }
      else if (c === undefined || c === "+" || c === "-" || c === ")") break;
      else if (/[\dx(.]/.test(c)){ const b = power(); a = x => aa(x) * b(x); }
      else throw 0; }
    return a; }
  function expr(){ let a = term();
    while (peek() === "+" || peek() === "-"){ const op = s[i++], b = term(), aa = a; a = op === "+" ? (x => aa(x) + b(x)) : (x => aa(x) - b(x)); }
    return a; }
  try { const fn = expr(); if (i !== s.length) return null; return { fn, s }; } catch (e){ return null; } }

function parseNum(raw){
  const s = stripName(norm(raw).replace(/[%°€]/g, "")); if (!s || /x/.test(s)) return NaN;
  const p = parse(s); if (!p) return NaN; const v = p.fn(0); return isFinite(v) ? v : NaN; }

const SAMPLES = [-4, -2, -1, 0, 0.5, 1, 2, 3, 7];
const near = (a, b) => isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-7 * (1 + Math.abs(a) + Math.abs(b));
const sameFn = (f, g) => SAMPLES.every(x => near(f(x), g(x)));
function linearOf(fn){ const b = fn(0), m = fn(1) - b; return SAMPLES.every(x => near(fn(x), m * x + b)) ? { m, b } : null; }
/* Hauptform m·x+b (Koeffizienten: Dezimalzahl, Bruch a/b, auch x/2) */
const NUM = "\\d+(?:\\.\\d+)?", FR = NUM + "(?:/" + NUM + ")?";
const HAUPT = new RegExp("^(?:[+-]?(?:" + FR + "\\*?)?x(?:/" + NUM + ")?(?:[+-]" + FR + ")?|[+-]?" + FR + ")$");
const HAUPT_B = new RegExp("^(?:[+-]?" + FR + ")?(?:[+-](?:" + FR + "\\*?)?x(?:/" + NUM + ")?)?$"); // b + m·x
function isHauptform(raw, order){ const s = stripName(norm(raw)); return HAUPT.test(s) || (order === "any" && /x/.test(s) && HAUPT_B.test(s)); }

/* ---------- Brüche: Bruchschreibweise hat Vorrang ---------- */
function fracOf(v){ if (!isFinite(v)) return null; for (let q = 1; q <= 200; q++){ const p = Math.round(v * q); if (Math.abs(v - p / q) < 1e-9) return { p, q }; } return null; }
function terminating(q){ while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1; }
/* true, wenn der genaue Wert ein Bruch ist, der sich nicht endlich als Dezimalzahl schreiben lässt (1/3, 2/3, 5/6 …) */
function needsFraction(v){ const f = fracOf(v); return !!f && f.q > 1 && !terminating(f.q); }
function bruchTex(v){ const f = fracOf(v); if (!f || f.q === 1) return tn(v); return (f.p < 0 ? "-" : "") + "\\frac{" + Math.abs(f.p) + "}{" + f.q + "}"; }
const usedFraction = raw => /\//.test(norm(raw));
const bruchHint = v => "Tipp: Gib das Ergebnis lieber als Bruch an, hier $" + bruchTex(v) + "$. Ein Bruch ist genau, eine Dezimalzahl nur gerundet.";

/* ---------- Bewertung ---------- */
function numOk(v, o){
  if (o.check) return !!o.check(v);
  if (o.round !== undefined) return Math.abs(v - o.answer) <= 0.5 * Math.pow(10, -o.round) + 1e-9;
  return Math.abs(v - o.answer) <= (o.tol || 0) + 1e-9 * (1 + Math.abs(o.answer)); }
/* Antwort -> {state:"leer"|"lesen"|"form"|"ok"|"nein", v, fb} */
function judgeNum(raw, o){
  if (!String(raw).trim()) return { state: "leer" };
  const v = parseNum(raw); if (!isFinite(v)) return { state: "lesen" };
  if (numOk(v, o)) return { state: "ok", v, bruch: o.answer !== undefined && needsFraction(o.answer) && !usedFraction(raw) };
  const w = (o.wrong || []).find(q => Math.abs(q.v - v) < 1e-6); return { state: "nein", v, fb: w && w.fb }; }
function judgeTerm(raw, o){
  if (!String(raw).trim()) return { state: "leer" };
  const p = parse(raw); if (!p || !/x/.test(stripName(norm(raw))) && o.needX !== false && !o.constOk) return { state: "lesen" };
  const fn = p.fn; if (!isFinite(fn(0)) || !isFinite(fn(1))) return { state: "lesen" };
  const eq = o.accept ? o.accept(fn, linearOf(fn)) : sameFn(fn, o.fn);
  if (!eq) return { state: "nein", fn };
  if (o.form === "haupt" && !isHauptform(raw, o.order)) return { state: "form", fn };
  return { state: "ok", fn }; }

const MSG = {
  leer: "Gib zuerst eine Antwort ein.",
  zahl: "Das kann ich nicht als Zahl lesen. Erlaubt sind zum Beispiel 2,5 oder −3 oder 2/3.",
  term: "Das kann ich nicht als Term lesen. Schreibe zum Beispiel 2x+3 oder −0,5x−1.",
  form: "Das ist gleichwertig, aber noch nicht in der Hauptform. Multipliziere aus und fasse zusammen, bis nur noch m·x + b dasteht." };

function inputEl(kind){ return el("input", { type: "text", inputmode: kind === "zahl" ? "decimal" : "text", autocomplete: "off", autocapitalize: "off", autocorrect: "off", spellcheck: "false", enterkeyhint: "done", "aria-label": kind === "zahl" ? "Antwort als Zahl" : "Antwort als Term" }); }
function focusLater(inp){ setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e){} }, 60); }
function setup(api, o){ let ctrl = null;
  if (o.viz) ctrl = o.viz(api); else if (o.sit) api.situation(T(o.sit), o.label);
  if (o.badge) api.badge(o.badge);
  api.prompt(T(o.q)); if (o.hint) api.hint(T(o.hint));
  return ctrl; }
const solZ = o => "$" + (o.solTex || (needsFraction(o.answer) ? bruchTex(o.answer) : tn(o.answer))) + "$" + (o.unit ? " " + T(o.unit) : "");

/* ---------- Zahleingabe ---------- */
// o: {sit|viz, q, answer, round?, tol?, check?, wrong:[{v,fb}], unit, lab (TeX vor dem Feld), solTex, erkl, hint, badge, heft}
function numInputTask(o){ return { run(api){
  const ctrl = setup(api, o);
  if (o.round !== undefined) api.hint(o.answer !== undefined && needsFraction(o.answer) ? "Gib das Ergebnis als Bruch an, zum Beispiel 2/3. Gerundet auf " + o.round + " Nachkommastellen gilt auch, ist aber nur die zweite Wahl." : "Runde auf " + (o.round === 0 ? "ganze Zahlen" : o.round + " Nachkommastellen") + ". Ein Bruch wie 2/3 ist auch erlaubt, wenn er genau stimmt.");
  const row = el("div", { class: "inrow" + (o.heft ? " heft" : "") }); if (o.lab) row.appendChild(el("span", { class: "inlab" }, tex(o.lab)));
  const inp = inputEl("zahl"); row.appendChild(inp); if (o.unit) row.appendChild(el("span", { class: "inunit" }, T(o.unit)));
  const msg = el("p", { class: "imsg", role: "status" }); api.body.append(row, msg);
  const chk = el("button", { class: "btn" }, "Prüfen"); api.actions.appendChild(chk); let done = false;
  const go = () => { if (done) return; const r = judgeNum(inp.value, o);
    if (r.state === "leer" || r.state === "lesen"){ msg.textContent = r.state === "leer" ? MSG.leer : MSG.zahl; return; }
    done = true; const ok = r.state === "ok"; inp.disabled = true; row.classList.add(ok ? "right" : "wrong"); msg.textContent = ""; api.actions.innerHTML = "";
    if (ctrl && ctrl.reveal) ctrl.reveal(ok);
    if (r.bruch){ msg.className = "imsg bruch"; msg.innerHTML = T(bruchHint(o.answer)); }
    api.feedback(ok, T((ok ? "" : (r.fb ? r.fb + " " : "") + "Richtig wäre: " + solZ(o) + ". ") + (o.erkl || ""))); api.finish(ok); };
  chk.addEventListener("click", go); inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); focusLater(inp);
}, spec: o }; }

/* ---------- Termeingabe ---------- */
// o: {q, fn (Zielfunktion) | accept(fn,{m,b}), prefix (TeX, z. B. "f(x)="), form:"haupt", order, solTex, erkl, ...}
function termInputTask(o){ return { run(api){
  const ctrl = setup(api, o);
  const row = el("div", { class: "inrow" + (o.heft ? " heft" : "") }); row.appendChild(el("span", { class: "inlab" }, tex(o.prefix || "f(x)=")));
  const inp = inputEl("term"); row.appendChild(inp);
  const msg = el("p", { class: "imsg", role: "status" }); api.body.append(row, msg);
  const chk = el("button", { class: "btn" }, "Prüfen"); api.actions.appendChild(chk); let done = false;
  const go = () => { if (done) return; const r = judgeTerm(inp.value, o);
    if (r.state === "leer" || r.state === "lesen" || r.state === "form"){ msg.textContent = r.state === "leer" ? MSG.leer : r.state === "form" ? MSG.form : MSG.term; return; }
    done = true; const ok = r.state === "ok"; inp.disabled = true; row.classList.add(ok ? "right" : "wrong"); msg.textContent = ""; api.actions.innerHTML = "";
    if (ctrl && ctrl.reveal) ctrl.reveal(ok);
    api.feedback(ok, T((ok ? "" : "Richtig wäre: $" + (o.solTex || "") + "$. ") + (o.erkl || ""))); api.finish(ok); };
  chk.addEventListener("click", go); inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); focusLater(inp);
}, spec: o }; }

/* ---------- Offene Aufgabe: mehrere verschiedene richtige Antworten ---------- */
// o: {q, n, kind:"term"|"zahl", valid(fn,{m,b}|v)->true/false/"Hinweistext", distinct:true, prefix, solTex, erkl}
function openTask(o){ return { run(api){
  const ctrl = setup(api, o); const kind = o.kind || "term", n = o.n || 3;
  api.hint("Es gibt viele richtige Lösungen. Finde " + n + " verschiedene.");
  const rows = [], box = el("div", { class: "openrows" });
  for (let k = 0; k < n; k++){ const row = el("div", { class: "inrow" + (o.heft ? " heft" : "") }); row.appendChild(el("span", { class: "inlab" }, k + 1 + ")" + (kind === "term" ? " " : "")));
    if (kind === "term") row.appendChild(el("span", { class: "inlab" }, tex(o.prefix || "f(x)=")));
    const inp = inputEl(kind); row.appendChild(inp); const m = el("span", { class: "imsg inl" }); row.appendChild(m); rows.push({ row, inp, m }); box.appendChild(row); }
  const msg = el("p", { class: "imsg", role: "status" }); api.body.append(box, msg);
  const chk = el("button", { class: "btn" }, "Prüfen"); api.actions.appendChild(chk); let done = false;
  const go = () => { if (done) return; const res = [];
    for (const r of rows){ const raw = r.inp.value.trim(); if (!raw){ msg.textContent = "Fülle alle " + n + " Felder aus."; return; }
      if (kind === "term"){ const p = parse(raw); if (!p || !isFinite(p.fn(0)) || !isFinite(p.fn(1))){ msg.textContent = MSG.term; return; } res.push({ fn: p.fn }); }
      else { const v = parseNum(raw); if (!isFinite(v)){ msg.textContent = MSG.zahl; return; } res.push({ v }); } }
    done = true; msg.textContent = ""; let allOk = true;
    res.forEach((q, k) => { const v = kind === "term" ? o.valid(q.fn, linearOf(q.fn)) : o.valid(q.v); q.ok = v === true; q.fb = typeof v === "string" ? v : "";
      const dup = o.distinct !== false && res.some((p, j) => j < k && (kind === "term" ? sameFn(p.fn, q.fn) : near(p.v, q.v)));
      if (dup){ q.ok = false; q.fb = "Diese Antwort hast du schon."; }
      rows[k].inp.disabled = true; rows[k].row.classList.add(q.ok ? "right" : "wrong"); rows[k].m.textContent = q.ok ? "✓" : "✗ " + q.fb; if (!q.ok) allOk = false; });
    api.actions.innerHTML = ""; if (ctrl && ctrl.reveal) ctrl.reveal(allOk);
    api.feedback(allOk, T((allOk ? "" : "Nicht alle Antworten passen. ") + (o.solTex ? "Ein Beispiel: $" + o.solTex + "$. " : "") + (o.erkl || ""))); api.finish(allOk); };
  chk.addEventListener("click", go); rows.forEach(r => r.inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); })); focusLater(rows[0].inp);
}, spec: o }; }

/* ---------- Heft-Aufgabe mit Selbstkontrolle ---------- */
// o: {sit, q, answer?, round?, unit, steps:[{w:"Ansatz", t:"Lösungszeile (TeX mit $…$)", p:1}], satz (Antwortsatz), erkl}
// api.finish(ok, {self:"r"|"t"|"n", pts, max}) – ok nur bei „richtig“.
function selfCheckTask(o){ return { run(api){
  const ctrl = setup(api, o); const steps = o.steps || [];
  const sheet = el("div", { class: "heft sheet" }, "<b>Löse die Aufgabe im Heft.</b> Schreibe deinen Lösungsweg so auf, wie du es in der Klassenarbeit tun würdest.");
  api.body.appendChild(sheet);
  let inp = null; const hasAns = o.answer !== undefined || o.check;
  if (hasAns){ const row = el("div", { class: "inrow" }); row.appendChild(el("span", { class: "inlab" }, o.lab ? tex(o.lab) : "Mein Ergebnis:")); inp = inputEl("zahl"); row.appendChild(inp); if (o.unit) row.appendChild(el("span", { class: "inunit" }, T(o.unit))); api.body.appendChild(row); focusLater(inp); }
  const msg = el("p", { class: "imsg", role: "status" }); api.body.appendChild(msg);
  const reveal = el("button", { class: "btn" }, "Lösungsweg aufdecken"); api.actions.appendChild(reveal); let shown = false;
  reveal.addEventListener("click", () => { if (shown) return;
    let res = null, bruch = false; if (inp && inp.value.trim()){ const v = parseNum(inp.value); if (!isFinite(v)){ msg.textContent = MSG.zahl; return; } res = numOk(v, o); bruch = res && o.answer !== undefined && needsFraction(o.answer) && !usedFraction(inp.value); inp.disabled = true; }
    shown = true; msg.textContent = ""; api.actions.innerHTML = ""; sheet.classList.add("open");
    const wrap = el("div", { class: "raster" }); wrap.appendChild(el("p", { class: "muted" }, "Vergleiche mit deinem Heft und hake ab, was du auch hattest."));
    if (res !== null) wrap.appendChild(el("p", { class: "erg " + (res ? "ok" : "bad") }, (res ? "✓ Dein Ergebnis stimmt." : "✗ Dein Ergebnis weicht ab.") + " Lösung: " + T(solZ(o))));
    else if (hasAns) wrap.appendChild(el("p", { class: "erg" }, "Lösung: " + T(solZ(o))));
    if (bruch) wrap.appendChild(el("p", { class: "imsg bruch" }, T(bruchHint(o.answer))));
    else if (hasAns && o.answer !== undefined && needsFraction(o.answer)) wrap.appendChild(el("p", { class: "imsg bruch" }, "Tipp: Brüche gibst du als Bruch an, nicht als gerundete Dezimalzahl."));
    let max = 0; const boxes = [];
    steps.forEach(st => { const p = st.p === undefined ? 1 : st.p; max += p; const lab = el("label", { class: "rstep" }); const cb = el("input", { type: "checkbox" }); boxes.push({ cb, p });
      lab.append(cb, el("span", {}, `<b>${T(st.w || "Schritt")}</b> <i>(${p} P.)</i><br>${T(st.t)}`)); wrap.appendChild(lab); });
    if (o.satz) wrap.appendChild(el("p", { class: "sat" }, "<b>Antwortsatz:</b> " + T(o.satz)));
    const pts = el("p", { class: "pts" }); const sugg = () => { const got = boxes.reduce((a, b) => a + (b.cb.checked ? b.p : 0), 0); pts.textContent = got + " von " + max + " Punkten abgehakt"; return got; };
    boxes.forEach(b => b.cb.addEventListener("change", sugg)); sugg(); wrap.appendChild(pts);
    wrap.appendChild(el("p", {}, "<b>Wie ist es dir gelungen?</b>"));
    const sb = el("div", { class: "selfbtns" }); wrap.appendChild(sb);
    [["r", "richtig gelöst"], ["t", "teilweise richtig"], ["n", "nicht gelöst"]].forEach(([c, t]) => { const b = el("button", { class: "btn ghost" }, t);
      b.addEventListener("click", () => { const got = sugg(); sb.querySelectorAll("button").forEach(x => x.disabled = true);
        const ok = c === "r"; api.feedback(ok, c === "r" ? T(o.erkl || "") : "Schau dir den Lösungsweg noch einmal an und finde die Stelle, an der dein Weg abweicht. " + T(o.erkl || ""), c === "r" ? "Gut eingeschätzt." : c === "t" ? "Fast." : "Das darf passieren."); api.finish(ok, { self: c, pts: got, max }); }); sb.appendChild(b); });
    api.body.appendChild(wrap); });
}, spec: o }; }

/* ---------- Schritt für Schritt (Beispiele in Steckbriefen) ---------- */
// b: {titel, aufgabe, steps:[ "TeX-Text" | {w,t} ], frei?:{typ:"zahl"|"term", q, answer|fn, round?, solTex, prefix, unit}}
// Mit frei fehlt der letzte Schritt: Die Schülerin oder der Schüler rechnet ihn selbst.
function mountStepper(host, b){
  const box = el("div", { class: "stepper" }); box.appendChild(el("span", { class: "eyebrow" }, T(b.titel || "Beispiel")));
  box.appendChild(el("p", { class: "sauf" }, T(b.aufgabe)));
  const list = el("ol", { class: "ssteps" }); box.appendChild(list);
  const total = b.steps.length, vis = b.frei ? total - 1 : total; let k = 0;
  const txt = s => typeof s === "string" ? T(s) : (s.w ? `<b>${T(s.w)}:</b> ` : "") + T(s.t);
  const ctl = el("div", { class: "sctl" }); box.appendChild(ctl);
  const next = el("button", { class: "btn ghost", type: "button" }, ""); ctl.appendChild(next);
  const addStep = idx => list.appendChild(el("li", { class: "sin" }, txt(b.steps[idx])));
  function upd(){ if (k < vis){ next.hidden = false; next.textContent = k ? `Nächster Schritt (${k + 1} von ${total})` : "Ersten Schritt zeigen"; }
    else { next.hidden = true; if (b.frei && !box._fr) freeBlock(); } }
  next.addEventListener("click", () => { if (k < vis){ addStep(k); k++; upd(); } });
  function freeBlock(){ box._fr = true; const f = b.frei, kind = f.typ || "zahl";
    const q = el("div", { class: "sfrei" }, `<p><b>Jetzt du:</b> ${T(f.q)}</p>`); const row = el("div", { class: "inrow" });
    if (kind === "term") row.appendChild(el("span", { class: "inlab" }, tex(f.prefix || "f(x)=")));
    const inp = inputEl(kind); row.appendChild(inp); if (f.unit) row.appendChild(el("span", { class: "inunit" }, T(f.unit)));
    const go = el("button", { class: "btn", type: "button" }, "Prüfen"); const msg = el("p", { class: "imsg", role: "status" }); q.append(row, go, msg); ctl.appendChild(q);
    let done = false;
    const chk = () => { if (done) return; const r = kind === "term" ? judgeTerm(inp.value, Object.assign({ form: "haupt" }, f)) : judgeNum(inp.value, f);
      if (r.state === "leer" || r.state === "lesen" || r.state === "form"){ msg.textContent = r.state === "leer" ? MSG.leer : r.state === "form" ? MSG.form : (kind === "term" ? MSG.term : MSG.zahl); return; }
      done = true; inp.disabled = true; go.remove(); const ok = r.state === "ok"; row.classList.add(ok ? "right" : "wrong");
      msg.innerHTML = ok ? "✓ Genau so." + (r.bruch ? " " + T(bruchHint(f.answer)) : "") : "✗ Nicht ganz. Hier ist der letzte Schritt:"; msg.className = "imsg " + (ok ? "ok" : "bad");
      addStep(total - 1); k = total; };
    go.addEventListener("click", chk); inp.addEventListener("keydown", e => { if (e.key === "Enter") chk(); }); }
  host.appendChild(box); upd(); return box; }

/* ---------- Schnittpunkt: zwei Felder ---------- */
// o: {q, ax, ay, round?, lab:"S", erkl, solTex?}
function pairInputTask(o){ return { run(api){
  const ctrl = setup(api, o);
  if (o.round !== undefined) api.hint("Runde auf " + o.round + " Nachkommastellen oder gib einen Bruch an, zum Beispiel 2/3.");
  const row = el("div", { class: "inrow" + (o.heft ? " heft" : "") });
  row.appendChild(el("span", { class: "inlab" }, tex(o.lab || "S") + "("));
  const ix = inputEl("zahl"), iy = inputEl("zahl"); ix.setAttribute("aria-label", "x-Koordinate"); iy.setAttribute("aria-label", "y-Koordinate");
  row.append(ix, el("span", { class: "inlab" }, "|"), iy, el("span", { class: "inlab" }, ")"));
  const msg = el("p", { class: "imsg", role: "status" }); api.body.append(row, msg);
  const chk = el("button", { class: "btn" }, "Prüfen"); api.actions.appendChild(chk); let done = false;
  const go = () => { if (done) return;
    const rx = judgeNum(ix.value, { answer: o.ax, round: o.round }), ry = judgeNum(iy.value, { answer: o.ay, round: o.round });
    if (rx.state === "leer" || ry.state === "leer"){ msg.textContent = "Fülle beide Felder aus."; return; }
    if (rx.state === "lesen" || ry.state === "lesen"){ msg.textContent = MSG.zahl; return; }
    done = true; const ok = rx.state === "ok" && ry.state === "ok"; ix.disabled = iy.disabled = true; row.classList.add(ok ? "right" : "wrong"); msg.textContent = ""; api.actions.innerHTML = "";
    if (ctrl && ctrl.reveal) ctrl.reveal(ok);
    const bruch = ok && ((rx.bruch) || (ry.bruch));
    if (bruch){ msg.className = "imsg bruch"; msg.innerHTML = T("Tipp: Gib Koordinaten lieber als Bruch an, zum Beispiel $" + bruchTex(rx.bruch ? o.ax : o.ay) + "$. Ein Bruch ist genau, eine Dezimalzahl nur gerundet."); }
    const sol = o.solTex || ("S(" + (needsFraction(o.ax) ? bruchTex(o.ax) : tn(o.ax)) + "|" + (needsFraction(o.ay) ? bruchTex(o.ay) : tn(o.ay)) + ")");
    api.feedback(ok, T((ok ? "" : (rx.state === "ok" ? "Die x-Koordinate stimmt. " : "") + "Richtig wäre: $" + sol + "$. ") + (o.erkl || ""))); api.finish(ok); };
  chk.addEventListener("click", go); [ix, iy].forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") go(); })); focusLater(ix);
}, spec: o }; }

/* ---------- Ungleichung: Relationszeichen und Grenze ---------- */
const FLIP = { "<": ">", "<=": ">=", ">": "<", ">=": "<=" };
const REL_TEX = { "<": "<", "<=": "\\le ", ">": ">", ">=": "\\ge " };
/* liest x>-1, x≥7, 3<x, L={x∈R|x>-1} und ]-1;∞[ */
function parseIneq(raw, v){
  v = (v || "x").toLowerCase();
  let s = String(raw == null ? "" : raw).toLowerCase().replace(/[\u2212\u2010-\u2015]/g, "-").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/=</g, "<=").replace(/=>/g, ">=").replace(/\s+/g, "").replace(/,/g, ".");
  if (s.indexOf("|") >= 0) s = s.slice(s.lastIndexOf("|") + 1).replace(/\}$/, "");
  s = s.replace(/^l=/, "");
  let m = /^([\]\[])(.+?);(.+?)([\]\[])$/.exec(s);
  if (m){ const inf = /^\+?(inf|∞)$/, ninf = /^-(inf|∞)$/;
    if (inf.test(m[3]) && !ninf.test(m[2])){ const b = parseNum(m[2]); return isFinite(b) ? { rel: m[1] === "[" ? ">=" : ">", v: b } : null; }
    if (ninf.test(m[2]) && !inf.test(m[3])){ const b = parseNum(m[3]); return isFinite(b) ? { rel: m[4] === "]" ? "<=" : "<", v: b } : null; }
    return null; }
  s = s.split(v).join("§");
  m = /^§(<=|>=|<|>)(.+)$/.exec(s); if (m){ if (m[2].indexOf("§") >= 0) return null; const b = parseNum(m[2]); return isFinite(b) ? { rel: m[1], v: b } : null; }
  m = /^(.+)(<=|>=|<|>)§$/.exec(s); if (m){ const b = parseNum(m[1]); return isFinite(b) ? { rel: FLIP[m[2]], v: b } : null; }
  return null; }
const bndTex = b => needsFraction(b) ? bruchTex(b) : tn(b);
const ineqTex = (rel, b, v) => (v || "x") + REL_TEX[rel] + bndTex(b);
function lsgTex(rel, b){ const B = bndTex(b), up = rel === ">" || rel === ">=", cl = rel.length === 2;
  const iv = up ? (cl ? "[" : "]") + B + ";\\infty[" : "]-\\infty;" + B + (cl ? "]" : "[");
  return "L=\\{x\\in\\R\\mid " + ineqTex(rel, b) + "\\}=" + iv; }
function judgeIneq(raw, o){
  if (!String(raw).trim()) return { state: "leer" };
  const r = parseIneq(raw, o.v); if (!r) return { state: "lesen" };
  const valOk = o.round !== undefined ? Math.abs(r.v - o.bound) <= 0.5 * Math.pow(10, -o.round) + 1e-9 : Math.abs(r.v - o.bound) <= 1e-9 * (1 + Math.abs(o.bound)), relOk = r.rel === o.rel;
  if (relOk && valOk) return { state: "ok", bruch: needsFraction(o.bound) && !usedFraction(raw) };
  let fb = "";
  if (valOk && r.rel === FLIP[o.rel]) fb = o.flip ? "Beim Multiplizieren oder Dividieren mit einer negativen Zahl muss das Ungleichheitszeichen umgedreht werden." : "Das Ungleichheitszeichen zeigt in die falsche Richtung. Prüfe mit einer Zahl.";
  else if (valOk && r.rel.replace("=", "") === o.rel.replace("=", "")) fb = "Prüfe, ob die Grenze selbst dazugehört: $\\le$ und $\\ge$ ja, $<$ und $>$ nein.";
  else if (!valOk && r.rel === FLIP[o.rel] && o.flip) fb = "Achte auf das Ungleichheitszeichen bei der Division durch eine negative Zahl.";
  return { state: "nein", fb }; }
// o: {q, rel:"<"|"<="|">"|">=", bound, v:"x", round?, flip?, erkl, hint}
function ineqInputTask(o){ return { run(api){
  const ctrl = setup(api, o);
  api.hint("Schreibe die Lösung zum Beispiel als " + (o.v || "x") + ">3 oder " + (o.v || "x") + "≤−1,5. Auch " + "L=]3;∞[ ist erlaubt.");
  const row = el("div", { class: "inrow" + (o.heft ? " heft" : "") }); row.appendChild(el("span", { class: "inlab" }, "Lösung:"));
  const inp = inputEl("term"); inp.setAttribute("aria-label", "Lösung als Ungleichung"); row.appendChild(inp);
  const msg = el("p", { class: "imsg", role: "status" }); api.body.append(row, msg);
  const chk = el("button", { class: "btn" }, "Prüfen"); api.actions.appendChild(chk); let done = false;
  const go = () => { if (done) return; const r = judgeIneq(inp.value, o);
    if (r.state === "leer" || r.state === "lesen"){ msg.textContent = r.state === "leer" ? MSG.leer : "Das kann ich nicht als Ungleichung lesen. Schreibe zum Beispiel x>3 oder x≤−1,5."; return; }
    done = true; const ok = r.state === "ok"; inp.disabled = true; row.classList.add(ok ? "right" : "wrong"); msg.textContent = ""; api.actions.innerHTML = "";
    if (ctrl && ctrl.reveal) ctrl.reveal(ok);
    if (r.bruch){ msg.className = "imsg bruch"; msg.innerHTML = T("Tipp: Gib die Grenze lieber als Bruch an, hier $" + bruchTex(o.bound) + "$. Ein Bruch ist genau, eine Dezimalzahl nur gerundet."); }
    api.feedback(ok, T((ok ? "" : (r.fb ? r.fb + " " : "") + "Richtig wäre: $" + ineqTex(o.rel, o.bound, o.v) + "$" + (o.v && o.v !== "x" ? "" : ", also $" + lsgTex(o.rel, o.bound) + "$") + ". ") + (o.erkl || ""))); api.finish(ok); };
  chk.addEventListener("click", go); inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); focusLater(inp);
}, spec: o }; }

MM.Eingabe = { parseIneq, judgeIneq, lsgTex, ineqTex, fr: (p, q) => bruchTex(p / q), fracOf, needsFraction, bruchTex, norm, parse, parseNum, sameFn, linearOf, isHauptform, judgeNum, judgeTerm, numOk };
MM.Stepper = { mount: mountStepper };
Object.assign(MM, { pairInputTask, ineqInputTask, numInputTask, termInputTask, openTask, selfCheckTask });
})();
