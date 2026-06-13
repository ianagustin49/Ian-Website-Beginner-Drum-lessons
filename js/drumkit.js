/* =========================================================
   drumkit.js — Renders a realistic drum SET as an SVG
   illustration (drums in perspective, cymbals on stands)
   that you can play with click, tap, or keyboard. Animated
   sticks tap the drum you hit. Renders into [data-drumkit].
   ========================================================= */

(function () {
  const VB_W = 600, VB_H = 470;

  // Each interactive piece: id (=sound), label, key, and the
  // centre of its playing surface (for the stick animation).
  const PIECES = {
    crash: { label: 'Crash',  key: 'q', cx: 142, cy: 92  },
    hat:   { label: 'Hi-Hat', key: 'a', cx: 78,  cy: 250 },
    tom1:  { label: 'Tom 1',  key: 'w', cx: 246, cy: 198 },
    tom2:  { label: 'Tom 2',  key: 'e', cx: 356, cy: 192 },
    ride:  { label: 'Ride',   key: 'r', cx: 470, cy: 118 },
    snare: { label: 'Snare',  key: 's', cx: 150, cy: 300 },
    floor: { label: 'Floor',  key: 'd', cx: 496, cy: 268 },
    kick:  { label: 'Kick',   key: ' ', cx: 300, cy: 338 },
  };
  const KEY_LABEL = { ' ': 'space' };

  /* ---------- SVG piece builders ---------- */
  function lugs(cx, cy, rx, ry, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="url(#chrome)"/>`;
    }
    return s;
  }

  // A cylindrical drum seen at a slight angle (head ellipse + shell body).
  function drum(p, rx, ry, depth, shellId, labelDark) {
    const { cx, cy, label, key } = p;
    const body = `M ${cx - rx} ${cy}
                  L ${cx - rx} ${cy + depth}
                  A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy + depth}
                  L ${cx + rx} ${cy} Z`;
    return `
      <g class="pad" data-id="${idOf(p)}" tabindex="0" role="button" aria-label="${label}">
        <path d="${body}" fill="url(#${shellId})" stroke="#000" stroke-opacity="0.25"/>
        <ellipse cx="${cx}" cy="${cy + depth}" rx="${rx}" ry="${ry}" fill="#000" opacity="0.18"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx + 4}" ry="${ry + 4}" fill="url(#chrome)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#head)"/>
        ${lugs(cx, cy, rx + 4, ry + 4, 8)}
        <text class="label" x="${cx}" y="${cy + 2}" text-anchor="middle" fill="${labelDark}">${label}</text>
        <text class="key" x="${cx}" y="${cy + 15}" text-anchor="middle">${(KEY_LABEL[key] || key).toUpperCase()}</text>
      </g>`;
  }

  function bass(p, r, shellId) {
    const { cx, cy, label, key } = p;
    return `
      <g class="pad" data-id="${idOf(p)}" tabindex="0" role="button" aria-label="${label}">
        <circle cx="${cx}" cy="${cy + 6}" r="${r}" fill="#000" opacity="0.2"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${shellId})"/>
        <circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="url(#chrome)"/>
        <circle cx="${cx}" cy="${cy}" r="${r - 16}" fill="url(#bassHead)"/>
        ${lugs(cx, cy, r - 4, r - 4, 12)}
        <rect x="${cx - 70}" y="${cy + r - 18}" width="22" height="40" rx="5" fill="url(#chrome)"/>
        <rect x="${cx + 48}" y="${cy + r - 18}" width="22" height="40" rx="5" fill="url(#chrome)"/>
        <text class="label" x="${cx}" y="${cy + 2}" text-anchor="middle" fill="#5b3620">${label}</text>
        <text class="key" x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="11">${(KEY_LABEL[key] || key).toUpperCase()}</text>
      </g>`;
  }

  function cymbal(p, rx, ry, standBottom, tilt) {
    const { cx, cy, label, key } = p;
    return `
      <g aria-hidden="true"><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${standBottom}" stroke="url(#chrome)" stroke-width="4"/>
        <line x1="${cx}" y1="${standBottom}" x2="${cx - 34}" y2="${standBottom + 18}" stroke="#7c828a" stroke-width="3"/>
        <line x1="${cx}" y1="${standBottom}" x2="${cx + 34}" y2="${standBottom + 18}" stroke="#7c828a" stroke-width="3"/></g>
      <g class="pad" data-id="${idOf(p)}" tabindex="0" role="button" aria-label="${label}" transform="rotate(${tilt || 0} ${cx} ${cy})">
        <ellipse cx="${cx}" cy="${cy + 5}" rx="${rx}" ry="${ry}" fill="#000" opacity="0.18"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#cymbal)" stroke="#7a5a1e" stroke-width="1"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.66}" ry="${ry * 0.66}" fill="none" stroke="rgba(120,80,20,0.35)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.33}" ry="${ry * 0.33}" fill="none" stroke="rgba(120,80,20,0.35)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.16}" ry="${ry * 0.55}" fill="url(#bell)"/>
        <text class="key cym" x="${cx}" y="${cy - ry - 6}" text-anchor="middle">${(KEY_LABEL[key] || key).toUpperCase()}</text>
        <text class="label cym" x="${cx}" y="${cy + ry + 14}" text-anchor="middle">${label}</text>
      </g>`;
  }

  // map a piece object back to its id
  let _pieceId;
  function idOf() { return _pieceId; }

  function buildSVG() {
    // build pieces with their id captured
    const draw = (id, fn) => { _pieceId = id; return fn(PIECES[id]); };

    return `
<svg class="kit-svg" viewBox="0 0 ${VB_W} ${VB_H}" role="group" aria-label="Playable drum set" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="head" cx="42%" cy="36%" r="70%">
      <stop offset="0%" stop-color="#fffdf7"/><stop offset="55%" stop-color="#efe7d6"/>
      <stop offset="100%" stop-color="#cabfa8"/>
    </radialGradient>
    <radialGradient id="bassHead" cx="44%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#fbf6ec"/><stop offset="60%" stop-color="#e6dac6"/>
      <stop offset="100%" stop-color="#c8b89c"/>
    </radialGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f4f7fa"/><stop offset="45%" stop-color="#aab2ba"/>
      <stop offset="55%" stop-color="#cfd6dc"/><stop offset="100%" stop-color="#7e858d"/>
    </linearGradient>
    <linearGradient id="woodA" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#9a6238"/><stop offset="100%" stop-color="#5e3a20"/>
    </linearGradient>
    <linearGradient id="woodB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8a5631"/><stop offset="100%" stop-color="#50311b"/>
    </linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dfe3e8"/><stop offset="100%" stop-color="#9aa1a8"/>
    </linearGradient>
    <linearGradient id="bassShell" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6e4426"/><stop offset="100%" stop-color="#3f2616"/>
    </linearGradient>
    <radialGradient id="cymbal" cx="42%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#f7e6ad"/><stop offset="42%" stop-color="#dcb45f"/>
      <stop offset="74%" stop-color="#b5862f"/><stop offset="100%" stop-color="#8a6320"/>
    </radialGradient>
    <radialGradient id="bell" cx="42%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#fdf0c4"/><stop offset="60%" stop-color="#d7ad57"/>
      <stop offset="100%" stop-color="#a87c2c"/>
    </radialGradient>
  </defs>

  <!-- cymbals & stands (drawn behind the drums) -->
  ${draw('crash', p => cymbal(p, 66, 15, 458, -6))}
  ${draw('ride',  p => cymbal(p, 80, 19, 458,  5))}
  ${draw('hat',   p => cymbal(p, 52, 13, 452,  0))}

  <!-- drums -->
  ${draw('kick',  p => bass(p, 108, 'bassShell'))}
  ${draw('floor', p => drum(p, 66, 28, 104, 'woodB', '#5b3620'))}
  ${draw('snare', p => drum(p, 60, 25, 60,  'steel', '#3a3f44'))}
  ${draw('tom1',  p => drum(p, 50, 21, 64,  'woodA', '#5b3620'))}
  ${draw('tom2',  p => drum(p, 55, 23, 66,  'woodA', '#5b3620'))}

  <!-- drumsticks: tip at local (0,0), handle extends downward -->
  <g class="stick" id="stickL"><circle cx="0" cy="0" r="6" fill="#e9d3a8"/><rect x="-4" y="0" width="8" height="120" rx="4" fill="url(#stickGrad)"/></g>
  <g class="stick" id="stickR"><circle cx="0" cy="0" r="6" fill="#e9d3a8"/><rect x="-4" y="0" width="8" height="120" rx="4" fill="url(#stickGrad)"/></g>
  <defs>
    <linearGradient id="stickGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e9d3a8"/><stop offset="55%" stop-color="#b9905c"/><stop offset="100%" stop-color="#7c5a32"/>
    </linearGradient>
  </defs>
</svg>`;
  }

  function build(host) {
    host.innerHTML = buildSVG();
    const svg = host.querySelector('.kit-svg');
    const pads = svg.querySelectorAll('.pad');
    const stickL = svg.querySelector('#stickL');
    const stickR = svg.querySelector('#stickR');
    let useRight = true;

    stickL.style.transform = 'translate(250px, 360px) rotate(-20deg)';
    stickR.style.transform = 'translate(350px, 360px) rotate(20deg)';

    function strike(id, el) {
      DrumAudio.play(id);
      el.classList.remove('hit'); void el.getBBox(); el.classList.add('hit');
      const piece = PIECES[id];
      const stick = useRight ? stickR : stickL;
      const tilt = useRight ? 10 : -10;
      useRight = !useRight;
      stick.style.transform = `translate(${piece.cx}px, ${piece.cy}px) rotate(${tilt}deg) scale(1,0.9)`;
      setTimeout(() => {
        stick.style.transform = `translate(${piece.cx}px, ${piece.cy}px) rotate(${tilt}deg) scale(1,1)`;
      }, 90);
    }

    pads.forEach(el => {
      const id = el.dataset.id;
      el.addEventListener('pointerdown', (ev) => { ev.preventDefault(); strike(id, el); });
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); strike(id, el); }
      });
    });

    // global keyboard play
    const byKey = {};
    Object.keys(PIECES).forEach(id => { byKey[PIECES[id].key] = id; });
    window.addEventListener('keydown', (ev) => {
      if (ev.repeat) return;
      const id = byKey[ev.key.toLowerCase()];
      if (id) {
        if (ev.key === ' ') ev.preventDefault();
        const el = svg.querySelector(`.pad[data-id="${id}"]`);
        if (el) strike(id, el);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-drumkit]').forEach(build);
  });
})();
