// PDFs aus HTML (expo-print): Aufnahme, Dienstbericht, Dienstnachweis. Teilen über den System-Dialog (expo-sharing).
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { kurz, lang, monatName, pd, wochentagKurz } from '../domain/datum';
import { SPRACHE, TEXTE } from '../domain/haus';
import type { Bereich, Gast, Unterschrift } from '../domain/typen';
import type { Welt } from '../domain/welt';
import { toast } from '../store/store';

const esc = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sigSvg = (s: Unterschrift | null | undefined, h = 48) => (s ? `<svg height="${h}" viewBox="0 0 ${s.w} ${s.h}" style="width:auto;max-width:100%"><path d="${esc(s.d)}" fill="none" stroke="#1B3A8C" stroke-width="${Math.max(2, s.w / 140)}" stroke-linecap="round" stroke-linejoin="round"/></svg>` : '');
const BEREICH_NAME: Record<Bereich, string> = { betreuung: 'Betreuung', kueche: 'Küche' };

function seite(titel: string, inhalt: string): string {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(titel)}</title><style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: -apple-system, "Helvetica Neue", Roboto, Arial, sans-serif; color: #1d1c19; font-size: 11.5pt; line-height: 1.45; }
  h1 { font-size: 17pt; margin: 0 0 2mm; } h2 { font-size: 13pt; margin: 6mm 0 2mm; }
  .unter { color: #555; margin: 0 0 5mm; }
  table { width: 100%; border-collapse: collapse; margin: 3mm 0; }
  th, td { text-align: left; vertical-align: top; padding: 2mm 2.5mm; border-bottom: 0.3mm solid #cfcac0; }
  th { width: 34%; color: #444; font-weight: 600; }
  .zahl { text-align: right; font-variant-numeric: tabular-nums; }
  .abw td { background: #fff4d6; }
  .stempel { border: 0.8mm solid #b3261e; color: #b3261e; font-weight: 700; padding: 2mm 4mm; display: inline-block; transform: rotate(-2deg); margin-bottom: 4mm; }
  .fehlt { color: #b3261e; font-weight: 600; }
  .sig { display: flex; gap: 10mm; margin-top: 6mm; } .sig div { flex: 1; border-top: 0.3mm solid #555; padding-top: 1mm; font-size: 9.5pt; color: #444; }
  .zwei { display: flex; gap: 6mm; } .zwei > div { flex: 1; }
  .rtl { direction: rtl; text-align: right; }
  .klein { font-size: 9pt; color: #666; }
  </style></head><body>${inhalt}</body></html>`;
}

/** PDF anzeigen bzw. teilen. Web: neues Fenster mit Druckansicht. */
export async function pdfTeilen(html: string, dateiname: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      const fenster = (globalThis as unknown as { open?: (u: string) => { document: { write: (h: string) => void; close: () => void } } | null }).open?.('');
      if (fenster) { fenster.document.write(html); fenster.document.close(); }
      return;
    }
    const { uri } = await Print.printToFileAsync({ html });
    const ziel = new File(Paths.cache, dateiname);
    if (ziel.exists) ziel.delete();
    new File(uri).moveSync(ziel);
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(ziel.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: dateiname });
    else await Print.printAsync({ uri: ziel.uri });
  } catch (e) {
    toast('warnung', 'PDF nicht möglich', String((e as Error)?.message || e), 5000);
  }
}

// ---------- Aufnahme ----------
function einsetzen(t: string, w: Welt, g: Gast, bett: string, betreuung: string): string {
  return esc(t).replace('{GAST}', '<b>' + esc(g.vorname) + '</b>').replace('{BETT}', '<b>' + esc(bett) + '</b>').replace('{DATUM}', '<b>' + kurz(pd(g.unterschriebenAm || w.hIso)) + pd(g.unterschriebenAm || w.hIso).getFullYear() + '</b>').replace('{BETREUER}', '<b>' + esc(betreuung) + '</b>');
}
export function aufnahmeHtml(w: Welt, g: Gast): string {
  const bett = w.bettVon(g.id) || '–', betreuung = g.sig?.betreuung || w.aktivePerson();
  const ho = TEXTE.hausordnung.de, ue = g.uebersetzung ? TEXTE.hausordnung[g.uebersetzung] : null, ds = TEXTE.datenschutz.de;
  return seite(w.pdfName(g), `
  <h1>Notübernachtung · Aufnahme</h1>
  <p class="unter">${esc(w.vollName(g))}${g.spitz ? ' „' + esc(g.spitz) + '“' : ''} · Aufnahme ${esc(g.nr || '–')} · ${g.unterschriebenAm ? 'unterschrieben am ' + kurz(pd(g.unterschriebenAm)) + pd(g.unterschriebenAm).getFullYear() : ''}</p>
  <div class="zwei">
    <div><h2>${esc(ho[0])} (Deutsch, unterschrieben)</h2><p>${einsetzen(ho[1], w, g, bett, betreuung)}</p></div>
    ${ue ? `<div class="${g.uebersetzung === 'ar' || g.uebersetzung === 'fa' ? 'rtl' : ''}"><h2>${esc(ue[0])}</h2><p>${einsetzen(ue[1], w, g, bett, betreuung)}</p><p class="klein">Übersetzung ${esc(SPRACHE[g.uebersetzung!][2])} zum Verständnis, nicht unterschrieben.</p></div>` : ''}
  </div>
  <div class="sig"><div>${sigSvg(g.sig?.hg)}<br>Gast: ${esc(g.vorname)}</div><div>${sigSvg(g.sig?.hb)}<br>Betreuung: ${esc(betreuung)}</div></div>
  <h2 style="margin-top:10mm">${esc(ds[0])}</h2><p>${esc(ds[1])}</p>
  <div class="sig"><div>${sigSvg(g.sig?.dg)}<br>Gast: ${esc(g.vorname)}</div><div style="border:0"></div></div>`);
}
export function aufnahmePdf(w: Welt, g: Gast): Promise<void> { return pdfTeilen(aufnahmeHtml(w, g), w.pdfName(g)); }

// ---------- Dienstbericht ----------
export function berichtDatei(datum: string): string { return datum + '_Dienstbericht.pdf'; }
export function berichtHtml(w: Welt, datum: string): string {
  const b = w.S.berichte[datum]; if (!b) return seite('Dienstbericht', '<p>Kein Bericht.</p>');
  const f = b.f, ohne = b.ohneUnterschrift || [], jn = (x: string | null) => (x === 'ja' ? 'Ja' : x === 'nein' ? 'Nein' : '–');
  const zeile = (name: string, wert: string) => `<tr><th>${esc(name)}</th><td>${wert ? esc(wert).replace(/\n/g, '<br>') : '–'}</td></tr>`;
  const alleDa = b.besetzung.every((x) => x.name === 'offen' || x.sig);
  return seite(berichtDatei(datum), `
  ${ohne.length ? `<div class="stempel">Ohne Unterschrift abgeschlossen: ${esc(ohne.join(', '))}${alleDa ? ' · nachgeholt' : ''}</div>` : ''}
  <h1>Dienstbericht Notübernachtung</h1>
  <p class="unter">${esc(lang(pd(datum)))} ${pd(datum).getFullYear()} · begonnen ${esc(b.begonnen)}${b.zuUm ? ' · abgeschlossen ' + esc(b.zuUm) : ' · noch offen'}</p>
  <table><tbody>${b.besetzung.map((x) => `<tr><th>${esc(x.rolle)}</th><td>${esc(x.name)}${x.geplant && x.geplant !== x.name ? ' <span class="klein">(geplant ' + esc(x.geplant) + (x.grund ? ', ' + esc(x.grund) : '') + ')</span>' : ''}</td><td>${x.sig ? sigSvg(x.sig, 36) + (ohne.includes(x.name) ? '<div class="klein">' + esc(x.um || '') + '</div>' : '') : '<span class="fehlt">ohne Unterschrift</span>'}</td></tr>`).join('')}</tbody></table>
  <table><tbody>
    ${zeile('Hat KHT angerufen?', jn(f.kht) + ' · KHT-Nummer ' + (b.khtNr ?? w.kennzahlen().belegt))}
    ${zeile('Wichtige Hinweise', f.hinweise)}${zeile('Fragen von Gästen', f.fragen)}
    ${zeile('Abwesenheiten', (b.abw || w.abwesenheiten().map((x) => x.gast.vorname + ' (' + x.nr + '): ' + x.text)).join('\n'))}
    ${zeile('Externe Gäste', f.extern.join(', '))}${zeile('Vorfälle', jn(f.vorfall))}
    ${zeile('Schlüssel fehlt', jn(f.schluessel) + (f.schluesselNr ? ' · ' + f.schluesselNr : ''))}
    ${zeile('Fehlt etwas', w.fehltListe(f).join(', '))}${zeile('Sonstiges', f.sonstiges)}
  </tbody></table>
  ${b.nachtraege.length ? '<h2>Ergänzungen</h2>' + b.nachtraege.map((n) => `<p>${esc(n.um)} · ${esc(n.von)}: ${esc(n.text)}</p>`).join('') : ''}
  ${(b.kommentare || []).length ? '<h2>Kommentare</h2>' + b.kommentare!.map((c) => `<p>${esc(c.um)} · ${esc(c.von)}: ${esc(c.text)}</p>`).join('') : ''}`);
}
export function berichtPdf(w: Welt, datum: string): Promise<void> { return pdfTeilen(berichtHtml(w, datum), berichtDatei(datum)); }

// ---------- Dienstnachweis ----------
export function nachweisHtml(w: Welt, k: string, name: string, b: Bereich): string {
  const nw = w.nachweisVon(k, name, b), d = nw ? { zeilen: nw.zeilen, sum: nw } : w.nachweisDaten(k, name, b), s = d.sum;
  return seite(w.nachweisPdf(k, name, b), `
  <h1>Dienstnachweis ${BEREICH_NAME[b]}</h1>
  <p class="unter">${esc(name)} · ${esc(monatName(k))}${nw ? ' · unterschrieben ' + esc(nw.um) : ' · noch nicht unterschrieben'}</p>
  <table><tbody><tr><th>Geplant</th><td class="zahl">${s.geplant}</td><th>Gemacht</th><td class="zahl">${s.gemacht}</td></tr><tr><th>Abgegeben</th><td class="zahl">${s.abgegeben || 0}</td><th>Vertretung</th><td class="zahl">${s.vertretung}</td></tr></tbody></table>
  <table><thead><tr><th style="width:18%">Datum</th><th>Geplant</th><th>Gemacht</th><th>Bemerkung</th></tr></thead><tbody>
  ${d.zeilen.map((z) => `<tr class="${z.abw ? 'abw' : ''}"><td>${wochentagKurz(pd(z.datum))} ${kurz(pd(z.datum))}</td><td>${z.geplant ? '✓' : '–'}</td><td>${z.gemacht ? '✓ ' + esc(z.rolle || '') : '–'}</td><td>${esc(z.text)}</td></tr>`).join('')}
  </tbody></table>
  ${w.S.planLog.filter((l) => l.monat === k && l.name === name && l.bereich === b).map((l) => `<p class="fehlt">Plan korrigiert: ${esc(l.aenderungen.join(', '))} · ${esc(l.grund)} · ${esc(l.von)} · ${esc(l.um)}</p>`).join('')}
  <div class="sig"><div>${nw ? sigSvg(nw.sig) : ''}<br>${esc(name)}: Die Angaben stimmen.</div><div style="border:0"></div></div>`);
}
export function nachweisPdfTeilen(w: Welt, k: string, name: string, b: Bereich): Promise<void> { return pdfTeilen(nachweisHtml(w, k, name, b), w.nachweisPdf(k, name, b)); }
