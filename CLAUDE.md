# Notübernachtung – Hinweise für Claude Code

Tablet-App für die Notübernachtung der Kältehilfe (zwei Häuser: St. Pius mit Grundriss, St. Nikolaus mit Saal).
Sprache im Projekt ist **Deutsch**: Bezeichner, Kommentare, Oberflächentexte, Commit-Nachrichten.
Namen in Beispielen bleiben anonym (Kim, Sam, Robin, Chris, Jule, Mika; Gäste mit Allerweltsvornamen).

## Ordner

| Ordner | Rolle |
| --- | --- |
| `app/` | **Die App** (Expo SDK 57, React Native 0.86, TypeScript). Hier wird gearbeitet. |
| `app/ENTSCHEIDUNGEN.md` | Festlegungen (A, E), offene Fragen (B), Vorschläge (C). Bei fachlichen Änderungen nachziehen. |
| `designsystem/` | Quelle für Farben, Symbole, Bausteine und **Fachregeln** (`project/fachregeln.md`). Bei Widerspruch gilt das Designsystem. |
| `prototyp/` | Klickbarer HTML-Prototyp (`app.js`). Vorlage für Abläufe und Texte, wird nicht mehr weiterentwickelt. |
| `dateisystem/` | Ablage in Nextcloud für Version 2 (Ordner, JSON-Schemas, Abgleich). |
| `.github/workflows/android-apk.yml` | Baut bei jedem Push unter `app/` ein installierbares Android-APK (Artefakt `notuebernachtung-apk`). |

## Befehle (in `app/`)

```bash
npm install
npm run pruefen      # tsc --noEmit und Jest (Fachregeln) – vor jedem Commit
npm run ios          # iPad im iOS-Simulator (Mac mit Xcode)
npm run android      # Android-Emulator oder angeschlossenes Tablet
npm run web          # schnelle Vorschau im Browser
npm run apk          # APK lokal bauen (Android SDK + Java 17)
npm run designsystem # src/theme/tokens.ts und src/icons/pfade.ts aus dem Designsystem neu erzeugen
```

Neue Pakete immer mit `npx expo install <paket>` hinzufügen (passende Version zum SDK).

## Aufbau der App

- `src/domain/` – **reine Fachlogik ohne Seiteneffekte**. `welt.ts` (Klasse `Welt`) leitet alles aus dem Zustand `S` ab: Bettstatus, KHT-Nummer, Ampel, Anzeigenamen, Erkennen von @Erwähnungen und Sanktionen, Monatsabschluss, Anmeldung. Neue Regeln hierher und mit Tests in `__tests__/regeln.test.ts` absichern.
- `src/store/store.ts` – zustand-Store `{ S, U }`. `S` wird auf dem Gerät gespeichert (AsyncStorage, Schlüssel `notuebernachtung-v1`, `S.v === 1`), `U` ist nur Oberfläche.
- `src/store/aktionen.ts` – **jede Datenänderung** läuft über `aendern((S, w) => …)` und vermerkt, wer es war (`w.aktivePerson()`).
- `src/ui/` – Grundbausteine (`T`, `Knopf`, `Chip`, `Seg`, `Zeile`, `Blatt`, `Dialog`, `PinRaster`, `UnterschriftFeld`). Farben nur über `useFarben()` (Tag/Nacht), nie fest im Code.
- `src/bereiche/` – Bildschirme. Blätter/Dialoge mit `zeige(<… />)`, schließen mit `schliessen()`, Einblendungen mit `toast()`.
- `src/pdf/pdf.ts` – PDFs aus HTML (expo-print), Teilen über expo-sharing.
- `src/theme/tokens.ts`, `src/icons/pfade.ts` – **erzeugt, nicht von Hand ändern**.

## Regeln, die überall gelten

- **Anmeldung:** Ändern darf nur, wer heute Dienst hat und in der Besetzung unterschrieben hat, oder die Leitung mit Code. Jede Handlung, die Daten ändert, beginnt mit `if (!darf()) return;` (`src/bereiche/anmeldung.tsx`). Vergangene Tage sind nur lesbar (Ausnahme: Nachtrag zu einem Gast).
- Küche unterschreibt, handelt aber nicht im Bettenplan.
- Admin-PIN (Beispiel 1234) für Einstellungen, Kalender ändern, Gast bearbeiten; Code der Leitung (Beispiel 2580). Beide nur auf dem Gerät.
- KHT-Nummer = belegte Betten; Notbett zählt nur, wenn belegt; ab der 2. unentschuldigten Nacht zählt ein Bett als frei.
- Abgeschlossene Berichte sind gesperrt, nur noch „Ergänzen“.
- Tablet quer ist das Hauptformat; unter 900 dp Breite Zimmerrahmen statt Grundriss. Tippflächen mindestens 48 dp.

## Prüfen

1. `npm run pruefen` muss grün sein.
2. Bei Oberflächenänderungen: `npm run web` oder `npx expo export --platform web` und im Browser bei 1280 × 800 durchklicken (Anmeldung über eine Unterschrift oben rechts, dann ändern).
3. Nach dem Push zeigt GitHub › Actions › „Android-APK“, ob der Android-Build durchläuft.
