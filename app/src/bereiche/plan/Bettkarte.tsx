// Bettkarte (Designsystem › Bettkarte): Nummer, Status, Name, Fußzeile, Symbole. Kompakt im Grundriss.
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, View, type View as RNView } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import { kurz, pd } from '../../domain/datum';
import type { BettStatus } from '../../domain/typen';
import { useU, useWelt } from '../../store/store';
import { Icon, T } from '../../ui/basis';
import { F, useFarben } from '../../ui/theme';
import { bettAntippen } from './handlungen';

const STATUS: Record<BettStatus, [string, string]> = { frei: ['', 'plus'], erwartet: ['erwartet', 'erwartet'], anwesend: ['', 'anwesend'], fehlt: ['fehlt', 'abwesend'], fehlt2: ['fehlt', 'abwesend'], gehalten: ['bis ', 'schloss'], freibis: ['bis ', 'rueckkehr'], aus: ['', 'deaktiviert'] };
const FREI: Partial<Record<BettStatus, boolean>> = { frei: true, freibis: true, fehlt2: true };

export function Schraffur({ id, farbe, grund }: { id: string; farbe: string; grund: string }) {
  return <Defs><Pattern id={id} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><Rect width={8} height={8} fill={grund} /><Line x1={0} y1={0} x2={0} y2={8} stroke={farbe} strokeWidth={1.5} /></Pattern></Defs>;
}

export function Bettkarte({ nr, kompakt, breite, hoehe }: { nr: string; kompakt?: boolean; breite?: number; hoehe?: number }) {
  const w = useWelt();
  const f = useFarben();
  const offen = useU((u) => u.offen === nr);
  const neu = useU((u) => u.neu === nr || u.gesetzt.includes(nr));
  const auswahl = useU((u) => u.auswahl);
  const ref = useRef<RNView>(null);
  const puls = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!neu) return;
    puls.setValue(0.9);
    Animated.spring(puls, { toValue: 1, useNativeDriver: Platform.OS !== 'web', friction: 5 }).start();
  }, [neu, puls]);

  const s = w.status(nr), g = w.gastVon(nr), b = w.S.betten[nr] || { s: 'frei' };
  const { symbole, warn } = w.bettSymbole(nr, !!kompakt);
  const st = STATUS[s];
  const bis = b.bis ? kurz(pd(b.bis)) : '';
  let kopfText = st[0];
  if (s === 'gehalten' || s === 'freibis') kopfText = st[0] + bis;
  if (s === 'fehlt2') kopfText = 'fehlt ' + (b.n || 2) + ' N.';
  const name = FREI[s] ? 'frei' : s === 'aus' ? 'aus' : g?.vorname || '';
  const schmal = kompakt && (breite || 999) < 80;
  let fuss = '';
  if (s === 'frei') fuss = kompakt ? '' : w.ortText(nr) || 'Gast aufnehmen';
  else if (s === 'freibis') fuss = kompakt ? (schmal ? '' : 'bis ') + bis : (g?.vorname || '') + ' kommt zurück';
  else if (s === 'fehlt2') fuss = kompakt ? kopfText : (g?.vorname || '') + ' fehlt';
  else if (s === 'fehlt') fuss = kompakt ? 'fehlt' : 'unentschuldigt';
  else if (s === 'gehalten') fuss = kompakt ? (schmal ? '' : 'bis ') + bis : 'freigehalten';
  else if (s !== 'aus' && !kompakt && g) fuss = (b.fort ? 'fortgeschrieben · ' : '') + (g.naechte === 1 ? '1 Nacht' : g.naechte + ' N.');

  // Farben je Zustand
  let bg = f.flaeche, rand = f.linieStark, randBreite = 2, schrift = f.tinte, statusFarbe = f.tinte, fussFarbe = f.tinte, nameFarbe = f.tinte;
  if (s === 'frei' || s === 'freibis') { bg = f.freiFlaeche; rand = f.frei; schrift = statusFarbe = fussFarbe = nameFarbe = f.frei; }
  if (s === 'erwartet') { bg = f.erwartetFlaeche; rand = f.blau; statusFarbe = f.blau; }
  if (s === 'anwesend') { bg = f.anwesend; randBreite = 0; schrift = statusFarbe = fussFarbe = nameFarbe = f.aufAnwesend; }
  if (s === 'gehalten') { bg = f.gehaltenFlaeche; nameFarbe = f.tinte2; }
  if (s === 'fehlt') { bg = f.erwartetFlaeche; rand = f.warnung; statusFarbe = fussFarbe = f.warnung; }
  if (s === 'fehlt2') { bg = f.freiFlaeche; rand = f.frei; nameFarbe = f.frei; statusFarbe = fussFarbe = f.warnung; }
  if (s === 'aus') { bg = f.ausFlaeche; rand = f.ausSchraffur; randBreite = 1.5; schrift = statusFarbe = fussFarbe = nameFarbe = f.tinte3; }
  const freiName = FREI[s];
  const ausgegraut = !!auswahl && (s === 'aus' || nr === auswahl);
  const wort: Record<BettStatus, string> = { frei: 'frei', erwartet: 'erwartet', anwesend: 'anwesend', fehlt: 'fehlt unentschuldigt, zählt als belegt', fehlt2: 'fehlt ' + (b.n || 2) + ' Nächte in Folge, zählt als frei', gehalten: 'freigehalten bis ' + bis, freibis: 'frei bis ' + bis, aus: 'gesperrt' };
  const label = 'Bett ' + nr + (w.lageVon(nr) ? ' ' + w.lageVon(nr) : '') + ', ' + wort[s] + (g && !FREI[s] && s !== 'aus' ? ', ' + g.vorname : '');

  return (
    <Animated.View style={[{ transform: [{ scale: puls }], opacity: ausgegraut ? 0.35 : 1 }, kompakt ? { flex: 1 } : { width: 152 }]}>
      <Pressable ref={ref} accessibilityRole="button" accessibilityLabel={label} testID={'bett-' + nr} disabled={s === 'aus'}
        onPress={() => ref.current?.measureInWindow((x, y, bw, bh) => bettAntippen(nr, { x, y, w: bw, h: bh }))}
        style={({ pressed }) => [{
          flex: kompakt ? 1 : undefined, minHeight: kompakt ? 0 : 88, width: kompakt ? breite : 152, height: kompakt ? hoehe : undefined,
          paddingTop: kompakt ? 5 : 9, paddingBottom: kompakt ? 5 : 10, paddingLeft: kompakt ? (schmal ? 6 : 8) : 12, paddingRight: kompakt ? (schmal ? 5 : 7) : 12,
          borderRadius: kompakt ? 8 : 10, backgroundColor: bg, borderWidth: randBreite, borderColor: rand, justifyContent: 'space-between', overflow: 'hidden',
          transform: [{ scale: pressed ? 0.97 : 1 }],
        }, offen && { borderWidth: 3, borderColor: f.fokus }]}>
        {s === 'aus' ? <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%"><Schraffur id={'aus-' + nr} farbe={f.ausSchraffur} grund={f.ausFlaeche} /><Rect width="100%" height="100%" fill={`url(#aus-${nr})`} /></Svg> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, minHeight: kompakt ? 16 : 20 }}>
          <T art="zahlKlein" farbe={schrift} style={{ fontFamily: F.zahlHalb, fontSize: kompakt ? 13 : 15, lineHeight: kompakt ? 16 : 18, opacity: 0.8 }}>{nr}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {!kompakt && kopfText ? <T art="label" farbe={statusFarbe} style={{ fontSize: 13, lineHeight: 16 }}>{kopfText}</T> : null}
            <Icon name={st[1]} groesse={kompakt ? 16 : 18} farbe={statusFarbe} />
          </View>
        </View>
        <T art="titel" zeilen={1} farbe={nameFarbe} style={{ fontFamily: freiName ? F.uiHalb : F.uiFett, fontSize: kompakt ? (freiName ? (schmal ? 14 : 15) : schmal ? 14.5 : 16) : freiName ? 17 : 20, lineHeight: kompakt ? 20 : 24 }}>{name}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: kompakt ? 14 : 20 }}>
          <T art="beschr" zeilen={1} farbe={fussFarbe} style={{ flexShrink: 1, fontFamily: kompakt ? F.uiHalb : s === 'anwesend' || s === 'erwartet' ? F.zahl : F.ui, fontSize: kompakt ? 12 : 13, lineHeight: kompakt ? 14 : 16 }}>{fuss}</T>
          <View style={{ flexDirection: 'row', gap: 2, marginLeft: 'auto' }}>{symbole.map((n) => <Icon key={n} name={n} groesse={kompakt ? 15 : 18} farbe={n === 'warnung' ? (s === 'anwesend' ? f.aufAnwesend : f.warnung) : fussFarbe} />)}</View>
        </View>
      </Pressable>
      {warn ? <View pointerEvents="none" style={{ position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: kompakt ? 11 : 14, borderWidth: 2, borderColor: f.warnung }} /> : null}
    </Animated.View>
  );
}
