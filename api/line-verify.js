/*
  Harvest Trend · รู้ทันราคา — shared LINE Login id_token verification.

  Used by api/line-login.js (after the code exchange) and api/watch-sync.js
  (before reading/writing a watchlist). Verifies the HS256 signature with the
  client secret, checks `aud` against the configured client id and `exp`, and
  returns the parsed claims (sub = stable LINE user id) or null.

  Requires env: LINE_LOGIN_CLIENT_ID + LINE_LOGIN_CLIENT_SECRET.
  Returns null when env is missing or the token fails any check (caller
  decides whether that means 401 or not_configured).
*/
'use strict';
const crypto = require('crypto');

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* Verify an id_token. Returns claims ({sub, name?, picture?, aud, exp}) or null. */
function verifyIdToken(idToken) {
  const clientId = process.env.LINE_LOGIN_CLIENT_ID;
  const clientSecret = process.env.LINE_LOGIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  if (typeof idToken !== 'string' || !idToken) return null;
  const [h, p, sig] = idToken.split('.');
  if (!h || !p || !sig) return null;

  const expected = b64url(crypto.createHmac('sha256', clientSecret).update(h + '.' + p).digest());
  /* constant-time comparison (Node 18+ supports base64url) */
  const a = Buffer.from(expected, 'base64url');
  const b = Buffer.from(sig, 'base64url');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let claims;
  try { claims = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')); }
  catch { return null; }
  if (!claims || claims.aud !== clientId) return null;
  if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) return null;
  if (typeof claims.sub !== 'string' || !claims.sub) return null;
  return claims;
}

module.exports = { verifyIdToken };
