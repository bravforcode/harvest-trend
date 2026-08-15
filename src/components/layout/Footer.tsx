/* Harvest Trend · รู้ทันราคา — footer: SDG row, disclaimer, credit */
import { Link } from 'react-router-dom';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';

const SDGS = [
  { n: 1, color: '#E5243B', key: 'sdg1' },
  { n: 2, color: '#DDA63A', key: 'sdg2' },
  { n: 8, color: '#A21942', key: 'sdg8' },
  { n: 12, color: '#BF8B2E', key: 'sdg12' }
] as const;

export function Footer() {
  const { lang } = useApp();
  const t = T[lang];

  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 md:pb-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {SDGS.map(s => (
          <span key={s.n} className="flex items-center gap-1.5 text-[12.5px] text-moss">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill={s.color} />
              <text x="12" y="16.5" textAnchor="middle" fontFamily="Noto Sans Thai" fontSize="11" fontWeight="700" fill="#fff">{s.n}</text>
            </svg>
            SDG {s.n} · {t[s.key]}
          </span>
        ))}
        <Link to="/about" className="ml-auto text-[12.5px] font-semibold text-moss no-underline hover:text-forest">
          {t.nav4}
        </Link>
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-moss/80">{t.footDisc}</p>
      <p className="mt-1.5 text-[12px] font-semibold text-moss">{t.footCredit}</p>
      <span className="mt-2 inline-block text-[10px] text-moss/50" title="build v2 · 2026-08-16">v2</span>
    </footer>
  );
}