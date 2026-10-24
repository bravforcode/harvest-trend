/* Harvest Trend · รู้ทันราคา — the verdict card: price, recommendation, 4 signals,
   voice reader, share, watchlist toggle. Used on Home (full) and Watch compare (compact). */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ChevronDown, Share2, Volume2, VolumeX } from 'lucide-react';
import { cropById, provById } from '@/lib/data';
import {
  BODY_KEY, CLOSE_KEY, MOM_KEY, REC_KEY, cap, fmtDate, fmtVal, recommend,
  shareText, signalsFor, verdictSpeech, type AppState
} from '@/lib/engine';
import { LiveData } from '@/lib/live';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { speakThai, speechSupported, stopSpeaking } from '@/lib/speech';
import { inWatch, toggleWatch } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  prov?: string;
  crop?: string;
  grade?: string;
  compact?: boolean;
}

const REC_BADGE: Record<string, 'clay' | 'gold' | 'leaf'> = { sell: 'clay', wait: 'gold', recover: 'leaf' };

export function VerdictCard({ prov, crop, grade, compact }: Props) {
  const app = useApp();
  const lang = app.lang;
  const t = T[lang];
  const state: AppState = {
    lang,
    prov: prov || app.prov,
    crop: crop || app.crop,
    grade: grade || app.grade
  };
  const c = cropById(state.crop);
  const p = provById(state.prov);
  const [showWhy, setShowWhy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [, force] = useState(0);

  if (!c || !p) return null;
  const sg = signalsFor(state.crop, state.prov, state.grade);
  const r = recommend(sg);
  const last = sg.series.a[sg.series.a.length - 1];
  const watched = inWatch(state.prov, state.crop);
  const live = LiveData.get(state.crop, state.prov);
  const priceTag = live && live.price > 0 ? t.lbLiveTitle : t.lbOffTitle;

  const onVoice = () => {
    if (!speechSupported()) { app.toast(t.voiceUnsupported, 'err'); return; }
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setSpeaking(true);
    speakThai(verdictSpeech(state));
    const done = () => { setSpeaking(false); };
    window.speechSynthesis.addEventListener('end', done, { once: true });
    window.speechSynthesis.addEventListener('error', done, { once: true });
  };

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText(state));
      app.toast(t.shareCopied);
    } catch { app.toast(t.shareCopied); }
  };

  const onWatch = () => {
    const res = toggleWatch(state.prov, state.crop);
    force(x => x + 1);
    app.toast(res === 'added' ? t.watchAdded : t.watchRemoved, res === 'added' ? 'ok' : 'err');
  };

  const signals: Array<{ name: string; val: string; why: string }> = [
    { name: t.sig1n, val: t[MOM_KEY[sg.momSt]] as string, why: t.s1why },
    { name: t.sig2n, val: t[('supply' + cap(sg.supSt)) as keyof typeof t] as string, why: t.s2why },
    {
      name: t.sig3n,
      val: sg.harvSt === 'all' ? t.harvestAll : sg.harvSt === 'yes' ? t.harvestYes : t.harvestNo,
      why: t.s3why
    },
    { name: t.sig4n, val: t[('weather' + cap(sg.wxSt)) as keyof typeof t] as string, why: t.s4why }
  ];

  return (
    <Card className={compact ? '' : 'overflow-hidden'}>
      <CardContent className={compact ? 'p-4' : 'p-5'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] font-bold uppercase tracking-[1.4px] text-moss">
            {t.recKicker} · {fmtDate(lang, new Date())}
          </p>
          <Badge variant={REC_BADGE[r.rec]} className="text-[13px]">
            {t[REC_KEY[r.rec]]}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
          <h3 className="font-display text-xl font-extrabold leading-tight">
            {p[lang]} · {c[lang]}
          </h3>
          <span className="tabular text-3xl font-extrabold leading-none text-forest">
            {fmtVal(last, c)}
          </span>
          <span className="pb-0.5 text-sm font-semibold text-moss">{c.unit[lang]}</span>
          <span className="pb-0.5 text-[11px] font-semibold text-moss">{priceTag}</span>
        </div>

        <p className="mt-1.5 text-[13px] text-moss">
          {t.confPrefix} <strong className="text-ink">{t[r.confKey]}</strong>
          {t.confSuffix}
        </p>

        <p className="mt-2 text-[14px] leading-relaxed">
          {t[BODY_KEY[r.rec]]} — {t[CLOSE_KEY[r.rec]]}
        </p>

        {!compact && (
          <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {signals.map(s => (
              <div key={s.name} className="rounded-xl bg-ground px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-[1px] text-moss">{s.name}</p>
                <p className="text-[13.5px] font-semibold">{s.val}</p>
              </div>
            ))}
          </div>
        )}

        {!compact && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowWhy(x => !x)}
              aria-expanded={showWhy}
              className="flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-moss hover:text-forest"
            >
              {t.recReasons}
              <ChevronDown className={`size-4 transition-transform ${showWhy ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {showWhy && (
              <ul className="mt-2 space-y-2">
                {signals.map(s => (
                  <li key={s.name} className="rounded-xl border border-line bg-paper px-3 py-2 text-[13px] leading-relaxed">
                    <strong>{s.name}:</strong> {s.val} — {s.why}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onVoice} aria-label={speaking ? t.voiceStop : t.voiceRead}>
            {speaking ? <VolumeX className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
            {speaking ? t.voiceStop : t.voiceRead}
          </Button>
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="size-4" aria-hidden="true" />
            {t.shareBtn}
          </Button>
          <Button variant={watched ? 'soft' : 'outline'} size="sm" onClick={onWatch} aria-pressed={watched}>
            {watched ? <BookmarkCheck className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
            {watched ? t.watchExists : t.watchAdd}
          </Button>
          {!compact && (
            <Link to="/chart" className="ml-auto">
              <Button variant="gold" size="sm">{t.viewChart}</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}