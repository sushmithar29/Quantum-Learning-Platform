/* ============================================================
   QUANTUMLAB – 3D INTERACTIVE BLOCH SPHERE (Three.js WebGL)
   ============================================================ */

window.QL = window.QL || {};

QL.initBloch3D = function () {
  const container = document.getElementById('bloch-webgl-container');
  const wrap      = document.getElementById('bloch-canvas-wrap');
  if (!container || !wrap) return;

  if (typeof THREE === 'undefined' || typeof THREE.OrbitControls === 'undefined') {
    console.warn('[QuantumLab] Three.js or OrbitControls not loaded');
    return;
  }

  // Clear any previous instance
  container.innerHTML = '';

  /* ─── Helper: wait one frame for layout to settle ─── */
  function getSize() {
    return {
      w: wrap.offsetWidth  || 520,
      h: wrap.offsetHeight || 460
    };
  }

  /* ═══════════════════════════════════════════════════════
     1. RENDERER  — opaque dark background so everything shows
  ═══════════════════════════════════════════════════════ */
  const { w: W0, h: H0 } = getSize();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(W0, H0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x060a18, 1);   // deep navy — matches site theme
  container.appendChild(renderer.domElement);

  /* ═══════════════════════════════════════════════════════
     2. SCENE + CAMERA
  ═══════════════════════════════════════════════════════ */
  const scene  = new THREE.Scene();
  const DEFAULT_CAM = new THREE.Vector3(3.8, 2.6, 4.6);

  const camera = new THREE.PerspectiveCamera(38, W0 / H0, 0.1, 100);
  camera.position.copy(DEFAULT_CAM);
  camera.lookAt(0, 0, 0);

  /* ═══════════════════════════════════════════════════════
     3. ORBIT CONTROLS
  ═══════════════════════════════════════════════════════ */
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping  = true;
  controls.dampingFactor  = 0.07;
  controls.enablePan      = false;
  controls.minDistance    = 3.0;
  controls.maxDistance    = 9.0;
  controls.rotateSpeed    = 0.75;
  controls.zoomSpeed      = 0.8;

  let userActive = false;
  controls.addEventListener('start', () => { userActive = true; });
  controls.addEventListener('end',   () => { setTimeout(() => { userActive = false; }, 2500); });

  /* ═══════════════════════════════════════════════════════
     4. LIGHTS
  ═══════════════════════════════════════════════════════ */
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const dl1 = new THREE.DirectionalLight(0xa78bfa, 1.0); dl1.position.set(4, 7, 5);  scene.add(dl1);
  const dl2 = new THREE.DirectionalLight(0x22d3ee, 0.7); dl2.position.set(-5,-3,-4); scene.add(dl2);

  /* ═══════════════════════════════════════════════════════
     5. SPHERE RADIUS
  ═══════════════════════════════════════════════════════ */
  const R = 2.0;
  const blochGroup = new THREE.Group();
  scene.add(blochGroup);

  /* ─── 5a. Translucent glowing sphere shell ─── */
  const shellMat = new THREE.MeshPhongMaterial({
    color:       0x0a1a3a,
    emissive:    0x061228,
    transparent: true,
    opacity:     0.55,
    side:        THREE.FrontSide,
    depthWrite:  false
  });
  blochGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), shellMat));

  /* ─── 5b. Back-face filler (dark interior for depth) ─── */
  const innerMat = new THREE.MeshBasicMaterial({
    color:       0x030810,
    transparent: true,
    opacity:     0.70,
    side:        THREE.BackSide,
    depthWrite:  false
  });
  blochGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 32, 24), innerMat));

  /* ─── Helper: lat-lon ring ─── */
  function makeRing(radius, yPos, color, opacity) {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, yPos, Math.sin(a) * radius));
    }
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat);
  }

  /* ─── Helper: great circle ─── */
  function makeGreatCircle(normalVec, color, opacity) {
    const pts = [];
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normalVec.clone().normalize());
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R);
      v.applyQuaternion(q);
      pts.push(v);
    }
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat);
  }

  /* ─── 5c. Equator (bright cyan) ─── */
  blochGroup.add(makeRing(R, 0, 0x22d3ee, 0.9));

  /* ─── 5d. Great circles (meridians) ─── */
  blochGroup.add(makeGreatCircle(new THREE.Vector3(0, 1, 0), 0x7c3aed, 0.60));
  blochGroup.add(makeGreatCircle(new THREE.Vector3(1, 0, 0), 0x4f46e5, 0.45));

  /* ─── 5e. Latitude rings ─── */
  [30, -30, 60, -60].forEach(deg => {
    const rad  = (deg * Math.PI) / 180;
    const y    = Math.sin(rad) * R;
    const rLat = Math.cos(rad) * R;
    blochGroup.add(makeRing(rLat, y, 0x6d28d9, Math.abs(deg) === 30 ? 0.45 : 0.28));
  });

  /* ─── 5f. Longitude grid lines (8 half-circles) ─── */
  for (let i = 0; i < 8; i++) {
    const lonPhi = (i / 8) * Math.PI;
    const pts = [];
    for (let j = 0; j <= 64; j++) {
      const t = (j / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        R * Math.sin(t) * Math.cos(lonPhi),
        R * Math.cos(t),
        R * Math.sin(t) * Math.sin(lonPhi)
      ));
    }
    const col = i % 2 === 0 ? 0x5b21b6 : 0x3b0764;
    const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.28 });
    blochGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  /* ═══════════════════════════════════════════════════════
     6. AXES  (X=coral  Y=emerald  Z=sky)
     Convention: Three.js Y = physics Z (vertical)
  ═══════════════════════════════════════════════════════ */
  const AX = R * 1.36;

  function makeLine(a, b, color, opacity) {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), mat);
  }

  function makeCone(pos, dir, color) {
    const L = 0.22;
    const geo = new THREE.ConeGeometry(0.055, L, 12);
    const mat = new THREE.MeshBasicMaterial({ color });
    const m   = new THREE.Mesh(geo, mat);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    m.position.copy(pos.clone().sub(dir.clone().normalize().multiplyScalar(L * 0.5)));
    return m;
  }

  // Z axis (sky blue / vertical — |0⟩ up, |1⟩ down)
  blochGroup.add(makeLine(new THREE.Vector3(0, -AX, 0), new THREE.Vector3(0, AX, 0), 0x38bdf8, 0.95));
  blochGroup.add(makeCone(new THREE.Vector3(0,  AX, 0), new THREE.Vector3( 0, 1, 0), 0x38bdf8));
  blochGroup.add(makeCone(new THREE.Vector3(0, -AX, 0), new THREE.Vector3( 0,-1, 0), 0x38bdf8));

  // X axis (coral/red)
  blochGroup.add(makeLine(new THREE.Vector3(-AX, 0, 0), new THREE.Vector3(AX, 0, 0), 0xf87171, 0.95));
  blochGroup.add(makeCone(new THREE.Vector3( AX, 0, 0), new THREE.Vector3( 1, 0, 0), 0xf87171));
  blochGroup.add(makeCone(new THREE.Vector3(-AX, 0, 0), new THREE.Vector3(-1, 0, 0), 0xf87171));

  // Y axis (emerald green / depth)
  blochGroup.add(makeLine(new THREE.Vector3(0, 0, -AX), new THREE.Vector3(0, 0, AX), 0x34d399, 0.95));
  blochGroup.add(makeCone(new THREE.Vector3(0, 0,  AX), new THREE.Vector3( 0, 0, 1), 0x34d399));
  blochGroup.add(makeCone(new THREE.Vector3(0, 0, -AX), new THREE.Vector3( 0, 0,-1), 0x34d399));

  /* ═══════════════════════════════════════════════════════
     7. SPRITE LABELS  (canvas textures, always face camera)
  ═══════════════════════════════════════════════════════ */
  function makeLabel(text, hexColor, fsize, bgAlpha) {
    const cw = 256, ch = 128;
    const cvs = document.createElement('canvas');
    cvs.width = cw; cvs.height = ch;
    const ctx = cvs.getContext('2d');

    if (bgAlpha > 0) {
      ctx.fillStyle = `rgba(4,8,24,${bgAlpha})`;
      ctx.beginPath();
      const tw = fsize * text.length * 0.6 + 20;
      ctx.roundRect((cw - tw) / 2, ch / 2 - fsize / 2 - 8, tw, fsize + 16, 6);
      ctx.fill();
    }

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

  const OFF = 0.32;

  // Pole labels
  const lbl0 = makeLabel('|0⟩', 0xe0f2fe, 48, 0); lbl0.position.set(0,  R + OFF, 0); blochGroup.add(lbl0);
  const lbl1 = makeLabel('|1⟩', 0xe0f2fe, 48, 0); lbl1.position.set(0, -R - OFF, 0); blochGroup.add(lbl1);

  // Equator labels
  const lblP = makeLabel('|+⟩',  0xc4b5fd, 42, 0); lblP.position.set( R + OFF, 0, 0);  blochGroup.add(lblP);
  const lblM = makeLabel('|-⟩',  0xc4b5fd, 42, 0); lblM.position.set(-R - OFF, 0, 0);  blochGroup.add(lblM);
  const lblI = makeLabel('|+i⟩', 0xbae6fd, 38, 0); lblI.position.set(0, 0,  R + OFF);  blochGroup.add(lblI);
  const lblNI= makeLabel('|-i⟩', 0xbae6fd, 38, 0); lblNI.position.set(0,0, -R - OFF);  blochGroup.add(lblNI);

  // Axis labels
  const AL = AX + 0.30;
  function axLabel(text, color, x, y, z) {
    const s = makeLabel(text, color, 34, 0);
    s.scale.set(0.58, 0.29, 1);
    s.position.set(x, y, z);
    blochGroup.add(s);
  }
  axLabel('+Z', 0x38bdf8, 0, AL,  0);
  axLabel('-Z', 0x38bdf8, 0,-AL,  0);
  axLabel('+X', 0xf87171, AL, 0,  0);
  axLabel('-X', 0xf87171,-AL, 0,  0);
  axLabel('+Y', 0x34d399, 0,  0,  AL);
  axLabel('-Y', 0x34d399, 0,  0, -AL);

  /* ═══════════════════════════════════════════════════════
     8. QUANTUM STATE  (θ=polar from +Y, φ=azimuthal)
     Three.js Y = physics Z (vertical axis)
  ═══════════════════════════════════════════════════════ */
  let theta = Math.PI / 3;   // 60° polar
  let phi   = Math.PI / 4;   // 45° azimuthal

  function stateVec(th, ph) {
    return new THREE.Vector3(
      R * Math.sin(th) * Math.cos(ph),
      R * Math.cos(th),
      R * Math.sin(th) * Math.sin(ph)
    );
  }

  /* ═══════════════════════════════════════════════════════
     9. STATE VECTOR  (|ψ⟩ — bright cyan arrow)
  ═══════════════════════════════════════════════════════ */
  const vecGrp = new THREE.Group();
  blochGroup.add(vecGrp);

  // Center dot
  const cdot = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee })
  );
  vecGrp.add(cdot);

  // Shaft
  const HEAD = 0.26;
  const shaftGeo = new THREE.CylinderGeometry(0.030, 0.030, 1, 12);
  shaftGeo.translate(0, 0.5, 0);
  const shaftMesh = new THREE.Mesh(shaftGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
  vecGrp.add(shaftMesh);

  // Arrowhead
  const headMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.075, HEAD, 14),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
  );
  vecGrp.add(headMesh);

  // Tip glow
  const tipDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.90 })
  );
  vecGrp.add(tipDot);

  // |ψ⟩ label
  const psiLbl = makeLabel('|ψ⟩', 0x38bdf8, 46, 0.6);
  vecGrp.add(psiLbl);

  // Projection (shadow line on equatorial plane)
  const projGeo  = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
  const projLine = new THREE.Line(projGeo, new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.42 }));
  vecGrp.add(projLine);

  const footDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
  );
  vecGrp.add(footDot);

  /* ═══════════════════════════════════════════════════════
     10. θ ARC  (yellow — polar angle from +Z to vector)
  ═══════════════════════════════════════════════════════ */
  const thetaArcGeo = new THREE.BufferGeometry();
  const thetaArcLine = new THREE.Line(thetaArcGeo,
    new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.90, linewidth: 2 }));
  blochGroup.add(thetaArcLine);

  const thetaLbl = makeLabel('θ', 0xfbbf24, 42, 0.5);
  thetaLbl.scale.set(0.48, 0.24, 1);
  blochGroup.add(thetaLbl);

  /* ═══════════════════════════════════════════════════════
     11. φ ARC  (purple — azimuthal around equator from +X)
  ═══════════════════════════════════════════════════════ */
  const phiArcGeo = new THREE.BufferGeometry();
  const phiArcLine = new THREE.Line(phiArcGeo,
    new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.90, linewidth: 2 }));
  blochGroup.add(phiArcLine);

  const phiLbl = makeLabel('φ', 0xa78bfa, 42, 0.5);
  phiLbl.scale.set(0.48, 0.24, 1);
  blochGroup.add(phiLbl);

  /* ─── Update arc geometries ─── */
  function updateArcs(th, ph) {
    // θ arc: from +Y axis down to tip along the meridian at angle ph
    const tPts = [];
    const tR   = R * 0.55;
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * th;
      tPts.push(new THREE.Vector3(tR * Math.sin(t) * Math.cos(ph), tR * Math.cos(t), tR * Math.sin(t) * Math.sin(ph)));
    }
    thetaArcGeo.setFromPoints(tPts);

    const tMid = th / 2;
    const tLR  = R * 0.70;
    thetaLbl.position.set(tLR * Math.sin(tMid) * Math.cos(ph), tLR * Math.cos(tMid), tLR * Math.sin(tMid) * Math.sin(ph));

    // φ arc: equatorial arc from +X to projection
    const pPts = [];
    const pR   = R * 0.45;
    const normPh = ((ph % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const sweep  = normPh > Math.PI ? normPh - Math.PI * 2 : normPh;
    for (let i = 0; i <= 48; i++) {
      const p = (i / 48) * sweep;
      pPts.push(new THREE.Vector3(pR * Math.cos(p), 0, pR * Math.sin(p)));
    }
    phiArcGeo.setFromPoints(pPts);

    const pMid = sweep / 2;
    const pLR  = R * 0.62;
    phiLbl.position.set(pLR * Math.cos(pMid), 0.18, pLR * Math.sin(pMid));
  }

  /* ═══════════════════════════════════════════════════════
     12. updateStateVector  — called every frame during animation
  ═══════════════════════════════════════════════════════ */
  function updateStateVector() {
    const tip = stateVec(theta, phi);
    const len = tip.length();
    const dir = tip.clone().normalize();

    // Shaft
    shaftMesh.position.set(0, 0, 0);
    shaftMesh.scale.set(1, Math.max(0.01, len - HEAD), 1);
    shaftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // Head
    headMesh.position.copy(tip.clone().sub(dir.clone().multiplyScalar(HEAD * 0.5)));
    headMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // Tip & label
    tipDot.position.copy(tip);
    psiLbl.position.copy(tip.clone().add(dir.clone().multiplyScalar(0.32)));

    // Projection
    const foot = new THREE.Vector3(tip.x, 0, tip.z);
    projGeo.setFromPoints([new THREE.Vector3(), foot, tip]);
    footDot.position.copy(foot);

    // Arcs
    updateArcs(theta, phi);

    // UI
    syncUI(theta, phi);
  }

  /* ═══════════════════════════════════════════════════════
     13. UI SYNC
  ═══════════════════════════════════════════════════════ */
  const elKet    = document.getElementById('bloch-state-ket');
  const elAngles = document.getElementById('bloch-state-angles');
  const elP0     = document.getElementById('bloch-p0');
  const elP1     = document.getElementById('bloch-p1');

  function syncUI(th, ph) {
    const thDeg = Math.round((th * 180) / Math.PI);
    let   phDeg = Math.round((ph * 180) / Math.PI) % 360;
    if (phDeg < 0) phDeg += 360;
    const p0 = Math.pow(Math.cos(th / 2), 2);
    const p1 = Math.pow(Math.sin(th / 2), 2);

    if (elAngles) elAngles.textContent = `θ: ${thDeg}° · φ: ${phDeg}°`;
    if (elP0)     elP0.textContent     = `${Math.round(p0 * 100)}%`;
    if (elP1)     elP1.textContent     = `${Math.round(p1 * 100)}%`;

    if (elKet) {
      const eps = 0.08;
      let name = '|ψ⟩';
      if (th < eps)                                  name = '|0⟩';
      else if (Math.abs(th - Math.PI) < eps)         name = '|1⟩';
      else if (Math.abs(th - Math.PI / 2) < eps) {
        const p = ((ph % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (p < eps || p > Math.PI * 2 - eps)           name = '|+⟩';
        else if (Math.abs(p - Math.PI)       < eps)     name = '|-⟩';
        else if (Math.abs(p - Math.PI / 2)   < eps)     name = '|+i⟩';
        else if (Math.abs(p - 1.5 * Math.PI) < eps)     name = '|-i⟩';
      }
      elKet.textContent = name;
    }
  }

  /* ═══════════════════════════════════════════════════════
     14. SMOOTH STATE ANIMATION  (cubic ease-out)
  ═══════════════════════════════════════════════════════ */
  let animRaf = null;

  function animateTo(toTh, toPh, ms) {
    if (animRaf) cancelAnimationFrame(animRaf);
    ms = ms || 540;
    const fromTh = theta, fromPh = phi;
    let dPh = toPh - fromPh;
    while (dPh >  Math.PI) dPh -= Math.PI * 2;
    while (dPh < -Math.PI) dPh += Math.PI * 2;
    const t0 = performance.now();
    function step(now) {
      const prog = Math.min(1, (now - t0) / ms);
      const ease = 1 - Math.pow(1 - prog, 3);
      theta = fromTh + (toTh - fromTh) * ease;
      phi   = fromPh + dPh * ease;
      updateStateVector();
      if (prog < 1) { animRaf = requestAnimationFrame(step); }
      else          { theta = toTh; phi = toPh; updateStateVector(); animRaf = null; }
    }
    animRaf = requestAnimationFrame(step);
  }

  /* ═══════════════════════════════════════════════════════
     15. QUANTUM GATES  (real Bloch-sphere π rotations)
     Mapping: Three.js axes  →  physics axes
       three_x = phys_x  (right)
       three_y = phys_z  (vertical)
       three_z = phys_y  (depth)
  ═══════════════════════════════════════════════════════ */
  function applyGate(g) {
    const bx = Math.sin(theta) * Math.cos(phi);
    const bz = Math.cos(theta);            // phys Z  = three_y
    const by = Math.sin(theta) * Math.sin(phi);

    // Put into three-js space
    let v = new THREE.Vector3(bx, bz, by);

    if      (g === 'X') v.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);   // around phys X
    else if (g === 'Y') v.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);   // around phys Y (three_z)
    else if (g === 'Z') v.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);   // around phys Z (three_y)
    else if (g === 'H') v.applyAxisAngle(new THREE.Vector3(1, 1, 0).normalize(), Math.PI); // (X+Z)/√2

    v.normalize();
    // Back to spherical: phys_z = three_y → newTh = acos(three_y)
    const newTh = Math.acos(Math.max(-1, Math.min(1, v.y)));
    let   newPh = Math.atan2(v.z, v.x);
    if (newPh < 0) newPh += Math.PI * 2;
    animateTo(newTh, newPh, 560);
  }

  /* ─── Gate buttons ─── */
  document.querySelectorAll('.bloch-gate-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.bloch-gate-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 560);
      applyGate(btn.dataset.gate);
    });
  });

  /* ═══════════════════════════════════════════════════════
     16. RESET
  ═══════════════════════════════════════════════════════ */
  function resetView() {
    const from = camera.position.clone();
    const t0   = performance.now();
    const dur  = 650;
    function moveCam(now) {
      const p    = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(from, DEFAULT_CAM, ease);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
      if (p < 1) requestAnimationFrame(moveCam);
    }
    requestAnimationFrame(moveCam);
    animateTo(Math.PI / 3, Math.PI / 4, 650);
  }

  const resetBtn = document.getElementById('bloch-reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', e => { e.stopPropagation(); resetView(); });
  wrap.addEventListener('dblclick', () => resetView());

  /* ═══════════════════════════════════════════════════════
     17. RENDER LOOP
  ═══════════════════════════════════════════════════════ */
  // Initial draw
  updateStateVector();

  function loop() {
    requestAnimationFrame(loop);
    // Gentle idle precession when not interacting
    if (!userActive && !animRaf) {
      phi = (phi + 0.0022) % (Math.PI * 2);
      updateStateVector();
    }
    controls.update();
    renderer.render(scene, camera);
  }
  loop();

  /* ═══════════════════════════════════════════════════════
     18. RESIZE
  ═══════════════════════════════════════════════════════ */
  function onResize() {
    const w = wrap.offsetWidth, h = wrap.offsetHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(wrap);
};
