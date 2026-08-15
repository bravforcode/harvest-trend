/* Harvest Trend · รู้ทันราคา — mobile bottom tab bar (thumb-friendly, app-like) */
import { NavLink } from 'react-router-dom';
import { Home, LineChart, Bookmark, ClipboardList, MessageCircle } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';

const TABS = [
  { to: '/', key: 'nav1', Icon: Home },
  { to: '/chart', key: 'navPrice', Icon: LineChart },
  { to: '/watch', key: 'nav3', Icon: Bookmark },
  { to: '/report', key: 'nav2', Icon: ClipboardList },
  { to: '/line', key: 'lineNav', Icon: MessageCircle }
] as const;

export function BottomNav() {
  const { lang } = useApp();
  const t = T[lang];

  return (
    <nav
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 backdrop-blur-sm md:hidden"
      aria-label={t.aNav}
    >
      <div className="grid grid-cols-5">
        {TABS.map(({ to, key, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline transition-colors ${
                isActive ? 'text-forest' : 'text-moss/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`size-5 ${isActive ? 'text-gold' : ''}`} strokeWidth={isActive ? 2.4 : 2} />
                <span className={`text-[10.5px] font-semibold ${isActive ? 'text-forest' : ''}`}>{t[key]}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}