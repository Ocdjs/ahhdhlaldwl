# Dokument

Hausordnung und Datenschutzerklärung erscheinen als helles Blatt, damit sie wie Papier wirken und im PDF gleich aussehen.

- **Hausordnung zweispaltig** (`nu-dokument-paar`): links die deutsche Fassung mit der dunklen Marke „Deutsch · wird unterschrieben“, rechts direkt daneben die Übersetzung mit der umrandeten Marke „Übersetzung Arabisch · zum Verständnis“ (`nu-dokument--uebersetzung`, Grund `flaeche-2`). So ist klar, dass das deutsche Dokument unterschrieben wird. Bei Deutsch nur eine Spalte. Unter 900 dp Breite stehen beide untereinander, Deutsch zuerst.
- **Datenschutzerklärung nur auf Deutsch**, Marke „Nur auf Deutsch · unterschreibt nur der Gast“. Bei anderer Sprache eine Infozeile: „Bei Bedarf mündlich erklären.“
- Grund `papier` (auch nachts hell, leicht gedämpft), Text `auf-papier`, Schrift `dokument` (Noto Sans 17/28). Übersetzung Arabisch und Farsi: `dokument-rtl` (Noto Sans Arabic 19/32), `dir="rtl"`, rechtsbündig; die Marke bleibt deutsch und linksläufig.
- Eingesetzte Werte aus `{BETT}`, `{DATUM}`, `{GAST}`, `{BETREUER}` sind halbfett mit Unterstrich `papier-linie`. Zahlen und Bettnummern bleiben auch im rechtsläufigen Text lateinisch.
- Im PDF: Seite 1 Hausordnung deutsch mit beiden Unterschriften, Übersetzung als Anlage ohne Unterschrift; dann Datenschutz deutsch mit Unterschrift des Gastes (siehe Dokumente und PDF).
- Compose: zwei `Column` in einer `Row` mit `weight(1f)`; nur das Übersetzungsblatt in `CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl)`.
