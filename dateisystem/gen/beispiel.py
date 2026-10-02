# Erzeugt dateisystem/Notuebernachtung (Beispielinhalt) aus dem Zustand des Prototyps.
# Vorher: node gen/zustand.js (schreibt gen/zustand.json). Danach: python3 pruefen.py
import json, os, re, shutil, hashlib, base64, zlib, struct, math, sys

SP = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.dirname(SP)
d = json.load(open(os.path.join(SP, 'zustand.json')))
S = d['S']; HEUTE = d['H']
if HEUTE != '2026-10-02': print('Hinweis: Das Beispiel ist auf den Diensttag 2026-10-02 abgestimmt, der Prototyp lieferte', HEUTE, '- einige feste Daten passen dann nicht.')
TZ = '+02:00'
GERAET = 'tablet-st-pius'

ROOT = os.path.join(ZIEL, 'Notuebernachtung')
if os.path.exists(ROOT): shutil.rmtree(ROOT)
os.makedirs(ROOT)

def ascii_name(t):
    for a, b in [('ä','ae'),('ö','oe'),('ü','ue'),('Ä','Ae'),('Ö','Oe'),('Ü','Ue'),('ß','ss')]: t = t.replace(a, b)
    t = re.sub(r'[^A-Za-z0-9._-]+', '_', t.strip()); return t.strip('_')

def schreib(rel, inhalt, binaer=False):
    p = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if binaer: open(p, 'wb').write(inhalt)
    elif isinstance(inhalt, (dict, list)): open(p, 'w').write(json.dumps(inhalt, ensure_ascii=False, indent=2) + '\n')
    else: open(p, 'w').write(inhalt)
    return rel

def zeit(datum, uhr='21:00:00'): return f'{datum}T{uhr}{TZ}'
def zname(datum, uhr): return f'{datum}T{uhr.replace(":", "-")}'

def meta(schema, um, von, aenderbar=True, version=1):
    m = {'schema': schema, 'geaendert_um' if aenderbar else 'angelegt_um': um, 'geaendert_von' if aenderbar else 'angelegt_von': von, 'geraet': GERAET}
    if aenderbar: m['version'] = version
    else: m['unveraenderlich'] = True
    return m

# ---------- kleine Binärdateien: PDF und PNG ----------
def pdf(zeilen):
    def esc(s): return s.encode('cp1252').replace(b'\\', b'\\\\').replace(b'(', b'\\(').replace(b')', b'\\)')
    stream = b'BT /F1 11 Tf 56 780 Td 15 TL ' + b' '.join(b'(' + esc(z) + b') Tj T*' for z in zeilen) + b' ET'
    objs = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
            b'<< /Length ' + str(len(stream)).encode() + b' >>\nstream\n' + stream + b'\nendstream']
    out = b'%PDF-1.4\n'; pos = []
    for i, o in enumerate(objs):
        pos.append(len(out)); out += f'{i+1} 0 obj\n'.encode() + o + b'\nendobj\n'
    x = len(out)
    out += f'xref\n0 {len(objs)+1}\n0000000000 65535 f \n'.encode() + b''.join(f'{p:010d} 00000 n \n'.encode() for p in pos)
    out += f'trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{x}\n%%EOF\n'.encode()
    return out

def png_unterschrift(saat):
    w, h = 360, 96; px = [[0]*w for _ in range(h)]
    for i in range(w * 3):
        x = 12 + i / 3 * (w - 24) / w
        y = h / 2 + math.sin(x / (14 + saat % 5) + saat) * 22 * math.exp(-((x - w / 2) / (w * .6)) ** 2) + math.sin(x / 5 + saat) * 4
        for dy in (-1, 0, 1):
            yy = int(y) + dy
            if 0 <= yy < h and 0 <= int(x) < w: px[yy][int(x)] = 255
    raw = b''.join(b'\x00' + b''.join(bytes((27, 58, 140, a)) for a in r) for r in px)
    def chunk(t, dta): return struct.pack('>I', len(dta)) + t + dta + struct.pack('>I', zlib.crc32(t + dta) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')

# ---------- IDs ----------
def gid(alt): return 'g-' + base64.b32encode(hashlib.sha1(alt.encode()).digest()).decode().lower()[:8]
GID = {k: gid(k) for k in S['G']}
STANDORT = {'haus': 'st-pius', 'nikolaus': 'st-nikolaus'}
STATUS = {'frei': 'frei', 'erwartet': 'erwartet', 'anwesend': 'anwesend', 'fehlt': 'fehlt', 'fehlt2': 'fehlt_ab_2', 'gehalten': 'freigehalten', 'freibis': 'frei_bis', 'aus': 'gesperrt'}

# ---------- _app ----------
schreib('_app/version.json', {'schema_version': 1, 'mindest_app_version': '1.0.0', 'ordner_angelegt': zeit('2026-09-01', '12:00:00'), 'hinweis': 'Technische Datei der App. Nicht bearbeiten.'})
schreib(f'_app/Geraete/{GERAET}.json', {'id': GERAET, 'name': 'Tablet St. Pius', 'nextcloud_benutzer': 'nu-tablet-st-pius', 'app_version': '1.0.0', 'letzter_abgleich': zeit(HEUTE, '21:00:12'), 'offene_aenderungen': 0, '_meta': meta('geraet/1', zeit(HEUTE, '21:00:12'), 'App', True, 812)})
proto = [
    {'um': zeit(HEUTE, '18:52:10'), 'von': 'Kim', 'art': 'bericht.begonnen', 'ziel': f'Berichte/{HEUTE[:7]}/{HEUTE}'},
    {'um': zeit(HEUTE, '19:04:33'), 'von': 'Kim', 'art': 'bett.status', 'ziel': 'D4', 'gast': GID['g3'], 'alt': 'erwartet', 'neu': 'anwesend'},
    {'um': zeit(HEUTE, '19:31:02'), 'von': 'Kim', 'art': 'dusche.status', 'ziel': '19:00', 'gast': GID['g1'], 'neu': 'erledigt'},
    {'um': zeit(HEUTE, '20:10:45'), 'von': 'Sam', 'art': 'bett.aufnahme', 'ziel': 'E1', 'gast': GID['g19'], 'neu': 'anwesend', 'zusatz': 'Kältebus'},
    {'um': zeit(HEUTE, '20:15:00'), 'von': 'Leitung', 'art': 'hinweis.angelegt', 'ziel': 'Hinweise/2026-10/2026-10-02T20-15-00_Leitung.json'},
]
schreib(f'_app/Protokoll/{HEUTE[:7]}/{HEUTE}_{GERAET}.jsonl', ''.join(json.dumps(z, ensure_ascii=False) + '\n' for z in proto))

# ---------- Einstellungen ----------
def bett_einträge(plan, standort):
    zimmer = []
    for z in plan:
        betten = []
        for teil in z['teile']:
            for x in teil:
                if isinstance(x, list):
                    for i, y in enumerate(x): betten.append({'nr': y, 'platz': S['lage'].get(y, y), 'art': 'stockbett', 'stockbett': x[0] + '/' + x[1], 'lage': 'oben' if i == 0 else 'unten'})
                else: betten.append({'nr': x, 'platz': S['lage'].get(x, x), 'art': 'bett'})
        extra_ids = {e['id']: e for e in S['extra']}
        betten = [b for b in betten if b['nr'] not in extra_ids]
        for b in betten:
            b['notbett'] = bool(S['notbett'].get(b['nr'])); b['gesperrt'] = bool(S['offBeds'].get(b['nr']))
            if b['nr'] in d['ORT']: b['ort'] = d['ORT'][b['nr']]
        extra = [e for e in S['extra'] if (e['ort'] == 'niko') == (standort == 'st-nikolaus')]
        if z['id'] in ('X', 'NX'):
            for e in extra: betten.append({'nr': e['id'], 'platz': e['id'], 'art': 'zusatz', 'bezeichnung': e['name'], 'notbett': bool(S['notbett'].get(e['id'])), 'gesperrt': False})
        if z['id'] == 'X' and not extra:
            betten.append({'nr': 'Z1', 'platz': 'Z1', 'art': 'zusatz', 'bezeichnung': 'Sofa Wohnzimmer', 'notbett': False, 'gesperrt': True})
        eintrag = {'id': z['id'], 'name': z['name'], 'gesperrt': bool(S['offRooms'].get(z['id'])), 'betten': betten}
        if z['id'] == 'T': eintrag['zugang_ueber'] = 'F'
        if z['id'] == 'TH': eintrag['abschaltbar'] = True
        if z['id'] in ('D', 'T', 'F', 'B'): eintrag['tuer'] = z['id']
        if z['id'] in ('X', 'NX'): eintrag['frei_benennbar'] = True
        zimmer.append(eintrag)
    return zimmer

haus = {'standorte': [
    {'id': 'st-pius', 'name': 'St. Pius', 'grundriss': 'Einstellungen/Grundriss_St-Pius.json', 'zimmer': bett_einträge(d['haus'], 'st-pius'),
     'raeume': [{'id': 'BAD', 'name': 'Bad', 'art': 'bad', 'tuer': 'BAD'}, {'id': 'FLUR', 'name': 'Flur', 'art': 'flur', 'tuer': 'FLUR', 'gesperrt_wenn_alle_aus': ['T', 'F']}]},
    {'id': 'st-nikolaus', 'name': 'St. Nikolaus', 'grundriss': 'Einstellungen/Grundriss_St-Nikolaus.json', 'zimmer': bett_einträge(d['niko'], 'st-nikolaus'), 'raeume': []}],
    '_meta': meta('haus/1', zeit('2026-09-30', '16:20:00'), 'Leitung', True, 14)}
schreib('Einstellungen/Haus.json', haus)

GR = d['GR']
def plaetze_pius():
    p = {k: v for k, v in GR['einzel'].items()}
    for k in GR['stock']:
        sh = (k[5] - 9) / 2
        p[k[0]] = [k[2] + 3, k[3] + 3, k[4] - 6, sh]; p[k[1]] = [k[2] + 3, k[3] + 6 + sh, k[4] - 6, sh]
    return p
schreib('Einstellungen/Grundriss_St-Pius.json', {
    'standort': 'st-pius', 'einheiten': 'Grundriss-Einheiten; Bildschirm-dp = Einheit × (verfügbare Breite ÷ 971)', 'viewbox': [-10, -10, 971, 800],
    'boeden': {k: v for k, v in GR['boeden'].items()} | {'FLUR': [333, 328, 331, 117]},
    'privat': [[333, 13, 188, 309], [578, 451, 86, 279], {'pfad': 'M527 13 H740 V287 H664 V322 H527 Z'}],
    'waende': ['M336 733 H10 V10 H951 V733 H428', 'M170 10 V248 M170 316 V325', 'M330 10 V640 M330 712 V733', 'M524 10 V325', 'M743 10 V290', 'M10 325 H210 M282 325 H667', 'M667 290 H840 M912 290 H951', 'M667 290 V338 M667 410 V733', 'M330 448 H355 M427 448 H667', 'M458 448 V590 M458 662 V733', 'M575 448 V733'],
    'tueren': [{'id': k, 'angel': v['h'], 'offen_bis': v['o'], 'winkel_zu': v['w']} for k, v in d['TUEREN'].items()] + [{'id': 'D-innen', 'angel': [170, 316], 'offen_bis': [102, 316], 'winkel_zu': None, 'hinweis': 'Tür zwischen den beiden Räumen von Zimmer D, schließt nie'}],
    'bad': d['GR_BAD'], 'labels': GR['labels'], 'stockbetten': [{'oben': k[0], 'unten': k[1], 'rahmen': k[2:6]} for k in GR['stock']], 'plaetze': plaetze_pius(),
    'notizen': [{'text': 'PRIVAT', 'pos': [427, 172]}, {'text': 'PRIVAT', 'pos': [633, 172]}, {'text': 'PRIVAT', 'pos': [621, 594]}, {'text': 'FLUR', 'pos': [394, 566]}, {'text': 'TREPPE', 'pos': [382, 775]}],
    'rechts_daneben': ['L', 'E', 'TH', 'X'],
    '_meta': meta('grundriss/1', zeit('2026-09-01', '12:00:00'), 'Leitung', True, 3)})
schreib('Einstellungen/Grundriss_St-Nikolaus.json', {
    'standort': 'st-nikolaus', 'einheiten': 'Grundriss-Einheiten', 'viewbox': [-10, -10, 380, 440], 'boeden': {'N': [13, 13, 334, 394]}, 'privat': [], 'waende': ['M10 10 H350 V410 H10 Z'], 'tueren': [], 'bad': None,
    'labels': {'N': [180, 204]}, 'stockbetten': [], 'plaetze': d['GR_NIKO']['einzel'], 'notizen': [], 'rechts_daneben': ['NX'],
    '_meta': meta('grundriss/1', zeit('2026-09-01', '12:00:00'), 'Leitung', True, 1)})

schreib('Einstellungen/App.json', {
    'ampel': {'gruen_ab_freien_betten': S['ampel']['gruen'], 'gelb_ab_freien_betten': 1},
    'tageswechsel': '12:00', 'dienst': {'beginn': '18:45', 'ende': '08:00'},
    'duschplan': {'slots': d['slots'], 'slot_minuten': 30, 'vorlauf_tage': 3, 'bad_abschliessen_bis_alle_geduscht': True},
    'fehlt_etwas': ['Tüten', 'Putzmittel', 'Toilettenpapier', 'Decken', 'Kaffee', 'Seife'],
    'hinweise': {'dauern': ['naechster_dienst', '3_tage', '1_woche', '2_wochen', 'datum'], 'standard': '3_tage', 'standard_von_im_archiv': 'Leitung'},
    'besetzung': {'rollen': ['Betreuung 1', 'Betreuung 2', 'Küche'], 'gruende_abweichung': ['Tausch', 'Sonstiges']},
    'sprachen': [s[0] for s in d['sprachen']],
    'saison': {'name': '2026/27', 'beginn': '2026-10-01', 'ende': '2027-04-30', 'aufnahme_praefix': '2026-27', 'naechste_aufnahmenummer': S['naechsteNr']},
    'loeschfristen': {'vorschlag_vom_traeger_festzulegen': True, 'gaeste_monate_nach_letzter_nacht': 12, 'hausverbot_monate_nach_ende': 12, 'berichte_monate': 36, 'belegung_und_duschplan_monate': 36, 'hinweise_monate': 12, 'protokoll_monate': 12, 'monatsabschluss': 'nicht automatisch loeschen'},
    '_meta': meta('einstellungen/1', zeit('2026-09-30', '16:20:00'), 'Leitung', True, 9)})

schreib('Einstellungen/Team.json', {
    'personen': [{'name': n, 'bereiche': ['betreuung', 'kueche'] if n == 'Jule' else ['kueche'] if n == 'Mika' else ['betreuung'], 'personalnummer': f'P-{100 + i}', 'aktiv': True} for i, n in enumerate(d['team'])],
    'leitung': {'name': 'Leitung', 'anzeige': 'Leitung (Schwester)', 'darf': ['hinweise', 'einstellungen', 'plankorrektur', 'loeschlauf']},
    '_meta': meta('team/1', zeit('2026-09-01', '12:00:00'), 'Leitung', True, 2)})

TEXT_SPRACHEN = {s[0]: s for s in d['sprachen']}
for code, s in TEXT_SPRACHEN.items():
    kopf = f'---\ndokument: hausordnung\nsprache: {code}\nversion: 2026-10\ngueltig_ab: 2026-10-01\nrichtung: {"rtl" if code in ("ar", "fa") else "ltr"}\nunterschrieben_wird: {"ja" if code == "de" else "nein, Übersetzung zum Verständnis"}\n---\n'
    schreib(f'Einstellungen/Texte/Hausordnung/{code}.md', kopf + (f'# Hausordnung\n\nHier steht der verbindliche Text der Hausordnung. Eingesetzte Werte in doppelten geschweiften Klammern: {{{{bett}}}}, {{{{datum}}}}, {{{{gast}}}}.\n' if code == 'de' else f'# Hausordnung ({s[1]})\n\nÜbersetzung der deutschen Fassung 2026-10 ins {s[2]}e. Wird neben der deutschen Fassung angezeigt und als Anlage ins Aufnahme-PDF gelegt, aber nicht unterschrieben.\n'))
schreib('Einstellungen/Texte/Datenschutz/de.md', '---\ndokument: datenschutz\nsprache: de\nversion: 2026-10\ngueltig_ab: 2026-10-01\nunterschreibt: gast\n---\n# Datenschutzerklärung\n\nNur auf Deutsch. Unterschreibt nur der Gast.\n')

# ---------- Gäste ----------
def ereignis_name(datum, uhr, von, art): return f'{zname(datum, uhr)}_{ascii_name(von)}_{art}.json'
gaeste_dateien = {}
for k, g in S['G'].items():
    i = GID[k]; basis = f'Gaeste/{i}'
    standort = STANDORT[g['standort']]
    nr = g['nr']; erste = g['erste']
    bett = next((b for b, v in S['betten'].items() if v.get('g') == k), None)
    name_teil = ascii_name(g['vorname'] + ('_' + g['nachname'] if g['nachname'] else ''))
    aufnahme_pdf = f'{basis}/Dokumente/{nr[-4:]}_{name_teil}_{erste}.pdf'
    doks = []
    if g['unterschrieben']:
        schreib(aufnahme_pdf, pdf([f'Aufnahme {nr}', f'Gast: {g["vorname"]} {g["nachname"]}'.strip(), f'Bett: {bett or "-"} - Datum: {erste}', 'Hausordnung (deutsche Fassung, unterschrieben)', 'Datenschutzerklaerung (nur Gast)', 'Beispieldatei aus dem Dateisystem-Muster']), True)
        doks.append({'datei': aufnahme_pdf.split('/', 2)[2], 'art': 'aufnahme', 'titel': 'Aufnahme-PDF (Hausordnung und Datenschutz)', 'am': erste, 'von': 'Kim'})
        for teil, wer in (('Hausordnung', 'Gast'), ('Hausordnung', 'Betreuung'), ('Datenschutz', 'Gast')):
            schreib(f'{basis}/Unterschriften/{erste}_{teil}_{wer}.png', png_unterschrift(len(i) + len(teil) + len(wer) + int(hashlib.md5(i.encode()).hexdigest()[:2], 16) % 7), True)
    if g['laus'] == 'liegt' and standort == 'st-pius' and k in ('g31', 'g3'):
        lp = f'{basis}/Dokumente/Laeuseschein_{erste}.pdf'
        schreib(lp, pdf(['Laeuseschein (Scan)', f'Gast: {g["vorname"]}', f'Geprueft am {erste}']), True)
        doks.append({'datei': lp.split('/', 2)[2], 'art': 'laeuseschein', 'titel': 'Läuseschein', 'am': erste, 'von': 'Sam'})
    gast = {
        'id': i, 'vorname': g['vorname'], 'nachname': g['nachname'], 'spitzname': g['spitz'], 'standort': standort,
        'aufnahmen': [{'nr': nr, 'datum': erste, 'bett': bett, 'von': 'Kim', 'dauer': 'mehrere', 'ende': None, 'pdf': aufnahme_pdf.split('/', 2)[2] if g['unterschrieben'] else None}],
        'hausordnung': {'unterschrieben_am': erste if g['unterschrieben'] else None, 'version': '2026-10' if g['unterschrieben'] else None, 'art': 'app' if g['unterschrieben'] else None, 'uebersetzung': g['uebersetzung'] or (g['sprache'] if g['sprache'] != 'de' else None)},
        'datenschutz': {'unterschrieben_am': erste if g['unterschrieben'] else None, 'version': '2026-10' if g['unterschrieben'] else None},
        'sprache': g['sprache'],
        'laeuseschein': None if standort == 'st-nikolaus' else {'status': {'liegt': 'liegt_vor', 'fehlt': 'fehlt', 'nicht': 'nicht_noetig'}[g['laus']], 'seit': g.get('lausSeit'), 'geprueft_von': 'Sam' if g['laus'] == 'liegt' else None},
        'dokumente': doks,
        'erste_nacht': erste, 'letzte_nacht': HEUTE if bett else erste, 'naechte': g['naechte'],
        'loeschen_ab': None, 'aufnahme_hinweise_aus': [],
        '_meta': meta('gast/1', zeit(erste, '19:30:00'), 'Kim', True, 3)}
    if g['nachname'] == 'Mustermann':
        gast['letzte_nacht'] = '2026-09-14'; gast['loeschen_ab'] = '2027-09-14'
    for j, sk in enumerate(g['sanktionen']):
        schreib(f'{basis}/Ereignisse/' + ereignis_name(sk['datum'], '22:10:00', sk['von'], 'sanktion'), {
            'art': 'sanktion', 'gast_id': i, 'stufe': sk['stufe'], 'grund': sk['grund'], 'datum': sk['datum'], 'bis': sk.get('bis'), 'von': sk['von'],
            'bericht': f'Berichte/{sk["datum"][:7]}/{sk["datum"]}' if sk['stufe'] != 'Hausverbot' else None, 'absatz': 1 if sk['stufe'] != 'Hausverbot' else None,
            '_meta': meta('ereignis/1', zeit(sk['datum'], '22:10:00'), sk['von'], False)})
    for j, n in enumerate(g['notizen']):
        schreib(f'{basis}/Ereignisse/' + ereignis_name(n['datum'], f'21:{10 + j:02d}:00', n['von'], 'notiz'), {
            'art': 'notiz', 'gast_id': i, 'text': n['text'], 'datum': n['datum'], 'von': n['von'], 'rolle': 'betroffen', 'quelle': n.get('quelle', ''),
            'bericht': None, 'absatz': None, '_meta': meta('ereignis/1', zeit(n['datum'], f'21:{10 + j:02d}:00'), n['von'], False)})
    if k == 'g3':  # Max (D4) wird im Vorfall vom 29.09. nur erwähnt
        schreib(f'{basis}/Ereignisse/' + ereignis_name('2026-09-29', '22:10:00', 'Sam', 'notiz'), {
            'art': 'notiz', 'gast_id': i, 'text': 'Gelbe Karte für @Felix (D5): laute Musik nach 23 Uhr nach zwei Hinweisen. @Max (D4) war dabei.', 'datum': '2026-09-29', 'von': 'Sam', 'rolle': 'erwaehnt', 'quelle': 'aus Bericht vom 29.09. · erwähnt, keine Sanktion',
            'bericht': 'Berichte/2026-09/2026-09-29', 'absatz': 1, '_meta': meta('ereignis/1', zeit('2026-09-29', '22:10:00'), 'Sam', False)})
    schreib(f'{basis}/Gast.json', gast)
    gaeste_dateien[k] = i

# ---------- Belegung ----------
def belegung_eintrag(nr):
    v = S['betten'].get(nr, {'g': None, 's': 'frei'}); st = STATUS[d['status'][nr]]
    e = {'status': st, 'gast': GID[v['g']] if v.get('g') else None}
    if v.get('g'):
        g = S['G'][v['g']]; e['seit'] = g['erste']; e['dauerhaft'] = True; e['ende'] = None
    if v.get('bis'): e['bis'] = v['bis']
    if v.get('grund'): e['grund'] = v['grund']
    if v.get('n'): e['fehlt_naechte'] = v['n']
    if v.get('vorher'): e['fehlte_vornacht'] = True
    if nr in S['notbett'] and v.get('g'): e['belegt_durch'] = 'kaeltebus'
    e['geaendert_um'] = zeit(HEUTE, '12:00:00'); e['geaendert_von'] = 'Tageswechsel'
    if nr == 'D4': e['geaendert_um'] = zeit(HEUTE, '19:04:33'); e['geaendert_von'] = 'Kim'
    if nr == 'E1': e['geaendert_um'] = zeit(HEUTE, '20:10:45'); e['geaendert_von'] = 'Sam'
    return e
alle_nr = [b['nr'] for b in d['bh']] + [b['nr'] for b in d['bn']]
kz = d['kz']
schreib(f'Belegung/{HEUTE[:7]}/{HEUTE}.json', {
    'diensttag': HEUTE, 'betten': {nr: belegung_eintrag(nr) for nr in alle_nr},
    'kennzahlen': {'kht_nummer': kz['belegt'], 'frei': kz['frei'], 'gesamt': kz['gesamt'], 'notbetten_belegt': 1, 'st_nikolaus_belegt': kz['nikoBelegt'], 'ampel': kz['ampel'], 'stand': zeit(HEUTE, '20:10:45')},
    '_meta': meta('belegung/1', zeit(HEUTE, '20:10:45'), 'Sam', True, 37)})

# ---------- Duschplan mit Bad ----------
schreib(f'Duschplan/{HEUTE[:7]}/{HEUTE}.json', {
    'datum': HEUTE, 'slots': {z: {'gast': GID[x['g']], 'status': x['s'], 'geaendert_um': zeit(HEUTE, '19:31:02' if x['s'] == 'erledigt' else '17:40:00'), 'geaendert_von': 'Kim'} for z, x in S['dusche'][HEUTE].items()},
    'bad': {'zu': True, 'geaendert_um': zeit(HEUTE, '18:52:10'), 'geaendert_von': 'Kim'},
    '_meta': meta('duschplan/1', zeit(HEUTE, '19:31:02'), 'Kim', True, 6)})
schreib('Duschplan/2026-10/2026-10-01.json', {
    'datum': '2026-10-01', 'slots': {'19:00': {'gast': GID['g12'], 'status': 'erledigt', 'geaendert_um': zeit('2026-10-01', '19:28:00'), 'geaendert_von': 'Sam'}, '19:30': {'gast': GID['g2'], 'status': 'verpasst', 'geaendert_um': zeit('2026-10-01', '20:02:00'), 'geaendert_von': 'Sam'}},
    'bad': {'zu': False, 'aufgeschlossen_um': zeit('2026-10-01', '20:05:00'), 'geaendert_um': zeit('2026-10-01', '20:05:00'), 'geaendert_von': 'Sam'},
    '_meta': meta('duschplan/1', zeit('2026-10-01', '20:05:00'), 'Sam', True, 5)})

# ---------- Berichte ----------
def bericht(datum, besetzung, hinweise, vorfall='nein', status='abgeschlossen', kht='ja', ohne=None, fehlt=None, fehlt_text='', nachtraege=None, sanktionen=None, kz=None, zu_um='07:58:00', fragen='', sonstiges='', schluessel='nein', schluessel_nr=''):
    basis = f'Berichte/{datum[:7]}/{datum}'
    bes = []
    for rolle, name, unterschrieben in besetzung:
        e = {'rolle': rolle, 'person': name, 'geplant': name, 'grund': None, 'unterschrift': None, 'unterschrieben_um': None}
        if unterschrieben:
            pfad = f'Unterschriften/{ascii_name(rolle.replace(" ", "-"))}_{ascii_name(name)}.png'
            schreib(f'{basis}/{pfad}', png_unterschrift(len(name) * 3 + len(rolle)), True)
            e['unterschrift'] = pfad; e['unterschrieben_um'] = zeit(datum, '22:30:00') if unterschrieben is True else unterschrieben
        bes.append(e)
    import datetime
    folge = (datetime.date.fromisoformat(datum) + datetime.timedelta(days=1)).isoformat()
    b = {'diensttag': datum, 'status': status, 'begonnen_um': zeit(datum, '18:50:00'),
         'besetzung': bes,
         'felder': {'kht_angerufen': kht, 'hinweise': hinweise, 'fragen': fragen, 'abwesenheiten': [],
                    'externe_gaeste': [], 'vorfaelle': vorfall, 'schluessel_fehlt': schluessel, 'schluessel_nr': schluessel_nr,
                    'fehlt_etwas': fehlt or [], 'fehlt_etwas_text': fehlt_text, 'sonstiges': sonstiges},
         'zuordnung': sanktionen or [],
         'kennzahlen': kz, 'ohne_unterschrift': ohne or [],
         'abgeschlossen_um': zeit(folge, zu_um) if status == 'abgeschlossen' else None,
         'pdf': f'{datum}_Dienstbericht.pdf' if status == 'abgeschlossen' else None,
         '_meta': meta('bericht/1', zeit(folge if status == 'abgeschlossen' else datum, zu_um), besetzung[0][1], True, 23)}
    if status == 'abgeschlossen':
        schreib(f'{basis}/{datum}_Dienstbericht.pdf', pdf([f'Dienstbericht {datum}'] + (['OHNE UNTERSCHRIFT ABGESCHLOSSEN: ' + ', '.join(ohne)] if ohne else []) + [f'Besetzung: ' + ', '.join(x[1] for x in besetzung), f'Hat KHT angerufen? {kht}', 'Wichtige Hinweise: ' + hinweise[:70], f'Vorfaelle: {vorfall}']), True)
    for n in (nachtraege or []):
        schreib(f'{basis}/Nachtraege/{zname(n["datum"], n["uhr"])}_{ascii_name(n["von"])}.json', {'diensttag': datum, 'art': n['art'], 'text': n['text'], 'von': n['von'], 'um': zeit(n['datum'], n['uhr']), 'unterschrift': n.get('unterschrift'), '_meta': meta('nachtrag/1', zeit(n['datum'], n['uhr']), n['von'], False)})
    schreib(f'{basis}/Bericht.json', b)

bericht('2026-09-28', [('Betreuung 1', 'Kim', True), ('Betreuung 2', 'Sam', True), ('Küche', 'Mika', True)], 'Schlüssel 7 fehlt. @Max Mustermann wollte nachsehen, ob er ihn eingesteckt hat.', schluessel='ja', schluessel_nr='7', kz={'kht_nummer': 24, 'frei': 7, 'gesamt': 31, 'ampel': 'gruen', 'st_nikolaus_belegt': 7})
bericht('2026-09-29', [('Betreuung 1', 'Sam', True), ('Betreuung 2', 'Robin', True), ('Küche', 'Jule', True)], 'Gelbe Karte für @Felix (D5): laute Musik nach 23 Uhr nach zwei Hinweisen. @Max (D4) war dabei.', vorfall='ja',
        sanktionen=[{'absatz': 1, 'stufe': 'Gelbe Karte', 'gast': GID['g4'], 'erwaehnt': [GID['g4'], GID['g3']], 'ereignis': f'Gaeste/{GID["g4"]}/Ereignisse/2026-09-29T22-10-00_Sam_sanktion.json'}],
        kz={'kht_nummer': 25, 'frei': 6, 'gesamt': 31, 'ampel': 'gruen', 'st_nikolaus_belegt': 7})
bericht('2026-09-30', [('Betreuung 1', 'Kim', True), ('Betreuung 2', 'Chris', True), ('Küche', 'Mika', True)], 'Lukas (B3) ist nicht gekommen, fehlt unentschuldigt.', kht='nein', kz={'kht_nummer': 25, 'frei': 6, 'gesamt': 31, 'ampel': 'gruen', 'st_nikolaus_belegt': 7})
bericht('2026-10-01', [('Betreuung 1', 'Sam', True), ('Betreuung 2', 'Chris', zeit('2026-10-02', '18:55:00')), ('Küche', 'Jule', True)], 'Ruhige Nacht.', fehlt=['Toilettenpapier'], fehlt_text='Müllbeutel 120 l', ohne=['Chris'],
        fragen='@Tom (D2) fragt nach Arbeitsschuhen in Größe 44.',
        nachtraege=[{'datum': '2026-10-02', 'uhr': '18:55:00', 'von': 'Chris', 'art': 'unterschrift_nachgeholt', 'text': 'Unterschrift von Chris nachgeholt.', 'unterschrift': 'Unterschriften/Betreuung-2_Chris.png'}],
        kz={'kht_nummer': 24, 'frei': 7, 'gesamt': 31, 'ampel': 'gruen', 'st_nikolaus_belegt': 7})
bericht(HEUTE, [('Betreuung 1', 'Kim', False), ('Betreuung 2', 'Sam', False), ('Küche', 'Jule', False)], '', status='offen', kht=None, vorfall=None, kz=None, zu_um='21:00:00')

kb = 'Berichte/2026-10/2026-10-01'
schreib(f'{kb}/Kommentare/2026-10-02T10-05-00_Leitung.json', {'diensttag': '2026-10-01', 'art': 'antwort', 'text': 'Schuhe in Größe 44 liegen in der Kleiderkammer.', 'von': 'Leitung', 'um': zeit(HEUTE, '10:05:00'), 'gast': GID['g2'], 'bei_aufnahme': False,
    'hinweis': 'Hinweise/2026-10/2026-10-02T10-05-00_Leitung.json', 'notiz': f'Gaeste/{GID["g2"]}/Ereignisse/2026-10-02T10-05-00_Leitung_notiz.json', '_meta': meta('kommentar/1', zeit(HEUTE, '10:05:00'), 'Leitung', False)})
schreib('Hinweise/2026-10/2026-10-02T10-05-00_Leitung.json', {'text': 'Antwort: Schuhe in Größe 44 liegen in der Kleiderkammer.', 'von': 'Leitung', 'ab': HEUTE, 'bis': HEUTE, 'dauer': 'naechster_dienst', 'wichtig': False, 'quelle': 'archiv', 'bezug': kb, 'beendet_um': None, 'beendet_von': None, '_meta': meta('hinweis/1', zeit(HEUTE, '10:05:00'), 'Leitung', True, 1)})
schreib(f'Gaeste/{GID["g2"]}/Ereignisse/2026-10-02T10-05-00_Leitung_notiz.json', {'art': 'notiz', 'gast_id': GID['g2'], 'text': 'Schuhe in Größe 44 liegen in der Kleiderkammer.', 'datum': HEUTE, 'von': 'Leitung', 'rolle': 'betroffen', 'quelle': 'Antwort zu Bericht vom 01.10.', 'bericht': kb, 'absatz': None, 'bei_aufnahme': False, '_meta': meta('ereignis/1', zeit(HEUTE, '10:05:00'), 'Leitung', False)})
kb2 = 'Berichte/2026-09/2026-09-28'
schreib(f'{kb2}/Kommentare/2026-09-30T10-20-00_Leitung.json', {'diensttag': '2026-09-28', 'art': 'hinweis', 'text': 'Bei der nächsten Aufnahme nach Schlüssel 7 fragen.', 'von': 'Leitung', 'um': zeit('2026-09-30', '10:20:00'), 'gast': GID['g31'], 'bei_aufnahme': True,
    'hinweis': None, 'notiz': f'Gaeste/{GID["g31"]}/Ereignisse/2026-09-30T10-20-00_Leitung_notiz.json', '_meta': meta('kommentar/1', zeit('2026-09-30', '10:20:00'), 'Leitung', False)})
schreib(f'Gaeste/{GID["g31"]}/Ereignisse/2026-09-30T10-20-00_Leitung_notiz.json', {'art': 'notiz', 'gast_id': GID['g31'], 'text': 'Bei der nächsten Aufnahme nach Schlüssel 7 fragen.', 'datum': '2026-09-30', 'von': 'Leitung', 'rolle': 'betroffen', 'quelle': 'Wichtiger Hinweis zu Bericht vom 28.09.', 'bericht': kb2, 'absatz': None, 'bei_aufnahme': True, '_meta': meta('ereignis/1', zeit('2026-09-30', '10:20:00'), 'Leitung', False)})
schreib('Berichte/2026-10/Fehlt_erledigt.json', {'monat': '2026-10', 'erledigt': {'2026-10-01|Toilettenpapier': {'von': 'Leitung', 'um': zeit(HEUTE, '10:00:00')}}, '_meta': meta('fehlt_erledigt/1', zeit(HEUTE, '10:00:00'), 'Leitung', True, 1)})
# ---------- Hinweise ----------
hw_zeit = {'h1': ('2026-09-30', '10:15:00'), 'h2': ('2026-10-01', '23:40:00'), 'h3': (HEUTE, '20:15:00'), 'h0': ('2026-09-28', '09:00:00')}
for h in S['hinweise']:
    tag, uhr = hw_zeit[h['id']]
    ab = h.get('ab') or tag
    schreib(f'Hinweise/{tag[:7]}/{zname(tag, uhr)}_{ascii_name(h["von"])}.json', {
        'text': h['text'], 'von': h['von'], 'ab': ab, 'bis': h['bis'], 'dauer': {'1 Woche': '1_woche', '3 Tage': '3_tage'}.get(h.get('dauer'), 'datum'),
        'wichtig': h['wichtig'], 'quelle': 'nextcloud_eingang' if h['quelle'] == 'Nextcloud' else 'app', 'beendet_um': None, 'beendet_von': None,
        '_meta': meta('hinweis/1', zeit(tag, uhr), h['von'], True, 1)})
schreib('Hinweise/Eingang/LIESMICH.txt', 'Hier kann die Leitung vom PC aus Hinweise für die nächsten Dienste ablegen.\n\nEine Textdatei (.txt) je Hinweis. Die ersten Zeilen dürfen Angaben enthalten, dann eine Leerzeile, dann der Text:\n\n  bis: 2026-10-09        (oder: dauer: naechster Dienst | 3 Tage | 1 Woche | 2 Wochen)\n  ab: 2026-10-03         (freiwillig, sonst ab dem nächsten Dienst)\n  wichtig: ja            (freiwillig)\n\n  Ab morgen gibt es das Abendessen erst um 19:30.\n\nDie App übernimmt die Datei beim nächsten Abgleich als Hinweis „von Leitung“\nund verschiebt sie nach Eingang/Uebernommen/.\n')
schreib('Hinweise/Eingang/Uebernommen/2026-09-30_Heizung.txt', 'bis: 2026-10-05\nwichtig: ja\n\nHeizung im T-Zimmer ist defekt. Der Handwerker kommt Donnerstag, bis dahin den Heizlüfter nutzen.\n')

# ---------- Kalender ----------
def monate(dic):
    out = {}
    for t, v in dic.items(): out.setdefault(t[:7], {})[t] = v
    return out
for m, tage in sorted(monate(S['dienstplan']).items()):
    tg = {t: {'betreuung': [n or None for n in v], 'kueche': S['kueche'].get(t) or None} for t, v in sorted(tage.items())}
    if '2026-10-03' in tg: tg['2026-10-03']['betreuung'][1] = 'Chris'; tg['2026-10-03']['geaendert'] = ['Betreuung 2']
    schreib(f'Kalender/Dienstplan/{m}.json', {'monat': m, 'tage': tg, 'quelle': f'Kalender/Dienstplan-Eingang/Eingelesen/Dienstplan_{m}.pdf', '_meta': meta('dienstplan/1', zeit(f'{m}-01' if m != '2026-09' else '2026-08-28', '11:00:00'), 'Leitung', True, 4)})
for m in sorted(set(t[:7] for t in S['dienstplan'])):
    schreib(f'Kalender/Dienstplan-Eingang/Eingelesen/Dienstplan_{m}.pdf', pdf([f'Dienstplan {m}', 'Eingelesen von der App, Pruefung durch Leitung']), True)
schreib('Kalender/Dienstplan-Eingang/LIESMICH.txt', 'Dienstplan als PDF oder ICS hier ablegen. Die App fragt beim nächsten Abgleich „Neuer Dienstplan – einlesen?“,\nzeigt eine Prüftabelle und legt danach Kalender/Dienstplan/JJJJ-MM.json an. Die Datei wandert nach Eingelesen/.\nKein Import aus WhatsApp.\n')
for m, ts in sorted(monate({t['datum'] + f'#{i}': t for i, t in enumerate(S['termine'])}).items()):
    schreib(f'Kalender/Termine/{m}.json', {'monat': m, 'termine': [dict({'id': f't-{m}-{i+1:02d}', 'datum': t['datum'] if t['titel'] != 'Lieferung Decken' else '2026-10-04', 'art': t['art'], 'titel': t['titel'], 'symbol': t['sym'], 'von': 'Leitung'}, **({'geaendert': {'von': 'Kim', 'um': zeit(HEUTE, '14:25:00'), 'vorher': {'datum': t['datum'], 'titel': t['titel']}}} if t['titel'] == 'Lieferung Decken' else {})) for i, (k, t) in enumerate(sorted(ts.items()))], '_meta': meta('termine/1', zeit('2026-09-30', '16:00:00'), 'Leitung', True, 2)})

morgen = '2026-10-03'
alt_b2 = (S['dienstplan'].get(morgen) or ['', ''])[1] or None
schreib(f'Kalender/Aenderungen/{morgen[:7]}/2026-10-02T14-20-00_Leitung.json', {'datum': morgen, 'art': 'dienst', 'rolle': 'Betreuung 2', 'alt': alt_b2, 'neu': 'Chris', 'von': 'Leitung', 'grund': 'Tausch', 'notiz': 'getauscht mit 14.10.', 'um': zeit(HEUTE, '14:20:00'), '_meta': meta('planaenderung/1', zeit(HEUTE, '14:20:00'), 'Leitung', False)})
schreib(f'Kalender/Aenderungen/{morgen[:7]}/2026-10-02T14-25-00_Kim.json', {'datum': '2026-10-04', 'art': 'termin', 'rolle': None, 'termin_id': 't-2026-10-02', 'alt': 'Lieferung Decken · 03.10.', 'neu': 'Lieferung Decken · 04.10.', 'von': 'Kim', 'grund': 'Sonstiges', 'notiz': 'Lieferant kommt einen Tag später', 'um': zeit(HEUTE, '14:25:00'), '_meta': meta('planaenderung/1', zeit(HEUTE, '14:25:00'), 'Kim', False)})
# ---------- Monatsabschluss September ----------
M = '2026-09'
plan0 = {t: v for t, v in S['plan0'].items() if t.startswith(M)}
schreib(f'Monatsabschluss/{M}/Plan0.json', {'monat': M, 'eingefroren_um': zeit('2026-09-01', '09:10:00'), 'eingelesen_von': 'Leitung', 'quelle': f'Kalender/Dienstplan-Eingang/Eingelesen/Dienstplan_{M}.pdf', 'korrekturen': [{'datum': '2026-09-05', 'rolle': 'Betreuung 2', 'erkannt': 'Sam', 'gewaehlt': 'Jule'}], 'tage': {t: {'betreuung': [n or None for n in v['nacht']], 'kueche': v['kueche'] or None} for t, v in sorted(plan0.items())}, '_meta': meta('plan0/1', zeit('2026-09-01', '00:00:05'), 'App', False)})
schreib(f'Monatsabschluss/{M}/Plankorrekturen/2026-09-30T09-12-00_Kim_Sam-Betreuung.json', {
    'monat': M, 'person': 'Sam', 'bereich': 'betreuung', 'tage_hinzu': ['2026-09-27'], 'tage_weg': [], 'grund': 'Plan falsch übernommen', 'von': 'Kim', 'um': zeit('2026-09-30', '09:12:00'),
    'warnung_bestaetigt': True, '_meta': meta('plankorrektur/1', zeit('2026-09-30', '09:12:00'), 'Kim', False)})
lohn = {'betreuung': [], 'kueche': []}
for person, bereich, uhr in (('Robin', 'betreuung', '22:41:00'), ('Jule', 'kueche', '19:05:00'), ('Jule', 'betreuung', '19:06:00')):
    nw = d['nw'][f'{person},{bereich}']; ordner = 'Betreuung' if bereich == 'betreuung' else 'Kueche'
    stamm = f'{M}_Dienstnachweis_{ordner}_{person}'
    um = zeit('2026-09-29', uhr)
    schreib(f'Monatsabschluss/{M}/{ordner}/{stamm}.png', png_unterschrift(len(person) + len(bereich)), True)
    schreib(f'Monatsabschluss/{M}/{ordner}/{stamm}.pdf', pdf([f'Dienstnachweis {ordner} September 2026', f'Person: {person}', 'Geplant {geplant} - Gemacht {gemacht} - Abgegeben {abgegeben} - Vertretung {vertretung}'.format(**nw['sum']), 'Nach der Unterschrift nicht mehr aenderbar']), True)
    schreib(f'Monatsabschluss/{M}/{ordner}/{stamm}.json', {
        'monat': M, 'person': person, 'bereich': bereich, 'summen': nw['sum'],
        'tage': [{'datum': z['datum'], 'geplant': z['geplant'], 'gemacht': z['gemacht'], 'rolle': z.get('rolle'), 'bemerkung': z.get('text') or None} for z in nw['zeilen']],
        'plankorrekturen': [], 'unterschrift': f'{stamm}.png', 'unterschrieben_um': um, 'pdf': f'{stamm}.pdf',
        '_meta': meta('dienstnachweis/1', um, person, False)})
    lohn[bereich].append([person, next((f'P-{100 + i}' for i, n in enumerate(d['team']) if n == person), ''), 'Betreuung' if bereich == 'betreuung' else 'Küche', M, nw['sum']['geplant'], nw['sum']['gemacht'], nw['sum']['abgegeben'], nw['sum']['vertretung'], um[:16].replace('T', ' '), f'{ordner}/{stamm}.pdf'])
KOPF = ['Person', 'Personalnummer', 'Bereich', 'Monat', 'Geplant', 'Gemacht', 'Abgegeben', 'Vertretung', 'Unterschrieben', 'PDF']
for bereich, zeilen in lohn.items():
    ordner = 'Betreuung' if bereich == 'betreuung' else 'Kueche'
    schreib(f'Monatsabschluss/{M}/Lohnabrechnung_{M}_{ordner}.csv', '﻿' + ';'.join(KOPF) + '\r\n' + ''.join(';'.join(str(x) for x in z) + '\r\n' for z in sorted(zeilen)))
schreib(f'Monatsabschluss/{HEUTE[:7]}/Plan0.json', {'monat': HEUTE[:7], 'eingefroren_um': zeit(HEUTE[:7] + '-01', '09:30:00'), 'eingelesen_von': 'Leitung', 'quelle': f'Kalender/Dienstplan-Eingang/Eingelesen/Dienstplan_{HEUTE[:7]}.pdf', 'korrekturen': [{'datum': HEUTE[:7] + '-12', 'rolle': 'Küche', 'erkannt': None, 'gewaehlt': 'Mika'}, {'datum': HEUTE[:7] + '-20', 'rolle': 'Betreuung 1', 'erkannt': 'Kim', 'gewaehlt': 'Robin'}], 'tage': {t: {'betreuung': [n or None for n in v['nacht']], 'kueche': v['kueche'] or None} for t, v in sorted(S['plan0'].items()) if t.startswith(HEUTE[:7])} or {t: {'betreuung': [n or None for n in v], 'kueche': S['kueche'].get(t) or None} for t, v in sorted(S['dienstplan'].items()) if t.startswith(HEUTE[:7])}, '_meta': meta('plan0/1', zeit(HEUTE[:7] + '-01', '00:00:05'), 'App', False)})

# ---------- Auswertung ----------
schreib(f'Auswertung/Belegung_{HEUTE[:7]}.csv', '﻿Datum;KHT-Nummer;Frei;Gesamt;Notbetten belegt;St. Nikolaus belegt;Ampel;Hat KHT angerufen\r\n2026-10-01;24;7;31;0;7;gruen;ja\r\n')
schreib('Auswertung/Belegung_2026-09.csv', '﻿Datum;KHT-Nummer;Frei;Gesamt;Notbetten belegt;St. Nikolaus belegt;Ampel;Hat KHT angerufen\r\n2026-09-28;24;7;31;0;7;gruen;ja\r\n2026-09-29;25;6;31;0;7;gruen;ja\r\n2026-09-30;25;6;31;0;7;gruen;nein\r\n')

print('Beispielinhalt geschrieben:', sum(len(f) for _, _, f in os.walk(ROOT)), 'Dateien')

schreib('LIESMICH.md', '''# Notübernachtung – Ordner der App

Diesen Ordner schreibt die Tablet-App. Bitte nichts umbenennen, verschieben oder bearbeiten –
außer in den beiden Eingangs-Ordnern:

| Wo | Was du hier tun kannst |
| --- | --- |
| `Hinweise/Eingang/` | Hinweis für die nächsten Dienste als .txt ablegen (Aufbau steht in LIESMICH.txt) |
| `Kalender/Dienstplan-Eingang/` | Dienstplan als PDF, ICS oder Foto ablegen; einlesen und prüfen in der App unter Einstellungen › Dienstplan einlesen |

Zum Lesen und Weitergeben:

| Wo | Was |
| --- | --- |
| `Berichte/JJJJ-MM/JJJJ-MM-TT/` | Dienstbericht als PDF, Ergänzungen, Kommentare |
| `Monatsabschluss/JJJJ-MM/` | Dienstnachweise je Person (Betreuung und Küche getrennt) und die Lohnabrechnung als CSV |
| `Auswertung/` | Belegung je Nacht (KHT-Nummer, freie Betten) als CSV |
| `Gaeste/<ID>/Dokumente/` | Aufnahme-PDF, Läuseschein und weitere Dokumente eines Gastes |

Alles mit Gästedaten fällt unter den Datenschutz: nicht herunterladen, nicht weiterleiten,
außer über die App („Teilen“).
''')
print('LIESMICH geschrieben')
