# Bewegung

Bewegung bestätigt eine Handlung und zeigt, woher etwas kommt; sie schmückt nicht. Nachts bleibt alles ruhig: nichts blinkt, nichts läuft in Schleife außer dem Abgleich-Symbol, solange ein Abgleich läuft.

| Anlass | Dauer | Kurve | Was passiert |
| --- | --- | --- | --- |
| Antippen | `dauer-sofort` 90 ms | `kurve-standard` | Element auf 97 %, Grund `flaeche-3` |
| Statuswechsel am Bett (Check-in) | `dauer-mittel` 250 ms | `kurve-eintritt` | neue Füllung wächst als Kreis aus dem Tipp-Punkt, Häkchen wird gezeichnet |
| Schnellauswahl am Bett | `dauer-kurz` 150 ms | `kurve-eintritt` | wächst von 92 % aus der Bettkarte, blendet ein |
| Detailbereich | `dauer-lang` 350 ms | `kurve-eintritt` | gleitet von rechts herein, Abdunklung blendet ein |
| Assistent: Schritt | `dauer-mittel` 250 ms | `kurve-standard` | neuer Schritt kommt 32 dp aus Leserichtung (bei Arabisch und Farsi gespiegelt) |
| Bettkarte ziehen | sofort | – | Karte hebt sich (105 %, −1°, `schatten-gehoben`), Ziel zeigt Rahmen: grün = umziehen, blau = tauschen |
| Ablegen | `dauer-lang` 350 ms | `kurve-standard` | Karte gleitet ins Ziel und federt (98 %) |
| Tauschen bestätigt | `dauer-lang` 350 ms | `kurve-standard` | beide Karten wechseln auf leicht gebogenen Bahnen den Platz |
| Datumswechsel | `dauer-mittel` 250 ms | `kurve-standard` | Inhalt blendet über und rückt 16 dp in Pfeilrichtung |
| Zähler an der Glocke | `dauer-mittel` 250 ms | `kurve-standard` | Pop auf 118 %, einmal |
| Einblendung (Duschslot) | `dauer-lang` herein, `dauer-einblendung` 6 s Standzeit | `kurve-eintritt` | gleitet von rechts oben herein, Laufbalken zeigt die Restzeit, danach in die Glocke |
| Bericht abschließen | `dauer-lang` 350 ms | `kurve-standard` | Schloss rastet ein, Felder wechseln auf schreibgeschützt |
| Falsche PIN | 300 ms | `kurve-standard` | Punkte schütteln sich, dann leer |
| Abgleich läuft | 1,1 s je Umdrehung | linear | Symbol `abgleich` dreht, bis der Abgleich endet |

**Reduzierte Bewegung:** Ist in Android „Animationen entfernen“ an (`Settings.Global.ANIMATOR_DURATION_SCALE == 0`), werden alle Übergänge zu Überblendungen unter 100 ms; das Abgleich-Symbol dreht nicht.

**Compose:** `tween(durationMillis = 250, easing = CubicBezierEasing(0.05f, 0.7f, 0.1f, 1f))` für `kurve-eintritt`; `CubicBezierEasing(0.2f, 0f, 0f, 1f)` für `kurve-standard`; `CubicBezierEasing(0.3f, 0f, 0.8f, 0.15f)` für `kurve-austritt`. Detailbereich: `AnimatedVisibility(enter = slideInHorizontally { it } + fadeIn())`.
