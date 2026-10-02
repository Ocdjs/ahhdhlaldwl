# Änderungsrunden 4 und 5: Monatsabschluss nach Betreuung und Küche getrennt, kein „krank“, Bericht-Reihenfolge,
# Abschluss ohne Unterschrift (gerade Küche), danach nur ergänzen, Hinweise mit Anzeigedauer, Archiv mit Kommentaren,
# Bad und Türen im Grundriss, Kalender ändern mit PIN, Dienstplan einlesen mit Prüfmaske.
from comps1 import COMPS
from comps5 import ersetze, neu_nach, GRH

def comp(name): return COMPS[[x['name'] for x in COMPS].index(name)]
def textfix(name, alt, neu):
    c = comp(name); assert alt in c['readme'], (name, alt[:60]); c['readme'] = c['readme'].replace(alt, neu)
def chips(namen, an=None, act=""):
    return ''.join('<button class="nu-chip" aria-pressed="%s"%s>%s%s</button>' % ('true' if n == an else 'false', act, '<i data-icon="check" class="klein"></i>' if n == an else '', n) for n in namen)
WAHL_JS = '<script>document.querySelectorAll("[data-wahl]").forEach(function(g){g.querySelectorAll(".nu-chip").forEach(function(c){c.onclick=function(){g.querySelectorAll(".nu-chip").forEach(function(x){var an=x===c,t=x.textContent;x.setAttribute("aria-pressed",String(an));x.innerHTML=(an?Nu.svg("check","klein"):"")+t;});};});});</script>'

# ---------------------------------------------------------------- Grundriss: Bad und Türen
c = comp("Grundriss")
c['html'] = c['html'].replace('grundriss(BEISPIEL', 'grundriss(BEISPIEL', 1)
c['readme'] = c['readme'].replace("- Wände 6 Einheiten `tinte`, Türen als Bogen mit Blatt 1,5 Einheiten `tinte-3`. Räume ohne Tür (Privat) und das Bad: Fläche `flaeche-3`, Wort in Versalien, nicht antippbar.",
  "- Wände 6 Einheiten `tinte`, Türen als Bogen mit Blatt 1,5 Einheiten `tinte-3`. Räume ohne Tür (Privat): Fläche `flaeche-3`, Wort in Versalien, nicht antippbar.\n- **Bad** zwischen Flur und Privat: antippbare Fläche mit Zustand (siehe Baustein Tür und Bad).\n- **Türen schließen sich:** Ist ein Zimmer ganz gesperrt (D, T, F, B), das Bad abgeschlossen oder der Flur gesperrt, dreht sich das Türblatt animiert in die Wand (siehe Tür und Bad).")
neu_nach("Grundriss", "TuerUndBad", "Bettenplan", 900, '''<div class="nu" style="width:1240px;background:var(--grund);padding:20px;display:grid;gap:12px">
<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="nu-btn nu-btn--rahmen nu-btn--klein" id="tf"><i data-icon="schloss"></i>T-Zimmer und Zimmer F sperren</button><button class="nu-btn nu-btn--rahmen nu-btn--klein" id="du"><i data-icon="dusche"></i>Letzte Dusche erledigt</button><span class="nu-beschr" id="st">Bad zu · noch 2 Duschen. Auf das Bad tippen, wenn es offen ist.</span></div>
<div style="max-width:1000px;background:var(--flaeche);border-radius:16px;padding:16px" id="g"></div></div>
__GRH__
<script>
var aus={},bad="zu",vor={D:false,T:false,F:false,B:false,FLUR:false,BAD:true};
function zeichne(){var zu={D:!!aus.D,T:!!aus.T,F:!!aus.F,B:!!aus.B,FLUR:!!(aus.T&&aus.F),BAD:bad!=="frei"},an={};Object.keys(zu).forEach(function(k){if(zu[k]!==vor[k])an[k]=zu[k]?"schliessen":"oeffnen";});vor=zu;
 var b=JSON.parse(JSON.stringify(BEISPIEL));["T","F"].forEach(function(z){if(aus[z])Object.keys(b).forEach(function(n){if(n.charAt(0)===z)b[n]={s:"aus"};});});
 document.getElementById("g").innerHTML=grundriss(b,aus,bad,an);Nu.mountIcons();
 document.querySelector(".nu-bad").onclick=function(){if(bad==="erinnern"){bad="frei";document.getElementById("st").textContent="Bad frei. Erneut antippen fragt: „Bad wieder abschließen?“";}else if(bad==="frei"){bad="zu";document.getElementById("st").textContent="Bad wieder abgeschlossen.";}else{document.getElementById("st").textContent="Noch nicht alle geduscht – die App fragt „Bad schon aufschließen?“";return;}zeichne();};}
document.getElementById("tf").onclick=function(){aus.T=aus.F=!aus.T;this.lastChild.textContent=aus.T?"T-Zimmer und Zimmer F entsperren":"T-Zimmer und Zimmer F sperren";zeichne();};
document.getElementById("du").onclick=function(){if(bad==="zu"){bad="erinnern";document.getElementById("st").textContent="Erinnerung: „Bad aufschließen“ (Glocke und Einblendung). Jetzt auf das Bad tippen.";zeichne();}};
zeichne();
</script>'''.replace('__GRH__', GRH), '''# Tür und Bad

Türen im Grundriss zeigen, was zu ist: ein ganz gesperrtes Zimmer, der gesperrte Flur und das abgeschlossene Bad. Das Bad ist während der Duschzeit abgeschlossen und erinnert ans Aufschließen.

**Bad** (`nu-bad`, liegt als Knopf über der Badfläche des Grundrisses)
| Zustand | Aussehen | Bedeutung |
| --- | --- | --- |
| `zu` | `flaeche-3`, Symbol `schloss`, „zu · noch 2 Duschen“ | abgeschlossen, solange geplante Duschen offen sind |
| `erinnern` | `warnung-flaeche`, Rand 3 dp `warnung`, pulsiert dreimal, Symbol `glocke`, „Alle geduscht · aufschließen“ | alle Duschen des Abends erledigt oder verpasst |
| `frei` | `frei-flaeche`, Text `frei`, Symbol `schloss-offen`, „frei“ | aufgeschlossen |

- Jeder Diensttag beginnt mit „zu“. Sobald im Duschplan keine Dusche mehr „geplant“ ist: Einblendung **„Bad aufschließen“**, Eintrag an der Glocke (führt zum Bad im Grundriss) und Zustand `erinnern`.
- **Kurz antippen** schließt auf (`frei`, Einblendung „Bad ist frei · Aufgeschlossen um 21:42“). Antippen bei `zu` fragt „Bad schon aufschließen? Noch nicht geduscht: 20:30 Lisa“; bei `frei` fragt es „Bad wieder abschließen?“ (z. B. für eine Dusche außer der Reihe).
- Vergangene Tage: nur Anzeige, nicht antippbar. Unter 900 dp steht das Bad als Kachel unter den Zimmerrahmen.

**Türen** (`nu-tuer`): Angel, offenes Türblatt und Schließwinkel stehen in der Grundriss-Geometrie (`tueren`).
- Offen: Bogen und Blatt 1,5 Einheiten `tinte-3`. Zu: das Blatt liegt in der Wandflucht, 6 Einheiten `tinte`, der Bogen ist weg – die Wand ist geschlossen.
- **Animation:** Schließen 700 ms, Blatt dreht um die Angel, beschleunigt und federt am Ende kurz nach (`cubic-bezier(.55,0,.85,.35)`); der Bogen blendet aus. Öffnen 700 ms mit `kurve-austritt`. Die Animation läuft, wenn sich der Zustand ändert, während der Grundriss sichtbar ist – oder beim nächsten Öffnen des Bettenplans, wenn ein Zimmer in den Einstellungen gesperrt wurde. Beim Wechsel des Tages keine Animation.
- Welche Tür: Zimmer D, T-Zimmer (zwischen T und F), Zimmer F (zum Flur), Zimmer B, Flur (wenn T und F gesperrt), Bad. Die Tür zwischen den beiden Räumen von Zimmer D schließt nie.
- Reduzierte Bewegung: Endzustand sofort.

**Compose:** Türblatt als `drawLine` in `rotate(winkel, pivot = angel)`; `animateFloatAsState(if (zu) winkelZu else 0f, tween(700, easing = CubicBezierEasing(.55f, 0f, .85f, .35f)))`. Bad als eigenes Composable über dem `Canvas`. Zustand aus `Duschplan.bad` (siehe Dateisystem).
''', width=1240, subtitle="Sperren und Bad zum Ausprobieren")

# ---------------------------------------------------------------- Besetzung ohne „Krankheit“
c = comp("Besetzung")
c['html'] = c['html'].replace('<button role="radio" aria-checked="true">Krankheit</button><button role="radio" aria-checked="false">Tausch</button>', '<button role="radio" aria-checked="true">Tausch</button>')
c['readme'] = c['readme'].replace("- Ohne alle Unterschriften lässt sich der Bericht nicht abschließen; der Knopf sagt, was fehlt.",
  "- Fehlt eine Unterschrift (oft beim Küchendienst, der früher geht), lässt sich der Bericht trotzdem abschließen – nach der Rückfrage „Wirklich ohne Unterschrift abschließen?“. Danach heißt der Knopf „Unterschrift nachholen“.").replace(
  "- **Person tauschen** fragt nach dem Grund: Krankheit, Tausch oder Sonstiges. Geplante Person, tatsächliche Person und Grund zählen im Monatsabschluss (krank, abgegeben, Vertretung).",
  "- **Person tauschen** fragt nach dem Grund: **Tausch** oder **Sonstiges** (kein „krank“). Geplante Person, tatsächliche Person und Grund zählen im Monatsabschluss (abgegeben, Vertretung).")

# ---------------------------------------------------------------- Monatsabschluss: Betreuung und Küche getrennt
def tab(zeilen):
    return '<table class="nu-tabelle"><thead><tr><th>Person</th><th class="zahl">Geplant</th><th class="zahl">Gemacht</th><th>Abweichung</th><th>Status</th><th></th></tr></thead><tbody>' + ''.join(
        '<tr><td><b>%s</b></td><td class="zahl">%s</td><td class="zahl">%s</td><td>%s</td><td>%s</td><td style="text-align:right"><button class="nu-btn nu-btn--klein nu-btn--rahmen">%s</button></td></tr>' % (
            p, g, m, a, '<span class="nu-pille nu-pille--frei"><i data-icon="check" class="klein"></i>unterschrieben %s</span>' % u if u else '<span class="nu-pille nu-pille--warnung">offen</span>', 'Ansehen' if u else 'Öffnen') for p, g, m, a, u in zeilen) + '</tbody></table>'
def lohn(zeilen, ordner):
    return '<table class="nu-tabelle"><thead><tr><th>Person</th><th class="zahl">Geplant</th><th class="zahl">Gemacht</th><th class="zahl">Abgegeben</th><th class="zahl">Vertretung</th><th>Unterschrieben</th><th>PDF</th></tr></thead><tbody>' + ''.join(
        '<tr><td><b>%s</b></td><td class="zahl">%s</td><td class="zahl">%s</td><td class="zahl">%s</td><td class="zahl">%s</td><td>%s</td><td><i data-icon="pdf" class="klein"></i> 2026-09_Dienstnachweis_%s_%s.pdf</td></tr>' % (p, g, m, ab, v, u, ordner, p) for p, g, m, ab, v, u in zeilen) + '</tbody></table>'
ersetze("Monatsabschluss", height=980, html='''<div class="nu" style="width:1100px;background:var(--grund);padding:20px;display:grid;gap:16px">
<div class="nu-banner" style="background:var(--erwartet-flaeche);color:var(--blau)"><i data-icon="unterschrift"></i><div>Sam: Heute ist dein letzter geplanter Dienst im Oktober.<small>Dienstnachweis jetzt ansehen und unterschreiben? Freiwillig, geht auch später im Monatsabschluss.</small></div><button class="nu-btn nu-btn--klein">Später</button><button class="nu-btn nu-btn--klein nu-btn--primaer">Ansehen</button></div>
<div class="nu-bericht" style="gap:14px"><div style="display:flex;align-items:center;gap:12px"><b class="abschnitt" style="flex:1">Monatsabschluss · September 2026</b><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">September 2026</button><button role="radio" aria-checked="false">Oktober 2026</button></div></div>
<p class="nu-beschr" style="font-size:15px;line-height:22px">Jede Person unterschreibt einmal im Monat, je Bereich. Wer in Betreuung und Küche arbeitet, unterschreibt zwei Nachweise.</p>
<b class="abschnitt" style="font-size:16px"><i data-icon="personen" class="klein"></i> Betreuung · 1 von 5 unterschrieben</b>__T1__
<b class="abschnitt" style="font-size:16px"><i data-icon="kueche" class="klein"></i> Küche · 1 von 2 unterschrieben</b>__T2__</div>
<div class="nu-bericht" style="gap:12px"><b class="abschnitt">Für die Lohnabrechnung · Betreuung</b>__L1__<b class="abschnitt">Für die Lohnabrechnung · Küche</b>__L2__</div>
</div>'''.replace('__T1__', tab([("Kim", 10, 9, "1 abgegeben", None), ("Sam", 20, 20, "–", None), ("Robin", 10, 9, "1 abgegeben", "02.10. 14:00"), ("Chris", 10, 11, "1 Vertretung", None), ("Jule", 0, 1, "1 Vertretung", None)]))
   .replace('__T2__', tab([("Jule", 15, 15, "–", "29.09. 19:05"), ("Mika", 15, 15, "–", None)]))
   .replace('__L1__', lohn([("Robin", 10, 9, 1, 0, "02.10. 14:00")], "Betreuung")).replace('__L2__', lohn([("Jule", 15, 15, 0, 0, "29.09. 19:05")], "Kueche")),
  readme='''# Monatsabschluss

Am Monatsende unterschreibt jede Person aus dem Team ihren Dienstnachweis – **je Bereich**: Betreuung und Küche werden getrennt geführt und getrennt bezahlt. Wer beides macht (z. B. Jule), hat zwei Nachweise und steht in beiden Lohntabellen.

- **Ort:** Reiter „Monatsabschluss“ in Dienst & Bericht, Umschalter Vormonat / laufender Monat (`nu-seg`).
- **Zwei Abschnitte** „Betreuung“ und „Küche“, je mit „x von y unterschrieben“ und einer Tabelle (`nu-tabelle`): Person, Geplant, Gemacht, Abweichung („1 abgegeben“, „1 Vertretung“), Status („unterschrieben 02.10. 14:00“ in `frei`, „offen“ in `warnung`), „Öffnen“ bzw. „Ansehen“.
- **Kein „krank“:** Abweichungen kennen nur abgegeben (Tausch, Sonstiges) und Vertretung.
- **Für die Lohnabrechnung:** zwei Tabellen, Betreuung und Küche, nur unterschriebene Nachweise: Geplant, Gemacht, Abgegeben, Vertretung, Unterschrieben, PDF. In Nextcloud als `Lohnabrechnung_2026-09_Betreuung.csv` und `Lohnabrechnung_2026-09_Kueche.csv` neben den PDFs.
- **Hinweis beim letzten geplanten Dienst:** Banner (Grund `erwartet-flaeche`) mit „Später“ und „Ansehen“. Freiwillig, nie blockierend.
- **Keine PIN** zum Unterschreiben: die Person unterschreibt selbst.
''', width=1100, subtitle="Betreuung und Küche getrennt")

c = comp("Dienstnachweis")
c['html'] = (c['html'].replace('Dienstnachweis September 2026 · Robin', 'Dienstnachweis Betreuung · September 2026 · Robin')
  .replace('<span class="nu-kennzahl">Krank<b>1</b></span><span class="nu-kennzahl">Abgegeben<b>0</b></span>', '<span class="nu-kennzahl">Abgegeben<b>1</b></span>')
  .replace('<td>krank · vertreten durch Chris</td>', '<td>abgegeben an Chris · Tausch</td>')
  .replace('2026-09_Dienstnachweis_Robin.pdf · in der Lohntabelle', '2026-09_Dienstnachweis_Betreuung_Robin.pdf · in der Lohntabelle Betreuung'))
c['readme'] = '''# Dienstnachweis

Der Nachweis einer Person für einen Monat **und einen Bereich** (Betreuung oder Küche): geplante gegen gemachte Dienste, Abweichungen mit Grund, eine Unterschrift. Danach ist er gesperrt.

- **Geplant** = Originalplan, wie er zu Monatsbeginn eingelesen und geprüft wurde (Einstellungen › Dienstplan einlesen). **Gemacht** = jeder Dienst, bei dem die Person in der Besetzung des Dienstberichts unterschrieben hat, bis zum Moment der Unterschrift unter den Nachweis. Ein Dienst ohne Unterschrift im Bericht zählt erst, wenn sie nachgeholt ist.
- Kopf „Dienstnachweis Betreuung · September 2026 · Robin“, Kennzahlen Geplant, Gemacht, Abgegeben, Vertretung (**kein Krank**); darunter je Tag Datum, Geplant ✓, Gemacht ✓ mit Rolle, Bemerkung („abgegeben an Chris · Tausch“, „Vertretung für Robin“, „ohne Unterschrift im Bericht“). Abweichungen auf `warnung-flaeche`.
- **Geplante Dienste korrigieren:** nur vor der Unterschrift, mit Warnbanner, Tages-Chips und Pflichtgrund; roter Knopf „Korrektur speichern“. Jede Korrektur steht danach als Warnzeile im Nachweis.
- **Unterschrift** mit dem Unterschriftsfeld („Die Angaben stimmen“), **ohne PIN**. Danach `nu-gesperrt` „Unterschrieben … · PDF · in der Lohntabelle Betreuung · nicht mehr änderbar“. PDF `2026-09_Dienstnachweis_Betreuung_Robin.pdf`.
'''

# ---------------------------------------------------------------- Berichtsfelder in neuer Reihenfolge
JN = lambda an=None: '<div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="%s">Ja</button><button role="radio" aria-checked="%s">Nein</button></div>' % ('true' if an == 'ja' else 'false', 'true' if an == 'nein' else 'false')
ersetze("Berichtsfelder", height=1000, html='''<div class="nu nu-vorschau" style="display:block;max-width:1000px"><div class="nu-bericht">
<div class="nu-bericht-zeile"><span class="nu-feldname">Hat KHT angerufen?</span><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">__JA__<span class="nu-pille"><i data-icon="telefon" class="klein"></i>KHT-Nummer 25</span></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Wichtige Hinweise</span><textarea class="nu-eingabe" style="min-height:96px">Gelbe Karte für @Felix (D5): laute Musik nach 23 Uhr.</textarea></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Fragen von Gästen</span><textarea class="nu-eingabe" style="min-height:72px">@Tom (D2) fragt nach Arbeitsschuhen in Größe 44.</textarea></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Abwesenheiten</span><div style="display:grid;gap:6px"><div class="nu-zeile"><i data-icon="schloss"></i><div>Anna · D6 · freigehalten bis 06.10.<small>aus dem Bettenplan</small></div></div><div class="nu-zeile nu-zeile--warnung"><i data-icon="abwesend"></i><div>Julia · L2 · fehlt unentschuldigt, 1. Nacht<small>aus dem Bettenplan</small></div></div></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Externe Gäste</span><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="nu-pille"><i data-icon="person" class="klein"></i>Otto (Kältebus)</span><button class="nu-chip"><i data-icon="plus" class="klein"></i>Gast hinzufügen</button></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Vorfälle</span><div style="display:flex;align-items:center;gap:12px">__LEER__<span class="nu-pille nu-pille--warnung"><i data-icon="warnung" class="klein"></i>Pflichtfeld</span></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Schlüssel fehlt</span><div style="display:flex;gap:12px;align-items:center">__JA__<input class="nu-eingabe" style="max-width:200px" placeholder="Nummer(n)" value="7"></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Fehlt etwas</span><div class="nu-checkliste"><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Toilettenpapier</button><button class="nu-chip">Putzmittel</button><button class="nu-chip">Decken</button><input class="nu-eingabe" style="flex:1 1 260px" value="Müllbeutel 120 l" aria-label="Was genau fehlt"></div></div>
<div class="nu-bericht-zeile"><span class="nu-feldname">Sonstiges</span><textarea class="nu-eingabe" style="min-height:72px"></textarea></div>
<div style="display:flex;justify-content:flex-end;align-items:center;gap:12px;flex-wrap:wrap"><span class="nu-beschr">Es fehlt: Vorfälle. Unterschrift Jule fehlt (geht auch ohne)</span><button class="nu-btn nu-btn--primaer"><i data-icon="schloss"></i>Bericht abschließen</button></div>
</div></div>'''.replace('__JA__', JN('ja')).replace('__LEER__', JN()), readme='''# Berichtsfelder

Jedes Feld des Dienstberichts hat eine Zeile mit Beschriftung links und Eingabe rechts – **in dieser Reihenfolge**:

1. Besetzung (Betreuung und Küche, siehe Besetzung)
2. **Hat KHT angerufen?** – Ja/Nein, daneben die Pille „KHT-Nummer 25“
3. **Wichtige Hinweise** – Freitext mit @-Erwähnung und Stufenwörtern
4. **Fragen von Gästen**
5. **Abwesenheiten** – automatisch aus dem Bettenplan (freigehalten, frei bis Rückkehr, fehlt unentschuldigt)
6. **Externe Gäste**
7. **Vorfälle** – Ja/Nein; Einzelheiten unter „Wichtige Hinweise“
8. **Schlüssel fehlt** – Ja/Nein mit Nummer
9. **Fehlt etwas** – Chips und Freitext „Was genau?“
10. **Sonstiges**

- Zeile `nu-bericht-zeile`: Beschriftung 220 dp (`text-stark`), Eingabe daneben, zwischen Feldern `abstand-6`, keine Linien.
- **Pflicht** sind „Hat KHT angerufen?“ und „Vorfälle“ (Pille „Pflichtfeld“ in `warnung` beim Abschließen) sowie eindeutige Erwähnungen. **Unterschriften sind keine Pflicht:** der Text neben dem Knopf sagt „Unterschrift Jule fehlt (geht auch ohne)“, beim Abschließen fragt die App nach (siehe Bericht abgeschlossen).
- Ein Bericht mit „Vorfälle: Ja“ bekommt den Rahmen 3 dp `vorfall`.
- Die PDF-Tabelle „Feld | Eintrag“ folgt derselben Reihenfolge.
''', width=1040)

# ---------------------------------------------------------------- Bericht abgeschlossen: ohne Unterschrift, nur ergänzen
ersetze("BerichtAbgeschlossen", height=1020, html='''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:900px">
<div class="nu-dialog" role="alertdialog" style="position:static;margin:0 auto"><h2>Wirklich ohne Unterschrift abschließen?</h2><p>Es fehlt die Unterschrift von Jule (Küche). Der Küchendienst geht oft früher, das ist in Ordnung. Der Bericht wird im PDF als „ohne Unterschrift“ markiert. Der Dienst zählt im Monatsabschluss erst, wenn die Unterschrift nachgeholt ist.</p><div class="nu-dialog-knoepfe"><button class="nu-btn nu-btn--klein">Zurück</button><button class="nu-btn nu-btn--gefahr-voll nu-btn--klein">Ja, trotzdem abschließen</button></div></div>
<div class="nu-gesperrt" style="width:100%"><i data-icon="schloss" class="zu"></i><div style="flex:1">Bericht abgeschlossen <span class="nu-pille nu-pille--warnung"><i data-icon="warnung" class="klein"></i>ohne Unterschrift: Jule</span><small>03.10. · 07:42 · Kim, Sam, Jule · PDF gespeichert und abgeglichen · nicht mehr änderbar, nur ergänzen</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="pdf"></i>PDF ansehen</button><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="teilen"></i>Teilen</button></div>
<div class="nu-besetzung" style="width:100%"><span class="rolle">Küche</span><button class="nu-person" aria-pressed="false" disabled><span class="nu-kuerzel">JU</span>Jule</button><button class="nu-mini-unterschrift"><i data-icon="unterschrift" class="klein"></i>Unterschrift nachholen</button></div>
<div style="width:100%;background:#fff;color:#1a1a1a;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.25);padding:22px 26px;display:grid;gap:10px;font:13px/1.45 var(--font-ui)"><div style="border:3px solid #b3261e;color:#b3261e;font-weight:800;text-transform:uppercase;letter-spacing:.05em;padding:6px 12px;border-radius:4px;justify-self:start;transform:rotate(-1.5deg)">Ohne Unterschrift abgeschlossen: Jule</div><div style="display:flex;justify-content:space-between;border-bottom:2px solid #1a1a1a;padding-bottom:6px"><b style="font-size:15px">Dienstbericht Notübernachtung</b><span>Freitag, 2. Oktober 2026</span></div><div>Küche · Jule · <b style="color:#b3261e;font-size:11px;letter-spacing:.04em">OHNE UNTERSCHRIFT</b></div></div>
<div class="nu-nachtrag" style="width:100%"><b>Ergänzung</b>Unterschrift von Jule nachgeholt.<small>03.10. · 18:55 · Jule</small></div>
<button class="nu-btn nu-btn--rahmen"><i data-icon="stift"></i>Ergänzen</button>
</div>''', readme='''# Bericht abgeschlossen

Abschließen geht auch ohne Unterschrift – gerade beim Küchendienst, der früher geht. Danach ist der Bericht nicht mehr änderbar, nur noch ergänzbar.

- **Abschließen** prüft „Hat KHT angerufen?“, „Vorfälle“ und eindeutige Erwähnungen; fehlt davon etwas, springt die Ansicht hin. Fehlen **nur Unterschriften**, kommt der Dialog **„Wirklich ohne Unterschrift abschließen?“** mit Namen und Rolle („Jule (Küche)“), bei der Küche mit dem Satz „Der Küchendienst geht oft früher, das ist in Ordnung.“ Knöpfe „Zurück“ und `nu-btn--gefahr-voll` „Ja, trotzdem abschließen“.
- **Danach:** Leiste `nu-gesperrt` mit Pille „ohne Unterschrift: Jule“ (`warnung`), Zeit, Personen, Abgleichstand und „nicht mehr änderbar, nur ergänzen“; Knöpfe „PDF ansehen“ und „Teilen“ (Android-Teilen-Dialog, kein fester Empfänger). Eine Einblendung „Bericht abgeschlossen · ohne Unterschrift von Jule“ in `warnung`.
- **Im PDF:** roter Stempel „Ohne Unterschrift abgeschlossen: Jule“ oben, im Unterschriftenfeld „OHNE UNTERSCHRIFT“. Nach dem Nachholen „· nachgeholt“ am Stempel und die Unterschrift mit Zeitpunkt.
- **Unterschrift nachholen:** In der Besetzung bleibt der Knopf „Unterschrift nachholen“. Die Unterschrift kommt mit Zeitpunkt dazu und als Ergänzung „Unterschrift von Jule nachgeholt.“; erst dann zählt der Dienst im Monatsabschluss.
- **Nur ergänzen:** Alle Felder sind gesperrt. „Ergänzen“ öffnet ein Blatt („Der abgeschlossene Bericht lässt sich nicht mehr ändern. Die Ergänzung steht mit Zeit und Namen darunter und kommt ins PDF.“). Ergänzungen (`nu-nachtrag`, Titel „Ergänzung“) stehen mit Datum, Uhrzeit und Name darunter.
- Ein Bericht mit Vorfall behält den roten Rahmen, auch im Archiv.
''')

# ---------------------------------------------------------------- Hinweise: Anzeigedauer, Bettwäsche als wichtig
c = comp("Hinweise")
c['html'] = c['html'].replace('<div class="nu-hinweis"><div class="nu-hinweis-kopf"><i data-icon="kalender" class="klein"></i><b>Kalender</b>· heute</div><div>Bettwäschewechsel Zimmer B · Morgen Feiertag, heute einkaufen.</div></div>',
  '<div class="nu-hinweis is-wichtig"><div class="nu-hinweis-kopf"><i data-icon="wiederholen" class="klein"></i><b>Kalender</b>· wichtig · heute</div><div>Bettwäschewechsel Zimmer B</div></div><div class="nu-hinweis"><div class="nu-hinweis-kopf"><i data-icon="person" class="klein"></i><b>Leitung</b>· nur heute · zu Bericht 01.10.</div><div>Antwort: Schuhe in Größe 44 liegen in der Kleiderkammer.</div></div>')
c['html'] = c['html'].replace('<b class="abschnitt">Hinweis für die nächsten Tage</b>', '<b class="abschnitt">Hinweis für die nächsten Dienste</b>').replace(
  '</div></div></div><div style="display:grid;gap:10px"><b class="abschnitt">Seit deinem letzten Dienst',
  '</div></div><div class="nu-feld"><span class="nu-feldname">Wie lange anzeigen?</span><div class="nu-checkliste" data-wahl>' + chips(["Nächster Dienst", "3 Tage", "1 Woche", "2 Wochen", "Bis Datum"], "3 Tage") + '</div><span class="nu-beschr">Vom 03.10. bis 05.10. (3 Dienste)</span></div></div><div style="display:grid;gap:10px"><b class="abschnitt">Seit deinem letzten Dienst', 1)
c['html'] += WAHL_JS
c['height'] = 720
c['readme'] = c['readme'].replace("- „Heute“ aus dem Kalender als eigene Karte mit Absender „Kalender“.",
  "- **Bettwäschewechsel** aus dem Kalender steht am Tag als **wichtiger Hinweis** oben (Absender „Kalender“, Symbol `wiederholen`) und an der Glocke; übrige Termine unter „Heute“.\n- **Wie lange anzeigen?** Chips „Nächster Dienst“, „3 Tage“ (Standard), „1 Woche“, „2 Wochen“, „Bis Datum“; darunter in Klartext „Vom 03.10. bis 05.10. (3 Dienste)“. Der Zeitraum beginnt beim nächsten Dienst (heute, solange der Bericht offen ist). Geplante Hinweise erscheinen erst ab ihrem Tag.\n- **Im Archiv** steht oben „Hinweise für die nächsten Dienste“ mit „Hinweis hinterlegen“ (Absender Leitung vorgewählt), allen laufenden und geplanten Hinweisen mit „Beenden“ und darunter „Abgelaufen und beendet“. Hinweise aus Archiv-Kommentaren tragen „zu Bericht 01.10.“.\n- Die Leitung kann Hinweise auch vom PC ablegen (Nextcloud `Hinweise/Eingang/`).")

# ---------------------------------------------------------------- Archivkarte
neu_nach("BerichtAbgeschlossen", "Archivkarte", "Dienst und Bericht", 1180, '''<div class="nu" style="width:1000px;background:var(--grund);padding:20px;display:grid;gap:14px">
<div class="nu-bericht" style="gap:10px"><b class="abschnitt">Fehlt etwas</b><p class="nu-beschr" style="margin:0">Aus den letzten Berichten. Abhaken, wenn es besorgt ist.</p><div class="nu-checkliste" data-umschalt><button class="nu-chip" aria-pressed="true"><i data-icon="check" class="klein"></i>Toilettenpapier <small style="font-weight:400">01.10.</small></button><button class="nu-chip" aria-pressed="false"><i data-icon="einkauf" class="klein"></i>Müllbeutel 120 l <small style="font-weight:400">01.10.</small></button><button class="nu-chip" aria-pressed="false"><i data-icon="einkauf" class="klein"></i>Kaffee <small style="font-weight:400">30.09.</small></button></div></div>
<div class="nu-bericht" style="gap:10px;padding:18px"><div style="display:flex;align-items:center;gap:8px"><i data-icon="bericht"></i><b style="flex:1">Donnerstag, 1. Oktober</b><span class="nu-beschr">Sam, Chris, Jule</span><span class="nu-nurlesen"><i data-icon="schloss" class="klein"></i>abgeschlossen</span></div>
<div style="color:var(--tinte-2)">Ruhige Nacht.</div>
<div class="nu-zeile"><i data-icon="sprache"></i><div>Frage von Gästen<small>@Tom (D2) fragt nach Arbeitsschuhen in Größe 44.</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen">Antworten</button></div>
<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span class="nu-beschr">Fehlt:</span><span class="nu-pille"><i data-icon="check" class="klein"></i>Toilettenpapier</span><span class="nu-pille nu-pille--warnung"><i data-icon="einkauf" class="klein"></i>Müllbeutel 120 l</span></div>
<div class="nu-nachtrag"><b>Leitung · Antwort auf Frage</b>Schuhe in Größe 44 liegen in der Kleiderkammer.<small>02.10. 10:05 · betrifft Tom · im Dienst bis 02.10.</small></div>
<div style="display:flex;gap:8px"><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="notiz"></i>Kommentieren</button><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="warnung"></i>Wichtiger Hinweis</button></div></div>
<div style="background:var(--flaeche);border-radius:16px;padding:20px;display:grid;gap:14px;max-width:620px;box-shadow:var(--schatten-schwebend)"><b class="titel">Wichtiger Hinweis · Bericht 28.09.</b>
<div class="nu-feld"><span class="nu-feldname">Von</span><div class="nu-checkliste" data-wahl>__VON__</div></div>
<div class="nu-feld"><span class="nu-feldname">Art</span><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="false">Kommentar</button><button role="radio" aria-checked="false">Antwort auf Frage</button><button role="radio" aria-checked="true">Wichtiger Hinweis</button></div></div>
<div class="nu-feld"><label>Text</label><textarea class="nu-eingabe">Bei der nächsten Aufnahme nach Schlüssel 7 fragen.</textarea></div>
<div class="nu-feld"><span class="nu-feldname">Betrifft Gast</span><div class="nu-checkliste" data-wahl>__GAST__</div><div style="display:flex;align-items:center;gap:12px;margin-top:8px"><button class="nu-schalter" role="switch" aria-checked="true" aria-label="Bei Wiederaufnahme anzeigen"></button>Steht in den Notizen des Gastes und erscheint bei der Wiederaufnahme</div></div>
<div class="nu-feld"><span class="nu-feldname">Oben im Dienst zeigen</span><div class="nu-checkliste" data-wahl>__DAUER__</div><span class="nu-beschr">Nur im Dienst am 03.10.</span></div></div>
<div class="nu-dialog" role="alertdialog" style="position:static"><h2>Hinweis zu Max (Mustermann)</h2><p><b>Leitung:</b> Bei der nächsten Aufnahme nach Schlüssel 7 fragen.<br><small>Wichtiger Hinweis zu Bericht vom 28.09.</small></p><div class="nu-dialog-knoepfe"><button class="nu-btn nu-btn--klein">Nicht mehr zeigen</button><button class="nu-btn nu-btn--primaer nu-btn--klein">Verstanden</button></div></div>
</div>'''.replace('__VON__', chips(["Leitung (Schwester)", "Kim", "Sam", "Robin", "Chris", "Jule", "Mika"], "Leitung (Schwester)")).replace('__GAST__', chips(["Max (Mustermann)", "Keinen"], "Max (Mustermann)")).replace('__DAUER__', chips(["Nur im Archiv", "Nächster Dienst", "3 Tage", "1 Woche", "Bis Datum"], "Nächster Dienst"))
  + WAHL_JS + '<script>document.querySelectorAll("[data-umschalt] .nu-chip").forEach(function(c){c.onclick=function(){var an=c.getAttribute("aria-pressed")!=="true";c.setAttribute("aria-pressed",String(an));c.firstElementChild.outerHTML=Nu.svg(an?"check":"einkauf","klein");};});</script>', '''# Archivkarte

Im Archiv lassen sich vergangene Berichte kommentieren, Fragen von Gästen beantworten und wichtige Hinweise geben – vor allem von der Leitung. Was fehlt, steht obenauf.

**Archiv** (Reiter in Dienst & Bericht), von oben nach unten:
1. **Hinweise für die nächsten Dienste** (siehe Hinweise).
2. **Fehlt etwas:** alle „Fehlt etwas“-Einträge der letzten Berichte als Chips mit Datum (Symbol `einkauf`); antippen hakt ab (`check`, Name und Zeit werden gespeichert), erneut antippen hebt das auf.
3. **Berichte**, neueste oben (auch der heute abgeschlossene). Vorfall mit Rahmen 3 dp `vorfall`.

**Karte je Bericht:** Datum, Besetzung, „abgeschlossen“; der Text; **Frage von Gästen** als Zeile mit „Antworten“; **Fehlt:** als Pillen (offen in `warnung`, erledigt neutral mit Haken); Kommentare als `nu-nachtrag` („Leitung · Antwort auf Frage“, darunter Zeit, betroffener Gast, Anzeigedauer); Knöpfe „Kommentieren“ und „Wichtiger Hinweis“.

**Blatt Kommentar / Antwort / Wichtiger Hinweis**
- **Von:** Chips, **Leitung (Schwester)** vorgewählt, dann das Team.
- **Art:** Kommentar · Antwort auf Frage · Wichtiger Hinweis (`nu-seg`).
- **Betrifft Gast:** die im Bericht genannten Gäste als Chips (Anzeigename) und „Keinen“; bei Antwort und Hinweis ist der erste Genannte vorgewählt. Mit Gast: Schalter „Steht in den Notizen des Gastes und erscheint bei der Wiederaufnahme“ (an).
- **Oben im Dienst zeigen:** „Nur im Archiv“, „Nächster Dienst“, „3 Tage“, „1 Woche“, „Bis Datum“. Standard: Kommentar nur im Archiv, Antwort und Hinweis im nächsten Dienst. Ein wichtiger Hinweis erscheint dort auf `warnung-flaeche`.

**Wirkung:** Der Kommentar steht beim Bericht im Archiv; mit Anzeigedauer zusätzlich als Hinweis oben im Bericht („zu Bericht 01.10.“); mit Gast als Notiz beim Gast (Gastdetails, Gastakte), markiert „bei Wiederaufnahme“.

**Wiederaufnahme:** Wählt man den Gast im Aufnahme-Assistenten aus, öffnet sich der Dialog „Hinweis zu Max (Mustermann)“ mit allen markierten Notizen, Absender und Bezug. Knöpfe „Nicht mehr zeigen“ (nimmt die Markierung weg) und „Verstanden“.
''', width=1000, subtitle="Kommentieren, beantworten, abhaken")

# ---------------------------------------------------------------- Kalender: Dienste je Rolle, geändert markiert, Ändern mit PIN
ersetze("Kalender", height=720, html='''<div class="nu" style="width:1160px;background:var(--grund);padding:20px">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><h2 class="titel-gross" style="margin:0;flex:1">KW 40 · 28.09. – 04.10.2026</h2><div class="nu-seg" role="radiogroup" aria-label="Ansicht"><button role="radio" aria-checked="true">7 Tage</button><button role="radio" aria-checked="false">Monat</button></div><button class="nu-iconbtn nu-iconbtn--fl" aria-label="Vorige Woche"><i data-icon="zurueck"></i></button><button class="nu-btn nu-btn--rahmen nu-btn--klein">Heute</button><button class="nu-iconbtn nu-iconbtn--fl" aria-label="Nächste Woche"><i data-icon="weiter"></i></button><button class="nu-btn nu-btn--rahmen nu-btn--klein" id="ae"><i data-icon="schloss"></i>Ändern</button></div>
<div id="bn"></div><div class="nu-woche" id="w"></div></div>
<script>
var T=["Mo","Di","Mi","Do","Fr","Sa","So"],P=[["Chris","","Jule"],["Sam","Robin","Mika"],["Kim","Sam","Jule"],["Chris","","Mika"],["Kim","Sam","Jule"],["Kim","Chris","Mika"],["Chris","","Jule"]],O={5:[1,"Jule"]},E={4:[["wiederholen","Bettwäschewechsel Zimmer B","Bettwäsche",""]],5:[["kalender","Lieferung Decken","Sondertermin",""]],6:[["einkauf","Morgen Feiertag, heute einkaufen","Feiertag","feiertag"]]},edit=false;
var R=["Betreuung 1","Betreuung 2","Küche"];
function zeile(i,j){var n=P[i][j],o=O[i]&&O[i][0]===j?O[i][1]:null,cls="nu-dienstzeile"+(j===2?" nu-dienstzeile--kueche":"")+(o!==null?" is-geaendert":"")+(n?"":" is-offen")+(edit&&i>=4?" is-aenderbar":"");return '<'+(edit&&i>=4||o!==null?'button':'div')+' class="'+cls+'"><span class="nu-dienstzeile-rolle">'+R[j]+(o!==null?' · geändert':'')+'</span><b>'+(n||"offen")+'</b>'+(o!==null?'<s>'+o+'</s>':'')+'</'+(edit&&i>=4||o!==null?'button':'div')+'>';}
function zeichne(){document.getElementById("bn").innerHTML=edit?'<div class="nu-banner" style="margin-bottom:12px">'+Nu.svg("stift")+'<div>Ändern ist freigeschaltet<small>Dienst oder Termin antippen. Jede Änderung wird mit Namen vermerkt und im Kalender markiert. Der Originalplan bleibt für den Monatsabschluss gespeichert.</small></div></div>':'';
document.getElementById("ae").innerHTML=edit?Nu.svg("check")+"Fertig":Nu.svg("schloss")+"Ändern";document.getElementById("ae").className="nu-btn nu-btn--klein "+(edit?"nu-btn--primaer":"nu-btn--rahmen");
document.getElementById("w").innerHTML=T.map(function(t,i){var d=28+i>30?28+i-30:28+i;return '<div class="nu-woche-tag'+(i===4?' is-heute':i<4?' is-vorbei':'')+'"><div class="nu-woche-kopf"><b>'+d+'</b><span>'+t+'</span></div><div class="nu-dienste">'+[0,1,2].map(function(j){return zeile(i,j);}).join("")+'</div>'+(E[i]||[]).map(function(e){var c='<span class="nu-termin'+(e[3]?' nu-termin--'+e[3]:'')+'">'+Nu.svg(e[0])+'<span>'+e[1]+'<small>'+e[2]+'</small></span></span>';return edit&&i>=4?'<button class="nu-termin-knopf is-aenderbar">'+c+'</button>':c;}).join("")+'<button class="nu-woche-plus">'+Nu.svg("plus","klein")+'Termin</button></div>';}).join("");}
document.getElementById("ae").onclick=function(){edit=!edit;zeichne();};zeichne();
</script>''', readme='''# Kalender

Der Kalender sammelt alles mit Datum: Dienste (Betreuung 1, Betreuung 2, Küche) und Termine. Dienste und Termine lassen sich mit PIN ändern; jede Änderung wird mit Namen vermerkt und markiert.

- **Standard ist die 7-Tage-Ansicht** (`nu-woche`): sieben Spalten, jede mit den drei Diensten als Zeilen (`nu-dienstzeile`: Rolle klein, Name 600; Betreuung auf `erwartet-flaeche`, Küche auf `flaeche-2`, „offen“ in `tinte-3`) und allen Terminen ungekürzt, unten „+ Termin“. Heute: Zahl im Kreis `primaer`.
- **Geändert:** Weicht ein Dienst vom Originalplan ab oder wurde er geändert, steht die Zeile auf `warnung-flaeche` mit Strich 3 dp `warnung` links, „· geändert“ hinter der Rolle und dem ursprünglichen Namen durchgestrichen darunter. Antippen zeigt, wer wann warum geändert hat. In der Monatsansicht trägt der Dienst-Chip des Tages das Symbol `stift` auf `warnung-flaeche`. Geänderte Termine haben den Strich links.
- **Ändern** (Kopf rechts): fragt die Admin-PIN (`nu-pin` im Blatt), dann Banner „Ändern ist freigeschaltet …“ und gestrichelte Umrandung an allem, was sich ändern lässt (ab heute; Vergangenes nie). „Fertig“ beendet.
- **Dienst ändern** (Blatt): „Originalplan: Jule“, Chips „Wer macht den Dienst?“ (Team und „offen“), **„Wer ändert?“ ohne Vorauswahl – Pflicht**, Grund Tausch / Sonstiges, Notiz freiwillig. Ohne „Wer ändert?“ wackelt der Hinweis rot „Bitte zuerst auswählen, wer ändert.“ Speichern ändert den aktuellen Plan; der **Originalplan** (eingelesen zu Monatsbeginn) bleibt unverändert und zählt im Monatsabschluss als „geplant“.
- **Termin ändern** (Blatt): Titel, Datum (verschieben), Art, „Wer ändert?“ (Pflicht), „Löschen“ links in `gefahr`.
- **Bettwäsche** erscheint am Tag als wichtiger Hinweis im Bericht.
- **Dienstplan einlesen** liegt in den Einstellungen (siehe Dienstplan einlesen). Kein Import aus WhatsApp.
- Unter 900 dp stehen die sieben Tage untereinander.
''', width=1160, subtitle="Ändern zum Ausprobieren")

neu_nach("Kalender", "DienstAendern", "Kalender", 820, '''<div class="nu" style="width:620px;background:var(--grund);padding:20px">
<div style="background:var(--flaeche);border-radius:16px;padding:22px;display:grid;gap:14px;box-shadow:var(--schatten-schwebend)"><div><b class="titel">Betreuung 2 am 03.10. ändern</b><p class="nu-beschr" style="margin:4px 0 0">Originalplan: Jule</p></div>
<div class="nu-feld"><span class="nu-feldname">Wer macht den Dienst?</span><div class="nu-checkliste" data-wahl>__WER__</div></div>
<div class="nu-feld" id="vf"><span class="nu-feldname">Wer ändert?</span><div class="nu-checkliste" id="von">__VON__</div><span class="nu-beschr" id="vh">Bitte auswählen. Die Änderung wird mit Namen vermerkt.</span></div>
<div class="nu-feld"><span class="nu-feldname">Grund</span><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">Tausch</button><button role="radio" aria-checked="false">Sonstiges</button></div></div>
<div class="nu-feld"><label>Notiz (freiwillig)</label><input class="nu-eingabe" placeholder="z. B. getauscht mit 14.10."></div>
<div style="display:flex;gap:10px;justify-content:flex-end"><button class="nu-btn nu-btn--klein">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" id="sp">Speichern</button></div></div></div>'''.replace('__WER__', chips(["Kim", "Sam", "Robin", "Chris", "Jule", "Mika", "offen"], "Chris")).replace('__VON__', chips(["Leitung (Schwester)", "Kim", "Sam", "Robin", "Chris", "Jule", "Mika"]))
  + WAHL_JS + '''<script>var v=document.getElementById("von"),h=document.getElementById("vh");v.querySelectorAll(".nu-chip").forEach(function(c){c.onclick=function(){v.querySelectorAll(".nu-chip").forEach(function(x){x.setAttribute("aria-pressed",String(x===c));});h.style.color="";h.textContent="Wird vermerkt: geändert von "+c.textContent+".";};});
document.getElementById("sp").onclick=function(){if(!v.querySelector('[aria-pressed="true"]')){h.style.color="var(--vorfall)";h.textContent="Bitte zuerst auswählen, wer ändert.";var f=document.getElementById("vf");f.classList.remove("is-wackeln");void f.offsetWidth;f.classList.add("is-wackeln");}else{h.textContent="Gespeichert. Der Kalender markiert den Dienst als geändert.";}};</script>''', '''# Dienst ändern

Blatt nach „Ändern“ (PIN) und Tipp auf einen Dienst im Kalender.

- Titel „Betreuung 2 am 03.10. ändern“, darunter „Originalplan: Jule“ (und „jetzt: Chris“, wenn schon geändert).
- **Wer macht den Dienst?** Chips mit dem Team (bei Küche zuerst die Küchenleute) und „offen“; die jetzige Person ist gewählt.
- **Wer ändert?** Chips „Leitung (Schwester)“ und Team, **ohne Vorauswahl**. Speichern ohne Auswahl: der Hinweis wird rot („Bitte zuerst auswählen, wer ändert.“) und wackelt (`nu-wackeln`). Mit Auswahl: „Wird vermerkt: geändert von Leitung.“
- **Grund:** Tausch · Sonstiges. **Notiz** freiwillig.
- Gespeichert wird: neuer aktueller Plan, ein Änderungseintrag (alt, neu, wer, Grund, Notiz, Zeit). Der Originalplan bleibt. Ist für den Tag schon ein Bericht offen und die Rolle noch nicht unterschrieben, wechselt dort die Person mit.
''', width=620, subtitle="„Wer ändert?“ ist Pflicht")

# ---------------------------------------------------------------- Dienstplan einlesen (Einstellungen)
SCAN_ZEILEN = [("3.", "Robin", "Chris", "Jule"), ("4.", "Chris", "Kim", "Mika"), ("5.", "Kim", "Jule", "Mika"), ("6.", "Sam", "Robin", "Jule"), ("7.", "Robin", "—", "Mika")]
neu_nach("Einstellungszeilen", "DienstplanEinlesen", "Einstellungen", 900, '''<div class="nu" style="width:1000px;background:var(--grund);padding:20px;display:grid;gap:14px">
<div class="nu-einstellung"><i data-icon="check"></i><div><b>Oktober 2026</b><small>Eingelesen am 01.10. 09:30 von Leitung · 93 Dienste, 2 korrigiert. Originalplan steht fest.</small></div><span class="nu-pille"><i data-icon="schloss" class="klein"></i>fest</span></div>
<div class="nu-einstellung"><i data-icon="scannen"></i><div><b>November 2026</b><small>Noch nicht eingelesen. Im Kalender steht ein vorläufiger Plan.</small></div><div style="display:flex;gap:8px"><button class="nu-btn nu-btn--primaer nu-btn--klein"><i data-icon="kamera"></i>Foto</button><button class="nu-btn nu-btn--rahmen nu-btn--klein"><i data-icon="wolke-ok"></i>Datei aus Nextcloud</button></div></div>
<div class="nu-scan"><div class="nu-scan-kopf"><b class="titel" style="font-size:20px;flex:1">November 2026 prüfen</b><span class="nu-beschr">Tag 5 von 30</span><button class="nu-btn nu-btn--klein">Abbrechen</button></div><div class="nu-scan-fortschritt"><i style="width:13%"></i></div>
<div class="nu-scan-raster"><div class="nu-scan-foto"><div class="nu-scan-blatt"><div class="nu-scan-zeile nu-scan-zeile--kopf"><span>Tag</span><span>Nacht</span><span>Nacht</span><span>Küche</span></div>__FOTO__</div><span class="nu-beschr">Foto: Dienstplan_2026-11.jpg</span></div>
<div class="nu-scan-rechts"><b class="titel" style="font-size:22px">Donnerstag, 5. November</b><p class="nu-beschr" style="margin:0">Mit dem Foto vergleichen. Stimmt etwas nicht, den richtigen Namen antippen.</p>
<div class="nu-scan-pruef is-geprueft"><div class="nu-scan-pruef-kopf"><b>Betreuung 1</b><span class="nu-beschr">erkannt</span></div><div class="nu-checkliste" data-p>__B1__</div></div>
<div class="nu-scan-pruef is-unsicher" id="u"><div class="nu-scan-pruef-kopf"><b>Betreuung 2</b><span class="nu-pille nu-pille--warnung" id="up"><i data-icon="warnung" class="klein"></i>unsicher erkannt: Sam</span></div><div class="nu-checkliste" data-p>__B2__</div></div>
<div class="nu-scan-pruef is-geprueft"><div class="nu-scan-pruef-kopf"><b>Küche</b><span class="nu-beschr">erkannt</span></div><div class="nu-checkliste" data-p>__K__</div></div>
<div style="display:flex;gap:10px;justify-content:space-between"><button class="nu-btn nu-btn--rahmen nu-btn--klein"><i data-icon="zurueck"></i>Zurück</button><button class="nu-btn nu-btn--primaer" id="ok" disabled><i data-icon="check"></i>Erst Unsicheres prüfen</button></div></div></div></div></div>'''
  .replace('__FOTO__', ''.join('<div class="nu-scan-zeile%s"><span>%s</span><span>%s</span><span>%s</span><span>%s</span></div>' % (((' is-aktuell' if z[0] == '5.' else ''),) + z) for z in SCAN_ZEILEN))
  .replace('__B1__', chips(["Kim", "Sam", "Robin", "Chris", "Jule", "Mika", "offen"], "Kim")).replace('__B2__', chips(["Kim", "Sam", "Robin", "Chris", "Jule", "Mika", "offen"], "Sam")).replace('__K__', chips(["Kim", "Sam", "Robin", "Chris", "Jule", "Mika", "offen"], "Mika"))
  + '''<script>document.querySelectorAll("[data-p]").forEach(function(g){g.querySelectorAll(".nu-chip").forEach(function(c){c.onclick=function(){g.querySelectorAll(".nu-chip").forEach(function(x){var an=x===c,t=x.textContent;x.setAttribute("aria-pressed",String(an));x.innerHTML=(an?Nu.svg("check","klein"):"")+t;});var p=g.parentNode;if(p.id==="u"){p.classList.add("is-geprueft");document.getElementById("up").outerHTML='<span class="nu-pille">'+Nu.svg("check","klein")+'geprüft</span>';var ok=document.getElementById("ok");ok.disabled=false;ok.innerHTML=Nu.svg("check")+"Tag stimmt, weiter";}};});});</script>''', '''# Dienstplan einlesen

Einmal zu Monatsbeginn liest die Leitung den Dienstplan ein und prüft **jeden Dienst einzeln** am Foto oder an der Datei. Das Ergebnis ist der **Originalplan**: die geplanten Dienste für den Monatsabschluss.

- **Ort:** Einstellungen › Dienstplan einlesen (hinter der Admin-PIN). Nicht mehr im Kalender.
- **Monatszeilen** (`nu-einstellung`): laufender und nächster Monat. Eingelesen: „Eingelesen am 01.10. 09:30 von Leitung · 93 Dienste, 2 korrigiert. Originalplan steht fest.“ mit Pille „fest“. Offen: „Foto“ (Kamera) und „Datei aus Nextcloud“ (PDF, ICS aus `Kalender/Dienstplan-Eingang/`).
- **Prüfmaske** (`nu-scan`), ein Tag nach dem anderen: Kopf „November 2026 prüfen · Tag 5 von 30 · Abbrechen“, Fortschrittsbalken. Links der **Ausschnitt aus dem Foto** (`nu-scan-blatt` auf `papier`, leicht gedreht, Handschrift in `stift-tinte`) mit zwei Tagen davor und danach, der aktuelle Tag gelb hinterlegt und `warnung` umrandet. Rechts der Tag groß und je Rolle (Betreuung 1, Betreuung 2, Küche) eine Prüfzeile mit Team-Chips und „offen“; die Erkennung ist vorgewählt.
- **Unsicher erkannt** (`is-unsicher`): Zeile auf `warnung-flaeche` mit Rand `warnung` und Pille „unsicher erkannt: Sam“. Erst wenn jede unsichere Zeile angetippt wurde (auch wenn der Vorschlag stimmt), wird „Tag stimmt, weiter“ aktiv; vorher heißt der Knopf „Erst Unsicheres prüfen“.
- **Abschluss:** Kennzahlen Tage, Dienste, Korrigiert; „Eingelesen von“ (Leitung vorgewählt); Hinweis „Danach steht der Originalplan fest“; Knopf „Als Originalplan speichern“. Gespeichert werden Originalplan und aktueller Plan; spätere Änderungen nur im Kalender (PIN, mit Namen vermerkt) oder als Plankorrektur im Monatsabschluss.
- Ein Monat wird nur einmal eingelesen; die Abweichungen von der Erkennung werden mitgespeichert.
''', width=1000, subtitle="Unsicheres antippen zum Ausprobieren")

# ---------------------------------------------------------------- Einstellungszeilen: neue Gruppe
textfix_ok = 'Dienstplan einlesen' in comp("Einstellungszeilen")['readme']
if not textfix_ok:
    comp("Einstellungszeilen")['readme'] += "- Gruppe **Dienstplan einlesen** (siehe dort): einmal zu Monatsbeginn durch die Leitung, Ergebnis ist der Originalplan.\n"
