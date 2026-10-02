# Symbole

69 eigene Symbole im 24-dp-Raster, Strich 2 dp, runde Enden, einfarbig in `tinte` oder der Farbe des Zustands. Die Dateien liegen unter **Assets › Symbole** als SVG.

- Größen: `symbol` (24 dp) in Knöpfen, Navigation und Zeilen; `symbol-klein` (18 dp) auf Bettkarten und Chips.
- Einfärben: in Compose `Icon(painterResource(R.drawable.nu_bett), tint = …)`. Die SVG-Dateien sind mit `tinte` (#121A1F) gezeichnet; nach dem Import als Vector Drawable (Android Studio › New › Vector Asset) wird die Farbe über `tint` gesetzt.
- Ausnahme: `karte-gelb` und `karte-rot` haben eine feste Füllung (`karte-gelb` mit Kante `karte-gelb-rand`, `karte-rot`). Sie werden nicht eingefärbt.
- Ein Symbol steht nie allein für einen Zustand. Am Bett trägt jedes Symbol eine `contentDescription` („Läuseschein fehlt“, „Gelbe Karte“, „Notiz vorhanden“, „Duschslot 20:30“).

| Symbol | Bedeutung |
| --- | --- |
| `bett`, `stockbett`, `bett-plus` | Bett, Stockbett, Gast aufnehmen |
| `anwesend`, `erwartet`, `schloss`, `rueckkehr`, `deaktiviert` | Bettstatus anwesend, erwartet, freigehalten, frei bis Rückkehr, gesperrt |
| `laeuseschein`, `laeuseschein-fehlt`, `warnung` | Läuseschein liegt vor, fehlt, überfällig |
| `verwarnung`, `karte-gelb`, `karte-rot` | Sanktionsstufen |
| `notiz`, `dusche`, `vorfall`, `schluessel` | Notiz vorhanden, Duschslot, Vorfall, Schlüssel fehlt |
| `abwesend`, `auszug`, `tauschen`, `umziehen` | Abwesenheit und „fehlt“, Bett frei (Auszug), Tauschen, Umziehen |
| `haus`, `standort-2` | St. Pius, St. Nikolaus |
| `bericht`, `kalender`, `regler`, `glocke` | Navigation und Kopfzeile |
| `wolke-ok`, `abgleich`, `wolke-wartet`, `wolke-aus` | Abgleich: synchronisiert, läuft, Änderungen ausstehend, offline |
| `ampel`, `telefon` | Ampel, KHT-Zahlen und „Hat KHT angerufen?“ |
| `unterschrift`, `stift`, `tastatur`, `scannen`, `kamera` | Unterschrift (auch: fehlt noch), Nachtrag, Schreibmodus, Läuseschein scannen |
| `teilen`, `dokument-plus` | PDF teilen (ohne festen Empfänger), Dokument in der Gästedatenbank hinterlegen |
