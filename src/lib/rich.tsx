/* Harvest Trend · รู้ทันราคา — minimal renderer for i18n strings with <b>/<code>/\n */
import { Fragment, type ReactNode } from 'react';

export function rich(s: string): ReactNode {
  const parts = s.split(/(<b>.*?<\/b>|<code>.*?<\/code>|\n)/g);
  return parts.map((p, i) => {
    if (p === '\n') return <br key={i} />;
    if (p.startsWith('<b>')) return <strong key={i}>{p.slice(3, -4)}</strong>;
    if (p.startsWith('<code>')) {
      return (
        <code key={i} className="rounded bg-ground px-1.5 py-0.5 font-mono text-[0.9em]">
          {p.slice(6, -7)}
        </code>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}