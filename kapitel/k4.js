/* Kapitel 4 · Geraden & Ungleichungen (Kap. 1 · Abschnitt 4 „Lage von Geraden“ und 5 „Ungleichungen“ · S. 20–24)
   Begriffe wie im Buch: Gerade g: y=…, Gleichsetzen der Funktionsterme, parallel/identisch/orthogonal, Schnittpunkt S,
   Schnittwinkel δ, 1. und 2. Winkelhalbierende, Ungleichheitszeichen, Äquivalenzumformung, Lösungsmenge L. */
(function(){
"use strict";
const MM=window.MM, S=String.raw;
const {shuffle,one,ri,T,tn,ts}=MM, E=MM.Eingabe;
const near=(a,b)=>Math.abs(a-b)<1e-9, R=v=>Math.round(v*1e6)/1e6, abs=Math.abs;
const NZ=[-3,-2,-1,1,2,3], NZ0=[-4,-3,-2,-1,1,2,3,4], BB=[-4,-3,-2,-1,1,2,3,4,5];
const gcd=(a,b)=>b?gcd(b,a%b):a;
const pr=v=>v<0?`(${tn(v)})`:tn(v);

/* ---------- Schreibweisen (TeX) ---------- */
const co=m=>m===1?"":m===-1?"-":tn(m);
const sgn=v=>v<0?`- ${tn(-v)}`:`+ ${tn(v)}`;
const lin=(m,b)=>m===0?tn(b):`${co(m)}x${b===0?"":" "+sgn(b)}`;
const frac=(p,q)=>`\\frac{${p}}{${q}}`;
const fr=(p,q)=>{ const g=gcd(abs(p),abs(q))||1; p/=g; q/=g; if(q<0){ p=-p; q=-q; } return q===1?tn(p):(p<0?"-":"")+frac(abs(p),q); };
const br=x1=>x1>=0?`(x - ${tn(x1)})`:`(x + ${tn(-x1)})`;
const psf=(m,x1,y1)=>`${abs(m)===1?(m<0?"-":""):tn(m)+S`\cdot `}${br(x1)} ${sgn(y1)}`;
const LG=(n,m,b)=>S`${n}\colon y=${lin(m,b)}`;
const RT={"<":"<","<=":S`\le `,">":">",">=":S`\ge `}, FL={"<":">","<=":">=",">":"<",">=":"<="};
const RELS=["<","<=",">",">="];

/* ---------- Bausteine ---------- */
function mc(q,good,bad,erkl,o){ const seen=new Set([good]); const opts=[{t:good,ok:true}];
  for(const b of shuffle(bad)){ const t=typeof b==="string"?b:b.t; if(seen.has(t)) continue; seen.add(t); opts.push({t,fb:b.fb}); if(opts.length>=4) break; }
  if(opts.length<3) return null; return MM.mcTask(Object.assign({q,opts,erkl},o||{})); }
/* Zwei Geraden im Gitter; ctrl: lines [{m,b}|{v}] */
function vizLines(lines,names){ return api=>{ const host=api.cv(""); MM.canvasView(host,(st,col)=>{ const cs=[col.wave,col.mark];
    MM.plot(st,col,{xr:[-6,6],yr:[-6,6],step:1,paths:lines.map((l,i)=>({pts:l.v!==undefined?[[l.v,-80],[l.v,80]]:[[-80,l.m*-80+l.b],[80,l.m*80+l.b]],color:cs[i]}))}); });
  api.legend(names.map((n,i)=>`<span style="color:var(${i?"--mark":"--wave"});font-weight:700">■ ${n}</span>`).join("  ")); return null; }; }
const solveI=(a,b,rel,c,d)=>{ const A=a-c, B=d-b; if(A===0) return null; return A>0?{rel,bound:B/A,flip:false}:{rel:FL[rel],bound:B/A,flip:true}; };
const ineqS=(a,b,rel,c,d)=>`${lin(a,b)} ${RT[rel]} ${lin(c,d)}`;

/* ============================ Steckbriefe ============================ */
const steckbriefe={
  lage:{titel:"Lage von Geraden",buch:"S. 20 · S. 21",
    text:S`Zwei Geraden können sich schneiden, identisch sein oder parallel zueinander liegen. Die Lage stellst du rechnerisch durch <b>Gleichsetzen der Funktionsterme</b> $g(x)=h(x)$ fest.`,
    formel:S`g(x)=h(x)`,
    merke:S`<b>Parallel:</b> gleiche Steigung, $m_g=m_h$. <b>Identisch:</b> gleiche Steigung und gleicher y-Achsenabschnitt. Sonst <b>schneiden</b> sich die Geraden.`,
    falle:S`Beim Gleichsetzen: eine <b>falsche</b> Aussage (zum Beispiel $0{,}5=-1$) heißt parallel, eine für alle $x$ <b>wahre</b> Aussage (zum Beispiel $-1=-1$) heißt identisch. Kommt $x=\ldots$ heraus, schneiden sich die Geraden.`,
    check:{q:S`Gegeben sind $g\colon y=0{,}5x+0{,}5$ und $h\colon y=0{,}5x-1$. Wie liegen die Geraden?`,
      o:[S`parallel, aber nicht identisch`,S`identisch`,S`Sie schneiden sich in einem Punkt.`],
      h:"Vergleiche die Steigungen und die y-Achsenabschnitte.",
      e:S`Beide haben die Steigung $0{,}5$, aber $b=0{,}5$ und $b=-1$ sind verschieden: Die Geraden sind parallel und nicht identisch.`},
    beispiele:[
      {titel:"Beispiel 1 · Schritt für Schritt",aufgabe:S`$g\colon y=2x+1$ und $h\colon y=2x-3$. Wie liegen die Geraden?`,
       steps:[{w:"Steigungen",t:S`$m_g=2$ und $m_h=2$: gleich.`},{w:"y-Achsenabschnitte",t:S`$b_g=1$ und $b_h=-3$: verschieden.`},{w:"Gleichsetzen",t:S`$2x+1=2x-3\ \mid -2x$ ergibt $1=-3$. Das ist falsch.`},{w:"Antwort",t:S`Die Geraden sind parallel und nicht identisch.`}]},
      {titel:"Beispiel 2 · die gemeinsame Steigung rechnest du",aufgabe:S`$g\colon y=0{,}5x-1$ und $h\colon y=-0{,}5(2-x)$. Wie liegen die Geraden?`,
       steps:[{w:"$h$ umformen",t:S`$-0{,}5(2-x)=-1+0{,}5x$, also $h\colon y=0{,}5x-1$`},{w:"Vergleich",t:S`$g$ und $h$ haben dieselbe Steigung und denselben y-Achsenabschnitt $b=-1$.`},{w:"Antwort",t:S`Die Geraden sind identisch.`}],
       frei:{typ:"zahl",q:S`Welche Steigung haben $g$ und $h$ gemeinsam?`,answer:0.5,solTex:"0{,}5"}}]},
  schnitt:{titel:"Schnittpunkt von zwei Geraden",buch:"S. 20 · S. 21 Beispiel 2",
    text:S`Den Schnittpunkt $S$ zweier Geraden berechnest du durch Gleichsetzen. Löse $g(x)=h(x)$ nach $x$ auf und setze das Ergebnis in $g(x)$ oder $h(x)$ ein.`,
    formel:S`g(x)=h(x)\;\Rightarrow\;x_S,\quad y_S=g(x_S)`,
    merke:S`Erst $x$ durch Gleichsetzen, dann $y$ durch Einsetzen. Zur Probe setzt du $x_S$ auch in den anderen Term ein.`,
    falle:S`Liegt die Gleichung nicht in der Form $y=\ldots$ vor, formst du sie zuerst in die Hauptform der Geradengleichung um.`,
    check:{q:S`Berechne den Schnittpunkt von $g(x)=2x+1$ und $h(x)=-x+7$.`,
      o:[S`$S(2|5)$`,S`$S(5|2)$`,S`$S(2|-5)$`],
      h:"Setze 2x + 1 = −x + 7 und löse nach x auf. Dann in g(x) einsetzen.",
      e:S`$3x=6$ ergibt $x=2$. Dann $g(2)=2\cdot 2+1=5$. Also $S(2|5)$.`},
    beispiele:[
      {titel:"Beispiel 1 · Schritt für Schritt",aufgabe:S`Berechne den Schnittpunkt $S$ von $g(x)=3x-1$ und $h(x)=-x+11$.`,
       steps:[{w:"Gleichsetzen",t:S`$3x-1=-x+11$`},{w:"Umformen",t:S`$4x=12\ \Rightarrow\ x=3$`},{w:"Einsetzen in $g(x)$",t:S`$g(3)=3\cdot 3-1=8$`},{w:"Antwort",t:S`Der Schnittpunkt ist $S(3|8)$.`},{w:"Probe",t:S`$h(3)=-3+11=8$ ✓`}]},
      {titel:"Beispiel 2 · den letzten Schritt rechnest du",aufgabe:S`Berechne den Schnittpunkt $S$ von $g(x)=-2x+4$ und $h(x)=x-5$.`,
       steps:[{w:"Gleichsetzen",t:S`$-2x+4=x-5$`},{w:"Umformen",t:S`$-3x=-9\ \Rightarrow\ x=3$`},{w:"Einsetzen in $g(x)$",t:S`$g(3)=-2\cdot 3+4=-2$, also $S(3|-2)$.`}],
       frei:{typ:"zahl",q:S`Wie groß ist die y-Koordinate von $S$? Setze $x=3$ in $g(x)$ ein.`,answer:-2,solTex:"-2"}}]},
  orth:{titel:"Orthogonale und besondere Geraden",buch:"S. 20 · S. 21 Beispiel 1 und 3",
    text:S`Zwei Geraden sind <b>orthogonal</b>, wenn sie sich rechtwinklig schneiden. Dann gilt für die Steigungen $m_g\cdot m_h=-1$ bzw. $m_g=-\dfrac{1}{m_h}$. Besondere Geraden: die 1. Winkelhalbierende $w_1\colon y=x$ und die 2. Winkelhalbierende $w_2\colon y=-x$. Eine vertikale Gerade $x=a$ ist nicht Graph einer Funktion. Sie ist orthogonal zu jeder horizontalen Geraden $y=c$.`,
    formel:S`m_g\cdot m_h=-1`,
    merke:S`Orthogonal: Kehrwert der Steigung bilden und das Vorzeichen wechseln.`,
    falle:S`Eine horizontale Gerade hat $m=0$, eine vertikale hat gar keine Steigung. Die Formel $m_g\cdot m_h=-1$ gilt für sie nicht.`,
    check:{q:S`Welche Gerade ist orthogonal zu $g\colon y=2x+1$?`,
      o:[S`$h\colon y=-0{,}5x+3$`,S`$h\colon y=0{,}5x+3$`,S`$h\colon y=-2x+3$`],
      h:"Rechne m_g · m_h und prüfe, ob −1 herauskommt.",
      e:S`$2\cdot(-0{,}5)=-1$. Die Steigungen sind Kehrwerte mit unterschiedlichem Vorzeichen.`},
    beispiele:[
      {titel:"Beispiel 1 · Schritt für Schritt",aufgabe:S`Sind $g\colon y=\frac34x+1$ und $k\colon y=-\frac43x+2$ orthogonal?`,
       steps:[{w:"Steigungen",t:S`$m_g=\frac34$ und $m_k=-\frac43$`},{w:"Produkt",t:S`$m_g\cdot m_k=\frac34\cdot\left(-\frac43\right)=-1$`},{w:"Antwort",t:S`Das Produkt ist $-1$: Die Geraden sind orthogonal.`}]},
      {titel:"Beispiel 2 · den Term schreibst du",aufgabe:S`Bestimme die Gleichung der Orthogonalen $h$ zu $g\colon y=2x+1$ durch $Q(4|0)$.`,
       steps:[{w:"Steigung von $h$",t:S`$m_h=-\dfrac{1}{2}=-0{,}5$`},{w:"Punkt einsetzen",t:S`$0=-0{,}5\cdot 4+b\ \Rightarrow\ b=2$`},{w:"Gleichung",t:S`$h\colon y=-0{,}5x+2$`}],
       frei:{typ:"term",q:S`Schreibe die Gleichung von $h$ hin.`,prefix:S`h\colon y=`,fn:x=>-0.5*x+2,solTex:"-0,5x+2"}}]},
  unglei:{titel:"Ungleichungen lösen",buch:"S. 23 · Beispiel 1",
    text:S`Werden zwei Terme durch ein Ungleichheitszeichen ($<$, $\le$, $>$, $\ge$) verbunden, entsteht eine <b>Ungleichung</b>. Man löst sie wie Gleichungen durch Äquivalenzumformungen. Wird auf beiden Seiten mit einer <b>negativen</b> Zahl multipliziert oder durch sie dividiert, muss das Ungleichheitszeichen umgedreht werden.`,
    formel:S`-3x\le 12\ \mid :(-3)\ \Rightarrow\ x\ge -4`,
    merke:S`Lösungsmenge: $L=\{x\in\R\mid x\ge -4\}$ bzw. $L=[-4;\infty[$.`,
    falle:S`Nur beim Multiplizieren oder Dividieren mit einer negativen Zahl wird das Zeichen umgedreht. Beim Addieren und Subtrahieren bleibt es.`,
    check:{q:S`Löse $-3x\le 12$. Welche Lösung stimmt?`,
      o:[S`$x\ge -4$`,S`$x\le -4$`,S`$x\ge 4$`],
      h:"Du teilst durch −3. Was passiert mit dem Ungleichheitszeichen?",
      e:S`$-3x\le 12\ \mid:(-3)$ ergibt $x\ge -4$. Das Zeichen wird umgedreht.`},
    beispiele:[
      {titel:"Beispiel 1 · Schritt für Schritt",aufgabe:S`Löse $5x-3\le 7x+1$ und gib $L$ an.`,
       steps:[{w:"Umformen",t:S`$5x-3\le 7x+1\ \mid +3\ \mid -7x$`},{w:"Zusammenfassen",t:S`$-2x\le 4$`},{w:"Durch $-2$ teilen",t:S`$x\ge -2$ (Zeichen umdrehen!)`},{w:"Lösungsmenge",t:S`$L=\{x\in\R\mid x\ge -2\}=[-2;\infty[$`}]},
      {titel:"Beispiel 2 · die Grenze rechnest du",aufgabe:S`Löse $4-x<2(x+1)$.`,
       steps:[{w:"Ausmultiplizieren",t:S`$4-x<2x+2$`},{w:"Umformen",t:S`$\mid +x\ \mid -2$ ergibt $2<3x$`},{w:"Durch 3 teilen",t:S`$\frac23<x$ bzw. $x>\frac23$`}],
       frei:{typ:"zahl",q:S`Auf welche Zahl kommt $x$ (die Grenze)? Teile $2$ durch $3$.`,answer:2/3,round:2,solTex:S`\frac23`}}]},
  ungrafisch:{titel:"Ungleichungen grafisch lösen",buch:"S. 23 · S. 24 Beispiel 2",
    text:S`Du kannst eine Ungleichung grafisch lösen: Fasse beide Seiten als Terme linearer Funktionen auf und zeichne die Graphen. Bestimme den Schnittpunkt und markiere die Schnittstelle auf der x-Achse. Liegt der Graph von $g$ <b>oberhalb</b> des Graphen von $h$, ist $g(x)>h(x)$.`,
    formel:S`g(x)>h(x)\;\Leftrightarrow\;\text{Graph von }g\text{ liegt oberhalb}`,
    merke:S`Oberhalb heißt größer, unterhalb heißt kleiner. Die Schnittstelle ist die Grenze der Lösungsmenge.`,
    falle:S`Ob die Grenze selbst dazugehört, entscheidet das Zeichen: $\le$ und $\ge$ ja, $<$ und $>$ nein.`,
    check:{q:S`Der Graph von $g$ liegt für $x<1$ oberhalb des Graphen von $h$. Was ist die Lösungsmenge von $g(x)>h(x)$?`,
      o:[S`$L=]-\infty;1[$`,S`$L=]1;\infty[$`,S`$L=[1;\infty[$`],
      h:"Wo ist g größer als h? Und gehört die Schnittstelle dazu?",
      e:S`Für $x<1$ ist $g(x)>h(x)$. Bei $>$ gehört die Grenze nicht dazu: $L=]-\infty;1[$.`},
    beispiele:[
      {titel:"Beispiel 1 · Schritt für Schritt",aufgabe:S`Werkzeugmiete: Anbieter A kostet $80$ € plus $10$ € je Stunde, Anbieter B $50$ € plus $15$ € je Stunde. Ab wann ist A günstiger?`,
       steps:[{w:"Kosten",t:S`$A(t)=80+10t$ und $B(t)=50+15t$`},{w:"Ungleichung",t:S`$A(t)<B(t)$, also $80+10t<50+15t$`},{w:"Umformen",t:S`$\mid -10t\ \mid -50$ ergibt $30<5t$`},{w:"Lösung",t:S`$t>6$: Ab mehr als $6$ Stunden ist A günstiger.`}]},
      {titel:"Beispiel 2 · die Grenze rechnest du",aufgabe:S`Ein Betrieb hat Kosten $K(x)=200+7x$ und Erlöse $E(x)=12x$. Ab wie vielen Stück entsteht Gewinn?`,
       steps:[{w:"Ungleichung",t:S`Gewinn heißt $E(x)>K(x)$, also $12x>200+7x$`},{w:"Umformen",t:S`$\mid -7x$ ergibt $5x>200$`},{w:"Durch 5 teilen",t:S`$x>40$`}],
       frei:{typ:"zahl",q:S`Wie groß ist die Grenze? Teile $200$ durch $5$.`,answer:40,solTex:"40"}}]}
};

/* ===================== Challenge 1: Lage von Geraden ===================== */
const M1=[-3,-2,-1,-0.5,0.5,1,2,3];
const T_={s:"Die Geraden schneiden sich in einem Punkt.",p:"Die Geraden sind parallel, aber nicht identisch.",i:"Die Geraden sind identisch.",o:"Die Geraden sind orthogonal zueinander."};
function lageBad(kind,orthOk){ const fb={s:{p:S`Die Steigungen sind verschieden. Dann kann es nicht parallel sein.`,i:S`Die Steigungen sind verschieden.`},p:{s:S`Die Steigungen sind gleich. Dann schneiden sich die Geraden nicht.`,i:S`Die y-Achsenabschnitte sind verschieden. Dann sind die Geraden nicht identisch.`},i:{s:S`Auch die Steigungen und die y-Achsenabschnitte sind gleich.`,p:S`Auch die y-Achsenabschnitte sind gleich. Dann liegen die Geraden aufeinander.`},o:{s:S`Das stimmt zwar, aber die Geraden schneiden sich sogar rechtwinklig. Wähle die genaueste Aussage.`,p:S`Die Steigungen sind verschieden. Dann können die Geraden nicht parallel sein.`,i:S`Die Steigungen sind verschieden. Dann können die Geraden nicht identisch sein.`}};
  const out=[]; ["s","p","i"].forEach(k=>{ if(k!==kind) out.push({t:T_[k],fb:fb[kind][k]}); }); if(kind!=="o") out.push({t:T_.o,fb:S`Orthogonal wäre $m_g\cdot m_h=-1$. Das ist hier nicht der Fall.`}); return out; }
function a1(){ const kind=one(["s","p","i"]), m1=one(M1), b1=one(BB); let m2=m1,b2=b1,h;
  if(kind==="s"){ m2=one(M1); if(near(m2,m1)||near(m1*m2,-1)) return null; b2=one(BB); h=LG("h",m2,b2); }
  else if(kind==="p"){ b2=one(BB); if(b2===b1) return null; h=LG("h",m2,b2); }
  else { const k=one(NZ0), c=R(b1-m1*k); if(c===0) return null; h=S`h\colon y=${psf(m1,-k,c)}`; }
  return mc(S`Wie liegen die Geraden $${LG("g",m1,b1)}$ und $${h}$ zueinander?`,T_[kind],lageBad(kind),
    kind==="s"?S`Die Steigungen $m_g=${tn(m1)}$ und $m_h=${tn(m2)}$ sind verschieden: Die Geraden schneiden sich.`:kind==="p"?S`Beide haben $m=${tn(m1)}$, aber $b_g=${tn(b1)}$ und $b_h=${tn(b2)}$ sind verschieden: parallel, nicht identisch.`:S`Multipliziert man $h$ aus, erhält man $y=${lin(m1,b1)}$. Das ist die Gerade $g$.`); }
function a2(){ const kind=one(["p","s","o"]); let m1,m2,b1,b2;
  if(kind==="o"){ [m1,m2]=one([[2,-0.5],[1,-1],[-2,0.5],[0.5,-2],[-1,1]]); b1=one([-3,-2,-1,0,1,2,3]); b2=one([-3,-2,-1,0,1,2,3]); }
  else { m1=one([-2,-1,-0.5,0.5,1,2]); b1=one([-3,-2,-1,0,1,2,3]); if(kind==="p"){ m2=m1; b2=b1+one([-3,-2,2,3]); if(abs(b2)>5) return null; } else { m2=one([-2,-1,-0.5,0.5,1,2]); if(near(m2,m1)||near(m1*m2,-1)) return null; b2=one([-3,-2,-1,0,1,2,3]); } }
  return mc("Wie liegen die beiden Geraden $g$ und $h$ zueinander? Wähle die genaueste Aussage.",T_[kind],lageBad(kind),
    kind==="o"?S`Die Steigungen $${tn(m1)}$ und $${tn(m2)}$ haben das Produkt $-1$: orthogonal.`:kind==="p"?S`Beide Geraden haben dieselbe Steigung, aber verschiedene y-Achsenabschnitte.`:S`Die Steigungen sind verschieden, das Produkt ist nicht $-1$: Die Geraden schneiden sich schräg.`,{viz:vizLines([{m:m1,b:b1},{m:m2,b:b2}],["g","h"])}); }
function a3(){ const kind=one(["s","p","i"]), m1=one([-3,-2,-1,1,2,3]), b1=one(BB); let m2=m1,b2=b1,hs,last,ex;
  if(kind==="s"){ m2=one([-3,-2,-1,1,2,3]); if(m2===m1) return null; b2=one(BB); const dm=m1-m2, db=b2-b1; last=`x=${fr(db,dm)}`; hs=lin(m2,b2); ex=S`$x$ kommt als Zahl heraus: Es gibt einen Schnittpunkt.`; }
  else if(kind==="p"){ b2=one(BB); if(b2===b1) return null; last=`${tn(b1)}=${tn(b2)}`; hs=lin(m2,b2); ex=S`Die Aussage $${last}$ ist falsch: Die Geraden sind parallel.`; }
  else { const k=one(NZ0), c=b1-m1*k; if(c===0) return null; last=`${tn(b1)}=${tn(b1)}`; hs=psf(m1,-k,c); ex=S`Die Aussage $${last}$ ist für alle $x$ wahr: Die Geraden sind identisch.`; }
  return mc(S`Beim Gleichsetzen von $g(x)=${lin(m1,b1)}$ und $h(x)=${hs}$ erhältst du zuletzt $${last}$. Wie liegen die Geraden?`,
    kind==="s"?"Die Geraden schneiden sich in einem Punkt.":kind==="p"?"Die Geraden sind parallel (die Aussage ist falsch).":"Die Geraden sind identisch (die Aussage ist für alle $x$ wahr).",
    [kind!=="s"?{t:"Die Geraden schneiden sich in einem Punkt.",fb:"Es kommt kein Wert für $x$ heraus."}:{t:"Die Geraden sind parallel (die Aussage ist falsch).",fb:"Es kommt ein Wert für $x$ heraus."},kind!=="p"?{t:"Die Geraden sind parallel (die Aussage ist falsch).",fb:"Eine falsche Aussage entsteht nur bei parallelen Geraden."}:{t:"Die Geraden sind identisch (die Aussage ist für alle $x$ wahr).",fb:"Die Aussage ist falsch, nicht allgemeingültig."},{t:"Die Geraden sind orthogonal.",fb:"Das lässt sich aus dem Gleichsetzen nicht ablesen. Es zählt $m_g\\cdot m_h$."}],ex); }
function a4(){ if(Math.random()<.5){ const m=one([0.5,-1.5,2,-0.75,1.25]), b=one(BB), x0=one([2,4,-2,-4]), y0=one(NZ0), bh=R(y0-m*x0);
    return MM.numInputTask({q:S`Die Gerade $g\colon y=${lin(m,b)}$ ist parallel zu $h$. Die Gerade $h$ geht durch $P(${tn(x0)}|${tn(y0)})$. Welchen y-Achsenabschnitt $b$ hat $h$?`,lab:"b=",answer:bh,wrong:[{v:b,fb:S`Das ist $b$ von $g$. Die Gerade $h$ geht durch $P$.`}],erkl:S`Parallel heißt $m_h=${tn(m)}$. Aus $${tn(y0)}=${pr(m)}\cdot ${pr(x0)}+b$ folgt $b=${tn(bh)}$.`}); }
  const mg=one([-0.375,0.75,-1.25,1.5,-2.5]);
  return MM.numInputTask({q:S`Für welche Steigung $m$ ist $h\colon y=mx+2$ parallel zu $g\colon y=${lin(mg,1)}$?`,lab:"m=",answer:mg,erkl:S`Parallele Geraden haben dieselbe Steigung: $m=m_g=${tn(mg)}$.`}); }
function a5(){ const kind=one(["s","p","i"]), B=4, m1=one([0.75,-0.75,0.5,-0.5,1.5,-1.5,1.25,-1.25]), A=-m1*B, b1=one([-3,-2,-1,1,2,3,4,5]), C=b1*B;
  let m2=m1,b2=b1; if(kind==="s"){ m2=one([0.75,-0.75,0.5,-0.5,1.5,-1.5,2,-2]); if(near(m2,m1)||near(m1*m2,-1)) return null; b2=one(BB); } else if(kind==="p"){ b2=one(BB); if(b2===b1) return null; }
  const g=S`g\colon ${B}y ${A<0?"-":"+"} ${tn(abs(A))}x = ${tn(C)}`;
  return mc(S`Wie liegen die Geraden $${g}$ und $${LG("h",m2,b2)}$ zueinander?`,T_[kind],lageBad(kind),S`Forme $g$ in die Hauptform um: $y=${lin(m1,b1)}$. Dann vergleiche Steigung und y-Achsenabschnitt mit $h$.`,{hint:"Tipp: Forme die Gleichung zuerst in die Hauptform der Geradengleichung um."}); }
/* --- Schnittpunkt --- */
function pickS(){ for(let k=0;k<200;k++){ const m1=one(NZ), m2=one(NZ), x0=one(NZ0), y0=one(NZ0); if(m1===m2) continue; const b1=y0-m1*x0, b2=y0-m2*x0; if(abs(b1)>10||abs(b2)>10) continue; return {m1,m2,x0,y0,b1,b2}; } return {m1:1,m2:-1,x0:2,y0:3,b1:1,b2:5}; }
function b1(){ const {m1,m2,x0,y0,b1,b2}=pickS();
  return MM.pairInputTask({q:S`Berechne den Schnittpunkt $S$ der Graphen von $g(x)=${lin(m1,b1)}$ und $h(x)=${lin(m2,b2)}$.`,ax:x0,ay:y0,erkl:S`Gleichsetzen: $${lin(m1,b1)}=${lin(m2,b2)}$ ergibt $x=${tn(x0)}$. Einsetzen in $g(x)$: $y=${tn(y0)}$.`}); }
function b2(){ for(let k=0;k<100;k++){ const m1=one(NZ), m2=one(NZ), c1=one(BB), c2=one(BB), dm=m1-m2, db=c2-c1; if(dm===0||db%dm===0) continue;
    return MM.numInputTask({q:S`Bei welcher Stelle $x$ schneiden sich die Graphen von $g(x)=${lin(m1,c1)}$ und $h(x)=${lin(m2,c2)}$?`,lab:"x=",answer:db/dm,round:2,erkl:S`Gleichsetzen: $${lin(m1,c1)}=${lin(m2,c2)}$, also $${tn(dm)}x=${tn(db)}$ und $x=${fr(db,dm)}$.`}); } return null; }
function b3(){ const {m1,m2,x0,y0,b1,b2}=pickS(); if(abs(x0)>4||abs(y0)>5||abs(b1)>5||abs(b2)>5) return null;
  const P=(x,y)=>`$S(${tn(x)}|${tn(y)})$`;
  return mc("Lies den Schnittpunkt $S$ der beiden Geraden ab.",P(x0,y0),[{t:P(y0,x0),fb:"Die Koordinaten sind vertauscht: erst $x$, dann $y$."},{t:P(-x0,y0),fb:"Das Vorzeichen der x-Koordinate stimmt nicht."},{t:P(x0,-y0),fb:"Das Vorzeichen der y-Koordinate stimmt nicht."}],S`Die Geraden $g(x)=${lin(m1,b1)}$ und $h(x)=${lin(m2,b2)}$ schneiden sich in $S(${tn(x0)}|${tn(y0)})$.`,{viz:vizLines([{m:m1,b:b1},{m:m2,b:b2}],["g","h"])}); }
function b4(){ const m=one([-3,-2,2,3]), x0=one(NZ0), y0=one(NZ0), c=x0-y0, b=y0-m*x0; if(abs(b)>10) return null;
  return MM.pairInputTask({q:S`Berechne den Schnittpunkt $S$ der Geraden $g\colon y=${lin(m,b)}$ und $h\colon x-y=${tn(c)}$.`,hint:"Tipp: Forme die Gleichung von h zuerst in die Hauptform um.",ax:x0,ay:y0,
    erkl:S`$h\colon y=x${" "+sgn(-c)}$. Gleichsetzen: $${lin(m,b)}=x${" "+sgn(-c)}$ ergibt $x=${tn(x0)}$ und $y=${tn(y0)}$.`}); }
function b5(){ for(let k=0;k<100;k++){ const m1=one(NZ), m2=one(NZ), c1=one(BB), c2=one(BB), dm=m1-m2, db=c2-c1; if(dm===0||db%dm===0) continue; const xs=fr(db,dm), ys=fr(m1*db+c1*dm,dm);
    return MM.selfCheckTask({q:S`Berechne den Schnittpunkt $S$ der Graphen von $g(x)=${lin(m1,c1)}$ und $h(x)=${lin(m2,c2)}$. Trage die x-Koordinate ein.`,lab:"x=",answer:db/dm,round:2,
      steps:[{w:"Gleichsetzen",t:S`$${lin(m1,c1)}=${lin(m2,c2)}$`,p:1},{w:"Nach $x$ auflösen",t:S`$${tn(dm)}x=${tn(db)}\ \Rightarrow\ x=${xs}$`,p:2},{w:"Einsetzen in $g(x)$",t:S`$y=${tn(m1)}\cdot ${db%dm?"\\left("+xs+"\\right)":xs}${" "+sgn(c1)}=${ys}$`,p:1},{w:"Antwortsatz",t:S`Der Schnittpunkt ist $S(${xs}|${ys})$.`,p:1}],satz:S`Die Geraden schneiden sich in $S(${xs}|${ys})$.`,erkl:S`Erst $x$ durch Gleichsetzen, dann $y$ durch Einsetzen.`}); } return null; }
/* --- Orthogonal, Winkelhalbierende, Schnittwinkel --- */
const PQ=[[1,2],[2,3],[3,4],[3,1],[1,3],[4,5],[2,1],[5,2],[3,2],[4,3]];
const mTex=(p,q)=>q===1?tn(p):(p<0?"-":"")+frac(abs(p),q);
function c1(){ const [p,q]=one(PQ), s=one([1,-1]), b=one(BB), P=s*p;
  return mc(S`Gegeben ist $g\colon y=${mTex(P,q)}x${" "+sgn(b)}$. Welche Steigung hat eine zu $g$ orthogonale Gerade $h$?`,`$m_h=${fr(-q,P)}$`,
    [{t:`$m_h=${fr(q,P)}$`,fb:S`Das ist der Kehrwert. Du musst auch das Vorzeichen wechseln.`},{t:`$m_h=${fr(-P,q)}$`,fb:S`Das ist nur das Vorzeichen gewechselt. Du brauchst auch den Kehrwert.`},{t:`$m_h=${fr(P,q)}$`,fb:S`Das ist die Steigung von $g$ selbst: Die Geraden wären parallel.`}],S`$m_g\cdot m_h=-1$, also $m_h=-\dfrac{1}{m_g}=${fr(-q,P)}$.`); }
function c2(){ const [p,q]=one(PQ), s=one([1,-1]), P=s*p, b=one(BB); if(q===1&&abs(P)===1) return null;
  return MM.numInputTask({q:S`Die Gerade $h$ ist orthogonal zu $g\colon y=${mTex(P,q)}x${" "+sgn(b)}$. Wie groß ist die Steigung $m_h$?`,lab:S`m_h=`,answer:-q/P,round:2,wrong:[{v:q/P,fb:S`Das ist nur der Kehrwert. Wechsle auch das Vorzeichen.`},{v:-P/q,fb:S`Das ist nur das Vorzeichen. Bilde auch den Kehrwert.`}],erkl:S`$m_h=-\dfrac{1}{m_g}=${fr(-q,P)}$.`}); }
function c3(){ const m=one([2,4,5,-2,-4]), k=one([-2,-1,1,2]), x0=m*k, y0=one(NZ0), b=one(BB), bh=y0+k, mh=R(-1/m); if(abs(bh)>9) return null;
  return MM.termInputTask({q:S`Bestimme die Gleichung der Geraden $h$, die zu $g\colon y=${lin(m,b)}$ orthogonal ist und durch $Q(${tn(x0)}|${tn(y0)})$ verläuft.`,prefix:S`h\colon y=`,fn:x=>mh*x+bh,form:"haupt",solTex:lin(mh,bh),hint:"Dezimalzahl oder Bruch ist beides erlaubt.",
    erkl:S`Orthogonal heißt $m_h=-\dfrac{1}{m_g}=${tn(mh)}$. Aus $${tn(y0)}=${pr(mh)}\cdot ${pr(x0)}+b$ folgt $b=${tn(bh)}$.`}); }
function c4a(){ const a=one([-3,-2,-1,1,2,4]), c=one([-3,-2,-1,1,2,3]);
  return mc(S`Welche Gerade ist orthogonal zur horizontalen Geraden $g\colon y=${tn(c)}$?`,`$x=${tn(a)}$`,[{t:`$y=${tn(-c)}$`,fb:"Das ist wieder eine horizontale Gerade, also parallel zu $g$."},{t:`$y=x${" "+sgn(c)}$`,fb:S`Diese Gerade hat die Steigung $1$. Sie schneidet $g$ nicht rechtwinklig.`},{t:`$y=${tn(a)}x$`,fb:S`Nur eine vertikale Gerade $x=a$ steht senkrecht auf einer horizontalen.`}],S`Eine vertikale Gerade $x=a$ ist orthogonal zu jeder horizontalen Geraden. Sie ist nicht Graph einer Funktion.`); }
function c4b(){ const w=one([1,2]);
  return mc(S`Wie lautet die Gleichung der ${w}. Winkelhalbierenden?`,w===1?"$y=x$":"$y=-x$",[{t:w===1?"$y=-x$":"$y=x$",fb:`Das ist die ${3-w}. Winkelhalbierende.`},{t:"$y=1$",fb:"Das ist eine horizontale Gerade."},{t:"$x=0$",fb:"Das ist die y-Achse."}],w===1?S`Die 1. Winkelhalbierende hat die Steigung $1$ und geht durch den Ursprung: $w_1\colon y=x$.`:S`Die 2. Winkelhalbierende hat die Steigung $-1$ und geht durch den Ursprung: $w_2\colon y=-x$.`); }
function c4c(){ const w=one([1,2]);
  return mc(S`Welche Steigung hat die ${w}. Winkelhalbierende?`,`$m=${w===1?1:-1}$`,[{t:`$m=${w===1?-1:1}$`,fb:`Das ist die Steigung der ${3-w}. Winkelhalbierenden.`},{t:"$m=0$",fb:"Das wäre eine horizontale Gerade."},{t:"$m=2$",fb:"Der Winkel zu den Achsen ist $45^\\circ$. Dann ist $|m|=\\tan 45^\\circ=1$."}],S`Die Winkelhalbierenden bilden $45^\circ$ mit der x-Achse: $\tan 45^\circ=1$.`); }
function c5(){ const L=[0.5,1,1.5,2,-0.5,-1,-1.5,-2,0.25,0.75]; const m1=one(L), m2=one(L); if(abs(m1-m2)<0.4||near(m1*m2,-1)) return null;
  const a1=Math.atan(m1)*180/Math.PI, a2=Math.atan(m2)*180/Math.PI; let d=abs(a1-a2); if(d>90) d=180-d; const r1=v=>Math.round(v*10)/10;
  return MM.selfCheckTask({q:S`Berechne den Schnittwinkel $\delta$ der Geraden $${LG("g",m1,0.5)}$ und $${LG("h",m2,-1)}$. Der Schnittwinkel ist der kleinere Winkel, $0^\circ\le\delta\le 90^\circ$. Trage $\delta$ in Grad ein (eine Nachkommastelle).`,lab:S`\delta=`,unit:"°",answer:d,tol:0.15,
    steps:[{w:"Steigungswinkel von $g$",t:S`$\alpha_g=\tan^{-1}(${tn(m1)})\approx ${tn(r1(a1))}^\circ$`,p:1},{w:"Steigungswinkel von $h$",t:S`$\alpha_h=\tan^{-1}(${tn(m2)})\approx ${tn(r1(a2))}^\circ$`,p:1},{w:"Schnittwinkel",t:S`$\delta=|\alpha_g-\alpha_h|\approx ${tn(r1(d))}^\circ$${abs(a1-a2)>90?" (größer als $90^\\circ$: $180^\\circ$ minus der Winkel)":""}`,p:2}],satz:S`Die Geraden schneiden sich unter dem Winkel $\delta\approx ${tn(r1(d))}^\circ$.`,erkl:S`Beide Steigungswinkel mit $\tan^{-1}$ bestimmen und den kleineren Winkel zwischen den Geraden nehmen.`}); }

/* ===================== Challenge 2: Ungleichungen ===================== */
function u1(){ const it=one([["kleiner als","<"],["kleiner oder gleich","\\le"],["größer als",">"],["größer oder gleich","\\ge"]]), all=[["<","<"],["\\le","≤"],[">",">"],["\\ge","≥"]];
  return mc(S`Welches Zeichen bedeutet „${it[0]}“?`,`$${it[1]}$`,all.map(x=>`$${x[0]}$`).filter(t=>t!==`$${it[1]}$`),S`„${it[0]}“ schreibt man $${it[1]}$.`,{keepOrder:false}); }
function simpleI(){ const t=one(["a","b","c"]); let a=1,b=0,c=0,d,rel=one(RELS);
  if(t==="a"){ b=one([-6,-3,-2,2,3,5,7]); d=one([-5,-2,1,4,5,8]); } else if(t==="b"){ b=one([-5,-3,3,4,6]); d=one([-4,-1,2,6,9]); } else { a=one([2,3,4,5]); d=a*one([-3,-2,2,3,4]); }
  return {a,b,c,d,rel,sol:solveI(a,b,rel,c,d)}; }
function u2(){ const {a,b,c,d,rel,sol}=simpleI(), s=sol;
  const f=(r,v)=>`$${E.lsgTex(r,v)}$`;
  return mc(S`Welche Lösungsmenge hat die Ungleichung $${ineqS(a,b,rel,c,d)}$?`,f(s.rel,s.bound),[{t:f(FL[s.rel],s.bound),fb:"Das Zeichen zeigt in die falsche Richtung."},{t:f(s.rel,-s.bound),fb:"Die Grenze hat das falsche Vorzeichen."},{t:f(s.rel.length===2?s.rel[0]:s.rel+"=",s.bound),fb:"Prüfe, ob die Grenze selbst dazugehört."}],S`$${ineqS(a,b,rel,c,d)}$ ergibt $${E.ineqTex(s.rel,s.bound)}$, also $${E.lsgTex(s.rel,s.bound)}$.`); }
function u3(){ const {a,b,c,d,rel,sol}=simpleI();
  return MM.ineqInputTask({q:S`Löse die Ungleichung $${ineqS(a,b,rel,c,d)}$.`,rel:sol.rel,bound:sol.bound,round:2,erkl:S`Äquivalenzumformung: $${E.ineqTex(sol.rel,sol.bound)}$.`}); }
function u4(){ const rel=one(RELS), b=one([-4,-3,-1,2,5]), up=rel[0]===">", cl=rel.length===2, I=(u,c,v)=>u?(c?"[":"]")+tn(v)+";\\infty[":"]-\\infty;"+tn(v)+(c?"]":"[");
  return mc(S`Die Lösungsmenge ist $L=\{x\in\R\mid x${RT[rel]}${tn(b)}\}$. Welche Schreibweise als Intervall ist richtig?`,`$L=${I(up,cl,b)}$`,[{t:`$L=${I(!up,cl,b)}$`,fb:"Das Intervall geht in die falsche Richtung."},{t:`$L=${I(up,!cl,b)}$`,fb:"Die eckige Klammer heißt: Die Grenze gehört dazu. Eine nach außen offene Klammer heißt: nicht dazu."},{t:`$L=${I(!up,!cl,b)}$`,fb:"Weder die Richtung noch die Klammer passt."}],S`$x${RT[rel]}${tn(b)}$ entspricht $L=${I(up,cl,b)}$.`); }
function u5(){ const {a,b,c,d,rel,sol}=simpleI(); const B=Math.round(sol.bound); if(!Number.isInteger(sol.bound)) return null; const r=sol.rel, up=r[0]===">", cl=r.length===2;
  const inN=[],outN=[]; for(let k=-3;k<=3;k++){ const n=B+k; const inside=up?(cl?n>=sol.bound:n>sol.bound):(cl?n<=sol.bound:n<sol.bound); (inside?inN:outN).push(n); }
  if(inN.length<1||outN.length<3) return null; const good=one(inN), bad=shuffle(outN).slice(0,3);
  return mc(S`Welche Zahl gehört zur Lösungsmenge von $${ineqS(a,b,rel,c,d)}$?`,`$x=${tn(good)}$`,bad.map(n=>({t:`$x=${tn(n)}$`,fb:`Setze ${ts(n)} in die Ungleichung ein: Die Aussage stimmt nicht.`})),S`Die Lösung ist $${E.ineqTex(r,sol.bound)}$. Nur $${tn(good)}$ erfüllt sie.`); }
function v1(){ for(let k=0;k<100;k++){ const a=one([-3,-2,-1,1,2,3,4]), c=one([-2,-1,1,2,3]), b=one(NZ0), d=one(NZ0), rel=one(RELS); if(a===c) continue; const s=solveI(a,b,rel,c,d), A=a-c, B=d-b;
    return MM.ineqInputTask({q:S`Löse die Ungleichung $${ineqS(a,b,rel,c,d)}$.`,rel:s.rel,bound:s.bound,round:2,flip:s.flip,erkl:S`Zusammenfassen: $${co(A)}x${RT[rel]}${tn(B)}$. ${s.flip?"Division durch die negative Zahl "+tn(A)+" dreht das Zeichen um: ":"Division durch "+tn(A)+": "}$${E.ineqTex(s.rel,s.bound)}$.`}); } return null; }
function v2(){ const k=one([-2,-3,-4,-5]), x0=one([-4,-3,-2,2,3,4]), rel=one(RELS), d=k*x0, fl=FL[rel];
  return mc(S`Tim löst $${tn(k)}x${RT[rel]}${tn(d)}$ und schreibt $x${RT[rel]}${tn(x0)}$. Was hat er falsch gemacht?`,"Er hat das Ungleichheitszeichen nicht umgedreht.",[{t:"Er hat falsch addiert.",fb:"Hier wird nicht addiert, sondern durch eine Zahl geteilt."},{t:"Er hat durch die falsche Zahl geteilt.",fb:S`Die Grenze $${tn(x0)}$ ist richtig.`},{t:"Er hat nichts falsch gemacht.",fb:S`Beim Teilen durch eine negative Zahl muss das Zeichen umgedreht werden.`}],S`Richtig ist $x${RT[fl]}${tn(x0)}$, denn beim Dividieren durch die negative Zahl $${tn(k)}$ wird das Zeichen umgedreht.`); }
function v3(){ const k=one([1,2,3,5]), b=one([-3,4,6,8,10,18]), d=one([-7,-4,-1,2,5]), rel=one(RELS), s=solveI(-k,b,rel,0,d);
  return MM.ineqInputTask({q:S`Löse die Ungleichung $${ineqS(-k,b,rel,0,d)}$.`,rel:s.rel,bound:s.bound,round:2,flip:true,erkl:S`$${tn(-k)}x${RT[rel]}${tn(d-b)}$. Division durch $${tn(-k)}$ dreht das Zeichen um: $${E.ineqTex(s.rel,s.bound)}$.`}); }
function v4(){ for(let k=0;k<100;k++){ const p=one([2,3,-2,-3]), r=one([-2,-1,1,2,3]), a=one(NZ0), q=one([-3,-1,1,2,4]), s=one([-4,-2,1,3,5]), rel=one(RELS); if(p===r) continue; const so=solveI(p,p*a-q,rel,r,s);
    return MM.ineqInputTask({q:S`Löse die Ungleichung $${tn(p)}(x ${a<0?"-":"+"} ${abs(a)}) ${sgn(-q)} ${RT[rel]} ${lin(r,s)}$.`,rel:so.rel,bound:so.bound,round:2,flip:so.flip,erkl:S`Ausmultiplizieren: $${lin(p,p*a-q)}${RT[rel]}${lin(r,s)}$. Zusammenfassen: $${co(p-r)}x${RT[rel]}${tn(s-p*a+q)}$. Ergebnis: $${E.ineqTex(so.rel,so.bound)}$.`}); } return null; }
function v5(){ for(let k=0;k<100;k++){ const a=one([-3,-2,2,3,4]), c=one([-2,-1,1,2]), b=one(NZ0), d=one(NZ0), rel=one(RELS); if(a===c) continue; const s=solveI(a,b,rel,c,d), A=a-c, B=d-b;
    return MM.selfCheckTask({q:S`Löse die Ungleichung $${ineqS(a,b,rel,c,d)}$ und gib die Lösungsmenge $L$ an. Trage die Grenze ein (Bruch oder gerundet).`,lab:"Grenze =",answer:s.bound,round:2,
      steps:[{w:"Zusammenfassen",t:S`$${co(A)}x${RT[rel]}${tn(B)}$`,p:1},{w:`Durch ${ts(A)} teilen`,t:s.flip?S`Division durch eine negative Zahl: Zeichen umdrehen!`:S`Division durch eine positive Zahl: Das Zeichen bleibt.`,p:2},{w:"Lösung",t:`$${E.ineqTex(s.rel,s.bound)}$`,p:1},{w:"Lösungsmenge",t:`$${E.lsgTex(s.rel,s.bound)}$`,p:1}],satz:`$${E.lsgTex(s.rel,s.bound)}$`,erkl:S`Beim Teilen durch eine negative Zahl wird das Zeichen umgedreht.`}); } return null; }
function w1(){ const mf=one([-2,-1,1,2,3]), mg=one([-2,-1,1,2,3]); if(mf===mg) return null; const x0=one([-3,-2,-1,1,2,3]), y0=one([-3,-2,-1,0,1,2,3]), bf=y0-mf*x0, bg=y0-mg*x0; if(abs(bf)>5||abs(bg)>5) return null;
  const rel=mf>mg?">":"<"; const t=r=>`$x${RT[r]}${tn(x0)}$`;
  return mc(S`Für welche $x$ liegt der Graph von $f$ oberhalb des Graphen von $g$? Gib die Lösung von $f(x)>g(x)$ an.`,t(rel),[{t:t(FL[rel]),fb:"Das ist der Bereich, in dem $f$ unterhalb von $g$ liegt."},{t:t(rel+"="),fb:"An der Schnittstelle sind die Funktionswerte gleich. Bei $>$ gehört sie nicht dazu."},{t:t(FL[rel]+"="),fb:"Falsche Richtung und die Grenze gehört nicht dazu."}],S`Die Graphen schneiden sich bei $x=${tn(x0)}$. Rechts davon liegt der Graph mit der größeren Steigung oben.`,{viz:vizLines([{m:mf,b:bf},{m:mg,b:bg}],["f","g"])}); }
function w2(){ const a=one([-3,-2,2,3]), b=one([-6,-4,-2,1,3]), c=one([-5,-3,-1,2,4]); if(b===c) return null; const rel=one(RELS), tv=rel==="<"?b<c:rel==="<="?b<=c:rel===">"?b>c:b>=c;
  const GA="Die Ungleichung ist allgemeingültig: $L=\\R$.", UN="Die Ungleichung ist unlösbar: $L=\\{\\}$.";
  return mc(S`Bestimme die Lösungsmenge von $${ineqS(a,b,rel,a,c)}$. Ist die Ungleichung allgemeingültig oder unlösbar?`,tv?GA:UN,[tv?{t:UN,fb:S`Nach dem Subtrahieren von $${tn(a)}x$ bleibt $${tn(b)}${RT[rel]}${tn(c)}$. Diese Aussage ist wahr.`}:{t:GA,fb:S`Nach dem Subtrahieren von $${tn(a)}x$ bleibt $${tn(b)}${RT[rel]}${tn(c)}$. Diese Aussage ist falsch.`},{t:"Die Lösungsmenge ist $L=]0;\\infty[$.",fb:"Das $x$ fällt beim Umformen ganz weg."},{t:"Die Lösungsmenge ist $L=\\{0\\}$.",fb:"Das $x$ fällt beim Umformen ganz weg."}],S`Auf beiden Seiten steht $${tn(a)}x$. Es bleibt $${tn(b)}${RT[rel]}${tn(c)}$. Diese Aussage ist ${tv?"für alle $x$ wahr":"nie wahr"}.`); }
function w3(){ const thing=one(["Eine Hebebühne","Ein Gerüst","Ein Gabelstapler"]), G2=one([40,50,60]), dk=one([5,8,10]), k1=one([8,10,12]), t0=one([3,4,5,6,8]), G1=G2+dk*t0, k2=k1+dk;
  return MM.ineqInputTask({q:S`${thing} wird bei zwei Vermietern angeboten. Vermieter A: $${G1}$ € Grundgebühr und $${k1}$ € je Stunde. Vermieter B: $${G2}$ € Grundgebühr und $${k2}$ € je Stunde. Für welche Mietdauer $t$ (in Stunden) ist A günstiger? Löse $${G1}+${k1}t<${G2}+${k2}t$.`,v:"t",rel:">",bound:t0,
    erkl:S`$${G1}+${k1}t<${G2}+${k2}t\ \mid -${k1}t\ \mid -${G2}$ ergibt $${G1-G2}<${dk}t$, also $t>${t0}$. Ab mehr als ${t0} Stunden ist A günstiger.`}); }
function w4(){ const N=one([60,80,100]), a=one([1.5,2.5,3.5]), da=one([0.5,1]), b=R(a+da), xm=one([20,24,30,36,40]), Bu=R(a*N+da*xm);
  return MM.numInputTask({q:S`Für eine Schaltung werden $${N}$ Bauteile gebraucht. Ein Bauteil vom Typ A kostet $${tn(a)}$ €, eines vom Typ B kostet $${tn(b)}$ €. Das Budget beträgt $${tn(Bu)}$ €. Wie viele Bauteile vom Typ B darf man höchstens kaufen?`,lab:"höchstens",unit:"Stück",answer:xm,
    erkl:S`Mit $x$ Bauteilen vom Typ B: $${tn(a)}(${N}-x)+${tn(b)}x\le ${tn(Bu)}$. Das ergibt $${tn(da)}x\le ${tn(R(Bu-a*N))}$ und $x\le ${xm}$.`}); }
function w5(){ const F=one([3000,4000,5000]), v=one([200,230,250]), p=v+one([100,120,150]), th=F/(p-v), xmin=Math.floor(th)+1, ts_=fr(F,p-v);
  return MM.selfCheckTask({q:S`Ein Hersteller hat fixe Kosten von $${F}$ €. Jedes Stück kostet $${v}$ € in der Herstellung und wird für $${p}$ € verkauft. Ab wie vielen verkauften Stück macht er Gewinn? Trage die kleinste ganze Stückzahl ein.`,lab:"ab",unit:"Stück",answer:xmin,
    steps:[{w:"Gewinn ansetzen",t:S`$${p}x>${F}+${v}x$`,p:1},{w:"Umformen",t:S`$${p-v}x>${F}\ \Rightarrow\ x>${ts_}$`,p:2},{w:"Ganze Zahl",t:S`Die kleinste ganze Zahl über $${tn(R(th))}$ ist ${xmin}.`,p:1}],satz:S`Ab ${xmin} verkauften Stück macht der Hersteller Gewinn.`,erkl:S`Gewinn heißt Erlös größer als Kosten. Das Ergebnis muss eine ganze Stückzahl sein.`}); }

/* ===================== Challenges ===================== */
const G=(f,steck)=>({g:f,steck}), alt=(...fs)=>()=>one(fs)();
const CH_LAGE={titel:"Lage von Geraden",art:"Parallel, identisch, schneidend, orthogonal",kurz:"Lage bestimmen, Schnittpunkt und Schnittwinkel berechnen.",
  intro:S`Zwei Geraden können sich schneiden, identisch oder parallel sein. Du bestimmst ihre Lage, berechnest den Schnittpunkt durch Gleichsetzen und prüfst, ob die Geraden orthogonal sind.`,
  levels:[{name:"Lage erkennen",info:"Parallel, identisch oder schneidend, am Term und im Graphen.",gens:[G(a1,"lage"),G(a2,"lage"),G(a3,"lage"),G(a4,"lage"),G(a5,"lage")]},
          {name:"Schnittpunkt",info:"Gleichsetzen und Einsetzen, auch aus dem Graphen.",gens:[G(b1,"schnitt"),G(b2,"schnitt"),G(b3,"schnitt"),G(b4,"schnitt"),G(b5,"schnitt")]},
          {name:"Orthogonal und Schnittwinkel",info:"Orthogonale Geraden, Winkelhalbierende, Schnittwinkel $\\delta$.",gens:[G(c1,"orth"),G(c2,"orth"),G(c3,"orth"),G(alt(c4a,c4b,c4c),"orth"),G(c5,"orth")]}]};
const CH_UNGL={titel:"Ungleichungen",art:"Lösen und Lösungsmenge angeben",kurz:"Ungleichungen umformen, Lösungsmenge angeben, Anwendungen.",
  intro:S`Du löst Ungleichungen durch Äquivalenzumformungen und gibst die Lösungsmenge an. Bei Multiplikation oder Division mit einer negativen Zahl wird das Ungleichheitszeichen umgedreht.`,
  levels:[{name:"Zeichen und Lösungsmenge",info:"Ungleichheitszeichen, einfache Ungleichungen, Schreibweisen.",gens:[G(u1,"unglei"),G(u2,"unglei"),G(u3,"unglei"),G(u4,"unglei"),G(u5,"unglei")]},
          {name:"Äquivalenzumformungen",info:"Beide Seiten umformen, Zeichen umdrehen.",gens:[G(v1,"unglei"),G(v2,"unglei"),G(v3,"unglei"),G(v4,"unglei"),G(v5,"unglei")]},
          {name:"Grafisch und im Alltag",info:"Graphen vergleichen, allgemeingültig oder unlösbar, Sachaufgaben.",gens:[G(w1,"ungrafisch"),G(w2,"ungrafisch"),G(w3,"ungrafisch"),G(w4,"ungrafisch"),G(w5,"ungrafisch")]}]};

MM.addKapitel("k4",{steckOrder:["lage","schnitt","orth","unglei","ungrafisch"],steckbriefe,challOrder:["lage","ungl"],
  challenges:{lage:CH_LAGE,ungl:CH_UNGL},
  braucht:{lage:["lage","schnitt","orth"],ungl:["unglei","ungrafisch"]}});
})();
