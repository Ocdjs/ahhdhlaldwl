// Wer handelt? Diensthabende Betreuungsperson nach Unterschrift in der Besetzung, oder die Leitung mit Code.
import { Pressable, View } from 'react-native';
import { kurz, pd } from '../domain/datum';
import { abmelden, altUnterschriftNachholen, besetzungUnterschreiben, dienstBeginnen, leitungAnmelden, personWaehlen } from '../store/aktionen';
import { getS, schliessen, toast, ui, useWelt, welt, zeige } from '../store/store';
import { Icon, Knopf, T, Zeile } from '../ui/basis';
import { Blatt, Dialog, PinRaster, UnterschriftFeld } from '../ui/overlay';
import { useFarben } from '../ui/theme';

/** Vor jeder Änderung aufrufen. Ohne gültige Anmeldung erscheint die Aufforderung zu unterschreiben. */
export function darf(): boolean {
  const w = welt();
  if (w.darfAendern()) return true;
  if (w.vergangen()) { toast('schloss', 'Nur lesen', 'Vergangene Tage lassen sich nicht ändern. Nachträge gehen über die Gastdetails.', 4000); return false; }
  ui({ schnell: null });
  zeige(<Dialog titel="Zuerst unterschreiben" text="Ändern kann nur, wer heute Dienst hat und in der Besetzung unterschrieben hat. Die Leitung meldet sich mit ihrem Code an."
    knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Leitung" klein art="rahmen" onPress={() => zeige(<LeitungBlatt />)} /><Knopf text="Unterschreiben" art="primaer" klein icon="unterschrift" onPress={() => zeige(<AnmeldeBlatt />)} /></>} />);
  return false;
}

/** Liste der Diensthabenden zum Unterschreiben (= Anmelden). */
export function AnmeldeBlatt() {
  const w = useWelt();
  const leute = w.diensthabende();
  return (
    <Blatt titel="Dienst beginnen · unterschreiben" text={'Mit der Unterschrift in der Besetzung meldest du dich an. Ab dann kannst du im Bettenplan und im Bericht ändern. ' + kurz(w.H)}>
      {leute.length ? leute.map((p) => (
        <Zeile key={p.name} icon={p.unterschrieben ? 'check' : 'unterschrift'} titel={p.name} klein={p.unterschrieben ? 'hat unterschrieben' : 'noch nicht unterschrieben'}
          rechts={p.unterschrieben ? <Knopf text="Auswählen" klein art="rahmen" onPress={() => { personWaehlen(p.name); schliessen(); toast('person', p.name + ' ist ausgewählt', 'Änderungen werden mit diesem Namen vermerkt.', 3000); }} />
            : <Knopf text="Unterschreiben" klein art="primaer" testID={'anmelden-' + p.name} onPress={() => zeige(<UnterschreibenBlatt name={p.name} />)} />} />
      )) : <T art="klein">Für heute ist niemand im Dienstplan eingetragen. Bitte die Leitung, den Dienst im Kalender einzutragen.</T>}
      <Pressable onPress={() => zeige(<LeitungBlatt />)} style={{ alignSelf: 'flex-start' }}><T art="label" style={{ textDecorationLine: 'underline' }}>Als Leitung mit Code anmelden</T></Pressable>
    </Blatt>
  );
}

/** Unterschrift einer diensthabenden Person in der Besetzung (legt den Bericht an, falls nötig). */
export function UnterschreibenBlatt({ name }: { name: string }) {
  const w = useWelt();
  return (
    <Blatt titel={'Unterschrift ' + name} text={'Dienst ' + kurz(w.H) + ' · zählt im Monatsabschluss als gemacht'}>
      <UnterschriftFeld wer={name} wofuer="Besetzung" testID="sig-anmelden" onFertig={(sig) => {
        if (!welt().bericht(welt().hIso)) dienstBeginnen();
        const b = getS().berichte[welt().hIso];
        const i = b.besetzung.findIndex((x) => x.name === name);
        if (i >= 0) besetzungUnterschreiben(i, sig);
        schliessen();
        toast('anwesend', name + ' ist angemeldet', 'Unterschrift gespeichert. Ab jetzt kannst du ändern.', 3000);
      }} />
    </Blatt>
  );
}

export function LeitungBlatt() {
  const S = getS();
  return (
    <Blatt titel={S.leitungName + ' anmelden'} text="Code der Leitung eingeben. Änderungen werden mit „Leitung“ vermerkt.">
      <PinRaster hinweis="In der Beispielversion lautet der Code 2580." onCode={(c) => { const ok = leitungAnmelden(c); if (ok) { schliessen(); toast('schloss-offen', 'Leitung angemeldet', 'Gilt bis zum Abmelden oder bis zum nächsten Diensttag.', 3000); } return ok; }} />
    </Blatt>
  );
}

/** Unterschriften früherer Berichte nachholen (Erinnerung an der Glocke). */
export function NachholenBlatt() {
  const w = useWelt();
  const offen: { datum: string; i: number; name: string; rolle: string }[] = [];
  Object.keys(w.S.berichte).forEach((d) => { const b = w.S.berichte[d]; if (b.status === 'abgeschlossen') b.besetzung.forEach((x, i) => { if (!x.sig && x.name !== 'offen') offen.push({ datum: d, i, name: x.name, rolle: x.rolle }); }); });
  return (
    <Blatt titel="Unterschrift nachholen" text="Erst mit Unterschrift zählt der Dienst im Monatsabschluss.">
      {offen.length ? offen.map((o) => <Zeile key={o.datum + o.i} icon="unterschrift" art="warnung" titel={o.name + ' · ' + o.rolle} klein={'Bericht vom ' + kurz(pd(o.datum))}
        rechts={<Knopf text="Jetzt" klein art="primaer" onPress={() => zeige(<Blatt titel={'Unterschrift ' + o.name} text={'Bericht vom ' + kurz(pd(o.datum))}><UnterschriftFeld wer={o.name} wofuer={o.rolle} onFertig={(sig) => { altUnterschriftNachholen(o.datum, o.i, sig); schliessen(); toast('check', 'Unterschrift nachgeholt', o.name + ' · ' + kurz(pd(o.datum)), 3000); }} /></Blatt>)} />}
      />) : <T art="klein">Nichts offen.</T>}
    </Blatt>
  );
}

/** Kopfzeile rechts: Diensthabende als Chips; unterschrieben = auswählbar, sonst „unterschreiben“. Dazu Leitung. */
export function DienstPersonen() {
  const w = useWelt();
  const f = useFarben();
  if (w.tag !== 0) return null;
  const a = w.angemeldet();
  const leute = w.diensthabende();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {leute.map((p) => {
        const an = a?.name === p.name && !a.leitung;
        return (
          <Pressable key={p.name} accessibilityRole="button" accessibilityLabel={p.name + (p.unterschrieben ? '' : ', noch nicht unterschrieben')} testID={'person-' + p.name}
            onPress={() => (p.unterschrieben ? personWaehlen(p.name) : zeige(<UnterschreibenBlatt name={p.name} />))}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingLeft: 4, paddingRight: 14, borderRadius: 999, backgroundColor: f.flaeche, borderWidth: an ? 2 : p.unterschrieben ? 0 : 1.5, borderColor: an ? f.tinte : f.linieStark, borderStyle: p.unterschrieben ? 'solid' : 'dashed' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: an ? f.primaer : f.flaeche3 }}>
              {p.unterschrieben ? <T art="label" farbe={an ? f.aufPrimaer : f.tinte} style={{ fontSize: 15 }}>{p.name.slice(0, 2).toUpperCase()}</T> : <Icon name="unterschrift" groesse={18} farbe={f.tinte2} />}
            </View>
            <View><T art="label" farbe={f.tinte} style={{ fontSize: 15 }}>{p.name}</T>{!p.unterschrieben ? <T art="beschr" style={{ fontSize: 11, lineHeight: 13 }}>unterschreiben</T> : null}</View>
          </Pressable>
        );
      })}
      <Pressable accessibilityRole="button" accessibilityLabel={a?.leitung ? 'Leitung abmelden' : 'Als Leitung anmelden'} testID="person-leitung"
        onPress={() => (a?.leitung ? (abmelden(), toast('schloss', 'Leitung abgemeldet', '', 2500)) : zeige(<LeitungBlatt />))}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48, paddingHorizontal: 12, borderRadius: 999, backgroundColor: a?.leitung ? f.primaer : 'transparent' }}>
        <Icon name={a?.leitung ? 'schloss-offen' : 'schloss'} groesse={18} farbe={a?.leitung ? f.aufPrimaer : f.tinte2} />
        <T art="label" farbe={a?.leitung ? f.aufPrimaer : f.tinte2}>{w.S.leitungName}</T>
      </Pressable>
    </View>
  );
}

/** Hinweis oben im Bettenplan und im Bericht, solange niemand angemeldet ist. */
export function NurAnsehenBalken() {
  const w = useWelt();
  if (w.tag !== 0 || w.darfAendern()) return null;
  return (
    <Zeile icon="schloss" art="warnung" titel="Nur ansehen" klein="Zum Ändern zuerst in der Besetzung unterschreiben. Die Leitung meldet sich mit Code an."
      rechts={<Knopf text="Unterschreiben" icon="unterschrift" art="primaer" klein testID="balken-unterschreiben" onPress={() => zeige(<AnmeldeBlatt />)} />} />
  );
}

/** Admin-PIN abfragen (Einstellungen, Kalender ändern, Gast bearbeiten); danach weiter. */
export function mitAdminPin(titel: string, danach: () => void): void {
  zeige(
    <Blatt titel={titel} text="Admin-PIN eingeben. In der Beispielversion lautet sie 1234.">
      <PinRaster onCode={(c) => { if (c !== getS().codes.admin) return false; schliessen(); danach(); return true; }} />
    </Blatt>,
  );
}
