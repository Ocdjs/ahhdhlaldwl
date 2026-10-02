# Duschplan

Ein Raster aus Zeitslots, in das man Gäste einträgt und das zum Slotbeginn erinnert.

- **Tagesauswahl** oben (`nu-seg`): Heute, Morgen, Übermorgen, In 3 Tagen. Der Duschplan ist der einzige Ort neben dem Kalender, der nach vorn schaut; die Kopfzeile geht nie in die Zukunft.
- Slot `nu-slot` (mindestens 150 × 76 dp): Uhrzeit `nummer`, Name `text-stark` (bei gleichem Vornamen mit Bettnummer), Bett in `text-klein`.
- Zustände: frei (`flaeche-2`, „frei“ in `tinte-3`), geplant (`erwartet-flaeche`, Rahmen `blau`), erledigt (Rahmen `frei`, ✓ an der Uhrzeit), verpasst (Name durchgestrichen, „verpasst“).
- Freien Slot antippen → Gast wählen (heute aus den anwesenden, für die nächsten Tage aus allen Gästen mit Bett). Belegten Slot antippen → „Erledigt“, „Verpasst“, „Freigeben“.
- Zu Slotbeginn eine Einblendung „Dusche 20:30 – Ali, Bett D4“, auch im Hintergrund (AlarmManager), Ton optional.
- Raster, Länge und Anzahl in den Einstellungen.
