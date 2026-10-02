from comps1 import comp

comp("Hinweise","Dienst und Bericht",470,'''<div class="nu nu-vorschau" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start">
<div style="display:grid;gap:10px"><b class="abschnitt">Hinweise</b>
<div class="nu-hinweis is-wichtig"><div class="nu-hinweis-kopf"><i data-icon="warnung" class="klein"></i><b>Leitung</b>· wichtig · bis 16.11.</div><div>Heizung im T-Zimmer defekt, Handwerker kommt Donnerstag. Bitte Heizlüfter nutzen.</div></div>
<div class="nu-hinweis"><div class="nu-hinweis-kopf"><i data-icon="person" class="klein"></i><b>Sam</b>· für die nächsten 3 Tage</div><div>Neue Decken liegen im Keller, Regal links.</div></div>
<div class="nu-hinweis"><div class="nu-hinweis-kopf"><i data-icon="kalender" class="klein"></i><b>Kalender</b>· heute</div><div>Bettwäschewechsel Zimmer B · Morgen Feiertag, heute einkaufen.</div></div></div>
<div style="display:grid;gap:10px"><b class="abschnitt">Seit deinem letzten Dienst <span class="nu-beschr" style="font-weight:400">(08.11.)</span></b>
<div class="nu-hinweis" style="box-shadow:inset 0 0 0 3px var(--vorfall)"><div class="nu-hinweis-kopf"><i data-icon="vorfall" class="klein" style="color:var(--vorfall)"></i><b>Bericht 12.11.</b>· Vorfall</div><div>Streit zwischen <span class="nu-erwaehnung">@Tom</span> und <span class="nu-erwaehnung">@Felix</span>, <span class="nu-stufe nu-stufe--gelb"><i data-icon="karte-gelb" class="klein"></i>Gelbe Karte</span> für Felix.</div></div>
<div class="nu-zeile"><i data-icon="schluessel"></i><div>Schlüssel 7 fehlt seit 11.11.</div></div>
<div class="nu-zeile nu-zeile--warnung"><i data-icon="laeuseschein-fehlt"></i><div>2 offene Läuseschein-Fälle</div></div></div>
</div>''','''# Hinweise

Hinweise sind wichtige Informationen fürs Team; sie stehen oben im Bericht und gelten für einen Zeitraum.

- Karte `nu-hinweis` auf `flaeche`, Kopf mit Absender (`tinte`, 600), Herkunft und Gültigkeit in `text-klein`, darunter der Text.
- „Wichtig“ (Priorität aus der Tabelle „Hinweise“): Grund `warnung-flaeche`, Symbol `warnung`. Neueste zuerst.
- **Seit deinem letzten Dienst**: Zusammenstellung für die aktive Betreuungsperson; Berichte mit Vorfall stehen oben mit Rahmen 3 dp `vorfall` und Symbol `vorfall`. Dazu Zeilen für fehlende Schlüssel, neue Sanktionen und offene Läuseschein-Fälle.
- „Heute“ aus dem Kalender als eigene Karte mit Absender „Kalender“.
- Neue Hinweise aus Nextcloud lösen eine Einblendung aus und zählen an der Glocke.
''', width=1060)

comp("Besetzung","Dienst und Bericht",300,'''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:900px">
<div class="nu-besetzung" style="width:100%"><span class="rolle">Betreuung 1</span><button class="nu-person" aria-pressed="true"><span class="nu-kuerzel">KI</span>Kim<i data-icon="tauschen" class="klein" style="color:var(--tinte-2)"></i></button><button class="nu-mini-unterschrift is-fertig"><i data-icon="check" class="klein"></i>Unterschrieben 18:52</button></div>
<div class="nu-besetzung" style="width:100%"><span class="rolle">Betreuung 2</span><button class="nu-person" aria-pressed="false"><span class="nu-kuerzel">SA</span>Sam<i data-icon="tauschen" class="klein" style="color:var(--tinte-2)"></i></button><button class="nu-mini-unterschrift"><i data-icon="unterschrift" class="klein"></i>Tippen zum Unterschreiben</button></div>
<div class="nu-besetzung" style="width:100%"><span class="rolle">Küche</span><button class="nu-person" aria-pressed="false" style="box-shadow:inset 0 0 0 1.5px var(--linie-stark)"><span class="nu-kuerzel">?</span>offen</button><button class="nu-mini-unterschrift" disabled style="opacity:.5">Erst Person wählen</button></div>
</div>''','''# Besetzung

Wer heute Dienst hat, steht mit Rolle, Name und Unterschrift im Kopf des Berichts.

- Zeile `nu-besetzung`: Rolle (`tinte-2`), Person als Chip, Unterschriftsfeld klein (64 dp, `papier`). Vorbelegt aus dem Dienstplan; leere Stellen heißen „offen“.
- Tipp auf den Namen öffnet die Personalliste (Suche, freie Eingabe möglich); geplante und tatsächliche Person werden beide gespeichert.
- Tipp auf das kleine Feld öffnet das große Unterschriftsfeld als Blatt. Fertig: Rahmen `frei`, „Unterschrieben 18:52“.
- Ohne alle Unterschriften lässt sich der Bericht nicht abschließen; der Knopf sagt, was fehlt.
''')

comp("Berichtsfelder","Dienst und Bericht",560,'''<div class="nu nu-vorschau" style="display:block;max-width:1000px"><div class="nu-bericht">
<div class="nu-bericht-zeile"><span class="nu-feldname">An KHT gemeldet</span><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">Ja</button><button role="radio" aria-checked="false">Nein</button></div><span class="nu-pille">KHT-Nummer 5 · aus dem Bettenplan</span></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Vorfälle</span><div style="display:flex;align-items:center;gap:12px"><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="false">Ja</button><button role="radio" aria-checked="false">Nein</button></div><span class="nu-pille nu-pille--warnung"><i data-icon="warnung" class="klein"></i>Pflichtfeld</span></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Fehlt etwas</span><div class="nu-checkliste"><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Tüten</button><button class="nu-chip">Putzmittel</button><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Toilettenpapier</button><button class="nu-chip"><i data-icon="plus" class="klein"></i>Anderes</button></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Schlüssel fehlt</span><div style="display:flex;gap:12px;align-items:center"><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">Ja</button><button role="radio" aria-checked="false">Nein</button></div><input class="nu-eingabe" style="max-width:200px" placeholder="Nummer(n)" value="7"></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Abwesenheit von Gästen</span><div style="display:grid;gap:6px"><div class="nu-zeile"><i data-icon="schloss"></i><div>Anna · D6 · freigehalten bis 18.11.<small>aus dem Bettenplan</small></div></div><div class="nu-zeile"><i data-icon="rueckkehr"></i><div>Leon · T2 · frei bis 20.11.<small>aus dem Bettenplan</small></div></div></div></div>
</div></div>''','''# Berichtsfelder

Jedes Feld des Dienstberichts hat eine Zeile mit Beschriftung links und Eingabe rechts.

- Zeile `nu-bericht-zeile`: Beschriftung 220 dp breit (`text-stark` 16 sp), Eingabe daneben. Zwischen Feldern `abstand-6`; keine Linien.
- **Ja/Nein** (`nu-seg`) für KHT, Vorfälle, Schlüssel fehlt; keine Vorauswahl. Offene Pflichtfelder zeigen beim Abschließen die Pille „Pflichtfeld“ in `warnung`.
- **KHT**: daneben die Nummer aus dem Bettenplan als Pille.
- **Fehlt etwas**: Chips aus der Liste in den Einstellungen plus „Anderes“ mit Freitext.
- **Abwesenheit von Gästen**: automatisch aus dem Bettenplan, ergänzbar.
- **Freitext** (Wichtige Hinweise, Fragen von Gästen, Sonstiges): siehe Erwähnung und Stufenwörter.
- Ein Bericht mit „Vorfälle: Ja“ bekommt den Rahmen 3 dp `vorfall` (`nu-bericht.is-vorfall`).
''', width=1040)

comp("ErwaehnungStufenwoerter","Dienst und Bericht",560,'''<div class="nu" style="width:980px;background:var(--grund);padding:20px;display:grid;gap:12px">
<div class="nu-feld"><label for="t">Wichtige Hinweise</label>
<div class="nu-eingabe" id="t" style="min-height:150px;padding:14px 16px;border-color:var(--fokus);background:var(--flaeche)"><span class="nu-stufe nu-stufe--gelb"><i data-icon="karte-gelb" class="klein"></i>Gelbe Karte</span> für <span class="nu-erwaehnung">@Felix</span>: hat nach 23 Uhr laut Musik gehört, nach zwei Hinweisen.<br>Frage von <span class="nu-erwaehnung">@Max</span> nach einer zweiten Decke. @Ma<span style="display:inline-block;width:2px;height:22px;background:var(--tinte);vertical-align:middle;animation:nu-ein 1s steps(2) infinite"></span></div></div>
<div class="nu-vorschlaege" role="listbox"><button role="option" aria-selected="true"><i data-icon="person"></i>Tom<small>D2 · anwesend</small></button><button role="option"><i data-icon="person"></i>Eva<small>St. Nikolaus · N5</small></button><button role="option"><i data-icon="person-plus"></i>„Ma“ als externen Gast anlegen</button></div>
<div style="margin-top:auto;border-radius:14px;overflow:hidden"><div class="nu-tastenleiste"><button class="nu-chip"><b>@</b> Gast</button><button class="nu-chip"><i data-icon="verwarnung" class="klein"></i>Verwarnung</button><button class="nu-chip"><i data-icon="karte-gelb" class="klein"></i>Gelbe Karte</button><button class="nu-chip"><i data-icon="karte-rot" class="klein"></i>Hausverbot</button><button class="nu-btn nu-btn--primaer nu-btn--klein"><i data-icon="check"></i>Fertig</button></div>
<div style="height:120px;background:var(--flaeche-3);display:grid;place-items:center;color:var(--tinte-3);font-size:14px">Bildschirmtastatur</div></div>
</div>''','''# Erwähnung und Stufenwörter

Im Freitext des Berichts erwähnt „@“ einen Gast; ein Absatz, der mit einem Stufenwort beginnt, legt zusätzlich eine Sanktion an.

- „@“ öffnet die Vorschlagsliste (`nu-vorschlaege`, 340 dp) unter dem Cursor: anwesende Gäste zuerst, dann alle, zuletzt „… als externen Gast anlegen“. Pfeiltasten und Enter funktionieren mit Hardware-Tastatur.
- Erwähnung im Text: `nu-erwaehnung` (Grund `erwartet-flaeche`, Text `blau`, 600), wird als Ganzes gelöscht. Jeder erwähnte Gast erhält den Absatz als Notiz mit Verweis auf den Bericht.
- Stufenwörter am Absatzanfang: „Verwarnung“, „Gelbe Karte“, „Hausverbot“ (auch „Rote Karte“). Sie werden fett, Karten mit ihrem Symbol. Nach dem Abschließen entsteht der Sanktionseintrag; vorher zeigt eine Zeile unter dem Feld: „Wird angelegt: Gelbe Karte für Felix“.
- **Schreibmodus:** Mit offener Bildschirmtastatur sitzt die `nu-tastenleiste` direkt über der Tastatur: „@ Gast“, die drei Stufenwörter, „Fertig“ (schließt die Tastatur). Das aktive Feld rückt nach oben und bleibt ganz sichtbar.
- Eingaben werden bei jedem Zeichen lokal gespeichert.
''', width=980, subtitle="Mit Schreibmodus über der Bildschirmtastatur")

comp("Duschplan","Dienst und Bericht",330,'''<div class="nu nu-vorschau nu-vorschau--spalte">
<div style="display:flex;align-items:center;gap:12px"><b class="abschnitt" style="flex:1">Duschplan · heute</b><span class="nu-beschr">19:00 – 22:00 · 30 Minuten</span></div>
<div class="nu-dusche" style="width:100%">
<button class="nu-slot" data-s="erledigt"><span class="zeit">19:00 ✓</span><b>Paul</b><span class="nu-beschr">D1 · erledigt</span></button>
<button class="nu-slot" data-s="verpasst"><span class="zeit">19:30</span><b>Tim</b><span class="nu-beschr">B1 · verpasst</span></button>
<button class="nu-slot" data-s="geplant"><span class="zeit">20:00</span><b>Moritz</b><span class="nu-beschr">F2</span></button>
<button class="nu-slot" data-s="geplant"><span class="zeit">20:30</span><b>Max</b><span class="nu-beschr">D4</span></button>
<button class="nu-slot" data-s="frei"><span class="zeit">21:00</span><b>frei</b><span class="nu-beschr">antippen</span></button>
<button class="nu-slot" data-s="frei"><span class="zeit">21:30</span><b>frei</b><span class="nu-beschr">antippen</span></button>
</div></div>''','''# Duschplan

Ein Raster aus Zeitslots, in das man Gäste einträgt und das zum Slotbeginn erinnert.

- Slot `nu-slot` (mindestens 150 × 76 dp): Uhrzeit `nummer`, Name `text-stark`, Bett in `text-klein`.
- Zustände: frei (`flaeche-2`, „frei“ in `tinte-3`), geplant (`erwartet-flaeche`, Rahmen `blau`), erledigt (Rahmen `frei`, ✓ an der Uhrzeit), verpasst (Name durchgestrichen, „verpasst“).
- Freien Slot antippen → Gast wählen (heute aus den anwesenden, für die nächsten 3 Tage aus den erwarteten). Belegten Slot antippen → „Erledigt“, „Verpasst“, „Anderer Gast“, „Freigeben“.
- Zu Slotbeginn eine Einblendung „Dusche 20:30 – Max, Bett D4“, auch im Hintergrund (AlarmManager), Ton optional.
- Raster, Länge und Anzahl in den Einstellungen.
''')

comp("BerichtAbgeschlossen","Dienst und Bericht",400,'''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:900px">
<div class="nu-gesperrt" style="width:100%"><i data-icon="schloss" class="zu"></i><div style="flex:1">Bericht abgeschlossen<small>14.11. · 07:42 · Kim, Sam · PDF gespeichert und abgeglichen</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="pdf"></i>PDF ansehen</button><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="mail"></i>An Leitung</button></div>
<div class="nu-bericht is-vorfall" style="width:100%;gap:12px;padding:18px"><div style="display:flex;align-items:center;gap:8px;color:var(--vorfall);font-weight:700"><i data-icon="vorfall"></i>Bericht mit Vorfall</div><div style="color:var(--tinte-2)">Wichtige Hinweise: <span class="nu-stufe nu-stufe--gelb"><i data-icon="karte-gelb" class="klein"></i>Gelbe Karte</span> für <span class="nu-erwaehnung">@Felix</span> …</div></div>
<div class="nu-nachtrag" style="width:100%"><b>Nachtrag</b>Felix hat sich am Morgen entschuldigt.<small>15.11. · 19:05 · Sam</small></div>
<button class="nu-btn nu-btn--rahmen"><i data-icon="stift"></i>Nachtrag hinzufügen</button>
</div>''','''# Bericht abgeschlossen

Nach dem Abschluss ist der Bericht schreibgeschützt; Nachträge kommen mit Zeitstempel darunter.

- „Bericht abschließen“ prüft Pflichtfelder: Besetzung mit Unterschriften, KHT Ja/Nein, Vorfälle Ja/Nein. Fehlt etwas, springt die Ansicht zum ersten offenen Feld.
- Danach: Leiste `nu-gesperrt` (Grund `flaeche-3`, Symbol `schloss` rastet in `dauer-lang` ein) mit Zeit, Personen, Abgleichstand und den Knöpfen „PDF ansehen“ und „An Leitung“.
- Felder bleiben lesbar, alle Eingaben sind weg. Ein Bericht mit Vorfall behält den roten Rahmen, auch im Archiv.
- **Nachtrag** (`nu-nachtrag`): Text mit Datum, Uhrzeit und Name; darf jede Betreuungsperson und die Leitung. Korrekturen an Feldern nur mit Admin-PIN und Protokoll.
''')

comp("Kalender","Kalender",620,'''<div class="nu" style="width:1100px;background:var(--grund);padding:20px">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><h2 class="titel" style="margin:0;flex:1">November 2026</h2><div class="nu-reiter"><button aria-selected="true">Monat</button><button aria-selected="false">Woche</button></div><button class="nu-btn nu-btn--primaer nu-btn--klein"><i data-icon="plus"></i>Termin</button></div>
<div class="nu-monat" id="m"></div></div>
<script>
var k=["Mo","Di","Mi","Do","Fr","Sa","So"].map(function(d){return '<div class="nu-monat-kopf">'+d+'</div>'}).join("");
var ev={2:[["dienst","personen","Kim + Sam"]],3:[["","wiederholen","Bettwäsche B"]],10:[["","wiederholen","Bettwäsche D"]],13:[["dienst","personen","Kim + Sam"]],14:[["dienst","personen","Kim + Sam"],["","kalender","Lieferung Decken"]],18:[["feiertag","einkauf","Morgen Feiertag"]],19:[["feiertag","kalender","Buß- und Bettag"]],24:[["","wiederholen","Bettwäsche T"]],27:[["","kalender","Handwerker Heizung"]]};
var html=k;for(var i=0;i<35;i++){var d=i-5+1;var anders=d<1||d>30;var dd=anders?(d<1?31+d:d-30):d;var e=(!anders&&ev[d]||[]).map(function(x){return '<span class="nu-termin'+(x[0]?' nu-termin--'+x[0]:'')+'">'+Nu.svg(x[1])+x[2]+'</span>'}).join("");html+='<button class="nu-tag'+(anders?' is-anders':'')+(d===14?' is-heute':'')+'"><span class="d">'+dd+'</span>'+e+'</button>';}
document.getElementById("m").innerHTML=html;
</script>''','''# Kalender

Der Kalender sammelt alles mit Datum; jeder Eintrag erscheint am Tag automatisch unter „Heute“ im Bericht.

- Monatsansicht: 7 Spalten, Tageszelle mindestens 112 dp hoch, Grund `flaeche`, Tage anderer Monate ohne Grund in `tinte-3`. Heute: Zahl im Kreis `primaer`.
- Einträge als `nu-termin` mit Symbol: Dienst (`personen`, Grund `erwartet-flaeche`), Aufgabe und Bettwäsche (`wiederholen` bei wiederkehrenden), Feiertag mit Einkaufshinweis (`einkauf`, Grund `warnung-flaeche`), Sondertermin (`kalender`).
- Wochenansicht: eine Spalte je Tag mit Nachtdienst, Küche und Einträgen untereinander.
- Tipp auf einen Tag öffnet den Tag rechts im Detailbereich; „Termin“ legt einen Eintrag an. Dienstplan-Import (Bild, PDF, ICS) zeigt vor dem Übernehmen eine Prüftabelle mit markierten unsicheren Feldern.
''', width=1100)

comp("AdminPin","Einstellungen",470,'''<div class="nu nu-vorschau" style="justify-content:center"><div class="nu-pin">
<i data-icon="schloss"></i><b class="titel">Admin-PIN eingeben</b>
<div class="nu-pin-punkte" id="pp"><i class="is-voll"></i><i class="is-voll"></i><i></i><i></i></div>
<div class="nu-pin-tasten" id="t"></div><p class="nu-beschr">Schützt Einstellungen und Korrekturen vor versehentlichen Änderungen.</p></div></div>
<script>document.getElementById("t").innerHTML=["1","2","3","4","5","6","7","8","9","","0","⌫"].map(function(x){return x?'<button>'+x+'</button>':'<span></span>'}).join("");</script>''','''# Admin-PIN

Die Zifferntastatur schützt Einstellungen, Löschlauf und Korrekturen an vergangenen Tagen.

- Tasten 80 × 72 dp, Ziffern in `zahl-gross`-Familie 26 sp, Grund `flaeche-2`. Punkte 16 dp; gefüllt `tinte`.
- Falsche PIN: Punkte schütteln sich (300 ms), dann leer, Text „PIN stimmt nicht“. Nach fünf Fehlversuchen 1 Minute Pause.
- Die App-PIN beim Öffnen und nach 5 Minuten Inaktivität nutzt dieselbe Tastatur.
- Kein Systemtastatur-Feld: die eigene Tastatur funktioniert auch im Kioskmodus und mit Handschuhen.
''')

comp("Einstellungszeilen","Einstellungen",420,'''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:760px">
<div class="nu-einstellung" style="width:100%"><i data-icon="mond"></i><div><b>Nachtmodus</b><small>Automatisch von 20:00 bis 07:00</small></div><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Nachtmodus automatisch"></button></div>
<div class="nu-einstellung" style="width:100%"><i data-icon="ampel"></i><div><b>Ampel-Schwellen</b><small>Grün ab 3 frei · gelb 1–2 · rot 0</small></div><i data-icon="weiter"></i></div>
<div class="nu-einstellung" style="width:100%"><i data-icon="abgleich"></i><div><b>Abgleich</b><small>17:00–09:00 stündlich · tagsüber Pause</small></div><i data-icon="weiter"></i></div>
<div class="nu-einstellung" style="width:100%"><i data-icon="telefon"></i><div><b>Meldung an KHT und Ampel</b><small>Schnittstelle angelegt, sendet noch nicht</small></div><span class="nu-bald"><i data-icon="uhr" class="klein"></i>noch nicht verfügbar</span></div>
</div>''','''# Einstellungszeilen

Eine Zeile je Einstellung: Symbol, Name, aktueller Wert, rechts Schalter oder Pfeil.

- `nu-einstellung` mindestens 72 dp, Grund `flaeche`. Name `text-stark`, Wert `text-klein` (`tinte-2`); der Wert ist immer sichtbar, ohne die Zeile zu öffnen.
- Sofort wirksame Ein/Aus-Werte mit `nu-schalter`; alles andere öffnet eine Unterseite (Pfeil `weiter`).
- **Noch nicht verfügbar** (`nu-bald`): gestrichelte Marke mit Uhr, für Funktionen, die angelegt, aber noch nicht fertig sind (z. B. KHT-Meldung). Keine stillen Platzhalter.
''')

comp("Einblendung","Rückmeldung",330,'''<div class="nu nu-vorschau" style="align-items:flex-start;gap:24px">
<div class="nu-einblendung"><i data-icon="dusche"></i><div><b>Dusche 20:30</b><span>Max, Bett D4</span></div><button class="nu-iconbtn" aria-label="Schließen"><i data-icon="schliessen"></i></button><i class="lauf"></i></div>
<div class="nu-glocke-liste"><div style="padding:8px 10px;font-weight:700">3 offene Erinnerungen</div>
<div class="nu-zeile nu-zeile--warnung"><i data-icon="laeuseschein-fehlt"></i><div>Läuseschein · Jan, T1<small>seit 3 Tagen</small></div></div>
<div class="nu-zeile"><i data-icon="bericht"></i><div>Neuer Hinweis der Leitung<small>vor 10 Minuten</small></div></div>
<div class="nu-zeile"><i data-icon="dusche"></i><div>Dusche 21:00 · Moritz, F2<small>in 25 Minuten</small></div></div></div>
</div>''','''# Einblendung

Kurze Hinweise erscheinen oben rechts über dem Inhalt und wandern danach in die Glocke, bis sie erledigt sind.

- `nu-einblendung` 380 dp, `flaeche`, `schatten-schwebend`, Symbol in `blau` (Warnungen in `warnung`). Titel `text-stark`, Inhalt `text-klein`, Schließen rechts.
- Herein in `dauer-lang` mit `kurve-eintritt`; Standzeit `dauer-einblendung` (6 s) mit Laufbalken unten; Antippen öffnet die Sache (Duschplan, Hinweis, Gast).
- Höchstens zwei übereinander; weitere gehen direkt in die Glocke.
- **Glocke**: Liste aller offenen Erinnerungen, Warnungen oben. Ein Eintrag verschwindet erst, wenn die Sache erledigt ist.
''')

comp("Dialog","Rückmeldung",300,'''<div class="nu" style="position:relative;height:290px;display:grid;place-items:center;overflow:hidden"><div class="nu-scrim"></div><div class="nu-dialog" style="position:relative" role="alertdialog" aria-labelledby="dt"><h2 id="dt">Tom (D2) und Max (D4) tauschen?</h2><p>Gilt ab heute. Bereits unterschriebene PDFs bleiben unverändert.</p><div class="nu-dialog-knoepfe"><button class="nu-btn nu-btn--klein">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein"><i data-icon="tauschen"></i>Tauschen</button></div></div></div>''','''# Dialog

Ein Dialog fragt vor Handlungen nach, die man nicht nebenbei auslösen soll: tauschen, Aufnahme verwerfen, Hausverbot übergehen, löschen.

- 480 dp, `flaeche`, `radius-l`, Abdunklung `abdunklung` dahinter. Titel `titel` als Frage mit den echten Namen und Betten, darunter ein Satz zu den Folgen.
- Knöpfe rechts: „Abbrechen“ links davon, die Handlung rechts mit ihrem Verb („Tauschen“, „Verwerfen“, „Trotzdem aufnehmen“). Nie „OK“ oder „Ja“.
- Gefährliche Handlungen: Knopf `nu-btn--gefahr-voll`, und wo nötig ein Pflichtfeld „Begründung“.
- Erscheint in `dauer-mittel` mit `kurve-eintritt`; Esc oder Tipp auf die Abdunklung bricht ab.
''')
