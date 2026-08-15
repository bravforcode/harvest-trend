/* Harvest Trend · รู้ทันราคา — live real prices from /api/prices (data.go.th + BOT)
   Polls every 10s; anchors the seasonal model to official prices. */

import { provById } from './data';

export interface LiveEntry {
  price: number;
  unit?: string;
  date?: string;
  source?: string;
}

class LiveDataImpl {
  map: Record<string, LiveEntry> = {};
  updated: string | null = null;
  ok = false;
  private _fails = 0;
  private _started = false;
  private _fns: Array<() => void> = [];

  onUpdate(fn: () => void): void {
    this._fns.push(fn);
  }

  get(cropId: string, provId: string): LiveEntry | null {
    const p = provById(provId);
    if (this.map[cropId + '|' + provId]) return this.map[cropId + '|' + provId];
    if (p && this.map[cropId + '|rg:' + p.rg]) return this.map[cropId + '|rg:' + p.rg];
    if (this.map[cropId + '|*']) return this.map[cropId + '|*'];
    return null;
  }

  async refresh(): Promise<void> {
    try {
      const res = await fetch('api/prices', { cache: 'no-store' });
      if (!res.ok) throw new Error('http ' + res.status);
      const d = await res.json();
      if (!d || !Array.isArray(d.prices)) throw new Error('bad payload');
      this.map = {};
      d.prices.forEach((p: LiveEntry & { crop?: string; prov?: string }) => {
        if (p.crop && p.prov && p.price > 0) this.map[p.crop + '|' + p.prov] = p;
      });
      this.updated = d.updated || new Date().toISOString();
      this._fails = 0;
      this.ok = true;
    } catch {
      this._fails += 1;
      if (this._fails >= 2 || !this.ok) this.ok = false;
    }
    this._fns.forEach(f => { try { f(); } catch { /* noop */ } });
  }

  start(): void {
    if (this._started) return;
    this._started = true;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    const tick = () => { if (!document.hidden) void this.refresh(); };
    tick();
    setInterval(tick, 10000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void this.refresh(); });
  }
}

export const LiveData = new LiveDataImpl();