# Notübernachtung – Designsystem und Prototyp

Vorlage für eine Android-Tablet-App (Kotlin, Jetpack Compose) für die Notübernachtung der Kältehilfe.

- **Designsystem** (veröffentlicht): https://claude.ai/artifact/XkQNF6rnqztP2fkC9gJxuM
- **Klickbarer Prototyp** ohne Nextcloud: https://claude.ai/artifact/WnuQMizHu67mZ9sqQxH2v6

## Ordner

| Ordner | Inhalt |
| --- | --- |
| `designsystem/project/` | Veröffentlichte Dateien: `README.md` (Grundsätze, Wörter, Farben), `fachregeln.md` (KHT-Zählung, „fehlt“, gleiche Vornamen, Sanktionen), `bildschirme.md`, `android.md`, `dokumente.md`, `eingabe.md`, `tokens.json`, Bausteine unter `components/`, Symbole unter `assets/Symbole/` |
| `designsystem/gen/` | Generatoren: `tokens.py`, `icons.py`, `nu-core.js`, `bundle.py`, Bausteine in `comps1.py` bis `comps7.py`, `build.py` |
| `prototyp/` | Prototyp-Quellen `app.js`, `app.css`, Zusammenbau `build.py`, Ende-zu-Ende-Test `test.js` (Playwright), fertige Seite `notuebernachtung-prototyp.html` |
| `dateisystem/` | Ablage auf dem Tablet und in Nextcloud: `README.md` (Ordner, Abgleich, Konflikte, Datenschutz, Anforderungen → Datei), Beispielordner `Notuebernachtung/`, JSON-Schemas `schema/`, `android/NcPfade.kt`, Prüfskript `pruefen.py`, Generatoren `gen/` |
| `bettenplan/` | Erster Bettenplan mit Grundriss (Vorläufer) |

## Bauen

```sh
cd designsystem && python3 gen/tokens.py && python3 gen/icons.py && python3 gen/bundle.py && python3 gen/build.py
cd ../prototyp && python3 build.py && node test.js
cd ../dateisystem && node gen/zustand.js && python3 gen/beispiel.py && python3 gen/schemas.py && python3 pruefen.py
```

Für die App gilt: Werte aus `designsystem/project/tokens.json`, Regeln aus `designsystem/project/fachregeln.md`, Aussehen aus den Bausteinen. Wo Prototyp und Designsystem voneinander abweichen, gilt das Designsystem.
