/* =========================================================
   dashboard.js — Builds the "My Progress" dashboard from
   the lesson progress saved in localStorage (same key the
   lessons page uses), plus a simple practice streak.
   ========================================================= */

(function () {
  const PROGRESS_KEY = 'ian-drums-progress-v1';
  const STREAK_KEY = 'ian-drums-streak-v1';

  // Lesson catalogue — must match lessons.html
  const LEVELS = [
    { id: 1, name: 'Level 1 · Get Comfortable', lessons: [
      { id: 1, title: 'Meet the Drum Kit' },
      { id: 2, title: 'How to Hold the Sticks' },
    ]},
    { id: 2, name: 'Level 2 · Play Your First Beats', lessons: [
      { id: 3, title: 'Counting & Reading Beats' },
      { id: 4, title: 'Your First Beat — The Rock Groove' },
    ]},
    { id: 3, name: 'Level 3 · Build Real Skills', lessons: [
      { id: 5, title: 'The Building Blocks (Rudiments)' },
      { id: 6, title: 'Locking In With the Metronome' },
    ]},
    { id: 4, name: 'Level 4 · Make Music', lessons: [
      { id: 7, title: 'Adding Drum Fills' },
      { id: 8, title: 'Play Along to Real Songs' },
    ]},
  ];
  const ALL = LEVELS.flatMap(l => l.lessons);

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
    catch { return {}; }
  }
  const isDone = (state, id) => !!state[id];

  /* ---------- practice streak ---------- */
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function updateStreak() {
    let s;
    try { s = JSON.parse(localStorage.getItem(STREAK_KEY)) || {}; } catch { s = {}; }
    const today = todayStr();
    if (s.last === today) return s.count || 1;        // already counted today
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    s.count = (s.last === yesterday) ? (s.count || 0) + 1 : 1;
    s.last = today;
    localStorage.setItem(STREAK_KEY, JSON.stringify(s));
    return s.count;
  }

  /* ---------- badges ---------- */
  function computeBadges(state, done, streak) {
    return [
      { emoji: '🥁', name: 'First Steps',    unlocked: isDone(state, 1),      hint: 'Finish Lesson 1' },
      { emoji: '🎵', name: 'First Beat',     unlocked: isDone(state, 4),      hint: 'Finish Lesson 4' },
      { emoji: '🔥', name: 'Halfway There',  unlocked: done >= ALL.length / 2, hint: 'Finish 4 lessons' },
      { emoji: '💪', name: 'Rudiment Rookie',unlocked: isDone(state, 5),      hint: 'Finish Lesson 5' },
      { emoji: '📅', name: '3-Day Streak',   unlocked: streak >= 3,           hint: 'Practice 3 days in a row' },
      { emoji: '🏆', name: 'Graduate',       unlocked: done === ALL.length,   hint: 'Finish all lessons' },
    ];
  }

  function currentLevel(state) {
    // highest level where at least one lesson is done; default 1
    let lvl = 1;
    LEVELS.forEach(l => { if (l.lessons.some(ls => isDone(state, ls.id))) lvl = l.id; });
    return lvl;
  }

  function render() {
    const state = loadProgress();
    const done = ALL.filter(l => isDone(state, l.id)).length;
    const pct = Math.round((done / ALL.length) * 100);
    const streak = updateStreak();
    const lvl = currentLevel(state);

    // date line
    const dateEl = document.getElementById('dash-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString(undefined,
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // KPIs
    set('kpi-done', `${done}/${ALL.length}`);
    set('kpi-pct', pct + '%');
    set('kpi-level', 'Level ' + lvl);
    set('kpi-streak', streak + (streak === 1 ? ' day' : ' days'));

    // overall ring
    const ring = document.querySelector('.ring');
    if (ring) {
      ring.style.background =
        `conic-gradient(var(--brown) 0% ${pct}%, rgba(212,196,172,0.1) ${pct}% 100%)`;
      set('ring-pct', pct + '%');
    }

    // level progress bars
    const lp = document.getElementById('level-prog');
    if (lp) {
      lp.innerHTML = '';
      LEVELS.forEach(l => {
        const d = l.lessons.filter(ls => isDone(state, ls.id)).length;
        const p = Math.round((d / l.lessons.length) * 100);
        const row = document.createElement('div');
        row.className = 'lp-row';
        row.innerHTML = `
          <div class="lp-top">
            <span class="lp-name">${l.name}</span>
            <span class="lp-count">${d}/${l.lessons.length}</span>
          </div>
          <div class="lp-bar"><div class="lp-fill l${l.id}"></div></div>`;
        lp.appendChild(row);
        requestAnimationFrame(() => { row.querySelector('.lp-fill').style.width = p + '%'; });
      });
    }

    // continue learning
    const next = ALL.find(l => !isDone(state, l.id));
    const nextTitle = document.getElementById('next-title');
    const nextLink = document.getElementById('next-link');
    const nextEyebrow = document.getElementById('next-eyebrow');
    if (nextTitle && nextLink) {
      if (next) {
        nextEyebrow.textContent = 'Pick up where you left off';
        nextTitle.textContent = `Lesson ${next.id}: ${next.title}`;
        nextLink.href = `lessons.html#lesson-${next.id}`;
        nextLink.textContent = 'Continue →';
      } else {
        nextEyebrow.textContent = 'You finished the course!';
        nextTitle.textContent = 'Keep practicing in the Play Room 🎉';
        nextLink.href = 'play.html';
        nextLink.textContent = 'Go play →';
      }
    }

    // badges
    const bg = document.getElementById('badge-grid');
    if (bg) {
      bg.innerHTML = '';
      computeBadges(state, done, streak).forEach(b => {
        const el = document.createElement('div');
        el.className = 'badge' + (b.unlocked ? ' unlocked' : '');
        el.innerHTML = `
          <span class="b-emoji">${b.emoji}</span>
          <div class="b-name">${b.name}</div>
          <div class="b-lock">${b.unlocked ? 'Unlocked' : b.hint}</div>`;
        bg.appendChild(el);
      });
    }

    // lessons table
    const tb = document.getElementById('lessons-tbody');
    if (tb) {
      tb.innerHTML = '';
      ALL.forEach(l => {
        const d = isDone(state, l.id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="num">Lesson ${l.id}</td>
          <td><a href="lessons.html#lesson-${l.id}">${l.title}</a></td>
          <td><span class="status-pill ${d ? 'done' : 'todo'}">${d ? 'Completed' : 'Not started'}</span></td>`;
        tb.appendChild(tr);
      });
    }
  }

  function set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

  document.addEventListener('DOMContentLoaded', render);
})();
