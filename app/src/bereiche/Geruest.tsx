// Gerüst: Navigationsleiste links, Kopfzeile, Inhalt, Überlagerungen (Details, Schnellauswahl, Glocke, Assistent, Blätter).
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { lang } from '../domain/datum';
import { thema } from '../store/aktionen';
import { schliessen, ui, useS, useU, useWelt, zeige, type BereichName } from '../store/store';
import { radius } from '../theme/tokens';
import { Icon, IconKnopf, Knopf, T, Zeile } from '../ui/basis';
import { Blatt, ModalHost, Toasts } from '../ui/overlay';
import { useFarben } from '../ui/theme';
import { DienstPersonen, NachholenBlatt } from './anmeldung';
import { Assistent } from './aufnahme/Assistent';
import { Dienst } from './dienst/Dienst';
import { Einstellungen } from './einstellungen/Einstellungen';
import { Gaeste } from './gaeste/Gaeste';
import { Kalender } from './kalender/Kalender';
import { Bettenplan } from './plan/Bettenplan';
import { Gastdetails } from './plan/Gastdetails';
import { badAntippen } from './plan/handlungen';
import { Schnellauswahl } from './plan/Schnellauswahl';

const NAV: [BereichName, string, string][] = [['plan', 'bett', 'Bettenplan'], ['gaeste', 'personen', 'Gäste'], ['dienst', 'bericht', 'Dienst & Bericht'], ['kalender', 'kalender', 'Kalender'], ['einstellungen', 'regler', 'Einstellungen']];

function Leiste() {
  const f = useFarben();
  const w = useWelt();
  const bereich = useU((u) => u.bereich);
  const b = w.bericht(w.hIso);
  const offen = (!b || b.status !== 'abgeschlossen') && w.tag === 0;
  return (
    <View accessibilityRole="tablist" style={{ width: 104, backgroundColor: f.flaeche, paddingVertical: 12, alignItems: 'center', gap: 4 }}>
      <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: f.primaer, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon name="bett" farbe={f.aufPrimaer} /></View>
      {NAV.map(([k, sym, t]) => {
        const an = bereich === k;
        return (
          <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: an }} accessibilityLabel={t} testID={'nav-' + k}
            onPress={() => ui({ bereich: k, detail: null, schnell: null, glocke: false, auswahl: null })}
            style={{ width: 96, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 }}>
            <View style={{ width: 64, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: an ? f.erwartetFlaeche : 'transparent' }}>
              <Icon name={sym} farbe={an ? f.tinte : f.tinte2} />
              {k === 'dienst' && offen ? <View style={{ position: 'absolute', top: 2, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: f.warnung }} /> : null}
            </View>
            <T art="label" farbe={an ? f.tinte : f.tinte2} style={{ fontSize: 13, lineHeight: 16, textAlign: 'center' }}>{t}</T>
          </Pressable>
        );
      })}
      <View style={{ flex: 1 }} />
      <Pressable accessibilityRole="button" accessibilityLabel="Tag- oder Nachtmodus" onPress={() => thema(f.nacht ? 'tag' : 'nacht')} style={{ width: 96, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Icon name={f.nacht ? 'sonne' : 'mond'} farbe={f.tinte2} />
        <T art="label" farbe={f.tinte2} style={{ fontSize: 13 }}>{f.nacht ? 'Tag' : 'Nacht'}</T>
      </Pressable>
    </View>
  );
}

function SpeicherBlatt() {
  const S = useS();
  return (
    <Blatt titel="Speichern und Abgleich" text="Version 1 speichert alles nur auf diesem Tablet." knoepfe={<Knopf text="Fertig" art="primaer" klein onPress={schliessen} />}>
      <Zeile icon="wolke-aus" titel="Noch kein Abgleich mit Nextcloud" klein="Kommt in Version 2 (siehe dateisystem/README.md). Bis dahin gehen Daten verloren, wenn die App gelöscht wird." />
      <Zeile icon="check" titel={'Zuletzt gespeichert ' + S.sync.zuletzt} klein="Jede Änderung wird sofort auf dem Gerät gespeichert." />
    </Blatt>
  );
}

function Kopf() {
  const f = useFarben();
  const w = useWelt();
  const tag = useU((u) => u.tag);
  const glocke = useU((u) => u.glocke);
  const { width } = useWindowDimensions();
  const anz = w.erinnerungen().length;
  const tagSetzen = (t: number) => ui({ tag: t, detail: null, schnell: null, auswahl: null });
  return (
    <View style={{ minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, backgroundColor: f.grund }}>
      <IconKnopf icon="zurueck" label="Vortag" testID="tag-zurueck" disabled={tag <= -60} onPress={() => tagSetzen(tag - 1)} />
      <Pressable accessibilityRole="button" accessibilityLabel="Zurück zu heute" onPress={() => tagSetzen(0)} style={{ minWidth: 150 }}>
        <T art="stark" style={{ fontSize: 18 }}>{lang(w.tagDatum())}</T>
        <T art="beschr">{tag === 0 ? 'Dienst 18:45 – 08:00' : 'vergangen · zurück zu heute'}</T>
      </Pressable>
      <IconKnopf icon="weiter" label="Folgetag" testID="tag-weiter" disabled={tag === 0} onPress={() => tagSetzen(Math.min(0, tag + 1))} />
      {tag < 0 ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 32, borderRadius: 999, backgroundColor: f.warnungFlaeche }}><Icon name="schloss" groesse={16} farbe={f.warnung} /><T art="label" farbe={f.warnung}>Nur lesen</T></View> : null}
      <View style={{ flex: 1 }} />
      {width > 1100 ? (
        <Pressable accessibilityRole="button" onPress={() => zeige(<SpeicherBlatt />)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 40, borderRadius: 999 }}>
          <Icon name="abgleich" groesse={18} farbe={f.tinte2} /><T art="label">Auf dem Gerät</T>
        </Pressable>
      ) : null}
      <IconKnopf icon="glocke" label={anz + ' offene Erinnerungen'} flaeche={glocke} zaehler={anz} testID="glocke" onPress={() => ui({ glocke: !glocke, schnell: null })} />
      <DienstPersonen />
    </View>
  );
}

function Glocke() {
  const f = useFarben();
  const w = useWelt();
  const offen = useU((u) => u.glocke);
  if (!offen) return null;
  const liste = w.erinnerungen();
  const gehe = (i: number) => {
    const z = liste[i].ziel;
    ui({ glocke: false });
    if (z.art === 'bett') ui({ bereich: 'plan', reiter: w.istNiko(z.nr) ? 'niko' : 'haus', tag: 0, detail: w.gastVon(z.nr) ? z.nr : null, offen: z.nr });
    else if (z.art === 'bad') { ui({ bereich: 'plan', reiter: 'haus' }); badAntippen(); }
    else if (z.art === 'dusche') ui({ bereich: 'dienst', dienstReiter: 'dusche' });
    else if (z.art === 'dienst') ui({ bereich: 'dienst', dienstReiter: 'bericht' });
    else zeige(<NachholenBlatt />);
  };
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 45 }}>
      <Pressable accessibilityLabel="Schließen" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => ui({ glocke: false })} />
      <View style={{ position: 'absolute', top: 72, right: 16, width: 420, maxHeight: 520, borderRadius: radius.l, backgroundColor: f.flaeche, padding: 12, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, elevation: 10 }}>
        <T art="abschnitt" style={{ padding: 8 }}>Erinnerungen</T>
        <ScrollView contentContainerStyle={{ gap: 6 }}>
          {liste.length ? liste.map((e, i) => <Zeile key={i} icon={e.sym} art={e.warn ? 'warnung' : 'normal'} titel={e.text} klein={e.klein} onPress={() => gehe(i)} />) : <T art="klein" style={{ padding: 8 }}>Nichts offen.</T>}
        </ScrollView>
      </View>
    </View>
  );
}

export function Geruest() {
  const f = useFarben();
  const bereich = useU((u) => u.bereich);
  const inhalt = bereich === 'plan' ? <Bettenplan /> : bereich === 'gaeste' ? <Gaeste /> : bereich === 'dienst' ? <Dienst /> : bereich === 'kalender' ? <Kalender /> : <Einstellungen />;
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: f.grund }}>
      <Leiste />
      <View style={{ flex: 1 }}>
        <Kopf />
        <View style={{ flex: 1 }}>{inhalt}</View>
      </View>
      {bereich === 'plan' ? <><Gastdetails /><Schnellauswahl /></> : null}
      <Glocke />
      <Assistent />
      <ModalHost />
      <Toasts />
    </View>
  );
}
