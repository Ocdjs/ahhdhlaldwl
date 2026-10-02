# Bettkarte

Eine Bettkarte zeigt auf einen Blick, wer im Bett liegt und was heute zu beachten ist.

**Aufbau** (`bett-breite` 152 × `bett-hoehe` 88 dp, `radius-m`): oben links die Bettnummer (`nummer`), oben rechts Status-Wort und -Symbol; Mitte der Vorname groß (`name-bett`, eine Zeile, Kürzung mit …); unten Nächte in dieser Saison und die Symbolreihe (18 dp).

| Status | Füllung | Kante | Symbol | Text | für KHT |
| --- | --- | --- | --- | --- | --- |
| frei | `frei-flaeche` | 2 dp `frei` | `plus` | „frei“, „Gast aufnehmen“ | frei |
| erwartet | `erwartet-flaeche` | 2 dp `blau` | `erwartet` | „erwartet“, Name | belegt |
| anwesend | `anwesend` | – | `anwesend` | Name in `auf-anwesend` | belegt |
| fehlt (1. Nacht unentschuldigt) | `erwartet-flaeche` | 2 dp `warnung` | `abwesend` | „fehlt“, Name, „unentschuldigt“ | belegt |
| fehlt (ab 2. Nacht in Folge) | `frei-flaeche` | 2 dp `frei` | `abwesend` in `warnung` | „fehlt 2 N.“, „frei“, „Simon fehlt“ | frei |
| freigehalten bis | `gehalten-flaeche` | 2 dp `linie-stark` | `schloss` | „bis 06.10.“ | belegt |
| frei bis Rückkehr | `frei-flaeche` | 2 dp `frei` | `rueckkehr` | „bis 08.10.“, „Leon kommt zurück“ | frei |
| gesperrt | Schraffur `aus-schraffur` auf `aus-flaeche` | 1,5 dp | `deaktiviert` | „aus“ | nicht gezählt |

Die Füllung folgt der Zählung: **grün heißt frei, blau heißt belegt.** Ausnahme: ein freies Notbett ist grün, zählt aber nicht als frei (es wird nur über den Kältebus belegt); belegt zählt es mit. Deshalb wird ein Bett, dessen Gast die 2. Nacht in Folge unentschuldigt fehlt, grün; der Name bleibt klein sichtbar.

**Kompakte Bettkarte** (`nu-bett--kompakt`) im Grundriss: füllt die gezeichnete Bettfläche; oben Nummer und Status-Symbol, Mitte der Name, unten „bis 08.10.“, „fehlt“ oder „fehlt 2 N.“ und höchstens zwei Symbole (Nächte und Notiz entfallen). Unter 80 dp Breite wird der Name 14,5 sp und das Wort „bis“ entfällt. Die Zielfläche bleibt mindestens 48 dp.

**Symbolreihe**, in dieser Reihenfolge: `laeuseschein-fehlt` (oder `warnung` ab Tag 3), `karte-rot`, `karte-gelb`, `notiz`, `dusche`. Höchstens vier; das fünfte wird zu „+1“.
- Läuseschein seit 3 Tagen überfällig: zusätzlich Ring 2 dp `warnung` außen um die Karte (`is-warn`) und der Klartext in der Schnellauswahl.
- Farbe steht nie allein: jeder Status hat ein Wort oder Symbol, jede Karte eine `contentDescription` („Bett T1 oben, fehlt unentschuldigt, zählt als belegt, Jan“).
- Geöffnet (Detailbereich zeigt diesen Gast): Ring 3 dp `fokus` mit 3 dp Abstand.

**Bedienung:** frei → „Gast aufnehmen“; erwartet → „Ist da / Nicht da / Details“; fehlt → „Ist doch da / Details“; fehlt ab 2. Nacht → „Gast aufnehmen / Ist doch da / Details“; anwesend → Detailbereich. Langes Drücken → Ziehen (siehe Umziehen und Tauschen).
