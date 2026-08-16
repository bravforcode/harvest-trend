/* Harvest Trend · รู้ทันราคา — LINE Login exchange (PKCE).
   POST { code, redirect_uri, code_verifier } → swaps the auth code for an
   id_token, verifies its HS256 signature with the client secret, and returns
   the LINE profile (sub = stable user id shared with the Messaging API
   channel when both live under the same provider).
   Requires env: LINE_LOGIN_CLIENT_ID + LINE_LOGIN_CLIENT_SECRET.
   501 not_configured when missing (feature disabled — app degrades). */
const crypto = require('crypto');

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

module.exports = async function handler(req, res) {
  const clientId = process.env.LINE_LOGIN_CLIENT_ID;
  const clientSecret = process.env.LINE_LOGIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(501).json({ ok: false, reason: 'not_configured' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, reason: 'method_not_allowed' });
    return;
  }
  const { code, redirect_uri, code_verifier } = req.body || {};
  if (!code || !redirect_uri || !code_verifier) {
    res.status(400).json({ ok: false, reason: 'missing_params' });
    return;
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier
    });
    const tok = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    const data = await tok.json();
    if (!tok.ok || !data.id_token) {
      res.status(400).json({ ok: false, reason: 'token_exchange_failed' });
      return;
    }

    /* verify the id_token signature (HS256 with the client secret) */
    const [h, p, sig] = data.id_token.split('.');
    if (!h || !p || !sig) throw new Error('bad_id_token');
    const expected = b64url(crypto.createHmac('sha256', clientSecret).update(h + '.' + p).digest());
    if (expected !== sig) {
      res.status(400).json({ ok: false, reason: 'bad_signature' });
      return;
    }
    const claims = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    res.json({ ok: true, profile: { sub: claims.sub, name: claims.name || null, picture: claims.picture || null } });
  } catch (e) {
    res.status(500).json({ ok: false, reason: 'unexpected:' + (e instanceof Error ? e.message : String(e)) });
  }
};
