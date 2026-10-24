/* Harvest Trend · รู้ทันราคา — UI contract regression guards for the React v2 app
   (node, zero deps). Protects the binding visual identity (DIRECTION CONTRACT v2
   "unchanged world") after the static-HTML → React migration:
   1. Theme tokens in src/index.css @theme must never drift from the golden set
      (v2 user-approved: --gold #C9922E → #A87B1F, --gold-soft #F3E3BC → #F5E8C8).
   2. Header nav must keep the canonical 8 links (order included); bottom nav 5 tabs.
   3. vite.config.ts PWA must precache the app shell and never cache /api.
   4. Every i18n key used by src code must exist in BOTH T.th and T.en.
   5. The brand-mark SVG grammar must stay intact (single source: BrandMark.tsx).
   6. Dataset contract: 77 provinces, 25 crops, 4 grades; engine CUR_WEEK = 32. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

/* golden tokens captured from the v2 theme (user-approved gold shift) — DO NOT EDIT */
const GOLDEN_TOKENS = {
  '--ground': '#F6F1E2',
  '--paper': '#FFFDF6',
  '--ink': '#1C2E20',
  '--forest': '#2C4A24',
  '--leaf': '#4A7A3D',
  '--gold': '#A87B1F',
  '--gold-soft': '#F5E8C8',
  '--clay': '#B6472E',
  '--clay-soft': '#F5DDD4',
  '--sky': '#2E5C9A',
  '--sky-soft': '#E4ECF7',
  '--moss': '#4A5A48',
  '--line': '#E4DFC9',
  '--leaf-tint': '#E6EDE0'
};

let n = 0;
function ok(name, cond) {
  n++;
  assert.ok(cond, 'FAIL: ' + name);
  console.log('  ✓ ' + name);
}

function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function readSrc(p) { return fs.readFileSync(path.join(SRC, p), 'utf8'); }

/* walk src recursively, return all .ts/.tsx contents */
function walkSrc(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkSrc(p, acc);
    else if (/\.(ts|tsx)$/.test(e.name)) acc.push(fs.readFileSync(p, 'utf8'));
  }
  return acc;
}

/* Full-file token scan: finds EVERY assignment of each token anywhere in the
   CSS (first @theme block OR any appended override). */
function tokenAssignments(css) {
  const map = {};
  const re = /(--color-[A-Za-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css))) {
    const k = m[1].replace('--color-', '--');
    (map[k] = map[k] || []).push(m[2].trim());
  }
  return map;
}

console.log('theme tokens (golden set v2):');
const css = readSrc('index.css');
const tokenAll = tokenAssignments(css);
ok('exactly one @theme block in index.css', (css.match(/@theme\s*\{/g) || []).length === 1);
Object.keys(GOLDEN_TOKENS).forEach(k => {
  ok('token ' + k + ' defined (' + GOLDEN_TOKENS[k] + ')', (tokenAll[k] || []).length > 0);
  ok('token ' + k + ' never redefined differently', (tokenAll[k] || []).every(v => v === GOLDEN_TOKENS[k]));
});

console.log('nav parity (header 6 links, bottom 5 tabs):');
const header = readSrc('components/layout/Header.tsx');
const navBlock = header.slice(header.indexOf('const NAV_LINKS'), header.indexOf('as const'));
const navHrefs = [];
{
  const re = /to: '([^']+)'/g;
  let m;
  while ((m = re.exec(navBlock))) navHrefs.push(m[1]);
}
ok('Header NAV_LINKS has the canonical 8 routes (order)',
  JSON.stringify(navHrefs) === JSON.stringify(['/', '/chart', '/map', '/cost', '/report', '/watch', '/about', '/line']));
const bottom = readSrc('components/layout/BottomNav.tsx');
const tabBlock = bottom.slice(bottom.indexOf('const TABS'), bottom.indexOf('as const'));
const tabHrefs = [];
{
  const re = /to: '([^']+)'/g;
  let m;
  while ((m = re.exec(tabBlock))) tabHrefs.push(m[1]);
}
ok('BottomNav has 5 tabs (order)', JSON.stringify(tabHrefs) === JSON.stringify(['/', '/chart', '/watch', '/report', '/line']));

console.log('app shell routes:');
const app = readSrc('App.tsx');
['/', '/chart', '/report', '/watch', '/about', '/line'].forEach(r => {
  ok('App.tsx has route ' + r, app.includes('<Route path="' + r + '"'));
});

console.log('PWA contract (injectManifest src/sw.ts):');
const vc = read('vite.config.mts');
const sw = readSrc('sw.ts');
ok('VitePWA plugin configured', vc.includes('VitePWA('));
ok('injectManifest strategy configured', vc.includes("strategies: 'injectManifest'"));
ok('sw.ts handles navigation fallback (offline shell)', sw.includes("request.mode === 'navigate'") && sw.includes("caches.match('/index.html')"));
ok('sw.ts never caches /api (NetworkOnly)', sw.includes('NetworkOnly') && sw.includes("'/api/'"));
ok('sw.ts has a web-push handler', sw.includes("addEventListener('push'") && sw.includes('showNotification'));
['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'og-image.png'].forEach(f => {
  ok('includeAssets lists ' + f, vc.includes("'" + f + "'"));
});
ok('public/ ships the PWA assets', ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'og-image.png', 'robots.txt', 'sitemap.xml']
  .every(f => fs.existsSync(path.join(ROOT, 'public', f))));

console.log('i18n parity (keys used by src exist in T.th and T.en):');
const i18n = readSrc('lib/i18n.ts');
const thStart = i18n.indexOf('th: {');
const enStart = i18n.indexOf('en: {', thStart);
const thBlock = i18n.slice(thStart, enStart);
const enBlock = i18n.slice(enStart, i18n.indexOf('};', enStart));
function dictKeys(block) {
  const keys = {};
  const re = /(?:^|[,{])\s*([A-Za-z0-9_]+):\s*(\[|['"])/gm;
  let m;
  while ((m = re.exec(block))) keys[m[1]] = true;
  return keys;
}
const thKeys = dictKeys(thBlock);
const enKeys = dictKeys(enBlock);
ok('T.th and T.en key sets are identical', Object.keys(thKeys).length === Object.keys(enKeys).length &&
  Object.keys(thKeys).every(k => enKeys[k]) && Object.keys(enKeys).every(k => thKeys[k]));

/* keys referenced via t.KEY anywhere in src */
const srcAll = walkSrc(SRC, []);
const used = {};
srcAll.forEach(src => {
  const re = /\bt\.([A-Za-z0-9_]+)/g;
  let m;
  while ((m = re.exec(src))) used[m[1]] = true;
});
/* `t` is also used as a local element variable in a few spots; drop DOM/JS
   built-ins — they are never i18n keys. */
const DOM_LIKE = new Set(['classList', 'textContent', 'dataset', 'hidden', 'offsetWidth', '_h',
  'value', 'style', 'tagName', 'nodeType', 'disabled', 'innerHTML', 'scrollLeft', 'scrollWidth',
  'clientWidth', 'getBoundingClientRect', 'contains', 'querySelector', 'closest', 'appendChild',
  'removeChild', 'addEventListener', 'focus', 'length', 'size', 'src', 'alt', 'text', 'id', 'href',
  'width', 'height', 'target', 'rel', 'className', 'options', 'placeholder', 'min', 'max', 'step',
  'name', 'rows', 'cols', 'checked', 'selected', 'required', 'title', 'type', 'rowIndex',
  'weight', 'color', 'wrap', 'margin']);
Object.keys(used).forEach(k => { if (DOM_LIKE.has(k)) delete used[k]; });
/* dynamic key groups built by string concat (e.g. 'supply' + cap(supSt)) */
['recSell', 'recWait', 'recRecover', 'recBodySell', 'recBodyWait', 'recBodyRecover',
  'recCloseSell', 'recCloseWait', 'recCloseRecover', 'momUp', 'momDown', 'momFlat',
  's1name', 's2name', 's3name', 's4name', 's1why', 's2why', 's3why', 's4why',
  'nowTrendUp', 'nowTrendDown', 'nowTrendFlat', 'harvestYes', 'harvestNo', 'harvestAll',
  'weatherWet', 'weatherNormal', 'weatherDry', 'confHigh', 'confMedHigh', 'confMed', 'confMedLow',
  'supplyRising', 'supplyPeak', 'supplyEasing', 'supplyNormal', 'peakIn', 'peakNow',
  'shareBody', 'shareCopied', 'watchAdd', 'watchExists', 'watchRemoved', 'liveNote', 'mockNote',
  'lbLiveTitle', 'lbLiveMeta', 'lbOffTitle', 'lbOffMeta', 'lbFileTitle', 'lbFileMeta',
  'qrAlt', 'del', 'monthsShort', 'last5w', 'tblHist', 'tblFore', 'tblChg', 'chartMin', 'chartMax'].forEach(k => {
  used[k] = true;
});
Object.keys(used).forEach(k => {
  ok('src key "' + k + '" present in th+en', !!thKeys[k] && !!enKeys[k]);
});
/* v2 feature keys must exist */
['recentTitle', 'recentSub', 'recentEmpty', 'recentClear', 'voiceRead', 'voiceStop',
  'voiceUnsupported', 'voiceReading', 'backHome', 'openApp'].forEach(k => {
  ok('v2 key "' + k + '" present in th+en', !!thKeys[k] && !!enKeys[k]);
});

console.log('brand-mark grammar (single source):');
const bm = readSrc('components/layout/BrandMark.tsx');
ok('BrandMark.tsx renders brand-logo.png', bm.includes('src="/brand-logo.png"'));
ok('public/brand-logo.png exists', fs.existsSync(path.join(ROOT, 'public', 'brand-logo.png')));


console.log('dataset contract:');
const data = readSrc('lib/data.ts');
const provBlock = data.slice(data.indexOf('const NORTH'), data.indexOf('export const PROVINCES'));
ok('data.ts defines 77 provinces', (provBlock.match(/\{ id: '/g) || []).length === 77);
const cropBlock = data.slice(data.indexOf('export const CROPS'), data.indexOf('export const cropById'));
ok('data.ts defines 25 crops', (cropBlock.match(/id: '/g) || []).length === 25);
ok('GRADES A/B/C/D intact', data.includes('A: 1.15') && data.includes('B: 1.0') && data.includes('C: 0.85') && data.includes('D: 0.7'));

console.log('engine contract:');
const eng = readSrc('lib/engine.ts');
ok('CUR_WEEK = 32 (mid-August demo clock)', eng.includes('CUR_WEEK = 32'));
ok('recommend thresholds intact', eng.includes('score <= -1.5') && eng.includes('score >= 1.5'));
['REC_KEY', 'BODY_KEY', 'CLOSE_KEY', 'MOM_KEY'].forEach(k => {
  ok('engine exports ' + k, eng.includes('export const ' + k));
});

console.log('version stamp:');
ok('Footer carries the v2 build stamp', readSrc('components/layout/Footer.tsx').includes('build v2'));

console.log('privacy controls (PDPA):');
const sbClient = readSrc('lib/supabase.ts');
const sqlSchema = read('supabase/schema.sql');
const migrations = fs.readdirSync(path.join(ROOT, 'supabase', 'migrations'))
  .map(f => read(path.join('supabase', 'migrations', f))).join('\n');
const COLUMN_GRANT = 'grant select (id, crop, province, price, unit, note, lat, lng, photo_url, created_at)';
ok('consent (th) does not claim "no personal data"', !i18n.includes('หรือข้อมูลส่วนตัว'));
ok('consent (th) states GPS is not collected', i18n.includes('ระบบไม่เก็บตำแหน่ง GPS'));
ok('consent (en) does not claim "no personal data"', !i18n.includes('or personal data is collected'));
ok('consent (en) states GPS is not collected', i18n.includes('The app does not collect GPS location'));
ok('fetchRecentReports selects explicit columns (no user_id)',
  sbClient.includes("select('id,crop,province,price,unit,note,lat,lng,photo_url,created_at')"));
ok('fetchRecentReports never selects *', !sbClient.includes("select('*')"));
ok('PriceReport type omits user_id', !/user_id: string/.test(sbClient));
ok('migration revokes table-wide select on price_reports from anon, authenticated',
  migrations.includes('revoke select on public.price_reports from anon, authenticated'));
ok('migration re-grants column select without user_id', migrations.includes(COLUMN_GRANT));
ok('schema.sql carries the same column-level grant', sqlSchema.includes(COLUMN_GRANT));

console.log('\nui-contract.test.js: ' + n + ' checks OK');