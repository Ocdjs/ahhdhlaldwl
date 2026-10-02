# Dateisystem

Die App arbeitet **offline zuerst**: Jede Eingabe landet sofort in der verschlüsselten Datenbank auf dem Tablet und wird dann mit einem Nextcloud-Ordner abgeglichen. Vollständige Beschreibung, Beispielordner, JSON-Schemas, Kotlin-Pfade und Prüfskript liegen im Repository unter `dateisystem/`.

## Der Ordner in Nextcloud

```
Notuebernachtung/
├── LIESMICH.md              Kurzanleitung für die Leitung
├── _app/                    Technik: Version, Geräte, Änderungsprotokoll (Gäste nur als ID)
├── Einstellungen/           Haus.json, Grundriss_*.json, App.json, Team.json, Texte/ (Hausordnung je Sprache, Datenschutz)
├── Gaeste/<gast_id>/        Gast.json, Dokumente/, Unterschriften/, Ereignisse/ (Sanktion, Notiz)
├── Belegung/JJJJ-MM/        je Diensttag: Stand jedes Betts, KHT-Nummer, frei
├── Duschplan/JJJJ-MM/       je Tag: Slots und Bad (zu / frei)
├── Berichte/JJJJ-MM/TT/     Bericht.json, PDF, Unterschriften/, Nachtraege/ (Ergänzungen), Kommentare/ (Archiv)
├── Hinweise/                je Hinweis eine Datei; Eingang/ für Hinweise der Leitung vom PC
├── Kalender/                Dienstplan/ (aktuell), Aenderungen/ (wer hat geändert), Termine/, Dienstplan-Eingang/
├── Monatsabschluss/JJJJ-MM/ Plan0.json (Originalplan), Plankorrekturen/, Betreuung/, Kueche/, Lohnabrechnung_*_Betreuung.csv, …_Kueche.csv
└── Auswertung/              Belegung je Nacht als CSV
```

## Regeln, die die Oberfläche betreffen

| Regel | Folge in der App |
| --- | --- |
| Abgeschlossenes wird nie überschrieben (Bericht, Unterschrift, Sanktion, Notiz, Kommentar, Originalplan, Dienstnachweis, Kalender-Änderung) | „nicht mehr änderbar, nur ergänzen“; Unterschreiben eines Nachweises gelingt nur einmal, auch über zwei Tablets |
| Änderbare Dateien werden je Feld bzw. je Bett abgeglichen | Zwei Tablets können gleichzeitig im Bettenplan arbeiten; echte Textkonflikte erscheinen an der Glocke |
| Eingänge für die Leitung | Hinweise und Dienstpläne lassen sich am PC in Nextcloud ablegen; die App übernimmt sie beim nächsten Abgleich |
| Gäste nur über ihre ID | Löschlauf löscht den Gast-Ordner; Protokoll und Belegung enthalten keine Namen |
| PINs liegen nie in Nextcloud | Admin-PIN und App-PIN gelten je Gerät |

## Abgleich

Über WebDAV mit App-Passwort je Tablet. Hochladen mit `If-Match` (änderbar) bzw. `If-None-Match: *` (einmalig); Herunterladen nur, wenn sich das ETag des Ordners geändert hat. Beim Start, alle 60 Sekunden im Vordergrund und sofort nach „Bericht abschließen“, „Aufnahme fertig“, „Dienstnachweis unterschreiben“ und „Dienstplan einlesen“. Anzeige im Baustein **Abgleich**: „Synchronisiert 14:23“, „3 Änderungen warten“, „Offline – alles ist gespeichert“.

## Auf dem Tablet

`databases/notuebernachtung.db` (Room + SQLCipher), `files/nextcloud/` (Spiegel, Basis für den Abgleich), `files/ausgang/` (Warteschlange), `files/entwurf/` (laufender Assistent, Unterschriften, offener Bericht), `files/teilen/` (kurzlebige Kopien für den Teilen-Dialog, einziger Pfad im FileProvider).
