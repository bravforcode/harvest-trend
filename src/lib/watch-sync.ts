/* Harvest Trend · รู้ทันราคา — watchlist sync via LINE identity (env-gated:
   only active when a LINE Login profile exists in localStorage rtp_line_v1).
   Pulls on demand (merge with local), pushes after local changes. */
import { setWatch, type WatchItem } from '@/lib/storage';

const LINE_KEY = 'rtp_line_v1';

/* The LINE login response (rtp_line_v1) now carries id_token + access_token
   (see api/line-login.js). /api/watch-sync verifies one of them before any
   read/write, so we must send them — a bare line_sub is rejected (401). */
export function getLineSub(): string | null {
  try {
    const p = JSON.parse(localStorage.getItem(LINE_KEY) || 'null');
    return p && typeof p.sub === 'string' ? p.sub : null;
  } catch { return null; }
}

/* id_token exp (ms) decoded from the JWT payload — LINE id_tokens expire
   quickly (~10 min) while access_tokens last ~30 days, so an expired
   id_token must NOT block sync: fall back to the access_token. */
function idTokenExpMs(token: string): number | null {
  try {
    const p = token.split('.')[1];
    if (!p) return null;
    const claims = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof claims.exp === 'number' ? claims.exp * 1000 : null;
  } catch { return null; }
}

function getLineToken(): string | null {
  try {
    const p = JSON.parse(localStorage.getItem(LINE_KEY) || 'null');
    if (!p) return null;
    if (typeof p.id_token === 'string') {
      const exp = idTokenExpMs(p.id_token);
      /* unparseable exp → let the server decide; valid → use id_token */
      if (exp === null || exp > Date.now()) return p.id_token;
    }
    /* id_token expired (or absent) → longer-lived access_token */
    if (typeof p.access_token === 'string') return p.access_token;
    return null;
  } catch { return null; }
}

async function authFetch(path: string, init?: RequestInit): Promise<Response | null> {
  const token = getLineToken();
  if (!token) return null;
  try {
    return await fetch(path, {
      ...init,
      headers: { ...(init?.headers || {}), Authorization: 'Bearer ' + token }
    });
  } catch { return null; }
}

export async function pullWatchlist(): Promise<WatchItem[] | null> {
  const r = await authFetch('api/watch-sync', { cache: 'no-store' });
  if (!r || !r.ok) return null;
  try {
    const d = await r.json();
    return Array.isArray(d.items) ? d.items : null;
  } catch { return null; }
}

export async function pushWatchlist(items: WatchItem[]): Promise<boolean> {
  const r = await authFetch('api/watch-sync', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  return !!r && r.ok;
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
