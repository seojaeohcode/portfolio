// content/site.json -> dist/ (static HTML). Node stdlib only.
// v2 원칙: 화면마다 하나의 메시지. 홈은 그림·제목 한 줄·숫자만, 설명은 케이스 페이지로.
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
const range = p => `${fmt(p.start)} ~ ${fmt(p.end)}`;
const TIER = { 1: '상위 수상', 2: '수상', 3: '본선, 수료, 참가', x: '출시, 공개' };
const mark = t => `<i class="mk t${t}" aria-hidden="true"></i>`;
const mk = o => mark(o.kind === 'award' ? o.tier : 'x');
// 링크는 실제 주소일 때만. '#경로'는 코드 위치를 글자로 보여 준다
const link = (href, label, cls = '') => !href || href === '#' ? '' : href.startsWith('#') && href.length > 1 ? `<code class="${cls}">${esc(href.slice(1))}</code>` : `<a class="${cls}" href="${esc(href)}">${esc(label)}</a>`;

const P = site.projects;
const F = P.filter(p => p.featured);
const thumb = p => p.media && (p.media.thumb || (p.media.type === 'video' ? p.media.poster : p.media.src));
const outcomes = P.flatMap(p => (p.outcomes || []).map(o => ({ ...o, project: p })));
const isAward = o => o.kind === 'award' && o.tier <= 2;
const stats = { projects: P.length, awards: outcomes.filter(isAward).length, top: outcomes.filter(o => o.tier === 1).length };
const topAward = p => (p.outcomes || []).filter(o => o.kind === 'award').sort((a, b) => a.tier - b.tier)[0];
const awardsLine = p => (p.outcomes || []).map(o => `<span class="aw${o.kind === 'award' && o.tier === 1 ? ' is-top' : ''}">${mk(o)}${esc(o.title)} ${esc(o.prize)}</span>`).join('');

// ---------- 성과 지도 ----------
function outcomeMap() {
  const y0 = Math.min(...P.map(p => +p.start.slice(0, 4)));
  const y1 = today.getFullYear() + 1;
  const a = y0 * 12, span = y1 * 12 - a;
  const pct = s => (((ym(s) - a) + 0.5) / span * 100).toFixed(2);
  const rows = [...P].sort((p, q) => ym(q.start) - ym(p.start)); // 최근이 위
  const years = Array.from({ length: y1 - y0 }, (_, i) => y0 + i);
  return `
<figure class="map" aria-labelledby="map-cap">
  <figcaption id="map-cap" class="map-cap">
    <span class="legend">${[1, 2, 3, 'x'].map(t => `<span>${mark(t)}${TIER[t]}</span>`).join('')}</span>
  </figcaption>
  <div class="map-body">
  <div class="map-grid" aria-hidden="true">${years.map(y => `<span style="--x:${((y * 12 - a) / span * 100).toFixed(2)}%">${y}</span>`).join('')}</div>
  <ol class="map-rows">
${rows.map((p, i) => {
    const end = p.end || nowYM;
    const tops = (p.outcomes || []).filter(o => o.kind === 'award' && o.tier === 1);
    const last = Math.max(+pct(end), ...(p.outcomes || []).map(o => +pct(o.date)));
    const label = tops.length ? `<span class="row-top${last > 55 ? ' is-left' : ''}" style="--x:${last > 55 ? pct(p.start) : last}%">${tops.map(o => `${esc(o.title)} ${esc(o.prize)}`).join(', ')}</span>` : '';
    return `    <li class="row${p.featured ? ' is-featured' : ''}${p.end ? '' : ' is-open'}" style="--i:${rows.length - i}">
      <a href="${p.featured ? `work/${p.id}/` : `#r-${p.id}`}">
        <span class="row-name">${esc(p.name)}</span>
        <span class="row-track" style="--s:${pct(p.start)}%;--e:${pct(end)}%">
          <span class="row-bar"></span>
${(p.outcomes || []).map(o => `          <span class="row-mk" style="--x:${pct(o.date)}%">${mk(o)}</span>`).join('\n')}
          ${label}
        </span>
        <span class="sr">${esc(p.name)}, ${range(p)}${(p.outcomes || []).map(o => `, ${o.title} ${o.prize}`).join('')}</span>
      </a>
    </li>`;
  }).join('\n')}
  </ol>
  </div>
</figure>`;
}

// ---------- 공통 조각 ----------
const media = (p, base = '', cls = 'media') => {
  const m = p.media || {};
  if (m.type === 'video' && m.src) return `<video class="${cls}" src="${base}${esc(m.src)}" ${m.poster ? `poster="${base}${esc(m.poster)}"` : ''} muted loop playsinline controls preload="none" aria-label="${esc(m.alt)}"></video>`;
  if (m.src) return `<img class="${cls}" src="${base}${esc(m.src)}" alt="${esc(m.alt)}" loading="lazy" decoding="async">`;
  return `<div class="${cls} is-empty" role="img" aria-label="${esc(m.alt)}"></div>`;
};

// 숫자 네 칸: 대표 결과 1 + 설계 결정 3. 숫자가 먼저, 뜻은 짧게.
const numbers = (p, main = true) => `<ul class="nums n${p.decisions.length + (main ? 1 : 0)}">
    ${main ? `<li class="is-main"><b><s>${p.metric.before}</s>${p.metric.after}<small>${esc(p.metric.unit)}</small></b><span>${esc(p.metric.short || p.metric.label)}</span>${p.metric.basisShort ? `<em class="basis">${esc(p.metric.basisShort)}</em>` : ''}</li>` : ''}
${p.decisions.map(d => `    <li><b>${esc(d.effect)}</b><span>${esc(d.effectLabel)}</span><em>${esc(d.short || d.title)}</em></li>`).join('\n')}
  </ul>`;

// ---------- 홈 ----------
const chapter = (p, i) => `
<article class="chap" id="p-${p.id}">
  <a class="chap-media" href="work/${p.id}/" tabindex="-1" aria-hidden="true">${media(p)}</a>
  <div class="chap-text">
    <p class="chap-meta"><span class="no">0${i + 1}</span><b>${esc(p.name)}</b>${esc(p.kname)}<span>${range(p)}</span></p>
    <h3 class="chap-title"><a href="work/${p.id}/">${esc(p.insight || p.headline)}</a></h3>
    <p class="scene">${esc(p.scene)}</p>
    <p class="role"><span>직접 구현</span>${esc(p.role)} <small>${esc(p.team)} 팀</small></p>
    <p class="awards">${awardsLine(p)}</p>
  </div>
  ${numbers(p, false)}
</article>`;

function ledger() {
  const items = [...P.map(p => ({ date: p.end || nowYM, p })), ...(site.activities || []).map(a => ({ date: a.date, a }))]
    .sort((x, y) => ym(y.date) - ym(x.date));
  const byYear = items.reduce((g, x) => ((g[x.date.slice(0, 4)] ||= []).push(x), g), {});
  const cat = x => x.a ? 'act' : x.p.kind === '오픈소스' ? 'oss' : (x.p.outcomes || []).some(isAward) ? 'award' : 'etc';
  return `<div class="filter" role="group" aria-label="기록 분류" hidden>
    ${[['all', '전체'], ['award', '수상'], ['oss', '오픈소스'], ['act', '활동']].map(([k, l], i) => `<button type="button" data-f="${k}" aria-pressed="${i === 0}">${l}</button>`).join('')}
  </div>
  ${Object.keys(byYear).sort().reverse().map(y => `<section class="year"><h3>${y}</h3><ul>
${byYear[y].map(x => x.a
    ? `    <li data-c="act"><span class="l-name">${esc(x.a.title)}</span><span class="l-what">${esc(x.a.detail)}</span><span class="l-out"></span></li>`
    : `    <li data-c="${cat(x)}" id="r-${x.p.id}"><span class="l-name">${x.p.featured ? `<a href="work/${x.p.id}/">${esc(x.p.name)}</a>` : esc(x.p.name)}</span><span class="l-what">${esc(x.p.headline || x.p.summary)}</span><span class="l-out">${(x.p.outcomes || []).map(o => `<span>${mk(o)}${esc(o.prize)}</span>`).join('')}</span></li>`).join('\n')}
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
<meta name="theme-color" content="#0F1115">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-gov-dynamic-subset.min.css">
<link rel="stylesheet" href="https://hangeul.pstatic.net/hangeul_static/css/maru-buri.css">
<link rel="stylesheet" href="${base}styles.css">
<script>document.documentElement.classList.add('js')</script>
<script src="${base}app.js" defer></script>
</head>
<body>
<a class="skip" href="#main">본문으로 건너뛰기</a>
${body}
<footer class="site-foot wrap">
  <p><b>${esc(site.person.name)}</b> ${esc(site.person.affiliation)}</p>
  <p>${site.person.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</p>
</footer>
</body>
</html>
`;

const home = page({
  title: `${site.person.name} 포트폴리오`,
  desc: F.map(p => p.headline).join(' / '),
  base: '',
  body: `<header class="top wrap">
  <p class="to" hidden></p>
  <h1 class="name">${esc(site.person.name)}<span>${esc(site.person.field)}</span></h1>
  <p class="who"><span>${esc(site.person.affiliation)}</span><span>${esc(site.person.grad)}</span></p>
  <p class="stack"><span>주력</span>${(site.person.stack || []).map(x => `<b>${esc(x)}</b>`).join('')}</p>
</header>
<main id="main" tabindex="-1">
  <section class="hero wrap" aria-label="대표 작업 요약">
    <ol class="picks">
${F.map((p, i) => `      <li><a href="work/${p.id}/" data-i="${i}"${i ? '' : ' class="is-on"'}>
        <span class="pick-meta"><b>${esc(p.name)}</b>${esc(p.kname)}${topAward(p) ? `<span class="pick-aw">${mk(topAward(p))}${esc(topAward(p).title)} ${esc(topAward(p).prize)}</span>` : ''}</span>
        <span class="pick-line">${esc(p.headline)}</span>
        <span class="pick-role"><span>직접 구현</span>${esc(p.role)}</span>
        <span class="pick-num"><span class="what">${esc(p.metric.short || p.metric.label)}</span><b><s>${p.metric.before}</s>${p.metric.after}<small>${esc(p.metric.unit)}</small></b><span class="basis">${esc(p.metric.basisShort || '')}</span></span>
      </a></li>`).join('\n')}
    </ol>
    <div class="show-media" aria-hidden="true">${F.map((p, i) => thumb(p) ? `<img src="${esc(thumb(p))}" alt="" class="${i ? '' : 'is-on'}" data-i="${i}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>` : '').join('')}</div>
  </section>
  <section class="work wrap" aria-label="대표 작업">
    ${F.map(chapter).join('\n')}
  </section>
  <section class="record wrap" aria-labelledby="h-all">
    <h2 id="h-all" class="sec">지금까지 <small>프로젝트 ${stats.projects}, 수상 ${stats.awards}, 그중 상위 ${stats.top}</small></h2>
    ${outcomeMap()}
    ${ledger()}
  </section>
</main>`,
});

// ---------- 케이스 페이지 ----------
const casePage = p => {
  const c = p.case;
  const base = '../../';
  return page({
    title: `${p.name}, ${site.person.name}`,
    desc: p.headline,
    base,
    body: `<nav class="crumb wrap"><a href="${base}#p-${p.id}">${esc(site.person.name)}</a></nav>
<main class="case wrap" id="main" tabindex="-1">
  <header class="case-head">
    <p class="chap-meta"><b>${esc(p.name)}</b>${esc(p.kname)}<span>${range(p)}</span><span>${esc(p.status)}</span></p>
    <h1>${esc(p.headline)}</h1>
    <p class="role"><span>직접 구현</span>${esc(p.role)} <small>${esc(p.team)} 팀</small></p>
    <p class="scene">${esc(p.scene)}</p>
    <p class="awards">${awardsLine(p)}</p>
  </header>
  <div class="case-media">${media(p, base)}</div>
  ${numbers(p)}
  <p class="note">${esc(p.note)}</p>

  <section class="cs"><h2>문제와 제약</h2>
    <div class="two"><ul class="plain">${c.context.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <ul class="plain is-quiet">${c.constraints.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
  </section>
${c.flow ? `
  <section class="cs"><h2>도입 전과 후</h2>
    <div class="two ba">${['before', 'after'].map(k => `<ol class="${k}"><li class="ba-h">${k === 'before' ? '전' : '후'}</li>${c.flow[k].map(x => `<li>${esc(x)}</li>`).join('')}</ol>`).join('')}</div>
  </section>` : ''}
  <section class="cs"><h2>처리 구조와 내 작업</h2>
    <ol class="flow">${c.architecture.map(n => `<li class="${n.mine ? 'is-mine' : ''}"><p class="f-h"><b>${esc(n.name)}</b><span class="by" data-by="${esc(n.by)}">${esc(n.by)}</span></p><p>${esc(n.detail)}</p>${n.fallback ? `<p class="f-sub"><span>예외</span>${esc(n.fallback)}</p>` : ''}${n.myChange ? `<p class="f-sub is-me"><span>내 작업</span>${esc(n.myChange)}</p>` : ''}</li>`).join('')}</ol>
  </section>

  <section class="cs"><h2>설계 결정</h2>
    <ol class="dx">${p.decisions.map(d => `<li>
      <p class="dx-n"><b>${esc(d.effect)}</b><span>${esc(d.effectLabel)}</span></p>
      <div><h3>${esc(d.title)}</h3><p>${esc(d.why)}</p>${d.alt ? `<p class="f-sub"><span>버린 대안</span>${esc(d.alt)}. ${esc(d.altWhy)}</p>` : ''}${d.cost ? `<p class="f-sub"><span>감수한 것</span>${esc(d.cost)}</p>` : ''}${d.basis ? `<p class="f-sub"><span>측정</span>${esc(d.basis)}</p>` : ''}${link(d.code, '코드', 'code')}</div>
    </li>`).join('')}</ol>
  </section>

  <section class="cs"><h2>평가 조건과 결과</h2>
${c.setup ? `    <dl class="setup"><div><dt>가설</dt><dd>${esc(c.setup.hypothesis)}</dd></div><div><dt>데이터</dt><dd>${esc(c.setup.data)}</dd></div><div><dt>정답</dt><dd>${esc(c.setup.label)}</dd></div>${c.setup.repro ? `<div><dt>재현</dt><dd>${link(c.setup.repro, '재현 방법')}</dd></div>` : ''}</dl>` : ''}
    <table class="eval"><thead><tr><th scope="col">항목</th><th scope="col">기준선</th><th scope="col">변경 후</th><th scope="col">조건</th></tr></thead>
    <tbody>${c.evaluation.map(e => `<tr><th scope="row">${esc(e.item)}</th><td data-label="기준선" class="${e.baseline ? 'base' : 'none'}">${esc(e.baseline || '미측정')}</td><td data-label="변경 후" class="res">${esc(e.result || '미측정')}</td><td data-label="조건" class="cond">${esc(e.condition)}</td></tr>`).join('')}</tbody></table>
  </section>
${(c.failures || []).length ? `
  <section class="cs"><h2>안 된 것</h2>
    <ul class="fail">${c.failures.map(x => `<li><p class="f-h"><b>${esc(x.what)}</b><span class="st" data-st="${esc(x.status)}">${esc(x.status)}</span></p><p>${esc(x.fix)}${x.verify ? `. ${esc(x.verify)}` : ''}</p><p class="f-sub"><span>재현</span>${esc(x.repro)}</p></li>`).join('')}</ul>
  </section>` : ''}
  <section class="cs"><h2>내 담당과 팀 역할</h2>
    <div class="two">${c.roleSplit.map(r => `<div class="${r.who === '나' ? 'me' : 'team'}"><p class="ba-h">${esc(r.who)}</p><ul class="plain">${[].concat(r.what).map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>`).join('')}</div>
  </section>
${c.slides.length ? `
  <section class="cs" id="slides"><h2>발표자료</h2>
    <div class="deck" tabindex="0" aria-label="발표자료 ${c.slides.length}쪽, 좌우 방향키로 넘기기">${c.slides.map((s, i) => `<img src="${base}${esc(s)}" alt="발표자료 ${i + 1}쪽" loading="lazy">`).join('')}</div>
    <p class="deck-ctl" hidden><button type="button" data-d="-1" aria-label="이전 쪽">←</button><span class="deck-n">1 / ${c.slides.length}</span><button type="button" data-d="1" aria-label="다음 쪽">→</button></p>
  </section>` : ''}
  <section class="cs"><h2>다시 한다면</h2>
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
for (const p of F) {
  mkdirSync(join(out, 'work', p.id), { recursive: true });
  writeFileSync(join(out, 'work', p.id, 'index.html'), casePage(p));
}
writeFileSync(join(out, '.nojekyll'), '');
console.log(`built: 1 home + ${F.length} case pages`, stats);
