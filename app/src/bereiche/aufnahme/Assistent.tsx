// Aufnahme-Assistent (Designsystem › Aufnahme): Person · Dauer · Sprache · Hausordnung · Datenschutz · Abschluss.
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { iso, kurz, pd, plus, uhr } from '../../domain/datum';
import { RTL, SPRACHE, SPRACHEN, TEXTE } from '../../domain/haus';
import { aehnlich, naechteText } from '../../domain/welt';
import { aufnahmeAbschliessen } from '../../store/aktionen';
import { schliessen, toast, ui, useU, useWelt, welt, zeige } from '../../store/store';
import { radius } from '../../theme/tokens';
import { Daten, Eingabe, Feld, Icon, IconKnopf, Knopf, Schalter, T, Zeile } from '../../ui/basis';
import { Blatt, Dialog, UnterschriftFeld } from '../../ui/overlay';
import { F, useFarben } from '../../ui/theme';
import { Wahl } from '../gemeinsam';
import { brauchtUnterschrift, gastName, gastWaehlen, SCHRITTE, schrittFertig, schrittListe, wzSetzen } from './start';
import type { Wizard } from '../../store/store';

function Dokument({ art, sp, w, unterschreiben }: { art: 'hausordnung' | 'datenschutz'; sp: string; w: Wizard; unterschreiben?: string }) {
  const f = useFarben();
  const wl = useWelt();
  const t = TEXTE[art][sp];
  const rtl = RTL.has(sp);
  const teile = t ? t[1].split(/(\{GAST\}|\{BETT\}|\{DATUM\}|\{BETREUER\})/) : [];
  const wert: Record<string, string> = { '{GAST}': gastName(w), '{BETT}': w.nr, '{DATUM}': kurz(wl.H) + wl.H.getFullYear(), '{BETREUER}': wl.aktivePerson() };
  const schrift = rtl ? { fontFamily: F.rtl, writingDirection: 'rtl' as const, textAlign: 'right' as const } : null;
  return (
    <View style={{ flex: 1, minWidth: 280, gap: 10, padding: 20, borderRadius: radius.l, backgroundColor: f.papier, borderWidth: 1.5, borderColor: f.papierLinie }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999, backgroundColor: unterschreiben ? f.erwartetFlaeche : f.flaeche2 }}>
        <Icon name={unterschreiben ? 'unterschrift' : 'sprache'} groesse={16} farbe={unterschreiben ? f.blau : f.tinte2} />
        <T art="label" farbe={unterschreiben ? f.blau : f.tinte2}>{unterschreiben || 'Übersetzung ' + SPRACHE[sp][2] + ' · zum Verständnis'}</T>
      </View>
      {t ? (
        <>
          <T art="abschnitt" farbe={f.aufPapier} style={schrift}>{t[0]}</T>
          <T art="text" farbe={f.aufPapier} style={schrift}>{teile.map((x, i) => (wert[x] ? <T key={i} art="stark" farbe={f.aufPapier} style={[{ backgroundColor: f.warnungFlaeche, fontSize: 17 }, schrift]}>{wert[x]}</T> : x))}</T>
        </>
      ) : <T art="text" farbe={f.aufPapier}>Die Übersetzung ins {SPRACHE[sp][2]}e folgt. Bisher gibt es Englisch und Arabisch (siehe ENTSCHEIDUNGEN.md, B1).</T>}
    </View>
  );
}

function SchrittPerson({ w }: { w: Wizard }) {
  const wl = useWelt();
  const f = useFarben();
  const q = w.suche.trim().toLowerCase();
  const treffer = q ? wl.gaeste().filter((g) => (!g.extern && [g.vorname, g.nachname, g.spitz].join(' ').toLowerCase().includes(q)) || aehnlich(q, g.vorname.toLowerCase())) : [];
  treffer.sort((a, b) => (wl.hausverbot(b) ? 1 : 0) - (wl.hausverbot(a) ? 1 : 0));
  const gew = w.g ? wl.S.G[w.g] : null;
  const doppelt = wl.vornameDoppelt(w.neu.vorname);
  return (
    <>
      <T art="titel">Person suchen oder anlegen</T>
      <Feld label="Vorname, Nachname oder Spitzname"><Eingabe testID="w-suche" value={w.suche} onChangeText={(v) => wzSetzen({ suche: v, g: null })} placeholder="z. B. Max" autoCorrect={false} /></Feld>
      <View style={{ gap: 8 }}>
        {treffer.slice(0, 6).map((g) => {
          const hv = wl.hausverbot(g), bett = wl.bettVon(g.id), an = w.g === g.id;
          return (
            <Pressable key={g.id} accessibilityRole="button" testID={'treffer-' + g.id} onPress={() => gastWaehlen(g)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, paddingRight: 16, borderRadius: radius.m, backgroundColor: hv ? f.vorfallFlaeche : f.flaeche2, borderWidth: 3, borderColor: an ? f.tinte : 'transparent' }}>
              <View style={{ width: 56, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: bett ? f.flaeche : 'transparent', borderWidth: bett ? 0 : 1.5, borderColor: f.linieStark, borderStyle: 'dashed' }}>
                {bett ? <T art="zahl" style={{ fontSize: 17 }}>{bett}</T> : hv ? <Icon name="karte-rot" /> : <T art="zahl" farbe={f.tinte3}>–</T>}
              </View>
              <View style={{ flex: 1 }}>
                <T art="stark" style={{ fontSize: 17 }}>{wl.vollName(g)}{g.spitz ? <T art="text" farbe={f.tinte2}> „{g.spitz}“</T> : null}</T>
                <T art="klein" farbe={hv ? f.vorfall : f.tinte2} style={{ fontSize: 14 }}>{hv ? 'Hausverbot ' + (hv.bis ? 'bis ' + kurz(pd(hv.bis)) : 'unbefristet') + ' · ' + hv.grund : (bett ? 'Bett ' + bett + ' · ' + wl.statusWort(bett) : 'kein Bett · ' + naechteText(g.naechte)) + ' · ' + SPRACHE[g.sprache][2]}</T>
              </View>
            </Pressable>
          );
        })}
        {q && !treffer.length ? <T art="beschr">Keine Person gefunden. Unten neu anlegen.</T> : null}
      </View>
      {gew && wl.hausverbot(gew) ? (
        <>
          <Zeile icon="karte-rot" art="vorfall" titel={gew.vorname + ' hat Hausverbot'} klein="Aufnehmen nur mit Bestätigung und Begründung." />
          <Feld label="Begründung"><Eingabe value={w.grund} onChangeText={(v) => wzSetzen({ grund: v })} placeholder="Warum wird trotzdem aufgenommen?" /></Feld>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Schalter an={w.verbotOk} label="Trotzdem aufnehmen" onChange={(v) => wzSetzen({ verbotOk: v })} /><T art="text">Trotzdem aufnehmen</T></View>
        </>
      ) : null}
      {w.g ? <Knopf text="Doch eine neue Person anlegen" icon="person-plus" art="rahmen" style={{ alignSelf: 'flex-start' }} onPress={() => wzSetzen({ g: null })} /> : (
        <>
          <T art="abschnitt" style={{ marginTop: 8 }}>Neue Person</T>
          {doppelt.length ? <Zeile icon="personen" titel={'Es gibt schon ' + (doppelt.length === 1 ? 'eine Person' : doppelt.length + ' Personen') + ' mit dem Vornamen ' + doppelt[0].vorname} fett
            klein={doppelt.map((g) => g.vorname + ' (' + wl.zusatz(g) + ')').join(', ') + '. Ist es dieselbe Person, oben auswählen. Sonst wird die neue Person mit ihrer Bettnummer angezeigt: ' + doppelt[0].vorname + ' (' + w.nr + ').'} /> : null}
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <Feld label="Vorname" style={{ flex: 1, minWidth: 200 }}><Eingabe testID="w-vor" value={w.neu.vorname} autoCapitalize="words" onChangeText={(v) => wzSetzen({ neu: { ...w.neu, vorname: v } })} /></Feld>
            <Feld label="Nachname (freiwillig)" style={{ flex: 1, minWidth: 200 }}><Eingabe value={w.neu.nachname} autoCapitalize="words" onChangeText={(v) => wzSetzen({ neu: { ...w.neu, nachname: v } })} /></Feld>
            <Feld label="Spitzname" style={{ flex: 1, minWidth: 200 }}><Eingabe value={w.neu.spitz} onChangeText={(v) => wzSetzen({ neu: { ...w.neu, spitz: v } })} /></Feld>
          </View>
          <T art="beschr">Vorname empfohlen, mindestens ein Name oder Spitzname. Bekannte Personen werden nie doppelt angelegt. Gleiche Vornamen unterscheidet die Bettnummer.</T>
        </>
      )}
    </>
  );
}

function BettWahlBlatt() {
  const wl = useWelt();
  const w = useU((u) => u.wizard);
  if (!w) return null;
  const frei = wl.bettenHaus.filter((b) => !wl.istAus(b.nr) && (wl.status(b.nr) === 'frei' || wl.status(b.nr) === 'fehlt2'));
  return (
    <Blatt titel="Bett wählen" text="Freie Betten in St. Pius" knoepfe={<Knopf text="Fertig" klein onPress={schliessen} />}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {frei.map((b) => <Knopf key={b.nr} klein art={w.nr === b.nr ? 'primaer' : 'normal'} text={b.nr + (wl.ortText(b.nr) ? ' · ' + wl.ortText(b.nr) : '') + (wl.status(b.nr) === 'fehlt2' ? ' · ' + wl.gastVon(b.nr)!.vorname + ' fehlt' : '')} onPress={() => { wzSetzen({ nr: b.nr }); schliessen(); }} />)}
      </View>
    </Blatt>
  );
}

function SchrittDauer({ w }: { w: Wizard }) {
  const wl = useWelt();
  const f = useFarben();
  return (
    <>
      <T art="titel">Geplante Dauer</T>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        <Wahl titel="1 Nacht" text="Kein Läuseschein nötig" an={w.dauer === '1'} testID="dauer-1" onPress={() => wzSetzen({ dauer: '1' })} />
        <Wahl titel="Mehrere Nächte" text="Ohne festes Enddatum, Bett wird blockiert, Läuseschein-Pflicht beginnt" an={w.dauer === 'mehr'} testID="dauer-mehr" onPress={() => wzSetzen({ dauer: 'mehr' })} />
      </View>
      {w.dauer === 'mehr' ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingHorizontal: 16, borderRadius: radius.m, backgroundColor: f.flaeche2 }}>
            <Icon name="kalender" />
            <View style={{ flex: 1 }}><T art="stark">Enddatum festlegen</T><T art="klein" farbe={f.tinte2}>{w.mitEnde ? 'Das Bett ist bis zum Abreisetag vergeben.' : 'Aus: bleibt bis auf Weiteres, ohne festes Enddatum.'}</T></View>
            <Schalter an={w.mitEnde} label="Enddatum festlegen" onChange={(v) => wzSetzen({ mitEnde: v })} />
          </View>
          {w.mitEnde ? (
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <Feld label="Abreise am (JJJJ-MM-TT)" style={{ width: 260 }}><Eingabe value={w.bis} onChangeText={(v) => wzSetzen({ bis: v })} /></Feld>
              {[3, 7, 14].map((n) => <Knopf key={n} klein text={'+' + n + ' Nächte'} art={w.bis === iso(plus(wl.H, n)) ? 'primaer' : 'normal'} onPress={() => wzSetzen({ bis: iso(plus(wl.H, n)) })} />)}
            </View>
          ) : null}
        </>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <T art="beschr">Bett {w.nr}{wl.ortText(w.nr) ? ' · ' + wl.ortText(w.nr) : ''}{wl.lageVon(w.nr) ? ' · Stockbett ' + wl.lageVon(w.nr) : ''}</T>
        <Knopf text="Anderes Bett" klein art="rahmen" onPress={() => zeige(<BettWahlBlatt />)} />
      </View>
    </>
  );
}

function SchrittSprache({ w }: { w: Wizard }) {
  const f = useFarben();
  return (
    <>
      <T art="titel">Sprache der Übersetzung</T>
      <T art="klein" farbe={f.tinte2}>Unterschrieben wird die deutsche Hausordnung. Die Übersetzung liegt direkt daneben. Die Datenschutzerklärung bleibt auf Deutsch.</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {SPRACHEN.map(([k, eigen, de]) => {
          const an = w.sprache === k;
          return (
            <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: an }} accessibilityLabel={de} testID={'sprache-' + k} onPress={() => wzSetzen({ sprache: k })}
              style={{ flexBasis: 160, flexGrow: 1, minHeight: 76, padding: 10, paddingHorizontal: 14, borderRadius: radius.l, backgroundColor: an ? f.flaeche : f.flaeche2, borderWidth: 3, borderColor: an ? f.tinte : 'transparent', justifyContent: 'center' }}>
              <T art="abschnitt" style={RTL.has(k) ? { fontFamily: F.rtl } : undefined}>{eigen}</T>
              <T art="klein" farbe={f.tinte2}>{de}</T>
            </Pressable>
          );
        })}
      </View>
      <T art="beschr">Übersetzungen gibt es bisher auf Englisch und Arabisch; die übrigen folgen.</T>
    </>
  );
}

function SchrittHausordnung({ w }: { w: Wizard }) {
  const wl = useWelt();
  const sp = w.sprache || 'de';
  return (
    <>
      <T art="titel">Hausordnung</T>
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <Dokument art="hausordnung" sp="de" w={w} unterschreiben="Deutsch · wird unterschrieben" />
        {sp !== 'de' ? <Dokument art="hausordnung" sp={sp} w={w} /> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 300 }}><UnterschriftFeld wer={'Gast: ' + gastName(w)} wofuer="Hausordnung, deutsche Fassung" testID="sig-hg" fertig={w.sig.hg} onFertig={(s) => wzSetzen({ sig: { ...w.sig, hg: s } })} /></View>
        <View style={{ flex: 1, minWidth: 300 }}><UnterschriftFeld wer={'Betreuung: ' + wl.aktivePerson()} wofuer="Hausordnung" testID="sig-hb" fertig={w.sig.hb} onFertig={(s) => wzSetzen({ sig: { ...w.sig, hb: s } })} /></View>
      </View>
    </>
  );
}

function SchrittDatenschutz({ w }: { w: Wizard }) {
  return (
    <>
      <T art="titel">Datenschutzerklärung</T>
      <Dokument art="datenschutz" sp="de" w={w} unterschreiben="Nur auf Deutsch · unterschreibt nur der Gast" />
      {w.sprache && w.sprache !== 'de' ? <Zeile icon="info" titel="Die Datenschutzerklärung gibt es nur auf Deutsch." klein="Bei Bedarf mündlich erklären, zum Beispiel mit der Übersetzungs-App." /> : null}
      <View style={{ maxWidth: 560 }}><UnterschriftFeld wer={'Gast: ' + gastName(w)} wofuer="Datenschutz" testID="sig-dg" fertig={w.sig.dg} onFertig={(s) => wzSetzen({ sig: { ...w.sig, dg: s } })} /></View>
    </>
  );
}

function SchrittAbschluss({ w }: { w: Wizard }) {
  const wl = useWelt();
  const nrNeu = '2026-27-' + String(wl.S.naechsteNr).padStart(4, '0');
  const gl = w.g ? wl.gleicherVorname(wl.S.G[w.g]) : wl.vornameDoppelt(w.neu.vorname).length > 0;
  const ue = w.sprache && w.sprache !== 'de';
  if (w.niko) return (<><T art="titel">Abschluss</T><Daten paare={[['Gast', gastName(w)], ['Bett', w.nr + ' · St. Nikolaus']]} /><Zeile icon="info" titel="St. Nikolaus" klein="Ohne Hausordnung, Läuseschein und Unterschrift. Wird jede Nacht fortgeschrieben." /></>);
  if (w.nachholen) {
    const gn = wl.S.G[w.g!];
    return (<><T art="titel">Abschluss</T><Daten paare={[['Gast', wl.anzeige(gn)], ['Übersetzung', ue ? SPRACHE[w.sprache!][2] : 'keine'], ['Aufnahmenummer', gn.nr || nrNeu]]} />
      <Zeile icon="pdf" titel="PDF wird in der Gästedatenbank abgelegt" klein={'Hausordnung (Deutsch, unterschrieben' + (ue ? ', Übersetzung als Anlage' : '') + ') und Datenschutzerklärung'} /></>);
  }
  const bu = brauchtUnterschrift(w);
  return (
    <>
      <T art="titel">Abschluss</T>
      <Daten paare={([['Gast', gastName(w)], ['Bett', w.nr + (wl.lageVon(w.nr) ? ' · Stockbett ' + wl.lageVon(w.nr) : '')], ['Dauer', w.dauer === '1' ? '1 Nacht' : w.mitEnde ? 'mehrere Nächte, Abreise am ' + kurz(pd(w.bis)) : 'mehrere Nächte, ohne Enddatum']] as [string, string][])
        .concat(gl ? [['Angezeigt als', gastName(w) + ' (' + w.nr + ')']] : [])
        .concat([['Übersetzung', w.sprache ? (w.sprache === 'de' ? 'keine (Deutsch)' : SPRACHE[w.sprache][2]) : w.g ? SPRACHE[wl.S.G[w.g].sprache][2] : '–'], ['Aufnahmenummer', bu ? nrNeu : wl.S.G[w.g!].nr + ' (bereits unterschrieben)']])} />
      {bu ? <Zeile icon="pdf" titel="PDF wird erstellt" klein={nrNeu.slice(-4) + '_' + gastName(w) + '_' + wl.hIso + '.pdf · Hausordnung auf Deutsch mit Unterschrift von Gast und Betreuung' + (ue ? ', Übersetzung als Anlage' : '') + ' · Datenschutz mit Unterschrift Gast'} /> : null}
      {w.dauer !== '1' ? <Zeile icon="laeuseschein-fehlt" art="warnung" titel="Läuseschein-Pflicht beginnt" klein="Erinnerung an Tag 2 und 3" /> : null}
    </>
  );
}

function abschliessen(w: Wizard): void {
  const { gid, nr } = aufnahmeAbschliessen(w);
  const wl = welt(), g = wl.S.G[gid];
  if (w.nachholen) { ui({ wizard: null }); toast('pdf', 'Unterschrift nachgeholt', wl.pdfName(g), 4000); return; }
  ui({ wizard: null, neu: nr, reiter: w.niko ? 'niko' : 'haus' });
  toast('anwesend', wl.anzeige(g) + ' ist aufgenommen', 'Bett ' + nr + (w.niko ? ' · St. Nikolaus' : g.nr ? ' · Aufnahme ' + g.nr : ''), 4000);
}

export function Assistent() {
  const w = useU((u) => u.wizard);
  const wl = useWelt();
  const f = useFarben();
  const { width } = useWindowDimensions();
  if (!w) return null;
  const liste = schrittListe(w), pos = liste.indexOf(w.schritt), fertig = schrittFertig(w, w.schritt);
  const fehlt = !fertig ? ['Bitte eine Person wählen oder einen Namen eintragen.', 'Bitte die Dauer wählen.', 'Bitte eine Sprache wählen.', 'Es fehlen Unterschriften.', 'Es fehlt die Unterschrift des Gasts.'][w.schritt] : 'Zwischenstand gespeichert ' + uhr();
  const weiter = () => { if (!fertig) return; if (w.schritt === 5) { abschliessen(w); return; } wzSetzen({ schritt: liste[pos + 1], richtung: 1 }); };
  const abbrechen = () => zeige(<Dialog titel="Aufnahme verwerfen?" text="Die Eingaben dieser Aufnahme gehen verloren." knoepfe={<><Knopf text="Weiter aufnehmen" klein onPress={schliessen} /><Knopf text="Verwerfen" art="gefahrVoll" klein onPress={() => ui({ wizard: null, modal: null })} /></>} />);
  const seiten = [SchrittPerson, SchrittDauer, SchrittSprache, SchrittHausordnung, SchrittDatenschutz, SchrittAbschluss];
  const Seite = seiten[w.schritt];
  return (
    <View accessibilityLabel="Gast aufnehmen" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, backgroundColor: f.grund }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: f.flaeche }}>
        <Icon name={w.nachholen ? 'unterschrift' : 'person-plus'} />
        <T art="titel" style={{ flex: 1 }} zeilen={1}>{w.nachholen ? 'Hausordnung nachholen · ' + wl.anzeige(wl.S.G[w.g!]) : 'Gast aufnehmen · Bett ' + w.nr}</T>
        <T art="zahlKlein" farbe={f.tinte2}>Schritt {pos + 1} von {liste.length}</T>
        <IconKnopf icon="schliessen" label="Aufnahme abbrechen" flaeche testID="aufnahme-abbrechen" onPress={abbrechen} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingVertical: 12, flexWrap: 'wrap' }}>
        {liste.map((s, k) => {
          const dn = k < pos, akt = s === w.schritt;
          return (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingLeft: 6, paddingRight: 14, borderRadius: 999, backgroundColor: akt ? f.flaeche : 'transparent' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: dn ? f.frei : akt ? f.primaer : f.flaeche3 }}>
                <T art="zahlKlein" farbe={dn ? f.aufFrei : akt ? f.aufPrimaer : f.tinte2}>{dn ? '✓' : String(k + 1)}</T>
              </View>
              {width > 700 || akt ? <T art="label" farbe={akt ? f.tinte : f.tinte2}>{SCHRITTE[s]}</T> : null}
            </View>
          );
        })}
      </View>
      <ScrollView key={w.schritt} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 18, maxWidth: 1100, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        <Seite w={w} />
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: f.flaeche }}>
        <Knopf text="Zurück" icon="zurueck" disabled={pos === 0} onPress={() => wzSetzen({ schritt: liste[pos - 1], richtung: -1 })} />
        <T art="beschr" style={{ flex: 1, textAlign: 'center' }}>{fehlt}</T>
        <Knopf text={w.schritt === 5 ? 'Fertig' : 'Weiter'} icon={w.schritt === 5 ? 'check' : 'weiter'} art="primaer" disabled={!fertig} testID="w-weiter" onPress={weiter} />
      </View>
    </View>
  );
}
