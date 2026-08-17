/* Harvest Trend · รู้ทันราคา — watch-sync auth tests (node, zero deps) */
'use strict';
const assert = require('assert');
const crypto = require('crypto');
const { verifyIdToken } = require('../api/line-verify.js');
const { _internals } = require('../api/watch-sync.js');
const { resolveLineSub } = _internals;

let n = 0;
function ok(name, cond){
  n++;
  assert.ok(cond, 'FAIL: ' + name);
  console.log('  ✓ ' + name);
}

/* build a valid (or tampered) LINE-style id_token: HS256 signed with secret */
function b64url(buf){
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function makeToken({ sub = 'U123', aud = 'CID', exp = Math.floor(Date.now() / 1000) + 600, secret = 'SECRET', tamper = false } = {}){
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64url(JSON.stringify({ iss: 'https://access.line.me', sub, aud, exp, name: 'Test' }));
  const sig = b64url(crypto.createHmac('sha256', secret).update(h + '.' + p).digest());
  return h + '.' + p + '.' + (tamper ? sig.slice(0, -2) + 'AA' : sig);
}

process.env.LINE_LOGIN_CLIENT_ID = 'CID';
process.env.LINE_LOGIN_CLIENT_SECRET = 'SECRET';

console.log('verifyIdToken:');
ok('valid id_token → claims with sub', verifyIdToken(makeToken())?.sub === 'U123');
ok('tampered signature → null', verifyIdToken(makeToken({ tamper: true })) === null);
ok('garbage token → null', verifyIdToken('not.a.jwt') === null);
ok('empty token → null', verifyIdToken('') === null);
ok('wrong audience → null', verifyIdToken(makeToken({ aud: 'OTHER' })) === null);
ok('expired token → null', verifyIdToken(makeToken({ exp: Math.floor(Date.now() / 1000) - 60 })) === null);
const savedId = process.env.LINE_LOGIN_CLIENT_ID;
delete process.env.LINE_LOGIN_CLIENT_ID;
ok('missing env → null (not configured)', verifyIdToken(makeToken()) === null);
process.env.LINE_LOGIN_CLIENT_ID = savedId;

console.log('resolveLineSub (Authorization header):');
(async () => {
  const realFetch = global.fetch;
  ok('no header → null', (await resolveLineSub(undefined)) === null);
  ok('non-bearer header → null', (await resolveLineSub('Basic xyz')) === null);
  ok('valid id_token → its sub', (await resolveLineSub('Bearer ' + makeToken())) === 'U123');

  /* access_token path: verified against LINE /v2/profile */
  let profileCalled = false;
  global.fetch = async (url, opts) => {
    profileCalled = true;
    return { ok: true, status: 200, json: async () => ({ userId: 'U987', displayName: 'T' }) };
  };
  ok('access_token verified via profile → userId', (await resolveLineSub('Bearer at-123')) === 'U987');
  ok('profile endpoint was called for access_token', profileCalled);

  /* invalid access_token → null */
  global.fetch = async () => ({ ok: false, status: 401, json: async () => ({}) });
  ok('invalid access_token → null', (await resolveLineSub('Bearer at-bad')) === null);

  /* profile endpoint down → null */
  global.fetch = async () => { throw new Error('net'); };
  ok('profile endpoint unreachable → null', (await resolveLineSub('Bearer at-net')) === null);
  global.fetch = realFetch;

  console.log('\nwatch-sync.test.js: ' + n + ' checks OK');
})().catch(e => { console.error('FAIL: ' + e); process.exit(1); });
