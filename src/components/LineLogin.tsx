/* Harvest Trend · รู้ทันราคา — LINE Login button (PKCE, env-gated by
   VITE_LINE_LOGIN_CLIENT_ID). Renders nothing unless configured. On callback
   (?code&state on the same page) exchanges the code via /api/line-login and
   stores { sub, name, picture } in localStorage (rtp_line_v1). */
import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CLIENT_ID: string = import.meta.env.VITE_LINE_LOGIN_CLIENT_ID || '';
const LINE_KEY = 'rtp_line_v1';

interface LineProfile { sub: string; name?: string | null; picture?: string | null }

const store = {
  get(): LineProfile | null {
    try { return JSON.parse(localStorage.getItem(LINE_KEY) || 'null'); } catch { return null; }
  },
  set(v: LineProfile | null): void {
    try {
      if (v) localStorage.setItem(LINE_KEY, JSON.stringify(v));
      else localStorage.removeItem(LINE_KEY);
    } catch { /* noop */ }
  }
};

function randB64(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256B64url(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function LineLogin() {
  const { lang, toast } = useApp();
  const t = T[lang];
  const [profile, setProfile] = useState<LineProfile | null>(store.get());
  const busy = useRef(false);

  /* handle the OAuth callback: ?code&state on this page */
  useEffect(() => {
    if (busy.current || profile) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) return;
    busy.current = true;
    const saved = sessionStorage.getItem('rtp_line_state');
    const verifier = sessionStorage.getItem('rtp_line_verifier');
    if (state !== saved || !verifier) {
      toast(t.llExpired, 'err');
      window.history.replaceState({}, '', window.location.pathname);
      busy.current = false;
      return;
    }
    sessionStorage.removeItem('rtp_line_state');
    sessionStorage.removeItem('rtp_line_verifier');
    fetch('api/line-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: window.location.origin + '/line', code_verifier: verifier })
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.profile) { store.set(d.profile); setProfile(d.profile); toast(t.pushSaved); }
        else toast(t.llFail, 'err');
      })
      .catch(() => toast(t.llFail, 'err'))
      .finally(() => {
        window.history.replaceState({}, '', window.location.pathname);
        busy.current = false;
      });
  }, [profile, t]);

  if (!CLIENT_ID) return null; // feature disabled at build time

  const connect = async () => {
    const verifier = randB64(48);
    const challenge = await sha256B64url(verifier);
    const state = randB64(18);
    sessionStorage.setItem('rtp_line_state', state);
    sessionStorage.setItem('rtp_line_verifier', verifier);
    const url =
      'https://access.line.me/oauth2/v2.1/authorize' +
      '?response_type=code' +
      '&client_id=' + encodeURIComponent(CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(window.location.origin + '/line') +
      '&state=' + encodeURIComponent(state) +
      '&scope=openid%20profile' +
      '&code_challenge=' + encodeURIComponent(challenge) +
      '&code_challenge_method=S256';
    window.location.assign(url);
  };

  const disconnect = () => {
    store.set(null);
    setProfile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.llTitle}</CardTitle>
        <CardDescription>{t.llSub}</CardDescription>
      </CardHeader>
      <CardContent>
        {profile ? (
          <div className="flex flex-wrap items-center gap-3">
            {profile.picture && (
              <img src={profile.picture} alt="" className="size-10 flex-none rounded-full" width={40} height={40} />
            )}
            <span className="min-w-0 flex-1 truncate text-[14px] font-bold">
              {t.llWelcome.replace('{name}', profile.name || profile.sub)}
            </span>
            <Button variant="outline" size="sm" onClick={disconnect}>
              <LogOut className="size-4" aria-hidden="true" />
              {t.llDisconnect}
            </Button>
          </div>
        ) : (
          <Button variant="gold" onClick={connect}>{t.llConnect}</Button>
        )}
      </CardContent>
    </Card>
  );
}
