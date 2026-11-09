/* ============================================================
   KAPITELLISTE · Hier steuerst du, was die Klasse sieht.

   Freischalten = Datei des Kapitels ins Repo legen (datei: …).
   Solange die Datei fehlt, steht das Kapitel als „folgt“ in der Leiste.
   Optional: ab: "2026-11-23"  → das Kapitel erscheint erst ab diesem Tag,
   selbst wenn die Datei schon im Repo liegt. (Lehrkraft-Modus ignoriert das.)
   ============================================================ */
window.MM = window.MM || {};
MM.PIN = "2605";      // Lehrkraft-Modus: Logo links oben 4 s gedrückt halten, dann PIN

MM.LISTE = [
  { id:"k1", nr:1, titel:"Der Begriff der Funktion", untertitel:"Funktion, Funktionswert, Definitions- und Wertemenge",
    buch:"Kap. 1 · Abschnitt 2 · Der Begriff der Funktion · S. 11–14", datei:"kapitel/k1.js" },
  { id:"k2", nr:2, titel:"Mathe-Sprache", untertitel:"Zahlbereiche, Mengen, Intervalle und Aussagen",
    buch:"Kap. 1 · Check-in (S. 6–7) und Abschnitt 5 · S. 22–23", datei:"kapitel/k2.js" },
  { id:"k3", nr:3, titel:"Lineare Funktionen", untertitel:"", buch:"Kap. 1 · Abschnitt 3 · S. 15–19", datei:"kapitel/k3.js" },
  { id:"k4", nr:4, titel:"Geraden & Ungleichungen", untertitel:"", buch:"Kap. 1 · Abschnitt 4 und 5 · S. 20–24", datei:"kapitel/k4.js" },
  { id:"k5", nr:5, titel:"Parabeln", untertitel:"", buch:"Kap. 1 · Abschnitt 6 bis 8 · S. 25–35", datei:"kapitel/k5.js" }
];

/* ============================================================
   ABGABE · Wohin schicken die SuS ihren Stand (Pokalregal → „Stand senden“)?

   Standard: Der Teilen-Dialog des iPads. Dort wählen die SuS „Documents“ oder „Dateien“
   und legen die Datei im Ordner „Nachweise“ ab.
   url:     Link zum Abgabe-Ordner (z. B. Nextcloud „Datei-Anfrage“). Er erscheint als Knopf
            im Senden-Fenster. Leer lassen, wenn du ihn nicht brauchst.
   hinweis: Kurzer Satz, der im Senden-Fenster steht.
   tage:    Nach so vielen Tagen ohne Sicherung färbt sich die Anzeige im Pokalregal orange.
   ============================================================ */
MM.ABGABE = {
  url: "",
  hinweis: "Wähle im nächsten Fenster „Documents“ und den Ordner „Nachweise“.",
  tage: 7
};
