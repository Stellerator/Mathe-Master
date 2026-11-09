/* Mathe-Master · Kern: Helfer, Formelsatz, Mengen, Zeichnen */
(function(){
"use strict";
const MM = window.MM = window.MM || {};
let MM_tn;
MM.VERSION = "1.4"; MM.STAND = "09.11.2026";
MM.kapitel = MM.kapitel || {}; MM.LISTE = MM.LISTE || []; MM.MATHEGYM = MM.MATHEGYM || {};
MM.PRO_LEVEL = 5; MM.HUERDE = 4;   // 5 Aufgaben je Level, bestanden mit 4 Treffern im ersten Versuch

/* ---------- Helfer ---------- */
function el(tag, attrs, html){ const e=document.createElement(tag); attrs=attrs||{};
  for(const k in attrs){ if(k==="class") e.className=attrs[k]; else if(k.startsWith("on")) e.addEventListener(k.slice(2),attrs[k]); else e.setAttribute(k,attrs[k]); }
  if(html!==undefined) e.innerHTML=html; return e; }
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const rand = n => Math.floor(Math.random()*n);
const one = a => a[rand(a.length)];
const pick = (a,n) => shuffle(a).slice(0,n);
const ri = (a,b) => a+rand(b-a+1);
const esc = s => String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const TAU = Math.PI*2;
const MONO = (w,s) => `${w||500} ${s||13}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
const LOBW = ["Richtig!","Stark!","Genau so!","Sitzt!","Sauber!"];

/* ---------- Aufräumen / Animationsschleife ---------- */
const cleanups = [];
function cleanup(){ cleanups.splice(0).forEach(fn=>{ try{ fn(); }catch(e){} }); }
function loop(fn){ let alive=true, id; const t0=performance.now();
  const step = now => { if(!alive) return; try{ fn((now-t0)/1000); }catch(e){ console.error(e); alive=false; return; } id=requestAnimationFrame(step); };
  id=requestAnimationFrame(step); const stop=()=>{ alive=false; cancelAnimationFrame(id); }; cleanups.push(stop); return stop; }

/* ---------- Zahlen und Formelsatz (KaTeX) ---------- */
// Zahl für TeX mit deutschem Komma
function tn(v){ let s=String(+Number(v).toFixed(6)); if(s==="-0") s="0"; return s.replace(".","{,}"); }
// Zahl für Fließtext
function ts(v){ return tn(v).replace("{,}",",").replace("-","−"); }
// " + 3" bzw. " - 3" (mit Leerzeichen, für Terme)
function sg(a){ return a<0 ? `- ${tn(-a)}` : `+ ${tn(a)}`; }
const MACROS = {"\\R":"\\mathbb{R}","\\N":"\\mathbb{N}","\\Z":"\\mathbb{Z}","\\Q":"\\mathbb{Q}","\\Rp":"\\mathbb{R}^{+}","\\Df":"D_f","\\Wf":"W_f"};
function tex(s, display){
  s=String(s).replace(/(^|[^\\])\|(\s*)-/g,"$1|$2{-}"); // Minus nach | (z. B. Punkt (3|-2)) ohne Rechenzeichen-Abstand
  try{ if(window.katex) return window.katex.renderToString(s,{throwOnError:false,strict:false,displayMode:!!display,macros:Object.assign({},MACROS)}); }catch(e){}
  return `<span class="tex-fallback">${esc(s)}</span>`; }
// Text mit $...$ → Formeln
function T(str){ return String(str).replace(/\$([^$]+)\$/g,(m,s)=>tex(s)+"\u2060"); }

/* ---------- Mengen als Intervall-Listen ---------- */
const INF = Infinity;
const iv = (lo,hi,cl,ch) => ({lo,hi,cl:!!cl,ch:!!ch});
const Sets = {
  R:()=>[iv(-INF,INF)],
  without(pts){ pts=[...new Set(pts)].sort((a,b)=>a-b); const out=[]; let lo=-INF; pts.forEach(p=>{ out.push(iv(lo,p)); lo=p; }); out.push(iv(lo,INF)); return out; },
  ray(dir,a){ return dir==="ge"?[iv(a,INF,true,false)]:dir==="gt"?[iv(a,INF)]:dir==="le"?[iv(-INF,a,false,true)]:[iv(-INF,a)]; },
  between(a,b,cl,ch){ return [iv(a,b,cl,ch)]; },
  norm(S){
    S=S.map(i=>({lo:i.lo,hi:i.hi,cl:i.lo===-INF?false:i.cl,ch:i.hi===INF?false:i.ch})).filter(i=>i.lo<i.hi||(i.lo===i.hi&&i.cl&&i.ch));
    S.sort((a,b)=>a.lo-b.lo||(b.cl-a.cl)); const out=[];
    S.forEach(i=>{ const l=out[out.length-1];
      if(l && (i.lo<l.hi || (i.lo===l.hi && (l.ch||i.cl)))){ if(i.hi>l.hi){ l.hi=i.hi; l.ch=i.ch; } else if(i.hi===l.hi){ l.ch=l.ch||i.ch; } }
      else out.push({lo:i.lo,hi:i.hi,cl:i.cl,ch:i.ch}); });
    return out; },
  key(S){ return JSON.stringify(Sets.norm(S).map(i=>[i.lo,i.hi,i.cl,i.ch].map(v=>typeof v==="number"&&isFinite(v)?Math.round(v*1e6)/1e6:String(v)))); },
  eq(a,b){ return Sets.key(a)===Sets.key(b); },
  has(S,x){ return S.some(i=>(x>i.lo||(x===i.lo&&i.cl))&&(x<i.hi||(x===i.hi&&i.ch))); },
  // Notation. style: "menge" oder "intervall"; v: Variablenname
  tex(S,style,v){ S=Sets.norm(S); v=v||"x";
    if(S.length===1&&S[0].lo===-INF&&S[0].hi===INF) return "\\R";
    if(S.length>=2 && S[0].lo===-INF && S[S.length-1].hi===INF && S.every((i,k)=>!i.cl&&!i.ch&&(k===0||S[k-1].hi===i.lo)))
      return "\\R\\setminus\\{"+S.slice(0,-1).map(i=>tn(i.hi)).join(";\\,")+"\\}";
    if(S.length===1){ const i=S[0];
      if(style==="intervall"){ const L=i.lo===-INF?"-\\infty":tn(i.lo), H=i.hi===INF?"\\infty":tn(i.hi); return (i.cl?"[":"]")+L+";"+H+(i.ch?"]":"["); }
      if(i.lo===0&&i.hi===INF&&!i.cl) return "\\Rp";
      if(i.lo===-INF) return `\\{${v}\\in\\R\\mid ${v}${i.ch?"\\le ":"<"}${tn(i.hi)}\\}`;
      if(i.hi===INF)  return `\\{${v}\\in\\R\\mid ${v}${i.cl?"\\ge ":">"}${tn(i.lo)}\\}`;
      return `\\{${v}\\in\\R\\mid ${tn(i.lo)}${i.cl?"\\le ":"<"}${v}${i.ch?"\\le ":"<"}${tn(i.hi)}\\}`; }
    return null; },
  // Wertebereich einer stetigen Funktion auf einem Intervall (krit: innere Extremstellen)
  rangeOn(f,lo,hi,cl,ch,krit){
    const c=[]; if(isFinite(lo)) c.push({y:f(lo),inc:cl}); if(isFinite(hi)) c.push({y:f(hi),inc:ch});
    (krit||[]).forEach(k=>{ if(k>lo&&k<hi) c.push({y:f(k),inc:true}); });
    const mn=Math.min(...c.map(q=>q.y)), mx=Math.max(...c.map(q=>q.y)), eps=1e-9;
    const incMin=c.some(q=>Math.abs(q.y-mn)<eps&&q.inc), incMax=c.some(q=>Math.abs(q.y-mx)<eps&&q.inc);
    return [iv(mn,mx,incMin,incMax)]; }
};

/* ---------- Farben und Zeichenflächen ---------- */
function colors(){ const s=getComputedStyle(document.documentElement); const g=n=>s.getPropertyValue(n).trim();
  return {ink:g("--ink"),muted:g("--muted"),grid:g("--grid"),line:g("--line"),plot:g("--plot"),surface:g("--surface"),wave:g("--wave"),mark:g("--mark"),ok:g("--ok"),bad:g("--bad")}; }
function mkcv(parent,cls){ const c=el("div",{class:"cv "+(cls||"")}); parent.appendChild(c); return c; }
function canvasFill(host){
  const c=el("canvas"); host.appendChild(c); const ctx=c.getContext("2d"); const st={c,ctx,w:0,h:0};
  const fit=()=>{ const w=Math.max(160,host.clientWidth), h=Math.max(90,host.clientHeight); const d=window.devicePixelRatio||1;
    c.width=Math.round(w*d); c.height=Math.round(h*d); c.style.width=w+"px"; c.style.height=h+"px"; ctx.setTransform(d,0,0,d,0,0); st.w=w; st.h=h; };
  fit(); const ro=new ResizeObserver(fit); ro.observe(host); cleanups.push(()=>ro.disconnect()); return st; }
function arrow(ctx,x1,y1,x2,y2,col,lw){ lw=lw||2; ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=lw; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  const a=Math.atan2(y2-y1,x2-x1), s=8+lw; ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4)); ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4)); ctx.closePath(); ctx.fill(); }
function label(ctx,txt,x,y,col,align,weight,size){ ctx.fillStyle=col; ctx.font=MONO(weight||500,size||13); ctx.textAlign=align||"left"; ctx.fillText(txt,x,y); ctx.textAlign="left"; }
function dot(ctx,x,y,r,col,filled,bg){ ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fillStyle=filled?col:bg; ctx.fill(); ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.stroke(); }

/* Koordinatensystem mit Pfeilspitzen an beiden Achsen (immer!).
   o: {xr:[min,max], yr:[min,max], fn, dom (Menge), dots:[{x,y,closed}], shadowD, shadowW, shadowA (0..1),
       reads:[{x,y}], marks:[{x,y,label}], vline:{x,pts:[y..]}, step, xlab, ylab} */
function plot(st,col,o){
  const {ctx,w,h}=st; ctx.fillStyle=col.plot; ctx.fillRect(0,0,w,h);
  const pl=30,pr=26,pt=26,pb=30, aw=w-pl-pr, ah=h-pt-pb;
  const x0=o.xr[0],x1=o.xr[1],y0=o.yr[0],y1=o.yr[1];
  let sx,sy,xl,xh,yl,yh;
  if(o.free){ sx=aw/(x1-x0); sy=ah/(y1-y0); xl=x0; xh=x1; yl=y0; yh=y1; }
  else { const s0=Math.min(aw/(x1-x0),ah/(y1-y0)); sx=sy=s0; xl=x0-(aw/s0-(x1-x0))/2; xh=xl+aw/s0; yl=y0-(ah/s0-(y1-y0))/2; yh=yl+ah/s0; }
  const s=sx;
  const X=x=>pl+(x-xl)*sx, Y=y=>pt+(yh-y)*sy;
  const step=o.step||(Math.min(sx,sy)<16?2:1);
  // Gitter
  ctx.strokeStyle=col.grid; ctx.lineWidth=1; ctx.beginPath();
  for(let k=Math.ceil(xl/step);k*step<=xh;k++){ const px=Math.round(X(k*step))+.5; ctx.moveTo(px,pt-8); ctx.lineTo(px,h-pb+8); }
  for(let k=Math.ceil(yl/step);k*step<=yh;k++){ const py=Math.round(Y(k*step))+.5; ctx.moveTo(pl-8,py); ctx.lineTo(w-pr+8,py); }
  ctx.stroke();
  // Schatten (Definitions- und Wertemenge)
  const A=o.shadowA===undefined?1:o.shadowA;
  const bar=(S,axis,color)=>{ if(!S||A<=0) return; ctx.save(); ctx.globalAlpha=0.38*A; ctx.fillStyle=color;
    const ends=[];
    Sets.norm(S).forEach(i=>{ const lo=Math.max(i.lo,axis==="x"?xl-1:yl-1), hi=Math.min(i.hi,axis==="x"?xh+1:yh+1);
      if(axis==="x") ctx.fillRect(X(lo),Y(0)-6,X(hi)-X(lo),12); else ctx.fillRect(X(0)-6,Y(hi),12,Y(lo)-Y(hi));
      if(isFinite(i.lo)&&i.lo>=(axis==="x"?xl:yl)&&i.lo<=(axis==="x"?xh:yh)) ends.push([i.lo,i.cl]);
      if(isFinite(i.hi)&&i.hi>=(axis==="x"?xl:yl)&&i.hi<=(axis==="x"?xh:yh)) ends.push([i.hi,i.ch]); });
    ctx.restore(); ctx.save(); ctx.globalAlpha=Math.min(1,A*1.4);
    ends.forEach(([v,c])=>{ const px=axis==="x"?X(v):X(0), py=axis==="x"?Y(0):Y(v); dot(ctx,px,py,5.5,color,c,col.plot); }); ctx.restore(); };
  // Achsen mit Pfeilspitzen
  const ax=col.muted;
  arrow(ctx,pl-14,Y(0),w-5,Y(0),ax,2); arrow(ctx,X(0),h-pb+14,X(0),5,ax,2);
  ctx.fillStyle=ax; ctx.font=MONO(500,11); ctx.textAlign="center";
  const labx=step*(sx*step<22?2:1), laby=step*(sy*step<22?2:1);
  for(let k=Math.ceil(xl/step);k*step<=xh;k++){ const v=k*step; if(!v||Math.abs(v)%labx>1e-9) continue; ctx.fillRect(X(v)-.75,Y(0)-4,1.5,8); ctx.fillText(String(v).replace("-","−"),X(v),Y(0)+(Y(0)+22>h-4?-10:20)); }
  ctx.textAlign="right";
  for(let k=Math.ceil(yl/step);k*step<=yh;k++){ const v=k*step; if(!v||Math.abs(v)%laby>1e-9) continue; ctx.fillRect(X(0)-4,Y(v)-.75,8,1.5); ctx.fillText(String(v).replace("-","−"),X(0)-9,Y(v)+4); }
  ctx.textAlign="left";
  label(ctx,o.xlab||"x",w-20,Y(0)-10,col.ink,"left",700,14); label(ctx,o.ylab||"y",X(0)+10,16,col.ink,"left",700,14);
  bar(o.shadowD,"x",col.ok); bar(o.shadowW,"y",col.mark);
  // Kurve
  if(o.fn){ ctx.save(); ctx.beginPath(); ctx.rect(pl-12,pt-12,aw+24,ah+24); ctx.clip();
    ctx.strokeStyle=o.color||col.wave; ctx.lineWidth=3.2; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.beginPath();
    let pen=false, py0=0;
    for(let px=pl-10;px<=w-pr+10;px+=1){ const x=xl+(px-pl)/sx; let y=NaN;
      if(!o.dom||Sets.has(o.dom,x)||Math.abs(x-(o.dom.find(i=>Math.abs(i.lo-x)<1e-9||Math.abs(i.hi-x)<1e-9)||{lo:1e9}).lo)<1e-9) y=o.fn(x);
      if(!isFinite(y)||Math.abs(y)>1e4){ pen=false; continue; }
      const py=Y(y); if(pen&&Math.abs(py-py0)>ah*1.2) pen=false;
      if(!pen){ ctx.moveTo(px,py); pen=true; } else ctx.lineTo(px,py); py0=py; }
    ctx.stroke(); ctx.restore(); }
  (o.paths||[]).forEach(pa=>{ ctx.save(); ctx.beginPath(); ctx.rect(pl-12,pt-12,aw+24,ah+24); ctx.clip(); ctx.strokeStyle=pa.color||o.color||col.wave; ctx.lineWidth=3.2; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.beginPath();
    pa.pts.forEach((p,k)=>{ if(!p) return; if(k===0||!pa.pts[k-1]) ctx.moveTo(X(p[0]),Y(p[1])); else ctx.lineTo(X(p[0]),Y(p[1])); }); ctx.stroke(); ctx.restore(); });
  (o.dots||[]).forEach(d=>dot(ctx,X(d.x),Y(d.y),5.5,d.color||o.color||col.wave,d.closed,col.plot));
  // Ablesehilfen
  (o.reads||[]).forEach(r=>{ ctx.save(); ctx.strokeStyle=col.mark; ctx.lineWidth=1.8; ctx.setLineDash([5,4]); ctx.beginPath();
    ctx.moveTo(X(r.x),Y(0)); ctx.lineTo(X(r.x),Y(r.y)); ctx.lineTo(X(0),Y(r.y)); ctx.stroke(); ctx.restore(); dot(ctx,X(r.x),Y(r.y),5,col.mark,true,col.plot); });
  (o.marks||[]).forEach(m=>{ dot(ctx,X(m.x),Y(m.y),6,m.color||col.mark,true,col.plot); if(m.label) label(ctx,m.label,X(m.x)+9,Y(m.y)-9,m.color||col.mark,"left",700,13); });
  if(o.vline){ ctx.save(); ctx.strokeStyle=col.mark; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(X(o.vline.x),pt-8); ctx.lineTo(X(o.vline.x),h-pb+8); ctx.stroke(); ctx.restore();
    (o.vline.pts||[]).forEach(y=>dot(ctx,X(o.vline.x),Y(y),6,col.bad,true,col.plot)); }
  return {X,Y,xl,xh,yl,yh,s,sx,sy};
}

/* Zahlengerade mit Pfeilspitzen an beiden Enden.
   o: {lo,hi, set (Menge, schattiert), nums:[{v,state}]} */
function numline(st,col,o){
  const {ctx,w,h}=st; ctx.fillStyle=col.plot; ctx.fillRect(0,0,w,h);
  const pl=22,pr=22, aw=w-pl-pr, y=h*0.62, sc=aw/(o.hi-o.lo), X=v=>pl+(v-o.lo)*sc;
  ctx.strokeStyle=col.grid; ctx.lineWidth=1; ctx.beginPath();
  for(let v=Math.ceil(o.lo);v<=o.hi;v++){ const px=Math.round(X(v))+.5; ctx.moveTo(px,12); ctx.lineTo(px,h-12); } ctx.stroke();
  if(o.set){ const color=col.mark;
    Sets.norm(o.set).forEach(i=>{ const lo=Math.max(i.lo,o.lo-0.3), hi=Math.min(i.hi,o.hi+0.3);
      ctx.save(); ctx.globalAlpha=0.42; ctx.fillStyle=color; ctx.fillRect(X(lo),y-9,X(hi)-X(lo),18); ctx.restore();
      if(isFinite(i.lo)&&i.lo>=o.lo&&i.lo<=o.hi) dot(ctx,X(i.lo),y,6.5,color,i.cl,col.plot);
      if(isFinite(i.hi)&&i.hi>=o.lo&&i.hi<=o.hi) dot(ctx,X(i.hi),y,6.5,color,i.ch,col.plot); }); }
  arrow(ctx,pl-8,y,w-4,y,col.muted,2); arrow(ctx,w-pr+4,y,pl-14,y,col.muted,2);
  ctx.fillStyle=col.muted; ctx.font=MONO(500,12); ctx.textAlign="center";
  for(let v=Math.ceil(o.lo+0.01);v<=o.hi-0.01;v++){ ctx.fillRect(X(v)-.75,y-5,1.5,10); ctx.fillText(String(v).replace("-","−"),X(v),y+26); }
  ctx.textAlign="left";
  (o.nums||[]).forEach(n=>{ const px=X(n.v), py=y-40; const c=n.state==="sel"?col.wave:n.state==="right"?col.ok:n.state==="wrong"?col.bad:n.state==="miss"?col.ok:col.muted;
    ctx.beginPath(); ctx.arc(px,py,15,0,TAU); ctx.fillStyle=n.state==="sel"||n.state==="right"||n.state==="wrong"?c:col.plot; ctx.fill(); ctx.lineWidth=2.5; ctx.strokeStyle=c; ctx.stroke();
    ctx.fillStyle=(n.state==="sel"||n.state==="right"||n.state==="wrong")?"#fff":col.ink; ctx.font=MONO(700,13); ctx.textAlign="center"; ctx.fillText(String(n.t!==undefined?n.t:n.v).replace("-","−").replace(".",","),px,py+4.5); ctx.textAlign="left";
    ctx.strokeStyle=c; ctx.lineWidth=1.4; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(px,py+15); ctx.lineTo(px,y-2); ctx.stroke(); ctx.setLineDash([]); });
  return {X,sc};
}

MM_tn=tn;
Object.assign(MM,{el,shuffle,rand,one,pick,ri,esc,TAU,MONO,LOBW,cleanup,cleanups,loop,tn,ts,sg,tex,T,Sets,INF,colors,mkcv,canvasFill,arrow,label,dot,plot,numline});
})();
