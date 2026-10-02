// Bettenplan: Kennzahlen (Ampel, KHT-Nummer), Reiter St. Pius / St. Nikolaus, Grundriss, weitere Plätze.
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import type { Zimmer } from '../../domain/haus';
import { ui, useU, useWelt, zeige } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Icon, Knopf, T } from '../../ui/basis';
import { useFarben } from '../../ui/theme';
import { NurAnsehenBalken } from '../anmeldung';
import { Reiter } from '../gemeinsam';
import { Bettkarte } from './Bettkarte';
import { GrundrissNiko, GrundrissPius } from './Grundriss';
import { badAntippen, gastAufnehmen, KhtBlatt } from './handlungen';

function Kennzahlen() {
  const w = useWelt();
  const f = useFarben();
  const k = w.kennzahlen();
  const wort = k.frei === 0 ? 'Kein Bett frei' : k.frei === 1 ? '1 Bett frei' : k.frei + ' Betten frei';
  const licht = k.ampel === 'gruen' ? f.ampelGruen : k.ampel === 'gelb' ? f.ampelGelb : f.ampelRot;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, rowGap: 12, flexWrap: 'wrap', backgroundColor: f.flaeche, borderRadius: radius.l, paddingVertical: 12, paddingHorizontal: 16 }}>
      <View accessibilityLabel={'Ampel ' + k.ampel + ', ' + wort} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, paddingLeft: 8, paddingRight: 18, borderRadius: 999, backgroundColor: f.flaeche2 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: licht, alignItems: 'center', justifyContent: 'center' }}><T art="zahl" testID="ampel-zahl" farbe={k.ampel === 'gelb' ? f.aufGelb : f.aufAmpel} style={{ fontSize: 22 }}>{k.frei}</T></View>
        <View><T art="stark" style={{ fontSize: 17, lineHeight: 20 }}>{wort}</T><T art="beschr">Ampel {k.ampel === 'gruen' ? 'grün' : k.ampel}</T></View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={'KHT-Nummer ' + k.belegt} testID="kht-nummer" onPress={() => zeige(<KhtBlatt />)} style={{ minHeight: 48, justifyContent: 'center' }}>
        <T art="label" style={{ fontFamily: undefined }}>KHT-Nummer</T><T art="zahl">{k.belegt}</T>
      </Pressable>
      <View><T art="label">St. Pius</T><T art="zahl">{k.anwesendHaus} da · {k.erwartet} erwartet</T></View>
      <View><T art="label">St. Nikolaus</T><T art="zahl">{k.nikoBelegt} von {k.niko}</T></View>
    </View>
  );
}

function PlaetzeSpalte({ niko }: { niko?: boolean }) {
  const w = useWelt();
  const gruppen: [string, string][] = niko ? [['NX', 'Weitere Plätze']] : [['L', 'Loggien'], ['E', 'Esszimmer'], ['TH', 'Tiny House'], ['X', 'Weitere Plätze']];
  const plan = niko ? w.niko : w.haus;
  return (
    <View style={{ width: 176, gap: 8 }}>
      {gruppen.map(([id, titel]) => {
        const nrs = (plan.find((z) => z.id === id)?.teile[0] || []) as string[];
        if (!nrs.length) return null;
        return (
          <View key={id} style={{ gap: 8 }}>
            <View style={{ marginTop: 4 }}><T art="ueber" farbe={undefined}>{titel}</T><T art="zahlKlein">{w.raumZahl(id)}</T></View>
            {nrs.map((p) => <Bettkarte key={p} nr={w.anPlatz(p)} />)}
          </View>
        );
      })}
    </View>
  );
}

function ZimmerRahmen({ z }: { z: Zimmer }) {
  const w = useWelt();
  const f = useFarben();
  const alle: string[] = [];
  z.teile.forEach((t) => t.forEach((x) => (Array.isArray(x) ? x : [x]).forEach((n) => alle.push(n))));
  if (!alle.length) return null;
  const aktiv = alle.filter((n) => !w.istAus(n)), frei = aktiv.filter((n) => w.zaehlt(n)).length, aus = !!w.S.offRooms[z.id];
  return (
    <View style={{ backgroundColor: aus ? f.ausFlaeche : f.flaeche, borderRadius: radius.l, padding: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T art="ueber" farbe={f.tinte2}>{z.name}</T><T art="zahlKlein" farbe={f.tinte3}>{aus ? 'gesperrt' : frei + ' von ' + aktiv.length + ' frei'}</T></View>
      {z.teile.map((t, i) => (
        <View key={i} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {t.map((x) => Array.isArray(x) ? (
            <View key={x[0]} style={{ gap: 8, padding: 8, borderRadius: 14, backgroundColor: f.flaeche3 }}>
              <T art="ueber" style={{ fontSize: 12 }}>oben</T><Bettkarte nr={w.anPlatz(x[0])} />
              <T art="ueber" style={{ fontSize: 12 }}>unten</T><Bettkarte nr={w.anPlatz(x[1])} />
            </View>
          ) : <Bettkarte key={x} nr={w.anPlatz(x)} />)}
        </View>
      ))}
    </View>
  );
}

function BadKachel() {
  const w = useWelt();
  const f = useFarben();
  const bz = w.badZustand();
  return (
    <Pressable accessibilityRole="button" testID="bad" onPress={badAntippen} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: radius.l, backgroundColor: bz === 'frei' ? f.freiFlaeche : bz === 'erinnern' ? f.warnungFlaeche : f.flaeche3 }}>
      <Icon name={bz === 'frei' ? 'schloss-offen' : bz === 'erinnern' ? 'glocke' : 'schloss'} farbe={bz === 'frei' ? f.frei : bz === 'erinnern' ? f.warnung : f.tinte2} />
      <T art="stark">Bad · {bz === 'frei' ? 'frei' : bz === 'erinnern' ? 'alle geduscht, aufschließen' : 'zu'}</T>
    </Pressable>
  );
}

export function Bettenplan() {
  const w = useWelt();
  const f = useFarben();
  const reiter = useU((u) => u.reiter);
  const auswahl = useU((u) => u.auswahl);
  const { width } = useWindowDimensions();
  const schmal = width < 900;
  const k = w.kennzahlen();
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
      <View style={{ backgroundColor: f.grund, gap: 12, paddingTop: 4, paddingBottom: 12 }}>
        <Kennzahlen />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Reiter optionen={[['haus', 'St. Pius', 'haus', k.freiHaus + ' frei'], ['niko', 'St. Nikolaus', 'standort-2', k.nikoBelegt + '/' + k.niko]]} wert={reiter} onChange={(r) => ui({ reiter: r, detail: null, schnell: null })} />
          <View style={{ flex: 1 }} />
          {w.tag === 0 ? <Knopf text="Gast aufnehmen" icon="person-plus" art="primaer" testID="gast-aufnehmen" onPress={() => gastAufnehmen()} /> : null}
        </View>
        <NurAnsehenBalken />
        {auswahl ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingHorizontal: 14, borderRadius: radius.m, backgroundColor: f.erwartetFlaeche }}>
            <Icon name="tauschen" /><T art="stark" style={{ flex: 1 }}>Neues Bett für {w.gastVon(auswahl)?.vorname} antippen</T>
            <Knopf text="Abbrechen" klein art="rahmen" onPress={() => ui({ auswahl: null })} />
          </View>
        ) : null}
      </View>
      {reiter === 'haus' ? (
        schmal ? (
          <View style={{ gap: 12 }}>{w.haus.map((z) => <ZimmerRahmen key={z.id} z={z} />)}<BadKachel /></View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
            <View style={{ flex: 1, backgroundColor: f.flaeche, borderRadius: radius.l, padding: 16, borderWidth: auswahl ? 3 : 0, borderColor: f.blau, borderStyle: 'dashed' }}><GrundrissPius /></View>
            <PlaetzeSpalte />
          </View>
        )
      ) : (
        <>
          {schmal ? <View style={{ gap: 12 }}>{w.niko.map((z) => <ZimmerRahmen key={z.id} z={z} />)}</View> : (
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start', justifyContent: 'center' }}>
              <View style={{ width: 520, backgroundColor: f.flaeche, borderRadius: radius.l, padding: 16 }}><GrundrissNiko /></View>
              <PlaetzeSpalte niko />
            </View>
          )}
          <T art="beschr" style={{ marginTop: 12 }}>St. Nikolaus: Wer eingetragen ist, wird jede Nacht fortgeschrieben, bis jemand die Belegung ändert. Aufnahme ohne Hausordnung, Läuseschein und Unterschrift.</T>
        </>
      )}
    </ScrollView>
  );
}
