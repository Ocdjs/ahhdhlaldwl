# Grundriss

St. Pius erscheint im Bettenplan als Grundriss des Stockwerks: Zimmer, Flure und Türen wie im echten Haus, die Betten als kompakte Bettkarten an ihrer Stelle.

**Aufbau**
- Zeichenfläche in Grundriss-Einheiten (viewBox −10 −10 971 800, Seitenverhältnis 971 : 800). Maßstab = verfügbare Breite ÷ 971; bei 1280 dp Bildschirm etwa 0,95.
- Wände 6 Einheiten `tinte`, Türen als Bogen mit Blatt 1,5 Einheiten `tinte-3`. Räume ohne Tür (Privat): Fläche `flaeche-3`, Wort in Versalien, nicht antippbar.
- **Bad** zwischen Flur und Privat: antippbare Fläche mit Zustand (siehe Baustein Tür und Bad).
- **Türen schließen sich:** Ist ein Zimmer ganz gesperrt (D, T, F, B), das Bad abgeschlossen oder der Flur gesperrt, dreht sich das Türblatt animiert in die Wand (siehe Tür und Bad).
- Zimmername (`ZIMMER D`, 14 sp, 700, Sperrung 0,08) mit „1 von 6 frei“ darunter (`nummer`, `tinte-3`) an fester Stelle im Raum.
- Betten: Einzelbett 150 × 64 (T3 senkrecht 70 × 150), Stockbett 80 × 160–170 mit Rahmen `flaeche-3`; oben die kleinere Nummer. Jede Bettfläche trägt eine kompakte Bettkarte (`nu-bett--kompakt`), positioniert in Prozent der Zeichenfläche, damit Text nicht mitskaliert.
- Rechts daneben die Spalte (176 dp) mit gleich großen Bettkarten untereinander: **Loggien** L1–L5, **Esszimmer** E1, **Tiny House** TH1, **Weitere Plätze** Z1 … (in den Einstellungen frei benannt). Jede Gruppe mit Titel und „x von y frei“.
- Notbetten (L3, E1) tragen „Notbett“ in der Fußzeile; ein freies Notbett zeigt in der Schnellauswahl „Nur über den Kältebus belegen“.

**Zustände**
- Gesperrtes Zimmer: Boden schraffiert, Text „gesperrt“, Betten „aus“.
- Sind T-Zimmer und Zimmer F beide gesperrt, wird auch Flur 2 schraffiert („FLUR GESPERRT“).
- St. Nikolaus: Saal 380 × 440 Einheiten, acht senkrechte Betten in zwei Reihen, höchstens 520 dp breit; **rechts daneben die weiteren Plätze von St. Nikolaus** (z. B. N9 „Matratze Flur“) in derselben Spalte wie bei St. Pius.
- **Nummern tauschen:** Jede gezeichnete Bettfläche ist ein fester Platz. Welche Nummer dort steht, lässt sich in den Einstellungen innerhalb eines Zimmers tauschen (`Bett.platz`). Belegung, Sperre und Notbett hängen an der Nummer und wandern mit.

**Bedienung** wie bei jeder Bettkarte: antippen, lange drücken und ziehen. Der Plan scrollt unter den stehenden Kennzahlen.

**Compose:** `BoxWithConstraints` mit `aspectRatio(971f / 800f)`; Wände und Türen in einem `Canvas` (`drawPath`, `drawArc`), Betten als eigene Composables mit `Modifier.offset`/`size` aus Grundriss-Einheiten × Maßstab. Die Geometrie gehört in die Datenbank (Tabelle „Betten“: `x`, `y`, `breite`, `hoehe`, `stock_id`; Tabelle „Zimmer“: `boden`, `label_x`, `label_y`), damit ein späterer Umbau ohne App-Update geht. Unter 900 dp Breite: Zimmerrahmen statt Grundriss.
