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
/* Full-file token scan: finds EVERY assignment of each token anywhere in the
   CSS (first :root block OR any appended override). A second :root block that
   redefines a token would previously slip past a first-match-only regex. */
function tokenAssignments(css){
  const map = {};
  const re = /(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while((m = re.exec(css))) (map[m[1]] = map[m[1]] || []).push(m[2].trim());
  return map;
}

console.log('theme tokens (golden set from 93b4ff5):');
const css = read('assets/styles.css');
const tokenAll = tokenAssignments(css);
ok('exactly one :root block in styles.css', (css.match(/:root\s*\{/g) || []).length === 1);
Object.keys(GOLDEN_TOKENS).forEach(k => {
  ok('token ' + k + ' defined (' + GOLDEN_TOKENS[k] + ')', (tokenAll[k] || []).length > 0);
  ok('token ' + k + ' never redefined differently', (tokenAll[k] || []).every(v => v === GOLDEN_TOKENS[k]));
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
  /* key definitions: preceded by block start / comma / brace (real keys are
     always comma-separated), colon, then a single- OR double-quoted value
     (recKicker uses double quotes in en: "Today's verdict"). The lookbehind
     stops value-internal matches like 'Ensemble weights:' or 'Confidence:'
     inside string values from registering as keys. */
  const re = /(?:^|[,{])\s*([A-Za-z0-9_]+):\s*(\[|['"])/gm;
  let m;
  while((m = re.exec(block))) keys[m[1]] = true;
  return keys;
}
const thKeys = dictKeys(thBlock);
const enKeys = dictKeys(enBlock);
ok('T.th and T.en key sets are identical', Object.keys(thKeys).length === Object.keys(enKeys).length &&
  Object.keys(thKeys).every(k => enKeys[k]) && Object.keys(enKeys).every(k => thKeys[k]));
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
/* JS-referenced keys (direct t.KEY access + dynamic key groups built by
   string concat — e.g. 's' + i + 'name', 'nowTrend' + cap(...)) */
const jsUsed = {};
function scanJs(src){
  const re = /\bt\.([A-Za-z0-9_]+)/g;
  let m;
  while((m = re.exec(src))) jsUsed[m[1]] = true;
}
scanJs(read('assets/app.js'));
PAGES.forEach(p => scanJs(read(p)));
/* `t` is also used as a local element variable (e.g. toast(): const t = $('toast');
   then t.classList...). Drop DOM/JS built-ins — they are never i18n keys. */
const DOM_LIKE = new Set(['classList','textContent','dataset','hidden','offsetWidth','_h',
  'value','style','tagName','nodeType','disabled','innerHTML','scrollLeft','scrollWidth',
  'clientWidth','getBoundingClientRect','contains','querySelector','closest','appendChild',
  'removeChild','addEventListener','focus','length','size','src','alt','text','id','href',
  'width','height','target','rel','className','options','placeholder','min','max','step',
  'name','rows','cols','checked','selected','required','title','type','rowIndex',
  'weight','color','wrap','margin']);
Object.keys(jsUsed).forEach(k => { if(DOM_LIKE.has(k)) delete jsUsed[k]; });
['recSell','recWait','recRecover','recBodySell','recBodyWait','recBodyRecover',
 'recCloseSell','recCloseWait','recCloseRecover','momUp','momDown','momFlat',
 's1name','s2name','s3name','s4name','s1why','s2why','s3why','s4why',
 'nowTrendUp','nowTrendDown','nowTrendFlat','harvestYes','harvestNo','harvestAll',
 'weatherWet','weatherNormal','weatherDry','confHigh','confMedHigh','confMed','confMedLow',
 'supplyRising','supplyPeak','supplyEasing','supplyNormal','peakIn','peakNow',
 'shareBody','shareCopied','watchAdd','watchExists','watchRemoved','liveNote','mockNote',
 'lbLiveTitle','lbLiveMeta','lbOffTitle','lbOffMeta','lbFileTitle','lbFileMeta',
 'qrAlt','del','monthsShort','last5w','tblHist','tblFore','tblChg','chartMin','chartMax'].forEach(k => {
  jsUsed[k] = true;
});
Object.keys(jsUsed).forEach(k => {
  ok('JS key "' + k + '" present in th+en', !!thKeys[k] && !!enKeys[k]);
});

console.log('brand-mark parity across pages:');
const marks = PAGES.map(p => {
  const html = read(p);
  const m = html.match(/<span class="brand-mark"[^>]*>([\s\S]*?)<\/span>/);
  return m ? m[1].replace(/\s+/g, ' ') : null;
});
ok('all 6 pages carry the brand-mark SVG', marks.every(x => !!x));
ok('brand-mark SVG identical on all 6 pages', marks.every(x => x === marks[0]));

console.log('DOM id contract (every $() id referenced by JS exists in the page):');
/* ids referenced by shared app.js must exist on EVERY page (it runs on all) */
function idsUsed(src){
  const ids = {};
  const re = /\$\('([^']+)'\)|getElementById\('([^']+)'\)/g;
  let m;
  while((m = re.exec(src))){
    const id = m[1] || m[2];
    if(id) ids[id] = true;
  }
  return Object.keys(ids);
}
const appIds = idsUsed(read('assets/app.js'));
PAGES.forEach(p => {
  const html = read(p);
  const idSet = {};
  let m;
  const re = /id="([^"]+)"/g;
  while((m = re.exec(html))) idSet[m[1]] = true;
  appIds.forEach(id => {
    ok('app.js id "' + id + '" exists on ' + p, !!idSet[id]);
  });
  /* page-specific inline script ids (dynamic ids created by the script itself are exempt) */
  const scripts = html.split('</script>');
  scripts.forEach(block => {
    if(!block.includes('DOMContentLoaded')) return;
    const created = {};
    let cm;
    const cre = /\.id\s*=\s*'([^']+)'/g;
    while((cm = cre.exec(block))) created[cm[1]] = true;
    idsUsed(block).forEach(id => {
      if(created[id]) return;
      ok(p + ' inline $("' + id + '") exists', !!idSet[id]);
    });
  });
});

console.log('round-2 feature contracts (dropdown, vendored UI, version stamp):');
const appSrc = read('assets/app.js');
const provBlock = appSrc.slice(appSrc.indexOf('const PROVINCES'), appSrc.indexOf('const CROPS'));
const provCount = (provBlock.match(/\{id:'/g) || []).length;
ok('app.js defines 77 provinces', provCount === 77);
const home = read('rutun-price.html');
ok('home defines buildProvSelect()', home.includes('function buildProvSelect()'));
ok('home has #prov-select element', /<select[^>]*id="prov-select"/.test(home));
ok('buildProvSelect creates optgroups', home.includes("createElement('optgroup')"));
ok('home no longer has #prov-grid', !home.includes('id="prov-grid"'));
['@keyframes shiny-text', '@keyframes marquee', '@keyframes rainbow', '@keyframes rippling', '@keyframes shine'].forEach(kf => {
  ok('styles.css has real keyframes ' + kf, css.includes(kf));
});
['.rainbow-cta', '.card-spotlight', '.ripple-btn', '.prov-select'].forEach(cls => {
  ok('styles.css has ' + cls, css.includes(cls));
});
PAGES.forEach(p => {
  const html = read(p);
  const stamps = (html.match(/class="ft-ver"/g) || []).length;
  ok(p + ' has exactly one ft-ver stamp', stamps === 1);
});

console.log('\nui-contract.test.js: ' + n + ' checks OK');
