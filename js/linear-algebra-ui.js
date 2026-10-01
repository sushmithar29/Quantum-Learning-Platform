/* ============================================================
   QUANTUMLAB – LINEAR ALGEBRA INTERACTIVE UI CONTROLLER
   Manages step-by-step workflow, top stepper indicator,
   live matrix & vector editors, real-time mathematical preview,
   animated calculation transformations, and quantum context.
   ============================================================ */

window.QL = window.QL || {};

QL.LinearAlgebraUI = (function () {
  'use strict';

  const Engine = QL.LinearAlgebraEngine;

  // State Management
  const state = {
    operation: 'addition', // addition | multiplication | tensor | matrix_vector | check_unitary
    step: 1, // 1 to 5
    matrixA: [
      [new Engine.Complex(1, 0), new Engine.Complex(0, 0)],
      [new Engine.Complex(0, 0), new Engine.Complex(1, 0)]
    ],
    presetA: 'identity',
    matrixB: [
      [new Engine.Complex(0, 0), new Engine.Complex(1, 0)],
      [new Engine.Complex(1, 0), new Engine.Complex(0, 0)]
    ],
    presetB: 'pauliX',
    vector: [new Engine.Complex(1, 0), new Engine.Complex(0, 0)],
    presetV: 'ket0',
    calculationResult: null,
    isComputing: false
  };

  /* ------------------------------------------------------------
     INITIALIZATION
     ------------------------------------------------------------ */
  function init() {
    renderStepper();
    renderStepContent();
    renderRightPanelPreview();
  }

  /* ------------------------------------------------------------
     STEPPER RENDERING & UPDATES
     ------------------------------------------------------------ */
  function getStepNames() {
    if (state.operation === 'matrix_vector') {
      return ['Operation', 'Matrix A', 'State Vector', 'Compute', 'Results'];
    }
    if (state.operation === 'check_unitary') {
      return ['Operation', 'Matrix U', 'U† Check', 'Compute', 'Results'];
    }
    return ['Operation', 'Matrix A', 'Matrix B', 'Compute', 'Results'];
  }

  function renderStepper() {
    const stepperContainer = document.getElementById('la-stepper-mount');
    if (!stepperContainer) return;

    const names = getStepNames();
    const progressPercent = ((state.step - 1) / (names.length - 1)) * 100;

    let nodesHtml = '';
    names.forEach((name, idx) => {
      const stepNum = idx + 1;
      let statusClass = '';
      if (stepNum === state.step) {
        statusClass = 'active';
      } else if (stepNum < state.step) {
        statusClass = 'completed';
      }

      const iconContent = (stepNum < state.step) ? '✓' : stepNum;

      nodesHtml += `
        <div class="la-step-node ${statusClass}" onclick="QL.LinearAlgebraUI.goToStep(${stepNum})" title="Go to step ${stepNum}: ${name}">
          <div class="la-step-node__circle">${iconContent}</div>
          <div class="la-step-node__label">${name}</div>
        </div>
      `;
    });

    stepperContainer.innerHTML = `
      <div class="la-stepper">
        <div class="la-stepper__track">
          <div class="la-stepper__progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
        ${nodesHtml}
      </div>
    `;
  }

  /* ------------------------------------------------------------
     STEP 1: CHOOSE OPERATION
     ------------------------------------------------------------ */
  const OPERATIONS = [
    {
      id: 'addition',
      name: 'Matrix Addition',
      symbol: 'A + B',
      desc: 'Add two compatible matrices element by element. Fundamental for quantum superposition of operators.',
      icon: '+'
    },
    {
      id: 'multiplication',
      name: 'Matrix Multiplication',
      symbol: 'A × B',
      desc: 'Multiply two compatible matrices. Represents sequential application of quantum gates (gate composition).',
      icon: '×'
    },
    {
      id: 'tensor',
      name: 'Tensor / Kronecker Product',
      symbol: 'A ⊗ B',
      desc: 'Construct the combined state space of two quantum systems. Crucial for multi-qubit registers.',
      icon: '⊗'
    },
    {
      id: 'matrix_vector',
      name: 'Matrix-Vector Multiplication',
      symbol: 'A|ψ⟩',
      desc: 'Apply a matrix operation (quantum gate) to a quantum state vector to determine the transformed state.',
      icon: 'A|ψ⟩'
    },
    {
      id: 'check_unitary',
      name: 'Check Unitary',
      symbol: 'U†U = I',
      desc: 'Verify whether a matrix represents a valid, reversible quantum operation preserving probability norm.',
      icon: 'U†'
    }
  ];

  function renderStep1() {
    const cardsHtml = OPERATIONS.map(op => `
      <div class="la-op-card ${state.operation === op.id ? 'selected' : ''}" onclick="QL.LinearAlgebraUI.selectOperation('${op.id}')">
        <div class="la-op-card__left">
          <div class="la-op-card__icon">${op.icon}</div>
          <div>
            <div class="la-op-card__name">${op.name} <span style="font-family:var(--font-mono);font-size:0.8rem;color:var(--learn-cyan);margin-left:6px;">(${op.symbol})</span></div>
            <div class="la-op-card__sub">${op.desc}</div>
          </div>
        </div>
        <div class="la-op-card__radio"></div>
      </div>
    `).join('');

    return `
      <div class="la-panel-step-badge">Step 1 of 5 · Operation Configuration</div>
      <h2 class="la-panel-heading">Choose Matrix Operation</h2>
      <p class="la-panel-desc">Select a linear algebra operation to explore its mechanics and physical meaning in quantum computing.</p>
      
      <div class="la-ops-grid">
        ${cardsHtml}
      </div>

      <div class="la-panel-actions">
        <button class="la-btn-action la-btn-back" disabled>← Previous</button>
        <button class="la-btn-action la-btn-next" onclick="QL.LinearAlgebraUI.nextStep()">Next Step: Configure Matrix A →</button>
      </div>
    `;
  }

  /* ------------------------------------------------------------
     STEP 2: CHOOSE MATRIX A (OR MATRIX U)
     ------------------------------------------------------------ */
  function renderStep2() {
    const isUnitaryOp = state.operation === 'check_unitary';
    const matrixTitle = isUnitaryOp ? 'Matrix U' : 'Matrix A';

    const presets = [
      { id: 'identity', label: 'Identity (I)' },
      { id: 'pauliX', label: 'Pauli-X (NOT)' },
      { id: 'pauliY', label: 'Pauli-Y' },
      { id: 'pauliZ', label: 'Pauli-Z' },
      { id: 'hadamard', label: 'Hadamard (H)' },
      { id: 'custom', label: 'Custom' }
    ];

    const presetsHtml = presets.map(p => `
      <button class="la-preset-chip ${state.presetA === p.id ? 'active' : ''}" onclick="QL.LinearAlgebraUI.applyPreset('A', '${p.id}')">
        ${p.label}
      </button>
    `).join('');

    const val00 = state.matrixA[0][0].format();
    const val01 = state.matrixA[0][1].format();
    const val10 = state.matrixA[1][0].format();
    const val11 = state.matrixA[1][1].format();

    return `
      <div class="la-panel-step-badge">Step 2 of 5 · ${matrixTitle} Configuration</div>
      <h2 class="la-panel-heading">Configure ${matrixTitle}</h2>
      <p class="la-panel-desc">Choose a quantum gate preset or enter custom matrix values. In quantum algorithms, matrices represent unitary logic gates.</p>

      <div class="la-editor-wrap">
        <div class="la-presets-bar">
          <span class="la-presets-label">Presets:</span>
          ${presetsHtml}
        </div>

        <div style="margin-top:16px;">
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">${matrixTitle} (2 × 2 Matrix)</div>
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <input type="text" class="la-cell-input" id="matA-0-0" value="${val00}" onchange="QL.LinearAlgebraUI.onCellChange('A', 0, 0, this.value)" aria-label="Matrix A Row 1 Column 1" />
              <input type="text" class="la-cell-input" id="matA-0-1" value="${val01}" onchange="QL.LinearAlgebraUI.onCellChange('A', 0, 1, this.value)" aria-label="Matrix A Row 1 Column 2" />
              <input type="text" class="la-cell-input" id="matA-1-0" value="${val10}" onchange="QL.LinearAlgebraUI.onCellChange('A', 1, 0, this.value)" aria-label="Matrix A Row 2 Column 1" />
              <input type="text" class="la-cell-input" id="matA-1-1" value="${val11}" onchange="QL.LinearAlgebraUI.onCellChange('A', 1, 1, this.value)" aria-label="Matrix A Row 2 Column 2" />
            </div>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">Supported values: numbers (e.g. <code>1</code>, <code>-0.5</code>), fractions (e.g. <code>1/√2</code>), or complex numbers (e.g. <code>i</code>, <code>-i</code>).</div>
        </div>
      </div>

      <div class="la-panel-actions">
        <button class="la-btn-action la-btn-back" onclick="QL.LinearAlgebraUI.prevStep()">← Previous</button>
        <button class="la-btn-action la-btn-next" onclick="QL.LinearAlgebraUI.nextStep()">Next Step →</button>
      </div>
    `;
  }

  /* ------------------------------------------------------------
     STEP 3: CHOOSE MATRIX B / VECTOR / OR UNITARY PREP
     ------------------------------------------------------------ */
  function renderStep3() {
    if (state.operation === 'matrix_vector') {
      return renderStep3Vector();
    }
    if (state.operation === 'check_unitary') {
      return renderStep3Unitary();
    }
    return renderStep3MatrixB();
  }

  function renderStep3MatrixB() {
    const presets = [
      { id: 'identity', label: 'Identity (I)' },
      { id: 'pauliX', label: 'Pauli-X' },
      { id: 'pauliY', label: 'Pauli-Y' },
      { id: 'pauliZ', label: 'Pauli-Z' },
      { id: 'hadamard', label: 'Hadamard (H)' },
      { id: 'custom', label: 'Custom' }
    ];

    const presetsHtml = presets.map(p => `
      <button class="la-preset-chip ${state.presetB === p.id ? 'active' : ''}" onclick="QL.LinearAlgebraUI.applyPreset('B', '${p.id}')">
        ${p.label}
      </button>
    `).join('');

    const val00 = state.matrixB[0][0].format();
    const val01 = state.matrixB[0][1].format();
    const val10 = state.matrixB[1][0].format();
    const val11 = state.matrixB[1][1].format();

    return `
      <div class="la-panel-step-badge">Step 3 of 5 · Matrix B Configuration</div>
      <h2 class="la-panel-heading">Configure Matrix B</h2>
      <p class="la-panel-desc">Configure second matrix B for the ${getOperationDisplayName()} operation.</p>

      <div class="la-editor-wrap">
        <div class="la-presets-bar">
          <span class="la-presets-label">Presets:</span>
          ${presetsHtml}
        </div>

        <div style="margin-top:16px;">
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Matrix B (2 × 2 Matrix)</div>
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <input type="text" class="la-cell-input" id="matB-0-0" value="${val00}" onchange="QL.LinearAlgebraUI.onCellChange('B', 0, 0, this.value)" aria-label="Matrix B Row 1 Column 1" />
              <input type="text" class="la-cell-input" id="matB-0-1" value="${val01}" onchange="QL.LinearAlgebraUI.onCellChange('B', 0, 1, this.value)" aria-label="Matrix B Row 1 Column 2" />
              <input type="text" class="la-cell-input" id="matB-1-0" value="${val10}" onchange="QL.LinearAlgebraUI.onCellChange('B', 1, 0, this.value)" aria-label="Matrix B Row 2 Column 1" />
              <input type="text" class="la-cell-input" id="matB-1-1" value="${val11}" onchange="QL.LinearAlgebraUI.onCellChange('B', 1, 1, this.value)" aria-label="Matrix B Row 2 Column 2" />
            </div>
          </div>
        </div>
      </div>

      <div class="la-panel-actions">
        <button class="la-btn-action la-btn-back" onclick="QL.LinearAlgebraUI.prevStep()">← Previous</button>
        <button class="la-btn-action la-btn-next" onclick="QL.LinearAlgebraUI.nextStep()">Next: Ready to Compute →</button>
      </div>
    `;
  }

  function renderStep3Vector() {
    const presets = [
      { id: 'ket0', label: '|0⟩' },
      { id: 'ket1', label: '|1⟩' },
      { id: 'ketPlus', label: '|+⟩' },
      { id: 'ketMinus', label: '|-⟩' },
      { id: 'custom', label: 'Custom' }
    ];

    const presetsHtml = presets.map(p => `
      <button class="la-preset-chip ${state.presetV === p.id ? 'active' : ''}" onclick="QL.LinearAlgebraUI.applyPreset('V', '${p.id}')">
        ${p.label}
      </button>
    `).join('');

    const val0 = state.vector[0].format();
    const val1 = state.vector[1].format();

    return `
      <div class="la-panel-step-badge">Step 3 of 5 · State Vector Configuration</div>
      <h2 class="la-panel-heading">Choose State Vector |ψ⟩</h2>
      <p class="la-panel-desc">A quantum state is represented as a complex normalized column vector in Hilbert space C².</p>

      <div class="la-editor-wrap">
        <div class="la-presets-bar">
          <span class="la-presets-label">Presets:</span>
          ${presetsHtml}
        </div>

        <div style="margin-top:16px;">
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">State Vector |ψ⟩ = c₀|0⟩ + c₁|1⟩</div>
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--vector">
              <input type="text" class="la-cell-input" id="vec-0" value="${val0}" onchange="QL.LinearAlgebraUI.onVectorChange(0, this.value)" aria-label="Vector Component 1" />
              <input type="text" class="la-cell-input" id="vec-1" value="${val1}" onchange="QL.LinearAlgebraUI.onVectorChange(1, this.value)" aria-label="Vector Component 2" />
            </div>
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">Standard normalization condition: |c₀|² + |c₁|² = 1.</div>
        </div>
      </div>

      <div class="la-panel-actions">
        <button class="la-btn-action la-btn-back" onclick="QL.LinearAlgebraUI.prevStep()">← Previous</button>
        <button class="la-btn-action la-btn-next" onclick="QL.LinearAlgebraUI.nextStep()">Next: Ready to Compute →</button>
      </div>
    `;
  }

  function renderStep3Unitary() {
    const uDagger = Engine.conjugateTranspose(state.matrixA);
    const d00 = uDagger[0][0].format();
    const d01 = uDagger[0][1].format();
    const d10 = uDagger[1][0].format();
    const d11 = uDagger[1][1].format();

    return `
      <div class="la-panel-step-badge">Step 3 of 5 · Conjugate Transpose Formulation</div>
      <h2 class="la-panel-heading">Compute Conjugate Transpose U†</h2>
      <p class="la-panel-desc">To verify unitarity, we form the Hermitian adjoint (conjugate transpose) <strong>U†</strong> by transposing rows into columns and conjugating imaginary numbers (i ↦ -i).</p>

      <div style="margin:20px 0;">
        <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Conjugate Transpose Matrix U†</div>
        <div class="la-math-bracket-box la-bracket-right-hooks">
          <div class="la-matrix-grid la-matrix-grid--2x2">
            <div class="la-cell-input" style="display:flex;align-items:center;justify-content:center;background:rgba(124,58,237,0.1);color:#c084fc;">${d00}</div>
            <div class="la-cell-input" style="display:flex;align-items:center;justify-content:center;background:rgba(124,58,237,0.1);color:#c084fc;">${d01}</div>
            <div class="la-cell-input" style="display:flex;align-items:center;justify-content:center;background:rgba(124,58,237,0.1);color:#c084fc;">${d10}</div>
            <div class="la-cell-input" style="display:flex;align-items:center;justify-content:center;background:rgba(124,58,237,0.1);color:#c084fc;">${d11}</div>
          </div>
        </div>
      </div>

      <div class="la-panel-actions">
        <button class="la-btn-action la-btn-back" onclick="QL.LinearAlgebraUI.prevStep()">← Previous</button>
        <button class="la-btn-action la-btn-next" onclick="QL.LinearAlgebraUI.nextStep()">Next: Multiply U† × U →</button>
      </div>
    `;
  }

  /* ------------------------------------------------------------
     STEP 4: COMPUTATION & ANIMATION STAGE
     ------------------------------------------------------------ */
  function renderStep4() {
    return `
      <div class="la-panel-step-badge">Step 4 of 5 · Calculation Execution</div>
      <h2 class="la-panel-heading">Compute Result</h2>
      <p class="la-panel-desc">Execute the mathematical transformation and observe intermediate step-by-step element transitions.</p>

      <div class="la-compute-action-wrap">
        <div style="font-size:0.95rem;color:#e2e8f0;margin-bottom:8px;">
          Ready to compute: <strong style="color:var(--learn-cyan);">${getOperationSymbol()}</strong>
        </div>
        <button class="la-btn-compute" id="la-btn-run-calc" onclick="QL.LinearAlgebraUI.runComputation()">
          <span>⚡</span> Compute Result
        </button>
        <div id="la-compute-progress-text" style="font-size:0.8rem;color:var(--text-muted);min-height:20px;">
          Click button above to trigger animated calculation.
        </div>
      </div>

      <div class="la-panel-actions">
        <button class="la-btn-action la-btn-back" onclick="QL.LinearAlgebraUI.prevStep()">← Previous</button>
        <button class="la-btn-action la-btn-next" id="la-btn-step4-next" disabled onclick="QL.LinearAlgebraUI.nextStep()">View Detailed Results →</button>
      </div>
    `;
  }

  /* ------------------------------------------------------------
     STEP 5: RESULTS SCREEN
     ------------------------------------------------------------ */
  function renderStep5() {
    if (!state.calculationResult) {
      calculateResultNow();
    }

    const res = state.calculationResult;
    let resultMatrixHtml = '';
    let explanationText = '';
    let quantumContextText = '';

    if (state.operation === 'addition') {
      const rows = res.result;
      resultMatrixHtml = `
        <div class="la-result-matrix-large">
          <div class="la-matrix-grid la-matrix-grid--2x2">
            <div class="la-result-cell-text">${rows[0][0].format()}</div>
            <div class="la-result-cell-text">${rows[0][1].format()}</div>
            <div class="la-result-cell-text">${rows[1][0].format()}</div>
            <div class="la-result-cell-text">${rows[1][1].format()}</div>
          </div>
        </div>
      `;
      explanationText = 'The result matrix is obtained by adding the corresponding elements of Matrix A and Matrix B.';
      quantumContextText = 'In quantum mechanics, observables and Hamiltonians are linear operators. When physical interactions sum (e.g. H_total = H_0 + H_int), their matrix representations add directly.';
    } else if (state.operation === 'multiplication') {
      const rows = res.result;
      resultMatrixHtml = `
        <div class="la-result-matrix-large">
          <div class="la-matrix-grid la-matrix-grid--2x2">
            <div class="la-result-cell-text">${rows[0][0].format()}</div>
            <div class="la-result-cell-text">${rows[0][1].format()}</div>
            <div class="la-result-cell-text">${rows[1][0].format()}</div>
            <div class="la-result-cell-text">${rows[1][1].format()}</div>
          </div>
        </div>
      `;
      explanationText = 'The resulting matrix represents the composite transformation produced by applying operator B followed by operator A (A × B).';
      quantumContextText = 'Quantum circuits execute sequentially. Applying gate B then gate A is mathematically equivalent to a single combined unitary gate U_combined = A × B.';
    } else if (state.operation === 'tensor') {
      const rows = res.result;
      let gridCells = '';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          gridCells += `<div class="la-result-cell-text" style="font-size:0.9rem;padding:6px 8px;">${rows[r][c].format()}</div>`;
        }
      }
      resultMatrixHtml = `
        <div class="la-result-matrix-large">
          <div class="la-matrix-grid" style="grid-template-columns:repeat(4, 60px);grid-template-rows:repeat(4, 38px);gap:6px;">
            ${gridCells}
          </div>
        </div>
      `;
      explanationText = 'The resulting 4×4 matrix represents the combined state space and joint operator acting on a 2-qubit register.';
      quantumContextText = 'When multiple qubits combine, their composite Hilbert space grows exponentially: 2 qubits need 2² = 4 dimensions, 3 qubits need 2³ = 8 dimensions, formed by the Kronecker product (A ⊗ B).';
    } else if (state.operation === 'matrix_vector') {
      const vec = res.result;
      resultMatrixHtml = `
        <div class="la-result-matrix-large">
          <div class="la-matrix-grid la-matrix-grid--vector">
            <div class="la-result-cell-text">${vec[0].format()}</div>
            <div class="la-result-cell-text">${vec[1].format()}</div>
          </div>
        </div>
      `;
      explanationText = 'The resulting vector represents the transformed quantum state |ψ\'⟩ after being acted upon by gate matrix A.';
      quantumContextText = 'All quantum gate executions are matrix-vector multiplications: |ψ_final⟩ = U |ψ_initial⟩. The gate rotates the state vector within the 2D complex Hilbert space.';
    } else if (state.operation === 'check_unitary') {
      const isU = res.isUnitary;
      resultMatrixHtml = `
        <div>
          <div class="la-unitary-badge ${isU ? 'la-unitary-badge--yes' : 'la-unitary-badge--no'}">
            ${isU ? '✓ VALID UNITARY MATRIX (Physical Quantum Gate)' : '✕ NOT UNITARY (Non-Physical Gate)'}
          </div>
          <div style="margin-top:14px;">
            <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">Computed Product U†U:</div>
            <div class="la-result-matrix-large">
              <div class="la-matrix-grid la-matrix-grid--2x2">
                <div class="la-result-cell-text">${res.product[0][0].format()}</div>
                <div class="la-result-cell-text">${res.product[0][1].format()}</div>
                <div class="la-result-cell-text">${res.product[1][0].format()}</div>
                <div class="la-result-cell-text">${res.product[1][1].format()}</div>
              </div>
            </div>
          </div>
        </div>
      `;
      explanationText = res.reason;
      quantumContextText = 'Unitarity ensures that probability is conserved: ⟨ψ|ψ⟩ = 1 at all times, and that quantum operations are physically reversible without information loss.';
    }

    // Save module progress if store available
    markProgressComplete();

    return `
      <div class="la-panel-step-badge">Step 5 of 5 · Results & Key Takeaways</div>
      <h2 class="la-panel-heading">Operation Results</h2>
      
      <div class="la-result-container">
        <div class="la-result-expression-pill">Expression: ${getOperationSymbol()}</div>
        
        <div>
          ${resultMatrixHtml}
        </div>

        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;">
          <div style="font-size:0.84rem;font-weight:700;color:#fff;margin-bottom:4px;">Mathematical Outcome:</div>
          <div style="font-size:0.86rem;color:var(--text-secondary);line-height:1.5;">${explanationText}</div>
        </div>

        <div class="la-learned-box">
          <div class="la-learned-box__title">
            <span>🎓</span> What You Learned in This Module:
          </div>
          <ul>
            <li><strong>Quantum states</strong> are represented by complex state vectors in Hilbert space.</li>
            <li><strong>Quantum gates</strong> are represented by square matrices operating on states.</li>
            <li><strong>Matrix-vector multiplication</strong> describes the physical state transition |ψ'⟩ = U|ψ⟩.</li>
            <li><strong>Tensor products (⊗)</strong> construct the exponential multi-qubit state space.</li>
            <li><strong>Unitary matrices (U†U = I)</strong> ensure quantum evolution is reversible and conserves 100% total probability.</li>
          </ul>
        </div>
      </div>

      <div class="la-panel-actions" style="margin-top:24px;">
        <button class="la-btn-action la-btn-back" onclick="QL.LinearAlgebraUI.tryAnother()">↺ Try Another Operation</button>
        <button class="la-btn-action la-btn-next" onclick="window.location.href='../learn.html'">Continue Learning →</button>
      </div>
    `;
  }

  function markProgressComplete() {
    try {
      if (QL.ProgressStore && typeof QL.ProgressStore.completeActivity === 'function') {
        QL.ProgressStore.completeActivity('act-linear-algebra');
      }
      // Also update local storage flag
      localStorage.setItem('ql_module_linear_algebra_completed', 'true');
    } catch (e) {
      console.warn('Progress save bypassed', e);
    }
  }

  /* ------------------------------------------------------------
     RIGHT PANEL LIVE MATHEMATICAL PREVIEW & CONTEXT
     ------------------------------------------------------------ */
  function renderRightPanelPreview() {
    const vizMount = document.getElementById('la-viz-mount');
    const eduMount = document.getElementById('la-edu-mount');
    if (!vizMount || !eduMount) return;

    let equationHtml = '';
    const matA = state.matrixA;
    const matB = state.matrixB;
    const vec = state.vector;

    if (state.operation === 'addition') {
      equationHtml = `
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][1].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][1].format()}</div>
            </div>
          </div>
          <span style="font-size:1.6rem;font-weight:700;color:var(--learn-cyan);">+</span>
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[0][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[0][1].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[1][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[1][1].format()}</div>
            </div>
          </div>
        </div>
      `;
    } else if (state.operation === 'multiplication') {
      equationHtml = `
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][1].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][1].format()}</div>
            </div>
          </div>
          <span style="font-size:1.6rem;font-weight:700;color:var(--learn-cyan);">×</span>
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[0][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[0][1].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[1][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[1][1].format()}</div>
            </div>
          </div>
        </div>
      `;
    } else if (state.operation === 'tensor') {
      equationHtml = `
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][1].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][1].format()}</div>
            </div>
          </div>
          <span style="font-size:1.6rem;font-weight:700;color:var(--learn-cyan);">⊗</span>
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[0][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[0][1].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[1][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matB[1][1].format()}</div>
            </div>
          </div>
        </div>
      `;
    } else if (state.operation === 'matrix_vector') {
      equationHtml = `
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--2x2">
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][1].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][1].format()}</div>
            </div>
          </div>
          <div class="la-math-bracket-box la-bracket-right-hooks">
            <div class="la-matrix-grid la-matrix-grid--vector">
              <div class="la-result-cell-text" style="font-size:0.95rem;">${vec[0].format()}</div>
              <div class="la-result-cell-text" style="font-size:0.95rem;">${vec[1].format()}</div>
            </div>
          </div>
        </div>
      `;
    } else if (state.operation === 'check_unitary') {
      const uDag = Engine.conjugateTranspose(matA);
      equationHtml = `
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;">
          <div style="text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">U† (Conjugate Transpose)</div>
            <div class="la-math-bracket-box la-bracket-right-hooks">
              <div class="la-matrix-grid la-matrix-grid--2x2">
                <div class="la-result-cell-text" style="font-size:0.95rem;color:#c084fc;">${uDag[0][0].format()}</div>
                <div class="la-result-cell-text" style="font-size:0.95rem;color:#c084fc;">${uDag[0][1].format()}</div>
                <div class="la-result-cell-text" style="font-size:0.95rem;color:#c084fc;">${uDag[1][0].format()}</div>
                <div class="la-result-cell-text" style="font-size:0.95rem;color:#c084fc;">${uDag[1][1].format()}</div>
              </div>
            </div>
          </div>
          <span style="font-size:1.6rem;font-weight:700;color:var(--learn-cyan);margin-top:16px;">×</span>
          <div style="text-align:center;">
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">U (Original Matrix)</div>
            <div class="la-math-bracket-box la-bracket-right-hooks">
              <div class="la-matrix-grid la-matrix-grid--2x2">
                <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][0].format()}</div>
                <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[0][1].format()}</div>
                <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][0].format()}</div>
                <div class="la-result-cell-text" style="font-size:0.95rem;">${matA[1][1].format()}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    vizMount.innerHTML = equationHtml;

    // Contextual Educational Note
    let eduTitle = 'Quantum Context & Mechanics';
    let eduBody = '';
    let eduTip = '';

    if (state.step === 1) {
      eduTitle = 'Linear Algebra in Quantum Computing';
      eduBody = 'Unlike classical computing which uses discrete 0s and 1s, quantum algorithms operate on continuous probability vectors transformed by linear operators.';
      eduTip = 'Every quantum circuit can be mathematically modeled with matrices and vectors.';
    } else if (state.step === 2) {
      const presetInfo = Engine.PRESETS[state.presetA];
      eduTitle = presetInfo ? presetInfo.name : 'Configuring Matrix A';
      eduBody = presetInfo ? presetInfo.desc : 'Quantum gates transform the probability amplitudes of quantum states. Ensure the matrix is configured as intended.';
      eduTip = 'Notice how diagonal elements affect relative phase, while off-diagonal elements flip computational basis states.';
    } else if (state.step === 3) {
      if (state.operation === 'matrix_vector') {
        const vInfo = Engine.VECTOR_PRESETS[state.presetV];
        eduTitle = vInfo ? vInfo.name : 'State Vector |ψ⟩';
        eduBody = vInfo ? vInfo.desc : 'A 2D column vector specifying the probability amplitudes of finding the qubit in state |0⟩ or |1⟩.';
        eduTip = 'The sum of the squared absolute values of the amplitudes must equal 1 (Born rule).';
      } else if (state.operation === 'check_unitary') {
        eduTitle = 'Hermitian Adjoint & Unitarity';
        eduBody = 'The conjugate transpose U† inverts the unitary operation: U† = U⁻¹. This makes quantum computations fully reversible.';
        eduTip = 'If U is unitary, U†U equals the identity matrix I.';
      } else {
        const presetInfo = Engine.PRESETS[state.presetB];
        eduTitle = presetInfo ? `Matrix B: ${presetInfo.name}` : 'Configuring Matrix B';
        eduBody = presetInfo ? presetInfo.desc : 'Configuring second operator B for composite operation.';
        eduTip = 'Matrix multiplication is generally non-commutative in quantum mechanics: AB ≠ BA.';
      }
    } else if (state.step === 4) {
      eduTitle = 'Transformation Mechanics';
      eduBody = 'During computation, row vectors multiply column vectors to generate intermediate components. Watch the animation trace each step.';
      eduTip = 'Click "Compute Result" to see the step-by-step element evaluation.';
    } else {
      eduTitle = 'Physical Quantum Significance';
      eduBody = 'The resulting matrix or state vector represents the final observable state of the quantum subsystem.';
      eduTip = 'You can modify any matrix or change the operation to explore other quantum gate combinations.';
    }

    eduMount.innerHTML = `
      <div class="la-edu-header">
        <span>💡</span> ${eduTitle}
      </div>
      <div class="la-edu-body">${eduBody}</div>
      <div class="la-edu-highlight"><strong>Key Insight:</strong> ${eduTip}</div>
    `;
  }

  /* ------------------------------------------------------------
     ANIMATED COMPUTATION FLOW
     ------------------------------------------------------------ */
  function calculateResultNow() {
    try {
      if (state.operation === 'addition') {
        state.calculationResult = Engine.addMatrices(state.matrixA, state.matrixB);
      } else if (state.operation === 'multiplication') {
        state.calculationResult = Engine.multiplyMatrices(state.matrixA, state.matrixB);
      } else if (state.operation === 'tensor') {
        state.calculationResult = Engine.tensorProduct(state.matrixA, state.matrixB);
      } else if (state.operation === 'matrix_vector') {
        state.calculationResult = Engine.matrixVectorMultiply(state.matrixA, state.vector);
      } else if (state.operation === 'check_unitary') {
        state.calculationResult = Engine.checkUnitary(state.matrixA);
      }
    } catch (err) {
      console.error(err);
      state.calculationResult = null;
    }
  }

  function runComputation() {
    if (state.isComputing) return;
    state.isComputing = true;

    calculateResultNow();
    const res = state.calculationResult;
    const vizMount = document.getElementById('la-viz-mount');
    const statusText = document.getElementById('la-compute-progress-text');
    const nextBtn = document.getElementById('la-btn-step4-next');

    if (!res) {
      if (statusText) statusText.innerHTML = '<span style="color:var(--learn-rose);">Computation error. Check matrix inputs.</span>';
      state.isComputing = false;
      return;
    }

    if (statusText) statusText.innerHTML = '<span style="color:var(--learn-cyan);">Calculating elements and tracing transformations...</span>';

    // Animate calculation steps
    const steps = res.steps || [];
    let stepIdx = 0;

    function renderAnimFrame() {
      if (stepIdx < steps.length) {
        const cur = steps[stepIdx];
        if (vizMount) {
          vizMount.innerHTML = `
            <div style="text-align:center;padding:10px;">
              <div style="font-size:0.75rem;font-weight:700;color:var(--learn-cyan);text-transform:uppercase;margin-bottom:8px;">Computing Step ${stepIdx + 1} of ${steps.length}</div>
              <div class="la-anim-step-row highlight">
                <span>${cur.formula}</span>
              </div>
            </div>
          `;
        }
        stepIdx++;
        setTimeout(renderAnimFrame, 350);
      } else {
        // Animation finished
        state.isComputing = false;
        if (statusText) statusText.innerHTML = '<span style="color:var(--learn-emerald);">✓ Calculation complete! Ready to view final results.</span>';
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.focus();
        }
        renderRightPanelPreview();
      }
    }

    renderAnimFrame();
  }

  /* ------------------------------------------------------------
     EVENT HANDLERS & STEP NAVIGATION
     ------------------------------------------------------------ */
  function renderStepContent() {
    const mount = document.getElementById('la-panel-mount');
    if (!mount) return;

    if (state.step === 1) mount.innerHTML = renderStep1();
    else if (state.step === 2) mount.innerHTML = renderStep2();
    else if (state.step === 3) mount.innerHTML = renderStep3();
    else if (state.step === 4) mount.innerHTML = renderStep4();
    else if (state.step === 5) mount.innerHTML = renderStep5();
  }

  function selectOperation(opId) {
    state.operation = opId;
    renderStepper();
    renderStepContent();
    renderRightPanelPreview();
  }

  function applyPreset(target, presetId) {
    if (target === 'A') {
      state.presetA = presetId;
      if (presetId !== 'custom' && Engine.PRESETS[presetId]) {
        state.matrixA = Engine.cloneMatrix(Engine.PRESETS[presetId].matrix);
      }
    } else if (target === 'B') {
      state.presetB = presetId;
      if (presetId !== 'custom' && Engine.PRESETS[presetId]) {
        state.matrixB = Engine.cloneMatrix(Engine.PRESETS[presetId].matrix);
      }
    } else if (target === 'V') {
      state.presetV = presetId;
      if (presetId !== 'custom' && Engine.VECTOR_PRESETS[presetId]) {
        state.vector = Engine.VECTOR_PRESETS[presetId].vector.map(c => Engine.Complex.from(c));
      }
    }
    renderStepContent();
    renderRightPanelPreview();
  }

  function onCellChange(matTarget, row, col, rawVal) {
    const parsed = Engine.Complex.parse(rawVal);
    if (matTarget === 'A') {
      state.matrixA[row][col] = parsed;
      state.presetA = 'custom';
    } else {
      state.matrixB[row][col] = parsed;
      state.presetB = 'custom';
    }
    renderRightPanelPreview();
  }

  function onVectorChange(idx, rawVal) {
    const parsed = Engine.Complex.parse(rawVal);
    state.vector[idx] = parsed;
    state.presetV = 'custom';
    renderRightPanelPreview();
  }

  function nextStep() {
    if (state.step < 5) {
      state.step++;
      renderStepper();
      renderStepContent();
      renderRightPanelPreview();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  function prevStep() {
    if (state.step > 1) {
      state.step--;
      renderStepper();
      renderStepContent();
      renderRightPanelPreview();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  function goToStep(num) {
    if (num <= state.step || num === state.step + 1) {
      state.step = num;
      renderStepper();
      renderStepContent();
      renderRightPanelPreview();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  function tryAnother() {
    state.step = 1;
    state.calculationResult = null;
    renderStepper();
    renderStepContent();
    renderRightPanelPreview();
  }

  function resetSimulation() {
    state.operation = 'addition';
    state.step = 1;
    state.presetA = 'identity';
    state.matrixA = Engine.cloneMatrix(Engine.PRESETS.identity.matrix);
    state.presetB = 'pauliX';
    state.matrixB = Engine.cloneMatrix(Engine.PRESETS.pauliX.matrix);
    state.presetV = 'ket0';
    state.vector = Engine.VECTOR_PRESETS.ket0.vector.map(c => Engine.Complex.from(c));
    state.calculationResult = null;
    state.isComputing = false;
    renderStepper();
    renderStepContent();
    renderRightPanelPreview();
  }

  function getOperationDisplayName() {
    const op = OPERATIONS.find(o => o.id === state.operation);
    return op ? op.name : 'Operation';
  }

  function getOperationSymbol() {
    const op = OPERATIONS.find(o => o.id === state.operation);
    return op ? op.symbol : '';
  }

  return {
    init,
    selectOperation,
    applyPreset,
    onCellChange,
    onVectorChange,
    nextStep,
    prevStep,
    goToStep,
    runComputation,
    tryAnother,
    resetSimulation
  };
})();
