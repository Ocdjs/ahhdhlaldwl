#!/usr/bin/env python3
"""Prüft einen Notuebernachtung-Ordner (Beispiel oder echte Nextcloud-Kopie) gegen Schemas und Regeln.

    python3 pruefen.py [Ordner]        Standard: ./Notuebernachtung

Braucht: pip install jsonschema
"""
import csv, io, json, os, re, sys
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HIER, 'Notuebernachtung'))
SCHEMAS = {}
for f in os.listdir(os.path.join(HIER, 'schema')):
    s = json.load(open(os.path.join(HIER, 'schema', f)))
    SCHEMAS[f.replace('.schema.json', '')] = s
REG = Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in SCHEMAS.values())

# Pfad (relativ zur Wurzel) → Schema. Reihenfolge zählt: erster Treffer gilt.
REGELN = [
    (r'^_app/version\.json$', 'version'),
    (r'^_app/Geraete/[a-z0-9-]+\.json$', 'geraet'),
    (r'^_app/Protokoll/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}_[a-z0-9-]+\.jsonl$', 'protokoll*'),
    (r'^Einstellungen/Haus\.json$', 'haus'),
    (r'^Einstellungen/Grundriss_St-(Pius|Nikolaus)\.json$', 'grundriss'),
    (r'^Einstellungen/App\.json$', 'einstellungen'),
    (r'^Einstellungen/Team\.json$', 'team'),
    (r'^Einstellungen/Texte/(Hausordnung/[a-z]{2}|Datenschutz/de)\.md$', None),
    (r'^Gaeste/g-[a-z2-7]{8}/Gast\.json$', 'gast'),
    (r'^Gaeste/g-[a-z2-7]{8}/Ereignisse/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_[A-Za-z0-9_-]+_(sanktion|notiz)\.json$', 'ereignis'),
    (r'^Gaeste/g-[a-z2-7]{8}/Dokumente/[A-Za-z0-9._-]+\.(pdf|jpg|png)$', None),
    (r'^Gaeste/g-[a-z2-7]{8}/Unterschriften/\d{4}-\d{2}-\d{2}_(Hausordnung|Datenschutz)_(Gast|Betreuung)\.png$', None),
    (r'^Belegung/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}\.json$', 'belegung'),
    (r'^Duschplan/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}\.json$', 'duschplan'),
    (r'^Berichte/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}/Bericht\.json$', 'bericht'),
    (r'^Berichte/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}/\d{4}-\d{2}-\d{2}_Dienstbericht\.pdf$', None),
    (r'^Berichte/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}/Unterschriften/[A-Za-z0-9-]+_[A-Za-z0-9-]+\.png$', None),
    (r'^Berichte/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}/Nachtraege/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_[A-Za-z0-9-]+\.json$', 'nachtrag'),
    (r'^Berichte/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}/Kommentare/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_[A-Za-z0-9-]+\.json$', 'kommentar'),
    (r'^Berichte/\d{4}-\d{2}/Fehlt_erledigt\.json$', 'fehlt_erledigt'),
    (r'^Kalender/Aenderungen/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_[A-Za-z0-9-]+\.json$', 'planaenderung'),
    (r'^Hinweise/\d{4}-\d{2}/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_[A-Za-z0-9-]+\.json$', 'hinweis'),
    (r'^Hinweise/Eingang/(LIESMICH|Uebernommen/[A-Za-z0-9._-]+|[A-Za-z0-9._-]+)\.txt$', None),
    (r'^Kalender/Dienstplan/\d{4}-\d{2}\.json$', 'dienstplan'),
    (r'^Kalender/Termine/\d{4}-\d{2}\.json$', 'termine'),
    (r'^Kalender/Dienstplan-Eingang/(LIESMICH\.txt|Eingelesen/[A-Za-z0-9._-]+\.(pdf|ics|jpg)|[A-Za-z0-9._-]+\.(pdf|ics|jpg))$', None),
    (r'^Monatsabschluss/\d{4}-\d{2}/Plan0\.json$', 'plan0'),
    (r'^Monatsabschluss/\d{4}-\d{2}/Plankorrekturen/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_[A-Za-z0-9]+_[A-Za-z0-9]+-(Betreuung|Kueche)\.json$', 'plankorrektur'),
    (r'^Monatsabschluss/\d{4}-\d{2}/(Betreuung|Kueche)/\d{4}-\d{2}_Dienstnachweis_(Betreuung|Kueche)_[A-Za-z0-9]+\.json$', 'dienstnachweis'),
    (r'^Monatsabschluss/\d{4}-\d{2}/(Betreuung|Kueche)/\d{4}-\d{2}_Dienstnachweis_(Betreuung|Kueche)_[A-Za-z0-9]+\.(pdf|png)$', None),
    (r'^Monatsabschluss/\d{4}-\d{2}/Lohnabrechnung_\d{4}-\d{2}_(Betreuung|Kueche)\.csv$', 'lohn*'),
    (r'^Auswertung/Belegung_\d{4}-\d{2}\.csv$', 'auswertung*'),
    (r'^LIESMICH\.md$', None),
]
LOHN = ['Person', 'Personalnummer', 'Bereich', 'Monat', 'Geplant', 'Gemacht', 'Abgegeben', 'Vertretung', 'Unterschrieben', 'PDF']
AUSW = ['Datum', 'KHT-Nummer', 'Frei', 'Gesamt', 'Notbetten belegt', 'St. Nikolaus belegt', 'Ampel', 'Hat KHT angerufen']

fehler, gezaehlt, daten = [], {}, {}
def fehl(pfad, text): fehler.append(f'{pfad}: {text}')
def pruef_schema(pfad, inhalt, name):
    v = Draft202012Validator(SCHEMAS[name], registry=REG)
    for e in sorted(v.iter_errors(inhalt), key=lambda e: list(e.path)):
        fehl(pfad, f'{"/".join(str(x) for x in e.path) or "(Wurzel)"}: {e.message[:160]}')

def csv_lesen(p, kopf, pfad):
    roh = open(p, encoding='utf-8').read()
    if not roh.startswith('﻿'): fehl(pfad, 'CSV ohne BOM (Excel zeigt Umlaute sonst falsch)')
    zeilen = list(csv.reader(io.StringIO(roh.lstrip('﻿')), delimiter=';'))
    if zeilen[0] != kopf: fehl(pfad, f'Kopfzeile {zeilen[0]} statt {kopf}')
    return zeilen[1:]

for ordner, _, dateien in os.walk(WURZEL):
    for f in dateien:
        p = os.path.join(ordner, f); pfad = os.path.relpath(p, WURZEL).replace(os.sep, '/')
        if not re.fullmatch(r'[A-Za-z0-9._/-]+', pfad): fehl(pfad, 'Pfad nur aus ASCII-Buchstaben, Ziffern, . _ - (keine Umlaute, Leerzeichen, Doppelpunkte)')
        regel = next((r for r in REGELN if re.match(r[0], pfad)), None)
        if not regel: fehl(pfad, 'keine Regel – Datei gehört nicht in diesen Ordner'); continue
        art = regel[1]; gezaehlt[art or 'datei'] = gezaehlt.get(art or 'datei', 0) + 1
        if art is None:
            if pfad.endswith('.pdf') and not open(p, 'rb').read(5) == b'%PDF-': fehl(pfad, 'kein PDF')
            if pfad.endswith('.png') and not open(p, 'rb').read(8) == b'\x89PNG\r\n\x1a\n': fehl(pfad, 'kein PNG')
            continue
        if art == 'protokoll*':
            for i, z in enumerate(open(p, encoding='utf-8')):
                pruef_schema(f'{pfad}:{i+1}', json.loads(z), 'protokoll')
            continue
        if art == 'lohn*':
            for z in csv_lesen(p, LOHN, pfad):
                if not os.path.exists(os.path.join(os.path.dirname(p), z[9])): fehl(pfad, f'PDF fehlt: {z[9]}')
            continue
        if art == 'auswertung*': csv_lesen(p, AUSW, pfad); continue
        try: inhalt = json.load(open(p, encoding='utf-8'))
        except Exception as e: fehl(pfad, f'kein gültiges JSON: {e}'); continue
        pruef_schema(pfad, inhalt, art); daten[pfad] = inhalt

# Querverweise
gaeste = {p.split('/')[1] for p in daten if p.startswith('Gaeste/') and p.endswith('/Gast.json')}
def gast_da(pfad, gid):
    if gid and gid not in gaeste: fehl(pfad, f'Gast {gid} hat keinen Ordner unter Gaeste/')
def datei_da(pfad, rel, basis):
    if rel and not os.path.exists(os.path.join(WURZEL, basis, rel)): fehl(pfad, f'Verweis zeigt ins Leere: {rel}')
bettnummern = set()
for p, x in daten.items():
    if p == 'Einstellungen/Haus.json':
        for st in x['standorte']:
            datei_da(p, st['grundriss'], '')
            for z in st['zimmer']:
                for b in z['betten']:
                    if b['nr'] in bettnummern: fehl(p, f'Bettnummer doppelt: {b["nr"]}')
                    bettnummern.add(b['nr'])
for p, x in daten.items():
    ordner = os.path.dirname(p)
    if p.startswith('Gaeste/') and p.endswith('/Gast.json'):
        if x['id'] != p.split('/')[1]: fehl(p, 'id passt nicht zum Ordnernamen')
        for dk in x['dokumente']: datei_da(p, dk['datei'], ordner)
        for a in x['aufnahmen']: datei_da(p, a['pdf'], ordner)
    elif '/Ereignisse/' in p:
        if x['gast_id'] != p.split('/')[1]: fehl(p, 'gast_id passt nicht zum Ordner')
        if x.get('bericht'): datei_da(p, x['bericht'] + '/Bericht.json', '')
    elif p.startswith('Belegung/'):
        if not p.endswith(x['diensttag'] + '.json'): fehl(p, 'diensttag passt nicht zum Dateinamen')
        for nr, b in x['betten'].items():
            if nr not in bettnummern: fehl(p, f'Bett {nr} steht nicht in Haus.json')
            gast_da(p, b.get('gast'))
            if (b['status'] == 'frei') != (b.get('gast') is None) and b['status'] not in ('gesperrt', 'fehlt_ab_2', 'frei_bis'): fehl(p, f'{nr}: Status {b["status"]} passt nicht zum Gast')
        belegt = sum(1 for b in x['betten'].values() if b['status'] in ('anwesend', 'erwartet', 'fehlt', 'freigehalten'))
        if belegt != x['kennzahlen']['kht_nummer']: fehl(p, f'KHT-Nummer {x["kennzahlen"]["kht_nummer"]}, gezählt {belegt} belegte Betten')
    elif p.startswith('Duschplan/'):
        for z, s in x['slots'].items(): gast_da(p, s['gast'])
    elif p.endswith('/Bericht.json'):
        for b in x['besetzung']: datei_da(p, b['unterschrift'], ordner)
        datei_da(p, x['pdf'], ordner)
        if x['status'] == 'abgeschlossen' and x['felder']['kht_angerufen'] is None: fehl(p, 'abgeschlossen ohne „Hat KHT angerufen?“')
        for zo in x['zuordnung']:
            gast_da(p, zo['gast']); [gast_da(p, g) for g in zo['erwaehnt']]; datei_da(p, zo['ereignis'], '')
        offen = [b['person'] for b in x['besetzung'] if not b['unterschrift']]
        if x['status'] == 'abgeschlossen':
            nachgeholt = set()
            nd = os.path.join(WURZEL, ordner, 'Nachtraege')
            if os.path.isdir(nd):
                for f in os.listdir(nd):
                    n = json.load(open(os.path.join(nd, f)))
                    if n['art'] == 'unterschrift_nachgeholt': nachgeholt.add(n['von'])
            for person in offen:
                if person not in x['ohne_unterschrift']: fehl(p, f'{person} ohne Unterschrift, aber nicht in ohne_unterschrift')
            for person in x['ohne_unterschrift']:
                if person not in offen and person not in nachgeholt: fehl(p, f'{person} steht in ohne_unterschrift, hat unterschrieben, aber kein Nachtrag „unterschrift_nachgeholt“')
    elif '/Kommentare/' in p:
        gast_da(p, x['gast']); datei_da(p, x['hinweis'], ''); datei_da(p, x['notiz'], '')
    elif p.startswith('Kalender/Dienstplan/'):
        for t, v in x['tage'].items():
            if v.get('geaendert'):
                if not any(json.load(open(os.path.join(WURZEL, 'Kalender/Aenderungen', t[:7], f))).get('datum') == t for f in os.listdir(os.path.join(WURZEL, 'Kalender/Aenderungen', t[:7]))):
                    fehl(p, f'{t}: als geändert markiert, aber keine Datei unter Kalender/Aenderungen/')
    elif '/Nachtraege/' in p:
        datei_da(p, x['unterschrift'], os.path.dirname(ordner))
    elif p.startswith('Hinweise/'):
        if x['ab'] > x['bis']: fehl(p, 'ab liegt nach bis')
        if x.get('bezug'): datei_da(p, x['bezug'] + '/Bericht.json', '')
    elif '/Plankorrekturen/' in p or p.endswith('/Plan0.json'):
        if not p.split('/')[1] == x['monat']: fehl(p, 'monat passt nicht zum Ordner')
    elif '_Dienstnachweis_' in p:
        datei_da(p, x['unterschrift'], ordner); datei_da(p, x['pdf'], ordner)
        s = x['summen']
        if s['gemacht'] != sum(1 for t in x['tage'] if t['gemacht']): fehl(p, 'Summe gemacht passt nicht zu den Tagen')
        if s['geplant'] != sum(1 for t in x['tage'] if t['geplant']): fehl(p, 'Summe geplant passt nicht zu den Tagen')
        if any('krank' in (t['bemerkung'] or '').lower() for t in x['tage']): fehl(p, '„krank“ ist kein Grund mehr')

print(f'Geprüft: {WURZEL}')
for k in sorted(gezaehlt): print(f'  {gezaehlt[k]:4d}  {k}')
if fehler:
    print(f'\n{len(fehler)} Fehler:'); [print('  ' + f) for f in fehler]; sys.exit(1)
print('\nAlles in Ordnung.')
