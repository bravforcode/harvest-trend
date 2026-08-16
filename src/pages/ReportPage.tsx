/* Harvest Trend · รู้ทันราคา — report the price you actually got (local, synced to Supabase when configured) */
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cropById, provById } from '@/lib/data';
import { CUR_WEEK, fmtVal, priceAt } from '@/lib/engine';
import { isSupabaseReady, submitPriceReport } from '@/lib/supabase';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { getReports, setReports, type ReportItem } from '@/lib/storage';
import { ProvincePicker } from '@/components/ProvincePicker';
import { CropChips } from '@/components/CropChips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const SHOW = 5;

export function ReportPage() {
  const { lang, prov, crop, toast } = useApp();
  const t = T[lang];
  const [rProv, setRProv] = useState(prov);
  const [rCrop, setRCrop] = useState(crop);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [reps, setReps] = useState(getReports());
  const [showAll, setShowAll] = useState(false);

  const c = cropById(rCrop);
  const est = c ? priceAt(rCrop, rProv, CUR_WEEK) : 0;

  const submit = async () => {
    const v = parseFloat(price);
    if (!(v > 0)) { toast(t.repBad, 'err'); return; }
    const item: ReportItem = {
      p: rProv, c: rCrop, price: String(v),
      date: new Date().toISOString(), note: note.trim()
    };
    const next = [item, ...getReports()];
    setReports(next);
    setReps(next);
    setPrice('');
    setNote('');
    /* sync to the shared network when Supabase is configured (env-gated);
       otherwise keep the local-only behavior and say so */
    if (isSupabaseReady) {
      const r = await submitPriceReport({
        crop: rCrop, province: rProv, price: v,
        unit: c ? c.unit.th : undefined, note: note.trim()
      });
      toast(r.ok ? t.repShared : t.repSyncFail, r.ok ? undefined : 'err');
    } else {
      toast(t.repSaved);
    }
  };

  const remove = (i: number) => {
    const next = reps.filter((_, x) => x !== i);
    setReports(next);
    setReps(next);
  };

  const visible = showAll ? reps : reps.slice(0, SHOW);

  return (
    <div className="space-y-6 py-6">
      <section>
        <h1 className="font-display text-2xl font-extrabold">{t.reportTitle}</h1>
        <p className="text-[13.5px] text-moss">{t.reportSub}</p>
      </section>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <Label className="mb-1.5 block">{t.fProv}</Label>
            <ProvincePicker value={rProv} onChange={setRProv} />
          </div>
          <div>
            <Label className="mb-1.5 block">{t.fCrop}</Label>
            <CropChips prov={rProv} value={rCrop} onChange={setRCrop} />
          </div>
          <div>
            <Label className="mb-1.5 block" htmlFor="rep-price">{t.fPrice}</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="rep-price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder={t.fPricePh}
                className="max-w-52"
              />
              {c && (
                <Button type="button" variant="outline" size="sm" onClick={() => setPrice(fmtVal(est, c))}>
                  {t.repQuick.replace('{p}', fmtVal(est, c))}
                </Button>
              )}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block" htmlFor="rep-note">{t.fNote}</Label>
            <Textarea id="rep-note" value={note} onChange={e => setNote(e.target.value)} placeholder={t.fNotePh} />
          </div>
          <Button variant="gold" onClick={submit}>{t.fSubmit}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.repListT}</CardTitle>
          <CardDescription>{t.repTip}</CardDescription>
        </CardHeader>
        <CardContent>
          {reps.length === 0 ? (
            <p className="rounded-xl bg-ground px-4 py-6 text-center text-[13.5px] text-moss">{t.repEmpty}</p>
          ) : (
            <>
              <ul className="space-y-2">
                {visible.map((r, i) => {
                  const p = provById(r.p), c = cropById(r.c);
                  const d = new Date(r.date);
                  return (
                    <li key={i} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold">
                          {p ? p[lang] : r.p} · {c ? c[lang] : r.c}
                        </p>
                        <p className="text-[12px] text-moss">
                          {d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB')}
                          {r.note ? ' · ' + r.note : ''}
                        </p>
                      </div>
                      <span className="tabular text-lg font-extrabold text-forest">{r.price}</span>
                      <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label={t.del}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
              {reps.length > SHOW && (
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowAll(x => !x)}>
                  {showAll ? t.repCollapse : t.repShowAll.replace('{n}', String(reps.length))}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}