/* Harvest Trend · รู้ทันราคา — crop dropdown: main-area crops first, key-area badge */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { cropById, provById } from '@/lib/data';
import { sortedCrops } from '@/lib/engine';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';

interface Props {
  prov: string;
  value: string;
  onChange: (id: string) => void;
}

const listVar: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.02 } }
};
const itemVar: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0 }
};

export function CropChips({ prov, value, onChange }: Props) {
  const { lang } = useApp();
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const p = provById(prov);
  const sel = cropById(value);

  const panelT: Transition = reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!p || !sel) return null;
  const crops = sortedCrops(p);
  const selMain = p.main.includes(sel.id) || p.main.includes('*');

  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(x => !x)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t.aCrop}
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-line bg-paper px-4 py-3 text-left transition-colors hover:border-gold hover:bg-gold-soft/40"
      >
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{sel.th}</span>
        {selMain && (
          <span className="flex-none rounded-full bg-gold-soft px-2 py-px text-[10.5px] font-bold text-gold">{t.mainTag}</span>
        )}
        <ChevronDown className={`size-5 flex-none text-gold transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={panelT}
            className="mt-2"
          >
            <motion.ul
              variants={listVar}
              initial="hidden"
              animate="show"
              role="listbox"
              aria-label={t.aCrop}
              className="max-h-[320px] space-y-1 overflow-y-auto rounded-xl border border-line bg-paper p-1.5"
            >
              {crops.map(c => {
                const selC = c.id === value;
                const main = p.main.includes(c.id) || p.main.includes('*');
                return (
                  <motion.li key={c.id} variants={itemVar}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selC}
                      onClick={() => { onChange(c.id); setOpen(false); }}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                        selC ? 'bg-forest text-paper' : 'text-ink hover:bg-gold-soft/60'
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{c.th}</span>
                      {main && (
                        <span className={`flex-none rounded-full px-1.5 py-px text-[10px] font-bold ${selC ? 'bg-paper/25 text-paper' : 'bg-gold-soft text-gold'}`}>
                          {t.mainTag}
                        </span>
                      )}
                      {selC && <Check className="size-4 flex-none" aria-hidden="true" />}
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}