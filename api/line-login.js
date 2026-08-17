/* Harvest Trend · รู้ทันราคา — LINE Login exchange (PKCE).
   POST { code, redirect_uri, code_verifier } → swaps the auth code for an
   id_token, verifies its HS256 signature with the client secret, and returns
   the LINE profile (sub = stable user id shared with the Messaging API
   channel when both live under the same provider) plus the raw id_token and
   access_token so the client can present them to /api/watch-sync later.
   Requires env: LINE_LOGIN_CLIENT_ID + LINE_LOGIN_CLIENT_SECRET.
   501 not_configured when missing (feature disabled — app degrades). */
const { verifyIdToken } = require('./line-verify.js');

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

    /* verify the id_token signature (HS256 with the client secret) + aud + exp */
    const claims = verifyIdToken(data.id_token);
    if (!claims) {
      res.status(400).json({ ok: false, reason: 'bad_signature' });
      return;
    }
    res.json({
      ok: true,
      profile: { sub: claims.sub, name: claims.name || null, picture: claims.picture || null },
      id_token: data.id_token,
      access_token: data.access_token || null,
      expires_in: data.expires_in || null
    });
  } catch (e) {
    res.status(500).json({ ok: false, reason: 'unexpected:' + (e instanceof Error ? e.message : String(e)) });
  }
};
