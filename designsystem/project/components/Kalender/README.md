# Kalender

Der Kalender sammelt alles mit Datum: Dienste (Betreuung 1, Betreuung 2, Küche) und Termine. Dienste und Termine lassen sich mit PIN ändern; jede Änderung wird mit Namen vermerkt und markiert.

- **Standard ist die 7-Tage-Ansicht** (`nu-woche`): sieben Spalten, jede mit den drei Diensten als Zeilen (`nu-dienstzeile`: Rolle klein, Name 600; Betreuung auf `erwartet-flaeche`, Küche auf `flaeche-2`, „offen“ in `tinte-3`) und allen Terminen ungekürzt, unten „+ Termin“. Heute: Zahl im Kreis `primaer`.
- **Geändert:** Weicht ein Dienst vom Originalplan ab oder wurde er geändert, steht die Zeile auf `warnung-flaeche` mit Strich 3 dp `warnung` links, „· geändert“ hinter der Rolle und dem ursprünglichen Namen durchgestrichen darunter. Antippen zeigt, wer wann warum geändert hat. In der Monatsansicht trägt der Dienst-Chip des Tages das Symbol `stift` auf `warnung-flaeche`. Geänderte Termine haben den Strich links.
- **Ändern** (Kopf rechts): fragt die Admin-PIN (`nu-pin` im Blatt), dann Banner „Ändern ist freigeschaltet …“ und gestrichelte Umrandung an allem, was sich ändern lässt (ab heute; Vergangenes nie). „Fertig“ beendet.
- **Dienst ändern** (Blatt): „Originalplan: Jule“, Chips „Wer macht den Dienst?“ (Team und „offen“), **„Wer ändert?“ ohne Vorauswahl – Pflicht**, Grund Tausch / Sonstiges, Notiz freiwillig. Ohne „Wer ändert?“ wackelt der Hinweis rot „Bitte zuerst auswählen, wer ändert.“ Speichern ändert den aktuellen Plan; der **Originalplan** (eingelesen zu Monatsbeginn) bleibt unverändert und zählt im Monatsabschluss als „geplant“.
- **Termin ändern** (Blatt): Titel, Datum (verschieben), Art, „Wer ändert?“ (Pflicht), „Löschen“ links in `gefahr`.
- **Bettwäsche** erscheint am Tag als wichtiger Hinweis im Bericht.
- **Dienstplan einlesen** liegt in den Einstellungen (siehe Dienstplan einlesen). Kein Import aus WhatsApp.
- Unter 900 dp stehen die sieben Tage untereinander.
