// Übernimmt Farben, Maße und Symbole aus dem Designsystem: node scripts/aus-designsystem.js
const fs = require('fs'), path = require('path');
const ds = path.join(__dirname, '..', '..', 'designsystem');
const css = fs.readFileSync(path.join(ds, 'gen', 'tokens.css'), 'utf8');
function block(sel) { const i = css.indexOf(sel); const j = css.indexOf('}', i); return css.slice(i, j); }
function vars(txt) { const o = {}; for (const m of txt.matchAll(/--([a-z0-9-]+):([^;]+);/g)) o[m[1]] = m[2].trim(); return o; }
const tag = vars(block(':root{')), nacht = vars(block('[data-theme="nacht"]{'));
const farbNamen = Object.keys(nacht).filter(k => !k.startsWith('schatten'));
const camel = s => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const farben = t => '{\n' + farbNamen.map(k => `    ${camel(k)}: '${t[k]}',`).join('\n') + '\n  }';
const px = k => parseInt(tag[k], 10);
let out = '// Erzeugt von scripts/aus-designsystem.js aus designsystem/gen/tokens.css. Nicht von Hand ändern.\n';
out += `export const farbenTag = ${farben(tag)};\n\nexport type Farben = typeof farbenTag;\n\nexport const farbenNacht: Farben = ${farben(nacht)};\n\n`;
out += `export const abstand = { ${[1,2,3,4,5,6,7,8].map(n => `a${n}: ${px('abstand-' + n)}`).join(', ')} };\n`;
out += `export const radius = { s: ${px('radius-s')}, m: ${px('radius-m')}, l: ${px('radius-l')}, rund: 999 };\n`;
out += `export const groesse = { zielMin: ${px('ziel-min')}, zielGross: ${px('ziel-gross')}, bettBreite: ${px('bett-breite')}, bettHoehe: ${px('bett-hoehe')}, leisteBreite: ${px('leiste-breite')}, kopfHoehe: ${px('kopf-hoehe')}, detailBreite: ${px('detail-breite')}, symbol: ${px('symbol')}, symbolKlein: ${px('symbol-klein')}, unterschriftHoehe: ${px('unterschrift-hoehe')} };\n`;
out += `export const dauer = { sofort: ${px('dauer-sofort')}, kurz: ${px('dauer-kurz')}, mittel: ${px('dauer-mittel')}, lang: ${px('dauer-lang')}, einblendung: ${px('dauer-einblendung')} };\n`;
fs.writeFileSync(path.join(__dirname, '..', 'src', 'theme', 'tokens.ts'), out);
const ic = fs.readFileSync(path.join(ds, 'gen', 'icons.js'), 'utf8');
const I = JSON.parse(ic.slice(ic.indexOf('{'), ic.indexOf('}', ic.indexOf('{')) + 1));
const card = fs.readFileSync(path.join(ds, 'project', 'assets', 'Symbole', 'karte-gelb.svg'), 'utf8').match(/d="([^"]+)"/)[1];
let ico = '// Erzeugt von scripts/aus-designsystem.js aus den Symbolen des Designsystems. Nicht von Hand ändern.\n';
ico += 'export const PFADE = ' + JSON.stringify(I, null, 1) + ' as const;\n\nexport const KARTE = ' + JSON.stringify(card) + ';\n\nexport type SymbolName = keyof typeof PFADE | "karte-gelb" | "karte-rot";\n';
fs.writeFileSync(path.join(__dirname, '..', 'src', 'icons', 'pfade.ts'), ico);
console.log('Farben', farbNamen.length, 'Symbole', Object.keys(I).length);
