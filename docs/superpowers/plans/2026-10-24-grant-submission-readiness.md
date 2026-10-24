# Grant Submission Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the repo verifiable by a grant reviewer, prepare the first application that is realistically open (NLnet, closes 3 Nov 2026), and list every external blocker with its owner.

**Architecture:** Three tracks. Track A is code and docs, executed with TDD and committed per task. Track B is the funding package: research, checklists and drafts that the founder writes or approves. Track C is external actions that only the founder can take (company registration, letters, pilot, signatures). The plan never submits, pushes, signs or sends anything.

**Tech Stack:** React 19 + TypeScript + Vite 8 (bun), Vercel `/api` (plain JS), Supabase, Node test scripts (`tests/*.js`, `node:assert`-style `ok()` helper), GitHub Actions (to be added).

**Spec:** `docs/funding/GRANT-READINESS-PLAN.md` (draft v1). Corrections to it are listed below and override it.

## Global Constraints

- Do not push, deploy, sign, submit, send or pay. Each of these needs explicit approval in chat, per action.
- NLnet proposal text is written by the founder by hand. The GenAI policy (v2.0, from 20 Oct 2026) allows only read-only LLM help. No task in this plan drafts proposal prose.
- No IDs, bank details, tax numbers or credentials in files or chat.
- Every number in a document comes from a command output or a code constant, with the command or file:line cited.
- Thai and English parity for any new UI string (existing `ui-contract` test checks keys).
- Conventional commit messages with the trailer `Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>`.
- `docs/funding/` stays untracked unless the founder asks to commit it.
- Lean changes: match existing comment density, naming and file layout.

## Corrections to the draft spec (verified 2026-10-24)

| Draft claim | Finding | Consequence |
|---|---|---|
| F2: badge points to GitHub Actions, no CI | Badge `tests-421%20checks` is a static shield linking to `.../actions`. No `.github/` directory exists. | Real gap. Task A2 adds CI. |
| F3: 421 vs 51 checks | Actual: prices 35 + line-bot 30 + ui-contract 357 + ckan-mirror 13 + watch-sync 14 = **449**. README says 421 (lines 16, 106, 127, 221). PRODUCT.md line 49 says 51. | Task A1. |
| F4: PRODUCT.md says server does not verify id_token | `api/watch-sync.js` verifies locally first, then falls back to LINE `/v2/profile`. PRODUCT.md line 50 describes this correctly. | **F4 is withdrawn.** Do not edit PRODUCT.md for it. |
| "~56 price sources" | `api/prices.js` `SOURCES` has **19** entries. | Task A3 uses the real count. |
| F1: weather is random | Already fixed: README row relabelled as simulated (commit `75a27a8`). `s4why` note already shown in `SignalList` and `VerdictCard`. | Done. |
| F8: no licence | Done: `LICENSE` (Apache-2.0), `package.json` license field, README section (commit `75a27a8`). | Done. Code Apache-2.0, docs CC BY 4.0, brand all rights reserved. |
| "NIA sectoral concept 30 Oct" as a near-term path | Requires a registered Thai juristic person. The founder has no company and declined company options. | Track C, blocked. |

## Timeline reality (today is 24 Oct 2026)

| Call | Deadline | Who can apply | Plan status |
|---|---|---|---|
| NLnet open call (Restack / CodeSupply) | **3 Nov 2026, 12:00 CET** (about 18:00 Thailand time) | Individuals not verified for these calls | Track B1–B2 |
| NIA Sectoral Social Innovation (concept) | 30 Oct 2026 | Juristic person only | Blocked (Track C) |
| NIA Mandatory Round 1 FY2570 | 15 Dec 2026 | Juristic person only | Blocked (Track C) |
| GitHub Secure Open Source Fund | Rolling | Individuals; traction requirement likely unmet | Track B3 (check only) |

The 12-month schedule in the draft applies to later rounds. Only NLnet can realistically be submitted in the next two weeks.

## Gates (decisions and approvals the founder must give)

| Gate | Question | Blocks | Needed by |
|---|---|---|---|
| G1 | Retention period for public price reports (proposed: 12 months from report date) | A4 (privacy page) | Before A4 starts |
| G2 | Approve pushing the branch so CI can run | A2 verification | Before A2 step 6 |
| G3 | NLnet go / no-go, after B1 results | B2 | 27 Oct 2026 |
| G4 | Company decision (existing company, register, or stop NIA) | Track C NIA items | Before any NIA submission |
| G5 | Lawyer review of privacy page and IP draft | Public launch of A4; any signing | Before any submission |

---

## Track A: Code and docs

### Task A1: Correct stale test-count claims

**Files:**
- Create: `tests/docs-claims.test.js`
- Modify: `README.md` (lines 16, 106, 127, 221), `PRODUCT.md` (line 49), `package.json` (`scripts.test`)

**Interfaces:**
- Consumes: none
- Produces: none (guard test)

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/docs-claims.test.js`
Expected: exit 1, `✗ README does not state 421 checks`

- [ ] **Step 3: Update the counts**

Run each file and read its printed total:
`node tests/prices.test.js`, `node tests/line-bot.test.js`, `node tests/ui-contract.test.js`, `node tests/ckan-mirror.test.mjs`, `node tests/watch-sync.test.js`

Then set every count to the printed value:
- `README.md` line 16 badge → `tests-449%20checks`
- `README.md` line 106 and 127 → `449 checks`
- `README.md` line 221 → the `ui-contract` row must read `357 checks`, and each other row must equal its file's printed total
- `PRODUCT.md` line 49 → replace `51 checks passing` with `449 checks across the five test files passing`

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/docs-claims.test.js`
Expected: exit 0, `docs-claims.test.js: all checks OK`

- [ ] **Step 5: Add the guard to the test script**

In `package.json`, append ` && node tests/docs-claims.test.js` to `scripts.test`.
Run: `bun run test`
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add tests/docs-claims.test.js README.md PRODUCT.md package.json
git commit -m "docs: correct test counts to 449 and guard against stale claims

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

### Task A2: Add a CI workflow

**Files:**
- Create: `tests/ci-workflow.test.js`, `.github/workflows/ci.yml`
- Modify: `package.json` (`scripts.test`), `README.md` (badge, after step 7 only)

**Interfaces:**
- Consumes: `bun run test`, `bun run build` (existing scripts)
- Produces: a CI status badge URL for the README

- [ ] **Step 1: Write the failing test**

```js
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
ok('pins bun setup action to v2', wf.includes('oven-sh/setup-bun@v2'));

if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('ci-workflow.test.js: all checks OK');
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/ci-workflow.test.js`
Expected: exit 1, `✗ ci.yml exists`

- [ ] **Step 3: Create the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
  pull_request:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: bun install --frozen-lockfile
      - run: bun run test
      - run: bun run build
```

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/ci-workflow.test.js`
Expected: exit 0

- [ ] **Step 5: Add the guard to the test script**

Append ` && node tests/ci-workflow.test.js` to `scripts.test`. Run `bun run test`, expected exit 0.

- [ ] **Step 6: Commit (local only)**

```bash
git add .github/workflows/ci.yml tests/ci-workflow.test.js package.json
git commit -m "ci: run tests and build on push and pull request

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Verify on GitHub (gated by G2)**

Ask the founder for approval to push. After the push, check the run at `https://github.com/bravforcode/harvest-ecc/actions`. Expected: green.
If it fails, paste the failing step's log, fix it in a new commit, and re-check. Do not change the badge until the run is green.
Once green, replace the static badge in `README.md` line 16 with:
`[![CI](https://github.com/bravforcode/harvest-ecc/actions/workflows/ci.yml/badge.svg)](https://github.com/bravforcode/harvest-ecc/actions/workflows/ci.yml)`
Then commit the README change.

---

### Task A3: Measure real-data coverage (WP1 evidence)

**Files:**
- Create: `scripts/coverage.mjs`, `tests/coverage.test.js`, `docs/funding/coverage-table.md` (generated, untracked)
- Modify: `api/prices.js` only to export `SOURCES` if it is not already exported

**Interfaces:**
- Consumes: `SOURCES` (array of `{crop, prov, label, dateOf}`, `api/prices.js` 179–255), provinces and crops from `src/lib/data.ts`
- Produces: `coverage(sources, provinces, crops) → {total, provincial, national, covered}`

- [ ] **Step 1: Confirm the constants**

Run: `grep -n "provinces\|PROVINCES\|CROPS\|crops" src/lib/data.ts | head -20`
Record the real province and crop counts. The draft says 77 provinces and 25 crops. Use the real numbers in the report if they differ.

- [ ] **Step 2: Write the failing test**

```js
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
```

- [ ] **Step 3: Run to verify it fails**

Run: `node tests/coverage.test.js`
Expected: exit 1 (module not found)

- [ ] **Step 4: Implement the function**

Create `scripts/coverage.mjs`:

```js
// Counts (province, crop) pairs that have a real source.
// prov === '*' means a national dataset: it covers every province for that crop.
export function coverage(sources, provinces, crops) {
  const provincial = new Set();
  const national = new Set();
  for (const s of sources) {
    if (!crops.includes(s.crop)) continue;
    for (const p of provinces) {
      const key = p + '|' + s.crop;
      if (s.prov === p) provincial.add(key);
      else if (s.prov === '*') national.add(key);
    }
  }
  const nationalOnly = [...national].filter((k) => !provincial.has(k)).length;
  return {
    total: provinces.length * crops.length,
    provincial: provincial.size,
    national: nationalOnly,
    covered: provincial.size + nationalOnly,
  };
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `node tests/coverage.test.js`
Expected: exit 0

- [ ] **Step 6: Generate the table from real data**

Export `SOURCES` from `api/prices.js` if needed (check first with `grep -n "module.exports" api/prices.js`). Then write a small generator in `scripts/coverage.mjs` (a `main` guarded by `import.meta.url === pathToFileURL(process.argv[1]).href`) that prints a Markdown table to `docs/funding/coverage-table.md`: total pairs, provincial real, national-only, uncovered, and the count of distinct sources per crop.
Run it: `node scripts/coverage.mjs`
Expected: the file exists and the numbers match the function output.

- [ ] **Step 7: Re-run the suite and commit**

Run `bun run test` (expected exit 0; add `node tests/coverage.test.js` to `scripts.test`). Then:

```bash
git add scripts/coverage.mjs tests/coverage.test.js package.json api/prices.js
git commit -m "feat(data): measure real-data coverage of province x crop pairs

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

`docs/funding/coverage-table.md` stays untracked.

---

### Task A4: Privacy notice page (PDPA draft)

**Gate:** G1 (retention period) must be answered first.

**Files:**
- Create: `src/pages/PrivacyPage.tsx`, `tests/privacy-page.test.js`
- Modify: `src/App.tsx` (add route), the footer or about page (add a link), `package.json` (`scripts.test`)

**Interfaces:**
- Consumes: the language setting used by existing pages (check `src/pages/HomePage.tsx` for the hook name)
- Produces: route `/privacy`

- [ ] **Step 1: Read the facts the page must match**

Read, and write the answers down in the test comment before writing prose:
- `api/track.js`: what fields are stored in analytics
- `src/pages/ReportPage.tsx`: the consent wording and what is stored with a report
- `api/watch-sync.js` and the watchlist code: what is keyed on LINE `sub`
- `README.md` line 191: reports are public and stored in Singapore; no GPS
- Push subscriptions in `api/push.js`

Every claim on the page must match one of these. If a fact is not in code, the page must not state it.

- [ ] **Step 2: Write the failing test**

```js
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

console.log('privacy page:');
const app = read('src/App.tsx');
const page = fs.existsSync(path.join(ROOT, 'src/pages/PrivacyPage.tsx'))
  ? read('src/pages/PrivacyPage.tsx') : '';
ok('route /privacy registered', app.includes('path="/privacy"'));
ok('page file exists', page.length > 0);
ok('names processors: Supabase, Vercel, LINE', ['Supabase', 'Vercel', 'LINE'].every((w) => page.includes(w)));
ok('states a retention period', /เดือน|months/.test(page));
ok('states user rights', /สิทธิ|rights/.test(page));
ok('gives a contact channel', /LINE OA|@441sptre/.test(page));
ok('no unfilled placeholders', !/TODO|\[\[|\{\{/.test(page));

if (fails) { console.error(fails + ' failure(s)'); process.exit(1); }
console.log('privacy-page.test.js: all checks OK');
```

- [ ] **Step 3: Run to verify it fails**

Run: `node tests/privacy-page.test.js`
Expected: exit 1, `✗ route /privacy registered`

- [ ] **Step 4: Implement the page**

Create `src/pages/PrivacyPage.tsx` with two content objects (`th`, `en`) following the language hook used in `HomePage.tsx`. Each object has these sections in order: data we collect (price reports, watchlist, LINE user id, analytics, push subscription), purpose, legal basis and consent, retention (value from G1), processors (Supabase, Vercel, LINE Platform, browser push services), user rights and how to exercise them, contact (LINE OA `@441sptre`). Mark the page header as a draft pending legal review, as G5 requires.
Add `<Route path="/privacy" element={<PrivacyPage />} />` in `src/App.tsx` next to `/about`. Add a link to it in the footer.

- [ ] **Step 5: Run to verify it passes, then check the UI contract**

Run: `node tests/privacy-page.test.js` (expect exit 0) and `node tests/ui-contract.test.js` (expect exit 0; if it reports missing i18n keys, add them to both th and en).
Start the dev server and open `/privacy` on a phone-sized viewport (`bun run dev`, then the browser pane at 375 px). Confirm no horizontal scroll.

- [ ] **Step 6: Add the guard and commit**

Append ` && node tests/privacy-page.test.js` to `scripts.test`, run `bun run test` (expect exit 0), then commit with `feat(legal): add privacy notice page (draft pending legal review)` and the Co-Authored-By trailer.

---

### Task A5: Define the accuracy metric in code (WP2 groundwork)

Only the metric is built here. The data is a separate Track B item (B5).

**Files:**
- Create: `scripts/backtest.mjs`, `tests/backtest.test.js`
- Modify: `package.json` (`scripts.test`)

**Interfaces:**
- Consumes: none
- Produces: `hitRate(pairs) → {hits, n, rate}` where `pairs` is `[{expected: 'up'|'down'|'flat', actual: 'up'|'down'|'flat'}]`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/backtest.test.js` → exit 1 (module not found).

- [ ] **Step 3: Implement**

```js
// Share of forecasts whose direction matched the observed direction.
export function hitRate(pairs) {
  const n = pairs.length;
  const hits = pairs.filter((p) => p.expected === p.actual).length;
  return { hits, n, rate: n === 0 ? null : hits / n };
}
```

- [ ] **Step 4: Verify and commit**

Run `node tests/backtest.test.js` (expect exit 0), append it to `scripts.test`, run `bun run test` (expect exit 0), commit `feat(eval): add hit-rate metric for forecast backtests` with the trailer.

---

### Task A6: Label audit for simulated data on every page

Covers draft finding F5. The weather note is already done; this checks every page that shows prices or signals.

**Files:**
- Create: `docs/funding/label-audit.md` (untracked)
- Modify: only the page components where a price or signal is shown without a label

**Interfaces:**
- Consumes: the existing label keys `mockNote`, `chartNote`, `liveNote`, `mapNote`, `s4why` in `src/lib/i18n.ts`
- Produces: a table of every route and whether it carries a simulated or live label

- [ ] **Step 1: List the pages that render prices or signals**

Run: `grep -rln "getPrice\|verdict\|recommend(\|priceSub\|chart" src/pages src/components`
Record each file.

- [ ] **Step 2: For each file, check the label**

Run: `grep -n "mockNote\|chartNote\|liveNote\|mapNote\|s4why\|sigNote" <file>`
Fill the table in `docs/funding/label-audit.md`: route, file, label present (yes/no), label key.

- [ ] **Step 3: Fix each "no" row**

For each page without a label, add the closest existing key from step 2. If none fits, add a new key in both `th` and `en`. Run `node tests/ui-contract.test.js` after each change (expect exit 0).

- [ ] **Step 4: Verify and commit**

Run `bun run test` and `bun run build` (both exit 0). Commit `fix(ui): label simulated prices on every page that shows them`. Keep `docs/funding/label-audit.md` untracked.

---

## Track B: Funding package (founder decides; agent does research and checklists)

### Task B1: Verify the NLnet call (deadline 3 Nov 2026)

**Files:**
- Modify: `docs/funding/funder-tracker.md` (the NLnet row only)

- [ ] **Step 1: Open the call pages**

Fetch `https://nlnet.nl/news/2026/20260903-call.html` and `https://nlnet.nl/news/2026/20261020-AI-policy.html` with the browser or scrape tool. Record for each call (Restack, CodeSupply, general): eligibility of private individuals, minimum and maximum amount, required fields, and the exact deadline in CET.

- [ ] **Step 2: Check fit**

Write one paragraph per call in the tracker: does Harvest Trend's code fit the call's scope? Do not claim a fit that the call text does not state.

- [ ] **Step 3: Record and report to the founder**

Update only the NLnet row in `docs/funding/funder-tracker.md`, with the source URL and access date. Report the go / no-go question (G3) to the founder. Do not start B2 without a yes.

---

### Task B2: NLnet application checklist (no proposal prose)

**Gate:** G3 = yes.

**Files:**
- Create: `docs/funding/nlnet-application-checklist.md` (untracked)

- [ ] **Step 1: Build the checklist from the call's required fields**

For each field the call form asks for, write one row: field name, character or word limit, source URL, status (`founder writes`, `agent verified fact`, `attachment`). Leave the answer cells empty for the founder.

- [ ] **Step 2: Add the attachment and evidence list**

List the repo URL, LICENSE, CI badge (after A2 is green), the coverage table (A3), the privacy draft (A4), and the label audit (A6). Mark which ones exist in a branch that is pushed.

- [ ] **Step 3: Check the GenAI policy**

Confirm in the checklist that the founder writes all proposal text, and that any AI use is read-only, as the policy requires. Record the founder's statement from 24 Oct 2026 about code authorship.

- [ ] **Step 4: Report**

Tell the founder the list is ready and that submission is the founder's action, with the deadline and time.

---

### Task B3: Check the GitHub Secure Open Source Fund fit

- [ ] **Step 1: Read the eligibility page** at `https://github.com/open-source/github-secure-open-source-fund` and record the traction requirement exactly as written.
- [ ] **Step 2: Compare with the repo's public state** (stars, contributors, downloads, if any). Record the numbers with the date.
- [ ] **Step 3: Update the tracker row.** Mark it closed to the founder if the traction requirement is not met, and do not apply.

---

### Task B4: Verify the EEC-SDG Hackathon claim

Blocks any statement that the team won the prize in a proposal.

- [ ] **Step 1: Ask the founder** (in chat) for the organiser name, the official announcement link, or the prize letter. Do not search for a substitute.
- [ ] **Step 2: If the founder provides a link**, open it and record the title, date, track name and the founder's listed role. Update `docs/funding/funder-tracker.md`'s "Not verified" section.
- [ ] **Step 3: If no source is given**, keep the claim marked "user-reported, unverified" in every document. Do not write the award in a proposal.

---

### Task B5: Price-data backtest input (for WP2)

Blocked on a data-licence check: BOT terms do not allow republishing raw tables (see `docs/funding/company-setup-pack.md` section 8).

- [ ] **Step 1: Confirm what history is available** for one crop with a provincial source (for example durian, Trat, `SOURCES` row 1). Use the BOT or data.go.th package metadata. Record date range and frequency.
- [ ] **Step 2: Write the expected-direction rule** for each verdict (sell / wait / recover) in `docs/funding/backtest-method.md`, with the founder's approval. The rule is the input to `hitRate` (A5).
- [ ] **Step 3: Run the backtest locally** on the history, keep the raw data out of the repo, and commit only the aggregate result in `docs/funding/backtest-result.md`.

---

## Track C: External actions (founder only; the agent tracks status)

| # | Item | Owner | Dependency | Done when |
|---|---|---|---|---|
| C1 | Choose company path (G4) | Founder | None | Decision written in chat |
| C2 | Company registration and tax ID | Founder + accountant | C1 | Registration number in founder's own records (not in chat) |
| C3 | IP assignment signed by a lawyer | Founder + lawyer | C1, G5 | Signed copy kept by founder |
| C4 | Letters of support from a cooperative or farmer group | Founder | None | Signed letter received |
| C5 | Pilot with 30–50 farmers (WP3) | Founder + cooperative | C4, A4 published | Consent records and feedback log kept by founder |
| C6 | Thai lawyer review of the privacy page (G5) | Founder + lawyer | A4 | Written comments received |
| C7 | NIA plant-sector criteria from NIA | Founder | C1 | Written reply from NIA (mandatory@nia.or.th) |

No NIA submission happens before C2, C3 and C7 are done. Each submission at mis.nia.or.th or elsewhere needs the founder's explicit approval per form.

---

## Verification and definition of done

- `bun run test` exits 0 with the five original files plus `docs-claims`, `ci-workflow`, `coverage`, `privacy-page`, `backtest` (ten files in total once A1–A5 are in).
- `bun run build` exits 0.
- CI is green on GitHub after G2 (Task A2 step 7).
- Each commit in Track A has a red-then-green test run cited in its message or the report.
- Track B and C outputs are documents in `docs/funding/`, untracked, with sources and access dates.
- No document claims a number that is not produced by a command or a code constant.

## Self-review

**1. Spec coverage**
- F1 weather → done (commit `75a27a8`).
- F2 CI → A2.
- F3 test counts → A1.
- F4 → withdrawn with reason (see corrections).
- F5 label audit → A6 (only partly covered by tests; the audit is manual per page).
- F6 user evidence → B5 and C5.
- F7 device testing on LINE in-app browser → A4 step 5 covers phone width; the LINE in-app test is a manual founder action, added to C5.
- F8 licence → done (commit `75a27a8`).
- Funding landscape items 4.1–4.3 → B1, B3, B4; the rest of 4.3 is out of scope for this plan and needs a separate research task.
- Risk register items → covered by gates G1–G5 and Track C.
- KPIs in section 10 of the draft → measured in A3 (coverage) and B5 (hit rate); pilot KPIs in C5.

**2. Placeholder scan:** No "TBD" or "fill in later" remains. Steps that depend on a founder answer are marked with a gate (G1–G5) and say what to do if the answer is missing. The privacy page content is described section by section because the facts must be read from code first (A4 step 1).

**3. Type consistency:** `coverage` returns `{total, provincial, national, covered}` in both the test (A3) and the implementation. `hitRate` returns `{hits, n, rate}` in both the test (A5) and the implementation. The test file names and script names are used the same way in A1, A2, A3, A4 and A5.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-24-grant-submission-readiness.md`. Two execution options:

**1. Subagent-Driven (recommended):** a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution:** run tasks in this session using executing-plans, in batches with checkpoints.

Before any task runs, the founder should answer G1 (retention period) and G3 (NLnet go or no-go). Pushing (G2) and anything in Track C stay with the founder.
