'use strict';
let fails = 0;
function ok(name, cond) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + name);
  if (!cond) fails++;
}

(async () => {
  const { hitRate } = await import('../scripts/backtest.mjs');
  console.log('hit rate:');
  const r = hitRate([
    { expected: 'up', actual: 'up' },
    { expected: 'down', actual: 'up' },
  ]);
  ok('counts matching pairs', r.hits === 1);
  ok('counts all pairs', r.n === 2);
  ok('rate = hits / n', r.rate === 0.5);
  const e = hitRate([]);
  ok('empty input gives null rate, not NaN', e.n === 0 && e.rate === null);
  if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
  console.log('backtest.test.js: all checks OK');
})();
