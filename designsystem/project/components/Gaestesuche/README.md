# Gästesuche

Die Suche findet Gäste über Vorname, Nachname, Spitzname und Bettnummer, tolerant bei Tippfehlern, und warnt vor Hausverboten.

- Suchfeld mit Symbol `suche`, Treffer ab dem ersten Buchstaben, Ergebnis in unter einer Sekunde bei 2.000 Gästen.
- Trefferzeile (`nu-treffer`, 64 dp): links die **Bettnummer** als Marke (`nu-treffer-bett`, 52 × 40 dp, `nummer`), „–“ ohne Bett; daneben Name, Spitzname, Bett mit Status, Sprache.
- **Gleiche Vornamen unterscheidet die Bettnummer.** Anzeigename überall (Plan, Bericht, Erwähnung, Duschplan, Einblendungen): „Max (D4)“. Ohne Bett: Nachname, dann Spitzname, dann Aufnahmenummer („Max (Mustermann)“).
- Wer beim Anlegen einen vorhandenen Vornamen eintippt, sieht sofort die Zeile „Es gibt schon … Personen mit dem Vornamen …“ mit allen Treffern.
- **Aktives Hausverbot steht immer oben**, mit `karte-rot`, Grund `vorfall-flaeche`, Rahmen `vorfall`. Aufnehmen nur mit Bestätigung und Begründung.
- Bekannte Personen werden nie doppelt angelegt; bei sehr ähnlichem Namen fragt die App „Meinst du …?“.
- Die gleiche Suche öffnet sich bei „@“ im Bericht, bei „Externe Gäste“ und in der Gästedatenbank.
