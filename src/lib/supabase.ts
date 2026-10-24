/* Harvest Trend · รู้ทันราคา — env-gated Supabase client for farmer price reports
 *
 * DESIGN:
 * - @supabase/supabase-js is NOT a hard dependency. It is loaded lazily via a
 *   dynamic import with a VARIABLE specifier, so TypeScript never tries to
 *   resolve the module at compile time and this file compiles cleanly even
 *   when the package is not installed (tsc include: src).
 *   → Run `bun add @supabase/supabase-js` to enable Supabase features.
 * - The whole module is env-gated: without VITE_SUPABASE_URL +
 *   VITE_SUPABASE_ANON_KEY every call degrades gracefully (no throw, no crash):
 *     • submitPriceReport  → { ok: false, reason: 'not_configured' }
 *     • fetchRecentReports → []
 * - Nothing in the UI imports this file yet (scaffold only).
 */

/**
 * Minimal structural type for the slice of the Supabase client we use.
 * The real, richer types come from @supabase/supabase-js once installed;
 * the query builder is intentionally `any` because postgrest-js chains are
 * thenables too complex to mirror here.
 */
interface SupabaseLike {
  auth: {
    getSession(): Promise<{ data: { session: unknown } | null; error: unknown }>;
    signInAnonymously(): Promise<{ error: unknown }>;
  };
  from(table: string): any;
}

/** A submitted farmer price report row (price_reports table). */
export interface PriceReport {
  id: string;
  crop: string;
  province: string;
  price: number;
  unit: string | null;
  note: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  created_at: string;
}

/** Payload accepted by submitPriceReport (lat/lng are optional — PDPA consent-gated). */
export interface PriceReportInput {
  crop: string;
  province: string;
  price: number;
  unit?: string;
  note?: string;
  lat?: number;
  lng?: number;
}

export type SubmitResult = { ok: true; id: string } | { ok: false; reason: string };

/* --- env gate ----------------------------------------------------------- */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when both env vars are present. Does NOT guarantee the dep is installed. */
export const isSupabaseReady: boolean = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/* --- lazy client loading ------------------------------------------------ */

// Lazy client loading: import a RELATIVE module that statically re-exports
// createClient, so Vite bundles it as a real lazy chunk (a bare dynamic
// import('@supabase/supabase-js') cannot be analyzed and 404s in prod).
// The specifier MUST be a literal so Rollup can resolve and split it.

let clientPromise: Promise<SupabaseLike | null> | null = null;

/**
 * Loads @supabase/supabase-js (once) and creates the client.
 * Never throws. Returns null when env vars are missing or the dep is not
 * installed (or dynamic import otherwise fails).
 */
export async function ensureClient(): Promise<SupabaseLike | null> {
  if (!isSupabaseReady) return null;
  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const mod: { createClient?: (url: string, key: string) => SupabaseLike } =
          await import('./supabase-client');
        const createClient = mod?.createClient;
        if (!createClient) return null;
        return createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);
      } catch {
        // Dependency not installed (or load failed) — app keeps working
        // without Supabase. Run `bun add @supabase/supabase-js` to enable.
        return null;
      }
    })();
  }
  return clientPromise;
}

/* --- public API ---------------------------------------------------------- */

/**
 * Insert a farmer price report. Tries the plain anon insert first — the RLS
 * insert policy allows anonymous rows (auth.uid() is null → user_id stays
 * null), so no sign-in is required. If the insert is rejected, falls back to
 * anonymous sign-in (when enabled in the dashboard) and retries, which ties
 * the row to an auth user. Never throws.
 */
export async function submitPriceReport(input: PriceReportInput): Promise<SubmitResult> {
  const supabase = await ensureClient();
  if (!supabase) {
    return { ok: false, reason: isSupabaseReady ? 'client_unavailable' : 'not_configured' };
  }

  const row = {
    crop: input.crop,
    province: input.province,
    price: input.price,
    unit: input.unit ?? null,
    note: input.note ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  };
  const insert = async () =>
    supabase.from('price_reports').insert(row).select('id').single();

  try {
    const { data, error } = await insert();
    if (!error) {
      const id = (data as { id?: string } | null)?.id;
      return id ? { ok: true, id } : { ok: false, reason: 'insert_failed: no id returned' };
    }
    /* anon insert rejected → try anonymous sign-in once, then retry */
    const { error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) return { ok: false, reason: `insert_failed: ${String(error)}` };
    const retry = await insert();
    if (retry.error) return { ok: false, reason: `insert_failed: ${String(retry.error)}` };
    const id = (retry.data as { id?: string } | null)?.id;
    return id ? { ok: true, id } : { ok: false, reason: 'insert_failed: no id returned' };
  } catch (err) {
    return { ok: false, reason: `unexpected: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Fetch recent reports, newest first. Optional crop/province filters.
 * Returns [] on any failure (not configured, not installed, network, …).
 */
export async function fetchRecentReports(
  crop?: string,
  province?: string,
  limit = 50,
): Promise<PriceReport[]> {
  const supabase = await ensureClient();
  if (!supabase) return [];

  try {
    /* explicit columns: user_id is never read by the client (see migration revoking it) */
    let query: any = supabase
      .from('price_reports')
      .select('id,crop,province,price,unit,note,lat,lng,photo_url,created_at');
    if (crop) query = query.eq('crop', crop);
    if (province) query = query.eq('province', province);

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(Math.max(1, Math.min(limit, 200)));

    if (error || !Array.isArray(data)) return [];
    // Postgres numeric columns come back as strings — normalize to number.
    return (data as unknown as PriceReport[]).map((row) => ({ ...row, price: Number(row.price) }));
  } catch {
    return [];
  }
}
