/* Harvest Trend · รู้ทันราคา — in-app price threshold alerts.
   Each row compares the live (or model-estimated) price against the user's
   target; hits are highlighted in gold-soft/clay. Re-renders on a 10s tick
   like PriceMapPage so alerts update as LiveData refreshes. */
import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cropById, provById } from '@/lib/data';
import { CUR_WEEK, fmtVal, priceAt } from '@/lib/engine';
import { LiveData } from '@/lib/live';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { addThreshold, getThresholds, removeThreshold } from '@/lib/thresholds';
import type { Threshold } from '@/lib/thresholds';
import type { Crop } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Row {
  x: Threshold;
  c: Crop;
  current: number;
  hit: boolean;
}

export function ThresholdPanel() {
  const app = useApp();
  const t = T[app.lang];
  const [list, setList] = useState<Threshold[]>(getThresholds());
  const [priceStr, setPriceStr] = useState('');
  const [tick, setTick] = useState(0);

  /* re-render when live prices refresh (LiveData polls every 10s) */
  useEffect(() => {
    const id = window.setInterval(() => setTick(x => x + 1), 10000);
    return () => window.clearInterval(id);
  }, []);

  const crop = cropById(app.crop);
  const prov = provById(app.prov);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const x of list) {
      const c = cropById(x.c);
      if (!c) continue;
      const live = LiveData.get(x.c, x.p);
      const current = live && live.price > 0 ? live.price : priceAt(x.c, x.p, CUR_WEEK);
      out.push({ x, c, current, hit: current >= x.price });
    }
    return out;
  }, [list, tick]);

  const set = () => {
    const price = parseFloat(priceStr);
    if (!crop || !prov || !isFinite(price) || price <= 0) {
      app.toast(t.repBad, 'err');
      return;
    }
    const next = addThreshold(prov.id, crop.id, price);
    setList(next);
    setPriceStr('');
    app.toast(t.thrSet);
  };

  const remove = (p: string, c: string) => {
    setList(removeThreshold(p, c));
    app.toast(t.thrRemove);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.thrTitle}</CardTitle>
        <CardDescription>{t.thrSub}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={e => { e.preventDefault(); set(); }}
        >
          <div className="min-w-0 flex-1">
            <Label htmlFor="thr-price" className="mb-1.5 block">
              {prov ? prov[app.lang] : app.prov} · {crop ? crop[app.lang] : app.crop}
            </Label>
            <Input
              id="thr-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={priceStr}
              onChange={e => setPriceStr(e.target.value)}
              placeholder={t.thrPh}
            />
          </div>
          <Button type="submit" variant="gold">{t.thrSet}</Button>
        </form>

        {rows.length === 0 ? (
          <p className="rounded-xl bg-ground px-4 py-5 text-center text-[13.5px] text-moss">{t.thrNone}</p>
        ) : (
          <ul className="space-y-2">
            {rows.map(r => (
              <li
                key={r.x.p + '|' + r.x.c}
                className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                  r.hit ? 'border-gold bg-gold-soft' : 'border-line bg-ground'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] font-bold ${r.hit ? 'text-clay' : 'text-ink'}`}>
                    {(r.hit ? t.thrHit : t.thrActive)
                      .replace('{crop}', r.c[app.lang])
                      .replace('{price}', fmtVal(r.x.price, r.c))}
                  </p>
                  <p className="text-[12.5px] text-moss">
                    {t.thrCurrent.replace('{price}', fmtVal(r.current, r.c) + ' ' + r.c.unit[app.lang])}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(r.x.p, r.x.c)}
                  aria-label={t.thrRemove}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  {t.thrRemove}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
