// Archiv: Hinweise für die nächsten Dienste, „Fehlt etwas“ zum Abhaken, abgeschlossene Berichte mit Kommentaren, Antworten und wichtigen Hinweisen.
import { useState } from 'react';
import { View } from 'react-native';
import { iso, kurz, lang, pd, plus } from '../../domain/datum';
import { DAUERN, KOMMENTAR_ART } from '../../domain/haus';
import type { KommentarArt } from '../../domain/typen';
import { fehltErledigt, hinweisEnde, hinweisSpeichern, kommentarSpeichern } from '../../store/aktionen';
import { schliessen, useWelt, welt, zeige } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Chip, Chips, Eingabe, Feld, Icon, Knopf, Pille, Schalter, Seg, T, Zeile } from '../../ui/basis';
import { Blatt } from '../../ui/overlay';
import { useFarben } from '../../ui/theme';
import { darf } from '../anmeldung';
import { HinweisKarte } from '../gemeinsam';
import { berichtPdf } from '../../pdf/pdf';

/** Wie lange oben im Dienst zeigen (Dauer-Chips, bei „Bis Datum“ ein Datumsfeld). */
function DauerWahl({ dw, setDw, datum, setDatum, mitArchiv }: { dw: string; setDw: (s: string) => void; datum: string; setDatum: (s: string) => void; mitArchiv?: boolean }) {
  const w = useWelt();
  const optionen = (mitArchiv ? [['0', 'Nur im Archiv'] as [string, string]] : []).concat(DAUERN);
  return (
    <Feld label={mitArchiv ? 'Oben im Dienst zeigen' : 'Wie lange anzeigen?'}>
      <Chips>{optionen.map(([k, t]) => <Chip key={k} text={t} an={dw === k} onPress={() => setDw(k)} />)}</Chips>
      {dw === 'datum' ? <Eingabe value={datum} onChangeText={setDatum} placeholder="JJJJ-MM-TT" style={{ maxWidth: 220 }} /> : null}
      <T art="beschr">{w.dauerText(dw, w.naechsterDienst())}</T>
    </Feld>
  );
}

/** Hinweis für die nächsten Dienste. Verfasser ist immer die angemeldete Person (Betreuung nach Unterschrift oder Leitung mit Code). */
export function HinweisBlatt() {
  const w = useWelt();
  const [text, setText] = useState('');
  const [dw, setDw] = useState('3');
  const [datum, setDatum] = useState(iso(plus(w.naechsterDienst(), 3)));
  const [wichtig, setWichtig] = useState(false);
  const von = w.aktivePerson();
  return (
    <Blatt titel="Hinweis für die nächsten Dienste" text={'Erscheint im Bericht unter „Hinweise“, ab dem Dienst am ' + kurz(w.naechsterDienst()) + '. Von ' + von + '.'}
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Speichern" art="primaer" klein disabled={!text.trim()} testID="hinweis-speichern" onPress={() => hinweisSpeichern(von, text.trim(), dw, datum, wichtig)} /></>}>
      <Feld label="Hinweis"><Eingabe mehrzeilig value={text} onChangeText={setText} autoFocus testID="hinweis-text" /></Feld>
      <DauerWahl dw={dw} setDw={setDw} datum={datum} setDatum={setDatum} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Schalter an={wichtig} onChange={setWichtig} label="Wichtig" /><T art="text">wichtig (gelb hervorgehoben)</T></View>
    </Blatt>
  );
}

function KommentarBlatt({ datum, start }: { datum: string; start: KommentarArt }) {
  const w = useWelt();
  const e = w.archivEintraege().find((x) => x.datum === datum);
  const gaeste = e ? w.genannteGaeste(e.text + ' ' + (e.fragen || '')) : [];
  const [art, setArt] = useState<KommentarArt>(start);
  const [text, setText] = useState('');
  const [gast, setGast] = useState<string | null>(start !== 'kommentar' && gaeste[0] ? gaeste[0].id : null);
  const [aufnahme, setAufnahme] = useState(true);
  const [dw, setDw] = useState(start === 'kommentar' ? '0' : '1');
  const [bis, setBis] = useState(iso(plus(w.naechsterDienst(), 3)));
  if (!e) return null;
  const von = w.aktivePerson();
  return (
    <Blatt breit titel={(art === 'antwort' ? 'Frage beantworten' : art === 'hinweis' ? 'Wichtiger Hinweis' : 'Kommentar') + ' · Bericht ' + kurz(pd(datum))} text={art === 'antwort' && e.fragen ? e.fragen : 'Von ' + von + '. Erscheint im Archiv beim Bericht und auf Wunsch oben im nächsten Dienst.'}
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Speichern" art="primaer" klein disabled={!text.trim()} testID="kommentar-speichern" onPress={() => kommentarSpeichern(datum, art, von, text.trim(), gast, aufnahme, dw, bis)} /></>}>
      <Feld label="Art"><Seg optionen={KOMMENTAR_ART as [KommentarArt, string][]} wert={art} onChange={setArt} /></Feld>
      <Feld label="Text"><Eingabe mehrzeilig value={text} onChangeText={setText} autoFocus testID="kommentar-text" /></Feld>
      <Feld label="Betrifft Gast">
        <Chips>{gaeste.map((g) => <Chip key={g.id} text={w.anzeige(g)} an={gast === g.id} onPress={() => setGast(g.id)} />)}<Chip text="Keinen" an={!gast} onPress={() => setGast(null)} /></Chips>
        {gast ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Schalter an={aufnahme} onChange={setAufnahme} label="Bei Wiederaufnahme anzeigen" /><T art="klein" style={{ flex: 1 }}>Steht in den Notizen des Gastes und erscheint bei der Wiederaufnahme</T></View> : null}
      </Feld>
      <DauerWahl dw={dw} setDw={setDw} datum={bis} setDatum={setBis} mitArchiv />
    </Blatt>
  );
}

function HinweisListe() {
  const w = useWelt();
  const f = useFarben();
  const [alt, setAlt] = useState(false);
  const di = w.hIso;
  const aktiv = w.S.hinweise.filter((h) => !h.beendet && h.bis >= di), vorbei = w.S.hinweise.filter((h) => h.beendet || h.bis < di);
  const karte = (h: (typeof aktiv)[number], v: boolean) => (
    <HinweisKarte key={h.id} von={h.von} wichtig={h.wichtig} blass={v}
      kopf={(h.wichtig ? 'wichtig · ' : '') + (v ? (h.beendet ? 'beendet ' + h.beendet : 'abgelaufen ' + kurz(pd(h.bis))) : w.zeitraum(h) + (h.dauer ? ' · ' + h.dauer : '')) + (!v && h.ab && h.ab > di ? ' · geplant' : '') + (h.bezug ? ' · zu Bericht ' + kurz(pd(h.bezug)) : '')}
      rechts={!v && w.tag === 0 ? <Knopf text="Beenden" klein art="rahmen" onPress={() => { if (darf()) hinweisEnde(h.id); }} /> : undefined} text={h.text} />
  );
  return (
    <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 20, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <T art="abschnitt" style={{ flex: 1 }}>Hinweise für die nächsten Dienste</T>
        {w.tag === 0 ? <Knopf text="Hinweis hinterlegen" icon="plus" art="primaer" klein onPress={() => { if (darf()) zeige(<HinweisBlatt />); }} /> : null}
      </View>
      <T art="beschr">Erscheinen im Bericht unter „Hinweise“, solange sie gelten.</T>
      {aktiv.length ? aktiv.map((h) => karte(h, false)) : <T art="beschr">Keine Hinweise hinterlegt.</T>}
      {vorbei.length ? <Knopf text={(alt ? 'Ausblenden: ' : 'Abgelaufen und beendet ') + '(' + vorbei.length + ')'} klein art="rahmen" icon={alt ? 'auf' : 'ab'} style={{ alignSelf: 'flex-start' }} onPress={() => setAlt(!alt)} /> : null}
      {alt ? vorbei.map((h) => karte(h, true)) : null}
    </View>
  );
}

export function Archiv() {
  const w = useWelt();
  const f = useFarben();
  const eintraege = w.archivEintraege();
  const offen: { datum: string; was: string; erledigt: boolean }[] = [];
  eintraege.forEach((a) => w.fehltListe(a).forEach((x) => offen.push({ datum: a.datum, was: x, erledigt: !!w.S.fehltErledigt[a.datum + '|' + x] })));
  const kommentieren = (datum: string, art: KommentarArt) => { if (darf()) zeige(<KommentarBlatt datum={datum} start={art} />, true); };
  return (
    <View style={{ gap: 16 }}>
      <HinweisListe />
      <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 20, gap: 10 }}>
        <T art="abschnitt">Fehlt etwas</T>
        <T art="beschr">Aus den letzten Berichten. Abhaken, wenn es besorgt ist.</T>
        {offen.length ? <Chips>{offen.map((o) => <Chip key={o.datum + o.was} text={o.was} nebentext={kurz(pd(o.datum))} icon="einkauf" an={o.erledigt} onPress={() => { if (darf()) fehltErledigt(o.datum + '|' + o.was); }} />)}</Chips> : <T art="beschr">Nichts offen.</T>}
      </View>
      <T art="abschnitt" style={{ marginTop: 8 }}>Berichte</T>
      {eintraege.map((a) => {
        const fl = w.fehltListe(a);
        return (
          <View key={a.datum} style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 18, gap: 10, borderWidth: a.vorfall ? 3 : 0, borderColor: f.vorfall }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Icon name={a.vorfall ? 'vorfall' : 'bericht'} farbe={a.vorfall ? f.vorfall : f.tinte} />
              <T art="stark" style={{ flex: 1 }}>{lang(pd(a.datum))}</T>
              <T art="beschr">{a.personen}</T>
              <Pille icon="schloss" text="abgeschlossen" />
            </View>
            <T art="text" farbe={f.tinte2}>{a.text}</T>
            {a.fragen ? <Zeile icon="sprache" titel="Frage von Gästen" klein={a.fragen} rechts={<Knopf text="Antworten" klein art="rahmen" onPress={() => kommentieren(a.datum, 'antwort')} />} /> : null}
            {fl.length ? <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}><T art="beschr">Fehlt:</T>{fl.map((x) => { const ok = !!w.S.fehltErledigt[a.datum + '|' + x]; return <Pille key={x} art={ok ? 'normal' : 'warnung'} icon={ok ? 'check' : 'einkauf'} text={x} />; })}</View> : null}
            {(a.kommentare || []).map((c, i) => {
              const g = c.gast ? w.S.G[c.gast] : null;
              return (
                <View key={i} style={{ padding: 12, borderRadius: radius.m, backgroundColor: c.art === 'hinweis' ? f.warnungFlaeche : f.flaeche2, gap: 4, borderLeftWidth: 4, borderLeftColor: c.art === 'hinweis' ? f.warnung : f.blau }}>
                  <T art="label">{c.von} · {KOMMENTAR_ART.find((x) => x[0] === c.art)?.[1]}</T>
                  <T art="text">{c.text}</T>
                  <T art="beschr">{c.um}{g ? ' · betrifft ' + w.anzeige(g) + (c.aufnahme ? ', bei Wiederaufnahme' : '') : ''}{c.bis ? ' · im Dienst bis ' + kurz(pd(c.bis)) : ''}</T>
                </View>
              );
            })}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Knopf text="Kommentieren" icon="notiz" klein art="rahmen" onPress={() => kommentieren(a.datum, 'kommentar')} />
              <Knopf text="Wichtiger Hinweis" icon="warnung" klein art="rahmen" onPress={() => kommentieren(a.datum, 'hinweis')} />
              {w.S.berichte[a.datum] ? <Knopf text="PDF" icon="pdf" klein art="rahmen" onPress={() => berichtPdf(welt(), a.datum)} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
