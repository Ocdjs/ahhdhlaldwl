// Monatsabschluss: Dienstnachweis je Person, Betreuung und Küche getrennt; Lohntabellen nur aus unterschriebenen Nachweisen.
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { kurz, mKey, monatName, pd, tageVon, wochentagKurz } from '../../domain/datum';
import type { Bereich } from '../../domain/typen';
import { nachweisUnterschreiben, planKorrektur } from '../../store/aktionen';
import { schliessen, toast, ui, useU, useWelt, welt, zeige } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Bald, Chip, Chips, Eingabe, Feld, Icon, Knopf, Pille, Seg, T, Zeile } from '../../ui/basis';
import { Blatt, MiniUnterschrift, UnterschriftFeld } from '../../ui/overlay';
import { useFarben } from '../../ui/theme';
import { darf } from '../anmeldung';
import { nachweisPdfTeilen } from '../../pdf/pdf';

const NAME: Record<Bereich, string> = { betreuung: 'Betreuung', kueche: 'Küche' };

function Zelle({ children, breite, rechts, kopf }: { children: React.ReactNode; breite: number; rechts?: boolean; kopf?: boolean }) {
  return <View style={{ width: breite, paddingVertical: 10, paddingHorizontal: 8, alignItems: rechts ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>{typeof children === 'string' || typeof children === 'number' ? <T art={kopf ? 'label' : rechts ? 'zahl' : 'text'} style={rechts && !kopf ? { fontSize: 17 } : { fontSize: kopf ? 14 : 16 }}>{children}</T> : children}</View>;
}
function Tabelle({ kopf, zeilen, breiten }: { kopf: string[]; zeilen: React.ReactNode[][]; breiten: number[] }) {
  const f = useFarben();
  return (
    <ScrollView horizontal>
      <View>
        <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: f.linieStark }}>{kopf.map((k, i) => <Zelle key={i} breite={breiten[i]} kopf rechts={breiten[i] < 110 && i > 0}>{k}</Zelle>)}</View>
        {zeilen.map((z, j) => <View key={j} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: f.linie }}>{z.map((c, i) => <Zelle key={i} breite={breiten[i]} rechts={breiten[i] < 110 && i > 0}>{c}</Zelle>)}</View>)}
      </View>
    </ScrollView>
  );
}

function KorrekturBlatt({ k, name, b }: { k: string; name: string; b: Bereich }) {
  const w = useWelt();
  const [soll, setSoll] = useState<Record<string, boolean>>(() => Object.fromEntries(tageVon(k).map((di) => [di, w.rollenGeplant(di, name, b).length > 0])));
  const [grund, setGrund] = useState('');
  return (
    <Blatt breit titel={'Geplante Dienste korrigieren · ' + NAME[b] + ' · ' + name}
      knoepfe={<><Knopf text="Abbrechen" klein onPress={() => zeige(<NachweisBlatt k={k} name={name} b={b} />, true)} /><Knopf text="Korrektur speichern" art="gefahrVoll" klein disabled={!grund.trim()} onPress={() => {
        const a = planKorrektur(k, name, b, soll, grund.trim(), welt().aktivePerson());
        zeige(<NachweisBlatt k={k} name={name} b={b} />, true);
        if (a.length) toast('warnung', 'Plan korrigiert', name + ' (' + NAME[b] + '): ' + a.join(', '), 5000);
      }} /></>}>
      <Zeile icon="warnung" art="warnung" titel="Der Originalplan ist Grundlage der Lohnabrechnung." klein="Nur korrigieren, wenn er falsch übernommen wurde. Die Änderung wird mit Name und Uhrzeit gespeichert." />
      <Feld label={'Geplante Tage im ' + monatName(k) + ' (' + NAME[b] + ')'}>
        <Chips>{tageVon(k).map((di) => <Chip key={di} klein text={kurz(pd(di))} an={soll[di]} onPress={() => setSoll({ ...soll, [di]: !soll[di] })} />)}</Chips>
      </Feld>
      <Feld label="Grund (Pflicht)"><Eingabe value={grund} onChangeText={setGrund} placeholder="z. B. Dienstplan falsch abgeschrieben" /></Feld>
    </Blatt>
  );
}

export function NachweisBlatt({ k, name, b }: { k: string; name: string; b: Bereich }) {
  const w = useWelt();
  const f = useFarben();
  const nw = w.nachweisVon(k, name, b), d = nw ? { zeilen: nw.zeilen, sum: nw } : w.nachweisDaten(k, name, b), s = d.sum;
  const logs = w.S.planLog.filter((l) => l.monat === k && l.name === name && l.bereich === b);
  return (
    <Blatt breit titel={'Dienstnachweis ' + NAME[b] + ' · ' + monatName(k) + ' · ' + name} text={nw ? undefined : 'Gemacht zählt jeder Dienst mit Unterschrift im Bericht bis jetzt. Nach der Unterschrift ist der Nachweis gesperrt.'}
      knoepfe={<><Knopf text="PDF" icon="pdf" klein art="rahmen" onPress={() => nachweisPdfTeilen(welt(), k, name, b)} /><Knopf text="Schließen" klein onPress={schliessen} /></>}>
      <View style={{ flexDirection: 'row', gap: 28, padding: 14, borderRadius: radius.m, backgroundColor: f.flaeche2, flexWrap: 'wrap' }}>
        {([['Geplant', s.geplant], ['Gemacht', s.gemacht], ['Abgegeben', s.abgegeben || 0], ['Vertretung', s.vertretung]] as [string, number][]).map(([t, z]) => <View key={t}><T art="label">{t}</T><T art="zahlGross">{z}</T></View>)}
      </View>
      {logs.map((l, i) => <Zeile key={i} icon="stift" art="warnung" titel={'Plan korrigiert: ' + l.aenderungen.join(', ')} klein={l.grund + ' · ' + l.von + ' · ' + l.um} />)}
      <Tabelle kopf={['Datum', 'Geplant', 'Gemacht', 'Bemerkung']} breiten={[110, 90, 160, 330]}
        zeilen={d.zeilen.map((z) => [wochentagKurz(pd(z.datum)) + ' ' + kurz(pd(z.datum)), z.geplant ? <Icon name="check" groesse={18} /> : '–', z.gemacht ? <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Icon name="check" groesse={18} /><T art="klein">{z.rolle || ''}</T></View> : '–', <T art="klein" farbe={z.abw ? f.warnung : f.tinte2}>{z.text}</T>])} />
      {nw ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.m, backgroundColor: f.flaeche2, flexWrap: 'wrap' }}>
          <Icon name="schloss" />
          <View style={{ flex: 1 }}><T art="stark">Unterschrieben {nw.um}</T><T art="beschr">{nw.pdf} · in der Lohntabelle {NAME[b]} · nicht mehr änderbar</T></View>
          <View style={{ backgroundColor: f.papier, borderRadius: 8, paddingHorizontal: 8 }}><MiniUnterschrift sig={nw.sig} hoehe={48} /></View>
        </View>
      ) : (
        <>
          <Knopf text="Geplante Dienste korrigieren" icon="stift" klein art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => { if (darf()) zeige(<KorrekturBlatt k={k} name={name} b={b} />, true); }} />
          <UnterschriftFeld wer={name} wofuer="Die Angaben stimmen" hoehe={160} knopfText="Unterschreiben" testID="sig-nachweis" onFertig={(sig) => nachweisUnterschreiben(k, name, b, sig)} />
        </>
      )}
    </Blatt>
  );
}

export function Monat() {
  const w = useWelt();
  const f = useFarben();
  const gewaehlt = useU((u) => u.monat);
  const kh = mKey(w.H), kv = mKey(new Date(w.H.getFullYear(), w.H.getMonth() - 1, 1)), k = gewaehlt || kh;
  const teil = (b: Bereich) => {
    const leute = w.personenIm(k, b), unter = leute.filter((n) => w.nachweisVon(k, n, b));
    return (
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}><Icon name={b === 'kueche' ? 'kueche' : 'personen'} /><T art="abschnitt" style={{ flex: 1 }}>{NAME[b]}</T><T art="beschr">{unter.length} von {leute.length} unterschrieben</T></View>
        <Tabelle kopf={['Person', 'Geplant', 'Gemacht', 'Abweichung', 'Status', '']} breiten={[150, 90, 90, 220, 240, 130]}
          zeilen={leute.map((n) => {
            const nw = w.nachweisVon(k, n, b), s = nw || w.nachweisDaten(k, n, b).sum;
            const abw = [s.abgegeben ? s.abgegeben + ' abgegeben' : '', s.vertretung ? s.vertretung + ' Vertretung' : ''].filter(Boolean).join(' · ');
            return [<T art="stark">{n}</T>, s.geplant, s.gemacht, abw || '–', nw ? <Pille art="frei" icon="check" text={'unterschrieben ' + nw.um} /> : <Pille art="warnung" text="offen" />,
              <Knopf text={nw ? 'Ansehen' : 'Öffnen'} klein art="rahmen" testID={'nachweis-' + b + '-' + n} onPress={() => { ui({ nachweis: { k, name: n, b } }); zeige(<NachweisBlatt k={k} name={n} b={b} />, true); }} />];
          })} />
      </View>
    );
  };
  const lohn = (b: Bereich) => {
    const leute = w.personenIm(k, b).filter((n) => w.nachweisVon(k, n, b));
    return (
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 8, flexWrap: 'wrap' }}><T art="abschnitt" style={{ flex: 1 }}>Lohnabrechnung {NAME[b]}</T><T art="beschr">Lohnabrechnung_{k}_{b === 'kueche' ? 'Kueche' : 'Betreuung'}.csv</T></View>
        {leute.length ? <Tabelle kopf={['Person', 'Geplant', 'Gemacht', 'Abgegeben', 'Vertretung', 'Unterschrieben', 'PDF']} breiten={[140, 90, 90, 100, 100, 150, 330]}
          zeilen={leute.map((n) => { const nw = w.nachweisVon(k, n, b)!; return [<T art="stark">{n}</T>, nw.geplant, nw.gemacht, nw.abgegeben, nw.vertretung, nw.um, <T art="klein">{nw.pdf}</T>]; })} /> : <T art="beschr">Noch niemand hat unterschrieben.</T>}
      </View>
    );
  };
  return (
    <View style={{ gap: 16 }}>
      <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <T art="abschnitt" style={{ flex: 1 }}>Monatsabschluss · {monatName(k)}</T>
          <Seg optionen={[[kv, monatName(kv)], [kh, monatName(kh)]]} wert={k} onChange={(x) => ui({ monat: x })} minBreite={150} />
        </View>
        <T art="klein" farbe={f.tinte2}>Jede Person unterschreibt einmal im Monat, Betreuung und Küche getrennt: geplante Dienste laut Originalplan, gemachte Dienste mit Unterschrift im Bericht.</T>
        {teil('betreuung')}
        {teil('kueche')}
      </View>
      <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><T art="titel" style={{ flex: 1 }}>Für die Lohnabrechnung</T><Bald text="Export als Datei ab Version 2" /></View>
        {lohn('betreuung')}
        {lohn('kueche')}
        <T art="beschr">Nur unterschriebene Nachweise kommen in die Tabellen; mit dem Abgleich liegen sie mit den PDFs in Nextcloud unter Personal/Monatsabschluss/{k}.</T>
      </View>
    </View>
  );
}
