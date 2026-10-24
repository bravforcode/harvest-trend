'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const wfPath = path.join(ROOT, '.github', 'workflows', 'ci.yml');

let fails = 0;
function ok(name, cond) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + name);
  if (!cond) fails++;
}

console.log('ci workflow:');
const wf = fs.existsSync(wfPath) ? fs.readFileSync(wfPath, 'utf8') : '';
ok('ci.yml exists', wf.length > 0);
ok('installs with frozen lockfile', wf.includes('bun install --frozen-lockfile'));
ok('runs the test script', wf.includes('bun run test'));
ok('runs the build', wf.includes('bun run build'));
ok('runs the typecheck', wf.includes('bun run typecheck'));
ok('pins bun setup action to v2', wf.includes('oven-sh/setup-bun@v2'));

if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('ci-workflow.test.js: all checks OK');
