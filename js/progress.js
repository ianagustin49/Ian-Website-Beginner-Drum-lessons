/* =========================================================
   progress.js — Lesson progress checklist saved to
   localStorage. Toggling a lesson's check updates the
   progress bar and persists across visits.
   ========================================================= */

(function () {
  const KEY = 'ian-drums-progress-v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  }
  function save(state) { localStorage.setItem(KEY, JSON.stringify(state)); }

  document.addEventListener('DOMContentLoaded', () => {
    const checks = [...document.querySelectorAll('.lesson-check')];
    if (!checks.length) return;

    const bar = document.querySelector('.progress-bar-inner');
    const text = document.querySelector('.progress-banner .ptext');
    const resetBtn = document.querySelector('.reset-progress');
    let state = load();

    function render() {
      let done = 0;
      checks.forEach(c => {
        const id = c.dataset.lesson;
        if (state[id]) { c.classList.add('done'); c.textContent = '✓'; done++; }
        else { c.classList.remove('done'); c.textContent = ''; }
      });
      const pct = Math.round((done / checks.length) * 100);
      if (bar) bar.style.width = pct + '%';
      if (text) {
        text.textContent = done === checks.length
          ? `🎉 You finished all ${checks.length} lessons!`
          : `Your progress: ${done} / ${checks.length} lessons done`;
      }
    }

    checks.forEach(c => {
      c.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = c.dataset.lesson;
        state[id] = !state[id];
        save(state);
        render();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state = {}; save(state); render();
      });
    }

    render();
  });
})();
