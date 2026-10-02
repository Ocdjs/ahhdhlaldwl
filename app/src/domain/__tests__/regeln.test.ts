import { beispiel } from '../beispiel';
import { iso, plus } from '../datum';
import { Welt } from '../welt';

const H = new Date(2026, 9, 2); // Freitag, 2. Oktober 2026
const neu = () => { const S = beispiel(H); return { S, w: new Welt(S, H, 0) }; };

describe('KHT-Nummer und Ampel', () => {
  test('Beispiel: 25 belegt, 6 frei, Ampel grün', () => {
    const { w } = neu();
    const k = w.kennzahlen();
    expect(k.belegt).toBe(25);
    expect(k.frei).toBe(6);
    expect(k.ampel).toBe('gruen');
  });
  test('freies Notbett zählt nicht, belegtes zählt', () => {
    const { S, w } = neu();
    const vorher = w.khtZahlen();
    S.notbett.F4 = true; // F4 ist frei
    const w2 = new Welt(S, H, 0);
    expect(w2.khtZahlen().gesamt).toBe(vorher.gesamt - 1);
    expect(w2.khtZahlen().belegt).toBe(vorher.belegt);
  });
  test('fehlt 1. Nacht zählt belegt, ab 2. Nacht frei', () => {
    const { w } = neu();
    expect(w.status('L2')).toBe('fehlt');
    expect(w.belegtKht('L2')).toBe(true);
    expect(w.status('F2')).toBe('fehlt2');
    expect(w.zaehlt('F2')).toBe(true);
  });
  test('gesperrtes Zimmer zählt nirgends', () => {
    const { S } = neu();
    const k0 = new Welt(S, H, 0).khtZahlen();
    S.offRooms.F = true;
    const k1 = new Welt(S, H, 0).khtZahlen();
    expect(k1.gesamt).toBe(k0.gesamt - 4);
  });
});

describe('Anzeigename', () => {
  test('gleiche Vornamen mit Bettnummer, ohne Bett mit Nachname', () => {
    const { S, w } = neu();
    const maxe = Object.values(S.G).filter((g) => g.vorname === 'Max');
    const namen = maxe.map((g) => w.anzeige(g)).sort();
    expect(namen).toEqual(['Max (D4)', 'Max (L5)', 'Max (Mustermann)']);
    expect(w.anzeige(S.G.g1)).toBe('Paul');
  });
});

describe('Erwähnungen und Sanktionen', () => {
  test('genau eine Person bekommt die Sanktion, die anderen nur eine Notiz', () => {
    const { w } = neu();
    const e = w.erkennen('Gelbe Karte @Felix und @Max (D4): Streit im Flur.');
    expect(e.absaetze).toHaveLength(1);
    expect(e.absaetze[0].stufe).toBe('Gelbe Karte');
    expect(e.absaetze[0].ziel?.vorname).toBe('Felix');
    expect(e.absaetze[0].rest.map((g) => w.anzeige(g))).toEqual(['Max (D4)']);
  });
  test('mehrdeutiges @Max muss eindeutig gemacht werden', () => {
    const { w } = neu();
    expect(w.erkennen('@Max war laut').mehrdeutig[0].kandidaten).toHaveLength(3);
  });
});

describe('Bad', () => {
  test('zu, solange Duschen geplant sind; dann Erinnerung', () => {
    const { S, w } = neu();
    expect(w.badZustand()).toBe('zu');
    Object.values(S.dusche[iso(H)]).forEach((d) => { d.s = 'erledigt'; });
    expect(new Welt(S, H, 0).badZustand()).toBe('erinnern');
    S.bad[iso(H)] = { zu: false, um: '21:00', von: 'Kim' };
    expect(new Welt(S, H, 0).badZustand()).toBe('frei');
  });
});

describe('Anmeldung über die Unterschrift', () => {
  test('ohne Unterschrift darf niemand ändern', () => {
    const { w } = neu();
    expect(w.darfAendern()).toBe(false);
  });
  test('nach Unterschrift in der Besetzung darf die Person ändern', () => {
    const { S } = neu();
    S.berichte[iso(H)] = { status: 'offen', besetzung: [{ rolle: 'Betreuung 1', name: 'Kim', sig: { w: 1, h: 1, d: 'M0 0' } }, { rolle: 'Betreuung 2', name: 'Sam', sig: null }, { rolle: 'Küche', name: 'Jule', sig: null }], f: { hinweise: '', kht: null, vorfall: null, fehlt: [], fehltText: '', fragen: '', schluessel: null, schluesselNr: '', extern: [], sonstiges: '', ziele: {} }, nachtraege: [], begonnen: '18:50' };
    S.anmeldung = { datum: iso(H), name: 'Kim', leitung: false, um: '18:51' };
    expect(new Welt(S, H, 0).darfAendern()).toBe(true);
    S.anmeldung = { datum: iso(H), name: 'Sam', leitung: false, um: '18:52' };
    expect(new Welt(S, H, 0).darfAendern()).toBe(false);
    S.anmeldung = { datum: iso(plus(H, -1)), name: 'Kim', leitung: false, um: '18:51' };
    expect(new Welt(S, H, 0).darfAendern()).toBe(false);
  });
  test('Leitung darf mit Anmeldung ändern, nie an vergangenen Tagen', () => {
    const { S } = neu();
    S.anmeldung = { datum: iso(H), name: 'Leitung', leitung: true, um: '10:00' };
    expect(new Welt(S, H, 0).darfAendern()).toBe(true);
    expect(new Welt(S, H, -1).darfAendern()).toBe(false);
  });
  test('Küche unterschreibt, handelt aber nicht; Vermerk ohne Anmeldung ist „Admin-PIN“', () => {
    const { S } = neu();
    S.berichte[iso(H)] = { status: 'offen', besetzung: [{ rolle: 'Betreuung 1', name: 'Kim', sig: null }, { rolle: 'Betreuung 2', name: 'Sam', sig: null }, { rolle: 'Küche', name: 'Jule', sig: { w: 1, h: 1, d: 'M0 0' } }], f: { hinweise: '', kht: null, vorfall: null, fehlt: [], fehltText: '', fragen: '', schluessel: null, schluesselNr: '', extern: [], sonstiges: '', ziele: {} }, nachtraege: [], begonnen: '17:00' };
    S.anmeldung = { datum: iso(H), name: 'Jule', leitung: false, um: '17:01' };
    const w = new Welt(S, H, 0);
    expect(w.darfAendern()).toBe(false);
    expect(w.diensthabende().map((d) => d.name)).toEqual(['Kim', 'Sam']);
    expect(w.aktivePerson()).toBe('Admin-PIN');
  });
});

describe('Monatsabschluss', () => {
  test('Robin: 10 geplant, 9 gemacht, 1 abgegeben an Chris', () => {
    const { w } = neu();
    const d = w.nachweisDaten('2026-09', 'Robin', 'betreuung');
    expect(d.sum).toEqual({ geplant: 10, gemacht: 9, abgegeben: 1, vertretung: 0 });
    expect(d.zeilen.some((z) => z.text === 'abgegeben an Chris')).toBe(true);
  });
  test('Jule: Betreuung und Küche getrennt', () => {
    const { w } = neu();
    expect(w.nachweisDaten('2026-09', 'Jule', 'kueche').sum.geplant).toBe(15);
    expect(w.nachweisDaten('2026-09', 'Jule', 'betreuung').sum.vertretung).toBe(1);
  });
  test('kein „krank“ mehr', () => {
    const { w } = neu();
    ['Kim', 'Sam', 'Robin', 'Chris', 'Jule'].forEach((n) => w.nachweisDaten('2026-09', n, 'betreuung').zeilen.forEach((z) => expect(z.text).not.toMatch(/krank/i)));
  });
});

describe('Hinweise', () => {
  test('geplanter Hinweis erscheint erst ab seinem Tag', () => {
    const { S, w } = neu();
    const h3 = S.hinweise.find((h) => h.id === 'h3')!;
    expect(w.hinweisAktiv(h3, iso(H))).toBe(false);
    expect(w.hinweisAktiv(h3, iso(plus(H, 1)))).toBe(true);
  });
});
