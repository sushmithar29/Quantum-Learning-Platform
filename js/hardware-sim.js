/* ============================================================
   QUANTUMLAB — 3D QUANTUM HARDWARE SIMULATION ENGINE
   hardware-sim.js

   High-Fidelity 3D Interactive Replication of the IBM
   Superconducting Quantum Computer ("The Chandelier")
   Dilution Refrigerator and Transmon Qubit Signal Pipeline.

   Reference Video: "This Is How Quantum Computers Work" (IBM)
   ============================================================ */

'use strict';

/* ============================================================
   0. SIMULATION STAGES CONFIGURATION
   ============================================================ */
const SIM_STAGES = [
  {
    id: 'overview',
    name: 'System Overview',
    label: 'Overview',
    pct: 0,
    stepNum: '01',
    duration: 5000,
    tempK: 293,
    tempLabel: '293 K (Room Temp)',
    camPos: { x: 0, y: 0.5, z: 12 },
    camTarget: { x: 0, y: -0.4, z: 0 },
    shieldOpen: true,
    focusComp: null,
    explanation: 'A superconducting quantum computer consists of room-temperature control electronics connected through coaxial cables to a dilution refrigerator known as the "chandelier." It cools the qubit processor down to 15 millikelvin (-459.67°F) — colder than deep space — to eliminate thermal noise and preserve fragile quantum coherence.',
    phase: 'overview'
  },
  {
    id: 'control-gen',
    name: 'Microwave Signal Generation',
    label: 'Generate',
    pct: 13,
    stepNum: '02',
    duration: 4000,
    tempK: 293,
    tempLabel: '293 K (Room Temp)',
    camPos: { x: 0, y: 3.5, z: 7 },
    camTarget: { x: 0, y: 3.2, z: 0 },
    shieldOpen: true,
    focusComp: 'top-flange',
    explanation: 'At room temperature (~293 K), the host computer and Arbitrary Waveform Generator (AWG) synthesize precise analog microwave pulses in the 4–8 GHz range. These shaped microwave packets carry the quantum gate instructions down into the cryostat along coaxial input lines.',
    phase: 'generate'
  },
  {
    id: 'attenuation',
    name: 'Attenuation & Cryo-Stages',
    label: 'Attenuate',
    pct: 26,
    stepNum: '03',
    duration: 4500,
    tempK: 4,
    tempLabel: '4 K (Liquid Helium)',
    camPos: { x: 0, y: 1.0, z: 7.5 },
    camTarget: { x: 0, y: 0.8, z: 0 },
    shieldOpen: true,
    focusComp: 'stage-4k',
    explanation: 'Signals descend through progressive cooling stages: 50 K → 4 K → Still (~0.8 K) → Cold Plate (100 mK). Attenuators at each golden plate (totaling 60 dB) filter out thermal photons. Helical copper and silver coaxial coils provide thermal dissipation and vibration dampening.',
    phase: 'attenuate'
  },
  {
    id: 'qubit-init',
    name: '15 mK Qubit Initialization',
    label: 'Initialize',
    pct: 39,
    stepNum: '04',
    duration: 4000,
    tempK: 0.015,
    tempLabel: '15 mK (Mixing Chamber)',
    camPos: { x: 0, y: -3.4, z: 5.5 },
    camTarget: { x: 0, y: -3.6, z: 0 },
    shieldOpen: true,
    focusComp: 'qubit-package',
    explanation: 'At 15 millikelvin inside the mixing chamber, electrons in the aluminum/niobium transmon circuits pair into superconducting Cooper pairs, flowing with zero electrical resistance. Each qubit is initialized into its crystalline quantum ground state |0⟩.',
    phase: 'init',
    qubitStates: [{ theta: 0, phi: 0 }, { theta: 0, phi: 0 }, { theta: 0, phi: 0 }]
  },
  {
    id: 'gate-apply',
    name: 'Quantum Gate Pulse (Superposition)',
    label: 'Gate',
    pct: 52,
    stepNum: '05',
    duration: 4500,
    tempK: 0.015,
    tempLabel: '15 mK (Quantum Operation)',
    camPos: { x: 0, y: -3.4, z: 4.8 },
    camTarget: { x: 0, y: -3.6, z: 0 },
    shieldOpen: true,
    focusComp: 'qubit-chip',
    explanation: 'The filtered microwave pulse arrives at the qubit chip, driving a resonant Rabi oscillation between energy levels |0⟩ and |1⟩. A Hadamard pulse places the transmon qubit into an equal superposition: |ψ⟩ = (|0⟩ + |1⟩)/√2, visualized as the Bloch vector rotating to the equator.',
    phase: 'gate',
    qubitStates: [{ theta: Math.PI / 2, phi: 0 }, { theta: Math.PI / 2, phi: Math.PI / 4 }, { theta: 0, phi: 0 }]
  },
  {
    id: 'entangle',
    name: 'Two-Qubit Entanglement (CNOT)',
    label: 'Entangle',
    pct: 65,
    stepNum: '06',
    duration: 4000,
    tempK: 0.015,
    tempLabel: '15 mK (Bell State)',
    camPos: { x: 0, y: -3.4, z: 4.5 },
    camTarget: { x: 0, y: -3.6, z: 0 },
    shieldOpen: true,
    focusComp: 'qubit-chip',
    explanation: 'A cross-resonance microwave tone activates the tunable capacitive coupler between Q₀ and Q₁, implementing a CNOT gate. The qubits become quantum mechanically entangled in a Bell state: (|00⟩ + |11⟩)/√2 — their states are now unified.',
    phase: 'entangle',
    qubitStates: [{ theta: Math.PI / 2, phi: 0 }, { theta: Math.PI / 2, phi: Math.PI }, { theta: 0, phi: 0 }]
  },
  {
    id: 'readout',
    name: 'Dispersive Readout & JPA',
    label: 'Readout',
    pct: 78,
    stepNum: '07',
    duration: 4000,
    tempK: 0.015,
    tempLabel: '15 mK (Readout Signal)',
    camPos: { x: 0, y: -2.4, z: 6 },
    camTarget: { x: 0, y: -2.6, z: 0 },
    shieldOpen: true,
    focusComp: 'stage-mixing',
    explanation: 'To measure without destroying the quantum circuit, a weak microwave readout tone interrogates the coplanar waveguide resonator coupled to each qubit. The reflected tone shifts in phase based on the qubit state. A Josephson Parametric Amplifier (JPA) amplifies this sub-photon signal at quantum-limited noise levels.',
    phase: 'readout'
  },
  {
    id: 'measurement',
    name: 'HEMT Amplification & Collapse',
    label: 'Measure',
    pct: 90,
    stepNum: '08',
    duration: 3800,
    tempK: 4,
    tempLabel: '4 K (HEMT Stage)',
    camPos: { x: 0, y: 1.0, z: 7.2 },
    camTarget: { x: 0, y: 0.9, z: 0 },
    shieldOpen: true,
    focusComp: 'stage-4k',
    explanation: 'The pre-amplified signal ascends the output line to High Electron Mobility Transistor (HEMT) amplifiers at the 4 K plate (+35 dB gain). The quantum superposition collapses into a definite classical state (|0⟩ or |1⟩) during projective measurement.',
    phase: 'measure',
    qubitStates: [{ theta: 0, phi: 0 }, { theta: 0, phi: 0 }, { theta: 0, phi: 0 }]
  },
  {
    id: 'result',
    name: 'Room-Temp Digitizer & Result',
    label: 'Result',
    pct: 100,
    stepNum: '09',
    duration: 3500,
    tempK: 293,
    tempLabel: '293 K (Host Output)',
    camPos: { x: 0, y: 0.5, z: 12 },
    camTarget: { x: 0, y: -0.4, z: 0 },
    shieldOpen: true,
    focusComp: null,
    explanation: 'Back at room temperature, high-speed analog-to-digital digitizers demodulate the IQ signal into classical binary bits. Thousands of shots are collected and histogrammed, confirming the quantum algorithm calculation with high fidelity (>99%).',
    phase: 'result'
  }
];

/* ============================================================
   1. GLOBAL SIMULATION STATE
   ============================================================ */
const simState = {
  currentStage: 0,
  progress: 0,            // 0–1 in current stage
  totalProgress: 0,       // 0–1 overall
  isPlaying: false,
  isPaused: false,
  mode: 'guided',         // 'guided' | 'explore'
  autoRotate: true,
  shieldOpen: true,
  shieldTargetY: 6.2,     // Target position for open shield
  shieldCurrentY: 6.2,
  lastTimestamp: null,
  stageStartTime: null,

  // Physics parameters from UI
  signalFreqGHz: 5.0,
  signalAmp: 0.7,
  gateType: 'H',
  attenuationDB: 60,

  // Bloch sphere states for 3 qubits
  qubits: [
    { theta: 0, phi: 0, targetTheta: 0, targetPhi: 0, label: 'Q₀' },
    { theta: 0, phi: 0, targetTheta: 0, targetPhi: 0, label: 'Q₁' },
    { theta: 0, phi: 0, targetTheta: 0, targetPhi: 0, label: 'Q₂' }
  ],

  // Active interaction highlights
  hoveredComponent: null,
  clickedComponent: null
};

/* ============================================================
   2. THREE.JS 3D CHANDELIER SCENE INITIALIZATION
   ============================================================ */
let scene, camera, renderer, controls;
let chandelierGroup, shieldGroup, pulseGroup, qubitChipMesh, qubitCrosses = [];
let cableSplines = [], signalPulses = [];
let raycaster, mouse;
let interactiveMeshes = [];
let targetCamPos = new THREE.Vector3(0, 0.5, 12);
let targetCamLook = new THREE.Vector3(0, -0.4, 0);

const canvas = document.getElementById('hw-main-canvas');
const canvasWrap = document.getElementById('hw-canvas-wrap');

function init3DScene() {
  if (!canvas) return;

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020510, 0.022);

  // Camera
  const aspect = canvasWrap.clientWidth / Math.max(canvasWrap.clientHeight, 1);
  camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
  camera.position.set(0, 0.5, 12);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight);
  if (renderer.toneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
  }

  // OrbitControls
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.minDistance = 2.0;
    controls.maxDistance = 22.0;
    controls.target.set(0, -0.4, 0);
  }

  // Lighting
  setupLighting();

  // Raycaster & Mouse
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-999, -999);

  // Build the Chandelier Model
  buildChandelierModel();

  // Build the Outer Cryostat Vacuum Shield
  buildCryostatShield();

  // Build Signal Pulses
  buildSignalPulses();

  // Create Callout Overlay DOM Elements
  initCalloutTags();

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  canvas.addEventListener('mousemove', onCanvasMouseMove);
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('mouseleave', () => {
    mouse.set(-999, -999);
    hideTooltip();
  });
}

/* ============================================================
   3. LIGHTING RIG
   ============================================================ */
function setupLighting() {
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0x28334e, 1.2);
  scene.add(ambientLight);

  // Key Light (Warm Gold Highlights)
  const keyLight = new THREE.DirectionalLight(0xfff3d4, 2.4);
  keyLight.position.set(7, 9, 8);
  scene.add(keyLight);

  // Fill Light (Cool Cyan Quantum Glow)
  const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
  fillLight.position.set(-8, 3, 6);
  scene.add(fillLight);

  // Rim Light (Backlight for metallic silhouette)
  const rimLight = new THREE.DirectionalLight(0xa855f7, 2.0);
  rimLight.position.set(0, -6, -9);
  scene.add(rimLight);

  // Point Light at Mixing Chamber (15 mK focus glow)
  const mixingPointLight = new THREE.PointLight(0x06b6d4, 2.0, 7);
  mixingPointLight.position.set(0, -3.2, 1.2);
  scene.add(mixingPointLight);
}

/* ============================================================
   4. CHANDELIER PROCEDURAL 3D GEOMETRY & MATERIALS
   ============================================================ */
// PBR Materials
let matGold, matGoldBright, matSilver, matCopper, matDarkMetal, matQubitChip, matEmitterPulse;

function setupMaterials() {
  matGold = new THREE.MeshStandardMaterial({
    color: 0xe5b642,
    metalness: 0.94,
    roughness: 0.18,
    envMapIntensity: 1.2
  });

  matGoldBright = new THREE.MeshStandardMaterial({
    color: 0xffd95a,
    metalness: 0.96,
    roughness: 0.12,
    envMapIntensity: 1.5
  });

  matSilver = new THREE.MeshStandardMaterial({
    color: 0xdde6ed,
    metalness: 0.92,
    roughness: 0.22
  });

  matCopper = new THREE.MeshStandardMaterial({
    color: 0xdd7d3b,
    metalness: 0.90,
    roughness: 0.28
  });

  matDarkMetal = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.35
  });

  matQubitChip = new THREE.MeshStandardMaterial({
    color: 0x090e1c,
    metalness: 0.88,
    roughness: 0.12
  });

  matEmitterPulse = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.95
  });
}

function buildChandelierModel() {
  setupMaterials();

  chandelierGroup = new THREE.Group();
  chandelierGroup.name = 'chandelier';
  scene.add(chandelierGroup);

  // Central Vertical Stainless-Steel Column
  const centralAxisGeo = new THREE.CylinderGeometry(0.12, 0.12, 7.4, 32);
  const centralAxisMesh = new THREE.Mesh(centralAxisGeo, matSilver);
  centralAxisMesh.position.y = 0;
  chandelierGroup.add(centralAxisMesh);

  // 1. TOP VACUUM FLANGE (Room Temp 293 K / 300 K Boundary)
  const topFlangeGroup = createTopFlange();
  topFlangeGroup.position.y = 3.6;
  chandelierGroup.add(topFlangeGroup);
  registerInteractive(topFlangeGroup, {
    id: 'top-flange',
    name: 'Top Vacuum Flange & Feedthroughs',
    purpose: 'Hermetic room-temperature (293 K) vacuum seal with SMA coaxial feedthrough ports connecting host control electronics to cryostat lines.',
    input: 'Digital microwave pulses from AWG & IQ Mixers (4–8 GHz)',
    output: 'Signal entering high-vacuum cryostat',
    temp: '293 K (Room Temperature)',
    desc: 'The structural interface between atmospheric room temperature and ultra-high vacuum inside the cryostat canister.'
  });

  // 2. 50 K THERMAL SHIELD STAGE
  const stage50K = createPlateStage(1.9, 0.11, 4, 0.045, 1.15, '50k');
  stage50K.position.y = 2.45;
  chandelierGroup.add(stage50K);
  registerInteractive(stage50K, {
    id: 'stage-50k',
    name: '50 K Shield Stage',
    purpose: 'First active cryogenic cooling boundary absorbing room-temperature thermal blackbody radiation.',
    input: 'Thermal radiation from 293 K boundary',
    output: 'Cooled thermal shield intercept at 50 K',
    temp: '50 K (-369.67°F)',
    desc: 'Cooled by the first stage of the pulse tube cryocooler to reduce radiative heat load on colder lower plates.'
  });

  // 3. 4 K STAGE (Liquid Helium Temperature)
  const stage4K = create4KStage();
  stage4K.position.y = 1.1;
  chandelierGroup.add(stage4K);
  registerInteractive(stage4K, {
    id: 'stage-4k',
    name: '4 K Stage & HEMT Amplifiers',
    purpose: 'Liquid helium cooling plate hosting first-tier microwave attenuators (-20 dB) and HEMT low-noise readout amplifiers.',
    input: 'Attenuated microwave control signals & returned qubit readout',
    output: 'Pre-amplified microwave readout signal (+35 dB gain)',
    temp: '4 K (-452.47°F)',
    desc: 'Provides the cryogenic base for pulse tube cooling and houses power splitters and High Electron Mobility Transistor (HEMT) amplifiers.'
  });

  // 4. STILL STAGE (~0.8 K) with Central Helical Heat Exchanger
  const stageStill = createStillStage();
  stageStill.position.y = -0.2;
  chandelierGroup.add(stageStill);
  registerInteractive(stageStill, {
    id: 'stage-still',
    name: 'Still Stage (~0.8 K) & Heat Exchanger',
    purpose: 'Evaporative cooling plate for Helium-3 distillation in the closed-cycle dilution refrigerator.',
    input: 'Circulating Helium-3/Helium-4 refrigerant mixture',
    output: 'Evaporated He-3 vapor pumped back to room temp compressors',
    temp: '0.8 K (800 mK)',
    desc: 'The still stage evaporates He-3 from the dilute phase, driving continuous thermodynamic cooling through heat exchanger coils.'
  });

  // 5. COLD PLATE STAGE (100 mK)
  const stageCold = createColdPlateStage();
  stageCold.position.y = -1.45;
  chandelierGroup.add(stageCold);
  registerInteractive(stageCold, {
    id: 'stage-cold',
    name: 'Cold Plate (100 mK)',
    purpose: 'Intermediate thermal anchor with cascaded microwave attenuators (-20 dB) and directional couplers.',
    input: 'Microwave control pulses',
    output: 'Further filtered sub-thermal noise microwave signals',
    temp: '100 mK (0.10 K)',
    desc: 'Intermediate sub-Kelvin stage ensuring thermal photons are progressively removed before reaching the mixing chamber.'
  });

  // 6. MIXING CHAMBER STAGE (15 mK)
  const stageMixing = createMixingChamberStage();
  stageMixing.position.y = -2.6;
  chandelierGroup.add(stageMixing);
  registerInteractive(stageMixing, {
    id: 'stage-mixing',
    name: 'Mixing Chamber (15 mK) & JPA',
    purpose: 'The ultimate coldest stage of the dilution refrigerator where He-3 diffuses across phase boundaries, cooling qubits to 15 mK.',
    input: 'Diluted He-3/He-4 phase boundary transition & weak readout tones',
    output: 'Quantum-limited amplified readout from Josephson Parametric Amplifier',
    temp: '15 mK (-459.67°F)',
    desc: 'Colder than outer space (2.7 K). Houses the Josephson Parametric Amplifier (JPA) providing quantum-limited pre-amplification.'
  });

  // 7. QUBIT PROCESSOR CANISTER & TRANSMON CHIP
  const qubitPackage = createQubitPackage();
  qubitPackage.position.y = -3.55;
  chandelierGroup.add(qubitPackage);
  registerInteractive(qubitPackage, {
    id: 'qubit-package',
    name: 'Superconducting Transmon Qubit Processor',
    purpose: 'Shielded cryogenic package housing the 3-qubit superconducting quantum processor chip with Josephson junction transmons and readout resonators.',
    input: 'Resonant microwave gate pulses (4–8 GHz)',
    output: 'Dispersive phase-shifted readout response',
    temp: '15 mK (Superconducting State)',
    desc: 'The quantum processor: superconducting aluminum circuits on silicon/sapphire. Cooper pairs form quantum states |0⟩, |1⟩, and superposition.'
  });

  // 8. 3D HELICAL COAXIAL CABLE HARNESSES
  createHelicalCoaxialCables();
}

/* --- Subcomponent Builders --- */

function createTopFlange() {
  const group = new THREE.Group();

  // Outer vacuum collar ring (silver steel with bevel)
  const collarGeo = new THREE.CylinderGeometry(2.25, 2.25, 0.22, 48);
  const collar = new THREE.Mesh(collarGeo, matSilver);
  group.add(collar);

  // Gold ceiling plate
  const plateGeo = new THREE.CylinderGeometry(2.05, 2.05, 0.12, 48);
  const plate = new THREE.Mesh(plateGeo, matGold);
  plate.position.y = -0.12;
  group.add(plate);

  // Perimeter bolt studs (16 silver cylinders around flange)
  const boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 12);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const bolt = new THREE.Mesh(boltGeo, matSilver);
    bolt.position.set(Math.cos(angle) * 2.15, 0.12, Math.sin(angle) * 2.15);
    group.add(bolt);
  }

  // Brass cable feedthrough ports
  const portGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.25, 16);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + 0.2;
    const port = new THREE.Mesh(portGeo, matCopper);
    port.position.set(Math.cos(angle) * 1.4, 0.14, Math.sin(angle) * 1.4);
    group.add(port);
  }

  return group;
}

function createPlateStage(radius, thickness, rodCount, rodRadius, rodHeight, type) {
  const group = new THREE.Group();

  // Circular Gold Stage Disc
  const discGeo = new THREE.CylinderGeometry(radius, radius, thickness, 48);
  const disc = new THREE.Mesh(discGeo, matGold);
  group.add(disc);

  // Structural Support Rods (Silver posts ascending from this plate)
  const rodGeo = new THREE.CylinderGeometry(rodRadius, rodRadius, rodHeight, 16);
  const rodDist = radius * 0.82;
  for (let i = 0; i < rodCount; i++) {
    const angle = (i / rodCount) * Math.PI * 2;
    const rod = new THREE.Mesh(rodGeo, matSilver);
    rod.position.set(Math.cos(angle) * rodDist, rodHeight / 2 + thickness / 2, Math.sin(angle) * rodDist);
    group.add(rod);

    // Gold collar mounts at the top and bottom of each rod
    const collarGeo = new THREE.CylinderGeometry(rodRadius * 1.6, rodRadius * 1.6, 0.08, 16);
    const bottomCollar = new THREE.Mesh(collarGeo, matGold);
    bottomCollar.position.copy(rod.position);
    bottomCollar.position.y = thickness / 2 + 0.04;
    group.add(bottomCollar);
  }

  return group;
}

function create4KStage() {
  const group = createPlateStage(1.8, 0.1, 4, 0.042, 1.35, '4k');

  // Add mounted components on 4K plate: Power Splitters and HEMT Amplifier Blocks
  const boxGeo = new THREE.BoxGeometry(0.24, 0.18, 0.35);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const hemt = new THREE.Mesh(boxGeo, matGoldBright);
    hemt.position.set(Math.cos(angle) * 1.25, 0.12, Math.sin(angle) * 1.25);
    hemt.rotation.y = angle;
    group.add(hemt);

    // Coaxial connector ports on HEMT
    const connGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 12);
    connGeo.rotateZ(Math.PI / 2);
    const conn = new THREE.Mesh(connGeo, matSilver);
    conn.position.copy(hemt.position);
    conn.position.y += 0.05;
    group.add(conn);
  }

  // Cylindrical Attenuators (-20 dB)
  const attenGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.22, 16);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.15;
    const atten = new THREE.Mesh(attenGeo, matDarkMetal);
    atten.position.set(Math.cos(angle) * 0.75, 0.13, Math.sin(angle) * 0.75);
    group.add(atten);
  }

  return group;
}

function createStillStage() {
  const group = createPlateStage(1.65, 0.09, 4, 0.038, 1.3, 'still');

  // Helical Heat Exchanger Coils surrounding central axis
  const coilGeo = new THREE.TorusGeometry(0.28, 0.035, 12, 32);
  coilGeo.rotateX(Math.PI / 2);
  for (let j = 0; j < 7; j++) {
    const coil = new THREE.Mesh(coilGeo, matSilver);
    coil.position.y = 0.25 + j * 0.12;
    group.add(coil);
  }

  // Capillary cooling loops
  const capGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 12);
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const cap = new THREE.Mesh(capGeo, matCopper);
    cap.position.set(Math.cos(angle) * 0.5, 0.55, Math.sin(angle) * 0.5);
    group.add(cap);
  }

  return group;
}

function createColdPlateStage() {
  const group = createPlateStage(1.5, 0.09, 4, 0.035, 1.25, 'cold');

  // 100 mK Attenuator cylinders and directional couplers
  const attenGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.3;
    const atten = new THREE.Mesh(attenGeo, matDarkMetal);
    atten.position.set(Math.cos(angle) * 0.9, 0.12, Math.sin(angle) * 0.9);
    group.add(atten);
  }

  return group;
}

function createMixingChamberStage() {
  const group = createPlateStage(1.4, 0.12, 4, 0.035, 1.15, 'mixing');

  // JPA (Josephson Parametric Amplifier) Canister with Magnetic Shield
  const jpaCanGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.45, 24);
  const jpaCan = new THREE.Mesh(jpaCanGeo, matSilver);
  jpaCan.position.set(0.65, 0.25, 0.45);
  group.add(jpaCan);

  // Copper thermal anchor blocks & straps
  const blockGeo = new THREE.BoxGeometry(0.2, 0.12, 0.2);
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + 1.2;
    const block = new THREE.Mesh(blockGeo, matCopper);
    block.position.set(Math.cos(angle) * 0.85, 0.1, Math.sin(angle) * 0.85);
    group.add(block);
  }

  return group;
}

function createQubitPackage() {
  const group = new THREE.Group();

  // Golden cylindrical package shield (outer canister)
  const canGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.85, 32, 1, false, 0, Math.PI * 1.4);
  const can = new THREE.Mesh(canGeo, matGoldBright);
  group.add(can);

  // Golden bracket support rods connecting to Mixing Chamber
  const bracketGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.95, 12);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const rod = new THREE.Mesh(bracketGeo, matGold);
    rod.position.set(Math.cos(angle) * 0.5, 0.5, Math.sin(angle) * 0.5);
    group.add(rod);
  }

  // Inner Silicon/Sapphire Qubit Chip Substrate
  const chipGeo = new THREE.BoxGeometry(0.72, 0.04, 0.72);
  qubitChipMesh = new THREE.Mesh(chipGeo, matQubitChip);
  qubitChipMesh.position.y = 0;
  group.add(qubitChipMesh);

  // 3 Transmon Qubit Crosses (Q0, Q1, Q2) on chip surface
  qubitCrosses = [];
  const crossOffsets = [-0.22, 0, 0.22];

  for (let i = 0; i < 3; i++) {
    const crossGroup = new THREE.Group();
    crossGroup.position.set(crossOffsets[i], 0.03, 0);

    const barMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const hBarGeo = new THREE.BoxGeometry(0.12, 0.015, 0.035);
    const vBarGeo = new THREE.BoxGeometry(0.035, 0.015, 0.12);

    const hBar = new THREE.Mesh(hBarGeo, barMat);
    const vBar = new THREE.Mesh(vBarGeo, barMat);
    crossGroup.add(hBar);
    crossGroup.add(vBar);

    // Glowing quantum orbital halo ring around each qubit
    const ringGeo = new THREE.RingGeometry(0.07, 0.09, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    crossGroup.add(ring);

    group.add(crossGroup);
    qubitCrosses.push({ group: crossGroup, ring, hBar, vBar });
  }

  // Meandering Coplanar Waveguide Resonators on chip
  const resLineGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.6, 8);
  resLineGeo.rotateZ(Math.PI / 2);
  const resLine = new THREE.Mesh(resLineGeo, new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
  resLine.position.set(0, 0.035, 0.22);
  group.add(resLine);

  return group;
}

/* --- Helical 3D Coaxial Lines --- */
function createHelicalCoaxialCables() {
  cableSplines = [];

  const cableCount = 12;
  for (let i = 0; i < cableCount; i++) {
    const baseAngle = (i / cableCount) * Math.PI * 2;
    const isReadout = (i % 2 === 1);
    const cableMat = isReadout ? matSilver : matCopper;

    // Build Catmull-Rom spline with helical loops between plates
    const points = [];
    const stagesY = [3.6, 2.45, 1.1, -0.2, -1.45, -2.6, -3.5];
    const stagesR = [1.6, 1.45, 1.35, 1.2, 1.05, 0.9, 0.55];

    for (let s = 0; s < stagesY.length; s++) {
      const y = stagesY[s];
      const r = stagesR[s];
      // Helical twisting between plates (adding spiral twist)
      const twist = s * 0.35;
      const angle = baseAngle + twist;
      points.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));

      // Add a helical relief coil loop in the middle between stages
      if (s < stagesY.length - 1) {
        const midY = (stagesY[s] + stagesY[s + 1]) / 2;
        const midR = (stagesR[s] + stagesR[s + 1]) / 2 + 0.12;
        const loopAngle = angle + 0.25;
        points.push(new THREE.Vector3(Math.cos(loopAngle) * midR, midY, Math.sin(loopAngle) * midR));
      }
    }

    const curve = new THREE.CatmullRomCurve3(points);
    cableSplines.push(curve);

    // Tube mesh for the coaxial cable
    const tubeGeo = new THREE.TubeGeometry(curve, 72, 0.016, 8, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, cableMat);
    chandelierGroup.add(tubeMesh);
  }
}

/* ============================================================
   5. OUTER CRYOSTAT VACUUM SHIELD (CANISTER)
   ============================================================ */
function buildCryostatShield() {
  shieldGroup = new THREE.Group();
  shieldGroup.name = 'cryostat-shield';

  // White PBR Enclosure Material with subtle metallic sheen
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.45,
    roughness: 0.35,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide
  });

  // 3 Stacked Cylindrical Cans
  const canHeights = [1.6, 1.6, 1.8];
  const canRadii = [2.28, 2.22, 2.16];
  const canYs = [1.8, 0.2, -1.6];

  for (let c = 0; c < 3; c++) {
    const canGeo = new THREE.CylinderGeometry(canRadii[c], canRadii[c], canHeights[c], 48, 1, true);
    const can = new THREE.Mesh(canGeo, shieldMat);
    can.position.y = canYs[c];
    shieldGroup.add(can);

    // Flange lip rings between cans
    const lipGeo = new THREE.CylinderGeometry(canRadii[c] + 0.08, canRadii[c] + 0.08, 0.08, 48);
    const lip = new THREE.Mesh(lipGeo, matSilver);
    lip.position.y = canYs[c] + canHeights[c] / 2;
    shieldGroup.add(lip);

    // Vertical dark inspection window slits (matching reference video)
    const slitGeo = new THREE.BoxGeometry(0.08, 0.65, 0.1);
    for (let s = 0; s < 4; s++) {
      const angle = (s / 4) * Math.PI * 2;
      const slit = new THREE.Mesh(slitGeo, matDarkMetal);
      slit.position.set(Math.cos(angle) * canRadii[c], canYs[c], Math.sin(angle) * canRadii[c]);
      slit.rotation.y = angle;
      shieldGroup.add(slit);
    }
  }

  // Initial shield position: open (lifted up to reveal chandelier)
  shieldGroup.position.y = simState.shieldTargetY;
  scene.add(shieldGroup);
}

/* ============================================================
   6. ANIMATED 3D SIGNAL PULSES (WAVEPACKETS)
   ============================================================ */
function buildSignalPulses() {
  pulseGroup = new THREE.Group();
  scene.add(pulseGroup);

  signalPulses = [];
  const pulseCount = 14;

  const pulseGeo = new THREE.SphereGeometry(0.065, 16, 16);

  for (let i = 0; i < pulseCount; i++) {
    const isReadout = (i % 2 === 1);
    const pMat = new THREE.MeshBasicMaterial({
      color: isReadout ? 0xa855f7 : 0x06b6d4,
      transparent: true,
      opacity: 0.95
    });

    const mesh = new THREE.Mesh(pulseGeo, pMat);

    // Glowing halo mesh surrounding the pulse
    const haloGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const haloMat = new THREE.MeshBasicMaterial({
      color: isReadout ? 0xd946ef : 0x38bdf8,
      transparent: true,
      opacity: 0.35
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    mesh.add(halo);

    pulseGroup.add(mesh);

    signalPulses.push({
      mesh,
      halo,
      curveIndex: i % cableSplines.length,
      u: (i / pulseCount),    // position 0 to 1 along curve
      speed: 0.18 + (i % 3) * 0.04,
      direction: isReadout ? -1 : 1, // down or up
      isReadout,
      active: true
    });
  }
}

function updateSignalPulses(delta) {
  if (!cableSplines.length) return;

  const stage = SIM_STAGES[simState.currentStage];
  const isGenerating = stage.phase === 'generate' || stage.phase === 'attenuate';
  const isQubitOp = stage.phase === 'gate' || stage.phase === 'entangle';
  const isReadoutOp = stage.phase === 'readout' || stage.phase === 'measure';

  signalPulses.forEach((p, idx) => {
    const curve = cableSplines[p.curveIndex];
    if (!curve) return;

    // Advance pulse along its 3D cable curve
    if (simState.isPlaying) {
      p.u += p.direction * p.speed * delta;
      if (p.u > 1) p.u = 0;
      if (p.u < 0) p.u = 1;
    }

    const pos = curve.getPointAt(p.u);
    p.mesh.position.copy(pos);

    // Rotate with chandelier if it rotates
    p.mesh.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), chandelierGroup.rotation.y);

    // Color and scale dynamics (attenuation visual)
    const normalizedY = (pos.y + 3.5) / 7.1; // 1 at top, 0 at bottom
    if (!p.isReadout) {
      // Downward control signal: as it descends, temperature drops, noise decreases (pulse scales down)
      const scale = THREE.MathUtils.lerp(0.65, 1.25, normalizedY);
      p.mesh.scale.set(scale, scale, scale);

      // Color shifts: warm orange/gold at top -> cyan at cold plate -> intense blue at mixing chamber
      if (normalizedY > 0.7) {
        p.mesh.material.color.setHex(0xf59e0b); // 300 K
      } else if (normalizedY > 0.4) {
        p.mesh.material.color.setHex(0xeab308); // 4 K
      } else {
        p.mesh.material.color.setHex(0x06b6d4); // 15 mK
      }
    } else {
      // Upward readout signal: amplified at JPA (bottom) and HEMT (middle)
      const scale = THREE.MathUtils.lerp(1.4, 0.5, normalizedY);
      p.mesh.scale.set(scale, scale, scale);
      p.mesh.material.color.setHex(0xc084fc);
    }

    // Visibility based on simulation phase
    if (isGenerating && p.direction === 1) {
      p.mesh.visible = true;
    } else if (isReadoutOp && p.direction === -1) {
      p.mesh.visible = true;
    } else if (simState.mode === 'explore') {
      p.mesh.visible = true;
    } else {
      p.mesh.visible = true;
    }
  });

  // Animate Qubit Crosses glow & orbital halo
  if (qubitCrosses.length) {
    const pulseFactor = 0.5 + 0.5 * Math.sin(Date.now() * 0.006);
    qubitCrosses.forEach((q, i) => {
      const qState = simState.qubits[i];
      const isSuperpos = (qState.theta > 0.1 && qState.theta < Math.PI - 0.1);

      if (isQubitOp || isSuperpos) {
        q.hBar.material.color.setHex(0x00f0ff);
        q.vBar.material.color.setHex(0x00f0ff);
        q.ring.material.opacity = 0.4 + 0.5 * pulseFactor;
        q.ring.scale.set(1 + 0.15 * pulseFactor, 1 + 0.15 * pulseFactor, 1);
      } else {
        q.hBar.material.color.setHex(0x38bdf8);
        q.vBar.material.color.setHex(0x38bdf8);
        q.ring.material.opacity = 0.25;
        q.ring.scale.set(1, 1, 1);
      }
    });
  }
}

/* ============================================================
   7. INTERACTIVE 3D HOTSPOTS & CALLOUTS
   ============================================================ */
function registerInteractive(obj, meta) {
  obj.userData = meta;
  obj.traverse(child => {
    if (child.isMesh) {
      child.userData = meta;
      interactiveMeshes.push(child);
    }
  });
}

const CALLOUT_DATA = [
  { name: 'Room-Temp Electronics', sub: '293 K', pos: new THREE.Vector3(0, 3.8, 0), gold: false },
  { name: 'Input Microwave Lines', sub: 'Coaxial Helices', pos: new THREE.Vector3(1.7, 2.5, 0), gold: true },
  { name: '4 K Stage & HEMT', sub: 'Liquid Helium', pos: new THREE.Vector3(-1.8, 1.1, 0), gold: false },
  { name: 'Still Stage', sub: '0.8 K Heat Exchanger', pos: new THREE.Vector3(1.7, -0.2, 0), gold: false },
  { name: 'Cold Plate', sub: '100 mK Attenuation', pos: new THREE.Vector3(-1.6, -1.45, 0), gold: false },
  { name: 'Mixing Chamber', sub: '15 mK & JPA', pos: new THREE.Vector3(1.5, -2.6, 0), gold: true },
  { name: 'Qubit Processor', sub: 'Superconducting Transmons', pos: new THREE.Vector3(0, -3.7, 0), gold: true }
];

let calloutElements = [];

function initCalloutTags() {
  const container = document.getElementById('hw-callouts');
  if (!container) return;
  container.innerHTML = '';
  calloutElements = [];

  CALLOUT_DATA.forEach(d => {
    const el = document.createElement('div');
    el.className = `hw-callout-tag ${d.gold ? 'gold' : ''}`;
    el.innerHTML = `<span class="dot"></span><span>${d.name} <small style="opacity:0.6;font-weight:400">(${d.sub})</small></span>`;
    container.appendChild(el);
    calloutElements.push({ el, worldPos: d.pos });
  });
}

function updateCalloutPositions() {
  if (!calloutElements.length || !camera) return;

  const w = canvasWrap.clientWidth;
  const h = canvasWrap.clientHeight;
  const tempV = new THREE.Vector3();

  calloutElements.forEach(item => {
    tempV.copy(item.worldPos);
    tempV.applyAxisAngle(new THREE.Vector3(0, 1, 0), chandelierGroup.rotation.y);
    tempV.project(camera);

    // Only display if within front frustum
    if (tempV.z < 1) {
      const x = (tempV.x * 0.5 + 0.5) * w;
      const y = (-(tempV.y * 0.5) + 0.5) * h;
      item.el.style.left = `${x}px`;
      item.el.style.top = `${y}px`;
      item.el.style.display = 'inline-flex';
    } else {
      item.el.style.display = 'none';
    }
  });
}

/* ============================================================
   8. RAYCASTING, TOOLTIP & INFO PANEL
   ============================================================ */
function onCanvasMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveMeshes, false);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const meta = hit.userData;
    if (meta && meta.name) {
      canvas.style.cursor = 'pointer';
      showTooltip(e.clientX - rect.left, e.clientY - rect.top, meta);
      simState.hoveredComponent = meta;
      return;
    }
  }

  canvas.style.cursor = 'default';
  hideTooltip();
  simState.hoveredComponent = null;
}

function onCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveMeshes, false);

  if (intersects.length > 0) {
    const meta = intersects[0].object.userData;
    if (meta && meta.name) {
      openInfoPanel(meta);
    }
  }
}

function showTooltip(x, y, meta) {
  const tip = document.getElementById('hw-tooltip');
  if (!tip) return;
  document.getElementById('hw-tip-name').textContent = meta.name;
  document.getElementById('hw-tip-purpose').textContent = meta.temp || meta.purpose;
  tip.style.left = `${Math.min(x + 14, canvasWrap.clientWidth - 220)}px`;
  tip.style.top = `${Math.min(y + 14, canvasWrap.clientHeight - 90)}px`;
  tip.classList.add('hw-tooltip--visible');
}

function hideTooltip() {
  const tip = document.getElementById('hw-tooltip');
  if (tip) tip.classList.remove('hw-tooltip--visible');
}

function openInfoPanel(meta) {
  const panel = document.getElementById('hw-info-panel');
  if (!panel) return;

  document.getElementById('hw-info-name').textContent = meta.name;
  document.getElementById('hw-info-purpose').textContent = meta.purpose || '–';
  document.getElementById('hw-info-input').textContent = meta.input || '–';
  document.getElementById('hw-info-output').textContent = meta.output || '–';
  document.getElementById('hw-info-temp').textContent = meta.temp || '–';
  document.getElementById('hw-info-desc').textContent = meta.desc || '';

  panel.classList.add('hw-info-panel--visible');
}

function closeInfoPanel() {
  const panel = document.getElementById('hw-info-panel');
  if (panel) panel.classList.remove('hw-info-panel--visible');
}

/* ============================================================
   9. CAMERA INTERPOLATION & CONTROLS
   ============================================================ */
function setCameraView(pos, target, duration = 1200) {
  targetCamPos.copy(pos);
  targetCamLook.copy(target);
}

function updateCameraTransition(delta) {
  if (!camera || !controls) return;

  // Smooth lerp towards target
  camera.position.lerp(targetCamPos, 0.04);
  controls.target.lerp(targetCamLook, 0.04);
}

function onWindowResize() {
  if (!canvasWrap || !camera || !renderer) return;
  const w = canvasWrap.clientWidth;
  const h = canvasWrap.clientHeight;
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

/* ============================================================
   10. MAIN ANIMATION & RENDER LOOP
   ============================================================ */
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // 1. Auto-rotation (matches reference video)
  if (simState.autoRotate && chandelierGroup) {
    chandelierGroup.rotation.y += delta * 0.28;
  }

  // 2. Cryostat Shield animation (smooth slide up/down)
  if (shieldGroup) {
    simState.shieldTargetY = simState.shieldOpen ? 6.2 : 0.0;
    simState.shieldCurrentY = THREE.MathUtils.lerp(simState.shieldCurrentY, simState.shieldTargetY, 0.05);
    shieldGroup.position.y = simState.shieldCurrentY;
  }

  // 3. Update Camera Transition
  updateCameraTransition(delta);

  // 4. Update Controls
  if (controls) controls.update();

  // 5. Update 3D Microwave Signal Pulses
  updateSignalPulses(delta);

  // 6. Update 3D Callout Badges
  updateCalloutPositions();

  // 7. Update Active Simulation Stage Progress
  if (simState.isPlaying) {
    updateStageProgress(delta);
  }

  // 8. Render
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

/* ============================================================
   11. TIMELINE & STAGE PROGRESS LOGIC
   ============================================================ */
function updateStageProgress(delta) {
  const stage = SIM_STAGES[simState.currentStage];
  const stageDur = (stage.duration || 4000) / 1000;

  simState.progress += delta / stageDur;

  if (simState.progress >= 1) {
    simState.progress = 0;
    if (simState.currentStage < SIM_STAGES.length - 1) {
      goToStage(simState.currentStage + 1);
    } else {
      // Finished all stages
      simState.isPlaying = false;
      updatePlayButtonUI();
      showResultsPanel();
    }
  }

  // Sync timeline UI scrubber
  const totalStages = SIM_STAGES.length;
  simState.totalProgress = (simState.currentStage + simState.progress) / totalStages;

  const scrubber = document.getElementById('hw-scrubber');
  if (scrubber) scrubber.value = Math.round(simState.totalProgress * 1000);

  const progressFill = document.getElementById('hw-timeline-progress');
  if (progressFill) progressFill.style.width = `${simState.totalProgress * 100}%`;

  // Update Mini Bloch Spheres & Quantum State UI
  updateQubitStates(delta);
}

function goToStage(stageIdx) {
  if (stageIdx < 0 || stageIdx >= SIM_STAGES.length) return;
  simState.currentStage = stageIdx;
  simState.progress = 0;

  const stage = SIM_STAGES[stageIdx];

  // Update UI Elements
  document.getElementById('hw-step-num').textContent = `STEP ${stage.stepNum}`;
  document.getElementById('hw-step-title').textContent = stage.name;
  document.getElementById('hw-explain-text').textContent = stage.explanation;
  document.getElementById('hw-temp-val').textContent = stage.tempLabel;
  document.getElementById('hw-stage-name').textContent = stage.name;

  // Camera glide to emphasize the stage hardware
  if (stage.camPos && stage.camTarget) {
    setCameraView(stage.camPos, stage.camTarget);
  }

  // Update active stage pill in timeline
  document.querySelectorAll('.hw-stage-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === stageIdx);
    dot.classList.toggle('past', idx < stageIdx);
  });

  // State update on qubits
  if (stage.qubitStates) {
    stage.qubitStates.forEach((st, i) => {
      if (simState.qubits[i]) {
        simState.qubits[i].targetTheta = st.theta;
        simState.qubits[i].targetPhi = st.phi;
      }
    });
  }

  // If in result stage, reveal results
  if (stage.id === 'result') {
    showResultsPanel();
  } else {
    hideResultsPanel();
  }
}

function updateQubitStates(delta) {
  simState.qubits.forEach((q, i) => {
    // Lerp angles towards target
    q.theta = THREE.MathUtils.lerp(q.theta, q.targetTheta, 0.08);
    q.phi = THREE.MathUtils.lerp(q.phi, q.targetPhi, 0.08);

    // Compute measurement probabilities
    const prob0 = Math.cos(q.theta / 2) ** 2;
    const prob1 = Math.sin(q.theta / 2) ** 2;

    const stateEl = document.getElementById(`hw-qstate-${i}`);
    const probEl = document.getElementById(`hw-qprob-${i}`);

    if (stateEl && probEl) {
      if (q.theta < 0.1) {
        stateEl.textContent = '|0⟩';
        probEl.textContent = 'P(|0⟩)=100%';
      } else if (Math.abs(q.theta - Math.PI / 2) < 0.1) {
        stateEl.textContent = '|+⟩';
        probEl.textContent = `P(|0⟩)=50%  P(|1⟩)=50%`;
      } else if (q.theta > Math.PI - 0.1) {
        stateEl.textContent = '|1⟩';
        probEl.textContent = 'P(|1⟩)=100%';
      } else {
        stateEl.textContent = '|ψ⟩';
        probEl.textContent = `P(|0⟩)=${Math.round(prob0 * 100)}%`;
      }
    }

    // Draw 2D mini Bloch sphere on canvas
    drawMiniBlochCanvas(i, q.theta, q.phi);
  });
}

function drawMiniBlochCanvas(qubitIdx, theta, phi) {
  const container = document.getElementById(`hw-qbloch-${qubitIdx}`);
  if (!container) return;

  let blochCanvas = container.querySelector('canvas');
  if (!blochCanvas) {
    blochCanvas = document.createElement('canvas');
    blochCanvas.width = 64;
    blochCanvas.height = 64;
    container.appendChild(blochCanvas);
  }

  const ctx = blochCanvas.getContext('2d');
  const cx = 32, cy = 32, r = 26;

  ctx.clearRect(0, 0, 64, 64);

  // Outer sphere ring
  ctx.strokeStyle = 'rgba(124,58,237,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Equator ellipse
  ctx.strokeStyle = 'rgba(6,182,212,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Z-axis vertical
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();

  // State Vector Arrow (3D projection onto 2D)
  const vx = Math.sin(theta) * Math.sin(phi);
  const vy = Math.cos(theta); // up
  const vz = Math.sin(theta) * Math.cos(phi); // depth

  const px = cx + (vx * 0.9 + vz * 0.3) * r;
  const py = cy - vy * r;

  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(px, py);
  ctx.stroke();

  // Tip dot
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(px, py, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function showResultsPanel() {
  const res = document.getElementById('hw-results');
  if (res) res.style.display = 'block';

  // Apply gate type measurement outcomes
  const gType = simState.gateType;
  if (gType === 'X') {
    document.getElementById('hw-res-q0').textContent = '|1⟩';
    document.getElementById('hw-res-q1').textContent = '|0⟩';
  } else if (gType === 'CNOT') {
    document.getElementById('hw-res-q0').textContent = '|1⟩';
    document.getElementById('hw-res-q1').textContent = '|1⟩';
  } else {
    // Superposition collapse outcome
    document.getElementById('hw-res-q0').textContent = Math.random() > 0.5 ? '|0⟩' : '|1⟩';
    document.getElementById('hw-res-q1').textContent = Math.random() > 0.5 ? '|0⟩' : '|1⟩';
  }
}

function hideResultsPanel() {
  const res = document.getElementById('hw-results');
  if (res) res.style.display = 'none';
}

function updatePlayButtonUI() {
  const icon = document.getElementById('hw-play-icon');
  if (!icon) return;
  if (simState.isPlaying) {
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  } else {
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
  }
}

/* ============================================================
   12. USER CONTROLS, TOOLBAR & MODAL BINDINGS
   ============================================================ */
function initUIControls() {
  // Play / Pause
  document.getElementById('hw-play-btn')?.addEventListener('click', () => {
    simState.isPlaying = !simState.isPlaying;
    updatePlayButtonUI();
  });

  // Next / Prev Step
  document.getElementById('hw-next-btn')?.addEventListener('click', () => {
    if (simState.currentStage < SIM_STAGES.length - 1) {
      goToStage(simState.currentStage + 1);
    }
  });

  document.getElementById('hw-prev-btn')?.addEventListener('click', () => {
    if (simState.currentStage > 0) {
      goToStage(simState.currentStage - 1);
    }
  });

  // Restart / Replay
  const restart = () => {
    simState.isPlaying = true;
    goToStage(0);
    updatePlayButtonUI();
  };
  document.getElementById('hw-restart-btn')?.addEventListener('click', restart);
  document.getElementById('hw-replay-btn')?.addEventListener('click', restart);

  // Scrubber
  const scrubber = document.getElementById('hw-scrubber');
  if (scrubber) {
    scrubber.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10) / 1000;
      const targetStage = Math.min(Math.floor(val * SIM_STAGES.length), SIM_STAGES.length - 1);
      goToStage(targetStage);
    });
  }

  // 3D Viewport Toolbar: Camera Presets
  document.getElementById('btn-cam-overview')?.addEventListener('click', () => {
    setCameraView(new THREE.Vector3(0, 0.5, 12), new THREE.Vector3(0, -0.4, 0));
    setActiveToolbarBtn('btn-cam-overview');
  });

  document.getElementById('btn-cam-qubits')?.addEventListener('click', () => {
    setCameraView(new THREE.Vector3(0, -3.4, 4.6), new THREE.Vector3(0, -3.6, 0));
    setActiveToolbarBtn('btn-cam-qubits');
  });

  document.getElementById('btn-cam-4k')?.addEventListener('click', () => {
    setCameraView(new THREE.Vector3(0, 1.0, 7.2), new THREE.Vector3(0, 0.9, 0));
    setActiveToolbarBtn('btn-cam-4k');
  });

  // 3D Viewport Toolbar: Auto-Rotation Toggle
  const rotBtn = document.getElementById('btn-toggle-rotate');
  rotBtn?.addEventListener('click', () => {
    simState.autoRotate = !simState.autoRotate;
    rotBtn.classList.toggle('active', simState.autoRotate);
    document.getElementById('rotate-label').textContent = simState.autoRotate ? '360° Spin: ON' : '360° Spin: OFF';
  });

  // 3D Viewport Toolbar: Cryostat Vacuum Can Shield Toggle
  const shieldBtn = document.getElementById('btn-toggle-shield');
  shieldBtn?.addEventListener('click', () => {
    simState.shieldOpen = !simState.shieldOpen;
    document.getElementById('shield-label').textContent = simState.shieldOpen ? 'Shield: Open' : 'Shield: Closed';
  });

  // 3D Viewport Toolbar: Real Hardware Photo Comparison Modal
  const photoModal = document.getElementById('hw-photo-modal');
  document.getElementById('btn-compare-photo')?.addEventListener('click', () => {
    if (photoModal) photoModal.style.display = 'flex';
  });
  document.getElementById('hw-photo-close')?.addEventListener('click', () => {
    if (photoModal) photoModal.style.display = 'none';
  });
  document.getElementById('hw-photo-backdrop')?.addEventListener('click', () => {
    if (photoModal) photoModal.style.display = 'none';
  });

  // Close Info Panel Button
  document.getElementById('hw-info-close')?.addEventListener('click', closeInfoPanel);

  // Mode Switch (Guided vs Explore)
  const modeBtn = document.getElementById('hw-mode-btn');
  const modeLabel = document.getElementById('hw-mode-label');
  modeBtn?.addEventListener('click', () => {
    if (simState.mode === 'guided') {
      simState.mode = 'explore';
      if (modeLabel) modeLabel.textContent = 'Free Explore Mode';
      simState.isPlaying = false;
      updatePlayButtonUI();
    } else {
      simState.mode = 'guided';
      if (modeLabel) modeLabel.textContent = 'Guided Mode';
    }
  });

  // Parameters: Frequency, Amplitude, Gate Type, Attenuation
  const freqInput = document.getElementById('hw-signal-freq');
  freqInput?.addEventListener('input', e => {
    simState.signalFreqGHz = parseFloat(e.target.value);
    document.getElementById('hw-signal-freq-val').textContent = `${simState.signalFreqGHz.toFixed(1)} GHz`;
  });

  const ampInput = document.getElementById('hw-signal-amp');
  ampInput?.addEventListener('input', e => {
    simState.signalAmp = parseFloat(e.target.value);
    document.getElementById('hw-signal-amp-val').textContent = simState.signalAmp.toFixed(2);
  });

  const gateSelect = document.getElementById('hw-gate-type');
  gateSelect?.addEventListener('change', e => {
    simState.gateType = e.target.value;
  });

  const attenInput = document.getElementById('hw-atten');
  attenInput?.addEventListener('input', e => {
    simState.attenuationDB = parseInt(e.target.value, 10);
    document.getElementById('hw-atten-val').textContent = `${simState.attenuationDB} dB`;
  });

  // Fullscreen button
  document.getElementById('hw-fullscreen-btn')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Build timeline stage dots
  buildTimelineDots();
}

function setActiveToolbarBtn(btnId) {
  ['btn-cam-overview', 'btn-cam-qubits', 'btn-cam-4k'].forEach(id => {
    document.getElementById(id)?.classList.toggle('active', id === btnId);
  });
}

function buildTimelineDots() {
  const container = document.getElementById('hw-timeline-stages');
  if (!container) return;
  container.innerHTML = '';

  SIM_STAGES.forEach((stage, idx) => {
    const dot = document.createElement('div');
    dot.className = `hw-stage-dot ${idx === 0 ? 'active' : ''}`;
    dot.title = `${stage.stepNum}: ${stage.name}`;
    dot.style.left = `${stage.pct}%`;

    dot.innerHTML = `
      <div class="hw-stage-dot__marker"></div>
      <div class="hw-stage-dot__label">${stage.label}</div>
    `;

    dot.addEventListener('click', () => {
      goToStage(idx);
    });

    container.appendChild(dot);
  });
}

/* ============================================================
   13. INITIALIZATION BOOTSTRAP
   ============================================================ */
function init() {
  init3DScene();
  initUIControls();
  goToStage(0);

  // Dismiss loader screen
  setTimeout(() => {
    const loader = document.getElementById('hw-loader');
    const layout = document.getElementById('hw-layout');
    if (loader) loader.classList.add('hw-loader--hidden');
    if (layout) layout.classList.add('hw-layout--visible');
  }, 450);

  // Start animation loop
  animate();
}

// Start when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
