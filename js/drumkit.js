/* =========================================================
   drumkit.js — Renders the drum SET as a clean line-art
   illustration (technical-sketch style) matching the
   reference layout: two rack toms over a front-facing bass
   drum, snare left, floor tom right, cymbals on stands, and
   a hi-hat with pedal. Playable by click, tap, or keyboard.
   ========================================================= */

(function () {
  const VB_W = 600, VB_H = 480;

  // Interactive pieces — id (=sound), label, key, and the
  // centre of the playing surface (used for the sticks).
  const P = {
    crash: { label: 'Crash',  key: 'q', cx: 168, cy: 116 },
    ride:  { label: 'Ride',   key: 'r', cx: 432, cy: 124 },
    hat:   { label: 'Hi-Hat', key: 'a', cx: 92,  cy: 250 },
    tom1:  { label: 'Tom 1',  key: 'w', cx: 250, cy: 196 },
    tom2:  { label: 'Tom 2',  key: 'e', cx: 348, cy: 190 },
    snare: { label: 'Snare',  key: 's', cx: 196, cy: 300 },
    floor: { label: 'Floor',  key: 'd', cx: 452, cy: 300 },
    kick:  { label: 'Kick',   key: ' ', cx: 300, cy: 366 },
  };
  const KEY_LABEL = { ' ': 'space' };
  let _id;

  /* ---- small drawing helpers (line-art) ---- */
  function lugs(cx, cy, rx, ry, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      const c = Math.cos(a), si = Math.sin(a);
      s += `<line class="ln thin" x1="${(cx + c * rx).toFixed(1)}" y1="${(cy + si * ry).toFixed(1)}"
              x2="${(cx + c * rx * 1.14).toFixed(1)}" y2="${(cy + si * ry * 1.14).toFixed(1)}"/>`;
    }
    return s;
  }
  const txt = (p) => `
    <text class="label" x="${p.cx}" y="${p.cy + 4}" text-anchor="middle">${p.label}</text>
    <text class="key" x="${p.cx}" y="${p.cy + 16}" text-anchor="middle">${(KEY_LABEL[p.key] || p.key).toUpperCase()}</text>`;

  // A cylindrical drum, perspective (head ellipse + shell).
  function drum(p, rx, ry, depth, lugN) {
    const { cx, cy } = p;
    const shell = `M ${cx - rx} ${cy} L ${cx - rx} ${cy + depth}
                   A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy + depth}
                   L ${cx + rx} ${cy}`;
    return `
      <g class="pad" data-id="${_id}" tabindex="0" role="button" aria-label="${p.label}">
        <path class="ln" d="${shell}"/>
        <ellipse class="ln thin" cx="${cx}" cy="${cy + depth}" rx="${rx}" ry="${ry}"/>
        <ellipse class="flash" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
        <ellipse class="ln" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
        <ellipse class="ln thin" cx="${cx}" cy="${cy}" rx="${rx * 0.82}" ry="${ry * 0.82}"/>
        ${lugs(cx, cy, rx, ry, lugN || 8)}
        <ellipse class="hit-area" cx="${cx}" cy="${cy + depth / 2}" rx="${rx + 4}" ry="${ry + depth / 2}"/>
        ${txt(p)}
      </g>`;
  }

  // Big front-facing bass drum.
  function bass(p, r) {
    const { cx, cy } = p;
    return `
      <g class="pad" data-id="${_id}" tabindex="0" role="button" aria-label="${p.label}">
        <circle class="flash" cx="${cx}" cy="${cy}" r="${r - 14}"/>
        <circle class="ln" cx="${cx}" cy="${cy}" r="${r}"/>
        <circle class="ln thin" cx="${cx}" cy="${cy}" r="${r - 9}"/>
        <circle class="ln thin" cx="${cx}" cy="${cy}" r="${r - 15}"/>
        ${lugs(cx, cy, r - 4, r - 4, 14)}
        <circle class="hit-area" cx="${cx}" cy="${cy}" r="${r}"/>
        ${txt(p)}
      </g>`;
  }

  // Cymbal disc (stand drawn separately in hardware layer).
  function cymbal(p, rx, ry, tilt) {
    const { cx, cy } = p;
    return `
      <g class="pad" data-id="${_id}" tabindex="0" role="button" aria-label="${p.label}"
         transform="rotate(${tilt || 0} ${cx} ${cy})">
        <ellipse class="flash" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
        <ellipse class="ln" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
        <ellipse class="ln thin" cx="${cx}" cy="${cy}" rx="${rx * 0.6}" ry="${ry * 0.6}"/>
        <ellipse class="ln thin" cx="${cx}" cy="${cy}" rx="${rx * 0.16}" ry="${ry * 0.5}"/>
        <ellipse class="hit-area" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>
        <text class="label" x="${cx}" y="${cy + ry + 15}" text-anchor="middle">${p.label}</text>
        <text class="key" x="${cx}" y="${cy - ry - 6}" text-anchor="middle">${(KEY_LABEL[p.key] || p.key).toUpperCase()}</text>
      </g>`;
  }

  // Hardware: stands, legs, pedals (non-interactive line-art).
  function hardware() {
    return `
    <g class="hardware">
      <!-- crash stand -->
      <line class="ln thin" x1="${P.crash.cx}" y1="${P.crash.cy}" x2="178" y2="430"/>
      <line class="ln thin" x1="178" y1="430" x2="150" y2="458"/>
      <line class="ln thin" x1="178" y1="430" x2="206" y2="458"/>
      <line class="ln thin" x1="178" y1="430" x2="178" y2="460"/>
      <!-- ride stand -->
      <line class="ln thin" x1="${P.ride.cx}" y1="${P.ride.cy}" x2="452" y2="430"/>
      <line class="ln thin" x1="452" y1="430" x2="426" y2="458"/>
      <line class="ln thin" x1="452" y1="430" x2="480" y2="458"/>
      <line class="ln thin" x1="452" y1="430" x2="452" y2="460"/>
      <!-- hi-hat: rod, lower cymbal, legs, pedal -->
      <line class="ln thin" x1="${P.hat.cx}" y1="${P.hat.cy}" x2="${P.hat.cx}" y2="448"/>
      <ellipse class="ln thin" cx="${P.hat.cx}" cy="${P.hat.cy + 9}" rx="50" ry="11"/>
      <line class="ln thin" x1="${P.hat.cx}" y1="448" x2="66" y2="466"/>
      <line class="ln thin" x1="${P.hat.cx}" y1="448" x2="118" y2="466"/>
      <line class="ln thin" x1="62" y1="466" x2="96" y2="466"/>
      <rect class="ln thin" x="60" y="452" width="34" height="9" rx="3"/>
      <!-- snare stand -->
      <line class="ln thin" x1="${P.snare.cx - 16}" y1="${P.snare.cy + 24}" x2="172" y2="452"/>
      <line class="ln thin" x1="${P.snare.cx + 16}" y1="${P.snare.cy + 24}" x2="226" y2="452"/>
      <line class="ln thin" x1="${P.snare.cx}" y1="${P.snare.cy + 20}" x2="200" y2="452"/>
      <line class="ln thin" x1="170" y1="452" x2="230" y2="452"/>
      <!-- floor tom legs -->
      <line class="ln thin" x1="${P.floor.cx - 52}" y1="${P.floor.cy + 30}" x2="${P.floor.cx - 60}" y2="455"/>
      <line class="ln thin" x1="${P.floor.cx + 52}" y1="${P.floor.cy + 30}" x2="${P.floor.cx + 60}" y2="455"/>
      <!-- bass spurs + pedal -->
      <line class="ln thin" x1="${P.kick.cx - 70}" y1="${P.kick.cy + 60}" x2="${P.kick.cx - 96}" y2="450"/>
      <line class="ln thin" x1="${P.kick.cx + 70}" y1="${P.kick.cy + 60}" x2="${P.kick.cx + 96}" y2="450"/>
      <rect class="ln thin" x="${P.kick.cx - 16}" y="446" width="32" height="12" rx="3"/>
      <line class="ln thin" x1="${P.kick.cx}" y1="${P.kick.cy + 86}" x2="${P.kick.cx}" y2="448"/>
    </g>`;
  }

  function buildSVG() {
    const D = (id, fn) => { _id = id; return fn(P[id]); };
    return `
<svg class="kit-svg" viewBox="0 0 ${VB_W} ${VB_H}" role="group" aria-label="Playable drum set" xmlns="http://www.w3.org/2000/svg">
  ${hardware()}
  ${D('crash', p => cymbal(p, 78, 18, -6))}
  ${D('ride',  p => cymbal(p, 82, 19, 6))}
  ${D('hat',   p => cymbal(p, 52, 12, 0))}
  ${D('kick',  p => bass(p, 86))}
  ${D('floor', p => drum(p, 58, 23, 96, 10))}
  ${D('snare', p => drum(p, 52, 20, 52, 8))}
  ${D('tom1',  p => drum(p, 46, 18, 66, 8))}
  ${D('tom2',  p => drum(p, 50, 19, 68, 8))}

  <g class="stick" id="stickL"><circle class="ln" cx="0" cy="0" r="5" fill="#d9c7a3"/><line class="ln" x1="0" y1="0" x2="0" y2="118"/></g>
  <g class="stick" id="stickR"><circle class="ln" cx="0" cy="0" r="5" fill="#d9c7a3"/><line class="ln" x1="0" y1="0" x2="0" y2="118"/></g>
</svg>`;
  }

  function build(host) {
    host.innerHTML = buildSVG();
    const svg = host.querySelector('.kit-svg');
    const pads = svg.querySelectorAll('.pad');
    const stickL = svg.querySelector('#stickL');
    const stickR = svg.querySelector('#stickR');
    let useRight = true;

    stickL.style.transform = 'translate(250px, 360px) rotate(-22deg)';
    stickR.style.transform = 'translate(352px, 360px) rotate(22deg)';

    function strike(id, el) {
      DrumAudio.play(id);
      el.classList.remove('hit'); void el.getBBox(); el.classList.add('hit');
      const piece = P[id];
      const stick = useRight ? stickR : stickL;
      const tilt = useRight ? 12 : -12;
      useRight = !useRight;
      stick.style.transform = `translate(${piece.cx}px, ${piece.cy}px) rotate(${tilt}deg) scale(1,0.88)`;
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

    const byKey = {};
    Object.keys(P).forEach(id => { byKey[P[id].key] = id; });
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
