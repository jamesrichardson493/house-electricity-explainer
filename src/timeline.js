// Master 52-second timeline: 9 chapters combining first-principles physics, parallel US outlet branching, and electron motion.

import { TIMELINE_DURATION } from './physics.js';

export const SWITCH_TRIGGER_TIME = 11.2;
export const BREAKER_OFF_TIME = 15.2;
export const BREAKER_ON_TIME = 33.0;
export const PLUG_INSERT_TIME = 34.3;
export const PLUG1_TEST_OFF_START = 35.4;
export const PLUG1_TEST_OFF_END = 36.6;

export const CHAPTERS = [
  {
    id: 0,
    num: 1,
    shortLabel: '1 Hookup',
    start: 0.0,
    end: 5.0,
    jumpTime: 0.2,
    stage: 'A',
    callout: '7,200 V → 120 V / 240 V',
    title: 'The Hookup — Stepping Down Voltage',
    body: 'Street lines carry 7,200 V so less current—and less wasted heat—travels miles from the substation. Inside the pole transformer, pulsing magnetic flux bridges two separate coils to step voltage down to 240 V split into twin 120 V legs.',
    guideBody: 'High voltage reduces line current for the same power (P = V·I), slashing resistive heating (I²R) along neighborhood lines. Inside the pole cylinder, the primary coil drives an alternating magnetic field through a laminated iron core, inducing 240 V across the secondary coil. Grounding the midpoint ("center tap") creates two opposite 120 V hot legs (L1 and L2) plus a 0 V neutral reference.',
  },
  {
    id: 1,
    num: 2,
    shortLabel: '2 Panel',
    start: 5.0,
    end: 10.0,
    jumpTime: 7.8,
    stage: 'A',
    callout: 'Split-Phase · L1 / L2 / N / Ground',
    title: 'The Breaker Panel — Split-Phase & Safety',
    body: 'Three braided cables sweep into the weatherhead and meter. Inside the panel, two out-of-phase hot busbars wait at +120 V and -120 V while a bare copper rod anchors Neutral to the Earth—creating a safe zero-volt baseline and breaker trip path.',
    guideBody: 'Your main panel distributes power onto two vertical busbars 180° out of phase. Standard 120 V circuits tap one hot leg and return on the white Neutral busbar. Heavy 240 V appliances bridge both L1 and L2. The bare copper Ground wire ties metal boxes to an 8-foot copper earth rod so any stray fault current immediately trips the magnetic-thermal breaker.',
  },
  {
    id: 2,
    num: 3,
    shortLabel: '3 Walls',
    start: 10.0,
    end: 14.5,
    jumpTime: 12.4,
    stage: 'A',
    callout: 'Closed Loop · Romex 12/2',
    title: 'Behind the Walls — Closing the Loop',
    body: 'Sheathed 12/2 Romex snakes through 2×4 studs: black Hot, white Neutral, bare Ground. Voltage sits poised at the open wall switch until the contacts snap shut—completing a closed path through Outlet #1 so energy instantly reaches the lamp.',
    guideBody: 'Before you flip the switch, 120 V alternating potential already waits at the switch terminal, yet zero energy flows because the loop is broken. The moment the switch closes, an electromagnetic wave races along the Romex pair at nearly the speed of light, establishing a complete circuit through the tungsten bulb filament and back on Neutral.',
  },
  {
    id: 3,
    num: 4,
    shortLabel: '4 Shutoff',
    start: 14.5,
    end: 20.5,
    jumpTime: 16.4,
    stage: 'A',
    callout: 'Breaker OFF · 0 V Lockout',
    title: 'Safety First — Kill Power & Verify 0 V',
    body: 'To add a second outlet off Existing Outlet #1, flip the 20 A breaker OFF first and verify 0 V on Outlet #1 with a non-contact voltage tester. Yellow 12/2 NM-B cable bridges cleanly across the stud bay to Box #2.',
    guideBody: 'Under US NEC specs, a 20 A circuit requires 12 AWG copper cable (yellow jacket); 15 A circuits use 14 AWG (white jacket). Always shut the branch breaker OFF and test Outlet #1 with an NCVT pen (0 V) before removing its cover or touching conductors.',
  },
  {
    id: 4,
    num: 5,
    shortLabel: '5 Parallel',
    start: 20.5,
    end: 28.5,
    jumpTime: 22.8,
    stage: 'W',
    callout: 'Same 120 V Rail · Tabs & Pigtail',
    title: 'Tapping Off Outlet #1 — What "Parallel" Means',
    body: 'Wiring in parallel means Hot (120 V) and Neutral (0 V) run like two ladder rails—each outlet is an independent rung across both. Intact Brass and Silver tabs on Outlet #1 feed full 120 V onward to Outlet #2, while a wire-nut pigtail splits Ground safely.',
    guideBody: 'In series, appliances would split 120 V and unplugging one would cut power to the rest. In parallel, Outlet #1’s unbroken Brass tab shares the 120 V Hot rail onto the outgoing Black wire, and its unbroken Silver tab shares the 0 V Neutral rail onto the outgoing White wire. Under US NEC rules, bare grounds twist inside a green wire nut with a pigtail so only one wire lands on Outlet #1’s green screw.',
  },
  {
    id: 5,
    num: 6,
    shortLabel: '6 Wire #2',
    start: 28.5,
    end: 37.5,
    jumpTime: 35.0,
    stage: 'W',
    callout: 'I_total = I₁ + I₂ · Independent Loads',
    title: 'Wiring Outlet #2 & Proving Parallel Loads',
    body: 'On Outlet #2, hook Ground → Green, White → Silver (wide slot), and Black → Brass (narrow slot) clockwise. Restore 120 V and plug in Load #2: currents split (I_total = I₁ + I₂), and unplugging Plug #1 leaves Plug #2 running at full 120 V.',
    guideBody: 'Because Outlet #1 and Outlet #2 form separate parallel rungs across the 120 V Hot and 0 V Neutral rails, each device draws only the current it needs (I_total = I₁ + I₂). Disconnecting Plug #1 simply drops I₁ to zero while Plug #2 continues receiving uninterrupted 120 V power.',
  },
  {
    id: 6,
    num: 7,
    shortLabel: '7 Field',
    start: 37.5,
    end: 42.5,
    jumpTime: 38.6,
    stage: 'B',
    callout: 'Poynting Flux S = E × B',
    title: 'The Field — How Energy Actually Travels',
    body: 'Zooming onto the live parallel copper reveals a profound surprise: energy does not flow inside the metal like water in a pipe. Electric fields (cyan) and magnetic rings (emerald) wrap outside the wire—streaming golden Poynting energy straight into both outlets.',
    guideBody: 'By Maxwell’s equations, energy transport is governed by the Poynting vector S = (1/μ₀)(E × B). The copper wire acts as a waveguide setting up an electric field E between Hot and Neutral and a circular magnetic field B around each wire. When AC flips polarity 60 times a second, both E and B reverse together—so (-E) × (-B) still points forward into your appliances!',
  },
  {
    id: 7,
    num: 8,
    shortLabel: '8 Copper',
    start: 42.5,
    end: 47.5,
    jumpTime: 44.2,
    stage: 'C',
    callout: 'FCC Crystal · 4s¹ Electron Sea',
    title: 'Inside Copper — The Sea of Electrons',
    body: 'Piercing the copper surface exposes a rigid crystal lattice of positively charged copper ions bathed in a fluid quantum sea of outer electrons. As the electric field reverses, this entire electron sea sways gently left and right in place.',
    guideBody: 'Solid copper forms a Face-Centered Cubic (FCC) crystal lattice (lattice constant 0.361 nm). Each copper atom shares one 4s¹ valence electron freely across the crystal. Unlike water surging down a hose, electrons in a 60 Hz wall circuit never travel from the power plant—they simply oscillate coherently back and forth across less than a micrometer!',
  },
  {
    id: 8,
    num: 9,
    shortLabel: '9 Atoms',
    start: 47.5,
    end: 52.0,
    jumpTime: 49.2,
    stage: 'C',
    callout: 'Jiggle + Drift → Heat & Light',
    title: 'At the Electrons — Motion Becomes Light',
    body: 'Each electron zips randomly with thermal energy while drifting back and forth at less than a millimeter per second. Inside a narrow tungsten filament or appliance coil, collisions with atomic cores convert that electric nudge into intense vibration—heat and light.',
    guideBody: 'Individual conduction electrons bounce thermally at ~1.5 × 10⁶ m/s in random directions, canceling out to zero net flow. The AC electric field adds a tiny synchronized drift velocity (~0.1 mm/s peak) opposite the E-field. Whenever drifting electrons scatter off vibrating metal ions, field energy transfers into lattice heat (Joule heating)—powering lights and appliances.',
  },
];

// Camera keyframes per stage (evaluated smoothly in each stage's world coordinates)
const STAGE_A_CAM_KEYS = [
  // Ch 1: Pole & transformer overview -> wider transformer close-up keeping house visible
  { t: 0.0,  pos: [-16.2, 7.8, 12.2],  target: [-10.6, 5.2, 2.2] },
  { t: 2.2,  pos: [-15.0, 7.2, 9.2],   target: [-12.5, 5.8, 2.6] },
  { t: 4.5,  pos: [-13.6, 6.4, 8.2],   target: [-11.4, 4.9, 2.2] },
  // Ch 2: Sweep along triplex to meter, open breaker panel, and ground rod
  { t: 6.4,  pos: [-9.8, 2.4, 7.2],    target: [-7.2, 0.3, 0.8] },
  { t: 8.4,  pos: [-7.0, 1.35, 5.2],   target: [-6.7, 0.2, 0.2] },
  // Ch 3: Glide across 2x4 stud wall to wall switch (11.2s) -> outlet #1 & Edison lamp
  { t: 10.6, pos: [-2.0, 0.85, 4.2],   target: [-1.7, 0.25, 0.0] },
  { t: 12.4, pos: [-0.2, 0.72, 4.9],   target: [-0.15, 0.22, 0.1] },
  { t: 13.9, pos: [0.15, 0.45, 3.2],   target: [0.1, 0.15, 0.0] },
  // Ch 4: Wide shot (Breaker OFF at 15.2s + parallel cable growing from Outlet #1 to Box #2), then zoom onto Outlet #1
  { t: 15.2, pos: [-2.0, 1.15, 9.6],   target: [-1.7, 0.35, 0.2] },
  { t: 17.0, pos: [0.4, 0.75, 6.2],    target: [0.9, 0.15, 0.1] },
  { t: 18.6, pos: [-0.2, 0.2, 2.2],    target: [0.0, 0.0, 0.0] },
  { t: 20.1, pos: [0.0, 0.06, 0.85],   target: [0.0, 0.0, 0.0] },
];

const STAGE_W_CAM_KEYS = [
  // 19.0 - 20.8: Existing Outlet #1 NCVT 0 V verification
  { t: 19.0, pos: [-9.5, 0.3, 16.5],   target: [-5.6, -0.7, 0.2] },
  { t: 20.6, pos: [-9.8, 0.3, 16.8],   target: [-5.6, -0.8, 0.2] },
  // 21.8 - 23.7: Outlet #1 Right / Brass side (Incoming upper Hot, intact Brass tab, outgoing lower Hot)
  { t: 22.0, pos: [4.2, 0.5, 11.8],    target: [-3.8, -0.2, 0.0] },
  { t: 23.5, pos: [4.4, 0.5, 11.6],    target: [-3.8, -0.2, 0.0] },
  // Arc cleanly around FRONT of Outlet #1 to Left / Silver & Ground Pigtail side
  { t: 24.1, pos: [-5.2, 0.7, 15.6],   target: [-5.2, -0.2, 0.0] },
  { t: 24.8, pos: [-15.2, 0.2, 12.2],  target: [-6.6, -0.6, -0.3] },
  { t: 26.2, pos: [-15.0, 0.2, 12.4],  target: [-6.6, -0.6, -0.3] },
  // 27.4: Wide twin-outlet overview showing full parallel ladder rails
  { t: 27.4, pos: [0.0, 1.2, 22.0],    target: [0.0, -1.0, 0.0] },
  // 29.0 - 30.6: Outlet #2 Left side (Green Ground screw + Silver Neutral screw)
  { t: 29.0, pos: [-4.6, 0.3, 12.2],   target: [3.8, -0.7, 0.0] },
  { t: 30.4, pos: [-4.8, 0.7, 12.0],   target: [3.8, 0.2, 0.0] },
  // Arc cleanly around FRONT of Outlet #2 to Right / Brass side
  { t: 31.0, pos: [5.2, 0.8, 15.6],    target: [5.2, -0.2, 0.0] },
  { t: 31.7, pos: [15.4, 0.6, 12.2],   target: [6.4, 0.2, 0.0] },
  { t: 32.7, pos: [15.4, 0.6, 12.2],   target: [6.4, 0.2, 0.0] },
  // 33.4 - 34.4: Side-3/4 view of Outlet #2 for 3-prong plug insertion (Ground pin first!)
  { t: 33.5, pos: [15.2, -0.5, 12.4],  target: [5.2, -1.4, 2.0] },
  { t: 34.4, pos: [14.2, -0.4, 12.2],  target: [5.2, -1.2, 1.6] },
  // 35.1 - 36.7: Wide twin-outlet live parallel proof (Plug #1 tests OFF while Plug #2 stays 120 V)
  { t: 35.2, pos: [0.0, 0.7, 21.5],    target: [0.0, -0.85, 0.4] },
  { t: 36.6, pos: [0.0, 0.7, 21.5],    target: [0.0, -0.85, 0.4] },
  // 38.0: Zoom straight into the energized parallel copper rail at (0, -0.6, 0) for W -> B crossfade
  { t: 38.0, pos: [0.0, -0.3, 3.6],    target: [0.0, -0.6, 0.0] },
];

const STAGE_B_CAM_KEYS = [
  { t: 36.8, pos: [0.0, 0.15, 2.5],    target: [0.0, -0.1, 0.0] },
  { t: 38.2, pos: [1.6, 1.1, 13.0],    target: [0.0, -2.0, 0.0] },
  { t: 40.6, pos: [-1.2, 1.4, 11.8],   target: [0.4, -1.9, 0.0] },
  { t: 41.8, pos: [0.2, 0.25, 3.4],    target: [0.0, -0.1, 0.0] },
  { t: 43.2, pos: [0.0, 0.15, 2.4],    target: [0.0, 0.0, 0.0] },
];

const STAGE_C_CAM_KEYS = [
  { t: 41.8, pos: [0.0, 0.4, 3.6],     target: [0.0, -0.2, 0.0] },
  { t: 43.5, pos: [2.2, 1.6, 11.8],    target: [0.0, -0.9, 0.0] },
  { t: 46.5, pos: [-1.6, 1.2, 10.0],   target: [0.2, -0.7, 0.0] },
  { t: 48.8, pos: [0.8, 0.65, 7.6],    target: [-0.1, -0.45, 0.0] },
  { t: 52.0, pos: [0.2, 0.45, 6.6],    target: [0.0, -0.38, 0.0] },
];

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sampleKeys(keys, t) {
  if (t <= keys[0].t) {
    return { pos: [...keys[0].pos], target: [...keys[0].target] };
  }
  const last = keys[keys.length - 1];
  if (t >= last.t) {
    return { pos: [...last.pos], target: [...last.target] };
  }

  let idx = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    if (t >= keys[i].t && t <= keys[i + 1].t) {
      idx = i;
      break;
    }
  }

  const k0 = keys[Math.max(0, idx - 1)];
  const k1 = keys[idx];
  const k2 = keys[idx + 1];
  const k3 = keys[Math.min(keys.length - 1, idx + 2)];

  const span = Math.max(1e-5, k2.t - k1.t);
  const s = Math.max(0, Math.min(1, (t - k1.t) / span));

  const catmull = (p0, p1, p2, p3, f) => {
    const f2 = f * f;
    const f3 = f2 * f;
    return 0.5 * (
      2 * p1 +
      (-p0 + p2) * f +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * f3
    );
  };

  const pos = [0, 1, 2].map((i) => catmull(k0.pos[i], k1.pos[i], k2.pos[i], k3.pos[i], s));
  const target = [0, 1, 2].map((i) => catmull(k0.target[i], k1.target[i], k2.target[i], k3.target[i], s));
  return { pos, target };
}

export function getChapterForTime(t) {
  const clamped = Math.max(0, Math.min(TIMELINE_DURATION, t));
  for (let i = 0; i < CHAPTERS.length; i++) {
    const ch = CHAPTERS[i];
    if (clamped < ch.end || i === CHAPTERS.length - 1) {
      return ch;
    }
  }
  return CHAPTERS[0];
}

export function evaluateTimeline(t) {
  const clamped = Math.max(0, Math.min(TIMELINE_DURATION, t));
  const chapter = getChapterForTime(clamped);

  // Crossfade windows across 4 stages:
  // A -> W: [19.0, 20.1]
  // W -> B: [36.8, 38.0]
  // B -> C: [41.8, 43.2]
  const uAW = smoothstep(19.0, 20.1, clamped);
  const uWB = smoothstep(36.8, 38.0, clamped);
  const uBC = smoothstep(41.8, 43.2, clamped);

  const fadeA = 1.0 - uAW;
  const fadeW = clamped < 30.0 ? uAW : (1.0 - uWB);
  const fadeB = clamped < 39.8 ? uWB : (1.0 - uBC);
  const fadeC = uBC;

  // Shared-pivot scales
  const scaleA = 1.0;
  const scaleW = clamped < 30.0 ? (0.65 + 0.35 * uAW) : (1.0 + 0.85 * uWB);
  const scaleB = clamped < 39.8 ? Math.pow(4, uWB - 1) : Math.pow(6, uBC);
  const scaleC = Math.pow(6, uBC - 1);

  const camA = sampleKeys(STAGE_A_CAM_KEYS, clamped);
  const camW = sampleKeys(STAGE_W_CAM_KEYS, clamped);
  const camB = sampleKeys(STAGE_B_CAM_KEYS, clamped);
  const camC = sampleKeys(STAGE_C_CAM_KEYS, clamped);

  let camPos, camTarget;
  if (clamped < 19.0) {
    camPos = camA.pos;
    camTarget = camA.target;
  } else if (clamped <= 20.1) {
    camPos = [0, 1, 2].map((i) => lerp(camA.pos[i], camW.pos[i], uAW));
    camTarget = [0, 1, 2].map((i) => lerp(camA.target[i], camW.target[i], uAW));
  } else if (clamped < 36.8) {
    camPos = camW.pos;
    camTarget = camW.target;
  } else if (clamped <= 38.0) {
    camPos = [0, 1, 2].map((i) => lerp(camW.pos[i], camB.pos[i], uWB));
    camTarget = [0, 1, 2].map((i) => lerp(camW.target[i], camB.target[i], uWB));
  } else if (clamped < 41.8) {
    camPos = camB.pos;
    camTarget = camB.target;
  } else if (clamped <= 43.2) {
    camPos = [0, 1, 2].map((i) => lerp(camB.pos[i], camC.pos[i], uBC));
    camTarget = [0, 1, 2].map((i) => lerp(camB.target[i], camC.target[i], uBC));
  } else {
    camPos = camC.pos;
    camTarget = camC.target;
  }

  // Sub-animations
  const transformerCutaway = smoothstep(1.0, 3.6, clamped);
  const sidingDissolve = smoothstep(5.4, 9.2, clamped);
  const panelDoorAngle = smoothstep(6.8, 8.2, clamped) * (Math.PI * 0.62);
  const switchOn = smoothstep(SWITCH_TRIGGER_TIME, SWITCH_TRIGGER_TIME + 0.24, clamped);
  const circuitClosed = clamped >= SWITCH_TRIGGER_TIME;

  const breakerOn = !(clamped >= BREAKER_OFF_TIME && clamped < BREAKER_ON_TIME);
  const parallelCableReveal = smoothstep(16.0, 18.6, clamped);
  const plugSeated = clamped >= PLUG_INSERT_TIME;
  const plug1TestingOff = clamped >= PLUG1_TEST_OFF_START && clamped <= PLUG1_TEST_OFF_END;

  const copperGhost = smoothstep(40.5, 42.2, clamped);
  const scatteringIntensity = smoothstep(46.8, 48.8, clamped);

  let activeStage = 'A';
  if (clamped >= 19.6 && clamped < 37.4) activeStage = 'W';
  else if (clamped >= 37.4 && clamped < 42.5) activeStage = 'B';
  else if (clamped >= 42.5) activeStage = 'C';

  return {
    t: clamped,
    chapter,
    activeStage,
    fadeA,
    fadeW,
    fadeB,
    fadeC,
    scaleA,
    scaleW,
    scaleB,
    scaleC,
    uAW,
    uWB,
    uBC,
    camPos,
    camTarget,
    transformerCutaway,
    sidingDissolve,
    panelDoorAngle,
    switchOn,
    circuitClosed,
    breakerOn,
    parallelCableReveal,
    plugSeated,
    plug1TestingOff,
    copperGhost,
    scatteringIntensity,
  };
}
