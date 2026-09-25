/* ============================================================
   QUANTUMLAB – QUANTUM ALGORITHMS DATA REPOSITORY
   Complete scientific data for all 12 Quantum Algorithms
   Categories: Fundamentals, Optimization, QML, Simulation
   ============================================================ */

window.QL = window.QL || {};

QL.algorithmCategories = [
  { id: 'all', name: 'All Algorithms', count: 12 },
  { id: 'fundamentals', name: 'Quantum Fundamentals', count: 4, icon: '⚛️' },
  { id: 'optimization', name: 'Quantum Optimization', count: 2, icon: '⚡' },
  { id: 'qml', name: 'Quantum Machine Learning', count: 4, icon: '🧠' },
  { id: 'simulation', name: 'Quantum Simulation', count: 2, icon: '🔬' }
];

QL.algorithmsList = [
  /* ------------------------------------------------------------
     1. QUANTUM FUNDAMENTALS
     ------------------------------------------------------------ */
  {
    id: 'deutsch-jozsa',
    number: '01',
    name: 'Deutsch–Jozsa Algorithm',
    category: 'Quantum Fundamentals',
    categoryId: 'fundamentals',
    desc: 'Determine whether an unknown black-box Boolean function is constant or balanced in a single quantum evaluation using quantum interference.',
    concepts: ['Superposition', 'Oracle', 'Phase Kickback', 'Interference'],
    difficulty: 'Intermediate',
    color: '#7c3aed',
    accentColor: '#a78bfa',
    qubits: 3,
    circuit: [
      'q0 ──[H]────[     ]────[H]────[M]',
      'q1 ──[H]────[ Uf  ]────[H]────[M]',
      'anc ─[X]─[H]─[     ]─────────────'
    ],
    steps: [
      { name: 'Register Initialization', desc: 'Initialize input register to |00⟩ and ancilla qubit to |1⟩.' },
      { name: 'Hadamard Superposition', desc: 'Apply Hadamard gates across all qubits to create an equal superposition: |+⟩^(⊗2) ⊗ |-⟩.' },
      { name: 'Black-Box Oracle (Uf)', desc: 'Evaluate oracle. Phase kickback encodes f(x) into quantum amplitudes: (-1)^f(x)|x⟩.' },
      { name: 'Interference via Hadamards', desc: 'Apply final Hadamard transformation to recombine probability amplitudes constructively or destructively.' },
      { name: 'Measurement & Decision', desc: 'Measure the input register. Outcome |00⟩ indicates a Constant function; non-zero indicates Balanced.' }
    ],
    aim: 'To verify the exponential quantum speedup of the Deutsch-Jozsa algorithm over deterministic classical algorithms by evaluating black-box functions in exactly 1 query.',
    theory: 'The Deutsch-Jozsa problem considers a Boolean function f: {0,1}^n → {0,1} promised to be either constant (f(x) has the same value for all x) or balanced (f(x) = 0 for exactly half the inputs, and 1 for the other half). Classically, in the worst case, one must evaluate 2^(n-1) + 1 inputs to decide with certainty. Quantumly, using an ancilla prepared in state |-⟩ = (|0⟩ - |1⟩)/√2, applying the unitary U_f: |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩ produces phase kickback: U_f |x⟩|-⟩ = (-1)^f(x) |x⟩|-⟩. Applying H^(⊗n) transforms the state into ∑_x [∑_y (-1)^(x·y + f(y))] |x⟩. For a constant function, the amplitude for |0...0⟩ is ±1, whereas for any balanced function, orthogonal cancellation yields an amplitude of identically 0.',
    complexity: {
      classicalQuery: 'O(2^(n-1) + 1)',
      quantumQuery: 'O(1) (Exact)',
      classicalTime: 'O(2^n)',
      quantumTime: 'O(n) gate depth',
      advantage: 'Exponential reduction in query complexity'
    },
    takeaways: [
      'Demonstrates that quantum computers can solve global property problems in O(1) queries using destructive interference.',
      'Introduces the foundational phase kickback mechanism utilized in Grover and Shor algorithms.',
      'Deterministic speedup: no probabilistic sampling error in the ideal model.'
    ],
    references: [
      'D. Deutsch and R. Jozsa, "Rapid solution of problems by quantum computation", Proc. R. Soc. Lond. A 439, 553–558 (1992).',
      'M. A. Nielsen & I. L. Chuang, Quantum Computation and Quantum Information, Cambridge University Press (2010).'
    ]
  },

  {
    id: 'bernstein-vazirani',
    number: '02',
    name: 'Bernstein–Vazirani Algorithm',
    category: 'Quantum Fundamentals',
    categoryId: 'fundamentals',
    desc: 'Find a hidden n-bit binary string s encoded in an inner-product oracle f(x) = s · x (mod 2) in exactly one quantum query instead of n classical queries.',
    concepts: ['Hidden String', 'Inner Product Oracle', 'Phase Kickback', 'Direct Readout'],
    difficulty: 'Intermediate',
    color: '#06b6d4',
    accentColor: '#67e8f9',
    qubits: 4,
    circuit: [
      'q0 ──[H]────[      ]────[H]────[M]',
      'q1 ──[H]────[      ]────[H]────[M]',
      'q2 ──[H]────[ U_s  ]────[H]────[M]',
      'anc ─[X]─[H]─[      ]─────────────'
    ],
    steps: [
      { name: 'Initialize Register & Ancilla', desc: 'Input register set to |000⟩; ancilla qubit initialized to |1⟩.' },
      { name: 'Equal Superposition', desc: 'Hadamard gates applied to all qubits to prepare 1/√8 ∑ |x⟩ ⊗ |-⟩.' },
      { name: 'Inner-Product Oracle Us', desc: 'Oracle introduces phase (-1)^(s · x) via phase kickback to each computational basis state.' },
      { name: 'Hadamard Fourier Inversion', desc: 'H^(⊗n) maps state ∑_x (-1)^(s · x)|x⟩ directly into the single basis eigenstate |s⟩.' },
      { name: 'Deterministic Readout', desc: 'Measurement reveals the hidden string s with 100% theoretical probability.' }
    ],
    aim: 'To demonstrate exact string reconstruction using a single quantum query, contrasting with the n queries required by classical deterministic or randomized algorithms.',
    theory: 'Let f: {0,1}^n → {0,1} be defined as f(x) = s · x = (s_1 x_1 ⊕ s_2 x_2 ⊕ ... ⊕ s_n x_n) mod 2, where s is an unknown hidden bitstring. To learn s classically, one must query the oracle with unit vectors e_i = 0...010...0 to extract each bit s_i individually, requiring exactly n queries. The Bernstein-Vazirani quantum algorithm utilizes phase kickback with an ancilla in |-⟩: |x⟩|-⟩ → (-1)^(s · x) |x⟩|-⟩. The input state after the oracle is 2^(-n/2) ∑_x (-1)^(s · x) |x⟩. Applying H^(⊗n) transforms this state because H^(⊗n) |x⟩ = 2^(-n/2) ∑_y (-1)^(x · y) |y⟩. By linearity and orthogonality, H^(⊗n) [ 2^(-n/2) ∑_x (-1)^(s · x) |x⟩ ] = |s⟩. A single measurement in the computational basis yields s directly.',
    complexity: {
      classicalQuery: 'O(n) queries',
      quantumQuery: 'O(1) query',
      classicalTime: 'O(n)',
      quantumTime: 'O(n) gate depth',
      advantage: 'Linear to constant query speedup'
    },
    takeaways: [
      'Extracts an entire n-bit string in a single quantum query.',
      'Demonstrates the power of quantum parallelism combined with constructive interference.',
      'Foundational step towards Grover search and quantum period finding.'
    ],
    references: [
      'E. Bernstein and U. Vazirani, "Quantum complexity theory", SIAM Journal on Computing 26, 1411–1473 (1997).'
    ]
  },

  {
    id: 'grover',
    number: '03',
    name: "Grover's Search Algorithm",
    category: 'Quantum Fundamentals',
    categoryId: 'fundamentals',
    desc: 'Locate a marked target item within an unstructured database of N items in O(√N) queries, providing a quadratic speedup over classical brute-force search.',
    concepts: ['Unstructured Search', 'Amplitude Amplification', 'Oracle Inversion', 'Diffusion Operator'],
    difficulty: 'Intermediate',
    color: '#059669',
    accentColor: '#34d399',
    qubits: 3,
    circuit: [
      'q0 ──[H]────[ Oracle ]────[ Diffusion ]────[M]',
      'q1 ──[H]────[   Rw   ]────[    2|s⟩⟨s|-I ]────[M]',
      'q2 ──[H]────[        ]────[             ]────[M]'
    ],
    steps: [
      { name: 'Uniform Superposition', desc: 'Initialize register |0⟩^(⊗n) and apply H^(⊗n) to create uniform state |s⟩ = 1/√N ∑ |x⟩.' },
      { name: 'Phase Inversion (Oracle)', desc: 'Mark the target state |w⟩ by flipping its phase: R_w = I - 2|w⟩⟨w|.' },
      { name: 'Grover Diffusion Operator', desc: 'Invert all amplitudes about their mean: D = 2|s⟩⟨s| - I.' },
      { name: 'Amplitude Amplification Loop', desc: 'Repeat Oracle + Diffusion for R ≈ π/4 √N iterations to amplify target amplitude near unity.' },
      { name: 'Measurement', desc: 'Measure the register. The marked item is observed with probability close to 100%.' }
    ],
    aim: 'To simulate Grover amplitude amplification, observe constructive amplitude growth of marked states, and quantify the quadratic speedup over O(N) classical search.',
    theory: 'Searching an unsorted database of N = 2^n elements classically requires N/2 queries on average and N queries in the worst case. Grover showed that quantum mechanics enables searching in O(√N) steps. The algorithm operates in a 2D plane spanned by the marked state |w⟩ and the uniform superposition of unmarked states |s\'⟩ = (1/√(N-1)) ∑_{x ≠ w} |x⟩. The initial state |s⟩ forms an angle θ/2 with |s\'⟩, where sin(θ/2) = 1/√N. Each Grover iteration G = D · R_w rotates the state vector towards |w⟩ by angle θ. After k ≈ (π/4)√N iterations, the state vector aligns with |w⟩ with probability P(w) = sin^2((2k+1)θ/2) ≈ 1.',
    complexity: {
      classicalQuery: 'O(N) (Average N/2)',
      quantumQuery: 'O(√N) queries',
      classicalTime: 'O(N)',
      quantumTime: 'O(√N log N)',
      advantage: 'Quadratic speedup (provably optimal)'
    },
    takeaways: [
      'Provably optimal quadratic acceleration for unsorted search and NP-complete heuristic verification.',
      'Amplitude amplification is a universal subroutine utilized across optimization and quantum counting.',
      'Over-rotating beyond optimal iterations causes probability to oscillate back down.'
    ],
    references: [
      'L. K. Grover, "A fast quantum mechanical algorithm for database search", Proc. 28th Annual ACM STOC, 212–219 (1996).'
    ]
  },

  {
    id: 'qft',
    number: '04',
    name: 'Quantum Fourier Transform (QFT)',
    category: 'Quantum Fundamentals',
    categoryId: 'fundamentals',
    desc: 'The quantum analogue of the Discrete Fourier Transform that maps computational basis states into phase-frequency space in O(n²) operations instead of O(n 2ⁿ).',
    concepts: ['Discrete Fourier Transform', 'Phase Encoding', 'Controlled Phase Rotations', 'Frequency Analysis'],
    difficulty: 'Advanced',
    color: '#a78bfa',
    accentColor: '#c4b5fd',
    qubits: 3,
    circuit: [
      'q0 ──[H]──[R2]──[R3]──────────────────────[X]──',
      'q1 ────────[H]──[R2]───────────────────────|───',
      'q2 ──────────────[H]──[SWAP]───────────────[X]──'
    ],
    steps: [
      { name: 'State Preparation', desc: 'Initialize input register |j⟩ representing computational integer state.' },
      { name: 'First Qubit Hadamard & Rotations', desc: 'Apply H to q0 followed by controlled-phase rotations R2(π/2) and R3(π/4).' },
      { name: 'Subsequent Qubit Transformations', desc: 'Apply H to q1 followed by R2 with q2 as control; apply H to q2.' },
      { name: 'Bit-Reversal SWAP Stage', desc: 'Swap symmetric qubit pairs to restore standard computational bit-order.' },
      { name: 'Phase Frequency Representation', desc: 'Qubit states encode complex Fourier phases across the 2^n frequency components.' }
    ],
    aim: 'To construct the Quantum Fourier Transform circuit, observe phase frequency transitions, and analyze the exponential O(n²) vs O(n 2^n) efficiency.',
    theory: 'The Discrete Fourier Transform acts on a vector (x_0, ..., x_{N-1}) producing (y_0, ..., y_{N-1}) with y_k = (1/√N) ∑_j x_j e^(2πi j k / N). The Quantum Fourier Transform performs this transformation directly on state amplitudes: |j⟩ ↦ (1/√N) ∑_{k=0}^{N-1} e^(2πi j k / N) |k⟩. Crucially, the output state factors into an unentangled product state: (1/2^(n/2)) ⊗_{l=1}^n (|0⟩ + e^(2πi j 2^(-l)) |1⟩). This product structure allows QFT to be implemented using only n Hadamard gates and n(n-1)/2 controlled phase gates R_k = diag(1, e^(2πi/2^k)), scaling as O(n^2) = O(log^2 N) gates compared to classical Fast Fourier Transform (FFT) which requires O(N log N) = O(n 2^n) operations.',
    complexity: {
      classicalTime: 'O(N log N) = O(n 2^n) (FFT)',
      quantumTime: 'O(n^2) = O(log^2 N) gates',
      advantage: 'Exponential speedup in transformation representation'
    },
    takeaways: [
      'Forms the computational backbone for Shor period-finding, Phase Estimation, and HHL matrix inversion.',
      'Translates discrete temporal/arithmetic periodicity into observable spatial frequency peaks.',
      'Amplitudes are transformed in superposition, though measurement samples only single Fourier components.'
    ],
    references: [
      'D. Coppersmith, "An fast quantum algorithm for numerical recipes", IBM Research Report RC19642 (1994).'
    ]
  },

  /* ------------------------------------------------------------
     2. QUANTUM OPTIMIZATION
     ------------------------------------------------------------ */
  {
    id: 'qaoa',
    number: '05',
    name: 'Quantum Approximate Optimization Algorithm (QAOA)',
    category: 'Quantum Optimization',
    categoryId: 'optimization',
    desc: 'Solve combinatorial optimization problems such as MaxCut on graphs using alternating applications of cost and mixer unitaries on a variational quantum processor.',
    concepts: ['MaxCut Problem', 'Variational Principle', 'Cost Hamiltonian', 'Mixer Hamiltonian', 'Parameter Optimization'],
    difficulty: 'Advanced',
    color: '#d97706',
    accentColor: '#fbbf24',
    qubits: 4,
    circuit: [
      'q0 ──[H]──[ e^(-iγ H_C) ]──[ e^(-iβ H_M) ]──[M]',
      'q1 ──[H]──[ e^(-iγ H_C) ]──[ e^(-iβ H_M) ]──[M]',
      'q2 ──[H]──[ e^(-iγ H_C) ]──[ e^(-iβ H_M) ]──[M]',
      'q3 ──[H]──[ e^(-iγ H_C) ]──[ e^(-iβ H_M) ]──[M]'
    ],
    steps: [
      { name: 'Graph & Problem Formulation', desc: 'Define target graph G=(V,E). Formulate Cost Hamiltonian H_C = ∑_{(i,j)∈E} 1/2(I - Z_i Z_j).' },
      { name: 'Initial Superposition State', desc: 'Prepare all qubits in uniform superposition |+⟩^(⊗n) using Hadamards.' },
      { name: 'Cost Unitary U(C, γ)', desc: 'Apply problem Hamiltonian evolution e^(-iγ H_C) parameterized by angle γ.' },
      { name: 'Mixer Unitary U(B, β)', desc: 'Apply transverse field mixer evolution e^(-iβ H_M) = ∏_i e^(-iβ X_i) parameterized by β.' },
      { name: 'Classical Parameter Loop', desc: 'Measure expectation ⟨H_C⟩, update (γ, β) via classical optimizer, repeat for p layers.' }
    ],
    aim: 'To optimize the cut size of a graph using QAOA, simulate the cost landscape over (γ, β), and extract near-optimal partition bitstrings.',
    theory: 'QAOA is a hybrid quantum-classical variational algorithm designed for NISQ processors to find approximate solutions to NP-hard combinatorial optimization problems. For MaxCut, the goal is to partition graph vertices into two subsets maximizing cut edges. The cost Hamiltonian is encoded in Pauli-Z operators: H_C = ∑_{(u,v)∈E} 1/2(I - Z_u Z_v). The mixer Hamiltonian is H_M = ∑_{v∈V} X_v. For a depth-p circuit, the trial state is |γ, β⟩ = ∏_{k=1}^p [ e^(-iβ_k H_M) e^(-iγ_k H_C) ] |+⟩^(⊗n). A classical optimization loop adjusts the 2p parameters (γ, β) to maximize the expectation value F_p(γ, β) = ⟨γ, β| H_C |γ, β⟩. In the limit p → ∞, QAOA converges to the exact adiabatic ground state.',
    complexity: {
      classicalApproximation: '0.878 (Goemans-Williamson SDP)',
      quantumApproximation: 'Provably beats 0.878 for dense graphs at higher p',
      gateScaling: 'O(p |E|) gates per trial',
      advantage: 'Promising NISQ heuristic for combinatorial NP-hard problems'
    },
    takeaways: [
      'Alternates between problem phase separation and transverse mixer interference.',
      'Interpolates between quantum annealing (large p) and instantaneous quantum heuristics.',
      'Shallow circuits (p=1, 2) can be executed on noisy near-term quantum hardware.'
    ],
    references: [
      'E. Farhi, J. Goldstone, and S. Gutmann, "A Quantum Approximate Optimization Algorithm", arXiv:1411.4028 (2014).'
    ]
  },

  {
    id: 'quantum-annealing',
    number: '06',
    name: 'Quantum Annealing',
    category: 'Quantum Optimization',
    categoryId: 'optimization',
    desc: 'Find the global minimum of complex rugged energy landscapes by exploiting quantum tunneling through high, narrow potential energy barriers.',
    concepts: ['Adiabatic Theorem', 'Quantum Tunneling', 'Ising Spin Model', 'Transverse Field', 'Annealing Schedule'],
    difficulty: 'Intermediate',
    color: '#e11d48',
    accentColor: '#fb7185',
    qubits: 4,
    circuit: [
      'H(t) = A(t) H_driver + B(t) H_problem',
      'H_driver = -∑ σ_i^x',
      'H_problem = ∑ h_i σ_i^z + ∑ J_ij σ_i^z σ_j^z'
    ],
    steps: [
      { name: 'Initial Strong Quantum Driver', desc: 'Initialize system in ground state of strong transverse field H_driver = -∑ X_i where all spins point in +x direction.' },
      { name: 'Adiabatic Annealing Schedule', desc: 'Gradually decrease driver amplitude A(t) while increasing problem Hamiltonian B(t) over duration T.' },
      { name: 'Quantum Tunneling Through Barriers', desc: 'Quantum fluctuations tunnel through narrow, tall energy barriers where thermal annealing would become trapped.' },
      { name: 'Freezing into Ising Ground State', desc: 'System freezes into the configuration minimizing the classical Ising cost function H_problem.' },
      { name: 'Readout', desc: 'Measure spin orientations (+1 for |0⟩, -1 for |1⟩) representing the optimal solution.' }
    ],
    aim: 'To simulate quantum annealing trajectory on an Ising spin model, visualize the time-dependent energy landscape, and observe quantum tunneling to the ground state.',
    theory: 'Quantum annealing relies on the Adiabatic Theorem of quantum mechanics: a quantum system initialized in the ground state of a time-dependent Hamiltonian H(t) remains in the instantaneous ground state provided the Hamiltonian changes sufficiently slowly: T ≫ ℏ / Δ_min^2, where Δ_min is the minimum spectral gap between the ground state and first excited state. The system Hamiltonian is parameterized as H(t) = A(t/T) H_0 + B(t/T) H_P, where H_0 = -∑_i X_i is the transverse field driver and H_P = ∑_i h_i Z_i + ∑_{i<j} J_{ij} Z_i Z_j encodes the target optimization problem. Unlike classical simulated annealing which relies on thermal hops over barriers of height ΔE with probability e^(-ΔE / k_B T), quantum tunneling penetrates barriers of width w with rate e^(-w √ΔE / ℏ), offering significant advantages in landscapes with tall, narrow barriers.',
    complexity: {
      classicalSimulatedAnnealing: 'O(e^(c·w·ΔE)) barrier scaling',
      quantumAnnealing: 'O(e^(c·w·√ΔE)) tunneling scaling',
      hardwareModel: 'Specialized analog flux-qubit architectures (e.g. D-Wave)',
      advantage: 'Faster escape from local minima through quantum tunneling'
    },
    takeaways: [
      'Analog quantum computing approach specialized for Quadratic Unconstrained Binary Optimization (QUBO).',
      'Quantum tunneling penetrates tall, thin barriers that trap classical Markov chain Monte Carlo methods.',
      'Annealing time is constrained by the minimum spectral gap Δ_min encountered during evolution.'
    ],
    references: [
      'T. Kadowaki and H. Nishimori, "Quantum annealing in the transverse Ising model", Phys. Rev. E 58, 5355 (1998).'
    ]
  },

  /* ------------------------------------------------------------
     3. QUANTUM MACHINE LEARNING
     ------------------------------------------------------------ */
  {
    id: 'qsvm',
    number: '07',
    name: 'Quantum Support Vector Machines (QSVM)',
    category: 'Quantum Machine Learning',
    categoryId: 'qml',
    desc: 'Perform non-linear classification by mapping classical feature vectors into high-dimensional quantum Hilbert space and computing inner products via quantum kernels.',
    concepts: ['Quantum Feature Map', 'Quantum Kernel Matrix', 'Dual SVM', 'Reproducing Kernel Hilbert Space', 'Classification'],
    difficulty: 'Advanced',
    color: '#0891b2',
    accentColor: '#38bdf8',
    qubits: 2,
    circuit: [
      'q0 ──[H]──[U_Φ(x1)]──[  Quantum Kernel  ]──[M]',
      'q1 ──[H]──[U_Φ(x2)]──[ |⟨Φ(x)|Φ(x\')⟩|² ]──[M]'
    ],
    steps: [
      { name: 'Classical Data Encoding', desc: 'Preprocess input data points x_i ∈ R^2 and normalize within [0, 2π].' },
      { name: 'Quantum Feature Map U_Φ(x)', desc: 'Apply non-linear entangling feature map U_Φ(x) = exp(i ∑_i x_i Z_i + ∑_{j>i} (π-x_i)(π-x_j) Z_i Z_j).' },
      { name: 'Kernel Matrix Evaluation', desc: 'Execute quantum circuit U_Φ^†(x_j) U_Φ(x_i) on all pairs to calculate transition fidelity K_ij = |⟨Φ(x_j)|Φ(x_i)⟩|².' },
      { name: 'Classical Dual SVM Solver', desc: 'Optimize Lagrange multipliers α_i classically: max ∑ α_i - 1/2 ∑ α_i α_j y_i y_j K_ij.' },
      { name: 'Decision Boundary Classification', desc: 'Classify unseen test points using support vectors: y(x) = sign(∑ α_i y_i K(x_i, x) + b).' }
    ],
    aim: 'To evaluate a quantum kernel matrix on a non-linearly separable dataset, train a dual SVM, and visualize the decision boundary.',
    theory: 'Classical support vector machines map data x ∈ R^d into an implicit higher-dimensional feature space where non-linear patterns become linearly separable. However, classical feature maps are constrained by functions that admit computationally tractable kernels. The Quantum SVM maps data into the 2^n-dimensional Hilbert space of n qubits: x ↦ |Φ(x)⟩ = U_Φ(x)|0⟩^(⊗n). The quantum kernel is defined by the transition probability between encoded states: K(x, x\') = |⟨Φ(x)|Φ(x\')⟩|^2 = |⟨0| U_Φ^†(x) U_Φ(x\') |0⟩|^2. This quantity is estimated directly on a quantum computer by measuring the probability of observing |0...0⟩. For certain entangled feature maps (e.g., discrete log or scrambled ZZ-feature maps), classical estimation of K(x, x\') is conjectured to be intractable (#P-hard), conferring potential quantum advantage in classification.',
    complexity: {
      classicalKernelEval: 'O(d) for standard RBF/Polynomial; intractable for complex quantum maps',
      quantumKernelEval: 'O(shots) per matrix entry; O(M^2 shots) for training set of size M',
      svmTraining: 'O(M^3) dual quadratic program solved classically',
      advantage: 'Explores exponentially large Hilbert spaces inaccessible to classical kernels'
    },
    takeaways: [
      'Retains the robust convex optimization guarantees of classical SVM while leveraging quantum feature spaces.',
      'Quantum computer acts strictly as an inner-product kernel evaluation accelerator.',
      'Expressive power depends crucially on selecting feature maps that cannot be efficiently simulated classically.'
    ],
    references: [
      'V. Havlicek et al., "Supervised learning with quantum-enhanced feature spaces", Nature 567, 209–212 (2019).'
    ]
  },

  {
    id: 'quantum-kernel-alignment',
    number: '08',
    name: 'Quantum Kernel Alignment (QKA)',
    category: 'Quantum Machine Learning',
    categoryId: 'qml',
    desc: 'Adapt and optimize parameterized quantum kernels to maximize mathematical alignment with target training labels, tailoring the quantum metric to the learning task.',
    concepts: ['Parameterized Feature Map', 'Kernel Target Alignment', 'Frobenius Inner Product', 'Gradient Ascent', 'Metric Learning'],
    difficulty: 'Advanced',
    color: '#8b5cf6',
    accentColor: '#c084fc',
    qubits: 2,
    circuit: [
      'q0 ──[H]──[U_Φ(x, θ)]──[  Kernel Alignment  ]──[M]',
      'q1 ──[H]──[U_Φ(x, θ)]──[ Maximize A(K_θ, Y) ]──[M]'
    ],
    steps: [
      { name: 'Parameterized Feature Map Setup', desc: 'Construct feature map U_Φ(x, θ) containing both classical data x and trainable parameters θ.' },
      { name: 'Compute Parameterized Kernel K_θ', desc: 'Evaluate quantum transition fidelity matrix K_θ(x_i, x_j) across training samples.' },
      { name: 'Formulate Ideal Target Kernel Y', desc: 'Construct target label matrix Y_ij = y_i y_j (+1 for same class, -1 for opposite).' },
      { name: 'Kernel Target Alignment Evaluation', desc: 'Calculate alignment score A(K_θ, Y) = ⟨K_θ, Y⟩_F / (||K_θ||_F · ||Y||_F).' },
      { name: 'Iterative Gradient Optimization', desc: 'Update θ via gradient ascent to maximize alignment, yielding sharp, class-concentrated kernels.' }
    ],
    aim: 'To optimize a parameterized quantum kernel on a synthetic dataset, track the alignment metric A(K_θ, Y) over training steps, and compare performance against an unaligned kernel.',
    theory: 'A major challenge in quantum machine learning is that default, heuristic quantum feature maps often fail to capture the geometric structure of real-world data, leading to poor generalization or "kernel concentration" (where all points appear equidistant). Quantum Kernel Alignment addresses this by introducing variational parameters θ into the feature map: |Φ(x, θ)⟩ = U(x, θ)|0⟩^(⊗n). The kernel matrix K_θ has elements K_θ(i,j) = |⟨0| U^†(x_i, θ) U(x_j, θ) |0⟩|^2. The target ideal kernel is the rank-1 matrix Y = y y^T. The Kernel Target Alignment (KTA) is defined as the normalized Frobenius inner product: A(K_θ, Y) = ⟨K_θ, Y⟩_F / (||K_θ||_F ||Y||_F) = ∑_{i,j} K_θ(i,j) y_i y_j / ( √(∑ K_θ(i,j)^2) √(∑ Y(i,j)^2) ). By computing analytical gradients ∂A/∂θ using the parameter-shift rule, θ is optimized classically to align the quantum metric specifically with the target classification manifold.',
    complexity: {
      alignmentMetric: 'Normalized Frobenius cosine similarity in matrix space [-1, 1]',
      gradientMethod: 'Parameter-shift rule: ∂K/∂θ = 1/2 [ K(θ + π/2) - K(θ - π/2) ]',
      optimizationGoal: 'Maximizes inter-class separation while minimizing intra-class variance',
      advantage: 'Prevents barren plateaus and avoids flat, uninformative quantum kernels'
    },
    takeaways: [
      'Distinct from QSVM: QKA actively trains the feature map before running SVM classification.',
      'Maximizing kernel target alignment provably tightens generalization error bounds.',
      'Solves the problem of heuristic quantum kernel mismatch on complex data distributions.'
    ],
    references: [
      'T. Hubregtsen et al., "Training quantum embedding kernels on near-term hardware", arXiv:2105.02276 (2021).',
      'N. Cristianini et al., "On Kernel Target Alignment", NIPS 14 (2001).'
    ]
  },

  {
    id: 'vqc',
    number: '09',
    name: 'Variational Quantum Classifier (VQC)',
    category: 'Quantum Machine Learning',
    categoryId: 'qml',
    desc: 'An end-to-end variational quantum machine learning model that trains parameterized rotation gates via classical gradient descent to classify complex datasets.',
    concepts: ['Parameterized Quantum Circuit', 'Ansatz Depth', 'Loss Function', 'Parameter Shift Rule', 'Gradient Descent'],
    difficulty: 'Intermediate',
    color: '#ec4899',
    accentColor: '#f472b6',
    qubits: 2,
    circuit: [
      'q0 ──[S(x)]──[Ry(θ0)]──●────[Ry(θ2)]──[M (⟨Z⟩)]',
      'q1 ──[S(x)]──[Ry(θ1)]──X────[Ry(θ3)]──────────'
    ],
    steps: [
      { name: 'Feature Encoding Layer S(x)', desc: 'Encode classical data point x = (x0, x1) into qubit rotation angles: S(x) = Rz(x1) Ry(x0).' },
      { name: 'Variational Ansatz W(θ)', desc: 'Apply parameterized layers of single-qubit rotations Ry(θ_i) intertwined with entangling CNOT gates.' },
      { name: 'Expectation Measurement', desc: 'Measure Pauli-Z observable ⟨Z_0⟩ = ⟨0| (W S)^† Z_0 (W S) |0⟩ to compute prediction score y_pred ∈ [-1, +1].' },
      { name: 'Loss Calculation', desc: 'Evaluate mean squared error or binary cross-entropy loss between y_pred and true label y_true.' },
      { name: 'Parameter Shift & Backpropagation', desc: 'Compute exact gradients ∂L/∂θ_i on quantum hardware and update weights θ ← θ - η ∇L.' }
    ],
    aim: 'To train a Variational Quantum Classifier on a 2D circular boundary dataset, visualize live parameter convergence and the evolving decision boundary.',
    theory: 'The Variational Quantum Classifier (VQC) functions as an explicit quantum neural circuit. The full circuit unitary is U(x, θ) = W(θ) S(x), where S(x) is a fixed data-encoding block and W(θ) is a parameterized ansatz consisting of L layers of single-qubit rotations and entangling gates. The model prediction for input x is given by the expectation value of a chosen Hermitian observable: ŷ(x, θ) = ⟨0| U^†(x, θ) M U(x, θ) |0⟩, typically M = Z_0. Binary predictions are assigned via sign(ŷ(x, θ)). To train the parameters without numerical finite-difference errors, the Parameter-Shift Rule is employed: ∂⟨M⟩/∂θ_k = 1/2 [ ⟨M⟩_{θ_k + π/2} - ⟨M⟩_{θ_k - π/2} ]. This allows exact gradients to be calculated directly on quantum hardware using standard circuit evaluations.',
    complexity: {
      forwardPass: 'O(L) quantum circuit depth per data sample',
      gradientEvaluations: '2 evaluations per parameter per sample (Parameter Shift Rule)',
      parameterCount: 'Linear with ansatz layers O(n · L)',
      advantage: 'Direct classification without requiring M × M kernel storage'
    },
    takeaways: [
      'Operates as a true quantum neural model optimized in an end-to-end loop.',
      'The Parameter-Shift Rule enables exact analytical gradient calculation on quantum computers.',
      'Entangling layers allow the classifier to capture non-linear correlation structures.'
    ],
    references: [
      'M. Schuld et al., "Evaluating analytic gradients on quantum hardware", Phys. Rev. A 99, 032331 (2019).'
    ]
  },

  {
    id: 'qnn',
    number: '10',
    name: 'Quantum Neural Networks (QNN)',
    category: 'Quantum Machine Learning',
    categoryId: 'qml',
    desc: 'Deep multi-layer quantum architectures featuring parameterized unitary transformations, entangling convolutional blocks, and dimension reduction pooling layers.',
    concepts: ['Quantum Convolution', 'Quantum Pooling', 'Deep Quantum Circuits', 'Barren Plateaus', 'Quantum Expressibility'],
    difficulty: 'Advanced',
    color: '#6366f1',
    accentColor: '#818cf8',
    qubits: 4,
    circuit: [
      'q0 ──[ Conv U(θ) ]──[ Pool ]───────────────────',
      'q1 ──[           ]──[  ↓   ]──[ Conv ]──[M (⟨Z⟩)]',
      'q2 ──[ Conv U(θ) ]──[ Pool ]──[  U   ]─────────',
      'q3 ──[           ]──[  ↓   ]───────────────────'
    ],
    steps: [
      { name: 'Hierarchical Register Encoding', desc: 'Initialize a 4-qubit register to encode multi-feature data vectors.' },
      { name: 'Quantum Convolutional Layer', desc: 'Apply translationally-invariant 2-qubit unitary blocks U(θ) between adjacent qubit pairs.' },
      { name: 'Quantum Pooling / Reduction Layer', desc: 'Measure subsets of qubits or apply controlled-rotations to trace out degrees of freedom, reducing dimension.' },
      { name: 'Fully Connected Quantum Layer', desc: 'Apply global entangling unitary to remaining active qubits.' },
      { name: 'Multi-Observable Output', desc: 'Measure target observables to extract learned activations and classification probabilities.' }
    ],
    aim: 'To construct and simulate a multi-qubit Quantum Neural Network architecture, observe quantum convolutional filters, and analyze expressibility.',
    theory: 'Quantum Neural Networks (QNNs) extend deep learning concepts into quantum mechanics. In a Quantum Convolutional Neural Network (QCNN), input data is processed through alternating layers of quantum convolutions and quantum pooling. A quantum convolution applies identical parameterized 2-qubit unitaries U_i(θ) to neighboring pairs in a translationally invariant manner, preserving local entanglement. A quantum pooling layer measures a subset of qubits and applies conditional unitary corrections to the remaining qubits based on the measurement outcomes, reducing the effective Hilbert space dimension from 2^n to 2^(n/2). Crucially, Cong et al. proved that QCNN architectures are immune to the Barren Plateau phenomenon (exponential vanishing of gradients) that plagues generic deep unstructured variational circuits, because the reduction in qubits ensures that gradient variance decays only polynomially with system size.',
    complexity: {
      depthScaling: 'O(log n) circuit depth for n input qubits',
      gradientDecay: 'Polynomial gradient scaling O(1/poly(n)) (avoids Barren Plateaus)',
      expressibility: 'Universal for topological phase recognition and quantum error correction',
      advantage: 'Exponentially larger feature representation with logarithmic circuit depth'
    },
    takeaways: [
      'Combines quantum convolutional weight sharing with pooling dimension reduction.',
      'The hierarchical structure provably avoids the Barren Plateau problem.',
      'Ideal for analyzing quantum many-body states, topological phases, and image features.'
    ],
    references: [
      'I. Cong, S. Choi, and M. D. Lukin, "Quantum convolutional neural networks", Nature Physics 15, 1273–1278 (2019).'
    ]
  },

  /* ------------------------------------------------------------
     4. QUANTUM SIMULATION
     ------------------------------------------------------------ */
  {
    id: 'qpe',
    number: '11',
    name: 'Quantum Phase Estimation (QPE)',
    category: 'Quantum Simulation',
    categoryId: 'simulation',
    desc: 'Extract the unknown phase eigenvalue θ in U|u⟩ = e^(2πiθ)|u⟩ with exponential precision using controlled unitary powers and an inverse Quantum Fourier Transform.',
    concepts: ['Eigenvalue Extraction', 'Controlled Unitary Powers', 'Inverse QFT', 'Phase Readout', 'Precision Scaling'],
    difficulty: 'Advanced',
    color: '#0284c7',
    accentColor: '#38bdf8',
    qubits: 4,
    circuit: [
      'c0 ──[H]──●───────────────────────[      ]────[M]',
      'c1 ──[H]──|──────●────────────────[ QFT† ]────[M]',
      'c2 ──[H]──|──────|──────●─────────[      ]────[M]',
      'tgt ──────[U^1]──[U^2]──[U^4]─────────────────'
    ],
    steps: [
      { name: 'Prepare Counting Register & Eigenstate', desc: 'Initialize t counting qubits in |0⟩^(⊗t) and target register in the eigenstate |u⟩.' },
      { name: 'Counting Register Superposition', desc: 'Apply Hadamard gates H^(⊗t) to establish equal superposition across counting qubits.' },
      { name: 'Controlled-U^(2^j) Evolutions', desc: 'Apply controlled powers of U where counting qubit j controls the unitary U^(2^j).' },
      { name: 'Inverse QFT (QFT^†)', desc: 'Execute inverse Quantum Fourier Transform on the counting register to convert phases into binary basis states.' },
      { name: 'Measurement & Phase Extraction', desc: 'Measure counting register. The resulting bitstring directly yields the binary expansion of phase θ.' }
    ],
    aim: 'To simulate Quantum Phase Estimation, vary target phases θ, observe the binary phase readout on counting qubits, and quantify error scaling with register size t.',
    theory: 'Let U be a unitary operator with an eigenstate |u⟩ such that U|u⟩ = e^(2πiθ)|u⟩, where θ ∈ [0, 1) is an unknown phase. Quantum Phase Estimation extracts θ to t bits of precision. The algorithm uses two registers: a t-qubit counting register initialized to |0⟩^(⊗t) and a target register in state |u⟩. After applying H^(⊗t) to the counting register, controlled operations apply U^(2^j) conditioned on counting qubit j, producing the entangled state: (1/2^(t/2)) ∑_{k=0}^{2^t - 1} e^(2πi θ k) |k⟩ ⊗ |u⟩. The counting register now contains the Fourier transform of the state representing the binary fraction θ ≈ 0.θ_1 θ_2 ... θ_t. Applying the inverse Quantum Fourier Transform (QFT^†) yields the computational basis state |2^t θ⟩ with high probability. When θ can be expressed exactly with t bits, P(2^t θ) = 1. If not, the probability peaks at the closest integer with bounded error: P(|2^t θ - k| ≤ 1) ≥ 8/π^2 ≈ 81%.',
    complexity: {
      precision: 't counting qubits achieve precision ε = 2^(-t)',
      successProbability: '1 - ε error probability using t + O(log(1/ε)) qubits',
      unitaryCalls: 'O(2^t) = O(1/ε) controlled-U applications',
      advantage: 'Exponential precision advantage over classical sampling'
    },
    takeaways: [
      'The foundational engine driving Shor factoring, HHL linear solvers, and quantum chemistry simulation.',
      'Converts continuous continuous phase angles into discrete quantum interference peaks.',
      'Precision increases exponentially with the number of counting qubits.'
    ],
    references: [
      'A. Yu. Kitaev, "Quantum measurements and the Abelian Stabilizer Problem", arXiv:quant-ph/9511026 (1995).'
    ]
  },

  {
    id: 'vqe',
    number: '12',
    name: 'Variational Quantum Eigensolver (VQE)',
    category: 'Quantum Simulation',
    categoryId: 'simulation',
    desc: 'Determine ground-state energies of molecular Hamiltonians using a hybrid quantum-classical Rayleigh-Ritz variational loop resilient to NISQ hardware noise.',
    concepts: ['Molecular Ground State', 'Variational Principle', 'Hamiltonian Decomposition', 'UCCSD Ansatz', 'Energy Minimization'],
    difficulty: 'Advanced',
    color: '#059669',
    accentColor: '#34d399',
    qubits: 2,
    circuit: [
      'q0 ──[Ry(θ0)]──●────[Rz(θ2)]────[Pauli Readout]──[M]',
      'q1 ──[Ry(θ1)]──X────[Rz(θ3)]────[Pauli Readout]──[M]'
    ],
    steps: [
      { name: 'Molecular Hamiltonian Definition', desc: 'Represent target molecule (e.g. H2) via Jordan-Wigner mapping into Pauli sum: H = ∑_i c_i P_i.' },
      { name: 'Ansatz State Preparation', desc: 'Prepare parameterized quantum state |ψ(θ)⟩ = U(θ)|0⟩ using hardware-efficient or UCCSD ansatz.' },
      { name: 'Pauli Expectation Measurement', desc: 'Measure expectation values ⟨P_i⟩ on the quantum computer and calculate total energy E(θ) = ∑ c_i ⟨P_i⟩.' },
      { name: 'Classical Optimization Step', desc: 'A classical optimizer (COBYLA/SPSA) evaluates energy E(θ) and updates variational parameters θ.' },
      { name: 'Convergence to Chemical Accuracy', desc: 'Repeat loop until energy converges within chemical accuracy (1.6 × 10^-3 Hartree ≈ 1 kcal/mol).' }
    ],
    aim: 'To simulate the ground state energy of the H2 molecule across interatomic bond distances R, trace the optimization trajectory, and verify chemical accuracy.',
    theory: 'Finding the ground state energy of molecular electronic Hamiltonians is central to quantum chemistry and material science. Full Configuration Interaction (FCI) scales exponentially on classical computers. The Variational Quantum Eigensolver leverages the Rayleigh-Ritz variational principle: for any trial state |ψ(θ)⟩, the expectation value of the Hamiltonian is an upper bound on the true ground state energy E_0: ⟨ψ(θ)| H |ψ(θ)⟩ ≥ E_0. The molecular electronic Hamiltonian is mapped into qubit operators via Jordan-Wigner or Bravyi-Kitaev transformations: H = ∑_j h_j P_j, where each P_j ∈ {I, X, Y, Z}^(⊗n) is a tensor product of Pauli operators. The quantum computer evaluates each expectation value ⟨ψ(θ)| P_j |ψ(θ)⟩ efficiently by rotating measurement bases into the computational basis. The classical computer computes the weighted sum E(θ) = ∑_j h_j ⟨P_j⟩ and updates θ using gradient-free or gradient-based optimizers.',
    complexity: {
      classicalExactFCI: 'Exponential scaling O(e^N) in basis orbital count',
      vqeQuantumStatePrep: 'Polynomial circuit depth O(poly(N))',
      chemicalAccuracy: 'Target threshold: |E_calc - E_exact| < 1.6 × 10^-3 Hartree',
      advantage: 'Enables polynomial-time quantum chemistry simulations on near-term NISQ hardware'
    },
    takeaways: [
      'Flagship hybrid algorithm for near-term quantum advantage in materials and drug discovery.',
      'Noise-resilient because errors in parameter execution only shift the trial state without violating the variational lower bound.',
      'Accurate ground state energy yields precise chemical reaction rates and bond dissociation curves.'
    ],
    references: [
      'A. Peruzzo et al., "A variational eigenvalue solver on a photonic quantum processor", Nature Communications 5, 4213 (2014).'
    ]
  }
];

// Helper to find algorithm by ID
QL.getAlgorithm = function(id) {
  return QL.algorithmsList.find(a => a.id === id) || QL.algorithmsList[0];
};

// Sync with QL.data.algorithms so any existing legacy component works seamlessly
if (window.QL && QL.data) {
  QL.data.algorithms = QL.algorithmsList;
}
