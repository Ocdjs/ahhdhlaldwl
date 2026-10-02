# Umziehen und Tauschen

Ein Gast wechselt das Bett, indem man seine Karte auf ein anderes Bett zieht.

- **Anheben:** langes Drücken (400 ms) auf eine belegte Karte. Die Karte hebt sich (105 %, −1°, `schatten-gehoben`), ihr Platz bleibt blass stehen. Ein kurzes Vibrieren (`HapticFeedbackType.LongPress`) bestätigt.
- **Ziel:** freies Bett → Rahmen 3 dp `frei` (umziehen); belegtes Bett → Rahmen 3 dp `blau` (tauschen). Deaktivierte Betten nehmen nichts an.
- **Ablegen** öffnet immer eine Bestätigung: „Max (Bett 3) und Ali (Bett 5) tauschen?“ bzw. „Ali von D4 nach B2 umziehen?“. Text darunter: „Gilt ab heute. Bereits unterschriebene PDFs bleiben unverändert.“
- Nach „Tauschen“ wechseln beide Karten auf gebogenen Bahnen den Platz (`dauer-lang`), dann federn sie einmal (`is-gesetzt`).
- Ohne Ziehen: „Bett wechseln“ in den Gastdetails öffnet den Plan im Auswahlmodus („Neues Bett für Ali antippen“).
- Mit Stift: Ziehen funktioniert gleich; mit Hardware-Tastatur: Karte fokussieren, Leertaste hebt an, Pfeiltasten wählen das Ziel, Enter legt ab.
