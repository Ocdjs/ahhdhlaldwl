# Dateisystem und Abgleich mit Nextcloud

So legt die Android-App ihre Daten ab: lokal auf dem Tablet und gespiegelt in einem Nextcloud-Ordner. Diese Beschreibung ist die Vorlage für die App-Programmierung; das Designsystem (`designsystem/project/`) regelt Aussehen und Fachregeln, dieser Ordner regelt Dateien und Abgleich.

| Datei / Ordner | Inhalt |
| --- | --- |
| `Notuebernachtung/` | Vollständiges Beispiel des Nextcloud-Ordners mit den Beispieldaten des Prototyps (anonymisierte Namen) |
| `schema/` | JSON-Schemas (Draft 2020-12) für jede Dateiart |
| `android/NcPfade.kt` | Pfade, Dateinamen und Abgleichregeln als Kotlin – so übernehmen |
| `gen/` | Erzeugt Beispiel und Schemas neu: `node gen/zustand.js` (liest den Prototyp), `python3 gen/beispiel.py`, `python3 gen/schemas.py` |
| `pruefen.py` | Prüft einen Ordner gegen Schemas, Namensregeln und Querverweise: `python3 pruefen.py [Ordner]` (braucht `pip install jsonschema`) |

## Grundsätze

1. **Offline zuerst.** Jede Eingabe landet sofort in der verschlüsselten Datenbank auf dem Tablet und in der Warteschlange. Nextcloud ist Ablage und Austausch, nie Voraussetzung. Im Dienst geht nichts verloren, auch ohne Netz.
2. **Eine Datei je Sache, die sich unabhängig ändert.** Ein Diensttag, ein Gast, ein Bericht, ein Hinweis. Kleine Dateien, kleine Konflikte.
3. **Was abgeschlossen ist, wird nie überschrieben.** Abgeschlossene Berichte, Unterschriften, Sanktionen, Notizen, Kommentare, Originalplan, Dienstnachweise: einmal anlegen (`If-None-Match: *`), danach unveränderlich. Ergänzen heißt: neue Datei daneben.
4. **Gäste nur über ihre ID.** Belegung, Duschplan, Protokoll und Verweise nennen `gast_id`, keine Namen. Namen stehen nur in `Gaeste/<id>/Gast.json`, in Dokumenten und im Freitext der Berichte. So reicht zum Löschen eines Gastes sein Ordner.
5. **Lesbar für Menschen.** JSON mit Einrückung, CSV mit Semikolon und BOM (Excel), PDFs mit sprechenden Namen. Die Leitung findet sich in Nextcloud zurecht (`LIESMICH.md` im Ordner).
6. **Abgeleitetes wird neu erzeugt, nicht abgeglichen.** Lohnabrechnung, Auswertung und PDFs entstehen deterministisch aus den Quelldateien; bei Streit gewinnt die Neuerzeugung.

## Der Ordner in Nextcloud

```
Notuebernachtung/
├── LIESMICH.md                         Kurzanleitung für die Leitung
├── _app/                               Technik, nicht anfassen
│   ├── version.json                    Schema-Version, Mindest-App-Version
│   ├── Geraete/<geraet>.json           je Tablet: letzter Abgleich, offene Änderungen
│   └── Protokoll/JJJJ-MM/JJJJ-MM-TT_<geraet>.jsonl   Änderungsprotokoll, nur anhängen, Gäste nur als ID
├── Einstellungen/                      ändern nur in der App mit Admin-PIN
│   ├── Haus.json                       Standorte, Zimmer, Betten, Notbetten, Sperren, Nummerntausch, weitere Plätze
│   ├── Grundriss_St-Pius.json          Geometrie: Böden, Wände, Türen (mit Schließwinkel), Bad, Bettflächen
│   ├── Grundriss_St-Nikolaus.json
│   ├── App.json                        Ampel, Tageswechsel, Duschplan, „Fehlt etwas“, Hinweis-Dauern, Saison, Löschfristen
│   ├── Team.json                       Personen mit Bereich (Betreuung, Küche, beides), Leitung
│   └── Texte/Hausordnung/<sprache>.md, Texte/Datenschutz/de.md   mit Version im Kopf
├── Gaeste/<gast_id>/                   ein Ordner je Gast, Name nie im Ordnernamen
│   ├── Gast.json                       Stammdaten, Aufnahmen, Unterschriften-Stand, Läuseschein, Dokumentliste
│   ├── Dokumente/                      Aufnahme-PDF, Läuseschein, Hausordnung auf Papier (Foto), Weiteres
│   ├── Unterschriften/                 PNG je Unterschrift (für Neuerzeugung der PDFs)
│   └── Ereignisse/<zeit>_<von>_<art>.json   Sanktion oder Notiz, unveränderlich
├── Belegung/JJJJ-MM/JJJJ-MM-TT.json    Stand jedes Betts je Diensttag, Kennzahlen (KHT-Nummer, frei)
├── Duschplan/JJJJ-MM/JJJJ-MM-TT.json   Slots und Bad (abgeschlossen / frei)
├── Berichte/JJJJ-MM/
│   ├── Fehlt_erledigt.json             abgehakte Punkte aus „Fehlt etwas“
│   └── JJJJ-MM-TT/
│       ├── Bericht.json                offen: änderbar; abgeschlossen: unveränderlich
│       ├── JJJJ-MM-TT_Dienstbericht.pdf
│       ├── Unterschriften/<Rolle>_<Person>.png
│       ├── Nachtraege/<zeit>_<von>.json     Ergänzungen, auch „Unterschrift nachgeholt“
│       └── Kommentare/<zeit>_<von>.json     aus dem Archiv: Kommentar, Antwort, wichtiger Hinweis
├── Hinweise/
│   ├── JJJJ-MM/<zeit>_<von>.json       Hinweis für die nächsten Dienste (ab, bis, Dauer, wichtig, beendet)
│   └── Eingang/                        Leitung legt .txt ab → App übernimmt → Eingang/Uebernommen/
├── Kalender/
│   ├── Dienstplan/JJJJ-MM.json         aktueller Plan; abweichende Rollen als „geaendert“ markiert
│   ├── Aenderungen/JJJJ-MM/<zeit>_<von>.json   jede Änderung an Dienst oder Termin, mit Namen
│   ├── Termine/JJJJ-MM.json            Aufgabe, Bettwäsche, Sondertermin, Feiertag
│   └── Dienstplan-Eingang/             PDF, ICS oder Foto ablegen → Eingelesen/
├── Monatsabschluss/JJJJ-MM/
│   ├── Plan0.json                      Originalplan aus „Dienstplan einlesen“, unveränderlich
│   ├── Plankorrekturen/<zeit>_<von>_<Person>-<Bereich>.json
│   ├── Betreuung/JJJJ-MM_Dienstnachweis_Betreuung_<Person>.json/.pdf/.png
│   ├── Kueche/JJJJ-MM_Dienstnachweis_Kueche_<Person>.json/.pdf/.png
│   ├── Lohnabrechnung_JJJJ-MM_Betreuung.csv
│   └── Lohnabrechnung_JJJJ-MM_Kueche.csv
└── Auswertung/Belegung_JJJJ-MM.csv     je Nacht: KHT-Nummer, frei, gesamt, Notbetten belegt, Ampel, KHT angerufen
```

Monatsordner halten jeden Ordner klein (höchstens ~31 Einträge), damit `PROPFIND` schnell bleibt.

## Wer schreibt was

| Wer | schreibt | liest |
| --- | --- | --- |
| **Tablet-App** (je Gerät ein Nextcloud-Benutzer) | alles außer den Eingangs-Ordnern | alles |
| **Leitung** am PC (Nextcloud-Web oder -Client) | `Hinweise/Eingang/*.txt`, `Kalender/Dienstplan-Eingang/*` | Berichte, Monatsabschluss, Auswertung |
| **Leitung** in der App | Hinweise, Archiv-Kommentare, Einstellungen, Dienstplan einlesen, Kalender ändern (PIN) | alles |
| **Lohnbuchhaltung** | – | nur `Monatsabschluss/` (eigene Freigabe, nur lesen) |

## Dateiarten und Abgleichregeln

| Datei | Schema | änderbar | Konfliktregel |
| --- | --- | --- | --- |
| `Einstellungen/Haus.json` | haus | ja (Admin-PIN) | je Bett und je Zimmer: neuere Änderung gewinnt; Nummerntausch ändert nur `platz` |
| `Einstellungen/Grundriss_*.json` | grundriss | selten | ganze Datei, neuere gewinnt, Meldung an Leitung |
| `Einstellungen/App.json`, `Team.json` | einstellungen, team | ja (Admin-PIN) | je Feld drei-Wege |
| `Gaeste/<id>/Gast.json` | gast | ja | je Feld drei-Wege; `dokumente`, `aufnahmen`, `aufnahme_hinweise_aus` als Vereinigung |
| `Gaeste/<id>/Ereignisse/*.json` | ereignis | nein | eindeutiger Name, nie Konflikt |
| `Belegung/…/TT.json` | belegung | ja, bis zum nächsten Tageswechsel | **je Bett**: neueres `geaendert_um` gewinnt; Kennzahlen danach neu berechnen |
| `Duschplan/…/TT.json` | duschplan | ja | je Slot und für `bad`: neueres `geaendert_um` gewinnt |
| `Berichte/…/Bericht.json` (offen) | bericht | bis zum Abschluss | je Feld drei-Wege; Freitext, der auf beiden Seiten geändert wurde: beide Fassungen untereinander, Glocke |
| `Berichte/…/Bericht.json` (abgeschlossen) | bericht | **nein** | – ergänzen nur über `Nachtraege/` |
| `Berichte/…/Nachtraege/*.json`, `Kommentare/*.json` | nachtrag, kommentar | nein | eindeutiger Name |
| `Berichte/JJJJ-MM/Fehlt_erledigt.json` | fehlt_erledigt | ja | Vereinigung je Schlüssel |
| `Hinweise/…/*.json` | hinweis | nur `beendet_*` | „beendet“ gewinnt |
| `Kalender/Dienstplan/JJJJ-MM.json` | dienstplan | ja (PIN) | je Tag und Rolle; jede Änderung zusätzlich als Datei unter `Aenderungen/` |
| `Kalender/Aenderungen/…/*.json` | planaenderung | nein | eindeutiger Name |
| `Kalender/Termine/JJJJ-MM.json` | termine | ja | je Termin-`id`; Löschen gewinnt gegen Ändern |
| `Monatsabschluss/…/Plan0.json` | plan0 | nein | `If-None-Match: *` – wer zuerst speichert, gilt; der zweite bekommt „bereits eingelesen“ |
| `Monatsabschluss/…/Plankorrekturen/*.json` | plankorrektur | nein | eindeutiger Name; nach der Unterschrift der Person abgelehnt |
| `Monatsabschluss/…/<Bereich>/*_Dienstnachweis_*` | dienstnachweis | nein | `If-None-Match: *` – **verhindert doppeltes Unterschreiben** über mehrere Geräte |
| `Lohnabrechnung_*.csv`, `Auswertung/*.csv`, alle PDFs | – | abgeleitet | aus den Quelldateien neu erzeugen, dann hochladen |
| `_app/Protokoll/*.jsonl`, `_app/Geraete/*.json` | protokoll, geraet | nur eigenes Gerät | jedes Gerät schreibt nur seine Datei, kein Konflikt |

**Drei-Wege-Abgleich:** Die App bewahrt für jede änderbare Datei den zuletzt abgeglichenen Stand auf (Basis). Bei `412 Precondition Failed` lädt sie die Serverfassung, vergleicht Feld für Feld mit Basis und eigener Fassung: was nur eine Seite geändert hat, wird übernommen; was beide geändert haben, entscheidet die Regel der Tabelle. Danach erneut hochladen mit dem neuen ETag. Jeder aufgelöste Konflikt geht ins Protokoll; echte Textkonflikte erscheinen an der Glocke.

## Abgleich über WebDAV

- Adresse: `https://<server>/remote.php/dav/files/<benutzer>/Notuebernachtung/`. Anmeldung mit **App-Passwort** je Tablet (im Android-Keystore), nie mit dem Passwort eines Menschen. Verliert man ein Tablet, sperrt man dessen App-Passwort.
- **Hochladen** (WorkManager, Bedingung „Netz“): die Warteschlange der Reihe nach je Pfad.
  - änderbare Datei: `PUT` mit `If-Match: <ETag der Basis>`; neue Datei mit `If-None-Match: *`.
  - unveränderliche Datei: immer `If-None-Match: *`. Antwortet der Server 412 und der Inhalt ist gleich (SHA-256), gilt sie als erledigt.
  - Ordner fehlen → `MKCOL` von oben nach unten, dann erneut.
- **Herunterladen:** Zuerst `PROPFIND Depth: 0` auf den Wurzelordner. Ändert sich dessen ETag nicht, ist nichts zu tun (Nextcloud reicht ETags nach oben durch). Sonst `PROPFIND Depth: 1` nur auf die Ordner, deren ETag sich geändert hat; geänderte Dateien per `GET` holen und in die Datenbank übernehmen.
- **Wann:** beim Start, alle 60 Sekunden im Vordergrund, sofort nach „Bericht abschließen“, „Aufnahme fertig“, „Dienstnachweis unterschreiben“ und „Dienstplan einlesen“; sonst stündlich im Hintergrund.
- **Anzeige** (Baustein Abgleich): „Synchronisiert 14:23“, „3 Änderungen warten“, „Offline – alles ist gespeichert“.
- **Tageswechsel 12:00:** Jedes Gerät berechnet aus dem Vortag den neuen Diensttag (Regeln in Fachregeln §2) und legt `Belegung/…/TT.json` mit `If-None-Match: *` an. Wer zu spät kommt, übernimmt die Serverfassung und gleicht je Bett ab.
- **Eingänge:** Neue Dateien in `Hinweise/Eingang/` übernimmt die App als Hinweis „von Leitung“ (Quelle `nextcloud_eingang`) und verschiebt sie per `MOVE` nach `Uebernommen/`. Neue Dateien in `Kalender/Dienstplan-Eingang/` erscheinen in Einstellungen › Dienstplan einlesen; nach dem Speichern wandern sie nach `Eingelesen/`.

## Namensregeln

- Nur ASCII-Buchstaben, Ziffern, `.`, `_`, `-`. Umlaute ersetzen (ä→ae, ö→oe, ü→ue, ß→ss), Leerzeichen → `_`. Keine Doppelpunkte (Windows-Clients).
- Zeitpunkt im Namen: `JJJJ-MM-TTThh-mm-ss` (Ortszeit), dahinter `_<Person>`: zeitlich sortiert und über Geräte eindeutig.
- Zeitpunkte im Inhalt: ISO 8601 mit Zeitzone (`2026-10-02T21:14:05+02:00`). Daten: `JJJJ-MM-TT`. Der **Diensttag** ist der Abend, an dem der Dienst beginnt; Wechsel um 12:00.
- Gast-IDs: `g-` und 8 Zeichen (Base32, zufällig, z. B. `g-4jz67swy`). Aufnahmenummern (`2026-27-0042`) bleiben fachliche Nummern im Inhalt.
- PDF-Namen wie in Designsystem › Dokumente: `0042_Max_Mustermann_2026-11-14.pdf`, `2026-11-14_Dienstbericht.pdf`, `2026-09_Dienstnachweis_Betreuung_Robin.pdf`.

## Was wo landet (die Anforderungen)

| Anforderung | Datei |
| --- | --- |
| St. Pius als Grundriss, Stockbetten oben/unten, Türen, Bad | `Einstellungen/Grundriss_St-Pius.json`, `Haus.json` |
| St. Nikolaus mit zusätzlichen, frei benannten Betten rechts neben dem Saal; weitere Plätze Z1 … | `Haus.json` (Zimmer `NX` / `X`, `bezeichnung`), `Grundriss_St-Nikolaus.json` (`rechts_daneben`) |
| Zimmer und einzelne Betten sperren; Tür schließt animiert | `Haus.json` (`gesperrt`), `Grundriss_*.json` (`tueren[].winkel_zu`); in der Belegung `status: gesperrt` |
| Bettnummern innerhalb eines Zimmers tauschen | `Haus.json` (`betten[].platz`) |
| Notbetten zählen nur, wenn belegt; Belegung nur über den Kältebus | `Haus.json` (`notbett`), `Belegung` (`belegt_durch: kaeltebus`, `kennzahlen`) |
| KHT-Nummer = belegte Betten; Ampel zeigt freie Betten | `Belegung/…` (`kennzahlen`), `Auswertung/Belegung_JJJJ-MM.csv`, Bericht (`kennzahlen`, `kht_angerufen`) |
| fehlt 1. Nacht zählt belegt, ab 2. Nacht frei | `Belegung/…` (`status`, `fehlt_naechte`, `fehlte_vornacht`) |
| Keine Zukunft in der Hauptansicht | Belegungsdateien gibt es nur bis heute; nach vorn nur Kalender und Duschplan |
| Gleiche Vornamen mit Bettnummer | nichts gespeichert – Anzeigename wird immer berechnet |
| Mehrere Nächte ohne Enddatum, Enddatum per Schalter | `Gast.json` (`aufnahmen[].dauer`, `ende`), `Belegung` (`dauerhaft`, `ende`) |
| Hausordnung deutsch unterschrieben, Übersetzung daneben; Datenschutz nur deutsch, nur Gast | `Einstellungen/Texte/…` (Version im Kopf), `Gaeste/<id>/Unterschriften/`, Aufnahme-PDF, `Gast.json` (`hausordnung`, `datenschutz`) |
| Gästedatenbank mit Dokumenten, Unterschrift nachholen | `Gaeste/<id>/Dokumente/`, `Gast.json` (`dokumente`) |
| Sanktion nur für eine Person; Erwähnte nur als Notiz | `Gaeste/<id>/Ereignisse/*_sanktion.json` (genau ein `gast_id`), `*_notiz.json` mit `rolle: erwaehnt`, Bericht `zuordnung` |
| Bericht: Feldreihenfolge, „Hat KHT angerufen?“, „Fehlt etwas“ mit Freitext | `Bericht.json` (`felder` in Berichtsreihenfolge) |
| Abschluss ohne Unterschrift (gerade Küche), im PDF markiert, Unterschrift nachholen | `Bericht.json` (`ohne_unterschrift`), PDF-Stempel, `Nachtraege/*` (`unterschrift_nachgeholt`) |
| Nach dem Abschluss nur noch ergänzen | `Bericht.json` unveränderlich, Ergänzungen in `Nachtraege/` |
| Hinweise für die nächsten Dienste mit Anzeigedauer, Verfasser wählbar (auch Leitung) | `Hinweise/JJJJ-MM/*.json` (`von`, `ab`, `bis`, `dauer`), Leitung auch vom PC über `Hinweise/Eingang/` |
| Archiv: kommentieren, Fragen beantworten, wichtige Hinweise; mit Gastbezug in Notizen und bei Wiederaufnahme | `Berichte/…/Kommentare/*.json` → `Hinweise/…` (`quelle: archiv`, `bezug`) und `Gaeste/<id>/Ereignisse/*_notiz.json` (`bei_aufnahme`) |
| „Fehlt etwas“ im Archiv herausstellen und abhaken | Bericht `felder.fehlt_etwas*`, `Berichte/JJJJ-MM/Fehlt_erledigt.json` |
| Bettwäschewechsel als wichtiger Hinweis | `Kalender/Termine/…` (`art: Bettwäsche`) – die App zeigt ihn am Tag als wichtigen Hinweis |
| Duschplan bis 3 Tage voraus; Bad zu, bis alle geduscht haben, Erinnerung | `Duschplan/…` (`slots`, `bad`), `App.json` (`duschplan`) |
| Kalender 7 Tage, Termine ändern | `Kalender/Termine/…` (`geaendert`), `Kalender/Aenderungen/…` |
| Dienstplan im Kalender ändern mit PIN, „wer hat geändert“, markiert; Originalplan getrennt | `Kalender/Dienstplan/…` (`geaendert`), `Kalender/Aenderungen/…` (`von`), `Monatsabschluss/…/Plan0.json` bleibt |
| Dienstplan zu Monatsbeginn einlesen (Leitung), jeden Dienst einzeln prüfen | `Kalender/Dienstplan-Eingang/`, Ergebnis `Monatsabschluss/…/Plan0.json` (`eingelesen_von`, `korrekturen`) |
| Kein WhatsApp-Import | Quellen nur `Dienstplan-Eingang/` (PDF, ICS, Foto) |
| Monatsabschluss je Person, Betreuung und Küche getrennt, kein „krank“, keine PIN, nach Unterschrift gesperrt | `Monatsabschluss/…/<Bereich>/*_Dienstnachweis_*` (unveränderlich), zwei `Lohnabrechnung_*.csv` |
| Geplante Dienste korrigierbar mit Warnung | `Monatsabschluss/…/Plankorrekturen/*.json` (`warnung_bestaetigt`) |
| Teilen ohne festen Empfänger | nichts in Nextcloud – Android-Teilen-Dialog aus `files/teilen/` (siehe unten) |
| Löschfristen und Löschlauf | `App.json` (`loeschfristen`), Gast-Ordner löschen, Protokoll ohne Namen |

## Lokal auf dem Tablet

```
/data/data/<paket>/                      nur die App kommt heran (Android-Sandbox)
├── databases/notuebernachtung.db        Room + SQLCipher – die Wahrheit auf dem Gerät
├── files/
│   ├── nextcloud/Notuebernachtung/…     Spiegel des Nextcloud-Ordners, gleiche Pfade; Stand = Basis für den Drei-Wege-Abgleich
│   │                                    Gästedokumente und Unterschriften verschlüsselt (Jetpack Security EncryptedFile)
│   ├── ausgang/<laufnr>.json            Warteschlange: Pfad, Art (neu/ändern/löschen/verschieben), ETag der Basis, SHA-256
│   ├── entwurf/                         laufender Assistent, Unterschriften in Arbeit, offener Bericht (übersteht Absturz und Akku leer)
│   └── teilen/                          kurzlebige, entschlüsselte Kopie für den Teilen-Dialog (FileProvider), beim Start geleert
├── cache/pdf/                           Vorschaubilder
└── shared_prefs/                        nur Gerätesachen; Geheimnisse in EncryptedSharedPreferences
```

**Nicht in Nextcloud** (nur auf dem Gerät): Admin-PIN und App-PIN (eine vierstellige PIN wäre als Hash in Nextcloud in Sekunden erraten), Nextcloud-App-Passwort, Nachtmodus, Kiosk, Geräte-ID, Entwürfe.

`res/xml/file_paths.xml` gibt nur `files/teilen/` für den FileProvider frei.

## Nextcloud einrichten

1. **Gruppenordner** „Notuebernachtung“ (App *Team folders* / *Group folders*) für die Gruppe „Notübernachtung“: Leitung und die Tablet-Benutzer mit Schreibrecht. Erweiterte Rechte: Lohnbuchhaltung nur lesend auf `Monatsabschluss/`.
2. Je Tablet ein eigener Benutzer (`nu-tablet-st-pius`), Anmeldung in der App per Login-Flow v2, App-Passwort.
3. **Versionen** an lassen (Nextcloud hebt alte Fassungen von PDFs und JSON auf). **Papierkorb und Versionen** so einstellen, dass Gelöschtes nach dem Löschlauf wirklich verschwindet (`trashbin_retention_obligation`, `versions_retention_obligation`, z. B. `auto, 30`).
4. Serverseitige Verschlüsselung nach Vorgabe des Trägers; Zugriff von außen nur über HTTPS.
5. Löschfristen in `App.json` sind **Vorschläge** (`vorschlag_vom_traeger_festzulegen: true`) und vom Träger und der oder dem Datenschutzbeauftragten festzulegen. Der Monatsabschluss wird nie automatisch gelöscht (Lohnunterlagen).

## Löschlauf

In Einstellungen › Saison und Löschfristen, mit Admin-PIN und Vorschau („Folgendes wird gelöscht“ mit Anzahlen):

1. Gäste mit `loeschen_ab` ≤ heute und ohne laufendes Hausverbot: ganzen Ordner `Gaeste/<id>/` löschen (`DELETE`).
2. Berichte, Belegung, Duschplan, Hinweise, Protokoll älter als ihre Frist: Monatsordner löschen.
3. Ins Protokoll nur Anzahlen: `{"art": "loeschlauf.ausgefuehrt", "anzahl": 12}`. Keine Namen, keine IDs gelöschter Gäste.
