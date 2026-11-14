/* ============================================================
   HAUSAUFGABEN · erzeugt mit der Nachweise-App (Abschnitt „Hausaufgaben erstellen“).
   Diese Datei ersetzt kapitel/hausaufgaben.js im Repo. Danach MM.STAND in js/core.js ändern, damit die Geräte die Änderung holen.
   Pro Hausaufgabe: id (nie ändern), titel, start (optional), frist, teile (1 bis 3 Bausteine: app, papier, mathegym).
   ============================================================ */
window.MM = window.MM || {};
MM.HAUSAUFGABEN = [
  { id:"ha01", titel:"Punktprobe", start:"2026-11-13", frist:"2026-11-15",
    teile:[
      { typ:"app", titel:"Punkt-Treffer, Level 2", kapitel:"k3", challenge:"punkte", level:2, n:5, schwelle:4 }
    ] }
];
