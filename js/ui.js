/* Mathe-Master · Rahmen: Lernpfad, Steckbriefe, Challenges, Lehrkraft-Modus */
(function(){
"use strict";
const MM = window.MM;
const {el,shuffle,one,T,tex,cleanup,mkcv,LOBW,PRO_LEVEL,HUERDE} = MM;
const app = document.getElementById("app");
const CHEVRON = `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M7 4l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const LOCK = `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="3" y="8" width="12" height="8" rx="2" fill="currentColor"/><path d="M5.5 8V6a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
const BOOK = `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 3.5C4.5 2.5 7 2.7 9 4.2c2-1.5 4.5-1.7 7-.7v10.3c-2.5-1-5-.8-7 .7-2-1.5-4.5-1.7-7-.7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 4.2v10.3" stroke="currentColor" stroke-width="1.8"/></svg>`;

/* ---------- Speicher ---------- */
const KEY="mathe-master-v1", THEME_KEY="mathe-master-theme", KAP_KEY="mathe-master-kapitel";
let P={cards:{},lv:{},best:{}};
try{ const s=JSON.parse(localStorage.getItem(KEY)||"null"); if(s&&typeof s==="object") P={cards:s.cards||{},lv:s.lv||{},best:s.best||{}}; }catch(e){}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(P)); }catch(e){} }
let teacher=false;
let theme="auto"; try{ theme=localStorage.getItem(THEME_KEY)||"auto"; }catch(e){}
function applyTheme(){ if(theme==="auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme",theme); }
applyTheme();
function themeSwitch(){ const box=el("div",{class:"theme",role:"group","aria-label":"Darstellung"});
  [["light","☀︎","Hell"],["auto","Auto","Wie das Gerät"],["dark","☾","Dunkel"]].forEach(([v,l,a])=>{
    const b=el("button",{"aria-pressed":String(v===theme),"aria-label":a,title:a},l);
    b.addEventListener("click",()=>{ theme=v; try{ localStorage.setItem(THEME_KEY,v); }catch(e){} applyTheme();
      document.querySelectorAll(".theme button:not(.snd)").forEach(x=>x.setAttribute("aria-pressed",String(x.title===a))); });
    box.appendChild(b); });
  box.appendChild(MM.Fx.button());
  return box; }

/* ---------- Kapitel laden ---------- */
MM.addKapitel = (id,def)=>{ MM.kapitel[id]=def; };
const status={}; // id -> "ok" | "fehlt" | "ab"
const heute=()=>{ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
function loadChapters(done){
  let pending=0; const fin=()=>{ if(--pending<=0) done(); }; pending=1;
  MM.LISTE.forEach(e=>{
    if(!teacher && e.ab && heute()<e.ab){ status[e.id]="ab"; return; }
    if(MM.kapitel[e.id]){ status[e.id]="ok"; return; }
    pending++; const s=document.createElement("script"); s.src=e.datei+"?v="+MM.VERSION+"-"+MM.STAND;
    s.onload=()=>{ status[e.id]=MM.kapitel[e.id]?"ok":"fehlt"; fin(); }; s.onerror=()=>{ status[e.id]="fehlt"; fin(); };
    document.head.appendChild(s); });
  fin(); }
const meta=id=>MM.LISTE.find(e=>e.id===id);
const isOk=id=>status[id]==="ok";
const fmtDate=iso=>{ const [y,m,d]=iso.split("-"); return `${+d}.${+m}.`; };

/* ---------- Fortschritts-Logik ---------- */
const chId=(k,typ)=>k.id+"-"+typ;
const cid=(k,key)=>k.id+"."+key;
const lvPassed=(id,n)=>!!(P.lv[id]&&P.lv[id][n]);
const cardsDone=k=>k.def.steckOrder.every(key=>P.cards[cid(k,key)]);
const chOpen=(k,i)=>teacher||(i===0?cardsDone(k):lvPassed(chId(k,k.def.challOrder[i-1]),0));
const lvOpen=(id,n)=>teacher||n===0||lvPassed(id,n-1);
function getK(id){ const m=meta(id); return m&&isOk(id)?{id,nr:m.nr,titel:m.titel,untertitel:m.untertitel,buch:m.buch,def:MM.kapitel[id]}:null; }
const okIds=()=>MM.LISTE.filter(e=>isOk(e.id)).map(e=>e.id);
let aktK=null; try{ aktK=localStorage.getItem(KAP_KEY); }catch(e){}
function curK(){ if(!aktK||!isOk(aktK)) aktK=okIds()[0]; return getK(aktK); }

/* ---------- Buch-Button und Mathegym ---------- */
function buchTools(bar,text){ // fügt Buch-Button zur Leiste und Infozeile darunter hinzu
  if(!text) return null; const tools=bar.querySelector(".tools")||(()=>{ const t=el("div",{class:"tools"}); bar.appendChild(t); return t; })();
  const b=el("button",{class:"toolbtn","aria-pressed":"false"},`${BOOK}Buch`); const info=el("div",{class:"buchinfo",hidden:""},`<b>LS</b> ${Array.isArray(text)?text.join("<br>"):text}`);
  b.addEventListener("click",()=>{ const on=info.hidden; info.hidden=!on; b.setAttribute("aria-pressed",String(on)); });
  tools.prepend(b); bar.after(info); return {b,info}; }
function openModal(inner){ const bg=el("div",{class:"modal-bg"}); const m=el("div",{class:"modal",role:"dialog","aria-modal":"true"}); m.appendChild(inner); bg.appendChild(m);
  const close=()=>bg.remove(); bg.addEventListener("click",e=>{ if(e.target===bg) close(); }); document.body.appendChild(bg); return close; }
function mathegymModal(kid){
  const items=(MM.MATHEGYM[kid]||[]); const box=el("div",{style:"display:flex;flex-direction:column;gap:12px"});
  box.appendChild(el("h3",{},"Üben im Mathegym"));
  if(!items.length){ box.appendChild(el("p",{class:"muted"},"Für dieses Kapitel ist noch keine Mathegym-Aufgabe eingetragen. Das geht in der Datei <b>kapitel/mathegym.js</b>."));
  } else { box.appendChild(el("p",{class:"muted"},"Passende Mathegym-Aufgaben zu diesem Kapitel:"));
    items.forEach(it=>{ const d=el("div",{class:"mgitem"},`<b>${it.titel}</b>${it.wo?`<span class="where">${it.wo}</span>`:""}${it.hinweis?`<span class="muted">${it.hinweis}</span>`:""}`);
      if(it.url){ const a=el("a",{class:"btn",href:it.url,target:"_blank",rel:"noopener"},"Im Mathegym öffnen ↗"); d.appendChild(a); } box.appendChild(d); }); }
  const row=el("div",{class:"mrow"}); const c=el("button",{class:"btn ghost"},"Schließen"); row.appendChild(c); box.appendChild(row);
  const close=openModal(box); c.addEventListener("click",close); }
function mgButton(kid){ const n=(MM.MATHEGYM[kid]||[]).length; if(!n&&!teacher) return null;
  const b=el("button",{class:"toolbtn mg"+(n?"":" empty")},"Üben im Mathegym"+(n?"":" (leer)")); b.addEventListener("click",()=>mathegymModal(kid)); return b; }

/* ---------- Lehrkraft-Modus: 4 s auf das Logo + PIN ---------- */
function pinDialog(onOk){
  const box=el("div",{class:"pin"}); box.appendChild(el("h3",{},"Lehrkraft-Modus"));
  box.appendChild(el("p",{class:"muted"},"PIN eingeben"));
  const disp=el("div",{class:"disp"},"<i></i><i></i><i></i><i></i>"); box.appendChild(disp);
  const want=String(MM.PIN||"2605"); let cur="";
  const upd=()=>[...disp.children].forEach((d,i)=>d.classList.toggle("on",i<cur.length));
  const pad=el("div",{class:"pad"}); let close;
  const press=ch=>{ if(ch==="⌫"){ cur=cur.slice(0,-1); upd(); return; } if(ch==="×"){ close(); return; }
    if(cur.length>=want.length) return; cur+=ch; upd();
    if(cur.length===want.length){ if(cur===want){ close(); onOk(); } else { disp.classList.remove("shake"); void disp.offsetWidth; disp.classList.add("shake"); cur=""; setTimeout(upd,350); } } };
  ["1","2","3","4","5","6","7","8","9","×","0","⌫"].forEach(ch=>{ const b=el("button",{class:ch==="×"||ch==="⌫"?"muted":""},ch==="×"?"Abbruch":ch); b.addEventListener("click",()=>press(ch)); pad.appendChild(b); });
  box.appendChild(pad); close=openModal(box); }
function setTeacher(on){ teacher=on; loadChapters(()=>renderHome()); }
function attachLogoHold(logo){ let t=null;
  const start=()=>{ clearTimeout(t); logo.classList.add("hold"); t=setTimeout(()=>{ logo.classList.remove("hold"); if(teacher) setTeacher(false); else pinDialog(()=>setTeacher(true)); },4000); };
  const stop=()=>{ clearTimeout(t); logo.classList.remove("hold"); };
  logo.addEventListener("pointerdown",start); ["pointerup","pointerleave","pointercancel"].forEach(e=>logo.addEventListener(e,stop));
  logo.addEventListener("contextmenu",e=>e.preventDefault()); }

/* ---------- Ansichten ---------- */
function view(fill){ cleanup(); app.className=fill?"fill":""; app.innerHTML=""; window.scrollTo(0,0); }
function bar(backLabel,onBack,eyebrow,title,right){ const b=el("div",{class:"bar"});
  const back=el("button",{class:"back"},backLabel); back.addEventListener("click",onBack);
  const ttl=el("div",{class:"ttl"},`<span class="eyebrow">${eyebrow}</span><h2>${title}</h2>`);
  b.append(back,ttl); const tools=el("div",{class:"tools"}); if(right) tools.appendChild(right); b.appendChild(tools); app.appendChild(b); return b; }

function stations(k){
  const D=k.def; const nC=D.steckOrder.length, dC=D.steckOrder.filter(key=>P.cards[cid(k,key)]).length;
  const list=[{kind:"cards",titel:"Steckbriefe",eyebrow:"Start",kurz:`${nC} Karten zum Durchblättern, jede mit Mini-Check.`,open:true,done:dC===nC,prog:`${dC} / ${nC} Karten`,go:()=>renderFocus(k)}];
  D.challOrder.forEach((typ,i)=>{ const id=chId(k,typ), def=D.challenges[typ], passed=[0,1,2].map(n=>lvPassed(id,n));
    list.push({kind:"ch",typ,titel:def.titel,eyebrow:`Challenge ${i+1}`,kurz:def.kurz,open:chOpen(k,i),done:passed.every(Boolean),passed,
      lock:i===0?"Erst alle Steckbriefe mit Mini-Check schaffen.":`Erst Level 1 von „${D.challenges[D.challOrder[i-1]].titel}“ schaffen.`,go:()=>renderIntro(k,typ)}); });
  return list; }

function renderHome(){
  view(false);
  const top=el("header",{class:"top"});
  const brand=el("div",{class:"brand"});
  const logo=el("button",{class:"logo","aria-label":"Mathe-Master"},`<svg width="50" height="50" viewBox="0 0 46 46" aria-hidden="true"><rect x="1" y="1" width="44" height="44" rx="12" fill="none" stroke="var(--line)" stroke-width="2"/><path d="M8 36 L8 10 M8 36 L38 36" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round"/><path d="M10 33 C 17 31, 21 19, 26 15 S 34 11, 37 10" fill="none" stroke="var(--wave)" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="15" r="3.6" fill="var(--mark)"/></svg>`);
  attachLogoHold(logo);
  brand.append(logo,el("div",{},`<h1>Mathe-Master</h1><p>TG Eingangsklasse · Mathematik</p>`));
  const tabs=el("nav",{class:"tabs","aria-label":"Kapitel"});
  if(teacher){ const tb=el("button",{class:"teacher"},"Lehrkraft-Modus: alles frei ✕"); tb.addEventListener("click",()=>setTeacher(false)); tabs.appendChild(tb); }
  const k=curK();
  MM.LISTE.forEach(e=>{ const ok=isOk(e.id); const b=el("button",{class:"tab"+(ok?"":" soon"),"aria-pressed":String(ok&&k&&k.id===e.id)},
      `<span class="nr">${e.nr}</span>${e.titel}${ok?"":(status[e.id]==="ab"&&e.ab?` <span class="tag-s">ab ${fmtDate(e.ab)}</span>`:' <span class="tag-s">folgt</span>')}`);
    if(!ok){ b.setAttribute("aria-disabled","true"); b.title="Wird später freigeschaltet"; } else b.addEventListener("click",()=>{ aktK=e.id; try{ localStorage.setItem(KAP_KEY,aktK); }catch(_){} renderHome(); });
    tabs.appendChild(b); });
  if(MM.Nachweis) MM.Nachweis.homeButtons(teacher).forEach(b=>tabs.appendChild(b));
  tabs.appendChild(themeSwitch());
  top.append(brand,tabs); app.appendChild(top);

  if(!k){ app.appendChild(el("div",{class:"locked-k"},"Noch kein Kapitel freigeschaltet. Es kommt bald.")); footer(); return; }
  const home=el("main",{class:"home"});
  const kh=el("div",{class:"khead"},`<span class="eyebrow">Kapitel ${k.nr} · Lernpfad</span><h2>${k.titel}</h2><p>${k.untertitel||""}</p>`);
  const tools=el("div",{class:"tools",style:"margin-top:10px"}); const bk=buchTools({querySelector:()=>tools,after:n=>kh.appendChild(n)},k.buch);
  const mg=mgButton(k.id); if(mg) tools.appendChild(mg); kh.appendChild(tools); if(bk) kh.appendChild(bk.info); home.appendChild(kh);
  const st=stations(k); const next=st.find(s=>s.open&&!s.done);
  const note=el("p",{class:"cta-note"});
  const path=el("div",{class:"path"});
  st.forEach((s,i)=>{ if(i) path.appendChild(el("div",{class:"conn","aria-hidden":"true"},CHEVRON));
    const b=el("button",{class:"station"+(s.done?" done":"")+(!s.open?" locked":"")+(s===next?" next":"")});
    const stat=s.kind==="cards"?s.prog:`<span class="dots">${s.passed.map(p=>`<i class="${p?"on":""}"></i>`).join("")}</span>${s.passed.filter(Boolean).length} / 3 Level`;
    b.innerHTML=`${s===next?'<span class="badge-next">Als Nächstes</span>':""}<span class="num">${s.done?"✓":(s.open?i+1:LOCK)}</span><span class="eyebrow">${s.eyebrow}</span><h3>${s.titel}</h3><p>${s.kurz}</p><span class="stat">${stat}</span>`;
    if(s.open) b.addEventListener("click",s.go);
    else { b.setAttribute("aria-disabled","true"); b.addEventListener("click",()=>{ note.textContent=s.lock; note.className="cta-note warn"; }); }
    path.appendChild(b); });
  home.appendChild(path);
  const cta=el("div",{class:"cta-row"});
  if(next){ let txt;
    if(next.kind==="cards") txt="Weiter: Steckbriefe lesen →";
    else { const n=next.passed.findIndex(p=>!p); txt=`Weiter: ${next.titel} · Level ${n+1} →`; }
    const b=el("button",{class:"btn big"},txt);
    b.addEventListener("click",()=>{ if(next.kind==="cards") renderFocus(k); else { const n=next.passed.findIndex(p=>!p); lvOpen(chId(k,next.typ),n)?playLevel(k,next.typ,n):renderIntro(k,next.typ); } });
    cta.appendChild(b); }
  else cta.appendChild(el("p",{class:"prompt"},"Kapitel geschafft. Alle Levels lassen sich wiederholen."));
  cta.appendChild(note); home.appendChild(cta);
  home.appendChild(el("div",{class:"rules"},
    `<div class="rule"><b>1 · Steckbriefe</b>Karte lesen, Mini-Check lösen, weiterblättern. Danach geht die erste Challenge auf.</div>
     <div class="rule"><b>2 · Level-Hürde</b>Jedes Level hat ${PRO_LEVEL} Aufgaben. Mit ${HUERDE} Treffern im ersten Versuch steigst du auf.</div>
     <div class="rule"><b>3 · Aus Fehlern lernen</b>Nach jeder Aufgabe siehst du, warum die Antwort stimmt oder wo der Fehler lag.</div>`));
  const next2=MM.LISTE.find(e=>!isOk(e.id)&&e.nr>k.nr);
  if(next2) home.appendChild(el("div",{class:"locked-k"},`Nächstes Kapitel: <b>${next2.titel}</b>. Es wird freigeschaltet, wenn es im Unterricht dran ist.`));
  app.appendChild(home); footer();
}
function footer(){
  const ft=el("footer",{},`<span>Mathe-Master · Version ${MM.VERSION} · Stand ${MM.STAND}</span>`);
  const rs=el("button",{class:"linkbtn"},"Fortschritt zurücksetzen"); let armT;
  rs.addEventListener("click",()=>{ if(rs.classList.contains("arm")){ P={cards:{},lv:{},best:{}}; save(); renderHome(); return; }
    rs.classList.add("arm"); rs.textContent="Wirklich? Nochmal tippen"; clearTimeout(armT); armT=setTimeout(()=>{ rs.classList.remove("arm"); rs.textContent="Fortschritt zurücksetzen"; },3000); });
  ft.appendChild(rs); app.appendChild(ft); }

/* ---------- Steckbriefe ---------- */
function renderFocus(k,start){
  view(true);
  const keys=k.def.steckOrder; let i=start!==undefined?start:keys.findIndex(key=>!P.cards[cid(k,key)]); if(i<0) i=0;
  const counter=el("span",{class:"score"});
  const hd=bar("← Lernpfad",renderHome,`Kapitel ${k.nr} · Steckbriefe`,"Steckbriefe",counter); hd.querySelector(".tools").appendChild(themeSwitch());
  const stage=el("div",{class:"fstage"}); app.appendChild(stage);
  const nav=el("div",{class:"fnav"}); app.appendChild(nav);
  const prev=el("button",{class:"btn ghost"},"← Zurück"), next=el("button",{class:"btn"},"Weiter →");
  const mid=el("div",{class:"fmid"}); const dots=el("div",{class:"fdots"}); const fh=el("div",{class:"fhint"}); mid.append(dots,fh);
  nav.append(prev,mid,next);
  const done=n=>!!P.cards[cid(k,keys[n])];
  const firstOpen=()=>{ const f=keys.findIndex((key,n)=>!done(n)); return f===-1?keys.length-1:f; };
  const reach=n=>teacher||n<=firstOpen();
  const canNext=()=>teacher||done(i);
  let buch=null;
  function updNav(){
    counter.textContent=`Karte ${i+1} / ${keys.length}`;
    prev.disabled=i===0; const last=i===keys.length-1;
    next.textContent=last?(cardsDone(k)?"Zur ersten Challenge →":"Fertig →"):"Weiter →";
    next.disabled=!canNext();
    fh.textContent=canNext()?(last&&!cardsDone(k)?"Es fehlen noch Mini-Checks.":"Wischen oder tippen"):"Erst den Mini-Check lösen";
    dots.innerHTML=""; keys.forEach((key,n)=>{ const d=el("button",{class:(done(n)?"done ":"")+(n===i?"cur":""),"aria-label":`Karte ${n+1}`}); d.addEventListener("click",()=>{ if(n!==i&&reach(n)) show(n,n>i?1:-1); }); dots.appendChild(d); });
  }
  function go(d){ if(d<0){ if(i>0) show(i-1,-1); return; }
    if(!canNext()) return;
    if(i<keys.length-1) show(i+1,1);
    else if(cardsDone(k)||teacher) renderIntro(k,k.def.challOrder[0]);
    else show(keys.findIndex((key,n)=>!done(n)),-1); }
  prev.addEventListener("click",()=>go(-1)); next.addEventListener("click",()=>go(1));
  function show(n,dir){
    cleanup(); i=n; stage.innerHTML=""; const key=keys[i], sb=k.def.steckbriefe[key];
    if(buch){ buch.info.remove(); buch=null; } const tl=hd.querySelector(".tools"); const old=tl.querySelector(".toolbtn:not(.mg)"); if(old&&!old.closest(".theme")) old.remove();
    buch=buchTools(hd,sb.buch||k.buch);
    const card=el("article",{class:"fcard"+(dir?(dir>0?" inR":" inL"):"")});
    const tx=el("div",{class:"ftext"}); tx.appendChild(el("span",{class:"eyebrow"},`Steckbrief ${i+1}`)); tx.appendChild(el("h3",{},T(sb.titel)));
    if(sb.formel) tx.appendChild(el("div",{class:"formel"},tex(sb.formel)));
    tx.appendChild(el("p",{},T(sb.text)));
    if(sb.merke) tx.appendChild(el("p",{class:"merke"},`<span class="tag">Merke</span><br>${T(sb.merke)}`));
    if(sb.falle) tx.appendChild(el("p",{class:"falle"},`<span class="tag">Wichtig</span><br>${T(sb.falle)}`));
    const side=el("div",{class:"fside"}); card.append(tx,side); stage.appendChild(card);
    if(sb.viz) sb.viz(side);
    side.appendChild(checkBox(cid(k,key),sb,updNav));
    let sx=null, sy=null;
    card.addEventListener("pointerdown",e=>{ sx=e.clientX; sy=e.clientY; });
    card.addEventListener("pointerup",e=>{ if(sx===null) return; const dx=e.clientX-sx, dy=e.clientY-sy; sx=null; if(Math.abs(dx)>90&&Math.abs(dy)<50&&!e.target.closest("canvas,input,.seg,.mctrl,.chips")) go(dx<0?1:-1); });
    updNav();
  }
  show(i,0);
}
function checkBox(id,sb,onChange){ const c=sb.check; const box=el("div",{class:"check"+(P.cards[id]?" solved":"")});
  box.innerHTML=`<span class="eyebrow">${P.cards[id]?"Mini-Check · schon gelöst ✓":"Mini-Check"}</span><p class="q">${T(c.q)}</p>`;
  const opts=el("div",{class:"opts"}), fb=el("div",{}); let fertig=false;
  shuffle(c.o.map((t,j)=>({t,ok:j===0}))).forEach(o=>{ const b=el("button",{},T(o.t));
    b.addEventListener("click",()=>{ if(fertig||b.classList.contains("wrong")) return;
      if(o.ok){ fertig=true; b.classList.add("right"); box.classList.add("solved"); fb.innerHTML=`<div class="feedback ok"><b>${one(LOBW)}</b>${T(c.e)}</div>`; P.cards[id]=true; save(); MM.Fx.snd.card(); MM.Fx.ring(box); onChange(); }
      else { MM.Fx.snd.bad(); b.classList.add("wrong"); fb.innerHTML=`<div class="feedback bad"><b>Nicht ganz. Versuch es nochmal.</b>${T(c.h)}</div>`; } });
    opts.appendChild(b); });
  box.append(opts,fb); return box; }

/* ---------- Challenge: Level-Auswahl ---------- */
function renderIntro(k,typ){
  view(true);
  const D=k.def, def=D.challenges[typ], id=chId(k,typ), idx=D.challOrder.indexOf(typ);
  const hd=bar("← Lernpfad",renderHome,`Kapitel ${k.nr} · Challenge ${idx+1} von ${D.challOrder.length}`,def.titel,themeSwitch());
  buchTools(hd,def.buch||k.buch);
  const wrap=el("div",{class:"intro"});
  wrap.appendChild(el("div",{class:"about"},`<span class="eyebrow">${def.art}</span><h3>So geht's</h3><p>${T(def.intro)}</p>
    <div class="rule"><b>Level-Hürde</b>${PRO_LEVEL} Aufgaben pro Level. Mit ${HUERDE} Treffern im ersten Versuch steigst du auf. ${idx<D.challOrder.length-1?"Level 1 schaltet die nächste Challenge frei.":""}</div>`));
  const lvls=el("div",{class:"levels"}); const nextLv=[0,1,2].find(n=>lvOpen(id,n)&&!lvPassed(id,n));
  def.levels.forEach((lv,n)=>{ const open=lvOpen(id,n), passed=lvPassed(id,n), best=P.best[id+":"+n];
    const b=el("button",{class:"level"+(passed?" passed":"")+(!open?" locked":"")+(n===nextLv?" next":"")});
    b.innerHTML=`<span class="lnum">${passed?"✓":n+1}</span><span><span class="eyebrow">Level ${n+1}${best!==undefined?` · Bestwert ${best} / ${PRO_LEVEL}`:""}</span><h3>${lv.name}</h3><p>${T(lv.info)}</p></span><span class="go">${!open?LOCK:(passed?"Nochmal →":"Start →")}</span>`;
    if(open) b.addEventListener("click",()=>playLevel(k,typ,n));
    lvls.appendChild(b); });
  wrap.appendChild(lvls); app.appendChild(wrap);
}

/* ---------- Level spielen ---------- */
function playLevel(k,typ,n){
  view(true);
  const D=k.def, def=D.challenges[typ], lv=def.levels[n], id=chId(k,typ);
  let tasks; try{ tasks=lv.make(); }catch(e){ console.error(e); app.appendChild(el("p",{class:"prompt"},"Fehler beim Erzeugen der Aufgaben. Bitte die Seite neu laden.")); return; }
  const N=tasks.length; const res=[]; let i=0, popIdx=-1;
  const track=el("div",{class:"track","aria-label":"Fortschritt im Level"});
  const hd=bar("← Level",()=>renderIntro(k,typ),def.titel,`Level ${n+1} · ${lv.name}`,track);
  buchTools(hd,lv.buch||def.buch||k.buch);
  const split=el("div",{class:"split"}); const viz=el("section",{class:"viz"}); const panel=el("section",{class:"panel"}); split.append(viz,panel); app.appendChild(split);
  function drawTrack(){ const fehler=res.filter(x=>x===false).length, erlaubt=N-HUERDE;
    track.innerHTML=[...Array(N)].map((_,q)=>`<i class="${res[q]===true?"ok":res[q]===false?"bad":""}${q===i&&res[q]===undefined?" cur":""}${q===popIdx?" pop":""}"></i>`).join("");
    const txt=fehler<erlaubt?`Ziel ${HUERDE} / ${N} · noch ${erlaubt-fehler} Fehler frei`:fehler===erlaubt?`Ziel ${HUERDE} / ${N} · kein Fehler mehr frei`:"Hürde verpasst · spiel zu Ende";
    track.appendChild(el("span",{class:fehler>=erlaubt?"warn":""},txt)); }
  function run(){
    cleanup(); viz.innerHTML=""; panel.innerHTML=""; panel.scrollTop=0; drawTrack();
    const eb=el("div",{class:"ptop"},`<span class="eyebrow">Aufgabe ${i+1} von ${N}</span>`);
    const pr=el("p",{class:"prompt"}), hints=el("div",{class:"pbody"}), body=el("div",{class:"pbody"}), fb=el("div",{}), acts=el("div",{class:"actions"});
    panel.append(eb,pr,hints,body,fb,acts);
    const api={viz,panel,body,actions:acts,
      prompt:t=>{ pr.innerHTML=t; }, hint:t=>{ hints.appendChild(el("p",{class:"hint"},t)); },
      badge:t=>{ eb.appendChild(el("span",{class:"pred"},t)); },
      cv:(cls="")=>mkcv(viz,cls),
      legend:html=>{ const l=el("div",{class:"legend"},html); viz.appendChild(l); return l; },
      situation:(t,l)=>{ viz.appendChild(el("div",{class:"situ"},`<span class="eyebrow">${l||"Situation"}</span><p>${t}</p>`)); },
      feedback:(ok,html,title)=>{ if(ok) MM.Fx.snd.ok(); else MM.Fx.snd.bad(); fb.innerHTML=`<div class="feedback ${ok?"ok":"bad"}"><b>${title||(ok?one(LOBW):"Nicht ganz.")}</b>${html}</div>`; },
      finish:ok=>{ if(res[i]!==undefined) return; res[i]=!!ok; popIdx=i; drawTrack(); popIdx=-1; acts.innerHTML="";
        const w=el("button",{class:"btn"},i+1<N?"Weiter →":"Auswertung →"); w.addEventListener("click",()=>{ i++; i<N?run():ende(); }); acts.appendChild(w);
        requestAnimationFrame(()=>{ try{ panel.scrollTo({top:panel.scrollHeight,behavior:"smooth"}); }catch(e){} }); }};
    try{ tasks[i].run(api); }catch(e){ console.error(e); panel.appendChild(el("p",{class:"hint"},"Diese Aufgabe konnte nicht geladen werden.")); api.finish(true); }
  }
  function ende(){
    cleanup(); split.remove();
    const hits=res.filter(Boolean).length, pass=hits>=HUERDE, war=lvPassed(id,n);
    const idx=D.challOrder.indexOf(typ), nextTyp=D.challOrder[idx+1];
    if(pass){ P.lv[id]=P.lv[id]||[false,false,false]; P.lv[id][n]=true; }
    P.best[id+":"+n]=Math.max(P.best[id+":"+n]||0,hits); save(); drawTrack(); const sp=track.querySelector("span"); if(sp){ sp.textContent=pass?"Level geschafft":"Hürde verpasst"; sp.className=pass?"":"warn"; }
    const card=el("div",{class:"endcard"});
    card.innerHTML=`<span class="eyebrow">Level ${n+1} · ${lv.name}</span><span class="big" data-of="${N}">${hits} / ${N}</span><span class="muted">Treffer im ersten Versuch</span>`;
    card.appendChild(el("h3",{},pass?(hits===N?"Perfekt. Level geschafft!":"Level geschafft!"):(hits===HUERDE-1?"Knapp daneben.":"Noch nicht geschafft.")));
    card.appendChild(el("p",{class:"msg"},pass?(hits===N?"Alles im ersten Versuch. Das sitzt.":"Schau dir die Fehler im Steckbrief noch einmal an."):`Für den Aufstieg brauchst du ${HUERDE} von ${N}. Die nächste Runde hat neue Aufgaben.`));
    if(pass&&!war){ if(n<2) card.appendChild(el("span",{class:"unlock"},`Level ${n+2} ist frei.`));
      if(n===0&&nextTyp) card.appendChild(el("span",{class:"unlock"},`Neue Challenge frei: ${D.challenges[nextTyp].titel}`)); }
    const acts=el("div",{class:"actions",style:"justify-content:center;margin-top:8px"});
    const btn=(t,fn,ghost)=>{ const b=el("button",{class:"btn"+(ghost?" ghost":"")},t); b.addEventListener("click",fn); acts.appendChild(b); return b; };
    if(pass){ if(n<2) btn(`Level ${n+2} starten →`,()=>playLevel(k,typ,n+1)); else if(nextTyp) btn(`Weiter: ${D.challenges[nextTyp].titel} →`,()=>renderIntro(k,nextTyp));
      if(n===0&&nextTyp) btn(`${D.challenges[nextTyp].titel} →`,()=>renderIntro(k,nextTyp),true); }
    else { btn("Neue Runde",()=>playLevel(k,typ,n)); btn("Steckbriefe ansehen",()=>renderFocus(k,0),true); }
    if((MM.MATHEGYM[k.id]||[]).length) btn("Üben im Mathegym",()=>mathegymModal(k.id),true);
    btn("Zum Lernpfad",renderHome,true);
    card.appendChild(acts); if(MM.Nachweis&&pass){ const h=MM.Nachweis.endHint(); if(h) card.appendChild(h); } app.appendChild(card);
    card.classList.add(pass?"win":"lose"); MM.Fx.countUp(card.querySelector(".big"),hits);
    if(pass){ MM.Fx.snd.level(hits===N); MM.Fx.confetti(card,hits===N?44:24); } else MM.Fx.snd.miss();
  }
  run();
}

/* ---------- Start ---------- */
MM.start=function(){ try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist(); }catch(e){}
  app.innerHTML='<p class="muted" style="padding:40px;text-align:center">Lade …</p>'; loadChapters(()=>{ renderHome(); }); };
MM.UI={el,view,bar,themeSwitch,openModal,renderHome,renderIntro,renderFocus,save,isOk,okIds,getK,chId,cid,chOpen,lvPassed,cardsDone,
  get P(){return P;}, get teacher(){return teacher;}, get status(){return status;}, ready:loadChapters, setTeacher};
MM._state={get P(){return P;},get teacher(){return teacher;},status,setTeacher,renderHome,renderFocus,renderIntro,playLevel,pinDialog};
})();
