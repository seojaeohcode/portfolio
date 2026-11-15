// content/site.json -> dist/ (static HTML). Node stdlib only.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const site = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'));
const today = new Date();
const nowYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ym = s => { const [y, m] = s.split('-').map(Number); return y * 12 + (m - 1); };
const fmt = s => s ? s.replace('-', '.') : '진행 중';
const TIER = { 1: '상위 수상', 2: '수상', 3: '본선·수료·참가' };
const mark = t => `<i class="mk t${t}" aria-hidden="true"></i>`;

const P = site.projects;
const outcomes = P.flatMap(p => (p.outcomes || []).map(o => ({ ...o, project: p })));
const isAward = o => o.tier <= 2 && !String(o.prize).startsWith('★');
const stats = {
  projects: P.length,
  awards: outcomes.filter(isAward).length,
  top: outcomes.filter(o => o.tier === 1).length,
  years: Math.max(1, Math.round((ym(nowYM) - Math.min(...P.map(p => ym(p.start)))) / 12)),
};

// ---------- 성과 지도 ----------
function outcomeMap() {
  const y0 = Math.min(...P.map(p => +p.start.slice(0, 4)));
  const y1 = today.getFullYear() + 1;
  const a = y0 * 12, span = y1 * 12 - a;
  const pct = s => (((ym(s) - a) + 0.5) / span * 100).toFixed(2);
  const rows = [...P].sort((p, q) => ym(q.start) - ym(p.start)); // newest on top
  const years = Array.from({ length: y1 - y0 }, (_, i) => y0 + i);
  return `
<figure class="map" aria-labelledby="map-cap">
  <figcaption id="map-cap" class="map-cap">
    <span>성과 지도</span>
    <span class="legend">${[1, 2, 3].map(t => `<span>${mark(t)}${TIER[t]}</span>`).join('')}</span>
  </figcaption>
  <div class="map-grid" aria-hidden="true">${years.map(y => `<span style="--x:${((y * 12 - a) / span * 100).toFixed(2)}%">${y}</span>`).join('')}</div>
  <ol class="map-rows">
${rows.map((p, i) => {
    const end = p.end || nowYM;
    const tops = (p.outcomes || []).filter(o => o.tier === 1);
    const last = Math.max(+pct(end), ...(p.outcomes || []).map(o => +pct(o.date)));
    // 상위 수상 이름은 항상 표시: 오른쪽 공간이 부족하면 선의 왼쪽에 붙인다
    const label = tops.length ? (last > 55
      ? `<span class="row-top is-left" style="--x:${pct(p.start)}%">${tops.map(o => `${esc(o.title)} ${esc(o.prize)}`).join(' · ')}</span>`
      : `<span class="row-top" style="--x:${last}%">${tops.map(o => `${esc(o.title)} ${esc(o.prize)}`).join(' · ')}</span>`) : '';
    return `    <li class="row${p.featured ? ' is-featured' : ''}${p.end ? '' : ' is-open'}" style="--i:${rows.length - i}">
      <a href="${p.featured ? `#p-${p.id}` : `#r-${p.id}`}">
        <span class="row-name">${esc(p.name)}</span>
        <span class="row-track" style="--s:${pct(p.start)}%;--e:${pct(end)}%">
          <span class="row-bar"></span>
${(p.outcomes || []).map(o => `          <span class="row-mk" style="--x:${pct(o.date)}%">${mark(o.tier)}${o.tier === 1 ? '' : `<span class="row-tip">${esc(o.title)} ${esc(o.prize)}</span>`}</span>`).join('\n')}
          ${label}
        </span>
        <span class="sr">${esc(p.name)}, ${fmt(p.start)}–${fmt(p.end)}${(p.outcomes || []).map(o => `, ${o.title} ${o.prize}`).join('')}</span>
      </a>
    </li>`;
  }).join('\n')}
  </ol>
</figure>`;
}

// ---------- 공통 조각 ----------
const logo = p => p.logo
  ? `<img class="logo" src="${esc(p.logo)}" alt="" width="40" height="40">`
  : `<span class="logo" aria-hidden="true">${esc(p.name[0])}</span>`;

const metric = (m, big = true) => {
  const max = Math.max(m.before, m.after);
  return `<div class="metric${big ? '' : ' is-small'}">
    <p class="metric-label">${esc(m.label)}</p>
    <div class="metric-row is-before"><span class="metric-k">${esc(m.beforeLabel)}</span><span class="metric-bar"><i style="--w:${(m.before / max * 100).toFixed(1)}%"></i></span><span class="metric-v">${m.before}<small>${esc(m.unit)}</small></span></div>
    <div class="metric-row is-after"><span class="metric-k">${esc(m.afterLabel)}</span><span class="metric-bar"><i style="--w:${(m.after / max * 100).toFixed(1)}%"></i></span><span class="metric-v">${m.after}<small>${esc(m.unit)}</small></span></div>
  </div>`;
};

const media = (p, base = '') => {
  const m = p.media || {};
  if (m.type === 'video' && m.src) return `<video class="media" src="${base}${esc(m.src)}" ${m.poster ? `poster="${base}${esc(m.poster)}"` : ''} muted loop playsinline preload="none" aria-label="${esc(m.alt)}"></video>`;
  if (m.src) return `<img class="media" src="${base}${esc(m.src)}" alt="${esc(m.alt)}" loading="lazy" decoding="async">`;
  return `<div class="media is-empty" role="img" aria-label="${esc(m.alt)}"><span>${esc(p.name)}</span></div>`;
};

const decisions = p => `<ol class="decisions">
${p.decisions.map(d => `    <li><p class="d-effect"><b>${esc(d.effect)}</b><span>${esc(d.effectLabel)}</span></p><h4>${esc(d.title)}</h4><p class="d-why">${esc(d.why)}</p></li>`).join('\n')}
  </ol>`;

const chips = p => (p.outcomes || []).length ? `<ul class="chips">${p.outcomes.map(o => `<li${o.host ? ` title="${esc(o.host)}"` : ''}>${mark(o.tier)}<span>${fmt(o.date)} ${esc(o.title)}</span> <b>${esc(o.prize)}</b></li>`).join('')}</ul>` : '';

// ---------- 대표 작업 ----------
const strip = p => `
<article class="strip" id="p-${p.id}">
  <header class="strip-head">
    ${logo(p)}
    <div><h3>${esc(p.name)}</h3><p class="meta">${fmt(p.start)}–${fmt(p.end)} · ${esc(p.team)} · 내 담당 ${esc(p.role)}</p></div>
    ${chips(p)}
  </header>
  <p class="status">${esc(p.status)}</p>
  <div class="strip-body">
    <div class="strip-text">
      <p class="scene">${esc(p.scene)}</p>
      <p class="summary">${esc(p.summary)}</p>
      ${metric(p.metric)}
    </div>
    <div class="strip-media">${media(p)}</div>
  </div>
  ${decisions(p)}
  <footer class="strip-foot">
    <p class="note">${esc(p.note)}</p>
    <p class="links"><a class="go" href="work/${p.id}/">${esc(p.hook)}</a>${(p.links || []).map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</p>
  </footer>
</article>`;

// ---------- 전체 기록 ----------
function ledger() {
  const items = [
    ...P.map(p => ({ date: p.end || nowYM, p })),
    ...(site.activities || []).map(a => ({ date: a.date, a })),
  ].sort((x, y) => ym(y.date) - ym(x.date));
  const byYear = Object.groupBy ? Object.groupBy(items, x => x.date.slice(0, 4)) : items.reduce((g, x) => ((g[x.date.slice(0, 4)] ||= []).push(x), g), {});
  const cat = x => x.a ? 'act' : x.p.kind === '오픈소스' ? 'oss' : (x.p.outcomes || []).some(isAward) ? 'award' : 'etc';
  return `<div class="filter" role="group" aria-label="기록 분류" hidden>
    ${[['all', '전체'], ['award', '수상'], ['oss', '오픈소스'], ['act', '활동']].map(([k, l], i) => `<button type="button" data-f="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}
  </div>
  ${Object.keys(byYear).sort().reverse().map(y => `<section class="year"><h3>${y}</h3><ul>
${byYear[y].map(x => x.a
    ? `    <li data-c="act"><span class="l-date">${fmt(x.a.date)}</span><span class="l-name">${esc(x.a.title)}</span><span class="l-what">${esc(x.a.detail)}</span><span class="l-out"></span></li>`
    : `    <li data-c="${cat(x)}" id="r-${x.p.id}"><span class="l-date">${fmt(x.p.start)}–${fmt(x.p.end)}</span><span class="l-name">${x.p.featured ? `<a href="work/${x.p.id}/">${esc(x.p.name)}</a>` : esc(x.p.name)}</span><span class="l-what">${esc(x.p.summary)}<em>${esc(x.p.role)}</em></span><span class="l-out">${(x.p.outcomes || []).map(o => `<span>${mark(o.tier)}${esc(o.prize)}</span>`).join('')}</span></li>`).join('\n')}
  </ul></section>`).join('\n')}`;
}

// ---------- 페이지 틀 ----------
const page = ({ title, desc, base, body }) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#101113">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://hangeul.pstatic.net/hangeul_static/css/maru-buri.css">
<link rel="stylesheet" href="${base}styles.css">
<script>document.documentElement.classList.add('js')</script>
<script src="${base}app.js" defer></script>
</head>
<body>
${body}
<footer class="site-foot wrap">
  <p>${esc(site.person.name)} · ${esc(site.person.affiliation)}</p>
  <p>${site.person.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}<span>${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')} 갱신</span></p>
</footer>
</body>
</html>
`;

const home = page({
  title: `${site.person.name} — 포트폴리오`,
  desc: site.person.thesis,
  base: '',
  body: `<header class="hero wrap">
  <p class="to" hidden></p>
  <p class="who">${esc(site.person.name)}<span>${esc(site.person.field)}</span><span>${esc(site.person.affiliation)} · ${esc(site.person.grad)}</span></p>
  <h1>${esc(site.person.thesis)}</h1>
  <dl class="stats">
    <div><dt>상위 수상</dt><dd>${stats.top}</dd></div>
    <div><dt>수상</dt><dd>${stats.awards}</dd></div>
  </dl>
  ${outcomeMap()}
</header>
<main>
  <section class="wrap" aria-labelledby="h-work">
    <h2 id="h-work" class="sec">대표 작업</h2>
    ${P.filter(p => p.featured).map(strip).join('\n')}
  </section>
  <section class="wrap ledger" aria-labelledby="h-all">
    <h2 id="h-all" class="sec">전체 기록</h2>
    ${ledger()}
  </section>
</main>`,
});

const casePage = p => {
  const c = p.case;
  const base = '../../';
  return page({
    title: `${p.name} — ${site.person.name}`,
    desc: p.summary,
    base,
    body: `<nav class="crumb wrap"><a href="${base}#p-${p.id}">← ${esc(site.person.name)}</a></nav>
<main class="case wrap">
  <header class="case-head">
    ${logo(p)}
    <h1>${esc(p.name)}</h1>
    <p class="meta">${fmt(p.start)}–${fmt(p.end)} · ${esc(p.team)} · 내 담당 ${esc(p.role)} · ${esc(p.status)}</p>
    ${chips(p)}
  </header>
  <p class="scene is-lead">${esc(p.scene)}</p>
  <div class="case-top">
    <div><p class="summary">${esc(p.summary)}</p>${metric(p.metric)}<p class="note">${esc(p.note)}</p></div>
    <div>${media(p, base)}</div>
  </div>

  <section class="case-sec"><h2>현장과 제약</h2>
    <div class="two"><ul class="plain">${c.context.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <ul class="tags">${c.constraints.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
  </section>

${c.flow ? `
  <section class="case-sec"><h2>도입 전과 후</h2>
    <div class="ba">${['before', 'after'].map(k => `<div class="ba-${k}"><p>${k === 'before' ? '전' : '후'}</p><ol>${c.flow[k].map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>`).join('')}</div>
  </section>` : ''}
  <section class="case-sec"><h2>구조 <span class="by-key">${['AI', '규칙', '사람'].map(b => `<i class="by" data-by="${b}">${b}</i>`).join('')}</span></h2>
    <ol class="flow">${c.architecture.map(n => `<li><b>${esc(n.name)}</b><i class="by" data-by="${esc(n.by)}">${esc(n.by)}</i><span>${esc(n.detail)}</span></li>`).join('')}</ol>
  </section>

  <section class="case-sec"><h2>설계 결정과 효과</h2>
    <ol class="dx">${p.decisions.map(d => `<li>
      <p class="d-effect"><b>${esc(d.effect)}</b><span>${esc(d.effectLabel)}</span></p>
      <h3>${esc(d.title)}</h3>
      <dl>${d.alt ? `<div><dt>버린 대안</dt><dd>${esc(d.alt)} — ${esc(d.altWhy)}</dd></div>` : ''}<div><dt>이유</dt><dd>${esc(d.why)}</dd></div>${d.cost ? `<div><dt>감수한 것</dt><dd>${esc(d.cost)}</dd></div>` : ''}</dl>
      ${d.code ? `<a class="code" href="${esc(d.code)}">코드 보기</a>` : ''}
    </li>`).join('')}</ol>
  </section>

  <section class="case-sec"><h2>검증</h2>
    <table class="eval"><thead><tr><th scope="col">항목</th><th scope="col">결과</th><th scope="col">조건</th></tr></thead>
    <tbody>${c.evaluation.map(e => `<tr><th scope="row">${esc(e.item)}</th><td>${esc(e.value)}</td><td>${esc(e.condition)}</td></tr>`).join('')}</tbody></table>
  </section>
${(c.failures || []).length ? `
  <section class="case-sec"><h2>안 된 것</h2>
    <ul class="fail">${c.failures.map(x => `<li><b>${esc(x.what)}</b><span>${esc(x.why)}</span><span>→ ${esc(x.next)}</span></li>`).join('')}</ul>
  </section>` : ''}

  <section class="case-sec"><h2>역할</h2>
    <div class="split">${c.roleSplit.map(r => `<span class="${r.who === '나' ? 'me' : ''}" style="--w:${r.share}%"><b>${esc(r.who)} ${r.share}%</b>${esc(r.what)}</span>`).join('')}</div>
  </section>
${c.slides.length ? `
  <section class="case-sec" id="slides"><h2>발표자료</h2>
    <div class="deck" tabindex="0" aria-label="발표자료 ${c.slides.length}쪽, 좌우로 넘기기">${c.slides.map((s, i) => `<img src="${base}${esc(s)}" alt="발표자료 ${i + 1}쪽" loading="lazy">`).join('')}</div>
    <p class="deck-ctl" hidden><button type="button" data-d="-1" aria-label="이전 쪽">←</button><span class="deck-n">1 / ${c.slides.length}</span><button type="button" data-d="1" aria-label="다음 쪽">→</button></p>
  </section>` : ''}
  <section class="case-sec"><h2>다시 한다면</h2>
    <ul class="retro">${c.retro.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  </section>
</main>`,
  });
};

// shortcut: fs.cpSync segfaults on non-ASCII Windows paths (Node 22); swap back once fixed upstream.
const copy = (from, to) => {
  mkdirSync(to, { recursive: true });
  for (const d of readdirSync(from, { withFileTypes: true }))
    d.isDirectory() ? copy(join(from, d.name), join(to, d.name)) : copyFileSync(join(from, d.name), join(to, d.name));
};
rmSync(out, { recursive: true, force: true });
copy(join(root, 'src'), out);
copy(join(root, 'assets'), join(out, 'assets'));
writeFileSync(join(out, 'index.html'), home);
for (const p of P.filter(p => p.featured)) {
  mkdirSync(join(out, 'work', p.id), { recursive: true });
  writeFileSync(join(out, 'work', p.id, 'index.html'), casePage(p));
}
writeFileSync(join(out, '.nojekyll'), '');
console.log(`built: 1 home + ${P.filter(p => p.featured).length} case pages · stats`, stats);
