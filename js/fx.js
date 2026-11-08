/* Mathe-Master · Klang und kleine Animationen (alles abschaltbar, dezent) */
(function(){
"use strict";
const MM = window.MM;
const KEY="mathe-master-sound";
let on=true; try{ on=localStorage.getItem(KEY)!=="0"; }catch(e){}
const reduce = ()=>window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Klang: weiche Sinus-Töne mit Hall, kein Echo ---------- */
/* ===== HIER EINSTELLEN ===== */
const LAUT   = 0.30;   // Gesamtlautstärke (0.1 = sehr leise, 0.3 = dezent hörbar, 0.6 = deutlich)
const TIEFE  = 1.0;    // Tonhöhe: 1 = wie eingestellt, 0.5 = eine Oktave tiefer, 2 = eine Oktave höher
const HALL   = 0.55;   // Hallanteil (0 = trocken, 0.55 = wie bisher, 1 = viel Hall)
const HELLE  = 1800;   // Filter in Hz: kleiner = dumpfer, größer = heller
const LAENGE = 1.0;    // Ausklingzeit: 1 = wie eingestellt, 0.5 = halb so lang, 2 = doppelt so lang
/* =========================== */

let ctx=null, bus=null;
function setup(){
  if(ctx) return ctx.state==="suspended"?ctx.resume():0;
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  ctx=new AC();
  const master=ctx.createGain(); master.gain.value=LAUT; master.connect(ctx.destination);
  // Hall aus erzeugtem Rauschen (exponentiell abklingend)
  const len=Math.floor(ctx.sampleRate*1.6), buf=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){ const d=buf.getChannelData(c); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2); }
  const verb=ctx.createConvolver(); verb.buffer=buf; const vg=ctx.createGain(); vg.gain.value=HALL; verb.connect(vg); vg.connect(master);
  // Weichzeichner: nimmt hohe Anteile weg
  const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=HELLE; lp.Q.value=0.4;
  bus=ctx.createGain(); bus.gain.value=1; bus.connect(lp); lp.connect(master); lp.connect(verb);
  return ctx.state==="suspended"?ctx.resume():0;
}
// Ein Ton: freq in Hz, t0 = Startverzögerung in s, dur = Dauer in s, vol = Lautstärke 0..1, glide = Tonhöhenänderung (z. B. 0.94 = leicht abwärts)
function note(freq,t0,{dur=0.5,vol=0.5,glide=0}={}){
  freq*=TIEFE; dur*=LAENGE;
  const t=ctx.currentTime+t0, o=ctx.createOscillator(), g=ctx.createGain();
  o.type="sine"; o.frequency.setValueAtTime(freq,t); if(glide) o.frequency.exponentialRampToValueAtTime(freq*glide,t+dur*0.8);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(bus); o.start(t); o.stop(t+dur+0.05);
}
// Tonvorrat in Hz
const N={F3:174.6,A3:220,C4:261.6,E4:329.6,G4:392,A4:440,C5:523.3,E5:659.3,G5:784};
function play(fn){ if(!on) return; try{ const r=setup(); if(r&&r.then) r.then(()=>{ try{fn();}catch(e){} }); else fn(); }catch(e){} }
// Die Klänge: note(Ton, Start, {dur, vol})
const Snd={
  ok(){ play(()=>{ note(N.E4,0,{vol:.6,dur:.5}); note(N.A4,0.08,{vol:.5,dur:.6}); }); },                                   // richtige Antwort
  card(){ play(()=>{ note(N.C4,0,{vol:.55}); note(N.E4,0.08,{vol:.5}); note(N.G4,0.16,{vol:.45,dur:.65}); }); },          // Mini-Check gelöst
  bad(){ play(()=>{ note(N.A3,0,{vol:.45,dur:.35,glide:.9}); }); },                                                       // falsch
  level(perfect){ play(()=>{ [N.C4,N.E4,N.G4,N.C5].forEach((f,i)=>note(f,i*0.1,{vol:.55,dur:.7}));                           // Level geschafft
    if(perfect){ note(N.E5,0.45,{vol:.35,dur:.8}); note(N.G5,0.55,{vol:.3,dur:.9}); } }); },
  miss(){ play(()=>{ note(N.A3,0,{vol:.45,dur:.45}); note(N.F3,0.12,{vol:.45,dur:.55}); }); },                             // Level verfehlt
  pop(){ play(()=>{ note(N.A3,0,{vol:.4,dur:.25}); }); }                                                                   // Ton-Schalter
};

/* ---------- Animationen ---------- */
function confetti(host,n=26){
  if(reduce()) return;
  const r=host.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+Math.min(r.height*0.35,160);
  const layer=document.createElement("div"); layer.className="confetti"; document.body.appendChild(layer);
  const cols=["var(--wave)","var(--mark)","var(--ok)","var(--ink)"];
  for(let i=0;i<n;i++){ const p=document.createElement("i"); const s=5+Math.random()*6;
    p.style.cssText=`left:${cx}px;top:${cy}px;width:${s}px;height:${s}px;background:${cols[i%cols.length]};border-radius:${i%3?"50%":"2px"}`;
    layer.appendChild(p); const a=Math.random()*Math.PI*2, d=90+Math.random()*190, dx=Math.cos(a)*d, dy=Math.sin(a)*d-70;
    p.animate([{transform:"translate(0,0) scale(1)",opacity:.95},{transform:`translate(${dx}px,${dy}px) scale(1)`,opacity:.95,offset:.55},{transform:`translate(${dx*1.15}px,${dy+130}px) scale(.6)`,opacity:0}],{duration:1500+Math.random()*500,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"}); }
  setTimeout(()=>layer.remove(),2200);
}
function ring(host){ // zarter Ring um ein Element
  if(reduce()||!host) return; host.classList.remove("glow"); void host.offsetWidth; host.classList.add("glow"); }
function countUp(node,to,ms=700){
  if(reduce()||to<=0){ node.textContent=to+" / "+(node.dataset.of||""); return; }
  const of=node.dataset.of||"", t0=performance.now();
  (function f(t){ const k=Math.min(1,(t-t0)/ms); node.textContent=Math.round(to*k)+" / "+of; if(k<1) requestAnimationFrame(f); })(t0);
}

/* ---------- Schalter ---------- */
const SPK=(off)=>`<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8h3l4-3.5v11L6 12H3z" fill="currentColor"/>${off?'<path d="M13.5 7.5l4 5m0-5l-4 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>':'<path d="M13 7.2a4 4 0 0 1 0 5.6M15.2 5a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'}</svg>`;
function button(){
  const b=document.createElement("button"); b.className="snd";
  const upd=()=>{ b.innerHTML=SPK(!on); b.setAttribute("aria-pressed",String(on)); b.title=b.ariaLabel=on?"Ton ist an – zum Ausschalten tippen":"Ton ist aus – zum Einschalten tippen"; };
  b.addEventListener("click",()=>{ on=!on; try{ localStorage.setItem(KEY,on?"1":"0"); }catch(e){} document.querySelectorAll(".theme .snd").forEach(x=>{ x.innerHTML=SPK(!on); x.setAttribute("aria-pressed",String(on)); x.title=x.ariaLabel=on?"Ton ist an – zum Ausschalten tippen":"Ton ist aus – zum Einschalten tippen"; }); if(on) Snd.pop(); });
  upd(); return b; }

MM.Fx={snd:Snd,confetti,ring,countUp,button,get on(){return on;}};
})();
