# Mathe-Master (TG Eingangsklasse)

Statische Lern-App. Kein Build, kein Server nötig. Läuft auf GitHub Pages (HTTPS) und kann auf dem iPad zum Home-Bildschirm hinzugefügt werden (Safari: Teilen → „Zum Home-Bildschirm“). Nach dem ersten Laden mit Netz funktioniert sie auch offline.

## Kapitel freischalten
Kapitel erscheinen, sobald ihre Datei im Ordner `kapitel/` liegt (`k3.js` usw.). Ohne Datei steht im Reiter „folgt“.
Die Liste der Kapitel steht in `kapitel/liste.js`. Optional kann ein Kapitel mit `ab:"2026-12-01"` erst ab einem Datum erscheinen.

## Üben im Mathegym
In `kapitel/mathegym.js` je Kapitel Einträge `{titel, wo, hinweis, url}` eintragen. Ist die Liste leer, wird der Button ausgeblendet.

## Lehrkraft-Modus
Logo links oben 4 Sekunden gedrückt halten, dann PIN eingeben. Die PIN steht in `kapitel/liste.js` (`MM.PIN`, Voreinstellung 2605). Sie ist im Quelltext lesbar und dient nur als Hürde für Schülerinnen und Schüler, nicht als Sicherheit.

## Ton
Dezente Klänge bei Erfolgen. Schalter (Lautsprecher-Symbol) oben rechts neben Hell/Auto/Dunkel.

## Neue Version veröffentlichen
Dateien im Repo ersetzen. Bei Netz lädt die App immer die neueste Version, ohne Netz nutzt sie die gespeicherte Kopie. Optional `MM.STAND` in `js/core.js` anpassen.

## Offline
`sw.js` speichert alle Dateien. Ein Kapitel, das erst nach dem letzten Netz-Besuch freigeschaltet wurde, braucht einmal Netz zum Laden. Der Lernstand liegt im Speicher des Geräts (Safari und Home-Bildschirm-App haben getrennten Speicher).
