// tools/ergo-audit.js — 인간공학 정량 측정. 로컬 미리보기에서:
//   cp tools/ergo-audit.js dist/_audit.js  →  브라우저 콘솔: (await import('/_audit.js')).audit(['/'], [375, 1440])
// 측정: 글자 크기·굵기, WCAG 대비, 한 줄 글자 수, 터치 타깃 크기·간격, 호버 전용 정보
const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const bgOf = (el, win) => { for (let e = el; e; e = e.parentElement) { const c = rgb(win.getComputedStyle(e).backgroundColor); if (c.length === 3 || c[3] > 0.9) return c.slice(0, 3); } return [16, 17, 19]; };

function measure(doc, win, w) {
  const vis = e => { const r = e.getBoundingClientRect(), s = win.getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0 && !e.closest('[aria-hidden="true"],.sr'); };
  const texts = [...doc.body.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && vis(e));
  const small = {}, lowC = [], light = [];
  for (const e of texts) {
    const s = win.getComputedStyle(e), px = parseFloat(s.fontSize), wt = +s.fontWeight;
    const key = `${Math.round(px)}px`; small[key] = (small[key] || 0) + 1;
    const cr = ratio(rgb(s.color).slice(0, 3), bgOf(e, win)), large = px >= 24 || (px >= 18.66 && wt >= 700);
    if (cr < (large ? 3 : 4.5)) lowC.push(`${e.className || e.tagName}:${cr.toFixed(1)}`);
    if (wt < 400) light.push(e.className || e.tagName);
  }
  // 한 줄 글자 수: 여러 줄인 문단만
  const lines = [];
  for (const e of doc.querySelectorAll('p, li, dd, h1, h2, .lead-line, td')) {
    if (!vis(e) || e.children.length > 3) continue;
    const r = doc.createRange(); r.selectNodeContents(e);
    const tops = new Set([...r.getClientRects()].map(x => Math.round(x.top)));
    const n = e.textContent.replace(/\s+/g, ' ').trim().length;
    if (tops.size > 1) lines.push({ el: e.className || e.tagName, cpl: Math.round(n / tops.size), px: parseFloat(win.getComputedStyle(e).fontSize), lh: (parseFloat(win.getComputedStyle(e).lineHeight) / parseFloat(win.getComputedStyle(e).fontSize)).toFixed(2) });
  }
  // 타깃: 크기와 가장 가까운 이웃 타깃까지 거리
  const ts = [...doc.querySelectorAll('a, button, [tabindex="0"], video[controls]')].filter(vis).map(e => ({ e, r: e.getBoundingClientRect() }));
  const tiny = [];
  for (const t of ts) {
    const { width: tw, height: th } = t.r;
    if (Math.min(tw, th) >= 44) continue;
    const cx = t.r.left + tw / 2, cy = t.r.top + th / 2;
    const near = Math.min(...ts.filter(o => o !== t).map(o => Math.hypot(Math.max(o.r.left - cx, 0, cx - o.r.right), Math.max(o.r.top - cy, 0, cy - o.r.bottom))));
    tiny.push(`${t.e.className || t.e.tagName}[${t.e.textContent.trim().slice(0, 10)}] ${Math.round(tw)}x${Math.round(th)} gap${Math.round(near)}`);
  }
  return { w, fontSizes: small, lowContrast: [...new Set(lowC)], lightWeight: [...new Set(light)], longLines: lines.filter(l => l.cpl > 45).map(l => `${l.el} ${l.cpl}자 ${l.px}px lh${l.lh}`), shortLh: lines.filter(l => l.lh < 1.5).map(l => `${l.el} lh${l.lh}`), targetsUnder44: tiny };
}

export async function audit(pages = ['/'], widths = [375, 1440]) {
  const out = [];
  for (const p of pages) for (const w of widths) {
    const f = document.createElement('iframe');
    f.style.cssText = `position:fixed;left:0;top:0;width:${w}px;height:900px;border:0;visibility:hidden`;
    f.src = p; document.body.append(f);
    await new Promise(r => (f.onload = r)); await new Promise(r => setTimeout(r, 400));
    f.contentDocument.querySelectorAll('.map').forEach(m => m.classList.add('is-in'));
    await new Promise(r => setTimeout(r, 1600));
    out.push({ page: p, ...measure(f.contentDocument, f.contentWindow, w) }); f.remove();
  }
  return out;
}
