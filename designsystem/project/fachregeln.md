# Fachregeln

Regeln, die bestimmen, was die Oberfläche zeigt. Sie gehören in die Datenschicht (Repository, Use Cases) und werden mit Unit-Tests abgesichert; die Bausteine stellen nur dar, was diese Regeln liefern.

## 1 Standorte, Zimmer, Betten

| Standort | Zimmer | Betten |
| --- | --- | --- |
| **St. Pius** (früher „Haupthaus“) | Zimmer D (zwei Räume, ein Name) | D1, D2/D3 (Stockbett), D4/D5 (Stockbett), D6 |
| | T-Zimmer (Zugang über Zimmer F) | T1/T2 (Stockbett), T3 |
| | Zimmer B | B1, B2, B3/B4 (Stockbett) |
| | Zimmer F | F1, F2, F3/F4 (Stockbett) |
| | Loggien | L1–L5 |
| | Esszimmer | E1 |
| | Tiny House (abschaltbar) | TH1 |
| | Weitere Plätze | Z1, Z2 … (Nummer und Bezeichnung frei wählbar) |
| **St. Nikolaus** | Saal | N1–N8 |
| | Weitere Plätze (rechts neben dem Saal) | N9 … (Nummer und Bezeichnung frei wählbar) |

- **Notbett:** Standard L3 und E1; je Bett in den Einstellungen umschaltbar. Notbetten werden nur über den Kältebus belegt. Belegt zählen sie mit, frei zählen sie nicht (weder in der KHT-Nummer noch in der Ampel).
- **Weitere Plätze** gibt es an beiden Standorten. Nummer (1–6 Zeichen, eindeutig) und Bezeichnung sind frei wählbar und später änderbar; freie Plätze lassen sich entfernen.
- **Nummern tauschen:** Innerhalb eines Zimmers lässt sich festlegen, welche Nummer an welchem Platz im Plan steht (`Bett.platz`). Belegung, Sperre und Notbett hängen an der Nummer.
- **Sperren:** ganze Zimmer und jedes einzelne Bett. Ein Bett ist gesperrt, wenn es selbst oder sein Zimmer gesperrt ist. Gesperrte Betten zählen nirgends.
- Sind T-Zimmer und Zimmer F gesperrt, zeigt der Grundriss auch Flur 2 als gesperrt (nur Darstellung).
- Die Geometrie des Grundrisses (Bettflächen, Wände, Türen) liegt in der Datenbank, nicht im Code (siehe Baustein Grundriss).

## 2 Bettzustände

| Zustand | Bedeutung | entsteht durch | endet durch | für KHT |
| --- | --- | --- | --- | --- |
| frei | kein Gast | „Bett frei“, Neuanlage | Aufnahme, Umzug | frei |
| erwartet | Gast hat das Bett, ist heute noch nicht da | Tageswechsel bei „dauerhaft“ | „Ist da“, „Nicht da“ | belegt |
| anwesend | Gast ist heute da | „Ist da“, Aufnahme | Tageswechsel | belegt |
| **fehlt** | heute unentschuldigt nicht gekommen, 1. Nacht | „Nicht da“ → „Fehlt unentschuldigt“ | „Ist doch da“, Tageswechsel | **belegt** |
| **fehlt ab 2. Nacht** | zweite Nacht in Folge unentschuldigt weg | „Fehlt unentschuldigt“, wenn schon die Vornacht gefehlt wurde | „Ist doch da“, „Bett frei“, Aufnahme eines anderen Gastes | **frei** |
| freigehalten bis | angekündigte Abwesenheit, Bett wird gehalten | „Abwesenheit“ mit „Ja, freihalten“ | Rückkehrdatum, „Ist zurück“ | belegt |
| frei bis Rückkehr | angekündigte Abwesenheit, Bett darf vergeben werden | „Abwesenheit“ mit „Nein“ | Rückkehrdatum | frei |
| gesperrt | Bett oder Zimmer außer Betrieb | Einstellungen | Einstellungen | nicht gezählt |

**Tageswechsel (12:00):** anwesend → erwartet (wenn „dauerhaft“), sonst frei. fehlt → erwartet mit `fehlte_vornacht = true`; die Schnellauswahl zeigt dann „Fehlte gestern unentschuldigt“. Wird derselbe Gast wieder „Nicht da / Fehlt unentschuldigt“ gesetzt, ist es die 2. Nacht in Folge. „fehlt ab 2. Nacht“ bleibt bestehen, bis jemand handelt; wird das Bett neu vergeben, bekommt der bisherige Gast eine Notiz und bleibt in der Gästedatenbank.

**„Nicht da“** fragt immer nach: „Weiter warten“, „Hat sich abgemeldet“ (führt zur Abwesenheit, also entschuldigt) oder „Fehlt unentschuldigt“.

## 3 KHT-Nummer und Ampel

Es geht darum, wie viele Menschen versorgt werden.

- **KHT-Nummer** = Zahl der belegten Betten in St. Pius und St. Nikolaus. Belegt sind: anwesend, erwartet, freigehalten, fehlt (1. Nacht). Wer zwei Nächte in Folge unentschuldigt fehlt, zählt nicht mehr.
- **Notbetten** zählen nur, wenn sie belegt sind (Belegung nur über den Kältebus). Ein freies Notbett zählt weder als belegt noch als frei.
- **Frei** (Ampel) = Betten in Betrieb ohne freie Notbetten − belegte Betten. Ampel grün ab Schwelle (Standard 3), gelb 1–2, rot 0. Die Ampel meldet nur Zahlen, nie Namen.
- Auf dem Bildschirm stehen nur die Ampel mit den freien Betten und die KHT-Nummer; die Rechnung ist ein kurzer Satz im Blatt hinter der Zahl.
- Der Bericht fragt „**Hat KHT angerufen?**“ (Ja/Nein, Pflichtfeld) und zeigt die KHT-Nummer daneben; das PDF hält sie beim Abschließen fest.

```kotlin
private val BELEGT = setOf(BettStatus.ANWESEND, BettStatus.ERWARTET, BettStatus.FEHLT, BettStatus.FREIGEHALTEN)

fun khtNummer(betten: List<Bett>) = betten.count { !it.gesperrt && it.status in BELEGT }   // Notbetten nur, wenn belegt

fun freieBetten(betten: List<Bett>) = betten.count { !it.gesperrt && !it.notbett && it.status !in BELEGT }
```

Beispiel aus dem Prototyp: KHT-Nummer 25 (darunter E1, ein mit dem Kältebus belegtes Notbett), 6 Betten frei; das freie Notbett L3 zählt nicht.

## 4 Gleiche Vornamen

- **Anzeigename:** Vorname; gibt es den Vornamen in der Gästedatenbank mehr als einmal, mit Zusatz in Klammern: Bettnummer („Max (D4)“), ohne Bett Nachname, sonst Spitzname, sonst Aufnahmenummer („Max (Nr. 0042)“).
- Der Anzeigename gilt überall: Plan-Details, Suche, Erwähnungen, Sanktionen, Duschplan, Einblendungen, PDF.
- Beim Anlegen zeigt die App alle Personen mit demselben Vornamen; ist es dieselbe Person, wird sie ausgewählt, nie doppelt angelegt.
- Intern zählt immer die Gast-ID. Bettnummern im Text sind nur Anzeige, weil Gäste umziehen.

## 5 Erwähnungen und Sanktionen im Bericht

- `@Vorname` oder `@Vorname (Bett)` erwähnt einen Gast. Mehrdeutige Erwähnungen („@Max“ bei mehreren Max) müssen vor dem Abschließen eindeutig gemacht werden.
- Ein Absatz, der mit „Verwarnung“, „Gelbe Karte“, „Hausverbot“ oder „Rote Karte“ beginnt, legt **genau eine** Sanktion an: für die gewählte Person, standardmäßig die zuerst genannte. „Niemand“ ist wählbar.
- **Alle anderen Genannten** bekommen den Absatz nur als Notiz mit dem Vermerk „erwähnt, keine Sanktion“. Sie erhalten nie automatisch eine Verwarnung, Karte oder ein Hausverbot.
- Datenmodell: `Sanktion(gast_id, stufe, grund, datum, von, bericht_id, absatz)`, `Notiz(gast_id, text, datum, von, bericht_id, rolle = BETROFFEN | ERWAEHNT)`.
- Sanktionen außerhalb des Berichts (Gastdetails › Sanktion) gelten immer nur für diesen einen Gast.

## 6 Aufnahme

- **Dauer:** „1 Nacht“ (nicht dauerhaft, kein Läuseschein) oder „Mehrere Nächte“ (dauerhaft, **ohne Enddatum** als Standard). Mit dem Schalter „Enddatum festlegen“ kommt ein Abreisetag dazu; er bleibt änderbar.
- **Sprache** bestimmt nur die Übersetzung der Hausordnung. Unterschrieben wird die **deutsche** Hausordnung, die Übersetzung liegt daneben. Unterschriften: Gast und Betreuung.
- **Datenschutzerklärung** nur auf Deutsch; unterschreibt **nur der Gast**.
- Fehlt eine Unterschrift, lässt sie sich jederzeit nachholen (Gastdetails oder Gästedatenbank); das Ergebnis ist dasselbe PDF.

## 7 Gästedatenbank

- Eigener Bereich, ohne Admin-PIN zum Ansehen, Nachholen und Hinterlegen; Löschen und Stammdaten ändern mit PIN.
- Dokumente je Gast: Aufnahme-PDF (Hausordnung und Datenschutz), Läuseschein, weitere (Foto oder Datei). „Hausordnung auf Papier“ gilt als unterschrieben; „Läuseschein“ setzt den Läuseschein auf „liegt vor“.
- Dokumente folgen den Löschfristen des Gastes und werden mit Nextcloud abgeglichen.

## 8 Zeit und Ansichten

- Der Diensttag wechselt um 12:00. Die Hauptansicht zeigt den laufenden Diensttag oder vergangene Tage (nur lesen), **nie die Zukunft**. Wie lange ein Bett frei ist, steht auf der Bettkarte.
- Nach vorn schauen nur der Kalender (Standard: 7-Tage-Ansicht) und der Duschplan (bis 3 Tage voraus).

## 9 Teilen und Import

- PDFs werden über den Android-Teilen-Dialog geteilt (`Intent.ACTION_SEND` mit `FileProvider`), **ohne festen Empfänger**; es gibt keinen Knopf, der direkt an eine bestimmte Person sendet.
- Dienstplan einlesen: Nextcloud-Datei (PDF, ICS) oder Foto. Kein Import aus WhatsApp.

## 10 Monatsabschluss und Dienstnachweis

- Jede Person unterschreibt einmal im Monat ihren **Dienstnachweis je Bereich**: **Betreuung** und **Küche** werden getrennt geführt, getrennt abgerechnet und haben je eine Lohntabelle. Wer beides macht, unterschreibt zwei Nachweise.
- **Geplant** = **Originalplan** des Monats. Er entsteht einmal zu Monatsbeginn in Einstellungen › Dienstplan einlesen (Leitung, Admin-PIN): jeder Dienst wird am Foto oder an der Datei einzeln geprüft (§14). Danach unveränderlich. Korrigierbar nur als **Plankorrektur** vor der Unterschrift, mit Warnhinweis und Pflichtgrund; jede Korrektur wird mit Tagen, Grund, Person und Zeit protokolliert und im Nachweis angezeigt.
- Änderungen im Kalender (§14) ändern den **aktuellen** Plan, nie den Originalplan.
- **Gemacht** = jeder Dienst, bei dem die Person in der Besetzung des Dienstberichts unterschrieben hat (Rolle Betreuung 1/2 → Betreuung, Rolle Küche → Küche), bis zum Moment ihrer Unterschrift unter den Nachweis. Ohne Unterschrift im Bericht zählt der Dienst erst, wenn sie nachgeholt ist.
- Abweichungen aus der Besetzung (geplante und tatsächliche Person, Grund **Tausch** oder **Sonstiges**): **abgegeben** und **Vertretung**. Es gibt **kein „krank“**.
- **Hinweis beim letzten geplanten Dienst** des Monats: Banner im Bericht mit „Später“ und „Ansehen“, freiwillig. Jederzeit unter Dienst & Bericht › Monatsabschluss (Vormonat und laufender Monat).
- **Unterschrift ohne PIN.** Danach ist der Nachweis gesperrt: kein Korrigieren, kein zweites Unterschreiben (auch nicht von einem anderen Gerät, siehe Dateisystem). Es entsteht ein PDF (`2026-09_Dienstnachweis_Betreuung_Robin.pdf`), die Zahlen gehen als Zeile in die Lohntabelle des Bereichs (`Lohnabrechnung_2026-09_Betreuung.csv`: Person, Personalnummer, Bereich, Monat, Geplant, Gemacht, Abgegeben, Vertretung, Unterschrieben, PDF).
- Datenmodell: `Plan0(monat, datum, rolle, person, eingelesen_von, korrekturen)`, `PlanAenderung(datum, rolle, alt, neu, von, grund, notiz, um)`, `Einsatz(datum, rolle, person, geplant_person, grund, unterschrift)` aus den Berichten, `PlanKorrektur(monat, person, bereich, tage, grund, von, um)`, `Dienstnachweis(monat, person, bereich, geplant, gemacht, abgegeben, vertretung, tage_json, unterschrift_png, um, pdf)` – nach dem Anlegen unveränderlich.

## 11 Bericht abschließen und ergänzen

- **Pflicht** zum Abschließen: „Hat KHT angerufen?“, „Vorfälle“, eindeutige @-Erwähnungen.
- **Unterschriften sind keine Pflicht** – gerade der Küchendienst geht oft früher. Fehlen nur Unterschriften, fragt die App „Wirklich ohne Unterschrift abschließen?“ und schließt nach „Ja, trotzdem abschließen“ ab. Der Bericht speichert `ohne_unterschrift` (Personen), das PDF trägt den Stempel „Ohne Unterschrift abgeschlossen: Jule“.
- **Nachholen:** In der Besetzung bleibt „Unterschrift nachholen“. Die Unterschrift kommt mit Zeitpunkt dazu, dazu eine Ergänzung „Unterschrift von Jule nachgeholt.“; das PDF wird neu erzeugt („· nachgeholt“). Erst dann zählt der Dienst im Monatsabschluss.
- **Nach dem Abschluss** sind alle Felder gesperrt. Es gibt nur noch **Ergänzungen** (Text, Zeit, Name), die unter dem Bericht und im PDF stehen. Keine Korrektur bestehender Felder.
- Beim Abschließen werden KHT-Nummer und Abwesenheiten als Stand festgehalten.

## 12 Hinweise, Archiv und Wiederaufnahme

- **Hinweis für die nächsten Dienste:** Text, Von (Leitung oder Team), wichtig, **Anzeigedauer**: Nächster Dienst, 3 Tage, 1 Woche, 2 Wochen oder bis Datum. Der Zeitraum beginnt beim **nächsten Dienst**: heute, solange der heutige Bericht offen ist, sonst morgen. Sichtbar im Bericht, wenn `ab ≤ Diensttag ≤ bis` und nicht beendet. Im Archiv vorzeitig **beenden**.
- **Bettwäschewechsel** (Termin der Art „Bettwäsche“) erscheint am Tag als wichtiger Hinweis oben im Bericht und an der Glocke.
- **Archiv-Kommentare** zu einem Bericht: Kommentar, Antwort auf eine Frage von Gästen oder wichtiger Hinweis; Von (Leitung vorgewählt). Optional „Oben im Dienst zeigen“ für eine Dauer wie oben → zusätzlich ein Hinweis mit Bezug „zu Bericht 01.10.“.
- **Gastbezug:** Wählbar sind die im Bericht genannten Gäste (`@Vorname (Bett)`, „Vorname Nachname“, eindeutiges `@Vorname`). Mit Gast entsteht eine Notiz beim Gast; ist „bei Wiederaufnahme“ an, öffnet sich bei der nächsten Aufnahme dieses Gastes der Dialog „Hinweis zu …“ – so lange, bis jemand „Nicht mehr zeigen“ wählt.
- **Fehlt etwas** aus allen Berichten erscheint im Archiv als Liste zum Abhaken (wer, wann).

## 13 Bad und Türen

- Das Bad ist je Diensttag zunächst **abgeschlossen** (Duschzeit). Sind im Duschplan des Tages keine Duschen mehr „geplant“ (alle erledigt oder verpasst), wechselt es auf **Erinnerung**: Einblendung und Glocke „Bad aufschließen“.
- **Antippen** im Grundriss schließt auf und speichert Zeit und Person; das Bad zeigt „frei“. Früher aufschließen fragt nach; wieder abschließen fragt nach.
- **Türen schließen sich** im Grundriss, wenn ein Zimmer ganz gesperrt ist (D, T, F, B), wenn T-Zimmer und Zimmer F gesperrt sind (Flur) und wenn das Bad abgeschlossen ist. Nur Darstellung; die Animation läuft bei einer Änderung, nicht beim Blättern durch die Tage.

## 14 Kalender ändern und Dienstplan einlesen

- **Dienstplan einlesen** (Einstellungen, Admin-PIN, Leitung): einmal zu Monatsbeginn, Quelle Foto oder Datei (PDF, ICS aus Nextcloud). Jeder Tag wird einzeln geprüft (Betreuung 1, Betreuung 2, Küche); unsicher Erkanntes muss angetippt werden. Ergebnis: **Originalplan** und aktueller Plan des Monats, dazu wer eingelesen hat und welche Stellen von der Erkennung abwichen. Ein Monat wird nur einmal eingelesen.
- **Kalender ändern** (Admin-PIN): Dienste und Termine ab heute. Jede Änderung braucht **„Wer ändert?“** (Pflicht, keine Vorauswahl) und einen Grund (Tausch, Sonstiges); sie wird als eigener Eintrag gespeichert. Der Kalender **markiert** jeden Dienst, der vom Originalplan abweicht oder geändert wurde, und jeden geänderten Termin.
- Ist der Dienst heute und der Bericht offen, wechselt die Person in der Besetzung mit, solange sie noch nicht unterschrieben hat.

## 15 Dateien und Abgleich

Wo jede dieser Angaben als Datei liegt und wie sie mit Nextcloud abgeglichen wird, steht in **Dateisystem** und ausführlich im Repository unter `dateisystem/` (Beispielordner, JSON-Schemas, `NcPfade.kt`, Prüfskript). Grundsatz: Abgeschlossenes (Berichte, Unterschriften, Sanktionen, Notizen, Kommentare, Originalplan, Dienstnachweise, Kalender-Änderungen) wird einmal angelegt und nie überschrieben.
