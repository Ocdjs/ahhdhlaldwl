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
| | Weitere Plätze | Z1, Z2 … (in den Einstellungen frei benannt) |
| **St. Nikolaus** | Saal | N1–N8 |

- **Notbett:** Standard L3 und E1; je Bett in den Einstellungen umschaltbar. Notbetten erscheinen im Plan wie andere Betten, zählen aber nicht für das Kältehilfetelefon und die Ampel.
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

## 3 Zahlen für das Kältehilfetelefon und die Ampel

- **Gesamt** = alle Betten in Betrieb in St. Pius und St. Nikolaus, ohne Notbett, ohne gesperrte Betten.
- **Belegt** = Betten mit Zustand anwesend, erwartet, freigehalten oder fehlt (1. Nacht). Ein Bett zählt also als belegt, solange niemand zwei Nächte in Folge unentschuldigt fehlt.
- **Frei** = Gesamt − Belegt.
- Das Kältehilfetelefon bekommt die Zahl der belegten Betten und die Gesamtzahl. Die **Ampel** ist ein eigenes Meldesystem: dort werden frei, belegt und gesamt gemeldet; die Ampelfarbe richtet sich nach „frei“ (grün ab Schwelle, Standard 3; gelb 1–2; rot 0).
- Der Bericht fragt „**Hat KHT angerufen?**“ (Ja/Nein, Pflichtfeld) und zeigt die Zahlen daneben; das PDF hält die Zahlen beim Abschließen fest.

```kotlin
enum class BettStatus { FREI, ERWARTET, ANWESEND, FEHLT, FEHLT_AB_2, FREIGEHALTEN, FREI_BIS, GESPERRT }

data class KhtZahlen(val gesamt: Int, val belegt: Int) { val frei get() = gesamt - belegt }

private val BELEGT = setOf(BettStatus.ANWESEND, BettStatus.ERWARTET, BettStatus.FEHLT, BettStatus.FREIGEHALTEN)

fun khtZahlen(betten: List<Bett>): KhtZahlen {
    val gezaehlt = betten.filter { !it.gesperrt && !it.notbett }   // St. Pius + St. Nikolaus
    return KhtZahlen(gesamt = gezaehlt.size, belegt = gezaehlt.count { it.status in BELEGT })
}
```

Beispiel aus dem Prototyp: 29 Betten gesamt (31 in Betrieb minus L3 und E1), davon 24 belegt (18 anwesend, 4 erwartet, 1 freigehalten, 1 fehlt 1. Nacht), 5 frei (3 frei, 1 frei bis Rückkehr, 1 fehlt 2. Nacht).

## 4 Gleiche Vornamen

- **Anzeigename:** Vorname; gibt es den Vornamen in der Gästedatenbank mehr als einmal, mit Zusatz in Klammern: Bettnummer („Ali (D4)“), ohne Bett Nachname, sonst Spitzname, sonst Aufnahmenummer („Ali (Nr. 0042)“).
- Der Anzeigename gilt überall: Plan-Details, Suche, Erwähnungen, Sanktionen, Duschplan, Einblendungen, PDF.
- Beim Anlegen zeigt die App alle Personen mit demselben Vornamen; ist es dieselbe Person, wird sie ausgewählt, nie doppelt angelegt.
- Intern zählt immer die Gast-ID. Bettnummern im Text sind nur Anzeige, weil Gäste umziehen.

## 5 Erwähnungen und Sanktionen im Bericht

- `@Vorname` oder `@Vorname (Bett)` erwähnt einen Gast. Mehrdeutige Erwähnungen („@Ali“ bei mehreren Ali) müssen vor dem Abschließen eindeutig gemacht werden.
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
