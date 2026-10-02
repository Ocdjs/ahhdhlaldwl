# Android und Compose

So wird das System in Kotlin mit Jetpack Compose und Material 3 umgesetzt. Werte immer aus `tokens.json` übernehmen; px in den Tokens sind dp, Schriftgrößen sp.

## Theme

Zwei `ColorScheme` (hell = Tag, dunkel = Nacht), dazu ein eigenes `NuColors`-Objekt für die Statusfarben, bereitgestellt über `CompositionLocal`.

| Material-Rolle | Token |
| --- | --- |
| `background` | `grund` |
| `surface` | `flaeche` |
| `surfaceVariant`, `surfaceContainer` | `flaeche-2` |
| `surfaceContainerHighest` | `flaeche-3` |
| `onBackground`, `onSurface` | `tinte` |
| `onSurfaceVariant` | `tinte-2` |
| `outline` | `linie-stark` |
| `outlineVariant` | `linie` |
| `primary` | `primaer` |
| `onPrimary` | `auf-primaer` |
| `error` | `vorfall` |
| `onError` | `auf-vorfall` |
| `errorContainer` | `vorfall-flaeche` |
| `scrim` | `abdunklung` |

Alle übrigen Farben (`frei`, `frei-flaeche`, `blau`, `erwartet-flaeche`, `anwesend`, `auf-anwesend`, `gehalten-flaeche`, `aus-flaeche`, `aus-schraffur`, `ampel-*`, `karte-*`, `warnung`, `warnung-flaeche`, `papier`, `papier-linie`, `stift-tinte`, `auf-papier`, `auf-papier-2`) gehören in `NuColors`. Material-Standardfarben (lila `primary`, Tönungen) dürfen nirgends durchscheinen: `dynamicColor = false`.

**Nachtmodus:** Einstellung „automatisch 20:00–07:00“ (Standard), „immer Tag“, „immer Nacht“ oder „wie System“. Umschalten blendet in 250 ms über.

## Schrift

`res/font/`: `atkinson_hyperlegible_next_regular/semibold/bold`, `atkinson_hyperlegible_mono_regular/semibold`, `noto_sans_regular/semibold`, `noto_sans_arabic_regular/semibold` (alle OFL, Google Fonts). Für Kyrillisch und Arabisch im PDF dieselben Noto-Dateien.

| Typography-Rolle | Token |
| --- | --- |
| `headlineMedium` | `titel-gross` 28/34 700 |
| `titleLarge` | `titel` 22/28 700 |
| `titleMedium` | `abschnitt` 18/24 700 |
| `bodyLarge` | `text` 17/26 400 |
| `bodyMedium` | `text-klein` 15/22 400 |
| `labelLarge` | `knopf` 17/24 600 |
| `labelMedium` | `label` 14/18 600 |
| `labelSmall` | `ueberzeile` 13/16 700, Versalien, +0,08 em |

Eigene Stile: `nameBett` (20/24 700), `zahlGross`, `nummerGross`, `nummer` (Mono), `dokument`, `dokumentRtl`.

## Formen und Maße

`Shapes(small = RoundedCornerShape(6.dp), medium = RoundedCornerShape(10.dp), large = RoundedCornerShape(16.dp))`; Pillen `CircleShape`. Ein `object NuDimens` mit allen `groesse`- und `abstand`-Werten. `minimumInteractiveComponentSize` bleibt an (48 dp).

## Bausteine → Compose

| Baustein | Compose |
| --- | --- |
| Navigationsleiste | `NavigationRail` mit fünf `NavigationRailItem` (Bettenplan, Gäste, Dienst & Bericht, Kalender, Einstellungen), `indicatorColor = primaer` |
| Kopfzeile | eigene `Row` in `Scaffold.topBar`, keine `TopAppBar`-Höhe |
| Bettkarte | eigene `Surface` mit `combinedClickable(onClick, onLongClick)`, `semantics { contentDescription = … }`; Parameter `kompakt` für den Grundriss |
| Grundriss | `BoxWithConstraints` + `Modifier.aspectRatio(971f / 800f)`; Wände, Türen, Privaträume in einem `Canvas`; Betten als `BettKarte(kompakt = true)` mit `offset`/`size` = Grundriss-Einheiten × (Breite ÷ 971) |
| KHT-Nummer | schlichte Kennzahl als `TextButton`; Wert aus `khtNummer()` (siehe Fachregeln), kurzes Blatt als `ModalBottomSheet` |
| Monatsabschluss, Dienstnachweis | `LazyColumn` mit Tabellenzeilen, Unterschrift wie im Assistenten, nach dem Speichern nur lesend |
| Gastakte | zweispaltig `Row` (Liste 380 dp, Akte `weight(1f)`); Dokumentzeilen als `ListItem` mit eigenem Hintergrund |
| Ziehen | `Modifier.pointerInput { detectDragGesturesAfterLongPress }`, Ziel per Hit-Test auf gemerkte `LayoutCoordinates` |
| Schnellauswahl | `Popup` mit `PopupPositionProvider` an der Karte |
| Detailbereich | `AnimatedVisibility` am rechten Rand, keine `ModalBottomSheet` |
| Assistent | Vollbild-`Dialog` (`usePlatformDefaultWidth = false`), `AnimatedContent` für Schritte |
| Unterschrift | `Canvas` + `pointerInput`, Pfade als `List<Offset>` mit Druck; Export über `ImageBitmap` |
| Ja/Nein, 7 Tage/Monat, Duschtag | `SingleChoiceSegmentedButtonRow` mit eigenen Farben |
| Dauer „Enddatum festlegen“ | `Switch` in einer Zeile; bei an `DatePicker` und `FilterChip`s (+3, +7, +14) |
| Hausordnung zweispaltig | `Row { Dokument(de, Modifier.weight(1f)); Dokument(übersetzung, Modifier.weight(1f)) }`, unter 900 dp `Column` |
| Teilen | `Intent.ACTION_SEND` + `FileProvider`, `Intent.createChooser`, kein voreingestellter Empfänger |
| Einblendung | eigener Host oben rechts, nicht `Snackbar` (die sitzt unten) |
| Admin-PIN | eigenes Raster aus `Button`s, keine Systemtastatur |

## Bewegung

`tween(90)` Druck; `tween(150, easing = Eintritt)` Schnellauswahl; `tween(250, easing = Eintritt)` Statuswechsel und Schritte; `tween(350, easing = Eintritt)` Detailbereich, Tauschen, Abschließen. Eintritt = `CubicBezierEasing(0.05f, 0.7f, 0.1f, 1f)`, Standard = `CubicBezierEasing(0.2f, 0f, 0f, 1f)`, Austritt = `CubicBezierEasing(0.3f, 0f, 0.8f, 0.15f)`. Statuswechsel als kreisförmige Freilegung: `drawWithContent` + `clipPath` mit animiertem Radius ab Tipp-Punkt. Bei `ANIMATOR_DURATION_SCALE == 0` nur `fadeIn/fadeOut(tween(90))`.

## Daten, die die Oberfläche braucht

- `Bett`: `nr`, `zimmer_id`, `standort` (St. Pius, St. Nikolaus), `gesperrt`, `notbett`, Grundriss `x`, `y`, `breite`, `hoehe`, `stock_id`, `lage` (oben/unten).
- `Belegung` je Bett und Diensttag: `gast_id`, `status` (`BettStatus`, siehe Fachregeln), `fehlt_naechte`, `fehlte_vornacht`, `bis` (Rückkehr), `ende` (Abreise, darf leer sein), `dauerhaft`.
- `Gast`: Stammdaten, `anzeigename()` als abgeleitete Funktion (nie gespeichert), `dokumente`, `uebersetzung`, `unterschrieben_am`.
- `Erwaehnung` und `Sanktion` mit `bericht_id` und `absatz`; eine Sanktion hat genau einen `gast_id`.
- `Bett.platz`: der gezeichnete Platz, an dem die Nummer steht (Nummerntausch in den Einstellungen).
- Monatsabschluss: `Plan0`, `Einsatz`, `PlanKorrektur`, `Dienstnachweis` (unveränderlich nach dem Anlegen), daraus die Lohntabelle als CSV in Nextcloud (siehe Fachregeln).
- `khtNummer()`, `freieBetten()`, `anzeigename()`, `nachweisDaten()` und die Statuswechsel am Tageswechsel als reine Funktionen mit Unit-Tests.

## Symbole

Die SVG-Dateien aus Assets › Symbole in Android Studio als Vector Asset importieren (`res/drawable/nu_<name>.xml`), Strichfarbe auf `@android:color/black` lassen und per `tint` färben. `karte_gelb` und `karte_rot` ohne `tint` verwenden.

## Fenster, Tastatur, Sprache

- `enableEdgeToEdge()`, `WindowInsets.safeDrawing`; im Bericht `imePadding()`. `android:windowSoftInputMode="adjustResize"`.
- Querformat bevorzugt (`screenOrientation="sensorLandscape"`), Hochformat lauffähig.
- Alle Texte in `strings.xml` (Deutsch). Mehrsprachig sind nur Hausordnung und Datenschutz; deren Ansicht setzt `LocalLayoutDirection` lokal auf RTL für `ar` und `fa`.
- Kiosk: `startLockTask()`; Ausnahmen (Dienstplan per Kamera oder Nextcloud-Auswahl) laufen innerhalb der App.
