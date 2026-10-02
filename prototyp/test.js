const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [], ok = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|net::/.test(m.text())) errs.push('console: ' + m.text()); });
  const pruef = (name, cond, info) => (cond ? ok : errs).push((cond ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? ' → ' + JSON.stringify(info) : ''));
  await p.goto('file://' + process.cwd() + '/preview.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(500);
  await p.evaluate(() => document.documentElement.setAttribute('data-theme','tag'));
  const S = () => p.evaluate(() => JSON.parse(localStorage.getItem('nu-prototyp-v3') || 'null'));
  const kht = async () => (await p.textContent('.nu-kht-nummer b')).trim();
  const ampel = async () => (await p.textContent('.nu-ampel-licht')).trim();
  const shot = async (n) => { await p.waitForTimeout(350); await p.screenshot({ path: n + '.png' }); };
  async function sign(sel){ await p.locator(sel + ' .nu-unterschrift-feld').scrollIntoViewIfNeeded(); const box = await p.locator(sel + ' .nu-unterschrift-feld').boundingBox(); await p.mouse.move(box.x+40, box.y+100); await p.mouse.down(); for(let i=0;i<20;i++){ await p.mouse.move(box.x+40+i*12, box.y+100 - Math.sin(i/2)*30); } await p.mouse.up(); await p.click(sel + ' [data-pad-act="ok"]'); await p.waitForTimeout(150); }
  await shot('s1-plan');
  pruef('KHT-Nummer Start 25 (E1 Notbett belegt zählt), Ampel 6 frei', await kht() === '25' && await ampel() === '6', [await kht(), await ampel()]);
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
  for (const i of [0,1,2]) { await p.click('[data-act="besetzungUnterschrift"][data-arg="' + i + '"]'); await p.waitForTimeout(250); await sign('[data-pad="bes' + i + '"]'); await p.waitForTimeout(200); }
  await p.click('[data-act="abschliessen"]'); await p.waitForTimeout(500); await shot('s12-abgeschlossen');
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
  await p.click('[data-act="nachweis"][data-arg$=",Robin"]'); await shot('s12c-nachweis');
  pruef('Robin: Krankheit erkannt', (await p.textContent('.p-blatt')).includes('krank · vertreten durch Chris'));
  await p.click('[data-act="planKorrektur"]'); await shot('s12d-korrektur'); await p.click('[data-act="planTag"] >> nth=0'); await p.fill('#pk-grund', 'Plan falsch übernommen'); await p.click('[data-act="planSpeichern"]'); await p.waitForTimeout(200);
  await sign('[data-pad="mon"]'); await p.waitForTimeout(300); await shot('s12e-unterschrieben');
  pruef('Robin unterschrieben und gesperrt', (await p.$('.p-blatt [data-act="planKorrektur"]')) === null && (await p.textContent('.p-blatt')).includes('nicht mehr änderbar'));
  await p.click('.p-blatt-fuss [data-act="modalZu"]'); await p.waitForTimeout(200);
  pruef('Lohntabelle hat Robin', (await p.textContent('.nu-bericht >> nth=1')).includes('Robin'));
  // Kalender Woche
  await p.click('[data-act="bereich"][data-arg="kalender"]'); await shot('s13-kalender');
  pruef('Kalender startet mit 7 Tagen', (await p.$$('.nu-woche-tag')).length === 7);
  await p.click('[data-act="importBlatt"]'); pruef('Import ohne WhatsApp', !(await p.textContent('.p-blatt')).includes('WhatsApp')); await p.click('.p-blatt-fuss [data-act="modalZu"]');
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
