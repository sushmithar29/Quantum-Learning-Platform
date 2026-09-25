/* ============================================================
   QUANTUMLAB – 3D INTERACTIVE BLOCH SPHERE (Three.js WebGL)
   Full educational quantum visualization with:
   • True 3D WebGL sphere via Three.js + OrbitControls
   • θ/φ arc indicators clearly visible
   • H/X/Y/Z gate operations with smooth SLERP animation
   • Dynamically computed measurement probabilities
   • Responsive ResizeObserver
   ============================================================ */

window.QL = window.QL || {};

QL.initBloch3D = function () {
  const container = document.getElementById('bloch-webgl-container');
  const wrap      = document.getElementById('bloch-canvas-wrap');
  if (!container || !wrap) return;

  /* ----------------------------------------------------------
     GUARD: Three.js + OrbitControls required
  ---------------------------------------------------------- */
  if (typeof THREE === 'undefined' || typeof THREE.OrbitControls === 'undefined') {
    console.warn('[QuantumLab] Three.js or OrbitControls not loaded.');
    return;
  }

  // Teardown any prior instance
  container.innerHTML = '';

  /* ==========================================================
     1. RENDERER / SCENE / CAMERA
  ========================================================== */
  const W0 = wrap.clientWidth  || 520;
  const H0 = wrap.clientHeight || 460;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha:     true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(W0, H0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, W0 / H0, 0.1, 100);
  const DEFAULT_CAM = new THREE.Vector3(3.6, 2.5, 4.4);
  camera.position.copy(DEFAULT_CAM);
  camera.lookAt(0, 0, 0);

  /* ==========================================================
     2. ORBIT CONTROLS
  ========================================================== */
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping  = true;
  controls.dampingFactor  = 0.07;
  controls.enablePan      = false;
  controls.minDistance    = 2.6;
  controls.maxDistance    = 9.0;
  controls.rotateSpeed    = 0.75;
  controls.zoomSpeed      = 0.8;

  let isUserInteracting = false;
  controls.addEventListener('start', () => { isUserInteracting = true; });
  controls.addEventListener('end',   () => {
    setTimeout(() => { isUserInteracting = false; }, 2800);
  });

  /* ==========================================================
     3. LIGHTING
  ========================================================== */
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  const dLight1 = new THREE.DirectionalLight(0xa78bfa, 0.9);
  dLight1.position.set(4, 7, 5);
  scene.add(dLight1);

  const dLight2 = new THREE.DirectionalLight(0x06b6d4, 0.55);
  dLight2.position.set(-5, -3, -4);
  scene.add(dLight2);

  /* ==========================================================
     4. SPHERE RADIUS
  ========================================================== */
  const R = 2.0;

  /* ==========================================================
     5. BLOCH SPHERE GEOMETRY
  ========================================================== */
  const blochGroup = new THREE.Group();
  scene.add(blochGroup);

  // 5a. Semi-transparent inner body (creates depth)
  const bodyGeo = new THREE.SphereGeometry(R * 0.994, 32, 24);
  const bodyMat = new THREE.MeshBasicMaterial({
    color:       0x080c1c,
    transparent: true,
    opacity:     0.52,
    side:        THREE.BackSide,
    depthWrite:  false
  });
  blochGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

  // 5b. Glowing outer shell (subtle cyan glow at surface)
  const shellGeo = new THREE.SphereGeometry(R * 1.002, 32, 24);
  const shellMat = new THREE.MeshBasicMaterial({
    color:       0x0e3a4a,
    transparent: true,
    opacity:     0.09,
    side:        THREE.FrontSide,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending
  });
  blochGroup.add(new THREE.Mesh(shellGeo, shellMat));

  // 5c. Wireframe mesh (violet latitude/longitude grid)
  const wireGeo = new THREE.SphereGeometry(R, 36, 24);
  const wireMat = new THREE.MeshBasicMaterial({
    color:       0x7c3aed,
    wireframe:   true,
    transparent: true,
    opacity:     0.20,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending
  });
  blochGroup.add(new THREE.Mesh(wireGeo, wireMat));

  // Helper: ring at latitude
  function makeRing(radius, yPos, color, opacity) {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, yPos, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    return new THREE.LineLoop(geo, mat);
  }

  // Helper: great circle in a plane
  function makeGreatCircle(normal, color, opacity) {
    const pts = [];
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal.clone().normalize());
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R);
      v.applyQuaternion(q);
      pts.push(v);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    return new THREE.LineLoop(geo, mat);
  }

  // Equator (strong cyan highlight)
  blochGroup.add(makeRing(R, 0, 0x22d3ee, 0.75));

  // Prime meridian (XZ-plane, Y-axis normal)
  blochGroup.add(makeGreatCircle(new THREE.Vector3(0, 1, 0), 0x818cf8, 0.50));
  // Secondary meridian (YZ-plane, X-axis normal)
  blochGroup.add(makeGreatCircle(new THREE.Vector3(1, 0, 0), 0x6d28d9, 0.38));

  // Latitude rings at ±30°, ±60°
  [30, 60, -30, -60].forEach(deg => {
    const rad     = (deg * Math.PI) / 180;
    const y       = Math.sin(rad) * R;
    const rLat    = Math.cos(rad) * R;
    const opacity = Math.abs(deg) === 30 ? 0.32 : 0.20;
    blochGroup.add(makeRing(rLat, y, 0x7c3aed, opacity));
  });

  // Equatorial grid plane
  const grid = new THREE.GridHelper(5.0, 14, 0x6d28d9, 0x1a1840);
  grid.position.y = 0;
  if (Array.isArray(grid.material)) {
    grid.material.forEach(m => { m.transparent = true; m.opacity = 0.22; m.depthWrite = false; });
  } else if (grid.material) {
    grid.material.transparent = true; grid.material.opacity = 0.22; grid.material.depthWrite = false;
  }
  blochGroup.add(grid);

  /* ==========================================================
     6. AXES  (Z vertical = |0⟩ up / |1⟩ down)
  ========================================================== */
  const AXIS_LEN = R * 1.35;

  function makeAxisLine(from, to, color) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineBasicMaterial({
      color, transparent: true, opacity: 0.82,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Line(geo, mat);
  }

  function makeArrowCone(pos, dir, color) {
    const len  = 0.20;
    const geo  = new THREE.ConeGeometry(0.052, len, 14);
    const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
    const cone = new THREE.Mesh(geo, mat);
    const d    = dir.clone().normalize();
    cone.position.copy(pos.clone().sub(d.clone().multiplyScalar(len * 0.5)));
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    return cone;
  }

  // Z axis (cyan / vertical)
  blochGroup.add(makeAxisLine(new THREE.Vector3(0, -AXIS_LEN, 0), new THREE.Vector3(0, AXIS_LEN, 0), 0x38bdf8));
  blochGroup.add(makeArrowCone(new THREE.Vector3(0,  AXIS_LEN, 0), new THREE.Vector3(0, 1, 0), 0x38bdf8));
  blochGroup.add(makeArrowCone(new THREE.Vector3(0, -AXIS_LEN, 0), new THREE.Vector3(0,-1, 0), 0x38bdf8));

  // X axis (coral/red)
  blochGroup.add(makeAxisLine(new THREE.Vector3(-AXIS_LEN, 0, 0), new THREE.Vector3(AXIS_LEN, 0, 0), 0xf87171));
  blochGroup.add(makeArrowCone(new THREE.Vector3( AXIS_LEN, 0, 0), new THREE.Vector3( 1, 0, 0), 0xf87171));
  blochGroup.add(makeArrowCone(new THREE.Vector3(-AXIS_LEN, 0, 0), new THREE.Vector3(-1, 0, 0), 0xf87171));

  // Y axis (green / depth)
  blochGroup.add(makeAxisLine(new THREE.Vector3(0, 0, -AXIS_LEN), new THREE.Vector3(0, 0, AXIS_LEN), 0x34d399));
  blochGroup.add(makeArrowCone(new THREE.Vector3(0, 0,  AXIS_LEN), new THREE.Vector3(0, 0, 1), 0x34d399));
  blochGroup.add(makeArrowCone(new THREE.Vector3(0, 0, -AXIS_LEN), new THREE.Vector3(0, 0,-1), 0x34d399));

  /* ==========================================================
     7. TEXT SPRITES (always face camera)
  ========================================================== */
  function makeSprite(text, hexColor, fontSize, bgAlpha) {
    const cw = 256, ch = 128;
    const cvs = document.createElement('canvas');
    cvs.width  = cw;
    cvs.height = ch;
    const ctx  = cvs.getContext('2d');

    if (bgAlpha > 0) {
      ctx.fillStyle = `rgba(6,8,28,${bgAlpha})`;
      const pad = 8;
      const textW = fontSize * text.length * 0.62 + pad * 2;
      const rx = (cw - textW) / 2, ry = ch / 2 - fontSize / 2 - pad;
      ctx.beginPath();
      ctx.roundRect(rx, ry, textW, fontSize + pad * 2, 6);
      ctx.fill();
    }

    const col = '#' + hexColor.toString(16).padStart(6, '0');
    ctx.shadowColor = col;
    ctx.shadowBlur  = 18;
    ctx.font        = `bold ${fontSize}px "JetBrains Mono","Courier New",monospace`;
    ctx.fillStyle   = col;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cw / 2, ch / 2);

    const tex = new THREE.CanvasTexture(cvs);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const spr = new THREE.Sprite(mat);
    spr.scale.set(0.72, 0.36, 1);
    return spr;
  }

  const OFF = 0.30;

  // State labels on poles & equator
  const lbl0    = makeSprite('|0⟩', 0xe0f2fe, 46, 0.0); lbl0.position.set(0,  R + OFF, 0);  blochGroup.add(lbl0);
  const lbl1    = makeSprite('|1⟩', 0xe0f2fe, 46, 0.0); lbl1.position.set(0, -R - OFF, 0);  blochGroup.add(lbl1);
  const lblPlus = makeSprite('|+⟩', 0xc4b5fd, 40, 0.0); lblPlus.position.set( R + OFF, 0, 0);  blochGroup.add(lblPlus);
  const lblMinus= makeSprite('|-⟩', 0xc4b5fd, 40, 0.0); lblMinus.position.set(-R - OFF, 0, 0); blochGroup.add(lblMinus);
  const lblPlusI= makeSprite('|+i⟩',0xbae6fd, 36, 0.0); lblPlusI.position.set(0, 0,  R + OFF);  blochGroup.add(lblPlusI);
  const lblMinI = makeSprite('|-i⟩',0xbae6fd, 36, 0.0); lblMinI.position.set(0, 0, -R - OFF);   blochGroup.add(lblMinI);

  // Axis labels (+Z, -Z, +X, -X, +Y, -Y)
  const ALOFF = AXIS_LEN + 0.28;
  function addAxisLabel(text, color, x, y, z) {
    const s = makeSprite(text, color, 36, 0.0);
    s.position.set(x, y, z);
    s.scale.set(0.60, 0.30, 1);
    blochGroup.add(s);
  }
  addAxisLabel('+Z', 0x38bdf8, 0,      ALOFF,  0);
  addAxisLabel('-Z', 0x38bdf8, 0,     -ALOFF,  0);
  addAxisLabel('+X', 0xf87171, ALOFF,  0,       0);
  addAxisLabel('-X', 0xf87171,-ALOFF,  0,       0);
  addAxisLabel('+Y', 0x34d399, 0,      0,       ALOFF);
  addAxisLabel('-Y', 0x34d399, 0,      0,      -ALOFF);

  /* ==========================================================
     8. QUANTUM STATE  (θ, φ in spherical)
  ========================================================== */
  let theta = Math.PI / 3;   // 60° polar
  let phi   = Math.PI / 4;   // 45° azimuthal

  // Convert spherical → Cartesian  (Three.js Y = vertical/Z in physics)
  function stateToVec(th, ph) {
    return new THREE.Vector3(
      R * Math.sin(th) * Math.cos(ph),   // x
      R * Math.cos(th),                   // y (vertical = physics Z)
      R * Math.sin(th) * Math.sin(ph)    // z (depth   = physics Y)
    );
  }

  /* ==========================================================
     9. STATE VECTOR  (|ψ⟩)
  ========================================================== */
  const vecGroup = new THREE.Group();
  blochGroup.add(vecGroup);

  // Center bead
  const cbGeo = new THREE.SphereGeometry(0.07, 14, 14);
  const cbMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  vecGroup.add(new THREE.Mesh(cbGeo, cbMat));

  // Shaft cylinder (origin at base, length = 1 → scaled dynamically)
  const shaftGeo = new THREE.CylinderGeometry(0.028, 0.028, 1, 12);
  shaftGeo.translate(0, 0.5, 0); // pivot at base
  const shaftMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.96 });
  const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
  vecGroup.add(shaftMesh);

  // Arrowhead cone
  const HEAD_LEN = 0.24;
  const headGeo  = new THREE.ConeGeometry(0.07, HEAD_LEN, 14);
  const headMat  = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 1.0 });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  vecGroup.add(headMesh);

  // Tip glow bead
  const tipGeo = new THREE.SphereGeometry(0.07, 14, 14);
  const tipMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.92 });
  const tipBead = new THREE.Mesh(tipGeo, tipMat);
  vecGroup.add(tipBead);

  // |ψ⟩ sprite near tip
  const psiSprite = makeSprite('|ψ⟩', 0x38bdf8, 46, 0.55);
  vecGroup.add(psiSprite);

  // Projection dashed line (tip → XZ footprint → center)
  const projGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ]);
  const projMat  = new THREE.LineBasicMaterial({
    color: 0x67e8f9, transparent: true, opacity: 0.38,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const projLine = new THREE.Line(projGeo, projMat);
  vecGroup.add(projLine);

  const footGeo = new THREE.SphereGeometry(0.042, 10, 10);
  const footMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.65 });
  const footBead = new THREE.Mesh(footGeo, footMat);
  vecGroup.add(footBead);

  /* ==========================================================
     10. θ ARC (polar angle from +Z axis to state vector)
  ========================================================== */
  const THETA_ARC_SEGS = 48;
  const thetaArcGeo = new THREE.BufferGeometry();
  const thetaArcMat = new THREE.LineBasicMaterial({
    color: 0xfbbf24, transparent: true, opacity: 0.80,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const thetaArcLine = new THREE.Line(thetaArcGeo, thetaArcMat);
  blochGroup.add(thetaArcLine);

  const thetaLabel = makeSprite('θ', 0xfbbf24, 40, 0.45);
  thetaLabel.scale.set(0.50, 0.25, 1);
  blochGroup.add(thetaLabel);

  /* ==========================================================
     11. φ ARC (azimuthal angle around equator from +X)
  ========================================================== */
  const PHI_ARC_SEGS = 48;
  const phiArcGeo = new THREE.BufferGeometry();
  const phiArcMat = new THREE.LineBasicMaterial({
    color: 0xa78bfa, transparent: true, opacity: 0.80,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const phiArcLine = new THREE.Line(phiArcGeo, phiArcMat);
  blochGroup.add(phiArcLine);

  const phiLabel = makeSprite('φ', 0xa78bfa, 40, 0.45);
  phiLabel.scale.set(0.50, 0.25, 1);
  blochGroup.add(phiLabel);

  // Helper: update arc geometries each frame
  function updateArcs(th, ph) {
    // ---- θ arc ----
    // Draw arc from (0,R,0) = |0⟩ direction down to current tip, in the meridian plane of phi
    const tPts = [];
    for (let i = 0; i <= THETA_ARC_SEGS; i++) {
      const t = (i / THETA_ARC_SEGS) * th;
      const arcR = R * 0.56;  // 56% of sphere radius
      tPts.push(new THREE.Vector3(
        arcR * Math.sin(t) * Math.cos(ph),
        arcR * Math.cos(t),
        arcR * Math.sin(t) * Math.sin(ph)
      ));
    }
    thetaArcGeo.setFromPoints(tPts);

    // θ label at arc midpoint
    const tMid = th / 2;
    const tLR  = R * 0.68;
    thetaLabel.position.set(
      tLR * Math.sin(tMid) * Math.cos(ph),
      tLR * Math.cos(tMid),
      tLR * Math.sin(tMid) * Math.sin(ph)
    );

    // ---- φ arc ----
    // Draw arc on equatorial plane from +X axis to projection of tip
    const pPts = [];
    const phiR = R * 0.44;
    for (let i = 0; i <= PHI_ARC_SEGS; i++) {
      const p = (i / PHI_ARC_SEGS) * ph;
      pPts.push(new THREE.Vector3(phiR * Math.cos(p), 0, phiR * Math.sin(p)));
    }
    phiArcGeo.setFromPoints(pPts);

    // φ label
    const pMid = ph / 2;
    const pLR  = R * 0.58;
    phiLabel.position.set(pLR * Math.cos(pMid), 0.14, pLR * Math.sin(pMid));
  }

  /* ==========================================================
     12. UPDATE STATE VECTOR GEOMETRY
  ========================================================== */
  function updateStateVector() {
    const tip = stateToVec(theta, phi);
    const len = tip.length();
    const dir = tip.clone().normalize();

    // Shaft: scale and orient
    shaftMesh.position.set(0, 0, 0);
    shaftMesh.scale.set(1, Math.max(0.01, len - HEAD_LEN), 1);
    shaftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // Head: at tip minus half-head offset
    headMesh.position.copy(tip.clone().sub(dir.clone().multiplyScalar(HEAD_LEN * 0.5)));
    headMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // Tip bead + sprite
    tipBead.position.copy(tip);
    psiSprite.position.copy(tip.clone().add(dir.clone().multiplyScalar(0.30)));

    // Projection
    const foot = new THREE.Vector3(tip.x, 0, tip.z);
    projGeo.setFromPoints([new THREE.Vector3(), foot, tip]);
    footBead.position.copy(foot);

    // Arcs
    updateArcs(theta, phi);

    // UI sync
    syncUI(theta, phi);
  }

  /* ==========================================================
     13. UI SYNC
  ========================================================== */
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

    // Named state
    if (elKet) {
      const eps = 0.08;
      let name = '|ψ⟩';
      if (th < eps)                        name = '|0⟩';
      else if (Math.abs(th - Math.PI) < eps) name = '|1⟩';
      else if (Math.abs(th - Math.PI / 2) < eps) {
        const p = ((ph % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (p < eps || Math.abs(p - Math.PI * 2) < eps) name = '|+⟩';
        else if (Math.abs(p - Math.PI)     < eps)        name = '|-⟩';
        else if (Math.abs(p - Math.PI / 2) < eps)        name = '|+i⟩';
        else if (Math.abs(p - 3 * Math.PI / 2) < eps)   name = '|-i⟩';
      }
      elKet.textContent = name;
    }
  }

  updateStateVector();

  /* ==========================================================
     14. ANIMATION  (smooth lerp to target state)
  ========================================================== */
  let animationRaf = null;

  function animateState(toTh, toPh, ms = 540) {
    if (animationRaf) cancelAnimationFrame(animationRaf);

    const fromTh = theta;
    const fromPh = phi;

    // Shortest angular path for phi
    let dPh = toPh - fromPh;
    while (dPh >  Math.PI) dPh -= Math.PI * 2;
    while (dPh < -Math.PI) dPh += Math.PI * 2;

    const t0 = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - t0) / ms);
      const ease     = 1 - Math.pow(1 - progress, 3); // cubic ease-out

      theta = fromTh + (toTh - fromTh) * ease;
      phi   = fromPh + dPh * ease;
      updateStateVector();

      if (progress < 1) {
        animationRaf = requestAnimationFrame(step);
      } else {
        theta = toTh;
        phi   = toPh;
        updateStateVector();
        animationRaf = null;
      }
    }
    animationRaf = requestAnimationFrame(step);
  }

  /* ==========================================================
     15. QUANTUM GATES  (real Bloch-sphere rotations)
  ========================================================== */
  function applyGate(name) {
    // Current Bloch vector in physics convention
    //   x = sin(θ)cos(φ),  y = sin(θ)sin(φ),  z = cos(θ)
    // Mapped to Three.js:  three_x = x,  three_y = z(physics),  three_z = y(physics)
    const bx = Math.sin(theta) * Math.cos(phi);
    const by = Math.sin(theta) * Math.sin(phi);
    const bz = Math.cos(theta);

    let v = new THREE.Vector3(bx, bz, by); // three_x = phys_x, three_y = phys_z, three_z = phys_y

    switch (name) {
      case 'X':
        // Pauli-X: π rotation around physics X  → three_x axis (1,0,0)
        v.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
        break;
      case 'Y':
        // Pauli-Y: π rotation around physics Y  → three_z axis (0,0,1)
        v.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
        break;
      case 'Z':
        // Pauli-Z: π rotation around physics Z  → three_y axis (0,1,0)
        v.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        break;
      case 'H':
        // Hadamard = π rotation around (physics X + physics Z)/√2
        // → Three.js (1,0,0)+(0,1,0) = (1,1,0) normalized
        v.applyAxisAngle(new THREE.Vector3(1, 1, 0).normalize(), Math.PI);
        break;
    }

    v.normalize();

    // Convert back: phys_x = three_x, phys_y = three_z, phys_z = three_y
    const nx = v.x, ny = v.z, nz = v.y;
    let newTh = Math.acos(Math.max(-1, Math.min(1, nz)));
    let newPh = Math.atan2(ny, nx);
    if (newPh < 0) newPh += Math.PI * 2;

    animateState(newTh, newPh, 560);
  }

  /* ==========================================================
     16. GATE BUTTON WIRING
  ========================================================== */
  document.querySelectorAll('.bloch-gate-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.bloch-gate-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 550);
      applyGate(btn.dataset.gate);
    });
    // Keyboard accessibility
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  /* ==========================================================
     17. RESET VIEW
  ========================================================== */
  function resetView() {
    // Animate camera back
    const startPos = camera.position.clone();
    const t0  = performance.now();
    const dur = 650;

    function moveCam(now) {
      const p    = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(startPos, DEFAULT_CAM, ease);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
      if (p < 1) requestAnimationFrame(moveCam);
    }
    requestAnimationFrame(moveCam);

    // Reset state to default
    animateState(Math.PI / 3, Math.PI / 4, 650);
  }

  const resetBtn = document.getElementById('bloch-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', e => { e.stopPropagation(); resetView(); });
  }

  // Double-click on canvas resets view
  wrap.addEventListener('dblclick', () => resetView());

  /* ==========================================================
     18. RENDER LOOP  (idle precession + controls update)
  ========================================================== */
  let idlePhi = phi;

  function renderLoop() {
    requestAnimationFrame(renderLoop);

    // Subtle idle precession (slow phi rotation when not interacting)
    if (!isUserInteracting && !animationRaf) {
      idlePhi = phi;
      phi = (phi + 0.0025) % (Math.PI * 2);
      updateStateVector();
    }

    controls.update();
    renderer.render(scene, camera);
  }

  renderLoop();

  /* ==========================================================
     19. RESPONSIVE RESIZE
  ========================================================== */
  function onResize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) {
    new ResizeObserver(onResize).observe(wrap);
  }
};
