// Stage C: Microscopic Face-Centered Cubic (FCC) Copper Lattice, Oscillating 4s1 Electron Sea & Scattering Ripples (1 unit = 1 Å)

import * as THREE from 'three';
import { createStageFade, makeGlowTexture } from './stageUtils.js';

export function createStageAtomic() {
  const root = new THREE.Group();
  root.name = 'StageAtomicRoot';

  const ionGlowTex = makeGlowTexture('rgba(255,215,155,0.85)', 'rgba(217,119,6,0.28)');
  const eGlowTex = makeGlowTexture('rgba(200,245,255,0.9)', 'rgba(56,189,248,0.45)');
  const sparkTex = makeGlowTexture('rgba(255,235,165,0.95)', 'rgba(251,191,36,0.6)');

  // ---------- 1. Face-Centered Cubic (FCC) Cu+ Ion Lattice (a = 3.61 Å) ----------
  const a = 3.61;
  const ionPositions = [];
  const seen = new Set();

  const basis = [
    [0, 0, 0],
    [0.5, 0.5, 0],
    [0.5, 0, 0.5],
    [0, 0.5, 0.5],
  ];

  for (let ix = -2; ix <= 2; ix++) {
    for (let iy = -1; iy <= 1; iy++) {
      for (let iz = -1; iz <= 1; iz++) {
        for (const [bx, by, bz] of basis) {
          const x = (ix + bx) * a;
          const y = (iy + by) * a;
          const z = (iz + bz) * a;
          // Keep z <= 2.4 so no foreground ion blocks the Act 6 macro camera
          if (Math.abs(x) > 7.6 || Math.abs(y) > 4.2 || z < -4.2 || z > 2.4) continue;
          const key = `${Math.round(x * 10)}_${Math.round(y * 10)}_${Math.round(z * 10)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          ionPositions.push({
            home: new THREE.Vector3(x, y, z),
            heat: 0,
            phase: ix * 1.7 + iy * 2.3 + iz * 3.1,
          });
        }
      }
    }
  }

  const ionCount = ionPositions.length;
  const ionGeo = new THREE.SphereGeometry(0.34, 22, 18);
  const ionMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Tinted via instanceColor
    emissive: 0x7c2d12,
    emissiveIntensity: 0.36,
    metalness: 0.84,
    roughness: 0.24,
  });

  const ionInstanced = new THREE.InstancedMesh(ionGeo, ionMat, ionCount);
  const baseCopperColor = new THREE.Color(0xd97706);
  const hotFlashColor = new THREE.Color(0xfde047);
  const tempColor = new THREE.Color();
  const dummy = new THREE.Object3D();

  for (let i = 0; i < ionCount; i++) {
    dummy.position.copy(ionPositions[i].home);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    ionInstanced.setMatrixAt(i, dummy.matrix);
    ionInstanced.setColorAt(i, baseCopperColor);
  }
  ionInstanced.instanceMatrix.needsUpdate = true;
  if (ionInstanced.instanceColor) ionInstanced.instanceColor.needsUpdate = true;
  root.add(ionInstanced);

  // Subtle nearest-neighbor crystal lattice bonds
  const bondVerts = [];
  const nnDist = a / Math.SQRT2 + 0.15;
  for (let i = 0; i < ionCount; i++) {
    for (let j = i + 1; j < ionCount; j++) {
      if (ionPositions[i].home.distanceTo(ionPositions[j].home) <= nnDist) {
        bondVerts.push(
          ionPositions[i].home.x, ionPositions[i].home.y, ionPositions[i].home.z,
          ionPositions[j].home.x, ionPositions[j].home.y, ionPositions[j].home.z
        );
      }
    }
  }
  const bondGeo = new THREE.BufferGeometry();
  bondGeo.setAttribute('position', new THREE.Float32BufferAttribute(bondVerts, 3));
  const bondMat = new THREE.LineBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.16,
  });
  bondMat.userData.dynamicAlpha = true;
  bondMat.userData.baseOpacity = 0.16;
  root.add(new THREE.LineSegments(bondGeo, bondMat));

  // Soft warm aura around midground ions
  for (let i = 0; i < ionCount; i++) {
    const p = ionPositions[i].home;
    if (p.z > 0.8 && Math.abs(p.x) < 5.5 && Math.abs(p.y) < 3) {
      const aura = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: ionGlowTex,
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      aura.scale.set(1.25, 1.25, 1);
      aura.position.copy(p);
      root.add(aura);
    }
  }

  // ---------- 2. Conduction Electron Sea (4s1) + Luminous Tapered Motion Trails ----------
  const bgElectronCount = 240;
  const heroElectronCount = 38;

  // Real 3D shading on electron spheres so they read as glowing 3D quantum orbs
  const eGeo = new THREE.SphereGeometry(0.088, 14, 12);
  const eMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 0.85,
    roughness: 0.22,
    metalness: 0.15,
  });
  const bgElectronsInst = new THREE.InstancedMesh(eGeo, eMat, bgElectronCount);
  root.add(bgElectronsInst);

  // Coprime R3 quasi-random sequence (no pair sums to 1 -> uniform 3D distribution!)
  const phi3 = 1.2207440846;
  const a1 = 1 / phi3;
  const a2 = 1 / (phi3 * phi3);
  const a3 = 1 / (phi3 * phi3 * phi3);

  const bgElectrons = [];
  for (let i = 0; i < bgElectronCount; i++) {
    const n = i + 1;
    const hx = (((n * a1) % 1) - 0.5) * 14.0;
    const hy = (((n * a2) % 1) - 0.5) * 7.6;
    const hz = (((n * a3) % 1) - 0.5) * 6.8 - 0.3;
    bgElectrons.push({
      home: new THREE.Vector3(hx, hy, hz),
      seedA: i * 1.91,
      seedB: i * 3.17,
      seedC: i * 4.43,
    });
  }

  // 38 foreground hero electrons with shaded 3D spheres + soft halos + tapered instanced trails
  const trailLen = 10;
  const heroElectrons = [];
  const heroGroup = new THREE.Group();
  root.add(heroGroup);

  const heroSphereGeo = new THREE.SphereGeometry(0.108, 16, 14);
  const heroMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.05,
    roughness: 0.18,
    metalness: 0.1,
  });

  const trailBeadGeo = new THREE.SphereGeometry(0.056, 8, 8);
  const trailBeadMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  trailBeadMat.userData.dynamicAlpha = true;
  trailBeadMat.userData.baseOpacity = 0.65;
  const trailInstanced = new THREE.InstancedMesh(trailBeadGeo, trailBeadMat, heroElectronCount * trailLen);
  root.add(trailInstanced);

  for (let i = 0; i < heroElectronCount; i++) {
    const n = i + 17;
    const hx = (((n * a2) % 1) - 0.5) * 9.8;
    const hy = (((n * a3) % 1) - 0.5) * 5.0;
    const hz = (((n * a1) % 1) - 0.35) * 3.6 + 0.5;

    const mesh = new THREE.Mesh(heroSphereGeo, heroMat);
    const haloMat = new THREE.SpriteMaterial({
      map: eGlowTex,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    haloMat.userData.dynamicAlpha = true;
    haloMat.userData.baseOpacity = 0.42;
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(0.65, 0.65, 1);
    mesh.add(halo);
    heroGroup.add(mesh);

    const history = [];
    for (let k = 0; k < trailLen; k++) {
      history.push(new THREE.Vector3(hx, hy, hz));
    }

    heroElectrons.push({
      home: new THREE.Vector3(hx, hy, hz),
      pos: new THREE.Vector3(hx, hy, hz),
      mesh,
      history,
      seedA: i * 2.37 + 0.5,
      seedB: i * 3.89 + 1.2,
      seedC: i * 5.13 + 2.1,
    });
  }

  // ---------- 3. Macroscopic Reversing E-Field Force Arrows ----------
  const eArrowGroup = new THREE.Group();
  root.add(eArrowGroup);

  const eArrowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  eArrowMat.userData.dynamicAlpha = true;
  eArrowMat.userData.baseOpacity = 0.58;

  const eArrows = [];
  const arrowCoords = [
    [-4.5, 3.3, 1.8],
    [0.0, 3.3, 1.8],
    [4.5, 3.3, 1.8],
    [-4.5, -3.2, 1.8],
    [0.0, -3.2, 1.8],
    [4.5, -3.2, 1.8],
  ];

  for (const [ax, ay, az] of arrowCoords) {
    const unit = new THREE.Group();
    unit.position.set(ax, ay, az);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), eArrowMat);
    shaft.rotation.z = Math.PI / 2;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 10), eArrowMat);
    head.rotation.z = -Math.PI / 2;
    head.position.x = 0.88;
    unit.add(shaft, head);
    eArrowGroup.add(unit);
    eArrows.push(unit);
  }

  // ---------- 4. Act 6 Electron-Ion Lattice Scattering Ripples ----------
  const sparkPool = [];
  for (let i = 0; i < 6; i++) {
    const flashMat = new THREE.SpriteMaterial({
      map: sparkTex,
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    flashMat.userData.dynamicAlpha = true;
    flashMat.userData.baseOpacity = 0;
    const flash = new THREE.Sprite(flashMat);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    ringMat.userData.dynamicAlpha = true;
    ringMat.userData.baseOpacity = 0;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.25, 28), ringMat);
    root.add(flash, ring);
    sparkPool.push({
      flash,
      flashMat,
      ring,
      ringMat,
      life: 0,
      maxLife: 0.72,
      pos: new THREE.Vector3(),
    });
  }

  let scatterCooldown = 0.15;
  let nextSparkIdx = 0;

  const setFade = createStageFade(root);

  function update(tl, ac, elapsedSeconds, dt) {
    const driftX = 0.92 * ac.cosPhi;
    const eMag = Math.abs(ac.sinPhi);

    // 1. Update E-Field indicator arrows
    eArrowMat.userData.baseOpacity = 0.12 + 0.58 * eMag;
    const arrowDir = ac.sinPhi >= 0 ? 1 : -1;
    const arrowLenScale = 0.4 + 0.75 * eMag;
    for (const arrow of eArrows) {
      arrow.scale.set(arrowDir * arrowLenScale, 1, 1);
    }

    // 2. Update Background Electrons (thermal jiggle + coherent AC sway)
    for (let i = 0; i < bgElectronCount; i++) {
      const e = bgElectrons[i];
      const jx = Math.sin(elapsedSeconds * 5.6 + e.seedA) * 0.24 + Math.cos(elapsedSeconds * 9.3 + e.seedB) * 0.14;
      const jy = Math.cos(elapsedSeconds * 6.1 + e.seedB) * 0.24 + Math.sin(elapsedSeconds * 8.4 + e.seedC) * 0.14;
      const jz = Math.sin(elapsedSeconds * 5.2 + e.seedC) * 0.22;

      dummy.position.set(e.home.x + driftX + jx, e.home.y + jy, e.home.z + jz);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      bgElectronsInst.setMatrixAt(i, dummy.matrix);
    }
    bgElectronsInst.instanceMatrix.needsUpdate = true;

    // 3. Update Hero Electrons & Tapered Comet Trails
    for (let i = 0; i < heroElectronCount; i++) {
      const h = heroElectrons[i];
      const jx = Math.sin(elapsedSeconds * 6.4 + h.seedA) * 0.28 + Math.cos(elapsedSeconds * 11.2 + h.seedB) * 0.15;
      const jy = Math.cos(elapsedSeconds * 7.0 + h.seedB) * 0.28 + Math.sin(elapsedSeconds * 10.1 + h.seedC) * 0.15;
      const jz = Math.sin(elapsedSeconds * 6.0 + h.seedC) * 0.24;

      const nx = h.home.x + driftX + jx;
      const ny = h.home.y + jy;
      const nz = h.home.z + jz;

      h.pos.set(nx, ny, nz);
      h.mesh.position.copy(h.pos);

      if (dt > 0.0005) {
        for (let k = trailLen - 1; k > 0; k--) {
          h.history[k].copy(h.history[k - 1]);
        }
        h.history[0].set(nx, ny, nz);
      }

      for (let k = 0; k < trailLen; k++) {
        dummy.position.copy(h.history[k]);
        const tScale = (1 - k / trailLen) * 1.15;
        dummy.scale.setScalar(tScale);
        dummy.updateMatrix();
        trailInstanced.setMatrixAt(i * trailLen + k, dummy.matrix);
      }
    }
    trailInstanced.instanceMatrix.needsUpdate = true;

    // 4. Act 6 Lattice Scattering Sparks & Cu+ Ion Thermal Vibration
    const scatterPower = tl.scatteringIntensity;
    if (scatterPower > 0.08 && dt > 0.0005) {
      scatterCooldown -= dt * (0.4 + 1.4 * scatterPower * (0.4 + eMag));
      if (scatterCooldown <= 0) {
        scatterCooldown = 0.24;
        const candidates = [];
        for (let i = 0; i < ionCount; i++) {
          const hp = ionPositions[i].home;
          if (Math.abs(hp.x) < 4.5 && Math.abs(hp.y) < 2.6 && hp.z > -0.8) {
            candidates.push(i);
          }
        }
        if (candidates.length > 0) {
          const pick = candidates[Math.floor((elapsedSeconds * 13.7 + nextSparkIdx * 7.3) % candidates.length)];
          const ion = ionPositions[pick];
          ion.heat = 1.0;

          const sp = sparkPool[nextSparkIdx];
          nextSparkIdx = (nextSparkIdx + 1) % sparkPool.length;
          sp.life = sp.maxLife;
          sp.pos.copy(ion.home);
          sp.ring.lookAt(0, 0, 10);
        }
      }
    }

    for (const sp of sparkPool) {
      if (sp.life > 0) {
        sp.life = Math.max(0, sp.life - dt);
        const u = 1 - sp.life / sp.maxLife;
        const fade = (1 - u) * (1 - u);
        sp.flash.position.copy(sp.pos);
        sp.flashMat.userData.baseOpacity = fade * 0.72;
        const fScale = 0.9 + u * 0.95;
        sp.flash.scale.set(fScale, fScale, 1);

        sp.ring.position.copy(sp.pos);
        sp.ringMat.userData.baseOpacity = fade * 0.92;
        const rScale = 0.8 + u * 3.4;
        sp.ring.scale.setScalar(rScale);
      } else {
        sp.flashMat.userData.baseOpacity = 0;
        sp.ringMat.userData.baseOpacity = 0;
      }
    }

    for (let i = 0; i < ionCount; i++) {
      const ion = ionPositions[i];
      ion.heat = Math.max(0, ion.heat - dt * 1.1);
      const vibAmp = 0.025 + ion.heat * 0.14;
      const vx = Math.sin(elapsedSeconds * 28.0 + ion.phase) * vibAmp;
      const vy = Math.cos(elapsedSeconds * 31.0 + ion.phase * 1.3) * vibAmp;
      const vz = Math.sin(elapsedSeconds * 24.0 + ion.phase * 0.7) * vibAmp;

      dummy.position.set(ion.home.x + vx, ion.home.y + vy, ion.home.z + vz);
      dummy.scale.setScalar(1 + ion.heat * 0.18);
      dummy.updateMatrix();
      ionInstanced.setMatrixAt(i, dummy.matrix);

      tempColor.copy(baseCopperColor).lerp(hotFlashColor, ion.heat * 0.88);
      ionInstanced.setColorAt(i, tempColor);
    }
    ionInstanced.instanceMatrix.needsUpdate = true;
    if (ionInstanced.instanceColor) ionInstanced.instanceColor.needsUpdate = true;
  }

  return {
    root,
    setFade,
    update,
  };
}
