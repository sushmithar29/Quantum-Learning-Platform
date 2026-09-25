/* ============================================================
   QUANTUMLAB – VIRTUAL LABS DATA & EDUCATIONAL REPOSITORY
   University-grade Information Architecture for Virtual Laboratories
   ============================================================ */

window.QL = window.QL || {};

QL.virtualLabExperiments = [
  {
    id: 'circuit-lab',
    number: '01',
    title: 'Quantum Circuit Laboratory & Multi-Qubit Synthesis',
    shortName: 'Quantum Circuit Lab',
    desc: 'Design, synthesize, and execute multi-qubit quantum circuits. Analyze unitary gate transformations, create Einstein-Podolsky-Rosen (Bell) entangled states, and observe projective state collapse.',
    concept: 'Unitary Gates • Entanglement • Superposition • Circuit Model',
    tags: ['Gates', 'Qubits', 'Entanglement', 'State Vector', 'Bell State'],
    category: 'Quantum Computing & Information',
    difficulty: 'Intermediate',
    duration: '35 mins',
    status: 'Interactive',
    color: '#7c3aed',
    accentColor: '#a78bfa',
    rating: 4.9,
    ratingCount: 142,
    route: 'circuit-lab.html',
    
    // 1. AIM
    aim: 'To design, construct, and simulate quantum logic circuits on multi-qubit registers, verify the action of single-qubit unitary operators (H, X, Y, Z, S, T) and multi-qubit entangling gates (CNOT, SWAP), create maximally entangled Bell pairs, and analyze the resultant state vectors, density matrices, and projective measurement distributions.',
    
    // 2. THEORY
    theory: {
      overview: 'In quantum computation, information is encoded in quantum bits (qubits) existing in a two-dimensional complex Hilbert space $\\mathcal{H}_2$. A register of $n$ qubits resides in the tensor product space $\\mathcal{H}_2^{\\otimes n}$ of dimension $2^n$. Any closed quantum evolution is modeled as a unitary operator $U$ satisfying $U^\\dagger U = I$.',
      subsections: [
        {
          title: 'Single-Qubit Unitary Operators',
          content: 'The canonical basis states are $|0\\rangle = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$ and $|1\\rangle = \\begin{pmatrix} 0 \\\\ 1 \\end{pmatrix}$. Key single-qubit gates include:\n\n• Hadamard Gate ($H$): Creates an unbiased superposition from computational basis states:\n  $$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}, \\quad H|0\\rangle = |+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}$$\n\n• Pauli-X (Quantum NOT): Inverts basis states:\n  $$X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad X|0\\rangle = |1\\rangle, \\; X|1\\rangle = |0\\rangle$$\n\n• Pauli-Z (Phase Flip): Applies a relative phase of $\\pi$ to $|1\\rangle$:\n  $$Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}, \\quad Z|+\\rangle = |-\\rangle$$\n\n• Phase Gates ($S, T$): Impart relative phases of $\\pi/2$ and $\\pi/4$:\n  $$S = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}, \\quad T = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}$$'
        },
        {
          title: 'Two-Qubit Entanglement & Controlled Operations',
          content: 'The Controlled-NOT ($CNOT$) gate flips the target qubit if and only if the control qubit is in state $|1\\rangle$:\n$$CNOT = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}$$\n\nApplying $H$ on qubit $q_0$ followed by $CNOT(q_0 \\to q_1)$ transforms the separable product state $|00\\rangle$ into the maximally entangled Bell state:\n$$|00\\rangle \\xrightarrow{H \\otimes I} \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}} \\xrightarrow{CNOT} |\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$\nThis state cannot be factored into product states $|\\psi_A\\rangle \\otimes |\\psi_B\\rangle$, exhibiting non-local quantum correlations.'
        },
        {
          title: 'Projective Measurement & Born Rule',
          content: 'Measurement in the computational basis is represented by projection operators $M_m = |m\\rangle\\langle m|$. For a state $|\\psi\\rangle = \\sum_{x} c_x |x\\rangle$, the probability of obtaining outcome $x$ upon measuring all qubits is given by Born\'s rule:\n$$P(x) = |\\langle x|\\psi\\rangle|^2 = |c_x|^2, \\quad \\sum_{x} P(x) = 1$$\nUpon measurement, the continuous wavefunction collapses irreversibly into the observed eigenstate $|x\\rangle$.'
        }
      ]
    },
    
    // 3. LEARNING OBJECTIVES
    learningObjectives: [
      'Understand the mathematical representation of single-qubit gates as $2 \\times 2$ unitary transformation matrices.',
      'Construct multi-qubit entanglement circuits and observe non-separable state vectors.',
      'Analyze the creation and verification of the four canonical Bell states ($|\\Phi^+\\rangle, |\\Phi^-\\rangle, |\\Psi^+\\rangle, |\\Psi^-\\rangle$).',
      'Compare theoretical probability amplitudes $|c_i|^2$ against finite empirical shot statistics.',
      'Investigate the impact of quantum gate depth and simulated decoherence on final state fidelity.'
    ],
    
    // 4. PROCEDURE
    procedure: [
      {
        step: 1,
        title: 'Initialize Quantum Register',
        desc: 'Select the register size (2 or 3 qubits). By default, all qubits initialize in the ground state $|00\\dots 0\\rangle$.'
      },
      {
        step: 2,
        title: 'Place Single-Qubit Gates',
        desc: 'Select a gate from the palette (e.g., Hadamard [H], Pauli-X) and place it on a desired qubit wire to induce superposition or bit flips.'
      },
      {
        step: 3,
        title: 'Introduce Entangling Gates',
        desc: 'Place a CNOT gate with control on $q_0$ and target on $q_1$ to create quantum entanglement between the wires.'
      },
      {
        step: 4,
        title: 'Insert Measurement Operators',
        desc: 'Place projective measurement [M] operators at the final stage of the circuit to sample computational basis outcomes.'
      },
      {
        step: 5,
        title: 'Configure Simulation Parameters',
        desc: 'Set the number of execution shots (10 to 1024) and test the effect of simulated environmental noise (0% to 20%).'
      },
      {
        step: 6,
        title: 'Execute & Observe Results',
        desc: 'Click "Run Simulation" to observe the traveling wave packet along the quantum wires, review the state vector amplitudes, and examine the outcome histogram.'
      }
    ],
    
    // 5. SELF EVALUATION (MCQ Questions)
    selfEvaluation: [
      {
        id: 'q1',
        question: 'What is the resultant quantum state when a Hadamard gate (H) is applied to the basis state |0⟩?',
        options: [
          { text: 'A. |1⟩', correct: false },
          { text: 'B. (|0⟩ + |1⟩) / √2', correct: true },
          { text: 'C. (|0⟩ - |1⟩) / √2', correct: false },
          { text: 'D. (|0⟩ + i|1⟩) / √2', correct: false }
        ],
        explanation: 'The Hadamard operator maps |0⟩ to the symmetric superposition state |+⟩ = (|0⟩ + |1⟩)/√2 with equal probability of 50% for observing 0 or 1.'
      },
      {
        id: 'q2',
        question: 'Which sequence of gates creates the maximally entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 from the initial state |00⟩?',
        options: [
          { text: 'A. X on q0, followed by CNOT(q0 → q1)', correct: false },
          { text: 'B. H on q0, followed by CNOT(q0 → q1)', correct: true },
          { text: 'C. H on both q0 and q1', correct: false },
          { text: 'D. CNOT(q0 → q1), followed by H on q1', correct: false }
        ],
        explanation: 'Applying H on q0 produces (|00⟩ + |10⟩)/√2. The subsequent CNOT flips the target q1 only when q0 is |1⟩, yielding the entangled Bell state (|00⟩ + |11⟩)/√2.'
      },
      {
        id: 'q3',
        question: 'If a quantum system is in the state |ψ⟩ = 0.6|0⟩ + 0.8|1⟩, what is the probability of measuring the outcome 1?',
        options: [
          { text: 'A. 0.8 (80%)', correct: false },
          { text: 'B. 0.64 (64%)', correct: true },
          { text: 'C. 0.36 (36%)', correct: false },
          { text: 'D. 0.48 (48%)', correct: false }
        ],
        explanation: 'According to Born\'s rule, P(1) = |β|² = |0.8|² = 0.64 (64%), while P(0) = |0.6|² = 0.36 (36%). Note that 0.36 + 0.64 = 1.'
      },
      {
        id: 'q4',
        question: 'What happens when two consecutive Hadamard gates (H · H) are applied to an arbitrary qubit state |ψ⟩?',
        options: [
          { text: 'A. The state is inverted to X|ψ⟩', correct: false },
          { text: 'B. The qubit collapses into a classical bit', correct: false },
          { text: 'C. The state returns identically to |ψ⟩ because H is its own inverse (H² = I)', correct: true },
          { text: 'D. The phase is shifted by π radians', correct: false }
        ],
        explanation: 'The Hadamard gate is Hermitian and unitary (H = H† = H⁻¹), so H · H = I (the identity operator). Applying it twice restores the original state.'
      }
    ],
    
    // 6. ASSIGNMENT
    assignment: [
      {
        id: 'a1',
        title: 'Construct the Greenberger–Horne–Zeilinger (GHZ) 3-Qubit State',
        task: 'Using a 3-qubit register initialized to |000⟩, synthesize the tripartite entangled GHZ state |GHZ⟩ = (|000⟩ + |111⟩)/√2. Determine the minimum gate depth required and verify that measuring q0 produces 100% correlated outcomes across all three qubits.'
      },
      {
        id: 'a2',
        title: 'Implement Quantum Superdense Coding Circuit',
        task: 'Create an entangled Bell pair between two parties, apply local Pauli operators (I, X, Z, or XZ) on the sender qubit to encode 2 classical bits into 1 qubit, and construct the Bell measurement stage to decode both bits.'
      }
    ],
    
    // 7. REFERENCES
    references: [
      {
        title: 'Quantum Computation and Quantum Information',
        authors: 'Michael A. Nielsen & Isaac L. Chuang',
        publisher: 'Cambridge University Press, 10th Anniversary Edition',
        year: '2010',
        link: 'https://doi.org/10.1017/CBO9780511976667'
      },
      {
        title: 'Lecture Notes on Quantum Information and Computation',
        authors: 'John Preskill',
        publisher: 'California Institute of Technology (Caltech)',
        year: '2023',
        link: 'http://theory.caltech.edu/~preskill/ph219/index.html'
      },
      {
        title: 'Qiskit Quantum Circuit Architecture & Pulse Simulation Guide',
        authors: 'IBM Quantum Research Team',
        publisher: 'IBM Quantum Platform Documentation',
        year: '2024',
        link: 'https://docs.quantum.ibm.com/'
      }
    ]
  },
  
  {
    id: 'bloch-sphere',
    number: '02',
    title: 'Bloch Sphere Dynamics & Qubit State Evolution',
    shortName: 'Bloch Sphere Lab',
    desc: 'Explore the geometric representation of single-qubit states on the unit Bloch sphere. Apply continuous Euler rotations, observe gate actions, and understand SU(2) state transformations.',
    concept: 'Qubits • State Vectors • Euler Rotations • SU(2)',
    tags: ['Rotation', 'Visualization', '3D', 'Gates', 'Bloch Vector'],
    category: 'Quantum State Physics',
    difficulty: 'Beginner',
    duration: '25 mins',
    status: 'Interactive',
    color: '#06b6d4',
    accentColor: '#67e8f9',
    rating: 4.8,
    ratingCount: 98,
    route: 'bloch-sphere.html',
    aim: 'To visualize single-qubit quantum states as points on the unit Bloch sphere S², apply unitary rotations Rx(θ), Ry(θ), Rz(φ), and study the geometric trajectory of states under discrete quantum gates.',
    learningObjectives: [
      'Map complex two-dimensional state vectors to 3D Cartesian coordinates (x, y, z) on the Bloch sphere.',
      'Perform continuous rotations around the X, Y, and Z axes and calculate corresponding rotation matrices in SU(2).',
      'Understand the geometric interpretation of Pauli gates as 180° rotations.',
      'Analyze the relationship between polar angle θ, azimuthal angle φ, and measurement probabilities.'
    ]
  },
  
  {
    id: 'measurement-lab',
    number: '03',
    title: 'Quantum Measurement & Wavefunction Collapse',
    shortName: 'Quantum Measurement Lab',
    desc: 'Perform projective measurements in arbitrary bases (Z, X, Y). Observe single-shot state collapse, accumulate statistical distributions over multiple trials, and verify Born\'s rule.',
    concept: 'Projective Measurement • Basis Transformation • Born Rule',
    tags: ['Measurement', 'Statistics', 'Probability', 'Collapse'],
    category: 'Quantum Measurement & Foundations',
    difficulty: 'Beginner to Intermediate',
    duration: '20 mins',
    status: 'Interactive',
    color: '#059669',
    accentColor: '#34d399',
    rating: 4.9,
    ratingCount: 115,
    route: 'measurement-lab.html',
    aim: 'To investigate the quantum measurement postulate, demonstrate basis changes prior to readout, and verify that empirical frequencies converge to theoretical probability amplitudes |⟨m|ψ⟩|² as shots increase.',
    learningObjectives: [
      'Understand projective measurement operators and orthogonal projection decompositions.',
      'Transform measurement basis using Hadamard (X-basis) and Phase/Hadamard (Y-basis) rotations.',
      'Quantify statistical variance and sampling error as a function of total shot count.',
      'Observe irreversible wavefunction collapse from a coherent superposition into an eigenstate.'
    ]
  },
  
  {
    id: 'noise-lab',
    number: '04',
    title: 'Quantum Noise, Decoherence & Open Quantum Systems',
    shortName: 'Quantum Noise Lab',
    desc: 'Simulate open quantum system dynamics under environmental decoherence. Examine bit-flip, phase-flip, depolarizing, and amplitude damping channels, and quantify state fidelity degradation.',
    concept: 'Decoherence • Amplitude Damping • Phase Flip • Fidelity',
    tags: ['Noise', 'Decoherence', 'Error', 'Fidelity', 'Density Matrix'],
    category: 'Open Quantum Systems',
    difficulty: 'Advanced',
    duration: '40 mins',
    status: 'Interactive',
    color: '#e11d48',
    accentColor: '#fb7185',
    rating: 4.7,
    ratingCount: 76,
    route: 'noise-lab.html',
    aim: 'To simulate quantum noise channels (bit flip, phase flip, depolarizing, amplitude damping) acting on qubits, observe the shrinkage of the Bloch vector into the mixed-state interior, and calculate quantum state fidelity.',
    learningObjectives: [
      'Understand Kraus operators and open quantum system master equations.',
      'Distinguish between energy relaxation (T1) and dephasing (T2) noise processes.',
      'Observe the geometric contraction of pure state vectors into mixed states within the Bloch ball.',
      'Compute quantum state fidelity F(ρ, σ) and analyze threshold error tolerances.'
    ]
  },
  
  {
    id: 'state-lab',
    number: '05',
    title: 'Quantum State Preparation & Tomography',
    shortName: 'Quantum State Lab',
    desc: 'Interactively adjust quantum state amplitudes α and phases β. Observe real-time state vector representations, calculate expectation values ⟨X⟩, ⟨Y⟩, ⟨Z⟩, and reconstruct density matrices.',
    concept: 'Amplitudes • Relative Phase • State Reconstruction',
    tags: ['State Vector', 'Amplitudes', 'Phases', 'Bloch Sphere'],
    category: 'Quantum State Physics',
    difficulty: 'Intermediate',
    duration: '30 mins',
    status: 'Interactive',
    color: '#d97706',
    accentColor: '#fbbf24',
    rating: 4.8,
    ratingCount: 84,
    route: 'state-lab.html',
    aim: 'To prepare arbitrary single-qubit states |ψ⟩ = α|0⟩ + β|1⟩, explore the distinction between global phase and relative phase, and compute observable expectation values.',
    learningObjectives: [
      'Verify normalization conditions |α|² + |β|² = 1 for physical quantum states.',
      'Understand why global phases e^(iγ) are physically unobservable whereas relative phases e^(iφ) alter measurement statistics in conjugate bases.',
      'Compute expectation values ⟨σ_z⟩, ⟨σ_x⟩, ⟨σ_y⟩ directly from amplitude components.'
    ]
  },

  {
    id: 'stern-gerlach',
    number: '06',
    title: 'Stern–Gerlach Spin Measurement & Spatial Splitting',
    shortName: 'Stern–Gerlach Lab',
    desc: 'Pass silver atoms through an inhomogeneous magnetic field to demonstrate spatial spin quantization. Observe beam bifurcation into discrete m_s = ±1/2 trajectories and state collapse.',
    concept: 'Spatial Quantization • Spin Angular Momentum • Inhomogeneous B-Field',
    tags: ['Spin', 'Magnetic Field', 'Beam Splitting', 'Quantization'],
    category: 'Fundamental Quantum Physics',
    difficulty: 'Intermediate',
    duration: '30 mins',
    status: 'Interactive',
    color: '#3b82f6',
    accentColor: '#93c5fd',
    rating: 4.9,
    ratingCount: 210,
    route: '../experiments/stern-gerlach.html',
    aim: 'To demonstrate the spatial quantization of electron spin by passing neutral silver atoms through an inhomogeneous magnetic field, producing two discrete deflection trajectories corresponding to spin projections Sz = ±ħ/2.'
  }
];

// Helper to look up experiment by ID
QL.getVirtualLab = function(id) {
  return QL.virtualLabExperiments.find(exp => exp.id === id) || QL.virtualLabExperiments[0];
};
