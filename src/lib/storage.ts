/* Harvest Trend · รู้ทันราคา — localStorage helpers (ported from app.js) */

export const WATCH_KEY = 'rtp_watch_v2';
export const REP_KEY = 'rtp_reports_v2';
export const CFG_KEY = 'rtp_cfg_v2';
export const RECENT_KEY = 'rtp_recent_v2';

export interface WatchItem {
  p: string;
  c: string;
}

export interface ReportItem {
  p: string;
  c: string;
  price: string;
  date: string;
  note: string;
}

export interface Cfg {
  lang?: 'th' | 'en';
  prov?: string;
  crop?: string;
  grade?: string;
  fontSize?: number;
}

export const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) as T : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown): void {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* noop */ }
  }
};

export function getWatch(): WatchItem[] {
  return store.get<WatchItem[]>(WATCH_KEY, []);
}

export function setWatch(wl: WatchItem[]): void {
  store.set(WATCH_KEY, wl);
}

export function inWatch(p: string, c: string): boolean {
  return getWatch().some(x => x.p === p && x.c === c);
}

export function toggleWatch(p: string, c: string): 'added' | 'removed' {
  const wl = getWatch();
  const i = wl.findIndex(x => x.p === p && x.c === c);
  if (i >= 0) {
    wl.splice(i, 1);
    setWatch(wl);
    return 'removed';
  }
  wl.push({ p, c });
  setWatch(wl);
  return 'added';
}

export function getReports(): ReportItem[] {
  return store.get<ReportItem[]>(REP_KEY, []);
}

export function setReports(reps: ReportItem[]): void {
  store.set(REP_KEY, reps.slice(0, 60));
}

export function getCfg(): Cfg {
  return store.get<Cfg>(CFG_KEY, {});
}

export function persistCfg(patch: Cfg): void {
  const cfg = getCfg();
  Object.assign(cfg, patch);
  store.set(CFG_KEY, cfg);
}

/* recent province/crop history (v2 feature) */
export interface RecentItem {
  p: string;
  c: string;
  t: number; // timestamp
}

export function getRecents(): RecentItem[] {
  return store.get<RecentItem[]>(RECENT_KEY, []);
}

export function pushRecent(p: string, c: string): void {
  const list = getRecents().filter(x => !(x.p === p && x.c === c));
  list.unshift({ p, c, t: Date.now() });
  store.set(RECENT_KEY, list.slice(0, 6));
}

export function clearRecents(): void {
  store.set(RECENT_KEY, []);
}