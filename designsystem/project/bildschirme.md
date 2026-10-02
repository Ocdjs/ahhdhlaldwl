# Bildschirme

Jeder Bildschirm der App mit Aufbau und Bausteinen. Alle im Querformat 1280 × 800 dp, im Gerüst aus Navigationsleiste, Kopfzeile und Inhalt (Baustein **AppGeruest**). Die Regeln hinter Zahlen und Zuständen stehen in **Fachregeln**.

Navigation: **Bettenplan · Gäste · Dienst & Bericht · Kalender · Einstellungen**.

## 1 Bettenplan

**Hauptansicht** (Startbildschirm, zeigt immer den laufenden Diensttag; nie die Zukunft)
- Oben, beim Scrollen stehend, `nu-kennzahlen`: Ampel („5 Betten frei · Ampel grün · ohne Notbett“), **KHT-Zahlen** („24 belegt · 29 gesamt“, antippen öffnet die Rechnung Bett für Bett), „St. Pius 11 da · 4 erwartet“, „St. Nikolaus 7 von 7“. Kein Knopf „An KHT gemeldet“.
- Darunter die Reiter **St. Pius** und **St. Nikolaus** (`nu-reiter`, mit Zahl freier Betten) und rechts der Hauptknopf „Gast aufnehmen“.
- **St. Pius:** der Grundriss (Baustein **Grundriss**): Zimmer D (zwei Räume), Privaträume, T-Zimmer (Zugang über Zimmer F), Zimmer B, Flur, Bad, Zimmer F, Treppe; Betten als kompakte Bettkarten an ihrer Stelle. Rechts daneben untereinander Loggien L1–L5, Esszimmer E1, Tiny House TH1 und weitere Plätze Z1 …; Notbetten tragen „Notbett“.
- **St. Nikolaus:** Saal mit N1–N8 in zwei Reihen; Belegung wird jede Nacht fortgeschrieben.
- Unter 900 dp Breite: Zimmerrahmen untereinander statt Grundriss.
- **Vergangene Tage** (Pfeil zurück): Belegung jener Nacht, Pille „Nur lesen“, niemand „erwartet“; Tipp öffnet Gastdetails mit „Nachtrag hinzufügen“. Der Pfeil nach vorn ist am heutigen Tag gesperrt.

**Schnellauswahl** am Bett (`nu-schnell`) – siehe Baustein. „Nicht da“ fragt: „Weiter warten“, „Hat sich abgemeldet“, „Fehlt unentschuldigt“.

**Gastdetails** (`nu-detail`) rechts – siehe Baustein. Unteransichten im selben Bereich: „Abwesenheit“ (zurück am, Grund, „Bett bis dahin freihalten?“ Ja/Nein), **„Bett frei“** (statt „Auszug“: „Bett L5 freigeben? Ali zieht aus …“), „Bett wechseln“ (Plan im Auswahlmodus), „Sanktion“ (Stufe als `nu-wahl`, Grund Pflicht, bei Hausverbot „gültig bis“ oder unbefristet; gilt nur für diesen Gast), „Duschslot“, „Hausordnung nachholen“.

**KHT-Rechnung** (Blatt): Belegt, Gesamt, Frei groß; darunter je eine Zeile „Belegt“, „Frei“, „Nicht gezählt“ mit den Bettnummern.

## 2 Aufnahme (Assistent, Vollbild)

1. **Person:** Gästesuche mit Bettnummer je Treffer (`nu-treffer-bett`), Hausverbot oben. Neu anlegen mit Vorname (empfohlen), Nachname (freiwillig), Spitzname; bei vorhandenem Vornamen sofort der Hinweis mit allen Gleichnamigen.
2. **Dauer:** „1 Nacht“ oder „Mehrere Nächte“ (ohne Enddatum); Schalter „Enddatum festlegen“ mit Datum „Abreise am“ und +3/+7/+14 Nächte.
3. **Sprache der Übersetzung:** zehn `nu-wahl` mit Eigenname der Sprache.
4. **Hausordnung:** `nu-dokument-paar` – Deutsch links (wird unterschrieben), Übersetzung rechts; darunter zwei `nu-unterschrift`: Gast, Betreuung.
5. **Datenschutz:** nur Deutsch, ein `nu-unterschrift`: Gast.
6. **Abschluss:** Gast, Bett, Dauer, „Angezeigt als Ali (B2)“ bei gleichem Vornamen, Übersetzung, Aufnahmenummer, PDF-Name; Läuseschein-Pflicht bei mehreren Nächten. „Fertig“ setzt das Bett mit `is-neu` auf „anwesend“.

Bekannter Gast mit Unterschrift: nur Schritt 1, 2, 6. **Nachholen** (aus Gastdetails oder Gästedatenbank): Schritt 3, 4, 5, 6.

## 3 Gäste (Gästedatenbank)

- Links Suche (Name, Spitzname, Bettnummer), Filter „Alle · Mit Bett · Fehlt etwas · Hausverbot“, Liste mit Bettnummer und Warnsymbolen.
- Rechts die **Gastakte** (Baustein **Gastakte**): Kopf mit Bett und Anzeigename, „Im Plan“; Dokumente (Hausordnung, Datenschutz, Läuseschein, weitere) mit „Jetzt unterschreiben“ und „Dokument hinterlegen“; Sanktionen; Notizen und Erwähnungen.
- Keine Admin-PIN zum Ansehen und Hinterlegen.

## 4 Dienst & Bericht

**Dienst beginnen:** Leere Ansicht mit Datum und „Neuen Dienst beginnen“; gibt es einen offenen Bericht, öffnet er direkt.

**Bericht** (eine lange Seite, zweispaltig ab 1200 dp):
- Kopf: Datum, Besetzung (`nu-besetzung`) mit Unterschriften.
- Linke Spalte: Berichtsfelder in dieser Reihenfolge: Wichtige Hinweise (Freitext mit @ und Stufenwörtern, darunter die Sanktions-Zuordnung), **Hat KHT angerufen?** (mit den Zahlen), Vorfälle, **Fehlt etwas** (Chips und Freitext), Fragen von Gästen, Abwesenheit von Gästen (inkl. „fehlt unentschuldigt“), Schlüssel fehlt, Externe Gäste, Sonstiges.
- Rechte Spalte: Hinweise, Seit deinem letzten Dienst, Heute.
- Unten: „Bericht abschließen“ mit dem, was noch fehlt (Unterschriften, KHT-Anruf, Vorfälle, mehrdeutige @-Erwähnungen).
- Schreibmodus mit Bildschirmtastatur: rechte Spalte klappt ein, siehe Abschnitt Eingabe.

**Wer bekommt die Sanktion?** (Blatt aus der Zuordnung): alle im Absatz Genannten mit Bettnummer und bisherigen Sanktionen, dazu „Niemand“.

**Abgeschlossen:** `nu-gesperrt` mit „PDF ansehen“ und **„Teilen“** (Android-Teilen-Dialog, kein fester Empfänger); Nachträge darunter.

**Duschplan** (Reiter): Tagesauswahl Heute, Morgen, Übermorgen, In 3 Tagen; Raster der Slots.

**Archiv** (Reiter): Liste der Berichte, neueste oben, Vorfälle rot umrahmt; Filter und Volltextsuche.

**Hinweis anlegen:** Blatt mit Text, gültig bis, Priorität normal/wichtig.

## 5 Kalender

- **Standard: 7-Tage-Ansicht** (`nu-woche`): eine Spalte je Tag mit Nachtdienst, Küche und allen Terminen ungekürzt, „+ Termin“ unten. Kopf mit KW, Umschalter „7 Tage · Monat“, Pfeilen, „Heute“.
- Monat (`nu-monat`) auf Wunsch, Tag antippen zeigt ihn rechts.
- „Termin“ legt Aufgabe, Bettwäsche, Sondertermin, Feiertag an.
- **Dienstplan einlesen:** Quelle Nextcloud-Datei (PDF, ICS) oder Foto, dann Prüftabelle mit unsicheren Feldern in `warnung-flaeche`. Kein Import aus WhatsApp.

## 6 Einstellungen (Admin-PIN)

Einstieg über `nu-pin`, dann zweispaltig: links Gruppen, rechts Zeilen (`nu-einstellung`).
- **Betten und Zimmer:** je Zimmer eine Karte mit Zimmerschalter und **einem Schalter je Bett** (`nu-bettschalter`); in Loggien, Esszimmer, Tiny House und weiteren Plätzen der Chip „Notbett“; „Platz hinzufügen“ für Z1, Z2 …
- **Ampel und KHT:** Erklärung der Zählung mit „Rechnung“, Liste der Notbetten, Ampel-Schwelle, Meldung an die Ampel.
- Weitere Gruppen: Darstellung (Nachtmodus), Nextcloud-Verbindung, Abgleich, Hinweise, Texte und Sprachen, Saison und Löschfristen, Duschplan, Liste „Fehlt etwas“, Sicherheit (App-PIN, Sperre, Kiosk).
- **Löschlauf:** Vorschau „Folgendes wird gelöscht“ mit Anzahlen, Admin-PIN, Knopf `nu-btn--gefahr-voll`.

## Überall

- **Glocke** (`nu-glocke-liste`): Läuseschein, „Ben, F2 fehlt 2. Nacht“, neue Hinweise, Duschslots.
- **Einblendungen** (`nu-einblendung`), **Abgleich-Blatt** (aus `nu-sync`), **Dialoge** (`nu-dialog`).
- **App-Sperre:** `nu-pin` auf `grund`, über allem, nach 5 Minuten Inaktivität.
- **Leere Zustände:** ein Satz, was hier erscheint, und ein Knopf, wie man anfängt.
