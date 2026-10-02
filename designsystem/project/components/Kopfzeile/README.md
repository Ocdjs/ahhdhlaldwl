# Kopfzeile

Die Kopfzeile zeigt in jedem Bereich, welcher Diensttag gilt, ob Daten abgeglichen sind, was erinnert werden muss und wer Dienst hat.

- Höhe `kopf-hoehe` (72 dp), Grund `grund`, keine Linie darunter.
- **Datumswahl** links: Pfeil zurück, Datum, Pfeil vor (je 48 dp). Standard ist der laufende Diensttag (Tageswechsel 12:00).
- **Nie in die Zukunft:** Der Pfeil nach rechts endet beim heutigen Diensttag und ist dort gesperrt. Was kommt, steht im Kalender (Dienste, Termine, 7-Tage-Ansicht) und im Duschplan (eigene Tagesauswahl bis 3 Tage voraus). Wie lange ein Bett frei ist, zeigt die Bettkarte („bis 08.10.“).
- **Vergangene Tage** zeigen die Belegung jener Nacht, daneben die Pille „Nur lesen“ (`nu-nurlesen`, Symbol `schloss`); niemand ist dort „erwartet“. Änderungen nur als Nachtrag.
- **Abgleich** (`nu-sync`): siehe Baustein Abgleich.
- **Glocke**: Zähler (`nu-zaehler`, Grund `warnung`) für offene Erinnerungen: Läuseschein, Gast fehlt die 2. Nacht, neue Hinweise, Duschslots. Tipp öffnet die Liste.
- **Dienstpersonen** rechts als Chips mit Kürzel. Bei zwei Personen ist genau eine „aktiv“ (Rahmen `tinte`, Kürzel in `primaer`): sie wird bei Notizen, Unterschriften und Änderungen eingetragen. Ein Tipp wechselt.
