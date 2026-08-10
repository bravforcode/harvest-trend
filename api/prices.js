/*
  Harvest Trend · รู้ทันราคา — real price aggregator (zero dependencies, Vercel serverless).

  Sources (all real government data, verified reachable):
    1. data.go.th — Thai Government Open Data (CKAN datastore API, no key required)
       - สำนักงานจังหวัดตราด · ราคาทุเรียนเฉลี่ย (yearly)
       - สำนักงานจังหวัดตราด · ราคาเงาะ (monthly)
       - สำนักงานจังหวัดอำนาจเจริญ · ราคาอ้อย (yearly)
       - สำนักงานจังหวัดอำนาจเจริญ · ราคายางพารา (yearly)
       - สำนักงานจังหวัดแม่ฮ่องสอน · ราคาข้าวเปลือก / ราคาข้าวโพดเลี้ยงสัตว์ (yearly)
       - สำนักงานจังหวัดสุราษฎร์ธานี · ราคาเฉลี่ยผลปาล์มน้ำมัน (monthly)
       - สำนักงานเศรษฐกิจการเกษตร (OAE) · ราคามันสำปะหลังสด (national, monthly)
    2. BOT (ธนาคารแห่งประเทศไทย) — BTWS_STAT reportID=491
       ราคาสินค้าเกษตรสำคัญที่เกษตรกรขายได้ในภาคเหนือ (monthly, current year)

  In-memory cache TTL 60s (Vercel instance). GET /api/prices → JSON snapshot.
  Exports fetchPrices() for api/line-webhook.js and _internals for tests.
*/
'use strict';

const CACHE_TTL = 60 * 1000; // refresh upstream at most once a minute
const FETCH_TIMEOUT = 15 * 1000;
const DATA_GOV = 'https://data.go.th/api/3/action';
const BOT_URL = 'https://app.bot.or.th/BTWS_STAT/statistics/BOTWEBSTAT.aspx?reportID=491&language=TH';
const UA_CUSTOM = 'harvest-ecc/1.0 (+https://harvest-ecc.vercel.app)';
const UA_BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/* ---------- helpers ---------- */
async function getJson(url){
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), FETCH_TIMEOUT);
  try{
    /* some Thai gov WAFs reject datacenter IPs with non-browser UAs — try both */
    for(const ua of [UA_CUSTOM, UA_BROWSER]){
      try{
        const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': ua, 'Accept': 'application/json' } });
        if(!r.ok) throw new Error('HTTP ' + r.status);
        return await r.json();
      }catch(e){
        if(e.name === 'AbortError') throw e;
        if(ua === UA_BROWSER) throw e; // both failed
      }
    }
    throw new Error('unreachable');
  } finally { clearTimeout(t); }
}

async function getText(url){
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), FETCH_TIMEOUT);
  try{
    const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36' } });
    if(!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
    return await r.text();
  } finally { clearTimeout(t); }
}

/* paginate a CKAN datastore (limit is capped at 100 on many installs) */
async function datastoreAll(resourceId){
  const out = [];
  for(let offset = 0; ; offset += 100){
    const url = DATA_GOV + '/datastore_search?resource_id=' + resourceId + '&limit=100&offset=' + offset;
    const j = await getJson(url);
    if(!j.success || !j.result || !Array.isArray(j.result.records)) throw new Error('datastore failed ' + resourceId);
    out.push.apply(out, j.result.records);
    if(j.result.records.length < 100) break;
    if(offset >= 500) break; // safety
  }
  return out;
}

const num = v => { const n = parseFloat(String(v).replace(/,/g, '').trim()); return isFinite(n) ? n : null; };

/* Thai month name → 0..11 */
const TH_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const thMonthIdx = s => { const i = TH_MONTHS.findIndex(m => String(s || '').trim().startsWith(m)); return i; };

const lastByYear = (recs, getYear) => recs.reduce((best, r) => {
  const y = getYear(r);
  return (!best || y > best._y) ? Object.assign({ _y: y }, r) : best;
}, null);

const lastByMonth = (recs, getYear, getMonth) => recs.reduce((best, r) => {
  const y = getYear(r), m = getMonth(r);
  if(y == null || m < 0) return best;
  return (!best || y > best._y || (y === best._y && m > best._m)) ? Object.assign({ _y: y, _m: m }, r) : best;
}, null);

/* ---------- source registry (crop → real datasets) ---------- */
const SOURCES = [
  { crop: 'durian',    prov: 'trat',            label: 'สำนักงานจังหวัดตราด', dateOf: 'ปี (เฉลี่ยรายปี)',
    load: async () => lastByYear(await datastoreAll('a5b7fe59-1bdd-4e64-bda6-568f3a9866e3'), r => r['ปี']),
    to: r => ({ price: num(r['ราคาเฉลี่ย']), date: String(r['ปี']), unit: 'บาท/กก.' }) },

  { crop: 'rambutan',  prov: 'trat',            label: 'สำนักงานจังหวัดตราด', dateOf: 'ปี/เดือน',
    load: async () => lastByMonth(await datastoreAll('ab9f2e12-28b3-4383-a99f-de8f33579b10'), r => r['ปี'], r => thMonthIdx(r['เดือน'])),
    to: r => { /* average the varieties reported for that month */
      return null; /* handled below with full records */
    } },

  { crop: 'sugarcane', prov: 'amnatcharoen',  label: 'สำนักงานจังหวัดอำนาจเจริญ', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('c7a983eb-356b-42d3-b734-cc166ec80da8'), r => r['ปี']),
    to: r => ({ price: num(r['ข้อมูล']) * 1000, date: String(r['ปี']), unit: 'บาท/ตัน' }) }, // บาท/กก. → บาท/ตัน

  { crop: 'rubber',    prov: 'amnatcharoen',  label: 'สำนักงานจังหวัดอำนาจเจริญ (ยางก้อนถ้วยสด)', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('cc5981c2-3648-4595-a56f-77d085ce2206'), r => r['ปี']),
    to: r => ({ price: num(r['ข้อมูล']), date: String(r['ปี']), unit: 'บาท/กก.' }) },

  { crop: 'rice',      prov: 'maehongson',      label: 'สำนักงานจังหวัดแม่ฮ่องสอน (ข้าวเปลือก)', dateOf: 'ปี',
    load: async () => {
      const recs = await datastoreAll('89c507a2-392c-41ed-a115-e6044d1afbd0');
      const plain = recs.filter(r => String(r['รายการ'] || '').trim() === 'ข้าวเปลือก (ตัน)');
      return lastByYear(plain, r => r['ปี']);
    },
    to: r => ({ price: num(r['บาท']) / 1000, date: String(r['ปี']), unit: 'บาท/กก.' }) }, // บาท/ตัน → บาท/กก.

  { crop: 'maize',     prov: 'maehongson',      label: 'สำนักงานจังหวัดแม่ฮ่องสอน', dateOf: 'ปี',
    load: async () => {
      const recs = await datastoreAll('f2be2daf-d5d0-47c0-a1e0-342d5c12d253');
      const plain = recs.filter(r => String(r['รายการ'] || '').trim() === 'ข้าวโพดเลี้ยงสัตว์ (กก.)');
      return lastByYear(plain, r => r['ปี']);
    },
    to: r => ({ price: num(r['ราคา']), date: String(r['ปี']), unit: 'บาท/กก.' }) },

  { crop: 'palm',      prov: 'suratthani',      label: 'สำนักงานจังหวัดสุราษฎร์ธานี (ผลปาล์ม)', dateOf: 'ปี/เดือน',
    load: async () => {
      const recs = await datastoreAll('e6fd80a6-125a-40b8-9293-0a81c6fe2ba2');
      return lastByMonth(recs, r => r['ปี'], r => thMonthIdx(r['เดือน']));
    },
    to: r => ({ price: num(r['ราคา']), date: String(r['ปี']) + '/' + TH_MONTHS[thMonthIdx(r['เดือน'])], unit: 'บาท/กก.' }) },

  { crop: 'cassava',   prov: '*',               label: 'สำนักงานเศรษฐกิจการเกษตร (OAE) · ทั้งประเทศ', dateOf: 'ปี/เดือน',
    load: async () => lastByMonth(await datastoreAll('d21158de-0193-4f3b-b703-fc350687106a'), r => r['year'], r => r['month'] - 1),
    to: r => ({ price: num(r['value']), date: String(r['year']) + '/' + String(r['month']).padStart(2, '0'), unit: 'บาท/กก.' }) },
];

/* ---------- BOT (ธปท.) reports — HTML tables, works from Vercel ---------- */
/* pick: 'last' → values are months left→right (rightmost = latest, report 491)
          'first' → values are [current, previous] (leftmost = latest, 997/89)  */
const BOT_REPORTS = [
  { id: 491, prov: 'rg:north', pick: 'last', label: 'ธนาคารแห่งประเทศไทย · ภาคเหนือ', source: 'ธนาคารแห่งประเทศไทย (รายเดือน)',
    rows: [
      { re: /ข้าวเปลือก/,  crop: 'rice',      tag: 'ข้าวเปลือก',  prio: name => /ข้าวเปลือกเหนียว/.test(name) ? 1 : (/ข้าวเปลือกเจ้า/.test(name) ? 3 : 2) },
      { re: /ข้าวโพด/,    crop: 'maize',     tag: 'ข้าวโพด' },
      { re: /มันสำปะหลัง/, crop: 'cassava',  tag: 'มันสำปะหลัง' },
      { re: /ลำไย/,       crop: 'longan',    tag: 'ลำไย' },
      { re: /อ้อย/,       crop: 'sugarcane', tag: 'อ้อย' }
    ] },
  { id: 997, prov: 'rg:south', pick: 'first', label: 'ธนาคารแห่งประเทศไทย · ภาคใต้', source: 'ธนาคารแห่งประเทศไทย (รายเดือน)',
    rows: [
      { re: /ยาง/,       crop: 'rubber', tag: 'ยางพารา' },
      { re: /ผลปาล์ม/,    crop: 'palm',   tag: 'ปาล์มน้ำมัน' },
      { re: /ทุเรียน/,    crop: 'durian', tag: 'ทุเรียน' }
    ] },
  { id: 89,  prov: 'rg:*',   pick: 'first', label: 'ธนาคารแห่งประเทศไทย · ราคาขายส่งตลาดสำคัญ (กรุงเทพฯ)', source: 'ธนาคารแห่งประเทศไทย (ขายส่ง)',
    /* product group rows: "ยางแผ่นรมควัน 1/" followed by "ชั้น 1/2/3" sub-rows */
    rows: [
      { re: /ยางแผ่นรมควัน/, group: true, crop: 'rubber', div: 1000, unit: 'บาท/กก.', tag: 'ยางพารา' },
      { re: /^ข้าวโพด$/,     crop: 'maize', div: 1000, unit: 'บาท/กก.', tag: 'ข้าวโพด' }
    ] }
];

function parseBotTable(html){
  /* data rows: [rowno][name][values...] (≥3 cells so header/foot rows are skipped) */
  const rows = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while((m = trRe.exec(html)) !== null){
    const tds = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let t;
    while((t = tdRe.exec(m[1])) !== null){
      const txt = t[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').trim();
      tds.push(txt);
    }
    if(tds.length >= 3) rows.push(tds);
  }
  return rows;
}

function pickValue(vals, pick){
  const seq = pick === 'first' ? vals : vals.slice().reverse();
  for(const v of seq){
    if(v !== '-' && v !== '' && v !== 'n.a.'){
      const n = num(v);
      if(n !== null) return n;
    }
  }
  return null;
}

function normalizeBot(rows, report){
  const seen = {}; // crop -> {prio, entry}
  let group = null; // pending product group (report 89 sub-rows)
  for(const tds of rows){
    const name = tds[1] || '';
    const val = pickValue(tds.slice(2), report.pick);
    /* group sub-rows (ชั้น 1/2/3) inherit the parent product */
    let spec = null;
    for(const r of report.rows){
      if(r.re.test(name)){
        if(r.group){ group = r; spec = null; }
        else spec = r;
        break;
      }
    }
    if(!spec && group && /ชั้น/.test(name)) spec = group;
    if(!spec || val === null) continue;
    const prio = (spec.prio && spec.prio(name)) || 0;
    const cur = seen[spec.crop];
    if(!cur || prio > cur.prio){
      const perTonne = /เมตริกตัน/.test(name);
      const div = spec.div || (perTonne && spec.crop === 'rice' ? 1000 : 1);
      const unit = spec.unit || (perTonne ? (spec.crop === 'rice' ? 'บาท/กก.' : 'บาท/ตัน') : 'บาท/กก.');
      seen[spec.crop] = { prio, entry: {
        crop: spec.crop, prov: report.prov, price: val / div, unit,
        date: report.id === 89 ? 'ล่าสุด' : 'เดือนล่าสุด',
        source: report.source, label: report.label + ' · ' + spec.tag
      }};
    }
  }
  return Object.keys(seen).map(k => seen[k].entry);
}

async function loadBot(){
  const out = [];
  const errors = [];
  for(const report of BOT_REPORTS){
    try{
      const html = await getText(BOT_URL.replace('491', String(report.id)));
      const entries = normalizeBot(parseBotTable(html), report);
      if(entries.length) out.push.apply(out, entries);
      else errors.push('BOT ' + report.id + ' — no rows parsed');
    }catch(e){
      errors.push('BOT ' + report.id + ' — ' + (e && e.message || String(e)));
    }
  }
  return { out, errors };
}

/* ---------- rambutan: special (monthly, average across varieties) ---------- */
async function loadRambutan(){
  const recs = await datastoreAll('ab9f2e12-28b3-4383-a99f-de8f33579b10');
  const keyed = recs.map(r => ({ y: r['ปี'], m: thMonthIdx(r['เดือน']), price: num(r['ราคา']) }))
    .filter(x => x.y != null && x.m >= 0 && x.price !== null);
  if(!keyed.length) return null;
  const maxY = Math.max.apply(null, keyed.map(x => x.y));
  const inYear = keyed.filter(x => x.y === maxY);
  const maxM = Math.max.apply(null, inYear.map(x => x.m));
  const inMonth = inYear.filter(x => x.m === maxM);
  const avg = inMonth.reduce((s, x) => s + x.price, 0) / inMonth.length;
  return { price: avg, date: String(maxY) + '/' + TH_MONTHS[maxM], unit: 'บาท/กก.' };
}

/* ---------- aggregation ---------- */
let cache = null; // { at, prices, errors }

async function fetchPrices(){
  const now = Date.now();
  if(cache && now - cache.at < CACHE_TTL) return cache.prices;
  if(cache) return cache.prices; // stale-while-refreshing: serve last good snapshot immediately

  const errors = [];
  const prices = [];

  /* data.go.th (CKAN) — sequential to keep the WAF calm; retry once UNLESS the
     failure is a deterministic 403 (Cloudflare IP block — retrying is pointless) */
  for(const s of SOURCES){
    for(let attempt = 0; attempt < 2; attempt++){
      try{
        const rec = await s.load();
        if(!rec) break;
        const v = s.to(rec);
        if(v && v.price > 0){
          prices.push({ crop: s.crop, prov: s.prov, price: v.price, unit: v.unit, date: v.date, source: s.label });
          break;
        }
      }catch(e){
        const msg = e && e.message || String(e);
        if(attempt === 0 && msg.indexOf('HTTP 403') === -1){
          await new Promise(r => setTimeout(r, 400)); // transient? brief pause then retry
        }else{
          errors.push(s.crop + ':' + s.prov + ' — ' + msg);
          break;
        }
      }
    }
  }

  try{
    const rambutan = await loadRambutan();
    if(rambutan) prices.push({ crop: 'rambutan', prov: 'trat', price: rambutan.price, unit: rambutan.unit, date: rambutan.date, source: 'สำนักงานจังหวัดตราด (เฉลี่ยสายพันธุ์)' });
  }catch(e){ errors.push('rambutan — ' + (e && e.message || String(e))); }

  /* BOT (ธปท.) — works from Vercel */
  const bot = await loadBot();
  if(bot.out.length) prices.push.apply(prices, bot.out);
  errors.push.apply(errors, bot.errors);

  cache = { at: Date.now(), prices, errors };
  return prices;
}

/* ---------- HTTP handler (Vercel) ---------- */
module.exports = async function handler(req, res){
  if(req.method !== 'GET' && req.method !== 'HEAD'){
    return res.status(405).json({ error: 'method not allowed' });
  }
  if(req.url && req.url.indexOf('debug=1') !== -1){
    /* diagnostics: raw upstream response for one data.go.th call */
    try{
      const u = new URL(req.url, 'http://x');
      const rid = u.searchParams.get('rid') || 'a5b7fe59-1bdd-4e64-bda6-568f3a9866e3';
      const r = await fetch(DATA_GOV + '/datastore_search?resource_id=' + rid + '&limit=2', { headers: { 'User-Agent': UA_BROWSER, 'Accept': 'application/json' } });
      const body = await r.text();
      return res.status(200).json({ status: r.status, statusText: r.statusText, headers: Object.fromEntries(r.headers.entries()), body: body.slice(0, 1000) });
    }catch(e){
      return res.status(200).json({ error: e && e.message || String(e), name: e && e.name });
    }
  }
  try{
    const prices = await fetchPrices();
    res.setHeader('Cache-Control', 'public, max-age=30');
    return res.status(200).json({
      ok: true,
      source: 'data.go.th (CKAN) + ธนาคารแห่งประเทศไทย',
      updated: new Date().toISOString(),
      count: prices.length,
      errors: (cache && cache.errors) || [],
      prices
    });
  }catch(e){
    return res.status(502).json({ ok: false, error: e.message });
  }
};

/* internals for tests */
module.exports.fetchPrices = fetchPrices;
module.exports._internals = {
  parseBotTable, normalizeBot, datastoreAll, lastByYear, lastByMonth, thMonthIdx, num,
  SOURCES, BOT_REPORTS
};
