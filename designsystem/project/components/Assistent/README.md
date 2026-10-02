# Assistent

Die Aufnahme eines neuen Gastes führt in sechs Schritten durch Person, Dauer, Sprache, Hausordnung, Datenschutz und Abschluss.

- Vollbild über dem Plan, Abdunklung dahinter. Links die **Schrittliste** (260 dp, `flaeche-2`): Nummer im Kreis, aktueller Schritt mit `primaer`-Kreis auf `flaeche`, erledigte mit ✓. Erledigte Schritte sind antippbar.
- Rechts der Schritt mit Titel `titel`; unten fest „Zurück“ (links), Zwischenstand-Hinweis, „Weiter“ (Hauptknopf, rechts). „Weiter“ ist gesperrt, bis der Schritt vollständig ist; der Grund steht daneben.
- **Person:** Suche mit Bettnummer je Treffer; bei gleichem Vornamen Hinweis „Es gibt schon 3 Personen mit dem Vornamen Ali: Ali (D4), Ali (L5), Ali (Haddad)“ (siehe Gästesuche).
- **Dauer:** „1 Nacht“ oder „Mehrere Nächte“; mehrere Nächte gelten ohne Enddatum, ein Schalter „Enddatum festlegen“ öffnet Datum und Schnellwahl (+3, +7, +14 Nächte). Siehe Auswahlkacheln.
- **Sprache** wählt die Übersetzung der Hausordnung.
- **Hausordnung:** deutsche Fassung links (wird unterschrieben), Übersetzung rechts daneben (zum Verständnis). Unterschriften: **Gast und Betreuung**.
- **Datenschutz:** nur auf Deutsch, Unterschrift **nur vom Gast**.
- **Abschluss:** Zusammenfassung mit Dauer, Anzeigename („Ali (B2)“, wenn der Vorname schon vorkommt), Übersetzung, Aufnahmenummer und PDF-Name.
- **Nachholen:** Aus Gastdetails oder Gästedatenbank startet derselbe Assistent verkürzt (Sprache, Hausordnung, Datenschutz, Abschluss) und legt das PDF in der Gästedatenbank ab.
- Jeder Zwischenstand wird sofort lokal gespeichert. „Abbrechen“ fragt nach. Übergang zwischen Schritten 32 dp in `dauer-mittel`; bei Arabisch und Farsi spiegelt sich nur das Übersetzungsblatt, nicht die App.
