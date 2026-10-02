# Berichtsfelder

Jedes Feld des Dienstberichts hat eine Zeile mit Beschriftung links und Eingabe rechts.

- Zeile `nu-bericht-zeile`: Beschriftung 220 dp breit (`text-stark` 16 sp), Eingabe daneben. Zwischen Feldern `abstand-6`; keine Linien.
- **Ja/Nein** (`nu-seg`) für „Hat KHT angerufen?“, Vorfälle, Schlüssel fehlt; keine Vorauswahl. Offene Pflichtfelder zeigen beim Abschließen die Pille „Pflichtfeld“ in `warnung`.
- **Hat KHT angerufen?** (früher „An KHT gemeldet“): daneben die Pille „KHT-Nummer 25“ aus dem Bettenplan, griffbereit, wenn das Kältehilfetelefon anruft.
- **Fehlt etwas:** Chips aus der Liste in den Einstellungen und daneben immer ein **Freitextfeld** „Was genau?“, weil die Kategorien breit sind („Müllbeutel 120 l, Duschgel“). Beides steht im PDF.
- **Abwesenheit von Gästen:** automatisch aus dem Bettenplan: freigehalten, frei bis Rückkehr und **fehlt unentschuldigt** (1. Nacht, ab 2. Nacht mit „Bett zählt als frei“) als Warnzeilen.
- **Freitext** (Wichtige Hinweise, Fragen von Gästen, Sonstiges): siehe Erwähnung und Stufenwörter.
- Ein Bericht mit „Vorfälle: Ja“ bekommt den Rahmen 3 dp `vorfall` (`nu-bericht.is-vorfall`).
