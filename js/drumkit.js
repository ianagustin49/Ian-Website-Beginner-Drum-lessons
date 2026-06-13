/* =========================================================
   drumkit.js — Builds a realistic-looking, playable drum
   kit. Click, tap, or keyboard. Animated sticks fly to the
   drum you hit. Renders into any [data-drumkit] element.
   ========================================================= */

(function () {
  // Realistic kit layout (player's view). Positions are % of
  // the kit box; size is in px. "kind" picks the look.
  const PADS = [
    { id: 'crash', label: 'Crash', key: 'q', x: 1,  y: 0,  size: 124, kind: 'cymbal', z: 2 },
    { id: 'tom1',  label: 'Tom 1', key: 'w', x: 32, y: 7,  size: 96,  kind: 'tom',    z: 5, shell: '#7a4a2b' },
    { id: 'tom2',  label: 'Tom 2', key: 'e', x: 54, y: 4,  size: 104, kind: 'tom',    z: 5, shell: '#7a4a2b' },
    { id: 'hat',   label: 'Hi-Hat',key: 'a', x: 0,  y: 44, size: 100, kind: 'cymbal', z: 3 },
    { id: 'snare', label: 'Snare', key: 's', x: 19, y: 52, size: 110, kind: 'snare',  z: 6, shell: '#c9ccd1' },
    { id: 'floor', label: 'Floor', key: 'd', x: 72, y: 48, size: 124, kind: 'tom',    z: 4, shell: '#7a4a2b' },
    { id: 'kick',  label: 'Kick',  key: ' ', x: 33, y: 56, size: 186, kind: 'kick',   z: 1, shell: '#5b3620' },
  ];
  const KEY_LABEL = { ' ': 'space' };

  function build(host) {
    const wrap = document.createElement('div');
    wrap.className = 'kit-wrap';
    wrap.style.aspectRatio = '1 / 0.92';
    host.appendChild(wrap);

    const byKey = {};

    PADS.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'pad kind-' + p.kind;
      btn.style.left = p.x + '%';
      btn.style.top = p.y + '%';
      btn.style.width = p.size + 'px';
      btn.style.height = (p.kind === 'cymbal' ? Math.round(p.size * 0.94) : p.size) + 'px';
      btn.style.zIndex = p.z;
      if (p.shell) btn.style.setProperty('--shell', p.shell);
      btn.setAttribute('aria-label', p.label);
      btn.dataset.id = p.id;

      if (p.kind === 'cymbal') {
        btn.innerHTML = `
          <span class="stand" aria-hidden="true"></span>
          <span class="cymbal-disc"><span class="bell"></span></span>`;
      } else {
        // build a drum: rim ring + lugs + head
        const lugCount = p.kind === 'kick' ? 10 : 8;
        let lugs = '';
        for (let i = 0; i < lugCount; i++) {
          lugs += `<span class="lug" style="transform:rotate(${(360 / lugCount) * i}deg) translateY(-${p.size / 2 - 7}px)"></span>`;
        }
        btn.innerHTML = `
          <span class="rim" aria-hidden="true">${lugs}</span>
          <span class="head"></span>`;
      }

      const hint = document.createElement('span');
      hint.className = 'key-hint';
      hint.textContent = KEY_LABEL[p.key] || p.key.toUpperCase();
      btn.appendChild(hint);

      const lbl = document.createElement('span');
      lbl.className = 'pad-label';
      lbl.textContent = p.label;
      btn.appendChild(lbl);

      const ring = document.createElement('span');
      ring.className = 'pad-ring';
      btn.appendChild(ring);

      wrap.appendChild(btn);
      byKey[p.key] = { el: btn, pad: p, ring };

      btn.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        strike(p, btn, ring);
      });
    });

    const stickL = mkStick(); const stickR = mkStick();
    wrap.appendChild(stickL); wrap.appendChild(stickR);
    let useRight = true;

    function strike(pad, el, ring) {
      DrumAudio.play(pad.id);
      el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');
      ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go');
      const stick = useRight ? stickR : stickL;
      useRight = !useRight;
      moveStick(stick, el, wrap);
    }

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
    s.style.top = '74%';
    s.style.transform = 'rotate(18deg)';
    return s;
  }

  function moveStick(stick, padEl, wrap) {
    const wr = wrap.getBoundingClientRect();
    const pr = padEl.getBoundingClientRect();
    const cx = pr.left - wr.left + pr.width / 2;
    const cy = pr.top - wr.top + pr.height / 2;
    stick.style.left = (cx - 4) + 'px';
    stick.style.top = cy + 'px';
    stick.style.height = Math.max(70, wr.height - cy) + 'px';
    stick.style.transform = 'rotate(6deg) scaleY(0.92)';
    setTimeout(() => { stick.style.transform = 'rotate(14deg) scaleY(1)'; }, 90);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-drumkit]').forEach(build);
  });
})();
