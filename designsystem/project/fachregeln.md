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

- Jede Person aus dem Team (Betreuung und Küche) unterschreibt einmal im Monat ihren **Dienstnachweis**.
- **Geplant** = Originalplan, wie er vor Monatsanfang feststand (aus dem Dienstplan-Import, eingefroren am 1.). Korrigierbar nur vor der Unterschrift, mit Warnhinweis und Pflichtgrund; jede Korrektur wird mit Tagen, Grund, Person und Zeit protokolliert und im Nachweis angezeigt.
- **Gemacht** = jeder Dienst, bei dem die Person in der Besetzung des Dienstberichts unterschrieben hat, bis zum Moment ihrer Unterschrift unter den Nachweis.
- Abweichungen ergeben sich aus der Besetzung (geplante und tatsächliche Person, Grund): **krank** (abgegeben wegen Krankheit), **abgegeben** (Tausch, Sonstiges), **Vertretung** (für jemand anderen übernommen).
- **Hinweis beim letzten geplanten Dienst** des Monats: Banner im Bericht mit „Später“ und „Ansehen“, freiwillig. Jederzeit erreichbar unter Dienst & Bericht › Monatsabschluss (Vormonat und laufender Monat).
- **Nach der Unterschrift** ist der Nachweis gesperrt: kein Korrigieren, kein zweites Unterschreiben. Es entsteht ein eigenes PDF (`2026-09_Dienstnachweis_Robin.pdf`), und die Zahlen gehen als Zeile in die **Lohntabelle** des Monats (Person, Geplant, Gemacht, Krank, Abgegeben, Vertretung, Unterschrieben, PDF). Tabelle und PDFs liegen in Nextcloud.
- Datenmodell: `Plan0(datum, rolle, person)`, `Einsatz(datum, rolle, person, geplant_person, grund, unterschrift)`, `PlanKorrektur(monat, person, tage, grund, von, um)`, `Dienstnachweis(monat, person, geplant, gemacht, krank, abgegeben, vertretung, tage_json, unterschrift_png, um, pdf)` – nach dem Anlegen unveränderlich.
