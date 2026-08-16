/* Harvest Trend — LINE Rich Menu setup (research: rich menus are NOT
   message-counted, free-tier friendly; 1,000 menus/account; image must be
   JPEG/PNG 800–2500px wide, W/H >= 1.45, <= 1MB).

   Usage:
     LINE_CHANNEL_ACCESS_TOKEN=<token> node scripts/set-rich-menu.mjs [image.png] [--replace]

   - image.png: optional custom design. Default: generates a 1000x500 PNG with
     flat warm-orchard zone colors (no text — replace with a branded design
     before production; zone rectangles match the area boxes exactly).
   - --replace: delete existing Harvest Trend rich menus before creating.
   - Areas: 8 buttons (2x4 grid) = the web routes (uri actions, SITE_URL env or
     https://harvest-ecc.vercel.app).
*/
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const SITE = process.env.SITE_URL || 'https://harvest-ecc.vercel.app';
const W = 1000, H = 500;
const COLS = 2, ROWS = 4;
/* warm orchard ledger palette, one per button */
const COLORS = ['#2C4A24', '#4A7A3D', '#A87B1F', '#B6472E', '#2E5C9A', '#4A5A48', '#7A5A22', '#3E5C46'];

const ROUTES = ['/', '/chart', '/map', '/cost', '/report', '/watch', '/about', '/line'];

/* ---------- minimal PNG writer (node zlib) ---------- */
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function makePng(w, h, draw) {
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0; /* filter none */
    for (let x = 0; x < w; x++) {
      const [r, g, b] = draw(x, y);
      const o = y * (w * 3 + 1) + 1 + x * 3;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; /* 8-bit, truecolor */
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }

function defaultImage() {
  const pal = COLORS.map(hex);
  return makePng(W, H, (x, y) => {
    const col = Math.floor(x / (W / COLS)), row = Math.floor(y / (H / ROWS));
    const i = row * COLS + col;
    return pal[i % pal.length];
  });
}

/* ---------- LINE Messaging API ---------- */
async function api(pathname, body, headers = {}) {
  const r = await fetch('https://api.line.me' + pathname, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json', ...headers },
    body: body
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error('LINE ' + pathname + ' -> HTTP ' + r.status + ' ' + txt.slice(0, 200));
  }
  return r.status === 204 ? null : r.json();
}
async function apiData(pathname, buf, contentType) {
  const r = await fetch('https://api-data.line.me' + pathname, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': contentType },
    body: buf
  });
  if (!r.ok) throw new Error('LINE ' + pathname + ' -> HTTP ' + r.status);
}

async function listMenus() {
  const r = await fetch('https://api.line.me/v2/bot/richmenu/list', {
    headers: { Authorization: 'Bearer ' + TOKEN }
  });
  if (!r.ok) throw new Error('list richmenu -> HTTP ' + r.status);
  return (await r.json()).richmenus || [];
}

(async () => {
  const replace = process.argv.includes('--replace');
  const imgArg = process.argv.find(a => a.endsWith('.png') || a.endsWith('.jpg') || a.endsWith('.jpeg'));

  const img = imgArg
    ? fs.readFileSync(path.resolve(imgArg))
    : defaultImage();
  if (img.length > 1024 * 1024) { console.error('FAIL: image > 1MB (' + img.length + ' bytes)'); process.exit(1); }

  if (!TOKEN) {
    /* image-only mode: let the designer preview/replace the generated PNG */
    const out = path.resolve('rich-menu-default.png');
    fs.writeFileSync(out, img);
    console.log('No LINE_CHANNEL_ACCESS_TOKEN — image only mode.');
    console.log('Wrote ' + out + ' (' + img.length + ' bytes). Replace with a branded design, then run with the token.');
    return;
  }

  if (replace) {
    for (const m of await listMenus()) {
      if (m.name && m.name.includes('Harvest Trend')) {
        const d = await fetch('https://api.line.me/v2/bot/richmenu/' + m.richMenuId, {
          method: 'DELETE', headers: { Authorization: 'Bearer ' + TOKEN }
        });
        if (!d.ok) throw new Error('delete ' + m.richMenuId + ' -> HTTP ' + d.status);
        console.log('deleted old rich menu ' + m.richMenuId + ' (' + m.name + ')');
      }
    }
  }

  const colW = Math.floor(W / COLS), rowH = Math.floor(H / ROWS);
  const areas = ROUTES.map((route, i) => ({
    bounds: {
      x: (i % COLS) * colW, y: Math.floor(i / COLS) * rowH,
      width: colW, height: rowH
    },
    action: { type: 'uri', uri: SITE + route }
  }));

  const created = await api('/v2/bot/richmenu', JSON.stringify({
    size: { width: W, height: H },
    selected: false,
    name: 'Harvest Trend nav',
    chatBarText: 'เมนู',
    areas
  }));
  console.log('created rich menu ' + created.richMenuId);

  const ct = imgArg && imgArg.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  await apiData('/v2/bot/richmenu/' + created.richMenuId + '/content', img, ct);
  console.log('uploaded rich menu image (' + img.length + ' bytes)');

  await api('/v2/bot/user/all/richmenu/' + created.richMenuId, undefined, { 'Content-Type': 'application/json' });
  console.log('set as default rich menu — done');
  console.log('areas: ' + ROUTES.map((r, i) => r).join(' '));
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
