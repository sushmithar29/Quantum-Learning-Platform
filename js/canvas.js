/* ============================================================
   QUANTUMLAB – CANVAS (Hero animation + experiment mini-viz)
   ============================================================ */

window.QL = window.QL || {};

/* ---- HERO CANVAS ---- */
QL.initHeroCanvas = function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles, nodes, time = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initParticles();
    initNodes();
  }

  function initParticles() {
    particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      color: Math.random() > 0.5 ? '#7c3aed' : '#06b6d4',
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2
    }));
  }

  function initNodes() {
    nodes = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const radius = Math.min(W, H) * 0.28;
      return {
        x: W / 2 + Math.cos(angle) * radius * (0.6 + Math.random() * 0.4),
        y: H / 2 + Math.sin(angle) * radius * (0.6 + Math.random() * 0.4),
        r: 3 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.006,
        ox: W / 2 + Math.cos(angle) * radius * (0.6 + Math.random() * 0.4),
        oy: H / 2 + Math.sin(angle) * radius * (0.6 + Math.random() * 0.4)
      };
    });
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    time += 0.008;

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i], nj = nodes[j];
        const dx = nj.x - ni.x, dy = nj.y - ni.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          const alpha = (1 - dist / 220) * 0.12;
          const pulse = (Math.sin(time * 1.5 + ni.phase) + 1) * 0.5;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,58,237,${alpha * (0.5 + pulse * 0.5)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(ni.x, ni.y);
          ctx.lineTo(nj.x, nj.y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.pulse += 0.04;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const pulse = (Math.sin(p.pulse) + 1) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.7 + pulse * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(p.alpha * 255 * (0.6 + pulse * 0.4)).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Draw quantum nodes
    nodes.forEach(n => {
      n.phase += n.speed;
      n.x = n.ox + Math.sin(n.phase * 1.3) * 12;
      n.y = n.oy + Math.cos(n.phase) * 8;

      const pulse = (Math.sin(time * 2 + n.phase) + 1) * 0.5;
      const r = n.r * (0.8 + pulse * 0.4);

      // Glow
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
      grad.addColorStop(0, `rgba(124,58,237,${0.3 + pulse * 0.3})`);
      grad.addColorStop(1, 'rgba(124,58,237,0)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${0.6 + pulse * 0.4})`;
      ctx.fill();
    });

    // Subtle concentric rings from center
    for (let ring = 1; ring <= 3; ring++) {
      const rad = ring * 90 + (time * 15 % 90);
      const alpha = Math.max(0, 0.06 - ring * 0.015);
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, rad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    requestAnimationFrame(drawFrame);
  }

  resize();
  window.addEventListener('resize', resize);
  drawFrame();
};

/* ---- BLOCH SPHERE (Hero) — Large Interactive 3D ---- */
QL.initQubitCanvas = function () {
  // Use True 3D WebGL Bloch Sphere if Three.js and initBloch3D are present
  if (typeof QL.initBloch3D === 'function' && typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
    QL.initBloch3D();
    return;
  }

  const wrap    = document.getElementById('bloch-canvas-wrap');
  const canvas  = document.getElementById('qubit-canvas');
  const tooltip = document.getElementById('bloch-tooltip');
  const ketEl   = document.getElementById('bloch-state-ket');
  const subEl   = document.getElementById('bloch-state-sub');
  const resetBtn = document.getElementById('bloch-reset-btn');
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;

  /* ---- sizing ---- */
  function resize() {
    const sz = wrap.offsetWidth;
    canvas.width  = sz * DPR;
    canvas.height = sz * DPR;
    ctx.scale(DPR, DPR);
  }
  resize();
  new ResizeObserver(resize).observe(wrap);

  /* ---- state ---- */
  // Bloch angles
  let theta = Math.PI / 5;   // polar (0 = |0>, PI = |1>)
  let phi   = 0.6;            // azimuthal
  // Camera rotation (drag)
  let camX = 0.28, camY = 0.0;   // pitch, yaw
  let dragStart = null, camAtDrag = null;
  // Zoom
  let zoom = 1;
  // Auto-rotation
  let autoRotate = true;
  let t = 0;
  // Gate animation
  let gateAnim = null;   // { from: [th, ph], to: [th, ph], t: 0, dur: 60 }
  // Load-in fade
  let loadAlpha = 0;
  // Named-state labels
  const STATES = [
    { id: '|0⟩',  theta: 0,        phi: 0,   desc: 'Computational basis state' },
    { id: '|1⟩',  theta: Math.PI,  phi: 0,   desc: 'Computational basis state' },
    { id: '|+⟩',  theta: Math.PI/2, phi: 0,  desc: 'Equal superposition of |0⟩ and |1⟩' },
    { id: '|-⟩',  theta: Math.PI/2, phi: Math.PI, desc: 'Superposition with opposite phase' },
    { id: '|+i⟩', theta: Math.PI/2, phi: Math.PI/2,  desc: 'Superposition with +i phase' },
    { id: '|-i⟩', theta: Math.PI/2, phi: -Math.PI/2, desc: 'Superposition with -i phase' },
  ];
  // Hover state
  let hoveredState = null;
  let screenLabels = [];  // [{id, x, y, theta, phi}]

  /* ---- 3D helpers ---- */
  // Rotate by camera
  function camRotate(x, y, z) {
    // Yaw around Y axis (camY)
    const cy = Math.cos(camY), sy = Math.sin(camY);
    let nx = cy*x + sy*z;
    let nz = -sy*x + cy*z;
    // Pitch around X axis (camX)
    const cx = Math.cos(camX), sx = Math.sin(camX);
    let ny = cx*y - sx*nz;
    nz = sx*y + cx*nz;
    return [nx, ny, nz];
  }

  // Project 3D -> 2D (simple orthographic with slight perspective)
  function project(x, y, z, CX, CY, R) {
    const [rx, ry, rz] = camRotate(x, y, z);
    const fov = 1 + rz * 0.25;  // very mild perspective
    return [CX + rx * R * zoom * fov, CY - ry * R * zoom * fov, rz];
  }

  /* ---- state vector position ---- */
  function stateVec(th, ph, CX, CY, R) {
    const x = Math.sin(th) * Math.cos(ph);
    const y = Math.cos(th);
    const z = Math.sin(th) * Math.sin(ph);
    return project(x, y, z, CX, CY, R);
  }

  /* ---- named-state label getter ---- */
  function stateLabel(th, ph) {
    for (const s of STATES) {
      const dx = Math.sin(th)*Math.cos(ph) - Math.sin(s.theta)*Math.cos(s.phi);
      const dy = Math.cos(th) - Math.cos(s.theta);
      const dz = Math.sin(th)*Math.sin(ph) - Math.sin(s.theta)*Math.sin(s.phi);
      if (dx*dx + dy*dy + dz*dz < 0.04) return s.id;
    }
    return '|ψ⟩';
  }

  /* ---- main draw ---- */
  function draw() {
    const SZ = wrap.offsetWidth;
    const CX = SZ / 2, CY = SZ / 2;
    const R  = SZ * 0.40;

    ctx.clearRect(0, 0, SZ, SZ);
    ctx.save();
    ctx.globalAlpha = Math.min(1, loadAlpha);

    /* ========== SPHERE BACKGROUND ========== */
    const bgGrad = ctx.createRadialGradient(CX - R*0.2, CY - R*0.25, R*0.05, CX, CY, R);
    bgGrad.addColorStop(0, 'rgba(28,14,52,0.88)');
    bgGrad.addColorStop(0.6, 'rgba(11,8,28,0.92)');
    bgGrad.addColorStop(1, 'rgba(4,6,18,0.97)');
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    /* ========== LATITUDE LINES ========== */
    // Draw multiple latitude circles (projected as ellipses)
    const latAngles = [-60, -30, 0, 30, 60];
    latAngles.forEach(deg => {
      const rad = deg * Math.PI / 180;
      const cosLat = Math.cos(rad);
      const latY_3d = Math.sin(rad);   // Y coord in 3D space (up = +Y)
      const latR = R * cosLat;         // radius of this circle
      const nSeg = 64;
      let first = true;
      ctx.beginPath();
      for (let i = 0; i <= nSeg; i++) {
        const a = (i / nSeg) * Math.PI * 2;
        const x3 = cosLat * Math.cos(a);
        const y3 = latY_3d;
        const z3 = cosLat * Math.sin(a);
        const [px, py] = project(x3, y3, z3, CX, CY, R);
        if (first) { ctx.moveTo(px, py); first = false; }
        else ctx.lineTo(px, py);
      }
      const isMid = deg === 0;
      ctx.strokeStyle = isMid
        ? 'rgba(124,58,237,0.45)'   // equator brighter
        : 'rgba(124,58,237,0.18)';
      ctx.lineWidth = isMid ? 1.2 : 0.7;
      ctx.stroke();
    });

    /* ========== LONGITUDE LINES ========== */
    const lonAngles = [0, 45, 90, 135];
    lonAngles.forEach(deg => {
      const rad = deg * Math.PI / 180;
      const nSeg = 64;
      let first = true;
      ctx.beginPath();
      for (let i = 0; i <= nSeg; i++) {
        const a = (i / nSeg) * Math.PI;   // 0 → π (full meridian)
        const x3 = Math.sin(a) * Math.cos(rad);
        const y3 = Math.cos(a);
        const z3 = Math.sin(a) * Math.sin(rad);
        const [px, py] = project(x3, y3, z3, CX, CY, R);
        if (first) { ctx.moveTo(px, py); first = false; }
        else ctx.lineTo(px, py);
      }
      // also the other half
      for (let i = nSeg; i >= 0; i--) {
        const a = (i / nSeg) * Math.PI;
        const x3 = Math.sin(a) * Math.cos(rad + Math.PI);
        const y3 = Math.cos(a);
        const z3 = Math.sin(a) * Math.sin(rad + Math.PI);
        const [px, py] = project(x3, y3, z3, CX, CY, R);
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(6,182,212,0.13)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    });

    /* ========== SPHERE OUTLINE ========== */
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    // glowing violet stroke
    ctx.strokeStyle = 'rgba(139,92,246,0.75)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(124,58,237,0.55)';
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* ========== AXES ========== */
    function drawAxis(x1, y1, z1, x2, y2, z2, color, shadowC, label, labelOff) {
      const [ax, ay, az] = project(x1, y1, z1, CX, CY, R);
      const [bx, by, bz] = project(x2, y2, z2, CX, CY, R);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = shadowC;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Arrow tip
      const ang = Math.atan2(by - ay, bx - ax);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 8*Math.cos(ang-0.4), by - 8*Math.sin(ang-0.4));
      ctx.lineTo(bx - 8*Math.cos(ang+0.4), by - 8*Math.sin(ang+0.4));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      // Label
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.round(SZ * 0.032)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(label, bx + labelOff[0], by + labelOff[1]);
      ctx.textAlign = 'left';
    }
    const axisLen = 1.18;
    // Z axis (up = |0>, down = |1>)
    drawAxis(0,-axisLen,0, 0,axisLen,0, 'rgba(6,182,212,0.85)', 'rgba(6,182,212,0.5)', 'Z', [0,-8]);
    // X axis
    drawAxis(-axisLen,0,0, axisLen,0,0, 'rgba(167,139,250,0.75)', 'rgba(124,58,237,0.4)', 'X', [10,0]);
    // Y axis
    drawAxis(0,0,-axisLen, 0,0,axisLen, 'rgba(34,211,238,0.65)', 'rgba(6,182,212,0.35)', 'Y', [0,12]);

    /* ========== STATE LABELS ========== */
    screenLabels = [];
    STATES.forEach(s => {
      const scale = 1.22;
      const x3 = Math.sin(s.theta)*Math.cos(s.phi)*scale;
      const y3 = Math.cos(s.theta)*scale;
      const z3 = Math.sin(s.theta)*Math.sin(s.phi)*scale;
      const [lx, ly, lz] = project(x3, y3, z3, CX, CY, R);
      const isHovered = hoveredState === s.id;
      const isKey = ['|0⟩','|1⟩','|+⟩','|-⟩'].includes(s.id);

      // Skip if too far back and minor label
      if (lz < -0.5 && !isKey) return;

      const fs = Math.round(SZ * (isKey ? 0.032 : 0.026));
      ctx.font = `bold ${fs}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';

      if (isHovered) {
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(6,182,212,0.8)';
        ctx.shadowBlur = 16;
      } else if (isKey) {
        ctx.fillStyle = lz > 0
          ? 'rgba(34,211,238,0.95)'
          : 'rgba(34,211,238,0.55)';
        ctx.shadowColor = 'rgba(6,182,212,0.4)';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = lz > 0
          ? 'rgba(167,139,250,0.8)'
          : 'rgba(167,139,250,0.35)';
        ctx.shadowBlur = 0;
      }
      ctx.fillText(s.id, lx, ly);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';

      screenLabels.push({ id: s.id, x: lx, y: ly, theta: s.theta, phi: s.phi, desc: s.desc });
    });

    /* ========== STATE VECTOR ========== */
    const [svx, svy, svz] = stateVec(theta, phi, CX, CY, R);

    // Projection dashed lines (shadow)
    // Horizontal projection on equatorial plane
    const eqX3 = Math.sin(theta)*Math.cos(phi);
    const eqZ3 = Math.sin(theta)*Math.sin(phi);
    const [eqPx, eqPy] = project(eqX3, 0, eqZ3, CX, CY, R);
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(eqPx, eqPy);
    ctx.strokeStyle = 'rgba(124,58,237,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eqPx, eqPy);
    ctx.lineTo(svx, svy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector glow halo
    const halo = ctx.createRadialGradient(CX, CY, 0, CX, CY, R * 0.85);
    halo.addColorStop(0, 'rgba(124,58,237,0.0)');
    halo.addColorStop(0.7, 'rgba(6,182,212,0.0)');
    halo.addColorStop(1, 'rgba(6,182,212,0.0)');

    // Vector line
    const vecGrad = ctx.createLinearGradient(CX, CY, svx, svy);
    vecGrad.addColorStop(0, 'rgba(124,58,237,0.9)');
    vecGrad.addColorStop(0.5, 'rgba(56,189,248,0.95)');
    vecGrad.addColorStop(1, 'rgba(6,182,212,1)');
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(svx, svy);
    ctx.strokeStyle = vecGrad;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(6,182,212,0.7)';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Arrowhead
    const ang = Math.atan2(svy - CY, svx - CX);
    const aLen = SZ * 0.028;
    ctx.beginPath();
    ctx.moveTo(svx, svy);
    ctx.lineTo(svx - aLen*Math.cos(ang-0.38), svy - aLen*Math.sin(ang-0.38));
    ctx.lineTo(svx - aLen*Math.cos(ang+0.38), svy - aLen*Math.sin(ang+0.38));
    ctx.closePath();
    ctx.fillStyle = '#22d3ee';
    ctx.shadowColor = 'rgba(6,182,212,0.9)';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Tip glow
    const tipGlow = ctx.createRadialGradient(svx, svy, 0, svx, svy, SZ * 0.06);
    tipGlow.addColorStop(0, 'rgba(6,182,212,0.55)');
    tipGlow.addColorStop(0.5, 'rgba(56,189,248,0.2)');
    tipGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(svx, svy, SZ * 0.06, 0, Math.PI * 2);
    ctx.fillStyle = tipGlow;
    ctx.fill();

    // Tip dot
    ctx.beginPath();
    ctx.arc(svx, svy, SZ * 0.014, 0, Math.PI * 2);
    ctx.fillStyle = '#e0f7ff';
    ctx.shadowColor = 'rgba(6,182,212,1)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Vector label |ψ⟩
    ctx.fillStyle = 'rgba(167,139,250,0.95)';
    ctx.font = `bold ${Math.round(SZ * 0.032)}px 'JetBrains Mono', monospace`;
    ctx.fillText('|ψ⟩', svx + SZ*0.025, svy - SZ*0.018);

    /* ========== CENTER DOT ========== */
    ctx.beginPath();
    ctx.arc(CX, CY, SZ * 0.01, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();

    ctx.restore();
  }

  /* ---- animate ---- */
  function tick() {
    // Fade in
    if (loadAlpha < 1) loadAlpha = Math.min(1, loadAlpha + 0.025);

    // Gate animation
    if (gateAnim) {
      gateAnim.t++;
      const p = Math.min(1, gateAnim.t / gateAnim.dur);
      const ease = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
      theta = gateAnim.from[0] + (gateAnim.to[0] - gateAnim.from[0]) * ease;
      phi   = gateAnim.from[1] + (gateAnim.to[1] - gateAnim.from[1]) * ease;
      if (p >= 1) gateAnim = null;
    } else if (autoRotate) {
      // Slow continuous precession
      t += 0.006;
      theta = Math.PI / 4 + Math.sin(t * 0.45) * 0.55;
      phi   = t * 0.5;
    }

    // Update indicator
    const label = stateLabel(theta, phi);
    if (ketEl)  ketEl.textContent  = label;
    if (subEl)  subEl.textContent  = label === '|ψ⟩' ? 'Superposition' : 'Basis State';

    draw();
    requestAnimationFrame(tick);
  }
  tick();

  /* ---- drag to rotate ---- */
  function onPointerDown(e) {
    autoRotate = false;
    const pt = e.touches ? e.touches[0] : e;
    dragStart = [pt.clientX, pt.clientY];
    camAtDrag = [camX, camY];
  }
  function onPointerMove(e) {
    if (!dragStart) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = (pt.clientX - dragStart[0]) / wrap.offsetWidth;
    const dy = (pt.clientY - dragStart[1]) / wrap.offsetHeight;
    camY = camAtDrag[1] + dx * 3.5;
    camX = Math.max(-Math.PI/2, Math.min(Math.PI/2, camAtDrag[0] - dy * 3.5));
    draw();

    // Tooltip: check hover
    checkHover(pt.clientX, pt.clientY);
  }
  function onPointerUp() {
    dragStart = null;
  }

  /* ---- mouse hover for tooltips ---- */
  function checkHover(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = (clientX - rect.left) * (wrap.offsetWidth / rect.width);
    const my = (clientY - rect.top)  * (wrap.offsetHeight / rect.height);
    let found = null;
    const hitR = wrap.offsetWidth * 0.06;
    for (const s of screenLabels) {
      const dist = Math.hypot(mx - s.x, my - s.y);
      if (dist < hitR) { found = s; break; }
    }
    if (found) {
      hoveredState = found.id;
      tooltip.innerHTML = `<strong>${found.id}</strong>${found.desc}`;
      tooltip.style.left = (found.x / wrap.offsetWidth * 100) + '%';
      tooltip.style.top  = ((found.y / wrap.offsetHeight * 100) - 18) + '%';
      tooltip.classList.add('visible');
    } else {
      hoveredState = null;
      tooltip.classList.remove('visible');
    }
  }

  canvas.addEventListener('mousedown',  onPointerDown);
  canvas.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('mousemove',  onPointerMove);
  window.addEventListener('touchmove',  onPointerMove, { passive: true });
  window.addEventListener('mouseup',    onPointerUp);
  window.addEventListener('touchend',   onPointerUp);

  canvas.addEventListener('mousemove', e => {
    if (!dragStart) checkHover(e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseleave', () => {
    hoveredState = null;
    tooltip.classList.remove('visible');
  });

  /* ---- scroll to zoom ---- */
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    zoom = Math.max(0.65, Math.min(1.35, zoom - e.deltaY * 0.001));
  }, { passive: false });

  /* ---- reset button ---- */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      camX = 0.28; camY = 0;
      zoom = 1;
      autoRotate = true;
      document.querySelectorAll('.bloch-gate-btn').forEach(b => b.classList.remove('active'));
    });
  }

  /* ---- gate buttons ---- */
  const gateTargets = {
    H: [Math.PI / 2, 0],               // |+>
    X: [Math.PI,     0],               // |1>
    Y: [Math.PI / 2, Math.PI / 2],     // |+i>
    Z: [0,           0],               // |0>
  };
  document.querySelectorAll('.bloch-gate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gate = btn.dataset.gate;
      const target = gateTargets[gate];
      if (!target) return;
      autoRotate = false;
      gateAnim = {
        from: [theta, phi],
        to:   [...target],
        t: 0,
        dur: 55,
      };
      document.querySelectorAll('.bloch-gate-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 700);
    });
  });
};



/* ---- EXPERIMENT MINI VIZ ---- */
QL.ExperimentViz = (function() {
  const animators = {};

  function entangle(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;

      // Two qubits
      [-60, 60].forEach((offset, i) => {
        const x = cx + offset;
        const pulse = (Math.sin(t * 2 + i * Math.PI) + 1) * 0.5;

        const g = ctx.createRadialGradient(x, cy, 0, x, cy, 22 + pulse * 8);
        g.addColorStop(0, i === 0 ? 'rgba(124,58,237,0.7)' : 'rgba(6,182,212,0.7)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x, cy, 22 + pulse * 8, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();

        ctx.beginPath(); ctx.arc(x, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#a78bfa' : '#22d3ee';
        ctx.fill();
      });

      // Connection wave
      const numPts = 40;
      ctx.beginPath();
      for (let p = 0; p <= numPts; p++) {
        const px = cx - 60 + (p / numPts) * 120;
        const wave = Math.sin((p / numPts) * Math.PI * 4 - t * 3) * 8 * Math.sin((p / numPts) * Math.PI);
        if (p === 0) ctx.moveTo(px, cy + wave);
        else ctx.lineTo(px, cy + wave);
      }
      ctx.strokeStyle = `rgba(167,139,250,${0.4 + Math.sin(t * 2) * 0.2})`;
      ctx.lineWidth = 1.5; ctx.stroke();

      t += 0.04;
      return requestAnimationFrame(draw);
    }
    return draw();
  }

  function wave(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = H / 2 + Math.sin((x / W) * Math.PI * 6 - t * 2 + wave * 1) * (14 - wave * 4);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const alpha = 0.6 - wave * 0.18;
        ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
        ctx.lineWidth = 1.5 - wave * 0.3; ctx.stroke();
      }
      t += 0.04; return requestAnimationFrame(draw);
    }
    return draw();
  }

  function bloch(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124,58,237,0.25)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6,182,212,0.15)'; ctx.stroke();

      const theta = Math.PI / 3 + Math.sin(t * 0.5) * 0.4;
      const phi = t * 0.8;
      const sx = cx + R * Math.sin(theta) * Math.cos(phi);
      const sy = cy - R * Math.cos(theta);

      const g = ctx.createLinearGradient(cx, cy, sx, sy);
      g.addColorStop(0, '#7c3aed'); g.addColorStop(1, '#06b6d4');
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy);
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();

      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee'; ctx.fill();
      t += 0.035; return requestAnimationFrame(draw);
    }
    return draw();
  }

  function split(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, startX = 20, endX = W - 20;
      const cycle = (t % (Math.PI * 2));
      const progress = Math.sin(cycle * 0.5) * 0.5 + 0.5;
      const splitPt = startX + (endX - startX) * 0.45;
      const px = startX + (splitPt - startX) * Math.min(1, progress * 1.4);

      // Incoming beam
      ctx.beginPath(); ctx.moveTo(startX, H / 2); ctx.lineTo(px, H / 2);
      ctx.strokeStyle = `rgba(167,139,250,${0.7})`;
      ctx.lineWidth = 2; ctx.stroke();

      if (progress > 0.45) {
        const sp = Math.min(1, (progress - 0.45) * 3);
        // Up beam
        ctx.beginPath(); ctx.moveTo(px, H / 2);
        ctx.lineTo(px + (endX - px) * sp, H / 2 - 28 * sp);
        ctx.strokeStyle = `rgba(6,182,212,0.8)`; ctx.lineWidth = 1.8; ctx.stroke();
        // Down beam
        ctx.beginPath(); ctx.moveTo(px, H / 2);
        ctx.lineTo(px + (endX - px) * sp, H / 2 + 28 * sp);
        ctx.strokeStyle = `rgba(124,58,237,0.8)`; ctx.lineWidth = 1.8; ctx.stroke();
      }

      // Particle
      const pr = progress < 0.45 ? px : px;
      const gy = progress < 0.45 ? H / 2 : H / 2;
      ctx.beginPath(); ctx.arc(pr, gy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa'; ctx.fill();

      t += 0.03; return requestAnimationFrame(draw);
    }
    return draw();
  }

  function interference(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;
      // Two source waves
      [mid - 20, mid + 20].forEach((sy, i) => {
        for (let x = 0; x < W; x++) {
          const dist = Math.sqrt((x - W * 0.3) ** 2 + (mid - sy) ** 2);
          const amp = Math.sin(dist * 0.18 - t * 3) * (20 / (1 + dist * 0.04));
          const y = sy + amp;
          const alpha = Math.max(0, 0.4 - dist * 0.003);
          ctx.fillStyle = `rgba(124,58,237,${alpha})`;
          ctx.fillRect(x, y, 1, 1);
        }
      });
      t += 0.06; return requestAnimationFrame(draw);
    }
    return draw();
  }

  function triple(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const positions = [[W/2, H/2-40], [W/2-35, H/2+25], [W/2+35, H/2+25]];
      positions.forEach(([x, y], i) => {
        const pulse = (Math.sin(t * 1.5 + i * 2.1) + 1) * 0.5;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 20 + pulse * 8);
        g.addColorStop(0, ['rgba(124,58,237,0.7)','rgba(6,182,212,0.7)','rgba(167,139,250,0.7)'][i]);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x, y, 20 + pulse * 8, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = ['#a78bfa','#22d3ee','#7c3aed'][i]; ctx.fill();
      });
      // Connections
      for (let i = 0; i < 3; i++) {
        const ni = positions[i], nj = positions[(i+1)%3];
        const alpha = 0.3 + Math.sin(t * 2 + i) * 0.2;
        ctx.beginPath(); ctx.moveTo(ni[0], ni[1]); ctx.lineTo(nj[0], nj[1]);
        ctx.strokeStyle = `rgba(167,139,250,${alpha})`; ctx.lineWidth = 1; ctx.stroke();
      }
      t += 0.04; return requestAnimationFrame(draw);
    }
    return draw();
  }

  function teleport(canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const phase = (t % (Math.PI * 4)) / (Math.PI * 4);

      // Source qubit
      const sx = 30, sy = H/2;
      ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#7c3aed'; ctx.fill();

      // Destination qubit
      const dx = W - 30, dy = H/2;
      const arriveAlpha = phase > 0.7 ? (phase - 0.7) / 0.3 : 0;
      const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 12);
      g.addColorStop(0, `rgba(6,182,212,${arriveAlpha * 0.8})`);
      g.addColorStop(1, 'rgba(6,182,212,0)');
      ctx.beginPath(); ctx.arc(dx, dy, 12, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(dx, dy, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,211,238,${arriveAlpha})`; ctx.fill();

      // Travelling particle
      if (phase < 0.7) {
        const tx = sx + (dx - sx) * (phase / 0.7);
        const ty = sy + Math.sin(phase * Math.PI) * -25;
        ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#a78bfa'; ctx.fill();
        // Trail
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty);
        ctx.strokeStyle = 'rgba(167,139,250,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      t += 0.03; return requestAnimationFrame(draw);
    }
    return draw();
  }

  const typeMap = { entangle, wave, bloch, split, interference, triple, teleport };

  return {
    init: function(canvas, type) {
      const fn = typeMap[type] || bloch;
      const id = fn(canvas);
      animators[canvas.id] = id;
    }
  };
})();

/* ---- BLOCH SPHERE (for lab modals) ---- */
QL.BlochSphere = function(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  let theta = opts.theta || Math.PI / 4;
  let phi = opts.phi || 0;
  let animating = opts.animate !== false;
  let t = 0;
  let raf;

  function draw() {
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, CY = H / 2, R = Math.min(W, H) * 0.42;
    ctx.clearRect(0, 0, W, H);

    // Background circle
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
    const bg = ctx.createRadialGradient(CX - R*0.2, CY - R*0.2, R*0.1, CX, CY, R);
    bg.addColorStop(0, 'rgba(20,15,40,0.8)'); bg.addColorStop(1, 'rgba(5,8,18,0.95)');
    ctx.fillStyle = bg; ctx.fill();
    ctx.strokeStyle = 'rgba(124,58,237,0.3)'; ctx.lineWidth = 1; ctx.stroke();

    // Latitude circles
    [0.5, -0.5].forEach(sinLat => {
      const latY = CY - sinLat * R;
      const latR = R * Math.cos(Math.asin(sinLat));
      ctx.beginPath(); ctx.ellipse(CX, latY, latR, latR * 0.2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124,58,237,0.12)'; ctx.lineWidth = 0.8; ctx.stroke();
    });

    // Equator
    ctx.beginPath(); ctx.ellipse(CX, CY, R, R * 0.22, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(124,58,237,0.2)'; ctx.lineWidth = 1; ctx.stroke();

    // Meridian
    ctx.beginPath(); ctx.ellipse(CX, CY, R * 0.22, R, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(6,182,212,0.15)'; ctx.lineWidth = 0.8; ctx.stroke();

    // Axes
    [
      { x: R, y: 0, lbl: 'x', c: 'rgba(167,139,250,0.5)' },
      { x: 0, y: -R, lbl: 'z', c: 'rgba(6,182,212,0.6)' },
    ].forEach(a => {
      ctx.beginPath();
      ctx.moveTo(CX - a.x*0.9, CY - a.y*0.9);
      ctx.lineTo(CX + a.x, CY + a.y);
      ctx.strokeStyle = a.c; ctx.lineWidth = 0.8;
      ctx.setLineDash([3,4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = a.c; ctx.font = '11px Inter';
      ctx.fillText(a.lbl, CX + a.x + 5, CY + a.y + 4);
    });

    // Poles
    ctx.fillStyle = 'rgba(34,211,238,0.9)';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText('|0⟩', CX + 4, CY - R - 6);
    ctx.fillText('|1⟩', CX + 4, CY + R + 14);

    // State
    const sx = CX + R * Math.sin(theta) * Math.cos(phi);
    const sy = CY - R * Math.cos(theta);

    // Projection lines
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(sx, CY);
    ctx.strokeStyle = 'rgba(124,58,237,0.2)'; ctx.lineWidth = 0.8;
    ctx.setLineDash([2,3]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx, CY); ctx.lineTo(sx, sy);
    ctx.stroke(); ctx.setLineDash([]);

    // Vector
    const vg = ctx.createLinearGradient(CX, CY, sx, sy);
    vg.addColorStop(0, '#7c3aed'); vg.addColorStop(1, '#06b6d4');
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(sx, sy);
    ctx.strokeStyle = vg; ctx.lineWidth = 2.5; ctx.stroke();

    // Arrow
    const ang = Math.atan2(sy - CY, sx - CX);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - 12*Math.cos(ang-0.4), sy - 12*Math.sin(ang-0.4));
    ctx.lineTo(sx - 12*Math.cos(ang+0.4), sy - 12*Math.sin(ang+0.4));
    ctx.closePath(); ctx.fillStyle = '#22d3ee'; ctx.fill();

    // Glow
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 18);
    glow.addColorStop(0, 'rgba(6,182,212,0.5)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(sx, sy, 18, 0, Math.PI * 2);
    ctx.fillStyle = glow; ctx.fill();
    ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#22d3ee'; ctx.fill();

    ctx.fillStyle = 'rgba(167,139,250,0.9)';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText('|ψ⟩', sx + 8, sy - 6);
  }

  function tick() {
    if (animating) {
      t += 0.018;
      theta = Math.PI / 4 + Math.sin(t * 0.6) * 0.6;
      phi = t * 0.8;
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  tick();

  return {
    setAngles(th, ph) { theta = th; phi = ph; },
    setTheta(v) { theta = v; draw(); },
    setPhi(v) { phi = v; draw(); },
    stopAnim() { animating = false; },
    startAnim() { animating = true; },
    destroy() { cancelAnimationFrame(raf); }
  };
};
