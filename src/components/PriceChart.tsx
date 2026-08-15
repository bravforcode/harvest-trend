/* Harvest Trend · รู้ทันราคา — SVG price chart (26w history + 4w forecast)
   Same geometry contract as the original: viewBox 1000×330, PL=56 PR=18 PT=24 PB=42 */
import { useMemo } from 'react';
import type { Crop } from '@/lib/data';
import type { Series } from '@/lib/engine';
import { CUR_WEEK, fmtVal } from '@/lib/engine';
import type { Dict } from '@/lib/i18n';

const W = 1000, H = 330, PL = 56, PR = 18, PT = 24, PB = 42;

interface Props {
  crop: Crop;
  series: Series;
  t: Dict;
}

export function PriceChart({ crop, series, t }: Props) {
  const { a, f } = series;
  const all = [...a, ...f];
  const lo = Math.min(...all), hi = Math.max(...all);
  const pad = (hi - lo) * 0.08 || 1;
  const min = lo - pad, max = hi + pad;
  const plotW = W - PL - PR, plotH = H - PT - PB;
  const N = a.length + f.length;
  const x = (i: number) => PL + (i * plotW) / (N - 1);
  const y = (v: number) => PT + ((max - v) / (max - min)) * plotH;

  const histPts = a.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const forePts = f.map((v, i) => `${x(a.length + i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const bandPts = useMemo(() => {
    const top = f.map((v, i) => `${x(a.length + i).toFixed(1)},${y(v * 1.03).toFixed(1)}`).join(' ');
    const bot = f.slice().reverse().map((v, i) => `${x(a.length + f.length - 1 - i).toFixed(1)},${y(v * 0.97).toFixed(1)}`).join(' ');
    return top + ' ' + bot;
  }, [f, a.length]);

  const grid = [0.25, 0.5, 0.75].map(p => {
    const v = max - (max - min) * p;
    return { v, yy: PT + plotH * p };
  });

  const weekLabels: Array<{ i: number; w: number }> = [];
  for (let i = 0; i < N; i += 5) weekLabels.push({ i, w: ((CUR_WEEK - 25 + i - 1) % 52) + 1 });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={t.chartAriaTpl.replace('{crop}', crop.th)}
    >
      {/* gridlines + y labels */}
      {grid.map(g => (
        <g key={g.yy}>
          <line x1={PL} x2={W - PR} y1={g.yy} y2={g.yy} stroke="#E4DFC9" strokeWidth="1" />
          <text x={PL - 8} y={g.yy + 4} textAnchor="end" fontSize="12" fill="#4A5A48">
            {fmtVal(g.v, crop)}
          </text>
        </g>
      ))}
      <text x={PL - 8} y={PT + 4} textAnchor="end" fontSize="12" fill="#4A5A48">
        {fmtVal(max, crop)}
      </text>
      <text x={PL - 8} y={H - PB + 4} textAnchor="end" fontSize="12" fill="#4A5A48">
        {fmtVal(min, crop)}
      </text>

      {/* forecast band */}
      <polygon points={bandPts} fill="#F5E8C8" opacity="0.55" />

      {/* today marker */}
      <line x1={x(a.length - 1)} x2={x(a.length - 1)} y1={PT} y2={H - PB} stroke="#B6472E" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={x(a.length - 1) + 4} y={PT + 12} fontSize="12" fontWeight="700" fill="#B6472E">
        {t.todayLbl}
      </text>

      {/* history + forecast lines */}
      <polyline points={histPts} fill="none" stroke="#2C4A24" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={forePts} fill="none" stroke="#A87B1F" strokeWidth="2.5" strokeDasharray="7 5" strokeLinejoin="round" strokeLinecap="round" />

      {/* week labels */}
      {weekLabels.map(({ i, w }) => (
        <text key={i} x={x(i)} y={H - PB + 18} textAnchor="middle" fontSize="11" fill="#4A5A48">
          {t.wk} {w}
        </text>
      ))}
    </svg>
  );
}