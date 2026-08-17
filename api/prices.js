/*
  Harvest Trend · รู้ทันราคา — real price aggregator (zero dependencies, Vercel serverless).

  Sources (all real government data, verified reachable):
    1. data.go.th — Thai Government Open Data (CKAN datastore API, no key required)
       - สำนักงานจังหวัดตราด · ราคาทุเรียนเฉลี่ย (yearly) / ราคาเงาะ (monthly)
       - สำนักงานจังหวัดอำนาจเจริญ · ราคาอ้อย / ราคายางพารา / ราคาโคเนื้อ (yearly)
       - สำนักงานจังหวัดแม่ฮ่องสอน · ราคาข้าวเปลือก / ราคาข้าวโพดเลี้ยงสัตว์ (yearly)
       - สำนักงานจังหวัดสุราษฎร์ธานี · ราคาเฉลี่ยผลปาล์มน้ำมัน (monthly)
       - สำนักงานจังหวัดลพบุรี · ข้าวหอมมะลิ/ข้าวเจ้า/ข้าวโพด/มันสำปะหลัง/สุกร/ไก่เนื้อ (yearly) + น้ำนมดิบ (monthly)
       - สำนักงานพาณิชย์จังหวัดสุพรรณบุรี · ราคาข้าวเปลือกเจ้า 15% (monthly)
       - สำนักงานจังหวัดปราจีนบุรี · ราคาทุเรียน (yearly)
       - สำนักงานจังหวัดฉะเชิงเทรา · ราคาขายปลีกมะม่วง (yearly)
       - สำนักงานจังหวัดตาก · ราคากล้วยน้ำว้า (yearly)
       - สำนักงานเศรษฐกิจการเกษตร (OAE) · มันสำปะหลังสด (national, monthly)
       - OAE · สุกร / ไข่ไก่ / ไก่เนื้อ / โคเนื้อ / กุ้งขาว / กาแฟ (national, monthly)
    2. BOT (ธนาคารแห่งประเทศไทย) — BTWS_STAT
       - reportID=491 ราคาสินค้าเกษตรภาคเหนือ (monthly)
       - reportID=545 ราคาสินค้าเกษตรภาคตะวันออกเฉียงเหนือ (monthly)
       - reportID=588 ราคาสินค้าเกษตรภาคใต้ (monthly)
       - reportID=997 สถิติการเกษตรภาคใต้ (monthly)
       - reportID=89 ราคาขายส่งตลาดสำคัญ กทม. (ข้าวสาร/ยาง/ข้าวโพด/มันสำปะหลัง)

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
/* data.go.th sits behind a Cloudflare WAF that intermittently 403s datacenter
   IPs (verified 2026-08-17: the same CKAN URL returns success:true from a
   residential IP but HTTP 403 from Vercel). Try a few realistic UAs with one
   retry pass — bounded so a blocked source costs ~1–2s, not minutes. */
const UA_MOBILE = 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const UAS = [UA_CUSTOM, UA_BROWSER, UA_MOBILE];
const RETRY_BACKOFF_MS = [400];

/* ---------- helpers ---------- */
/* Try the UA list; on total failure back off and retry the whole list once.
   Bounded to 2 passes so a WAF that blocks us costs ~1–2s per source, not
   the whole function budget. Deterministic errors (bad resource id) surface
   as the last error message. */
async function getJson(url){
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), FETCH_TIMEOUT);
  try{
    let lastErr = null;
    for(let pass = 0; pass < 2; pass++){
      for(const ua of UAS){
        try{
          const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': ua, 'Accept': 'application/json' } });
          if(!r.ok) throw new Error('HTTP ' + r.status);
          return await r.json();
        }catch(e){
          if(e.name === 'AbortError') throw e;
          lastErr = e;
        }
      }
      if(pass === 0) await new Promise(r => setTimeout(r, RETRY_BACKOFF_MS[0]));
    }
    throw lastErr || new Error('unreachable');
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

/* OAE national monthly datasets: filter to ประเทศไทย rows, take latest month */
const oaeLatest = async rid => {
  const recs = await datastoreAll(rid);
  const nat = recs.filter(r => String(r['regional_name'] || '').trim() === 'ประเทศไทย');
  return lastByMonth(nat, r => r['year'], r => r['month'] - 1);
};
const oaeDate = r => String(r['year']) + '/' + String(r['month']).padStart(2, '0');

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

  /* OAE national (monthly, current year) — livestock / fishery / coffee */
  { crop: 'pork',     prov: '*',               label: 'สำนักงานเศรษฐกิจการเกษตร (OAE) · ทั้งประเทศ', dateOf: 'ปี/เดือน',
    load: async () => oaeLatest('d39fc22e-625b-4e89-8ca4-843fc52f9783'),
    to: r => ({ price: num(r['Value']), date: oaeDate(r), unit: 'บาท/กก.' }) },
  { crop: 'egg',      prov: '*',               label: 'สำนักงานเศรษฐกิจการเกษตร (OAE) · ทั้งประเทศ', dateOf: 'ปี/เดือน',
    load: async () => oaeLatest('10ebc3b6-d5ba-4025-b5f3-261b71a6458c'),
    to: r => ({ price: num(r['value']) / 100, date: oaeDate(r), unit: 'บาท/ฟอง' }) }, // บาท/ร้อยฟอง → บาท/ฟอง
  { crop: 'broiler',  prov: '*',               label: 'สำนักงานเศรษฐกิจการเกษตร (OAE) · ทั้งประเทศ', dateOf: 'ปี/เดือน',
    load: async () => oaeLatest('8d6439a5-ddab-4744-b530-a464499ad8f5'),
    to: r => ({ price: num(r['value']), date: oaeDate(r), unit: 'บาท/กก.' }) },
  { crop: 'beef',     prov: '*',               label: 'สำนักงานเศรษฐกิจการเกษตร (OAE) · ทั้งประเทศ', dateOf: 'ปี/เดือน',
    load: async () => oaeLatest('ecf31b91-5042-4908-b3d2-689343a421e1'),
    to: r => ({ price: num(r['value']) / 400, date: oaeDate(r), unit: 'บาท/กก.' }) }, // บาท/ตัว (350–450 กก.) → บาท/กก.
  { crop: 'shrimp',   prov: '*',               label: 'สำนักงานเศรษฐกิจการเกษตร (OAE) · ทั้งประเทศ', dateOf: 'ปี/เดือน',
    load: async () => oaeLatest('e78db1eb-672b-44d9-8500-4848446fe73f'),
    to: r => ({ price: num(r['value']), date: oaeDate(r), unit: 'บาท/กก.' }) },
  { crop: 'coffee',   prov: '*',               label: 'สำนักงานเศรษฐกิจการเกษตร (OAE) · ทั้งประเทศ', dateOf: 'ปี/เดือน',
    load: async () => oaeLatest('90815570-5733-4889-ae90-e88e1298e23c'),
    to: r => ({ price: num(r['values']), date: oaeDate(r), unit: 'บาท/กก.' }) },

  /* provincial offices (data.go.th) */
  { crop: 'milk',     prov: 'lophuri',         label: 'สำนักงานจังหวัดลพบุรี (น้ำนมดิบ)', dateOf: 'ปี/เดือน',
    load: async () => lastByMonth(await datastoreAll('b6d3376e-b511-4288-a445-4d6d9effc873'), r => r['ปี'], r => thMonthIdx(r['เดือน'])),
    to: r => ({ price: num(r['ราคารับซื้อ']), date: String(r['ปี']) + '/' + TH_MONTHS[thMonthIdx(r['เดือน'])], unit: 'บาท/กก.' }) },
  { crop: 'pork',     prov: 'lophuri',         label: 'สำนักงานจังหวัดลพบุรี', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('99a86152-369d-4567-906d-67f2dfaf37c7'), r => r['ปี']),
    to: r => ({ price: num(r['จำนวน']), date: String(r['ปี']), unit: 'บาท/กก.' }) },
  { crop: 'broiler',  prov: 'lophuri',         label: 'สำนักงานจังหวัดลพบุรี', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('4fad26ab-18c1-4b37-823c-b7f550514a2f'), r => r['ปี']),
    to: r => ({ price: num(r['จำนวน']), date: String(r['ปี']), unit: 'บาท/กก.' }) },
  { crop: 'rice',     prov: 'lophuri',         label: 'สำนักงานจังหวัดลพบุรี (ข้าวหอมมะลิ)', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('14f201d4-d176-494a-b68a-6e1bc6184b62'), r => r['ปี']),
    to: r => ({ price: num(r['จำนวน']) / 1000, date: String(r['ปี']), unit: 'บาท/กก.' }) }, // บาท/ตัน → บาท/กก.
  { crop: 'rice',     prov: 'lophuri',         label: 'สำนักงานจังหวัดลพบุรี (ข้าวเปลือกเจ้า)', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('b83fb2fa-f226-4b48-9b04-7941dc7d6000'), r => r['ปี']),
    to: r => ({ price: num(r['จำนวน']) / 1000, date: String(r['ปี']), unit: 'บาท/กก.' }) },
  { crop: 'maize',    prov: 'lophuri',         label: 'สำนักงานจังหวัดลพบุรี', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('c0471ba8-ff34-4c5b-bd2c-b2bae38b2881'), r => r['ปี']),
    to: r => ({ price: num(r['จำนวน']) / 1000, date: String(r['ปี']), unit: 'บาท/กก.' }) },
  { crop: 'cassava',  prov: 'lophuri',         label: 'สำนักงานจังหวัดลพบุรี', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('2978b279-131d-43d7-be81-d162a9c4a8bc'), r => r['ปี']),
    to: r => ({ price: num(r['จำนวน']) / 1000, date: String(r['ปี']), unit: 'บาท/กก.' }) },
  { crop: 'rice',     prov: 'suphanburi',      label: 'สำนักงานพาณิชย์จังหวัดสุพรรณบุรี (ข้าวเปลือกเจ้า 15%)', dateOf: 'ปี/เดือน',
    load: async () => {
      const recs = await datastoreAll('5628dc6c-fe2f-4315-b53d-ceac3cb61006');
      const plain = recs.filter(r => String(r['ชนิดข้าว'] || '').indexOf('ข้าวเปลือกเจ้า') !== -1);
      return lastByMonth(plain, r => r['ปี'], r => thMonthIdx(r['เดือน']));
    },
    to: r => ({ price: num(r['ราคาเฉลี่ย']) / 1000, date: String(r['ปี']) + '/' + TH_MONTHS[thMonthIdx(r['เดือน'])], unit: 'บาท/กก.' }) },
  { crop: 'durian',   prov: 'prachinburi',     label: 'สำนักงานจังหวัดปราจีนบุรี', dateOf: 'ปี',
    load: async () => lastByYear(await datastoreAll('a3d2bf90-917a-478b-9044-14440e7d17b0'), r => r['ปี']),
    to: r => ({ price: num(r['ราคาที่เกษตรกรขายได้']), date: String(r['ปี']), unit: 'บาท/กก.' }) },
  { crop: 'mango',    prov: 'chachoengsao',    label: 'สำนักงานจังหวัดฉะเชิงเทรา (ขายปลีก)', dateOf: 'ปี',
    load: async () => {
      const recs = await datastoreAll('b3c8c409-7f67-4c56-8cac-3a88e867837b');
      const retail = recs.filter(r => String(r['ประเภท'] || '').indexOf('ขายปลีก') !== -1);
      return lastByYear(retail, r => r['ปี']);
    },
    to: r => ({ price: num(r['ราคา']), date: String(r['ปี']), unit: 'บาท/กก.' }) },
  { crop: 'banana',   prov: 'tak',             label: 'สำนักงานจังหวัดตาก (กล้วยน้ำว้า)', dateOf: 'ปี',
    load: async () => {
      const recs = await datastoreAll('1569291f-bc2b-45c2-97ab-ba466954f995');
      const nw = recs.filter(r => String(r['รายการ'] || '').indexOf('กล้วยน้ำว้า') !== -1);
      return lastByYear(nw, r => r['ปี']);
    },
    to: r => ({ price: num(r['บาท/กก.']), date: String(r['ปี']), unit: 'บาท/กก.' }) },
  { crop: 'beef',     prov: 'amnatcharoen',    label: 'สำนักงานจังหวัดอำนาจเจริญ (โคเนื้อ)', dateOf: 'ปี',
    load: async () => {
      const recs = await datastoreAll('3da73315-ac80-4bf2-ad59-b8ca68f93f06');
      const beef = recs.filter(r => String(r['ประเภท'] || '').indexOf('โคเนื้อ') !== -1);
      return lastByYear(beef, r => r['ปี']);
    },
    to: r => ({ price: num(r['ข้อมูล']), date: String(r['ปี']), unit: 'บาท/กก.' }) },
];

/* ---------- BOT (ธปท.) reports — HTML tables, works from Vercel ---------- */
/* All BOT tables render months left→right with the LATEST month leftmost
   (verified against the <th> headers: มิ.ย. 2569 … ม.ค. 2569) → pick 'first'. */
const BOT_REPORTS = [
  { id: 491, prov: 'rg:north', pick: 'first', label: 'ธนาคารแห่งประเทศไทย · ภาคเหนือ', source: 'ธนาคารแห่งประเทศไทย (รายเดือน)',
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
    /* product group rows: "ยางแผ่นรมควัน 1/" followed by "ชั้น 1/2/3" sub-rows; "ข้าวสาร" followed by "100%/5%/..." */
    rows: [
      { re: /^ข้าวสาร$/,     group: true, crop: 'rice', div: 1000, unit: 'บาท/กก.', tag: 'ข้าวสาร', prio: name => /%/.test(name) ? 2 : 0 },
      { re: /^ปลายข้าว/,     crop: 'rice', div: 1000, unit: 'บาท/กก.', tag: 'ปลายข้าว', prio: name => 1 },
      { re: /ยางแผ่นรมควัน/, group: true, crop: 'rubber', div: 1000, unit: 'บาท/กก.', tag: 'ยางพารา' },
      { re: /^ข้าวโพด$/,     crop: 'maize', div: 1000, unit: 'บาท/กก.', tag: 'ข้าวโพด' },
      { re: /^แป้งมัน/,      crop: 'cassava', div: 1000, unit: 'บาท/กก.', tag: 'แป้งมัน' },
      { re: /^มันอัดเม็ด/,    crop: 'cassava', div: 1000, unit: 'บาท/กก.', tag: 'มันอัดเม็ด', prio: name => 1 }
    ] },
  { id: 545, prov: 'rg:ne', pick: 'first', label: 'ธนาคารแห่งประเทศไทย · ภาคตะวันออกเฉียงเหนือ', source: 'ธนาคารแห่งประเทศไทย (รายเดือน)',
    rows: [
      { re: /ข้าวเปลือกหอมมะลิ/, crop: 'rice', div: 1000, unit: 'บาท/กก.', tag: 'ข้าวหอมมะลิ', prio: name => 4 },
      { re: /ข้าวเปลือกเจ้า/,    crop: 'rice', div: 1000, unit: 'บาท/กก.', tag: 'ข้าวเจ้า', prio: name => 3 },
      { re: /ข้าวเปลือก/,       crop: 'rice', div: 1000, unit: 'บาท/กก.', tag: 'ข้าวเหนียว', prio: name => 2 },
      { re: /หัวมันสำปะหลัง/,   crop: 'cassava', tag: 'มันสำปะหลัง' },
      { re: /มันเส้น/,          crop: 'cassava', tag: 'มันเส้น', prio: name => 1 },
      { re: /อ้อย/,             crop: 'sugarcane', unit: 'บาท/ตัน', tag: 'อ้อยโรงงาน' },
      { re: /ข้าวโพด/,          crop: 'maize', tag: 'ข้าวโพด' },
      { re: /ยางพารา/,          crop: 'rubber', tag: 'ยางพารา' }
    ] },
  { id: 588, prov: 'rg:south', pick: 'first', label: 'ธนาคารแห่งประเทศไทย · ภาคใต้', source: 'ธนาคารแห่งประเทศไทย (รายเดือน)',
    rows: [
      { re: /ยางแผ่นดิบ/,   crop: 'rubber', tag: 'ยางแผ่นดิบ' },
      { re: /ปาล์มทั้งทะลาย/, crop: 'palm', tag: 'ปาล์มน้ำมัน' },
      { re: /เมล็ดกาแฟ/,    crop: 'coffee', tag: 'กาแฟ' },
      { re: /มะพร้าว/,      crop: 'coconut', div: 100, unit: 'บาท/ผล', tag: 'มะพร้าว' },
      { re: /ข้าวเปลือกเจ้า/, crop: 'rice', div: 1000, unit: 'บาท/กก.', tag: 'ข้าวเจ้า 25%' }
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
    if(!spec && group && (/ชั้น/.test(name) || /%/.test(name))) spec = group;
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
/* Whole-refresh budget: stay safely inside Vercel's default function time
   limit (10s) even when every data.go.th source 403s. 8s of work is plenty;
   anything we haven't fetched by then returns as errors (partial snapshot). */
const REFRESH_DEADLINE_MS = 8000;
let cache = null; // { at, prices, errors }
let inflight = null; // in-flight refresh promise (dedupe concurrent callers)

async function refresh(){
  const errors = [];
  const prices = [];

  /* BOT (ธปท.) runs FIRST and is never deadline-gated — it is the only source
     verified to work from Vercel's datacenter IPs (data.go.th 403s there), so
     we must never let flaky CKAN sources crowd it out of the budget. The
     deadline is computed AFTER BOT so a slow BOT can't eat the flaky-source
     budget that follows. */
  const bot = await loadBot();
  const deadline = Date.now() + REFRESH_DEADLINE_MS;
  if(bot.out.length) prices.push.apply(prices, bot.out);
  errors.push.apply(errors, bot.errors);

  if(Date.now() <= deadline){
    try{
      const rambutan = await loadRambutan();
      if(rambutan) prices.push({ crop: 'rambutan', prov: 'trat', price: rambutan.price, unit: rambutan.unit, date: rambutan.date, source: 'สำนักงานจังหวัดตราด (เฉลี่ยสายพันธุ์)' });
    }catch(e){ errors.push('rambutan — ' + (e && e.message || String(e))); }
  }

  for(const s of SOURCES){
    if(Date.now() > deadline){
      errors.push('deadline exceeded — partial snapshot (' + prices.length + ' prices)');
      break;
    }
    try{
      const rec = await s.load();
      const v = rec ? s.to(rec) : null;
      if(v && v.price > 0){
        prices.push({ crop: s.crop, prov: s.prov, price: v.price, unit: v.unit, date: v.date, source: s.label });
      }
    }catch(e){
      errors.push(s.crop + ':' + s.prov + ' — ' + (e && e.message || String(e)));
    }
  }

  cache = { at: Date.now(), prices, errors };
  return cache;
}

async function fetchPrices(){
  const now = Date.now();
  if(cache && now - cache.at < CACHE_TTL) return cache.prices; // fresh
  if(inflight) return inflight; // a refresh is already running — share it
  /* stale (or first call): start a refresh. All callers share the in-flight
     promise and get the fresh snapshot; if the refresh itself fails we fall
     back to the last good snapshot (stale-while-refreshing). */
  const stale = cache;
  inflight = (async () => {
    try{
      return (await refresh()).prices;
    }catch(e){
      if(stale) return stale.prices;
      throw e;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
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
