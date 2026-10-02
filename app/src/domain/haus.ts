// Haus, Grundriss und feste Listen. Geometrie in Grundriss-Einheiten (St. Pius: viewBox −10 −10 971 800).
export type Teil = (string | [string, string])[];
export interface Zimmer { id: string; name: string; teile: Teil[] }

/** St. Pius als Zimmer (für schmale Bildschirme und Einstellungen); ein Paar ist ein Stockbett (oben, unten). */
export const HAUS_BASIS: Zimmer[] = [
  { id: 'D', name: 'Zimmer D', teile: [['D1', ['D2', 'D3']], [['D4', 'D5'], 'D6']] },
  { id: 'T', name: 'T-Zimmer', teile: [[['T1', 'T2'], 'T3']] },
  { id: 'B', name: 'Zimmer B', teile: [['B1', 'B2', ['B3', 'B4']]] },
  { id: 'F', name: 'Zimmer F', teile: [['F1', 'F2', ['F3', 'F4']]] },
  { id: 'L', name: 'Loggien', teile: [['L1', 'L2', 'L3', 'L4', 'L5']] },
  { id: 'E', name: 'Esszimmer', teile: [['E1']] },
  { id: 'TH', name: 'Tiny House', teile: [['TH1']] },
  { id: 'X', name: 'Weitere Plätze', teile: [[]] },
];
export const NIKO_BASIS: Zimmer[] = [
  { id: 'N', name: 'Saal', teile: [['N1', 'N2', 'N3', 'N4'], ['N5', 'N6', 'N7', 'N8']] },
  { id: 'NX', name: 'Weitere Plätze', teile: [[]] },
];
export const ORT_BASIS: Record<string, string> = { L1: 'Loggia', L2: 'Loggia', L3: 'Loggia', L4: 'Loggia', L5: 'Loggia', E1: 'Esszimmer', TH1: 'Tiny House' };

export type Rechteck = [number, number, number, number];
export const GR = {
  breite: 971,
  hoehe: 800,
  boeden: { D: [13, 13, 314, 309], B: [13, 328, 314, 402], T: [746, 13, 202, 274], F: [670, 293, 278, 437] } as Record<string, Rechteck>,
  flur: [333, 328, 331, 117] as Rechteck,
  labels: { D: [19, 264], B: [22, 356], T: [756, 40], F: [752, 326] } as Record<string, [number, number]>,
  namen: { D: 'ZIMMER D', B: 'ZIMMER B', T: 'T-ZIMMER', F: 'ZIMMER F' } as Record<string, string>,
  einzel: { D1: [16, 16, 150, 62], D6: [176, 16, 150, 62], B1: [16, 662, 150, 64], B2: [16, 412, 150, 64], T3: [876, 16, 70, 150], F1: [674, 448, 150, 64], F2: [674, 662, 150, 64] } as Record<string, Rechteck>,
  stock: [['D2', 'D3', 86, 86, 80, 160], ['D4', 'D5', 176, 86, 80, 160], ['B3', 'B4', 244, 352, 80, 170], ['T1', 'T2', 750, 110, 80, 170], ['F3', 'F4', 864, 460, 80, 170]] as [string, string, number, number, number, number][],
  privat: [[333, 13, 188, 309], [578, 451, 86, 279]] as Rechteck[],
  privatPfad: 'M527 13 H740 V287 H664 V322 H527 Z',
  waende: ['M336 733 H10 V10 H951 V733 H428', 'M170 10 V248 M170 316 V325', 'M330 10 V640 M330 712 V733', 'M524 10 V325', 'M743 10 V290', 'M10 325 H210 M282 325 H667', 'M667 290 H840 M912 290 H951', 'M667 290 V338 M667 410 V733', 'M330 448 H355 M427 448 H667', 'M458 448 V590 M458 662 V733', 'M575 448 V733'],
  tuerFest: 'M170 248 A68 68 0 0 0 102 316 M170 316 H102',
  notizen: [['PRIVAT', 427, 172], ['PRIVAT', 633, 172], ['PRIVAT', 621, 594], ['FLUR', 394, 566]] as [string, number, number][],
  bad: [461, 451, 111, 279] as Rechteck,
};
/** Türen, die sich schließen: Angel h, offenes Türblatt bis o, Drehwinkel w zum Schließen. */
export const TUEREN: Record<string, { h: [number, number]; o: [number, number]; w: number }> = {
  D: { h: [282, 325], o: [282, 253], w: -90 },
  T: { h: [912, 290], o: [912, 218], w: -90 },
  F: { h: [667, 338], o: [739, 338], w: 90 },
  FLUR: { h: [355, 448], o: [355, 520], w: -90 },
  B: { h: [330, 640], o: [258, 640], w: -90 },
  BAD: { h: [458, 662], o: [386, 662], w: 90 },
};
export const GR_NIKO = {
  breite: 380,
  hoehe: 440,
  einzel: (() => {
    const e: Record<string, Rechteck> = {};
    [30, 110, 190, 270].forEach((x, i) => {
      e['N' + (i + 1)] = [x, 16, 64, 130];
      e['N' + (i + 5)] = [x, 274, 64, 130];
    });
    return e;
  })(),
};

export const SPRACHEN: [string, string, string][] = [
  ['de', 'Deutsch', 'Deutsch'], ['en', 'English', 'Englisch'], ['fr', 'Français', 'Französisch'], ['es', 'Español', 'Spanisch'],
  ['ar', 'العربية', 'Arabisch'], ['fa', 'فارسی', 'Farsi'], ['pl', 'Polski', 'Polnisch'], ['ro', 'Română', 'Rumänisch'],
  ['bg', 'Български', 'Bulgarisch'], ['ru', 'Русский', 'Russisch'],
];
export const SPRACHE: Record<string, [string, string, string]> = Object.fromEntries(SPRACHEN.map((s) => [s[0], s]));
export const RTL = new Set(['ar', 'fa']);

export const SLOTS = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
export const FEHLT = ['Tüten', 'Putzmittel', 'Toilettenpapier', 'Decken', 'Kaffee', 'Seife'];
export const ROLLEN = ['Betreuung 1', 'Betreuung 2', 'Küche'];
export const DAUERN: [string, string][] = [['1', 'Nächster Dienst'], ['3', '3 Tage'], ['7', '1 Woche'], ['14', '2 Wochen'], ['datum', 'Bis Datum']];
export const KOMMENTAR_ART: [string, string][] = [['kommentar', 'Kommentar'], ['antwort', 'Antwort auf Frage'], ['hinweis', 'Wichtiger Hinweis']];
export const TERMIN_ARTEN: [string, string][] = [['Aufgabe', 'bericht'], ['Bettwäsche', 'wiederholen'], ['Sondertermin', 'kalender'], ['Feiertag', 'einkauf']];
export const STUFE_RE = /^\s*(Verwarnung|Gelbe Karte|Hausverbot|Rote Karte)\b/i;

/** Platzhalter, bis der Träger die verbindlichen Texte liefert (siehe ENTSCHEIDUNGEN.md, B1). */
export const TEXTE: Record<'hausordnung' | 'datenschutz', Record<string, [string, string]>> = {
  hausordnung: {
    de: ['Hausordnung', 'Willkommen, {GAST}. Dein Bett ist {BETT} ab {DATUM}. Einlass ist ab 19:00 Uhr, Ruhe ab 22:00 Uhr. Rauchen, Alkohol und Drogen sind im Haus nicht erlaubt. Gewalt führt zum Hausverbot. Aufgenommen von {BETREUER}. (Platzhalter, der verbindliche Text kommt vom Träger.)'],
    en: ['House rules', 'Welcome, {GAST}. Your bed is {BETT} from {DATUM}. Entry from 7 pm, quiet from 10 pm. Smoking, alcohol and drugs are not allowed in the house. Violence leads to a ban. Admitted by {BETREUER}.'],
    ar: ['قواعد البيت', 'مرحبًا {GAST}. سريرك هو {BETT} ابتداءً من {DATUM}. الدخول من الساعة 19:00، والهدوء من الساعة 22:00. التدخين والكحول والمخدرات ممنوعة داخل البيت. العنف يؤدي إلى منع الدخول. تم الاستقبال بواسطة {BETREUER}.'],
  },
  datenschutz: {
    de: ['Datenschutzerklärung', 'Wir speichern deinen Vornamen, auf Wunsch Nachnamen und Spitznamen, deine Sprache, dein Bett und deine Nächte, um die Notübernachtung zu organisieren. Ein Läuseschein wird als Bild gespeichert. Du kannst jederzeit Auskunft verlangen. Kontakt: Träger der Notübernachtung. (Platzhalter, der verbindliche Text kommt vom Träger.)'],
  },
};
