# Änderungsrunde 3: KHT-Nummer schlicht, Notbett zählt nur belegt, Namen anonymisiert, Verfasser*in bei Hinweisen,
# weitere Plätze in St. Nikolaus mit freier Nummer, Nummern im Zimmer tauschen, Monatsabschluss mit Dienstnachweis.
from comps1 import COMPS
from comps5 import ersetze, neu_nach

def textfix(name, alt, neu):
    c = COMPS[[x['name'] for x in COMPS].index(name)]
    assert alt in c['readme'], (name, alt)
    c['readme'] = c['readme'].replace(alt, neu)

textfix("Grundriss", "- St. Nikolaus: Saal 380 × 440 Einheiten, acht senkrechte Betten in zwei Reihen, höchstens 460 dp breit.",
        "- St. Nikolaus: Saal 380 × 440 Einheiten, acht senkrechte Betten in zwei Reihen, höchstens 520 dp breit; **rechts daneben die weiteren Plätze von St. Nikolaus** (z. B. N9 „Matratze Flur“) in derselben Spalte wie bei St. Pius.\n- **Nummern tauschen:** Jede gezeichnete Bettfläche ist ein fester Platz. Welche Nummer dort steht, lässt sich in den Einstellungen innerhalb eines Zimmers tauschen (`Bett.platz`). Belegung, Sperre und Notbett hängen an der Nummer und wandern mit.")
textfix("Grundriss", "- Notbetten (L3, E1) tragen „Notbett“ in der Fußzeile.",
        "- Notbetten (L3, E1) tragen „Notbett“ in der Fußzeile; ein freies Notbett zeigt in der Schnellauswahl „Nur über den Kältebus belegen“.")

# ---------------------------------------------------------------- Einstellungen
ersetze("Einstellungszeilen", height=760, html='''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:900px">
<div class="nu-zimmer-einst" style="width:100%"><div class="nu-einstellung"><i data-icon="bett"></i><div><b>Zimmer D</b><small>5 von 6 Betten in Betrieb</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen" id="ts"><i data-icon="tauschen"></i>Nummern tauschen</button><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Zimmer D in Betrieb"></button></div>
<div class="nu-zeile" id="th" style="margin:0 8px 6px;display:none"><i data-icon="tauschen"></i><div>Zwei Betten antippen, deren Nummern den Platz tauschen.<small>Belegung, Sperre und Notbett bleiben bei der Nummer.</small></div><button class="nu-btn nu-btn--klein nu-btn--primaer" id="tf">Fertig</button></div>
<div class="nu-bettschalter-liste" id="d"></div></div>
<div class="nu-zimmer-einst" style="width:100%"><div class="nu-einstellung"><i data-icon="standort-2"></i><div><b>St. Nikolaus · Weitere Plätze</b><small>1 von 1 Betten in Betrieb</small></div><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Weitere Plätze in Betrieb"></button></div>
<div class="nu-bettschalter-liste" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))"><div class="nu-bettschalter" style="flex-wrap:wrap"><div style="flex:1;min-width:0"><b>N9</b><small>Matratze Flur</small></div><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Bett N9 in Betrieb"></button><button class="nu-chip" style="flex-basis:100%;justify-content:center" aria-pressed="false">Notbett</button><div style="display:flex;gap:6px;flex-basis:100%"><button class="nu-btn nu-btn--klein nu-btn--rahmen" style="flex:1"><i data-icon="stift"></i>Umbenennen</button><button class="nu-iconbtn nu-iconbtn--fl" aria-label="Platz N9 entfernen"><i data-icon="loeschen"></i></button></div></div></div>
<div style="display:flex;gap:8px;padding:0 8px 8px;flex-wrap:wrap;align-items:flex-end"><div class="nu-feld" style="width:120px"><label for="nn">Nummer</label><input class="nu-eingabe" id="nn" value="N10"></div><div class="nu-feld" style="flex:1 1 220px"><label for="nb">Bezeichnung</label><input class="nu-eingabe" id="nb" placeholder="z. B. Sofa im Saal"></div><button class="nu-btn nu-btn--rahmen"><i data-icon="bett-plus"></i>Platz hinzufügen</button></div></div>
<div class="nu-einstellung" style="width:100%"><i data-icon="telefon"></i><div><b>KHT-Nummer</b><small>Belegte Betten beider Standorte. Notbetten nur, wenn belegt.</small></div><button class="nu-btn nu-btn--rahmen nu-btn--klein">Ansehen</button></div>
</div>
<script>
var D=[["D1","belegt · Paul"],["D2","belegt · Tom"],["D3","gesperrt"],["D4","belegt · Max"],["D5","belegt · Felix"],["D6","belegt · Anna"]],modus=false,a=null;
function zeichnen(){document.getElementById("d").innerHTML=D.map(function(x){return modus?'<button class="nu-bettschalter" data-nr="'+x[0]+'" style="border:0;font:inherit;text-align:left;cursor:pointer;width:100%'+(a===x[0]?';box-shadow:inset 0 0 0 3px var(--tinte);background:var(--flaeche)':'')+'"><div style="flex:1"><b>'+x[0]+'</b><small>'+(x[2]?'Platz von '+x[2]:'antippen')+'</small></div>'+Nu.svg("tauschen")+'</button>':'<div class="nu-bettschalter'+(x[1]==="gesperrt"?' is-aus':'')+'"><div style="flex:1;min-width:0"><b>'+x[0]+'</b><small>'+x[1]+'</small></div><button class="nu-schalter" role="switch" aria-checked="'+(x[1]!=="gesperrt")+'" aria-label="Bett '+x[0]+' in Betrieb"></button></div>';}).join("");
document.querySelectorAll("#d [data-nr]").forEach(function(b){b.onclick=function(){var nr=b.dataset.nr;if(!a||a===nr){a=a===nr?null:nr;zeichnen();return;}var i=D.findIndex(function(x){return x[0]===a}),j=D.findIndex(function(x){return x[0]===nr});var t=D[i];D[i]=D[j];D[j]=t;D[i][2]=D[i][2]?null:nr;D[j][2]=D[j][2]?null:a;a=null;zeichnen();};});}
document.getElementById("ts").onclick=function(){modus=true;document.getElementById("th").style.display="flex";this.style.display="none";zeichnen();};
document.getElementById("tf").onclick=function(){modus=false;a=null;document.getElementById("th").style.display="none";document.getElementById("ts").style.display="";zeichnen();};
zeichnen();
</script>''', readme='''# Einstellungszeilen

Eine Zeile je Einstellung: Symbol, Name, aktueller Wert, rechts Schalter oder Knopf. Unter „Betten und Zimmer“ lassen sich Zimmer und **einzelne Betten sperren**, **Nummern innerhalb eines Zimmers tauschen** und **weitere Plätze** in St. Pius und St. Nikolaus anlegen.

- `nu-einstellung` mindestens 72 dp, Grund `flaeche`. Name `text-stark`, Wert `text-klein` (`tinte-2`); der Wert ist immer sichtbar.
- **Zimmerkarte** (`nu-zimmer-einst`): Zimmerzeile mit „Nummern tauschen“ und Schalter, darunter je Bett ein **Bettschalter** (`nu-bettschalter`, 56 dp): Nummer, Zustand („belegt · Paul“, „gesperrt“), Schalter. Gesperrt: schraffiert.
- **Nummern tauschen:** Der Knopf schaltet die Karte in den Tauschmodus: Bettschalter werden zu Kacheln, oben eine Zeile „Zwei Betten antippen …“. Erstes Bett antippen (Rahmen 3 dp `tinte`), zweites antippen, Rückfrage „D1 und D6 tauschen?“. Danach steht im Plan jede Nummer am Platz der anderen; Belegung, Sperre und Notbett bleiben bei der Nummer. „Ursprünglich“ setzt das Zimmer zurück, „Fertig“ beendet den Modus. Nur innerhalb eines Zimmers.
- **Weitere Plätze** (St. Pius und St. Nikolaus): Felder „Nummer“ (frei, 1–6 Zeichen, Vorschlag Z1 bzw. N9) und „Bezeichnung“, Knopf „Platz hinzufügen“. Jeder Platz lässt sich umbenennen (Nummer und Bezeichnung) und, solange er frei ist, entfernen. Doppelte Nummern lehnt die App mit Klartext ab.
- **Notbett** als Chip an Loggien, Esszimmer, Tiny House und weiteren Plätzen: Notbetten werden nur über den Kältebus belegt und zählen nur, wenn sie belegt sind.
- **Noch nicht verfügbar** (`nu-bald`): gestrichelte Marke mit Uhr. Keine stillen Platzhalter.
''', subtitle="Nummern tauschen zum Ausprobieren")

# ---------------------------------------------------------------- Hinweise mit Verfasser*in
c = COMPS[[x['name'] for x in COMPS].index("Hinweise")]
ersetze("Hinweise", height=560, html=c['html'].replace('<div style="display:grid;gap:10px"><b class="abschnitt">Seit deinem letzten Dienst',
  '<div style="display:grid;gap:10px;grid-column:1/-1;background:var(--flaeche);border-radius:16px;padding:18px;max-width:560px"><b class="abschnitt">Hinweis für die nächsten Tage</b><div class="nu-feld"><span class="nu-feldname">Von</span><div class="nu-checkliste"><button class="nu-chip" aria-pressed="false">Kim</button><button class="nu-chip" aria-pressed="false">Sam</button><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Leitung (Schwester)</button><button class="nu-chip" aria-pressed="false">Robin</button><button class="nu-chip" aria-pressed="false">Chris</button></div></div></div>'
  '<div style="display:grid;gap:10px"><b class="abschnitt">Seit deinem letzten Dienst', 1)
  + '<script>document.querySelectorAll(".nu-checkliste .nu-chip").forEach(function(c){c.onclick=function(){c.parentNode.querySelectorAll(".nu-chip").forEach(function(x){var an=x===c;x.setAttribute("aria-pressed",String(an));var t=x.textContent;x.innerHTML=(an?Nu.svg("check","klein"):"")+t;});};});</script>',
  readme=c['readme'].replace('- Karte `nu-hinweis` auf `flaeche`, Kopf mit Absender (`tinte`, 600), Herkunft und Gültigkeit in `text-klein`, darunter der Text.',
  '- Karte `nu-hinweis` auf `flaeche`, Kopf mit Absender (`tinte`, 600), Herkunft und Gültigkeit in `text-klein`, darunter der Text.\n- **Von wem:** Beim Anlegen wählt man den Absender aus Chips: zuerst die Personen im Dienst, dann **Leitung** (die Schwester, auch wenn sie nicht im Dienstplan steht), dann das übrige Team. Vorgewählt ist die aktive Person. Hinweise der Leitung können auch über Nextcloud kommen.'))

# ---------------------------------------------------------------- Besetzung mit Grund
c = COMPS[[x['name'] for x in COMPS].index("Besetzung")]
ersetze("Besetzung", height=360, html=c['html'].replace('</div>\n</div>', '</div>\n<div class="nu-feld" style="width:100%;max-width:520px;background:var(--flaeche);border-radius:16px;padding:16px"><span class="nu-feldname">Person tauschen · Grund</span><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">Krankheit</button><button role="radio" aria-checked="false">Tausch</button><button role="radio" aria-checked="false">Sonstiges</button></div></div>\n</div>', 1) if '</div>\n</div>' in c['html'] else c['html'],
  readme=c['readme'] + '- **Person tauschen** fragt nach dem Grund: Krankheit, Tausch oder Sonstiges. Geplante Person, tatsächliche Person und Grund zählen im Monatsabschluss (krank, abgegeben, Vertretung).\n- Die Unterschrift in der Besetzung ist der Nachweis, dass der Dienst gemacht wurde.\n')

# ---------------------------------------------------------------- Monatsabschluss
TAB = '''<table class="nu-tabelle"><thead><tr><th>Person</th><th class="zahl">Geplant</th><th class="zahl">Gemacht</th><th>Abweichung</th><th>Status</th><th></th></tr></thead><tbody>
<tr><td><b>Kim</b></td><td class="zahl">10</td><td class="zahl">9</td><td>1 abgegeben</td><td><span class="nu-pille nu-pille--frei"><i data-icon="check" class="klein"></i>unterschrieben 01.10. 07:10</span></td><td style="text-align:right"><button class="nu-btn nu-btn--klein nu-btn--rahmen">Ansehen</button></td></tr>
<tr><td><b>Robin</b></td><td class="zahl">10</td><td class="zahl">9</td><td>1 krank</td><td><span class="nu-pille nu-pille--warnung">offen</span></td><td style="text-align:right"><button class="nu-btn nu-btn--klein nu-btn--rahmen">Öffnen</button></td></tr>
<tr><td><b>Chris</b></td><td class="zahl">10</td><td class="zahl">11</td><td>1 Vertretung</td><td><span class="nu-pille nu-pille--warnung">offen</span></td><td style="text-align:right"><button class="nu-btn nu-btn--klein nu-btn--rahmen">Öffnen</button></td></tr>
<tr><td><b>Mika</b></td><td class="zahl">15</td><td class="zahl">15</td><td>–</td><td><span class="nu-pille nu-pille--frei"><i data-icon="check" class="klein"></i>unterschrieben 01.10. 09:12</span></td><td style="text-align:right"><button class="nu-btn nu-btn--klein nu-btn--rahmen">Ansehen</button></td></tr></tbody></table>'''
LOHN = '''<table class="nu-tabelle"><thead><tr><th>Person</th><th class="zahl">Geplant</th><th class="zahl">Gemacht</th><th class="zahl">Krank</th><th class="zahl">Abgegeben</th><th class="zahl">Vertretung</th><th>Unterschrieben</th><th>PDF</th></tr></thead><tbody>
<tr><td><b>Kim</b></td><td class="zahl">10</td><td class="zahl">9</td><td class="zahl">0</td><td class="zahl">1</td><td class="zahl">0</td><td>01.10. 07:10</td><td><i data-icon="pdf" class="klein"></i> 2026-09_Dienstnachweis_Kim.pdf</td></tr>
<tr><td><b>Mika</b></td><td class="zahl">15</td><td class="zahl">15</td><td class="zahl">0</td><td class="zahl">0</td><td class="zahl">0</td><td>01.10. 09:12</td><td><i data-icon="pdf" class="klein"></i> 2026-09_Dienstnachweis_Mika.pdf</td></tr></tbody></table>'''
neu_nach("BerichtAbgeschlossen", "Monatsabschluss", "Dienst und Bericht", 760, '''<div class="nu" style="width:1100px;background:var(--grund);padding:20px;display:grid;gap:16px">
<div class="nu-banner" style="background:var(--erwartet-flaeche);color:var(--blau)"><i data-icon="unterschrift"></i><div>Sam: Heute ist dein letzter geplanter Dienst im Oktober.<small>Dienstnachweis jetzt ansehen und unterschreiben? Freiwillig, geht auch später im Monatsabschluss.</small></div><button class="nu-btn nu-btn--klein">Später</button><button class="nu-btn nu-btn--klein nu-btn--primaer">Ansehen</button></div>
<div class="nu-bericht" style="gap:14px"><div style="display:flex;align-items:center;gap:12px"><b class="abschnitt" style="flex:1">Monatsabschluss · September 2026</b><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">September 2026</button><button role="radio" aria-checked="false">Oktober 2026</button></div></div>
<p class="nu-beschr" style="font-size:15px;line-height:22px">Jede Person unterschreibt einmal im Monat. 2 von 4 unterschrieben.</p>__TAB__</div>
<div class="nu-bericht" style="gap:12px"><div style="display:flex;align-items:center;gap:12px"><b class="abschnitt" style="flex:1">Für die Lohnabrechnung</b><span class="nu-bald"><i data-icon="uhr" class="klein"></i>Export als Datei noch nicht verfügbar</span></div>__LOHN__</div>
</div>'''.replace('__TAB__', TAB).replace('__LOHN__', LOHN), '''# Monatsabschluss

Am Monatsende unterschreibt jede Person aus dem Team einmal ihren Dienstnachweis; daraus entsteht die Tabelle für die Lohnabrechnung.

- **Ort:** Reiter „Monatsabschluss“ in Dienst & Bericht, mit Umschalter Vormonat / laufender Monat (`nu-seg`).
- **Übersicht** (`nu-tabelle`): je Person Geplant, Gemacht, Abweichung („1 krank“, „1 abgegeben“, „1 Vertretung“), Status als Pille („unterschrieben 01.10. 07:10“ in `frei`, „offen“ in `warnung`) und „Öffnen“ bzw. „Ansehen“. Darüber „2 von 4 unterschrieben“.
- **Für die Lohnabrechnung:** nur unterschriebene Nachweise, Spalten Geplant, Gemacht, Krank, Abgegeben, Vertretung, Unterschrieben, PDF. Die Tabelle liegt mit den PDFs in Nextcloud (Lohnabrechnung_2026-09); Zahlen rechtsbündig in `nummer`.
- **Hinweis beim letzten geplanten Dienst:** Ist heute der letzte geplante Dienst einer Person im Monat und hat sie noch nicht unterschrieben, steht oben im Bericht ein Banner (Grund `erwartet-flaeche`) mit „Später“ und „Ansehen“. Freiwillig, nie blockierend.
- Tabelle ohne Linienraster: Kopf auf `flaeche-2`, Zeilen mit feiner Trennlinie `linie`, Abweichungen im Nachweis mit Grund `warnung-flaeche`.
''', width=1100, subtitle="Übersicht und Lohntabelle")

neu_nach("Monatsabschluss", "Dienstnachweis", "Dienst und Bericht", 860, '''<div class="nu" style="width:820px;background:var(--grund);padding:20px">
<div style="background:var(--flaeche);border-radius:16px;padding:24px;display:grid;gap:16px">
<div><h2 style="margin:0;font:700 22px/28px var(--font-ui)">Dienstnachweis September 2026 · Robin</h2><p class="nu-beschr" style="font-size:15px;line-height:22px;margin-top:4px">Gemacht zählt jeder Dienst mit Unterschrift im Bericht bis jetzt. Nach der Unterschrift ist der Nachweis gesperrt.</p></div>
<div class="nu-kennzahlen" style="background:var(--flaeche-2)"><span class="nu-kennzahl">Geplant<b>10</b></span><span class="nu-kennzahl">Gemacht<b>9</b></span><span class="nu-kennzahl">Krank<b>1</b></span><span class="nu-kennzahl">Abgegeben<b>0</b></span><span class="nu-kennzahl">Vertretung<b>0</b></span></div>
<table class="nu-tabelle"><thead><tr><th>Datum</th><th>Geplant</th><th>Gemacht</th><th>Bemerkung</th></tr></thead><tbody>
<tr><td class="zahl" style="text-align:left">Di 08.09.</td><td><i data-icon="check" class="klein"></i></td><td><i data-icon="check" class="klein"></i> Betreuung 2</td><td></td></tr>
<tr class="is-abweichung"><td class="zahl" style="text-align:left">Fr 11.09.</td><td><i data-icon="check" class="klein"></i></td><td>–</td><td>krank · vertreten durch Chris</td></tr>
<tr><td class="zahl" style="text-align:left">Mo 14.09.</td><td><i data-icon="check" class="klein"></i></td><td><i data-icon="check" class="klein"></i> Betreuung 2</td><td></td></tr></tbody></table>
<button class="nu-btn nu-btn--rahmen nu-btn--klein" style="justify-self:start" id="kb"><i data-icon="stift"></i>Geplante Dienste korrigieren</button>
<div class="nu-banner" id="kw" style="display:none"><i data-icon="warnung"></i><div>Der Originalplan ist Grundlage der Lohnabrechnung.<small>Nur korrigieren, wenn er falsch übernommen wurde. Die Änderung wird mit Name und Uhrzeit gespeichert.</small></div></div>
<div class="nu-unterschrift" id="u"><div class="nu-unterschrift-kopf"><b>Robin</b><small>Die Angaben stimmen</small></div><div class="nu-unterschrift-feld" style="height:150px"><span class="nu-unterschrift-marke"><i data-icon="check" class="klein"></i>Bestätigt</span><span class="nu-unterschrift-hilfe">Mit Finger oder Stift unterschreiben</span></div><div class="nu-unterschrift-knoepfe"><button class="nu-btn nu-btn--klein" data-a="leeren"><i data-icon="rueckgaengig"></i>Löschen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-a="ok" disabled>Unterschreiben</button></div></div>
<div class="nu-gesperrt" id="g" style="display:none"><i data-icon="schloss" class="zu"></i><div style="flex:1">Unterschrieben 02.10. 14:00<small>2026-09_Dienstnachweis_Robin.pdf · in der Lohntabelle · nicht mehr änderbar</small></div></div>
</div></div>
<script>Nu.mountIcons();document.getElementById("kb").onclick=function(){document.getElementById("kw").style.display="flex";};
var r=document.getElementById("u"),ok=r.querySelector('[data-a="ok"]'),u=Nu.unterschrift(r,{onChange:function(v){ok.disabled=!v}});r.querySelector('[data-a="leeren"]').onclick=function(){u.leeren()};
ok.onclick=function(){if(u.bestaetigen()){document.getElementById("g").style.display="flex";document.getElementById("kb").style.display="none";document.getElementById("kw").style.display="none";r.querySelector(".nu-unterschrift-knoepfe").style.display="none";}};</script>''', '''# Dienstnachweis

Der Nachweis einer Person für einen Monat: geplante gegen gemachte Dienste, Abweichungen mit Grund, eine Unterschrift. Danach ist er gesperrt.

- **Geplant** = Originalplan, wie er vor Monatsanfang feststand (Dienstplan-Import). **Gemacht** = jeder Dienst, bei dem die Person in der Besetzung des Dienstberichts unterschrieben hat, bis zum Moment der Unterschrift unter den Nachweis.
- Kopf mit Kennzahlen Geplant, Gemacht, Krank, Abgegeben, Vertretung; darunter je Tag eine Zeile: Datum, Geplant ✓, Gemacht ✓ mit Rolle, Bemerkung („krank · vertreten durch Chris“, „Vertretung für Robin · Krankheit“, „ohne Unterschrift im Bericht“). Abweichungen auf `warnung-flaeche`.
- **Geplante Dienste korrigieren:** nur vor der Unterschrift; öffnet ein Blatt mit Warnbanner („Der Originalplan ist Grundlage der Lohnabrechnung …“), allen Tagen des Monats als Chips und Pflichtfeld „Grund“; der rote Knopf „Korrektur speichern“ (`nu-btn--gefahr-voll`). Jede Korrektur steht danach als Warnzeile im Nachweis (Tage, Grund, wer, wann).
- **Unterschrift** mit dem Unterschriftsfeld („Die Angaben stimmen“). Danach: Leiste `nu-gesperrt` „Unterschrieben 02.10. 14:00 · PDF · in der Lohntabelle · nicht mehr änderbar“, keine Knöpfe mehr. Das PDF `2026-09_Dienstnachweis_Robin.pdf` wird abgelegt, die Zahlen gehen in die Lohntabelle.
- Wer unterschreibt, ist die Person selbst; die App fragt nicht nach PIN, zeigt aber den Namen groß im Feld.
''', width=820, subtitle="Unterschreiben zum Ausprobieren")
