/* ══════════════════════════════════════════════════════════════
   UNINOVARE — Carousel Factory (reutilizável)
   ══════════════════════════════════════════════════════════════ */

function makeCarousel({ trackSel, dotsSel, prevSel, nextSel, autoPlayMs = 3000 }) {
  const track = document.querySelector(trackSel);
  const dotsEl = document.querySelector(dotsSel);
  if (!track || !dotsEl) return;

  const cards = Array.from(track.children);
  if (cards.length === 0) return;

  const prevBtn = document.querySelector(prevSel);
  const nextBtn = document.querySelector(nextSel);

  dotsEl.innerHTML = '';
  const dotBtns = cards.map((_, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dotBtn';
    b.setAttribute('aria-label', `Ir para o item ${idx + 1}`);
    b.addEventListener('click', () => { goTo(idx); resetAuto(); });
    dotsEl.appendChild(b);
    return b;
  });

  function getActiveIndex() {
    const left = track.scrollLeft;
    let bestIdx = 0, bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - left);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    return bestIdx;
  }

  function goTo(idx) {
    idx = ((idx % cards.length) + cards.length) % cards.length;
    track.scrollTo({ left: cards[idx].offsetLeft, behavior: 'smooth' });
  }

  function renderActive() {
    const idx = getActiveIndex();
    dotBtns.forEach((b, i) => b.setAttribute('aria-current', i === idx ? 'true' : 'false'));
  }

  function scrollByCard(dir) { goTo(getActiveIndex() + dir); resetAuto(); }

  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));

  let scrollT;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollT);
    scrollT = setTimeout(renderActive, 80);
  }, { passive: true });

  track.addEventListener('touchstart', () => clearInterval(autoTimer), { passive: true });
  track.addEventListener('touchend', () => resetAuto(), { passive: true });

  let autoTimer;
  function startAuto() { autoTimer = setInterval(() => goTo(getActiveIndex() + 1), autoPlayMs); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  window.addEventListener('resize', renderActive);
  renderActive();
  startAuto();
}
