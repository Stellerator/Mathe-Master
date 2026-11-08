/* Mathe-Master · Aufgabentypen und Bausteine für Bilder */
(function(){
"use strict";
const MM = window.MM;
const {el,shuffle,one,rand,T,tex,tn,Sets,INF,colors,canvasFill,cleanups,LOBW} = MM;

/* ---------- Zeichenfläche mit Neuzeichnen ---------- */
function canvasView(host, draw){
  const st=canvasFill(host);
  const run=()=>{ try{ draw(st,colors()); }catch(e){ console.error(e); } };
  const ro=new ResizeObserver(run); ro.observe(host); cleanups.push(()=>ro.disconnect()); run();
  return {st,redraw:run}; }

/* ---------- Auswahlaufgabe ---------- */
// o: {sit | viz(api)->ctrl, q, opts:[{t,ok,fb}], erkl, hint, badge, keepOrder, tex:boolean}
function mcTask(o){ return {run(api){
  let ctrl=null;
  if(o.viz) ctrl=o.viz(api); else if(o.sit) api.situation(T(o.sit),o.label);
  if(o.badge) api.badge(o.badge);
  api.prompt(T(o.q)); if(o.hint) api.hint(T(o.hint));
  const lang=o.opts.some(x=>x.t.replace(/\$[^$]*\$/g,"XXXXXX").length>34);
  const box=el("div",{class:"answers"+(lang||o.opts.length===3||o.col?" col":"")});
  (o.keepOrder?o.opts:shuffle(o.opts)).forEach(op=>{ const b=el("button",{class:/\$/.test(op.t)?"tex":""},T(op.t)); b._ok=!!op.ok;
    b.addEventListener("click",()=>{ if(box.classList.contains("done")) return; box.classList.add("done");
      [...box.children].forEach(x=>{ if(x._ok) x.classList.add("right"); }); if(!op.ok) b.classList.add("wrong");
      if(ctrl&&ctrl.reveal) ctrl.reveal(!!op.ok);
      api.feedback(!!op.ok,T((!op.ok&&op.fb?op.fb+" ":"")+o.erkl)); api.finish(!!op.ok); });
    box.appendChild(b); });
  api.body.appendChild(box);
}};}

/* ---------- Zahlengerade: Welche Zahlen gehören dazu? ---------- */
// o: {set, settex (TeX), nums:[...], lo, hi, q, erkl, hint, badge, edge:[Randzahlen]}
function numTask(o){ return {run(api){
  const nums=o.nums.map(v=>({v,t:String(v).replace(".",","),state:"idle"})); const lo=o.lo, hi=o.hi;
  let shade=false;
  const host=api.cv(""); const draw=(st,col)=>MM.numline(st,col,{lo,hi,set:shade?o.set:null,nums});
  const cvw=canvasView(host,draw);
  if(o.badge) api.badge(o.badge);
  api.prompt(T(o.q)); if(o.hint) api.hint(T(o.hint));
  api.body.appendChild(el("div",{class:"setshow"},tex(o.settex,false)));
  if(o.bubble!==false&&!o.set) shade=false;
  const chips=el("div",{class:"chips"}); const sel=new Set(); let done=false;
  nums.forEach((n,k)=>{ const b=el("button",{"aria-pressed":"false"},n.t.replace("-","−")); n.b=b;
    b.addEventListener("click",()=>{ if(done) return; if(sel.has(k)){ sel.delete(k); n.state="idle"; } else { sel.add(k); n.state="sel"; } b.setAttribute("aria-pressed",String(sel.has(k))); cvw.redraw(); });
    chips.appendChild(b); });
  api.body.appendChild(chips);
  const chk=el("button",{class:"btn"},"Prüfen"); api.actions.appendChild(chk);
  chk.addEventListener("click",()=>{ if(done) return; done=true; shade=true; let allOk=true; const wrongOnes=[], missed=[];
    nums.forEach((n,k)=>{ const inn=o.test?o.test(n.v):Sets.has(o.set,n.v), s=sel.has(k); n.b.disabled=true; n.b.removeAttribute("aria-pressed");
      if(s&&inn){ n.state="right"; n.b.classList.add("right"); } else if(s&&!inn){ n.state="wrong"; n.b.classList.add("wrong"); allOk=false; wrongOnes.push(n.t); }
      else if(!s&&inn){ n.state="miss"; n.b.classList.add("miss"); allOk=false; missed.push(n.t); } else n.state="idle"; });
    cvw.redraw(); api.actions.innerHTML="";
    let extra=""; if(!allOk){ if(wrongOnes.length) extra+=`Zu viel markiert: ${wrongOnes.join("; ")}. `; if(missed.length) extra+=`Vergessen: ${missed.join("; ")}. `; if(o.edge&&[...wrongOnes,...missed].some(t=>o.edge.map(e=>String(e).replace(".",",")).includes(t))) extra+="Achtung bei den Randzahlen: Gehört sie noch dazu? "; }
    api.feedback(allOk,T(extra+o.erkl)); api.finish(allOk); });
}};}

/* ---------- Baukasten ---------- */
// o: {q, sit, tiles:[{id,t(TeX)}], accept:[[id,...],...], erkl, hint, badge, show (TeX Anzeige links)}
function tilesTask(o){ return {run(api){
  if(o.show) api.situation(T(o.show)); else if(o.sit) api.situation(T(o.sit));
  if(o.badge) api.badge(o.badge);
  api.prompt(T(o.q)); if(o.hint) api.hint(T(o.hint));
  const slots=el("div",{class:"slots empty"}), pool=el("div",{class:"pool"}); const seq=[]; let done=false;
  const render=()=>{ slots.innerHTML=""; slots.classList.toggle("empty",!seq.length);
    seq.forEach((id,k)=>{ const t=o.tiles.find(x=>x.id===id); const b=el("button",{class:"tile"},tex(t.t)); b.addEventListener("click",()=>{ if(done) return; seq.splice(k,1); render(); }); slots.appendChild(b); });
    [...pool.children].forEach(b=>b.classList.toggle("used",seq.includes(b._id))); chk.disabled=!seq.length; };
  shuffle(o.tiles).forEach(t=>{ const b=el("button",{class:"tile"},tex(t.t)); b._id=t.id; b.addEventListener("click",()=>{ if(done||seq.includes(t.id)) return; seq.push(t.id); render(); }); pool.appendChild(b); });
  api.body.append(slots,pool);
  const chk=el("button",{class:"btn"},"Prüfen"); const clr=el("button",{class:"btn ghost"},"Leeren");
  clr.addEventListener("click",()=>{ if(done) return; seq.length=0; render(); }); api.actions.append(chk,clr);
  chk.addEventListener("click",()=>{ if(done||!seq.length) return; done=true; const txt=seq.map(id=>o.tiles.find(x=>x.id===id).t); const ok=o.accept.some(a=>a.length===txt.length&&a.every((x,i)=>x===txt[i]));
    slots.classList.add(ok?"right":"wrong"); api.actions.innerHTML="";
    const sol=o.accept[0].join(o.join||"");
    api.feedback(ok,T((ok?"":"Richtig wäre: $"+(o.solTex||sol)+"$. ")+o.erkl)); api.finish(ok); });
  render();
}};}

/* ---------- Pfeildiagramm (SVG) ---------- */
// links: [[l,r],...]; left/right: Beschriftungen; hl: Indizes von Pfeilen, die rot werden
function pairsSvg(left,right,links,o){ o=o||{};
  const rowH=o.rowH||50, n=Math.max(left.length,right.length), top=26, H=n*rowH+top+10, W=o.w||330, xl=62, xr=W-62;
  const yL=i=>top+rowH*(i+0.5)+(n-left.length)*rowH/2, yR=i=>top+rowH*(i+0.5)+(n-right.length)*rowH/2;
  let s=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${o.max||W+60}px;height:auto" role="img" aria-label="Pfeildiagramm">
  <defs><marker id="pa${o.id||0}k" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--ink)"/></marker><marker id="pa${o.id||0}r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--bad)"/></marker></defs>`;
  s+=`<text x="${xl}" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="var(--muted)" letter-spacing=".08em">${o.hl1||"x"}</text><text x="${xr}" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="var(--muted)" letter-spacing=".08em">${o.hl2||"y"}</text>`;
  links.forEach(([a,b],k)=>{ const bad=(o.bad||[]).includes(k); const col=bad?"var(--bad)":"var(--ink)";
    const x1=xl+26,y1=yL(a),x2=xr-28,y2=yR(b);
    s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2.4" marker-end="url(#pa${o.id||0}${bad?"r":"k"})"/>`; });
  left.forEach((t,i)=>{ s+=`<circle cx="${xl}" cy="${yL(i)}" r="24" fill="var(--plot)" stroke="var(--ink)" stroke-width="2"/><text x="${xl}" y="${yL(i)+6}" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="${t.length>3?15:19}" fill="var(--ink)">${t}</text>`; });
  right.forEach((t,i)=>{ s+=`<circle cx="${xr}" cy="${yR(i)}" r="26" fill="var(--plot)" stroke="var(--mark)" stroke-width="2"/><text x="${xr}" y="${yR(i)+6}" text-anchor="middle" font-family="var(--font-mono)" font-weight="700" font-size="${t.length>3?15:19}" fill="var(--ink)">${t}</text>`; });
  return s+"</svg>"; }

function tableHtml(xs,ys,o){ o=o||{}; return `<table class="table"><tr><th>${o.xh||"x"}</th>${xs.map((x,i)=>`<td${(o.bad||[]).includes(i)?' style="color:var(--bad);font-weight:700"':""}>${String(x).replace("-","−").replace(".",",")}</td>`).join("")}</tr><tr><th>${o.yh||"y"}</th>${ys.map((y,i)=>`<td${(o.bad||[]).includes(i)?' style="color:var(--bad);font-weight:700"':""}>${String(y).replace("-","−").replace(".",",")}</td>`).join("")}</tr></table>`; }

/* ---------- Beziehungen für den Senkrechten-Test ---------- */
function sampleFn(f,x0,x1,n){ const pts=[]; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n; const y=f(x); pts.push(isFinite(y)&&Math.abs(y)<50?[x,y]:null); } return pts; }
function sampleParam(f,t0,t1,n){ const pts=[]; for(let i=0;i<=n;i++){ pts.push(f(t0+(t1-t0)*i/n)); } return pts; }
const REL = {
  par:{name:"Parabel", isF:true, ys:x=>[x*x/2-2], paths:()=>[{pts:sampleFn(x=>x*x/2-2,-6,6,240)}]},
  sin:{name:"Welle", isF:true, ys:x=>[2*Math.sin(x*1.1)], paths:()=>[{pts:sampleFn(x=>2*Math.sin(x*1.1),-6,6,300)}]},
  line:{name:"Gerade", isF:true, ys:x=>[0.75*x+0.5], paths:()=>[{pts:sampleFn(x=>0.75*x+0.5,-7,7,50)}]},
  circ:{name:"Kreis", isF:false, ys:x=>Math.abs(x)<=3?(Math.abs(x)===3?[0]:[Math.sqrt(9-x*x),-Math.sqrt(9-x*x)]):[], paths:()=>[{pts:sampleParam(t=>[3*Math.cos(t),3*Math.sin(t)],0,Math.PI*2,200)}]},
  side:{name:"Parabel auf der Seite", isF:false, ys:x=>x<-2?[]:x===-2?[0]:[Math.sqrt(x+2),-Math.sqrt(x+2)], paths:()=>[{pts:sampleParam(t=>[t*t-2,t],-3,3,200)}]},
  vert:{name:"Senkrechte Gerade", isF:false, ys:x=>Math.abs(x-1)<0.12?[-3,-2,-1,0,1,2,3]:[], vertical:1, paths:()=>[{pts:[[1,-7],[1,7]]}]},
  horiz:{name:"Waagerechte Gerade", isF:true, ys:x=>[1.5], paths:()=>[{pts:[[-7,1.5],[7,1.5]]}]},
  zig:{name:"Zickzack", isF:true, ys:x=>[Math.abs(x)-2], paths:()=>[{pts:sampleFn(x=>Math.abs(x)-2,-6,6,240)}]},
  loop:{name:"Schleife", isF:false, ys:x=>{ const t=[]; for(let i=0;i<=1;i++){} // x = sin(2t)*3, y = sin(t)*2.5 (Lissajous 1:2)
      const out=[]; for(let k=0;k<400;k++){ const a=k/400*Math.PI*2, a2=(k+1)/400*Math.PI*2; const x1=3*Math.sin(2*a), x2=3*Math.sin(2*a2); if((x1-x)*(x2-x)<=0&&x1!==x2){ const u=(x-x1)/(x2-x1); out.push(2.5*Math.sin(a+u*(a2-a))); } } return out; }, paths:()=>[{pts:sampleParam(t=>[3*Math.sin(2*t),2.5*Math.sin(t)],0,Math.PI*2,300)}]}
};
function hitCount(R,x){ const ys=R.ys(x); // doppelte (Rundungs-)Treffer zusammenfassen
  const out=[]; ys.forEach(y=>{ if(!out.some(o=>Math.abs(o-y)<0.12)) out.push(y); }); return out; }

/* Plot einer Beziehung mit Senkrechter. st-Parameter: {rel, x (aktuelle Lage), showLine} */
function relDraw(R,state){ return (st,col)=>{
  const hits=state.line?hitCount(R,state.x):[];
  MM.plot(st,col,{xr:[-7,7],yr:[-4,4],paths:R.paths(),vline:state.line?{x:state.x,pts:hits}:null,step:1}); }; }

/* Interaktive Senkrechte: Ziehen über das Bild. Gibt {state,redraw,hits()} zurück */
function vlineView(host,R,opt){ opt=opt||{}; const state={x:opt.x0===undefined?-4:opt.x0,line:true,seen:new Set()};
  let geo=null;
  const cvw=canvasView(host,(st,col)=>{ const hits=hitCount(R,state.x); geo=MM.plot(st,col,{xr:[-7,7],yr:[-4,4],paths:R.paths(),vline:{x:state.x,pts:hits},step:1,free:!!opt.free}); if(opt.onChange) opt.onChange(hits,state); });
  const setFromEvent=e=>{ if(!geo) return; const r=cvw.st.c.getBoundingClientRect(); const px=e.clientX-r.left; let x=geo.xl+(px-30)/geo.sx; x=Math.max(-6.9,Math.min(6.9,Math.round(x*20)/20)); state.x=x; cvw.redraw(); };
  let drag=false; const c=cvw.st.c; c.style.touchAction="none"; c.style.cursor="ew-resize";
  c.addEventListener("pointerdown",e=>{ drag=true; try{c.setPointerCapture(e.pointerId);}catch(_){} setFromEvent(e); });
  c.addEventListener("pointermove",e=>{ if(drag) setFromEvent(e); });
  ["pointerup","pointercancel"].forEach(ev=>c.addEventListener(ev,()=>{ drag=false; }));
  return {state,redraw:cvw.redraw,max:()=>{ let m=0; for(let x=-6.95;x<=6.95;x+=0.05) m=Math.max(m,hitCount(R,x).length); return m; }}; }

/* ---------- Funktionsmaschine (DOM) ---------- */
// term: {tex,fn,D,bad}; xs: wählbare Eingaben
function machine(host,term,xs,opt){ opt=opt||{};
  const box=el("div",{class:"machine"}), log=el("div",{class:"mlog"},"Wähle einen Eingang."), ctrl=el("div",{class:"mctrl"});
  const mIn=el("div",{class:"mbox in"},`<span><small>Eingang x</small><span class="v">?</span></span>`);
  const mCore=el("div",{class:"mbox core"},`<span><small>Maschine</small>${tex("f(x)="+term.tex)}</span>`);
  const mOut=el("div",{class:"mbox out"},`<span><small>Ausgang f(x)</small><span class="v">?</span></span>`);
  box.append(mIn,el("div",{class:"marrow"},"→"),mCore,el("div",{class:"marrow"},"→"),mOut);
  xs.forEach(x=>{ const forbid=(term.bad||[]).includes(x)||!Sets.has(term.D,x); const b=el("button",{class:forbid?"forbid":"","aria-pressed":"false"},String(x).replace("-","−").replace(".",","));
    b.addEventListener("click",()=>{ [...ctrl.children].forEach(c=>c.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true");
      mIn.querySelector(".v").textContent=String(x).replace("-","−").replace(".",",");
      if(forbid){ mOut.className="mbox stop"; mOut.querySelector(".v").textContent="Stopp"; log.textContent=opt.stopMsg||"Dafür gibt es keinen Ausgang: Diese Zahl darf nicht eingesetzt werden."; }
      else { const y=term.fn(x); mOut.className="mbox out"; mOut.querySelector(".v").textContent=MM.Terms.valTextPlain(y); log.innerHTML=T(`$f(${MM.tn(x)})=${MM.Terms.valTex(y)}$ gesprochen: „f von ${String(x).replace("-","minus ").replace(".",",")} ist ${MM.Terms.valTextPlain(y).replace("−","minus ")}“`); } });
    ctrl.appendChild(b); });
  host.append(box,ctrl,log); return {box,ctrl}; }

/* ---------- Karten-Umschalter für Bilder ---------- */
function viewTabs(host,tabs){ const bar=el("div",{class:"seg",style:"margin-bottom:4px"}); const body=el("div",{style:"flex:1;min-height:0;display:flex;flex-direction:column;gap:8px"});
  host.append(bar,body);
  tabs.forEach((t,i)=>{ const b=el("button",{"aria-pressed":"false"},t.name); b.addEventListener("click",()=>{ MM.cleanup(); [...bar.children].forEach(x=>x.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); body.innerHTML=""; t.mount(body); }); bar.appendChild(b); });
  bar.children[0].click(); }

Object.assign(MM,{canvasView,mcTask,numTask,tilesTask,pairsSvg,tableHtml,REL,hitCount,vlineView,relDraw,machine,viewTabs,sampleFn});
})();
