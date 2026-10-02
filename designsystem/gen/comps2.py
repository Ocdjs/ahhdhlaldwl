from comps1 import comp
RAIL = '''<nav class="nu-leiste" aria-label="Bereiche">
  <div class="nu-leiste-marke"><i data-icon="bett"></i></div>
  <button class="nu-nav" aria-current="page"><span class="nu-nav-ind"><i data-icon="bett"></i></span>Betten&shy;plan</button>
  <button class="nu-nav"><span class="nu-nav-ind" style="position:relative"><i data-icon="bericht"></i></span>Dienst &amp; Bericht</button>
  <button class="nu-nav"><span class="nu-nav-ind"><i data-icon="kalender"></i></span>Kalender</button>
  <button class="nu-nav"><span class="nu-nav-ind"><i data-icon="regler"></i></span>Einstel&shy;lungen</button>
</nav>'''
KOPF = '''<header class="nu-kopf">
  <div class="nu-datum"><button class="nu-iconbtn" aria-label="Vortag"><i data-icon="zurueck"></i></button><div class="nu-datum-text">Dienstag, 14.11.<small>Dienst 18:45 – 08:00</small></div><button class="nu-iconbtn" aria-label="Folgetag"><i data-icon="weiter"></i></button><button class="nu-iconbtn" aria-label="Kalender öffnen"><i data-icon="kalender"></i></button></div>
  <span class="nu-kopf-raum"></span>
  <button class="nu-sync" data-s="ok"><i data-icon="wolke-ok"></i>Synchronisiert 21:00</button>
  <button class="nu-iconbtn nu-iconbtn--fl" aria-label="3 offene Erinnerungen"><i data-icon="glocke"></i><span class="nu-zaehler">3</span></button>
  <div class="nu-dienst"><button class="nu-person" aria-pressed="true"><span class="nu-kuerzel">KI</span>Kim</button><button class="nu-person" aria-pressed="false"><span class="nu-kuerzel">SA</span>Sam</button></div>
</header>'''

comp("Navigationsleiste","Grundgerüst",620,f'''<div class="nu" style="height:600px;width:104px;display:flex">{RAIL}</div>''','''# Navigationsleiste

Die Leiste links ist immer sichtbar und führt in die vier Bereiche.

- Breite `leiste-breite` (104 dp), Grund `flaeche-2`. Ziele 88 × 76 dp, Symbol 24 dp über dem Wort (`ueberzeile` nicht nötig, 13 sp 600).
- Gewählt: Pille 64 × 36 dp in `primaer`, Symbol in `auf-primaer`, Wort in `tinte`. Nie nur die Farbe des Symbols ändern.
- Reihenfolge: Bettenplan, Dienst & Bericht, Kalender; Einstellungen unten, getrennt durch freien Raum. Einstellungen fragen beim Öffnen die Admin-PIN ab.
- Ein offener Bericht ohne Abschluss zeigt am Symbol „Dienst & Bericht“ einen Punkt in `warnung`.
- Compose: `NavigationRail` mit `NavigationRailItem`, `indicatorColor = primaer`.
''')

comp("Kopfzeile","Grundgerüst",120,f'''<div class="nu" style="width:1176px">{KOPF}</div>''','''# Kopfzeile

Die Kopfzeile zeigt in jedem Bereich, welcher Diensttag gilt, ob Daten abgeglichen sind, was erinnert werden muss und wer Dienst hat.

- Höhe `kopf-hoehe` (72 dp), Grund `grund`, keine Linie darunter.
- **Datumswahl** links: Pfeile (48 dp) und Kalender. Text: Wochentag und Datum in `abschnitt`-Gewicht, darunter Dienstzeit in `text-klein`. Standard ist der laufende Diensttag (Tageswechsel 12:00). Ein vergangener Tag zeigt daneben die Pille „Nur lesen“ (`nu-nurlesen`, Symbol `schloss`).
- **Abgleich** (`nu-sync`): siehe Baustein Abgleich.
- **Glocke**: Zähler (`nu-zaehler`, Grund `warnung`) für offene Erinnerungen: Läuseschein, neue Hinweise, Duschslots. Tipp öffnet die Liste.
- **Dienstpersonen** rechts als Chips mit Kürzel. Bei zwei Personen ist genau eine „aktiv“ (Rahmen `tinte`, Kürzel in `primaer`): sie wird bei Notizen, Unterschriften und Änderungen eingetragen. Ein Tipp wechselt.
''', width=1176)

comp("Abgleich","Grundgerüst",150,'''<div class="nu nu-vorschau">
<button class="nu-sync" data-s="ok"><i data-icon="wolke-ok"></i>Synchronisiert 21:00</button>
<button class="nu-sync" data-s="laeuft"><i data-icon="abgleich"></i>Abgleich läuft …</button>
<button class="nu-sync" data-s="wartet"><i data-icon="wolke-wartet"></i>3 Änderungen ausstehend</button>
<button class="nu-sync" data-s="offline"><i data-icon="wolke-aus"></i>Offline – 3 Änderungen ausstehend</button>
<button class="nu-sync" data-s="gestoert"><i data-icon="warnung"></i>Abgleich gestört seit 26 Std.</button>
<div class="nu-banner" style="width:100%"><i data-icon="warnung"></i><div>Der letzte Abgleich ist 26 Stunden her.<small>Alle Eingaben sind auf dem Tablet gespeichert. Bitte WLAN prüfen oder die Leitung informieren.</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen">Jetzt synchronisieren</button></div>
</div>''','''# Abgleich

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
''')

comp("AppGeruest","Grundgerüst",800,'''<div class="nu nu-app" style="height:800px;width:1280px">
__RAIL__
__KOPF__
<main class="nu-inhalt" style="display:grid;gap:12px;align-content:start">
  <div class="nu-kennzahlen" id="kz"></div>
  <div style="display:flex;align-items:center;gap:12px"><div class="nu-reiter" role="tablist"><button role="tab" aria-selected="true"><i data-icon="haus" class="klein"></i>Haupthaus <span class="n">5 frei</span></button><button role="tab" aria-selected="false"><i data-icon="standort-2" class="klein"></i>St. Nikolaus <span class="n">6/8</span></button></div><span style="flex:1"></span><button class="nu-btn nu-btn--primaer"><i data-icon="person-plus"></i>Gast aufnehmen</button></div>
  <div id="plan" style="display:grid;grid-template-columns:auto auto 1fr;gap:12px;align-items:start"></div>
</main>
</div>
<script>
document.getElementById("kz").innerHTML='<span class="nu-ampel" data-s="gruen"><span class="nu-ampel-licht">5</span><span class="nu-ampel-wort">5 Betten frei<small>Ampel grün · beide Standorte</small></span></span><span class="nu-kennzahl">Belegung<b>17 von 24 · 2 erwartet</b></span><span class="nu-kennzahl">St. Nikolaus<b>6 von 8</b></span><span class="nu-kennzahl">KHT-Nummer<b>5</b></span><span style="flex:1"></span><button class="nu-btn nu-btn--rahmen nu-btn--klein"><i data-icon="telefon"></i>An KHT gemeldet</button>';
var B=Nu.bett;
function zimmer(n,f,inner,st){return '<section class="nu-zimmer"'+(st||'')+'><div class="nu-zimmer-kopf"><span class="nu-zimmer-name">'+n+'</span><span class="nu-zimmer-frei">'+f+'</span></div>'+inner+'</section>';}
function stock(a,b){return '<div class="nu-stockbett"><div class="nu-stockbett-teil"><span>oben</span>'+B(a)+'</div><div class="nu-stockbett-teil"><span>unten</span>'+B(b)+'</div></div>';}
document.getElementById("plan").innerHTML=
 zimmer("Zimmer D","1 frei",'<div class="nu-zimmer-betten"><div class="nu-zimmer-teil">'+B({nr:"D1",s:"anwesend",name:"Paul",naechte:21})+stock({nr:"D2",s:"anwesend",name:"Tom",naechte:44,symbole:["notiz"]},{nr:"D3",s:"frei"})+'</div><div class="nu-zimmer-teil">'+stock({nr:"D4",s:"erwartet",name:"Max",naechte:12,dusche:"20:30"},{nr:"D5",s:"anwesend",name:"Felix",naechte:9,symbole:["karte-gelb"]})+B({nr:"D6",s:"gehalten",name:"Anna",bis:"18.11."})+'</div></div>')+
 zimmer("T-Zimmer","1 frei",'<div class="nu-zimmer-betten">'+stock({nr:"T1",s:"anwesend",name:"Jan",naechte:3,symbole:["laeuseschein-fehlt"],warn:true},{nr:"T2",s:"freibis",name:"Leon",bis:"20.11."})+B({nr:"T3",s:"anwesend",name:"Laura",naechte:30})+'</div>')+
 '<div></div>';
Nu.mountIcons();
</script>'''.replace('__RAIL__',RAIL).replace('__KOPF__',KOPF),'''# App-Gerüst

Das Gerüst jeder Ansicht im Querformat: Navigationsleiste links, Kopfzeile oben, Inhalt darunter, Detailbereich bei Bedarf rechts.

- Raster für 10–12-Zoll-Tablets im Querformat (z. B. 1280 × 800 dp): Leiste `leiste-breite` 104 dp, Kopf `kopf-hoehe` 72 dp, Inhalt mit `abstand-4` (16 dp) Rand links und 20 dp rechts.
- Der **Detailbereich** (`detail-breite` 460 dp) schiebt sich rechts über den Inhalt; der Bettenplan bleibt links sichtbar und bedienbar (Bett antippen wechselt den Gast im Detailbereich).
- **Assistent** und **Dialoge** liegen über allem mit `abdunklung`.
- Hoch- und Querformat: Die App ist für Querformat gebaut. Im Hochformat stapelt sie Kennzahlen und Plan und öffnet den Detailbereich als Vollbild.
- Grundfarben: `grund` hinter allem, `flaeche` für Inhaltsblöcke, `flaeche-2` für Leiste und Felder. Abschnitte trennt Abstand, keine Linien.
- Nachtmodus („Nacht“-Werte) gilt automatisch von 20:00 bis 07:00 oder nach Systemeinstellung; umschaltbar in den Einstellungen.
''', width=1280, subtitle="Querformat 1280 × 800 dp")

comp("Bettkarte","Bettenplan",460,'''<div class="nu nu-vorschau" id="v" style="display:grid;grid-template-columns:repeat(4,max-content);gap:20px 16px"></div>
<script>
var L=[["frei",{nr:"B2",s:"frei"}],["erwartet",{nr:"D4",s:"erwartet",name:"Max",naechte:12,dusche:"20:30"}],["anwesend",{nr:"D1",s:"anwesend",name:"Paul",naechte:21}],["freigehalten bis",{nr:"D6",s:"gehalten",name:"Anna",bis:"18.11."}],
["frei bis",{nr:"T2",s:"freibis",name:"Leon",bis:"20.11."}],["deaktiviert",{nr:"F4",s:"aus"}],["Läuseschein fehlt seit 3 Tagen",{nr:"T1",s:"anwesend",name:"Jan",naechte:3,symbole:["laeuseschein-fehlt"],warn:true}],["Gelbe Karte, Notiz",{nr:"D5",s:"anwesend",name:"Felix",naechte:9,symbole:["karte-gelb","notiz"]}],
["Rote Karte (Hausverbot)",{nr:"L2",s:"erwartet",name:"Julia",naechte:2,symbole:["karte-rot"]}],["langer Name",{nr:"F1",s:"anwesend",name:"Maximilian-Alexander",naechte:1}],["Neuaufnahme",{nr:"B1",s:"anwesend",name:"Tim",naechte:1,symbole:["laeuseschein-fehlt"]}],["geöffnet",{nr:"F2",s:"anwesend",name:"Moritz",naechte:20}]];
document.getElementById("v").innerHTML=L.map(function(x){return '<div style="display:grid;gap:8px"><span class="nu-beschr">'+x[0]+'</span>'+Nu.bett(x[1])+'</div>';}).join("");
document.querySelectorAll(".nu-bett")[11].classList.add("is-offen");
</script>''','''# Bettkarte

Eine Bettkarte zeigt auf einen Blick, wer im Bett liegt und was heute zu beachten ist.

**Aufbau** (`bett-breite` 152 × `bett-hoehe` 88 dp, `radius-m`): oben links die Bettnummer (`nummer`), oben rechts Status-Wort und -Symbol; Mitte der Vorname groß (`name-bett`, eine Zeile, Kürzung mit …); unten Nächte in dieser Saison und die Symbolreihe (18 dp).

| Status | Füllung | Kante | Symbol | Text | zählt als frei |
| --- | --- | --- | --- | --- | --- |
| frei | `frei-flaeche` | 2 dp `frei` | `plus` | „frei“, „Gast aufnehmen“ | ja |
| erwartet | `erwartet-flaeche` | 2 dp `blau` | `erwartet` | „erwartet“, Name | nein |
| anwesend | `anwesend` | – | `anwesend` | Name in `auf-anwesend` | nein |
| freigehalten bis | `gehalten-flaeche` | 2 dp `linie-stark` | `schloss` | „bis 18.11.“ | nein |
| frei bis | `frei-flaeche` | 2 dp `frei` | `rueckkehr` | „frei bis 20.11.“, „Leon kommt zurück“ | ja |
| deaktiviert | Schraffur `aus-schraffur` auf `aus-flaeche` | 1,5 dp | `deaktiviert` | „aus“ | nicht gezählt |

**Symbolreihe**, in dieser Reihenfolge: `laeuseschein-fehlt` (oder `warnung` ab Tag 3), `karte-rot`, `karte-gelb`, `notiz`, `dusche`. Höchstens vier; das fünfte wird zu „+1“.
- Läuseschein seit 3 Tagen überfällig: zusätzlich Ring 2 dp `warnung` außen um die Karte (`is-warn`) und der Klartext in der Schnellauswahl.
- Farbe steht nie allein: jeder Status hat ein Wort oder Symbol, jede Karte eine `contentDescription` („Bett D4, erwartet, Max, Duschslot 20:30“).
- Geöffnet (Detailbereich zeigt diesen Gast): Ring 3 dp `fokus` mit 3 dp Abstand.

**Bedienung:** Tipp auf frei → „Gast aufnehmen“; Tipp auf erwartet → Schnellauswahl „Ist da / Nicht da / Details“; Tipp auf anwesend → Detailbereich. Langes Drücken → Ziehen (siehe Umziehen und Tauschen).
''')

comp("Stockbett","Bettenplan",270,'''<div class="nu nu-vorschau" id="v"></div>
<script>
function stock(a,b){return '<div class="nu-stockbett"><div class="nu-stockbett-teil"><span>oben</span>'+Nu.bett(a)+'</div><div class="nu-stockbett-teil"><span>unten</span>'+Nu.bett(b)+'</div></div>';}
document.getElementById("v").innerHTML=stock({nr:"D2",s:"anwesend",name:"Tom",naechte:44,symbole:["notiz"]},{nr:"D3",s:"frei"})+stock({nr:"B3",s:"erwartet",name:"Lukas",naechte:3},{nr:"B4",s:"gehalten",name:"Erik",bis:"16.11."});
</script>''','''# Stockbett

Zwei Bettkarten übereinander in einem gemeinsamen Rahmen; oben die kleinere Nummer.

- Rahmen `flaeche-3`, Innenabstand 8 dp, Radius `radius-m` + 4. Über jeder Karte klein „oben“ / „unten“ (12 sp, Versalien).
- Jede Hälfte ist eine eigenständige Bettkarte mit eigenem Status; Ziehen und Tauschen gehen auch zwischen oben und unten.
- Im Datenmodell sind es zwei Zeilen in „Betten“ mit derselben `zimmer_id` und `pos_x`, `pos_y` übereinander.
''')

comp("Zimmerrahmen","Bettenplan",300,'''<div class="nu nu-vorschau" id="v" style="flex-wrap:nowrap"></div>
<script>
var B=Nu.bett;
document.getElementById("v").innerHTML='<section class="nu-zimmer"><div class="nu-zimmer-kopf"><span class="nu-zimmer-name">Zimmer B</span><span class="nu-zimmer-frei">1 von 4 frei</span></div><div class="nu-zimmer-betten">'+B({nr:"B1",s:"anwesend",name:"Tim",naechte:1})+B({nr:"B2",s:"frei"})+'</div><div class="nu-zimmer-betten">'+B({nr:"B3",s:"erwartet",name:"Lukas",naechte:3})+B({nr:"B4",s:"anwesend",name:"Erik",naechte:15})+'</div></section>'+
'<section class="nu-zimmer is-aus" style="min-width:340px"><div class="nu-zimmer-kopf"><span class="nu-zimmer-name">Zimmer F</span><span class="nu-zimmer-frei">aus bis 01.11.</span></div><div class="nu-zimmer-betten">'+B({nr:"F1",s:"aus"})+B({nr:"F2",s:"aus"})+'</div></section>';
</script>''','''# Zimmerrahmen

Ein Zimmer ist ein Rahmen mit Namen; darin liegen die Bettkarten grob wie im Grundriss.

- Rahmen `flaeche`, `radius-l`, Innenabstand 12 dp, Lücke zwischen Karten `abstand-3` (12 dp). Kopf: Zimmername in `ueberzeile` (`tinte-2`), rechts „1 von 4 frei“ in `nummer`.
- Geteilte Räume (zwei Räume mit einem Namen, z. B. Zimmer D) zeigen Teilflächen in `flaeche-2` innerhalb eines Rahmens.
- Deaktiviertes Zimmer: ganzer Rahmen schraffiert (`aus-schraffur` auf `aus-flaeche`), Kopf „aus bis 01.11.“; Betten darin sind nicht antippbar und zählen nicht.
- Die Anordnung der Rahmen wird in den Einstellungen per Ziehen festgelegt (`pos_x`, `pos_y` in „Betten“, `reihenfolge` in „Zimmer“).
''')

comp("AmpelKennzahlen","Bettenplan",230,'''<div class="nu nu-vorschau nu-vorschau--spalte">
<div class="nu-kennzahlen" style="width:100%"><span class="nu-ampel" data-s="gruen"><span class="nu-ampel-licht">5</span><span class="nu-ampel-wort">5 Betten frei<small>Ampel grün · beide Standorte</small></span></span><span class="nu-kennzahl">Belegung<b>17 von 24 · 2 erwartet</b></span><span class="nu-kennzahl">St. Nikolaus<b>6 von 8</b></span><span class="nu-kennzahl">KHT-Nummer<b>5</b></span><span style="flex:1"></span><button class="nu-btn nu-btn--rahmen nu-btn--klein"><i data-icon="telefon"></i>An KHT gemeldet</button></div>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<span class="nu-ampel" data-s="gelb"><span class="nu-ampel-licht">2</span><span class="nu-ampel-wort">2 Betten frei<small>Ampel gelb</small></span></span>
<span class="nu-ampel" data-s="gelb"><span class="nu-ampel-licht">1</span><span class="nu-ampel-wort">1 Bett frei<small>Ampel gelb</small></span></span>
<span class="nu-ampel" data-s="rot"><span class="nu-ampel-licht">0</span><span class="nu-ampel-wort">Kein Bett frei<small>Ampel rot</small></span></span>
<span class="nu-pille nu-pille--frei"><i data-icon="check" class="klein"></i>An KHT gemeldet 19:10</span>
</div></div>''','''# Ampel und Kennzahlen

Die Leiste über dem Plan zeigt die Zahl freier Betten, die Belegung und den Stand der KHT-Meldung.

- **Ampel**: Kreis 44 dp mit der Zahl (`zahl-gross` in 22 sp), daneben das Wort. Grün ab 3 frei (`ampel-gruen`), gelb bei 1–2 (`ampel-gelb`, Zahl in `auf-gelb`), rot bei 0 (`ampel-rot`). Schwellen in den Einstellungen. Die Ampel enthält nur Zahlen, nie Namen.
- Freie Betten = aktive Betten beider Standorte minus anwesend, erwartet und freigehalten.
- **Belegungszeile**: „17 von 24 · 2 erwartet“; St. Nikolaus als eigene Zahl.
- **KHT-Nummer** wird aus den freien Betten übernommen und ist antippbar zum Überschreiben (Zahlenfeld). „An KHT gemeldet“ setzt KHT im Bericht auf Ja und wird zur Pille „An KHT gemeldet 19:10“.
- Ampelwechsel: Farbe blendet in `dauer-mittel` über, die Zahl springt.
''')

comp("Schnellauswahl","Bettenplan",360,'''<div class="nu nu-vorschau" style="position:relative;min-height:330px;gap:200px">
<div style="position:relative"><div id="b1"></div><div class="nu-schnell" style="left:0;top:100px;--ursprung:20% 0">
<div class="nu-schnell-kopf"><b>Max</b><span>D4 · erwartet</span></div>
<button class="nu-btn nu-btn--primaer"><i data-icon="anwesend"></i>Ist da</button>
<button class="nu-btn"><i data-icon="abwesend"></i>Nicht da</button>
<button class="nu-btn"><i data-icon="person"></i>Details</button>
</div></div>
<div style="position:relative"><div id="b2"></div><div class="nu-schnell" style="left:0;top:100px;--ursprung:20% 0">
<div class="nu-schnell-kopf"><b>Bett B2</b><span>frei</span></div>
<button class="nu-btn nu-btn--primaer"><i data-icon="person-plus"></i>Gast aufnehmen</button>
<button class="nu-btn"><i data-icon="umziehen"></i>Gast hierher umziehen</button>
</div></div></div>
<script>document.getElementById("b1").innerHTML=Nu.bett({nr:"D4",s:"erwartet",name:"Max",naechte:12,dusche:"20:30"});document.getElementById("b2").innerHTML=Nu.bett({nr:"B2",s:"frei"});document.querySelector("#b1 .nu-bett").classList.add("is-offen");document.querySelector("#b2 .nu-bett").classList.add("is-offen");Nu.mountIcons();</script>''','''# Schnellauswahl

Eine kleine Auswahl, die am angetippten Bett aufgeht, damit Check-in und Aufnahme in höchstens drei Tipps gehen.

- Breite 300 dp, `flaeche`, `radius-l`, `schatten-schwebend`. Erscheint unter der Karte (oder darüber, wenn unten kein Platz ist) und wächst aus ihr heraus (`dauer-kurz`).
- Kopf: Name in `name-bett`, daneben „D4 · erwartet“ in `nummer`.
- **Erwartetes Bett**: „Ist da“ (Hauptknopf), „Nicht da“, „Details“. Nach „Ist da“ zeigt dieselbe Auswahl: „Bett dauerhaft behalten“ (an), „Abwesenheit eintragen“, „Auszug: frei ab …“, „Duschslot wählen“, „Fertig“.
- **Freies Bett**: „Gast aufnehmen“, „Gast hierher umziehen“.
- Der Status des Vorabends ist vorgeschlagen und bleibt änderbar.
- Offene Erinnerungen stehen als Warnzeile oben in der Auswahl („Läuseschein fehlt seit 3 Tagen“).
- Schließt mit Tipp daneben, Esc oder nach erledigter Handlung. Das Bett behält dann `is-gesetzt` für die Bestätigung.
''')
