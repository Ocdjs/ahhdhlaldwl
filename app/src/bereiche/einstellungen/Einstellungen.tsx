// Einstellungen (Admin-PIN): Darstellung, Betten und Zimmer, Ampel, Dienstplan einlesen, Team, Codes, Speichern, Beispieldaten.
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { lang, mKey, monatName, pd, tageVon } from '../../domain/datum';
import type { Zimmer } from '../../domain/haus';
import { ROLLEN } from '../../domain/haus';
import type { Bereich, TeamPerson } from '../../domain/typen';
import { ampelSchwelle, bettAus, codesSpeichern, extraDazu, extraUmbenennen, extraWeg, notbett, nummernTauschen, scanSpeichern, tauschZurueck, teamSpeichern, thema, zimmerAus } from '../../store/aktionen';
import { beispielZuruecksetzen, getS, schliessen, toast, ui, useS, useU, useWelt, zeige, type ScanTag } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Bald, Chip, Chips, Eingabe, Feld, Icon, IconKnopf, Knopf, Pille, Schalter, Seg, T } from '../../ui/basis';
import { Blatt, Dialog, PinRaster } from '../../ui/overlay';
import { useFarben } from '../../ui/theme';
import { KhtBlatt } from '../plan/handlungen';

const EINST: [string, string, string][] = [['darstellung', 'mond', 'Darstellung'], ['betten', 'bett', 'Betten und Zimmer'], ['ampel', 'ampel', 'Ampel und KHT'], ['dienstplan', 'scannen', 'Dienstplan einlesen'], ['team', 'personen', 'Team'], ['codes', 'schloss', 'Codes'], ['abgleich', 'abgleich', 'Speichern und Abgleich'], ['daten', 'loeschen', 'Beispieldaten']];

function Einstellung({ icon, titel, text, rechts }: { icon: string; titel: string; text: string; rechts?: React.ReactNode }) {
  const f = useFarben();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.l, backgroundColor: f.flaeche, flexWrap: 'wrap' }}>
      <Icon name={icon} />
      <View style={{ flex: 1, minWidth: 220 }}><T art="stark">{titel}</T><T art="klein" farbe={f.tinte2}>{text}</T></View>
      {rechts}
    </View>
  );
}

// ---------- Betten und Zimmer ----------
function UmbenennenBlatt({ nr }: { nr: string }) {
  const x = getS().extra.find((e) => e.id === nr);
  const [neu, setNeu] = useState(nr);
  const [name, setName] = useState(x?.name || '');
  const [fehler, setFehler] = useState('');
  const f = useFarben();
  return (
    <Blatt titel={'Platz ' + nr + ' umbenennen'} knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Speichern" art="primaer" klein onPress={() => setFehler(extraUmbenennen(nr, neu.trim(), name.trim()))} /></>}>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        <Feld label="Nummer" style={{ width: 140 }}><Eingabe value={neu} onChangeText={setNeu} maxLength={6} autoCapitalize="characters" /></Feld>
        <Feld label="Bezeichnung" style={{ flex: 1, minWidth: 220 }}><Eingabe value={name} onChangeText={setName} /></Feld>
      </View>
      {fehler ? <T art="klein" farbe={f.vorfall}>{fehler}</T> : null}
    </Blatt>
  );
}

function ZimmerKarte({ z }: { z: Zimmer }) {
  const w = useWelt();
  const f = useFarben();
  const tausch = useU((u) => u.tausch);
  const [nr, setNr] = useState('');
  const [name, setName] = useState('');
  const extra = z.id === 'X' || z.id === 'NX', niko = z.id === 'N' || z.id === 'NX';
  const plaetze = w.alleBetten().filter((b) => b.zimmer === z.id).map((b) => b.nr);
  if (!plaetze.length && !extra) return null;
  const nrs = plaetze.map((p) => w.anPlatz(p)), an = !w.S.offRooms[z.id], imTausch = tausch?.zimmer === z.id, verschoben = nrs.some((n) => w.posOf(n) !== n);
  const inBetrieb = nrs.filter((n) => !w.istAus(n)).length, mitNotbett = ['L', 'E', 'TH', 'X', 'NX'].includes(z.id);
  const titel = z.id === 'N' ? 'St. Nikolaus · Saal' : z.id === 'NX' ? 'St. Nikolaus · Weitere Plätze' : z.id === 'X' ? 'St. Pius · Weitere Plätze' : z.name;
  const vorschlag = w.naechsteNummer(z.id === 'NX' ? 'N' : 'Z');
  return (
    <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 4, flexWrap: 'wrap' }}>
        <Icon name={niko ? 'standort-2' : z.id === 'TH' ? 'haus' : 'bett'} />
        <View style={{ flex: 1, minWidth: 200 }}><T art="stark">{titel}</T><T art="klein" farbe={f.tinte2}>{!nrs.length ? 'Noch keine weiteren Plätze' : an ? inBetrieb + ' von ' + nrs.length + ' Betten in Betrieb' : 'Zimmer gesperrt'}</T></View>
        {nrs.length > 1 && !imTausch ? <Knopf text="Nummern tauschen" icon="tauschen" klein art="rahmen" onPress={() => ui({ tausch: { zimmer: z.id, a: null } })} /> : null}
        {nrs.length ? <Schalter an={an} label={titel + ' in Betrieb'} onChange={() => zimmerAus(z.id)} /> : null}
      </View>
      {imTausch ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.m, backgroundColor: f.erwartetFlaeche, flexWrap: 'wrap' }}>
          <Icon name="tauschen" farbe={f.blau} />
          <View style={{ flex: 1, minWidth: 200 }}><T art="stark" farbe={f.blau}>{tausch?.a ? 'Jetzt das zweite Bett antippen.' : 'Zwei Betten antippen, deren Nummern den Platz tauschen.'}</T><T art="klein" farbe={f.blau}>Belegung, Sperre und Notbett bleiben bei der Nummer.</T></View>
          {verschoben ? <Knopf text="Ursprünglich" klein onPress={() => tauschZurueck(z.id)} /> : null}
          <Knopf text="Fertig" art="primaer" klein onPress={() => ui({ tausch: null })} />
        </View>
      ) : null}
      {nrs.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {nrs.map((n) => {
            const aus = w.istAus(n), g = w.gastVon(n), belegt = !!g && !w.zaehlt(n), wo = w.lageVon(n) ? 'Stockbett ' + w.lageVon(n) : '';
            if (imTausch) {
              const gew = tausch?.a === n;
              return (
                <Pressable key={n} accessibilityRole="button" onPress={() => {
                  if (!tausch?.a || gew) { ui({ tausch: { zimmer: z.id, a: gew ? null : n } }); return; }
                  const a = tausch.a;
                  zeige(<Dialog titel={a + ' und ' + n + ' tauschen?'} text="Im Plan wechseln die beiden Nummern den Platz. Belegung, Sperre und Notbett bleiben bei der Nummer." knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Tauschen" icon="tauschen" art="primaer" klein onPress={() => nummernTauschen(a, n)} /></>} />);
                }} style={{ width: 200, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.m, backgroundColor: gew ? f.flaeche : f.flaeche2, borderWidth: 3, borderColor: gew ? f.tinte : 'transparent' }}>
                  <View style={{ flex: 1 }}><T art="zahl">{n}</T><T art="beschr">{w.posOf(n) !== n ? 'Platz von ' + w.posOf(n) : wo || 'Einzelbett'}</T></View>
                  <Icon name="tauschen" farbe={f.tinte2} />
                </Pressable>
              );
            }
            const info = w.S.offRooms[z.id] ? 'Zimmer gesperrt' : w.S.offBeds[n] ? 'gesperrt' : belegt ? 'belegt · ' + g!.vorname : extra && w.ort[n] ? w.ort[n] : wo || 'in Betrieb';
            return (
              <View key={n} style={{ width: extra ? 260 : 200, gap: 8, padding: 12, borderRadius: radius.m, backgroundColor: aus ? f.ausFlaeche : f.flaeche2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1 }}><T art="zahl">{n}</T><T art="beschr" zeilen={1}>{info}</T></View>
                  <Schalter an={!w.S.offBeds[n]} disabled={!!w.S.offRooms[z.id]} label={'Bett ' + n + ' in Betrieb'} onChange={() => bettAus(n)} />
                </View>
                {mitNotbett ? <Chip text="Notbett" klein an={!!w.S.notbett[n]} onPress={() => notbett(n)} /> : null}
                {extra ? (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Knopf text="Umbenennen" icon="stift" klein art="rahmen" style={{ flex: 1 }} onPress={() => zeige(<UmbenennenBlatt nr={n} />)} />
                    {!belegt ? <IconKnopf icon="loeschen" label={'Platz ' + n + ' entfernen'} flaeche onPress={() => extraWeg(n)} /> : null}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
      {extra ? (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Feld label="Nummer" style={{ width: 120 }}><Eingabe value={nr} placeholder={vorschlag} onChangeText={setNr} maxLength={6} autoCapitalize="characters" /></Feld>
          <Feld label="Bezeichnung" style={{ flex: 1, minWidth: 200 }}><Eingabe value={name} onChangeText={setName} placeholder={'z. B. ' + (z.id === 'NX' ? 'Matratze Flur' : 'Sofa Wohnzimmer')} /></Feld>
          <Knopf text="Platz hinzufügen" icon="bett-plus" art="rahmen" onPress={() => { const fe = extraDazu(z.id === 'NX' ? 'niko' : 'pius', (nr || vorschlag).trim(), name.trim()); if (fe) toast('warnung', 'Platz nicht angelegt', fe, 4000); else { setNr(''); setName(''); } }} />
        </View>
      ) : null}
    </View>
  );
}

// ---------- Dienstplan einlesen ----------
function scanTage(k: string): ScanTag[] {
  const S = getS();
  return tageVon(k).map((datum) => {
    const v = [(S.dienstplan[datum] || [])[0] || '', (S.dienstplan[datum] || [])[1] || '', S.kueche[datum] || ''];
    return { datum, foto: v.slice(), erkannt: v.slice(), wahl: v.slice(), unsicher: v.map((x) => !x), geprueft: v.map((x) => !!x) };
  });
}

function Scan() {
  const w = useWelt();
  const f = useFarben();
  const sc = useU((u) => u.scan);
  const [von, setVon] = useState(getS().leitungName);
  const { width } = useWindowDimensions();
  const monate = [mKey(w.H), mKey(new Date(w.H.getFullYear(), w.H.getMonth() + 1, 1))];
  const setze = (teil: Partial<NonNullable<typeof sc>>) => ui({ scan: { ...sc!, ...teil } });
  const starten = async (k: string, kamera: boolean) => {
    let foto: string | undefined;
    try {
      if (kamera) { const p = await ImagePicker.requestCameraPermissionsAsync(); if (p.granted) { const r = await ImagePicker.launchCameraAsync({ quality: 0.7 }); if (!r.canceled) foto = r.assets[0]?.uri; } }
      else { const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] }); if (!r.canceled) foto = r.assets[0]?.uri; }
    } catch { /* ohne Kamera (Simulator): ohne Foto weiter */ }
    ui({ scan: { monat: k, quelle: foto ? 'Foto' : 'ohne Foto', tage: scanTage(k), i: 0, foto } });
  };
  if (!sc) {
    return (
      <View style={{ gap: 10 }}>
        <T art="klein" farbe={f.tinte2}>Einmal zu Monatsbeginn durch die Leitung. Das Foto des Dienstplans liegt als Vorlage daneben; jeder Tag wird einzeln geprüft und bestätigt. Vorgeschlagen wird der vorläufige Plan aus dem Kalender. Daraus entstehen die geplanten Dienste (Originalplan) für den Monatsabschluss. Spätere Änderungen nur im Kalender (PIN, mit Namen vermerkt).</T>
        {monate.map((k) => {
          const imp = w.S.planImporte[k];
          return <Einstellung key={k} icon={imp ? 'check' : 'scannen'} titel={monatName(k)} text={imp ? 'Eingelesen am ' + imp.um + ' von ' + imp.von + ' · ' + imp.dienste + ' Dienste, ' + imp.korrigiert + ' korrigiert. Originalplan steht fest.' : 'Noch nicht eingelesen. Im Kalender steht ein vorläufiger Plan.'}
            rechts={imp ? <Pille icon="schloss" text="fest" /> : <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}><Knopf text="Foto" icon="kamera" art="primaer" klein testID={'scan-' + k} onPress={() => starten(k, true)} /><Knopf text="Bild wählen" icon="dokument-plus" art="rahmen" klein onPress={() => starten(k, false)} /></View>} />;
        })}
      </View>
    );
  }
  if (sc.fertig) {
    const korr = sc.tage.reduce((n, t) => n + t.wahl.filter((x, j) => x !== t.erkannt[j]).length, 0);
    return (
      <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 20, gap: 14 }}>
        <T art="titel">{monatName(sc.monat)} geprüft</T>
        <View style={{ flexDirection: 'row', gap: 28 }}>{([['Tage', sc.tage.length], ['Dienste', sc.tage.length * 3], ['Korrigiert', korr]] as [string, number][]).map(([t, z]) => <View key={t}><T art="label">{t}</T><T art="zahlGross">{z}</T></View>)}</View>
        <Feld label="Eingelesen von"><Chips>{[w.S.leitungName].concat(w.team()).map((n) => <Chip key={n} text={n} an={von === n} onPress={() => setVon(n)} />)}</Chips></Feld>
        <Einstellung icon="info" titel="Danach steht der Originalplan fest" text="Er ist die Grundlage für „geplant“ im Monatsabschluss. Änderungen im Kalender werden markiert, der Originalplan bleibt." />
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
          <Knopf text="Zurück" klein art="rahmen" onPress={() => setze({ fertig: false })} />
          <Knopf text="Als Originalplan speichern" icon="check" art="primaer" testID="scan-speichern" onPress={() => { const k = scanSpeichern(sc, von); ui({ scan: null }); toast('check', 'Originalplan gespeichert', monatName(sc.monat) + ' · ' + k + ' korrigiert', 4000); }} />
        </View>
      </View>
    );
  }
  const t = sc.tage[sc.i], alleOk = t.geprueft.every(Boolean), team = w.team();
  const tagSetzen = (neu: ScanTag) => setze({ tage: sc.tage.map((x, j) => (j === sc.i ? neu : x)) });
  const breit = width > 1100;
  return (
    <View style={{ backgroundColor: f.flaeche, borderRadius: radius.l, padding: 20, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <T art="titel" style={{ flex: 1, fontSize: 20 }}>{monatName(sc.monat)} prüfen</T>
        <T art="beschr">Tag {sc.i + 1} von {sc.tage.length}</T>
        <Knopf text="Abbrechen" klein onPress={() => zeige(<Dialog titel="Prüfung abbrechen?" text="Die bisher geprüften Tage werden verworfen." knoepfe={<><Knopf text="Weiter prüfen" klein onPress={schliessen} /><Knopf text="Abbrechen" art="gefahrVoll" klein onPress={() => ui({ scan: null, modal: null })} /></>} />)} />
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: f.flaeche3 }}><View style={{ width: `${Math.round((sc.i / sc.tage.length) * 100)}%`, height: 6, borderRadius: 3, backgroundColor: f.primaer }} /></View>
      <View style={{ flexDirection: breit ? 'row' : 'column', gap: 16 }}>
        <View style={{ flex: breit ? 1 : undefined, minHeight: 300, borderRadius: radius.m, backgroundColor: f.papier, borderWidth: 1.5, borderColor: f.papierLinie, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {sc.foto ? <Image source={{ uri: sc.foto }} style={{ width: '100%', height: 420 }} resizeMode="contain" accessibilityLabel="Foto des Dienstplans" /> : <View style={{ alignItems: 'center', gap: 8, padding: 24 }}><Icon name="kamera" farbe={f.aufPapier2} /><T art="klein" farbe={f.aufPapier2} style={{ textAlign: 'center' }}>Kein Foto. Mit dem ausgedruckten Dienstplan vergleichen.</T></View>}
        </View>
        <View style={{ flex: 1, gap: 12 }}>
          <T art="titel" style={{ fontSize: 22 }}>{lang(pd(t.datum))}</T>
          <T art="beschr">Mit dem Foto vergleichen. Stimmt etwas nicht, den richtigen Namen antippen.</T>
          {ROLLEN.map((rolle, j) => {
            const unsicher = t.unsicher[j] && !t.geprueft[j];
            const kand = j === 2 ? w.team('kueche') : w.team('betreuung');
            return (
              <View key={rolle} style={{ gap: 6, padding: 12, borderRadius: radius.m, backgroundColor: unsicher ? f.warnungFlaeche : f.flaeche2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T art="stark" style={{ flex: 1 }}>{rolle}</T>
                  {t.unsicher[j] ? (unsicher ? <Pille art="warnung" icon="warnung" text="im Plan leer · bitte wählen" /> : <Pille icon="check" text="geprüft" />) : <T art="beschr">aus dem vorläufigen Plan</T>}
                </View>
                <Chips>{(kand.length ? kand : team).concat(['']).map((n) => <Chip key={n || 'offen'} klein text={n || 'offen'} an={t.wahl[j] === n && t.geprueft[j]} onPress={() => { const wahl = t.wahl.slice(), g = t.geprueft.slice(); wahl[j] = n; g[j] = true; tagSetzen({ ...t, wahl, geprueft: g }); }} />)}</Chips>
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Knopf text="Zurück" icon="zurueck" klein art="rahmen" disabled={sc.i === 0} onPress={() => setze({ i: sc.i - 1 })} />
            <Knopf text={alleOk ? 'Tag stimmt, weiter' : 'Erst Leeres prüfen'} icon="check" art="primaer" disabled={!alleOk} testID="scan-tag-ok" onPress={() => (sc.i < sc.tage.length - 1 ? setze({ i: sc.i + 1 }) : setze({ fertig: true }))} />
          </View>
        </View>
      </View>
      <T art="beschr">Ohne Texterkennung: Handschrift wird nicht automatisch gelesen (siehe ENTSCHEIDUNGEN.md, A7).</T>
    </View>
  );
}

// ---------- Team und Codes ----------
function TeamAnsicht() {
  const S = useS();
  const f = useFarben();
  const [team, setTeam] = useState<TeamPerson[]>(() => S.team.map((p) => ({ ...p, bereiche: p.bereiche.slice() })));
  const [leitung, setLeitung] = useState(S.leitungName);
  const [neu, setNeu] = useState('');
  const setze = (i: number, teil: Partial<TeamPerson>) => setTeam(team.map((p, j) => (j === i ? { ...p, ...teil } : p)));
  const bereich = (i: number, b: Bereich) => { const p = team[i], an = p.bereiche.includes(b); setze(i, { bereiche: an ? p.bereiche.filter((x) => x !== b) : p.bereiche.concat([b]) }); };
  return (
    <View style={{ gap: 10 }}>
      <T art="klein" farbe={f.tinte2}>Wer im Dienstplan, in der Besetzung und im Monatsabschluss auswählbar ist. Inaktive Personen bleiben in alten Berichten erhalten.</T>
      <Einstellung icon="schloss" titel="Leitung" text="So erscheint die Leitung in der App (z. B. „Schwester Martha“ oder „Leitung“)." rechts={<Eingabe value={leitung} onChangeText={setLeitung} style={{ width: 240 }} />} />
      {team.map((p, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.l, backgroundColor: f.flaeche, flexWrap: 'wrap', opacity: p.aktiv ? 1 : 0.6 }}>
          <Eingabe value={p.name} onChangeText={(v) => setze(i, { name: v })} style={{ width: 170 }} accessibilityLabel="Name" />
          <Chip text="Betreuung" klein an={p.bereiche.includes('betreuung')} onPress={() => bereich(i, 'betreuung')} />
          <Chip text="Küche" klein an={p.bereiche.includes('kueche')} onPress={() => bereich(i, 'kueche')} />
          <Eingabe value={p.personalnummer} onChangeText={(v) => setze(i, { personalnummer: v })} placeholder="Personalnr." style={{ width: 140 }} accessibilityLabel="Personalnummer" />
          <View style={{ flex: 1 }} />
          <T art="label">aktiv</T><Schalter an={p.aktiv} label={'Aktiv: ' + p.name} onChange={(v) => setze(i, { aktiv: v })} />
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Eingabe value={neu} onChangeText={setNeu} placeholder="Neue Person" style={{ width: 240 }} />
        <Knopf text="Hinzufügen" icon="person-plus" art="rahmen" klein disabled={!neu.trim()} onPress={() => { setTeam(team.concat([{ name: neu.trim(), bereiche: ['betreuung'], personalnummer: '', aktiv: true }])); setNeu(''); }} />
      </View>
      <Knopf text="Team speichern" icon="check" art="primaer" style={{ alignSelf: 'flex-end' }} onPress={() => teamSpeichern(team.filter((p) => p.name.trim()).map((p) => ({ ...p, name: p.name.trim() })), leitung.trim() || 'Leitung')} />
    </View>
  );
}

function CodesAnsicht() {
  const S = useS();
  const f = useFarben();
  const [admin, setAdmin] = useState(S.codes.admin);
  const [leitung, setLeitung] = useState(S.codes.leitung);
  const ok = /^\d{4}$/.test(admin) && /^\d{4}$/.test(leitung) && admin !== leitung;
  return (
    <View style={{ gap: 10 }}>
      <T art="klein" farbe={f.tinte2}>Beide Codes gelten nur auf diesem Gerät und werden nie mit Nextcloud abgeglichen.</T>
      <Einstellung icon="regler" titel="Admin-PIN" text="Für Einstellungen, Kalender ändern und Gast bearbeiten." rechts={<Eingabe value={admin} onChangeText={setAdmin} keyboardType="number-pad" maxLength={4} secureTextEntry style={{ width: 140 }} />} />
      <Einstellung icon="schloss" titel="Code der Leitung" text="Damit meldet sich die Leitung an, ohne Dienst zu haben." rechts={<Eingabe value={leitung} onChangeText={setLeitung} keyboardType="number-pad" maxLength={4} secureTextEntry style={{ width: 140 }} />} />
      {!ok ? <T art="beschr" farbe={f.warnung}>Je vier Ziffern, beide verschieden.</T> : null}
      <Knopf text="Codes speichern" icon="check" art="primaer" disabled={!ok} style={{ alignSelf: 'flex-end' }} onPress={() => codesSpeichern(admin, leitung)} />
      <Einstellung icon="uhr" titel="App-Sperre" text="Nach einigen Minuten ohne Eingabe sperren (siehe ENTSCHEIDUNGEN.md, B3)." rechts={<Bald />} />
    </View>
  );
}

export function Einstellungen() {
  const w = useWelt();
  const S = useS();
  const f = useFarben();
  const pinOk = useU((u) => u.pinOk);
  const einst = useU((u) => u.einst);
  const { width } = useWindowDimensions();
  useEffect(() => () => ui({ pinOk: false, tausch: null }), []);
  if (!pinOk) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Icon name="schloss" />
        <PinRaster titel="Admin-PIN eingeben" hinweis="In der Beispielversion lautet die PIN 1234." onCode={(c) => { if (c !== getS().codes.admin) return false; ui({ pinOk: true }); return true; }} />
      </View>
    );
  }
  const schmal = width < 1000;
  let inhalt: React.ReactNode = null;
  if (einst === 'darstellung') inhalt = (
    <>
      <Einstellung icon="mond" titel="Tag- und Nachtmodus" text="Automatisch: Nacht von 20:00 bis 07:00" rechts={<Seg optionen={[['auto', 'Auto'], ['tag', 'Tag'], ['nacht', 'Nacht']]} wert={S.theme} onChange={thema} minBreite={72} />} />
      <Einstellung icon="tastatur" titel="Kioskmodus" text="Android: Bildschirmfixierung · iPad: Geführter Zugriff. Beides in den Systemeinstellungen des Tablets." rechts={<Bald text="Anleitung in der README" />} />
    </>
  );
  if (einst === 'betten') inhalt = (
    <>
      <T art="klein" farbe={f.tinte2}>Zimmer oder einzelne Betten sperren, Nummern innerhalb eines Zimmers tauschen, weitere Plätze anlegen. Notbetten zählen nur, wenn sie belegt sind.</T>
      {w.haus.concat(w.niko).map((z) => <ZimmerKarte key={z.id} z={z} />)}
    </>
  );
  if (einst === 'ampel') inhalt = (
    <>
      <Einstellung icon="telefon" titel="KHT-Nummer" text="Belegte Betten beider Standorte. Notbetten nur, wenn belegt." rechts={<Knopf text="Ansehen" klein art="rahmen" onPress={() => zeige(<KhtBlatt />)} />} />
      <Einstellung icon="bett" titel="Notbetten" text={(w.alleBetten().filter((b) => S.notbett[b.nr]).map((b) => b.nr).join(', ') || 'keine') + ' · nur über den Kältebus belegt'} />
      <Einstellung icon="ampel" titel="Ampel grün ab" text="freie Betten, gelb darunter, rot bei 0" rechts={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><IconKnopf icon="minus" label="Weniger" flaeche onPress={() => ampelSchwelle(-1)} /><T art="zahlGross" style={{ minWidth: 32, textAlign: 'center' }}>{S.ampel.gruen}</T><IconKnopf icon="plus" label="Mehr" flaeche onPress={() => ampelSchwelle(1)} /></View>} />
      <Einstellung icon="wolke-ok" titel="Meldung an die Ampel" text="Freie Betten, nie Namen (siehe ENTSCHEIDUNGEN.md, B4)" rechts={<Bald />} />
    </>
  );
  if (einst === 'dienstplan') inhalt = <Scan />;
  if (einst === 'team') inhalt = <TeamAnsicht />;
  if (einst === 'codes') inhalt = <CodesAnsicht />;
  if (einst === 'abgleich') inhalt = (
    <>
      <Einstellung icon="check" titel="Auf dem Gerät gespeichert" text={'Jede Änderung wird sofort gespeichert. Zuletzt: ' + S.sync.zuletzt} />
      <Einstellung icon="abgleich" titel="Abgleich mit Nextcloud" text="17:00–09:00 stündlich, nach „Bericht abschließen“ sofort. Ordner und Dateien siehe dateisystem/README.md." rechts={<Bald text="ab Version 2" />} />
    </>
  );
  if (einst === 'daten') inhalt = (
    <>
      <Einstellung icon="loeschen" titel="Beispieldaten zurücksetzen" text="Alle Änderungen auf diesem Gerät verwerfen und die Beispieldaten neu laden." rechts={<Knopf text="Zurücksetzen" art="gefahr" klein onPress={() => zeige(<Dialog titel="Beispieldaten zurücksetzen?" text="Alle Änderungen auf diesem Gerät gehen verloren." knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Zurücksetzen" art="gefahrVoll" klein onPress={() => { beispielZuruecksetzen(); ui({ modal: null, bereich: 'plan', pinOk: false }); toast('check', 'Beispieldaten geladen', '', 3000); }} /></>} />)} />} />
      <T art="beschr">Version 1 arbeitet nur mit Daten auf diesem Gerät. Es gibt noch keine Verbindung zu Nextcloud.</T>
    </>
  );
  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <T art="titelGross" style={{ flex: 1 }}>Einstellungen</T>
        <Knopf text="Sperren" icon="schloss" klein art="rahmen" onPress={() => ui({ pinOk: false })} />
      </View>
      <View style={{ flex: 1, flexDirection: schmal ? 'column' : 'row', gap: 16 }}>
        <ScrollView horizontal={schmal} style={{ flexGrow: 0, width: schmal ? undefined : 260 }} contentContainerStyle={{ gap: 4 }}>
          {EINST.map(([k, sym, t]) => (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: einst === k }} testID={'einst-' + k} onPress={() => ui({ einst: k })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14, borderRadius: radius.m, backgroundColor: einst === k ? f.flaeche : 'transparent' }}>
              <Icon name={sym} farbe={einst === k ? f.tinte : f.tinte2} /><T art="stark" farbe={einst === k ? f.tinte : f.tinte2}>{t}</T>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">{inhalt}</ScrollView>
      </View>
    </View>
  );
}
