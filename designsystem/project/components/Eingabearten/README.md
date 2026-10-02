# Eingabearten

Die App wird mit Finger, S Pen und Tastatur bedient; jede Ansicht funktioniert mit dem Finger allein.

**Finger**
- Jedes Ziel mindestens `ziel-min` (48 dp), Hauptaktionen `ziel-gross` (56 dp), Lücke zwischen Zielen mindestens `abstand-2` (8 dp).
- Ein Tipp öffnet, ein langes Drücken (400 ms) hebt eine Bettkarte zum Ziehen an. Wischgesten tragen nie allein eine Handlung, es gibt immer einen Knopf.
- Check-in und Duschslot in höchstens drei Tipps: Bett → „Ist da“ → fertig; Bett → „Duschslot“ → Uhrzeit.

**Stift (S Pen)**
- Unterschriften: Druck steuert die Strichstärke (1,4–4 dp bei `stift-tinte`). Nach dem ersten Stiftkontakt werden Fingerberührungen im Feld ignoriert (Handballen). In Compose: `pointerInteropFilter`/`awaitPointerEvent` mit `PointerType.Stylus` prüfen.
- Hover: Wo der Stift schwebt, zeigen Bettkarten und Symbolknöpfe einen Fokusring und nach 500 ms einen Tooltip mit dem Klartext („Läuseschein fehlt seit 3 Tagen“).
- Handschrift in Textfelder: Wo Android sie anbietet (Samsung-Handschrifteingabe, ab Android 14 Stylus-Handwriting), bleibt sie eingeschaltet. Die App setzt nichts voraus.

**Tastatur**
- Bildschirmtastatur: Öffnet sie sich, wechselt der Bericht in den **Schreibmodus**: Kopfzeile und Navigationsleiste bleiben, Nebenspalten klappen ein, das aktive Feld rückt nach oben, über der Tastatur sitzt die `nu-tastenleiste` mit „@ Gast“, den Stufenwörtern und „Fertig“. `WindowInsets.ime` und `imePadding()` verwenden; nie Inhalt hinter der Tastatur.
- Hardware-Tastatur (Book Cover Keyboard): Tab und Umschalt+Tab wandern durch die Felder, Enter bestätigt Dialoge, Strg+Enter schließt ein Feld ab, Esc schließt Schnellauswahl und Detailbereich, Pfeiltasten wechseln im Bettenplan das Bett. Der Fokusring (`fokus`, 2 dp mit 2 dp Abstand) ist dann immer sichtbar.
