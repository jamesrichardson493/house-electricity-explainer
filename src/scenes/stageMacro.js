// Stage A: Macro Street Hookup, Pole Transformer, Main Breaker Panel, Behind-Wall Romex & Edison Lamp (1 unit = 1 m)

import * as THREE from 'three';
import { STAGE_A_PIVOT } from '../physics.js';
import { createStageFade, makeGlowTexture } from './stageUtils.js';

export function createStageMacro() {
  const root = new THREE.Group();
  root.name = 'StageMacroRoot';

  // Shared-pivot offset so outlet copper terminal at (2.6, 1.15, 0.72) sits at world (0,0,0)
  const content = new THREE.Group();
  content.position.set(-STAGE_A_PIVOT.x, -STAGE_A_PIVOT.y, -STAGE_A_PIVOT.z);
  root.add(content);

  function toWorld(localPos) {
    return new THREE.Vector3(
      localPos.x - STAGE_A_PIVOT.x,
      localPos.y - STAGE_A_PIVOT.y,
      localPos.z - STAGE_A_PIVOT.z
    );
  }

  const warmGlowTex = makeGlowTexture('rgba(255,244,200,1)', 'rgba(251,191,36,0.5)');
  const cyanGlowTex = makeGlowTexture('rgba(230,250,255,1)', 'rgba(56,189,248,0.5)');

  // ---------- 1. Twilight Ground, Street & Earth Cutaway ----------
  const envGroup = new THREE.Group();
  content.add(envGroup);

  const lawnMat = new THREE.MeshStandardMaterial({ color: 0x0f1a24, roughness: 0.95, metalness: 0.05 });
  const lawn = new THREE.Mesh(new THREE.BoxGeometry(44, 0.2, 26), lawnMat);
  lawn.position.set(-4, -0.1, 2);
  envGroup.add(lawn);

  // Subtle asphalt road in front-left
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x131823, roughness: 0.9, metalness: 0.1 });
  const road = new THREE.Mesh(new THREE.BoxGeometry(44, 0.22, 6.2), roadMat);
  road.position.set(-4, -0.09, 7.9);
  envGroup.add(road);

  const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const curb = new THREE.Mesh(new THREE.BoxGeometry(44, 0.28, 0.24), curbMat);
  curb.position.set(-4, -0.04, 4.75);
  envGroup.add(curb);

  // Dashed street center line
  const dashMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.35 });
  for (let x = -22; x <= 14; x += 3.2) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.12), dashMat);
    dash.position.set(x, 0.03, 7.9);
    envGroup.add(dash);
  }

  // Soil cutaway pit on left side of house to display buried copper ground rod
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x332419, roughness: 0.95 });
  const soilBox = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 1.1), soilMat);
  soilBox.position.set(-5.3, -0.32, 1.45);
  envGroup.add(soilBox);

  const rodMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.88,
    roughness: 0.25,
    emissive: 0x10b981,
    emissiveIntensity: 0.65,
  });
  const groundRod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.15, 14), rodMat);
  groundRod.position.set(-5.25, -0.18, 1.45);
  envGroup.add(groundRod);

  const groundClamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.09, 0.13),
    new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 1.3 })
  );
  groundClamp.position.set(-5.25, 0.34, 1.45);
  envGroup.add(groundClamp);

  // ---------- 2. Utility Pole & Cutaway Split-Phase Transformer ----------
  const poleGroup = new THREE.Group();
  content.add(poleGroup);

  const woodPoleMat = new THREE.MeshStandardMaterial({ color: 0x4b382a, roughness: 0.9 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 10.6, 16), woodPoleMat);
  pole.position.set(-13.0, 5.2, 4.0);
  poleGroup.add(pole);

  const crossarm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 2.8), woodPoleMat);
  crossarm.position.set(-13.0, 9.15, 4.0);
  poleGroup.add(crossarm);

  // Crossarm braces
  const braceMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.4 });
  for (const dz of [-0.85, 0.85]) {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.15), braceMat);
    brace.position.set(-12.92, 8.75, 4.0 + dz * 0.55);
    brace.rotation.x = dz > 0 ? 0.65 : -0.65;
    poleGroup.add(brace);
  }

  // Porcelain insulators & 7,200 V primary lines
  const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.1 });
  const hvLineMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.85,
    roughness: 0.35,
    metalness: 0.6,
  });

  const primaryZ = [2.85, 4.0, 5.15];
  primaryZ.forEach((pz) => {
    const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.26, 12), ceramicMat);
    ins.position.set(-13.0, 9.35, pz);
    poleGroup.add(ins);

    const hvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-25, 9.85, pz),
      new THREE.Vector3(-19, 9.32, pz),
      new THREE.Vector3(-13.0, 9.48, pz),
      new THREE.Vector3(-6.0, 9.3, pz),
      new THREE.Vector3(3.0, 9.75, pz),
    ]);
    const hvWire = new THREE.Mesh(new THREE.TubeGeometry(hvCurve, 40, 0.025, 8, false), hvLineMat);
    poleGroup.add(hvWire);
  });

  // Tap wire dropping from center primary insulator into transformer HV bushing
  const tapCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-13.0, 9.48, 4.0),
    new THREE.Vector3(-12.55, 8.95, 3.95),
    new THREE.Vector3(-12.25, 8.42, 3.9),
  ]);
  poleGroup.add(new THREE.Mesh(new THREE.TubeGeometry(tapCurve, 18, 0.022, 8, false), hvLineMat));

  // Pole Transformer at (-12.25, 7.55, 3.9)
  const xfmrGroup = new THREE.Group();
  xfmrGroup.position.set(-12.25, 7.55, 3.9);
  poleGroup.add(xfmrGroup);

  const tankMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.55, roughness: 0.42 });
  // Back half of tank stays solid
  const tankBack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, 1.38, 24, 1, false, Math.PI * 0.55, Math.PI * 1.1),
    tankMat
  );
  xfmrGroup.add(tankBack);
  const tankBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 24), tankMat);
  tankBottom.position.y = -0.69;
  xfmrGroup.add(tankBottom);
  const tankTop = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.08, 24), tankMat);
  tankTop.position.y = 0.69;
  xfmrGroup.add(tankTop);

  // Front cutaway tank door that dissolves/opens smoothly during Chapter 1
  const tankFrontMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.55,
    roughness: 0.42,
    transparent: true,
    opacity: 1.0,
  });
  tankFrontMat.userData.dynamicAlpha = true;
  tankFrontMat.userData.baseOpacity = 1.0;

  const tankFront = new THREE.Mesh(
    new THREE.CylinderGeometry(0.465, 0.465, 1.36, 24, 1, false, -Math.PI * 0.45, Math.PI * 1.0),
    tankFrontMat
  );
  xfmrGroup.add(tankFront);

  // Transformer HV bushing on lid
  const hvBushing = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.36, 12), ceramicMat);
  hvBushing.position.set(0, 0.86, 0);
  xfmrGroup.add(hvBushing);

  // Secondary 3 bushings on right/front side (+X)
  const secBushingsY = [0.24, 0.0, -0.24];
  secBushingsY.forEach((by) => {
    const sb = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.048, 0.22, 10), ceramicMat);
    sb.rotation.z = -Math.PI / 2;
    sb.position.set(0.5, by, 0.1);
    xfmrGroup.add(sb);
  });

  // Inside Transformer: Iron Core + Primary Coil + Secondary Center-Tapped Coils + Magnetic Flux
  const ironCoreMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.82, roughness: 0.3 });
  const coreFrame = new THREE.Group();
  const coreLeft = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.92, 0.24), ironCoreMat);
  coreLeft.position.set(-0.2, 0, 0);
  const coreRight = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.92, 0.24), ironCoreMat);
  coreRight.position.set(0.2, 0, 0);
  const coreTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.24), ironCoreMat);
  coreTop.position.set(0, 0.42, 0);
  const coreBot = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.24), ironCoreMat);
  coreBot.position.set(0, -0.42, 0);
  coreFrame.add(coreLeft, coreRight, coreTop, coreBot);
  xfmrGroup.add(coreFrame);

  // Primary coil windings (left leg, glowing amber)
  const primaryCoilMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.2,
    metalness: 0.85,
    roughness: 0.25,
  });
  for (let i = -3; i <= 3; i++) {
    const turn = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.022, 8, 20), primaryCoilMat);
    turn.rotation.x = Math.PI / 2;
    turn.position.set(-0.2, i * 0.075, 0);
    xfmrGroup.add(turn);
  }

  // Secondary coil windings (right leg: top = L1 amber, bottom = L2 coral, center tap = white/emerald)
  const secL1Mat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.25,
    metalness: 0.85,
    roughness: 0.22,
  });
  const secL2Mat = new THREE.MeshStandardMaterial({
    color: 0xfda4af,
    emissive: 0xfb7185,
    emissiveIntensity: 1.25,
    metalness: 0.85,
    roughness: 0.22,
  });
  for (let i = 1; i <= 3; i++) {
    const turnTop = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.028, 8, 20), secL1Mat);
    turnTop.rotation.x = Math.PI / 2;
    turnTop.position.set(0.2, i * 0.082, 0);
    xfmrGroup.add(turnTop);

    const turnBot = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.028, 8, 20), secL2Mat);
    turnBot.rotation.x = Math.PI / 2;
    turnBot.position.set(0.2, -i * 0.082, 0);
    xfmrGroup.add(turnBot);
  }

  // Center tap neutral tie
  const centerTapRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.02, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0x38bdf8, emissiveIntensity: 0.8 })
  );
  centerTapRing.rotation.x = Math.PI / 2;
  centerTapRing.position.set(0.2, 0, 0);
  xfmrGroup.add(centerTapRing);

  // Pulsing Magnetic Flux Loop inside core
  const fluxMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  fluxMat.userData.dynamicAlpha = true;
  fluxMat.userData.baseOpacity = 0.85;
  const fluxCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-0.2, 0.38, 0.14),
      new THREE.Vector3(0.2, 0.38, 0.14),
      new THREE.Vector3(0.2, -0.38, 0.14),
      new THREE.Vector3(-0.2, -0.38, 0.14),
    ],
    true
  );
  const fluxLoop = new THREE.Mesh(new THREE.TubeGeometry(fluxCurve, 40, 0.024, 8, true), fluxMat);
  xfmrGroup.add(fluxLoop);

  const xfmrGlowSpriteMat = new THREE.SpriteMaterial({
    map: cyanGlowTex,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  xfmrGlowSpriteMat.userData.dynamicAlpha = true;
  xfmrGlowSpriteMat.userData.baseOpacity = 0.55;
  const xfmrGlowSprite = new THREE.Sprite(xfmrGlowSpriteMat);
  xfmrGlowSprite.scale.set(1.4, 1.4, 1);
  xfmrGlowSprite.position.set(0, 0, 0.18);
  xfmrGroup.add(xfmrGlowSprite);

  // ---------- 3. Triplex Service Drop, Weatherhead Mast & Meter ----------
  const dropGroup = new THREE.Group();
  content.add(dropGroup);

  const l1DropMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0xfbbf24, emissiveIntensity: 0.65, roughness: 0.45 });
  const l2DropMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0xfb7185, emissiveIntensity: 0.65, roughness: 0.45 });
  const nDropMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.8 });

  const makeDropCurve = (startY, endOffset) =>
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-11.65, 7.55 + startY, 4.0),
      new THREE.Vector3(-9.5, 5.45 + startY * 0.4, 2.85 + endOffset),
      new THREE.Vector3(-7.0, 4.35 + startY * 0.2, 1.85 + endOffset),
      new THREE.Vector3(-4.98, 4.18, 1.2 + endOffset * 0.4),
    ]);

  const l1DropCurve = makeDropCurve(0.24, 0.08);
  const nDropCurve = makeDropCurve(0.0, 0.0);
  const l2DropCurve = makeDropCurve(-0.24, -0.08);

  dropGroup.add(new THREE.Mesh(new THREE.TubeGeometry(l1DropCurve, 36, 0.025, 8, false), l1DropMat));
  dropGroup.add(new THREE.Mesh(new THREE.TubeGeometry(nDropCurve, 36, 0.022, 8, false), nDropMat));
  dropGroup.add(new THREE.Mesh(new THREE.TubeGeometry(l2DropCurve, 36, 0.025, 8, false), l2DropMat));

  // Service mast conduit down exterior left wall into meter & into house panel
  const conduitMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.78, roughness: 0.3 });
  const mastPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.35, 12), conduitMat);
  mastPipe.position.set(-5.05, 3.08, 1.2);
  dropGroup.add(mastPipe);

  const weatherhead = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.18, 12), conduitMat);
  weatherhead.position.set(-5.05, 4.25, 1.2);
  dropGroup.add(weatherhead);

  // Electric Meter on left wall at (-5.1, 1.95, 1.2)
  const meterBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.34), conduitMat);
  meterBase.position.set(-5.08, 1.95, 1.2);
  dropGroup.add(meterBase);

  const meterDome = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.16, 20),
    new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.45, roughness: 0.1, transmission: 0.4 })
  );
  meterDome.rotation.z = Math.PI / 2;
  meterDome.position.set(-5.2, 1.95, 1.2);
  dropGroup.add(meterDome);

  const meterRingMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.9 });
  const meterRing = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.014, 8, 24, Math.PI * 1.4), meterRingMat);
  meterRing.rotation.y = Math.PI / 2;
  meterRing.position.set(-5.22, 1.95, 1.2);
  dropGroup.add(meterRing);

  // Ground wire from panel bottom out to ground rod
  const groundWireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.35, 1.62, 0.85),
    new THREE.Vector3(-4.88, 1.25, 1.15),
    new THREE.Vector3(-5.25, 0.72, 1.45),
    new THREE.Vector3(-5.25, 0.34, 1.45),
  ]);
  dropGroup.add(new THREE.Mesh(new THREE.TubeGeometry(groundWireCurve, 24, 0.022, 8, false), rodMat));

  // ---------- 4. House Cutaway Architecture (Timber Studs + Dissolving Walls) ----------
  const houseGroup = new THREE.Group();
  content.add(houseGroup);

  // Foundation slab & warm oak floor
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 0.24, 5.4),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
  );
  slab.position.set(0.75, 0.08, 0.2);
  houseGroup.add(slab);

  const woodFloor = new THREE.Mesh(
    new THREE.BoxGeometry(11.2, 0.06, 5.0),
    new THREE.MeshStandardMaterial({ color: 0x3b281c, roughness: 0.72 })
  );
  woodFloor.position.set(0.75, 0.22, 0.2);
  houseGroup.add(woodFloor);

  // Back interior stud wall along z = 0.72 (x from -4.9 to 6.3)
  const studMat = new THREE.MeshStandardMaterial({ color: 0xb98552, roughness: 0.82 });
  const bottomPlate = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.08, 0.12), studMat);
  bottomPlate.position.set(0.7, 0.28, 0.72);
  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.09, 0.12), studMat);
  topPlate.position.set(0.7, 3.18, 0.72);
  houseGroup.add(bottomPlate, topPlate);

  // Vertical 2x4 studs (avoiding panel & outlet exact centers)
  const studXs = [-4.9, -3.65, -2.5, -1.35, -0.38, 0.85, 2.0, 3.3, 4.6, 6.2];
  for (const sx of studXs) {
    const stud = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.86, 0.11), studMat);
    stud.position.set(sx, 1.73, 0.72);
    houseGroup.add(stud);
  }

  // Side walls framing & pitched roof rafters
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.15 });
  const roofBack = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.14, 3.6), roofMat);
  roofBack.position.set(0.75, 4.15, -0.8);
  roofBack.rotation.x = -0.48;
  houseGroup.add(roofBack);

  const roofFront = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.14, 3.3), roofMat);
  roofFront.position.set(0.75, 4.2, 1.8);
  roofFront.rotation.x = 0.48;
  houseGroup.add(roofFront);

  // Dissolving exterior siding panels (front + left wall)
  const sidingMat = new THREE.MeshPhysicalMaterial({
    color: 0x26354d,
    roughness: 0.65,
    metalness: 0.1,
    transparent: true,
    opacity: 0.92,
  });
  sidingMat.userData.dynamicAlpha = true;
  sidingMat.userData.baseOpacity = 0.92;

  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(11.5, 3.05, 0.08), sidingMat);
  frontWall.position.set(0.75, 1.72, 2.75);
  houseGroup.add(frontWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.05, 5.2), sidingMat);
  leftWall.position.set(-4.98, 1.72, 0.2);
  houseGroup.add(leftWall);

  // Subtle architectural glass drywall back panel behind the studs so wiring pops cleanly
  const backDrywall = new THREE.Mesh(
    new THREE.BoxGeometry(11.3, 3.0, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x111a2b, roughness: 0.9 })
  );
  backDrywall.position.set(0.7, 1.72, 0.56);
  houseGroup.add(backDrywall);

  // Blueprint wireframe edge outline around house envelope (stays subtly visible when walls dissolve)
  const houseEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(11.5, 3.05, 5.2)),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 })
  );
  houseEdges.position.set(0.75, 1.72, 0.2);
  houseGroup.add(houseEdges);

  // ---------- 5. Main Breaker Panel at (-4.3, 2.1, 0.8) ----------
  const panelGroup = new THREE.Group();
  panelGroup.position.set(-4.3, 2.1, 0.8);
  houseGroup.add(panelGroup);

  const panelBoxMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.65, roughness: 0.35 });
  const panelBox = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.98, 0.18), panelBoxMat);
  panelGroup.add(panelBox);

  const panelInterior = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.88, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.72, metalness: 0.2 })
  );
  panelInterior.position.set(0, 0, 0.08);
  panelGroup.add(panelInterior);

  // Subtle local light inside panel opening so busbars & breakers read crystal-clear
  const panelLight = new THREE.PointLight(0xe2e8f0, 1.8, 3.2, 1.5);
  panelLight.position.set(0.05, 0.05, 0.75);
  panelGroup.add(panelLight);

  // Hinged steel panel door (swings wide open to the left out of camera view)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.36, 0, 0.11);
  panelGroup.add(doorPivot);
  const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.98, 0.025), panelBoxMat);
  doorMesh.position.set(0.36, 0, 0);
  doorPivot.add(doorMesh);

  // Twin vertical split-phase hot busbars: L1 (amber) & L2 (coral)
  const busL1Mat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.6, metalness: 0.75 });
  const busL2Mat = new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xf43f5e, emissiveIntensity: 1.6, metalness: 0.75 });
  const busNMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, emissive: 0x38bdf8, emissiveIntensity: 0.65, metalness: 0.8 });
  const busGMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.95, metalness: 0.75 });

  const busL1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.56, 0.04), busL1Mat);
  busL1.position.set(-0.045, -0.04, 0.115);
  const busL2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.56, 0.04), busL2Mat);
  busL2.position.set(0.045, -0.04, 0.115);
  const busNeutral = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.62, 0.04), busNMat);
  busNeutral.position.set(-0.24, -0.03, 0.115);
  const busGround = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.62, 0.04), busGMat);
  busGround.position.set(0.24, -0.03, 0.115);
  panelGroup.add(busL1, busL2, busNeutral, busGround);

  // Main 200A breaker at top
  const breakerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.25 });
  const mainBreaker = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.065), breakerMat);
  mainBreaker.position.set(0, 0.34, 0.125);
  panelGroup.add(mainBreaker);

  // Branch breakers along left & right; 240V double-pole + Living Room 20A breaker (toggles OFF in Ch 4)
  const heroBreakerMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.25,
  });
  const heroBreakerHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.042, 0.045),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
  );
  heroBreakerHandle.position.set(-0.18, 0.17 - 2 * 0.105, 0.155);
  panelGroup.add(heroBreakerHandle);

  for (let row = 0; row < 5; row++) {
    const by = 0.17 - row * 0.105;
    const isHeroBreaker = row === 2;
    const brLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.072, 0.055),
      isHeroBreaker ? heroBreakerMat : breakerMat
    );
    brLeft.position.set(-0.135, by, 0.125);
    panelGroup.add(brLeft);

    const brRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, row === 0 ? 0.14 : 0.072, 0.055),
      row === 0
        ? new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0xfb7185, emissiveIntensity: 0.45 })
        : breakerMat
    );
    brRight.position.set(0.135, row === 0 ? by - 0.035 : by, 0.125);
    if (row !== 1) panelGroup.add(brRight);
  }

  // ---------- 6. Behind-Wall 12/2 Romex, Wall Switch, Outlet & Edison Lamp ----------
  const wiringGroup = new THREE.Group();
  houseGroup.add(wiringGroup);

  // Romex route: Panel -> Wall Switch (0.55, 1.65, 0.72) -> Outlet (2.6, 1.15, 0.72)
  // Final segment approaches (2.6, 1.15, 0.72) straight along +X for seamless Stage A -> B tunnel!
  const romexToSwitchPts = [
    new THREE.Vector3(-4.15, 2.04, 0.75),
    new THREE.Vector3(-2.8, 1.95, 0.72),
    new THREE.Vector3(-1.1, 1.75, 0.72),
    new THREE.Vector3(0.55, 1.65, 0.72),
  ];
  const romexSwitchToOutletPts = [
    new THREE.Vector3(0.55, 1.65, 0.72),
    new THREE.Vector3(1.25, 1.55, 0.72),
    new THREE.Vector3(1.75, 1.22, 0.72),
    new THREE.Vector3(2.15, 1.15, 0.72),
    new THREE.Vector3(2.6, 1.15, 0.72),
  ];

  const romexJacketMat = new THREE.MeshPhysicalMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.36,
    roughness: 0.3,
    depthWrite: false,
  });
  romexJacketMat.userData.dynamicAlpha = true;
  romexJacketMat.userData.baseOpacity = 0.36;

  const hotCoreMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.1,
    metalness: 0.75,
    roughness: 0.25,
  });
  const hotSwitchedMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.1,
    metalness: 0.75,
    roughness: 0.25,
  });
  const neutralCoreMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.1,
    metalness: 0.65,
    roughness: 0.3,
  });
  const bareGroundMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.88,
    roughness: 0.25,
  });

  function addRomexSegment(pts, hotMat, radiusJacket = 0.036) {
    const curve = new THREE.CatmullRomCurve3(pts);
    wiringGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 44, radiusJacket, 10, false), romexJacketMat));

    const offsetCurve = (dy, dz) =>
      new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.x, p.y + dy, p.z + dz)));

    wiringGroup.add(new THREE.Mesh(new THREE.TubeGeometry(offsetCurve(0.012, 0.008), 44, 0.011, 8, false), hotMat));
    wiringGroup.add(new THREE.Mesh(new THREE.TubeGeometry(offsetCurve(-0.012, 0.008), 44, 0.011, 8, false), neutralCoreMat));
    wiringGroup.add(new THREE.Mesh(new THREE.TubeGeometry(offsetCurve(0.0, -0.011), 44, 0.009, 7, false), bareGroundMat));
    return { curve, hotCurve: offsetCurve(0.012, 0.008), neutralCurve: offsetCurve(-0.012, 0.008) };
  }

  const segPanelToSwitch = addRomexSegment(romexToSwitchPts, hotCoreMat);
  const segSwitchToOutlet = addRomexSegment(romexSwitchToOutletPts, hotSwitchedMat);

  // Wall Switch Box at (-0.3, 2.0, 0.72)
  const blueBoxMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.55,
    roughness: 0.35,
  });
  blueBoxMat.userData.dynamicAlpha = true;
  blueBoxMat.userData.baseOpacity = 0.55;

  const switchGroup = new THREE.Group();
  switchGroup.position.set(0.55, 1.65, 0.74);
  wiringGroup.add(switchGroup);

  const switchBox = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.14), blueBoxMat);
  switchGroup.add(switchBox);

  const switchPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.19, 0.28, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4, transparent: true, opacity: 0.85 })
  );
  switchPlate.position.z = 0.075;
  switchGroup.add(switchPlate);

  // Animated switch rocker paddle
  const rockerPivot = new THREE.Group();
  rockerPivot.position.set(0, 0, 0.09);
  switchGroup.add(rockerPivot);
  const rockerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.11, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x38bdf8, emissiveIntensity: 0.25, roughness: 0.3 })
  );
  rockerPivot.add(rockerMesh);

  // Brief switch spark halo sprite
  const switchSparkMat = new THREE.SpriteMaterial({
    map: cyanGlowTex,
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  switchSparkMat.userData.dynamicAlpha = true;
  switchSparkMat.userData.baseOpacity = 0;
  const switchSparkSprite = new THREE.Sprite(switchSparkMat);
  switchSparkSprite.scale.set(0.45, 0.45, 1);
  switchSparkSprite.position.set(0, 0, 0.11);
  switchGroup.add(switchSparkSprite);

  // Duplex NEMA 5-15 Outlet at (2.6, 1.15, 0.72) — HERO PIVOT (world 0,0,0)
  const outletGroup = new THREE.Group();
  outletGroup.position.set(2.6, 1.15, 0.72);
  wiringGroup.add(outletGroup);

  const outletBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.14), blueBoxMat);
  outletGroup.add(outletBox);

  // Exposed horizontal copper bar right at pivot (2.6, 1.15, 0.72) for scale-tunnel handoff!
  const heroCopperTerm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.55,
      metalness: 0.9,
      roughness: 0.2,
    })
  );
  heroCopperTerm.rotation.z = Math.PI / 2;
  heroCopperTerm.position.set(-0.02, 0, 0);
  outletGroup.add(heroCopperTerm);

  const outletFace = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.22, 0.025),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 })
  );
  outletFace.position.z = 0.075;
  outletGroup.add(outletFace);

  // Plug inserted into lower receptacle
  const plugBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  plugBody.position.set(0, -0.04, 0.11);
  outletGroup.add(plugBody);

  // ---------- 6B. New Outlet Box #2 at (5.1, 1.15, 0.72) + Parallel 12/2 NM-B Jumper ----------
  const outlet2Group = new THREE.Group();
  outlet2Group.position.set(5.1, 1.15, 0.72);
  wiringGroup.add(outlet2Group);

  const outlet2Box = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.14), blueBoxMat);
  outlet2Group.add(outlet2Box);

  const outlet2EdgesMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
  outlet2EdgesMat.userData.dynamicAlpha = true;
  outlet2EdgesMat.userData.baseOpacity = 0.7;
  const outlet2Edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.19, 0.25, 0.15)),
    outlet2EdgesMat
  );
  outlet2Group.add(outlet2Edges);

  // Parallel 12/2 jumper from Outlet #1 (2.6, 1.15, 0.72) through stud bay to New Outlet Box #2 (5.1, 1.15, 0.72)
  const parallelPts = [
    new THREE.Vector3(2.68, 1.15, 0.72),
    new THREE.Vector3(3.3, 1.15, 0.72),
    new THREE.Vector3(4.15, 1.15, 0.72),
    new THREE.Vector3(5.02, 1.15, 0.72),
  ];
  const parallelJacketMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.25,
    roughness: 0.4,
  });
  const parallelGeos = [];
  const pJacketGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(parallelPts), 36, 0.032, 10, false);
  const pHotGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(parallelPts.map((p) => new THREE.Vector3(p.x, p.y + 0.012, p.z + 0.01))),
    36,
    0.01,
    8,
    false
  );
  const pNeuGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(parallelPts.map((p) => new THREE.Vector3(p.x, p.y - 0.012, p.z + 0.01))),
    36,
    0.01,
    8,
    false
  );
  const parallelGroup = new THREE.Group();
  wiringGroup.add(parallelGroup);
  parallelGroup.add(new THREE.Mesh(pJacketGeo, parallelJacketMat));
  parallelGroup.add(new THREE.Mesh(pHotGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })));
  parallelGroup.add(new THREE.Mesh(pNeuGeo, new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })));
  for (const g of [pJacketGeo, pHotGeo, pNeuGeo]) {
    parallelGeos.push({ geo: g, total: g.index ? g.index.count : g.attributes.position.count });
  }

  // Modern side table & sculpted Edison lamp at (3.9, 0.18..2.05, 1.2)
  const lampGroup = new THREE.Group();
  houseGroup.add(lampGroup);

  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.05, 24),
    new THREE.MeshStandardMaterial({ color: 0x452a1b, roughness: 0.55 })
  );
  tableTop.position.set(3.9, 0.88, 1.2);
  lampGroup.add(tableTop);

  const tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.65, 14),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 })
  );
  tableLeg.position.set(3.9, 0.54, 1.2);
  lampGroup.add(tableLeg);

  const lampCordPts = [
    new THREE.Vector3(2.6, 1.11, 0.85),
    new THREE.Vector3(2.85, 0.55, 1.05),
    new THREE.Vector3(3.4, 0.38, 1.15),
    new THREE.Vector3(3.82, 0.91, 1.2),
  ];
  const lampCordCurve = new THREE.CatmullRomCurve3(lampCordPts);
  lampGroup.add(new THREE.Mesh(new THREE.TubeGeometry(lampCordCurve, 28, 0.015, 8, false), hotSwitchedMat));

  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 0.08, 20),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
  );
  lampBase.position.set(3.9, 0.94, 1.2);
  lampGroup.add(lampBase);

  const lampStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.95, 12),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.22 })
  );
  lampStem.position.set(3.9, 1.44, 1.2);
  lampGroup.add(lampStem);

  const socket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.045, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.25 })
  );
  socket.position.set(3.9, 1.92, 1.2);
  lampGroup.add(socket);

  const bulbGlass = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 24, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0xfffbeb,
      transparent: true,
      opacity: 0.32,
      roughness: 0.08,
      metalness: 0.05,
    })
  );
  bulbGlass.position.set(3.9, 2.08, 1.2);
  lampGroup.add(bulbGlass);

  // Coiled filament inside bulb
  const filamentMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xffb703,
    emissiveIntensity: 0.05,
    roughness: 0.3,
  });
  const filamentCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.86, 1.97, 1.2),
    new THREE.Vector3(3.87, 2.11, 1.2),
    new THREE.Vector3(3.9, 2.14, 1.22),
    new THREE.Vector3(3.93, 2.11, 1.2),
    new THREE.Vector3(3.94, 1.97, 1.2),
  ]);
  lampGroup.add(new THREE.Mesh(new THREE.TubeGeometry(filamentCurve, 24, 0.008, 6, false), filamentMat));

  const bulbGlowMat = new THREE.SpriteMaterial({
    map: warmGlowTex,
    color: 0xffd166,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  bulbGlowMat.userData.dynamicAlpha = true;
  bulbGlowMat.userData.baseOpacity = 0;
  const bulbGlowSprite = new THREE.Sprite(bulbGlowMat);
  bulbGlowSprite.scale.set(1.5, 1.5, 1);
  bulbGlowSprite.position.set(3.9, 2.08, 1.2);
  lampGroup.add(bulbGlowSprite);

  // Warm interior PointLight attached to the Edison bulb
  const lampLight = new THREE.PointLight(0xffbe55, 0, 12, 1.5);
  lampLight.position.set(3.9, 2.1, 1.2);
  lampGroup.add(lampLight);

  // ---------- 7. Animated Energy Pulse Beads Along Circuit ----------
  const pulseGeo = new THREE.SphereGeometry(0.032, 10, 10);
  const preSwitchBeadMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const activeBeadMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  const dropBeads = [];
  for (let i = 0; i < 10; i++) {
    const b1 = new THREE.Mesh(pulseGeo, preSwitchBeadMat);
    const b2 = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: 0xfb7185 }));
    dropGroup.add(b1, b2);
    dropBeads.push({ b1, b2, phase: i / 10 });
  }

  const circuitBeads = [];
  for (let i = 0; i < 14; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), activeBeadMat);
    wiringGroup.add(b);
    circuitBeads.push({ mesh: b, phase: i / 14 });
  }

  const setFade = createStageFade(root);

  function update(tl, ac, elapsedSeconds) {
    // 1. Cutaway transformer tank fade/open
    const tankOpen = tl.transformerCutaway;
    tankFrontMat.userData.baseOpacity = Math.max(0.06, 1.0 - tankOpen * 0.94);

    // 2. Magnetic flux & coil pulsing with AC phase
    const mag = Math.abs(ac.sinPhi);
    fluxMat.userData.baseOpacity = 0.25 + 0.75 * mag;
    fluxMat.color.setHex(ac.sinPhi >= 0 ? 0x38bdf8 : 0xa78bfa);
    xfmrGlowSpriteMat.userData.baseOpacity = (0.2 + 0.55 * mag) * tankOpen;
    primaryCoilMat.emissiveIntensity = 0.4 + 1.4 * mag;
    secL1Mat.emissiveIntensity = 0.4 + 1.5 * Math.max(0, ac.sinPhi) + 0.4 * mag;
    secL2Mat.emissiveIntensity = 0.4 + 1.5 * Math.max(0, -ac.sinPhi) + 0.4 * mag;

    // 3. House exterior siding dissolve
    sidingMat.userData.baseOpacity = 0.92 - tl.sidingDissolve * 0.85;

    // 4. Breaker panel door & split-phase busbars + Living Room 20A Breaker ON/OFF state
    doorPivot.rotation.y = -tl.panelDoorAngle * 1.28;
    busL1Mat.emissiveIntensity = 0.65 + 1.65 * Math.max(0, ac.sinPhi) + 0.35 * mag;
    busL2Mat.emissiveIntensity = 0.65 + 1.65 * Math.max(0, -ac.sinPhi) + 0.35 * mag;

    const branchLive = tl.breakerOn ? 1 : 0;
    if (tl.breakerOn) {
      heroBreakerMat.color.setHex(0x0ea5e9);
      heroBreakerMat.emissive.setHex(0x38bdf8);
      heroBreakerMat.emissiveIntensity = 1.25;
      heroBreakerHandle.position.x = -0.17;
    } else {
      heroBreakerMat.color.setHex(0x334155);
      heroBreakerMat.emissive.setHex(0xef4444);
      heroBreakerMat.emissiveIntensity = 0.85;
      heroBreakerHandle.position.x = -0.21;
    }

    // Parallel 12/2 Romex cable growth from Outlet #1 to Outlet #2
    const pReveal = tl.parallelCableReveal;
    parallelGroup.visible = pReveal > 0.01;
    if (parallelGroup.visible) {
      for (const item of parallelGeos) {
        item.geo.setDrawRange(0, Math.floor(item.total * pReveal));
      }
    }
    outlet2EdgesMat.userData.baseOpacity = tl.t >= 14.5 ? 0.85 : 0.25;

    // 5. Wall switch paddle flip + contact spark + filament ignition (gated by breakerOn!)
    const sw = tl.switchOn;
    const effSw = sw * branchLive;
    rockerPivot.rotation.x = THREE.MathUtils.lerp(0.32, -0.32, sw);

    // Brief spark right around t = 11.2s -> 11.48s
    const dtSpark = tl.t - 11.2;
    const sparkAlpha = dtSpark >= 0 && dtSpark < 0.32 ? Math.sin((dtSpark / 0.32) * Math.PI) : 0;
    switchSparkMat.userData.baseOpacity = sparkAlpha * 0.95;

    hotCoreMat.emissiveIntensity = branchLive ? (0.45 + 0.85 * mag) : 0.03;
    hotSwitchedMat.emissiveIntensity = 0.04 + effSw * (0.65 + 0.95 * mag);
    neutralCoreMat.emissiveIntensity = 0.04 + effSw * (0.35 + 0.65 * mag);
    heroCopperTerm.material.emissiveIntensity = 0.1 + effSw * 0.85;

    // Edison lamp filament + warm point light (dims to dark when breaker is OFF!)
    filamentMat.emissiveIntensity = effSw * (2.6 + 0.35 * ac.poyntingMag);
    bulbGlowMat.userData.baseOpacity = effSw * (0.62 + 0.1 * ac.poyntingMag);
    lampLight.intensity = effSw * 5.8;

    // Electric meter spinning indicator when load is drawing power
    meterRing.rotation.x += effSw * 0.04;
    meterRingMat.color.setHex(effSw > 0.5 ? 0x34d399 : 0x64748b);

    // 6. Drop wire wavelets (always oscillating along triplex)
    for (const item of dropBeads) {
      const u1 = (item.phase + elapsedSeconds * 0.25) % 1;
      const u2 = (item.phase + elapsedSeconds * 0.25 + 0.5) % 1;
      item.b1.position.copy(l1DropCurve.getPointAt(u1));
      item.b2.position.copy(l2DropCurve.getPointAt(u2));
      const s = 0.65 + 0.45 * mag;
      item.b1.scale.setScalar(s);
      item.b2.scale.setScalar(s);
    }

    // 7. Closed-loop house circuit pulses (flow only when switch closed AND breaker ON)
    for (const item of circuitBeads) {
      item.mesh.visible = effSw > 0.15;
      if (!item.mesh.visible) continue;
      const u = (item.phase + elapsedSeconds * 0.38) % 1;
      if (u < 0.58) {
        item.mesh.position.copy(segSwitchToOutlet.hotCurve.getPointAt(u / 0.58));
      } else {
        item.mesh.position.copy(lampCordCurve.getPointAt((u - 0.58) / 0.42));
      }
      const pulseScale = 0.55 + 0.65 * ac.poyntingMag;
      item.mesh.scale.setScalar(pulseScale);
    }
  }

  return {
    root,
    toWorld,
    setFade,
    update,
  };
}
