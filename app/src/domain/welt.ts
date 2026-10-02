// Fachregeln als reine Ableitungen aus dem Zustand (Designsystem › Fachregeln). Keine Seiteneffekte.
import { iso, kurz, mKey, pd, plus, tageVon, tageZwischen } from './datum';
import { GR, GR_NIKO, HAUS_BASIS, NIKO_BASIS, ORT_BASIS, ROLLEN, STUFE_RE, type Zimmer } from './haus';
import type { ArchivEintrag, Bereich, Bericht, BettStatus, Einsatz, Gast, Hinweis, Nachweis, NachweisZeile, PlanTag, Sanktion, State, Stufe } from './typen';

export interface BettInfo { nr: string; zimmer: string }
export interface Erinnerung { sym: string; text: string; klein: string; warn?: boolean; ziel: { art: 'bett'; nr: string } | { art: 'bad' } | { art: 'dusche' } | { art: 'dienst' } | { art: 'unterschrift' } }
export interface Absatz { idx: number; stufe: Stufe | null; text: string; genannt: Gast[]; ziel: Gast | null; rest: Gast[] }
export interface Erkannt { erw: Gast[]; mehrdeutig: { name: string; kandidaten: Gast[] }[]; absaetze: Absatz[] }

function alleBetten(plan: Zimmer[]): BettInfo[] {
  const out: BettInfo[] = [];
  plan.forEach((z) => z.teile.forEach((t) => t.forEach((x) => (Array.isArray(x) ? x : [x]).forEach((y) => out.push({ nr: y, zimmer: z.id })))));
  return out;
}

export class Welt {
  readonly haus: Zimmer[];
  readonly niko: Zimmer[];
  readonly bettenHaus: BettInfo[];
  readonly bettenNiko: BettInfo[];
  readonly zimmerVon: Record<string, string> = {};
  readonly ort: Record<string, string>;
  readonly stock: Record<string, 'oben' | 'unten'> = {};
  readonly hIso: string;

  constructor(readonly S: State, readonly H: Date, readonly tag: number = 0) {
    this.hIso = iso(H);
    this.ort = { ...ORT_BASIS };
    S.extra.forEach((x) => { this.ort[x.id] = x.name; });
    this.haus = HAUS_BASIS.map((z) => (z.id === 'X' ? { ...z, teile: [S.extra.filter((x) => x.ort !== 'niko').map((x) => x.id)] } : z));
    this.niko = NIKO_BASIS.map((z) => (z.id === 'NX' ? { ...z, teile: [S.extra.filter((x) => x.ort === 'niko').map((x) => x.id)] } : z));
    this.bettenHaus = alleBetten(this.haus);
    this.bettenNiko = alleBetten(this.niko);
    this.bettenHaus.concat(this.bettenNiko).forEach((b) => { this.zimmerVon[b.nr] = b.zimmer; });
    HAUS_BASIS.concat(NIKO_BASIS).forEach((z) => z.teile.forEach((t) => t.forEach((x) => { if (Array.isArray(x)) { this.stock[x[0]] = 'oben'; this.stock[x[1]] = 'unten'; } })));
  }

  // ---------- Zeit ----------
  tagDatum(): Date { return plus(this.H, this.tag); }
  vergangen(): boolean { return this.tag < 0; }
  alleBetten(): BettInfo[] { return this.bettenHaus.concat(this.bettenNiko); }

  // ---------- Betten ----------
  gastVon(nr: string): Gast | null { const b = this.S.betten[nr]; return b && b.g ? this.S.G[b.g] || null : null; }
  istAus(nr: string): boolean { return !!(this.S.offBeds[nr] || this.S.offRooms[this.zimmerVon[nr]]); }
  status(nr: string): BettStatus {
    if (this.istAus(nr)) return 'aus';
    const b = this.S.betten[nr], s = b ? b.s : 'frei';
    if (this.tag < 0 && b && b.g && ['erwartet', 'anwesend', 'fehlt', 'fehlt2'].includes(s)) {
      // Vergangene Nächte: wer heute erwartet wird, war da; wer schon gestern fehlte, fehlte
      return this.tag === -1 && (s === 'fehlt2' || b.vorher) ? 'fehlt' : 'anwesend';
    }
    return s;
  }
  /** frei im Sinne der Zählung: frei, frei bis Rückkehr, ab der 2. Nacht unentschuldigt */
  zaehlt(nr: string): boolean { const s = this.status(nr); return s === 'frei' || s === 'freibis' || s === 'fehlt2'; }
  belegtKht(nr: string): boolean { const s = this.status(nr); return s === 'anwesend' || s === 'erwartet' || s === 'fehlt' || s === 'gehalten'; }
  bettVon(gid: string): string | null { return Object.keys(this.S.betten).find((n) => this.S.betten[n].g === gid && !this.istAus(n) && this.status(n) !== 'fehlt2') || null; }
  posOf(nr: string): string { return this.S.lage[nr] || nr; }
  anPlatz(platz: string): string { return Object.keys(this.S.lage).find((n) => this.S.lage[n] === platz) || platz; }
  lageVon(nr: string): 'oben' | 'unten' | undefined { return this.stock[this.posOf(nr)]; }
  ortText(nr: string): string { return (this.ort[nr] || '') + (this.S.notbett[nr] ? (this.ort[nr] ? ' · ' : '') + 'Notbett' : ''); }
  istNiko(nr: string): boolean { const z = this.zimmerVon[nr]; return z === 'N' || z === 'NX'; }
  raumZahl(id: string): string {
    const akt = this.alleBetten().filter((b) => b.zimmer === id && !this.istAus(b.nr));
    return this.S.offRooms[id] ? 'gesperrt' : akt.filter((b) => this.zaehlt(b.nr)).length + ' von ' + akt.length + ' frei';
  }
  statusWort(nr: string): string { return ({ anwesend: 'da', erwartet: 'erwartet', fehlt: 'fehlt', gehalten: 'freigehalten', freibis: 'abwesend' } as Record<string, string>)[this.status(nr)] || this.status(nr); }

  // ---------- Zahlen für das Kältehilfetelefon und die Ampel ----------
  /** Notbetten werden nur über den Kältebus belegt: belegt zählen sie mit, frei nicht. */
  khtZahlen() {
    const alle = this.alleBetten().filter((b) => !this.istAus(b.nr) && (!this.S.notbett[b.nr] || this.belegtKht(b.nr)));
    const belegt = alle.filter((b) => this.belegtKht(b.nr)).length;
    return { gesamt: alle.length, belegt, frei: alle.length - belegt };
  }
  kennzahlen() {
    const k = this.khtZahlen();
    const haus = this.bettenHaus.filter((b) => !this.istAus(b.nr)), niko = this.bettenNiko.filter((b) => !this.istAus(b.nr));
    const zahl = (l: BettInfo[], s: BettStatus) => l.filter((b) => this.status(b.nr) === s).length;
    const ampel: 'gruen' | 'gelb' | 'rot' = k.frei >= this.S.ampel.gruen ? 'gruen' : k.frei >= 1 ? 'gelb' : 'rot';
    return { ...k, ampel, haus: haus.length, anwesendHaus: zahl(haus, 'anwesend'), erwartet: zahl(haus, 'erwartet'), freiHaus: haus.filter((b) => this.zaehlt(b.nr)).length, niko: niko.length, nikoBelegt: niko.filter((b) => !this.zaehlt(b.nr)).length };
  }

  // ---------- Gäste ----------
  gaeste(): Gast[] { return Object.values(this.S.G); }
  gleicherVorname(g: Gast): boolean { const v = g.vorname.toLowerCase(); return this.gaeste().some((x) => x.id !== g.id && x.vorname.toLowerCase() === v); }
  zusatz(g: Gast): string { const b = this.bettVon(g.id); return b ? b : g.nachname ? g.nachname : g.spitz ? '„' + g.spitz + '“' : g.nr ? 'Nr. ' + g.nr.slice(-4) : 'ohne Bett'; }
  /** Anzeigename: bei gleichen Vornamen mit Bettnummer, sonst Nachname, Spitzname oder Aufnahmenummer. */
  anzeige(g: Gast): string { return g.vorname + (this.gleicherVorname(g) ? ' (' + this.zusatz(g) + ')' : ''); }
  vollName(g: Gast): string { return g.vorname + (g.nachname ? ' ' + g.nachname : ''); }
  lausTage(g: Gast): number { return g.laus !== 'fehlt' || !g.lausSeit ? 0 : tageZwischen(pd(g.lausSeit), this.H); }
  aktivSank(g: Gast): Sanktion[] { return g.sanktionen.filter((s) => !s.aufgehoben && (!s.bis || s.bis >= this.hIso)); }
  hausverbot(g: Gast): Sanktion | undefined { return this.aktivSank(g).find((s) => s.stufe === 'Hausverbot'); }
  duschSlot(gid: string): string | null { const d = this.S.dusche[iso(this.tagDatum())] || {}; return Object.keys(d).find((k) => d[k].g === gid && d[k].s === 'geplant') || null; }
  pdfName(g: Gast): string { return (g.nr ? g.nr.slice(-4) : '0000') + '_' + g.vorname + (g.nachname ? '_' + g.nachname : '') + '_' + (g.unterschriebenAm || g.erste) + '.pdf'; }
  vornameDoppelt(v: string): Gast[] { v = (v || '').trim().toLowerCase(); return v ? this.gaeste().filter((g) => g.vorname.toLowerCase() === v) : []; }
  /** Symbole auf der Bettkarte */
  bettSymbole(nr: string, kompakt: boolean): { symbole: string[]; warn: boolean } {
    const g = this.gastVon(nr), s = this.status(nr), sym: string[] = [];
    let warn = false;
    if (g && s !== 'aus' && s !== 'fehlt2') {
      const lt = this.lausTage(g);
      if (g.laus === 'fehlt') sym.push(lt >= 3 ? 'warnung' : 'laeuseschein-fehlt');
      if (lt >= 3 && !(g.lausFrist && g.lausFrist >= this.hIso)) warn = true;
      const a = this.aktivSank(g);
      if (a.some((x) => x.stufe === 'Hausverbot')) sym.push('karte-rot');
      else if (a.some((x) => x.stufe === 'Gelbe Karte')) sym.push('karte-gelb');
      if (g.notizen.length && !kompakt) sym.push('notiz');
      if (this.duschSlot(g.id)) sym.push('dusche');
    }
    return { symbole: sym.slice(0, kompakt ? 2 : 4), warn };
  }

  // ---------- Bad ----------
  duschenOffen(): string[] { const d = this.S.dusche[this.hIso] || {}; return Object.keys(d).sort().filter((z) => d[z].s === 'geplant').map((z) => z + ' ' + (this.S.G[d[z].g]?.vorname || '')); }
  badZu(): boolean { const e = this.S.bad[iso(this.tagDatum())]; return e ? e.zu : this.tag === 0; }
  badZustand(): 'zu' | 'erinnern' | 'frei' { return !this.badZu() ? 'frei' : this.tag === 0 && this.duschenOffen().length === 0 ? 'erinnern' : 'zu'; }
  tuerenZu(): Record<string, boolean> {
    const o = this.S.offRooms;
    return { D: !!o.D, T: !!o.T, F: !!o.F, B: !!o.B, FLUR: !!(o.T && o.F), BAD: this.badZu() };
  }

  // ---------- Team und Anmeldung ----------
  team(bereich?: Bereich): string[] { return this.S.team.filter((p) => p.aktiv && (!bereich || p.bereiche.includes(bereich))).map((p) => p.name); }
  bericht(d?: string): Bericht | undefined { return this.S.berichte[d || iso(this.tagDatum())]; }
  /** Diensthabende Betreuungspersonen heute (aus der Besetzung, sonst aus dem Dienstplan) */
  diensthabende(): { name: string; unterschrieben: boolean; index: number }[] {
    const b = this.S.berichte[this.hIso];
    if (b) return b.besetzung.map((x, i) => ({ name: x.name, unterschrieben: !!x.sig, index: i, rolle: x.rolle })).filter((x) => x.rolle !== 'Küche' && x.name !== 'offen');
    return (this.S.dienstplan[this.hIso] || []).filter(Boolean).map((name, i) => ({ name, unterschrieben: false, index: i }));
  }
  /** Wer gerade handelt – nur gültig am heutigen Diensttag. */
  angemeldet(): { name: string; leitung: boolean } | null {
    const a = this.S.anmeldung;
    if (!a || a.datum !== this.hIso) return null;
    if (a.leitung) return { name: a.name, leitung: true };
    return this.diensthabende().some((d) => d.name === a.name && d.unterschrieben) ? { name: a.name, leitung: false } : null;
  }
  /** Ändern darf nur, wer heute im Dienst ist und unterschrieben hat, oder die Leitung mit Code; nie an vergangenen Tagen. */
  darfAendern(): boolean { return this.tag === 0 && !!this.angemeldet(); }
  /** Name für Vermerke. Ohne Anmeldung (nur bei Handlungen mit Admin-PIN möglich) steht dort „Admin-PIN“. */
  aktivePerson(): string { return this.angemeldet()?.name || 'Admin-PIN'; }

  // ---------- Erinnerungen (Glocke) ----------
  erinnerungen(): Erinnerung[] {
    const out: Erinnerung[] = [];
    this.bettenHaus.forEach((b) => {
      const g = this.gastVon(b.nr), s = this.status(b.nr);
      if (g && g.laus === 'fehlt' && !['aus', 'frei', 'freibis'].includes(s)) {
        const t = this.lausTage(g);
        if (t >= 1) out.push({ sym: t >= 3 ? 'warnung' : 'laeuseschein-fehlt', warn: true, text: 'Läuseschein · ' + g.vorname + ', ' + b.nr, klein: t >= 3 ? 'fehlt seit ' + t + ' Tagen' : 'Tag ' + (t + 1), ziel: { art: 'bett', nr: b.nr } });
      }
    });
    this.alleBetten().forEach((b) => {
      if (this.status(b.nr) === 'fehlt2') { const g = this.gastVon(b.nr)!; out.push({ sym: 'abwesend', warn: true, text: g.vorname + ', ' + b.nr + ' fehlt ' + (this.S.betten[b.nr].n || 2) + '. Nacht', klein: 'unentschuldigt · Bett zählt als frei', ziel: { art: 'bett', nr: b.nr } }); }
    });
    // Erinnerung „Unterschrift nachholen“: abgeschlossene Berichte ohne Unterschrift einer heute diensthabenden Person
    const heuteDa = new Set(this.diensthabende().map((d) => d.name).concat(this.S.kueche[this.hIso] ? [this.S.kueche[this.hIso]] : []));
    Object.keys(this.S.berichte).filter((d) => d < this.hIso || (d === this.hIso && this.S.berichte[d].status === 'abgeschlossen')).forEach((d) => {
      const b = this.S.berichte[d];
      if (b.status !== 'abgeschlossen') return;
      b.besetzung.filter((x) => !x.sig && x.name !== 'offen' && heuteDa.has(x.name)).forEach((x) => out.push({ sym: 'unterschrift', warn: true, text: 'Unterschrift nachholen · ' + x.name, klein: 'Bericht vom ' + kurz(pd(d)) + ' · ' + x.rolle, ziel: { art: 'unterschrift' } }));
    });
    this.S.hinweise.filter((h) => h.neu).forEach((h) => out.push({ sym: 'bericht', text: 'Neuer Hinweis von ' + h.von, klein: h.text.slice(0, 48) + '…', ziel: { art: 'dienst' } }));
    this.S.termine.filter((x) => x.datum === this.hIso && x.art === 'Bettwäsche').forEach((x) => out.push({ sym: 'wiederholen', warn: true, text: x.titel, klein: 'Bettwäschewechsel heute · wichtiger Hinweis', ziel: { art: 'dienst' } }));
    if (this.tag === 0 && this.badZustand() === 'erinnern') out.push({ sym: 'schloss-offen', warn: true, text: 'Bad aufschließen', klein: 'Alle haben geduscht · im Grundriss auf das Bad tippen', ziel: { art: 'bad' } });
    const d = this.S.dusche[this.hIso] || {};
    Object.keys(d).sort().forEach((k) => { if (d[k].s === 'geplant') out.push({ sym: 'dusche', text: 'Dusche ' + k + ' · ' + (this.S.G[d[k].g]?.vorname || ''), klein: 'Duschplan', ziel: { art: 'dusche' } }); });
    return out;
  }

  // ---------- Bericht ----------
  passt(g: Gast, z: string): boolean { return z === this.bettVon(g.id) || this.S.betten[z]?.g === g.id || z === g.nachname || z === g.spitz || z === '„' + g.spitz + '“' || (!!g.nr && z === 'Nr. ' + g.nr.slice(-4)); }
  /** @Vorname oder @Vorname (Bett) erkennen; ein Absatz mit Stufenwort am Anfang legt genau EINE Sanktion an. */
  erkennen(text: string, ziele?: Record<string, string>): Erkannt {
    const out: Erkannt = { erw: [], mehrdeutig: [], absaetze: [] }, alle = this.gaeste();
    (text || '').split(/\n/).forEach((abs, idx) => {
      const genannt: Gast[] = [];
      abs.replace(/@([A-Za-zÄÖÜäöüß-]+)(?:\s?\(([^)\n]{1,24})\))?/g, (_m, n: string, z?: string) => {
        const k = alle.filter((x) => x.vorname.toLowerCase() === n.toLowerCase());
        let g: Gast | null = null;
        if (z) g = k.find((x) => this.passt(x, z)) || null;
        if (!g && k.length === 1) g = k[0];
        if (!g && k.length > 1) { if (!out.mehrdeutig.some((m) => m.name.toLowerCase() === n.toLowerCase())) out.mehrdeutig.push({ name: n, kandidaten: k }); return ''; }
        if (g && !genannt.includes(g)) genannt.push(g);
        if (g && !out.erw.includes(g)) out.erw.push(g);
        return '';
      });
      const m = STUFE_RE.exec(abs);
      if (m && genannt.length) {
        const st: Stufe = /rote|haus/i.test(m[1]) ? 'Hausverbot' : /gelb/i.test(m[1]) ? 'Gelbe Karte' : 'Verwarnung';
        const wahl = ziele && ziele[idx];
        const ziel = wahl === 'keiner' ? null : genannt.find((g) => g.id === wahl) || genannt[0];
        out.absaetze.push({ idx, stufe: st, text: abs.trim(), genannt, ziel, rest: genannt.filter((g) => g !== ziel) });
      } else if (genannt.length) out.absaetze.push({ idx, stufe: null, text: abs.trim(), genannt, ziel: null, rest: genannt });
    });
    return out;
  }
  abwesenheiten(): { nr: string; text: string; warn: boolean; sym: string; gast: Gast }[] {
    return this.alleBetten().filter((x) => ['gehalten', 'freibis', 'fehlt', 'fehlt2'].includes(this.status(x.nr))).map((x) => {
      const g = this.gastVon(x.nr)!, s = this.status(x.nr), bb = this.S.betten[x.nr];
      const text = s === 'gehalten' ? 'freigehalten bis ' + kurz(pd(bb.bis!)) : s === 'freibis' ? 'frei bis ' + kurz(pd(bb.bis!)) : s === 'fehlt' ? 'fehlt unentschuldigt, 1. Nacht' : 'fehlt ' + (bb.n || 2) + '. Nacht in Folge, Bett zählt als frei';
      return { nr: x.nr, text, warn: s === 'fehlt' || s === 'fehlt2', sym: s === 'gehalten' ? 'schloss' : s === 'freibis' ? 'rueckkehr' : 'abwesend', gast: g };
    });
  }
  pflichtText(b: Bericht): string {
    const fehlt: string[] = [], ohne = b.besetzung.filter((x) => x.name !== 'offen' && !x.sig).map((x) => x.name);
    if (b.f.kht == null) fehlt.push('KHT-Anruf');
    this.erkennen(b.f.hinweise, b.f.ziele).mehrdeutig.forEach((m) => fehlt.push('@' + m.name + ' eindeutig machen'));
    if (b.f.vorfall == null) fehlt.push('Vorfälle');
    const u = ohne.length ? 'Unterschrift ' + ohne.join(', ') + ' fehlt (geht auch ohne)' : '';
    return fehlt.length ? 'Es fehlt: ' + fehlt.join(', ') + (u ? '. ' + u : '') : u || 'Alles ausgefüllt.';
  }
  berichtOffenPflicht(b: Bericht): boolean { return b.f.kht == null || b.f.vorfall == null || this.erkennen(b.f.hinweise, b.f.ziele).mehrdeutig.length > 0; }

  // ---------- Hinweise ----------
  hinweisAktiv(h: Hinweis, di: string): boolean { return !h.beendet && (h.ab || '') <= di && h.bis >= di; }
  naechsterDienst(): Date { const b = this.S.berichte[this.hIso]; return b && b.status === 'abgeschlossen' ? plus(this.H, 1) : this.H; }
  dauerText(a: string, ab: Date): string { if (a === '0') return 'Nur hier im Archiv.'; if (a === 'datum') return 'Bis einschließlich dem gewählten Tag.'; const bis = plus(ab, +a - 1); return +a === 1 ? 'Nur im Dienst am ' + kurz(ab) : 'Vom ' + kurz(ab) + ' bis ' + kurz(bis) + ' (' + a + ' Dienste)'; }
  zeitraum(h: Hinweis): string { if (h.ab === h.bis) return 'nur am ' + kurz(pd(h.bis)); return (h.ab && h.ab > this.hIso ? 'ab ' + kurz(pd(h.ab)) + ' ' : '') + 'bis ' + kurz(pd(h.bis)); }

  // ---------- Archiv ----------
  archivEintraege(): ArchivEintrag[] {
    const out = this.S.archiv.slice(), b = this.S.berichte[this.hIso];
    if (b && b.status === 'abgeschlossen') out.push({ datum: this.hIso, vorfall: b.f.vorfall === 'ja', personen: b.besetzung.map((x) => x.name).join(', '), text: b.f.hinweise || '–', fehlt: b.f.fehlt, fehltText: b.f.fehltText, fragen: b.f.fragen, kommentare: b.kommentare || [], heute: true });
    return out.sort((x, y) => (x.datum < y.datum ? 1 : -1));
  }
  /** Gäste, die in einem Text vorkommen: @Vorname (Bett), Vorname (Bett), Vorname Nachname oder eindeutiges @Vorname */
  genannteGaeste(text: string): Gast[] {
    return this.gaeste().filter((g) => {
      const bett = this.bettVon(g.id);
      return (bett && text.includes(g.vorname + ' (' + bett + ')')) || (g.nachname && text.includes(g.vorname + ' ' + g.nachname)) || (!this.gleicherVorname(g) && new RegExp('@' + g.vorname + '(?![A-Za-zÄÖÜäöüß])').test(text));
    });
  }
  fehltListe(a: { fehlt?: string[]; fehltText?: string }): string[] { return (a.fehlt || []).concat(a.fehltText ? [a.fehltText] : []); }

  // ---------- Monatsabschluss ----------
  planAm(di: string): PlanTag { return this.S.plan0[di] || { nacht: this.S.dienstplan[di] || [], kueche: this.S.kueche[di] || '' }; }
  imBereich(rolle: string, b: Bereich): boolean { return b === 'kueche' ? rolle === 'Küche' : rolle.indexOf('Betreuung') === 0; }
  rollenGeplant(di: string, name: string, b: Bereich): string[] {
    const p = this.planAm(di), r: string[] = [];
    if (b === 'kueche') { if (p.kueche === name) r.push('Küche'); } else p.nacht.forEach((n, i) => { if (n === name) r.push('Betreuung ' + (i + 1)); });
    return r;
  }
  einsaetzeAm(di: string): Einsatz[] {
    const b = this.S.berichte[di];
    if (b) return b.besetzung.filter((x) => x.sig && x.name !== 'offen').map((x) => ({ name: x.name, rolle: x.rolle, geplant: x.geplant || x.name, grund: x.grund || '' }));
    return this.S.einsaetze[di] || [];
  }
  nachweisDaten(k: string, name: string, b: Bereich): { zeilen: NachweisZeile[]; sum: { geplant: number; gemacht: number; abgegeben: number; vertretung: number } } {
    const zeilen: NachweisZeile[] = [], sum = { geplant: 0, gemacht: 0, abgegeben: 0, vertretung: 0 }, h = this.hIso;
    tageVon(k).forEach((di) => {
      const gp = this.rollenGeplant(di, name, b), es = this.einsaetzeAm(di).filter((e) => this.imBereich(e.rolle, b));
      const selbst = es.filter((e) => e.name === name), fuer = es.filter((e) => e.geplant === name && e.name !== name);
      if (!gp.length && !selbst.length) return;
      const z: NachweisZeile = { datum: di, geplant: gp.length > 0, gemacht: selbst.length > 0, rolle: selbst[0]?.rolle || gp[0], text: '' };
      if (z.geplant) sum.geplant++;
      if (z.gemacht) {
        sum.gemacht++;
        const v = selbst.find((e) => e.geplant !== name);
        if (v) { sum.vertretung++; z.abw = true; z.text = 'Vertretung für ' + v.geplant + (v.grund === 'Sonstiges' ? ' · Sonstiges' : ''); }
      } else if (di < h) {
        const e = fuer[0];
        z.abw = true;
        if (e) { sum.abgegeben++; z.text = 'abgegeben an ' + e.name + (e.grund === 'Sonstiges' ? ' · Sonstiges' : ''); } else z.text = 'ohne Unterschrift im Bericht';
      } else if (di === h) z.text = 'heute · zählt, sobald im Bericht unterschrieben';
      else z.text = 'geplant';
      zeilen.push(z);
    });
    return { zeilen, sum };
  }
  personenIm(k: string, b: Bereich): string[] {
    const n = new Set<string>();
    tageVon(k).forEach((di) => {
      const p = this.planAm(di);
      (b === 'kueche' ? [p.kueche] : p.nacht).forEach((x) => { if (x) n.add(x); });
      this.einsaetzeAm(di).forEach((e) => { if (this.imBereich(e.rolle, b)) n.add(e.name); });
    });
    const reihe = this.S.team.map((p) => p.name);
    return [...n].sort((a, c) => ((reihe.indexOf(a) + 99) % 99) - ((reihe.indexOf(c) + 99) % 99) || a.localeCompare(c));
  }
  letzterGeplanter(k: string, name: string, b: Bereich): string | null { const t = tageVon(k).filter((di) => this.rollenGeplant(di, name, b).length); return t[t.length - 1] || null; }
  nachweisVon(k: string, name: string, b: Bereich): Nachweis | null { return this.S.nachweise[k]?.[b]?.[name] || null; }
  nachweisPdf(k: string, name: string, b: Bereich): string { return k + '_Dienstnachweis_' + (b === 'kueche' ? 'Kueche' : 'Betreuung') + '_' + name + '.pdf'; }
  /** Banner beim letzten geplanten Dienst des Monats (freiwillig) */
  letzterDienstHeute(): { name: string; bereich: Bereich }[] {
    if (this.tag !== 0) return [];
    const k = mKey(this.H), h = this.hIso;
    const wer: { name: string; bereich: Bereich }[] = (this.S.dienstplan[h] || []).filter(Boolean).map((name) => ({ name, bereich: 'betreuung' as Bereich }));
    if (this.S.kueche[h]) wer.push({ name: this.S.kueche[h], bereich: 'kueche' });
    return wer.filter((x) => this.letzterGeplanter(k, x.name, x.bereich) === h && !this.nachweisVon(k, x.name, x.bereich));
  }

  // ---------- Kalender ----------
  dienstRollen(di: string): [string, string, string][] {
    const dp = this.S.dienstplan[di] || ['', ''], o = this.planAm(di);
    return [[ROLLEN[0], dp[0] || '', o.nacht?.[0] || ''], [ROLLEN[1], dp[1] || '', o.nacht?.[1] || ''], [ROLLEN[2], this.S.kueche[di] || '', o.kueche || '']];
  }
  aenderungenVon(di: string, rolle: string) { return this.S.planAenderungen.filter((a) => a.datum === di && a.rolle === rolle); }
  dienstGeaendert(di: string, r: [string, string, string]): boolean { return this.aenderungenVon(di, r[0]).length > 0 || (!!this.S.plan0[di] && r[1] !== r[2]); }

  // ---------- Einstellungen ----------
  naechsteNummer(p: 'N' | 'Z'): string { let n = p === 'N' ? 9 : 1; while (this.zimmerVon[p + n]) n++; return p + n; }
  nummerPruefen(neu: string, alt?: string): string {
    if (!/^[A-Za-zÄÖÜäöü0-9-]{1,6}$/.test(neu)) return 'Nummer: 1–6 Zeichen, Buchstaben und Ziffern.';
    if (neu !== alt && (this.zimmerVon[neu] || this.S.betten[neu])) return 'Die Nummer ' + neu + ' gibt es schon.';
    return '';
  }
  geometrie() { return { pius: GR, niko: GR_NIKO }; }
}

export function stufeSym(st: string): string { return st === 'Hausverbot' ? 'karte-rot' : st === 'Gelbe Karte' ? 'karte-gelb' : 'verwarnung'; }
export function naechteText(n: number): string { return n === 1 ? '1 Nacht' : n + ' Nächte'; }
export function aehnlich(a: string, b: string): boolean { if (a.length < 3) return false; let d = 0; for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) d++; return d <= 1 && Math.abs(a.length - b.length) <= 1; }
export function scanDaten(k: string) {
  const betr = ['Kim', 'Sam', 'Robin', 'Chris'], ku = ['Jule', 'Mika'];
  return tageVon(k).map((datum, n) => {
    const foto = [betr[n % 4], betr[(n + 1) % 4], ku[n % 2]];
    if (n % 7 === 6) foto[1] = '';
    const erkannt = foto.slice(), unsicher = [false, false, false];
    if (n === 4) { foto[1] = 'Jule'; erkannt[1] = 'Sam'; unsicher[1] = true; foto[2] = erkannt[2] = 'Mika'; }
    if (n === 10) unsicher[0] = true;
    if (n === 17) { erkannt[2] = ''; unsicher[2] = true; }
    if (n === 23) unsicher[1] = true;
    return { datum, foto, erkannt, wahl: erkannt.slice(), unsicher, geprueft: unsicher.map((u) => !u) };
  });
}
