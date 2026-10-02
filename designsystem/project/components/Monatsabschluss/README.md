# Monatsabschluss

Am Monatsende unterschreibt jede Person aus dem Team einmal ihren Dienstnachweis; daraus entsteht die Tabelle für die Lohnabrechnung.

- **Ort:** Reiter „Monatsabschluss“ in Dienst & Bericht, mit Umschalter Vormonat / laufender Monat (`nu-seg`).
- **Übersicht** (`nu-tabelle`): je Person Geplant, Gemacht, Abweichung („1 krank“, „1 abgegeben“, „1 Vertretung“), Status als Pille („unterschrieben 01.10. 07:10“ in `frei`, „offen“ in `warnung`) und „Öffnen“ bzw. „Ansehen“. Darüber „2 von 4 unterschrieben“.
- **Für die Lohnabrechnung:** nur unterschriebene Nachweise, Spalten Geplant, Gemacht, Krank, Abgegeben, Vertretung, Unterschrieben, PDF. Die Tabelle liegt mit den PDFs in Nextcloud (Lohnabrechnung_2026-09); Zahlen rechtsbündig in `nummer`.
- **Hinweis beim letzten geplanten Dienst:** Ist heute der letzte geplante Dienst einer Person im Monat und hat sie noch nicht unterschrieben, steht oben im Bericht ein Banner (Grund `erwartet-flaeche`) mit „Später“ und „Ansehen“. Freiwillig, nie blockierend.
- Tabelle ohne Linienraster: Kopf auf `flaeche-2`, Zeilen mit feiner Trennlinie `linie`, Abweichungen im Nachweis mit Grund `warnung-flaeche`.
