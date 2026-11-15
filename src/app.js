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
if (map) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { map.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.3 }).observe(map);

// 영상: 화면에 보일 때만 재생 (동작 줄이기 설정이면 자동 재생 안 함)
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting && !still) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
}), { threshold: 0.5 });
document.querySelectorAll('video.media').forEach(v => { io.observe(v); if (still) v.controls = true; });

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
  const at = () => Math.round(d.scrollLeft / d.clientWidth);
  const go = i => d.scrollTo({ left: Math.max(0, Math.min(total - 1, i)) * d.clientWidth, behavior: still ? 'auto' : 'smooth' });
  ctl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(at() + +b.dataset.d); });
  d.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(at() + 1); if (e.key === 'ArrowLeft') go(at() - 1); });
  d.addEventListener('scroll', () => { n.textContent = `${at() + 1} / ${total}`; }, { passive: true });
});
