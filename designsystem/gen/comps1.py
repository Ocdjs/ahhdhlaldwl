COMPS = []
def comp(name, group, height, html, readme, width=None, subtitle=""):
    COMPS.append(dict(name=name, group=group, height=height, width=width, html=html, readme=readme, subtitle=subtitle))

# ------------------------------------------------------------ Grundlagen
comp("Knoepfe","Grundlagen",230,'''
<div class="nu-vorschau nu-vorschau--spalte">
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
    <button class="nu-btn nu-btn--primaer"><i data-icon="person-plus"></i>Gast aufnehmen</button>
    <button class="nu-btn">Nicht da</button>
    <button class="nu-btn nu-btn--rahmen"><i data-icon="tauschen"></i>Bett wechseln</button>
    <button class="nu-btn nu-btn--gefahr"><i data-icon="loeschen"></i>Löschen</button>
    <button class="nu-btn nu-btn--gefahr-voll">Hausverbot eintragen</button>
  </div>
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
    <button class="nu-btn nu-btn--primaer nu-btn--klein">Bestätigen</button>
    <button class="nu-btn nu-btn--klein">Zurück</button>
    <button class="nu-btn nu-btn--primaer" disabled>Bericht abschließen</button>
    <button class="nu-iconbtn nu-iconbtn--fl" aria-label="Schließen"><i data-icon="schliessen"></i></button>
    <button class="nu-iconbtn" aria-label="Mehr"><i data-icon="mehr"></i></button>
  </div>
  <p class="nu-beschr">Hauptknopf 56 dp, kleiner Knopf 48 dp, Symbolknopf 48 × 48 dp. Gedrückt: 97 % Größe in 90 ms.</p>
</div>''','''# Knöpfe

Knöpfe lösen genau eine Handlung aus; ihr Text sagt, was passiert.

- **Hauptknopf** (`nu-btn--primaer`, Füllung `primaer`): höchstens einer pro Ansicht, rechts unten oder als erste Schnellaktion. „Gast aufnehmen“, „Ist da“, „Weiter“, „Bericht abschließen“.
- **Ruhiger Knopf** (`nu-btn`, Füllung `flaeche-2`): alle weiteren Handlungen.
- **Rahmen-Knopf** (`nu-btn--rahmen`): auf `flaeche-2`-Gründen, wo der ruhige Knopf verschwinden würde.
- **Gefahr** (`nu-btn--gefahr`, Text `vorfall`): Löschen, Hausverbot. Die volle Variante (`nu-btn--gefahr-voll`) nur im Bestätigungsschritt.
- Größen: `ziel-gross` (56 dp) als Standard, `nu-btn--klein` (48 dp = `ziel-min`) in Listenzeilen und Dialogen. Nie kleiner.
- Text in `knopf` (17 sp, 600). Ein Symbol steht links vom Wort, nie allein, außer bei Schließen, Mehr und den Datumspfeilen (dann mit `contentDescription`).
- Gesperrt (`disabled`): 42 % Deckkraft. Darunter steht, was fehlt („Es fehlen 2 Unterschriften“).
- Rückmeldung: beim Drücken 97 % Größe und `flaeche-3`, Dauer `dauer-sofort`.

**Compose:** `Button` mit `shape = RoundedCornerShape(10.dp)`, `heightIn(min = 56.dp)`, `containerColor = primaer`. Ruhig = `FilledTonalButton` mit `flaeche-2`.
''')

comp("Eingaben","Grundlagen",400,'''
<div class="nu-vorschau" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px">
  <div class="nu-feld"><label for="v1">Vorname</label><input class="nu-eingabe" id="v1" value="Tom"></div>
  <div class="nu-feld"><label for="v2">Nachname (freiwillig)</label><input class="nu-eingabe" id="v2" placeholder="Nachname eintragen"></div>
  <div class="nu-feld"><span class="nu-feldname">Vorfälle</span>
    <div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="false">Ja</button><button role="radio" aria-checked="true">Nein</button></div></div>
  <div class="nu-feld"><span class="nu-feldname">Bett dauerhaft behalten</span>
    <div style="display:flex;align-items:center;gap:12px"><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Bett dauerhaft behalten"></button><span>Ja, auch in den Folgenächten</span></div></div>
  <div class="nu-feld" style="grid-column:1/-1"><span class="nu-feldname">Fehlt etwas</span>
    <div class="nu-checkliste"><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Tüten</button><button class="nu-chip" aria-pressed="false">Putzmittel</button><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Toilettenpapier</button><button class="nu-chip" aria-pressed="false">Decken</button><button class="nu-chip" aria-pressed="false"><i data-icon="plus" class="klein"></i>Anderes</button></div></div>
</div>
<script>document.querySelectorAll(".nu-seg button").forEach(function(b){b.onclick=function(){b.parentNode.querySelectorAll("button").forEach(function(x){x.setAttribute("aria-checked",String(x===b))})}});
document.querySelectorAll(".nu-schalter").forEach(function(s){s.onclick=function(){s.setAttribute("aria-checked",String(s.getAttribute("aria-checked")!=="true"))}});
document.querySelectorAll(".nu-checkliste .nu-chip").forEach(function(c){c.onclick=function(){c.setAttribute("aria-pressed",String(c.getAttribute("aria-pressed")!=="true"))}});</script>''','''# Eingaben

Felder, Ja/Nein-Wahl, Schalter und Auswahl-Chips für Aufnahme, Bericht und Einstellungen.

- **Feld** (`nu-feld` + `nu-eingabe`): Beschriftung `label` über dem Feld, nie nur als Platzhalter. Feld 56 dp hoch, Grund `flaeche-2`, im Fokus 2 dp Kante `fokus` und Grund `flaeche`. Mehrzeilig ab 132 dp, wächst mit.
- **Ja/Nein** (`nu-seg`): Pflichtfelder im Bericht (KHT, Vorfälle, Schlüssel fehlt). Keine Vorauswahl: solange nichts gewählt ist, gilt das Feld als offen und „Bericht abschließen“ zeigt es an.
- **Schalter** (`nu-schalter`): nur für Einstellungen, die sofort gelten („Bett dauerhaft behalten“). Text daneben sagt, was „an“ bedeutet.
- **Chips** (`nu-chip`): Mehrfachauswahl wie die Liste „Fehlt etwas“. Gewählt = Füllung `primaer` plus Häkchen, also nie nur Farbe.
- Tastatur: Vornamen mit `KeyboardCapitalization.Words`, Zahlen mit `KeyboardType.Number`, Freitext mit Autokorrektur. „Weiter“ auf der Tastatur springt ins nächste Feld (`ImeAction.Next`), im letzten Feld „Fertig“.
- Fehler stehen unter dem Feld in `warnung` mit Symbol `warnung`: „Bitte Vorname oder Spitzname eintragen.“
''')

comp("Symbole","Grundlagen",620,'''
<div class="nu-vorschau" id="g" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px"></div>
<script>
var g=document.getElementById("g"), names=Object.keys(Nu.icons).concat(["karte-gelb","karte-rot"]);
g.innerHTML=names.map(function(n){return '<div style="display:grid;justify-items:center;gap:6px;padding:12px 4px;border-radius:10px;background:var(--flaeche)">'+Nu.svg(n)+'<span style="font:400 12px/16px var(--font-zahl);color:var(--tinte-2);text-align:center;word-break:break-all">'+n+'</span></div>'}).join("");
</script>''','''# Symbole

67 eigene Symbole im 24-dp-Raster, Strich 2 dp, runde Enden, einfarbig in `tinte` oder der Farbe des Zustands. Die Dateien liegen unter **Assets › Symbole** als SVG.

- Größen: `symbol` (24 dp) in Knöpfen, Navigation und Zeilen; `symbol-klein` (18 dp) auf Bettkarten und Chips.
- Einfärben: in Compose `Icon(painterResource(R.drawable.nu_bett), tint = …)`. Die SVG-Dateien sind mit `tinte` (#121A1F) gezeichnet; nach dem Import als Vector Drawable (Android Studio › New › Vector Asset) wird die Farbe über `tint` gesetzt.
- Ausnahme: `karte-gelb` und `karte-rot` haben eine feste Füllung (`karte-gelb` mit Kante `karte-gelb-rand`, `karte-rot`). Sie werden nicht eingefärbt.
- Ein Symbol steht nie allein für einen Zustand. Am Bett trägt jedes Symbol eine `contentDescription` („Läuseschein fehlt“, „Gelbe Karte“, „Notiz vorhanden“, „Duschslot 20:30“).

| Symbol | Bedeutung |
| --- | --- |
| `bett`, `stockbett`, `bett-plus` | Bett, Stockbett, Gast aufnehmen |
| `anwesend`, `erwartet`, `schloss`, `rueckkehr`, `deaktiviert` | Bettstatus anwesend, erwartet, freigehalten, frei bis, deaktiviert |
| `laeuseschein`, `laeuseschein-fehlt`, `warnung` | Läuseschein liegt vor, fehlt, überfällig |
| `verwarnung`, `karte-gelb`, `karte-rot` | Sanktionsstufen |
| `notiz`, `dusche`, `vorfall`, `schluessel` | Notiz vorhanden, Duschslot, Vorfall, Schlüssel fehlt |
| `abwesend`, `auszug`, `tauschen`, `umziehen` | Abwesenheit, Auszug „frei ab“, Tauschen, Umziehen |
| `haus`, `standort-2` | Haupthaus, St. Nikolaus |
| `bericht`, `kalender`, `regler`, `glocke` | Navigation und Kopfzeile |
| `wolke-ok`, `abgleich`, `wolke-wartet`, `wolke-aus` | Abgleich: synchronisiert, läuft, Änderungen ausstehend, offline |
| `ampel`, `telefon` | Ampel, KHT (Kältehilfetelefon) |
| `unterschrift`, `stift`, `tastatur`, `scannen`, `kamera` | Unterschrift, Nachtrag, Schreibmodus, Läuseschein scannen |
''')

comp("Eingabearten","Grundlagen",360,'''
<div class="nu-vorschau" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">
  <div style="display:grid;gap:10px;align-content:start">
    <b>Finger</b>
    <div style="position:relative;width:152px">
      <div id="b1"></div>
      <div style="position:absolute;inset:-6px;border:2px dashed var(--blau);border-radius:14px;pointer-events:none"></div>
    </div>
    <p class="nu-beschr">Treffer reicht 6 dp über die Karte hinaus. Kein Ziel unter 48 × 48 dp, Abstand zwischen Zielen mindestens 8 dp.</p>
  </div>
  <div style="display:grid;gap:10px;align-content:start">
    <b>Stift</b>
    <div class="nu-unterschrift" id="u"><div class="nu-unterschrift-feld" style="height:120px"><span class="nu-unterschrift-hilfe">Mit Stift probieren</span></div></div>
    <p class="nu-beschr">Strichstärke folgt dem Druck (1,4–4 dp). Sobald ein Stift erkannt ist, zählt der Handballen nicht mehr.</p>
  </div>
  <div style="display:grid;gap:10px;align-content:start">
    <b>Tastatur</b>
    <div class="nu-tastenleiste" style="border-radius:12px"><button class="nu-chip">@ Gast</button><button class="nu-chip">Verwarnung</button><button class="nu-btn nu-btn--primaer nu-btn--klein">Fertig</button></div>
    <p class="nu-beschr">Im Schreibmodus rückt das Feld nach oben, die Leiste sitzt über der Tastatur. Eine Hardware-Tastatur wird mit Tab und Strg+Enter bedient.</p>
  </div>
</div>
<script>document.getElementById("b1").innerHTML=Nu.bett({nr:"D4",s:"anwesend",name:"Max",naechte:12,symbole:["notiz"]});Nu.unterschrift(document.getElementById("u"));</script>''','''# Eingabearten

Die App wird mit Finger, S Pen und Tastatur bedient; jede Ansicht funktioniert mit dem Finger allein.

**Finger**
- Jedes Ziel mindestens `ziel-min` (48 dp), Hauptaktionen `ziel-gross` (56 dp), Lücke zwischen Zielen mindestens `abstand-2` (8 dp).
- Ein Tipp öffnet, ein langes Drücken (400 ms) hebt eine Bettkarte zum Ziehen an. Wischgesten tragen nie allein eine Handlung, es gibt immer einen Knopf.
- Check-in und Duschslot in höchstens drei Tipps: Bett → „Ist da“ → fertig; Bett → „Duschslot“ → Uhrzeit.

**Stift (S Pen)**
- Unterschriften: Druck steuert die Strichstärke (1,4–4 dp bei `stift-tinte`). Nach dem ersten Stiftkontakt werden Fingerberührungen im Feld ignoriert (Handballen). In Compose: `pointerInteropFilter`/`awaitPointerEvent` mit `PointerType.Stylus` prüfen.
- Hover: Wo der Stift schwebt, zeigen Bettkarten und Symbolknöpfe einen Fokusring und nach 500 ms einen Tooltip mit dem Klartext („Läuseschein fehlt seit 3 Tagen“).
- Handschrift in Textfelder: Wo Android sie anbietet (Samsung-Handschrifteingabe, ab Android 14 Stylus-Handwriting), bleibt sie eingeschaltet. Die App setzt nichts voraus.

**Tastatur**
- Bildschirmtastatur: Öffnet sie sich, wechselt der Bericht in den **Schreibmodus**: Kopfzeile und Navigationsleiste bleiben, Nebenspalten klappen ein, das aktive Feld rückt nach oben, über der Tastatur sitzt die `nu-tastenleiste` mit „@ Gast“, den Stufenwörtern und „Fertig“. `WindowInsets.ime` und `imePadding()` verwenden; nie Inhalt hinter der Tastatur.
- Hardware-Tastatur (Book Cover Keyboard): Tab und Umschalt+Tab wandern durch die Felder, Enter bestätigt Dialoge, Strg+Enter schließt ein Feld ab, Esc schließt Schnellauswahl und Detailbereich, Pfeiltasten wechseln im Bettenplan das Bett. Der Fokusring (`fokus`, 2 dp mit 2 dp Abstand) ist dann immer sichtbar.
''', subtitle="Finger, Stift und Tastatur")

comp("Bewegung","Grundlagen",520,'''
<div class="nu-vorschau" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">
  <div class="dm"><b>Statuswechsel</b><div class="st" id="s1"></div><button class="nu-btn nu-btn--klein" data-run="1">Abspielen</button><small>250 ms, Kreis aus dem Tipp-Punkt</small></div>
  <div class="dm"><b>Zähler</b><div class="st"><button class="nu-iconbtn nu-iconbtn--fl" aria-label="Erinnerungen"><i data-icon="glocke"></i><span class="nu-zaehler" id="z">2</span></button></div><button class="nu-btn nu-btn--klein" data-run="2">Abspielen</button><small>250 ms, Pop auf 118 %</small></div>
  <div class="dm"><b>Abgleich läuft</b><div class="st"><span class="nu-sync" data-s="laeuft"><i data-icon="abgleich"></i>Abgleich läuft</span></div><span></span><small>1,1 s pro Umdrehung, linear</small></div>
  <div class="dm"><b>Detailbereich</b><div class="st" style="overflow:hidden;width:100%;height:80px;position:relative;background:var(--grund);border-radius:12px"><div id="d" style="position:absolute;right:0;top:0;bottom:0;width:55%;background:var(--flaeche);border-radius:12px 0 0 12px"></div></div><button class="nu-btn nu-btn--klein" data-run="3">Abspielen</button><small>350 ms, kurve-eintritt</small></div>
  <div class="dm"><b>Einblendung</b><div class="st" id="e" style="width:100%"></div><button class="nu-btn nu-btn--klein" data-run="4">Abspielen</button><small>350 ms herein, 6 s Standzeit</small></div>
  <div class="dm"><b>Bericht abgeschlossen</b><div class="st"><span class="nu-gesperrt" style="padding:8px 14px"><i data-icon="schloss" id="sl"></i>Abgeschlossen</span></div><button class="nu-btn nu-btn--klein" data-run="5">Abspielen</button><small>350 ms, Bügel rastet ein</small></div>
  <div class="dm"><b>Falsche PIN</b><div class="st"><div class="nu-pin-punkte" id="pp"><i class="is-voll"></i><i class="is-voll"></i><i class="is-voll"></i><i class="is-voll"></i></div></div><button class="nu-btn nu-btn--klein" data-run="6">Abspielen</button><small>300 ms Kopfschütteln</small></div>
  <div class="dm"><b>Ablegen nach Ziehen</b><div class="st" id="s2"></div><button class="nu-btn nu-btn--klein" data-run="7">Abspielen</button><small>350 ms, federt auf 98 %</small></div>
  <div class="dm"><b>Bestätigt</b><div class="st"><span class="nu-pille nu-pille--frei" id="ck"><i data-icon="check" class="klein nu-zeichnen"></i>Unterschrift bestätigt</span></div><button class="nu-btn nu-btn--klein" data-run="8">Abspielen</button><small>250 ms, Häkchen wird gezeichnet</small></div>
</div>
<style>.dm{display:grid;gap:10px;justify-items:start;align-content:start;padding:14px;border-radius:14px;background:var(--flaeche)} .dm small{color:var(--tinte-2);font-size:13px} .st{min-height:96px;display:grid;place-items:center start}</style>
<script>
Nu.mountIcons();
var s1=document.getElementById("s1"), s2=document.getElementById("s2");
function bed1(s){s1.innerHTML=Nu.bett(s==="anwesend"?{nr:"B3",s:"anwesend",name:"Lukas",naechte:4}:{nr:"B3",s:"erwartet",name:"Lukas",naechte:3});}
bed1("erwartet"); s2.innerHTML=Nu.bett({nr:"F2",s:"anwesend",name:"Moritz",naechte:20});
function re(el,c){el.classList.remove(c);void el.offsetWidth;el.classList.add(c);}
var runs={
 1:function(){bed1(s1.querySelector(".nu-bett").dataset.s==="anwesend"?"erwartet":"anwesend");var b=s1.querySelector(".nu-bett");b.style.setProperty("--x","30%");b.style.setProperty("--y","60%");re(b,"is-neu");},
 2:function(){var z=document.getElementById("z");z.textContent=+z.textContent+1;re(z,"pop");},
 3:function(){re(document.getElementById("d"),"rein");document.getElementById("d").classList.add("nu-detail");},
 4:function(){var e=document.getElementById("e");e.innerHTML='<div class="nu-einblendung" style="width:100%">'+Nu.svg("dusche")+'<div><b>Dusche 20:30</b><span>Max, Bett 5</span></div><span></span><i class="lauf"></i></div>';},
 5:function(){var s=document.querySelector("#sl")||document.querySelector(".nu-gesperrt .nu-svg");re(s,"zu");},
 6:function(){re(document.getElementById("pp"),"is-falsch");},
 7:function(){re(s2.querySelector(".nu-bett"),"is-gesetzt");},
 8:function(){var c=document.querySelector("#ck .nu-svg");c.classList.remove("nu-zeichnen");void c.offsetWidth;c.classList.add("nu-zeichnen");}
};
document.querySelectorAll("[data-run]").forEach(function(b){b.onclick=function(){runs[b.dataset.run]();};});
runs[4]();
</script>''','''# Bewegung

Bewegung bestätigt eine Handlung und zeigt, woher etwas kommt; sie schmückt nicht. Nachts bleibt alles ruhig: nichts blinkt, nichts läuft in Schleife außer dem Abgleich-Symbol, solange ein Abgleich läuft.

| Anlass | Dauer | Kurve | Was passiert |
| --- | --- | --- | --- |
| Antippen | `dauer-sofort` 90 ms | `kurve-standard` | Element auf 97 %, Grund `flaeche-3` |
| Statuswechsel am Bett (Check-in) | `dauer-mittel` 250 ms | `kurve-eintritt` | neue Füllung wächst als Kreis aus dem Tipp-Punkt, Häkchen wird gezeichnet |
| Schnellauswahl am Bett | `dauer-kurz` 150 ms | `kurve-eintritt` | wächst von 92 % aus der Bettkarte, blendet ein |
| Detailbereich | `dauer-lang` 350 ms | `kurve-eintritt` | gleitet von rechts herein, Abdunklung blendet ein |
| Assistent: Schritt | `dauer-mittel` 250 ms | `kurve-standard` | neuer Schritt kommt 32 dp aus Leserichtung (bei Arabisch und Farsi gespiegelt) |
| Bettkarte ziehen | sofort | – | Karte hebt sich (105 %, −1°, `schatten-gehoben`), Ziel zeigt Rahmen: grün = umziehen, blau = tauschen |
| Ablegen | `dauer-lang` 350 ms | `kurve-standard` | Karte gleitet ins Ziel und federt (98 %) |
| Tauschen bestätigt | `dauer-lang` 350 ms | `kurve-standard` | beide Karten wechseln auf leicht gebogenen Bahnen den Platz |
| Datumswechsel | `dauer-mittel` 250 ms | `kurve-standard` | Inhalt blendet über und rückt 16 dp in Pfeilrichtung |
| Zähler an der Glocke | `dauer-mittel` 250 ms | `kurve-standard` | Pop auf 118 %, einmal |
| Einblendung (Duschslot) | `dauer-lang` herein, `dauer-einblendung` 6 s Standzeit | `kurve-eintritt` | gleitet von rechts oben herein, Laufbalken zeigt die Restzeit, danach in die Glocke |
| Bericht abschließen | `dauer-lang` 350 ms | `kurve-standard` | Schloss rastet ein, Felder wechseln auf schreibgeschützt |
| Falsche PIN | 300 ms | `kurve-standard` | Punkte schütteln sich, dann leer |
| Abgleich läuft | 1,1 s je Umdrehung | linear | Symbol `abgleich` dreht, bis der Abgleich endet |

**Reduzierte Bewegung:** Ist in Android „Animationen entfernen“ an (`Settings.Global.ANIMATOR_DURATION_SCALE == 0`), werden alle Übergänge zu Überblendungen unter 100 ms; das Abgleich-Symbol dreht nicht.

**Compose:** `tween(durationMillis = 250, easing = CubicBezierEasing(0.05f, 0.7f, 0.1f, 1f))` für `kurve-eintritt`; `CubicBezierEasing(0.2f, 0f, 0f, 1f)` für `kurve-standard`; `CubicBezierEasing(0.3f, 0f, 0.8f, 0.15f)` für `kurve-austritt`. Detailbereich: `AnimatedVisibility(enter = slideInHorizontally { it } + fadeIn())`.
''', subtitle="Alle Animationen zum Abspielen")
