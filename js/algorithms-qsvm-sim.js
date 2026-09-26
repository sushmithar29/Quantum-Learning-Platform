/* ============================================================
   QUANTUMLAB – QUANTUM SUPPORT VECTOR MACHINE (QSVM) SIMULATOR
   Exact 1:1 Implementation of the Reference Virtual Lab Simulation
   Features:
   - Welcome Screen with "Start Experiment"
   - 5-Step Guided Stepper Bar
   - Step 1: Data Selection (Linear, Circular, XOR) with 2D Scatter Canvas
   - Step 2: Classical SVM with Hyperplane, Margin & Support Vectors
   - Step 3: Quantum Feature Map (Z/ZZ, Depth 1-3, Entanglement Linear/Full/Circular),
             Dynamic Quantum Circuit Diagram & Kernel Heatmap
   - Step 4: Quantum SVM with Non-Linear Contour Boundary & Support Vectors
   - Step 5: Side-by-Side Comparison (Classical 48% vs Quantum 100%) & Restart
   ============================================================ */

window.QL = window.QL || {};

QL.QSVMSimulator = (function () {
  let state = {
    screen: 'welcome', // 'welcome' | 'step'
    step: 1,           // 1 to 5
    dataset: 'xor',    // 'linear' | 'circular' | 'xor'
    featureMap: 'ZZFeatureMap', // 'ZFeatureMap' | 'ZZFeatureMap'
    depth: 1,          // 1, 2, 3
    entanglement: 'linear', // 'linear' | 'full' | 'circular'
    classicalRunning: false,
    classicalDone: false,
    quantumRunning: false,
    quantumDone: false
  };

  // State for dynamic transitions
  let transitionState = {
    active: false,
    progress: 1,
    startTime: 0,
    duration: 800,
    particles: [] // Array of { curX, curY, startX, startY, targetX, targetY, curLabel, startLabel, targetLabel }
  };
  let animationFrameId = null;

  // Fixed deterministic datasets with authentic distribution & jitter
  const DATASETS = {
    linear: {
      name: 'Linear Dataset',
      desc: 'Easily separable by a straight line.',
      classicalAcc: '96%',
      quantumAcc: '100%',
      classicalBoundaryDesc: 'The classical SVM finds an optimal linear hyperplane separating the two distinct clusters.',
      quantumBoundaryDesc: 'The quantum feature map projects the data into quantum Hilbert space, easily preserving linear separability.',
      conclusion: 'For linearly separable data, both classical and quantum SVMs achieve near-perfect classification. The quantum feature map preserves separability while projecting into Hilbert space.',
      points: [
        // Class 1 (Green) centered top-left
        { x: -0.65, y: 0.55, label: 1 }, { x: -0.52, y: 0.72, label: 1 }, { x: -0.42, y: 0.45, label: 1 },
        { x: -0.75, y: 0.38, label: 1 }, { x: -0.58, y: 0.62, label: 1 }, { x: -0.35, y: 0.68, label: 1 },
        { x: -0.48, y: 0.32, label: 1 }, { x: -0.62, y: 0.48, label: 1 }, { x: -0.70, y: 0.65, label: 1 },
        { x: -0.38, y: 0.52, label: 1 }, { x: -0.55, y: 0.40, label: 1 }, { x: -0.45, y: 0.58, label: 1 },
        { x: -0.68, y: 0.50, label: 1 }, { x: -0.50, y: 0.65, label: 1 }, { x: -0.32, y: 0.42, label: 1 },
        // Class -1 (Red) centered bottom-right
        { x: 0.65, y: -0.55, label: -1 }, { x: 0.52, y: -0.72, label: -1 }, { x: 0.42, y: -0.45, label: -1 },
        { x: 0.75, y: -0.38, label: -1 }, { x: 0.58, y: -0.62, label: -1 }, { x: 0.35, y: -0.68, label: -1 },
        { x: 0.48, y: -0.32, label: -1 }, { x: 0.62, y: -0.48, label: -1 }, { x: 0.70, y: -0.65, label: -1 },
        { x: 0.38, y: -0.52, label: -1 }, { x: 0.55, y: -0.40, label: -1 }, { x: 0.45, y: -0.58, label: -1 },
        { x: 0.68, y: -0.50, label: -1 }, { x: 0.50, y: -0.65, label: -1 }, { x: 0.32, y: -0.42, label: -1 }
      ],
      supportVectorIndices: [2, 6, 9, 14, 17, 21, 24, 29]
    },
    circular: {
      name: 'Circular Dataset',
      desc: 'Requires a non-linear boundary (circle).',
      classicalAcc: '52%',
      quantumAcc: '98%',
      classicalBoundaryDesc: 'The classical linear SVM attempts to draw a straight line through the concentric circles, failing to separate the inner cluster from the outer ring.',
      quantumBoundaryDesc: 'The quantum feature map maps radial Euclidean distances into orthogonal quantum state phases, creating a natural circular boundary in 2D.',
      conclusion: 'A classical linear SVM cannot separate concentric distributions. The quantum feature map\'s phase encoding naturally maps radial distances to orthogonal quantum state angles, yielding an accurate non-linear boundary.',
      points: [
        // Class 1 (Green) inner cluster (r < 0.4)
        { x: 0.05, y: 0.08, label: 1 }, { x: -0.12, y: 0.15, label: 1 }, { x: 0.18, y: -0.05, label: 1 },
        { x: -0.08, y: -0.18, label: 1 }, { x: 0.22, y: 0.12, label: 1 }, { x: -0.20, y: 0.02, label: 1 },
        { x: 0.02, y: 0.25, label: 1 }, { x: 0.15, y: -0.20, label: 1 }, { x: -0.14, y: -0.12, label: 1 },
        { x: 0.28, y: -0.02, label: 1 }, { x: -0.02, y: -0.28, label: 1 }, { x: 0.10, y: 0.22, label: 1 },
        { x: -0.25, y: 0.16, label: 1 }, { x: 0.00, y: 0.00, label: 1 }, { x: -0.06, y: 0.05, label: 1 },
        // Class -1 (Red) outer ring (r ~ 0.7 - 0.85)
        { x: 0.72, y: 0.20, label: -1 }, { x: 0.58, y: 0.52, label: -1 }, { x: 0.22, y: 0.75, label: -1 },
        { x: -0.25, y: 0.74, label: -1 }, { x: -0.62, y: 0.48, label: -1 }, { x: -0.78, y: 0.15, label: -1 },
        { x: -0.74, y: -0.28, label: -1 }, { x: -0.50, y: -0.62, label: -1 }, { x: -0.15, y: -0.76, label: -1 },
        { x: 0.28, y: -0.72, label: -1 }, { x: 0.65, y: -0.45, label: -1 }, { x: 0.78, y: -0.10, label: -1 },
        { x: 0.45, y: 0.65, label: -1 }, { x: -0.42, y: 0.68, label: -1 }, { x: -0.68, y: -0.40, label: -1 }
      ],
      supportVectorIndices: [4, 6, 9, 11, 15, 17, 21, 24]
    },
    xor: {
      name: 'Xor Dataset',
      desc: 'The classic non-linear XOR problem.',
      classicalAcc: '48%',
      quantumAcc: '100%',
      classicalBoundaryDesc: 'The classical linear SVM tries to draw a straight line (hyperplane) to separate the classes. Notice how a straight line fails to properly separate this non-linear data.',
      quantumBoundaryDesc: 'Using the quantum kernel, the SVM can now find a linear hyperplane in the high-dimensional quantum space, which translates to a highly non-linear and complex decision boundary in our original 2D space.',
      conclusion: 'The XOR problem is notoriously difficult for linear models. The classical SVM fails, but the QSVM\'s complex entanglement allows it to map the data into a space where it is perfectly linearly separable.',
      points: [
        // Class 1 (Green) - Top-Left (Q2)
        { x: -0.45, y: 0.62, label: 1 }, { x: -0.60, y: 0.45, label: 1 }, { x: -0.32, y: 0.75, label: 1 },
        { x: -0.72, y: 0.68, label: 1 }, { x: -0.55, y: 0.82, label: 1 }, { x: -0.25, y: 0.50, label: 1 },
        { x: -0.68, y: 0.32, label: 1 }, { x: -0.40, y: 0.42, label: 1 },
        // Class 1 (Green) - Bottom-Right (Q4)
        { x: 0.45, y: -0.62, label: 1 }, { x: 0.60, y: -0.45, label: 1 }, { x: 0.32, y: -0.75, label: 1 },
        { x: 0.72, y: -0.68, label: 1 }, { x: 0.55, y: -0.82, label: 1 }, { x: 0.25, y: -0.50, label: 1 },
        { x: 0.68, y: -0.32, label: 1 }, { x: 0.40, y: -0.42, label: 1 },
        // Class -1 (Red) - Top-Right (Q1)
        { x: 0.45, y: 0.62, label: -1 }, { x: 0.60, y: 0.45, label: -1 }, { x: 0.32, y: 0.75, label: -1 },
        { x: 0.72, y: 0.68, label: -1 }, { x: 0.55, y: 0.82, label: -1 }, { x: 0.25, y: 0.50, label: -1 },
        { x: 0.68, y: 0.32, label: -1 }, { x: 0.40, y: 0.42, label: -1 },
        // Class -1 (Red) - Bottom-Left (Q3)
        { x: -0.45, y: -0.62, label: -1 }, { x: -0.60, y: -0.45, label: -1 }, { x: -0.32, y: -0.75, label: -1 },
        { x: -0.72, y: -0.68, label: -1 }, { x: -0.55, y: -0.82, label: -1 }, { x: -0.25, y: -0.50, label: -1 },
        { x: -0.68, y: -0.32, label: -1 }, { x: -0.40, y: -0.42, label: -1 }
      ],
      supportVectorIndices: [0, 5, 7, 8, 13, 15, 16, 21, 23, 24, 29, 31]
    }
  };

  let containerEl = null;

  function mount(element) {
    containerEl = element;
    render();
  }

  function render() {
    if (!containerEl) return;
    if (state.screen === 'welcome') {
      renderWelcome();
    } else {
      renderSteps();
    }
  }

  /* ------------------------------------------------------------
     1. WELCOME SCREEN (Matches frame 00:02 of reference video)
     ------------------------------------------------------------ */
  function renderWelcome() {
    containerEl.innerHTML = `
      <div class="qsvm-sim-wrap">
        <div class="qsvm-welcome-card">
          <div class="qsvm-welcome-badge">
            <span class="qsvm-badge-dot"></span> Interactive Simulation
          </div>
          <h2 class="qsvm-welcome-title">Quantum Support Vector Machines</h2>
          <p class="qsvm-welcome-desc">
            Explore how quantum computing can enhance machine learning. This interactive experiment demonstrates how classical data can be mapped into a high-dimensional quantum state space to solve complex classification problems.
          </p>
          <div class="qsvm-welcome-feature">
            <div class="qsvm-feat-icon">⚡</div>
            <div class="qsvm-feat-content">
              <strong>Classical vs Quantum</strong>
              <span>Compare standard linear SVMs against quantum-enhanced models with real-time mathematical state simulations.</span>
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
     2. 5-STEP GUIDED SIMULATION CONTAINER
     ------------------------------------------------------------ */
  function renderSteps() {
    const curDataset = DATASETS[state.dataset];

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
          <!-- LEFT PANEL: CONTROLS & EXPLANATION -->
          <div class="qsvm-panel-left" id="qsvm-panel-left-content">
            <!-- Dynamic left content based on state.step -->
          </div>

          <!-- RIGHT PANEL: DYNAMIC SCIENTIFIC VISUALIZER -->
          <div class="qsvm-panel-right" id="qsvm-panel-right-content">
            <!-- Dynamic right content based on state.step -->
          </div>
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
        // Can jump backwards or to next available step
        if (targetStep <= state.step || (targetStep === state.step + 1 && canAdvance())) {
          state.step = targetStep;
          renderSteps();
        }
      });
    });
  }

  function canAdvance() {
    if (state.step === 2 && !state.classicalDone) return false;
    if (state.step === 4 && !state.quantumDone) return false;
    return true;
  }

  /* ------------------------------------------------------------
     3. LEFT PANEL RENDERING (Steps 1 to 5)
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
            Support Vector Machines (SVM) are supervised learning models used for classification. They work by finding the hyperplane that best separates different classes. Let's start by selecting a dataset.
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
              <div class="qsvm-dataset-sub">Requires a non-linear boundary (circle).</div>
            </div>
          </div>

          <div class="qsvm-dataset-card ${state.dataset === 'xor' ? 'active' : ''}" data-dataset="xor">
            <div class="qsvm-dataset-radio"></div>
            <div>
              <div class="qsvm-dataset-name">Xor Dataset</div>
              <div class="qsvm-dataset-sub">The classic non-linear XOR problem.</div>
            </div>
          </div>
        </div>

        <div class="qsvm-nav-actions">
          <button class="qsvm-btn-secondary" disabled>Back</button>
          <button class="qsvm-btn-primary" id="qsvm-next-btn">Next Step &rarr;</button>
        </div>
      `;

      // Event listeners for dataset selection
      leftEl.querySelectorAll('.qsvm-dataset-card').forEach(card => {
        card.addEventListener('click', () => {
          const ds = card.getAttribute('data-dataset');
          if (state.dataset !== ds) {
            initTransition(state.dataset, ds);
            state.dataset = ds;
            state.classicalDone = false;
            state.quantumDone = false;
            renderSteps();
          }
        });
      });

      document.getElementById('qsvm-next-btn').onclick = () => {
        state.step = 2;
        renderSteps();
      };

    } else if (state.step === 2) {
      // STEP 2: CLASSICAL SVM
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 2</div>
          <h3 class="qsvm-panel-title">Classical SVM</h3>
          <p class="qsvm-panel-text">
            A Classical SVM with a Linear Kernel attempts to draw a straight line to separate the classes. Let's see how it performs on the selected dataset.
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
            renderLeftPanel();
            renderRightPanel();
          }, 700);
        };
      }

      document.getElementById('qsvm-back-btn').onclick = () => {
        state.step = 1;
        renderSteps();
      };
      const nextBtn = document.getElementById('qsvm-next-btn');
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (state.classicalDone) {
            state.step = 3;
            renderSteps();
          }
        };
      }

    } else if (state.step === 3) {
      // STEP 3: QUANTUM FEATURE MAP
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 3</div>
          <h3 class="qsvm-panel-title">Quantum Feature Map</h3>
          <p class="qsvm-panel-text">
            To solve complex non-linear problems, QSVM maps data into a high-dimensional quantum state space using a Quantum Feature Map.
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
          <label class="qsvm-config-label">ENTANGLEMENT</label>
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

      // Event listeners for feature map toggles
      leftEl.querySelectorAll('[data-val]').forEach(btn => {
        btn.onclick = () => {
          state.featureMap = btn.getAttribute('data-val');
          renderLeftPanel();
          renderRightPanel();
        };
      });
      leftEl.querySelectorAll('[data-depth]').forEach(btn => {
        btn.onclick = () => {
          state.depth = parseInt(btn.getAttribute('data-depth'), 10);
          renderLeftPanel();
          renderRightPanel();
        };
      });
      leftEl.querySelectorAll('[data-ent]').forEach(btn => {
        btn.onclick = () => {
          state.entanglement = btn.getAttribute('data-ent');
          renderLeftPanel();
          renderRightPanel();
        };
      });

      document.getElementById('qsvm-back-btn').onclick = () => {
        state.step = 2;
        renderSteps();
      };
      document.getElementById('qsvm-next-btn').onclick = () => {
        state.step = 4;
        renderSteps();
      };

    } else if (state.step === 4) {
      // STEP 4: QUANTUM SVM
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 4</div>
          <h3 class="qsvm-panel-title">Quantum SVM</h3>
          <p class="qsvm-panel-text">
            The quantum computer calculates the kernel matrix (inner products of quantum states). This matrix is then fed into a classical SVM optimizer to find the decision boundary.
          </p>
        </div>

        <div style="margin: 1.5rem 0;">
          ${!state.quantumDone ? `
            <button class="qsvm-btn-primary ${state.quantumRunning ? 'loading' : ''}" id="qsvm-run-quantum-btn" style="width:100%;">
              ${state.quantumRunning ? '<span class="qsvm-spinner"></span> Quantum State Optimization...' : '&#9654; Run QSVM'}
            </button>
          ` : `
            <div class="qsvm-completed-badge">
              &#10003; QSVM Completed
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

        <div class="qsvm-nav-actions">
          <button class="qsvm-btn-secondary" id="qsvm-back-btn">&larr; Back</button>
          <button class="qsvm-btn-primary" id="qsvm-next-btn" ${!state.quantumDone ? 'disabled' : ''}>Next Step &rarr;</button>
        </div>
      `;

      const runBtn = document.getElementById('qsvm-run-quantum-btn');
      if (runBtn) {
        runBtn.onclick = () => {
          state.quantumRunning = true;
          renderLeftPanel();
          setTimeout(() => {
            state.quantumRunning = false;
            state.quantumDone = true;
            renderLeftPanel();
            renderRightPanel();
          }, 800);
        };
      }

      document.getElementById('qsvm-back-btn').onclick = () => {
        state.step = 3;
        renderSteps();
      };
      const nextBtn = document.getElementById('qsvm-next-btn');
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (state.quantumDone) {
            state.step = 5;
            renderSteps();
          }
        };
      }

    } else if (state.step === 5) {
      // STEP 5: COMPARISON
      leftEl.innerHTML = `
        <div class="qsvm-panel-header">
          <div class="qsvm-step-indicator-pill">Step 5</div>
          <h3 class="qsvm-panel-title">Comparison</h3>
          <p class="qsvm-panel-text">
            Compare the decision boundaries and accuracy between the Classical Linear SVM and the Quantum SVM.
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
          <button class="qsvm-btn-primary" id="qsvm-restart-btn">&#8635; Restart</button>
        </div>
      `;

      document.getElementById('qsvm-back-btn').onclick = () => {
        state.step = 4;
        renderSteps();
      };
      document.getElementById('qsvm-restart-btn').onclick = () => {
        state.step = 1;
        state.classicalDone = false;
        state.quantumDone = false;
        renderSteps();
      };
    }
  }

  function getEntanglementDescription(type) {
    if (type === 'linear') {
      return 'Linear: Entangles only adjacent qubits (e.g., q0 with q1). Creates simpler, localized correlations in the quantum feature space.';
    } else if (type === 'full') {
      return 'Full: Entangles all pairs of qubits with CNOT gates. Maximizes correlations across all feature dimensions.';
    } else {
      return 'Circular: Entangles adjacent qubits in a periodic ring topology with wraparound entanglement between terminal qubits.';
    }
  }

  /* ------------------------------------------------------------
     4. RIGHT PANEL RENDERING (Visualizers & Canvases)
     ------------------------------------------------------------ */
  function renderRightPanel() {
    const rightEl = document.getElementById('qsvm-panel-right-content');
    if (!rightEl) return;
    const curDataset = DATASETS[state.dataset];

    if (state.step === 1) {
      // Step 1: Dataset Distribution 2D Plot
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <div class="qsvm-canvas-card">
            <canvas id="qsvm-canvas-single" width="560" height="380" class="qsvm-scatter-canvas"></canvas>
          </div>
          <div class="qsvm-caption-card">
            <h4 class="qsvm-caption-title">Dataset Distribution</h4>
            <p class="qsvm-caption-desc">
              This 2D scatter plot shows the distribution of our two classes (green and red). The goal of an SVM is to find a boundary that separates these two colors.
            </p>
          </div>
        </div>
      `;
      drawScatterPlot('qsvm-canvas-single', {
        showBoundary: false,
        showSupportVectors: false
      });

    } else if (state.step === 2) {
      // Step 2: Classical SVM decision boundary
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <div class="qsvm-canvas-card">
            <canvas id="qsvm-canvas-single" width="560" height="380" class="qsvm-scatter-canvas"></canvas>
          </div>
          <div class="qsvm-caption-card">
            <h4 class="qsvm-caption-title">Classical Linear SVM</h4>
            <p class="qsvm-caption-desc">${curDataset.classicalBoundaryDesc}</p>
          </div>
        </div>
      `;
      drawScatterPlot('qsvm-canvas-single', {
        showBoundary: state.classicalDone,
        boundaryType: 'classical',
        showSupportVectors: state.classicalDone
      });

    } else if (state.step === 3) {
      // Step 3: Quantum Feature Map Circuit + Kernel Heatmap (Matches 00:19 in video)
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <!-- CIRCUIT CARD -->
          <div class="qsvm-circuit-card">
            <div class="qsvm-circuit-header">
              <span class="qsvm-circuit-title">QUANTUM FEATURE MAP CIRCUIT (${state.featureMap.toUpperCase()})</span>
            </div>
            <div class="qsvm-legend-bar">
              <span class="qsvm-legend-item qsvm-legend-h"><span class="qsvm-dot-h"></span> Hadamard: Creates superposition</span>
              <span class="qsvm-legend-item qsvm-legend-p"><span class="qsvm-dot-p"></span> Phase Gates: Encodes data [x₀, x₁]</span>
              <span class="qsvm-legend-item qsvm-legend-cx"><span class="qsvm-dot-cx"></span> Entanglement: Correlates features</span>
            </div>
            <div class="qsvm-circuit-svg-wrap">
              ${renderCircuitSVG()}
            </div>
            <p class="qsvm-circuit-note">
              Classical data points are mapped into a quantum state. The H-gates put qubits into all possible states. The P-gates rotate the qubits by an angle proportional to the data values. The Entanglement circuit captures complex non-linear relationships between features.
            </p>
          </div>

          <!-- HEATMAP CARD -->
          <div class="qsvm-heatmap-card">
            <div class="qsvm-heatmap-header">
              <span class="qsvm-circuit-title">KERNEL MATRIX HEATMAP</span>
            </div>
            <div class="qsvm-heatmap-flex">
              <canvas id="qsvm-heatmap-canvas" width="220" height="220" class="qsvm-heatmap-canvas"></canvas>
              <div class="qsvm-heatmap-info">
                <h4 class="qsvm-caption-title" style="margin-top:0;">Mapping to Quantum Space</h4>
                <p class="qsvm-caption-desc">
                  By increasing depth and entanglement, we create a highly complex, high-dimensional quantum feature space. The heatmap shows the computed quantum kernel—the similarity between different data points in this new space.
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
      // Step 4: Quantum SVM Decision Boundary
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <div class="qsvm-canvas-card">
            <canvas id="qsvm-canvas-single" width="560" height="380" class="qsvm-scatter-canvas"></canvas>
          </div>
          <div class="qsvm-caption-card">
            <h4 class="qsvm-caption-title">Quantum SVM Decision Boundary</h4>
            <p class="qsvm-caption-desc">${curDataset.quantumBoundaryDesc}</p>
          </div>
        </div>
      `;
      drawScatterPlot('qsvm-canvas-single', {
        showBoundary: state.quantumDone,
        boundaryType: 'quantum',
        showSupportVectors: state.quantumDone
      });

    } else if (state.step === 5) {
      // Step 5: Side-by-Side Dual Visualizer (Matches 00:29 in video)
      rightEl.innerHTML = `
        <div class="qsvm-vis-container">
          <div class="qsvm-dual-vis-grid">
            <!-- Classical Column -->
            <div class="qsvm-dual-col">
              <div class="qsvm-col-badge">CLASSICAL LINEAR SVM</div>
              <div class="qsvm-dual-canvas-card">
                <canvas id="qsvm-canvas-dual-classical" width="270" height="260" class="qsvm-scatter-canvas"></canvas>
              </div>
              <div class="qsvm-col-stat">
                <div class="qsvm-col-num ${state.dataset === 'linear' ? 'success' : 'warn'}">${curDataset.classicalAcc}</div>
                <div class="qsvm-col-label">Accuracy</div>
              </div>
            </div>

            <!-- Quantum Column -->
            <div class="qsvm-dual-col">
              <div class="qsvm-col-badge qsvm-col-badge--quantum">QUANTUM SVM</div>
              <div class="qsvm-dual-canvas-card">
                <canvas id="qsvm-canvas-dual-quantum" width="270" height="260" class="qsvm-scatter-canvas"></canvas>
              </div>
              <div class="qsvm-col-stat">
                <div class="qsvm-col-num success">${curDataset.quantumAcc}</div>
                <div class="qsvm-col-label">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      `;
      drawScatterPlot('qsvm-canvas-dual-classical', {
        showBoundary: true,
        boundaryType: 'classical',
        showSupportVectors: true,
        isDual: true
      });
      drawScatterPlot('qsvm-canvas-dual-quantum', {
        showBoundary: true,
        boundaryType: 'quantum',
        showSupportVectors: true,
        isDual: true
      });
    }
  }

  /* ------------------------------------------------------------
     5. CIRCUIT SVG RENDERER (Step 3)
     ------------------------------------------------------------ */
  function renderCircuitSVG() {
    const isZZ = state.featureMap === 'ZZFeatureMap';
    const depth = state.depth;

    let svgBlocks = '';
    let xOffset = 90;

    for (let d = 0; d < depth; d++) {
      // H gates
      svgBlocks += `
        <!-- H Gates (Superposition - Blue) -->
        <rect x="${xOffset}" y="20" width="34" height="30" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="${xOffset + 17}" y="40" fill="#93c5fd" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">H</text>

        <rect x="${xOffset}" y="70" width="34" height="30" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>
        <text x="${xOffset + 17}" y="90" fill="#93c5fd" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">H</text>
      `;
      xOffset += 46;

      // Phase Gates P(2x)
      svgBlocks += `
        <!-- P Gates (Data Encoding - Amber) -->
        <rect x="${xOffset}" y="20" width="56" height="30" rx="4" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="${xOffset + 28}" y="39" fill="#fef08a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">P(2x₀)</text>

        <rect x="${xOffset}" y="70" width="56" height="30" rx="4" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="${xOffset + 28}" y="89" fill="#fef08a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="bold" text-anchor="middle">P(2x₁)</text>
      `;
      xOffset += 68;

      // Entanglement (if ZZFeatureMap)
      if (isZZ) {
        svgBlocks += `
          <!-- CNOT 1 Control and Target -->
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

        // CNOT 2 Target and Control
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
        <!-- Qubit Labels -->
        <text x="25" y="40" fill="#94a3b8" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="bold">q₀</text>
        <text x="25" y="90" fill="#94a3b8" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="bold">q₁</text>

        <!-- Wires -->
        <line x1="55" y1="35" x2="${totalWidth - 20}" y2="35" stroke="#334155" stroke-width="1.5"/>
        <line x1="55" y1="85" x2="${totalWidth - 20}" y2="85" stroke="#334155" stroke-width="1.5"/>

        <!-- Injected Gate Sequence -->
        ${svgBlocks}
      </svg>
    `;
  }

  /* ------------------------------------------------------------
     6. KERNEL HEATMAP RENDERER (Step 3)
     ------------------------------------------------------------ */
  function drawHeatmap(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 10; // 10x10 matrix
    const cellSize = canvas.width / size;

    // Synthetic gram matrix with higher correlations within classes
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let val;
        if (r === c) {
          val = 1.0;
        } else {
          const sameClass = (r < 5 && c < 5) || (r >= 5 && c >= 5);
          if (sameClass) {
            val = 0.65 + Math.sin(r * 2.3 + c * 1.7) * 0.25;
          } else {
            val = 0.12 + Math.abs(Math.sin(r * 1.1 + c * 3.3)) * 0.15;
          }
        }
        val = Math.max(0, Math.min(1, val));

        // Color map: 0.0 -> navy (#080e2b), 0.5 -> purple (#7c3aed), 1.0 -> bright cyan/gold (#06b6d4 / #fef08a)
        let color;
        if (val < 0.5) {
          const t = val / 0.5;
          const red = Math.round(8 + t * (124 - 8));
          const grn = Math.round(14 + t * (58 - 14));
          const blu = Math.round(43 + t * (237 - 43));
          color = `rgb(${red}, ${grn}, ${blu})`;
        } else {
          const t = (val - 0.5) / 0.5;
          const red = Math.round(124 + t * (6 - 124));
          const grn = Math.round(58 + t * (182 - 58));
          const blu = Math.round(237 + t * (212 - 237));
          color = `rgb(${red}, ${grn}, ${blu})`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }

  /* ------------------------------------------------------------
     7. SCATTER PLOT & BOUNDARY CANVAS ENGINE
     ------------------------------------------------------------ */
  function drawScatterPlot(canvasId, options) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const isDual = options.isDual || false;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = isDual ? (w * 0.42) : (w * 0.44);

    // 1. Draw subtle coordinate grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridStep = scale / 2; // every 0.5 units
    for (let x = cx % gridStep; x < w; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = cy % gridStep; y < h; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    // 2. Decision Region & Boundary Rendering
    if (options.showBoundary) {
      if (options.boundaryType === 'classical') {
        drawClassicalBoundary(ctx, w, h, cx, cy, scale);
      } else if (options.boundaryType === 'quantum') {
        drawQuantumBoundary(ctx, w, h, cx, cy, scale);
      }
    }

    // 3. Draw Data Points & Support Vectors
    const curDataset = DATASETS[state.dataset];
    const svSet = new Set(curDataset.supportVectorIndices);

    // Use transition particles if they exist, otherwise build them from dataset
    if (transitionState.particles.length === 0) {
      syncParticlesToDataset(state.dataset);
    }

    transitionState.particles.forEach((pt, idx) => {
      const px = cx + pt.curX * scale;
      const py = cy - pt.curY * scale;

      // Draw Support Vector outer ring if active (use target label for SV logic, or just fade)
      // Only show SVs if progress is 1 (fully transitioned) or if they were SVs in both
      if (options.showSupportVectors && svSet.has(idx) && transitionState.progress > 0.8) {
        ctx.beginPath();
        ctx.arc(px, py, isDual ? 9 : 12, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(6, 182, 212, ${(transitionState.progress - 0.8) * 5})`;
        ctx.lineWidth = isDual ? 1.8 : 2.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, isDual ? 12 : 16, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(6, 182, 212, ${(transitionState.progress - 0.8) * 5 * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(px, py, isDual ? 4.5 : 5.5, 0, 2 * Math.PI);
      
      // Interpolate colors based on label transition
      const color1 = pt.startLabel === 1 ? [16, 185, 129] : [239, 68, 68];
      const color2 = pt.targetLabel === 1 ? [16, 185, 129] : [239, 68, 68];
      const r = color1[0] + (color2[0] - color1[0]) * transitionState.progress;
      const g = color1[1] + (color2[1] - color1[1]) * transitionState.progress;
      const b = color1[2] + (color2[2] - color1[2]) * transitionState.progress;
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  /* Classical Linear Boundary */
  function drawClassicalBoundary(ctx, w, h, cx, cy, scale) {
    ctx.save();
    ctx.setLineDash([5, 5]);

    if (state.dataset === 'linear') {
      // Linear separable: line y = x (from bottom-left to top-right)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.stroke();

      // Margins
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, h - 45); ctx.lineTo(w, -45); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, h + 45); ctx.lineTo(w, 45); ctx.stroke();

    } else if (state.dataset === 'circular') {
      // Circular: A straight vertical line fails
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // Margins
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 35, 0); ctx.lineTo(cx - 35, h); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 35, 0); ctx.lineTo(cx + 35, h); ctx.stroke();

    } else {
      // XOR: Vertical line dividing left and right (misclassifying 50%)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // Margins
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 40, 0); ctx.lineTo(cx - 40, h); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 40, 0); ctx.lineTo(cx + 40, h); ctx.stroke();
    }
    ctx.restore();
  }

  /* Quantum Non-Linear Boundary */
  function drawQuantumBoundary(ctx, w, h, cx, cy, scale) {
    ctx.save();

    if (state.dataset === 'linear') {
      // Linear
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.stroke();

    } else if (state.dataset === 'circular') {
      // Concentric Circular boundary around center (radius ~ 0.48 * scale)
      const r = 0.48 * scale;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)'; // Green inner
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

    } else {
      // XOR: Beautiful dual hyperbolic / cross non-linear contours separating the 4 quadrants!
      // Green quadrants: Q2 (top-left) & Q4 (bottom-right)
      // Red quadrants: Q1 (top-right) & Q3 (bottom-left)
      // Hyperbola 1 in Q1/Q3
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 8;

      // Top-right hyperbola contour
      ctx.beginPath();
      for (let x = 0.15; x <= 0.95; x += 0.05) {
        const y = 0.05 / x;
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (x === 0.15) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Bottom-left hyperbola contour
      ctx.beginPath();
      for (let x = -0.95; x <= -0.15; x += 0.05) {
        const y = 0.05 / x;
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (x === -0.95) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Top-left hyperbola contour (separating Q2)
      ctx.beginPath();
      for (let x = -0.95; x <= -0.15; x += 0.05) {
        const y = -0.05 / x;
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (x === -0.95) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Bottom-right hyperbola contour (separating Q4)
      ctx.beginPath();
      for (let x = 0.15; x <= 0.95; x += 0.05) {
        const y = -0.05 / x;
        const px = cx + x * scale;
        const py = cy - y * scale;
        if (x === 0.15) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  /* ------------------------------------------------------------
     8. TRANSITION MANAGER (Particle Dynamics)
     ------------------------------------------------------------ */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function syncParticlesToDataset(dsKey) {
    const pts = DATASETS[dsKey].points;
    transitionState.particles = pts.map(p => ({
      curX: p.x, curY: p.y,
      startX: p.x, startY: p.y,
      targetX: p.x, targetY: p.y,
      curLabel: p.label, startLabel: p.label, targetLabel: p.label
    }));
    transitionState.progress = 1;
  }

  function initTransition(oldDs, newDs) {
    const oldPts = transitionState.particles.length ? transitionState.particles : DATASETS[oldDs].points;
    const newPts = DATASETS[newDs].points;
    
    // Map existing visual particles to new dataset targets
    const count = Math.max(oldPts.length, newPts.length);
    let nextParticles = [];

    for (let i = 0; i < count; i++) {
      const oldP = i < oldPts.length ? oldPts[i] : { curX: 0, curY: 0, startLabel: newPts[i].label, curLabel: newPts[i].label }; // Spawn from center
      const newP = i < newPts.length ? newPts[i] : { x: 0, y: 0, label: oldP.curLabel }; // Converge to center
      
      nextParticles.push({
        curX: oldP.curX !== undefined ? oldP.curX : oldP.x,
        curY: oldP.curY !== undefined ? oldP.curY : oldP.y,
        startX: oldP.curX !== undefined ? oldP.curX : oldP.x,
        startY: oldP.curY !== undefined ? oldP.curY : oldP.y,
        targetX: newP.x,
        targetY: newP.y,
        curLabel: oldP.curLabel !== undefined ? oldP.curLabel : oldP.label,
        startLabel: oldP.curLabel !== undefined ? oldP.curLabel : oldP.label,
        targetLabel: newP.label
      });
    }

    transitionState.particles = nextParticles;
    transitionState.startTime = performance.now();
    transitionState.progress = 0;
    transitionState.active = true;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(animateFrame);
  }

  function animateFrame(time) {
    let dt = time - transitionState.startTime;
    let rawProgress = dt / transitionState.duration;
    
    if (rawProgress >= 1) {
      rawProgress = 1;
      transitionState.active = false;
    }

    transitionState.progress = easeInOutCubic(rawProgress);

    // Update particle current states
    transitionState.particles.forEach(pt => {
      pt.curX = pt.startX + (pt.targetX - pt.startX) * transitionState.progress;
      pt.curY = pt.startY + (pt.targetY - pt.startY) * transitionState.progress;
    });

    renderRightPanel(); // Redraw

    if (transitionState.active) {
      animationFrameId = requestAnimationFrame(animateFrame);
    }
  }

  // Public API
  return {
    mount: mount,
    getState: () => state
  };
})();
