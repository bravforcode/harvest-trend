/* Harvest Trend · รู้ทันราคา — watchlist + compare (up to 3 side by side) */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { cropById, provById } from '@/lib/data';
import { REC_KEY, fmtVal, recommend, signalsFor } from '@/lib/engine';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { getWatch, setWatch } from '@/lib/storage';
import { ThresholdPanel } from '@/components/ThresholdPanel';
import { VerdictCard } from '@/components/VerdictCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const REC_BADGE: Record<string, 'clay' | 'gold' | 'leaf'> = { sell: 'clay', wait: 'gold', recover: 'leaf' };

function Spark({ cropId, provId }: { cropId: string; provId: string }) {
  const { lang } = useApp();
  const t = T[lang];
  const sg = signalsFor(cropId, provId);
  const pts = sg.series.a.slice(-8);
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const rng = hi - lo || 1;
  const d = pts.map((v, i) => `${(i * 100) / (pts.length - 1)},${30 - ((v - lo) / rng) * 26}`).join(' ');
  const up = pts[pts.length - 1] >= pts[0];
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-24" role="img" aria-label={t.tickerAria}>
      <polyline points={d} fill="none" stroke={up ? '#4A7A3D' : '#B6472E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WatchPage() {
  const { lang, toast } = useApp();
  const t = T[lang];
  const [list, setListState] = useState(getWatch());
  const [cmp, setCmp] = useState<string[]>([]);

  const refresh = () => setListState(getWatch());

  const remove = (p: string, c: string) => {
    setWatch(list.filter(x => !(x.p === p && x.c === c)));
    setCmp(x => x.filter(k => k !== p + '|' + c));
    refresh();
    toast(t.watchRemoved, 'err');
  };

  const toggleCmp = (p: string, c: string) => {
    const k = p + '|' + c;
    setCmp(cur => {
      if (cur.includes(k)) return cur.filter(x => x !== k);
      if (cur.length >= 3) { toast(t.cmpMaxMsg, 'err'); return cur; }
      return [...cur, k];
    });
  };

  return (
    <div className="space-y-6 py-6">
      <section>
        <h1 className="font-display text-2xl font-extrabold">{t.watchTitle}</h1>
        <p className="text-[13.5px] text-moss">{t.watchSub}</p>
      </section>

      {list.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-[14px] text-moss">{t.watchEmpty}</p>
            <Link to="/" className="mt-4 inline-block">
              <Button variant="gold">{t.watchEmptyGo}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-2.5">
          {list.map(({ p, c }) => {
            const prov = provById(p), crop = cropById(c);
            if (!prov || !crop) return null;
            const sg = signalsFor(p, c);
            const r = recommend(sg);
            const last = sg.series.a[sg.series.a.length - 1];
            const k = p + '|' + c;
            const inCmp = cmp.includes(k);
            return (
              <Card key={k}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => toggleCmp(p, c)}
                    aria-pressed={inCmp}
                    aria-label={t.cmpToggleAria}
                    className={`grid size-9 flex-none cursor-pointer place-items-center rounded-full border-2 text-sm font-extrabold transition-colors ${
                      inCmp ? 'border-gold bg-gold text-paper' : 'border-line bg-paper text-moss hover:border-gold'
                    }`}
                  >
                    {inCmp ? cmp.indexOf(k) + 1 : '+'}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[15px] font-bold leading-tight">
                      {prov[lang]} · {crop[lang]}
                    </p>
                    <p className="tabular text-lg font-extrabold text-forest">
                      {fmtVal(last, crop)} <span className="text-[12px] font-semibold text-moss">{crop.unit[lang]}</span>
                    </p>
                  </div>
                  <Spark cropId={c} provId={p} />
                  <Badge variant={REC_BADGE[r.rec]}>{t[REC_KEY[r.rec]]}</Badge>
                  <div className="flex gap-1.5">
                    <Link to={`/chart?p=${p}&c=${c}`}>
                      <Button variant="outline" size="sm">
                        {t.watchGoTo}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => remove(p, c)} aria-label={t.del}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {/* compare */}
      <Card>
        <CardHeader>
          <CardTitle>{t.cmpTitle}</CardTitle>
          <CardDescription>{t.cmpSub}</CardDescription>
        </CardHeader>
        <CardContent>
          {cmp.length < 2 ? (
            <p className="rounded-xl bg-ground px-4 py-6 text-center text-[13.5px] text-moss">{t.cmpEmpty}</p>
          ) : (
            <>
              <div className="mb-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setCmp([])}>{t.cmpClear}</Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {cmp.map(k => {
                  const [p, c] = k.split('|');
                  return <VerdictCard key={k} prov={p} crop={c} compact />;
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* threshold alerts */}
      <ThresholdPanel />

      <p className="text-[12.5px] text-moss/80">{t.watchLineNote}</p>
    </div>
  );
}