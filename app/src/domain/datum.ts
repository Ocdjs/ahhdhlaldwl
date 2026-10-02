// Datum: Der Diensttag wechselt um 12:00. Alle Tage als ISO-Text JJJJ-MM-TT.
export function heute(jetzt: Date = new Date()): Date {
  const d = new Date(jetzt);
  if (d.getHours() < 12) d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}
export function pd(s: string): Date {
  const p = String(s).split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}
export function plus(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
const zwei = (n: number) => String(n).padStart(2, '0');
export function iso(d: Date): string {
  return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate());
}
export function kurz(d: Date): string {
  return zwei(d.getDate()) + '.' + zwei(d.getMonth() + 1) + '.';
}
const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const WT_KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
// Ohne Intl, damit es auf jedem Gerät gleich aussieht
export function lang(d: Date): string {
  return WOCHENTAGE[d.getDay()] + ', ' + d.getDate() + '. ' + MONATE[d.getMonth()];
}
export function wochentagKurz(d: Date): string {
  return WT_KURZ[d.getDay()];
}
export function uhr(jetzt: Date = new Date()): string {
  return zwei(jetzt.getHours()) + ':' + zwei(jetzt.getMinutes());
}
export function mKey(d: Date): string {
  return d.getFullYear() + '-' + zwei(d.getMonth() + 1);
}
export function monatName(k: string): string {
  const p = k.split('-');
  return MONATE[+p[1] - 1] + ' ' + p[0];
}
export function tageVon(k: string): string[] {
  const p = k.split('-');
  const out: string[] = [];
  let d = new Date(+p[0], +p[1] - 1, 1);
  while (d.getMonth() === +p[1] - 1) {
    out.push(iso(d));
    d = plus(d, 1);
  }
  return out;
}
export function kw(d: Date): number {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  const w1 = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round(((t.getTime() - w1.getTime()) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}
export function tageZwischen(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 864e5);
}
