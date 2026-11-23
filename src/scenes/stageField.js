// Stage B: Mesoscopic Copper Wire, Two-Wire E-Field, B-Field Rings & Poynting Energy Flux Ribbons (1 unit = 1 mm)

import * as THREE from 'three';
import { createStageFade, makeGlowTexture } from './stageUtils.js';

export function createStageField() {
  const root = new THREE.Group();
  root.name = 'StageFieldRoot';

  const wireRadius = 1.25;
  const wireLen = 30;
  const neutralY = -5.2;

  // ---------- 1. Hot Copper Conductor at y = 0, z = 0 ----------
  const hotCopperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0x7c2d12,
    emissiveIntensity: 0.25,
    metalness: 0.88,
    roughness: 0.24,
    transparent: false,
    opacity: 1.0,
  });
  hotCopperMat.userData.dynamicAlpha = true;
  hotCopperMat.userData.baseOpacity = 1.0;

  const hotWire = new THREE.Mesh(
    new THREE.CylinderGeometry(wireRadius, wireRadius, wireLen, 36, 1, false),
    hotCopperMat
  );
  hotWire.rotation.z = Math.PI / 2;
  root.add(hotWire);

  // Subtle twisted copper strand texture ridges along Hot wire
  const strandMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.22,
    transparent: false,
    opacity: 1.0,
  });
  strandMat.userData.dynamicAlpha = true;
  strandMat.userData.baseOpacity = 1.0;

  for (let s = 0; s < 6; s++) {
    const angleOffset = (s / 6) * Math.PI * 2;
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const x = -14.5 + (i / 30) * 10.5;
      const taper = i < 16 ? 1.0 : Math.max(0.0, 1.0 - (i - 16) / 14);
      const r = wireRadius * (0.94 + 0.22 * taper);
      const a = angleOffset + x * 0.42;
      pts.push(new THREE.Vector3(x, Math.cos(a) * r, Math.sin(a) * r));
    }
    const strand = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.22, 8, false),
      strandMat
    );
    root.add(strand);
  }

  // Cutaway black PVC insulation collar on left (-X)
  const pvcBlackMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.7,
    metalness: 0.08,
  });
  const hotJacket = new THREE.Mesh(
    new THREE.CylinderGeometry(1.58, 1.58, 7.6, 32, 1, true, Math.PI * 0.3, Math.PI * 1.4),
    pvcBlackMat
  );
  hotJacket.rotation.z = Math.PI / 2;
  hotJacket.position.set(-10.2, 0, 0);
  root.add(hotJacket);

  const jacketRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.44, 0.14, 10, 32),
    pvcBlackMat
  );
  jacketRim.rotation.y = Math.PI / 2;
  jacketRim.position.set(-6.4, 0, 0);
  root.add(jacketRim);

  // ---------- 2. Parallel Neutral Return Conductor at y = -5.2 ----------
  const neutralMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    emissive: 0x1e293b,
    emissiveIntensity: 0.2,
    metalness: 0.85,
    roughness: 0.28,
  });
  const neutralWire = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.0, wireLen, 28),
    neutralMat
  );
  neutralWire.rotation.z = Math.PI / 2;
  neutralWire.position.set(0, neutralY, 0);
  root.add(neutralWire);

  const whitePvcMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.55,
    metalness: 0.05,
  });
  const neutralJacket = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 7.6, 28, 1, true, Math.PI * 0.3, Math.PI * 1.4),
    whitePvcMat
  );
  neutralJacket.rotation.z = Math.PI / 2;
  neutralJacket.position.set(-10.2, neutralY, 0);
  root.add(neutralJacket);

  // ---------- 3. Electric Field (E-Field) Dipole Arcs between Hot & Neutral ----------
  const eFieldMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  eFieldMat.userData.dynamicAlpha = true;
  eFieldMat.userData.baseOpacity = 0.72;

  const eConeGeo = new THREE.ConeGeometry(0.18, 0.52, 10);
  const eFieldItems = [];

  const eSliceXs = [-4.6, -2.3, 0.0, 2.3, 4.6];
  const eZOffsets = [-1.45, 0.0, 1.45];

  for (const x of eSliceXs) {
    for (const zOff of eZOffsets) {
      const midZ = zOff * 1.45;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, -1.25, zOff * 0.45),
        new THREE.Vector3(x, -2.1, midZ),
        new THREE.Vector3(x, -3.1, midZ),
        new THREE.Vector3(x, neutralY + 1.05, zOff * 0.45),
      ]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.036, 6, false), eFieldMat);
      root.add(tube);

      const arrow = new THREE.Mesh(eConeGeo, eFieldMat);
      const midPt = curve.getPointAt(0.5);
      arrow.position.copy(midPt);
      root.add(arrow);
      eFieldItems.push({ arrow });
    }
  }

  // ---------- 4. Magnetic Field (B-Field) Concentric Rings ----------
  const bFieldMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  bFieldMat.userData.dynamicAlpha = true;
  bFieldMat.userData.baseOpacity = 0.72;

  const bArrowGeo = new THREE.ConeGeometry(0.16, 0.44, 10);
  const bRingGroups = [];

  const bSliceXs = [-5.4, -3.2, -1.0, 1.2, 3.4, 5.6];
  for (const bx of bSliceXs) {
    for (const rad of [1.85, 2.55]) {
      const ringGroup = new THREE.Group();
      ringGroup.position.set(bx, 0, 0);
      root.add(ringGroup);

      const torus = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.038, 8, 42), bFieldMat);
      torus.rotation.y = Math.PI / 2;
      ringGroup.add(torus);

      for (const a of [0, Math.PI]) {
        const cone = new THREE.Mesh(bArrowGeo, bFieldMat);
        cone.position.set(0, Math.cos(a) * rad, Math.sin(a) * rad);
        cone.rotation.x = a + Math.PI / 2;
        ringGroup.add(cone);
      }

      bRingGroups.push({ group: ringGroup, rad, isNeutral: false });
    }

    // Counter-circulating B-field ring around Neutral return wire
    const nRingGroup = new THREE.Group();
    nRingGroup.position.set(bx, neutralY, 0);
    root.add(nRingGroup);
    const nTorus = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.032, 8, 36), bFieldMat);
    nTorus.rotation.y = Math.PI / 2;
    nRingGroup.add(nTorus);
    const nCone = new THREE.Mesh(bArrowGeo, bFieldMat);
    nCone.position.set(0, 1.65, 0);
    nCone.rotation.x = Math.PI / 2;
    nRingGroup.add(nCone);
    bRingGroups.push({ group: nRingGroup, rad: 1.65, isNeutral: true });
  }

  // ---------- 5. Poynting Energy Flux S = E x B (Sleek Golden Ribbons Flowing +X Outside Copper) ----------
  const poyntingGlowTex = makeGlowTexture('rgba(255,244,195,1)', 'rgba(251,191,36,0.55)');
  const poyntingGroup = new THREE.Group();
  root.add(poyntingGroup);

  const poyntingMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  poyntingMat.userData.dynamicAlpha = true;
  poyntingMat.userData.baseOpacity = 0.9;

  const ribbonTailGeo = new THREE.BoxGeometry(1.65, 0.065, 0.065);
  const headGeo = new THREE.ConeGeometry(0.14, 0.42, 8);
  headGeo.rotateZ(-Math.PI / 2);

  const poyntingStreams = [];
  const streamCount = 44;
  for (let i = 0; i < streamCount; i++) {
    const unit = new THREE.Group();

    const tail = new THREE.Mesh(ribbonTailGeo, poyntingMat);
    tail.position.x = -0.82;
    const head = new THREE.Mesh(headGeo, poyntingMat);
    head.position.x = 0.14;

    const haloMat = new THREE.SpriteMaterial({
      map: poyntingGlowTex,
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    haloMat.userData.dynamicAlpha = true;
    haloMat.userData.baseOpacity = 0.52;
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(1.7, 0.48, 1);
    halo.position.x = -0.35;

    unit.add(tail, head, halo);
    poyntingGroup.add(unit);

    // Distribute strictly OUTSIDE the copper conductor, concentrated between Hot & Neutral and around Hot
    const inGap = i % 2 === 0;
    let y, z;
    if (inGap) {
      y = -1.65 - ((i * 0.618033) % 1) * 2.15;
      z = (((i * 0.754877) % 1) - 0.5) * 2.9;
    } else {
      const ang = (i / streamCount) * Math.PI * 2 * 3.0;
      const rad = 1.78 + ((i * 0.56984) % 1) * 1.45;
      y = Math.cos(ang) * rad;
      z = Math.sin(ang) * rad;
      if (y < -1.2 && Math.abs(z) < 0.8) y = Math.abs(y);
    }

    poyntingStreams.push({
      mesh: unit,
      haloMat,
      x: -10.5 + ((i * 0.731) % 1) * 21.0,
      y,
      z,
      speedMult: 0.85 + ((i * 0.293) % 1) * 0.4,
    });
  }

  const setFade = createStageFade(root);

  function update(tl, ac, elapsedSeconds, dt) {
    // 1. Copper wire ghosting as camera dives into Stage C atomic lattice
    const copperOp = 1.0 - tl.copperGhost * 0.78;
    hotCopperMat.userData.baseOpacity = copperOp;
    strandMat.userData.baseOpacity = copperOp;

    // 2. E-Field polarity flip & intensity
    const eMag = Math.abs(ac.sinPhi);
    eFieldMat.userData.baseOpacity = 0.16 + 0.72 * eMag;
    const eFlip = ac.sinPhi >= 0 ? Math.PI : 0;
    for (const item of eFieldItems) {
      item.arrow.rotation.z = eFlip;
      const s = 0.6 + 0.65 * eMag;
      item.arrow.scale.set(s, s, s);
    }

    // 3. B-Field circulation direction reverses with AC current
    bFieldMat.userData.baseOpacity = 0.14 + 0.72 * eMag;
    for (const b of bRingGroups) {
      const dir = b.isNeutral ? -ac.sinPhi : ac.sinPhi;
      b.group.rotation.x += dir * dt * 2.6;
      const arrowScale = ac.sinPhi >= 0 ? 1 : -1;
      for (let c = 1; c < b.group.children.length; c++) {
        b.group.children[c].scale.y = b.isNeutral ? -arrowScale : arrowScale;
      }
    }

    // 4. Poynting Energy Flux S = E x B always flows +X toward the lamp!
    const pMag = ac.poyntingMag; // sin^2(phi) >= 0
    poyntingMat.userData.baseOpacity = 0.28 + 0.72 * pMag;
    const flowSpeed = (1.8 + 7.4 * pMag) * dt;
    for (const s of poyntingStreams) {
      s.x += flowSpeed * s.speedMult;
      if (s.x > 10.5) s.x -= 21.0;
      s.mesh.position.set(s.x, s.y, s.z);
      const stretch = 0.75 + 0.95 * pMag;
      s.mesh.scale.set(stretch, 0.85 + 0.3 * pMag, 0.85 + 0.3 * pMag);
      s.haloMat.userData.baseOpacity = 0.22 + 0.58 * pMag;
    }
  }

  return {
    root,
    setFade,
    update,
  };
}
