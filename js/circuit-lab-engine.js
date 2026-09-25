/* ============================================================
   QUANTUMLAB – QUANTUM CIRCUIT SIMULATION ENGINE
   Real-Time Unitary State Vector Evolution & Multi-Qubit Synthesis
   ============================================================ */

window.QL = window.QL || {};

QL.CircuitLabEngine = (function () {
  // Complex number helper
  function C(re, im) {
    return { re: re || 0, im: im || 0 };
  }
  function cAdd(a, b) {
    return { re: a.re + b.re, im: a.im + b.im };
  }
  function cMul(a, b) {
    return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
  }
  function cAbs2(a) {
    return a.re * a.re + a.im * a.im;
  }

  // State representation
  let numQubits = 2;
  const numSteps = 5;
  let selectedGate = 'H';
  let shots = 512;
  let noiseLevel = 0; // 0 to 20%
  let isSimulating = false;

  // Circuit grid: 2D array [qubitIndex][stepIndex] = gateName or null
  let circuitGrid = [
    ['H', null, 'CNOT_CTRL', null, 'M'],
    [null, null, 'CNOT_TGT', null, 'M']
  ];

  // Presets
  const presets = {
    'bell': {
      name: 'Bell State |Φ⁺⟩',
      qubits: 2,
      grid: [
        ['H', null, 'CNOT_CTRL', null, 'M'],
        [null, null, 'CNOT_TGT', null, 'M']
      ]
    },
    'superposition': {
      name: 'Superposition |+⟩',
      qubits: 2,
      grid: [
        ['H', null, null, null, 'M'],
        [null, null, null, null, 'M']
      ]
    },
    'ghz': {
      name: 'GHZ 3-Qubit State',
      qubits: 3,
      grid: [
        ['H', 'CNOT_CTRL', null, null, 'M'],
        [null, 'CNOT_TGT', 'CNOT_CTRL', null, 'M'],
        [null, null, 'CNOT_TGT', null, 'M']
      ]
    },
    'bitflip': {
      name: 'Bit-Flip State |01⟩',
      qubits: 2,
      grid: [
        [null, null, null, null, 'M'],
        ['X', null, null, null, 'M']
      ]
    }
  };

  // Unitary Gate definitions (2x2 matrices)
  const INV_SQRT2 = 1 / Math.SQRT2;
  const gates1Q = {
    'H': [
      [C(INV_SQRT2, 0), C(INV_SQRT2, 0)],
      [C(INV_SQRT2, 0), C(-INV_SQRT2, 0)]
    ],
    'X': [
      [C(0, 0), C(1, 0)],
      [C(1, 0), C(0, 0)]
    ],
    'Y': [
      [C(0, 0), C(0, -1)],
      [C(0, 1), C(0, 0)]
    ],
    'Z': [
      [C(1, 0), C(0, 0)],
      [C(0, 0), C(-1, 0)]
    ],
    'S': [
      [C(1, 0), C(0, 0)],
      [C(0, 0), C(0, 1)] // e^(i*pi/2) = i
    ],
    'T': [
      [C(1, 0), C(0, 0)],
      [C(0, 0), C(INV_SQRT2, INV_SQRT2)] // e^(i*pi/4)
    ]
  };

  /* -------------------------------------------------------------
     QUANTUM STATE EVOLUTION COMPUTATION
     ------------------------------------------------------------- */
  function computeStateVector() {
    const dim = Math.pow(2, numQubits);
    // Initial state |00...0> = [1, 0, 0, ...]
    let state = [];
    for (let i = 0; i < dim; i++) {
      state.push(i === 0 ? C(1, 0) : C(0, 0));
    }

    // Step-by-step through circuit columns
    for (let step = 0; step < numSteps; step++) {
      // Check for CNOT gates in this step
      let cnotCtrl = -1;
      let cnotTgt = -1;
      for (let q = 0; q < numQubits; q++) {
        if (circuitGrid[q] && circuitGrid[q][step] === 'CNOT_CTRL') cnotCtrl = q;
        if (circuitGrid[q] && circuitGrid[q][step] === 'CNOT_TGT') cnotTgt = q;
      }

      if (cnotCtrl !== -1 && cnotTgt !== -1) {
        // Apply CNOT
        state = applyCNOT(state, cnotCtrl, cnotTgt, numQubits);
      }

      // Check for single qubit gates in this step
      for (let q = 0; q < numQubits; q++) {
        const g = circuitGrid[q] ? circuitGrid[q][step] : null;
        if (g && gates1Q[g]) {
          state = applySingleQubitGate(state, q, gates1Q[g], numQubits);
        }
      }
    }

    // Calculate probabilities P(i) = |c_i|^2
    let probabilities = [];
    let sumP = 0;
    for (let i = 0; i < dim; i++) {
      let p = cAbs2(state[i]);
      probabilities.push(p);
      sumP += p;
    }

    // Normalize (guard against float precision drift)
    if (sumP > 0) {
      probabilities = probabilities.map(p => p / sumP);
    }

    // If noise level > 0, mix towards maximally mixed distribution
    if (noiseLevel > 0) {
      const uniform = 1 / dim;
      const factor = noiseLevel / 100;
      probabilities = probabilities.map(p => (1 - factor) * p + factor * uniform);
    }

    return { state, probabilities };
  }

  function applySingleQubitGate(state, targetQubit, gateMat, totalQubits) {
    const dim = Math.pow(2, totalQubits);
    const nextState = new Array(dim);
    for (let i = 0; i < dim; i++) nextState[i] = C(0, 0);

    const shift = totalQubits - 1 - targetQubit;

    for (let i = 0; i < dim; i++) {
      const bit = (i >> shift) & 1;
      if (bit === 0) {
        const i0 = i;
        const i1 = i | (1 << shift);
        const v0 = state[i0];
        const v1 = state[i1];

        // [u00 u01] [v0]
        // [u10 u11] [v1]
        nextState[i0] = cAdd(nextState[i0], cAdd(cMul(gateMat[0][0], v0), cMul(gateMat[0][1], v1)));
        nextState[i1] = cAdd(nextState[i1], cAdd(cMul(gateMat[1][0], v0), cMul(gateMat[1][1], v1)));
      }
    }
    return nextState;
  }

  function applyCNOT(state, ctrlQubit, tgtQubit, totalQubits) {
    const dim = Math.pow(2, totalQubits);
    const nextState = [...state];
    const ctrlShift = totalQubits - 1 - ctrlQubit;
    const tgtShift = totalQubits - 1 - tgtQubit;

    for (let i = 0; i < dim; i++) {
      const ctrlBit = (i >> ctrlShift) & 1;
      const tgtBit = (i >> tgtShift) & 1;
      if (ctrlBit === 1 && tgtBit === 0) {
        const flipped = i | (1 << tgtShift);
        // Swap amplitudes between i and flipped
        const temp = nextState[i];
        nextState[i] = nextState[flipped];
        nextState[flipped] = temp;
      }
    }
    return nextState;
  }

  // Sample empirical measurements according to probabilities & shots
  function sampleMeasurements(probabilities, totalShots) {
    const counts = new Array(probabilities.length).fill(0);
    // Cumulative distribution
    const cum = [];
    let acc = 0;
    for (let p of probabilities) {
      acc += p;
      cum.push(acc);
    }
    cum[cum.length - 1] = 1.0;

    for (let s = 0; s < totalShots; s++) {
      const r = Math.random();
      let picked = 0;
      for (let i = 0; i < cum.length; i++) {
        if (r <= cum[i]) {
          picked = i;
          break;
        }
      }
      counts[picked]++;
    }
    return counts;
  }

  /* -------------------------------------------------------------
     RENDER CIRCUIT & SYMBOLIC WIRE DISPLAY
     ------------------------------------------------------------- */
  function renderCircuitGrid() {
    const container = document.getElementById('circuit-wire-grid');
    if (!container) return;

    container.innerHTML = '';

    for (let q = 0; q < numQubits; q++) {
      const row = document.createElement('div');
      row.className = 'circuit-wire-row';
      row.id = `wire-row-${q}`;

      // Register label
      const label = document.createElement('div');
      label.className = 'wire-register-label';
      label.innerHTML = `q<span class="sub">${q}</span>`;
      row.appendChild(label);

      // Track container
      const track = document.createElement('div');
      track.className = 'wire-track-container';

      // Physical wire line
      const line = document.createElement('div');
      line.className = 'quantum-bus-wire';
      track.appendChild(line);

      // Pulse element
      const pulse = document.createElement('div');
      pulse.className = 'quantum-pulse';
      pulse.id = `wire-pulse-${q}`;
      track.appendChild(pulse);

      // Gate slots
      const slots = document.createElement('div');
      slots.className = 'wire-gate-slots';

      for (let step = 0; step < numSteps; step++) {
        const slot = document.createElement('div');
        slot.className = 'wire-gate-slot';
        slot.dataset.qubit = q;
        slot.dataset.step = step;

        const gate = circuitGrid[q] ? circuitGrid[q][step] : null;
        if (gate) {
          slot.classList.add('occupied');
          let displaySymbol = gate;
          if (gate === 'CNOT_CTRL') {
            displaySymbol = '●';
            slot.classList.add('gate-cnot');
          } else if (gate === 'CNOT_TGT') {
            displaySymbol = '⊕';
            slot.classList.add('gate-cnot');
          } else if (gate === 'M') {
            displaySymbol = 'M';
            slot.classList.add('gate-meas');
          }

          slot.innerHTML = `
            <span class="placed-gate-symbol">${displaySymbol}</span>
            <button class="gate-remove-btn" title="Remove Gate" data-q="${q}" data-s="${step}">✕</button>
          `;
        } else {
          slot.innerHTML = `<span style="opacity:0.25;font-size:11px">+</span>`;
        }

        // Slot click to place current selected gate
        slot.addEventListener('click', (e) => {
          if (e.target.classList.contains('gate-remove-btn')) {
            e.stopPropagation();
            removeGate(q, step);
            return;
          }
          placeSelectedGate(q, step);
        });

        slots.appendChild(slot);
      }

      track.appendChild(slots);
      row.appendChild(track);
      container.appendChild(row);
    }
  }

  function placeSelectedGate(q, step) {
    if (!circuitGrid[q]) circuitGrid[q] = new Array(numSteps).fill(null);

    if (selectedGate === 'CNOT') {
      // Connect q0 and q1 for CNOT
      const targetQ = (q === 0) ? 1 : 0;
      if (!circuitGrid[targetQ]) circuitGrid[targetQ] = new Array(numSteps).fill(null);
      circuitGrid[q][step] = 'CNOT_CTRL';
      circuitGrid[targetQ][step] = 'CNOT_TGT';
    } else {
      circuitGrid[q][step] = selectedGate;
    }
    renderCircuitGrid();
    updateLiveMetrics(false);
  }

  function removeGate(q, step) {
    if (!circuitGrid[q]) return;
    const gate = circuitGrid[q][step];
    circuitGrid[q][step] = null;
    if (gate === 'CNOT_CTRL') {
      // Remove paired target
      for (let i = 0; i < numQubits; i++) {
        if (circuitGrid[i] && circuitGrid[i][step] === 'CNOT_TGT') circuitGrid[i][step] = null;
      }
    } else if (gate === 'CNOT_TGT') {
      // Remove paired control
      for (let i = 0; i < numQubits; i++) {
        if (circuitGrid[i] && circuitGrid[i][step] === 'CNOT_CTRL') circuitGrid[i][step] = null;
      }
    }
    renderCircuitGrid();
    updateLiveMetrics(false);
  }

  /* -------------------------------------------------------------
     UPDATE LIVE OBSERVATIONS & RESULTS
     ------------------------------------------------------------- */
  function updateLiveMetrics(runSimulationAnim) {
    const { state, probabilities } = computeStateVector();
    const counts = sampleMeasurements(probabilities, shots);

    // Update State Vector UI
    const vecContainer = document.getElementById('circuit-state-vector');
    if (vecContainer) {
      vecContainer.innerHTML = '';
      const dim = Math.pow(2, numQubits);
      for (let i = 0; i < dim; i++) {
        const binStr = i.toString(2).padStart(numQubits, '0');
        const amp = state[i];
        const mag = Math.sqrt(cAbs2(amp));
        if (mag > 0.001) {
          const item = document.createElement('div');
          item.className = 'state-ket-item';
          const reStr = amp.re >= 0 ? amp.re.toFixed(3) : amp.re.toFixed(3);
          const imStr = amp.im !== 0 ? (amp.im >= 0 ? `+${amp.im.toFixed(3)}i` : `${amp.im.toFixed(3)}i`) : '';
          item.innerHTML = `
            <span class="state-ket-amp">${mag.toFixed(3)}</span>
            <span class="state-ket-basis">|${binStr}⟩</span>
          `;
          vecContainer.appendChild(item);
        }
      }
    }

    // Update Histogram
    const histContainer = document.getElementById('circuit-histogram');
    if (histContainer) {
      histContainer.innerHTML = '';
      const dim = Math.pow(2, numQubits);
      for (let i = 0; i < dim; i++) {
        const binStr = i.toString(2).padStart(numQubits, '0');
        const p = probabilities[i];
        const shotCount = counts[i];
        const pct = (p * 100).toFixed(1);

        const row = document.createElement('div');
        row.className = 'vlab-hist-row';
        row.innerHTML = `
          <div class="vlab-hist-label">|${binStr}⟩</div>
          <div class="vlab-hist-track">
            <div class="vlab-hist-fill" style="width:${pct}%"></div>
          </div>
          <div class="vlab-hist-pct">${pct}% <span style="font-size:0.65rem;color:var(--vlab-text-muted)">(${shotCount})</span></div>
        `;
        histContainer.appendChild(row);
      }
    }

    // Update Observation text scientifically
    const obsText = document.getElementById('circuit-observation-text');
    if (obsText) {
      obsText.innerHTML = generateObservationReport(probabilities, counts);
    }

    // State Purity / Entanglement metrics
    const purityEl = document.getElementById('circuit-purity-val');
    if (purityEl) {
      const purity = noiseLevel > 0 ? (1 - noiseLevel * 0.015).toFixed(3) : '1.000';
      purityEl.textContent = purity;
    }
  }

  function generateObservationReport(probabilities, counts) {
    const dim = Math.pow(2, numQubits);
    const dominantStates = [];
    for (let i = 0; i < dim; i++) {
      if (probabilities[i] > 0.15) {
        dominantStates.push(`|${i.toString(2).padStart(numQubits, '0')}⟩ (${(probabilities[i] * 100).toFixed(1)}%)`);
      }
    }

    let report = `The quantum register was initialized to computational ground state |${'0'.repeat(numQubits)}⟩. `;

    // Detect Bell state pattern
    const isBell = numQubits === 2 && probabilities[0] > 0.4 && probabilities[3] > 0.4 && probabilities[1] < 0.1 && probabilities[2] < 0.1;
    const isSuperposition = probabilities.filter(p => p > 0.2).length >= 2;

    if (isBell) {
      report += `<strong>Maximally Entangled Bell State (|Φ⁺⟩) detected:</strong> The application of a Hadamard gate on q0 followed by a CNOT entangles both qubits. Output outcomes are strictly correlated into |00⟩ and |11⟩ with approximately equal 50:50 distribution across ${shots} measurement shots.`;
    } else if (dominantStates.length === 1) {
      report += `Unitary transformations prepared an eigenstate collapsing with high certainty into <strong>${dominantStates[0]}</strong>.`;
    } else if (isSuperposition) {
      report += `Coherent quantum superposition observed across computational states: <strong>${dominantStates.join(' and ')}</strong>. Classical projection collapses the state vector in accordance with Born's probability amplitudes.`;
    } else {
      report += `Unitary gate synthesis completed across ${numSteps} time steps with ${shots} statistical sampling shots.`;
    }

    if (noiseLevel > 0) {
      report += ` <span style="color:#fb7185">Simulated decoherence (${noiseLevel}%) introduced depolarizing state shrinkage, reducing fidelity.</span>`;
    }

    return report;
  }

  /* -------------------------------------------------------------
     RUN SIMULATION ANIMATION SEQUENCE
     ------------------------------------------------------------- */
  function runSimulation() {
    if (isSimulating) return;
    isSimulating = true;

    const runBtn = document.getElementById('run-sim-btn');
    const statusText = document.getElementById('circuit-sim-status');
    if (runBtn) runBtn.disabled = true;
    if (statusText) statusText.textContent = 'Executing Quantum Gates...';

    // Trigger wire pulses
    for (let q = 0; q < numQubits; q++) {
      const pulse = document.getElementById(`wire-pulse-${q}`);
      if (pulse) {
        pulse.classList.remove('animating');
        void pulse.offsetWidth; // trigger reflow
        pulse.classList.add('animating');
      }
    }

    // Step through slots visually
    const slots = document.querySelectorAll('.wire-gate-slot.occupied');
    slots.forEach((s, idx) => {
      setTimeout(() => {
        s.style.boxShadow = '0 0 24px #22d3ee';
        setTimeout(() => {
          s.style.boxShadow = '';
        }, 300);
      }, idx * 150 + 200);
    });

    setTimeout(() => {
      updateLiveMetrics(true);
      if (statusText) statusText.textContent = 'Simulation Complete';
      if (runBtn) runBtn.disabled = false;
      isSimulating = false;
    }, 1200);
  }

  /* -------------------------------------------------------------
     INITIALIZATION & EVENT BINDING
     ------------------------------------------------------------- */
  function init() {
    renderCircuitGrid();
    updateLiveMetrics(false);

    // Gate palette clicks
    document.querySelectorAll('.vlab-palette-gate').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vlab-palette-gate').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGate = btn.dataset.gate;
      });
    });

    // Preset buttons
    document.querySelectorAll('.vlab-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.vlab-preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const pId = chip.dataset.preset;
        if (presets[pId]) {
          numQubits = presets[pId].qubits;
          circuitGrid = JSON.parse(JSON.stringify(presets[pId].grid));
          const qCountSelect = document.getElementById('num-qubits-select');
          if (qCountSelect) qCountSelect.value = numQubits;
          renderCircuitGrid();
          updateLiveMetrics(false);
        }
      });
    });

    // Run button
    const runBtn = document.getElementById('run-sim-btn');
    if (runBtn) runBtn.addEventListener('click', runSimulation);

    // Reset circuit button
    const resetBtn = document.getElementById('reset-circuit-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        circuitGrid = [
          new Array(numSteps).fill(null),
          new Array(numSteps).fill(null)
        ];
        circuitGrid[0][numSteps - 1] = 'M';
        circuitGrid[1][numSteps - 1] = 'M';
        renderCircuitGrid();
        updateLiveMetrics(false);
      });
    }

    // Number of qubits selector
    const qCountSelect = document.getElementById('num-qubits-select');
    if (qCountSelect) {
      qCountSelect.addEventListener('change', (e) => {
        numQubits = parseInt(e.target.value, 10);
        circuitGrid = [];
        for (let i = 0; i < numQubits; i++) {
          const row = new Array(numSteps).fill(null);
          row[numSteps - 1] = 'M';
          circuitGrid.push(row);
        }
        renderCircuitGrid();
        updateLiveMetrics(false);
      });
    }

    // Shots slider
    const shotsSlider = document.getElementById('shots-slider');
    const shotsVal = document.getElementById('shots-val');
    if (shotsSlider && shotsVal) {
      shotsSlider.addEventListener('input', (e) => {
        shots = parseInt(e.target.value, 10);
        shotsVal.textContent = shots;
        updateLiveMetrics(false);
      });
    }

    // Noise slider
    const noiseSlider = document.getElementById('noise-slider');
    const noiseVal = document.getElementById('noise-val');
    if (noiseSlider && noiseVal) {
      noiseSlider.addEventListener('input', (e) => {
        noiseLevel = parseInt(e.target.value, 10);
        noiseVal.textContent = `${noiseLevel}%`;
        updateLiveMetrics(false);
      });
    }

    // Self-Evaluation Quiz interaction
    initQuizInteractions();
  }

  function initQuizInteractions() {
    document.querySelectorAll('.vlab-quiz-card').forEach(card => {
      const opts = card.querySelectorAll('.vlab-quiz-opt');
      const feedback = card.querySelector('.vlab-quiz-feedback');

      opts.forEach(opt => {
        opt.addEventListener('click', () => {
          opts.forEach(o => {
            o.classList.remove('selected-correct', 'selected-wrong');
          });
          const isCorrect = opt.dataset.correct === 'true';
          if (isCorrect) {
            opt.classList.add('selected-correct');
            if (feedback) {
              feedback.className = 'vlab-quiz-feedback show-correct';
              feedback.innerHTML = `<strong>Correct!</strong> ` + (feedback.dataset.exp || '');
            }
          } else {
            opt.classList.add('selected-wrong');
            if (feedback) {
              feedback.className = 'vlab-quiz-feedback show-wrong';
              feedback.innerHTML = `<strong>Incorrect.</strong> ` + (feedback.dataset.exp || 'Review the theory section for details.');
            }
          }
        });
      });
    });
  }

  return {
    init,
    runSimulation,
    renderCircuitGrid,
    updateLiveMetrics
  };
})();
