// Shared procedural textures and non-destructive stage crossfade helpers.

import * as THREE from 'three';

export function makeGlowTexture(innerColor = 'rgba(255,255,255,1)', midColor = 'rgba(56,189,248,0.45)') {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, innerColor);
  grad.addColorStop(0.32, midColor);
  grad.addColorStop(0.7, 'rgba(0,0,0,0.08)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Tracks baseline opacity/transparent/depthWrite on all materials inside `root`.
 * Materials with `mat.userData.dynamicAlpha = true` use `mat.userData.baseOpacity`
 * as their current dynamic opacity so stage crossfade multiplies cleanly without
 * clobbering sub-animations (e.g., dissolving house siding or ghosting copper).
 */
export function createStageFade(root) {
  const entries = new Map();

  root.traverse((obj) => {
    if (!obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!entries.has(mat)) {
        entries.set(mat, {
          opacity: mat.opacity,
          transparent: mat.transparent,
          depthWrite: mat.depthWrite,
        });
      }
    }
  });

  return function setFade(alpha) {
    if (alpha <= 0.001) {
      root.visible = false;
      return;
    }
    root.visible = true;

    if (alpha >= 0.999) {
      for (const [mat, base] of entries.entries()) {
        if (mat.userData.dynamicAlpha) {
          const dynOp = mat.userData.baseOpacity ?? base.opacity;
          mat.opacity = dynOp;
          mat.transparent = dynOp < 0.999 || base.transparent;
          mat.depthWrite = dynOp >= 0.98 ? base.depthWrite : false;
        } else {
          mat.opacity = base.opacity;
          mat.transparent = base.transparent;
          mat.depthWrite = base.depthWrite;
        }
      }
      return;
    }

    for (const [mat, base] of entries.entries()) {
      const targetOp = mat.userData.dynamicAlpha
        ? (mat.userData.baseOpacity ?? base.opacity)
        : base.opacity;
      mat.opacity = targetOp * alpha;
      mat.transparent = true;
      mat.depthWrite = false;
    }
  };
}
