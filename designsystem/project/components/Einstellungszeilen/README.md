# Einstellungszeilen

Eine Zeile je Einstellung: Symbol, Name, aktueller Wert, rechts Schalter oder Pfeil. Unter „Betten und Zimmer“ lassen sich ganze Zimmer **und jedes einzelne Bett** sperren.

- `nu-einstellung` mindestens 72 dp, Grund `flaeche`. Name `text-stark`, Wert `text-klein` (`tinte-2`); der Wert ist immer sichtbar, ohne die Zeile zu öffnen.
- **Zimmerkarte** (`nu-zimmer-einst`): oben die Zimmerzeile mit Schalter („5 von 6 Betten in Betrieb“), darunter alle Betten als **Bettschalter** (`nu-bettschalter`, 56 dp, Raster ab 150 dp): Nummer, Zustand („belegt · Jonas“, „in Betrieb“, „gesperrt“), Schalter. Gesperrt: schraffiert. Ist das Zimmer aus, sind die Bettschalter gesperrt.
- Ein gesperrtes Bett erscheint im Plan schraffiert, ist nicht antippbar und zählt weder für KHT noch für die Ampel.
- In Loggien, Esszimmer, Tiny House und weiteren Plätzen trägt jeder Bettschalter den Chip **„Notbett“**: Notbetten zählen nicht für das Kältehilfetelefon.
- **Weitere Plätze:** Namensfeld und „Platz hinzufügen“ legen Z1, Z2 … an; freie Plätze lassen sich wieder entfernen.
- Sofort wirksame Ein/Aus-Werte mit `nu-schalter`; alles andere öffnet eine Unterseite (Pfeil `weiter`).
- **Noch nicht verfügbar** (`nu-bald`): gestrichelte Marke mit Uhr, für Funktionen, die angelegt, aber noch nicht fertig sind (z. B. Meldung an die Ampel). Keine stillen Platzhalter.
