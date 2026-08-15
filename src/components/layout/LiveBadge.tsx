/* Harvest Trend · รู้ทันราคา — live/simulated data badge (polls /api/prices) */
import { useEffect, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { LiveData } from '@/lib/live';

export function LiveBadge() {
  const { lang } = useApp();
  const t = T[lang];
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force(x => x + 1);
    LiveData.onUpdate(fn);
    return () => {
      /* noop — singleton keeps the callback; page unmounts are rare */
    };
  }, []);

  const live = LiveData.ok;
  const fileMode = typeof location !== 'undefined' && location.protocol === 'file:';
  let title: string, meta: string;
  if (live) {
    title = t.lbLiveTitle;
    meta = t.lbLiveMeta.replace('{t}', new Date().toTimeString().slice(0, 8));
  } else if (fileMode) {
    title = t.lbFileTitle;
    meta = t.lbFileMeta;
  } else {
    title = t.lbOffTitle;
    meta = t.lbOffMeta;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mx-auto mt-3 flex w-fit max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] ${
        live
          ? 'border-leaf/40 bg-leaf-tint text-forest'
          : fileMode
            ? 'border-line bg-paper text-moss'
            : 'border-clay/40 bg-clay-soft text-clay'
      }`}
    >
      <span className={`size-2 flex-none rounded-full ${live ? 'bg-leaf' : fileMode ? 'bg-moss/50' : 'bg-clay'}`} aria-hidden="true" />
      <span className="font-semibold">{title}</span>
      <span className="opacity-75">{meta}</span>
    </div>
  );
}