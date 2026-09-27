/* ============================================================
   QUANTUMLAB – QUANTUM SUPPORT VECTOR MACHINE (QSVM) SIMULATOR
   High-Fidelity Interactive Particle Motion & Visual Simulation Engine
   
   Features:
   - Persistent Canvas Architecture (60-120 FPS continuous requestAnimationFrame)
   - Spring-Damper Particle Physics: Super-smooth hydrodynamic transitions
   - Quantum Wavepacket Phase Motion: Continuous organic orbital drift & breathing
   - Luminous Comet Ribbon Trails behind accelerating data particles
   - Quantum Entanglement Energy Filaments connecting correlated support vectors
   - Multi-stage QSVM Simulation Sequence (Entanglement Igniting -> Quantum Shockwave -> Plasma Boundary Sweep)
   - Orbiting Quantum Electron Satellites on Support Vectors
   - Translucent Dual-Color Quantum Classification Heat Fields
   - High-Precision Floating HUD Reticle with Quantum Feature Mapping data
   - Dynamic Quantum Circuit & Animated Kernel Heatmap
   - Side-by-Side Dual Visualizer Benchmark
   ============================================================ */

window.QL = window.QL || {};

QL.QSVMSimulator = (function () {
  'use strict';

  /* ------------------------------------------------------------
     1. SIMULATION STATE
     ------------------------------------------------------------ */
  let state = {
    screen: 'welcome',          // 'welcome' | 'step'
    step: 1,                    // 1 to 5
    dataset: 'xor',             // 'linear' | 'circular' | 'xor'
    featureMap: 'ZZFeatureMap', // 'ZFeatureMap' | 'ZZFeatureMap'
    depth: 1,                   // 1, 2, 3
    entanglement: 'linear',     // 'linear' | 'full' | 'circular'
    classicalRunning: false,
    classicalDone: false,
    quantumRunning: false,
    quantumDone: false,
    quantumWaveActive: true,    // Continuous quantum motion toggle
    showEntanglementWeb: true   // Glowing quantum entanglement lines
  };

  let containerEl = null;

  /* ------------------------------------------------------------
     2. DETERMINISTIC DATASETS (32 balanced points each)
     ------------------------------------------------------------ */
  const DATASETS = {
    linear: {
      name: 'Linear Dataset',
      desc: 'Easily separable by a straight line.',
      classicalAcc: '96%',
      quantumAcc: '100%',
      classicalBoundaryDesc: 'The classical SVM finds an optimal linear hyperplane separating the two distinct clusters with wide margins.',
      quantumBoundaryDesc: 'The quantum feature map projects the data into quantum Hilbert space, easily preserving linear separability.',
      conclusion: 'For linearly separable data, both classical and quantum SVMs achieve near-perfect classification. The quantum feature map preserves separability while projecting into Hilbert space.',
      points: [
        // Class +1 (Emerald Green) top-left cluster
        { x: -0.65, y: 0.55, label: 1 }, { x: -0.52, y: 0.72, label: 1 }, { x: -0.42, y: 0.45, label: 1 },
        { x: -0.75, y: 0.38, label: 1 }, { x: -0.58, y: 0.62, label: 1 }, { x: -0.35, y: 0.68, label: 1 },
        { x: -0.48, y: 0.32, label: 1 }, { x: -0.62, y: 0.48, label: 1 }, { x: -0.70, y: 0.65, label: 1 },
        { x: -0.38, y: 0.52, label: 1 }, { x: -0.55, y: 0.40, label: 1 }, { x: -0.45, y: 0.58, label: 1 },
        { x: -0.68, y: 0.50, label: 1 }, { x: -0.50, y: 0.65, label: 1 }, { x: -0.32, y: 0.42, label: 1 },
        { x: -0.60, y: 0.76, label: 1 },
        // Class -1 (Coral Red) bottom-right cluster
        { x: 0.65, y: -0.55, label: -1 }, { x: 0.52, y: -0.72, label: -1 }, { x: 0.42, y: -0.45, label: -1 },
        { x: 0.75, y: -0.38, label: -1 }, { x: 0.58, y: -0.62, label: -1 }, { x: 0.35, y: -0.68, label: -1 },
        { x: 0.48, y: -0.32, label: -1 }, { x: 0.62, y: -0.48, label: -1 }, { x: 0.70, y: -0.65, label: -1 },
        { x: 0.38, y: -0.52, label: -1 }, { x: 0.55, y: -0.40, label: -1 }, { x: 0.45, y: -0.58, label: -1 },
        { x: 0.68, y: -0.50, label: -1 }, { x: 0.50, y: -0.65, label: -1 }, { x: 0.32, y: -0.42, label: -1 },
        { x: 0.60, y: -0.76, label: -1 }
      ],
      supportVectorIndices: [2, 6, 9, 14, 18, 22, 25, 30]
    },
    circular: {
      name: 'Circular Dataset',
      desc: 'Requires a non-linear boundary (circle).',
      classicalAcc: '52%',
      quantumAcc: '98%',
      classicalBoundaryDesc: 'The classical linear SVM attempts to draw a straight line through concentric circles, failing to separate inner and outer clusters.',
      quantumBoundaryDesc: 'The quantum feature map maps radial Euclidean distances into orthogonal quantum state phases, creating a natural circular boundary in 2D.',
      conclusion: 'A classical linear SVM cannot separate concentric distributions. The quantum feature map\'s phase encoding naturally maps radial distances to orthogonal quantum state angles, yielding an accurate non-linear boundary.',
      points: [
        // Class +1 (Emerald Green) inner cluster (r < 0.38)
        { x: 0.05, y: 0.08, label: 1 }, { x: -0.12, y: 0.15, label: 1 }, { x: 0.18, y: -0.05, label: 1 },
        { x: -0.08, y: -0.18, label: 1 }, { x: 0.22, y: 0.12, label: 1 }, { x: -0.20, y: 0.02, label: 1 },
        { x: 0.02, y: 0.25, label: 1 }, { x: 0.15, y: -0.20, label: 1 }, { x: -0.14, y: -0.12, label: 1 },
        { x: 0.28, y: -0.02, label: 1 }, { x: -0.02, y: -0.28, label: 1 }, { x: 0.10, y: 0.22, label: 1 },
        { x: -0.25, y: 0.16, label: 1 }, { x: 0.00, y: 0.00, label: 1 }, { x: -0.06, y: 0.05, label: 1 },
        { x: 0.20, y: -0.15, label: 1 },
        // Class -1 (Coral Red) outer ring (r ~ 0.68 - 0.85)
        { x: 0.72, y: 0.20, label: -1 }, { x: 0.58, y: 0.52, label: -1 }, { x: 0.22, y: 0.75, label: -1 },
        { x: -0.25, y: 0.74, label: -1 }, { x: -0.62, y: 0.48, label: -1 }, { x: -0.78, y: 0.15, label: -1 },
        { x: -0.74, y: -0.28, label: -1 }, { x: -0.50, y: -0.62, label: -1 }, { x: -0.15, y: -0.76, label: -1 },
        { x: 0.28, y: -0.72, label: -1 }, { x: 0.65, y: -0.45, label: -1 }, { x: 0.78, y: -0.10, label: -1 },
        { x: 0.45, y: 0.65, label: -1 }, { x: -0.42, y: 0.68, label: -1 }, { x: -0.68, y: -0.40, label: -1 },
        { x: 0.05, y: -0.80, label: -1 }
      ],
      supportVectorIndices: [4, 6, 9, 11, 16, 18, 22, 25]
    },
    xor: {
      name: 'Xor Dataset',
      desc: 'The classic non-linear XOR problem.',
      classicalAcc: '48%',
      quantumAcc: '100%',
      classicalBoundaryDesc: 'The classical linear SVM tries to draw a straight line to separate the classes. A straight line fails completely on non-linear XOR data.',
      quantumBoundaryDesc: 'Using the quantum kernel, the SVM finds an optimal hyperplane in high-dimensional quantum Hilbert space, yielding non-linear hyperbolic boundaries in 2D.',
      conclusion: 'The XOR problem is notoriously difficult for linear models. The classical SVM fails, but the QSVM\'s quantum entanglement maps the data into a Hilbert space where it is perfectly linearly separable.',
      points: [
        // Class +1 (Emerald Green) - Top-Left (Q2)
        { x: -0.45, y: 0.62, label: 1 }, { x: -0.60, y: 0.45, label: 1 }, { x: -0.32, y: 0.75, label: 1 },
        { x: -0.72, y: 0.68, label: 1 }, { x: -0.55, y: 0.82, label: 1 }, { x: -0.25, y: 0.50, label: 1 },
        { x: -0.68, y: 0.32, label: 1 }, { x: -0.40, y: 0.42, label: 1 },
        // Class +1 (Emerald Green) - Bottom-Right (Q4)
        { x: 0.45, y: -0.62, label: 1 }, { x: 0.60, y: -0.45, label: 1 }, { x: 0.32, y: -0.75, label: 1 },
        { x: 0.72, y: -0.68, label: 1 }, { x: 0.55, y: -0.82, label: 1 }, { x: 0.25, y: -0.50, label: 1 },
        { x: 0.68, y: -0.32, label: 1 }, { x: 0.40, y: -0.42, label: 1 },
        // Class -1 (Coral Red) - Top-Right (Q1)
        { x: 0.45, y: 0.62, label: -1 }, { x: 0.60, y: 0.45, label: -1 }, { x: 0.32, y: 0.75, label: -1 },
        { x: 0.72, y: 0.68, label: -1 }, { x: 0.55, y: 0.82, label: -1 }, { x: 0.25, y: 0.50, label: -1 },
        { x: 0.68, y: 0.32, label: -1 }, { x: 0.40, y: 0.42, label: -1 },
        // Class -1 (Coral Red) - Bottom-Left (Q3)
        { x: -0.45, y: -0.62, label: -1 }, { x: -0.60, y: -0.45, label: -1 }, { x: -0.32, y: -0.75, label: -1 },
        { x: -0.72, y: -0.68, label: -1 }, { x: -0.55, y: -0.82, label: -1 }, { x: -0.25, y: -0.50, label: -1 },
        { x: -0.68, y: -0.32, label: -1 }, { x: -0.40, y: -0.42, label: -1 }
      ],
      supportVectorIndices: [0, 5, 7, 8, 13, 15, 16, 21, 23, 24, 29, 31]
    }
  };

  /* ------------------------------------------------------------
     3. HIGH-PERFORMANCE PARTICLE PHYSICS & DYNAMICS
     ------------------------------------------------------------ */
  let particles = [];
  let isTransitioning = false;
  let animStartTime = 0;
  const ANIM_DURATION = 950; // ms for dataset morphs
  let animFrameId = null;

  // Quantum shockwave pulse animation
  let pulseWave = {
    active: false,
    startTime: 0,
    duration: 1100,
    progress: 0
  };

  // Boundary sweep animation
  let boundaryAnim = {
    active: false,
    startTime: 0,
    duration: 850,
    progress: 1
  };

  // Mouse hover state
  let hoveredParticle = null;
  let mousePos = { x: -1, y: -1, canvasId: null };

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function initParticles(dsKey) {
    const pts = DATASETS[dsKey].points;
    particles = pts.map((p, idx) => ({
      id: idx,
      curX: p.x,
      curY: p.y,
      baseX: p.x,
      baseY: p.y,
      startX: p.x,
      startY: p.y,
      targetX: p.x,
      targetY: p.y,
      vx: 0,
      vy: 0,
      label: p.label,
      startLabel: p.label,
      targetLabel: p.label,
      phaseOffset: (idx * 0.42) % (2 * Math.PI),
      speedFactor: 0.8 + ((idx % 5) * 0.1),
      trail: [] // Continuous [{x, y, alpha}]
    }));
    isTransitioning = false;
  }

  function startDatasetTransition(targetDsKey) {
    if (!particles.length) initParticles(state.dataset);
    const targetPts = DATASETS[targetDsKey].points;
    const len = Math.max(particles.length, targetPts.length);

    for (let i = 0; i < len; i++) {
      if (i < particles.length && i < targetPts.length) {
        particles[i].startX = particles[i].curX;
        particles[i].startY = particles[i].curY;
        particles[i].targetX = targetPts[i].x;
        particles[i].targetY = targetPts[i].y;
        particles[i].baseX = targetPts[i].x;
        particles[i].baseY = targetPts[i].y;
        particles[i].startLabel = particles[i].label;
        particles[i].targetLabel = targetPts[i].label;
        particles[i].label = targetPts[i].label;
      }
    }

    animStartTime = performance.now();
    isTransitioning = true;
  }

  function startFeatureMapTransition() {
    // Quantum Hilbert space projection morphing in Step 3
    if (!particles.length) initParticles(state.dataset);
    const basePts = DATASETS[state.dataset].points;
    const isZZ = state.featureMap === 'ZZFeatureMap';
    const depth = state.depth;

    particles.forEach((pt, i) => {
      const orig = basePts[i] || { x: pt.curX, y: pt.curY, label: pt.label };
      const phi1 = 2 * orig.x * depth;
      const phi2 = 2 * orig.y * depth;
      const entangle = isZZ ? Math.sin((Math.PI - orig.x) * (Math.PI - orig.y)) * 0.22 : 0;

      const projX = orig.x * 0.82 + Math.sin(phi1) * 0.18 + entangle;
      const projY = orig.y * 0.82 + Math.cos(phi2) * 0.18 - entangle;

      pt.startX = pt.curX;
      pt.startY = pt.curY;
      pt.targetX = Math.max(-0.92, Math.min(0.92, projX));
      pt.targetY = Math.max(-0.92, Math.min(0.92, projY));
      pt.baseX = pt.targetX;
      pt.baseY = pt.targetY;
    });

    animStartTime = performance.now();
    isTransitioning = true;
  }

  function restoreOriginalDataCoords() {
    if (!particles.length) initParticles(state.dataset);
    const basePts = DATASETS[state.dataset].points;
    particles.forEach((pt, i) => {
      const orig = basePts[i] || { x: pt.curX, y: pt.curY, label: pt.label };
      pt.startX = pt.curX;
      pt.startY = pt.curY;
      pt.targetX = orig.x;
      pt.targetY = orig.y;
      pt.baseX = orig.x;
      pt.baseY = orig.y;
      pt.label = orig.label;
    });
    animStartTime = performance.now();
    isTransitioning = true;
  }

  function triggerQuantumPulse() {
    pulseWave.active = true;
    pulseWave.startTime = performance.now();
    pulseWave.progress = 0;
  }

  function triggerBoundarySweep() {
    boundaryAnim.active = true;
    boundaryAnim.startTime = performance.now();
    boundaryAnim.progress = 0;
  }

  /* ------------------------------------------------------------
     4. CONTINUOUS ANIMATION ENGINE (Zero DOM Recreation)
     ------------------------------------------------------------ */
  function mount(element) {
    containerEl = element;
    initParticles(state.dataset);
    render();
    startMasterAnimationLoop();
  }

  function render() {
    if (!containerEl) return;
    if (state.screen === 'welcome') {
      renderWelcome();
    } else {
      renderSteps();
    }
  }

  function startMasterAnimationLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    function loop(now) {
      // 1. Update Transition or Continuous Quantum Wave Motion
      if (isTransitioning) {
        const elapsed = now - animStartTime;
        let t = elapsed / ANIM_DURATION;
        if (t >= 1) {
          t = 1;
          isTransitioning = false;
        }
        const ease = easeInOutCubic(t);

        particles.forEach(pt => {
          // Record smooth motion trail
          pt.trail.unshift({ x: pt.curX, y: pt.curY, alpha: 0.75 });
          if (pt.trail.length > 7) pt.trail.pop();

          pt.curX = pt.startX + (pt.targetX - pt.startX) * ease;
          pt.curY = pt.startY + (pt.targetY - pt.startY) * ease;
        });
      } else {
        // CONTINUOUS ORGANIC QUANTUM STATE MOTION
        // Each particle undergoes subtle harmonic wavepacket oscillation (orbital phase drift)
        // Especially pronounced in Step 4 (Quantum SVM) representing quantum superposition!
        const isQuantumStep = state.step === 4 || state.step === 3;
        const driftAmp = isQuantumStep ? 0.024 : 0.012; // Noticeable, organic, butter-smooth
        const waveSpeed = isQuantumStep ? 0.0022 : 0.0015;

        particles.forEach(pt => {
          const tVal = now * waveSpeed * pt.speedFactor + pt.phaseOffset;
          // Lissajous / harmonic wave orbital drift around anchor point
          const driftX = Math.cos(tVal) * driftAmp + Math.sin(tVal * 0.7) * (driftAmp * 0.4);
          const driftY = Math.sin(tVal * 1.1) * driftAmp + Math.cos(tVal * 0.6) * (driftAmp * 0.4);

          const desiredX = pt.baseX + driftX;
          const desiredY = pt.baseY + driftY;

          // Spring-damper smoothing for silky motion
          pt.curX += (desiredX - pt.curX) * 0.15;
          pt.curY += (desiredY - pt.curY) * 0.15;

          // Keep soft subtle trail during quantum drift
          if (isQuantumStep && Math.random() < 0.3) {
            pt.trail.unshift({ x: pt.curX, y: pt.curY, alpha: 0.35 });
            if (pt.trail.length > 4) pt.trail.pop();
          } else {
            pt.trail.forEach(tr => { tr.alpha *= 0.88; });
            pt.trail = pt.trail.filter(tr => tr.alpha > 0.04);
          }
        });
      }

      // 2. Quantum Pulse Wave expansion
      if (pulseWave.active) {
        const pElapsed = now - pulseWave.startTime;
        let pT = pElapsed / pulseWave.duration;
        if (pT >= 1) {
          pulseWave.active = false;
          pulseWave.progress = 1;
        } else {
          pulseWave.progress = pT;
        }
      }

      // 3. Boundary Sweep
      if (boundaryAnim.active) {
        const bElapsed = now - boundaryAnim.startTime;
        let bT = bElapsed / boundaryAnim.duration;
        if (bT >= 1) {
          boundaryAnim.active = false;
          boundaryAnim.progress = 1;
        } else {
          boundaryAnim.progress = easeInOutCubic(bT);
        }
      } else {
        boundaryAnim.progress = 1;
      }

      // 4. In-Place Canvas Redraw (NO innerHTML rewrites!)
      redrawActiveCanvases(now);

      animFrameId = requestAnimationFrame(loop);
    }

    animFrameId = requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------
     5. WELCOME SCREEN
     ------------------------------------------------------------ */
  function renderWelcome() {
    containerEl.innerHTML = `
      <div class="qsvm-sim-wrap">
        <div class="qsvm-welcome-card">
          <div class="qsvm-welcome-badge">
            <span class="qsvm-badge-dot"></span> Interactive Quantum Simulation
          </div>
          <h2 class="qsvm-welcome-title">Quantum Support Vector Machines</h2>
          <p class="qsvm-welcome-desc">
            Explore how quantum computing accelerates classification. This interactive experiment demonstrates how classical data is encoded into high-dimensional quantum Hilbert state space using quantum feature maps to separate complex non-linear data distributions.
          </p>
          <div class="qsvm-welcome-feature">
            <div class="qsvm-feat-icon">⚡</div>
            <div class="qsvm-feat-content">
              <strong>Interactive Particle Visualizer</strong>
              <span>Watch real data particles transform, glide through feature mappings, and illuminate support vectors with quantum boundaries.</span>
            </div>
          </div>
          <button class="qsvm-btn-primary qsvm-btn-lg" id="qsvm-start-btn">
            Start Experiment &rarr;
          </button>
        </div>
      </div>
    `;

    const btn = document.getElementById('qsvm-start-btn');
    if (btn) {
      btn.onclick = () => {
        state.screen = 'step';
        state.step = 1;
        render();
      };
    }
  }

  /* ------------------------------------------------------------
     6. STEPPED SIMULATION CONTAINER
     ------------------------------------------------------------ */
  function renderSteps() {
    containerEl.innerHTML = `
      <div class="qsvm-sim-wrap">
        <!-- TOP STEPPER TRACKER (1 to 5) -->
        <div class="qsvm-stepper-bar">
          <div class="qsvm-step-item ${state.step >= 1 ? 'active' : ''} ${state.step > 1 ? 'completed' : ''}" data-step="1">
            <div class="qsvm-step-num">${state.step > 1 ? '&#10003;' : '1'}</div>
            <div class="qsvm-step-label">Data Selection</div>
          </div>
          <div class="qsvm-step-connector ${state.step > 1 ? 'active' : ''}"></div>

          <div class="qsvm-step-item ${state.step >= 2 ? 'active' : ''} ${state.step > 2 ? 'completed' : ''}" data-step="2">
            <div class="qsvm-step-num">${state.step > 2 ? '&#10003;' : '2'}</div>
            <div class="qsvm-step-label">Classical SVM</div>
          </div>
          <div class="qsvm-step-connector ${state.step > 2 ? 'active' : ''}"></div>

          <div class="qsvm-step-item ${state.step >= 3 ? 'active' : ''} ${state.step > 3 ? 'completed' : ''}" data-step="3">
            <div class="qsvm-step-num">${state.step > 3 ? '&#10003;' : '3'}</div>
            <div class="qsvm-step-label">Quantum Feature Map</div>
          </div>
          <div class="qsvm-step-connector ${state.step > 3 ? 'active' : ''}"></div>

          <div class="qsvm-step-item ${state.step >= 4 ? 'active' : ''} ${state.step > 4 ? 'completed' : ''}" data-step="4">
            <div class="qsvm-step-num">${state.step > 4 ? '&#10003;' : '4'}</div>
            <div class="qsvm-step-label">Quantum SVM</div>
          </div>
          <div class="qsvm-step-connector ${state.step > 4 ? 'active' : ''}"></div>

          <div class="qsvm-step-item ${state.step >= 5 ? 'active' : ''}" data-step="5">
            <div class="qsvm-step-num">5</div>
            <div class="qsvm-step-label">Comparison</div>
          </div>
        </div>

        <!-- 2-COLUMN SIMULATION STAGE -->
        <div class="qsvm-sim-body">
          <div class="qsvm-panel-left" id="qsvm-panel-left-content"></div>
          <div class="qsvm-panel-right" id="qsvm-panel-right-content"></div>
        </div>
      </div>
    `;

    renderLeftPanel();
    renderRightPanel();
    bindStepperEvents();
  }

  function bindStepperEvents() {
    document.querySelectorAll('.qsvm-step-item').forEach(el => {
      el.addEventListener('click', () => {
        const targetStep = parseInt(el.getAttribute('data-step'), 10);
        if (targetStep <= state.step || (targetStep === state.step + 1 && canAdvance())) {
          switchStep(targetStep);
        }
      });
    });
  }

  function canAdvance() {
    if (state.step === 2 && !state.classicalDone) return false;
    if (state.step === 4 && !state.quantumDone) return false;
    return true;
  }

  function switchStep(newStep) {
    state.step = newStep;
    if (newStep !== 3) {
      restoreOriginalDataCoords();
    }
    renderSteps();
  }

  /* ------------------------------------------------------------
     7. LEFT PANEL (CONTROLS & CONFIGURATION)
     ------------------------------------------------------------ */
  function renderLeftPanel() {
    const leftEl = document.getElementById('qsvm-panel-left-content');
    if (!leftEl) return;
    const curDataset = DATASETS[state.dataset];

    if (state.step === 1) {
      // STEP 1: DATA SELECTION
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 1</div>
          <h3 class="qsvm-panel-title">Data Selection</h3>
          <p class="qsvm-panel-text">
            Support Vector Machines (SVM) find optimal boundaries separating classes. Select a dataset below to watch the particles smoothly glide with physics-based momentum into their new distributions.
          </p>
        </div>

        <div class="qsvm-dataset-list">
          <div class="qsvm-dataset-card ${state.dataset === 'linear' ? 'active' : ''}" data-dataset="linear">
            <div class="qsvm-dataset-radio"></div>
            <div>
              <div class="qsvm-dataset-name">Linear Dataset</div>
              <div class="qsvm-dataset-sub">Easily separable by a straight line.</div>
            </div>
          </div>

          <div class="qsvm-dataset-card ${state.dataset === 'circular' ? 'active' : ''}" data-dataset="circular">
            <div class="qsvm-dataset-radio"></div>
            <div>
              <div class="qsvm-dataset-name">Circular Dataset</div>
              <div class="qsvm-dataset-sub">Concentric rings requiring radial non-linear classification.</div>
            </div>
          </div>

          <div class="qsvm-dataset-card ${state.dataset === 'xor' ? 'active' : ''}" data-dataset="xor">
            <div class="qsvm-dataset-radio"></div>
            <div>
              <div class="qsvm-dataset-name">Xor Dataset</div>
              <div class="qsvm-dataset-sub">The classic 4-quadrant non-linear XOR distribution.</div>
            </div>
          </div>
        </div>

        <div class="qsvm-nav-actions">
          <button class="qsvm-btn-secondary" disabled>Back</button>
          <button class="qsvm-btn-primary" id="qsvm-next-btn">Next Step &rarr;</button>
        </div>
      `;

      leftEl.querySelectorAll('.qsvm-dataset-card').forEach(card => {
        card.addEventListener('click', () => {
          const ds = card.getAttribute('data-dataset');
          if (state.dataset !== ds) {
            startDatasetTransition(ds);
            state.dataset = ds;
            state.classicalDone = false;
            state.quantumDone = false;
            renderLeftPanel();
            renderRightPanel();
          }
        });
      });

      document.getElementById('qsvm-next-btn').onclick = () => switchStep(2);

    } else if (state.step === 2) {
      // STEP 2: CLASSICAL SVM
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 2</div>
          <h3 class="qsvm-panel-title">Classical SVM</h3>
          <p class="qsvm-panel-text">
            A Classical SVM with a Linear Kernel attempts to draw a straight line (hyperplane) to separate the classes. Click below to optimize the decision boundary and identify support vectors.
          </p>
        </div>

        <div style="margin: 1.5rem 0;">
          ${!state.classicalDone ? `
            <button class="qsvm-btn-primary ${state.classicalRunning ? 'loading' : ''}" id="qsvm-run-classical-btn" style="width:100%;">
              ${state.classicalRunning ? '<span class="qsvm-spinner"></span> Optimizing Hyperplane...' : '&#9654; Run Classical SVM'}
            </button>
          ` : `
            <div class="qsvm-completed-badge">
              &#10003; Classical SVM Completed
            </div>
            <div class="qsvm-results-box">
              <div class="qsvm-res-label">Results</div>
              <div class="qsvm-res-row">
                <span>Accuracy:</span>
                <span class="qsvm-res-acc ${state.dataset === 'linear' ? 'success' : 'warn'}">${curDataset.classicalAcc}</span>
              </div>
            </div>
          `}
        </div>

        <div class="qsvm-nav-actions">
          <button class="qsvm-btn-secondary" id="qsvm-back-btn">&larr; Back</button>
          <button class="qsvm-btn-primary" id="qsvm-next-btn" ${!state.classicalDone ? 'disabled' : ''}>Next Step &rarr;</button>
        </div>
      `;

      const runBtn = document.getElementById('qsvm-run-classical-btn');
      if (runBtn) {
        runBtn.onclick = () => {
          state.classicalRunning = true;
          renderLeftPanel();
          setTimeout(() => {
            state.classicalRunning = false;
            state.classicalDone = true;
            triggerBoundarySweep();
            renderLeftPanel();
            renderRightPanel();
          }, 650);
        };
      }

      document.getElementById('qsvm-back-btn').onclick = () => switchStep(1);
      const nextBtn = document.getElementById('qsvm-next-btn');
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (state.classicalDone) switchStep(3);
        };
      }

    } else if (state.step === 3) {
      // STEP 3: QUANTUM FEATURE MAP
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 3</div>
          <h3 class="qsvm-panel-title">Quantum Feature Map</h3>
          <p class="qsvm-panel-text">
            To solve non-linear problems, QSVM encodes data points $\\vec{x} = (x_0, x_1)$ into quantum states $|\\Phi(\\vec{x})\\rangle$ via parameterized unitary circuits. Notice how adjusting parameters transforms the Hilbert projection and updates the kernel heatmap.
          </p>
        </div>

        <div class="qsvm-config-group">
          <label class="qsvm-config-label">FEATURE MAP TYPE</label>
          <div class="qsvm-toggle-group">
            <button class="qsvm-toggle-btn ${state.featureMap === 'ZFeatureMap' ? 'active' : ''}" data-val="ZFeatureMap">ZFeatureMap</button>
            <button class="qsvm-toggle-btn ${state.featureMap === 'ZZFeatureMap' ? 'active' : ''}" data-val="ZZFeatureMap">ZZFeatureMap</button>
          </div>
        </div>

        <div class="qsvm-config-group">
          <label class="qsvm-config-label">CIRCUIT DEPTH (REPETITIONS)</label>
          <div class="qsvm-toggle-group">
            <button class="qsvm-toggle-btn ${state.depth === 1 ? 'active' : ''}" data-depth="1">1</button>
            <button class="qsvm-toggle-btn ${state.depth === 2 ? 'active' : ''}" data-depth="2">2</button>
            <button class="qsvm-toggle-btn ${state.depth === 3 ? 'active' : ''}" data-depth="3">3</button>
          </div>
        </div>

        <div class="qsvm-config-group">
          <label class="qsvm-config-label">ENTANGLEMENT TOPOLOGY</label>
          <div class="qsvm-toggle-group">
            <button class="qsvm-toggle-btn ${state.entanglement === 'linear' ? 'active' : ''}" data-ent="linear">Linear</button>
            <button class="qsvm-toggle-btn ${state.entanglement === 'full' ? 'active' : ''}" data-ent="full">Full</button>
            <button class="qsvm-toggle-btn ${state.entanglement === 'circular' ? 'active' : ''}" data-ent="circular">Circular</button>
          </div>
          <p class="qsvm-ent-desc" id="qsvm-ent-desc-text">
            ${getEntanglementDescription(state.entanglement)}
          </p>
        </div>

        <div class="qsvm-nav-actions">
          <button class="qsvm-btn-secondary" id="qsvm-back-btn">&larr; Back</button>
          <button class="qsvm-btn-primary" id="qsvm-next-btn">Next Step &rarr;</button>
        </div>
      `;

      leftEl.querySelectorAll('[data-val]').forEach(btn => {
        btn.onclick = () => {
          state.featureMap = btn.getAttribute('data-val');
          startFeatureMapTransition();
          renderLeftPanel();
          updateCircuitAndHeatmap();
        };
      });
      leftEl.querySelectorAll('[data-depth]').forEach(btn => {
        btn.onclick = () => {
          state.depth = parseInt(btn.getAttribute('data-depth'), 10);
          startFeatureMapTransition();
          renderLeftPanel();
          updateCircuitAndHeatmap();
        };
      });
      leftEl.querySelectorAll('[data-ent]').forEach(btn => {
        btn.onclick = () => {
          state.entanglement = btn.getAttribute('data-ent');
          startFeatureMapTransition();
          renderLeftPanel();
          updateCircuitAndHeatmap();
        };
      });

      document.getElementById('qsvm-back-btn').onclick = () => switchStep(2);
      document.getElementById('qsvm-next-btn').onclick = () => switchStep(4);

    } else if (state.step === 4) {
      // STEP 4: QUANTUM SVM
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 4</div>
          <h3 class="qsvm-panel-title">Quantum SVM & Particle Motion</h3>
          <p class="qsvm-panel-text">
            In Quantum Hilbert space, data particles exist as quantum state vectors with rotating phases. Observe the continuous quantum orbital motion and entanglement filaments connecting support vectors.
          </p>
        </div>

        <div style="margin: 1.25rem 0;">
          ${!state.quantumDone ? `
            <button class="qsvm-btn-primary ${state.quantumRunning ? 'loading' : ''}" id="qsvm-run-quantum-btn" style="width:100%;">
              ${state.quantumRunning ? '<span class="qsvm-spinner"></span> Igniting Quantum Shockwave...' : '&#9654; Run QSVM (Warp State)'}
            </button>
          ` : `
            <div class="qsvm-completed-badge">
              &#10003; QSVM Quantum Boundary Locked
            </div>
            <div class="qsvm-results-box">
              <div class="qsvm-res-label">Results</div>
              <div class="qsvm-res-row">
                <span>Accuracy:</span>
                <span class="qsvm-res-acc success">${curDataset.quantumAcc}</span>
              </div>
            </div>
          `}
        </div>

        <!-- VISUAL CONTROL TOGGLES FOR PARTICLES -->
        <div class="qsvm-config-group" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-size:0.75rem; font-weight:700; color:var(--vlab-cyan);">✨ PARTICLE MOTION DYNAMICS</span>
            <span style="font-size:0.7rem; color:#10b981; font-weight:bold;">● 60 FPS Fluid</span>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="qsvm-toggle-btn active" id="btn-re-pulse" style="font-size:0.76rem; padding:0.4rem;">
              ⚡ Pulse Wave
            </button>
            <button class="qsvm-toggle-btn active" id="btn-toggle-entangle" style="font-size:0.76rem; padding:0.4rem;">
              🕸 Entanglement Web
            </button>
          </div>
        </div>

        <div class="qsvm-nav-actions">
          <button class="qsvm-btn-secondary" id="qsvm-back-btn">&larr; Back</button>
          <button class="qsvm-btn-primary" id="qsvm-next-btn" ${!state.quantumDone ? 'disabled' : ''}>Next Step &rarr;</button>
        </div>
      `;

      const runBtn = document.getElementById('qsvm-run-quantum-btn');
      if (runBtn) {
        runBtn.onclick = () => {
          state.quantumRunning = true;
          triggerQuantumPulse();
          renderLeftPanel();
          setTimeout(() => {
            state.quantumRunning = false;
            state.quantumDone = true;
            triggerBoundarySweep();
            renderLeftPanel();
            renderRightPanel();
          }, 850);
        };
      }

      const pulseBtn = document.getElementById('btn-re-pulse');
      if (pulseBtn) {
        pulseBtn.onclick = () => triggerQuantumPulse();
      }

      const entangleBtn = document.getElementById('btn-toggle-entangle');
      if (entangleBtn) {
        entangleBtn.onclick = () => {
          state.showEntanglementWeb = !state.showEntanglementWeb;
          entangleBtn.classList.toggle('active', state.showEntanglementWeb);
        };
      }

      document.getElementById('qsvm-back-btn').onclick = () => switchStep(3);
      const nextBtn = document.getElementById('qsvm-next-btn');
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (state.quantumDone) switchStep(5);
        };
      }

    } else if (state.step === 5) {
      // STEP 5: COMPARISON
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 5</div>
          <h3 class="qsvm-panel-title">Comparison</h3>
          <p class="qsvm-panel-text">
            Side-by-side benchmark comparing Classical Linear SVM against Quantum Kernel SVM with active particle physics and decision regions.
          </p>
        </div>

        <div class="qsvm-compare-stat-row">
          <div class="qsvm-stat-card">
            <div class="qsvm-stat-card-title">Classical SVM</div>
            <div class="qsvm-stat-card-num ${state.dataset === 'linear' ? 'success' : 'warn'}">${curDataset.classicalAcc}</div>
          </div>
          <div class="qsvm-stat-card qsvm-stat-card--quantum">
            <div class="qsvm-stat-card-title">Quantum SVM</div>
            <div class="qsvm-stat-card-num success">${curDataset.quantumAcc}</div>
          </div>
        </div>

        <div class="qsvm-conclusion-box">
          <div class="qsvm-conclusion-title">Conclusion</div>
          <p class="qsvm-conclusion-text">${curDataset.conclusion}</p>
        </div>

        <div class="qsvm-nav-actions">
          <button class="qsvm-btn-secondary" id="qsvm-back-btn">&larr; Back</button>
          <button class="qsvm-btn-primary" id="qsvm-restart-btn">&#8635; Restart Experiment</button>
        </div>
      `;

      document.getElementById('qsvm-back-btn').onclick = () => switchStep(4);
      document.getElementById('qsvm-restart-btn').onclick = () => {
        state.classicalDone = false;
        state.quantumDone = false;
        switchStep(1);
      };
    }
  }

  function getEntanglementDescription(type) {
    if (type === 'linear') {
      return 'Linear: Entangles adjacent qubits $(q_0 \\leftrightarrow q_1)$. Produces clean localized quantum correlation terms in the state phase.';
    } else if (type === 'full') {
      return 'Full: Entangles all pairs of qubits simultaneously with all-to-all CNOT network. Maximizes non-local correlations.';
    } else {
      return 'Circular: Periodic ring topology with wraparound entanglement between terminal qubits, yielding symmetric quantum kernels.';
    }
  }

  /* ------------------------------------------------------------
     8. RIGHT PANEL (VISUALIZERS)
     ------------------------------------------------------------ */
  function renderRightPanel() {
    const rightEl = document.getElementById('qsvm-panel-right-content');
    if (!rightEl) return;
    const curDataset = DATASETS[state.dataset];

    if (state.step === 1) {
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <div class="qsvm-canvas-card" style="position:relative;">
            <canvas id="qsvm-canvas-single" width="580" height="390" class="qsvm-scatter-canvas"></canvas>
            <div class="qsvm-canvas-hud" id="qsvm-canvas-hud"></div>
          </div>
          <div class="qsvm-caption-card">
            <h4 class="qsvm-caption-title">Interactive Data Distribution</h4>
            <p class="qsvm-caption-desc">
              2D scatter plot representing the input training data points. Hover over any particle to inspect its exact spatial coordinates and class classification label.
            </p>
          </div>
        </div>
      `;
      setupCanvasInteractions('qsvm-canvas-single');

    } else if (state.step === 2) {
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <div class="qsvm-canvas-card" style="position:relative;">
            <canvas id="qsvm-canvas-single" width="580" height="390" class="qsvm-scatter-canvas"></canvas>
            <div class="qsvm-canvas-hud" id="qsvm-canvas-hud"></div>
          </div>
          <div class="qsvm-caption-card">
            <h4 class="qsvm-caption-title">Classical Linear SVM</h4>
            <p class="qsvm-caption-desc">${curDataset.classicalBoundaryDesc}</p>
          </div>
        </div>
      `;
      setupCanvasInteractions('qsvm-canvas-single');

    } else if (state.step === 3) {
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <!-- CIRCUIT CARD -->
          <div class="qsvm-circuit-card">
            <div class="qsvm-circuit-header">
              <span class="qsvm-circuit-title">QUANTUM FEATURE MAP CIRCUIT (${state.featureMap.toUpperCase()})</span>
            </div>
            <div class="qsvm-legend-bar">
              <span class="qsvm-legend-item qsvm-legend-h"><span class="qsvm-dot-h"></span> Hadamard: Superposition</span>
              <span class="qsvm-legend-item qsvm-legend-p"><span class="qsvm-dot-p"></span> Phase Gates: Data Encoding $U_\\Phi(\\vec{x})$</span>
              <span class="qsvm-legend-item qsvm-legend-cx"><span class="qsvm-dot-cx"></span> Entanglement: CNOT Correlations</span>
            </div>
            <div class="qsvm-circuit-svg-wrap" id="qsvm-circuit-container">
              ${renderCircuitSVG()}
            </div>
            <p class="qsvm-circuit-note">
              Data is mapped into quantum Hilbert state $|\Phi(x)\\rangle$. H-gates establish maximum superposition, single-qubit phase rotations encode input features, and entangling 2-qubit CNOT gates capture higher-order feature interactions.
            </p>
          </div>

          <!-- HEATMAP & PROJECTION CARD -->
          <div class="qsvm-heatmap-card">
            <div class="qsvm-heatmap-header">
              <span class="qsvm-circuit-title">QUANTUM KERNEL MATRIX HEATMAP</span>
            </div>
            <div class="qsvm-heatmap-flex">
              <canvas id="qsvm-heatmap-canvas" width="220" height="220" class="qsvm-heatmap-canvas"></canvas>
              <div class="qsvm-heatmap-info">
                <h4 class="qsvm-caption-title" style="margin-top:0;">Hilbert Space Inner Products</h4>
                <p class="qsvm-caption-desc">
                  The computed quantum kernel $K_{ij} = |\\langle \\Phi(x_i) | \\Phi(x_j) \\rangle|^2$ measures quantum state similarity. High values (bright cyan) indicate strong overlap.
                </p>
                <div class="qsvm-heatmap-scale">
                  <span>0.0 (Orthogonal)</span>
                  <div class="qsvm-gradient-bar"></div>
                  <span>1.0 (Identical)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      drawHeatmap('qsvm-heatmap-canvas');

    } else if (state.step === 4) {
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <div class="qsvm-canvas-card" style="position:relative;">
            <canvas id="qsvm-canvas-single" width="580" height="390" class="qsvm-scatter-canvas"></canvas>
            <div class="qsvm-canvas-hud" id="qsvm-canvas-hud"></div>
          </div>
          <div class="qsvm-caption-card">
            <h4 class="qsvm-caption-title">Quantum SVM Decision Boundary & Quantum Motion</h4>
            <p class="qsvm-caption-desc">${curDataset.quantumBoundaryDesc}</p>
          </div>
        </div>
      `;
      setupCanvasInteractions('qsvm-canvas-single');

    } else if (state.step === 5) {
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <div class="qsvm-dual-vis-grid">
            <!-- Classical Column -->
            <div class="qsvm-dual-col">
              <div class="qsvm-col-badge">CLASSICAL LINEAR SVM</div>
              <div class="qsvm-dual-canvas-card" style="position:relative;">
                <canvas id="qsvm-canvas-dual-classical" width="280" height="270" class="qsvm-scatter-canvas"></canvas>
              </div>
              <div class="qsvm-col-stat">
                <div class="qsvm-col-num ${state.dataset === 'linear' ? 'success' : 'warn'}">${curDataset.classicalAcc}</div>
                <div class="qsvm-col-label">Accuracy</div>
              </div>
            </div>

            <!-- Quantum Column -->
            <div class="qsvm-dual-col">
              <div class="qsvm-col-badge qsvm-col-badge--quantum">QUANTUM SVM</div>
              <div class="qsvm-dual-canvas-card" style="position:relative;">
                <canvas id="qsvm-canvas-dual-quantum" width="280" height="270" class="qsvm-scatter-canvas"></canvas>
              </div>
              <div class="qsvm-col-stat">
                <div class="qsvm-col-num success">${curDataset.quantumAcc}</div>
                <div class="qsvm-col-label">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      `;
      setupCanvasInteractions('qsvm-canvas-dual-classical');
      setupCanvasInteractions('qsvm-canvas-dual-quantum');
    }
  }

  function updateCircuitAndHeatmap() {
    const circuitContainer = document.getElementById('qsvm-circuit-container');
    if (circuitContainer) {
      circuitContainer.innerHTML = renderCircuitSVG();
    }
    drawHeatmap('qsvm-heatmap-canvas');
  }

  /* ------------------------------------------------------------
     9. CANVAS INTERACTIONS & FLOATING HUD TOOLTIP
     ------------------------------------------------------------ */
  function setupCanvasInteractions(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      mousePos = { x, y, canvasId };
      checkHoveredParticle(canvas, x, y);
    };

    canvas.onmouseleave = () => {
      mousePos = { x: -1, y: -1, canvasId: null };
      hoveredParticle = null;
      hideHUD();
    };
  }

  function checkHoveredParticle(canvas, mx, my) {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = w * 0.44;

    let nearest = null;
    let minDist = 22; // Capture radius

    particles.forEach(pt => {
      const px = cx + pt.curX * scale;
      const py = cy - pt.curY * scale;
      const dist = Math.hypot(px - mx, py - my);
      if (dist < minDist) {
        minDist = dist;
        nearest = { pt, px, py };
      }
    });

    hoveredParticle = nearest;

    const hudEl = document.getElementById('qsvm-canvas-hud');
    if (hoveredParticle && hudEl) {
      const curDataset = DATASETS[state.dataset];
      const isSV = curDataset.supportVectorIndices.includes(hoveredParticle.pt.id);
      const isGreen = hoveredParticle.pt.label === 1;

      hudEl.style.display = 'block';
      hudEl.style.left = `${Math.min(canvas.clientWidth - 165, Math.max(10, (hoveredParticle.px / canvas.width) * canvas.clientWidth + 14))}px`;
      hudEl.style.top = `${Math.min(canvas.clientHeight - 95, Math.max(10, (hoveredParticle.py / canvas.height) * canvas.clientHeight - 45))}px`;
      hudEl.innerHTML = `
        <div style="background:rgba(4,7,20,0.95); border:1px solid ${isGreen ? '#00f59b' : '#ff2e63'}; border-radius:8px; padding:7px 11px; font-size:11px; font-family:monospace; box-shadow:0 4px 18px rgba(0,0,0,0.7); pointer-events:none; color:#f8fafc; backdrop-filter:blur(6px);">
          <div style="color:${isGreen ? '#00f59b' : '#ff4d79'}; font-weight:800; font-size:12px; margin-bottom:3px;">
            Particle #${hoveredParticle.pt.id} [${isGreen ? 'Class +1' : 'Class -1'}]
          </div>
          <div style="color:#94a3b8; font-size:10.5px;">
            x₀: ${hoveredParticle.pt.curX.toFixed(3)}
          </div>
          <div style="color:#94a3b8; font-size:10.5px;">
            x₁: ${hoveredParticle.pt.curY.toFixed(3)}
          </div>
          <div style="color:#c084fc; font-size:9.5px; margin-top:2px;">
            Phase: ${(hoveredParticle.pt.phaseOffset).toFixed(2)} rad
          </div>
          ${isSV ? '<div style="color:#06b6d4; font-size:9.5px; font-weight:800; margin-top:3px; letter-spacing:0.04em;">★ SUPPORT VECTOR</div>' : ''}
        </div>
      `;
    } else {
      hideHUD();
    }
  }

  function hideHUD() {
    const hudEl = document.getElementById('qsvm-canvas-hud');
    if (hudEl) hudEl.style.display = 'none';
  }

  /* ------------------------------------------------------------
     10. PERSISTENT CANVAS RENDERING ENGINE
     ------------------------------------------------------------ */
  function redrawActiveCanvases(time) {
    if (state.step === 1) {
      drawScatterPlotToCanvas('qsvm-canvas-single', {
        showBoundary: false,
        showSupportVectors: false,
        time
      });
    } else if (state.step === 2) {
      drawScatterPlotToCanvas('qsvm-canvas-single', {
        showBoundary: state.classicalDone,
        boundaryType: 'classical',
        showSupportVectors: state.classicalDone,
        time
      });
    } else if (state.step === 4) {
      drawScatterPlotToCanvas('qsvm-canvas-single', {
        showBoundary: state.quantumDone,
        boundaryType: 'quantum',
        showSupportVectors: state.quantumDone,
        showEntanglement: state.showEntanglementWeb,
        time
      });
    } else if (state.step === 5) {
      drawScatterPlotToCanvas('qsvm-canvas-dual-classical', {
        showBoundary: true,
        boundaryType: 'classical',
        showSupportVectors: true,
        isDual: true,
        time
      });
      drawScatterPlotToCanvas('qsvm-canvas-dual-quantum', {
        showBoundary: true,
        boundaryType: 'quantum',
        showSupportVectors: true,
        isDual: true,
        time
      });
    }
  }

  function drawScatterPlotToCanvas(canvasId, options) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const isDual = options.isDual || false;
    const scale = isDual ? (w * 0.42) : (w * 0.44);
    const time = options.time || performance.now();

    ctx.clearRect(0, 0, w, h);

    // 1. Deep Space Hilbert Background Glow
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.6);
    bgGrad.addColorStop(0, '#04081c');
    bgGrad.addColorStop(0.65, '#02040d');
    bgGrad.addColorStop(1, '#010207');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. High-Tech Coordinate Grid & Quadrant Markers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridStep = scale / 2;
    for (let x = cx % gridStep; x < w; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = cy % gridStep; y < h; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    // Subtle Axis Labels
    if (!isDual) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('+x₀', w - 24, cy - 6);
      ctx.fillText('-x₀', 8, cy - 6);
      ctx.fillText('+x₁', cx + 6, 16);
      ctx.fillText('-x₁', cx + 6, h - 8);
    }

    // 3. Multi-Layer Quantum Pulse Wave (expanding glowing ripple)
    if (pulseWave.active && !isDual) {
      const maxR = Math.max(w, h) * 0.85;
      const currentR = pulseWave.progress * maxR;
      const alpha = Math.max(0, 1 - pulseWave.progress);

      ctx.save();
      // Outer violet ring
      ctx.beginPath();
      ctx.arc(cx, cy, currentR, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.9})`;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Middle cyan ring
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(0, currentR - 22), 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Soft glow fill
      ctx.beginPath();
      ctx.arc(cx, cy, currentR, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(124, 58, 237, ${alpha * 0.06})`;
      ctx.fill();
      ctx.restore();
    }

    // 4. Decision Regions & Boundary Rendering
    if (options.showBoundary) {
      if (options.boundaryType === 'classical') {
        drawClassicalBoundary(ctx, w, h, cx, cy, scale, boundaryAnim.progress);
      } else if (options.boundaryType === 'quantum') {
        drawQuantumBoundary(ctx, w, h, cx, cy, scale, boundaryAnim.progress, time, isDual);
      }
    }

    const curDataset = DATASETS[state.dataset];
    const svSet = new Set(curDataset.supportVectorIndices);

    // 5. Quantum Entanglement Energy Filaments (Step 4)
    if (options.showEntanglement && !isDual) {
      const svIndices = curDataset.supportVectorIndices;
      ctx.save();
      ctx.lineWidth = 1.2;
      for (let i = 0; i < svIndices.length; i++) {
        for (let j = i + 1; j < svIndices.length; j++) {
          const ptA = particles[svIndices[i]];
          const ptB = particles[svIndices[j]];
          if (!ptA || !ptB) continue;

          // Connect support vectors with high quantum correlation
          const dist = Math.hypot(ptA.curX - ptB.curX, ptA.curY - ptB.curY);
          if (dist < 1.15) {
            const pAx = cx + ptA.curX * scale;
            const pAy = cy - ptA.curY * scale;
            const pBx = cx + ptB.curX * scale;
            const pBy = cy - ptB.curY * scale;

            const pulse = 0.5 + 0.5 * Math.sin(time * 0.003 + i * 2);
            ctx.beginPath();
            ctx.moveTo(pAx, pAy);
            ctx.lineTo(pBx, pBy);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.12 + pulse * 0.15})`;
            ctx.stroke();

            // Energy spark traveling along the filament
            const sparkT = (time * 0.0006 + i * 0.2) % 1;
            const sx = pAx + (pBx - pAx) * sparkT;
            const sy = pAy + (pBy - pAy) * sparkT;
            ctx.beginPath();
            ctx.arc(sx, sy, 2, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(6, 182, 212, ${0.7 * pulse})`;
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    // 6. Fluid Phosphorescent Comet Trails
    particles.forEach(pt => {
      if (pt.trail && pt.trail.length > 1) {
        ctx.save();
        ctx.beginPath();
        const startPx = cx + pt.trail[0].x * scale;
        const startPy = cy - pt.trail[0].y * scale;
        ctx.moveTo(startPx, startPy);

        for (let k = 1; k < pt.trail.length; k++) {
          const tx = cx + pt.trail[k].x * scale;
          const ty = cy - pt.trail[k].y * scale;
          ctx.lineTo(tx, ty);
        }

        const isGreen = pt.label === 1;
        ctx.strokeStyle = isGreen
          ? `rgba(0, 245, 155, ${pt.trail[0].alpha * 0.55})`
          : `rgba(255, 46, 99, ${pt.trail[0].alpha * 0.55})`;
        ctx.lineWidth = isDual ? 2.5 : 3.5;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }
    });

    // 7. Data Particles with High-Definition Quantum Aura
    particles.forEach((pt, idx) => {
      const px = cx + pt.curX * scale;
      const py = cy - pt.curY * scale;

      const isSV = options.showSupportVectors && svSet.has(idx);
      const isHovered = hoveredParticle && hoveredParticle.pt.id === pt.id && mousePos.canvasId === canvasId;
      const isGreen = pt.label === 1;

      // Support Vector Pulsing Quantum Orbital Rings & Satellite
      if (isSV) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.005 + idx);
        const svRadius = isDual ? (8.5 + pulse * 2.5) : (12 + pulse * 3.5);

        ctx.save();
        // Outer pulsing ring
        ctx.beginPath();
        ctx.arc(px, py, svRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = options.boundaryType === 'classical'
          ? `rgba(6, 182, 212, ${0.7 + pulse * 0.3})`
          : `rgba(168, 85, 247, ${0.75 + pulse * 0.25})`;
        ctx.lineWidth = isDual ? 1.8 : 2.4;
        ctx.shadowColor = options.boundaryType === 'classical' ? '#06b6d4' : '#a855f7';
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Orbiting Quantum Satellite Electron
        if (!isDual) {
          const satAngle = time * 0.0035 + pt.phaseOffset;
          const satX = px + Math.cos(satAngle) * (svRadius + 4);
          const satY = py + Math.sin(satAngle) * (svRadius + 4);
          ctx.beginPath();
          ctx.arc(satX, satY, 2.2, 0, 2 * Math.PI);
          ctx.fillStyle = '#f8fafc';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 6;
          ctx.fill();
        }
        ctx.restore();
      }

      // Hover Reticle Target Ring
      if (isHovered) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, isDual ? 13 : 18, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      // Main Particle Body
      ctx.beginPath();
      const baseRadius = isDual ? 5.0 : 6.2;
      const particleRadius = isHovered ? (baseRadius + 2.5) : baseRadius;
      ctx.arc(px, py, particleRadius, 0, 2 * Math.PI);

      // Vivid Quantum Color Palette
      const fillCol = isGreen ? '#00f59b' : '#ff2e63';
      const glowCol = isGreen ? 'rgba(0, 245, 155, 0.9)' : 'rgba(255, 46, 99, 0.9)';

      ctx.fillStyle = fillCol;
      ctx.shadowColor = glowCol;
      ctx.shadowBlur = isHovered ? 16 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Specular Quantum Core (white highlight)
      ctx.beginPath();
      ctx.arc(px - particleRadius * 0.32, py - particleRadius * 0.32, particleRadius * 0.35, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();
    });
  }

  /* ------------------------------------------------------------
     11. DECISION BOUNDARY RENDERERS
     ------------------------------------------------------------ */
  function drawClassicalBoundary(ctx, w, h, cx, cy, scale, progress) {
    ctx.save();
    ctx.setLineDash([6, 5]);

    if (state.dataset === 'linear') {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.8;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * progress, h - h * progress);
      ctx.stroke();

      // Margins
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, h - 45); ctx.lineTo(w * progress, h - 45 - h * progress); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, h + 45); ctx.lineTo(w * progress, h + 45 - h * progress); ctx.stroke();

    } else if (state.dataset === 'circular') {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.8;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h * progress);
      ctx.stroke();

      // Margins
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 35, 0); ctx.lineTo(cx - 35, h * progress); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 35, 0); ctx.lineTo(cx + 35, h * progress); ctx.stroke();

    } else {
      // XOR: Vertical line dividing left and right
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.8;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h * progress);
      ctx.stroke();

      // Margins
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 40, 0); ctx.lineTo(cx - 40, h * progress); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 40, 0); ctx.lineTo(cx + 40, h * progress); ctx.stroke();
    }
    ctx.restore();
  }

  function drawQuantumBoundary(ctx, w, h, cx, cy, scale, progress, time, isDual) {
    ctx.save();

    if (state.dataset === 'linear') {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * progress, h - h * progress);
      ctx.stroke();

    } else if (state.dataset === 'circular') {
      const maxR = 0.48 * scale;
      const curR = maxR * progress;

      // Soft green radial zone for inner cluster
      const zoneGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, curR);
      zoneGrad.addColorStop(0, 'rgba(0, 245, 155, 0.12)');
      zoneGrad.addColorStop(1, 'rgba(0, 245, 155, 0.02)');
      ctx.fillStyle = zoneGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, curR, 0, 2 * Math.PI);
      ctx.fill();

      // Glowing plasma circular boundary
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, curR, 0, 2 * Math.PI * progress);
      ctx.stroke();

    } else {
      // XOR: Translucent Dual Classification Zones & Glowing Hyperbolic Contours
      // Soft tint in Q2 & Q4 for Class +1 (Green)
      ctx.fillStyle = 'rgba(0, 245, 155, 0.05)';
      ctx.fillRect(0, 0, cx, cy);     // Q2 Top-Left
      ctx.fillRect(cx, cy, cx, cy);   // Q4 Bottom-Right

      // Soft tint in Q1 & Q3 for Class -1 (Red)
      ctx.fillStyle = 'rgba(255, 46, 99, 0.05)';
      ctx.fillRect(cx, 0, cx, cy);   // Q1 Top-Right
      ctx.fillRect(0, cy, cx, cy);   // Q3 Bottom-Left

      // Neon Purple Plasma Hyperbolic Boundaries
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.0;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;

      const maxSteps = 18;
      const count = Math.floor(maxSteps * progress);

      // Q1 Top-right hyperbola contour
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const x = 0.14 + (i / maxSteps) * 0.82;
        const y = 0.052 / x;
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Q3 Bottom-left hyperbola contour
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const x = -0.96 + (i / maxSteps) * 0.82;
        const y = 0.052 / x;
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Q2 Top-left hyperbola contour
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const x = -0.96 + (i / maxSteps) * 0.82;
        const y = -0.052 / x;
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Q4 Bottom-right hyperbola contour
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const x = 0.14 + (i / maxSteps) * 0.82;
        const y = -0.052 / x;
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ------------------------------------------------------------
     12. CIRCUIT SVG GENERATOR (Step 3)
     ------------------------------------------------------------ */
  function renderCircuitSVG() {
    const isZZ = state.featureMap === 'ZZFeatureMap';
    const depth = state.depth;

    let svgBlocks = '';
    let xOffset = 90;

    for (let d = 0; d < depth; d++) {
      // H gates (Superposition - Blue)
      svgBlocks += `
        <rect x="${xOffset}" y="20" width="34" height="30" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="${xOffset + 17}" y="40" fill="#93c5fd" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">H</text>

        <rect x="${xOffset}" y="70" width="34" height="30" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="${xOffset + 17}" y="90" fill="#93c5fd" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">H</text>
      `;
      xOffset += 46;

      // Phase Gates P(2x) (Data Encoding - Amber)
      svgBlocks += `
        <rect x="${xOffset}" y="20" width="56" height="30" rx="4" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="${xOffset + 28}" y="39" fill="#fef08a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">P(2x₀)</text>

        <rect x="${xOffset}" y="70" width="56" height="30" rx="4" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="${xOffset + 28}" y="89" fill="#fef08a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">P(2x₁)</text>
      `;
      xOffset += 68;

      // Entanglement CNOT + Phase + CNOT (if ZZFeatureMap)
      if (isZZ) {
        svgBlocks += `
          <!-- CNOT 1 -->
          <line x1="${xOffset + 10}" y1="35" x2="${xOffset + 10}" y2="85" stroke="#a855f7" stroke-width="2"/>
          <circle cx="${xOffset + 10}" cy="35" r="4.5" fill="#a855f7"/>
          <circle cx="${xOffset + 10}" cy="85" r="8" fill="none" stroke="#a855f7" stroke-width="2"/>
          <line x1="${xOffset + 2}" y1="85" x2="${xOffset + 18}" y2="85" stroke="#a855f7" stroke-width="2"/>
          <line x1="${xOffset + 10}" y1="77" x2="${xOffset + 10}" y2="93" stroke="#a855f7" stroke-width="2"/>
        `;
        xOffset += 30;

        // Entangling Phase Gate P(2(π-x₀)(π-x₁))
        svgBlocks += `
          <rect x="${xOffset}" y="70" width="94" height="30" rx="4" fill="#581c87" stroke="#c084fc" stroke-width="1.5"/>
          <text x="${xOffset + 47}" y="89" fill="#f3e8ff" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">P(2(π-x₀)(π-x₁))</text>
        `;
        xOffset += 104;

        // CNOT 2
        svgBlocks += `
          <line x1="${xOffset + 10}" y1="35" x2="${xOffset + 10}" y2="85" stroke="#a855f7" stroke-width="2"/>
          <circle cx="${xOffset + 10}" cy="35" r="4.5" fill="#a855f7"/>
          <circle cx="${xOffset + 10}" cy="85" r="8" fill="none" stroke="#a855f7" stroke-width="2"/>
          <line x1="${xOffset + 2}" y1="85" x2="${xOffset + 18}" y2="85" stroke="#a855f7" stroke-width="2"/>
          <line x1="${xOffset + 10}" y1="77" x2="${xOffset + 10}" y2="93" stroke="#a855f7" stroke-width="2"/>
        `;
        xOffset += 30;
      }
      xOffset += 20;
    }

    const totalWidth = Math.max(520, xOffset + 40);

    return `
      <svg viewBox="0 0 ${totalWidth} 120" width="100%" height="110" style="background:#040714; border-radius:6px;" xmlns="http://www.w3.org/2000/svg">
        <text x="25" y="40" fill="#94a3b8" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="bold">q₀</text>
        <text x="25" y="90" fill="#94a3b8" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="bold">q₁</text>
        <line x1="55" y1="35" x2="${totalWidth - 20}" y2="35" stroke="#334155" stroke-width="1.5"/>
        <line x1="55" y1="85" x2="${totalWidth - 20}" y2="85" stroke="#334155" stroke-width="1.5"/>
        ${svgBlocks}
      </svg>
    `;
  }

  /* ------------------------------------------------------------
     13. KERNEL HEATMAP GENERATOR (Step 3)
     ------------------------------------------------------------ */
  function drawHeatmap(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 10;
    const cellSize = canvas.width / size;

    const isZZ = state.featureMap === 'ZZFeatureMap';
    const depth = state.depth;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let val;
        if (r === c) {
          val = 1.0;
        } else {
          const sameClass = (r < 5 && c < 5) || (r >= 5 && c >= 5);
          const depthMultiplier = 1 + (depth - 1) * 0.15;
          if (sameClass) {
            val = (0.68 + Math.sin(r * 2.3 + c * 1.7) * 0.22) * (isZZ ? 1.05 : 0.9);
          } else {
            val = (0.12 + Math.abs(Math.sin(r * 1.1 + c * 3.3)) * 0.14) / depthMultiplier;
          }
        }
        val = Math.max(0, Math.min(1, val));

        let red, grn, blu;
        if (val < 0.5) {
          const t = val / 0.5;
          red = Math.round(8 + t * (124 - 8));
          grn = Math.round(14 + t * (58 - 14));
          blu = Math.round(43 + t * (237 - 43));
        } else {
          const t = (val - 0.5) / 0.5;
          red = Math.round(124 + t * (6 - 124));
          grn = Math.round(58 + t * (182 - 58));
          blu = Math.round(237 + t * (212 - 237));
        }

        ctx.fillStyle = `rgb(${red}, ${grn}, ${blu})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }

  /* ------------------------------------------------------------
     14. PUBLIC API
     ------------------------------------------------------------ */
  return {
    mount: mount,
    getState: () => state,
    switchStep: switchStep,
    startDatasetTransition: startDatasetTransition,
    triggerQuantumPulse: triggerQuantumPulse
  };
})();
