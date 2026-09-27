/* ============================================================
   QUANTUMLAB — VIRTUAL LABS LANDING PAGE ENGINE
   virtual-labs-landing.js
   
   Responsibilities:
   - Hero Bloch sphere + quantum state animation
   - Background particle field
   - Lab metadata & card rendering
   - Per-card live canvas previews (algorithm-specific)
   - Search + category filtering with smooth transitions
   - Scroll-reveal animations
   ============================================================ */

'use strict';

window.VL = window.VL || {};

/* ============================================================
   1. LAB METADATA CATALOG
   15 laboratories with routing, categories, preview configs
   ============================================================ */
VL.labs = [
  {
    id: 'qsvm',
    number: '01',
    title: 'Quantum Support Vector Machines',
    shortTitle: 'QSVM',
    category: 'Quantum Machine Learning',
    catClass: 'qml',
    difficulty: 'Advanced',
    diffClass: 'advanced',
    time: '35 min',
    description: 'Classify non-linearly separable data using quantum feature maps and quantum kernel matrices computed in Hilbert space.',
    concept: 'Quantum Kernels • Feature Maps • SVM Optimization',
    route: 'virtual-labs/qsvm.html',
    preview: 'qsvm',
    searchTerms: 'classification machine learning kernel hilbert space support vector'
  },
  {
    id: 'shor-factorization',
    number: '02',
    title: "Shor's Factorization Algorithm",
    shortTitle: "Shor's",
    category: 'Number Theory & Cryptography',
    catClass: 'number',
    difficulty: 'Expert',
    diffClass: 'expert',
    time: '45 min',
    description: 'Factor composite integers in polynomial time using quantum period-finding, modular exponentiation, and continued fractions.',
    concept: 'Order Finding • QFT • Modular Arithmetic',
    route: 'virtual-labs/shor-factorization.html',
    preview: 'shor',
    searchTerms: 'factorization rsa cryptography period order modular exponentiation'
  },
  {
    id: 'qft',
    number: '03',
    title: 'Quantum Fourier Transform',
    shortTitle: 'QFT',
    category: 'Fundamentals & Primitives',
    catClass: 'fundamentals',
    difficulty: 'Intermediate',
    diffClass: 'intermediate',
    time: '30 min',
    description: 'Execute the quantum analog of the DFT. Watch waveforms transform from time-domain to frequency-domain with phase rotation gates.',
    concept: 'Phase Rotation • Controlled R_k Gates • Frequency Analysis',
    route: 'virtual-labs/qft.html',
    preview: 'qft',
    searchTerms: 'fourier transform frequency domain phase rotation hadamard'
  },
  {
    id: 'qpe',
    number: '04',
    title: 'Quantum Phase Estimation',
    shortTitle: 'QPE',
    category: 'Fundamentals & Primitives',
    catClass: 'fundamentals',
    difficulty: 'Advanced',
    diffClass: 'advanced',
    time: '35 min',
    description: 'Estimate eigenphases of unitary operators with high precision. Observe Bloch sphere state vector evolution under phase kickback.',
    concept: 'Eigenphases • Phase Kickback • Bloch Sphere',
    route: 'virtual-labs/qpe.html',
    preview: 'bloch',
    searchTerms: 'phase estimation eigenvalue unitary operator eigenphase bloch sphere'
  },
  {
    id: 'vqe',
    number: '05',
    title: 'Variational Quantum Eigensolver',
    shortTitle: 'VQE',
    category: 'Quantum Simulation & Chemistry',
    catClass: 'simulation',
    difficulty: 'Advanced',
    diffClass: 'advanced',
    time: '40 min',
    description: 'Minimize molecular ground-state energies using a parameterized ansatz circuit and classical optimizer on the energy landscape.',
    concept: 'Variational Principle • Energy Minimization • Ansatz',
    route: 'virtual-labs/vqe.html',
    preview: 'energy',
    searchTerms: 'energy minimization ground state chemistry molecular variational ansatz optimizer'
  },
  {
    id: 'qaoa',
    number: '06',
    title: 'Quantum Approximate Optimization',
    shortTitle: 'QAOA',
    category: 'Optimization',
    catClass: 'optimization',
    difficulty: 'Advanced',
    diffClass: 'advanced',
    time: '40 min',
    description: 'Solve combinatorial optimization problems on quantum hardware. Watch graph nodes change state as the cost Hamiltonian minimizes.',
    concept: 'Cost Hamiltonian • Mixer Operators • MaxCut',
    route: 'virtual-labs/qaoa.html',
    preview: 'qaoa',
    searchTerms: 'optimization combinatorial maxcut graph hamiltonian mixer variational'
  },
  {
    id: 'grover',
    number: '07',
    title: "Grover's Search Algorithm",
    shortTitle: 'Grover',
    category: 'Search',
    catClass: 'search',
    difficulty: 'Intermediate',
    diffClass: 'intermediate',
    time: '28 min',
    description: 'Search an unsorted database with quadratic speedup. Watch amplitude amplification highlight target states through oracle reflections.',
    concept: 'Oracle • Amplitude Amplification • Diffusion Operator',
    route: 'virtual-labs/grover.html',
    preview: 'grover',
    searchTerms: 'search database unstructured amplitude amplification oracle quadratic speedup'
  },
  {
    id: 'qnn',
    number: '08',
    title: 'Quantum Neural Networks',
    shortTitle: 'QNN',
    category: 'Quantum Deep Learning',
    catClass: 'dl',
    difficulty: 'Expert',
    diffClass: 'expert',
    time: '45 min',
    description: 'Build parameterized quantum circuits as neural networks. Visualize quantum layer activations and observe parameter-shift gradient training.',
    concept: 'Parameterized Circuits • Gradient Descent • Quantum Layers',
    route: 'virtual-labs/qnn.html',
    preview: 'qnn',
    searchTerms: 'neural network deep learning parameterized circuit training gradient'
  },
  {
    id: 'qka',
    number: '09',
    title: 'Quantum Kernel Alignment',
    shortTitle: 'QKA',
    category: 'Quantum Machine Learning',
    catClass: 'qml',
    difficulty: 'Expert',
    diffClass: 'expert',
    time: '40 min',
    description: 'Optimize quantum kernel alignment to maximize correlation between kernel and ideal target matrix using kernel-target alignment score.',
    concept: 'Kernel Alignment • Similarity Matrices • KTA Score',
    route: 'virtual-labs/qka.html',
    preview: 'kernel',
    searchTerms: 'kernel alignment quantum machine learning similarity matrix feature'
  },
  {
    id: 'qpca',
    number: '10',
    title: 'Quantum Principal Component Analysis',
    shortTitle: 'qPCA',
    category: 'Quantum Machine Learning',
    catClass: 'qml',
    difficulty: 'Advanced',
    diffClass: 'advanced',
    time: '35 min',
    description: 'Perform dimensionality reduction via quantum density matrix exponentiation. Visualize eigenvectors and eigenvalue extraction.',
    concept: 'Density Matrix • Eigenvalues • Dimensionality Reduction',
    route: 'virtual-labs/qpca.html',
    preview: 'pca',
    searchTerms: 'principal component analysis dimensionality reduction eigenvectors density matrix'
  },
  {
    id: 'hhl',
    number: '11',
    title: 'HHL Algorithm',
    shortTitle: 'HHL',
    category: 'Fundamentals & Primitives',
    catClass: 'fundamentals',
    difficulty: 'Expert',
    diffClass: 'expert',
    time: '45 min',
    description: 'Solve systems of linear equations exponentially faster than classical methods. Observe quantum state evolution during matrix inversion.',
    concept: 'Phase Estimation • Eigenvalue Inversion • Linear Systems',
    route: 'virtual-labs/hhl.html',
    preview: 'hhl',
    searchTerms: 'linear equations system matrix inversion exponential speedup'
  },
  {
    id: 'deutsch-jozsa',
    number: '12',
    title: 'Deutsch-Jozsa Algorithm',
    shortTitle: 'D-J',
    category: 'Fundamentals & Primitives',
    catClass: 'fundamentals',
    difficulty: 'Beginner',
    diffClass: 'beginner',
    time: '20 min',
    description: 'Determine if a function is constant or balanced with a single query. Witness the first provable quantum speedup through oracle interference.',
    concept: 'Oracle • Interference • Quantum Parallelism',
    route: 'virtual-labs/deutsch-jozsa.html',
    preview: 'dj',
    searchTerms: 'oracle constant balanced function quantum advantage interference superposition'
  },
  {
    id: 'bernstein-vazirani',
    number: '13',
    title: 'Bernstein-Vazirani Algorithm',
    shortTitle: 'B-V',
    category: 'Quantum Information',
    catClass: 'info',
    difficulty: 'Beginner',
    diffClass: 'beginner',
    time: '20 min',
    description: 'Extract a hidden bit-string from a black-box oracle in a single query using quantum superposition and phase kickback.',
    concept: 'Hidden String • Phase Kickback • Quantum Query Complexity',
    route: 'virtual-labs/bernstein-vazirani.html',
    preview: 'bv',
    searchTerms: 'hidden string bitstring oracle single query quantum query complexity'
  },
  {
    id: 'quantum-teleportation',
    number: '14',
    title: 'Quantum Teleportation',
    shortTitle: 'Teleportation',
    category: 'Quantum Information',
    catClass: 'info',
    difficulty: 'Intermediate',
    diffClass: 'intermediate',
    time: '25 min',
    description: 'Transmit an arbitrary quantum state from Alice to Bob using an entangled pair and two classical bits. No physical particle transfer.',
    concept: 'Entanglement • Bell Measurement • Classical Communication',
    route: 'virtual-labs/quantum-teleportation.html',
    preview: 'teleportation',
    searchTerms: 'teleportation alice bob entanglement bell state classical communication'
  },
  {
    id: 'qae',
    number: '15',
    title: 'Quantum Amplitude Estimation',
    shortTitle: 'QAE',
    category: 'Quantum Machine Learning',
    catClass: 'qml',
    difficulty: 'Advanced',
    diffClass: 'advanced',
    time: '35 min',
    description: 'Estimate the probability amplitude of a quantum state with quadratic speedup over classical Monte Carlo sampling using amplitude amplification.',
    concept: 'Amplitude Amplification • Monte Carlo • Phase Estimation',
    route: 'virtual-labs/qae.html',
    preview: 'qae',
    searchTerms: 'amplitude estimation probability monte carlo sampling speedup'
  }
];

/* ============================================================
   2. HERO BLOCH SPHERE + QUANTUM FIELD ANIMATION
   ============================================================ */
(function initHeroViz() {
  const canvas = document.getElementById('vl-hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const CX = W / 2;
  const CY = H / 2;
  const R = Math.min(W, H) * 0.32;

  let t = 0;

  // State vector angles
  let theta = Math.PI / 4;  // polar
  let phi = 0;              // azimuthal
  const dTheta = 0.004;
  const dPhi = 0.009;

  // Orbit particles
  const particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      angle: Math.random() * Math.PI * 2,
      radius: R * (0.7 + 0.5 * Math.random()),
      speed: (0.002 + 0.004 * Math.random()) * (Math.random() > 0.5 ? 1 : -1),
      size: 0.8 + 2.2 * Math.random(),
      alpha: 0.2 + 0.4 * Math.random(),
      tiltX: (Math.random() - 0.5) * 1.2,
      tiltY: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '#7c3aed' : '#06b6d4'
    });
  }

  function drawBlochSphere() {
    ctx.clearRect(0, 0, W, H);

    // Outer glow
    const grd = ctx.createRadialGradient(CX, CY, 0, CX, CY, R * 1.6);
    grd.addColorStop(0, 'rgba(124,58,237,0.08)');
    grd.addColorStop(0.5, 'rgba(59,130,246,0.04)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Sphere surface
    const sphereGrad = ctx.createRadialGradient(CX - R * 0.25, CY - R * 0.2, 0, CX, CY, R);
    sphereGrad.addColorStop(0, 'rgba(124,58,237,0.08)');
    sphereGrad.addColorStop(0.6, 'rgba(59,130,246,0.05)');
    sphereGrad.addColorStop(1, 'rgba(6,182,212,0.08)');
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // Sphere outline
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(124,58,237,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Latitude circles (faded)
    for (let lat = 1; lat < 4; lat++) {
      const latAngle = (lat / 4) * Math.PI;
      const ry = Math.abs(Math.sin(latAngle));
      const yOff = Math.cos(latAngle) * R;
      ctx.beginPath();
      ctx.ellipse(CX, CY + yOff, R * ry, R * ry * 0.15, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100,120,200,0.12)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Equator
    ctx.beginPath();
    ctx.ellipse(CX, CY, R, R * 0.18, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100,120,200,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Longitude arc (vertical)
    ctx.beginPath();
    ctx.ellipse(CX, CY, R * 0.15, R, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100,120,200,0.12)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Axes
    const axisAlpha = 0.4;
    // Z axis
    drawAxis(CX, CY - R * 1.15, CX, CY + R * 1.15, `rgba(167,139,250,${axisAlpha})`);
    drawAxisLabel(CX, CY - R * 1.25, '|0⟩', '#a78bfa');
    drawAxisLabel(CX, CY + R * 1.3, '|1⟩', '#a78bfa');
    // X axis
    drawAxis(CX - R * 1.12, CY, CX + R * 1.12, CY, `rgba(103,232,249,${axisAlpha * 0.6})`);
    drawAxisLabel(CX + R * 1.2, CY, '|+⟩', '#67e8f9');
    // Y axis (implied)

    // State vector
    const sx = CX + R * Math.sin(theta) * Math.cos(phi);
    const sy = CY - R * Math.cos(theta);

    // Vector trail glow
    const trailGrad = ctx.createLinearGradient(CX, CY, sx, sy);
    trailGrad.addColorStop(0, 'rgba(124,58,237,0)');
    trailGrad.addColorStop(0.4, 'rgba(124,58,237,0.4)');
    trailGrad.addColorStop(1, 'rgba(6,182,212,0.9)');
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // State point glow
    const ptGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
    ptGrad.addColorStop(0, 'rgba(6,182,212,1)');
    ptGrad.addColorStop(0.4, 'rgba(6,182,212,0.5)');
    ptGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(sx, sy, 12, 0, Math.PI * 2);
    ctx.fillStyle = ptGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // State label
    const cosHalf = Math.cos(theta / 2);
    const sinHalf = Math.sin(theta / 2);
    const alpha0 = (cosHalf * cosHalf * 100).toFixed(0);
    const alpha1 = (sinHalf * sinHalf * 100).toFixed(0);
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.9)';
    ctx.textAlign = 'left';
    ctx.fillText(`|ψ⟩: ${alpha0}%|0⟩ + ${alpha1}%|1⟩`, sx + 10, sy - 5);

    // Particles
    particles.forEach(p => {
      p.angle += p.speed;
      const px = CX + p.radius * Math.cos(p.angle) * Math.cos(p.tiltX);
      const py = CY + p.radius * Math.sin(p.angle) * p.tiltY;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace(')', `,${p.alpha})`).replace('rgb', 'rgba');
      ctx.fill();
    });

    // Probability bars (mini)
    drawProbBars(CX - R - 40, CY + R + 20, alpha0, alpha1);
  }

  function drawAxis(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawAxisLabel(x, y, text, color) {
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  }

  function drawProbBars(x, y, p0, p1) {
    const barW = 120;
    const barH = 6;
    const gap = 16;

    // Label
    ctx.font = '500 9px Inter, sans-serif';
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.textAlign = 'left';
    ctx.fillText('MEASUREMENT PROBABILITY', x, y);

    // |0⟩ bar
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.roundRect(x, y + 8, barW, barH, 3);
    ctx.fill();
    const g0 = ctx.createLinearGradient(x, 0, x + barW, 0);
    g0.addColorStop(0, '#7c3aed');
    g0.addColorStop(1, '#a78bfa');
    ctx.fillStyle = g0;
    ctx.roundRect(x, y + 8, barW * (p0 / 100), barH, 3);
    ctx.fill();
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'left';
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillText(`|0⟩ ${p0}%`, x + barW + 6, y + 13);

    // |1⟩ bar
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.roundRect(x, y + 8 + gap, barW, barH, 3);
    ctx.fill();
    const g1 = ctx.createLinearGradient(x, 0, x + barW, 0);
    g1.addColorStop(0, '#06b6d4');
    g1.addColorStop(1, '#67e8f9');
    ctx.fillStyle = g1;
    ctx.roundRect(x, y + 8 + gap, barW * (p1 / 100), barH, 3);
    ctx.fill();
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(`|1⟩ ${p1}%`, x + barW + 6, y + 8 + gap + 5);
  }

  function animate() {
    t += 0.016;
    theta = Math.PI / 2 + Math.sin(t * dTheta * 60) * Math.PI * 0.45;
    phi = t * dPhi * 60;
    drawBlochSphere();
    requestAnimationFrame(animate);
  }

  animate();
})();

/* ============================================================
   3. BACKGROUND PARTICLE FIELD
   ============================================================ */
(function initParticleField() {
  const canvas = document.getElementById('vl-particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  const pts = [];
  const NUM = 80;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    pts.length = 0;
    for (let i = 0; i < NUM; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.35
      });
    }
  }

  function drawField() {
    ctx.clearRect(0, 0, W, H);

    // Connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.06 * (1 - d / 120)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Points
    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124,58,237,${p.alpha})`;
      ctx.fill();
    });
  }

  function loop() {
    drawField();
    requestAnimationFrame(loop);
  }

  resize();
  init();
  loop();
  window.addEventListener('resize', () => { resize(); init(); });
})();

/* ============================================================
   4. CARD PREVIEW VISUALIZATIONS
   Each algorithm gets a unique live canvas animation
   ============================================================ */
const VizRenderers = {};

VizRenderers.qsvm = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  // Pre-generate stable data points for QSVM
  const innerPts = [], outerPts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r = 0.28 + 0.04 * Math.sin(i * 3.1);
    innerPts.push({
      bx: W/2 + r * W * 0.45 * Math.cos(a),
      by: H/2 + r * H * 0.45 * Math.sin(a)
    });
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const r = 0.7 + 0.04 * Math.cos(i * 2.7);
    outerPts.push({
      bx: W/2 + r * W * 0.45 * Math.cos(a),
      by: H/2 + r * H * 0.45 * Math.sin(a)
    });
  }

  return function draw() {
    ctx.clearRect(0, 0, W, H);

    // Dark bg
    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2);
    bg.addColorStop(0, '#060d1e');
    bg.addColorStop(1, '#020714');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Decision boundary (animated ellipse)
    const bRadius = W * 0.43 + Math.sin(t * 0.5) * 4;
    ctx.beginPath();
    ctx.ellipse(W/2, H/2, bRadius * 0.52, bRadius * 0.52, t * 0.1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(6,182,212,0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner class (violet)
    innerPts.forEach((p, i) => {
      const px = p.bx + Math.sin(t * 0.6 + i) * 1.5;
      const py = p.by + Math.cos(t * 0.6 + i * 1.3) * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa';
      ctx.fill();
    });

    // Outer class (cyan)
    outerPts.forEach((p, i) => {
      const px = p.bx + Math.sin(t * 0.5 + i * 0.8) * 1.5;
      const py = p.by + Math.cos(t * 0.5 + i) * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#67e8f9';
      ctx.fill();
    });

    // Label
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(103,232,249,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('QUANTUM DECISION BOUNDARY', W/2, H - 10);

    t += 0.03;
  };
};

VizRenderers.shor = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;
  const seq = [1, 7, 4, 13, 1, 7, 4, 13, 1, 7, 4, 13];  // 7^x mod 15

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const barW = (W - 40) / seq.length;
    const maxVal = 15;

    // Animated highlight sweeping
    const hlIdx = Math.floor(t * 1.5) % seq.length;

    seq.forEach((v, i) => {
      const x = 20 + i * barW;
      const h = (v / maxVal) * (H - 60);
      const y = H - 35 - h;

      const isHL = i === hlIdx;
      const grad = ctx.createLinearGradient(0, y, 0, H - 35);
      grad.addColorStop(0, isHL ? '#7c3aed' : 'rgba(124,58,237,0.4)');
      grad.addColorStop(1, isHL ? '#06b6d4' : 'rgba(6,182,212,0.2)');

      ctx.fillStyle = grad;
      ctx.roundRect(x + 2, y, barW - 4, h, 3);
      ctx.fill();

      if (isHL) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#7c3aed';
        ctx.roundRect(x + 2, y, barW - 4, h, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.font = '600 8px "JetBrains Mono", monospace';
      ctx.fillStyle = isHL ? '#fff' : 'rgba(148,163,184,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(v, x + barW / 2, H - 20);
    });

    // Label
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(124,58,237,0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('PERIODIC SEQUENCE: 7ˣ mod 15  [period r=4]', W/2, 16);

    t += 0.04;
  };
};

VizRenderers.qft = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const midY = H / 2;
    const blend = (Math.sin(t * 0.4) + 1) / 2;  // 0 = time domain, 1 = freq domain

    // Time domain wave
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const f = Math.sin(x * 0.05 + t) * 0.4 + Math.sin(x * 0.12 + t * 0.7) * 0.3 + Math.sin(x * 0.03 + t * 1.2) * 0.3;
      const y = midY + f * 35 * (1 - blend);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(167,139,250,${1 - blend * 0.8})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Frequency domain (spikes)
    if (blend > 0.1) {
      const freqs = [0.05, 0.12, 0.03];
      freqs.forEach((f, i) => {
        const x = (f / 0.2) * W * 0.7 + W * 0.1;
        const spikeH = 60 * blend * (i === 0 ? 0.6 : i === 1 ? 0.9 : 0.4);
        const grad = ctx.createLinearGradient(0, midY - spikeH, 0, midY);
        grad.addColorStop(0, 'rgba(6,182,212,0.9)');
        grad.addColorStop(1, 'rgba(6,182,212,0.1)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 3, midY - spikeH, 6, spikeH);
      });
    }

    // Arrow label
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(6,182,212,0.6)';
    ctx.fillText(blend < 0.5 ? 'TIME DOMAIN' : 'FREQUENCY DOMAIN', W/2, H - 10);

    t += 0.04;
  };
};

VizRenderers.bloch = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const CX = W / 2, CY = H / 2;
  const R = Math.min(W, H) * 0.35;
  let t = 0;

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    // Sphere
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(124,58,237,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Equator
    ctx.beginPath();
    ctx.ellipse(CX, CY, R, R * 0.2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(124,58,237,0.15)';
    ctx.stroke();

    // State vector
    const theta = Math.PI / 3 + Math.sin(t * 0.5) * 0.8;
    const phi = t * 0.8;
    const sx = CX + R * Math.sin(theta) * Math.cos(phi);
    const sy = CY - R * Math.cos(theta);

    const grad = ctx.createLinearGradient(CX, CY, sx, sy);
    grad.addColorStop(0, 'rgba(124,58,237,0.3)');
    grad.addColorStop(1, 'rgba(6,182,212,1)');
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();

    // Labels
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(167,139,250,0.8)';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', CX, CY - R - 8);
    ctx.fillText('|1⟩', CX, CY + R + 14);

    ctx.fillStyle = 'rgba(6,182,212,0.5)';
    ctx.fillText('BLOCH SPHERE STATE VECTOR', W/2, H - 8);

    t += 0.04;
  };
};

VizRenderers.energy = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;
  let optX = 0.5, optY = 0.5;  // optimizer position

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    // Energy landscape heatmap
    const imageData = ctx.createImageData(W, H);
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H - 20; y++) {
        const nx = x / W;
        const ny = y / (H - 20);
        const e = Math.sin(nx * Math.PI * 3) * Math.cos(ny * Math.PI * 2.5) * 0.5 +
                  Math.cos((nx - 0.3) * Math.PI * 4) * 0.3 +
                  Math.sin((ny - 0.4) * Math.PI * 3) * 0.2;
        const norm = (e + 1) / 2;
        const idx = (y * W + x) * 4;
        // Blue → purple → yellow → red
        if (norm < 0.3) {
          imageData.data[idx] = 6; imageData.data[idx+1] = 70; imageData.data[idx+2] = 120;
        } else if (norm < 0.5) {
          imageData.data[idx] = 90; imageData.data[idx+1] = 40; imageData.data[idx+2] = 140;
        } else if (norm < 0.75) {
          imageData.data[idx] = 180; imageData.data[idx+1] = 80; imageData.data[idx+2] = 60;
        } else {
          imageData.data[idx] = 240; imageData.data[idx+1] = 160; imageData.data[idx+2] = 30;
        }
        imageData.data[idx+3] = 200;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Optimizer path
    optX = 0.38 + Math.sin(t * 0.15) * 0.12;
    optY = 0.45 + Math.cos(t * 0.12) * 0.1;
    const px = optX * W, py = optY * (H - 20);

    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#7c3aed';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('VQE ENERGY LANDSCAPE', W/2, H - 6);

    t += 0.04;
  };
};

VizRenderers.qaoa = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  // Graph nodes for MaxCut
  const nodes = [
    { x: W*0.25, y: H*0.3 },
    { x: W*0.5, y: H*0.15 },
    { x: W*0.75, y: H*0.3 },
    { x: W*0.75, y: H*0.65 },
    { x: W*0.5, y: H*0.8 },
    { x: W*0.25, y: H*0.65 },
  ];
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4]];

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const cutAssignment = nodes.map((_, i) => Math.sin(t * 0.3 + i * 1.2) > 0);

    // Draw edges
    edges.forEach(([a, b]) => {
      const cut = cutAssignment[a] !== cutAssignment[b];
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.strokeStyle = cut ? 'rgba(6,182,212,0.6)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = cut ? 2 : 1;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((n, i) => {
      const s0 = cutAssignment[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = s0 ? '#7c3aed' : '#06b6d4';
      ctx.fill();
      ctx.font = '700 8px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(s0 ? '|0⟩' : '|1⟩', n.x, n.y + 3);
    });

    const cutEdges = edges.filter(([a, b]) => cutAssignment[a] !== cutAssignment[b]).length;
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(`MAXCUT: ${cutEdges}/${edges.length} EDGES CUT`, W/2, H - 8);

    t += 0.04;
  };
};

VizRenderers.grover = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;
  const N = 8;
  const targetIdx = 3;

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const iter = Math.floor(t * 0.5) % 5;
    const barMaxH = H - 50;
    const barW = (W - 40) / N;

    // Amplitude bars
    for (let i = 0; i < N; i++) {
      let amp;
      if (i === targetIdx) {
        amp = Math.min(0.95, 0.1 + iter * 0.22 + Math.sin(t * 0.3) * 0.05);
      } else {
        amp = Math.max(0.02, 0.12 - iter * 0.02 - Math.sin(t * 0.3 + i) * 0.01);
      }
      const h = amp * barMaxH;
      const x = 20 + i * barW;
      const y = H - 30 - h;

      const isTarget = i === targetIdx;
      const grad = ctx.createLinearGradient(0, y, 0, H - 30);
      grad.addColorStop(0, isTarget ? '#06b6d4' : 'rgba(124,58,237,0.5)');
      grad.addColorStop(1, isTarget ? 'rgba(6,182,212,0.1)' : 'rgba(124,58,237,0.1)');

      if (isTarget) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#06b6d4';
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y, barW - 4, h);
      ctx.shadowBlur = 0;

      ctx.font = '600 8px monospace';
      ctx.fillStyle = isTarget ? '#67e8f9' : 'rgba(148,163,184,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(`|${i}⟩`, x + barW/2, H - 16);
    }

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(`AMPLITUDE AMPLIFICATION — ITER ${iter + 1}`, W/2, 14);

    t += 0.04;
  };
};

VizRenderers.qnn = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  const layers = [3, 4, 4, 2];

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const lx = layers.map((_, li) => (li + 1) / (layers.length + 1) * W);

    // Draw connections
    for (let li = 0; li < layers.length - 1; li++) {
      for (let ni = 0; ni < layers[li]; ni++) {
        const ny = (ni + 1) / (layers[li] + 1) * (H - 30);
        for (let nj = 0; nj < layers[li+1]; nj++) {
          const ny2 = (nj + 1) / (layers[li+1] + 1) * (H - 30);
          const alpha = 0.04 + 0.05 * Math.abs(Math.sin(t * 0.5 + ni + nj * 0.7));
          ctx.beginPath();
          ctx.moveTo(lx[li], ny);
          ctx.lineTo(lx[li+1], ny2);
          ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Activation pulses
    const progress = (t * 0.5) % layers.length;
    const activeLayer = Math.floor(progress);
    if (activeLayer < layers.length) {
      for (let ni = 0; ni < layers[activeLayer]; ni++) {
        const ny = (ni + 1) / (layers[activeLayer] + 1) * (H - 30);
        const pulseFrac = progress - activeLayer;
        const r = 5 + pulseFrac * 6;
        const a = (1 - pulseFrac) * 0.5;
        ctx.beginPath();
        ctx.arc(lx[activeLayer], ny, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6,182,212,${a})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Draw nodes
    layers.forEach((n, li) => {
      for (let ni = 0; ni < n; ni++) {
        const ny = (ni + 1) / (n + 1) * (H - 30);
        const activation = Math.max(0, Math.sin(t * 0.4 + li * 0.8 + ni * 1.1));
        const r = 7 + activation * 3;
        ctx.beginPath();
        ctx.arc(lx[li], ny, r, 0, Math.PI * 2);
        ctx.fillStyle = li === 0 ? '#7c3aed' : li === layers.length-1 ? '#06b6d4' : `rgba(124,58,237,${0.5 + activation * 0.5})`;
        ctx.fill();
      }
    });

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('PARAMETERIZED QUANTUM CIRCUIT', W/2, H - 8);

    t += 0.035;
  };
};

VizRenderers.kernel = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;
  const N = 8;

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const cellW = (W - 20) / N;
    const cellH = (H - 35) / N;
    const offsetX = 10, offsetY = 10;

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const val = i === j ? 1.0 :
          (Math.abs(i - j) <= 1 ? 0.7 + Math.sin(t * 0.3 + i * j) * 0.15 :
           0.2 + Math.sin(t * 0.2 + i + j) * 0.1);
        const v = Math.max(0, Math.min(1, val));

        const r = Math.floor(v * 124);
        const g = Math.floor(v * 58);
        const b = Math.floor(100 + v * 155);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(offsetX + j * cellW + 1, offsetY + i * cellH + 1, cellW - 2, cellH - 2);
      }
    }

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(167,139,250,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('QUANTUM KERNEL MATRIX (8×8)', W/2, H - 8);

    t += 0.04;
  };
};

VizRenderers.pca = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;
  const CX = W/2, CY = H/2;

  const points = [];
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const r = 0.2 + 0.15 * Math.random();
    points.push({ bx: r * Math.cos(angle) + 0.1, by: r * Math.sin(angle) * 0.4 + 0.05, c: Math.random() > 0.5 });
  }

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const compressionFactor = (Math.sin(t * 0.3) + 1) / 2;

    // Principal component arrow
    const pcLen = 80;
    ctx.beginPath();
    ctx.moveTo(CX - pcLen, CY);
    ctx.lineTo(CX + pcLen, CY);
    ctx.strokeStyle = 'rgba(6,182,212,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Data cloud (compressing to 1D)
    points.forEach(p => {
      const fullX = CX + p.bx * W * 0.4;
      const fullY = CY + p.by * H * 0.6;
      const projX = CX + p.bx * W * 0.4;
      const projY = CY;
      const x = fullX + (projX - fullX) * compressionFactor;
      const y = fullY + (projY - fullY) * compressionFactor;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.c ? '#a78bfa' : '#67e8f9';
      ctx.fill();
    });

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(compressionFactor > 0.5 ? 'PROJECTING TO PRINCIPAL AXIS' : 'HIGH-DIM DATA CLOUD', W/2, H - 8);

    t += 0.035;
  };
};

VizRenderers.hhl = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const n = 4;
    const cellW = (W - 30) / n;
    const cellH = (H - 35) / n;

    // Matrix A visualization
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = i === j ? 1.0 - (i * 0.15) : Math.sin(t * 0.2 + i + j) * 0.3;
        const alpha = Math.abs(val);
        ctx.fillStyle = val > 0 ? `rgba(124,58,237,${alpha * 0.8})` : `rgba(6,182,212,${alpha * 0.8})`;
        ctx.roundRect(15 + j * cellW + 2, 10 + i * cellH + 2, cellW - 4, cellH - 4, 3);
        ctx.fill();

        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(val.toFixed(2), 15 + j * cellW + cellW/2, 10 + i * cellH + cellH/2 + 3);
      }
    }

    // Solution vector arrow
    const solveFrac = (Math.sin(t * 0.4) + 1) / 2;
    ctx.font = '600 9px monospace';
    ctx.fillStyle = `rgba(6,182,212,${solveFrac})`;
    ctx.textAlign = 'center';
    ctx.fillText('Ax = b  →  x = A⁻¹b', W/2, H - 8);

    t += 0.04;
  };
};

VizRenderers.dj = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const isBalanced = Math.sin(t * 0.2) > 0;
    const mid = H / 2;

    // Wires
    ['|+⟩', '|+⟩', '|-⟩'].forEach((label, i) => {
      const y = mid - 25 + i * 25;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(W - 20, y);
      ctx.strokeStyle = 'rgba(124,58,237,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(167,139,250,0.8)';
      ctx.textAlign = 'left';
      ctx.fillText(label, 2, y + 4);
    });

    // Oracle box
    ctx.fillStyle = isBalanced ? 'rgba(124,58,237,0.25)' : 'rgba(6,182,212,0.25)';
    ctx.strokeStyle = isBalanced ? 'rgba(124,58,237,0.6)' : 'rgba(6,182,212,0.6)';
    ctx.lineWidth = 1.5;
    ctx.roundRect(W/2 - 30, mid - 42, 60, 70, 5);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 8px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Uf', W/2, mid - 10);
    ctx.font = '500 7px monospace';
    ctx.fillStyle = isBalanced ? '#a78bfa' : '#67e8f9';
    ctx.fillText(isBalanced ? 'BALANCED' : 'CONSTANT', W/2, mid + 6);

    // Result
    const resultAlpha = Math.max(0, Math.sin(t * 0.3 - 1));
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(${isBalanced ? '167,139,250' : '103,232,249'},${resultAlpha})`;
    ctx.textAlign = 'center';
    ctx.fillText(isBalanced ? '→ OUTPUT: |1⟩ (BALANCED)' : '→ OUTPUT: |0⟩ (CONSTANT)', W/2, H - 10);

    t += 0.04;
  };
};

VizRenderers.bv = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;
  const hiddenString = [1, 0, 1, 1, 0];

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const revealProgress = (Math.sin(t * 0.25) + 1) / 2;
    const n = hiddenString.length;
    const bw = (W - 30) / n;

    hiddenString.forEach((b, i) => {
      const x = 15 + i * bw;
      const revealed = revealProgress > (i / n);

      ctx.fillStyle = revealed ?
        (b ? 'rgba(124,58,237,0.6)' : 'rgba(6,182,212,0.4)') :
        'rgba(255,255,255,0.05)';
      ctx.strokeStyle = revealed ?
        (b ? 'rgba(167,139,250,0.8)' : 'rgba(103,232,249,0.8)') :
        'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.roundRect(x + 4, H/2 - 25, bw - 8, 50, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = `700 ${revealed ? 16 : 10}px "JetBrains Mono", monospace`;
      ctx.fillStyle = revealed ? '#fff' : 'rgba(255,255,255,0.2)';
      ctx.textAlign = 'center';
      ctx.fillText(revealed ? b.toString() : '?', x + bw/2, H/2 + 6);
    });

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN BIT-STRING EXTRACTION', W/2, H - 8);

    t += 0.04;
  };
};

VizRenderers.teleportation = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const CY = H / 2;
    const progress = (t * 0.3) % 1;

    // Alice zone
    ctx.fillStyle = 'rgba(124,58,237,0.08)';
    ctx.fillRect(0, 0, W * 0.42, H - 20);
    ctx.font = '700 9px monospace';
    ctx.fillStyle = 'rgba(167,139,250,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('ALICE', W * 0.21, 14);

    // Bob zone
    ctx.fillStyle = 'rgba(6,182,212,0.08)';
    ctx.fillRect(W * 0.58, 0, W * 0.42, H - 20);
    ctx.fillStyle = 'rgba(103,232,249,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('BOB', W * 0.79, 14);

    // Entanglement line
    ctx.beginPath();
    ctx.moveTo(W * 0.42, CY);
    ctx.lineTo(W * 0.58, CY);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // State particle (Alice → Bob)
    const px = W * 0.15 + progress * W * 0.7;
    const py = CY + Math.sin(progress * Math.PI * 2) * 20;
    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, 10);
    pGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
    pGrad.addColorStop(0.4, 'rgba(124,58,237,0.6)');
    pGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = pGrad;
    ctx.fill();

    // Entangled pair
    ctx.beginPath();
    ctx.arc(W * 0.38, CY + 20, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#7c3aed';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W * 0.62, CY + 20, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('QUANTUM STATE TELEPORTATION', W/2, H - 6);

    t += 0.04;
  };
};

VizRenderers.qae = function(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;
  const trueAmplitude = 0.35;

  return function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020714';
    ctx.fillRect(0, 0, W, H);

    const N = 16;
    const barW = (W - 30) / N;
    const maxH = H - 45;

    for (let i = 0; i < N; i++) {
      const freq = i / N;
      const amplitude = Math.exp(-15 * Math.pow(freq - trueAmplitude, 2)) *
                        (1 + Math.sin(t * 0.3 + i) * 0.1);
      const h = amplitude * maxH * 0.85;
      const x = 15 + i * barW;

      const isPeak = Math.abs(freq - trueAmplitude) < 1.5 / N;
      if (isPeak) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#06b6d4';
      }
      const grad = ctx.createLinearGradient(0, H - 30 - h, 0, H - 30);
      grad.addColorStop(0, isPeak ? '#06b6d4' : 'rgba(124,58,237,0.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, H - 30 - h, barW - 2, h);
      ctx.shadowBlur = 0;
    }

    // Estimated value annotation
    ctx.beginPath();
    ctx.moveTo(15 + trueAmplitude * (W - 30), H - 30);
    ctx.lineTo(15 + trueAmplitude * (W - 30), 15);
    ctx.strokeStyle = 'rgba(6,182,212,0.4)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(6,182,212,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(`ESTIMATED AMPLITUDE: ${trueAmplitude.toFixed(2)}`, W/2, H - 8);

    t += 0.04;
  };
};

/* ============================================================
   5. CARD RENDERING
   ============================================================ */
VL.renderCards = function() {
  const grid = document.getElementById('vl-lab-grid');
  if (!grid) return;

  grid.innerHTML = VL.labs.map(lab => `
    <div class="vl-lab-card vl-anim-hidden" 
         id="vl-card-${lab.id}"
         data-category="${lab.category}"
         data-search="${lab.title.toLowerCase()} ${lab.searchTerms} ${lab.category.toLowerCase()}"
         onclick="VL.navigateLab('${lab.route}')">
      
      <!-- Visualization Preview -->
      <div class="vl-card-viz">
        <canvas id="vl-viz-${lab.id}" width="400" height="200"></canvas>
        <div class="vl-card-viz__overlay"></div>
        <div class="vl-card-number">${lab.number}</div>
      </div>

      <!-- Card Body -->
      <div class="vl-card-body">
        <div class="vl-card-meta">
          <span class="vl-card-category vl-cat--${lab.catClass}">${lab.category}</span>
          <span class="vl-card-difficulty vl-diff--${lab.diffClass}">
            <span class="vl-diff-dot"></span>
            ${lab.difficulty}
          </span>
        </div>

        <h3 class="vl-card-title">${lab.title}</h3>
        <p class="vl-card-desc">${lab.description}</p>

        <div class="vl-card-footer">
          <div class="vl-card-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ${lab.time}
          </div>
          <a class="vl-start-btn" href="${lab.route}">
            Start Lab
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `).join('');

  // Init all card preview canvases
  VL.labs.forEach(lab => {
    const canvas = document.getElementById(`vl-viz-${lab.id}`);
    if (!canvas) return;
    const previewType = lab.preview;
    const renderer = VizRenderers[previewType];
    if (!renderer) return;

    const drawFn = renderer(canvas);
    let raf;
    let active = false;

    // Only animate when visible (IntersectionObserver for performance)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          active = true;
          function loop() {
            if (!active) return;
            drawFn();
            raf = requestAnimationFrame(loop);
          }
          loop();
        } else {
          active = false;
          cancelAnimationFrame(raf);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(canvas);
  });

  // Scroll reveal
  VL.initScrollReveal();
};

/* ============================================================
   6. FILTERING & SEARCH
   ============================================================ */
VL.initFilters = function() {
  const filterPills = document.querySelectorAll('.vl-filter-pill');
  const searchInput = document.getElementById('vl-search');
  let activeCategory = 'all';
  let searchQuery = '';

  function applyFilters() {
    const cards = document.querySelectorAll('.vl-lab-card');
    let visible = 0;

    cards.forEach(card => {
      const category = card.dataset.category || '';
      const searchText = card.dataset.search || '';

      const catMatch = activeCategory === 'all' || category === activeCategory;
      const searchMatch = !searchQuery || searchText.includes(searchQuery);

      if (catMatch && searchMatch) {
        card.removeAttribute('data-hidden');
        visible++;
      } else {
        card.setAttribute('data-hidden', 'true');
      }
    });

    const count = document.getElementById('vl-visible-count');
    if (count) count.textContent = visible;

    const empty = document.getElementById('vl-empty');
    if (empty) empty.classList.toggle('visible', visible === 0);
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.toLowerCase().trim();
      applyFilters();
    });
  }
};

/* ============================================================
   7. SCROLL REVEAL
   ============================================================ */
VL.initScrollReveal = function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('vl-anim-visible');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.vl-anim-hidden').forEach(el => observer.observe(el));
};

/* ============================================================
   8. NAVIGATION
   ============================================================ */
VL.navigateLab = function(route) {
  window.location.href = route;
};

/* ============================================================
   9. BOOTSTRAP
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  VL.renderCards();
  VL.initFilters();
  VL.initScrollReveal();

  // Hero scroll hint
  document.querySelector('.vl-btn--primary[href="#vl-labs"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('vl-labs')?.scrollIntoView({ behavior: 'smooth' });
  });
});
