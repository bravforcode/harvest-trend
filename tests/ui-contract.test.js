/* Harvest Trend · รู้ทันราคา — UI contract regression guards (node, zero deps)
   Protects the binding visual identity (DIRECTION CONTRACT v2 "unchanged world"):
   1. Theme tokens in assets/styles.css :root must never drift from the golden set.
   2. All 6 pages must share the same 6-link nav (order included).
   3. sw.js must precache every .html page.
   4. Every i18n key used by pages must exist in BOTH T.th and T.en.
   5. The brand-mark SVG block must be identical across all 6 pages. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = ['rutun-price.html', 'price-chart.html', 'report.html', 'watch.html', 'line.html', 'about.html'];
const NAV_HREFS = ['rutun-price.html', 'price-chart.html', 'report.html', 'watch.html', 'about.html', 'line.html'];

/* golden tokens captured from commit 93b4ff5 (pre-hardening) — DO NOT EDIT */
const GOLDEN_TOKENS = {
  '--ground': '#F6F1E2',
  '--paper': '#FFFDF6',
  '--ink': '#1C2E20',
  '--forest': '#2C4A24',
  '--leaf': '#4A7A3D',
  '--gold': '#C9922E',
  '--gold-soft': '#F3E3BC',
  '--clay': '#B6472E',
  '--clay-soft': '#F5DDD4',
  '--sky': '#2E5C9A',
  '--sky-soft': '#E4ECF7',
  '--moss': '#4A5A48',
  '--line': '#E4DFC9',
  '--leaf-tint': '#E6EDE0'
};

let n = 0;
function ok(name, cond){
  n++;
  assert.ok(cond, 'FAIL: ' + name);
  console.log('  ✓ ' + name);
}

function read(p){ return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function tokensFrom(css){
  const m = css.match(/:root\s*\{([^}]*)\}/);
  if(!m) return {};
  const map = {};
  m[1].split(';').forEach(decl => {
    const kv = decl.match(/^\s*(--[A-Za-z0-9-]+)\s*:\s*([^;]+?)\s*$/);
    if(kv) map[kv[1]] = kv[2];
  });
  return map;
}

console.log('theme tokens (golden set from 93b4ff5):');
const css = read('assets/styles.css');
const tokens = tokensFrom(css);
Object.keys(GOLDEN_TOKENS).forEach(k => {
  ok('token ' + k + ' unchanged (' + GOLDEN_TOKENS[k] + ')', tokens[k] === GOLDEN_TOKENS[k]);
});

console.log('nav parity across pages:');
PAGES.forEach(p => {
  const html = read(p);
  const nav = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/);
  ok(p + ' has a nav block', !!nav);
  const hrefs = [];
  const re = /<a[^>]*href="([^"]+)"/g;
  let m;
  while((m = re.exec(nav[1]))) hrefs.push(m[1]);
  ok(p + ' nav links match the canonical 6 (order)', JSON.stringify(hrefs) === JSON.stringify(NAV_HREFS));
});

console.log('service worker precache coverage:');
const sw = read('sw.js');
PAGES.forEach(p => {
  ok('sw.js CORE includes ' + p, sw.includes("'" + p + "'"));
});

console.log('i18n parity (page keys exist in T.th and T.en):');
const app = read('assets/app.js');
const thStart = app.indexOf('th: {');
const enStart = app.indexOf('\nen: {');
const thBlock = app.slice(thStart, enStart);
const enBlock = app.slice(enStart, app.indexOf('};', enStart));
function dictKeys(block){
  const keys = {};
  const re = /([A-Za-z0-9_]+):\s*'/g;
  let m;
  while((m = re.exec(block))) keys[m[1]] = true;
  return keys;
}
const thKeys = dictKeys(thBlock);
const enKeys = dictKeys(enBlock);
PAGES.forEach(p => {
  const html = read(p);
  const used = {};
  ['data-i18n', 'data-i18n-html', 'data-i18n-ph', 'data-i18n-aria', 'data-i18n-title', 'data-i18n-meta'].forEach(attr => {
    const re = new RegExp(attr + '="([^"]+)"', 'g');
    let m;
    while((m = re.exec(html))) used[m[1]] = true;
  });
  Object.keys(used).forEach(k => {
    ok(p + ' uses i18n key "' + k + '" present in th+en', !!thKeys[k] && !!enKeys[k]);
  });
});
/* JS-referenced keys (not in page data-i18n attributes) */
['repCollapse', 'repQuick', 'repShowAll', 'chartFollowAdd', 'chartFollowRemove',
 'watchStripTitle', 'watchEmptyGo', 'tickerLbl', 'tickerAria'].forEach(k => {
  ok('shared JS key "' + k + '" present in th+en', !!thKeys[k] && !!enKeys[k]);
});

console.log('brand-mark parity across pages:');
const marks = PAGES.map(p => {
  const html = read(p);
  const m = html.match(/<span class="brand-mark"[^>]*>([\s\S]*?)<\/span>/);
  return m ? m[1].replace(/\s+/g, ' ') : null;
});
ok('all 6 pages carry the brand-mark SVG', marks.every(x => !!x));
ok('brand-mark SVG identical on all 6 pages', marks.every(x => x === marks[0]));

console.log('\nui-contract.test.js: ' + n + ' checks OK');
