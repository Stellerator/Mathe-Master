/* Kapitel 3 · Lineare Funktionen (LS Kap. 1 · Abschnitt 3 · S. 15–19) */
(function(){
"use strict";
const MM=window.MM, S=String.raw;
const {el,shuffle,one,ri,T,tex,tn,ts,sg,Sets,PRO_LEVEL}=MM;
const near=(a,b)=>Math.abs(a-b)<1e-9;
const R2=v=>Math.round(v*100)/100;
const exact=v=>Math.abs(v*100-Math.round(v*100))<1e-9;
const eur=v=>R2(v).toFixed(2).replace(".",",")+" €";
const num=v=>ts(R2(v));
function retry(fn){ for(let k=0;k<500;k++){ const r=fn(); if(r) return r; } throw new Error("K3: Aufgabe konnte nicht erzeugt werden"); }

/* ---------- Terme ---------- */
const amx=(m,v)=>Math.abs(m)===1?v:tn(Math.abs(m))+v;
const mx=(m,v)=>m===1?v:m===-1?"-"+v:tn(m)+v;
// Standard: m·x + b. style "b": b zuerst (z. B. 80 - 5t)
function rhs(m,b,v,style){ v=v||"x";
  if(m===0) return tn(b);
  if(style==="b") return `${tn(b)} ${m>0?"+":"-"} ${amx(m,v)}`;
  return b===0?mx(m,v):`${mx(m,v)} ${b>0?"+":"-"} ${tn(Math.abs(b))}`; }
const fT=(m,b,n,v,style)=>`${n||"f"}(${v||"x"})=${rhs(m,b,v,style)}`;

/* ---------- Antwortlisten ---------- */
// Zahlenantworten: correct (Zahl), cands [{v,fb}], fmt(v)->Text
function pickOpts(correct,cands,fmt,n){ const f=fmt||(v=>"$"+tn(v)+"$"); const seen=new Set([f(correct)]); const out=[{t:f(correct),ok:true}];
  for(const c of shuffle(cands.slice())){ if(out.length>=(n||4)) break; if(!isFinite(c.v)||near(c.v,correct)) continue; const t=f(c.v); if(seen.has(t)) continue; seen.add(t); out.push({t,fb:c.fb}); }
  return out.length>=(n||4)?out:null; }
// Terme zu f(x)=m x+b: falsche Terme mit Rückmeldung
function wrongTerms(m,b,o){ o=o||{}; const c=[];
  if(m!==0) c.push({m:-m,b,fb:"Das Vorzeichen der Steigung stimmt nicht. Steigt die Gerade oder fällt sie?"});
  if(b!==0) c.push({m,b:-b,fb:"Das Vorzeichen von b stimmt nicht. b ist der y-Wert, bei dem die Gerade die y-Achse trifft."});
  if(b!==0&&m!==0&&m!==b) c.push({m:b,b:m,fb:"m und b sind vertauscht. m steht beim x, b steht allein."});
  if(o.near&&b!==0){ c.push({m,b:b+1,fb:"Der y-Achsenabschnitt ist um 1 daneben. Lies den Schnittpunkt mit der y-Achse genauer ab."}); c.push({m,b:b-1,fb:"Der y-Achsenabschnitt ist um 1 daneben. Lies den Schnittpunkt mit der y-Achse genauer ab."}); }
  if(o.nearM&&m!==0){ c.push({m:m+0.5,b,fb:"Die Steigung ist etwas zu groß. Zähle das Steigungsdreieck noch einmal."}); c.push({m:m-0.5,b,fb:"Die Steigung ist etwas zu klein. Zähle das Steigungsdreieck noch einmal."}); }
  (o.extra||[]).forEach(e=>c.push(e));
  return c; }
function termOpts(m,b,cands,o){ o=o||{}; const f=w=>"$"+fT(w.m,w.b,o.name,o.v,o.style)+"$"; const ok=f({m,b}); const used=new Set([ok]); const outs=[{t:ok,ok:true}];
  for(const w of shuffle(cands.slice())){ if(outs.length>=(o.n||4)) break; if(!isFinite(w.m)||!isFinite(w.b)||(w.m===0&&!w.allowZero)||Math.abs(w.b)>200||Math.abs(w.m)>200) continue; const t=f(w); if(used.has(t)) continue; used.add(t); outs.push({t,fb:w.fb}); }
  return outs.length>=(o.n||4)?outs:null; }

/* ---------- Geraden im Gitter ---------- */
const M_LIST=[-3,-2,-1.5,-1,-0.5,0.5,1,1.5,2,3];
function gridPts(m,b){ const p=[]; for(let x=-6;x<=6;x++){ const y=m*x+b; if(Number.isInteger(y)&&Math.abs(y)<=6) p.push([x,y]); } return p; }
function randLine(o){ o=o||{}; for(let k=0;k<300;k++){ const m=o.m!==undefined?o.m:one(o.ms||M_LIST), b=o.b!==undefined?o.b:one(o.bs||[-4,-3,-2,-1,1,2,3,4]); if(gridPts(m,b).length>=3) return {m,b}; } return {m:1,b:2}; }
function lineThrough(A,B){ if(A.x===B.x) return null; const m=(B.y-A.y)/(B.x-A.x); return {m,b:A.y-m*A.x}; }
const sameLine=(L,t)=>!!L&&near(L.m,t.m)&&near(L.b,t.b);
const pt=(x,y)=>`(${ts(x)}|${ts(y)})`;
const ptT=(x,y)=>`(${tn(x)}|${tn(y)})`;
// kleinste ganze Schrittzahl dx, sodass dx·m ganz ist
function stepOf(m){ for(let k=1;k<=4;k++) if(Number.isInteger(R2(m*k))) return k; return 1; }
function stepText(m){ if(m===0) return "Die Gerade verläuft waagerecht, y ändert sich nicht"; const k=stepOf(m), d=Math.round(m*k);
  return `Geht man ${k} nach rechts, geht es um ${Math.abs(d)} nach ${d>0?"oben":"unten"}`; }
const dirText=m=>m>0?"Die Gerade steigt.":m<0?"Die Gerade fällt.":"Die Gerade verläuft waagerecht.";

/* ---------- Zeichnen ---------- */
const BOX={xr:[-6,6],yr:[-6,6],step:1};
const colOf=(col,c)=>({wave:col.wave,ok:col.ok,mark:col.mark,bad:col.bad,muted:col.muted}[c||"wave"]);
function drawPlot(st,col,o){
  const box=o.box||BOX;
  const geo=MM.plot(st,col,Object.assign({},box,{paths:(o.lines||[]).map(l=>({pts:[[-80,l.m*-80+l.b],[80,l.m*80+l.b]],color:colOf(col,l.c)})),marks:o.marks?o.marks(col):[]}));
  if(o.after) o.after(st,col,geo); return geo; }
// Fertige Ansicht (ruft api.cv)
function lineView(host,o){ const ref={geo:null}; if(host&&host.classList) host.classList.add("sq"); const cvw=MM.canvasView(host,(st,col)=>{ ref.geo=drawPlot(st,col,{lines:o.lines?o.lines():[],marks:o.marks,after:o.after,box:o.box}); }); return {cvw,ref}; }
function triangle(ctx,geo,col,P,dx,dy){
  const x1=geo.X(P.x),y1=geo.Y(P.y),x2=geo.X(P.x+dx),y2=geo.Y(P.y+dy); ctx.save(); ctx.strokeStyle=col.mark; ctx.lineWidth=2.4; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore();
  ctx.fillStyle=col.mark; ctx.font=MM.MONO(700,13); ctx.textAlign="center";
  ctx.fillText("Δx = "+ts(dx),(x1+x2)/2,y1+(dy>=0?19:-9));
  ctx.textAlign=dx>=0?"left":"right"; ctx.fillText("Δy = "+ts(dy),x2+(dx>=0?9:-9),(y1+y2)/2+4); ctx.textAlign="left"; }
function drawHandles(ctx,geo,col,pts,names,dim){ pts.forEach((p,i)=>{ const x=geo.X(p.x),y=geo.Y(p.y); ctx.beginPath(); ctx.arc(x,y,13,0,MM.TAU); ctx.fillStyle=dim?col.muted:col.wave; ctx.fill(); ctx.lineWidth=3; ctx.strokeStyle=col.plot; ctx.stroke();
  ctx.fillStyle="#fff"; ctx.font=MM.MONO(700,12); ctx.textAlign="center"; ctx.fillText(names[i],x,y+4.5); ctx.fillStyle=col.ink; ctx.font=MM.MONO(600,12); ctx.fillText(pt(p.x,p.y),x,y-19); ctx.textAlign="left"; }); }
// Ziehpunkte, rasten auf ganzen Zahlen. pts: [{x,y,fixX?,fixY?}]
function makeDrag(c,geoGet,pts,onChange,locked,distinct){
  c.style.touchAction="none"; c.style.cursor="grab"; let cur=null;
  const grid=e=>{ const g=geoGet(); const r=c.getBoundingClientRect(); const px=e.clientX-r.left, py=e.clientY-r.top; const x=(px-g.X(0))/(g.X(1)-g.X(0)), y=(g.Y(0)-py)/(g.Y(0)-g.Y(1)); return {x:Math.max(-6,Math.min(6,Math.round(x))),y:Math.max(-6,Math.min(6,Math.round(y))),px,py}; };
  c.addEventListener("pointerdown",e=>{ if(locked()) return; const g=geoGet(); if(!g) return; const r=c.getBoundingClientRect(); const px=e.clientX-r.left, py=e.clientY-r.top;
    let best=null,bd=1e9; pts.forEach(p=>{ const d=Math.hypot(g.X(p.x)-px,g.Y(p.y)-py); if(d<bd){ bd=d; best=p; } }); if(bd<60){ cur=best; try{c.setPointerCapture(e.pointerId);}catch(_){} } });
  c.addEventListener("pointermove",e=>{ if(!cur||locked()) return; const q=grid(e); const nx=cur.fixX?cur.x:q.x, ny=cur.fixY?cur.y:q.y;
    if(distinct){ const o=pts.find(p=>p!==cur); if(o&&o.x===nx) return; }
    if(cur.x!==nx||cur.y!==ny){ cur.x=nx; cur.y=ny; onChange(); } });
  ["pointerup","pointercancel"].forEach(ev=>c.addEventListener(ev,()=>{ cur=null; })); }

/* ---------- Bausteine für die Bilder der Steckbriefe ---------- */
function stepper(label,get,set,lo,hi,stp,fmt){ const box=el("div",{class:"seg"}); const minus=el("button",{"aria-label":label+" kleiner"},"−"), plus=el("button",{"aria-label":label+" größer"},"+"), v=el("button",{style:"pointer-events:none;min-width:118px;background:transparent"},"");
  const upd=()=>{ v.innerHTML=`<small>${label}</small>${fmt(get())}`; minus.disabled=get()<=lo+1e-9; plus.disabled=get()>=hi-1e-9; };
  minus.addEventListener("click",()=>{ set(Math.max(lo,R2(get()-stp))); upd(); }); plus.addEventListener("click",()=>{ set(Math.min(hi,R2(get()+stp))); upd(); });
  box.append(minus,v,plus); upd(); return box; }
function segButtons(parent,items,onPick,first){ items.forEach((it,i)=>{ const b=el("button",{"aria-pressed":String(i===(first||0))},it.label); b.addEventListener("click",()=>{ [...parent.children].forEach(c=>c.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); onPick(it,i); }); parent.appendChild(b); }); }

function vizGerade(side){
  const st={m:1,b:1}; const host=MM.mkcv(side,"tall"); const msg=el("div",{class:"feedback info",style:"font-size:17px"});
  const lv=lineView(host,{lines:()=>[{m:st.m,b:st.b}],marks:col=>[{x:0,y:st.b,label:"",color:col.mark}],after:(c,col,geo)=>{ if(st.m!==0) triangle(c.ctx,geo,col,{x:0,y:st.b},1,st.m); }});
  const rows=el("div",{style:"display:flex;gap:10px;flex-wrap:wrap"});
  const upd=()=>{ lv.cvw.redraw(); msg.innerHTML=tex(fT(st.m,st.b))+"<br>"+T(`Steigung $m=${tn(st.m)}$. ${dirText(st.m)}`)+"<br>"+T(`y-Achsenabschnitt $b=${tn(st.b)}$: Die Gerade schneidet die y-Achse im Punkt $(0|${tn(st.b)})$.`); };
  rows.append(stepper("Steigung m",()=>st.m,v=>{ st.m=v; upd(); },-3,3,0.5,v=>tex(tn(v))),stepper("y-Achsenabschnitt b",()=>st.b,v=>{ st.b=v; upd(); },-3,3,1,v=>tex(tn(v))));
  side.append(rows,msg); upd(); }

function vizSteigung(side){
  const A={x:-2,y:-1}, B={x:2,y:2}; let L=null; const host=MM.mkcv(side,"tall"); const msg=el("div",{class:"feedback info",style:"font-size:17px"});
  const lv=lineView(host,{lines:()=>{ L=lineThrough(A,B); return L?[{m:L.m,b:L.b}]:[]; },after:(c,col,geo)=>{ if(L){ const P=A.x<B.x?A:B, Q=A.x<B.x?B:A; triangle(c.ctx,geo,col,P,Q.x-P.x,Q.y-P.y); } drawHandles(c.ctx,geo,col,[A,B],["A","B"],false); }});
  const upd=()=>{ lv.cvw.redraw(); if(!L) return; const P=A.x<B.x?A:B, Q=A.x<B.x?B:A, dx=Q.x-P.x, dy=Q.y-P.y, m=dy/dx;
    msg.innerHTML=T(`$m=\\dfrac{\\Delta y}{\\Delta x}=\\dfrac{${tn(dy)}}{${tn(dx)}}${exact(m)?"=":"\\approx "}${tn(R2(m))}$`)+"<br>"+T(`${dirText(m)}`); };
  side.append(el("p",{class:"hint"},"Ziehe die Punkte A und B. Sie rasten auf ganzen Zahlen ein."),msg);
  makeDrag(lv.cvw.st.c,()=>lv.ref.geo,[A,B],upd,()=>false,true); upd(); }

const EX_TERM=[
  {name:"Steigung und Punkt",given:S`m=-2,\;P(2|1)`,m:-2,b:5,pts:[[2,1]],steps:[
    S`Ansatz: $g(x)=-2x+b$`,
    S`Punkt einsetzen: $1=-2\cdot 2+b$`,
    S`Auflösen: $1=-4+b$, also $b=5$`,
    S`Ergebnis: $g(x)=-2x+5$`]},
  {name:"Zwei Punkte",given:S`P(-2|0),\;Q(2|2)`,m:0.5,b:1,pts:[[-2,0],[2,2]],steps:[
    S`Steigung: $m=\dfrac{2-0}{2-(-2)}=\dfrac{2}{4}=0{,}5$`,
    S`Ansatz: $h(x)=0{,}5x+b$`,
    S`Punkt Q einsetzen: $2=0{,}5\cdot 2+b$, also $b=1$`,
    S`Ergebnis: $h(x)=0{,}5x+1$`]}];
function vizTerm(side){
  const state={ex:0,k:0}; const seg=el("div",{class:"seg"}), msg=el("div",{class:"feedback info",style:"font-size:17px"}), btn=el("button",{class:"btn"},"Nächster Schritt"); const host=MM.mkcv(side,"tall");
  const lv=lineView(host,{lines:()=>{ const e=EX_TERM[state.ex]; return state.k>=e.steps.length-1?[{m:e.m,b:e.b}]:[]; },marks:col=>EX_TERM[state.ex].pts.map(p=>({x:p[0],y:p[1],label:"("+ts(p[0])+"|"+ts(p[1])+")",color:col.mark}))});
  const upd=()=>{ const e=EX_TERM[state.ex]; msg.innerHTML=`<b>Gegeben:</b> ${tex(e.given)}<br>`+e.steps.slice(0,state.k+1).map(s=>T(s)).join("<br>"); btn.disabled=state.k>=e.steps.length-1; btn.textContent=btn.disabled?"Fertig":"Nächster Schritt"; lv.cvw.redraw(); };
  segButtons(seg,EX_TERM.map(e=>({label:e.name})),(it,i)=>{ state.ex=i; state.k=0; upd(); });
  btn.addEventListener("click",()=>{ state.k++; upd(); }); side.append(seg,msg,btn); upd(); }

function vizPunkte(side){
  const state={mode:"probe"}; const seg=el("div",{class:"seg"}), msg=el("div",{class:"feedback info",style:"font-size:17px"}); const host=MM.mkcv(side,"tall");
  const lv=lineView(host,{lines:()=>[{m:1.5,b:-3}],marks:col=>state.mode==="probe"?[{x:4,y:3,label:"A(4|3)",color:col.ok},{x:-2,y:3,label:"B(−2|3)",color:col.bad}]:state.mode==="y"?[{x:0,y:-3,label:"S(0|−3)",color:col.mark}]:[{x:2,y:0,label:"N(2|0)",color:col.mark}]});
  const txt={probe:S`<b>Punktprobe:</b> Setze die x-Koordinate ein und vergleiche mit der y-Koordinate.<br>$f(4)=1{,}5\cdot 4-3=3$: Das passt zu $A(4|3)$. A liegt auf dem Graphen.<br>$f(-2)=1{,}5\cdot(-2)-3=-6\ne 3$: $B(-2|3)$ liegt nicht auf dem Graphen.`,
    y:S`<b>y-Achsenabschnitt:</b> Auf der y-Achse ist $x=0$.<br>$f(0)=1{,}5\cdot 0-3=-3$<br>Schnittpunkt mit der y-Achse: $S(0|-3)$.`,
    x:S`<b>Nullstelle:</b> Auf der x-Achse ist $y=0$.<br>$1{,}5x-3=0$, also $x=2$<br>Schnittpunkt mit der x-Achse: $N(2|0)$.`};
  const upd=()=>{ lv.cvw.redraw(); msg.innerHTML=`${tex("f(x)=1{,}5x-3")}<br>`+T(txt[state.mode]); };
  segButtons(seg,[{label:"Punktprobe",k:"probe"},{label:"f(0)",k:"y"},{label:"Nullstelle",k:"x"}],it=>{ state.mode=it.k; upd(); });
  side.append(seg,msg); upd(); }

function vizWinkel(side){
  const state={m:1}; const seg=el("div",{class:"seg"}), msg=el("div",{class:"feedback info",style:"font-size:17px"}); const host=MM.mkcv(side,"tall");
  const lv=lineView(host,{lines:()=>[{m:state.m,b:0}],after:(c,col,geo)=>{ const ctx=c.ctx, th=Math.atan(state.m), al=state.m>=0?th:Math.PI+th; const r=46, cx=geo.X(0), cy=geo.Y(0);
    ctx.save(); ctx.strokeStyle=col.mark; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(cx,cy,r,0,-al,true); ctx.stroke(); ctx.restore();
    ctx.fillStyle=col.mark; ctx.font=MM.MONO(700,16); ctx.textAlign="center"; const mid=al/2; ctx.fillText("α",cx+(r+17)*Math.cos(mid),cy-(r+17)*Math.sin(mid)+5); ctx.textAlign="left"; }});
  const upd=()=>{ lv.cvw.redraw(); const m=state.m, th=Math.atan(m)*180/Math.PI, a=Math.round(Math.abs(th)*10)/10; let t=tex(`m=${tn(m)}`)+"<br>";
    if(m>=0) t+=T(`Taschenrechner: $\\tan^{-1}(${tn(m)})\\approx ${tn(a)}^\\circ$. Steigungswinkel $\\alpha\\approx ${tn(a)}^\\circ$.`);
    else t+=T(`Taschenrechner: $\\tan^{-1}(${tn(m)})\\approx -${tn(a)}^\\circ$. Das ist der Winkel im Uhrzeigersinn. Steigungswinkel: $\\alpha=180^\\circ-${tn(a)}^\\circ=${tn(R2(180-a))}^\\circ$.`);
    msg.innerHTML=t; };
  segButtons(seg,[-2,-1,0.5,1,2].map(m=>({label:T("$m="+tn(m)+"$"),m})),it=>{ state.m=it.m; upd(); },3);
  state.m=1; side.append(seg,msg); upd(); }

/* ======================= Steckbriefe ======================= */
const steckbriefe={
  gerade:{titel:"Lineare Funktion und Gerade", buch:"S. 15 Merkkasten · S. 16 Beispiel 1",
    text:S`Eine lineare Funktion hat die Gleichung $f(x)=m\cdot x+b$. Ihr Graph ist eine Gerade. Die Zahl $m$ ist die Steigung: Geht man 1 nach rechts, geht es $m$ nach oben (bei negativem $m$ nach unten). Die Zahl $b$ ist der y-Achsenabschnitt: Dort schneidet die Gerade die y-Achse. Für $b=0$ geht die Gerade durch den Ursprung.`,
    formel:S`f(x)=m\cdot x+b`,
    merke:S`$m$ steht beim $x$ und gibt an, wie steil die Gerade ist. $b$ steht allein und ist die Höhe bei $x=0$.`,
    viz:vizGerade,
    check:{q:S`Welche Steigung und welchen y-Achsenabschnitt hat $f(x)=-2x+5$?`,
      o:[S`$m=-2$ und $b=5$`,S`$m=5$ und $b=-2$`,S`$m=2$ und $b=5$`],
      h:"Das m steht beim x, das b steht allein.",
      e:S`Beim $x$ steht $-2$: Die Steigung ist $m=-2$, die Gerade fällt. Die Zahl $5$ steht allein: Die Gerade schneidet die y-Achse bei $b=5$.`}},
  steigung:{titel:"Steigung aus zwei Punkten", buch:"S. 16 Merkkasten · Beispiel 1 a)",
    text:S`Liegen $P(x_P|y_P)$ und $Q(x_Q|y_Q)$ auf einer Geraden, bekommst du die Steigung aus dem Steigungsdreieck: $m=\dfrac{\Delta y}{\Delta x}=\dfrac{y_Q-y_P}{x_Q-x_P}$. Bestimme zuerst den Weg nach rechts ($\Delta x$), dann den Weg nach oben oder unten ($\Delta y$). Steigt die Gerade, ist $m>0$. Fällt sie, ist $m<0$.`,
    formel:S`m=\frac{y_Q-y_P}{x_Q-x_P}`,
    merke:S`Oben und unten in derselben Reihenfolge rechnen: immer Q minus P.`,
    viz:vizSteigung,
    check:{q:S`Eine Gerade geht durch $P(1|2)$ und $Q(3|8)$. Welche Steigung hat sie?`,
      o:[S`$m=3$`,S`$m=\frac13$`,S`$m=-3$`],
      h:"Teile den Weg nach oben durch den Weg nach rechts.",
      e:S`$\Delta y=8-2=6$ und $\Delta x=3-1=2$, also $m=\frac62=3$.`}},
  term:{titel:"Funktionsterm aufstellen", buch:"S. 17 Beispiel 2 · S. 18 A7",
    text:S`Du kennst die Steigung und einen Punkt? Dann setzt du den Ansatz $f(x)=m\cdot x+b$ an, setzt den Punkt ein und löst nach $b$ auf. Du kennst zwei Punkte? Dann berechnest du zuerst die Steigung aus dem Steigungsdreieck und setzt danach einen der Punkte ein.`,
    formel:S`y=m\cdot x+b`,
    merke:S`Ansatz, Punkt einsetzen, $b$ ausrechnen, Term hinschreiben. Mit dem zweiten Punkt kannst du die Probe machen.`,
    viz:vizTerm,
    check:{q:S`Die Gerade hat die Steigung $2$ und geht durch $P(3|5)$. Welchen Term hat sie?`,
      o:[S`$f(x)=2x-1$`,S`$f(x)=2x+5$`,S`$f(x)=2x+1$`],
      h:"Setze P in 5 = 2 · 3 + b ein und löse nach b auf.",
      e:S`$5=2\cdot 3+b$ ergibt $b=-1$. Probe: $f(3)=2\cdot 3-1=5$.`}},
  punkte:{titel:"Punktprobe, f(0) und Nullstelle", buch:"S. 17 Beispiel 3 a) und c) · S. 18 A8",
    text:S`Bei der <b>Punktprobe</b> setzt du die x-Koordinate eines Punktes in den Term ein und vergleichst mit seiner y-Koordinate. Der Schnittpunkt mit der <b>y-Achse</b> hat $x=0$, du berechnest also $f(0)$. Der Schnittpunkt mit der <b>x-Achse</b> hat $y=0$, du löst die Gleichung $f(x)=0$. Diese Stelle heißt Nullstelle.`,
    formel:S`S(0|f(0)),\quad N(x_0|0)`,
    merke:S`y-Achse: $x=0$ einsetzen. x-Achse: $f(x)=0$ lösen.`,
    viz:vizPunkte,
    check:{q:S`Wo schneidet der Graph von $f(x)=2x-6$ die x-Achse?`,
      o:[S`bei $x=3$, im Punkt $N(3|0)$`,S`bei $x=-6$, im Punkt $N(-6|0)$`,S`bei $x=6$, im Punkt $N(6|0)$`],
      h:"Auf der x-Achse ist y = 0. Löse 2x − 6 = 0.",
      e:S`$2x-6=0$ ergibt $2x=6$, also $x=3$. Der Schnittpunkt ist $N(3|0)$.`}},
  winkel:{titel:"Steigungswinkel", buch:"S. 17 Beispiel 3 b) und Beispiel 4",
    text:S`Die Gerade schließt mit der x-Achse einen Winkel $\alpha$ ein, den Steigungswinkel. Es gilt $\tan\alpha=m$. Mit dem Taschenrechner ($\tan^{-1}$) bekommst du $\alpha$. Bei negativer Steigung zeigt der Taschenrechner einen negativen Winkel: den Winkel im Uhrzeigersinn. Der Steigungswinkel wird aber entgegen dem Uhrzeigersinn gemessen. Du rechnest also $180^\circ$ minus den Betrag.`,
    formel:S`\tan\alpha=m`,
    merke:S`Positive Steigung: $\alpha$ zwischen $0^\circ$ und $90^\circ$. Negative Steigung: $\alpha$ zwischen $90^\circ$ und $180^\circ$.`,
    viz:vizWinkel,
    check:{q:S`Eine Gerade hat die Steigung $m=-1$. Wie groß ist ihr Steigungswinkel?`,
      o:[S`$135^\circ$`,S`$-45^\circ$`,S`$45^\circ$`],
      h:"Der Taschenrechner liefert −45°. Der Steigungswinkel wird entgegen dem Uhrzeigersinn gemessen.",
      e:S`$\tan^{-1}(-1)=-45^\circ$. Entgegen dem Uhrzeigersinn gemessen ist $\alpha=180^\circ-45^\circ=135^\circ$.`}}
};

/* ======================= Aufgabenbausteine ======================= */
MM.K3T={};
const br=x=>x<0?`(${tn(x)})`:tn(x);
const sit=html=>`<span class="bigtex">${html}</span>`;
const NZ=[-3,-2,-1,1,2,3];
const FR=[-1.5,-0.5,0.5,1.5];
const gp=(p)=>`(${ts(p[0])}|${ts(p[1])})`;

function viewLines(api,o){ const host=api.cv(""); lineView(host,o); return {}; }
function graphMc(o){ return MM.mcTask({viz:api=>viewLines(api,{lines:()=>o.lines||[],marks:o.marks,after:o.after,box:o.box}),q:o.q,hint:o.hint,opts:o.opts,col:o.col,keepOrder:o.keepOrder,erkl:o.erkl}); }

function readTermTask(L,opt){ opt=opt||{}; const {m,b}=L; const o=termOpts(m,b,wrongTerms(m,b,{near:opt.near,nearM:opt.nearM,extra:opt.extra}),{}); if(!o) return null;
  return graphMc({lines:[{m,b}],q:"Welcher Funktionsterm gehört zur Geraden?",opts:o,col:true,
    erkl:`Die Gerade schneidet die y-Achse bei ${ts(b)}, also ist $b=${tn(b)}$. ${stepText(m)}, also ist $m=${tn(m)}$. Der Term lautet $${fT(m,b)}$.`}); }

// Zeichenaufgabe: Gerade durch zwei ziehbare Punkte. o:{q,hint,target:{m,b},marks:[{x,y,label}],erkl}
function defaultAB(t){ const c=[[-2,-1,2,-1],[-3,1,3,1],[-2,2,2,-2],[-4,-3,0,-3]];
  for(const [a,b,x,y] of c){ const L=lineThrough({x:a,y:b},{x,y}); if(!sameLine(L,t)) return [{x:a,y:b},{x,y}]; } }
function lineFb(L,t){ if(!L) return "";
  const sm=near(L.m,t.m), sb=near(L.b,t.b);
  if(sm&&sb) return "";
  if(sm) return `Die Steigung deiner Geraden stimmt, aber sie schneidet die y-Achse bei ${num(L.b)}. Gesucht ist ${num(t.b)}.`;
  if(sb) return `Deine Gerade schneidet die y-Achse richtig, aber ihre Steigung ist ${num(L.m)}. Gesucht ist ${num(t.m)}.`;
  if(near(L.m,-t.m)) return `Deine Gerade hat die Steigung ${num(L.m)}. Gesucht ist ${num(t.m)}: Die Richtung ist falsch herum.`;
  return `Deine Gerade hat die Steigung ${num(L.m)} und schneidet die y-Achse bei ${num(L.b)}. Gesucht ist die Steigung ${num(t.m)} und der y-Achsenabschnitt ${num(t.b)}.`; }
function drawTask(o){ return {run(api){
  const t=o.target; const pts=defaultAB(t); const [A,B]=pts; let done=false, verdict=null, L=null;
  const host=api.cv("");
  const lv=lineView(host,{lines:()=>{ L=lineThrough(A,B); const out=[]; if(L) out.push({m:L.m,b:L.b,c:done?(verdict?"ok":"bad"):"wave"}); if(done&&!verdict) out.push({m:t.m,b:t.b,c:"ok"}); return out; },
    marks:col=>(o.marks||[]).map(p=>({x:p.x,y:p.y,label:p.label||"",color:col.mark})),
    after:(c,col,geo)=>drawHandles(c.ctx,geo,col,pts,["A","B"],done)});
  if(o.badge) api.badge(o.badge);
  api.prompt(T(o.q)); api.hint(o.hint||"Ziehe die Punkte A und B. Sie rasten auf ganzen Zahlen ein. Deine Gerade geht durch A und B.");
  const chk=el("button",{class:"btn"},"Prüfen"); api.actions.appendChild(chk);
  makeDrag(lv.cvw.st.c,()=>lv.ref.geo,pts,()=>lv.cvw.redraw(),()=>done,true);
  const run=()=>{ if(done) return; done=true; L=lineThrough(A,B); verdict=sameLine(L,t); lv.cvw.redraw(); api.actions.innerHTML="";
    api.feedback(verdict,T((verdict?"":lineFb(L,t)+" ")+o.erkl)); api.finish(verdict); };
  chk.addEventListener("click",run);
  MM.K3T.cur={kind:"draw",A,B,t,run,redraw:lv.cvw.redraw,marks:o.marks||[],geo:()=>lv.ref.geo,canvas:lv.cvw.st.c};
}};}

// Punkt auf Gerade ziehen. o:{q,line,axis:"y"|"x",at,hide,erkl}
function pointTask(o){ return {run(api){
  const L=o.line, ax=o.axis; let goal=ax==="y"?L.m*o.at+L.b:(o.at-L.b)/L.m;
  if(!Number.isInteger(R2(goal))||Math.abs(goal)>6) throw new Error("pointTask: Ziel nicht ganzzahlig");
  goal=Math.round(goal); let start=goal; for(const d of shuffle([-4,-3,-2,2,3,4])){ if(Math.abs(goal+d)<=6){ start=goal+d; break; } }
  const P=ax==="y"?{x:o.at,y:start,fixX:true}:{x:start,y:o.at,fixY:true}; let done=false, ok=false;
  const host=api.cv("");
  const lv=lineView(host,{lines:()=>(!o.hide||done)?[{m:L.m,b:L.b,c:done?"ok":"wave"}]:[],
    after:(c,col,geo)=>{ const ctx=c.ctx;
      if(!done){ ctx.save(); ctx.setLineDash([5,5]); ctx.strokeStyle=col.muted; ctx.lineWidth=1.6; ctx.beginPath();
        if(ax==="y"){ ctx.moveTo(geo.X(o.at),geo.Y(-7)); ctx.lineTo(geo.X(o.at),geo.Y(7)); } else { ctx.moveTo(geo.X(-7),geo.Y(o.at)); ctx.lineTo(geo.X(7),geo.Y(o.at)); } ctx.stroke(); ctx.restore(); }
      if(done&&!ok){ const gx=ax==="y"?o.at:goal, gy=ax==="y"?goal:o.at; ctx.save(); ctx.strokeStyle=col.ok; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(geo.X(gx),geo.Y(gy),17,0,MM.TAU); ctx.stroke(); ctx.restore(); }
      drawHandles(ctx,geo,col,[P],["P"],done); }});
  api.prompt(T(o.q)); api.hint("Ziehe den Punkt P. Er bewegt sich nur "+(ax==="y"?"nach oben und unten":"nach links und rechts")+" und rastet auf ganzen Zahlen ein.");
  const chk=el("button",{class:"btn"},"Prüfen"); api.actions.appendChild(chk);
  makeDrag(lv.cvw.st.c,()=>lv.ref.geo,[P],()=>lv.cvw.redraw(),()=>done,false);
  const run=()=>{ if(done) return; done=true; ok=ax==="y"?P.y===goal:P.x===goal; lv.cvw.redraw(); api.actions.innerHTML="";
    api.feedback(ok,T((ok?"":`Dein Punkt liegt bei $P${ptT(P.x,P.y)}$. `)+o.erkl)); api.finish(ok); };
  chk.addEventListener("click",run);
  MM.K3T.cur={kind:"point",P,goal,ax,run,redraw:lv.cvw.redraw,geo:()=>lv.ref.geo,canvas:lv.cvw.st.c};
}};}

/* ======================= Challenge 1 · Geraden-Werkstatt ======================= */
function exPts(L){ const p=gridPts(L.m,L.b); return [p[0],p[p.length-1]]; }
function gReadTerm(){ return readTermTask(randLine({ms:NZ}),{near:true}); }
function gProp(){ const L=randLine({ms:NZ}); const {m,b}=L; if(Math.abs(m)===Math.abs(b)) return null; const askM=Math.random()<.5;
  const cands=askM?[{v:b,fb:"Das ist b, der y-Achsenabschnitt. Die Steigung steht beim x."},{v:-m,fb:"Das Vorzeichen stimmt nicht."},{v:-b,fb:"Die Steigung steht beim x."}]
    :[{v:m,fb:"Das ist m, die Steigung. Der y-Achsenabschnitt steht allein."},{v:-b,fb:"Das Vorzeichen stimmt nicht. Es gehört zur Zahl, die allein steht."},{v:-m,fb:"Der y-Achsenabschnitt steht allein, nicht beim x."}];
  const o=pickOpts(askM?m:b,cands,v=>`$${askM?"m":"b"}=${tn(v)}$`); if(!o) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:askM?"Welche Steigung $m$ hat der Graph?":"Welchen y-Achsenabschnitt $b$ hat der Graph?",opts:o,
    erkl:`In $${fT(m,b)}$ steht die Steigung $m=${tn(m)}$ beim $x$. Der y-Achsenabschnitt $b=${tn(b)}$ steht allein.`}); }
function gDrawGraph(L){ L=L||randLine({}); const [P,Q]=exPts(L);
  return drawTask({target:L,q:`Zeichne den Graphen von $${fT(L.m,L.b)}$.`,
    erkl:`Der Graph schneidet die y-Achse bei $b=${tn(L.b)}$. ${stepText(L.m)}. Zum Beispiel liegen $P${ptT(P[0],P[1])}$ und $Q${ptT(Q[0],Q[1])}$ auf der Geraden.`}); }
function gCombo(){ const L=randLine({ms:NZ}); const sm=L.m>0?1:-1, sb=L.b>0?1:-1;
  const txt=([a,c])=>`$m${a>0?">":"<"}0$ und $b${c>0?">":"<"}0$`;
  const o=[[1,1],[1,-1],[-1,1],[-1,-1]].map(n=>{ const ok=n[0]===sm&&n[1]===sb; let fb="";
    if(!ok){ if(n[0]!==sm) fb+=`Die Gerade ${sm>0?"steigt":"fällt"}, also ist $m$ ${sm>0?"positiv":"negativ"}. `; if(n[1]!==sb) fb+=`Sie schneidet die y-Achse ${sb>0?"oberhalb":"unterhalb"} des Ursprungs, also ist $b$ ${sb>0?"positiv":"negativ"}. `; }
    return {t:txt(n),ok,fb:fb.trim()}; });
  return graphMc({lines:[L],q:"Welche Aussage über $m$ und $b$ passt zur Geraden?",opts:o,col:true,keepOrder:true,
    erkl:`Die Gerade ${sm>0?"steigt":"fällt"}: $m${sm>0?">":"<"}0$. Sie schneidet die y-Achse ${sb>0?"oberhalb":"unterhalb"} des Ursprungs: $b${sb>0?">":"<"}0$.`}); }
function gDrawWords(){ const L=randLine({}); const [P,Q]=exPts(L);
  return drawTask({target:L,q:`Zeichne die Gerade mit der Steigung $m=${tn(L.m)}$ und dem y-Achsenabschnitt $b=${tn(L.b)}$.`,
    erkl:`Die Gerade geht durch $(0|${tn(L.b)})$. ${stepText(L.m)}. Zum Beispiel liegen $P${ptT(P[0],P[1])}$ und $Q${ptT(Q[0],Q[1])}$ auf ihr.`}); }

// Level 2
function gTriRead(){ const L=randLine({ms:[-3,-2,-1.5,-0.5,0.5,1.5,2,3]}); const {m}=L; const k=stepOf(m); const dx=k*one([1,2].filter(f=>k*f<=4)); const dy=R2(m*dx);
  const pts=gridPts(m,L.b).filter(p=>p[0]+dx<=6&&Math.abs(p[1]+dy)<=6); if(!pts.length) return null; const P=one(pts);
  const cands=[{v:-m,fb:`Das Vorzeichen stimmt nicht: Die Gerade ${m>0?"steigt":"fällt"}, also ist $m$ ${m>0?"positiv":"negativ"}.`},{v:dy,fb:"Das ist nur Δy. Teile noch durch Δx."},{v:dx,fb:"Das ist nur Δx. Die Steigung ist Δy geteilt durch Δx."}];
  if(exact(dx/dy)) cands.push({v:dx/dy,fb:"Du hast Δx durch Δy geteilt. Richtig ist Δy durch Δx."}); if(exact(-dx/dy)) cands.push({v:-dx/dy,fb:"Du hast Δx durch Δy geteilt. Richtig ist Δy durch Δx."});
  const o=pickOpts(m,cands,v=>`$m=${tn(v)}$`); if(!o) return null;
  return graphMc({lines:[L],marks:col=>[{x:P[0],y:P[1],label:"",color:col.mark},{x:P[0]+dx,y:P[1]+dy,label:"",color:col.mark}],after:(c,col,geo)=>triangle(c.ctx,geo,col,{x:P[0],y:P[1]},dx,dy),
    q:"Wie groß ist die Steigung $m$ der Geraden? Lies $\\Delta x$ und $\\Delta y$ am Steigungsdreieck ab.",opts:o,
    erkl:S`$m=\dfrac{\Delta y}{\Delta x}=\dfrac{${tn(dy)}}{${tn(dx)}}=${tn(m)}$`}); }
function twoPts(L){ const p=gridPts(L.m,L.b); const i=ri(0,p.length-2), j=ri(i+1,p.length-1); return [p[i],p[j]]; }
function gTwoM(){ const L=randLine({ms:[-3,-2,-1.5,-1,-0.5,0.5,1,1.5,2,3]}); const [P,Q]=twoPts(L); const dx=Q[0]-P[0], dy=Q[1]-P[1], m=L.m;
  const cands=[{v:-m,fb:"Das Vorzeichen stimmt nicht. Rechne oben und unten in derselben Reihenfolge: immer Q minus P."},{v:dy,fb:"Das ist nur Δy. Teile noch durch Δx."},{v:dx,fb:"Das ist nur Δx. Die Steigung ist Δy geteilt durch Δx."}];
  if(exact(dx/dy)) cands.push({v:dx/dy,fb:"Du hast Δx durch Δy geteilt. Richtig ist Δy durch Δx."});
  const o=pickOpts(m,cands,v=>`$m=${tn(v)}$`); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`P${ptT(P[0],P[1])},\;Q${ptT(Q[0],Q[1])}`)),label:"Zwei Punkte auf einer Geraden",q:"Welche Steigung hat die Gerade durch $P$ und $Q$?",opts:o,
    erkl:S`$m=\dfrac{y_Q-y_P}{x_Q-x_P}=\dfrac{${tn(Q[1])}-${br(P[1])}}{${tn(Q[0])}-${br(P[0])}}=\dfrac{${tn(dy)}}{${tn(dx)}}=${tn(m)}$`}); }
function gDrawSlope(){ const L=randLine({ms:[-3,-2,-1.5,-0.5,0.5,1.5,2,3]}); const P=one(gridPts(L.m,L.b).filter(p=>p[0]!==0));
  return drawTask({target:L,marks:[{x:P[0],y:P[1],label:"P"+gp(P)}],q:`Zeichne die Gerade durch $P${ptT(P[0],P[1])}$ mit der Steigung $m=${tn(L.m)}$.`,
    erkl:`Von $P$ aus gilt: ${stepText(L.m)}. So bekommst du einen zweiten Punkt.`}); }
function gDrawTwo(){ const L=randLine({ms:[-3,-2,-1.5,-1,-0.5,0.5,1,1.5,2,3]}); const [P,Q]=twoPts(L); const dx=Q[0]-P[0], dy=Q[1]-P[1];
  return drawTask({target:L,marks:[{x:P[0],y:P[1],label:"P"+gp(P)},{x:Q[0],y:Q[1],label:"Q"+gp(Q)}],q:`Zeichne die Gerade durch $P${ptT(P[0],P[1])}$ und $Q${ptT(Q[0],Q[1])}$.`,
    erkl:S`Die Gerade geht durch beide Punkte. Ihre Steigung ist $m=\dfrac{${tn(dy)}}{${tn(dx)}}=${tn(L.m)}$.`}); }
function gChange(){ const L=randLine({ms:[-3,-2,-1.5,-0.5,0.5,1.5,2,3]}); const m=L.m, up=m>0, w=up?"größer":"kleiner", ow=up?"kleiner":"größer", a=Math.abs(m);
  const o=[{t:`y wird um ${num(a)} ${w}`,ok:true},{t:`y wird um ${num(a)} ${ow}`,fb:`Die Gerade ${up?"steigt":"fällt"}. Geht man nach rechts, wird y ${w}.`},{t:`y wird um ${num(a+1)} ${w}`,fb:"Die Größe der Änderung ist die Steigung. Lies sie am Steigungsdreieck ab."},{t:"y bleibt gleich",fb:"y bleibt nur bei einer waagerechten Geraden gleich."}];
  return graphMc({lines:[L],q:"Wie verändert sich $y$, wenn $x$ um 1 größer wird?",opts:o,col:true,
    erkl:`Die Steigung ist $m=${tn(m)}$. Geht man 1 nach rechts, wird $y$ um ${num(a)} ${w}.`}); }

// Level 3
function gReadSpecial(){ const origin=Math.random()<.5; let L,o,erkl;
  if(origin){ const m=one(NZ); L={m,b:0}; o=termOpts(m,0,[{m:-m,b:0,fb:"Das Vorzeichen der Steigung stimmt nicht."},{m,b:2,fb:"Die Gerade geht durch den Ursprung. Sie schneidet die y-Achse also bei 0, nicht bei 2."},{m,b:-2,fb:"Die Gerade geht durch den Ursprung. Sie schneidet die y-Achse also bei 0, nicht bei -2."},{m:0,b:m,allowZero:true,fb:"Das ist eine waagerechte Gerade. Hier steigt oder fällt die Gerade."}],{});
    erkl=`Die Gerade geht durch den Ursprung, also ist $b=0$. ${stepText(m)}, also ist $m=${tn(m)}$. Der Term lautet $${fT(m,0)}$.`; }
  else { const b=one([-4,-3,-2,-1,1,2,3,4]); L={m:0,b}; o=termOpts(0,b,[{m:b,b:0,fb:"Das ist eine Gerade durch den Ursprung. Hier verläuft die Gerade waagerecht."},{m:1,b,fb:"Mit m = 1 würde die Gerade steigen. Hier ändert sich y nie."},{m:0,b:-b,allowZero:true,fb:"Das Vorzeichen stimmt nicht."},{m:-1,b,fb:"Mit m = −1 würde die Gerade fallen. Hier ändert sich y nie."}],{});
    erkl=`Die Gerade ist waagerecht: $y$ hat überall den Wert ${ts(b)}. Also ist $m=0$ und der Term lautet $${fT(0,b)}$.`; }
  if(!o) return null; return graphMc({lines:[L],q:"Welcher Funktionsterm gehört zur Geraden?",opts:o,col:true,erkl}); }
function gDrawSpecial(){ const origin=Math.random()<.5; const L=origin?{m:one(NZ),b:0}:{m:0,b:one([-4,-3,-2,-1,1,2,3,4])};
  return drawTask({target:L,q:`Zeichne den Graphen von $${fT(L.m,L.b)}$.`,erkl:origin?`Die Gerade geht durch den Ursprung $(0|0)$. ${stepText(L.m)}.`:`Die Gerade ist waagerecht und schneidet die y-Achse bei ${ts(L.b)}. Alle Punkte haben $y=${tn(L.b)}$.`}); }
function gSteeper(){ const ML=[-3,-2,-1.5,-1,-0.5,0.5,1,1.5,2,3]; const m1=one(ML), m2=one(ML); if(Math.abs(m1)===Math.abs(m2)||(m1>0&&m2>0)) return null;
  const b1=one([-3,-2,-1,1,2,3]), b2=one([-3,-2,-1,1,2,3]); const fSteil=Math.abs(m1)>Math.abs(m2);
  const o=[{t:"Der Graph von $f$",ok:fSteil,fb:fSteil?"":"Steil heißt: großer Betrag der Steigung. Ob die Gerade steigt oder fällt, spielt dafür keine Rolle."},{t:"Der Graph von $g$",ok:!fSteil,fb:!fSteil?"":"Steil heißt: großer Betrag der Steigung. Ob die Gerade steigt oder fällt, spielt dafür keine Rolle."},{t:"Beide sind gleich steil",fb:"Die Beträge der Steigungen sind verschieden."}];
  return MM.mcTask({sit:sit(tex(fT(m1,b1,"f"))+"<br>"+tex(fT(m2,b2,"g"))),label:"Zwei Geraden",q:"Welcher Graph ist steiler?",opts:o,keepOrder:true,col:true,
    erkl:`Es zählt der Betrag der Steigung: $|m_f|=${tn(Math.abs(m1))}$ und $|m_g|=${tn(Math.abs(m2))}$. Der Graph von $${fSteil?"f":"g"}$ ist steiler.`}); }
function gDrawFrac(){ return gDrawGraph(randLine({ms:FR})); }
function gReadFrac(){ return readTermTask(randLine({ms:FR}),{near:true,nearM:true}); }

const lvl=gens=>()=>shuffle(gens.map(g=>retry(g)));
const CH_GERADE={titel:"Geraden-Werkstatt", art:"Ablesen und Zeichnen", buch:"S. 15 bis 16",
  kurz:"Steigung und y-Achsenabschnitt ablesen und Geraden zeichnen.",
  intro:"Du liest an Geraden die Steigung und den y-Achsenabschnitt ab und zeichnest Geraden selbst. Beim Zeichnen ziehst du zwei Punkte, A und B, auf die richtige Stelle. Deine Gerade geht durch beide Punkte.",
  levels:[{name:"m und b erkennen",info:"Term und Graph, Steigung und y-Achsenabschnitt.",make:lvl([gReadTerm,gProp,()=>gDrawGraph(),gCombo,gDrawWords])},
          {name:"Steigungsdreieck",info:"Δx und Δy, zwei Punkte, Geraden durch Punkte.",make:lvl([gTriRead,gTwoM,gDrawSlope,gDrawTwo,gChange])},
          {name:"Sonderfälle und Brüche",info:"Ursprungsgeraden, waagerechte Geraden, Steigung wie 0,5.",make:lvl([gReadSpecial,gDrawSpecial,gSteeper,gDrawFrac,gReadFrac])}]};

/* ======================= Challenge 2 · Term-Schmiede ======================= */
function mpData(o){ o=o||{}; for(let k=0;k<400;k++){ const m=one(o.ms||M_LIST), b=one(o.bs||[-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]), x=one(o.xs||[-4,-3,-2,-1,1,2,3,4]); const y=m*x+b; if(Number.isInteger(R2(y))&&Math.abs(y)<=12) return {m,b,x,y:Math.round(y)}; } return null; }
function tMB(){ const m=one(NZ), b=one([-5,-4,-3,-2,-1,1,2,3,4,5]); const o=termOpts(m,b,wrongTerms(m,b,{extra:[{m:-m,b:-b,fb:"Beide Vorzeichen stimmen nicht."}]}),{}); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`m=${tn(m)},\;b=${tn(b)}`)),label:"Gegeben",q:"Welcher Funktionsterm hat diese Steigung und diesen y-Achsenabschnitt?",opts:o,col:true,
    erkl:`Die Steigung $m=${tn(m)}$ steht beim $x$, der y-Achsenabschnitt $b=${tn(b)}$ steht allein: $${fT(m,b)}$.`}); }
function tTable(){ const L=randLine({ms:M_LIST,bs:[-5,-4,-3,-2,-1,1,2,3,4,5]}); const {m,b}=L; const xs=[0,1,2,3]; const ys=xs.map(x=>R2(m*x+b));
  const o=termOpts(m,b,wrongTerms(m,b,{near:true,nearM:true}),{}); if(!o) return null;
  return MM.mcTask({viz:api=>{ const w=el("div",{class:"situ"},`<span class="eyebrow">Wertetabelle</span>${MM.tableHtml(xs,ys,{})}`); api.viz.appendChild(w); return {}; },q:"Welcher Funktionsterm passt zur Wertetabelle?",opts:o,col:true,
    erkl:`Bei $x=0$ steht in der Tabelle ${ts(b)}, also ist $b=${tn(b)}$. Pro Schritt nach rechts ändert sich $y$ um ${ts(m)}, also ist $m=${tn(m)}$. Der Term lautet $${fT(m,b)}$.`}); }
function tWords(){ const m0=one([1,2,3]), b0=one([1,2,3,4,5]), sm=one([1,-1]), sb=one([1,-1]);
  const f=(a,c)=>`$${fT(a*m0,c*b0)}$`;
  const o=[[1,1],[1,-1],[-1,1],[-1,-1]].map(([a,c])=>({t:f(a,c),ok:a===sm&&c===sb,fb:(a!==sm?`Die Gerade ${sm>0?"steigt":"fällt"}, also ist $m$ ${sm>0?"positiv":"negativ"}. `:"")+(c!==sb?`Die Gerade schneidet die y-Achse bei ${ts(sb*b0)}, also ist $b=${tn(sb*b0)}$.`:"")}));
  return MM.mcTask({sit:`Die Gerade ${sm>0?"steigt":"fällt"}: Geht man 1 nach rechts, geht es um ${m0} nach ${sm>0?"oben":"unten"}. Sie schneidet die y-Achse bei ${ts(sb*b0)}.`,label:"Beschreibung in Worten",q:"Welcher Funktionsterm passt zu dieser Beschreibung?",opts:o,col:true,
    erkl:`${sm>0?"Steigt":"Fällt"} die Gerade, ist $m=${tn(sm*m0)}$. Der y-Achsenabschnitt ist $b=${tn(sb*b0)}$. Term: $${fT(sm*m0,sb*b0)}$.`}); }
function tOnLine(){ const m=one(NZ), b=one([-4,-3,-2,-1,1,2,3,4]); const f=x=>m*x+b; const pts=[[0,b,true,""],[b,0,false,"Die Koordinaten sind vertauscht. Der y-Achsenabschnitt ist der y-Wert bei $x=0$."],[0,m,false,"$m$ ist die Steigung, kein y-Wert."],[m,0,false,"$m$ ist die Steigung, kein x-Wert."]];
  if(pts.some(p=>!p[2]&&near(f(p[0]),p[1]))) return null; const seen=new Set(pts.map(p=>p[0]+"|"+p[1])); if(seen.size<4) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:"Durch welchen Punkt geht der Graph sicher?",opts:pts.map(p=>({t:`$${ptT(p[0],p[1])}$`,ok:p[2],fb:p[3]})),
    erkl:`Bei $x=0$ ist $f(0)=${tn(b)}$. Der Graph geht also durch $(0|${tn(b)})$, den Schnittpunkt mit der y-Achse.`}); }
function tReadNear(){ return readTermTask(randLine({ms:M_LIST}),{near:true,nearM:true}); }

// Level 2: Steigung und ein Punkt
function lineStr(m,x,y,b){ return S`${tn(y)}=${tn(m)}\cdot ${br(x)}+b`; }
function tMPterm(o){ const d=mpData(o); if(!d) return null; const {m,b,x,y}=d; const cands=[{m,b:y+m*x,fb:"Beim Auflösen nach $b$ rechnest du $y-m\\cdot x$, nicht plus."},{m,b:y,fb:"Du musst erst $m\\cdot x$ abziehen: $b=y-m\\cdot x$."},{m,b:-b,fb:"Das Vorzeichen von $b$ stimmt nicht. Mach die Probe mit dem Punkt."},{m:-m,b:y-(-m)*x,fb:"Die Steigung steht schon fest: Sie wird übernommen."}];
  const o2=termOpts(m,b,cands,{}); if(!o2) return null;
  return MM.mcTask({sit:sit(tex(S`m=${tn(m)},\;P${ptT(x,y)}`)),label:"Gegeben",q:"Welcher Funktionsterm hat diese Steigung und geht durch $P$?",opts:o2,col:true,
    erkl:S`Ansatz $f(x)=${tn(m)}x+b$. $P$ einsetzen: $${tn(y)}=${tn(m)}\cdot ${br(x)}+b$, also $b=${tn(y)}-${br(m*x)}=${tn(b)}$. Term: $${fT(m,b)}$.`}); }
function tMPb(){ const d=mpData({ms:NZ}); if(!d) return null; const {m,b,x,y}=d; const cands=[{v:y+m*x,fb:"Beim Auflösen rechnest du $y-m\\cdot x$, nicht plus."},{v:y,fb:"Du musst erst $m\\cdot x$ abziehen."},{v:-b,fb:"Das Vorzeichen stimmt nicht."},{v:m*x,fb:"Das ist nur $m\\cdot x$. Gesucht ist, was zu $y$ noch fehlt."}];
  const o=pickOpts(b,cands,v=>`$b=${tn(v)}$`); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`m=${tn(m)},\;P${ptT(x,y)}`)),label:"Gegeben",q:"Die Gerade hat die Form $y=m\\cdot x+b$ und geht durch $P$. Welchen Wert hat $b$?",opts:o,
    erkl:S`$${tn(y)}=${tn(m)}\cdot ${br(x)}+b$ ergibt $b=${tn(y)}-${br(m*x)}=${tn(b)}$.`}); }
// Fehlersuche: steps = Zeilen (TeX), err = Index der ersten falschen Zeile, hint = Erklärung des Fehlers, good = richtige Lösung (TeX)
function fehlerTask(o){ const opts=o.steps.map((s,i)=>({t:`Zeile ${i+1}`,ok:i===o.err,fb:i!==o.err&&i<o.err?"Diese Zeile ist noch richtig.":"Der erste Fehler steckt früher."}));
  return MM.mcTask({viz:api=>{ const w=el("div",{class:"situ"},`<span class="eyebrow">Rechnung</span>${o.steps.map((s,i)=>`<p style="font-size:clamp(17px,2vw,22px)"><b>${i+1}</b>&nbsp; ${tex(s)}</p>`).join("")}`); api.viz.appendChild(w); return {}; },
    q:o.q,opts,keepOrder:true,col:true,erkl:o.hint}); }
function tFehler(){ const d=mpData({ms:NZ}); if(!d) return null; const {m,b,x,y}=d; const e=ri(0,3); let m1=m, eq=lineStr(m,x,y,b), b1=b, bl=null, res=null;
  const bStep=(mm,xx,yy,bb,plus)=>S`b=${tn(yy)}${plus?"+":"-"}${br(mm*xx)}=${tn(bb)}`;
  if(e===0){ m1=-m; }
  let L2,L3,hint;
  if(e===1){ L2=S`${tn(x)}=${tn(m)}\cdot ${br(y)}+b`; b1=x-m*y; L3=S`b=${tn(x)}-${br(m*y)}=${tn(b1)}`; hint=S`Der Punkt $P${ptT(x,y)}$ muss richtig eingesetzt werden: $x=${tn(x)}$ und $y=${tn(y)}$. Richtig ist $${tn(y)}=${tn(m)}\cdot ${br(x)}+b$.`; }
  else { L2=lineStr(m1,x,y,b); b1=y-m1*x; L3=S`b=${tn(y)}-${br(m1*x)}=${tn(b1)}`; hint=e===0?S`Die Steigung ist $m=${tn(m)}$. In Zeile 1 steht ein falsches Vorzeichen.`:""; }
  if(e===2){ b1=y+m*x; L3=S`b=${tn(y)}+${br(m*x)}=${tn(b1)}`; hint=S`Beim Auflösen wird $m\cdot x$ abgezogen: $b=${tn(y)}-${br(m*x)}=${tn(b)}$. Das Plus ist falsch.`; }
  let fin=fT(m1,b1,"f"); if(e===3){ b1=b; m1=m; fin=fT(m,-b,"f"); hint=S`Zeile 3 ergibt $b=${tn(b)}$. In Zeile 4 wurde das Vorzeichen von $b$ vertauscht. Richtig ist $${fT(m,b)}$.`; L2=lineStr(m,x,y,b); L3=S`b=${tn(y)}-${br(m*x)}=${tn(b)}`; }
  if(e===3&&b===0) return null; if(e===1&&near(b1,b)) return null; if(e===0&&false) return null;
  const steps=[S`f(x)=${mx(m1,"x")}+b`,L2,L3,fin]; return fehlerTask({steps,err:e,q:S`Gesucht ist der Term der Geraden mit $m=${tn(m)}$ durch $P${ptT(x,y)}$. In welcher Zeile steckt der erste Fehler?`,hint}); }
function tMPfrac(){ return tMPterm({ms:FR,xs:[-4,-2,2,4]}); }
function tMPneg(){ return tMPterm({ms:[-3,-2,-1.5,-1,-0.5],xs:[-4,-3,-2,2,3,4]}); }

// Level 3: Zwei Punkte
function twoData(o){ o=o||{}; for(let k=0;k<400;k++){ const L=randLine({ms:o.ms||M_LIST,bs:o.bs}); const p=gridPts(L.m,L.b); if(p.length<2) continue; const i=ri(0,p.length-2), j=ri(i+1,p.length-1); const P=p[i],Q=p[j]; if(o.minDx&&Q[0]-P[0]<o.minDx) continue; return {m:L.m,b:L.b,P,Q}; } return null; }
function tTwoExtras(m,b,P,Q){ const dx=Q[0]-P[0], dy=Q[1]-P[1]; const ex=[{m:-m,b:P[1]+m*P[0],fb:"Das Vorzeichen der Steigung stimmt nicht. Rechne oben und unten in derselben Reihenfolge: immer Q minus P."},{m,b:P[1]+m*P[0],fb:"Beim Auflösen nach $b$ rechnest du $y-m\\cdot x$, nicht plus."},{m,b:-b,fb:"Das Vorzeichen von $b$ stimmt nicht. Mach die Probe mit einem der Punkte."}];
  if(exact(dx/dy)&&dy!==0) ex.push({m:dx/dy,b:P[1]-(dx/dy)*P[0],fb:"Du hast Δx durch Δy geteilt. Richtig ist Δy durch Δx."}); return ex; }
function tTwo(opt){ const d=twoData(opt); if(!d) return null; const {m,b,P,Q}=d; const o=termOpts(m,b,tTwoExtras(m,b,P,Q),{}); if(!o) return null; const dx=Q[0]-P[0], dy=Q[1]-P[1];
  return MM.mcTask({sit:sit(tex(S`P${ptT(P[0],P[1])},\;Q${ptT(Q[0],Q[1])}`)),label:"Zwei Punkte",q:"Welcher Funktionsterm gehört zur Geraden durch $P$ und $Q$?",opts:o,col:true,
    erkl:S`$m=\dfrac{${tn(Q[1])}-${br(P[1])}}{${tn(Q[0])}-${br(P[0])}}=${tn(m)}$. $P$ einsetzen: $${tn(P[1])}=${tn(m)}\cdot ${br(P[0])}+b$, also $b=${tn(b)}$. Term: $${fT(m,b)}$.`}); }
function tTwoGraph(){ const d=twoData(); if(!d) return null; const {m,b,P,Q}=d; const o=termOpts(m,b,tTwoExtras(m,b,P,Q),{}); if(!o) return null;
  return graphMc({lines:[],marks:col=>[{x:P[0],y:P[1],label:"P"+gp(P),color:col.mark},{x:Q[0],y:Q[1],label:"Q"+gp(Q),color:col.mark}],q:"Welcher Funktionsterm gehört zur Geraden durch die beiden Punkte?",opts:o,col:true,
    erkl:S`Aus $P${ptT(P[0],P[1])}$ und $Q${ptT(Q[0],Q[1])}$ folgt $m=\dfrac{${tn(Q[1])}-${br(P[1])}}{${tn(Q[0])}-${br(P[0])}}=${tn(m)}$. Mit $P$: $b=${tn(P[1])}-${br(m*P[0])}=${tn(b)}$. Term: $${fT(m,b)}$.`}); }
function tTwoCheck(){ const d=twoData({ms:NZ}); if(!d) return null; const {m,b,P,Q}=d; const f=(mm,bb,p)=>mm*p[0]+bb;
  const mp=one([m+1,m-1,-m,m+2].filter(v=>v!==m&&v!==0)), mq=one([m+1,m-1,-m,m+2].filter(v=>v!==m&&v!==0&&v!==mp));
  if(mp===undefined||mq===undefined) return null;
  const OP={m:mp,b:P[1]-mp*P[0]}, OQ={m:mq,b:Q[1]-mq*Q[0]}, NN={m:m+one([1,-1]),b:b+one([2,-2,3,-3])}; if(NN.m===0) return null;
  const cs=[{...{m,b},ok:true,fb:""},{...OP,ok:false,fb:S`Der Graph geht durch $P$, aber nicht durch $Q$: $f(${tn(Q[0])})=${tn(f(OP.m,OP.b,Q))}\ne ${tn(Q[1])}$.`},{...OQ,ok:false,fb:S`Der Graph geht durch $Q$, aber nicht durch $P$: $f(${tn(P[0])})=${tn(f(OQ.m,OQ.b,P))}\ne ${tn(P[1])}$.`},{...NN,ok:false,fb:S`Dieser Graph geht weder durch $P$ noch durch $Q$.`}];
  if(cs.some(c=>!c.ok&&(near(f(c.m,c.b,P),P[1])&&near(f(c.m,c.b,Q),Q[1])))) return null; if(cs.some(c=>Math.abs(c.b)>20||Math.abs(c.m)>8)) return null;
  if(cs[3].ok===false&&(near(f(NN.m,NN.b,P),P[1])||near(f(NN.m,NN.b,Q),Q[1]))) return null;
  const t=new Set(cs.map(c=>fT(c.m,c.b))); if(t.size<4) return null;
  return MM.mcTask({sit:sit(tex(S`P${ptT(P[0],P[1])},\;Q${ptT(Q[0],Q[1])}`)),label:"Punktprobe",q:"Welcher Graph geht durch $P$ und durch $Q$?",opts:cs.map(c=>({t:`$${fT(c.m,c.b)}$`,ok:c.ok,fb:c.fb})),col:true,
    erkl:S`Nur $${fT(m,b)}$ passt: $f(${tn(P[0])})=${tn(P[1])}$ und $f(${tn(Q[0])})=${tn(Q[1])}$.`}); }
function tTwoFehler(){ const d=twoData({ms:NZ}); if(!d) return null; const {m,b,P,Q}=d; const dx=Q[0]-P[0], dy=Q[1]-P[1]; const e=ri(0,3);
  let m1=m, hint="";
  let L1=S`m=\dfrac{${tn(Q[1])}-${br(P[1])}}{${tn(Q[0])}-${br(P[0])}}=\dfrac{${tn(dy)}}{${tn(dx)}}=${tn(m)}`;
  if(e===0){ m1=-m; L1=S`m=\dfrac{${tn(Q[1])}-${br(P[1])}}{${tn(P[0])}-${br(Q[0])}}=\dfrac{${tn(dy)}}{${tn(-dx)}}=${tn(m1)}`; hint=S`Im Nenner steht $x_P-x_Q$, im Zähler $y_Q-y_P$. Beide müssen in derselben Reihenfolge stehen: $\dfrac{${tn(dy)}}{${tn(dx)}}=${tn(m)}$.`; }
  let L2=S`${tn(P[1])}=${tn(m1)}\cdot ${br(P[0])}+b`; let b1=P[1]-m1*P[0]; let L3=S`b=${tn(P[1])}-${br(m1*P[0])}=${tn(b1)}`; let fin=fT(m1,b1,"f");
  if(e===1){ L2=S`${tn(P[0])}=${tn(m)}\cdot ${br(P[1])}+b`; b1=P[0]-m*P[1]; L3=S`b=${tn(P[0])}-${br(m*P[1])}=${tn(b1)}`; fin=fT(m,b1,"f"); hint=S`Beim Einsetzen gehört $x_P=${tn(P[0])}$ zu $x$ und $y_P=${tn(P[1])}$ auf die linke Seite: $${tn(P[1])}=${tn(m)}\cdot ${br(P[0])}+b$.`; if(near(b1,b)) return null; }
  if(e===2){ b1=P[1]+m*P[0]; L3=S`b=${tn(P[1])}+${br(m*P[0])}=${tn(b1)}`; fin=fT(m,b1,"f"); hint=S`Beim Auflösen wird $m\cdot x$ abgezogen: $b=${tn(P[1])}-${br(m*P[0])}=${tn(b)}$. Das Plus ist falsch.`; if(near(b1,b)) return null; }
  if(e===3){ fin=fT(m,-b,"f"); hint=S`Zeile 3 ergibt $b=${tn(b)}$. In Zeile 4 wurde das Vorzeichen von $b$ vertauscht. Richtig ist $${fT(m,b)}$.`; if(b===0) return null; }
  if(e===0&&near(m1,m)) return null;
  return fehlerTask({steps:[L1,L2,L3,fin],err:e,q:S`Gesucht ist der Term der Geraden durch $P${ptT(P[0],P[1])}$ und $Q${ptT(Q[0],Q[1])}$. In welcher Zeile steckt der erste Fehler?`,hint}); }
function tTwoFrac(){ return tTwo({ms:FR,minDx:2}); }

const CH_TERM={titel:"Term-Schmiede", art:"Funktionsterme aufstellen", buch:"S. 17 bis 18",
  kurz:"Funktionsterme aus Steigung, Punkten, Graphen und Tabellen aufstellen.",
  intro:"Du stellst Funktionsterme auf. Zuerst aus Steigung und y-Achsenabschnitt, dann aus der Steigung und einem Punkt, zuletzt aus zwei Punkten. Dazu gehört auch die Fehlersuche: Du findest die Zeile, in der ein Rechenfehler steckt.",
  levels:[{name:"Aus m und b",info:"Graph, Tabelle, Beschreibung.",make:lvl([tMB,tReadNear,tTable,tWords,tOnLine])},
          {name:"Steigung und ein Punkt",info:"Einsetzen und $b$ ausrechnen.",make:lvl([tMPterm,tMPb,tMPfrac,tFehler,tMPneg])},
          {name:"Zwei Punkte",info:"Steigung ausrechnen, einsetzen, prüfen.",make:lvl([tTwo,tTwoGraph,tTwoCheck,tTwoFehler,tTwoFrac])}]};

/* ======================= Challenge 3 · Punkt-Treffer ======================= */
const iso=(m,v,r,a)=>m===1?`$${v}=${tn(a)}$`:`$${mx(m,v)}=${tn(r)}$, also $${v}=${tn(a)}$`;
const onL=(L,p)=>near(L.m*p[0]+L.b,p[1]);
function pPick(opt){ opt=opt||{}; const L=randLine({ms:opt.ms||M_LIST}); const p=gridPts(L.m,L.b).filter(q=>q[0]!==0); if(!p.length) return null; const P=one(p); const f=x=>L.m*x+L.b;
  const C=[[P[0],-P[1],"Das Vorzeichen von y stimmt nicht."],[P[1],P[0],"Die Koordinaten sind vertauscht: Zuerst kommt x, dann y."],[P[0],P[1]+one([1,-1]),"Fast: y ist um 1 daneben."]];
  const out=[{t:`$P${ptT(P[0],P[1])}$`,ok:true}]; const seen=new Set([P[0]+"|"+P[1]]);
  for(const c of C){ const k=c[0]+"|"+c[1]; if(seen.has(k)||onL(L,c)||Math.abs(c[0])>9||Math.abs(c[1])>9) continue; seen.add(k); out.push({t:`$P${ptT(c[0],c[1])}$`,fb:S`Für $x=${tn(c[0])}$ ergibt sich $f(${tn(c[0])})=${tn(f(c[0]))}$, nicht ${ts(c[1])}. ${c[2]}`}); }
  if(out.length<4){ const c=[P[0],P[1]+one([2,-2]),"y ist daneben."]; const k=c[0]+"|"+c[1]; if(!seen.has(k)&&!onL(L,c)){ out.push({t:`$P${ptT(c[0],c[1])}$`,fb:S`Für $x=${tn(c[0])}$ ergibt sich $f(${tn(c[0])})=${tn(f(c[0]))}$, nicht ${ts(c[1])}.`}); } }
  if(out.length<4) return null;
  return MM.mcTask({sit:sit(tex(fT(L.m,L.b))),label:"Funktionsterm",q:"Welcher Punkt liegt auf dem Graphen von $f$?",opts:out,col:false,
    erkl:S`Punktprobe: $f(${tn(P[0])})=${tn(L.m)}\cdot ${br(P[0])}${sg(L.b)}=${tn(P[1])}$. Das passt zu $P${ptT(P[0],P[1])}$.`}); }
function pPickFrac(){ return pPick({ms:FR}); }
function pGraphPick(){ const L=randLine({}); const p=gridPts(L.m,L.b); const P=one(p); const off=[]; 
  for(let k=0;k<60&&off.length<3;k++){ const c=[one([-5,-4,-3,-2,-1,1,2,3,4,5]),0]; c[1]=Math.round(L.m*c[0]+L.b)+one([-2,-1,1,2]); if(Math.abs(c[1])>6||onL(L,c)||Math.abs(c[1]-(L.m*c[0]+L.b))<1||(c[0]===P[0]&&c[1]===P[1])||off.some(o=>o[0]===c[0]&&o[1]===c[1])) continue; off.push(c); }
  if(off.length<3) return null; const all=shuffle([[P,true],...off.map(o=>[o,false])]); const names=["A","B","C","D"];
  const opts=all.map(([pp,ok],i)=>({t:"Punkt "+names[i],ok,fb:ok?"":`Der Punkt ${names[i]} liegt nicht auf der Geraden.`})); const idx=all.findIndex(a=>a[1]);
  return graphMc({lines:[L],marks:col=>all.map(([pp],i)=>({x:pp[0],y:pp[1],label:names[i],color:col.mark})),q:"Welcher der Punkte liegt genau auf der Geraden?",opts,keepOrder:true,col:false,
    erkl:`Der Punkt ${names[idx]} hat die Koordinaten $${ptT(P[0],P[1])}$ und liegt genau auf der Geraden. Die anderen Punkte liegen daneben.`}); }
function pValue(){ const m=one(M_LIST), b=one([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]), k=one([-4,-3,-2,2,3,4]); const v=m*k+b; if(!exact(v)) return null;
  const cands=[{v:m*k-b,fb:"Das Vorzeichen von $b$ stimmt nicht. Es wird addiert, wie es im Term steht."},{v:b*k+m,fb:"$m$ und $b$ sind vertauscht. $m$ steht beim $x$."},{v:m*k,fb:"Du hast $b$ vergessen."},{v:m+b+k,fb:"Die Zahl $x$ wird mit $m$ multipliziert, nicht addiert."}];
  const o=pickOpts(v,cands,x=>`$${tn(x)}$`); if(!o) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:`Berechne $f(${tn(k)})$.`,opts:o,erkl:S`$f(${tn(k)})=${tn(m)}\cdot ${br(k)}${sg(b)}=${tn(v)}$.`}); }
function pDragY(){ const L=randLine({}); const p=gridPts(L.m,L.b).filter(q=>q[0]!==0); const P=one(p);
  return pointTask({line:L,axis:"y",at:P[0],q:`Ziehe $P$ so, dass er auf dem Graphen von $${fT(L.m,L.b)}$ liegt. Seine x-Koordinate ist ${ts(P[0])}.`,erkl:S`Für $x=${tn(P[0])}$ ist $f(${tn(P[0])})=${tn(P[1])}$. Der Punkt $P${ptT(P[0],P[1])}$ liegt auf dem Graphen.`}); }

// Level 2
function pYAxis(){ const m=one(NZ), b=one([-4,-3,-2,-1,1,2,3,4]); if(m===b) return null; const f=x=>m*x+b;
  const pts=[[0,b,true,""],[b,0,false,"Die Koordinaten sind vertauscht. Auf der y-Achse ist $x=0$."],[0,m,false,"$m$ ist die Steigung, kein y-Wert."],[m,0,false,"$m$ ist die Steigung, kein x-Wert."]];
  if(new Set(pts.map(p=>p[0]+"|"+p[1])).size<4||pts.some(p=>!p[2]&&near(f(p[0]),p[1])&&p[0]===0)) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:"In welchem Punkt schneidet der Graph die y-Achse?",opts:pts.map(p=>({t:`$${ptT(p[0],p[1])}$`,ok:p[2],fb:p[3]})),erkl:S`Auf der y-Achse ist $x=0$: $f(0)=${tn(b)}$. Schnittpunkt: $S(0|${tn(b)})$.`}); }
function zeroData(){ for(let k=0;k<300;k++){ const m=one(M_LIST), x0=one([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]); const b=-m*x0; if(exact(b)&&b!==0&&Math.abs(b)<=9) return {m,b,x0}; } return null; }
function pZero(){ const d=zeroData(); if(!d) return null; const {m,b,x0}=d;
  const cands=[{v:-x0,fb:"Beim Umformen wechselt $b$ das Vorzeichen: $mx=-b$."},{v:b,fb:"Das ist $f(0)$, der y-Achsenabschnitt. Gesucht ist die Stelle mit $f(x)=0$."},{v:-b*m,fb:"Du musst durch $m$ teilen, nicht mit $m$ multiplizieren."},{v:b*m,fb:"Du musst durch $m$ teilen."}];
  const o=pickOpts(x0,cands,v=>`$x=${tn(v)}$`); if(!o) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:"Bestimme die Nullstelle von $f$.",opts:o,erkl:S`$${rhs(m,b)}=0$ ergibt ${iso(m,"x",-b,x0)}.`}); }
function pGraphZero(){ const d=zeroData(); if(!d) return null; const {m,b,x0}=d; if(Math.abs(b)>6||Math.abs(x0)>6||Math.abs(x0)===Math.abs(b)) return null;
  const pts=[[x0,0,true,""],[-x0,0,false,"Das Vorzeichen stimmt nicht. Lies die Stelle auf der x-Achse genau ab."],[0,x0,false,"Die Koordinaten sind vertauscht. Auf der x-Achse ist $y=0$."],[0,b,false,"Das ist der Schnittpunkt mit der y-Achse."]];
  return graphMc({lines:[{m,b}],q:"In welchem Punkt schneidet die Gerade die x-Achse?",opts:pts.map(p=>({t:`$${ptT(p[0],p[1])}$`,ok:p[2],fb:p[3]})),
    erkl:S`Die Gerade schneidet die x-Achse bei $x=${tn(x0)}$. Der Schnittpunkt ist $N${ptT(x0,0)}$.`}); }
function pDrawInt(){ const b=one([-5,-4,-3,-2,-1,1,2,3,4,5]), x0=one([-5,-4,-3,-2,-1,1,2,3,4,5]); const m=-b/x0; const L={m,b};
  return drawTask({target:L,q:`Zeichne die Gerade, die die y-Achse bei $${tn(b)}$ und die x-Achse bei $${tn(x0)}$ schneidet.`,erkl:S`Die Gerade geht durch $S(0|${tn(b)})$ und durch $N${ptT(x0,0)}$. Ihre Steigung ist $m=\dfrac{0-${br(b)}}{${tn(x0)}-0}=${tn(m)}$.`}); }
function pTermZero(){ const d=zeroData(); if(!d) return null; const {m,b,x0}=d; const f=(mm,bb)=>mm*x0+bb;
  const cands=[{m,b:-b,fb:S`Für $x=${tn(x0)}$ ergibt sich ${ts(f(m,-b))}, nicht 0.`},{m:-m,b,fb:S`Für $x=${tn(x0)}$ ergibt sich ${ts(f(-m,b))}, nicht 0.`},{m:b,b:m,fb:S`Für $x=${tn(x0)}$ ergibt sich ${ts(f(b,m))}, nicht 0.`},{m,b:b+1,fb:S`Für $x=${tn(x0)}$ ergibt sich ${ts(f(m,b+1))}, nicht 0.`}].filter(c=>!near(f(c.m,c.b),0));
  const o=termOpts(m,b,cands,{}); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`x_0=${tn(x0)}`)),label:"Nullstelle",q:`Welche Gerade hat die Nullstelle $x_0=${tn(x0)}$?`,opts:o,col:true,erkl:S`Probe für $x=${tn(x0)}$: $${tn(m)}\cdot ${br(x0)}${sg(b)}=0$. Nur dieser Term hat dort den Funktionswert 0.`}); }

// Level 3
function pTermAxes(){ const d=zeroData(); if(!d) return null; const {m,b,x0}=d; if(Math.abs(b)>9) return null;
  const o=termOpts(m,b,wrongTerms(m,b,{extra:[{m:b/x0,b,fb:"Δx und Δy sind vertauscht oder das Vorzeichen fehlt: $m=\\dfrac{0-b}{x_0-0}$."}]}),{}); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`S(0|${tn(b)}),\;N${ptT(x0,0)}`)),label:"Schnittpunkte mit den Achsen",q:"Welcher Funktionsterm gehört zur Geraden durch $S$ und $N$?",opts:o,col:true,
    erkl:S`$b=${tn(b)}$ steht am y-Achsenabschnitt. $m=\dfrac{0-${br(b)}}{${tn(x0)}-0}=${tn(m)}$. Term: $${fT(m,b)}$.`}); }
function pSolveX(){ const m=one(NZ), b=one([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]), a=one([-4,-3,-2,-1,1,2,3,4]); const y0=m*a+b; if(Math.abs(y0)>12) return null;
  const cands=[{v:(y0+b)/m,fb:"Zuerst $b$ abziehen: $y-b$. Dann durch $m$ teilen."},{v:y0-b,fb:"Du musst noch durch $m$ teilen."},{v:y0*m-b,fb:"Du musst durch $m$ teilen, nicht mit $m$ multiplizieren."},{v:(b-y0)/m,fb:"Das Vorzeichen stimmt nicht: $m\\cdot x=y-b$."}];
  const o=pickOpts(a,cands,v=>`$a=${tn(v)}$`); if(!o) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:`Der Punkt $Q(a|${tn(y0)})$ liegt auf dem Graphen von $f$. Bestimme $a$.`,opts:o,
    erkl:S`$f(a)=${tn(y0)}$ ergibt $${rhs(m,b,"a")}=${tn(y0)}$, also ${iso(m,"a",y0-b,a)}.`}); }
function pDragX(){ const m=one(NZ), b=one([-4,-3,-2,-1,1,2,3,4]); const p=gridPts(m,b).filter(q=>q[1]!==0&&q[0]!==0); if(!p.length) return null; const P=one(p);
  return pointTask({line:{m,b},axis:"x",at:P[1],hide:true,q:`Ziehe $Q$ so, dass er auf dem Graphen von $${fT(m,b)}$ liegt. Seine y-Koordinate ist ${ts(P[1])}. Der Graph ist nicht eingezeichnet.`,
    erkl:S`$${rhs(m,b)}=${tn(P[1])}$ ergibt ${iso(m,"x",P[1]-b,P[0])}. Der Punkt $Q${ptT(P[0],P[1])}$ liegt auf dem Graphen.`}); }
function pStatement(){ const m=one(M_LIST), b=one([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]); if(m===b) return null; const x0=-b/m; if(!exact(x0)||x0===0) return null;
  const st=(p,q)=>`Der Graph schneidet die y-Achse in $${ptT(0,p)}$ und die x-Achse in $${ptT(q,0)}$.`;
  const O=[{t:st(b,x0),ok:true},{t:"",ok:false,fb:"Die Koordinaten sind vertauscht. Auf der y-Achse ist $x=0$, auf der x-Achse ist $y=0$."},{t:st(b,-x0),ok:false,fb:"Die Nullstelle hat das falsche Vorzeichen: $mx=-b$."},{t:st(m,x0),ok:false,fb:"$m$ ist die Steigung. Der y-Achsenabschnitt ist $f(0)=b$."}];
  O[1].t=`Der Graph schneidet die y-Achse in $${ptT(b,0)}$ und die x-Achse in $${ptT(0,x0)}$.`;
  if(new Set(O.map(o=>o.t)).size<4) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:"Welche Aussage stimmt?",opts:O,col:true,erkl:S`$f(0)=${tn(b)}$, also $S(0|${tn(b)})$. $${rhs(m,b)}=0$ ergibt $x=${tn(x0)}$, also $N${ptT(x0,0)}$.`}); }
function pDrawNP(){ const L=randLine({ms:NZ}); const p=gridPts(L.m,L.b); const N=p.find(q=>q[1]===0); if(!N||N[0]===0) return null; const others=p.filter(q=>q[1]!==0&&q[0]!==0); if(!others.length) return null; const P=one(others);
  return drawTask({target:L,marks:[{x:N[0],y:0,label:"N"+gp([N[0],0])},{x:P[0],y:P[1],label:"P"+gp(P)}],q:`Zeichne die Gerade durch die Nullstelle $N${ptT(N[0],0)}$ und den Punkt $P${ptT(P[0],P[1])}$.`,
    erkl:S`Die Gerade geht durch $N$ und $P$. Ihr Term ist $${fT(L.m,L.b)}$. Sie schneidet die y-Achse bei ${ts(L.b)}.`}); }

const CH_PUNKTE={titel:"Punkt-Treffer", art:"Punktprobe und Achsenschnittpunkte", buch:"S. 17 bis 18",
  kurz:"Prüfe, welche Punkte auf der Geraden liegen, und finde die Schnittpunkte mit den Achsen.",
  intro:"Du prüfst, ob ein Punkt auf dem Graphen liegt, und berechnest die Schnittpunkte mit den Achsen. Manchmal ziehst du einen Punkt auf die Gerade. Dort, wo der Graph nicht eingezeichnet ist, musst du rechnen.",
  levels:[{name:"Punktprobe",info:"Liegt der Punkt auf der Geraden? $f(x)$ berechnen.",make:lvl([pPick,pGraphPick,pPickFrac,pValue,pDragY])},
          {name:"Achsenschnittpunkte",info:"$f(0)$ und die Nullstelle.",make:lvl([pYAxis,pZero,pGraphZero,pDrawInt,pTermZero])},
          {name:"Rechnen und Zeichnen",info:"Aus Schnittpunkten den Term bestimmen, fehlende Koordinaten.",make:lvl([pTermAxes,pSolveX,pDragX,pStatement,pDrawNP])}]};

/* ======================= Challenge 4 · Winkel-Messer ======================= */
const DEG=180/Math.PI, R1=v=>Math.round(v*10)/10;
const aT=v=>`$${tn(R1(v))}^\\circ$`;
const alpha=m=>m>=0?Math.atan(m)*DEG:180+Math.atan(m)*DEG;
function wTan(){ const pos=Math.random()<.5; const m=pos?1:-1;
  const cands=pos?[{v:-1,fb:"Eine negative Steigung gehört zu einem Winkel zwischen 90° und 180°."},{v:45,fb:"45 ist der Winkel, nicht die Steigung. Die Steigung ist tan 45°."},{v:0,fb:"Die Steigung 0 gehört zu einer waagerechten Geraden mit dem Winkel 0°."}]
    :[{v:1,fb:"Eine positive Steigung gehört zu einem Winkel unter 90°."},{v:-45,fb:"−45° ist der Wert des Taschenrechners, nicht die Steigung."},{v:135,fb:"135 ist der Winkel, nicht die Steigung. Die Steigung ist tan 135°."},{v:0,fb:"Die Steigung 0 gehört zu einer waagerechten Geraden."}];
  const o=pickOpts(m,cands,v=>`$m=${tn(v)}$`); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`\alpha=${pos?45:135}^\circ`)),label:"Steigungswinkel",q:"Welche Steigung $m$ hat die Gerade?",opts:o,erkl:S`$m=\tan\alpha=\tan ${pos?45:135}^\circ=${tn(m)}$.`}); }
function wRange(){ const m=one([-3,-2,-1.5,-1,-0.5,0.5,1,1.5,2,3,0]); const b=one([-3,-2,-1,1,2,3]); const key=m>0?"p":m<0?"n":"z";
  const R=[{k:"p",t:S`$0^\circ<\alpha<90^\circ$`},{k:"n",t:S`$90^\circ<\alpha<180^\circ$`},{k:"z",t:S`$\alpha=0^\circ$`},{k:"s",t:S`$\alpha=90^\circ$`}];
  const FB={p:"Die Gerade steigt, also ist der Winkel spitz: zwischen 0° und 90°.",n:"Die Gerade fällt, also ist der Winkel stumpf: zwischen 90° und 180°.",z:"Die Gerade ist waagerecht. Ihr Steigungswinkel ist 0°.",s:"Der Winkel 90° gehört zu einer senkrechten Geraden. Die gibt es bei Funktionen nicht."};
  const o=R.map(r=>({t:r.t,ok:r.k===key,fb:r.k===key?"":(key==="p"?(r.k==="n"?"Die Gerade steigt: Der Winkel ist spitz.":"Die Gerade steigt, sie ist weder waagerecht noch senkrecht."):key==="n"?(r.k==="p"?"Die Gerade fällt: Der Winkel ist stumpf.":"Die Gerade fällt, sie ist weder waagerecht noch senkrecht."):"Die Gerade ist waagerecht: Weder steigend noch fallend.")}));
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:"In welchem Bereich liegt der Steigungswinkel der Geraden?",opts:o,keepOrder:true,col:true,erkl:`Die Steigung ist $m=${tn(m)}$. ${FB[key]}`}); }
function arcAfter(m,x0,txt){ return (c,col,geo)=>{ const ctx=c.ctx, al=m>=0?Math.atan(m):Math.PI+Math.atan(m), r=44, cx=geo.X(x0), cy=geo.Y(0);
  ctx.save(); ctx.strokeStyle=col.mark; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(cx,cy,r,0,-al,true); ctx.stroke(); ctx.restore();
  ctx.fillStyle=col.mark; ctx.font=MM.MONO(700,16); ctx.textAlign="center"; const mid=al/2; ctx.fillText(txt||"α",cx+(r+17)*Math.cos(mid),cy-(r+17)*Math.sin(mid)+5); ctx.textAlign="left"; }; }
function wGraph(){ const m=one([1,-1]), b=one([-4,-3,-2,-1,1,2,3,4]); const x0=-b/m; if(Math.abs(x0)>5) return null; const a=m>0?45:135;
  const cands=m>0?[{v:135,fb:"135° würde zu einer fallenden Geraden gehören. Hier steigt sie."},{v:-45,fb:"Ein negativer Winkel ist der Winkel im Uhrzeigersinn. Der Steigungswinkel wird entgegen dem Uhrzeigersinn gemessen."},{v:90,fb:"90° wäre eine senkrechte Gerade."}]
    :[{v:45,fb:"Das ist der spitze Winkel zwischen Gerade und x-Achse. Der Steigungswinkel wird entgegen dem Uhrzeigersinn gemessen und ist hier stumpf."},{v:-45,fb:"Ein negativer Winkel ist der Winkel im Uhrzeigersinn. Der Steigungswinkel wird entgegen dem Uhrzeigersinn gemessen."},{v:90,fb:"90° wäre eine senkrechte Gerade."}];
  const o=pickOpts(a,cands,aT); if(!o) return null;
  return graphMc({lines:[{m,b}],after:arcAfter(m,x0),q:"Wie groß ist der Steigungswinkel $\\alpha$ der Geraden?",hint:"Die Gerade läuft über die Diagonalen der Kästchen: ein Schritt nach rechts, ein Schritt nach "+(m>0?"oben":"unten")+".",opts:o,
    erkl:S`Ein Schritt nach rechts, ein Schritt nach ${m>0?"oben":"unten"}: $m=${tn(m)}$. Es gilt $\tan\alpha=${tn(m)}$, also $\alpha=${tn(a)}^\circ$.`}); }
function wCalc(){ const m=one([1.5,2,3,4]); const a=alpha(m);
  const cands=[{v:90-a,fb:"Das ist der Winkel zur y-Achse: $\\Delta x$ und $\\Delta y$ sind vertauscht."},{v:m,fb:"$m$ ist die Steigung, nicht der Winkel. Rechne $\\tan^{-1}(m)$."},{v:Math.atan(m),fb:"Dein Taschenrechner steht auf Bogenmaß (RAD). Stelle ihn auf Grad (DEG)."},{v:180-a,fb:"Bei positiver Steigung ist der Winkel spitz."}];
  const o=pickOpts(a,cands,aT); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`m=${tn(m)}`)),label:"Steigung",q:"Wie groß ist der Steigungswinkel $\\alpha$? Rechne mit dem Taschenrechner in Grad.",opts:o,erkl:S`$\tan\alpha=${tn(m)}$, also $\alpha=\tan^{-1}(${tn(m)})\approx ${tn(R1(a))}^\circ$.`}); }
function wDrawGen(angle,onYAxis){ const m=angle===45?1:-1; let P,b; if(onYAxis){ b=one([-3,-2,-1,0,1,2,3]); P=[0,b]; } else { const L=randLine({m}); P=one(gridPts(m,L.b).filter(q=>q[0]!==0)); b=P[1]-m*P[0]; }
  const L={m,b}; const who=onYAxis&&b===0?"durch den Ursprung":`durch $P${ptT(P[0],P[1])}$`;
  return drawTask({target:L,marks:onYAxis&&b===0?[]:[{x:P[0],y:P[1],label:"P"+gp(P)}],q:`Zeichne die Gerade ${who} mit dem Steigungswinkel $\\alpha=${angle}^\\circ$.`,
    erkl:S`$\tan ${angle}^\circ=${tn(m)}$, also ist $m=${tn(m)}$. Von $${onYAxis&&b===0?"(0|0)":"P"}$ aus gilt: ein Schritt nach rechts, ein Schritt nach ${m>0?"oben":"unten"}.`}); }
const wDraw45=()=>wDrawGen(45,true);
const wDraw135=()=>wDrawGen(135,false);

// Level 2
function wFromTerm(){ const m=one([0.5,1.5,2,3,4]), b=one([1,2,3,4,5]); const a=alpha(m);
  const cands=[{v:Math.atan(b)*DEG,fb:"$b$ ist der y-Achsenabschnitt. Für den Winkel zählt nur die Steigung $m$."},{v:90-a,fb:"Das ist der Winkel zur y-Achse: $\\Delta x$ und $\\Delta y$ sind vertauscht."},{v:Math.atan(m),fb:"Dein Taschenrechner steht auf Bogenmaß (RAD). Stelle ihn auf Grad (DEG)."}];
  const o=pickOpts(a,cands,aT); if(!o) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:"Wie groß ist der Steigungswinkel $\\alpha$ der Geraden?",opts:o,erkl:S`Die Steigung ist $m=${tn(m)}$. $\alpha=\tan^{-1}(${tn(m)})\approx ${tn(R1(a))}^\circ$. Der Wert $b=${tn(b)}$ spielt keine Rolle.`}); }
function wAlphaToM(){ const al=one([20,30,40,50,60,70]); const t=Math.tan(al/DEG); const f=v=>`$m\\approx ${tn(R2(v))}$`;
  const cands=[{v:1/t,fb:"Das ist der Kehrwert. Es gilt $\\tan\\alpha=m$."},{v:Math.sin(al/DEG),fb:"$\\sin\\alpha$ ist nicht die Steigung. Es gilt $\\tan\\alpha=m$."},{v:Math.cos(al/DEG),fb:"$\\cos\\alpha$ ist nicht die Steigung. Es gilt $\\tan\\alpha=m$."}];
  const o=pickOpts(R2(t),cands.map(c=>({v:R2(c.v),fb:c.fb})),f); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`\alpha=${al}^\circ`)),label:"Steigungswinkel",q:"Welche Steigung hat die Gerade? Runde auf zwei Nachkommastellen.",opts:o,erkl:S`$m=\tan\alpha=\tan ${al}^\circ\approx ${tn(R2(t))}$.`}); }
const TRI=[[2,1],[1,2],[3,2],[2,3],[4,3],[3,1],[1,3],[3,4]];
function wTriangle(neg){ const [dx,dy0]=one(TRI); const dy=neg?-dy0:dy0; const m=dy/dx; const a=alpha(m);
  const px=ri(-5,5-dx), py=neg?ri(-5-dy,5):ri(-5,5-dy); if(Math.abs(py)>6||Math.abs(py+dy)>6) return null;
  const b=py-m*px;
  const cands=neg?[{v:Math.atan(m)*DEG,fb:"Das ist der Winkel im Uhrzeigersinn. Der Steigungswinkel wird entgegen dem Uhrzeigersinn gemessen: 180° minus den Betrag."},{v:-Math.atan(m)*DEG,fb:"Das wäre der Winkel einer steigenden Geraden. Hier fällt die Gerade: Der Winkel ist größer als 90°."},{v:90+Math.atan(m)*DEG,fb:"Rechne 180° minus den Betrag des Taschenrechnerwerts."}]
    :[{v:90-a,fb:"Das ist der Winkel zur y-Achse: $\\Delta x$ und $\\Delta y$ sind vertauscht."},{v:m,fb:"$m$ ist die Steigung, nicht der Winkel. Rechne $\\tan^{-1}(m)$."},{v:Math.atan(m),fb:"Dein Taschenrechner steht auf Bogenmaß (RAD). Stelle ihn auf Grad (DEG)."}];
  const o=pickOpts(a,cands,aT); if(!o) return null;
  return graphMc({lines:[{m,b}],marks:col=>[{x:px,y:py,label:"",color:col.mark},{x:px+dx,y:py+dy,label:"",color:col.mark}],after:(c,col,geo)=>triangle(c.ctx,geo,col,{x:px,y:py},dx,dy),
    q:"Wie groß ist der Steigungswinkel $\\alpha$ der Geraden? Lies $\\Delta x$ und $\\Delta y$ ab.",opts:o,
    erkl:neg?S`$m=\dfrac{${tn(dy)}}{${tn(dx)}}\approx ${tn(R2(m))}$. $\tan^{-1}(m)\approx ${tn(R1(Math.atan(m)*DEG))}^\circ$, also $\alpha=180^\circ-${tn(R1(-Math.atan(m)*DEG))}^\circ=${tn(R1(a))}^\circ$.`:S`$m=\dfrac{${tn(dy)}}{${tn(dx)}}\approx ${tn(R2(m))}$, also $\alpha=\tan^{-1}(m)\approx ${tn(R1(a))}^\circ$.`}); }
function wTwoPts(){ const d=twoData({ms:[0.5,1.5,2,3,0.5]}); if(!d) return null; const {m,P,Q}=d; const a=alpha(m);
  const cands=[{v:90-a,fb:"Das ist der Winkel zur y-Achse: $\\Delta x$ und $\\Delta y$ sind vertauscht."},{v:m,fb:"$m$ ist die Steigung, nicht der Winkel. Rechne $\\tan^{-1}(m)$."},{v:Math.atan(m),fb:"Dein Taschenrechner steht auf Bogenmaß (RAD). Stelle ihn auf Grad (DEG)."}];
  const o=pickOpts(a,cands,aT); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`P${ptT(P[0],P[1])},\;Q${ptT(Q[0],Q[1])}`)),label:"Zwei Punkte",q:"Welchen Steigungswinkel hat die Gerade durch $P$ und $Q$?",opts:o,
    erkl:S`$m=\dfrac{${tn(Q[1])}-${br(P[1])}}{${tn(Q[0])}-${br(P[0])}}=${tn(m)}$. $\alpha=\tan^{-1}(${tn(m)})\approx ${tn(R1(a))}^\circ$.`}); }
function wSteeper(){ const ms=[0.5,1,1.5,2,3,4]; const m1=one(ms), m2=one(ms); if(m1===m2) return null; const b1=one([-3,-2,-1,1,2,3]), b2=one([-3,-2,-1,1,2,3]); const fBig=m1>m2;
  const o=[{t:"Die Gerade $f$",ok:fBig,fb:fBig?"":"Bei positiven Steigungen gehört die größere Steigung zum größeren Winkel."},{t:"Die Gerade $g$",ok:!fBig,fb:!fBig?"":"Bei positiven Steigungen gehört die größere Steigung zum größeren Winkel."},{t:"Beide haben denselben Winkel",fb:"Die Steigungen sind verschieden, also auch die Winkel."}];
  return MM.mcTask({sit:sit(tex(fT(m1,b1,"f"))+"<br>"+tex(fT(m2,b2,"g"))),label:"Zwei Geraden",q:"Welche Gerade hat den größeren Steigungswinkel?",opts:o,keepOrder:true,col:true,
    erkl:S`$\alpha_f=\tan^{-1}(${tn(m1)})\approx ${tn(R1(alpha(m1)))}^\circ$ und $\alpha_g=\tan^{-1}(${tn(m2)})\approx ${tn(R1(alpha(m2)))}^\circ$.`}); }

// Level 3: negative Steigung
const NEGM=[-3,-2,-1.5,-0.5,-4];
function negCands(m){ const th=Math.atan(m)*DEG; return [{v:th,fb:"Das ist der Winkel im Uhrzeigersinn. Der Steigungswinkel wird entgegen dem Uhrzeigersinn gemessen: 180° minus den Betrag."},{v:-th,fb:"Das wäre der Winkel einer steigenden Geraden. Hier fällt die Gerade: Der Winkel ist größer als 90°."},{v:90+th,fb:"Rechne 180° minus den Betrag des Taschenrechnerwerts."}]; }
function wNeg(){ const m=one(NEGM); const th=Math.atan(m)*DEG, a=alpha(m); const o=pickOpts(a,negCands(m),aT); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`m=${tn(m)}`)),label:"Steigung",q:"Wie groß ist der Steigungswinkel $\\alpha$? Rechne mit dem Taschenrechner in Grad.",opts:o,
    erkl:S`$\tan^{-1}(${tn(m)})\approx ${tn(R1(th))}^\circ$ ist der Winkel im Uhrzeigersinn. Steigungswinkel: $\alpha=180^\circ-${tn(R1(-th))}^\circ=${tn(R1(a))}^\circ$.`}); }
function wNegGraph(){ return wTriangle(true); }
function wNegTerm(){ const m=one(NEGM), b=one([1,2,3,4,5]); const th=Math.atan(m)*DEG, a=alpha(m); const cands=negCands(m).concat([{v:Math.atan(b)*DEG,fb:"$b$ ist der y-Achsenabschnitt. Für den Winkel zählt nur die Steigung $m$."}]);
  const o=pickOpts(a,cands,aT); if(!o) return null;
  return MM.mcTask({sit:sit(tex(fT(m,b))),label:"Funktionsterm",q:"Wie groß ist der Steigungswinkel $\\alpha$ der Geraden?",opts:o,
    erkl:S`$m=${tn(m)}$. $\tan^{-1}(${tn(m)})\approx ${tn(R1(th))}^\circ$, also $\alpha=180^\circ-${tn(R1(-th))}^\circ=${tn(R1(a))}^\circ$. Der Wert $b$ spielt keine Rolle.`}); }
function wAlphaNeg(){ const al=one([110,120,130,140,150,160]); const t=Math.tan(al/DEG); const f=v=>`$m\\approx ${tn(R2(v))}$`;
  const cands=[{v:-t,fb:"Bei einem stumpfen Winkel ist die Steigung negativ."},{v:1/t,fb:"Das ist der Kehrwert. Es gilt $\\tan\\alpha=m$."},{v:-1/t,fb:"Das ist der Kehrwert mit falschem Vorzeichen. Es gilt $\\tan\\alpha=m$."}];
  const o=pickOpts(R2(t),cands.map(c=>({v:R2(c.v),fb:c.fb})),f); if(!o) return null;
  return MM.mcTask({sit:sit(tex(S`\alpha=${al}^\circ`)),label:"Steigungswinkel",q:"Welche Steigung hat die Gerade? Runde auf zwei Nachkommastellen.",opts:o,erkl:S`$m=\tan\alpha=\tan ${al}^\circ\approx ${tn(R2(t))}$. Der Winkel ist stumpf, die Steigung also negativ.`}); }

const CH_WINKEL={titel:"Winkel-Messer", art:"Steigungswinkel", buch:"S. 17 bis 19",
  kurz:"Steigung und Steigungswinkel ineinander umrechnen.",
  intro:"Du gehst zwischen Steigung und Steigungswinkel hin und her. Dazu brauchst du den Taschenrechner im Gradmodus (DEG). Merke: Bei fallender Geraden zeigt der Rechner einen negativen Winkel. Der Steigungswinkel ist dann $180^\\circ$ minus den Betrag.",
  levels:[{name:"Steigung und Winkel",info:"Bereiche, 45° und 135°, erste Rechnungen.",make:lvl([wTan,wRange,wGraph,wCalc,wDraw45])},
          {name:"Winkel berechnen",info:"Aus Term, Dreieck und Punkten, mit $\\tan^{-1}$.",make:lvl([wFromTerm,wAlphaToM,()=>wTriangle(false),wTwoPts,wSteeper])},
          {name:"Fallende Geraden",info:"Negative Steigung: stumpfe Winkel.",make:lvl([wNeg,wNegGraph,wNegTerm,wAlphaNeg,wDraw135])}]};

/* ======================= Challenge 5 · Sach-Check ======================= */
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const CTX=[
  {id:"taxi",name:"K",v:"x",rise:true,money:true,xu:"km",xs:"Kilometer",xw:"Kilometer",yu:"€",yn:"den Fahrpreis in €",xn:"der Strecke in km",noun:"Der Fahrpreis eines Taxis",who:"Zwei Taxiunternehmen rechnen so ab:",
    ms:[1.2,1.5,1.8,2,2.2,2.5],bs:[2,2.5,3,3.5,4,5],gm:[1,2],gb:[2,4,6],fy:eur,
    sit:(b,m)=>`Ein Taxi berechnet ${eur(b)} Grundpreis und ${eur(m)} je gefahrenem Kilometer.`,sitM:m=>`Ein Taxi berechnet ${eur(m)} je gefahrenem Kilometer und dazu einen festen Grundpreis.`,bName:"der Grundpreis",
    bTxt:"der Grundpreis, also der Preis bei 0 km",mTxt:"der Preis für jeden gefahrenen Kilometer",
    qVal:x=>`Wie viel kostet eine Fahrt über ${x} km?`,qX:y=>`Eine Fahrt kostet ${eur(y)}. Wie viele Kilometer wurde gefahren?`},
  {id:"roller",name:"P",v:"t",rise:true,money:true,xu:"Stunden",xs:"Stunde",xw:"Stunden",yu:"€",yn:"den Preis in €",xn:"der Mietdauer in Stunden",noun:"Der Preis für einen E-Roller",who:"Zwei Verleiher von E-Rollern rechnen so ab:",
    ms:[1,1.5,2,2.5,3,4],bs:[1,1.5,2,2.5,3],gm:[1,2],gb:[2,4,6],fy:eur,
    sit:(b,m)=>`Für einen E-Roller zahlt man ${eur(b)} Grundgebühr und ${eur(m)} pro Stunde.`,sitM:m=>`Für einen E-Roller zahlt man ${eur(m)} pro Stunde und dazu eine feste Grundgebühr.`,bName:"die Grundgebühr",
    bTxt:"die Grundgebühr, also der Preis bei 0 Stunden",mTxt:"der Preis für jede Stunde",
    qVal:x=>`Wie viel kostet es, den Roller ${x} Stunden zu mieten?`,qX:y=>`Die Miete kostet ${eur(y)}. Wie viele Stunden wurde der Roller gemietet?`},
  {id:"handwerk",name:"K",v:"t",rise:true,money:true,xu:"Stunden",xs:"Stunde",xw:"Stunden",yu:"€",yn:"die Rechnung in €",xn:"der Arbeitszeit in Stunden",noun:"Die Rechnung eines Handwerkers",who:"Zwei Handwerker rechnen so ab:",
    ms:[30,35,40,45,50,60],bs:[20,25,30,40,45,50],fy:eur,
    sit:(b,m)=>`Ein Handwerker verlangt ${eur(b)} Anfahrtskosten und ${eur(m)} für jede Arbeitsstunde.`,sitM:m=>`Ein Handwerker verlangt ${eur(m)} für jede Arbeitsstunde und dazu feste Anfahrtskosten.`,bName:"die Anfahrtspauschale",
    bTxt:"die Anfahrtskosten, also der Preis bei 0 Stunden",mTxt:"der Preis für jede Arbeitsstunde",
    qVal:x=>`Wie hoch ist die Rechnung bei ${x} Arbeitsstunden?`,qX:y=>`Die Rechnung beträgt ${eur(y)}. Wie viele Stunden wurde gearbeitet?`},
  {id:"studio",name:"K",v:"n",rise:true,money:true,xu:"Monate",xs:"Monat",xw:"Monate",yu:"€",yn:"die Gesamtkosten in €",xn:"der Mitgliedsdauer in Monaten",noun:"Der Gesamtbetrag in einem Fitnessstudio",who:"Zwei Fitnessstudios rechnen so ab:",
    ms:[20,25,30,35,40],bs:[10,20,30,40,50],fy:eur,
    sit:(b,m)=>`Ein Fitnessstudio verlangt ${eur(b)} Aufnahmegebühr und ${eur(m)} pro Monat.`,sitM:m=>`Ein Fitnessstudio verlangt ${eur(m)} pro Monat und dazu eine einmalige Aufnahmegebühr.`,bName:"die Aufnahmegebühr",
    bTxt:"die Aufnahmegebühr, also der Betrag bei 0 Monaten",mTxt:"der Beitrag für jeden Monat",
    qVal:x=>`Wie viel hat man nach ${x} Monaten insgesamt bezahlt?`,qX:y=>`Insgesamt wurden ${eur(y)} bezahlt. Wie viele Monate ist man schon Mitglied?`},
  {id:"pflanze",name:"h",v:"t",rise:true,xu:"Wochen",xs:"Woche",xw:"Wochen",yu:"cm",yn:"die Höhe in cm",xn:"der Zeit in Wochen",noun:"Die Höhe einer Sonnenblume",
    ms:[2,3,4,5],bs:[10,15,20,25],gm:[1,2],gb:[2,4,6],fy:v=>`${num(v)} cm`,
    sit:(b,m)=>`Eine Sonnenblume ist ${num(b)} cm hoch und wächst jede Woche um ${num(m)} cm.`,sitM:m=>`Eine Sonnenblume wächst jede Woche um ${num(m)} cm. Am Anfang ist sie schon eine Weile gewachsen.`,bName:"die Höhe am Anfang",
    bTxt:"die Höhe am Anfang, also bei 0 Wochen",mTxt:"das Wachstum pro Woche",
    qVal:x=>`Wie hoch ist die Sonnenblume nach ${x} Wochen?`,qX:y=>`Die Sonnenblume ist ${num(y)} cm hoch. Wie viele Wochen sind vergangen?`},
  {id:"tank",name:"V",v:"t",rise:false,xu:"Minuten",xs:"Minute",xw:"Minuten",yu:"Liter",yn:"den Inhalt in Litern",xn:"der Zeit in Minuten",noun:"Der Inhalt eines Tanks",
    ms:[2,4,5,10],T:[8,10,12,15,16,20],fy:v=>`${num(v)} Liter`,
    sit:(b,m)=>`Ein Tank enthält ${num(b)} Liter Wasser. Pro Minute fließen ${num(m)} Liter ab.`,
    bTxt:"der Inhalt am Anfang, also bei 0 Minuten",mTxt:"die Abnahme pro Minute",
    qVal:x=>`Wie viel Wasser ist nach ${x} Minuten noch im Tank?`,qX:y=>`Im Tank sind noch ${num(y)} Liter. Wie viele Minuten läuft das Wasser schon ab?`,qZero:"Nach wie vielen Minuten ist der Tank leer?"},
  {id:"akku",name:"L",v:"t",rise:false,xu:"Stunden",xs:"Stunde",xw:"Stunden",yu:"%",yn:"die Ladung in Prozent",xn:"der Zeit in Stunden",noun:"Die Ladung eines Handy-Akkus",
    ms:[4,5,10,20,25],b100:true,fy:v=>`${num(v)} %`,
    sit:(b,m)=>`Ein Handy ist zu ${num(b)} % geladen und verliert pro Stunde ${num(m)} % Ladung.`,
    bTxt:"die Ladung am Anfang, also bei 0 Stunden",mTxt:"der Verlust pro Stunde",
    qVal:x=>`Wie viel Prozent sind nach ${x} Stunden noch geladen?`,qX:y=>`Der Akku ist noch zu ${num(y)} % geladen. Wie viele Stunden sind vergangen?`,qZero:"Nach wie vielen Stunden ist der Akku leer?"}
];
const RISE=CTX.filter(c=>c.rise), FALL=CTX.filter(c=>!c.rise), MONEY=CTX.filter(c=>c.money), GRAPH=CTX.filter(c=>c.gm);
function ctxData(c){ const m=one(c.ms); let b; if(c.rise) b=one(c.bs); else if(c.b100) b=100; else b=m*one(c.T); return {c,m,b,ms:c.rise?m:-m}; }
const styleOf=c=>c.rise?"m":"b";
const termStr=(d)=>fT(d.ms,d.b,d.c.name,d.c.v,styleOf(d.c));
const fx=(c,x)=>`${num(x)} ${near(x,1)&&c.id!=="taxi"?c.xs:c.xu}`;
const sOpts=(d,extra)=>termOpts(d.ms,d.b,wrongTerms(d.ms,d.b,{extra}),{name:d.c.name,v:d.c.v,style:styleOf(d.c)});
function sTerm(){ const d=ctxData(one(CTX)); const {c,m,b}=d; const o=sOpts(d); if(!o) return null;
  return MM.mcTask({sit:c.sit(b,m),label:"Sachsituation",q:`Welcher Funktionsterm gibt ${c.yn} in Abhängigkeit von ${c.xn} an?`,opts:o,col:true,
    erkl:`Der Startwert ${c.fy(b)} ist die Zahl $b$, sie steht allein. Pro ${c.xs} ${c.rise?"kommen":"gehen"} ${c.fy(m)} ${c.rise?"dazu":"ab"}, also ist $m=${tn(d.ms)}$. Term: $${termStr(d)}$.`}); }
function sMeaning(which){ return ()=>{ const d=ctxData(one(CTX)); const {c,m,b}=d; const num0=which==="m"?Math.abs(d.ms):b;
  const O=[{t:cap(c.mTxt),ok:which==="m",fb:which==="m"?"":"Das ist die Zahl beim Zeichen "+c.v+", also die Änderung pro Schritt."},{t:cap(c.bTxt),ok:which==="b",fb:which==="b"?"":"Das ist die Zahl, die allein steht: der Startwert."},{t:`Der Wert nach 10 ${c.xu}`,fb:"Dafür müsstest du erst rechnen. Die Zahl steht direkt im Term."},{t:`Die Anzahl der ${c.xw}`,fb:`Die Anzahl der ${c.xw} ist die Variable $${c.v}$, keine feste Zahl im Term.`}];
  return MM.mcTask({sit:c.sit(b,m),label:"Sachsituation",q:`Was bedeutet die Zahl $${tn(num0)}$ im Term $${termStr(d)}$?`,opts:O,col:true,
    erkl:which==="m"?`Die Zahl beim $${c.v}$ ist die Steigung $m$. Sie gibt an, wie sich der Wert pro ${c.xs} ändert: ${c.mTxt}.`:`Die Zahl, die allein steht, ist der y-Achsenabschnitt $b$. Sie ist der Wert bei $${c.v}=0$: ${c.bTxt}.`}); }; }
function sValue(){ const d=ctxData(one(CTX)); const {c,m,b,ms}=d; const maxX=c.rise?12:Math.floor(b/m)-1; if(maxX<3) return null; const x=ri(2,maxX); const y=b+ms*x;
  const cands=c.rise?[{v:m*x,fb:"Der Startwert fehlt noch."},{v:(b+m)*x,fb:"Der Startwert kommt nur einmal vor, nicht bei jedem Schritt."},{v:b+m,fb:`Das ist der Wert nach einem Schritt, nicht nach ${x}.`},{v:b*x+m,fb:"$m$ und $b$ sind vertauscht: $m$ gehört zu jedem Schritt."}]
    :[{v:b+m*x,fb:"Der Wert nimmt ab, er wird nicht größer."},{v:m*x,fb:"Das ist die Abnahme. Du musst sie vom Startwert abziehen."},{v:b-m,fb:`Das ist der Wert nach einem Schritt, nicht nach ${x}.`}];
  const o=pickOpts(y,cands,c.fy); if(!o) return null;
  return MM.mcTask({sit:c.sit(b,m),label:"Sachsituation",q:c.qVal(x),opts:o,
    erkl:c.rise?`$${c.name}(${x})=${tn(m)}\\cdot ${x}+${tn(b)}=${tn(R2(y))}$. Ergebnis: ${c.fy(y)}.`:`$${c.name}(${x})=${tn(b)}-${tn(m)}\\cdot ${x}=${tn(R2(y))}$. Ergebnis: ${c.fy(y)}.`}); }
function sTable(){ const d=ctxData(one(CTX)); const {c,m,b,ms}=d; const maxX=c.rise?3:Math.min(3,Math.floor(b/m)); if(maxX<3) return null; const xs=[0,1,2,3], ys=xs.map(x=>R2(b+ms*x)); const o=sOpts(d); if(!o) return null;
  return MM.mcTask({viz:api=>{ const w=el("div",{class:"situ"},`<span class="eyebrow">${c.noun}</span>${MM.tableHtml(xs,ys,{xh:`${c.v} in ${c.xu}`,yh:`${c.name} in ${c.yu}`})}`); api.viz.appendChild(w); return {}; },q:"Welcher Funktionsterm passt zur Wertetabelle?",opts:o,col:true,
    erkl:`Bei $${c.v}=0$ steht ${ts(b)}, also ist $b=${tn(b)}$. Pro Schritt ändert sich der Wert um ${ts(ms)}, also ist $m=${tn(ms)}$. Term: $${termStr(d)}$.`}); }

// Level 2
function sSolveX(){ const d=ctxData(one(RISE)); const {c,m,b}=d; const x=ri(2,12); const y=R2(b+m*x);
  const cands=[{v:y/m,fb:"Der Startwert muss erst abgezogen werden."},{v:(y+b)/m,fb:"Der Startwert wird abgezogen, nicht addiert."},{v:y-b,fb:`Du musst noch durch ${ts(m)} teilen.`},{v:(y-b)*m,fb:"Du musst durch $m$ teilen, nicht mit $m$ multiplizieren."}];
  const o=pickOpts(x,cands,v=>fx(c,v)); if(!o) return null;
  return MM.mcTask({sit:c.sit(b,m),label:"Sachsituation",q:c.qX(y),opts:o,erkl:S`$${rhs(m,b,c.v)}=${tn(y)}$ ergibt ${iso(m,c.v,R2(y-b),x)}.`}); }
function sCompare(){ const c=one(MONEY); const bs=c.bs.slice(), ms=c.ms.slice(); const b1=one(bs), b2=one(bs), m1=one(ms), m2=one(ms); if(!(b1<b2&&m1>m2)) return null; const x=ri(2,14); const A=R2(b1+m1*x), B=R2(b2+m2*x); if(Math.abs(A-B)<0.005) return null;
  const aCheap=A<B; const o=[{t:"Angebot A",ok:aCheap},{t:"Angebot B",ok:!aCheap},{t:"Beide kosten gleich viel"}].map(q=>({...q,fb:q.ok?"":`Rechne beide Preise aus: Angebot A kostet ${eur(A)}, Angebot B kostet ${eur(B)}.`}));
  return MM.mcTask({sit:`${c.who}<br>Angebot A: ${eur(b1)} fest und ${eur(m1)} pro ${c.xs}.<br>Angebot B: ${eur(b2)} fest und ${eur(m2)} pro ${c.xs}.`,label:"Zwei Angebote",q:`Welches Angebot ist bei ${x} ${c.xu} günstiger?`,opts:o,keepOrder:true,col:true,
    erkl:`Angebot A: ${eur(b1)} + ${x} · ${eur(m1)} = ${eur(A)}. Angebot B: ${eur(b2)} + ${x} · ${eur(m2)} = ${eur(B)}. ${aCheap?"Angebot A":"Angebot B"} ist günstiger.`}); }
function sGraphRead(){ const c=one(GRAPH); const m=one(c.gm), b=one(c.gb); const x1=one([2,4,6,8]); const y1=b+m*x1; if(b+m*10>20) return null; const askB=Math.random()<.5;
  const box={xr:[0,10],yr:[0,20],free:true,xlab:c.v,ylab:c.name};
  const marks=col=>askB?[{x:x1,y:y1,label:`(${x1}|${y1})`,color:col.mark}]:[{x:0,y:b,label:`(0|${b})`,color:col.mark},{x:x1,y:y1,label:`(${x1}|${y1})`,color:col.mark}];
  const cands=askB?[{v:m,fb:"Das ist die Änderung pro Schritt, nicht der Startwert."},{v:y1,fb:`Das ist der Wert bei ${x1} ${c.xu}.`},{v:b+2,fb:"Lies genauer ab, wo der Graph die senkrechte Achse schneidet."},{v:b*m,fb:"Der Startwert steht direkt an der senkrechten Achse."}]
    :[{v:b,fb:"Das ist der Startwert, nicht die Änderung pro Schritt."},{v:y1/x1,fb:"Das ist der Durchschnitt über die ganze Strecke. Gefragt ist die Änderung pro Schritt."},{v:y1-b,fb:`Das ist die Änderung über alle ${x1} Schritte zusammen. Teile durch ${x1}.`},{v:y1,fb:`Das ist der Wert bei ${x1} ${c.xu}.`}];
  const o=pickOpts(askB?b:m,cands,c.fy); if(!o) return null;
  return graphMc({lines:[{m,b}],box,marks,q:askB?`Wie groß ist der Wert bei 0 ${c.xu}? Das ist der Startwert.`:`Um wie viel ändert sich der Wert pro ${c.xs}?`,opts:o,
    erkl:askB?`Der Graph schneidet die senkrechte Achse bei ${c.fy(b)}. Das ist der Startwert $b$.`:S`$m=\dfrac{\Delta y}{\Delta x}=\dfrac{${tn(y1-b)}}{${x1}}=${tn(m)}$. Pro ${c.xs} ändert sich der Wert um ${c.fy(m)}.`}); }
function sTankEmpty(){ const d=ctxData(one(FALL)); const {c,m,b}=d; const T0=b/m; if(!Number.isInteger(T0)) return null;
  const cands=[{v:b*m,fb:"Du musst durch die Abnahme teilen, nicht mit ihr multiplizieren."},{v:b-m,fb:"Du musst fragen: Wie oft passt die Abnahme in den Startwert?"},{v:b+m,fb:"Du musst fragen: Wie oft passt die Abnahme in den Startwert?"},{v:m,fb:"Das ist die Abnahme pro Schritt, nicht die Zeit."}];
  const o=pickOpts(T0,cands,v=>fx(c,v)); if(!o) return null;
  return MM.mcTask({sit:c.sit(b,m),label:"Sachsituation",q:c.qZero,opts:o,erkl:S`$${rhs(-m,b,c.v,"b")}=0$ ergibt $${tn(m)}${c.v}=${tn(b)}$, also $${c.v}=${tn(T0)}$.`}); }
function sFindB(){ const d=ctxData(one(RISE)); const {c,m,b}=d; const x=ri(2,8); const y=R2(b+m*x);
  const cands=[{v:y/x,fb:"Das ist der Durchschnitt pro Schritt, nicht der Startwert."},{v:y+m*x,fb:"Du musst $m\\cdot x$ abziehen, nicht addieren."},{v:m*x,fb:"Das ist der Teil, der von den Schritten kommt. Gesucht ist der Rest."},{v:y-m,fb:`Es sind ${x} Schritte, nicht einer. Ziehe ${x} · ${ts(m)} ab.`}];
  const o=pickOpts(b,cands,c.fy); if(!o) return null;
  return MM.mcTask({sit:`${c.sitM(m)} Bei ${x} ${c.xu} ergibt sich ${c.fy(y)}.`,label:"Sachsituation",q:`Wie groß ist ${c.bName}?`,opts:o,erkl:S`$${tn(y)}=${tn(m)}\cdot ${x}+b$ ergibt $b=${tn(y)}-${tn(R2(m*x))}=${tn(b)}$.`}); }

// Level 3
function sTwoValues(){ const d=ctxData(one(RISE)); const {c,m,b}=d; const x1=ri(1,4), x2=x1+one([2,3,4]); const y1=R2(b+m*x1), y2=R2(b+m*x2); const o=sOpts(d); if(!o) return null;
  return MM.mcTask({sit:`${c.noun} hängt gleichmäßig von ${c.xn} ab. Bei ${fx(c,x1)} ergibt sich ${c.fy(y1)}, bei ${fx(c,x2)} ergibt sich ${c.fy(y2)}.`,label:"Zwei Werte",q:"Welcher Funktionsterm passt?",opts:o,col:true,
    erkl:S`$m=\dfrac{${tn(y2)}-${tn(y1)}}{${x2}-${x1}}=${tn(m)}$. Einsetzen: $${tn(y1)}=${tn(m)}\cdot ${x1}+b$ ergibt $b=${tn(b)}$. Term: $${termStr(d)}$.`}); }
function sSolveFalling(){ const d=ctxData(one(FALL)); const {c,m,b}=d; const T0=b/m; if(!Number.isInteger(T0)||T0<4) return null; const t=ri(2,T0-1); const y=R2(b-m*t);
  const cands=[{v:(y-b)/m,fb:"Das Vorzeichen stimmt nicht: Der Wert nimmt ab, die Zeit ist positiv."},{v:(b+y)/m,fb:"Der Wert nimmt ab. Rechne $b-y$, nicht $b+y$."},{v:b-y,fb:`Du musst noch durch ${ts(m)} teilen.`},{v:y/m,fb:"Der Startwert fehlt noch: Er wird um die Abnahme kleiner."}];
  const o=pickOpts(t,cands,v=>fx(c,v)); if(!o) return null;
  return MM.mcTask({sit:c.sit(b,m),label:"Sachsituation",q:c.qX(y),opts:o,erkl:S`$${tn(b)}-${tn(m)}${c.v}=${tn(y)}$ ergibt $${tn(m)}${c.v}=${tn(R2(b-y))}$, also $${c.v}=${tn(t)}$.`}); }
function sGraphX(){ const c=one(GRAPH); const m=one(c.gm), b=one(c.gb); const x1=one([2,4,6,8]); const y1=b+m*x1; if(b+m*10>20) return null;
  const box={xr:[0,10],yr:[0,20],free:true,xlab:c.v,ylab:c.name};
  const cands=[{v:y1,fb:"Das ist der y-Wert. Gefragt ist der x-Wert."},{v:x1+2,fb:"Lies genauer ab: Wo schneidet die Höhenlinie den Graphen?"},{v:x1-2,fb:"Lies genauer ab: Wo schneidet die Höhenlinie den Graphen?"},{v:b,fb:"Das ist der Startwert."}];
  const o=pickOpts(x1,cands,v=>fx(c,v)); if(!o) return null;
  return graphMc({lines:[{m,b}],box,q:`Der Wert beträgt ${c.fy(y1)}. Wie viele ${c.xw} sind das? Lies am Graphen ab.`,opts:o,
    erkl:`Auf der senkrechten Achse bei ${c.fy(y1)} geht man waagerecht zum Graphen und dann nach unten: ${fx(c,x1)}. Probe: ${tn(b)} + ${tn(m)} · ${x1} = ${tn(y1)}.`}); }
function sDomain(){ const d=ctxData(one(FALL)); const {c,m,b}=d; const T0=b/m; if(!Number.isInteger(T0)) return null; const MI=MM.INF;
  const f=(Sx)=>`$\\Df=${Sets.tex(Sx,"intervall")}$`;
  const o=[{t:f(Sets.between(0,T0,true,true)),ok:true},{t:f(Sets.between(0,b,true,true)),fb:`Nach ${fx(c,T0)} ist der Wert schon 0. Danach wäre er negativ.`},{t:f([{lo:-MI,hi:MI,cl:false,ch:false}]),fb:"Negative Zeiten und Werte unter 0 gibt es hier nicht."},{t:f(Sets.between(0,T0,false,false)),fb:"Bei Beginn (0) und Ende gibt es auch einen Wert, also gehören beide Randzahlen dazu."}];
  if(new Set(o.map(q=>q.t)).size<4) return null;
  return MM.mcTask({sit:sit(tex(termStr(d))),label:c.noun,q:"Welcher Definitionsbereich ist in dieser Situation sinnvoll?",opts:o,col:true,
    erkl:S`Die Zeit beginnt bei 0. Der Wert ist bei $${c.v}=${tn(T0)}$ gleich 0. Sinnvoll ist $\Df=[0;${tn(T0)}]$.`}); }
function sTableTerm(){ const d=ctxData(one(CTX)); const {c,m,b,ms}=d; const xs=[2,4,6,8]; const ys=xs.map(x=>R2(b+ms*x)); if(ys.some(v=>v<0)) return null; const o=sOpts(d); if(!o) return null;
  return MM.mcTask({viz:api=>{ const w=el("div",{class:"situ"},`<span class="eyebrow">${c.noun}</span>${MM.tableHtml(xs,ys,{xh:`${c.v} in ${c.xu}`,yh:`${c.name} in ${c.yu}`})}`); api.viz.appendChild(w); return {}; },q:"Welcher Funktionsterm passt zur Wertetabelle?",opts:o,col:true,
    erkl:S`$m=\dfrac{${tn(ys[1])}-${tn(ys[0])}}{4-2}=${tn(ms)}$. Einsetzen von $${c.v}=2$: $${tn(ys[0])}=${tn(ms)}\cdot 2+b$ ergibt $b=${tn(b)}$. Term: $${termStr(d)}$.`}); }

const CH_SACH={titel:"Sach-Check", art:"Lineare Funktionen im Alltag", buch:"S. 18 bis 19",
  kurz:"Lineare Funktionen in Sachsituationen aufstellen und auswerten.",
  intro:"Taxi, Roller, Tank, Akku: Viele Alltagsvorgänge sind linear. Du stellst den Term auf, deutest die Zahlen in der Situation und rechnest Werte aus. $m$ ist die Änderung pro Schritt, $b$ der Startwert.",
  levels:[{name:"Term und Bedeutung",info:"Term aufstellen, Zahlen deuten, Werte berechnen.",make:lvl([sTerm,sMeaning("m"),sMeaning("b"),sValue,sTable])},
          {name:"Werte und Graphen",info:"Gleichungen lösen, Angebote vergleichen, Graph lesen.",make:lvl([sSolveX,sCompare,sGraphRead,sTankEmpty,sFindB])},
          {name:"Anwendung",info:"Zwei Werte, Definitionsbereich, Rückwärtsrechnen.",make:lvl([sTwoValues,sSolveFalling,sGraphX,sDomain,sTableTerm])}]};

MM.K3T.gens={gReadTerm,gProp,gDrawGraph,gCombo,gDrawWords,gTriRead,gTwoM,gDrawSlope,gDrawTwo,gChange,gReadSpecial,gDrawSpecial,gSteeper,gDrawFrac,gReadFrac,
  tMB,tTable,tWords,tOnLine,tReadNear,tMPterm,tMPb,tFehler,tMPfrac,tMPneg,tTwo,tTwoGraph,tTwoCheck,tTwoFehler,tTwoFrac,
  pPick,pGraphPick,pPickFrac,pValue,pDragY,pYAxis,pZero,pGraphZero,pDrawInt,pTermZero,pTermAxes,pSolveX,pDragX,pStatement,pDrawNP,
  wTan,wRange,wGraph,wCalc,wDraw45,wFromTerm,wAlphaToM,wTriangle,wTwoPts,wSteeper,wNeg,wNegGraph,wNegTerm,wAlphaNeg,wDraw135,
  sTerm,sMeaning1:sMeaning("m"),sMeaning2:sMeaning("b"),sValue,sTable,sSolveX,sCompare,sGraphRead,sTankEmpty,sFindB,sTwoValues,sSolveFalling,sGraphX,sDomain,sTableTerm};
MM.K3T.retry=retry;

MM.addKapitel("k3",{
  steckOrder:["gerade","steigung","term","punkte","winkel"], steckbriefe,
  challOrder:["gerade","term","punkte","sach","winkel"],
  braucht:{gerade:["gerade","steigung"],term:["gerade","steigung","term"],punkte:["gerade","steigung","term","punkte"],sach:["gerade","steigung","term","punkte"],winkel:["gerade","steigung","term","punkte","winkel"]}, // welche Steckbriefe (Mini-Check) eine Challenge freischalten
  challenges:{gerade:CH_GERADE,term:CH_TERM,punkte:CH_PUNKTE,winkel:CH_WINKEL,sach:CH_SACH}});
})();
