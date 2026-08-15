/* Harvest Trend · รู้ทันราคา — home: hero, recent history, province picker,
   crop chips, verdict card, how-it-works */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, History, X } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { cropById, provById } from '@/lib/data';
import { clearRecents, getRecents } from '@/lib/storage';
import { LiveBadge } from '@/components/layout/LiveBadge';
import { ProvincePicker } from '@/components/ProvincePicker';
import { CropChips } from '@/components/CropChips';
import { VerdictCard } from '@/components/VerdictCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function HomePage() {
  const { lang, prov, crop, setProv, setCrop, select } = useApp();
  const t = T[lang];
  const recents = getRecents();
  const [, force] = useState(0);

  const scrollToPicker = () => {
    document.getElementById('picker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6 py-6">
      {/* hero */}
      <section className="pt-4 text-center">
        <p className="text-[12.5px] font-bold uppercase tracking-[2px] text-gold">{t.heroEyebrow}</p>
        <h1 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          {t.heroTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-moss">{t.heroSub}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[13px] font-semibold text-moss">
          <span><strong className="text-forest">77</strong> {t.heroStat1}</span>
          <span><strong className="text-forest">10</strong> {t.heroStat2}</span>
          <span><strong className="text-forest">4</strong> {t.heroStat3}</span>
        </div>
        <Button variant="gold" size="lg" className="mt-5" onClick={scrollToPicker}>
          {t.heroCta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </section>

      <LiveBadge />

      {/* recent history (v2) */}
      {recents.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-display text-base font-bold">
                <History className="size-4 text-gold" aria-hidden="true" />
                {t.recentTitle}
              </h2>
              <button
                type="button"
                onClick={() => { clearRecents(); force(x => x + 1); }}
                className="flex cursor-pointer items-center gap-1 text-[12.5px] font-semibold text-moss hover:text-clay"
              >
                <X className="size-3.5" aria-hidden="true" />
                {t.recentClear}
              </button>
            </div>
            <p className="mt-0.5 text-[12.5px] text-moss">{t.recentSub}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {recents.map((r, i) => {
                const p = provById(r.p), c = cropById(r.c);
                if (!p || !c) return null;
                return (
                  <button
                    key={r.p + r.c + i}
                    type="button"
                    onClick={() => select(r.p, r.c)}
                    className="cursor-pointer rounded-full border border-line bg-ground px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-gold hover:bg-gold-soft/60"
                  >
                    {p[lang]} · {c[lang]}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* picker */}
      <div id="picker" className="scroll-mt-24 space-y-5">
        <div>
          <h2 className="font-display text-lg font-bold">{t.pickTitle}</h2>
          <p className="text-[13px] text-moss">{t.pickSub}</p>
        </div>
        <ProvincePicker value={prov} onChange={setProv} />
        <div>
          <h2 className="font-display text-lg font-bold">{t.cropTitle}</h2>
          <p className="mb-3 text-[13px] text-moss">{t.cropSub}</p>
          <CropChips prov={prov} value={crop} onChange={setCrop} />
        </div>
      </div>

      {/* verdict */}
      <VerdictCard />

      {/* how it works */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[t.how1, t.how2, t.how3].map((s, i) => (
          <div key={s} className="panel-paper flex items-center gap-3 p-4">
            <span className="grid size-9 flex-none place-items-center rounded-full bg-gold-soft font-display text-sm font-extrabold text-gold">
              {i + 1}
            </span>
            <p className="text-[14px] font-semibold leading-snug">{s}</p>
          </div>
        ))}
      </section>

      {/* quick links */}
      <section className="flex flex-wrap gap-2">
        <Link to="/chart"><Button variant="outline">{t.viewChart}</Button></Link>
        <Link to="/report"><Button variant="outline">{t.scrollReport}</Button></Link>
      </section>
    </div>
  );
}