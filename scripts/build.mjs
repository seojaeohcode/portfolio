// content/site.json -> dist/ (static HTML). Node stdlib only.
// v3: 프로젝트 하나를 끝까지 이해시키는 카드를 같은 틀로 반복한다. 근거는 docs/research/SYNTHESIS.md
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
const outcomes = P.flatMap(p => (p.outcomes || []).map(o => ({ ...o, project: p })));
const isAward = o => o.kind === 'award' && o.tier <= 2;
const stats = { projects: P.length, awards: outcomes.filter(isAward).length, top: outcomes.filter(o => o.tier === 1).length };
const no = i => String(i + 1).padStart(2, '0');

// ---------- 성과 지도 ----------
function outcomeMap() {
  const y0 = Math.min(...P.map(p => +p.start.slice(0, 4)));
  const y1 = today.getFullYear() + 1;
  const a = y0 * 12, span = y1 * 12 - a;
  const pct = s => (((ym(s) - a) + 0.5) / span * 100).toFixed(2);
  const rows = [...P].sort((p, q) => ym(q.start) - ym(p.start));
  const years = Array.from({ length: y1 - y0 }, (_, i) => y0 + i);
  return `
<figure class="map" aria-labelledby="map-cap">
  <figcaption id="map-cap" class="legend">${[1, 2, 3, 'x'].map(t => `<span>${mark(t)}${TIER[t]}</span>`).join('')}</figcaption>
  <div class="map-body">
  <div class="map-grid" aria-hidden="true">${years.map(y => `<span style="--x:${((y * 12 - a) / span * 100).toFixed(2)}%">${y}</span>`).join('')}</div>
  <ol class="map-rows">
${rows.map((p, i) => {
    const end = p.end || nowYM;
    const tops = (p.outcomes || []).filter(o => o.kind === 'award' && o.tier === 1);
    const last = Math.max(+pct(end), ...(p.outcomes || []).map(o => +pct(o.date)));
    const label = tops.length ? `<span class="row-top${last > 55 ? ' is-left' : ''}" style="--x:${last > 55 ? pct(p.start) : last}%">${tops.map(o => `${esc(o.title)} ${esc(o.prize)}`).join(', ')}</span>` : '';
    return `    <li class="row${p.featured ? ' is-featured' : ''}${p.end ? '' : ' is-open'}" style="--i:${rows.length - i}">
      <a href="${p.featured ? `#p-${p.id}` : `#r-${p.id}`}">
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

// ---------- 조각 ----------
const media = (p, base = '') => {
  const m = p.media || {};
  if (m.type === 'video' && m.src) return `<video class="media" src="${base}${esc(m.src)}" ${m.poster ? `poster="${base}${esc(m.poster)}"` : ''} muted loop playsinline preload="none" aria-label="${esc(m.alt)}"></video><button class="vbtn" type="button" aria-label="시연 영상 일시정지" hidden>일시정지</button>`;
  if (m.src) return `<img class="media" src="${base}${esc(m.src)}" alt="${esc(m.alt)}" loading="lazy" decoding="async">`;
  return `<div class="media is-empty" role="img" aria-label="${esc(m.alt)}"></div>`;
};

// 대표 지표: 이름 → 전·후 같은 축 막대 → 측정 조건 (숫자 옆 조건 100%)
const metric = m => {
  const max = Math.max(m.before, m.after) || 1;
  return `<div class="metric">
      <p class="m-name">${esc(m.label)}<span>${m.better === 'lower' ? '적을수록 좋음' : '높을수록 좋음'}</span></p>
      <p class="m-val"><span class="m-before">${m.before}${esc(m.unit)}</span><span class="m-arrow" aria-hidden="true">→</span><b>${m.after}<small>${esc(m.unit)}</small></b></p>
      <div class="m-bars" aria-hidden="true"><i style="--w:${(m.before / max * 100).toFixed(1)}%"></i><i class="is-after" style="--w:${(m.after / max * 100).toFixed(1)}%"></i></div>
      <p class="m-set">${esc(m.set || '')}</p>
      <p class="m-basis">${esc(m.def || `${m.beforeLabel} 대비 ${m.afterLabel}`)}</p>
    </div>`;
};

const awards = p => (p.outcomes || []).length ? `<ul class="awards">${p.outcomes.map(o => `<li class="${o.kind === 'award' && o.tier === 1 ? 'is-top' : ''}">${mk(o)}<span class="a-date">${fmt(o.date)}</span><span>${esc(o.title)} <b>${esc(o.prize)}</b>${o.rank ? ` (${esc(o.rank)})` : ''}${o.host ? ` <small>${esc(o.host)}</small>` : ''}</span></li>`).join('')}</ul>` : '';

const impacts = (p, base = '') => `<div class="impact">
    <h3>기술 선택이 바꾼 것</h3>
    <ol>${p.decisions.map(d => `<li><p class="i-n"><b>${esc(d.effect)}</b><span>${esc(d.effectLabel)}</span></p><p class="i-d"><b>${esc(d.title)}</b><span>${esc(d.why)}</span></p>${d.basis ? `<p class="i-b">측정: ${esc(d.basis)}</p>` : ''}</li>`).join('')}</ol>
  </div>`;

const roleBlock = p => {
  const rs = (p.case && p.case.roleSplit) || [];
  const me = rs.find(r => r.who === '나'), team = rs.find(r => r.who !== '나');
  return `<dl class="p-role"><div><dt>내가 만든 것</dt><dd>${esc([].concat(me ? me.what : p.role).join(', '))}</dd></div>${team ? `<div><dt>팀이 한 것</dt><dd>${esc([].concat(team.what).join(', '))}</dd></div>` : ''}</dl>`;
};

// ---------- 프로젝트 카드 (같은 틀 ×3) ----------
const card = (p, i) => `
<article class="proj" id="p-${p.id}" aria-labelledby="t-${p.id}">
  <div class="p-text">
    <p class="p-meta"><span class="no">${no(i)}</span><b>${esc(p.name)}</b><span>${esc(p.kname)}</span></p>
    <p class="p-sub">${range(p)}<span>${esc(p.team)} 팀</span><span>${esc(p.status)}</span></p>
    <h2 class="p-title" id="t-${p.id}">${esc(p.headline)}</h2>
    <p class="scene">${esc(p.scene)}</p>
    ${metric(p.metric)}
    ${roleBlock(p)}
    ${awards(p)}
  </div>
  <figure class="p-media"><div class="vwrap">${media(p)}</div>${p.media && p.media.caption ? `<figcaption>${esc(p.media.caption)}</figcaption>` : ''}</figure>
  ${impacts(p)}
  <p class="p-links"><a class="go" href="work/${p.id}/">${esc(p.more || '설계·평가 상세')}<small>상세 페이지</small></a>${p.case && p.case.slides.length ? `<a href="work/${p.id}/#slides">발표자료 ${p.case.slides.length}쪽 웹으로 보기</a>` : ''}${(p.links || []).map(l => link(l.href, l.label)).join('')}</p>
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
    : `    <li data-c="${cat(x)}" id="r-${x.p.id}"><span class="l-name">${x.p.featured ? `<a href="#p-${x.p.id}">${esc(x.p.name)}</a>` : esc(x.p.name)}</span><span class="l-what">${esc(x.p.kname || x.p.summary)}<small>${range(x.p)}</small></span><span class="l-out">${(x.p.outcomes || []).map(o => `<span>${mk(o)}${esc(o.prize)}</span>`).join('')}</span></li>`).join('\n')}
  </ul></section>`).join('\n')}`;
}

// ---------- 페이지 틀 ----------
const page = ({ title, desc, base, body, cls = '' }) => `<!doctype html>
<html lang="ko"${cls ? ` class="${cls}"` : ''}>
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
</body>
</html>
`;

const links = (base = '') => `<p class="links">${site.person.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}<a href="${base}resume.pdf">PDF 이력서</a></p>`;
const bar = (base = '') => `<header class="bar wrap">${base ? `<a class="bar-name" href="${base}">${esc(site.person.name)}</a>` : '<span></span>'}${links(base)}</header>`;
const foot = (base = '') => `<footer class="site-foot wrap"><p><b>${esc(site.person.name)}</b>${esc(site.person.affiliation)}</p>${links(base)}</footer>`;

const home = page({
  title: `${site.person.name} 포트폴리오`,
  desc: `${site.person.field}. ${F.map(p => p.headline).join(' / ')}`,
  base: '',
  body: `${bar()}
<main id="main" tabindex="-1">
  <section class="id wrap" aria-label="소개">
    <p class="to" hidden></p>
    <h1>${esc(site.person.name)}<span>${esc(site.person.field)}</span></h1>
    <p class="who"><span>${esc(site.person.affiliation)}</span><span>${esc(site.person.grad)}</span></p>
    <p class="stack"><span>주력</span>${(site.person.stack || []).map(x => `<b>${esc(x)}</b>`).join('')}</p>
    <nav class="toc" aria-label="대표 작업 목차"><span>대표 작업 ${F.length}</span>${F.map((p, i) => `<a href="#p-${p.id}"><b>${no(i)}</b>${esc(p.name)}<small>${esc(p.metric.short || p.metric.label)} ${p.metric.after}${esc(p.metric.unit)}</small></a>`).join('')}</nav>
  </section>
  <div class="work wrap">
    ${F.map(card).join('\n')}
  </div>
  <section class="record wrap" aria-labelledby="h-all">
    <h2 id="h-all" class="sec">전체 기록<small>프로젝트 ${stats.projects}, 수상 ${stats.awards}, 그중 상위 ${stats.top}</small></h2>
    ${outcomeMap()}
    ${ledger()}
  </section>
</main>
${foot()}`,
});

// ---------- 케이스 페이지: 제목에 판단이 보이게 ----------
const casePage = p => {
  const c = p.case, base = '../../';
  return page({
    title: `${p.name}, ${site.person.name}`,
    desc: p.headline,
    base,
    body: `${bar(base)}
<main class="case wrap" id="main" tabindex="-1">
  <nav class="crumb"><a href="${base}#p-${p.id}">대표 작업으로 돌아가기</a></nav>
  <header class="case-head">
    <p class="p-meta"><b>${esc(p.name)}</b><span>${esc(p.kname)}</span></p>
    <p class="p-sub">${range(p)}<span>${esc(p.team)} 팀</span><span>${esc(p.status)}</span></p>
    <h1>${esc(p.headline)}</h1>
    ${roleBlock(p)}
  </header>
  <figure class="case-media"><div class="vwrap">${media(p, base)}</div>${p.media && p.media.caption ? `<figcaption>${esc(p.media.caption)}</figcaption>` : ''}</figure>

  <section class="cs"><h2>무엇이 문제였나</h2>
    <p class="scene">${esc(p.scene)}</p>
    <div class="two"><ul class="plain">${c.context.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <div><p class="lbl">지켜야 했던 제약</p><ul class="plain">${c.constraints.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
  </section>
${c.flow ? `
  <section class="cs"><h2>현장에서 무엇이 달라졌나</h2>
    <div class="two ba">${['before', 'after'].map(k => `<div class="${k}"><p class="lbl">${k === 'before' ? '도입 전' : '도입 후'}</p><ol>${c.flow[k].map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>`).join('')}</div>
  </section>` : ''}
  <section class="cs"><h2>어디를 AI에 맡기고, 어디를 내가 만들었나</h2>
    <ol class="flow">${c.architecture.map((n, i) => `<li class="${n.mine ? 'is-mine' : ''}"><p class="f-h"><span class="f-no">${i + 1}</span><b>${esc(n.name)}</b><span class="by" data-by="${esc(n.by)}">${esc(n.by)}</span></p><p>${esc(n.detail)}</p>${n.fallback ? `<p class="f-sub"><span>예외</span>${esc(n.fallback)}</p>` : ''}${n.myChange ? `<p class="f-sub is-me"><span>내 작업</span>${esc(n.myChange)}</p>` : ''}</li>`).join('')}</ol>
  </section>

  <section class="cs"><h2>내가 내린 결정과 버린 대안</h2>
    <ol class="dx">${p.decisions.map(d => `<li>
      <p class="i-n"><b>${esc(d.effect)}</b><span>${esc(d.effectLabel)}</span></p>
      <div><h3>${esc(d.title)}</h3><p>${esc(d.why)}</p>${d.alt ? `<p class="f-sub"><span>버린 대안</span>${esc(d.alt)}. ${esc(d.altWhy)}</p>` : ''}${d.cost ? `<p class="f-sub"><span>감수한 것</span>${esc(d.cost)}</p>` : ''}${d.basis ? `<p class="f-sub"><span>측정</span>${esc(d.basis)}</p>` : ''}${d.code && d.code !== '#' ? `<p class="f-sub"><span>구현 코드</span>${esc(d.codeLabel || d.title)} ${link(d.code, '열기', 'code')}</p>` : ''}</div>
    </li>`).join('')}</ol>
  </section>

  <section class="cs"><h2>${esc(p.metric.label)} ${p.metric.after}${esc(p.metric.unit)}는 이렇게 쟀습니다</h2>
${c.setup ? `    <dl class="setup"><div><dt>가설</dt><dd>${esc(c.setup.hypothesis)}</dd></div><div><dt>데이터</dt><dd>${esc(c.setup.data)}</dd></div>${c.setup.split ? `<div><dt>분리</dt><dd>${esc(c.setup.split)}</dd></div>` : ''}${c.setup.unit ? `<div><dt>평가 단위</dt><dd>${esc(c.setup.unit)}</dd></div>` : ''}<div><dt>정답</dt><dd>${esc(c.setup.label)}</dd></div>${c.setup.repro ? `<div><dt>재현</dt><dd>${link(c.setup.repro, '재현 방법')}</dd></div>` : ''}</dl>` : ''}
${c.ablation ? `    <h3 class="ab-h">무엇이 얼마나 기여했나 <small>같은 평가셋에서 하나씩 더함</small></h3>
    <ol class="ab">${c.ablation.map((a, i) => `<li><span>${esc(a.change)}</span><i style="--w:${parseFloat(a.value)}%"></i><b>${esc(a.value)}</b></li>`).join('')}</ol>` : ''}
    <table class="eval"><thead><tr><th scope="col">항목</th><th scope="col">이전</th><th scope="col">이후</th><th scope="col">조건</th></tr></thead>
    <tbody>${c.evaluation.map(e => `<tr><th scope="row">${esc(e.item)}</th><td data-label="이전" class="${e.baseline ? 'base' : 'none'}">${esc(e.baseline || '미측정')}</td><td data-label="이후" class="res">${esc(e.result || '미측정')}</td><td data-label="조건" class="cond">${esc(e.condition)}</td></tr>`).join('')}</tbody></table>
  </section>
${(c.failures || []).length ? `
  <section class="cs"><h2>안 된 것과 고친 것</h2>
    <ul class="fail">${c.failures.map(x => `<li><p class="f-h"><b>${esc(x.what)}</b><span class="st" data-st="${esc(x.status)}">${esc(x.status)}</span></p>${x.cause ? `<p class="f-sub"><span>원인</span>${esc(x.cause)}</p>` : ''}<p class="f-sub"><span>증상</span>${esc(x.repro)}</p><p class="f-sub"><span>조치</span>${esc(x.fix)}</p><p class="f-sub"><span>검증</span>${esc(x.verify || '미검증')}</p></li>`).join('')}</ul>
  </section>` : ''}
  <section class="cs"><h2>팀에서 내가 맡은 범위</h2>
    <div class="two">${c.roleSplit.map(r => `<div class="${r.who === '나' ? 'me' : 'team'}"><p class="lbl">${r.who === '나' ? '내가 한 일' : '팀이 한 일'}</p><ul class="plain">${[].concat(r.what).map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>`).join('')}</div>
  </section>
${c.slides.length ? `
  <section class="cs" id="slides"><h2>발표자료 ${c.slides.length}쪽</h2>
    <div class="deck" tabindex="0" aria-label="발표자료 ${c.slides.length}쪽, 좌우 방향키로 넘기기">${c.slides.map((s, i) => `<img src="${base}${esc(s)}" alt="발표자료 ${i + 1}쪽" loading="lazy">`).join('')}</div>
    <p class="deck-ctl" hidden><button type="button" data-d="-1" aria-label="이전 쪽">←</button><span class="deck-n">1 / ${c.slides.length}</span><button type="button" data-d="1" aria-label="다음 쪽">→</button></p>
  </section>` : ''}
  <section class="cs"><h2>다시 한다면</h2>
    <ul class="retro">${c.retro.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  </section>
</main>
${foot(base)}`,
  });
};

// ---------- PDF 이력서 원본 (/resume/) : 밝은 A4, 웹과 같은 데이터 ----------
const resume = page({
  title: `${site.person.name} 이력서`,
  desc: site.person.field,
  base: '../',
  cls: 'paper',
  body: `<main class="cv" id="main">
  <header class="cv-head"><h1>${esc(site.person.name)}<span>${esc(site.person.field)}</span></h1>
    <p>${esc(site.person.affiliation)}, ${esc(site.person.grad)}</p>
    <p>${[site.person.site, ...site.person.links.map(l => l.href.replace('mailto:', ''))].filter(Boolean).map(esc).join('  |  ')}</p>
    <p class="stack"><span>주력</span>${(site.person.stack || []).map(x => `<b>${esc(x)}</b>`).join('')}</p></header>
  <section><h2>대표 프로젝트</h2>
  ${F.map(p => `<article class="cv-p"><p class="cv-t"><b>${esc(p.name)}</b> ${esc(p.kname)}<span>${range(p)}, ${esc(p.team)} 팀</span></p>
    <p class="cv-h">${esc(p.headline)}</p>
    <ul><li><b>역할</b> ${esc([].concat(((p.case && p.case.roleSplit) || []).find(r => r.who === '나')?.what || p.role).join(', '))}</li><li><b>결과</b> ${esc(p.metric.label)} ${p.metric.before}${esc(p.metric.unit)} → ${p.metric.after}${esc(p.metric.unit)} <span class="cv-n">${esc(p.metric.set || '')}</span></li><li><b>결정</b> ${p.decisions.map(d => `${esc(d.title)} (${esc(d.effectLabel)} ${esc(d.effect)})`).join(', ')}</li>${(p.outcomes || []).length ? `<li><b>수상</b> ${p.outcomes.map(o => `${fmt(o.date)} ${esc(o.title)} ${esc(o.prize)}${o.rank ? ` (${esc(o.rank)})` : ''}`).join(', ')}</li>` : ''}</ul></article>`).join('')}
  </section>
  <section><h2>전체 기록</h2><table class="cv-l">${[...P].sort((a, b) => ym(b.start) - ym(a.start)).map(p => `<tr><td>${range(p)}</td><td><b>${esc(p.name)}</b> ${esc(p.kname || p.summary)}</td><td>${(p.outcomes || []).map(o => esc(o.prize)).join(', ')}</td></tr>`).join('')}</table></section>
</main>`,
});

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
mkdirSync(join(out, 'resume'), { recursive: true });
writeFileSync(join(out, 'resume', 'index.html'), resume);
for (const p of F) {
  mkdirSync(join(out, 'work', p.id), { recursive: true });
  writeFileSync(join(out, 'work', p.id, 'index.html'), casePage(p));
}
writeFileSync(join(out, '.nojekyll'), '');
console.log(`built: home + resume + ${F.length} case pages`, stats);
