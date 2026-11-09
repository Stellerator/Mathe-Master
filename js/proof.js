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
  if(!m) return {err:"Das sieht nicht wie ein Aktivierungscode aus. Er hat die Form A17-K9F2Q-3QX7M-7X."};
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
function makeFile(P,ident,when){
  const snap=snapshot(P), t=stamp(when);
  return {mm:1,id:ident.id,t,c:snap.c,l:snap.l,b:snap.b,h:signOf(ident.key,ident.id,t,snap)}; }
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

MM.Proof={sha256,hmac,pbkdf2,utf8,master,normId,idOk,keyFor,makeCode,parseCode,snapshot,sig,clean,canon,makeFile,fileName,checkFile,toCode,parseAny,mergeInto,mergeSnaps,stamp,ITER};
})();
