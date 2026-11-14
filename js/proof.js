/* Mathe-Master · Nachweis-Kern
   Aktivierungscode (ID + persönlicher Schlüssel), Stand-Datei mit Prüfsumme, Prüfung, Zusammenführen.
   Reines JavaScript (SHA-256, HMAC, PBKDF2), läuft auch ohne HTTPS und offline.

   Prinzip:
   - Die Lehrkraft wählt ein Hauptpasswort. Es steckt NICHT in der App.
   - Schlüssel einer Person = HMAC(Hauptschlüssel, ID), 10 Zeichen. Der Aktivierungscode enthält ID und Schlüssel.
   - Die Stand-Datei trägt eine Prüfsumme HMAC(Schlüssel, Stand). Nur wer den Schlüssel kennt, kann sie erzeugen.
   - Die Lehrkraft leitet den Schlüssel aus dem Hauptpasswort und der ID ab und prüft die Datei. */
(function(){
"use strict";
const MM = window.MM = window.MM || {};

/* ---------- SHA-256 ---------- */
const PRIMES=[]; for(let n=2;PRIMES.length<64;n++){ let p=true; for(let d=2;d*d<=n;d++) if(n%d===0){ p=false; break; } if(p) PRIMES.push(n); }
const frac=x=>x-Math.floor(x);
const K=new Uint32Array(PRIMES.map(p=>Math.floor(frac(Math.cbrt(p))*4294967296)));
const H0=new Uint32Array(PRIMES.slice(0,8).map(p=>Math.floor(frac(Math.sqrt(p))*4294967296)));
const rotr=(x,n)=>(x>>>n)|(x<<(32-n));
function sha256(m){
  const l=m.length, buf=new Uint8Array(((l+9+63)>>6)<<6); buf.set(m); buf[l]=0x80;
  const dv=new DataView(buf.buffer); dv.setUint32(buf.length-4,(l*8)>>>0); dv.setUint32(buf.length-8,Math.floor(l/536870912));
  const h=new Uint32Array(H0), w=new Uint32Array(64);
  for(let o=0;o<buf.length;o+=64){
    for(let i=0;i<16;i++) w[i]=dv.getUint32(o+4*i);
    for(let i=16;i<64;i++){ const a=w[i-15], b=w[i-2];
      w[i]=(w[i-16]+(rotr(a,7)^rotr(a,18)^(a>>>3))+w[i-7]+(rotr(b,17)^rotr(b,19)^(b>>>10)))|0; }
    let a=h[0],b=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];
    for(let i=0;i<64;i++){
      const t1=(hh+(rotr(e,6)^rotr(e,11)^rotr(e,25))+((e&f)^(~e&g))+K[i]+w[i])|0;
      const t2=((rotr(a,2)^rotr(a,13)^rotr(a,22))+((a&b)^(a&c)^(b&c)))|0;
      hh=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0; }
    h[0]+=a; h[1]+=b; h[2]+=c; h[3]+=d; h[4]+=e; h[5]+=f; h[6]+=g; h[7]+=hh; }
  const out=new Uint8Array(32), odv=new DataView(out.buffer); for(let i=0;i<8;i++) odv.setUint32(4*i,h[i]); return out; }
function hmac(key,msg){
  if(key.length>64) key=sha256(key);
  const ip=new Uint8Array(64+msg.length), op=new Uint8Array(96);
  for(let i=0;i<64;i++){ const k=i<key.length?key[i]:0; ip[i]=k^0x36; op[i]=k^0x5c; }
  ip.set(msg,64); op.set(sha256(ip),64); return sha256(op); }
function pbkdf2(pass,salt,iter){
  const s=new Uint8Array(salt.length+4); s.set(salt); s[salt.length+3]=1;
  let u=hmac(pass,s); const t=new Uint8Array(u);
  for(let i=1;i<iter;i++){ u=hmac(pass,u); for(let j=0;j<32;j++) t[j]^=u[j]; }
  return t; }
const utf8=s=>new TextEncoder().encode(s);

/* ---------- Zeichensatz für Codes (ohne 0, 1, I, O) ---------- */
const AL="23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function b32(bytes,n){ let out="", bits=0, acc=0; for(let i=0;i<bytes.length&&out.length<n;i++){ acc=(acc<<8)|bytes[i]; bits+=8; while(bits>=5&&out.length<n){ out+=AL[(acc>>>(bits-5))&31]; bits-=5; } acc&=(1<<bits)-1; } return out; }
function b64u(bytes){ let s=""; for(let i=0;i<bytes.length;i+=8192) s+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192)); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function unb64u(t){ t=t.replace(/-/g,"+").replace(/_/g,"/"); while(t.length%4) t+="="; const s=atob(t), a=new Uint8Array(s.length); for(let i=0;i<s.length;i++) a[i]=s.charCodeAt(i); return a; }

/* ---------- Hauptschlüssel, Personenschlüssel, Code ---------- */
const ITER=20000, SALT=utf8("mathe-master|v1");
let mCache={pw:null,key:null};
function master(pw){ pw=String(pw).normalize("NFKC").trim(); if(!pw) throw new Error("Hauptpasswort fehlt"); if(mCache.pw===pw) return mCache.key; const k=pbkdf2(utf8(pw),SALT,ITER); mCache={pw,key:k}; return k; }
const normId=s=>String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
const idOk=s=>/^[A-Z0-9]{2,8}$/.test(s);
const keyFor=(mk,id)=>b32(hmac(mk,utf8("key|"+id)),10);
const chk=(id,key)=>b32(sha256(utf8("chk|"+id+"|"+key)),2);
const makeCode=(mk,id)=>{ const k=keyFor(mk,id); return id+"-"+k.slice(0,5)+"-"+k.slice(5)+"-"+chk(id,k); };
function parseCode(raw){
  const s=String(raw||"").toUpperCase().replace(/[\u2010-\u2015\u2212]/g,"-").replace(/[\s_.]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");
  const m=/^([A-Z0-9]{2,8})-([A-Z2-9]{5})-([A-Z2-9]{5})-([A-Z2-9]{2})$/.exec(s);
  if(!m){ const g=s.split("-"), form="Er hat die Form A17-K9F2Q-3QX7M-7X.";
    if(/[^A-Z0-9-]/.test(s)) return {err:"Im Code steht ein Zeichen, das es dort nicht gibt. "+form};
    if(/[01IO]/.test(g.slice(1).join(""))) return {err:"Im Code kommen die Zeichen 0, 1, I und O nicht vor. Bitte genau mit dem Kärtchen vergleichen."};
    if(g.length===4){ const want=[null,5,5,2], nm=["","zweite","dritte","vierte"];
      for(let i=1;i<=3;i++) if(g[i].length!==want[i]) return {err:"Die "+nm[i]+" Gruppe hat "+g[i].length+" statt "+want[i]+" Zeichen, es fehlt oder ist zu viel. Bitte noch einmal genau abschreiben."}; }
    if(g.length<4) return {err:"Der Code ist unvollständig. Er besteht aus vier Teilen mit Bindestrichen. "+form};
    return {err:"Das sieht nicht wie ein Aktivierungscode aus. "+form}; }
  const id=m[1], key=m[2]+m[3];
  if(chk(id,key)!==m[4]) return {err:"Tippfehler im Code. Bitte noch einmal genau abschreiben."};
  return {id,key,code:id+"-"+m[2]+"-"+m[3]+"-"+m[4]}; }

/* ---------- Stand: aus dem Speicher der App, zusammenführen, Prüfsumme ---------- */
const lvStr=a=>[0,1,2].map(n=>a&&a[n]?"1":"0").join("");
function snapshot(P){
  const c=Object.keys(P.cards||{}).filter(k=>P.cards[k]).sort();
  const l={}; Object.keys(P.lv||{}).sort().forEach(k=>{ const s=lvStr(P.lv[k]); if(s!=="000") l[k]=s; });
  const b={}; Object.keys(P.best||{}).sort().forEach(k=>{ const v=+P.best[k]; if(v>0) b[k]=v; });
  return {c,l,b}; }
const sig=snap=>JSON.stringify([snap.c,snap.l,snap.b]);
function clean(o){ // macht aus beliebigem JSON einen sauberen Stand (oder wirft)
  if(!o||typeof o!=="object") throw new Error("kein Stand");
  const c=(Array.isArray(o.c)?o.c:[]).filter(x=>typeof x==="string"&&x.length<60).slice(0,800);
  const l={}, b={};
  Object.keys(o.l||{}).slice(0,800).forEach(k=>{ if(/^[A-Za-z0-9._-]{1,60}$/.test(k)&&/^[01]{3}$/.test(o.l[k])) l[k]=o.l[k]; });
  Object.keys(o.b||{}).slice(0,2400).forEach(k=>{ const v=+o.b[k]; if(/^[A-Za-z0-9._:-]{1,64}$/.test(k)&&v>0&&v<=99) b[k]=Math.floor(v); });
  return {c:[...new Set(c)].sort(),l,b}; }
function canon(id,t,snap){
  const L=Object.keys(snap.l).sort().map(k=>k+":"+snap.l[k]).join(","), B=Object.keys(snap.b).sort().map(k=>k+"="+snap.b[k]).join(",");
  return "mm1|"+id+"|"+t+"|"+snap.c.join(",")+"|"+L+"|"+B; }
const stamp=(d)=>{ d=d||new Date(); const p=n=>String(n).padStart(2,"0"); return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes())+":"+p(d.getSeconds()); };
const signOf=(key,id,t,snap)=>b32(hmac(utf8(key),utf8(canon(id,t,snap))),16);
function makeFile(P,ident,when,ex){ // ex: optionaler Zusatzblock (buildX), eigene Prüfsumme h2
  const snap=snapshot(P), t=stamp(when);
  const f={mm:1,id:ident.id,t,c:snap.c,l:snap.l,b:snap.b,h:signOf(ident.key,ident.id,t,snap)};
  const cx=ex?cleanX(ex):null; if(cx){ f.x=cx; f.h2=signX(ident.key,ident.id,t,cx); }
  return f; }
const fileName=f=>f.id+"_"+f.t.slice(0,10)+"_"+f.t.slice(11,13)+f.t.slice(14,16)+".json";
function checkFile(f,key){ // true, wenn die Prüfsumme zum Schlüssel passt
  try{ if(!f||f.mm!==1||!idOk(f.id)||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(f.t)||typeof f.h!=="string") return false;
    return signOf(key,f.id,f.t,clean(f))===f.h; }catch(e){ return false; } }
const toCode=f=>"MM1."+b64u(utf8(JSON.stringify(f)));
function parseAny(text){ // JSON-Datei oder Stand-Code
  text=String(text||"").trim();
  if(text.startsWith("MM1.")) text=new TextDecoder().decode(unb64u(text.slice(4).replace(/\s+/g,"")));
  const o=JSON.parse(text); if(!o||typeof o!=="object") throw new Error("kein Stand"); return o; }
function mergeInto(P,snap){ // fügt einen Stand in den Speicher der App ein (nur dazu, nie weg)
  P.cards=P.cards||{}; P.lv=P.lv||{}; P.best=P.best||{};
  snap.c.forEach(k=>{ P.cards[k]=true; });
  Object.keys(snap.l).forEach(k=>{ const a=P.lv[k]||[false,false,false]; for(let n=0;n<3;n++) if(snap.l[k][n]==="1") a[n]=true; P.lv[k]=a; });
  Object.keys(snap.b).forEach(k=>{ P.best[k]=Math.max(P.best[k]||0,snap.b[k]); }); }
function mergeSnaps(list){ // Vereinigung mehrerer Stände (für die Lehrkraft)
  const c=new Set(), l={}, b={};
  list.forEach(s=>{ s.c.forEach(k=>c.add(k));
    Object.keys(s.l).forEach(k=>{ const o=l[k]||"000"; l[k]=[0,1,2].map(n=>o[n]==="1"||s.l[k][n]==="1"?"1":"0").join(""); });
    Object.keys(s.b).forEach(k=>{ b[k]=Math.max(b[k]||0,s.b[k]); }); });
  return {c:[...c].sort(),l,b}; }

/* ---------- Zusatzblock x (Format 2): Fehlerprofil, Übungsaktivität, Arbeiten, Hausaufgaben, Forder ----------
   Die Datei bleibt mm:1. Die bisherige Prüfsumme h deckt weiter nur c, l und b ab, ältere Prüf-Dateien lesen neue Stände also unverändert.
   Der Zusatzblock x hat eine eigene Prüfsumme h2 (gleicher Personenschlüssel). Ohne gültiges h2 wird x ignoriert. */
const stable=o=>Array.isArray(o)?"["+o.map(stable).join(",")+"]":(o&&typeof o==="object")?"{"+Object.keys(o).sort().map(k=>JSON.stringify(k)+":"+stable(o[k])).join(",")+"}":JSON.stringify(o);
const r1=v=>Math.round(v*10)/10;
const clampInt=(v,lo,hi)=>Math.max(lo,Math.min(hi,Math.floor(+v||0)));
const isoOk=d=>typeof d==="string"&&/^\d{4}-\d\d-\d\d$/.test(d);
const isoTimeOk=d=>typeof d==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d)?$/.test(d);
const localIso=ms=>{ const d=new Date(ms), p=n=>String(n).padStart(2,"0"); return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()); };
const idOk2=k=>typeof k==="string"&&/^[A-Za-z0-9_-]{1,16}$/.test(k);
/* rs: alles, was zum Wiederherstellen nötig ist (Übungstage, Runden, Ziel, Hausaufgaben im Detail, Plus-Tage, „zuletzt geübt“) */
function buildRs(x){
  const d=Object.keys(x.days||{}).filter(isoOk).sort().slice(-200), ro=((x.rep&&x.rep.rounds)||[]).map(r=>[r.d,r.h,r.n]), pl=(x.rep&&x.rep.plan)||null, lt={};
  Object.keys(x.stat||{}).forEach(k=>{ const e=x.stat[k]; if(e&&e.a>0&&e.t>0&&/^[A-Za-z0-9._:-]{1,64}$/.test(k)) lt[k]=localIso(e.t); });
  const ha={}; Object.keys(x.ha||{}).forEach(id=>{ const e=x.ha[id]; if(!e||!idOk2(id)) return; const a={}; Object.keys(e.a||{}).forEach(i=>{ const q=e.a[i]; a[i]=[q.b,q.n,q.s,q.k||0,q.ts||""]; });
    ha[id]={a,p:e.p&&e.p.v?[e.p.v,e.p.ts||""]:null,m:e.m&&e.m.ts?e.m.ts:"",done:e.done||"",f:e.f||"",ti:e.ti||"",k:e.k||0,dn:e.dn||0}; });
  const fo={}; Object.keys(x.fo||{}).forEach(k=>{ if(idOk2(k)&&x.fo[k]) fo[k]=Object.assign({},x.fo[k]); });
  return {d,ro,pl,lt,ha,fo}; }
function cleanRs(r){
  if(!r||typeof r!=="object") return null;
  const d=(Array.isArray(r.d)?r.d:[]).filter(isoOk).sort().filter((v,i,a)=>!i||v!==a[i-1]).slice(-200);
  const ro=(Array.isArray(r.ro)?r.ro:[]).filter(e=>Array.isArray(e)&&isoOk(e[0])).map(e=>[e[0],clampInt(e[1],0,99),clampInt(e[2],0,99)]).sort((p,q)=>p[0]<q[0]?-1:p[0]>q[0]?1:(p[1]-q[1])||(p[2]-q[2])).slice(-120);
  let pl=null; const P=r.pl; if(P&&typeof P==="object"&&isoOk(P.datum)&&isoOk(P.start)) pl={datum:P.datum,titel:String(P.titel||"").replace(/[<>]/g,"").slice(0,40),id:idOk2(P.id)?P.id:"eigen",kapitel:(Array.isArray(P.kapitel)?P.kapitel:[]).filter(q=>typeof q==="string"&&/^[A-Za-z0-9]{1,8}$/.test(q)).slice(0,12),n:clampInt(P.n,0,50),start:P.start,serie:P.serie?1:0};
  const lt={}; Object.keys(r.lt||{}).slice(0,400).forEach(k=>{ if(/^[A-Za-z0-9._:-]{1,64}$/.test(k)&&isoOk(r.lt[k])) lt[k]=r.lt[k]; });
  const ha={}; Object.keys(r.ha||{}).slice(0,80).forEach(id=>{ const e=r.ha[id]; if(!idOk2(id)||!e||typeof e!=="object") return; const a={};
    Object.keys(e.a||{}).forEach(i=>{ if(!/^[0-2]$/.test(i)||!Array.isArray(e.a[i])) return; const q=e.a[i]; a[i]=[clampInt(q[0],0,99),clampInt(q[1],0,99),clampInt(q[2],0,99),clampInt(q[3],0,999),isoTimeOk(q[4])?q[4]:""]; });
    const p=Array.isArray(e.p)&&["s","g","u"].includes(e.p[0])?[e.p[0],isoTimeOk(e.p[1])?e.p[1]:""]:null;
    ha[id]={a,p,m:isoTimeOk(e.m)?e.m:"",done:isoTimeOk(e.done)?e.done:"",f:isoOk(e.f)?e.f:"",ti:String(e.ti||"").replace(/[<>]/g,"").slice(0,40),k:clampInt(e.k,0,3),dn:clampInt(e.dn,0,3)}; });
  const fo={}; Object.keys(r.fo||{}).slice(0,20).forEach(k=>{ if(!idOk2(k)||!r.fo[k]||typeof r.fo[k]!=="object") return; const o={}; Object.keys(r.fo[k]).forEach(i=>{ if(/^[0-7]$/.test(i)&&isoOk(r.fo[k][i])) o[i]=r.fo[k][i]; }); if(Object.keys(o).length) fo[k]=o; });
  return {d,ro,pl,lt,ha,fo}; }
/* Aus dem Speicher der App (P.x) den Zusatzblock bauen. sr = aktuelle Serie in Tagen. null, wenn es noch nichts gibt. */
function buildX(P,sr){ const x=(P&&P.x)||{}, s={};
  Object.keys(x.stat||{}).sort().slice(0,400).forEach(k=>{ const e=x.stat[k]; if(e&&e.a>0&&/^[A-Za-z0-9._:-]{1,64}$/.test(k)) s[k]=[Math.floor(e.a),r1(Math.min(+e.f||0,e.a))]; });
  const days=Object.keys(x.days||{}).filter(isoOk).sort(), rounds=(x.rep&&x.rep.rounds)||[];
  const a=(x.arb||[]).slice(-20).map(e=>({t:e.t==="probe"?"probe":"ueb",d:e.d,h:e.h,p:e.p,n:e.n,k:e.k}));
  const ha={}; Object.keys(x.ha||{}).sort().slice(0,80).forEach(id=>{ const e=x.ha[id]; if(!e||!idOk2(id)) return;
    const parts=Object.keys(e.a||{}).sort((p,q)=>p-q).map(i=>[e.a[i].b,e.a[i].n,e.a[i].s]);
    ha[id]={t:e.done||"",f:e.f||"",ti:String(e.ti||"").slice(0,40),k:e.k||0,d:e.dn||0,a:parts,p:(e.p&&e.p.v)||"",m:e.m&&e.m.ts?1:0}; });
  const fo={}; Object.keys(x.fo||{}).sort().forEach(k=>{ const e=x.fo[k]; if(!idOk2(k)||!e) return; const n=Math.max(0,...Object.keys(e).map(i=>+i+1)); if(n>0&&n<=8) fo[k]=Array.from({length:n},(_,i)=>e[i]?"1":"0").join(""); });
  if(!Object.keys(s).length&&!days.length&&!rounds.length&&!a.length&&!Object.keys(ha).length&&!Object.keys(fo).length) return null;
  return cleanX({v:2,s,d:days.length,z:days.length?days[days.length-1]:"",r:rounds.length,sr:sr||0,a,ha,fo,rs:buildRs(x)}); }
function cleanX(x){ // macht aus beliebigem JSON einen sauberen Zusatzblock (oder null). Mehrfaches Bereinigen ändert nichts mehr.
  if(!x||typeof x!=="object"||x.v!==2) return null;
  const s={}; Object.keys(x.s||{}).slice(0,400).forEach(k=>{ const e=x.s[k]; if(!/^[A-Za-z0-9._:-]{1,64}$/.test(k)||!Array.isArray(e)||!isFinite(+e[0])||!isFinite(+e[1])) return;
    const a=clampInt(e[0],0,99999), f=r1(Math.max(0,Math.min(a,+e[1]))); if(a>0) s[k]=[a,f]; });
  const a=(Array.isArray(x.a)?x.a:[]).slice(-20).filter(e=>e&&(e.t==="probe"||e.t==="ueb")&&isoOk(e.d)).map(e=>({t:e.t,d:e.d,h:clampInt(e.h,0,99),p:clampInt(e.p,0,99),n:clampInt(e.n,0,99),k:(Array.isArray(e.k)?e.k:[]).filter(q=>typeof q==="string"&&/^[A-Za-z0-9]{1,8}$/.test(q)).slice(0,12)}));
  const ha={}; Object.keys(x.ha||{}).slice(0,80).forEach(id=>{ const e=x.ha[id]; if(!idOk2(id)||!e||typeof e!=="object") return;
    ha[id]={t:isoTimeOk(e.t)?e.t:"",f:isoOk(e.f)?e.f:"",ti:String(e.ti||"").replace(/[<>]/g,"").slice(0,40),k:clampInt(e.k,0,3),d:clampInt(e.d,0,3),
      a:(Array.isArray(e.a)?e.a:[]).slice(0,3).map(q=>Array.isArray(q)?[clampInt(q[0],0,99),clampInt(q[1],0,99),clampInt(q[2],0,99)]:[0,0,0]),p:["s","g","u"].includes(e.p)?e.p:"",m:e.m?1:0}; });
  const fo={}; Object.keys(x.fo||{}).slice(0,20).forEach(k=>{ if(idOk2(k)&&typeof x.fo[k]==="string"&&/^[01]{1,8}$/.test(x.fo[k])) fo[k]=x.fo[k]; });
  return {v:2,s,d:clampInt(x.d,0,9999),z:isoOk(x.z)?x.z:"",r:clampInt(x.r,0,99999),sr:clampInt(x.sr,0,9999),a,ha,fo,rs:cleanRs(x.rs)}; }
/* Wiederherstellen: fügt den gesicherten Zusatzstand in den Speicher der App ein. Nur dazu, nie weg; Vorhandenes bleibt, wenn es mindestens gleich viel ist. */
function restoreX(P,cx){
  const out={stat:0,days:0,rounds:0,arb:0,ha:0,fo:0,plan:false}; if(!cx) return out;
  const rs=cx.rs||{d:[],ro:[],pl:null,lt:{},ha:{},fo:{}}; P.x=P.x||{}; const X=P.x;
  X.stat=X.stat||{}; Object.keys(cx.s).forEach(k=>{ const a=cx.s[k][0], f=cx.s[k][1], c=X.stat[k];
    if(!c||c.a<a||(c.a===a&&c.f<f)){ const lt=rs.lt[k]; X.stat[k]={a,f,t:lt?Date.parse(lt+"T12:00:00"):((c&&c.t)||0)}; out.stat++; } });
  X.days=X.days||{}; rs.d.forEach(d=>{ if(!X.days[d]){ X.days[d]=1; out.days++; } });
  X.rep=X.rep||{}; X.rep.rounds=X.rep.rounds||[]; const have=new Set(X.rep.rounds.map(r=>[r.d,r.h,r.n].join("|")));
  rs.ro.forEach(e=>{ const k=e.join("|"); if(!have.has(k)){ have.add(k); X.rep.rounds.push({d:e[0],h:e[1],n:e[2]}); out.rounds++; } });
  X.rep.rounds.sort((p,q)=>p.d<q.d?-1:p.d>q.d?1:0); if(X.rep.rounds.length>120) X.rep.rounds.splice(0,X.rep.rounds.length-120);
  if(!X.rep.plan&&rs.pl){ X.rep.plan=Object.assign({},rs.pl,{serie:!!rs.pl.serie}); out.plan=true; }
  X.arb=X.arb||[]; const ak=new Set(X.arb.map(e=>[e.t,e.d,e.n,e.h,e.p].join("|")));
  cx.a.forEach(e=>{ const k=[e.t,e.d,e.n,e.h,e.p].join("|"); if(!ak.has(k)){ ak.add(k); X.arb.push({t:e.t,d:e.d,h:e.h,p:e.p,n:e.n,k:e.k.slice()}); out.arb++; } });
  X.arb.sort((p,q)=>p.d<q.d?-1:p.d>q.d?1:0); if(X.arb.length>40) X.arb.splice(0,X.arb.length-40);
  X.ha=X.ha||{}; Object.keys(rs.ha).forEach(id=>{ const n=rs.ha[id]; let c=X.ha[id]; if(!c){ c=X.ha[id]={a:{},p:null,m:null,done:""}; out.ha++; }
    Object.keys(n.a).forEach(i=>{ const q=n.a[i], cur=c.a[i]; if(!cur||cur.b<q[0]||(cur.b===q[0]&&(cur.k||0)<q[3])) c.a[i]={b:q[0],n:q[1],s:q[2],k:q[3],ts:q[4]}; });
    if(!c.p&&n.p) c.p={v:n.p[0],ts:n.p[1]}; if((!c.m||!c.m.ts)&&n.m) c.m={ts:n.m};
    if(n.done&&(!c.done||n.done<c.done)) c.done=n.done; c.f=c.f||n.f; c.ti=c.ti||n.ti; c.k=Math.max(c.k||0,n.k); c.dn=Math.max(c.dn||0,n.dn); });
  X.fo=X.fo||{}; Object.keys(rs.fo).forEach(k=>{ X.fo[k]=X.fo[k]||{}; Object.keys(rs.fo[k]).forEach(i=>{ if(!X.fo[k][i]){ X.fo[k][i]=rs.fo[k][i]; out.fo++; } }); });
  return out; }
const signX=(key,id,t,x)=>b32(hmac(utf8(key),utf8("mx2|"+id+"|"+t+"|"+stable(x))),16);
function checkX(f,key){ // null: kein Zusatzblock, true: gültig, false: Prüfsumme passt nicht
  if(!f||f.x===undefined) return null;
  try{ const cx=cleanX(f.x); return !!cx&&typeof f.h2==="string"&&signX(key,f.id,f.t,cx)===f.h2; }catch(e){ return false; } }
/* Fingerabdruck für „neuer Stand?“: ohne Serie und letzten Tag, damit nur echtes Üben zählt */
const xsig=x=>x?stable(Object.assign({},x,{sr:0,z:""})):"";
function mergeX(list){ // list: [{t, x}] (mehrere Dateien einer Person): je Thema der Stand mit mehr Aufgaben, Arbeiten vereinigt, Hausaufgaben: früheste Erledigung
  list=list.filter(e=>e&&e.x).sort((p,q)=>String(p.t).localeCompare(String(q.t))); if(!list.length) return null;
  const s={}, seen=new Set(), a=[], ha={}, fo={}; let d=0,r=0,z="";
  list.forEach(e=>{ const x=e.x; Object.keys(x.s).forEach(k=>{ const c=s[k], n=x.s[k]; if(!c||n[0]>c[0]||(n[0]===c[0]&&n[1]>c[1])) s[k]=n.slice(); });
    d=Math.max(d,x.d); r=Math.max(r,x.r); if(x.z>z) z=x.z;
    x.a.forEach(q=>{ const key=[q.t,q.d,q.n,q.h,q.p].join("|"); if(!seen.has(key)){ seen.add(key); a.push(q); } });
    Object.keys(x.ha||{}).forEach(id=>{ const n=x.ha[id], c=ha[id]; if(!c){ ha[id]=JSON.parse(JSON.stringify(n)); return; }
      if(n.t&&(!c.t||n.t<c.t)){ ha[id]=JSON.parse(JSON.stringify(n)); return; } if(!n.t&&!c.t&&n.d>c.d) ha[id]=JSON.parse(JSON.stringify(n)); });
    Object.keys(x.fo||{}).forEach(k=>{ const o=fo[k]||"", n=x.fo[k], L=Math.max(o.length,n.length); let m=""; for(let i=0;i<L;i++) m+=(o[i]==="1"||n[i]==="1")?"1":"0"; fo[k]=m; }); });
  a.sort((p,q)=>(p.d<q.d?-1:p.d>q.d?1:0)); const last=list[list.length-1].x;
  return {v:2,s,d,z,r,sr:last.sr,a:a.slice(-20),ha,fo}; }

MM.Proof={restoreX,buildX,cleanX,signX,checkX,xsig,mergeX,sha256,hmac,pbkdf2,utf8,master,normId,idOk,keyFor,makeCode,parseCode,snapshot,sig,clean,canon,makeFile,fileName,checkFile,toCode,parseAny,mergeInto,mergeSnaps,stamp,ITER};
})();
