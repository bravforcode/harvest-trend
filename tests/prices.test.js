/* Harvest Trend · รู้ทันราคา — real-price aggregator tests (node, zero deps) */
'use strict';
const assert = require('assert');
const { _internals } = require('../api/prices.js');
const { parseBotTable, normalizeBot, lastByYear, lastByMonth, thMonthIdx, num } = _internals;

let n = 0;
function ok(name, cond){
  n++;
  assert.ok(cond, 'FAIL: ' + name);
  console.log('  ✓ ' + name);
}

console.log('BOT table parser:');
/* BOT rows: [rowno][name with unit][6 monthly values — rightmost = latest] */
const botHtml = [
  '<table>',
  '<tr><td>h</td><td>h</td></tr>',
  '<tr><td>1</td><td>ข้าวเปลือกเจ้า 5% (บาท/เมตริกตัน)</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>7,061.1</td></tr>',
  '<tr><td>2</td><td>ข้าวโพดความชื้นไม่เกิน 14% (บาท/กิโลกรัม)</td><td>8.6</td><td>8.4</td><td>8.2</td><td>6.0</td><td>7.8</td><td>7.9</td></tr>',
  '<tr><td>3</td><td>ลำไยคละ (บาท/กิโลกรัม)</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>',
  '<tr><td>4</td><td>อ้อยโรงงาน (บาท/เมตริกตัน)</td><td>-</td><td>-</td><td>-</td><td>807.4</td><td>786.8</td><td>798.8</td></tr>',
  '</table>'
].join('');
const rows = parseBotTable(botHtml);
ok('parseBotTable finds 4 data rows (2-cell header skipped)', rows.length === 4);
const bot = normalizeBot(rows);
ok('BOT rice uses rightmost value (7,061.1 → 7.0611 THB/kg)', bot.some(x => x.crop === 'rice' && Math.abs(x.price - 7.0611) < 0.001));
ok('BOT rice unit converted to THB/kg', (bot.find(x => x.crop === 'rice') || {}).unit === 'บาท/กก.');
ok('BOT maize uses rightmost value (7.9 THB/kg)', bot.some(x => x.crop === 'maize' && Math.abs(x.price - 7.9) < 0.001));
ok('BOT sugarcane stays in THB/tonne (798.8)', bot.some(x => x.crop === 'sugarcane' && Math.abs(x.price - 798.8) < 0.001 && x.unit === 'บาท/ตัน'));
ok('BOT longan skipped when all values empty', !bot.some(x => x.crop === 'longan'));
ok('BOT entries all scoped to north region + source label', bot.every(x => x.prov === 'rg:north' && !!x.source));

console.log('pickers:');
const recs = [ {ปี:2565, ราคา:10}, {ปี:2567, ราคา:12}, {ปี:2566, ราคา:11} ];
const last = lastByYear(recs, r => r['ปี']);
ok('lastByYear picks newest year', last['ปี'] === 2567 && last['ราคา'] === 12);
const mrecs = [ {y:2567, m:5}, {y:2568, m:1}, {y:2568, m:12} ];
const lm = lastByMonth(mrecs, r => r.y, r => r.m - 1);
ok('lastByMonth picks newest (year,month)', lm.y === 2568 && lm.m === 12);
ok('thMonthIdx มกราคม → 0', thMonthIdx('มกราคม') === 0);
ok('thMonthIdx ธันวาคม (with space) → 11', thMonthIdx('ธันวาคม ') === 11);
ok('thMonthIdx unknown → -1', thMonthIdx('มกรร') === -1);
ok('num parses 7,061.1 → 7061.1', num('7,061.1') === 7061.1);
ok('num ignores - (missing)', num('-') === null);

console.log('\nprices.test.js: ' + n + ' checks OK');
