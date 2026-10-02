// Grundbausteine nach dem Designsystem (Knöpfe, Chips, Segmente, Schalter, Pillen, Zeilen, Eingaben).
import { useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { KARTE, PFADE } from '../icons/pfade';
import { radius } from '../theme/tokens';
import { F, useFarben } from './theme';

// ---------- Text ----------
export type TextArt = 'titelGross' | 'titel' | 'abschnitt' | 'text' | 'klein' | 'stark' | 'label' | 'beschr' | 'knopf' | 'ueber' | 'zahl' | 'zahlKlein' | 'zahlGross';
const TEXT: Record<TextArt, TextStyle> = {
  titelGross: { fontFamily: F.uiFett, fontSize: 28, lineHeight: 34 },
  titel: { fontFamily: F.uiFett, fontSize: 22, lineHeight: 28 },
  abschnitt: { fontFamily: F.uiFett, fontSize: 18, lineHeight: 24 },
  text: { fontFamily: F.ui, fontSize: 17, lineHeight: 26 },
  klein: { fontFamily: F.ui, fontSize: 15, lineHeight: 22 },
  stark: { fontFamily: F.uiHalb, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: F.uiHalb, fontSize: 14, lineHeight: 18 },
  beschr: { fontFamily: F.ui, fontSize: 13, lineHeight: 18 },
  knopf: { fontFamily: F.uiHalb, fontSize: 17, lineHeight: 24 },
  ueber: { fontFamily: F.uiFett, fontSize: 13, lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' },
  zahl: { fontFamily: F.zahlHalb, fontSize: 20, lineHeight: 26 },
  zahlKlein: { fontFamily: F.zahl, fontSize: 13, lineHeight: 16 },
  zahlGross: { fontFamily: F.zahlHalb, fontSize: 28, lineHeight: 32 },
};
export function T({ art = 'text', farbe, style, children, zeilen, ...rest }: { art?: TextArt; farbe?: string; style?: StyleProp<TextStyle>; children?: ReactNode; zeilen?: number; selectable?: boolean; testID?: string }) {
  const f = useFarben();
  const standard = art === 'beschr' || art === 'label' ? f.tinte2 : f.tinte;
  return <Text numberOfLines={zeilen} style={[TEXT[art], { color: farbe || standard }, style]} {...rest}>{children}</Text>;
}

// ---------- Symbol ----------
export function Icon({ name, groesse = 24, farbe, style }: { name: string; groesse?: number; farbe?: string; style?: StyleProp<ViewStyle> }) {
  const f = useFarben();
  if (name === 'karte-gelb' || name === 'karte-rot') {
    const gelb = name === 'karte-gelb';
    return <Svg width={groesse} height={groesse} viewBox="0 0 24 24" style={style}><Path d={KARTE} fill={gelb ? f.karteGelb : f.karteRot} stroke={gelb ? f.karteGelbRand : f.karteRot} strokeWidth={1.5} strokeLinejoin="round" /></Svg>;
  }
  const d = (PFADE as Record<string, string>)[name] || PFADE.info;
  return <Svg width={groesse} height={groesse} viewBox="0 0 24 24" style={style}><Path d={d} fill="none" stroke={farbe || f.tinte} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}

// ---------- Knöpfe ----------
type KnopfArt = 'normal' | 'primaer' | 'rahmen' | 'gefahr' | 'gefahrVoll';
export function Knopf({ text, onPress, art = 'normal', klein, icon, disabled, breit, style, testID }: { text: string; onPress?: () => void; art?: KnopfArt; klein?: boolean; icon?: string; disabled?: boolean; breit?: boolean; style?: StyleProp<ViewStyle>; testID?: string }) {
  const f = useFarben();
  const bg = art === 'primaer' ? f.primaer : art === 'gefahrVoll' ? f.vorfall : art === 'rahmen' ? f.flaeche : f.flaeche2;
  const fg = art === 'primaer' ? f.aufPrimaer : art === 'gefahrVoll' ? f.aufVorfall : art === 'gefahr' ? f.vorfall : f.tinte;
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={text} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [{ minHeight: klein ? 48 : 56, paddingHorizontal: klein ? 16 : 22, borderRadius: radius.m, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: disabled ? 0.42 : 1, transform: [{ scale: pressed && !disabled ? 0.97 : 1 }] },
        art === 'rahmen' && { borderWidth: 1.5, borderColor: f.linieStark }, breit && { alignSelf: 'stretch' }, style]}>
      {icon ? <Icon name={icon} farbe={fg} groesse={klein ? 20 : 24} /> : null}
      <T art="knopf" farbe={fg} style={klein ? { fontSize: 15, lineHeight: 20 } : undefined}>{text}</T>
    </Pressable>
  );
}
export function IconKnopf({ icon, onPress, label, flaeche, disabled, zaehler, testID }: { icon: string; onPress?: () => void; label: string; flaeche?: boolean; disabled?: boolean; zaehler?: number; testID?: string }) {
  const f = useFarben();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
      style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? f.flaeche3 : flaeche ? f.flaeche2 : 'transparent', opacity: disabled ? 0.42 : 1 })}>
      <Icon name={icon} farbe={f.tinte2} />
      {zaehler ? <View style={{ position: 'absolute', top: 4, right: 2, minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: f.warnung, alignItems: 'center', justifyContent: 'center' }}><T art="zahlKlein" farbe={f.flaeche} style={{ fontFamily: F.zahlHalb }}>{zaehler}</T></View> : null}
    </Pressable>
  );
}

// ---------- Chips, Segmente, Schalter, Pillen ----------
export function Chip({ text, an, onPress, icon, disabled, klein, style, nebentext }: { text: string; an?: boolean; onPress?: () => void; icon?: string; disabled?: boolean; klein?: boolean; style?: StyleProp<ViewStyle>; nebentext?: string }) {
  const f = useFarben();
  const fg = an ? f.aufPrimaer : f.tinte;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!an, disabled }} accessibilityLabel={text} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [{ minHeight: klein ? 40 : 48, paddingHorizontal: 16, borderRadius: 999, backgroundColor: an ? f.primaer : f.flaeche2, flexDirection: 'row', alignItems: 'center', gap: 8, opacity: disabled ? 0.42 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}>
      {an ? <Icon name="check" groesse={18} farbe={fg} /> : icon ? <Icon name={icon} groesse={18} farbe={fg} /> : null}
      <T art="label" farbe={fg} style={{ fontSize: 15, lineHeight: 20 }}>{text}</T>
      {nebentext ? <T art="beschr" farbe={fg}>{nebentext}</T> : null}
    </Pressable>
  );
}
export function Chips({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, style]}>{children}</View>;
}
export function Seg<K extends string>({ optionen, wert, onChange, disabled, style, minBreite = 96 }: { optionen: [K, string][]; wert: K | null; onChange: (k: K) => void; disabled?: boolean; style?: StyleProp<ViewStyle>; minBreite?: number }) {
  const f = useFarben();
  return (
    <View accessibilityRole="radiogroup" style={[{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: f.flaeche2, alignSelf: 'flex-start' }, style]}>
      {optionen.map(([k, t]) => {
        const an = k === wert;
        return (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: an, disabled }} accessibilityLabel={t} disabled={disabled} onPress={() => onChange(k)}
            style={{ minHeight: 48, minWidth: minBreite, paddingHorizontal: 12, borderRadius: radius.m, backgroundColor: an ? f.primaer : 'transparent', alignItems: 'center', justifyContent: 'center', flexGrow: 1, opacity: disabled && !an ? 0.6 : 1 }}>
            <T art="label" farbe={an ? f.aufPrimaer : f.tinte2} style={{ fontSize: 16, lineHeight: 20, textAlign: 'center' }}>{t}</T>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Schalter({ an, onChange, label, disabled }: { an: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  const f = useFarben();
  const x = useRef(new Animated.Value(an ? 28 : 0)).current;
  const [letzt, setLetzt] = useState(an);
  if (letzt !== an) { setLetzt(an); Animated.timing(x, { toValue: an ? 28 : 0, duration: 150, useNativeDriver: Platform.OS !== 'web' }).start(); }
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: an, disabled }} accessibilityLabel={label} disabled={disabled} onPress={() => onChange(!an)} style={{ width: 60, height: 48, justifyContent: 'center', opacity: disabled ? 0.42 : 1 }}>
      <View style={{ width: 60, height: 32, borderRadius: 16, backgroundColor: an ? f.primaer : f.flaeche3, borderWidth: an ? 0 : 1.5, borderColor: f.linieStark }} />
      <Animated.View style={{ position: 'absolute', left: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: an ? f.aufPrimaer : f.linieStark, transform: [{ translateX: x }] }} />
    </Pressable>
  );
}
type PillenArt = 'normal' | 'warnung' | 'frei' | 'blau' | 'vorfall';
export function Pille({ text, art = 'normal', icon, onPress }: { text: string; art?: PillenArt; icon?: string; onPress?: () => void }) {
  const f = useFarben();
  const [bg, fg] = art === 'warnung' ? [f.warnungFlaeche, f.warnung] : art === 'frei' ? [f.freiFlaeche, f.frei] : art === 'blau' ? [f.erwartetFlaeche, f.blau] : art === 'vorfall' ? [f.vorfallFlaeche, f.vorfall] : [f.flaeche2, f.tinte2];
  const inhalt = <>{icon ? <Icon name={icon} groesse={16} farbe={icon.startsWith('karte') ? undefined : fg} /> : null}<T art="label" farbe={fg}>{text}</T></>;
  const stil: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: bg, alignSelf: 'flex-start' };
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={stil}>{inhalt}</Pressable> : <View style={stil}>{inhalt}</View>;
}
export function Bald({ text = 'noch nicht verfügbar' }: { text?: string }) {
  const f = useFarben();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 2, borderRadius: radius.s, borderWidth: 1.5, borderStyle: 'dashed', borderColor: f.linieStark, alignSelf: 'flex-start' }}><Icon name="uhr" groesse={16} farbe={f.tinte3} /><T art="label" farbe={f.tinte3} style={{ fontSize: 13 }}>{text}</T></View>;
}

// ---------- Flächen ----------
export function Karte({ children, style, vorfall }: { children: ReactNode; style?: StyleProp<ViewStyle>; vorfall?: boolean }) {
  const f = useFarben();
  return <View style={[{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 24, gap: 20 }, vorfall && { borderWidth: 3, borderColor: f.vorfall }, style]}>{children}</View>;
}
type ZeilenArt = 'normal' | 'warnung' | 'vorfall';
export function Zeile({ icon, titel, klein, art = 'normal', rechts, onPress, fett, style }: { icon?: string; titel: ReactNode; klein?: ReactNode; art?: ZeilenArt; rechts?: ReactNode; onPress?: () => void; fett?: boolean; style?: StyleProp<ViewStyle> }) {
  const f = useFarben();
  const bg = art === 'warnung' ? f.warnungFlaeche : art === 'vorfall' ? f.vorfallFlaeche : f.flaeche2;
  const fg = art === 'warnung' ? f.warnung : art === 'vorfall' ? f.vorfall : f.tinte;
  const inhalt = (
    <>
      {icon ? <Icon name={icon} farbe={fg} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {typeof titel === 'string' ? <T art={fett || art !== 'normal' ? 'stark' : 'text'} farbe={art === 'normal' ? f.tinte : fg} style={{ fontSize: 16, lineHeight: 22 }}>{titel}</T> : titel}
        {klein ? typeof klein === 'string' ? <T art="klein" farbe={f.tinte2} style={{ fontSize: 14, lineHeight: 20 }}>{klein}</T> : klein : null}
      </View>
      {rechts}
    </>
  );
  const stil: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.m, backgroundColor: bg };
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [stil, { opacity: pressed ? 0.8 : 1 }, style]}>{inhalt}</Pressable> : <View style={[stil, style]}>{inhalt}</View>;
}
export function Banner({ icon, titel, klein, rechts, blau }: { icon: string; titel: string; klein?: string; rechts?: ReactNode; blau?: boolean }) {
  const f = useFarben();
  const [bg, fg] = blau ? [f.erwartetFlaeche, f.blau] : [f.warnungFlaeche, f.warnung];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.m, backgroundColor: bg, flexWrap: 'wrap' }}>
      <Icon name={icon} farbe={fg} />
      <View style={{ flex: 1, minWidth: 200 }}><T art="stark" farbe={fg}>{titel}</T>{klein ? <T art="klein" farbe={fg} style={{ fontSize: 14, lineHeight: 20 }}>{klein}</T> : null}</View>
      {rechts}
    </View>
  );
}
export function Feld({ label, children, style }: { label: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap: 6 }, style]}><T art="label">{label}</T>{children}</View>;
}
export function Eingabe({ mehrzeilig, style, ...rest }: TextInputProps & { mehrzeilig?: boolean }) {
  const f = useFarben();
  const [fokus, setFokus] = useState(false);
  return (
    <TextInput placeholderTextColor={f.tinte3} multiline={mehrzeilig} textAlignVertical={mehrzeilig ? 'top' : 'center'}
      onFocus={(e) => { setFokus(true); rest.onFocus?.(e); }} onBlur={(e) => { setFokus(false); rest.onBlur?.(e); }}
      {...rest}
      style={[{ minHeight: mehrzeilig ? 132 : 56, paddingHorizontal: 16, paddingVertical: mehrzeilig ? 14 : 0, borderRadius: radius.m, borderWidth: 2, borderColor: fokus ? f.fokus : 'transparent', backgroundColor: fokus ? f.flaeche : f.flaeche2, color: f.tinte, fontFamily: F.ui, fontSize: 17 }, style]} />
  );
}
export function Abschnitt({ titel, children, style }: { titel: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap: 10 }, style]}><T art="abschnitt">{titel}</T>{children}</View>;
}
export function Daten({ paare }: { paare: [string, ReactNode][] }) {
  const f = useFarben();
  return (
    <View style={{ gap: 6 }}>
      {paare.map(([k, v]) => (
        <View key={k} style={{ flexDirection: 'row', gap: 16 }}>
          <T art="klein" style={{ width: 130, fontSize: 16 }} farbe={f.tinte2}>{k}</T>
          <View style={{ flex: 1 }}>{typeof v === 'string' || typeof v === 'number' ? <T art="stark">{v}</T> : v}</View>
        </View>
      ))}
    </View>
  );
}
export function Leer({ icon, titel, text, children }: { icon: string; titel: string; text: string; children?: ReactNode }) {
  const f = useFarben();
  return <View style={{ alignItems: 'center', gap: 16, paddingVertical: 64, paddingHorizontal: 24 }}><Icon name={icon} farbe={f.tinte2} groesse={32} /><T art="titel">{titel}</T><T art="klein" farbe={f.tinte2} style={{ textAlign: 'center', maxWidth: 520 }}>{text}</T>{children}</View>;
}
export const stil = StyleSheet.create({ reihe: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }, spalte: { gap: 12 } });
