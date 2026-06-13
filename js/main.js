/* =========================================================
   main.js — Navigation menu + collapsible lessons +
   floating confetti dots on the hero.
   ========================================================= */

function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  // close mobile menu after clicking a link
  document.querySelectorAll('.nav-links a').forEach(link =>
    link.addEventListener('click', () =>
      document.querySelector('.nav-links').classList.remove('open')));

  // collapsible lesson cards (click the header row to open/close)
  document.querySelectorAll('.lesson-top').forEach(top => {
    top.addEventListener('click', (e) => {
      if (e.target.closest('.lesson-check')) return; // checkbox handled separately
      top.closest('.lesson-article').classList.toggle('open');
    });
  });

  // open a lesson automatically if linked via #hash
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el && el.classList.contains('lesson-article')) el.classList.add('open');
  }

  // scatter floating confetti dots behind the hero
  const hero = document.querySelector('[data-confetti]');
  if (hero) {
    const colors = ['#ff5757','#ff914d','#ffd93d','#4dd599','#2ec4d6','#4d8bff','#9b5de5','#ff5da2'];
    for (let i = 0; i < 14; i++) {
      const dot = document.createElement('span');
      dot.className = 'confetti';
      const size = 10 + Math.random() * 26;
      dot.style.width = dot.style.height = size + 'px';
      dot.style.background = colors[i % colors.length];
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      dot.style.animationDelay = (Math.random() * 4) + 's';
      dot.style.animationDuration = (4 + Math.random() * 4) + 's';
      hero.appendChild(dot);
    }
  }
});
