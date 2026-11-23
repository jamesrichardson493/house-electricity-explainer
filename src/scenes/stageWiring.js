// Stage W: Twin-Outlet US NEC Parallel Wiring Workshop (1 unit = 1 cm)
// Outlet #1 (Existing, x = -5.2) -> Parallel 12/2 Jumper -> Outlet #2 (New, x = +5.2)
// Demonstrates NCVT 0V check, intact Brass/Silver parallel tabs, Ground wire-nut pigtail,
// clockwise J-hooks, 3-prong Ground-first plug insertion, and independent parallel load proof.

import * as THREE from 'three';
import { createStageFade, makeGlowTexture } from './stageUtils.js';

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function createStageWiring() {
  const root = new THREE.Group();
  root.name = 'StageWiringRoot';

  const emeraldGlowTex = makeGlowTexture('rgba(200,255,235,1)', 'rgba(52,211,153,0.55)');

  // Studio lighting covering full twin-outlet span (x in [-10, +10])
  const lightCenter = new THREE.PointLight(0xf8fafc, 2.5, 42, 1.1);
  lightCenter.position.set(0, 5.5, 15);
  root.add(lightCenter);

  const lightLeft = new THREE.PointLight(0xbae6fd, 1.8, 32, 1.2);
  lightLeft.position.set(-11, 2.5, 8);
  root.add(lightLeft);

  const lightRight = new THREE.PointLight(0xfef3c7, 1.8, 32, 1.2);
  lightRight.position.set(11, 2.5, 8);
  root.add(lightRight);

  // Shared materials for receptacle parts & tools
  const bluePolyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.32,
    roughness: 0.3,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  bluePolyMat.userData.dynamicAlpha = true;
  bluePolyMat.userData.baseOpacity = 0.32;

  const yokeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.28 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.05 });
  const slotDarkMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
  const neutralRimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
  const hotRimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.22 });
  const gndRimMat = new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.8, roughness: 0.25 });

  function makeScrew(mat, isHex = false) {
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.52, 14), mat);
    shaft.rotation.z = Math.PI / 2;
    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.31, 0.16, isHex ? 6 : 20),
      mat
    );
    head.rotation.z = Math.PI / 2;
    head.position.x = 0.27;

    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.44, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    slot.position.x = 0.34;
    const slot2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.44),
      new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    slot2.position.x = 0.34;
    g.add(shaft, head, slot, slot2);
    return g;
  }

  function buildReceptacleAssembly(xCenter) {
    const group = new THREE.Group();
    group.position.set(xCenter, 0, 0);
    root.add(group);

    // Translucent Blue Single-Gang Wall Box
    const boxW = 4.6;
    const boxH = 7.4;
    const boxD = 5.0;
    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, boxD), bluePolyMat);
    boxMesh.position.set(0, 0, -3.8);
    const boxEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(boxW, boxH, boxD)),
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.48 })
    );
    boxEdges.position.set(0, 0, -3.8);
    group.add(boxMesh, boxEdges);

    // Steel Yoke & Ears
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(2.5, 8.6, 0.2), yokeMat);
    yoke.position.set(0, 0, -0.95);
    group.add(yoke);
    for (const ey of [3.8, -3.8]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.78, 0.16), yokeMat);
      ear.position.set(0, ey, -0.95);
      group.add(ear);
    }

    // White Polycarbonate Duplex Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.1, 6.0, 2.2), bodyMat);
    body.position.set(0, 0, 0.18);
    group.add(body);

    // Two NEMA 5-15R Duplex Faces (Left = Wider Neutral slot, Right = Narrower Hot slot, Bottom = Ground U-hole)
    for (const fy of [1.45, -1.45]) {
      const facePad = new THREE.Mesh(new THREE.BoxGeometry(2.45, 2.3, 0.2), bodyMat);
      facePad.position.set(0, fy, 1.32);
      group.add(facePad);

      const neutralSlot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.14), slotDarkMat);
      neutralSlot.position.set(-0.56, fy + 0.26, 1.38);
      const neutralTrim = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.98, 0.04), neutralRimMat);
      neutralTrim.position.set(-0.56, fy + 0.26, 1.41);

      const hotSlot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.14), slotDarkMat);
      hotSlot.position.set(0.56, fy + 0.26, 1.38);
      const hotTrim = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.04), hotRimMat);
      hotTrim.position.set(0.56, fy + 0.26, 1.41);

      const gndSlot = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 16), slotDarkMat);
      gndSlot.rotation.x = Math.PI / 2;
      gndSlot.position.set(0, fy - 0.5, 1.38);
      const gndTrim = new THREE.Mesh(new THREE.RingGeometry(0.19, 0.25, 18), gndRimMat);
      gndTrim.position.set(0, fy - 0.5, 1.43);

      group.add(neutralTrim, neutralSlot, hotTrim, hotSlot, gndTrim, gndSlot);
    }

    // Intact Side Break-Off Tabs (Silver on Left x = -1.62, Brass on Right x = +1.62)
    const silverTabMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.05,
      metalness: 0.92,
      roughness: 0.18,
    });
    const brassTabMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.12,
      metalness: 0.9,
      roughness: 0.2,
    });
    const greenScrewMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.35,
      metalness: 0.6,
      roughness: 0.28,
    });

    const silverTab = new THREE.Mesh(new THREE.BoxGeometry(0.13, 2.35, 0.46), silverTabMat);
    silverTab.position.set(-1.62, 0, 0.05);
    const brassTab = new THREE.Mesh(new THREE.BoxGeometry(0.13, 2.35, 0.46), brassTabMat);
    brassTab.position.set(1.62, 0, 0.05);
    group.add(silverTab, brassTab);

    const silverUpper = makeScrew(silverTabMat);
    silverUpper.rotation.y = Math.PI;
    silverUpper.position.set(-1.68, 1.0, 0.05);

    const silverLower = makeScrew(silverTabMat);
    silverLower.rotation.y = Math.PI;
    silverLower.position.set(-1.68, -1.0, 0.05);

    const greenScrew = makeScrew(greenScrewMat, true);
    greenScrew.rotation.y = Math.PI;
    greenScrew.position.set(-1.68, -2.35, 0.05);

    const brassUpper = makeScrew(brassTabMat);
    brassUpper.position.set(1.68, 1.0, 0.05);

    const brassLower = makeScrew(brassTabMat);
    brassLower.position.set(1.68, -1.0, 0.05);

    group.add(silverUpper, silverLower, greenScrew, brassUpper, brassLower);

    return {
      group,
      silverTabMat,
      brassTabMat,
      silverUpper,
      silverLower,
      greenScrew,
      brassUpper,
      brassLower,
    };
  }

  // Articulated 6-link copper tip curling from straight into a 270 deg clockwise J-hook
  function makeJHookChain(copperMat) {
    const chain = [];
    const rootHook = new THREE.Group();
    let parent = rootHook;
    const segLen = 0.2;
    const segGeo = new THREE.CylinderGeometry(0.08, 0.08, segLen, 10);
    const jointGeo = new THREE.SphereGeometry(0.082, 10, 8);

    for (let i = 0; i < 6; i++) {
      const pivot = new THREE.Group();
      if (i > 0) pivot.position.y = segLen;
      const seg = new THREE.Mesh(segGeo, copperMat);
      seg.position.y = segLen * 0.5;
      const joint = new THREE.Mesh(jointGeo, copperMat);
      joint.position.y = segLen;
      pivot.add(seg, joint);
      parent.add(pivot);
      parent = pivot;
      chain.push(pivot);
    }
    return { rootHook, chain };
  }

  function setHookCurl(chainObj, curlAmount, sign = 1) {
    const anglePerLink = -0.77 * curlAmount * sign;
    for (let i = 0; i < chainObj.chain.length; i++) {
      chainObj.chain[i].rotation.x = anglePerLink;
    }
  }

  // ---------- 1. Existing Outlet #1 (x = -5.2) & New Outlet #2 (x = +5.2) ----------
  const out1 = buildReceptacleAssembly(-5.2);
  const out2 = buildReceptacleAssembly(5.2);

  // ---------- 2. Existing Panel Feed Into Outlet #1 + Green Ground Wire-Nut Pigtail ----------
  const bareCopperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0x059669,
    emissiveIntensity: 0.08,
    metalness: 0.88,
    roughness: 0.22,
  });
  const whiteInsulMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.42, metalness: 0.05 });
  const whiteCopperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.22 });
  const blackInsulMat = new THREE.MeshStandardMaterial({
    color: 0x262c36,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.0,
    roughness: 0.28,
    metalness: 0.22,
  });
  const blackCopperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.0,
    metalness: 0.88,
    roughness: 0.2,
  });

  // Incoming Panel 12/2 feed sleeve at bottom-left of Box #1
  const yellowJacketMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45, metalness: 0.05 });
  const inSheath = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.2, 18), yellowJacketMat);
  inSheath.position.set(-7.8, -4.4, -3.2);
  inSheath.rotation.z = -0.35;
  root.add(inSheath);

  // Incoming Black Hot -> Outlet #1 Upper Brass Screw (-3.50, +1.0, 0.05)
  const inHotCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7.2, -3.3, -2.8),
    new THREE.Vector3(-5.0, -3.0, -3.4),
    new THREE.Vector3(-3.3, -1.6, -2.4),
    new THREE.Vector3(-3.2, 0.4, -0.5),
    new THREE.Vector3(-3.28, 0.68, 0.02),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(inHotCurve, 30, 0.13, 10, false), blackInsulMat));
  const inHotHook = makeJHookChain(blackCopperMat);
  inHotHook.rootHook.position.set(-3.28, 0.68, 0.02);
  setHookCurl(inHotHook, 1, 1);
  root.add(inHotHook.rootHook);

  // Incoming White Neutral -> Outlet #1 Upper Silver Screw (-6.90, +1.0, 0.05)
  const inNeuCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7.4, -3.1, -2.6),
    new THREE.Vector3(-7.6, -1.2, -1.8),
    new THREE.Vector3(-7.3, 0.2, -0.6),
    new THREE.Vector3(-7.12, 0.68, 0.02),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(inNeuCurve, 26, 0.13, 10, false), whiteInsulMat));
  const inNeuHook = makeJHookChain(whiteCopperMat);
  inNeuHook.rootHook.position.set(-7.12, 0.68, 0.02);
  setHookCurl(inNeuHook, 1, -1);
  root.add(inNeuHook.rootHook);

  // Green Ground Wire-Nut Pigtail Splice inside Box #1 at (-6.35, -2.65, -2.2)
  const nutMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.3,
    roughness: 0.35,
  });
  const wireNut = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.68, 14), nutMat);
  wireNut.position.set(-6.35, -2.65, -2.2);
  wireNut.rotation.z = Math.PI * 0.25;
  root.add(wireNut);

  // Incoming Bare Ground -> Wire Nut -> Short Pigtail to Outlet #1 Green Screw (-6.90, -2.35, 0.05)
  const inGndCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7.5, -3.4, -2.7),
    new THREE.Vector3(-6.7, -3.0, -2.4),
    new THREE.Vector3(-6.35, -2.65, -2.2),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(inGndCurve, 14, 0.082, 8, false), bareCopperMat));

  const pigtailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6.35, -2.65, -2.2),
    new THREE.Vector3(-7.05, -2.7, -1.0),
    new THREE.Vector3(-7.12, -2.65, 0.02),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(pigtailCurve, 16, 0.082, 8, false), bareCopperMat));
  const out1GndHook = makeJHookChain(bareCopperMat);
  out1GndHook.rootHook.position.set(-7.12, -2.65, 0.02);
  setHookCurl(out1GndHook, 1, -1);
  root.add(out1GndHook.rootHook);

  // ---------- 3. Parallel 12/2 NM-B Jumper Ladder Rails (Outlet #1 -> Outlet #2) ----------
  // Cutaway yellow outer jacket sleeve in middle lower bay so Hot (y=-0.6) & Neutral (y=-2.6) rails stay visible!
  const midSheath = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 3.2, 18, 1, true, Math.PI * 0.2, Math.PI * 1.6),
    yellowJacketMat
  );
  midSheath.rotation.z = Math.PI / 2;
  midSheath.position.set(0, -1.65, -0.5);
  root.add(midSheath);

  // Parallel Black Hot Rail (upper ladder rail along y = -0.6, z = 0.0 across middle bay -> Outlet #2 Upper Brass)
  const parHotStaticCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.0, -0.8, 0.02),
    new THREE.Vector3(-1.8, -0.6, 0.0),
    new THREE.Vector3(1.8, -0.6, 0.0),
    new THREE.Vector3(5.6, -0.4, -0.6),
    new THREE.Vector3(7.1, 0.35, -0.35),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(parHotStaticCurve, 44, 0.135, 10, false), blackInsulMat));

  // Left end (Outlet #1 Lower Brass (-3.50, -1.0, 0.05))
  const out1HotTipArm = new THREE.Group();
  out1HotTipArm.position.set(-3.0, -0.8, 0.02);
  root.add(out1HotTipArm);
  const out1HotLead = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.28, -0.5, 0.0)]),
      10,
      0.13,
      8,
      false
    ),
    blackInsulMat
  );
  const out1HotHook = makeJHookChain(blackCopperMat);
  out1HotHook.rootHook.position.set(-0.28, -0.5, 0.0);
  out1HotTipArm.add(out1HotLead, out1HotHook.rootHook);

  // Right end (Outlet #2 Upper Brass (+6.90, +1.0, 0.05))
  const out2HotTipArm = new THREE.Group();
  out2HotTipArm.position.set(7.1, 0.35, -0.35);
  root.add(out2HotTipArm);
  const out2HotLead = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, 0.33, 0.37)]),
      10,
      0.13,
      8,
      false
    ),
    blackInsulMat
  );
  const out2HotHook = makeJHookChain(blackCopperMat);
  out2HotHook.rootHook.position.set(0.02, 0.33, 0.37);
  out2HotTipArm.add(out2HotLead, out2HotHook.rootHook);

  // Parallel White Neutral Rail (lower ladder rail along y = -2.4, z = -0.6 across middle bay)
  const parNeuStaticCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7.0, -2.0, -0.5),
    new THREE.Vector3(-4.2, -2.55, -0.9),
    new THREE.Vector3(0.0, -2.55, -0.6),
    new THREE.Vector3(2.8, -2.2, -0.6),
    new THREE.Vector3(3.22, 0.15, -0.35),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(parNeuStaticCurve, 44, 0.135, 10, false), whiteInsulMat));

  // Left end (Outlet #1 Lower Silver (-6.90, -1.0, 0.05))
  const out1NeuTipArm = new THREE.Group();
  out1NeuTipArm.position.set(-7.0, -2.0, -0.5);
  root.add(out1NeuTipArm);
  const out1NeuLead = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.12, 0.68, 0.52)]),
      10,
      0.13,
      8,
      false
    ),
    whiteInsulMat
  );
  const out1NeuHook = makeJHookChain(whiteCopperMat);
  out1NeuHook.rootHook.position.set(-0.12, 0.68, 0.52);
  out1NeuTipArm.add(out1NeuLead, out1NeuHook.rootHook);

  // Right end (Outlet #2 Upper Silver (+3.50, +1.0, 0.05))
  const out2NeuTipArm = new THREE.Group();
  out2NeuTipArm.position.set(3.22, 0.15, -0.35);
  root.add(out2NeuTipArm);
  const out2NeuLead = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.06, 0.53, 0.37)]),
      10,
      0.13,
      8,
      false
    ),
    whiteInsulMat
  );
  const out2NeuHook = makeJHookChain(whiteCopperMat);
  out2NeuHook.rootHook.position.set(0.06, 0.53, 0.37);
  out2NeuTipArm.add(out2NeuLead, out2NeuHook.rootHook);

  // Parallel Bare Copper Ground (Green Wire Nut (-6.35, -2.65, -2.2) -> Outlet #2 Green Ground (+3.50, -2.35, 0.05))
  const parGndStaticCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6.35, -2.65, -2.2),
    new THREE.Vector3(-3.2, -3.15, -1.8),
    new THREE.Vector3(0.0, -3.1, -1.5),
    new THREE.Vector3(2.85, -2.9, -0.8),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(parGndStaticCurve, 36, 0.082, 8, false), bareCopperMat));

  const out2GndTipArm = new THREE.Group();
  out2GndTipArm.position.set(2.85, -2.9, -0.8);
  root.add(out2GndTipArm);
  const out2GndLead = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.43, 0.25, 0.82)]),
      10,
      0.08,
      8,
      false
    ),
    bareCopperMat
  );
  const out2GndHook = makeJHookChain(bareCopperMat);
  out2GndHook.rootHook.position.set(0.43, 0.25, 0.82);
  out2GndTipArm.add(out2GndLead, out2GndHook.rootHook);

  // Clockwise tightening indicator ring
  const cwRingGroup = new THREE.Group();
  const cwMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  cwMat.userData.dynamicAlpha = true;
  cwMat.userData.baseOpacity = 0;
  const cwArc = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.04, 8, 28, Math.PI * 1.45), cwMat);
  cwArc.rotation.y = Math.PI / 2;
  const cwTip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 10), cwMat);
  cwTip.position.set(0, 0.64, 0.04);
  cwTip.rotation.x = Math.PI / 2;
  cwRingGroup.add(cwArc, cwTip);
  root.add(cwRingGroup);

  // ---------- 4. Stylized Articulated Human Hand + NCVT + Slim Screwdriver + Two Plugs ----------
  function buildHumanHand(mirrorSide = 1) {
    const hand = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9a17c, roughness: 0.62, metalness: 0.04 });
    const cuffMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.76, 2.3, 16), cuffMat);
    cuff.position.set(0, -2.5, 0);
    hand.add(cuff);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.4, 0.62), skinMat);
    palm.position.set(0, -0.75, 0);
    hand.add(palm);

    for (let f = 0; f < 4; f++) {
      const fy = -0.15 - f * 0.33;
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.66, 6, 10), skinMat);
      finger.rotation.z = Math.PI * 0.42 * mirrorSide;
      finger.position.set(-0.52 * mirrorSide, fy, 0.22);
      hand.add(finger);
    }

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.155, 0.6, 6, 10), skinMat);
    thumb.rotation.z = -Math.PI * 0.32 * mirrorSide;
    thumb.position.set(0.4 * mirrorSide, -0.25, 0.32);
    hand.add(thumb);

    return hand;
  }

  // Tool A: Non-Contact Voltage Tester (NCVT) at Existing Outlet #1
  const ncvtGroup = new THREE.Group();
  root.add(ncvtGroup);
  const ncvtPenBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.26, 3.6, 16),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 })
  );
  ncvtPenBody.rotation.z = Math.PI / 2;
  const ncvtGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 1.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
  );
  ncvtGrip.rotation.z = Math.PI / 2;
  ncvtGrip.position.x = -1.0;
  const ncvtLedRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.27, 0.42, 16),
    new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 1.8 })
  );
  ncvtLedRing.rotation.z = Math.PI / 2;
  ncvtLedRing.position.x = 0.9;
  const ncvtTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.9, 14),
    new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 1.5 })
  );
  ncvtTip.rotation.z = -Math.PI / 2;
  ncvtTip.position.x = 2.25;
  const ncvtGlowMat = new THREE.SpriteMaterial({
    map: emeraldGlowTex,
    color: 0x34d399,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  ncvtGlowMat.userData.dynamicAlpha = true;
  ncvtGlowMat.userData.baseOpacity = 0.8;
  const ncvtGlow = new THREE.Sprite(ncvtGlowMat);
  ncvtGlow.scale.set(2.0, 2.0, 1);
  ncvtGlow.position.x = 2.35;

  const ncvtHand = buildHumanHand(1);
  ncvtHand.scale.setScalar(0.74);
  ncvtHand.rotation.z = -Math.PI / 2;
  ncvtHand.position.set(-1.35, -0.05, 0.05);
  ncvtGroup.add(ncvtPenBody, ncvtGrip, ncvtLedRing, ncvtTip, ncvtGlow, ncvtHand);

  // Tool B: Slim Insulated Electrician's Screwdriver (hand & cuff trail cleanly away from screw!)
  const driverGroup = new THREE.Group();
  root.add(driverGroup);
  const driverPivot = new THREE.Group();
  driverGroup.add(driverPivot);

  const driverHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.31, 0.27, 2.8, 16),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 })
  );
  driverHandle.rotation.z = Math.PI / 2;
  driverHandle.position.x = -4.25;
  const driverSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 3.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
  );
  driverSleeve.rotation.z = Math.PI / 2;
  driverSleeve.position.x = -1.3;
  const driverTip = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.22, 0.065),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
  );
  driverTip.position.x = 0.55;
  const driverHand = buildHumanHand(1);
  driverHand.scale.setScalar(0.72);
  driverHand.rotation.z = -Math.PI / 2;
  driverHand.position.set(-4.35, -0.05, 0.05);
  driverPivot.add(driverHandle, driverSleeve, driverTip, driverHand);

  // Helper to build a US 3-Prong Grounded NEMA 5-15P Plug
  function buildPlug(cordPoints) {
    const pGroup = new THREE.Group();
    const plugBodyMat = new THREE.MeshStandardMaterial({ color: 0x262c36, roughness: 0.38, metalness: 0.15 });
    const plugBody = new THREE.Mesh(new THREE.BoxGeometry(2.25, 2.0, 1.32), plugBodyMat);
    pGroup.add(plugBody);

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0 });
    ringMat.userData.dynamicAlpha = true;
    ringMat.userData.baseOpacity = 0;
    const readyRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.055, 8, 24), ringMat);
    readyRing.position.set(0, 0.1, 0.71);
    pGroup.add(readyRing);

    const prongBrassMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.18 });
    const prongSilverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.18 });

    // Longer round Ground pin (1.65 cm -> mates FIRST!)
    const gndPin = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 1.65, 14), prongBrassMat);
    gndPin.rotation.x = Math.PI / 2;
    gndPin.position.set(0, -0.5, -1.46);

    const neuBlade = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.54, 1.25), prongSilverMat);
    neuBlade.position.set(-0.56, 0.26, -1.26);

    const hotBlade = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.42, 1.25), prongBrassMat);
    hotBlade.position.set(0.56, 0.26, -1.26);

    const cordCurve = new THREE.CatmullRomCurve3(cordPoints);
    const cordMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0,
      roughness: 0.42,
    });
    const cord = new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 24, 0.21, 10, false), cordMat);

    const beads = [];
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
      b.visible = false;
      pGroup.add(b);
      beads.push({ mesh: b, phase: i / 6 });
    }

    pGroup.add(gndPin, neuBlade, hotBlade, cord);
    return { pGroup, ringMat, cordMat, cordCurve, beads };
  }

  // Existing Plug #1 seated in Outlet #1 (-5.2, -1.45, 2.08)
  const plug1 = buildPlug([
    new THREE.Vector3(0, -0.4, 0.65),
    new THREE.Vector3(-0.6, -1.5, 1.8),
    new THREE.Vector3(-1.8, -3.1, 2.2),
    new THREE.Vector3(-3.2, -5.0, 2.0),
  ]);
  plug1.pGroup.position.set(-5.2, -1.45, 2.08);
  root.add(plug1.pGroup);

  // New Plug #2 inserting into Outlet #2 (+5.2, -1.45, zPlug)
  const plug2 = buildPlug([
    new THREE.Vector3(0, -0.4, 0.65),
    new THREE.Vector3(0.5, -1.5, 1.8),
    new THREE.Vector3(1.7, -3.1, 2.2),
    new THREE.Vector3(3.1, -5.0, 2.0),
  ]);
  const plug2Hand = buildHumanHand(-1);
  plug2Hand.scale.setScalar(0.65);
  plug2Hand.rotation.set(0.15, -0.55, -0.45);
  plug2Hand.position.set(1.2, 0.68, 1.9);
  plug2.pGroup.add(plug2Hand);
  root.add(plug2.pGroup);

  // Ground-first emerald flash on Outlet #2's lower ground hole
  const gndBondMat = new THREE.SpriteMaterial({
    map: emeraldGlowTex,
    color: 0x34d399,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  gndBondMat.userData.dynamicAlpha = true;
  gndBondMat.userData.baseOpacity = 0;
  const gndBondFlash = new THREE.Sprite(gndBondMat);
  gndBondFlash.scale.set(2.0, 2.0, 1);
  gndBondFlash.position.set(5.2, -1.95, 1.55);
  root.add(gndBondFlash);

  // ---------- 5. Live Parallel Rail & Current-Splitting Pulses (I_total = I1 + I2) ----------
  const inFeedBeads = [];
  const parallelBeads = [];
  for (let i = 0; i < 6; i++) {
    const bIn = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
    bIn.visible = false;
    root.add(bIn);
    inFeedBeads.push({ mesh: bIn, phase: i / 6 });

    const bPar = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
    bPar.visible = false;
    root.add(bPar);
    parallelBeads.push({ mesh: bPar, phase: i / 6 });
  }

  const setFade = createStageFade(root);

  function update(tl, ac, elapsedSeconds) {
    const t = tl.t;
    const mag = Math.abs(ac.sinPhi);

    // 1. Ch 5 Step A: Outlet #1 Lower Brass Hook & Screw (21.2 -> 23.6)
    const o1HotAttach = smoothstep(21.2, 22.4, t);
    const o1HotTight = smoothstep(22.4, 23.6, t);
    setHookCurl(out1HotHook, smoothstep(20.6, 21.8, t), 1);
    out1HotTipArm.rotation.z = THREE.MathUtils.lerp(-0.45, 0.0, o1HotAttach);
    out1HotTipArm.position.x = THREE.MathUtils.lerp(-2.2, -3.0, o1HotAttach);
    out1.brassLower.position.x = THREE.MathUtils.lerp(2.02, 1.66, o1HotTight);
    out1.brassLower.rotation.x = -o1HotTight * Math.PI * 3.5;

    // Highlight Outlet #1 Brass Tab during parallel tap
    const brassTabHighlight = smoothstep(21.8, 22.4, t) * (1 - smoothstep(23.6, 24.1, t));
    const live = tl.breakerOn && t >= 33.0 ? 1 : 0;
    out1.brassTabMat.emissiveIntensity = 0.12 + brassTabHighlight * 1.15 + live * (0.45 + 0.7 * mag);
    out2.brassTabMat.emissiveIntensity = 0.12 + live * (0.45 + 0.7 * mag);

    // 2. Ch 5 Step B: Outlet #1 Lower Silver Hook & Screw + Ground Nut Pulse (23.9 -> 26.2)
    const o1NeuAttach = smoothstep(23.9, 24.8, t);
    const o1NeuTight = smoothstep(24.8, 25.9, t);
    setHookCurl(out1NeuHook, smoothstep(23.5, 24.4, t), -1);
    out1NeuTipArm.rotation.z = THREE.MathUtils.lerp(0.4, 0.0, o1NeuAttach);
    out1NeuTipArm.position.x = THREE.MathUtils.lerp(-7.8, -7.0, o1NeuAttach);
    out1.silverLower.position.x = THREE.MathUtils.lerp(-2.02, -1.66, o1NeuTight);
    out1.silverLower.rotation.x = o1NeuTight * Math.PI * 3.5;

    const silverTabHighlight = smoothstep(24.4, 25.0, t) * (1 - smoothstep(26.1, 26.6, t));
    out1.silverTabMat.emissiveIntensity = 0.05 + silverTabHighlight * 0.95;
    nutMat.emissiveIntensity = 0.3 + smoothstep(25.2, 25.8, t) * (1 - smoothstep(26.5, 27.0, t)) * 1.2;

    // 3. Ch 6: Outlet #2 Green Ground (28.5 -> 29.7), Silver Neutral (29.6 -> 30.8), Brass Hot (31.0 -> 32.7)
    const o2GndAttach = smoothstep(28.5, 29.0, t);
    const o2GndTight = smoothstep(29.0, 29.7, t);
    setHookCurl(out2GndHook, smoothstep(28.0, 28.8, t), -1);
    out2GndTipArm.rotation.z = THREE.MathUtils.lerp(0.35, 0.0, o2GndAttach);
    out2GndTipArm.position.x = THREE.MathUtils.lerp(2.2, 2.85, o2GndAttach);
    out2.greenScrew.position.x = THREE.MathUtils.lerp(-2.02, -1.66, o2GndTight);
    out2.greenScrew.rotation.x = o2GndTight * Math.PI * 3.5;

    const o2NeuAttach = smoothstep(29.6, 30.1, t);
    const o2NeuTight = smoothstep(30.1, 30.8, t);
    setHookCurl(out2NeuHook, smoothstep(29.2, 29.9, t), -1);
    out2NeuTipArm.rotation.z = THREE.MathUtils.lerp(0.35, 0.0, o2NeuAttach);
    out2NeuTipArm.position.x = THREE.MathUtils.lerp(2.5, 3.22, o2NeuAttach);
    out2.silverUpper.position.x = THREE.MathUtils.lerp(-2.02, -1.66, o2NeuTight);
    out2.silverUpper.rotation.x = o2NeuTight * Math.PI * 3.5;

    const o2HotAttach = smoothstep(31.0, 31.6, t);
    const o2HotTight = smoothstep(31.6, 32.7, t);
    setHookCurl(out2HotHook, smoothstep(30.6, 31.4, t), 1);
    out2HotTipArm.rotation.z = THREE.MathUtils.lerp(-0.35, 0.0, o2HotAttach);
    out2HotTipArm.position.x = THREE.MathUtils.lerp(7.8, 7.1, o2HotAttach);
    out2.brassUpper.position.x = THREE.MathUtils.lerp(2.02, 1.66, o2HotTight);
    out2.brassUpper.rotation.x = -o2HotTight * Math.PI * 3.5;

    // 4. Clockwise tightening indicator ring
    cwRingGroup.visible = false;
    cwMat.userData.baseOpacity = 0;
    const setRing = (x, y, hex, dirSign) => {
      cwRingGroup.visible = true;
      cwRingGroup.position.set(x, y, 0.05);
      cwRingGroup.rotation.z = dirSign < 0 ? Math.PI : 0;
      cwRingGroup.rotation.x = elapsedSeconds * 4.5 * dirSign;
      cwMat.color.setHex(hex);
      cwMat.userData.baseOpacity = 0.85;
    };
    if (o1HotTight > 0.02 && o1HotTight < 0.98) setRing(-3.0, -1.0, 0xfbbf24, -1);
    else if (o1NeuTight > 0.02 && o1NeuTight < 0.98) setRing(-7.4, -1.0, 0x38bdf8, 1);
    else if (o2GndTight > 0.02 && o2GndTight < 0.98) setRing(3.0, -2.35, 0x34d399, 1);
    else if (o2NeuTight > 0.02 && o2NeuTight < 0.98) setRing(3.0, 1.0, 0x38bdf8, 1);
    else if (o2HotTight > 0.02 && o2HotTight < 0.98) setRing(7.4, 1.0, 0xfbbf24, -1);

    // 5. Tool A: NCVT Voltage Tester at Outlet #1 (19.0 -> 21.0)
    const showNcvt = t >= 19.0 && t < 21.1;
    ncvtGroup.visible = showNcvt;
    if (showNcvt) {
      const hover = Math.sin(elapsedSeconds * 3.0) * 0.14;
      ncvtGroup.position.set(-8.6, -0.7 + hover, 2.7);
      ncvtGroup.rotation.set(0.1, 0.38, 0.18);
      ncvtGlowMat.userData.baseOpacity = 0.6 + 0.35 * Math.sin(elapsedSeconds * 8.0);
    }

    // 6. Tool B: Insulated Screwdriver across all 5 terminal tightenings
    driverGroup.visible = false;
    if (t >= 22.1 && t < 23.8) {
      driverGroup.visible = true;
      const eng = smoothstep(22.1, 22.4, t) * (1 - smoothstep(23.5, 23.8, t));
      driverGroup.position.set(THREE.MathUtils.lerp(-1.4, -2.65, eng), -1.0, 0.05);
      driverGroup.rotation.set(0, Math.PI, 0);
      driverPivot.rotation.x = o1HotTight * Math.PI * 3.5;
    } else if (t >= 24.5 && t < 26.1) {
      driverGroup.visible = true;
      const eng = smoothstep(24.5, 24.8, t) * (1 - smoothstep(25.8, 26.1, t));
      driverGroup.position.set(THREE.MathUtils.lerp(-9.0, -7.75, eng), -1.0, 0.05);
      driverGroup.rotation.set(0, 0, 0);
      driverPivot.rotation.x = o1NeuTight * Math.PI * 3.5;
    } else if (t >= 28.8 && t < 31.0) {
      driverGroup.visible = true;
      if (t < 29.85) {
        const eng = smoothstep(28.8, 29.0, t) * (1 - smoothstep(29.65, 29.85, t));
        driverGroup.position.set(THREE.MathUtils.lerp(1.4, 2.65, eng), -2.35, 0.05);
        driverGroup.rotation.set(0, 0, 0);
        driverPivot.rotation.x = o2GndTight * Math.PI * 3.5;
      } else {
        const moveUp = smoothstep(29.85, 30.15, t);
        const eng = smoothstep(30.0, 30.2, t) * (1 - smoothstep(30.75, 31.0, t));
        driverGroup.position.set(
          THREE.MathUtils.lerp(1.4, 2.65, eng),
          THREE.MathUtils.lerp(-2.35, 1.0, moveUp),
          0.05
        );
        driverGroup.rotation.set(0, 0, 0);
        driverPivot.rotation.x = o2NeuTight * Math.PI * 3.5;
      }
    } else if (t >= 31.4 && t < 32.9) {
      driverGroup.visible = true;
      const eng = smoothstep(31.4, 31.65, t) * (1 - smoothstep(32.6, 32.9, t));
      driverGroup.position.set(THREE.MathUtils.lerp(9.0, 7.75, eng), 1.0, 0.05);
      driverGroup.rotation.set(0, Math.PI, 0);
      driverPivot.rotation.x = o2HotTight * Math.PI * 3.5;
    }

    // 7. Live 120 V Hot Rails & Parallel Proof (Breaker returns ON at t = 33.0s)
    blackInsulMat.emissiveIntensity = live * (0.38 + 0.55 * mag);
    blackCopperMat.emissiveIntensity = live * (0.6 + 0.85 * mag);

    // Plug #1 (Outlet #1): tests unplugging during [35.4, 36.6] to prove Plug #2 keeps full 120 V!
    const pullOut = smoothstep(35.3, 35.65, t) * (1 - smoothstep(36.4, 36.75, t));
    plug1.pGroup.position.set(-5.2, -1.45, 2.08 + pullOut * 1.45);
    const p1Active = live && pullOut < 0.25;
    plug1.ringMat.userData.baseOpacity = p1Active ? (0.65 + 0.35 * mag) : 0;
    plug1.cordMat.emissiveIntensity = p1Active ? (0.28 + 0.45 * ac.poyntingMag) : 0;
    for (const item of plug1.beads) {
      item.mesh.visible = Boolean(p1Active);
      if (!item.mesh.visible) continue;
      const u = (item.phase + elapsedSeconds * 0.55) % 1;
      item.mesh.position.copy(plug1.cordCurve.getPointAt(u));
      item.mesh.scale.setScalar(0.6 + 0.5 * ac.poyntingMag);
    }

    // Plug #2 (Outlet #2): inserts [33.1, 34.3] (Ground pin mates first around 33.85s) & stays 120V LIVE!
    const showPlug2 = t >= 33.0;
    plug2.pGroup.visible = showPlug2;
    if (showPlug2) {
      const insertProg = smoothstep(33.1, 34.3, t);
      plug2.pGroup.position.set(5.2, -1.45, THREE.MathUtils.lerp(6.8, 2.08, insertProg));

      const dtGnd = t - 33.82;
      gndBondMat.userData.baseOpacity = dtGnd >= 0 && dtGnd < 0.45
        ? Math.sin((dtGnd / 0.45) * Math.PI) * 0.95
        : 0;

      const handOut = smoothstep(34.4, 34.9, t);
      plug2Hand.position.set(1.2 + handOut * 1.4, 0.68 + handOut * 0.8, 1.9 + handOut * 1.6);
      plug2Hand.visible = handOut < 0.98;

      const p2Active = tl.plugSeated && live;
      plug2.ringMat.userData.baseOpacity = p2Active ? (0.68 + 0.32 * mag) : 0;
      plug2.cordMat.emissiveIntensity = p2Active ? (0.3 + 0.45 * ac.poyntingMag) : 0;
      for (const item of plug2.beads) {
        item.mesh.visible = Boolean(p2Active);
        if (!item.mesh.visible) continue;
        const u = (item.phase + elapsedSeconds * 0.55) % 1;
        item.mesh.position.copy(plug2.cordCurve.getPointAt(u));
        item.mesh.scale.setScalar(0.6 + 0.5 * ac.poyntingMag);
      }
    } else {
      gndBondMat.userData.baseOpacity = 0;
    }

    // Incoming feed (I_total = I1 + I2) & Parallel Jumper (I2) current beads
    const p2Live = Boolean(tl.plugSeated && live);
    const inSpeed = p1Active && p2Live ? 0.65 : 0.38;
    for (const item of inFeedBeads) {
      item.mesh.visible = Boolean(live);
      if (!item.mesh.visible) continue;
      const u = (item.phase + elapsedSeconds * inSpeed) % 1;
      item.mesh.position.copy(inHotCurve.getPointAt(u));
      item.mesh.scale.setScalar((p1Active && p2Live ? 0.85 : 0.6) + 0.4 * ac.poyntingMag);
    }

    for (const item of parallelBeads) {
      item.mesh.visible = p2Live;
      if (!item.mesh.visible) continue;
      const u = (item.phase + elapsedSeconds * 0.5) % 1;
      item.mesh.position.copy(parHotStaticCurve.getPointAt(u));
      item.mesh.scale.setScalar(0.65 + 0.45 * ac.poyntingMag);
    }
  }

  return {
    root,
    setFade,
    update,
  };
}
