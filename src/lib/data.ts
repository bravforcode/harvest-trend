/* Harvest Trend · รู้ทันราคา — dataset (ported from the original app.js) */

export type RegionId = 'north' | 'ne' | 'central' | 'east' | 'west' | 'south';

export interface Province {
  id: string;
  th: string;
  en: string;
  rg: RegionId;
  lat: number;
  lng: number;
  main: string[];
}

export interface Crop {
  id: string;
  th: string;
  en: string;
  unit: { th: string; en: string };
  base: number;
  dec: number;
  season: number[]; // 12 monthly factors
  harvest: [number, number]; // month range (wrap allowed)
  peak: number[]; // oversupply months
  grades: boolean;
  main: string[]; // '*' = everywhere
  tip: { th: string; en: string };
}

export const GRADES: Record<string, number> = { A: 1.15, B: 1.0, C: 0.85, D: 0.7 };

export const REGIONS: Record<RegionId, { th: string; en: string }> = {
  north: { th: 'ภาคเหนือ', en: 'North' },
  ne: { th: 'ภาคอีสาน', en: 'Northeast' },
  central: { th: 'ภาคกลาง', en: 'Central' },
  east: { th: 'ภาคตะวันออก', en: 'East' },
  west: { th: 'ภาคตะวันตก', en: 'West' },
  south: { th: 'ภาคใต้', en: 'South' }
};

export const REGION_FACTOR: Record<RegionId, number> = {
  north: 0.97, ne: 0.95, central: 1.0, east: 1.08, west: 1.0, south: 1.02
};

export const REG_COLOR: Record<RegionId, string> = {
  north: '#2E5C9A', ne: '#B6472E', central: '#C9922E',
  east: '#2C4A24', west: '#4A7A3D', south: '#8A6415'
};

/* ---------- PROVINCES: NORTH (17) ---------- */
const NORTH: Province[] = [
  { id: 'chiangmai', th: 'เชียงใหม่', en: 'Chiang Mai', rg: 'north', lat: 18.79, lng: 98.98, main: ['rice', 'longan', 'maize'] },
  { id: 'chiangrai', th: 'เชียงราย', en: 'Chiang Rai', rg: 'north', lat: 19.91, lng: 99.83, main: ['rice', 'maize', 'longan'] },
  { id: 'lampang', th: 'ลำปาง', en: 'Lampang', rg: 'north', lat: 18.29, lng: 99.49, main: ['rice', 'sugarcane', 'cassava'] },
  { id: 'lamphun', th: 'ลำพูน', en: 'Lamphun', rg: 'north', lat: 18.57, lng: 99.01, main: ['longan', 'rice'] },
  { id: 'phrae', th: 'แพร่', en: 'Phrae', rg: 'north', lat: 18.14, lng: 100.14, main: ['rice', 'maize', 'longan'] },
  { id: 'nan', th: 'น่าน', en: 'Nan', rg: 'north', lat: 18.78, lng: 100.77, main: ['rice', 'maize', 'longan'] },
  { id: 'phayao', th: 'พะเยา', en: 'Phayao', rg: 'north', lat: 19.17, lng: 99.91, main: ['rice', 'maize', 'longan'] },
  { id: 'uttaradit', th: 'อุตรดิตถ์', en: 'Uttaradit', rg: 'north', lat: 17.62, lng: 100.1, main: ['durian', 'rice', 'cassava'] },
  { id: 'sukhothai', th: 'สุโขทัย', en: 'Sukhothai', rg: 'north', lat: 17.01, lng: 99.82, main: ['rice', 'sugarcane', 'cassava'] },
  { id: 'phitsanulok', th: 'พิษณุโลก', en: 'Phitsanulok', rg: 'north', lat: 16.82, lng: 100.26, main: ['rice', 'sugarcane', 'cassava'] },
  { id: 'phichit', th: 'พิจิตร', en: 'Phichit', rg: 'north', lat: 16.44, lng: 100.35, main: ['rice', 'sugarcane'] },
  { id: 'kamphaengphet', th: 'กำแพงเพชร', en: 'Kamphaeng Phet', rg: 'north', lat: 16.48, lng: 99.52, main: ['rice', 'sugarcane', 'cassava'] },
  { id: 'phetchabun', th: 'เพชรบูรณ์', en: 'Phetchabun', rg: 'north', lat: 16.42, lng: 101.16, main: ['maize', 'cassava', 'rice'] },
  { id: 'tak', th: 'ตาก', en: 'Tak', rg: 'north', lat: 16.88, lng: 99.13, main: ['rice', 'sugarcane', 'maize'] },
  { id: 'nakhonsawan', th: 'นครสวรรค์', en: 'Nakhon Sawan', rg: 'north', lat: 15.7, lng: 100.14, main: ['rice', 'sugarcane', 'cassava'] },
  { id: 'uthaithani', th: 'อุทัยธานี', en: 'Uthai Thani', rg: 'north', lat: 15.38, lng: 100.02, main: ['rice', 'sugarcane'] },
  { id: 'maehongson', th: 'แม่ฮ่องสอน', en: 'Mae Hong Son', rg: 'north', lat: 19.3, lng: 97.97, main: ['rice', 'maize'] }
];

/* ---------- PROVINCES: NORTHEAST (20) ---------- */
const NE: Province[] = [
  { id: 'nakhonratchasima', th: 'นครราชสีมา', en: 'Nakhon Ratchasima', rg: 'ne', lat: 14.97, lng: 102.1, main: ['rice', 'cassava', 'maize', 'sugarcane'] },
  { id: 'buriram', th: 'บุรีรัมย์', en: 'Buriram', rg: 'ne', lat: 14.99, lng: 103.1, main: ['rice', 'cassava', 'sugarcane'] },
  { id: 'surin', th: 'สุรินทร์', en: 'Surin', rg: 'ne', lat: 14.88, lng: 103.49, main: ['rice', 'cassava'] },
  { id: 'srisaket', th: 'ศรีสะเกษ', en: 'Sisaket', rg: 'ne', lat: 15.12, lng: 104.33, main: ['rice', 'cassava', 'rubber'] },
  { id: 'ubon', th: 'อุบลราชธานี', en: 'Ubon Ratchathani', rg: 'ne', lat: 15.24, lng: 104.85, main: ['rice', 'cassava', 'rubber'] },
  { id: 'yasothon', th: 'ยโสธร', en: 'Yasothon', rg: 'ne', lat: 15.79, lng: 104.14, main: ['rice', 'cassava'] },
  { id: 'amnatcharoen', th: 'อำนาจเจริญ', en: 'Amnat Charoen', rg: 'ne', lat: 15.86, lng: 104.63, main: ['rice', 'rubber', 'cassava'] },
  { id: 'mukdahan', th: 'มุกดาหาร', en: 'Mukdahan', rg: 'ne', lat: 16.54, lng: 104.72, main: ['rice', 'rubber', 'cassava'] },
  { id: 'nakhonphanom', th: 'นครพนม', en: 'Nakhon Phanom', rg: 'ne', lat: 17.41, lng: 104.78, main: ['rice', 'rubber'] },
  { id: 'sakonnakhon', th: 'สกลนคร', en: 'Sakon Nakhon', rg: 'ne', lat: 17.17, lng: 104.15, main: ['rice', 'rubber', 'cassava'] },
  { id: 'kalasin', th: 'กาฬสินธุ์', en: 'Kalasin', rg: 'ne', lat: 16.43, lng: 103.51, main: ['rice', 'cassava', 'sugarcane'] },
  { id: 'khonkaen', th: 'ขอนแก่น', en: 'Khon Kaen', rg: 'ne', lat: 16.44, lng: 102.83, main: ['rice', 'sugarcane', 'cassava'] },
  { id: 'mahasarakham', th: 'มหาสารคาม', en: 'Maha Sarakham', rg: 'ne', lat: 16.18, lng: 103.3, main: ['rice', 'sugarcane', 'cassava'] },
  { id: 'roiet', th: 'ร้อยเอ็ด', en: 'Roi Et', rg: 'ne', lat: 16.05, lng: 103.65, main: ['rice', 'cassava'] },
  { id: 'loei', th: 'เลย', en: 'Loei', rg: 'ne', lat: 17.49, lng: 101.73, main: ['maize', 'rubber', 'rice'] },
  { id: 'nongbualamphu', th: 'หนองบัวลำภู', en: 'Nong Bua Lamphu', rg: 'ne', lat: 17.2, lng: 102.44, main: ['rice', 'rubber'] },
  { id: 'udonthani', th: 'อุดรธานี', en: 'Udon Thani', rg: 'ne', lat: 17.41, lng: 102.79, main: ['rice', 'cassava', 'rubber'] },
  { id: 'nongkhai', th: 'หนองคาย', en: 'Nong Khai', rg: 'ne', lat: 17.88, lng: 102.75, main: ['rice', 'rubber'] },
  { id: 'buengkan', th: 'บึงกาฬ', en: 'Bueng Kan', rg: 'ne', lat: 18.36, lng: 103.65, main: ['rice', 'rubber'] },
  { id: 'chaiyaphum', th: 'ชัยภูมิ', en: 'Chaiyaphum', rg: 'ne', lat: 15.81, lng: 102.03, main: ['rice', 'cassava', 'sugarcane', 'maize'] }
];

/* ---------- PROVINCES: CENTRAL (14) ---------- */
const CENTRAL: Province[] = [
  { id: 'bangkok', th: 'กรุงเทพมหานคร', en: 'Bangkok', rg: 'central', lat: 13.76, lng: 100.5, main: ['rice'] },
  { id: 'nonthaburi', th: 'นนทบุรี', en: 'Nonthaburi', rg: 'central', lat: 13.86, lng: 100.51, main: ['rice', 'durian'] },
  { id: 'pathumthani', th: 'ปทุมธานี', en: 'Pathum Thani', rg: 'central', lat: 14.02, lng: 100.53, main: ['rice'] },
  { id: 'ayutthaya', th: 'พระนครศรีอยุธยา', en: 'Ayutthaya', rg: 'central', lat: 14.35, lng: 100.58, main: ['rice'] },
  { id: 'angthong', th: 'อ่างทอง', en: 'Ang Thong', rg: 'central', lat: 14.59, lng: 100.45, main: ['rice'] },
  { id: 'singburi', th: 'สิงห์บุรี', en: 'Sing Buri', rg: 'central', lat: 14.89, lng: 100.41, main: ['rice'] },
  { id: 'chainat', th: 'ชัยนาท', en: 'Chai Nat', rg: 'central', lat: 15.19, lng: 100.12, main: ['rice'] },
  { id: 'lophuri', th: 'ลพบุรี', en: 'Lopburi', rg: 'central', lat: 14.8, lng: 100.65, main: ['rice', 'sugarcane', 'maize'] },
  { id: 'saraburi', th: 'สระบุรี', en: 'Saraburi', rg: 'central', lat: 14.53, lng: 100.92, main: ['maize', 'sugarcane', 'rice'] },
  { id: 'suphanburi', th: 'สุพรรณบุรี', en: 'Suphan Buri', rg: 'central', lat: 14.47, lng: 100.12, main: ['rice', 'sugarcane', 'cassava'] },
  { id: 'nakhonpathom', th: 'นครปฐม', en: 'Nakhon Pathom', rg: 'central', lat: 13.82, lng: 100.06, main: ['rice', 'sugarcane'] },
  { id: 'samutsakhon', th: 'สมุทรสาคร', en: 'Samut Sakhon', rg: 'central', lat: 13.55, lng: 100.28, main: ['rice'] },
  { id: 'samutsongkhram', th: 'สมุทรสงคราม', en: 'Samut Songkhram', rg: 'central', lat: 13.41, lng: 100.0, main: ['rice'] },
  { id: 'samutprakan', th: 'สมุทรปราการ', en: 'Samut Prakan', rg: 'central', lat: 13.6, lng: 100.61, main: ['rice'] }
];

/* ---------- PROVINCES: EAST (8) + WEST (4) ---------- */
const EAST_WEST: Province[] = [
  { id: 'chonburi', th: 'ชลบุรี', en: 'Chonburi', rg: 'east', lat: 13.36, lng: 100.98, main: ['cassava', 'sugarcane', 'durian'] },
  { id: 'chachoengsao', th: 'ฉะเชิงเทรา', en: 'Chachoengsao', rg: 'east', lat: 13.69, lng: 101.07, main: ['rice', 'cassava', 'durian'] },
  { id: 'rayong', th: 'ระยอง', en: 'Rayong', rg: 'east', lat: 12.68, lng: 101.28, main: ['durian', 'rambutan', 'mangosteen', 'cassava', 'rubber'] },
  { id: 'chanthaburi', th: 'จันทบุรี', en: 'Chanthaburi', rg: 'east', lat: 12.61, lng: 102.1, main: ['durian', 'rambutan', 'mangosteen', 'rubber'] },
  { id: 'trat', th: 'ตราด', en: 'Trat', rg: 'east', lat: 12.24, lng: 102.51, main: ['durian', 'rambutan', 'mangosteen', 'rubber'] },
  { id: 'prachinburi', th: 'ปราจีนบุรี', en: 'Prachinburi', rg: 'east', lat: 14.05, lng: 101.37, main: ['rice', 'cassava', 'sugarcane', 'durian'] },
  { id: 'sakaew', th: 'สระแก้ว', en: 'Sa Kaeo', rg: 'east', lat: 13.82, lng: 102.07, main: ['cassava', 'sugarcane'] },
  { id: 'nakhonnayok', th: 'นครนายก', en: 'Nakhon Nayok', rg: 'east', lat: 14.2, lng: 101.21, main: ['rice', 'durian'] },
  { id: 'kanchanaburi', th: 'กาญจนบุรี', en: 'Kanchanaburi', rg: 'west', lat: 14.02, lng: 99.53, main: ['sugarcane', 'cassava', 'rice'] },
  { id: 'ratchaburi', th: 'ราชบุรี', en: 'Ratchaburi', rg: 'west', lat: 13.53, lng: 99.81, main: ['sugarcane', 'rice'] },
  { id: 'phetchaburi', th: 'เพชรบุรี', en: 'Phetchaburi', rg: 'west', lat: 13.11, lng: 99.94, main: ['sugarcane', 'rice'] },
  { id: 'prachuapkhirikhan', th: 'ประจวบคีรีขันธ์', en: 'Prachuap Khiri Khan', rg: 'west', lat: 11.81, lng: 99.8, main: ['palm', 'rubber'] }
];

/* ---------- PROVINCES: SOUTH (14) ---------- */
const SOUTH: Province[] = [
  { id: 'chumphon', th: 'ชุมพร', en: 'Chumphon', rg: 'south', lat: 10.49, lng: 99.18, main: ['rubber', 'palm', 'durian', 'rambutan'] },
  { id: 'ranong', th: 'ระนอง', en: 'Ranong', rg: 'south', lat: 9.96, lng: 98.63, main: ['rubber', 'palm'] },
  { id: 'suratthani', th: 'สุราษฎร์ธานี', en: 'Surat Thani', rg: 'south', lat: 9.14, lng: 99.33, main: ['rubber', 'palm', 'durian', 'mangosteen'] },
  { id: 'nakhonsithammarat', th: 'นครศรีธรรมราช', en: 'Nakhon Si Thammarat', rg: 'south', lat: 8.43, lng: 99.96, main: ['rubber', 'palm', 'rice'] },
  { id: 'phatthalung', th: 'พัทลุง', en: 'Phatthalung', rg: 'south', lat: 7.62, lng: 100.07, main: ['rubber', 'rice'] },
  { id: 'songkhla', th: 'สงขลา', en: 'Songkhla', rg: 'south', lat: 7.19, lng: 100.6, main: ['rubber', 'rice', 'palm'] },
  { id: 'satun', th: 'สตูล', en: 'Satun', rg: 'south', lat: 6.62, lng: 100.07, main: ['rubber', 'palm'] },
  { id: 'trang', th: 'ตรัง', en: 'Trang', rg: 'south', lat: 7.56, lng: 99.61, main: ['rubber', 'palm', 'durian'] },
  { id: 'phangnga', th: 'พังงา', en: 'Phang Nga', rg: 'south', lat: 8.45, lng: 98.52, main: ['rubber', 'palm', 'durian'] },
  { id: 'phuket', th: 'ภูเก็ต', en: 'Phuket', rg: 'south', lat: 7.88, lng: 98.39, main: ['rubber'] },
  { id: 'krabi', th: 'กระบี่', en: 'Krabi', rg: 'south', lat: 8.09, lng: 98.91, main: ['palm', 'rubber'] },
  { id: 'yala', th: 'ยะลา', en: 'Yala', rg: 'south', lat: 6.54, lng: 101.28, main: ['rubber', 'rice'] },
  { id: 'pattani', th: 'ปัตตานี', en: 'Pattani', rg: 'south', lat: 6.87, lng: 101.25, main: ['rubber', 'rice'] },
  { id: 'narathiwat', th: 'นราธิวาส', en: 'Narathiwat', rg: 'south', lat: 6.43, lng: 101.82, main: ['rubber', 'rice', 'palm'] }
];

export const PROVINCES: Province[] = [...NORTH, ...NE, ...CENTRAL, ...EAST_WEST, ...SOUTH];

/* ---------- CROPS (10) ---------- */
export const CROPS: Crop[] = [
  {
    id: 'durian', th: 'ทุเรียน', en: 'Durian', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 150, dec: 1,
    season: [1.28, 1.22, 1.15, 0.95, 0.78, 0.76, 0.84, 0.95, 1.02, 1.1, 1.16, 1.22],
    harvest: [3, 9], peak: [4, 5, 6], grades: true,
    main: ['uttaradit', 'nonthaburi', 'chachoengsao', 'nakhonnayok', 'rayong', 'chanthaburi', 'trat', 'prachinburi', 'chonburi', 'chumphon', 'ranong', 'suratthani', 'nakhonsithammarat', 'trang', 'phangnga', 'phuket'],
    tip: { th: 'เช็ก %เนื้อแห้งก่อนตัด (จุดตรวจก่อนตัด 53 จุด ภาคตะวันออก) · ผลแก่เต็มที่ได้เกรดและราคาที่ดีกว่า', en: 'Check % dry matter before cutting (53 pre-harvest checkpoints in the East) · fully ripe fruit earns a better grade and price.' }
  },
  {
    id: 'rubber', th: 'ยางพารา', en: 'Rubber', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 68, dec: 2,
    season: [1.06, 1.04, 1.0, 0.96, 0.95, 0.97, 1.0, 1.02, 1.04, 1.06, 1.07, 1.07],
    harvest: [1, 12], peak: [], grades: false,
    main: ['srisaket', 'ubon', 'amnatcharoen', 'mukdahan', 'nakhonphanom', 'sakonnakhon', 'loei', 'nongbualamphu', 'udonthani', 'nongkhai', 'buengkan', 'rayong', 'chanthaburi', 'trat', 'prachuapkhirikhan', 'chumphon', 'ranong', 'suratthani', 'nakhonsithammarat', 'phatthalung', 'songkhla', 'satun', 'trang', 'phangnga', 'phuket', 'krabi', 'yala', 'pattani', 'narathiwat'],
    tip: { th: 'ราคายางอ่อนไหวกับตลาดโลกและค่าเงิน · ฝนตกหนักช่วงกรีดลดปริมาณน้ำยาง กดดันราคาได้', en: 'Rubber prices track world markets and the baht · heavy rain during tapping cuts latex volume and can pressure prices.' }
  },
  {
    id: 'cassava', th: 'มันสำปะหลัง', en: 'Cassava', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 2.6, dec: 2,
    season: [1.02, 1.04, 1.06, 1.05, 1.02, 1.0, 0.97, 0.96, 0.97, 0.99, 1.0, 1.01],
    harvest: [1, 12], peak: [3, 4, 5], grades: false,
    main: ['lampang', 'uttaradit', 'sukhothai', 'phitsanulok', 'kamphaengphet', 'phetchabun', 'tak', 'nakhonsawan', 'nakhonratchasima', 'buriram', 'surin', 'srisaket', 'ubon', 'yasothon', 'amnatcharoen', 'mukdahan', 'sakonnakhon', 'kalasin', 'khonkaen', 'mahasarakham', 'roiet', 'udonthani', 'chaiyaphum', 'suphanburi', 'chonburi', 'chachoengsao', 'prachinburi', 'sakaew', 'kanchanaburi'],
    tip: { th: 'ขุดตามอายุแปลง (8–12 เดือน) · เปอร์เซ็นต์แป้ง (สตาร์ช) สูงขึ้นตามอายุ ช่วงฝนชุกหัวสดเน่าเสียง่าย', en: 'Harvest at 8–12 months · starch content rises with age; wet-season harvest risks rot.' }
  },
  {
    id: 'rice', th: 'ข้าว', en: 'Rice', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 12.5, dec: 2,
    season: [1.04, 1.0, 0.98, 1.02, 1.06, 1.08, 1.05, 1.0, 0.97, 0.99, 1.02, 1.05],
    harvest: [1, 12], peak: [11, 12, 1, 4, 5], grades: false,
    main: ['*'],
    tip: { th: 'ข้าวเปลือกความชื้นต่ำได้ราคาดีกว่า · ตากให้ได้ความชื้น 14–15% ก่อนขาย นาปรังออกตลาดช่วง เม.ย.–พ.ค.', en: 'Low-moisture paddy fetches more · dry to 14–15% before selling. Off-season rice floods the market Apr–May.' }
  },
  {
    id: 'maize', th: 'ข้าวโพดเลี้ยงสัตว์', en: 'Maize', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 10.5, dec: 2,
    season: [1.05, 1.03, 1.0, 0.98, 1.0, 1.03, 1.05, 1.06, 1.04, 1.02, 1.0, 1.03],
    harvest: [1, 12], peak: [5, 6, 7, 8], grades: false,
    main: ['chiangmai', 'chiangrai', 'phrae', 'nan', 'phayao', 'maehongson', 'tak', 'phetchabun', 'lophuri', 'saraburi', 'nakhonratchasima', 'chaiyaphum', 'loei'],
    tip: { th: 'ฝักแห้งดีเก็บได้นาน · ระวังราคาช่วงผลผลิตพร้อมกันเดือน มิ.ย.–ส.ค.', en: 'Well-dried cobs store well · watch the price dip when harvests align Jun–Aug.' }
  },
  {
    id: 'sugarcane', th: 'อ้อย', en: 'Sugarcane', unit: { th: 'บาท/ตัน', en: 'THB/tonne' }, base: 1050, dec: 0,
    season: [1.15, 1.1, 1.02, 0.98, 0.95, 0.96, 1.0, 1.05, 1.1, 1.14, 1.16, 1.16],
    harvest: [12, 4], peak: [1, 2, 3], grades: false,
    main: ['lampang', 'sukhothai', 'phitsanulok', 'phichit', 'kamphaengphet', 'nakhonsawan', 'uthaithani', 'khonkaen', 'kalasin', 'mahasarakham', 'chaiyaphum', 'buriram', 'suphanburi', 'nakhonpathom', 'kanchanaburi', 'ratchaburi', 'phetchaburi', 'chonburi', 'sakaew', 'lophuri', 'saraburi', 'tak'],
    tip: { th: 'ราคาอ้อยผูกกับความหวาน (ซีซีเอส) · ตัดช่วงหน้าแล้งได้ซีซีเอสสูง ราคาดี', en: 'Sugarcane value tracks sweetness (CCS) · dry-season cutting gives higher CCS and better prices.' }
  },
  {
    id: 'palm', th: 'ปาล์มน้ำมัน', en: 'Oil palm', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 5.8, dec: 2,
    season: [1.06, 1.05, 1.03, 1.0, 0.97, 0.96, 0.97, 0.99, 1.0, 1.02, 1.04, 1.06],
    harvest: [1, 12], peak: [], grades: false,
    main: ['prachuapkhirikhan', 'chumphon', 'ranong', 'suratthani', 'nakhonsithammarat', 'phatthalung', 'songkhla', 'satun', 'trang', 'phangnga', 'krabi', 'narathiwat'],
    tip: { th: 'ทะลายสดส่งโรงสกัดภายใน 24 ชม. · เปอร์เซ็นต์น้ำมันลดลงทุกวันที่ทิ้งไว้', en: 'Send fresh bunches to the mill within 24 hours · oil yield drops every day they sit.' }
  },
  {
    id: 'rambutan', th: 'เงาะ', en: 'Rambutan', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 26, dec: 1,
    season: [1.3, 1.25, 1.18, 1.0, 0.85, 0.9, 1.0, 1.12, 1.2, 1.28, 1.32, 1.32],
    harvest: [5, 8], peak: [6, 7], grades: false,
    main: ['rayong', 'chanthaburi', 'trat', 'chumphon', 'suratthani', 'nakhonsithammarat', 'ranong'],
    tip: { th: 'เงาะเก็บหลังผลแก่ 105–110 วันหลังดอกบาน · พีคเดือน มิ.ย.–ก.ค. ราคามักต่ำสุด', en: 'Harvest 105–110 days after bloom · the Jun–Jul peak usually brings the lowest prices.' }
  },
  {
    id: 'mangosteen', th: 'มังคุด', en: 'Mangosteen', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 62, dec: 1,
    season: [1.35, 1.3, 1.2, 1.0, 0.85, 0.92, 1.05, 1.18, 1.26, 1.32, 1.36, 1.36],
    harvest: [5, 9], peak: [6, 7, 8], grades: false,
    main: ['rayong', 'chanthaburi', 'trat', 'chumphon', 'suratthani', 'nakhonsithammarat', 'ranong', 'trang'],
    tip: { th: 'มังคุดยางไหล (gamboge) ลดราคามาก · ตัดช่วงอากาศแห้ง ระวังอย่าให้ผลกระแทก', en: 'Gamboge (yellow sap) cuts the price hard · harvest in dry weather and handle gently.' }
  },
  {
    id: 'longan', th: 'ลำไย', en: 'Longan', unit: { th: 'บาท/กก.', en: 'THB/kg' }, base: 36, dec: 1,
    season: [1.05, 1.0, 0.95, 0.9, 0.95, 1.0, 1.08, 1.15, 1.18, 1.15, 1.1, 1.07],
    harvest: [7, 9], peak: [8, 9], grades: false,
    main: ['chiangmai', 'chiangrai', 'lamphun', 'lampang', 'phayao', 'nan'],
    tip: { th: 'ลำไยเกรด AA–C ราคาต่างกันมาก · คัดเกรดก่อนขาย ลำไยนอกฤดูราคาดีแต่ต้นทุนสูง', en: 'Grades AA–C differ hugely in price · sort before selling; off-season longan pays more but costs more.' }
  }
];

export const cropById = (id: string): Crop | undefined => CROPS.find(c => c.id === id);
export const provById = (id: string): Province | undefined => PROVINCES.find(p => p.id === id);

export const REGION_ORDER: RegionId[] = ['north', 'ne', 'central', 'east', 'west', 'south'];