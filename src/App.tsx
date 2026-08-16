/* Harvest Trend · รู้ทันราคา — app shell: routes + layout */
import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { HomePage } from '@/pages/HomePage';
import { PriceChartPage } from '@/pages/PriceChartPage';
import { WatchPage } from '@/pages/WatchPage';
import { ReportPage } from '@/pages/ReportPage';
import { AboutPage } from '@/pages/AboutPage';
import { LinePage } from '@/pages/LinePage';

/* code-split: map page pulls in leaflet + react-leaflet (~47KB gzip) — loaded
   on demand; cost calc is light but shares the same on-demand slot */
const PriceMapPage = lazy(() => import('@/pages/PriceMapPage').then((m) => ({ default: m.PriceMapPage })));
const CostCalcPage = lazy(() => import('@/pages/CostCalcPage').then((m) => ({ default: m.CostCalcPage })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function SkipLink() {
  const { lang } = useApp();
  return (
    <a href="#main" className="skip-link">
      {T[lang].skip}
    </a>
  );
}

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <ScrollToTop />
      <Header />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4">
        <Suspense fallback={
          <div className="flex min-h-[40vh] items-center justify-center gap-2 py-16 text-moss" role="status">
            <span aria-hidden="true" className="inline-block size-4 animate-spin rounded-full border-2 border-moss/30 border-t-moss" />
            <span>กำลังโหลด…</span>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chart" element={<PriceChartPage />} />
            <Route path="/map" element={<PriceMapPage />} />
            <Route path="/cost" element={<CostCalcPage />} />
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/line" element={<LinePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}