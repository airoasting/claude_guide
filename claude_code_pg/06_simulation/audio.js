// [11] AUDIO — 앰비언트 사운드 (Web Audio API, 프로시저럴)
'use strict';

const AUDIO = (() => {
  let ctx = null;
  let masterGain = null;
  let windNode = null;
  let isRunning = false;
  let cricketTimer = null;
  const TARGET_VOLUME = 0.04;

  function createAudioContext() {
    if (ctx) return ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
    } catch(e) {
      ctx = null;
    }
    return ctx;
  }

  // ─── Brown noise generator ───────────────────────────────────────
  function createBrownNoise() {
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // normalize
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Low-pass filter (wind-like)
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(200, ctx.currentTime);
    lpf.Q.setValueAtTime(1, ctx.currentTime);

    // Volume LFO (0.1 Hz gentle swell)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.3, ctx.currentTime);
    lfo.connect(lfoGain);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.7, ctx.currentTime);
    lfoGain.connect(windGain.gain);

    src.connect(lpf);
    lpf.connect(windGain);
    windGain.connect(masterGain);

    lfo.start();
    src.start();

    return { src, lpf, windGain, lfo };
  }

  // ─── Single cricket chirp ────────────────────────────────────────
  function chirp() {
    if (!ctx || !isRunning) return;
    const freq = 4000 + Math.random() * 1000;
    const pan = (Math.random() - 0.5) * 2; // -1 to 1

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, ctx.currentTime);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    // Schedule next chirp
    const nextDelay = 2000 + Math.random() * 3000;
    cricketTimer = setTimeout(chirp, nextDelay);
  }

  // ─── Start audio ─────────────────────────────────────────────────
  function start(immediate = false) {
    if (!createAudioContext()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (isRunning) return;
    isRunning = true;

    windNode = createBrownNoise();

    // Fade in master gain
    const targetT = ctx.currentTime + (immediate ? 0 : 2.0);
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(
      immediate ? TARGET_VOLUME : 0,
      ctx.currentTime
    );
    if (!immediate) {
      masterGain.gain.linearRampToValueAtTime(TARGET_VOLUME, targetT);
    }

    // Start cricket chirps
    const firstDelay = 1000 + Math.random() * 2000;
    cricketTimer = setTimeout(chirp, firstDelay);
  }

  // ─── Stop audio ──────────────────────────────────────────────────
  function stop() {
    if (!isRunning) return;
    isRunning = false;

    clearTimeout(cricketTimer);

    if (ctx && masterGain) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    }

    setTimeout(() => {
      if (!isRunning && windNode) {
        try { windNode.src.stop(); } catch(e) {}
        try { windNode.lfo.stop(); } catch(e) {}
        windNode = null;
      }
    }, 400);
  }

  // ─── Public API ──────────────────────────────────────────────────
  return { start, stop };
})();
