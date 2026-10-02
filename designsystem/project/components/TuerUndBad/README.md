# Tür und Bad

Türen im Grundriss zeigen, was zu ist: ein ganz gesperrtes Zimmer, der gesperrte Flur und das abgeschlossene Bad. Das Bad ist während der Duschzeit abgeschlossen und erinnert ans Aufschließen.

**Bad** (`nu-bad`, liegt als Knopf über der Badfläche des Grundrisses)
| Zustand | Aussehen | Bedeutung |
| --- | --- | --- |
| `zu` | `flaeche-3`, Symbol `schloss`, „zu · noch 2 Duschen“ | abgeschlossen, solange geplante Duschen offen sind |
| `erinnern` | `warnung-flaeche`, Rand 3 dp `warnung`, pulsiert dreimal, Symbol `glocke`, „Alle geduscht · aufschließen“ | alle Duschen des Abends erledigt oder verpasst |
| `frei` | `frei-flaeche`, Text `frei`, Symbol `schloss-offen`, „frei“ | aufgeschlossen |

- Jeder Diensttag beginnt mit „zu“. Sobald im Duschplan keine Dusche mehr „geplant“ ist: Einblendung **„Bad aufschließen“**, Eintrag an der Glocke (führt zum Bad im Grundriss) und Zustand `erinnern`.
- **Kurz antippen** schließt auf (`frei`, Einblendung „Bad ist frei · Aufgeschlossen um 21:42“). Antippen bei `zu` fragt „Bad schon aufschließen? Noch nicht geduscht: 20:30 Lisa“; bei `frei` fragt es „Bad wieder abschließen?“ (z. B. für eine Dusche außer der Reihe).
- Vergangene Tage: nur Anzeige, nicht antippbar. Unter 900 dp steht das Bad als Kachel unter den Zimmerrahmen.

**Türen** (`nu-tuer`): Angel, offenes Türblatt und Schließwinkel stehen in der Grundriss-Geometrie (`tueren`).
- Offen: Bogen und Blatt 1,5 Einheiten `tinte-3`. Zu: das Blatt liegt in der Wandflucht, 6 Einheiten `tinte`, der Bogen ist weg – die Wand ist geschlossen.
- **Animation:** Schließen 700 ms, Blatt dreht um die Angel, beschleunigt und federt am Ende kurz nach (`cubic-bezier(.55,0,.85,.35)`); der Bogen blendet aus. Öffnen 700 ms mit `kurve-austritt`. Die Animation läuft, wenn sich der Zustand ändert, während der Grundriss sichtbar ist – oder beim nächsten Öffnen des Bettenplans, wenn ein Zimmer in den Einstellungen gesperrt wurde. Beim Wechsel des Tages keine Animation.
- Welche Tür: Zimmer D, T-Zimmer (zwischen T und F), Zimmer F (zum Flur), Zimmer B, Flur (wenn T und F gesperrt), Bad. Die Tür zwischen den beiden Räumen von Zimmer D schließt nie.
- Reduzierte Bewegung: Endzustand sofort.

**Compose:** Türblatt als `drawLine` in `rotate(winkel, pivot = angel)`; `animateFloatAsState(if (zu) winkelZu else 0f, tween(700, easing = CubicBezierEasing(.55f, 0f, .85f, .35f)))`. Bad als eigenes Composable über dem `Canvas`. Zustand aus `Duschplan.bad` (siehe Dateisystem).
