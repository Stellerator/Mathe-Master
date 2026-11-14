/* Kapitel 1 · Der Begriff der Funktion (LS Kap. 1 · Abschnitt 2 · S. 11–14) */
(function(){
"use strict";
const MM=window.MM, S=String.raw;
const {el,shuffle,one,pick,rand,ri,T,tex,tn,Sets,INF,Terms,PRO_LEVEL}=MM;
const R_=S`\R`;

/* ======================= Bilder für die Steckbriefe ======================= */

function vizPfeile(side){
  const seg=el("div",{class:"seg"}); const stage=el("div",{style:"flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px"}); const msg=el("div",{class:"feedback info"});
  side.append(seg,stage,msg);
  const arrows=(n,svg,m)=>({name:n,mount(){ stage.innerHTML=svg(); msg.innerHTML=m; }});
  const graph=(n,key)=>({name:n,mount(){ stage.innerHTML=""; const host=MM.mkcv(stage,""); host.style.width="100%"; msg.innerHTML="Ziehe die orange Senkrechte über das Bild."; MM.vlineView(host,MM.REL[key],{x0:-4,free:true,onChange:(h)=>{ msg.innerHTML=`Treffer auf der Senkrechten: <strong>${h.length}</strong>. `+(MM.REL[key].isF?"Höchstens ein Treffer: eine Funktion.":"Manchmal zwei Treffer: keine Funktion."); }}); }});
  const modes=[
    arrows("Uhrzeit → Temperatur",()=>MM.pairsSvg(["6","12","18"],["11","19"],[[0,0],[1,1],[2,1]],{id:1,hl1:"Uhrzeit (h)",hl2:"Temp. (°C)"}),"<b>Eine Funktion.</b> Von jeder Uhrzeit geht genau ein Pfeil aus. Dass 12 Uhr und 18 Uhr dieselbe Temperatur haben, stört nicht."),
    arrows("Temperatur → Uhrzeit",()=>MM.pairsSvg(["11","19"],["6","12","18"],[[0,0],[1,1],[1,2]],{id:2,hl1:"Temp. (°C)",hl2:"Uhrzeit (h)",bad:[1,2]}),"<b>Keine Funktion.</b> Von der Temperatur 19 gehen zwei Pfeile aus. Ein Eingang mit zwei Ausgängen ist nicht eindeutig."),
    graph("Graph: Parabel","par"), graph("Graph: Kreis","circ")];
  modes.forEach((md,i)=>{ const b=el("button",{"aria-pressed":"false"},md.name); b.addEventListener("click",()=>{ MM.cleanup(); [...seg.children].forEach(x=>x.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); md.mount(); }); seg.appendChild(b); });
  seg.children[0].click(); }

function vizMaschine(side){
  const wrap=el("div",{style:"flex:1;display:flex;flex-direction:column;justify-content:center;gap:10px"}); side.appendChild(wrap);
  const t={tex:"1{,}5x+10",fn:x=>1.5*x+10,D:Sets.R(),bad:[]};
  MM.machine(wrap,t,[0,10,20,40,60]); }

function vizStelle(side){
  const f=x=>0.5*x+1; const state={mode:"wert",v:4};
  const host=MM.mkcv(side,""); const seg=el("div",{class:"seg"}); const vals=el("div",{class:"seg"}); const msg=el("div",{class:"feedback info"});
  side.append(seg,vals,msg);
  const cvw=MM.canvasView(host,(st,col)=>{ const reads=state.mode==="wert"?[{x:state.v,y:f(state.v)}]:[{x:2*(state.v-1),y:state.v}];
    MM.plot(st,col,{xr:[-2,11],yr:[-2,7],fn:f,reads,step:1,free:true}); });
  const upd=()=>{ cvw.redraw(); if(state.mode==="wert"){ const y=f(state.v); msg.innerHTML=T(`Stelle <strong>${state.v}</strong> gegeben: Funktionswert $f(${state.v})=${tn(y)}$. Du gehst von der x-Achse hoch zur Kurve und dann nach links.`); }
    else { const x=2*(state.v-1); msg.innerHTML=T(`Wert <strong>${state.v}</strong> gegeben: $f(x)=${state.v}$ gilt bei der Stelle $x=${tn(x)}$. Du gehst von der y-Achse nach rechts zur Kurve und dann nach unten.`); } };
  const fillVals=()=>{ vals.innerHTML=""; const arr=state.mode==="wert"?[1,2,4,6,8]:[2,3,4,5]; if(!arr.includes(state.v)) state.v=arr[2];
    arr.forEach(v=>{ const b=el("button",{"aria-pressed":String(v===state.v)},(state.mode==="wert"?"x = ":"y = ")+v); b.addEventListener("click",()=>{ state.v=v; [...vals.children].forEach(c=>c.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); upd(); }); vals.appendChild(b); }); };
  [["wert","Wert an der Stelle"],["stelle","Stelle zu einem Wert"]].forEach(([m,n])=>{ const b=el("button",{"aria-pressed":String(m===state.mode)},n); b.addEventListener("click",()=>{ state.mode=m; [...seg.children].forEach(c=>c.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); fillVals(); upd(); }); seg.appendChild(b); });
  fillVals(); upd(); }

const DW_BSP=[
  {name:"x²−2", tex:S`f(x)=x^2-2`, fn:x=>x*x-2, D:Sets.R(), W:Sets.ray("ge",-2), dT:S`D=\R`, wT:S`W=[-2;\infty[\;=\{y\in\R\mid y\ge -2\}`},
  {name:"1/x²", tex:S`f(x)=\frac{1}{x^2}`, fn:x=>1/(x*x), D:Sets.without([0]), W:Sets.ray("gt",0), dT:S`D=\R\setminus\{0\}`, wT:S`W=\R^{+}=]0;\infty[`},
  {name:"√x", tex:S`f(x)=\sqrt{x}`, fn:x=>Math.sqrt(x), D:Sets.ray("ge",0), W:Sets.ray("ge",0), dT:S`D=[0;\infty[\;=\{x\in\R\mid x\ge 0\}`, wT:S`W=[0;\infty[`}
];
function vizDW(side){
  const state={i:0,a:0}; const host=MM.mkcv(side,""); const seg=el("div",{class:"seg"}); const msg=el("div",{class:"feedback info",style:"font-size:17px"});
  side.append(seg,msg); let raf=0;
  const cvw=MM.canvasView(host,(st,col)=>{ const b=DW_BSP[state.i]; const dots=[]; b.D.forEach(i=>{ if(isFinite(i.lo)&&i.cl) dots.push({x:i.lo,y:b.fn(i.lo),closed:true}); });
    MM.plot(st,col,{xr:[-6,6],yr:[-3,5],fn:b.fn,dom:b.D,dots,shadowD:b.D,shadowW:b.W,shadowA:state.a,step:1,free:true}); });
  const play=()=>{ cancelAnimationFrame(raf); state.a=0; const t0=performance.now(); const step=n=>{ state.a=Math.min(1,(n-t0)/900); cvw.redraw(); if(state.a<1) raf=requestAnimationFrame(step); }; raf=requestAnimationFrame(step); MM.cleanups.push(()=>cancelAnimationFrame(raf)); };
  DW_BSP.forEach((b,i)=>{ const bt=el("button",{"aria-pressed":String(i===0)},T("$"+b.tex+"$")); bt.addEventListener("click",()=>{ state.i=i; [...seg.children].forEach(c=>c.setAttribute("aria-pressed","false")); bt.setAttribute("aria-pressed","true"); setMsg(); play(); }); seg.appendChild(bt); });
  const setMsg=()=>{ const b=DW_BSP[state.i]; msg.innerHTML=`<span style="color:var(--ok);font-weight:700">grün: D auf der x-Achse</span> &nbsp; <span style="color:var(--mark);font-weight:700">orange: W auf der y-Achse</span><br>${tex(b.dT)}<br>${tex(b.wT)}`; };
  setMsg(); play(); }

/* ======================= Steckbriefe ======================= */
const steckbriefe={
  funktion:{titel:"Funktion = eindeutige Zuordnung", buch:"S. 11 Einstieg · S. 13 A1",
    text:S`Eine Zuordnung ordnet jedem Eingabewert einen Ausgabewert zu. Zur Uhrzeit gehört genau eine Temperatur: Das ist eindeutig. Umgekehrt kann es zu mehreren Uhrzeiten gleich warm sein: Das ist nicht eindeutig. Eindeutige Zuordnungen heißen Funktionen.`,
    merke:S`Funktion: Jedem $x$ gehört genau ein $y$. Im Graphen trifft jede Senkrechte die Kurve höchstens einmal.`,
    viz:vizPfeile,
    check:{q:"Welche Zuordnung ist eine Funktion?",
      o:["Person → Geburtsdatum","Geburtsdatum → Person","Vorname → Person"],
      h:"Frage dich: Hat jede Eingabe genau eine Ausgabe?",
      e:"Jede Person hat genau ein Geburtsdatum. Umgekehrt haben an einem Tag oft mehrere Personen Geburtstag."}},
  term:{titel:"f(x): Term und Gleichung", buch:"S. 11 unten · S. 12 Merkkasten",
    text:S`Eine Funktion bekommt einen Namen, meist $f$. Der Rechenausdruck heißt Funktionsterm, zum Beispiel $1{,}5x+10$. Mit Namen wird daraus die Funktionsgleichung. Eine zweite Schreibweise nutzt den Zuordnungspfeil: $f\colon x\mapsto 1{,}5x+10$. Das spricht man: „f ordnet x die Zahl 1,5x plus 10 zu“.`,
    formel:S`f(x)=1{,}5x+10`,
    merke:S`$f(x)$ liest du „f von x“. Das ist der Funktionswert an der Stelle $x$, nicht „f mal x“.`,
    viz:vizMaschine,
    check:{q:S`Es ist $f(x)=2x+1$. Wie sprichst du $f(3)$?`,
      o:["„f von 3“","„f mal 3“","„f plus 3“"],
      h:"Die Klammer gehört zum Funktionsnamen, sie ist kein Malzeichen.",
      e:S`$f(3)$ heißt „f von 3“. Das ist der Funktionswert an der Stelle 3: $f(3)=2\cdot 3+1=7$.`}},
  stelle:{titel:"Wert an der Stelle, Stelle zum Wert", buch:"S. 12 Beispiel 1 a) · S. 14 A11",
    text:S`Zwei Fragen, zwei Richtungen. <b>Wert an der Stelle:</b> $x$ ist gegeben, $y=f(x)$ ist gesucht. Du setzt ein. <b>Stelle zum Wert:</b> $y$ ist gegeben, $x$ ist gesucht. Du löst eine Gleichung. Im Graphen liest du beides mit gestrichelten Linien ab.`,
    merke:S`In der Klammer steht die Stelle (Eingang). Hinter dem Gleichheitszeichen steht der Funktionswert (Ausgang).`,
    viz:vizStelle,
    check:{q:S`Für $f(x)=2x+3$ gilt $f(5)=13$. Was bedeutet das?`,
      o:["An der Stelle 5 hat f den Funktionswert 13.","An der Stelle 13 hat f den Funktionswert 5.","f mal 5 ergibt 13."],
      h:"Was steht in der Klammer, Eingang oder Ausgang?",
      e:S`Die 5 steht in der Klammer, sie ist die Stelle. Die 13 ist der Funktionswert dort: $2\cdot 5+3=13$.`}},
  dw:{titel:"Definitionsmenge und Wertemenge", buch:"S. 11 unten · S. 12 Merkkasten und Beispiel 1 c)",
    text:S`Die Definitionsmenge $D$ enthält alle Zahlen, die du für $x$ einsetzen darfst. Die Wertemenge $W$ enthält alle Funktionswerte, die dabei herauskommen. Der Graph $K_f$ besteht aus allen Punkten $P(x\,|\,f(x))$. An der x-Achse siehst du $D$, an der y-Achse $W$. <b>So sprichst du die Mengenschreibweise:</b> $\{y\in\R\mid y\ge 0\}$ liest du „die Menge aller $y$ aus den reellen Zahlen, für die gilt: $y$ ist größer oder gleich 0“. Dieselbe Menge als Intervall: $[0;\infty[$.`,
    merke:S`Bei einem Bruch darf der Nenner nicht 0 werden. Unter einer Wurzel darf nichts Negatives stehen.`,
    viz:vizDW,
    check:{q:S`Für $f(x)=\frac{1}{x}$: Welche Definitionsmenge stimmt?`,
      o:[S`$D=\R\setminus\{0\}$`,S`$D=\R$`,S`$D=\R^{+}$`],
      h:"Welche Zahl macht den Nenner zu 0?",
      e:S`Durch 0 darf man nicht teilen. Alle anderen Zahlen sind erlaubt, also $D=\R\setminus\{0\}$. Auch negative Zahlen gehören dazu.`}}
};

/* ======================= Challenge 1: Wert und Stelle ======================= */
function substTex(t,x0){ const v=x0<0?`(${tn(x0)})`:tn(x0); return t.tex.replace(/([0-9}])x/g,"$1\\cdot x").replace(/x/g,v); }
function valueTask(){
  const t=Terms.term(["lin","lin","sq","nsq","inv","inva","sqrtx","sqrta"]);
  let x0;
  if(t.kind==="sqrt") x0=one([0,1,4,9,16]); else if(t.kind==="sqrta") x0=t.a+one([0,1,4,9]);
  else if(t.kind==="inv") x0=one([-4,-2,-1,1,2,4,5]); else if(t.kind==="inva") x0=t.a+one([-3,-2,-1,1,2,3,4]);
  else x0=one([-4,-3,-2,-1,0,1,2,3,4,5]);
  if(t.kind==="inva"&&x0===t.a) x0=t.a+1;
  const y=t.fn(x0); if(!isFinite(y)) return valueTask();
  const alts=Terms.valueOptions(t,x0,y); const picks=shuffle(alts).slice(0,3);
  const opts=[{t:"$"+Terms.valTex(y)+"$",ok:true}].concat(picks.map(a=>({t:"$"+Terms.valTex(a.y)+"$",fb:a.fb})));
  const uniq=new Set(opts.map(o=>o.t)); if(uniq.size<4) return valueTask();
  return MM.mcTask({label:"Funktion",sit:S`<span class="bigtex">$f(x)=${t.tex}$</span>`,q:S`Berechne $f(${tn(x0)})$.`,opts,
    erkl:S`Setze $${tn(x0)}$ für $x$ ein: $f(${tn(x0)})=${substTex(t,x0)}=${Terms.valTex(y)}$.`}); }

function stelleTask(){
  const a=one([-3,-2,2,3,4,0.5]), b=one([-5,-3,-2,1,2,4,6]), x0=one([-4,-3,-2,-1,1,2,3,4,5]); if(a===0.5&&x0%2) return stelleTask();
  const y0=a*x0+b; const cand=[[x0,null],[y0,"Gesucht ist die Stelle x, nicht der Funktionswert."],[(y0+b)/a,"Das "+(b>0?"+":"−")+MM.ts(Math.abs(b))+" wird beim Umformen zur Gegenzahl: Rechne auf beiden Seiten "+(b>0?"−":"+")+MM.ts(Math.abs(b))+"."],[(y0-b)*a,"Zum Schluss durch den Faktor vor dem x teilen, nicht malnehmen."],[-x0,"Vorzeichen prüfen: Setze deine Zahl in den Term ein."],[y0-b,"Es fehlt noch die Division durch "+tn(a)+"."]];
  const seen=new Set([x0]); const wr=[]; for(const [v,fb] of shuffle(cand.slice(1))){ if(Number.isFinite(v)&&!seen.has(v)&&Math.abs(v)<60){ seen.add(v); wr.push({t:S`$x=${tn(v)}$`,fb}); } if(wr.length===3) break; }
  if(wr.length<3) return stelleTask();
  const term=`${Terms.coef(a)}x ${MM.sg(b)}`;
  return MM.mcTask({label:"Funktion",sit:S`<span class="bigtex">$f(x)=${term}$</span>`,q:S`Für welche Stelle $x$ gilt $f(x)=${tn(y0)}$?`,opts:[{t:S`$x=${tn(x0)}$`,ok:true}].concat(wr),
    hint:"Setze den Term gleich dem Funktionswert und löse die Gleichung.",
    erkl:S`$${term}=${tn(y0)}$ ergibt $x=${tn(x0)}$. Probe: $f(${tn(x0)})=${tn(y0)}$.`}); }

const GRAPHS=[
  {fn:x=>0.5*x*x-2, tex:S`\tfrac12x^2-2`, doms:[-4,4]},
  {fn:x=>-0.5*x*x+3.5, tex:S`-\tfrac12x^2+3{,}5`, doms:[-4,4]},
  {fn:x=>Math.abs(x)-1, tex:S`|x|-1`, doms:[-5,5]},
  {fn:x=>-x+2, tex:S`-x+2`, doms:[-4,6]}
];
function graphReadTask(){
  const G=one(GRAPHS), f=G.fn; const lo=G.doms[0], hi=G.doms[1];
  const xs=[]; for(let x=-4;x<=4;x++){ const y=f(x); if(Math.abs(y)<=4.5) xs.push(x); }
  const type=one(["read","read","solve"]);
  const draw=(reads,dots)=>(st,col)=>MM.plot(st,col,{xr:[-6,6],yr:[-4,5],fn:f,dom:Sets.between(lo,hi,true,true),reads:reads||[],dots:[{x:lo,y:f(lo),closed:true},{x:hi,y:f(hi),closed:true}].concat(dots||[]),step:1});
  if(type==="read"){
    const x0=one(xs.filter(x=>x!==0)); const y=f(x0); const wrongs=new Map(); const add=(v,fb)=>{ if(v!==y&&!wrongs.has(v)&&Math.abs(v)<12) wrongs.set(v,fb); };
    add(f(-x0),"Das ist der Funktionswert an der Stelle "+MM.ts(-x0)+", nicht an der Stelle "+MM.ts(x0)+"."); add(x0,"Das ist die Stelle selbst, gesucht ist der y-Wert."); add(y+1,"Zu hoch abgelesen: Zähle die Kästchen noch einmal."); add(y-1,"Zu tief abgelesen."); add(-y,"Prüfe das Vorzeichen: Liegt der Punkt über oder unter der x-Achse?"); add(f(x0+1),"Du hast eine Stelle daneben abgelesen.");
    const picks=[...wrongs.entries()].slice(0,3); if(picks.length<3) return graphReadTask();
    return MM.mcTask({viz:api=>{ const host=api.cv(""); const st={reads:null}; const cvw=MM.canvasView(host,(s,c)=>draw(st.reads?[{x:x0,y}]:[],[])(s,c)); return {reveal(){ st.reads=1; cvw.redraw(); }}; },
      q:S`Lies den Funktionswert $f(${tn(x0)})$ am Graphen ab.`,
      opts:[{t:"$"+tn(y)+"$",ok:true}].concat(picks.map(([v,fb])=>({t:"$"+tn(v)+"$",fb}))),
      erkl:S`Von $x=${tn(x0)}$ senkrecht zur Kurve, dann waagerecht zur y-Achse: $f(${tn(x0)})=${tn(y)}$.`});
  }
  // Stelle(n) zu einem Wert
  const cands=[]; for(let y=-3;y<=4;y+=0.5){ const sol=[]; for(let x=lo;x<=hi;x+=0.5){ if(Math.abs(f(x)-y)<1e-9) sol.push(x); } if(sol.length>=1&&sol.length<=2) cands.push({y,sol}); }
  const pk=one(cands); const sol=pk.sol; const solT=sol.length===1?S`$x=${tn(sol[0])}$`:S`$x=${tn(sol[0])}$ und $x=${tn(sol[1])}$`;
  const mk=arr=>arr.length===1?S`$x=${tn(arr[0])}$`:S`$x=${tn(arr[0])}$ und $x=${tn(arr[1])}$`;
  const wrongs=[]; const addW=(arr,fb)=>{ const t=mk(arr); if(t!==solT&&!wrongs.some(w=>w.t===t)) wrongs.push({t,fb}); };
  if(sol.length===2){ addW([sol[1]],"Bei dieser Höhe schneidet die waagerechte Gerade den Graphen zweimal. Beide Stellen gehören dazu."); addW([sol[0]],"Es gibt noch eine zweite Stelle mit demselben Funktionswert."); addW(sol.map(v=>v+1),"Zähle die Stellen noch einmal an der x-Achse ab."); addW([pk.y],"Das ist der Funktionswert, gesucht sind die Stellen."); }
  else { addW([pk.y],"Das ist der Funktionswert, gesucht ist die Stelle."); addW([-sol[0]],"Prüfe das Vorzeichen der Stelle."); addW([sol[0]+1],"Eine Stelle daneben abgelesen."); addW([sol[0]-1],"Eine Stelle daneben abgelesen."); addW([sol[0],-sol[0]],"Hier schneidet die Gerade den Graphen nur einmal."); }
  if(wrongs.length<3) return graphReadTask();
  return MM.mcTask({viz:api=>{ const host=api.cv(""); const st={on:false}; const cvw=MM.canvasView(host,(s,c)=>{ const pts=st.on?sol.map(x=>({x,y:pk.y})):[]; draw(pts,[])(s,c); }); return {reveal(){ st.on=true; cvw.redraw(); }}; },
    q:S`Für welche Stellen gilt $f(x)=${tn(pk.y)}$? Lies am Graphen ab.`,
    opts:[{t:solT,ok:true}].concat(shuffle(wrongs).slice(0,3)),
    erkl:S`Die waagerechte Gerade auf Höhe ${MM.ts(pk.y)} trifft den Graphen bei ${solT}.`}); }

// Sprach-Bank: Wort ↔ Symbol
const SPRACHE=[
  {w:"Der Funktionswert von f an der Stelle 5 ist 7.",t:S`f(5)=7`,wr:[
    {t:S`f(7)=5`,w:"Der Funktionswert von f an der Stelle 7 ist 5.",fb:"Die Stelle steht in der Klammer, der Funktionswert hinter dem Gleichheitszeichen."},
    {t:S`f\cdot 5=7`,w:"f mal 5 ergibt 7.",fb:"f(5) ist kein Produkt."},
    {t:S`f(x)=5\cdot 7`,w:"Der Funktionsterm von f ist 5 mal 7.",fb:"Hier geht es um einen einzelnen Wert an einer Stelle."}]},
  {w:"Der Wert der Funktion g an der Stelle −2 ist 7.",t:S`g(-2)=7`,wr:[
    {t:S`g(7)=-2`,w:"Der Wert von g an der Stelle 7 ist −2.",fb:"Stelle und Wert sind vertauscht."},
    {t:S`g(2)=-7`,w:"Der Wert von g an der Stelle 2 ist −7.",fb:"Das Vorzeichen gehört zur Stelle −2."},
    {t:S`g(-2)=-7`,w:"Der Wert von g an der Stelle −2 ist −7.",fb:"Der Funktionswert ist +7."}]},
  {w:"Die Funktion g ordnet jeder Zahl ihr Doppeltes zu.",t:S`g(x)=2x`,wr:[
    {t:S`g(x)=x+2`,w:"Die Funktion g ordnet jeder Zahl die um 2 größere Zahl zu.",fb:"Das Doppelte ist 2 · x, nicht x + 2."},
    {t:S`g(x)=x^2`,w:"Die Funktion g ordnet jeder Zahl ihr Quadrat zu.",fb:"Das Quadrat ist x · x, nicht das Doppelte."},
    {t:S`g(2)=x`,w:"Der Funktionswert von g an der Stelle 2 ist x.",fb:"Gemeint ist eine Vorschrift für jede Zahl x, nicht für die Stelle 2."}]},
  {w:"Die Funktion f ordnet jeder Zahl einen Wert zu, der 4 weniger als ihr Quadrat ist.",t:S`f(x)=x^2-4`,wr:[
    {t:S`f(x)=4-x^2`,w:"Die Funktion f ordnet jeder Zahl die Differenz aus 4 und ihrem Quadrat zu.",fb:"Hier steht 4 minus das Quadrat, die Reihenfolge ist anders."},
    {t:S`f(x)=(x-4)^2`,w:"Die Funktion f ordnet jeder Zahl das Quadrat von x minus 4 zu.",fb:"Erst quadrieren, dann 4 abziehen."},
    {t:S`f(x)=x^2+4`,w:"Die Funktion f ordnet jeder Zahl einen Wert zu, der 4 mehr als ihr Quadrat ist.",fb:"„weniger“ bedeutet Minus."}]},
  {w:"Die Definitionsmenge von h besteht aus allen positiven reellen Zahlen.",t:S`D_h=\R^{+}`,wr:[
    {t:S`D_h=\R`,w:"Die Definitionsmenge von h besteht aus allen reellen Zahlen.",fb:"Nur die positiven Zahlen sind erlaubt."},
    {t:S`W_h=\R^{+}`,w:"Die Wertemenge von h besteht aus allen positiven reellen Zahlen.",fb:"D steht für die Definitionsmenge, W für die Wertemenge."},
    {t:S`D_h=\R\setminus\{0\}`,w:"Die Definitionsmenge von h besteht aus allen reellen Zahlen außer 0.",fb:"Dann wären auch die negativen Zahlen erlaubt."}]},
  {w:"Die Wertemenge von f besteht aus allen reellen Zahlen außer 0.",t:S`W_f=\R\setminus\{0\}`,wr:[
    {t:S`D_f=\R\setminus\{0\}`,w:"Die Definitionsmenge von f besteht aus allen reellen Zahlen außer 0.",fb:"Gefragt ist die Wertemenge W."},
    {t:S`W_f=\{0\}`,w:"Die Wertemenge von f besteht nur aus der Zahl 0.",fb:"Das ist genau die Zahl, die fehlt."},
    {t:S`W_f=\R^{+}`,w:"Die Wertemenge von f besteht aus allen positiven reellen Zahlen.",fb:"Negative Zahlen gehören dazu, nur die 0 nicht."}]},
  {w:"Die Zahl 3 gehört nicht zur Definitionsmenge der Funktion f.",t:S`3\notin D_f`,wr:[
    {t:S`3\in D_f`,w:"Die Zahl 3 gehört zur Definitionsmenge der Funktion f.",fb:"Das Zeichen ∉ heißt „gehört nicht zu“."},
    {t:S`3\notin W_f`,w:"Die Zahl 3 gehört nicht zur Wertemenge der Funktion f.",fb:"Gemeint ist die Definitionsmenge D."},
    {t:S`f(3)=0`,w:"Der Funktionswert von f an der Stelle 3 ist 0.",fb:"Der Wert 0 ist eine ganz normale Zahl. „Nicht definiert“ ist etwas anderes."}]},
  {w:"Die Funktionen f und g haben an der Stelle 2 denselben Funktionswert.",t:S`f(2)=g(2)`,wr:[
    {t:S`f=g`,w:"Die Funktionen f und g sind gleich.",fb:"Das würde für jede Stelle gelten, nicht nur für x = 2."},
    {t:S`f(2)=g(3)`,w:"Der Wert von f an der Stelle 2 ist so groß wie der Wert von g an der Stelle 3.",fb:"Beide Werte müssen zur selben Stelle 2 gehören."},
    {t:S`f(x)=2`,w:"Der Funktionswert von f ist an jeder Stelle 2.",fb:"Hier geht es um zwei Funktionen an einer Stelle."}]},
  {w:"An der Stelle a ist der Funktionswert von f kleiner als der von g.",t:S`f(a)<g(a)`,wr:[
    {t:S`f(a)>g(a)`,w:"An der Stelle a ist der Funktionswert von f größer als der von g.",fb:"Das Zeichen zeigt zur größeren Zahl hin offen."},
    {t:S`f<g(a)`,w:"f ist kleiner als der Funktionswert von g an der Stelle a.",fb:"Vergleiche Funktionswerte an derselben Stelle: f(a) und g(a)."},
    {t:S`a<f(a)`,w:"Die Stelle a ist kleiner als der Funktionswert von f.",fb:"Hier fehlt der Vergleich mit g."}]},
  {w:"g und h haben an der Stelle −1 verschiedene Werte.",t:S`g(-1)\neq h(-1)`,wr:[
    {t:S`g(-1)=h(-1)`,w:"g und h haben an der Stelle −1 denselben Wert.",fb:"Das Zeichen ≠ heißt „ist ungleich“."},
    {t:S`g\neq h`,w:"g und h sind verschiedene Funktionen.",fb:"Gemeint ist nur die Stelle −1."},
    {t:S`g(1)\neq h(1)`,w:"g und h haben an der Stelle 1 verschiedene Werte.",fb:"Die Stelle ist −1, nicht 1."}]}
];
function symTask(it,dir){
  if(dir==="w2s") return MM.mcTask({label:"Aussage in Worten",sit:`„${it.w}“`,q:"Welche Schreibweise mit Symbolen passt?",
    opts:[{t:"$"+it.t+"$",ok:true}].concat(it.wr.map(x=>({t:"$"+x.t+"$",fb:x.fb}))),erkl:`Richtig ist $${it.t}$.`});
  return MM.mcTask({label:"Aussage in Symbolen",sit:`<span class="bigtex">$${it.t}$</span>`,q:"Was bedeutet die Aussage in Worten?",
    opts:[{t:it.w,ok:true}].concat(it.wr.map(x=>({t:x.w,fb:x.fb}))),erkl:`Die Aussage $${it.t}$ heißt: ${it.w}`}); }
function sprachL3(){ const its=pick(SPRACHE,5); return its.map((it,k)=>symTask(it,k<3?"w2s":"s2w")).sort(()=>Math.random()-.5); }

/* ======================= Challenge 2: Funktion oder nicht? ======================= */
const ALLTAG=[
  {t:"Person → Körpergröße",ok:true,e:"Jede Person hat genau eine Körpergröße."},
  {t:"Körpergröße → Person",ok:false,e:"Zu einer Körpergröße gibt es meist mehrere Personen."},
  {t:"Uhrzeit → Temperatur",ok:true,e:"Zu jeder Uhrzeit gehört genau eine Temperatur."},
  {t:"Temperatur → Uhrzeit",ok:false,e:"Es kann zu mehreren Uhrzeiten gleich warm sein."},
  {t:"Kraftstoffmenge → Preis an der Tankstelle",ok:true,e:"Zu jeder Menge gehört genau ein Preis."},
  {t:"Person → Geschwister",ok:false,e:"Eine Person kann mehrere Geschwister haben, also mehrere Ausgänge."},
  {t:"Zahl → ihr Quadrat",ok:true,e:"Jede Zahl hat genau ein Quadrat."},
  {t:"Zahl → Zahlen, deren Quadrat sie ist",ok:false,e:"Zur 4 gehören 2 und −2, also zwei Ausgänge."},
  {t:"Tag → Niederschlagsmenge an diesem Tag",ok:true,e:"An jedem Tag gibt es genau eine Niederschlagsmenge."},
  {t:"Niederschlagsmenge → Tag",ok:false,e:"Dieselbe Menge kann an mehreren Tagen fallen."},
  {t:"Radius eines Kreises → Flächeninhalt",ok:true,e:"Zu jedem Radius gehört genau ein Flächeninhalt."},
  {t:"Zahl → Teiler dieser Zahl",ok:false,e:"Die 12 hat mehrere Teiler, also mehrere Ausgänge."}
];
function alltagTask(it){ return {run(api){ MM.mcTask({label:"Zuordnung",sit:`<span class="bigtex">${it.t}</span>`,q:"Ist das eine Funktion?",opts:[{t:"Ja, eine Funktion",ok:it.ok,fb:"Ein Eingang hat hier mehrere Ausgänge."},{t:"Nein, keine Funktion",ok:!it.ok,fb:"Jedem Eingang gehört hier genau ein Ausgang."}],erkl:it.e,keepOrder:true}).run(api); }}; }
function tabTask(){ // Wertetabelle
  const n=ri(4,5); let xs=shuffle([-3,-2,-1,0,1,2,3,4]).slice(0,n).sort((a,b)=>a-b); const ys=xs.map(()=>ri(-4,6)); const isF=Math.random()<0.5;
  let bad=[]; if(!isF){ const j=rand(n-1); xs=xs.slice(); xs[j+1]=xs[j]; ys[j+1]=ys[j]+one([-2,-1,1,2,3]); bad=[j,j+1]; }
  else { if(Math.random()<.6){ const j=rand(n-1); ys[j+1]=ys[j]; } }
  return {run(api){ const wrap=el("div",{class:"situ"},`<span class="eyebrow">Wertetabelle</span>${MM.tableHtml(xs,ys,{})}`); api.viz.appendChild(wrap);
    const rev=()=>{ if(!isF){ wrap.innerHTML=`<span class="eyebrow">Wertetabelle</span>${MM.tableHtml(xs,ys,{bad})}`; } };
    MM.mcTask({q:"Ist die Zuordnung x → y eine Funktion?",opts:[{t:"Ja, eine Funktion",ok:isF,fb:"Schau auf die x-Werte: Kommt einer doppelt vor?"},{t:"Nein, keine Funktion",ok:!isF,fb:"Jeder x-Wert kommt nur einmal vor."}],keepOrder:true,
      erkl:isF?"Kein x-Wert kommt doppelt vor. Gleiche y-Werte bei verschiedenen x-Werten sind erlaubt.":`Der x-Wert ${xs[bad[0]]} hat zwei verschiedene y-Werte (${ys[bad[0]]} und ${ys[bad[1]]}). Das ist nicht eindeutig.`}).run(Object.assign({},api,{finish:ok=>{ rev(); api.finish(ok); }})); }}; }
function pfeilTask(){
  const isF=Math.random()<0.5; const L=["1","2","3"], Rr=["a","b","c","d"]; const links=[[0,rand(4)],[1,rand(4)],[2,rand(4)]]; let bad=[];
  if(!isF){ const j=rand(3); links.push([j,(links[j][1]+1+rand(3))%4]); bad=[j,3]; }
  return {run(api){ const wrap=el("div",{class:"situ",style:"align-items:center"},MM.pairsSvg(L,Rr,links,{id:7,hl1:"Eingang",hl2:"Ausgang",rowH:62,max:520})); api.viz.appendChild(wrap);
    const rev=()=>{ if(!isF) wrap.innerHTML=MM.pairsSvg(L,Rr,links,{id:8,hl1:"Eingang",hl2:"Ausgang",bad,rowH:62,max:520}); };
    MM.mcTask({q:"Ist das Pfeildiagramm eine Funktion?",opts:[{t:"Ja, eine Funktion",ok:isF,fb:"Zähle die Pfeile, die von jedem Eingang ausgehen."},{t:"Nein, keine Funktion",ok:!isF,fb:"Von jedem Eingang geht genau ein Pfeil aus."}],keepOrder:true,
      erkl:isF?"Von jedem Eingang geht genau ein Pfeil aus. Dass zwei Pfeile am selben Ausgang enden, ist erlaubt.":`Vom Eingang ${L[links[bad[0]][0]]} gehen zwei Pfeile aus. Das ist nicht eindeutig.`}).run(Object.assign({},api,{finish:ok=>{ rev(); api.finish(ok); }})); }}; }
function funkL1(){ const alt=pick(ALLTAG,2).map(alltagTask); return shuffle([tabTask(),tabTask(),pfeilTask(),...alt]).slice(0,PRO_LEVEL); }
const REL_KEYS_F=["par","sin","line","horiz","zig"], REL_KEYS_N=["circ","side","vert","loop"];
function graphTask(key){ const R=MM.REL[key]; return {run(api){
  const host=api.cv(""); const info=el("div",{class:"legend"},"Ziehe die orange Senkrechte über das Bild und zähle die Treffer.");
  const v=MM.vlineView(host,R,{x0:-5,onChange:(h)=>{ info.innerHTML=`Treffer auf der Senkrechten: <strong>${h.length}</strong>`; }}); api.viz.appendChild(info);
  api.badge("Senkrechten-Test");
  MM.mcTask({q:"Ist das der Graph einer Funktion?",opts:[{t:"Ja, ein Funktionsgraph",ok:R.isF,fb:"Suche eine Stelle, an der die Senkrechte die Kurve zweimal trifft."},{t:"Nein, kein Funktionsgraph",ok:!R.isF,fb:"Keine Senkrechte trifft die Kurve zweimal."}],keepOrder:true,
    erkl:R.isF?"Jede Senkrechte trifft den Graphen höchstens einmal. Jedem x gehört höchstens ein y.":"Es gibt Senkrechte mit zwei oder mehr Treffern. Dann hätte ein x mehrere y-Werte."}).run(api); }}; }
function funkL2(){ const f=pick(REL_KEYS_F,2), n=pick(REL_KEYS_N,2), r=one([...REL_KEYS_F.filter(k=>!f.includes(k)),...REL_KEYS_N.filter(k=>!n.includes(k))]); return shuffle([...f,...n,r]).map(graphTask); }
// Wahr oder falsch mit Begründung
const WF=[
  {s:"Eine Parallele zur x-Achse kann nicht Graph einer Funktion sein.",opts:[
    {t:"Falsch: Jedem x gehört derselbe y-Wert, das ist eine konstante Funktion.",ok:true},
    {t:"Wahr: Sie hat unendlich viele Punkte mit demselben y-Wert.",fb:"Gleiche y-Werte bei verschiedenen x sind erlaubt."},
    {t:"Wahr: Sie schneidet die y-Achse nicht.",fb:"Sie schneidet die y-Achse genau einmal."}],e:"Eine waagerechte Gerade ist der Graph einer konstanten Funktion, zum Beispiel f(x) = 2."},
  {s:"Eine Parallele zur y-Achse kann nicht Graph einer Funktion sein.",opts:[
    {t:"Wahr: Zu einem x gehören dann unendlich viele y-Werte.",ok:true},
    {t:"Falsch: Sie ist eine konstante Funktion.",fb:"Konstant ist die waagerechte Gerade, nicht die senkrechte."},
    {t:"Falsch: Jede Gerade ist ein Funktionsgraph.",fb:"Die senkrechte Gerade ist die Ausnahme."}],e:"Die senkrechte Gerade x = 2 enthält unendlich viele Punkte mit demselben x-Wert 2 und verschiedenen y-Werten. Das ist nicht eindeutig."},
  {s:"Jede Parallele zur x-Achse hat mit dem Graphen einer beliebigen Funktion höchstens einen Punkt gemeinsam.",opts:[
    {t:"Falsch: Verschiedene x können denselben y-Wert haben, zum Beispiel bei einer Parabel.",ok:true},
    {t:"Wahr: Jedem x gehört genau ein y.",fb:"Das gilt für Senkrechte, nicht für Waagerechte."},
    {t:"Wahr: Eine Waagerechte trifft jede Kurve nur einmal.",fb:"Die Parabel y = x² wird von y = 4 zweimal getroffen."}],e:"Die Parallele y = 4 trifft die Parabel y = x² in zwei Punkten, bei x = 2 und x = −2."},
  {s:"Jede Parallele zur y-Achse hat mit dem Graphen einer beliebigen Funktion höchstens einen Punkt gemeinsam.",opts:[
    {t:"Wahr: Zu jedem x gehört höchstens ein y-Wert.",ok:true},
    {t:"Falsch: Eine Parabel wird von Senkrechten zweimal getroffen.",fb:"Das ist bei der Waagerechten möglich, nicht bei der Senkrechten."},
    {t:"Falsch: Eine Senkrechte kann den Graphen berühren.",fb:"Berühren ist auch nur ein Punkt."}],e:"Das ist genau der Senkrechten-Test. Jede Senkrechte trifft den Graphen höchstens einmal."},
  {s:"Der Graph einer Funktion schneidet die y-Achse höchstens einmal.",opts:[
    {t:"Wahr: Auf der y-Achse ist x = 0, dort gibt es höchstens einen Funktionswert.",ok:true},
    {t:"Falsch: Eine Parabel schneidet die y-Achse zweimal.",fb:"Eine Parabel schneidet die x-Achse eventuell zweimal."},
    {t:"Falsch: Jeder Graph schneidet die y-Achse mindestens zweimal.",fb:"Das ist nie der Fall."}],e:"Die y-Achse ist die Senkrechte durch x = 0. Sie trifft den Graphen höchstens einmal."},
  {s:"Der Graph einer Funktion schneidet die x-Achse höchstens einmal.",opts:[
    {t:"Falsch: Eine Parabel kann die x-Achse zweimal schneiden.",ok:true},
    {t:"Wahr: Zu jedem x gehört genau ein y.",fb:"Das sagt etwas über Senkrechte, nicht über die x-Achse."},
    {t:"Wahr: Die x-Achse ist die Senkrechte durch y = 0.",fb:"Die x-Achse ist waagerecht."}],e:"Die x-Achse ist waagerecht. Verschiedene Stellen dürfen denselben Funktionswert 0 haben."},
  {s:"Zu jedem Funktionswert gehört genau eine Stelle.",opts:[
    {t:"Falsch: Bei f(x) = x² gilt f(2) = 4 und f(−2) = 4.",ok:true},
    {t:"Wahr: Das ist die Definition einer Funktion.",fb:"Die Definition sagt: zu jeder Stelle genau ein Wert, nicht umgekehrt."},
    {t:"Wahr: Dann wäre die Zuordnung sonst nicht eindeutig.",fb:"Eindeutig ist die Richtung x → y."}],e:"Eindeutig ist nur die Richtung Stelle → Wert. Verschiedene Stellen dürfen denselben Wert haben."},
  {s:"Zu jeder Stelle der Definitionsmenge gehört genau ein Funktionswert.",opts:[
    {t:"Wahr: Das ist die Definition einer Funktion.",ok:true},
    {t:"Falsch: Manchmal gibt es zwei Funktionswerte.",fb:"Dann wäre es keine Funktion."},
    {t:"Falsch: Das gilt nur für lineare Funktionen.",fb:"Das gilt für jede Funktion."}],e:"Genau das macht eine Funktion aus."}
];
function wfTask(it){ return MM.mcTask({label:"Aussage",sit:`„${it.s}“`,q:"Wahr oder falsch? Wähle mit der richtigen Begründung.",opts:it.opts,erkl:it.e}); }
function funkL3(){ return pick(WF,PRO_LEVEL).map(wfTask); }

/* ======================= Challenge 3: D und W notieren ======================= */
function whyD(t){
  switch(t.kind){
    case "lin": case "sq": case "nsq": case "invsq1": case "sqrtq": return "Für x darf jede Zahl eingesetzt werden, nichts geht schief.";
    case "inv": return S`Der Nenner darf nicht 0 werden: $x\neq 0$.`;
    case "inva": return S`Der Nenner $x ${MM.sg(-t.a)}$ darf nicht 0 werden. Das passiert bei $x=${tn(t.a)}$.`;
    case "inv2": return S`Der Nenner $x^2$ ist 0 nur bei $x=0$.`;
    case "inv2m": return S`Der Nenner $x^2-${t.a*t.a}$ ist 0 bei $x=${t.a}$ und $x=${-t.a}$. Beide Stellen sind verboten.`;
    case "sqrt": return S`Unter der Wurzel darf nichts Negatives stehen: $x\ge 0$.`;
    case "sqrta": return S`Unter der Wurzel muss $x ${MM.sg(-t.a)}\ge 0$ gelten, also $x\ge ${tn(t.a)}$.`;
    case "sqrtneg": return S`Unter der Wurzel muss $${t.a}-x\ge 0$ gelten, also $x\le ${t.a}$.`;
    case "invsqrt": return S`Unter der Wurzel muss $x\ge 0$ gelten. Die Wurzel steht im Nenner, deshalb darf sie nicht 0 sein: $x>0$.`;
    case "sqrtinv": return S`Die Wurzel braucht $x\ge 0$. Der Bruch $\frac1x$ braucht $x\neq 0$. Zusammen: $x>0$.`;
    case "ratdiff": return S`Der Nenner $x ${MM.sg(-t.a)}$ darf nicht 0 werden: $x\neq ${tn(t.a)}$.`;
    default: return ""; } }
function dTask(fams){ const t=Terms.term(fams); const opts=Terms.setOptions(t.D,"mix","x",{prefix:"D_f="});
  if(opts.length<4) return dTask(fams);
  return MM.mcTask({label:"Funktion",sit:S`<span class="bigtex">$f(x)=${t.tex}$</span>`,q:"Gib die Definitionsmenge an.",opts,hint:"Frage dich: Welche Zahlen darf ich nicht einsetzen?",
    erkl:whyD(t)+Terms.explainSet(t.D,"x","D_f",opts.style)}); }

function whyW(t){
  switch(t.kind){
    case "sq": return S`$x^2\ge 0$, also $x^2 ${MM.sg(t.c)}\ge ${tn(t.c)}$. Der kleinste Wert ${tn(t.c)} wird bei $x=0$ angenommen.`;
    case "nsq": return S`$x^2\ge 0$, also $${t.c}-x^2\le ${t.c}$. Der größte Wert ${t.c} wird bei $x=0$ angenommen.`;
    case "sqrt": return S`Eine Wurzel ist nie negativ und wird beliebig groß. Der kleinste Wert 0 gehört dazu.`;
    case "inv": return S`$\frac1x$ wird nie 0, aber alle anderen Werte kommen vor.`;
    case "inv2": return S`$\frac{1}{x^2}$ ist immer positiv und wird nie 0.`;
    case "sqrtc": return S`$\sqrt{x}\ge 0$, also $\sqrt{x} ${MM.sg(t.c)}\ge ${tn(t.c)}$. Der kleinste Wert ${tn(t.c)} wird bei $x=0$ angenommen.`;
    case "msqrt": return S`$\sqrt{x}\ge 0$, also $${t.c}-\sqrt{x}\le ${t.c}$. Der größte Wert ${t.c} wird bei $x=0$ angenommen.`;
    case "invc": return S`$\frac1x$ wird nie 0, deshalb wird $\frac1x ${MM.sg(t.c)}$ nie ${tn(t.c)}.`;
    case "inva": return S`$\frac{1}{x ${MM.sg(-t.a)}}$ wird nie 0, alle anderen Werte kommen vor.`;
    case "invsq1": return S`$x^2+1\ge 1$, deshalb liegt der Bruch zwischen 0 und 1. Die 1 wird bei $x=0$ erreicht, die 0 nie.`;
    case "sqrtneg": return S`Eine Wurzel ist nie negativ und wird beliebig groß. Der kleinste Wert 0 gehört dazu.`;
    default: return ""; } }
function plotOfTerm(t,extra){ return (st,col)=>{ const dots=[]; t.D.forEach(i=>{ [[i.lo,i.cl],[i.hi,i.ch]].forEach(([e,c])=>{ if(isFinite(e)&&c){ const y=t.fn(e); if(isFinite(y)) dots.push({x:e,y,closed:true}); } }); });
  MM.plot(st,col,Object.assign({xr:[-6,6],yr:[-5,5],fn:t.fn,dom:t.D,dots,step:1},extra||{})); }; }
function wTask(fams){ const t=Terms.term(fams); if(!t.W) return wTask(fams); const opts=Terms.setOptions(t.W,"mix","y",{prefix:"W_f="}); if(opts.length<4) return wTask(fams);
  return MM.mcTask({viz:api=>{ const host=api.cv(""); const st={on:false}; const cvw=MM.canvasView(host,(s,c)=>plotOfTerm(t,{shadowW:st.on?t.W:null,shadowD:st.on?t.D:null,shadowA:1})(s,c)); api.legend(`<span>${tex("f(x)="+t.tex)}</span>`); return {reveal(){ st.on=true; cvw.redraw(); }}; },
    q:"Gib die Wertemenge an. Lies am Graphen ab, welche y-Werte vorkommen.",opts,
    erkl:whyW(t)+Terms.explainSet(t.W,"y","W_f",opts.style)}); }

function pairTask(fams){ const t=Terms.term(fams); if(!t.W) return pairTask(fams);
  const wD=Terms.wrongSets(t.D,"x"), wW=Terms.wrongSets(t.W,"y"); if(!wD.length||!wW.length) return pairTask(fams);
  const dd=Sets.tex(t.D,"intervall","x"), ww=Sets.tex(t.W,"intervall","y"); const fmt=(D,W)=>"$D="+Sets.tex(D,"mix","x")+S`\;\;W=`+Sets.tex(W,"mix","y")+"$";
  const dOK="$D="+dd+S`\;\;W=`+ww+"$"; const mk=(D,W)=>"$D="+Sets.tex(D,"intervall","x")+S`\;\;W=`+Sets.tex(W,"intervall","y")+"$";
  const a=shuffle(wD)[0], b=shuffle(wW)[0], a2=shuffle(wD)[wD.length>1?1:0], b2=shuffle(wW)[wW.length>1?1:0];
  const opts=[{t:mk(t.D,t.W),ok:true},{t:mk(a.S,t.W),fb:"D stimmt nicht. "+a.fb},{t:mk(t.D,b.S),fb:"W stimmt nicht. "+b.fb},{t:mk(a2.S,b2.S),fb:"Weder D noch W stimmen. Geh beide Mengen einzeln durch."}];
  if(new Set(opts.map(o=>o.t)).size<4) return pairTask(fams);
  return MM.mcTask({viz:api=>{ const host=api.cv(""); const st={on:false}; const cvw=MM.canvasView(host,(s,c)=>plotOfTerm(t,{shadowW:st.on?t.W:null,shadowD:st.on?t.D:null,shadowA:1})(s,c)); api.legend(`<span>${tex("f(x)="+t.tex)}</span>`); return {reveal(){ st.on=true; cvw.redraw(); }}; },
    q:"Welche Angabe für D und W stimmt?",opts,erkl:whyD(t)+" "+whyW(t)}); }

// Schreibweise prüfen
function notationTask(){
  const style=one(["ray","ray","bounded"]); let T_, setS, lo, hi;
  const br=A=>A.startsWith("-")?"{"+A+"}":A;
  if(style==="ray"){ const a=ri(-3,5), kind=one(["ge","gt"]); const v=one(["x","y"]); setS=Sets.ray(kind,a); lo=a-4; hi=a+5; const asMenge=Math.random()<.4;
    const A=br(tn(a)), cl=kind==="ge";
    const okT=asMenge?`\\{${v}\\in\\R\\mid ${v}${cl?"\\ge":">"}${A}\\}`:`${cl?"[":"]"}${A};\\infty[`;
    const wrongs=asMenge?[{t:`${v}\\in\\R\\mid ${v}${cl?"\\ge":">"}${A}`,fb:"Mengenschreibweise braucht geschweifte Klammern um alles."},{t:`\\{${v}\\in\\R;\\ ${v}${cl?"\\ge":">"}${A}\\}`,fb:"Zwischen Variable und Bedingung steht der senkrechte Strich „|“, kein Strichpunkt."},{t:`\\{${v}\\in\\R\\mid ${A}${cl?"\\ge":">"}${v}\\}`,fb:"Das Zeichen zeigt in die falsche Richtung: Das beschreibt die kleineren Zahlen."}]
      :[{t:`${cl?"[":"]"}${A};\\infty]`,fb:"Unendlich ist keine Zahl. Die Klammer bei ∞ ist immer nach außen offen."},{t:`\\{${A};\\infty\\}`,fb:"Geschweifte Klammern mit Strichpunkt zählen Elemente auf. Das wären nur zwei Zahlen."},{t:`${cl?"]":"["}${A};\\infty[`,fb:"Randpunkt: Gehört die Randzahl dazu? Die eckige Klammer zeigt zur Zahl hin, nach innen."}];
    T_={prompt:`Beschreibe: alle Zahlen ${cl?"größer oder gleich":"größer als"} ${MM.ts(a)}. Welche Schreibweise ist korrekt?`,ok:okT,wr:wrongs,why:`Richtig ist $${okT}$. Beide Schreibweisen für dieselbe Menge: Intervall $${cl?"[":"]"}${A};\\infty[$, Menge $\\{${v}\\in\\R\\mid ${v}${cl?"\\ge":">"}${A}\\}$.`}; }
  else { const a=ri(-4,1), b=a+ri(2,5), cl=Math.random()<.5, ch=!cl; const A=br(tn(a)), B=br(tn(b)); setS=Sets.between(a,b,cl,ch); lo=a-2; hi=b+2;
    const okT=`${cl?"[":"]"}${A};${B}${ch?"]":"["}`;
    T_={prompt:`Beschreibe: alle Zahlen zwischen ${MM.ts(a)} und ${MM.ts(b)}, ${MM.ts(a)} ${cl?"gehört dazu":"gehört nicht dazu"}, ${MM.ts(b)} ${ch?"gehört dazu":"gehört nicht dazu"}. Welche Intervallschreibweise ist korrekt?`,ok:okT,
      wr:[{t:`\\{${A};${B}\\}`,fb:"Geschweifte Klammern mit Strichpunkt zählen Elemente auf. Das wären nur zwei Zahlen."},{t:`${A}<x\\le ${B}`,fb:"Das ist eine Ungleichung, noch keine Menge. Es fehlen die Mengenklammern oder die Intervallschreibweise."},{t:`${cl?"]":"["}${A};${B}${ch?"[":"]"}`,fb:"Randpunkte vertauscht: Eckige Klammer heißt „gehört dazu“."}],why:`Richtig ist $${okT}$. Beide Schreibweisen für dieselbe Menge: Intervall $${okT}$, Menge $\\{x\\in\\R\\mid ${A}${cl?"\\le":"<"}x${ch?"\\le":"<"}${B}\\}$.`}; }
  return MM.mcTask({viz:api=>{ const host=api.cv("small"); MM.canvasView(host,(st,col)=>MM.numline(st,col,{lo,hi,set:setS,nums:[]})); return {}; },
    q:T_.prompt,opts:[{t:"$"+T_.ok+"$",ok:true}].concat(T_.wr.map(w=>({t:"$"+w.t+"$",fb:w.fb}))),erkl:T_.why}); }
function dwL3(){ return shuffle([pairTask(Terms.FAM_W2),pairTask(Terms.FAM_W2.concat(["sq","nsq"])),pairTask(Terms.FAM_W1),notationTask(),notationTask()]); }

/* ======================= Kapitel-Definition ======================= */
MM.addKapitel("k1",{
  steckOrder:["funktion","term","stelle","dw"], steckbriefe,
  challOrder:["funktion","wert","dw"],
  braucht:{funktion:["funktion"],wert:["funktion","term","stelle"],dw:["funktion","term","stelle","dw"]}, // welche Steckbriefe (Mini-Check) eine Challenge freischalten
  challenges:{
    wert:{titel:"Wert & Stelle", art:"Einsetzen, Ablesen, Symbole", buch:"S. 13 A6 b), A3 bis A5 · S. 14 A8, A11",
      kurz:"Funktionswerte berechnen, Stellen finden, am Graphen ablesen und in Symbolen sprechen.",
      intro:"Du rechnest Funktionswerte aus, findest Stellen zu gegebenen Werten und liest am Graphen ab. Im dritten Level übersetzt du zwischen Worten und Symbolen. Die falschen Antworten sind typische Fehler.",
      levels:[{name:"Einsetzen",info:"Funktionswerte berechnen. Falsche Antworten sind typische Rechenfehler.",make:()=>[...Array(PRO_LEVEL)].map(valueTask)},
              {name:"Stelle und Graph",info:"Stellen zu Werten finden und am Graphen ablesen.",make:()=>shuffle([stelleTask(),stelleTask(),graphReadTask(),graphReadTask(),graphReadTask()]),buch:"S. 12 Beispiel 1 a) · S. 14 A11"},
              {name:"In Symbolen sprechen",info:"Aussagen in Worten und Symbole zuordnen.",make:sprachL3,buch:"S. 12 Beispiel 2 · S. 13 A3 bis A5"}]},
    funktion:{titel:"Funktion oder nicht?", art:"Eindeutige Zuordnung", buch:"S. 11 · S. 13 A1 und A7",
      kurz:"Tabellen, Pfeile und Graphen prüfen: Hat jedes x genau ein y?",
      intro:"Du entscheidest, ob eine Zuordnung eine Funktion ist. Zuerst bei Tabellen und Alltag, dann am Graphen mit dem Senkrechten-Test, zuletzt mit Begründung.",
      levels:[{name:"Tabellen und Pfeile",info:"Alltag, Wertetabelle, Pfeildiagramm.",make:funkL1},
              {name:"Graphen",info:"Mit der Senkrechten testen, ob es eine Funktion ist.",make:funkL2},
              {name:"Wahr oder falsch?",info:"Aussagen prüfen und die passende Begründung wählen.",make:funkL3,buch:"S. 13 A7"}]},
    dw:{titel:"D & W richtig notieren", art:"Definitionsmenge und Wertemenge", buch:"S. 12 Beispiel 1 c) · S. 13 A6 · S. 14 A8, A12",
      kurz:"Definitions- und Wertemenge bestimmen und korrekt aufschreiben.",
      intro:"Du bestimmst $D$ und $W$ und wählst die richtige Schreibweise. Die falschen Antworten sind typische Fehler: falscher Rand, falsches Vorzeichen, vergessene Ausnahmestelle.",
      levels:[{name:"Definitionsmenge",info:"Welche Zahlen darf ich einsetzen?",make:()=>[...Array(PRO_LEVEL)].map((_,i)=>dTask(i<3?Terms.FAM_D1:Terms.FAM_D2))},
              {name:"Wertemenge",info:"Welche y-Werte kommen vor? Mit Graph.",make:()=>[...Array(PRO_LEVEL)].map((_,i)=>wTask(i<3?Terms.FAM_W1:Terms.FAM_W2))},
              {name:"Beides und Schreibweise",info:"D und W zusammen, dazu Schreibfehler finden.",make:dwL3}]}
  }});
})();
