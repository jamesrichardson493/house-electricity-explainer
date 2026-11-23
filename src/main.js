// Main entry point: WebGL2 + Selective Bloom + Shared-Pivot 3-Stage Crossfade + OrbitControls + Timeline Loop

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { TIMELINE_DURATION, computeACState } from './physics.js';
import { CHAPTERS, evaluateTimeline } from './timeline.js';
import { createStageMacro } from './scenes/stageMacro.js';
import { createStageWiring } from './scenes/stageWiring.js';
import { createStageField } from './scenes/stageField.js';
import { createStageAtomic } from './scenes/stageAtomic.js';
import { createOscilloscope } from './ui/oscilloscope.js';
import { createHUD } from './ui/hud.js';
import { createAudioEngine } from './audio.js';

const canvas = document.getElementById('scene-canvas');
const fallbackEl = document.getElementById('webgl-fallback');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch {
  fallbackEl.classList.remove('hidden');
  throw new Error('WebGL initialization failed');
}

const initialW = window.innerWidth;
const initialH = window.innerHeight;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(initialW, initialH);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060912);
const sceneFog = new THREE.FogExp2(0x060912, 0.014);
scene.fog = sceneFog;

const camera = new THREE.PerspectiveCamera(46, initialW / initialH, 0.03, 180);

// Studio / Twilight Lighting
const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.95);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.5);
keyLight.position.set(-10, 14, 14);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.72);
rimLight.position.set(12, 6, -10);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xfbbf24, 0.35);
fillLight.position.set(4, -5, 10);
scene.add(fillLight);

// Subtle starfield backdrop in upper twilight sky
const starCount = 260;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const theta = ((i * 0.61803) % 1) * Math.PI * 2;
  const phi = 0.25 + ((i * 0.38196) % 1) * 1.1;
  const r = 68;
  starPos[i * 3] = Math.cos(theta) * Math.cos(phi) * r;
  starPos[i * 3 + 1] = Math.sin(phi) * r + 8;
  starPos[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * r - 10;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ color: 0xcbd5e1, size: 0.22, transparent: true, opacity: 0.55 })
);
scene.add(stars);

// Build the 4 Scale Stages at world origin (0,0,0)
const stageMacro = createStageMacro();
const stageWiring = createStageWiring();
const stageField = createStageField();
const stageAtomic = createStageAtomic();

scene.add(stageMacro.root, stageWiring.root, stageField.root, stageAtomic.root);

// Post-processing with tuned selective bloom + clean fallback
let composer = null;
let bloomPass = null;
try {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(initialW, initialH), 0.36, 0.35, 0.82);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
} catch {
  composer = null;
}

// OrbitControls (free inspection whenever paused or dragged)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.35;
controls.maxDistance = 42;

// Playback & AC Phase State
let timelineTime = 0.0;
let acClockSeconds = 0.0;
let isPlaying = true;
let userOrbited = false;
let resumeBlend = 0.0;

const audio = createAudioEngine();
const oscilloscope = createOscilloscope();

controls.addEventListener('start', () => {
  userOrbited = true;
  if (isPlaying) {
    isPlaying = false;
  }
});

function seekTo(t) {
  timelineTime = Math.max(0, Math.min(TIMELINE_DURATION, t));
  userOrbited = false;
  resumeBlend = 0;
  const tl = evaluateTimeline(timelineTime);
  camera.position.set(...tl.camPos);
  controls.target.set(...tl.camTarget);
  controls.update();
  audio.resetClock(timelineTime);
  hud.closeHotspot();
}

const hud = createHUD({
  onTogglePlay: () => {
    if (!isPlaying && timelineTime >= TIMELINE_DURATION - 0.05) {
      seekTo(0);
    }
    isPlaying = !isPlaying;
    if (isPlaying && userOrbited) {
      resumeBlend = 1.0;
      userOrbited = false;
    }
  },
  onReplay: () => {
    seekTo(0);
    isPlaying = true;
  },
  onSeek: (t) => {
    seekTo(t);
  },
  onToggleSound: () => {
    return audio.setEnabled(!audio.isEnabled());
  },
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
  if (e.code === 'Space') {
    e.preventDefault();
    document.getElementById('btn-play').click();
  } else if (e.key === 'r' || e.key === 'R') {
    seekTo(0);
    isPlaying = true;
  } else if (e.key >= '1' && e.key <= '9') {
    const ch = CHAPTERS[Number(e.key) - 1];
    if (ch) seekTo(ch.jumpTime ?? (ch.start + 0.05));
  } else if (e.key === 'i' || e.key === 'I') {
    hud.toggleInspect();
  } else if (e.key === 'm' || e.key === 'M') {
    const next = audio.setEnabled(!audio.isEnabled());
    hud.syncSoundButton(next);
  } else if (e.key === 'g' || e.key === 'G') {
    hud.toggleGuide();
  } else if (e.key === 'Escape' && hud.isGuideOpen()) {
    hud.toggleGuide();
  }
});

// Resize handler
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  if (composer) composer.setSize(w, h);
  if (bloomPass) bloomPass.setSize(w, h);
});

const desiredPos = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();
let lastFrameMs = performance.now();

// Initialize camera right at t = 0
{
  const tl0 = evaluateTimeline(0);
  camera.position.set(...tl0.camPos);
  controls.target.set(...tl0.camTarget);
  controls.update();
}

function animate(nowMs) {
  requestAnimationFrame(animate);

  const rawDt = Math.min(0.05, Math.max(0.0, (nowMs - lastFrameMs) / 1000));
  lastFrameMs = nowMs;

  if (isPlaying) {
    timelineTime += rawDt;
    if (timelineTime >= TIMELINE_DURATION) {
      timelineTime = TIMELINE_DURATION;
      isPlaying = false; // Stop timeline at 30.0s while electron sea keeps oscillating live
    }
  }

  const waveFrozen = oscilloscope.isFrozen();
  const simDt = waveFrozen ? 0 : rawDt;
  acClockSeconds += simDt;

  const tl = evaluateTimeline(timelineTime);
  const ac = computeACState(acClockSeconds);

  // Shared-pivot logarithmic scaling + animations first, then visibility crossfading
  stageMacro.root.scale.setScalar(tl.scaleA);
  stageWiring.root.scale.setScalar(tl.scaleW);
  stageField.root.scale.setScalar(tl.scaleB);
  stageAtomic.root.scale.setScalar(tl.scaleC);

  // Keep stars and heavy twilight fog strictly for Macro street scene
  stars.visible = tl.fadeA > 0.05;
  sceneFog.density = 0.0008 + tl.fadeA * 0.011;

  // Update visible stages before applying stage crossfade alpha
  if (tl.fadeA > 0.001) stageMacro.update(tl, ac, acClockSeconds);
  if (tl.fadeW > 0.001) stageWiring.update(tl, ac, acClockSeconds);
  if (tl.fadeB > 0.001) stageField.update(tl, ac, acClockSeconds, simDt);
  if (tl.fadeC > 0.001) stageAtomic.update(tl, ac, acClockSeconds, simDt);

  stageMacro.setFade(tl.fadeA);
  stageWiring.setFade(tl.fadeW);
  stageField.setFade(tl.fadeB);
  stageAtomic.setFade(tl.fadeC);

  // Camera spline tracking vs manual orbit
  if (!userOrbited && (isPlaying || resumeBlend > 0)) {
    desiredPos.set(...tl.camPos);
    desiredTarget.set(...tl.camTarget);

    if (resumeBlend > 0) {
      resumeBlend = Math.max(0, resumeBlend - rawDt * 2.2);
      camera.position.lerp(desiredPos, Math.min(1, rawDt * 7.0));
      controls.target.lerp(desiredTarget, Math.min(1, rawDt * 7.0));
    } else {
      camera.position.copy(desiredPos);
      controls.target.copy(desiredTarget);
    }
    camera.lookAt(controls.target);
  } else {
    controls.update();
  }

  // Render scene
  if (composer) {
    try {
      composer.render();
    } catch {
      composer = null;
      renderer.render(scene, camera);
    }
  } else {
    renderer.render(scene, camera);
  }

  // Update HUD, oscilloscope, and optional soundscape
  oscilloscope.render(ac, tl);
  hud.update(tl, isPlaying, camera, stageMacro, stageWiring, stageField, stageAtomic);
  audio.update(tl, ac, isPlaying);
}

requestAnimationFrame(animate);
