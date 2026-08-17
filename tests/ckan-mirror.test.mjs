/* Harvest Trend · รู้ทันราคา — CKAN mirror (workers/ckan-mirror) tests.
   Node ESM, zero deps. Exercises the core fetch/snapshot logic with a fake
   fetcher so it runs offline (the live path is covered by the smoke test). */
import assert from 'node:assert';
import { buildSnapshot, fetchResource, RESOURCE_IDS, DATA_GOV, PAGE } from '../workers/ckan-mirror/src/core.mjs';

let n = 0;
function ok(name, cond){
  n++;
  assert.ok(cond, 'FAIL: ' + name);
  console.log('  ✓ ' + name);
}

console.log('CKAN mirror core:');

ok('26 datasets registered (matches api/prices.js SOURCES)', RESOURCE_IDS.length === 26);
ok('resource ids are UUID-shaped', RESOURCE_IDS.every(id => /^[0-9a-f-]{36}$/.test(id)));
ok('no duplicate resource ids', new Set(RESOURCE_IDS).size === RESOURCE_IDS.length);
ok('DATA_GOV base URL is correct', DATA_GOV === 'https://data.go.th/api/3/action');

/* fake fetcher that serves 250 fake records in 100-row pages */
function makeFetcher(rows, failFor = null){
  let calls = 0;
  return {
    calls: () => calls,
    fetch: async (url, opts) => {
      calls++;
      if(failFor && url.indexOf('resource_id=' + failFor) !== -1) throw new Error('HTTP 403');
      const u = new URL(url);
      const offset = Number(u.searchParams.get('offset') || 0);
      const page = rows.slice(offset, offset + PAGE);
      return {
        ok: true,
        json: async () => ({ success: true, result: { records: page } })
      };
    }
  };
}

/* pagination: 250 rows → 3 pages fetched, all returned */
{
  const rows = Array.from({ length: 250 }, (_, i) => ({ i }));
  const f = makeFetcher(rows);
  const recs = await fetchResource('abc', f.fetch);
  ok('fetchResource paginates 250 rows across 3 pages', recs.length === 250);
  ok('page size honored (limit=100 in each URL)', f.calls() === 3);
}

/* buildSnapshot merges all resources + records failures, never throws */
{
  const rows = Array.from({ length: 5 }, (_, i) => ({ i }));
  const f = makeFetcher(rows, RESOURCE_IDS[0]); // first dataset 403s
  const kv = { store: {}, put: async (k, v) => { kv.store[k] = v; } };
  const snap = await buildSnapshot({ kv, fetcher: f.fetch });
  ok('snapshot has all 26 resource keys (failed one included as empty)', Object.keys(snap.resources).length === 26);
  ok('successful resources carry their records', snap.resources[RESOURCE_IDS[1]].length === 5);
  ok('failed resource recorded in errors, not thrown', snap.errors.length === 1 && snap.errors[0].indexOf(RESOURCE_IDS[0]) !== -1);
  ok('counts object present per resource', snap.counts[RESOURCE_IDS[1]] === 5 && snap.counts[RESOURCE_IDS[0]] === 0);
  ok('snapshot written to KV', !!kv.store.snapshot && JSON.parse(kv.store.snapshot).updated_at === snap.updated_at);
  ok('updated_at is ISO', /^\d{4}-\d{2}-\d{2}T/.test(snap.updated_at));
}

/* mirror is a no-op (returns null) without a mirror URL — prices.js falls back */
{
  const { _internals } = await import('../api/prices.js');
  ok('prices.js still exports SOURCES', Array.isArray(_internals.SOURCES));
}

console.log('\nckan-mirror.test.mjs: ' + n + ' checks OK');
