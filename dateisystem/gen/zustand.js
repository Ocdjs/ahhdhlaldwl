// Liest die Beispieldaten aus dem gebauten Prototyp (prototyp/preview.html) und schreibt gen/zustand.json.
// Aufruf aus dateisystem/: node gen/zustand.js   (vorher in prototyp/: python3 build.py)
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');
const proto = path.join(__dirname, '..', '..', 'prototyp');
const js = fs.readFileSync(path.join(proto, 'app.js'), 'utf8'), html = fs.readFileSync(path.join(proto, 'preview.html'), 'utf8');
if (!html.includes(js)) throw new Error('preview.html ist nicht aktuell: in prototyp/ zuerst python3 build.py');
const ende = js.trimEnd().lastIndexOf('})();');
const offen = js.slice(0, ende) + 'window.__nu={nachweisDaten:nachweisDaten,beispiel:beispiel,status:status,HAUS:HAUS,NIKO:NIKO,GR:GR,GR_NIKO:GR_NIKO,TUEREN:TUEREN,GR_BAD:GR_BAD,ORT:ORT,kennzahlen:kennzahlen,H:H,iso:iso,TEAM:TEAM,SPRACHEN:SPRACHEN,SLOTS:SLOTS,BH:BETTEN_HAUS,BN:BETTEN_NIKO};\n})();\n';
const tmp = path.join(__dirname, '_zustand.html'); fs.writeFileSync(tmp, html.replace(js, () => offen));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + tmp); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(300);
  const out = await p.evaluate(() => { const n = window.__nu, s = n.beispiel(), st = {}; [...n.BH, ...n.BN].forEach(x => st[x.nr] = n.status(x.nr));
    return { S: s, status: st, haus: n.HAUS, niko: n.NIKO, GR: n.GR, GR_NIKO: n.GR_NIKO, TUEREN: n.TUEREN, GR_BAD: n.GR_BAD, ORT: n.ORT, kz: n.kennzahlen(), H: n.iso(n.H), team: n.TEAM, sprachen: n.SPRACHEN, slots: n.SLOTS, bh: n.BH, bn: n.BN,
      nw: Object.fromEntries(n.TEAM.flatMap(pp => ['betreuung', 'kueche'].map(bb => [pp + ',' + bb, n.nachweisDaten('2026-09', pp, bb)]))) }; });
  fs.writeFileSync(path.join(__dirname, 'zustand.json'), JSON.stringify(out, null, 1)); fs.unlinkSync(tmp);
  console.log('gen/zustand.json geschrieben, Diensttag', out.H); await b.close();
})();
