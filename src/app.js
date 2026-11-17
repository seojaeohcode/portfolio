// 콜드메일용: ?to=받는 팀 → 첫 줄에 수신처 표시 (textContent로만 넣음)
const to = new URLSearchParams(location.search).get('to');
const toEl = document.querySelector('.to');
if (to && toEl) { const b = document.createElement('b'); b.textContent = to.slice(0, 40); toEl.append(b, '께 드리는 포트폴리오입니다.'); toEl.hidden = false; }

// 대표 작업 목록 → 오른쪽 무대 전환 (화살표 키로도 이동)
const tl = document.querySelector('.idx');
if (tl) {
  const tabs = [...tl.querySelectorAll('[role="tab"]')];
  const pick = (t, focus) => {
    tabs.forEach(x => {
      const on = x === t, panel = document.getElementById(x.getAttribute('aria-controls'));
      x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      panel.toggleAttribute('data-off', !on);
    });
    if (focus) t.focus();
  };
  tl.addEventListener('click', e => { const t = e.target.closest('[role="tab"]'); if (t) pick(t); });
  tl.addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement), d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (i < 0 || !d) return;
    e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true);
  });
}

// 영상: 화면에 보일 때만 재생 (동작 줄이기 설정이면 자동 재생 안 함)
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const still = () => reduce.matches; // 실행 중 설정 변경도 반영
const io = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting && !still() && !v.dataset.userPaused) { v.preload = 'auto'; v.play().catch(() => {}); } else if (!v.paused) { v.dataset.auto = '1'; v.pause(); }
}), { threshold: 0.5 });
// 사용자가 직접 멈추면 다시 보이더라도 자동 재생하지 않는다
document.querySelectorAll('video.media').forEach(v => {
  io.observe(v);
  // 기본 컨트롤 대신 화면을 가리지 않는(오른쪽 위 빈 곳) 일시정지/재생 버튼 하나 (5초 넘는 자동 재생의 정지 수단)
  const b = v.nextElementSibling;
  if (b && b.classList.contains('vbtn')) {
    b.hidden = false;
    const sync = () => { b.textContent = v.paused ? '재생' : '일시정지'; b.setAttribute('aria-label', `시연 영상 ${b.textContent}`); };
    b.addEventListener('click', () => { if (v.paused) { delete v.dataset.userPaused; v.play().catch(() => {}); } else v.pause(); });
    v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
  }
  v.addEventListener('pause', () => { if (v.dataset.auto) delete v.dataset.auto; else v.dataset.userPaused = '1'; });
});

// 전체 기록 필터
const f = document.querySelector('.filter');
if (f) {
  f.hidden = false;
  f.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    f.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    const k = b.dataset.f;
    document.querySelectorAll('.year').forEach(y => {
      let any = false;
      y.querySelectorAll('li[data-c]').forEach(li => { li.hidden = k !== 'all' && li.dataset.c !== k; any ||= !li.hidden; });
      y.hidden = !any;
    });
  });
}

// 발표자료 넘기기
document.querySelectorAll('.deck').forEach(d => {
  const ctl = d.nextElementSibling, n = ctl.querySelector('.deck-n'), total = d.children.length;
  ctl.hidden = false;
  const step = () => d.clientWidth + parseFloat(getComputedStyle(d).columnGap || 0); // 쪽 사이 간격 포함
  const at = () => Math.max(0, Math.min(total - 1, Math.round(d.scrollLeft / step())));
  const go = i => d.scrollTo({ left: Math.max(0, Math.min(total - 1, i)) * step(), behavior: still() ? 'auto' : 'smooth' });
  ctl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(at() + +b.dataset.d); });
  d.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(at() + (e.key === 'ArrowRight' ? 1 : -1)); } });
  d.addEventListener('scroll', () => { n.textContent = `${at() + 1} / ${total}`; }, { passive: true });
});
