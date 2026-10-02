from comps1 import comp

comp("UmziehenTauschen","Bettenplan",430,'''<div class="nu nu-vorschau nu-vorschau--spalte" style="position:relative">
<p class="nu-beschr">Karte lange drücken (400 ms) und auf ein anderes Bett ziehen. Grüner Rahmen = umziehen, blauer Rahmen = tauschen.</p>
<div id="feld" style="display:flex;gap:12px;flex-wrap:wrap"></div>
<div id="dlg"></div>
</div>
<script>
var D=[{nr:"B1",s:"anwesend",name:"Mihai",naechte:1},{nr:"B2",s:"frei"},{nr:"B3",s:"anwesend",name:"Ion",naechte:4},{nr:"B4",s:"anwesend",name:"Olek",naechte:15}];
var feld=document.getElementById("feld"),dlg=document.getElementById("dlg");
function draw(){feld.innerHTML=D.map(Nu.bett).join("");}
draw();
var drag=null,start=null,timer=0;
function ziel(e){return document.elementsFromPoint(e.clientX,e.clientY).find(function(x){return x.classList&&x.classList.contains("nu-bett")&&(!drag||x!==drag.c)})||null;}
function marks(t){feld.querySelectorAll(".nu-bett").forEach(function(b){b.classList.remove("is-ziel","is-ziel-tausch")});if(t)t.classList.add(t.dataset.s==="frei"?"is-ziel":"is-ziel-tausch");}
feld.addEventListener("pointerdown",function(e){var c=e.target.closest(".nu-bett");if(!c||c.dataset.s==="frei")return;start={x:e.clientX,y:e.clientY,id:e.pointerId,c:c};
 timer=setTimeout(function(){drag=start;c.classList.add("is-gezogen");try{c.setPointerCapture(start.id)}catch(_){}},400);});
feld.addEventListener("pointermove",function(e){if(!drag){if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>10){clearTimeout(timer);start=null;}return;}
 drag.c.style.transform="translate("+(e.clientX-drag.x)+"px,"+(e.clientY-drag.y)+"px) scale(1.05) rotate(-1deg)";marks(ziel(e));});
document.addEventListener("pointerup",function(e){clearTimeout(timer);start=null;if(!drag)return;var t=ziel(e),from=drag.c.dataset.nr;drag.c.classList.remove("is-gezogen");drag.c.style.transform="";drag=null;marks(null);
 if(!t||t.dataset.s==="aus")return;var a=D.find(function(x){return x.nr===from}),b=D.find(function(x){return x.nr===t.dataset.nr});var tausch=b.s!=="frei";
 dlg.innerHTML='<div class="nu-dialog" style="margin-top:16px"><h2>'+(tausch?a.name+" ("+a.nr+") und "+b.name+" ("+b.nr+") tauschen?":a.name+" von "+a.nr+" nach "+b.nr+" umziehen?")+'</h2><p>Gilt ab heute. Bereits unterschriebene PDFs bleiben unverändert.</p><div class="nu-dialog-knoepfe"><button class="nu-btn nu-btn--klein" id="nein">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" id="ja">'+(tausch?"Tauschen":"Umziehen")+'</button></div></div>';
 document.getElementById("nein").onclick=function(){dlg.innerHTML=""};
 document.getElementById("ja").onclick=function(){var ia=D.indexOf(a),ib=D.indexOf(b),na=a.nr,nb=b.nr;D[ia]=Object.assign({},b,{nr:na});D[ib]=Object.assign({},a,{nr:nb});dlg.innerHTML="";draw();
  [nb].concat(tausch?[na]:[]).forEach(function(n){feld.querySelector('[data-nr="'+n+'"]').classList.add("is-gesetzt")});};
});
</script>''','''# Umziehen und Tauschen

Ein Gast wechselt das Bett, indem man seine Karte auf ein anderes Bett zieht.

- **Anheben:** langes Drücken (400 ms) auf eine belegte Karte. Die Karte hebt sich (105 %, −1°, `schatten-gehoben`), ihr Platz bleibt blass stehen. Ein kurzes Vibrieren (`HapticFeedbackType.LongPress`) bestätigt.
- **Ziel:** freies Bett → Rahmen 3 dp `frei` (umziehen); belegtes Bett → Rahmen 3 dp `blau` (tauschen). Deaktivierte Betten nehmen nichts an.
- **Ablegen** öffnet immer eine Bestätigung: „Max (Bett 3) und Ali (Bett 5) tauschen?“ bzw. „Ali von D4 nach B2 umziehen?“. Text darunter: „Gilt ab heute. Bereits unterschriebene PDFs bleiben unverändert.“
- Nach „Tauschen“ wechseln beide Karten auf gebogenen Bahnen den Platz (`dauer-lang`), dann federn sie einmal (`is-gesetzt`).
- Ohne Ziehen: „Bett wechseln“ in den Gastdetails öffnet den Plan im Auswahlmodus („Neues Bett für Ali antippen“).
- Mit Stift: Ziehen funktioniert gleich; mit Hardware-Tastatur: Karte fokussieren, Leertaste hebt an, Pfeiltasten wählen das Ziel, Enter legt ab.
''', subtitle="Zum Ausprobieren: Karte lange drücken und ziehen")

comp("Gastdetails","Bettenplan",820,'''<div class="nu" style="display:flex;justify-content:flex-end;background:var(--grund);height:800px;padding:0"><aside class="nu-detail" aria-label="Gastdetails">
<div class="nu-detail-kopf"><div style="flex:1"><span class="nr">D4</span><h2>Ali</h2><p>Aufnahme 2026-27-0042 · seit 03.10. · 12 Nächte</p></div><button class="nu-iconbtn nu-iconbtn--fl" aria-label="Schließen"><i data-icon="schliessen"></i></button></div>
<div class="nu-detail-inhalt">
 <div class="nu-zeile nu-zeile--warnung"><i data-icon="laeuseschein-fehlt"></i><div><b>Läuseschein fehlt seit 3 Tagen</b><small>Verbleib entschieden von Jonas bis 16.11.</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="scannen"></i>Scannen</button></div>
 <section class="nu-abschnitt"><h3>Stammdaten</h3><dl class="nu-daten"><dt>Vorname</dt><dd>Ali</dd><dt>Nachname</dt><dd>–</dd><dt>Spitzname</dt><dd>Professor</dd><dt>Sprache</dt><dd>Arabisch</dd><dt>Erste Aufnahme</dt><dd>03.10.2026</dd></dl></section>
 <section class="nu-abschnitt"><h3>Aufenthalt</h3><dl class="nu-daten"><dt>Bett</dt><dd>D4 · Stockbett oben</dd><dt>Seit</dt><dd>03.10.</dd><dt>Geplant bis</dt><dd>offen, dauerhaft</dd><dt>Heute</dt><dd>erwartet · Dusche 20:30</dd></dl></section>
 <section class="nu-abschnitt"><h3>Sanktionen</h3><div class="nu-zeile"><i data-icon="karte-gelb"></i><div>Gelbe Karte · 08.11.<small>Laut nach 22 Uhr, eingetragen von Silke · aus Bericht vom 08.11.</small></div></div></section>
 <section class="nu-abschnitt"><h3>Dokumente</h3><div class="nu-zeile"><i data-icon="pdf"></i><div>0042_Ali_2026-10-03.pdf<small>Hausordnung und Datenschutz, Arabisch und Deutsch</small></div><button class="nu-iconbtn" aria-label="Ansehen"><i data-icon="weiter"></i></button></div></section>
 <section class="nu-abschnitt"><h3>Notizen</h3>
  <div class="nu-notiz">Hat nach einer zweiten Decke gefragt.<small>14.11. · Jonas · aus Bericht vom 14.11.</small></div>
  <div class="nu-notiz">Arzttermin am Donnerstag, kommt evtl. später.<small>12.11. · Schwester Martha</small></div>
  <button class="nu-btn nu-btn--rahmen nu-btn--klein" style="justify-self:start"><i data-icon="plus"></i>Notiz hinzufügen</button></section>
</div>
<div class="nu-detail-aktionen"><button class="nu-btn nu-btn--primaer"><i data-icon="anwesend"></i>Einchecken</button><button class="nu-btn"><i data-icon="abwesend"></i>Abwesenheit</button><button class="nu-btn"><i data-icon="tauschen"></i>Bett wechseln</button><button class="nu-btn"><i data-icon="dusche"></i>Duschslot</button><button class="nu-btn"><i data-icon="auszug"></i>Auszug</button><button class="nu-btn nu-btn--gefahr"><i data-icon="karte-gelb"></i>Sanktion</button></div>
</aside></div>''','''# Gastdetails

Der Detailbereich rechts zeigt alles zu einem Gast und bietet die Handlungen am Bett.

- Breite `detail-breite` (460 dp), Grund `flaeche`, links `radius-l`, gleitet mit `dauer-lang` und `kurve-eintritt` herein. Der Plan bleibt links bedienbar.
- **Kopf:** Bettnummer `nummer-gross`, Name `titel`, darunter Aufnahmenummer, seit, Nächte in `text-klein`. Schließen oben rechts (48 dp).
- **Warnzeilen** stehen ganz oben (`nu-zeile--warnung`): Läuseschein, Rückkehrtag, Konflikt. Rote Karte als `nu-zeile--vorfall`.
- **Abschnitte** in fester Reihenfolge: Stammdaten, Aufenthalt, Läuseschein, Dokumente, Sanktionen, Notizen. Überschrift `abschnitt`, Werte als Liste `nu-daten` (Begriff `tinte-2`, Wert 600).
- **Notizen** chronologisch, neueste oben, mit Datum, Verfasser*in und Herkunft („aus Bericht vom 14.11.“).
- **Aktionen** unten fest (`flaeche-2`), zwei Spalten: Einchecken (Hauptknopf), Abwesenheit, Bett wechseln, Duschslot, Auszug, Sanktion.
- Vergangene Tage: Aktionen ausgeblendet, stattdessen „Nachtrag hinzufügen“.
''', width=460)

comp("Assistent","Aufnahme",640,'''<div class="nu" style="height:640px;width:1100px"><div class="nu-assistent">
<ol class="nu-schritte">
 <li class="nu-schritt is-fertig"><i>✓</i>Person</li><li class="nu-schritt is-fertig"><i>✓</i>Dauer</li><li class="nu-schritt is-fertig"><i>✓</i>Sprache</li>
 <li class="nu-schritt" aria-current="step"><i>4</i>Hausordnung</li><li class="nu-schritt"><i>5</i>Datenschutz</li><li class="nu-schritt"><i>6</i>Abschluss</li></ol>
<div class="nu-assistent-seite" style="display:grid;gap:20px;align-content:start">
 <div style="display:flex;align-items:center;gap:12px"><h2 class="titel" style="margin:0;flex:1">Hausordnung</h2><div class="nu-seg" role="radiogroup"><button role="radio" aria-checked="true">العربية</button><button role="radio" aria-checked="false">Deutsch</button></div></div>
 <div class="nu-dokument" dir="rtl" style="max-height:170px;overflow:auto"><h3>قواعد البيت</h3><p style="margin:0">مرحبًا <mark>علي</mark>. سريرك هو <mark>D4</mark> بتاريخ <mark>14.11.2026</mark>. الهدوء من الساعة 22:00. التدخين ممنوع داخل المبنى.</p></div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <div class="nu-unterschrift is-gezeichnet is-bestaetigt"><div class="nu-unterschrift-kopf"><b>Gast: Ali</b><small>bestätigt 19:42</small></div><div class="nu-unterschrift-feld" style="height:150px"><span class="nu-unterschrift-marke"><i data-icon="check" class="klein"></i>Bestätigt</span><svg viewBox="0 0 300 150" style="position:absolute;inset:0;width:100%;height:100%"><path d="M40 100c20-30 30-50 40-30s-10 40 10 20 30-40 40-10 20 10 40-10 20-5 40 0" fill="none" stroke="var(--stift-tinte)" stroke-width="3" stroke-linecap="round"/></svg></div></div>
  <div class="nu-unterschrift"><div class="nu-unterschrift-kopf"><b>Betreuung: Jonas</b><small>noch offen</small></div><div class="nu-unterschrift-feld" style="height:150px"><span class="nu-unterschrift-hilfe">Mit Finger oder Stift unterschreiben</span></div></div>
 </div>
</div>
<div class="nu-assistent-fuss"><button class="nu-btn"><i data-icon="zurueck"></i>Zurück</button><span class="nu-beschr" style="align-self:center">Zwischenstand gespeichert 19:42</span><button class="nu-btn nu-btn--primaer" disabled>Weiter<i data-icon="weiter"></i></button></div>
</div></div>''','''# Assistent

Die Aufnahme eines neuen Gastes führt in sechs Schritten durch Person, Dauer, Sprache, Hausordnung, Datenschutz und Abschluss.

- Vollbild über dem Plan, Abdunklung dahinter. Links die **Schrittliste** (260 dp, `flaeche-2`): Nummer im Kreis, aktueller Schritt mit `primaer`-Kreis auf `flaeche`, erledigte mit ✓. Erledigte Schritte sind antippbar.
- Rechts der Schritt mit Titel `titel`; unten fest „Zurück“ (links), Zwischenstand-Hinweis, „Weiter“ (Hauptknopf, rechts).
- „Weiter“ ist gesperrt, bis der Schritt vollständig ist; der Grund steht daneben („Es fehlt die Unterschrift der Betreuung“).
- Jeder Zwischenstand wird sofort lokal gespeichert. „Abbrechen“ (Schließen oben) fragt nach: „Aufnahme verwerfen? Eingaben gehen verloren.“
- Übergang zwischen Schritten: 32 dp aus Leserichtung in `dauer-mittel`. Bei Arabisch und Farsi spiegelt sich nur das Dokument, nicht die App.
- Schritte 4 und 5 haben zwei Unterschriftsfelder nebeneinander (Gast, Betreuung) unter dem Text. Bekannte Gäste, die schon unterschrieben haben, überspringen 4 und 5.
''', width=1100)

comp("Gaestesuche","Aufnahme",420,'''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:640px">
<div class="nu-feld" style="width:100%"><label for="q">Person suchen</label><div style="position:relative"><input class="nu-eingabe" id="q" value="Ale" style="padding-left:48px"><span style="position:absolute;left:14px;top:16px;color:var(--tinte-2)"><i data-icon="suche"></i></span></div></div>
<button class="nu-treffer is-verbot"><i data-icon="karte-rot"></i><div><b>Alex B.</b><small>Hausverbot bis 31.03.2027 · Gewalt gegen Gast · eingetragen 02.11.</small></div></button>
<button class="nu-treffer"><i data-icon="person"></i><div><b>Ali</b><small>„Professor“ · zuletzt 13.11. · Bett D4</small></div></button>
<button class="nu-treffer"><i data-icon="person"></i><div><b>Alexandru Popescu</b><small>zuletzt 22.10. · Rumänisch</small></div></button>
<button class="nu-treffer"><i data-icon="person"></i><div><b>Aleksander</b><small>St. Nikolaus · Bett N3</small></div></button>
<button class="nu-btn nu-btn--rahmen" style="align-self:flex-start"><i data-icon="person-plus"></i>„Ale“ neu anlegen</button>
</div>''','''# Gästesuche

Die Suche findet Gäste über Vorname, Nachname und Spitzname, tolerant bei Tippfehlern, und warnt vor Hausverboten.

- Suchfeld mit Symbol `suche`, Treffer ab dem ersten Buchstaben, Ergebnis in unter einer Sekunde bei 2.000 Gästen.
- Trefferzeile (`nu-treffer`) 64 dp: Name in `text-stark`, darunter Spitzname, zuletzt da, Bett, Sprache oder Standort.
- **Aktives Hausverbot steht immer oben**, mit `karte-rot`, Grund `vorfall-flaeche`, Rahmen `vorfall`, Text „Hausverbot bis …“, Grund und Datum. Auswahl öffnet eine Warnung; aufnehmen nur mit Bestätigung und Begründung.
- Letzte Zeile: „„Ale“ neu anlegen“. Bekannte Personen werden nie doppelt angelegt; bei sehr ähnlichem Namen fragt die App „Meinst du Ali?“.
- Die gleiche Suche öffnet sich bei „@“ im Bericht und bei „Externe Gäste“.
''')

comp("Auswahlkacheln","Aufnahme",420,'''<div class="nu nu-vorschau nu-vorschau--spalte">
<b class="abschnitt">Geplante Dauer</b>
<div style="display:grid;grid-template-columns:repeat(3,220px);gap:12px">
<button class="nu-wahl" role="radio" aria-checked="false"><b>1 Nacht</b><span>Kein Läuseschein nötig</span></button>
<button class="nu-wahl" role="radio" aria-checked="true"><b>Mehrere Nächte</b><span>bis 20.11. · Bett wird blockiert</span></button>
<button class="nu-wahl" role="radio" aria-checked="false"><b>Offen</b><span>Bis auf Weiteres</span></button></div>
<b class="abschnitt">Sprache</b>
<div style="display:grid;grid-template-columns:repeat(5,150px);gap:8px" id="sp"></div>
</div>
<script>var S=[["Deutsch","Deutsch"],["English","Englisch"],["Français","Französisch"],["Español","Spanisch"],["العربية","Arabisch"],["فارسی","Farsi"],["Polski","Polnisch"],["Română","Rumänisch"],["Български","Bulgarisch"],["Русский","Russisch"]];
document.getElementById("sp").innerHTML=S.map(function(s,i){return '<button class="nu-wahl" role="radio" style="min-height:72px;padding:10px 14px" aria-checked="'+(i===4)+'"><b style="font-family:'+(i===4||i===5?'var(--font-rtl)':'var(--font-dokument)')+'">'+s[0]+'</b><span>'+s[1]+'</span></button>';}).join("");</script>''','''# Auswahlkacheln

Große Auswahlflächen für Entscheidungen im Assistenten, die man mit dem Daumen trifft.

- `nu-wahl`: mindestens 96 dp hoch (Sprachen 72 dp), Grund `flaeche-2`, Titel `abschnitt`-Größe, Erklärung in `text-klein`. Gewählt: Grund `flaeche` und Rahmen 3 dp `tinte`, nie nur Farbe.
- Dauer: „1 Nacht“, „Mehrere Nächte“ (öffnet Zahl oder Enddatum), „Offen“. Bei mehr als einer Nacht steht dabei, dass das Bett blockiert wird und die Läuseschein-Pflicht beginnt.
- Sprachen: Name in der eigenen Sprache und Schrift, darunter deutsch. Die zuletzt genutzte Sprache des Gastes ist vorgewählt.
''')

comp("Dokument","Aufnahme",430,'''<div class="nu nu-vorschau" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<div class="nu-dokument"><h3>Hausordnung</h3><p style="margin:0">Willkommen, <mark>Ali</mark>. Dein Bett ist <mark>D4</mark> ab <mark>14.11.2026</mark>. Ruhe ist ab 22:00 Uhr. Rauchen ist im Haus nicht erlaubt. Aufgenommen von <mark>Jonas</mark>.</p></div>
<div class="nu-dokument" dir="rtl" lang="ar"><h3>قواعد البيت</h3><p style="margin:0">مرحبًا <mark>علي</mark>. سريرك هو <mark>D4</mark> ابتداءً من <mark>14.11.2026</mark>. الهدوء من الساعة 22:00. التدخين ممنوع داخل المبنى. تم الاستقبال بواسطة <mark>Jonas</mark>.</p></div>
</div>''','''# Dokument

Hausordnung und Datenschutzerklärung erscheinen als helles Blatt, damit sie wie Papier wirken und im PDF gleich aussehen.

- Grund `papier` (auch nachts hell, leicht gedämpft), Text `auf-papier`, Schrift `dokument` (Noto Sans 17/28). Arabisch und Farsi: `dokument-rtl` (Noto Sans Arabic 19/32), `dir="rtl"`, rechtsbündig. Zeilenlänge höchstens 72 Zeichen.
- Eingesetzte Werte aus den Platzhaltern `{BETT}`, `{DATUM}`, `{GAST}`, `{BETREUER}` sind halbfett mit Unterstrich `papier-linie`, damit sichtbar ist, was eingesetzt wurde. Zahlen und Bettnummern bleiben auch im rechtsläufigen Text lateinisch.
- Umschalter „Sprache / Deutsch“ über dem Blatt (`nu-seg`). Im PDF stehen bei einer anderen Sprache beide Fassungen.
- Compose: `Text(…, style = dokument)` in `CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl)` nur um das Blatt, nicht um die App.
''')

comp("Unterschriftsfeld","Aufnahme",360,'''<div class="nu nu-vorschau" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<div class="nu-unterschrift" id="u1"><div class="nu-unterschrift-kopf"><b>Gast: Ali</b><small>Hausordnung</small></div><div class="nu-unterschrift-feld"><span class="nu-unterschrift-marke"><i data-icon="check" class="klein"></i>Bestätigt</span><span class="nu-unterschrift-hilfe">Mit Finger oder Stift unterschreiben</span></div><div class="nu-unterschrift-knoepfe"><button class="nu-btn nu-btn--klein" data-a="leeren"><i data-icon="rueckgaengig"></i>Löschen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-a="ok" disabled>Bestätigen</button></div></div>
<div class="nu-unterschrift" id="u2"><div class="nu-unterschrift-kopf"><b>Betreuung: Jonas</b><small>Hausordnung</small></div><div class="nu-unterschrift-feld"><span class="nu-unterschrift-marke"><i data-icon="check" class="klein"></i>Bestätigt</span><span class="nu-unterschrift-hilfe">Mit Finger oder Stift unterschreiben</span></div><div class="nu-unterschrift-knoepfe"><button class="nu-btn nu-btn--klein" data-a="leeren"><i data-icon="rueckgaengig"></i>Löschen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-a="ok" disabled>Bestätigen</button></div></div>
</div>
<script>Nu.mountIcons();["u1","u2"].forEach(function(id){var r=document.getElementById(id),ok=r.querySelector('[data-a="ok"]');var u=Nu.unterschrift(r,{onChange:function(v){ok.disabled=!v}});r.querySelector('[data-a="leeren"]').onclick=function(){u.leeren()};ok.onclick=function(){if(u.bestaetigen()){ok.disabled=true;r.querySelector('[data-a="leeren"]').disabled=true;r.querySelector(".nu-unterschrift-kopf small").textContent="bestätigt";}}});</script>''','''# Unterschriftsfeld

Ein Feld, in das Gast oder Betreuung mit Finger oder S Pen unterschreibt; es sieht aus wie eine Unterschriftszeile auf Papier.

- Grund `papier` in beiden Modi, Rahmen 2 dp `papier-linie`, `radius-l`, Höhe mindestens `unterschrift-hoehe` (220 dp), volle Spaltenbreite. Linie 2 dp `papier-linie` 52 dp über dem unteren Rand, davor „×“.
- Kopf: wer unterschreibt („Gast: Ali“, „Betreuung: Jonas“) und wofür. Hilfetext „Mit Finger oder Stift unterschreiben“ in `auf-papier-2`, verschwindet beim ersten Strich.
- Strich in `stift-tinte` (Kugelschreiberblau), auch im Nachtmodus und im PDF. Finger: 2,6 dp gleichmäßig. Stift: 1,4–4 dp nach Druck. Alle Zwischenpunkte zeichnen (`getCoalescedEvents` bzw. `historical` in Compose), damit Kurven glatt sind.
- **Handballen:** Sobald im Feld ein Stift erkannt wurde, werden Fingerberührungen ignoriert, bis das Feld geleert wird.
- Knöpfe darunter rechts: „Löschen“ und „Bestätigen“ (gesperrt, solange leer). Bestätigt: Rahmen 3 dp `frei`, Marke „Bestätigt“ oben rechts, Feld gesperrt.
- Export als PNG in doppelter Auflösung (mindestens 300 dpi im PDF), transparenter Grund.
''', subtitle="Zum Ausprobieren: unterschreiben, löschen, bestätigen")

comp("Laeuseschein","Aufnahme",330,'''<div class="nu nu-vorschau nu-vorschau--spalte" style="max-width:720px">
<div class="nu-zeile nu-zeile--warnung" style="width:100%"><i data-icon="laeuseschein-fehlt"></i><div><b>Läuseschein fehlt (Tag 2)</b><small>Ali · D4 · Erinnerung beim Check-in</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen"><i data-icon="scannen"></i>Jetzt scannen</button></div>
<div class="nu-zeile nu-zeile--warnung" style="width:100%"><i data-icon="warnung"></i><div><b>Läuseschein fehlt seit 3 Tagen</b><small>Darf Yusuf trotzdem bleiben? Höchstens 3 weitere Tage.</small></div><button class="nu-btn nu-btn--klein">Nein</button><button class="nu-btn nu-btn--klein nu-btn--primaer">Ja, bis 17.11.</button></div>
<div class="nu-zeile" style="width:100%"><i data-icon="laeuseschein"></i><div><b>Läuseschein liegt vor</b><small>Geprüft von Silke am 05.11. · gilt die ganze Saison</small></div><button class="nu-btn nu-btn--klein">Foto ansehen</button></div>
</div>''','''# Läuseschein

Erinnerungen und Entscheidungen zum Läuseschein erscheinen als Zeilen mit klarer Handlung.

- Tag 2 und 3 ohne Schein: Warnzeile (`nu-zeile--warnung`, Symbol `laeuseschein-fehlt`) bei Dienstbeginn, beim Check-in, in der Glocke und am Bett (Symbol).
- Ab Tag 3: Symbol `warnung`, Ring `warnung` um die Bettkarte, Frage „Darf … trotzdem bleiben?“ mit „Nein“ und „Ja, bis …“ (höchstens 3 weitere Tage). Die Entscheidung wird mit Namen gespeichert.
- „Scannen“ öffnet die Kamera mit Dokumenterkennung (ML Kit Document Scanner), danach „Geprüft“ bestätigen. Das Bild ist ein Gesundheitsdatum: kein Name im Dateinamen, keine Vorschau im Plan.
- Liegt vor: ruhige Zeile mit `laeuseschein`, „Geprüft von … am …“.
''')
