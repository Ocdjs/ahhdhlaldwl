# Änderungsrunde 2: St. Pius als Grundriss, KHT-Regel, „fehlt“, gleiche Vornamen, Dauer ohne Enddatum,
# Hausordnung zweispaltig, Datenschutz nur Gast, Sanktion für genau eine Person, 7-Tage-Kalender,
# Betten einzeln sperren, Gästedatenbank mit Dokumenten.
from comps1 import COMPS
GRH = open('gen/grundriss_helper.html').read()

def ersetze(name, **kw):
    for c in COMPS:
        if c['name'] == name:
            c.update(kw); return
    raise KeyError(name)

def neu_nach(nach, name, group, height, html, readme, width=None, subtitle=""):
    i = [c['name'] for c in COMPS].index(nach)
    COMPS.insert(i + 1, dict(name=name, group=group, height=height, width=width, html=html, readme=readme, subtitle=subtitle))

RAIL5 = '''<nav class="nu-leiste" aria-label="Bereiche">
  <div class="nu-leiste-marke"><i data-icon="bett"></i></div>
  <button class="nu-nav" aria-current="page"><span class="nu-nav-ind"><i data-icon="bett"></i></span>Betten&shy;plan</button>
  <button class="nu-nav"><span class="nu-nav-ind"><i data-icon="personen"></i></span>Gäste</button>
  <button class="nu-nav"><span class="nu-nav-ind" style="position:relative"><i data-icon="bericht"></i><span style="position:absolute;top:2px;right:12px;width:10px;height:10px;border-radius:50%;background:var(--warnung)"></span></span>Dienst &amp; Bericht</button>
  <button class="nu-nav"><span class="nu-nav-ind"><i data-icon="kalender"></i></span>Kalender</button>
  <button class="nu-nav"><span class="nu-nav-ind"><i data-icon="regler"></i></span>Einstel&shy;lungen</button>
</nav>'''
KOPF2 = '''<header class="nu-kopf">
  <div class="nu-datum"><button class="nu-iconbtn" aria-label="Vortag"><i data-icon="zurueck"></i></button><div class="nu-datum-text">Freitag, 2. Oktober<small>Dienst 18:45 – 08:00</small></div><button class="nu-iconbtn" aria-label="Folgetag" disabled><i data-icon="weiter"></i></button></div>
  <span class="nu-kopf-raum"></span>
  <button class="nu-sync" data-s="ok"><i data-icon="wolke-ok"></i>Synchronisiert 21:00</button>
  <button class="nu-iconbtn nu-iconbtn--fl" aria-label="3 offene Erinnerungen"><i data-icon="glocke"></i><span class="nu-zaehler">3</span></button>
  <div class="nu-dienst"><button class="nu-person" aria-pressed="true"><span class="nu-kuerzel">JO</span>Jonas</button><button class="nu-person" aria-pressed="false"><span class="nu-kuerzel">SI</span>Silke</button></div>
</header>'''
KENNZAHLEN = '''<div class="nu-kennzahlen"><span class="nu-ampel" data-s="gruen"><span class="nu-ampel-licht">5</span><span class="nu-ampel-wort">5 Betten frei<small>Ampel grün · ohne Notbett</small></span></span><button class="nu-kht"><small>Für das Kältehilfetelefon</small><b>24 belegt · 29 gesamt</b><small>beide Standorte · antippen für Rechnung</small></button><span class="nu-kennzahl">St. Pius<b>11 da · 4 erwartet</b></span><span class="nu-kennzahl">St. Nikolaus<b>7 von 7</b></span></div>'''
PLAETZE_JS = '''function plaetze(){var B=Nu.bett;return '<div class="nu-plaetze"><div class="nu-plaetze-titel">Loggien<span>1 von 5 frei</span></div>'+B({nr:"L1",s:"anwesend",name:"Emil",naechte:6})+B({nr:"L2",s:"fehlt",name:"Kasia",naechte:2})+B({nr:"L3",s:"frei"}).replace("<span>Gast aufnehmen</span>","<span>Loggia · Notbett</span>")+B({nr:"L4",s:"anwesend",name:"Jana",naechte:5})+B({nr:"L5",s:"anwesend",name:"Ali",naechte:5})+
'<div class="nu-plaetze-titel">Esszimmer<span>1 von 1 frei</span></div>'+B({nr:"E1",s:"frei"}).replace("<span>Gast aufnehmen</span>","<span>Esszimmer · Notbett</span>")+'<div class="nu-plaetze-titel">Tiny House<span>0 von 1 frei</span></div>'+B({nr:"TH1",s:"anwesend",name:"Ole",naechte:9})+'</div>';}'''

# ---------------------------------------------------------------- Grundgerüst
ersetze("Navigationsleiste", html=f'''<div class="nu" style="height:600px;width:104px;display:flex">{RAIL5}</div>''', readme='''# Navigationsleiste

Die Leiste links ist immer sichtbar und führt in die fünf Bereiche.

- Breite `leiste-breite` (104 dp), Grund `flaeche-2`. Ziele 88 × 76 dp, Symbol 24 dp über dem Wort (13 sp, 600).
- Gewählt: Pille 64 × 36 dp in `primaer`, Symbol in `auf-primaer`, Wort in `tinte`. Nie nur die Farbe des Symbols ändern.
- Reihenfolge: **Bettenplan, Gäste, Dienst & Bericht, Kalender**; Einstellungen unten, getrennt durch freien Raum.
- **Gäste** (Gästedatenbank) braucht keine Admin-PIN: Der Dienst holt dort Unterschriften nach und hinterlegt Dokumente. Löschen und Korrekturen an Stammdaten bleiben hinter der PIN.
- Einstellungen fragen beim Öffnen die Admin-PIN ab.
- Ein offener Bericht ohne Abschluss zeigt am Symbol „Dienst & Bericht“ einen Punkt in `warnung`.
- Hardware-Tastatur: Alt + 1 bis Alt + 5 springen in die Bereiche.
- Compose: `NavigationRail` mit `NavigationRailItem`, `indicatorColor = primaer`. Unter 900 dp Breite wird daraus eine `NavigationBar` unten.
''')

ersetze("Kopfzeile", html=f'''<div class="nu" style="width:1176px">{KOPF2}</div>''', readme='''# Kopfzeile

Die Kopfzeile zeigt in jedem Bereich, welcher Diensttag gilt, ob Daten abgeglichen sind, was erinnert werden muss und wer Dienst hat.

- Höhe `kopf-hoehe` (72 dp), Grund `grund`, keine Linie darunter.
- **Datumswahl** links: Pfeil zurück, Datum, Pfeil vor (je 48 dp). Standard ist der laufende Diensttag (Tageswechsel 12:00).
- **Nie in die Zukunft:** Der Pfeil nach rechts endet beim heutigen Diensttag und ist dort gesperrt. Was kommt, steht im Kalender (Dienste, Termine, 7-Tage-Ansicht) und im Duschplan (eigene Tagesauswahl bis 3 Tage voraus). Wie lange ein Bett frei ist, zeigt die Bettkarte („bis 08.10.“).
- **Vergangene Tage** zeigen die Belegung jener Nacht, daneben die Pille „Nur lesen“ (`nu-nurlesen`, Symbol `schloss`); niemand ist dort „erwartet“. Änderungen nur als Nachtrag.
- **Abgleich** (`nu-sync`): siehe Baustein Abgleich.
- **Glocke**: Zähler (`nu-zaehler`, Grund `warnung`) für offene Erinnerungen: Läuseschein, Gast fehlt die 2. Nacht, neue Hinweise, Duschslots. Tipp öffnet die Liste.
- **Dienstpersonen** rechts als Chips mit Kürzel. Bei zwei Personen ist genau eine „aktiv“ (Rahmen `tinte`, Kürzel in `primaer`): sie wird bei Notizen, Unterschriften und Änderungen eingetragen. Ein Tipp wechselt.
''')

ersetze("AppGeruest", html=('''<div class="nu nu-app" style="height:800px;width:1280px">
__RAIL__
__KOPF__
<main class="nu-inhalt" style="display:grid;gap:12px;align-content:start">
  __KZ__
  <div style="display:flex;align-items:center;gap:12px"><div class="nu-reiter" role="tablist"><button role="tab" aria-selected="true"><i data-icon="haus" class="klein"></i>St. Pius <span class="n">7 frei</span></button><button role="tab" aria-selected="false"><i data-icon="standort-2" class="klein"></i>St. Nikolaus <span class="n">7/7</span></button></div><span style="flex:1"></span><button class="nu-btn nu-btn--primaer"><i data-icon="person-plus"></i>Gast aufnehmen</button></div>
  <div class="nu-plan-raster"><div class="nu-plan-karte" id="gr"></div><div id="pl"></div></div>
</main>
</div>
__GRH__
<script>
__PL__
document.getElementById("gr").innerHTML=grundriss(BEISPIEL);document.getElementById("pl").innerHTML=plaetze();Nu.mountIcons();
</script>''').replace('__RAIL__', RAIL5).replace('__KOPF__', KOPF2).replace('__KZ__', KENNZAHLEN).replace('__GRH__', GRH).replace('__PL__', PLAETZE_JS), readme='''# App-Gerüst

Das Gerüst jeder Ansicht im Querformat: Navigationsleiste links, Kopfzeile oben, Inhalt darunter, Detailbereich bei Bedarf rechts.

- Raster für 10–12-Zoll-Tablets im Querformat (z. B. 1280 × 800 dp): Leiste `leiste-breite` 104 dp, Kopf `kopf-hoehe` 72 dp, Inhalt mit `abstand-4` (16 dp) Rand links und 20 dp rechts.
- **Bettenplan:** oben Ampel und KHT-Zahlen (bleiben beim Scrollen stehen), darunter die Reiter **St. Pius** und **St. Nikolaus** und „Gast aufnehmen“. St. Pius zeigt den Grundriss, rechts daneben Loggien, Esszimmer, Tiny House und weitere Plätze untereinander (`nu-plan-raster`: Plan flexibel, Spalte 176 dp).
- Der **Detailbereich** (`detail-breite` 460 dp) schiebt sich rechts über den Inhalt; der Plan bleibt links sichtbar und bedienbar (Bett antippen wechselt den Gast im Detailbereich).
- **Assistent** und **Dialoge** liegen über allem mit `abdunklung`.
- Unter 900 dp Breite (Hochformat, Handy): Navigation unten, Kennzahlen gestapelt, statt Grundriss die Zimmerrahmen untereinander, Detailbereich als Vollbild.
- Grundfarben: `grund` hinter allem, `flaeche` für Inhaltsblöcke, `flaeche-2` für Leiste und Felder. Abschnitte trennt Abstand, keine Linien.
- Nachtmodus („Nacht“-Werte) gilt automatisch von 20:00 bis 07:00 oder nach Systemeinstellung; umschaltbar in den Einstellungen.
''')

# ---------------------------------------------------------------- Bettenplan
ersetze("Bettkarte", height=660, html='''<div class="nu nu-vorschau nu-vorschau--spalte">
<div id="v" style="display:grid;grid-template-columns:repeat(4,max-content);gap:20px 16px"></div>
<b class="abschnitt" style="margin-top:8px">Kompakt im Grundriss (Einzelbett 150 × 64, Stockbett-Hälfte 74 × 78)</b>
<div id="k" style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap"></div>
</div>
<script>
var L=[["frei",{nr:"B2",s:"frei"}],["erwartet",{nr:"D4",s:"erwartet",name:"Ali",naechte:12,dusche:"20:30"}],["anwesend",{nr:"D1",s:"anwesend",name:"Jonas",naechte:21}],["freigehalten bis",{nr:"D6",s:"gehalten",name:"Petra",bis:"06.10."}],
["fehlt, 1. Nacht (zählt belegt)",{nr:"L2",s:"fehlt",name:"Kasia",naechte:2}],["fehlt, 2. Nacht (zählt frei)",{nr:"F2",s:"fehlt2",name:"Ben",fehltN:2}],["frei bis Rückkehr",{nr:"T2",s:"freibis",name:"Hamid",bis:"08.10."}],["gesperrt",{nr:"F4",s:"aus"}],
["Läuseschein fehlt seit 3 Tagen",{nr:"T1",s:"anwesend",name:"Yusuf",naechte:3,symbole:["warnung"],warn:true}],["Gelbe Karte, Notiz",{nr:"D5",s:"anwesend",name:"Dimitri",naechte:9,symbole:["karte-gelb","notiz"]}],["Hausverbot",{nr:"B3",s:"erwartet",name:"Ion",naechte:2,symbole:["karte-rot"]}],["geöffnet",{nr:"F1",s:"anwesend",name:"Samir",naechte:20}]];
document.getElementById("v").innerHTML=L.map(function(x){return '<div style="display:grid;gap:8px"><span class="nu-beschr">'+x[0]+'</span>'+Nu.bett(x[1])+'</div>';}).join("");
document.querySelectorAll("#v .nu-bett")[11].classList.add("is-offen");
var K=[[150,64,{nr:"D1",s:"anwesend",name:"Jonas"}],[150,64,{nr:"D6",s:"gehalten",name:"Petra",bis:"06.10."}],[150,64,{nr:"B2",s:"frei"}],[74,78,{nr:"D4",s:"erwartet",name:"Ali"}],[74,78,{nr:"T1",s:"fehlt",name:"Yusuf",symbole:["warnung"],warn:true}],[74,78,{nr:"T2",s:"freibis",name:"Hamid",bis:"08.10."}],[74,78,{nr:"F2",s:"fehlt2",name:"Ben",fehltN:2}],[74,78,{nr:"D5",s:"anwesend",name:"Dimitri",symbole:["karte-gelb"]}],[74,78,{nr:"F4",s:"aus"}]];
document.getElementById("k").innerHTML=K.map(function(x){x[2].kompakt=true;return '<div class="nu-grundriss-platz" style="position:relative;width:'+x[0]+'px;height:'+x[1]+'px">'+Nu.bett(x[2])+'</div>';}).join("");
</script>''', readme='''# Bettkarte

Eine Bettkarte zeigt auf einen Blick, wer im Bett liegt und was heute zu beachten ist.

**Aufbau** (`bett-breite` 152 × `bett-hoehe` 88 dp, `radius-m`): oben links die Bettnummer (`nummer`), oben rechts Status-Wort und -Symbol; Mitte der Vorname groß (`name-bett`, eine Zeile, Kürzung mit …); unten Nächte in dieser Saison und die Symbolreihe (18 dp).

| Status | Füllung | Kante | Symbol | Text | für KHT |
| --- | --- | --- | --- | --- | --- |
| frei | `frei-flaeche` | 2 dp `frei` | `plus` | „frei“, „Gast aufnehmen“ | frei |
| erwartet | `erwartet-flaeche` | 2 dp `blau` | `erwartet` | „erwartet“, Name | belegt |
| anwesend | `anwesend` | – | `anwesend` | Name in `auf-anwesend` | belegt |
| fehlt (1. Nacht unentschuldigt) | `erwartet-flaeche` | 2 dp `warnung` | `abwesend` | „fehlt“, Name, „unentschuldigt“ | belegt |
| fehlt (ab 2. Nacht in Folge) | `frei-flaeche` | 2 dp `frei` | `abwesend` in `warnung` | „fehlt 2 N.“, „frei“, „Ben fehlt“ | frei |
| freigehalten bis | `gehalten-flaeche` | 2 dp `linie-stark` | `schloss` | „bis 06.10.“ | belegt |
| frei bis Rückkehr | `frei-flaeche` | 2 dp `frei` | `rueckkehr` | „bis 08.10.“, „Hamid kommt zurück“ | frei |
| gesperrt | Schraffur `aus-schraffur` auf `aus-flaeche` | 1,5 dp | `deaktiviert` | „aus“ | nicht gezählt |

Die Füllung folgt der Zählung: **grün heißt frei für das Kältehilfetelefon, blau heißt belegt.** Deshalb wird ein Bett, dessen Gast die 2. Nacht in Folge unentschuldigt fehlt, grün; der Name bleibt klein sichtbar.

**Kompakte Bettkarte** (`nu-bett--kompakt`) im Grundriss: füllt die gezeichnete Bettfläche; oben Nummer und Status-Symbol, Mitte der Name, unten „bis 08.10.“, „fehlt“ oder „fehlt 2 N.“ und höchstens zwei Symbole (Nächte und Notiz entfallen). Unter 80 dp Breite wird der Name 14,5 sp und das Wort „bis“ entfällt. Die Zielfläche bleibt mindestens 48 dp.

**Symbolreihe**, in dieser Reihenfolge: `laeuseschein-fehlt` (oder `warnung` ab Tag 3), `karte-rot`, `karte-gelb`, `notiz`, `dusche`. Höchstens vier; das fünfte wird zu „+1“.
- Läuseschein seit 3 Tagen überfällig: zusätzlich Ring 2 dp `warnung` außen um die Karte (`is-warn`) und der Klartext in der Schnellauswahl.
- Farbe steht nie allein: jeder Status hat ein Wort oder Symbol, jede Karte eine `contentDescription` („Bett T1 oben, fehlt unentschuldigt, zählt als belegt, Yusuf“).
- Geöffnet (Detailbereich zeigt diesen Gast): Ring 3 dp `fokus` mit 3 dp Abstand.

**Bedienung:** frei → „Gast aufnehmen“; erwartet → „Ist da / Nicht da / Details“; fehlt → „Ist doch da / Details“; fehlt ab 2. Nacht → „Gast aufnehmen / Ist doch da / Details“; anwesend → Detailbereich. Langes Drücken → Ziehen (siehe Umziehen und Tauschen).
''')

ersetze("Zimmerrahmen", html='''<div class="nu nu-vorschau" id="v" style="flex-wrap:nowrap"></div>
<script>
var B=Nu.bett;
document.getElementById("v").innerHTML='<section class="nu-zimmer"><div class="nu-zimmer-kopf"><span class="nu-zimmer-name">Zimmer B</span><span class="nu-zimmer-frei">1 von 4 frei</span></div><div class="nu-zimmer-betten">'+B({nr:"B1",s:"erwartet",name:"Mihai",naechte:1})+B({nr:"B2",s:"frei"})+'</div><div class="nu-zimmer-betten">'+B({nr:"B3",s:"fehlt",name:"Ion",naechte:4})+B({nr:"B4",s:"anwesend",name:"Olek",naechte:15})+'</div></section>'+
'<section class="nu-zimmer is-aus" style="min-width:340px"><div class="nu-zimmer-kopf"><span class="nu-zimmer-name">Zimmer F</span><span class="nu-zimmer-frei">gesperrt</span></div><div class="nu-zimmer-betten">'+B({nr:"F1",s:"aus"})+B({nr:"F2",s:"aus"})+'</div></section>';
</script>''', readme='''# Zimmerrahmen

Ein Zimmer als Rahmen mit Namen und Bettkarten: die Darstellung des Bettenplans auf schmalen Bildschirmen.

- Auf dem Tablet im Querformat zeigt der Bettenplan **den Grundriss** (siehe Grundriss). Zimmerrahmen gelten unter 900 dp Breite (Hochformat, Handy) und überall, wo Betten als Liste erscheinen (Einstellungen).
- Rahmen `flaeche`, `radius-l`, Innenabstand 12 dp, Lücke zwischen Karten `abstand-3` (12 dp). Kopf: Zimmername in `ueberzeile` (`tinte-2`), rechts „1 von 4 frei“ in `nummer`.
- Reihenfolge wie im Grundriss: Zimmer D, T-Zimmer, Zimmer B, Zimmer F, dann Loggien, Esszimmer, Tiny House, weitere Plätze.
- Gesperrtes Zimmer: ganzer Rahmen schraffiert (`aus-schraffur` auf `aus-flaeche`), Kopf „gesperrt“; Betten darin sind nicht antippbar und zählen nicht.
''')

neu_nach("Stockbett", "Grundriss", "Bettenplan", 880, '''<div class="nu" style="width:1240px;background:var(--grund);padding:20px">
<div class="nu-plan-raster"><div class="nu-plan-karte" id="gr"></div><div id="pl"></div></div></div>
__GRH__
<script>
__PL__
document.getElementById("gr").innerHTML=grundriss(BEISPIEL);document.getElementById("pl").innerHTML=plaetze();
</script>'''.replace('__GRH__', GRH).replace('__PL__', PLAETZE_JS), '''# Grundriss

St. Pius erscheint im Bettenplan als Grundriss des Stockwerks: Zimmer, Flure und Türen wie im echten Haus, die Betten als kompakte Bettkarten an ihrer Stelle.

**Aufbau**
- Zeichenfläche in Grundriss-Einheiten (viewBox −10 −10 971 800, Seitenverhältnis 971 : 800). Maßstab = verfügbare Breite ÷ 971; bei 1280 dp Bildschirm etwa 0,95.
- Wände 6 Einheiten `tinte`, Türen als Bogen mit Blatt 1,5 Einheiten `tinte-3`. Räume ohne Tür (Privat) und das Bad: Fläche `flaeche-3`, Wort in Versalien, nicht antippbar.
- Zimmername (`ZIMMER D`, 14 sp, 700, Sperrung 0,08) mit „1 von 6 frei“ darunter (`nummer`, `tinte-3`) an fester Stelle im Raum.
- Betten: Einzelbett 150 × 64 (T3 senkrecht 70 × 150), Stockbett 80 × 160–170 mit Rahmen `flaeche-3`; oben die kleinere Nummer. Jede Bettfläche trägt eine kompakte Bettkarte (`nu-bett--kompakt`), positioniert in Prozent der Zeichenfläche, damit Text nicht mitskaliert.
- Rechts daneben die Spalte (176 dp) mit gleich großen Bettkarten untereinander: **Loggien** L1–L5, **Esszimmer** E1, **Tiny House** TH1, **Weitere Plätze** Z1 … (in den Einstellungen frei benannt). Jede Gruppe mit Titel und „x von y frei“.
- Notbetten (L3, E1) tragen „Notbett“ in der Fußzeile.

**Zustände**
- Gesperrtes Zimmer: Boden schraffiert, Text „gesperrt“, Betten „aus“.
- Sind T-Zimmer und Zimmer F beide gesperrt, wird auch Flur 2 schraffiert („FLUR GESPERRT“).
- St. Nikolaus: Saal 380 × 440 Einheiten, acht senkrechte Betten in zwei Reihen, höchstens 460 dp breit.

**Bedienung** wie bei jeder Bettkarte: antippen, lange drücken und ziehen. Der Plan scrollt unter den stehenden Kennzahlen.

**Compose:** `BoxWithConstraints` mit `aspectRatio(971f / 800f)`; Wände und Türen in einem `Canvas` (`drawPath`, `drawArc`), Betten als eigene Composables mit `Modifier.offset`/`size` aus Grundriss-Einheiten × Maßstab. Die Geometrie gehört in die Datenbank (Tabelle „Betten“: `x`, `y`, `breite`, `hoehe`, `stock_id`; Tabelle „Zimmer“: `boden`, `label_x`, `label_y`), damit ein späterer Umbau ohne App-Update geht. Unter 900 dp Breite: Zimmerrahmen statt Grundriss.
''', width=1240, subtitle="St. Pius mit Loggien, Esszimmer und Tiny House")

ersetze("AmpelKennzahlen", height=330, html='''<div class="nu nu-vorschau nu-vorschau--spalte">
__KZ__
<div style="display:flex;gap:12px;flex-wrap:wrap">
<span class="nu-ampel" data-s="gelb"><span class="nu-ampel-licht">2</span><span class="nu-ampel-wort">2 Betten frei<small>Ampel gelb</small></span></span>
<span class="nu-ampel" data-s="rot"><span class="nu-ampel-licht">0</span><span class="nu-ampel-wort">Kein Bett frei<small>Ampel rot</small></span></span>
</div>
<div class="nu-bericht" style="width:640px;gap:10px;padding:18px"><b>Zahlen für das Kältehilfetelefon</b>
<div class="nu-zeile"><i data-icon="anwesend"></i><div><b>Belegt: 24</b><small>anwesend 18 · erwartet 4 · freigehalten 1 · fehlt 1. Nacht: L2 Kasia</small></div></div>
<div class="nu-zeile"><i data-icon="plus"></i><div><b>Frei: 5</b><small>frei: D3, B2, F4 · frei bis Rückkehr: T2 Hamid · fehlt 2 Nächte: F2 Ben</small></div></div>
<div class="nu-zeile"><i data-icon="info"></i><div><b>Nicht gezählt</b><small>Notbett: L3, E1 · gesperrt: N4</small></div></div></div>
</div>'''.replace('__KZ__', KENNZAHLEN), readme='''# Ampel und KHT-Zahlen

Die Leiste über dem Plan zeigt die Ampel und die Zahlen, die das Kältehilfetelefon (KHT) bekommt.

**KHT-Zahlen** (`nu-kht`, antippbar): „24 belegt · 29 gesamt“. Rechnung (siehe Fachregeln):
- **Gesamt** = alle Betten in Betrieb in St. Pius und St. Nikolaus, **ohne Notbett** und ohne gesperrte Betten.
- **Belegt** = anwesend + erwartet + freigehalten + **fehlt in der 1. Nacht unentschuldigt**. Wer zwei Nächte in Folge unentschuldigt fehlt, zählt ab der 2. Nacht nicht mehr.
- **Frei** = Gesamt − Belegt (frei, frei bis Rückkehr, fehlt ab 2. Nacht).
- Tipp öffnet ein Blatt mit der Rechnung Bett für Bett, damit niemand nachzählen muss, wenn KHT anruft.

**Ampel**: Kreis 44 dp mit der Zahl freier Betten (gleiche Rechnung), daneben das Wort. Grün ab 3 frei (`ampel-gruen`), gelb bei 1–2 (`ampel-gelb`, Zahl in `auf-gelb`), rot bei 0 (`ampel-rot`). Schwelle in den Einstellungen. Die Ampel ist ein eigenes Meldesystem, getrennt vom Anruf: Gemeldet werden frei, belegt und gesamt, nie Namen.

- Standortzahlen daneben: „St. Pius 11 da · 4 erwartet“, „St. Nikolaus 7 von 7“.
- Es gibt keinen Knopf „An KHT gemeldet“ mehr. Ob KHT angerufen hat, steht im Bericht („Hat KHT angerufen?“).
- Ampelwechsel: Farbe blendet in `dauer-mittel` über, die Zahl springt.
''', subtitle="Rechnung zum Antippen")

ersetze("Schnellauswahl", height=440, html='''<div class="nu nu-vorschau" style="position:relative;min-height:410px;gap:24px;flex-wrap:nowrap;align-items:flex-start">
<div style="position:relative;width:310px"><div id="b1"></div><div class="nu-schnell" style="left:0;top:100px;--ursprung:20% 0">
<div class="nu-schnell-kopf"><b>Ion</b><span>B3 · erwartet</span></div>
<div class="nu-zeile nu-zeile--warnung"><i data-icon="abwesend"></i><div><b>Fehlte gestern unentschuldigt</b><small>Fehlt Ion heute wieder, zählt das Bett ab heute als frei.</small></div></div>
<button class="nu-btn nu-btn--primaer"><i data-icon="anwesend"></i>Ist da</button>
<button class="nu-btn"><i data-icon="abwesend"></i>Nicht da</button>
<button class="nu-btn"><i data-icon="person"></i>Details</button></div></div>
<div style="position:relative;width:310px"><div id="b2"></div><div class="nu-schnell" style="left:0;top:100px;--ursprung:20% 0">
<div class="nu-schnell-kopf"><b>Kasia</b><span>L2 · fehlt</span></div>
<div class="nu-zeile nu-zeile--warnung"><i data-icon="abwesend"></i><div><b>Fehlt unentschuldigt, 1. Nacht</b><small>Zählt für das Kältehilfetelefon weiter als belegt.</small></div></div>
<button class="nu-btn nu-btn--primaer"><i data-icon="anwesend"></i>Ist doch da</button>
<button class="nu-btn"><i data-icon="person"></i>Details</button></div></div>
<div style="position:relative;width:310px"><div id="b3"></div><div class="nu-schnell" style="left:0;top:100px;--ursprung:20% 0">
<div class="nu-schnell-kopf"><b>Bett F2</b><span>frei</span></div>
<div class="nu-zeile nu-zeile--warnung"><i data-icon="abwesend"></i><div><b>Ben fehlt die 2. Nacht in Folge</b><small>Unentschuldigt. Das Bett zählt als frei und darf vergeben werden.</small></div></div>
<button class="nu-btn nu-btn--primaer"><i data-icon="person-plus"></i>Gast aufnehmen</button>
<button class="nu-btn"><i data-icon="anwesend"></i>Ben ist doch da</button></div></div>
</div>
<script>document.getElementById("b1").innerHTML=Nu.bett({nr:"B3",s:"erwartet",name:"Ion",naechte:4});document.getElementById("b2").innerHTML=Nu.bett({nr:"L2",s:"fehlt",name:"Kasia",naechte:2});document.getElementById("b3").innerHTML=Nu.bett({nr:"F2",s:"fehlt2",name:"Ben",fehltN:2});document.querySelectorAll(".nu-bett").forEach(function(b){b.classList.add("is-offen")});Nu.mountIcons();</script>''', readme='''# Schnellauswahl

Eine kleine Auswahl, die am angetippten Bett aufgeht, damit Check-in und Aufnahme in höchstens drei Tipps gehen.

- Breite 300 dp, `flaeche`, `radius-l`, `schatten-schwebend`. Erscheint unter der Karte (oder darüber, wenn unten kein Platz ist) und wächst aus ihr heraus (`dauer-kurz`).
- Kopf: Name in `name-bett`, daneben „D4 · erwartet“ in `nummer`.
- **Erwartet**: „Ist da“ (Hauptknopf), „Nicht da“, „Details“. Nach „Ist da“: „Bett dauerhaft behalten“, „Duschslot wählen“, „Abwesenheit“, „Fertig“.
- **„Nicht da“** fragt nach: „Ion ist nicht gekommen?“ mit „Weiter warten“, „Hat sich abgemeldet“ (öffnet Abwesenheit, Bett freihalten oder frei bis Rückkehr) und „Fehlt unentschuldigt“ (Hauptknopf). Der Dialogtext sagt, was mit der Zählung passiert: 1. Nacht bleibt belegt, ab der 2. Nacht in Folge frei.
- **Fehlt (1. Nacht)**: „Ist doch da“, „Details“.
- **Fehlt ab 2. Nacht**: Das Bett gilt als frei: „Gast aufnehmen“, „Ben ist doch da“, „Details Ben“. Wird das Bett neu vergeben, bekommt Ben eine Notiz und bleibt in der Gästedatenbank.
- **Frei**: „Gast aufnehmen“. **Frei bis Rückkehr**: dazu „Details“ des abwesenden Gastes.
- Offene Erinnerungen stehen als Warnzeile oben (Läuseschein, „fehlte gestern unentschuldigt“).
- Schließt mit Tipp daneben, Esc oder nach erledigter Handlung. Das Bett behält dann `is-gesetzt` für die Bestätigung.
''', width=1000)

ersetze("Gastdetails", html='''<div class="nu" style="display:flex;justify-content:flex-end;background:var(--grund);height:800px;padding:0"><aside class="nu-detail" aria-label="Gastdetails">
<div class="nu-detail-kopf"><div style="flex:1"><span class="nr">L5</span><h2>Ali (L5)</h2><p>Aufnahme 2026-27-0018 · anwesend · 5 Nächte</p></div><button class="nu-iconbtn nu-iconbtn--fl" aria-label="Schließen"><i data-icon="schliessen"></i></button></div>
<div class="nu-detail-inhalt">
 <section class="nu-abschnitt"><h3>Stammdaten</h3><dl class="nu-daten"><dt>Vorname</dt><dd>Ali</dd><dt>Nachname</dt><dd>–</dd><dt>Spitzname</dt><dd>–</dd><dt>Sprache</dt><dd>Farsi</dd><dt>Erste Aufnahme</dt><dd>12.09.2026</dd></dl></section>
 <section class="nu-abschnitt"><h3>Aufenthalt</h3><dl class="nu-daten"><dt>Bett</dt><dd>L5 · Loggia</dd><dt>Status</dt><dd>anwesend</dd><dt>Dauer</dt><dd>mehrere Nächte, ohne Enddatum</dd><dt>Dusche heute</dt><dd>–</dd></dl></section>
 <section class="nu-abschnitt"><h3>Dokumente</h3><div class="nu-zeile nu-zeile--warnung"><i data-icon="unterschrift"></i><div><b>Hausordnung noch nicht unterschrieben</b><small>Kann jederzeit nachgeholt werden.</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="stift"></i>Jetzt</button></div><button class="nu-btn nu-btn--rahmen nu-btn--klein" style="justify-self:start"><i data-icon="personen"></i>In der Gästedatenbank öffnen</button></section>
 <section class="nu-abschnitt"><h3>Sanktionen</h3><p class="nu-beschr">Keine Einträge.</p></section>
 <section class="nu-abschnitt"><h3>Notizen</h3>
  <div class="nu-notiz">Im Vorfall erwähnt: Gelbe Karte für Dimitri (D5), Streit im Flur.<small>01.10. · Jonas · aus Bericht vom 01.10. · erwähnt, keine Sanktion</small></div>
  <button class="nu-btn nu-btn--rahmen nu-btn--klein" style="justify-self:start"><i data-icon="plus"></i>Notiz hinzufügen</button></section>
</div>
<div class="nu-detail-aktionen"><button class="nu-btn nu-btn--primaer"><i data-icon="notiz"></i>Notiz</button><button class="nu-btn"><i data-icon="abwesend"></i>Abwesenheit</button><button class="nu-btn"><i data-icon="tauschen"></i>Bett wechseln</button><button class="nu-btn"><i data-icon="dusche"></i>Duschslot</button><button class="nu-btn"><i data-icon="auszug"></i>Bett frei</button><button class="nu-btn nu-btn--gefahr"><i data-icon="karte-gelb"></i>Sanktion</button></div>
</aside></div>''', readme='''# Gastdetails

Der Detailbereich rechts zeigt alles zu einem Gast und bietet die Handlungen am Bett.

- Breite `detail-breite` (460 dp), Grund `flaeche`, links `radius-l`, gleitet mit `dauer-lang` und `kurve-eintritt` herein. Der Plan bleibt links bedienbar.
- **Kopf:** Bettnummer `nummer-gross`, Name `titel` (bei gleichem Vornamen mit Bettnummer: „Ali (L5)“), darunter Aufnahmenummer, Status, Nächte in `text-klein`. Schließen oben rechts (48 dp).
- **Warnzeilen** stehen ganz oben (`nu-zeile--warnung`): Läuseschein, fehlt unentschuldigt, Rückkehrtag. Hausverbot als `nu-zeile--vorfall`.
- **Abschnitte** in fester Reihenfolge: Stammdaten, Aufenthalt (mit Dauer: „1 Nacht“, „mehrere Nächte, ohne Enddatum“ oder „bis 09.10.“), Läuseschein, Dokumente, Sanktionen, Notizen.
- **Dokumente:** fehlt die Unterschrift, steht eine Warnzeile mit „Jetzt“; das startet den verkürzten Assistenten (Sprache, Hausordnung, Datenschutz, Abschluss). Darunter immer „In der Gästedatenbank öffnen“.
- **Notizen** chronologisch, neueste oben, mit Datum, Verfasser*in und Herkunft („aus Bericht vom 01.10. · erwähnt, keine Sanktion“).
- **Aktionen** unten fest (`flaeche-2`), zwei Spalten: Einchecken / Ist doch da / Notiz (je nach Status als Hauptknopf), Abwesenheit, Bett wechseln, Duschslot, **Bett frei**, Sanktion.
- **Bett frei** (früher „Auszug“) fragt nach: „Bett L5 freigeben? Ali zieht aus. Das Bett ist ab heute frei, Ali bleibt in der Gästedatenbank.“
- Vergangene Tage: Aktionen ausgeblendet, stattdessen „Nachtrag hinzufügen“.
''')

# ---------------------------------------------------------------- Aufnahme
DOKPAAR = '''<div class="nu-dokument-paar"><div class="nu-dokument" lang="de"><span class="nu-dokument-marke"><i data-icon="unterschrift" class="klein"></i>Deutsch · wird unterschrieben</span><h3>Hausordnung</h3><p style="margin:0">Willkommen, <mark>Ali</mark>. Dein Bett ist <mark>B2</mark> ab <mark>02.10.2026</mark>. Einlass ab 19:00 Uhr, Ruhe ab 22:00 Uhr. Rauchen, Alkohol und Drogen sind im Haus nicht erlaubt. Aufgenommen von <mark>Jonas</mark>.</p></div>
<div class="nu-dokument nu-dokument--uebersetzung" dir="rtl" lang="ar"><span class="nu-dokument-marke" dir="ltr" lang="de"><i data-icon="sprache" class="klein"></i>Übersetzung Arabisch · zum Verständnis</span><h3>قواعد البيت</h3><p style="margin:0">مرحبًا <mark>Ali</mark>. سريرك هو <mark>B2</mark> ابتداءً من <mark>02.10.2026</mark>. الدخول من الساعة 19:00، والهدوء من الساعة 22:00. التدخين والكحول والمخدرات ممنوعة داخل البيت. تم الاستقبال بواسطة <mark>Jonas</mark>.</p></div></div>'''

ersetze("Assistent", height=700, html='''<div class="nu" style="height:700px;width:1180px"><div class="nu-assistent">
<ol class="nu-schritte">
 <li class="nu-schritt is-fertig"><i>✓</i>Person</li><li class="nu-schritt is-fertig"><i>✓</i>Dauer</li><li class="nu-schritt is-fertig"><i>✓</i>Sprache</li>
 <li class="nu-schritt" aria-current="step"><i>4</i>Hausordnung</li><li class="nu-schritt"><i>5</i>Datenschutz</li><li class="nu-schritt"><i>6</i>Abschluss</li></ol>
<div class="nu-assistent-seite" style="display:grid;gap:18px;align-content:start">
 <h2 class="titel" style="margin:0">Hausordnung</h2>
 __DOK__
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <div class="nu-unterschrift is-gezeichnet is-bestaetigt"><div class="nu-unterschrift-kopf"><b>Gast: Ali</b><small>bestätigt 19:42</small></div><div class="nu-unterschrift-feld" style="height:150px"><span class="nu-unterschrift-marke"><i data-icon="check" class="klein"></i>Bestätigt</span><svg viewBox="0 0 300 150" style="position:absolute;inset:0;width:100%;height:100%"><path d="M40 100c20-30 30-50 40-30s-10 40 10 20 30-40 40-10 20 10 40-10 20-5 40 0" fill="none" stroke="var(--stift-tinte)" stroke-width="3" stroke-linecap="round"/></svg></div></div>
  <div class="nu-unterschrift"><div class="nu-unterschrift-kopf"><b>Betreuung: Jonas</b><small>noch offen</small></div><div class="nu-unterschrift-feld" style="height:150px"><span class="nu-unterschrift-hilfe">Mit Finger oder Stift unterschreiben</span></div></div>
 </div>
</div>
<div class="nu-assistent-fuss"><button class="nu-btn"><i data-icon="zurueck"></i>Zurück</button><span class="nu-beschr" style="align-self:center">Es fehlen Unterschriften.</span><button class="nu-btn nu-btn--primaer" disabled>Weiter<i data-icon="weiter"></i></button></div>
</div></div>'''.replace('__DOK__', DOKPAAR), readme='''# Assistent

Die Aufnahme eines neuen Gastes führt in sechs Schritten durch Person, Dauer, Sprache, Hausordnung, Datenschutz und Abschluss.

- Vollbild über dem Plan, Abdunklung dahinter. Links die **Schrittliste** (260 dp, `flaeche-2`): Nummer im Kreis, aktueller Schritt mit `primaer`-Kreis auf `flaeche`, erledigte mit ✓. Erledigte Schritte sind antippbar.
- Rechts der Schritt mit Titel `titel`; unten fest „Zurück“ (links), Zwischenstand-Hinweis, „Weiter“ (Hauptknopf, rechts). „Weiter“ ist gesperrt, bis der Schritt vollständig ist; der Grund steht daneben.
- **Person:** Suche mit Bettnummer je Treffer; bei gleichem Vornamen Hinweis „Es gibt schon 3 Personen mit dem Vornamen Ali: Ali (D4), Ali (L5), Ali (Haddad)“ (siehe Gästesuche).
- **Dauer:** „1 Nacht“ oder „Mehrere Nächte“; mehrere Nächte gelten ohne Enddatum, ein Schalter „Enddatum festlegen“ öffnet Datum und Schnellwahl (+3, +7, +14 Nächte). Siehe Auswahlkacheln.
- **Sprache** wählt die Übersetzung der Hausordnung.
- **Hausordnung:** deutsche Fassung links (wird unterschrieben), Übersetzung rechts daneben (zum Verständnis). Unterschriften: **Gast und Betreuung**.
- **Datenschutz:** nur auf Deutsch, Unterschrift **nur vom Gast**.
- **Abschluss:** Zusammenfassung mit Dauer, Anzeigename („Ali (B2)“, wenn der Vorname schon vorkommt), Übersetzung, Aufnahmenummer und PDF-Name.
- **Nachholen:** Aus Gastdetails oder Gästedatenbank startet derselbe Assistent verkürzt (Sprache, Hausordnung, Datenschutz, Abschluss) und legt das PDF in der Gästedatenbank ab.
- Jeder Zwischenstand wird sofort lokal gespeichert. „Abbrechen“ fragt nach. Übergang zwischen Schritten 32 dp in `dauer-mittel`; bei Arabisch und Farsi spiegelt sich nur das Übersetzungsblatt, nicht die App.
''', width=1180)

ersetze("Gaestesuche", height=520, html='''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:700px">
<div class="nu-feld" style="width:100%"><label for="q">Vorname, Nachname, Spitzname oder Bettnummer</label><div style="position:relative"><input class="nu-eingabe" id="q" value="Ali" style="padding-left:48px"><span style="position:absolute;left:14px;top:16px;color:var(--tinte-2)"><i data-icon="suche"></i></span></div></div>
<button class="nu-treffer is-verbot"><span class="nu-treffer-bett"><i data-icon="karte-rot"></i></span><div><b>Alex B.</b><small>Hausverbot bis 21.03. · Gewalt gegen einen anderen Gast</small></div></button>
<button class="nu-treffer"><span class="nu-treffer-bett">D4</span><div><b>Ali <span style="font-weight:400">„Professor“</span></b><small>Bett D4 · erwartet · Arabisch</small></div></button>
<button class="nu-treffer"><span class="nu-treffer-bett">L5</span><div><b>Ali</b><small>Bett L5 · da · Farsi</small></div></button>
<button class="nu-treffer"><span class="nu-treffer-bett is-leer">–</span><div><b>Ali Haddad</b><small>kein Bett · 14 Nächte · Arabisch</small></div></button>
<div class="nu-zeile" style="width:100%"><i data-icon="personen"></i><div><b>Es gibt schon 3 Personen mit dem Vornamen Ali</b><small>Ali (D4), Ali (L5), Ali (Haddad). Ist es dieselbe Person, oben auswählen. Sonst wird die neue Person mit ihrer Bettnummer angezeigt: Ali (B2).</small></div></div>
</div>''', readme='''# Gästesuche

Die Suche findet Gäste über Vorname, Nachname, Spitzname und Bettnummer, tolerant bei Tippfehlern, und warnt vor Hausverboten.

- Suchfeld mit Symbol `suche`, Treffer ab dem ersten Buchstaben, Ergebnis in unter einer Sekunde bei 2.000 Gästen.
- Trefferzeile (`nu-treffer`, 64 dp): links die **Bettnummer** als Marke (`nu-treffer-bett`, 52 × 40 dp, `nummer`), „–“ ohne Bett; daneben Name, Spitzname, Bett mit Status, Sprache.
- **Gleiche Vornamen unterscheidet die Bettnummer.** Anzeigename überall (Plan, Bericht, Erwähnung, Duschplan, Einblendungen): „Ali (D4)“. Ohne Bett: Nachname, dann Spitzname, dann Aufnahmenummer („Ali (Haddad)“).
- Wer beim Anlegen einen vorhandenen Vornamen eintippt, sieht sofort die Zeile „Es gibt schon … Personen mit dem Vornamen …“ mit allen Treffern.
- **Aktives Hausverbot steht immer oben**, mit `karte-rot`, Grund `vorfall-flaeche`, Rahmen `vorfall`. Aufnehmen nur mit Bestätigung und Begründung.
- Bekannte Personen werden nie doppelt angelegt; bei sehr ähnlichem Namen fragt die App „Meinst du …?“.
- Die gleiche Suche öffnet sich bei „@“ im Bericht, bei „Externe Gäste“ und in der Gästedatenbank.
''')

ersetze("Auswahlkacheln", height=500, html='''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:960px">
<b class="abschnitt">Geplante Dauer</b>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%">
<button class="nu-wahl" role="radio" aria-checked="false"><b>1 Nacht</b><span>Kein Läuseschein nötig</span></button>
<button class="nu-wahl" role="radio" aria-checked="true"><b>Mehrere Nächte</b><span>Ohne festes Enddatum, Bett wird blockiert, Läuseschein-Pflicht beginnt</span></button></div>
<div class="nu-einstellung" style="background:var(--flaeche-2);width:100%"><i data-icon="kalender"></i><div><b>Enddatum festlegen</b><small>Das Bett ist bis zum Abreisetag vergeben.</small></div><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Enddatum festlegen" id="sw"></button></div>
<div id="ende" style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap"><div class="nu-feld" style="width:240px"><label for="d">Abreise am</label><input class="nu-eingabe" id="d" type="date" value="2026-10-09"></div><div class="nu-checkliste" style="padding-bottom:4px"><button class="nu-chip">+3 Nächte</button><button class="nu-chip" aria-pressed="true">+7 Nächte</button><button class="nu-chip">+14 Nächte</button></div></div>
<b class="abschnitt">Sprache der Übersetzung</b>
<div style="display:grid;grid-template-columns:repeat(5,150px);gap:8px" id="sp"></div>
</div>
<script>var S=[["Deutsch","Deutsch"],["English","Englisch"],["Français","Französisch"],["Español","Spanisch"],["العربية","Arabisch"],["فارسی","Farsi"],["Polski","Polnisch"],["Română","Rumänisch"],["Български","Bulgarisch"],["Русский","Russisch"]];
document.getElementById("sp").innerHTML=S.map(function(s,i){return '<button class="nu-wahl" role="radio" style="min-height:72px;padding:10px 14px" aria-checked="'+(i===4)+'"><b style="font-family:'+(i===4||i===5?'var(--font-rtl)':'var(--font-dokument)')+'">'+s[0]+'</b><span>'+s[1]+'</span></button>';}).join("");
var sw=document.getElementById("sw");sw.onclick=function(){var an=sw.getAttribute("aria-checked")!=="true";sw.setAttribute("aria-checked",String(an));document.getElementById("ende").style.display=an?"flex":"none";sw.parentNode.querySelector("small").textContent=an?"Das Bett ist bis zum Abreisetag vergeben.":"Aus: bleibt bis auf Weiteres, ohne festes Enddatum.";};</script>''', readme='''# Auswahlkacheln

Große Auswahlflächen für Entscheidungen im Assistenten, die man mit dem Daumen trifft.

- `nu-wahl`: mindestens 96 dp hoch (Sprachen 72 dp), Grund `flaeche-2`, Titel `abschnitt`-Größe, Erklärung in `text-klein`. Gewählt: Grund `flaeche` und Rahmen 3 dp `tinte`, nie nur Farbe.
- **Dauer:** zwei Kacheln, „1 Nacht“ und „Mehrere Nächte“. „Mehrere Nächte“ gilt **ohne festes Enddatum** (bis auf Weiteres). Darunter die Schalterzeile „Enddatum festlegen“ (Standard: aus). Ist sie an, erscheinen das Datumsfeld „Abreise am“ (Standard heute + 7) und die Schnellwahl +3, +7, +14 Nächte. Das Enddatum bleibt so innerhalb der Option änderbar; eine eigene Kachel „Offen“ gibt es nicht mehr.
- Bei mehreren Nächten steht dabei, dass das Bett blockiert wird und die Läuseschein-Pflicht beginnt.
- **Sprache der Übersetzung:** Name in der eigenen Sprache und Schrift, darunter deutsch. Sie bestimmt nur die Übersetzung der Hausordnung; unterschrieben wird immer die deutsche Fassung, die Datenschutzerklärung bleibt deutsch. Die zuletzt genutzte Sprache des Gastes ist vorgewählt.
''', subtitle="Schalter „Enddatum festlegen“ zum Ausprobieren")

ersetze("Dokument", height=640, html=('''<div class="nu nu-vorschau nu-vorschau--spalte">
__DOK__
<div class="nu-dokument" lang="de" style="max-width:none"><span class="nu-dokument-marke"><i data-icon="unterschrift" class="klein"></i>Nur auf Deutsch · unterschreibt nur der Gast</span><h3>Datenschutzerklärung</h3><p style="margin:0">Wir speichern deinen Vornamen, auf Wunsch Nachnamen und Spitznamen, deine Sprache, dein Bett und deine Nächte, um die Notübernachtung zu organisieren. (Beispieltext, der endgültige Text kommt vom Träger.)</p></div>
</div>''').replace('__DOK__', DOKPAAR), readme='''# Dokument

Hausordnung und Datenschutzerklärung erscheinen als helles Blatt, damit sie wie Papier wirken und im PDF gleich aussehen.

- **Hausordnung zweispaltig** (`nu-dokument-paar`): links die deutsche Fassung mit der dunklen Marke „Deutsch · wird unterschrieben“, rechts direkt daneben die Übersetzung mit der umrandeten Marke „Übersetzung Arabisch · zum Verständnis“ (`nu-dokument--uebersetzung`, Grund `flaeche-2`). So ist klar, dass das deutsche Dokument unterschrieben wird. Bei Deutsch nur eine Spalte. Unter 900 dp Breite stehen beide untereinander, Deutsch zuerst.
- **Datenschutzerklärung nur auf Deutsch**, Marke „Nur auf Deutsch · unterschreibt nur der Gast“. Bei anderer Sprache eine Infozeile: „Bei Bedarf mündlich erklären.“
- Grund `papier` (auch nachts hell, leicht gedämpft), Text `auf-papier`, Schrift `dokument` (Noto Sans 17/28). Übersetzung Arabisch und Farsi: `dokument-rtl` (Noto Sans Arabic 19/32), `dir="rtl"`, rechtsbündig; die Marke bleibt deutsch und linksläufig.
- Eingesetzte Werte aus `{BETT}`, `{DATUM}`, `{GAST}`, `{BETREUER}` sind halbfett mit Unterstrich `papier-linie`. Zahlen und Bettnummern bleiben auch im rechtsläufigen Text lateinisch.
- Im PDF: Seite 1 Hausordnung deutsch mit beiden Unterschriften, Übersetzung als Anlage ohne Unterschrift; dann Datenschutz deutsch mit Unterschrift des Gastes (siehe Dokumente und PDF).
- Compose: zwei `Column` in einer `Row` mit `weight(1f)`; nur das Übersetzungsblatt in `CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl)`.
''', subtitle="Deutsch unterschreiben, Übersetzung daneben")

ersetze("Unterschriftsfeld", readme=COMPS[[c['name'] for c in COMPS].index("Unterschriftsfeld")]['readme'].replace(
    '- Kopf: wer unterschreibt („Gast: Ali“, „Betreuung: Jonas“) und wofür.',
    '- Kopf: wer unterschreibt („Gast: Ali“, „Betreuung: Jonas“) und wofür. Hausordnung: Gast und Betreuung nebeneinander. Datenschutz: nur der Gast (ein Feld, halbe Breite).'))

# ---------------------------------------------------------------- Gäste
neu_nach("Laeuseschein", "Gastakte", "Gäste", 760, '''<div class="nu" style="width:1160px;background:var(--grund);padding:20px;display:grid;grid-template-columns:380px minmax(0,1fr);gap:16px;align-items:start">
<div style="display:grid;gap:6px">
 <div style="position:relative"><input class="nu-eingabe" value="Ali" style="padding-left:48px" aria-label="Suchen"><span style="position:absolute;left:14px;top:16px;color:var(--tinte-2)"><i data-icon="suche"></i></span></div>
 <p class="nu-beschr">4 Personen · gleiche Vornamen unterscheidet die Bettnummer</p>
 <button class="nu-treffer" style="background:var(--flaeche)"><span class="nu-treffer-bett">B2</span><div style="flex:1"><b>Ali</b><small>Arabisch · 1 Nacht</small></div><i data-icon="laeuseschein-fehlt" style="color:var(--warnung)"></i></button>
 <button class="nu-treffer" style="background:var(--flaeche)"><span class="nu-treffer-bett">D4</span><div style="flex:1"><b>Ali <span style="font-weight:400">„Professor“</span></b><small>Arabisch · 12 Nächte</small></div></button>
 <button class="nu-treffer" style="background:var(--flaeche);box-shadow:inset 0 0 0 3px var(--tinte)"><span class="nu-treffer-bett">L5</span><div style="flex:1"><b>Ali</b><small>Farsi · 5 Nächte</small></div><i data-icon="unterschrift" style="color:var(--warnung)"></i></button>
 <button class="nu-treffer" style="background:var(--flaeche)"><span class="nu-treffer-bett is-leer">–</span><div style="flex:1"><b>Ali Haddad</b><small>Arabisch · 14 Nächte</small></div></button>
</div>
<article style="background:var(--flaeche);border-radius:var(--radius-l);padding:20px 24px;display:grid;gap:22px">
 <div style="display:flex;gap:14px;align-items:flex-start"><span class="nu-treffer-bett" style="min-width:64px;height:52px;font-size:20px">L5</span><div style="flex:1"><h2 style="margin:0;font:700 24px/30px var(--font-ui)">Ali</h2><p class="nu-beschr" style="font-size:15px;line-height:22px">Aufnahme 2026-27-0018 · Farsi · 5 Nächte · angezeigt als Ali (L5)</p></div><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="bett"></i>Im Plan</button></div>
 <section class="nu-abschnitt"><h3>Dokumente</h3>
  <div class="nu-dokzeile is-fehlt"><i data-icon="unterschrift"></i><div><b>Hausordnung</b><small>Noch nicht unterschrieben. Kann jederzeit nachgeholt werden.</small></div><button class="nu-btn nu-btn--klein nu-btn--primaer"><i data-icon="stift"></i>Jetzt unterschreiben</button></div>
  <div class="nu-dokzeile is-fehlt"><i data-icon="unterschrift"></i><div><b>Datenschutzerklärung</b><small>wird zusammen mit der Hausordnung unterschrieben</small></div></div>
  <div class="nu-dokzeile"><i data-icon="laeuseschein"></i><div><b>Läuseschein</b><small>liegt vor · geprüft von Silke · gilt die ganze Saison</small></div></div>
  <div class="nu-dokzeile"><i data-icon="kamera"></i><div><b>Bescheinigung</b><small>Foto_2026-09-30.jpg · 30.09. · Silke</small></div></div>
  <button class="nu-btn nu-btn--rahmen" style="justify-self:start"><i data-icon="dokument-plus"></i>Dokument hinterlegen</button></section>
 <section class="nu-abschnitt"><h3>Notizen und Erwähnungen</h3><div class="nu-notiz">Im Vorfall erwähnt: Gelbe Karte für Dimitri (D5), Streit im Flur.<small>01.10. · Jonas · aus Bericht vom 01.10. · erwähnt, keine Sanktion</small></div></section>
</article></div>''', '''# Gastakte

Die Gästedatenbank ist ein eigener Bereich („Gäste“ in der Navigation): links die Liste, rechts die Akte des gewählten Gastes. Hier wird alles hinterlegt, was nach der Aufnahme dazukommt.

- **Liste:** Suchfeld (Name, Spitzname, Bettnummer), Filter „Alle · Mit Bett · Fehlt etwas · Hausverbot“ (`nu-seg`), Trefferzeilen wie in der Gästesuche mit Bettnummer links. Rechts in der Zeile Warnsymbole in `warnung`: `unterschrift` (Hausordnung fehlt), `laeuseschein-fehlt`.
- **Kopf der Akte:** Bettnummer groß, Name mit Spitzname, Aufnahmenummer, Sprache, Nächte, „angezeigt als Ali (L5)“ bei gleichem Vornamen; „Im Plan“ springt zum Bett.
- **Dokumente** als Zeilen (`nu-dokzeile`, 64 dp): Hausordnung, Datenschutzerklärung, Läuseschein, weitere. Fehlt etwas: Grund `warnung-flaeche` und Handlung rechts:
  - „Jetzt unterschreiben“ startet den verkürzten Assistenten (Sprache, Hausordnung zweispaltig, Datenschutz, Abschluss) und legt das PDF ab.
  - „Dokument hinterlegen“ (`dokument-plus`): Art wählen (Hausordnung auf Papier, Läuseschein, Bescheinigung, Sonstiges), Foto oder Datei, Notiz. „Hausordnung auf Papier“ zählt als unterschrieben; „Läuseschein“ setzt den Läuseschein auf „liegt vor“.
- Darunter Sanktionen und **Notizen und Erwähnungen** (auch Erwähnungen ohne Sanktion aus Berichten).
- Keine Admin-PIN zum Ansehen und Hinterlegen; Löschen und Stammdaten ändern nur mit PIN. Bilder von Läusescheinen sind Gesundheitsdaten: keine Vorschau in Listen.
- Unter 900 dp: erst die Liste, nach Auswahl die Akte als Vollbild mit Schließen.
''', width=1160, subtitle="Gästedatenbank: Unterschrift nachholen, Dokumente hinterlegen")

# ---------------------------------------------------------------- Dienst und Bericht
ersetze("Berichtsfelder", height=640, html='''<div class="nu nu-vorschau" style="display:block;max-width:1000px"><div class="nu-bericht">
<div class="nu-bericht-zeile"><span class="nu-feldname">Hat KHT angerufen?</span><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">Ja</button><button role="radio" aria-checked="false">Nein</button></div><span class="nu-pille"><i data-icon="telefon" class="klein"></i>Zahlen: 24 belegt · 29 gesamt · 5 frei</span></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Vorfälle</span><div style="display:flex;align-items:center;gap:12px"><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="false">Ja</button><button role="radio" aria-checked="false">Nein</button></div><span class="nu-pille nu-pille--warnung"><i data-icon="warnung" class="klein"></i>Pflichtfeld</span></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Fehlt etwas</span><div class="nu-checkliste"><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Tüten</button><button class="nu-chip">Putzmittel</button><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Toilettenpapier</button><button class="nu-chip">Decken</button><input class="nu-eingabe" style="flex:1 1 260px" value="Müllbeutel 120 l, Duschgel" aria-label="Was genau fehlt"></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Schlüssel fehlt</span><div style="display:flex;gap:12px;align-items:center"><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">Ja</button><button role="radio" aria-checked="false">Nein</button></div><input class="nu-eingabe" style="max-width:200px" placeholder="Nummer(n)" value="7"></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Abwesenheit von Gästen</span><div style="display:grid;gap:6px"><div class="nu-zeile"><i data-icon="schloss"></i><div>Petra · D6 · freigehalten bis 06.10.<small>aus dem Bettenplan</small></div></div><div class="nu-zeile nu-zeile--warnung"><i data-icon="abwesend"></i><div>Kasia · L2 · fehlt unentschuldigt, 1. Nacht<small>aus dem Bettenplan</small></div></div><div class="nu-zeile nu-zeile--warnung"><i data-icon="abwesend"></i><div>Ben · F2 · fehlt 2. Nacht in Folge, Bett zählt als frei<small>aus dem Bettenplan</small></div></div></div></div>
</div></div>''', readme='''# Berichtsfelder

Jedes Feld des Dienstberichts hat eine Zeile mit Beschriftung links und Eingabe rechts.

- Zeile `nu-bericht-zeile`: Beschriftung 220 dp breit (`text-stark` 16 sp), Eingabe daneben. Zwischen Feldern `abstand-6`; keine Linien.
- **Ja/Nein** (`nu-seg`) für „Hat KHT angerufen?“, Vorfälle, Schlüssel fehlt; keine Vorauswahl. Offene Pflichtfelder zeigen beim Abschließen die Pille „Pflichtfeld“ in `warnung`.
- **Hat KHT angerufen?** (früher „An KHT gemeldet“): daneben die Pille mit den Zahlen aus dem Bettenplan („24 belegt · 29 gesamt · 5 frei“), antippbar für die Rechnung. So hat man die Zahlen griffbereit, wenn das Kältehilfetelefon anruft.
- **Fehlt etwas:** Chips aus der Liste in den Einstellungen und daneben immer ein **Freitextfeld** „Was genau?“, weil die Kategorien breit sind („Müllbeutel 120 l, Duschgel“). Beides steht im PDF.
- **Abwesenheit von Gästen:** automatisch aus dem Bettenplan: freigehalten, frei bis Rückkehr und **fehlt unentschuldigt** (1. Nacht, ab 2. Nacht mit „Bett zählt als frei“) als Warnzeilen.
- **Freitext** (Wichtige Hinweise, Fragen von Gästen, Sonstiges): siehe Erwähnung und Stufenwörter.
- Ein Bericht mit „Vorfälle: Ja“ bekommt den Rahmen 3 dp `vorfall` (`nu-bericht.is-vorfall`).
''', width=1040)

ersetze("ErwaehnungStufenwoerter", height=640, html='''<div class="nu" style="width:980px;background:var(--grund);padding:20px;display:grid;gap:12px">
<div class="nu-feld"><label for="t">Wichtige Hinweise</label>
<div class="nu-eingabe" id="t" style="min-height:120px;padding:14px 16px;border-color:var(--fokus);background:var(--flaeche)"><span class="nu-stufe nu-stufe--gelb"><i data-icon="karte-gelb" class="klein"></i>Gelbe Karte</span> <span class="nu-erwaehnung">@Dimitri</span> und <span class="nu-erwaehnung">@Ali (D4)</span>: Streit im Flur nach 23 Uhr, Dimitri hat geschubst.<br>Frage von <span class="nu-erwaehnung">@Ali (L5)</span> nach einer zweiten Decke. @Al<span style="display:inline-block;width:2px;height:22px;background:var(--tinte);vertical-align:middle;animation:nu-ein 1s steps(2) infinite"></span></div></div>
<div style="display:flex;gap:16px;align-items:flex-start">
<div class="nu-zuordnung" style="flex:1"><div class="nu-zuordnung-kopf"><i data-icon="karte-gelb"></i>Gelbe Karte für<button class="nu-zuordnung-ziel">Dimitri <span class="bett">D5</span><i data-icon="ab" class="klein"></i></button></div><div class="nu-zuordnung-rest">Nur Notiz, keine Sanktion: <span class="nu-pille"><i data-icon="notiz" class="klein"></i>Ali (D4)</span></div></div>
<div class="nu-vorschlaege" role="listbox"><button role="option" aria-selected="true"><span class="nu-treffer-bett" style="min-width:44px;height:32px;font-size:14px">D4</span>Ali<small>erwartet</small></button><button role="option"><span class="nu-treffer-bett" style="min-width:44px;height:32px;font-size:14px">L5</span>Ali<small>da</small></button><button role="option"><span class="nu-treffer-bett is-leer" style="min-width:44px;height:32px;font-size:14px">–</span>Ali Haddad<small>Gästedatenbank</small></button></div></div>
<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="nu-pille nu-pille--blau"><i data-icon="notiz" class="klein"></i>Notiz für Ali (L5)</span><span class="nu-pille nu-pille--warnung"><i data-icon="warnung" class="klein"></i>@Ali gibt es 4-mal: Bettnummer ergänzen, z. B. @Ali (D4)</span></div>
<div style="margin-top:auto;border-radius:14px;overflow:hidden"><div class="nu-tastenleiste"><button class="nu-chip"><b>@</b> Gast</button><button class="nu-chip"><i data-icon="verwarnung" class="klein"></i>Verwarnung</button><button class="nu-chip"><i data-icon="karte-gelb" class="klein"></i>Gelbe Karte</button><button class="nu-chip"><i data-icon="karte-rot" class="klein"></i>Hausverbot</button><button class="nu-btn nu-btn--primaer nu-btn--klein"><i data-icon="check"></i>Fertig</button></div>
<div style="height:90px;background:var(--flaeche-3);display:grid;place-items:center;color:var(--tinte-3);font-size:14px">Bildschirmtastatur</div></div>
</div>''', readme='''# Erwähnung und Stufenwörter

Im Freitext des Berichts erwähnt „@“ einen Gast; ein Absatz, der mit einem Stufenwort beginnt, legt eine Sanktion an, und zwar **für genau eine Person**.

**Erwähnen**
- „@“ öffnet die Vorschlagsliste (`nu-vorschlaege`) unter dem Cursor: Treffer mit Bettnummer-Marke, Gäste mit Bett zuerst, dann die Gästedatenbank. Pfeiltasten und Enter funktionieren mit Hardware-Tastatur.
- Eingefügt wird „@Ali (D4)“, sobald es den Vornamen mehrfach gibt, sonst „@Dimitri“. In der Datenbank speichert die Erwähnung die Gast-ID; die Bettnummer ist nur Anzeige.
- Tippt jemand „@Ali“ von Hand und es gibt mehrere: Warnpille „@Ali gibt es 4-mal: Bettnummer ergänzen“. Der Bericht lässt sich erst abschließen, wenn jede Erwähnung eindeutig ist.
- Erwähnung im Text: `nu-erwaehnung` (Grund `erwartet-flaeche`, Text `blau`, 600), wird als Ganzes gelöscht. Jeder erwähnte Gast bekommt den Absatz als Notiz mit Verweis auf den Bericht.

**Stufenwörter**
- Am Absatzanfang: „Verwarnung“, „Gelbe Karte“, „Hausverbot“ (auch „Rote Karte“). Sie werden fett, Karten mit ihrem Symbol.
- **Die Sanktion bekommt nur eine Person:** standardmäßig die zuerst genannte. Unter dem Feld zeigt die Zuordnung (`nu-zuordnung`, Grund `warnung-flaeche`) „Gelbe Karte für [Dimitri D5 ▾]“; ein Tipp öffnet „Wer bekommt die Gelbe Karte?“ mit allen Genannten und „Niemand (nur Notizen)“.
- **Alle anderen Genannten** stehen darunter als „Nur Notiz, keine Sanktion“: Sie bekommen den Absatz in ihre Notizen („erwähnt, keine Sanktion“), nie als Verwarnung, Karte oder Hausverbot.
- Nach dem Abschließen entsteht der Sanktionseintrag beim gewählten Gast; die Einblendung nennt die Zahl („1 Sanktion angelegt“).

**Schreibmodus:** Mit offener Bildschirmtastatur sitzt die `nu-tastenleiste` direkt über der Tastatur: „@ Gast“, die drei Stufenwörter, „Fertig“. Das aktive Feld rückt nach oben und bleibt ganz sichtbar. Eingaben werden bei jedem Zeichen lokal gespeichert.
''', width=980, subtitle="Sanktion für genau eine Person")

ersetze("Duschplan", html='''<div class="nu nu-vorschau nu-vorschau--spalte">
<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;width:100%"><b class="abschnitt" style="flex:1">Duschplan · Freitag, 2. Oktober</b><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">Heute</button><button role="radio" aria-checked="false">Morgen</button><button role="radio" aria-checked="false">Übermorgen</button><button role="radio" aria-checked="false">In 3 Tagen</button></div></div>
<div class="nu-dusche" style="width:100%">
<button class="nu-slot" data-s="erledigt"><span class="zeit">19:00 ✓</span><b>Jonas</b><span class="nu-beschr">D1 · erledigt</span></button>
<button class="nu-slot" data-s="verpasst"><span class="zeit">19:30</span><b>Mihai</b><span class="nu-beschr">B1 · verpasst</span></button>
<button class="nu-slot" data-s="geplant"><span class="zeit">20:00</span><b>Samir</b><span class="nu-beschr">F1</span></button>
<button class="nu-slot" data-s="geplant"><span class="zeit">20:30</span><b>Ali (D4)</b><span class="nu-beschr">D4</span></button>
<button class="nu-slot" data-s="frei"><span class="zeit">21:00</span><b>frei</b><span class="nu-beschr">antippen</span></button>
<button class="nu-slot" data-s="frei"><span class="zeit">21:30</span><b>frei</b><span class="nu-beschr">antippen</span></button>
</div></div>''', readme='''# Duschplan

Ein Raster aus Zeitslots, in das man Gäste einträgt und das zum Slotbeginn erinnert.

- **Tagesauswahl** oben (`nu-seg`): Heute, Morgen, Übermorgen, In 3 Tagen. Der Duschplan ist der einzige Ort neben dem Kalender, der nach vorn schaut; die Kopfzeile geht nie in die Zukunft.
- Slot `nu-slot` (mindestens 150 × 76 dp): Uhrzeit `nummer`, Name `text-stark` (bei gleichem Vornamen mit Bettnummer), Bett in `text-klein`.
- Zustände: frei (`flaeche-2`, „frei“ in `tinte-3`), geplant (`erwartet-flaeche`, Rahmen `blau`), erledigt (Rahmen `frei`, ✓ an der Uhrzeit), verpasst (Name durchgestrichen, „verpasst“).
- Freien Slot antippen → Gast wählen (heute aus den anwesenden, für die nächsten Tage aus allen Gästen mit Bett). Belegten Slot antippen → „Erledigt“, „Verpasst“, „Freigeben“.
- Zu Slotbeginn eine Einblendung „Dusche 20:30 – Ali, Bett D4“, auch im Hintergrund (AlarmManager), Ton optional.
- Raster, Länge und Anzahl in den Einstellungen.
''')

ersetze("BerichtAbgeschlossen", html='''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:900px">
<div class="nu-gesperrt" style="width:100%"><i data-icon="schloss" class="zu"></i><div style="flex:1">Bericht abgeschlossen<small>02.10. · 07:42 · Jonas, Silke · PDF gespeichert und abgeglichen</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="pdf"></i>PDF ansehen</button><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="teilen"></i>Teilen</button></div>
<div class="nu-bericht is-vorfall" style="width:100%;gap:12px;padding:18px"><div style="display:flex;align-items:center;gap:8px;color:var(--vorfall);font-weight:700"><i data-icon="vorfall"></i>Bericht mit Vorfall</div><div style="color:var(--tinte-2)">Wichtige Hinweise: <span class="nu-stufe nu-stufe--gelb"><i data-icon="karte-gelb" class="klein"></i>Gelbe Karte</span> <span class="nu-erwaehnung">@Dimitri</span> und <span class="nu-erwaehnung">@Ali (D4)</span> …</div></div>
<div class="nu-nachtrag" style="width:100%"><b>Nachtrag</b>Dimitri hat sich am Morgen entschuldigt.<small>03.10. · 19:05 · Silke</small></div>
<button class="nu-btn nu-btn--rahmen"><i data-icon="stift"></i>Nachtrag hinzufügen</button>
</div>''', readme='''# Bericht abgeschlossen

Nach dem Abschluss ist der Bericht schreibgeschützt; Nachträge kommen mit Zeitstempel darunter.

- „Bericht abschließen“ prüft Pflichtfelder: Besetzung mit Unterschriften, „Hat KHT angerufen?“ Ja/Nein, Vorfälle Ja/Nein, eindeutige Erwähnungen. Fehlt etwas, springt die Ansicht zum ersten offenen Feld.
- Danach: Leiste `nu-gesperrt` (Grund `flaeche-3`, Symbol `schloss` rastet in `dauer-lang` ein) mit Zeit, Personen, Abgleichstand und den Knöpfen „PDF ansehen“ und **„Teilen“**.
- „Teilen“ öffnet den Android-Teilen-Dialog mit dem PDF, **ohne festen Empfänger**. Es gibt keinen Knopf, der direkt an eine bestimmte Person schickt.
- Felder bleiben lesbar, alle Eingaben sind weg. Ein Bericht mit Vorfall behält den roten Rahmen, auch im Archiv.
- **Nachtrag** (`nu-nachtrag`): Text mit Datum, Uhrzeit und Name; darf jede Betreuungsperson und die Leitung. Korrekturen an Feldern nur mit Admin-PIN und Protokoll.
''')

# ---------------------------------------------------------------- Kalender
ersetze("Kalender", height=560, html='''<div class="nu" style="width:1160px;background:var(--grund);padding:20px">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><h2 class="titel-gross" style="margin:0;flex:1">KW 40 · 28.09. – 04.10.2026</h2><div class="nu-seg" role="radiogroup" aria-label="Ansicht"><button role="radio" aria-checked="true">7 Tage</button><button role="radio" aria-checked="false">Monat</button></div><button class="nu-iconbtn nu-iconbtn--fl" aria-label="Vorige Woche"><i data-icon="zurueck"></i></button><button class="nu-btn nu-btn--rahmen nu-btn--klein">Heute</button><button class="nu-iconbtn nu-iconbtn--fl" aria-label="Nächste Woche"><i data-icon="weiter"></i></button></div>
<div class="nu-woche" id="w"></div></div>
<script>
var T=["Mo","Di","Mi","Do","Fr","Sa","So"],D=["Flo","Silke, Jessica","Flo","Flo","Jonas, Silke","Jonas, Silke","Flo"],E={4:[["wiederholen","Bettwäschewechsel Zimmer B","Bettwäsche",""]],5:[["kalender","Lieferung Decken","Sondertermin",""]],6:[["einkauf","Morgen Feiertag, heute einkaufen","Feiertag","feiertag"]]};
document.getElementById("w").innerHTML=T.map(function(t,i){var d=28+i>30?28+i-30:28+i;return '<div class="nu-woche-tag'+(i===4?' is-heute':i<4?' is-vorbei':'')+'"><div class="nu-woche-kopf"><b>'+d+'</b><span>'+t+'</span></div><span class="nu-termin nu-termin--dienst">'+Nu.svg("personen")+'<span>Nachtdienst<small>'+D[i]+'</small></span></span><span class="nu-termin">'+Nu.svg("kueche")+'<span>Küche<small>Hannah</small></span></span>'+(E[i]||[]).map(function(e){return '<span class="nu-termin'+(e[3]?' nu-termin--'+e[3]:'')+'">'+Nu.svg(e[0])+'<span>'+e[1]+'<small>'+e[2]+'</small></span></span>';}).join("")+'<button class="nu-woche-plus">'+Nu.svg("plus","klein")+'Termin</button></div>';}).join("");
</script>''', readme='''# Kalender

Der Kalender sammelt alles mit Datum; jeder Eintrag erscheint am Tag automatisch unter „Heute“ im Bericht.

- **Standard ist die 7-Tage-Ansicht** (`nu-woche`): sieben Spalten Montag bis Sonntag, jede mit Nachtdienst, Küche und allen Einträgen untereinander, ungekürzt. Unten in jeder Spalte „+ Termin“. Heute: Zahl im Kreis `primaer`; vergangene Tage ohne Grund, nur mit Linie.
- Kopf: „KW 40 · 28.09. – 04.10.2026“, Umschalter „7 Tage · Monat“ (`nu-seg`), Pfeile für die Woche davor und danach, „Heute“, „Dienstplan einlesen“.
- **Monatsansicht** auf Wunsch: 7 Spalten, Tageszelle mindestens 112 dp, Einträge einzeilig gekürzt; Tipp auf einen Tag zeigt ihn rechts ausführlich.
- Einträge als `nu-termin` mit Symbol: Dienst (`personen`, Grund `erwartet-flaeche`), Aufgabe und Bettwäsche (`wiederholen` bei wiederkehrenden), Feiertag mit Einkaufshinweis (`einkauf`, Grund `warnung-flaeche`), Sondertermin (`kalender`).
- **Dienstplan einlesen:** Quelle Nextcloud-Datei (PDF, ICS) oder Foto; danach eine Prüftabelle mit markierten unsicheren Feldern. Kein Import aus WhatsApp.
- Unter 900 dp stehen die sieben Tage untereinander.
''', width=1160, subtitle="Standard: 7 Tage")

# ---------------------------------------------------------------- Einstellungen
ersetze("Einstellungszeilen", height=620, html='''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:860px">
<div class="nu-zimmer-einst" style="width:100%"><div class="nu-einstellung"><i data-icon="bett"></i><div><b>Zimmer D</b><small>5 von 6 Betten in Betrieb</small></div><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Zimmer D in Betrieb"></button></div>
<div class="nu-bettschalter-liste" id="d"></div></div>
<div class="nu-zimmer-einst" style="width:100%"><div class="nu-einstellung"><i data-icon="bett"></i><div><b>Loggien</b><small>5 von 5 Betten in Betrieb</small></div><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Loggien in Betrieb"></button></div>
<div class="nu-bettschalter-liste" id="l"></div></div>
<div class="nu-einstellung" style="width:100%"><i data-icon="telefon"></i><div><b>Zahlen für das Kältehilfetelefon</b><small>Gesamt ohne Notbett · belegt inkl. 1. Nacht unentschuldigt</small></div><button class="nu-btn nu-btn--rahmen nu-btn--klein">Rechnung</button></div>
<div class="nu-einstellung" style="width:100%"><i data-icon="wolke-ok"></i><div><b>Meldung an die Ampel</b><small>meldet frei, belegt und gesamt, nie Namen</small></div><span class="nu-bald"><i data-icon="uhr" class="klein"></i>noch nicht verfügbar</span></div>
</div>
<script>
function bs(nr,info,an,notbett){return '<div class="nu-bettschalter'+(an?'':' is-aus')+'" style="flex-wrap:wrap"><div style="flex:1;min-width:0"><b>'+nr+'</b><small>'+info+'</small></div><button class="nu-schalter" role="switch" aria-checked="'+an+'" aria-label="Bett '+nr+' in Betrieb"></button>'+(notbett!==undefined?'<button class="nu-chip" style="flex-basis:100%;justify-content:center" aria-pressed="'+notbett+'">'+(notbett?Nu.svg("check","klein"):'')+'Notbett</button>':'')+'</div>';}
document.getElementById("d").innerHTML=bs("D1","belegt · Jonas",true)+bs("D2","belegt · Marek",true)+bs("D3","gesperrt",false)+bs("D4","belegt · Ali",true)+bs("D5","belegt · Dimitri",true)+bs("D6","belegt · Petra",true);
document.getElementById("l").innerHTML=bs("L1","belegt · Emil",true,false)+bs("L2","belegt · Kasia",true,false)+bs("L3","in Betrieb",true,true)+bs("L4","belegt · Jana",true,false)+bs("L5","belegt · Ali",true,false);
document.querySelectorAll(".nu-schalter").forEach(function(s){s.onclick=function(){var an=s.getAttribute("aria-checked")!=="true";s.setAttribute("aria-checked",String(an));var p=s.closest(".nu-bettschalter");if(p){p.classList.toggle("is-aus",!an);p.querySelector("small").textContent=an?"in Betrieb":"gesperrt";}}});
document.querySelectorAll(".nu-bettschalter .nu-chip").forEach(function(c){c.onclick=function(){var an=c.getAttribute("aria-pressed")!=="true";c.setAttribute("aria-pressed",String(an));c.innerHTML=(an?Nu.svg("check","klein"):"")+"Notbett";}});
</script>''', readme='''# Einstellungszeilen

Eine Zeile je Einstellung: Symbol, Name, aktueller Wert, rechts Schalter oder Pfeil. Unter „Betten und Zimmer“ lassen sich ganze Zimmer **und jedes einzelne Bett** sperren.

- `nu-einstellung` mindestens 72 dp, Grund `flaeche`. Name `text-stark`, Wert `text-klein` (`tinte-2`); der Wert ist immer sichtbar, ohne die Zeile zu öffnen.
- **Zimmerkarte** (`nu-zimmer-einst`): oben die Zimmerzeile mit Schalter („5 von 6 Betten in Betrieb“), darunter alle Betten als **Bettschalter** (`nu-bettschalter`, 56 dp, Raster ab 150 dp): Nummer, Zustand („belegt · Jonas“, „in Betrieb“, „gesperrt“), Schalter. Gesperrt: schraffiert. Ist das Zimmer aus, sind die Bettschalter gesperrt.
- Ein gesperrtes Bett erscheint im Plan schraffiert, ist nicht antippbar und zählt weder für KHT noch für die Ampel.
- In Loggien, Esszimmer, Tiny House und weiteren Plätzen trägt jeder Bettschalter den Chip **„Notbett“**: Notbetten zählen nicht für das Kältehilfetelefon.
- **Weitere Plätze:** Namensfeld und „Platz hinzufügen“ legen Z1, Z2 … an; freie Plätze lassen sich wieder entfernen.
- Sofort wirksame Ein/Aus-Werte mit `nu-schalter`; alles andere öffnet eine Unterseite (Pfeil `weiter`).
- **Noch nicht verfügbar** (`nu-bald`): gestrichelte Marke mit Uhr, für Funktionen, die angelegt, aber noch nicht fertig sind (z. B. Meldung an die Ampel). Keine stillen Platzhalter.
''', subtitle="Betten einzeln sperren, Notbett markieren")

# ---------------------------------------------------------------- kleine Textänderungen in älteren Bausteinen
def textfix(name, alt, neu):
    c = COMPS[[x['name'] for x in COMPS].index(name)]
    assert alt in c['readme'] or alt in c['html'], (name, alt)
    c['readme'] = c['readme'].replace(alt, neu); c['html'] = c['html'].replace(alt, neu)
textfix("Eingaben", "Pflichtfelder im Bericht (KHT, Vorfälle, Schlüssel fehlt)", "Pflichtfelder im Bericht („Hat KHT angerufen?“, Vorfälle, Schlüssel fehlt)")
textfix("Symbole", "67 eigene Symbole", "69 eigene Symbole")
textfix("Symbole", "| Bettstatus anwesend, erwartet, freigehalten, frei bis, deaktiviert |", "| Bettstatus anwesend, erwartet, freigehalten, frei bis Rückkehr, gesperrt |")
textfix("Symbole", "| `abwesend`, `auszug`, `tauschen`, `umziehen` | Abwesenheit, Auszug „frei ab“, Tauschen, Umziehen |", "| `abwesend`, `auszug`, `tauschen`, `umziehen` | Abwesenheit und „fehlt“, Bett frei (Auszug), Tauschen, Umziehen |")
textfix("Symbole", "| `haus`, `standort-2` | Haupthaus, St. Nikolaus |", "| `haus`, `standort-2` | St. Pius, St. Nikolaus |")
textfix("Symbole", "| `unterschrift`, `stift`, `tastatur`, `scannen`, `kamera` | Unterschrift, Nachtrag, Schreibmodus, Läuseschein scannen |", "| `unterschrift`, `stift`, `tastatur`, `scannen`, `kamera` | Unterschrift (auch: fehlt noch), Nachtrag, Schreibmodus, Läuseschein scannen |\n| `teilen`, `dokument-plus` | PDF teilen (ohne festen Empfänger), Dokument in der Gästedatenbank hinterlegen |")
textfix("Symbole", "| `ampel`, `telefon` | Ampel, KHT (Kältehilfetelefon) |", "| `ampel`, `telefon` | Ampel, KHT-Zahlen und „Hat KHT angerufen?“ |")
