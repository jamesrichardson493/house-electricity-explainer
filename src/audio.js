// Optional procedural Web Audio API soundscape (muted until user enables)

import {
  BREAKER_OFF_TIME,
  BREAKER_ON_TIME,
  PLUG_INSERT_TIME,
  SWITCH_TRIGGER_TIME,
} from './timeline.js';

export function createAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let humOsc1 = null;
  let humOsc2 = null;
  let humGain = null;
  let fieldOsc = null;
  let fieldGain = null;
  let crystalOsc = null;
  let crystalGain = null;

  let enabled = false;
  let prevTime = 0;

  function initContext() {
    if (ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    // 1. 60 Hz + 120 Hz transformer hum
    humGain = ctx.createGain();
    humGain.gain.value = 0;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 220;
    humGain.connect(humFilter);
    humFilter.connect(masterGain);

    humOsc1 = ctx.createOscillator();
    humOsc1.type = 'sine';
    humOsc1.frequency.value = 60;
    humOsc1.connect(humGain);
    humOsc1.start();

    humOsc2 = ctx.createOscillator();
    humOsc2.type = 'triangle';
    humOsc2.frequency.value = 120;
    const h2Sub = ctx.createGain();
    h2Sub.gain.value = 0.25;
    humOsc2.connect(h2Sub);
    h2Sub.connect(humGain);
    humOsc2.start();

    // 2. Shimmering EM field drone (Chapter 6)
    fieldGain = ctx.createGain();
    fieldGain.gain.value = 0;
    fieldGain.connect(masterGain);

    fieldOsc = ctx.createOscillator();
    fieldOsc.type = 'sine';
    fieldOsc.frequency.value = 180;
    fieldOsc.connect(fieldGain);
    fieldOsc.start();

    // 3. Crystalline atomic harmonic (Chapters 7-8)
    crystalGain = ctx.createGain();
    crystalGain.gain.value = 0;
    crystalGain.connect(masterGain);

    crystalOsc = ctx.createOscillator();
    crystalOsc.type = 'sine';
    crystalOsc.frequency.value = 360;
    crystalOsc.connect(crystalGain);
    crystalOsc.start();
  }

  function playToneBurst(startFreq, endFreq, dur, vol, type = 'triangle', delay = 0) {
    if (!ctx || !enabled) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, start);
    if (endFreq !== startFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), start + dur);
    }
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function playSwitchClick() {
    playToneBurst(950, 140, 0.045, 0.32, 'square', 0);
    playToneBurst(540, 540, 0.55, 0.12, 'sine', 0.03);
  }

  function playBreakerSnap(isOn) {
    playToneBurst(isOn ? 240 : 420, isOn ? 620 : 120, 0.075, 0.34, 'square', 0);
    if (isOn) playToneBurst(480, 480, 0.35, 0.1, 'sine', 0.05);
  }

  function playNcvtChirp() {
    playToneBurst(1320, 1320, 0.06, 0.12, 'sine', 0);
    playToneBurst(1320, 1320, 0.06, 0.12, 'sine', 0.11);
  }

  function playScrewTighten() {
    playToneBurst(440, 620, 0.045, 0.14, 'triangle', 0);
    playToneBurst(520, 740, 0.045, 0.14, 'triangle', 0.14);
  }

  function playPlugSeat() {
    playToneBurst(180, 75, 0.08, 0.3, 'triangle', 0);
    playToneBurst(360, 540, 0.45, 0.14, 'sine', 0.05);
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    if (enabled) {
      initContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    }
    if (ctx && masterGain) {
      const now = ctx.currentTime;
      masterGain.gain.setTargetAtTime(enabled ? 0.16 : 0, now, 0.08);
    }
    return enabled;
  }

  function update(tl, ac, isPlaying) {
    if (!ctx || !enabled) {
      prevTime = tl.t;
      return;
    }

    const now = ctx.currentTime;
    const activeVol = isPlaying ? 0.16 : 0.04;
    masterGain.gain.setTargetAtTime(activeVol, now, 0.08);

    // Edge-trigger procedural mechanical/electrical cues on forward playback
    if (isPlaying) {
      const crossed = (mark) => prevTime < mark && tl.t >= mark;
      if (crossed(SWITCH_TRIGGER_TIME)) playSwitchClick();
      if (crossed(BREAKER_OFF_TIME)) playBreakerSnap(false);
      if (crossed(19.8)) playNcvtChirp();
      if (
        crossed(22.8) ||
        crossed(25.1) ||
        crossed(29.2) ||
        crossed(30.2) ||
        crossed(32.0)
      ) {
        playScrewTighten();
      }
      if (crossed(BREAKER_ON_TIME)) playBreakerSnap(true);
      if (crossed(PLUG_INSERT_TIME)) playPlugSeat();
    }
    prevTime = tl.t;

    const ch = tl.chapter.id;
    const humLevel = ch <= 1 ? 0.45 : ch === 2 ? 0.22 : (tl.breakerOn ? 0.08 : 0.0);
    const fieldLevel = ch === 6 ? (0.14 + 0.28 * ac.poyntingMag) : 0.0;
    const crystalLevel = ch >= 7 ? (0.12 + 0.12 * Math.abs(ac.sinPhi)) : 0.0;

    humGain.gain.setTargetAtTime(humLevel, now, 0.12);
    fieldGain.gain.setTargetAtTime(fieldLevel, now, 0.12);
    crystalGain.gain.setTargetAtTime(crystalLevel, now, 0.12);
  }

  function resetClock(t) {
    prevTime = t;
  }

  return {
    setEnabled,
    isEnabled: () => enabled,
    update,
    resetClock,
  };
}
