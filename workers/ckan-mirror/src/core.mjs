/*
  Harvest Trend · รู้ทันราคา — CKAN mirror core (pure logic, no Cloudflare
  runtime APIs), so the exact same code runs inside the Worker and in the
  Node test suite.

  Job: data.go.th (Thai gov CKAN) sits behind a Cloudflare WAF that 403s
  datacenter IPs (verified 2026-08-17: success:true from a residential IP,
  HTTP 403 from Vercel). This worker runs ON Cloudflare's own network, so
  it fetches each dataset once per cron tick, paginates it, and stores the
  raw records in KV. api/prices.js then reads the mirror instead of poking
  data.go.th directly (with a direct-fetch fallback when the mirror is
  unreachable).

  Snapshot shape stored in KV under key "snapshot":
    { updated_at, resources: { [resourceId]: records[] }, counts, errors }
*/
'use strict';

export const DATA_GOV = 'https://data.go.th/api/3/action';
export const PAGE = 100;
export const MAX_PAGES = 6; /* safety: at most 600 records per resource */
export const FETCH_TIMEOUT_MS = 15000;

/* UA rotation mirrors api/prices.js — some WAF rules also trip on
   non-browser UAs, so try the realistic set before giving up. */
export const UAS = [
  'harvest-ecc/1.0 (+https://harvest-ecc.vercel.app)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
];

/* Every datastore resource id consumed by api/prices.js SOURCES +
   rambutan. Keep in sync with that file (a mismatch just means one source
   falls back to direct fetch — never a crash). */
export const RESOURCE_IDS = [
  'a5b7fe59-1bdd-4e64-bda6-568f3a9866e3', /* durian · ตราด */
  'ab9f2e12-28b3-4383-a99f-de8f33579b10', /* rambutan · ตราด */
  'c7a983eb-356b-42d3-b734-cc166ec80da8', /* sugarcane · อำนาจเจริญ */
  'cc5981c2-3648-4595-a56f-77d085ce2206', /* rubber · อำนาจเจริญ */
  '89c507a2-392c-41ed-a115-e6044d1afbd0', /* rice · แม่ฮ่องสอน */
  'f2be2daf-d5d0-47c0-a1e0-342d5c12d253', /* maize · แม่ฮ่องสอน */
  'e6fd80a6-125a-40b8-9293-0a81c6fe2ba2', /* palm · สุราษฎร์ธานี */
  'd21158de-0193-4f3b-b703-fc350687106a', /* cassava · OAE national */
  'd39fc22e-625b-4e89-8ca4-843fc52f9783', /* pork · OAE national */
  '10ebc3b6-d5ba-4025-b5f3-261b71a6458c', /* egg · OAE national */
  '8d6439a5-ddab-4744-b530-a464499ad8f5', /* broiler · OAE national */
  'ecf31b91-5042-4908-b3d2-689343a421e1', /* beef · OAE national */
  'e78db1eb-672b-44d9-8500-4848446fe73f', /* shrimp · OAE national */
  '90815570-5733-4889-ae90-e88e1298e23c', /* coffee · OAE national */
  'b6d3376e-b511-4288-a445-4d6d9effc873', /* milk · ลพบุรี */
  '99a86152-369d-4567-906d-67f2dfaf37c7', /* pork · ลพบุรี */
  '4fad26ab-18c1-4b37-823c-b7f550514a2f', /* broiler · ลพบุรี */
  '14f201d4-d176-494a-b68a-6e1bc6184b62', /* rice (หอมมะลิ) · ลพบุรี */
  'b83fb2fa-f226-4b48-9b04-7941dc7d6000', /* rice (เปลือกเจ้า) · ลพบุรี */
  'c0471ba8-ff34-4c5b-bd2c-b2bae38b2881', /* maize · ลพบุรี */
  '2978b279-131d-43d7-be81-d162a9c4a8bc', /* cassava · ลพบุรี */
  '5628dc6c-fe2f-4315-b53d-ceac3cb61006', /* rice (เจ้า 15%) · สุพรรณบุรี */
  'a3d2bf90-917a-478b-9044-14440e7d17b0', /* durian · ปราจีนบุรี */
  'b3c8c409-7f67-4c56-8cac-3a88e867837b', /* mango · ฉะเชิงเทรา */
  '1569291f-bc2b-45c2-97ab-ba466954f995', /* banana · ตาก */
  '3da73315-ac80-4bf2-ad59-b8ca68f93f06'  /* beef · อำนาจเจริญ */
];

/* One datastore page with UA rotation + one retry pass (same policy as
   api/prices.js so behaviour is identical whichever side fetches). */
async function getJson(url, fetcher, timeoutMs = FETCH_TIMEOUT_MS){
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  let lastErr = null;
  try{
    for(let pass = 0; pass < 2; pass++){
      for(const ua of UAS){
        try{
          const r = await fetcher(url, { signal: ctl.signal, headers: { 'User-Agent': ua, 'Accept': 'application/json' } });
          if(!r.ok) throw new Error('HTTP ' + r.status);
          return await r.json();
        }catch(e){
          if(e.name === 'AbortError') throw e;
          lastErr = e;
        }
      }
      if(pass === 0) await new Promise(res => setTimeout(res, 400));
    }
    throw lastErr || new Error('unreachable');
  }finally{ clearTimeout(t); }
}

/* Paginate one CKAN datastore resource end-to-end. */
export async function fetchResource(rid, fetcher = fetch){
  const records = [];
  for(let offset = 0; offset < PAGE * MAX_PAGES; offset += PAGE){
    const url = DATA_GOV + '/datastore_search?resource_id=' + rid + '&limit=' + PAGE + '&offset=' + offset;
    const j = await getJson(url, fetcher);
    if(!j.success || !j.result || !Array.isArray(j.result.records)){
      throw new Error('datastore failed ' + rid);
    }
    const page = j.result.records;
    records.push.apply(records, page);
    if(page.length < PAGE) break;
  }
  return records;
}

/* Fetch every resource in small concurrent batches (stays inside the free
   plan's 30s wall-clock / subrequest budget), then write the whole snapshot
   to KV in one atomic put (a partial failure never corrupts the old one).
   If kv is null the snapshot is still returned (used by tests / POST). */
export async function buildSnapshot({ kv = null, fetcher = fetch, concurrency = 4 }){
  const resources = {};
  const counts = {};
  const errors = [];
  for(let i = 0; i < RESOURCE_IDS.length; i += concurrency){
    const batch = RESOURCE_IDS.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(async rid => {
      try{ return { rid, records: await fetchResource(rid, fetcher) }; }
      catch(e){ return { rid, error: (e && e.message) || String(e) }; }
    }));
    for(const r of results){
      if(r.error){
        /* keep the key present as an empty array so consumers can tell a
           mirrored-but-empty dataset from a brand-new unknown one */
        errors.push(r.rid + ': ' + r.error);
        resources[r.rid] = [];
        counts[r.rid] = 0;
        continue;
      }
      resources[r.rid] = r.records;
      counts[r.rid] = r.records.length;
    }
  }
  const snapshot = { updated_at: new Date().toISOString(), resources, counts, errors };
  if(kv) await kv.put('snapshot', JSON.stringify(snapshot));
  return snapshot;
}
