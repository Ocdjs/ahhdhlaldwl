// Datenmodell der App (Version 1, lokal). Abgleich mit Nextcloud nach dateisystem/README.md folgt in Version 2.
export type BettStatus = 'frei' | 'erwartet' | 'anwesend' | 'fehlt' | 'fehlt2' | 'gehalten' | 'freibis' | 'aus';
export type Stufe = 'Verwarnung' | 'Gelbe Karte' | 'Hausverbot';
export type Bereich = 'betreuung' | 'kueche';
export type Standort = 'haus' | 'nikolaus';

/** Unterschrift als Vektorpfad (SVG-Pfaddaten in den Maßen w × h). */
export interface Unterschrift { w: number; h: number; d: string }

export interface Sanktion { stufe: Stufe; datum: string; grund: string; von: string; bis?: string | null; aufgehoben?: boolean }
export interface Notiz { datum: string; text: string; von: string; quelle?: string; aufnahme?: boolean }
export interface Dokument { art: string; datei: string; datum: string; von: string; foto?: boolean; uri?: string }

export interface Gast {
  id: string;
  vorname: string;
  nachname: string;
  spitz: string;
  sprache: string;
  nr: string;
  erste: string;
  naechte: number;
  laus: 'liegt' | 'fehlt' | 'nicht';
  lausSeit: string | null;
  lausFrist: string | null;
  lausVon?: string;
  unterschrieben: boolean;
  unterschriebenAm?: string;
  papier?: boolean;
  uebersetzung: string | null;
  dokumente: Dokument[];
  sanktionen: Sanktion[];
  notizen: Notiz[];
  extern: boolean;
  standort: Standort;
  sig?: { hg?: Unterschrift; hb?: Unterschrift; dg?: Unterschrift; betreuung?: string };
}

export interface Belegung {
  g: string | null;
  s: Exclude<BettStatus, 'aus'>;
  /** Nächte in Folge unentschuldigt gefehlt */
  n?: number;
  /** hat in der Vornacht unentschuldigt gefehlt */
  vorher?: number;
  bis?: string;
  grund?: string;
  /** St. Nikolaus: wird jede Nacht fortgeschrieben */
  fort?: boolean;
  dauerhaft?: boolean;
  ende?: string | null;
}

export interface Besetzung { rolle: string; name: string; sig: Unterschrift | null; um?: string; geplant?: string; grund?: string }
export interface BerichtFelder {
  hinweise: string;
  kht: 'ja' | 'nein' | null;
  vorfall: 'ja' | 'nein' | null;
  fehlt: string[];
  fehltText: string;
  fragen: string;
  schluessel: 'ja' | 'nein' | null;
  schluesselNr: string;
  extern: string[];
  sonstiges: string;
  ziele: Record<string, string>;
}
export interface Nachtrag { text: string; um: string; von: string }
export type KommentarArt = 'kommentar' | 'antwort' | 'hinweis';
export interface Kommentar { von: string; art: KommentarArt; text: string; um: string; gast: string | null; aufnahme?: boolean; bis?: string | null }
export interface Bericht {
  status: 'offen' | 'abgeschlossen';
  besetzung: Besetzung[];
  f: BerichtFelder;
  nachtraege: Nachtrag[];
  begonnen: string;
  zuUm?: string;
  khtNr?: number;
  abw?: string[];
  ohneUnterschrift?: string[];
  kommentare?: Kommentar[];
}
export interface ArchivEintrag {
  datum: string;
  vorfall: boolean;
  personen: string;
  text: string;
  fehlt: string[];
  fehltText: string;
  fragen: string;
  kommentare: Kommentar[];
  heute?: boolean;
}

export interface Hinweis {
  id: string;
  von: string;
  text: string;
  ab?: string;
  bis: string;
  dauer?: string;
  wichtig: boolean;
  quelle: string;
  bezug?: string;
  beendet?: string;
  neu?: boolean;
}
export interface Termin { datum: string; art: string; titel: string; sym: string; geaendert?: { von: string; um: string; vorher: { datum: string; titel: string } } }
export interface PlanTag { nacht: string[]; kueche: string }
export interface Einsatz { name: string; rolle: string; geplant: string; grund: string }
export interface NachweisZeile { datum: string; geplant: boolean; gemacht: boolean; rolle?: string; text: string; abw?: boolean }
export interface Nachweis { um: string; sig: Unterschrift; zeilen: NachweisZeile[]; geplant: number; gemacht: number; abgegeben: number; vertretung: number; pdf: string }
export interface PlanLog { monat: string; name: string; bereich: Bereich; aenderungen: string[]; grund: string; von: string; um: string }
export interface PlanAenderung { datum: string; rolle: string; alt: string; neu: string; von: string; grund: string; notiz: string; um: string }
export interface PlanImport { von: string; um: string; dienste: number; korrigiert: number; quelle: string }
export interface Dusche { g: string; s: 'geplant' | 'erledigt' | 'verpasst' }
export interface TeamPerson { name: string; bereiche: Bereich[]; personalnummer: string; aktiv: boolean }
export interface Extra { id: string; name: string; ort: 'pius' | 'niko' }

/** Wer gerade handelt: eine diensthabende Betreuungsperson mit Unterschrift oder die Leitung mit Code. */
export interface Anmeldung { datum: string; name: string; leitung: boolean; um: string }

export interface State {
  v: number;
  theme: 'auto' | 'tag' | 'nacht';
  G: Record<string, Gast>;
  betten: Record<string, Belegung>;
  offRooms: Record<string, boolean>;
  offBeds: Record<string, boolean>;
  notbett: Record<string, boolean>;
  extra: Extra[];
  lage: Record<string, string>;
  bad: Record<string, { zu: boolean; um: string; von: string }>;
  dusche: Record<string, Record<string, Dusche>>;
  hinweise: Hinweis[];
  termine: Termin[];
  dienstplan: Record<string, string[]>;
  kueche: Record<string, string>;
  plan0: Record<string, PlanTag>;
  einsaetze: Record<string, Einsatz[]>;
  nachweise: Record<string, Partial<Record<Bereich, Record<string, Nachweis>>>>;
  planLog: PlanLog[];
  archiv: ArchivEintrag[];
  fehltErledigt: Record<string, { von: string; um: string }>;
  planAenderungen: PlanAenderung[];
  planImporte: Record<string, PlanImport>;
  berichte: Record<string, Bericht>;
  sync: { offline: boolean; ausstehend: number; zuletzt: string };
  naechsteNr: number;
  ampel: { gruen: number };
  team: TeamPerson[];
  leitungName: string;
  codes: { admin: string; leitung: string };
  anmeldung: Anmeldung | null;
}
