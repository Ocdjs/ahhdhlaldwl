# Eingabe: Finger, Stift, Tastatur

Jede Funktion geht mit dem Finger allein. Stift und Tastatur machen Unterschriften und Berichte schneller, sind aber nie Voraussetzung.

## Finger

- Trefferflächen mindestens `ziel-min` 48 dp, Hauptaktionen `ziel-gross` 56 dp, Lücke mindestens 8 dp. Die Trefferfläche einer Bettkarte reicht 6 dp über die Zeichnung hinaus.
- **Tipp** öffnet (Schnellauswahl, Detailbereich, Feld). **Langes Drücken** 400 ms hebt eine Bettkarte zum Ziehen an, mit kurzem Vibrieren. **Wischen** blättert nur in Listen und Kalender; keine Handlung hängt allein an einer Wischgeste.
- Doppeltipp und Mehrfinger-Gesten werden nicht verwendet. Zoomen im Plan ist nicht nötig, weil Karten groß genug sind.
- Mit Handschuhen oder kalten Fingern: große Ziele, keine Präzisionsgesten, eigene PIN-Tastatur mit 80 × 72 dp Tasten.

## Stift (S Pen)

- **Unterschrift:** Strich `stift-tinte`, Strichstärke folgt dem Druck (1,4–4 dp), Zwischenpunkte werden gezeichnet (`MotionEvent.getHistoricalX/Y` bzw. `PointerInputChange.historical`), damit Kurven glatt sind. Ausgabe als PNG in doppelter Auflösung.
- **Handballen:** Hat das Feld einmal einen Stift erkannt (`PointerType.Stylus`), werden Fingerberührungen in diesem Feld ignoriert, bis es geleert wird.
- **Schweben:** Schwebt der Stift über einer Bettkarte oder einem Symbolknopf, zeigt das Element den Fokusring und nach 500 ms einen Tooltip mit dem Klartext („Läuseschein fehlt seit 3 Tagen“).
- **Handschrift in Feldern:** Bietet das Gerät Handschrifterkennung in Textfeldern an (Samsung, ab Android 14 Stylus-Handwriting), bleibt sie eingeschaltet. Die App baut keine eigene.
- Der Stift-Knopf hat keine eigene Belegung.

## Tastatur

**Bildschirmtastatur.** Im Querformat nimmt sie rund 40 % der Höhe ein. Sobald sie sich in einem Berichtsfeld öffnet, gilt der **Schreibmodus**:

- Navigationsleiste und Kopfzeile bleiben, Nebenspalten (Hinweise, Seit deinem letzten Dienst) klappen ein; das aktive Feld rückt an den oberen Rand und bleibt vollständig sichtbar (`Modifier.imePadding()`, `bringIntoViewRequester`).
- Direkt über der Tastatur liegt die Tastenleiste (`nu-tastenleiste`): „@ Gast“, „Verwarnung“, „Gelbe Karte“, „Hausverbot“, rechts „Fertig“. „Fertig“ schließt die Tastatur und speichert.
- „@“ schlägt Gäste mit Bettnummer vor; gewählt wird „@Max (D4)“ eingefügt, wenn es den Vornamen mehrfach gibt. Wer selbst tippt, bekommt bei Mehrdeutigkeit eine Warnung unter dem Feld.
- Feldtypen setzen die passende Tastatur: Namen `KeyboardCapitalization.Words`, Bettnummern und Schlüsselnummern `KeyboardType.Number`, Freitext mit Autokorrektur und `ImeAction.Default` (Enter = neuer Absatz). Einzeilige Felder springen mit `ImeAction.Next` weiter.
- Jede Eingabe wird nach 300 ms Pause lokal gespeichert; der Zwischenstand steht klein unter dem Feld („Gespeichert 21:14“).

**Hardware-Tastatur** (z. B. Book Cover Keyboard):

| Taste | Wirkung |
| --- | --- |
| Tab / Umschalt+Tab | nächstes / vorheriges Feld oder Element |
| Enter | Knopf auslösen, Dialog bestätigen; im Freitext neuer Absatz |
| Strg+Enter | Feld abschließen, Schritt „Weiter“ |
| Esc | Schnellauswahl, Detailbereich oder Dialog schließen |
| Pfeiltasten | im Bettenplan von Bett zu Bett; in Vorschlagslisten wählen |
| Leertaste auf Bettkarte | Karte anheben; Pfeile wählen Ziel, Enter legt ab |
| Strg+F | Gästesuche |
| Alt+1 … Alt+5 | Bettenplan, Gäste, Dienst & Bericht, Kalender, Einstellungen |

Mit Hardware-Tastatur ist der Fokusring immer sichtbar.
