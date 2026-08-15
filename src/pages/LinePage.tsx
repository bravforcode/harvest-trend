/* Harvest Trend · รู้ทันราคา — LINE bot page: status, simulated chat demo,
   add-friend steps, commands, features, FAQ */
import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { CROPS, PROVINCES } from '@/lib/data';
import { fmtVal, signalsFor, recommend, verdictSpeech, REC_KEY } from '@/lib/engine';
import { useApp } from '@/lib/app-context';
import { T, type Lang } from '@/lib/i18n';
import { rich } from '@/lib/rich';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Msg { from: 'user' | 'bot'; text: string }

const CHIPS = ['ราคา ระยอง ทุเรียน', 'ราคา เกรด C', 'ช่วย', 'รายงาน'];

function findProv(q: string) {
  const s = q.toLowerCase();
  return PROVINCES.find(p => s.includes(p.th) || s.includes(p.en.toLowerCase())) || null;
}
function findCrop(q: string) {
  const s = q.toLowerCase();
  return CROPS.find(c => s.includes(c.th) || s.includes(c.en.toLowerCase())) || null;
}
function findGrade(q: string) {
  const m = q.match(/เกรด\s*([A-Da-d])|grade\s*([A-Da-d])/);
  const g = (m && (m[1] || m[2]))?.toUpperCase();
  return g && ['A', 'B', 'C', 'D'].includes(g) ? g : null;
}

export function LinePage() {
  const { lang } = useApp();
  const t = T[lang];
  const [status, setStatus] = useState<'check' | 'ok' | 'fail'>('check');
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: t.welcome }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('api/line-webhook', { method: 'GET' })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('fail'));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const botReply = (raw: string): string => {
    const q = raw.trim();
    const botLang: Lang = /[\u0E00-\u0E7F]/.test(q) ? 'th' : 'en';
    const bt = T[botLang];
    if (/^(ช่วย|help|commands|คำสั่ง)/i.test(q)) {
      return [bt.cmdTitle, bt.cmd1a, bt.cmd2a, bt.cmd3a, bt.cmd4a, bt.cmd5a].join('\n');
    }
    if (/^(รายงาน|report)/i.test(q)) {
      return bt.feat5 + ' · ' + bt.cmd4a;
    }
    const p = findProv(q), c = findCrop(q);
    if (p && c) {
      const g = findGrade(q) || 'B';
      const state = { lang: botLang, prov: p.id, crop: c.id, grade: g };
      const sg = signalsFor(c.id, p.id, g);
      const r = recommend(sg);
      const last = sg.series.a[sg.series.a.length - 1];
      return [
        `${p[botLang]} · ${c[botLang]} (${bt.aGrade} ${g})`,
        `${bt.recKicker}: ${bt[REC_KEY[r.rec]]}`,
        `${bt.fPrice}: ~${fmtVal(last, c)} ${c.unit[botLang]}`,
        verdictSpeech(state)
      ].join('\n');
    }
    return bt.welcome;
  };

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMsgs(m => [...m, { from: 'user', text: q }]);
    setInput('');
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', text: botReply(q) }]);
    }, 700);
  };

  const statusBadge =
    status === 'ok' ? <Badge variant="leaf">{t.lineStatusOk}</Badge>
    : status === 'fail' ? <Badge variant="clay">{t.lineStatusFail}</Badge>
    : <Badge variant="outline">{t.lineStatusCheck}</Badge>;

  return (
    <div className="space-y-6 py-6">
      <section className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">{t.lineTitle}</h1>
          <p className="text-[13.5px] text-moss">{t.lineSub}</p>
        </div>
        {statusBadge}
      </section>

      {/* demo chat */}
      <Card>
        <CardHeader>
          <CardTitle>{t.demoTitle}</CardTitle>
          <CardDescription>{t.demoSub}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 flex-col rounded-2xl border border-line bg-ground">
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed ${
                      m.from === 'user' ? 'rounded-br-sm bg-forest text-paper' : 'rounded-bl-sm bg-paper text-ink'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-paper px-3.5 py-2 text-[13px] text-moss">{t.typing}</div>
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-line bg-paper p-2">
              {CHIPS.map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => send(ch)}
                  className="cursor-pointer rounded-full border border-line bg-ground px-3 py-1 text-[12px] font-semibold text-moss hover:border-gold hover:text-ink"
                >
                  {ch}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-line bg-paper p-2"
              onSubmit={e => { e.preventDefault(); send(); }}
            >
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t.chatPh}
                aria-label={t.chatAria}
                className="h-11"
              />
              <Button type="submit" variant="gold" size="icon" aria-label={t.chatSend}>
                <Send className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* add friend */}
      <Card>
        <CardHeader>
          <CardTitle>{t.addTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-5">
            <div className="grid size-36 flex-none place-items-center rounded-2xl border-2 border-dashed border-line bg-ground text-center">
              <div>
                <p className="text-[11px] text-moss">{t.qrGen}</p>
                <p className="mt-1 text-[12px] font-bold text-moss">@441sptre</p>
              </div>
            </div>
            <ol className="min-w-0 flex-1 space-y-2 text-[13.5px] leading-relaxed">
              <li>{rich(t.step1)}</li>
              <li>{rich(t.step2)}</li>
              <li>{rich(t.step3)}</li>
            </ol>
          </div>
          <a href="https://line.me/R/ti/p/@441sptre" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
            <Button variant="gold">{t.addBtn}</Button>
          </a>
        </CardContent>
      </Card>

      {/* commands */}
      <Card>
        <CardHeader>
          <CardTitle>{t.cmdTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-[13px]">
              <thead className="bg-ground text-left">
                <tr>
                  <th className="px-3 py-2 font-bold">{t.cmdHead1}</th>
                  <th className="px-3 py-2 font-bold">{t.cmdHead2}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['ราคา ระยอง ทุเรียน', t.cmd1a],
                  ['ราคา ระยอง ทุเรียน เกรด C', t.cmd2a],
                  ['price rayong durian', t.cmd3a],
                  ['รายงาน ระยอง ทุเรียน 150', t.cmd4a],
                  ['ช่วย', t.cmd5a]
                ].map(([cmd, desc]) => (
                  <tr key={cmd} className="border-t border-line">
                    <td className="px-3 py-2 font-mono text-[12.5px] font-semibold text-forest">{cmd}</td>
                    <td className="px-3 py-2 text-moss">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[12.5px] text-moss/80">{t.cmdNote}</p>
        </CardContent>
      </Card>

      {/* features */}
      <Card>
        <CardHeader>
          <CardTitle>{t.featTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-[13.5px] leading-relaxed">
            {[t.feat1, t.feat2, t.feat3, t.feat4, t.feat5, t.feat6].map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 size-1.5 flex-none rounded-full bg-gold" aria-hidden="true" />
                <span>{rich(f)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>{t.faqTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-[13.5px] leading-relaxed">
            {[t.faq1, t.faq2, t.faq3].map((f, i) => (
              <li key={i} className="rounded-xl bg-ground px-4 py-3">{rich(f)}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}