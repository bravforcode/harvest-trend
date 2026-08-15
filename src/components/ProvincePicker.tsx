/* Harvest Trend · รู้ทันราคา — province dropdown: search + grouped list + GPS
   (compact select-style trigger, spring panel, stagger list) */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from 'motion/react';
import { Check, ChevronDown, LocateFixed, Search } from 'lucide-react';
import { PROVINCES, REGIONS, REGION_ORDER, provById, type RegionId } from '@/lib/data';
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

const listVar: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.015 } }
};
const itemVar: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0 }
};

export function ProvincePicker({ value, onChange }: Props) {
  const { lang, toast } = useApp();
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [gpsBusy, setGpsBusy] = useState(false);
  const gpsRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();
  const sel = provById(value) ?? PROVINCES[0];

  const panelT: Transition = reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

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

  const pick = (id: string) => { onChange(id); setOpen(false); };

  return (
    <section aria-label={t.aProvSearch} className="panel-paper p-4">
      <div ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen(x => !x)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-left transition-colors hover:border-gold hover:bg-gold-soft/40"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold leading-tight">{sel.th}</span>
            <span className="block truncate text-[11.5px] leading-tight text-moss">{sel.en}</span>
          </span>
          <ChevronDown className={`size-5 flex-none text-gold transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={panelT}
              className="mt-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-moss/60" aria-hidden="true" />
                  <Input
                    ref={searchRef}
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
                <p className="mt-3 rounded-xl bg-ground px-4 py-6 text-center text-sm text-moss">{t.provEmpty}</p>
              ) : (
                <motion.div
                  variants={listVar}
                  initial="hidden"
                  animate="show"
                  role="listbox"
                  aria-label={t.aProvSearch}
                  className="mt-3 max-h-[320px] space-y-3 overflow-y-auto pr-1"
                >
                  {REGION_ORDER.map(r => {
                    const list = byRegion.get(r)!;
                    if (!list.length) return null;
                    return (
                      <div key={r} role="group" aria-label={REGIONS[r][lang]}>
                        <h3 className="mb-1 text-[12px] font-bold uppercase tracking-[1.2px] text-moss">{REGIONS[r][lang]}</h3>
                        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                          {list.map(p => {
                            const selP = p.id === value;
                            return (
                              <motion.button
                                key={p.id}
                                variants={itemVar}
                                type="button"
                                role="option"
                                aria-selected={selP}
                                onClick={() => pick(p.id)}
                                className={`flex min-h-11 cursor-pointer items-center justify-between gap-1 rounded-xl border px-3 py-1.5 text-left transition-colors ${
                                  selP
                                    ? 'border-forest bg-forest text-paper'
                                    : 'border-line bg-paper text-ink hover:bg-gold-soft/60'
                                }`}
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-[14px] font-semibold leading-tight">{p.th}</span>
                                  <span className={`block truncate text-[10.5px] leading-tight ${selP ? 'text-paper/70' : 'text-moss'}`}>{p.en}</span>
                                </span>
                                {selP && <Check className="size-4 flex-none" aria-hidden="true" />}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
              <p className="mt-2.5 text-[12px] text-moss/80">{t.provCount.replace('{n}', String(PROVINCES.length))}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}