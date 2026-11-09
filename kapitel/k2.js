/* Kapitel 2 · Mathe-Sprache (Zahlbereiche, Mengen, Intervalle, Aussagen) */
(function(){
"use strict";
const MM=window.MM, S=String.raw;
const {el,shuffle,one,pick,ri,T,tex,tn,ts,Sets,INF,Terms,PRO_LEVEL}=MM;
const iv=(lo,hi,cl,ch)=>({lo,hi,cl:!!cl,ch:!!ch});

/* ---------- Beschreibungen in Worten ---------- */
function words(Sx){
  Sx=Sets.norm(Sx);
  if(Sx.length>=2) return "alle Zahlen außer "+Sx.slice(0,-1).map(i=>ts(i.hi)).join(" und ");
  const i=Sx[0];
  if(i.lo===0&&i.hi===INF&&!i.cl) return "alle positiven Zahlen";
  if(i.lo===-INF) return "alle Zahlen, die "+(i.ch?"kleiner oder gleich ":"kleiner als ")+ts(i.hi)+" sind";
  if(i.hi===INF) return "alle Zahlen, die "+(i.cl?"größer oder gleich ":"größer als ")+ts(i.lo)+" sind";
  return "alle Zahlen zwischen "+ts(i.lo)+" und "+ts(i.hi)+"; "+ts(i.lo)+(i.cl?" gehört dazu":" gehört nicht dazu")+", "+ts(i.hi)+(i.ch?" gehört dazu":" gehört nicht dazu"); }

/* ======================= Bilder für die Steckbriefe ======================= */
const ONION=[
  {lab:S`$\R$ · reelle Zahlen`,ex:"√2; π; alle Zahlen auf der Zahlengerade"},
  {lab:S`$\Q$ · rationale Zahlen (Brüche)`,ex:"0,5; −1,25; ⅓"},
  {lab:S`$\Z$ · ganze Zahlen`,ex:"…; −2; −1; 0; 1; 2; …"},
  {lab:S`$\N$ · Zählzahlen`,ex:"1; 2; 3; …"}];
const ZAHLEN=[
  {t:"5",lvl:3,m:S`$5$ ist eine Zählzahl: $5\in\N$. Sie liegt damit auch in $\Z$, $\Q$ und $\R$.`},
  {t:"−3",lvl:2,m:S`$-3$ ist negativ, also nicht in $\N$ ($-3\notin\N$). Sie ist ganz: $-3\in\Z$. Damit liegt sie auch in $\Q$ und $\R$.`},
  {t:"0,5",lvl:1,m:S`$0{,}5=\frac12$ ist ein Bruch, aber keine ganze Zahl: $0{,}5\in\Q$, $0{,}5\notin\Z$. Sie liegt auch in $\R$.`},
  {t:"−1,25",lvl:1,m:S`$-1{,}25=-\frac54$ ist ein Bruch: $-1{,}25\in\Q$, aber $-1{,}25\notin\Z$.`},
  {t:"√2",lvl:0,m:S`$\sqrt2$ lässt sich nicht als Bruch schreiben: $\sqrt2\notin\Q$. Sie liegt nur in $\R$.`},
  {t:"π",lvl:0,m:S`$\pi$ lässt sich nicht als Bruch schreiben: $\pi\notin\Q$. Sie liegt nur in $\R$.`}];
function vizZahlen(side){
  const wrap=el("div",{style:"flex:1;display:flex;flex-direction:column;justify-content:center;gap:10px"}); const chips=el("div",{class:"seg"}); const msg=el("div",{class:"feedback info"});
  let html=""; const build=k=>k>=ONION.length?"":`<div class="onion" data-k="${k}"><span class="lbl">${T(ONION[k].lab)}</span><div class="ex">${ONION[k].ex}</div>${build(k+1)}</div>`;
  wrap.innerHTML=build(0); side.append(wrap,chips,msg);
  msg.innerHTML="Tippe eine Zahl an. Sie landet im kleinsten Bereich, in den sie passt.";
  ZAHLEN.forEach(z=>{ const b=el("button",{"aria-pressed":"false"},z.t); b.addEventListener("click",()=>{ [...chips.children].forEach(c=>c.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true");
      wrap.querySelectorAll(".onion").forEach(o=>o.classList.toggle("hit",+o.dataset.k===z.lvl)); msg.innerHTML=T(z.m); MM.Fx&&MM.Fx.snd.pop(); }); chips.appendChild(b); }); }

// Zahlengerade mit Menge
function numView(side,state){ const host=MM.mkcv(side,"small"); const cvw=MM.canvasView(host,(st,col)=>MM.numline(st,col,{lo:-5,hi:6,set:state.S,nums:[]})); return cvw; }
const ASS=[
  {ung:S`x>-1`,S:Sets.ray("gt",-1)},{ung:S`x\ge 2`,S:Sets.ray("ge",2)},{ung:S`x<3`,S:Sets.ray("lt",3)},{ung:S`x\le -2`,S:Sets.ray("le",-2)},
  {ung:S`-2\le x<4`,S:Sets.between(-2,4,true,false)}];

function vizMengen(side){
  const state={S:ASS[0].S}; const seg=el("div",{class:"seg"}); const cvw=numView(side,state); const msg=el("div",{class:"feedback info",style:"font-size:17px"});
  side.append(seg,msg);
  const upd=()=>{ cvw.redraw(); const sp=Terms.speak(state.S,"x"); msg.innerHTML=`<b>Mengenschreibweise</b>${tex("L="+Sets.tex(state.S,"menge","x"))}<br><b>So sprichst du es</b>${T(sp.charAt(0).toUpperCase()+sp.slice(1))}.`; };
  ASS.forEach((a,i)=>{ const b=el("button",{"aria-pressed":String(i===0)},T("$"+a.ung+"$")); b.addEventListener("click",()=>{ [...seg.children].forEach(c=>c.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); state.S=a.S; upd(); }); seg.appendChild(b); });
  upd(); }

function vizIntervall(side){
  const st={lo:-1,hi:3,cl:true,ch:false,mode:"b"}; const state={S:null};
  const cvw=numView(side,state); const seg=el("div",{class:"seg"}), l=el("div",{class:"seg"}), r=el("div",{class:"seg"}); const msg=el("div",{class:"feedback info",style:"font-size:17px"});
  side.append(seg,l,r,msg);
  const build=()=>{ if(st.mode==="b") return Sets.between(st.lo,st.hi,st.cl,st.ch); if(st.mode==="r") return Sets.ray(st.cl?"ge":"gt",st.lo); return Sets.ray(st.ch?"le":"lt",st.hi); };
  const upd=()=>{ state.S=build(); cvw.redraw(); const e=Sets.tex(state.S,"intervall");
    const rule=[]; if(st.mode!=="l") rule.push(`${ts(st.lo)} ${st.cl?"gehört dazu: eckige Klammer nach innen":"gehört nicht dazu: eckige Klammer nach außen"}`); if(st.mode!=="r") rule.push(`${ts(st.hi)} ${st.ch?"gehört dazu: eckige Klammer nach innen":"gehört nicht dazu: eckige Klammer nach außen"}`); if(st.mode!=="b") rule.push("∞ ist keine Zahl: dort immer nach außen offen");
    msg.innerHTML=`<b>Intervallschreibweise</b>${tex("I="+e)}<br>${T(rule.join(". "))}.`;
    l.innerHTML=""; r.innerHTML="";
    if(st.mode!=="l"){ const b=el("button",{"aria-pressed":String(st.cl)},T(`$${tn(st.lo)}$ gehört ${st.cl?"dazu":"nicht dazu"}`)); b.addEventListener("click",()=>{ st.cl=!st.cl; upd(); }); l.appendChild(b); }
    if(st.mode!=="r"){ const b=el("button",{"aria-pressed":String(st.ch)},T(`$${tn(st.hi)}$ gehört ${st.ch?"dazu":"nicht dazu"}`)); b.addEventListener("click",()=>{ st.ch=!st.ch; upd(); }); r.appendChild(b); } };
  [["b","von … bis …"],["r",S`nach rechts offen`],["l","nach links offen"]].forEach(([m,n],i)=>{ const b=el("button",{"aria-pressed":String(i===0)},n); b.addEventListener("click",()=>{ st.mode=m; [...seg.children].forEach(c=>c.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); upd(); }); seg.appendChild(b); });
  upd(); }

function vizAussage(side){
  const state={S:ASS[0].S}; const seg=el("div",{class:"seg"}); const cvw=numView(side,state); const msg=el("div",{class:"feedback info",style:"font-size:17px"}); side.append(seg,msg);
  let cur=ASS[0];
  const upd=()=>{ cvw.redraw(); msg.innerHTML=`<b>Aussage</b>: ${tex(cur.ung)}<br><b>Lösungsmenge in Mengenschreibweise</b>${tex("L="+Sets.tex(cur.S,"menge","x"))}<br><b>Lösungsmenge als Intervall</b>${tex("L="+Sets.tex(cur.S,"intervall","x"))}`; };
  ASS.forEach((a,i)=>{ const b=el("button",{"aria-pressed":String(i===0)},T("$"+a.ung+"$")); b.addEventListener("click",()=>{ [...seg.children].forEach(c=>c.setAttribute("aria-pressed","false")); b.setAttribute("aria-pressed","true"); cur=a; state.S=a.S; upd(); }); seg.appendChild(b); });
  upd(); }

/* ======================= Steckbriefe ======================= */
const steckbriefe={
  zahlen:{titel:"Zahlbereiche", buch:"S. 22 Zahlengerade und Zahlen",
    text:S`Zahlen sind in Bereichen geordnet, die ineinander stecken. Die Zählzahlen $\N$ liegen in den ganzen Zahlen $\Z$, diese in den Brüchen $\Q$, und alle zusammen auf der Zahlengerade $\R$. Mit $\in$ sagst du „ist Element von“, mit $\notin$ „ist kein Element von“.`,
    formel:S`\N\subset\Z\subset\Q\subset\R`,
    merke:S`Gesucht ist meist der kleinste Bereich. $-3\in\Z$, aber $-3\notin\N$. $\sqrt2$ und $\pi$ sind nur in $\R$.`,
    viz:vizZahlen,
    check:{q:S`Zu welchem kleinsten Zahlbereich gehört $-3$?`,
      o:[S`$\Z$`,S`$\N$`,S`$\Q$`],
      h:"Ist die Zahl negativ? Ist sie ein Bruch?",
      e:S`$-3$ ist eine ganze Zahl, aber negativ. Zu $\N$ gehört sie nicht. $\Q$ ist zwar richtig, aber nicht der kleinste Bereich.`}},
  mengen:{titel:"Mengen und Mengenschreibweise", buch:"S. 10 A10 · S. 22",
    text:S`Eine Menge fasst Zahlen zusammen, die eine Bedingung erfüllen. In der Mengenschreibweise steht vorne die Variable und der Zahlbereich, hinter dem Strich die Bedingung. $\{x\in\R\mid x<2\}$ liest du: „Die Menge aller $x$ aus den reellen Zahlen, für die gilt: $x$ ist kleiner als 2.“ Der Strich „|“ bedeutet „für die gilt“.`,
    formel:S`\{x\in\R\mid x<2\}`,
    merke:S`Mit $\R\setminus\{0\}$ schließt du Zahlen aus. Mit $\R^{+}$ meinst du alle positiven reellen Zahlen.`,
    viz:vizMengen,
    check:{q:S`Wie liest du $\{x\in\R\mid x<2\}$?`,
      o:["Die Menge aller x aus den reellen Zahlen, für die gilt: x ist kleiner als 2.","Die Menge aller x aus den reellen Zahlen, für die gilt: x ist größer als 2.","Die Menge, die nur die Zahl 2 enthält."],
      h:"Lies den Strich als „für die gilt“ und dann die Bedingung.",
      e:"Hinter dem Strich steht x < 2. Das sind alle Zahlen links von 2. Die 2 selbst gehört nicht dazu."}},
  intervall:{titel:"Intervalle", buch:"S. 22 bis 23",
    text:S`Ein Intervall ist eine Kurzschreibweise für ein Stück der Zahlengerade. Du schreibst Anfang und Ende mit Strichpunkt: $[-1;3[$. Eine eckige Klammer nach innen heißt: Die Randzahl gehört dazu. Eine eckige Klammer nach außen heißt: Sie gehört nicht dazu. Bei $\infty$ steht die Klammer immer nach außen.`,
    formel:S`[-1;3[`,
    merke:S`Eckige Klammer zur Zahl hin: dabei. Eckige Klammer von der Zahl weg: nicht dabei.`,
    viz:vizIntervall,
    check:{q:S`Was bedeutet $]-1;3]$?`,
      o:["−1 gehört nicht dazu, 3 gehört dazu.","−1 gehört dazu, 3 gehört nicht dazu.","Beide Randzahlen gehören dazu."],
      h:"Schau, in welche Richtung die Klammer an jeder Seite zeigt.",
      e:"Links zeigt die Klammer von −1 weg: nicht dabei. Rechts zeigt sie zur 3 hin: dabei."}},
  aussage:{titel:"Aussagen und Lösungsmenge", buch:"S. 23 bis 24",
    text:S`Eine Aussage wie $x>-1$ ist für manche Zahlen wahr und für andere falsch. Alle Zahlen, für die sie wahr ist, bilden die Lösungsmenge $L$. Die Zeichen: $<$ kleiner, $\le$ kleiner oder gleich, $>$ größer, $\ge$ größer oder gleich. Das Gleichheitszeichen im Zeichen bedeutet: Die Randzahl gehört dazu.`,
    formel:S`x>-1\;\Rightarrow\;L=]-1;\infty[`,
    merke:S`Ohne Gleichheitszeichen: Randzahl nicht dabei. Mit Gleichheitszeichen: Randzahl dabei.`,
    viz:vizAussage,
    check:{q:S`Welche Lösungsmenge hat $x\ge 2$?`,
      o:[S`$L=[2;\infty[$`,S`$L=]2;\infty[$`,S`$L=]-\infty;2]$`],
      h:"Gehört die 2 dazu? Und in welche Richtung geht es weiter?",
      e:S`Das Zeichen $\ge$ schließt die 2 ein, und es geht nach rechts weiter. Bei $\infty$ steht die Klammer nach außen: $[2;\infty[$.`}}
};

/* ======================= Zufallsmengen ======================= */
function randRay(){ const a=ri(-4,5); const k=one(["ge","gt","le","lt"]); return {S:Sets.ray(k,a),a}; }
function randBounded(){ const a=ri(-4,2), b=a+ri(2,6); return {S:Sets.between(a,b,Math.random()<.5,Math.random()<.5),a,b}; }
function randSet(){ const r=Math.random(); if(r<.4) return randRay().S; if(r<.85) return randBounded().S; return one([Sets.without([ri(-3,4)]),Sets.ray("gt",0)]); }
function options4(Sx,style){ for(let k=0;k<8;k++){ const o=Terms.setOptions(Sx,style,"x",{prefix:""}); if(o.length>=4) return o; } return null; }
function rules(Sx){ Sx=Sets.norm(Sx); const out=[]; Sx.forEach(i=>{ if(isFinite(i.lo)) out.push(`${ts(i.lo)} ${i.cl?"gehört dazu":"gehört nicht dazu"}`); if(isFinite(i.hi)) out.push(`${ts(i.hi)} ${i.ch?"gehört dazu":"gehört nicht dazu"}`); }); return out.join(", "); }

/* ======================= Challenge 1: Zielscheibe ======================= */
function numSet(Sx,style,qExtra){
  const bounds=Sets.norm(Sx); let lo=-6,hi=6; let finite=[]; bounds.forEach(i=>{ if(isFinite(i.lo)) finite.push(i.lo); if(isFinite(i.hi)) finite.push(i.hi); }); finite=[...new Set(finite)];
  const c=finite.length?(Math.min(...finite)+Math.max(...finite))/2:0; const span=finite.length>1?Math.max(...finite)-Math.min(...finite):0;
  lo=Math.round(c-Math.max(5,span/2+3)); hi=Math.round(c+Math.max(5,span/2+3));
  const pool=new Set(finite); for(let v=lo+1;v<=hi-1;v++) pool.add(v); [0.5,-0.5].forEach(d=>finite.forEach(f=>pool.add(f+d)));
  const must=[...finite]; const rest=shuffle([...pool].filter(v=>!must.includes(v)&&v>lo&&v<hi));
  const nums=[...must,...rest].slice(0,9).sort((a,b)=>a-b);
  const settex="M="+Sets.tex(Sx,style,"x");
  const erkl=style==="menge"?"Gesprochen: "+Terms.speak(Sx,"x")+". "+(rules(Sx)?"Randzahlen: "+rules(Sx)+".":""):"Eckige Klammer nach innen: Randzahl gehört dazu, nach außen: gehört nicht dazu. "+(rules(Sx)?rules(Sx)+".":"");
  return MM.numTask({q:"Markiere alle Zahlen, die zur Menge $M$ gehören."+(qExtra||""),settex,set:Sx,nums,lo,hi,edge:finite,erkl:erkl.trim()}); }
function zielL1(){ const r=randRay(); return numSet(r.S,"menge"); }
function zielL2(i){ if(i<2){ const r=randRay(); return numSet(r.S,"intervall"); } const b=randBounded(); return numSet(b.S,"intervall"); }
function zielL3(i){ const a=ri(-3,3), b=a+ri(2,4);
  const list=[()=>numSet(Sets.without([a]),"menge"),()=>numSet(Sets.without([a,b]),"menge"),()=>numSet(randBounded().S,"menge"),()=>numSet(randBounded().S,"menge"),()=>numSet(Sets.ray("gt",0),"menge")];
  return list[i](); }

/* ======================= Challenge 2: Baukasten ======================= */
let uid=0;
function tile(t){ return {id:"t"+(uid++),t}; }
function buildSet(Sx,style,q,show){
  const texS=Sets.tex(Sx,style,"x"); const seq=tokens(Sx,style);
  const dec=style==="menge"?["\\ge",">","\\le","<","\\N","\\mid","y"]:["]","[","\\infty",";"];
  const tiles=seq.map(tile); const need=style==="menge"?3:2; const extra=shuffle(dec).slice(0,need);
  extra.forEach(t=>tiles.push(tile(t)));
  return MM.tilesTask({show:q,q:style==="menge"?"Baue die Menge in Mengenschreibweise.":"Baue die Menge in Intervallschreibweise.",tiles,accept:[seq],join:"",solTex:texS,
    hint:style==="menge"?"Vorne die Variable mit Zahlbereich, dann der Strich, dann die Bedingung.":"Erst die Klammer, dann Anfang, Strichpunkt, Ende, Klammer.",
    erkl:style==="menge"?"Vorne $x\\in\\R$, dann der Strich „für die gilt“, dann die Bedingung.":"Eckige Klammer nach innen heißt: dabei. Bei $\\infty$ immer nach außen."}); }
function tokens(Sx,style){ Sx=Sets.norm(Sx); const sg=x=>String(x).replace(".",",");
  if(Sx.length>=2) return ["\\R","\\setminus","\\{",...Sx.slice(0,-1).flatMap((i,k)=>k?[";",sg(i.hi)]:[sg(i.hi)]),"\\}"];
  const i=Sx[0];
  if(style==="intervall") return [i.cl?"[":"]",i.lo===-INF?"-\\infty":sg(i.lo),";",i.hi===INF?"\\infty":sg(i.hi),i.ch?"]":"["];
  if(i.lo===0&&i.hi===INF&&!i.cl) return ["\\R^{+}"];
  const x="x", head=["\\{",x,"\\in","\\R","\\mid"], tail=["\\}"];
  if(i.lo===-INF) return [...head,x,i.ch?"\\le":"<",sg(i.hi),...tail];
  if(i.hi===INF) return [...head,x,i.cl?"\\ge":">",sg(i.lo),...tail];
  return [...head,sg(i.lo),i.cl?"\\le":"<",x,i.ch?"\\le":"<",sg(i.hi),...tail]; }
function bauL1(){ const r=randRay(); return buildSet(r.S,"menge",words(r.S).replace(/^./,c=>c.toUpperCase())+"."); }
function bauL2(i){ const r=i<3?randRay():randBounded(); return buildSet(r.S,"intervall",words(r.S).replace(/^./,c=>c.toUpperCase())+"."); }
function bauL3(i){
  if(i===0){ const a=ri(-3,4); return buildSet(Sets.without([a]),"menge","Alle Zahlen außer "+ts(a)+"."); }
  if(i===1){ const b=randBounded(); return buildSet(b.S,"menge",words(b.S).replace(/^./,c=>c.toUpperCase())+"."); }
  const asm=[{u:S`x>${ri(-4,3)}`},{u:S`x\ge ${ri(-4,3)}`},{u:S`x<${ri(-3,4)}`},{u:S`x\le ${ri(-3,4)}`}];
  const q=one(asm); const n=+q.u.match(/-?\d+/)[0]; const k=q.u.includes("\\ge")?"ge":q.u.includes("\\le")?"le":q.u.includes(">")?"gt":"lt";
  return buildSet(Sets.ray(k,n),"intervall",S`Aussage: $${q.u}$. Gib die Lösungsmenge $L$ als Intervall an.`); }

/* ======================= Challenge 3: Übersetzer ======================= */
function smallest(){ const items=[{t:"7",l:3},{t:"12",l:3},{t:"−4",l:2},{t:"−10",l:2},{t:"0,75",l:1},{t:"−2,5",l:1},{t:S`\tfrac13`,l:1},{t:"√2",l:0},{t:"π",l:0},{t:"√9",l:3,x:"√9 = 3, das ist eine Zählzahl."},{t:"√5",l:0}];
  const it=one(items); const names=[S`$\R$`,S`$\Q$`,S`$\Z$`,S`$\N$`]; // Index = Nummer des kleinsten Bereichs (0 = ℝ ... 3 = ℕ)
  const names2=names.map((n,k)=>({t:n,ok:k===it.l}));
  names2.forEach((o,k)=>{ if(!o.ok) o.fb=k<it.l?"Das stimmt zwar, aber es gibt einen kleineren Bereich, in den die Zahl passt.":"In diesen Bereich passt die Zahl nicht."; });
  return MM.mcTask({sit:`<span class="bigtex">${/^\\/.test(it.t)?"$"+it.t+"$":it.t}</span>`,label:"Zahl",q:"Zu welchem kleinsten Zahlbereich gehört die Zahl?",opts:names2,keepOrder:true,
    erkl:(it.x||"")+" "+["Sie ist nur in $\\R$ zu finden.","Sie ist ein Bruch, aber keine ganze Zahl: kleinster Bereich $\\Q$.","Sie ist ganz, aber nicht natürlich: kleinster Bereich $\\Z$.","Sie ist eine Zählzahl: kleinster Bereich $\\N$."][it.l]}); }
function elemTask(){ const items=[["-3","\\N",false,"Negative Zahlen gehören nicht zu $\\N$."],["5","\\Z",true,"5 ist eine ganze Zahl."],["0{,}5","\\Z",false,"0,5 ist keine ganze Zahl, sondern ein Bruch."],["0{,}5","\\Q",true,"0,5 = ½ ist ein Bruch."],["\\sqrt2","\\Q",false,"$\\sqrt2$ lässt sich nicht als Bruch schreiben."],["\\pi","\\R",true,"Jede Zahl der Zahlengerade liegt in $\\R$."],["-4","\\Z",true,"−4 ist eine ganze Zahl."],["\\tfrac13","\\Q",true,"⅓ ist ein Bruch."],["-1{,}2","\\N",false,"Negative Zahlen gehören nicht zu $\\N$."],["\\sqrt2","\\R",true,"$\\sqrt2$ liegt auf der Zahlengerade."]];
  const it=one(items); const shown=Math.random()<.5; const stmt=it[0]+(shown?"\\in":"\\notin")+it[1]; const truth=shown?it[2]:!it[2];
  return MM.mcTask({sit:`<span class="bigtex">${tex(stmt)}</span>`,label:"Aussage",q:"Ist diese Aussage wahr oder falsch?",opts:[{t:"wahr",ok:truth},{t:"falsch",ok:!truth}],keepOrder:true,erkl:T(it[3])+(shown?" Also gilt $\\in$.":" Also gilt $\\notin$.")}); }
function uebL1(){ return shuffle([smallest(),smallest(),smallest(),elemTask(),elemTask()]); }

function wordToNot(){ const Sx=randSet(); const style=one(["menge","intervall"]); const o=options4(Sx,style); if(!o) return wordToNot();
  return MM.mcTask({sit:`<span class="bigtex" style="font-size:22px">${words(Sx).replace(/^./,c=>c.toUpperCase())}.</span>`,label:"In Worten",q:style==="menge"?"Welche Mengenschreibweise passt?":"Welche Intervallschreibweise passt?",opts:o,col:o.style==="menge",
    erkl:Terms.explainSet(Sx,"x","M",style).trim()}); }
function notToWord(){ const Sx=randSet(); const style=one(["menge","intervall"]); const t0=Sets.tex(Sx,style,"x"); if(Sx.length>1||!Sets.tex(Sx,style,"x")) return notToWord();
  const w=wrongSets4(Sx); if(!w) return notToWord();
  return MM.mcTask({sit:`<span class="bigtex">${tex("M="+t0)}</span>`,label:style==="menge"?"Mengenschreibweise":"Intervallschreibweise",q:"Welche Beschreibung passt?",opts:[{t:cap(words(Sx)),ok:true}].concat(w.map(x=>({t:cap(words(x.S)),fb:x.fb}))),
    erkl:"Genau hinschauen: "+rules(Sx)+"."}); }
const cap=s=>s.replace(/^./,c=>c.toUpperCase());
function wrongSets4(Sx){ const st=Terms.wrongSets(Sx,"x","intervall").filter(w=>w.S.length===1||w.S.length>=2); const ws=shuffle(st).filter(w=>words(w.S)!==words(Sx)); const seen=new Set([words(Sx)]); const out=[]; ws.forEach(w=>{ const k=words(w.S); if(!seen.has(k)&&out.length<3){ seen.add(k); out.push(w); } }); return out.length===3?out:null; }
function uebL2(){ return shuffle([wordToNot(),wordToNot(),wordToNot(),notToWord(),notToWord()]); }

function pictureTask(style){ const Sx=one([randBounded().S,randRay().S,randBounded().S]); const o=options4(Sx,style); if(!o) return pictureTask(style);
  const f=[]; Sets.norm(Sx).forEach(i=>{ if(isFinite(i.lo)) f.push(i.lo); if(isFinite(i.hi)) f.push(i.hi); }); const lo=Math.min(...f)-3, hi=Math.max(...f)+3;
  return MM.mcTask({viz:api=>{ const host=api.cv("small"); MM.canvasView(host,(st,col)=>MM.numline(st,col,{lo,hi,set:Sx,nums:[]})); return {}; },
    q:style==="menge"?"Welche Menge ist auf der Zahlengerade markiert? Wähle die Mengenschreibweise.":"Welches Intervall ist auf der Zahlengerade markiert?",opts:o,col:o.style==="menge",erkl:("Ausgefüllter Punkt: Randzahl gehört dazu. Offener Punkt: gehört nicht dazu. "+Terms.explainSet(Sx,"x","M",style)).trim()}); }
function translateTask(from){ // from: "menge" -> Intervall wählen; "intervall" -> Menge wählen
  const Sx=Math.random()<.7?randRay().S:randBounded().S; const to=from==="menge"?"intervall":"menge"; const o=options4(Sx,to); if(!o) return translateTask(from);
  return MM.mcTask({sit:`<span class="bigtex">${tex("M="+Sets.tex(Sx,from,"x"))}</span>`,label:from==="menge"?"Mengenschreibweise":"Intervallschreibweise",q:from==="menge"?"Welche Intervallschreibweise beschreibt dieselbe Menge?":"Welche Mengenschreibweise beschreibt dieselbe Menge?",opts:o,col:o.style==="menge",
    erkl:(from==="menge"?"Gleiche Menge in Intervallschreibweise: ":"Gleiche Menge in Mengenschreibweise: ")+"$M="+Sets.tex(Sx,to,"x")+"$."}); }
function uebL3(){ return shuffle([pictureTask("intervall"),pictureTask("menge"),translateTask("menge"),translateTask("intervall"),pictureTask(one(["menge","intervall"]))]); }

MM.K2T={tokens,words,randRay,randBounded,randSet,rules,smallest:()=>null}; // nur für Tests
MM.addKapitel("k2",{
  steckOrder:["zahlen","mengen","intervall","aussage"], steckbriefe,
  challOrder:["ziel","ueb","bau"],
  braucht:{ziel:["zahlen","mengen","intervall"],ueb:["zahlen","mengen","intervall"],bau:["zahlen","mengen","intervall","aussage"]}, // welche Steckbriefe (Mini-Check) eine Challenge freischalten
  challenges:{
    ziel:{titel:"Zielscheibe", art:"Zahlen auf der Zahlengerade", buch:"S. 22 bis 24",
      kurz:"Markiere alle Zahlen, die zu einer Menge gehören.",
      intro:"Eine Menge ist vorgegeben. Du markierst alle Zahlen, die dazugehören, und achtest besonders auf die Randzahlen. In Level 1 steht die Menge in Mengenschreibweise, in Level 2 als Intervall, in Level 3 mit Ausnahmen und Bereichen.",
      levels:[{name:"Mengenschreibweise",info:"Eine Bedingung, zum Beispiel x größer als 2.",make:()=>[...Array(PRO_LEVEL)].map(zielL1)},
              {name:"Intervalle",info:"Randzahlen: dabei oder nicht dabei?",make:()=>[...Array(PRO_LEVEL)].map((_,i)=>zielL2(i))},
              {name:"Ausnahmen und Bereiche",info:"Mit ℝ ohne Zahlen, ℝ⁺ und Bereichen.",make:()=>[0,1,2,3,4].map(i=>zielL3(i))}]},
    bau:{titel:"Baukasten", art:"Schreibweisen zusammensetzen", buch:"S. 10 A10 · S. 23",
      kurz:"Baue Mengen und Intervalle aus Bausteinen zusammen.",
      intro:"Eine Menge wird in Worten beschrieben. Du setzt sie aus Bausteinen richtig zusammen. Tippe die Bausteine in der richtigen Reihenfolge an. In Level 1 baust du die Mengenschreibweise, in Level 2 die Intervallschreibweise, in Level 3 beides mit Ausnahmen und Aussagen.",
      levels:[{name:"Mengenschreibweise",info:"x aus ℝ, Strich, Bedingung.",make:()=>[...Array(PRO_LEVEL)].map(bauL1)},
              {name:"Intervalle",info:"Klammern, Randzahlen und ∞.",make:()=>[...Array(PRO_LEVEL)].map((_,i)=>bauL2(i))},
              {name:"Ausnahmen und Aussagen",info:"ℝ ohne Zahlen, Bereiche, Lösungsmengen.",make:()=>[0,1,2,2,2].map(i=>bauL3(i))}]},
    ueb:{titel:"Übersetzer", art:"Wort, Bild und Symbol", buch:"S. 22 bis 24",
      kurz:"Zwischen Worten, Zahlengerade, Mengenschreibweise und Intervall übersetzen.",
      intro:"Du übersetzt zwischen Worten, Bild und Symbolen. Zuerst Zahlbereiche, dann Worte und Schreibweisen, zuletzt die beiden Schreibweisen ineinander. In jeder Aufgabe stehen die Antworten in einer einzigen Schreibweise.",
      levels:[{name:"Zahlbereiche",info:"Kleinster Zahlbereich, Element oder nicht.",make:uebL1},
              {name:"Wort und Schreibweise",info:"Worte in Symbole, Symbole in Worte.",make:uebL2},
              {name:"Bild und Umschreiben",info:"Zahlengerade lesen, Schreibweisen ineinander übersetzen.",make:uebL3}]}
  }});
})();
