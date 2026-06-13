/* =========================================================
   audio.js — Web Audio drum synthesis (no audio files!)
   Upgraded voices tuned to sound like their real
   instruments: punchy kick, snappy snare with wire buzz,
   metallic (909-style) hi-hats & cymbals, pitched toms.
   Shared by the drum kit, metronome, and play-along beats.
   ========================================================= */

const DrumAudio = (() => {
  let ctx = null;
  let noise = null;          // cached white-noise buffer
  let master = null;         // master bus with a touch of compression

  function ready() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      // gentle bus compression so loud hits don't clip
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -10; comp.ratio.value = 4;
      comp.attack.value = 0.003; comp.release.value = 0.25;
      master = ctx.createGain(); master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
      noise = buildNoise();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function buildNoise() {
    const len = ctx.sampleRate * 1;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  function noiseSrc() { const s = ctx.createBufferSource(); s.buffer = noise; return s; }

  // quick percussive envelope helper
  function hit(g, t, peak, decay, sustain) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(sustain || 0.0001, t + decay);
  }

  /* ---------------- KICK ---------------- */
  function kick(t) {
    const o = ctx.createOscillator(); o.type = 'sine';
    const g = ctx.createGain();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.11);
    hit(g, t, 1.0, 0.42);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.5);
    // beater click attack
    const c = noiseSrc();
    const cf = ctx.createBiquadFilter(); cf.type = 'highpass'; cf.frequency.value = 1200;
    const cg = ctx.createGain(); hit(cg, t, 0.35, 0.03);
    c.connect(cf).connect(cg).connect(master);
    c.start(t); c.stop(t + 0.05);
  }

  /* ---------------- SNARE ---------------- */
  function snare(t) {
    // drum body — two detuned tones
    [185, 278].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const g = ctx.createGain(); hit(g, t, i ? 0.28 : 0.45, 0.11);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + 0.18);
    });
    // snare wires — bandpassed noise with a short buzzy tail
    const n = noiseSrc();
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.7;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    n.connect(bp).connect(hp).connect(g).connect(master);
    n.start(t); n.stop(t + 0.25);
  }

  /* ------------- METALLIC BANK (hats / cymbals) -------------
     Six square waves at inharmonic ratios → that classic
     metallic shimmer, shaped by high/band-pass filters. */
  const RATIOS = [2, 3, 4.16, 5.43, 6.79, 8.21];
  function metal(t, base, decay, peak, hpFreq, bpFreq) {
    const out = ctx.createGain();
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = bpFreq; bp.Q.value = 0.8;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hpFreq;
    bp.connect(hp).connect(out).connect(master);
    RATIOS.forEach(r => {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = base * r;
      o.connect(bp); o.start(t); o.stop(t + decay + 0.05);
    });
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(peak, t + 0.003);
    out.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }
  function hat(t, open)  { metal(t, 40, open ? 0.4 : 0.055, 0.32, 7000, 10000); }
  function crash(t)      { // metal shimmer + airy noise wash
    metal(t, 38, 1.5, 0.3, 5000, 8000);
    const n = noiseSrc();
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    n.connect(hp).connect(g).connect(master);
    n.start(t); n.stop(t + 1.5);
  }

  /* ---------------- TOMS ---------------- */
  function tom(t, freq) {
    const o = ctx.createOscillator(); o.type = 'sine';
    const g = ctx.createGain();
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.3);
    hit(g, t, 0.85, 0.42);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.5);
    // slight attack thump
    const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 1.5;
    const g2 = ctx.createGain(); hit(g2, t, 0.2, 0.05);
    o2.connect(g2).connect(master); o2.start(t); o2.stop(t + 0.08);
  }

  /* ------------- METRONOME CLICK ------------- */
  function click(t, accent) {
    const o = ctx.createOscillator(); o.type = 'square';
    const g = ctx.createGain();
    o.frequency.value = accent ? 1600 : 1000;
    hit(g, t, 0.4, 0.04);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.05);
  }

  function play(name, when) {
    ready();
    const t = when != null ? when : ctx.currentTime;
    switch (name) {
      case 'kick':    kick(t); break;
      case 'snare':   snare(t); break;
      case 'hat':     hat(t, false); break;
      case 'openhat': hat(t, true); break;
      case 'tom1':    tom(t, 235); break;
      case 'tom2':    tom(t, 180); break;
      case 'floor':   tom(t, 120); break;
      case 'crash':   crash(t); break;
      case 'click':   click(t, false); break;
      case 'click1':  click(t, true); break;
    }
  }

  return { ready, play, now: () => ready().currentTime };
})();
