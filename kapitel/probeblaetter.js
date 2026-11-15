/* ============================================================
   PROBEARBEIT · ein Blatt über den ganzen Stoff bis zur Klassenarbeit (45 Minuten), mit Musterlösung.
   Aufbau: Jedes Kapitel hat einen oder mehrere „Plätze“ (slots) mit einem kleinen Pool von Aufgaben.
   Für jede Probearbeit kommt aus jedem Platz genau eine Aufgabe aufs Blatt. Die Auswahl wechselt von Version zu Version:
   Innerhalb eines Platzes kommt erst jede Aufgabe einmal dran, bevor sich etwas wiederholt.
   Welche Kapitel aufs Blatt kommen, bestimmt der nächste Klassenarbeits-Termin (kapitel/termine.js), sonst alle freigeschalteten.
   Eine Aufgabe: { intro, tabelle? | tabellen?, teile:[ { q (Aufgabe), l (Lösung), graph? (nur in der Lösung) } ] }
   Texte: $…$ ist Mathe-Satz (Dezimalkomma als {,}). graph: { x:[von,bis], y:[von,bis], schritt:[sx,sy], xl, yl,
   linien:[{m,b,name,von,bis}], punkte:[{x,y,name?}] }
   Neue Aufgaben einfach in den Pool eines Platzes eintragen. Alle Zahlen sind nachgerechnet (_testwerkzeuge/dom-test8.js).
   Orientierung: Buch S. 40 und 41 (Kapiteltest Runde 1 und 2).
   ============================================================ */
window.MM = window.MM || {};
(function(){
const S = String.raw;
MM.PROBEARBEIT = { min:45, slots:[

/* ===================== Kapitel 1 · Funktionen ===================== */
{ id:"k1", kapitel:"k1", titel:"Funktionen", pool:[
 { intro:S`Gegeben ist die Funktion $f$ mit $f(x)=-3x+7$.`,
   teile:[
    { q:S`Berechnen Sie $f(-2)$ und $f(2{,}5)$.`,
      l:S`$f(-2)=-3\cdot(-2)+7=6+7=13$<br>$f(2{,}5)=-3\cdot 2{,}5+7=-7{,}5+7=-0{,}5$` },
    { q:S`Bestimmen Sie, für welches $x$ gilt: $f(x)=-5$.`,
      l:S`$-3x+7=-5$, also $-3x=-12$ und $x=4$.` },
    { q:S`Prüfen Sie, ob der Punkt $P(-1|11)$ auf dem Graphen $K_f$ liegt.`,
      l:S`$f(-1)=-3\cdot(-1)+7=10$. Der Funktionswert ist $10$, nicht $11$. $P$ liegt nicht auf $K_f$.` }
   ] },
 { intro:S`Die Tabellen zeigen zwei Zuordnungen.`,
   tabellen:[
    { kopf:["Zuordnung I: $x$","1","2","3","4"], zeilen:[["$y$","5","7","9","11"]] },
    { kopf:["Zuordnung II: $x$","1","2","2","4"], zeilen:[["$y$","3","5","6","7"]] }
   ],
   teile:[
    { q:S`Entscheiden Sie bei beiden Zuordnungen, ob eine Funktion vorliegt. Begründen Sie.`,
      l:S`Zuordnung I ist eine Funktion: Jedem $x$ gehört genau ein $y$.<br>Zuordnung II ist keine Funktion: Zu $x=2$ gehören zwei verschiedene Werte, nämlich $5$ und $6$. Die Zuordnung ist nicht eindeutig.` },
    { q:S`Geben Sie für die Zuordnung, die eine Funktion ist, einen Funktionsterm an.`,
      l:S`Bei jedem Schritt von $x$ um $1$ wächst $y$ um $2$, und bei $x=1$ ist $y=5$. Also $f(x)=2x+3$.<br>Probe: $f(1)=5$, $f(2)=7$, $f(3)=9$, $f(4)=11$ ✓` },
    { q:S`Berechnen Sie $f(12)$ und bestimmen Sie $x$ mit $f(x)=31$.`,
      l:S`$f(12)=2\cdot 12+3=27$<br>$2x+3=31$, also $2x=28$ und $x=14$.` }
   ] },
 { intro:S`Gegeben sind die Funktionen $f$ mit $f(x)=\dfrac{3}{x-2}$ und $g$ mit $g(x)=\sqrt{x+1}-3$.`,
   teile:[
    { q:S`Bestimmen Sie die Definitionsmenge $D_f$ von $f$.`,
      l:S`Der Nenner darf nicht $0$ werden: $x-2\neq 0$, also $x\neq 2$.<br>$D_f=\R\setminus\{2\}$` },
    { q:S`Bestimmen Sie die Definitionsmenge $D_g$ und die Wertemenge $W_g$ von $g$.`,
      l:S`Unter der Wurzel darf nichts Negatives stehen: $x+1\ge 0$, also $x\ge -1$. $D_g=[-1;\infty[$<br>Die Wurzel ist mindestens $0$, also ist $g(x)\ge -3$. $W_g=[-3;\infty[$` },
    { q:S`Berechnen Sie $g(3)$ und bestimmen Sie $x$ mit $g(x)=1$.`,
      l:S`$g(3)=\sqrt{4}-3=2-3=-1$<br>$\sqrt{x+1}-3=1$, also $\sqrt{x+1}=4$ und $x+1=16$, also $x=15$.` }
   ] }
] },

/* ===================== Kapitel 2 · Mathe-Sprache ===================== */
{ id:"k2", kapitel:"k2", titel:"Mathe-Sprache", pool:[
 { intro:S`Gegeben sind die Zahlen $7$; $-3$; $0{,}75$; $\sqrt2$; $\dfrac53$.`,
   teile:[
    { q:S`Ordnen Sie jede Zahl dem kleinsten Zahlbereich ($\N$, $\Z$, $\Q$ oder $\R$) zu, zu dem sie gehört.`,
      l:S`$7\in\N$<br>$-3\in\Z$ (negativ, also nicht in $\N$)<br>$0{,}75\in\Q$ und $\dfrac53\in\Q$ (Brüche)<br>$\sqrt2\in\R$ (nicht als Bruch darstellbar)` },
    { q:S`Schreiben Sie die Menge $\{x\in\R\mid -2<x\le 5\}$ als Intervall.`,
      l:S`$-2$ gehört nicht dazu, $5$ gehört dazu: $]-2;5]$` },
    { q:S`Welche der Zahlen $-2$; $0$; $5$; $5{,}1$ gehören zu diesem Intervall?`,
      l:S`$-2$: nein (Randzahl ausgeschlossen)<br>$0$: ja<br>$5$: ja (Randzahl eingeschlossen)<br>$5{,}1$: nein (größer als $5$)` }
   ] },
 { intro:S`Aussagen und Lösungsmengen.`,
   teile:[
    { q:S`Geben Sie die Lösungsmenge an: $x<-1$`,
      l:S`Alle Zahlen links von $-1$, die $-1$ gehört nicht dazu: $L=]-\infty;-1[$` },
    { q:S`Geben Sie die Lösungsmenge an: $2x-1\ge 5$`,
      l:S`$2x\ge 6$, also $x\ge 3$. Die $3$ gehört dazu: $L=[3;\infty[$` },
    { q:S`Entscheiden Sie, ob die Aussage wahr oder falsch ist: (1) $-3\in\N$, (2) $\sqrt2\in\Q$, (3) $\Q\subset\R$.`,
      l:S`(1) falsch: $-3$ ist negativ, also eine ganze Zahl, aber keine Zählzahl.<br>(2) falsch: $\sqrt2$ ist nicht als Bruch darstellbar.<br>(3) wahr: Jede rationale Zahl ist auch eine reelle Zahl.` }
   ] },
 { intro:S`Gegeben ist die Menge $M=\{x\in\R\mid -3\le x<2\}$.`,
   teile:[
    { q:S`Schreiben Sie $M$ als Intervall.`,
      l:S`$-3$ gehört dazu, $2$ gehört nicht dazu: $M=[-3;2[$` },
    { q:S`Entscheiden Sie für die Zahlen $-3$; $0$; $2$, ob sie Element von $M$ sind.`,
      l:S`$-3\in M$ (Randzahl eingeschlossen)<br>$0\in M$<br>$2\notin M$ (Randzahl ausgeschlossen)` },
    { q:S`Formulieren Sie in Worten, wie man die Menge $M$ liest.`,
      l:S`„Die Menge aller $x$ aus den reellen Zahlen, für die gilt: $x$ ist größer oder gleich $-3$ und kleiner als $2$.“` }
   ] }
] },

/* ===================== Kapitel 3 · Lineare Funktionen: Sachaufgabe ===================== */
{ id:"k3-sach", kapitel:"k3", titel:"Lineare Funktionen im Alltag", pool:[
 { intro:S`Ein Wassertank wird gleichmäßig gefüllt. Die Tabelle zeigt die Füllmenge in Abhängigkeit von der Zeit. Der Tank fasst $220\,\ell$.`,
   tabelle:{ kopf:["Zeit $t$ (in min)","0","1","2","3","4"], zeilen:[["Füllmenge (in $\\ell$)","40","55","70","85","100"]] },
   teile:[
    { q:S`Bestimmen Sie eine lineare Funktion $f$, die die Füllmenge (in $\ell$) in Abhängigkeit von der Zeit $t$ (in min) beschreibt.`,
      l:S`Pro Minute kommen $15\,\ell$ dazu, also $m=15$. Bei $t=0$ sind schon $40\,\ell$ im Tank, also $b=40$.<br>$f(t)=15t+40$` },
    { q:S`Zeichnen Sie den Graphen $K$ von $f$ für die ersten 8 Minuten.`,
      l:S`Zwei Punkte genügen: $f(0)=40$ und $f(8)=15\cdot 8+40=160$. Verbinden Sie $(0|40)$ und $(8|160)$ mit dem Lineal.`,
      graph:{ x:[0,8], y:[0,180], schritt:[1,20], xl:"t in min", yl:"Füllmenge in ℓ", linien:[{m:15,b:40,name:"K",von:0,bis:8}], punkte:[{x:0,y:40},{x:8,y:160}] } },
    { q:S`Bestimmen Sie, wie viel Wasser nach 6 Minuten im Tank ist.`,
      l:S`$f(6)=15\cdot 6+40=90+40=130$<br>Nach 6 Minuten sind $130\,\ell$ im Tank.` },
    { q:S`Bestimmen Sie, wann der Tank voll ist.`,
      l:S`$f(t)=220$ ergibt $15t+40=220$, also $15t=180$ und $t=12$.<br>Nach 12 Minuten ist der Tank voll.` },
    { q:S`Erläutern Sie, wie lange die Funktion $f$ das Füllen höchstens beschreiben kann.`,
      l:S`Ab $t=12$ ist der Tank voll ($220\,\ell$). Dann läuft kein Wasser mehr hinein, der Graph steigt nicht weiter. Die Funktion beschreibt das Füllen also nur für $0\le t\le 12$, höchstens 12 Minuten lang.` }
   ] },
 { intro:S`Eine Kerze brennt gleichmäßig ab. Die Tabelle zeigt die Höhe der Kerze in Abhängigkeit von der Brenndauer.`,
   tabelle:{ kopf:["Zeit $t$ (in h)","0","1","2","3","4"], zeilen:[["Höhe (in cm)","24","21","18","15","12"]] },
   teile:[
    { q:S`Bestimmen Sie eine lineare Funktion $f$, die die Höhe (in cm) in Abhängigkeit von der Zeit $t$ (in h) beschreibt.`,
      l:S`Pro Stunde wird die Kerze $3\,\text{cm}$ kürzer, also $m=-3$. Zu Beginn ist sie $24\,\text{cm}$ hoch, also $b=24$.<br>$f(t)=-3t+24$` },
    { q:S`Zeichnen Sie den Graphen $K$ von $f$ für die ersten 8 Stunden.`,
      l:S`$f(0)=24$ und $f(8)=-3\cdot 8+24=0$. Verbinden Sie $(0|24)$ und $(8|0)$ mit dem Lineal.`,
      graph:{ x:[0,8], y:[0,26], schritt:[1,2], xl:"t in h", yl:"Höhe in cm", linien:[{m:-3,b:24,name:"K",von:0,bis:8}], punkte:[{x:0,y:24},{x:8,y:0}] } },
    { q:S`Bestimmen Sie, wie hoch die Kerze nach $5{,}5$ Stunden noch ist.`,
      l:S`$f(5{,}5)=-3\cdot 5{,}5+24=-16{,}5+24=7{,}5$<br>Nach $5{,}5$ Stunden ist die Kerze noch $7{,}5\,\text{cm}$ hoch.` },
    { q:S`Bestimmen Sie, wann die Kerze noch $6\,\text{cm}$ hoch ist.`,
      l:S`$f(t)=6$ ergibt $-3t+24=6$, also $-3t=-18$ und $t=6$.<br>Nach 6 Stunden.` },
    { q:S`Erläutern Sie, wie lange die Funktion $f$ das Abbrennen höchstens beschreiben kann.`,
      l:S`Die Nullstelle ist $t=8$: Dann ist die Kerze ganz abgebrannt. Danach wäre die Höhe negativ, das ist unmöglich. Die Funktion gilt nur für $0\le t\le 8$, höchstens 8 Stunden lang.` }
   ] },
 { intro:S`Ein Taxiunternehmen berechnet eine Grundgebühr und einen festen Preis pro gefahrenem Kilometer. Die Tabelle zeigt den Fahrpreis.`,
   tabelle:{ kopf:["Strecke $x$ (in km)","0","1","2","3","4"], zeilen:[["Preis (in €)","3,50","5,30","7,10","8,90","10,70"]] },
   teile:[
    { q:S`Bestimmen Sie eine lineare Funktion $f$, die den Preis (in €) in Abhängigkeit von der Strecke $x$ (in km) beschreibt.`,
      l:S`Pro Kilometer kommen $1{,}80\,€$ dazu, also $m=1{,}8$. Bei $x=0$ zahlt man die Grundgebühr $3{,}50\,€$, also $b=3{,}5$.<br>$f(x)=1{,}8x+3{,}5$` },
    { q:S`Zeichnen Sie den Graphen $K$ von $f$ für Strecken bis $10$ km.`,
      l:S`$f(0)=3{,}5$ und $f(10)=1{,}8\cdot 10+3{,}5=21{,}5$. Verbinden Sie $(0|3{,}5)$ und $(10|21{,}5)$ mit dem Lineal.`,
      graph:{ x:[0,10], y:[0,24], schritt:[1,2], xl:"x in km", yl:"Preis in €", linien:[{m:1.8,b:3.5,name:"K",von:0,bis:10}], punkte:[{x:0,y:3.5},{x:10,y:21.5}] } },
    { q:S`Bestimmen Sie, was eine Fahrt über $7$ km kostet.`,
      l:S`$f(7)=1{,}8\cdot 7+3{,}5=12{,}6+3{,}5=16{,}1$<br>Die Fahrt kostet $16{,}10\,€$.` },
    { q:S`Bestimmen Sie, wie weit man für $21{,}50\,€$ fahren kann.`,
      l:S`$f(x)=21{,}5$ ergibt $1{,}8x+3{,}5=21{,}5$, also $1{,}8x=18$ und $x=10$.<br>Man kann $10$ km weit fahren.` },
    { q:S`Erläutern Sie, was die Zahlen $1{,}8$ und $3{,}5$ im Funktionsterm im Sachzusammenhang bedeuten.`,
      l:S`$1{,}8$ ist die Steigung: Jeder gefahrene Kilometer kostet $1{,}80\,€$.<br>$3{,}5$ ist der Wert bei $x=0$: die Grundgebühr von $3{,}50\,€$, die man schon vor der ersten Fahrt zahlt.` }
   ] }
] },

/* ===================== Kapitel 3 · Lineare Funktionen: Term, Nullstelle, Winkel ===================== */
{ id:"k3-term", kapitel:"k3", titel:"Term, Nullstelle und Winkel", pool:[
 { intro:S`Der Graph $K_f$ einer linearen Funktion $f$ hat die Steigung $m=-2$ und verläuft durch den Punkt $P(3|-1)$.`,
   teile:[
    { q:S`Bestimmen Sie den Funktionsterm von $f$.`,
      l:S`$f(x)=-2x+b$. Punkt einsetzen: $-1=-2\cdot 3+b$, also $b=5$.<br>$f(x)=-2x+5$` },
    { q:S`Berechnen Sie die Nullstelle von $f$.`,
      l:S`$-2x+5=0$, also $x=\dfrac{5}{2}=2{,}5$.` },
    { q:S`Prüfen Sie, ob der Punkt $Q(-4|12)$ auf $K_f$ liegt.`,
      l:S`$f(-4)=-2\cdot(-4)+5=13\neq 12$. $Q$ liegt nicht auf $K_f$.` },
    { q:S`Berechnen Sie den Steigungswinkel von $K_f$.`,
      l:S`$\tan^{-1}(-2)\approx-63{,}4^\circ$. Die Steigung ist negativ, also $\alpha=180^\circ-63{,}4^\circ=116{,}6^\circ$.` }
   ] },
 { intro:S`Die Punkte $A(-2|1)$ und $B(4|4)$ liegen auf dem Graphen $K_g$ einer linearen Funktion $g$.`,
   teile:[
    { q:S`Bestimmen Sie den Funktionsterm von $g$.`,
      l:S`$m=\dfrac{4-1}{4-(-2)}=\dfrac{3}{6}=0{,}5$. Punkt $A$ einsetzen: $1=0{,}5\cdot(-2)+b$, also $b=2$.<br>$g(x)=0{,}5x+2$ (Probe mit $B$: $0{,}5\cdot 4+2=4$ ✓)` },
    { q:S`Berechnen Sie die Nullstelle von $g$.`,
      l:S`$0{,}5x+2=0$, also $0{,}5x=-2$ und $x=-4$.` },
    { q:S`Prüfen Sie, ob der Punkt $Q(6|5)$ auf $K_g$ liegt.`,
      l:S`$g(6)=0{,}5\cdot 6+2=5$. $Q$ liegt auf $K_g$.` },
    { q:S`Berechnen Sie den Steigungswinkel von $K_g$.`,
      l:S`$\tan\alpha=0{,}5$, also $\alpha\approx 26{,}6^\circ$.` }
   ] },
 { intro:S`Der Graph $K_h$ einer linearen Funktion $h$ hat die Steigung $m=1{,}25$ und verläuft durch den Punkt $P(4|2)$.`,
   teile:[
    { q:S`Bestimmen Sie den Funktionsterm von $h$.`,
      l:S`$h(x)=1{,}25x+b$. Punkt einsetzen: $2=1{,}25\cdot 4+b$, also $b=-3$.<br>$h(x)=1{,}25x-3$` },
    { q:S`Berechnen Sie die Nullstelle von $h$.`,
      l:S`$1{,}25x-3=0$, also $x=\dfrac{3}{1{,}25}=2{,}4$.` },
    { q:S`Prüfen Sie, ob der Punkt $Q(8|7)$ auf $K_h$ liegt.`,
      l:S`$h(8)=1{,}25\cdot 8-3=7$. $Q$ liegt auf $K_h$.` },
    { q:S`Berechnen Sie den Steigungswinkel von $K_h$.`,
      l:S`$\tan\alpha=1{,}25$, also $\alpha\approx 51{,}3^\circ$.` }
   ] }
] },

/* ===================== Kapitel 3+ · Vertiefung ===================== */
{ id:"k3v", kapitel:"k3v", titel:"Lineare Funktionen – Vertiefung", pool:[
 { intro:S`Eine Gerade hat die Steigung $m=-1{,}5$ und verläuft durch den Punkt $P(2|3)$.`,
   teile:[
    { q:S`Geben Sie die Gleichung in der Punkt-Steigungs-Form an.`,
      l:S`$f(x)=m\cdot(x-x_1)+y_1$ mit $m=-1{,}5$, $x_1=2$, $y_1=3$:<br>$f(x)=-1{,}5\cdot(x-2)+3$` },
    { q:S`Bestimmen Sie die Hauptform.`,
      l:S`$f(x)=-1{,}5x+3+3$, also $f(x)=-1{,}5x+6$.` },
    { q:S`Prüfen Sie, ob der Punkt $Q(-2|9)$ auf der Geraden liegt.`,
      l:S`$f(-2)=-1{,}5\cdot(-2)+6=3+6=9$. $Q$ liegt auf der Geraden.` }
   ] },
 { intro:S`Die Tabellen zeigen zwei Zuordnungen.`,
   tabellen:[
    { kopf:["Zuordnung I: $x$","0","1","2","3","4"], zeilen:[["$y$","2","5","8","11","14"]] },
    { kopf:["Zuordnung II: $x$","0","1","2","3","4"], zeilen:[["$y$","1","2","4","8","16"]] }
   ],
   teile:[
    { q:S`Entscheiden Sie, welche Zuordnung zu einer linearen Funktion gehört. Begründen Sie.`,
      l:S`Bei Zuordnung I wächst $y$ bei jedem Schritt um $3$ (Differenzen $3;3;3;3$). Das passt zu einer linearen Funktion.<br>Bei Zuordnung II sind die Differenzen $1;2;4;8$. Sie sind nicht gleich, also ist sie nicht linear.` },
    { q:S`Geben Sie für die lineare Zuordnung den Funktionsterm an.`,
      l:S`$m=3$ und bei $x=0$ ist $y=2$, also $b=2$.<br>$f(x)=3x+2$` },
    { q:S`Berechnen Sie den Funktionswert an der Stelle $x=10$.`,
      l:S`$f(10)=3\cdot 10+2=32$` }
   ] },
 { intro:S`Eine Straße hat eine Steigung von $8\,\%$.`,
   teile:[
    { q:S`Erläutern Sie, was „$8\,\%$ Steigung“ bedeutet.`,
      l:S`Auf $100$ m <b>waagerecht</b> geht es $8$ m nach oben. Das ist $m=\dfrac{8}{100}=0{,}08$.` },
    { q:S`Berechnen Sie, wie viele Meter Höhenunterschied die Straße auf $750$ m waagerecht überwindet.`,
      l:S`$0{,}08\cdot 750=60$<br>Es sind $60$ m Höhenunterschied.` },
    { q:S`Eine Rampe überwindet $1{,}2$ m Höhe auf $8$ m waagerecht. Berechnen Sie ihre Steigung in Prozent.`,
      l:S`$m=\dfrac{1{,}2}{8}=0{,}15$, also $15\,\%$.` }
   ] }
] },

/* ===================== Kapitel 4 · Lage von Geraden und Ungleichungen ===================== */
{ id:"k4", kapitel:"k4", titel:"Geraden und Ungleichungen", pool:[
 { intro:S`Gegeben sind die linearen Funktionen $f$ mit $f(x)=0{,}5x+1$ und $g$ mit $g(x)=-x+7$.`,
   teile:[
    { q:S`Zeichnen Sie die zugehörigen Graphen $K_f$ von $f$ und $K_g$ von $g$ im Intervall $[-2;8]$.`,
      l:S`$K_f$: $f(-2)=0$ und $f(8)=5$. $K_g$: $g(-2)=9$ und $g(8)=-1$. Verbinden Sie jeweils die beiden Punkte.`,
      graph:{ x:[-2,8], y:[-1,9], schritt:[1,1], linien:[{m:0.5,b:1,name:"K_f",von:-2,bis:8},{m:-1,b:7,name:"K_g",von:-2,bis:8}], punkte:[{x:4,y:3,name:"S"}] } },
    { q:S`Berechnen Sie den Schnittpunkt der Graphen $K_f$ und $K_g$.`,
      l:S`$f(x)=g(x)$: $0{,}5x+1=-x+7$, also $1{,}5x=6$ und $x=4$.<br>$f(4)=0{,}5\cdot 4+1=3$<br>$S(4|3)$` },
    { q:S`Berechnen Sie die Steigungswinkel von $K_f$ und von $K_g$.`,
      l:S`$K_f$: $\tan\alpha=0{,}5$, also $\alpha\approx 26{,}6^\circ$.<br>$K_g$: $\tan^{-1}(-1)=-45^\circ$. Die Steigung ist negativ, also $\alpha=180^\circ-45^\circ=135^\circ$.` },
    { q:S`Bestimmen Sie, für welche $x$ gilt: $f(x)>g(x)$.`,
      l:S`Der Schnittpunkt liegt bei $x=4$. Rechts davon verläuft $K_f$ oberhalb von $K_g$ (siehe Zeichnung).<br>$f(x)>g(x)$ gilt für $x>4$, also $L=]4;\infty[$.` }
   ] },
 { intro:S`Gegeben sind die linearen Funktionen $f$ mit $f(x)=2x-3$ und $g$ mit $g(x)=-0{,}5x+2$.`,
   teile:[
    { q:S`Zeichnen Sie die zugehörigen Graphen $K_f$ von $f$ und $K_g$ von $g$ im Intervall $[-1;5]$.`,
      l:S`$K_f$: $f(-1)=-5$ und $f(5)=7$. $K_g$: $g(-1)=2{,}5$ und $g(5)=-0{,}5$. Verbinden Sie jeweils die beiden Punkte.`,
      graph:{ x:[-1,5], y:[-5,7], schritt:[1,1], linien:[{m:2,b:-3,name:"K_f",von:-1,bis:5},{m:-0.5,b:2,name:"K_g",von:-1,bis:5}], punkte:[{x:2,y:1,name:"S"}] } },
    { q:S`Berechnen Sie den Schnittpunkt der Graphen $K_f$ und $K_g$.`,
      l:S`$f(x)=g(x)$: $2x-3=-0{,}5x+2$, also $2{,}5x=5$ und $x=2$.<br>$f(2)=2\cdot 2-3=1$<br>$S(2|1)$` },
    { q:S`Berechnen Sie die Steigungswinkel von $K_f$ und von $K_g$.`,
      l:S`$K_f$: $\tan\alpha=2$, also $\alpha\approx 63{,}4^\circ$.<br>$K_g$: $\tan^{-1}(-0{,}5)\approx-26{,}6^\circ$. Die Steigung ist negativ, also $\alpha=180^\circ-26{,}6^\circ=153{,}4^\circ$.` },
    { q:S`Bestimmen Sie, für welche $x$ gilt: $f(x)<g(x)$.`,
      l:S`Der Schnittpunkt liegt bei $x=2$. Links davon verläuft $K_f$ unterhalb von $K_g$ (siehe Zeichnung).<br>$f(x)<g(x)$ gilt für $x<2$, also $L=]-\infty;2[$.` }
   ] },
 { intro:S`Gegeben sind die Geraden $f\colon y=2x-1$, $g\colon y=-0{,}5x+4$ und $h\colon y=2x+3$.`,
   teile:[
    { q:S`Welche der Geraden sind parallel zueinander? Begründen Sie.`,
      l:S`$f$ und $h$ haben dieselbe Steigung $m=2$, aber verschiedene y-Achsenabschnitte ($-1$ und $3$). Sie sind parallel und nicht identisch.` },
    { q:S`Zeigen Sie, dass $f$ und $g$ orthogonal zueinander sind.`,
      l:S`$m_f\cdot m_g=2\cdot(-0{,}5)=-1$. Das Produkt der Steigungen ist $-1$, also sind $f$ und $g$ orthogonal.` },
    { q:S`Berechnen Sie den Schnittpunkt von $f$ und $g$.`,
      l:S`$2x-1=-0{,}5x+4$, also $2{,}5x=5$ und $x=2$.<br>$f(2)=2\cdot 2-1=3$<br>$S(2|3)$` },
    { q:S`Bestimmen Sie die Lösungsmenge der Ungleichung $2x-1<-0{,}5x+4$.`,
      l:S`$2{,}5x<5$, also $x<2$.<br>$L=]-\infty;2[$` }
   ] }
] }

] };
})();
