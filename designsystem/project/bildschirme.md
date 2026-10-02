# Bildschirme

Jeder Bildschirm der App mit Aufbau und Bausteinen. Alle im Querformat 1280 × 800 dp, im Gerüst aus Navigationsleiste, Kopfzeile und Inhalt (Baustein **AppGeruest**). Die Regeln hinter Zahlen und Zuständen stehen in **Fachregeln**.

Navigation: **Bettenplan · Gäste · Dienst & Bericht · Kalender · Einstellungen**.

## 1 Bettenplan

**Hauptansicht** (Startbildschirm, zeigt immer den laufenden Diensttag; nie die Zukunft)
- Oben, beim Scrollen stehend, `nu-kennzahlen`: Ampel („6 Betten frei · Ampel grün“), **KHT-Nummer** (nur die Zahl der belegten Betten, antippbar für einen Satz zur Regel), „St. Pius 12 da · 4 erwartet“, „St. Nikolaus 7 von 8“.
- Darunter die Reiter **St. Pius** und **St. Nikolaus** (`nu-reiter`, mit Zahl freier Betten) und rechts der Hauptknopf „Gast aufnehmen“.
- **St. Pius:** der Grundriss (Baustein **Grundriss**): Zimmer D (zwei Räume), Privaträume, T-Zimmer (Zugang über Zimmer F), Zimmer B, Flur, Bad, Zimmer F, Treppe; Betten als kompakte Bettkarten an ihrer Stelle. Rechts daneben untereinander Loggien L1–L5, Esszimmer E1, Tiny House TH1 und weitere Plätze Z1 …; Notbetten tragen „Notbett“.
- **Bad** im Grundriss (Baustein Tür und Bad): zu während der Duschzeit, Erinnerung „Bad aufschließen“ (Glocke und Einblendung), wenn alle geduscht haben; kurz antippen = frei. Ganz gesperrte Zimmer und das abgeschlossene Bad zeigen eine geschlossene Tür (animiert).
- **St. Nikolaus:** Saal mit N1–N8 in zwei Reihen, rechts daneben die weiteren Plätze (z. B. N9); Belegung wird jede Nacht fortgeschrieben. Aufnahme dort nur mit Person und Abschluss, ohne Hausordnung und Unterschrift.
- Unter 900 dp Breite: Zimmerrahmen untereinander statt Grundriss.
- **Vergangene Tage** (Pfeil zurück): Belegung jener Nacht, Pille „Nur lesen“, niemand „erwartet“; Tipp öffnet Gastdetails mit „Notiz hinzufügen“. Der Pfeil nach vorn ist am heutigen Tag gesperrt.

**Schnellauswahl** am Bett (`nu-schnell`) – siehe Baustein. „Nicht da“ fragt: „Weiter warten“, „Hat sich abgemeldet“, „Fehlt unentschuldigt“.

**Gastdetails** (`nu-detail`) rechts – siehe Baustein. Unteransichten im selben Bereich: „Abwesenheit“ (zurück am, Grund, „Bett bis dahin freihalten?“ Ja/Nein), **„Bett frei“** (statt „Auszug“: „Bett L5 freigeben? Max zieht aus …“), „Bett wechseln“ (Plan im Auswahlmodus), „Sanktion“ (Stufe als `nu-wahl`, Grund Pflicht, bei Hausverbot „gültig bis“ oder unbefristet; gilt nur für diesen Gast), „Duschslot“, „Hausordnung nachholen“.

**KHT-Nummer** (Blatt): Belegt und Frei groß, darunter ein Satz: Notbetten zählen nur, wenn belegt (Kältebus); wer zwei Nächte in Folge unentschuldigt fehlt, zählt nicht.

## 2 Aufnahme (Assistent, Vollbild)

1. **Person:** Gästesuche mit Bettnummer je Treffer (`nu-treffer-bett`), Hausverbot oben. Neu anlegen mit Vorname (empfohlen), Nachname (freiwillig), Spitzname; bei vorhandenem Vornamen sofort der Hinweis mit allen Gleichnamigen.
2. **Dauer:** „1 Nacht“ oder „Mehrere Nächte“ (ohne Enddatum); Schalter „Enddatum festlegen“ mit Datum „Abreise am“ und +3/+7/+14 Nächte.
3. **Sprache der Übersetzung:** zehn `nu-wahl` mit Eigenname der Sprache.
4. **Hausordnung:** `nu-dokument-paar` – Deutsch links (wird unterschrieben), Übersetzung rechts; darunter zwei `nu-unterschrift`: Gast, Betreuung.
5. **Datenschutz:** nur Deutsch, ein `nu-unterschrift`: Gast.
6. **Abschluss:** Gast, Bett, Dauer, „Angezeigt als Max (B2)“ bei gleichem Vornamen, Übersetzung, Aufnahmenummer, PDF-Name; Läuseschein-Pflicht bei mehreren Nächten. „Fertig“ setzt das Bett mit `is-neu` auf „anwesend“.

**Wiederaufnahme:** Hat der gewählte Gast Notizen mit „bei Wiederaufnahme“ (z. B. ein wichtiger Hinweis der Leitung aus dem Archiv), öffnet sich sofort der Dialog „Hinweis zu Max (Mustermann)“ mit „Nicht mehr zeigen“ und „Verstanden“.

Bekannter Gast mit Unterschrift: nur Schritt 1, 2, 6. **Nachholen** (aus Gastdetails oder Gästedatenbank): Schritt 3, 4, 5, 6.

## 3 Gäste (Gästedatenbank)

- Links Suche (Name, Spitzname, Bettnummer), Filter „Alle · Mit Bett · Fehlt etwas · Hausverbot“, Liste mit Bettnummer und Warnsymbolen.
- Rechts die **Gastakte** (Baustein **Gastakte**): Kopf mit Bett und Anzeigename, „Im Plan“; Dokumente (Hausordnung, Datenschutz, Läuseschein, weitere) mit „Jetzt unterschreiben“ und „Dokument hinterlegen“; Sanktionen; Notizen und Erwähnungen.
- Keine Admin-PIN zum Ansehen und Hinterlegen.

## 4 Dienst & Bericht

**Dienst beginnen:** Leere Ansicht mit Datum und „Neuen Dienst beginnen“; gibt es einen offenen Bericht, öffnet er direkt.

**Bericht** (eine lange Seite, zweispaltig ab 1200 dp):
- Kopf: Datum, Besetzung (`nu-besetzung`) mit Unterschriften.
- Linke Spalte: Berichtsfelder in dieser Reihenfolge: **Hat KHT angerufen?** (mit KHT-Nummer), **Wichtige Hinweise** (Freitext mit @ und Stufenwörtern, darunter die Sanktions-Zuordnung), Fragen von Gästen, Abwesenheiten (inkl. „fehlt unentschuldigt“), Externe Gäste, Vorfälle, Schlüssel fehlt, **Fehlt etwas** (Chips und Freitext), Sonstiges. Die Besetzung (Betreuung und Küche) steht davor im Kopf.
- Rechte Spalte: Hinweise (Bettwäschewechsel des Tages als wichtiger Hinweis zuerst), Seit deinem letzten Dienst, Heute.
- Unten: „Bericht abschließen“ mit dem, was noch fehlt (KHT-Anruf, Vorfälle, mehrdeutige @-Erwähnungen); fehlende Unterschriften stehen als „geht auch ohne“ dabei.
- Schreibmodus mit Bildschirmtastatur: rechte Spalte klappt ein, siehe Abschnitt Eingabe.

**Wer bekommt die Sanktion?** (Blatt aus der Zuordnung): alle im Absatz Genannten mit Bettnummer und bisherigen Sanktionen, dazu „Niemand“.

**Ohne Unterschrift abschließen** (Dialog): „Wirklich ohne Unterschrift abschließen?“ mit Namen und Rolle, bei der Küche „Der Küchendienst geht oft früher, das ist in Ordnung.“; „Zurück“ / „Ja, trotzdem abschließen“.

**Abgeschlossen:** `nu-gesperrt` mit Pille „ohne Unterschrift: Jule“, „nicht mehr änderbar, nur ergänzen“, „PDF ansehen“ (Vorschau mit Stempel) und **„Teilen“** (Android-Teilen-Dialog, kein fester Empfänger); in der Besetzung „Unterschrift nachholen“; Ergänzungen darunter, Knopf „Ergänzen“.

**Duschplan** (Reiter): Tagesauswahl Heute, Morgen, Übermorgen, In 3 Tagen; Raster der Slots.

**Archiv** (Reiter, siehe Archivkarte): oben **Hinweise für die nächsten Dienste** („Hinweis hinterlegen“, laufende und geplante mit „Beenden“, abgelaufene eingeklappt), dann **Fehlt etwas** zum Abhaken, dann die Berichte, neueste oben, Vorfälle rot umrahmt. Je Bericht: Frage von Gästen mit „Antworten“, Fehlt-Pillen, Kommentare, „Kommentieren“ und „Wichtiger Hinweis“. Filter und Volltextsuche.

**Kommentar / Antwort / Wichtiger Hinweis** (Blatt): Von (Leitung vorgewählt), Art, Text, betroffener Gast (mit „erscheint bei der Wiederaufnahme“), „Oben im Dienst zeigen“ (Nur im Archiv, Nächster Dienst, 3 Tage, 1 Woche, Bis Datum).

**Hinweis anlegen:** Blatt mit „Von“ (Chips: Leitung, Personen im Dienst, übriges Team; im Archiv ist Leitung vorgewählt), Text, „Wie lange anzeigen?“ (Nächster Dienst, 3 Tage, 1 Woche, 2 Wochen, Bis Datum), wichtig.

**Monatsabschluss** (Reiter): Monat wählen, getrennt nach **Betreuung** und **Küche** je eine Übersicht mit Geplant, Gemacht, Abweichung, Status; „Öffnen“ zeigt den **Dienstnachweis** des Bereichs mit Tageszeilen, „Geplante Dienste korrigieren“ (Warnung, Pflichtgrund) und Unterschriftsfeld (ohne PIN); darunter zwei Lohntabellen (Betreuung, Küche). Beim letzten geplanten Dienst einer Person erscheint oben im Bericht ein freiwilliger Hinweis.

**Person tauschen** (Besetzung): Grund Tausch oder Sonstiges, dann die Person.

## 5 Kalender

- **Standard: 7-Tage-Ansicht** (`nu-woche`): eine Spalte je Tag mit Betreuung 1, Betreuung 2 und Küche als Zeilen (`nu-dienstzeile`) und allen Terminen ungekürzt, „+ Termin“ unten. Kopf mit KW, Umschalter „7 Tage · Monat“, Pfeilen, „Heute“, **„Ändern“**.
- **Geändert** markiert: Zeile auf `warnung-flaeche` mit Strich links, „· geändert“, Originalname durchgestrichen; antippen zeigt wer, wann, warum.
- **Ändern** (Admin-PIN): Dienste und Termine ab heute antippbar. Blatt „Dienst ändern“ mit Person, **„Wer ändert?“ (Pflicht)**, Grund, Notiz; Blatt „Termin ändern“ mit Titel, Datum, Art, „Wer ändert?“, Löschen. Der Originalplan bleibt für den Monatsabschluss.
- Monat (`nu-monat`) auf Wunsch, Tag antippen zeigt ihn rechts (mit denselben Dienstzeilen).
- „Termin“ legt Aufgabe, Bettwäsche, Sondertermin, Feiertag an. Bettwäsche erscheint am Tag als wichtiger Hinweis.
- Dienstplan einlesen liegt in den Einstellungen. Kein Import aus WhatsApp.

## 6 Einstellungen (Admin-PIN)

Einstieg über `nu-pin`, dann zweispaltig: links Gruppen, rechts Zeilen (`nu-einstellung`).
- **Betten und Zimmer:** je Zimmer eine Karte mit „Nummern tauschen“, Zimmerschalter und **einem Schalter je Bett** (`nu-bettschalter`); Chip „Notbett“ in Loggien, Esszimmer, Tiny House und weiteren Plätzen; „Platz hinzufügen“ mit Nummer und Bezeichnung für St. Pius und St. Nikolaus, Umbenennen und Entfernen.
- **Ampel und KHT:** KHT-Nummer mit „Ansehen“, Notbetten (nur Kältebus), Ampel-Schwelle, Meldung an die Ampel.
- **Dienstplan einlesen** (siehe Baustein): einmal zu Monatsbeginn durch die Leitung; Foto oder Datei aus Nextcloud, dann Prüfmaske Tag für Tag (Ausschnitt aus dem Foto links, je Rolle Chips rechts, Unsicheres muss angetippt werden), am Ende „Als Originalplan speichern“.
- Weitere Gruppen: Darstellung (Nachtmodus), Nextcloud-Verbindung, Abgleich, Hinweise, Texte und Sprachen, Saison und Löschfristen, Duschplan, Liste „Fehlt etwas“, Sicherheit (App-PIN, Sperre, Kiosk).
- **Löschlauf:** Vorschau „Folgendes wird gelöscht“ mit Anzahlen, Admin-PIN, Knopf `nu-btn--gefahr-voll`.

## Überall

- **Glocke** (`nu-glocke-liste`): Läuseschein, „Simon, F2 fehlt 2. Nacht“, neue Hinweise, Bettwäschewechsel heute, „Bad aufschließen“, Duschslots.
- **Einblendungen** (`nu-einblendung`), **Abgleich-Blatt** (aus `nu-sync`), **Dialoge** (`nu-dialog`).
- **App-Sperre:** `nu-pin` auf `grund`, über allem, nach 5 Minuten Inaktivität.
- **Leere Zustände:** ein Satz, was hier erscheint, und ein Knopf, wie man anfängt.
