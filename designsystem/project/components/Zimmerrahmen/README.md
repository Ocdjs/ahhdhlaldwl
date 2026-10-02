# Zimmerrahmen

Ein Zimmer als Rahmen mit Namen und Bettkarten: die Darstellung des Bettenplans auf schmalen Bildschirmen.

- Auf dem Tablet im Querformat zeigt der Bettenplan **den Grundriss** (siehe Grundriss). Zimmerrahmen gelten unter 900 dp Breite (Hochformat, Handy) und überall, wo Betten als Liste erscheinen (Einstellungen).
- Rahmen `flaeche`, `radius-l`, Innenabstand 12 dp, Lücke zwischen Karten `abstand-3` (12 dp). Kopf: Zimmername in `ueberzeile` (`tinte-2`), rechts „1 von 4 frei“ in `nummer`.
- Reihenfolge wie im Grundriss: Zimmer D, T-Zimmer, Zimmer B, Zimmer F, dann Loggien, Esszimmer, Tiny House, weitere Plätze.
- Gesperrtes Zimmer: ganzer Rahmen schraffiert (`aus-schraffur` auf `aus-flaeche`), Kopf „gesperrt“; Betten darin sind nicht antippbar und zählen nicht.
