// 콜드메일용: ?to=받는 팀 → 첫 줄에 수신처 표시 (textContent로만 넣음)
const to = new URLSearchParams(location.search).get('to');
const toEl = document.querySelector('.to');
if (to && toEl) { const b = document.createElement('b'); b.textContent = to.slice(0, 40); toEl.append(b, '께 보내는 페이지입니다. 1분이면 끝까지 보입니다.'); toEl.hidden = false; }

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
