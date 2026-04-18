(() => {
  const header = document.getElementById('header');
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const year = document.getElementById('year');
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (year) year.textContent = new Date().getFullYear();

  // Header shadow on scroll
  const onScroll = () => {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reveal on scroll
  const revealTargets = document.querySelectorAll(
    '.section-head, .about-copy, .about-media, .product-card, .service-item, .shop-card, .review, .contact-copy, .contact-form'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('visible'));
  }

  // Contact form (front-end only)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      formSuccess.hidden = false;
      form.reset();
      setTimeout(() => { formSuccess.hidden = true; }, 6000);
    });
  }
})();
