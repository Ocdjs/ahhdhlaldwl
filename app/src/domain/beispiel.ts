// Beispieldaten (anonymisierte Standardnamen), wie im Prototyp. Alle Daten relativ zum heutigen Diensttag H.
import { iso, kurz, mKey, plus, pd } from './datum';
import type { Belegung, Einsatz, Gast, Hinweis, PlanTag, State, Termin, Unterschrift } from './typen';
import { Welt } from './welt';

export const BEISPIEL_TEAM = ['Kim', 'Sam', 'Robin', 'Chris', 'Jule', 'Mika'];

export function beispielUnterschrift(seed: number): Unterschrift {
  return { w: 300, h: 100, d: `M20 70c${10 + (seed % 7)}-30 25-45 35-20s-5 30 12 12 28-38 38-8 18 6 34-12 22-4 40 2` };
}

export function beispiel(H: Date): State {
  const G: Record<string, Gast> = {};
  let n = 0;
  const gast = (vor: string, o: Partial<Gast> = {}): string => {
    const id = 'g' + ++n;
    G[id] = {
      id, vorname: vor, nachname: '', spitz: '', sprache: 'de', nr: '2026-27-' + String(n).padStart(4, '0'), erste: iso(plus(H, -20)), naechte: 12,
      laus: 'liegt', lausSeit: null, lausFrist: null, unterschrieben: true, uebersetzung: null, dokumente: [], sanktionen: [], notizen: [], extern: false, standort: 'haus',
      ...o,
    };
    if (G[id].unterschrieben && G[id].sprache !== 'de' && G[id].uebersetzung === null) G[id].uebersetzung = G[id].sprache;
    return id;
  };
  const b: Record<string, Belegung> = {};
  const bett = (nr: string, g: string | null, s: Belegung['s'], o: Partial<Belegung> = {}) => { b[nr] = { g, s, ...o }; };

  bett('D1', gast('Paul', { naechte: 21 }), 'anwesend');
  bett('D2', gast('Tom', { sprache: 'pl', naechte: 44, notizen: [{ datum: iso(plus(H, -1)), text: 'Fragt nach Arbeitsschuhen in Größe 44.', von: 'Sam', quelle: 'aus Bericht vom ' + kurz(plus(H, -1)) }] }), 'anwesend');
  bett('D3', null, 'frei');
  bett('D4', gast('Max', { spitz: 'Professor', sprache: 'ar', naechte: 12 }), 'erwartet');
  bett('D5', gast('Felix', { sprache: 'bg', naechte: 9, sanktionen: [{ stufe: 'Gelbe Karte', datum: iso(plus(H, -3)), grund: 'Laute Musik nach 23 Uhr nach zwei Hinweisen', von: 'Sam' }] }), 'anwesend');
  bett('D6', gast('Anna', { naechte: 30 }), 'gehalten', { bis: iso(plus(H, 4)), grund: 'Krankenhaus' });
  bett('T1', gast('Jan', { sprache: 'fa', naechte: 3, laus: 'fehlt', lausSeit: iso(plus(H, -3)) }), 'erwartet');
  bett('T2', gast('Leon', { sprache: 'ar', naechte: 17 }), 'freibis', { bis: iso(plus(H, 6)) });
  bett('T3', gast('Laura', { sprache: 'ro', naechte: 30 }), 'anwesend');
  bett('B1', gast('Tim', { sprache: 'ro', naechte: 1, laus: 'fehlt', lausSeit: iso(plus(H, -1)) }), 'erwartet');
  bett('B2', null, 'frei');
  bett('B3', gast('Lukas', { sprache: 'ro', naechte: 4 }), 'erwartet', { vorher: 1 });
  bett('B4', gast('Erik', { sprache: 'ru', naechte: 15 }), 'anwesend');
  bett('F1', gast('Moritz', { naechte: 20 }), 'anwesend');
  bett('F2', gast('Simon', { naechte: 8 }), 'fehlt2', { n: 2 });
  bett('F3', gast('Lisa', { naechte: 11, notizen: [{ datum: iso(plus(H, -2)), text: 'Arzttermin Donnerstag, kommt eventuell später.', von: 'Leitung', quelle: 'Hinweis' }] }), 'anwesend');
  bett('F4', null, 'frei');
  bett('L1', gast('Noah', { naechte: 6 }), 'anwesend');
  bett('L2', gast('Julia', { sprache: 'pl', naechte: 2 }), 'fehlt', { n: 1 });
  bett('L3', null, 'frei');
  bett('L4', gast('Nina', { naechte: 5 }), 'anwesend');
  bett('L5', gast('Max', { sprache: 'fa', naechte: 5, laus: 'liegt', unterschrieben: false }), 'anwesend');
  bett('E1', gast('Otto', { naechte: 1, laus: 'nicht', notizen: [{ datum: iso(H), text: 'Mit dem Kältebus gekommen.', von: 'Kim', quelle: 'Aufnahme' }] }), 'anwesend');
  bett('TH1', gast('Kai', { naechte: 9 }), 'anwesend');
  ['Karl', 'Sophie', 'Alexander', 'Peter', 'Hans', 'Eva', 'Frank'].forEach((v, i) => {
    bett(['N1', 'N2', 'N3', 'N5', 'N6', 'N7', 'N8'][i], gast(v, { standort: 'nikolaus', naechte: 30 + i, unterschrieben: false }), 'anwesend', { fort: true });
  });
  bett('N4', null, 'frei');
  bett('N9', null, 'frei');
  gast('Maximilian', { nachname: 'S.', naechte: 0, sanktionen: [{ stufe: 'Hausverbot', datum: iso(plus(H, -10)), grund: 'Gewalt gegen einen anderen Gast', von: 'Leitung', bis: iso(plus(H, 170)) }] });
  gast('Stefan', { nachname: 'Schmidt', sprache: 'ro', naechte: 3 });
  gast('Sarah', { sprache: 'fr', naechte: 2 });
  gast('Max', { nachname: 'Mustermann', sprache: 'ar', naechte: 14, erste: iso(plus(H, -60)) });
  gast('Markus', { sprache: 'pl', naechte: 7 });

  const dusche: State['dusche'] = { [iso(H)]: { '19:00': { g: 'g1', s: 'erledigt' }, '20:00': { g: 'g12', s: 'geplant' }, '20:30': { g: 'g14', s: 'geplant' } } };
  const hinweise: Hinweis[] = [
    { id: 'h1', von: 'Leitung', text: 'Heizung im T-Zimmer ist defekt. Der Handwerker kommt Donnerstag, bis dahin den Heizlüfter nutzen.', bis: iso(plus(H, 3)), wichtig: true, quelle: 'Nextcloud' },
    { id: 'h2', von: 'Sam', text: 'Neue Decken liegen im Keller, Regal links.', bis: iso(plus(H, 2)), wichtig: false, quelle: 'App' },
    { id: 'h3', von: 'Leitung', text: 'Ab morgen gibt es das Abendessen erst um 19:30. Bitte den Gästen beim Ankommen sagen.', ab: iso(plus(H, 1)), bis: iso(plus(H, 7)), dauer: '1 Woche', wichtig: false, quelle: 'App' },
    { id: 'h0', von: 'Leitung', text: 'Spendenlieferung Schlafsäcke steht im Flur, bitte nicht ausgeben.', ab: iso(plus(H, -4)), bis: iso(plus(H, -1)), dauer: '3 Tage', wichtig: false, quelle: 'App' },
  ];
  const termine: Termin[] = [
    { datum: iso(H), art: 'Bettwäsche', titel: 'Bettwäschewechsel Zimmer B', sym: 'wiederholen' },
    { datum: iso(plus(H, 1)), art: 'Sondertermin', titel: 'Lieferung Decken', sym: 'kalender' },
    { datum: iso(plus(H, 5)), art: 'Feiertag', titel: 'Morgen Feiertag, heute einkaufen', sym: 'einkauf' },
    { datum: iso(plus(H, 7)), art: 'Bettwäsche', titel: 'Bettwäschewechsel Zimmer D', sym: 'wiederholen' },
    { datum: iso(plus(H, 10)), art: 'Sondertermin', titel: 'Handwerker Heizung', sym: 'kalender' },
  ];
  const dienstplan: Record<string, string[]> = {}, kueche: Record<string, string> = {};
  const m0 = new Date(H.getFullYear(), H.getMonth() - 1, 1), m2 = new Date(H.getFullYear(), H.getMonth() + 2, 0);
  for (let d = new Date(m0); d <= m2; d = plus(d, 1)) {
    const i = Math.round((d.getTime() - H.getTime()) / 864e5), r = ((i % 3) + 3) % 3, dd = iso(d);
    dienstplan[dd] = r === 0 ? ['Sam', 'Robin'] : r === 1 ? ['Kim', 'Sam'] : ['Chris', ''];
    kueche[dd] = d.getDate() % 2 ? 'Mika' : 'Jule';
  }
  dienstplan[iso(H)] = ['Kim', 'Sam'];
  // Sam: heute ist der letzte geplante Dienst in diesem Monat
  Object.keys(dienstplan).forEach((dd) => { const x = pd(dd); if (x > H && x.getMonth() === H.getMonth()) dienstplan[dd] = dienstplan[dd].map((p) => (p === 'Sam' ? 'Jule' : p)); });
  const plan0: Record<string, PlanTag> = {}, einsaetze: Record<string, Einsatz[]> = {};
  const mEnde = new Date(H.getFullYear(), H.getMonth() + 1, 0);
  for (let d = new Date(m0); d <= mEnde; d = plus(d, 1)) { const k = iso(d); plan0[k] = { nacht: dienstplan[k].slice(), kueche: kueche[k] }; }
  let tauschA: string | null = null, tauschB: string | null = null;
  for (let d = new Date(m0); d < H; d = plus(d, 1)) {
    const k = iso(d), p = plan0[k];
    const e: Einsatz[] = p.nacht.map((x, j) => (x ? { name: x, rolle: 'Betreuung ' + (j + 1), geplant: x, grund: '' } : null)).filter(Boolean) as Einsatz[];
    e.push({ name: p.kueche, rolle: 'Küche', geplant: p.kueche, grund: '' });
    if (d.getMonth() === m0.getMonth() && d.getDate() > 8) {
      if (!tauschA && p.nacht.includes('Robin')) { tauschA = k; e.forEach((x) => { if (x.name === 'Robin') { x.name = 'Chris'; x.grund = 'Tausch'; } }); }
      else if (tauschA && !tauschB && d.getDate() > 15 && p.nacht.includes('Kim') && !p.nacht.includes('Jule')) { tauschB = k; e.forEach((x) => { if (x.name === 'Kim') { x.name = 'Jule'; x.grund = 'Sonstiges'; } }); }
    }
    einsaetze[k] = e;
  }
  const S: State = {
    v: 1, theme: 'auto', G, betten: b, offRooms: {}, offBeds: { N4: true }, notbett: { L3: true, E1: true }, extra: [{ id: 'N9', name: 'Matratze Flur', ort: 'niko' }], lage: {}, bad: {},
    dusche, hinweise, termine, dienstplan, kueche, plan0, einsaetze, nachweise: {}, planLog: [],
    archiv: [
      { datum: iso(plus(H, -1)), vorfall: false, personen: 'Sam, Chris, Jule', text: 'Ruhige Nacht.', fehlt: ['Toilettenpapier'], fehltText: 'Müllbeutel 120 l', fragen: '@Tom (D2) fragt nach Arbeitsschuhen in Größe 44.', kommentare: [] },
      { datum: iso(plus(H, -3)), vorfall: true, personen: 'Sam, Robin, Jule', text: 'Gelbe Karte für @Felix: laute Musik nach 23 Uhr nach zwei Hinweisen.', fehlt: [], fehltText: '', fragen: '', kommentare: [{ von: 'Leitung', art: 'kommentar', text: 'Danke, richtig gehandelt. Bitte beim nächsten Mal auch die Uhrzeit notieren.', um: kurz(plus(H, -2)) + ' 10:20', gast: null }] },
      { datum: iso(plus(H, -2)), vorfall: false, personen: 'Kim, Chris, Mika', text: 'Lukas (B3) ist nicht gekommen, fehlt unentschuldigt.', fehlt: ['Kaffee', 'Seife'], fehltText: '', fragen: 'Lisa fragt, ob sie ihren Koffer im Keller lassen kann.', kommentare: [] },
      { datum: iso(plus(H, -4)), vorfall: false, personen: 'Kim, Sam, Mika', text: 'Schlüssel 7 fehlt. @Max Mustermann wollte nachsehen, ob er ihn eingesteckt hat.', fehlt: [], fehltText: '', fragen: '', kommentare: [] },
    ],
    fehltErledigt: {}, planAenderungen: [],
    planImporte: {
      [mKey(m0)]: { von: 'Leitung', um: '01.' + String(m0.getMonth() + 1).padStart(2, '0') + '. 09:10', dienste: 90, korrigiert: 3, quelle: 'Foto' },
      [mKey(H)]: { von: 'Leitung', um: '01.' + String(H.getMonth() + 1).padStart(2, '0') + '. 09:30', dienste: 93, korrigiert: 2, quelle: 'Foto' },
    },
    berichte: {}, sync: { offline: false, ausstehend: 0, zuletzt: '21:00' }, naechsteNr: n + 1, ampel: { gruen: 3 },
    team: BEISPIEL_TEAM.map((name, i) => ({ name, bereiche: name === 'Jule' ? ['betreuung', 'kueche'] : name === 'Mika' ? ['kueche'] : ['betreuung'], personalnummer: 'P-' + (100 + i), aktiv: true })),
    leitungName: 'Leitung',
    codes: { admin: '1234', leitung: '2580' },
    anmeldung: null,
  };
  // Drei schon unterschriebene Dienstnachweise im Vormonat
  const w = new Welt(S, H, 0), kv = mKey(m0), um = '01.' + String(H.getMonth() + 1).padStart(2, '0') + '. ';
  ([['Kim', 'betreuung', 1, '07:10'], ['Sam', 'betreuung', 4, '08:11'], ['Mika', 'kueche', 7, '09:12']] as const).forEach(([name, ber, seed, zeit]) => {
    const d = w.nachweisDaten(kv, name, ber);
    S.nachweise[kv] = S.nachweise[kv] || {};
    S.nachweise[kv][ber] = S.nachweise[kv][ber] || {};
    S.nachweise[kv][ber]![name] = { um: um + zeit, sig: beispielUnterschrift(seed), zeilen: d.zeilen, ...d.sum, pdf: w.nachweisPdf(kv, name, ber) };
  });
  return S;
}
