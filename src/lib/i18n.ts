/* Harvest Trend · รู้ทันราคา — Thai + English strings (ported from app.js) */

export type Lang = 'th' | 'en';

export interface Dict {
  monthsShort: string[];
  skip: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSub: string;
  heroStat1: string;
  heroStat2: string;
  heroStat3: string;
  heroCta: string;
  shareBtn: string;
  shareCopied: string;
  shareBody: string;
  nav1: string;
  navPrice: string;
  nav2: string;
  nav3: string;
  nav4: string;
  lineNav: string;
  lineCtaTitle: string;
  lineCtaBody: string;
  lineCtaBtn: string;
  shareLine: string;
  saveImgBtn: string;
  saveImgAria: string;
  imgDisclaimer: string;
  imgSaved: string;
  imgFailed: string;
  how1: string;
  how2: string;
  how3: string;
  mockNote: string;
  liveNote: string;
  lbLiveTitle: string;
  lbLiveMeta: string;
  lbOffTitle: string;
  lbOffMeta: string;
  lbFileTitle: string;
  lbFileMeta: string;
  liveRealLabel: string;
  pickTitle: string;
  pickSub: string;
  pickPh: string;
  searchPh: string;
  gpsBtn: string;
  gpsBusy: string;
  gpsFail: string;
  gpsDenied: string;
  gpsDeniedInApp: string;
  gpsNoFix: string;
  provEmpty: string;
  provCount: string;
  cropTitle: string;
  cropSub: string;
  mainTag: string;
  /* price map page */
  mapTitle: string;
  mapSub: string;
  mapNote: string;
  mapLive: string;
  mapModel: string;
  mapTap: string;
  mapCropLabel: string;
  viewMap: string;
  navMap: string;
  navCost: string;
  /* cost calculator page */
  costTitle: string;
  costSub: string;
  costCoverage: string;
  costNoData: string;
  costOfficial: string;
  costYourCost: string;
  costCost: string;
  costYield: string;
  costYieldPh: string;
  costBreakEven: string;
  costCurrent: string;
  costProfit: string;
  costLoss: string;
  costEven: string;
  costSource: string;
  viewCost: string;
  /* sell calendar (P1) */
  sellTitle: string;
  sellSub: string;
  sellPeak: string;
  sellNow: string;
  sellAll: string;
  freshWarn: string;
  /* price thresholds (P2) */
  thrTitle: string;
  thrSub: string;
  thrPh: string;
  thrSet: string;
  thrRemove: string;
  thrNone: string;
  thrActive: string;
  thrHit: string;
  thrCurrent: string;
  /* push (P4) */
  pushTitle: string;
  pushSub: string;
  pushOn: string;
  pushOff: string;
  pushDenied: string;
  pushUnsupported: string;
  pushSaved: string;
  pushFail: string;
  /* report sync (supabase) */
  repShared: string;
  repSyncFail: string;
  /* LINE login */
  llTitle: string;
  llSub: string;
  llConnect: string;
  llDisconnect: string;
  llWelcome: string;
  llFail: string;
  llExpired: string;
  /* farmer heatmap */
  hmGov: string;
  hmFarmers: string;
  hmEmpty: string;
  hmNote: string;
  hmSynced: string;
  recKicker: string;
  youAt: string;
  confPrefix: string;
  confSuffix: string;
  watchAdd: string;
  watchAdded: string;
  watchExists: string;
  watchRemoved: string;
  scrollReport: string;
  viewChart: string;
  sig1n: string;
  sig2n: string;
  sig3n: string;
  sig4n: string;
  sigCarouselLabel: string;
  sigSwipeHint: string;
  priceTitleTpl: string;
  priceSubTpl: string;
  livePriceSubTpl: string;
  legAct: string;
  legFore: string;
  legBand: string;
  todayLbl: string;
  wk: string;
  baht: string;
  chartAriaTpl: string;
  chartNote: string;
  nowTrendUp: string;
  nowTrendDown: string;
  nowTrendFlat: string;
  last5w: string;
  sigTitle: string;
  sigSub: string;
  s1name: string;
  s2name: string;
  s3name: string;
  s4name: string;
  why: string;
  s1why: string;
  s2why: string;
  s3why: string;
  s4why: string;
  ensCaption: string;
  seasonTitle: string;
  seasonSub: string;
  seasonCellTitle: string;
  sLegH: string;
  sLegP: string;
  sLegV: string;
  sLegNow: string;
  harvTag: string;
  peakTag: string;
  seasonNow: string;
  supplyRising: string;
  supplyPeak: string;
  supplyEasing: string;
  supplyNormal: string;
  harvestYes: string;
  harvestNo: string;
  harvestAll: string;
  peakIn: string;
  peakNow: string;
  weatherWet: string;
  weatherNormal: string;
  weatherDry: string;
  recSell: string;
  recWait: string;
  recRecover: string;
  confHigh: string;
  confMedHigh: string;
  confMed: string;
  confMedLow: string;
  momUp: string;
  momDown: string;
  momFlat: string;
  recBodySell: string;
  recBodyWait: string;
  recBodyRecover: string;
  recCloseSell: string;
  recCloseWait: string;
  recCloseRecover: string;
  del: string;
  reportTitle: string;
  reportSub: string;
  fProv: string;
  fCrop: string;
  fPrice: string;
  fPricePh: string;
  fNote: string;
  fNotePh: string;
  fSubmit: string;
  repListT: string;
  repEmpty: string;
  repTip: string;
  repSaved: string;
  repBad: string;
  repQuick: string;
  repShowAll: string;
  repCollapse: string;
  qcProv: string;
  qcCrop: string;
  chartShare: string;
  chartFollowAdd: string;
  chartFollowRemove: string;
  tblTitle: string;
  tblWeek: string;
  tblMonth: string;
  tblPrice: string;
  tblType: string;
  tblHist: string;
  tblFore: string;
  tblExport: string;
  csvDone: string;
  range26Lbl: string;
  minLbl: string;
  maxLbl: string;
  avgLbl: string;
  recReasons: string;
  statChg5: string;
  statMin: string;
  statMax: string;
  statAvg: string;
  statFore: string;
  chartMin: string;
  chartMax: string;
  tblChg: string;
  watchTitle: string;
  watchSub: string;
  watchEmpty: string;
  watchGoTo: string;
  watchStripTitle: string;
  watchEmptyGo: string;
  watchLineNote: string;
  cmpTitle: string;
  cmpSub: string;
  cmpToggleAria: string;
  cmpClear: string;
  cmpEmpty: string;
  cmpMaxMsg: string;
  tickerLbl: string;
  tickerAria: string;
  aboutTitle: string;
  p1: string;
  p2: string;
  p3: string;
  srcTitle: string;
  sdg1: string;
  sdg2: string;
  sdg8: string;
  sdg12: string;
  footDisc: string;
  footCredit: string;
  regionAll: string;
  lineTitle: string;
  lineSub: string;
  lineStatusCheck: string;
  lineStatusOk: string;
  lineStatusPrep: string;
  lineStatusFail: string;
  demoTitle: string;
  demoSub: string;
  chatPh: string;
  chatSend: string;
  chatAria: string;
  chipsAria: string;
  addTitle: string;
  qrGen: string;
  qrAlt: string;
  addBtn: string;
  step1: string;
  step2: string;
  step3: string;
  cmdTitle: string;
  cmdHead1: string;
  cmdHead2: string;
  cmd1a: string;
  cmd2a: string;
  cmd3a: string;
  cmd4a: string;
  cmd5a: string;
  cmdNote: string;
  featTitle: string;
  feat1: string;
  feat2: string;
  feat3: string;
  feat4: string;
  feat5: string;
  feat6: string;
  faqTitle: string;
  faq1: string;
  faq2: string;
  faq3: string;
  typing: string;
  demoNoBackend: string;
  demoFail: string;
  welcome: string;
  aFontSize: string;
  aFontDown: string;
  aFontUp: string;
  aNav: string;
  aRegion: string;
  aProvList: string;
  aProvSearch: string;
  aProvSelect: string;
  aCrop: string;
  aQcProv: string;
  aQcCrop: string;
  aGrade: string;
  docTitleHome: string;
  docTitleChart: string;
  docTitleReport: string;
  docTitleWatch: string;
  docTitleAbout: string;
  docTitleLine: string;
  metaDescHome: string;
  metaDescChart: string;
  metaDescReport: string;
  metaDescWatch: string;
  metaDescAbout: string;
  metaDescLine: string;
  /* v2 additions */
  recentTitle: string;
  recentSub: string;
  recentEmpty: string;
  recentClear: string;
  voiceRead: string;
  voiceStop: string;
  voiceUnsupported: string;
  voiceReading: string;
  backHome: string;
  openApp: string;
}

export const T: Record<Lang, Dict> = {
  th: {
    monthsShort: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
    skip: 'ข้ามไปยังเนื้อหาหลัก',
    heroEyebrow: 'เครื่องมือช่วยตัดสินใจราคาพืชผล · ครอบคลุมทั่วประเทศ',
    heroTitle: 'รู้ก่อนขาย ได้จังหวะที่ดีกว่า',
    heroSub: 'เลือกจังหวัดและพืชของคุณ รับคำแนะนำจังหวะเก็บเกี่ยว/ขายพร้อมเหตุผลประกอบที่เข้าใจง่าย ภายใน 2 คลิก ไม่ต้องเป็นผู้เชี่ยวชาญ',
    heroStat1: 'จังหวัดทั่วประเทศ', heroStat2: 'พืชเศรษฐกิจหลัก', heroStat3: 'สัญญาณวิเคราะห์ร่วม',
    heroCta: 'เริ่มตรวจราคาเลย',
    shareBtn: 'แชร์ผลลัพธ์', shareCopied: 'คัดลอกผลลัพธ์แล้ว วางเพื่อแชร์ได้เลย',
    shareBody: 'Harvest Trend · {prov} · {crop}: {verdict} (ราคาปัจจุบัน ~{price} {unit})',
    nav1: 'ตรวจราคา', navPrice: 'ราคา & แนวโน้ม', nav2: 'รายงานราคา', nav3: 'ติดตาม', nav4: 'เกี่ยวกับ', lineNav: 'บอท LINE',
    lineCtaTitle: 'รับคำแนะนำผ่าน LINE', lineCtaBody: 'เพิ่ม LINE OA แล้วส่งข้อความ "ราคา ระยอง ทุเรียน" รับคำแนะนำจังหวะขายทันที', lineCtaBtn: 'ดูวิธีใช้งาน',
    shareLine: 'แชร์ผ่าน LINE',
    saveImgBtn: 'บันทึกภาพ', saveImgAria: 'บันทึกผลลัพธ์เป็นรูปภาพ',
    imgDisclaimer: 'ข้อมูลจำลอง ไม่ใช่คำแนะนำการลงทุน', imgSaved: 'บันทึกภาพแล้ว', imgFailed: 'สร้างภาพไม่สำเร็จ',
    how1: 'เลือกจังหวัดของคุณ', how2: 'เลือกพืชที่ปลูก', how3: 'อ่านคำแนะนำ + เช็กกราฟราคา',
    mockNote: 'ข้อมูลราคาในเว็บนี้เป็นข้อมูลจำลอง (mock data) เพื่อการใช้งานจริงของต้นแบบ · ราคาจากแบบจำลอง ไม่ใช่ราคาตลาดจริง ก่อนตัดสินใจขายควรเช็กข้อมูลหน่วยงานราชการหรือตลาดกลางในพื้นที่ด้วย',
    liveNote: 'ราคาจริงจากหน่วยงานราชการ (data.go.th: สำนักงานจังหวัด / สำนักงานเศรษฐกิจการเกษตร + ธนาคารแห่งประเทศไทย) · อัปเดตอัตโนมัติทุก 10 วินาที · พื้นที่ที่ยังไม่มีข้อมูลราชการแสดงค่าประมาณจากแบบจำลองและมีป้ายกำกับ',
    lbLiveTitle: 'ราคาจริงจากหน่วยงาน', lbLiveMeta: 'อัปเดต {t} · ดึงอัตโนมัติทุก 10 วิ',
    lbOffTitle: 'ข้อมูลจำลอง', lbOffMeta: 'เชื่อมต่อราคาจริงไม่ได้ · กลับเป็นอัตโนมัติเมื่อออนไลน์',
    lbFileTitle: 'ข้อมูลจำลอง', lbFileMeta: 'เปิดเว็บที่ deploy แล้วเพื่อดูราคาจริง (harvest-ecc.vercel.app)',
    liveRealLabel: 'ราคาจริง · {src}',
    pickTitle: 'เลือกจังหวัดของคุณ', pickSub: 'เลือกจังหวัดจากรายการ หรือใช้ตำแหน่ง GPS · ครอบคลุม 77 จังหวัด',
    pickPh: '— เลือกจังหวัด —',
    searchPh: 'ค้นหาจังหวัด เช่น ระยอง / Rayong', gpsBtn: 'ใช้ตำแหน่งของฉัน',
    gpsBusy: 'กำลังหาตำแหน่ง...', gpsFail: 'ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาเลือกจังหวัดด้วยตนเอง',
    gpsDenied: 'ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง · เปิดการตั้งค่าเบราว์เซอร์ > อนุญาตตำแหน่ง แล้วลองใหม่',
    gpsDeniedInApp: 'เบราว์เซอร์ในแอป (LINE/Facebook) บล็อกตำแหน่ง · เปิดผ่าน Safari/Chrome แทน แล้วลองใหม่',
    gpsNoFix: 'หาตำแหน่งไม่เจอ (GPS ช้า) · ลองอีกครั้ง หรือเลือกจังหวัดเอง',
    provEmpty: 'ไม่พบจังหวัดที่ค้นหา ลองพิมพ์ชื่อใหม่', provCount: '{n} จังหวัด',
    cropTitle: 'เลือกพืชที่ปลูก', cropSub: 'เรียงพืชที่นิยมปลูกในพื้นที่ของคุณไว้ก่อน · ป้าย "พื้นที่หลัก" หมายถึงแหล่งผลิตสำคัญ',
    mainTag: 'พื้นที่หลัก',
    mapTitle: 'แผนที่ราคารายจังหวัด', mapSub: 'ดูราคาพืชที่เลือกในทุกจังหวัดพร้อมกัน — ยิ่งสีเข้ม ราคายิ่งสูง',
    mapNote: 'แผนที่แบบออฟไลน์ (ไม่มีพื้นหลังแผนที่) โหลดเร็ว ใช้ได้แม้ไร้สัญญาณ · จังหวัดที่มีราคาจริงจากหน่วยงานราชการจะแสดงป้าย "ราคาจริง" นอกนั้นเป็นค่าประมาณจากแบบจำลอง',
    mapLive: 'ราคาจริง', mapModel: 'แบบจำลอง', mapTap: 'แตะจังหวัดเพื่อดูราคาและเปิดคำแนะนำ',
    mapCropLabel: 'เลือกพืช',
    viewMap: 'ดูแผนที่ราคา',
    navMap: 'แผนที่ราคา', navCost: 'ต้นทุน',
    costTitle: 'คำนวณต้นทุนและจุดคุ้มทุน', costSub: 'ใช้ต้นทุนการผลิตจากข้อมูลราชการ เปรียบเทียบกับราคาขายปัจจุบัน รู้ทันทีว่าขายแล้วกำไรหรือขาดทุน',
    costCoverage: 'ครอบคลุม 10 จาก 25 พืชที่มีข้อมูลราชการเปิดเผย',
    costNoData: 'ยังไม่มีข้อมูลต้นทุนราชการเปิดเผยสำหรับพืชนี้ · กรอกต้นทุนของคุณเองเพื่อคำนวณจุดคุ้มทุน',
    costOfficial: 'ข้อมูลราชการ', costYourCost: 'ต้นทุนของคุณเอง (บาท/ไร่)',
    costCost: 'ต้นทุน', costYield: 'ผลผลิตต่อไร่', costYieldPh: 'เช่น 1,200 (กก./ไร่)',
    costBreakEven: 'จุดคุ้มทุน (บาท/กก.)', costCurrent: 'ราคาขายปัจจุบัน',
    costProfit: 'กำไร', costLoss: 'ขาดทุน', costEven: 'คุ้มทุนพอดี',
    costSource: 'ที่มา', viewCost: 'คำนวณต้นทุน',
    sellTitle: 'ปฏิทินจังหวะขายดีที่สุด', sellSub: 'สัปดาห์ที่ราคาพีคของปี (จากแบบจำลองตามฤดูกาล)',
    sellPeak: 'ราคาพีค', sellNow: 'สัปดาห์นี้', sellAll: 'ตลอดทั้งปี',
    freshWarn: 'ข้อมูลราชการบางแหล่งอาจไม่สด (เช่น OAE 2021, DIT 2023) — ราคาเป็นค่าประมาณล่าสุดเท่าที่มี',
    thrTitle: 'ตั้งเกณฑ์ราคา', thrSub: 'ตั้งราคาที่ต้องการ แล้วแอปจะเตือนเมื่อราคาถึงเกณฑ์ (ในแอป)',
    thrPh: 'เช่น 120', thrSet: 'ตั้งเกณฑ์', thrRemove: 'ลบ',
    thrNone: 'ยังไม่มีเกณฑ์ — ตั้งเลย', thrActive: '{crop} ≥ {price} บาท', thrHit: 'ถึงเกณฑ์แล้ว! {crop} = {price} บาท',
    thrCurrent: 'ราคาปัจจุบัน {price}',
    pushTitle: 'แจ้งเตือนผ่านมือถือ', pushSub: 'เปิดเพื่อรับแจ้งเตือนราคา · iOS: ต้องติดตั้งแอปลงหน้าแรกก่อน',
    pushOn: 'เปิดการแจ้งเตือน', pushOff: 'ปิดการแจ้งเตือน',
    pushDenied: 'ถูกบล็อก — ไปเปิดในตั้งค่าเบราว์เซอร์', pushUnsupported: 'เบราว์เซอร์นี้ไม่รองรับ',
    pushSaved: 'ตั้งค่าสำเร็จ', pushFail: 'ตั้งค่าไม่สำเร็จ',
    repShared: 'ส่งขึ้นระบบแล้ว — ราคาของคุณช่วยเพื่อนเกษตรกรทั่วประเทศ', repSyncFail: 'บันทึกในเครื่องแล้ว แต่ส่งขึ้นระบบไม่สำเร็จ',
    llTitle: 'เชื่อมบัญชี LINE', llSub: 'เชื่อมเพื่อซิงค์ข้อมูลข้ามเครื่องในอนาคต (ต้องสร้าง LINE Login channel ก่อน — ดู docs/LINE-LOGIN-SETUP.md)',
    llConnect: 'เชื่อมบัญชี LINE', llDisconnect: 'ยกเลิกการเชื่อม', llWelcome: 'สวัสดี {name}',
    llFail: 'เชื่อมไม่สำเร็จ', llExpired: 'ลิงก์หมดอายุแล้ว — ลองใหม่',
    hmGov: 'ราชการ/แบบจำลอง', hmFarmers: 'ราคาจากชาวบ้าน', hmEmpty: 'ยังไม่มีรายงานสำหรับพืชนี้ — ไปที่หน้า "รายงานราคา" แล้วส่งราคาของคุณ',
    hmNote: 'รายงานจากเกษตรกร — ยังไม่ผ่านการตรวจสอบ ใช้เป็นข้อมูลประกอบเท่านั้น', hmSynced: 'ซิงค์กับระบบแล้ว',
    recKicker: 'คำแนะนำวันนี้', youAt: 'คุณอยู่ที่', confPrefix: 'ระดับความเชื่อมั่น:', confSuffix: '· จาก 4 สัญญาณ',
    watchAdd: 'ติดตามราคานี้', watchAdded: 'เพิ่มเข้ารายการติดตามแล้ว', watchExists: 'อยู่ในรายการติดตามแล้ว', watchRemoved: 'ลบออกจากรายการติดตามแล้ว',
    scrollReport: 'รายงานราคาที่ขายได้', viewChart: 'ดูกราฟราคา + สัญญาณ',
    sig1n: 'โมเมนตัมราคา', sig2n: 'ปริมาณผลผลิต', sig3n: 'ช่วงเก็บเกี่ยว', sig4n: 'สภาพอากาศ',
    sigCarouselLabel: 'สัญญาณประกอบคำแนะนำ 4 ข้อ ปัดดูทีละข้อ', sigSwipeHint: 'ปัดซ้าย-ขวาเพื่อดูสัญญาณอื่น',
    priceTitleTpl: 'แนวโน้มราคา {crop} · {prov}',
    priceSubTpl: 'ราคาจำลองย้อนหลัง 26 สัปดาห์ + พยากรณ์ 4 สัปดาห์ (บาท/หน่วย) · สร้างจากแบบจำลองฤดูกาลของ {crop}',
    livePriceSubTpl: 'ราคาย้อนหลัง 26 สัปดาห์ + พยากรณ์ 4 สัปดาห์ (บาท/หน่วย) · ยึดราคาจริงล่าสุดจากหน่วยงานราชการ · จุดย้อนหลังเป็นค่าประมาณตามฤดูกาลของ {crop}',
    legAct: 'ราคาจำลองย้อนหลัง', legFore: 'พยากรณ์ล่วงหน้า', legBand: 'ช่วงคาดการณ์',
    todayLbl: 'วันนี้', wk: 'สัปดาห์ที่', baht: 'บาท/หน่วย',
    chartAriaTpl: 'กราฟราคา {crop} 26 สัปดาห์ พร้อมพยากรณ์ 4 สัปดาห์',
    chartNote: 'ข้อมูลจำลองจากแบบจำลองฤดูกาล (mock) ไม่ใช่ราคาตลาดจริง · ใช้เป็นแนวทางศึกษาทิศทางเท่านั้น',
    nowTrendUp: 'ขยับขึ้น', nowTrendDown: 'ขยับลง', nowTrendFlat: 'ทรงตัว', last5w: 'เทียบ 5 สัปดาห์ก่อน',
    sigTitle: 'สัญญาณ 4 ปัจจัย ที่ประมวลผลร่วมกัน',
    sigSub: 'รวมเป็นคำแนะนำเดียวแบบ ensemble · ไม่มีสัญญาณใดตัดสินใจเพียงลำพัง กด "ทำไม" เพื่อดูเหตุผล',
    s1name: '1. โมเมนตัมราคา', s2name: '2. ปริมาณผลผลิตตามฤดูกาล', s3name: '3. ช่วงเก็บเกี่ยว', s4name: '4. สภาพอากาศ',
    why: 'ทำไม',
    s1why: 'เทียบราคาเฉลี่ย 5 สัปดาห์ล่าสุดกับ 5 สัปดาห์ก่อนหน้า ถ้าขยับขึ้นต่อเนื่องแสดงว่าแรงซื้อกลับมา ถ้าลดลงแสดงว่าแรงขายกดดันอยู่ · สัญญาณนี้มีน้ำหนักมากสุด (40%)',
    s2why: 'ดูตำแหน่งของเดือนนี้เทียบกับช่วงผลผลิตพีคของพืชชนิดนี้ ยิ่งใกล้พีค ผลผลิตยิ่งล้นตลาด ยิ่งกดดันราคา',
    s3why: 'ตรวจว่าวันนี้อยู่ในช่วงเก็บเกี่ยวของพืชหรือไม่ และห่างจากช่วงพีคกี่เดือน · ผลที่เก็บตรงช่วงพีคต้องแข่งกับผลผลิตจำนวนมาก',
    s4why: 'แบบจำลองฝนของพื้นที่ (จากข้อมูลจำลอง) · ฝนมากเสี่ยงคุณภาพผลผลิตและเก็บเกี่ยวลำบาก แห้งดีเหมาะเก็บเกี่ยว',
    ensCaption: 'น้ำหนักรวม:',
    seasonTitle: 'ปฏิทินฤดูกาลของพืชชนิดนี้',
    seasonSub: 'แท่งสูง = ระดับราคาตามฤดูกาล (สูง = ราคาดี) · เขียว = เดือนเก็บเกี่ยว · ทอง = ผลผลิตล้น ราคามักต่ำสุด · ▲▼ = ราคาเทียบเดือนก่อน วางแผนขายเลี่ยงช่วงทอง',
    seasonCellTitle: 'ระดับราคาตามฤดูกาล {f}× (เทียบราคาเฉลี่ยของปี)',
    sLegH: 'ช่วงเก็บเกี่ยว/มีผลผลิต', sLegP: 'ช่วงผลผลิตล้น (ราคามักต่ำ)', sLegV: 'ระดับราคาตามฤดูกาล (แท่งสูง = ราคาดี)', sLegNow: 'เดือนปัจจุบัน',
    harvTag: 'เก็บ', peakTag: 'ล้น', seasonNow: 'เดือนนี้',
    supplyRising: 'ผลผลิตกำลังเพิ่ม', supplyPeak: 'ผลผลิตพีค', supplyEasing: 'ผลผลิตเริ่มลด', supplyNormal: 'ผลผลิตคงที่ตามฤดูกาล',
    harvestYes: 'อยู่ในช่วงเก็บเกี่ยว', harvestNo: 'นอกช่วงเก็บเกี่ยว', harvestAll: 'เก็บได้ตลอดปี',
    peakIn: 'พีคอีก {m} เดือน', peakNow: 'ถึงพีคในเดือนนี้',
    weatherWet: 'ฝนมาก ระวังคุณภาพ', weatherNormal: 'สภาพอากาศปกติ', weatherDry: 'แห้งดี เหมาะเก็บ',
    recSell: 'เก็บเกี่ยว / ขายตอนนี้', recWait: 'รอ 3–5 วัน', recRecover: 'ราคากำลังฟื้นตัว · รอผลแก่เต็มที่',
    confHigh: 'สูง', confMedHigh: 'ปานกลาง–สูง', confMed: 'ปานกลาง', confMedLow: 'ปานกลาง–ต่ำ',
    momUp: 'ราคา 5 สัปดาห์ล่าสุดขยับขึ้น', momDown: 'ราคา 5 สัปดาห์ล่าสุดลดลงต่อเนื่อง', momFlat: 'ราคา 5 สัปดาห์ล่าสุดทรงตัว',
    recBodySell: 'แนะนำ: เก็บเกี่ยว/ขายตอนนี้', recBodyWait: 'แนะนำ: รอ 3–5 วัน', recBodyRecover: 'แนะนำ: รอผลแก่เต็มที่ก่อนขาย',
    recCloseSell: 'ก่อนที่ราคาจะลดลงอีก', recCloseWait: 'ให้สัญญาณชัดเจนขึ้นก่อนตัดสินใจ', recCloseRecover: 'เพื่อให้ได้เกรดและราคาที่ดีกว่า',
    del: 'ลบ',
    reportTitle: 'ช่วยรายงานราคาที่ขายได้จริง',
    reportSub: 'รายงานของคุณช่วยให้เห็นภาพราคาสดกว่าเดิม ข้อมูลถูกบันทึกในเครื่องนี้เท่านั้น',
    fProv: 'จังหวัด', fCrop: 'พืช', fPrice: 'ราคาที่ขายได้ (บาท/หน่วย)', fPricePh: 'เช่น 150',
    fNote: 'หมายเหตุ (ไม่บังคับ)', fNotePh: 'เช่น เกรด B ขายให้พ่อค้าคนกลาง',
    fSubmit: 'ส่งรายงานราคา', repListT: 'รายงานล่าสุดในเครื่องนี้',
    repEmpty: 'ยังไม่มีรายงาน · ข้อมูลจะถูกบันทึกในเครื่องของคุณเท่านั้น (ต้นแบบ)',
    repTip: 'ข้อมูลนี้เก็บใน localStorage ของเบราว์เซอร์คุณเท่านั้น ไม่มีการส่งไปยังเซิร์ฟเวอร์ ในเวอร์ชันจริงจะถูกส่งเข้าระบบเพื่อช่วยให้ทุกคนเห็นราคาตลาดสด',
    repSaved: 'บันทึกรายงานแล้ว ขอบคุณครับ!', repBad: 'กรุณากรอกราคาที่ถูกต้อง',
    repQuick: 'ใช้ราคาประมาณ {p}', repShowAll: 'ดูทั้งหมด {n} รายการ', repCollapse: 'ย่อลง',
    qcProv: 'จังหวัด', qcCrop: 'พืช', chartShare: 'แชร์ราคานี้',
    chartFollowAdd: 'ติดตาม', chartFollowRemove: 'เลิกติดตาม',
    tblTitle: 'ตารางตัวเลขราคา', tblWeek: 'สัปดาห์ที่', tblMonth: 'เดือน', tblPrice: 'ราคา', tblType: 'ประเภท',
    tblHist: 'ย้อนหลัง', tblFore: 'พยากรณ์', tblExport: 'ดาวน์โหลด CSV', csvDone: 'ดาวน์โหลดไฟล์แล้ว',
    range26Lbl: 'ช่วงราคา 26 สัปดาห์', minLbl: 'ต่ำสุด', maxLbl: 'สูงสุด', avgLbl: 'เฉลี่ย',
    recReasons: 'เหตุผลประกอบคำแนะนำ',
    statChg5: 'Δ 5 สัปดาห์', statMin: 'ต่ำสุด 26 สัปดาห์', statMax: 'สูงสุด 26 สัปดาห์', statAvg: 'เฉลี่ย 26 สัปดาห์', statFore: 'พยากรณ์ 4 สัปดาห์',
    chartMin: 'ต่ำสุด', chartMax: 'สูงสุด', tblChg: 'Δ%',
    watchTitle: 'รายการติดตาม', watchSub: 'เข้าถึงราคาที่คุณติดตามได้เร็ว',
    watchEmpty: 'ยังไม่มีรายการติดตาม · กดปุ่ม "ติดตามราคานี้" บนคำแนะนำเพื่อเพิ่ม', watchGoTo: 'เปิด',
    watchStripTitle: 'ติดตามล่าสุด', watchEmptyGo: 'ไปตรวจราคา',
    watchLineNote: 'แจ้งเตือนผ่าน LINE — เร็วๆ นี้ (ยังไม่เปิดใช้งาน)',
    cmpTitle: 'เปรียบเทียบพืช', cmpSub: 'เลือกจากรายการติดตามสูงสุด 3 รายการ เพื่อเปรียบเทียบคำแนะนำเคียงกัน',
    cmpToggleAria: 'เพิ่มเข้าเปรียบเทียบ', cmpClear: 'ล้างการเลือก',
    cmpEmpty: 'เลือกอย่างน้อย 2 รายการจากรายการติดตามด้านบนเพื่อเปรียบเทียบ',
    cmpMaxMsg: 'เปรียบเทียบได้สูงสุด 3 รายการ',
    tickerLbl: 'ราคาโดยประมาณ', tickerAria: 'แถบราคาโดยประมาณของพืชหลักในจังหวัดนี้',
    aboutTitle: 'เกี่ยวกับ Harvest Trend',
    p1: 'Harvest Trend (รู้ทันราคา) เป็นต้นแบบเครื่องมือคาดการณ์แนวโน้มราคาพืชผลหน้าสวน ครอบคลุม <b>77 จังหวัด 25 พืชหลัก</b> ผสานสัญญาณ 4 ปัจจัย (โมเมนตัมราคา · ปริมาณผลผลิตตามฤดูกาล · ช่วงเก็บเกี่ยว · สภาพอากาศ) แปลผลเป็นคำแนะนำ 3 ระดับที่เข้าใจง่าย สำหรับเกษตรกรที่ไม่ถนัดเทคโนโลยี',
    p2: 'แรงบันดาลใจมาจากวิกฤตทุเรียนล้นตลาดภาคตะวันออกปี 2569: ผลผลิตพุ่ง 1,066,980 ตัน (+22.4%) ราคาเกรด C ร่วงจาก ~170 เหลือ ~95 บาท/กก. เกษตรกรจำนวนมากต้องตัดสินใจโดยไม่มีข้อมูลล่วงหน้า ระบบนี้ช่วยให้เห็นแนวโน้มและจังหวะก่อนตัดสินใจ ไม่ใช่ให้ "เชื่อ AI" แบบไม่มีที่มา',
    p3: '<b>สถานะปัจจุบัน: เชื่อมต่อราคาจริงจากหน่วยงานแล้ว</b> · ราคาแสดงจากข้อมูลราชการ (data.go.th: สำนักงานจังหวัดตราด/อำนาจเจริญ/แม่ฮ่องสอน/สุราษฎร์ธานี + สำนักงานเศรษฐกิจการเกษตร + ธนาคารแห่งประเทศไทย) ดึงอัตโนมัติทุก 10 วินาที · จังหวัด/พืชนอกเหนือที่ยังไม่มีข้อมูลราชการ ระบบใช้แบบจำลองฤดูกาลและมีป้ายกำกับชัดเจน พร้อมเปิดรับรายงานราคาจากเกษตรกรผ่าน LINE OA (ทดลองใช้บอทได้ในหน้า "บอท LINE")',
    srcTitle: 'แหล่งอ้างอิงแนวคิด',
    sdg1: 'ขจัดความยากจน', sdg2: 'ขจัดความหิวโหย', sdg8: 'งานที่มีคุณค่าและเศรษฐกิจที่เติบโต', sdg12: 'การผลิตและบริโภคที่ยั่งยืน',
    footDisc: 'ต้นแบบ (prototype) · ราคาหลักจากข้อมูลราชการจริง (data.go.th / ธปท.) อัปเดตอัตโนมัติ · พื้นที่ที่ยังไม่มีข้อมูลราชการใช้ค่าประมาณจากแบบจำลอง ข้อมูลที่คุณรายงานถูกเก็บในเครื่องของคุณเท่านั้น คำแนะนำเป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่คำแนะนำทางการเงิน และไม่ใช่หลักฐานผลกำไรจริง',
    footCredit: 'Harvest Trend (รู้ทันราคา) · EEC-SDG Hackathon & Pitching 2026 · Track 5 Smart Agriculture & Food Security',
    regionAll: 'ทั้งหมด',
    lineTitle: 'บอท LINE · gracia',
    lineSub: 'ตรวจราคาพืชผลและรับคำแนะนำจังหวะขายใน LINE — ไม่ต้องเปิดเว็บ ไม่ต้องติดตั้งแอป',
    lineStatusCheck: 'กำลังตรวจสอบสถานะ…', lineStatusOk: 'พร้อมใช้งาน', lineStatusPrep: 'กำลังเตรียมระบบ', lineStatusFail: 'ไม่สามารถเช็กสถานะได้',
    demoTitle: 'ทดลองคุยกับบอท (จำลอง) — ไม่ต้องมี LINE',
    demoSub: 'พิมพ์คำสั่งด้านล่าง ระบบจะตอบเหมือนบอท LINE จริงทุกอย่าง (Flex Message + ปุ่มลัด) · ข้อมูลเป็น mock เช่นเดียวกับเว็บ',
    chatPh: 'เช่น ราคา ระยอง ทุเรียน', chatSend: 'ส่ง', chatAria: 'พิมพ์ข้อความถึงบอท', chipsAria: 'ปุ่มลัด',
    addTitle: 'วิธีเพิ่มเพื่อน', qrGen: 'กำลังสร้าง QR…', qrAlt: 'QR เพิ่มเพื่อน LINE {id}', addBtn: 'เพิ่มเพื่อนผ่านลิงก์',
    step1: '<b>เปิด LINE</b> แล้วกดแท็บ "เพิ่มเพื่อน" (Add friends)',
    step2: 'สแกน QR ด้านซ้าย หรือค้นหา ID <b>@441sptre</b> (ชื่อบอท gracia)',
    step3: 'กดเพิ่มเพื่อน แล้วส่งข้อความ <code>"ราคา ระยอง ทุเรียน"</code> เพื่อเริ่มใช้งาน',
    cmdTitle: 'ตัวอย่างคำสั่ง', cmdHead1: 'พิมพ์', cmdHead2: 'ได้อะไร',
    cmd1a: 'ราคาปัจจุบัน + คำแนะนำจังหวะขาย + เหตุผล 4 ปัจจัย',
    cmd2a: 'ระบุเกรดได้ (เฉพาะพืชที่มีเกรด)',
    cmd3a: 'ภาษาอังกฤษก็ได้',
    cmd4a: 'ส่งรายงานราคาที่ขายได้จริง (ช่วยสร้างข้อมูลราคาสด)',
    cmd5a: 'ดูคำสั่งทั้งหมด',
    cmdNote: 'ครอบคลุม 77 จังหวัด 25 พืชหลัก (ทุเรียน ยางพารา มันสำปะหลัง ข้าว ข้าวโพด อ้อย ปาล์ม เงาะ มังคุด ลำไย สุกร ไข่ไก่ ไก่เนื้อ โคเนื้อ กุ้ง ปลานิล น้ำนมดิบ กาแฟ มะพร้าว สับปะรด หอมหัวใหญ่ หอมแดง กระเทียม มะม่วง กล้วย)',
    featTitle: 'บอททำอะไรได้',
    feat1: '<b>ตรวจราคาหน้าสวน</b> — 77 จังหวัด 25 พืชหลัก ราคาจริงจากหน่วยงานราชการ อัปเดตอัตโนมัติ (พื้นที่ที่ยังไม่มีข้อมูลใช้ค่าประมาณ)',
    feat2: '<b>คำแนะนำจังหวะขาย</b> — 3 ระดับ (ขายตอนนี้ / รอ 3–5 วัน / รอผลแก่) พร้อมความเชื่อมั่น',
    feat3: '<b>เหตุผล 4 ปัจจัย</b> — โมเมนตัมราคา (40%) · ปริมาณผลผลิต (25%) · ช่วงเก็บเกี่ยว (20%) · สภาพอากาศ (15%)',
    feat4: '<b>ช่วงราคา 26 สัปดาห์</b> — ต่ำสุด/สูงสุด/เฉลี่ย พร้อมราคาพยากรณ์',
    feat5: '<b>รายงานราคาจริง</b> — ส่งราคาที่ขายได้ ช่วยสะสมข้อมูลราคาสด (ต้นแบบ)',
    feat6: '<b>ไทย/อังกฤษ</b> — พิมพ์ภาษาไหนตอบภาษานั้น',
    faqTitle: 'คำถามที่พบบ่อย',
    faq1: '<b>ใช้ฟรีไหม?</b> ฟรี ไม่ต้องสมัครสมาชิก แค่เพิ่มเพื่อนบอทใน LINE แล้วส่งข้อความได้เลย',
    faq2: '<b>ราคาที่บอทตอบเป็นราคาจริงไหม?</b> ส่วนใหญ่ใช่ — บอทใช้ราคาจริงจากข้อมูลราชการ (data.go.th: สำนักงานจังหวัด/สศก. + ธนาคารแห่งประเทศไทย) อัปเดตอัตโนมัติทุก 10 วินาที · พื้นที่/พืชที่ยังไม่มีข้อมูลราชการ ระบบใช้แบบจำลองฤดูกาลและแจ้งไว้ในคำตอบ',
    faq3: '<b>รายงานราคาที่ส่งไปเก็บที่ไหน?</b> ต้นแบบเก็บชั่วคราวในหน่วยความจำเซิร์ฟเวอร์ (หายเมื่อรีสตาร์ท) เวอร์ชันจริงจะบันทึกลงฐานข้อมูลถาวร',
    typing: 'พิมพ์…',
    demoNoBackend: 'เดโมนี้ใช้ได้บนเว็บที่ deploy แล้ว (https://harvest-ecc.vercel.app/line.html) — localhost ไม่มี backend',
    demoFail: 'ไม่สามารถติดต่อระบบได้ (ลองเปิดบนเว็บที่ deploy แล้ว)',
    welcome: 'สวัสดีครับ ยินดีต้อนรับสู่บอท gracia 🌾\nลองพิมพ์ "ราคา ระยอง ทุเรียน" เพื่อดูราคาและคำแนะนำจังหวะขาย หรือ "ช่วย" เพื่อดูคำสั่งทั้งหมด',
    aFontSize: 'ขนาดตัวอักษร', aFontDown: 'ลดขนาดตัวอักษร', aFontUp: 'เพิ่มขนาดตัวอักษร', aNav: 'เมนูหลัก',
    aRegion: 'ภูมิภาค', aProvList: 'รายชื่อจังหวัด', aProvSearch: 'ค้นหาจังหวัด', aProvSelect: 'เลือกจังหวัด', aCrop: 'เลือกพืช',
    aQcProv: 'เปลี่ยนจังหวัด', aQcCrop: 'เปลี่ยนพืช', aGrade: 'เลือกเกรด',
    docTitleHome: 'Harvest Trend · รู้ทันราคา | ตรวจราคาพืชผล 77 จังหวัด แนะนำจังหวะขาย',
    docTitleChart: 'ราคาและแนวโน้ม | Harvest Trend', docTitleReport: 'รายงานราคาที่ขายได้ | Harvest Trend',
    docTitleWatch: 'รายการติดตาม | Harvest Trend', docTitleAbout: 'เกี่ยวกับ | Harvest Trend', docTitleLine: 'บอท LINE | Harvest Trend',
    metaDescHome: 'Harvest Trend เครื่องมือตรวจราคาพืชผล 77 จังหวัด 25 พืชหลัก (ทุเรียน ยางพารา มันสำปะหลัง ข้าว ฯลฯ) คาดการณ์แนวโน้มราคาและแนะนำจังหวะเก็บเกี่ยว/ขาย ใช้ฟรี ไม่ต้องติดตั้ง ใช้งานง่ายสำหรับเกษตรกร',
    metaDescChart: 'กราฟราคาย้อนหลัง 26 สัปดาห์ พยากรณ์ 4 สัปดาห์ สถิติราคา ตารางตัวเลข สัญญาณ 4 ปัจจัย และปฏิทินฤดูกาล สำหรับพืชและจังหวัดที่คุณเลือก',
    metaDescReport: 'ช่วยรายงานราคาพืชผลที่คุณขายได้จริง ข้อมูลบันทึกในเครื่องของคุณเท่านั้น',
    metaDescWatch: 'รายการจังหวัด/พืชที่คุณติดตามราคาไว้ เข้าถึงได้เร็วจากทุกอุปกรณ์ในเครื่องนี้',
    metaDescAbout: 'Harvest Trend (รู้ทันราคา) ต้นแบบเครื่องมือคาดการณ์แนวโน้มราคาพืชผลหน้าสวน 77 จังหวัด 25 พืชหลัก',
    metaDescLine: 'เพิ่มเพื่อน LINE OA ของ Harvest Trend แล้วส่งข้อความ "ราคา ระยอง ทุเรียน" เพื่อรับคำแนะนำจังหวะขายทันที',
    /* v2 additions */
    recentTitle: 'กลับไปดูราคาล่าสุด',
    recentSub: 'กดหนึ่งครั้งเพื่อดูราคาจังหวัดและพืชที่คุณเพิ่งตรวจ',
    recentEmpty: 'ยังไม่มีประวัติ · เลือกจังหวัดและพืชด้านล่างเพื่อเริ่ม',
    recentClear: 'ล้างประวัติ',
    voiceRead: 'ฟังคำแนะนำ',
    voiceStop: 'หยุดฟัง',
    voiceUnsupported: 'เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง',
    voiceReading: 'กำลังอ่านคำแนะนำ…',
    backHome: 'กลับหน้าหลัก',
    openApp: 'เปิดแอป'
  },
  en: {
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    skip: 'Skip to main content',
    heroEyebrow: 'A decision tool for crop prices · nationwide coverage',
    heroTitle: 'Know before you sell',
    heroSub: 'Pick your province and crop to get a plain-language harvest/sell verdict with reasons, in 2 taps · no expertise needed.',
    heroStat1: 'provinces covered', heroStat2: 'major crops', heroStat3: 'signals combined',
    heroCta: 'Check prices now',
    shareBtn: 'Share result', shareCopied: 'Result copied · ready to share',
    shareBody: 'Harvest Trend · {prov} · {crop}: {verdict} (current price ~{price} {unit})',
    nav1: 'Check prices', navPrice: 'Price & trend', nav2: 'Report price', nav3: 'Watchlist', nav4: 'About', lineNav: 'LINE Bot',
    lineCtaTitle: 'Get advice on LINE', lineCtaBody: 'Add the LINE OA and send "price Rayong durian" to get a sell-timing verdict instantly', lineCtaBtn: 'How to use',
    shareLine: 'Share on LINE',
    saveImgBtn: 'Save image', saveImgAria: 'Save the result as an image',
    imgDisclaimer: 'Simulated data · not financial advice', imgSaved: 'Image saved', imgFailed: 'Could not create image',
    how1: 'Pick your province', how2: 'Pick your crop', how3: 'Read the verdict + check the chart',
    mockNote: 'All prices on this page are mock/simulated data for a working prototype · from a seasonal model, not real market prices. Before selling, always check official or local market prices.',
    liveNote: 'Real prices from government agencies (data.go.th: Provincial Offices / OAE + Bank of Thailand) · auto-refreshed every 10 seconds · areas without official data show a clearly-labelled seasonal estimate.',
    lbLiveTitle: 'Live government price', lbLiveMeta: 'updated {t} · auto-refresh every 10s',
    lbOffTitle: 'Simulated data', lbOffMeta: 'cannot reach the price service · auto-recovers when online',
    lbFileTitle: 'Simulated data', lbFileMeta: 'open the deployed site for live prices (harvest-ecc.vercel.app)',
    liveRealLabel: 'Real price · {src}',
    pickTitle: 'Pick your province', pickSub: 'Pick your province from the list, or use GPS · all 77 provinces',
    pickPh: '— Select province —',
    searchPh: 'Search province, e.g. Rayong / ระยอง', gpsBtn: 'Use my location',
    gpsBusy: 'Locating...', gpsFail: 'Location unavailable · please pick your province manually',
    gpsDenied: 'Location permission denied · allow location in browser settings, then try again',
    gpsDeniedInApp: 'In-app browsers (LINE/Facebook) block location · open in Safari/Chrome and try again',
    gpsNoFix: 'Could not get a GPS fix · try again or pick your province',
    provEmpty: 'No province found. Try another name.', provCount: '{n} provinces',
    cropTitle: 'Pick your crop', cropSub: 'Crops most grown in your area come first · the "Key area" tag marks major production zones',
    mainTag: 'Key area',
    mapTitle: 'Price map by province', mapSub: 'See the selected crop price across every province — darker means higher',
    mapNote: 'Offline map (no basemap tiles) — fast, works without signal · provinces with real official prices show a "Live" tag, the rest are seasonal model estimates',
    mapLive: 'Live', mapModel: 'Estimate', mapTap: 'Tap a province to see its price and open the verdict',
    mapCropLabel: 'Crop',
    viewMap: 'View price map',
    navMap: 'Price map', navCost: 'Cost',
    costTitle: 'Cost & break-even calculator', costSub: 'Uses official government production costs vs the current selling price — see instantly whether you profit',
    costCoverage: 'Covers 10 of 25 crops with open official data',
    costNoData: 'No official cost data for this crop yet · enter your own cost to compute the break-even',
    costOfficial: 'Official data', costYourCost: 'Your own cost (THB/rai)',
    costCost: 'Cost', costYield: 'Yield per rai', costYieldPh: 'e.g. 1200 (kg/rai)',
    costBreakEven: 'Break-even (THB/kg)', costCurrent: 'Current price',
    costProfit: 'Profit', costLoss: 'Loss', costEven: 'Break-even',
    costSource: 'Source', viewCost: 'Cost calculator',
    sellTitle: 'Best selling weeks', sellSub: 'Weeks with the year\'s peak price (seasonal model)',
    sellPeak: 'Peak', sellNow: 'This week', sellAll: 'All year',
    freshWarn: 'Some official sources may be stale (e.g. OAE 2021, DIT 2023) — prices shown are the latest estimates available',
    thrTitle: 'Price alert', thrSub: 'Set a target price and the app will flag when it is reached (in-app)',
    thrPh: 'e.g. 120', thrSet: 'Set alert', thrRemove: 'Remove',
    thrNone: 'No alerts yet — set one', thrActive: '{crop} ≥ {price} THB', thrHit: 'Alert! {crop} = {price} THB',
    thrCurrent: 'Current {price}',
    pushTitle: 'Push notifications', pushSub: 'Enable to receive price alerts · iOS: install the app to your home screen first',
    pushOn: 'Enable', pushOff: 'Disable',
    pushDenied: 'Blocked — enable in browser settings', pushUnsupported: 'Unsupported browser',
    pushSaved: 'Saved', pushFail: 'Failed',
    repShared: 'Shared to the network — your price helps farmers nationwide', repSyncFail: 'Saved locally, but failed to sync',
    llTitle: 'Connect LINE account', llSub: 'Link your LINE to sync data across devices (requires a LINE Login channel — see docs/LINE-LOGIN-SETUP.md)',
    llConnect: 'Connect LINE', llDisconnect: 'Disconnect', llWelcome: 'Hi {name}',
    llFail: 'Connection failed', llExpired: 'Link expired — try again',
    hmGov: 'Official/Model', hmFarmers: 'Farmer reports', hmEmpty: 'No farmer reports for this crop yet — report your price on the "Report" page',
    hmNote: 'Farmer reports are unverified — use as a reference only', hmSynced: 'Synced to the network',
    recKicker: "Today's verdict", youAt: 'You are in', confPrefix: 'Confidence:', confSuffix: '· from 4 signals',
    watchAdd: 'Follow this price', watchAdded: 'Added to watchlist', watchExists: 'Already in watchlist', watchRemoved: 'Removed from watchlist',
    scrollReport: 'Report the price you got', viewChart: 'View chart + signals',
    sig1n: 'Price momentum', sig2n: 'Seasonal supply', sig3n: 'Harvest window', sig4n: 'Weather',
    sigCarouselLabel: '4 signals behind this recommendation, swipe to view one at a time', sigSwipeHint: 'Swipe left/right for more signals',
    priceTitleTpl: '{crop} price trend · {prov}',
    priceSubTpl: '26-week simulated history + 4-week forecast (per unit) · generated from the {crop} seasonal model',
    livePriceSubTpl: '26-week history + 4-week forecast (per unit) · anchored to the latest official price · older points are seasonal estimates for {crop}',
    legAct: 'Simulated history', legFore: 'Forecast', legBand: 'Forecast range',
    todayLbl: 'Today', wk: 'Week', baht: 'per unit',
    chartAriaTpl: '{crop} price chart, 26 weeks with 4-week forecast',
    chartNote: 'Simulated data from a seasonal model (mock) · not real market prices. Use for direction only.',
    nowTrendUp: 'Rising', nowTrendDown: 'Falling', nowTrendFlat: 'Flat', last5w: 'vs 5 weeks ago',
    sigTitle: '4 signals combined into one',
    sigSub: 'Ensemble recommendation · no single signal decides alone. Tap "Why" to see each reason.',
    s1name: '1. Price momentum', s2name: '2. Seasonal supply', s3name: '3. Harvest window', s4name: '4. Weather',
    why: 'Why',
    s1why: 'Compares the last 5 weeks of prices with the 5 before. Rising momentum means buying pressure is back; falling means sellers dominate. This signal carries the most weight (40%).',
    s2why: 'Where this month sits vs the crop’s supply-peak months. The closer to peak, the more produce floods the market and the lower the price pressure.',
    s3why: 'Whether today falls inside the harvest window, and how many months to the peak. Harvesting at peak means competing with everyone else’s output.',
    s4why: 'Simulated rain pattern for the area · wet weather risks quality and makes harvest hard; dry weather suits harvest.',
    ensCaption: 'Ensemble weights:',
    seasonTitle: 'Season calendar for this crop',
    seasonSub: 'Bar height = seasonal price level (taller = better price) · green = harvest months · gold = oversupply, usually the price trough · ▲▼ vs previous month. Plan sales around the gold window.',
    seasonCellTitle: 'Seasonal price factor {f}× vs yearly average',
    sLegH: 'Harvest / in season', sLegP: 'Oversupply (usually low price)', sLegV: 'Seasonal price level (taller = better price)', sLegNow: 'Current month',
    harvTag: 'harvest', peakTag: 'surplus', seasonNow: 'now',
    supplyRising: 'Supply rising', supplyPeak: 'Supply at peak', supplyEasing: 'Supply easing', supplyNormal: 'Supply steady by season',
    harvestYes: 'In harvest window', harvestNo: 'Outside harvest window', harvestAll: 'Harvestable year-round',
    peakIn: 'Peak in {m} months', peakNow: 'Peak this month',
    weatherWet: 'Wet · watch quality', weatherNormal: 'Normal weather', weatherDry: 'Dry · good for harvest',
    recSell: 'Harvest / sell now', recWait: 'Wait 3–5 days', recRecover: 'Price recovering · let fruit ripen',
    confHigh: 'High', confMedHigh: 'Moderate–High', confMed: 'Moderate', confMedLow: 'Moderate–Low',
    momUp: 'Prices have risen over the last 5 weeks', momDown: 'Prices kept falling over the last 5 weeks', momFlat: 'Prices were flat over the last 5 weeks',
    recBodySell: 'Verdict: harvest / sell now', recBodyWait: 'Verdict: wait 3–5 days', recBodyRecover: 'Verdict: let the fruit ripen fully before selling',
    recCloseSell: 'before prices fall further', recCloseWait: 'until signals become clearer', recCloseRecover: 'for a better grade and price',
    del: 'Remove',
    reportTitle: 'Report the price you actually got',
    reportSub: 'Your report helps build a fresher price picture than waiting for official data. Saved on this device only.',
    fProv: 'Province', fCrop: 'Crop', fPrice: 'Price received (per unit)', fPricePh: 'e.g. 150', fNote: 'Note (optional)', fNotePh: 'e.g. grade B, sold to middleman',
    fSubmit: 'Submit report', repListT: 'Recent reports on this device',
    repEmpty: 'No reports yet · reports are saved on this device only (prototype)',
    repTip: 'Reports are stored in this browser’s localStorage only; nothing is sent to a server. The real version will feed them into the system so everyone sees fresher prices.',
    repSaved: 'Report saved · thank you!', repBad: 'Please enter a valid price',
    repQuick: 'Use estimate ~{p}', repShowAll: 'Show all {n}', repCollapse: 'Collapse',
    qcProv: 'Province', qcCrop: 'Crop', chartShare: 'Share price',
    chartFollowAdd: 'Follow', chartFollowRemove: 'Unfollow',
    tblTitle: 'Price table', tblWeek: 'Week', tblMonth: 'Month', tblPrice: 'Price', tblType: 'Type',
    tblHist: 'History', tblFore: 'Forecast', tblExport: 'Download CSV', csvDone: 'File downloaded',
    range26Lbl: '26-week range', minLbl: 'Low', maxLbl: 'High', avgLbl: 'Avg',
    recReasons: 'Why this verdict',
    statChg5: '5-wk change', statMin: '26-wk low', statMax: '26-wk high', statAvg: '26-wk avg', statFore: '4-wk forecast',
    chartMin: 'low', chartMax: 'high', tblChg: 'Chg%',
    watchTitle: 'Watchlist', watchSub: 'Quick access to the prices you follow',
    watchEmpty: 'Nothing here yet · tap "Follow this price" on a verdict to add it.',
    watchGoTo: 'open',
    watchStripTitle: 'Following', watchEmptyGo: 'Check prices',
    watchLineNote: 'LINE alerts — coming soon (not yet enabled)',
    cmpTitle: 'Compare crops', cmpSub: 'Pick up to 3 from your watchlist to compare verdicts side by side.',
    cmpToggleAria: 'Add to compare', cmpClear: 'Clear selection',
    cmpEmpty: 'Select at least 2 items from your watchlist above to compare.',
    cmpMaxMsg: 'Compare up to 3 items at a time.',
    tickerLbl: 'Estimated prices', tickerAria: 'Estimated prices for this province’s main crops',
    aboutTitle: 'About Harvest Trend',
    p1: 'Harvest Trend (รู้ทันราคา) is a working prototype that forecasts farm-gate crop prices across <b>77 provinces and 25 major crops</b>, blending 4 signals (price momentum · seasonal supply · harvest window · weather) into one plain-language verdict · built for farmers who are not tech-savvy.',
    p2: 'Inspired by the 2026 Eastern durian oversupply crisis: output hit 1,066,980 tonnes (+22.4%) and grade-C prices fell from ~170 to ~95 THB/kg. Farmers had to decide with no foresight. This tool shows the trend and timing before the decision · never a blind "trust the AI".',
    p3: '<b>Status: connected to real government price data</b> · prices come from official sources (data.go.th: Trat/Amnat Charoen/Mae Hong Son/Surat Thani provincial offices + OAE + Bank of Thailand), auto-refreshed every 10 seconds · provinces/crops without official data use the seasonal model with a clear label. Farmer price reports via LINE OA are welcome too (try the bot on the "LINE Bot" page).',
    srcTitle: 'Concept references',
    sdg1: 'No poverty', sdg2: 'Zero hunger', sdg8: 'Decent work & economic growth', sdg12: 'Responsible consumption',
    footDisc: 'Prototype · prices are real government data (data.go.th / BOT) with auto-refresh · areas without official data show seasonal estimates. Your reports stay on this device. Recommendations support decisions; they are not financial advice and not proof of live profit.',
    footCredit: 'Harvest Trend (รู้ทันราคา) · EEC-SDG Hackathon & Pitching 2026 · Track 5 Smart Agriculture & Food Security',
    regionAll: 'All',
    lineTitle: 'LINE Bot · gracia',
    lineSub: 'Check crop prices and get sell-timing advice inside LINE — no website to open, no app to install',
    lineStatusCheck: 'Checking status…', lineStatusOk: 'Live', lineStatusPrep: 'Preparing', lineStatusFail: 'Status unavailable',
    demoTitle: 'Try the bot (simulated) — no LINE needed',
    demoSub: 'Type a command below — the bot replies exactly like the real LINE bot (Flex Message + quick replies) · mock data, same as the site',
    chatPh: 'e.g. price rayong durian', chatSend: 'Send', chatAria: 'Type a message to the bot', chipsAria: 'Quick replies',
    addTitle: 'How to add the bot', qrGen: 'Generating QR…', qrAlt: 'LINE add-friend QR {id}', addBtn: 'Add via link',
    step1: '<b>Open LINE</b> and tap the "Add friends" tab',
    step2: 'Scan the QR on the left, or search for ID <b>@441sptre</b> (bot name gracia)',
    step3: 'Add the bot, then send <code>"ราคา ระยอง ทุเรียน"</code> to get started',
    cmdTitle: 'Example commands', cmdHead1: 'Type', cmdHead2: 'What you get',
    cmd1a: 'Current price + sell-timing verdict + 4-factor reasoning',
    cmd2a: 'You can specify a grade (graded crops only)',
    cmd3a: 'English works too',
    cmd4a: 'Report the price you actually got (helps build fresher price data)',
    cmd5a: 'See all commands',
    cmdNote: 'Covers 77 provinces, 25 major crops (durian, rubber, cassava, rice, maize, sugarcane, oil palm, rambutan, mangosteen, longan, pork, egg, broiler, beef, shrimp, tilapia, raw milk, coffee, coconut, pineapple, onion, shallot, garlic, mango, banana)',
    featTitle: 'What the bot can do',
    feat1: '<b>Farm-gate price checks</b> — 77 provinces, 25 crops, real government prices with auto-refresh (estimates where official data is missing)',
    feat2: '<b>Sell-timing verdicts</b> — 3 levels (sell now / wait 3–5 days / wait to ripen) with confidence',
    feat3: '<b>4-factor reasoning</b> — price momentum (40%) · seasonal supply (25%) · harvest window (20%) · weather (15%)',
    feat4: '<b>26-week price range</b> — low/high/average plus forecast price',
    feat5: '<b>Real price reports</b> — send what you sold for, building fresher price data (prototype)',
    feat6: '<b>Thai/English</b> — the bot answers in the language you type',
    faqTitle: 'Frequently asked questions',
    faq1: '<b>Is it free?</b> Yes — free, no sign-up. Just add the bot on LINE and start messaging.',
    faq2: '<b>Are the bot’s prices real?</b> Mostly yes — the bot uses real government prices (data.go.th: Provincial Offices/OAE + Bank of Thailand), auto-refreshed every 10 seconds · areas without official data use the seasonal model and the reply says so.',
    faq3: '<b>Where do submitted price reports go?</b> The prototype stores them temporarily in server memory (lost on restart). The real version will store them in a permanent database.',
    typing: 'Typing…',
    demoNoBackend: 'This demo works on the deployed site (https://harvest-ecc.vercel.app/line.html) — localhost has no backend',
    demoFail: 'Cannot reach the system (try the deployed site)',
    welcome: 'Hello, welcome to the gracia bot 🌾\nTry "price rayong durian" for a price and sell-timing verdict, or "help" for all commands',
    aFontSize: 'Font size', aFontDown: 'Decrease font size', aFontUp: 'Increase font size', aNav: 'Main menu',
    aRegion: 'Region', aProvList: 'Province list', aProvSearch: 'Search province', aProvSelect: 'Select province', aCrop: 'Pick a crop',
    aQcProv: 'Change province', aQcCrop: 'Change crop', aGrade: 'Pick a grade',
    docTitleHome: 'Harvest Trend | Check crop prices across 77 provinces',
    docTitleChart: 'Price & trend | Harvest Trend', docTitleReport: 'Report your price | Harvest Trend',
    docTitleWatch: 'Watchlist | Harvest Trend', docTitleAbout: 'About | Harvest Trend', docTitleLine: 'LINE Bot | Harvest Trend',
    metaDescHome: 'Harvest Trend — check crop prices across 77 provinces and 25 major crops (durian, rubber, cassava, rice, etc.), see price trends and harvest/sell timing advice. Free, no install, easy for farmers.',
    metaDescChart: '26-week price history chart, 4-week forecast, price stats, data table, 4-factor signals, and a season calendar for the crop and province you pick.',
    metaDescReport: 'Report the crop price you actually got — saved on this device only.',
    metaDescWatch: 'Your saved province/crop price watchlist — quick access on this device.',
    metaDescAbout: 'Harvest Trend (รู้ทันราคา) — a prototype forecasting farm-gate crop prices across 77 provinces and 25 major crops.',
    metaDescLine: 'Add the Harvest Trend LINE OA and send "price rayong durian" to get an instant sell-timing verdict.',
    /* v2 additions */
    recentTitle: 'Back to your latest prices',
    recentSub: 'One tap to re-check the province and crop you just looked at',
    recentEmpty: 'No history yet · pick a province and crop below to start',
    recentClear: 'Clear history',
    voiceRead: 'Listen to the verdict',
    voiceStop: 'Stop',
    voiceUnsupported: 'This browser does not support text-to-speech',
    voiceReading: 'Reading the verdict…',
    backHome: 'Back to home',
    openApp: 'Open app'
  }
};

export const t = (lang: Lang): Dict => T[lang];