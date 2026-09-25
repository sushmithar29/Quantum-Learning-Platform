/* ============================================================
   QUANTUMLAB – 3D INTERACTIVE BLOCH SPHERE (Three.js WebGL)
   True 3D spherical quantum visualization matching reference design
   ============================================================ */

window.QL = window.QL || {};

QL.initBloch3D = function () {
  const container = document.getElementById('bloch-webgl-container');
  const wrap = document.getElementById('bloch-canvas-wrap');
  if (!container || !wrap) return;

  // Verify THREE and OrbitControls
  if (typeof THREE === 'undefined' || typeof THREE.OrbitControls === 'undefined') {
    console.warn('Three.js or OrbitControls not loaded, falling back to 2D canvas');
    if (typeof QL.initQubitCanvasFallback === 'function') {
      QL.initQubitCanvasFallback();
    }
    return;
  }

  // Clear previous content
  container.innerHTML = '';

  /* -------------------------------------------------------------
     1. SCENE, CAMERA, RENDERER
     ------------------------------------------------------------- */
  const width = wrap.clientWidth || 520;
  const height = wrap.clientHeight || 500;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  const DEFAULT_CAM_POS = new THREE.Vector3(3.4, 2.3, 4.2);
  camera.position.copy(DEFAULT_CAM_POS);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  /* -------------------------------------------------------------
     2. ORBIT CONTROLS
     ------------------------------------------------------------- */
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;       // Sphere stays centered
  controls.minDistance = 2.8;
  controls.maxDistance = 8.5;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.85;

  let isUserInteracting = false;
  controls.addEventListener('start', () => { isUserInteracting = true; });
  controls.addEventListener('end', () => {
    // Resume idle precession shortly after release
    setTimeout(() => { isUserInteracting = false; }, 2500);
  });

  /* -------------------------------------------------------------
     3. LIGHTING
     ------------------------------------------------------------- */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xa78bfa, 0.8);
  dirLight1.position.set(4, 7, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.5);
  dirLight2.position.set(-4, -3, -5);
  scene.add(dirLight2);

  /* -------------------------------------------------------------
     4. BLOCH SPHERE GEOMETRY & REFERENCE DESIGN
     ------------------------------------------------------------- */
  const blochGroup = new THREE.Group();
  scene.add(blochGroup);

  const R = 2.0; // Sphere radius

  // A. Dense Wireframe Mesh (matching the reference image's violet/lavender mesh)
  const sphereGeo = new THREE.SphereGeometry(R, 44, 32);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6, // Violet
    wireframe: true,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
  blochGroup.add(wireMesh);

  // B. Translucent Dark Inner Sphere (creates volumetric depth so front lines stand out)
  const innerGeo = new THREE.SphereGeometry(R * 0.992, 32, 24);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x09071c,
    transparent: true,
    opacity: 0.55,
    side: THREE.BackSide,
    depthWrite: false
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  blochGroup.add(innerMesh);

  // Helper to create circular ring line
  function createRing(radius, yPos, color, opacity = 0.5, lineWidth = 1) {
    const segments = 96;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, yPos, Math.sin(theta) * radius));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending
    });
    return new THREE.LineLoop(geom, mat);
  }

  // C. Equator Ring (Cyan-tinted glowing ring at Y = 0)
  const equatorRing = createRing(R, 0, 0x67e8f9, 0.7);
  blochGroup.add(equatorRing);

  // D. Prime Meridian (in X-Y plane, Z = 0)
  const meridian1Points = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    meridian1Points.push(new THREE.Vector3(Math.sin(a) * R, Math.cos(a) * R, 0));
  }
  const meridian1Geom = new THREE.BufferGeometry().setFromPoints(meridian1Points);
  const meridian1Mat = new THREE.LineLoop(meridian1Geom, new THREE.LineBasicMaterial({
    color: 0xa78bfa,
    transparent: true,
    opacity: 0.52,
    blending: THREE.AdditiveBlending
  }));
  blochGroup.add(meridian1Mat);

  // E. Transverse Meridian (in Y-Z plane, X = 0)
  const meridian2Points = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    meridian2Points.push(new THREE.Vector3(0, Math.cos(a) * R, Math.sin(a) * R));
  }
  const meridian2Geom = new THREE.BufferGeometry().setFromPoints(meridian2Points);
  const meridian2Mat = new THREE.LineLoop(meridian2Geom, new THREE.LineBasicMaterial({
    color: 0x818cf8,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  }));
  blochGroup.add(meridian2Mat);

  // F. Additional Latitude Rings (30° and 60°)
  [30, -30, 60, -60].forEach(deg => {
    const rad = (deg * Math.PI) / 180;
    const y = Math.sin(rad) * R;
    const rAtLat = Math.cos(rad) * R;
    const latRing = createRing(rAtLat, y, 0x7c3aed, 0.22);
    blochGroup.add(latRing);
  });

  // G. Equatorial Coordinate Grid Plane (authentic reference feature)
  const gridHelper = new THREE.GridHelper(4.8, 12, 0x6d28d9, 0x1e1b4b);
  gridHelper.position.y = 0;
  if (gridHelper.material) {
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.28;
    gridHelper.material.depthWrite = false;
  }
  blochGroup.add(gridHelper);

  /* -------------------------------------------------------------
     5. 3D AXES (X, Y, Z with Arrowheads)
     Convention:
       Vertical: Z axis (+Z is |0> up, -Z is |1> down)
       Right:    X axis (+X is |+>,  -X is |->)
       Depth:    Y axis (+Y is |+i>, -Y is |-i>)
     ------------------------------------------------------------- */
  const axisLen = R * 1.28; // 2.56

  // Helper to create an axis with arrow and line
  function createAxisLine(p1, p2, colorHex) {
    const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Line(geom, mat);
  }

  function createArrowhead(pos, dir, colorHex) {
    const headLen = 0.18;
    const coneGeo = new THREE.ConeGeometry(0.048, headLen, 16);
    const coneMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    const d = dir.clone().normalize();
    cone.position.copy(pos.clone().sub(d.clone().multiplyScalar(headLen / 2)));
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    return cone;
  }

  // X Axis (soft red / coral)
  const xLine = createAxisLine(new THREE.Vector3(-axisLen, 0, 0), new THREE.Vector3(axisLen, 0, 0), 0xf87171);
  const xArrow = createArrowhead(new THREE.Vector3(axisLen, 0, 0), new THREE.Vector3(1, 0, 0), 0xf87171);
  const nxArrow = createArrowhead(new THREE.Vector3(-axisLen, 0, 0), new THREE.Vector3(-1, 0, 0), 0xf87171);
  blochGroup.add(xLine);
  blochGroup.add(xArrow);
  blochGroup.add(nxArrow);

  // Y Axis (depth / transverse, soft cyan-green)
  const yLine = createAxisLine(new THREE.Vector3(0, 0, -axisLen), new THREE.Vector3(0, 0, axisLen), 0x34d399);
  const yArrow = createArrowhead(new THREE.Vector3(0, 0, axisLen), new THREE.Vector3(0, 0, 1), 0x34d399);
  const nyArrow = createArrowhead(new THREE.Vector3(0, 0, -axisLen), new THREE.Vector3(0, 0, -1), 0x34d399);
  blochGroup.add(yLine);
  blochGroup.add(yArrow);
  blochGroup.add(nyArrow);

  // Z Axis (vertical, cyan / blue)
  const zLine = createAxisLine(new THREE.Vector3(0, -axisLen, 0), new THREE.Vector3(0, axisLen, 0), 0x38bdf8);
  const zArrow = createArrowhead(new THREE.Vector3(0, axisLen, 0), new THREE.Vector3(0, 1, 0), 0x38bdf8);
  const nzArrow = createArrowhead(new THREE.Vector3(0, -axisLen, 0), new THREE.Vector3(0, -1, 0), 0x38bdf8);
  blochGroup.add(zLine);
  blochGroup.add(zArrow);
  blochGroup.add(nzArrow);

  /* -------------------------------------------------------------
     6. TEXT SPRITES (3D Labels that face camera)
     ------------------------------------------------------------- */
  function createTextSprite(text, colorStr, fontSize = 42, isState = false) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 256, 128);

    if (isState) {
      ctx.shadowColor = colorStr;
      ctx.shadowBlur = 14;
    }
    ctx.font = `bold ${fontSize}px "JetBrains Mono", "Courier New", monospace`;
    ctx.fillStyle = colorStr;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(c);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.68, 0.34, 1);
    return sprite;
  }

  // Axis Labels (+X, -X, +Y, -Y, +Z, -Z)
  const labelOffset = 0.26;
  const labelPX = createTextSprite('+X', '#f87171', 38);
  labelPX.position.set(axisLen + labelOffset, 0, 0);
  blochGroup.add(labelPX);

  const labelNX = createTextSprite('-X', '#f87171', 38);
  labelNX.position.set(-axisLen - labelOffset, 0, 0);
  blochGroup.add(labelNX);

  const labelPY = createTextSprite('+Y', '#34d399', 38);
  labelPY.position.set(0, 0, axisLen + labelOffset);
  blochGroup.add(labelPY);

  const labelNY = createTextSprite('-Y', '#34d399', 38);
  labelNY.position.set(0, 0, -axisLen - labelOffset);
  blochGroup.add(labelNY);

  const labelPZ = createTextSprite('+Z', '#38bdf8', 38);
  labelPZ.position.set(0, axisLen + labelOffset, 0);
  blochGroup.add(labelPZ);

  const labelNZ = createTextSprite('-Z', '#38bdf8', 38);
  labelNZ.position.set(0, -axisLen - labelOffset, 0);
  blochGroup.add(labelNZ);

  // Quantum State Labels: |0>, |1>, |+>, |->, |+i>, |-i>
  const stateOffset = 0.24;
  const label0 = createTextSprite('|0⟩', '#e0f2fe', 46, true);
  label0.position.set(0, R + stateOffset, 0);
  blochGroup.add(label0);

  const label1 = createTextSprite('|1⟩', '#e0f2fe', 46, true);
  label1.position.set(0, -R - stateOffset, 0);
  blochGroup.add(label1);

  const labelPlus = createTextSprite('|+⟩', '#ede9fe', 42, true);
  labelPlus.position.set(R + stateOffset, 0, 0);
  blochGroup.add(labelPlus);

  const labelMinus = createTextSprite('|-⟩', '#ede9fe', 42, true);
  labelMinus.position.set(-R - stateOffset, 0, 0);
  blochGroup.add(labelMinus);

  const labelPlusI = createTextSprite('|+i⟩', '#cffafe', 40, true);
  labelPlusI.position.set(0, 0, R + stateOffset);
  blochGroup.add(labelPlusI);

  const labelMinusI = createTextSprite('|-i⟩', '#cffafe', 40, true);
  labelMinusI.position.set(0, 0, -R - stateOffset);
  blochGroup.add(labelMinusI);

  /* -------------------------------------------------------------
     7. QUANTUM STATE VECTOR (|ψ⟩)
     ------------------------------------------------------------- */
  let theta = Math.PI / 3;    // Polar angle from +Z (60°)
  let phi = Math.PI / 4;      // Azimuthal angle from +X (45°)

  const vectorGroup = new THREE.Group();
  blochGroup.add(vectorGroup);

  // Center pivot bead
  const centerBeadGeo = new THREE.SphereGeometry(0.065, 16, 16);
  const centerBeadMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const centerBead = new THREE.Mesh(centerBeadGeo, centerBeadMat);
  vectorGroup.add(centerBead);

  // Shaft (Cylinder scaled dynamically)
  const shaftGeo = new THREE.CylinderGeometry(0.026, 0.026, 1, 16);
  shaftGeo.translate(0, 0.5, 0); // Origin at base
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.95
  });
  const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
  vectorGroup.add(shaftMesh);

  // Arrowhead (Cone)
  const headLen = 0.22;
  const headGeo = new THREE.ConeGeometry(0.065, headLen, 16);
  const headMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 1.0
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  vectorGroup.add(headMesh);

  // Tip bead glow
  const tipGlowGeo = new THREE.SphereGeometry(0.065, 16, 16);
  const tipGlowMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.95
  });
  const tipGlow = new THREE.Mesh(tipGlowGeo, tipGlowMat);
  vectorGroup.add(tipGlow);

  // |ψ⟩ Label Sprite attached to tip
  const psiSprite = createTextSprite('|ψ⟩', '#38bdf8', 46, true);
  vectorGroup.add(psiSprite);

  // Projection dashed line & footprint on equator
  const projGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  ]);
  const projMat = new THREE.LineBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });
  const projLine = new THREE.Line(projGeom, projMat);
  vectorGroup.add(projLine);

  const footprintGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const footprintMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.7 });
  const footprint = new THREE.Mesh(footprintGeo, footprintMat);
  vectorGroup.add(footprint);

  // Compute 3D tip coordinate from (theta, phi)
  function getTip(th, ph) {
    const x = R * Math.sin(th) * Math.cos(ph);
    const y = R * Math.cos(th); // Vertical (+Z in physics)
    const z = R * Math.sin(th) * Math.sin(ph); // Depth
    return new THREE.Vector3(x, y, z);
  }

  // Update State Vector orientation and UI displays
  function updateStateVector() {
    const tip = getTip(theta, phi);
    const len = tip.length();
    const dir = tip.clone().normalize();

    // Shaft
    shaftMesh.position.set(0, 0, 0);
    shaftMesh.scale.set(1, len - headLen, 1);
    shaftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // Arrowhead at tip: apex at tip, base at tip - dir * headLen
    headMesh.position.copy(tip.clone().sub(dir.clone().multiplyScalar(headLen / 2)));
    headMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    // Tip glow
    tipGlow.position.copy(tip);

    // Sprite slightly past tip
    psiSprite.position.copy(tip.clone().add(dir.clone().multiplyScalar(0.26)));

    // Projection line: (0,0,0) -> (x, 0, z) -> (x, y, z)
    const projPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(tip.x, 0, tip.z),
      tip
    ];
    projLine.geometry.setFromPoints(projPoints);
    footprint.position.set(tip.x, 0, tip.z);

    // Update UI elements
    updateUI(theta, phi);
  }

  /* -------------------------------------------------------------
     8. UI SYNCHRONIZATION
     ------------------------------------------------------------- */
  const ketEl = document.getElementById('bloch-state-ket');
  const anglesEl = document.getElementById('bloch-state-angles');
  const p0El = document.getElementById('bloch-p0');
  const p1El = document.getElementById('bloch-p1');

  function updateUI(th, ph) {
    // Degrees
    const thDeg = Math.round((th * 180) / Math.PI);
    let phDeg = Math.round((ph * 180) / Math.PI) % 360;
    if (phDeg < 0) phDeg += 360;

    // Probabilities
    const p0 = Math.cos(th / 2) ** 2;
    const p1 = Math.sin(th / 2) ** 2;

    if (anglesEl) {
      anglesEl.textContent = `θ: ${thDeg}° · φ: ${phDeg}°`;
    }
    if (p0El) {
      p0El.textContent = `${Math.round(p0 * 100)}%`;
    }
    if (p1El) {
      p1El.textContent = `${Math.round(p1 * 100)}%`;
    }

    // Determine state ket
    if (ketEl) {
      let stateName = '|ψ⟩';
      const eps = 0.08;
      if (th < eps) stateName = '|0⟩';
      else if (Math.abs(th - Math.PI) < eps) stateName = '|1⟩';
      else if (Math.abs(th - Math.PI / 2) < eps) {
        if (Math.abs(ph) < eps || Math.abs(ph - Math.PI * 2) < eps) stateName = '|+⟩';
        else if (Math.abs(ph - Math.PI) < eps) stateName = '|-⟩';
        else if (Math.abs(ph - Math.PI / 2) < eps) stateName = '|+i⟩';
        else if (Math.abs(ph - (3 * Math.PI) / 2) < eps) stateName = '|-i⟩';
      }
      ketEl.textContent = stateName;
    }
  }

  updateStateVector();

  /* -------------------------------------------------------------
     9. QUANTUM GATE ROTATIONS & ANIMATION
     ------------------------------------------------------------- */
  let activeAnimation = null;

  function animateStateTo(targetTh, targetPh, durationMs = 500) {
    const startTh = theta;
    const startPh = phi;

    // Normalize target angle differences
    let dPh = targetPh - startPh;
    while (dPh > Math.PI) dPh -= Math.PI * 2;
    while (dPh < -Math.PI) dPh += Math.PI * 2;

    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      theta = startTh + (targetTh - startTh) * ease;
      phi = startPh + dPh * ease;

      updateStateVector();

      if (progress < 1) {
        activeAnimation = requestAnimationFrame(step);
      } else {
        theta = targetTh;
        phi = targetPh;
        updateStateVector();
        activeAnimation = null;
      }
    }

    if (activeAnimation) cancelAnimationFrame(activeAnimation);
    activeAnimation = requestAnimationFrame(step);
  }

  // Gates logic
  function applyGate(gateName) {
    // Current vector in unit sphere
    const curX = Math.sin(theta) * Math.cos(phi);
    const curY = Math.cos(theta); // Vertical (Z)
    const curZ = Math.sin(theta) * Math.sin(phi); // Depth (Y)
    const v = new THREE.Vector3(curX, curY, curZ);

    let targetV = v.clone();

    switch (gateName) {
      case 'H':
        // Hadamard: 180° rotation around (X + Z)/sqrt(2) diagonal axis
        // In our coords: X is (1,0,0) and vertical Z is (0,1,0)
        const hadAxis = new THREE.Vector3(1, 1, 0).normalize();
        targetV.applyAxisAngle(hadAxis, Math.PI);
        break;

      case 'X':
        // Pauli-X: 180° rotation around X axis (1, 0, 0)
        targetV.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
        break;

      case 'Y':
        // Pauli-Y: 180° rotation around Y axis (in our coords depth axis: 0, 0, 1)
        targetV.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
        break;

      case 'Z':
        // Pauli-Z: 180° rotation around Z axis (in our coords vertical axis: 0, 1, 0)
        targetV.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        break;
    }

    // Convert target 3D vector back to spherical (theta, phi)
    targetV.normalize();
    // y = cos(theta)
    let newTh = Math.acos(Math.max(-1, Math.min(1, targetV.y)));
    // x = sin(th)*cos(ph), z = sin(th)*sin(ph)
    let newPh = Math.atan2(targetV.z, targetV.x);
    if (newPh < 0) newPh += Math.PI * 2;

    animateStateTo(newTh, newPh, 550);
  }

  // Hook gate buttons
  const gateButtons = document.querySelectorAll('.bloch-gate-btn');
  gateButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const g = btn.dataset.gate;
      gateButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 500);
      applyGate(g);
    });
  });

  /* -------------------------------------------------------------
     10. RESET CAMERA & STATE (Double click or Reset button)
     ------------------------------------------------------------- */
  function resetView() {
    // Animate camera back to DEFAULT_CAM_POS
    const startPos = camera.position.clone();
    const startTime = performance.now();
    const dur = 600;

    function stepCam(now) {
      const progress = Math.min(1, (now - startTime) / dur);
      const ease = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(startPos, DEFAULT_CAM_POS, ease);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(stepCam);
      }
    }
    requestAnimationFrame(stepCam);

    // Reset state to default
    animateStateTo(Math.PI / 3, Math.PI / 4, 600);
  }

  const resetBtn = document.getElementById('bloch-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetView();
    });
  }

  // Double click resets view
  wrap.addEventListener('dblclick', () => {
    resetView();
  });

  /* -------------------------------------------------------------
     11. ANIMATION LOOP & IDLE PRECESSION
     ------------------------------------------------------------- */
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    const delta = (now - lastTime) * 0.001;
    lastTime = now;

    // Subtle quantum state precession when idle (not dragging, not in gate transition)
    if (!isUserInteracting && !activeAnimation) {
      phi = (phi + 0.003) % (Math.PI * 2);
      updateStateVector();
    }

    controls.update();
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  /* -------------------------------------------------------------
     12. RESIZE LISTENER
     ------------------------------------------------------------- */
  function onResize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) {
    new ResizeObserver(onResize).observe(wrap);
  }
};
