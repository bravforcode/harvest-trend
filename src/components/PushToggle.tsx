/* Harvest Trend · รู้ทันราคา — web push toggle (env-gated by VITE_VAPID_PUBLIC_KEY).
   Renders nothing unless a VAPID public key was configured at build time.
   Subscribes the browser, stores the subscription via POST /api/push, and
   lets the user turn it off again (unsubscribe + {unsub:true} to the API). */
import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { getThresholds } from '@/lib/thresholds';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VAPID_PUBLIC_KEY: string = (import.meta.env.VITE_VAPID_PUBLIC_KEY || '').replace(/[\r\n"]/g, '').trim();

/* standard URL-safe base64 → Uint8Array (push subscribe wants raw key bytes) */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ArrayBuffer (from PushSubscription.getKey) → base64 for the server */
function bufToB64(buf: ArrayBuffer | null): string | null {
  if (!buf) return null;
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function PushToggle() {
  const { lang, toast } = useApp();
  const t = T[lang];
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  /* reflect the real browser state: already subscribed? */
  useEffect(() => {
    let on = true;
    navigator.serviceWorker.getRegistration()
      .then(reg => (reg ? reg.pushManager.getSubscription() : null))
      .then(sub => { if (on) setEnabled(!!sub); })
      .catch(() => { /* SW unavailable — leave the button in the default state */ });
    return () => { on = false; };
  }, []);

  if (!VAPID_PUBLIC_KEY) return null; // feature disabled at build time

  if (!('PushManager' in window)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.pushTitle}</CardTitle>
          <CardDescription>{t.pushSub}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[0.7813rem] text-moss">{t.pushUnsupported}</p>
        </CardContent>
      </Card>
    );
  }

  const toggle = async () => {
    setBusy(true);
    try {
      if (enabled) {
        /* off: unsubscribe locally + tell the server to forget us */
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (sub) await sub.unsubscribe();
        await fetch('api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unsub: true, sub: { endpoint: sub ? sub.endpoint : null } })
        });
        setEnabled(false);
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { toast(t.pushDenied, 'err'); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      const p256dh = bufToB64(sub.getKey('p256dh'));
      const auth = bufToB64(sub.getKey('auth'));
      if (!p256dh || !auth) { toast(t.pushFail, 'err'); return; }
      /* attach the first price threshold (if any) so the daily cron can alert */
      const thr = getThresholds()[0] ?? null;
      const res = await fetch('api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sub: { endpoint: sub.endpoint, p256dh, auth },
          threshold: thr ? { p: thr.p, c: thr.c, price: thr.price } : undefined
        })
      });
      if (!res.ok) {
        /* the browser-side subscription exists, but the server did not store
           it (e.g. its VAPID keys are missing in this env) — say so honestly
           and stay in the off state (re-clicking re-POSTs the existing sub) */
        toast(t.pushFail, 'err');
        return;
      }
      toast(t.pushSaved);
      setEnabled(true);
    } catch {
      toast(t.pushFail, 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.pushTitle}</CardTitle>
        <CardDescription>{t.pushSub}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant={enabled ? 'outline' : 'gold'} onClick={toggle} disabled={busy}>
          {enabled ? <BellOff className="size-4" aria-hidden="true" /> : <Bell className="size-4" aria-hidden="true" />}
          {enabled ? t.pushOff : t.pushOn}
        </Button>
      </CardContent>
    </Card>
  );
}
