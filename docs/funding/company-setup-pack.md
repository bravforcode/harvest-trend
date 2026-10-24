# Company setup pack — draft (not filed, not signed)

Status: DRAFT for review by a Thai registered accountant or lawyer. Nothing here has been submitted to DBD, NIA or a bank. Names are unchecked for availability. Fees and forms must be confirmed on the DBD site before use.

## 1. Company name options (choose 3 for DBD)

| # | Thai | English | Check |
|---|---|---|---|
| 1 | บริษัท รู้ทันราคา จำกัด | Roo Tan Ratcha Co., Ltd. (Know the Price) | Name availability not checked |
| 2 | บริษัท ฮาร์เวสต์ เทรนด์ จำกัด | Harvest Trend Co., Ltd. | Name availability not checked |
| 3 | บริษัท อะกริเทรนด์ อีอีซี จำกัด | AgriTrend EEC Co., Ltd. | Name availability not checked |

## 2. Business objectives (draft, Thai)

- พัฒนาและให้บริการแพลตฟอร์มข้อมูลราคาสินค้าเกษตรและคำแนะนำจังหวะการเก็บเกี่ยวและการขาย
- พัฒนาซอฟต์แวร์ เว็บแอปพลิเคชัน และบริการ LINE Official Account สำหรับเกษตรกรและผู้ประกอบการ
- รวบรวม วิเคราะห์ และเผยแพร่ข้อมูลราคาและปริมาณผลผลิตทางการเกษตรจากแหล่งข้อมูลสาธารณะ
- ให้บริการวิจัยและพัฒนานวัตกรรมด้านการเกษตรและการค้าสินค้าเกษตร
- ดำเนินธุรกิจอื่นที่เกี่ยวข้องหรือสนับสนุนวัตถุประสงค์ข้างต้น

Review the objectives so they cover every revenue line you plan (subscriptions, data services, grants, consulting). An objective not listed may limit what the company can do.

## 3. Shareholders and directors (fill in yourself)

- Shareholders: at least 3 persons. Thai nationals must hold at least 51% of shares. NIA requires this.
- Directors: at least 1. Confirm the 3-year target-industry experience rule (see section 6).
- Shareholder and director details: full name, national ID or passport, address, share count. **Enter these yourself. Do not send ID numbers in chat.**

## 4. Registration checklist

- [ ] Choose 3 names and check availability on DBD (reserve)
- [ ] Set registered capital and number of shares; confirm the paid-up amount with the accountant
- [ ] Set the registered office address and prepare proof (lease or landlord letter)
- [ ] Prepare the memorandum of association and articles of association (draft by accountant or lawyer)
- [ ] Gather ID copies of all shareholders and directors
- [ ] Submit through DBD (online or at an office). **Requires your own login and signature.**
- [ ] Receive company registration number and tax ID
- [ ] Open a company bank account (needed for NIA reimbursement)
- [ ] Register for VAT only if revenue will exceed the threshold (confirm the current figure with the Revenue Department)
- [ ] Register for social security if hiring staff

## 5. IP assignment (draft outline)

NIA requires the company to own the core technology or hold a licence to it. Before applying:
- The founder assigns or licenses the Harvest Trend code, data pipelines, and brand to the company in writing.
- Confirm whether the EEC-SDG prize or any other funder claims rights to the code. Check the terms before signing.
- Have a lawyer draft and sign the agreement.

## 6. Eligibility gaps to resolve before applying

- **3-year experience rule.** NIA requires the company or a director to have at least 3 years in the target industry. A new company has none, so the director's own record must meet this. If it does not, the company cannot meet the requirement.
- **Thai ownership.** Keep at least 51% Thai-held. Check this before any foreign investor joins.
- **Private match.** NIA grants are reimbursement, with a private contribution of at least 25%. Plan the cash and in-kind share.

## 7. NIA application outline (for the Sectoral call, if eligible)

1. Company registration and tax ID documents
2. Concept idea (ข้อเสนอแนวคิดโครงการ) on the NIA form, submitted at https://mis.nia.or.th
3. Budget and private-match plan
4. IP and business-model summary

Submission at mis.nia.or.th requires the company's own login. Each submission needs your explicit approval before it is sent.

## 8. Licence choice (decision needed)

The repository has no LICENSE file, so the code is all rights reserved by default. Choose one licence per asset type before any public release or grant submission.

| Asset | Option A | Option B | Recommended | Notes |
|---|---|---|---|---|
| Code (web app, API, workers) | Apache-2.0 (open, includes a patent grant) | Proprietary (closed source) | Apache-2.0 | Grant reviewers usually value open code. The company keeps copyright, so it can still relicense later. |
| Code (alternative) | MIT (open, shorter, no patent grant) | — | — | Choose if you want the simplest licence. |
| Documentation (README, PRODUCT.md, funding docs) | CC BY 4.0 | All rights reserved | CC BY 4.0 | Allows reuse with attribution. |
| Aggregated price datasets published by the project | CC BY 4.0 | ODbL (share-alike) | CC BY 4.0 | Check the source terms first. BOT and data.go.th may restrict redistribution. |
| Brand (name, logo, icons) | All rights reserved | — | All rights reserved | Open licences do not cover brand names or logos. |
| Third-party components | Keep their own licences | — | — | Run a licence scan before release. Do not relicense them. |

**Conditions for any choice**
- The IP assignment (clause 2.1 of the draft) transfers copyright to the company, so the company can choose the licence. Sign it before choosing.
- Check the data sources' terms before publishing any dataset (BOT, data.go.th, news sites).
- Add a LICENSE file and a licence line to the README in the same change that sets the licence.

**Decision (confirmed by founder):** Apache-2.0 for code; CC BY 4.0 for documentation and aggregated datasets. Brand stays all rights reserved; third-party components keep their own licences.

**Done:** `LICENSE` (Apache-2.0 text from apache.org) added; README licence section updated. Not committed.

**Dataset terms check**
- **Bank of Thailand** ([terms](https://www.bot.or.th/en/terms-and-condition.html)): users may download and copy materials for their own use. Section 8 says third-party copyrighted material needs permission from the original source. No open licence is stated, so do not republish BOT tables under CC BY. Publish only derived figures with attribution, and ask BOT if the project republishes raw data.
- **data.go.th** (checked 2026-10-24 via CKAN `package_show` for the 22 resources in `api/prices.js`): 19 packages show `license_id` "Open Data Common" with no URL or licence text (not a standard CKAN licence ID; unverified). 9 packages from สำนักงานเศรษฐกิจการเกษตร show "อื่นๆ" (Other), which is not open. The terms page itself is blocked. Do not republish these datasets under CC BY or ODbL until the terms are confirmed.
- **Code:** no licence handling in `api/`, `workers/` or `src/data/`. Dataset licence metadata is not recorded.
