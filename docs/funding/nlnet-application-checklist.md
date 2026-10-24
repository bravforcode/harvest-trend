# NLnet application checklist (no proposal prose)

Status: prepared 2026-10-24 after the founder's GO. Untracked draft. Nothing has been submitted.

**Deadline:** 3 Nov 2026, 12:00 CET (noon) = 18:00 Thailand time (UTC+7).
**Submitted by:** the founder, personally, through the NLnet form. The agent does not submit.

## Rules that apply to every answer

- **GenAI policy v2.0 (20 Oct 2026):** the founder writes all proposal text. AI is allowed only for read-only help. Do not paste AI-written prose into any field.
- The form asks for an AI disclosure (yes/no). Answer based on the founder's own statement: code is mostly hand-written; AI was used for read-only help only (stated 24 Oct 2026, not checked against git history).
- Significant AI-generated code in an existing codebase must be disclosed. The founder decides the wording.
- Do not claim the EEC-SDG prize in any field. It is user-reported and unverified (see `funder-tracker.md`).

## Step 1: Fields and limits

Source: call pages listed in `funder-tracker.md` (accessed 2026-10-24). Re-check the live form before filling, because limits may change.

| # | Field | Limit | Status | Answer (founder fills) |
|---|---|---|---|---|
| 1 | Fund choice (Restack, CodeSupply, or general open call) | choose one | founder decides | |
| 2 | Proposal title | short | founder writes | |
| 3 | Repository URL(s) | URLs | agent verified fact (repo is public on GitHub once pushed; see Step 2) | |
| 4 | Summary | max 1,000 chars | founder writes | |
| 5 | Amount requested and budget breakdown | max 4,000 chars | founder writes (amount range €5,000–€50,000 for a first grant, verified on NLnet pages) | |
| 6 | Comparison with other efforts | max 4,000 chars | founder writes | |
| 7 | Technical challenges | max 4,000 chars | founder writes | |
| 8 | Ecosystem and users | max 2,000 chars | founder writes | |
| 9 | Background | max 2,000 chars | founder writes | |
| 10 | Other funding | max 1,000 chars | founder writes (declare NIA only if actually applied; currently not applied) | |
| 11 | Applicant type | pick "Individual" | agent verified fact (option exists on form) | |
| 12 | Name or pseudonym | - | founder decides | |
| 13 | Email | - | founder enters | |
| 14 | Phone | - | founder enters | |
| 15 | Country of residence | - | founder enters | |
| 16 | Organisation name | leave blank for individual | founder decides | |
| 17 | AI disclosure (yes/no, plus logs or prompts up to 8,000 chars or file) | - | founder decides, based on Step 3 | |
| 18 | Optional attachments (up to 50 MB) | - | see Step 2 | |

Do **not** enter personal data (phone, address, ID) into any field from chat. The founder types it into the form.

## Step 2: Attachments and evidence

| Item | Exists? | Status |
|---|---|---|
| Repository URL (public GitHub) | `https://github.com/bravforcode/harvest-trend` (public, created 2026-10-24). Pushed `master` and `claude/project-funding-plan-249f7d` from a copy with author emails rewritten to noreply. The old `bravforcode/harvest-ecc` is archived and private, so it is not the URL to cite. | founder confirms the URL in the form and checks CI on the new repo |
| LICENSE (Apache-2.0 for code) | Yes, committed earlier (`2bcf3ba`, `75a27a8`) | agent verified |
| CI badge | Workflow `84df770`. Run 40107970827 on `bravforcode/harvest-trend` (branch `claude/project-funding-plan-249f7d`, 2026-10-24) concluded success. Verified with `gh run list` on 2026-10-25. | agent verified; founder decides whether to cite it |
| Coverage table (real-data coverage) | Yes: `docs/funding/coverage-table.md`, commit `99cbf61` | agent verified. Read as: 18 provincial pairs of 1,925; 553 includes national-only data. |
| Privacy draft | Drafted: `docs/funding/privacy-notice-draft.md` (not published; §7 lists 3 code findings). Consent wording and column-level select are changed in the working tree, not committed. Migration `20261024120000_price_reports_hide_user_id.sql` was applied to harvest-ecc on 2026-10-25 and verified as anon. Closed 2026-10-25: UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER revoked by migration 20261024182852. INSERT stays on purpose, because the app submits reports through it. | BLOCKED until founder fills controller and contact and counsel reviews. Retention (G1) and consent wording are approved. Migration applied 2026-10-25, after deploy as the founder chose. |
| Label audit (simulated-data labels) | Yes: `docs/funding/label-audit.md`, commit `15ecdf7` | agent verified |
| Hit-rate metric (backtest groundwork) | Yes, commit `1e6d13e` | agent verified; no backtest results exist yet (Task B5 not done) |

Rule: only cite a pushed branch or a public URL in the form. Local-only commits are not evidence for a reviewer.

## Step 3: GenAI policy check

- [ ] Founder confirms every sentence in every field is typed by the founder.
- [ ] Any AI use was read-only (search, explanation, review). Record that in the disclosure answer.
- [ ] Founder reviews the disclosure answer against `docs/funding/` drafts. Those drafts were AI-assisted and are notes only; they must not be pasted into the form.

## Step 4: Open checks before submitting

- [x] **Thailand country criterion (checked 2026-10-25):** NLnet's European-dimension page (`https://nlnet.nl/OIS/european-dimension/`, list updated 13 Oct 2026) includes Thailand and says the EC lists lead on any discrepancy. The EC PDF lists Thailand under "Other third countries". Both agree, so Thailand counts as a Horizon Europe-eligible country for the country criterion.
- [ ] **European dimension, 60% rule (Restack eligibility page):** at least 60% of funds must go to team members from eligible countries. The test is per person. Founder confirms the founder's country qualifies before relying on it.
- [ ] **GenAI policy risk:** NLnet says a new GenAI policy is coming and that projects mostly generated by LLMs are ineligible. The page advises waiting to submit if LLMs were used. Check the new policy before submitting.
- [ ] **Fund fit:** the call text does not name agriculture or price data. Founder decides whether the project fits the call's "digital commons and networked technology" wording, or Restack/CodeSupply scope.
- [ ] **Restack/CodeSupply guides and FAQs** were not read. Read them before picking a fund.
- [ ] **Re-check the form and deadline on the day you submit.**

## Step 5: Ready-to-submit gate

Submission is the founder's action. Before the founder submits:
1. Every "founder writes" row is filled by the founder.
2. Every BLOCKED attachment is resolved or removed from the form.
3. Step 3 and Step 4 are ticked.

Deadline: 3 Nov 2026, 12:00 CET (18:00 Thailand time).
