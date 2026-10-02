# Einstellungszeilen

Eine Zeile je Einstellung: Symbol, Name, aktueller Wert, rechts Schalter oder Knopf. Unter „Betten und Zimmer“ lassen sich Zimmer und **einzelne Betten sperren**, **Nummern innerhalb eines Zimmers tauschen** und **weitere Plätze** in St. Pius und St. Nikolaus anlegen.

- `nu-einstellung` mindestens 72 dp, Grund `flaeche`. Name `text-stark`, Wert `text-klein` (`tinte-2`); der Wert ist immer sichtbar.
- **Zimmerkarte** (`nu-zimmer-einst`): Zimmerzeile mit „Nummern tauschen“ und Schalter, darunter je Bett ein **Bettschalter** (`nu-bettschalter`, 56 dp): Nummer, Zustand („belegt · Paul“, „gesperrt“), Schalter. Gesperrt: schraffiert.
- **Nummern tauschen:** Der Knopf schaltet die Karte in den Tauschmodus: Bettschalter werden zu Kacheln, oben eine Zeile „Zwei Betten antippen …“. Erstes Bett antippen (Rahmen 3 dp `tinte`), zweites antippen, Rückfrage „D1 und D6 tauschen?“. Danach steht im Plan jede Nummer am Platz der anderen; Belegung, Sperre und Notbett bleiben bei der Nummer. „Ursprünglich“ setzt das Zimmer zurück, „Fertig“ beendet den Modus. Nur innerhalb eines Zimmers.
- **Weitere Plätze** (St. Pius und St. Nikolaus): Felder „Nummer“ (frei, 1–6 Zeichen, Vorschlag Z1 bzw. N9) und „Bezeichnung“, Knopf „Platz hinzufügen“. Jeder Platz lässt sich umbenennen (Nummer und Bezeichnung) und, solange er frei ist, entfernen. Doppelte Nummern lehnt die App mit Klartext ab.
- **Notbett** als Chip an Loggien, Esszimmer, Tiny House und weiteren Plätzen: Notbetten werden nur über den Kältebus belegt und zählen nur, wenn sie belegt sind.
- **Noch nicht verfügbar** (`nu-bald`): gestrichelte Marke mit Uhr. Keine stillen Platzhalter.
- Gruppe **Dienstplan einlesen** (siehe dort): einmal zu Monatsbeginn durch die Leitung, Ergebnis ist der Originalplan.
