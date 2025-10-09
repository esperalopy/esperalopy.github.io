// assets/main.js
(function () {
  // Menú hamburguesa
  const btn = document.querySelector('.hamburger');
  const menu = document.getElementById('main-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Smooth scroll para anclas internas
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', `#${id}`);
      }
    });
  });

  // Botón "volver arriba"
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      toTop.classList.toggle('show', y > 500);
    }, { passive: true });
  }

  // Banner de novedades (dismissible con persistencia)
  const BKEY = 'esperalopy_banner_v1_closed';
  const banner = document.getElementById('promoBanner');
  const close = banner ? banner.querySelector('.x') : null;

  try {
    const closed = localStorage.getItem(BKEY) === '1';
    if (banner && !closed) {
      banner.hidden = false;
    }
    if (banner && close) {
      close.addEventListener('click', () => {
        banner.hidden = true;
        try { localStorage.setItem(BKEY, '1'); } catch {}
      });
    }
  } catch {
    // si localStorage falla, solo mostramos el banner sin persistencia
    if (banner) banner.hidden = false;
  }
})();
