# App-Gerüst

Das Gerüst jeder Ansicht im Querformat: Navigationsleiste links, Kopfzeile oben, Inhalt darunter, Detailbereich bei Bedarf rechts.

- Raster für 10–12-Zoll-Tablets im Querformat (z. B. 1280 × 800 dp): Leiste `leiste-breite` 104 dp, Kopf `kopf-hoehe` 72 dp, Inhalt mit `abstand-4` (16 dp) Rand links und 20 dp rechts.
- **Bettenplan:** oben Ampel und KHT-Zahlen (bleiben beim Scrollen stehen), darunter die Reiter **St. Pius** und **St. Nikolaus** und „Gast aufnehmen“. St. Pius zeigt den Grundriss, rechts daneben Loggien, Esszimmer, Tiny House und weitere Plätze untereinander (`nu-plan-raster`: Plan flexibel, Spalte 176 dp).
- Der **Detailbereich** (`detail-breite` 460 dp) schiebt sich rechts über den Inhalt; der Plan bleibt links sichtbar und bedienbar (Bett antippen wechselt den Gast im Detailbereich).
- **Assistent** und **Dialoge** liegen über allem mit `abdunklung`.
- Unter 900 dp Breite (Hochformat, Handy): Navigation unten, Kennzahlen gestapelt, statt Grundriss die Zimmerrahmen untereinander, Detailbereich als Vollbild.
- Grundfarben: `grund` hinter allem, `flaeche` für Inhaltsblöcke, `flaeche-2` für Leiste und Felder. Abschnitte trennt Abstand, keine Linien.
- Nachtmodus („Nacht“-Werte) gilt automatisch von 20:00 bis 07:00 oder nach Systemeinstellung; umschaltbar in den Einstellungen.
