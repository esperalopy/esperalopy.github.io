// Toggle del menú móvil
const hamburger = document.querySelector('.hamburger');
const menu = document.getElementById('main-menu');

if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
}

// Resaltar link activo al scrollear
const navLinks = document.querySelectorAll('.menu a[href^="#"]');
const sections = Array.from(navLinks)
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function setActive() {
  const fromTop = window.scrollY + 100;
  let idx = 0;
  sections.forEach((sec, i) => { if (sec.offsetTop <= fromTop) idx = i; });
  navLinks.forEach(l => l.classList.remove('active'));
  navLinks[idx]?.classList.add('active');
}

window.addEventListener('scroll', setActive);
window.addEventListener('load', setActive);

// Cerrar el menú al tocar un link (mobile)
navLinks.forEach(l => l.addEventListener('click', () => {
  menu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}));
