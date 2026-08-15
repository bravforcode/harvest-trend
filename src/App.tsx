/* Harvest Trend · รู้ทันราคา — app shell: routes + layout */
import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { HomePage } from '@/pages/HomePage';
import { PriceChartPage } from '@/pages/PriceChartPage';
import { PriceMapPage } from '@/pages/PriceMapPage';
import { CostCalcPage } from '@/pages/CostCalcPage';
import { WatchPage } from '@/pages/WatchPage';
import { ReportPage } from '@/pages/ReportPage';
import { AboutPage } from '@/pages/AboutPage';
import { LinePage } from '@/pages/LinePage';

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
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}