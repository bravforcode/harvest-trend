/* Harvest Trend · รู้ทันราคา — 4-signal list with expandable "why" (chart page) */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MOM_KEY, cap, type Signals } from '@/lib/engine';
import type { Dict } from '@/lib/i18n';

interface Props {
  sg: Signals;
  t: Dict;
}

export function SignalList({ sg, t }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const rows = [
    { name: t.s1name, val: t[MOM_KEY[sg.momSt]], why: t.s1why },
    { name: t.s2name, val: t[('supply' + cap(sg.supSt)) as keyof typeof t], why: t.s2why },
    {
      name: t.s3name,
      val: sg.harvSt === 'all' ? t.harvestAll : sg.harvSt === 'yes' ? t.harvestYes : t.harvestNo,
      why: t.s3why
    },
    { name: t.s4name, val: t[('weather' + cap(sg.wxSt)) as keyof typeof t], why: t.s4why }
  ];

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r.name} className="rounded-xl border border-line bg-paper">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 text-left"
          >
            <span className="text-[14px] font-semibold">{r.name}</span>
            <span className="flex items-center gap-2">
              <span className="text-[13px] text-moss">{r.val}</span>
              <ChevronDown className={`size-4 text-moss transition-transform ${open === i ? 'rotate-180' : ''}`} aria-hidden="true" />
            </span>
          </button>
          {open === i && <p className="border-t border-line px-4 py-3 text-[13px] leading-relaxed text-moss">{r.why}</p>}
        </div>
      ))}
    </div>
  );
}