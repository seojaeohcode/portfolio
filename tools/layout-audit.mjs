// tools/layout-audit.mjs — 좌우로 나란한 블록의 높이 차이와 빈 띠를 찾는다.
// 사용: python -m http.server 4180 -d dist (별도 실행) 후
//       node tools/layout-audit.mjs http://localhost:4180 / /work/tidemark/ ...
// 헤드리스 Edge를 DevTools 프로토콜로 제어 (Node 22 내장 WebSocket, 설치 없음).
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [base, ...paths] = process.argv.slice(2);
const WIDTHS = (process.env.WIDTHS || '1280,1440,1920').split(',').map(Number);
const SHOT = process.env.SHOT_DIR;  // 지정하면 페이지·폭마다 전체 화면 캡처
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9333;
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'audit-'))}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let target;
for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const wait = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } });
const cdp = (method, params = {}) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

// 페이지 안에서 실행: 같은 줄에 놓인 형제 블록의 "내용 높이"를 비교 (Codex 합의 기준: 1.3배 초과이면서 32px 초과)
const probe = () => {
  const path = el => { const p = []; for (let e = el; e && e !== document.body; e = e.parentElement) p.unshift(e.className ? `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}` : e.tagName.toLowerCase()); return p.slice(-3).join(' > '); };
  const contentH = el => { const kids = [...el.children].filter(k => k.getBoundingClientRect().height > 0 && getComputedStyle(k).position !== 'absolute'); if (!kids.length) return el.getBoundingClientRect().height; const top = el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop); return Math.max(...kids.map(k => k.getBoundingClientRect().bottom)) - top; };
  const out = [];
  for (const p of document.querySelectorAll('body *')) {
    const d = getComputedStyle(p).display; if (!/grid|flex/.test(d)) continue;
    const kids = [...p.children].filter(k => { const r = k.getBoundingClientRect(); return r.height > 40 && r.width > 120 && getComputedStyle(k).position !== 'absolute'; });
    // 같은 줄(위치가 겹치는 행)에 있는 쌍만
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const a = kids[i].getBoundingClientRect(), b = kids[j].getBoundingClientRect();
      if (Math.abs(a.top - b.top) > 24 || b.left < a.right - 4) continue;
      const ha = contentH(kids[i]), hb = contentH(kids[j]), diff = Math.abs(ha - hb);
      if (diff > 32 && Math.max(ha, hb) / Math.max(1, Math.min(ha, hb)) > 1.3) out.push({ where: path(p), a: path(kids[i]), b: path(kids[j]), ha: Math.round(ha), hb: Math.round(hb), diff: Math.round(diff), y: Math.round(a.top + scrollY), text: (kids[i].textContent.trim().slice(0, 18) + ' | ' + kids[j].textContent.trim().slice(0, 18)) });
    }
  }
  // 그리드 칸 안의 글자가 옆 칸으로 넘치는지 (높이 비교로는 안 잡히는 겹침)
  const spill = [...document.querySelectorAll('body *')].filter(e => /grid/.test(getComputedStyle(e.parentElement).display) && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth);
  if (spill.length) out.push({ where: 'grid cell spill', a: spill.slice(0, 3).map(e => path(e)).join(' ; '), b: '', ha: spill.length, hb: 0, diff: 0, y: Math.round(spill[0].getBoundingClientRect().top + scrollY), text: spill[0].textContent.trim().slice(0, 24) });
  // 반응형 기본 검사: 가로 넘침, 14px 미만 글자, 24px 미만 터치 타깃
  const cw = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > cw) out.push({ where: 'page', a: 'horizontal overflow', b: '', ha: document.documentElement.scrollWidth, hb: cw, diff: 0, y: 0, text: '' });
  const small = [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12 && e.getBoundingClientRect().width && !e.closest('.sr,.paper'));
  if (small.length) out.push({ where: 'text < 12px', a: small.slice(0, 3).map(e => e.className).join(','), b: '', ha: small.length, hb: 0, diff: 0, y: 0, text: '' });
  const tiny = [...document.querySelectorAll('a,button')].filter(e => { const r = e.getBoundingClientRect(); return r.width && getComputedStyle(e).display !== 'none' && !e.closest('.sr,.skip,.row') && Math.min(r.width, r.height) < 24; });
  if (tiny.length) out.push({ where: 'target < 24px', a: tiny.slice(0, 3).map(e => e.textContent.trim().slice(0, 8)).join(','), b: '', ha: tiny.length, hb: 0, diff: 0, y: 0, text: '' });
  return out;
};

const results = [];
for (const path of paths) for (const w of WIDTHS) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: base + path });
  await sleep(1800);
  await cdp('Runtime.evaluate', { expression: `document.querySelectorAll('.map').forEach(m => m.classList.add('is-in'))` });
  const r = await cdp('Runtime.evaluate', { expression: `(${probe})()`, returnByValue: true });
  if (r.result.exceptionDetails) console.log('EXC', path, JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  const t = await cdp('Runtime.evaluate', { expression: 'document.title + " | " + document.querySelectorAll("body *").length', returnByValue: true });
  if (w === 1440) console.log('loaded', path, t.result.result.value);
  for (const x of r.result.result.value || []) results.push({ page: path, w, ...x });
  if (SHOT) {
    const { result: { value: h } } = (await cdp('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true })).result;
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
    await sleep(600);
    const shot = await cdp('Page.captureScreenshot', { format: 'png' });
    (await import('node:fs')).writeFileSync(join(SHOT, `${path.replace(/\W+/g, '_') || 'home'}-${w}.png`), Buffer.from(shot.result.data, 'base64'));
  }
}
ws.close(); edge.kill();
for (const r of results) console.log(`${r.page} @${r.w} y=${r.y}  ${r.where}\n   ${r.ha}px vs ${r.hb}px (차이 ${r.diff})  ${r.text}`);
console.log(`\n${results.length} mismatches`);
