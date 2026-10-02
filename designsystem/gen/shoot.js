const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const names = fs.readdirSync('gen/test').filter(f => f.endsWith('.html')).map(f => f.slice(0,-5));
  const only = process.argv.slice(2);
  for (const theme of ['tag','nacht']) {
    for (const n of names) {
      if (only.length && !only.includes(n) && !only.includes(n+':'+theme)) continue;
      const p = await b.newPage({ viewport: { width: 1320, height: 900 } });
      const errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.goto('file://' + process.cwd() + '/gen/test/' + n + '.html');
      await p.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
      await p.waitForTimeout(250);
      await p.screenshot({ path: `gen/shots/${n}-${theme}.png`, fullPage: true });
      if (errs.length) console.log(n, theme, errs);
      await p.close();
    }
  }
  await b.close();
  console.log('done');
})();
