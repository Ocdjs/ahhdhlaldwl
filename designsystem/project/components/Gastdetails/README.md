# Gastdetails

Der Detailbereich rechts zeigt alles zu einem Gast und bietet die Handlungen am Bett.

- Breite `detail-breite` (460 dp), Grund `flaeche`, links `radius-l`, gleitet mit `dauer-lang` und `kurve-eintritt` herein. Der Plan bleibt links bedienbar.
- **Kopf:** Bettnummer `nummer-gross`, Name `titel` (bei gleichem Vornamen mit Bettnummer: „Ali (L5)“), darunter Aufnahmenummer, Status, Nächte in `text-klein`. Schließen oben rechts (48 dp).
- **Warnzeilen** stehen ganz oben (`nu-zeile--warnung`): Läuseschein, fehlt unentschuldigt, Rückkehrtag. Hausverbot als `nu-zeile--vorfall`.
- **Abschnitte** in fester Reihenfolge: Stammdaten, Aufenthalt (mit Dauer: „1 Nacht“, „mehrere Nächte, ohne Enddatum“ oder „bis 09.10.“), Läuseschein, Dokumente, Sanktionen, Notizen.
- **Dokumente:** fehlt die Unterschrift, steht eine Warnzeile mit „Jetzt“; das startet den verkürzten Assistenten (Sprache, Hausordnung, Datenschutz, Abschluss). Darunter immer „In der Gästedatenbank öffnen“.
- **Notizen** chronologisch, neueste oben, mit Datum, Verfasser*in und Herkunft („aus Bericht vom 01.10. · erwähnt, keine Sanktion“).
- **Aktionen** unten fest (`flaeche-2`), zwei Spalten: Einchecken / Ist doch da / Notiz (je nach Status als Hauptknopf), Abwesenheit, Bett wechseln, Duschslot, **Bett frei**, Sanktion.
- **Bett frei** (früher „Auszug“) fragt nach: „Bett L5 freigeben? Ali zieht aus. Das Bett ist ab heute frei, Ali bleibt in der Gästedatenbank.“
- Vergangene Tage: Aktionen ausgeblendet, stattdessen „Nachtrag hinzufügen“.
