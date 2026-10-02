// Schnellauswahl am angetippten Bett (Designsystem › Schnellauswahl): Ist da / Nicht da / Details, frei → Gast aufnehmen.
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { kurz, pd } from '../../domain/datum';
import { dauerhaftUmschalten } from '../../store/aktionen';
import { ui, useU, useWelt } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Knopf, Schalter, T, Zeile } from '../../ui/basis';
import { useFarben } from '../../ui/theme';
import { abwesenheitBlatt, details, duschBlatt, gastAufnehmen, istDaPruefen, nichtDa } from './handlungen';

const BREITE = 300;

export function Schnellauswahl() {
  const w = useWelt();
  const f = useFarben();
  const schnell = useU((u) => u.schnell);
  const { width, height } = useWindowDimensions();
  const [hoehe, setHoehe] = useState(260);
  if (!schnell) return null;
  const nr = schnell.nr, s = w.status(nr), g = w.gastVon(nr), b = w.S.betten[nr] || { g: null, s: 'frei' };
  const r = schnell.rect || { x: width / 2 - BREITE / 2, y: height / 3, w: 0, h: 0 };
  const x = Math.min(Math.max(8, r.x), width - BREITE - 8);
  let y = r.y + r.h + 8;
  if (y + hoehe > height - 8) y = r.y - hoehe - 8;
  if (y < 8) y = 8;

  const kopf = (titel: string, unter: string) => (
    <View style={{ gap: 2, marginBottom: 2 }}><T art="abschnitt">{titel}</T><T art="klein" farbe={f.tinte2} style={{ fontSize: 14 }}>{unter}</T></View>
  );
  let inhalt: React.ReactNode;
  if (s === 'frei' || s === 'freibis' || s === 'fehlt2') {
    inhalt = (
      <>
        {kopf('Bett ' + nr, (s === 'freibis' ? 'frei bis ' + kurz(pd(b.bis!)) : 'frei') + (w.ortText(nr) ? ' · ' + w.ortText(nr) : ''))}
        {s === 'freibis' && g ? <Zeile icon="rueckkehr" titel={g.vorname + ' kommt am ' + kurz(pd(b.bis!)) + ' zurück.'} klein="Bis dahin darf das Bett vergeben werden." /> : null}
        {s === 'frei' && w.S.notbett[nr] ? <Zeile icon="info" titel="Notbett" klein="Nur über den Kältebus belegen." /> : null}
        {s === 'fehlt2' && g ? <Zeile icon="abwesend" art="warnung" titel={g.vorname + ' fehlt die ' + (b.n || 2) + '. Nacht in Folge'} klein="Unentschuldigt. Das Bett zählt als frei und darf vergeben werden." /> : null}
        <Knopf text="Gast aufnehmen" icon="person-plus" art="primaer" testID="schnell-aufnehmen" onPress={() => gastAufnehmen(nr)} />
        {s === 'fehlt2' && g ? <Knopf text={g.vorname + ' ist doch da'} icon="anwesend" onPress={() => istDaPruefen(nr)} /> : null}
        {(s === 'freibis' || s === 'fehlt2') && g ? <Knopf text={'Details ' + g.vorname} icon="person" onPress={() => details(nr)} /> : null}
      </>
    );
  } else if (schnell.phase === 'da' && g) {
    inhalt = (
      <>
        {kopf(g.vorname, nr + ' · ist da')}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Schalter an={b.dauerhaft !== false} label="Bett dauerhaft behalten" onChange={() => dauerhaftUmschalten(nr)} />
          <T art="klein" style={{ flex: 1 }}>Bett dauerhaft behalten</T>
        </View>
        <Knopf text={w.duschSlot(g.id) ? 'Dusche ' + w.duschSlot(g.id) : 'Duschslot wählen'} icon="dusche" onPress={() => duschBlatt(nr)} />
        <Knopf text="Abwesenheit" icon="abwesend" onPress={() => abwesenheitBlatt(nr)} />
        <Knopf text="Fertig" icon="check" art="primaer" testID="schnell-fertig" onPress={() => ui({ schnell: null })} />
      </>
    );
  } else if (s === 'fehlt' && g) {
    inhalt = (
      <>
        {kopf(g.vorname, nr + ' · fehlt')}
        <Zeile icon="abwesend" art="warnung" titel="Fehlt unentschuldigt, 1. Nacht" klein={'Das Bett zählt für das Kältehilfetelefon weiter als belegt. Fehlt ' + g.vorname + ' morgen wieder, zählt es als frei.'} />
        <Knopf text="Ist doch da" icon="anwesend" art="primaer" onPress={() => istDaPruefen(nr)} />
        <Knopf text="Details" icon="person" onPress={() => details(nr)} />
      </>
    );
  } else if (g) {
    const lt = w.lausTage(g);
    inhalt = (
      <>
        {kopf(g.vorname, nr + ' · erwartet')}
        {b.vorher ? <Zeile icon="abwesend" art="warnung" titel="Fehlte gestern unentschuldigt" klein={'Fehlt ' + g.vorname + ' heute wieder, zählt das Bett ab heute als frei.'} /> : null}
        {g.laus === 'fehlt' ? <Zeile icon={lt >= 3 ? 'warnung' : 'laeuseschein-fehlt'} art="warnung" titel={'Läuseschein fehlt' + (lt >= 1 ? ' seit ' + lt + (lt === 1 ? ' Tag' : ' Tagen') : '')} klein={lt >= 3 ? 'Beim Check-in wird nach dem Verbleib gefragt.' : 'Bitte beim Check-in danach fragen.'} /> : null}
        <Knopf text="Ist da" icon="anwesend" art="primaer" testID="schnell-istda" onPress={() => istDaPruefen(nr)} />
        <Knopf text="Nicht da" icon="abwesend" testID="schnell-nichtda" onPress={() => nichtDa(nr)} />
        <Knopf text="Details" icon="person" onPress={() => details(nr)} />
      </>
    );
  } else return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} pointerEvents="box-none">
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onStartShouldSetResponder={() => true} onResponderRelease={() => ui({ schnell: null })} />
      <View accessibilityLabel={'Schnellauswahl ' + nr} onLayout={(e) => setHoehe(e.nativeEvent.layout.height)}
        style={{ position: 'absolute', left: x, top: y, width: BREITE, gap: 8, padding: 16, borderRadius: radius.l, backgroundColor: f.flaeche, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 10 }}>
        {inhalt}
      </View>
    </View>
  );
}
