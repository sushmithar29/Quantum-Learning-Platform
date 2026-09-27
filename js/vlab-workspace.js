/* ============================================================
   QUANTUMLAB — VIRTUAL LAB WORKSPACE ENGINE
   Universal simulation engine for all 15 labs
   vlab-workspace.js
   ============================================================ */

'use strict';

window.VLW = window.VLW || {};

/* ============================================================
   SIMULATION CONFIGS — per-lab metadata & steps
   ============================================================ */
VLW.configs = {
  qsvm: {
    title: 'Quantum Support Vector Machines',
    shortTitle: 'QSVM',
    category: 'Quantum Machine Learning',
    difficulty: 'Advanced',
    time: '35 min',
    color: '#7c3aed',
    steps: [
      { id: 'prepare',   label: 'Prepare',   icon: '⚙', desc: 'Initialize dataset and quantum registers' },
      { id: 'encode',    label: 'Encode',    icon: '↑', desc: 'Apply quantum feature map to data points' },
      { id: 'kernel',    label: 'Kernel',    icon: '🔷', desc: 'Compute quantum kernel matrix' },
      { id: 'optimize',  label: 'Optimize',  icon: '⚡', desc: 'Solve dual SVM optimization classically' },
      { id: 'boundary',  label: 'Boundary',  icon: '✂', desc: 'Render quantum decision boundary' },
      { id: 'measure',   label: 'Measure',   icon: '📊', desc: 'Evaluate classification accuracy' }
    ],
    controls: [
      { id: 'dataset',   label: 'Dataset',     type: 'select', options: ['Concentric Circles','Linear','Moons'], default: 'Concentric Circles' },
      { id: 'numPoints', label: 'Data Points', type: 'range', min: 8, max: 24, step: 4, default: 16 },
      { id: 'noise',     label: 'Noise Level', type: 'range', min: 0, max: 0.3, step: 0.05, default: 0.05 },
      { id: 'featureMap',label: 'Feature Map', type: 'select', options: ['ZZFeatureMap','ZFeatureMap','PauliFeatureMap'], default: 'ZZFeatureMap' }
    ],
    observation: 'The quantum feature map projects data into a 4D Hilbert space where non-linearly separable classes become separable.',
    refs: [
      { title: 'Quantum SVM', authors: 'Havlíček et al.', pub: 'Nature 2019' },
      { title: 'Quantum Kernel Methods', authors: 'Schuld & Killoran', pub: 'PRL 2019' }
    ]
  },
  shors: {
    title: "Shor's Factorization Algorithm",
    shortTitle: "Shor's",
    category: 'Number Theory & Cryptography',
    difficulty: 'Expert',
    time: '45 min',
    color: '#d946ef',
    steps: [
      { id: 'choose',    label: 'Choose N',   icon: '🔢', desc: 'Select integer N to factor' },
      { id: 'prepare',   label: 'Prepare',   icon: '⚙', desc: 'Initialize quantum registers' },
      { id: 'modexp',    label: 'Mod Exp',   icon: '⚡', desc: 'Quantum modular exponentiation' },
      { id: 'qft',       label: 'QFT',       icon: '🌊', desc: 'Apply Quantum Fourier Transform' },
      { id: 'measure',   label: 'Measure',   icon: '📊', desc: 'Measure period r' },
      { id: 'factor',    label: 'Factor',    icon: '✂', desc: 'Compute GCD to find factors' }
    ],
    controls: [
      { id: 'N',      label: 'Number N',    type: 'select', options: ['15','21','35','77','91'], default: '15' },
      { id: 'a',      label: 'Base a',      type: 'select', options: ['2','4','7','8','11','13'], default: '2' },
      { id: 'qubits', label: 'Register Size', type: 'range', min: 3, max: 6, step: 1, default: 4 }
    ],
    observation: 'Quantum parallelism evaluates f(x) = a^x mod N for all x simultaneously. The QFT extracts the period r.',
    refs: [
      { title: "Polynomial-Time Algorithms for Prime Factorization", authors: 'Shor, P.W.', pub: 'SIAM J. Comput. 1997' }
    ]
  },
  qft: {
    title: 'Quantum Fourier Transform',
    shortTitle: 'QFT',
    category: 'Fundamentals & Primitives',
    difficulty: 'Intermediate',
    time: '30 min',
    color: '#06b6d4',
    steps: [
      { id: 'state',   label: 'Input State', icon: '↑', desc: 'Prepare computational basis state' },
      { id: 'h',       label: 'Hadamard',    icon: 'H', desc: 'Apply Hadamard to create superposition' },
      { id: 'phases',  label: 'Phases',      icon: '🔄', desc: 'Controlled phase rotation gates' },
      { id: 'swap',    label: 'Bit Swap',    icon: '↔', desc: 'Bit-reversal permutation' },
      { id: 'output',  label: 'Output',      icon: '🌊', desc: 'Frequency domain state' },
      { id: 'measure', label: 'Measure',     icon: '📊', desc: 'Sample frequency amplitudes' }
    ],
    controls: [
      { id: 'qubits',    label: 'Qubits n', type: 'range', min: 2, max: 5, step: 1, default: 3 },
      { id: 'inputState',label: 'Input State', type: 'select', options: ['|0...0⟩','|1...0⟩','Superposition','Random'], default: '|0...0⟩' }
    ],
    observation: 'The QFT transforms a computational basis state into a uniform superposition with phases encoding frequency information.',
    refs: [
      { title: 'Quantum Computation and Quantum Information', authors: 'Nielsen & Chuang', pub: 'Cambridge UP, 2010' }
    ]
  },
  qpe: {
    title: 'Quantum Phase Estimation',
    shortTitle: 'QPE',
    category: 'Fundamentals & Primitives',
    difficulty: 'Advanced',
    time: '35 min',
    color: '#3b82f6',
    steps: [
      { id: 'eigen',   label: 'Eigenstate', icon: '↑', desc: 'Prepare eigenstate |u⟩' },
      { id: 'super',   label: 'Superpose',  icon: 'H', desc: 'Hadamard on precision register' },
      { id: 'control', label: 'C-U gates',  icon: '⚡', desc: 'Controlled unitary applications' },
      { id: 'qft',     label: 'IQFT',       icon: '🌊', desc: 'Inverse QFT on control register' },
      { id: 'measure', label: 'Measure',    icon: '📊', desc: 'Read out estimated phase φ' },
      { id: 'result',  label: 'Result',     icon: '✅', desc: 'Phase φ extracted successfully' }
    ],
    controls: [
      { id: 'phase',      label: 'True Phase φ', type: 'range', min: 0, max: 1, step: 0.05, default: 0.25 },
      { id: 'precision',  label: 'Precision t', type: 'range', min: 2, max: 6, step: 1, default: 3 }
    ],
    observation: 'The state vector on the Bloch sphere rotates as controlled-U gates accumulate phase. The IQFT extracts this phase.',
    refs: [
      { title: 'Phase Estimation Algorithm', authors: 'Kitaev, A.', pub: 'arXiv:quant-ph/9511026' }
    ]
  },
  vqe: {
    title: 'Variational Quantum Eigensolver',
    shortTitle: 'VQE',
    category: 'Quantum Simulation & Chemistry',
    difficulty: 'Advanced',
    time: '40 min',
    color: '#10b981',
    steps: [
      { id: 'hamiltonian', label: 'Hamiltonian', icon: 'Ĥ', desc: 'Define molecular Hamiltonian' },
      { id: 'ansatz',      label: 'Ansatz',      icon: '⚙', desc: 'Initialize parameterized circuit' },
      { id: 'measure',     label: 'Measure ⟨E⟩', icon: '📊', desc: 'Measure energy expectation value' },
      { id: 'optimize',    label: 'Optimize',    icon: '⚡', desc: 'Classical optimizer updates θ' },
      { id: 'converge',    label: 'Converge',    icon: '🎯', desc: 'Monitor convergence on landscape' },
      { id: 'result',      label: 'Ground State',icon: '✅', desc: 'Ground state energy E₀ found' }
    ],
    controls: [
      { id: 'molecule',   label: 'Molecule',    type: 'select', options: ['H₂','LiH','HeH⁺','H₂O (toy)'], default: 'H₂' },
      { id: 'iterations', label: 'Max Iterations', type: 'range', min: 10, max: 100, step: 10, default: 50 },
      { id: 'optimizer',  label: 'Optimizer',   type: 'select', options: ['COBYLA','SPSA','Adam'], default: 'COBYLA' }
    ],
    observation: 'The variational principle guarantees ⟨ψ(θ)|Ĥ|ψ(θ)⟩ ≥ E₀. Optimization traverses the energy landscape to find ground state.',
    refs: [
      { title: 'A variational eigenvalue solver on a photonic chip', authors: 'Peruzzo et al.', pub: 'Nature Comms 2014' }
    ]
  },
  qaoa: {
    title: 'Quantum Approximate Optimization',
    shortTitle: 'QAOA',
    category: 'Optimization',
    difficulty: 'Advanced',
    time: '40 min',
    color: '#f59e0b',
    steps: [
      { id: 'graph',    label: 'Graph',    icon: '🔗', desc: 'Define problem graph G=(V,E)' },
      { id: 'encode',   label: 'Encode',   icon: '↑', desc: 'Encode problem in cost Hamiltonian' },
      { id: 'layer',    label: 'QAOA Layer', icon: '⚡', desc: 'Apply phase + mixer operators' },
      { id: 'measure',  label: 'Measure',  icon: '📊', desc: 'Sample solution state' },
      { id: 'optimize', label: 'Optimize', icon: '🔄', desc: 'Tune β and γ parameters' },
      { id: 'result',   label: 'Result',   icon: '✅', desc: 'Best cut configuration found' }
    ],
    controls: [
      { id: 'nodes',   label: 'Graph Nodes', type: 'range', min: 4, max: 8, step: 1, default: 5 },
      { id: 'p',       label: 'QAOA depth p', type: 'range', min: 1, max: 4, step: 1, default: 2 },
      { id: 'beta',    label: 'Beta β', type: 'range', min: 0, max: 3.14, step: 0.1, default: 0.5 },
      { id: 'gamma',   label: 'Gamma γ', type: 'range', min: 0, max: 3.14, step: 0.1, default: 0.8 }
    ],
    observation: 'Graph nodes change color as QAOA layers encode the cost Hamiltonian, maximizing the number of cut edges.',
    refs: [
      { title: 'A Quantum Approximate Optimization Algorithm', authors: 'Farhi, Goldstone & Gutmann', pub: 'arXiv:1411.4028' }
    ]
  },
  grover: {
    title: "Grover's Search Algorithm",
    shortTitle: 'Grover',
    category: 'Search',
    difficulty: 'Intermediate',
    time: '28 min',
    color: '#ef4444',
    steps: [
      { id: 'super',    label: 'Superpose',  icon: 'H', desc: 'Create uniform superposition' },
      { id: 'oracle',   label: 'Oracle',     icon: '🎯', desc: 'Mark target state with phase flip' },
      { id: 'diffuse',  label: 'Diffusion',  icon: '🔄', desc: 'Amplitude amplification (Grover diffusion)' },
      { id: 'iterate',  label: 'Iterate',    icon: '⚡', desc: 'Repeat oracle + diffusion ⌊π√N/4⌋ times' },
      { id: 'measure',  label: 'Measure',    icon: '📊', desc: 'Sample; target found with high probability' },
      { id: 'result',   label: 'Result',     icon: '✅', desc: 'Target item identified' }
    ],
    controls: [
      { id: 'searchSize', label: 'Search Space N', type: 'select', options: ['4','8','16','32','64'], default: '16' },
      { id: 'target',     label: 'Target Index',   type: 'range', min: 0, max: 15, step: 1, default: 5 },
      { id: 'iterations', label: 'Iterations',     type: 'range', min: 1, max: 8, step: 1, default: 3 }
    ],
    observation: 'Amplitude amplification boosts the target state amplitude from 1/√N to near 1 in O(√N) iterations.',
    refs: [
      { title: 'A fast quantum mechanical algorithm for database search', authors: 'Grover, L.K.', pub: 'STOC 1996' }
    ]
  },
  qnn: {
    title: 'Quantum Neural Networks',
    shortTitle: 'QNN',
    category: 'Quantum Deep Learning',
    difficulty: 'Expert',
    time: '45 min',
    color: '#a78bfa',
    steps: [
      { id: 'data',     label: 'Input Data',  icon: '📥', desc: 'Encode classical data into quantum state' },
      { id: 'layer1',   label: 'Q-Layer 1',   icon: '⚡', desc: 'First parameterized quantum layer' },
      { id: 'layer2',   label: 'Q-Layer 2',   icon: '⚡', desc: 'Second parameterized quantum layer' },
      { id: 'measure',  label: 'Measure',     icon: '📊', desc: 'Measure quantum output state' },
      { id: 'backprop', label: 'Gradient',    icon: '∇', desc: 'Parameter-shift gradient computation' },
      { id: 'update',   label: 'Update θ',    icon: '🔄', desc: 'Update parameters, repeat' }
    ],
    controls: [
      { id: 'layers',   label: 'Quantum Layers', type: 'range', min: 1, max: 4, step: 1, default: 2 },
      { id: 'qubits',   label: 'Qubits',         type: 'range', min: 2, max: 4, step: 1, default: 3 },
      { id: 'lr',       label: 'Learning Rate',  type: 'range', min: 0.01, max: 0.5, step: 0.01, default: 0.1 }
    ],
    observation: 'Parameterized quantum circuits act as quantum neurons. The parameter-shift rule enables gradient computation on quantum hardware.',
    refs: [
      { title: 'Circuit-centric quantum classifiers', authors: 'Schuld et al.', pub: 'PRA 2020' }
    ]
  },
  qka: {
    title: 'Quantum Kernel Alignment',
    shortTitle: 'QKA',
    category: 'Quantum Machine Learning',
    difficulty: 'Expert',
    time: '40 min',
    color: '#06b6d4',
    steps: [
      { id: 'data',    label: 'Dataset',    icon: '📥', desc: 'Load labeled training data' },
      { id: 'kernel',  label: 'Init Kernel', icon: '🔷', desc: 'Initialize parameterized quantum kernel' },
      { id: 'align',   label: 'KTA Score',  icon: '📊', desc: 'Compute kernel-target alignment score' },
      { id: 'grad',    label: 'Gradient',   icon: '∇', desc: 'Gradient of KTA w.r.t. kernel params' },
      { id: 'update',  label: 'Update',     icon: '🔄', desc: 'Update kernel parameters' },
      { id: 'result',  label: 'Aligned',    icon: '✅', desc: 'Optimal kernel found' }
    ],
    controls: [
      { id: 'dataset',  label: 'Dataset',       type: 'select', options: ['Binary','Multiclass','Regression'], default: 'Binary' },
      { id: 'depth',    label: 'Feature Map Depth', type: 'range', min: 1, max: 4, step: 1, default: 2 },
      { id: 'iters',    label: 'Alignment Steps',   type: 'range', min: 5, max: 30, step: 5, default: 15 }
    ],
    observation: 'The kernel matrix evolves as parameters are adjusted, increasing the KTA score and class separability.',
    refs: [
      { title: 'Quantum kernel alignment', authors: 'Hubregtsen et al.', pub: 'Quantum ML 2022' }
    ]
  },
  qpca: {
    title: 'Quantum Principal Component Analysis',
    shortTitle: 'qPCA',
    category: 'Quantum Machine Learning',
    difficulty: 'Advanced',
    time: '35 min',
    color: '#10b981',
    steps: [
      { id: 'data',     label: 'Input Data',   icon: '📥', desc: 'High-dimensional input dataset' },
      { id: 'density',  label: 'Density ρ',    icon: '📐', desc: 'Prepare quantum density matrix' },
      { id: 'expont',   label: 'Exponentiate', icon: '⚡', desc: 'Quantum density matrix exponentiation' },
      { id: 'qpe',      label: 'QPE',          icon: '🌊', desc: 'Phase estimation for eigenvalues' },
      { id: 'measure',  label: 'Measure',      icon: '📊', desc: 'Extract principal components' },
      { id: 'result',   label: 'Projection',   icon: '✅', desc: 'Data projected onto principal axes' }
    ],
    controls: [
      { id: 'dims',       label: 'Input Dimensions', type: 'range', min: 2, max: 8, step: 1, default: 4 },
      { id: 'components', label: 'Principal Components', type: 'range', min: 1, max: 3, step: 1, default: 2 }
    ],
    observation: 'Quantum density matrix exponentiation extracts dominant eigenvectors (principal components) exponentially faster for high-dimensional data.',
    refs: [
      { title: 'Quantum principal component analysis', authors: 'Lloyd, Mohseni & Rebentrost', pub: 'Nature Physics 2014' }
    ]
  },
  hhl: {
    title: 'HHL Algorithm',
    shortTitle: 'HHL',
    category: 'Fundamentals & Primitives',
    difficulty: 'Expert',
    time: '45 min',
    color: '#f59e0b',
    steps: [
      { id: 'system',   label: 'Linear System', icon: '📐', desc: 'Define Ax = b problem' },
      { id: 'encode',   label: 'Encode |b⟩',    icon: '↑', desc: 'Encode vector b in quantum state' },
      { id: 'qpe',      label: 'QPE',           icon: '🌊', desc: 'Phase estimation of A eigenvalues' },
      { id: 'rotate',   label: 'Rotation',      icon: '🔄', desc: 'Controlled rotation by 1/λ' },
      { id: 'iqpe',     label: 'Uncompute',     icon: '⚡', desc: 'Uncompute QPE register' },
      { id: 'result',   label: 'Solution',      icon: '✅', desc: 'Quantum state encoding solution |x⟩' }
    ],
    controls: [
      { id: 'matrixType', label: 'Matrix Type', type: 'select', options: ['2×2 Hermitian','4×4 Diagonal','Tridiagonal'], default: '2×2 Hermitian' },
      { id: 'kappa',      label: 'Condition κ', type: 'range', min: 1, max: 10, step: 0.5, default: 3 }
    ],
    observation: 'The controlled rotation by 1/λᵢ inverts eigenvalues, encoding the solution vector in the quantum amplitude.',
    refs: [
      { title: 'Quantum Algorithm for Linear Systems of Equations', authors: 'Harrow, Hassidim & Lloyd', pub: 'PRL 2009' }
    ]
  },
  'deutsch-jozsa': {
    title: 'Deutsch-Jozsa Algorithm',
    shortTitle: 'D-J',
    category: 'Fundamentals & Primitives',
    difficulty: 'Beginner',
    time: '20 min',
    color: '#7c3aed',
    steps: [
      { id: 'state',   label: 'Init State', icon: '↑', desc: 'Prepare |0⟩ⁿ|1⟩ input' },
      { id: 'h1',      label: 'Hadamard',   icon: 'H', desc: 'Hadamard on all qubits' },
      { id: 'oracle',  label: 'Oracle Uf',  icon: '🎯', desc: 'Apply oracle Uf (constant or balanced?)' },
      { id: 'h2',      label: 'Hadamard',   icon: 'H', desc: 'Hadamard on input register again' },
      { id: 'measure', label: 'Measure',    icon: '📊', desc: 'Measure: all-zero ↔ constant, else balanced' },
      { id: 'result',  label: 'Result',     icon: '✅', desc: 'Constant or Balanced — one query!' }
    ],
    controls: [
      { id: 'qubits',      label: 'Input Qubits n', type: 'range', min: 1, max: 5, step: 1, default: 3 },
      { id: 'oracleType',  label: 'Oracle Type', type: 'select', options: ['Constant-0','Constant-1','Balanced','Random'], default: 'Balanced' }
    ],
    observation: 'The Deutsch-Jozsa oracle interferes constructively for balanced functions (non-zero output) and destructively for constant functions (all-zero output).',
    refs: [
      { title: 'Rapid solution of problems by quantum computation', authors: 'Deutsch & Jozsa', pub: 'Proc. Roy. Soc. 1992' }
    ]
  },
  'bernstein-vazirani': {
    title: 'Bernstein-Vazirani Algorithm',
    shortTitle: 'B-V',
    category: 'Quantum Information',
    difficulty: 'Beginner',
    time: '20 min',
    color: '#d946ef',
    steps: [
      { id: 'state',   label: 'Init State', icon: '↑', desc: 'Prepare |0⟩ⁿ|1⟩ and choose secret s' },
      { id: 'h1',      label: 'Hadamard',   icon: 'H', desc: 'Hadamard: uniform superposition' },
      { id: 'oracle',  label: 'Oracle Uf',  icon: '🔑', desc: 'Oracle applies f(x) = s·x mod 2' },
      { id: 'h2',      label: 'Hadamard',   icon: 'H', desc: 'Hadamard again on input register' },
      { id: 'measure', label: 'Measure',    icon: '📊', desc: 'Measure directly yields secret s' },
      { id: 'result',  label: 'Secret!',    icon: '✅', desc: 'Hidden bitstring s revealed in 1 query' }
    ],
    controls: [
      { id: 'qubits', label: 'Qubits n',      type: 'range', min: 2, max: 6, step: 1, default: 4 },
      { id: 'secret', label: 'Secret string', type: 'select', options: ['1010','0101','1101','1001','0110','Random'], default: '1010' }
    ],
    observation: 'Phase kickback via the oracle imprints the secret bitstring s as phase in the superposition. One Hadamard reverses this to extract s directly.',
    refs: [
      { title: 'Quantum complexity theory', authors: 'Bernstein & Vazirani', pub: 'SIAM J. Comput. 1997' }
    ]
  },
  'quantum-teleportation': {
    title: 'Quantum Teleportation',
    shortTitle: 'Teleportation',
    category: 'Quantum Information',
    difficulty: 'Intermediate',
    time: '25 min',
    color: '#06b6d4',
    steps: [
      { id: 'state',    label: 'Alice Prepares', icon: '🔴', desc: 'Alice prepares unknown state |ψ⟩' },
      { id: 'entangle', label: 'Entangle',       icon: '🔗', desc: 'Create Bell pair shared Alice–Bob' },
      { id: 'bell',     label: 'Bell Measure',   icon: '📊', desc: 'Alice performs Bell measurement' },
      { id: 'classical',label: 'Classical Bits', icon: '📡', desc: 'Alice sends 2 classical bits to Bob' },
      { id: 'correct',  label: 'Correction',     icon: '⚡', desc: 'Bob applies Pauli correction' },
      { id: 'result',   label: 'Teleported!',    icon: '✅', desc: '|ψ⟩ faithfully reconstructed at Bob' }
    ],
    controls: [
      { id: 'stateTheta', label: 'State θ (polar)',    type: 'range', min: 0, max: 3.14, step: 0.1, default: 1.05 },
      { id: 'statePhi',   label: 'State φ (azimuth)', type: 'range', min: 0, max: 6.28, step: 0.1, default: 0.5 }
    ],
    observation: 'Entanglement enables the quantum state to appear at Bob after only 2 classical bits are transmitted. No quantum channel needed during teleportation.',
    refs: [
      { title: 'Teleporting an unknown quantum state via dual EPR', authors: 'Bennett et al.', pub: 'PRL 1993' }
    ]
  },
  qae: {
    title: 'Quantum Amplitude Estimation',
    shortTitle: 'QAE',
    category: 'Quantum Machine Learning',
    difficulty: 'Advanced',
    time: '35 min',
    color: '#3b82f6',
    steps: [
      { id: 'define',   label: 'Define A',   icon: '⚙', desc: 'Define amplitude oracle A with target amplitude a' },
      { id: 'prepare',  label: 'Grover',     icon: '🔄', desc: 'Initialize Grover operator Q = AS₀A†Sχ' },
      { id: 'qpe',      label: 'QPE',        icon: '🌊', desc: 'Phase estimation of eigenvalues of Q' },
      { id: 'measure',  label: 'Measure',    icon: '📊', desc: 'Measure ancilla register' },
      { id: 'estimate', label: 'Estimate',   icon: '🎯', desc: 'Compute â = sin²(πy/2ᵐ)' },
      { id: 'result',   label: 'Result',     icon: '✅', desc: 'Amplitude â estimated with O(1/ε) queries' }
    ],
    controls: [
      { id: 'trueAmp',   label: 'True Amplitude a', type: 'range', min: 0.05, max: 0.95, step: 0.05, default: 0.3 },
      { id: 'precision', label: 'Precision bits m',  type: 'range', min: 2, max: 6, step: 1, default: 4 }
    ],
    observation: 'QAE provides a quadratic speedup over classical Monte Carlo: estimates amplitude a to error ε using O(1/ε) vs O(1/ε²) samples.',
    refs: [
      { title: 'Quantum amplitude amplification and estimation', authors: 'Brassard et al.', pub: 'AMS Contemp. Math. 2002' }
    ]
  }
};

/* ============================================================
   SIMULATION ENGINE — per-lab canvas renderers
   ============================================================ */
VLW.Sim = {};

VLW.Sim.qsvm = function(canvas, state, params) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const scale = Math.min(W, H) * 0.38;

  ctx.clearRect(0, 0, W, H);

  // Background grid
  ctx.strokeStyle = 'rgba(124,58,237,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  const step = state.step;
  const t = state.t;
  const noiseFactor = params.noise || 0.05;

  // Generate points
  const pts = state.points || [];

  // Draw decision boundary (steps 4+)
  if (step >= 4) {
    const dsType = params.dataset || 'circles';
    if (dsType === 'circles' || dsType === 'Concentric Circles') {
      // Circular boundary
      const r = scale * 0.58;
      const grad = ctx.createRadialGradient(cx, cy, r - 4, cx, cy, r + 4);
      grad.addColorStop(0, 'rgba(124,58,237,0.0)');
      grad.addColorStop(0.5, 'rgba(124,58,237,0.35)');
      grad.addColorStop(1, 'rgba(124,58,237,0.0)');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(167,139,250,0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner fill
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,58,237,0.05)';
      ctx.fill();
    } else {
      // Linear boundary
      const ang = -0.6;
      const cosA = Math.cos(ang), sinA = Math.sin(ang);
      const len = scale * 1.3;
      ctx.beginPath();
      ctx.moveTo(cx - cosA * len, cy - sinA * len);
      ctx.lineTo(cx + cosA * len, cy + sinA * len);
      ctx.strokeStyle = 'rgba(167,139,250,0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Draw points with animation
  pts.forEach((p, i) => {
    const prog = Math.min(1, (t - i * 0.05) * 2);
    if (prog <= 0) return;

    const sx = cx + p.x * scale;
    const sy = cy - p.y * scale;

    const isClass1 = p.label === 1;
    const baseColor = isClass1 ? '#06b6d4' : '#d946ef';
    const glowColor = isClass1 ? 'rgba(6,182,212,0.3)' : 'rgba(217,70,239,0.3)';

    // Glow
    if (step >= 2) {
      ctx.beginPath();
      ctx.arc(sx, sy, 10 * prog, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();
    }

    // Point
    ctx.beginPath();
    ctx.arc(sx, sy, 5 * prog, 0, Math.PI * 2);
    ctx.fillStyle = baseColor;
    ctx.fill();

    // Support vector ring (step 4+)
    if (step >= 4 && p.isSV) {
      ctx.beginPath();
      ctx.arc(sx, sy, 9, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245,158,11,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Step labels
  const labels = ['Initializing...', 'Encoding features...', 'Computing kernel matrix...', 'Optimizing SVM...', 'Rendering boundary...', 'Evaluating accuracy...'];
  ctx.fillStyle = 'rgba(167,139,250,0.9)';
  ctx.font = '600 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(labels[Math.min(step, labels.length - 1)], cx, H - 20);
};

VLW.Sim.grover = function(canvas, state, params) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const N = parseInt(params.searchSize || 16);
  const target = parseInt(params.target || 5);
  const step = state.step;
  const t = state.t;

  const cols = Math.ceil(Math.sqrt(N));
  const rows = Math.ceil(N / cols);
  const cellW = (W - 80) / cols;
  const cellH = (H - 80) / rows;
  const startX = 40, startY = 40;

  // Amplitude distribution
  const amps = new Array(N).fill(1 / Math.sqrt(N));
  if (step >= 2) {
    // After oracle: target gets negative phase
    const iterations = Math.min(step - 1, params.iterations || 3);
    const theta = Math.asin(1 / Math.sqrt(N));
    const iters = Math.min(iterations, Math.round(Math.PI / (4 * theta)));
    for (let it = 0; it < iters; it++) {
      // Oracle
      amps[target] *= -1;
      // Diffusion
      const avg = amps.reduce((a, b) => a + b, 0) / N;
      for (let i = 0; i < N; i++) amps[i] = 2 * avg - amps[i];
    }
  }

  const maxAmp = Math.max(...amps.map(Math.abs));

  for (let i = 0; i < N; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * cellW;
    const y = startY + row * cellH;
    const w = cellW - 4, h = cellH - 4;

    const relAmp = Math.abs(amps[i]) / maxAmp;
    const isTarget = i === target;

    // Background
    const isHighlighted = step >= 2 && relAmp > 0.5;
    let bg, border;
    if (isTarget && step >= 2) {
      bg = `rgba(239,68,68,${0.1 + 0.5 * relAmp})`;
      border = 'rgba(239,68,68,0.8)';
    } else if (isHighlighted) {
      bg = `rgba(124,58,237,${0.05 + 0.4 * relAmp})`;
      border = `rgba(124,58,237,${0.3 + 0.5 * relAmp})`;
    } else {
      bg = 'rgba(255,255,255,0.03)';
      border = 'rgba(255,255,255,0.06)';
    }

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 4) : ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 4) : ctx.rect(x, y, w, h);
    ctx.stroke();

    // Amplitude bar
    const barH = Math.max(2, (h - 8) * relAmp);
    ctx.fillStyle = isTarget && step >= 2 ? 'rgba(239,68,68,0.7)' : 'rgba(124,58,237,0.5)';
    ctx.fillRect(x + 2, y + h - 6 - barH, w - 4, barH);

    // Index label
    ctx.fillStyle = isTarget && step >= 2 ? '#fca5a5' : 'rgba(255,255,255,0.3)';
    ctx.font = `${Math.max(9, cellW * 0.22)}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(i, x + w / 2, y + h / 2 + 4);
  }

  // Step label
  const lbs = ['Initializing search space...', 'Creating uniform superposition...', 'Oracle marks target state...', 'Amplitude amplification...', 'Measuring...', 'Target found!'];
  ctx.fillStyle = 'rgba(167,139,250,0.9)';
  ctx.font = '600 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(lbs[Math.min(step, lbs.length - 1)], W / 2, H - 12);
};

VLW.Sim.bloch = function(canvas, state, params) {
  // Bloch sphere 2D projection
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.36;
  const t = state.t;

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
  glow.addColorStop(0, 'rgba(124,58,237,0.06)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Sphere
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(124,58,237,0.04)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(124,58,237,0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Equator
  ctx.beginPath();
  ctx.ellipse(cx, cy, R, R * 0.2, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(100,120,200,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Latitude circles
  for (let l = 1; l < 4; l++) {
    const la = (l / 4) * Math.PI;
    const ry2 = Math.abs(Math.sin(la));
    const yO = Math.cos(la) * R;
    ctx.beginPath();
    ctx.ellipse(cx, cy + yO, R * ry2, R * ry2 * 0.15, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100,120,200,0.1)';
    ctx.stroke();
  }

  // Axes
  const axes = [
    { dx: 0, dy: -R * 1.12, label: '|0⟩', color: '#94a3b8' },
    { dx: 0, dy: R * 1.12, label: '|1⟩', color: '#94a3b8' },
    { dx: R * 1.12, dy: 0, label: 'X', color: '#475569' }
  ];
  axes.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + a.dx, cy + a.dy);
    ctx.strokeStyle = 'rgba(148,163,184,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = a.color;
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(a.label, cx + a.dx * 1.12, cy + a.dy * 1.12 + 4);
  });

  // State vector
  const theta = params.phase ? params.phase * Math.PI * 2 : (state.theta || Math.PI / 4);
  const phi = t * 0.8 + (params.statePhi || 0);
  const sx = cx + R * Math.sin(theta) * Math.cos(phi);
  const sy = cy - R * Math.cos(theta);

  // Trace
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const ft = i / 60;
    const fp = ft * phi;
    const fx = cx + R * Math.sin(theta) * Math.cos(fp);
    const fy = cy - R * Math.cos(theta) * (ft * 0.3 + 0.7);
    i === 0 ? ctx.moveTo(fx, fy) : ctx.lineTo(fx, fy);
  }
  ctx.strokeStyle = 'rgba(167,139,250,0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Vector
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(sx, sy);
  ctx.strokeStyle = 'rgba(103,232,249,0.9)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Arrow head
  const ang = Math.atan2(sy - cy, sx - cx);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx - 10 * Math.cos(ang - 0.4), sy - 10 * Math.sin(ang - 0.4));
  ctx.lineTo(sx - 10 * Math.cos(ang + 0.4), sy - 10 * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fillStyle = 'rgba(103,232,249,0.9)';
  ctx.fill();

  // State point
  ctx.beginPath();
  ctx.arc(sx, sy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#67e8f9';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx, sy, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(103,232,249,0.2)';
  ctx.fill();

  // Labels
  const p0 = Math.cos(theta / 2) ** 2;
  const p1 = Math.sin(theta / 2) ** 2;
  ctx.fillStyle = 'rgba(148,163,184,0.8)';
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`P(|0⟩) = ${(p0 * 100).toFixed(1)}%`, 16, H - 36);
  ctx.fillText(`P(|1⟩) = ${(p1 * 100).toFixed(1)}%`, 16, H - 18);
};

VLW.Sim.energy = function(canvas, state, params) {
  // Energy landscape for VQE
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const t = state.t;
  const step = state.step;

  // Draw energy landscape
  const plotX = 60, plotY = 30, plotW = W - 90, plotH = H - 80;

  // Axes
  ctx.strokeStyle = 'rgba(148,163,184,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(plotX, plotY); ctx.lineTo(plotX, plotY + plotH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(plotX, plotY + plotH); ctx.lineTo(plotX + plotW, plotY + plotH); ctx.stroke();

  // Axis labels
  ctx.fillStyle = 'rgba(148,163,184,0.6)';
  ctx.font = '11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Parameter θ', plotX + plotW / 2, H - 8);
  ctx.save(); ctx.translate(16, plotY + plotH / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText('Energy ⟨E⟩', 0, 0); ctx.restore();

  // Grid
  for (let i = 1; i < 5; i++) {
    const gx = plotX + (i / 5) * plotW;
    const gy = plotY + (i / 5) * plotH;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.moveTo(gx, plotY); ctx.lineTo(gx, plotY + plotH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(plotX, gy); ctx.lineTo(plotX + plotW, gy); ctx.stroke();
  }

  // Energy landscape (parameterized)
  const molecule = params.molecule || 'H₂';
  const E0 = molecule === 'H₂' ? -1.137 : -8.0;
  const Erange = Math.abs(E0) * 0.8;

  ctx.beginPath();
  for (let px = 0; px <= plotW; px++) {
    const theta = (px / plotW) * Math.PI * 2;
    const E = E0 + Erange * (0.5 + 0.5 * Math.cos(theta) + 0.15 * Math.cos(2 * theta + 0.3));
    const normE = (E - (E0 - Erange)) / (2 * Erange);
    const sy = plotY + plotH - normE * plotH;
    px === 0 ? ctx.moveTo(plotX + px, sy) : ctx.lineTo(plotX + px, sy);
  }
  ctx.strokeStyle = 'rgba(16,185,129,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Optimization path
  if (step >= 2) {
    const maxIter = params.iterations || 50;
    const curIter = Math.min(Math.floor(t * 15), maxIter);
    const thetaOpt = Math.PI + Math.PI * 0.1 * Math.exp(-curIter / 15) * Math.cos(curIter * 0.8);
    const EVal = E0 + Erange * (0.5 + 0.5 * Math.cos(thetaOpt) + 0.15 * Math.cos(2 * thetaOpt + 0.3));
    const normE = (EVal - (E0 - Erange)) / (2 * Erange);
    const optX = plotX + (thetaOpt / (Math.PI * 2)) * plotW;
    const optY = plotY + plotH - normE * plotH;

    // Optimization trajectory
    ctx.beginPath();
    for (let it = 0; it <= curIter; it++) {
      const thIt = Math.PI + Math.PI * 0.1 * Math.exp(-it / 15) * Math.cos(it * 0.8);
      const eIt = E0 + Erange * (0.5 + 0.5 * Math.cos(thIt) + 0.15 * Math.cos(2 * thIt + 0.3));
      const nIt = (eIt - (E0 - Erange)) / (2 * Erange);
      const px2 = plotX + (thIt / (Math.PI * 2)) * plotW;
      const py2 = plotY + plotH - nIt * plotH;
      it === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
    }
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Current point
    ctx.beginPath();
    ctx.arc(optX, optY, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(optX, optY, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245,158,11,0.2)';
    ctx.fill();

    // Current energy label
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = '600 12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`⟨E⟩ = ${EVal.toFixed(4)} Ha`, plotX + 8, plotY + 20);
    ctx.fillStyle = 'rgba(16,185,129,0.7)';
    ctx.fillText(`E₀ = ${E0.toFixed(4)} Ha`, plotX + 8, plotY + 36);
  }

  // Step label
  const lbs2 = ['Define Hamiltonian...', 'Initialize ansatz θ...', 'Measuring ⟨E⟩...', 'Optimizing parameters...', 'Converging...', 'Ground state found!'];
  ctx.fillStyle = 'rgba(167,139,250,0.9)';
  ctx.font = '600 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(lbs2[Math.min(step, lbs2.length - 1)], W / 2, H - 12);
};

VLW.Sim.shor = function(canvas, state, params) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const N = parseInt(params.N || 15);
  const a = parseInt(params.a || 2);
  const step = state.step;
  const t = state.t;

  // Compute f(x) = a^x mod N
  const maxX = Math.min(64, N * 2);
  const vals = [];
  for (let x = 0; x < maxX; x++) {
    let v = 1;
    for (let i = 0; i < x; i++) v = (v * a) % N;
    vals.push({ x, y: v });
  }

  const plotX = 50, plotY = 20, plotW = W - 70, plotH = H - 80;

  // Grid + axes
  ctx.strokeStyle = 'rgba(148,163,184,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(plotX, plotY); ctx.lineTo(plotX, plotY + plotH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(plotX, plotY + plotH); ctx.lineTo(plotX + plotW, plotY + plotH); ctx.stroke();

  ctx.fillStyle = 'rgba(148,163,184,0.5)';
  ctx.font = '11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`x (input register)`, plotX + plotW / 2, H - 8);

  // Draw bars
  const barW = Math.max(2, plotW / maxX - 1);
  vals.forEach((v, i) => {
    const bx = plotX + (i / maxX) * plotW;
    const by = plotY + plotH - (v.y / N) * plotH;
    const bh = (v.y / N) * plotH;

    const prog = step >= 2 ? Math.min(1, (t - i * 0.02) * 3) : (step >= 1 ? 0.3 : 0);

    ctx.fillStyle = step >= 4
      ? `rgba(103,232,249,${0.3 + 0.5 * prog})`
      : `rgba(124,58,237,${0.3 + 0.5 * prog})`;
    ctx.fillRect(bx, by, Math.max(1, barW), bh * prog);

    // Period markers
    if (step >= 3) {
      let period = 1;
      for (let r = 1; r <= N; r++) {
        let vr = 1;
        for (let ii = 0; ii < r; ii++) vr = (vr * a) % N;
        if (vr === 1) { period = r; break; }
      }
      if (i % period === 0 && i > 0) {
        ctx.strokeStyle = 'rgba(245,158,11,0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(bx, plotY);
        ctx.lineTo(bx, plotY + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(245,158,11,0.8)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`r`, bx, plotY + 14);
      }
    }
  });

  // Info panel
  if (step >= 5) {
    let period = 1;
    for (let r = 1; r <= N; r++) {
      let vr = 1;
      for (let ii = 0; ii < r; ii++) vr = (vr * a) % N;
      if (vr === 1) { period = r; break; }
    }
    const gcd1 = gcd(Math.pow(a, period / 2) + 1, N);
    const gcd2 = gcd(Math.pow(a, period / 2) - 1, N);
    ctx.fillStyle = 'rgba(103,232,249,0.9)';
    ctx.font = '600 13px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Period r = ${period}`, plotX + 8, plotY + 20);
    ctx.fillText(`${N} = ${gcd1} × ${gcd2}`, plotX + 8, plotY + 38);
  }

  const lbs3 = ['Choose N...', 'Preparing registers...', 'Quantum mod-exp...', 'Applying QFT...', 'Measuring period...', `Factoring ${N}...`];
  ctx.fillStyle = 'rgba(167,139,250,0.9)';
  ctx.font = '600 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(lbs3[Math.min(step, lbs3.length - 1)], W / 2, H - 12);
};

function gcd(a, b) {
  a = Math.abs(Math.floor(a));
  b = Math.abs(Math.floor(b));
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}

VLW.Sim.qft = function(canvas, state, params) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const n = parseInt(params.qubits || 3);
  const N = Math.pow(2, n);
  const step = state.step;
  const t = state.t;

  const plotX = 50, plotY = 20, plotW = W - 70, plotH = (H - 80) / 2 - 20;

  // Input state
  const inputAmps = new Array(N).fill(0);
  inputAmps[1] = 1; // |001⟩ as example
  if (params.inputState === 'Superposition') {
    for (let i = 0; i < N; i++) inputAmps[i] = 1 / Math.sqrt(N);
  } else if (params.inputState === 'Random') {
    let sum = 0;
    for (let i = 0; i < N; i++) { inputAmps[i] = Math.random(); sum += inputAmps[i] ** 2; }
    const norm = Math.sqrt(sum);
    for (let i = 0; i < N; i++) inputAmps[i] /= norm;
  }

  // Output (QFT) amplitudes
  const outputAmps = new Array(N).fill(0);
  const phase = step >= 3 ? Math.min(1, (t - 1) * 0.8) : 0;
  for (let k = 0; k < N; k++) {
    let re = 0;
    for (let x = 0; x < N; x++) re += inputAmps[x] * Math.cos(-2 * Math.PI * k * x / N);
    outputAmps[k] = Math.abs(re / Math.sqrt(N));
  }

  // Draw input spectrum
  const drawSpectrum = (amps, y0, label, color) => {
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(label, plotX, y0 - 4);

    const bw = (plotW / N) - 1;
    amps.forEach((amp, i) => {
      const bx = plotX + (i / N) * plotW;
      const bh = amp * plotH;
      ctx.fillStyle = color;
      ctx.fillRect(bx, y0 + plotH - bh, Math.max(1, bw), bh);

      if (N <= 8) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`|${i}⟩`, bx + bw / 2, y0 + plotH + 12);
      }
    });

    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(plotX, y0); ctx.lineTo(plotX + plotW, y0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(plotX, y0 + plotH); ctx.lineTo(plotX + plotW, y0 + plotH); ctx.stroke();
  };

  drawSpectrum(inputAmps, plotY, 'Time Domain |input⟩', 'rgba(124,58,237,0.6)');
  if (step >= 2) {
    const blendFactor = phase;
    const blended = outputAmps.map((v, i) => v * blendFactor + inputAmps[i] * (1 - blendFactor));
    drawSpectrum(blended, plotY + plotH + 40, 'Frequency Domain |QFT output⟩', `rgba(6,182,212,${0.3 + 0.5 * blendFactor})`);

    // Arrow
    ctx.fillStyle = 'rgba(167,139,250,0.6)';
    ctx.font = '600 20px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('↓ QFT', W / 2, plotY + plotH + 30);
  }

  const lbs4 = ['Set input state...', 'Applying H gate...', 'Phase rotations...', 'Bit-reversal swap...', 'Output state...', 'Measuring frequencies...'];
  ctx.fillStyle = 'rgba(167,139,250,0.9)';
  ctx.font = '600 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(lbs4[Math.min(step, lbs4.length - 1)], W / 2, H - 12);
};

VLW.Sim.qaoa = function(canvas, state, params) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const n = parseInt(params.nodes || 5);
  const step = state.step;
  const t = state.t;
  const gamma = parseFloat(params.gamma || 0.8);

  // Generate nodes on circle
  const nodes = [];
  for (let i = 0; i < n; i++) {
    const ang = (2 * Math.PI * i / n) - Math.PI / 2;
    nodes.push({
      x: W / 2 + (W * 0.3) * Math.cos(ang),
      y: H / 2 + (H * 0.35) * Math.sin(ang),
      state: 0
    });
  }

  // Generate edges (random but seeded by n)
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if ((i + j * 3 + n) % 3 !== 0) edges.push([i, j]);
    }
  }

  // Assign node states based on optimization progress
  if (step >= 4) {
    const optProgress = Math.min(1, (t - 2) * 0.5);
    nodes.forEach((nd, i) => {
      nd.state = Math.sin(i * 2.1 + gamma * 3 + optProgress * Math.PI) > 0 ? 1 : 0;
    });
  }

  // Count cut edges
  let cutCount = 0;
  edges.forEach(([i, j]) => {
    if (nodes[i].state !== nodes[j].state) cutCount++;
  });

  // Draw edges
  edges.forEach(([i, j]) => {
    const isCut = nodes[i].state !== nodes[j].state;
    ctx.beginPath();
    ctx.moveTo(nodes[i].x, nodes[i].y);
    ctx.lineTo(nodes[j].x, nodes[j].y);
    if (step >= 4 && isCut) {
      ctx.strokeStyle = 'rgba(245,158,11,0.7)';
      ctx.lineWidth = 2.5;
    } else {
      ctx.strokeStyle = 'rgba(100,120,200,0.25)';
      ctx.lineWidth = 1.5;
    }
    ctx.stroke();
  });

  // Draw nodes
  nodes.forEach((nd, i) => {
    const isActive = nd.state === 1;
    const color = step >= 4 ? (isActive ? '#7c3aed' : '#06b6d4') : '#475569';
    const glow = step >= 4 ? (isActive ? 'rgba(124,58,237,0.3)' : 'rgba(6,182,212,0.3)') : 'transparent';

    ctx.beginPath();
    ctx.arc(nd.x, nd.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(nd.x, nd.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = isActive ? 'rgba(167,139,250,0.7)' : 'rgba(103,232,249,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '600 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`q${i}`, nd.x, nd.y + 4);
  });

  // Cut count
  if (step >= 4) {
    ctx.fillStyle = 'rgba(245,158,11,0.9)';
    ctx.font = '600 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`Cut edges: ${cutCount} / ${edges.length}`, W / 2, H - 28);
  }

  const lbs5 = ['Build problem graph...', 'Encode cost Hamiltonian...', 'Apply QAOA layers...', 'Measuring state...', 'Optimizing β,γ...', 'Best cut found!'];
  ctx.fillStyle = 'rgba(167,139,250,0.9)';
  ctx.font = '600 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(lbs5[Math.min(step, lbs5.length - 1)], W / 2, H - 10);
};

VLW.Sim.generic = function(canvas, state, params, labId) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const t = state.t;
  const step = state.step;
  const cfg = VLW.configs[labId];

  // Generic quantum circuit visualization
  const n = 3;
  const gateCount = 6;
  const wireY = [H * 0.25, H * 0.45, H * 0.65];
  const gateX = new Array(gateCount).fill(0).map((_, i) => 80 + (i / (gateCount - 1)) * (W - 160));

  // Wires
  wireY.forEach((y, wi) => {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(W - 40, y);
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`|q${wi}⟩`, 36, y + 4);
  });

  // Animated signal travel
  if (step >= 1) {
    const progress = Math.min(1, (t - 0.3) * 0.4);
    wireY.forEach(y => {
      const gx = 40 + progress * (W - 80);
      const grad = ctx.createLinearGradient(gx - 40, y, gx, y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(103,232,249,0.6)');
      ctx.beginPath();
      ctx.moveTo(Math.max(40, gx - 40), y);
      ctx.lineTo(gx, y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
  }

  // Gates
  const gateLabels = ['H', 'Rz', '●', 'H', 'M', '✓'];
  gateX.forEach((gx, gi) => {
    const prog = Math.min(1, (t * 3 - gi * 0.5));
    if (prog <= 0) return;

    wireY.forEach((y, wi) => {
      const isControl = gi === 2 && wi === 0;
      const isCNOT = gi === 2 && wi === 1;

      if (isControl) {
        ctx.beginPath();
        ctx.arc(gx, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(103,232,249,${0.8 * prog})`;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(gx, y);
        ctx.lineTo(gx, wireY[1]);
        ctx.strokeStyle = `rgba(103,232,249,${0.5 * prog})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (isCNOT) {
        ctx.beginPath();
        ctx.arc(gx, y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(103,232,249,${0.7 * prog})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(gx - 10, y);
        ctx.lineTo(gx + 10, y);
        ctx.moveTo(gx, y - 10);
        ctx.lineTo(gx, y + 10);
        ctx.strokeStyle = `rgba(103,232,249,${0.7 * prog})`;
        ctx.stroke();
      } else if (gi !== 4 || wi === 0) {
        // Gate box
        const bw = 28, bh = 24;
        ctx.fillStyle = `rgba(124,58,237,${0.15 * prog})`;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(gx - bw / 2, y - bh / 2, bw, bh, 4) : ctx.rect(gx - bw / 2, y - bh / 2, bw, bh);
        ctx.fill();
        ctx.strokeStyle = `rgba(124,58,237,${0.5 * prog})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(gx - bw / 2, y - bh / 2, bw, bh, 4) : ctx.rect(gx - bw / 2, y - bh / 2, bw, bh);
        ctx.stroke();

        ctx.fillStyle = `rgba(167,139,250,${0.9 * prog})`;
        ctx.font = '600 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(gi === 4 ? 'M' : (gi === 5 ? '✓' : gateLabels[gi]), gx, y + 4);
      }
    });
  });

  // Step label
  const stepNames = cfg ? cfg.steps.map(s => s.desc) : [];
  const lb = stepNames[Math.min(step, stepNames.length - 1)] || 'Simulating...';
  ctx.fillStyle = 'rgba(167,139,250,0.9)';
  ctx.font = '600 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(lb, W / 2, H - 16);
};

// Teleportation visualization
VLW.Sim.teleportation = function(canvas, state, params) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const step = state.step;
  const t = state.t;

  const aliceX = W * 0.2, bobX = W * 0.8, midX = W * 0.5;
  const wireY = [H * 0.3, H * 0.5, H * 0.7];

  // Party labels
  [['Alice', aliceX], ['Bob', bobX]].forEach(([name, x]) => {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x - 40, 20, 80, 24, 6) : ctx.rect(x - 40, 20, 80, 24);
    ctx.fill();
    ctx.fillStyle = 'rgba(148,163,184,0.8)';
    ctx.font = '600 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, 36);
  });

  // Wires
  const wireLabels = ['|ψ⟩ (unknown)', 'EPR qubit A', 'EPR qubit B'];
  wireY.forEach((y, i) => {
    ctx.beginPath();
    ctx.moveTo(step >= 2 ? 50 : aliceX - 60, y);
    ctx.lineTo(i === 2 ? (step >= 2 ? bobX + 60 : midX) : aliceX + 60, y);
    ctx.strokeStyle = 'rgba(148,163,184,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (i === 2 && step >= 2) {
      ctx.beginPath();
      ctx.moveTo(midX, y);
      ctx.lineTo(bobX + 60, y);
      ctx.strokeStyle = 'rgba(103,232,249,0.15)';
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(148,163,184,0.4)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(wireLabels[i], 8, y - 6);
  });

  // EPR pair (entanglement bell)
  if (step >= 2) {
    ctx.beginPath();
    ctx.moveTo(midX, wireY[1]);
    ctx.lineTo(midX, wireY[2]);
    ctx.strokeStyle = 'rgba(103,232,249,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(103,232,249,0.2)';
    ctx.beginPath();
    ctx.arc(midX, (wireY[1] + wireY[2]) / 2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(103,232,249,0.9)';
    ctx.font = '600 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('EPR', midX, (wireY[1] + wireY[2]) / 2 + 4);
  }

  // State at Alice (ψ)
  const theta = parseFloat(params.stateTheta || 1.05);
  const phi = parseFloat(params.statePhi || 0.5);
  ctx.fillStyle = step >= 4 ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.8)';
  ctx.beginPath();
  ctx.arc(aliceX, wireY[0], 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 10px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('|ψ⟩', aliceX, wireY[0] + 4);

  // State transfer animation
  if (step >= 5) {
    const prog = Math.min(1, (t - 3) * 0.6);
    const px = aliceX + prog * (bobX - aliceX);
    const py = wireY[0] + Math.sin(prog * Math.PI) * (-40);

    ctx.fillStyle = `rgba(103,232,249,${0.8 * prog})`;
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fill();

    // Trail
    for (let i = 0; i < 8; i++) {
      const tp = Math.max(0, prog - i * 0.05);
      const tx = aliceX + tp * (bobX - aliceX);
      const ty = wireY[0] + Math.sin(tp * Math.PI) * (-40);
      ctx.beginPath();
      ctx.arc(tx, ty, 4 - i * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(103,232,249,${0.1 * (8 - i) * prog})`;
      ctx.fill();
    }

    if (prog > 0.9) {
      ctx.fillStyle = 'rgba(103,232,249,0.9)';
      ctx.font = '600 10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('|ψ⟩', bobX, wireY[0] + 4);

      // Checkmark
      ctx.fillStyle = 'rgba(16,185,129,0.9)';
      ctx.font = 'bold 20px Inter';
      ctx.fillText('✓', bobX, wireY[0] - 20);
    }
  }

  const lbs6 = ["Alice prepares |ψ⟩...", "Creating EPR pair...", "Bell measurement...", "Sending 2 classical bits...", "Bob applies correction...", "Teleportation complete!"];
  ctx.fillStyle = 'rgba(167,139,250,0.9)';
  ctx.font = '600 13px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(lbs6[Math.min(step, lbs6.length - 1)], W / 2, H - 12);
};

/* ============================================================
   WORKSPACE CONTROLLER
   ============================================================ */
VLW.Workspace = (function() {
  let labId = '';
  let cfg = null;
  let state = { step: 0, t: 0, running: false, timer: null, points: [], theta: Math.PI / 4 };
  let params = {};
  let canvas = null;
  let ctx = null;
  let animId = null;

  function init(id) {
    labId = id;
    cfg = VLW.configs[id];
    if (!cfg) { console.warn('VLW: unknown lab:', id); return; }

    // Init params from controls
    params = {};
    if (cfg.controls) {
      cfg.controls.forEach(c => {
        params[c.id] = c.default;
      });
    }

    // Generate QSVM points
    if (id === 'qsvm') {
      state.points = generateQSVMPoints(params);
    }

    renderNav();
    renderTopBar();
    renderSidebar();
    renderControls();
    renderTimeline();
    setupCanvas();
    hideLoader();

    // Start rendering
    startLoop();
  }

  function generateQSVMPoints(p) {
    const n = parseInt(p.numPoints || 16);
    const noise = parseFloat(p.noise || 0.05);
    const pts = [];
    const dsType = (p.dataset || 'circles').toLowerCase();

    if (dsType === 'concentric circles' || dsType === 'circles') {
      for (let i = 0; i < n / 2; i++) {
        const a = (2 * Math.PI * i) / (n / 2);
        const r = 0.35 + noise * (Math.random() - 0.5);
        pts.push({ x: r * Math.cos(a), y: r * Math.sin(a), label: 1, isSV: i % 3 === 0 });
      }
      for (let i = 0; i < n / 2; i++) {
        const a = (2 * Math.PI * i) / (n / 2) + 0.3;
        const r = 0.78 + noise * (Math.random() - 0.5);
        pts.push({ x: r * Math.cos(a), y: r * Math.sin(a), label: -1, isSV: i % 4 === 0 });
      }
    } else if (dsType === 'linear') {
      for (let i = 0; i < n / 2; i++) {
        pts.push({ x: -0.7 + (i / (n / 2)) * 0.5 + noise * (Math.random() - 0.5), y: 0.3 + noise * (Math.random() - 0.5), label: 1, isSV: i === 0 });
      }
      for (let i = 0; i < n / 2; i++) {
        pts.push({ x: 0.2 + (i / (n / 2)) * 0.5 + noise * (Math.random() - 0.5), y: -0.3 + noise * (Math.random() - 0.5), label: -1, isSV: i === 0 });
      }
    } else {
      // Moons
      for (let i = 0; i < n / 2; i++) {
        const a = Math.PI * i / (n / 2);
        pts.push({ x: Math.cos(a) * 0.6 + noise * (Math.random() - 0.5), y: Math.sin(a) * 0.4 + noise * (Math.random() - 0.5), label: 1, isSV: i % 4 === 0 });
      }
      for (let i = 0; i < n / 2; i++) {
        const a = Math.PI + Math.PI * i / (n / 2);
        pts.push({ x: Math.cos(a) * 0.6 + 0.3 + noise * (Math.random() - 0.5), y: Math.sin(a) * 0.4 - 0.2 + noise * (Math.random() - 0.5), label: -1, isSV: i % 4 === 0 });
      }
    }
    return pts;
  }

  function setupCanvas() {
    canvas = document.getElementById('vlw-canvas');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    function resize() {
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    ctx = canvas.getContext('2d');
  }

  function startLoop() {
    let last = performance.now();
    function loop(now) {
      const dt = (now - last) / 1000;
      last = now;
      if (state.running) state.t += dt;
      render();
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
  }

  function render() {
    if (!canvas || !ctx) return;
    const renderer = getRenderer(labId);
    try {
      renderer(canvas, state, params);
    } catch(e) { /* noop */ }
    updateStateDisplay();
  }

  function getRenderer(id) {
    const map = {
      qsvm: VLW.Sim.qsvm,
      'shor-factorization': VLW.Sim.shor,
      qft: VLW.Sim.qft,
      qpe: (c, s, p) => VLW.Sim.bloch(c, s, p),
      vqe: VLW.Sim.energy,
      qaoa: VLW.Sim.qaoa,
      grover: VLW.Sim.grover,
      'quantum-teleportation': VLW.Sim.teleportation,
      qnn: (c, s, p) => VLW.Sim.generic(c, s, p, 'qnn'),
      qka: (c, s, p) => VLW.Sim.generic(c, s, p, 'qka'),
      qpca: (c, s, p) => VLW.Sim.generic(c, s, p, 'qpca'),
      hhl: (c, s, p) => VLW.Sim.generic(c, s, p, 'hhl'),
      'deutsch-jozsa': (c, s, p) => VLW.Sim.generic(c, s, p, 'deutsch-jozsa'),
      'bernstein-vazirani': (c, s, p) => VLW.Sim.generic(c, s, p, 'bernstein-vazirani'),
      qae: (c, s, p) => VLW.Sim.bloch(c, s, p)
    };
    return map[id] || ((c, s, p) => VLW.Sim.generic(c, s, p, id));
  }

  function updateStateDisplay() {
    // Update quantum state panel
    const stepEl = document.getElementById('vlw-current-step-name');
    const descEl = document.getElementById('vlw-current-step-desc');
    const numEl = document.getElementById('vlw-step-number');

    if (cfg && cfg.steps) {
      const s = cfg.steps[Math.min(state.step, cfg.steps.length - 1)];
      if (stepEl) stepEl.textContent = s.label;
      if (descEl) descEl.textContent = s.desc;
      if (numEl) numEl.textContent = `STEP ${String(state.step + 1).padStart(2, '0')}`;
    }

    // Update timeline dots
    document.querySelectorAll('.vlw-tl-step').forEach((el, i) => {
      el.classList.toggle('active', i === state.step);
      el.classList.toggle('done', i < state.step);
    });

    // Update sidebar steps
    document.querySelectorAll('.vlw-workflow-step').forEach((el, i) => {
      el.classList.toggle('active', i === state.step);
      el.classList.toggle('done', i < state.step);
    });

    // Update time display
    const timeEl = document.getElementById('vlw-time-display');
    if (timeEl) {
      const s = Math.floor(state.t);
      const m = Math.floor(s / 60);
      timeEl.textContent = `${m}:${String(s % 60).padStart(2, '0')}`;
    }

    // Update results
    updateResults();
  }

  function updateResults() {
    const obsEl = document.getElementById('vlw-observation-text');
    if (obsEl && cfg) {
      obsEl.textContent = cfg.observation;
    }

    // Per-lab result values
    if (labId === 'qsvm') {
      const dsType = (params.dataset || 'circles').toLowerCase();
      const isCircles = dsType === 'concentric circles' || dsType === 'circles';
      setResultVal('vlw-res-classical', isCircles ? '56.2%' : '93.8%', isCircles ? 'danger' : 'success');
      setResultVal('vlw-res-quantum', '100.0%', 'success');
      setResultVal('vlw-res-sv', `${isCircles ? 8 : 4}`, '');
      setResultVal('vlw-res-dim', '2ⁿ = 4', '');
    } else if (labId === 'grover') {
      const N = parseInt(params.searchSize || 16);
      const iters = Math.floor(Math.PI / 4 * Math.sqrt(N));
      setResultVal('vlw-res-speedup', `√${N} = ${Math.sqrt(N).toFixed(1)}×`, 'success');
      setResultVal('vlw-res-iters', String(iters), '');
    } else if (labId === 'vqe') {
      const mol = params.molecule || 'H₂';
      const E0 = mol === 'H₂' ? '-1.1373 Ha' : '-8.0714 Ha';
      setResultVal('vlw-res-energy', E0, 'success');
    } else if (labId === 'shors' || labId === 'shor-factorization') {
      const N2 = parseInt(params.N || 15);
      const a2 = parseInt(params.a || 2);
      let period = 1;
      for (let r = 1; r <= N2; r++) {
        let v = 1;
        for (let i = 0; i < r; i++) v = (v * a2) % N2;
        if (v === 1) { period = r; break; }
      }
      const f1 = gcd(Math.pow(a2, period / 2) + 1, N2);
      const f2 = gcd(Math.pow(a2, period / 2) - 1, N2);
      setResultVal('vlw-res-period', String(period), '');
      setResultVal('vlw-res-factors', `${f1} × ${f2}`, 'success');
    } else if (labId === 'qpe') {
      const phase = parseFloat(params.phase || 0.25);
      const precision = parseInt(params.precision || 3);
      const estimated = Math.round(phase * Math.pow(2, precision)) / Math.pow(2, precision);
      setResultVal('vlw-res-phase', phase.toFixed(4), '');
      setResultVal('vlw-res-estimated', estimated.toFixed(4), 'success');
    }
  }

  function setResultVal(id, val, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.className = 'vlw-result-value' + (cls ? ' ' + cls : '');
  }

  function renderNav() {
    const el = document.getElementById('vlw-topnav');
    if (!el || !cfg) return;
    el.innerHTML = `
      <a href="../virtual-labs.html" class="vlw-topnav__back">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Virtual Labs
      </a>
      <div class="vlw-topnav__breadcrumb">
        <a href="../index.html">QuantumLab</a>
        <span class="sep">›</span>
        <a href="../virtual-labs.html">Virtual Labs</a>
        <span class="sep">›</span>
        <span class="current">${cfg.shortTitle}</span>
      </div>
      <div class="vlw-topnav__title-group">
        <div class="vlw-topnav__cat-badge">${cfg.category}</div>
        <div class="vlw-topnav__lab-title">${cfg.shortTitle} — ${cfg.title}</div>
      </div>
      <div class="vlw-topnav__center">
        <div class="vlw-status-pill">
          <div class="vlw-status-pulse"></div>
          Virtual Lab Ready
        </div>
      </div>
      <div class="vlw-topnav__actions">
        <button class="vlw-nav-btn" onclick="VLW.Workspace.reset()">↺ Reset</button>
        <button class="vlw-nav-btn vlw-nav-btn--primary" onclick="VLW.Workspace.run()">▶ Run Experiment</button>
      </div>
    `;
  }

  function renderTopBar() {
    const el = document.getElementById('vlw-step-bar');
    if (!el || !cfg || !cfg.steps) return;
    const s = cfg.steps[0];
    el.innerHTML = `
      <div class="vlw-step-badge" id="vlw-step-number">STEP 01</div>
      <div class="vlw-step-name" id="vlw-current-step-name">${s.label}</div>
      <span style="color:var(--vlw-border)">·</span>
      <div class="vlw-step-desc" id="vlw-current-step-desc">${s.desc}</div>
    `;
  }

  function renderSidebar() {
    const el = document.getElementById('vlw-sidebar-content');
    if (!el || !cfg) return;

    const stepsHtml = (cfg.steps || []).map((s, i) => `
      <button class="vlw-workflow-step${i === 0 ? ' active' : ''}" onclick="VLW.Workspace.goStep(${i})">
        <div class="vlw-step-icon">${s.icon}</div>
        <div class="vlw-step-label">
          <div>${s.label}</div>
          <div class="vlw-step-sublabel">${s.desc.substring(0, 32)}...</div>
        </div>
        <span class="vlw-step-check">✓</span>
      </button>
    `).join('');

    el.innerHTML = `
      <div class="vlw-sidebar__header">
        <div class="vlw-sidebar__tag">Experiment Workflow</div>
        <div class="vlw-sidebar__exp-title">${cfg.title}</div>
      </div>
      <div class="vlw-workflow-nav">${stepsHtml}</div>
      <div class="vlw-sidebar__footer">
        <div class="vlw-sidebar__info-row"><span>Category</span><span>${cfg.category}</span></div>
        <div class="vlw-sidebar__info-row"><span>Difficulty</span><span>${cfg.difficulty}</span></div>
        <div class="vlw-sidebar__info-row"><span>Est. Time</span><span>${cfg.time}</span></div>
      </div>
    `;
  }

  function renderControls() {
    const el = document.getElementById('vlw-controls-content');
    if (!el || !cfg) return;

    // Run controls
    let html = `
      <div class="vlw-controls__section">
        <div class="vlw-controls__title">Experiment Control</div>
        <div class="vlw-run-controls">
          <button class="vlw-run-btn vlw-run-btn--primary" id="vlw-run-btn" onclick="VLW.Workspace.run()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Run Experiment
          </button>
          <div class="vlw-btn-row">
            <button class="vlw-run-btn vlw-run-btn--secondary vlw-run-btn--sm" onclick="VLW.Workspace.stepForward()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 19 22 12 13 5 13 19"/><line x1="2" y1="5" x2="2" y2="19"/></svg>
              Step →
            </button>
            <button class="vlw-run-btn vlw-run-btn--secondary vlw-run-btn--sm" onclick="VLW.Workspace.reset()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
              Reset
            </button>
          </div>
        </div>
      </div>
    `;

    // Parameters
    if (cfg.controls && cfg.controls.length > 0) {
      const paramItems = cfg.controls.map(c => {
        if (c.type === 'range') {
          return `
            <div class="vlw-param-item">
              <div class="vlw-param-label">
                <span>${c.label}</span>
                <span class="vlw-param-val" id="val-${c.id}">${c.default}</span>
              </div>
              <input type="range" class="vlw-slider" id="ctrl-${c.id}"
                min="${c.min}" max="${c.max}" step="${c.step}" value="${c.default}"
                oninput="VLW.Workspace.updateParam('${c.id}', this.value)">
            </div>
          `;
        } else if (c.type === 'select') {
          const opts = c.options.map(o => `<option value="${o}"${o === c.default ? ' selected' : ''}>${o}</option>`).join('');
          return `
            <div class="vlw-param-item">
              <div class="vlw-param-label"><span>${c.label}</span></div>
              <select class="vlw-select" id="ctrl-${c.id}" onchange="VLW.Workspace.updateParam('${c.id}', this.value)">
                ${opts}
              </select>
            </div>
          `;
        }
        return '';
      }).join('');

      html += `
        <div class="vlw-controls__section">
          <div class="vlw-controls__title">Simulation Parameters</div>
          <div class="vlw-param-group">${paramItems}</div>
        </div>
      `;
    }

    // Quantum state display
    html += `
      <div class="vlw-controls__section">
        <div class="vlw-controls__title">Quantum State</div>
        <div class="vlw-qstate-card">
          <div class="vlw-qstate-title">Current Experiment State</div>
          ${getResultsHtml(labId)}
        </div>
      </div>
    `;

    // Observation
    html += `
      <div class="vlw-controls__section">
        <div class="vlw-controls__title">Observation</div>
        <div class="vlw-observation">
          <div class="vlw-observation__title">🔬 Scientific Observation</div>
          <div class="vlw-observation__text" id="vlw-observation-text">${cfg.observation}</div>
        </div>
      </div>
    `;

    el.innerHTML = html;
  }

  function getResultsHtml(id) {
    const map = {
      qsvm: `
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Classical SVM Acc.</span><span class="vlw-qstate-val danger" id="vlw-res-classical">—</span></div>
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">QSVM Accuracy</span><span class="vlw-qstate-val good" id="vlw-res-quantum">—</span></div>
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Support Vectors</span><span class="vlw-qstate-val" id="vlw-res-sv">—</span></div>
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Feature Dim.</span><span class="vlw-qstate-val" id="vlw-res-dim">—</span></div>
      `,
      grover: `
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Speedup Factor</span><span class="vlw-qstate-val good" id="vlw-res-speedup">—</span></div>
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Optimal Iterations</span><span class="vlw-qstate-val" id="vlw-res-iters">—</span></div>
      `,
      vqe: `
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Ground State Energy</span><span class="vlw-qstate-val good" id="vlw-res-energy">—</span></div>
      `,
      qpe: `
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">True Phase</span><span class="vlw-qstate-val" id="vlw-res-phase">—</span></div>
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Estimated Phase</span><span class="vlw-qstate-val good" id="vlw-res-estimated">—</span></div>
      `
    };
    if (id === 'shor-factorization') {
      return `
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Period r</span><span class="vlw-qstate-val" id="vlw-res-period">—</span></div>
        <div class="vlw-qstate-row"><span class="vlw-qstate-key">Factorization</span><span class="vlw-qstate-val good" id="vlw-res-factors">—</span></div>
      `;
    }
    return map[id] || `<div class="vlw-qstate-row"><span class="vlw-qstate-key">Status</span><span class="vlw-qstate-val" id="vlw-res-status">Simulation ready</span></div>`;
  }

  function renderTimeline() {
    const el = document.getElementById('vlw-timeline-steps');
    if (!el || !cfg || !cfg.steps) return;

    el.innerHTML = cfg.steps.map((s, i) => `
      <div class="vlw-tl-step${i === 0 ? ' active' : ''}" onclick="VLW.Workspace.goStep(${i})" title="${s.desc}">
        <div class="vlw-tl-dot">${i < state.step ? '✓' : ''}</div>
        <div class="vlw-tl-label">${s.label}</div>
      </div>
    `).join('');
  }

  function hideLoader() {
    const loader = document.getElementById('vlw-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 600);
    }
  }

  // Public API
  function run() {
    if (state.running) {
      // Pause
      state.running = false;
      const btn = document.getElementById('vlw-run-btn');
      if (btn) btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Experiment`;
      return;
    }

    state.running = true;
    const btn = document.getElementById('vlw-run-btn');
    if (btn) btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;

    // Auto-advance steps
    autoAdvance();
  }

  function autoAdvance() {
    if (!state.running) return;
    const maxSteps = cfg ? cfg.steps.length : 6;
    if (state.step >= maxSteps - 1) {
      state.running = false;
      showComplete();
      return;
    }
    setTimeout(() => {
      if (!state.running) return;
      state.step++;
      renderTimeline();
      if (state.running) autoAdvance();
    }, 2200);
  }

  function stepForward() {
    const maxSteps = cfg ? cfg.steps.length : 6;
    if (state.step < maxSteps - 1) {
      state.step++;
    } else {
      showComplete();
    }
  }

  function goStep(i) {
    state.step = i;
  }

  function reset() {
    state.step = 0;
    state.t = 0;
    state.running = false;
    const btn = document.getElementById('vlw-run-btn');
    if (btn) btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Experiment`;
    const overlay = document.getElementById('vlw-complete-overlay');
    if (overlay) overlay.classList.remove('visible');
    if (labId === 'qsvm') state.points = generateQSVMPoints(params);
  }

  function updateParam(id, value) {
    params[id] = isNaN(value) ? value : parseFloat(value);
    const valEl = document.getElementById(`val-${id}`);
    if (valEl) {
      const ctrl = cfg.controls.find(c => c.id === id);
      if (ctrl && ctrl.type === 'range') {
        valEl.textContent = parseFloat(value).toFixed(
          String(ctrl.step).includes('.') ? String(ctrl.step).split('.')[1].length : 0
        );
      }
    }
    if (id === 'dataset' || id === 'numPoints' || id === 'noise') {
      if (labId === 'qsvm') state.points = generateQSVMPoints(params);
    }
  }

  function showComplete() {
    const overlay = document.getElementById('vlw-complete-overlay');
    if (overlay) overlay.classList.add('visible');
  }

  return { init, run, reset, stepForward, goStep, updateParam, showComplete };
})();
