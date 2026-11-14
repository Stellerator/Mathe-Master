/* ============================================================
   FORDER-AUFGABEN · freiwillig, außerhalb des Pflichtwegs, 3 je Kapitel.
   Anderes Denken statt „mehr vom Gleichen“: rückwärts rechnen, verallgemeinern, Fehler finden, mehrstufig, modellieren (AFB III).
   Jede Aufgabe lässt sich beliebig oft mit neuen Zahlen versuchen. Sind alle drei eines Kapitels gelöst, gibt es das Plus-Siegel.
   Neues Kapitel: hier einen Eintrag MM.FORDER.kX = [ {titel, kurz, g}, … ] ergänzen.
   ============================================================ */
(function(){
"use strict";
const MM=window.MM, S=String.raw;
const {one,ri,T,tn,ts,shuffle,el}=MM;
const R=v=>Math.round(v*1e6)/1e6, abs=Math.abs;
const co=m=>m===1?"":m===-1?"-":tn(m);
const sgn=v=>v<0?`- ${tn(-v)}`:`+ ${tn(v)}`;
const lin=(m,b)=>m===0?tn(b):`${co(m)}x${b===0?"":" "+sgn(b)}`;
const NZ=[-3,-2,-1,1,2,3], NZ0=[-4,-3,-2,-1,1,2,3,4];
function mc(q,good,bad,erkl,o){ const seen=new Set([good]); const opts=[{t:good,ok:true}];
  for(const b of shuffle(bad)){ const t=typeof b==="string"?b:b.t; if(seen.has(t)) continue; seen.add(t); opts.push({t,fb:b.fb}); if(opts.length>=4) break; }
  if(opts.length<3) return null; return MM.mcTask(Object.assign({q,opts,erkl},o||{})); }

/* ---------- Kapitel 1 · Der Begriff der Funktion ---------- */
function a1(){ const x=one([-3,-2,2,3]), c=ri(-4,5), v=x*x+c;
  return MM.numInputTask({q:S`Für die Funktion $f(x)=x^2+c$ gilt $f(${tn(x)})=${tn(v)}$. Bestimme $c$.`,lab:"c=",answer:c,erkl:S`$f(${tn(x)})=${tn(x*x)}+c=${tn(v)}$, also $c=${tn(c)}$.`}); }
function a2(){ const c=one([-3,-1,0,2,4]);
  return MM.openTask({q:S`Nenne drei verschiedene Zahlen, die zur Wertemenge $W_f$ von $f(x)=x^2${c===0?"":" "+sgn(c)}$ gehören.`,n:3,kind:"zahl",valid:v=>v>=c?true:S`${ts(v)} ist kleiner als ${ts(c)}. Ein Quadrat ist nie negativ.`,solTex:tn(c+1),erkl:S`Es gilt $x^2\ge 0$, also $f(x)\ge ${tn(c)}$. Alle Zahlen ab $${tn(c)}$ gehören dazu: $W_f=[${tn(c)};\infty[$.`}); }
function a3(){ const v=one(["w","i","q"]);
  if(v==="w") return mc(S`Max sagt: „Die Wertemenge von $f(x)=\sqrt{x}$ ist $\R$.“ Stimmt das?`,S`Nein. Eine Wurzel ist nie negativ, also $W_f=[0;\infty[$.`,[{t:"Ja. Die Wurzel kann jede Zahl annehmen.",fb:"Aus einer Wurzel kommt nie eine negative Zahl heraus."},{t:S`Nein. Es ist $W_f=]0;\infty[$, die Null gehört nicht dazu.`,fb:S`Für $x=0$ ist $\sqrt{0}=0$. Die Null gehört dazu.`},{t:"Nein. Es kommen nur ganze Zahlen heraus.",fb:S`Zum Beispiel $\sqrt{2}$ ist keine ganze Zahl.`}],S`Für $x\ge 0$ ist $\sqrt{x}\ge 0$, und jeder Wert ab $0$ wird erreicht.`);
  if(v==="i") return mc(S`Max sagt: „$f(x)=\dfrac1x$ lässt sich für jede reelle Zahl $x$ berechnen.“ Stimmt das?`,S`Nein. Für $x=0$ gibt es keinen Funktionswert: $D_f=\R\setminus\{0\}$.`,[{t:"Ja. Durch jede Zahl darf man teilen.",fb:"Durch null darf man nicht teilen."},{t:"Nein. $x$ darf nicht negativ sein.",fb:S`Negative Zahlen sind erlaubt, zum Beispiel $f(-2)=-\frac12$.`},{t:S`Nein. Es ist $D_f=\R\setminus\{1\}$.`,fb:S`Verboten ist die Null, nicht die Eins.`}],S`Der Nenner darf nicht null sein, also ist $x=0$ ausgeschlossen.`);
  const c=one([1,2,3,4]);
  return mc(S`Max sagt: „Die Wertemenge von $f(x)=x^2-${c}$ ist $\R$.“ Stimmt das?`,S`Nein. Ein Quadrat ist nie negativ, also $W_f=[-${c};\infty[$.`,[{t:"Ja. $x$ darf jede Zahl sein, also auch $f(x)$.",fb:S`Der Definitionsbereich ist $\R$, die Wertemenge aber nicht.`},{t:S`Nein. Es ist $W_f=[${c};\infty[$.`,fb:S`Das Vorzeichen stimmt nicht: Für $x=0$ ist $f(0)=-${c}$.`},{t:S`Nein. Es ist $W_f=]-\infty;-${c}]$.`,fb:S`Die Parabel ist nach oben geöffnet, sie geht nach oben ins Unendliche.`}],S`Der kleinste Wert ist $f(0)=-${c}$, nach oben gibt es keine Grenze.`); }

/* ---------- Kapitel 2 · Mathe-Sprache ---------- */
function b1(){ const a=one([-2,-1,0,1,2]), b=a+one([2,3,4]);
  return MM.openTask({q:S`Nenne drei verschiedene Zahlen aus dem Intervall $]${tn(a)};${tn(b)}]$, die keine ganzen Zahlen sind.`,n:3,kind:"zahl",valid:v=>Number.isInteger(v)?"Das ist eine ganze Zahl.":v>a&&v<=b?true:"Die Zahl liegt nicht im Intervall.",solTex:tn(a+0.5),erkl:S`Zwischen $${tn(a)}$ (nicht dabei) und $${tn(b)}$ (dabei) liegen viele Brüche und Dezimalzahlen, zum Beispiel $${tn(a+0.5)}$.`}); }
function b2(){ const a=one([-3,-2,-1,0,1,2]), b=a+ri(3,6), cl=Math.random()<.5, ch=Math.random()<.5, n=(b-a+1)-(cl?0:1)-(ch?0:1), iv=(cl?"[":"]")+tn(a)+";"+tn(b)+(ch?"]":"[");
  return MM.numInputTask({q:S`Wie viele ganze Zahlen liegen im Intervall $${iv}$?`,lab:"Anzahl:",answer:n,wrong:[{v:b-a,fb:"Zähle die Randzahlen mit: Gehören sie dazu oder nicht?"},{v:b-a+1,fb:"Prüfe die Randzahlen: Gehören beide wirklich dazu?"}],erkl:S`Von $${tn(a)}$ bis $${tn(b)}$ sind es $${b-a+1}$ ganze Zahlen. ${cl?"":"Die linke Randzahl gehört nicht dazu. "}${ch?"":"Die rechte Randzahl gehört nicht dazu. "}Es bleiben $${n}$.`}); }
function b3(){ const f=I=>(I.cl?"[":"]")+tn(I.lo)+";"+tn(I.hi)+(I.ch?"]":"[");
  const sub=(A,B)=>(A.lo>B.lo||(A.lo===B.lo&&(!A.cl||B.cl)))&&(A.hi<B.hi||(A.hi===B.hi&&(!A.ch||B.ch)));
  for(let k=0;k<300;k++){ const st=[]; for(let i=0;i<4;i++){ const lo=ri(-3,2), hi=lo+ri(1,3), lo2=ri(-4,2), hi2=lo2+ri(2,6); st.push({A:{lo,hi,cl:Math.random()<.5,ch:Math.random()<.5},B:{lo:lo2,hi:hi2,cl:Math.random()<.5,ch:Math.random()<.5}}); }
    const tr=st.filter(s=>sub(s.A,s.B)); if(tr.length!==1) continue; const txt=s=>`$${f(s.A)}\\subset ${f(s.B)}$`;
    return mc("Welche Aussage ist wahr? Das Zeichen $\\subset$ heißt „ist enthalten in“.",txt(tr[0]),st.filter(s=>s!==tr[0]).map(s=>({t:txt(s),fb:"Prüfe die Randpunkte: Liegt jede Zahl der linken Menge auch in der rechten?"})),`Eine Menge ist in einer anderen enthalten, wenn jede ihrer Zahlen dort auch liegt. Achte auf die Randpunkte.`); } return null; }

/* ---------- Kapitel 3 · Lineare Funktionen ---------- */
function c1(){ const D=one([2,2.5,4,5]), s1=one([4,6,8,10]), F1=R(D*s1), s2=one([12,15,18,20,24]), F2=R(D*s2);
  return MM.selfCheckTask({q:S`Eine Feder wird mit $${tn(F1)}$ N um $${tn(s1)}$ mm gedehnt. Die Dehnung ist proportional zur Kraft. Welche Dehnung (in mm) ergibt sich bei $${tn(F2)}$ N? Trage sie ein.`,lab:"s=",unit:"mm",answer:s2,
    steps:[{w:"Zusammenhang",t:S`Proportional heißt: $F=D\cdot s$, eine lineare Funktion durch den Ursprung.`,p:1},{w:"Federkonstante",t:S`$D=\dfrac{${tn(F1)}}{${tn(s1)}}=${tn(D)}$ N pro mm`,p:1},{w:"Dehnung berechnen",t:S`$s=\dfrac{${tn(F2)}}{${tn(D)}}=${tn(s2)}$ mm`,p:2}],satz:S`Bei $${tn(F2)}$ N dehnt sich die Feder um $${tn(s2)}$ mm.`,erkl:S`Erst die Federkonstante bestimmen, dann umstellen.`}); }
function c2(){ const m=one(NZ), x0=one(NZ0), d=one([1,2,3]);
  return MM.termInputTask({q:S`Eine Gerade schneidet die x-Achse bei $x=${tn(x0)}$ und geht durch $P(${tn(x0+d)}|${tn(m*d)})$. Gib $f(x)$ in der Hauptform an.`,fn:x=>m*(x-x0),form:"haupt",solTex:lin(m,-m*x0),erkl:S`Die Nullstelle liefert den Punkt $(${tn(x0)}|0)$. Damit $m=\dfrac{${tn(m*d)}}{${tn(d)}}=${tn(m)}$ und $f(x)=${lin(m,-m*x0)}$.`}); }
function c3(){ const x1=one([1,2,-1,-2]), y1=one([2,3,-2,-3]), d=one([1,2,3]), m=one([2,3,-2,-3]);
  return mc(S`Ben berechnet für $P(${tn(x1)}|${tn(y1)})$ und $Q(${tn(x1+d)}|${tn(y1+m*d)})$ die Steigung so: $m=\dfrac{${tn(d)}}{${tn(m*d)}}$. Was hat er falsch gemacht?`,S`Er hat $\Delta x$ durch $\Delta y$ geteilt, statt $\Delta y$ durch $\Delta x$.`,[{t:"Er hat die Punkte vertauscht.",fb:"Vertauschte Punkte würden nur das Vorzeichen von Zähler und Nenner ändern, nicht beide vertauschen."},{t:"Er hat sich verrechnet, sonst stimmt der Ansatz.",fb:"Der Ansatz selbst ist verdreht: Oben steht der Weg nach rechts."},{t:"Nichts, die Rechnung ist richtig.",fb:S`Die Steigung ist $\Delta y:\Delta x=${tn(m)}$, nicht der Kehrwert.`}],S`Richtig ist $m=\dfrac{\Delta y}{\Delta x}=\dfrac{${tn(m*d)}}{${tn(d)}}=${tn(m)}$.`); }

/* ---------- Kapitel 3+ · Vertiefung ---------- */
function d1(){ const p=one([1,2,3,-1,-2]), q=one(NZ0), mg=one([-1.5,0.5,2.5,-0.75]);
  return MM.numInputTask({q:S`Für welchen Wert von $a$ ist die Gerade $f(x)=a\cdot(x ${p<0?"+":"-"} ${abs(p)}) ${sgn(q)}$ parallel zu $g(x)=${lin(mg,1)}$?`,lab:"a=",answer:mg,erkl:S`Parallele Geraden haben dieselbe Steigung. Vor der Klammer steht die Steigung: $a=${tn(mg)}$.`}); }
function d2(){ const b=one(NZ0), m=one(NZ);
  return MM.numInputTask({q:S`Die Wertetabelle gehört zu einer linearen Funktion. Welchen Wert hat $k$?`,viz:api=>{ api.viz.appendChild(el("div",{class:"situ"},`<span class="eyebrow">Wertetabelle</span>${MM.tableHtml([0,1,2],[b,"k",b+2*m],{yh:"f(x)"})}`)); return null; },lab:"k=",answer:b+m,
    erkl:S`Bei $x=0$ ist $f=${tn(b)}$, bei $x=2$ ist $f=${tn(b+2*m)}$. Die Steigung ist $\dfrac{${tn(2*m)}}{2}=${tn(m)}$, also $k=${tn(b)}${" "+sgn(m)}=${tn(b+m)}$.`}); }
function d3(){ const x1=one([200,300,500]), x2=one([200,300,500]), p1=one([2,4,5,6,8,10]), p2=one([2,4,5,6,8,10]); if(p1===p2) return null; const avg=(p1*x1+p2*x2)/(x1+x2);
  return MM.numInputTask({q:S`Ein Weg steigt zuerst $${p1}\,\%$ auf $${x1}$ m waagerecht, danach $${p2}\,\%$ auf $${x2}$ m waagerecht. Welche Steigung in Prozent hat die gesamte Strecke im Durchschnitt?`,lab:"p=",unit:"%",answer:avg,round:1,wrong:[{v:(p1+p2)/2,fb:"Das ist der Mittelwert der beiden Prozentzahlen. Die Abschnitte sind aber verschieden lang."}],
    erkl:S`Höhe: $${tn(R(p1*x1/100))}+${tn(R(p2*x2/100))}=${tn(R((p1*x1+p2*x2)/100))}$ m auf $${x1+x2}$ m waagerecht. Das sind etwa $${tn(Math.round(avg*10)/10)}\,\%$.`}); }

/* ---------- Kapitel 4 · Geraden & Ungleichungen ---------- */
function e1(){ for(let k=0;k<300;k++){ const m1=one([1,2]), m2=one([-1,-2]), r1=one([-4,-3,-2,-1]), r2=r1+one([3,4,6]), xs=(m1*r1-m2*r2)/(m1-m2), ys=m1*(xs-r1); if(!Number.isInteger(xs)||!Number.isInteger(ys)||ys<=0||ys>6) continue;
    const b1=-m1*r1, b2=-m2*r2, g=r2-r1, A=g*ys/2;
    return MM.selfCheckTask({q:S`Die Geraden $g\colon y=${lin(m1,b1)}$ und $h\colon y=${lin(m2,b2)}$ begrenzen mit der x-Achse ein Dreieck. Berechne seinen Flächeninhalt (in Flächeneinheiten).`,lab:"A=",answer:A,
      steps:[{w:"Nullstellen",t:S`$g$: $${lin(m1,b1)}=0\Rightarrow x=${tn(r1)}$, $h$: $${lin(m2,b2)}=0\Rightarrow x=${tn(r2)}$`,p:1},{w:"Schnittpunkt",t:S`Gleichsetzen ergibt $S(${tn(xs)}|${tn(ys)})$.`,p:2},{w:"Grundseite und Höhe",t:S`Grundseite $${tn(r2)}-(${tn(r1)})=${tn(g)}$, Höhe $${tn(ys)}$`,p:1},{w:"Fläche",t:S`$A=\tfrac12\cdot ${tn(g)}\cdot ${tn(ys)}=${tn(A)}$`,p:1}],satz:S`Das Dreieck hat den Flächeninhalt $${tn(A)}$.`,erkl:S`Das Dreieck wird von den Nullstellen und dem Schnittpunkt aufgespannt.`}); } return null; }
function e2(){ const m=one([2,4,5,-2,-4,0.5]);
  return MM.numInputTask({q:S`Für welchen Wert von $a$ ist $g\colon y=ax+1$ orthogonal zu $h\colon y=${lin(m,-3)}$?`,lab:"a=",answer:R(-1/m),erkl:S`Orthogonal heißt $a\cdot ${tn(m)}=-1$, also $a=${tn(R(-1/m))}$.`}); }
function e3(){ const a=one([2,3]), b=one([1,2,4]), t=ri(1,4), c=a*t-b, d=t+ri(2,4);
  return MM.openTask({q:S`Nenne drei verschiedene Zahlen, die beide Bedingungen erfüllen: $${a}x-${b}\ge ${c}$ und $x<${d}$.`,n:3,kind:"zahl",valid:v=>a*v-b>=c-1e-9?(v<d?true:S`${ts(v)} ist nicht kleiner als ${d}.`):S`Bei ${ts(v)} ist ${a}x−${b} kleiner als ${c}.`,solTex:tn(t),erkl:S`Die erste Bedingung ergibt $x\ge ${tn(t)}$. Zusammen mit $x<${d}$ liegt $x$ im Intervall $[${tn(t)};${d}[$.`}); }

MM.FORDER = {
  k1:[{titel:"Rückwärts gedacht",kurz:"Rückwärts rechnen",g:a1},{titel:"Nenne drei",kurz:"Verallgemeinern",g:a2},{titel:"Stimmt das?",kurz:"Begründen",g:a3}],
  k2:[{titel:"Keine ganze Zahl",kurz:"Offene Aufgabe",g:b1},{titel:"Randzahlen zählen",kurz:"Genau hinsehen",g:b2},{titel:"Ist enthalten in",kurz:"Begründen",g:b3}],
  k3:[{titel:"Die Feder",kurz:"Modellieren",g:c1},{titel:"Von der Nullstelle aus",kurz:"Rückwärts rechnen",g:c2},{titel:"Wo steckt der Fehler?",kurz:"Fehler finden",g:c3}],
  k3v:[{titel:"Der Parameter",kurz:"Verallgemeinern",g:d1},{titel:"Der fehlende Messwert",kurz:"Rückwärts rechnen",g:d2},{titel:"Der ganze Weg",kurz:"Modellieren",g:d3}],
  k4:[{titel:"Das Dreieck",kurz:"Mehrschritt",g:e1},{titel:"Für welchen Wert?",kurz:"Verallgemeinern",g:e2},{titel:"Beide Bedingungen",kurz:"Offene Aufgabe",g:e3}]
};
})();
