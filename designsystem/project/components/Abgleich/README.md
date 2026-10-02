# Abgleich

Zeigt den Stand des Abgleichs mit Nextcloud; Eingaben gehen nie verloren, auch offline.

| Zustand | Symbol | Text | Farbe |
| --- | --- | --- | --- |
| synchronisiert | `wolke-ok` | „Synchronisiert 21:00“ | `tinte-2` |
| läuft | `abgleich` (dreht) | „Abgleich läuft …“ | `tinte-2` |
| ausstehend | `wolke-wartet` | „3 Änderungen ausstehend“ | `tinte` |
| offline | `wolke-aus` | „Offline – 3 Änderungen ausstehend“ | `tinte` |
| gestört (3 Fehlversuche oder 24 Std.) | `warnung` | „Abgleich gestört seit 26 Std.“ | `warnung` auf `warnung-flaeche` |

- Tipp öffnet ein Blatt mit letztem Abgleich, ausstehenden Änderungen, Konflikt- und Fehlerprotokoll und dem Knopf „Jetzt synchronisieren“ (tagsüber 09:00–17:00 mit Rückfrage).
- Bei „gestört“ erscheint zusätzlich das Banner (`nu-banner`) oben im Bereich Dienst. Es sagt, dass nichts verloren ist und was zu tun ist.
