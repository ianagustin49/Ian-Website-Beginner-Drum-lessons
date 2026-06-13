/* =========================================================
   beats.js — Play-along beat loops. Each [data-beat]
   button loops a named pattern using the shared audio
   engine until pressed again.
   ========================================================= */

(function () {
  // Patterns are 8 sixteenth/eighth slots. Each entry lists
  // which voices fire on that slot.
  const PATTERNS = {
    rock: {
      bpm: 80,
      steps: [
        ['hat', 'kick'], ['hat'], ['hat', 'snare'], ['hat'],
        ['hat', 'kick'], ['hat'], ['hat', 'snare'], ['hat'],
      ],
    },
    pop: {
      bpm: 90,
      steps: [
        ['hat', 'kick'], ['hat'], ['hat', 'snare'], ['hat'],
        ['hat'], ['hat', 'kick'], ['hat', 'snare'], ['hat'],
      ],
    },
    fourfloor: {
      bpm: 100,
      steps: [
        ['hat', 'kick'], ['hat'], ['hat', 'kick'], ['hat'],
        ['hat', 'kick'], ['hat'], ['hat', 'kick'], ['hat'],
      ],
    },
  };

  let active = null; // { btn, timer }

  function stop() {
    if (!active) return;
    clearInterval(active.timer);
    active.btn.classList.remove('playing');
    active.btn.textContent = active.btn.dataset.label;
    active = null;
  }

  function start(btn) {
    const pat = PATTERNS[btn.dataset.beat];
    if (!pat) return;
    DrumAudio.ready();
    let i = 0;
    const interval = (60 / pat.bpm) / 2 * 1000; // eighth notes
    const tick = () => {
      pat.steps[i].forEach(v => DrumAudio.play(v));
      i = (i + 1) % pat.steps.length;
    };
    tick();
    const timer = setInterval(tick, interval);
    btn.classList.add('playing');
    btn.textContent = '■ Stop';
    active = { btn, timer };
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-beat]').forEach(btn => {
      btn.dataset.label = btn.textContent;
      btn.addEventListener('click', () => {
        const wasThis = active && active.btn === btn;
        stop();
        if (!wasThis) start(btn);
      });
    });
  });
})();
