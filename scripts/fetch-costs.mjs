/* one-time curation: fetch data.go.th cost CSVs, parse RFC4180, compute latest-year
   values (district averages where applicable), emit cost-raw.json for review */
import fs from 'node:fs';
import path from 'node:path';

const CKAN = 'https://data.go.th/api/3/action/package_show?id=';
const IDS = {
  durian: '26_32', rice: '11-24', corn: 'production-costs-corn', cassava: '2565-25662',
  sugarcane: 'kaset-khorat-sugar-cane', palm: 'dataset_50_542', longan: 'dataset_12_155',
  coffee: 'dataset_10_254', pineapple: 'dataset_31_143', broiler: 'dataset_4_03', beef: 'dataset_12_112'
};

function parseCsv(txt) {
  const rows = [];
  let cur = '', row = [], inQ = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (inQ) {
      if (ch === '"') {
        if (txt[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && txt[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some(c => c.trim() !== '')) rows.push(row);
      row = [];
    } else cur += ch;
  }
  if (row.length) { row.push(cur); rows.push(row); }
  return rows;
}

function num(s) {
  const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
  return isFinite(n) ? n : NaN;
}
function avgOf(vals) {
  const a = vals.filter(v => isFinite(v));
  return a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 100) / 100 : NaN;
}
function tis620(buf) {
  let s = '';
  for (const b of buf) {
    s += b >= 0xa1 && b <= 0xfb ? String.fromCharCode(0x0e01 + b - 0xa1)
      : b === 0x0d || b === 0x0a || b === 0x09 || b < 0x80 ? String.fromCharCode(b) : '?';
  }
  return s;
}

(async () => {
  const out = {};
  for (const [crop, id] of Object.entries(IDS)) {
    const d = await (await fetch(CKAN + encodeURIComponent(id))).json();
    if (!d.success) { console.log(crop + ': NOTFOUND'); continue; }
    const res = d.result.resources.find(x => x.format === 'CSV');
    if (!res) { console.log(crop + ': no csv'); continue; }
    const buf = Buffer.from(await (await fetch(res.url)).arrayBuffer());
    const utf8 = buf.toString('utf8');
    const bad = (utf8.match(/\uFFFD/g) || []).length;
    const txt = bad > 3 ? tis620(buf) : utf8.replace(/^\uFEFF/, '');
    const rows = parseCsv(txt);
    if (rows.length < 2) { console.log(crop + ': empty'); continue; }
    const header = rows[0];
    const yearIdx = header.findIndex(c => /ปี|พศ/.test(c));
    const valIdx = header.findIndex(c => /จำนวน|ค่าข้อมูล|ต้นทุน|บาท/.test(c));
    let latest = [], ly = 0;
    for (const r of rows.slice(1)) {
      const y = yearIdx >= 0 ? num(r[yearIdx]) : NaN;
      if (isFinite(y) && y > ly) { ly = y; latest = [r]; }
      else if (isFinite(y) && y === ly) latest.push(r);
    }
    const vals = latest.map(r => valIdx >= 0 ? num(r[valIdx]) : NaN).filter(v => isFinite(v));
    /* special cases: palm = pick only ต้นทุนรวมต่อไร่ row; beef/durian print raw rows */
    let avg = avgOf(vals);
    if (crop === 'palm') {
      const total = latest.find(r => /รวมต่อไร่/.test(r.join('|')));
      avg = total ? num(total[valIdx]) : NaN;
    }
    if (crop === 'beef' || crop === 'durian') {
      console.log('  RAW[' + crop + ']:');
      latest.slice(0, 4).forEach(r => console.log('    ' + r.join(' | ').slice(0, 160)));
    }
    out[crop] = { id, year: ly, avg, n: vals.length, totalRows: latest.length, header: header.join('/') };
    console.log(crop + ': yr=' + ly + ' avg=' + out[crop].avg + ' n=' + vals.length + '/' + latest.length + ' [' + header.join('/') + ']');
  }
  fs.writeFileSync(path.join(import.meta.dirname, 'cost-raw.json'), JSON.stringify(out, null, 1));
  console.log('saved cost-raw.json');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
