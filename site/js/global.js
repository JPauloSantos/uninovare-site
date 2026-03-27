/* ══════════════════════════════════════════════════════════════
   UNINOVARE — Global JS
   Menu, Scroll Reveal, Footer Year, WhatsApp Form
   ══════════════════════════════════════════════════════════════ */

// ── Footer Year ──
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// ── Mobile Menu Toggle ──
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('isOpen');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('isOpen');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
      menu.classList.remove('isOpen');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Active Nav Link ──
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });
})();

// ── Scroll Reveal ──
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach(el => el.classList.add('isVisible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('isVisible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 80px 0px' });
  els.forEach(el => obs.observe(el));
})();

// ── WhatsApp Form Handler ──
const contactForm = document.getElementById('contactForm');
const formHint = document.getElementById('formHint');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(contactForm);
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const message = String(fd.get('message') || '').trim();
    const text = `Olá, vim pelo site da UNINOVARE.%0A%0ANome: ${encodeURIComponent(name)}%0ATelefone: ${encodeURIComponent(phone)}%0A%0AMensagem:%0A${encodeURIComponent(message)}`;
    window.open(`https://wa.me/558396865555?text=${text}`, '_blank', 'noopener');
    if (formHint) formHint.textContent = 'Abrimos o WhatsApp com sua mensagem.';
    contactForm.reset();
  });
}
