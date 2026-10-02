# Unterschriftsfeld

Ein Feld, in das Gast oder Betreuung mit Finger oder S Pen unterschreibt; es sieht aus wie eine Unterschriftszeile auf Papier.

- Grund `papier` in beiden Modi, Rahmen 2 dp `papier-linie`, `radius-l`, Höhe mindestens `unterschrift-hoehe` (220 dp), volle Spaltenbreite. Linie 2 dp `papier-linie` 52 dp über dem unteren Rand, davor „×“.
- Kopf: wer unterschreibt („Gast: Ali“, „Betreuung: Jonas“) und wofür. Hausordnung: Gast und Betreuung nebeneinander. Datenschutz: nur der Gast (ein Feld, halbe Breite). Hilfetext „Mit Finger oder Stift unterschreiben“ in `auf-papier-2`, verschwindet beim ersten Strich.
- Strich in `stift-tinte` (Kugelschreiberblau), auch im Nachtmodus und im PDF. Finger: 2,6 dp gleichmäßig. Stift: 1,4–4 dp nach Druck. Alle Zwischenpunkte zeichnen (`getCoalescedEvents` bzw. `historical` in Compose), damit Kurven glatt sind.
- **Handballen:** Sobald im Feld ein Stift erkannt wurde, werden Fingerberührungen ignoriert, bis das Feld geleert wird.
- Knöpfe darunter rechts: „Löschen“ und „Bestätigen“ (gesperrt, solange leer). Bestätigt: Rahmen 3 dp `frei`, Marke „Bestätigt“ oben rechts, Feld gesperrt.
- Export als PNG in doppelter Auflösung (mindestens 300 dpi im PDF), transparenter Grund.
