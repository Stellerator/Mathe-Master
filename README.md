# Mathe-Master (TG Eingangsklasse)

Statische Lern-App. Kein Build, kein Server nötig. Läuft auf GitHub Pages (HTTPS) und kann auf dem iPad zum Home-Bildschirm hinzugefügt werden (Safari: Teilen → „Zum Home-Bildschirm“). Nach dem ersten Laden mit Netz funktioniert sie auch offline.

## Kapitel freischalten
Kapitel erscheinen, sobald ihre Datei im Ordner `kapitel/` liegt (`k3.js` usw.). Ohne Datei steht im Reiter „folgt“.
Die Liste der Kapitel steht in `kapitel/liste.js`. Optional kann ein Kapitel mit `ab:"2026-12-01"` erst ab einem Datum erscheinen.

## Wann geht eine Challenge auf?
Die Challenges öffnen in der Reihenfolge der Steckbriefe. Jede Challenge öffnet, sobald ihre Steckbriefe mit Mini-Check gelöst sind. Die Zuordnung steht je Kapitel in `braucht` (am Ende der Kapiteldatei, neben `challOrder`). Ohne Eintrag braucht eine Challenge alle Steckbriefe des Kapitels. Die Challenges in `challOrder` sollten so sortiert sein, dass sie in der Reihenfolge der Steckbriefe aufgehen. Die Steckbriefe selbst bleiben der Reihe nach. Die Lehrkraft-Ansicht öffnet alles.

## Üben im Mathegym
In `kapitel/mathegym.js` je Kapitel Einträge `{titel, wo, hinweis, url}` eintragen. Ist die Liste leer, wird der Button ausgeblendet.

## Lehrkraft-Modus
Logo links oben 4 Sekunden gedrückt halten, dann PIN eingeben. Die PIN steht in `kapitel/liste.js` (`MM.PIN`, Voreinstellung 2605). Sie ist im Quelltext lesbar und dient nur als Hürde für Schülerinnen und Schüler, nicht als Sicherheit.

## Nachweis: Meine Erfolge, Siegel, Aktivierungscode, Abgabe
**Ablauf für die Klasse:** Siegel-Symbol „Meine Erfolge“ (Startseite, neben den Kapiteln) → Aktivierungscode eingeben (einmalig) → „Stand senden“ → Datei im Ordner „Nachweise“ ablegen (Teilen-Dialog → Documents).

**Lehrkraft-Werkzeug:** Die Datei `Mathe-Master-Nachweise.html` liegt **nicht** in diesem Repo. Sie wird auf dem PC per Doppelklick im Browser geöffnet (funktioniert offline, nichts wird hochgeladen).
1. Hauptpasswort wählen (langer Satz). Es steht nicht in der App und wird nicht gespeichert. Das Kontrollkürzel zeigt, ob du es später gleich eingegeben hast. Ohne dieses Passwort lassen sich die Nachweise nicht mehr prüfen. Sicher aufbewahren.
2. Klassen anlegen: **WebUntis-Import** (PDF, Excel oder CSV, auch mehrere Klassen auf einmal; jede Person bekommt eine zufällige 3-stellige ID, gespeichert wird nur „Vorname N.“) oder Liste von Hand einfügen (eine Zeile pro Person: `ID Name`, ID aus 2 bis 8 Buchstaben/Ziffern). Klassen werden nur in deinem Browser gespeichert (abschaltbar, mit „Gespeicherte Daten löschen“). Kärtchen und Prüfung gehen für die aktive oder für alle Klassen. Mit eingetragener App-Adresse druckt das Kärtchen zusätzlich einen QR-Code zur App.
3. „Kärtchen erzeugen“: Aktivierungscodes als Tabelle/CSV oder als druckbare Kärtchen (10 pro A4-Seite).
4. „Nachweise prüfen“: Ordner „Nachweise“ aus der Nextcloud hineinziehen. Mehrere Dateien einer Person werden zusammengeführt, falsche Prüfsummen erscheinen unter „Auffällig“. Export als CSV.
Zu neuen Kapiteln brauchst du eine neue Version dieser Datei (sie kennt die Kapitelnamen). Unbekannte Kapitel werden trotzdem angezeigt, nur mit internen Namen.

**Abgabe einstellen:** `MM.ABGABE` in `kapitel/liste.js` (Link zum Ordner, Hinweistext, Erinnerungstage).

**Stand verloren?** Siegel-Symbol „Meine Erfolge“ → „Stand wiederherstellen“ mit der zuletzt gesendeten Datei oder dem Stand-Code (nur mit dem eigenen Aktivierungscode möglich). Die App bittet das Gerät, den Speicher zu behalten. Wichtig: Safari und die Home-Bildschirm-App haben getrennten Speicher. Die SuS sollten nur die Home-Bildschirm-App benutzen.

**Grenzen:** Jede Person kennt ihren eigenen Schlüssel und könnte mit Entwicklerwerkzeugen den eigenen Stand fälschen. Fremde IDs lassen sich nicht fälschen. Für Übungsnachweise reicht das, die KA bleibt der Leistungsnachweis. Die Aktivierung wird nur im Lehrkraft-Modus entfernt (Pokalregal).

## Ton
Dezente Klänge bei Erfolgen. Schalter (Lautsprecher-Symbol) oben rechts neben Hell/Auto/Dunkel.

## Neue Version veröffentlichen
Dateien im Repo ersetzen. Bei Netz lädt die App immer die neueste Version, ohne Netz nutzt sie die gespeicherte Kopie. Optional `MM.STAND` in `js/core.js` anpassen. **Für den Update-Hinweis** („Neue Version verfügbar“, erscheint beim Zurückkehren in die App, auch vom Home-Bildschirm) bei jeder Veröffentlichung `MM.VERSION` oder `MM.STAND` in `js/core.js` ändern. Sonst erkennen die Geräte die neue Fassung nicht.

## Offline
`sw.js` speichert alle Dateien. Ein Kapitel, das erst nach dem letzten Netz-Besuch freigeschaltet wurde, braucht einmal Netz zum Laden. Der Lernstand liegt im Speicher des Geräts (Safari und Home-Bildschirm-App haben getrennten Speicher).
