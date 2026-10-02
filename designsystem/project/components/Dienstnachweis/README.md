# Dienstnachweis

Der Nachweis einer Person für einen Monat: geplante gegen gemachte Dienste, Abweichungen mit Grund, eine Unterschrift. Danach ist er gesperrt.

- **Geplant** = Originalplan, wie er vor Monatsanfang feststand (Dienstplan-Import). **Gemacht** = jeder Dienst, bei dem die Person in der Besetzung des Dienstberichts unterschrieben hat, bis zum Moment der Unterschrift unter den Nachweis.
- Kopf mit Kennzahlen Geplant, Gemacht, Krank, Abgegeben, Vertretung; darunter je Tag eine Zeile: Datum, Geplant ✓, Gemacht ✓ mit Rolle, Bemerkung („krank · vertreten durch Chris“, „Vertretung für Robin · Krankheit“, „ohne Unterschrift im Bericht“). Abweichungen auf `warnung-flaeche`.
- **Geplante Dienste korrigieren:** nur vor der Unterschrift; öffnet ein Blatt mit Warnbanner („Der Originalplan ist Grundlage der Lohnabrechnung …“), allen Tagen des Monats als Chips und Pflichtfeld „Grund“; der rote Knopf „Korrektur speichern“ (`nu-btn--gefahr-voll`). Jede Korrektur steht danach als Warnzeile im Nachweis (Tage, Grund, wer, wann).
- **Unterschrift** mit dem Unterschriftsfeld („Die Angaben stimmen“). Danach: Leiste `nu-gesperrt` „Unterschrieben 02.10. 14:00 · PDF · in der Lohntabelle · nicht mehr änderbar“, keine Knöpfe mehr. Das PDF `2026-09_Dienstnachweis_Robin.pdf` wird abgelegt, die Zahlen gehen in die Lohntabelle.
- Wer unterschreibt, ist die Person selbst; die App fragt nicht nach PIN, zeigt aber den Namen groß im Feld.
