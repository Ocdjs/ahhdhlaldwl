// Dienst & Bericht: Reiter Bericht · Duschplan · Monatsabschluss · Archiv.
import { ScrollView, View } from 'react-native';
import { iso, kurz, lang, plus } from '../../domain/datum';
import { SLOTS } from '../../domain/haus';
import { slotSetzen, slotStatus } from '../../store/aktionen';
import { schliessen, toast, ui, useU, useWelt, zeige } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Knopf, Seg, T } from '../../ui/basis';
import { Blatt } from '../../ui/overlay';
import { useFarben } from '../../ui/theme';
import { darf } from '../anmeldung';
import { BereichKopf, Reiter, Wahl } from '../gemeinsam';
import { Slot } from '../plan/handlungen';
import { Archiv } from './Archiv';
import { Bericht } from './Bericht';
import { Monat } from './Monat';

function SlotBlatt({ datum, z, tagNr }: { datum: string; z: string; tagNr: number }) {
  const w = useWelt();
  const x = (w.S.dusche[datum] || {})[z];
  if (x) {
    const g = w.S.G[x.g];
    return (
      <Blatt titel={'Dusche ' + z + ' · ' + (g?.vorname || '')} knoepfe={<Knopf text="Abbrechen" klein onPress={schliessen} />}>
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Wahl titel="Erledigt" an={x.s === 'erledigt'} onPress={() => slotStatus(datum, z, 'erledigt')} />
          <Wahl titel="Verpasst" an={x.s === 'verpasst'} onPress={() => slotStatus(datum, z, 'verpasst')} />
          <Wahl titel="Freigeben" an={false} onPress={() => slotStatus(datum, z, 'frei')} />
        </View>
      </Blatt>
    );
  }
  const kandidaten = w.bettenHaus.filter((b) => { const s = w.status(b.nr); return w.gastVon(b.nr) && (tagNr === 0 ? s === 'anwesend' : s === 'anwesend' || s === 'erwartet'); });
  return (
    <Blatt titel={'Dusche ' + z + ' · ' + kurz(new Date(datum + 'T12:00:00'))} text={tagNr === 0 ? 'Aus den anwesenden Gästen' : 'Aus den Gästen mit Bett'} knoepfe={<Knopf text="Abbrechen" klein onPress={schliessen} />}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {kandidaten.map((b) => { const g = w.gastVon(b.nr)!; return <Knopf key={b.nr} klein text={w.anzeige(g) + ' · ' + b.nr} onPress={() => slotSetzen(datum, z, g.id)} />; })}
        {!kandidaten.length ? <T art="beschr">Niemand verfügbar.</T> : null}
      </View>
    </Blatt>
  );
}

function Duschplan() {
  const w = useWelt();
  const f = useFarben();
  const duschTag = useU((u) => u.duschTag);
  const datum = w.tag < 0 ? w.tagDatum() : plus(w.H, duschTag);
  const di = iso(datum), d = w.S.dusche[di] || {};
  return (
    <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 20, gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <T art="abschnitt" style={{ flex: 1 }}>Duschplan · {lang(datum)}</T>
        {w.tag === 0 ? <Seg optionen={[['0', 'Heute'], ['1', 'Morgen'], ['2', 'Übermorgen'], ['3', 'In 3 Tagen']]} wert={String(duschTag) as '0'} onChange={(k) => ui({ duschTag: +k })} minBreite={90} /> : null}
      </View>
      <T art="beschr">19:00 – 22:00 · 30 Minuten · höchstens 3 Tage im Voraus. Sind alle durch, erinnert die App daran, das Bad aufzuschließen.</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {SLOTS.map((z) => {
          const x = d[z], g = x ? w.S.G[x.g] : null, bett = g ? w.bettVon(g.id) : null;
          return <Slot key={z} zeit={z} name={g ? w.anzeige(g) : 'frei'} zustand={x ? x.s : 'frei'} unter={g ? (bett || '') + (x!.s === 'verpasst' ? ' · verpasst' : x!.s === 'erledigt' ? ' · erledigt' : '') : 'antippen'}
            disabled={w.tag < 0} onPress={() => { if (darf()) zeige(<SlotBlatt datum={di} z={z} tagNr={duschTag} />); }} />;
        })}
      </View>
      {w.tag === 0 ? <Knopf text="Erinnerung zeigen" icon="glocke" klein art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => {
        const h = w.S.dusche[w.hIso] || {}, k = Object.keys(h).sort().find((z) => h[z].s === 'geplant'), g = k ? w.S.G[h[k].g] : null;
        toast('dusche', 'Dusche ' + (k || '20:30'), g ? g.vorname + ', Bett ' + (w.bettVon(g.id) || '') : 'Beispiel', 5000);
      }} /> : null}
    </View>
  );
}

export function Dienst() {
  const reiter = useU((u) => u.dienstReiter);
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
      <BereichKopf titel="Dienst & Bericht">
        <Reiter optionen={[['bericht', 'Bericht', 'bericht'], ['dusche', 'Duschplan', 'dusche'], ['monat', 'Monatsabschluss', 'unterschrift'], ['archiv', 'Archiv', 'archiv']]} wert={reiter} onChange={(k) => ui({ dienstReiter: k })} />
      </BereichKopf>
      {reiter === 'bericht' ? <Bericht /> : reiter === 'dusche' ? <Duschplan /> : reiter === 'monat' ? <Monat /> : <Archiv />}
    </ScrollView>
  );
}
