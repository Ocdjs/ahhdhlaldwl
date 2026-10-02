# Schnellauswahl

Eine kleine Auswahl, die am angetippten Bett aufgeht, damit Check-in und Aufnahme in höchstens drei Tipps gehen.

- Breite 300 dp, `flaeche`, `radius-l`, `schatten-schwebend`. Erscheint unter der Karte (oder darüber, wenn unten kein Platz ist) und wächst aus ihr heraus (`dauer-kurz`).
- Kopf: Name in `name-bett`, daneben „D4 · erwartet“ in `nummer`.
- **Erwartet**: „Ist da“ (Hauptknopf), „Nicht da“, „Details“. Nach „Ist da“: „Bett dauerhaft behalten“, „Duschslot wählen“, „Abwesenheit“, „Fertig“.
- **„Nicht da“** fragt nach: „Ion ist nicht gekommen?“ mit „Weiter warten“, „Hat sich abgemeldet“ (öffnet Abwesenheit, Bett freihalten oder frei bis Rückkehr) und „Fehlt unentschuldigt“ (Hauptknopf). Der Dialogtext sagt, was mit der Zählung passiert: 1. Nacht bleibt belegt, ab der 2. Nacht in Folge frei.
- **Fehlt (1. Nacht)**: „Ist doch da“, „Details“.
- **Fehlt ab 2. Nacht**: Das Bett gilt als frei: „Gast aufnehmen“, „Ben ist doch da“, „Details Ben“. Wird das Bett neu vergeben, bekommt Ben eine Notiz und bleibt in der Gästedatenbank.
- **Frei**: „Gast aufnehmen“. **Frei bis Rückkehr**: dazu „Details“ des abwesenden Gastes.
- Offene Erinnerungen stehen als Warnzeile oben (Läuseschein, „fehlte gestern unentschuldigt“).
- Schließt mit Tipp daneben, Esc oder nach erledigter Handlung. Das Bett behält dann `is-gesetzt` für die Bestätigung.
