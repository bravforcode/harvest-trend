/* Harvest Trend · รู้ทันราคา — about: story, sources, SDG alignment */
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { rich } from '@/lib/rich';
import { Card, CardContent } from '@/components/ui/card';

const SDGS = [
  { n: 1, color: '#E5243B', key: 'sdg1' as const },
  { n: 2, color: '#DDA63A', key: 'sdg2' as const },
  { n: 8, color: '#A21942', key: 'sdg8' as const },
  { n: 12, color: '#BF8B2E', key: 'sdg12' as const }
];

const SOURCES = [
  { name: 'data.go.th — สำนักงานจังหวัด (Trat / Amnat Charoen / Mae Hong Son / Surat Thani)', url: 'https://data.go.th' },
  { name: 'สำนักงานเศรษฐกิจการเกษตร (OAE)', url: 'https://www.oae.go.th' },
  { name: 'ธนาคารแห่งประเทศไทย (BOT)', url: 'https://www.bot.or.th' },
  { name: 'EEC-SDG Hackathon & Pitching 2026 · Track 5 Smart Agriculture & Food Security', url: '' }
];

export function AboutPage() {
  const { lang } = useApp();
  const t = T[lang];

  return (
    <div className="space-y-6 py-6">
      <section>
        <h1 className="font-display text-2xl font-extrabold">{t.aboutTitle}</h1>
      </section>

      <Card>
        <CardContent className="space-y-4 p-5 text-[14.5px] leading-relaxed">
          <p>{rich(t.p1)}</p>
          <p>{rich(t.p2)}</p>
          <p>{rich(t.p3)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-display text-base font-bold">{t.srcTitle}</h2>
          <ul className="mt-2 space-y-1.5">
            {SOURCES.map(s => (
              <li key={s.name} className="text-[13.5px]">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky underline decoration-sky/40 underline-offset-2 hover:text-forest">
                    {s.name}
                  </a>
                ) : (
                  <span className="text-moss">{s.name}</span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-display text-base font-bold">SDGs</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {SDGS.map(s => (
              <span key={s.n} className="flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] font-semibold text-moss">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" fill={s.color} />
                  <text x="12" y="16.5" textAnchor="middle" fontFamily="Noto Sans Thai" fontSize="11" fontWeight="700" fill="#fff">{s.n}</text>
                </svg>
                SDG {s.n} · {t[s.key]}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}