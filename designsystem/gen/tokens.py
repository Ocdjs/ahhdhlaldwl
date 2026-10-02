import json
# Farben: (name, tag, nacht, usage)
C = [
 ("grund","#EEF1F3","#0D1215","Seitengrund hinter allen Flächen. Nie für Text."),
 ("flaeche","#FFFFFF","#161D21","Karten, Zimmerrahmen, Detailbereich, Dialoge."),
 ("flaeche-2","#F6F8F9","#1D262B","Navigationsleiste, Eingabefelder, ruhige Knöpfe, Kopfzeilen von Tabellen."),
 ("flaeche-3","#E2E7EA","#27323A","Gedrückter Zustand, Schaltergleis, Fortschrittsbalken-Grund."),
 ("linie","#D3DAE0","#2C3840","Haarlinien und Trenner ohne Bedeutung. Nie als einzige Kante eines Bedienelements."),
 ("linie-stark","#7D8B94","#6E7F8A","Kanten von Bedienelementen, freie Betten, Fokusringe auf hellem Grund; mindestens 3:1 auf flaeche und grund."),
 ("tinte","#121A1F","#E8EEF1","Fließtext und Namen auf grund, flaeche, flaeche-2 und allen hellen Status-Flächen."),
 ("tinte-2","#46545C","#A9B6BD","Nebentext (Nächte, Zeiten, Absender) auf grund, flaeche, flaeche-2."),
 ("tinte-3","#5F6D75","#84939B","Hinweise, Platzhalter, inaktive Beschriftungen auf flaeche und grund."),
 ("primaer","#121A1F","#E8EEF1","Füllung des Hauptknopfs und der gewählten Navigation. Die App hat keine Markenfarbe: Bedienung ist Tinte."),
 ("auf-primaer","#FFFFFF","#0D1215","Text und Symbole auf primaer."),
 ("fokus","#121A1F","#E8EEF1","Fokusring 2dp mit 2dp Abstand in flaeche; 3:1 auf jeder Fläche."),
 ("frei","#1A7340","#5FD08A","Status frei: Kante, Wort „frei“, Plus-Symbol. Text auf frei-flaeche und flaeche."),
 ("frei-flaeche","#E3F4E8","#12301F","Füllung freier Betten und „frei bis“."),
 ("blau","#1D5FBF","#6FA8F5","Status erwartet: Kante und Beschriftung; Duschslot-Symbol. Text auf erwartet-flaeche und flaeche."),
 ("erwartet-flaeche","#E2ECFB","#142640","Füllung erwarteter Betten (reserviert, heute noch nicht eingecheckt)."),
 ("anwesend","#1D5FBF","#346EBD","Füllung anwesender Betten (kräftig)."),
 ("auf-anwesend","#FFFFFF","#FFFFFF","Name, Nummer und Symbole auf anwesend."),
 ("gehalten-flaeche","#E1E5E8","#252D33","Füllung „freigehalten bis“ (mit Schloss); zählt nicht als frei."),
 ("aus-flaeche","#EDF0F2","#11171A","Grund deaktivierter Betten und Zimmer; mit aus-schraffur."),
 ("aus-schraffur","#C2CBD1","#2E3940","Schraffur deaktivierter Betten, 45°, 1,5dp, Abstand 6dp."),
 ("auf-frei","#FFFFFF","#0D1215","Text und Symbole auf frei als Füllung (Marke „Bestätigt“ am Unterschriftsfeld)."),
 ("ampel-gruen","#1A7A3E","#4CC27A","Ampel grün (ab 3 freie Betten). Immer mit Zahl und Wort."),
 ("ampel-gelb","#E3A600","#F2C14B","Ampel gelb (1–2 freie Betten). Text darauf: auf-gelb."),
 ("ampel-rot","#C62828","#F06A5F","Ampel rot (0 freie Betten)."),
 ("auf-ampel","#FFFFFF","#0D1215","Zahl auf ampel-gruen und ampel-rot."),
 ("auf-gelb","#1F1700","#1F1700","Text und Symbole auf ampel-gelb und karte-gelb."),
 ("karte-gelb","#F4C20D","#F2C94C","Gelbe Karte: Füllung des Kartensymbols."),
 ("karte-gelb-rand","#7A5F00","#F2C94C","Kante der gelben Karte, damit sie auf weißem Grund sichtbar bleibt (3:1)."),
 ("karte-rot","#C62828","#F06A5F","Rote Karte (Hausverbot): Füllung des Kartensymbols, Warnzeile in der Suche."),
 ("warnung","#A84B07","#F5A54A","Läuseschein fehlt, Konflikte, Abgleich gestört: Symbol und Text auf flaeche und warnung-flaeche."),
 ("warnung-flaeche","#FDF0DC","#3A2A12","Hintergrund von Warnzeilen und Erinnerungen."),
 ("vorfall","#B42318","#F2786D","Rahmen von Berichten mit Vorfall, Hausverbot-Warnung, Löschen."),
 ("vorfall-flaeche","#FBE7E5","#3A1714","Hintergrund der Hausverbot-Warnung und von Vorfall-Kopfzeilen."),
 ("auf-vorfall","#FFFFFF","#1A0705","Text auf vorfall als Füllung (Löschen bestätigen)."),
 ("abdunklung","rgba(13, 18, 21, 0.45)","rgba(0, 0, 0, 0.62)","Abdunklung hinter Detailbereich, Dialog und Assistent."),
 ("papier","#FBFAF7","#E7E3DA","Grund von Unterschriftsfeldern und Dokumentansichten, auch nachts hell, damit die Unterschrift wie auf Papier aussieht."),
 ("papier-linie","#8A8475","#7E7768","Unterschriftslinie und × auf papier."),
 ("auf-papier-2","#655F52","#5C5649","Nebentext auf papier: Hilfetext im Unterschriftsfeld, „Tippen zum Unterschreiben“."),
 ("stift-tinte","#1B3A8C","#1B3A8C","Strichfarbe der Unterschrift (Kugelschreiberblau), in beiden Modi gleich; auch im PDF."),
 ("auf-papier","#2B2A26","#2B2A26","Text auf papier (Hausordnung, Datenschutz)."),
]
themes=[{"id":"tag","name":"Tag"},{"id":"nacht","name":"Nacht"}]
color={"themes":themes,"tokens":[{"name":n,"value":{"tag":a,"nacht":b},"usage":u} for n,a,b,u in C]}
fam={"ui":"\"Atkinson Hyperlegible Next\", \"Noto Sans\", system-ui, sans-serif",
     "zahl":"\"Atkinson Hyperlegible Mono\", ui-monospace, \"Roboto Mono\", monospace",
     "dokument":"\"Noto Sans\", \"Atkinson Hyperlegible Next\", sans-serif",
     "rtl":"\"Noto Sans Arabic\", \"Noto Sans\", sans-serif"}
S=lambda name,fs,lh,fw,**k: dict({"name":name,"fontSize":f"{fs}px","lineHeight":f"{lh}px","fontWeight":fw},**k)
typ={"fonts":[],"families":fam,"groups":[
 {"name":"Oberfläche","family":"ui","styles":[
   S("titel-gross",28,34,700,letterSpacing="-0.01em",sample="Bettenplan",usage="Ein Titel pro Bereich, links oben im Inhalt."),
   S("titel",22,28,700,sample="Gastdetails",usage="Titel von Detailbereich, Dialog und Assistent."),
   S("abschnitt",18,24,700,sample="Seit deinem letzten Dienst",usage="Überschriften von Abschnitten im Bericht und in den Gastdetails."),
   S("name-bett",20,24,700,sample="Max",usage="Vorname groß auf dem Bett. Lange Namen werden mit … gekürzt, nie umbrochen."),
   S("text",17,26,400,sample="Max hat heute nach einer Decke gefragt.",usage="Fließtext, Berichtsfelder, Eingaben."),
   S("text-stark",17,26,600,sample="Läuseschein fehlt seit 3 Tagen",usage="Hervorhebung im Fließtext, Warnzeilen."),
   S("text-klein",15,22,400,sample="12 Nächte · seit 03.10.",usage="Nebentext unter Namen, Absender, Zeitstempel."),
   S("knopf",17,24,600,sample="Gast aufnehmen",usage="Beschriftung aller Knöpfe und Schnellaktionen."),
   S("label",14,18,600,letterSpacing="0.01em",sample="Vorname",usage="Feldbeschriftungen über Eingaben."),
   S("ueberzeile",13,16,700,letterSpacing="0.08em",sample="ZIMMER D",usage="Zimmernamen im Rahmen und Gruppenköpfe; immer Versalien."),
 ]},
 {"name":"Zahlen","family":"zahl","styles":[
   S("zahl-gross",36,40,600,sample="3",usage="Ampelzahl, KHT-Nummer, Kennzahlen."),
   S("nummer-gross",28,32,600,sample="D4",usage="Bettnummer im Kopf des Detailbereichs."),
   S("nummer",15,18,600,sample="D4 · 20:30",usage="Bettnummern auf Karten, Uhrzeiten, Aufnahmenummer."),
 ]},
 {"name":"Dokumente","family":"dokument","styles":[
   S("dokument",17,28,400,sample="Ruhe ab 22:00 Uhr.",usage="Hausordnung und Datenschutzerklärung auf papier, links- und rechtsläufig."),
   S("dokument-rtl",19,32,400,family="rtl",sample="الهدوء من الساعة 22:00",usage="Arabisch und Farsi; Absatzrichtung rechts nach links."),
 ]},
]}
spacing={"tokens":[{"name":f"abstand-{i}","value":f"{v}px","usage":u} for i,(v,u) in enumerate([
 (4,"Abstand Symbol zu Text in Chips."),(8,"Abstand innerhalb von Karten, zwischen Chips."),(12,"Innenabstand von Bettkarten, Lücke zwischen Bettkarten."),
 (16,"Innenabstand von Zimmerrahmen und Feldern."),(24,"Innenabstand von Detailbereich und Dialogen, Abstand zwischen Abschnitten."),
 (32,"Abstand zwischen Zimmerrahmen und großen Gruppen."),(48,"Abstand zwischen Bereichen eines Berichts."),(64,"Rand um leere Zustände.")],1)]}
radius={"tokens":[
 {"name":"radius-s","value":"6px","usage":"Chips, Datums-Marken, Symbole mit Fläche."},
 {"name":"radius-m","value":"10px","usage":"Bettkarten, Knöpfe, Eingabefelder."},
 {"name":"radius-l","value":"16px","usage":"Zimmerrahmen, Detailbereich, Dialoge, Unterschriftsfeld."},
 {"name":"radius-rund","value":"999px","usage":"Navigation, Schalter, Status-Pillen, Ampel."}]}
groesse={"tokens":[
 {"name":"ziel-min","value":"48px","usage":"Kleinste Trefferfläche (48dp) für jedes Bedienelement, auch Symbole."},
 {"name":"ziel-gross","value":"56px","usage":"Hauptknöpfe, Navigation, Schnellaktionen am Bett, Ja/Nein-Felder."},
 {"name":"bett-breite","value":"152px","usage":"Mindestbreite einer Bettkarte."},
 {"name":"bett-hoehe","value":"88px","usage":"Höhe einer Bettkarte; Stockbett = 2 × bett-hoehe + 8."},
 {"name":"leiste-breite","value":"104px","usage":"Navigationsleiste links, immer sichtbar."},
 {"name":"kopf-hoehe","value":"72px","usage":"Kopfzeile mit Datum, Abgleich, Glocke, Dienstpersonen."},
 {"name":"detail-breite","value":"460px","usage":"Detailbereich rechts (Gastdetails), etwa 36 % der Breite."},
 {"name":"symbol","value":"24px","usage":"Standardgröße aller Symbole."},
 {"name":"symbol-klein","value":"18px","usage":"Symbole auf Bettkarten und in Chips."},
 {"name":"unterschrift-hoehe","value":"220px","usage":"Mindesthöhe eines Unterschriftsfelds."}]}
dauer={"tokens":[
 {"name":"dauer-sofort","value":"90ms","usage":"Druck-Rückmeldung, Farbwechsel beim Antippen."},
 {"name":"dauer-kurz","value":"150ms","usage":"Schnellauswahl am Bett, Chips, Ausblenden."},
 {"name":"dauer-mittel","value":"250ms","usage":"Statuswechsel am Bett, Assistent-Schritt, Datumswechsel."},
 {"name":"dauer-lang","value":"350ms","usage":"Detailbereich, Tauschen zweier Betten, Bericht abschließen."},
 {"name":"dauer-einblendung","value":"6000ms","usage":"Standzeit einer Einblendung (Duschslot) bevor sie in die Glocke wandert."}]}
kurve={"tokens":[
 {"name":"kurve-standard","value":"cubic-bezier(0.2, 0, 0, 1)","usage":"Alles, was auf dem Bildschirm bleibt und sich bewegt."},
 {"name":"kurve-eintritt","value":"cubic-bezier(0.05, 0.7, 0.1, 1)","usage":"Elemente, die hereinkommen: Detailbereich, Einblendung, Dialog."},
 {"name":"kurve-austritt","value":"cubic-bezier(0.3, 0, 0.8, 0.15)","usage":"Elemente, die gehen."}]}
shadow={"tokens":[
 {"name":"schatten-gehoben","value":{"tag":"0 10px 28px rgba(13, 18, 21, 0.24)","nacht":"0 10px 28px rgba(0, 0, 0, 0.6)"},"usage":"Nur für die Bettkarte, die gerade gezogen wird."},
 {"name":"schatten-schwebend","value":{"tag":"0 4px 16px rgba(13, 18, 21, 0.16)","nacht":"0 4px 16px rgba(0, 0, 0, 0.5)"},"usage":"Schnellauswahl am Bett und Einblendungen, die über dem Plan schweben."}]}
tokens={"name":"Notübernachtung","version":1,"color":color,"type":typ,"spacing":spacing,"radius":radius,"shadow":shadow,"groesse":groesse,"dauer":dauer,"kurve":kurve}
json.dump(tokens,open('project/tokens.json','w',encoding='utf8'),ensure_ascii=False,indent=1)
# tokens.css für lokale Vorschau und Prototyp
def css():
  out=[":root{"]+[f"  --{n}:{a};" for n,a,b,u in C]+[f"  --{t['name']}:{t['value']['tag']};" for t in shadow['tokens']]
  for fam_ in (spacing,radius,groesse,dauer,kurve): out+= [f"  --{t['name']}:{t['value']};" for t in fam_['tokens']]
  out+= [f"  --font-{k}:{v};" for k,v in fam.items()]+["}"]
  dark=[f"  --{n}:{b};" for n,a,b,u in C]+[f"  --{t['name']}:{t['value']['nacht']};" for t in shadow['tokens']]
  out+= ['[data-theme="nacht"]{color-scheme:dark;']+dark+["}"]
  out+= ['@media (prefers-color-scheme: dark){:root:not([data-theme="tag"]){color-scheme:dark;']+dark+["}}"]
  for g in typ['groups']:
    for s in g['styles']:
      f=s.get('family',g['family'])
      ls=f"letter-spacing:{s['letterSpacing']};" if 'letterSpacing' in s else ''
      tt="text-transform:uppercase;" if s['name']=='ueberzeile' else ''
      out.append(f".{s['name']}{{font-family:var(--font-{f});font-size:{s['fontSize']};line-height:{s['lineHeight']};font-weight:{s['fontWeight']};{ls}{tt}}}")
  return "\n".join(out)
open('gen/tokens.css','w').write(css())
print(len(C),"colors")
