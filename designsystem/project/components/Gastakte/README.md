# Gastakte

Die Gästedatenbank ist ein eigener Bereich („Gäste“ in der Navigation): links die Liste, rechts die Akte des gewählten Gastes. Hier wird alles hinterlegt, was nach der Aufnahme dazukommt.

- **Liste:** Suchfeld (Name, Spitzname, Bettnummer), Filter „Alle · Mit Bett · Fehlt etwas · Hausverbot“ (`nu-seg`), Trefferzeilen wie in der Gästesuche mit Bettnummer links. Rechts in der Zeile Warnsymbole in `warnung`: `unterschrift` (Hausordnung fehlt), `laeuseschein-fehlt`.
- **Kopf der Akte:** Bettnummer groß, Name mit Spitzname, Aufnahmenummer, Sprache, Nächte, „angezeigt als Max (L5)“ bei gleichem Vornamen; „Im Plan“ springt zum Bett.
- **Dokumente** als Zeilen (`nu-dokzeile`, 64 dp): Hausordnung, Datenschutzerklärung, Läuseschein, weitere. Fehlt etwas: Grund `warnung-flaeche` und Handlung rechts:
  - „Jetzt unterschreiben“ startet den verkürzten Assistenten (Sprache, Hausordnung zweispaltig, Datenschutz, Abschluss) und legt das PDF ab.
  - „Dokument hinterlegen“ (`dokument-plus`): Art wählen (Hausordnung auf Papier, Läuseschein, Bescheinigung, Sonstiges), Foto oder Datei, Notiz. „Hausordnung auf Papier“ zählt als unterschrieben; „Läuseschein“ setzt den Läuseschein auf „liegt vor“.
- Darunter Sanktionen und **Notizen und Erwähnungen** (auch Erwähnungen ohne Sanktion aus Berichten).
- Keine Admin-PIN zum Ansehen und Hinterlegen; Löschen und Stammdaten ändern nur mit PIN. Bilder von Läusescheinen sind Gesundheitsdaten: keine Vorschau in Listen.
- Unter 900 dp: erst die Liste, nach Auswahl die Akte als Vollbild mit Schließen.
