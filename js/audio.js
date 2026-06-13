/* =========================================================
   audio.js — Web Audio drum synthesis (no audio files!)
   Shared sound engine used by the drum kit, metronome,
   and play-along beats. Works offline.
   ========================================================= */

const DrumAudio = (() => {
  let ctx = null;

  // Create / resume the audio context on first user interaction.
  function ready() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // A short burst of white noise, reused for snare/hat/crash.
  function noiseBuffer() {
    const len = ctx.sampleRate * 1;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function env(gainNode, time, peak, decay) {
    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.exponentialRampToValueAtTime(peak, time + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  }

  // --- Individual voices ---
  function kick(t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    env(g, t, 1.0, 0.4);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.45);
  }

  function snare(t) {
    // noise body
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer();
    const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 1500;
    const ng = ctx.createGain(); env(ng, t, 0.7, 0.2);
    n.connect(nf).connect(ng).connect(ctx.destination);
    n.start(t); n.stop(t + 0.25);
    // tonal "crack"
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 180;
    const og = ctx.createGain(); env(og, t, 0.4, 0.12);
    o.connect(og).connect(ctx.destination);
    o.start(t); o.stop(t + 0.15);
  }

  function hat(t, open) {
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer();
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = ctx.createGain(); env(g, t, 0.4, open ? 0.4 : 0.06);
    n.connect(f).connect(g).connect(ctx.destination);
    n.start(t); n.stop(t + (open ? 0.45 : 0.1));
  }

  function tom(t, freq) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.3);
    env(g, t, 0.8, 0.4);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.45);
  }

  function crash(t) {
    const n = ctx.createBufferSource(); n.buffer = noiseBuffer();
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000;
    const g = ctx.createGain(); env(g, t, 0.5, 1.2);
    n.connect(f).connect(g).connect(ctx.destination);
    n.start(t); n.stop(t + 1.3);
  }

  // metronome click (separate pitches for beat 1 vs others)
  function click(t, accent) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = accent ? 1500 : 900;
    env(g, t, 0.5, 0.05);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.06);
  }

  // Public play() — name based, schedules at optional time.
  function play(name, when) {
    ready();
    const t = when != null ? when : ctx.currentTime;
    switch (name) {
      case 'kick':   kick(t); break;
      case 'snare':  snare(t); break;
      case 'hat':    hat(t, false); break;
      case 'openhat':hat(t, true); break;
      case 'tom1':   tom(t, 220); break;
      case 'tom2':   tom(t, 160); break;
      case 'floor':  tom(t, 110); break;
      case 'crash':  crash(t); break;
      case 'click':  click(t, false); break;
      case 'click1': click(t, true); break;
    }
  }

  return { ready, play, now: () => ready().currentTime };
})();
