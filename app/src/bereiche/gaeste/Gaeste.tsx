// Gästedatenbank: Liste mit Suche und Filter, Akte mit Dokumenten, Sanktionen und Notizen.
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { kurz, pd } from '../../domain/datum';
import { SPRACHE, SPRACHEN } from '../../domain/haus';
import type { Gast } from '../../domain/typen';
import { naechteText, stufeSym } from '../../domain/welt';
import { dokumentHinterlegen, gastSpeichern } from '../../store/aktionen';
import { schliessen, ui, useU, useWelt, welt, zeige } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Abschnitt, Chip, Chips, Eingabe, Feld, Icon, IconKnopf, Knopf, Leer, Seg, T, Zeile } from '../../ui/basis';
import { Blatt } from '../../ui/overlay';
import { useFarben } from '../../ui/theme';
import { darf, mitAdminPin } from '../anmeldung';
import { nachholenStart } from '../aufnahme/start';
import { BereichKopf, NotizListe } from '../gemeinsam';
import { lausBlatt } from '../plan/handlungen';
import { aufnahmePdf } from '../../pdf/pdf';

const ARTEN = ['Hausordnung auf Papier', 'Läuseschein', 'Bescheinigung', 'Sonstiges'];

function DokumentBlatt({ gid }: { gid: string }) {
  const w = useWelt();
  const g = w.S.G[gid];
  const [art, setArt] = useState(g.unterschrieben ? 'Sonstiges' : ARTEN[0]);
  const [bild, setBild] = useState<{ uri: string; name: string } | null>(null);
  const [text, setText] = useState('');
  const waehlen = async (kamera: boolean) => {
    try {
      if (kamera) { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; }
      const r = kamera ? await ImagePicker.launchCameraAsync({ quality: 0.6 }) : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ['images'] });
      if (!r.canceled && r.assets[0]) setBild({ uri: r.assets[0].uri, name: r.assets[0].fileName || 'Foto_' + w.hIso + '.jpg' });
    } catch { /* Kamera nicht verfügbar (z. B. Simulator) */ }
  };
  return (
    <Blatt titel={'Dokument hinterlegen · ' + w.anzeige(g)} text="Foto oder Bild. Wird in der Gästedatenbank abgelegt (Abgleich mit Nextcloud ab Version 2)."
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Hinterlegen" art="primaer" klein onPress={() => dokumentHinterlegen(gid, art, bild?.name || 'Foto_' + w.hIso + '.jpg', text.trim(), true, bild?.uri)} /></>}>
      <Feld label="Art"><Chips>{ARTEN.map((a) => <Chip key={a} text={a} an={art === a} onPress={() => setArt(a)} />)}</Chips></Feld>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Knopf text="Foto aufnehmen" icon="kamera" art="rahmen" klein onPress={() => waehlen(true)} />
        <Knopf text="Bild auswählen" icon="dokument-plus" art="rahmen" klein onPress={() => waehlen(false)} />
      </View>
      {bild ? <Image source={{ uri: bild.uri }} style={{ height: 180, borderRadius: radius.m }} resizeMode="contain" /> : <T art="beschr">Noch nichts ausgewählt. Ohne Bild wird nur der Vermerk gespeichert.</T>}
      <Feld label="Notiz (freiwillig)"><Eingabe value={text} onChangeText={setText} placeholder="z. B. am 01.10. auf Papier unterschrieben" /></Feld>
    </Blatt>
  );
}

function BearbeitenBlatt({ g }: { g: Gast }) {
  const [vorname, setVorname] = useState(g.vorname);
  const [nachname, setNachname] = useState(g.nachname);
  const [spitz, setSpitz] = useState(g.spitz);
  const [sprache, setSprache] = useState(g.sprache);
  return (
    <Blatt titel={'Stammdaten · ' + g.vorname} text="Änderungen werden mit Datum und Namen in den Notizen vermerkt. Löschen geht nur im Löschlauf (Version 2)." breit
      knoepfe={<><Knopf text="Abbrechen" klein onPress={schliessen} /><Knopf text="Speichern" art="primaer" klein disabled={!(vorname.trim() || spitz.trim())} onPress={() => gastSpeichern(g.id, { vorname: vorname.trim(), nachname: nachname.trim(), spitz: spitz.trim(), sprache })} /></>}>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        <Feld label="Vorname" style={{ flex: 1, minWidth: 180 }}><Eingabe value={vorname} onChangeText={setVorname} /></Feld>
        <Feld label="Nachname" style={{ flex: 1, minWidth: 180 }}><Eingabe value={nachname} onChangeText={setNachname} /></Feld>
        <Feld label="Spitzname" style={{ flex: 1, minWidth: 180 }}><Eingabe value={spitz} onChangeText={setSpitz} /></Feld>
      </View>
      <Feld label="Sprache"><Chips>{SPRACHEN.map((s) => <Chip key={s[0]} text={s[2]} an={sprache === s[0]} klein onPress={() => setSprache(s[0])} />)}</Chips></Feld>
    </Blatt>
  );
}

function DokZeile({ icon, titel, text, rechts, fehlt }: { icon: string; titel: string; text: string; rechts?: React.ReactNode; fehlt?: boolean }) {
  return <Zeile icon={icon} art={fehlt ? 'warnung' : 'normal'} titel={titel} klein={text} rechts={rechts} fett />;
}

function Akte({ g, schmal }: { g: Gast; schmal: boolean }) {
  const w = useWelt();
  const f = useFarben();
  const bett = w.bettVon(g.id), hv = w.hausverbot(g), nik = g.standort === 'nikolaus';
  const heute = w.tag === 0;
  const weitere = g.dokumente.filter((d) => d.art !== 'Hausordnung und Datenschutz');
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 20, padding: 24, backgroundColor: f.flaeche, borderRadius: radius.l }}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <View style={{ minWidth: 64, height: 52, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: bett ? f.flaeche2 : 'transparent', borderWidth: bett ? 0 : 1.5, borderStyle: 'dashed', borderColor: f.linieStark }}><T art="zahl">{bett || '–'}</T></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T art="titel">{w.vollName(g)}{g.spitz ? <T art="titel" farbe={f.tinte2}> „{g.spitz}“</T> : null}</T>
          <T art="klein" farbe={f.tinte2}>{(g.nr ? 'Aufnahme ' + g.nr + ' · ' : '') + (SPRACHE[g.sprache]?.[2] || g.sprache) + ' · ' + naechteText(g.naechte) + ' · erste Aufnahme ' + kurz(pd(g.erste)) + (w.gleicherVorname(g) ? ' · angezeigt als ' + w.anzeige(g) : '')}</T>
        </View>
        {bett ? <Knopf text="Im Plan" icon="bett" klein art="rahmen" onPress={() => ui({ bereich: 'plan', reiter: w.istNiko(bett) ? 'niko' : 'haus', detail: bett, offen: bett })} /> : null}
        <IconKnopf icon="stift" label="Stammdaten bearbeiten" flaeche onPress={() => mitAdminPin('Gast bearbeiten', () => zeige(<BearbeitenBlatt g={welt().S.G[g.id]} />, true))} />
        {schmal ? <IconKnopf icon="schliessen" label="Schließen" flaeche onPress={() => ui({ akte: null })} /> : null}
      </View>
      {hv ? <Zeile icon="karte-rot" art="vorfall" titel={'Hausverbot ' + (hv.bis ? 'bis ' + kurz(pd(hv.bis)) : 'unbefristet')} klein={hv.grund} /> : null}
      <Abschnitt titel="Dokumente">
        {g.unterschrieben ? <DokZeile icon="pdf" titel="Hausordnung" text={g.papier ? 'auf Papier unterschrieben, Foto hinterlegt' : 'unterschrieben ' + (g.unterschriebenAm ? 'am ' + kurz(pd(g.unterschriebenAm)) : 'bei der Aufnahme') + ' · deutsche Fassung' + (g.uebersetzung ? ', Übersetzung ' + SPRACHE[g.uebersetzung][2] : '')} rechts={g.papier ? null : <Knopf text="Ansehen" icon="pdf" klein art="rahmen" onPress={() => aufnahmePdf(w, g)} />} />
          : <DokZeile icon="unterschrift" titel="Hausordnung" fehlt={!nik} text={nik ? 'St. Nikolaus: unterschreibt außerhalb der App. Foto kann hinterlegt werden.' : 'Noch nicht unterschrieben. Kann jederzeit nachgeholt werden.'} rechts={nik || !heute ? null : <Knopf text="Jetzt unterschreiben" icon="stift" klein art="primaer" onPress={() => nachholenStart(g.id)} />} />}
        {g.unterschrieben ? <DokZeile icon="pdf" titel="Datenschutzerklärung" text="auf Deutsch, unterschrieben vom Gast" /> : <DokZeile icon="unterschrift" titel="Datenschutzerklärung" fehlt={!nik} text="wird zusammen mit der Hausordnung unterschrieben" />}
        {nik ? <DokZeile icon="laeuseschein" titel="Läuseschein" text="in St. Nikolaus nicht erfasst" />
          : g.laus === 'liegt' ? <DokZeile icon="laeuseschein" titel="Läuseschein" text={'liegt vor' + (g.lausVon ? ' · geprüft von ' + g.lausVon : '') + ' · gilt die ganze Saison'} />
            : g.laus === 'fehlt' ? <DokZeile icon="laeuseschein-fehlt" titel="Läuseschein" fehlt text={'fehlt seit ' + w.lausTage(g) + ' Tagen'} rechts={heute ? <Knopf text="Prüfen" icon="scannen" klein art="rahmen" onPress={() => lausBlatt(g.id)} /> : null} />
              : <DokZeile icon="laeuseschein" titel="Läuseschein" text="nicht nötig (eine Nacht)" />}
        {weitere.map((d, i) => (
          <View key={i} style={{ gap: 6 }}>
            <DokZeile icon={d.foto ? 'kamera' : 'pdf'} titel={d.art} text={d.datei + ' · ' + kurz(pd(d.datum)) + ' · ' + d.von} />
            {d.uri ? <Image source={{ uri: d.uri }} style={{ height: 120, borderRadius: radius.m }} resizeMode="contain" /> : null}
          </View>
        ))}
        {heute ? <Knopf text="Dokument hinterlegen" icon="dokument-plus" art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => { if (darf()) zeige(<DokumentBlatt gid={g.id} />); }} /> : null}
      </Abschnitt>
      <Abschnitt titel="Sanktionen">
        {g.sanktionen.length ? g.sanktionen.map((x, i) => <Zeile key={i} icon={stufeSym(x.stufe)} titel={x.stufe + ' · ' + kurz(pd(x.datum)) + (x.bis ? ' · bis ' + kurz(pd(x.bis)) : '')} klein={x.grund + ', eingetragen von ' + x.von} />) : <T art="beschr">Keine Einträge.</T>}
      </Abschnitt>
      <Abschnitt titel="Notizen und Erwähnungen"><NotizListe notizen={g.notizen} /></Abschnitt>
    </ScrollView>
  );
}

export function Gaeste() {
  const w = useWelt();
  const f = useFarben();
  const suche = useU((u) => u.gSuche);
  const filter = useU((u) => u.gFilter);
  const akte = useU((u) => u.akte);
  const { width } = useWindowDimensions();
  const schmal = width < 1000;
  const q = suche.trim().toLowerCase();
  const liste = w.gaeste().filter((g) => {
    if (q && ![g.vorname, g.nachname, g.spitz, g.nr, w.bettVon(g.id)].join(' ').toLowerCase().includes(q)) return false;
    if (filter === 'bett') return !!w.bettVon(g.id);
    if (filter === 'offen') return g.standort !== 'nikolaus' && (!g.unterschrieben || g.laus === 'fehlt');
    if (filter === 'verbot') return !!w.hausverbot(g);
    return true;
  }).sort((a, b) => a.vorname.localeCompare(b.vorname) || (w.bettVon(a.id) || 'zz').localeCompare(w.bettVon(b.id) || 'zz'));
  const gew = akte ? w.S.G[akte] : null;
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
      <BereichKopf titel="Gästedatenbank">
        <Seg optionen={[['alle', 'Alle'], ['bett', 'Mit Bett'], ['offen', 'Fehlt etwas'], ['verbot', 'Hausverbot']]} wert={filter} onChange={(k) => ui({ gFilter: k })} minBreite={88} />
      </BereichKopf>
      <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
        {!(schmal && gew) ? (
          <View style={{ width: schmal ? undefined : 400, flex: schmal ? 1 : undefined, gap: 8 }}>
            <Eingabe value={suche} onChangeText={(v) => ui({ gSuche: v })} placeholder="Name, Spitzname oder Bettnummer" accessibilityLabel="Suchen" />
            <T art="beschr">{liste.length + (liste.length === 1 ? ' Person' : ' Personen')} · gleiche Vornamen unterscheidet die Bettnummer</T>
            <ScrollView contentContainerStyle={{ gap: 6, paddingBottom: 16 }}>
              {liste.map((g) => {
                const bett = w.bettVon(g.id), hv = w.hausverbot(g), offen = g.standort !== 'nikolaus' && !g.unterschrieben, an = akte === g.id;
                return (
                  <Pressable key={g.id} accessibilityRole="button" testID={'gast-' + g.id} onPress={() => ui({ akte: g.id })}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, paddingRight: 14, borderRadius: radius.m, backgroundColor: hv ? f.vorfallFlaeche : an ? f.flaeche : f.flaeche2, borderWidth: 3, borderColor: an ? f.tinte : 'transparent' }}>
                    <View style={{ width: 52, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: bett ? f.flaeche : 'transparent', borderWidth: bett ? 0 : 1.5, borderStyle: 'dashed', borderColor: f.linieStark }}><T art="zahl" style={{ fontSize: 16 }}>{bett || '–'}</T></View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <T art="stark" zeilen={1}>{w.vollName(g)}{g.spitz ? <T art="text" farbe={f.tinte2}> „{g.spitz}“</T> : null}</T>
                      <T art="beschr" zeilen={1}>{(hv ? 'Hausverbot · ' : '') + (g.standort === 'nikolaus' ? 'St. Nikolaus · ' : '') + (SPRACHE[g.sprache]?.[2] || '') + ' · ' + naechteText(g.naechte)}</T>
                    </View>
                    {offen ? <Icon name="unterschrift" farbe={f.warnung} /> : null}
                    {g.laus === 'fehlt' ? <Icon name="laeuseschein-fehlt" farbe={f.warnung} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
        {gew ? <Akte g={gew} schmal={schmal} /> : !schmal ? (
          <View style={{ flex: 1, backgroundColor: f.flaeche, borderRadius: radius.l }}>
            <Leer icon="personen" titel="Gast auswählen" text="Hier liegen Hausordnung, Datenschutz, Läuseschein und weitere Dokumente. Fehlendes lässt sich jederzeit nachholen oder als Foto hinterlegen." />
          </View>
        ) : null}
      </View>
    </View>
  );
}
