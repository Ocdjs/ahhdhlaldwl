# Dienstplan einlesen

Einmal zu Monatsbeginn liest die Leitung den Dienstplan ein und prüft **jeden Dienst einzeln** am Foto oder an der Datei. Das Ergebnis ist der **Originalplan**: die geplanten Dienste für den Monatsabschluss.

- **Ort:** Einstellungen › Dienstplan einlesen (hinter der Admin-PIN). Nicht mehr im Kalender.
- **Monatszeilen** (`nu-einstellung`): laufender und nächster Monat. Eingelesen: „Eingelesen am 01.10. 09:30 von Leitung · 93 Dienste, 2 korrigiert. Originalplan steht fest.“ mit Pille „fest“. Offen: „Foto“ (Kamera) und „Datei aus Nextcloud“ (PDF, ICS aus `Kalender/Dienstplan-Eingang/`).
- **Prüfmaske** (`nu-scan`), ein Tag nach dem anderen: Kopf „November 2026 prüfen · Tag 5 von 30 · Abbrechen“, Fortschrittsbalken. Links der **Ausschnitt aus dem Foto** (`nu-scan-blatt` auf `papier`, leicht gedreht, Handschrift in `stift-tinte`) mit zwei Tagen davor und danach, der aktuelle Tag gelb hinterlegt und `warnung` umrandet. Rechts der Tag groß und je Rolle (Betreuung 1, Betreuung 2, Küche) eine Prüfzeile mit Team-Chips und „offen“; die Erkennung ist vorgewählt.
- **Unsicher erkannt** (`is-unsicher`): Zeile auf `warnung-flaeche` mit Rand `warnung` und Pille „unsicher erkannt: Sam“. Erst wenn jede unsichere Zeile angetippt wurde (auch wenn der Vorschlag stimmt), wird „Tag stimmt, weiter“ aktiv; vorher heißt der Knopf „Erst Unsicheres prüfen“.
- **Abschluss:** Kennzahlen Tage, Dienste, Korrigiert; „Eingelesen von“ (Leitung vorgewählt); Hinweis „Danach steht der Originalplan fest“; Knopf „Als Originalplan speichern“. Gespeichert werden Originalplan und aktueller Plan; spätere Änderungen nur im Kalender (PIN, mit Namen vermerkt) oder als Plankorrektur im Monatsabschluss.
- Ein Monat wird nur einmal eingelesen; die Abweichungen von der Erkennung werden mitgespeichert.
