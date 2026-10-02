// Kalender: 7 Tage oder Monat; Dienste (Betreuung 1/2, Küche) und Termine. Ändern mit Admin-PIN, „Wer ändert?“ ist Pflicht.
import { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { iso, kurz, kw, lang, monatName, mKey, pd, plus, wochentagKurz } from '../../domain/datum';
import { TERMIN_ARTEN } from '../../domain/haus';
import type { Termin } from '../../domain/typen';
import { dienstAendern, terminAendern, terminLoeschen, terminNeu } from '../../store/aktionen';
import { getS, getU, schliessen, toast, ui, useU, useWelt, welt, zeige } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Banner, Chip, Chips, Eingabe, Feld, Icon, IconKnopf, Knopf, Seg, T, Zeile } from '../../ui/basis';
import { Blatt } from '../../ui/overlay';
import { useFarben } from '../../ui/theme';
import { darf, mitAdminPin } from '../anmeldung';

function WerAendert({ von, setVon, fehler }: { von: string; setVon: (s: string) => void; fehler: boolean }) {
  const S = getS();
  const namen = [S.leitungName].concat(S.team.filter((p) => p.aktiv).map((p) => p.name));
  const f = useFarben();
  return (
    <Feld label="Wer ändert?">
      <Chips>{namen.map((n) => <Chip key={n} text={n} an={von === n} onPress={() => setVon(n)} />)}</Chips>
      <T art="beschr" farbe={fehler ? f.vorfall : undefined}>{fehler ? 'Bitte zuerst auswählen, wer ändert.' : von ? 'Wird vermerkt: geändert von ' + von + '.' : 'Bitte auswählen. Die Änderung wird mit Namen vermerkt.'}</T>
    </Feld>
  );
}

function DienstBlatt({ di, i }: { di: string; i: number }) {
  const w = useWelt();
  const r = w.dienstRollen(di)[i];
  const [neu, setNeu] = useState(r[1]);
  const [von, setVon] = useState('');
  const [grund, setGrund] = useState<'Tausch' | 'Sonstiges'>('Tausch');
  const [notiz, setNotiz] = useState('');
  const [fehler, setFehler] = useState(false);
  const kand = w.team(i === 2 ? 'kueche' : 'betreuung');
  return (
    <Blatt titel={r[0] + ' am ' + kurz(pd(di)) + ' ändern'} text={'Originalplan: ' + (r[2] || 'offen') + (r[1] !== r[2] ? ' · jetzt: ' + (r[1] || 'offen') : '')}
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Speichern" art="primaer" klein testID="dienst-speichern" onPress={() => {
        if (!von) { setFehler(true); return; }
        if (neu !== r[1]) { dienstAendern(di, i, neu, von, grund, notiz.trim()); toast('stift', 'Dienst geändert', r[0] + ' ' + kurz(pd(di)) + ': ' + (neu || 'offen') + ' · vermerkt: ' + von, 4000); }
        schliessen();
      }} /></>}>
      <Feld label="Wer macht den Dienst?"><Chips>{kand.concat(['']).map((n) => <Chip key={n || 'offen'} text={n || 'offen'} an={neu === n} onPress={() => setNeu(n)} />)}</Chips></Feld>
      <WerAendert von={von} setVon={(v) => { setVon(v); setFehler(false); }} fehler={fehler} />
      <Feld label="Grund"><Seg optionen={[['Tausch', 'Tausch'], ['Sonstiges', 'Sonstiges']]} wert={grund} onChange={setGrund} /></Feld>
      <Feld label="Notiz (freiwillig)"><Eingabe value={notiz} onChangeText={setNotiz} placeholder="z. B. getauscht mit 14.10." /></Feld>
    </Blatt>
  );
}

function DienstInfo({ di, i }: { di: string; i: number }) {
  const w = useWelt();
  const r = w.dienstRollen(di)[i], log = w.aenderungenVon(di, r[0]);
  return (
    <Blatt titel={r[0] + ' · ' + kurz(pd(di))} text={'Originalplan: ' + (r[2] || 'offen') + ' · jetzt: ' + (r[1] || 'offen')} knoepfe={<Knopf text="Schließen" klein onPress={schliessen} />}>
      {log.length ? log.map((x, k) => <Zeile key={k} icon="stift" titel={(x.alt || 'offen') + ' → ' + (x.neu || 'offen')} klein={'geändert von ' + x.von + ' am ' + x.um + ' · ' + x.grund + (x.notiz ? ' · ' + x.notiz : '')} />) : <T art="beschr">Weicht vom Originalplan ab.</T>}
    </Blatt>
  );
}

function TerminBlatt({ idx, datum }: { idx?: number; datum: string }) {
  const S = getS();
  const t: Termin | undefined = idx != null ? S.termine[idx] : undefined;
  const [titel, setTitel] = useState(t?.titel || '');
  const [tag, setTag] = useState(t?.datum || datum);
  const [art, setArt] = useState<[string, string]>(t ? [t.art, t.sym] : TERMIN_ARTEN[2]);
  const [von, setVon] = useState('');
  const [fehler, setFehler] = useState(false);
  const pruefen = () => { if (!von) { setFehler(true); return false; } return true; };
  return (
    <Blatt titel={t ? 'Termin ändern' : 'Termin am ' + kurz(pd(datum))} text={t ? (t.geaendert ? 'Zuletzt geändert von ' + t.geaendert.von + ' am ' + t.geaendert.um : undefined) : 'Erscheint am Tag unter „Heute“ im Dienstbericht. Bettwäschewechsel erscheint als wichtiger Hinweis.'}
      knoepfe={<>
        {t ? <Knopf text="Löschen" icon="loeschen" art="gefahr" klein style={{ marginRight: 'auto' }} onPress={() => { if (!pruefen()) return; terminLoeschen(idx!, von); toast('loeschen', 'Termin gelöscht', t.titel + ' · vermerkt: ' + von, 4000); }} /> : null}
        <Knopf text="Abbrechen" klein onPress={schliessen} />
        <Knopf text="Speichern" art="primaer" klein disabled={!titel.trim()} testID="termin-speichern" onPress={() => {
          if (t) { if (!pruefen()) return; terminAendern(idx!, { titel: titel.trim(), datum: /^\d{4}-\d{2}-\d{2}$/.test(tag) ? tag : t.datum, art: art[0], sym: art[1] }, von); toast('stift', 'Termin geändert', titel.trim() + ' · vermerkt: ' + von, 4000); }
          else terminNeu({ datum, art: art[0], titel: titel.trim(), sym: art[1] });
        }} />
      </>}>
      <Feld label="Titel"><Eingabe value={titel} onChangeText={setTitel} placeholder="z. B. Lieferung Decken" autoFocus={!t} /></Feld>
      {t ? <Feld label="Datum (JJJJ-MM-TT)"><Eingabe value={tag} onChangeText={setTag} style={{ maxWidth: 220 }} /></Feld> : null}
      <Feld label="Art"><Chips>{TERMIN_ARTEN.map((x) => <Chip key={x[0]} text={x[0]} icon={x[1]} an={art[0] === x[0]} onPress={() => setArt(x)} />)}</Chips></Feld>
      {t ? <WerAendert von={von} setVon={(v) => { setVon(v); setFehler(false); }} fehler={fehler} /> : null}
    </Blatt>
  );
}

function Dienstzeilen({ di, kompakt }: { di: string; kompakt?: boolean }) {
  const w = useWelt();
  const f = useFarben();
  const edit = useU((u) => u.kalEdit);
  return (
    <View style={{ gap: 4 }}>
      {w.dienstRollen(di).map((r, i) => {
        const ge = w.dienstGeaendert(di, r), aenderbar = edit && di >= w.hIso;
        const inhalt = (
          <>
            <T art="beschr" style={{ fontSize: 11, lineHeight: 14 }} farbe={ge ? f.warnung : f.tinte2}>{r[0]}{ge ? ' · geändert' : ''}</T>
            <T art="stark" style={{ fontSize: kompakt ? 14 : 15, lineHeight: 19 }} farbe={r[1] ? f.tinte : f.tinte3}>{r[1] || 'offen'}</T>
            {ge && r[2] !== r[1] ? <T art="beschr" style={{ textDecorationLine: 'line-through', fontSize: 12 }}>{r[2] || 'offen'}</T> : null}
          </>
        );
        const stil = { padding: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: i === 2 ? f.flaeche2 : f.erwartetFlaeche, borderWidth: ge ? 2 : aenderbar ? 1.5 : 0, borderColor: ge ? f.warnung : f.linieStark, borderStyle: aenderbar && !ge ? 'dashed' as const : 'solid' as const };
        return aenderbar || ge ? <Pressable key={i} accessibilityRole="button" accessibilityLabel={r[0] + ' am ' + kurz(pd(di)) + (aenderbar ? ' ändern' : '')} testID={'dienst-' + di + '-' + i} onPress={() => zeige(aenderbar ? <DienstBlatt di={di} i={i} /> : <DienstInfo di={di} i={i} />)} style={stil}>{inhalt}</Pressable> : <View key={i} style={stil}>{inhalt}</View>;
      })}
    </View>
  );
}

function TerminChip({ t }: { t: Termin }) {
  const w = useWelt();
  const f = useFarben();
  const edit = useU((u) => u.kalEdit);
  const idx = w.S.termine.indexOf(t), aenderbar = edit && t.datum >= w.hIso;
  const inhalt = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: t.art === 'Feiertag' ? f.vorfallFlaeche : t.art === 'Bettwäsche' ? f.warnungFlaeche : f.flaeche2, borderWidth: t.geaendert ? 2 : aenderbar ? 1.5 : 0, borderColor: t.geaendert ? f.warnung : f.linieStark, borderStyle: aenderbar && !t.geaendert ? 'dashed' : 'solid' }}>
      <Icon name={t.sym} groesse={16} farbe={f.tinte2} />
      <View style={{ flex: 1 }}><T art="label" style={{ fontSize: 13 }}>{t.titel}</T><T art="beschr" style={{ fontSize: 11, lineHeight: 13 }}>{t.art}{t.geaendert ? ' · geändert' : ''}</T></View>
    </View>
  );
  return aenderbar ? <Pressable accessibilityRole="button" onPress={() => zeige(<TerminBlatt idx={idx} datum={t.datum} />)}>{inhalt}</Pressable> : inhalt;
}

/** Neuer Termin: mit freigeschaltetem Kalender (Admin-PIN) oder angemeldet im Dienst. */
function neuerTermin(di: string): void { if (getU().kalEdit || welt().darfAendern()) zeige(<TerminBlatt datum={di} />); else darf(); }

function Woche() {
  const w = useWelt();
  const f = useFarben();
  const kalTag = useU((u) => u.kalTag);
  const { width } = useWindowDimensions();
  const spalte = Math.max(150, Math.floor((width - 104 - 32 - 6 * 8) / 7));
  const basis = pd(kalTag), start = plus(basis, -((basis.getDay() + 6) % 7));
  return (
    <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const d = plus(start, i), di = iso(d), heute = di === w.hIso, vorbei = di < w.hIso;
        return (
          <View key={di} style={{ width: spalte, gap: 8, padding: 10, borderRadius: radius.l, backgroundColor: f.flaeche, borderWidth: heute ? 2 : 0, borderColor: f.tinte, opacity: vorbei ? 0.75 : 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}><T art="zahlGross" style={{ fontSize: 24 }}>{d.getDate()}</T><T art="label">{wochentagKurz(d)}</T>{heute ? <T art="beschr">heute</T> : null}</View>
            <Dienstzeilen di={di} />
            {w.S.termine.filter((t) => t.datum === di).map((t, k) => <TerminChip key={k} t={t} />)}
            {!vorbei ? <Pressable accessibilityRole="button" onPress={() => neuerTermin(di)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 40, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: f.linie }}><Icon name="plus" groesse={16} farbe={f.tinte2} /><T art="label">Termin</T></Pressable> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

function MonatAnsicht() {
  const w = useWelt();
  const f = useFarben();
  const kalTag = useU((u) => u.kalTag);
  const { width } = useWindowDimensions();
  const basis = pd(kalTag), erster = new Date(basis.getFullYear(), basis.getMonth(), 1), start = plus(erster, -((erster.getDay() + 6) % 7));
  const zellen = Array.from({ length: 42 }, (_, i) => plus(start, i));
  const seite = width > 1100;
  return (
    <View style={{ flexDirection: seite ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
      <View style={{ flex: seite ? 1 : undefined, alignSelf: 'stretch', backgroundColor: f.flaeche, borderRadius: radius.l, padding: 8 }}>
        <View style={{ flexDirection: 'row' }}>{['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((t) => <T key={t} art="label" style={{ flex: 1, textAlign: 'center', paddingVertical: 6 }}>{t}</T>)}</View>
        {[0, 1, 2, 3, 4, 5].map((z) => (
          <View key={z} style={{ flexDirection: 'row' }}>
            {zellen.slice(z * 7, z * 7 + 7).map((d) => {
              const di = iso(d), anders = d.getMonth() !== basis.getMonth(), dp = w.S.dienstplan[di];
              const ge = !anders && w.dienstRollen(di).some((r) => w.dienstGeaendert(di, r));
              const ev = w.S.termine.filter((t) => t.datum === di);
              return (
                <Pressable key={di} accessibilityRole="button" accessibilityLabel={lang(d)} onPress={() => ui({ kalTag: di })}
                  style={{ flex: 1, minHeight: 92, margin: 2, padding: 6, borderRadius: 8, gap: 3, backgroundColor: di === w.hIso ? f.erwartetFlaeche : f.flaeche2, borderWidth: di === kalTag ? 2 : 0, borderColor: f.tinte, opacity: anders ? 0.4 : 1 }}>
                  <T art="zahlKlein" style={{ fontSize: 14 }}>{d.getDate()}</T>
                  {dp && !anders ? <T art="beschr" zeilen={1} farbe={ge ? f.warnung : f.tinte2} style={{ fontSize: 11 }}>{(ge ? '✎ ' : '') + (dp.filter(Boolean).join(' + ') || 'offen')}</T> : null}
                  {ev.slice(0, 2).map((t, k) => <T key={k} art="beschr" zeilen={1} style={{ fontSize: 11 }} farbe={t.art === 'Bettwäsche' ? f.warnung : f.tinte}>{t.titel}</T>)}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <View style={{ width: seite ? 320 : undefined, alignSelf: seite ? 'flex-start' : 'stretch', gap: 10, backgroundColor: f.flaeche, borderRadius: radius.l, padding: 16 }}>
        <T art="titel" style={{ fontSize: 20 }}>{lang(pd(kalTag))}</T>
        <T art="beschr">Nachtdienst 18:45–08:00 · Küche 17:00–21:00</T>
        <Dienstzeilen di={kalTag} />
        {w.S.termine.filter((t) => t.datum === kalTag).map((t, k) => <TerminChip key={k} t={t} />)}
        {kalTag >= w.hIso ? <Knopf text="Termin" icon="plus" klein art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => neuerTermin(kalTag)} /> : null}
      </View>
    </View>
  );
}

export function Kalender() {
  const w = useWelt();
  const ansicht = useU((u) => u.kalAnsicht);
  const kalTag = useU((u) => u.kalTag);
  const edit = useU((u) => u.kalEdit);
  const basis = pd(kalTag), start = plus(basis, -((basis.getDay() + 6) % 7)), ende = plus(start, 6);
  const titel = ansicht === 'woche' ? 'KW ' + kw(start) + ' · ' + kurz(start) + ' – ' + kurz(ende) + ende.getFullYear() : monatName(mKey(basis));
  const blaettern = (n: number) => {
    if (ansicht === 'woche') ui({ kalTag: n === 0 ? w.hIso : iso(plus(basis, n * 7)) });
    else { const d = new Date(basis.getFullYear(), basis.getMonth() + n, 1); ui({ kalTag: iso(d) }); }
  };
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <T art="titelGross" style={{ flex: 1, minWidth: 260 }}>{titel}</T>
        <Seg optionen={[['woche', '7 Tage'], ['monat', 'Monat']]} wert={ansicht} onChange={(k) => ui({ kalAnsicht: k })} minBreite={90} />
        <IconKnopf icon="zurueck" label={ansicht === 'woche' ? 'Vorige Woche' : 'Voriger Monat'} flaeche onPress={() => blaettern(-1)} />
        <Knopf text="Heute" klein art="rahmen" onPress={() => ui({ kalTag: w.hIso })} />
        <IconKnopf icon="weiter" label={ansicht === 'woche' ? 'Nächste Woche' : 'Nächster Monat'} flaeche onPress={() => blaettern(1)} />
        {edit ? <Knopf text="Fertig" icon="check" art="primaer" klein onPress={() => ui({ kalEdit: false })} />
          : <Knopf text="Ändern" icon="schloss" art="rahmen" klein testID="kal-aendern" onPress={() => mitAdminPin('Kalender ändern', () => { ui({ kalEdit: true }); toast('schloss-offen', 'Ändern freigeschaltet', 'Bis „Fertig“.', 3000); })} />}
      </View>
      {edit ? <Banner icon="stift" titel="Ändern ist freigeschaltet" klein="Dienst oder Termin antippen. Jede Änderung wird mit Namen vermerkt und im Kalender markiert. Der Originalplan bleibt für den Monatsabschluss gespeichert." /> : null}
      {ansicht === 'woche' ? <Woche /> : <MonatAnsicht />}
    </ScrollView>
  );
}
