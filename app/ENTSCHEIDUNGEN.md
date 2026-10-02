# Vor dem Bau: Festlegungen, offene Punkte, Änderungen

Stand 02.10.2026, nach dem Bau von Version 1 ergänzt (Abschnitt E). Grundlage: Designsystem (`designsystem/project/`), Prototyp (`prototyp/`), Dateisystem (`dateisystem/`).

## A Was ich für Version 1 festgelegt habe

| # | Festlegung | Warum | Später änderbar |
| --- | --- | --- | --- |
| A1 | **Expo / React Native mit TypeScript** statt Kotlin/Compose | Eine Codebasis für iPad (iOS-Simulator) und Android-Tablet. Die Fachlogik aus dem Prototyp (JavaScript) lässt sich fast 1:1 übernehmen. | Die Designsystem-Seite „Android“ (Compose) bleibt als Referenz, falls später doch nativ gebaut wird |
| A2 | **Version 1 zeigt und bedient alles mit lokalen Daten** (Beispieldaten aus dem Prototyp, gespeichert auf dem Gerät) | „primär für die Darstellung“: erst Oberfläche und Abläufe, dann Anbindung | Nextcloud-Abgleich in Version 2 nach `dateisystem/README.md`; die Datenschicht ist dafür getrennt |
| A3 | **Ein Tablet für beide Standorte** (St. Pius und St. Nikolaus in einer App) | so steht es im Prototyp; dadurch kaum Abgleichkonflikte | mehrere Geräte gehen über den Abgleich je Bett |
| A4 | **Tablet quer** ist das Hauptformat (iPad, Galaxy Tab). Hochkant und unter 900 dp: Zimmerrahmen statt Grundriss | Darstellung für den Dienst am Tisch | Handy-Layout erst bei Bedarf |
| A5 | **Anmeldung über die Unterschrift** (neu, deine Vorgabe): Handelnde Person ist immer eine **diensthabende Betreuungsperson, die in der Besetzung unterschrieben hat**. Wer noch nicht unterschrieben hat, kann nichts ändern (nur ansehen). Die **Leitung** kann sich jederzeit auswählen und bestätigt mit ihrem **Code**. | Jede Änderung ist einer Person zuzuordnen; die Unterschrift belegt zugleich den Dienst | Code der Leitung in den Einstellungen |
| A6 | Küche ist in der Besetzung, unterschreibt, **handelt aber nicht** im Bettenplan | „aus den Betreuern“ | – |
| A7 | **Dienstplan einlesen:** Foto als Vorlage plus Prüfmaske Tag für Tag, Vorschlag aus dem vorläufigen Plan – **ohne Texterkennung** | handgeschriebene Pläne erkennt keine Texterkennung zuverlässig; geprüft werden muss ohnehin jeder Dienst | Texterkennung (Apple Vision / Google ML Kit) als Vorschlagsquelle in Version 2 |
| A8 | **PDFs** (Aufnahme, Dienstbericht, Dienstnachweis) entstehen auf dem Gerät aus HTML-Vorlagen; **Teilen** über den System-Dialog | läuft gleich auf iOS und Android | – |
| A9 | **Unterschriften** als Vektorpfade gespeichert und ins PDF eingebettet | scharf in jeder Größe, klein | PNG-Export für Nextcloud in Version 2 |
| A10 | **Schriften** Atkinson Hyperlegible Next und Mono, Noto Sans Arabic eingebettet | wie im Designsystem | – |
| A11 | **Admin-PIN und Code der Leitung** liegen nur auf dem Gerät, nie in Nextcloud. In der Beispielversion: Admin-PIN `1234`, Code der Leitung `2580` | vierstellige Codes wären als Hash sofort erraten | in den Einstellungen änderbar |

## B Was ihr noch festlegen müsst (blockiert Version 1 nicht)

1. **Texte:** verbindliche Hausordnung (Deutsch), die neun Übersetzungen und die Datenschutzerklärung. Bis dahin stehen Platzhalter in der App.
2. **Löschfristen** für Gäste, Hausverbote, Berichte, Belegung, und wie lange der Monatsabschluss aufbewahrt wird. Das entscheiden Träger und Datenschutzbeauftragte.
3. **Codes:** Wer kennt die Admin-PIN? Hat die Leitung einen eigenen Code (so gebaut)? Brauchen wir eine **App-Sperre** nach einigen Minuten ohne Eingabe?
4. **Ampel:** Wie wird heute gemeldet (Webseite, App, Anruf)? Gibt es eine Schnittstelle? In Version 1 zeigt die App nur die Zahlen.
5. **Nextcloud:** Serveradresse, Gruppenordner, ein Benutzer je Tablet, Lesezugriff der Lohnbuchhaltung.
6. **Team:** echte Namen, Bereiche (Betreuung, Küche, beides), Personalnummern; wie die Leitung angezeigt wird („Schwester Martha“ oder „Leitung“).
7. **Geräte:** welches Tablet, wie viele, Kiosk-Modus (Android-Bildschirmfixierung bzw. iPad „Geführter Zugriff“) ja oder nein.
8. **Saison:** Beginn und Ende, Format der Aufnahmenummer (`2026-27-0001`).
9. **St. Nikolaus:** wirklich ohne Hausordnung, ohne Unterschrift und ohne Läuseschein?
10. **Duschzeiten:** immer 19:00–22:00 in 30-Minuten-Slots, oder je Abend verschieden?
11. **Externe Gäste** (z. B. kurz aufgewärmt, ohne Bett): zählen sie irgendwo mit (Statistik), oder nur im Bericht?

## C Was ich ändern oder ergänzen würde

| # | Vorschlag | Umsetzung |
| --- | --- | --- |
| C1 | **Team verwalten** fehlt im Prototyp: Namen, Bereiche, Personalnummer, aktiv/inaktiv | in Version 1 unter Einstellungen › Team |
| C2 | **Erinnerung „Unterschrift nachholen“**: Wenn ein Bericht ohne Unterschrift abgeschlossen wurde, erinnert die Glocke die Person beim nächsten Dienst. Sonst fehlen Dienste im Monatsabschluss. | in Version 1 |
| C3 | **Diensthabende-Anmeldung** (A5) ersetzt die freie Personenwahl oben rechts. Ohne Unterschrift zeigt der Bettenplan oben „Zum Ändern zuerst in der Besetzung unterschreiben“. | in Version 1 |
| C4 | **Gast bearbeiten** (Stammdaten, Spitzname, Sprache) mit Admin-PIN, Gast löschen nur im Löschlauf | Bearbeiten in Version 1, Löschlauf in Version 2 |
| C5 | **Bettwäschewechsel als Serie** (z. B. alle 14 Tage je Zimmer) statt einzelner Termine | Version 2 |
| C6 | **Dritte Betreuungsperson** bei Bedarf in der Besetzung (zurzeit fest: Betreuung 1, Betreuung 2, Küche) | offen – bitte sagen, ob nötig |
| C7 | **Monate vor dem App-Start** haben keinen Originalplan. Der Monatsabschluss beginnt mit dem ersten eingelesenen Monat. | so gebaut |
| C8 | **„Seit deinem letzten Dienst“** zeigt die Berichte seit dem letzten unterschriebenen Dienst der handelnden Person (im Prototyp feste Beispiele) | in Version 1 |
| C9 | **Ampel melden:** ein Knopf „Ampel gemeldet“ mit Uhrzeit, damit das Team sieht, ob schon gemeldet wurde | Version 2, nach Klärung B4 |

## D Reihenfolge

1. **Version 1 (jetzt):** alle Bildschirme mit Beispieldaten, lokal gespeichert, PDFs und Teilen, Diensthabende-Anmeldung, Team verwalten.
2. **Version 2:** Nextcloud-Abgleich nach `dateisystem/`, echte Texte, Löschlauf, Verschlüsselung der Daten auf dem Gerät, Kiosk.
3. **Version 3:** Texterkennung beim Dienstplan, Ampel-Anbindung (falls möglich).

## E Beim Bau zusätzlich festgelegt

| # | Festlegung | Warum |
| --- | --- | --- |
| E1 | **Verfasser ist immer die angemeldete Person.** Hinweise, Kommentare, Antworten und Notizen tragen den Namen der Betreuungsperson, die unterschrieben hat, oder „Leitung“ nach Code. Die freie Auswahl „Von“ aus dem Prototyp entfällt. | folgt aus A5: jeweils die eine diensthabende Person handelt |
| E2 | **Kalender ändern** bleibt bei Admin-PIN plus Pflichtauswahl „Wer ändert?“ (wie gewünscht). Neue Termine gehen auch ohne PIN, wenn jemand angemeldet ist. | Dienstplan ist heikler als ein Termin |
| E3 | **Leitung** kann ohne Dienst einen Bericht anlegen und alles ändern; sie steht dabei nicht in der Besetzung. Handlungen nur mit Admin-PIN (z. B. Gast bearbeiten) werden mit „Admin-PIN“ vermerkt, wenn niemand angemeldet ist. | z. B. Nachtrag am Morgen |
| E4 | **Dienstnachweis unterschreiben** geht ohne Anmeldung: die Unterschrift selbst zeigt, wer es war. Die Plankorrektur braucht eine Anmeldung. | Mitarbeitende unterschreiben oft außerhalb ihres Dienstes |
| E5 | **Dienstplan einlesen:** Vorschlag je Tag aus dem vorläufigen Plan im Kalender; leere Stellen müssen ausgewählt werden; jeder Tag wird mit „Tag stimmt“ bestätigt. Das Foto steht daneben. | Ersatz für die Texterkennung (A7) |
| E6 | Kopfzeile zeigt **„Auf dem Gerät“** statt eines Abgleich-Status, solange es keinen Nextcloud-Abgleich gibt. | nichts vortäuschen, was es noch nicht gibt |
| E7 | **Hochformat und schmale Fenster** (unter 900 dp) zeigen Zimmerrahmen statt Grundriss. | Grundriss ist für quer ausgelegt |
| E8 | **Android-APK** baut GitHub Actions (`.github/workflows/android-apk.yml`), mit Debug-Schlüssel signiert. Für Play Store oder TestFlight braucht ihr eigene Konten (B12). | ohne Mac und Android Studio installierbar |

Neu offen:

12. **Verteilung:** Apple-Developer-Konto (für echte iPads über TestFlight oder MDM) bzw. Google-Play-Konto, oder Android-APK direkt installieren?
13. **Mehr als ein Tablet** (A3): Dann muss die Anmeldung pro Gerät gelten und der Abgleich Konflikte lösen.
