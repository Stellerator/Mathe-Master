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
Dateien im Repo ersetzen. Bei Netz lädt die App immer die neueste Version, ohne Netz nutzt sie die gespeicherte Kopie. **Für den Update-Hinweis** („Neue Version verfügbar“, erscheint beim Zurückkehren in die App, auch vom Home-Bildschirm) bei jeder Veröffentlichung `MM.VERSION` oder `MM.STAND` in `kapitel/stand.js` ändern. Die Nachweise-App V2 erzeugt diese Datei im Abschnitt „4 · Einstellungen“ mit dem heutigen Datum. Sonst erkennen die Geräte die neue Fassung nicht.

## Aktualisieren-Knopf
Unten in der App steht neben „Fortschritt zurücksetzen“ der Knopf „Aktualisieren“. Er holt alle App-Dateien frisch vom Server (am Zwischenspeicher des Browsers vorbei), erneuert die Offline-Kopie und lädt die App neu. Fortschritt, ID und Einstellungen bleiben erhalten. Ohne Netz bleibt die gespeicherte Version bestehen. Nach einem Upload auf GitHub Pages dauert es manchmal ein bis zwei Minuten, bis der Server die neuen Dateien ausliefert.

## Offline
`sw.js` speichert alle Dateien. Ein Kapitel, das erst nach dem letzten Netz-Besuch freigeschaltet wurde, braucht einmal Netz zum Laden. Der Lernstand liegt im Speicher des Geräts (Safari und Home-Bildschirm-App haben getrennten Speicher).

## V2 (in Arbeit, Arbeitskopie)
- **Wiederholen** (Tab auf der Startseite): Ziel/Termin aus `kapitel/termine.js`, Übungsrhythmus, freiwillige Serie, gemischte Runde. Ändert keinen Lernstand, schreibt nur in `P.x` (Fehlerlog je Challenge und Level).
- **Eingabe-Aufgaben** (`js/eingabe.js`): `numInputTask`, `termInputTask`, `openTask` (mehrere richtige Lösungen), `selfCheckTask` (Heft mit Karopapier, Punkteraster, Selbstbewertung). Zahlen und Terme werden nachsichtig gelesen (2,5 · −3 · 2/3 · 2x+3 · 2(x+1)). Hauptform wird getrennt geprüft.
- **Schritt-für-Schritt-Beispiele** in Steckbriefen: Feld `beispiele:[{titel,aufgabe,steps,frei?}]`; mit `frei` fehlt der letzte Schritt.
- Tests liegen nicht im Repo, sondern in `_testwerkzeuge/` (`node test.js`, `node dom-test.js`).
- **Level im neuen Format** (`lv.gens:[ {g:Generator, steck:"schluessel"} ]` statt `lv.make`): nach einem Fehler „gleiche Idee, neue Zahlen“ (Übung, zählt nicht), Runde endet sofort, wenn die Hürde nicht mehr zu schaffen ist, zweiter Versuch mit neuen Aufgaben, dritter erst am nächsten Tag. Alte Level (`lv.make`) bleiben unverändert.
- **Fehlersteckbrief:** Die Auswertung zeigt zu den Fehlern den passenden Steckbrief samt Rechenbeispiel (ohne `steck` am Generator: letzter Steckbrief aus `braucht`). Tab **Nachschlagen** sammelt alle Steckbriefe der freigeschalteten Kapitel.
- **Kapitel „Lineare Funktionen – Vertiefung“** (`kapitel/k3v.js`, Eintrag `3V` in `liste.js`): 4 Steckbriefe mit Beispielen (Punkt-Steigungs-Form, Gleichungsformen, Linear oder nicht?, Steigung in Prozent), 3 Challenges im neuen Level-Format. Zum Freischalten die Datei ins Repo legen oder in `liste.js` ein Datum `ab:"…"` setzen.
- Ton: Die Oberfläche zeigt das Geschaffte („5 Runden geschafft“, „3 richtig“), keine Gesamtmengen oder Restzahlen.
- **Kapitel 4 „Geraden & Ungleichungen“** (`kapitel/k4.js`, nach Buch S. 20–24): 5 Steckbriefe mit Beispielen (Lage von Geraden, Schnittpunkt, orthogonale und besondere Geraden, Ungleichungen lösen, grafisch lösen), 2 Challenges (Lage von Geraden, Ungleichungen). Neue Eingabearten: Schnittpunkt (zwei Felder) und Ungleichung (`x>-1`, `x≥7`, `L=]-1;∞[`).
- **Probe- und Übungsarbeit** (`js/arbeit.js`, als Karten auf der Seite „Wiederholen“, kein eigenes Symbol): **Übungsarbeit** (8 Aufgaben, Zahlen aus dem Aktivierungscode, Rechnen im Heft, Lösung kontrollieren, Selbstbewertung, davon 2 Heft-Aufgaben) und **Probearbeit** (5 Aufgaben, Richtzeit 20 Min., keine Rückmeldung bis zur Auswertung mit Musterlösungen). Ergebnisse gehen ins Fehlerprofil und in `P.x.arb`; „Gezielt üben“ startet eine Wiederholungsrunde zu den schwachen Themen.
- **Serien-Flamme:** Ist ein Ziel gesetzt und die Option „Übungs-Serie anzeigen und beim Öffnen erinnern“ eingeschaltet, steht in der Kopfzeile neben „Wiederholen“ eine kleine Flamme (mit Punkt, solange heute noch keine Runde gemacht wurde, grüner Rand danach). Ein Klick öffnet ein Fenster mit der Serie und „Jetzt üben“ bzw. „Noch eine Runde“; von dort geht es auch zur Übungsseite.
- **Ziel individuell:** Beim Ziel setzen wählt man Termin, **Aufgaben pro Runde** (5, 8, 10, 15 oder 20) und die **Kapitel**, die dran sind. Beides lässt sich später unter „Anpassen“ ändern. Vorgaben aus `kapitel/termine.js` (`kapitel:[…]`) sind die Voreinstellung.

## Nachweis-Format 2 und Nachweise-App Version 2
- **Stand-Datei:** bleibt `mm:1`. Neu ist ein Zusatzblock `x` mit eigener Prüfsumme `h2` (gleicher Personenschlüssel). Er enthält je Thema (Challenge und Level) Aufgaben und Fehler, die Übungstage, Wiederholungsrunden, die Serie und die letzten Probe- und Übungsarbeiten. **Keine Namen, keine einzelnen Antworten.** Die bisherige Prüfsumme `h` deckt weiter nur Karten, Levels und Bestwerte ab: Die alte Nachweise-App liest neue Stände unverändert, ohne das Fehlerprofil zu sehen.
- **Senden:** Der Dialog „Stand senden“ nennt den Schülerinnen und Schülern, was zusätzlich enthalten ist. Auch reines Üben (ohne neuen Level) setzt den Hinweis „Neuer Stand seit der letzten Sicherung“.
- **Sicherung und Wiederherstellen sind vollständig:** Der Zusatzblock enthält zusätzlich einen Wiederherstellungs-Teil (`rs`: Übungstage, Runden, Ziel, „zuletzt geübt“, Hausaufgaben im Detail, Plus-Tage). „Stand wiederherstellen“ (Datei oder Stand-Code) holt Karten, Levels, Bestwerte **und** Fehlerprofil, Übungstage und Serie, Wiederholungsrunden, Ziel, Probe-/Übungsarbeiten, Hausaufgaben und Plus-Aufgaben zurück. Es wird nur dazugeholt, nie etwas überschrieben, was schon gleich viel oder mehr ist. Ist der Zusatzteil verändert, wird er abgewiesen (mit Hinweis), der Lernstand kommt trotzdem zurück. Nicht gesichert: Darstellung (hell/dunkel), Ton, gewähltes Kapitel und die Tagessperre nach zwei verpassten Versuchen.
- **Update von der alten Version:** Die Speicherschlüssel sind unverändert (`mathe-master-v1`, `-id`, `-theme`, `-sound`, `-kapitel`). Karten, Levels, Bestwerte und Aktivierung bleiben beim Update exakt erhalten (getestet mit `_testwerkzeuge/upgrade-test.js`).
- **Lehrkraft-Werkzeug:** `Mathe-Master-Nachweise_V2.html` (liegt **nicht** im Repo, die alte Datei bleibt unverändert). Neu: Kapitel 3+ und 4 mit ihren Namen, **Häufigste Stolpersteine der Klasse** (Themen mit mindestens 6 Aufgaben von mindestens 2 Personen, mit passendem Steckbrief), **Übungstage und Arbeiten** je Person, **Einzelprofil** und CSV-Export (Stolpersteine, Fehlerprofil, Übung). Ungültige Zusatzdaten werden unter „Auffällig“ gemeldet, der Lernstand zählt trotzdem.
- Bei neuen Kapiteln: `node gen_meta.js > meta.json` und `python build_tool.py` im Ordner `_testwerkzeuge` erzeugen die Datei neu.

## Hausaufgaben, Forder-Aufgaben, Hinweise
- **Hausaufgaben** (`kapitel/hausaufgaben.js`, Aufbau und Beispiel stehen als Kommentar in der Datei): eigener Bereich auf der Startseite, getrennt vom Lernpfad. Jede Hausaufgabe hat Titel, Frist und 1 bis 3 Bausteine: App-Aufgaben aus einem vorhandenen Level (Zahlen aus dem Aktivierungscode, mehrere Runden bis zur Frist, die beste zählt, Schwelle z. B. 3 von 5), ein Papier-Teil (Ampel: sicher / geht so / unsicher) und ein Mathegym-Auftrag (Link und „erledigt“). Pflicht heißt „bearbeitet“. Der Zeitstempel der Bearbeitung steht im Nachweis, abgegeben wird mit „Stand senden“ (eine Datei pro Woche). Ohne Aktivierungscode gibt es keine eigenen Zahlen. Ist die Liste leer, erscheint der Bereich nicht.
- **Plus-Aufgaben** (`kapitel/forder.js`): 3 Aufgaben je Kapitel (rückwärts rechnen, Fehler finden, mehrstufig, modellieren, offene Aufgaben). Kleine **Plus-Kachel** am Ende des Lernpfads jedes Kapitels, kleiner als die Stationen (mit Häkchen statt Plus, wenn alles gelöst), beliebig viele Versuche mit neuen Zahlen. Alle drei gelöst: eigenes **Plus-Siegel** unter „Meine Erfolge“ und eigene Spalte in der Nachweise-App. Zählt nicht für den Lernpfad.
- **Hinweisstufen** (nur Level im neuen Format `lv.gens`): Knopf „Hinweis“ mit zwei Stufen aus dem passenden Steckbrief (1: Merke, 2: Formel und Beginn des Beispiels). Die Auswertung weist aus „davon 1 mit Hinweis“. Die Treffer zählen weiter normal.
- **Nachweise-App V2** zeigt zusätzlich die **Hausaufgaben-Matrix** (erledigt, zu spät, teilweise, offen, fehlt; CSV-Export; optional `kapitel/hausaufgaben.js` laden, damit auch noch nicht begonnene Hausaufgaben erscheinen) und die Spalte **Plus** in der Tabelle.
- **Hausaufgaben stellen ohne Editor:** In `Mathe-Master-Nachweise_V2.html` gibt es den Abschnitt **„3 · Hausaufgaben erstellen“**. Formular mit Titel, Frist, optional Sichtbar-ab und bis zu 3 Bausteinen (App-Aufgaben mit Kapitel, Challenge, Level, Anzahl und Schwelle; Heft-Aufgabe; Mathegym-Link). Es meldet fehlende Angaben, kann die bisherige `hausaufgaben.js` laden, Hausaufgaben duplizieren und löschen und erzeugt die fertige Datei zum Speichern oder Kopieren. Die Entwürfe bleiben im Browser gespeichert. Die Hausaufgaben erscheinen sofort auch in der Hausaufgaben-Tabelle von Abschnitt 2.
- **Hausaufgabe im Lernpfad sichtbar:** Von „Sichtbar ab“ bis zum Fristtag ist die Kachel der zugehörigen Challenge orange hervorgehoben und trägt den Hinweis „HA · Level 2“ (Tooltip: Abgabedatum). Ist die Hausaufgabe erledigt, bleibt ein ruhiges „HA ✓“. Nach der Frist verschwindet die Markierung.


## Einstellungen ohne Editor (Nachweise-App V2, Abschnitt 4)

Klassenarbeiten (`termine.js`), Mathegym-Aufgaben (`mathegym.js`), Kapitel-Freigabe per Datum, Abgabe-Link und Lehrkraft-PIN (`liste.js`) und das Datum des Standes (`stand.js`) werden im Abschnitt „4 · Einstellungen“ der Nachweise-App V2 eingestellt. Die Felder sind mit dem Stand der Dateien beim Bau der Nachweise-App vorbelegt. Aktuelle Dateien (oder den ganzen Ordner `kapitel`) kannst du per Drag and drop hineinziehen; es werden nur `termine.js`, `mathegym.js`, `liste.js`, `stand.js` und `hausaufgaben.js` gelesen. Gespeichert wird als Download, danach die Dateien im Repo ersetzen. Drag and drop gilt auch beim „Nachweise prüfen“ (mehrere Dateien und Ordner). Hinweis: Der PIN steht im Klartext in `liste.js`.
