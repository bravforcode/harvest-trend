/* Harvest Trend · รู้ทันราคา — sell-timing card: 12 monthly season-factor bars
   (gold = supply-peak months, clay ring = current month) + best-price month.
   Factor values come from CROPS[i].season — no fabricated numbers. */
import { useApp } from '@/lib/app-context';
import { T, type Lang } from '@/lib/i18n';
import { cropById } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MONTHS: Record<Lang, string[]> = {
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

export function SellCalendar() {
  const { lang, crop: cropId } = useApp();
  const t = T[lang];
  const crop = cropById(cropId);
  if (!crop) return null;

  const now = new Date().getMonth() + 1;
  const maxF = Math.max(...crop.season, 1e-6);
  let best = 0;
  for (let i = 1; i < crop.season.length; i++) {
    if (crop.season[i] > crop.season[best]) best = i;
  }
  const inPeak = (m: number) => crop.peak.includes(m);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle>{t.sellTitle}</CardTitle>
          <span className="text-[11px] font-semibold text-moss/70">{t.sellAll}</span>
        </div>
        <CardDescription>{t.sellSub}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1">
          {crop.season.map((f, i) => {
            const m = i + 1;
            const isNow = m === now;
            return (
              <div key={m} className="flex flex-col items-center gap-1" title={`${MONTHS[lang][i]} · ${f.toFixed(2)}`}>
                <div className="flex h-20 w-full items-end">
                  <div
                    className={`w-full rounded-t-md ${inPeak(m) ? 'bg-gold' : 'bg-moss/25'} ${isNow ? 'ring-2 ring-clay ring-offset-1' : ''}`}
                    style={{ height: `${Math.round((f / maxF) * 100)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-semibold ${isNow ? 'text-clay' : 'text-moss'}`}>{MONTHS[lang][i]}</span>
                {isNow && <span className="rounded-full bg-clay px-1 text-[9px] font-bold text-paper">{t.sellNow}</span>}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[12.5px] font-semibold text-forest">
          {t.sellPeak}: <span className="text-gold">{MONTHS[lang][best]}</span>
        </p>
      </CardContent>
    </Card>
  );
}
