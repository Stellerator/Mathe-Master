/* Mathe-Master · Meine Erfolge (Siegel), Aktivierung, Stand senden und wiederherstellen (Schüleransicht) */
(function(){
"use strict";
const MM = window.MM, Pr = MM.Proof, UI = () => MM.UI;
const el = (t,a,h)=>MM.el(t,a,h);
const IDKEY = "mathe-master-id";
/* Siegel: gezackte Rosette, optional mit Haken. n Zacken, Außen- und Innenradius */
function burst(n,ro,ri,c){ let d=""; for(let i=0;i<n*2;i++){ const r=i%2?ri:ro, a=Math.PI*i/n-Math.PI/2; d+=(i?"L":"M")+(c+r*Math.cos(a)).toFixed(2)+" "+(c+r*Math.sin(a)).toFixed(2); } return d+"Z"; }
const BURST=burst(14,47,41,50);
const SEAL_ICON=`<svg width="22" height="22" viewBox="0 0 100 100" aria-hidden="true"><path d="${BURST}" fill="currentColor"/><path d="M30 51l14 14 27-30" fill="none" stroke="var(--surface)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function seal(on){ if(!on) return ""; return `<svg class="seal${on?" on":" off"}" viewBox="0 0 100 100" aria-hidden="true"><path class="sb" d="${BURST}"/>${on?'<circle class="si" cx="50" cy="50" r="31"/><path class="sc" d="M33 51l12 12 23-26"/>':''}</svg>`; }
const cfg = () => Object.assign({url:"",hinweis:"",tage:7}, MM.ABGABE||{});

/* ---------- Identität (Aktivierungscode) ---------- */
let ident=null; try{ const s=JSON.parse(localStorage.getItem(IDKEY)||"null"); if(s&&Pr.idOk(s.id)&&typeof s.key==="string") ident=s; }catch(e){}
const saveIdent=()=>{ try{ if(ident) localStorage.setItem(IDKEY,JSON.stringify(ident)); else localStorage.removeItem(IDKEY); }catch(e){} };
const curSnap=()=>Pr.snapshot(UI().P);
const dirty=()=>!!ident&&(Pr.sig(curSnap())!==ident.sig||Pr.xsig(curX())!==(ident.xs||""));
const curX=()=>Pr.buildX(UI().P,MM.Wiederholung&&MM.Wiederholung.streak?MM.Wiederholung.streak():0);
const nothingYet=()=>{ const s=curSnap(); return !s.c.length&&!Object.keys(s.l).length&&!curX(); };
function ago(ts){ if(!ts) return "noch nie"; const d=Math.floor((Date.now()-ts)/864e5); return d<=0?"heute":d===1?"gestern":`vor ${d} Tagen`; }
const dayLimit=()=>Math.max(1,+cfg().tage||7);

/* ---------- kleine Helfer ---------- */
function note(host,txt,cls){ host.textContent=txt; host.className="nmsg"+(cls?" "+cls:""); }
function copyText(t){ return (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{
  const ta=document.createElement("textarea"); ta.value=t; ta.style.cssText="position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); }catch(e){} ta.remove(); }); }
function download(file){ const a=document.createElement("a"); a.href=URL.createObjectURL(file); a.download=file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
function counts(){ // zählt gemeisterte Ziele (Steckbriefe komplett, Challenge mit allen 3 Levels) und bestandene Levels über alle freigeschalteten Kapitel
  const u=UI(); let gem=0,gemMax=0,med=0,medMax=0;
  u.okIds().forEach(id=>{ const k=u.getK(id); if(!k) return; const D=k.def;
    gemMax+=1+D.challOrder.length; if(u.cardsDone(k)) gem++;
    D.challOrder.forEach(typ=>{ const n=[0,1,2].filter(i=>u.lvPassed(u.chId(k,typ),i)).length; med+=n; medMax+=3; if(n===3) gem++; }); });
  return {gem,gemMax,med,medMax}; }

/* ---------- Startseite: Knöpfe ---------- */
function homeButtons(teacher){
  const out=[];
  const b=el("button",{class:"tab trophy","aria-label":"Meine Erfolge",title:"Meine Erfolge"},SEAL_ICON);
  if(ident&&dirty()){ b.appendChild(el("i",{class:"ndot",title:"Neuer Stand seit der letzten Sicherung"})); }
  b.addEventListener("click",renderRegal); out.push(b);
  return out; }
function endHint(){
  if(!ident||!dirty()) return null;
  const d=el("div",{class:"sendhint"}); const b=el("button",{class:"linkbtn"},"Stand sichern und senden →"); b.addEventListener("click",sendModal); d.appendChild(b); return d; }

/* ---------- Meine Erfolge ---------- */
function medal(n,on,perfect){ return `<span class="medal m${n}${on?" on":""}" title="Level ${n}${on?(perfect?" · alles richtig":" · geschafft"):""}">${n}${perfect?'<b aria-hidden="true">★</b>':""}</span>`; }
function renderRegal(){
  const u=UI(); u.view(false);
  u.bar("← Lernpfad",u.renderHome,"Mathe-Master","Meine Erfolge",u.themeSwitch());
  const main=el("main",{class:"regal"});
  document.getElementById("app").appendChild(main);

  /* Ausweis und Sicherung */
  const id=el("section",{class:"idcard"}); main.appendChild(id);
  const c=counts();
  if(!ident){
    id.innerHTML=`<span class="eyebrow">Nachweis</span><h3>Nachweis aktivieren</h3><p class="muted">Gib den Aktivierungscode ein, den du von deiner Lehrkraft bekommen hast. Danach kannst du deinen Stand senden und bei Verlust wiederherstellen.</p>`;
    const row=el("div",{class:"nrow"}); const inp=el("input",{type:"text",placeholder:"A17-K9F2Q-3QX7M-7X",autocapitalize:"characters",autocomplete:"off",autocorrect:"off",spellcheck:"false","aria-label":"Aktivierungscode"});
    const go=el("button",{class:"btn"},"Aktivieren"); const msg=el("p",{class:"nmsg"}); row.append(inp,go); id.append(row,msg);
    const doIt=()=>{ const r=Pr.parseCode(inp.value); if(r.err){ note(msg,r.err,"bad"); return; }
      ident={id:r.id,key:r.key,code:r.code,sig:"",sent:0}; saveIdent(); MM.Fx.snd.card(); renderRegal(); };
    go.addEventListener("click",doIt); inp.addEventListener("keydown",e=>{ if(e.key==="Enter") doIt(); });
  } else {
    const old=ident.sent&&(Date.now()-ident.sent)>dayLimit()*864e5, stale=!ident.sent&&!nothingYet(), dty=dirty();
    id.innerHTML=`<div class="ihead"><div><span class="eyebrow">Angemeldet als</span><h3 class="idname">${ident.id}</h3></div>
      <div class="isave${(old||stale||dty)?" warn":" ok"}"><span class="eyebrow">Letzte Sicherung</span><b>${ago(ident.sent)}</b><span>${nothingYet()?"Noch nichts zu sichern.":dty?"Seitdem gibt es neuen Stand.":ident.sent?"Alles gesichert.":""}</span></div></div>`;
    const row=el("div",{class:"nrow"});
    const s=el("button",{class:"btn"},"Stand senden"); s.addEventListener("click",sendModal);
    const r=el("button",{class:"btn ghost"},"Stand wiederherstellen"); r.addEventListener("click",restoreModal);
    row.append(s,r);
    if(u.teacher){ const x=el("button",{class:"linkbtn"},"Aktivierung entfernen (Lehrkraft)"); let t;
      x.addEventListener("click",()=>{ if(x.classList.contains("arm")){ ident=null; saveIdent(); renderRegal(); return; } x.classList.add("arm"); x.textContent="Wirklich? Nochmal tippen"; clearTimeout(t); t=setTimeout(()=>{ x.classList.remove("arm"); x.textContent="Aktivierung entfernen (Lehrkraft)"; },3000); });
      row.appendChild(x); }
    id.appendChild(row); }

  /* Regalbretter */
  const sum=el("div",{class:"rsum"},`<b>${c.gem}</b> von ${c.gemMax} gemeistert · <b>${c.med}</b> von ${c.medMax} Levels geschafft`); main.appendChild(sum);
  u.okIds().forEach(kid=>{ const k=u.getK(kid); if(!k) return; const D=k.def;
    const shelf=el("section",{class:"shelf"}); shelf.appendChild(el("h3",{},`<span class="nr">${k.nr}</span>${k.titel}`));
    const row=el("div",{class:"board"}); shelf.appendChild(row);
    const nC=D.steckOrder.length, dC=D.steckOrder.filter(key=>u.P.cards[u.cid(k,key)]).length, full=dC===nC;
    const sc=el("button",{class:"trophy-card cardsc"+(full?" full":"")}); sc.innerHTML=`${seal(full)}<span class="eyebrow">Start</span><b>Steckbriefe</b><span class="stamp">${dC} / ${nC}</span><span class="tst">${full?"Gemeistert":"Mini-Checks"}</span>`;
    sc.addEventListener("click",()=>u.renderFocus(k)); row.appendChild(sc);
    D.challOrder.forEach((typ,i)=>{ const def=D.challenges[typ], cid=u.chId(k,typ), ps=[0,1,2].map(n=>u.lvPassed(cid,n)), full=ps.every(Boolean), open=u.chOpen(k,i);
      const b=el("button",{class:"trophy-card"+(full?" full":"")+(open?"":" locked"),"aria-disabled":String(!open)});
      b.innerHTML=`${seal(full)}<span class="eyebrow">Challenge ${i+1}</span><b>${def.titel}</b><span class="medals">${ps.map((p,n)=>medal(n+1,p,p&&u.P.best[cid+":"+n]>=MM.PRO_LEVEL)).join("")}</span><span class="tst">${full?"Gemeistert":open?ps.filter(Boolean).length+" / 3 Levels":"gesperrt"}</span>`;
      if(open) b.addEventListener("click",()=>u.renderIntro(k,typ)); row.appendChild(b); });
    const fc=MM.Forder&&MM.Forder.regalCard(kid,seal); if(fc) row.appendChild(fc);
    main.appendChild(shelf); });
  main.appendChild(el("p",{class:"muted rfoot"},"Das Siegel bekommst du, wenn du alle 3 Levels einer Challenge gemeistert hast. Der Stern an einem Level heißt: alle Aufgaben im ersten Versuch richtig."));
}

/* ---------- Stand senden ---------- */
function sendModal(){
  const u=UI(); if(!ident){ renderRegal(); return; }
  const box=el("div",{style:"display:flex;flex-direction:column;gap:12px"}); const f=Pr.makeFile(u.P,ident,undefined,curX()), name=Pr.fileName(f), cf=cfg(), c=counts();
  box.appendChild(el("h3",{},"Stand senden"));
  box.appendChild(el("p",{class:"muted"},`Dein Stand (${f.c.length} Mini-Checks, ${c.med} Levels, ${c.gem} gemeistert) wird als kleine Datei <b>${name}</b> gesichert.`));
  if(cf.hinweis) box.appendChild(el("p",{class:"nhint"},cf.hinweis));
  const msg=el("p",{class:"nmsg"});
  const file=new File([JSON.stringify(f)],name,{type:"application/json"});
  const done=txt=>{ ident.sig=Pr.sig({c:f.c,l:f.l,b:f.b}); ident.xs=Pr.xsig(f.x||null); ident.sent=Date.now(); saveIdent(); note(msg,txt,"ok"); MM.Fx.snd.card(); };
  const canShare=!!(navigator.canShare&&navigator.share&&(()=>{ try{ return navigator.canShare({files:[file]}); }catch(e){ return false; } })());
  const send=el("button",{class:"btn big"},canShare?"Senden …":"Datei speichern");
  send.addEventListener("click",()=>{
    if(canShare){ navigator.share({files:[file]}).then(()=>done("Gesendet. Danke!")).catch(e=>{ if(e&&e.name==="AbortError") note(msg,"Abgebrochen. Es wurde nichts gesendet."); else note(msg,"Das Teilen hat nicht geklappt. Nimm „Datei speichern“ oder den Stand-Code.","bad"); }); }
    else { download(file); if(cf.url) window.open(cf.url,"_blank","noopener"); done("Datei gespeichert."+(cf.url?" Lege sie jetzt im Abgabe-Ordner ab.":"")); } });
  const acts=el("div",{class:"nrow"}); acts.appendChild(send);
  if(canShare){ const d=el("button",{class:"btn ghost"},"Datei speichern"); d.addEventListener("click",()=>{ download(file); done("Datei gespeichert."); }); acts.appendChild(d); }
  if(cf.url){ const a=el("a",{class:"btn ghost",href:cf.url,target:"_blank",rel:"noopener"},"Abgabe-Ordner öffnen ↗"); acts.appendChild(a); }
  const cp=el("button",{class:"btn ghost"},"Stand-Code kopieren"); cp.addEventListener("click",()=>{ copyText(Pr.toCode(f)).then(()=>done("Stand-Code kopiert. Füge ihn dort ein, wo du abgibst.")); }); acts.appendChild(cp);
  box.append(acts,msg);
  const row=el("div",{class:"mrow"}); const cl=el("button",{class:"btn ghost"},"Schließen"); row.appendChild(cl); box.appendChild(row);
  const close=u.openModal(box); cl.addEventListener("click",()=>{ close(); if(document.querySelector(".regal")) renderRegal(); else u.renderHome(); });
}

/* ---------- Stand wiederherstellen ---------- */
function restoreModal(){
  const u=UI(); if(!ident) return;
  const box=el("div",{style:"display:flex;flex-direction:column;gap:12px"});
  box.appendChild(el("h3",{},"Stand wiederherstellen"));
  box.appendChild(el("p",{class:"muted"},"Wähle die zuletzt gesendete Datei aus oder füge den Stand-Code ein. Es wird nur dazugeholt, nichts geht verloren."));
  const msg=el("p",{class:"nmsg"}); const ta=el("textarea",{rows:"3",placeholder:"Stand-Code einfügen (beginnt mit MM1.)","aria-label":"Stand-Code"});
  const fi=el("input",{type:"file",accept:".json,.txt,application/json,text/plain",style:"display:none"});
  const pick=el("button",{class:"btn ghost"},"Datei auswählen …"); pick.addEventListener("click",()=>fi.click());
  const go=el("button",{class:"btn"},"Wiederherstellen");
  const apply=text=>{ try{ const o=Pr.parseAny(text);
      if(o.id!==ident.id) throw new Error("Dieser Stand gehört zu „"+(o.id||"?")+"“, du bist als „"+ident.id+"“ angemeldet.");
      if(!Pr.checkFile(o,ident.key)) throw new Error("Die Prüfsumme passt nicht. Die Datei wurde verändert oder ist beschädigt.");
      const snap=Pr.clean(o), before=counts(); Pr.mergeInto(u.P,snap); const hasX=o.x!==undefined, cx=hasX&&Pr.checkX(o,ident.key)===true?Pr.cleanX(o.x):null, rx=cx?Pr.restoreX(u.P,cx):null; u.save(); const after=counts();
      note(msg,`Wiederhergestellt: Stand vom ${o.t.slice(8,10)}.${o.t.slice(5,7)}. ${o.t.slice(11,16)} Uhr. Levels: ${before.med} → ${after.med}.`+(rx?" Auch Übung, Hausaufgaben und Plus-Aufgaben sind wieder da.":"")+(hasX&&!cx?" Die Zusatzdaten (Übung, Hausaufgaben) waren verändert und wurden nicht übernommen.":""),"ok"); MM.Fx.snd.level(false);
    }catch(e){ note(msg,e&&e.message&&!/JSON|Unexpected|atob|string/i.test(e.message)?e.message:"Das habe ich nicht verstanden. Bitte die Datei oder den Code genau so verwenden, wie er gesendet wurde.","bad"); } };
  fi.addEventListener("change",()=>{ const f=fi.files&&fi.files[0]; if(!f) return; f.text().then(apply); });
  go.addEventListener("click",()=>{ if(!ta.value.trim()){ note(msg,"Füge zuerst den Stand-Code ein oder wähle eine Datei.","bad"); return; } apply(ta.value); });
  const row1=el("div",{class:"nrow"}); row1.append(pick,fi);
  const row2=el("div",{class:"nrow"}); row2.append(go);
  const rowc=el("div",{class:"mrow"}); const cl=el("button",{class:"btn ghost"},"Schließen"); rowc.appendChild(cl);
  box.append(row1,ta,row2,msg,rowc);
  const close=u.openModal(box); cl.addEventListener("click",()=>{ close(); renderRegal(); });
}

MM.Nachweis={homeButtons,endHint,renderRegal,sendModal,restoreModal,get ident(){return ident;},dirty};
})();
