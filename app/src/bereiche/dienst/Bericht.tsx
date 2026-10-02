// Dienstbericht (Designsystem › Bericht): Besetzung mit Unterschrift, Felder in fester Reihenfolge, Abschluss, danach nur ergänzen.
import { useEffect, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View, type NativeSyntheticEvent, type TextInputSelectionChangeEventData } from 'react-native';
import { iso, kurz, lang, monatName, mKey, pd } from '../../domain/datum';
import { FEHLT } from '../../domain/haus';
import { stufeSym } from '../../domain/welt';
import { berichtAbschliessen, besetzungUnterschreiben, dienstBeginnen, externDazu, feldSetzen, fehltUmschalten, jaNein, nachtrag, personSetzen, zielSetzen } from '../../store/aktionen';
import { getU, schliessen, toast, ui, useU, useWelt, welt, zeige } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Banner, Chip, Chips, Eingabe, Feld, Icon, Knopf, Leer, Pille, Seg, T, Zeile } from '../../ui/basis';
import { Blatt, Dialog, MiniUnterschrift, UnterschriftFeld } from '../../ui/overlay';
import { useFarben } from '../../ui/theme';
import { AnmeldeBlatt, darf, NurAnsehenBalken } from '../anmeldung';
import { HinweisKarte, Wahl } from '../gemeinsam';
import { KhtBlatt } from '../plan/handlungen';
import { berichtPdf } from '../../pdf/pdf';
import { HinweisBlatt } from './Archiv';
import { NachweisBlatt } from './Monat';

type Textfeld = 'hinweise' | 'fragen' | 'sonstiges' | 'fehltText' | 'schluesselNr';

/** Textfeld mit eigenem Zustand; speichert verzögert und beim Verlassen. Im Hinweisfeld: @-Vorschläge und Stufenwörter. */
function TextFeld({ feld, wert, gesperrt, platzhalter, mehrzeilig = true, werkzeuge, stil }: { feld: Textfeld; wert: string; gesperrt: boolean; platzhalter?: string; mehrzeilig?: boolean; werkzeuge?: boolean; stil?: object }) {
  const w = useWelt();
  const f = useFarben();
  const [text, setText] = useState(wert);
  const [sel, setSel] = useState({ start: wert.length, end: wert.length });
  const [fokus, setFokus] = useState(false);
  const zeit = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { if (!fokus) setText(wert); }, [wert, fokus]);
  const speichern = (t: string) => { if (zeit.current) clearTimeout(zeit.current); zeit.current = setTimeout(() => feldSetzen(feld, t), 400); };
  const aendern = (t: string) => { setText(t); speichern(t); };
  const einfuegen = (txt: string) => {
    let a = sel.start, neu: string;
    if (/^(Verwarnung|Gelbe Karte|Hausverbot) $/.test(txt)) { const start = text.lastIndexOf('\n', a - 1) + 1; neu = text.slice(0, start) + txt + text.slice(start); a = a + txt.length; }
    else { neu = text.slice(0, a) + txt + text.slice(sel.end); a = a + txt.length; }
    aendern(neu); setSel({ start: a, end: a });
  };
  const m = werkzeuge && fokus ? /@([A-Za-zÄÖÜäöüß-]*)$/.exec(text.slice(0, sel.start)) : null;
  const vorschlaege = m ? w.gaeste().filter((g) => g.vorname.toLowerCase().startsWith(m[1].toLowerCase())).sort((a, b) => (w.bettVon(b.id) ? 1 : 0) - (w.bettVon(a.id) ? 1 : 0) || a.vorname.localeCompare(b.vorname)).slice(0, 6) : [];
  const erwaehnen = (gid: string) => {
    const g = w.S.G[gid], name = g.vorname + (w.gleicherVorname(g) ? ' (' + w.zusatz(g) + ')' : '');
    const start = text.lastIndexOf('@', sel.start - 1), neu = text.slice(0, start) + '@' + name + ' ' + text.slice(sel.start), pos = start + name.length + 2;
    aendern(neu); setSel({ start: pos, end: pos });
  };
  return (
    <View style={{ gap: 6 }}>
      <Eingabe mehrzeilig={mehrzeilig} value={text} editable={!gesperrt} placeholder={platzhalter} testID={'feld-' + feld}
        selection={fokus ? sel : undefined}
        onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => setSel(e.nativeEvent.selection)}
        onFocus={() => { if (!gesperrt && !welt().darfAendern()) darf(); setFokus(true); }}
        onBlur={() => { setFokus(false); if (zeit.current) clearTimeout(zeit.current); if (text !== wert) feldSetzen(feld, text); }}
        onChangeText={(t) => { if (!welt().darfAendern()) return; aendern(t); }}
        style={[gesperrt ? { backgroundColor: f.flaeche2, color: f.tinte2 } : null, stil]} />
      {vorschlaege.length ? (
        <Chips>{vorschlaege.map((g) => { const b = w.bettVon(g.id); return <Chip key={g.id} text={g.vorname + (g.nachname ? ' ' + g.nachname : '')} nebentext={b ? b + ' · ' + w.statusWort(b) : 'Gästedatenbank'} onPress={() => erwaehnen(g.id)} />; })}</Chips>
      ) : null}
      {werkzeuge && fokus && !gesperrt ? (
        <Chips>
          <Chip text="@ Gast" klein onPress={() => einfuegen('@')} />
          <Chip text="Verwarnung" icon="verwarnung" klein onPress={() => einfuegen('Verwarnung ')} />
          <Chip text="Gelbe Karte" icon="karte-gelb" klein onPress={() => einfuegen('Gelbe Karte ')} />
          <Chip text="Hausverbot" icon="karte-rot" klein onPress={() => einfuegen('Hausverbot ')} />
        </Chips>
      ) : null}
    </View>
  );
}

function Erkannt({ text, ziele, gesperrt }: { text: string; ziele: Record<string, string>; gesperrt: boolean }) {
  const w = useWelt();
  const f = useFarben();
  const e = w.erkennen(text, ziele);
  if (!e.erw.length && !e.mehrdeutig.length) return null;
  const nurNotiz: string[] = [];
  e.absaetze.filter((a) => !a.stufe).forEach((a) => a.genannt.forEach((g) => { if (!nurNotiz.includes(g.id)) nurNotiz.push(g.id); }));
  return (
    <View style={{ gap: 8 }}>
      {e.absaetze.filter((a) => a.stufe).map((a) => (
        <View key={a.idx} style={{ gap: 8, padding: 12, borderRadius: radius.m, backgroundColor: f.flaeche2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Icon name={stufeSym(a.stufe!)} /><T art="stark">{a.stufe} für</T>
            <Pressable accessibilityRole="button" disabled={gesperrt} onPress={() => { if (darf()) zeige(<ZielBlatt idx={a.idx} />); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: 999, backgroundColor: f.flaeche, borderWidth: 1.5, borderColor: f.linieStark }}>
              <T art="stark">{a.ziel ? a.ziel.vorname : 'niemand'}</T>
              {a.ziel && w.bettVon(a.ziel.id) ? <T art="zahlKlein" farbe={f.tinte2}>{w.bettVon(a.ziel.id)}</T> : null}
              {a.genannt.length > 1 ? <Icon name="ab" groesse={16} /> : null}
            </Pressable>
          </View>
          {a.rest.length ? <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}><T art="beschr">Nur Notiz, keine Sanktion:</T>{a.rest.map((g) => <Pille key={g.id} icon="notiz" text={w.anzeige(g)} />)}</View> : null}
        </View>
      ))}
      {nurNotiz.length ? <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>{nurNotiz.map((id) => <Pille key={id} art="blau" icon="notiz" text={'Notiz für ' + w.anzeige(w.S.G[id])} />)}</View> : null}
      {e.mehrdeutig.map((m) => <Pille key={m.name} art="warnung" icon="warnung" text={'@' + m.name + ' gibt es ' + m.kandidaten.length + '-mal: Bettnummer ergänzen, z. B. @' + m.name + ' (' + w.zusatz(m.kandidaten[0]) + ')'} />)}
    </View>
  );
}

function ZielBlatt({ idx }: { idx: number }) {
  const w = useWelt();
  const b = w.bericht(w.hIso)!;
  const a = w.erkennen(b.f.hinweise, b.f.ziele).absaetze.find((x) => x.idx === idx);
  if (!a) return null;
  return (
    <Blatt titel={'Wer bekommt die ' + a.stufe + '?'} text="Nur eine Person bekommt die Sanktion. Alle anderen Genannten bekommen den Absatz als Notiz, ohne Verwarnung, Karte oder Hausverbot.">
      {a.genannt.map((g) => <Wahl key={g.id} titel={w.vollName(g) + (w.bettVon(g.id) ? ' · ' + w.bettVon(g.id) : '')} text={w.aktivSank(g).length ? 'bisher: ' + w.aktivSank(g).map((x) => x.stufe).join(', ') : 'bisher keine Sanktion'} an={a.ziel?.id === g.id} onPress={() => zielSetzen(idx, g.id)} />)}
      <Wahl titel="Niemand" text="Nur Notizen, keine Sanktion" an={!a.ziel} onPress={() => zielSetzen(idx, 'keiner')} />
    </Blatt>
  );
}

function PersonBlatt({ i }: { i: number }) {
  const w = useWelt();
  const [grund, setGrund] = useState<'Tausch' | 'Sonstiges'>('Tausch');
  const b = w.bericht(w.hIso)!, x = b.besetzung[i];
  const leute = w.team(x.rolle === 'Küche' ? 'kueche' : 'betreuung');
  return (
    <Blatt titel={'Person tauschen · ' + x.rolle} text="Geplante und tatsächliche Person werden beide gespeichert und zählen im Monatsabschluss." knoepfe={<Knopf text="Abbrechen" klein onPress={schliessen} />}>
      <Feld label="Grund"><Seg optionen={[['Tausch', 'Tausch'], ['Sonstiges', 'Sonstiges']]} wert={grund} onChange={setGrund} /></Feld>
      <Feld label="Wer macht den Dienst?"><Chips>{leute.map((n) => <Chip key={n} text={n} an={n === x.name} onPress={() => personSetzen(i, n, grund)} />)}</Chips></Feld>
    </Blatt>
  );
}

function ExternBlatt() {
  const w = useWelt();
  const namen = w.gaeste().filter((g) => !w.bettVon(g.id) || g.standort === 'nikolaus');
  return (
    <Blatt titel="Externe Gäste" text="Personen, die nur zum Essen kommen, auch aus St. Nikolaus." knoepfe={<Knopf text="Fertig" klein onPress={schliessen} />}>
      <Chips>{namen.map((g) => <Chip key={g.id} text={g.vorname + (g.standort === 'nikolaus' ? ' · St. Nikolaus' : '')} onPress={() => externDazu(g.vorname)} />)}</Chips>
    </Blatt>
  );
}

function NachtragBlatt() {
  const [t, setT] = useState('');
  return (
    <Blatt titel="Bericht ergänzen" text="Der abgeschlossene Bericht lässt sich nicht mehr ändern. Die Ergänzung steht mit Zeit und Namen darunter und kommt ins PDF."
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Speichern" art="primaer" klein disabled={!t.trim()} onPress={() => nachtrag(t.trim())} /></>}>
      <Feld label="Ergänzung"><Eingabe mehrzeilig value={t} onChangeText={setT} autoFocus /></Feld>
    </Blatt>
  );
}

function BesetzungUnterschrift({ i }: { i: number }) {
  const w = useWelt();
  const x = w.bericht(w.hIso)!.besetzung[i];
  return (
    <Blatt titel={'Unterschrift ' + x.name} text={x.rolle + ' · Dienst ' + kurz(w.H) + (x.rolle === 'Küche' ? ' · Küche unterschreibt, ändert aber nichts im Bettenplan' : ' · danach kannst du ändern')}>
      <UnterschriftFeld wer={x.name} wofuer={x.rolle} testID={'sig-bes' + i} onFertig={(sig) => { besetzungUnterschreiben(i, sig); schliessen(); toast('anwesend', x.name + ' hat unterschrieben', x.rolle === 'Küche' ? 'Dienst zählt im Monatsabschluss.' : 'Angemeldet. Änderungen werden mit diesem Namen vermerkt.', 3000); }} />
    </Blatt>
  );
}

/** Abschließen: Pflichtfelder prüfen, fehlende Unterschriften nachfragen (geht auch ohne), dann sperren. */
function abschliessen(trotzdem: boolean): void {
  if (!darf()) return;
  const w = welt(), b = w.bericht(w.hIso)!;
  const fehlend = b.besetzung.filter((x) => x.name !== 'offen' && !x.sig), nurKueche = fehlend.length > 0 && fehlend.every((x) => x.rolle === 'Küche');
  if (w.berichtOffenPflicht(b)) { ui({ pruefen: true }); toast('warnung', 'Bericht noch nicht vollständig', w.pflichtText(b), 5000); return; }
  if (fehlend.length && !trotzdem) {
    zeige(<Dialog titel="Wirklich ohne Unterschrift abschließen?" text={'Es fehlt die Unterschrift von ' + fehlend.map((x) => x.name + ' (' + x.rolle + ')').join(' und ') + '. ' + (nurKueche ? 'Der Küchendienst geht oft früher, das ist in Ordnung. ' : '') + 'Der Bericht wird im PDF als „ohne Unterschrift“ markiert. Der Dienst zählt im Monatsabschluss erst, wenn die Unterschrift nachgeholt ist.'}
      knoepfe={<><Knopf text="Zurück" klein onPress={schliessen} /><Knopf text="Ja, trotzdem abschließen" art="gefahrVoll" klein testID="trotzdem" onPress={() => abschliessen(true)} /></>} />);
    return;
  }
  const r = berichtAbschliessen();
  toast(r.ohne.length ? 'warnung' : 'pdf', 'Bericht abgeschlossen', w.hIso + '_Dienstbericht.pdf' + (r.ohne.length ? ' · ohne Unterschrift von ' + r.ohne.join(', ') : '') + (r.anzahl ? ' · ' + r.anzahl + (r.anzahl === 1 ? ' Sanktion' : ' Sanktionen') + ' angelegt' : ''), 5000);
}

function Zeilenfeld({ label, children, pflicht }: { label: string; children: React.ReactNode; pflicht?: boolean }) {
  const f = useFarben();
  const { width } = useWindowDimensions();
  const breit = width > 1000;
  return (
    <View style={{ flexDirection: breit ? 'row' : 'column', gap: breit ? 16 : 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: f.linie }}>
      <View style={{ width: breit ? 190 : undefined, paddingTop: breit ? 12 : 0, flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><T art="label" farbe={f.tinte}>{label}</T>{pflicht ? <Pille art="warnung" icon="warnung" text="Pflicht" /> : null}</View>
      <View style={{ flex: 1, gap: 8 }}>{children}</View>
    </View>
  );
}

function Seitenleiste() {
  const w = useWelt();
  const f = useFarben();
  const t = iso2(w);
  const waesche = w.S.termine.filter((x) => x.datum === t && x.art === 'Bettwäsche');
  const aktiv = w.S.hinweise.filter((h) => w.hinweisAktiv(h, t));
  const b = w.bericht(t), zu = b?.status === 'abgeschlossen';
  // Seit dem letzten Dienst der handelnden Person
  const a = w.angemeldet();
  const letzter = a && !a.leitung ? Object.keys(w.S.berichte).concat(w.S.archiv.map((x) => x.datum)).filter((dd) => dd < w.hIso && (w.S.berichte[dd]?.besetzung.some((x) => x.name === a.name && x.sig) || (w.S.einsaetze[dd] || []).some((e) => e.name === a.name))).sort().pop() : undefined;
  const archiv = w.S.archiv.filter((x) => (letzter ? x.datum > letzter : true)).slice().sort((x, y) => (y.vorfall ? 1 : 0) - (x.vorfall ? 1 : 0) || (x.datum < y.datum ? 1 : -1)).slice(0, letzter ? 20 : 4);
  return (
    <View style={{ gap: 10 }}>
      <T art="abschnitt">Hinweise</T>
      {waesche.map((x, i) => <HinweisKarte key={'w' + i} von="Kalender" kopf="wichtig · heute" icon="wiederholen" wichtig text={x.titel} />)}
      {aktiv.map((h) => <HinweisKarte key={h.id} von={h.von} wichtig={h.wichtig} kopf={(h.wichtig ? 'wichtig · ' : '') + (h.ab === h.bis ? 'nur heute' : 'bis ' + kurz(pd(h.bis))) + (h.bezug ? ' · zu Bericht ' + kurz(pd(h.bezug)) : '')} text={h.text} />)}
      {!waesche.length && !aktiv.length ? <T art="beschr">Keine Hinweise.</T> : null}
      {w.tag === 0 && !zu ? <Knopf text="Hinweis hinterlegen" icon="plus" klein art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => { if (darf()) zeige(<HinweisBlatt />); }} /> : null}
      <T art="abschnitt" style={{ marginTop: 12 }}>{letzter ? 'Seit deinem letzten Dienst (' + kurz(pd(letzter)) + ')' : 'Letzte Berichte'}</T>
      {archiv.length ? archiv.map((x) => <HinweisKarte key={x.datum} von={'Bericht ' + kurz(pd(x.datum))} kopf={x.vorfall ? 'Vorfall' : undefined} icon={x.vorfall ? 'vorfall' : 'bericht'} vorfall={x.vorfall} text={x.text} />) : <T art="beschr">Keine neuen Berichte.</T>}
      <T art="abschnitt" style={{ marginTop: 12 }}>Heute</T>
      {w.S.termine.filter((x) => x.datum === t && x.art !== 'Bettwäsche').map((x, i) => <HinweisKarte key={'t' + i} von="Kalender" kopf={x.art} icon={x.sym} text={x.titel} />)}
      {!w.S.termine.some((x) => x.datum === t && x.art !== 'Bettwäsche') ? <T art="beschr">Keine Termine.</T> : null}
      <View style={{ height: 1, backgroundColor: f.linie, marginTop: 8 }} />
    </View>
  );
}
function iso2(w: ReturnType<typeof welt>): string { return iso(w.tagDatum()); }

export function Bericht() {
  const w = useWelt();
  const f = useFarben();
  const pruefen = useU((u) => u.pruefen);
  const spaeter = useU((u) => u.spaeter);
  const { width } = useWindowDimensions();
  const zwei = width > 1150;
  const di = iso2(w);
  const b = w.bericht(di);
  const seite = <Seitenleiste />;
  if (!b) {
    return (
      <View style={{ flexDirection: zwei ? 'row' : 'column', gap: 16 }}>
        <View style={{ flex: 1, backgroundColor: f.flaeche, borderRadius: radius.l }}>
          {w.tag !== 0 ? <Leer icon="bericht" titel="Kein Bericht für diesen Tag" text="Für diesen Tag wurde kein Bericht in der App geschrieben. Ältere Berichte stehen im Archiv." />
            : <Leer icon="bericht" titel="Noch kein Bericht für heute" text="Der Dienst beginnt mit der Unterschrift in der Besetzung. Damit meldest du dich an und kannst den Bericht schreiben.">
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Knopf text="Dienst beginnen · unterschreiben" icon="unterschrift" art="primaer" testID="dienst-beginnen" onPress={() => zeige(<AnmeldeBlatt />)} />
                {w.angemeldet()?.leitung ? <Knopf text="Bericht anlegen (Leitung)" icon="bericht" art="rahmen" onPress={dienstBeginnen} /> : null}
              </View>
            </Leer>}
        </View>
        <View style={{ width: zwei ? 340 : undefined }}>{seite}</View>
      </View>
    );
  }
  const zu = b.status === 'abgeschlossen', ff = b.f, k = w.kennzahlen();
  const gesperrt = zu || w.tag !== 0;
  const pflicht = (x: string | null) => !zu && pruefen && x == null;
  const letzte = w.letzterDienstHeute().filter((x) => !spaeter[x.name + x.bereich]);
  const haupt = (
    <View style={{ gap: 16 }}>
      {letzte.map((x) => (
        <Banner key={x.name + x.bereich} blau icon="unterschrift" titel={x.name + ': Heute ist dein letzter geplanter Dienst (' + (x.bereich === 'kueche' ? 'Küche' : 'Betreuung') + ') im ' + monatName(mKey(w.H)).split(' ')[0] + '.'} klein="Dienstnachweis jetzt ansehen und unterschreiben? Freiwillig, geht auch später im Monatsabschluss."
          rechts={<View style={{ flexDirection: 'row', gap: 8 }}><Knopf text="Später" klein onPress={() => ui({ spaeter: { ...getU().spaeter, [x.name + x.bereich]: true } })} /><Knopf text="Ansehen" klein art="primaer" onPress={() => zeige(<NachweisBlatt k={mKey(w.H)} name={x.name} b={x.bereich} />, true)} /></View>} />
      ))}
      {w.tag === 0 && !zu ? <NurAnsehenBalken /> : null}
      <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 20, gap: 12 }}>
        {zu ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.m, backgroundColor: f.flaeche2, flexWrap: 'wrap' }}>
            <Icon name="schloss" />
            <View style={{ flex: 1, minWidth: 240, gap: 4 }}>
              <T art="stark">Bericht abgeschlossen</T>
              {(b.ohneUnterschrift || []).length ? <Pille art="warnung" icon="warnung" text={'ohne Unterschrift: ' + b.ohneUnterschrift!.join(', ')} /> : null}
              <T art="beschr">{b.zuUm} · {b.besetzung.map((x) => x.name).join(', ')} · PDF auf dem Gerät · nicht mehr änderbar, nur ergänzen</T>
            </View>
            <Knopf text="PDF ansehen und teilen" icon="teilen" klein art="rahmen" onPress={() => berichtPdf(welt(), di)} />
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}><T art="titel" style={{ flex: 1 }}>{lang(w.tagDatum())}</T><T art="beschr">begonnen {b.begonnen}</T></View>
        {b.besetzung.map((x, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <T art="label" style={{ width: 110 }}>{x.rolle}</T>
            <Pressable accessibilityRole="button" disabled={gesperrt} testID={'besetzung-person-' + i} onPress={() => { if (darf()) zeige(<PersonBlatt i={i} />); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingLeft: 4, paddingRight: 14, borderRadius: 999, backgroundColor: f.flaeche2, borderWidth: x.name === 'offen' ? 1.5 : 0, borderColor: f.linieStark }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: f.flaeche3 }}><T art="label">{x.name === 'offen' ? '?' : x.name.slice(0, 2).toUpperCase()}</T></View>
              <T art="stark">{x.name}</T>{!gesperrt ? <Icon name="tauschen" groesse={16} farbe={f.tinte2} /> : null}
            </Pressable>
            {x.geplant && x.geplant !== x.name ? <T art="beschr">statt {x.geplant}{x.grund ? ' · ' + x.grund : ''}</T> : null}
            <View style={{ flex: 1, minWidth: 220 }}>
              {x.sig ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 12, borderRadius: radius.m, backgroundColor: f.papier, borderWidth: 2, borderColor: f.frei }}>
                  <MiniUnterschrift sig={x.sig} hoehe={36} /><View style={{ flex: 1 }} /><Icon name="check" groesse={18} farbe={f.frei} /><T art="beschr">{x.um}</T>
                </View>
              ) : (
                <Pressable accessibilityRole="button" disabled={x.name === 'offen' || w.tag !== 0} testID={'besetzung-sig-' + i} onPress={() => zeige(<BesetzungUnterschrift i={i} />)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: 14, borderRadius: radius.m, borderWidth: 2, borderStyle: 'dashed', borderColor: x.name === 'offen' ? f.linie : f.blau, backgroundColor: f.papier, opacity: x.name === 'offen' ? 0.6 : 1 }}>
                  <Icon name="unterschrift" groesse={18} farbe={f.blau} />
                  <T art="label" farbe={f.blau}>{x.name === 'offen' ? 'Erst Person wählen' : zu ? 'Unterschrift nachholen' : 'Tippen zum Unterschreiben'}</T>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, paddingHorizontal: 20, paddingVertical: 8, borderWidth: ff.vorfall === 'ja' ? 3 : 0, borderColor: f.vorfall }}>
        {ff.vorfall === 'ja' ? <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 10 }}><Icon name="vorfall" farbe={f.vorfall} /><T art="stark" farbe={f.vorfall}>Bericht mit Vorfall</T></View> : null}
        <Zeilenfeld label="Hat KHT angerufen?" pflicht={pflicht(ff.kht)}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Seg optionen={[['ja', 'Ja'], ['nein', 'Nein']]} wert={ff.kht} disabled={gesperrt} onChange={(v) => { if (darf()) jaNein('kht', v); }} />
            <Pille icon="telefon" text={'KHT-Nummer ' + (b.khtNr ?? k.belegt)} onPress={() => zeige(<KhtBlatt />)} />
          </View>
        </Zeilenfeld>
        <Zeilenfeld label="Wichtige Hinweise">
          <TextFeld feld="hinweise" wert={ff.hinweise} gesperrt={gesperrt} werkzeuge platzhalter="Was sollen die nächsten wissen? @ erwähnt einen Gast. Ein Absatz mit „Verwarnung“, „Gelbe Karte“ oder „Hausverbot“ am Anfang legt eine Sanktion für genau eine Person an, die anderen bekommen nur eine Notiz." />
          <Erkannt text={ff.hinweise} ziele={ff.ziele} gesperrt={gesperrt} />
        </Zeilenfeld>
        <Zeilenfeld label="Fragen von Gästen"><TextFeld feld="fragen" wert={ff.fragen} gesperrt={gesperrt} platzhalter="z. B. Max fragt nach einer zweiten Decke" /></Zeilenfeld>
        <Zeilenfeld label="Abwesenheiten">
          {(zu && b.abw ? b.abw.map((t, i) => <Zeile key={i} icon="abwesend" titel={t} />) : w.abwesenheiten().map((x) => <Zeile key={x.nr} icon={x.sym} art={x.warn ? 'warnung' : 'normal'} titel={x.gast.vorname + ' · ' + x.nr + ' · ' + x.text} klein="aus dem Bettenplan" />))}
          {!(zu && b.abw ? b.abw.length : w.abwesenheiten().length) ? <T art="beschr" style={{ paddingTop: 12 }}>Keine Abwesenheiten.</T> : null}
        </Zeilenfeld>
        <Zeilenfeld label="Externe Gäste">
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {ff.extern.map((n) => <Pille key={n} icon="person" text={n} />)}
            {!gesperrt ? <Chip text="Gast hinzufügen" icon="plus" onPress={() => { if (darf()) zeige(<ExternBlatt />); }} /> : !ff.extern.length ? <T art="beschr">–</T> : null}
          </View>
        </Zeilenfeld>
        <Zeilenfeld label="Vorfälle" pflicht={pflicht(ff.vorfall)}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Seg optionen={[['ja', 'Ja'], ['nein', 'Nein']]} wert={ff.vorfall} disabled={gesperrt} onChange={(v) => { if (darf()) jaNein('vorfall', v); }} />
            {ff.vorfall === 'ja' ? <T art="beschr">Einzelheiten unter „Wichtige Hinweise“.</T> : null}
          </View>
        </Zeilenfeld>
        <Zeilenfeld label="Schlüssel fehlt">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Seg optionen={[['ja', 'Ja'], ['nein', 'Nein']]} wert={ff.schluessel} disabled={gesperrt} onChange={(v) => { if (darf()) jaNein('schluessel', v); }} />
            {ff.schluessel === 'ja' ? <View style={{ width: 220 }}><TextFeld feld="schluesselNr" wert={ff.schluesselNr} gesperrt={gesperrt} mehrzeilig={false} platzhalter="Nummer(n)" /></View> : null}
          </View>
        </Zeilenfeld>
        <Zeilenfeld label="Fehlt etwas">
          <Chips>{FEHLT.map((x) => <Chip key={x} text={x} an={ff.fehlt.includes(x)} disabled={gesperrt} onPress={() => { if (darf()) fehltUmschalten(x); }} />)}</Chips>
          <TextFeld feld="fehltText" wert={ff.fehltText} gesperrt={gesperrt} mehrzeilig={false} platzhalter="Was genau? z. B. Müllbeutel 120 l, Duschgel" />
        </Zeilenfeld>
        <Zeilenfeld label="Sonstiges"><TextFeld feld="sonstiges" wert={ff.sonstiges} gesperrt={gesperrt} /></Zeilenfeld>
      </View>
      {zu ? (
        <View style={{ gap: 8 }}>
          {b.nachtraege.map((n, i) => <View key={i} style={{ padding: 14, borderRadius: radius.m, backgroundColor: f.flaeche, gap: 4, borderLeftWidth: 4, borderLeftColor: f.blau }}><T art="label">Ergänzung</T><T art="text">{n.text}</T><T art="beschr">{n.um} · {n.von}</T></View>)}
          {w.tag === 0 ? <Knopf text="Ergänzen" icon="stift" art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => { if (darf()) zeige(<NachtragBlatt />); }} /> : null}
        </View>
      ) : w.tag === 0 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <T art="beschr" style={{ flex: 1, minWidth: 240, textAlign: 'right' }}>{w.pflichtText(b)}</T>
          <Knopf text="Bericht abschließen" icon="schloss" art="primaer" testID="abschliessen" onPress={() => abschliessen(false)} />
        </View>
      ) : null}
    </View>
  );
  return (
    <View style={{ flexDirection: zwei ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
      <View style={{ flex: zwei ? 1 : undefined, alignSelf: 'stretch' }}>{haupt}</View>
      <View style={{ width: zwei ? 340 : undefined, alignSelf: zwei ? 'flex-start' : 'stretch' }}>{seite}</View>
    </View>
  );
}
