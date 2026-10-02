// Aufnahme starten, Unterschrift nachholen, Schrittfolge und Pflichtprüfung je Schritt.
import { iso, plus } from '../../domain/datum';
import type { Gast } from '../../domain/typen';
import { aufnahmeHinweisAus } from '../../store/aktionen';
import { getS, getU, schliessen, ui, welt, zeige, type Wizard } from '../../store/store';
import { Knopf, T } from '../../ui/basis';
import { Dialog } from '../../ui/overlay';
import { darf } from '../anmeldung';

export const SCHRITTE = ['Person', 'Dauer', 'Sprache', 'Hausordnung', 'Datenschutz', 'Abschluss'];

export function aufnahmeStart(nr?: string): void {
  const w = welt();
  const frei = w.bettenHaus.filter((b) => !w.istAus(b.nr) && w.status(b.nr) === 'frei');
  ui({
    schnell: null, detail: null,
    wizard: { niko: !!nr && w.istNiko(nr), schritt: 0, nr: nr || frei[0]?.nr || '', suche: '', g: null, neu: { vorname: '', nachname: '', spitz: '' }, dauer: null, mitEnde: false, bis: iso(plus(w.H, 7)), sprache: null, sig: {}, verbotOk: false, grund: '', richtung: 1 },
  });
}
/** Hausordnung und Datenschutz nachträglich unterschreiben (aus Gastdetails oder Gästedatenbank). */
export function nachholenStart(gid: string): void {
  if (!darf()) return;
  const w = welt(), g = w.S.G[gid];
  ui({ modal: null, wizard: { nachholen: true, schritt: 2, g: gid, nr: w.bettVon(gid) || '', suche: '', neu: { vorname: '', nachname: '', spitz: '' }, dauer: 'mehr', mitEnde: false, bis: '', sprache: g.sprache, sig: {}, verbotOk: true, grund: '', richtung: 1 } });
}

export function wz(): Wizard { return getU().wizard!; }
export function wzSetzen(teil: Partial<Wizard>): void { const w = getU().wizard; if (w) ui({ wizard: { ...w, ...teil } }); }

export function brauchtUnterschrift(w: Wizard): boolean { const g = w.g ? getS().G[w.g] : null; return !(g && g.unterschrieben); }
export function schrittListe(w: Wizard): number[] { return w.nachholen ? [2, 3, 4, 5] : w.niko ? [0, 5] : brauchtUnterschrift(w) ? [0, 1, 2, 3, 4, 5] : [0, 1, 5]; }
export function schrittFertig(w: Wizard, i: number): boolean {
  const wl = welt();
  if (i === 0) return w.g ? !wl.hausverbot(wl.S.G[w.g]) || (w.verbotOk && !!w.grund.trim()) : !!(w.neu.vorname.trim() || w.neu.spitz.trim());
  if (i === 1) return !!w.dauer;
  if (i === 2) return !!w.sprache;
  if (i === 3) return !!(w.sig.hg && w.sig.hb);
  if (i === 4) return !!w.sig.dg;
  return true;
}
export function gastName(w: Wizard): string { return w.g ? getS().G[w.g].vorname : w.neu.vorname || w.neu.spitz || 'Gast'; }

/** Person aus der Suche übernehmen; Hinweise „bei Wiederaufnahme“ erscheinen sofort als Einblendung. */
export function gastWaehlen(g: Gast): void {
  wzSetzen({ g: g.id, verbotOk: false, grund: '', sprache: g.sprache });
  const hw = g.notizen.map((n, i) => ({ n, i })).filter((x) => x.n.aufnahme);
  if (!hw.length) return;
  zeige(
    <Dialog titel={'Hinweis zu ' + welt().anzeige(g)} knoepfe={<><Knopf text="Nicht mehr zeigen" klein onPress={() => hw.forEach((x) => aufnahmeHinweisAus(g.id, x.i))} /><Knopf text="Verstanden" art="primaer" klein testID="hinweis-verstanden" onPress={schliessen} /></>}>
      {hw.map((x) => <T key={x.i} art="text"><T art="stark">{x.n.von}: </T>{x.n.text}{x.n.quelle ? '\n' : ''}{x.n.quelle ? <T art="beschr">{x.n.quelle}</T> : null}</T>)}
    </Dialog>,
  );
}
