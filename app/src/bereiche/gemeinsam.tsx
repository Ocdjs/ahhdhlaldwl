// Gemeinsame Bausteine mehrerer Bereiche: Auswahlkachel, Hinweiskarte, Kopfzeile eines Bereichs, Reiter.
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { kurz, pd } from '../domain/datum';
import type { Notiz } from '../domain/typen';
import { radius } from '../theme/tokens';
import { Icon, T } from '../ui/basis';
import { useFarben } from '../ui/theme';

export function Wahl({ titel, text, an, onPress, icon, style, testID }: { titel: string; text?: string; an: boolean; onPress: () => void; icon?: string; style?: StyleProp<ViewStyle>; testID?: string }) {
  const f = useFarben();
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: an }} accessibilityLabel={titel} testID={testID} onPress={onPress}
      style={[{ flexGrow: 1, flexBasis: 220, minHeight: icon ? 72 : 96, padding: 16, paddingHorizontal: 18, borderRadius: radius.l, backgroundColor: an ? f.flaeche : f.flaeche2, borderWidth: 3, borderColor: an ? f.tinte : 'transparent', flexDirection: icon ? 'row' : 'column', alignItems: icon ? 'center' : 'flex-start', gap: icon ? 14 : 4 }, style]}>
      {icon ? <Icon name={icon} /> : null}
      <View style={{ flex: icon ? 1 : undefined, gap: 4 }}>
        <T art="abschnitt">{titel}</T>
        {text ? <T art="klein" farbe={f.tinte2}>{text}</T> : null}
      </View>
    </Pressable>
  );
}
export function HinweisKarte({ von, kopf, text, wichtig, icon, vorfall, rechts, blass }: { von: string; kopf?: string; text: string; wichtig?: boolean; icon?: string; vorfall?: boolean; rechts?: ReactNode; blass?: boolean }) {
  const f = useFarben();
  return (
    <View style={{ gap: 6, padding: 16, paddingHorizontal: 18, borderRadius: radius.l, backgroundColor: wichtig ? f.warnungFlaeche : f.flaeche, borderWidth: vorfall ? 3 : 0, borderColor: f.vorfall, opacity: blass ? 0.7 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Icon name={icon || (wichtig ? 'warnung' : 'person')} groesse={18} farbe={wichtig ? f.warnung : f.tinte2} />
        <T art="label" farbe={f.tinte}>{von}</T>
        {kopf ? <T art="klein" farbe={f.tinte2} style={{ fontSize: 14, flexShrink: 1 }}>· {kopf}</T> : null}
        {rechts ? <View style={{ marginLeft: 'auto' }}>{rechts}</View> : null}
      </View>
      <T art="text">{text}</T>
    </View>
  );
}
export function BereichKopf({ titel, children }: { titel: string; children?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
      <T art="titelGross" style={{ flex: 1, minWidth: 200 }}>{titel}</T>
      {children}
    </View>
  );
}
export function Reiter<K extends string>({ optionen, wert, onChange }: { optionen: [K, string, string?, string?][]; wert: K; onChange: (k: K) => void }) {
  const f = useFarben();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 999, backgroundColor: f.flaeche, alignSelf: 'flex-start', flexWrap: 'wrap' }}>
      {optionen.map(([k, t, icon, zahl]) => {
        const an = k === wert;
        return (
          <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: an }} accessibilityLabel={t} testID={'reiter-' + k} onPress={() => onChange(k)}
            style={{ minHeight: 48, paddingHorizontal: 20, borderRadius: 999, backgroundColor: an ? f.primaer : 'transparent', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {icon ? <Icon name={icon} groesse={18} farbe={an ? f.aufPrimaer : f.tinte2} /> : null}
            <T art="label" farbe={an ? f.aufPrimaer : f.tinte2} style={{ fontSize: 16, lineHeight: 20 }}>{t}</T>
            {zahl ? <T art="zahlKlein" farbe={an ? f.aufPrimaer : f.tinte2} style={{ opacity: 0.8 }}>{zahl}</T> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Notizen eines Gasts, neueste zuerst; „bei Wiederaufnahme“ markiert. */
export function NotizListe({ notizen }: { notizen: Notiz[] }) {
  const f = useFarben();
  if (!notizen.length) return <T art="beschr">Noch keine Notizen.</T>;
  return (
    <View style={{ gap: 8 }}>
      {notizen.slice().reverse().map((n, i) => (
        <View key={i} style={{ gap: 4, padding: 12, paddingHorizontal: 14, borderRadius: radius.m, backgroundColor: f.flaeche2 }}>
          {n.aufnahme ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 10, borderRadius: 999, backgroundColor: f.warnungFlaeche }}><Icon name="glocke" groesse={14} farbe={f.warnung} /><T art="label" farbe={f.warnung} style={{ fontSize: 13 }}>bei Wiederaufnahme</T></View> : null}
          <T art="text" style={{ fontSize: 16, lineHeight: 23 }}>{n.text}</T>
          <T art="beschr">{kurz(pd(n.datum))} · {n.von}{n.quelle ? ' · ' + n.quelle : ''}</T>
        </View>
      ))}
    </View>
  );
}
