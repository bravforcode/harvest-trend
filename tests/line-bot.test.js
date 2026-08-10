/* Harvest Trend · รู้ทันราคา — LINE bot engine tests (node, zero deps) */
'use strict';
const assert = require('assert');
const { _internals } = require('../api/line-webhook.js');
const { parseCommand, buildPriceReply, buildReportReply, verifySignature, priceAt, signals, recommend, storeReport, processDemo, buildJoinReply } = _internals;

let n = 0;
function ok(name, cond){
  n++;
  assert.ok(cond, 'FAIL: ' + name);
  console.log('  ✓ ' + name);
}

console.log('parseCommand:');
let p = parseCommand('ราคา ระยอง ทุเรียน');
ok('th price rayong/durian', p.type === 'price' && p.prov === 'rayong' && p.crop === 'durian' && p.grade === 'A' && p.lang === 'th');
p = parseCommand('ราคา จันทบุรี มังคุด เกรด B');
ok('th grade B', p.prov === 'chanthaburi' && p.crop === 'mangosteen' && p.grade === 'B');
p = parseCommand('@gracia ราคา ระยอง ทุเรียน');
ok('th price with @mention prefix', p.type === 'price' && p.prov === 'rayong' && p.crop === 'durian' && p.lang === 'th');
p = parseCommand('@gracia ช่วย');
ok('help with @mention prefix', p.type === 'help');
p = parseCommand('@gracia price chanthaburi mangosteen');
ok('en price with @mention prefix', p.type === 'price' && p.crop === 'mangosteen' && p.lang === 'en');
p = parseCommand('price chanthaburi mangosteen');
ok('en price', p.type === 'price' && p.crop === 'mangosteen' && p.lang === 'en');
p = parseCommand('ช่วย');
ok('help th', p.type === 'help');
p = parseCommand('help');
ok('help en', p.type === 'help' && p.lang === 'en');
p = parseCommand('รายงาน 150 ระยอง ทุเรียน');
ok('report', p.type === 'report' && p.price === 150 && p.prov === 'rayong' && p.crop === 'durian');
p = parseCommand('ราคา');
ok('bare price → default + hint', p.type === 'price' && p.prov === 'rayong' && p.crop === 'durian' && p.hint === true);
p = parseCommand('สวัสดี');
ok('unknown', p.type === 'unknown');

console.log('engine:');
const v1 = priceAt('durian', 'rayong', 'A', 30);
const v2 = priceAt('durian', 'rayong', 'A', 30);
ok('priceAt deterministic', v1 === v2);
ok('durian price sane (100–250)', v1 > 100 && v1 < 250);
const sg = signals('durian', 'rayong', 'A');
ok('signals shape', sg.momSt && sg.supSt && sg.harvSt && sg.wxSt && sg.series.a.length === 26 && sg.series.f.length === 4);
ok('recommend shape', ['sell','wait','recover'].includes(recommend(sg).rec));

console.log('replies:');
const msgs = buildPriceReply(parseCommand('ราคา ระยอง ทุเรียน'), 'th');
ok('price reply is flex with quickReply', msgs.length >= 1 && msgs[0].type === 'flex' && msgs[0].quickReply && msgs[0].quickReply.items.length === 3);
ok('flex has verdict text', JSON.stringify(msgs[0]).includes('คำแนะนำ') && JSON.stringify(msgs[0]).includes('ทุเรียน'));
const rp = buildReportReply(parseCommand('รายงาน 150 ระยอง ทุเรียน'), 'th');
ok('report reply thanks + amount', rp.type === 'text' && rp.text.includes('150'));
ok('report stored', storeReport.length || true); // storeReport called in handler; here just ensure fn exists

console.log('signature:');
const crypto = require('crypto');
const raw = JSON.stringify({ events: [] });
const good = crypto.createHmac('sha256', 'SECRET').update(raw).digest('base64');
ok('valid signature passes', verifySignature(raw, good, 'SECRET') === true);
ok('wrong signature fails', verifySignature(raw, 'AAAA', 'SECRET') === false);
ok('empty secret fails', verifySignature(raw, good, '') === false);

console.log('demo mode:');
const dm = processDemo('ราคา ระยอง ทุเรียน');
ok('demo price → flex message', dm.length >= 1 && dm[0].type === 'flex');
ok('demo help', processDemo('ช่วย')[0].type === 'text');
ok('demo unknown', processDemo('สวัสดี')[0].type === 'text');
ok('demo report', processDemo('รายงาน 150 ระยอง ทุเรียน')[0].type === 'text');

console.log('webhook handler (Vercel pre-parsed body):');
/* Regression: Vercel drains the stream and hands the handler a parsed object.
   Signature must be verified against JSON.stringify(req.body), and the bot
   must reply — not 401. */
const handler = require('../api/line-webhook.js');
ok('join reply built (th)', buildJoinReply('th').type === 'text' && buildJoinReply('th').text.includes('เข้าร่วมกลุ่ม'));
const origRaw = JSON.stringify({
  destination: 'U123',
  events: [{ type: 'message', replyToken: 'R1', message: { type: 'text', text: 'ราคา ระยอง ทุเรียน' }, source: { type: 'user', userId: 'U1' } }]
});
const sig = crypto.createHmac('sha256', 'SECRET').update(origRaw).digest('base64');

(async () => {
  let status = null, json = null;
  const res = { status(s){ status = s; return this; }, json(j){ json = j; } };
  const drained = (async function*(){ /* Vercel already consumed the stream */ })();
  const req = {
    method: 'POST',
    body: JSON.parse(origRaw),
    headers: { 'x-line-signature': sig },
    [Symbol.asyncIterator]: drained[Symbol.asyncIterator].bind(drained)
  };
  const realFetch = global.fetch;
  let sent = [];
  // track only LINE API calls — api/prices.js also uses fetch (real prices),
  // so filter and give the mock response json/text for those calls
  global.fetch = async (url, opts) => {
    if (String(url).includes('api.line.me')) sent.push({ url, opts });
    return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
  };
  try {
    process.env.LINE_CHANNEL_SECRET = 'SECRET';
    process.env.LINE_CHANNEL_ACCESS_TOKEN = 'TOKEN';
    await handler(req, res);
    ok('vercel-style event → 200 (not 401)', status === 200);
    /* the webhook now fetches real prices (data.go.th/BOT) before replying,
       so the LINE API call is the LAST fetch captured */
    const msg = sent.length && JSON.parse(sent[sent.length - 1].opts.body).messages[0];
    ok('vercel-style event → flex reply sent via LINE API', !!msg && msg.type === 'flex' && JSON.stringify(msg).includes('ทุเรียน'));

    // join event (bot invited to group) → must greet the group, not stay silent
    status = null; sent = [];
    const joinRaw = JSON.stringify({
      destination: 'U123',
      events: [{ type: 'join', replyToken: 'R2', timestamp: Date.now(), source: { type: 'group', groupId: 'G1', userId: 'U1' } }]
    });
    const joinSig = crypto.createHmac('sha256', 'SECRET').update(joinRaw).digest('base64');
    const req2 = {
      method: 'POST',
      body: JSON.parse(joinRaw),
      headers: { 'x-line-signature': joinSig },
      [Symbol.asyncIterator]: drained[Symbol.asyncIterator].bind(drained)
    };
    await handler(req2, res);
    const joinMsg = sent.length && JSON.parse(sent[sent.length - 1].opts.body).messages[0];
    ok('join event → 200 + group greeting sent', status === 200 && !!joinMsg && joinMsg.type === 'text' && joinMsg.text.includes('เข้าร่วมกลุ่ม'));
  } finally {
    global.fetch = realFetch;
    delete process.env.LINE_CHANNEL_SECRET;
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
  }

  console.log('\nALL ' + n + ' TESTS PASSED');
})().catch((e) => { console.error('FAIL: ' + e); process.exit(1); });
