// content/site.json -> dist/ (static HTML). Node stdlib only.
// v6: 첫 화면 = 목록 + 시연 무대, 아래 = 프로젝트 장(설계 -> 기능), 전체 기록 격자. 근거는 docs/research/SYNTHESIS.md
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

// ---------- 전체 기록: 프로젝트 × 월 격자 (잔디처럼 한눈에, 메달은 수상한 달) ----------
function grid() {
  const y0 = Math.min(...P.map(p => +p.start.slice(0, 4)));
  const y1 = Math.max(today.getFullYear(), ...P.map(p => +(p.end || nowYM).slice(0, 4)));
  const a = y0 * 12, n = (y1 - y0 + 1) * 12, x = s => ((ym(s) - a + 0.5) / n * 100).toFixed(2);
  const rows = [...P].sort((p, q) => ym(q.start) - ym(p.start));
  const res = p => { const w = (p.outcomes || []).filter(isAward); return w.length ? w.map(o => o.prize).join(' · ') : (p.outcomes || []).map(o => o.prize).join(' · ') || p.summary; };
  return `<figure class="grid" style="--yrs:${y1 - y0 + 1}" aria-labelledby="g-cap">
  <div class="g-years" aria-hidden="true">${Array.from({ length: y1 - y0 + 1 }, (_, i) => `<span>${y0 + i}</span>`).join('')}</div>
  <ol>
${rows.map(p => {
    const name = p.featured ? `<a href="#p-${p.id}">${esc(p.name)}</a>` : esc(p.name);
    return `    <li class="${p.featured ? 'is-f' : ''}"${p.color ? ` style="--c:${esc(p.color)}"` : ''}><span class="g-name">${name}<small>${esc(p.kind)}</small></span><span class="g-track" aria-hidden="true"><i class="g-bar" style="--s:${x(p.start)}%;--e:${x(p.end || nowYM)}%"></i>${(p.outcomes || []).map(o => `<span class="g-mk" style="--x:${x(o.date)}%">${mk(o)}</span>`).join('')}</span><span class="g-out">${esc(res(p))}</span><span class="sr">${range(p)}${(p.outcomes || []).map(o => `, ${fmt(o.date)} ${o.title} ${o.prize}`).join('')}</span></li>`;
  }).join('\n')}
  </ol>
  <figcaption id="g-cap" class="legend">${[1, 2, 3, 'x'].map(t => `<span>${mark(t)}${TIER[t]}</span>`).join('')}<span><i class="sw" aria-hidden="true"></i>진행 기간</span></figcaption>
</figure>`;
}

// ---------- 조각 ----------
const media = (p, base = '') => {
  const m = p.media || {};
  if (m.type === 'video' && m.src) return `<video class="media" src="${base}${esc(m.src)}" ${m.poster ? `poster="${base}${esc(m.poster)}"` : ''} muted loop playsinline preload="none" aria-label="${esc(m.alt)}"></video><button class="vbtn" type="button" aria-label="시연 영상 일시정지" hidden>일시정지</button>`;
  if (m.src) return `<img class="media" src="${base}${esc(m.src)}" alt="${esc(m.alt)}" loading="lazy" decoding="async">`;
  return `<div class="media is-empty" role="img" aria-label="${esc(m.alt)}"></div>`;
};

const roleBlock = p => {
  const rs = (p.case && p.case.roleSplit) || [];
  const me = rs.find(r => r.who === '나'), team = rs.find(r => r.who !== '나');
  return `<dl class="p-role"><div><dt>내가 만든 것</dt><dd>${esc([].concat(me ? me.what : p.role).join(', '))}</dd></div>${team ? `<div><dt>팀이 한 것</dt><dd>${esc([].concat(team.what).join(', '))}</dd></div>` : ''}</dl>`;
};

// ---------- 첫 화면: 왼쪽 목록 + 오른쪽 무대 (같은 틀 ×3, 목록에서 고르면 무대가 바뀐다) ----------
const role = p => [].concat((((p.case && p.case.roleSplit) || []).find(r => r.who === '나') || {}).what || p.role).join(', ');
const logo = p => p.logo ? `<img class="logo" src="${esc(p.logo)}" alt="" width="28" height="28">` : `<span class="logo" style="--c:${esc(p.color || '#8B95A1')}" aria-hidden="true">${esc(p.name[0])}</span>`;
const bars = m => {
  const max = Math.max(m.before, m.after, m.unit === '%' ? 100 : 0);
  const row = (l, v, c) => `<li class="${c}"><span>${esc(l)}</span><i style="--w:${(v / max * 100).toFixed(1)}%"></i><b>${v}${esc(m.unit)}</b></li>`;
  return `<ol class="bars">${row(m.beforeLabel, m.before, 'was')}${row(m.afterLabel, m.after, 'now')}</ol>`;
};
const awards = (p, full) => (p.outcomes || []).length ? `<ul class="aw${full ? ' is-full' : ''}">${p.outcomes.map(o => `<li>${mk(o)}<b>${esc(o.prize)}</b>${esc(o.title)}${full ? `<small>${[fmt(o.date), o.rank, o.host].filter(Boolean).map(esc).join(' · ')}</small>` : o.rank ? ` · ${esc(o.rank)}` : ''}</li>`).join('')}</ul>` : '';

const tab = (p, i) => `<li><button type="button" role="tab" id="tab-${p.id}"${p.color ? ` style="--c:${esc(p.color)}"` : ''} aria-controls="s-${p.id}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>
  ${logo(p)}<span class="t-name"><b>${esc(p.name)}</b><small>${fmt(p.start)}</small></span>
  <span class="t-head">${esc(p.headline)}</span>
  <span class="t-aw">${(p.outcomes || []).length ? `${mk(p.outcomes[0])}${(p.outcomes || []).map((o, j) => j ? esc(o.prize) : `${esc(o.prize)} ${esc(o.title)}`).join(' · ')}` : ''}</span>
  <span class="t-num"><b><span class="t-was">${p.metric.before}<span class="sr">${esc(p.metric.unit)}에서</span><span aria-hidden="true"> →</span></span> ${p.metric.after}<small>${esc(p.metric.unit)}</small></b>${esc(p.metric.short || p.metric.label)}</span>
</button></li>`;

const stage = (p, i) => {
  const m = p.metric;
  return `<article class="sp" id="s-${p.id}"${p.color ? ` style="--c:${esc(p.color)}"` : ''} role="tabpanel" aria-labelledby="tab-${p.id}"${i ? ' data-off' : ''}>
  <p class="st-meta"><b>${esc(p.name)}</b>${range(p)} · ${esc(p.team)} 팀${p.origin ? ` · ${esc(p.origin)}` : ''}</p>
  <h2 class="st-title">${esc(p.headline)}</h2>
  <p class="mine"><span>내 담당</span>${esc(role(p))}</p>
  <figure class="frame" id="v-${p.id}"><div class="vwrap">${media(p)}${p.media && p.media.short ? `<figcaption class="cap">${esc(p.media.short)}</figcaption>` : ''}</div></figure>
  <div class="ev">
    <div class="ev-m"><p class="ev-h"><b>${esc(m.short || m.label)}</b>${esc(m.set || '')}</p>${bars(m)}${p.decisions[0] ? `<p class="key">${esc(p.decisions[0].title)} → <b>${esc(p.decisions[0].effectLabel)} ${esc(p.decisions[0].effect)}</b></p>` : ''}</div>
    ${m.alt ? `<div class="ev-s"><p class="alt"><b>${esc(m.alt.value)}</b>${esc(m.alt.label)}</p><p class="alt-c">${esc(m.alt.cond || '')}</p></div>` : ''}
  </div>
  <div class="aw-m">${awards(p)}</div>
  <p class="go"><a href="work/${p.id}/#eval">${esc(p.more)}</a><a href="work/${p.id}/">설계 결정 ${p.decisions.length}개와 이유</a>${(p.links || []).map(l => link(l.href, l.label)).join('')}</p>
</article>`;
};

// ---------- 프로젝트 장: 설계 선택이 기능을 어떻게 바꿨나 (펼치지 않아도 보이게) ----------
const chapter = (p, i) => {
  const c = p.case || {};
  const arch = (c.architecture || []).filter(n => n.detail);
  return `
<section class="ch wrap" id="p-${p.id}"${p.color ? ` style="--c:${esc(p.color)}"` : ''} aria-labelledby="h-${p.id}">
  <p class="ch-meta"><span class="no">${no(i)}</span><b>${esc(p.name)}</b>${esc(p.kname)} · ${range(p)} · ${esc(p.team)} 팀${p.status ? ` · ${esc(p.status)}` : ''}</p>
  ${i === 0 ? `<h2 id="h-${p.id}" class="ch-again">${esc(p.name)} 설계와 평가</h2>` : `<div class="ch-top">
    <div><h2 id="h-${p.id}">${esc(p.headline)}</h2>
    <p class="ch-scene">${esc(p.scene)} ${esc(p.summary)}</p>
    <p class="mine"><span>내 담당</span>${esc(role(p))}</p></div>
    <figure class="frame is-sm"><div class="vwrap">${media(p)}</div></figure>
  </div>`}
${arch.length ? `  <h3 class="ch-h">처리 흐름과 내 구현</h3>
  <ol class="pipe" style="--k:${arch.length}">${arch.map(n => `<li class="${n.mine ? 'is-mine' : ''}"><p class="pp-h"><b>${esc(n.name)}</b>${n.mine && !arch.every(x => x.mine) ? '<span>내 담당</span>' : ''}</p><p>${esc(n.detail)}</p>${n.effect ? `<p class="fx">${esc(n.effect)}</p>` : ''}</li>`).join('')}</ol>` : ''}
  <div class="ch-ev">
    <div>${c.ablation ? `<h3 class="ch-h">${esc(p.metric.label)}<small>같은 평가셋, 기능을 하나씩 추가</small></h3>
      <p class="cond">${esc(p.metric.def || p.metric.set || '')}</p>
      <ol class="abl">${c.ablation.map((a, j) => `<li class="${j === c.ablation.length - 1 ? 'now' : ''}"><span>${esc(a.change)}</span><i style="--w:${parseFloat(a.value)}%"></i><b>${esc(a.value)}</b><em>${a.fp ? `하루 오탐 ${esc(a.fp)}` : ''}</em></li>`).join('')}</ol>` : `<h3 class="ch-h">${esc(p.metric.label)}</h3><p class="cond">${esc(p.metric.def || p.metric.set || '')}</p>${bars(p.metric)}`}</div>
    <div><h3 class="ch-h">설계 판단과 효과</h3><ol class="dec">${p.decisions.map(d => `<li><b>${esc(d.effect)}</b><span>${esc(d.effectLabel)}</span><p>${esc(d.title)}</p>${d.why ? `<p class="why">${esc(d.why)}</p>` : ''}</li>`).join('')}</ol></div>
  </div>
  <div class="ch-foot">${awards(p, true)}<p class="go">${(c.slides || []).length ? `<a href="work/${p.id}/#slides">발표자료 ${c.slides.length}쪽 웹으로 보기</a>` : ''}${(c.failures || []).length ? `<a href="work/${p.id}/#fail">실패 사례 ${c.failures.length}건과 수정 내용</a>` : ''}${(p.links || []).map(l => link(l.href, l.label)).join('')}</p></div>
</section>`;
};

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
const bar = (base = '') => `<header class="bar wrap"><a class="bar-name" href="${base || './'}">${esc(site.person.name)}</a>${links(base)}</header>`;
const foot = (base = '') => `<footer class="site-foot wrap"><p><b>${esc(site.person.name)}</b>${esc(site.person.affiliation)}</p>${links(base)}</footer>`;

const home = page({
  title: `${site.person.name} 포트폴리오`,
  desc: `${site.person.field}. ${F.map(p => p.headline).join(' / ')}`,
  base: '',
  body: `${bar()}
<main id="main" tabindex="-1">
  <section class="lead wrap" aria-label="소개와 대표 작업">
    <div class="lead-id">
      <p class="to" hidden></p>
      <p class="who">${[site.person.field, site.person.affiliation, site.person.grad].map(esc).join(' · ')}</p>
      <h1><span class="sr">${esc(site.person.name)}, </span>${esc(site.person.headline || site.person.pitch).replace(/\n/g, '<br>')}</h1>
      <ol class="idx" role="tablist" aria-label="대표 작업 ${F.length}개">${F.map(tab).join('')}</ol>
      <a class="all" href="#record">프로젝트 ${stats.projects}개 · 수상 ${stats.awards}회 전체 기록</a>
    </div>
    <div class="stage">${F.map(stage).join('\n')}</div>
  </section>
  ${F.map(chapter).join('\n')}
  <section class="record wrap" id="record" aria-labelledby="h-all">
    <h2 id="h-all" class="sec">전체 기록<small>${Math.min(...P.map(p => +p.start.slice(0, 4)))}–${today.getFullYear()} · 프로젝트 ${stats.projects}개 · 수상 ${stats.awards}회</small></h2>
    ${grid()}
    <details class="list"><summary>연도별 상세 기록 보기</summary>${ledger()}</details>
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

  <section class="cs" id="eval"><h2>${esc(p.metric.label)} ${p.metric.after}${esc(p.metric.unit)}, 이렇게 쟀습니다</h2>
    ${p.metric.second ? `<p class="m-def"><b>함께 잰 업무 효과</b> ${esc(p.metric.second)}</p>` : ''}
    <p class="m-def">${esc(p.metric.def || '')}</p>
${c.setup ? `    <dl class="setup"><div><dt>가설</dt><dd>${esc(c.setup.hypothesis)}</dd></div><div><dt>데이터</dt><dd>${esc(c.setup.data)}</dd></div>${c.setup.split ? `<div><dt>분리</dt><dd>${esc(c.setup.split)}</dd></div>` : ''}${c.setup.unit ? `<div><dt>평가 단위</dt><dd>${esc(c.setup.unit)}</dd></div>` : ''}<div><dt>정답</dt><dd>${esc(c.setup.label)}</dd></div>${c.setup.repro ? `<div><dt>재현</dt><dd>${link(c.setup.repro, '재현 방법')}</dd></div>` : ''}</dl>` : ''}
${c.ablation ? `    <h3 class="ab-h">무엇이 얼마나 기여했나 <small>같은 평가셋, 기능을 하나씩 추가, 오른쪽은 하루 평균 오탐</small></h3>
    <ol class="ab">${c.ablation.map((a, i) => `<li><span>${esc(a.change)}</span><i style="--w:${parseFloat(a.value)}%"></i><b>${esc(a.value)}</b><em>${esc(a.fp || '')}</em></li>`).join('')}</ol>` : ''}
    <table class="eval"><thead><tr><th scope="col">항목</th><th scope="col">이전</th><th scope="col">이후</th><th scope="col">조건</th></tr></thead>
    <tbody>${c.evaluation.map(e => `<tr><th scope="row">${esc(e.item)}</th><td data-label="이전" class="${e.baseline ? 'base' : 'none'}">${esc(e.baseline || '미측정')}</td><td data-label="이후" class="res">${esc(e.result || '미측정')}</td><td data-label="조건" class="cond">${esc(e.condition)}</td></tr>`).join('')}</tbody></table>
  </section>
${(c.failures || []).length ? `
  <section class="cs" id="fail"><h2>안 된 것과 고친 것</h2>
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
    <ul><li><b>역할</b> ${esc([].concat(((p.case && p.case.roleSplit) || []).find(r => r.who === '나')?.what || p.role).join(', '))}</li><li><b>결과</b> ${esc(p.metric.label)} ${p.metric.before}${esc(p.metric.unit)} → ${p.metric.after}${esc(p.metric.unit)} <span class="cv-n">${esc(p.metric.set || '')}</span></li><li><b>결정</b> ${p.decisions.map(d => `${esc(d.title)} (${esc(d.effectLabel)} ${esc(d.effect)})`).join(', ')}</li><li><b>상세</b> ${esc(site.person.site || '')}work/${p.id}/</li>${(p.outcomes || []).length ? `<li><b>수상</b> ${p.outcomes.map(o => `${fmt(o.date)} ${esc(o.title)} ${esc(o.prize)}${o.rank ? ` (${esc(o.rank)})` : ''}`).join(', ')}</li>` : ''}</ul></article>`).join('')}
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
