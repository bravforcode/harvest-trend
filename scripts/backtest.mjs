// Share of forecasts whose direction matched the observed direction.
export function hitRate(pairs) {
  const n = pairs.length;
  const hits = pairs.filter((p) => p.expected === p.actual).length;
  return { hits, n, rate: n === 0 ? null : hits / n };
}
