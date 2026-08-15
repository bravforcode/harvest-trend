/* Harvest Trend · รู้ทันราคา — crop chips sorted by "main production area" first */
import { provById } from '@/lib/data';
import { sortedCrops } from '@/lib/engine';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';

interface Props {
  prov: string;
  value: string;
  onChange: (id: string) => void;
}

export function CropChips({ prov, value, onChange }: Props) {
  const { lang } = useApp();
  const t = T[lang];
  const p = provById(prov);
  if (!p) return null;
  const crops = sortedCrops(p);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t.aCrop}>
      {crops.map(c => {
        const sel = c.id === value;
        const main = p.main.includes(c.id) || p.main.includes('*');
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            aria-pressed={sel}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors ${
              sel
                ? 'border-gold bg-gold text-paper'
                : 'border-line bg-paper text-ink hover:bg-gold-soft/60'
            }`}
          >
            {c.th}
            {main && (
              <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${sel ? 'bg-paper/25 text-paper' : 'bg-gold-soft text-gold'}`}>
                {t.mainTag}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}