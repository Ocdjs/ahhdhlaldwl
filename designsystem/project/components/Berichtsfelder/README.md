# Berichtsfelder

Jedes Feld des Dienstberichts hat eine Zeile mit Beschriftung links und Eingabe rechts – **in dieser Reihenfolge**:

1. Besetzung (Betreuung und Küche, siehe Besetzung)
2. **Hat KHT angerufen?** – Ja/Nein, daneben die Pille „KHT-Nummer 25“
3. **Wichtige Hinweise** – Freitext mit @-Erwähnung und Stufenwörtern
4. **Fragen von Gästen**
5. **Abwesenheiten** – automatisch aus dem Bettenplan (freigehalten, frei bis Rückkehr, fehlt unentschuldigt)
6. **Externe Gäste**
7. **Vorfälle** – Ja/Nein; Einzelheiten unter „Wichtige Hinweise“
8. **Schlüssel fehlt** – Ja/Nein mit Nummer
9. **Fehlt etwas** – Chips und Freitext „Was genau?“
10. **Sonstiges**

- Zeile `nu-bericht-zeile`: Beschriftung 220 dp (`text-stark`), Eingabe daneben, zwischen Feldern `abstand-6`, keine Linien.
- **Pflicht** sind „Hat KHT angerufen?“ und „Vorfälle“ (Pille „Pflichtfeld“ in `warnung` beim Abschließen) sowie eindeutige Erwähnungen. **Unterschriften sind keine Pflicht:** der Text neben dem Knopf sagt „Unterschrift Jule fehlt (geht auch ohne)“, beim Abschließen fragt die App nach (siehe Bericht abgeschlossen).
- Ein Bericht mit „Vorfälle: Ja“ bekommt den Rahmen 3 dp `vorfall`.
- Die PDF-Tabelle „Feld | Eintrag“ folgt derselben Reihenfolge.
