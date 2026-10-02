# Dialog

Ein Dialog fragt vor Handlungen nach, die man nicht nebenbei auslösen soll: tauschen, Aufnahme verwerfen, Hausverbot übergehen, löschen.

- 480 dp, `flaeche`, `radius-l`, Abdunklung `abdunklung` dahinter. Titel `titel` als Frage mit den echten Namen und Betten, darunter ein Satz zu den Folgen.
- Knöpfe rechts: „Abbrechen“ links davon, die Handlung rechts mit ihrem Verb („Tauschen“, „Verwerfen“, „Trotzdem aufnehmen“). Nie „OK“ oder „Ja“.
- Gefährliche Handlungen: Knopf `nu-btn--gefahr-voll`, und wo nötig ein Pflichtfeld „Begründung“.
- Erscheint in `dauer-mittel` mit `kurve-eintritt`; Esc oder Tipp auf die Abdunklung bricht ab.
