/* Harvest Trend · รู้ทันราคา — global app state (lang, font size, selection) */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCfg, persistCfg, pushRecent } from './storage';
import type { Lang } from './i18n';

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  fontSize: number;
  setFontSize: (px: number) => void;
  prov: string;
  crop: string;
  grade: string;
  setProv: (p: string) => void;
  setCrop: (c: string) => void;
  setGrade: (g: string) => void;
  select: (p: string, c: string) => void;
  toast: (msg: string, type?: 'ok' | 'err') => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const cfg = useMemo(() => getCfg(), []);
  const [lang, setLangState] = useState<Lang>(cfg.lang === 'en' ? 'en' : 'th');
  const [fontSize, setFontSizeState] = useState<number>(cfg.fontSize || 16);
  const [prov, setProvState] = useState<string>(cfg.prov || 'rayong');
  const [crop, setCropState] = useState<string>(cfg.crop || 'durian');
  const [grade, setGradeState] = useState<string>(cfg.grade || 'B');
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: string; key: number } | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'th'
      ? 'Harvest Trend · รู้ทันราคา | ตรวจราคาพืชผล 77 จังหวัด แนะนำจังหวะขาย'
      : 'Harvest Trend | Check crop prices across 77 provinces';
  }, [lang]);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + 'px';
    persistCfg({ fontSize });
  }, [fontSize]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    persistCfg({ lang: l });
  }, []);

  const setFontSize = useCallback((px: number) => {
    setFontSizeState(Math.max(13, Math.min(22, px)));
  }, []);

  const setProv = useCallback((p: string) => {
    setProvState(p);
    persistCfg({ prov: p });
  }, []);

  const setCrop = useCallback((c: string) => {
    setCropState(c);
    persistCfg({ crop: c });
  }, []);

  const setGrade = useCallback((g: string) => {
    setGradeState(g);
    persistCfg({ grade: g });
  }, []);

  const select = useCallback((p: string, c: string) => {
    setProvState(p);
    setCropState(c);
    persistCfg({ prov: p, crop: c });
    pushRecent(p, c);
  }, []);

  const toast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToastMsg({ msg, type, key: Date.now() });
  }, []);

  const value = useMemo<AppCtx>(() => ({
    lang, setLang, fontSize, setFontSize,
    prov, crop, grade, setProv, setCrop, setGrade, select, toast
  }), [lang, setLang, fontSize, setFontSize, prov, crop, grade, setProv, setCrop, setGrade, select, toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {toastMsg && (
        <div
          key={toastMsg.key}
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 bottom-24 z-[100] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lift transition-all duration-300 ${
            toastMsg.type === 'err' ? 'bg-clay text-paper' : 'bg-forest text-paper'
          }`}
        >
          {toastMsg.msg}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}