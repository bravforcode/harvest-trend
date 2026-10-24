'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let fails = 0;
function ok(name, cond) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + name);
  if (!cond) fails++;
}

console.log('docs test-count claims:');
const readme = read('README.md');
const product = read('PRODUCT.md');
ok('README does not state 421 checks', !readme.includes('421'));
ok('PRODUCT.md does not state 51 checks', !product.includes('51 checks'));

if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('docs-claims.test.js: all checks OK');
