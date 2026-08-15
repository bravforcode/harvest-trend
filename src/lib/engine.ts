/* Harvest Trend · รู้ทันราคา — deterministic mock engine (ported from app.js)
   Blends 4 signals (price momentum 40% · seasonal supply 25% · harvest window
   20% · weather 15%) into a 3-level verdict with confidence. */

import { CROPS, GRADES, REGION_FACTOR, cropById, provById, type Crop, type Province } from './data';
import { LiveData } from './live';
import { T, type Lang } from './i18n';

export const CUR_WEEK = 32; // mid-August anchor week for the demo clock

export interface AppState {
  lang: Lang;
  prov: string;
  crop: string;
  grade: string;
}

export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function rng01(seedKey: string): () => number {
  let h = hashStr(seedKey);
  return function () {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

export function todayInfo(): { m: number; date: Date } {
  const d = new Date();
  return { m: d.getMonth() + 1, date: d };
}

export function fmtDate(lang: Lang, d: Date): string {
  try {
    return lang === 'th'
      ? d.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return lang === 'th' ? 'วันจันทร์ที่ 10 สิงหาคม 2569' : 'Monday, 10 August 2026';
  }
}

export function monthName(lang: Lang, m: number): string {
  return T[lang].monthsShort[m - 1];
}

export function weekToMonth(w: number): number {
  return Math.min(12, Math.max(1, Math.floor(((w - 1) % 52) / 4.33) + 1));
}

/* ratio that makes week CUR_WEEK equal the real official price (if any).
   Computed on the UNGRADED curve so grades stay relative to the real price. */
function liveAnchorK(cropId: string, provId: string): number {
  const real = LiveData.get(cropId, provId);
  if (!real || !(real.price > 0)) return 1;
  const c = cropById(cropId), p = provById(provId);
  if (!c || !p) return 1;
  const w = ((CUR_WEEK - 1) % 52) + 1;
  const m = weekToMonth(w);
  const r = rng01(cropId + ':' + provId);
  const n = 0.05 * Math.sin(w * 0.9 + r() * 6.28) + 0.035 * Math.sin(w * 2.3 + r() * 6.28);
  const mockNow = c.base * c.season[m - 1] * (REGION_FACTOR[p.rg] || 1) * (1 + n);
  return mockNow > 0 ? real.price / mockNow : 1;
}

export function priceAt(cropId: string, provId: string, weekOfYear: number, grade?: string): number {
  const w = ((weekOfYear - 1) % 52) + 1;
  const m = weekToMonth(w);
  const c = cropById(cropId), p = provById(provId);
  if (!c || !p) return 0;
  const gm = c.grades ? (GRADES[grade || 'B'] || 1) : 1;
  const r = rng01(cropId + ':' + provId);
  const n = 0.05 * Math.sin(w * 0.9 + r() * 6.28) + 0.035 * Math.sin(w * 2.3 + r() * 6.28);
  const raw = c.base * gm * c.season[m - 1] * (REGION_FACTOR[p.rg] || 1) * (1 + n);
  return raw * liveAnchorK(cropId, provId);
}

export interface Series {
  a: number[]; // 26-week history
  f: number[]; // 4-week forecast
}

export function priceSeriesFor(cropId: string, provId: string, grade?: string): Series {
  const a: number[] = [], f: number[] = [];
  for (let i = CUR_WEEK - 25; i <= CUR_WEEK; i++) a.push(priceAt(cropId, provId, i, grade));
  for (let i = 1; i <= 4; i++) f.push(priceAt(cropId, provId, CUR_WEEK + i, grade));
  return { a, f };
}

export type MomSt = 'up' | 'down' | 'flat';
export type SupSt = 'normal' | 'rising' | 'peak' | 'easing';
export type HarvSt = 'yes' | 'no' | 'all';
export type WxSt = 'wet' | 'normal' | 'dry';

export interface Signals {
  mom: number;
  momSt: MomSt;
  supSt: SupSt;
  harvSt: HarvSt;
  peakDist: number | null;
  wxSt: WxSt;
  series: Series;
}

export function signalsFor(cropId: string, provId: string, grade?: string): Signals {
  const c = cropById(cropId), p = provById(provId);
  const s = priceSeriesFor(cropId, provId, grade);
  const N = s.a.length;
  const mom = (s.a[N - 1] - s.a[N - 6]) / s.a[N - 6];
  const momSt: MomSt = mom > 0.03 ? 'up' : mom < -0.03 ? 'down' : 'flat';
  const curM = todayInfo().m;
  let supSt: SupSt = 'normal';
  if (c && c.peak.length) {
    const inP = c.peak.includes(curM);
    const before = curM < c.peak[0];
    const after = curM > c.peak[c.peak.length - 1];
    supSt = inP ? 'peak' : before ? 'rising' : after ? 'easing' : 'rising';
  }
  let harvSt: HarvSt;
  if (c && c.harvest[0] === 1 && c.harvest[1] === 12) harvSt = 'all';
  else if (c) {
    const inH = c.harvest[0] <= c.harvest[1]
      ? curM >= c.harvest[0] && curM <= c.harvest[1]
      : curM >= c.harvest[0] || curM <= c.harvest[1];
    harvSt = inH ? 'yes' : 'no';
  } else harvSt = 'no';
  let peakDist: number | null = null;
  if (c && c.peak.length) {
    let d = c.peak[0] - curM;
    if (d < 0) d += 12;
    peakDist = d;
  }
  const wr = rng01('wx:' + (p ? p.id : '?') + ':' + (c ? c.id : '?'))();
  const wxSt: WxSt = wr > 0.66 ? 'wet' : wr < 0.33 ? 'dry' : 'normal';
  return { mom, momSt, supSt, harvSt, peakDist, wxSt, series: s };
}

export type Rec = 'sell' | 'wait' | 'recover';

export interface Recommendation {
  rec: Rec;
  confKey: 'confHigh' | 'confMedHigh' | 'confMed' | 'confMedLow';
  score: number;
}

export function recommend(sg: Signals): Recommendation {
  let score = 0;
  if (sg.momSt === 'down') score -= 2;
  else if (sg.momSt === 'up') score += 2;
  if (sg.supSt === 'peak') score -= 1.5;
  else if (sg.supSt === 'easing') score += 1;
  if (sg.harvSt === 'no') score -= 0.5;
  else if (sg.harvSt === 'yes' && sg.supSt !== 'easing') score += 0.5;
  if (sg.wxSt === 'wet') score -= 0.5;
  else if (sg.wxSt === 'dry') score += 0.5;
  const rec: Rec = score <= -1.5 ? 'sell' : score >= 1.5 ? 'recover' : 'wait';
  const confKey = Math.abs(score) >= 2.5 ? 'confHigh'
    : Math.abs(score) >= 1.5 ? 'confMedHigh'
    : Math.abs(score) >= 0.5 ? 'confMed' : 'confMedLow';
  return { rec, confKey, score };
}

export const REC_KEY: Record<Rec, keyof typeof T.th> = { sell: 'recSell', wait: 'recWait', recover: 'recRecover' };
export const BODY_KEY: Record<Rec, keyof typeof T.th> = { sell: 'recBodySell', wait: 'recBodyWait', recover: 'recBodyRecover' };
export const CLOSE_KEY: Record<Rec, keyof typeof T.th> = { sell: 'recCloseSell', wait: 'recCloseWait', recover: 'recCloseRecover' };
export const MOM_KEY: Record<MomSt, keyof typeof T.th> = { up: 'momUp', down: 'momDown', flat: 'momFlat' };

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function fmtValFor(v: number, cropId: string): string {
  const c = cropById(cropId);
  return c ? (c.dec === 0 ? String(Math.round(v)) : v.toFixed(c.dec)) : String(Math.round(v));
}

export function fmtVal(v: number, crop: Crop): string {
  return crop.dec === 0 ? String(Math.round(v)) : v.toFixed(crop.dec);
}

export function shareText(state: AppState): string {
  const t = T[state.lang], c = cropById(state.crop), p = provById(state.prov);
  if (!c || !p) return '';
  const sg = signalsFor(state.crop, state.prov, state.grade);
  const r = recommend(sg);
  const last = sg.series.a[sg.series.a.length - 1];
  return t.shareBody
    .replace('{prov}', p[state.lang])
    .replace('{crop}', c[state.lang])
    .replace('{verdict}', t[REC_KEY[r.rec]] as string)
    .replace('{price}', fmtVal(last, c))
    .replace('{unit}', c.unit[state.lang]);
}

/* plain-text verdict summary (used by the voice reader) */
export function verdictSpeech(state: AppState): string {
  const t = T[state.lang], c = cropById(state.crop), p = provById(state.prov);
  if (!c || !p) return '';
  const sg = signalsFor(state.crop, state.prov, state.grade);
  const r = recommend(sg);
  const last = sg.series.a[sg.series.a.length - 1];
  const supTxt = t['supply' + cap(sg.supSt) as keyof typeof t];
  let harvTxt: string;
  if (sg.harvSt === 'all') harvTxt = t.harvestAll;
  else if (sg.harvSt === 'yes') harvTxt = t.harvestYes + (sg.peakDist === 0 ? ' · ' + t.peakNow : sg.peakDist ? ' · ' + t.peakIn.replace('{m}', String(sg.peakDist)) : '');
  else harvTxt = t.harvestNo + (sg.peakDist ? ' · ' + t.peakIn.replace('{m}', String(sg.peakDist)) : '');
  return [
    t.recKicker + ': ' + t[REC_KEY[r.rec]],
    p[state.lang] + ' ' + c[state.lang] + ' ราคาประมาณ ' + fmtVal(last, c) + ' ' + c.unit[state.lang],
    t[BODY_KEY[r.rec]] + ' ' + t[CLOSE_KEY[r.rec]],
    t.sig1n + ': ' + t[MOM_KEY[sg.momSt]],
    t.sig2n + ': ' + supTxt,
    t.sig3n + ': ' + harvTxt,
    t.sig4n + ': ' + t['weather' + cap(sg.wxSt) as keyof typeof t],
    t.confPrefix + ' ' + t[r.confKey]
  ].join('. ');
}

/* crop list sorted by "main production area" first (same as the old chips) */
export function sortedCrops(prov: Province): Crop[] {
  return CROPS.slice().sort((a, b) => {
    const am = prov.main.includes(a.id) || prov.main.includes('*') ? 0 : 1;
    const bm = prov.main.includes(b.id) || prov.main.includes('*') ? 0 : 1;
    return am - bm || a.th.localeCompare(b.th);
  });
}