# Erzeugt dateisystem/schema/*.schema.json (JSON Schema 2020-12)
import json, os
ZIEL = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'schema')
BASIS = 'https://schema.notuebernachtung.invalid/'
os.makedirs(ZIEL, exist_ok=True)

G = 'gemeinsam.schema.json#/$defs/'
def ref(n): return {'$ref': G + n}
def obj(props, req=None, extra=False, **kw):
    o = {'type': 'object', 'properties': props, 'required': req if req is not None else list(props), 'additionalProperties': extra}
    o.update(kw); return o
def arr(items, **kw): return dict({'type': 'array', 'items': items}, **kw)
def null(x): return {'anyOf': [x, {'type': 'null'}]}
S = {'type': 'string'}; B = {'type': 'boolean'}; I = {'type': 'integer', 'minimum': 0}
def enum(*w): return {'enum': list(w)}
def opt(o, *namen):
    o['required'] = [r for r in o['required'] if r not in namen]; return o

def schreib(name, titel, beschreibung, schema):
    s = {'$schema': 'https://json-schema.org/draft/2020-12/schema', '$id': BASIS + name + '.schema.json', 'title': titel, 'description': beschreibung}
    s.update(schema)
    open(os.path.join(ZIEL, name + '.schema.json'), 'w').write(json.dumps(s, ensure_ascii=False, indent=2) + '\n')

schreib('gemeinsam', 'Gemeinsame Bausteine', 'Datentypen, die mehrere Dateiarten nutzen.', {'$defs': {
    'datum': {'type': 'string', 'pattern': r'^\d{4}-\d{2}-\d{2}$', 'description': 'Kalendertag JJJJ-MM-TT. Der Diensttag ist der Tag, an dem der Dienst abends beginnt; Wechsel um 12:00.'},
    'monat': {'type': 'string', 'pattern': r'^\d{4}-\d{2}$'},
    'uhrzeit': {'type': 'string', 'pattern': r'^\d{2}:\d{2}$'},
    'zeitpunkt': {'type': 'string', 'pattern': r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$', 'description': 'ISO 8601 mit Zeitzone (Europe/Berlin).'},
    'gast_id': {'type': 'string', 'pattern': r'^g-[a-z2-7]{8}$', 'description': 'Feste Gast-ID, auch Ordnername unter Gaeste/. Nie aus Namen gebildet.'},
    'bettnr': {'type': 'string', 'pattern': r'^[A-Za-z0-9ÄÖÜäöüß. -]{1,24}$', 'description': 'Angezeigte Bettnummer (D4, L5, N9, frei benannte Plätze).'},
    'person': {'type': 'string', 'minLength': 1, 'description': 'Vorname aus Team.json oder „Leitung“, bei Automatik „App“ oder „Tageswechsel“.'},
    'relpfad': {'type': 'string', 'pattern': r'^[A-Za-z0-9._/-]+$', 'description': 'Pfad relativ zum Ordner der Datei bzw. zum Wurzelordner; nur ASCII, keine Leerzeichen.'},
    'standort': enum('st-pius', 'st-nikolaus'),
    'bereich': enum('betreuung', 'kueche'),
    'bettstatus': enum('frei', 'erwartet', 'anwesend', 'fehlt', 'fehlt_ab_2', 'freigehalten', 'frei_bis', 'gesperrt'),
    'meta_aenderbar': obj({'schema': S, 'version': {'type': 'integer', 'minimum': 1}, 'geaendert_um': ref('zeitpunkt'), 'geaendert_von': ref('person'), 'geraet': S},
                          description='Änderbare Datei: jede Änderung erhöht version. Hochladen nur mit If-Match auf das zuletzt gesehene ETag.'),
    'meta_unveraenderlich': obj({'schema': S, 'angelegt_um': ref('zeitpunkt'), 'angelegt_von': ref('person'), 'geraet': S, 'unveraenderlich': {'const': True}},
                                description='Wird nur einmal angelegt (If-None-Match: *), danach nie geändert oder überschrieben.'),
    'kennzahlen': obj({'kht_nummer': I, 'frei': I, 'gesamt': I, 'notbetten_belegt': I, 'st_nikolaus_belegt': I, 'ampel': enum('gruen', 'gelb', 'rot'), 'stand': ref('zeitpunkt')},
                      req=['kht_nummer', 'frei', 'gesamt', 'ampel'], description='KHT-Nummer = belegte Betten (Notbett nur wenn belegt). Frei = Betten in Betrieb ohne freie Notbetten minus belegt.'),
}})

schreib('version', 'Schema-Version', '_app/version.json', obj({'schema_version': I, 'mindest_app_version': S, 'ordner_angelegt': ref('zeitpunkt'), 'hinweis': S}))
schreib('geraet', 'Gerät', '_app/Geraete/<geraet>.json – jedes Tablet schreibt nur seine eigene Datei.', obj({'id': {'type': 'string', 'pattern': r'^[a-z0-9-]+$'}, 'name': S, 'nextcloud_benutzer': S, 'app_version': S, 'letzter_abgleich': ref('zeitpunkt'), 'offene_aenderungen': I, '_meta': ref('meta_aenderbar')}))
schreib('protokoll', 'Protokollzeile', '_app/Protokoll/JJJJ-MM/JJJJ-MM-TT_<geraet>.jsonl – eine Zeile je Änderung, nur anhängen. Gäste nur als ID, nie mit Namen.',
        opt(obj({'um': ref('zeitpunkt'), 'von': ref('person'), 'art': {'type': 'string', 'pattern': r'^[a-z]+\.[a-z_]+$'}, 'ziel': S, 'gast': ref('gast_id'), 'alt': S, 'neu': S, 'zusatz': S, 'anzahl': I}), 'gast', 'alt', 'neu', 'zusatz', 'anzahl'))

bett = opt(obj({'nr': ref('bettnr'), 'platz': S, 'art': enum('bett', 'stockbett', 'zusatz'), 'stockbett': S, 'lage': enum('oben', 'unten'), 'notbett': B, 'gesperrt': B, 'ort': S, 'bezeichnung': S},
               description='platz = gezeichneter Platz im Grundriss; Nummerntausch ändert nur platz.'), 'stockbett', 'lage', 'ort', 'bezeichnung')
zimmer = opt(obj({'id': S, 'name': S, 'gesperrt': B, 'betten': arr(bett), 'zugang_ueber': S, 'abschaltbar': B, 'tuer': S, 'frei_benennbar': B}), 'zugang_ueber', 'abschaltbar', 'tuer', 'frei_benennbar')
raum = opt(obj({'id': S, 'name': S, 'art': enum('bad', 'flur'), 'tuer': S, 'gesperrt_wenn_alle_aus': arr(S)}), 'gesperrt_wenn_alle_aus')
schreib('haus', 'Haus', 'Einstellungen/Haus.json – Standorte, Zimmer, Betten, Notbetten, Sperren, Nummerntausch, zusätzliche Plätze. Ändern nur in den Einstellungen (Admin-PIN).',
        obj({'standorte': arr(obj({'id': ref('standort'), 'name': S, 'grundriss': ref('relpfad'), 'zimmer': arr(zimmer), 'raeume': arr(raum)}), minItems=2, maxItems=2), '_meta': ref('meta_aenderbar')}))
rect = arr({'type': 'number'}, minItems=4, maxItems=4)
schreib('grundriss', 'Grundriss', 'Einstellungen/Grundriss_<Standort>.json – Geometrie in Grundriss-Einheiten, nicht im Code.',
        obj({'standort': ref('standort'), 'einheiten': S, 'viewbox': rect, 'boeden': {'type': 'object', 'additionalProperties': rect},
             'privat': arr({'anyOf': [rect, obj({'pfad': S})]}), 'waende': arr(S),
             'tueren': arr(opt(obj({'id': S, 'angel': arr({'type': 'number'}, minItems=2, maxItems=2), 'offen_bis': arr({'type': 'number'}, minItems=2, maxItems=2), 'winkel_zu': null({'type': 'number'}), 'hinweis': S}), 'hinweis'),
                           description='Türblatt dreht beim Schließen um winkel_zu Grad um die Angel (animiert, 700 ms). Schließt bei gesperrtem Zimmer und beim abgeschlossenen Bad.'),
             'bad': null(rect), 'labels': {'type': 'object', 'additionalProperties': arr({'type': 'number'}, minItems=2, maxItems=2)},
             'stockbetten': arr(obj({'oben': S, 'unten': S, 'rahmen': rect})), 'plaetze': {'type': 'object', 'additionalProperties': rect},
             'notizen': arr(obj({'text': S, 'pos': arr({'type': 'number'}, minItems=2, maxItems=2)})), 'rechts_daneben': arr(S), '_meta': ref('meta_aenderbar')}))
schreib('einstellungen', 'Einstellungen', 'Einstellungen/App.json – für alle Geräte gleich. Gerätesachen (Nachtmodus, PINs, Kiosk, Nextcloud-Zugang) liegen nur auf dem Gerät.',
        obj({'ampel': obj({'gruen_ab_freien_betten': I, 'gelb_ab_freien_betten': I}), 'tageswechsel': ref('uhrzeit'), 'dienst': obj({'beginn': ref('uhrzeit'), 'ende': ref('uhrzeit')}),
             'duschplan': obj({'slots': arr(ref('uhrzeit')), 'slot_minuten': I, 'vorlauf_tage': {'type': 'integer', 'minimum': 0, 'maximum': 3}, 'bad_abschliessen_bis_alle_geduscht': B}),
             'fehlt_etwas': arr(S), 'hinweise': obj({'dauern': arr(enum('naechster_dienst', '3_tage', '1_woche', '2_wochen', 'datum')), 'standard': S, 'standard_von_im_archiv': S}),
             'besetzung': obj({'rollen': arr(S), 'gruende_abweichung': arr(enum('Tausch', 'Sonstiges'))}), 'sprachen': arr({'type': 'string', 'pattern': '^[a-z]{2}$'}),
             'saison': obj({'name': S, 'beginn': ref('datum'), 'ende': ref('datum'), 'aufnahme_praefix': S, 'naechste_aufnahmenummer': I}),
             'loeschfristen': obj({'vorschlag_vom_traeger_festzulegen': B, 'gaeste_monate_nach_letzter_nacht': I, 'hausverbot_monate_nach_ende': I, 'berichte_monate': I, 'belegung_und_duschplan_monate': I, 'hinweise_monate': I, 'protokoll_monate': I, 'monatsabschluss': S}),
             '_meta': ref('meta_aenderbar')}))
schreib('team', 'Team', 'Einstellungen/Team.json – Personen mit Bereich (Betreuung, Küche oder beides) für Besetzung und Monatsabschluss.',
        obj({'personen': arr(obj({'name': S, 'bereiche': arr(ref('bereich'), minItems=1), 'personalnummer': S, 'aktiv': B})), 'leitung': obj({'name': S, 'anzeige': S, 'darf': arr(S)}), '_meta': ref('meta_aenderbar')}))

unterschrift = obj({'unterschrieben_am': null(ref('datum')), 'version': null(S)})
schreib('gast', 'Gast', 'Gaeste/<gast_id>/Gast.json – Stammdaten, Aufnahmen, Unterschriften-Stand, Läuseschein, Dokumentliste. Anzeigename wird nie gespeichert.',
        obj({'id': ref('gast_id'), 'vorname': {'type': 'string', 'minLength': 1}, 'nachname': S, 'spitzname': S, 'standort': ref('standort'),
             'aufnahmen': arr(obj({'nr': {'type': 'string', 'pattern': r'^\d{4}-\d{2}-\d{4}$'}, 'datum': ref('datum'), 'bett': null(ref('bettnr')), 'von': ref('person'), 'dauer': enum('eine_nacht', 'mehrere'), 'ende': null(ref('datum')), 'pdf': null(ref('relpfad'))}), minItems=1),
             'hausordnung': obj({'unterschrieben_am': null(ref('datum')), 'version': null(S), 'art': null(enum('app', 'papier')), 'uebersetzung': null({'type': 'string', 'pattern': '^[a-z]{2}$'})}),
             'datenschutz': unterschrift, 'sprache': {'type': 'string', 'pattern': '^[a-z]{2}$'},
             'laeuseschein': null(obj({'status': enum('liegt_vor', 'fehlt', 'nicht_noetig'), 'seit': null(ref('datum')), 'geprueft_von': null(ref('person'))})),
             'dokumente': arr(obj({'datei': ref('relpfad'), 'art': enum('aufnahme', 'laeuseschein', 'hausordnung_papier', 'sonstiges'), 'titel': S, 'am': ref('datum'), 'von': ref('person')})),
             'erste_nacht': ref('datum'), 'letzte_nacht': ref('datum'), 'naechte': I, 'loeschen_ab': null(ref('datum')),
             'aufnahme_hinweise_aus': arr(ref('relpfad'), description='Ereignis-Dateien, deren Hinweis bei der Wiederaufnahme nicht mehr aufploppen soll („Nicht mehr zeigen“).'), '_meta': ref('meta_aenderbar')}))
schreib('ereignis', 'Ereignis zum Gast', 'Gaeste/<gast_id>/Ereignisse/<zeit>_<von>_<art>.json – Sanktion oder Notiz, unveränderlich. Eine Sanktion gilt immer für genau einen Gast.',
        {'oneOf': [
            obj({'art': {'const': 'sanktion'}, 'gast_id': ref('gast_id'), 'stufe': enum('Verwarnung', 'Gelbe Karte', 'Rote Karte', 'Hausverbot'), 'grund': {'type': 'string', 'minLength': 1}, 'datum': ref('datum'), 'bis': null(ref('datum')), 'von': ref('person'), 'bericht': null(ref('relpfad')), 'absatz': null(I), '_meta': ref('meta_unveraenderlich')}),
            opt(obj({'art': {'const': 'notiz'}, 'gast_id': ref('gast_id'), 'text': S, 'datum': ref('datum'), 'von': ref('person'), 'rolle': enum('betroffen', 'erwaehnt'), 'quelle': S, 'bericht': null(ref('relpfad')), 'absatz': null(I), 'bei_aufnahme': dict(B, description='Ploppt bei der Wiederaufnahme des Gastes auf.'), '_meta': ref('meta_unveraenderlich')}), 'bei_aufnahme')]})
beleg = opt(obj({'status': ref('bettstatus'), 'gast': null(ref('gast_id')), 'seit': ref('datum'), 'dauerhaft': B, 'ende': null(ref('datum')), 'bis': ref('datum'), 'grund': S, 'fehlt_naechte': I, 'fehlte_vornacht': B, 'belegt_durch': enum('aufnahme', 'kaeltebus'), 'geaendert_um': ref('zeitpunkt'), 'geaendert_von': ref('person')}),
            'seit', 'dauerhaft', 'ende', 'bis', 'grund', 'fehlt_naechte', 'fehlte_vornacht', 'belegt_durch')
schreib('belegung', 'Belegung eines Diensttags', 'Belegung/JJJJ-MM/JJJJ-MM-TT.json – Stand jedes Betts. Entsteht beim Tageswechsel aus dem Vortag; Abgleich je Bett (neueres geaendert_um gewinnt).',
        obj({'diensttag': ref('datum'), 'betten': {'type': 'object', 'additionalProperties': beleg}, 'kennzahlen': ref('kennzahlen'), '_meta': ref('meta_aenderbar')}))
slot = obj({'gast': ref('gast_id'), 'status': enum('geplant', 'erledigt', 'verpasst'), 'geaendert_um': ref('zeitpunkt'), 'geaendert_von': ref('person')})
schreib('duschplan', 'Duschplan eines Tages mit Bad', 'Duschplan/JJJJ-MM/JJJJ-MM-TT.json – Slots und ob das Bad abgeschlossen ist. Bad zu bis alle geplanten Duschen erledigt sind; danach Erinnerung „Bad aufschließen“.',
        obj({'datum': ref('datum'), 'slots': {'type': 'object', 'propertyNames': {'pattern': r'^\d{2}:\d{2}$'}, 'additionalProperties': slot},
             'bad': opt(obj({'zu': B, 'aufgeschlossen_um': ref('zeitpunkt'), 'geaendert_um': ref('zeitpunkt'), 'geaendert_von': ref('person')}), 'aufgeschlossen_um'), '_meta': ref('meta_aenderbar')}))
bes = obj({'rolle': S, 'person': S, 'geplant': S, 'grund': null(enum('Tausch', 'Sonstiges')), 'unterschrift': null(ref('relpfad')), 'unterschrieben_um': null(ref('zeitpunkt'))})
jn = null(enum('ja', 'nein'))
schreib('bericht', 'Dienstbericht', 'Berichte/JJJJ-MM/JJJJ-MM-TT/Bericht.json – änderbar solange status = offen; nach dem Abschließen unveränderlich, Ergänzungen nur als Nachtrag. Felder in der Reihenfolge des Berichts.',
        obj({'diensttag': ref('datum'), 'status': enum('offen', 'abgeschlossen'), 'begonnen_um': ref('zeitpunkt'), 'besetzung': arr(bes, minItems=1),
             'felder': obj({'kht_angerufen': jn, 'hinweise': S, 'fragen': S, 'abwesenheiten': arr(S), 'externe_gaeste': arr(S), 'vorfaelle': jn, 'schluessel_fehlt': jn, 'schluessel_nr': S, 'fehlt_etwas': arr(S), 'fehlt_etwas_text': S, 'sonstiges': S}),
             'zuordnung': arr(obj({'absatz': I, 'stufe': S, 'gast': null(ref('gast_id')), 'erwaehnt': arr(ref('gast_id')), 'ereignis': null(ref('relpfad'))})),
             'kennzahlen': null(ref('kennzahlen')), 'ohne_unterschrift': arr(S, description='Personen, die beim Abschließen nicht unterschrieben hatten. Steht als Stempel im PDF.'),
             'abgeschlossen_um': null(ref('zeitpunkt')), 'pdf': null(ref('relpfad')), '_meta': ref('meta_aenderbar')}))
schreib('nachtrag', 'Nachtrag zum Bericht', 'Berichte/…/Nachtraege/<zeit>_<von>.json – unveränderlich; auch „Unterschrift nachgeholt“.',
        obj({'diensttag': ref('datum'), 'art': enum('text', 'unterschrift_nachgeholt'), 'text': S, 'von': ref('person'), 'um': ref('zeitpunkt'), 'unterschrift': null(ref('relpfad')), '_meta': ref('meta_unveraenderlich')}))
schreib('hinweis', 'Hinweis für die nächsten Dienste', 'Hinweise/JJJJ-MM/<zeit>_<von>.json – sichtbar im Bericht von ab bis bis (je einschließlich), bis beendet. Nur beendet_* darf sich später ändern.',
        opt(obj({'text': {'type': 'string', 'minLength': 1}, 'von': ref('person'), 'ab': ref('datum'), 'bis': ref('datum'), 'dauer': enum('naechster_dienst', '3_tage', '1_woche', '2_wochen', 'datum'), 'wichtig': B,
             'quelle': enum('app', 'nextcloud_eingang', 'archiv'), 'bezug': dict(ref('relpfad'), description='Bericht-Ordner, zu dem der Hinweis aus dem Archiv gehört.'), 'beendet_um': null(ref('zeitpunkt')), 'beendet_von': null(ref('person')), '_meta': ref('meta_aenderbar')}), 'bezug'))
tagplan = obj({'betreuung': arr(null(S), minItems=2, maxItems=2), 'kueche': null(S)})
tagplan_akt = opt(obj({'betreuung': arr(null(S), minItems=2, maxItems=2), 'kueche': null(S), 'geaendert': arr(enum('Betreuung 1', 'Betreuung 2', 'Küche'), description='Rollen, die vom Originalplan abweichen; Einzelheiten unter Kalender/Aenderungen/.')}), 'geaendert')
schreib('dienstplan', 'Dienstplan eines Monats', 'Kalender/Dienstplan/JJJJ-MM.json – aktueller Plan (Betreuung 1 und 2, Küche).',
        obj({'monat': ref('monat'), 'tage': {'type': 'object', 'propertyNames': {'pattern': r'^\d{4}-\d{2}-\d{2}$'}, 'additionalProperties': tagplan_akt}, 'quelle': null(ref('relpfad')), '_meta': ref('meta_aenderbar')}))
schreib('termine', 'Termine eines Monats', 'Kalender/Termine/JJJJ-MM.json – Aufgabe, Bettwäsche, Sondertermin, Feiertag. Abgleich je Termin-ID.',
        obj({'monat': ref('monat'), 'termine': arr(opt(obj({'id': S, 'datum': ref('datum'), 'art': enum('Aufgabe', 'Bettwäsche', 'Sondertermin', 'Feiertag'), 'titel': S, 'symbol': S, 'von': ref('person'),
                                                        'geaendert': obj({'von': ref('person'), 'um': ref('zeitpunkt'), 'vorher': obj({'datum': ref('datum'), 'titel': S})})}, description='Bettwäsche erscheint am Tag als wichtiger Hinweis im Bericht.'), 'geaendert')), '_meta': ref('meta_aenderbar')}))
schreib('plan0', 'Originalplan', 'Monatsabschluss/JJJJ-MM/Plan0.json – entsteht einmal zu Monatsbeginn in Einstellungen › Dienstplan einlesen (Leitung, PIN): jeder Dienst einzeln mit Foto/Datei geprüft. Unveränderlich; Korrekturen nur als Plankorrektur.',
        obj({'monat': ref('monat'), 'eingefroren_um': ref('zeitpunkt'), 'eingelesen_von': ref('person'), 'quelle': ref('relpfad'),
             'korrekturen': arr(obj({'datum': ref('datum'), 'rolle': enum('Betreuung 1', 'Betreuung 2', 'Küche'), 'erkannt': null(S), 'gewaehlt': null(S)}), description='Stellen, an denen die Prüfung von der Erkennung abwich.'),
             'tage': {'type': 'object', 'additionalProperties': tagplan}, '_meta': ref('meta_unveraenderlich')}))
schreib('planaenderung', 'Änderung im Kalender', 'Kalender/Aenderungen/JJJJ-MM/<zeit>_<von>.json – jede Änderung eines Dienstes oder Termins nach PIN, mit Pflichtangabe, wer geändert hat. Unveränderlich; der Kalender markiert die Stelle.',
        opt(obj({'datum': ref('datum'), 'art': enum('dienst', 'termin'), 'rolle': null(enum('Betreuung 1', 'Betreuung 2', 'Küche')), 'termin_id': S, 'alt': null(S), 'neu': null(S), 'von': ref('person'), 'grund': enum('Tausch', 'Sonstiges'), 'notiz': S, 'um': ref('zeitpunkt'), '_meta': ref('meta_unveraenderlich')}), 'termin_id'))
schreib('kommentar', 'Kommentar zu einem Bericht', 'Berichte/…/Kommentare/<zeit>_<von>.json – aus dem Archiv: Kommentar, Antwort auf eine Frage oder wichtiger Hinweis. Kann einen Hinweis für die nächsten Dienste und eine Notiz beim Gast erzeugen.',
        obj({'diensttag': ref('datum'), 'art': enum('kommentar', 'antwort', 'hinweis'), 'text': {'type': 'string', 'minLength': 1}, 'von': ref('person'), 'um': ref('zeitpunkt'), 'gast': null(ref('gast_id')), 'bei_aufnahme': B,
             'hinweis': null(ref('relpfad')), 'notiz': null(ref('relpfad')), '_meta': ref('meta_unveraenderlich')}))
schreib('fehlt_erledigt', 'Fehlt etwas – erledigt', 'Berichte/JJJJ-MM/Fehlt_erledigt.json – abgehakte Punkte aus „Fehlt etwas“, Schlüssel „Diensttag|Eintrag“. Abgleich als Vereinigung.',
        obj({'monat': ref('monat'), 'erledigt': {'type': 'object', 'propertyNames': {'pattern': r'^\d{4}-\d{2}-\d{2}\|.+$'}, 'additionalProperties': obj({'von': ref('person'), 'um': ref('zeitpunkt')})}, '_meta': ref('meta_aenderbar')}))
schreib('plankorrektur', 'Plankorrektur', 'Monatsabschluss/JJJJ-MM/Plankorrekturen/<zeit>_<von>_<person>-<bereich>.json – nur vor der Unterschrift der Person, mit bestätigter Warnung.',
        obj({'monat': ref('monat'), 'person': S, 'bereich': ref('bereich'), 'tage_hinzu': arr(ref('datum')), 'tage_weg': arr(ref('datum')), 'grund': {'type': 'string', 'minLength': 1}, 'von': ref('person'), 'um': ref('zeitpunkt'), 'warnung_bestaetigt': {'const': True}, '_meta': ref('meta_unveraenderlich')}))
summen = obj({'geplant': I, 'gemacht': I, 'abgegeben': I, 'vertretung': I})
schreib('dienstnachweis', 'Dienstnachweis', 'Monatsabschluss/JJJJ-MM/<Betreuung|Kueche>/JJJJ-MM_Dienstnachweis_<Bereich>_<Person>.json – je Person und Bereich, unveränderlich nach der Unterschrift. Kein „krank“.',
        obj({'monat': ref('monat'), 'person': S, 'bereich': ref('bereich'), 'summen': summen,
             'tage': arr(obj({'datum': ref('datum'), 'geplant': B, 'gemacht': B, 'rolle': null(S), 'bemerkung': null(S)})),
             'plankorrekturen': arr(ref('relpfad')), 'unterschrift': ref('relpfad'), 'unterschrieben_um': ref('zeitpunkt'), 'pdf': ref('relpfad'), '_meta': ref('meta_unveraenderlich')}))
print('Schemas:', len(os.listdir(ZIEL)))
