/* ============================================================
   HAUSAUFGABEN · erzeugt mit der Nachweise-App (Abschnitt „Hausaufgaben erstellen“).
   Diese Datei ersetzt kapitel/hausaufgaben.js im Repo. Danach MM.STAND in js/core.js ändern, damit die Geräte die Änderung holen.
   Pro Hausaufgabe: id (nie ändern), titel, start (optional), frist, teile (1 bis 3 Bausteine: app, papier, mathegym).
   ============================================================ */
window.MM = window.MM || {};
MM.HAUSAUFGABEN = [
  { id:"ha01", titel:"Übungen zu Linearen Funktionen", start:"2026-11-18", frist:"2026-11-24",
    teile:[
      { typ:"app", titel:"Steigungsdreieck", kapitel:"k3", challenge:"gerade", level:1, n:5, schwelle:3 },
      { typ:"app", titel:"Gerade durch zwei Punkte aufstellen", kapitel:"k3", challenge:"term", level:3, n:5, schwelle:3 },
      { typ:"app", titel:"Achsenschnittpunkte bestimmen", kapitel:"k3", challenge:"punkte", level:2, n:5, schwelle:3 }
    ] }
];
