const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [], ok = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|net::/.test(m.text())) errs.push('console: ' + m.text()); });
  const pruef = (name, cond, info) => (cond ? ok : errs).push((cond ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? ' → ' + JSON.stringify(info) : ''));
  await p.goto('file://' + process.cwd() + '/preview.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(500);
  await p.evaluate(() => document.documentElement.setAttribute('data-theme','tag'));
  const S = () => p.evaluate(() => JSON.parse(localStorage.getItem('nu-prototyp-v6') || 'null'));
  const kht = async () => (await p.textContent('.nu-kht-nummer b')).trim();
  const ampel = async () => (await p.textContent('.nu-ampel-licht')).trim();
  const shot = async (n) => { await p.waitForTimeout(350); await p.screenshot({ path: n + '.png' }); };
  async function sign(sel){ await p.locator(sel + ' .nu-unterschrift-feld').scrollIntoViewIfNeeded(); const box = await p.locator(sel + ' .nu-unterschrift-feld').boundingBox(); await p.mouse.move(box.x+40, box.y+100); await p.mouse.down(); for(let i=0;i<20;i++){ await p.mouse.move(box.x+40+i*12, box.y+100 - Math.sin(i/2)*30); } await p.mouse.up(); await p.click(sel + ' [data-pad-act="ok"]'); await p.waitForTimeout(150); }
  await shot('s1-plan');
  pruef('KHT-Nummer Start 25 (E1 Notbett belegt zählt), Ampel 6 frei', await kht() === '25' && await ampel() === '6', [await kht(), await ampel()]);
  pruef('Bad zu, noch 2 Duschen', (await p.getAttribute('.nu-bad', 'data-zustand')) === 'zu' && (await p.getAttribute('[data-tuer="BAD"]', 'class')).includes('is-zu'));
  pruef('Vorwärtspfeil gesperrt', await p.isDisabled('[data-act="tag"][data-arg="1"]'));
  // erwartet -> ist da
  await p.click('.nu-bett[data-nr="D4"]'); await shot('s2-schnell');
  await p.click('#schnell [data-act="istDa"]'); await p.waitForTimeout(300); await p.click('[data-act="schnellZu"]');
  pruef('D4 anwesend', (await p.getAttribute('.nu-bett[data-nr="D4"]','data-s')) === 'anwesend');
  // Lukas fehlte gestern -> heute nicht da -> zählt frei
  await p.click('.nu-bett[data-nr="B3"]'); await p.click('#schnell [data-act="nichtDa"]'); await shot('s3-nichtda'); await p.click('[data-act="fehltEintragen"]'); await p.waitForTimeout(300);
  pruef('B3 fehlt2', (await p.getAttribute('.nu-bett[data-nr="B3"]','data-s')) === 'fehlt2');
  pruef('KHT nach 2. Nacht fehlen 24', await kht() === '24', await kht());
  // Jan 1. Nacht -> bleibt belegt
  await p.click('.nu-bett[data-nr="T1"]'); await p.click('#schnell [data-act="nichtDa"]'); await p.click('[data-act="fehltEintragen"]'); await p.waitForTimeout(300);
  pruef('T1 fehlt, KHT unverändert 24', (await p.getAttribute('.nu-bett[data-nr="T1"]','data-s')) === 'fehlt' && await kht() === '24', await kht());
  await p.click('.nu-kht-nummer'); await shot('s4-kht'); await p.click('.p-blatt-fuss [data-act="modalZu"]');
  // Detail mit Bett frei
  await p.click('.nu-bett[data-nr="D5"]'); await p.waitForTimeout(450); await shot('s5-detail');
  pruef('Detail hat „Bett frei“', (await p.textContent('.nu-detail-aktionen')).includes('Bett frei'));
  await p.click('[data-act="detailZu"]');
  // Aufnahme Max in B2
  await p.click('.nu-bett[data-nr="B2"]'); await p.click('#schnell [data-act="aufnahme"]'); await p.waitForTimeout(300);
  await p.fill('#w-suche', 'Max'); await p.waitForTimeout(200); await shot('s6-suche');
  pruef('Suche zeigt Bettnummern D4 und L5', (await p.textContent('#w-treffer')).includes('D4') && (await p.textContent('#w-treffer')).includes('L5'));
  await p.fill('#w-suche', ''); await p.waitForTimeout(100); await p.type('#w-vor', 'Max');
  pruef('Hinweis gleicher Vorname', (await p.textContent('#w-gleich')).includes('schon 3 Personen'));
  await p.click('[data-act="wWeiter"]'); await p.click('[data-act="dauer"][data-arg="mehr"]'); await shot('s7-dauer');
  await p.click('[data-act="mitEnde"]'); await p.click('[data-act="mitEnde"]');
  await p.click('[data-act="wWeiter"]'); await p.click('[data-act="sprache"][data-arg="ar"]'); await p.click('[data-act="wWeiter"]'); await p.waitForTimeout(300);
  pruef('Hausordnung zweispaltig', await p.$('.nu-dokument-paar') !== null);
  await sign('[data-pad="hg"]'); await sign('[data-pad="hb"]'); await shot('s8-hausordnung');
  await p.click('[data-act="wWeiter"]'); await p.waitForTimeout(300);
  pruef('Datenschutz nur Gast-Unterschrift', (await p.$$('.nu-unterschrift[data-pad]')).length === 1);
  await sign('[data-pad="dg"]'); await p.click('[data-act="wWeiter"]'); await shot('s9-abschluss');
  pruef('Abschluss ohne Enddatum', (await p.textContent('#w-seite')).includes('ohne Enddatum'));
  await p.click('[data-act="wWeiter"]'); await p.waitForTimeout(500);
  pruef('B2 belegt mit Max', (await p.getAttribute('.nu-bett[data-nr="B2"]','aria-label')).includes('Max'));
  // Bericht mit Sanktion für genau eine Person
  await p.click('[data-act="bereich"][data-arg="dienst"]'); await p.click('[data-act="dienstBeginnen"]'); await p.waitForTimeout(200);
  await p.click('#f-hinweise'); await p.waitForTimeout(200);
  await p.keyboard.type('Gelbe Karte @Fel'); await p.waitForTimeout(150); await p.click('#vorschlaege [data-act="erwaehnen"]');
  await p.keyboard.type('und @Ma'); await p.waitForTimeout(150); await shot('s10-vorschlaege');
  await p.click('#vorschlaege [data-act="erwaehnen"] >> text=D4'); await p.keyboard.type(': Streit im Flur nach 23 Uhr.'); await p.waitForTimeout(150);
  await p.click('[data-act="schreibenFertig"]'); await p.waitForTimeout(150); await shot('s11-zuordnung');
  pruef('Zuordnung: Gelbe Karte für Felix', (await p.textContent('.nu-zuordnung-ziel')).includes('Felix'));
  await p.click('[data-act="feldJaNein"][data-arg="kht,ja"]'); await p.click('[data-act="feldJaNein"][data-arg="vorfall,ja"]');
  await p.click('[data-act="fehlt"][data-arg="Decken"]'); await p.fill('#f-fehltText', 'Müllbeutel 120 l'); await p.dispatchEvent('#f-fehltText', 'input');
  const reihe = await p.$$eval('.nu-bericht-zeile .nu-feldname', l => l.map(e => e.textContent.trim()));
  pruef('Feldreihenfolge KHT, Hinweise, Fragen, Abwesenheiten, Externe, Vorfälle, Schlüssel …, Sonstiges', /^Hat KHT angerufen\?.*Wichtige Hinweise.*Fragen von Gästen.*Abwesenheiten.*Externe Gäste.*Vorfälle.*Schlüssel.*Sonstiges/.test(reihe.join(' ')), reihe);
  for (const i of [0,1]) { await p.click('[data-act="besetzungUnterschrift"][data-arg="' + i + '"]'); await p.waitForTimeout(250); await sign('[data-pad="bes' + i + '"]'); await p.waitForTimeout(200); }
  await p.click('[data-act="abschliessen"]'); await p.waitForTimeout(300); await shot('s12-ohne-unterschrift');
  pruef('Warnung „Ohne Unterschrift abschließen?“', (await p.textContent('.nu-dialog')).includes('ohne Unterschrift abschließen'));
  await p.click('[data-act="abschliessenTrotzdem"]'); await p.waitForTimeout(500); await shot('s12-abgeschlossen');
  pruef('Abgeschlossen, markiert „ohne Unterschrift“', (await p.textContent('.nu-gesperrt')).includes('ohne Unterschrift'));
  await p.click('[data-act="besetzungUnterschrift"][data-arg="2"]'); await p.waitForTimeout(250); await sign('[data-pad="bes2"]'); await p.waitForTimeout(250);
  pruef('Unterschrift nachgeholt, Nachtrag vermerkt', (await p.content()).includes('nachgeholt'));
  await p.click('[data-act="berichtPdf"]'); await shot('s12-pdf');
  pruef('PDF trägt Stempel „ohne Unterschrift“', (await p.textContent('.p-pdf')).includes('Ohne Unterschrift abgeschlossen: Jule'));
  await p.click('.p-blatt-fuss [data-act="modalZu"]');
  const st = await S(); const g = Object.values(st.G);
  const dim = g.find(x => x.vorname === 'Felix'), aliD4 = g.find(x => x.vorname === 'Max' && x.spitz === 'Professor');
  pruef('Felix bekommt die Gelbe Karte', dim.sanktionen.length === 2, dim.sanktionen.map(s => s.stufe));
  pruef('Max (D4) keine Sanktion, aber Notiz', aliD4.sanktionen.length === 0 && aliD4.notizen.some(n => /keine Sanktion/.test(n.quelle)), aliD4.notizen.map(n => n.quelle));
  pruef('Bericht: KHT-Anruf ja, Fehlt-Freitext', st.berichte[Object.keys(st.berichte)[0]].f.kht === 'ja' && st.berichte[Object.keys(st.berichte)[0]].f.fehltText === 'Müllbeutel 120 l');
  pruef('Teilen ohne festen Empfänger', (await p.$('[data-act="teilen"]')) !== null && !(await p.content()).includes('An Leitung'));
  // Monatsabschluss: Hinweis beim letzten Dienst (Sam), Vormonat mit Krankheit und Vertretung, Unterschrift sperrt
  await p.click('[data-act="dienstReiter"][data-arg="bericht"]').catch(() => {});
  pruef('Hinweis letzter Dienst für Sam', (await p.content()).includes('Sam: Heute ist dein letzter geplanter Dienst'));
  await p.click('[data-act="dienstReiter"][data-arg="monat"]'); await p.click('[data-act="monatWahl"] >> nth=0'); await shot('s12b-monat');
  await p.click('[data-act="nachweis"][data-arg$=",Robin,betreuung"]'); await shot('s12c-nachweis');
  pruef('Robin: abgegeben an Chris, kein „krank“', (await p.textContent('.p-blatt')).includes('abgegeben an Chris') && !(await p.textContent('.p-blatt')).includes('krank'));
  await p.click('[data-act="planKorrektur"]'); await shot('s12d-korrektur'); await p.click('[data-act="planTag"] >> nth=0'); await p.fill('#pk-grund', 'Plan falsch übernommen'); await p.click('[data-act="planSpeichern"]'); await p.waitForTimeout(200);
  await sign('[data-pad="mon"]'); await p.waitForTimeout(300); await shot('s12e-unterschrieben');
  pruef('Robin unterschrieben und gesperrt', (await p.$('.p-blatt [data-act="planKorrektur"]')) === null && (await p.textContent('.p-blatt')).includes('nicht mehr änderbar'));
  await p.click('.p-blatt-fuss [data-act="modalZu"]'); await p.waitForTimeout(200);
  pruef('Lohntabelle Betreuung hat Robin', (await p.textContent('.nu-bericht >> nth=1')).includes('Robin'));
  pruef('Jule in Betreuung und Küche getrennt', (await p.$('[data-act="nachweis"][data-arg$=",Jule,betreuung"]')) !== null && (await p.$('[data-act="nachweis"][data-arg$=",Jule,kueche"]')) !== null);
  // Duschen erledigt → Erinnerung Bad aufschließen → im Grundriss antippen
  await p.click('[data-act="dienstReiter"][data-arg="dusche"]'); await p.waitForTimeout(150);
  for (const z of ['20:00','20:30']) { await p.click('[data-act="slot"][data-arg="' + z + '"]'); await p.click('[data-act="slotStatus"][data-arg="' + z + ',erledigt"]'); await p.waitForTimeout(150); }
  pruef('Einblendung „Bad aufschließen“', (await p.textContent('#einblendungen, body')).includes('Bad aufschließen'));
  await p.click('[data-act="glocke"]'); await p.waitForTimeout(150);
  pruef('Glocke: Bad aufschließen', (await p.textContent('.nu-glocke-liste')).includes('Bad aufschließen'));
  await p.click('[data-act="erinnerung"][data-arg="bad"]'); await p.waitForTimeout(300); await shot('s12h-bad-erinnern');
  pruef('Bad im Grundriss: Erinnerung', (await p.getAttribute('.nu-bad', 'data-zustand')) === 'erinnern');
  await p.click('.nu-bad'); await p.waitForTimeout(250); await shot('s12i-bad-frei');
  pruef('Bad frei, Tür öffnet animiert', (await p.getAttribute('.nu-bad', 'data-zustand')) === 'frei' && (await p.getAttribute('[data-tuer="BAD"]', 'class')).includes('is-oeffnen'));
  await p.click('.nu-bad'); pruef('Wieder abschließen fragt nach', (await p.textContent('.nu-dialog')).includes('wieder abschließen')); await p.click('.nu-dialog [data-act="modalZu"]');
  await p.click('[data-act="bereich"][data-arg="dienst"]'); await p.waitForTimeout(150);
  // Archiv: Hinweis für die nächsten Dienste mit Anzeigedauer
  await p.click('[data-act="dienstReiter"][data-arg="archiv"]'); await p.waitForTimeout(200);
  pruef('Archiv: geplanter Hinweis ab morgen sichtbar', (await p.textContent('.p-main, main, body')).includes('Abendessen erst um 19:30'));
  await p.click('[data-act="hinweisBlatt"][data-arg="archiv"]'); await p.waitForTimeout(200);
  pruef('Hinweis: Leitung vorausgewählt', (await p.getAttribute('[data-act="vonWahl"][data-arg="Leitung"]', 'aria-pressed')) === 'true');
  await p.fill('#hw-text', 'Bitte Zimmer B lüften.'); await p.click('[data-act="dauerWahl"][data-arg="1"]'); await shot('s12f-hinweis-dauer');
  pruef('Dauer „Nächster Dienst“ = nur 03.10.', (await p.textContent('#hw-zeit')).includes('Nur im Dienst am'));
  await p.click('[data-act="hinweisSpeichern"]'); await p.waitForTimeout(250);
  const hw = (await S()).hinweise[0]; pruef('Hinweis gespeichert mit ab = bis', hw.ab === hw.bis && hw.von === 'Leitung', hw);
  await p.click('[data-act="hinweisEnde"][data-arg="h2"]'); await p.waitForTimeout(250); await shot('s12g-archiv-hinweise');
  pruef('Hinweis vorzeitig beendet', !!(await S()).hinweise.find(h => h.id === 'h2').beendet);
  // Archiv: Fehlt etwas, Frage beantworten, wichtiger Hinweis mit Gastbezug
  pruef('Archiv: Fehlt-etwas-Liste', (await p.textContent('.p-liste')).includes('Müllbeutel 120 l'));
  await p.click('[data-act="fehltErledigt"] >> text=Toilettenpapier'); await p.waitForTimeout(150);
  pruef('Fehlt: Toilettenpapier abgehakt', Object.keys((await S()).fehltErledigt).some(k => k.endsWith('|Toilettenpapier')));
  await p.click('[data-act="kommentarBlatt"][data-arg$=",antwort"] >> nth=0'); await p.waitForTimeout(200);
  pruef('Antwort: Tom vorausgewählt, Leitung als Von', (await p.getAttribute('[data-act="kommGast"] >> nth=0', 'aria-pressed')) === 'true' && (await p.textContent('[data-act="kommGast"] >> nth=0')).includes('Tom') && (await p.getAttribute('[data-act="vonWahl"][data-arg="Leitung"]', 'aria-pressed')) === 'true');
  await p.fill('#ko-text', 'Schuhe in Größe 44 liegen in der Kleiderkammer.'); await shot('s12j-antwort'); await p.click('[data-act="kommentarSpeichern"]'); await p.waitForTimeout(250);
  let st2 = await S(); const tom = Object.values(st2.G).find(g => g.vorname === 'Tom');
  pruef('Antwort: Hinweis für nächsten Dienst und Notiz bei Tom', st2.hinweise[0].bezug && st2.hinweise[0].text.startsWith('Antwort') && tom.notizen.some(n => /Antwort zu Bericht/.test(n.quelle)), st2.hinweise[0]);
  await p.click('[data-act="kommentarBlatt"][data-arg="2026-09-28,hinweis"]'); await p.waitForTimeout(200);
  await p.fill('#ko-text', 'Bei der nächsten Aufnahme nach Schlüssel 7 fragen.'); await p.click('[data-act="kommentarSpeichern"]'); await p.waitForTimeout(250); await shot('s12k-archiv-kommentare');
  st2 = await S(); const mm = Object.values(st2.G).find(g => g.nachname === 'Mustermann');
  pruef('Wichtiger Hinweis: Notiz bei Mustermann für Wiederaufnahme', mm.notizen.some(n => n.aufnahme) && st2.hinweise[0].wichtig === true);
  await p.click('[data-act="dienstReiter"][data-arg="bericht"]'); await p.waitForTimeout(200);
  const seite = await p.textContent('.p-seite');
  pruef('Bettwäschewechsel als wichtiger Hinweis', (await p.textContent('.p-seite .nu-hinweis.is-wichtig >> nth=0')).includes('Bettwäschewechsel'));
  pruef('Bericht heute: beendeter und geplanter Hinweis nicht sichtbar', !seite.includes('Neue Decken') && !seite.includes('Abendessen') && !seite.includes('Zimmer B lüften') && seite.includes('Heizung'));
  // Wiederaufnahme: Hinweis ploppt auf
  await p.click('[data-act="bereich"][data-arg="plan"]'); await p.click('.nu-bett[data-nr="F4"]'); await p.click('#schnell [data-act="aufnahme"]'); await p.waitForTimeout(300);
  await p.fill('#w-suche', 'Mustermann'); await p.waitForTimeout(200); await p.click('#w-treffer [data-act="gastWaehlen"] >> nth=0'); await p.waitForTimeout(300); await shot('s12l-wiederaufnahme');
  pruef('Wiederaufnahme zeigt Hinweis zu Max', (await p.textContent('.nu-dialog')).includes('Schlüssel 7'));
  await p.click('.nu-dialog [data-act="modalZu"]'); await p.click('[data-act="aufnahmeAbbrechen"]'); await p.waitForTimeout(200);
  if (await p.$('.nu-dialog [data-act]')) { const t = await p.$$('.nu-dialog [data-act]'); await t[t.length - 1].click(); await p.waitForTimeout(200); }
  // Kalender Woche
  await p.click('[data-act="bereich"][data-arg="kalender"]'); await shot('s13-kalender');
  pruef('Kalender startet mit 7 Tagen', (await p.$$('.nu-woche-tag')).length === 7);
  // Kalender ändern: PIN, wer ändert (Pflicht), Markierung, Originalplan bleibt
  await p.click('[data-act="kalBearbeiten"]'); for (const k of '1234') await p.click('[data-act="pin2"][data-arg="' + k + '"]'); await p.waitForTimeout(200);
  pruef('Kalender: Ändern freigeschaltet', (await p.$$('.nu-dienstzeile.is-aenderbar')).length > 0);
  const morgen = await p.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  await p.click('[data-act="dienstAendern"][data-arg="' + morgen + ',1"]'); await p.waitForTimeout(200);
  const vorher = await p.getAttribute('[data-act="dpPerson"][aria-pressed="true"]', 'data-arg');
  const neuName = vorher === 'Chris' ? 'Robin' : 'Chris';
  await p.click('[data-act="dpPerson"][data-arg="' + neuName + '"]'); await p.click('[data-act="dienstSpeichern"]'); await p.waitForTimeout(200);
  pruef('Ohne „Wer ändert?“ kein Speichern', (await p.textContent('#dp-von-hinweis')).includes('Bitte zuerst'));
  await p.click('[data-act="dpVon"][data-arg="Leitung"]'); await shot('s13b-dienst-aendern'); await p.click('[data-act="dienstSpeichern"]'); await p.waitForTimeout(250);
  let st3 = await S();
  pruef('Dienst geändert, Originalplan unverändert, vermerkt', st3.dienstplan[morgen][1] === neuName && st3.plan0[morgen].nacht[1] === vorher && st3.planAenderungen.slice(-1)[0].von === 'Leitung', [st3.dienstplan[morgen], st3.plan0[morgen]]);
  await p.click('[data-act="kalBearbeiten"]'); await p.waitForTimeout(200); await shot('s13c-kalender-geaendert');
  pruef('Kalender markiert die Änderung', (await p.$$('.nu-dienstzeile.is-geaendert')).length >= 1);
  await p.click('.nu-dienstzeile.is-geaendert'); pruef('Info: geändert von Leitung', (await p.textContent('.p-blatt')).includes('geändert von Leitung')); await p.click('.p-blatt-fuss [data-act="modalZu"]');
  await p.click('[data-act="kalBearbeiten"]'); for (const k of '1234') await p.click('[data-act="pin2"][data-arg="' + k + '"]'); await p.waitForTimeout(200);
  await p.click('[data-act="terminAendern"] >> nth=0'); await p.fill('#ta-titel', 'Lieferung Decken (verschoben)'); await p.click('[data-act="dpVon"][data-arg="Kim"]'); await p.click('[data-act="terminSpeichern2"][data-arg="speichern"]'); await p.waitForTimeout(200);
  pruef('Termin geändert und vermerkt', (await S()).termine.some(t => t.titel.includes('verschoben') && t.geaendert && t.geaendert.von === 'Kim'));
  await p.click('[data-act="kalBearbeiten"]');
  // Gästedatenbank: Unterschrift nachholen, Papier hinterlegen
  await p.click('[data-act="bereich"][data-arg="gaeste"]'); await p.fill('#g-suche', 'Max'); await p.waitForTimeout(200);
  await p.click('[data-act="akteZeigen"] >> text=L5'); await shot('s14-akte');
  await p.click('.p-akte [data-act="nachholen"]'); await p.waitForTimeout(300); await p.click('[data-act="sprache"][data-arg="fa"]'); await p.click('[data-act="wWeiter"]'); await p.waitForTimeout(200);
  await sign('[data-pad="hg"]'); await sign('[data-pad="hb"]'); await p.click('[data-act="wWeiter"]'); await sign('[data-pad="dg"]'); await p.click('[data-act="wWeiter"]'); await p.click('[data-act="wWeiter"]'); await p.waitForTimeout(400);
  const aliL5 = Object.values((await S()).G).find(x => x.vorname === 'Max' && x.sprache === 'fa');
  pruef('Max (L5) nachträglich unterschrieben', aliL5.unterschrieben === true && aliL5.uebersetzung === 'fa');
  await p.click('[data-act="akteZeigen"] >> text=Mustermann'); await p.click('.p-akte [data-act="dokBlatt"]'); await p.click('[data-act="dokArt"][data-arg="Hausordnung auf Papier"]'); await p.click('[data-act="dokSpeichern"]'); await p.waitForTimeout(300);
  pruef('Mustermann: Papier-Hausordnung hinterlegt', Object.values((await S()).G).find(x => x.nachname === 'Mustermann').unterschrieben === true);
  await shot('s15-akte-haddad');
  // Einstellungen: einzelnes Bett sperren, Notbett
  await p.click('[data-act="bereich"][data-arg="einstellungen"]'); for (const k of '1234') await p.click('[data-act="pinTaste"][data-arg="' + k + '"]');
  // Dienstplan einlesen: Prüfmaske je Tag, ergibt Originalplan
  await p.click('[data-act="einst"][data-arg="dienstplan"]'); await p.waitForTimeout(150); await shot('s15b-dienstplan-start');
  pruef('Oktober schon eingelesen, November offen', (await p.textContent('.p-liste')).includes('Originalplan steht fest') && (await p.$('[data-act="scanStart"]')) !== null);
  await p.click('[data-act="scanStart"] >> nth=0'); await p.waitForTimeout(150);
  let tage = 0;
  for (let n = 0; n < 40; n++) {
    if (await p.$('[data-act="scanSpeichern"]')) break;
    if (n === 4) { await p.click('.nu-scan-pruef >> nth=1 >> [data-act="scanWahl"][data-arg="1,Jule"]'); await shot('s15c-dienstplan-pruefen'); }
    for (const z of await p.$$('.nu-scan-pruef.is-unsicher:not(.is-geprueft)')) { const c = await z.$('[aria-pressed="true"]') || await z.$('[data-act="scanWahl"]'); await c.click(); await p.waitForTimeout(60); }
    if (n === 0) pruef('Erst Unsicheres prüfen sperrt nicht ohne Grund', !(await p.isDisabled('[data-act="scanTagOk"]')));
    await p.click('[data-act="scanTagOk"]'); tage++; await p.waitForTimeout(40);
  }
  await shot('s15d-dienstplan-fertig');
  await p.click('[data-act="scanSpeichern"]'); await p.waitForTimeout(250);
  const st4 = await S(); const nov = Object.keys(st4.planImporte).sort().pop();
  pruef('Originalplan November gespeichert, 1 Korrektur', st4.planImporte[nov] && st4.planImporte[nov].korrigiert >= 1 && st4.plan0[nov + '-05'].nacht[1] === 'Jule', [tage, st4.planImporte[nov]]);
  await p.click('[data-act="einst"][data-arg="betten"]'); await p.click('[data-act="bettAus"][data-arg="D3"]'); await p.click('[data-act="notbett"][data-arg="L3"]'); await shot('s16-betten');
  await p.fill('#name-X', 'Sofa Wohnzimmer'); await p.click('[data-act="extraDazu"][data-arg="pius"]'); await p.waitForTimeout(200);
  await p.fill('#nr-NX', 'Sofa'); await p.fill('#name-NX', 'Sofa im Saal'); await p.click('[data-act="extraDazu"][data-arg="niko"]'); await p.waitForTimeout(200);
  await p.click('[data-act="tauschStart"][data-arg="D"]'); await p.click('[data-act="nummerWahl"][data-arg="D1"]'); await p.click('[data-act="nummerWahl"][data-arg="D6"]'); await shot('s16b-tausch'); await p.click('[data-act="nummernTauschen"]'); await p.waitForTimeout(200); await p.click('[data-act="tauschEnde"]');
  await p.click('[data-act="bereich"][data-arg="plan"]'); await p.waitForTimeout(300);
  pruef('D3 gesperrt', (await p.getAttribute('.nu-bett[data-nr="D3"]','data-s')) === 'aus');
  pruef('Z1 im Plan', (await p.$('.nu-bett[data-nr="Z1"]')) !== null);
  pruef('Ampel: D3 gesperrt, L3 kein Notbett, Z1 und Sofa neu → 8 frei; KHT 25', await ampel() === '8' && await kht() === '25', [await ampel(), await kht()]);
  await shot('s17-plan-nachher');
  // Vergangenheit: niemand „erwartet“
  await p.click('[data-act="tag"][data-arg="-1"]'); await p.waitForTimeout(300);
  pruef('Vortag ohne „erwartet“', (await p.$$('.nu-bett[data-s="erwartet"]')).length === 0);
  await p.click('[data-act="tag"][data-arg="0"]');
  const d1 = await p.$eval('.nu-bett[data-nr="D1"]', e => e.parentNode.style.left), d6 = await p.$eval('.nu-bett[data-nr="D6"]', e => e.parentNode.style.left);
  pruef('D1 steht nach Tausch rechts von D6', parseFloat(d1) > parseFloat(d6), [d1, d6]);
  await p.click('[data-act="reiter"][data-arg="niko"]'); await shot('s18-nikolaus');
  pruef('St. Nikolaus: N9 und Sofa rechts neben dem Saal', (await p.$('.nu-plaetze .nu-bett[data-nr="N9"]')) !== null && (await p.$('.nu-plaetze .nu-bett[data-nr="Sofa"]')) !== null); await p.click('[data-act="reiter"][data-arg="haus"]');
  // Zimmer T und F ganz aus → Türen schließen animiert, Flur gesperrt
  await p.click('[data-act="bereich"][data-arg="einstellungen"]'); await p.click('[data-act="einst"][data-arg="betten"]').catch(() => {}); await p.waitForTimeout(150);
  await p.click('[data-act="zimmerAus"][data-arg="T"]'); await p.click('[data-act="zimmerAus"][data-arg="F"]'); await p.waitForTimeout(150);
  await p.click('[data-act="bereich"][data-arg="plan"]'); await p.waitForTimeout(120); await p.screenshot({ path: 's18b-tuer-halb.png' }); await p.waitForTimeout(800); await shot('s18c-tueren-zu');
  const tc = async id => await p.getAttribute('[data-tuer="' + id + '"]', 'class');
  pruef('Türen T, F, Flur schließen animiert', (await tc('T')).includes('is-schliessen') && (await tc('F')).includes('is-schliessen') && (await tc('FLUR')).includes('is-zu'));
  await p.click('[data-act="bereich"][data-arg="einstellungen"]'); await p.click('[data-act="zimmerAus"][data-arg="T"]'); await p.click('[data-act="zimmerAus"][data-arg="F"]'); await p.click('[data-act="bereich"][data-arg="plan"]'); await p.waitForTimeout(200);
  // Nacht
  await p.evaluate(() => document.documentElement.setAttribute('data-theme','nacht')); await p.waitForTimeout(100);
  await p.screenshot({ path: 's19-nacht.png' });
  // Handy
  const m = await b.newPage({ viewport: { width: 400, height: 860 } }); m.on('pageerror', e => errs.push('mobile: ' + e.message));
  await m.goto('file://' + process.cwd() + '/preview.html'); await m.waitForTimeout(400); await m.screenshot({ path: 's20-handy.png' });
  pruef('Handy ohne Querscrollen', await m.evaluate(() => document.documentElement.scrollWidth) <= 400);
  await m.click('[data-act="bereich"][data-arg="gaeste"]'); await m.waitForTimeout(200); await m.click('[data-act="akteZeigen"] >> nth=0'); await m.waitForTimeout(200); await m.screenshot({ path: 's21-handy-akte.png' });
  pruef('Handy Akte ohne Querscrollen', await m.evaluate(() => document.documentElement.scrollWidth) <= 400);
  console.log(ok.join('\n')); console.log(errs.join('\n') || 'keine Fehler');
  await b.close();
})();
