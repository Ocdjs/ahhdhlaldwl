// Alle Änderungen an den Daten. Jede Handlung vermerkt, wer sie gemacht hat (aktivePerson).
import { iso, kurz, pd, plus, uhr } from '../domain/datum';
import { DAUERN, STUFE_RE } from '../domain/haus';
import type { Bereich, Gast, KommentarArt, Stufe, Termin, Unterschrift } from '../domain/typen';
import { aendern, getS, getU, toast, ui, welt, type Scan, type Wizard } from './store';

const jetzt = (H: Date) => kurz(H) + ' ' + uhr();

// ---------- Anmeldung: unterschreiben = anmelden ----------
export function besetzungUnterschreiben(i: number, sig: Unterschrift): void {
  aendern((S, w) => {
    const b = S.berichte[w.hIso]; if (!b) return;
    const x = b.besetzung[i];
    const nach = b.status === 'abgeschlossen';
    x.sig = sig;
    x.um = nach ? 'nachgeholt ' + kurz(w.H) + ' ' + uhr() : uhr();
    if (nach) b.nachtraege.push({ text: 'Unterschrift von ' + x.name + ' nachgeholt.', um: kurz(w.H) + ' · ' + uhr(), von: x.name });
    if (x.rolle !== 'Küche') S.anmeldung = { datum: w.hIso, name: x.name, leitung: false, um: uhr() };
  });
}
/** Unterschrift für einen früheren Bericht nachholen (Erinnerung an der Glocke). */
export function altUnterschriftNachholen(datum: string, i: number, sig: Unterschrift): void {
  aendern((S, w) => {
    const b = S.berichte[datum]; if (!b) return;
    const x = b.besetzung[i];
    x.sig = sig; x.um = 'nachgeholt ' + kurz(w.H) + ' ' + uhr();
    b.nachtraege.push({ text: 'Unterschrift von ' + x.name + ' nachgeholt.', um: kurz(w.H) + ' · ' + uhr(), von: x.name });
  });
}
export function personWaehlen(name: string): void { aendern((S, w) => { S.anmeldung = { datum: w.hIso, name, leitung: false, um: uhr() }; }); }
export function leitungAnmelden(code: string): boolean {
  if (code !== getS().codes.leitung) return false;
  aendern((S, w) => { S.anmeldung = { datum: w.hIso, name: S.leitungName, leitung: true, um: uhr() }; });
  return true;
}
export function abmelden(): void { aendern((S) => { S.anmeldung = null; }); }

// ---------- Bettenplan ----------
export function istDa(nr: string): void {
  aendern((S) => { const b = S.betten[nr]; b.s = 'anwesend'; delete b.n; delete b.vorher; if (b.g) S.G[b.g].naechte++; });
  const u = getU(); ui({ neu: nr, schnell: u.schnell && u.schnell.nr === nr ? { ...u.schnell, phase: 'da' } : u.schnell });
}
export function fehltEintragen(nr: string): void {
  let n = 1, name = '';
  aendern((S) => { const b = S.betten[nr]; n = (b.vorher || 0) + 1; delete b.vorher; b.n = n; b.s = n >= 2 ? 'fehlt2' : 'fehlt'; name = b.g ? S.G[b.g].vorname : ''; });
  ui({ modal: null, gesetzt: [nr] });
  toast('abwesend', name + ' fehlt (' + n + '. Nacht)', n >= 2 ? 'Bett ' + nr + ' zählt ab jetzt als frei.' : 'Bett ' + nr + ' zählt weiter als belegt.', 5000);
}
export function heuteFrei(nr: string): void { aendern((S, w) => { S.betten[nr].s = 'freibis'; S.betten[nr].bis = iso(plus(w.H, 1)); }); ui({ modal: null, gesetzt: [nr] }); }
export function dauerhaftUmschalten(nr: string): void { aendern((S) => { S.betten[nr].dauerhaft = S.betten[nr].dauerhaft === false; }); }
export function zurueck(nr: string): void { aendern((S) => { const b = S.betten[nr]; b.s = 'anwesend'; delete b.bis; if (b.g) S.G[b.g].naechte++; }); ui({ neu: nr }); }
export function abwesenheit(nr: string, art: 'gehalten' | 'freibis', bis: string, grund: string): void {
  aendern((S) => { const b = S.betten[nr]; b.s = art; b.bis = bis; b.grund = grund; }); ui({ modal: null, gesetzt: [nr] });
}
export function bettFrei(nr: string): void {
  aendern((S, w) => { const g = w.gastVon(nr); if (g) S.G[g.id].notizen.push({ datum: w.hIso, text: 'Ausgezogen, Bett ' + nr + ' freigegeben.', von: w.aktivePerson(), quelle: 'Bettenplan' }); S.betten[nr] = { g: null, s: 'frei' }; });
  ui({ modal: null, detail: null, offen: null, gesetzt: [nr] });
}
export function wechseln(von: string, nach: string): void {
  aendern((S, w) => {
    const A = S.betten[von], B = S.betten[nach] || { g: null, s: 'frei' };
    const freiZiel = w.status(nach) === 'frei';
    S.betten[nach] = { ...A };
    S.betten[von] = freiZiel ? { g: null, s: 'frei' } : { ...B };
  });
  const w = welt();
  ui({ modal: null, gesetzt: [von, nach], detail: w.gastVon(nach) ? nach : null, offen: w.gastVon(nach) ? nach : null });
}
export function duschWahl(nr: string, z: string): void {
  let name = '';
  aendern((S, w) => {
    const g = w.gastVon(nr)!; name = g.vorname;
    const d = (S.dusche[w.hIso] = S.dusche[w.hIso] || {});
    Object.keys(d).forEach((k) => { if (d[k].g === g.id && d[k].s === 'geplant') delete d[k]; });
    d[z] = { g: g.id, s: 'geplant' };
  });
  ui({ modal: null }); toast('dusche', 'Dusche ' + z, name + ', Bett ' + nr, 4000);
}
export function slotSetzen(datum: string, z: string, gid: string): void { aendern((S) => { (S.dusche[datum] = S.dusche[datum] || {})[z] = { g: gid, s: 'geplant' }; }); ui({ modal: null }); }
export function slotStatus(datum: string, z: string, st: 'erledigt' | 'verpasst' | 'frei'): void {
  const vorher = welt().badZustand();
  aendern((S) => { const d = S.dusche[datum]; if (st === 'frei') delete d[z]; else d[z].s = st; });
  ui({ modal: null });
  if (vorher === 'zu' && welt().badZustand() === 'erinnern') toast('schloss-offen', 'Bad aufschließen', 'Alle haben geduscht. Danach im Grundriss auf das Bad tippen.', 6000);
}
export function badAuf(): void { aendern((S, w) => { S.bad[w.hIso] = { zu: false, um: uhr(), von: w.aktivePerson() }; }); ui({ modal: null }); toast('schloss-offen', 'Bad ist frei', 'Aufgeschlossen um ' + uhr() + '.', 3000); }
export function badZuschliessen(): void { aendern((S, w) => { S.bad[w.hIso] = { zu: true, um: uhr(), von: w.aktivePerson() }; }); ui({ modal: null }); }
export function sanktion(nr: string, stufe: Stufe, grund: string, bis: string | null): void {
  aendern((S, w) => { const g = w.gastVon(nr)!; S.G[g.id].sanktionen.push({ stufe, datum: w.hIso, grund, von: w.aktivePerson(), bis: stufe === 'Hausverbot' ? bis : undefined }); });
  ui({ modal: null });
}
export function notiz(gid: string, text: string): void {
  aendern((S, w) => { S.G[gid].notizen.push({ datum: iso(w.tagDatum()), text, von: w.aktivePerson(), quelle: w.tag ? 'Nachtrag ' + uhr() : '' }); });
  ui({ modal: null });
}
export function lausGeprueft(gid: string): void {
  aendern((S, w) => { const g = S.G[gid]; g.laus = 'liegt'; g.lausVon = w.aktivePerson(); g.lausFrist = null; });
  ui({ modal: null }); toast('laeuseschein', 'Läuseschein liegt vor', getS().G[gid].vorname + ' · gilt die ganze Saison', 4000);
}
export function lausJa(nr: string): void { aendern((S, w) => { const g = w.gastVon(nr)!; S.G[g.id].lausFrist = iso(plus(w.H, 3)); S.G[g.id].lausVon = w.aktivePerson(); }); }

// ---------- Gäste ----------
export function dokumentHinterlegen(gid: string, art: string, datei: string, notizText: string, foto: boolean, uri?: string): void {
  aendern((S, w) => {
    const g = S.G[gid];
    g.dokumente.push({ art, datei, datum: w.hIso, von: w.aktivePerson(), foto, uri });
    if (art === 'Hausordnung auf Papier') { g.unterschrieben = true; g.papier = true; g.unterschriebenAm = w.hIso; if (!g.nr) g.nr = '2026-27-' + String(S.naechsteNr++).padStart(4, '0'); }
    if (art === 'Läuseschein') { g.laus = 'liegt'; g.lausVon = w.aktivePerson(); g.lausFrist = null; }
    if (notizText) g.notizen.push({ datum: w.hIso, text: notizText, von: w.aktivePerson(), quelle: 'Gästedatenbank · ' + art });
  });
  ui({ modal: null }); toast('dokument-plus', art + ' hinterlegt', welt().anzeige(getS().G[gid]) + ' · ' + datei, 4000);
}
export function gastSpeichern(gid: string, f: Pick<Gast, 'vorname' | 'nachname' | 'spitz' | 'sprache'>): void {
  aendern((S, w) => { const g = S.G[gid]; Object.assign(g, f); g.notizen.push({ datum: w.hIso, text: 'Stammdaten geändert.', von: w.aktivePerson(), quelle: 'Gästedatenbank' }); });
  ui({ modal: null });
}
export function aufnahmeHinweisAus(gid: string, idx: number): void { aendern((S) => { S.G[gid].notizen[idx].aufnahme = false; }); ui({ modal: null }); }

// ---------- Aufnahme ----------
function dokumenteSpeichern(S: ReturnType<typeof getS>, g: Gast, w: Wizard, H: Date, wer: string): void {
  if (!g.nr) g.nr = '2026-27-' + String(S.naechsteNr++).padStart(4, '0');
  g.unterschrieben = true; g.unterschriebenAm = iso(H); g.uebersetzung = w.sprache && w.sprache !== 'de' ? w.sprache : null;
  if (w.sprache) g.sprache = w.sprache;
  g.sig = { hg: w.sig.hg, hb: w.sig.hb, dg: w.sig.dg, betreuung: wer };
  g.dokumente.push({ art: 'Hausordnung und Datenschutz', datei: (g.nr ? g.nr.slice(-4) : '0000') + '_' + g.vorname + (g.nachname ? '_' + g.nachname : '') + '_' + iso(H) + '.pdf', datum: iso(H), von: wer });
}
export function aufnahmeAbschliessen(w: Wizard): { gid: string; nr: string } {
  let gid = w.g || '';
  aendern((S, welt) => {
    const wer = welt.aktivePerson();
    if (w.nachholen) {
      const gn = S.G[gid]; dokumenteSpeichern(S, gn, w, welt.H, wer);
      gn.notizen.push({ datum: welt.hIso, text: 'Hausordnung und Datenschutz nachträglich unterschrieben.', von: wer, quelle: 'Gästedatenbank' });
      return;
    }
    if (!gid) {
      gid = 'g' + Date.now();
      S.G[gid] = { id: gid, vorname: w.neu.vorname.trim() || w.neu.spitz.trim(), nachname: w.neu.nachname.trim(), spitz: w.neu.spitz.trim(), sprache: w.sprache || 'de', nr: '', erste: welt.hIso, naechte: 0, laus: 'nicht', lausSeit: null, lausFrist: null, unterschrieben: false, uebersetzung: null, dokumente: [], sanktionen: [], notizen: [], extern: false, standort: 'haus' };
    }
    const g = S.G[gid];
    if (w.niko) { g.standort = 'nikolaus'; g.naechte++; S.betten[w.nr] = { g: gid, s: 'anwesend', fort: true }; return; }
    if (!g.unterschrieben) dokumenteSpeichern(S, g, w, welt.H, wer);
    if (w.dauer !== '1' && g.laus !== 'liegt') { g.laus = 'fehlt'; g.lausSeit = welt.hIso; }
    if (welt.hausverbot(g)) g.notizen.push({ datum: welt.hIso, text: 'Trotz Hausverbot aufgenommen: ' + w.grund, von: wer, quelle: 'Aufnahme' });
    const vorher = S.betten[w.nr];
    if (vorher && vorher.g && vorher.g !== gid && vorher.s === 'fehlt2') {
      const alt = S.G[vorher.g];
      alt.notizen.push({ datum: welt.hIso, text: 'Bett ' + w.nr + ' neu vergeben, nachdem ' + alt.vorname + ' ' + (vorher.n || 2) + ' Nächte in Folge unentschuldigt gefehlt hat.', von: wer, quelle: 'Bettenplan' });
    }
    Object.keys(S.betten).forEach((n) => { if (S.betten[n].g === gid && n !== w.nr) S.betten[n] = { g: null, s: 'frei' }; });
    g.naechte++;
    S.betten[w.nr] = { g: gid, s: 'anwesend', dauerhaft: w.dauer !== '1', ende: w.dauer === 'mehr' && w.mitEnde ? w.bis : null };
  });
  return { gid, nr: w.nr };
}

// ---------- Dienst & Bericht ----------
export function dienstBeginnen(): void {
  aendern((S, w) => {
    const dp = S.dienstplan[w.hIso] || ['', ''];
    S.berichte[w.hIso] = {
      status: 'offen',
      besetzung: [{ rolle: 'Betreuung 1', name: dp[0] || 'offen', sig: null }, { rolle: 'Betreuung 2', name: dp[1] || 'offen', sig: null }, { rolle: 'Küche', name: S.kueche[w.hIso] || 'offen', sig: null }],
      f: { hinweise: '', kht: null, vorfall: null, fehlt: [], fehltText: '', fragen: '', schluessel: null, schluesselNr: '', extern: [], sonstiges: '', ziele: {} },
      nachtraege: [], begonnen: uhr(),
    };
  });
}
type Textfeld = 'hinweise' | 'fragen' | 'sonstiges' | 'fehltText' | 'schluesselNr';
export function feldSetzen(feld: Textfeld, wert: string): void { aendern((S, w) => { const b = S.berichte[w.hIso]; if (b && b.status === 'offen') b.f[feld] = wert; }); }
export function jaNein(feld: 'kht' | 'vorfall' | 'schluessel', wert: 'ja' | 'nein'): void { aendern((S, w) => { const b = S.berichte[w.hIso]; b.f[feld] = b.f[feld] === wert ? null : wert; }); }
export function fehltUmschalten(x: string): void { aendern((S, w) => { const f = S.berichte[w.hIso].f.fehlt, i = f.indexOf(x); if (i >= 0) f.splice(i, 1); else f.push(x); }); }
export function personSetzen(i: number, name: string, grund: string): void {
  aendern((S, w) => { const x = S.berichte[w.hIso].besetzung[i]; x.geplant = x.geplant || x.name; x.name = name; x.grund = x.name === x.geplant ? '' : grund; x.sig = null; });
  ui({ modal: null });
}
export function externDazu(n: string): void { aendern((S, w) => { const e = S.berichte[w.hIso].f.extern; if (!e.includes(n)) e.push(n); }); ui({ modal: null }); }
export function zielSetzen(idx: number, gid: string): void { aendern((S, w) => { const b = S.berichte[w.hIso]; b.f.ziele = b.f.ziele || {}; b.f.ziele[idx] = gid; }); ui({ modal: null }); }
export function berichtAbschliessen(): { ohne: string[]; anzahl: number } {
  let ohne: string[] = [], anzahl = 0;
  aendern((S, w) => {
    const b = S.berichte[w.hIso], wer = w.aktivePerson();
    ohne = b.besetzung.filter((x) => x.name !== 'offen' && !x.sig).map((x) => x.name);
    const e = w.erkennen(b.f.hinweise, b.f.ziele), quelle = 'aus Bericht vom ' + kurz(w.H);
    e.absaetze.forEach((a) => {
      if (a.stufe && a.ziel) {
        anzahl++;
        const g = S.G[a.ziel.id];
        g.sanktionen.push({ stufe: a.stufe, datum: w.hIso, grund: a.text.replace(STUFE_RE, '').replace(/^\s*(für)?\s*/i, ''), von: wer, bis: a.stufe === 'Hausverbot' ? null : undefined });
        g.notizen.push({ datum: w.hIso, text: a.text, von: wer, quelle: quelle + ' · ' + a.stufe });
      }
      a.rest.forEach((r) => S.G[r.id].notizen.push({ datum: w.hIso, text: a.text, von: wer, quelle: quelle + (a.stufe ? ' · erwähnt, keine Sanktion' : '') }));
    });
    b.khtNr = w.kennzahlen().belegt;
    b.abw = w.abwesenheiten().map((x) => x.gast.vorname + ' (' + x.nr + '): ' + x.text);
    b.ohneUnterschrift = ohne; b.status = 'abgeschlossen'; b.zuUm = kurz(w.H) + ' · ' + uhr();
  });
  ui({ modal: null, pruefen: false });
  return { ohne, anzahl };
}
export function nachtrag(text: string): void { aendern((S, w) => { S.berichte[w.hIso].nachtraege.push({ text, um: kurz(new Date()) + ' · ' + uhr(), von: w.aktivePerson() }); }); ui({ modal: null }); }

// ---------- Hinweise, Archiv ----------
function bisAus(dw: string, ab: Date, datum?: string): string { return dw === 'datum' ? datum || iso(ab) : iso(plus(ab, +dw - 1)); }
export function hinweisSpeichern(von: string, text: string, dw: string, datum: string | undefined, wichtig: boolean): void {
  aendern((S, w) => {
    const ab = w.naechsterDienst(); let bis = bisAus(dw, ab, datum); if (bis < iso(ab)) bis = iso(ab);
    S.hinweise.unshift({ id: 'h' + Date.now(), von, text, ab: iso(ab), bis, dauer: DAUERN.find((d) => d[0] === dw)?.[1], wichtig, quelle: 'App' });
  });
  ui({ modal: null }); toast('check', 'Hinweis hinterlegt', welt().zeitraum(getS().hinweise[0]), 3000);
}
export function hinweisEnde(id: string): void { aendern((S, w) => { const h = S.hinweise.find((x) => x.id === id); if (h) h.beendet = jetzt(w.H); }); toast('check', 'Hinweis beendet', 'Er erscheint nicht mehr im Bericht.', 3000); }
export function kommentarSpeichern(datum: string, art: KommentarArt, von: string, text: string, gast: string | null, aufnahme: boolean, dw: string, bisDatum?: string): void {
  let ziel = '';
  aendern((S, w) => {
    const ab = w.naechsterDienst();
    const bis = dw === '0' ? null : bisAus(dw, ab, bisDatum);
    const c = { von, art, text, um: jetzt(w.H), gast, aufnahme: !!gast && aufnahme, bis };
    if (datum === w.hIso && S.berichte[datum]) { const b = S.berichte[datum]; b.kommentare = b.kommentare || []; b.kommentare.push(c); }
    else S.archiv.find((x) => x.datum === datum)?.kommentare.push(c);
    if (bis) {
      S.hinweise.unshift({ id: 'h' + Date.now(), von, text: (art === 'antwort' ? 'Antwort: ' : '') + text, ab: iso(ab), bis: bis < iso(ab) ? iso(ab) : bis, dauer: DAUERN.find((d) => d[0] === dw)?.[1], wichtig: art === 'hinweis', quelle: 'Archiv', bezug: datum });
      ziel = 'Oben im Dienst ' + w.zeitraum(S.hinweise[0]);
    } else ziel = 'Im Archiv';
    if (gast) S.G[gast].notizen.push({ datum: w.hIso, text, von, quelle: (art === 'antwort' ? 'Antwort' : art === 'hinweis' ? 'Wichtiger Hinweis' : 'Kommentar') + ' zu Bericht vom ' + kurz(pd(datum)), aufnahme: aufnahme });
  });
  ui({ modal: null });
  toast('check', 'Gespeichert', ziel + (gast ? ' · Notiz bei ' + welt().anzeige(getS().G[gast]) : ''), 4000);
}
export function fehltErledigt(key: string): void { aendern((S, w) => { if (S.fehltErledigt[key]) delete S.fehltErledigt[key]; else S.fehltErledigt[key] = { von: w.aktivePerson(), um: jetzt(w.H) }; }); }

// ---------- Monatsabschluss ----------
export function nachweisUnterschreiben(k: string, name: string, b: Bereich, sig: Unterschrift): void {
  aendern((S, w) => {
    if (w.nachweisVon(k, name, b)) return;
    const d = w.nachweisDaten(k, name, b);
    S.nachweise[k] = S.nachweise[k] || {};
    S.nachweise[k][b] = S.nachweise[k][b] || {};
    S.nachweise[k][b]![name] = { um: jetzt(w.H), sig, zeilen: d.zeilen, ...d.sum, pdf: w.nachweisPdf(k, name, b) };
  });
  toast('pdf', 'Dienstnachweis unterschrieben', welt().nachweisPdf(k, name, b) + ' · Lohntabelle ' + (b === 'kueche' ? 'Küche' : 'Betreuung'), 5000);
}
export function planKorrektur(k: string, name: string, b: Bereich, soll: Record<string, boolean>, grund: string, von: string): string[] {
  const aenderungen: string[] = [];
  aendern((S, w) => {
    Object.keys(soll).forEach((di) => {
      const ist = w.rollenGeplant(di, name, b).length > 0;
      if (soll[di] === ist) return;
      const pl = (S.plan0[di] = S.plan0[di] || { nacht: (S.dienstplan[di] || []).slice(), kueche: S.kueche[di] || '' });
      if (b === 'kueche') pl.kueche = soll[di] ? name : '';
      else if (soll[di]) { const frei = pl.nacht.indexOf(''); if (frei >= 0) pl.nacht[frei] = name; else pl.nacht.push(name); }
      else pl.nacht = pl.nacht.map((n) => (n === name ? '' : n));
      aenderungen.push((soll[di] ? '+' : '−') + kurz(pd(di)));
    });
    if (aenderungen.length) S.planLog.push({ monat: k, name, bereich: b, aenderungen, grund, von, um: jetzt(w.H) });
  });
  return aenderungen;
}

// ---------- Kalender ----------
export function dienstAendern(di: string, i: number, neu: string, von: string, grund: string, notizText: string): void {
  aendern((S, w) => {
    const r = w.dienstRollen(di)[i];
    if (i === 2) S.kueche[di] = neu;
    else { S.dienstplan[di] = (S.dienstplan[di] || ['', '']).slice(); S.dienstplan[di][i] = neu; }
    S.planAenderungen.push({ datum: di, rolle: r[0], alt: r[1], neu, von, grund, notiz: notizText, um: jetzt(w.H) });
    const b = S.berichte[di];
    if (b && b.status !== 'abgeschlossen' && b.besetzung[i] && !b.besetzung[i].sig) b.besetzung[i].name = neu || 'offen';
  });
}
export function terminNeu(t: Termin): void { aendern((S) => { S.termine.push(t); }); ui({ modal: null }); }
export function terminAendern(idx: number, neu: Pick<Termin, 'titel' | 'datum' | 'art' | 'sym'>, von: string): void {
  aendern((S, w) => { const t = S.termine[idx]; const vorher = { datum: t.datum, titel: t.titel }; Object.assign(t, neu); t.geaendert = { von, um: jetzt(w.H), vorher }; });
  ui({ modal: null });
}
export function terminLoeschen(idx: number, von: string): void {
  aendern((S, w) => { const t = S.termine[idx]; S.planAenderungen.push({ datum: t.datum, rolle: 'Termin', alt: t.titel, neu: 'gelöscht', von, grund: 'Termin', notiz: '', um: jetzt(w.H) }); S.termine.splice(idx, 1); });
  ui({ modal: null });
}

// ---------- Einstellungen ----------
export function zimmerAus(id: string): void { aendern((S) => { if (S.offRooms[id]) delete S.offRooms[id]; else S.offRooms[id] = true; }); }
export function bettAus(nr: string): void { aendern((S) => { if (S.offBeds[nr]) delete S.offBeds[nr]; else S.offBeds[nr] = true; }); }
export function notbett(nr: string): void { aendern((S) => { if (S.notbett[nr]) delete S.notbett[nr]; else S.notbett[nr] = true; }); }
export function extraDazu(ort: 'pius' | 'niko', nr: string, name: string): string {
  const f = welt().nummerPruefen(nr); if (f) return f;
  aendern((S) => { S.extra.push({ id: nr, name: name || 'Weiterer Platz', ort }); S.betten[nr] = { g: null, s: 'frei' }; });
  toast('bett-plus', 'Platz ' + nr + ' hinzugefügt', (name || 'Weiterer Platz') + ' · ' + (ort === 'niko' ? 'rechts neben dem Saal' : 'unter „Weitere Plätze“'), 4000);
  return '';
}
export function extraUmbenennen(alt: string, neu: string, name: string): string {
  const f = welt().nummerPruefen(neu, alt); if (f) return f;
  aendern((S) => {
    if (neu !== alt) {
      (['betten', 'offBeds', 'notbett'] as const).forEach((k) => { const o = S[k] as Record<string, unknown>; if (o[alt] !== undefined) { o[neu] = o[alt]; delete o[alt]; } });
      S.extra.forEach((x) => { if (x.id === alt) x.id = neu; });
    }
    const x = S.extra.find((e) => e.id === neu); if (x && name) x.name = name;
  });
  ui({ modal: null });
  return '';
}
export function extraWeg(id: string): void { aendern((S) => { S.extra = S.extra.filter((x) => x.id !== id); delete S.lage[id]; delete S.betten[id]; delete S.offBeds[id]; delete S.notbett[id]; }); }
export function nummernTauschen(a: string, b: string): void {
  aendern((S, w) => { const pa = w.posOf(a), pb = w.posOf(b); S.lage[a] = pb; S.lage[b] = pa; if (S.lage[a] === a) delete S.lage[a]; if (S.lage[b] === b) delete S.lage[b]; });
  const t = getU().tausch; ui({ modal: null, tausch: t ? { ...t, a: null } : null });
  toast('tauschen', a + ' und ' + b + ' getauscht', 'Der Plan zeigt die Nummern an den neuen Plätzen.', 4000);
}
export function tauschZurueck(zimmer: string): void { aendern((S, w) => { w.alleBetten().forEach((b) => { if (b.zimmer === zimmer) delete S.lage[b.nr]; }); }); }
export function ampelSchwelle(d: number): void { aendern((S) => { S.ampel.gruen = Math.max(1, Math.min(10, S.ampel.gruen + d)); }); }
export function thema(t: 'auto' | 'tag' | 'nacht'): void { aendern((S) => { S.theme = t; }); }
export function offlineUmschalten(): void { aendern((S) => { S.sync.offline = !S.sync.offline; if (!S.sync.offline) { S.sync.ausstehend = 0; S.sync.zuletzt = uhr(); } }); }
export function jetztSynchronisieren(): void { ui({ syncLaeuft: true, modal: null }); setTimeout(() => { aendern((S) => { S.sync.ausstehend = 0; }); ui({ syncLaeuft: false }); }, 1600); }
export function teamSpeichern(team: ReturnType<typeof getS>['team'], leitungName: string): void { aendern((S) => { S.team = team; S.leitungName = leitungName; }); toast('check', 'Team gespeichert', team.filter((p) => p.aktiv).length + ' aktive Personen', 3000); }
export function codesSpeichern(admin: string, leitung: string): void { aendern((S) => { S.codes = { admin, leitung }; }); toast('schloss', 'Codes geändert', 'Gelten nur auf diesem Gerät.', 3000); }
export function scanSpeichern(sc: Scan, von: string): number {
  let korr = 0;
  aendern((S, w) => {
    sc.tage.forEach((t) => {
      S.dienstplan[t.datum] = [t.wahl[0], t.wahl[1]]; S.kueche[t.datum] = t.wahl[2];
      S.plan0[t.datum] = { nacht: [t.wahl[0], t.wahl[1]], kueche: t.wahl[2] };
      korr += t.wahl.filter((x, j) => x !== t.erkannt[j]).length;
    });
    S.planImporte[sc.monat] = { von, um: jetzt(w.H), dienste: sc.tage.length * 3, korrigiert: korr, quelle: sc.quelle };
  });
  return korr;
}
