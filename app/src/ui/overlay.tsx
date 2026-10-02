// Blätter, Dialoge, Einblendungen, PIN-Raster und Unterschriftsfeld.
import { useRef, useState, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, PanResponder, Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Unterschrift } from '../domain/typen';
import { schliessen, toastWeg, useU } from '../store/store';
import { radius } from '../theme/tokens';
import { Icon, IconKnopf, Knopf, T } from './basis';
import { F, useFarben } from './theme';

// ---------- Blatt und Dialog ----------
export function Blatt({ titel, text, children, knoepfe, breit }: { titel: string; text?: string; children?: ReactNode; knoepfe?: ReactNode; breit?: boolean }) {
  const f = useFarben();
  const { height, width } = useWindowDimensions();
  return (
    <View accessibilityRole="none" accessibilityLabel={titel} style={{ width: Math.min(breit ? 780 : 560, width - 32), maxHeight: height - 48, backgroundColor: f.flaeche, borderRadius: radius.l, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 24, paddingBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <T art="titel">{titel}</T>
          {text ? <T art="klein" farbe={f.tinte2} style={{ marginTop: 4 }}>{text}</T> : null}
        </View>
        <IconKnopf icon="schliessen" label="Schließen" flaeche onPress={schliessen} />
      </View>
      <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16, gap: 16 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      {knoepfe ? <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap', paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 }}>{knoepfe}</View> : null}
    </View>
  );
}
export function Dialog({ titel, text, children, knoepfe }: { titel: string; text?: string; children?: ReactNode; knoepfe: ReactNode }) {
  const f = useFarben();
  const { width } = useWindowDimensions();
  return (
    <View accessibilityRole="alert" style={{ width: Math.min(480, width - 32), backgroundColor: f.flaeche, borderRadius: radius.l, padding: 24, gap: 14, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 16, elevation: 8 }}>
      <T art="titel">{titel}</T>
      {text ? <T art="text" farbe={f.tinte2}>{text}</T> : null}
      {children}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>{knoepfe}</View>
    </View>
  );
}
export function ModalHost() {
  const modal = useU((u) => u.modal);
  const f = useFarben();
  if (!modal) return null;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Pressable accessibilityLabel="Schließen" onPress={schliessen} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: f.abdunklung }} />
      {modal.inhalt}
    </KeyboardAvoidingView>
  );
}

// ---------- Einblendungen ----------
export function Toasts() {
  const toasts = useU((u) => u.toasts);
  const f = useFarben();
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 84, right: 20, zIndex: 70, gap: 8 }}>
      {toasts.map((t) => (
        <View key={t.id} accessibilityLiveRegion="polite" style={{ width: 380, flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14, paddingRight: 8, borderRadius: radius.l, backgroundColor: f.flaeche, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 16, elevation: 6 }}>
          <Icon name={t.sym} farbe={t.sym === 'warnung' ? f.warnung : f.blau} />
          <View style={{ flex: 1 }}><T art="stark">{t.titel}</T>{t.text ? <T art="klein" farbe={f.tinte2}>{t.text}</T> : null}</View>
          <IconKnopf icon="schliessen" label="Schließen" onPress={() => toastWeg(t.id)} />
        </View>
      ))}
    </View>
  );
}

// ---------- PIN-Raster ----------
export function PinRaster({ titel, hinweis, onCode }: { titel?: string; hinweis?: string; onCode: (code: string) => boolean }) {
  const f = useFarben();
  const [pin, setPin] = useState('');
  const wackel = useRef(new Animated.Value(0)).current;
  const taste = (x: string) => {
    if (x === '⌫') { setPin(pin.slice(0, -1)); return; }
    const neu = (pin + x).slice(0, 4);
    setPin(neu);
    if (neu.length === 4) {
      if (!onCode(neu)) {
        setPin('');
        Animated.sequence([-8, 7, -5, 3, 0].map((v) => Animated.timing(wackel, { toValue: v, duration: 60, useNativeDriver: Platform.OS !== 'web' }))).start();
      }
    }
  };
  return (
    <View style={{ alignItems: 'center', gap: 20, paddingVertical: 8 }}>
      {titel ? <T art="titel">{titel}</T> : null}
      <Animated.View style={{ flexDirection: 'row', gap: 14, transform: [{ translateX: wackel }] }}>
        {[0, 1, 2, 3].map((i) => <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: i < pin.length ? f.tinte : 'transparent', borderWidth: i < pin.length ? 0 : 2, borderColor: f.linieStark }} />)}
      </Animated.View>
      <View style={{ width: 264, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((x, i) => x ? (
          <Pressable key={i} accessibilityRole="button" accessibilityLabel={x === '⌫' ? 'Löschen' : x} testID={'pin-' + x} onPress={() => taste(x)} style={({ pressed }) => ({ width: 80, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? f.flaeche3 : f.flaeche2 })}>
            <T art="zahlGross" style={{ fontSize: 26 }}>{x}</T>
          </Pressable>
        ) : <View key={i} style={{ width: 80, height: 72 }} />)}
      </View>
      {hinweis ? <T art="beschr" style={{ textAlign: 'center' }}>{hinweis}</T> : null}
    </View>
  );
}

// ---------- Unterschrift ----------
export function MiniUnterschrift({ sig, hoehe = 44, breite }: { sig: Unterschrift; hoehe?: number; breite?: number }) {
  const f = useFarben();
  return <Svg height={hoehe} width={breite ?? (hoehe * sig.w) / sig.h} viewBox={`0 0 ${sig.w} ${sig.h}`}><Path d={sig.d} fill="none" stroke={f.stiftTinte} strokeWidth={Math.max(2, sig.w / 140)} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
/** Unterschrift mit Finger oder Stift; „Bestätigen“ gibt die Pfade zurück. */
export function UnterschriftFeld({ wer, wofuer, onFertig, fertig, knopfText = 'Bestätigen', hoehe = 220, testID }: { wer: string; wofuer: string; onFertig: (s: Unterschrift) => void; fertig?: Unterschrift | null; knopfText?: string; hoehe?: number; testID?: string }) {
  const f = useFarben();
  const [pfade, setPfade] = useState<string[]>([]);
  const [aktuell, setAktuell] = useState('');
  const [breite, setBreite] = useState(400);
  const ref = useRef({ d: '', pfade: [] as string[] });
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { const { locationX: x, locationY: y } = e.nativeEvent; ref.current.d = `M${x.toFixed(1)} ${y.toFixed(1)}`; setAktuell(ref.current.d); },
    onPanResponderMove: (e) => { const { locationX: x, locationY: y } = e.nativeEvent; ref.current.d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; setAktuell(ref.current.d); },
    onPanResponderRelease: () => { if (ref.current.d.includes('L')) { ref.current.pfade = [...ref.current.pfade, ref.current.d]; setPfade(ref.current.pfade); } ref.current.d = ''; setAktuell(''); },
    onPanResponderTerminationRequest: () => false,
  })).current;
  const leer = pfade.length === 0;
  if (fertig) {
    return (
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T art="stark" style={{ fontSize: 17 }}>{wer}</T><T art="klein" farbe={f.tinte2}>bestätigt</T></View>
        <View style={{ height: hoehe, borderRadius: radius.l, backgroundColor: f.papier, borderWidth: 3, borderColor: f.frei, alignItems: 'center', justifyContent: 'center' }}>
          <MiniUnterschrift sig={fertig} hoehe={hoehe - 40} />
          <View style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999, backgroundColor: f.frei }}><Icon name="check" groesse={16} farbe={f.aufFrei} /><T art="label" farbe={f.aufFrei}>Bestätigt</T></View>
        </View>
      </View>
    );
  }
  return (
    <View style={{ gap: 8 }} testID={testID}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><T art="stark" style={{ fontSize: 17 }}>{wer}</T><T art="klein" farbe={f.tinte2}>{wofuer}</T></View>
      <View onLayout={(e) => setBreite(e.nativeEvent.layout.width)} {...pan.panHandlers} testID={testID ? testID + '-feld' : undefined}
        style={{ height: hoehe, borderRadius: radius.l, backgroundColor: f.papier, borderWidth: 2, borderColor: f.papierLinie, overflow: 'hidden' }}>
        <View pointerEvents="none" style={{ position: 'absolute', left: 28, right: 28, bottom: 52, height: 2, backgroundColor: f.papierLinie }} />
        <T art="text" farbe={f.papierLinie} style={{ position: 'absolute', left: 28, bottom: 56, fontSize: 26 }}>×</T>
        {leer && !aktuell ? <T art="klein" farbe={f.aufPapier2} style={{ position: 'absolute', left: 0, right: 0, bottom: 16, textAlign: 'center', fontSize: 14 }}>Mit Finger oder Stift unterschreiben</T> : null}
        <Svg pointerEvents="none" width={breite} height={hoehe} style={{ position: 'absolute', top: 0, left: 0 }}>
          {pfade.concat(aktuell ? [aktuell] : []).map((d, i) => <Path key={i} d={d} fill="none" stroke={f.stiftTinte} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />)}
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
        <Knopf text="Löschen" icon="rueckgaengig" klein onPress={() => { ref.current.pfade = []; setPfade([]); }} />
        <Knopf text={knopfText} art="primaer" klein disabled={leer} testID={testID ? testID + '-ok' : undefined} onPress={() => onFertig({ w: Math.round(breite), h: hoehe, d: pfade.join(' ') })} />
      </View>
    </View>
  );
}
export const schriftRtl = { fontFamily: F.rtl };
