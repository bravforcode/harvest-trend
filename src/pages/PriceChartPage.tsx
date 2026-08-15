/* Harvest Trend · รู้ทันราคา — price & trend: chart, stats, signals, season
   calendar, data table with CSV export */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Share2 } from 'lucide-react';
import { CROPS, GRADES, PROVINCES, REGIONS, REGION_ORDER, cropById, provById } from '@/lib/data';
import {
  CUR_WEEK, fmtVal, fmtValFor, monthName, shareText, signalsFor, weekToMonth
} from '@/lib/engine';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { LiveData } from '@/lib/live';
import { inWatch, toggleWatch } from '@/lib/storage';
import { LiveBadge } from '@/components/layout/LiveBadge';
import { PriceChart } from '@/components/PriceChart';
import { SignalList } from '@/components/SignalList';
import { SeasonCalendar } from '@/components/SeasonCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function PriceChartPage() {
  const { lang, prov, crop, grade, setProv, setCrop, setGrade, select, toast } = useApp();
  const t = T[lang];
  const [params] = useSearchParams();
  const [, force] = useState(0);

  /* deep-link support: /chart?p=rayong&c=durian */
  useEffect(() => {
    const p = params.get('p'), c = params.get('c');
    if (p && provById(p) && c && cropById(c)) select(p, c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const c = cropById(crop);
  const p = provById(prov);
  if (!c || !p) return null;

  const sg = signalsFor(crop, prov, grade);
  const last = sg.series.a[sg.series.a.length - 1];
  const first = sg.series.a[sg.series.a.length - 6];
  const chg5 = first > 0 ? ((last - first) / first) * 100 : 0;
  const min = Math.min(...sg.series.a);
  const max = Math.max(...sg.series.a);
  const avg = sg.series.a.reduce((s, v) => s + v, 0) / sg.series.a.length;
  const foreAvg = sg.series.f.reduce((s, v) => s + v, 0) / sg.series.f.length;
  const watched = inWatch(prov, crop);
  const live = LiveData.ok;

  const onShare = async () => {
    try { await navigator.clipboard.writeText(shareText({ lang, prov, crop, grade })); } catch { /* noop */ }
    toast(t.shareCopied);
  };

  const onWatch = () => {
    const res = toggleWatch(prov, crop);
    force(x => x + 1);
    toast(res === 'added' ? t.watchAdded : t.watchRemoved, res === 'added' ? 'ok' : 'err');
  };

  const onCsv = () => {
    const rows = [
      [t.tblWeek, t.tblMonth, t.tblPrice, t.tblType],
      ...sg.series.a.map((v, i) => [String(CUR_WEEK - 25 + i), monthName(lang, weekToMonth(CUR_WEEK - 25 + i)), fmtValFor(v, crop), t.tblHist]),
      ...sg.series.f.map((v, i) => [String(CUR_WEEK + 1 + i), monthName(lang, weekToMonth(CUR_WEEK + 1 + i)), fmtValFor(v, crop), t.tblFore])
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `harvest-${c.id}-${p.id}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(t.csvDone);
  };

  const stats = [
    { k: t.statChg5, v: (chg5 >= 0 ? '+' : '') + chg5.toFixed(1) + '%', cls: chg5 >= 0 ? 'text-leaf' : 'text-clay' },
    { k: t.statMin, v: fmtVal(min, c) },
    { k: t.statMax, v: fmtVal(max, c) },
    { k: t.statAvg, v: fmtVal(avg, c) },
    { k: t.statFore, v: fmtVal(foreAvg, c) }
  ];

  return (
    <div className="space-y-6 py-6">
      {/* quick selects */}
      <section className="grid gap-3 sm:grid-cols-3" aria-label={t.aQcProv}>
        <label className="block">
          <span className="mb-1 block text-[12.5px] font-bold text-moss">{t.fProv}</span>
          <select
            value={prov}
            onChange={e => setProv(e.target.value)}
            className="h-12 w-full cursor-pointer rounded-xl border border-line bg-paper px-3 text-[14px] font-semibold"
          >
            {REGION_ORDER.map(rg => (
              <optgroup key={rg} label={REGIONS[rg][lang]}>
                {PROVINCES.filter(x => x.rg === rg).map(x => (
                  <option key={x.id} value={x.id}>{x.th}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[12.5px] font-bold text-moss">{t.fCrop}</span>
          <select
            value={crop}
            onChange={e => setCrop(e.target.value)}
            className="h-12 w-full cursor-pointer rounded-xl border border-line bg-paper px-3 text-[14px] font-semibold"
          >
            {CROPS.map(x => (
              <option key={x.id} value={x.id}>{x.th}</option>
            ))}
          </select>
        </label>
        {c.grades ? (
          <label className="block">
            <span className="mb-1 block text-[12.5px] font-bold text-moss">{t.aGrade}</span>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="h-12 w-full cursor-pointer rounded-xl border border-line bg-paper px-3 text-[14px] font-semibold"
            >
              {Object.keys(GRADES).map(g => (
                <option key={g} value={g}>เกรด {g}</option>
              ))}
            </select>
          </label>
        ) : <div />}
      </section>

      <LiveBadge />

      {/* chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>{t.priceTitleTpl.replace('{crop}', c[lang]).replace('{prov}', p[lang])}</CardTitle>
              <CardDescription className="mt-1">
                {(live ? t.livePriceSubTpl : t.priceSubTpl).replace('{crop}', c[lang])}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="size-4" aria-hidden="true" />
                {t.chartShare}
              </Button>
              <Button variant={watched ? 'soft' : 'outline'} size="sm" onClick={onWatch} aria-pressed={watched}>
                {watched ? t.chartFollowRemove : t.chartFollowAdd}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-moss">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 bg-forest" aria-hidden="true" />{t.legAct}</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 border-t-2 border-dashed border-gold" aria-hidden="true" />{t.legFore}</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-gold-soft" aria-hidden="true" />{t.legBand}</span>
          </div>
        </CardHeader>
        <CardContent>
          <PriceChart crop={c} series={sg.series} t={t} />
          <p className="mt-2 text-[12px] text-moss/80">{t.chartNote}</p>
        </CardContent>
      </Card>

      {/* stats */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map(s => (
          <div key={s.k} className="panel-paper p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[1px] text-moss">{s.k}</p>
            <p className={`tabular mt-0.5 text-lg font-extrabold ${s.cls || 'text-ink'}`}>{s.v}</p>
          </div>
        ))}
      </section>

      {/* signals */}
      <Card>
        <CardHeader>
          <CardTitle>{t.sigTitle}</CardTitle>
          <CardDescription>{t.sigSub}</CardDescription>
        </CardHeader>
        <CardContent>
          <SignalList sg={sg} t={t} />
        </CardContent>
      </Card>

      {/* season calendar */}
      <Card>
        <CardHeader>
          <CardTitle>{t.seasonTitle}</CardTitle>
          <CardDescription>{t.seasonSub}</CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonCalendar crop={c} lang={lang} t={t} />
        </CardContent>
      </Card>

      {/* table */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{t.tblTitle}</CardTitle>
            <Button variant="outline" size="sm" onClick={onCsv}>
              <Download className="size-4" aria-hidden="true" />
              {t.tblExport}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-line">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-ground text-left">
                <tr>
                  <th className="px-3 py-2 font-bold">{t.tblWeek}</th>
                  <th className="px-3 py-2 font-bold">{t.tblMonth}</th>
                  <th className="px-3 py-2 text-right font-bold">{t.tblPrice}</th>
                  <th className="px-3 py-2 font-bold">{t.tblType}</th>
                </tr>
              </thead>
              <tbody>
                {sg.series.a.map((v, i) => (
                  <tr key={'a' + i} className="border-t border-line">
                    <td className="px-3 py-1.5">{CUR_WEEK - 25 + i}</td>
                    <td className="px-3 py-1.5">{monthName(lang, weekToMonth(CUR_WEEK - 25 + i))}</td>
                    <td className="tabular px-3 py-1.5 text-right font-semibold">{fmtValFor(v, crop)}</td>
                    <td className="px-3 py-1.5 text-moss">{t.tblHist}</td>
                  </tr>
                ))}
                {sg.series.f.map((v, i) => (
                  <tr key={'f' + i} className="border-t border-line bg-gold-soft/40">
                    <td className="px-3 py-1.5">{CUR_WEEK + 1 + i}</td>
                    <td className="px-3 py-1.5">{monthName(lang, weekToMonth(CUR_WEEK + 1 + i))}</td>
                    <td className="tabular px-3 py-1.5 text-right font-semibold">{fmtValFor(v, crop)}</td>
                    <td className="px-3 py-1.5 text-moss">{t.tblFore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}