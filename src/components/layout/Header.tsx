/* Harvest Trend · รู้ทันราคา — sticky header: brand, language, font size, desktop nav */
import { Link, NavLink } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { BrandMark } from './BrandMark';

const NAV_LINKS = [
  { to: '/', key: 'nav1' },
  { to: '/chart', key: 'navPrice' },
  { to: '/map', key: 'navMap' },
  { to: '/cost', key: 'navCost' },
  { to: '/report', key: 'nav2' },
  { to: '/watch', key: 'nav3' },
  { to: '/about', key: 'nav4' },
  { to: '/line', key: 'lineNav' }
] as const;

export function Header() {
  const { lang, setLang, fontSize, setFontSize } = useApp();
  const t = T[lang];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ground/95 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2.5 no-underline text-ink" aria-label="Harvest Trend">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-forest shadow-[inset_0_0_0_1px_rgba(255,253,246,.14)]">
            <BrandMark size={24} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-extrabold tracking-[.2px]">Harvest Trend</span>
            <span className="block text-[10px] uppercase tracking-[1.6px] text-moss">รู้ทันราคา</span>
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-full border border-line bg-paper" role="group" aria-label={t.aFontSize}>
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center text-moss transition-colors hover:bg-gold-soft"
              aria-label={t.aFontDown}
              onClick={() => setFontSize(fontSize - 1)}
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center text-moss transition-colors hover:bg-gold-soft"
              aria-label={t.aFontUp}
              onClick={() => setFontSize(fontSize + 1)}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="flex overflow-hidden rounded-full border border-line bg-paper" role="group" aria-label="ภาษา / Language">
            <button
              type="button"
              className={`h-9 cursor-pointer px-3 text-xs font-semibold transition-colors ${lang === 'th' ? 'bg-forest text-paper' : 'text-moss hover:bg-gold-soft'}`}
              aria-pressed={lang === 'th'}
              onClick={() => setLang('th')}
            >
              ไทย
            </button>
            <button
              type="button"
              className={`h-9 cursor-pointer px-3 text-xs font-semibold transition-colors ${lang === 'en' ? 'bg-forest text-paper' : 'text-moss hover:bg-gold-soft'}`}
              aria-pressed={lang === 'en'}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
        </div>

        <nav className="hidden w-full items-center gap-1 md:flex" aria-label={t.aNav}>
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold no-underline transition-colors ${
                  isActive ? 'bg-forest text-paper' : 'text-moss hover:bg-gold-soft'
                }`
              }
            >
              {t[l.key]}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}