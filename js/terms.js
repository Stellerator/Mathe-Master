/* Mathe-Master · Terme, Mengen-Antworten, Generatoren */
(function(){
"use strict";
const MM = window.MM;
const {Sets,INF,tn,sg,one,ri,rand,shuffle,pick} = MM;

/* ---------- Term-Fabrik ----------
   Ein Term: {tex, fn, D, W, bad:[verbotene x], kind}
   W === null: Wertemenge nicht als einfache Menge darstellbar (wird nicht gefragt). */
const coef = a => a===1?"":a===-1?"-":tn(a);
function lin(){ const a=one([-3,-2,-1.5,-1,0.5,1,2,3]), b=one([-5,-4,-3,-2,-1,1,2,3,4,5,6]);
  return {kind:"lin",tex:`${coef(a)}x ${sg(b)}`,fn:x=>a*x+b,D:Sets.R(),W:Sets.R(),bad:[],a,b}; }
function sq(){ const c=one([-4,-3,-2,-1,1,2,3,4]);
  return {kind:"sq",tex:`x^2 ${sg(c)}`,fn:x=>x*x+c,D:Sets.R(),W:[MM.Sets.ray("ge",c)[0]],bad:[],c,krit:[0]}; }
function nsq(){ const c=one([1,2,3,4,5]);
  return {kind:"nsq",tex:`${c} - x^2`,fn:x=>c-x*x,D:Sets.R(),W:Sets.ray("le",c),bad:[],c,krit:[0]}; }
function inv(){ return {kind:"inv",tex:`\\frac{1}{x}`,fn:x=>1/x,D:Sets.without([0]),W:Sets.without([0]),bad:[0]}; }
function inva(){ const a=one([-3,-2,-1,1,2,3,4]);
  return {kind:"inva",tex:`\\frac{1}{x ${sg(-a)}}`,fn:x=>1/(x-a),D:Sets.without([a]),W:Sets.without([0]),bad:[a],a}; }
function invc(){ const c=one([-2,-1,1,2,3]);
  return {kind:"invc",tex:`\\frac{1}{x} ${sg(c)}`,fn:x=>1/x+c,D:Sets.without([0]),W:Sets.without([c]),bad:[0],c}; }
function inv2(){ return {kind:"inv2",tex:`\\frac{1}{x^2}`,fn:x=>1/(x*x),D:Sets.without([0]),W:Sets.ray("gt",0),bad:[0]}; }
function inv2m(){ const a=one([1,2,3]);
  return {kind:"inv2m",tex:`\\frac{1}{x^2 - ${a*a}}`,fn:x=>1/(x*x-a*a),D:Sets.without([-a,a]),W:null,bad:[-a,a],a}; }
function invsq1(){ return {kind:"invsq1",tex:`\\frac{1}{x^2+1}`,fn:x=>1/(x*x+1),D:Sets.R(),W:[MM.Sets.between(0,1,false,true)[0]],bad:[]}; }
function sqrtx(){ return {kind:"sqrt",tex:`\\sqrt{x}`,fn:x=>Math.sqrt(x),D:Sets.ray("ge",0),W:Sets.ray("ge",0),bad:[]}; }
function sqrta(){ const a=one([-3,-2,-1,1,2,3,4]);
  return {kind:"sqrta",tex:`\\sqrt{x ${sg(-a)}}`,fn:x=>Math.sqrt(x-a),D:Sets.ray("ge",a),W:Sets.ray("ge",0),bad:[],a,edge:a}; }
function sqrtc(){ const c=one([-3,-2,-1,1,2,3]);
  return {kind:"sqrtc",tex:`\\sqrt{x} ${sg(c)}`,fn:x=>Math.sqrt(x)+c,D:Sets.ray("ge",0),W:Sets.ray("ge",c),bad:[],c}; }
function msqrt(){ const c=one([1,2,3,4]);
  return {kind:"msqrt",tex:`${c} - \\sqrt{x}`,fn:x=>c-Math.sqrt(x),D:Sets.ray("ge",0),W:Sets.ray("le",c),bad:[],c}; }
function sqrtneg(){ const a=one([1,2,3,4]);
  return {kind:"sqrtneg",tex:`\\sqrt{${a} - x}`,fn:x=>Math.sqrt(a-x),D:Sets.ray("le",a),W:Sets.ray("ge",0),bad:[],a}; }
function invsqrt(){ return {kind:"invsqrt",tex:`\\frac{1}{\\sqrt{x}}`,fn:x=>1/Math.sqrt(x),D:Sets.ray("gt",0),W:Sets.ray("gt",0),bad:[0]}; }
function sqrtinv(){ return {kind:"sqrtinv",tex:`\\sqrt{x} + \\frac{1}{x}`,fn:x=>Math.sqrt(x)+1/x,D:Sets.ray("gt",0),W:null,bad:[0]}; }
function sqrtq(){ const a=one([1,2,3]);
  return {kind:"sqrtq",tex:`\\sqrt{x^2 + ${a}}`,fn:x=>Math.sqrt(x*x+a),D:Sets.R(),W:[Sets.ray("ge",Math.sqrt(a))[0]],bad:[],a,wtex:`[\\sqrt{${a}};\\infty[`}; }
function ratdiff(){ const a=one([1,2,3,4]);
  return {kind:"ratdiff",tex:`\\frac{x}{x ${sg(-a)}}`,fn:x=>x/(x-a),D:Sets.without([a]),W:null,bad:[a],a}; }

const F = {lin,sq,nsq,inv,inva,invc,inv2,inv2m,invsq1,sqrtx,sqrta,sqrtc,msqrt,sqrtneg,invsqrt,sqrtinv,ratdiff};
// Mengen von Familien nach Zweck
const FAM_D1 = ["lin","sq","inv","inva","sqrtx","sqrta"];                 // D, einfach
const FAM_D2 = ["inv","inva","sqrta","sqrtneg","inv2","sqrtinv","invsqrt","ratdiff","inv2m"];   // D, anspruchsvoller
const FAM_W1 = ["sq","nsq","sqrtx","inv","inv2"];                           // W, einfach
const FAM_W2 = ["sqrtc","msqrt","invc","inva","invsq1","sqrtneg"];  // W, anspruchsvoller
function term(fams){ return F[one(fams)](); }

/* ---------- Zahlenhelfer ---------- */
const nice = v => Math.abs(v-Math.round(v))<1e-9 ? String(Math.round(v)) : String(+v.toFixed(3));
function evalNice(t,x){ const y=t.fn(x); return isFinite(y)?y:NaN; }
function pickStelle(t,pool){ pool=(pool||[-3,-2,-1,0,1,2,3,4]).filter(x=>!(t.bad||[]).includes(x)&&Sets.has(t.D,x)); return one(pool); }
// Funktionswert als TeX: ganze Zahlen, sonst Bruch mit kleinem Nenner bevorzugt Dezimal
function valTex(y){ if(Math.abs(y-Math.round(y))<1e-9) return tn(Math.round(y));
  for(const q of [2,3,4,5,6,8,9,10]){ const p=y*q; if(Math.abs(p-Math.round(p))<1e-9){ const P=Math.round(p); return (P<0?"-":"")+`\\frac{${Math.abs(P)}}{${q}}`; } }
  return tn(+y.toFixed(3)); }
function valTextPlain(y){ return nice(y).replace(".",",").replace("-","−"); }

/* ---------- Antwortmengen mit typischen Fehlern ---------- */
// liefert Liste [{S|tex, fb}] falscher Mengen zu S (Vorzeichen, Rand, Ausnahmestelle)
function wrongSets(S, v, style){
  const mg=style==="menge"; S=Sets.norm(S); const out=[]; const add=(T,fb)=>{ if(T && !Sets.eq(T,S)) out.push({S:T,fb}); };
  const isR = S.length===1 && S[0].lo===-INF && S[0].hi===INF;
  const pts = S.length>=2 && S[0].lo===-INF && S[S.length-1].hi===INF ? S.slice(0,-1).map(i=>i.hi) : null;
  if(isR){ add(Sets.without([0]),"Hier wird keine Zahl ausgeschlossen. Prüfe: Gibt es eine verbotene Stelle?"); add(Sets.ray("gt",0),"Negative Zahlen dürfen eingesetzt werden."); add(Sets.ray("ge",0),"Auch negative Zahlen sind erlaubt."); add(Sets.without([1]),"Welche Zahl sollte verboten sein? Hier ist keine."); }
  else if(pts){ add(Sets.R(),"Es gibt verbotene Stellen. Sie dürfen nicht dabei sein."); add(Sets.without(pts.map(p=>-p)),"Vorzeichen: Die verbotene Stelle ist nicht "+"die Gegenzahl."); add(Sets.without([0]),"Nicht die 0 ist verboten, sondern die Stelle, bei der der Nenner null wird.");
    add(Sets.ray("gt",pts[0]),"ℝ\\{…} heißt: alle Zahlen außer … , nicht nur eine Seite."); add(Sets.without(pts.length>1?[pts[0]]:[pts[0]+1]),"Prüfe, bei welchem x der Nenner null wird."); }
  else if(S.length===1){ const i=S[0]; const e=isFinite(i.lo)?i.lo:i.hi; const lowRay=i.lo===-INF;
    const dir=lowRay?(i.ch?"le":"lt"):(i.cl?"ge":"gt");
    if(lowRay||i.hi===INF){
      add(Sets.ray(lowRay?(i.ch?"lt":"le"):(i.cl?"gt":"ge"),e),(mg?"Randpunkt: Gehört "+tn(e)+" dazu? Dann steht ≤ bzw. ≥ (mit Gleichheit), sonst < bzw. >.":"Randpunkt: Gehört "+tn(e)+" dazu? Dann eckige Klammer nach innen, sonst nach außen."));
      add(Sets.ray(lowRay?(i.ch?"ge":"gt"):(i.cl?"le":"lt"),e),"Falsche Richtung: Welche Zahlen sind erlaubt, die größeren oder die kleineren?");
      add(Sets.ray(dir,-e),"Vorzeichen der Randzahl prüfen.");
      add(Sets.without([e]),"ℝ\\{…} schließt nur eine einzelne Zahl aus, hier ist aber ein ganzer Bereich verboten.");
      add(Sets.R(),"Es sind nicht alle Zahlen erlaubt.");
    } else {
      add(Sets.between(i.lo,i.hi,!i.cl,i.ch),"Linker Rand: Gehört er dazu?"); add(Sets.between(i.lo,i.hi,i.cl,!i.ch),"Rechter Rand: Gehört er dazu?");
      add(Sets.between(-i.hi,-i.lo,i.ch,i.cl),"Vorzeichen prüfen."); add(Sets.R(),"Es ist ein beschränkter Bereich."); }
  }
  return out; }


/* Mengenschreibweise in Worten (für Erklärungen) */
function speak(S,v,pre){
  S=Sets.norm(S); v=v||"x"; const T=x=>MM.ts(x);
  if(S.length===1&&S[0].lo===-INF&&S[0].hi===INF) return "alle reellen Zahlen";
  if(S.length>=2&&S[0].lo===-INF&&S[S.length-1].hi===INF&&S.every((i,k)=>!i.cl&&!i.ch&&(k===0||S[k-1].hi===i.lo))) return "alle reellen Zahlen außer "+S.slice(0,-1).map(i=>T(i.hi)).join(" und ");
  if(S.length!==1) return "";
  const i=S[0]; const head="die Menge aller $"+v+"$ aus den reellen Zahlen, für die gilt: ";
  if(i.lo===0&&i.hi===INF&&!i.cl) return "alle positiven reellen Zahlen, also "+head+"$"+v+"$ ist größer als 0";
  if(i.lo===-INF) return head+"$"+v+"$ ist "+(i.ch?"kleiner oder gleich ":"kleiner als ")+T(i.hi);
  if(i.hi===INF) return head+"$"+v+"$ ist "+(i.cl?"größer oder gleich ":"größer als ")+T(i.lo);
  return head+"$"+v+"$ liegt zwischen "+T(i.lo)+" und "+T(i.hi)+" ("+T(i.lo)+(i.cl?" gehört dazu":" gehört nicht dazu")+", "+T(i.hi)+(i.ch?" gehört dazu":" gehört nicht dazu")+")"; }
/* Erklärsatz: gleiche Schreibweise wie die Antworten, die andere nur ausdrücklich gekennzeichnet */
function explainSet(S,v,name,style){
  const a=Sets.tex(S,style,v), other=style==="menge"?"intervall":"menge", b=Sets.tex(S,other,v);
  const ms=a.indexOf("\\mid")>=0||a==="\\Rp"; let s=" Also $"+name+"="+a+"$.";
  if(style==="menge"){ const w=speak(S,v); if(w&&ms) s+=" Gesprochen: "+w+"."; }
  return s; }

/* Antworten: {t, ok, fb}. style: "menge" | "intervall" | "mix". v: Variable.
   Zwei Distraktoren dürfen Schreibfehler sein (extra TeX). */
function setOptions(S, style, v, opt){
  opt=opt||{}; const st=style==="mix"?one(["menge","intervall"]):style;
  const ok={t:"$"+(opt.prefix||"")+Sets.tex(S,st,v)+"$",ok:true};
  const wrongs=shuffle(wrongSets(S,v,st)).filter(w=>Sets.tex(w.S,"intervall",v)); const used=new Set([ok.t]); const outs=[ok];
  const need=opt.n||4;
  for(const w of wrongs){ if(outs.length>=need) break; const t="$"+(opt.prefix||"")+Sets.tex(w.S,st,v)+"$"; if(used.has(t)) continue; used.add(t); outs.push({t,fb:w.fb}); }
  outs.style=st; return outs; }

/* ---------- Funktionswerte: Distraktoren ---------- */
function valueOptions(t, x0, ytrue){
  const alts=[]; const add=(y,fb)=>{ if(isFinite(y)&&Math.abs(y-ytrue)>1e-9&&!alts.some(a=>Math.abs(a.y-y)<1e-9)) alts.push({y,fb}); };
  if(t.kind==="lin"){ add(-t.a*x0+t.b,"Vorzeichenfehler beim Einsetzen."); add(t.a*x0-t.b,"Das + oder − vor der Zahl gehört mit zum Term."); add(t.a+x0+t.b,"Zwischen "+tn(t.a)+" und x steht ein Malpunkt, kein Plus."); add(t.a*x0,"Der Rest des Terms fehlt."); add(x0+t.b,"Der Faktor vor dem x fehlt."); }
  else if(t.kind==="sq"){ add(-x0*x0+t.c,"Quadrieren erst, dann das Vorzeichen: x² ist nie negativ."); add(2*x0+t.c,"x² heißt x · x, nicht 2 · x."); add(x0*x0-t.c,"Das Vorzeichen von "+tn(Math.abs(t.c))+" gehört zum Term."); add(x0*x0,"Der Rest des Terms fehlt."); }
  else if(t.kind==="nsq"){ add((t.c-x0)**2,"Erst quadrieren, dann abziehen."); add(t.c+x0*x0,"Das Minus gehört zum Term."); add(t.c-2*x0,"x² heißt x · x, nicht 2 · x."); add(-x0*x0,"Der Anfang des Terms fehlt."); }
  else if(t.kind==="inv"){ add(-1/x0,"Der Kehrwert von x, nicht der negative."); add(x0,"1/x ist der Kehrwert, nicht x selbst."); add(1/Math.abs(x0)*(x0<0?1:-1),"Das Vorzeichen bleibt beim Kehrwert erhalten."); add(1+x0,"Der Bruch bedeutet 1 geteilt durch x."); }
  else if(t.kind==="inva"){ add(1/(x0+t.a),"Im Nenner steht x minus "+tn(t.a)+", nicht plus."); add(1/x0-t.a,"Der Nenner ist x − "+tn(t.a)+" als Ganzes."); add(1/x0,"Der Teil im Nenner fehlt."); }
  else if(t.kind==="sqrt"||t.kind==="sqrta"||t.kind==="sqrtc"){ add(ytrue*ytrue,"Wurzel ziehen, nicht quadrieren."); add(ytrue/2,"Wurzelziehen ist nicht Halbieren."); add(-ytrue,"Die Wurzel ist nie negativ."); }
  // Ersatz, falls zu wenige
  let k=1; while(alts.length<4&&k<60){ add(ytrue+k*(k%2?1:-1)*(Math.abs(ytrue)>5?2:1),"Rechne noch einmal Schritt für Schritt."); k++; }
  return alts; }

MM.Terms = {F,term,FAM_D1,FAM_D2,FAM_W1,FAM_W2,nice,pickStelle,valTex,valTextPlain,wrongSets,speak,explainSet,setOptions,valueOptions,coef};
})();
