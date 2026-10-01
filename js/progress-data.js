/* ============================================================
   QUANTUMLAB – PROGRESS DATA & TOPIC REGISTRY
   Aggregates authentic QuantumLab content into structured topics
   and activities for the personalized roadmap generator.
   ============================================================ */

window.QL = window.QL || {};

QL.progressTopicsRegistry = [
  /* ------------------------------------------------------------
     1. FOUNDATIONS
     ------------------------------------------------------------ */
  {
    id: 'cat-foundations',
    category: 'Foundations',
    icon: '⚛',
    color: '#06b6d4',
    topics: [
      {
        id: 'top-classical-vs-quantum',
        name: 'Classical vs Quantum Computing',
        desc: 'Understand how classical deterministic bits differ from quantum probabilistic states through interactive 3D labyrinth exploration.',
        category: 'Foundations',
        level: 'Beginner',
        activities: [
          {
            id: 'act-basics-maze',
            title: 'Classical vs Quantum 3D Maze Simulation',
            type: 'LEARN',
            difficulty: 'Beginner',
            estimatedMinutes: 20,
            route: 'basics.html',
            desc: 'Compare sequential classical exploration against quantum multi-path wavepacket propagation.'
          },
          {
            id: 'act-learn-qubits',
            title: 'Qubit Fundamentals & Basis States',
            type: 'LEARN',
            difficulty: 'Beginner',
            estimatedMinutes: 15,
            route: 'index.html#learn',
            desc: 'Understand state vectors |0⟩, |1⟩ and complex probability amplitudes.'
          }
        ]
      },
      {
        id: 'top-superposition',
        name: 'Superposition & State Vectors',
        desc: 'Explore linear combinations of states, probability amplitudes, and the Born rule.',
        category: 'Foundations',
        level: 'Beginner',
        activities: [
          {
            id: 'act-exp-superposition',
            title: 'Quantum Superposition Lab Experiment',
            type: 'EXPERIMENT',
            difficulty: 'Beginner',
            estimatedMinutes: 25,
            route: 'experiments.html',
            desc: 'Manipulate single-qubit states on the 3D Bloch sphere using Hadamard rotations.'
          },
          {
            id: 'act-chal-superposition',
            title: 'Challenge: Create Superposition',
            type: 'CHALLENGE',
            difficulty: 'Beginner',
            estimatedMinutes: 20,
            route: 'virtual-labs.html#challenges',
            desc: 'Build a circuit that outputs a 50/50 measurement distribution.'
          }
        ]
      },
      {
        id: 'top-bloch-sphere',
        name: 'Bloch Sphere 3D Visualization',
        desc: 'Geometric representation of pure and mixed qubit states in three-dimensional space.',
        category: 'Foundations',
        level: 'Beginner',
        activities: [
          {
            id: 'act-vlab-bloch',
            title: 'Interactive 3D Bloch Sphere Lab',
            type: 'VIRTUAL LAB',
            difficulty: 'Beginner',
            estimatedMinutes: 25,
            route: 'virtual-labs/bloch-sphere.html',
            desc: 'Interactively rotate state vectors across polar and azimuthal angles.'
          },
          {
            id: 'act-vlab-state',
            title: 'Quantum State Vector Lab',
            type: 'VIRTUAL LAB',
            difficulty: 'Intermediate',
            estimatedMinutes: 25,
            route: 'virtual-labs/state-lab.html',
            desc: 'Tune complex amplitudes and relative phase angles in real time.'
          }
        ]
      },
      {
        id: 'top-measurement',
        name: 'Quantum Measurement & Collapse',
        desc: 'Projective measurements, basis rotations, and stochastic wavefunction collapse.',
        category: 'Foundations',
        level: 'Beginner',
        activities: [
          {
            id: 'act-vlab-measurement',
            title: 'Quantum Measurement Laboratory',
            type: 'VIRTUAL LAB',
            difficulty: 'Beginner',
            estimatedMinutes: 30,
            route: 'virtual-labs/measurement-lab.html',
            desc: 'Test Z, X, and Y basis measurements and analyze binomial collapse statistics.'
          },
          {
            id: 'act-exp-stern-gerlach',
            title: 'Stern–Gerlach Experiment',
            type: 'EXPERIMENT',
            difficulty: 'Beginner',
            estimatedMinutes: 25,
            route: 'experiments.html',
            desc: 'Observe spatial spin-quantization of silver atoms in an inhomogeneous magnetic field.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------
     2. QUANTUM GATES & OPERATIONS
     ------------------------------------------------------------ */
  {
    id: 'cat-gates',
    category: 'Quantum Gates',
    icon: '⚙',
    color: '#818cf8',
    topics: [
      {
        id: 'top-pauli-gates',
        name: 'Single-Qubit Pauli & Phase Gates',
        desc: 'Pauli X, Y, Z, Hadamard, S, and T gates and their unitary matrix representations.',
        category: 'Quantum Gates',
        level: 'Beginner',
        activities: [
          {
            id: 'act-learn-gates',
            title: 'Single-Qubit Unitary Operators',
            type: 'LEARN',
            difficulty: 'Beginner',
            estimatedMinutes: 20,
            route: 'index.html#learn',
            desc: 'Master bit-flip, phase-flip, and π/4 phase rotations.'
          },
          {
            id: 'act-vlab-circuit-gates',
            title: 'Single-Qubit Gate Circuit Synthesis',
            type: 'VIRTUAL LAB',
            difficulty: 'Beginner',
            estimatedMinutes: 30,
            route: 'virtual-labs/circuit-lab.html',
            desc: 'Compose chains of Pauli and Hadamard gates and verify state outcomes.'
          }
        ]
      },
      {
        id: 'top-rotation-gates',
        name: 'Continuous Parameterized Rotations (Rx, Ry, Rz)',
        desc: 'Arbitrary angle rotations and Euler decomposition on the Bloch sphere.',
        category: 'Quantum Gates',
        level: 'Intermediate',
        activities: [
          {
            id: 'act-learn-rotations',
            title: 'Rotation Gates Theory & Math',
            type: 'LEARN',
            difficulty: 'Intermediate',
            estimatedMinutes: 20,
            route: 'index.html#learn',
            desc: 'Decompose arbitrary SU(2) unitaries into Rz(α)Ry(β)Rz(γ) sequences.'
          },
          {
            id: 'act-exp-interference',
            title: 'Mach–Zehnder Phase Interference Lab',
            type: 'EXPERIMENT',
            difficulty: 'Intermediate',
            estimatedMinutes: 25,
            route: 'experiments.html',
            desc: 'Tune optical phase shifters to observe constructive and destructive interference.'
          }
        ]
      },
      {
        id: 'top-controlled-gates',
        name: 'Multi-Qubit Entangling Gates (CNOT, CZ, SWAP)',
        desc: 'Two-qubit conditional logic, controlled operations, and entangling power.',
        category: 'Quantum Gates',
        level: 'Intermediate',
        activities: [
          {
            id: 'act-learn-cnot',
            title: 'Controlled-NOT & Entangling Gates',
            type: 'LEARN',
            difficulty: 'Intermediate',
            estimatedMinutes: 25,
            route: 'index.html#learn',
            desc: 'Understand conditional state flips and generating Bell pairs.'
          },
          {
            id: 'act-chal-bell-pair',
            title: 'Challenge: Synthesize Bell State |Φ+⟩',
            type: 'CHALLENGE',
            difficulty: 'Beginner',
            estimatedMinutes: 20,
            route: 'virtual-labs.html#challenges',
            desc: 'Use H and CNOT gates to produce a maximally entangled two-qubit state.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------
     3. QUANTUM CIRCUITS & ENTANGLEMENT
     ------------------------------------------------------------ */
  {
    id: 'cat-circuits',
    category: 'Quantum Circuits',
    icon: '🔗',
    color: '#a855f7',
    topics: [
      {
        id: 'top-circuit-lab',
        name: 'Interactive Circuit Workbench',
        desc: 'Design multi-qubit quantum circuits, apply gates, measure, and observe state evolution.',
        category: 'Quantum Circuits',
        level: 'Intermediate',
        activities: [
          {
            id: 'act-vlab-circuit-builder',
            title: 'Quantum Circuit Lab Workbench',
            type: 'VIRTUAL LAB',
            difficulty: 'Intermediate',
            estimatedMinutes: 35,
            route: 'virtual-labs/circuit-lab.html',
            desc: 'Assemble 3-qubit circuits, execute shots, and analyze state vectors.'
          }
        ]
      },
      {
        id: 'top-bell-states',
        name: 'Bell States & Quantum Correlation',
        desc: 'The four maximally entangled Bell states and non-local Einstein-Podolsky-Rosen paradox.',
        category: 'Quantum Circuits',
        level: 'Intermediate',
        activities: [
          {
            id: 'act-exp-bell-lab',
            title: 'Bell State Laboratory',
            type: 'EXPERIMENT',
            difficulty: 'Intermediate',
            estimatedMinutes: 30,
            route: 'experiments.html',
            desc: 'Verify the 4 Bell basis states and test correlated measurement outcomes.'
          },
          {
            id: 'act-exp-entanglement-chsh',
            title: 'CHSH Bell Inequality Violation',
            type: 'EXPERIMENT',
            difficulty: 'Advanced',
            estimatedMinutes: 35,
            route: 'experiments.html',
            desc: 'Measure entangled photon pairs and verify S > 2 violation of local realism.'
          }
        ]
      },
      {
        id: 'top-teleportation',
        name: 'Quantum Teleportation Protocol',
        desc: 'Transmit unknown quantum information using entanglement and classical bit exchange.',
        category: 'Quantum Circuits',
        level: 'Advanced',
        activities: [
          {
            id: 'act-exp-teleportation',
            title: 'Quantum Teleportation Experiment',
            type: 'EXPERIMENT',
            difficulty: 'Advanced',
            estimatedMinutes: 35,
            route: 'experiments.html',
            desc: 'Execute Alice’s Bell measurement and Bob’s Pauli reconstruction protocol.'
          },
          {
            id: 'act-chal-teleport',
            title: 'Challenge: Complete Teleportation Circuit',
            type: 'CHALLENGE',
            difficulty: 'Intermediate',
            estimatedMinutes: 25,
            route: 'virtual-labs.html#challenges',
            desc: 'Wire the feed-forward correction gates to reconstruct the teleported state.'
          }
        ]
      },
      {
        id: 'top-ghz-state',
        name: 'Tripartite GHZ States',
        desc: 'Greenberger-Horne-Zeilinger states and multi-qubit macroscopic entanglement.',
        category: 'Quantum Circuits',
        level: 'Advanced',
        activities: [
          {
            id: 'act-exp-ghz',
            title: 'GHZ Multi-Qubit State Experiment',
            type: 'EXPERIMENT',
            difficulty: 'Advanced',
            estimatedMinutes: 30,
            route: 'experiments.html',
            desc: 'Prepare (|000⟩ + |111⟩)/√2 and examine 3-qubit parity correlations.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------
     4. QUANTUM ALGORITHMS
     ------------------------------------------------------------ */
  {
    id: 'cat-algorithms',
    category: 'Quantum Algorithms',
    icon: '🚀',
    color: '#ec4899',
    topics: [
      {
        id: 'top-qsvm',
        name: 'Quantum Support Vector Machines (QSVM)',
        desc: 'Kernel methods in Hilbert spaces, ZZ-feature mapping, and non-linear classification.',
        category: 'Quantum Algorithms',
        level: 'Advanced',
        activities: [
          {
            id: 'act-algo-qsvm',
            title: 'QSVM Classification Experiment',
            type: 'ALGORITHM',
            difficulty: 'Advanced',
            estimatedMinutes: 35,
            route: 'algorithms/qsvm.html',
            desc: 'Compute quantum kernel Gram matrices and resolve non-linear decision boundaries.'
          }
        ]
      },
      {
        id: 'top-shor',
        name: "Shor's Integer Factorization Algorithm",
        desc: 'Polynomial-time factoring via modular exponentiation and Quantum Fourier Transform.',
        category: 'Quantum Algorithms',
        level: 'Expert',
        activities: [
          {
            id: 'act-algo-shor',
            title: "Shor's Algorithm Simulation",
            type: 'ALGORITHM',
            difficulty: 'Expert',
            estimatedMinutes: 45,
            route: 'algorithms.html',
            desc: 'Simulate order-finding circuits and extract prime factors with continued fractions.'
          }
        ]
      },
      {
        id: 'top-grover',
        name: "Grover's Unstructured Search Algorithm",
        desc: 'Quadratic quantum speedup for searching unsorted databases via phase inversion and diffusion.',
        category: 'Quantum Algorithms',
        level: 'Intermediate',
        activities: [
          {
            id: 'act-algo-grover',
            title: "Grover's Search Algorithm Experiment",
            type: 'ALGORITHM',
            difficulty: 'Intermediate',
            estimatedMinutes: 35,
            route: 'algorithms.html',
            desc: 'Step through oracle phase-flips and diffusion amplification to locate target states.'
          },
          {
            id: 'act-chal-grover',
            title: 'Challenge: 2-Qubit Grover Oracle',
            type: 'CHALLENGE',
            difficulty: 'Intermediate',
            estimatedMinutes: 25,
            route: 'virtual-labs.html#challenges',
            desc: 'Design an oracle that tags state |11⟩ and amplify its probability.'
          }
        ]
      },
      {
        id: 'top-qft-qpe',
        name: 'Quantum Fourier Transform & Phase Estimation (QFT / QPE)',
        desc: 'Mapping time-domain amplitudes to frequency spectrum and estimating unitary eigenvalues.',
        category: 'Quantum Algorithms',
        level: 'Advanced',
        activities: [
          {
            id: 'act-algo-qft',
            title: 'Quantum Fourier Transform Lab',
            type: 'ALGORITHM',
            difficulty: 'Advanced',
            estimatedMinutes: 35,
            route: 'algorithms.html',
            desc: 'Build controlled-phase rotation networks and invert periodic quantum states.'
          },
          {
            id: 'act-algo-qpe',
            title: 'Quantum Phase Estimation (QPE)',
            type: 'ALGORITHM',
            difficulty: 'Advanced',
            estimatedMinutes: 40,
            route: 'algorithms.html',
            desc: 'Estimate the eigenphase of a unitary operator with arbitrary precision.'
          }
        ]
      },
      {
        id: 'top-variational',
        name: 'Variational Quantum Algorithms (VQE & QAOA)',
        desc: 'NISQ-era hybrid quantum-classical algorithms for ground-state chemistry and optimization.',
        category: 'Quantum Algorithms',
        level: 'Advanced',
        activities: [
          {
            id: 'act-algo-vqe',
            title: 'Variational Quantum Eigensolver (VQE)',
            type: 'ALGORITHM',
            difficulty: 'Advanced',
            estimatedMinutes: 40,
            route: 'algorithms.html',
            desc: 'Minimize Hamiltonian expectation values using parameterized ansatz circuits.'
          },
          {
            id: 'act-algo-qaoa',
            title: 'Quantum Approximate Optimization (QAOA)',
            type: 'ALGORITHM',
            difficulty: 'Advanced',
            estimatedMinutes: 40,
            route: 'algorithms.html',
            desc: 'Solve combinatorial Max-Cut problems by alternating cost and mixer Hamiltonians.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------
     5. QUANTUM NOISE, DECOHERENCE & HARDWARE
     ------------------------------------------------------------ */
  {
    id: 'cat-noise-hardware',
    category: 'Noise & Hardware',
    icon: '📡',
    color: '#f59e0b',
    topics: [
      {
        id: 'top-noise-channels',
        name: 'Quantum Noise Channels & Error Models',
        desc: 'Bit flip, phase flip, depolarizing, and amplitude damping open quantum system dynamics.',
        category: 'Noise & Hardware',
        level: 'Intermediate',
        activities: [
          {
            id: 'act-vlab-noise',
            title: 'Quantum Noise & Decoherence Lab',
            type: 'VIRTUAL LAB',
            difficulty: 'Intermediate',
            estimatedMinutes: 35,
            route: 'virtual-labs/noise-lab.html',
            desc: 'Inject Kraus noise channels and observe Bloch vector contraction & purity decay.'
          },
          {
            id: 'act-exp-quantum-noise',
            title: 'Quantum Noise Channels Experiment',
            type: 'EXPERIMENT',
            difficulty: 'Intermediate',
            estimatedMinutes: 30,
            route: 'experiments.html',
            desc: 'Study density matrix off-diagonal decay under stochastic thermal noise.'
          },
          {
            id: 'act-chal-noise-mitigation',
            title: 'Challenge: Noise Mitigation Repetition Code',
            type: 'CHALLENGE',
            difficulty: 'Advanced',
            estimatedMinutes: 30,
            route: 'virtual-labs.html#challenges',
            desc: 'Protect quantum states against bit flips using a 3-qubit repetition code.'
          }
        ]
      },
      {
        id: 'top-hardware-topologies',
        name: 'Superconducting Quantum Hardware Topologies',
        desc: 'Transmon qubits, coupling graphs, connectivity constraints, and cross-resonance gates.',
        category: 'Noise & Hardware',
        level: 'Advanced',
        activities: [
          {
            id: 'act-hardware-explorer',
            title: 'Quantum Hardware Architecture Simulator',
            type: 'EXPERIMENT',
            difficulty: 'Advanced',
            estimatedMinutes: 30,
            route: 'hardware.html',
            desc: 'Analyze heavy-hex topologies, coherence times T1/T2, and readout error rates.'
          }
        ]
      }
    ]
  }
];

/* Helper: Flatten all activities across all topics */
QL.getAllActivities = function() {
  const list = [];
  QL.progressTopicsRegistry.forEach(cat => {
    cat.topics.forEach(t => {
      t.activities.forEach(a => {
        list.push({ ...a, topicId: t.id, topicName: t.name, category: t.category });
      });
    });
  });
  return list;
};

/* Helper: Find topic by ID */
QL.findTopicById = function(id) {
  for (const cat of QL.progressTopicsRegistry) {
    for (const t of cat.topics) {
      if (t.id === id) return t;
    }
  }
  return null;
};
