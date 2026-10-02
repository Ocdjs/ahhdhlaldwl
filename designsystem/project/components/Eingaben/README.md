# Eingaben

Felder, Ja/Nein-Wahl, Schalter und Auswahl-Chips für Aufnahme, Bericht und Einstellungen.

- **Feld** (`nu-feld` + `nu-eingabe`): Beschriftung `label` über dem Feld, nie nur als Platzhalter. Feld 56 dp hoch, Grund `flaeche-2`, im Fokus 2 dp Kante `fokus` und Grund `flaeche`. Mehrzeilig ab 132 dp, wächst mit.
- **Ja/Nein** (`nu-seg`): Pflichtfelder im Bericht („Hat KHT angerufen?“, Vorfälle, Schlüssel fehlt). Keine Vorauswahl: solange nichts gewählt ist, gilt das Feld als offen und „Bericht abschließen“ zeigt es an.
- **Schalter** (`nu-schalter`): nur für Einstellungen, die sofort gelten („Bett dauerhaft behalten“). Text daneben sagt, was „an“ bedeutet.
- **Chips** (`nu-chip`): Mehrfachauswahl wie die Liste „Fehlt etwas“. Gewählt = Füllung `primaer` plus Häkchen, also nie nur Farbe.
- Tastatur: Vornamen mit `KeyboardCapitalization.Words`, Zahlen mit `KeyboardType.Number`, Freitext mit Autokorrektur. „Weiter“ auf der Tastatur springt ins nächste Feld (`ImeAction.Next`), im letzten Feld „Fertig“.
- Fehler stehen unter dem Feld in `warnung` mit Symbol `warnung`: „Bitte Vorname oder Spitzname eintragen.“
