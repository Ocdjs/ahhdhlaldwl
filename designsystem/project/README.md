Die Notübernachtungs-App ersetzt die Papierlisten einer kleinen Notübernachtung der Kältehilfe auf einem Samsung-Tablet im Querformat: Bettenplan mit Grundriss, Aufnahme mit Unterschrift, Gästedatenbank, Dienstbericht, Duschplan und Kalender. Bedient wird sie nachts von wechselnden, oft ehrenamtlichen Betreuer*innen, mit Finger, S Pen und Tastatur. Dieses System legt fest, wie die App aussieht und sich bewegt; die Funktionen stehen in der Funktionsbeschreibung, die Bildschirme im Abschnitt **Bildschirme**, die Regeln hinter den Zahlen und Zuständen (KHT-Zählung, „fehlt“, gleiche Vornamen, Sanktionen) im Abschnitt **Fachregeln**, die Umsetzung in Jetpack Compose im Abschnitt **Android**.

Ein klickbarer Prototyp ohne Nextcloud zeigt alle Bausteine im Zusammenspiel: https://claude.ai/artifact/WnuQMizHu67mZ9sqQxH2v6 . Er nutzt dieselben Werte und dasselbe Stylesheet (`components/bundle.css`); wo Prototyp und dieses System voneinander abweichen, gilt das System.

## Grundsätze

Die App folgt minimalistischer App-Gestaltung: alles im Bild hat eine Aufgabe, das Wichtige steht vorne, der Rest tritt zurück.

1. **Weniger ist mehr.** Zeige nur, was die Person in diesem Moment braucht. Seltenes (Archiv, Import, Korrekturen) liegt eine Ebene tiefer.
2. **Klare Rangfolge.** Zuerst Zahlen (Ampel, Belegung), dann der Plan, dann das einzelne Bett. Große Schrift nur für Namen und Zahlen.
3. **Weißraum statt Linien.** Trenne Abschnitte mit `abstand-5` bis `abstand-7` oder einem Flächenwechsel (`grund` → `flaeche` → `flaeche-2`). Linien zeichnen nur Wände, Felder und Unterschriftszeilen.
4. **Farbe heißt Zustand.** Die Bedienung ist Tinte (`primaer`), Farbe gehört dem Bettstatus, der Ampel, Warnungen und Sanktionen. Jede Farbe kommt mit Wort oder Symbol.
5. **Flach.** Keine Verläufe, keine Schatten auf ruhenden Elementen. Schatten gibt es nur für Dinge, die gerade schweben (`schatten-schwebend`) oder gezogen werden (`schatten-gehoben`).
6. **Wenig Aufwand.** Check-in und Duschslot in höchstens drei Tipps, Ziele ab 48 dp, jede Eingabe sofort gespeichert.
7. **Rückmeldung.** Jede Handlung bestätigt sich sichtbar und kurz (siehe Bewegung). Nichts blinkt dauerhaft.
8. **Für die Nacht.** Der Nachtmodus ist kein Nachgedanke: er ist dunkel, blendet nicht und hält dieselben Kontraste.

## Sprache

Oberfläche auf Deutsch, du-Form gegenüber dem Team („Seit deinem letzten Dienst“), sachlich, ohne Ausrufezeichen und ohne Emojis. Knöpfe sind Verben, die sagen, was passiert: „Gast aufnehmen“, „Ist da“, „Bericht abschließen“, „Tauschen“. Nie „OK“. Fehlermeldungen sagen, was fehlt und was zu tun ist: „Es fehlt die Unterschrift von Silke.“

Feste Wörter, in App, Datenmodell und PDF gleich:

| Wort | Bedeutung | nicht |
| --- | --- | --- |
| Gast | Person, die übernachtet oder als externer Gast erfasst ist | Klient, Bewohner |
| St. Pius, St. Nikolaus | die beiden Standorte | Haupthaus |
| frei, erwartet, anwesend, fehlt, freigehalten bis, frei bis, gesperrt | Bettstatus | reserviert, deaktiviert |
| fehlt (unentschuldigt) | heute ohne Bescheid nicht gekommen; 1. Nacht zählt belegt, ab der 2. Nacht in Folge frei | No-Show, abwesend |
| belegt, gesamt, frei | nur die Zahlen für das Kältehilfetelefon und die Ampel | Belegung (als Status) |
| Notbett | Bett, das nicht für das Kältehilfetelefon zählt (L3, E1) | Reservebett |
| Aufnahme | erstes Erfassen mit Hausordnung und Unterschrift | Anmeldung |
| Check-in, „Ist da“ | ein erwarteter Gast ist heute gekommen | einchecken bestätigen |
| Abwesenheit, Bett frei | angekündigt weg; ausgezogen, Bett ist ab heute frei | Abmeldung, Auszug |
| Diensttag, Dienstbericht | eine Nacht 18:45–08:00 und ihr Protokoll | Schicht, Tagesplan |
| Hinweis | wichtige Information fürs Team | Info, Nachricht |
| Verwarnung, Gelbe Karte, Hausverbot | Sanktionsstufen; „Rote Karte“ = Hausverbot | Sperre |
| Läuseschein | Bescheinigung über Läusefreiheit | Attest |
| Gästedatenbank, Gastakte | alle Gäste mit Dokumenten, Sanktionen, Notizen | Kartei, Kundenliste |
| nachholen, hinterlegen | Unterschrift später geben; Dokument später ablegen | nachreichen |
| Hat KHT angerufen? | Pflichtfeld im Bericht | An KHT gemeldet |
| Teilen | PDF über den Teilen-Dialog, Empfänger frei wählbar | Senden an … |
| Abgleich | Synchronisation mit Nextcloud | Sync, Upload |

Abkürzungen nur für Bettnummern (D4, N3, L2, E1, TH1, Z1), Aufnahmenummern (2026-27-0042) und KHT (beim ersten Auftreten „Kältehilfetelefon“). Zählen positiv: „3 von 8 frei“.

**Gleiche Vornamen** unterscheidet die Bettnummer: „Ali (D4)“, „Ali (L5)“. Ohne Bett steht der Nachname, sonst der Spitzname, sonst die Aufnahmenummer in Klammern. Das gilt überall, auch in Erwähnungen („@Ali (D4)“) und im PDF.

## Farben und Zustände

Zwei Modi: **Tag** und **Nacht**. Nacht gilt automatisch von 20:00 bis 07:00 (einstellbar) oder nach Systemeinstellung. Jeder Text erreicht in beiden Modi mindestens 4,5:1 auf den Flächen, die seine Notiz nennt; Kanten von Bedienelementen und Symbole mindestens 3:1.

- Flächen: `grund` hinter allem, `flaeche` für Inhaltsblöcke (Zimmer, Bericht, Detailbereich), `flaeche-2` für Leiste, Felder und ruhige Knöpfe, `flaeche-3` für gedrückt und Gleise.
- Text: `tinte` für Inhalt, `tinte-2` für Nebentext, `tinte-3` für Hinweise und Platzhalter.
- Bedienung: Hauptknopf und gewählte Navigation in `primaer` mit `auf-primaer`. Fokusring `fokus`, 2 dp mit 2 dp Abstand.

| Zustand | Farbe | immer zusammen mit |
| --- | --- | --- |
| Bett frei | `frei-flaeche`, Kante `frei` | Wort „frei“, Symbol `plus` |
| Bett erwartet | `erwartet-flaeche`, Kante `blau` | Wort „erwartet“, Symbol `erwartet` |
| Bett anwesend | `anwesend`, Text `auf-anwesend` | Symbol `anwesend` |
| freigehalten bis | `gehalten-flaeche`, Kante `linie-stark` | Datum, Symbol `schloss` |
| frei bis Rückkehr | `frei-flaeche`, Kante `frei` | Datum, Symbol `rueckkehr`, „… kommt zurück“ |
| fehlt, 1. Nacht | `erwartet-flaeche`, Kante `warnung` | Wort „fehlt“, Symbol `abwesend`, „unentschuldigt“ |
| fehlt ab 2. Nacht | `frei-flaeche`, Kante `frei`, Text `warnung` | „fehlt 2 N.“, „frei“, Name des Gastes |
| gesperrt | Schraffur `aus-schraffur` auf `aus-flaeche` | Wort „aus“, Symbol `deaktiviert` |
| Ampel | `ampel-gruen` / `ampel-gelb` / `ampel-rot` | Zahl und „5 Betten frei“ |
| Läuseschein, Konflikt, Abgleich gestört | `warnung` auf `warnung-flaeche` | Symbol `warnung` oder `laeuseschein-fehlt` und Klartext |
| Vorfall, Hausverbot, Löschen | `vorfall` auf `vorfall-flaeche` | Symbol `vorfall` oder `karte-rot` und Klartext |
| Gelbe / Rote Karte | `karte-gelb` mit `karte-gelb-rand` / `karte-rot` | Kartensymbol und Wort |

**Grün heißt frei, Blau heißt belegt** – genau so, wie das Kältehilfetelefon zählt. Darum ist ein Bett, dessen Gast die 2. Nacht in Folge unentschuldigt fehlt, grün, und eines in der 1. Nacht blau mit Warnkante. Blau und Grün unterscheiden sich in Helligkeit und Form (gefüllt gegen umrandet), nicht nur im Farbton; Rot-Grün-Schwäche ändert nichts an der Lesbarkeit. Unterschriftsfelder und Dokumente bleiben auch nachts `papier` mit `stift-tinte`, damit Unterschrift und PDF gleich aussehen.

## Schrift

- **Atkinson Hyperlegible Next** (`ui`) für die ganze Oberfläche: entwickelt für schlechte Sicht, unterscheidet I, l, 1 und O, 0 deutlich. Gewichte 400, 600, 700.
- **Atkinson Hyperlegible Mono** (`zahl`) für Bettnummern, Uhrzeiten, Aufnahmenummern und Kennzahlen, mit gleich breiten Ziffern.
- **Noto Sans** und **Noto Sans Arabic** (`dokument`, `rtl`) nur für Hausordnung, Datenschutz und PDF, weil sie alle zehn Sprachen abdecken (Latein, Kyrillisch, Arabisch).
- Stufen: `titel-gross` 28 sp für Bereichstitel, `titel` 22 sp für Detailbereich und Dialoge, `abschnitt` 18 sp, `name-bett` 20 sp, `text` 17 sp für alles Lesbare, `text-klein` 15 sp, `knopf` 17 sp, `label` 14 sp, `ueberzeile` 13 sp in Versalien für Zimmernamen. Nichts unter 13 sp.
- Alle Schriften stehen unter der SIL Open Font License und werden von Google Fonts geladen bzw. in der App als `res/font` mitgeliefert.

## Raster und Maße

- Querformat 10–12 Zoll, Referenz 1280 × 800 dp. Navigationsleiste `leiste-breite` 104 dp links, Kopfzeile `kopf-hoehe` 72 dp, Detailbereich `detail-breite` 460 dp rechts.
- 4-dp-Raster: `abstand-1` 4 bis `abstand-8` 64. In Karten 8–16, zwischen Zimmern 12–16, zwischen Berichtsabschnitten 24–48.
- Radien: `radius-s` 6 (Chips, Marken), `radius-m` 10 (Bettkarten, Knöpfe, Felder), `radius-l` 16 (Zimmer, Bereiche, Dialoge, Unterschrift), `radius-rund` (Navigation, Schalter, Pillen).
- Ziele: `ziel-min` 48 dp, `ziel-gross` 56 dp. Bettkarte `bett-breite` 152 × `bett-hoehe` 88 dp; im Grundriss die kompakte Bettkarte in der gezeichneten Bettfläche (Einzelbett etwa 140 × 60 dp, Stockbett-Hälfte etwa 70 × 74 dp).
- Bettenplan St. Pius: Grundriss (Seitenverhältnis 971 : 800) links, Spalte mit Loggien, Esszimmer, Tiny House und weiteren Plätzen 176 dp rechts.

## Symbole

69 eigene Symbole im 24-dp-Raster, Strich 2 dp, runde Enden (Assets › Symbole). Einfarbig in `tinte` gezeichnet und in der App eingefärbt; nur `karte-gelb` und `karte-rot` haben feste Füllungen. Keine Emojis, keine fremden Symbolsätze daneben. Die Tabelle im Baustein **Symbole** nennt jede Bedeutung.

## Bewegung

Kurz und erklärend: `dauer-sofort` 90 ms für Druck, `dauer-kurz` 150 ms für Auswahlen, `dauer-mittel` 250 ms für Statuswechsel und Schritte, `dauer-lang` 350 ms für Detailbereich, Tauschen und Abschließen. Herein mit `kurve-eintritt`, hinaus mit `kurve-austritt`, sonst `kurve-standard`. Nichts blinkt; das einzige Dauerlaufende ist das Abgleich-Symbol während eines Abgleichs. Mit „Animationen entfernen“ werden alle Übergänge zu Überblendungen. Alle Abläufe zum Abspielen im Baustein **Bewegung**.

## Barrierefreiheit

- Jede Bettkarte, jedes Symbol und jeder Symbolknopf hat eine Beschreibung für TalkBack („Bett D4 oben, erwartet, Ali, Duschslot 20:30“; „Bett L2, fehlt unentschuldigt, zählt als belegt, Kasia“).
- Schriftgröße folgt der Systemeinstellung bis 130 %; Bettkarten wachsen in der Höhe mit, Namen kürzen mit „…“.
- Fokusreihenfolge folgt dem Lesefluss: Kopfzeile, Kennzahlen, Zimmer im Grundriss von links oben nach rechts unten, dann die Spalte mit Loggien und weiteren Plätzen, Detailbereich.
- Arabisch und Farsi laufen nur im Dokument von rechts nach links; die App bleibt linksläufig.
