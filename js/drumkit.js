/* =========================================================
   drumkit.js — Builds the interactive playable drum kit.
   Click, tap, or keyboard. Animated sticks fly to the
   drum you hit. Renders into any element with [data-drumkit].
   ========================================================= */

(function () {
  // pad definitions: positions are % within the kit-wrap box.
  // key = keyboard key, color from rainbow palette.
  const PADS = [
    { id: 'crash',  label: 'Crash', key: 'q', x: 6,  y: 2,  size: 90,  type: 'cymbal', color: '#ffd93d' },
    { id: 'hat',    label: 'Hi-Hat',key: 'a', x: 2,  y: 36, size: 80,  type: 'cymbal', color: '#2ec4d6' },
    { id: 'tom1',   label: 'Tom 1', key: 'w', x: 34, y: 8,  size: 80,  type: 'drum',   color: '#9b5de5' },
    { id: 'tom2',   label: 'Tom 2', key: 'e', x: 56, y: 8,  size: 86,  type: 'drum',   color: '#4d8bff' },
    { id: 'snare',  label: 'Snare', key: 's', x: 24, y: 50, size: 96,  type: 'drum',   color: '#ff914d' },
    { id: 'floor',  label: 'Floor', key: 'd', x: 74, y: 46, size: 104, type: 'drum',   color: '#4dd599' },
    { id: 'kick',   label: 'Kick',  key: ' ', x: 38, y: 66, size: 150, type: 'drum',   color: '#ff5757' },
  ];
  const KEY_LABEL = { ' ': 'space' };

  function build(host) {
    const wrap = document.createElement('div');
    wrap.className = 'kit-wrap';
    // give the box a height proportional to width via padding trick
    wrap.style.aspectRatio = '1 / 0.95';
    host.appendChild(wrap);

    const byKey = {};

    PADS.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'pad ' + p.type;
      btn.style.left = p.x + '%';
      btn.style.top = p.y + '%';
      btn.style.width = p.size + 'px';
      btn.style.height = (p.type === 'cymbal' ? p.size * 0.5 : p.size) + 'px';
      btn.style.background = `radial-gradient(circle at 50% 35%, ${lighten(p.color)}, ${p.color})`;
      btn.setAttribute('aria-label', p.label);
      btn.dataset.id = p.id;

      const hint = document.createElement('span');
      hint.className = 'key-hint';
      hint.textContent = KEY_LABEL[p.key] || p.key.toUpperCase();
      btn.appendChild(hint);

      const lbl = document.createElement('span');
      lbl.textContent = p.label;
      btn.appendChild(lbl);

      const ring = document.createElement('span');
      ring.className = 'pad-ring';
      ring.style.inset = '0';
      btn.appendChild(ring);

      wrap.appendChild(btn);
      byKey[p.key] = { el: btn, pad: p, ring };

      // pointer (covers mouse + touch)
      btn.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        strike(p, btn, ring);
      });
    });

    // two sticks
    const stickL = mkStick(); const stickR = mkStick();
    wrap.appendChild(stickL); wrap.appendChild(stickR);
    let useRight = true;

    function strike(pad, el, ring) {
      DrumAudio.play(pad.id);
      el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');
      ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go');
      // animate a stick toward this pad
      const stick = useRight ? stickR : stickL;
      useRight = !useRight;
      moveStick(stick, el, wrap);
    }

    // keyboard
    window.addEventListener('keydown', (ev) => {
      if (ev.repeat) return;
      const k = ev.key.toLowerCase();
      const hit = byKey[k];
      if (hit) {
        if (k === ' ') ev.preventDefault();
        strike(hit.pad, hit.el, hit.ring);
      }
    });

    return wrap;
  }

  function mkStick() {
    const s = document.createElement('div');
    s.className = 'stick';
    s.style.left = '46%';
    s.style.top = '78%';
    s.style.transform = 'rotate(20deg)';
    return s;
  }

  function moveStick(stick, padEl, wrap) {
    const wr = wrap.getBoundingClientRect();
    const pr = padEl.getBoundingClientRect();
    const cx = pr.left - wr.left + pr.width / 2;
    const cy = pr.top - wr.top + pr.height / 2;
    stick.style.left = (cx - 4) + 'px';
    stick.style.top = (cy) + 'px';
    stick.style.height = Math.max(70, wr.height - cy) + 'px';
    // quick down-up tap motion
    stick.style.transform = 'rotate(6deg) scaleY(0.92)';
    setTimeout(() => { stick.style.transform = 'rotate(14deg) scaleY(1)'; }, 90);
  }

  function lighten(hex) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + 60, g = ((n >> 8) & 255) + 60, b = (n & 255) + 60;
    r = Math.min(255, r); g = Math.min(255, g); b = Math.min(255, b);
    return `rgb(${r},${g},${b})`;
  }

  // init all kits on the page
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-drumkit]').forEach(build);
  });
})();
