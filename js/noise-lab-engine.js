/* ============================================================
   QUANTUMLAB — QUANTUM NOISE & DECOHERENCE LAB ENGINE
   Configure → Run → Observe → Analyze Workflow
   Self-contained: owns Three.js scene, physics, and graphs
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     0. WAIT FOR DOM
  ══════════════════════════════════════════════════════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ══════════════════════════════════════════════════════════
     1. STATE
  ══════════════════════════════════════════════════════════ */
  const state = {
    qubits:       1,
    initialState: 'plus',
    numChannels:  1,
    channels:     [],          // [{type, strength}]
    running:      false,
    hasResults:   false,
    results:      null,        // {qubits: [{trajectory, final}]}
    activeQubit:  0,
    graphSeries:  { coherence: true, x: true, y: true, z: true },
  };

  /* ══════════════════════════════════════════════════════════
     2. CHANNEL DEFINITIONS
  ══════════════════════════════════════════════════════════ */
  const CHANNEL_TYPES = [
    { value: 'depolarizing',     label: 'Depolarizing',          color: '#38bdf8' },
    { value: 'phase_flip',       label: 'Phase Flip (T\u2082)',  color: '#34d399' },
    { value: 'bit_flip',         label: 'Bit Flip',              color: '#f87171' },
    { value: 'amplitude_damp',   label: 'Amplitude Damping (T\u2081)', color: '#a78bfa' },
    { value: 'bit_phase_flip',   label: 'Bit-Phase Flip',        color: '#fbbf24' },
  ];

  /* ══════════════════════════════════════════════════════════
     3. INITIAL BLOCH VECTORS (Rx, Ry, Rz)
        Convention: Rz = +1 → |0⟩ pole, −1 → |1⟩ pole
  ══════════════════════════════════════════════════════════ */
  const INITIAL_STATES = {
    zero:   [0, 0, 1],
    one:    [0, 0, -1],
    plus:   [1, 0, 0],
    minus:  [-1, 0, 0],
    plus_y: [0, 1, 0],
  };

  /* ══════════════════════════════════════════════════════════
     4. PHYSICS — Kraus-operator contraction on Bloch vector
        Returns {rx, ry, rz} after one channel application
  ══════════════════════════════════════════════════════════ */
  function applyChannel(rx, ry, rz, type, p) {
    // p = error probability in [0,1]
    switch (type) {
      case 'depolarizing':
        // r → (1 − 4p/3) r
        const s = 1 - (4 * p) / 3;
        return { rx: rx * s, ry: ry * s, rz: rz * s };

      case 'amplitude_damp': {
        // Amplitude damping toward |0⟩ (rz=+1 ground state)
        // Kraus: rx,ry → sqrt(1-p)*r; rz → (1-p)*rz + p
        const sq = Math.sqrt(1 - p);
        return { rx: sq * rx, ry: sq * ry, rz: (1 - p) * rz + p };
      }

      case 'phase_flip':
        // r_x → (1-2p)*rx, r_y → (1-2p)*ry, r_z unchanged
        return { rx: (1 - 2 * p) * rx, ry: (1 - 2 * p) * ry, rz: rz };

      case 'bit_flip':
        // r_x unchanged, r_y → (1-2p)*ry, r_z → (1-2p)*rz
        return { rx: rx, ry: (1 - 2 * p) * ry, rz: (1 - 2 * p) * rz };

      case 'bit_phase_flip':
        // r_x → (1-2p)*rx, r_y unchanged, r_z → (1-2p)*rz
        return { rx: (1 - 2 * p) * rx, ry: ry, rz: (1 - 2 * p) * rz };

      default:
        return { rx, ry, rz };
    }
  }

  /* ══════════════════════════════════════════════════════════
     5. SIMULATE — produce trajectory for one qubit
        Returns array of {rx, ry, rz} from t=0..N_STEPS
  ══════════════════════════════════════════════════════════ */
  const N_STEPS = 60;

  function simulateQubit(initialStateKey, channels) {
    const [rx0, ry0, rz0] = INITIAL_STATES[initialStateKey] || INITIAL_STATES.plus;
    const trajectory = [];

    for (let step = 0; step <= N_STEPS; step++) {
      const t = step / N_STEPS;
      let rx = rx0, ry = ry0, rz = rz0;

      // Apply each channel with strength scaled by t
      for (const ch of channels) {
        const p = ch.strength * t;
        const next = applyChannel(rx, ry, rz, ch.type, p);
        rx = next.rx; ry = next.ry; rz = next.rz;
      }

      trajectory.push({ rx, ry, rz, t });
    }

    return trajectory;
  }

  /* ══════════════════════════════════════════════════════════
     6. THREE.JS BLOCH SPHERE
  ══════════════════════════════════════════════════════════ */
  let three = null; // { renderer, scene, camera, controls, vecGrp, shaftMesh, headMesh, tipDot, psiLbl }

  function initThree() {
    const container = document.getElementById('bloch-webgl-container');
    if (!container) return;
    if (typeof THREE === 'undefined') {
      console.warn('[NoiseLab] THREE not loaded');
      return;
    }

    // Clear any previous instance
    container.innerHTML = '';

    const W = container.offsetWidth  || 440;
    const H = container.offsetHeight || 360;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x060a18, 1);
    container.appendChild(renderer.domElement);

    /* Scene + Camera */
    const scene = new THREE.Scene();
    const DEFAULT_CAM = new THREE.Vector3(3.8, 2.6, 4.6);
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.copy(DEFAULT_CAM);
    camera.lookAt(0, 0, 0);

    /* Orbit Controls */
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan     = false;
    controls.minDistance   = 3.0;
    controls.maxDistance   = 9.0;

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dl1 = new THREE.DirectionalLight(0xa78bfa, 1.0);
    dl1.position.set(4, 7, 5);
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0x22d3ee, 0.7);
    dl2.position.set(-5, -3, -4);
    scene.add(dl2);

    /* Build sphere */
    const R = 2.0;
    const blochGroup = new THREE.Group();
    scene.add(blochGroup);

    // Shell
    blochGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R, 48, 32),
      new THREE.MeshPhongMaterial({ color: 0x0a1a3a, emissive: 0x061228, transparent: true, opacity: 0.55, side: THREE.FrontSide, depthWrite: false })
    ));
    blochGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.995, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0x030810, transparent: true, opacity: 0.70, side: THREE.BackSide, depthWrite: false })
    ));

    // Helper: ring
    function makeRing(radius, yPos, color, opacity) {
      const pts = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, yPos, Math.sin(a) * radius));
      }
      return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }

    // Equator + rings
    blochGroup.add(makeRing(R, 0, 0x22d3ee, 0.9));
    [30, -30, 60, -60].forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      const y   = Math.sin(rad) * R;
      const rL  = Math.cos(rad) * R;
      blochGroup.add(makeRing(rL, y, 0x6d28d9, Math.abs(deg) === 30 ? 0.45 : 0.28));
    });

    // Great circles
    function makeGreatCircle(normalVec, color, opacity) {
      const pts = [];
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), normalVec.clone().normalize());
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        const v = new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R);
        v.applyQuaternion(q);
        pts.push(v);
      }
      return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }
    blochGroup.add(makeGreatCircle(new THREE.Vector3(0,1,0), 0x7c3aed, 0.60));
    blochGroup.add(makeGreatCircle(new THREE.Vector3(1,0,0), 0x4f46e5, 0.45));

    // Axes
    const AX = R * 1.36;
    function makeLine(a, b, color, opacity) {
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([a, b]),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }
    function makeCone(pos, dir, color) {
      const L = 0.22;
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.055, L, 12), new THREE.MeshBasicMaterial({ color }));
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
      m.position.copy(pos.clone().sub(dir.clone().normalize().multiplyScalar(L * 0.5)));
      return m;
    }
    // Z (sky blue)
    blochGroup.add(makeLine(new THREE.Vector3(0,-AX,0), new THREE.Vector3(0,AX,0), 0x38bdf8, 0.95));
    blochGroup.add(makeCone(new THREE.Vector3(0, AX,0), new THREE.Vector3(0, 1,0), 0x38bdf8));
    blochGroup.add(makeCone(new THREE.Vector3(0,-AX,0), new THREE.Vector3(0,-1,0), 0x38bdf8));
    // X (coral)
    blochGroup.add(makeLine(new THREE.Vector3(-AX,0,0), new THREE.Vector3(AX,0,0), 0xf87171, 0.95));
    blochGroup.add(makeCone(new THREE.Vector3( AX,0,0), new THREE.Vector3( 1,0,0), 0xf87171));
    blochGroup.add(makeCone(new THREE.Vector3(-AX,0,0), new THREE.Vector3(-1,0,0), 0xf87171));
    // Y (green)
    blochGroup.add(makeLine(new THREE.Vector3(0,0,-AX), new THREE.Vector3(0,0,AX), 0x34d399, 0.95));
    blochGroup.add(makeCone(new THREE.Vector3(0,0, AX), new THREE.Vector3(0,0, 1), 0x34d399));
    blochGroup.add(makeCone(new THREE.Vector3(0,0,-AX), new THREE.Vector3(0,0,-1), 0x34d399));

    // Sprite labels
    function makeLabel(text, hexColor, fsize) {
      const cw = 256, ch = 128;
      const cvs = document.createElement('canvas');
      cvs.width = cw; cvs.height = ch;
      const ctx = cvs.getContext('2d');
      const col = '#' + hexColor.toString(16).padStart(6, '0');
      ctx.shadowColor = col; ctx.shadowBlur = 20;
      ctx.font = `bold ${fsize}px "JetBrains Mono","Courier New",monospace`;
      ctx.fillStyle = col;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, cw / 2, ch / 2);
      const tex = new THREE.CanvasTexture(cvs);
      tex.minFilter = THREE.LinearFilter;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      spr.scale.set(0.74, 0.37, 1);
      return spr;
    }
    const OFF = 0.32, AL = AX + 0.30;
    const lbl0 = makeLabel('|0\u27E9', 0xe0f2fe, 48); lbl0.position.set(0, R+OFF, 0); blochGroup.add(lbl0);
    const lbl1 = makeLabel('|1\u27E9', 0xe0f2fe, 48); lbl1.position.set(0,-R-OFF, 0); blochGroup.add(lbl1);
    const lblP = makeLabel('|+\u27E9', 0xc4b5fd, 42); lblP.position.set( R+OFF, 0, 0); blochGroup.add(lblP);
    const lblM = makeLabel('|-\u27E9', 0xc4b5fd, 42); lblM.position.set(-R-OFF, 0, 0); blochGroup.add(lblM);
    function axLbl(t, c, x, y, z) {
      const s = makeLabel(t, c, 34); s.scale.set(0.58,0.29,1); s.position.set(x,y,z); blochGroup.add(s);
    }
    axLbl('+Z', 0x38bdf8, 0, AL, 0); axLbl('-Z', 0x38bdf8, 0,-AL, 0);
    axLbl('+X', 0xf87171, AL, 0, 0); axLbl('-X', 0xf87171,-AL, 0, 0);
    axLbl('+Y', 0x34d399, 0, 0, AL); axLbl('-Y', 0x34d399, 0, 0,-AL);

    /* State vector group */
    const vecGrp = new THREE.Group();
    blochGroup.add(vecGrp);

    // Center dot
    vecGrp.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    ));

    const HEAD = 0.26;
    const shaftGeo = new THREE.CylinderGeometry(0.030, 0.030, 1, 12);
    shaftGeo.translate(0, 0.5, 0);
    const shaftMesh = new THREE.Mesh(shaftGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
    vecGrp.add(shaftMesh);

    const headMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.075, HEAD, 14),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
    );
    vecGrp.add(headMesh);

    const tipDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.90 })
    );
    vecGrp.add(tipDot);

    const psiLbl = makeLabel('|\u03C8\u27E9', 0x38bdf8, 46);
    vecGrp.add(psiLbl);

    /* Vector starts visible — will be set by showInitialState() */
    vecGrp.visible = true;

    /* Render loop */
    let raf;
    function loop() {
      raf = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    }
    loop();

    /* Resize */
    function onResize() {
      const w = container.offsetWidth, h = container.offsetHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(container);

    three = {
      renderer, scene, camera, controls,
      vecGrp, shaftMesh, headMesh, tipDot, psiLbl,
      R, HEAD, DEFAULT_CAM,
      animRaf: null
    };
  }

  /* ── Set Bloch vector to (rx, ry, rz) with optional smooth animation ── */
  function setBlochVector(rx, ry, rz, animate) {
    if (!three) return;
    const { vecGrp, shaftMesh, headMesh, tipDot, psiLbl, R, HEAD } = three;

    // Clamp to unit sphere
    const len = Math.sqrt(rx*rx + ry*ry + rz*rz);
    const scale = Math.min(1, len);
    const nx = len > 0.001 ? rx / len : 0;
    const ny = len > 0.001 ? ry / len : 0;
    const nz = len > 0.001 ? rz / len : 0;

    // Physics → Three.js mapping: physX→threeX, physY→threeZ, physZ→threeY
    // Bloch: rx=X, ry=Y, rz=Z(vertical)
    // Three.js: Y is vertical
    const tipV = new THREE.Vector3(rx * R, rz * R, ry * R);
    const tipLen = tipV.length();
    if (tipLen < 0.001) { vecGrp.visible = false; return; }

    vecGrp.visible = true;
    const dir = tipV.clone().normalize();

    shaftMesh.position.set(0, 0, 0);
    shaftMesh.scale.set(1, Math.max(0.01, tipLen - HEAD), 1);
    shaftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    headMesh.position.copy(tipV.clone().sub(dir.clone().multiplyScalar(HEAD * 0.5)));
    headMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    tipDot.position.copy(tipV);
    psiLbl.position.copy(tipV.clone().add(dir.clone().multiplyScalar(0.32)));
  }

  /* ── Animate Bloch vector from current to target over ms ── */
  function animateBlochTo(fromRx, fromRy, fromRz, toRx, toRy, toRz, ms, onDone) {
    if (!three) { if (onDone) onDone(); return; }
    if (three.animRaf) cancelAnimationFrame(three.animRaf);
    const t0 = performance.now();
    function step(now) {
      const prog = Math.min(1, (now - t0) / ms);
      const ease = 1 - Math.pow(1 - prog, 3);
      const rx = fromRx + (toRx - fromRx) * ease;
      const ry = fromRy + (toRy - fromRy) * ease;
      const rz = fromRz + (toRz - fromRz) * ease;
      setBlochVector(rx, ry, rz, false);
      if (prog < 1) {
        three.animRaf = requestAnimationFrame(step);
      } else {
        setBlochVector(toRx, toRy, toRz, false);
        three.animRaf = null;
        if (onDone) onDone();
      }
    }
    three.animRaf = requestAnimationFrame(step);
  }

  function resetBlochView() {
    if (!three) return;
    const { camera, controls, DEFAULT_CAM } = three;
    const from = camera.position.clone();
    const t0 = performance.now(), dur = 650;
    function moveCam(now) {
      const p = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(from, DEFAULT_CAM, ease);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
      if (p < 1) requestAnimationFrame(moveCam);
    }
    requestAnimationFrame(moveCam);
  }

  /* ══════════════════════════════════════════════════════════
     7. CANVAS GRAPHS
  ══════════════════════════════════════════════════════════ */
  const GRAPH_COLORS = {
    coherence: '#a78bfa',
    x:         '#f87171',
    y:         '#34d399',
    z:         '#38bdf8',
  };

  function drawComponentGraph(trajectory) {
    const canvas = document.getElementById('component-graph');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = H * 0.1 + (H * 0.8) * (i / 5);
      ctx.beginPath(); ctx.moveTo(W * 0.06, y); ctx.lineTo(W * 0.98, y); ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const x = W * 0.06 + (W * 0.92) * (i / 6);
      ctx.beginPath(); ctx.moveTo(x, H * 0.05); ctx.lineTo(x, H * 0.95); ctx.stroke();
    }

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    const zeroY = H * 0.1 + (H * 0.8) * 0.5;
    ctx.beginPath(); ctx.moveTo(W * 0.06, zeroY); ctx.lineTo(W * 0.98, zeroY); ctx.stroke();

    // Y axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = `${Math.max(9, H * 0.07)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'right';
    [1, 0.5, 0, -0.5, -1].forEach((v, i) => {
      const y = H * 0.1 + (H * 0.8) * (i / 4);
      ctx.fillText(v.toFixed(1), W * 0.055, y + 4);
    });

    function valToY(v) { return H * 0.1 + (H * 0.8) * ((1 - v) / 2); }
    function idxToX(i) { return W * 0.06 + (W * 0.92) * (i / (trajectory.length - 1)); }

    function drawSeries(key, getter) {
      if (!state.graphSeries[key]) return;
      ctx.beginPath();
      ctx.strokeStyle = GRAPH_COLORS[key];
      ctx.lineWidth = 2;
      ctx.shadowColor = GRAPH_COLORS[key];
      ctx.shadowBlur = 6;
      trajectory.forEach((pt, i) => {
        const x = idxToX(i);
        const y = valToY(getter(pt));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    drawSeries('coherence', pt => Math.sqrt(pt.rx*pt.rx + pt.ry*pt.ry + pt.rz*pt.rz));
    drawSeries('x', pt => pt.rx);
    drawSeries('y', pt => pt.ry);
    drawSeries('z', pt => pt.rz);
  }

  function drawProbabilityGraph(trajectory) {
    const canvas = document.getElementById('probability-graph');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = H * 0.08 + (H * 0.84) * (i / 4);
      ctx.beginPath(); ctx.moveTo(W * 0.08, y); ctx.lineTo(W * 0.98, y); ctx.stroke();
    }

    function valToY(v) { return H * 0.08 + (H * 0.84) * (1 - v); }
    function idxToX(i) { return W * 0.08 + (W * 0.90) * (i / (trajectory.length - 1)); }

    // P(|0⟩) = (1 + rz) / 2
    // P(|1⟩) = (1 - rz) / 2
    ctx.beginPath();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 6;
    trajectory.forEach((pt, i) => {
      const p0 = (1 + pt.rz) / 2;
      if (i === 0) ctx.moveTo(idxToX(i), valToY(p0));
      else ctx.lineTo(idxToX(i), valToY(p0));
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#f87171';
    trajectory.forEach((pt, i) => {
      const p1 = (1 - pt.rz) / 2;
      if (i === 0) ctx.moveTo(idxToX(i), valToY(p1));
      else ctx.lineTo(idxToX(i), valToY(p1));
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Y labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = `${Math.max(8, H * 0.1)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'right';
    [1.0, 0.75, 0.5, 0.25, 0.0].forEach((v, i) => {
      ctx.fillText(v.toFixed(2), W * 0.075, valToY(v) + 4);
    });
  }

  /* ══════════════════════════════════════════════════════════
     8. UI CHANNEL LIST
  ══════════════════════════════════════════════════════════ */
  function buildChannelList() {
    const list = document.getElementById('noise-channel-list');
    if (!list) return;

    const n = state.numChannels;
    // Extend or trim state.channels
    while (state.channels.length < n) {
      state.channels.push({ type: 'depolarizing', strength: 0.3 });
    }
    state.channels.length = n;

    list.innerHTML = '';

    if (n === 0) {
      list.innerHTML = '<span class="nl-no-channels">No noise — pure unitary evolution</span>';
      return;
    }

    state.channels.forEach((ch, i) => {
      const row = document.createElement('div');
      row.className = 'nl-noise-row';

      const chInfo = CHANNEL_TYPES.find(c => c.value === ch.type) || CHANNEL_TYPES[0];
      const pct = Math.round(ch.strength * 100);

      row.innerHTML = `
        <div class="nl-noise-row-header">
          <span class="nl-noise-ch-label" style="color:${chInfo.color};">CH ${i + 1}</span>
          <select class="nl-noise-type-select" data-ch="${i}">
            ${CHANNEL_TYPES.map(c => `<option value="${c.value}"${c.value === ch.type ? ' selected' : ''}>${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="nl-noise-slider-row">
          <input type="range" class="nl-noise-slider" data-ch="${i}" min="0" max="100" value="${pct}" />
          <span class="nl-noise-val" data-ch="${i}">${pct}%</span>
        </div>
      `;

      list.appendChild(row);
    });

    // Bind events
    list.querySelectorAll('.nl-noise-type-select').forEach(sel => {
      sel.addEventListener('change', e => {
        const idx = parseInt(e.target.dataset.ch);
        state.channels[idx].type = e.target.value;
        const chInfo = CHANNEL_TYPES.find(c => c.value === e.target.value) || CHANNEL_TYPES[0];
        const label = e.target.closest('.nl-noise-row').querySelector('.nl-noise-ch-label');
        if (label) label.style.color = chInfo.color;
      });
    });

    list.querySelectorAll('.nl-noise-slider').forEach(slider => {
      slider.addEventListener('input', e => {
        const idx = parseInt(e.target.dataset.ch);
        const val = parseInt(e.target.value) / 100;
        state.channels[idx].strength = val;
        const valEl = list.querySelector(`.nl-noise-val[data-ch="${idx}"]`);
        if (valEl) valEl.textContent = Math.round(val * 100) + '%';
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     9. QUBIT SELECTOR (right panel, shows after simulation)
  ══════════════════════════════════════════════════════════ */
  function buildQubitSelector() {
    const wrap = document.getElementById('qubit-selector-wrap');
    const sel  = document.getElementById('qubit-selector');
    if (!wrap || !sel) return;

    if (state.qubits > 1) {
      wrap.style.display = 'flex';
      sel.innerHTML = '';
      for (let i = 0; i < state.qubits; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Q${i}`;
        sel.appendChild(opt);
      }
      sel.value = state.activeQubit;
    } else {
      wrap.style.display = 'none';
    }
  }

  /* ══════════════════════════════════════════════════════════
     10. DONUT METER (purity)
  ══════════════════════════════════════════════════════════ */
  const CIRC = 2 * Math.PI * 52; // circumference of r=52

  function updateDonut(purity) {
    const arc = document.getElementById('donut-arc');
    const num = document.getElementById('stat-purity-num');
    const lbl = document.getElementById('stat-purity-label');
    if (!arc) return;

    const dash = CIRC * Math.max(0, Math.min(1, purity));
    arc.style.strokeDasharray  = `${dash} ${CIRC}`;
    arc.style.strokeDashoffset = `${CIRC * 0.25}`;

    // Color by purity
    if (purity >= 0.95) arc.style.stroke = '#34d399';
    else if (purity >= 0.7) arc.style.stroke = '#38bdf8';
    else if (purity >= 0.4) arc.style.stroke = '#fbbf24';
    else arc.style.stroke = '#f87171';

    if (num) num.textContent = purity.toFixed(3);
    if (lbl) lbl.textContent = purity >= 0.98 ? 'Pure State' : purity >= 0.5 ? 'Mixed State' : 'Highly Mixed';
  }

  /* ══════════════════════════════════════════════════════════
     11. EXEC STEPS ANIMATION
  ══════════════════════════════════════════════════════════ */
  function setExecStep(stepIdx) {
    const steps = document.querySelectorAll('#exec-steps .nl-exec-step');
    steps.forEach((el, i) => {
      el.classList.remove('active', 'done');
      if (i < stepIdx) el.classList.add('done');
      else if (i === stepIdx) el.classList.add('active');
    });
  }

  function showExecSteps(visible) {
    const el = document.getElementById('exec-steps');
    if (el) el.style.display = visible ? 'flex' : 'none';
  }

  /* ══════════════════════════════════════════════════════════
     12. STATUS BADGE
  ══════════════════════════════════════════════════════════ */
  function setStatus(text, cls) {
    const badge = document.getElementById('status-badge');
    if (!badge) return;
    badge.textContent = text;
    badge.className = 'nl-status-badge ' + cls;
  }

  /* ══════════════════════════════════════════════════════════
     13. MAIN: RUN SIMULATION
  ══════════════════════════════════════════════════════════ */
  async function runSimulation() {
    if (state.running) return;

    // Validate channels
    const errEl = document.getElementById('setup-error');
    if (state.numChannels > 0 && state.channels.length === 0) {
      if (errEl) errEl.style.display = 'block';
      return;
    }
    if (errEl) errEl.style.display = 'none';

    state.running = true;

    // Disable run button
    const runBtn = document.getElementById('btn-run-simulation');
    if (runBtn) {
      runBtn.disabled = true;
      runBtn.textContent = 'RUNNING…';
    }

    // Show exec steps
    showExecSteps(true);
    setStatus('RUNNING', 'status-running');

    // ── STEP 0: PREPARING ──
    setExecStep(0);
    await delay(420);

    // ── STEP 1: APPLYING CHANNELS ──
    setExecStep(1);
    await delay(500);

    // ── STEP 2: EVOLVING ──
    setExecStep(2);

    // Run physics for each qubit
    const results = [];
    for (let q = 0; q < state.qubits; q++) {
      const traj = simulateQubit(state.initialState, state.channels);
      const final = traj[traj.length - 1];
      const r = Math.sqrt(final.rx**2 + final.ry**2 + final.rz**2);
      results.push({ trajectory: traj, final, coherence: r });
    }
    state.results = results;
    await delay(540);

    // ── STEP 3: CALCULATING ──
    setExecStep(3);
    await delay(400);

    // ── STEP 4: COMPLETE ──
    setExecStep(4);
    await delay(200);

    // Show results
    state.hasResults = true;
    state.activeQubit = 0;
    displayResults();

    state.running = false;
    setStatus('COMPLETE', 'status-complete');

    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5,3 19,12 5,21"/></svg>
        RUN AGAIN
      `;
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ══════════════════════════════════════════════════════════
     14. DISPLAY RESULTS
  ══════════════════════════════════════════════════════════ */
  function displayResults() {
    const q = state.activeQubit;
    const result = state.results[q];
    if (!result) return;

    const { trajectory, final, coherence } = result;

    // Hide waiting overlays, show Bloch sphere
    const waiting = document.getElementById('bloch-waiting');
    if (waiting) waiting.style.display = 'none';

    // Animate Bloch vector from initial to final
    const init = INITIAL_STATES[state.initialState] || [1, 0, 0];
    animateBlochTo(
      init[0], init[1], init[2],
      final.rx, final.ry, final.rz,
      1200
    );

    // Update state badge
    const badge = document.getElementById('state-badge');
    if (badge) {
      const purity = coherence;
      if (purity >= 0.95) {
        badge.textContent = 'PURE STATE';
        badge.className = 'nl-state-badge badge-coherent';
      } else if (purity >= 0.4) {
        badge.textContent = 'PARTIALLY MIXED';
        badge.className = 'nl-state-badge badge-mixed';
      } else {
        badge.textContent = 'MAXIMALLY MIXED';
        badge.className = 'nl-state-badge badge-decoherent';
      }
    }

    // Graphs
    const emptyComp = document.getElementById('graph-empty-comp');
    const emptyProb = document.getElementById('graph-empty-prob');
    if (emptyComp) emptyComp.style.display = 'none';
    if (emptyProb) emptyProb.style.display = 'none';
    drawComponentGraph(trajectory);
    drawProbabilityGraph(trajectory);

    // Right panel metrics
    const rpWaiting = document.getElementById('rp-waiting');
    const rpMetrics = document.getElementById('rp-metrics');
    const rpFilters = document.getElementById('rp-graph-filters');
    if (rpWaiting) rpWaiting.style.display = 'none';
    if (rpMetrics) rpMetrics.style.display = 'flex';
    if (rpFilters) rpFilters.style.display = 'flex';

    // Purity = |R|^2 for single qubit
    const purity = coherence * coherence;
    updateDonut(purity);

    const p0 = (1 + final.rz) / 2;
    const p1 = (1 - final.rz) / 2;

    setText('stat-coherence-val', coherence.toFixed(4));
    setText('stat-prob0-val', (p0 * 100).toFixed(1) + '%');
    setText('stat-prob1-val', (p1 * 100).toFixed(1) + '%');
    setText('stat-rx', final.rx.toFixed(4));
    setText('stat-ry', final.ry.toFixed(4));
    setText('stat-rz', final.rz.toFixed(4));

    // Qubit selector
    buildQubitSelector();

    // Summary card
    const summaryCard = document.getElementById('summary-card');
    const summaryGrid = document.getElementById('summary-grid');
    const summaryTs   = document.getElementById('summary-timestamp');
    if (summaryCard && summaryGrid) {
      summaryCard.style.display = 'block';
      if (summaryTs) summaryTs.textContent = new Date().toLocaleTimeString();
      summaryGrid.innerHTML = `
        <div class="nl-summary-item"><span>Initial State</span><strong>${state.initialState.toUpperCase()}</strong></div>
        <div class="nl-summary-item"><span>Qubits</span><strong>${state.qubits}</strong></div>
        <div class="nl-summary-item"><span>Channels</span><strong>${state.numChannels}</strong></div>
        <div class="nl-summary-item"><span>Coherence |R|</span><strong>${coherence.toFixed(4)}</strong></div>
        <div class="nl-summary-item"><span>Purity</span><strong>${purity.toFixed(4)}</strong></div>
        <div class="nl-summary-item"><span>P(|0⟩)</span><strong>${(p0*100).toFixed(1)}%</strong></div>
      `;
    }
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ══════════════════════════════════════════════════════════
     15. RESET
  ══════════════════════════════════════════════════════════ */
  function resetExperiment() {
    state.hasResults = false;
    state.results = null;
    state.activeQubit = 0;
    state.running = false;

    // Hide exec steps
    showExecSteps(false);

    // Reset exec step dots
    document.querySelectorAll('#exec-steps .nl-exec-step').forEach(el => {
      el.classList.remove('active', 'done');
    });

    setStatus('READY', 'status-ready');

    // Reset Bloch sphere back to clean initial state (keep visible)
    if (three && three.animRaf) cancelAnimationFrame(three.animRaf);
    showInitialState();

    // Clear graphs
    ['component-graph', 'probability-graph'].forEach(id => {
      const c = document.getElementById(id);
      if (c) {
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
      }
    });
    const emptyComp = document.getElementById('graph-empty-comp');
    const emptyProb = document.getElementById('graph-empty-prob');
    if (emptyComp) emptyComp.style.display = 'flex';
    if (emptyProb) emptyProb.style.display = 'flex';

    // Reset right panel
    const rpWaiting = document.getElementById('rp-waiting');
    const rpMetrics = document.getElementById('rp-metrics');
    const rpFilters = document.getElementById('rp-graph-filters');
    if (rpWaiting) rpWaiting.style.display = 'flex';
    if (rpMetrics) rpMetrics.style.display = 'none';
    if (rpFilters) rpFilters.style.display = 'none';

    updateDonut(0);
    ['stat-purity-num','stat-coherence-val','stat-prob0-val','stat-prob1-val','stat-rx','stat-ry','stat-rz'].forEach(id => setText(id, '\u2014'));

    // Hide summary
    const summaryCard = document.getElementById('summary-card');
    if (summaryCard) summaryCard.style.display = 'none';

    // Hide qubit selector
    const qw = document.getElementById('qubit-selector-wrap');
    if (qw) qw.style.display = 'none';

    // Reset run button
    const runBtn = document.getElementById('btn-run-simulation');
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5,3 19,12 5,21"/></svg>
        RUN SIMULATION
      `;
    }
  }

  /* ══════════════════════════════════════════════════════════
     16. INIT
  ══════════════════════════════════════════════════════════ */
  /* Show the clean (no-noise) initial state on the Bloch sphere */
  function showInitialState() {
    const [rx, ry, rz] = INITIAL_STATES[state.initialState] || INITIAL_STATES.plus;
    setBlochVector(rx, ry, rz, false);
    // Update state badge to reflect the initial state
    const badge = document.getElementById('state-badge');
    if (badge) {
      badge.textContent = 'INITIAL STATE';
      badge.className = 'nl-state-badge badge-coherent';
    }
  }

  function init() {
    // Init Three.js Bloch sphere
    initThree();

    // Show initial Bloch vector immediately
    showInitialState();

    // Hide the waiting overlay — sphere is always visible
    const waiting = document.getElementById('bloch-waiting');
    if (waiting) waiting.style.display = 'none';

    // Initial donut state
    updateDonut(0);
    showExecSteps(false);

    // Qubit stepper
    const decBtn = document.getElementById('btn-qubits-dec');
    const incBtn = document.getElementById('btn-qubits-inc');
    const display = document.getElementById('qubits-display');
    const note    = document.getElementById('qubits-note');

    function updateQubits(n) {
      state.qubits = Math.max(1, Math.min(4, n));
      if (display) display.textContent = state.qubits;
      if (decBtn)  decBtn.disabled = state.qubits <= 1;
      if (incBtn)  incBtn.disabled = state.qubits >= 4;
      if (note) {
        note.textContent = state.qubits === 1
          ? 'Single qubit noise evolution'
          : `${state.qubits} qubits — independent noise channels per qubit`;
      }
    }

    if (decBtn) decBtn.addEventListener('click', () => updateQubits(state.qubits - 1));
    if (incBtn) incBtn.addEventListener('click', () => updateQubits(state.qubits + 1));

    // Initial state select — always update Bloch sphere live
    const initSel = document.getElementById('select-initial-state');
    if (initSel) initSel.addEventListener('change', () => {
      state.initialState = initSel.value;
      // Clear any previous simulation so sphere shows clean initial state
      state.hasResults = false;
      state.results = null;
      if (three && three.animRaf) cancelAnimationFrame(three.animRaf);
      showInitialState();
    });

    // Channel count select
    const chanSel = document.getElementById('select-num-channels');
    if (chanSel) {
      chanSel.addEventListener('change', () => {
        state.numChannels = parseInt(chanSel.value);
        buildChannelList();
      });
    }

    // Build initial channel list
    buildChannelList();

    // Run button
    const runBtn = document.getElementById('btn-run-simulation');
    if (runBtn) runBtn.addEventListener('click', runSimulation);

    // Reset button
    const resetBtn = document.getElementById('btn-reset-experiment');
    if (resetBtn) resetBtn.addEventListener('click', resetExperiment);

    // Reset view buttons
    [document.getElementById('btn-reset-view'), document.getElementById('btn-top-reset-view')].forEach(btn => {
      if (btn) btn.addEventListener('click', resetBlochView);
    });

    // Fullscreen
    const fsBtn = document.getElementById('btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        const el = document.documentElement;
        if (!document.fullscreenElement) {
          el.requestFullscreen && el.requestFullscreen();
        } else {
          document.exitFullscreen && document.exitFullscreen();
        }
      });
    }

    // Graph series filters (center graph)
    document.querySelectorAll('.nl-gf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const series = btn.dataset.series;
        btn.classList.toggle('active');
        state.graphSeries[series] = btn.classList.contains('active');
        if (state.hasResults && state.results) {
          drawComponentGraph(state.results[state.activeQubit].trajectory);
        }
      });
    });

    // Graph series filters (right panel)
    document.querySelectorAll('.nl-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const series = btn.dataset.series;
        btn.classList.toggle('active');
        state.graphSeries[series] = btn.classList.contains('active');
        // Also sync center panel buttons
        document.querySelectorAll(`.nl-gf-btn[data-series="${series}"]`).forEach(b => {
          if (btn.classList.contains('active')) b.classList.add('active');
          else b.classList.remove('active');
        });
        if (state.hasResults && state.results) {
          drawComponentGraph(state.results[state.activeQubit].trajectory);
        }
      });
    });

    // Qubit selector
    const qubitSel = document.getElementById('qubit-selector');
    if (qubitSel) {
      qubitSel.addEventListener('change', () => {
        state.activeQubit = parseInt(qubitSel.value);
        if (state.hasResults) displayResults();
      });
    }

    // Ensure donut arc is set up correctly
    const arc = document.getElementById('donut-arc');
    if (arc) {
      arc.style.strokeDasharray = '0 ' + CIRC;
      arc.style.strokeDashoffset = String(CIRC * 0.25);
      arc.style.stroke = '#38bdf8';
      arc.style.transition = 'stroke-dasharray 0.8s ease, stroke 0.5s ease';
    }
  }

})();
