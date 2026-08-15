/* Harvest Trend · รู้ทันราคา — big province picker: search + grouped grid + GPS */
import { useMemo, useRef, useState } from 'react';
import { LocateFixed, Search } from 'lucide-react';
import { PROVINCES, REGIONS, REGION_ORDER, type RegionId } from '@/lib/data';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  onChange: (id: string) => void;
}

function nearestProvince(lat: number, lng: number): string {
  let best = PROVINCES[0].id, bestD = Infinity;
  for (const p of PROVINCES) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) { bestD = d; best = p.id; }
  }
  return best;
}

export function ProvincePicker({ value, onChange }: Props) {
  const { lang, toast } = useApp();
  const t = T[lang];
  const [q, setQ] = useState('');
  const [gpsBusy, setGpsBusy] = useState(false);
  const gpsRef = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PROVINCES;
    return PROVINCES.filter(p => p.th.includes(s) || p.en.toLowerCase().includes(s));
  }, [q]);

  const byRegion = useMemo(() => {
    const m = new Map<RegionId, typeof PROVINCES>();
    REGION_ORDER.forEach(r => m.set(r, []));
    filtered.forEach(p => m.get(p.rg)!.push(p));
    return m;
  }, [filtered]);

  const gps = () => {
    if (!('geolocation' in navigator)) { toast(t.gpsFail, 'err'); return; }
    setGpsBusy(true);
    gpsRef.current = window.setTimeout(() => { setGpsBusy(false); toast(t.gpsNoFix, 'err'); }, 12000);
    navigator.geolocation.getCurrentPosition(
      pos => {
        if (gpsRef.current) clearTimeout(gpsRef.current);
        setGpsBusy(false);
        onChange(nearestProvince(pos.coords.latitude, pos.coords.longitude));
      },
      err => {
        if (gpsRef.current) clearTimeout(gpsRef.current);
        setGpsBusy(false);
        const inApp = /LINE|FBAN|FBAV|Instagram/i.test(navigator.userAgent);
        if (err.code === err.PERMISSION_DENIED) toast(inApp ? t.gpsDeniedInApp : t.gpsDenied, 'err');
        else if (err.code === err.POSITION_UNAVAILABLE || err.code === err.TIMEOUT) toast(t.gpsNoFix, 'err');
        else toast(t.gpsFail, 'err');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <section aria-label={t.aProvSearch} className="panel-paper p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-moss/60" aria-hidden="true" />
          <Input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t.searchPh}
            aria-label={t.aProvSearch}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={gps} disabled={gpsBusy} aria-label={t.gpsBtn}>
          <LocateFixed className="size-4" aria-hidden="true" />
          {gpsBusy ? t.gpsBusy : t.gpsBtn}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-xl bg-ground px-4 py-6 text-center text-sm text-moss">{t.provEmpty}</p>
      ) : (
        <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
          {REGION_ORDER.map(r => {
            const list = byRegion.get(r)!;
            if (!list.length) return null;
            return (
              <div key={r}>
                <h3 className="mb-1.5 text-[12px] font-bold uppercase tracking-[1.2px] text-moss">{REGIONS[r][lang]}</h3>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                  {list.map(p => {
                    const sel = p.id === value;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onChange(p.id)}
                        aria-pressed={sel}
                        className={`flex min-h-11 cursor-pointer flex-col items-start justify-center rounded-xl border px-3 py-1.5 text-left transition-colors ${
                          sel
                            ? 'border-forest bg-forest text-paper'
                            : 'border-line bg-paper text-ink hover:bg-gold-soft/60'
                        }`}
                      >
                        <span className="text-[14px] font-semibold leading-tight">{p.th}</span>
                        <span className={`text-[10.5px] leading-tight ${sel ? 'text-paper/70' : 'text-moss'}`}>{p.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-[12px] text-moss/80">{t.provCount.replace('{n}', String(PROVINCES.length))}</p>
    </section>
  );
}