# Dokumente und PDF

Aufnahme-PDF und Dienstbericht sehen aus wie die App auf Papier: gleiche Schriften, keine Farbflächen außer bei Vorfall und Sanktion, schwarz-weiß druckbar.

## Gemeinsam

- A4 hochkant, Ränder 20 mm, Grundschrift Noto Sans 10,5 pt / 15 pt, Überschriften Noto Sans 600. Bettnummern und Zeiten in Atkinson Hyperlegible Mono.
- Kopfzeile jeder Seite: „Notübernachtung · St. Pius“ links, Dokumentart und Datum rechts, 8 pt in Grau (#46545C). Fußzeile: Seite x von y, Aufnahmenummer bzw. Berichtsdatum.
- Unterschriften als PNG in mindestens 300 dpi, Strich `stift-tinte` (#1B3A8C), auf einer Linie 0,5 pt mit Name und Uhrzeit darunter.
- Arabisch und Farsi: Noto Sans Arabic, Absätze rechtsbündig von rechts nach links; Bettnummern, Daten und Namen lateinisch.

## Aufnahme-PDF

1. Kopf: „Aufnahme 2026-27-0042“, Bett, Datum, Gast (Anzeigename, z. B. „Max (B2)“, und Nachname wenn vorhanden), aufgenommen von, Dauer („mehrere Nächte, ohne Enddatum“ oder „bis 09.10.“).
2. **Hausordnung auf Deutsch** – das ist das unterschriebene Dokument. Eingesetzte Werte halbfett.
3. Unterschriften Gast und Betreuung nebeneinander.
4. **Datenschutzerklärung auf Deutsch**, nur mit der Unterschrift des Gastes.
5. Bei anderer Sprache: **Anlage „Übersetzung der Hausordnung (Arabisch) – zum Verständnis, nicht unterschrieben“**. Auf dem Tablet liegen Deutsch und Übersetzung nebeneinander; im PDF steht die Übersetzung als eigene Seite hinter der deutschen Fassung.
6. Nachgeholte Unterschrift: gleiches PDF mit dem Vermerk „nachträglich unterschrieben am …“; auf Papier unterschriebene Hausordnung wird als Foto in der Gästedatenbank abgelegt.
Dateiname: `0042_Vorname_Nachname_2026-11-14.pdf` (ohne Nachname ohne diesen Teil; Umlaute ersetzt).

## Dienstbericht-PDF

1. Kopf: „Dienstbericht Dienstag, 14.11.2026“, Feiertag, Besetzung (Betreuung 1, Betreuung 2, Küche) mit Unterschriften (geplant / tatsächlich). Fehlt eine Unterschrift: im Feld „OHNE UNTERSCHRIFT“ (rot, Versalien) und oben ein roter Stempel „Ohne Unterschrift abgeschlossen: Jule“, nach dem Nachholen mit „· nachgeholt“ und Zeitpunkt unter der Unterschrift.
2. Bei Vorfall: Balken 2 pt in Rot (#B42318) links neben dem Titel und das Wort „Vorfall“; sonst keine Farbe.
3. Hinweise des Tages, dann alle Berichtsfelder in App-Reihenfolge als Tabelle „Feld | Eintrag“: Hat KHT angerufen?, Wichtige Hinweise, Fragen von Gästen, Abwesenheiten, Externe Gäste, Vorfälle, Schlüssel fehlt, Fehlt etwas, Sonstiges. Erwähnte Gäste halbfett, Stufenwörter halbfett mit Kartensymbol in Farbe.
4. Kennzahlen ohne Namen, Stand beim Abschließen: KHT-Nummer, freie Betten mit Ampelfarbe, „Hat KHT angerufen?“ Ja/Nein, St. Nikolaus belegt.
5. Sanktionen: Stufe mit Kartensymbol und genau einem Gast („Gelbe Karte: Felix (D5)“); weitere Erwähnte ohne Sanktion halbfett im Text.
6. „Fehlt etwas“: gewählte Chips und der Freitext.
7. Ergänzungen (nach dem Abschluss die einzige Änderung) unter einer Linie mit Datum, Uhrzeit, Name; jede Ergänzung erzeugt das PDF neu, Nextcloud hält die vorige Fassung. Archiv-Kommentare stehen nicht im PDF.
Dateiname: `2026-11-14_Dienstbericht.pdf`.

## Dienstnachweis-PDF

1. Kopf: „Dienstnachweis Betreuung · September 2026“ (bzw. Küche), Person, Erstellt am. Je Person und Bereich ein eigenes PDF.
2. Kennzahlen: Geplant (Originalplan), Gemacht, Abgegeben, Vertretung. Kein „krank“.
3. Tabelle je Tag: Datum, Geplant, Gemacht (Rolle), Bemerkung; Abweichungen halbfett.
4. Plankorrekturen mit Tagen, Grund, Person, Zeit.
5. Unterschrift der Person mit Datum und Uhrzeit, darunter „Nach der Unterschrift nicht mehr änderbar“.
Dateiname: `2026-09_Dienstnachweis_Betreuung_Robin.pdf` bzw. `2026-09_Dienstnachweis_Kueche_Jule.pdf`. Die Zahlen gehen zugleich als Zeile in die Lohntabelle des Bereichs: `Lohnabrechnung_2026-09_Betreuung.csv` bzw. `Lohnabrechnung_2026-09_Kueche.csv` (UTF-8 mit BOM, Semikolon; Spalten: Person; Personalnummer; Bereich; Monat; Geplant; Gemacht; Abgegeben; Vertretung; Unterschrieben; PDF). Ablage siehe Dateisystem.
