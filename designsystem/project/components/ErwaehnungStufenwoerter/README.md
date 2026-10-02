# Erwähnung und Stufenwörter

Im Freitext des Berichts erwähnt „@“ einen Gast; ein Absatz, der mit einem Stufenwort beginnt, legt eine Sanktion an, und zwar **für genau eine Person**.

**Erwähnen**
- „@“ öffnet die Vorschlagsliste (`nu-vorschlaege`) unter dem Cursor: Treffer mit Bettnummer-Marke, Gäste mit Bett zuerst, dann die Gästedatenbank. Pfeiltasten und Enter funktionieren mit Hardware-Tastatur.
- Eingefügt wird „@Ali (D4)“, sobald es den Vornamen mehrfach gibt, sonst „@Dimitri“. In der Datenbank speichert die Erwähnung die Gast-ID; die Bettnummer ist nur Anzeige.
- Tippt jemand „@Ali“ von Hand und es gibt mehrere: Warnpille „@Ali gibt es 4-mal: Bettnummer ergänzen“. Der Bericht lässt sich erst abschließen, wenn jede Erwähnung eindeutig ist.
- Erwähnung im Text: `nu-erwaehnung` (Grund `erwartet-flaeche`, Text `blau`, 600), wird als Ganzes gelöscht. Jeder erwähnte Gast bekommt den Absatz als Notiz mit Verweis auf den Bericht.

**Stufenwörter**
- Am Absatzanfang: „Verwarnung“, „Gelbe Karte“, „Hausverbot“ (auch „Rote Karte“). Sie werden fett, Karten mit ihrem Symbol.
- **Die Sanktion bekommt nur eine Person:** standardmäßig die zuerst genannte. Unter dem Feld zeigt die Zuordnung (`nu-zuordnung`, Grund `warnung-flaeche`) „Gelbe Karte für [Dimitri D5 ▾]“; ein Tipp öffnet „Wer bekommt die Gelbe Karte?“ mit allen Genannten und „Niemand (nur Notizen)“.
- **Alle anderen Genannten** stehen darunter als „Nur Notiz, keine Sanktion“: Sie bekommen den Absatz in ihre Notizen („erwähnt, keine Sanktion“), nie als Verwarnung, Karte oder Hausverbot.
- Nach dem Abschließen entsteht der Sanktionseintrag beim gewählten Gast; die Einblendung nennt die Zahl („1 Sanktion angelegt“).

**Schreibmodus:** Mit offener Bildschirmtastatur sitzt die `nu-tastenleiste` direkt über der Tastatur: „@ Gast“, die drei Stufenwörter, „Fertig“. Das aktive Feld rückt nach oben und bleibt ganz sichtbar. Eingaben werden bei jedem Zeichen lokal gespeichert.
