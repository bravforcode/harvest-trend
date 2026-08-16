/* Harvest Trend · รู้ทันราคา — watchlist sync via LINE identity (env-gated:
   only active when a LINE Login profile exists in localStorage rtp_line_v1).
   Pulls on demand (merge with local), pushes after local changes. */
import { setWatch, type WatchItem } from '@/lib/storage';

const LINE_KEY = 'rtp_line_v1';

export function getLineSub(): string | null {
  try {
    const p = JSON.parse(localStorage.getItem(LINE_KEY) || 'null');
    return p && typeof p.sub === 'string' ? p.sub : null;
  } catch { return null; }
}

export async function pullWatchlist(): Promise<WatchItem[] | null> {
  const sub = getLineSub();
  if (!sub) return null;
  try {
    const r = await fetch('api/watch-sync?line_sub=' + encodeURIComponent(sub), { cache: 'no-store' });
    if (!r.ok) return null;
    const d = await r.json();
    return Array.isArray(d.items) ? d.items : null;
  } catch { return null; }
}

export async function pushWatchlist(items: WatchItem[]): Promise<boolean> {
  const sub = getLineSub();
  if (!sub) return false;
  try {
    const r = await fetch('api/watch-sync', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line_sub: sub, items })
    });
    return r.ok;
  } catch { return false; }
}

/* merge remote into local on first use: remote wins per (p,c) pair */
export function mergeWatch(remote: WatchItem[] | null, local: WatchItem[]): WatchItem[] {
  if (!remote || !remote.length) return local;
  const seen = new Set(local.map(x => x.p + '|' + x.c));
  const merged = [...local];
  for (const item of remote) {
    if (item && typeof item.p === 'string' && typeof item.c === 'string' && !seen.has(item.p + '|' + item.c)) {
      merged.push(item);
      seen.add(item.p + '|' + item.c);
    }
  }
  return merged;
}

/* called after every local watch change: persist locally + push to cloud */
export function syncWatch(items: WatchItem[]): void {
  setWatch(items);
  void pushWatchlist(items);
}
