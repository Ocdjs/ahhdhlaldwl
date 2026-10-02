# Bericht abgeschlossen

Abschließen geht auch ohne Unterschrift – gerade beim Küchendienst, der früher geht. Danach ist der Bericht nicht mehr änderbar, nur noch ergänzbar.

- **Abschließen** prüft „Hat KHT angerufen?“, „Vorfälle“ und eindeutige Erwähnungen; fehlt davon etwas, springt die Ansicht hin. Fehlen **nur Unterschriften**, kommt der Dialog **„Wirklich ohne Unterschrift abschließen?“** mit Namen und Rolle („Jule (Küche)“), bei der Küche mit dem Satz „Der Küchendienst geht oft früher, das ist in Ordnung.“ Knöpfe „Zurück“ und `nu-btn--gefahr-voll` „Ja, trotzdem abschließen“.
- **Danach:** Leiste `nu-gesperrt` mit Pille „ohne Unterschrift: Jule“ (`warnung`), Zeit, Personen, Abgleichstand und „nicht mehr änderbar, nur ergänzen“; Knöpfe „PDF ansehen“ und „Teilen“ (Android-Teilen-Dialog, kein fester Empfänger). Eine Einblendung „Bericht abgeschlossen · ohne Unterschrift von Jule“ in `warnung`.
- **Im PDF:** roter Stempel „Ohne Unterschrift abgeschlossen: Jule“ oben, im Unterschriftenfeld „OHNE UNTERSCHRIFT“. Nach dem Nachholen „· nachgeholt“ am Stempel und die Unterschrift mit Zeitpunkt.
- **Unterschrift nachholen:** In der Besetzung bleibt der Knopf „Unterschrift nachholen“. Die Unterschrift kommt mit Zeitpunkt dazu und als Ergänzung „Unterschrift von Jule nachgeholt.“; erst dann zählt der Dienst im Monatsabschluss.
- **Nur ergänzen:** Alle Felder sind gesperrt. „Ergänzen“ öffnet ein Blatt („Der abgeschlossene Bericht lässt sich nicht mehr ändern. Die Ergänzung steht mit Zeit und Namen darunter und kommt ins PDF.“). Ergänzungen (`nu-nachtrag`, Titel „Ergänzung“) stehen mit Datum, Uhrzeit und Name darunter.
- Ein Bericht mit Vorfall behält den roten Rahmen, auch im Archiv.
