# LINE Login — setup guide

Harvest Trend supports LINE Login (free) so a user's web identity maps to the
same LINE user id the Messaging API uses. **Critical requirement:** create the
LINE Login channel under the **same provider** as the existing Messaging API
channel — otherwise the two channels get **different user ids** and sync breaks.

## 1. Create the channel (console, ~3 min)

1. Open https://developers.line.biz/console/ → sign in with the account that
   owns the **@441sptre** Messaging API channel.
2. Open the **provider** that contains the Messaging API channel
   (`gracia` / @441sptre).
3. In that provider, click **Create channel → LINE Login**.
   - Channel name: anything **without "LINE"** in it (e.g. "Harvest Trend login")
   - App types: **Web app** (required for the PWA)
   - Region: Thailand · Provider: the SAME one as the Messaging API channel
   - Email address: any valid one
4. Open the new channel → **LINE Login settings**:
   - **Callback URL**: `https://harvest-ecc.vercel.app/line`
   - Scope: `openid profile` (email requires a separate application — skip)

## 2. Get credentials

- **Channel ID** (the numeric ID on the channel's Basic settings page)
- **Channel secret** (Basic settings → Channel secret — reveal it)

## 3. Set environment variables (Vercel)

```powershell
# client (build-time, must exist when Vercel builds the SPA):
#   VITE_LINE_LOGIN_CLIENT_ID=<Channel ID>
vercel env add VITE_LINE_LOGIN_CLIENT_ID production
vercel env add VITE_LINE_LOGIN_CLIENT_ID preview
vercel env add VITE_LINE_LOGIN_CLIENT_ID development

# server (api/line-login.js — token exchange + signature verification):
vercel env add LINE_LOGIN_CLIENT_ID production
vercel env add LINE_LOGIN_CLIENT_SECRET production
```

Then redeploy: `vercel --prod`.

## 4. Verify

1. Open https://harvest-ecc.vercel.app/line → "เชื่อมบัญชี LINE" card appears.
2. Tap it → LINE consent screen → back on /line showing "สวัสดี <name>".
3. The stored profile lives in `localStorage` key `rtp_line_v1`
   (`{ sub, name, picture }`). `sub` equals the LINE user id used by the
   Messaging API webhook for the same person → that is the join key for
   future watchlist/settings sync.

## Troubleshooting

- **Card doesn't render**: `VITE_LINE_LOGIN_CLIENT_ID` missing at build time.
- **"Link expired"**: state/verifier mismatch — usually re-tapping connect
  after a page reload mid-flow.
- **"Connection failed"**: api/line-login returned non-ok — check the Vercel
  function logs; most common cause is a wrong `LINE_LOGIN_CLIENT_SECRET`
  (HS256 verification fails) or a callback URL mismatch (LINE rejects the
  redirect before we ever see the code).
- **Same user id**: if you accidentally created the channel in a NEW provider,
  delete it and recreate inside the provider that holds the Messaging API
  channel. Different providers = different `sub` values.
