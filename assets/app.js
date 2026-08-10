/*
  รู้ทันราคา · AgriTrend EEC — shared data + engine + header logic
  Loaded on every page before the page's own inline script.
  Contains: app state, localStorage helpers, the 77-province / 10-crop
  dataset, Thai+English strings, the mock pricing engine (signals +
  recommendation), and header controls (language, font size, current-nav
  highlight) shared across all pages. Page-specific rendering/event wiring
  lives in each page's own <script> block, not here.
*/
"use strict";
/* ---------- STATE + HELPERS ---------- */
const state = {
  lang:'th', prov:'rayong', crop:'durian', grade:'A',
  region:'all', query:'', fontSize:16
};
const $ = id => document.getElementById(id);
function hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i))>>>0; } return h; }
function rng01(seedKey){
  let h = hashStr(seedKey);
  return function(){
    h = (h*1664525 + 1013904223)>>>0;
    return h / 4294967296;
  };
}
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
const WATCH_KEY = 'rtp_watch_v2';
const REP_KEY = 'rtp_reports_v2';
const CFG_KEY = 'rtp_cfg_v2';
function toast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(()=>t.classList.remove('show'), 2600);
}
function todayInfo(){
  const d = new Date();
  return { m: d.getMonth()+1, date: d };
}
function fmtDate(lang, d){
  try{
    return lang==='th'
      ? d.toLocaleDateString('th-TH', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
      : d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }catch(e){
    return lang==='th' ? 'วันจันทร์ที่ 10 สิงหาคม 2569' : 'Monday, 10 August 2026';
  }
}
function monthName(lang, m){ // m: 1..12
  return T[lang].monthsShort[m-1];
}
/* ---------- PROVINCES: NORTH (17) ---------- */
const PROVINCES = [
  {id:'chiangmai',th:'เชียงใหม่',en:'Chiang Mai',rg:'north',lat:18.79,lng:98.98,main:['rice','longan','maize']},
  {id:'chiangrai',th:'เชียงราย',en:'Chiang Rai',rg:'north',lat:19.91,lng:99.83,main:['rice','maize','longan']},
  {id:'lampang',th:'ลำปาง',en:'Lampang',rg:'north',lat:18.29,lng:99.49,main:['rice','sugarcane','cassava']},
  {id:'lamphun',th:'ลำพูน',en:'Lamphun',rg:'north',lat:18.57,lng:99.01,main:['longan','rice']},
  {id:'phrae',th:'แพร่',en:'Phrae',rg:'north',lat:18.14,lng:100.14,main:['rice','maize','longan']},
  {id:'nan',th:'น่าน',en:'Nan',rg:'north',lat:18.78,lng:100.77,main:['rice','maize','longan']},
  {id:'phayao',th:'พะเยา',en:'Phayao',rg:'north',lat:19.17,lng:99.91,main:['rice','maize','longan']},
  {id:'uttaradit',th:'อุตรดิตถ์',en:'Uttaradit',rg:'north',lat:17.62,lng:100.10,main:['durian','rice','cassava']},
  {id:'sukhothai',th:'สุโขทัย',en:'Sukhothai',rg:'north',lat:17.01,lng:99.82,main:['rice','sugarcane','cassava']},
  {id:'phitsanulok',th:'พิษณุโลก',en:'Phitsanulok',rg:'north',lat:16.82,lng:100.26,main:['rice','sugarcane','cassava']},
  {id:'phichit',th:'พิจิตร',en:'Phichit',rg:'north',lat:16.44,lng:100.35,main:['rice','sugarcane']},
  {id:'kamphaengphet',th:'กำแพงเพชร',en:'Kamphaeng Phet',rg:'north',lat:16.48,lng:99.52,main:['rice','sugarcane','cassava']},
  {id:'phetchabun',th:'เพชรบูรณ์',en:'Phetchabun',rg:'north',lat:16.42,lng:101.16,main:['maize','cassava','rice']},
  {id:'tak',th:'ตาก',en:'Tak',rg:'north',lat:16.88,lng:99.13,main:['rice','sugarcane','maize']},
  {id:'nakhonsawan',th:'นครสวรรค์',en:'Nakhon Sawan',rg:'north',lat:15.70,lng:100.14,main:['rice','sugarcane','cassava']},
  {id:'uthaithani',th:'อุทัยธานี',en:'Uthai Thani',rg:'north',lat:15.38,lng:100.02,main:['rice','sugarcane']},
  {id:'maehongson',th:'แม่ฮ่องสอน',en:'Mae Hong Son',rg:'north',lat:19.30,lng:97.97,main:['rice','maize']},
];

/* ---------- PROVINCES: NORTHEAST (20) ---------- */
PROVINCES.push(
  {id:'nakhonratchasima',th:'นครราชสีมา',en:'Nakhon Ratchasima',rg:'ne',lat:14.97,lng:102.10,main:['rice','cassava','maize','sugarcane']},
  {id:'buriram',th:'บุรีรัมย์',en:'Buriram',rg:'ne',lat:14.99,lng:103.10,main:['rice','cassava','sugarcane']},
  {id:'surin',th:'สุรินทร์',en:'Surin',rg:'ne',lat:14.88,lng:103.49,main:['rice','cassava']},
  {id:'srisaket',th:'ศรีสะเกษ',en:'Sisaket',rg:'ne',lat:15.12,lng:104.33,main:['rice','cassava','rubber']},
  {id:'ubon',th:'อุบลราชธานี',en:'Ubon Ratchathani',rg:'ne',lat:15.24,lng:104.85,main:['rice','cassava','rubber']},
  {id:'yasothon',th:'ยโสธร',en:'Yasothon',rg:'ne',lat:15.79,lng:104.14,main:['rice','cassava']},
  {id:'amnatcharoen',th:'อำนาจเจริญ',en:'Amnat Charoen',rg:'ne',lat:15.86,lng:104.63,main:['rice','rubber','cassava']},
  {id:'mukdahan',th:'มุกดาหาร',en:'Mukdahan',rg:'ne',lat:16.54,lng:104.72,main:['rice','rubber','cassava']},
  {id:'nakhonphanom',th:'นครพนม',en:'Nakhon Phanom',rg:'ne',lat:17.41,lng:104.78,main:['rice','rubber']},
  {id:'sakonnakhon',th:'สกลนคร',en:'Sakon Nakhon',rg:'ne',lat:17.17,lng:104.15,main:['rice','rubber','cassava']},
);

PROVINCES.push(
  {id:'kalasin',th:'กาฬสินธุ์',en:'Kalasin',rg:'ne',lat:16.43,lng:103.51,main:['rice','cassava','sugarcane']},
  {id:'khonkaen',th:'ขอนแก่น',en:'Khon Kaen',rg:'ne',lat:16.44,lng:102.83,main:['rice','sugarcane','cassava']},
  {id:'mahasarakham',th:'มหาสารคาม',en:'Maha Sarakham',rg:'ne',lat:16.18,lng:103.30,main:['rice','sugarcane','cassava']},
  {id:'roiet',th:'ร้อยเอ็ด',en:'Roi Et',rg:'ne',lat:16.05,lng:103.65,main:['rice','cassava']},
  {id:'loei',th:'เลย',en:'Loei',rg:'ne',lat:17.49,lng:101.73,main:['maize','rubber','rice']},
  {id:'nongbualamphu',th:'หนองบัวลำภู',en:'Nong Bua Lamphu',rg:'ne',lat:17.20,lng:102.44,main:['rice','rubber']},
  {id:'udonthani',th:'อุดรธานี',en:'Udon Thani',rg:'ne',lat:17.41,lng:102.79,main:['rice','cassava','rubber']},
  {id:'nongkhai',th:'หนองคาย',en:'Nong Khai',rg:'ne',lat:17.88,lng:102.75,main:['rice','rubber']},
  {id:'buengkan',th:'บึงกาฬ',en:'Bueng Kan',rg:'ne',lat:18.36,lng:103.65,main:['rice','rubber']},
  {id:'chaiyaphum',th:'ชัยภูมิ',en:'Chaiyaphum',rg:'ne',lat:15.81,lng:102.03,main:['rice','cassava','sugarcane','maize']},
);
/* ---------- PROVINCES: CENTRAL (14) ---------- */
PROVINCES.push(
  {id:'bangkok',th:'กรุงเทพมหานคร',en:'Bangkok',rg:'central',lat:13.76,lng:100.50,main:['rice']},
  {id:'nonthaburi',th:'นนทบุรี',en:'Nonthaburi',rg:'central',lat:13.86,lng:100.51,main:['rice','durian']},
  {id:'pathumthani',th:'ปทุมธานี',en:'Pathum Thani',rg:'central',lat:14.02,lng:100.53,main:['rice']},
  {id:'ayutthaya',th:'พระนครศรีอยุธยา',en:'Ayutthaya',rg:'central',lat:14.35,lng:100.58,main:['rice']},
  {id:'angthong',th:'อ่างทอง',en:'Ang Thong',rg:'central',lat:14.59,lng:100.45,main:['rice']},
  {id:'singburi',th:'สิงห์บุรี',en:'Sing Buri',rg:'central',lat:14.89,lng:100.41,main:['rice']},
  {id:'chainat',th:'ชัยนาท',en:'Chai Nat',rg:'central',lat:15.19,lng:100.12,main:['rice']},
  {id:'lophuri',th:'ลพบุรี',en:'Lopburi',rg:'central',lat:14.80,lng:100.65,main:['rice','sugarcane','maize']},
  {id:'saraburi',th:'สระบุรี',en:'Saraburi',rg:'central',lat:14.53,lng:100.92,main:['maize','sugarcane','rice']},
  {id:'suphanburi',th:'สุพรรณบุรี',en:'Suphan Buri',rg:'central',lat:14.47,lng:100.12,main:['rice','sugarcane','cassava']},
  {id:'nakhonpathom',th:'นครปฐม',en:'Nakhon Pathom',rg:'central',lat:13.82,lng:100.06,main:['rice','sugarcane']},
  {id:'samutsakhon',th:'สมุทรสาคร',en:'Samut Sakhon',rg:'central',lat:13.55,lng:100.28,main:['rice']},
  {id:'samutsongkhram',th:'สมุทรสงคราม',en:'Samut Songkhram',rg:'central',lat:13.41,lng:100.00,main:['rice']},
  {id:'samutprakan',th:'สมุทรปราการ',en:'Samut Prakan',rg:'central',lat:13.60,lng:100.61,main:['rice']},
);

/* ---------- PROVINCES: EAST (8) + WEST (4) ---------- */
PROVINCES.push(
  {id:'chonburi',th:'ชลบุรี',en:'Chonburi',rg:'east',lat:13.36,lng:100.98,main:['cassava','sugarcane','durian']},
  {id:'chachoengsao',th:'ฉะเชิงเทรา',en:'Chachoengsao',rg:'east',lat:13.69,lng:101.07,main:['rice','cassava','durian']},
  {id:'rayong',th:'ระยอง',en:'Rayong',rg:'east',lat:12.68,lng:101.28,main:['durian','rambutan','mangosteen','cassava','rubber']},
  {id:'chanthaburi',th:'จันทบุรี',en:'Chanthaburi',rg:'east',lat:12.61,lng:102.10,main:['durian','rambutan','mangosteen','rubber']},
  {id:'trat',th:'ตราด',en:'Trat',rg:'east',lat:12.24,lng:102.51,main:['durian','rambutan','mangosteen','rubber']},
  {id:'prachinburi',th:'ปราจีนบุรี',en:'Prachinburi',rg:'east',lat:14.05,lng:101.37,main:['rice','cassava','sugarcane','durian']},
  {id:'sakaew',th:'สระแก้ว',en:'Sa Kaeo',rg:'east',lat:13.82,lng:102.07,main:['cassava','sugarcane']},
  {id:'nakhonnayok',th:'นครนายก',en:'Nakhon Nayok',rg:'east',lat:14.20,lng:101.21,main:['rice','durian']},
  {id:'kanchanaburi',th:'กาญจนบุรี',en:'Kanchanaburi',rg:'west',lat:14.02,lng:99.53,main:['sugarcane','cassava','rice']},
  {id:'ratchaburi',th:'ราชบุรี',en:'Ratchaburi',rg:'west',lat:13.53,lng:99.81,main:['sugarcane','rice']},
  {id:'phetchaburi',th:'เพชรบุรี',en:'Phetchaburi',rg:'west',lat:13.11,lng:99.94,main:['sugarcane','rice']},
  {id:'prachuapkhirikhan',th:'ประจวบคีรีขันธ์',en:'Prachuap Khiri Khan',rg:'west',lat:11.81,lng:99.80,main:['palm','rubber']},
);

/* ---------- PROVINCES: SOUTH (14) ---------- */
PROVINCES.push(
  {id:'chumphon',th:'ชุมพร',en:'Chumphon',rg:'south',lat:10.49,lng:99.18,main:['rubber','palm','durian','rambutan']},
  {id:'ranong',th:'ระนอง',en:'Ranong',rg:'south',lat:9.96,lng:98.63,main:['rubber','palm']},
  {id:'suratthani',th:'สุราษฎร์ธานี',en:'Surat Thani',rg:'south',lat:9.14,lng:99.33,main:['rubber','palm','durian','mangosteen']},
  {id:'nakhonsithammarat',th:'นครศรีธรรมราช',en:'Nakhon Si Thammarat',rg:'south',lat:8.43,lng:99.96,main:['rubber','palm','rice']},
  {id:'phatthalung',th:'พัทลุง',en:'Phatthalung',rg:'south',lat:7.62,lng:100.07,main:['rubber','rice']},
  {id:'songkhla',th:'สงขลา',en:'Songkhla',rg:'south',lat:7.19,lng:100.60,main:['rubber','rice','palm']},
  {id:'satun',th:'สตูล',en:'Satun',rg:'south',lat:6.62,lng:100.07,main:['rubber','palm']},
  {id:'trang',th:'ตรัง',en:'Trang',rg:'south',lat:7.56,lng:99.61,main:['rubber','palm','durian']},
  {id:'phangnga',th:'พังงา',en:'Phang Nga',rg:'south',lat:8.45,lng:98.52,main:['rubber','palm','durian']},
  {id:'phuket',th:'ภูเก็ต',en:'Phuket',rg:'south',lat:7.88,lng:98.39,main:['rubber']},
  {id:'krabi',th:'กระบี่',en:'Krabi',rg:'south',lat:8.09,lng:98.91,main:['palm','rubber']},
  {id:'yala',th:'ยะลา',en:'Yala',rg:'south',lat:6.54,lng:101.28,main:['rubber','rice']},
  {id:'pattani',th:'ปัตตานี',en:'Pattani',rg:'south',lat:6.87,lng:101.25,main:['rubber','rice']},
  {id:'narathiwat',th:'นราธิวาส',en:'Narathiwat',rg:'south',lat:6.43,lng:101.82,main:['rubber','rice','palm']},
);
/* ---------- REGIONS ---------- */
const REGIONS = {
  north:   { th:'ภาคเหนือ',   en:'North' },
  ne:      { th:'ภาคอีสาน',   en:'Northeast' },
  central: { th:'ภาคกลาง',    en:'Central' },
  east:    { th:'ภาคตะวันออก', en:'East' },
  west:    { th:'ภาคตะวันตก',  en:'West' },
  south:   { th:'ภาคใต้',     en:'South' }
};
const REG_COLOR = {
  north:'#2E5C9A', ne:'#B6472E', central:'#C9922E',
  east:'#2C4A24', west:'#4A7A3D', south:'#8A6415'
};

/* ---------- CROPS (10) ---------- */
const GRADES = { A:1.15, B:1.0, C:0.85, D:0.7 };
const CROPS = [
  { id:'durian', th:'ทุเรียน', en:'Durian', unit:{th:'บาท/กก.',en:'THB/kg'}, base:150, dec:1,
    season:[1.28,1.22,1.15,0.95,0.78,0.76,0.84,0.95,1.02,1.1,1.16,1.22],
    harvest:[3,9], peak:[4,5,6], grades:true,
    main:['uttaradit','nonthaburi','chachoengsao','nakhonnayok','rayong','chanthaburi','trat','prachinburi','chonburi','chumphon','ranong','suratthani','nakhonsithammarat','trang','phangnga','phuket'],
    tip:{ th:'เช็ก %เนื้อแห้งก่อนตัด (จุดตรวจก่อนตัด 53 จุด ภาคตะวันออก) · ผลแก่เต็มที่ได้เกรดและราคาที่ดีกว่า', en:'Check % dry matter before cutting (53 pre-harvest checkpoints in the East) · fully ripe fruit earns a better grade and price.' } },
  { id:'rubber', th:'ยางพารา', en:'Rubber', unit:{th:'บาท/กก.',en:'THB/kg'}, base:68, dec:2,
    season:[1.06,1.04,1.0,0.96,0.95,0.97,1.0,1.02,1.04,1.06,1.07,1.07],
    harvest:[1,12], peak:[], grades:false,
    main:['srisaket','ubon','amnatcharoen','mukdahan','nakhonphanom','sakonnakhon','loei','nongbualamphu','udonthani','nongkhai','buengkan','rayong','chanthaburi','trat','prachuapkhirikhan','chumphon','ranong','suratthani','nakhonsithammarat','phatthalung','songkhla','satun','trang','phangnga','phuket','krabi','yala','pattani','narathiwat'],
    tip:{ th:'ราคายางอ่อนไหวกับตลาดโลกและค่าเงิน · ฝนตกหนักช่วงกรีดลดปริมาณน้ำยาง กดดันราคาได้', en:'Rubber prices track world markets and the baht · heavy rain during tapping cuts latex volume and can pressure prices.' } },
  { id:'cassava', th:'มันสำปะหลัง', en:'Cassava', unit:{th:'บาท/กก.',en:'THB/kg'}, base:2.6, dec:2,
    season:[1.02,1.04,1.06,1.05,1.02,1.0,0.97,0.96,0.97,0.99,1.0,1.01],
    harvest:[1,12], peak:[3,4,5], grades:false,
    main:['lampang','uttaradit','sukhothai','phitsanulok','kamphaengphet','phetchabun','tak','nakhonsawan','nakhonratchasima','buriram','surin','srisaket','ubon','yasothon','amnatcharoen','mukdahan','sakonnakhon','kalasin','khonkaen','mahasarakham','roiet','udonthani','chaiyaphum','suphanburi','chonburi','chachoengsao','prachinburi','sakaew','kanchanaburi'],
    tip:{ th:'ขุดตามอายุแปลง (8–12 เดือน) · เปอร์เซ็นต์แป้ง (สตาร์ช) สูงขึ้นตามอายุ ช่วงฝนชุกหัวสดเน่าเสียง่าย', en:'Harvest at 8–12 months · starch content rises with age; wet-season harvest risks rot.' } },
  { id:'rice', th:'ข้าว', en:'Rice', unit:{th:'บาท/กก.',en:'THB/kg'}, base:12.5, dec:2,
    season:[1.04,1.0,0.98,1.02,1.06,1.08,1.05,1.0,0.97,0.99,1.02,1.05],
    harvest:[1,12], peak:[11,12,1,4,5], grades:false,
    main:['*'],
    tip:{ th:'ข้าวเปลือกความชื้นต่ำได้ราคาดีกว่า · ตากให้ได้ความชื้น 14–15% ก่อนขาย นาปรังออกตลาดช่วง เม.ย.–พ.ค.', en:'Low-moisture paddy fetches more · dry to 14–15% before selling. Off-season rice floods the market Apr–May.' } },
  { id:'maize', th:'ข้าวโพดเลี้ยงสัตว์', en:'Maize', unit:{th:'บาท/กก.',en:'THB/kg'}, base:10.5, dec:2,
    season:[1.05,1.03,1.0,0.98,1.0,1.03,1.05,1.06,1.04,1.02,1.0,1.03],
    harvest:[1,12], peak:[5,6,7,8], grades:false,
    main:['chiangmai','chiangrai','phrae','nan','phayao','maehongson','tak','phetchabun','lophuri','saraburi','nakhonratchasima','chaiyaphum','loei'],
    tip:{ th:'ฝักแห้งดีเก็บได้นาน · ระวังราคาช่วงผลผลิตพร้อมกันเดือน มิ.ย.–ส.ค.', en:'Well-dried cobs store well · watch the price dip when harvests align Jun–Aug.' } },
  { id:'sugarcane', th:'อ้อย', en:'Sugarcane', unit:{th:'บาท/ตัน',en:'THB/tonne'}, base:1050, dec:0,
    season:[1.15,1.1,1.02,0.98,0.95,0.96,1.0,1.05,1.1,1.14,1.16,1.16],
    harvest:[12,4], peak:[1,2,3], grades:false,
    main:['lampang','sukhothai','phitsanulok','phichit','kamphaengphet','nakhonsawan','uthaithani','khonkaen','kalasin','mahasarakham','chaiyaphum','buriram','suphanburi','nakhonpathom','kanchanaburi','ratchaburi','phetchaburi','chonburi','sakaew','lophuri','saraburi','tak'],
    tip:{ th:'ราคาอ้อยผูกกับความหวาน (ซีซีเอส) · ตัดช่วงหน้าแล้งได้ซีซีเอสสูง ราคาดี', en:'Sugarcane value tracks sweetness (CCS) · dry-season cutting gives higher CCS and better prices.' } },
  { id:'palm', th:'ปาล์มน้ำมัน', en:'Oil palm', unit:{th:'บาท/กก.',en:'THB/kg'}, base:5.8, dec:2,
    season:[1.06,1.05,1.03,1.0,0.97,0.96,0.97,0.99,1.0,1.02,1.04,1.06],
    harvest:[1,12], peak:[], grades:false,
    main:['prachuapkhirikhan','chumphon','ranong','suratthani','nakhonsithammarat','phatthalung','songkhla','satun','trang','phangnga','krabi','narathiwat'],
    tip:{ th:'ทะลายสดส่งโรงสกัดภายใน 24 ชม. · เปอร์เซ็นต์น้ำมันลดลงทุกวันที่ทิ้งไว้', en:'Send fresh bunches to the mill within 24 hours · oil yield drops every day they sit.' } },
  { id:'rambutan', th:'เงาะ', en:'Rambutan', unit:{th:'บาท/กก.',en:'THB/kg'}, base:26, dec:1,
    season:[1.3,1.25,1.18,1.0,0.85,0.9,1.0,1.12,1.2,1.28,1.32,1.32],
    harvest:[5,8], peak:[6,7], grades:false,
    main:['rayong','chanthaburi','trat','chumphon','suratthani','nakhonsithammarat','ranong'],
    tip:{ th:'เงาะเก็บหลังผลแก่ 105–110 วันหลังดอกบาน · พีคเดือน มิ.ย.–ก.ค. ราคามักต่ำสุด', en:'Harvest 105–110 days after bloom · the Jun–Jul peak usually brings the lowest prices.' } },
  { id:'mangosteen', th:'มังคุด', en:'Mangosteen', unit:{th:'บาท/กก.',en:'THB/kg'}, base:62, dec:1,
    season:[1.35,1.3,1.2,1.0,0.85,0.92,1.05,1.18,1.26,1.32,1.36,1.36],
    harvest:[5,9], peak:[6,7,8], grades:false,
    main:['rayong','chanthaburi','trat','chumphon','suratthani','nakhonsithammarat','ranong','trang'],
    tip:{ th:'มังคุดยางไหล (gamboge) ลดราคามาก · ตัดช่วงอากาศแห้ง ระวังอย่าให้ผลกระแทก', en:'Gamboge (yellow sap) cuts the price hard · harvest in dry weather and handle gently.' } },
  { id:'longan', th:'ลำไย', en:'Longan', unit:{th:'บาท/กก.',en:'THB/kg'}, base:36, dec:1,
    season:[1.05,1.0,0.95,0.9,0.95,1.0,1.08,1.15,1.18,1.15,1.1,1.07],
    harvest:[7,9], peak:[8,9], grades:false,
    main:['chiangmai','chiangrai','lamphun','lampang','phayao','nan'],
    tip:{ th:'ลำไยเกรด AA–C ราคาต่างกันมาก · คัดเกรดก่อนขาย ลำไยนอกฤดูราคาดีแต่ต้นทุนสูง', en:'Grades AA–C differ hugely in price · sort before selling; off-season longan pays more but costs more.' } }
];
const cropById = id => CROPS.find(c => c.id === id);
const provById = id => PROVINCES.find(p => p.id === id);
/* ---------- TH ---------- */
const T = {
th: {
  monthsShort:['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
  skip:'ข้ามไปยังเนื้อหาหลัก',
  heroEyebrow:'เครื่องมือช่วยตัดสินใจราคาพืชผล · ครอบคลุมทั่วประเทศ',
  heroTitle:'รู้ก่อนขาย ได้จังหวะที่ดีกว่า',
  heroSub:'เลือกจังหวัดและพืชของคุณ รับคำแนะนำจังหวะเก็บเกี่ยว/ขายพร้อมเหตุผลประกอบที่เข้าใจง่าย ภายใน 2 คลิก ไม่ต้องเป็นผู้เชี่ยวชาญ',
  heroStat1:'จังหวัดทั่วประเทศ', heroStat2:'พืชเศรษฐกิจหลัก', heroStat3:'สัญญาณวิเคราะห์ร่วม',
  heroCta:'เริ่มตรวจราคาเลย',
  shareBtn:'แชร์ผลลัพธ์', shareCopied:'คัดลอกผลลัพธ์แล้ว วางเพื่อแชร์ได้เลย',
  shareBody:'Harvest Trend · {prov} · {crop}: {verdict} (ราคาปัจจุบัน ~{price} {unit})',
  nav1:'ตรวจราคา', navPrice:'ราคา & แนวโน้ม', nav2:'รายงานราคา', nav3:'ติดตาม', nav4:'เกี่ยวกับ', lineNav:'บอท LINE',
  lineCtaTitle:'รับคำแนะนำผ่าน LINE', lineCtaBody:'เพิ่ม LINE OA แล้วส่งข้อความ "ราคา ระยอง ทุเรียน" รับคำแนะนำจังหวะขายทันที', lineCtaBtn:'ดูวิธีใช้งาน',
  shareLine:'แชร์ผ่าน LINE',
  how1:'เลือกจังหวัดของคุณ', how2:'เลือกพืชที่ปลูก', how3:'อ่านคำแนะนำ + เช็กกราฟราคา',
  mockNote:'ข้อมูลราคาในเว็บนี้เป็นข้อมูลจำลอง (mock data) เพื่อการใช้งานจริงของต้นแบบ · ราคาจากแบบจำลอง ไม่ใช่ราคาตลาดจริง ก่อนตัดสินใจขายควรเช็กข้อมูลหน่วยงานราชการหรือตลาดกลางในพื้นที่ด้วย',
  liveNote:'ราคาจริงจากหน่วยงานราชการ (data.go.th: สำนักงานจังหวัด / สำนักงานเศรษฐกิจการเกษตร + ธนาคารแห่งประเทศไทย) · อัปเดตอัตโนมัติทุก 10 วินาที · พื้นที่ที่ยังไม่มีข้อมูลราชการแสดงค่าประมาณจากแบบจำลองและมีป้ายกำกับ',
  liveBadgeLive:'🟢 ราคาจริงจากหน่วยงาน · อัปเดตล่าสุด {t} · ดึงอัตโนมัติทุก 10 วิ',
  liveBadgeOff:'🟡 ข้อมูลจำลอง (เชื่อมต่อราคาจริงไม่ได้) · จะกลับเป็นราคาจริงเมื่อระบบออนไลน์',
  liveBadgeFile:'🟡 ข้อมูลจำลอง · เปิดบนเว็บที่ deploy แล้วเพื่อดูราคาจริง (https://harvest-ecc.vercel.app)',
  liveRealLabel:'ราคาจริง · {src}',
  pickTitle:'เลือกจังหวัดของคุณ', pickSub:'พิมพ์ค้นหา กดภูมิภาค หรือใช้ตำแหน่ง GPS · ครอบคลุม 77 จังหวัด',
  searchPh:'ค้นหาจังหวัด เช่น ระยอง / Rayong', gpsBtn:'ใช้ตำแหน่งของฉัน',
  gpsBusy:'กำลังหาตำแหน่ง...', gpsFail:'ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาเลือกจังหวัดด้วยตนเอง',
  gpsDenied:'ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง · เปิดการตั้งค่าเบราว์เซอร์ > อนุญาตตำแหน่ง แล้วลองใหม่',
  gpsDeniedInApp:'เบราว์เซอร์ในแอป (LINE/Facebook) บล็อกตำแหน่ง · เปิดผ่าน Safari/Chrome แทน แล้วลองใหม่',
  gpsNoFix:'หาตำแหน่งไม่เจอ (GPS ช้า) · ลองอีกครั้ง หรือเลือกจังหวัดเอง',
  provEmpty:'ไม่พบจังหวัดที่ค้นหา ลองพิมพ์ชื่อใหม่', provCount:'{n} จังหวัด',
  cropTitle:'เลือกพืชที่ปลูก', cropSub:'เรียงพืชที่นิยมปลูกในพื้นที่ของคุณไว้ก่อน · ป้าย "พื้นที่หลัก" หมายถึงแหล่งผลิตสำคัญ',
  mainTag:'พื้นที่หลัก',
  recKicker:'คำแนะนำวันนี้', youAt:'คุณอยู่ที่', confPrefix:'ระดับความเชื่อมั่น:', confSuffix:'· จาก 4 สัญญาณ',
  watchAdd:'ติดตามราคานี้', watchAdded:'เพิ่มเข้ารายการติดตามแล้ว', watchExists:'อยู่ในรายการติดตามแล้ว', watchRemoved:'ลบออกจากรายการติดตามแล้ว',
  scrollReport:'รายงานราคาที่ขายได้', viewChart:'ดูกราฟราคา + สัญญาณ',
  sig1n:'โมเมนตัมราคา', sig2n:'ปริมาณผลผลิต', sig3n:'ช่วงเก็บเกี่ยว', sig4n:'สภาพอากาศ',
  priceTitleTpl:'แนวโน้มราคา {crop} · {prov}',
  priceSubTpl:'ราคาจำลองย้อนหลัง 26 สัปดาห์ + พยากรณ์ 4 สัปดาห์ (บาท/หน่วย) · สร้างจากแบบจำลองฤดูกาลของ {crop}',
  livePriceSubTpl:'ราคาย้อนหลัง 26 สัปดาห์ + พยากรณ์ 4 สัปดาห์ (บาท/หน่วย) · ยึดราคาจริงล่าสุดจากหน่วยงานราชการ · จุดย้อนหลังเป็นค่าประมาณตามฤดูกาลของ {crop}',
  legAct:'ราคาจำลองย้อนหลัง', legFore:'พยากรณ์ล่วงหน้า', legBand:'ช่วงคาดการณ์',
  todayLbl:'วันนี้', wk:'สัปดาห์ที่', baht:'บาท/หน่วย',
  chartAriaTpl:'กราฟราคา {crop} 26 สัปดาห์ พร้อมพยากรณ์ 4 สัปดาห์',
  chartNote:'ข้อมูลจำลองจากแบบจำลองฤดูกาล (mock) ไม่ใช่ราคาตลาดจริง · ใช้เป็นแนวทางศึกษาทิศทางเท่านั้น',
  nowTrendUp:'ขยับขึ้น', nowTrendDown:'ขยับลง', nowTrendFlat:'ทรงตัว', last5w:'เทียบ 5 สัปดาห์ก่อน',
  sigTitle:'สัญญาณ 4 ปัจจัย ที่ประมวลผลร่วมกัน',
  sigSub:'รวมเป็นคำแนะนำเดียวแบบ ensemble · ไม่มีสัญญาณใดตัดสินใจเพียงลำพัง กด "ทำไม" เพื่อดูเหตุผล',
  s1name:'1. โมเมนตัมราคา', s2name:'2. ปริมาณผลผลิตตามฤดูกาล', s3name:'3. ช่วงเก็บเกี่ยว', s4name:'4. สภาพอากาศ',
  why:'ทำไม',
  s1why:'เทียบราคาเฉลี่ย 5 สัปดาห์ล่าสุดกับ 5 สัปดาห์ก่อนหน้า ถ้าขยับขึ้นต่อเนื่องแสดงว่าแรงซื้อกลับมา ถ้าลดลงแสดงว่าแรงขายกดดันอยู่ · สัญญาณนี้มีน้ำหนักมากสุด (40%)',
  s2why:'ดูตำแหน่งของเดือนนี้เทียบกับช่วงผลผลิตพีคของพืชชนิดนี้ ยิ่งใกล้พีค ผลผลิตยิ่งล้นตลาด ยิ่งกดดันราคา',
  s3why:'ตรวจว่าวันนี้อยู่ในช่วงเก็บเกี่ยวของพืชหรือไม่ และห่างจากช่วงพีคกี่เดือน · ผลที่เก็บตรงช่วงพีคต้องแข่งกับผลผลิตจำนวนมาก',
  s4why:'แบบจำลองฝนของพื้นที่ (จากข้อมูลจำลอง) · ฝนมากเสี่ยงคุณภาพผลผลิตและเก็บเกี่ยวลำบาก แห้งดีเหมาะเก็บเกี่ยว',
  ensCaption:'น้ำหนักรวม:',
  seasonTitle:'ปฏิทินฤดูกาลของพืชชนิดนี้',
  seasonSub:'แท่งสูง = ระดับราคาตามฤดูกาล (สูง = ราคาดี) · เขียว = เดือนเก็บเกี่ยว · ทอง = ผลผลิตล้น ราคามักต่ำสุด · ▲▼ = ราคาเทียบเดือนก่อน วางแผนขายเลี่ยงช่วงทอง',
  seasonCellTitle:'ระดับราคาตามฤดูกาล {f}× (เทียบราคาเฉลี่ยของปี)',
  sLegH:'ช่วงเก็บเกี่ยว/มีผลผลิต', sLegP:'ช่วงผลผลิตล้น (ราคามักต่ำ)', sLegV:'ระดับราคาตามฤดูกาล (แท่งสูง = ราคาดี)', sLegNow:'เดือนปัจจุบัน',
  harvTag:'เก็บ', peakTag:'ล้น', seasonNow:'เดือนนี้',
  supplyRising:'ผลผลิตกำลังเพิ่ม', supplyPeak:'ผลผลิตพีค', supplyEasing:'ผลผลิตเริ่มลด', supplyNormal:'ผลผลิตคงที่ตามฤดูกาล',
  harvestYes:'อยู่ในช่วงเก็บเกี่ยว', harvestNo:'นอกช่วงเก็บเกี่ยว', harvestAll:'เก็บได้ตลอดปี',
  peakIn:'พีคอีก {m} เดือน', peakNow:'ถึงพีคในเดือนนี้',
  weatherWet:'ฝนมาก ระวังคุณภาพ', weatherNormal:'สภาพอากาศปกติ', weatherDry:'แห้งดี เหมาะเก็บ',
  recSell:'เก็บเกี่ยว / ขายตอนนี้', recWait:'รอ 3–5 วัน', recRecover:'ราคากำลังฟื้นตัว · รอผลแก่เต็มที่',
  confHigh:'สูง', confMedHigh:'ปานกลาง–สูง', confMed:'ปานกลาง', confMedLow:'ปานกลาง–ต่ำ',
  momUp:'ราคา 5 สัปดาห์ล่าสุดขยับขึ้น', momDown:'ราคา 5 สัปดาห์ล่าสุดลดลงต่อเนื่อง', momFlat:'ราคา 5 สัปดาห์ล่าสุดทรงตัว',
  recBodySell:'แนะนำ: เก็บเกี่ยว/ขายตอนนี้', recBodyWait:'แนะนำ: รอ 3–5 วัน', recBodyRecover:'แนะนำ: รอผลแก่เต็มที่ก่อนขาย',
  recCloseSell:'ก่อนที่ราคาจะลดลงอีก', recCloseWait:'ให้สัญญาณชัดเจนขึ้นก่อนตัดสินใจ', recCloseRecover:'เพื่อให้ได้เกรดและราคาที่ดีกว่า',
  del:'ลบ',
  reportTitle:'ช่วยรายงานราคาที่ขายได้จริง',
  reportSub:'รายงานของคุณช่วยให้เห็นภาพราคาสดกว่าเดิม ข้อมูลถูกบันทึกในเครื่องนี้เท่านั้น',
  fProv:'จังหวัด', fCrop:'พืช', fPrice:'ราคาที่ขายได้ (บาท/หน่วย)', fPricePh:'เช่น 150',
  fNote:'หมายเหตุ (ไม่บังคับ)', fNotePh:'เช่น เกรด B ขายให้พ่อค้าคนกลาง',
  fSubmit:'ส่งรายงานราคา', repListT:'รายงานล่าสุดในเครื่องนี้',
  repEmpty:'ยังไม่มีรายงาน · ข้อมูลจะถูกบันทึกในเครื่องของคุณเท่านั้น (ต้นแบบ)',
  repTip:'ข้อมูลนี้เก็บใน localStorage ของเบราว์เซอร์คุณเท่านั้น ไม่มีการส่งไปยังเซิร์ฟเวอร์ ในเวอร์ชันจริงจะถูกส่งเข้าระบบเพื่อช่วยให้ทุกคนเห็นราคาตลาดสด',
  repSaved:'บันทึกรายงานแล้ว ขอบคุณครับ!', repBad:'กรุณากรอกราคาที่ถูกต้อง',
  qcProv:'จังหวัด', qcCrop:'พืช', chartShare:'แชร์ราคานี้',
  tblTitle:'ตารางตัวเลขราคา', tblWeek:'สัปดาห์ที่', tblMonth:'เดือน', tblPrice:'ราคา', tblType:'ประเภท',
  tblHist:'ย้อนหลัง', tblFore:'พยากรณ์', tblExport:'ดาวน์โหลด CSV', csvDone:'ดาวน์โหลดไฟล์แล้ว',
  range26Lbl:'ช่วงราคา 26 สัปดาห์', minLbl:'ต่ำสุด', maxLbl:'สูงสุด', avgLbl:'เฉลี่ย',
  recReasons:'เหตุผลประกอบคำแนะนำ',
  statChg5:'Δ 5 สัปดาห์', statMin:'ต่ำสุด 26 สัปดาห์', statMax:'สูงสุด 26 สัปดาห์', statAvg:'เฉลี่ย 26 สัปดาห์', statFore:'พยากรณ์ 4 สัปดาห์',
  chartMin:'ต่ำสุด', chartMax:'สูงสุด', tblChg:'Δ%',
  watchTitle:'รายการติดตาม', watchSub:'เข้าถึงราคาที่คุณติดตามได้เร็ว',
  watchEmpty:'ยังไม่มีรายการติดตาม · กดปุ่ม "ติดตามราคานี้" บนคำแนะนำเพื่อเพิ่ม', watchGoTo:'เปิด',
  aboutTitle:'เกี่ยวกับ Harvest Trend',
  p1:'Harvest Trend (รู้ทันราคา) เป็นต้นแบบเครื่องมือคาดการณ์แนวโน้มราคาพืชผลหน้าสวน ครอบคลุม <b>77 จังหวัด 10 พืชหลัก</b> ผสานสัญญาณ 4 ปัจจัย (โมเมนตัมราคา · ปริมาณผลผลิตตามฤดูกาล · ช่วงเก็บเกี่ยว · สภาพอากาศ) แปลผลเป็นคำแนะนำ 3 ระดับที่เข้าใจง่าย สำหรับเกษตรกรที่ไม่ถนัดเทคโนโลยี',
  p2:'แรงบันดาลใจมาจากวิกฤตทุเรียนล้นตลาดภาคตะวันออกปี 2569: ผลผลิตพุ่ง 1,066,980 ตัน (+22.4%) ราคาเกรด C ร่วงจาก ~170 เหลือ ~95 บาท/กก. เกษตรกรจำนวนมากต้องตัดสินใจโดยไม่มีข้อมูลล่วงหน้า ระบบนี้ช่วยให้เห็นแนวโน้มและจังหวะก่อนตัดสินใจ ไม่ใช่ให้ "เชื่อ AI" แบบไม่มีที่มา',
  p3:'<b>สถานะปัจจุบัน: เชื่อมต่อราคาจริงจากหน่วยงานแล้ว</b> · ราคาแสดงจากข้อมูลราชการ (data.go.th: สำนักงานจังหวัดตราด/อำนาจเจริญ/แม่ฮ่องสอน/สุราษฎร์ธานี + สำนักงานเศรษฐกิจการเกษตร + ธนาคารแห่งประเทศไทย) ดึงอัตโนมัติทุก 10 วินาที · จังหวัด/พืชนอกเหนือที่ยังไม่มีข้อมูลราชการ ระบบใช้แบบจำลองฤดูกาลและมีป้ายกำกับชัดเจน พร้อมเปิดรับรายงานราคาจากเกษตรกรผ่าน LINE OA (ทดลองใช้บอทได้ในหน้า "บอท LINE")',
  srcTitle:'แหล่งอ้างอิงแนวคิด',
  sdg1:'ขจัดความยากจน', sdg2:'ขจัดความหิวโหย', sdg8:'งานที่มีคุณค่าและเศรษฐกิจที่เติบโต', sdg12:'การผลิตและบริโภคที่ยั่งยืน',
  footDisc:'ต้นแบบ (prototype) · ราคาหลักจากข้อมูลราชการจริง (data.go.th / ธปท.) อัปเดตอัตโนมัติ · พื้นที่ที่ยังไม่มีข้อมูลราชการใช้ค่าประมาณจากแบบจำลอง ข้อมูลที่คุณรายงานถูกเก็บในเครื่องของคุณเท่านั้น คำแนะนำเป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่คำแนะนำทางการเงิน และไม่ใช่หลักฐานผลกำไรจริง',
  footCredit:'Harvest Trend (รู้ทันราคา) · EEC-SDG Hackathon & Pitching 2026 · Track 5 Smart Agriculture & Food Security',
  regionAll:'ทั้งหมด',
  lineTitle:'บอท LINE · gracia',
  lineSub:'ตรวจราคาพืชผลและรับคำแนะนำจังหวะขายใน LINE — ไม่ต้องเปิดเว็บ ไม่ต้องติดตั้งแอป',
  lineStatusCheck:'กำลังตรวจสอบสถานะ…', lineStatusOk:'พร้อมใช้งาน', lineStatusPrep:'กำลังเตรียมระบบ', lineStatusFail:'ไม่สามารถเช็กสถานะได้',
  demoTitle:'ทดลองคุยกับบอท (จำลอง) — ไม่ต้องมี LINE',
  demoSub:'พิมพ์คำสั่งด้านล่าง ระบบจะตอบเหมือนบอท LINE จริงทุกอย่าง (Flex Message + ปุ่มลัด) · ข้อมูลเป็น mock เช่นเดียวกับเว็บ',
  chatPh:'เช่น ราคา ระยอง ทุเรียน', chatSend:'ส่ง', chatAria:'พิมพ์ข้อความถึงบอท', chipsAria:'ปุ่มลัด',
  addTitle:'วิธีเพิ่มเพื่อน', qrGen:'กำลังสร้าง QR…', qrAlt:'QR เพิ่มเพื่อน LINE {id}', addBtn:'เพิ่มเพื่อนผ่านลิงก์',
  step1:'<b>เปิด LINE</b> แล้วกดแท็บ "เพิ่มเพื่อน" (Add friends)',
  step2:'สแกน QR ด้านซ้าย หรือค้นหา ID <b>@441sptre</b> (ชื่อบอท gracia)',
  step3:'กดเพิ่มเพื่อน แล้วส่งข้อความ <code>"ราคา ระยอง ทุเรียน"</code> เพื่อเริ่มใช้งาน',
  cmdTitle:'ตัวอย่างคำสั่ง', cmdHead1:'พิมพ์', cmdHead2:'ได้อะไร',
  cmd1a:'ราคาปัจจุบัน + คำแนะนำจังหวะขาย + เหตุผล 4 ปัจจัย',
  cmd2a:'ระบุเกรดได้ (เฉพาะพืชที่มีเกรด)',
  cmd3a:'ภาษาอังกฤษก็ได้',
  cmd4a:'ส่งรายงานราคาที่ขายได้จริง (ช่วยสร้างข้อมูลราคาสด)',
  cmd5a:'ดูคำสั่งทั้งหมด',
  cmdNote:'ครอบคลุม 77 จังหวัด 10 พืชหลัก (ทุเรียน ยางพารา มันสำปะหลัง ข้าว ข้าวโพด อ้อย ปาล์ม เงาะ มังคุด ลำไย)',
  featTitle:'บอททำอะไรได้',
  feat1:'<b>ตรวจราคาหน้าสวน</b> — 77 จังหวัด 10 พืชหลัก ราคาจริงจากหน่วยงานราชการ อัปเดตอัตโนมัติ (พื้นที่ที่ยังไม่มีข้อมูลใช้ค่าประมาณ)',
  feat2:'<b>คำแนะนำจังหวะขาย</b> — 3 ระดับ (ขายตอนนี้ / รอ 3–5 วัน / รอผลแก่) พร้อมความเชื่อมั่น',
  feat3:'<b>เหตุผล 4 ปัจจัย</b> — โมเมนตัมราคา (40%) · ปริมาณผลผลิต (25%) · ช่วงเก็บเกี่ยว (20%) · สภาพอากาศ (15%)',
  feat4:'<b>ช่วงราคา 26 สัปดาห์</b> — ต่ำสุด/สูงสุด/เฉลี่ย พร้อมราคาพยากรณ์',
  feat5:'<b>รายงานราคาจริง</b> — ส่งราคาที่ขายได้ ช่วยสะสมข้อมูลราคาสด (ต้นแบบ)',
  feat6:'<b>ไทย/อังกฤษ</b> — พิมพ์ภาษาไหนตอบภาษานั้น',
  faqTitle:'คำถามที่พบบ่อย',
  faq1:'<b>ใช้ฟรีไหม?</b> ฟรี ไม่ต้องสมัครสมาชิก แค่เพิ่มเพื่อนบอทใน LINE แล้วส่งข้อความได้เลย',
  faq2:'<b>ราคาที่บอทตอบเป็นราคาจริงไหม?</b> ส่วนใหญ่ใช่ — บอทใช้ราคาจริงจากข้อมูลราชการ (data.go.th: สำนักงานจังหวัด/สศก. + ธนาคารแห่งประเทศไทย) อัปเดตอัตโนมัติทุก 10 วินาที · พื้นที่/พืชที่ยังไม่มีข้อมูลราชการ ระบบใช้แบบจำลองฤดูกาลและแจ้งไว้ในคำตอบ',
  faq3:'<b>รายงานราคาที่ส่งไปเก็บที่ไหน?</b> ต้นแบบเก็บชั่วคราวในหน่วยความจำเซิร์ฟเวอร์ (หายเมื่อรีสตาร์ท) เวอร์ชันจริงจะบันทึกลงฐานข้อมูลถาวร',
  typing:'พิมพ์…',
  demoNoBackend:'เดโมนี้ใช้ได้บนเว็บที่ deploy แล้ว (https://harvest-ecc.vercel.app/line.html) — localhost ไม่มี backend',
  demoFail:'ไม่สามารถติดต่อระบบได้ (ลองเปิดบนเว็บที่ deploy แล้ว)',
  welcome:'สวัสดีครับ ยินดีต้อนรับสู่บอท gracia 🌾\nลองพิมพ์ "ราคา ระยอง ทุเรียน" เพื่อดูราคาและคำแนะนำจังหวะขาย หรือ "ช่วย" เพื่อดูคำสั่งทั้งหมด',
  aFontSize:'ขนาดตัวอักษร', aFontDown:'ลดขนาดตัวอักษร', aFontUp:'เพิ่มขนาดตัวอักษร', aNav:'เมนูหลัก',
  aRegion:'ภูมิภาค', aProvList:'รายชื่อจังหวัด', aProvSearch:'ค้นหาจังหวัด', aCrop:'เลือกพืช',
  aQcProv:'เปลี่ยนจังหวัด', aQcCrop:'เปลี่ยนพืช', aGrade:'เลือกเกรด',
  docTitleHome:'Harvest Trend · รู้ทันราคา | ตรวจราคาพืชผล 77 จังหวัด แนะนำจังหวะขาย',
  docTitleChart:'ราคาและแนวโน้ม | Harvest Trend', docTitleReport:'รายงานราคาที่ขายได้ | Harvest Trend',
  docTitleWatch:'รายการติดตาม | Harvest Trend', docTitleAbout:'เกี่ยวกับ | Harvest Trend', docTitleLine:'บอท LINE | Harvest Trend',
  metaDescHome:'Harvest Trend เครื่องมือตรวจราคาพืชผล 77 จังหวัด 10 พืชหลัก (ทุเรียน ยางพารา มันสำปะหลัง ข้าว ฯลฯ) คาดการณ์แนวโน้มราคาและแนะนำจังหวะเก็บเกี่ยว/ขาย ใช้ฟรี ไม่ต้องติดตั้ง ใช้งานง่ายสำหรับเกษตรกร',
  metaDescChart:'กราฟราคาย้อนหลัง 26 สัปดาห์ พยากรณ์ 4 สัปดาห์ สถิติราคา ตารางตัวเลข สัญญาณ 4 ปัจจัย และปฏิทินฤดูกาล สำหรับพืชและจังหวัดที่คุณเลือก',
  metaDescReport:'ช่วยรายงานราคาพืชผลที่คุณขายได้จริง ข้อมูลบันทึกในเครื่องของคุณเท่านั้น',
  metaDescWatch:'รายการจังหวัด/พืชที่คุณติดตามราคาไว้ เข้าถึงได้เร็วจากทุกอุปกรณ์ในเครื่องนี้',
  metaDescAbout:'Harvest Trend (รู้ทันราคา) ต้นแบบเครื่องมือคาดการณ์แนวโน้มราคาพืชผลหน้าสวน 77 จังหวัด 10 พืชหลัก',
  metaDescLine:'เพิ่มเพื่อน LINE OA ของ Harvest Trend แล้วส่งข้อความ "ราคา ระยอง ทุเรียน" เพื่อรับคำแนะนำจังหวะขายทันที'
},

en: {
  monthsShort:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  skip:'Skip to main content',
  heroEyebrow:'A decision tool for crop prices · nationwide coverage',
  heroTitle:'Know before you sell',
  heroSub:'Pick your province and crop to get a plain-language harvest/sell verdict with reasons, in 2 taps · no expertise needed.',
  heroStat1:'provinces covered', heroStat2:'major crops', heroStat3:'signals combined',
  heroCta:'Check prices now',
  shareBtn:'Share result', shareCopied:'Result copied · ready to share',
  shareBody:'Harvest Trend · {prov} · {crop}: {verdict} (current price ~{price} {unit})',
  nav1:'Check prices', navPrice:'Price & trend', nav2:'Report price', nav3:'Watchlist', nav4:'About', lineNav:'LINE Bot',
  lineCtaTitle:'Get advice on LINE', lineCtaBody:'Add the LINE OA and send "price Rayong durian" to get a sell-timing verdict instantly', lineCtaBtn:'How to use',
  shareLine:'Share on LINE',
  how1:'Pick your province', how2:'Pick your crop', how3:'Read the verdict + check the chart',
  mockNote:'All prices on this page are mock/simulated data for a working prototype · from a seasonal model, not real market prices. Before selling, always check official or local market prices.',
  liveNote:'Real prices from government agencies (data.go.th: Provincial Offices / OAE + Bank of Thailand) · auto-refreshed every 10 seconds · areas without official data show a clearly-labelled seasonal estimate.',
  liveBadgeLive:'🟢 Live government prices · updated {t} · auto-refresh every 10s',
  liveBadgeOff:'🟡 Simulated data (cannot reach the price service) · will return to live data when online',
  liveBadgeFile:'🟡 Simulated data · open the deployed site to see live prices (https://harvest-ecc.vercel.app)',
  liveRealLabel:'Real price · {src}',
  pickTitle:'Pick your province', pickSub:'Search, filter by region, or use GPS · all 77 provinces',
  searchPh:'Search province, e.g. Rayong / ระยอง', gpsBtn:'Use my location',
  gpsBusy:'Locating...', gpsFail:'Location unavailable · please pick your province manually',
  gpsDenied:'Location permission denied · allow location in browser settings, then try again',
  gpsDeniedInApp:'In-app browsers (LINE/Facebook) block location · open in Safari/Chrome and try again',
  gpsNoFix:'Could not get a GPS fix · try again or pick your province',
  provEmpty:'No province found. Try another name.', provCount:'{n} provinces',
  cropTitle:'Pick your crop', cropSub:'Crops most grown in your area come first · the "Key area" tag marks major production zones',
  mainTag:'Key area',
  recKicker:"Today's verdict", youAt:'You are in', confPrefix:'Confidence:', confSuffix:'· from 4 signals',
  watchAdd:'Follow this price', watchAdded:'Added to watchlist', watchExists:'Already in watchlist', watchRemoved:'Removed from watchlist',
  scrollReport:'Report the price you got', viewChart:'View chart + signals',
  sig1n:'Price momentum', sig2n:'Seasonal supply', sig3n:'Harvest window', sig4n:'Weather',
  priceTitleTpl:'{crop} price trend · {prov}',
  priceSubTpl:'26-week simulated history + 4-week forecast (per unit) · generated from the {crop} seasonal model',
  livePriceSubTpl:'26-week history + 4-week forecast (per unit) · anchored to the latest official price · older points are seasonal estimates for {crop}',
  legAct:'Simulated history', legFore:'Forecast', legBand:'Forecast range',
  todayLbl:'Today', wk:'Week', baht:'per unit',
  chartAriaTpl:'{crop} price chart, 26 weeks with 4-week forecast',
  chartNote:'Simulated data from a seasonal model (mock) · not real market prices. Use for direction only.',
  nowTrendUp:'Rising', nowTrendDown:'Falling', nowTrendFlat:'Flat', last5w:'vs 5 weeks ago',
  sigTitle:'4 signals combined into one',
  sigSub:'Ensemble recommendation · no single signal decides alone. Tap "Why" to see each reason.',
  s1name:'1. Price momentum', s2name:'2. Seasonal supply', s3name:'3. Harvest window', s4name:'4. Weather',
  why:'Why',
  s1why:'Compares the last 5 weeks of prices with the 5 before. Rising momentum means buying pressure is back; falling means sellers dominate. This signal carries the most weight (40%).',
  s2why:'Where this month sits vs the crop\u2019s supply-peak months. The closer to peak, the more produce floods the market and the lower the price pressure.',
  s3why:'Whether today falls inside the harvest window, and how many months to the peak. Harvesting at peak means competing with everyone else\u2019s output.',
  s4why:'Simulated rain pattern for the area · wet weather risks quality and makes harvest hard; dry weather suits harvest.',
  ensCaption:'Ensemble weights:',
  seasonTitle:'Season calendar for this crop',
  seasonSub:'Bar height = seasonal price level (taller = better price) · green = harvest months · gold = oversupply, usually the price trough · ▲▼ vs previous month. Plan sales around the gold window.',
  seasonCellTitle:'Seasonal price factor {f}× vs yearly average',
  sLegH:'Harvest / in season', sLegP:'Oversupply (usually low price)', sLegV:'Seasonal price level (taller = better price)', sLegNow:'Current month',
  harvTag:'harvest', peakTag:'surplus', seasonNow:'now',
  supplyRising:'Supply rising', supplyPeak:'Supply at peak', supplyEasing:'Supply easing', supplyNormal:'Supply steady by season',
  harvestYes:'In harvest window', harvestNo:'Outside harvest window', harvestAll:'Harvestable year-round',
  peakIn:'Peak in {m} months', peakNow:'Peak this month',
  weatherWet:'Wet · watch quality', weatherNormal:'Normal weather', weatherDry:'Dry · good for harvest',
  recSell:'Harvest / sell now', recWait:'Wait 3–5 days', recRecover:'Price recovering · let fruit ripen',
  confHigh:'High', confMedHigh:'Moderate–High', confMed:'Moderate', confMedLow:'Moderate–Low',
  momUp:'Prices have risen over the last 5 weeks', momDown:'Prices kept falling over the last 5 weeks', momFlat:'Prices were flat over the last 5 weeks',
  recBodySell:'Verdict: harvest / sell now', recBodyWait:'Verdict: wait 3–5 days', recBodyRecover:'Verdict: let the fruit ripen fully before selling',
  recCloseSell:'before prices fall further', recCloseWait:'until signals become clearer', recCloseRecover:'for a better grade and price',
  del:'Remove',
  reportTitle:'Report the price you actually got',
  reportSub:'Your report helps build a fresher price picture than waiting for official data. Saved on this device only.',
  fProv:'Province', fCrop:'Crop', fPrice:'Price received (per unit)', fPricePh:'e.g. 150', fNote:'Note (optional)', fNotePh:'e.g. grade B, sold to middleman',
  fSubmit:'Submit report', repListT:'Recent reports on this device',
  repEmpty:'No reports yet · reports are saved on this device only (prototype)',
  repTip:'Reports are stored in this browser\u2019s localStorage only; nothing is sent to a server. The real version will feed them into the system so everyone sees fresher prices.',
  repSaved:'Report saved · thank you!', repBad:'Please enter a valid price',
  qcProv:'Province', qcCrop:'Crop', chartShare:'Share price',
  tblTitle:'Price table', tblWeek:'Week', tblMonth:'Month', tblPrice:'Price', tblType:'Type',
  tblHist:'History', tblFore:'Forecast', tblExport:'Download CSV', csvDone:'File downloaded',
  range26Lbl:'26-week range', minLbl:'Low', maxLbl:'High', avgLbl:'Avg',
  recReasons:'Why this verdict',
  statChg5:'5-wk change', statMin:'26-wk low', statMax:'26-wk high', statAvg:'26-wk avg', statFore:'4-wk forecast',
  chartMin:'low', chartMax:'high', tblChg:'Chg%',
  watchTitle:'Watchlist', watchSub:'Quick access to the prices you follow',
  watchEmpty:'Nothing here yet · tap "Follow this price" on a verdict to add it.',
  watchGoTo:'open',
  aboutTitle:'About Roo Tun Raka',
  p1:'Harvest Trend (รู้ทันราคา) is a working prototype that forecasts farm-gate crop prices across <b>77 provinces and 10 major crops</b>, blending 4 signals (price momentum · seasonal supply · harvest window · weather) into one plain-language verdict · built for farmers who are not tech-savvy.',
  p2:'Inspired by the 2026 Eastern durian oversupply crisis: output hit 1,066,980 tonnes (+22.4%) and grade-C prices fell from ~170 to ~95 THB/kg. Farmers had to decide with no foresight. This tool shows the trend and timing before the decision · never a blind "trust the AI".',
  p3:'<b>Status: connected to real government price data</b> · prices come from official sources (data.go.th: Trat/Amnat Charoen/Mae Hong Son/Surat Thani provincial offices + OAE + Bank of Thailand), auto-refreshed every 10 seconds · provinces/crops without official data use the seasonal model with a clear label. Farmer price reports via LINE OA are welcome too (try the bot on the "LINE Bot" page).',
  srcTitle:'Concept references',
  sdg1:'No poverty', sdg2:'Zero hunger', sdg8:'Decent work & economic growth', sdg12:'Responsible consumption',
  footDisc:'Prototype · prices are real government data (data.go.th / BOT) with auto-refresh · areas without official data show seasonal estimates. Your reports stay on this device. Recommendations support decisions; they are not financial advice and not proof of live profit.',
  footCredit:'Harvest Trend (รู้ทันราคา) · EEC-SDG Hackathon & Pitching 2026 · Track 5 Smart Agriculture & Food Security',
  regionAll:'All',
  lineTitle:'LINE Bot · gracia',
  lineSub:'Check crop prices and get sell-timing advice inside LINE — no website to open, no app to install',
  lineStatusCheck:'Checking status…', lineStatusOk:'Live', lineStatusPrep:'Preparing', lineStatusFail:'Status unavailable',
  demoTitle:'Try the bot (simulated) — no LINE needed',
  demoSub:'Type a command below — the bot replies exactly like the real LINE bot (Flex Message + quick replies) · mock data, same as the site',
  chatPh:'e.g. price rayong durian', chatSend:'Send', chatAria:'Type a message to the bot', chipsAria:'Quick replies',
  addTitle:'How to add the bot', qrGen:'Generating QR…', qrAlt:'LINE add-friend QR {id}', addBtn:'Add via link',
  step1:'<b>Open LINE</b> and tap the "Add friends" tab',
  step2:'Scan the QR on the left, or search for ID <b>@441sptre</b> (bot name gracia)',
  step3:'Add the bot, then send <code>"ราคา ระยอง ทุเรียน"</code> to get started',
  cmdTitle:'Example commands', cmdHead1:'Type', cmdHead2:'What you get',
  cmd1a:'Current price + sell-timing verdict + 4-factor reasoning',
  cmd2a:'You can specify a grade (graded crops only)',
  cmd3a:'English works too',
  cmd4a:'Report the price you actually got (helps build fresher price data)',
  cmd5a:'See all commands',
  cmdNote:'Covers 77 provinces, 10 major crops (durian, rubber, cassava, rice, maize, sugarcane, oil palm, rambutan, mangosteen, longan)',
  featTitle:'What the bot can do',
  feat1:'<b>Farm-gate price checks</b> — 77 provinces, 10 crops, real government prices with auto-refresh (estimates where official data is missing)',
  feat2:'<b>Sell-timing verdicts</b> — 3 levels (sell now / wait 3–5 days / wait to ripen) with confidence',
  feat3:'<b>4-factor reasoning</b> — price momentum (40%) · seasonal supply (25%) · harvest window (20%) · weather (15%)',
  feat4:'<b>26-week price range</b> — low/high/average plus forecast price',
  feat5:'<b>Real price reports</b> — send what you sold for, building fresher price data (prototype)',
  feat6:'<b>Thai/English</b> — the bot answers in the language you type',
  faqTitle:'Frequently asked questions',
  faq1:'<b>Is it free?</b> Yes — free, no sign-up. Just add the bot on LINE and start messaging.',
  faq2:'<b>Are the bot\u2019s prices real?</b> Mostly yes — the bot uses real government prices (data.go.th: Provincial Offices/OAE + Bank of Thailand), auto-refreshed every 10 seconds · areas without official data use the seasonal model and the reply says so.',
  faq3:'<b>Where do submitted price reports go?</b> The prototype stores them temporarily in server memory (lost on restart). The real version will store them in a permanent database.',
  typing:'Typing…',
  demoNoBackend:'This demo works on the deployed site (https://harvest-ecc.vercel.app/line.html) — localhost has no backend',
  demoFail:'Cannot reach the system (try the deployed site)',
  welcome:'Hello, welcome to the gracia bot 🌾\nTry "price rayong durian" for a price and sell-timing verdict, or "help" for all commands',
  aFontSize:'Font size', aFontDown:'Decrease font size', aFontUp:'Increase font size', aNav:'Main menu',
  aRegion:'Region', aProvList:'Province list', aProvSearch:'Search province', aCrop:'Pick a crop',
  aQcProv:'Change province', aQcCrop:'Change crop', aGrade:'Pick a grade',
  docTitleHome:'Harvest Trend | Check crop prices across 77 provinces',
  docTitleChart:'Price & trend | Harvest Trend', docTitleReport:'Report your price | Harvest Trend',
  docTitleWatch:'Watchlist | Harvest Trend', docTitleAbout:'About | Harvest Trend', docTitleLine:'LINE Bot | Harvest Trend',
  metaDescHome:'Harvest Trend — check crop prices across 77 provinces and 10 major crops (durian, rubber, cassava, rice, etc.), see price trends and harvest/sell timing advice. Free, no install, easy for farmers.',
  metaDescChart:'26-week price history chart, 4-week forecast, price stats, data table, 4-factor signals, and a season calendar for the crop and province you pick.',
  metaDescReport:'Report the crop price you actually got — saved on this device only.',
  metaDescWatch:'Your saved province/crop price watchlist — quick access on this device.',
  metaDescAbout:'Harvest Trend (รู้ทันราคา) — a prototype forecasting farm-gate crop prices across 77 provinces and 10 major crops.',
  metaDescLine:'Add the Harvest Trend LINE OA and send "price rayong durian" to get an instant sell-timing verdict.'
}
};
/* ---------- ENGINE: series, signals, verdict ---------- */
const REGION_FACTOR = { north:0.97, ne:0.95, central:1.0, east:1.08, west:1.0, south:1.02 };
const CUR_WEEK = 32; // mid-August anchor week for the demo clock
function gradeMult(){
  const c = cropById(state.crop);
  return c.grades ? (GRADES[state.grade] || 1) : 1;
}
function priceAt(cropId, provId, weekOfYear){
  const w = ((weekOfYear - 1) % 52) + 1;
  const m = Math.min(12, Math.max(1, Math.floor((w - 1) / 4.33) + 1));
  const c = cropById(cropId), p = provById(provId);
  const gm = c.grades ? (GRADES[state.grade] || 1) : 1; // grade applies to the series' own crop
  // grade-independent noise seed → grade multiplier stays a clean scalar on top of the real price
  const r = rng01(cropId + ':' + provId);
  const n = 0.05 * Math.sin(w * 0.9 + r() * 6.28) + 0.035 * Math.sin(w * 2.3 + r() * 6.28);
  const raw = c.base * gm * c.season[m - 1] * (REGION_FACTOR[p.rg] || 1) * (1 + n);
  // real-data anchor: scale the seasonal curve so today's point equals the
  // official price from /api/prices (data.go.th / BOT). k = 1 when offline.
  return raw * liveAnchorK(cropId, provId);
}
/* ratio that makes week CUR_WEEK equal the real official price (if any).
   Computed on the UNGRADED curve so grades stay relative to the real price. */
function liveAnchorK(cropId, provId){
  const real = LiveData.get(cropId, provId);
  if(!real || !(real.price > 0)) return 1;
  const c = cropById(cropId), p = provById(provId);
  const w = ((CUR_WEEK - 1) % 52) + 1;
  const m = Math.min(12, Math.max(1, Math.floor((w - 1) / 4.33) + 1));
  const r = rng01(cropId + ':' + provId);
  const n = 0.05 * Math.sin(w * 0.9 + r() * 6.28) + 0.035 * Math.sin(w * 2.3 + r() * 6.28);
  const mockNow = c.base * c.season[m - 1] * (REGION_FACTOR[p.rg] || 1) * (1 + n);
  return mockNow > 0 ? real.price / mockNow : 1;
}
function priceSeriesFor(cropId, provId){
  const a = [], f = [];
  for(let i = CUR_WEEK - 25; i <= CUR_WEEK; i++) a.push(priceAt(cropId, provId, i));
  for(let i = 1; i <= 4; i++) f.push(priceAt(cropId, provId, CUR_WEEK + i));
  return { a: a, f: f };
}
function series(){
  return priceSeriesFor(state.crop, state.prov);
}
function signals(){
  const c = cropById(state.crop), p = provById(state.prov);
  const s = series(), N = s.a.length;
  const mom = (s.a[N-1] - s.a[N-6]) / s.a[N-6];
  const momSt = mom > 0.03 ? 'up' : (mom < -0.03 ? 'down' : 'flat');
  const curM = todayInfo().m;
  let supSt = 'normal';
  if(c.peak.length){
    const inP = c.peak.includes(curM);
    const before = curM < c.peak[0];
    const after = curM > c.peak[c.peak.length - 1];
    supSt = inP ? 'peak' : (before ? 'rising' : (after ? 'easing' : 'rising'));
  }
  let harvSt;
  if(c.harvest[0] === 1 && c.harvest[1] === 12) harvSt = 'all';
  else{
    const inH = c.harvest[0] <= c.harvest[1]
      ? (curM >= c.harvest[0] && curM <= c.harvest[1])
      : (curM >= c.harvest[0] || curM <= c.harvest[1]);
    harvSt = inH ? 'yes' : 'no';
  }
  let peakDist = null;
  if(c.peak.length){
    let d = c.peak[0] - curM; if(d < 0) d += 12;
    peakDist = d;
  }
  const wr = rng01('wx:' + p.id + ':' + c.id)();
  const wxSt = wr > 0.66 ? 'wet' : (wr < 0.33 ? 'dry' : 'normal');
  return { mom: mom, momSt: momSt, supSt: supSt, harvSt: harvSt, peakDist: peakDist, wxSt: wxSt, series: s };
}
function recommend(sg){
  let score = 0;
  if(sg.momSt === 'down') score -= 2; else if(sg.momSt === 'up') score += 2;
  if(sg.supSt === 'peak') score -= 1.5; else if(sg.supSt === 'easing') score += 1;
  if(sg.harvSt === 'no') score -= 0.5; else if(sg.harvSt === 'yes' && sg.supSt !== 'easing') score += 0.5;
  if(sg.wxSt === 'wet') score -= 0.5; else if(sg.wxSt === 'dry') score += 0.5;
  let rec = score <= -1.5 ? 'sell' : (score >= 1.5 ? 'recover' : 'wait');
  let confKey = Math.abs(score) >= 2.5 ? 'confHigh'
    : Math.abs(score) >= 1.5 ? 'confMedHigh'
    : Math.abs(score) >= 0.5 ? 'confMed' : 'confMedLow';
  return { rec: rec, confKey: confKey, score: score };
}
const REC_KEY = { sell:'recSell', wait:'recWait', recover:'recRecover' };
const BODY_KEY = { sell:'recBodySell', wait:'recBodyWait', recover:'recBodyRecover' };
const CLOSE_KEY = { sell:'recCloseSell', wait:'recCloseWait', recover:'recCloseRecover' };
const MOM_KEY = { up:'momUp', down:'momDown', flat:'momFlat' };
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtValFor(v, cropId){
  const c = cropById(cropId || state.crop);
  return (c.dec === 0 ? Math.round(v) : v.toFixed(c.dec));
}
function fmtVal(v){ return fmtValFor(v, state.crop); }
function shareText(){
  const t = T[state.lang], c = cropById(state.crop), p = provById(state.prov);
  const sg = signals(), r = recommend(sg);
  const last = sg.series.a[sg.series.a.length - 1];
  return t.shareBody
    .replace('{prov}', p[state.lang])
    .replace('{crop}', c[state.lang])
    .replace('{verdict}', t[REC_KEY[r.rec]])
    .replace('{price}', fmtVal(last))
    .replace('{unit}', c.unit[state.lang]);
}
function shareVerdict(){
  const t = T[state.lang];
  const text = shareText();
  if(navigator.share){
    navigator.share({ title: 'Harvest Trend', text: text }).catch(function(){});
    return;
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){ toast(t.shareCopied); }).catch(function(){ toast(text); });
  }else{
    toast(text);
  }
}
function shareLine(){
  const url = 'https://line.me/R/msg/text/?text=' + encodeURIComponent(shareText());
  window.open(url, '_blank', 'noopener');
}
function flashUpdate(){
  [document.querySelector('.rec-card'), document.querySelector('.chart-box'), document.querySelector('.sig-grid')].forEach(function(el){
    if(!el) return;
    el.classList.remove('updating');
    void el.offsetWidth;
    el.classList.add('updating');
  });
}
function applyFontSize(px){
  px = Math.max(13, Math.min(22, px));
  state.fontSize = px;
  document.documentElement.style.fontSize = px + 'px';
  const cfg = store.get(CFG_KEY, {});
  cfg.fontSize = px; store.set(CFG_KEY, cfg);
}
function changeFont(d){ applyFontSize(state.fontSize + d); }

/* ---------- SHARED: multi-page state hydration + persistence ---------- */
function hydrateState(){
  const cfg = store.get(CFG_KEY, {});
  if(cfg.lang && (cfg.lang === 'th' || cfg.lang === 'en')) state.lang = cfg.lang;
  if(cfg.prov && provById(cfg.prov)) state.prov = cfg.prov;
  if(cfg.crop && cropById(cfg.crop)) state.crop = cfg.crop;
  if(cfg.grade && GRADES[cfg.grade]) state.grade = cfg.grade;
  if(cfg.fontSize) applyFontSize(cfg.fontSize);
  document.documentElement.lang = state.lang;
}
function persistCfg(patch){
  const cfg = store.get(CFG_KEY, {});
  Object.assign(cfg, patch);
  store.set(CFG_KEY, cfg);
}

/* ---------- SHARED: i18n DOM walk (generic — safe on any page) ---------- */
function applyI18nDom(){
  const t = T[state.lang];
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if(t[k] !== undefined && t[k] !== null) el.textContent = t[k];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const k = el.dataset.i18nHtml;
    if(t[k] !== undefined && t[k] !== null) el.innerHTML = t[k];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const k = el.dataset.i18nPh;
    if(t[k] !== undefined && t[k] !== null) el.setAttribute('placeholder', t[k]);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const k = el.dataset.i18nAria;
    if(t[k] !== undefined && t[k] !== null) el.setAttribute('aria-label', t[k]);
  });
  const ti = document.querySelector('[data-i18n-title]');
  if(ti && t[ti.dataset.i18nTitle]) document.title = t[ti.dataset.i18nTitle];
  document.querySelectorAll('[data-i18n-meta]').forEach(el => {
    const k = el.dataset.i18nMeta;
    if(t[k] !== undefined && t[k] !== null) el.setAttribute('content', t[k]);
  });
  document.querySelectorAll('.lang-btn').forEach(b => {
    const on = b.dataset.lang === state.lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

/* ---------- SHARED: header controls (lang toggle, font size, current nav) ---------- */
function markCurrentNav(){
  const here = location.pathname.split('/').pop() || 'rutun-price.html';
  let active = null;
  document.querySelectorAll('.nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0] || 'rutun-price.html';
    if(href === here){ a.setAttribute('aria-current', 'page'); active = a; }
    else a.removeAttribute('aria-current');
  });
  // keep the selected link visible on the mobile scroll bar (don't reset to the first one)
  if(active){
    const nav = active.closest('.nav');
    if(nav && nav.scrollWidth > nav.clientWidth){
      const navRect = nav.getBoundingClientRect();
      const linkRect = active.getBoundingClientRect();
      const target = nav.scrollLeft + (linkRect.left - navRect.left) - nav.clientWidth / 2 + linkRect.width / 2;
      nav.scrollLeft = Math.max(0, Math.min(target, nav.scrollWidth - nav.clientWidth));
    }
  }
}
function initHeaderControls(onLangChange){
  document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', function(){
    state.lang = b.dataset.lang;
    persistCfg({ lang: state.lang });
    applyI18nDom();
    if(typeof onLangChange === 'function') onLangChange();
  }));
  const fu = $('font-up'), fd = $('font-down');
  if(fu) fu.addEventListener('click', function(){ changeFont(1); });
  if(fd) fd.addEventListener('click', function(){ changeFont(-1); });
  markCurrentNav();
}

/* ---------- PWA: offline cache + installable ---------- */
if('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

/* ================================================================
   LIVE REAL PRICES — /api/prices (data.go.th + ธนาคารแห่งประเทศไทย)
   Polls every 10s (server caches upstream 60s). Updates the chart and
   verdict IN PLACE — no page reload. Falls back to the seasonal model
   (clearly labelled) when offline or when a crop×province has no
   official data yet.
   ================================================================ */
const LiveData = {
  map: {},        // 'crop|prov' | 'crop|rg:region' | 'crop|*' -> {price,unit,date,source}
  updated: null,  // ISO timestamp of last successful fetch
  ok: false,      // last fetch succeeded
  _fns: [],       // re-render callbacks (registered per page)
  onUpdate(fn){ this._fns.push(fn); },
  get(cropId, provId){
    const p = provById(provId);
    if(this.map[cropId + '|' + provId]) return this.map[cropId + '|' + provId];
    if(p && this.map[cropId + '|rg:' + p.rg]) return this.map[cropId + '|rg:' + p.rg];
    if(this.map[cropId + '|*']) return this.map[cropId + '|*'];
    return null;
  },
  label(cropId, provId){
    const r = this.get(cropId, provId);
    if(!r) return null;
    const t = T[state.lang];
    return (t.liveRealLabel || 'ราคาจริง · {src}').replace('{src}', r.source) + (r.date ? ' (' + r.date + ')' : '');
  },
  async refresh(){
    try{
      const res = await fetch('api/prices', { cache: 'no-store' });
      if(!res.ok) throw new Error('http ' + res.status);
      const d = await res.json();
      if(!d || !Array.isArray(d.prices)) throw new Error('bad payload');
      this.map = {};
      d.prices.forEach(p => { if(p.crop && p.prov && p.price > 0) this.map[p.crop + '|' + p.prov] = p; });
      this.updated = d.updated || new Date().toISOString();
      this.ok = true;
    }catch(e){
      this.ok = false; // keep last snapshot; badge shows offline state
    }
    /* re-render the page first (pages rebuild their own texts), then the badge */
    this._fns.forEach(f => { try{ f(); }catch(e){} });
    updateLiveBadge();
  },
  start(){
    if(this._started) return;
    this._started = true;
    if(location.protocol !== 'http:' && location.protocol !== 'https:'){
      updateLiveBadge();
      return;
    }
    /* page re-render hooks — each page exposes its full render fn */
    const rerender = window.renderHome || window.renderPriceChart || window.renderWatch || window.renderVerdict || null;
    if(typeof rerender === 'function') this.onUpdate(rerender);
    const tick = () => { if(!document.hidden) this.refresh(); };
    tick();
    setInterval(tick, 10000); // auto-refresh every 10s — no page reload
    document.addEventListener('visibilitychange', () => { if(!document.hidden) this.refresh(); });
  }
};

function liveTimeStr(){
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

/* live badge + swap the "mock data" notes for the real-data note */
function updateLiveBadge(){
  const t = T[state.lang];
  const live = LiveData.ok;
  document.querySelectorAll('[data-i18n="mockNote"]').forEach(n => {
    if(live) n.textContent = t.liveNote;
    else n.textContent = t.mockNote;
  });
  let el = document.querySelector('[data-live-badge]');
  if(!el){
    const anchor = document.querySelector('header') || document.querySelector('main') || document.body.firstElementChild;
    el = document.createElement('div');
    el.dataset.liveBadge = '';
    el.className = 'live-badge';
    if(anchor && anchor.insertAdjacentElement) anchor.insertAdjacentElement('afterend', el);
  }
  el.className = 'live-badge ' + (live ? 'on' : 'off');
  if(live){
    el.textContent = t.liveBadgeLive.replace('{t}', liveTimeStr());
  }else{
    el.textContent = location.protocol === 'file:' ? t.liveBadgeFile : t.liveBadgeOff;
  }
  /* show which official source backs the current crop×province selection */
  const src = LiveData.label(state.crop, state.prov);
  const price = document.querySelector('.rb-price b, #now-price');
  if(src && price && price.closest('.rec-card, .chart-box')){
    let s = price.closest('.rec-card, .chart-box').querySelector('.live-src');
    if(!s){
      s = document.createElement('div');
      s.className = 'live-src';
      price.closest('.rec-card, .chart-box').appendChild(s);
    }
    s.textContent = src;
    s.hidden = false;
  }
  /* chart subtitle: say it is anchored to the real price when live */
  const ps = document.getElementById('price-sub');
  if(ps){
    const c = cropById(state.crop);
    ps.textContent = live
      ? t.livePriceSubTpl.replace('{crop}', c ? c[state.lang] : '')
      : t.priceSubTpl.replace('{crop}', c ? c[state.lang] : '');
  }
}

document.addEventListener('DOMContentLoaded', function(){
  LiveData.start();
});
