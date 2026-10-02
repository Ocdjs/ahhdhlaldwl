// Zustand: S = gespeicherte Daten (auf dem Gerät), U = Oberfläche (nicht gespeichert).
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { create } from 'zustand';
import { beispiel } from '../domain/beispiel';
import { heute, iso, uhr } from '../domain/datum';
import type { Bereich, State } from '../domain/typen';
import { Welt } from '../domain/welt';

export const SPEICHER_SCHLUESSEL = 'notuebernachtung-v1';

export type BereichName = 'plan' | 'gaeste' | 'dienst' | 'kalender' | 'einstellungen';
export interface Toast { id: number; sym: string; titel: string; text: string; dauer: number }
export interface ScanTag { datum: string; foto: string[]; erkannt: string[]; wahl: string[]; unsicher: boolean[]; geprueft: boolean[] }
export interface Scan { monat: string; quelle: string; tage: ScanTag[]; i: number; fertig?: boolean; foto?: string }
export interface Wizard {
  nachholen?: boolean; niko?: boolean; schritt: number; nr: string; suche: string; g: string | null;
  neu: { vorname: string; nachname: string; spitz: string }; dauer: '1' | 'mehr' | null; mitEnde: boolean; bis: string;
  sprache: string | null; sig: { hg?: import('../domain/typen').Unterschrift; hb?: import('../domain/typen').Unterschrift; dg?: import('../domain/typen').Unterschrift }; verbotOk: boolean; grund: string; richtung: 1 | -1;
}

export interface UI {
  H: Date;
  geladen: boolean;
  bereich: BereichName;
  tag: number;
  reiter: 'haus' | 'niko';
  offen: string | null;
  schnell: { nr: string; phase?: 'da'; rect?: { x: number; y: number; w: number; h: number } } | null;
  detail: string | null;
  modal: { inhalt: ReactNode; breit?: boolean } | null;
  wizard: Wizard | null;
  glocke: boolean;
  auswahl: string | null;
  einst: string;
  pinOk: boolean;
  dienstReiter: 'bericht' | 'dusche' | 'monat' | 'archiv';
  kalTag: string;
  kalAnsicht: 'woche' | 'monat';
  kalEdit: boolean;
  gSuche: string;
  gFilter: 'alle' | 'bett' | 'offen' | 'verbot';
  akte: string | null;
  duschTag: number;
  monat: string | null;
  scan: Scan | null;
  tausch: { zimmer: string; a: string | null } | null;
  toasts: Toast[];
  neu: string | null;
  gesetzt: string[];
  pruefen: boolean;
  spaeter: Record<string, boolean>;
  nachweis: { k: string; name: string; b: Bereich } | null;
  syncLaeuft: boolean;
}

interface Speicher { S: State; U: UI }

const H0 = heute();
export const useStore = create<Speicher>(() => ({
  S: beispiel(H0),
  U: {
    H: H0, geladen: false, bereich: 'plan', tag: 0, reiter: 'haus', offen: null, schnell: null, detail: null, modal: null, wizard: null, glocke: false, auswahl: null,
    einst: 'darstellung', pinOk: false, dienstReiter: 'bericht', kalTag: iso(H0), kalAnsicht: 'woche', kalEdit: false, gSuche: '', gFilter: 'alle', akte: null, duschTag: 0,
    monat: null, scan: null, tausch: null, toasts: [], neu: null, gesetzt: [], pruefen: false, spaeter: {}, nachweis: null, syncLaeuft: false,
  },
}));

/** Oberfläche ändern (nicht gespeichert). */
export function ui(teil: Partial<UI>): void {
  useStore.setState((st) => ({ U: { ...st.U, ...teil } }));
}
export const getU = (): UI => useStore.getState().U;
export const getS = (): State => useStore.getState().S;
export function welt(): Welt { const { S, U } = useStore.getState(); return new Welt(S, U.H, U.tag); }

/** Daten ändern: arbeitet auf einer Kopie, speichert auf dem Gerät und merkt den Abgleich vor. */
export function aendern(fn: (S: State, w: Welt) => void): void {
  const { S, U } = useStore.getState();
  const kopie: State = JSON.parse(JSON.stringify(S));
  fn(kopie, new Welt(kopie, U.H, U.tag));
  if (kopie.sync.offline) kopie.sync.ausstehend++;
  else kopie.sync.zuletzt = uhr();
  useStore.setState({ S: kopie });
}

// ---------- Hooks ----------
export function useS(): State { return useStore((st) => st.S); }
export function useU<T>(f: (u: UI) => T): T { return useStore((st) => f(st.U)); }
export function useWelt(): Welt {
  const S = useStore((st) => st.S), H = useStore((st) => st.U.H), tag = useStore((st) => st.U.tag);
  return useMemo(() => new Welt(S, H, tag), [S, H, tag]);
}

// ---------- Speichern auf dem Gerät ----------
let zeitgeber: ReturnType<typeof setTimeout> | null = null;
export async function laden(): Promise<void> {
  try {
    const roh = await AsyncStorage.getItem(SPEICHER_SCHLUESSEL);
    if (roh) { const s = JSON.parse(roh) as State; if (s && s.v === 1) useStore.setState({ S: s }); }
  } catch { /* Beispieldaten bleiben */ }
  ui({ geladen: true });
  useStore.subscribe((st, vorher) => {
    if (st.S === vorher.S) return;
    if (zeitgeber) clearTimeout(zeitgeber);
    zeitgeber = setTimeout(() => { AsyncStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(useStore.getState().S)).catch(() => undefined); }, 300);
  });
}
export function beispielZuruecksetzen(): void { useStore.setState({ S: beispiel(getU().H) }); }

/** Diensttag wechselt um 12:00 – einmal pro Minute prüfen. */
export function tagesWechselBeobachten(): () => void {
  const t = setInterval(() => { const h = heute(); if (iso(h) !== iso(getU().H)) ui({ H: h, tag: 0, kalTag: iso(h) }); }, 60000);
  return () => clearInterval(t);
}

// ---------- Einblendungen und Blätter ----------
let toastNr = 0;
export function toast(sym: string, titel: string, text = '', dauer = 6000): void {
  const id = ++toastNr;
  ui({ toasts: [...getU().toasts, { id, sym, titel, text, dauer }] });
  setTimeout(() => toastWeg(id), dauer);
}
export function toastWeg(id: number): void { ui({ toasts: getU().toasts.filter((t) => t.id !== id) }); }
export function zeige(inhalt: ReactNode, breit = false): void { ui({ modal: { inhalt, breit } }); }
export function schliessen(): void { ui({ modal: null }); }
