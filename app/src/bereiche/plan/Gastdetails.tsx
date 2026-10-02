// Gastdetails rechts neben dem Bettenplan (Designsystem › Detailbereich).
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { kurz, pd, plus } from '../../domain/datum';
import { ORT_BASIS, SPRACHE } from '../../domain/haus';
import { naechteText, stufeSym } from '../../domain/welt';
import { lausJa, zurueck } from '../../store/aktionen';
import { ui, useU, useWelt } from '../../store/store';
import { Abschnitt, Daten, IconKnopf, Knopf, T, Zeile } from '../../ui/basis';
import { useFarben } from '../../ui/theme';
import { darf } from '../anmeldung';
import { nachholenStart } from '../aufnahme/start';
import { NotizListe } from '../gemeinsam';
import { abwesenheitBlatt, bettFreiDialog, bettWechseln, duschBlatt, istDaPruefen, lausBlatt, lausNein, notizBlatt, sanktionBlatt } from './handlungen';

export function Gastdetails() {
  const w = useWelt();
  const f = useFarben();
  const nr = useU((u) => u.detail);
  const { width } = useWindowDimensions();
  if (!nr) return null;
  const g = w.gastVon(nr);
  if (!g) return null;
  const b = w.S.betten[nr], s = w.status(nr), ro = w.tag !== 0;
  const sStatus = ({ anwesend: 'anwesend', erwartet: 'erwartet', fehlt: 'fehlt unentschuldigt, 1. Nacht', fehlt2: 'fehlt ' + (b.n || 2) + ' Nächte in Folge, Bett zählt als frei', gehalten: 'freigehalten bis ' + (b.bis ? kurz(pd(b.bis)) : ''), freibis: 'abwesend, Bett frei bis ' + (b.bis ? kurz(pd(b.bis)) : '') } as Record<string, string>)[s] || s;
  const lt = w.lausTage(g), hv = w.hausverbot(g), nik = g.standort === 'nikolaus';
  const slot = w.duschSlot(g.id);
  const ort = (w.ort[nr] || ORT_BASIS[nr]) ?? '';
  const zu = () => ui({ detail: null, offen: null });
  const breite = Math.min(460, width - 120);

  return (
    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: breite, zIndex: 30, backgroundColor: f.flaeche, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, elevation: 12 }} accessibilityLabel={'Gastdetails ' + g.vorname}>
      <View style={{ flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T art="zahl" farbe={f.tinte2}>{nr}</T>
          <T art="titel">{w.anzeige(g)}{g.spitz ? <T art="titel" farbe={f.tinte2} style={{ fontFamily: undefined }}> „{g.spitz}“</T> : null}</T>
          <T art="klein" farbe={f.tinte2}>{g.nr ? 'Aufnahme ' + g.nr + ' · ' : ''}{sStatus} · {naechteText(g.naechte)}</T>
        </View>
        <IconKnopf icon="schliessen" label="Schließen" flaeche testID="detail-zu" onPress={zu} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 20 }}>
        {g.laus === 'fehlt' && !nik ? (
          lt >= 3 && !(g.lausFrist && g.lausFrist >= w.hIso) ? (
            <View style={{ gap: 8 }}>
              <Zeile icon="warnung" art="warnung" titel={'Läuseschein fehlt seit ' + lt + ' Tagen'} klein={'Darf ' + g.vorname + ' trotzdem bleiben? Höchstens 3 weitere Tage.'} />
              {!ro ? <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}><Knopf text="Nein" klein onPress={() => lausNein(nr)} /><Knopf text={'Ja, bis ' + kurz(plus(w.H, 3))} art="primaer" klein onPress={() => { if (darf()) lausJa(nr); }} /></View> : null}
            </View>
          ) : <Zeile icon="laeuseschein-fehlt" art="warnung" titel={'Läuseschein fehlt' + (lt ? ' seit ' + lt + (lt === 1 ? ' Tag' : ' Tagen') : '')} klein={g.lausFrist ? 'Verbleib bis ' + kurz(pd(g.lausFrist)) + ' entschieden von ' + (g.lausVon || '') : 'Erinnerung an Tag 2 und 3'} rechts={ro ? null : <Knopf text="Prüfen" icon="scannen" klein art="rahmen" onPress={() => lausBlatt(g.id)} />} />
        ) : null}
        {hv ? <Zeile icon="karte-rot" art="vorfall" titel={'Hausverbot ' + (hv.bis ? 'bis ' + kurz(pd(hv.bis)) : 'unbefristet')} klein={hv.grund} /> : null}
        {s === 'fehlt' || s === 'fehlt2' ? <Zeile icon="abwesend" art="warnung" titel={s === 'fehlt' ? 'Fehlt unentschuldigt, 1. Nacht' : 'Fehlt die ' + (b.n || 2) + '. Nacht in Folge'} klein={s === 'fehlt' ? 'Bett zählt für das Kältehilfetelefon weiter als belegt.' : 'Bett zählt als frei und darf neu vergeben werden.'} /> : null}
        {s === 'freibis' || s === 'gehalten' ? <Zeile icon={s === 'gehalten' ? 'schloss' : 'rueckkehr'} titel={(s === 'gehalten' ? 'Bett freigehalten bis ' : 'Kommt zurück am ') + kurz(pd(b.bis!))} klein={b.grund || (s === 'gehalten' ? 'zählt nicht als frei' : 'Bett zählt bis dahin als frei')} /> : null}

        <Abschnitt titel="Stammdaten"><Daten paare={[['Vorname', g.vorname], ['Nachname', g.nachname || '–'], ['Spitzname', g.spitz || '–'], ['Sprache', SPRACHE[g.sprache]?.[2] || g.sprache], ['Erste Aufnahme', kurz(pd(g.erste))], ['Nächte Saison', String(g.naechte)]]} /></Abschnitt>
        <Abschnitt titel="Aufenthalt"><Daten paare={[['Bett', nr + (w.lageVon(nr) ? ' · Stockbett ' + w.lageVon(nr) : '') + (ort ? ' · ' + ort : '')], ['Status', sStatus], ['Dauer', nik ? 'wird jede Nacht fortgeschrieben' : b.dauerhaft === false ? '1 Nacht' : b.ende ? 'bis ' + kurz(pd(b.ende)) : 'mehrere Nächte, ohne Enddatum'], ['Dusche heute', slot || '–']]} /></Abschnitt>
        <Abschnitt titel="Läuseschein">
          {nik ? <T art="beschr">In St. Nikolaus nicht erfasst.</T> : g.laus === 'liegt' ? <Zeile icon="laeuseschein" titel="Liegt vor" klein={(g.lausVon ? 'Geprüft von ' + g.lausVon + ' · ' : '') + 'gilt die ganze Saison'} /> : g.laus === 'nicht' ? <T art="beschr">Nicht nötig (eine Nacht).</T> : <T art="beschr">Fehlt.</T>}
        </Abschnitt>
        <Abschnitt titel="Dokumente">
          {g.unterschrieben ? <Zeile icon="pdf" titel={w.pdfName(g)} klein={'Hausordnung (Deutsch' + (g.uebersetzung ? ', Übersetzung ' + SPRACHE[g.uebersetzung][2] : '') + ') und Datenschutz'} />
            : <Zeile icon="unterschrift" art="warnung" titel={nik ? 'Unterschreibt außerhalb der App' : 'Hausordnung noch nicht unterschrieben'} klein="Kann jederzeit nachgeholt werden." rechts={ro || nik ? null : <Knopf text="Jetzt" icon="stift" klein art="rahmen" testID="nachholen" onPress={() => nachholenStart(g.id)} />} />}
          <Knopf text="In der Gästedatenbank öffnen" icon="personen" klein art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => ui({ bereich: 'gaeste', akte: g.id, detail: null, offen: null })} />
        </Abschnitt>
        <Abschnitt titel="Sanktionen">
          {g.sanktionen.length ? g.sanktionen.map((x, i) => <Zeile key={i} icon={stufeSym(x.stufe)} titel={x.stufe + ' · ' + kurz(pd(x.datum)) + (x.bis ? ' · bis ' + kurz(pd(x.bis)) : '')} klein={x.grund + ', eingetragen von ' + x.von} />) : <T art="beschr">Keine Einträge.</T>}
        </Abschnitt>
        <Abschnitt titel="Notizen">
          <NotizListe notizen={g.notizen} />
          {!ro ? <Knopf text="Notiz hinzufügen" icon="plus" klein art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => notizBlatt(g.id)} /> : null}
        </Abschnitt>
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: f.linie }}>
        {ro ? <Knopf text="Nachtrag hinzufügen" icon="stift" art="rahmen" breit style={{ flexBasis: '100%' }} onPress={() => notizBlatt(g.id)} /> : (
          <>
            {s === 'erwartet' ? <Knopf text="Einchecken" icon="anwesend" art="primaer" klein style={ZWEI} onPress={() => istDaPruefen(nr)} />
              : s === 'fehlt' || s === 'fehlt2' ? <Knopf text="Ist doch da" icon="anwesend" art="primaer" klein style={ZWEI} onPress={() => istDaPruefen(nr)} />
                : s === 'gehalten' || s === 'freibis' ? <Knopf text="Ist zurück" icon="rueckkehr" art="primaer" klein style={ZWEI} onPress={() => { if (darf()) zurueck(nr); }} />
                  : <Knopf text="Notiz" icon="notiz" klein style={ZWEI} onPress={() => notizBlatt(g.id)} />}
            {!nik ? <Knopf text="Abwesenheit" icon="abwesend" klein style={ZWEI} onPress={() => abwesenheitBlatt(nr)} /> : null}
            <Knopf text="Bett wechseln" icon="tauschen" klein style={ZWEI} onPress={() => bettWechseln(nr)} />
            {!nik ? <Knopf text={slot ? 'Dusche ' + slot : 'Duschslot'} icon="dusche" klein style={ZWEI} onPress={() => duschBlatt(nr)} /> : null}
            <Knopf text="Bett frei" icon="auszug" klein style={ZWEI} onPress={() => bettFreiDialog(nr)} />
            <Knopf text="Sanktion" icon="karte-gelb" art="gefahr" klein style={ZWEI} onPress={() => sanktionBlatt(nr)} />
          </>
        )}
      </View>
    </View>
  );
}
const ZWEI = { flexBasis: '45%', flexGrow: 1 } as const;
