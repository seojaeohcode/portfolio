// 콜드메일용: ?to=받는 팀 → 첫 줄에 수신처 표시 (textContent로만 넣음)
const to = new URLSearchParams(location.search).get('to');
const toEl = document.querySelector('.to');
if (to && toEl) { const b = document.createElement('b'); b.textContent = to.slice(0, 40); toEl.append(b, '께 드리는 포트폴리오입니다.'); toEl.hidden = false; }

// 첫 화면: 줄에 마우스를 올리거나 초점을 주면 오른쪽 화면이 그 프로젝트로 바뀐다
const shots = document.querySelectorAll('.show-media img');
document.querySelectorAll('.lead a').forEach(a => {
  const on = () => {
    shots.forEach(s => s.classList.toggle('is-on', s.dataset.i === a.dataset.i));
    document.querySelectorAll('.lead a').forEach(x => x.classList.toggle('is-on', x === a));
  };
  a.addEventListener('mouseenter', on); a.addEventListener('focus', on);
});

// 성과 지도: 화면에 들어올 때 한 번 그린다
const map = document.querySelector('.map');
if (map && !('IntersectionObserver' in window)) map.classList.add('is-in');
else if (map) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { map.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.3 }).observe(map);

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
