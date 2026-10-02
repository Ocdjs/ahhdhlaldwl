# Knöpfe

Knöpfe lösen genau eine Handlung aus; ihr Text sagt, was passiert.

- **Hauptknopf** (`nu-btn--primaer`, Füllung `primaer`): höchstens einer pro Ansicht, rechts unten oder als erste Schnellaktion. „Gast aufnehmen“, „Ist da“, „Weiter“, „Bericht abschließen“.
- **Ruhiger Knopf** (`nu-btn`, Füllung `flaeche-2`): alle weiteren Handlungen.
- **Rahmen-Knopf** (`nu-btn--rahmen`): auf `flaeche-2`-Gründen, wo der ruhige Knopf verschwinden würde.
- **Gefahr** (`nu-btn--gefahr`, Text `vorfall`): Löschen, Hausverbot. Die volle Variante (`nu-btn--gefahr-voll`) nur im Bestätigungsschritt.
- Größen: `ziel-gross` (56 dp) als Standard, `nu-btn--klein` (48 dp = `ziel-min`) in Listenzeilen und Dialogen. Nie kleiner.
- Text in `knopf` (17 sp, 600). Ein Symbol steht links vom Wort, nie allein, außer bei Schließen, Mehr und den Datumspfeilen (dann mit `contentDescription`).
- Gesperrt (`disabled`): 42 % Deckkraft. Darunter steht, was fehlt („Es fehlen 2 Unterschriften“).
- Rückmeldung: beim Drücken 97 % Größe und `flaeche-3`, Dauer `dauer-sofort`.

**Compose:** `Button` mit `shape = RoundedCornerShape(10.dp)`, `heightIn(min = 56.dp)`, `containerColor = primaer`. Ruhig = `FilledTonalButton` mit `flaeche-2`.
