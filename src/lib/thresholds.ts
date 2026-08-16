/* Harvest Trend · รู้ทันราคา — in-app price threshold alerts (localStorage,
   same store.get/store.set pattern as storage.ts) */

import { store } from '@/lib/storage';

export const THR_KEY = 'rtp_thr_v1';

export interface Threshold {
  p: string;    // province id
  c: string;    // crop id
  price: number;
  t: number;    // timestamp (ms)
}

const MAX = 10;

export function getThresholds(): Threshold[] {
  return store.get<Threshold[]>(THR_KEY, []);
}

export function setThresholds(list: Threshold[]): void {
  store.set(THR_KEY, list.slice(0, MAX));
}

export function addThreshold(p: string, c: string, price: number): Threshold[] {
  const list = getThresholds().filter(x => !(x.p === p && x.c === c));
  list.unshift({ p, c, price, t: Date.now() });
  const next = list.slice(0, MAX);
  setThresholds(next);
  return next;
}

export function removeThreshold(p: string, c: string): Threshold[] {
  const next = getThresholds().filter(x => !(x.p === p && x.c === c));
  setThresholds(next);
  return next;
}
