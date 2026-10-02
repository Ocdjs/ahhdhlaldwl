# Navigationsleiste

Die Leiste links ist immer sichtbar und führt in die fünf Bereiche.

- Breite `leiste-breite` (104 dp), Grund `flaeche-2`. Ziele 88 × 76 dp, Symbol 24 dp über dem Wort (13 sp, 600).
- Gewählt: Pille 64 × 36 dp in `primaer`, Symbol in `auf-primaer`, Wort in `tinte`. Nie nur die Farbe des Symbols ändern.
- Reihenfolge: **Bettenplan, Gäste, Dienst & Bericht, Kalender**; Einstellungen unten, getrennt durch freien Raum.
- **Gäste** (Gästedatenbank) braucht keine Admin-PIN: Der Dienst holt dort Unterschriften nach und hinterlegt Dokumente. Löschen und Korrekturen an Stammdaten bleiben hinter der PIN.
- Einstellungen fragen beim Öffnen die Admin-PIN ab.
- Ein offener Bericht ohne Abschluss zeigt am Symbol „Dienst & Bericht“ einen Punkt in `warnung`.
- Hardware-Tastatur: Alt + 1 bis Alt + 5 springen in die Bereiche.
- Compose: `NavigationRail` mit `NavigationRailItem`, `indicatorColor = primaer`. Unter 900 dp Breite wird daraus eine `NavigationBar` unten.
