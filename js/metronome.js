/* =========================================================
   metronome.js — A built-in metronome with visual beat
   lights. Look-ahead scheduling for steady timing.
   Renders into [data-metronome].
   ========================================================= */

(function () {
  function build(host) {
    let bpm = 80;
    let beatsPerBar = 4;
    let playing = false;
    let nextNoteTime = 0;
    let beat = 0;
    let timer = null;

    host.innerHTML = `
      <h3>🎵 Metronome</h3>
      <div class="metro-bpm"><span id="m-bpm">${bpm}</span><span> BPM</span></div>
      <input type="range" class="metro-slider" min="40" max="200" value="${bpm}" aria-label="Tempo">
      <div class="metro-controls">
        <button class="btn-step" data-d="-5" aria-label="Slower">−</button>
        <button class="btn-go">▶ Start</button>
        <button class="btn-step" data-d="5" aria-label="Faster">+</button>
      </div>
      <div class="metro-lights"></div>
      <p class="sound-status">Tip: start slow and only speed up when it feels easy.</p>
    `;

    const bpmLabel = host.querySelector('#m-bpm');
    const slider = host.querySelector('.metro-slider');
    const goBtn = host.querySelector('.btn-go');
    const lights = host.querySelector('.metro-lights');

    for (let i = 0; i < beatsPerBar; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' beat1' : '');
      lights.appendChild(d);
    }
    const dots = [...lights.children];

    function setBpm(v) {
      bpm = Math.max(40, Math.min(200, v));
      bpmLabel.textContent = bpm;
      slider.value = bpm;
    }

    slider.addEventListener('input', () => setBpm(+slider.value));
    host.querySelectorAll('.btn-step').forEach(b =>
      b.addEventListener('click', () => setBpm(bpm + +b.dataset.d)));

    function scheduler() {
      const ctxNow = DrumAudio.now();
      while (nextNoteTime < ctxNow + 0.1) {
        const accent = beat === 0;
        DrumAudio.play(accent ? 'click1' : 'click', nextNoteTime);
        const thisBeat = beat;
        const delay = (nextNoteTime - ctxNow) * 1000;
        setTimeout(() => flash(thisBeat), Math.max(0, delay));
        nextNoteTime += 60 / bpm;
        beat = (beat + 1) % beatsPerBar;
      }
    }

    function flash(i) {
      dots.forEach(d => d.classList.remove('on'));
      dots[i].classList.add('on');
      setTimeout(() => dots[i].classList.remove('on'), 120);
    }

    function start() {
      DrumAudio.ready();
      playing = true;
      beat = 0;
      nextNoteTime = DrumAudio.now() + 0.05;
      timer = setInterval(scheduler, 25);
      goBtn.textContent = '■ Stop';
      goBtn.classList.add('playing');
    }
    function stop() {
      playing = false;
      clearInterval(timer);
      dots.forEach(d => d.classList.remove('on'));
      goBtn.textContent = '▶ Start';
      goBtn.classList.remove('playing');
    }

    goBtn.addEventListener('click', () => playing ? stop() : start());
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-metronome]').forEach(build);
  });
})();
