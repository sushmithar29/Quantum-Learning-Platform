/* ============================================================
   QUANTUMLAB – DATA
   All mock data for experiments, labs, algorithms, learn, challenges
   ============================================================ */

window.QL = window.QL || {};

QL.data = {

  experiments: [
    {
      id: 'stern-gerlach',
      name: 'Stern–Gerlach Experiment',
      desc: 'Observe spatial spin-quantization as silver atoms pass through an inhomogeneous magnetic field.',
      level: 'Beginner',
      color: '#059669',
      animType: 'split',
      circuit: ['Ag atoms ──[B_z field]──[Det Z]'],
      timeline: ['Particle Source', 'Field Entrance', 'Magnetic Deflection', 'Detector Impact', 'Quantization Result'],
      guidedSteps: [
        'Select the Z measurement axis to establish the quantization direction.',
        'Increase the Magnetic Field Gradient to visually amplify trajectory separation.',
        'Click "Run Experiment" to fire the particle beam through the apparatus.',
        'Observe the beam split into two discrete spots: Spin Up (|↑⟩) and Spin Down (|↓⟩).'
      ],
      defaultParams: {
        fieldStrength: 1.2,
        fieldGradient: 75,
        shots: 1000,
        axis: 'Z',
        spinPrep: 'Random',
        beamIntensity: 80
      },
      explanation: 'The Stern–Gerlach experiment proved that quantum angular momentum is quantized. Silver atoms deflect in discrete, distinct trajectories rather than a continuous classical spread.'
    },
    {
      id: 'bell-state',
      name: 'Bell State Laboratory',
      desc: 'Create maximally entangled two-qubit states and verify quantum correlation and non-local entanglement.',
      level: 'Beginner',
      color: '#7c3aed',
      animType: 'entangle',
      circuit: ['q0 ──[H]───●────[M]', 'q1 ──────[X]────[M]'],
      timeline: ['Init |00⟩', 'Hadamard on q0', 'CNOT(q0, q1)', 'Entangled Pair', 'Measurement'],
      guidedSteps: [
        'Select the target Bell state: |Φ+⟩ = (|00⟩ + |11⟩)/√2.',
        'Adjust the Noise slider to see how environmental disruption reduces correlation.',
        'Click "Run Experiment" to execute the quantum circuit.',
        'Examine the correlated outcomes: measuring q0 instantly determines q1.'
      ],
      defaultParams: {
        bellType: 'phi_plus',
        shots: 1024,
        noise: 0
      },
      explanation: 'In a Bell state, two qubits are entangled such that neither has a definite state on its own, yet their joint measurement outcomes are strictly correlated.'
    },
    {
      id: 'cavity-qed',
      name: 'Cavity QED Laboratory',
      desc: 'Explore strong coupling, vacuum Rabi oscillations, and coherent energy exchange between an atom and cavity photons.',
      level: 'Advanced',
      color: '#06b6d4',
      animType: 'wave',
      circuit: ['Atom ──[JC Coupling]──[M]', 'Cavity ──[Field Mode]──[Det]'],
      timeline: ['Cavity Tuning', 'Atom Injection', 'Jaynes-Cummings Rabi', 'Energy Exchange', 'Field Readout'],
      guidedSteps: [
        'Match Cavity Frequency and Atom Frequency to achieve resonant coupling (Δ = 0).',
        'Increase Coupling Strength (g) to accelerate the vacuum Rabi oscillation rate.',
        'Run the experiment to watch the photon wavepacket bounce and exchange energy with the atom.',
        'Analyze the alternating ground |g⟩ and excited |e⟩ state probabilities.'
      ],
      defaultParams: {
        cavityFreq: 5.0,
        atomFreq: 5.0,
        coupling: 1.5,
        photonCount: 1
      },
      explanation: 'Cavity Quantum Electrodynamics (QED) investigates light-matter interaction at the single-photon and single-atom level, where reversible quantum Rabi oscillations occur.'
    },
    {
      id: 'superposition',
      name: 'Quantum Superposition Lab',
      desc: 'Manipulate single-qubit quantum states on the 3D Bloch sphere using single-qubit quantum logic gates.',
      level: 'Beginner',
      color: '#a78bfa',
      animType: 'bloch',
      circuit: ['q0 ──|0⟩──[Gate]──[Collapse]'],
      timeline: ['Initialize |0⟩', 'Select Gate', 'Unitary Rotation', 'Superposition State', 'Projective Measure'],
      guidedSteps: [
        'Start with the base ground state |0⟩ at the north pole.',
        'Click the Hadamard (H) gate to rotate into the equal superposition state |+⟩ on the equator.',
        'Use the angle sliders to inspect arbitrary rotations around the Bloch sphere.',
        'Trigger measurement shots to verify that |+⟩ collapses to 0 and 1 with equal 50% probability.'
      ],
      defaultParams: {
        currentGate: 'H',
        theta: 90,
        phi: 0,
        shots: 500
      },
      explanation: 'Superposition allows a quantum system to exist simultaneously in a linear combination of basis states until measurement forces collapse to an eigenvalue.'
    },
    {
      id: 'entanglement',
      name: 'Quantum Entanglement & CHSH',
      desc: 'Test Bell inequality violation (CHSH) using polarized entangled photon pairs and spatial detectors.',
      level: 'Intermediate',
      color: '#e11d48',
      animType: 'entangle',
      circuit: ['Source ──(e-pair)── Alice(θ_A) & Bob(θ_B)'],
      timeline: ['Laser Pump', 'SPDC Crystal', 'Polarizer Selection', 'Coincidence Counter', 'Bell Inequality Check'],
      guidedSteps: [
        'Set Alice polarizer angle to 0° and Bob polarizer angle to 22.5° (the optimal CHSH angle).',
        'Run the experiment to fire 1000 entangled photon pairs.',
        'Observe the calculated Bell parameter S exceeding the classical limit of 2 (approaching 2.828).',
        'Experiment with parallel polarizers to see 100% anti-correlation.'
      ],
      defaultParams: {
        aliceAngle: 0,
        bobAngle: 22.5,
        state: 'singlet',
        shots: 1000
      },
      explanation: 'Bell test experiments rule out local hidden-variable theories. The correlation between entangled particles is stronger than any classical physics allows.'
    },
    {
      id: 'ghz-state',
      name: 'GHZ Multi-Qubit State',
      desc: 'Investigate tripartite Greenberger-Horne-Zeilinger entanglement across three interconnected qubits.',
      level: 'Intermediate',
      color: '#d97706',
      animType: 'triple',
      circuit: ['q0 ──[H]──●──────[M]', 'q1 ────[X]──●───[M]', 'q2 ──────[X]────[M]'],
      timeline: ['Init |000⟩', 'Hadamard q0', 'Entangle q1', 'Entangle q2', 'Tripartite Measure'],
      guidedSteps: [
        'Set qubit count to 3 to prepare the state (|000⟩ + |111⟩)/√2.',
        'Choose the measurement basis (Computational Z vs Equator X).',
        'Run the experiment and observe that partial measurements are completely random, but 3-qubit parity is strictly deterministic.'
      ],
      defaultParams: {
        qubitCount: 3,
        basis: 'Z',
        shots: 1024,
        noise: 0
      },
      explanation: 'The GHZ state demonstrates quantum non-locality with just single-shot measurements, without requiring statistical inequalities like the 2-qubit Bell test.'
    },
    {
      id: 'interference',
      name: 'Mach–Zehnder Interference',
      desc: 'Observe single-photon wave-particle duality and phase-dependent constructive/destructive interference fringes.',
      level: 'Beginner',
      color: '#0891b2',
      animType: 'interference',
      circuit: ['Source ──[BS1]──(Phase φ)──[BS2]── Detectors'],
      timeline: ['Photon Emission', 'Beam Splitter 1', 'Phase Shifter', 'Recombination at BS2', 'Detector Fringes'],
      guidedSteps: [
        'Set the Phase Shift slider to 0°: observe 100% constructive interference at Detector 1.',
        'Slide the Phase Shift to 180° (π radians): observe destructive interference at D1 and 100% signal at Detector 2.',
        'Notice how individual photons interfere with themselves, exhibiting wave-particle duality.'
      ],
      defaultParams: {
        phaseDeg: 90,
        pathDiff: 0,
        splitRatio: 50,
        shots: 800
      },
      explanation: 'In a Mach-Zehnder interferometer, probability amplitudes along both paths add coherently. Tuning the optical phase allows full control over detection probabilities.'
    },
    {
      id: 'teleportation',
      name: 'Quantum Teleportation Protocol',
      desc: 'Transfer an unknown quantum state from Alice to Bob using an EPR entangled pair and two classical bits.',
      level: 'Advanced',
      color: '#8b5cf6',
      animType: 'teleport',
      circuit: ['q_Alice(ψ) ──●──[H]──[M1]', 'q_EPR_A  ──[X]──────[M2]', 'q_Bob    ───────────────[X^M2][Z^M1]──[ψ]'],
      timeline: ['1. Prepare State |ψ⟩', '2. Generate EPR Pair', '3. Bell Measurement', '4. Classical Bit Transfer', '5. Unitary Reconstruction'],
      guidedSteps: [
        'Prepare the unknown state |ψ⟩ using the Bloch sphere angles.',
        'Step through the protocol using the Next Step controls.',
        'Watch Alice perform a Bell State Measurement, collapsing her qubits.',
        'Watch the two classical bits travel across to Bob.',
        'Observe Bob apply the appropriate Pauli correction to recover |ψ⟩ with 100% fidelity.'
      ],
      defaultParams: {
        inputTheta: 65,
        inputPhi: 40,
        autoPlay: false,
        currentStep: 1
      },
      explanation: 'Quantum teleportation transfers quantum information using entanglement and classical communication without moving the physical particle itself, respecting the no-cloning theorem.'
    },
    {
      id: 'measurement',
      name: 'Quantum Measurement & Collapse',
      desc: 'Experiment with projective vs weak measurements, basis rotations, and stochastic wavefunction collapse.',
      level: 'Beginner',
      color: '#10b981',
      animType: 'bloch',
      circuit: ['|ψ⟩ ──[Projection onto Basis]── [Collapse to Eigenstate]'],
      timeline: ['Prepare |ψ⟩', 'Orient Basis', 'Measurement Interaction', 'Projection', 'Collapse & Tally'],
      guidedSteps: [
        'Prepare a superposition state |ψ⟩ away from the poles.',
        'Select the measurement basis: Z-basis (|0⟩/|1⟩), X-basis (|+⟩/|-⟩), or Y-basis (|+i⟩/|-i⟩).',
        'Run the experiment to watch the state vector collapse probabilistically onto an eigenstate.',
        'Compare single-shot collapse with ensemble probability histograms.'
      ],
      defaultParams: {
        basis: 'Z',
        theta: 45,
        phi: 30,
        strength: 'Projective',
        shots: 500
      },
      explanation: 'According to the Born rule, measurement forces a continuous quantum state to collapse onto one of the eigenstates of the measurement operator.'
    },
    {
      id: 'quantum-noise',
      name: 'Quantum Noise Channels',
      desc: 'Examine how Bit Flip, Phase Flip, Depolarizing, and Amplitude Damping channels degrade quantum state purity.',
      level: 'Intermediate',
      color: '#f43f5e',
      animType: 'bloch',
      circuit: ['|ψ⟩ ──[Noisy Quantum Channel]── ρ (Mixed State)'],
      timeline: ['Pure State Preparation', 'Channel Exposure', 'Stochastic Noise', 'Decoherence', 'Purity & Density Matrix'],
      guidedSteps: [
        'Start with a pure state on the surface of the Bloch sphere (Purity = 100%).',
        'Select a noise model (e.g. Depolarizing or Amplitude Damping).',
        'Increase Error Rate p from 0.0 to 0.7.',
        'Watch the Bloch vector shrink toward the interior of the sphere as purity decreases.'
      ],
      defaultParams: {
        channel: 'depolarizing',
        errorRate: 0.35,
        shots: 1000
      },
      explanation: 'Quantum noise causes pure states to become mixed states (density matrices). As the state decoheres, quantum coherence is lost to the environment.'
    },
    {
      id: 'decoherence',
      name: 'Quantum Decoherence Lab',
      desc: 'Simulate the transition from quantum superposition to classical mixture through environmental bath interactions.',
      level: 'Advanced',
      color: '#6366f1',
      animType: 'wave',
      circuit: ['Quantum System ──[Thermal Bath Interaction]── Classical Mixture'],
      timeline: ['Coherent Superposition', 'Bath Coupling', 'Phase Randomization', 'Off-Diagonal Decay', 'Classical State'],
      guidedSteps: [
        'Set the initial state in a coherent superposition |+⟩.',
        'Increase the Environmental Coupling / Temperature slider.',
        'Run the experiment to watch environmental particles interact with the qubit.',
        'Observe the off-diagonal density matrix terms ρ_01 decay exponentially, eliminating quantum interference.'
      ],
      defaultParams: {
        decayRate: 0.5,
        bathTemp: 40,
        interactionTime: 2.0
      },
      explanation: 'Decoherence explains how the classical macroscopic world emerges from quantum mechanics without requiring instantaneous collapse.'
    },
    {
      id: 'superposition-interference',
      name: 'Superposition & Interference Lab',
      desc: 'Construct a complete two-stage quantum algorithm: create superposition, rotate phase, interfere, and measure.',
      level: 'Intermediate',
      color: '#14b8a6',
      animType: 'interference',
      circuit: ['|0⟩ ──[H]──(Phase θ)──[H]──[Measure Outcome]'],
      timeline: ['Initialize |0⟩', 'Stage 1: Hadamard', 'Stage 2: Relative Phase R_z', 'Stage 3: Hadamard Interference', 'Stage 4: Measurement'],
      guidedSteps: [
        'Observe the initial Hadamard gate create an equal superposition.',
        'Adjust the Phase Angle θ between 0° and 360°.',
        'The second Hadamard gate converts the relative phase into detectable probability amplitudes.',
        'Verify that at θ=0° the output is deterministically |0⟩, while at θ=180° it is 100% |1⟩.'
      ],
      defaultParams: {
        phaseAngle: 120,
        shots: 1000
      },
      explanation: 'All quantum algorithms, including Grover search and Shor algorithm, exploit this fundamental cycle: superposition creates parallel paths, relative phases are applied, and interference filters the answer.'
    }
  ],

  labs: [
    {
      id: 'circuit-lab',
      name: 'Quantum Circuit Lab',
      desc: 'Build quantum circuits by dragging gates. Add qubits, connect gates, and run simulations to see the quantum state evolve.',
      tags: ['Gates', 'Qubits', 'Simulation', 'State Vector'],
      color: '#7c3aed',
      type: 'circuit'
    },
    {
      id: 'bloch-sphere',
      name: 'Bloch Sphere Lab',
      desc: 'Interactively rotate a qubit on the Bloch sphere. Apply gates and watch the quantum state move in 3D.',
      tags: ['Rotation', 'Visualization', '3D', 'Gates'],
      color: '#06b6d4',
      type: 'bloch'
    },
    {
      id: 'measurement-lab',
      name: 'Quantum Measurement Lab',
      desc: 'Experiment with measurement basis and observe state collapse. Choose shots and see probability distributions emerge.',
      tags: ['Measurement', 'Statistics', 'Probability', 'Collapse'],
      color: '#059669',
      type: 'measurement'
    },
    {
      id: 'noise-lab',
      name: 'Quantum Noise Lab',
      desc: 'Add different types of noise and observe their effect on the quantum state. Compare noisy vs ideal evolution.',
      tags: ['Noise', 'Decoherence', 'Error', 'Fidelity'],
      color: '#e11d48',
      type: 'noise'
    },
    {
      id: 'state-lab',
      name: 'Quantum State Lab',
      desc: 'Explore arbitrary qubit states. Adjust amplitudes and phases, see the Bloch sphere, state vector, and probabilities update in real time.',
      tags: ['State Vector', 'Amplitudes', 'Phases', 'Bloch Sphere'],
      color: '#d97706',
      type: 'state'
    }
  ],

  algorithms: [
    {
      id: 'deutsch-jozsa',
      name: 'Deutsch–Jozsa',
      desc: 'Determines if a black-box function is constant or balanced in one query using quantum interference.',
      level: 'Intermediate',
      circuit: ['q0 ──[H]──[Uf]──[H]──[M]', 'q1 ──[X]──[H]──[Uf]──────'],
      steps: ['Init |0...0⟩', 'Hadamard Layer', 'Oracle Evaluation', 'Interference', 'Measure'],
      color: '#7c3aed'
    },
    {
      id: 'bernstein-vazirani',
      name: 'Bernstein–Vazirani',
      desc: 'Reconstruct a hidden n-bit binary string s in a single quantum query instead of n classical queries.',
      level: 'Intermediate',
      circuit: ['q0 ──[H]──[Us]──[H]──[M]', 'anc ─[X]─[H]─[Us]────────'],
      steps: ['Init Register & Ancilla', 'Superposition', 'Inner Product Oracle', 'Hadamard Inversion', 'Direct Readout'],
      color: '#06b6d4'
    },
    {
      id: 'grover',
      name: "Grover's Search",
      desc: 'Search an unsorted database of N items in O(√N) queries — provably optimal quadratic speedup.',
      level: 'Intermediate',
      circuit: ['q0 ──[H]──[Rw]──[D]──[M]', 'q1 ──[H]──[Rw]──[D]──[M]'],
      steps: ['Superposition', 'Oracle Phase Inversion', 'Grover Diffusion', 'Amplify Amplitude', 'Measure Target'],
      color: '#059669'
    },
    {
      id: 'qft',
      name: 'Quantum Fourier Transform',
      desc: 'Transforms states into frequency space in O(n²) operations instead of O(n 2ⁿ) classical FFT.',
      level: 'Advanced',
      circuit: ['q0 ──[H]──[R2]──[R3]──[SWAP]', 'q1 ────────[H]──[R2]────|───'],
      steps: ['Init State', 'Hadamard & Controlled-R', 'Cascading Phases', 'Bit-Reversal SWAPs', 'Frequency Readout'],
      color: '#a78bfa'
    },
    {
      id: 'qaoa',
      name: 'QAOA',
      desc: 'Quantum Approximate Optimization Algorithm for solving combinatorial problems like MaxCut.',
      level: 'Advanced',
      circuit: ['q0 ──[H]──[e^(-iγ H_C)]──[e^(-iβ H_M)]──[M]', 'q1 ──[H]──[e^(-iγ H_C)]──[e^(-iβ H_M)]──[M]'],
      steps: ['Initial Superposition', 'Problem Unitary (γ)', 'Transverse Mixer (β)', 'Classical Optimizer', 'Optimal Cut'],
      color: '#d97706'
    },
    {
      id: 'quantum-annealing',
      name: 'Quantum Annealing',
      desc: 'Find global energy minima by tunneling through high, narrow potential barriers in Ising spin systems.',
      level: 'Intermediate',
      circuit: ['H(t) = A(t) H_driver + B(t) H_problem', 'Transverse Driver ➔ Problem Ising'],
      steps: ['Transverse Driver Field', 'Adiabatic Schedule', 'Quantum Tunneling', 'Avoided Crossing', 'Ground State Readout'],
      color: '#e11d48'
    },
    {
      id: 'qsvm',
      name: 'Quantum SVM',
      desc: 'Perform non-linear classification using quantum Hilbert space feature maps and quantum kernels.',
      level: 'Advanced',
      circuit: ['q0 ──[H]──[U_Φ(x1)]──[ Kernel K_ij ]──[M]', 'q1 ──[H]──[U_Φ(x2)]──[ |⟨Φ(x)|Φ(x\')⟩|² ]──[M]'],
      steps: ['Data Encoding', 'Quantum Feature Map', 'Kernel Evaluation', 'Dual SVM Optimization', 'Classify Points'],
      color: '#0891b2'
    },
    {
      id: 'quantum-kernel-alignment',
      name: 'Kernel Alignment (QKA)',
      desc: 'Adapt parameterized quantum kernels to maximize mathematical alignment with training labels.',
      level: 'Advanced',
      circuit: ['q0 ──[H]──[U_Φ(x, θ)]──[ Alignment A(K_θ, Y) ]──[M]'],
      steps: ['Parameterized Map', 'Compute Kernel K_θ', 'Target Matrix Y', 'Frobenius Alignment', 'Gradient Ascent'],
      color: '#8b5cf6'
    },
    {
      id: 'vqc',
      name: 'Variational Classifier (VQC)',
      desc: 'End-to-end quantum neural classifier trained via Parameter-Shift Rule gradient descent.',
      level: 'Intermediate',
      circuit: ['q0 ──[S(x)]──[Ry(θ0)]──●────[Ry(θ2)]──[M (⟨Z⟩)]', 'q1 ──[S(x)]──[Ry(θ1)]──X────[Ry(θ3)]──────────'],
      steps: ['Feature Encoding S(x)', 'Variational Ansatz W(θ)', 'Expectation ⟨Z⟩', 'Loss Function', 'Parameter Shift Update'],
      color: '#ec4899'
    },
    {
      id: 'qnn',
      name: 'Quantum Neural Networks',
      desc: 'Layered quantum neural architecture with parameterized entangling blocks and pooling.',
      level: 'Advanced',
      circuit: ['Input Layer ➔ Quantum Convolution ➔ Quantum Pooling ➔ Measurement'],
      steps: ['State Encoding', 'Convolutional Filter', 'Entanglement Layer', 'Hierarchical Pooling', 'Softmax Readout'],
      color: '#6366f1'
    },
    {
      id: 'qpe',
      name: 'Phase Estimation (QPE)',
      desc: 'Estimate the unknown eigenphase of a unitary operator with exponential precision using inverse QFT.',
      level: 'Advanced',
      circuit: ['Counting Qubits ──[H]──[C-U^(2^j)]──[QFT†]──[M]', 'Eigenstate |u⟩   ────────[C-U^(2^j)]──────────'],
      steps: ['Eigenstate Preparation', 'Counting Hadamards', 'Controlled-U Powers', 'Inverse QFT', 'Phase Readout'],
      color: '#06b6d4'
    },
    {
      id: 'vqe',
      name: 'Variational Eigensolver (VQE)',
      desc: 'Compute ground-state energies of molecular systems using hybrid quantum-classical feedback.',
      level: 'Advanced',
      circuit: ['q0 ──[Ry(θ1)]──●────[M]', 'q1 ──[Ry(θ2)]──[X]──[M]'],
      steps: ['Hamiltonian Mapping', 'Ansatz State Prep', 'Energy Expectation', 'Classical Optimization', 'Chemical Accuracy'],
      color: '#10b981'
    }
  ],

  learn: [
    {
      id: 'fundamentals',
      name: 'Fundamentals',
      icon: '⚛',
      iconClass: 'cat-icon--fundamentals',
      dotClass: 'dot--violet',
      topics: [
        { id: 'qubits', name: 'Qubits', desc: 'The basic unit of quantum information.' },
        { id: 'quantum-states', name: 'Quantum States', desc: 'What defines the state of a quantum system.' },
        { id: 'superposition', name: 'Superposition', desc: 'Existing in multiple states simultaneously.' },
        { id: 'measurement', name: 'Measurement', desc: 'How measurement collapses quantum states.' }
      ]
    },
    {
      id: 'operations',
      name: 'Quantum Operations',
      icon: '⚙',
      iconClass: 'cat-icon--operations',
      dotClass: 'dot--cyan',
      topics: [
        { id: 'gates', name: 'Quantum Gates', desc: 'Operations that transform qubit states.' },
        { id: 'circuits', name: 'Quantum Circuits', desc: 'Sequences of gates to compute.' },
        { id: 'rotation-gates', name: 'Rotation Gates', desc: 'Rx, Ry, Rz rotations on the Bloch sphere.' },
        { id: 'controlled-gates', name: 'Controlled Gates', desc: 'CNOT and multi-qubit conditional gates.' }
      ]
    },
    {
      id: 'concepts',
      name: 'Quantum Concepts',
      icon: '🔗',
      iconClass: 'cat-icon--concepts',
      dotClass: 'dot--teal',
      topics: [
        { id: 'entanglement', name: 'Entanglement', desc: 'Non-classical correlations between qubits.' },
        { id: 'interference', name: 'Interference', desc: 'Amplitudes adding and cancelling.' },
        { id: 'teleportation-concept', name: 'Quantum Teleportation', desc: 'Moving quantum states without moving particles.' },
        { id: 'noise', name: 'Quantum Noise', desc: 'Decoherence and error in real quantum systems.' }
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Topics',
      icon: '🚀',
      iconClass: 'cat-icon--advanced',
      dotClass: 'dot--amber',
      topics: [
        { id: 'algorithms-learn', name: 'Quantum Algorithms', desc: 'Grover, Shor, QFT and more.' },
        { id: 'error-correction', name: 'Quantum Error Correction', desc: 'Protecting quantum info from noise.' },
        { id: 'variational', name: 'Variational Quantum Computing', desc: 'NISQ-era hybrid algorithms.' },
        { id: 'optimization', name: 'Quantum Optimization', desc: 'Solving combinatorial problems with QAOA.' }
      ]
    }
  ],

  challenges: [
    {
      id: 'chal-bell',
      num: '01',
      icon: '🔗',
      name: 'Create a Bell State',
      desc: 'Build a two-qubit circuit that creates a maximally entangled Bell state |Φ+⟩.',
      level: 'Beginner',
      hint: 'Use an H gate on q0, then a CNOT with q0 as control and q1 as target.',
      labId: 'circuit-lab'
    },
    {
      id: 'chal-superposition',
      num: '02',
      icon: '〰',
      name: 'Create Superposition',
      desc: 'Place a qubit in equal superposition and verify by observing the 50/50 measurement distribution.',
      level: 'Beginner',
      hint: 'A single Hadamard gate on |0⟩ creates an equal superposition.',
      labId: 'circuit-lab'
    },
    {
      id: 'chal-teleport',
      num: '03',
      icon: '✦',
      name: 'Quantum Teleportation',
      desc: 'Complete the three-qubit teleportation circuit to transfer a quantum state.',
      level: 'Intermediate',
      hint: 'Create a Bell pair, perform a Bell measurement on sender qubits, then apply X/Z corrections.',
      labId: 'circuit-lab'
    },
    {
      id: 'chal-grover',
      num: '04',
      icon: '🔍',
      name: 'Grover Challenge',
      desc: "Implement Grover's oracle to find the marked state |11⟩ in a 2-qubit search space.",
      level: 'Intermediate',
      hint: 'Apply the oracle that flips the phase of |11⟩, then apply the diffusion operator.',
      labId: 'circuit-lab'
    },
    {
      id: 'chal-noise',
      num: '05',
      icon: '📡',
      name: 'Noise Challenge',
      desc: 'Reduce the effect of bit-flip noise using a simple repetition code on your circuit.',
      level: 'Advanced',
      hint: 'Encode |ψ⟩ across 3 qubits and use majority vote to correct single bit flips.',
      labId: 'noise-lab'
    }
  ],

  lessonContent: {
    qubits: {
      title: 'Qubits',
      steps: [
        {
          title: 'What is a Qubit?',
          body: 'A qubit is the fundamental unit of quantum information. Unlike a classical bit (0 or 1), a qubit can exist in a superposition of both states simultaneously.',
          viz: '|ψ⟩ = α|0⟩ + β|1⟩'
        },
        {
          title: 'Qubit Basis States',
          body: 'The computational basis consists of |0⟩ and |1⟩, corresponding to the "north" and "south" poles of the Bloch sphere.',
          viz: '|0⟩ = [1, 0]ᵀ    |1⟩ = [0, 1]ᵀ'
        },
        {
          title: 'Bloch Sphere Representation',
          body: 'Any pure qubit state can be visualized as a point on the unit sphere. Longitude encodes phase, latitude encodes amplitude ratio.',
          viz: 'bloch'
        },
        {
          title: 'Measurement',
          body: 'Measuring a qubit in superposition collapses it: you get 0 with probability |α|² and 1 with probability |β|².',
          viz: 'P(0) = |α|²,   P(1) = |β|²,   |α|²+|β|²=1'
        }
      ]
    },
    superposition: {
      title: 'Superposition',
      steps: [
        {
          title: 'Classical vs Quantum Bits',
          body: 'A classical bit is always 0 or 1. A qubit in superposition is genuinely in both states at once — not just "unknown".',
          viz: 'Classical: 0 or 1\nQuantum:   α|0⟩ + β|1⟩'
        },
        {
          title: 'The Hadamard Gate',
          body: 'The H gate creates equal superposition from a basis state. Apply H to |0⟩ and you get |+⟩ with equal 0 and 1 probability.',
          viz: '|0⟩ ──[H]──▶ |+⟩ = (|0⟩+|1⟩)/√2'
        },
        {
          title: 'Interference',
          body: 'Superposition enables quantum interference. Applying H twice: |0⟩ → |+⟩ → |0⟩. The amplitudes interfere constructively to return to |0⟩.',
          viz: '|0⟩ ──[H]──[H]──▶ |0⟩  (100%)'
        },
        {
          title: 'Mini Challenge',
          body: 'Apply H gate to |0⟩, measure 100 times, and verify you get approximately 50 zeros and 50 ones.',
          viz: 'challenge'
        }
      ]
    },
    entanglement: {
      title: 'Entanglement',
      steps: [
        {
          title: 'What is Entanglement?',
          body: 'When two qubits become entangled, they can no longer be described independently. Measuring one instantly determines the other.',
          viz: '|Φ+⟩ = (|00⟩+|11⟩)/√2'
        },
        {
          title: 'Creating Entanglement',
          body: 'Apply H to q0, then CNOT with q0 as control. This creates the Bell state — the simplest entangled state.',
          viz: 'q0 ──[H]──●──\nq1 ────[X]──'
        },
        {
          title: 'Einstein\'s Objection',
          body: '"Spooky action at a distance" bothered Einstein. But Bell\'s theorem and experiments proved entanglement is real — not hidden variables.',
          viz: '|result on q0| → instant |result on q1|'
        },
        {
          title: 'No Faster-Than-Light Communication',
          body: 'Despite the correlation, entanglement cannot transmit information faster than light — the results are random, you need classical comm to compare.',
          viz: 'challenge'
        }
      ]
    }
  },

  aiResponses: {
    default: [
      "That's a great quantum question! In superposition, a qubit exists in multiple states simultaneously — only measurement forces it to choose.",
      "Quantum entanglement means two particles share a quantum state. Measuring one immediately determines the other, regardless of distance.",
      "The Hadamard gate (H) creates a superposition by rotating the qubit 90° on the Bloch sphere, mapping |0⟩ to |+⟩ = (|0⟩+|1⟩)/√2.",
      "Quantum interference is what makes algorithms like Grover's work — we amplify correct answers and cancel wrong ones using wave-like addition of amplitudes.",
      "Decoherence is when a quantum system interacts with the environment and loses its quantum properties. It's the main challenge in building practical quantum computers.",
      "The CNOT gate is a controlled-NOT: it flips the target qubit (q1) only when the control qubit (q0) is |1⟩. It's essential for creating entanglement.",
      "Measurement in quantum mechanics is irreversible — once you observe a quantum state, it collapses to a definite classical value. This is the measurement problem.",
      "Quantum advantage refers to solving problems faster on a quantum computer than any classical computer. Shor's algorithm for factoring is the famous example."
    ]
  }
};
