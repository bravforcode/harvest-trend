'use strict';
let fails = 0;
function ok(name, cond) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + name);
  if (!cond) fails++;
}

(async () => {
  const { coverage } = await import('../scripts/coverage.mjs');
  console.log('coverage:');
  const r = coverage(
    [{ crop: 'a', prov: 'x' }, { crop: 'b', prov: '*' }],
    ['x', 'y'],
    ['a', 'b']
  );
  ok('total = provinces × crops', r.total === 4);
  ok('provincial exact matches counted', r.provincial === 1);
  ok('national-only pairs counted separately', r.national === 2);
  ok('covered = provincial + national-only', r.covered === 3);
  if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
  console.log('coverage.test.js: all checks OK');
})();
