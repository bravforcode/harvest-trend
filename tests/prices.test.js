/* Harvest Trend · รู้ทันราคา — real-price aggregator tests (node, zero deps) */
'use strict';
const assert = require('assert');
const { _internals } = require('../api/prices.js');
const { parseBotTable, normalizeBot, lastByYear, lastByMonth, thMonthIdx, num, BOT_REPORTS } = _internals;
const R491 = BOT_REPORTS.find(r => r.id === 491);
const R997 = BOT_REPORTS.find(r => r.id === 997);
const R89 = BOT_REPORTS.find(r => r.id === 89);
const R545 = BOT_REPORTS.find(r => r.id === 545);
const R588 = BOT_REPORTS.find(r => r.id === 588);

let n = 0;
function ok(name, cond){
  n++;
  assert.ok(cond, 'FAIL: ' + name);
  console.log('  ✓ ' + name);
}

console.log('BOT table parser (leftmost value = latest month):');
/* BOT rows: [rowno][name with unit][6 monthly values — leftmost = latest] */
const botHtml = [
  '<table>',
  '<tr><td>h</td><td>h</td></tr>',
  '<tr><td>1</td><td>ข้าวเปลือกเจ้า 5% (บาท/เมตริกตัน)</td><td>7,061.1</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>',
  '<tr><td>2</td><td>ข้าวโพดความชื้นไม่เกิน 14% (บาท/กิโลกรัม)</td><td>8.6</td><td>8.4</td><td>8.2</td><td>6.0</td><td>7.8</td><td>7.9</td></tr>',
  '<tr><td>3</td><td>ลำไยคละ (บาท/กิโลกรัม)</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>',
  '<tr><td>4</td><td>อ้อยโรงงาน (บาท/เมตริกตัน)</td><td>-</td><td>-</td><td>-</td><td>807.4</td><td>786.8</td><td>798.8</td></tr>',
  '</table>'
].join('');
const rows = parseBotTable(botHtml);
ok('parseBotTable finds 4 data rows (2-cell header skipped)', rows.length === 4);
const bot = normalizeBot(rows, R491);
ok('BOT rice uses leftmost value (7,061.1 → 7.0611 THB/kg)', bot.some(x => x.crop === 'rice' && Math.abs(x.price - 7.0611) < 0.001));
ok('BOT rice unit converted to THB/kg', (bot.find(x => x.crop === 'rice') || {}).unit === 'บาท/กก.');
ok('BOT maize uses leftmost value (8.6 THB/kg)', bot.some(x => x.crop === 'maize' && Math.abs(x.price - 8.6) < 0.001));
ok('BOT sugarcane stays in THB/tonne (807.4)', bot.some(x => x.crop === 'sugarcane' && Math.abs(x.price - 807.4) < 0.001 && x.unit === 'บาท/ตัน'));
ok('BOT longan skipped when all values empty', !bot.some(x => x.crop === 'longan'));
ok('BOT entries all scoped to north region + source label', bot.every(x => x.prov === 'rg:north' && !!x.source));

console.log('BOT 997 (south, first value = current):');
const southHtml = '<table>' +
  '<tr><td>6</td><td>ยางแผ่นดิบ ชั้น 3 (บาท/กิโลกรัม)</td><td>81.61</td><td>75.91</td></tr>' +
  '<tr><td>7</td><td>ผลปาล์มน้ำมันทั้งทะลายคละ (บาท/กิโลกรัม)</td><td>7.54</td><td>7.07</td></tr>' +
  '<tr><td>9</td><td>ทุเรียนหมอนทองภาคใต้ (บาท/กิโลกรัม)</td><td>103.23</td><td>85.00</td></tr>' +
  '</table>';
const sb = normalizeBot(parseBotTable(southHtml), R997);
ok('south rubber 81.61 THB/kg', sb.some(x => x.crop === 'rubber' && Math.abs(x.price - 81.61) < 0.001));
ok('south palm 7.54 THB/kg', sb.some(x => x.crop === 'palm' && Math.abs(x.price - 7.54) < 0.001));
ok('south durian 103.23 THB/kg', sb.some(x => x.crop === 'durian' && Math.abs(x.price - 103.23) < 0.001));
ok('south scope rg:south', sb.every(x => x.prov === 'rg:south'));

console.log('BOT 89 (wholesale, group rows):');
const wsHtml = '<table>' +
  '<tr><td>8</td><td>ยางแผ่นรมควัน 1/</td><td></td><td></td></tr>' +
  '<tr><td>9</td><td>ชั้น 1</td><td>83,370</td><td>80,970</td></tr>' +
  '<tr><td>10</td><td>ชั้น 2</td><td>82,770</td><td>80,370</td></tr>' +
  '<tr><td>12</td><td>ข้าวโพด</td><td>10,620</td><td>9,770</td></tr>' +
  '</table>';
const wb = normalizeBot(parseBotTable(wsHtml), R89);
ok('wholesale rubber RSS1 = 83.37 THB/kg (per tonne ÷1000)', wb.some(x => x.crop === 'rubber' && Math.abs(x.price - 83.37) < 0.001));
ok('wholesale maize = 10.62 THB/kg', wb.some(x => x.crop === 'maize' && Math.abs(x.price - 10.62) < 0.001));
ok('wholesale scope rg:*', wb.every(x => x.prov === 'rg:*'));

console.log('BOT 89 (rice group sub-rows 100%/5%/...):');
const wsRiceHtml = '<table>' +
  '<tr><td>1</td><td>ข้าวสาร</td><td></td><td></td></tr>' +
  '<tr><td>2</td><td>100%</td><td>16,672</td><td>16,402</td></tr>' +
  '<tr><td>3</td><td>5%</td><td>16,175</td><td>15,902</td></tr>' +
  '<tr><td>7</td><td>ปลายข้าวขาวเอวันเลิศ</td><td>11,972</td><td>12,102</td></tr>' +
  '<tr><td>13</td><td>แป้งมัน</td><td>13,725</td><td>14,375</td></tr>' +
  '</table>';
const wr = normalizeBot(parseBotTable(wsRiceHtml), R89);
ok('wholesale rice 100% = 16.672 THB/kg (per tonne ÷1000)', wr.some(x => x.crop === 'rice' && Math.abs(x.price - 16.672) < 0.001));
ok('wholesale cassava starch = 13.725 THB/kg', wr.some(x => x.crop === 'cassava' && Math.abs(x.price - 13.725) < 0.001));

console.log('BOT 545 (northeast, rightmost = latest):');
const neHtml = '<table>' +
  '<tr><td>1</td><td>ข้าวเปลือกหอมมะลิ (บาท/เมตริกตัน)</td><td>17,296</td><td>16,874</td><td>16,465</td></tr>' +
  '<tr><td>2</td><td>ข้าวเปลือกเจ้าความชื้น 15% (บาท/เมตริกตัน)</td><td>7,718</td><td>7,271</td><td>7,029</td></tr>' +
  '<tr><td>3</td><td>ข้าวเปลือกหนียวเมล็ดยาว (บาท/เมตริกตัน)</td><td>11,899</td><td>11,858</td><td>11,583</td></tr>' +
  '<tr><td>5</td><td>หัวมันสำปะหลัง (บาท/กิโลกรัม)</td><td>2.72</td><td>2.61</td><td>2.54</td></tr>' +
  '<tr><td>7</td><td>อ้อยโรงงาน (บาท/เมตริกตัน)</td><td>n.a.</td><td>n.a.</td><td>981</td></tr>' +
  '<tr><td>8</td><td>ข้าวโพดเลี้ยงสัตว์ (บาท/กิโลกรัม)</td><td>5.99</td><td>5.23</td><td>5.16</td></tr>' +
  '<tr><td>9</td><td>ยางพารา (บาท/กิโลกรัม)</td><td>81</td><td>75</td><td>72</td></tr>' +
  '</table>';
const nb = normalizeBot(parseBotTable(neHtml), R545);
ok('NE jasmine rice 17.296 THB/kg (prio over plain rice)', nb.some(x => x.crop === 'rice' && Math.abs(x.price - 17.296) < 0.001));
ok('NE cassava 2.72 THB/kg', nb.some(x => x.crop === 'cassava' && Math.abs(x.price - 2.72) < 0.001));
ok('NE sugarcane 981 THB/tonne (no ÷1000)', nb.some(x => x.crop === 'sugarcane' && Math.abs(x.price - 981) < 0.001 && x.unit === 'บาท/ตัน'));
ok('NE maize 5.99 THB/kg', nb.some(x => x.crop === 'maize' && Math.abs(x.price - 5.99) < 0.001));
ok('NE rubber 81 THB/kg', nb.some(x => x.crop === 'rubber' && Math.abs(x.price - 81) < 0.001));
ok('NE scope rg:ne', nb.every(x => x.prov === 'rg:ne'));

console.log('BOT 588 (south, rightmost = latest):');
const s588Html = '<table>' +
  '<tr><td>2</td><td>ยางแผ่นดิบคุณภาพ 3 (บาท/กิโลกรัม) 1/</td><td>52.63</td><td>52.84</td><td>52.87</td></tr>' +
  '<tr><td>3</td><td>ปาล์มทั้งทะลาย(บาท/กิโลกรัม) 2/</td><td>5.48</td><td>6.12</td><td>5.73</td></tr>' +
  '<tr><td>4</td><td>เมล็ดกาแฟคละ (บาท/กิโลกรัม) 3/</td><td>74.51</td><td>74.51</td><td>74.51</td></tr>' +
  '<tr><td>5</td><td>มะพร้าวผลแห้งคละ (บาท/100 ผล) 3/</td><td>786.93</td><td>692.02</td><td>547.67</td></tr>' +
  '<tr><td>6</td><td>ข้าวเปลือกเจ้า 25% (บาท/เมตริกตัน) 3/</td><td>9,628.14</td><td>9,974.99</td><td>10,209.99</td></tr>' +
  '</table>';
const s588 = normalizeBot(parseBotTable(s588Html), R588);
ok('south588 rubber 52.63 THB/kg', s588.some(x => x.crop === 'rubber' && Math.abs(x.price - 52.63) < 0.001));
ok('south588 palm 5.48 THB/kg', s588.some(x => x.crop === 'palm' && Math.abs(x.price - 5.48) < 0.001));
ok('south588 coffee 74.51 THB/kg', s588.some(x => x.crop === 'coffee' && Math.abs(x.price - 74.51) < 0.001));
ok('south588 coconut 7.8693 THB/fruit (per 100 ÷100)', s588.some(x => x.crop === 'coconut' && Math.abs(x.price - 7.8693) < 0.001 && x.unit === 'บาท/ผล'));
ok('south588 rice 9.62814 THB/kg', s588.some(x => x.crop === 'rice' && Math.abs(x.price - 9.62814) < 0.001));
ok('south588 scope rg:south', s588.every(x => x.prov === 'rg:south'));

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
