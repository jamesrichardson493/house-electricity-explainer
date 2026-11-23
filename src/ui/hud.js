// HUD Manager: narration updates, scale bar, scrubber, 3D projected hotspots, and Full Guide drawer.

import * as THREE from 'three';
import { HOTSPOTS, TIMELINE_DURATION, getScaleAtTime } from '../physics.js';
import { BREAKER_ON_TIME, CHAPTERS } from '../timeline.js';

export function createHUD(callbacks) {
  const openingBanner = document.getElementById('opening-banner');
  const scaleBadgeValue = document.getElementById('scale-badge-value');
  const scaleNeedle = document.getElementById('scale-needle');
  const scaleStageName = document.getElementById('scale-stage-name');

  const chapterPill = document.getElementById('chapter-pill');
  const circuitStatePill = document.getElementById('circuit-state-pill');
  const chapterCallout = document.getElementById('chapter-callout');
  const chapterTitle = document.getElementById('chapter-title');
  const chapterBody = document.getElementById('chapter-body');

  const btnPlay = document.getElementById('btn-play');
  const btnReplay = document.getElementById('btn-replay');
  const btnInspect = document.getElementById('btn-inspect');
  const btnSound = document.getElementById('btn-sound');
  const btnGuide = document.getElementById('btn-guide');

  const scrubberTrack = document.getElementById('scrubber-track');
  const scrubberFill = document.getElementById('scrubber-fill');
  const scrubberThumb = document.getElementById('scrubber-thumb');
  const chapterMarkersEl = document.getElementById('chapter-markers');
  const quickLabelsEl = document.getElementById('chapter-quick-labels');
  const timeReadout = document.getElementById('time-readout');
  const orbitHint = document.getElementById('orbit-hint');

  const hotspotLayer = document.getElementById('hotspot-layer');
  const hotspotPopover = document.getElementById('hotspot-popover');
  const popoverBadge = document.getElementById('popover-badge');
  const popoverTitle = document.getElementById('popover-title');
  const popoverBody = document.getElementById('popover-body');
  const popoverClose = document.getElementById('popover-close');

  const guideBackdrop = document.getElementById('guide-backdrop');
  const guideDrawer = document.getElementById('guide-drawer');
  const btnGuideClose = document.getElementById('btn-guide-close');
  const guideChaptersEl = document.getElementById('guide-chapters');

  let activeChapterId = -1;
  let inspectForced = false;
  let selectedHotspotId = null;
  let guideOpen = false;

  // Build chapter ticks, quick jump chips, and guide drawer cards
  const quickChips = [];
  CHAPTERS.forEach((ch, idx) => {
    if (idx > 0) {
      const tick = document.createElement('div');
      tick.className = 'chapter-tick';
      tick.style.left = `${(ch.start / TIMELINE_DURATION) * 100}%`;
      chapterMarkersEl.appendChild(tick);
    }

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chapter-chip';
    chip.textContent = ch.shortLabel;
    chip.addEventListener('click', () => callbacks.onSeek(ch.jumpTime ?? (ch.start + 0.05)));
    quickLabelsEl.appendChild(chip);
    quickChips.push(chip);

    const card = document.createElement('article');
    card.className = 'guide-chapter-card';
    card.innerHTML = `
      <div class="guide-chapter-head">
        <span class="guide-chapter-time">CH ${ch.num} · ${formatSeconds(ch.start)}–${formatSeconds(ch.end)} · ${escapeHtml(ch.callout)}</span>
        <button type="button" class="guide-jump-btn">Jump</button>
      </div>
      <h4>${escapeHtml(ch.title)}</h4>
      <p>${escapeHtml(ch.guideBody)}</p>
    `;
    card.querySelector('.guide-jump-btn').addEventListener('click', () => {
      toggleGuide(false);
      callbacks.onSeek(ch.jumpTime ?? (ch.start + 0.05));
    });
    guideChaptersEl.appendChild(card);
  });

  // Create DOM pins for each hotspot
  const pinMap = new Map();
  for (const hs of HOTSPOTS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hotspot-pin hidden';
    btn.dataset.accent = hs.accent || 'cyan';
    btn.innerHTML = `<span class="hotspot-pin-dot"></span><span>${escapeHtml(hs.label)}</span>`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openHotspot(hs, e.currentTarget);
    });
    hotspotLayer.appendChild(btn);
    pinMap.set(hs.id, btn);
  }

  function openHotspot(hs, pinEl) {
    selectedHotspotId = hs.id;
    popoverBadge.textContent = hs.badge;
    popoverTitle.textContent = hs.title;
    popoverBody.textContent = hs.body;
    hotspotPopover.classList.remove('hidden');

    for (const [id, el] of pinMap.entries()) {
      el.classList.toggle('active', id === hs.id);
    }

    const rect = pinEl.getBoundingClientRect();
    const popW = Math.min(330, window.innerWidth - 32);
    const left = Math.max(16, Math.min(window.innerWidth - popW - 16, rect.left - popW * 0.5 + rect.width * 0.5));
    const top = rect.top > window.innerHeight * 0.45
      ? Math.max(82, rect.top - 165)
      : Math.min(window.innerHeight - 250, rect.bottom + 12);

    hotspotPopover.style.left = `${left}px`;
    hotspotPopover.style.top = `${top}px`;
  }

  function closeHotspot() {
    selectedHotspotId = null;
    hotspotPopover.classList.add('hidden');
    for (const el of pinMap.values()) el.classList.remove('active');
  }

  popoverClose.addEventListener('click', closeHotspot);

  // Transport controls
  btnPlay.addEventListener('click', () => callbacks.onTogglePlay());
  btnReplay.addEventListener('click', () => {
    closeHotspot();
    callbacks.onReplay();
  });

  btnInspect.addEventListener('click', () => {
    inspectForced = !inspectForced;
    btnInspect.setAttribute('aria-pressed', String(inspectForced));
    if (!inspectForced) closeHotspot();
  });

  btnSound.addEventListener('click', () => {
    const nowOn = callbacks.onToggleSound();
    btnSound.setAttribute('aria-pressed', String(nowOn));
    btnSound.textContent = nowOn ? '🔊 Sound' : '🔇 Sound';
  });

  function toggleGuide(forceState) {
    guideOpen = typeof forceState === 'boolean' ? forceState : !guideOpen;
    guideDrawer.classList.toggle('hidden', !guideOpen);
    guideBackdrop.classList.toggle('hidden', !guideOpen);
  }

  btnGuide.addEventListener('click', () => toggleGuide(true));
  btnGuideClose.addEventListener('click', () => toggleGuide(false));
  guideBackdrop.addEventListener('click', () => toggleGuide(false));

  // Scrubber pointer drag & click
  let draggingScrub = false;
  function scrubFromClientX(clientX) {
    const rect = scrubberTrack.getBoundingClientRect();
    const u = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    callbacks.onSeek(u * TIMELINE_DURATION);
  }

  scrubberTrack.addEventListener('pointerdown', (e) => {
    draggingScrub = true;
    scrubberTrack.setPointerCapture(e.pointerId);
    scrubFromClientX(e.clientX);
  });
  scrubberTrack.addEventListener('pointermove', (e) => {
    if (draggingScrub) scrubFromClientX(e.clientX);
  });
  scrubberTrack.addEventListener('pointerup', () => {
    draggingScrub = false;
  });

  const projVec = new THREE.Vector3();

  function update(tl, isPlaying, camera, stageMacro, stageWiring, stageField, stageAtomic) {
    // Opening banner fades gently after 2.4s
    openingBanner.classList.toggle('fade-out', tl.t > 2.4);

    // Scale meter
    const sc = getScaleAtTime(tl.t);
    scaleBadgeValue.textContent = sc.formatted;
    scaleNeedle.style.left = `${(sc.norm * 100).toFixed(1)}%`;
    scaleStageName.textContent = sc.stageName;

    // Chapter narration swap
    if (tl.chapter.id !== activeChapterId) {
      activeChapterId = tl.chapter.id;
      chapterPill.textContent = `CHAPTER ${tl.chapter.num} / ${CHAPTERS.length}`;
      chapterCallout.textContent = tl.chapter.callout;
      chapterTitle.textContent = tl.chapter.title;
      chapterBody.textContent = tl.chapter.body;
      quickChips.forEach((chip, idx) => chip.classList.toggle('active', idx === activeChapterId));
    }

    // Circuit state badge (reflects breaker lockout, parallel independent proof, and live status)
    if (!tl.breakerOn) {
      circuitStatePill.textContent = 'BREAKER OFF · 0 V SAFE TO WIRE';
      circuitStatePill.className = 'circuit-pill circuit-safe';
    } else if (tl.plug1TestingOff) {
      circuitStatePill.textContent = 'PARALLEL PROOF: #1 OFF · #2 STILL 120 V!';
      circuitStatePill.className = 'circuit-pill circuit-live';
    } else if (tl.plugSeated) {
      circuitStatePill.textContent = '2 OUTLETS IN PARALLEL · 120 V LIVE';
      circuitStatePill.className = 'circuit-pill circuit-closed';
    } else if (tl.t >= BREAKER_ON_TIME) {
      circuitStatePill.textContent = 'BREAKER ON · 120 V LIVE';
      circuitStatePill.className = 'circuit-pill circuit-live';
    } else if (tl.circuitClosed) {
      circuitStatePill.textContent = 'CIRCUIT: CLOSED LOOP (120 V ON)';
      circuitStatePill.className = 'circuit-pill circuit-closed';
    } else {
      circuitStatePill.textContent = 'CIRCUIT: OPEN AT SWITCH';
      circuitStatePill.className = 'circuit-pill circuit-open';
    }

    // Play/Pause state & orbit hint
    btnPlay.textContent = isPlaying ? '❚❚' : '▶';
    btnPlay.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    orbitHint.classList.toggle('hidden', isPlaying);

    // Scrubber & time
    const pct = (tl.t / TIMELINE_DURATION) * 100;
    scrubberFill.style.width = `${pct.toFixed(2)}%`;
    scrubberThumb.style.left = `${pct.toFixed(2)}%`;
    scrubberTrack.setAttribute('aria-valuenow', tl.t.toFixed(1));
    timeReadout.textContent = `${formatSeconds(tl.t)} / ${formatSeconds(TIMELINE_DURATION)}`;

    // 3D Hotspots visibility: show when paused OR Inspect toggle is active
    const showPins = !isPlaying || inspectForced;
    if (!showPins && selectedHotspotId) closeHotspot();

    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const hs of HOTSPOTS) {
      const pinEl = pinMap.get(hs.id);
      const isRelevant = showPins && hs.stage === tl.activeStage && hs.chapters.includes(tl.chapter.id);
      if (!isRelevant) {
        pinEl.classList.add('hidden');
        continue;
      }

      if (hs.stage === 'A') {
        projVec.copy(stageMacro.toWorld(hs.localPos));
        projVec.multiplyScalar(tl.scaleA);
      } else if (hs.stage === 'W') {
        projVec.set(hs.localPos.x, hs.localPos.y, hs.localPos.z).multiplyScalar(tl.scaleW);
      } else if (hs.stage === 'B') {
        projVec.set(hs.localPos.x, hs.localPos.y, hs.localPos.z).multiplyScalar(tl.scaleB);
      } else {
        projVec.set(hs.localPos.x, hs.localPos.y, hs.localPos.z).multiplyScalar(tl.scaleC);
      }

      projVec.project(camera);
      if (projVec.z > 1 || projVec.z < -1) {
        pinEl.classList.add('hidden');
        continue;
      }

      const sx = (projVec.x * 0.5 + 0.5) * w;
      const sy = (-projVec.y * 0.5 + 0.5) * h;
      if (sx < 16 || sx > w - 16 || sy < 72 || sy > h - 220) {
        pinEl.classList.add('hidden');
        continue;
      }

      const clampedX = Math.max(96, Math.min(w - 96, sx));
      pinEl.classList.remove('hidden');
      pinEl.style.left = `${clampedX.toFixed(1)}px`;
      pinEl.style.top = `${sy.toFixed(1)}px`;
    }
  }

  return {
    update,
    toggleInspect: () => btnInspect.click(),
    toggleGuide: () => toggleGuide(),
    isGuideOpen: () => guideOpen,
    closeHotspot,
    syncSoundButton: (on) => {
      btnSound.setAttribute('aria-pressed', String(on));
      btnSound.textContent = on ? '🔊 Sound' : '🔇 Sound';
    },
  };
}

function formatSeconds(sec) {
  const s = Math.max(0, Math.round(sec));
  return `00:${String(s).padStart(2, '0')}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
