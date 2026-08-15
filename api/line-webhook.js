/*
  Harvest Trend · รู้ทันราคา — LINE OA (Messaging API) webhook
  Zero-dependency Node serverless function for Vercel (/api/line-webhook.js).

  Setup (see line.html FAQ):
    env LINE_CHANNEL_SECRET       — from LINE Developer console (Messaging API channel)
    env LINE_CHANNEL_ACCESS_TOKEN — long-lived access token from the same console
  Without credentials the endpoint still returns 200 {"status":"not-configured"}
  so LINE's webhook validation passes; the site's line.html shows "รอการตั้งค่า".
*/
const crypto = require('crypto');
/* real price aggregator (data.go.th + BOT) — see api/prices.js */
const { fetchPrices } = require('./prices.js');

/* ================= DATA (mirror of assets/app.js) ================= */
const REGION_FACTOR = { north: 0.97, ne: 0.95, central: 1.0, east: 1.08, west: 1.0, south: 1.02 };
const GRADES = { A: 1.15, B: 1.0, C: 0.85, D: 0.7 };
const CUR_WEEK = 32; // mid-August anchor week of the demo clock (matches web app)

const PROVINCES = [
  {id:'chiangmai',th:'เชียงใหม่',en:'Chiang Mai',rg:'north'},{id:'chiangrai',th:'เชียงราย',en:'Chiang Rai',rg:'north'},
  {id:'lampang',th:'ลำปาง',en:'Lampang',rg:'north'},{id:'lamphun',th:'ลำพูน',en:'Lamphun',rg:'north'},
  {id:'phrae',th:'แพร่',en:'Phrae',rg:'north'},{id:'nan',th:'น่าน',en:'Nan',rg:'north'},
  {id:'phayao',th:'พะเยา',en:'Phayao',rg:'north'},{id:'uttaradit',th:'อุตรดิตถ์',en:'Uttaradit',rg:'north'},
  {id:'sukhothai',th:'สุโขทัย',en:'Sukhothai',rg:'north'},{id:'phitsanulok',th:'พิษณุโลก',en:'Phitsanulok',rg:'north'},
  {id:'phichit',th:'พิจิตร',en:'Phichit',rg:'north'},{id:'kamphaengphet',th:'กำแพงเพชร',en:'Kamphaeng Phet',rg:'north'},
  {id:'phetchabun',th:'เพชรบูรณ์',en:'Phetchabun',rg:'north'},{id:'tak',th:'ตาก',en:'Tak',rg:'north'},
  {id:'nakhonsawan',th:'นครสวรรค์',en:'Nakhon Sawan',rg:'north'},{id:'uthaithani',th:'อุทัยธานี',en:'Uthai Thani',rg:'north'},
  {id:'maehongson',th:'แม่ฮ่องสอน',en:'Mae Hong Son',rg:'north'},
  {id:'nakhonratchasima',th:'นครราชสีมา',en:'Nakhon Ratchasima',rg:'ne'},{id:'buriram',th:'บุรีรัมย์',en:'Buriram',rg:'ne'},
  {id:'surin',th:'สุรินทร์',en:'Surin',rg:'ne'},{id:'srisaket',th:'ศรีสะเกษ',en:'Sisaket',rg:'ne'},
  {id:'ubon',th:'อุบลราชธานี',en:'Ubon Ratchathani',rg:'ne'},{id:'yasothon',th:'ยโสธร',en:'Yasothon',rg:'ne'},
  {id:'amnatcharoen',th:'อำนาจเจริญ',en:'Amnat Charoen',rg:'ne'},{id:'mukdahan',th:'มุกดาหาร',en:'Mukdahan',rg:'ne'},
  {id:'nakhonphanom',th:'นครพนม',en:'Nakhon Phanom',rg:'ne'},{id:'sakonnakhon',th:'สกลนคร',en:'Sakon Nakhon',rg:'ne'},
  {id:'kalasin',th:'กาฬสินธุ์',en:'Kalasin',rg:'ne'},{id:'khonkaen',th:'ขอนแก่น',en:'Khon Kaen',rg:'ne'},
  {id:'mahasarakham',th:'มหาสารคาม',en:'Maha Sarakham',rg:'ne'},{id:'roiet',th:'ร้อยเอ็ด',en:'Roi Et',rg:'ne'},
  {id:'loei',th:'เลย',en:'Loei',rg:'ne'},{id:'nongbualamphu',th:'หนองบัวลำภู',en:'Nong Bua Lamphu',rg:'ne'},
  {id:'udonthani',th:'อุดรธานี',en:'Udon Thani',rg:'ne'},{id:'nongkhai',th:'หนองคาย',en:'Nong Khai',rg:'ne'},
  {id:'buengkan',th:'บึงกาฬ',en:'Bueng Kan',rg:'ne'},{id:'chaiyaphum',th:'ชัยภูมิ',en:'Chaiyaphum',rg:'ne'},
  {id:'bangkok',th:'กรุงเทพมหานคร',en:'Bangkok',rg:'central'},{id:'nonthaburi',th:'นนทบุรี',en:'Nonthaburi',rg:'central'},
  {id:'pathumthani',th:'ปทุมธานี',en:'Pathum Thani',rg:'central'},{id:'ayutthaya',th:'พระนครศรีอยุธยา',en:'Ayutthaya',rg:'central'},
  {id:'angthong',th:'อ่างทอง',en:'Ang Thong',rg:'central'},{id:'singburi',th:'สิงห์บุรี',en:'Sing Buri',rg:'central'},
  {id:'chainat',th:'ชัยนาท',en:'Chai Nat',rg:'central'},{id:'lophuri',th:'ลพบุรี',en:'Lopburi',rg:'central'},
  {id:'saraburi',th:'สระบุรี',en:'Saraburi',rg:'central'},{id:'suphanburi',th:'สุพรรณบุรี',en:'Suphan Buri',rg:'central'},
  {id:'nakhonpathom',th:'นครปฐม',en:'Nakhon Pathom',rg:'central'},{id:'samutsakhon',th:'สมุทรสาคร',en:'Samut Sakhon',rg:'central'},
  {id:'samutsongkhram',th:'สมุทรสงคราม',en:'Samut Songkhram',rg:'central'},{id:'samutprakan',th:'สมุทรปราการ',en:'Samut Prakan',rg:'central'},
  {id:'chonburi',th:'ชลบุรี',en:'Chonburi',rg:'east'},{id:'chachoengsao',th:'ฉะเชิงเทรา',en:'Chachoengsao',rg:'east'},
  {id:'rayong',th:'ระยอง',en:'Rayong',rg:'east'},{id:'chanthaburi',th:'จันทบุรี',en:'Chanthaburi',rg:'east'},
  {id:'trat',th:'ตราด',en:'Trat',rg:'east'},{id:'prachinburi',th:'ปราจีนบุรี',en:'Prachinburi',rg:'east'},
  {id:'sakaew',th:'สระแก้ว',en:'Sa Kaeo',rg:'east'},{id:'nakhonnayok',th:'นครนายก',en:'Nakhon Nayok',rg:'east'},
  {id:'kanchanaburi',th:'กาญจนบุรี',en:'Kanchanaburi',rg:'west'},{id:'ratchaburi',th:'ราชบุรี',en:'Ratchaburi',rg:'west'},
  {id:'phetchaburi',th:'เพชรบุรี',en:'Phetchaburi',rg:'west'},{id:'prachuapkhirikhan',th:'ประจวบคีรีขันธ์',en:'Prachuap Khiri Khan',rg:'west'},
  {id:'chumphon',th:'ชุมพร',en:'Chumphon',rg:'south'},{id:'ranong',th:'ระนอง',en:'Ranong',rg:'south'},
  {id:'suratthani',th:'สุราษฎร์ธานี',en:'Surat Thani',rg:'south'},{id:'nakhonsithammarat',th:'นครศรีธรรมราช',en:'Nakhon Si Thammarat',rg:'south'},
  {id:'phatthalung',th:'พัทลุง',en:'Phatthalung',rg:'south'},{id:'songkhla',th:'สงขลา',en:'Songkhla',rg:'south'},
  {id:'satun',th:'สตูล',en:'Satun',rg:'south'},{id:'trang',th:'ตรัง',en:'Trang',rg:'south'},
  {id:'phangnga',th:'พังงา',en:'Phang Nga',rg:'south'},{id:'phuket',th:'ภูเก็ต',en:'Phuket',rg:'south'},
  {id:'krabi',th:'กระบี่',en:'Krabi',rg:'south'},{id:'yala',th:'ยะลา',en:'Yala',rg:'south'},
  {id:'pattani',th:'ปัตตานี',en:'Pattani',rg:'south'},{id:'narathiwat',th:'นราธิวาส',en:'Narathiwat',rg:'south'},
];
const cropById = (id) => CROPS.find((c) => c.id === id);
const provById = (id) => PROVINCES.find((p) => p.id === id);

const CROPS = [
  { id:'durian', th:'ทุเรียน', en:'Durian', unit:{th:'บาท/กก.',en:'THB/kg'}, base:150, dec:1, season:[1.28,1.22,1.15,0.95,0.78,0.76,0.84,0.95,1.02,1.1,1.16,1.22], harvest:[3,9], peak:[4,5,6], grades:true },
  { id:'rubber', th:'ยางพารา', en:'Rubber', unit:{th:'บาท/กก.',en:'THB/kg'}, base:68, dec:2, season:[1.06,1.04,1.0,0.96,0.95,0.97,1.0,1.02,1.04,1.06,1.07,1.07], harvest:[1,12], peak:[], grades:false },
  { id:'cassava', th:'มันสำปะหลัง', en:'Cassava', unit:{th:'บาท/กก.',en:'THB/kg'}, base:2.6, dec:2, season:[1.02,1.04,1.06,1.05,1.02,1.0,0.97,0.96,0.97,0.99,1.0,1.01], harvest:[1,12], peak:[3,4,5], grades:false },
  { id:'rice', th:'ข้าว', en:'Rice', unit:{th:'บาท/กก.',en:'THB/kg'}, base:12.5, dec:2, season:[1.04,1.0,0.98,1.02,1.06,1.08,1.05,1.0,0.97,0.99,1.02,1.05], harvest:[1,12], peak:[11,12,1,4,5], grades:false },
  { id:'maize', th:'ข้าวโพดเลี้ยงสัตว์', en:'Maize', unit:{th:'บาท/กก.',en:'THB/kg'}, base:10.5, dec:2, season:[1.05,1.03,1.0,0.98,1.0,1.03,1.05,1.06,1.04,1.02,1.0,1.03], harvest:[1,12], peak:[5,6,7,8], grades:false },
  { id:'sugarcane', th:'อ้อย', en:'Sugarcane', unit:{th:'บาท/ตัน',en:'THB/tonne'}, base:1050, dec:0, season:[1.15,1.1,1.02,0.98,0.95,0.96,1.0,1.05,1.1,1.14,1.16,1.16], harvest:[12,4], peak:[1,2,3], grades:false },
  { id:'palm', th:'ปาล์มน้ำมัน', en:'Oil palm', unit:{th:'บาท/กก.',en:'THB/kg'}, base:5.8, dec:2, season:[1.06,1.05,1.03,1.0,0.97,0.96,0.97,0.99,1.0,1.02,1.04,1.06], harvest:[1,12], peak:[], grades:false },
  { id:'rambutan', th:'เงาะ', en:'Rambutan', unit:{th:'บาท/กก.',en:'THB/kg'}, base:26, dec:1, season:[1.3,1.25,1.18,1.0,0.85,0.9,1.0,1.12,1.2,1.28,1.32,1.32], harvest:[5,8], peak:[6,7], grades:false },
  { id:'mangosteen', th:'มังคุด', en:'Mangosteen', unit:{th:'บาท/กก.',en:'THB/kg'}, base:62, dec:1, season:[1.35,1.3,1.2,1.0,0.85,0.92,1.05,1.18,1.26,1.32,1.36,1.36], harvest:[5,9], peak:[6,7,8], grades:false },
  { id:'longan', th:'ลำไย', en:'Longan', unit:{th:'บาท/กก.',en:'THB/kg'}, base:36, dec:1, season:[1.05,1.0,0.95,0.9,0.95,1.0,1.08,1.15,1.18,1.15,1.1,1.07], harvest:[7,9], peak:[8,9], grades:false },
];
const REGIONS = { north:{th:'ภาคเหนือ',en:'North'}, ne:{th:'ภาคอีสาน',en:'Northeast'}, central:{th:'ภาคกลาง',en:'Central'}, east:{th:'ภาคตะวันออก',en:'East'}, west:{th:'ภาคตะวันตก',en:'West'}, south:{th:'ภาคใต้',en:'South'} };

/* Strings needed for bot messages (subset of app.js T). */
const T = {
  th: {
    title:'gracia · รู้ทันราคา', note:'ราคาจริงจากหน่วยงานราชการ (data.go.th / ธปท.) อัปเดตอัตโนมัติ',
    noteMock:'ค่าประมาณจากแบบจำลองฤดูกาล · ยังไม่มีข้อมูลราคาราชการสำหรับจังหวัด/พืชนี้ ตรวจสอบตลาดกลางในพื้นที่ก่อนตัดสินใจ',
    todayLbl:'วันนี้', baht:'บาท/หน่วย', gradeLbl:'เกรด', last5w:'เทียบ 5 สัปดาห์ก่อน',
    nowTrendUp:'ขยับขึ้น', nowTrendDown:'ขยับลง', nowTrendFlat:'ทรงตัว',
    supplyRising:'ผลผลิตกำลังเพิ่ม', supplyPeak:'ผลผลิตพีค', supplyEasing:'ผลผลิตเริ่มลด', supplyNormal:'ผลผลิตคงที่ตามฤดูกาล',
    harvestYes:'อยู่ในช่วงเก็บเกี่ยว', harvestNo:'นอกช่วงเก็บเกี่ยว', harvestAll:'เก็บได้ตลอดปี',
    peakIn:'พีคอีก {m} เดือน', peakNow:'ถึงพีคในเดือนนี้',
    weatherWet:'ฝนมาก ระวังคุณภาพ', weatherNormal:'สภาพอากาศปกติ', weatherDry:'แห้งดี เหมาะเก็บ',
    recSell:'เก็บเกี่ยว / ขายตอนนี้', recWait:'รอ 3–5 วัน', recRecover:'ราคากำลังฟื้นตัว · รอผลแก่เต็มที่',
    confHigh:'สูง', confMedHigh:'ปานกลาง–สูง', confMed:'ปานกลาง', confMedLow:'ปานกลาง–ต่ำ',
    momUp:'ราคา 5 สัปดาห์ล่าสุดขยับขึ้น', momDown:'ราคา 5 สัปดาห์ล่าสุดลดลงต่อเนื่อง', momFlat:'ราคา 5 สัปดาห์ล่าสุดทรงตัว',
    recKicker:'คำแนะนำ', confPrefix:'ความเชื่อมั่น', reasonTitle:'เหตุผล 4 ปัจจัย',
    range26:'ช่วง 26 สัปดาห์', minLbl:'ต่ำสุด', maxLbl:'สูงสุด', avgLbl:'เฉลี่ย',
    sig1n:'โมเมนตัมราคา', sig2n:'ปริมาณผลผลิต', sig3n:'ช่วงเก็บเกี่ยว', sig4n:'สภาพอากาศ',
    verdict:'คำแนะนำ', price:'ราคา', hint:'ส่งคำสั่ง "ราคา <จังหวัด> <พืช>" เช่น "ราคา ระยอง ทุเรียน" หรือ "price Rayong durian"',
    helpTitle:'วิธีใช้บอท gracia', helpBody:'ส่งข้อความต่อไปนี้ได้เลย:\n\n• ราคา ระยอง ทุเรียน — ดูราคา+คำแนะนำ (ใส่เกรดได้: "เกรด B")\n• ราคา จันทบุรี มังคุด เกรด C\n• price chanthaburi mangosteen — ภาษาอังกฤษ\n• รายงาน 150 ระยอง ทุเรียน — ส่งรายงานราคาที่ขายได้\n• ช่วย / help — ดูคำสั่งทั้งหมด\n\nครอบคลุม 77 จังหวัด 10 พืชหลัก',
    unknown:'ไม่เข้าใจคำสั่ง ลองพิมพ์ "ช่วย" เพื่อดูวิธีใช้',
    welcome:'สวัสดีครับ ยินดีต้อนรับสู่บอท gracia 🌾\nส่ง "ราคา ระยอง ทุเรียน" เพื่อดูราคาและคำแนะนำจังหวะขาย หรือ "ช่วย" เพื่อดูคำสั่งทั้งหมด',
    reportAsked:'ไม่ได้ราคา ลองพิมพ์: "รายงาน 150 ระยอง ทุเรียน"',
    reportSaved:'บันทึกรายงานแล้ว ขอบคุณครับ! ({prov} · {crop} ~{price} {unit})\nหมายเหตุ: ต้นแบบเก็บไว้ชั่วคราวในหน่วยความจำเซิร์ฟเวอร์',
    reportNote:'รายงาน',
    notFound:'ไม่พบจังหวัด/พืชที่พิมพ์ ลองใหม่ เช่น "ราคา ระยอง ทุเรียน"',
    quickPrice:'ราคาอีกครั้ง', quickHelp:'ช่วยเหลือ', quickReport:'รายงานราคา',
    joinBody:'สวัสดีครับ บอท gracia 🌾 เข้าร่วมกลุ่มแล้ว\nในกลุ่มนี้ต้อง @ บอทก่อนส่งคำสั่ง — กด @ แล้วเลือก gracia แล้วพิมพ์ เช่น "@gracia ราคา ระยอง ทุเรียน" เพื่อดูราคาและคำแนะนำ หรือ "@gracia ช่วย" เพื่อดูคำสั่งทั้งหมด'
  },
  en: {
    title:'gracia', note:'Real prices from government agencies (data.go.th / BOT), auto-refreshed',
    noteMock:'Seasonal estimate · no official price data for this province/crop yet. Check local markets before selling',
    todayLbl:'Today', baht:'per unit', gradeLbl:'Grade', last5w:'vs 5 weeks ago',
    nowTrendUp:'Rising', nowTrendDown:'Falling', nowTrendFlat:'Flat',
    supplyRising:'Supply rising', supplyPeak:'Supply at peak', supplyEasing:'Supply easing', supplyNormal:'Supply steady by season',
    harvestYes:'In harvest window', harvestNo:'Outside harvest window', harvestAll:'Harvestable year-round',
    peakIn:'Peak in {m} months', peakNow:'Peak this month',
    weatherWet:'Wet · watch quality', weatherNormal:'Normal weather', weatherDry:'Dry · good for harvest',
    recSell:'Harvest / sell now', recWait:'Wait 3–5 days', recRecover:'Price recovering · let fruit ripen',
    confHigh:'High', confMedHigh:'Moderate–High', confMed:'Moderate', confMedLow:'Moderate–Low',
    momUp:'Prices rose over the last 5 weeks', momDown:'Prices kept falling over the last 5 weeks', momFlat:'Prices were flat over the last 5 weeks',
    recKicker:'Verdict', confPrefix:'Confidence', reasonTitle:'4 signals',
    range26:'26-week range', minLbl:'Low', maxLbl:'High', avgLbl:'Avg',
    sig1n:'Price momentum', sig2n:'Seasonal supply', sig3n:'Harvest window', sig4n:'Weather',
    verdict:'Verdict', price:'Price', hint:'Send "price <province> <crop>", e.g. "price Rayong durian" or "ราคา ระยอง ทุเรียน"',
    helpTitle:'How to use the gracia bot', helpBody:'Send any of these:\n\n• ราคา ระยอง ทุเรียน — price + verdict (add grade: "เกรด B")\n• ราคา จันทบุรี มังคุด เกรด C\n• price chanthaburi mangosteen — English\n• รายงาน 150 ระยอง ทุเรียน — report your sold price\n• ช่วย / help — list commands\n\nCovers 77 provinces and 10 major crops',
    unknown:'Command not understood. Send "help" for usage.',
    welcome:'Welcome to the gracia bot 🌾\nSend "price Rayong durian" for a price + sell-timing verdict, or "help" for all commands.',
    reportAsked:'No price detected. Try: "รายงาน 150 ระยอง ทุเรียน"',
    reportSaved:'Report saved · thank you! ({prov} · {crop} ~{price} {unit})\nNote: prototype stores temporarily on the server.',
    reportNote:'Report',
    notFound:'Province/crop not found. Try "price Rayong durian"',
    quickPrice:'Check again', quickHelp:'Help', quickReport:'Report price',
    joinBody:'Hi! The gracia bot 🌾 has joined this group.\nMention the bot (tap @ and pick gracia), e.g. "@gracia price Rayong durian", for a price + sell-timing verdict, or "@gracia help" for all commands.'
  }
};

/* ================= ENGINE (mirror of app.js) ================= */
function hashStr(s){ let h = 0; for (let i = 0; i < s.length; i++){ h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; }
function rng01(seedKey){
  let h = hashStr(seedKey);
  return function(){ h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
}
function priceAt(cropId, provId, grade, weekOfYear){
  const w = ((weekOfYear - 1) % 52) + 1;
  const m = Math.min(12, Math.max(1, Math.floor((w - 1) / 4.33) + 1));
  const c = cropById(cropId), p = provById(provId);
  const gm = c.grades ? (GRADES[grade] || 1) : 1;
  const r = rng01(cropId + ':' + provId + ':' + grade);
  const n = 0.05 * Math.sin(w * 0.9 + r() * 6.28) + 0.035 * Math.sin(w * 2.3 + r() * 6.28);
  return c.base * gm * c.season[m - 1] * (REGION_FACTOR[p.rg] || 1) * (1 + n);
}
function seriesFor(cropId, provId, grade){
  const a = [], f = [];
  for (let i = CUR_WEEK - 25; i <= CUR_WEEK; i++) a.push(priceAt(cropId, provId, grade, i));
  for (let i = 1; i <= 4; i++) f.push(priceAt(cropId, provId, grade, CUR_WEEK + i));
  return { a, f };
}
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function signals(cropId, provId, grade){
  const c = cropById(cropId);
  const s = seriesFor(cropId, provId, grade), N = s.a.length;
  const mom = (s.a[N - 1] - s.a[N - 6]) / s.a[N - 6];
  const momSt = mom > 0.03 ? 'up' : (mom < -0.03 ? 'down' : 'flat');
  const curM = new Date().getMonth() + 1;
  let supSt = 'normal';
  if (c.peak.length){
    const inP = c.peak.includes(curM);
    const before = curM < c.peak[0];
    const after = curM > c.peak[c.peak.length - 1];
    supSt = inP ? 'peak' : (before ? 'rising' : (after ? 'easing' : 'rising'));
  }
  let harvSt;
  if (c.harvest[0] === 1 && c.harvest[1] === 12) harvSt = 'all';
  else {
    const inH = c.harvest[0] <= c.harvest[1]
      ? (curM >= c.harvest[0] && curM <= c.harvest[1])
      : (curM >= c.harvest[0] || curM <= c.harvest[1]);
    harvSt = inH ? 'yes' : 'no';
  }
  let peakDist = null;
  if (c.peak.length){ let d = c.peak[0] - curM; if (d < 0) d += 12; peakDist = d; }
  const p = provById(provId);
  const wr = rng01('wx:' + p.id + ':' + c.id)();
  const wxSt = wr > 0.66 ? 'wet' : (wr < 0.33 ? 'dry' : 'normal');
  return { mom, momSt, supSt, harvSt, peakDist, wxSt, series: s };
}
function recommend(sg){
  let score = 0;
  if (sg.momSt === 'down') score -= 2; else if (sg.momSt === 'up') score += 2;
  if (sg.supSt === 'peak') score -= 1.5; else if (sg.supSt === 'easing') score += 1;
  if (sg.harvSt === 'no') score -= 0.5; else if (sg.harvSt === 'yes' && sg.supSt !== 'easing') score += 0.5;
  if (sg.wxSt === 'wet') score -= 0.5; else if (sg.wxSt === 'dry') score += 0.5;
  const rec = score <= -1.5 ? 'sell' : (score >= 1.5 ? 'recover' : 'wait');
  const confKey = Math.abs(score) >= 2.5 ? 'confHigh' : Math.abs(score) >= 1.5 ? 'confMedHigh' : Math.abs(score) >= 0.5 ? 'confMed' : 'confMedLow';
  return { rec, confKey };
}
const REC_KEY = { sell:'recSell', wait:'recWait', recover:'recRecover' };
function fmtValFor(v, cropId){
  const c = cropById(cropId);
  return (c.dec === 0 ? Math.round(v) : v.toFixed(c.dec));
}
function fmtDate(lang, d){
  try {
    return lang === 'th'
      ? d.toLocaleDateString('th-TH', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      : d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  } catch (e) { return ''; }
}

/* ================= PARSING ================= */
/* word-boundary regex for EN names (so "price" never matches "rice") */
function wordRe(s){
  return new RegExp('\\b' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
}
function findCrop(msg, low){
  const byEn = CROPS.slice().sort((a, b) => b.en.length - a.en.length);
  for (const c of byEn){ if (wordRe(c.en.toLowerCase()).test(low)) return c; }
  for (const c of CROPS){ if (low.includes(c.id)) return c; }
  const byTh = CROPS.slice().sort((a, b) => b.th.length - a.th.length);
  for (const c of byTh){ if (msg.includes(c.th)) return c; }
  return null;
}
function findProv(msg, low){
  const byTh = PROVINCES.slice().sort((a, b) => b.th.length - a.th.length || b.en.length - a.en.length);
  for (const p of byTh){
    if (msg.includes(p.th) || wordRe(p.en.toLowerCase()).test(low) || low.includes(p.id)) return p;
  }
  return null;
}
/* Returns { type:'price'|'help'|'report'|'unknown', prov, crop, grade, price, lang } */
function parseCommand(raw){
  let msg = (raw || '').trim();
  if (!msg) return { type:'unknown', lang:'th' };
  // strip leading @mention — in group chats LINE only delivers messages that
  // mention the bot, and the mention text ("@gracia ราคา ...") precedes the
  // actual command
  msg = msg.replace(/^@\S+/, '').trim();
  const low = msg.toLowerCase();
  const lang = ['rayong','durian','price','help','report','mangosteen','rubber','chanthaburi','mangosteen'].some((k) => low.includes(k)) ? 'en' : 'th';

  if (/^(ช่วย|help|\?|วิธีใช้)/.test(msg)) return { type:'help', lang };

  const isPrice = low.startsWith('ราคา') || low.startsWith('price');
  const isReport = low.startsWith('รายงาน') || low.startsWith('report');

  const crop = findCrop(msg, low);
  const prov = findProv(msg, low);
  let grade = 'A';
  const gm = msg.match(/เกรด\s*([a-dA-D])/);
  if (gm) grade = gm[1].toUpperCase();

  if (isReport){
    const pm = msg.match(/(\d{1,6}(?:[.,]\d{1,2})?)/);
    return { type:'report', prov: prov ? prov.id : 'rayong', crop: crop ? crop.id : 'durian', grade, price: pm ? parseFloat(pm[1].replace(',', '.')) : null, lang };
  }
  if (isPrice){
    if (!prov && !crop) return { type:'price', prov:'rayong', crop:'durian', grade, lang, hint: true };
    return { type:'price', prov: prov ? prov.id : 'rayong', crop: crop ? crop.id : 'durian', grade, lang };
  }
  return { type:'unknown', lang };
}

/* ================= REPLY BUILDERS ================= */
function flexColor(status){ return status === 'up' ? '#1F7A3D' : (status === 'down' ? '#B6472E' : '#8A6415'); }

function buildPriceReply(p, lang, liveMap){
  const t = T[lang], c = cropById(p.crop), prov = provById(p.prov);
  const sg = signals(p.crop, p.prov, p.grade), r = recommend(sg);
  const a = sg.series.a;
  const prev5 = a[a.length - 6];
  /* real official price when available (exact province → region → national) */
  let last = a[a.length - 1];
  let liveNote = '';
  if(liveMap){
    const rg = provById(p.prov) ? provById(p.prov).rg : null;
    const lr = liveMap[p.crop + '|' + p.prov] || (rg ? liveMap[p.crop + '|rg:' + rg] : null) || liveMap[p.crop + '|*'];
    if(lr && lr.price > 0){
      last = lr.price;
      liveNote = ' · ' + lr.source;
    }
  }
  const chg5 = (last - prev5) / prev5 * 100;
  const mn = Math.min.apply(null, a), mx = Math.max.apply(null, a);
  const av = a.reduce((x, y) => x + y, 0) / a.length;
  const cls = sg.momSt === 'up' ? 'up' : (sg.momSt === 'down' ? 'down' : 'flat');
  const pct = (chg5 > 0 ? '+' : '') + chg5.toFixed(1) + '%';
  const supTxt = t['supply' + cap(sg.supSt)];
  const peakTxt = sg.peakDist === null ? '' : (sg.peakDist === 0 ? ' · ' + t.peakNow : ' · ' + t.peakIn.replace('{m}', sg.peakDist));
  let harvTxt;
  if (sg.harvSt === 'all') harvTxt = t.harvestAll;
  else if (sg.harvSt === 'yes') harvTxt = t.harvestYes + (sg.peakDist === 0 ? ' · ' + t.peakNow : (sg.peakDist ? ' · ' + t.peakIn.replace('{m}', sg.peakDist) : ''));
  else harvTxt = t.harvestNo + (sg.peakDist ? ' · ' + t.peakIn.replace('{m}', sg.peakDist) : '');
  const gradeTxt = c.grades ? ' · ' + t.gradeLbl + ' ' + p.grade : '';

  const row = (label, value, weight) => ({
    type:'box', layout:'horizontal', contents:[
      { type:'text', text:label, flex:2, size:'xs', color:'#8A8A80', wrap:true },
      { type:'text', text:value, flex:3, size:'xs', color:'#1C2E20', wrap:true, align:'end' },
      { type:'text', text:weight, flex:1, size:'xs', color:'#C9922E', align:'end' }
    ], spacing:'sm'
  });

  const messages = [{
    type:'flex',
    altText: t.verdict + ': ' + c[lang] + ' ' + prov[lang] + ' ~' + fmtValFor(last, p.crop) + ' ' + c.unit[lang] + ' · ' + t[REC_KEY[r.rec]],
    contents: {
      type:'bubble',
      header: {
        type:'box', layout:'vertical', backgroundColor:'#2C4A24', paddingAll:'12px',
        contents:[
          { type:'text', text:t.title, size:'sm', weight:'bold', color:'#F3E3BC' },
          { type:'text', text:prov[lang] + ' · ' + c[lang] + gradeTxt + ' · ' + fmtDate(lang, new Date()), size:'xs', color:'#FFFFFF', wrap:true, margin:'2px' }
        ]
      },
      body: {
        type:'box', layout:'vertical', spacing:'sm',
        contents:[
          { type:'box', layout:'baseline', contents:[
            { type:'text', text:'~' + fmtValFor(last, p.crop), size:'xxl', weight:'bold', color:'#1C2E20' },
            { type:'text', text:c.unit[lang], size:'xs', color:'#6B6B5E', margin:'4px' }
          ]},
          { type:'text', text:t['nowTrend' + cap(sg.momSt)] + ' ' + pct + ' ' + t.last5w, size:'xs', color:flexColor(cls), weight:'bold', wrap:true },
          { type:'separator', margin:'sm' },
          { type:'text', text:t.recKicker + ': ' + t[REC_KEY[r.rec]], size:'md', weight:'bold', color:'#B6472E', wrap:true, margin:'sm' },
          { type:'text', text:t.confPrefix + ': ' + t[r.confKey], size:'xs', color:'#6B6B5E', margin:'2px' },
          { type:'separator', margin:'sm' },
          { type:'text', text:t.reasonTitle, size:'xs', weight:'bold', color:'#8A6415', margin:'sm' },
          row(t.sig1n + ' 40%', t['mom' + cap(sg.momSt)], '40%'),
          row(t.sig2n + ' 25%', supTxt + peakTxt, '25%'),
          row(t.sig3n + ' 20%', harvTxt, '20%'),
          row(t.sig4n + ' 15%', t['weather' + cap(sg.wxSt)], '15%'),
          { type:'separator', margin:'sm' },
          { type:'text', text:t.range26 + ': ' + t.minLbl + ' ~' + fmtValFor(mn, p.crop) + ' · ' + t.maxLbl + ' ~' + fmtValFor(mx, p.crop) + ' · ' + t.avgLbl + ' ~' + fmtValFor(av, p.crop), size:'xs', color:'#1C2E20', wrap:true, margin:'sm' },
          { type:'text', text: liveNote ? (t.note + liveNote) : t.noteMock, size:'xxs', color:'#9A9A8C', wrap:true, margin:'sm' }
        ]
      }
    },
    quickReply: {
      items: [
        { type:'action', action:{ type:'message', label:t.quickPrice, text:'ราคา ' + prov.th + ' ' + c.th } },
        { type:'action', action:{ type:'message', label:t.quickReport, text:'รายงาน ' + '150 ' + prov.th + ' ' + c.th } },
        { type:'action', action:{ type:'message', label:t.quickHelp, text:'ช่วย' } }
      ]
    }
  }];
  if (p.hint) messages.push({ type:'text', text:t.hint });
  return messages;
}

function buildHelpReply(lang){ return { type:'text', text:T[lang].helpBody }; }
function buildWelcomeReply(lang){ return { type:'text', text:T[lang].welcome }; }
function buildJoinReply(lang){ return { type:'text', text:T[lang].joinBody }; }
function buildUnknownReply(lang){ return { type:'text', text:T[lang].unknown }; }
function buildReportReply(p, lang){
  const t = T[lang], c = cropById(p.crop), prov = provById(p.prov);
  if (p.price === null || !(p.price > 0)) return { type:'text', text:t.reportAsked };
  return {
    type:'text',
    text: t.reportSaved
      .replace('{prov}', prov[lang]).replace('{crop}', c[lang])
      .replace('{price}', fmtValFor(p.price, p.crop)).replace('{unit}', c.unit[lang])
  };
}

/* Mockup/demo mode: run the exact same command→reply pipeline the LINE bot
   uses, and return the messages in the HTTP response (no LINE credentials).
   Powers the in-page chat simulator on line.html. */
function processDemo(text, liveMap){
  const cmd = parseCommand(text);
  let messages;
  if (cmd.type === 'price') messages = buildPriceReply(cmd, cmd.lang, liveMap);
  else if (cmd.type === 'help') messages = [buildHelpReply(cmd.lang)];
  else if (cmd.type === 'report'){ storeReport(cmd, cmd.lang); messages = [buildReportReply(cmd, cmd.lang)]; }
  else messages = [buildUnknownReply(cmd.lang)];
  return messages;
}

/* real prices from api/prices.js → lookup map (module cache makes this cheap) */
async function buildLiveMap(){
  try{
    /* Don't block the LINE reply forever on a cold start (upstream fetches can
       take ~5s). Wait up to 5s for the cache/refresh — usually instant because
       the website's /api/prices polling warms the shared module cache. */
    const live = await Promise.race([
      fetchPrices(),
      new Promise((resolve) => setTimeout(() => resolve(null), 5000))
    ]);
    if(!live) return null;
    const map = {};
    live.forEach(x => { map[x.crop + '|' + x.prov] = x; });
    return map;
  }catch(e){ return null; }
}

/* ================= LINE API ================= */
function verifySignature(raw, sig, secret){
  if (!sig || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('base64');
  return sig === expected;
}
async function sendReply(replyToken, messages){
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  const r = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ replyToken, messages })
  });
  if (!r.ok){
    const t = await r.text().catch(() => '');
    console.error('[line] reply failed HTTP ' + r.status + ': ' + t.slice(0, 300));
  }
}

/* push API: proactive send, no replyToken needed. No-op until a real
   LINE_CHANNEL_ACCESS_TOKEN is configured — scaffold only, nothing sends yet. */
async function sendPush(userId, messages){
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  const r = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ to: userId, messages })
  });
  if (!r.ok){
    const t = await r.text().catch(() => '');
    console.error('[line] push failed HTTP ' + r.status + ': ' + t.slice(0, 300));
  }
}

/* in-memory farmer reports — ponytail: prototype only; wiped on cold start.
   Upgrade path: Vercel Blob/KV or a database, then list reports on the site. */
const reports = [];
function storeReport(p, lang){
  reports.unshift({ p: p.prov, c: p.crop, price: p.price, date: fmtDate(lang, new Date()) });
  return reports.slice(0, 50);
}

/* in-memory LINE followers — ponytail: prototype only; per-instance and
   wiped on cold start, so this cannot back real push alerts as-is (no
   shared state across serverless instances). Placeholder until real
   persistence (Vercel KV/Blob or a DB) lands; LINE_CHANNEL_ACCESS_TOKEN
   stays unset, so no push actually sends yet regardless. */
const followers = [];
function storeFollower(userId){
  if (userId && !followers.includes(userId)) followers.push(userId);
  return followers;
}

/* ================= HANDLER ================= */
module.exports = async function handler(req, res){
  const configured = !!(process.env.LINE_CHANNEL_SECRET && process.env.LINE_CHANNEL_ACCESS_TOKEN);

  if (req.method === 'GET' || req.method === 'HEAD'){
    return res.status(200).json({ status: configured ? 'ok' : 'not-configured', bot: 'harvest-trend-line' });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  // raw body (needed for signature) — robust across Vercel runtimes.
  // Vercel's Node runtime pre-parses JSON into req.body and DRAINS the stream,
  // so the stream fallback would yield '' and every signature check would fail.
  // LINE sends compact JSON, so JSON.stringify(req.body) reproduces the bytes.
  let raw = '';
  if (typeof req.body === 'string') raw = req.body;
  else if (Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
  else if (req.body && typeof req.body === 'object') raw = JSON.stringify(req.body);
  else {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    raw = Buffer.concat(chunks).toString('utf8');
  }
  const sig = req.headers['x-line-signature'] || '';
  const secret = process.env.LINE_CHANNEL_SECRET || '';

  let body;
  try { body = JSON.parse(raw); } catch (e) { return res.status(400).json({ error: 'bad json' }); }

  /* demo mode: return the would-be replies as JSON (mockup without LINE).
     ponytail: skips signature on purpose so the public simulator works with no
     credentials; real LINE events always pass through signature verification. */
  if (body.demo){
    const text = (body.text != null ? String(body.text) : (body.message && body.message.text) || '');
    const liveMap = await buildLiveMap();
    return res.status(200).json({ ok: true, demo: true, messages: processDemo(text, liveMap) });
  }

  if (secret && !verifySignature(raw, sig, secret)){
    return res.status(401).json({ error: 'invalid signature' });
  }
  if (!configured) return res.status(200).json({ status: 'not-configured' });

  const liveMap = await buildLiveMap();

  for (const ev of (body.events || [])){
    try {
      if (ev.type === 'message' && ev.message.type === 'text'){
        const cmd = parseCommand(ev.message.text);
        let messages;
        if (cmd.type === 'price') messages = buildPriceReply(cmd, cmd.lang, liveMap);
        else if (cmd.type === 'help') messages = [buildHelpReply(cmd.lang)];
        else if (cmd.type === 'report'){ storeReport(cmd, cmd.lang); messages = [buildReportReply(cmd, cmd.lang)]; }
        else messages = [buildUnknownReply(cmd.lang)];
        if (ev.replyToken) await sendReply(ev.replyToken, messages);
      } else if (ev.type === 'join' && ev.replyToken){
        // bot invited into a group/room — greet members (console setting
        // "Allow bot to join group chats" must be ON or LINE auto-removes it)
        await sendReply(ev.replyToken, [buildJoinReply('th')]);
      } else if (ev.type === 'follow'){
        storeFollower(ev.source && ev.source.userId);
        if (ev.replyToken) await sendReply(ev.replyToken, [buildWelcomeReply('th')]);
      }
    } catch (e) { /* keep webhook alive; LINE retries nothing on 200 */ }
  }
  return res.status(200).json({ ok: true });
};

/* internals exported for tests (tests/line-bot.test.js) */
module.exports._internals = {
  parseCommand, buildPriceReply, buildHelpReply, buildWelcomeReply, buildJoinReply, buildUnknownReply,
  buildReportReply, verifySignature, priceAt, signals, recommend, storeReport,
  processDemo, sendPush, storeFollower, followers,
  PROVINCES, CROPS, T, REC_KEY, fmtValFor, CUR_WEEK
};
