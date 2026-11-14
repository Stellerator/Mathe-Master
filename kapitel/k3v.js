/* Kapitel 3 · Vertiefung: Lineare Funktionen
   Punkt-Steigungs-Form · Gleichungsformen und Hauptform · Linear oder nicht? · Steigung in Prozent
   Neues Level-Format (gens): zweiter Versuch, Übung nach Fehlern, Fehlersteckbrief.
   Schreibweise durchgehend f(x)=… */
(function(){
"use strict";
const MM=window.MM, S=String.raw;
const {shuffle,one,ri,T,tn,ts,el}=MM;
const near=(a,b)=>Math.abs(a-b)<1e-9;
const R=v=>Math.round(v*1e6)/1e6;
const NZ=[-3,-2,-1,1,2,3], NZ0=[-4,-3,-2,-1,1,2,3,4], BIG=[-3,-2,2,3];
const abs=Math.abs;

/* ---------- Schreibweisen (TeX) ---------- */
const co=m=>m===1?"":m===-1?"-":tn(m);
const sgn=v=>v<0?`- ${tn(-v)}`:`+ ${tn(v)}`;
const lin=(m,b)=>m===0?tn(b):`${co(m)}x${b===0?"":" "+sgn(b)}`;
const br=x1=>x1>=0?`(x - ${tn(x1)})`:`(x + ${tn(-x1)})`;
const psf=(m,x1,y1)=>`${abs(m)===1?(m<0?"-":""):tn(m)+S`\cdot `}${br(x1)} ${sgn(y1)}`;
const fnL=(m,b)=>x=>m*x+b;
const P_=(x,y)=>`P(${tn(x)}|${tn(y)})`;

/* ---------- Bausteine ---------- */
function mc(q,good,bad,erkl,o){ const seen=new Set([good]); const opts=[{t:good,ok:true}];
  for(const b of shuffle(bad)){ const t=typeof b==="string"?b:b.t; if(seen.has(t)) continue; seen.add(t); opts.push({t,fb:b.fb}); if(opts.length>=4) break; }
  if(opts.length<3) return null; return MM.mcTask(Object.assign({q,opts,erkl},o||{})); }
function tabViz(xs,ys,o){ o=o||{}; return api=>{ if(o.text) api.situation(T(o.text),o.label||"Messreihe");
  api.viz.appendChild(el("div",{class:"situ"},`<span class="eyebrow">Wertetabelle</span>${MM.tableHtml(xs,ys,{xh:o.xh||"x",yh:o.yh||"f(x)"})}`)); return null; }; }
const eqNum=(a,b)=>near(a,b);
const frac=(p,q)=>`\\frac{${p}}{${q}}`;
const gcd=(a,b)=>b?gcd(b,a%b):a;
const fr=(p,q)=>{ const g=gcd(abs(p),abs(q))||1; p/=g; q/=g; if(q<0){ p=-p; q=-q; } return q===1?tn(p):(p<0?"-":"")+frac(abs(p),q); };
const pr=v=>v<0?`(${tn(v)})`:tn(v);
const LIN_OK="Die Änderung von $y$ pro $x$-Schritt ist überall gleich.";

/* ============================ Steckbriefe ============================ */
const steckbriefe={
  psf:{titel:"Punkt-Steigungs-Form",
    text:S`Kennst du die Steigung $m$ und einen Punkt $P(x_1|y_1)$ der Geraden, kannst du den Term sofort hinschreiben, ohne $b$ auszurechnen. Die Punkt-Steigungs-Form lautet $f(x)=m\cdot(x-x_1)+y_1$. Für die Hauptform multiplizierst du die Klammer aus und fasst zusammen.`,
    formel:S`f(x)=m\cdot(x-x_1)+y_1`,
    merke:S`In der Klammer steht $x$ <b>minus</b> die x-Koordinate des Punktes. Hinten wird die y-Koordinate addiert.`,
    falle:S`Das Vorzeichen von $x_1$ dreht sich: Für $P(-2|3)$ steht in der Klammer $(x+2)$, nicht $(x-2)$.`,
    check:{q:S`Eine Gerade hat die Steigung $m=2$ und geht durch $P(3|1)$. Wie lautet die Punkt-Steigungs-Form?`,
      o:[S`$f(x)=2\cdot(x-3)+1$`,S`$f(x)=2\cdot(x+3)+1$`,S`$f(x)=2\cdot(x-1)+3$`],
      h:"In die Klammer kommt x minus die x-Koordinate, hinten die y-Koordinate.",
      e:S`Mit $x_1=3$ und $y_1=1$ ergibt sich $f(x)=2\cdot(x-3)+1$.`},
    beispiele:[
      {titel:"Beispiel 1 · Schritt für Schritt",aufgabe:S`Eine Gerade hat die Steigung $m=3$ und geht durch $P(2|5)$. Gib die Hauptform an.`,
       steps:[{w:"Werte lesen",t:S`$m=3$, $x_1=2$, $y_1=5$`},{w:"Punkt-Steigungs-Form",t:S`$f(x)=3\cdot(x-2)+5$`},{w:"Ausmultiplizieren",t:S`$f(x)=3x-6+5$`},{w:"Zusammenfassen",t:S`$f(x)=3x-1$`},{w:"Probe",t:S`$f(2)=3\cdot 2-1=5$ ✓`}]},
      {titel:"Beispiel 2 · den letzten Schritt schreibst du",aufgabe:S`Eine Gerade hat die Steigung $m=-2$ und geht durch $P(-1|4)$. Gib die Hauptform an.`,
       steps:[{w:"Werte lesen",t:S`$m=-2$, $x_1=-1$, $y_1=4$`},{w:"Punkt-Steigungs-Form",t:S`$f(x)=-2\cdot(x+1)+4$`},{w:"Ausmultiplizieren",t:S`$f(x)=-2x-2+4$`},{w:"Hauptform",t:S`$f(x)=-2x+2$`}],
       frei:{typ:"term",q:S`Schreibe die Hauptform hin.`,prefix:"f(x)=",fn:x=>-2*x+2,solTex:"-2x+2"}}]},
  form:{titel:"Gleichungsformen und Hauptform",
    text:S`Dieselbe Gerade kann verschieden aufgeschrieben sein: mit Klammer, als Bruch oder als Gleichung $ax+by=c$. Die Hauptform $f(x)=m\cdot x+b$ bekommst du durch Ausmultiplizieren und Zusammenfassen, bei $ax+by=c$ durch Auflösen nach $y$. Dann liest du $m$ und $b$ sofort ab.`,
    formel:S`ax+by=c\;\Rightarrow\;f(x)=-\tfrac{a}{b}x+\tfrac{c}{b}`,
    merke:S`Klammer ausmultiplizieren, Gleichartiges zusammenfassen. Bei $ax+by=c$: zuerst $ax$ auf die andere Seite, dann <b>alles</b> durch $b$ teilen.`,
    falle:S`Beim Ausmultiplizieren wird <b>jedes</b> Glied der Klammer mit $m$ multipliziert, nicht nur das $x$.`,
    check:{q:S`Welche Hauptform hat $f(x)=2\cdot(x-3)+1$?`,
      o:[S`$f(x)=2x-5$`,S`$f(x)=2x-2$`,S`$f(x)=2x-3$`],
      h:"Multipliziere die Klammer aus: 2·x und 2·(−3). Dann +1 zusammenfassen.",
      e:S`$2\cdot(x-3)+1=2x-6+1=2x-5$.`},
    beispiele:[
      {titel:"Beispiel 1 · Klammer, Schritt für Schritt",aufgabe:S`Forme $f(x)=3\cdot(x-2)+4$ in die Hauptform um.`,
       steps:[{w:"Ausmultiplizieren",t:S`$f(x)=3x-3\cdot 2+4$`},{w:"Rechnen",t:S`$f(x)=3x-6+4$`},{w:"Zusammenfassen",t:S`$f(x)=3x-2$`},{w:"Ablesen",t:S`$m=3$ und $b=-2$`}]},
      {titel:"Beispiel 2 · Gleichung $3x-2y=6$, den letzten Schritt schreibst du",aufgabe:S`Löse $3x-2y=6$ nach $y$ auf und gib $f(x)$ an.`,
       steps:[{w:"$3x$ auf die andere Seite",t:S`$-2y=-3x+6$`},{w:"Durch $-2$ teilen (alle Glieder!)",t:S`$y=\frac{-3x}{-2}+\frac{6}{-2}$`},{w:"Hauptform",t:S`$f(x)=1{,}5x-3$`}],
       frei:{typ:"term",q:S`Schreibe die Hauptform hin. Ein Bruch wie $\frac32x-3$ geht auch.`,prefix:"f(x)=",fn:x=>1.5*x-3,solTex:"1,5x-3"}}]},
  lin:{titel:"Linear oder nicht?",
    text:S`Eine Wertetabelle gehört zu einer linearen Funktion, wenn sich $y$ bei gleich großem $x$-Schritt immer um denselben Betrag ändert. Rechne für Nachbarwerte $\dfrac{\Delta y}{\Delta x}$. Kommt immer dasselbe heraus, ist die Funktion linear und dieser Wert ist die Steigung $m$.`,
    formel:S`\frac{\Delta y}{\Delta x}\ \text{überall gleich}\;\Rightarrow\;\text{linear}`,
    merke:S`Gleiche Steigung zwischen allen Nachbarn: linear. Ein einziger Ausreißer reicht: nicht linear.`,
    falle:S`Wachsen die $y$-Werte nur immer weiter, ist das noch nicht linear. Und bei ungleichen $x$-Schritten musst du durch $\Delta x$ teilen.`,
    check:{q:S`Eine Tabelle hat $x=0;1;2;3$ und $y=1;3;5;8$. Ist sie linear?`,
      o:[S`Nein. $y$ wächst erst um 2, dann um 3.`,S`Ja. $y$ wächst immer.`,S`Ja. $x$ wächst immer um 1.`],
      h:"Berechne, um wie viel y bei jedem Schritt wächst.",
      e:S`Die Änderungen sind $2$, $2$ und $3$. Sie sind nicht gleich, also ist die Tabelle nicht linear.`},
    beispiele:[
      {titel:"Beispiel 1 · Schritt für Schritt",aufgabe:S`$x=0;2;4;6$ und $y=1;5;9;13$. Ist die Tabelle linear? Wie lautet der Term?`,
       steps:[{w:"Erstes Paar",t:S`$\dfrac{5-1}{2-0}=2$`},{w:"Zweites Paar",t:S`$\dfrac{9-5}{4-2}=2$`},{w:"Drittes Paar",t:S`$\dfrac{13-9}{6-4}=2$`},{w:"Urteil",t:S`Überall $2$: linear mit $m=2$.`},{w:"Term",t:S`Bei $x=0$ ist $y=1$, also $f(x)=2x+1$.`}]},
      {titel:"Beispiel 2 · ungleiche Schritte, die Steigung rechnest du",aufgabe:S`$x=1;2;4$ und $y=3;5;9$. Ist die Tabelle linear?`,
       steps:[{w:"Erstes Paar",t:S`$\dfrac{5-3}{2-1}=2$`},{w:"Zweites Paar",t:S`$\dfrac{9-5}{4-2}=2$`},{w:"Urteil",t:S`Beide Male gleich: linear, obwohl die $x$-Schritte verschieden sind.`}],
       frei:{typ:"zahl",q:S`Wie groß ist die Steigung $m$?`,answer:2,solTex:"2"}}]},
  proz:{titel:"Steigung in Prozent",
    text:S`Eine Steigung von $15\,\%$ bedeutet: Auf 100 m <b>waagerecht</b> geht es 15 m nach oben. Das ist $m=\frac{15}{100}=0{,}15$. Ein Gefälle hat eine negative Steigung. Prozent und Steigung wandelst du so um: $m=\frac{p}{100}$ und $p=m\cdot 100$.`,
    formel:S`m=\frac{p}{100},\qquad p=\frac{\Delta y}{\Delta x}\cdot 100`,
    merke:S`Steigung in Prozent: Höhenunterschied geteilt durch die <b>waagerechte</b> Strecke, mal 100.`,
    falle:S`Die Strecke ist waagerecht gemessen, nicht die Länge der Fahrbahn. Und nicht vergessen, durch 100 zu teilen.`,
    check:{q:S`Eine Straße hat $8\,\%$ Steigung. Wie viel Höhe sind das auf 250 m waagerecht?`,
      o:[S`$20\ \text{m}$`,S`$8\ \text{m}$`,S`$200\ \text{m}$`],
      h:"8 % heißt m = 0,08. Rechne 0,08 · 250.",
      e:S`$m=0{,}08$, also $\Delta y=0{,}08\cdot 250=20$ m.`},
    beispiele:[
      {titel:"Beispiel 1 · Schritt für Schritt",aufgabe:S`Eine Rampe überwindet 3 m Höhe auf 50 m waagerecht. Welche Steigung in Prozent?`,
       steps:[{w:"Steigung",t:S`$m=\dfrac{3}{50}=0{,}06$`},{w:"In Prozent",t:S`$0{,}06\cdot 100=6$`},{w:"Antwort",t:S`Die Rampe hat $6\,\%$ Steigung.`}]},
      {titel:"Beispiel 2 · den letzten Schritt rechnest du",aufgabe:S`Eine Straße hat $12\,\%$ Gefälle. Wie viel Höhe geht auf 150 m waagerecht verloren?`,
       steps:[{w:"Steigung",t:S`$m=-\dfrac{12}{100}=-0{,}12$`},{w:"Strecke",t:S`$\Delta x=150$ m`},{w:"Höhenänderung",t:S`$\Delta y=-0{,}12\cdot 150=-18$ m`}],
       frei:{typ:"zahl",q:S`Wie groß ist $\Delta y$ in m? Setze $-0{,}12\cdot 150$ ein.`,answer:-18,solTex:"-18",unit:"m"}}]}
};
/* Beispiel 2 von „proz“: der letzte Schritt fehlt, deshalb steht die Antwort nicht in steps */
steckbriefe.proz.beispiele[1].steps=steckbriefe.proz.beispiele[1].steps.slice(0,2).concat([{w:"Höhenänderung",t:S`$\Delta y=-0{,}12\cdot 150=-18$ m, also 18 m <b>tiefer</b>.`}]);

/* ===================== Challenge 1: Punkt-Steigungs-Form ===================== */
const pt=()=>{ const m=one(NZ), x1=one(NZ0), y1=one(NZ0); return {m,x1,y1,b:y1-m*x1}; };
function p1(){ const {m,x1,y1}=pt();
  return mc(S`Eine Gerade hat die Steigung $m=${tn(m)}$ und geht durch $${P_(x1,y1)}$. Welche Punkt-Steigungs-Form passt?`,`$f(x)=${psf(m,x1,y1)}$`,
    [{t:`$f(x)=${psf(m,-x1,y1)}$`,fb:S`Das Vorzeichen von $x_1$ stimmt nicht: In der Klammer steht $x-x_1$.`},{t:`$f(x)=${psf(m,x1,-y1)}$`,fb:S`Das Vorzeichen von $y_1$ stimmt nicht: Hinten wird $y_1$ addiert.`},{t:`$f(x)=${psf(m,y1,x1)}$`,fb:S`$x_1$ und $y_1$ sind vertauscht.`}],
    S`Aus $m=${tn(m)}$ und $${P_(x1,y1)}$ wird $f(x)=m\cdot(x-x_1)+y_1=${psf(m,x1,y1)}$.`); }
function p2(){ const {m,x1,y1}=pt();
  return MM.numInputTask({q:S`Aus $f(x)=${psf(m,x1,y1)}$ liest du einen Punkt $P(x_1|y_1)$ ab. Wie heißt $x_1$?`,lab:"x_1=",answer:x1,
    wrong:[{v:-x1,fb:S`Achtung beim Vorzeichen: In der Klammer steht $x-x_1$. Steht dort $x+3$, ist $x_1=-3$.`}],erkl:S`Die Klammer ${x1>=0?"$(x-"+tn(x1)+")$":"$(x+"+tn(-x1)+")$"} bedeutet $x-(${tn(x1)})$. Also ist $x_1=${tn(x1)}$.`}); }
function p3(){ const {m,x1,y1}=pt(); const t=x1+one([-3,-2,-1,1,2,3]); const ans=m*(t-x1)+y1;
  return MM.numInputTask({q:S`Gegeben ist $f(x)=${psf(m,x1,y1)}$. Berechne $f(${tn(t)})$.`,lab:`f(${tn(t)})=`,answer:ans,wrong:[{v:m*(t+x1)+y1,fb:S`Vorzeichen in der Klammer: Du rechnest $x-x_1$.`}],
    erkl:S`$f(${tn(t)})=${tn(m)}\cdot ${tn(t-x1)}${" "+sgn(y1)}=${tn(ans)}$.`}); }
function p4(){ const {m,x1,y1}=pt();
  return mc(S`Welchen Punkt kannst du an $f(x)=${psf(m,x1,y1)}$ direkt ablesen?`,`$${P_(x1,y1)}$`,
    [{t:`$${P_(-x1,y1)}$`,fb:S`Das Vorzeichen von $x_1$ ist umgekehrt.`},{t:`$${P_(x1,-y1)}$`,fb:S`Das Vorzeichen von $y_1$ ist umgekehrt.`},{t:`$${P_(y1,x1)}$`,fb:S`Die Koordinaten sind vertauscht.`}],
    S`Aus $f(x)=m\cdot(x-x_1)+y_1$ liest du $x_1=${tn(x1)}$ und $y_1=${tn(y1)}$ ab.`); }
function p5(){ const {m,x1,y1}=pt();
  return MM.numInputTask({q:S`Welche Steigung hat die Gerade $f(x)=${psf(m,x1,y1)}$?`,lab:"m=",answer:m,wrong:[{v:x1,fb:S`$x_1$ ist die Stelle des Punktes. Die Steigung steht direkt vor der Klammer.`},{v:y1,fb:S`$y_1$ ist die Höhe des Punktes. Die Steigung steht direkt vor der Klammer.`}],erkl:S`Der Faktor vor der Klammer ist die Steigung: $m=${tn(m)}$.`}); }
function q1(){ const {m,x1,y1,b}=pt();
  return MM.termInputTask({q:S`Eine Gerade hat die Steigung $m=${tn(m)}$ und geht durch $${P_(x1,y1)}$. Gib den Term in der Hauptform an.`,fn:fnL(m,b),form:"haupt",solTex:lin(m,b),
    erkl:S`$f(x)=${psf(m,x1,y1)}=${lin(m,b)}$.`}); }
function q2(){ const m=one(NZ), x1=one(NZ0), y1=one(NZ0), d=one([1,2,3]), x2=x1+d, y2=y1+m*d, b=y1-m*x1;
  return MM.termInputTask({q:S`Eine Gerade geht durch $${P_(x1,y1)}$ und $Q(${tn(x2)}|${tn(y2)})$. Gib den Term in der Hauptform an.`,fn:fnL(m,b),form:"haupt",solTex:lin(m,b),
    erkl:S`$m=\dfrac{${tn(y2-y1)}}{${tn(d)}}=${tn(m)}$. Dann $f(x)=${psf(m,x1,y1)}=${lin(m,b)}$.`}); }
function q3(){ const {m,x1,y1,b}=pt();
  return MM.termInputTask({q:S`Forme $f(x)=${psf(m,x1,y1)}$ in die Hauptform um.`,fn:fnL(m,b),form:"haupt",solTex:lin(m,b),erkl:S`Ausmultiplizieren und zusammenfassen: $${psf(m,x1,y1)}=${lin(m,b)}$.`}); }
function q4(){ const {m,x1,y1,b}=pt();
  return MM.numInputTask({q:S`Welchen y-Achsenabschnitt $b$ hat $f(x)=${psf(m,x1,y1)}$?`,lab:"b=",answer:b,wrong:[{v:y1,fb:S`$y_1$ ist nur die Höhe beim Punkt. Der y-Achsenabschnitt gehört zu $x=0$.`}],
    erkl:S`$f(0)=${tn(m)}\cdot(0${x1>=0?"-":"+"}${tn(abs(x1))})${" "+sgn(y1)}=${tn(b)}$.`}); }
function q5(){ const m=one(NZ), x1=one(NZ0), y1=one(NZ0), d=one([1,2,3]), x2=x1+d, y2=y1+m*d, b=y1-m*x1;
  return MM.selfCheckTask({q:S`Eine Gerade geht durch $${P_(x1,y1)}$ und $Q(${tn(x2)}|${tn(y2)})$. Bestimme die Hauptform. Trage zuletzt $b$ ein.`,lab:"b=",answer:b,
    steps:[{w:"Steigung",t:S`$m=\dfrac{${tn(y2)}-${pr(y1)}}{${tn(x2)}-${pr(x1)}}=${tn(m)}$`,p:1},{w:"Punkt-Steigungs-Form",t:`$f(x)=${psf(m,x1,y1)}$`,p:1},{w:"Hauptform",t:`$f(x)=${lin(m,b)}$`,p:1}],
    satz:S`Die Gerade hat die Gleichung $f(x)=${lin(m,b)}$.`,erkl:S`Wichtig: Ansatz, Rechnung, Ergebnis und Antwortsatz.`}); }
function r1(){ const x0=one(NZ0), y0=one(NZ0);
  return MM.openTask({q:S`Gib drei verschiedene lineare Funktionen an, die bei $x=${tn(x0)}$ den Wert $${tn(y0)}$ haben.`,n:3,kind:"term",prefix:"f(x)=",
    valid:(fn,l)=>!l?"Das ist keine lineare Funktion.":near(fn(x0),y0)?true:`Hier ist f(${ts(x0)}) nicht ${ts(y0)}.`,solTex:lin(1,y0-x0),
    erkl:S`Es gibt unendlich viele. Mit beliebigem $m$ gilt $f(x)=m\cdot(x-${tn(x0)})+${tn(y0)}$.`}); }
function r2(){ const m=one([-2,-1,0.5,2,3]), b=one([-3,-1,1,2,4]);
  return MM.openTask({q:S`Gib drei verschiedene Funktionen an, die zu $f(x)=${lin(m,b)}$ parallel sind.`,n:3,kind:"term",prefix:"f(x)=",
    valid:(fn,l)=>!l?"Das ist keine lineare Funktion.":!near(l.m,m)?"Parallele Geraden haben dieselbe Steigung.":near(l.b,b)?"Das ist die gegebene Funktion selbst.":true,solTex:lin(m,b+1),
    erkl:S`Parallel heißt: gleiche Steigung $m=${tn(m)}$, aber ein anderes $b$.`}); }
function r3(){ const m=one([0.3,-0.4,1.5,-1.25,0.75]), x1=one([2,4,-2,-4]), y1=one(NZ0), t=x1+one([2,3,4,6]), ans=R(m*(t-x1)+y1);
  return MM.numInputTask({q:S`Gegeben ist $f(x)=${psf(m,x1,y1)}$. Berechne $f(${tn(t)})$.`,lab:`f(${tn(t)})=`,answer:ans,erkl:S`$f(${tn(t)})=${tn(m)}\cdot ${tn(t-x1)}${" "+sgn(y1)}=${tn(ans)}$.`}); }
function r4(){ const m=one([-1.25,0.3,1.5,-0.5,0.75]), x1=one([4,-4,2,-2,8]), y1=one(NZ0), b=R(y1-m*x1);
  return MM.termInputTask({q:S`Eine Gerade hat die Steigung $m=${tn(m)}$ und geht durch $${P_(x1,y1)}$. Gib die Hauptform an.`,fn:fnL(m,b),form:"haupt",solTex:lin(m,b),
    hint:"Dezimalzahlen oder Brüche sind beide erlaubt.",erkl:S`$f(x)=${psf(m,x1,y1)}=${lin(m,b)}$.`}); }
function r5(){ const m=one([2,3,-2,-3]), k=one(NZ0), b=m*k, x0=-k, rx=one(NZ0), ry=one(NZ0), c=ry-m*rx;
  return MM.selfCheckTask({q:S`Eine Gerade $f$ geht durch $P(1|${tn(m+b)})$ und $Q(2|${tn(2*m+b)})$. a) Bestimme $f(x)$. b) Berechne die Nullstelle. c) Gib die zu $f$ parallele Gerade $g$ durch $R(${tn(rx)}|${tn(ry)})$ an. Trage den y-Achsenabschnitt von $g$ ein.`,lab:"b von g =",answer:c,
    steps:[{w:"a) Steigung und Term",t:S`$m=\dfrac{${tn(2*m+b)}-${pr(m+b)}}{2-1}=${tn(m)}$, $f(x)=${lin(m,b)}$`,p:2},{w:"b) Nullstelle",t:S`$${lin(m,b)}=0\Rightarrow x=${tn(x0)}$`,p:1},{w:"c) Parallele Gerade",t:S`Gleiche Steigung: $g(x)=${psf(m,rx,ry)}=${lin(m,c)}$`,p:2}],
    satz:S`$f(x)=${lin(m,b)}$, Nullstelle bei $x=${tn(x0)}$, $g(x)=${lin(m,c)}$.`,erkl:S`Das ist eine Mehrschrittaufgabe: jeden Teil einzeln sauber aufschreiben.`}); }

/* ===================== Challenge 2: Gleichungsformen ===================== */
function f1(){ const m=one(NZ), x1=one(NZ0), b=one(NZ0), y1=b+m*x1; if(y1===0) return null;
  const bads=[{t:`$f(x)=${psf(m,-x1,y1)}$`,fb:S`Das Vorzeichen von $x_1$ ist falsch herum.`},{t:`$f(x)=${psf(m,x1,y1+1)}$`,fb:S`Der hintere Wert passt nicht. Multipliziere die Klammer aus und prüfe.`},{t:`$f(x)=${psf(m,x1,-y1)}$`,fb:S`Das Vorzeichen von $y_1$ ist falsch herum.`}];
  return mc(S`Welche Schreibweise gehört zur Funktion $f(x)=${lin(m,b)}$?`,`$f(x)=${psf(m,x1,y1)}$`,bads,S`$${psf(m,x1,y1)}=${lin(m,b)}$. Die anderen Terme ergeben ein anderes $b$.`); }
function f2(){ const {m,x1,y1,b}=pt(); if(b===0) return null;
  return MM.numInputTask({q:S`Berechne $f(0)$ für $f(x)=${psf(m,x1,y1)}$.`,lab:"f(0)=",answer:b,wrong:[{v:y1,fb:S`Setze $x=0$ in die Klammer ein, nicht den Punkt ab.`}],erkl:S`$f(0)=${tn(m)}\cdot(0${x1>=0?"-":"+"}${tn(abs(x1))})${" "+sgn(y1)}=${tn(b)}$.`}); }
function f3(){ const a=one(NZ), c=one(NZ0); const eq=`${co(a)}x + y = ${tn(c)}`;
  return mc(S`Welche Funktion beschreibt dieselbe Gerade wie $${eq}$?`,`$f(x)=${lin(-a,c)}$`,
    [{t:`$f(x)=${lin(a,c)}$`,fb:S`Das $x$-Glied muss auf die andere Seite: Das Vorzeichen dreht sich.`},{t:`$f(x)=${lin(-a,-c)}$`,fb:S`Die rechte Seite bleibt, wie sie ist: $+${tn(c)}$.`},{t:`$f(x)=${lin(c,-a)}$`,fb:S`$m$ und $b$ sind vertauscht.`}],
    S`$${eq}$ nach $y$ auflösen: $y=${lin(-a,c)}$.`); }
function f4(){ const d=one([2,4]), k=one(NZ), j=one(NZ0), a=d*k, c=d*j;
  return MM.numInputTask({q:S`Forme $f(x)=\dfrac{${lin(a,c)}}{${d}}$ in die Hauptform um. Welchen y-Achsenabschnitt $b$ hat sie?`,lab:"b=",answer:j,
    wrong:[{v:c,fb:S`Auch das letzte Glied muss durch ${d} geteilt werden.`}],erkl:S`$f(x)=\dfrac{${tn(a)}x}{${d}}${" "+sgn(c)}\!/${d}=${lin(k,j)}$. Jedes Glied wird durch ${d} geteilt.`}); }
function f5(){ const m=one([2,3,-2,-3]), a=one(NZ0), c=one(NZ0), b=m*a+c;
  return mc(S`Welche Hauptform hat $f(x)=${psf(m,-a,c)}$?`,`$f(x)=${lin(m,b)}$`,
    [{t:`$f(x)=${lin(m,a+c)}$`,fb:S`Die Klammer wird mit $m$ multipliziert, nicht nur das $x$.`},{t:`$f(x)=${lin(m,m*a-c)}$`,fb:S`Das Vorzeichen von $c$ stimmt nicht.`},{t:`$f(x)=${lin(m,-m*a+c)}$`,fb:S`Das Vorzeichen beim Ausmultiplizieren stimmt nicht.`}],
    S`$${psf(m,-a,c)}=${co(m)}x${" "+sgn(m*a)}${" "+sgn(c)}=${lin(m,b)}$.`); }
function g1(){ const m=one(NZ), a=one(NZ0), c=one(NZ0), b=m*a+c;
  return MM.termInputTask({q:S`Forme $f(x)=${psf(m,-a,c)}$ in die Hauptform um.`,fn:fnL(m,b),form:"haupt",solTex:lin(m,b),erkl:S`$${psf(m,-a,c)}=${lin(m,b)}$.`}); }
function g2(){ const d=one([2,4,5]), a=one([1,2,3]), j=one(NZ0), c=d*j, m=R(a/d);
  return MM.termInputTask({q:S`Forme $f(x)=\dfrac{${lin(a,c)}}{${d}}$ in die Hauptform um.`,fn:x=>(a*x+c)/d,form:"haupt",solTex:lin(m,j),hint:"Dezimalzahl oder Bruch ist beides erlaubt.",erkl:S`Jedes Glied durch ${d} teilen: $f(x)=${lin(m,j)}$.`}); }
function g3(){ const m1=one(NZ), m2=one(NZ), a=one(NZ0), c=one(NZ0); if(m1+m2===0) return null; const b=m1*a+m2*c;
  return MM.termInputTask({q:S`Forme $f(x)=${tn(m1)}\cdot${br(-a)}${m2<0?" - ":" + "}${tn(abs(m2))}\cdot${br(-c)}$ in die Hauptform um.`,fn:fnL(m1+m2,b),form:"haupt",solTex:lin(m1+m2,b),
    erkl:S`Beide Klammern ausmultiplizieren, dann zusammenfassen: $f(x)=${lin(m1+m2,b)}$.`}); }
function g4(){ const a=one(NZ), c=one(NZ0), eq=`${co(a)}x + y = ${tn(c)}`;
  return MM.termInputTask({q:S`Löse $${eq}$ nach $y$ auf und gib $f(x)$ in der Hauptform an.`,fn:fnL(-a,c),form:"haupt",solTex:lin(-a,c),erkl:S`$y=${lin(-a,c)}$.`}); }
function g5(){ const {m,x1,y1,b}=pt(); if(abs(m)<2) return null;
  return MM.selfCheckTask({q:S`Forme $f(x)=${psf(m,x1,y1)}$ in die Hauptform um. Trage zuletzt $b$ ein.`,lab:"b=",answer:b,
    steps:[{w:"Ausmultiplizieren",t:S`$f(x)=${co(m)}x${" "+sgn(-m*x1)}${" "+sgn(y1)}$`,p:1},{w:"Zusammenfassen",t:`$f(x)=${lin(m,b)}$`,p:1},{w:"Ablesen",t:S`$m=${tn(m)}$ und $b=${tn(b)}$`,p:1}],satz:S`Die Hauptform lautet $f(x)=${lin(m,b)}$.`,erkl:S`Jedes Glied der Klammer mal $m$.`}); }
function h1(){ const a=one([1,3,5,-3]), bb=one([2,4,-2]), c=one([4,6,8,-6,10]); const eq=`${co(a)}x ${bb>0?"+":"-"} ${abs(bb)===1?"":abs(bb)}y = ${tn(c)}`;
  return MM.termInputTask({q:S`Löse $${eq}$ nach $y$ auf und gib $f(x)$ in der Hauptform an.`,fn:x=>(c-a*x)/bb,form:"haupt",solTex:lin(R(-a/bb),R(c/bb)),hint:"Brüche und Dezimalzahlen sind beide erlaubt.",
    erkl:S`$${tn(bb)}y=${lin(-a,c)}$, dann durch ${tn(bb)} teilen (alle Glieder): $y=${lin(R(-a/bb),R(c/bb))}$.`}); }
function h2(){ const a=one([2,3,-2,5]), bb=one([3,4,5,-3]), c=one([7,10,11,13,-5]); const eq=`${co(a)}x + ${bb<0?"(":""}${tn(bb)}${bb<0?")":""}y = ${tn(c)}`;
  return MM.numInputTask({q:S`Die Gerade $${eq}$ schneidet die y-Achse. Bei welchem $y$?`,lab:"y=",answer:c/bb,round:2,erkl:S`Auf der y-Achse ist $x=0$. Also $${tn(bb)}y=${tn(c)}$ und $y=${fr(c,bb)}$.`}); }
function h3(){ const x0=one(NZ0);
  return MM.openTask({q:S`Gib drei verschiedene lineare Funktionen an, die bei $x=${tn(x0)}$ eine Nullstelle haben.`,n:3,kind:"term",prefix:"f(x)=",
    valid:(fn,l)=>!l?"Das ist keine lineare Funktion.":l.m===0?"Eine waagerechte Gerade hat hier keine Nullstelle.":near(fn(x0),0)?true:`Hier ist f(${ts(x0)}) nicht 0.`,solTex:lin(1,-x0),erkl:S`Nullstelle $x=${tn(x0)}$ heißt $f(${tn(x0)})=0$. Zum Beispiel $f(x)=m\cdot(x-${tn(x0)})$.`}); }
function h4(){ const m=one([-3,-2,2,3]), x1=one(NZ0), y1=one(NZ0), b=y1-m*x1; if(b===0) return null; const err=one([1,2]);
  const l1=err===1?`${co(m)}x ${sgn(-x1)} ${sgn(y1)}`:`${co(m)}x ${sgn(-m*x1)} ${sgn(y1)}`, l2=err===2?lin(m,-m*x1-y1):lin(m,b);
  return mc(S`Aufgabe: $f(x)=${psf(m,x1,y1)}$ in die Hauptform umformen.<br>Zeile 1: $f(x)=${l1}$<br>Zeile 2: $f(x)=${l2}$<br>In welcher Zeile steckt der Fehler?`,`In Zeile ${err}`,[`In Zeile ${3-err}`,"Die Rechnung ist fehlerfrei"],
    err===1?S`In Zeile 1 wurde nur das $x$ mit $m$ multipliziert, nicht auch $x_1$.`:S`In Zeile 2 stimmt das Vorzeichen von $y_1$ beim Zusammenfassen nicht.`,{keepOrder:true}); }
function h5(){ const a=one([3,5,-3]), c=one([2,3,4]), x0=2*c/a; const eq=`${tn(a)}x - 2y = ${tn(2*c)}`;
  return MM.selfCheckTask({q:S`Gegeben ist $${eq}$. a) Bestimme die Hauptform. b) Berechne die Nullstelle. Trage die Nullstelle ein (Bruch oder gerundet).`,lab:"x=",answer:x0,round:2,
    steps:[{w:"Nach $y$ auflösen",t:S`$-2y=${tn(-a)}x${" "+sgn(2*c)}$, also $y=${a%2?fr(a,2):tn(a/2)}x-${tn(c)}$`,p:2},{w:"Hauptform",t:`$f(x)=${lin(R(a/2),-c)}$`,p:1},{w:"Nullstelle",t:S`$${lin(R(a/2),-c)}=0\Rightarrow x=${fr(2*c,a)}$`,p:2}],
    satz:S`Die Nullstelle liegt bei $x=${fr(2*c,a)}$.`,erkl:S`Beim Teilen durch $-2$ ändern sich alle Vorzeichen.`}); }

/* ===================== Challenge 3: Linear oder nicht? ===================== */
const XS=[0,1,2,3];
function mkLin(m,b,xs){ return xs.map(x=>R(m*x+b)); }
function l1(){ const m=one(NZ), b=one(NZ0), isLin=Math.random()<.5; const ys=mkLin(m,b,XS); if(!isLin){ const k=one([1,2,3]); ys[k]+=one([-2,-1,1,2]); }
  const good=isLin?"Ja. $y$ ändert sich bei jedem Schritt um denselben Wert.":"Nein. $y$ ändert sich nicht immer um denselben Wert.";
  const bad=[isLin?"Nein. $y$ ändert sich nicht immer um denselben Wert.":"Ja. $y$ ändert sich bei jedem Schritt um denselben Wert.",{t:"Ja, denn $x$ wächst in gleichen Schritten.",fb:S`Gleich große $x$-Schritte reichen nicht. Entscheidend ist, wie sich $y$ ändert.`},{t:"Ja, denn die Tabelle beginnt bei $x=0$.",fb:S`Wo die Tabelle beginnt, sagt nichts über die Linearität.`}];
  return mc("Ist diese Wertetabelle linear?",good,bad,isLin?S`Die Änderungen sind immer $${tn(m)}$. Das ist linear.`:S`Die Änderungen sind nicht alle gleich. Das ist nicht linear.`,{viz:tabViz(XS,ys),keepOrder:false}); }
function l2(){ const d=one([2,3,4]), m=one([-3,-2,-1,1,2,3,0.5,1.5]), b=one(NZ0), xs=[0,d,2*d,3*d], ys=mkLin(m,b,xs);
  return MM.numInputTask({q:"Die Tabelle gehört zu einer linearen Funktion. Wie groß ist die Steigung $m$?",viz:tabViz(xs,ys),lab:"m=",answer:m,wrong:[{v:R(m*d),fb:S`Teile $\Delta y$ noch durch $\Delta x=${d}$.`}],erkl:S`$m=\dfrac{\Delta y}{\Delta x}=\dfrac{${tn(R(m*d))}}{${d}}=${tn(m)}$.`}); }
function l3(){ const m=one(NZ), b=one([1,2,3,4,5]), good=mkLin(m,b,XS), c=one([1,2,3]);
  const f=a=>a.map(v=>ts(v)).join("; "); const pert=good.slice(); pert[2]+=one([-1,1]);
  return mc("Eine der Tabellen gehört zu einer linearen Funktion. Die $x$-Werte sind $0;\\,1;\\,2;\\,3$. Welche $y$-Werte passen?",f(good),
    [{t:f(pert),fb:S`Hier ist eine Änderung anders als die anderen.`},{t:f(XS.map(x=>x*x+c)),fb:S`Die Änderungen wachsen: Das ist keine Gerade.`},{t:f(XS.map(x=>c*Math.pow(2,x))),fb:S`Die Werte verdoppeln sich. Die Änderungen sind nicht gleich.`}],
    S`Nur bei $${f(good)}$ ändert sich $y$ immer um $${tn(m)}$.`); }
function l4(){ const d=one([1,2]), xs=XS.map(x=>x*d), m=one(NZ), b=one(NZ0), ys=mkLin(m,b,xs), k=one([1,2,3]), shown=ys.map((y,i)=>i===k?"?":y);
  return MM.numInputTask({q:"Die Tabelle gehört zu einer linearen Funktion. Welcher Wert fehlt?",viz:tabViz(xs,shown),lab:`f(${tn(xs[k])})=`,answer:ys[k],erkl:S`Die Steigung ist $m=${tn(m)}$. Damit $f(${tn(xs[k])})=${tn(ys[k])}$.`}); }
function l5(){ const xsL=[[0,1,3,4],[0,2,3,5],[1,2,4,5],[0,1,2,4]]; const xs=one(xsL), m=one(NZ), b=one(NZ0), isLin=Math.random()<.5, ys=mkLin(m,b,xs); if(!isLin) ys[2]+=one([-2,-1,1,2]);
  const good=isLin?S`Ja. $\Delta y:\Delta x$ ist bei jedem Paar gleich.`:S`Nein. $\Delta y:\Delta x$ ist nicht bei jedem Paar gleich.`;
  return mc("Die $x$-Schritte sind verschieden groß. Ist die Tabelle trotzdem linear?",good,
    [isLin?S`Nein. $\Delta y:\Delta x$ ist nicht bei jedem Paar gleich.`:S`Ja. $\Delta y:\Delta x$ ist bei jedem Paar gleich.`,{t:"Ja, denn $y$ wächst immer um denselben Wert.",fb:S`Bei ungleichen $x$-Schritten ändert sich $y$ verschieden stark. Teile durch $\Delta x$.`},{t:"Nein, denn die $x$-Abstände sind verschieden.",fb:S`Verschieden große $x$-Schritte sind erlaubt. Rechne $\Delta y:\Delta x$.`}],
    S`Rechne für jedes Paar $\Delta y:\Delta x$. ${isLin?"Überall kommt "+tn(m)+" heraus.":"Die Ergebnisse sind nicht alle gleich."}`,{viz:tabViz(xs,ys)}); }
function m1(){ const xs=one([[1,2,4],[0,3,4],[2,3,6],[1,4,5]]), m=one([-3,-2,-1,1,2,3,0.5]), b=one(NZ0), ys=mkLin(m,b,xs);
  return MM.numInputTask({q:"Die Tabelle gehört zu einer linearen Funktion. Berechne die Steigung $m$.",viz:tabViz(xs,ys),lab:"m=",answer:m,erkl:S`Zum Beispiel $m=\dfrac{${tn(ys[1])}-${tn(ys[0])}}{${tn(xs[1])}-${tn(xs[0])}}=${tn(m)}$.`}); }
function m2(){ const xs=one([[1,2,4],[1,3,4],[2,3,5],[0,2,3]]), m=one(NZ), b=one(NZ0), ys=mkLin(m,b,xs);
  return MM.termInputTask({q:"Die Tabelle gehört zu einer linearen Funktion. Gib den Term in der Hauptform an.",viz:tabViz(xs,ys),fn:fnL(m,b),form:"haupt",solTex:lin(m,b),erkl:S`Steigung $m=${tn(m)}$, dann $b$ aus einem Punkt: $f(x)=${lin(m,b)}$.`}); }
function m3(){ const m=one([20,25,30,-10,15]), b=one([-20,-10,10,20]), xs=[0,1,2,3], ys=xs.map(x=>m*x+b), u=one([2.5,4,5,6]); const ans=R(m*u+b);
  return MM.numInputTask({q:S`Ein Temperatursensor liefert die Messwerte aus der Tabelle. Die Kennlinie ist linear. Welche Temperatur $T$ zeigt er bei $U=${tn(u)}$ V?`,viz:tabViz(xs,ys,{xh:"U in V",yh:"T in °C",text:"Kennlinie eines Temperatursensors",label:"Mechatronik"}),
    lab:"T=",unit:"°C",answer:ans,erkl:S`$m=${tn(m)}$ °C pro V, $b=${tn(b)}$ °C. $T=${tn(m)}\cdot ${tn(u)}${" "+sgn(b)}=${tn(ans)}$ °C.`}); }
function m4(){ const base=one([1,2,3]), steps=one([[1,2,4],[1,3,5],[2,3,5],[1,2,3]]), ys=[base]; steps.forEach(s=>ys.push(ys[ys.length-1]+s)); if(new Set(steps).size===1) return null;
  return mc("Lea sagt: „Die $y$-Werte werden immer größer, also ist die Funktion linear.“ Stimmt das?","Nein. Entscheidend ist, dass sich $y$ bei gleichen $x$-Schritten immer um dasselbe ändert.",
    [{t:"Ja. Wachsende $y$-Werte reichen für eine lineare Funktion.",fb:S`Auch eine Parabel wächst. Linear heißt: gleichbleibende Änderung.`},{t:"Ja, weil die Tabelle bei $x=0$ beginnt.",fb:S`Der Anfang der Tabelle sagt nichts über die Linearität.`},{t:"Nein, weil die $y$-Werte positiv sind.",fb:S`Das Vorzeichen spielt keine Rolle.`}],
    S`Die Änderungen sind $${steps.map(tn).join(";\\,")}$: nicht gleich, also nicht linear.`,{viz:tabViz(XS,ys)}); }
function m5(){ const ys=one([[1,2,4,7],[0,1,4,9],[2,3,5,9],[1,3,4,8]]); const d=[ys[1]-ys[0],ys[2]-ys[1],ys[3]-ys[2]];
  return MM.selfCheckTask({q:S`Begründe: Die Wertetabelle gehört nicht zu einer linearen Funktion.`,viz:tabViz(XS,ys),
    steps:[{w:"Änderungen berechnen",t:S`$\Delta y$ bei jedem Schritt: $${d.map(tn).join(";\\,")}$`,p:1},{w:"Vergleichen",t:S`Die Änderungen sind nicht alle gleich.`,p:1},{w:"Begründung",t:S`Weil $\Delta y:\Delta x$ nicht überall gleich ist, ist die Funktion nicht linear.`,p:2}],
    satz:S`Musterantwort: Die $y$-Werte ändern sich bei gleichen $x$-Schritten verschieden stark. Deshalb ist die Funktion nicht linear.`,erkl:S`Eine Begründung braucht eine Rechnung und einen Satz.`}); }
function n1(){ const m=one([0.4,1.2,2.5,-0.8,1.6]), b=one([1,2.5,-1.5]), xs=[0.5,1,1.5,2], ys=mkLin(m,b,xs);
  return MM.numInputTask({q:"Ein Sensor liefert diese Messwerte. Die Kennlinie ist linear. Berechne die Steigung $m$ in °C pro V.",viz:tabViz(xs,ys,{xh:"U in V",yh:"T in °C",text:"Messwerte eines Sensors",label:"Mechatronik"}),lab:"m=",answer:m,
    erkl:S`$m=\dfrac{${tn(ys[1])}-${tn(ys[0])}}{${tn(xs[1])}-${tn(xs[0])}}=${tn(m)}$.`}); }
function n2(){ const m=one([0.4,1.2,2.5,-0.8,1.6,-1.5]), b=one([1,2.5,-1.5,0.5]), xs=[0,1,2,3], ys=mkLin(m,b,xs);
  return MM.termInputTask({q:"Die Tabelle gehört zu einer linearen Funktion. Gib den Term in der Hauptform an.",viz:tabViz(xs,ys),fn:fnL(m,b),form:"haupt",solTex:lin(m,b),hint:"Dezimalzahlen sind erlaubt.",erkl:S`$b=f(0)=${tn(b)}$, $m=${tn(m)}$.`}); }
const NICE=[1,2,5,10,20,25,50,100,200,250,500,1000];
const bestStep=mx=>NICE.find(s=>mx/s<=12);
function n3(){ const ctx=one([["t in s","n in U/min"],["U in V","I in mA"],["F in N","l in mm"]]), xm=one([5,10,20,40,60]), ym=one([100,500,1000,1500,3000]); const sx=bestStep(xm), sy=bestStep(ym); if(sx===sy) return null;
  const ex=`1 Kästchen = ${sx} (${xm/sx} Kästchen)`, ey=`1 Kästchen = ${sy} (${Math.ceil(ym/sy)} Kästchen)`;
  const o=(a,b)=>`$x$: ${a}; $y$: ${b}`;
  return mc(S`Du trägst Messwerte auf Karopapier ein: $${ctx[0].replace(" in ","\\ \\text{ in }")}$ von 0 bis ${xm}, ${ctx[1]} von 0 bis ${ym}. Jede Achse hat Platz für etwa 12 Kästchen. Welche Einteilung passt?`,o(ex,ey),
    [{t:o(ex,`1 Kästchen = ${sx} (${Math.ceil(ym/sx)} Kästchen)`),fb:S`Die Achsen dürfen verschieden eingeteilt werden. Mit ${sx} auf der $y$-Achse brauchst du viel zu viele Kästchen.`},{t:o(`1 Kästchen = ${sx*10} (${Math.ceil(xm/(sx*10))} Kästchen)`,ey),fb:"Auf der x-Achse wäre die Einteilung zu grob: Die Messreihe wird sehr klein."},{t:o(ex,`1 Kästchen = ${sy*10} (${Math.ceil(ym/(sy*10))} Kästchen)`),fb:"Auf der y-Achse wäre die Einteilung zu grob: Die Messreihe wird sehr klein."}],
    S`Teile den größten Wert durch die Kästchenzahl und runde auf eine bequeme Schrittweite: $x$: ${sx}, $y$: ${sy}.`); }
function n4(){ const m=one([0.5,1.5,2.5,4]), b=one([-2,1,3,5]), xs=[1,2,3,4], ys=mkLin(m,b,xs), u=one([6,8,10]), ans=R(m*u+b);
  return MM.selfCheckTask({q:S`Ein Stellmotor wird mit der Spannung $U$ (in V) angesteuert und erreicht die Drehzahl $n$ (in 100 U/min) laut Tabelle. Zeige, dass die Tabelle linear ist, gib $f(x)$ an und berechne $n$ bei $U=${u}$ V.`,viz:tabViz(xs,ys,{xh:"U in V",yh:"n",text:"Stellmotor-Kennlinie",label:"Mechatronik"}),lab:`n(${u})=`,answer:ans,
    steps:[{w:"Linearität prüfen",t:S`Alle Änderungen sind $${tn(m)}$: linear.`,p:1},{w:"Term",t:`$f(x)=${lin(m,b)}$`,p:2},{w:"Wert berechnen",t:S`$f(${u})=${tn(m)}\cdot ${u}${" "+sgn(b)}=${tn(ans)}$`,p:1}],satz:S`Bei $${u}$ V erreicht der Motor $n=${tn(ans)}$ (in 100 U/min).`,erkl:S`Erst prüfen, dann den Term, dann einsetzen.`}); }
function n5(){ const dx=one([3,6]), dy=one(dx===3?[1,2,4,5]:[1,5]), b=one([1,2,3]), xs=[0,dx,2*dx], ys=[b,b+dy,b+2*dy];
  return MM.numInputTask({q:"Die Tabelle gehört zu einer linearen Funktion. Berechne die Steigung $m$.",viz:tabViz(xs,ys),lab:"m=",answer:dy/dx,round:2,erkl:S`$m=\dfrac{${dy}}{${dx}}=${frac(dy,dx)}$ (Bruch, nicht gerundet).`}); }

/* ===================== Challenge 4: Steigung in Prozent ===================== */
function z1(){ const p=one([4,6,8,12,15,-7,-10]);
  return MM.numInputTask({q:S`Eine Straße hat ${p>0?"eine Steigung":"ein Gefälle"} von $${abs(p)}\,\%$. Wie groß ist die Steigung $m$ als Dezimalzahl?`,lab:"m=",answer:R(p/100),erkl:S`$m=\dfrac{${tn(p)}}{100}=${tn(R(p/100))}$.`}); }
function z2(){ const p=one([4,6,8,12,15]), x=one([100,200,250,400,50]), ans=R(p*x/100);
  return MM.numInputTask({q:S`Eine Straße hat $${p}\,\%$ Steigung. Wie viel Höhe überwindet sie auf $${x}$ m waagerecht?`,lab:"Höhe =",unit:"m",answer:ans,wrong:[{v:p*x,fb:S`Vergiss nicht, durch 100 zu teilen: $${p}\,\%=${tn(R(p/100))}$.`}],erkl:S`$\Delta y=${tn(R(p/100))}\cdot ${x}=${tn(ans)}$ m.`}); }
function z3(){ const p=one([6,8,10,12,15]);
  return mc(S`Was bedeutet eine Steigung von $${p}\,\%$?`,`Auf 100 m waagerecht geht es ${p} m nach oben.`,
    [{t:`Auf 100 m Fahrbahn geht es ${p} m nach oben.`,fb:"Die Strecke wird waagerecht gemessen, nicht entlang der Fahrbahn."},{t:`Nach ${p} m waagerecht geht es 100 m nach oben.`,fb:"Das ist verdreht: Prozent heißt „auf 100 m“."},{t:`Die Straße ist ${p}° steil.`,fb:"Prozent und Grad sind verschiedene Angaben."}],S`$${p}\,\%$ heißt $m=${tn(R(p/100))}$: pro 100 m waagerecht ${p} m Höhe.`); }
function z4(){ const d=one([50,100,200,250,400,500]), p=one([2,4,5,6,8,10,12]), h=R(p*d/100);
  return MM.numInputTask({q:S`Ein Weg steigt auf $${d}$ m waagerecht um $${tn(h)}$ m an. Wie groß ist die Steigung in Prozent?`,lab:"p=",unit:"%",answer:p,wrong:[{v:R(h/d),fb:S`Das ist $m$. Multipliziere mit 100, um Prozent zu bekommen.`}],erkl:S`$m=\dfrac{${tn(h)}}{${d}}=${tn(R(p/100))}$, also $${p}\,\%$.`}); }
function z5(){ const ds=[[0.3,5],[0.6,10],[0.9,15],[0.45,5],[0.5,10],[0.4,4],[0.7,5],[0.9,6],[1.2,8]]; const good=ds.filter(([h,d])=>h/d<=0.06+1e-9), bad=ds.filter(([h,d])=>h/d>0.06+1e-9);
  const g=one(good), bs=shuffle(bad).slice(0,3), f=([h,d])=>`${ts(h)} m Höhe auf ${d} m Länge`;
  return mc("Eine Rampe darf höchstens $6\\,\\%$ Steigung haben. Welche Rampe ist erlaubt?",f(g),bs.map(x=>({t:f(x),fb:`Das sind ${ts(R(x[0]/x[1]*100))} %. Erlaubt sind höchstens 6 %.`})),S`Die erlaubte Rampe hat $${ts(R(g[0]/g[1]*100))}\,\%$.`); }
function y1(){ const p=one([4,6,8,12,15,-5,-8]), h0=one([2,5,10,12]), ctx=one(["Ein Förderband","Eine Rampe","Ein Hubweg"]);
  return MM.termInputTask({q:S`${ctx} ${p>0?"steigt":"fällt"} mit $${abs(p)}\,\%$ und beginnt in $${h0}$ m Höhe. $x$ ist die waagerechte Strecke in m, $f(x)$ die Höhe in m. Gib $f(x)$ in der Hauptform an.`,fn:fnL(R(p/100),h0),form:"haupt",solTex:lin(R(p/100),h0),hint:"Rechne die Prozentzahl zuerst in eine Dezimalzahl um.",erkl:S`$m=${tn(R(p/100))}$ und $b=${h0}$: $f(x)=${lin(R(p/100),h0)}$.`}); }
function y2(){ const h=one([0.3,0.6,0.9,1.2]), ans=R(h/0.06);
  return MM.numInputTask({q:S`Eine Rampe für einen Rollstuhl darf höchstens $6\,\%$ Steigung haben. Sie muss ${ts(h)} m Höhe überwinden. Wie lang muss sie waagerecht mindestens sein?`,lab:"Länge =",unit:"m",answer:ans,erkl:S`$\Delta x=\dfrac{${tn(h)}}{0{,}06}=${tn(ans)}$ m.`}); }
function y3(){ const p=one([10,15,20,25,50]), a=Math.atan(p/100)*180/Math.PI;
  return MM.numInputTask({q:S`Eine Straße hat $${p}\,\%$ Steigung. Welchen Steigungswinkel hat sie?`,lab:S`\alpha=`,unit:"°",answer:a,round:1,erkl:S`$\tan\alpha=${tn(p/100)}$, also $\alpha=\tan^{-1}(${tn(p/100)})\approx ${tn(Math.round(a*10)/10)}^\circ$.`}); }
function y4(){ const h0=one([300,420,480,600]), p=one([5,8,10,12]), x=one([500,1000,1500]), ans=h0-p*x/100;
  return MM.numInputTask({q:S`Eine Straße beginnt auf $${h0}$ m Höhe und hat $${p}\,\%$ Gefälle. Wie hoch liegt sie nach $${x}$ m (waagerecht gemessen)?`,lab:"Höhe =",unit:"m",answer:ans,wrong:[{v:h0+p*x/100,fb:"Bei Gefälle wird die Höhe kleiner."}],erkl:S`$f(${x})=${tn(h0)}-${tn(R(p/100))}\cdot ${x}=${tn(ans)}$ m.`}); }
function y5(){ const h0=one([2,5,8]), p=one([4,6,8]), x=one([25,50,100]), ans=R(h0+p*x/100);
  return MM.selfCheckTask({q:S`Ein Förderband beginnt in $${h0}$ m Höhe und steigt mit $${p}\,\%$. Stelle den Term $f(x)$ für die Höhe auf und berechne die Höhe nach $${x}$ m waagerecht.`,lab:"Höhe =",unit:"m",answer:ans,
    steps:[{w:"Steigung",t:S`$m=\dfrac{${p}}{100}=${tn(R(p/100))}$`,p:1},{w:"Term",t:`$f(x)=${lin(R(p/100),h0)}$`,p:1},{w:"Einsetzen",t:S`$f(${x})=${tn(R(p/100))}\cdot ${x}+${h0}=${tn(ans)}$`,p:1}],satz:S`Nach ${x} m liegt das Band in ${tn(ans)} m Höhe.`,erkl:S`Prozent zuerst in $m$ umrechnen.`}); }
function w1(){ const p=one([2.5,4.5,6.5,7.5]), x=one([200,400]), ans=R(p*x/100);
  return MM.numInputTask({q:S`Ein Weg hat $${tn(p)}\,\%$ Steigung. Wie viel Höhe überwindet er auf $${x}$ m waagerecht?`,lab:"Höhe =",unit:"m",answer:ans,erkl:S`$\Delta y=${tn(R(p/100))}\cdot ${x}=${tn(ans)}$ m.`}); }
function w2(){ return MM.openTask({q:S`Eine Rampe soll ansteigen, aber höchstens $6\,\%$ Steigung haben. Nenne drei verschiedene mögliche Steigungen in Prozent.`,n:3,kind:"zahl",valid:v=>v>0&&v<=6?true:"Die Steigung muss größer als 0 und höchstens 6 sein.",solTex:"4",erkl:S`Alle Werte zwischen $0$ und $6$ gehen, zum Beispiel $2$, $4{,}5$ und $6$.`}); }
function w3(){ const m=one([0.15,-0.08,0.045,-0.12,0.06]), b=one([20,300,45,120]);
  return MM.numInputTask({q:S`Die Höhe einer Strecke (in m) nach $x$ m waagerecht ist $f(x)=${lin(m,b)}$. Wie groß ist die Steigung in Prozent?`,lab:"p=",unit:"%",answer:R(m*100),wrong:[{v:m,fb:S`Das ist $m$. Multipliziere mit 100.`}],erkl:S`$p=${tn(m)}\cdot 100=${tn(R(m*100))}\,\%$.`}); }
function w4(){ const p=one([6,8,12,15]), x=one([100,200,250]);
  return mc(S`Tim rechnet: „$${p}\,\%$ Steigung auf $${x}$ m waagerecht: $${p}\cdot ${x}=${p*x}$ m Höhe.“ Was ist falsch?`,"Er hat vergessen, die Prozentzahl durch 100 zu teilen.",
    [{t:"Er hätte durch die Prozentzahl teilen müssen.",fb:S`Es wird mit $m=\frac{p}{100}$ multipliziert, nicht durch $p$ geteilt.`},{t:"Er hätte die Fahrbahnlänge benutzen müssen.",fb:"Die Strecke wird waagerecht gemessen."},{t:"Nichts, die Rechnung stimmt.",fb:"Die Höhe wäre viel zu groß."}],S`Richtig ist $${tn(R(p/100))}\cdot ${x}=${tn(R(p*x/100))}$ m.`); }
function w5(){ const h0=one([100,120,200]), p=one([4,5,6,8]), dx=one([500,1000,1500,2000]), ht=h0+p*dx/100;
  return MM.selfCheckTask({q:S`Ein Weg beginnt auf $${h0}$ m Höhe und steigt mit $${p}\,\%$. Er soll auf $${ht}$ m Höhe enden. a) Stelle $f(x)$ auf. b) Wie viele Meter waagerecht ist der Weg lang? Trage b) ein.`,lab:"Länge =",unit:"m",answer:dx,
    steps:[{w:"Term",t:`$f(x)=${lin(R(p/100),h0)}$`,p:1},{w:"Gleichung ansetzen",t:`$${lin(R(p/100),h0)}=${ht}$`,p:1},{w:"Auflösen",t:S`$${tn(R(p/100))}x=${ht-h0}\Rightarrow x=${dx}$`,p:2}],satz:S`Der Weg ist ${dx} m lang (waagerecht gemessen).`,erkl:S`Mehrere Schritte: Term, Gleichung, auflösen.`}); }

/* ===================== Challenges ===================== */
const G=(f,steck)=>({g:f,steck});
const alt=(...fs)=>()=>one(fs)();   // je Versuch eine andere Variante: mehr Abwechslung, nicht mehr Aufgaben
const CH_FORMEN={titel:"Gleichungsformen",art:"Punkt-Steigungs-Form und Hauptform",kurz:"Term aus Punkt und Steigung, Umformen in die Hauptform.",
  intro:S`Dieselbe Gerade hat viele Schreibweisen. Du liest die Punkt-Steigungs-Form $f(x)=m\cdot(x-x_1)+y_1$, formst Klammern, Brüche und Gleichungen in die Hauptform um und löst auch offene Aufgaben.`,
  levels:[{name:"Erkennen",info:"Punkt, Steigung und gleiche Funktionen erkennen.",gens:[G(alt(p1,p4),"psf"),G(alt(p2,p5),"psf"),G(alt(f1,f5),"form"),G(alt(f3,f2),"form"),G(p3,"psf")]},
          {name:"Aufstellen und umformen",info:"Hauptform bestimmen, ausmultiplizieren, auflösen.",gens:[G(alt(q1,q3),"psf"),G(q2,"psf"),G(alt(g1,g3),"form"),G(alt(g2,f4),"form"),G(alt(g4,q4),"form")]},
          {name:"Offen, krumm, mehrschrittig",info:"Mehrere Lösungen, Dezimalzahlen, Fehler finden, Heft-Aufgabe.",gens:[G(alt(r1,r2,h3),"psf"),G(alt(r4,r3),"psf"),G(alt(h1,h2),"form"),G(h4,"form"),G(alt(r5,h5,q5,g5),"form")]}]};
const CH_LIN={titel:"Linear-Detektiv",art:"Linearität prüfen",kurz:"Wertetabellen, Kennlinien von Sensoren, Achsen einteilen.",
  intro:S`Gehört eine Wertetabelle zu einer linearen Funktion? Du prüfst $\Delta y:\Delta x$, begründest und liest Sensor-Kennlinien.`,
  levels:[{name:"Prüfen",info:"Ist die Tabelle linear?",gens:[G(l1,"lin"),G(l2,"lin"),G(l3,"lin"),G(l4,"lin"),G(l5,"lin")]},
          {name:"Term und Kennlinie",info:"Steigung, Term und Werte aus Tabellen.",gens:[G(m1,"lin"),G(m2,"lin"),G(m3,"lin"),G(m4,"lin"),G(m5,"lin")]},
          {name:"Messwerte",info:"Dezimalzahlen, Brüche, Achsen einteilen, Mehrschrittaufgabe.",gens:[G(n1,"lin"),G(n2,"lin"),G(n3,"lin"),G(n4,"lin"),G(n5,"lin")]}]};
const CH_PROZ={titel:"Prozent-Piste",art:"Steigung in Prozent",kurz:"Straßen, Rampen, Förderbänder: Prozent und Steigung.",
  intro:S`Straßen und Rampen werden in Prozent angegeben. Du wandelst um, rechnest Höhen und stellst Terme auf.`,
  levels:[{name:"Prozent verstehen",info:"Umrechnen und Höhe berechnen.",gens:[G(z1,"proz"),G(z2,"proz"),G(z3,"proz"),G(z4,"proz"),G(z5,"proz")]},
          {name:"Terme und Winkel",info:"Term aufstellen, Rampenlänge, Winkel.",gens:[G(y1,"proz"),G(y2,"proz"),G(y3,"proz"),G(y4,"proz"),G(y5,"proz")]},
          {name:"Mehrschritt",info:"Krumme Prozentzahlen, offene Aufgabe, Fehler finden, rückwärts rechnen.",gens:[G(w1,"proz"),G(w2,"proz"),G(w3,"proz"),G(w4,"proz"),G(w5,"proz")]}]};

MM.addKapitel("k3v",{steckOrder:["psf","form","lin","proz"],steckbriefe,challOrder:["formen","lin","proz"],
  challenges:{formen:CH_FORMEN,lin:CH_LIN,proz:CH_PROZ},
  braucht:{formen:["psf","form"],lin:["psf","form","lin"],proz:["psf","form","lin","proz"]}});
})();
