/* ============================================================
   QUANTUMLAB – ALGORITHM INTERACTIVE RUNNER & VISUALIZER ENGINE
   Unified high-fidelity renderer for all 12 Quantum Algorithms
   ============================================================ */

window.QL = window.QL || {};

QL.AlgorithmPage = (function () {
  let currentAlgo = null;
  let currentStep = 0;
  let isRunning = false;
  let runInterval = null;
  let simulationResult = null;
  let threeScene = null;
  let threeRenderer = null;
  let threeCamera = null;
  let threeControls = null;
  let threeAnimFrame = null;
  let customObjects = {};

  // Initialize page
  function init(algoId) {
    if (!algoId) {
      // Deduce from URL
      const path = window.location.pathname;
      const match = path.match(/([a-z0-9\-]+)(?:\.html)?$/);
      if (match && match[1] && match[1] !== 'index' && match[1] !== 'algorithms') {
        algoId = match[1];
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        algoId = urlParams.get('id') || 'deutsch-jozsa';
      }
    }

    currentAlgo = (QL.algorithmsList || []).find(a => a.id === algoId);
    if (!currentAlgo) {
      currentAlgo = QL.algorithmsList[0];
    }

    document.title = `${currentAlgo.name} – QuantumLab Algorithm Explorer`;

    renderHeader();
    renderTimeline();
    renderCircuit();
    renderControls();
    renderDeepDiveTabs();
    setupActions();

    // Run initial baseline simulation
    executeSimulation();
    initVisualizer();
  }

  /* ------------------------------------------------------------
     HEADER & BREADCRUMBS
     ------------------------------------------------------------ */
  function renderHeader() {
    const titleEl = document.getElementById('algo-page-title');
    const badgeEl = document.getElementById('algo-page-badge');
    const diffEl = document.getElementById('algo-page-diff');
    const breadcrumbCat = document.getElementById('algo-breadcrumb-cat');
    const breadcrumbName = document.getElementById('algo-breadcrumb-name');

    if (titleEl) titleEl.textContent = `${currentAlgo.number}. ${currentAlgo.name}`;
    if (badgeEl) badgeEl.textContent = currentAlgo.category;
    if (diffEl) {
      diffEl.textContent = currentAlgo.difficulty;
      diffEl.className = `algo-card__difficulty diff--${currentAlgo.difficulty.toLowerCase()}`;
    }
    if (breadcrumbCat) breadcrumbCat.textContent = currentAlgo.category;
    if (breadcrumbName) breadcrumbName.textContent = currentAlgo.name;
  }

  /* ------------------------------------------------------------
     LEFT PANEL: STEP TIMELINE
     ------------------------------------------------------------ */
  function renderTimeline() {
    const listEl = document.getElementById('algo-timeline-list');
    if (!listEl) return;

    listEl.innerHTML = currentAlgo.steps.map((step, idx) => `
      <div class="algo-step-node ${idx === 0 ? 'active' : ''}" data-step-idx="${idx}" id="step-node-${idx}">
        <div class="algo-step-node__header">
          <span class="algo-step-node__num">STEP 0${idx + 1}</span>
          <span class="algo-step-node__status" id="step-status-${idx}">${idx === 0 ? 'READY' : 'PENDING'}</span>
        </div>
        <div class="algo-step-node__name">${step.name}</div>
        <div class="algo-step-node__desc">${step.desc}</div>
      </div>
    `).join('');

    listEl.querySelectorAll('.algo-step-node').forEach(node => {
      node.addEventListener('click', () => {
        goToStep(parseInt(node.dataset.stepIdx, 10));
      });
    });
  }

  function updateTimelineUI() {
    currentAlgo.steps.forEach((step, idx) => {
      const node = document.getElementById(`step-node-${idx}`);
      const status = document.getElementById(`step-status-${idx}`);
      if (!node || !status) return;

      if (idx === currentStep) {
        node.classList.add('active');
        status.textContent = isRunning ? 'EXECUTING...' : 'ACTIVE';
        status.style.color = 'var(--algo-cyan)';
      } else if (idx < currentStep) {
        node.classList.remove('active');
        status.textContent = 'COMPLETED ✓';
        status.style.color = 'var(--algo-emerald)';
      } else {
        node.classList.remove('active');
        status.textContent = 'PENDING';
        status.style.color = 'var(--algo-text-muted)';
      }
    });

    // Update status bar
    const opEl = document.getElementById('algo-current-op');
    if (opEl && currentAlgo.steps[currentStep]) {
      opEl.textContent = `Step ${currentStep + 1}: ${currentAlgo.steps[currentStep].name}`;
    }

    // Highlight gates in circuit
    highlightCircuitStep(currentStep);
  }

  /* ------------------------------------------------------------
     CENTER STAGE: QUANTUM CIRCUIT DISPLAY
     ------------------------------------------------------------ */
  function renderCircuit() {
    const screenEl = document.getElementById('algo-circuit-screen');
    if (!screenEl || !currentAlgo.circuit) return;

    screenEl.innerHTML = currentAlgo.circuit.map(line => {
      let formatted = line
        .replace(/(q\d+|anc|Source|H\(t\)|H_driver|H_problem)/g, '<span class="circuit-qubit">$1</span>')
        .replace(/\[([^\]]+)\]/g, '<span class="circuit-gate">[$1]</span>')
        .replace(/(M|Measure|Readout)/g, '<span class="circuit-meas">$1</span>');
      return `<div class="algo-circuit-line">${formatted}</div>`;
    }).join('');
  }

  function highlightCircuitStep(stepIdx) {
    const gates = document.querySelectorAll('.circuit-gate');
    gates.forEach((g, idx) => {
      if (idx === stepIdx % Math.max(1, gates.length)) {
        g.classList.add('active');
      } else {
        g.classList.remove('active');
      }
    });
  }

  /* ------------------------------------------------------------
     RIGHT PANEL: ALGORITHM CONTROLS
     ------------------------------------------------------------ */
  function renderControls() {
    const formEl = document.getElementById('algo-controls-form');
    if (!formEl) return;

    let html = '';
    const id = currentAlgo.id;

    if (id === 'deutsch-jozsa') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label">
            <span>Input Qubits (n)</span>
            <span class="algo-control-val" id="dj-qubits-val">2 qubits (dim=4)</span>
          </label>
          <select class="algo-select" id="ctrl-dj-qubits">
            <option value="2" selected>2 Qubits (4 Basis States)</option>
            <option value="3">3 Qubits (8 Basis States)</option>
            <option value="4">4 Qubits (16 Basis States)</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Oracle Function Type</span></label>
          <select class="algo-select" id="ctrl-dj-oracle">
            <option value="balanced" selected>Balanced (f(x) = 0 for 50%, 1 for 50%)</option>
            <option value="constant_0">Constant (f(x) = 0 for all x)</option>
            <option value="constant_1">Constant (f(x) = 1 for all x)</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label">
            <span>Measurement Shots</span>
            <span class="algo-control-val" id="dj-shots-val">512</span>
          </label>
          <input type="range" class="algo-range" id="ctrl-dj-shots" min="128" max="2048" step="128" value="512">
        </div>
      `;
    } else if (id === 'bernstein-vazirani') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Hidden Secret String (s)</span></label>
          <input type="text" class="algo-input" id="ctrl-bv-string" value="1011" maxlength="6" pattern="[01]+" style="letter-spacing:0.2em; font-weight:700;">
          <span style="font-size:0.72rem; color:var(--algo-text-muted);">Enter binary string (e.g. 101, 1011, 11001)</span>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Measurement Shots</span><span class="algo-control-val" id="bv-shots-val">1024</span></label>
          <input type="range" class="algo-range" id="ctrl-bv-shots" min="256" max="2048" step="256" value="1024">
        </div>
      `;
    } else if (id === 'grover') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Database Size (N)</span></label>
          <select class="algo-select" id="ctrl-grover-space">
            <option value="4">N = 4 items (2 qubits)</option>
            <option value="8" selected>N = 8 items (3 qubits)</option>
            <option value="16">N = 16 items (4 qubits)</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Target Marked Item (|w⟩)</span></label>
          <input type="number" class="algo-input" id="ctrl-grover-target" min="0" max="7" value="5">
          <span style="font-size:0.72rem; color:var(--algo-text-muted);" id="grover-target-hint">Index between 0 and 7</span>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Iterations (k)</span><span class="algo-control-val" id="grover-iter-val">2 (Optimal)</span></label>
          <input type="range" class="algo-range" id="ctrl-grover-iter" min="0" max="6" value="2">
        </div>
      `;
    } else if (id === 'qft') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Register Qubits</span></label>
          <select class="algo-select" id="ctrl-qft-qubits">
            <option value="2">2 Qubits (N=4)</option>
            <option value="3" selected>3 Qubits (N=8)</option>
            <option value="4">4 Qubits (N=16)</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Input Computational State |j⟩</span><span class="algo-control-val" id="qft-state-val">|2⟩</span></label>
          <input type="range" class="algo-range" id="ctrl-qft-input" min="0" max="7" value="2">
        </div>
      `;
    } else if (id === 'qaoa') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Problem Graph Topology</span></label>
          <select class="algo-select" id="ctrl-qaoa-graph">
            <option value="ring4" selected>4-Node Ring (MaxCut = 4)</option>
            <option value="star4">4-Node Star (MaxCut = 3)</option>
            <option value="complete3">3-Node Complete Triangle</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Variational Depth (p)</span><span class="algo-control-val" id="qaoa-p-val">p = 1</span></label>
          <input type="range" class="algo-range" id="ctrl-qaoa-p" min="1" max="3" value="1">
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Cost Angle γ (gamma)</span><span class="algo-control-val" id="qaoa-gamma-val">0.65 rad</span></label>
          <input type="range" class="algo-range" id="ctrl-qaoa-gamma" min="0.1" max="3.14" step="0.05" value="0.65">
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Mixer Angle β (beta)</span><span class="algo-control-val" id="qaoa-beta-val">0.45 rad</span></label>
          <input type="range" class="algo-range" id="ctrl-qaoa-beta" min="0.1" max="1.57" step="0.05" value="0.45">
        </div>
      `;
    } else if (id === 'quantum-annealing') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Annealing Duration (T)</span><span class="algo-control-val" id="qa-time-val">20 μs</span></label>
          <input type="range" class="algo-range" id="ctrl-qa-time" min="5" max="50" step="5" value="20">
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Annealing Schedule</span></label>
          <select class="algo-select" id="ctrl-qa-schedule">
            <option value="linear" selected>Linear Schedule (Standard)</option>
            <option value="quadratic">Quadratic / Non-linear Pause</option>
          </select>
        </div>
      `;
    } else if (id === 'qsvm') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Dataset Geometry</span></label>
          <select class="algo-select" id="ctrl-qsvm-dataset">
            <option value="circles" selected>Concentric Rings (Non-linear)</option>
            <option value="moons">Intertwined Moons</option>
            <option value="linear">Linearly Separable</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Quantum Feature Map</span></label>
          <select class="algo-select" id="ctrl-qsvm-map">
            <option value="zz" selected>ZZ-Feature Map (Entangled)</option>
            <option value="pauli">Pauli Z Feature Map</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>SVM Regularization (C)</span><span class="algo-control-val" id="qsvm-c-val">1.0</span></label>
          <input type="range" class="algo-range" id="ctrl-qsvm-c" min="0.1" max="5.0" step="0.1" value="1.0">
        </div>
      `;
    } else if (id === 'quantum-kernel-alignment') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Alignment Steps</span><span class="algo-control-val" id="qka-steps-val">10 Steps</span></label>
          <input type="range" class="algo-range" id="ctrl-qka-steps" min="5" max="25" step="5" value="10">
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Learning Rate (η)</span><span class="algo-control-val" id="qka-lr-val">0.15</span></label>
          <input type="range" class="algo-range" id="ctrl-qka-lr" min="0.05" max="0.30" step="0.05" value="0.15">
        </div>
      `;
    } else if (id === 'vqc') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Ansatz Layers (L)</span><span class="algo-control-val" id="vqc-layers-val">2 Layers</span></label>
          <input type="range" class="algo-range" id="ctrl-vqc-layers" min="1" max="4" step="1" value="2">
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Training Epochs</span><span class="algo-control-val" id="vqc-epochs-val">15 Epochs</span></label>
          <input type="range" class="algo-range" id="ctrl-vqc-epochs" min="5" max="30" step="5" value="15">
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Optimizer</span></label>
          <select class="algo-select" id="ctrl-vqc-opt">
            <option value="adam" selected>Quantum Adam Optimizer</option>
            <option value="gd">Gradient Descent (Shift Rule)</option>
          </select>
        </div>
      `;
    } else if (id === 'qnn') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>QCNN Layers</span><span class="algo-control-val" id="qnn-layers-val">2 Layers</span></label>
          <input type="range" class="algo-range" id="ctrl-qnn-layers" min="1" max="3" step="1" value="2">
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Qubit Register</span></label>
          <select class="algo-select" id="ctrl-qnn-qubits">
            <option value="4" selected>4 Qubits (Hierarchical Pooling)</option>
          </select>
        </div>
      `;
    } else if (id === 'qpe') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Counting Qubits (t)</span><span class="algo-control-val" id="qpe-t-val">3 Qubits (8 bins)</span></label>
          <select class="algo-select" id="ctrl-qpe-qubits">
            <option value="2">2 Qubits (4 Bins, Δφ=0.25)</option>
            <option value="3" selected>3 Qubits (8 Bins, Δφ=0.125)</option>
            <option value="4">4 Qubits (16 Bins, Δφ=0.0625)</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Target Eigenphase φ (theta)</span><span class="algo-control-val" id="qpe-phase-val">0.375 (3/8)</span></label>
          <input type="range" class="algo-range" id="ctrl-qpe-phase" min="0.125" max="0.875" step="0.125" value="0.375">
        </div>
      `;
    } else if (id === 'vqe') {
      html += `
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Molecular System</span></label>
          <select class="algo-select" id="ctrl-vqe-mol">
            <option value="H2" selected>Hydrogen Molecule (H₂ STO-3G)</option>
            <option value="LiH">Lithium Hydride (LiH)</option>
          </select>
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Bond Distance (R)</span><span class="algo-control-val" id="vqe-dist-val">0.74 Å (Equilibrium)</span></label>
          <input type="range" class="algo-range" id="ctrl-vqe-dist" min="0.4" max="2.0" step="0.05" value="0.74">
        </div>
        <div class="algo-control-item">
          <label class="algo-control-label"><span>Optimizer Iterations</span><span class="algo-control-val" id="vqe-iter-val">20 Iterations</span></label>
          <input type="range" class="algo-range" id="ctrl-vqe-iter" min="5" max="35" step="5" value="20">
        </div>
      `;
    }

    formEl.innerHTML = html;

    // Attach dynamic listeners for live parameter changes
    formEl.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', () => {
        updateControlLabels();
        executeSimulation();
        updateVisualizer();
      });
    });
  }

  function updateControlLabels() {
    const id = currentAlgo.id;
    if (id === 'deutsch-jozsa') {
      const q = document.getElementById('ctrl-dj-qubits')?.value;
      const s = document.getElementById('ctrl-dj-shots')?.value;
      if (document.getElementById('dj-qubits-val')) document.getElementById('dj-qubits-val').textContent = `${q} qubits (dim=${Math.pow(2, q)})`;
      if (document.getElementById('dj-shots-val')) document.getElementById('dj-shots-val').textContent = s;
    } else if (id === 'bernstein-vazirani') {
      const s = document.getElementById('ctrl-bv-shots')?.value;
      if (document.getElementById('bv-shots-val')) document.getElementById('bv-shots-val').textContent = s;
    } else if (id === 'grover') {
      const N = parseInt(document.getElementById('ctrl-grover-space')?.value || 8, 10);
      const it = document.getElementById('ctrl-grover-iter')?.value;
      const targetInput = document.getElementById('ctrl-grover-target');
      if (targetInput) targetInput.max = N - 1;
      const opt = Math.max(1, Math.round((Math.PI / 4) * Math.sqrt(N)));
      if (document.getElementById('grover-iter-val')) document.getElementById('grover-iter-val').textContent = `${it} (${it == opt ? 'Optimal' : it > opt ? 'Over-rotated' : 'Sub-optimal'})`;
      if (document.getElementById('grover-target-hint')) document.getElementById('grover-target-hint').textContent = `Index between 0 and ${N - 1}`;
    } else if (id === 'qft') {
      const st = document.getElementById('ctrl-qft-input')?.value;
      const q = parseInt(document.getElementById('ctrl-qft-qubits')?.value || 3, 10);
      const input = document.getElementById('ctrl-qft-input');
      if (input) input.max = Math.pow(2, q) - 1;
      if (document.getElementById('qft-state-val')) document.getElementById('qft-state-val').textContent = `|${st}⟩`;
    } else if (id === 'qaoa') {
      const p = document.getElementById('ctrl-qaoa-p')?.value;
      const g = parseFloat(document.getElementById('ctrl-qaoa-gamma')?.value || 0.65).toFixed(2);
      const b = parseFloat(document.getElementById('ctrl-qaoa-beta')?.value || 0.45).toFixed(2);
      if (document.getElementById('qaoa-p-val')) document.getElementById('qaoa-p-val').textContent = `p = ${p}`;
      if (document.getElementById('qaoa-gamma-val')) document.getElementById('qaoa-gamma-val').textContent = `${g} rad`;
      if (document.getElementById('qaoa-beta-val')) document.getElementById('qaoa-beta-val').textContent = `${b} rad`;
    } else if (id === 'quantum-annealing') {
      const t = document.getElementById('ctrl-qa-time')?.value;
      if (document.getElementById('qa-time-val')) document.getElementById('qa-time-val').textContent = `${t} μs`;
    } else if (id === 'qsvm') {
      const c = document.getElementById('ctrl-qsvm-c')?.value;
      if (document.getElementById('qsvm-c-val')) document.getElementById('qsvm-c-val').textContent = c;
    } else if (id === 'quantum-kernel-alignment') {
      const s = document.getElementById('ctrl-qka-steps')?.value;
      const lr = document.getElementById('ctrl-qka-lr')?.value;
      if (document.getElementById('qka-steps-val')) document.getElementById('qka-steps-val').textContent = `${s} Steps`;
      if (document.getElementById('qka-lr-val')) document.getElementById('qka-lr-val').textContent = lr;
    } else if (id === 'vqc') {
      const l = document.getElementById('ctrl-vqc-layers')?.value;
      const ep = document.getElementById('ctrl-vqc-epochs')?.value;
      if (document.getElementById('vqc-layers-val')) document.getElementById('vqc-layers-val').textContent = `${l} Layers`;
      if (document.getElementById('vqc-epochs-val')) document.getElementById('vqc-epochs-val').textContent = `${ep} Epochs`;
    } else if (id === 'qnn') {
      const l = document.getElementById('ctrl-qnn-layers')?.value;
      if (document.getElementById('qnn-layers-val')) document.getElementById('qnn-layers-val').textContent = `${l} Layers`;
    } else if (id === 'qpe') {
      const t = document.getElementById('ctrl-qpe-qubits')?.value;
      const p = document.getElementById('ctrl-qpe-phase')?.value;
      if (document.getElementById('qpe-t-val')) document.getElementById('qpe-t-val').textContent = `${t} Qubits (${Math.pow(2, t)} bins)`;
      if (document.getElementById('qpe-phase-val')) document.getElementById('qpe-phase-val').textContent = `${p}`;
    } else if (id === 'vqe') {
      const d = document.getElementById('ctrl-vqe-dist')?.value;
      const it = document.getElementById('ctrl-vqe-iter')?.value;
      if (document.getElementById('vqe-dist-val')) document.getElementById('vqe-dist-val').textContent = `${d} Å ${Math.abs(d - 0.74) < 0.05 ? '(Equilibrium)' : ''}`;
      if (document.getElementById('vqe-iter-val')) document.getElementById('vqe-iter-val').textContent = `${it} Iterations`;
    }
  }

  function getControlsParams() {
    const params = {};
    const id = currentAlgo.id;

    if (id === 'deutsch-jozsa') {
      params.qubits = document.getElementById('ctrl-dj-qubits')?.value || 2;
      params.oracleType = document.getElementById('ctrl-dj-oracle')?.value || 'balanced';
      params.shots = document.getElementById('ctrl-dj-shots')?.value || 512;
    } else if (id === 'bernstein-vazirani') {
      params.hiddenString = document.getElementById('ctrl-bv-string')?.value || '1011';
      params.shots = document.getElementById('ctrl-bv-shots')?.value || 1024;
    } else if (id === 'grover') {
      params.searchSpace = document.getElementById('ctrl-grover-space')?.value || 8;
      params.targetItem = document.getElementById('ctrl-grover-target')?.value || 5;
      params.iterations = document.getElementById('ctrl-grover-iter')?.value || 2;
      params.shots = 512;
    } else if (id === 'qft') {
      params.qubits = document.getElementById('ctrl-qft-qubits')?.value || 3;
      params.inputState = document.getElementById('ctrl-qft-input')?.value || 2;
    } else if (id === 'qaoa') {
      params.pLayers = document.getElementById('ctrl-qaoa-p')?.value || 1;
      params.gamma = document.getElementById('ctrl-qaoa-gamma')?.value || 0.65;
      params.beta = document.getElementById('ctrl-qaoa-beta')?.value || 0.45;
      params.shots = 512;
    } else if (id === 'quantum-annealing') {
      params.annealingTime = document.getElementById('ctrl-qa-time')?.value || 20;
      params.schedule = document.getElementById('ctrl-qa-schedule')?.value || 'linear';
    } else if (id === 'qsvm') {
      params.dataset = document.getElementById('ctrl-qsvm-dataset')?.value || 'circles';
      params.featureMap = document.getElementById('ctrl-qsvm-map')?.value || 'zz';
      params.c = document.getElementById('ctrl-qsvm-c')?.value || 1.0;
    } else if (id === 'quantum-kernel-alignment') {
      params.steps = document.getElementById('ctrl-qka-steps')?.value || 10;
      params.lr = document.getElementById('ctrl-qka-lr')?.value || 0.15;
    } else if (id === 'vqc') {
      params.layers = document.getElementById('ctrl-vqc-layers')?.value || 2;
      params.epochs = document.getElementById('ctrl-vqc-epochs')?.value || 15;
      params.optimizer = document.getElementById('ctrl-vqc-opt')?.value || 'adam';
    } else if (id === 'qnn') {
      params.layers = document.getElementById('ctrl-qnn-layers')?.value || 2;
      params.qubits = 4;
    } else if (id === 'qpe') {
      params.countingQubits = document.getElementById('ctrl-qpe-qubits')?.value || 3;
      params.truePhase = document.getElementById('ctrl-qpe-phase')?.value || 0.375;
      params.shots = 512;
    } else if (id === 'vqe') {
      params.molecule = document.getElementById('ctrl-vqe-mol')?.value || 'H2';
      params.bondDistance = document.getElementById('ctrl-vqe-dist')?.value || 0.74;
      params.iterations = document.getElementById('ctrl-vqe-iter')?.value || 20;
    }

    return params;
  }

  /* ------------------------------------------------------------
     SIMULATION EXECUTION & RESULTS DISPATCH
     ------------------------------------------------------------ */
  function executeSimulation() {
    if (!QL.AlgorithmsEngine) return;
    const params = getControlsParams();
    simulationResult = QL.AlgorithmsEngine.executeAlgorithm(currentAlgo.id, params);
    renderResultsPanel();
  }

  function renderResultsPanel() {
    const resContainer = document.getElementById('algo-results-content');
    if (!resContainer || !simulationResult) return;

    let html = '';
    const id = currentAlgo.id;

    if (id === 'deutsch-jozsa') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3);">
          <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--algo-cyan); font-weight:700;">Oracle Classification Result</div>
          <div style="font-size:1.4rem; font-weight:800; color:#fff; margin:0.3rem 0;">${simulationResult.decision} Function</div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); line-height:1.5;">${simulationResult.explanation}</div>
        </div>
        <div style="font-size:0.75rem; font-weight:700; color:var(--algo-text-sub); text-transform:uppercase; margin-bottom:0.5rem;">Measurement Shot Distribution (${simulationResult.shots} shots)</div>
        <div class="algo-bars-container">
          ${simulationResult.probabilities.map((p, idx) => {
            const stateStr = idx.toString(2).padStart(simulationResult.n, '0');
            const pct = (p * 100).toFixed(1);
            const count = simulationResult.counts ? simulationResult.counts[idx] : 0;
            return `
              <div class="algo-bar-row">
                <span class="algo-bar-label">|${stateStr}⟩</span>
                <div class="algo-bar-track"><div class="algo-bar-fill" style="width: ${pct}%;"></div></div>
                <span class="algo-bar-val">${pct}% (${count})</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (id === 'bernstein-vazirani') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3);">
          <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--algo-emerald); font-weight:700;">String Reconstruction</div>
          <div style="font-size:1.4rem; font-weight:800; color:#fff; font-family:var(--algo-font-mono); margin:0.3rem 0;">Measured s = "${simulationResult.measuredString}"</div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); line-height:1.5;">${simulationResult.explanation}</div>
          <div style="display:flex; gap:1.5rem; margin-top:0.75rem; font-size:0.82rem;">
            <div><strong style="color:var(--algo-cyan);">Quantum Queries:</strong> ${simulationResult.quantumQueries} query</div>
            <div><strong style="color:var(--algo-rose);">Classical Needed:</strong> ${simulationResult.classicalQueries} queries</div>
          </div>
        </div>
      `;
    } else if (id === 'grover') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--algo-cyan); font-weight:700;">Target State Probability</div>
              <div style="font-size:1.4rem; font-weight:800; color:#fff;">${(simulationResult.pTarget * 100).toFixed(1)}% at |${simulationResult.targetBin}⟩</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--algo-text-muted);">Optimal Iterations</span>
              <div style="font-size:1.1rem; font-weight:700; color:var(--algo-amber);">k ≈ ${simulationResult.optimalIterations}</div>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); margin-top:0.5rem;">${simulationResult.explanation}</div>
        </div>
        <div class="algo-bars-container">
          ${simulationResult.probabilities.slice(0, 8).map((p, idx) => {
            const isTarget = idx === simulationResult.target;
            const stateStr = idx.toString(2).padStart(simulationResult.n, '0');
            const pct = (p * 100).toFixed(1);
            return `
              <div class="algo-bar-row" style="${isTarget ? 'font-weight:700;' : ''}">
                <span class="algo-bar-label" style="${isTarget ? 'color:var(--algo-cyan);' : ''}">|${stateStr}⟩ ${isTarget ? '★' : ''}</span>
                <div class="algo-bar-track">
                  <div class="algo-bar-fill" style="width:${pct}%; ${isTarget ? 'background:linear-gradient(90deg, #06b6d4, #34d399);' : 'background:rgba(255,255,255,0.2);'}"></div>
                </div>
                <span class="algo-bar-val">${pct}%</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (id === 'qft') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.3);">
          <div style="font-size:0.75rem; text-transform:uppercase; color:#c084fc; font-weight:700;">Fourier Phase Representation</div>
          <div style="font-size:1.2rem; font-weight:800; color:#fff; margin:0.3rem 0;">Input |${simulationResult.inputBin}⟩ ↦ Equal Superposition with Harmonic Phase Gradient</div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub);">${simulationResult.explanation}</div>
        </div>
        <div style="font-size:0.75rem; font-weight:700; color:var(--algo-text-sub); text-transform:uppercase; margin-bottom:0.5rem;">Phase Angles Across Output Modes</div>
        <div class="algo-bars-container">
          ${simulationResult.phases.map((deg, idx) => {
            const stateStr = idx.toString(2).padStart(simulationResult.n, '0');
            return `
              <div class="algo-bar-row">
                <span class="algo-bar-label">|${stateStr}⟩</span>
                <div class="algo-bar-track"><div class="algo-bar-fill" style="width:${(deg / 360 * 100).toFixed(0)}%; background:linear-gradient(90deg, #7c3aed, #ec4899);"></div></div>
                <span class="algo-bar-val">${deg.toFixed(0)}°</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (id === 'qaoa') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--algo-amber); font-weight:700;">MaxCut Optimization</div>
              <div style="font-size:1.3rem; font-weight:800; color:#fff;">Expected Cut: ${simulationResult.expCost} / ${simulationResult.maxCut}</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--algo-text-muted);">Approximation Ratio</span>
              <div style="font-size:1.1rem; font-weight:700; color:var(--algo-emerald);">${(simulationResult.approxRatio * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); margin-top:0.4rem;">${simulationResult.explanation}</div>
        </div>
      `;
    } else if (id === 'quantum-annealing') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(244,63,94,0.1); border:1px solid rgba(244,63,94,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--algo-rose); font-weight:700;">Adiabatic Ground State</div>
              <div style="font-size:1.3rem; font-weight:800; color:#fff;">Configuration: |${simulationResult.groundState}⟩</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--algo-text-muted);">Success Fidelity</span>
              <div style="font-size:1.1rem; font-weight:700; color:var(--algo-emerald);">${(simulationResult.successProb * 100).toFixed(0)}%</div>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); margin-top:0.4rem;">${simulationResult.explanation}</div>
        </div>
      `;
    } else if (id === 'qsvm') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--algo-cyan); font-weight:700;">Quantum Kernel SVM Accuracy</div>
              <div style="font-size:1.3rem; font-weight:800; color:#fff;">Train: ${simulationResult.trainAccuracy} | Test: ${simulationResult.testAccuracy}</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--algo-text-muted);">Support Vectors</span>
              <div style="font-size:1.1rem; font-weight:700; color:var(--algo-violet);">${simulationResult.supportVectorsCount} points</div>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); margin-top:0.4rem;">${simulationResult.explanation}</div>
        </div>
        <div style="font-size:0.75rem; font-weight:700; color:var(--algo-text-sub); text-transform:uppercase; margin-bottom:0.3rem;">12×12 Quantum Transition Kernel Heatmap K_ij</div>
        <div class="algo-heatmap-grid" style="grid-template-columns: repeat(12, 1fr);">
          ${simulationResult.kernelMatrix.map(row => row.map(val => `
            <div class="algo-heatmap-cell" style="background: rgba(6, 182, 212, ${val});" title="K_ij = ${val}"></div>
          `).join('')).join('')}
        </div>
      `;
    } else if (id === 'quantum-kernel-alignment') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:#a78bfa; font-weight:700;">Kernel Alignment Metric A(K_θ, Y)</div>
              <div style="font-size:1.3rem; font-weight:800; color:#fff;">${simulationResult.initialScore} ➔ ${simulationResult.finalScore}</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--algo-text-muted);">Improvement</span>
              <div style="font-size:1.1rem; font-weight:700; color:var(--algo-emerald);">+${simulationResult.improvement}%</div>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); margin-top:0.4rem;">${simulationResult.explanation}</div>
        </div>
      `;
    } else if (id === 'vqc') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(236,72,153,0.1); border:1px solid rgba(236,72,153,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:#f472b6; font-weight:700;">VQC Optimization Metrics</div>
              <div style="font-size:1.3rem; font-weight:800; color:#fff;">Accuracy: ${simulationResult.finalAccuracy} | Loss: ${simulationResult.finalLoss}</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--algo-text-muted);">Parameters</span>
              <div style="font-size:1.1rem; font-weight:700; color:var(--algo-cyan);">${simulationResult.parameterCount} angles</div>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); margin-top:0.4rem;">${simulationResult.explanation}</div>
        </div>
      `;
    } else if (id === 'qnn') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.3);">
          <div style="font-size:0.75rem; text-transform:uppercase; color:#c084fc; font-weight:700;">Quantum Neural Classification</div>
          <div style="font-size:1.3rem; font-weight:800; color:#fff; margin:0.3rem 0;">Predicted: ${simulationResult.detectedClass} (${simulationResult.fidelity})</div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub);">${simulationResult.explanation}</div>
        </div>
      `;
    } else if (id === 'qpe') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--algo-cyan); font-weight:700;">Phase Estimation Result</div>
              <div style="font-size:1.3rem; font-weight:800; color:#fff;">Estimated φ = ${simulationResult.estimatedPhase} (True: ${simulationResult.truePhase})</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--algo-text-muted);">Peak Fidelity</span>
              <div style="font-size:1.1rem; font-weight:700; color:var(--algo-emerald);">${(simulationResult.maxProb * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); margin-top:0.4rem;">${simulationResult.explanation}</div>
        </div>
      `;
    } else if (id === 'vqe') {
      html += `
        <div style="margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--algo-emerald); font-weight:700;">Ground-State Energy Estimate</div>
              <div style="font-size:1.3rem; font-weight:800; color:#fff;">E(VQE) = ${simulationResult.calculatedEnergy} Ha</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--algo-text-muted);">Exact FCI Energy</span>
              <div style="font-size:1.1rem; font-weight:700; color:var(--algo-cyan);">${simulationResult.exactEnergy} Ha</div>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--algo-text-sub); margin-top:0.4rem;">${simulationResult.explanation}</div>
          <div style="margin-top:0.6rem; font-size:0.82rem; font-weight:600; color:${simulationResult.chemicalAccuracyMet ? 'var(--algo-emerald)' : 'var(--algo-amber)'};">
            ${simulationResult.chemicalAccuracyMet ? '✓ Chemical accuracy achieved (< 1.6 mHa deviation)' : 'Approaching chemical accuracy threshold'}
          </div>
        </div>
      `;
    }

    resContainer.innerHTML = html;
  }

  /* ------------------------------------------------------------
     INTERACTIVE 3D & 2D CANVAS VISUALIZER
     ------------------------------------------------------------ */
  function initVisualizer() {
    const container = document.getElementById('algo-canvas-mount');
    if (!container) return;

    container.innerHTML = '';
    const id = currentAlgo.id;

    // Use Three.js for 3D visualizations: QAOA, Annealing, QNN, VQE, Bloch
    if (['qaoa', 'quantum-annealing', 'qnn', 'vqe', 'grover'].includes(id) && window.THREE) {
      initThreeScene(container, id);
    } else {
      init2DCanvas(container, id);
    }
  }

  function initThreeScene(container, id) {
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 350;

    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeRenderer.setSize(width, height);
    threeRenderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(threeRenderer.domElement);

    if (window.THREE.OrbitControls) {
      threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
      threeControls.enableDamping = true;
      threeControls.dampingFactor = 0.05;
    }

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    threeScene.add(amb);
    const dir = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dir.position.set(5, 10, 7);
    threeScene.add(dir);

    // Build specific 3D scene
    customObjects = {};

    if (id === 'grover') {
      // 3D Subspace state vector rotation on Bloch Sphere
      threeCamera.position.set(0, 0, 4.2);
      const sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.15 });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      threeScene.add(sphere);

      // State vector arrow
      const dirVec = new THREE.Vector3(1, 0, 0).normalize();
      const arrow = new THREE.ArrowHelper(dirVec, new THREE.Vector3(0, 0, 0), 1.5, 0x06b6d4, 0.3, 0.15);
      threeScene.add(arrow);
      customObjects.arrow = arrow;
    } else if (id === 'qaoa') {
      // 3D Cost Landscape Surface over (γ, β)
      threeCamera.position.set(4, 4, 5);
      threeControls?.target.set(0, 0, 0);

      const gridGeo = new THREE.PlaneGeometry(4, 4, 30, 30);
      const pos = gridGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = 0.5 * Math.sin(x * 2) * Math.cos(y * 2) + 0.3 * Math.sin(x * 3 + y * 2);
        pos.setZ(i, z);
      }
      gridGeo.computeVertexNormals();
      const gridMat = new THREE.MeshPhongMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.7 });
      const surface = new THREE.Mesh(gridGeo, gridMat);
      surface.rotation.x = -Math.PI / 2;
      threeScene.add(surface);

      // Current parameter ball
      const ballGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const ballMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const ball = new THREE.Mesh(ballGeo, ballMat);
      ball.position.set(0, 0.6, 0);
      threeScene.add(ball);
      customObjects.ball = ball;
    } else if (id === 'quantum-annealing') {
      // 3D Rugged Energy Landscape with double-well potential
      threeCamera.position.set(0, 3.5, 5);
      const landscapeGeo = new THREE.PlaneGeometry(6, 4, 40, 30);
      const pos = landscapeGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Double well: W(x) = (x^2 - 1)^2 - y^2
        const z = 0.35 * (Math.pow(x * 0.8, 4) - 2 * Math.pow(x * 0.8, 2)) + 0.15 * Math.sin(y * 2);
        pos.setZ(i, z);
      }
      landscapeGeo.computeVertexNormals();
      const landscapeMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, wireframe: true, roughness: 0.3 });
      const mesh = new THREE.Mesh(landscapeGeo, landscapeMat);
      mesh.rotation.x = -Math.PI / 2.3;
      threeScene.add(mesh);

      // Quantum tunneling wavepacket
      const packetGeo = new THREE.SphereGeometry(0.18, 20, 20);
      const packetMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      threeScene.add(packet);
      customObjects.packet = packet;
    } else if (id === 'qnn') {
      // 3D layered neural network nodes & quantum entanglement bridges
      threeCamera.position.set(0, 0, 5);
      const layers = [-2, -0.7, 0.7, 2];
      const nodesGroup = new THREE.Group();

      layers.forEach((lx, lIdx) => {
        const count = lIdx === 0 ? 4 : lIdx === 3 ? 3 : 4;
        for (let i = 0; i < count; i++) {
          const ny = (i - (count - 1) / 2) * 0.85;
          const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
          const nodeMat = new THREE.MeshStandardMaterial({ color: lIdx === 0 ? 0x38bdf8 : lIdx === 3 ? 0x34d399 : 0xc084fc });
          const node = new THREE.Mesh(nodeGeo, nodeMat);
          node.position.set(lx, ny, 0);
          nodesGroup.add(node);
        }
      });
      threeScene.add(nodesGroup);
      customObjects.qnnGroup = nodesGroup;
    } else if (id === 'vqe') {
      // 3D H2 Molecular Geometry with bond axis and electron cloud
      threeCamera.position.set(0, 0, 4);
      const atomGeo = new THREE.SphereGeometry(0.4, 24, 24);
      const atomMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 });
      const atom1 = new THREE.Mesh(atomGeo, atomMat);
      const atom2 = new THREE.Mesh(atomGeo, atomMat);
      atom1.position.set(-0.74, 0, 0);
      atom2.position.set(0.74, 0, 0);
      threeScene.add(atom1);
      threeScene.add(atom2);

      // Bond cylinder
      const bondGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.48, 16);
      const bondMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const bond = new THREE.Mesh(bondGeo, bondMat);
      bond.rotation.z = Math.PI / 2;
      threeScene.add(bond);

      customObjects.atom1 = atom1;
      customObjects.atom2 = atom2;
      customObjects.bond = bond;
    }

    function animateThree() {
      threeAnimFrame = requestAnimationFrame(animateThree);
      threeControls?.update();

      const time = Date.now() * 0.002;

      if (id === 'grover' && customObjects.arrow) {
        const theta = (simulationResult?.target ? 1.2 : 0.4) + Math.sin(time) * 0.1;
        customObjects.arrow.setDirection(new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0));
      } else if (id === 'qaoa' && customObjects.ball) {
        customObjects.ball.position.x = Math.sin(time * 0.8) * 1.2;
        customObjects.ball.position.z = Math.cos(time * 0.8) * 1.2;
        customObjects.ball.position.y = 0.4 + 0.3 * Math.sin(time * 1.6);
      } else if (id === 'quantum-annealing' && customObjects.packet) {
        // Tunnel between wells
        customObjects.packet.position.x = Math.sin(time * 1.2) * 1.6;
        customObjects.packet.position.z = 0;
        customObjects.packet.position.y = 0.2 - 0.2 * Math.cos(time * 2.4);
      } else if (id === 'vqe' && customObjects.atom1 && customObjects.atom2) {
        const d = parseFloat(simulationResult?.bondDistance || 0.74);
        const vib = Math.sin(time * 3) * 0.03;
        customObjects.atom1.position.x = -(d / 2 + vib);
        customObjects.atom2.position.x = (d / 2 + vib);
        if (customObjects.bond) customObjects.bond.scale.y = (d + 2 * vib) / 1.48;
      }

      threeRenderer.render(threeScene, threeCamera);
    }
    animateThree();
  }

  function init2DCanvas(container, id) {
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth || 600;
    canvas.height = container.clientHeight || 350;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      if (id === 'deutsch-jozsa' || id === 'bernstein-vazirani') {
        // Quantum Phase Kickback & Interference Wave diagram
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, h / 2);
        ctx.lineTo(w - 40, h / 2);
        ctx.stroke();

        const isConst = simulationResult?.decision === 'Constant';
        const t = Date.now() * 0.003;

        // Draw interference waves
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isConst ? '#10b981' : '#06b6d4';
        ctx.beginPath();
        for (let x = 40; x < w - 40; x++) {
          const y = h / 2 + Math.sin((x * 0.03) + t) * (isConst ? 50 : 25 * Math.sin(x * 0.01));
          if (x === 40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '13px JetBrains Mono';
        ctx.fillText(isConst ? 'Constructive Superposition Focus (P=1.0 at |0...0⟩)' : 'Destructive Orthogonal Cancellation (P=0.0 at |0...0⟩)', 50, 45);
      } else if (id === 'qft') {
        // Phasor Wheels across frequency channels
        const N = simulationResult?.N || 8;
        const radius = Math.min(32, w / (N * 2.8));
        const spacing = (w - 80) / N;

        for (let i = 0; i < N; i++) {
          const cx = 50 + i * spacing + spacing / 2;
          const cy = h / 2;
          const deg = simulationResult?.phases ? simulationResult.phases[i] : 0;
          const rad = (deg * Math.PI) / 180;

          // Dial circle
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Phasor needle
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius);
          ctx.stroke();

          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(`|${i}⟩`, cx, cy + radius + 18);
          ctx.fillText(`${deg.toFixed(0)}°`, cx, cy - radius - 8);
        }
      } else if (id === 'qsvm' || id === 'quantum-kernel-alignment') {
        // 2D Decision Boundary Contour & Dataset Points
        const points = simulationResult?.points || [];
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.38;

        // Draw decision boundary ring
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, scale * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Points
        points.forEach(pt => {
          const px = cx + pt.x1 * scale;
          const py = cy - pt.x2 * scale;
          ctx.fillStyle = pt.label === 1 ? '#06b6d4' : '#ec4899';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#fff';
        ctx.font = '12px JetBrains Mono';
        ctx.fillText('Quantum Hilbert Space Feature Boundary', 40, 35);
      } else if (id === 'vqc') {
        // Loss and Accuracy Convergence Plot
        const history = simulationResult?.history || [];
        if (history.length > 1) {
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          history.forEach((pt, i) => {
            const x = 50 + (i / (history.length - 1)) * (w - 100);
            const y = h - 50 - (parseFloat(pt.accuracy) / 100) * (h - 100);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          });
          ctx.stroke();

          ctx.fillStyle = '#f472b6';
          ctx.font = '12px JetBrains Mono';
          ctx.fillText(`Training Accuracy Convergence: ${simulationResult.finalAccuracy}`, 50, 40);
        }
      } else if (id === 'qpe') {
        // Circular Phase Clock
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.35;

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        const truePhase = parseFloat(simulationResult?.truePhase || 0.375);
        const estPhase = parseFloat(simulationResult?.estimatedPhase || 0.375);

        // True phase needle
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(truePhase * 2 * Math.PI - Math.PI / 2) * r, cy + Math.sin(truePhase * 2 * Math.PI - Math.PI / 2) * r);
        ctx.stroke();

        // Estimated phase needle
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(estPhase * 2 * Math.PI - Math.PI / 2) * (r + 10), cy + Math.sin(estPhase * 2 * Math.PI - Math.PI / 2) * (r + 10));
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`Estimated Phase: ${estPhase.toFixed(3)} | Target: ${truePhase.toFixed(3)}`, cx, cy + r + 28);
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  function updateVisualizer() {
    // Re-renders or updates visualizer objects based on simulationResult
  }

  /* ------------------------------------------------------------
     STEP-BY-STEP PLAYBACK CONTROLS
     ------------------------------------------------------------ */
  function setupActions() {
    const runBtn = document.getElementById('algo-btn-run');
    const stepBtn = document.getElementById('algo-btn-step');
    const pauseBtn = document.getElementById('algo-btn-pause');
    const resetBtn = document.getElementById('algo-btn-reset');
    const fsBtn = document.getElementById('algo-btn-fullscreen');

    if (runBtn) runBtn.addEventListener('click', runAlgorithm);
    if (stepBtn) stepBtn.addEventListener('click', stepAlgorithm);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseAlgorithm);
    if (resetBtn) resetBtn.addEventListener('click', resetAlgorithm);
    if (fsBtn) fsBtn.addEventListener('click', toggleFullscreen);

    // Tab buttons
    document.querySelectorAll('.algo-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.algo-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.algo-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById(`pane-${btn.dataset.tab}`);
        if (pane) pane.classList.add('active');
      });
    });
  }

  function runAlgorithm() {
    if (isRunning) return;
    isRunning = true;
    currentStep = 0;
    updateTimelineUI();

    runInterval = setInterval(() => {
      if (currentStep < currentAlgo.steps.length - 1) {
        currentStep++;
        updateTimelineUI();
      } else {
        pauseAlgorithm();
        executeSimulation();
      }
    }, 1200);
  }

  function stepAlgorithm() {
    pauseAlgorithm();
    if (currentStep < currentAlgo.steps.length - 1) {
      currentStep++;
    } else {
      currentStep = 0;
    }
    updateTimelineUI();
  }

  function pauseAlgorithm() {
    isRunning = false;
    if (runInterval) {
      clearInterval(runInterval);
      runInterval = null;
    }
    updateTimelineUI();
  }

  function resetAlgorithm() {
    pauseAlgorithm();
    currentStep = 0;
    updateTimelineUI();
    executeSimulation();
    if (threeControls) threeControls.reset();
  }

  function goToStep(stepIdx) {
    pauseAlgorithm();
    currentStep = stepIdx;
    updateTimelineUI();
  }

  function toggleFullscreen() {
    const card = document.getElementById('algo-canvas-card');
    if (!card) return;
    card.classList.toggle('algo-fullscreen-active');
    setTimeout(() => {
      if (threeRenderer && threeCamera) {
        const w = card.clientWidth;
        const h = card.clientHeight;
        threeCamera.aspect = w / h;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(w, h);
      }
    }, 100);
  }

  /* ------------------------------------------------------------
     BOTTOM DEEP DIVE TABS CONTENT
     ------------------------------------------------------------ */
  function renderDeepDiveTabs() {
    // Theory Tab
    const theoryContent = document.getElementById('pane-theory-content');
    if (theoryContent) {
      theoryContent.innerHTML = `
        <div class="algo-text-block"><strong>Algorithm Aim:</strong> ${currentAlgo.aim}</div>
        <div class="algo-text-block">${currentAlgo.theory}</div>
      `;
    }

    // Circuit Steps Tab
    const stepsContent = document.getElementById('pane-steps-content');
    if (stepsContent) {
      stepsContent.innerHTML = `
        <div class="algo-text-block">Detailed execution breakdown of the quantum circuit transformations:</div>
        ${currentAlgo.steps.map((s, i) => `
          <div style="margin-bottom:1.25rem;">
            <div style="font-weight:700; color:var(--algo-cyan); margin-bottom:0.25rem;">Step ${i + 1}: ${s.name}</div>
            <div style="color:var(--algo-text-sub); line-height:1.55;">${s.desc}</div>
          </div>
        `).join('')}
      `;
    }

    // Complexity Tab
    const compContent = document.getElementById('pane-complexity-content');
    if (compContent && currentAlgo.complexity) {
      const comp = currentAlgo.complexity;
      compContent.innerHTML = `
        <div class="algo-text-block">Asymptotic computational and query scaling for ${currentAlgo.name}:</div>
        <table class="algo-complexity-table">
          <thead>
            <tr>
              <th>Metric / Resource</th>
              <th>Classical Approach</th>
              <th>Quantum Algorithm</th>
              <th>Theoretical Speedup</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Query Complexity</strong></td>
              <td>${comp.classicalQuery || comp.classicalTime || 'O(N)'}</td>
              <td style="color:var(--algo-cyan); font-weight:700;">${comp.quantumQuery || comp.quantumTime || 'O(√N)'}</td>
              <td style="color:var(--algo-emerald); font-weight:700;">${comp.advantage || 'Substantial Advantage'}</td>
            </tr>
            <tr>
              <td><strong>Gate / Circuit Depth</strong></td>
              <td>Classical Logic Units</td>
              <td>${comp.quantumTime || comp.gateScaling || 'O(n²)'}</td>
              <td>Optimized Unitary Compilation</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    // Takeaways & References Tab
    const refContent = document.getElementById('pane-references-content');
    if (refContent) {
      refContent.innerHTML = `
        <div style="font-weight:700; color:var(--algo-text-main); margin-bottom:0.75rem;">Key Conceptual Takeaways:</div>
        <div style="margin-bottom:1.5rem;">
          ${(currentAlgo.takeaways || []).map(t => `
            <div class="algo-takeaway-item">
              <span class="algo-takeaway-dot">✓</span>
              <span>${t}</span>
            </div>
          `).join('')}
        </div>
        <div style="font-weight:700; color:var(--algo-text-main); margin-bottom:0.75rem;">Academic References & Foundational Literature:</div>
        <div>
          ${(currentAlgo.references || []).map(r => `
            <div class="algo-reference-item">${r}</div>
          `).join('')}
        </div>
      `;
    }
  }

  return {
    init,
    runAlgorithm,
    stepAlgorithm,
    pauseAlgorithm,
    resetAlgorithm
  };
})();
