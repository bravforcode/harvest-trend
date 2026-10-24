/* Harvest Trend · รู้ทันราคา — production cost & break-even calculator.
   Official cost per crop (cost-data.ts, sourced from data.go.th) vs the
   current price (live official when available, else seasonal estimate).
   Honest by design: crops without official data accept a user-entered cost;
   no fabricated numbers anywhere. */
import { useState } from 'react';
import { costFor } from '@/lib/cost-data';
import { cropById, provById } from '@/lib/data';
import { CUR_WEEK, fmtVal, priceAt } from '@/lib/engine';
import { LiveData } from '@/lib/live';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { CropChips } from '@/components/CropChips';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CostCalcPage() {
  const app = useApp();
  const lang = app.lang;
  const t = T[lang];
  const [crop, setCrop] = useState(app.crop);
  const [yieldStr, setYieldStr] = useState('');
  const [ownCost, setOwnCost] = useState('');
  const [useOwn, setUseOwn] = useState(false);

  const c = cropById(crop);
  const p = provById(app.prov);
  const official = costFor(crop);
  if (!c) return null;

  const live = LiveData.get(crop, app.prov);
  const current = live && live.price > 0 ? live.price : priceAt(crop, app.prov, CUR_WEEK);

  /* which cost to use: official (default) or user-entered */
  const needsOwn = !official || (official.perRai && useOwn);
  const costVal = needsOwn ? parseFloat(ownCost) : official ? official.value : NaN;
  const hasCost = isFinite(costVal) && costVal > 0;
  const yieldKg = parseFloat(yieldStr);
  const perRai = official ? official.perRai : true; /* assume rai for user input */

  /* break-even + margin */
  let breakEven: number | null = null;
  let profitPerRai: number | null = null;
  if (hasCost) {
    if (perRai) {
      if (isFinite(yieldKg) && yieldKg > 0) {
        breakEven = costVal / yieldKg;
        profitPerRai = current * yieldKg - costVal;
      }
    } else {
      breakEven = costVal;
    }
  }

  /* only auto-verdict when units are directly comparable */
  const unitsMatch = official !== null && !official.perRai && official.unit === c.unit[lang];
  const verdict =
    breakEven !== null && breakEven > 0 && (perRai || unitsMatch)
      ? current > breakEven ? 'profit' : current < breakEven ? 'loss' : 'even'
      : null;

  return (
    <div className="space-y-4 py-6">
      <section>
        <h1 className="font-display text-2xl font-extrabold">{t.costTitle}</h1>
        <p className="text-[13.5px] text-moss">{t.costSub}</p>
      </section>

      <div>
        <p className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t.mapCropLabel}</p>
        <CropChips prov={app.prov} value={crop} onChange={setCrop} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          {official ? (
            <div className="rounded-xl border border-line bg-ground p-4">
              <p className="text-[11px] font-bold uppercase tracking-[1px] text-moss">{t.costOfficial}</p>
              <p className="mt-1 text-2xl font-extrabold text-forest">
                {fmtVal(official.value, c)} <span className="text-sm font-semibold text-moss">{official.unit}</span>
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-moss">
                {t.costSource}:{' '}
                <a className="underline decoration-dotted" href={'https://data.go.th/dataset/' + official.srcId} target="_blank" rel="noreferrer">
                  {official.srcTitle}
                </a>
                {' · '}{official.prov} · ปี {official.year}
                {official.note ? ' · ' + official.note : ''}
              </p>
            </div>
          ) : (
            <p className="rounded-xl bg-ground px-4 py-4 text-[13.5px] leading-relaxed text-moss">{t.costNoData}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {perRai && (
              <div>
                <Label className="mb-1.5 block" htmlFor="cost-yield">{t.costYield}</Label>
                <Input id="cost-yield" type="number" inputMode="decimal" min="0" step="0.01"
                  value={yieldStr} onChange={e => setYieldStr(e.target.value)}
                  placeholder={t.costYieldPh} className="max-w-56" />
              </div>
            )}
            {needsOwn ? (
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Label className="block" htmlFor="cost-own">{t.costYourCost}</Label>
                  {official && official.perRai && (
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-semibold text-moss">
                      <input type="checkbox" checked={useOwn} onChange={e => setUseOwn(e.target.checked)} className="size-4 accent-gold" />
                      {t.costYourCost}
                    </label>
                  )}
                </div>
                <Input id="cost-own" type="number" inputMode="decimal" min="0" step="0.01"
                  value={ownCost} onChange={e => setOwnCost(e.target.value)}
                  placeholder="เช่น 15,000" className="max-w-56" />
              </div>
            ) : (
              <p className="self-end pb-2 text-[12.5px] text-moss">
                {t.costBreakEven} = {t.costCost} ÷ {t.costYield}
              </p>
            )}
          </div>

          {breakEven !== null && breakEven > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-paper p-3">
                <p className="text-[11px] font-bold uppercase tracking-[1px] text-moss">{t.costBreakEven}</p>
                <p className="tabular text-lg font-extrabold text-ink">{fmtVal(breakEven, c)} <span className="text-[12px] font-semibold text-moss">{c.unit[lang]}</span></p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-3">
                <p className="text-[11px] font-bold uppercase tracking-[1px] text-moss">{t.costCurrent}</p>
                <p className="tabular text-lg font-extrabold text-ink">{fmtVal(current, c)} <span className="text-[12px] font-semibold text-moss">{c.unit[lang]}</span></p>
                <p className="text-[11px] font-semibold text-moss">{live && live.price > 0 ? t.lbLiveTitle : t.lbOffTitle}</p>
              </div>
              {verdict && (
                <div className={`rounded-xl border p-3 ${verdict === 'profit' ? 'border-leaf bg-leaf-tint' : verdict === 'loss' ? 'border-clay bg-clay-soft' : 'border-gold bg-gold-soft'}`}>
                  <p className="text-[11px] font-bold uppercase tracking-[1px] text-moss">
                    {verdict === 'profit' ? t.costProfit : verdict === 'loss' ? t.costLoss : t.costEven}
                  </p>
                  <p className={`tabular text-lg font-extrabold ${verdict === 'profit' ? 'text-forest' : verdict === 'loss' ? 'text-clay' : 'text-gold'}`}>
                    {verdict === 'profit' ? '+' : verdict === 'loss' ? '−' : '±'}
                    {fmtVal(Math.abs(current - breakEven), c)} {c.unit[lang]}
                  </p>
                </div>
              )}
            </div>
          )}

          {profitPerRai !== null && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-line bg-paper px-4 py-3">
              <span className="text-[13px] font-semibold text-moss">{p ? p.th : ''} · ต่อไร่:</span>
              <span className={`tabular text-lg font-extrabold ${profitPerRai >= 0 ? 'text-forest' : 'text-clay'}`}>
                {profitPerRai >= 0 ? '+' : '−'}{fmtVal(Math.abs(profitPerRai), c)} บาท/ไร่
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-[12px] leading-relaxed text-moss">{t.costCoverage}</p>
    </div>
  );
}