// Grundriss St. Pius und St. Nikolaus (Designsystem › Grundriss, Tür und Bad).
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { GR, GR_NIKO, TUEREN, type Rechteck } from '../../domain/haus';
import { useWelt } from '../../store/store';
import { Icon, T } from '../../ui/basis';
import { F, useFarben } from '../../ui/theme';
import { Bettkarte, Schraffur } from './Bettkarte';
import { badAntippen } from './handlungen';

/** Tür: Blatt dreht beim Schließen um die Angel in die Wand (700 ms), Bogen blendet aus. */
function Tuer({ id, zu }: { id: string; zu: boolean }) {
  const f = useFarben();
  const t = TUEREN[id];
  const wert = useRef(new Animated.Value(zu ? 1 : 0)).current;
  const [p, setP] = useState(zu ? 1 : 0);
  const erst = useRef(true);
  useEffect(() => {
    const l = wert.addListener(({ value }) => setP(value));
    return () => wert.removeListener(l);
  }, [wert]);
  useEffect(() => {
    if (erst.current) { erst.current = false; return; }
    Animated.timing(wert, { toValue: zu ? 1 : 0, duration: 700, easing: zu ? Easing.bezier(0.55, 0, 0.85, 0.35) : Easing.bezier(0.3, 0, 0.8, 0.15), useNativeDriver: false }).start();
  }, [zu, wert]);
  const [hx, hy] = t.h, dx = t.o[0] - hx, dy = t.o[1] - hy;
  const r = (t.w * p * Math.PI) / 180;
  const ex = hx + dx * Math.cos(r) - dy * Math.sin(r), ey = hy + dx * Math.sin(r) + dy * Math.cos(r);
  const rz = (t.w * Math.PI) / 180, cx = Math.round(hx + dx * Math.cos(rz) - dy * Math.sin(rz)), cy = Math.round(hy + dx * Math.sin(rz) + dy * Math.cos(rz));
  const dick = 1.5 + 4.5 * p;
  return (
    <G>
      <Path d={`M${cx} ${cy} A72 72 0 0 ${t.w < 0 ? 1 : 0} ${t.o[0]} ${t.o[1]}`} fill="none" stroke={f.tinte3} strokeWidth={1.5} opacity={Math.max(0, 1 - p * 1.6)} />
      <Path d={`M${hx} ${hy} L${ex.toFixed(1)} ${ey.toFixed(1)}`} stroke={p > 0.85 ? f.tinte : f.tinte3} strokeWidth={dick} strokeLinecap={p > 0.85 ? 'square' : 'round'} />
    </G>
  );
}

function Platz({ r, skala, children }: { r: Rechteck; skala: number; children: React.ReactNode }) {
  return <View style={{ position: 'absolute', left: (r[0] + 10) * skala, top: (r[1] + 10) * skala, width: r[2] * skala, height: r[3] * skala, flexDirection: 'row' }}>{children}</View>;
}

function Bad({ skala }: { skala: number }) {
  const w = useWelt();
  const f = useFarben();
  const bz = w.badZustand(), offen = w.duschenOffen();
  const puls = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (bz !== 'erinnern') return;
    const a = Animated.loop(Animated.sequence([Animated.timing(puls, { toValue: 1, duration: 800, useNativeDriver: false }), Animated.timing(puls, { toValue: 0, duration: 800, useNativeDriver: false })]), { iterations: 3 });
    a.start();
    return () => a.stop();
  }, [bz, puls]);
  const r = GR.bad;
  const [bg, fg] = bz === 'frei' ? [f.freiFlaeche, f.frei] : bz === 'erinnern' ? [f.warnungFlaeche, f.warnung] : [f.flaeche3, f.tinte2];
  const unter = bz === 'frei' ? 'frei' : bz === 'erinnern' ? 'Alle geduscht · aufschließen' : w.tag < 0 ? 'abgeschlossen' : 'zu · noch ' + offen.length + (offen.length === 1 ? ' Dusche' : ' Duschen');
  return (
    <Animated.View style={{ position: 'absolute', left: (r[0] + 10) * skala, top: (r[1] + 10) * skala, width: r[2] * skala, height: r[3] * skala, borderRadius: 6, borderWidth: bz === 'erinnern' ? puls.interpolate({ inputRange: [0, 1], outputRange: [3, 6] }) : 0, borderColor: f.warnung }}>
      <Pressable accessibilityRole="button" testID="bad" accessibilityLabel={'Bad, ' + (bz === 'frei' ? 'frei' : bz === 'erinnern' ? 'abgeschlossen, bitte aufschließen' : 'abgeschlossen')} disabled={w.tag < 0} onPress={badAntippen}
        style={{ flex: 1, borderRadius: 6, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6 }}>
        <Icon name={bz === 'frei' ? 'schloss-offen' : bz === 'erinnern' ? 'glocke' : 'schloss'} farbe={fg} />
        <T art="ueber" farbe={fg}>Bad</T>
        <T art="beschr" farbe={fg} style={{ textAlign: 'center', fontSize: 12 }}>{unter}</T>
      </Pressable>
    </Animated.View>
  );
}

export function GrundrissPius() {
  const w = useWelt();
  const f = useFarben();
  const [breite, setBreite] = useState(0);
  const skala = breite / GR.breite;
  const off = w.S.offRooms, flurZu = !!(off.T && off.F);
  const zu = w.tuerenZu();
  const boden = (id: string, r: Rechteck, aus: boolean) => <Rect key={id} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill={aus ? 'url(#gr-schraffur)' : f.flaeche} />;
  const notiz = { fontFamily: F.uiFett, fontSize: 13, letterSpacing: 1.5, fill: f.tinte3 } as const;
  return (
    <View onLayout={(e) => setBreite(e.nativeEvent.layout.width)} style={{ width: '100%', aspectRatio: GR.breite / GR.hoehe }} accessibilityLabel="Grundriss St. Pius">
      {breite > 0 ? (
        <>
          <Svg width={breite} height={breite * (GR.hoehe / GR.breite)} viewBox={`-10 -10 ${GR.breite} ${GR.hoehe}`} style={{ position: 'absolute' }}>
            <Schraffur id="gr-schraffur" farbe={f.ausSchraffur} grund={f.ausFlaeche} />
            {Object.entries(GR.boeden).map(([id, r]) => boden(id, r, !!off[id]))}
            {boden('FLUR', GR.flur, flurZu)}
            {GR.privat.map((r, i) => <Rect key={'p' + i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill={f.flaeche3} />)}
            <Path d={GR.privatPfad} fill={f.flaeche3} />
            {GR.notizen.map(([t, x, y], i) => <SvgText key={'n' + i} x={x} y={y} textAnchor="middle" {...notiz}>{t}</SvgText>)}
            <SvgText x={498} y={392} textAnchor="middle" {...notiz}>{flurZu ? 'FLUR GESPERRT' : 'FLUR'}</SvgText>
            {GR.waende.map((d, i) => <Path key={'w' + i} d={d} fill="none" stroke={f.tinte} strokeWidth={6} strokeLinecap="square" />)}
            <Path d={GR.tuerFest} fill="none" stroke={f.tinte3} strokeWidth={1.5} />
            {Object.keys(TUEREN).map((id) => <Tuer key={id + w.tag} id={id} zu={zu[id]} />)}
            {GR.stock.map((k) => <Rect key={'s' + k[0]} x={k[2]} y={k[3]} width={k[4]} height={k[5]} rx={9} fill={f.flaeche3} />)}
            {Object.entries(GR.labels).map(([id, [x, y]]) => (
              <G key={'l' + id}>
                <SvgText x={x} y={y} fontFamily={F.uiFett} fontSize={14} letterSpacing={1.2} fill={f.tinte2}>{GR.namen[id]}</SvgText>
                <SvgText x={x} y={y + 19} fontFamily={F.zahl} fontSize={13} fill={f.tinte3}>{w.raumZahl(id)}</SvgText>
              </G>
            ))}
            <Path d="M382 747 l-7 10 h14 z" fill={f.tinte3} />
            <SvgText x={382} y={775} textAnchor="middle" {...notiz}>TREPPE</SvgText>
          </Svg>
          {Object.entries(GR.einzel).map(([p, r]) => <Platz key={p} r={r} skala={skala}><Bettkarte nr={w.anPlatz(p)} kompakt breite={r[2] * skala} hoehe={r[3] * skala} /></Platz>)}
          {GR.stock.map((k) => {
            const sh = (k[5] - 9) / 2;
            const oben: Rechteck = [k[2] + 3, k[3] + 3, k[4] - 6, sh], unten: Rechteck = [k[2] + 3, k[3] + 6 + sh, k[4] - 6, sh];
            return [
              <Platz key={k[0]} r={oben} skala={skala}><Bettkarte nr={w.anPlatz(k[0])} kompakt breite={oben[2] * skala} hoehe={oben[3] * skala} /></Platz>,
              <Platz key={k[1]} r={unten} skala={skala}><Bettkarte nr={w.anPlatz(k[1])} kompakt breite={unten[2] * skala} hoehe={unten[3] * skala} /></Platz>,
            ];
          })}
          <Bad skala={skala} />
        </>
      ) : null}
    </View>
  );
}

export function GrundrissNiko() {
  const w = useWelt();
  const f = useFarben();
  const [breite, setBreite] = useState(0);
  const skala = breite / GR_NIKO.breite;
  return (
    <View onLayout={(e) => setBreite(e.nativeEvent.layout.width)} style={{ width: '100%', maxWidth: 460, aspectRatio: GR_NIKO.breite / GR_NIKO.hoehe }} accessibilityLabel="St. Nikolaus, Saal">
      {breite > 0 ? (
        <>
          <Svg width={breite} height={breite * (GR_NIKO.hoehe / GR_NIKO.breite)} viewBox={`-10 -10 ${GR_NIKO.breite} ${GR_NIKO.hoehe}`} style={{ position: 'absolute' }}>
            <Schraffur id="niko-schraffur" farbe={f.ausSchraffur} grund={f.ausFlaeche} />
            <Rect x={13} y={13} width={334} height={394} fill={w.S.offRooms.N ? 'url(#niko-schraffur)' : f.flaeche} />
            <Rect x={10} y={10} width={340} height={400} fill="none" stroke={f.tinte} strokeWidth={6} />
            <SvgText x={180} y={204} textAnchor="middle" fontFamily={F.uiFett} fontSize={14} letterSpacing={1.2} fill={f.tinte2}>ST. NIKOLAUS · SAAL</SvgText>
            <SvgText x={180} y={224} textAnchor="middle" fontFamily={F.zahl} fontSize={13} fill={f.tinte3}>{w.raumZahl('N')}</SvgText>
          </Svg>
          {Object.entries(GR_NIKO.einzel).map(([p, r]) => <Platz key={p} r={r} skala={skala}><Bettkarte nr={w.anPlatz(p)} kompakt breite={r[2] * skala} hoehe={r[3] * skala} /></Platz>)}
        </>
      ) : null}
    </View>
  );
}
