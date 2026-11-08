/* Mathe-Master · Klang und kleine Animationen (alles abschaltbar, dezent) */
(function(){
"use strict";
const MM = window.MM;
const KEY="mathe-master-sound";
let on=true; try{ on=localStorage.getItem(KEY)!=="0"; }catch(e){}
const reduce = ()=>window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Klang: weiche Sinus-Glocken mit Echo und Hall ---------- */
let ctx=null, bus=null;
function setup(){
  if(ctx) return ctx.state==="suspended"?ctx.resume():0;
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  ctx=new AC();
  const master=ctx.createGain(); master.gain.value=0.16; master.connect(ctx.destination);
  // Hall aus erzeugtem Rauschen (exponentiell abklingend)
  const len=Math.floor(ctx.sampleRate*2.2), buf=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){ const d=buf.getChannelData(c); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2); }
  const verb=ctx.createConvolver(); verb.buffer=buf; const vg=ctx.createGain(); vg.gain.value=0.55; verb.connect(vg); vg.connect(master);
  // Echo
  const dl=ctx.createDelay(1); dl.delayTime.value=0.27; const fb=ctx.createGain(); fb.gain.value=0.32;
  const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=2400;
  dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(verb); lp.connect(master);
  bus=ctx.createGain(); bus.gain.value=1; bus.connect(master); bus.connect(verb); bus.connect(dl);
  return ctx.state==="suspended"?ctx.resume():0;
}
function note(freq,t0,{dur=1.4,vol=0.5,type="sine",glide=0}={}){
  const t=ctx.currentTime+t0, o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t); if(glide) o.frequency.exponentialRampToValueAtTime(freq*glide,t+dur*0.6);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(bus);
  // leiser Oberton für den Glockencharakter
  const o2=ctx.createOscillator(), g2=ctx.createGain(); o2.type="sine"; o2.frequency.setValueAtTime(freq*2.76,t);
  g2.gain.setValueAtTime(0.0001,t); g2.gain.exponentialRampToValueAtTime(vol*0.16,t+0.008); g2.gain.exponentialRampToValueAtTime(0.0001,t+dur*0.35);
  o2.connect(g2); g2.connect(bus);
  o.start(t); o.stop(t+dur+0.05); o2.start(t); o2.stop(t+dur*0.4);
}
const N={C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C6:1046.5,D6:1174.7,E6:1318.5,G6:1568,A4:440,E4:329.63,D4:293.66,G4:392};
function play(fn){ if(!on) return; try{ const r=setup(); if(r&&r.then) r.then(()=>{ try{fn();}catch(e){} }); else fn(); }catch(e){} }
const Snd={
  ok(){ play(()=>{ note(N.E5,0,{vol:.45}); note(N.A5,0.11,{vol:.4,dur:1.7}); }); },
  card(){ play(()=>{ note(N.G5,0,{vol:.4}); note(N.C6,0.1,{vol:.4}); note(N.E6,0.22,{vol:.32,dur:1.9}); }); },
  bad(){ play(()=>{ note(N.D4,0,{vol:.32,dur:0.9,glide:.94}); }); },
  level(perfect){ play(()=>{ [N.C5,N.E5,N.G5,N.C6].forEach((f,i)=>note(f,i*0.13,{vol:.42,dur:2}));
    if(perfect) [N.E6,N.G6].forEach((f,i)=>note(f,0.62+i*0.12,{vol:.28,dur:2.4})); }); },
  miss(){ play(()=>{ note(N.G4,0,{vol:.3,dur:1.2}); note(N.E4,0.18,{vol:.28,dur:1.5}); }); },
  pop(){ play(()=>{ note(N.D6,0,{vol:.18,dur:.5}); }); }
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
