// Handlungen im Bettenplan: Antippen, Schnellauswahl, Blätter (Abwesenheit, Dusche, Sanktion, Notiz, Läuseschein, Bad).
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { iso, plus } from '../../domain/datum';
import { SLOTS } from '../../domain/haus';
import type { Stufe } from '../../domain/typen';
import { abwesenheit, badAuf, badZuschliessen, bettFrei, duschWahl, fehltEintragen, heuteFrei, istDa, lausGeprueft, notiz, sanktion, wechseln } from '../../store/aktionen';
import { getU, schliessen, toast, ui, useWelt, welt, zeige } from '../../store/store';
import { Chips, Eingabe, Feld, Knopf, T } from '../../ui/basis';
import { Blatt, Dialog } from '../../ui/overlay';
import { useFarben } from '../../ui/theme';
import { darf } from '../anmeldung';
import { aufnahmeStart } from '../aufnahme/start';
import { Wahl } from '../gemeinsam';

export function bettAntippen(nr: string, rect: { x: number; y: number; w: number; h: number }): void {
  const w = welt(), U = getU();
  if (U.auswahl) {
    if (nr !== U.auswahl && ['frei', 'erwartet', 'anwesend'].includes(w.status(nr))) { const von = U.auswahl; ui({ auswahl: null }); wechselFragen(von, nr); }
    return;
  }
  const s = w.status(nr);
  if (s === 'aus') return;
  ui({ glocke: false, offen: nr });
  if (U.tag !== 0) { if (w.gastVon(nr)) ui({ detail: nr }); return; }
  if (['erwartet', 'frei', 'freibis', 'fehlt', 'fehlt2'].includes(s)) { ui({ schnell: { nr, rect }, detail: U.detail && w.gastVon(nr) ? nr : null }); return; }
  ui({ schnell: null, detail: nr });
}
export function details(nr: string): void { ui({ schnell: null, detail: nr, offen: nr }); }

export function istDaPruefen(nr: string): void {
  if (!darf()) return;
  const w = welt(), g = w.gastVon(nr)!;
  if (g.laus === 'fehlt' && w.lausTage(g) >= 3 && !(g.lausFrist && g.lausFrist >= w.hIso)) {
    ui({ schnell: null, detail: nr, offen: nr });
    toast('warnung', 'Erst den Verbleib klären', 'Läuseschein fehlt seit ' + w.lausTage(g) + ' Tagen.', 5000);
    return;
  }
  istDa(nr);
}

export function nichtDa(nr: string): void {
  if (!darf()) return;
  const w = welt(), g = w.gastVon(nr)!, zweite = !!w.S.betten[nr].vorher;
  ui({ schnell: null });
  zeige(<Dialog titel={g.vorname + ' ist nicht gekommen?'} text={zweite ? g.vorname + ' fehlte schon gestern unentschuldigt. Ab heute zählt Bett ' + nr + ' als frei und darf vergeben werden.' : 'Bett ' + nr + ' bleibt ' + g.vorname + ' zugeordnet und zählt für das Kältehilfetelefon weiter als belegt. Erst ab der 2. Nacht in Folge zählt es als frei.'}
    knoepfe={<><Knopf text="Weiter warten" klein onPress={schliessen} /><Knopf text="Hat sich abgemeldet" klein onPress={() => abwesenheitBlatt(nr)} /><Knopf text="Fehlt unentschuldigt" icon="abwesend" art="primaer" klein testID="fehlt-eintragen" onPress={() => fehltEintragen(nr)} /></>} />);
}

function AbwesenheitBlatt({ nr }: { nr: string }) {
  const w = useWelt();
  const g = w.gastVon(nr)!;
  const [bis, setBis] = useState(iso(plus(w.H, 3)));
  const [grund, setGrund] = useState('');
  const [art, setArt] = useState<'gehalten' | 'freibis'>('gehalten');
  return (
    <Blatt titel={'Abwesenheit von ' + g.vorname} text="Erscheint automatisch im Dienstbericht."
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Eintragen" art="primaer" klein onPress={() => abwesenheit(nr, art, bis, grund)} /></>}>
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        <Feld label="Zurück am (JJJJ-MM-TT)" style={{ flex: 1, minWidth: 200 }}><Eingabe value={bis} onChangeText={setBis} /></Feld>
        <Feld label="Grund (freiwillig)" style={{ flex: 1, minWidth: 200 }}><Eingabe value={grund} onChangeText={setGrund} placeholder="z. B. Krankenhaus" /></Feld>
      </View>
      <Chips>{[3, 7, 14].map((n) => <Chip3 key={n} n={n} setBis={setBis} bis={bis} />)}</Chips>
      <Feld label="Bett bis dahin freihalten?">
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Wahl titel="Ja, freihalten" text="Zählt nicht als frei. Nur für einige Tage und wenn angekündigt." an={art === 'gehalten'} onPress={() => setArt('gehalten')} />
          <Wahl titel="Nein, frei bis zur Rückkehr" text="Bett darf bis dahin vergeben werden." an={art === 'freibis'} onPress={() => setArt('freibis')} />
        </View>
      </Feld>
    </Blatt>
  );
}
function Chip3({ n, bis, setBis }: { n: number; bis: string; setBis: (s: string) => void }) {
  const w = useWelt();
  const ziel = iso(plus(w.H, n));
  return <Knopf text={'+' + n + ' Tage'} klein art={bis === ziel ? 'primaer' : 'normal'} onPress={() => setBis(ziel)} />;
}
export function abwesenheitBlatt(nr: string): void { if (!darf()) return; ui({ schnell: null }); zeige(<AbwesenheitBlatt nr={nr} />); }

export function bettFreiDialog(nr: string): void {
  if (!darf()) return;
  const g = welt().gastVon(nr)!;
  zeige(<Dialog titel={'Bett ' + nr + ' freigeben?'} text={g.vorname + ' zieht aus. Das Bett ist ab heute frei, ' + g.vorname + ' bleibt in der Gästedatenbank.'}
    knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Bett frei" icon="auszug" art="primaer" klein onPress={() => bettFrei(nr)} /></>} />);
}

export function wechselFragen(von: string, nach: string): void {
  if (!darf()) return;
  const w = welt(), a = w.gastVon(von)!, b = w.gastVon(nach), frei = w.zaehlt(nach) && w.status(nach) === 'frei';
  const tausch = !!b && !frei;
  zeige(<Dialog titel={tausch ? a.vorname + ' (' + von + ') und ' + b!.vorname + ' (' + nach + ') tauschen?' : a.vorname + ' von ' + von + ' nach ' + nach + ' umziehen?'} text="Gilt ab heute. Bereits unterschriebene PDFs bleiben unverändert."
    knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text={tausch ? 'Tauschen' : 'Umziehen'} icon={tausch ? 'tauschen' : 'umziehen'} art="primaer" klein onPress={() => wechseln(von, nach)} /></>} />);
}
export function bettWechseln(nr: string): void { if (!darf()) return; ui({ auswahl: nr, detail: null, schnell: null }); }

function DuschBlatt({ nr }: { nr: string }) {
  const w = useWelt();
  const g = w.gastVon(nr)!, d = w.S.dusche[w.hIso] || {};
  return (
    <Blatt titel={'Duschslot für ' + g.vorname} text="Heute, 30 Minuten. Zu Slotbeginn erscheint eine Erinnerung." knoepfe={<Knopf text="Fertig" klein onPress={schliessen} />}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SLOTS.map((z) => { const x = d[z], eigen = x && x.g === g.id; return <Slot key={z} zeit={z} name={eigen ? g.vorname : x ? w.S.G[x.g]?.vorname || '' : 'frei'} zustand={eigen ? 'geplant' : x ? 'verpasst' : 'frei'} disabled={!!x && !eigen} onPress={() => duschWahl(nr, z)} />; })}
      </View>
    </Blatt>
  );
}
export function duschBlatt(nr: string): void { if (!darf()) return; ui({ schnell: null }); zeige(<DuschBlatt nr={nr} />); }

export function Slot({ zeit, name, zustand, unter, onPress, disabled }: { zeit: string; name: string; zustand: 'frei' | 'geplant' | 'erledigt' | 'verpasst'; unter?: string; onPress?: () => void; disabled?: boolean }) {
  const f = useFarben();
  const bg = zustand === 'geplant' ? f.erwartetFlaeche : zustand === 'frei' ? f.flaeche2 : f.flaeche;
  const rand = zustand === 'geplant' ? f.blau : zustand === 'erledigt' ? f.frei : zustand === 'verpasst' ? f.linieStark : f.linie;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={'Dusche ' + zeit + ', ' + name} testID={'slot-' + zeit} disabled={disabled} onPress={onPress}
      style={({ pressed }) => ({ width: 150, minHeight: 76, padding: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: bg, borderWidth: zustand === 'geplant' || zustand === 'erledigt' ? 2 : 1.5, borderColor: rand, gap: 2, opacity: disabled ? 0.6 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
      <T art="zahlKlein" farbe={zustand === 'erledigt' ? f.frei : f.tinte2} style={{ fontSize: 15, lineHeight: 18 }}>{zeit + (zustand === 'erledigt' ? ' ✓' : '')}</T>
      <T art="stark" farbe={zustand === 'frei' ? f.tinte3 : zustand === 'verpasst' ? f.tinte2 : f.tinte} style={[{ fontSize: 17 }, zustand === 'verpasst' && { textDecorationLine: 'line-through' }]}>{name}</T>
      {unter ? <T art="beschr">{unter}</T> : null}
    </Pressable>
  );
}

const STUFEN: [Stufe, string, string][] = [['Verwarnung', 'verwarnung', 'Schon mehrmals hingewiesen, soll es nicht wiederholen'], ['Gelbe Karte', 'karte-gelb', 'Noch einmal, dann Hausverbot'], ['Hausverbot', 'karte-rot', 'Aufnahme gesperrt']];
function SanktionBlatt({ nr }: { nr: string }) {
  const w = useWelt();
  const g = w.gastVon(nr)!;
  const [stufe, setStufe] = useState<Stufe>('Verwarnung');
  const [grund, setGrund] = useState('');
  const [bis, setBis] = useState('');
  const [fehler, setFehler] = useState(false);
  return (
    <Blatt titel={'Sanktion für ' + g.vorname} text="Gilt nur für diesen Gast. Grund ist Pflicht."
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Eintragen" art="gefahrVoll" klein onPress={() => { if (!grund.trim()) { setFehler(true); return; } sanktion(nr, stufe, grund.trim(), bis || null); }} /></>}>
      {STUFEN.map(([s, sym, t]) => <Wahl key={s} titel={s} text={t} icon={sym} an={stufe === s} onPress={() => setStufe(s)} />)}
      <Feld label={fehler ? 'Grund – bitte ausfüllen' : 'Grund'}><Eingabe value={grund} onChangeText={(v) => { setGrund(v); setFehler(false); }} placeholder="Was ist passiert?" /></Feld>
      {stufe === 'Hausverbot' ? <Feld label="Gültig bis (JJJJ-MM-TT, leer = unbefristet)"><Eingabe value={bis} onChangeText={setBis} /></Feld> : null}
    </Blatt>
  );
}
export function sanktionBlatt(nr: string): void { if (!darf()) return; zeige(<SanktionBlatt nr={nr} />); }

function NotizBlatt({ gid }: { gid: string }) {
  const w = useWelt();
  const [text, setText] = useState('');
  return (
    <Blatt titel={(w.tag ? 'Nachtrag zu ' : 'Notiz zu ') + w.S.G[gid].vorname} text={'Wird mit Datum und dem Namen ' + w.aktivePerson() + ' gespeichert.'}
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Speichern" art="primaer" klein disabled={!text.trim()} onPress={() => notiz(gid, text.trim())} /></>}>
      <Feld label="Notiz"><Eingabe mehrzeilig value={text} onChangeText={setText} autoFocus /></Feld>
    </Blatt>
  );
}
/** Notiz; an vergangenen Tagen als Nachtrag (dafür reicht die Anmeldung von heute). */
export function notizBlatt(gid: string): void {
  const w = welt();
  if (w.tag < 0 ? !w.angemeldet() : !w.darfAendern()) { darf(); if (w.tag < 0) toast('schloss', 'Nachtrag nur mit Anmeldung', 'Zuerst heute in der Besetzung unterschreiben.', 4000); return; }
  zeige(<NotizBlatt gid={gid} />);
}

function LausBlatt({ gid }: { gid: string }) {
  const w = useWelt();
  return (
    <Blatt titel="Läuseschein prüfen" text={'Für ' + w.anzeige(w.S.G[gid]) + '. Foto der Bescheinigung kommt mit dem Abgleich in die Gästedatenbank (Version 2).'}
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Geprüft" icon="check" art="primaer" klein onPress={() => lausGeprueft(gid)} /></>}>
      <T art="klein">Liegt der Läuseschein vor und ist gültig? Er gilt die ganze Saison.</T>
    </Blatt>
  );
}
export function lausBlatt(gid: string): void { if (!darf()) return; zeige(<LausBlatt gid={gid} />); }
export function lausNein(nr: string): void {
  if (!darf()) return;
  const g = welt().gastVon(nr)!;
  zeige(<Dialog titel={g.vorname + ' darf heute nicht bleiben'} text={'Bett ' + nr + ' wird für heute frei. Die Entscheidung wird mit deinem Namen gespeichert.'}
    knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Bett freigeben" art="gefahrVoll" klein onPress={() => heuteFrei(nr)} /></>} />);
}

export function badAntippen(): void {
  const w = welt();
  if (w.tag !== 0) return;
  if (!darf()) return;
  const bz = w.badZustand(), offen = w.duschenOffen();
  if (bz === 'erinnern') { badAuf(); return; }
  if (bz === 'zu') { zeige(<Dialog titel="Bad schon aufschließen?" text={'Noch nicht geduscht: ' + offen.join(', ') + '.'} knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Trotzdem aufschließen" art="primaer" klein onPress={badAuf} /></>} />); return; }
  zeige(<Dialog titel="Bad wieder abschließen?" text="Zum Beispiel für eine Dusche außer der Reihe. Danach erinnert die App wieder ans Aufschließen." knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Abschließen" art="primaer" klein onPress={badZuschliessen} /></>} />);
}

export function KhtBlatt() {
  const w = useWelt();
  const k = w.khtZahlen();
  const nicht = w.alleBetten().filter((b) => !w.istAus(b.nr) && w.S.notbett[b.nr] && !w.belegtKht(b.nr)).map((b) => b.nr);
  return (
    <Blatt titel="KHT-Nummer" text="Belegte Betten in St. Pius und St. Nikolaus." knoepfe={<Knopf text="Fertig" art="primaer" klein onPress={schliessen} />}>
      <View style={{ flexDirection: 'row', gap: 32 }}>
        <View><T art="label">Belegt</T><T art="zahlGross">{k.belegt}</T></View>
        <View><T art="label">Frei</T><T art="zahlGross">{k.frei}</T></View>
      </View>
      <T art="klein">Notbetten zählen nur, wenn sie belegt sind (Kältebus){nicht.length ? ': ' + nicht.join(', ') + ' frei, zählt nicht' : ''}. Wer zwei Nächte in Folge unentschuldigt fehlt, zählt nicht mehr.</T>
    </Blatt>
  );
}

export function gastAufnehmen(nr?: string): void { if (!darf()) return; ui({ schnell: null }); aufnahmeStart(nr); }
