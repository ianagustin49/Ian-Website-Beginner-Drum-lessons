/* =========================================================
   main.js — Navigation, collapsible lessons, scroll-driven
   rolling drumstick, and subtle scroll-reveal animations.
   ========================================================= */

function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  /* ----- mobile menu ----- */
  document.querySelectorAll('.nav-links a').forEach(link =>
    link.addEventListener('click', () =>
      document.querySelector('.nav-links').classList.remove('open')));

  /* ----- collapsible lessons ----- */
  document.querySelectorAll('.lesson-top').forEach(top => {
    top.addEventListener('click', (e) => {
      if (e.target.closest('.lesson-check')) return;
      top.closest('.lesson-article').classList.toggle('open');
    });
  });
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el && el.classList.contains('lesson-article')) el.classList.add('open');
  }

  /* ----- scroll-driven rolling drumstick -----
     The stick rolls left→right across the top of the page,
     rotating in proportion to how far you've scrolled. */
  const stick = document.querySelector('.scroll-stick');
  if (stick) {
    const STICK_W = 84;
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const travel = (window.innerWidth - STICK_W) * progress;
      // a rolling rod: rotation tied to distance travelled
      const circumference = Math.PI * 18; // visual feel, not literal
      const deg = (travel / circumference) * 360;
      stick.style.left = travel + 'px';
      stick.style.transform = `rotate(${deg}deg)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ----- scroll-reveal ----- */
  const revealTargets = document.querySelectorAll(
    '.card, .road-step, .lesson-article, .section-title, .section-sub, .metronome, .beat-buttons, .about-grid'
  );
  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));
  }
});
