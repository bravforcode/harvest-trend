/* Harvest Trend · รู้ทันราคา — Thailand price choropleth (react-leaflet v5,
   offline GeoJSON bundled via Vite; no basemap tiles). Colors provinces by
   the selected crop's price: live official price when available, otherwise
   the seasonal model estimate — each province's tooltip states which. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import thaiGeo from '@/data/thailand-adm1.json';
import { PROVINCES, provById, cropById } from '@/lib/data';
import { CUR_WEEK, fmtVal, priceAt } from '@/lib/engine';
import { LiveData } from '@/lib/live';
import { isSupabaseReady, fetchRecentReports, type PriceReport } from '@/lib/supabase';
import { useApp } from '@/lib/app-context';
import { T } from '@/lib/i18n';
import { CropChips } from '@/components/CropChips';
import { Card, CardContent } from '@/components/ui/card';

/* warm orchard ledger scale, low → high (gold-soft → forest) */
const SCALE = ['#F5E8C8', '#E8D5A0', '#C9A24B', '#8A7A2E', '#2C4A24'];
const BUCKETS = 5;

interface ProvValue { id: string; v: number; live: boolean; }

function thaiNameToProvId(): Map<string, string> {
  const m = new Map<string, string>();
  PROVINCES.forEach(p => m.set(p.th, p.id));
  return m;
}

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(L.latLngBounds([[5.6, 97.3], [20.5, 105.7]]));
  }, [map]);
  return null;
}

export function PriceMapPage() {
  const app = useApp();
  const lang = app.lang;
  const t = T[lang];
  const nav = useNavigate();
  const [crop, setCrop] = useState(app.crop);
  const [tick, setTick] = useState(0);
  const [mode, setMode] = useState<'gov' | 'farmers'>('gov');
  const [reports, setReports] = useState<PriceReport[] | null>(null);

  /* re-render when live prices refresh (LiveData polls every 10s) */
  useEffect(() => {
    const id = window.setInterval(() => setTick(x => x + 1), 10000);
    return () => window.clearInterval(id);
  }, []);

  /* farmer reports (supabase, env-gated): fetch once per crop + mode */
  useEffect(() => {
    if (mode !== 'farmers' || !isSupabaseReady) { setReports(null); return; }
    let on = true;
    fetchRecentReports(crop, undefined, 100).then(rows => { if (on) setReports(rows); });
    return () => { on = false; };
  }, [mode, crop]);

  const c = cropById(crop);
  const nameToId = useMemo(thaiNameToProvId, []);

  const values: ProvValue[] = useMemo(() => {
    if (!c) return [];
    return PROVINCES.map(p => {
      const live = LiveData.get(crop, p.id);
      const v = live && live.price > 0 ? live.price : priceAt(crop, p.id, CUR_WEEK);
      return { id: p.id, v, live: !!live };
    });
  }, [crop, c, tick]);

  /* fresh snapshot for leaflet event handlers (leaflet keeps the first closure) */
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const { min, max, colorOf } = useMemo(() => {
    if (!c) return { min: 0, max: 0, colorOf: () => SCALE[0] };
    let lo = Infinity, hi = -Infinity;
    for (const x of values) { if (x.v < lo) lo = x.v; if (x.v > hi) hi = x.v; }
    if (!(hi > lo)) return { min: lo, max: hi, colorOf: () => SCALE[2] };
    const span = hi - lo;
    const colorOf = (v: number) => SCALE[Math.min(BUCKETS - 1, Math.max(0, Math.floor(((v - lo) / span) * BUCKETS)))];
    return { min: lo, max: hi, colorOf };
  }, [values, c]);

  const legend = useMemo(() => {
    if (!c || !(max > min)) return null;
    const span = (max - min) / BUCKETS;
    const out: Array<{ from: number; to: number; color: string }> = [];
    for (let i = 0; i < BUCKETS; i++) {
      out.push({ from: min + span * i, to: i === BUCKETS - 1 ? max : min + span * (i + 1), color: SCALE[i] });
    }
    return out;
  }, [min, max, c]);

  if (!c) return null;

  const priceFor = (provId: string): ProvValue =>
    valuesRef.current.find(x => x.id === provId) ?? { id: provId, v: 0, live: false };

  return (
    <div className="space-y-4 py-6">
      <section>
        <h1 className="font-display text-2xl font-extrabold">{t.mapTitle}</h1>
        <p className="text-[13.5px] text-moss">{t.mapSub}</p>
      </section>

      <div>
        <p className="mb-1.5 block text-[13.5px] font-semibold text-ink">{t.mapCropLabel}</p>
        <CropChips prov={app.prov} value={crop} onChange={setCrop} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('gov')}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${mode === 'gov' ? 'bg-forest text-paper' : 'border border-line bg-paper text-moss hover:bg-gold-soft'}`}
        >
          {t.hmGov}
        </button>
        <button
          type="button"
          onClick={() => setMode('farmers')}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${mode === 'farmers' ? 'bg-forest text-paper' : 'border border-line bg-paper text-moss hover:bg-gold-soft'}`}
        >
          {t.hmFarmers}
        </button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <MapContainer
            center={[13.8, 101.2]}
            zoom={6}
            minZoom={5}
            maxZoom={11}
            scrollWheelZoom={false}
            className="z-0 h-[55vh] w-full"
            attributionControl={false}
          >
            <FitBounds />
            {mode === 'farmers' ? (
              (reports ?? []).map((r, i) => {
                const p = provById(r.province);
                if (!p) return null;
                return (
                  <CircleMarker
                    key={i}
                    center={[p.lat, p.lng]}
                    radius={8}
                    pathOptions={{ color: '#1C2E20', weight: 1, fillColor: '#B6472E', fillOpacity: 0.75 }}
                  >
                    <Tooltip direction="top" opacity={1}>
                      <strong>{p.th}</strong><br />
                      {r.crop}: {fmtVal(Number(r.price), c)} {c.unit[lang]}<br />
                      {r.created_at ? new Date(r.created_at).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB') : ''}
                    </Tooltip>
                  </CircleMarker>
                );
              })
            ) : (
              <GeoJSON
              key={crop}
              data={thaiGeo as unknown as GeoJSON.FeatureCollection}
              style={f => {
                const pid = nameToId.get(f?.properties?.ADM1_TH ?? '') ?? '';
                const pv = pid ? priceFor(pid) : null;
                return {
                  color: '#E4DFC9',
                  weight: 0.8,
                  fillColor: pv ? colorOf(pv.v) : '#E4DFC9',
                  fillOpacity: pv ? 0.85 : 0.35
                };
              }}
              onEachFeature={(f, layer) => {
                const pid = nameToId.get(f.properties?.ADM1_TH ?? '') ?? '';
                const p = pid ? provById(pid) : null;
                if (!p) return;
                const path = layer as L.Path;
                const isLive = () => priceFor(pid).live;
                layer.bindTooltip(
                  () =>
                    `<strong>${p.th}</strong><br/>${fmtVal(priceFor(pid).v, c)} ${c.unit[lang]}<br/>` +
                    `<span class="map-src">${isLive() ? t.mapLive : t.mapModel}</span>`,
                  { direction: 'top', opacity: 1 }
                );
                layer.on({
                  click: () => { app.select(p.id, crop); nav('/'); },
                  mouseover: () => path.setStyle({ weight: 2, color: '#A87B1F', fillOpacity: 1 }),
                  mouseout: () => path.setStyle({
                    color: '#E4DFC9',
                    weight: 0.8,
                    fillColor: colorOf(priceFor(pid).v),
                    fillOpacity: 0.85
                  })
                });
              }}
            />
            )}
          </MapContainer>
        </CardContent>
      </Card>

      {mode === 'farmers' && (
        <p className="rounded-xl bg-ground px-4 py-3 text-[12px] leading-relaxed text-moss">
          {reports && reports.length === 0 ? t.hmEmpty : t.hmNote}
        </p>
      )}

      {legend && (
        <div className="panel-paper flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
          <span className="text-[12.5px] font-bold text-moss">{t.statMin}: {fmtVal(min, c)}</span>
          <div className="flex items-center gap-1">
            {legend.map(b => (
              <span
                key={b.from}
                className="size-4 rounded-sm border border-line"
                style={{ background: b.color }}
                title={`${fmtVal(b.from, c)} – ${fmtVal(b.to, c)}`}
                aria-label={`${fmtVal(b.from, c)} – ${fmtVal(b.to, c)}`}
              />
            ))}
          </div>
          <span className="text-[12.5px] font-bold text-moss">{t.statMax}: {fmtVal(max, c)}</span>
        </div>
      )}

      <p className="text-[12px] leading-relaxed text-moss">
        {t.mapTap} · {t.mapNote}
      </p>
    </div>
  );
}