/* Harvest Trend · รู้ทันราคา — 12-month season calendar: bar = seasonal price
   level, green = harvest months, gold = oversupply peak, clay ring = current month */
import type { Crop } from '@/lib/data';
import { monthName } from '@/lib/engine';
import type { Lang } from '@/lib/i18n';

interface Props {
  crop: Crop;
  lang: Lang;
  t: { seasonCellTitle: string; harvTag: string; peakTag: string; seasonNow: string; sLegH: string; sLegP: string; sLegV: string; sLegNow: string };
}

const MAX_F = 1.36;

export function SeasonCalendar({ crop, lang, t }: Props) {
  const now = new Date().getMonth() + 1;
  const inHarvest = (m: number) =>
    crop.harvest[0] <= crop.harvest[1]
      ? m >= crop.harvest[0] && m <= crop.harvest[1]
      : m >= crop.harvest[0] || m <= crop.harvest[1];
  const inPeak = (m: number) => crop.peak.includes(m);

  return (
    <div>
      <div className="grid grid-cols-12 gap-1">
        {crop.season.map((f, i) => {
          const m = i + 1;
          const h = Math.round((f / MAX_F) * 96);
          const isNow = m === now;
          return (
            <div key={m} className="flex flex-col items-center gap-1" title={t.seasonCellTitle.replace('{f}', f.toFixed(2))}>
              <div className="flex h-24 w-full items-end">
                <div
                  className={`w-full rounded-t-md ${
                    inPeak(m) ? 'bg-gold' : inHarvest(m) ? 'bg-leaf' : 'bg-moss/25'
                  } ${isNow ? 'ring-2 ring-clay ring-offset-1' : ''}`}
                  style={{ height: `${h}%` }}
                />
              </div>
              <span className={`text-[10.5px] font-semibold ${isNow ? 'text-clay' : 'text-moss'}`}>
                {monthName(lang, m)}
              </span>
              {(inPeak(m) || inHarvest(m)) && (
                <span className={`rounded-full px-1 text-[9px] font-bold ${inPeak(m) ? 'bg-gold text-paper' : 'bg-leaf text-paper'}`}>
                  {inPeak(m) ? t.peakTag : t.harvTag}
                </span>
              )}
              {isNow && <span className="rounded-full bg-clay px-1 text-[9px] font-bold text-paper">{t.seasonNow}</span>}
            </div>
          );
        })}
      </div>
      <ul className="mt-3 space-y-1 text-[12px] text-moss">
        <li className="flex items-center gap-2"><span className="size-3 rounded bg-leaf" aria-hidden="true" />{t.sLegH}</li>
        <li className="flex items-center gap-2"><span className="size-3 rounded bg-gold" aria-hidden="true" />{t.sLegP}</li>
        <li className="flex items-center gap-2"><span className="size-3 rounded bg-moss/25" aria-hidden="true" />{t.sLegV}</li>
        <li className="flex items-center gap-2"><span className="size-3 rounded ring-2 ring-clay" aria-hidden="true" />{t.sLegNow}</li>
      </ul>
    </div>
  );
}