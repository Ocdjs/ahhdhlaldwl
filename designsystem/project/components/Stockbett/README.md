# Stockbett

Zwei Bettkarten übereinander in einem gemeinsamen Rahmen; oben die kleinere Nummer.

- Rahmen `flaeche-3`, Innenabstand 8 dp, Radius `radius-m` + 4. Über jeder Karte klein „oben“ / „unten“ (12 sp, Versalien).
- Jede Hälfte ist eine eigenständige Bettkarte mit eigenem Status; Ziehen und Tauschen gehen auch zwischen oben und unten.
- Im Datenmodell sind es zwei Zeilen in „Betten“ mit derselben `zimmer_id` und `pos_x`, `pos_y` übereinander.
