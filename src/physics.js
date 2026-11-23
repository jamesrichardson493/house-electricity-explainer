// Shared physical constants, AC phase model, logarithmic scale mapping, and 3D hotspot data.

export const REAL_AC_HZ = 60;
export const VISUAL_AC_HZ = 0.45; // Slow-motion visual frequency so 60 Hz polarity reversals are clear
export const TIMELINE_DURATION = 52.0;

// Shared pivot in Stage A architectural coordinates: existing outlet #1 copper terminal (meters)
export const STAGE_A_PIVOT = { x: 2.6, y: 1.15, z: 0.72 };

// Scale mapping: 10 m down to 0.36 nm (copper FCC lattice constant a = 0.361 nm)
export const SCALE_MAX_METERS = 10.0;
export const SCALE_MIN_METERS = 3.61e-10; // 0.361 nm

export function computeACState(acClockSeconds) {
  const phi = 2 * Math.PI * VISUAL_AC_HZ * acClockSeconds;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  return {
    phi,
    sinPhi,          // Normalized L1 voltage / E-field polarity [-1, +1]
    cosPhi,          // Derivative / velocity quadrature
    vL1: 120 * Math.SQRT2 * sinPhi,
    vL1RmsInstant: 120 * sinPhi,
    vL2RmsInstant: -120 * sinPhi,
    poyntingMag: sinPhi * sinPhi, // S = E x B always >= 0, peaks at 2x AC frequency
  };
}

/**
 * Maps timeline time t in [0, 52] to physical viewing scale in meters (logarithmic)
 * and a normalized [0, 1] needle position along the top-left scale bar.
 */
export function getScaleAtTime(t) {
  const anchors = [
    { t: 0.0, meters: 9.5, stageName: 'STREET HOOKUP' },
    { t: 4.5, meters: 2.8, stageName: 'POLE TRANSFORMER' },
    { t: 7.5, meters: 3.4, stageName: 'BREAKER PANEL' },
    { t: 10.5, meters: 2.4, stageName: 'WALL WIRING' },
    { t: 14.0, meters: 0.9, stageName: 'OUTLET & LAMP' },
    { t: 16.4, meters: 3.2, stageName: 'PARALLEL BRANCH' },
    { t: 19.2, meters: 0.14, stageName: 'OUTLET #1 (0 V)' },
    { t: 20.8, meters: 0.05, stageName: 'PARALLEL TAP (#1)' },
    { t: 27.4, meters: 0.09, stageName: 'PARALLEL RAILS' },
    { t: 29.2, meters: 0.045, stageName: 'WIRE OUTLET #2' },
    { t: 35.6, meters: 0.085, stageName: 'PARALLEL PROOF' },
    { t: 38.6, meters: 0.008, stageName: 'EM FIELD (mm)' },
    { t: 41.8, meters: 0.0025, stageName: 'COPPER SURFACE' },
    { t: 43.6, meters: 2.4e-9, stageName: 'COPPER LATTICE' },
    { t: 47.5, meters: 8.5e-10, stageName: 'ELECTRON SEA' },
    { t: 52.0, meters: 3.6e-10, stageName: 'ATOMIC SCALE' },
  ];

  const clamped = Math.max(0, Math.min(TIMELINE_DURATION, t));
  let a0 = anchors[0];
  let a1 = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (clamped >= anchors[i].t && clamped <= anchors[i + 1].t) {
      a0 = anchors[i];
      a1 = anchors[i + 1];
      break;
    }
  }

  const span = Math.max(1e-6, a1.t - a0.t);
  const alpha = Math.max(0, Math.min(1, (clamped - a0.t) / span));
  const smooth = alpha * alpha * (3 - 2 * alpha);

  const log0 = Math.log10(a0.meters);
  const log1 = Math.log10(a1.meters);
  const meters = Math.pow(10, log0 + (log1 - log0) * smooth);

  const logMax = Math.log10(SCALE_MAX_METERS);
  const logMin = Math.log10(SCALE_MIN_METERS);
  const norm = Math.max(0, Math.min(1, (logMax - Math.log10(meters)) / (logMax - logMin)));

  const stageName = smooth < 0.5 ? a0.stageName : a1.stageName;

  return {
    meters,
    norm,
    formatted: formatScale(meters),
    stageName,
  };
}

export function formatScale(meters) {
  if (meters >= 1.0) return `${meters.toFixed(1)} m`;
  if (meters >= 1e-2) return `${(meters * 100).toFixed(1)} cm`;
  if (meters >= 1e-3) return `${(meters * 1e3).toFixed(1)} mm`;
  if (meters >= 1e-6) return `${(meters * 1e6).toFixed(0)} µm`;
  if (meters >= 1e-9) return `${(meters * 1e9).toFixed(1)} nm`;
  return `${(meters * 1e9).toFixed(2)} nm`;
}

// Interactive 3D inspection hotspots (visible when paused or when Inspect mode is enabled)
export const HOTSPOTS = [
  {
    id: 'hs-primary',
    stage: 'A',
    chapters: [0],
    localPos: { x: -13.0, y: 9.2, z: 4.15 },
    label: '7,200 V Primary',
    badge: '7,200 V AC · HIGH VOLTAGE',
    accent: 'amber',
    title: 'Medium-Voltage Distribution Line',
    body: 'Power leaves substations at thousands of volts because Power = Voltage × Current. Higher voltage delivers the same power with far less current—shrinking resistive heat losses (I²R) in street cables.',
  },
  {
    id: 'hs-transformer',
    stage: 'A',
    chapters: [0],
    localPos: { x: -12.25, y: 7.55, z: 4.15 },
    label: 'Pole Transformer',
    badge: 'MAGNETIC INDUCTION',
    accent: 'cyan',
    title: 'Center-Tapped Split-Phase Transformer',
    body: 'No copper wires touch between the street coil and your house. Pulsing current in the primary coil builds an alternating magnetic flux in the iron core, inducing 240 V across the secondary coil—split in half at its grounded center tap into two 120 V legs.',
  },
  {
    id: 'hs-meter',
    stage: 'A',
    chapters: [1],
    localPos: { x: -5.1, y: 2.0, z: 1.25 },
    label: 'Electric Meter',
    badge: 'kWh ENERGY SENSOR',
    accent: 'emerald',
    title: 'Utility Revenue Meter',
    body: 'Measures total energy (kilowatt-hours) crossing into your home by continuously multiplying instantaneous voltage and current—tracking the net electromagnetic energy delivered through the service entrance.',
  },
  {
    id: 'hs-panel',
    stage: 'A',
    chapters: [1],
    localPos: { x: -4.25, y: 2.15, z: 0.95 },
    label: 'Split-Phase Panel',
    badge: 'L1 (+120V) & L2 (-120V)',
    accent: 'coral',
    title: 'Main Breaker Panel & Busbars',
    body: 'Two vertical hot busbars sit 180° out of phase. Single-pole breakers tap one leg + Neutral for 120 V outlets and lights; double-pole breakers bridge L1 and L2 for 240 V appliances like dryers and ovens.',
  },
  {
    id: 'hs-ground',
    stage: 'A',
    chapters: [1],
    localPos: { x: -5.25, y: 0.25, z: 1.45 },
    label: 'Earth Ground Rod',
    badge: '0 V SAFETY REFERENCE',
    accent: 'emerald',
    title: 'Copper Grounding Electrode',
    body: 'Driven 8 feet into the earth and bonded to Neutral only at the main panel. In normal operation Ground carries zero current; if a loose hot wire touches a metal chassis, it forces a surge that trips the breaker instantly.',
  },
  {
    id: 'hs-switch',
    stage: 'A',
    chapters: [2],
    localPos: { x: 0.55, y: 1.65, z: 0.88 },
    label: 'Wall Switch',
    badge: 'CIRCUIT GATE',
    accent: 'amber',
    title: 'Single-Pole Wall Switch',
    body: 'Interrupts only the Hot (black) conductor. Even with voltage waiting at the switch terminal, an open air gap blocks the electric field from reaching the bulb—until the copper contacts snap shut and close the loop.',
  },
  {
    id: 'hs-outlet',
    stage: 'A',
    chapters: [2],
    localPos: { x: 2.6, y: 1.15, z: 0.88 },
    label: 'NEMA 5-15 Outlet',
    badge: '120 V RMS · 60 Hz',
    accent: 'cyan',
    title: 'Duplex Receptacle & Romex 12/2',
    body: 'Narrow slot = Hot (120 V alternating potential relative to Earth). Wide slot = Neutral return back to the transformer center tap. U-shaped hole = bare copper Ground.',
  },
  {
    id: 'hs-lamp',
    stage: 'A',
    chapters: [2],
    localPos: { x: 3.9, y: 2.05, z: 1.2 },
    label: 'Edison Filament',
    badge: 'JOULE HEATING → PHOTONS',
    accent: 'amber',
    title: 'Tungsten Filament Lamp',
    body: 'Thin coiled tungsten has high electrical resistance. Oscillating electrons scatter fiercely off tungsten atoms, heating the filament to ~2,700 K so it radiates warm visible light.',
  },
  {
    id: 'hs-breaker-off',
    stage: 'A',
    chapters: [3],
    localPos: { x: -4.3, y: 1.9, z: 0.95 },
    label: '20A Breaker (OFF)',
    badge: 'LOCKOUT / 0 V SAFE',
    accent: 'emerald',
    title: 'Shut Off Branch Breaker Before Touching Wires',
    body: 'Rule #1 of US electrical work: flip the branch breaker (20 A requires 12 AWG copper; 15 A uses 14 AWG) OFF so the existing outlet is isolated at 0 V before tapping off it in parallel.',
  },
  {
    id: 'hs-parallel-run',
    stage: 'A',
    chapters: [3],
    localPos: { x: 3.85, y: 1.15, z: 0.85 },
    label: 'Parallel 12/2 Branch',
    badge: 'US NEC PARALLEL WIRING',
    accent: 'cyan',
    title: 'Running Off Existing Outlet #1 in Parallel',
    body: 'Instead of chaining wires in series, we branch Hot, Neutral, and Ground from Outlet #1 across to Box #2—giving both receptacles the full 120 V across identical parallel rails.',
  },
  {
    id: 'hs-ncvt',
    stage: 'W',
    chapters: [3],
    localPos: { x: -7.2, y: -1.0, z: 2.5 },
    label: 'Voltage Tester (0 V)',
    badge: 'NON-CONTACT VERIFY',
    accent: 'emerald',
    title: 'Verify Existing Outlet #1 Is Dead (0 V)',
    body: 'Before touching existing wires inside Outlet #1, sweep a Non-Contact Voltage Tester (NCVT) over the Black Hot screws and slots to confirm 0 V.',
  },
  {
    id: 'hs-brass-tab',
    stage: 'W',
    chapters: [4],
    localPos: { x: -3.1, y: -0.75, z: 0.4 },
    label: 'Brass Tab (120 V Rail)',
    badge: 'PARALLEL HOT BRIDGE',
    accent: 'amber',
    title: 'Intact Brass Break-Off Tab Links Hot Rail',
    body: 'The unbroken brass tab connects Outlet #1’s Upper (incoming) and Lower (outgoing) brass screws into one 120 V rail—passing full 120 V on to Outlet #2 in parallel.',
  },
  {
    id: 'hs-silver-tab',
    stage: 'W',
    chapters: [4],
    localPos: { x: -6.85, y: 0.95, z: 0.4 },
    label: 'Silver Tab (0 V Return)',
    badge: 'PARALLEL NEUTRAL BRIDGE',
    accent: 'cyan',
    title: 'Intact Silver Break-Off Tab Links Neutral Rail',
    body: 'The unbroken silver tab links incoming and outgoing Neutral screws so return current from both outlets flows independently back to the panel Neutral bus.',
  },
  {
    id: 'hs-ground-nut',
    stage: 'W',
    chapters: [4],
    localPos: { x: -6.5, y: -2.9, z: -1.6 },
    label: 'Ground Pigtail Nut',
    badge: 'NEC GROUND SPLICE',
    accent: 'emerald',
    title: 'Ground Pigtail Splice (One Wire Per Screw)',
    body: 'US code never puts two bare grounds under one green screw. Inside Box #1, incoming ground, outgoing ground, and a short pigtail twist inside a green wire nut so one single copper hook feeds Outlet #1’s green screw.',
  },
  {
    id: 'hs-parallel-jumper',
    stage: 'W',
    chapters: [4],
    localPos: { x: 0.0, y: -2.5, z: -0.5 },
    label: 'Parallel 12/2 Jumper',
    badge: 'SAME 120 V · I = I₁ + I₂',
    accent: 'amber',
    title: 'What "Parallel" Means in House Wiring',
    body: 'Think of Hot (120 V) and Neutral (0 V) as two ladder rails. Each outlet is a separate rung bridging both rails—so every outlet gets full 120 V, draws its own current (I_total = I₁ + I₂), and stays on even if another outlet is unplugged.',
  },
  {
    id: 'hs-green-screw',
    stage: 'W',
    chapters: [5],
    localPos: { x: 3.0, y: -2.85, z: -0.3 },
    label: 'Green Ground Screw',
    badge: 'BARE / GREEN → GROUND',
    accent: 'emerald',
    title: 'Ground First — Bare Copper to Green Screw',
    body: 'Connect the bare copper ground wire first with a clockwise shepherd’s hook. It bonds Outlet #2’s frame back through Box #1’s ground pigtail to Earth.',
  },
  {
    id: 'hs-silver-screw',
    stage: 'W',
    chapters: [5],
    localPos: { x: 3.0, y: 1.4, z: 0.2 },
    label: 'Silver Screw (White)',
    badge: 'WHITE → SILVER · WIDE SLOT',
    accent: 'cyan',
    title: 'White to Silver — Wide Slot Side',
    body: 'Wrap the white Neutral wire clockwise around the Silver screw on the wide-slot side of Outlet #2. Neutral completes the parallel return rail back to the breaker panel.',
  },
  {
    id: 'hs-brass-screw',
    stage: 'W',
    chapters: [5],
    localPos: { x: 7.3, y: 1.4, z: 0.2 },
    label: 'Brass Screw (Black)',
    badge: 'BLACK → BRASS · NARROW SLOT',
    accent: 'amber',
    title: 'Black to Brass — Narrow Slot Side',
    body: 'Wrap the black Hot wire clockwise around the Brass screw on the narrow-slot side so clockwise screw rotation draws the copper J-hook tighter.',
  },
  {
    id: 'hs-plug',
    stage: 'W',
    chapters: [5],
    localPos: { x: 5.6, y: -0.85, z: 3.1 },
    label: '3-Prong Plug #2',
    badge: 'NEMA 5-15P · GROUND FIRST',
    accent: 'emerald',
    title: 'Longer Ground Pin Connects First',
    body: 'On any US 3-prong plug, the round Ground prong is longer than the Neutral (wide) and Hot (narrow) blades so chassis grounding completes before 120 V connects.',
  },
  {
    id: 'hs-plug1',
    stage: 'W',
    chapters: [5],
    localPos: { x: -5.2, y: -0.85, z: 3.1 },
    label: 'Independent Load #1',
    badge: 'UNPLUG #1 → #2 STAYS 120 V',
    accent: 'cyan',
    title: 'Why Parallel Loads Are Independent',
    body: 'Because Outlet #1 and Outlet #2 sit on separate rungs across the Hot and Neutral rails, unplugging Plug #1 drops I₁ to zero while Plug #2 keeps receiving full 120 V.',
  },
  {
    id: 'hs-efield',
    stage: 'B',
    chapters: [6],
    localPos: { x: -2.6, y: -2.3, z: 0.8 },
    label: 'E-Field (Hot ↔ Neutral)',
    badge: 'ELECTRIC POTENTIAL GRADIENT',
    accent: 'cyan',
    title: 'Alternating Electric Field (E)',
    body: 'The voltage difference between Hot and Neutral creates an electric field stretching across the insulation and air between both wires. This field propagates along the wire at ~70–95% of light speed.',
  },
  {
    id: 'hs-poynting',
    stage: 'B',
    chapters: [6],
    localPos: { x: 2.6, y: 0.85, z: 1.4 },
    label: 'Poynting Flux S = E × B',
    badge: 'ONE-WAY ENERGY FLOW',
    accent: 'amber',
    title: 'Energy Travels Outside the Copper',
    body: 'Because S = E × B, when AC reverses both E and B flip together—so (-E) × (-B) still points forward toward the load! Copper guides the fields; the surrounding space carries the energy.',
  },
  {
    id: 'hs-lattice',
    stage: 'C',
    chapters: [7, 8],
    localPos: { x: -2.5, y: 2.2, z: 1.6 },
    label: 'Cu⁺ Crystal Lattice',
    badge: 'FCC LATTICE · a = 0.361 nm',
    accent: 'amber',
    title: 'Copper Ion Cores & 4s¹ Electron Sea',
    body: 'Each copper atom donates one outer electron into a shared quantum electron sea. Under 120 V AC, electrons jiggle thermally at ~1,500 km/s in random directions while drifting coherently back and forth by less than a micron!',
  },
  {
    id: 'hs-scatter',
    stage: 'C',
    chapters: [8],
    localPos: { x: 1.4, y: -0.6, z: 1.9 },
    label: 'Lattice Scattering',
    badge: 'RESISTANCE & HEAT',
    accent: 'coral',
    title: 'Electron–Ion Collisions',
    body: 'When accelerated electrons scatter off vibrating metal ions (phonons), they transfer kinetic energy from the electromagnetic field into lattice vibrations—producing heat in wires and incandescent light in bulb filaments.',
  },
];
