# Notübernachtung · Tablet-App

Expo / React Native mit TypeScript, eine Codebasis für **iPad** (iOS-Simulator) und **Android-Tablets**.
Version 1 arbeitet mit Beispieldaten und speichert alles nur auf dem Gerät (siehe `ENTSCHEIDUNGEN.md`).

## Starten

Voraussetzung: Node.js 20 oder neuer.

```bash
cd app
npm install
```

### iPad im iOS-Simulator (Mac mit Xcode)

```bash
npm run ios            # baut die App und startet sie im Simulator
```

Beim ersten Mal fragt Expo nach dem Gerät: ein iPad wählen (z. B. „iPad Air 11-inch“).
Ohne eigenen Build geht es auch mit **Expo Go**: `npx expo start`, dann `i` drücken
(Expo Go wird im Simulator installiert) oder auf einem echten iPad den QR-Code mit der Kamera scannen.

### Android

- **APK zum Installieren:** GitHub › Actions › „Android-APK“ › letzter Lauf › Artefakt `notuebernachtung-apk`
  herunterladen, entpacken, die `.apk` aufs Tablet kopieren und öffnen (einmalig „Installation aus
  unbekannten Quellen“ erlauben). Der Lauf startet bei jeder Änderung unter `app/` und lässt sich
  über „Run workflow“ auch von Hand starten.
- **Selbst bauen** (Android Studio bzw. Android SDK und Java 17 nötig): `npm run apk`,
  das Ergebnis liegt unter `android/app/build/outputs/apk/release/app-release.apk`.
- **Im Emulator oder am angeschlossenen Tablet:** `npm run android`.
- **Mit Expo Go** auf dem Tablet: `npx expo start` und den QR-Code scannen.

Das APK ist mit dem Debug-Schlüssel signiert: gut zum Testen, nicht für den Play Store.
Für eine feste Verteilung (Play Store, TestFlight, MDM) siehe `eas.json` und die Expo-Doku zu EAS Build.

### BlueStacks (Android-Emulator unter Windows oder macOS)

1. APK aus GitHub › Actions › „Android-APK“ › grüner Lauf › Artefakt `notuebernachtung-apk` laden und entpacken.
2. Die `.apk` ins BlueStacks-Fenster ziehen oder rechts „APK installieren“ (Strg + Umschalt + B) wählen.
3. Einstellungen › Anzeige: 1920 × 1080, Querformat, 240 DPI; unter „Gerät“ möglichst ein Tablet-Profil.
4. Bei „App nicht installiert“ die alte Version zuerst deinstallieren (andere Signatur).

Die App braucht Android 7 oder neuer; jede aktuelle BlueStacks-Instanz passt.

### Im Browser (nur Vorschau)

```bash
npm run web
```

## Beispielversion: Anmeldung und Codes

- **Ändern kann nur, wer heute Dienst hat und in der Besetzung unterschrieben hat.** Vorher zeigt die
  App „Nur ansehen“. Oben rechts stehen die Diensthabenden: antippen → unterschreiben → angemeldet.
- **Leitung:** oben rechts „Leitung“, Code **2580**.
- **Admin-PIN** (Einstellungen, Kalender ändern, Gast bearbeiten): **1234**.
- Beide Codes lassen sich unter Einstellungen › Codes ändern und gelten nur auf dem Gerät.
- Beispieldaten zurücksetzen: Einstellungen › Beispieldaten.

## Prüfen

```bash
npm run pruefen        # Typprüfung und Tests der Fachregeln
```

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `src/domain/` | Datenmodell (`typen.ts`), Haus und Grundriss (`haus.ts`), Fachregeln als reine Ableitungen (`welt.ts`), Beispieldaten, Tests |
| `src/store/` | Zustand (zustand, gespeichert mit AsyncStorage) und alle Änderungen (`aktionen.ts`) |
| `src/theme/`, `src/icons/` | aus dem Designsystem erzeugt (`npm run designsystem`), nicht von Hand ändern |
| `src/ui/` | Grundbausteine: Text, Knöpfe, Chips, Blätter, Dialoge, PIN, Unterschriftsfeld |
| `src/bereiche/` | Bildschirme: Bettenplan mit Grundriss, Aufnahme, Gäste, Dienst & Bericht, Archiv, Monatsabschluss, Kalender, Einstellungen |
| `src/pdf/` | PDFs (Aufnahme, Dienstbericht, Dienstnachweis) aus HTML, Teilen über den System-Dialog |

Fachliche Grundlage: `../designsystem/` (Bausteine, Fachregeln, Bildschirme), `../prototyp/`, `../dateisystem/` (Nextcloud-Ablage für Version 2).

## Tablet im Dienst (Kiosk)

- **Android:** Einstellungen › Sicherheit › „App anpinnen“ (Bildschirmfixierung), dann in der App-Übersicht anpinnen.
- **iPad:** Einstellungen › Bedienungshilfen › „Geführter Zugriff“, in der App dreimal die Seitentaste drücken.
