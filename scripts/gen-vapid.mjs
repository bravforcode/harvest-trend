/* Harvest Trend · รู้ทันราคา — generate VAPID keys for web push (P-256/ECDSA pair).

   Run:   node scripts/gen-vapid.mjs
   Dep:   'web-push' (NOT installed yet — the script loads it lazily and tells
          you to 'bun add web-push' if it is missing).

   Keys are a one-time per-deployment pair: keep the private key secret. */

try {
  const webpush = (await import('web-push')).default;
  const keys = webpush.generateVAPIDKeys();
  console.log('VAPID keys generated (P-256 / ECDSA) — one pair per deployment:');
  console.log('');
  console.log('PUBLIC KEY (safe to ship to the browser):');
  console.log(keys.publicKey);
  console.log('');
  console.log('PRIVATE KEY (server only — NEVER expose to the client):');
  console.log(keys.privateKey);
  console.log('');
  console.log('Set these environment variables:');
  console.log('  Vercel dashboard → Project → Settings → Environment Variables:');
  console.log('    VITE_VAPID_PUBLIC_KEY = <publicKey>   (build-time; client bundle reads it)');
  console.log('    VAPID_PUBLIC_KEY      = <publicKey>   (runtime; api/push-check.js reads it)');
  console.log('    VAPID_PRIVATE_KEY     = <privateKey>  (runtime; api/push.js reads it)');
  console.log('  or CLI (requires the Vercel CLI):');
  console.log('    vercel env add VITE_VAPID_PUBLIC_KEY');
  console.log('    vercel env add VAPID_PUBLIC_KEY');
  console.log('    vercel env add VAPID_PRIVATE_KEY');
  console.log('  then deploy: vercel deploy --prod');
  console.log('');
  console.log('Browser flow: open the app, tap "เปิดการแจ้งเตือน" on the LINE page.');
  console.log('Server flow: the daily cron (vercel.json crons → /api/push-check)');
  console.log('  sends the alert when a watched price crosses its threshold.');
} catch (e) {
  console.error('web-push is not installed. Run:');
  console.error('  bun add web-push');
  console.error('then re-run: node scripts/gen-vapid.mjs');
  process.exit(1);
}
