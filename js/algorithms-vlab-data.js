/* ============================================================
   QUANTUMLAB – 15 QUANTUM ALGORITHM EXPERIMENTS DATA REPOSITORY
   Virtual Labs Architecture: Aim, Theory, Pretest, Procedure,
   Simulation Config, Results, Posttest, References
   ============================================================ */

window.QL = window.QL || {};

QL.algorithmsVLabData = [
  /* ------------------------------------------------------------
     1. QUANTUM SUPPORT VECTOR MACHINES (QSVM)
     ------------------------------------------------------------ */
  {
    id: 'qsvm',
    slug: 'qsvm',
    number: '01',
    title: 'Quantum Support Vector Machines (QSVM)',
    shortTitle: 'QSVM',
    category: 'Quantum Machine Learning',
    difficulty: 'Advanced',
    time: '35 min',
    aim: 'To understand and execute binary classification of non-linearly separable data using a quantum feature map and Quantum Support Vector Machine (QSVM), computing the quantum kernel matrix and evaluating decision boundary accuracy against classical linear SVM.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. Problem Formulation & Motivation</h3>
        <p>Support Vector Machines (SVMs) are supervised learning models that seek an optimal separating hyperplane maximizing the geometric margin between two classes. When data is not linearly separable in the original input space $\\mathcal{X} \\subset \\mathbb{R}^d$, classical methods map inputs to a higher-dimensional reproducing kernel Hilbert space (RKHS) via a feature map $\\phi(x)$, computing inner products through a kernel function $K(x, x') = \\langle \\phi(x), \\phi(x') \\rangle$.</p>
        <p>However, classical kernels are constrained by computational tractability: calculating kernels in exponentially large feature spaces is often intractable or computationally expensive. Quantum Support Vector Machines leverage quantum state spaces—whose dimensionality grows exponentially with the number of qubits ($2^n$ for $n$ qubits)—to represent complex non-linear feature maps efficiently.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Quantum Feature Mapping & Quantum Kernel</h3>
        <p>A quantum feature map $\\mathcal{U}_{\\Phi}(x)$ transforms classical vector $x \\in \\mathbb{R}^d$ into a quantum state $|\\Phi(x)\\rangle$:</p>
        <div class="vlab-math-block">
          |\\Phi(x)\\rangle = \\mathcal{U}_{\\Phi}(x) |0\\rangle^{\\otimes n}
        </div>
        <p>The quantum kernel $K_{ij}$ evaluates the transition amplitude (fidelity) between states corresponding to training samples $x_i$ and $x_j$:</p>
        <div class="vlab-math-block">
          K(x_i, x_j) = |\\langle \\Phi(x_i) | \\Phi(x_j) \\rangle|^2 = |\\langle 0^{\\otimes n} | \\mathcal{U}_{\\Phi}^\\dagger(x_j) \\mathcal{U}_{\\Phi}(x_i) | 0^{\\otimes n} \\rangle|^2
        </div>
        <p>This fidelity is measured directly on quantum hardware by preparing the circuit $\\mathcal{U}_{\\Phi}^\\dagger(x_j) \\mathcal{U}_{\\Phi}(x_i)$ and measuring the frequency of the all-zero state $|00\\dots0\\rangle$.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>3. Dual Formulation & Optimization</h3>
        <p>Once the $N \\times N$ quantum kernel matrix $\\mathbf{K}$ is computed, the dual quadratic programming problem is solved classically:</p>
        <div class="vlab-math-block">
          \\max_{\\alpha} \\sum_{i=1}^N \\alpha_i - \\frac{1}{2} \\sum_{i,j=1}^N y_i y_j \\alpha_i \\alpha_j K(x_i, x_j) \\quad \\text{s.t.} \\quad 0 \\le \\alpha_i \\le C, \\; \\sum_{i=1}^N \\alpha_i y_i = 0
        </div>
        <p>The decision rule for a novel sample $x^*$ becomes:</p>
        <div class="vlab-math-block">
          y(x^*) = \\text{sign}\\left( \\sum_{i \\in SV} \\alpha_i y_i |\\langle \\Phi(x_i) | \\Phi(x^*) \\rangle|^2 + b \\right)
        </div>
      </div>

      <div class="vlab-edu-section">
        <h3>4. Classical vs Quantum Comparison & Complexity</h3>
        <table class="vlab-table">
          <thead>
            <tr><th>Metric</th><th>Classical Linear SVM</th><th>Classical RBF Kernel</th><th>Quantum SVM (QSVM)</th></tr>
          </thead>
          <tbody>
            <tr><td>Feature Dimension</td><td>$d$</td><td>Infinite (analytic)</td><td>$2^n$ (Hilbert space)</td></tr>
            <tr><td>Kernel Evaluation</td><td>$O(d)$</td><td>$O(d)$</td><td>$O(d \\cdot \\text{depth})$ quantum shots</td></tr>
            <tr><td>Separability on Concentric Rings</td><td>Fails (~50% acc)</td><td>Separates</td><td>Separates via phase interference</td></tr>
            <tr><td>Quantum Advantage</td><td>Baseline</td><td>No speedup</td><td>Advantage if kernel cannot be efficiently simulated classically</td></tr>
          </tbody>
        </table>
      </div>
    `,
    pretest: [
      {
        question: 'What mathematical quantity represents the quantum kernel between two data points x_i and x_j?',
        options: [
          'The Euclidean distance ||x_i - x_j|| in input space',
          'The state fidelity |⟨Φ(x_i)|Φ(x_j)⟩|²',
          'The classical trace of the Hessian matrix',
          'The determinant of the Pauli-Z rotation matrix'
        ],
        correct: 1,
        explanation: 'The quantum kernel is the transition probability (fidelity) |⟨Φ(x_i)|Φ(x_j)⟩|² between quantum states prepared via the feature map.'
      },
      {
        question: 'How is the quantum kernel matrix evaluated on physical quantum hardware?',
        options: [
          'By calculating eigenvalues with Gaussian elimination',
          'By executing U_Φ†(x_j) U_Φ(x_i) and counting the measurement frequency of |0...0⟩',
          'By performing classical gradient descent on single qubits',
          'By measuring the temperature of the dilution refrigerator'
        ],
        correct: 1,
        explanation: 'Applying U_Φ(x_i) followed by U_Φ†(x_j) and measuring the all-zero state probability |0...0⟩ directly yields the state fidelity.'
      },
      {
        question: 'Where is the dual quadratic optimization problem solved in a hybrid QSVM workflow?',
        options: [
          'Directly on analog quantum hardware using Shor algorithms',
          'On a classical computer using the precomputed quantum kernel matrix',
          'Inside the quantum register using Grover iterations',
          'It is skipped because quantum states do not require support vectors'
        ],
        correct: 1,
        explanation: 'QSVM is a hybrid quantum-classical algorithm: the kernel matrix is evaluated on quantum hardware, and the dual optimization problem is solved classically.'
      }
    ],
    procedure: [
      'Step 1: Choose a dataset geometry (e.g. Linearly Separable vs Non-Linear Concentric Circles vs Ad-hoc Quantum distribution).',
      'Step 2: Train a baseline Classical Linear SVM and observe the linear decision boundary limitations.',
      'Step 3: Configure the Quantum Feature Map (ZZFeatureMap with Pauli-Z and CNOT entanglers, depth = 2).',
      'Step 4: Execute quantum circuits for all training sample pairs to construct the full N × N Quantum Kernel Matrix.',
      'Step 5: Inspect the heatmap of the Quantum Kernel Gram Matrix to verify intra-class similarity and inter-class orthogonality.',
      'Step 6: Solve the dual SVM problem to identify support vectors and render the non-linear quantum decision boundary.',
      'Step 7: Evaluate classification accuracy, confusion matrix, and comparative metrics.'
    ],
    simulationConfig: {
      type: 'qsvm',
      qubits: 2,
      datasets: ['circles', 'linear', 'moons'],
      featureMaps: ['ZZFeatureMap', 'ZFeatureMap', 'PauliFeatureMap'],
      defaultDataset: 'circles',
      steps: [
        { name: 'Dataset Generation', desc: 'Sample 2D data points with binary labels (+1 / -1).', hint: 'Notice non-linear separation in concentric rings.' },
        { name: 'Classical SVM Baseline', desc: 'Fit classical linear hyperplanes to establish the baseline performance.', hint: 'Linear SVM fails on circular concentric structures.' },
        { name: 'Quantum State Encoding', desc: 'Encode 2D coordinates into 2-qubit Hilbert space via U_Φ(x).', hint: 'Uses H and parameterized Rz rotations.' },
        { name: 'Kernel Matrix Computation', desc: 'Compute pairwise fidelity K_ij = |⟨Φ(x_i)|Φ(x_j)⟩|² for all samples.', hint: 'Observe high fidelity along class blocks.' },
        { name: 'QSVM Boundary Resolution', desc: 'Resolve dual support vector weights and map decision contour.', hint: 'Quantum boundary cleanly separates concentric rings.' },
        { name: 'Accuracy & Metric Analysis', desc: 'Verify test set accuracy, support vector count, and margin width.', hint: 'QSVM achieves 100% test accuracy on non-linear data.' }
      ]
    },
    posttest: [
      {
        question: 'Why does classical linear SVM struggle with concentric circular datasets while QSVM succeeds?',
        options: [
          'Linear SVM cannot create curved decision boundaries without non-linear mapping, which QSVM provides naturally in Hilbert space',
          'Linear SVM is limited to 1 sample at a time',
          'QSVM uses classical neural networks under the hood',
          'Quantum computers only compute circular functions'
        ],
        correct: 0,
        explanation: 'Linear SVM is restricted to planar hyperplanes. The quantum feature map embeds coordinates into a 4-dimensional Hilbert space where circular regions become linearly separable.'
      },
      {
        question: 'What is the primary condition required for a genuine quantum advantage in kernel methods?',
        options: [
          'The dataset must have more than 100,000 features',
          'The quantum kernel must be provably hard to estimate or simulate classically, and correlate with the target function',
          'The quantum hardware must operate at room temperature',
          'The qubits must only use Hadamard gates'
        ],
        correct: 1,
        explanation: 'As proven by Liu et al. (2021), quantum advantage requires that the quantum kernel cannot be efficiently simulated classically while retaining high alignment with the learning problem.'
      },
      {
        question: 'What does a high off-diagonal value K(x_i, x_j) ≈ 1 between opposite classes imply in a kernel matrix?',
        options: [
          'Poor class separability in the chosen quantum feature space',
          'Perfect classification performance',
          'The quantum circuit has zero noise',
          'The algorithm has converged to the global minimum'
        ],
        correct: 0,
        explanation: 'If samples from opposite classes have high fidelity (K_ij ≈ 1), the feature map fails to distinguish them, leading to poor classifier generalization.'
      }
    ],
    references: [
      { title: 'Supervised learning with quantum-enhanced feature spaces', authors: 'Havlíček, V., Córcoles, A. D., Temme, K., et al.', journal: 'Nature 567, 209–212 (2019)', link: 'https://doi.org/10.1038/s41586-019-0980-2' },
      { title: 'A rigorous and robust quantum speed-up in supervised machine learning', authors: 'Liu, Y., Arunachalam, S., & Temme, K.', journal: 'Nature Physics 17, 1013–1017 (2021)', link: 'https://doi.org/10.1038/s41567-021-01287-z' },
      { title: 'Quantum Machine Learning with Qiskit', authors: 'IBM Quantum Learning Course', journal: 'IBM Quantum Documentation (2024)', link: 'https://learning.quantum.ibm.com/' }
    ]
  },

  /* ------------------------------------------------------------
     2. SHOR'S FACTORIZATION ALGORITHM
     ------------------------------------------------------------ */
  {
    id: 'shor-factorization',
    slug: 'shor-factorization',
    number: '02',
    title: "Shor's Factorization Algorithm",
    shortTitle: "Shor's Algorithm",
    category: 'Number Theory & Cryptography',
    difficulty: 'Expert',
    time: '45 min',
    aim: 'To investigate polynomial-time integer factorization of composite integers N by formulating the problem as order finding, simulating quantum modular exponentiation and the Quantum Fourier Transform (QFT), and extracting prime factors via continued fractions.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. The Factorization Problem & Cryptographic Impact</h3>
        <p>The security of the RSA public-key cryptosystem relies on the computational hardness of integer factorization. The best known classical algorithm, the General Number Field Sieve (GNFS), runs in sub-exponential time:</p>
        <div class="vlab-math-block">
          O\\left(\\exp\\left( \\left(\\sqrt[3]{\\frac{64}{9}} + o(1)\\right) (\\ln N)^{1/3} (\\ln \\ln N)^{2/3} \\right)\\right)
        </div>
        <p>Peter Shor (1994) demonstrated that quantum computers can factor integers in polynomial time $O((\\log N)^2 \\log \\log N)$, representing an exponential quantum speedup.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Reduction of Factorization to Order Finding</h3>
        <p>Given an odd composite integer $N$ and a randomly chosen coprime integer $a < N$ (such that $\\gcd(a, N) = 1$):</p>
        <ol>
          <li>Find the order (period) $r$ of $a$ modulo $N$, which is the smallest integer $r > 0$ such that $a^r \\equiv 1 \\pmod N$.</li>
          <li>If $r$ is even and $a^{r/2} \\not\\equiv -1 \\pmod N$, then:
            <div class="vlab-math-block">
              (a^{r/2} - 1)(a^{r/2} + 1) = a^r - 1 = k N \\equiv 0 \\pmod N
            </div>
          </li>
          <li>The non-trivial factors of $N$ are found by computing $\\gcd(a^{r/2} \\pm 1, N)$ using the classical Euclidean algorithm.</li>
        </ol>
      </div>

      <div class="vlab-edu-section">
        <h3>3. Quantum Order Finding Circuit</h3>
        <p>The quantum component evaluates the periodic function $f(x) = a^x \\pmod N$ in quantum superposition:</p>
        <div class="vlab-math-block">
          |\\psi_1\\rangle = \\frac{1}{\\sqrt{2^t}} \\sum_{x=0}^{2^t - 1} |x\\rangle |a^x \\pmod N\\rangle
        </div>
        <p>Measuring the target register collapses the counting register into a periodic state with period $r$. Applying the inverse Quantum Fourier Transform (QFT$^{\\dagger}$) transforms period $r$ in time into sharp frequency peaks at $s / r$ ($s \\in \\{0, 1, \\dots, r-1\\}$), from which $r$ is extracted via the continued fractions algorithm.</p>
      </div>
    `,
    pretest: [
      {
        question: 'To which core mathematical problem does Shor’s algorithm reduce integer factorization?',
        options: [
          'Discrete Fourier Inversion on continuous functions',
          'Period (order) finding of modular exponentiation a^x mod N',
          'Hamiltonian ground-state energy minimization',
          'Quadratic programming optimization'
        ],
        correct: 1,
        explanation: 'Shor’s reduction maps the factorization of N to determining the order r satisfying a^r ≡ 1 (mod N).'
      },
      {
        question: 'If a = 7, N = 15, and the period is determined to be r = 4, what are the candidate factors computed via gcd(a^(r/2) ± 1, N)?',
        options: [
          'gcd(7^2 - 1, 15) = gcd(48, 15) = 3 and gcd(7^2 + 1, 15) = gcd(50, 15) = 5',
          'gcd(7 - 1, 15) = 6 and gcd(7 + 1, 15) = 8',
          '15 cannot be factored because r is even',
          'Factors are 7 and 11'
        ],
        correct: 0,
        explanation: 'For a=7, r=4: a^(r/2) = 49. Then gcd(48, 15) = 3 and gcd(50, 15) = 5, perfectly yielding factors 3 and 5.'
      },
      {
        question: 'What classical algorithm is used to extract the exact integer period r from the measured phase estimate s/r?',
        options: [
          'Backpropagation with gradient descent',
          'Continued Fractions Algorithm',
          'Newton-Raphson approximation',
          'Metropolis-Hastings sampling'
        ],
        correct: 1,
        explanation: 'The Continued Fractions algorithm finds the best rational approximation p/q to the measured phase, recovering period r in polynomial time.'
      }
    ],
    procedure: [
      'Step 1: Choose a composite integer N to factor (e.g. N = 15, 21, 35).',
      'Step 2: Verify that N is odd and not a prime power N = p^k using classical tests.',
      'Step 3: Select a random integer a coprime to N such that gcd(a, N) = 1.',
      'Step 4: Initialize the counting register (2t qubits in equal superposition) and target register |1⟩.',
      'Step 5: Apply controlled modular exponentiation gates: |x⟩|y⟩ → |x⟩|(y · a^x) mod N⟩.',
      'Step 6: Apply the Inverse Quantum Fourier Transform (QFT†) to the counting register.',
      'Step 7: Measure the counting register, execute Continued Fraction expansion on the phase, and compute gcd(a^(r/2) ± 1, N).'
    ],
    simulationConfig: {
      type: 'shor',
      supportedN: [15, 21, 35],
      defaultN: 15,
      defaultA: 7,
      steps: [
        { name: 'Classical Pre-check', desc: 'Confirm N is odd, non-prime, and gcd(a, N) = 1.', hint: 'gcd(7, 15) = 1 confirms coprimality.' },
        { name: 'Superposition Prep', desc: 'Initialize counting qubits into |+⟩^⊗t uniform superposition.', hint: 'Provides 2^t parallel modular evaluation paths.' },
        { name: 'Modular Exponentiation', desc: 'Compute a^x mod N across superposition states.', hint: 'Generates periodic sequence 1, 7, 4, 13, 1, 7...' },
        { name: 'Inverse QFT', desc: 'Transform periodic state into phase frequency peaks.', hint: 'Constructive interference concentrates amplitude on multiples of 2^t / r.' },
        { name: 'Measurement & Period', desc: 'Read out phase peaks and compute order r via continued fractions.', hint: 'Peak observed at phase 0.25 (1/4) -> r = 4.' },
        { name: 'Factor Extraction', desc: 'Compute gcd(a^(r/2) - 1, N) and gcd(a^(r/2) + 1, N).', hint: 'Non-trivial factors: 3 × 5 = 15.' }
      ]
    },
    posttest: [
      {
        question: 'Under what condition does the order-finding reduction fail to provide non-trivial factors of N?',
        options: [
          'When period r is odd, or when a^(r/2) ≡ -1 (mod N)',
          'When period r is greater than 2',
          'When gcd(a, N) = 1',
          'When N is a product of two distinct primes'
        ],
        correct: 0,
        explanation: 'If r is odd, a^(r/2) is not an integer. If a^(r/2) ≡ -1 (mod N), then a^(r/2) + 1 is a multiple of N, yielding gcd = N rather than a non-trivial factor.'
      },
      {
        question: 'What is the asymptotic quantum complexity of Shor’s algorithm for an n-bit number N?',
        options: [
          'O(2^n) exponential time',
          'O(n² log n log log n) polynomial time',
          'O(sqrt(N)) quadratic time',
          'O(1) constant time'
        ],
        correct: 1,
        explanation: 'Shor’s algorithm executes in polynomial time O(n² log n log log n), making it exponentially faster than classical number field sieves.'
      },
      {
        question: 'Why is modular exponentiation the primary hardware bottleneck when executing Shor’s algorithm?',
        options: [
          'It requires deep circuits of reversibly synthesized controlled arithmetic gates (multipliers and adders)',
          'Modular exponentiation cannot be run on superconducting qubits',
          'It requires infinite iterations of Hadamard gates',
          'It requires analog measurements'
        ],
        correct: 0,
        explanation: 'Reversible modular exponentiation requires substantial ancilla qubits and deep fault-tolerant circuits composed of thousands of Toffoli and controlled adder gates.'
      }
    ],
    references: [
      { title: 'Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer', authors: 'Shor, Peter W.', journal: 'SIAM Review 41 (2): 303–332 (1999)', link: 'https://doi.org/10.1137/S0036144598347011' },
      { title: 'Quantum Computation and Quantum Information', authors: 'Nielsen, M. A., & Chuang, I. L.', journal: 'Cambridge University Press, 10th Anniversary Edition (2010)', link: 'https://doi.org/10.1017/CBO9780511976667' },
      { title: 'Realization of a scalable Shor algorithm', authors: 'Monz, T., Nigg, D., Martinez, E. A., et al.', journal: 'Science 351, 1068–1070 (2016)', link: 'https://doi.org/10.1126/science.aad9480' }
    ]
  },

  /* ------------------------------------------------------------
     3. QUANTUM FOURIER TRANSFORM (QFT)
     ------------------------------------------------------------ */
  {
    id: 'qft',
    slug: 'qft',
    number: '03',
    title: 'Quantum Fourier Transform (QFT)',
    shortTitle: 'QFT',
    category: 'Fundamentals & Primitives',
    difficulty: 'Intermediate',
    time: '30 min',
    aim: 'To formulate, synthesize, and execute the Quantum Fourier Transform circuit on multi-qubit states, verify phase rotations R_k, analyze the exponential speedup over classical FFT O(n² vs n 2ⁿ), and inspect computational-to-Fourier basis transitions.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. Mathematical Definition</h3>
        <p>The Quantum Fourier Transform is the quantum analogue of the Discrete Fourier Transform (DFT). Acting on orthonormal basis states $|j\\rangle$ ($j \\in \\{0, 1, \\dots, 2^n - 1\\}$), the QFT produces:</p>
        <div class="vlab-math-block">
          \\text{QFT} |j\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{k=0}^{2^n - 1} e^{2\\pi i j k / 2^n} |k\\rangle
        </div>
        <p>Factoring this sum reveals an unentangled product representation across the individual qubits:</p>
        <div class="vlab-math-block">
          |j_1 j_2 \\dots j_n\\rangle \\mapsto \\frac{1}{\\sqrt{2^n}} \\bigotimes_{l=1}^n \\left( |0\\rangle + e^{2\\pi i (0.j_l j_{l+1} \\dots j_n)} |1\\rangle \\right)
        </div>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Circuit Architecture & Controlled Phase Gates</h3>
        <p>The QFT circuit operates with Hadamard gates and controlled phase shift gates $R_k$ defined by:</p>
        <div class="vlab-math-block">
          R_k = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i / 2^k} \\end{pmatrix}
        </div>
        <p>For each qubit $q_i$, a Hadamard gate is applied followed by controlled-$R_2, R_3, \\dots, R_{n-i+1}$ from all subsequent qubits. Finally, SWAP gates reverse the qubit order to match binary endianness.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>3. Complexity Analysis: QFT vs Classical FFT</h3>
        <table class="vlab-table">
          <thead>
            <tr><th>Algorithm</th><th>Vector Size $N = 2^n$</th><th>Gate / Operation Count</th><th>Scaling for $n=50$ qubits ($N \\approx 10^{15}$)</th></tr>
          </thead>
          <tbody>
            <tr><td>Classical FFT (Cooley-Tukey)</td><td>$N$</td><td>$O(N \\log N) = O(n 2^n)$</td><td>$\\approx 5 \\times 10^{16}$ operations</td></tr>
            <tr><td>Quantum Fourier Transform</td><td>$2^n$ state vector</td><td>$O(n^2)$ gates</td><td>$\\approx 1,225$ quantum gates</td></tr>
          </tbody>
        </table>
        <p><em>Crucial Note:</em> QFT operates on state amplitudes, not classical vectors in memory. The amplitudes cannot be read out directly in $O(n^2)$ without collapsing the state.</p>
      </div>
    `,
    pretest: [
      {
        question: 'What is the circuit complexity (total gate count) to implement an n-qubit QFT?',
        options: [
          'O(n²) gates',
          'O(2^n) gates',
          'O(n!) gates',
          'O(1) gates'
        ],
        correct: 0,
        explanation: 'QFT requires n(n+1)/2 Hadamard and controlled-phase gates plus n/2 SWAP gates, yielding an asymptotic gate complexity of O(n²).'
      },
      {
        question: 'What phase rotation angle is applied by the controlled gate R_k in the QFT?',
        options: [
          'θ = 2π / 2^k',
          'θ = π / k',
          'θ = 2^k / π',
          'θ = k · π'
        ],
        correct: 0,
        explanation: 'The unitary controlled phase operator is R_k = diag(1, e^(2πi / 2^k)), imparting an angle of 2π / 2^k.'
      },
      {
        question: 'Why are SWAP gates necessary at the conclusion of the standard QFT circuit?',
        options: [
          'To cool the qubits before measurement',
          'Because the natural gate sequence produces output qubits in bit-reversed order',
          'To delete the ancilla register',
          'To prevent decoherence errors'
        ],
        correct: 1,
        explanation: 'The natural recursive cascade of controlled rotations produces qubits in reverse order (most significant bit in qubit n instead of qubit 0); SWAP gates invert this back to standard order.'
      }
    ],
    procedure: [
      'Step 1: Select the number of qubits (2, 3, or 4 qubits) and the initial computational basis state |j⟩ (e.g. |0⟩, |1⟩, |5⟩).',
      'Step 2: Observe the initial state vector representation and phase constellation.',
      'Step 3: Apply the Hadamard gate to the most significant active qubit.',
      'Step 4: Sequentially trigger controlled-R_k gates from following qubits, watching the phase dial adjust proportionally.',
      'Step 5: Repeat for remaining qubits until the triangular circuit cascade is completed.',
      'Step 6: Apply terminal SWAP gates to restore standard endianness.',
      'Step 7: Verify that the resulting state exhibits equal amplitude 1/√N across all basis states with linearly increasing phase steps.'
    ],
    simulationConfig: {
      type: 'qft',
      qubitOptions: [2, 3, 4],
      defaultQubits: 3,
      defaultInput: 1,
      steps: [
        { name: 'Basis State Initialization', desc: 'Prepare register in input computational basis state |j⟩.', hint: 'Setting |j=1⟩ prepares |001⟩.' },
        { name: 'Hadamard Layer 1', desc: 'Apply H to qubit q0, creating equal superposition of |0⟩ and |1⟩ on wire 0.', hint: 'q0 now has relative phase 0 or π.' },
        { name: 'Controlled Rotations (q0)', desc: 'Apply CR2 from q1 and CR3 from q2 to wire 0.', hint: 'Rotates q0 phase based on values of q1 and q2.' },
        { name: 'Recursive QFT (q1..qn)', desc: 'Apply H on q1 followed by controlled phase gates to subsequent wires.', hint: 'Progressively transforms the lower sub-registers.' },
        { name: 'Qubit Order SWAPs', desc: 'Perform SWAP gates between outer qubit pairs (q0 <-> q2).', hint: 'Reverses output wires to match standard binary order.' },
        { name: 'Fourier Spectrum Analysis', desc: 'Inspect final state vector phase distribution across all 2^n basis states.', hint: 'Notice constant amplitude with uniform phase gradient.' }
      ]
    },
    posttest: [
      {
        question: 'What is the action of the QFT on the all-zero state |00...0⟩?',
        options: [
          'It maps |00...0⟩ to an equal superposition of all basis states with identical zero phase (|+⟩^⊗n)',
          'It maps |00...0⟩ to the all-one state |11...1⟩',
          'It leaves the state completely unchanged',
          'It produces an entangled Bell state'
        ],
        correct: 0,
        explanation: 'When j = 0, e^(2πi · 0 · k / 2^n) = 1 for all k, yielding (1/√2^n) ∑ |k⟩ = |+⟩^⊗n.'
      },
      {
        question: 'Can QFT be used to directly read out all Fourier coefficients of an arbitrary classical dataset in O(n²) time?',
        options: [
          'Yes, quantum computers measure all amplitudes simultaneously',
          'No, quantum measurement collapses the state, yielding only a single sample according to Born’s rule',
          'Yes, by saving the state vector to a quantum RAM memory stick',
          'No, because QFT only works on numbers less than 10'
        ],
        correct: 1,
        explanation: 'Measurement only reveals one basis state at a time with probability |c_k|². Extracting all 2^n amplitudes requires repeating measurements exponentially many times.'
      },
      {
        question: 'In which famous algorithms does the Quantum Fourier Transform serve as a core sub-routine?',
        options: [
          'Shor’s algorithm, Quantum Phase Estimation (QPE), and HHL',
          'Only classical neural networks',
          'Only classical sorting algorithms like QuickSort',
          'Gram-Schmidt orthogonalization only'
        ],
        correct: 0,
        explanation: 'QFT and its inverse QFT† are the foundational engine behind Shor’s period finding, Quantum Phase Estimation (QPE), and the HHL linear solver.'
      }
    ],
    references: [
      { title: 'The Quantum Fourier Transform and its Applications', authors: 'Hales, L., & Hallgren, S.', journal: 'Proc. 41st Annual IEEE FOCS, 515–525 (2000)', link: 'https://doi.org/10.1109/SFCS.2000.892140' },
      { title: 'Quantum Circuit Implementation of QFT', authors: 'Qiskit Textbook', journal: 'IBM Quantum Community (2023)', link: 'https://learn.qiskit.org/course/ch-algorithms/quantum-fourier-transform' },
      { title: 'Fast Quantum Fourier Transform Algorithm for Polynomial Realization', authors: 'Coppersmith, D.', journal: 'IBM Research Report RC19642 (1994)', link: 'https://arxiv.org/abs/quant-ph/0201067' }
    ]
  },

  /* ------------------------------------------------------------
     4. QUANTUM PHASE ESTIMATION (QPE)
     ------------------------------------------------------------ */
  {
    id: 'qpe',
    slug: 'qpe',
    number: '04',
    title: 'Quantum Phase Estimation (QPE)',
    shortTitle: 'QPE',
    category: 'Fundamentals & Primitives',
    difficulty: 'Advanced',
    time: '40 min',
    aim: 'To simulate Quantum Phase Estimation to calculate the unknown eigenphase θ of a unitary operator U acting on its eigenstate |u⟩ with precision determined by counting register size t, utilizing controlled-U^(2^j) powers and inverse QFT.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. The Eigenphase Problem</h3>
        <p>Let $U$ be a unitary operator and $|u\\rangle$ an eigenstate of $U$ such that:</p>
        <div class="vlab-math-block">
          U |u\\rangle = e^{2\\pi i \\theta} |u\\rangle \\quad (0 \\le \\theta < 1)
        </div>
        <p>The goal of Quantum Phase Estimation (QPE) is to estimate the unknown phase $\\theta$ to $t$ bits of precision with high success probability.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Two-Register Architecture</h3>
        <p>The algorithm uses two registers:</p>
        <ul>
          <li><strong>Counting Register (t qubits):</strong> Initialized to $|0\\rangle^{\\otimes t}$, receives Hadamard gates to create equal superposition.</li>
          <li><strong>Target Register:</strong> Prepared in the eigenstate $|u\\rangle$.</li>
        </ul>
        <p>Controlled-$U^{2^j}$ operations are applied from counting qubit $j$ ($j = 0, \\dots, t-1$), encoding the phase into the counting register via phase kickback:</p>
        <div class="vlab-math-block">
          \\frac{1}{\\sqrt{2^t}} \\sum_{k=0}^{2^t - 1} e^{2\\pi i \\theta k} |k\\rangle \\otimes |u\\rangle
        </div>
      </div>

      <div class="vlab-edu-section">
        <h3>3. Readout via Inverse QFT</h3>
        <p>Applying the inverse Quantum Fourier Transform (QFT$^{\\dagger}$) to the counting register converts the geometric phase progression into a sharp computational basis state $|2^t \\theta\\rangle$. Measuring the counting register yields an estimate $\\hat{\\theta} = \\frac{m}{2^t}$ with error bound bounded by $O(2^{-t})$.</p>
      </div>
    `,
    pretest: [
      {
        question: 'If a unitary operator satisfies U|u⟩ = e^(2πiθ)|u⟩ with θ = 0.375 and t = 3 counting qubits, what binary state will QPE measure with 100% probability?',
        options: [
          '|011⟩ (decimal 3, since 3/8 = 0.375)',
          '|101⟩ (decimal 5)',
          '|000⟩ (decimal 0)',
          '|111⟩ (decimal 7)'
        ],
        correct: 0,
        explanation: 'Since θ = 0.375 = 3/8 = 0.011 in binary, exactly 3 counting qubits produce a deterministic peak at state |011⟩ (integer 3).'
      },
      {
        question: 'What is the role of phase kickback in the QPE algorithm?',
        options: [
          'It transfers eigenvalues from target register state |u⟩ to phase factors on counting qubits',
          'It cools the dilution refrigerator',
          'It cancels all gate errors completely',
          'It factors the matrix into lower triangular form'
        ],
        correct: 0,
        explanation: 'Controlled-U operations act on eigenstate |u⟩, kicking the phase e^(2πiθ 2^j) back into the control qubit’s state.'
      },
      {
        question: 'What happens when the true phase θ cannot be expressed exactly with t bits (e.g. θ is irrational)?',
        options: [
          'The algorithm crashes and returns nothing',
          'Measurement probabilities form a sinc-like distribution centered around the nearest integer to 2^t θ',
          'The qubits spontaneously collapse to |0⟩',
          'The phase becomes negative'
        ],
        correct: 1,
        explanation: 'When θ is not a dyadic fraction, spectral leakage occurs, creating a peaked distribution centered on the closest binary approximations.'
      }
    ],
    procedure: [
      'Step 1: Choose the unitary operator U (e.g. Phase Gate P(θ), T-gate, or Z-rotation).',
      'Step 2: Select the target eigenphase θ (e.g. θ = 0.25, 0.375, 0.625) and counting qubit precision t (2 to 5 qubits).',
      'Step 3: Prepare the target register in eigenstate |u⟩ (e.g. |1⟩ for phase gates).',
      'Step 4: Initialize the t counting qubits into equal superposition with Hadamard gates.',
      'Step 5: Apply controlled-U^(2^j) gates from each counting wire j to the target register.',
      'Step 6: Execute the inverse Quantum Fourier Transform (QFT†) on the counting register.',
      'Step 7: Measure the counting register, observe peak bin m, and compute estimated phase θ̂ = m / 2^t and error |θ - θ̂|.'
    ],
    simulationConfig: {
      type: 'qpe',
      countingQubitOptions: [2, 3, 4],
      defaultCounting: 3,
      defaultPhase: 0.375,
      steps: [
        { name: 'Register Initialization', desc: 'Initialize counting register in |0⟩^⊗t and target in eigenstate |u⟩.', hint: 'Target state |1⟩ is an eigenstate of phase gate P(θ).' },
        { name: 'Counting Superposition', desc: 'Apply Hadamard layer to create equal superposition across counting wires.', hint: 'Each counting qubit now explores 0 and 1 paths simultaneously.' },
        { name: 'Controlled Powers of U', desc: 'Execute controlled-U, controlled-U², controlled-U⁴... gates.', hint: 'Phase kickback accumulates phase proportional to 2^j.' },
        { name: 'Inverse QFT Application', desc: 'Apply QFT† to translate relative phases into computational state peaks.', hint: 'Constructive interference synthesizes binary representation of θ.' },
        { name: 'Register Measurement', desc: 'Measure counting register and extract decimal index m.', hint: 'Index m = 3 translates to phase 3/8 = 0.375.' },
        { name: 'Precision & Error Bounds', desc: 'Compare estimated phase θ̂ with true phase θ and display error.', hint: 'Zero error when phase matches exact dyadic fraction.' }
      ]
    },
    posttest: [
      {
        question: 'How many counting qubits t are needed to guarantee an estimate of θ accurate to n bits with probability at least 1 - ε?',
        options: [
          't = n + ⌈log₂(2 + 1/(2ε))⌉',
          't = n / 2',
          't = 2^n',
          't = n!'
        ],
        correct: 0,
        explanation: 'By standard QPE analysis (Nielsen & Chuang), t = n + ⌈log₂(2 + 1/(2ε))⌉ counting qubits guarantee accuracy to n bits with confidence 1 - ε.'
      },
      {
        question: 'Why is QPE considered the foundational computational engine of Shor’s algorithm and HHL?',
        options: [
          'Both algorithms frame their core challenge as extracting eigenvalues of a specific unitary operator',
          'QPE is the only quantum algorithm that can run on classical computers',
          'QPE replaces all classical sorting methods',
          'QPE does not use quantum superposition'
        ],
        correct: 0,
        explanation: 'Shor’s order finding is QPE applied to modular multiplication, and HHL uses QPE to estimate matrix eigenvalues for inversion.'
      },
      {
        question: 'If t = 4 counting qubits are used and measurement produces |1100⟩ (decimal 12), what is the estimated phase θ̂?',
        options: [
          'θ̂ = 12 / 16 = 0.75',
          'θ̂ = 12 / 4 = 3.0',
          'θ̂ = 4 / 12 = 0.33',
          'θ̂ = 0.1100'
        ],
        correct: 0,
        explanation: 'The estimated phase is θ̂ = m / 2^t = 12 / 16 = 0.75.'
      }
    ],
    references: [
      { title: 'Quantum Phase Estimation Algorithm', authors: 'Cleve, R., Ekert, A., Macchiavello, C., & Mosca, M.', journal: 'Proc. Royal Soc. London A 454, 339–354 (1998)', link: 'https://doi.org/10.1098/rspa.1998.0164' },
      { title: 'Ab Initio Quantum Chemistry on a Quantum Computer', authors: 'Aspuru-Guzik, A., Dutoi, A. D., Love, P. J., & Head-Gordon, M.', journal: 'Science 309, 1704–1707 (2005)', link: 'https://doi.org/10.1126/science.1113479' }
    ]
  },

  /* ------------------------------------------------------------
     5. VARIATIONAL QUANTUM EIGENSOLVER (VQE)
     ------------------------------------------------------------ */
  {
    id: 'vqe',
    slug: 'vqe',
    number: '05',
    title: 'Variational Quantum Eigensolver (VQE)',
    shortTitle: 'VQE',
    category: 'Quantum Simulation',
    difficulty: 'Advanced',
    time: '45 min',
    aim: 'To simulate the hybrid quantum-classical Variational Quantum Eigensolver (VQE) algorithm to find the ground state energy of a molecular Hamiltonian (e.g. H_2 molecule), evaluating parameterized ansatz circuits, energy expectation values, and classical gradient descent convergence.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. The Variational Principle</h3>
        <p>In quantum mechanics, the Rayleigh-Ritz variational principle states that for any valid trial state $|\psi(\\vec{\\theta})\\rangle$ (parameterized by angles $\\vec{\\theta}$) and Hamiltonian $\\mathcal{H}$ with ground-state energy $E_0$:</p>
        <div class="vlab-math-block">
          \\langle \\mathcal{H} \\rangle_{\\vec{\\theta}} = \\frac{\\langle \\psi(\\vec{\\theta}) | \\mathcal{H} | \\psi(\\vec{\\theta}) \\rangle}{\\langle \\psi(\\vec{\\theta}) | \\psi(\\vec{\\theta}) \\rangle} \\ge E_0
        </div>
        <p>Equality holds if and only if $|\psi(\\vec{\\theta})\\rangle$ is an exact ground-state eigenstate. VQE minimizes this expectation value using classical optimization.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Hybrid Quantum-Classical Workflow</h3>
        <p>VQE executes in a closed loop between quantum and classical hardware:</p>
        <ul>
          <li><strong>Quantum Processor (QPU):</strong> Prepares parameterized ansatz $|\psi(\\vec{\\theta})\\rangle = U(\\vec{\\theta}) |0\\rangle$ and measures expectation values of Pauli string components $\\langle P_i \\rangle$.</li>
          <li><strong>Classical Optimizer:</strong> Accumulates $E(\\vec{\\theta}) = \\sum_i c_i \\langle P_i \\rangle$ and updates parameters $\\vec{\\theta}_{k+1} = \\vec{\\theta}_k - \\eta \\nabla E(\\vec{\\theta})$ using gradient descent or COBYLA.</li>
        </ul>
      </div>

      <div class="vlab-edu-section">
        <h3>3. Pauli Decomposition of Molecular Hamiltonians</h3>
        <p>Using Jordan-Wigner or Bravyi-Kitaev transformations, electronic structure Hamiltonians are mapped to Pauli operators:</p>
        <div class="vlab-math-block">
          \\mathcal{H} = g_0 I + g_1 Z_0 + g_2 Z_1 + g_3 Z_0 Z_1 + g_4 X_0 X_1 + g_5 Y_0 Y_1
        </div>
      </div>
    `,
    pretest: [
      {
        question: 'What fundamental quantum physical principle guarantees that VQE will never yield an energy below the true ground-state energy?',
        options: [
          'The Rayleigh-Ritz Variational Principle',
          'Heisenberg Uncertainty Principle',
          'No-Cloning Theorem',
          'Pauli Exclusion Principle'
        ],
        correct: 0,
        explanation: 'The Rayleigh-Ritz variational theorem guarantees that ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E_0 for all normalized trial wavefunctions.'
      },
      {
        question: 'How is the total energy expectation value ⟨H⟩ computed in VQE from a multi-term Hamiltonian H = ∑ c_i P_i?',
        options: [
          'By measuring the expectation of each Pauli string P_i separately on the QPU and summing classically: ∑ c_i ⟨P_i⟩',
          'By running an infinite loop of QFT circuits',
          'By classically inverting the 2^n × 2^n matrix',
          'By measuring the temperature of the superconducting cavity'
        ],
        correct: 0,
        explanation: 'Due to linearity of expectation values, each Pauli string is measured independently on the QPU, and the classical processor sums the weighted contributions.'
      },
      {
        question: 'What is a Barren Plateau in variational quantum algorithms like VQE?',
        options: [
          'A region in parameter space where gradients vanish exponentially with system size, halting training',
          'A hardware fault where qubits freeze at absolute zero',
          'A phase transition in liquid helium',
          'An optimal minimum with zero chemical energy'
        ],
        correct: 0,
        explanation: 'McClean et al. (2018) proved that random deep parameterized quantum circuits exhibit exponentially vanishing gradients, known as barren plateaus.'
      }
    ],
    procedure: [
      'Step 1: Select the physical system/molecule (e.g. Molecular Hydrogen H₂ at bond length 0.74 Å).',
      'Step 2: Inspect the Pauli decomposition of the Hamiltonian H = g₀I + g₁Z₀ + g₂Z₁ + g₃Z₀Z₁ + g₄X₀X₁.',
      'Step 3: Choose an ansatz architecture (Hardware-Efficient Ansatz vs RyRz Entangled Ansatz).',
      'Step 4: Initialize variational parameters θ₀ and set classical optimizer learning rate η.',
      'Step 5: Execute quantum circuits for each Pauli basis to evaluate expectation values ⟨Z₀⟩, ⟨Z₁⟩, ⟨X₀X₁⟩.',
      'Step 6: Update parameters via classical gradient descent and plot convergence toward the exact Full-CI ground energy.',
      'Step 7: Check chemical accuracy (|E_calc - E_exact| < 1.6 × 10⁻³ Hartree = 1 kcal/mol).'
    ],
    simulationConfig: {
      type: 'vqe',
      hamiltonians: ['H2', 'LiH', 'Ising'],
      defaultHamiltonian: 'H2',
      defaultBondLength: 0.74,
      steps: [
        { name: 'Hamiltonian Mapping', desc: 'Inspect Jordan-Wigner Pauli expansion for H₂ at R = 0.74 Å.', hint: 'H = -1.053 I + 0.395 Z₀ - 0.395 Z₁ - 0.011 Z₀Z₁ + 0.181 X₀X₁.' },
        { name: 'Ansatz Initialization', desc: 'Prepare parameterized circuit Ry(θ₁) - CNOT - Ry(θ₂).', hint: 'Initial parameters chosen randomly or from Hartree-Fock state.' },
        { name: 'Energy Measurement', desc: 'Measure expectation values of Pauli strings on quantum register.', hint: 'Calculates E(θ) = ∑ c_i ⟨P_i⟩ on current iteration.' },
        { name: 'Gradient Step', desc: 'Update variational parameters using parameter-shift rule.', hint: 'θ_new = θ - η · ∇E.' },
        { name: 'Convergence Trajectory', desc: 'Monitor energy vs iteration on the potential energy curve.', hint: 'Energy asymptotically approaches ground state.' },
        { name: 'Chemical Accuracy Check', desc: 'Verify difference |E - E_ground| within 1.6 mHartree.', hint: 'Chemical accuracy achieved: ground state E ≈ -1.137 Hartree.' }
      ]
    },
    posttest: [
      {
        question: 'What is "chemical accuracy" in quantum chemistry simulations, and why is it significant?',
        options: [
          '1 kcal/mol (approx 1.6 × 10⁻³ Hartree), needed to predict realistic chemical reaction rates at room temperature',
          'Zero percent error with infinite precision',
          '100 Hartree',
          '0.1 eV per second'
        ],
        correct: 0,
        explanation: 'Chemical accuracy is defined as 1 kcal/mol ≈ 1.6 mHartree, which is required to predict chemical reaction rates via the Arrhenius equation accurately.'
      },
      {
        question: 'How does the Parameter-Shift Rule allow exact analytical gradient calculation on quantum hardware?',
        options: [
          'By evaluating the circuit at parameter values shifted by ±π/2: ∂⟨H⟩/∂θ = 0.5 [⟨H⟩(θ+π/2) - ⟨H⟩(θ-π/2)]',
          'By using classical finite difference with infinitesimal ε -> 0',
          'By symbolically differentiating the wave function',
          'By measuring the physical temperature of the qubit'
        ],
        correct: 0,
        explanation: 'For generators with eigenvalues ±1/2, the parameter-shift rule evaluates exact analytical quantum gradients without numerical finite difference instability.'
      },
      {
        question: 'Why is VQE well-suited for current NISQ (Noisy Intermediate-Scale Quantum) devices compared to QPE?',
        options: [
          'It uses shallow variational circuits and offloads computational burden to classical optimization loops',
          'It does not require any quantum gates',
          'It is completely immune to all decoherence noise',
          'It can run on classical pocket calculators'
        ],
        correct: 0,
        explanation: 'VQE uses shallow circuits (short coherence time requirement) and mitigates systematic error through classical outer-loop optimization.'
      }
    ],
    references: [
      { title: 'A variational eigenvalue solver on a photonic quantum processor', authors: 'Peruzzo, A., McClean, J., Shadbolt, P., et al.', journal: 'Nature Communications 5, 4213 (2014)', link: 'https://doi.org/10.1038/ncomms5213' },
      { title: 'The theory of variational hybrid quantum-classical algorithms', authors: 'McClean, J. R., Romero, J., Babbush, R., & Aspuru-Guzik, A.', journal: 'New Journal of Physics 18, 023023 (2016)', link: 'https://doi.org/10.1088/1367-2630/18/2/023023' }
    ]
  },

  /* ------------------------------------------------------------
     6. QUANTUM APPROXIMATE OPTIMIZATION ALGORITHM (QAOA)
     ------------------------------------------------------------ */
  {
    id: 'qaoa',
    slug: 'qaoa',
    number: '06',
    title: 'Quantum Approximate Optimization Algorithm (QAOA)',
    shortTitle: 'QAOA',
    category: 'Quantum Optimization',
    difficulty: 'Advanced',
    time: '40 min',
    aim: 'To simulate the Quantum Approximate Optimization Algorithm (QAOA) on combinatorial MaxCut graph problems, optimizing variational angles (γ, β) across p-depth layers to maximize cut edge expectations and obtain optimal graph partitions.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. Combinatorial Optimization & MaxCut</h3>
        <p>The MaxCut problem partitions vertices $V$ of an undirected graph $G = (V, E)$ into two subsets $S$ and $\\bar{S}$ to maximize cut edges. The classical cost Hamiltonian maps directly to Ising spin variables $Z_i \\in \\{+1, -1\\}$:</p>
        <div class="vlab-math-block">
          C = \\sum_{(u, v) \\in E} \\frac{1}{2}(I - Z_u Z_v)
        </div>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Alternating Operator Ansatz</h3>
        <p>QAOA initializes all qubits in an equal superposition $|+\\rangle^{\\otimes n}$ and applies $p$ alternating layers of cost unitary $U(C, \\gamma)$ and transverse mixer unitary $U(B, \\beta)$:</p>
        <div class="vlab-math-block">
          |\\gamma, \\beta\\rangle = \\prod_{k=1}^p \\left[ e^{-i\\beta_k B} e^{-i\\gamma_k C} \\right] |+\\rangle^{\\otimes n}, \\quad B = \\sum_{v \\in V} X_v
        </div>
        <p>In the adiabatic limit $p \\to \\infty$, QAOA converges to the exact ground state (maximum cut).</p>
      </div>
    `,
    pretest: [
      {
        question: 'What is the role of the mixer Hamiltonian B = ∑ X_i in the QAOA circuit?',
        options: [
          'It introduces quantum tunneling and interference transitions between bitstrings',
          'It measures the temperature of the chip',
          'It forces all qubits into the |0⟩ state permanently',
          'It inverts the classical matrix'
        ],
        correct: 0,
        explanation: 'The mixer operator B = ∑ X_i creates non-commuting transverse transitions, allowing amplitudes to tunnel between different configuration states.'
      },
      {
        question: 'For a depth p = 1 QAOA circuit on a graph with n vertices, how many classical parameters are optimized?',
        options: [
          'Exactly 2 parameters (γ₁ and β₁)',
          '2^n parameters',
          'n² parameters',
          'Zero parameters'
        ],
        correct: 0,
        explanation: 'At depth p, QAOA requires 2p variational parameters (γ_k, β_k). For p=1, exactly 2 parameters (γ₁, β₁) are optimized.'
      },
      {
        question: 'What is the theoretical approximation ratio guarantee of QAOA at p=1 on 3-regular graphs?',
        options: [
          'At least 0.6924 (beating random guessing at 0.5)',
          'Exactly 1.0 (always 100% optimal)',
          '0.0',
          '0.25'
        ],
        correct: 0,
        explanation: 'Farhi et al. proved that QAOA with p=1 achieves an approximation ratio ≥ 0.6924 on 3-regular graphs.'
      }
    ],
    procedure: [
      'Step 1: Choose a graph topology (e.g. 4-node Ring Graph, 4-node Star Graph, or 5-node Random Graph).',
      'Step 2: Inspect the classical cost Hamiltonian C = ∑ 1/2(I - Z_u Z_v) and adjacency matrix.',
      'Step 3: Set variational depth p (p = 1, 2, or 3 layers).',
      'Step 4: Initialize cost angle γ and mixer angle β using interactive sliders.',
      'Step 5: Execute the alternating circuit e^(-iβ B) e^(-iγ C) on the |+⟩^⊗n state.',
      'Step 6: Compute the expectation value ⟨C⟩ and plot the energy landscape across the (γ, β) plane.',
      'Step 7: Sample output bitstrings to determine the most probable vertex partition cut.'
    ],
    simulationConfig: {
      type: 'qaoa',
      graphTypes: ['ring4', 'star4', 'k4'],
      defaultGraph: 'ring4',
      defaultP: 1,
      steps: [
        { name: 'Graph & Problem Formulation', desc: 'Define vertices, edges, and MaxCut cost function.', hint: 'For 4-node ring: MaxCut = 4 with partitions 0101 and 1010.' },
        { name: 'Equal Superposition', desc: 'Apply Hadamard layer to all n qubits: |+⟩^⊗4.', hint: 'All 16 partition configurations are initially equally probable.' },
        { name: 'Cost Hamiltonian Phase', desc: 'Apply e^(-iγ C) using CNOT and Rz gates along edges.', hint: 'Encodes cut rewards as relative quantum phases.' },
        { name: 'Mixer Driver Layer', desc: 'Apply e^(-iβ B) with Rx(2β) rotations on every wire.', hint: 'Drives interference between adjacent configurations.' },
        { name: 'Expectation Evaluation', desc: 'Calculate expected cut ⟨C(γ, β)⟩ across the parameter grid.', hint: 'Finds optimal parameters (γ* ≈ 0.65, β* ≈ 0.45).' },
        { name: 'Bitstring Readout', desc: 'Sample measurement distribution to obtain partition cuts.', hint: 'Optimal partition 0101 achieves cut size 4/4.' }
      ]
    },
    posttest: [
      {
        question: 'What happens to QAOA as the circuit depth p approaches infinity (p → ∞)?',
        options: [
          'It reproduces adiabatic quantum computation and finds the exact optimum with probability 1',
          'The circuit collapses due to excessive noise',
          'The approximation ratio approaches 0',
          'It becomes a classical Markov chain'
        ],
        correct: 0,
        explanation: 'By the adiabatic theorem, as p → ∞ with smooth parameter schedules, QAOA approaches the exact ground state of the cost Hamiltonian.'
      },
      {
        question: 'Which classical algorithm provides a 0.878 approximation ratio benchmark for MaxCut?',
        options: [
          'Goemans-Williamson Semidefinite Programming algorithm',
          'Bubble Sort',
          'Dijkstra Shortest Path',
          'Gradient Descent without bounds'
        ],
        correct: 0,
        explanation: 'The Goemans-Williamson algorithm (1995) uses semidefinite programming and random hyperplane rounding to achieve a 0.878 approximation ratio.'
      },
      {
        question: 'Why are CNOT-Rz(2γ)-CNOT gate sequences used in the cost unitary e^(-iγ C)?',
        options: [
          'They implement the two-qubit interaction e^(-i γ Z_u Z_v)',
          'They measure the qubits in the X basis',
          'They delete redundant qubits',
          'They act as optical filters'
        ],
        correct: 0,
        explanation: 'A CNOT gate followed by Rz(2γ) and another CNOT decomposes the diagonal two-qubit term e^(-i γ Z_u Z_v) into standard universal quantum gates.'
      }
    ],
    references: [
      { title: 'A Quantum Approximate Optimization Algorithm', authors: 'Farhi, E., Goldstone, J., & Gutmann, S.', journal: 'arXiv:1411.4028 (2014)', link: 'https://arxiv.org/abs/1411.4028' },
      { title: 'Quantum Approximate Optimization Algorithm Performance', authors: 'Zhou, L., Wang, S.-T., Choi, S., et al.', journal: 'Physical Review X 10, 021067 (2020)', link: 'https://doi.org/10.1103/PhysRevX.10.021067' }
    ]
  },

  /* ------------------------------------------------------------
     7. GROVER'S SEARCH ALGORITHM
     ------------------------------------------------------------ */
  {
    id: 'grover',
    slug: 'grover',
    number: '07',
    title: "Grover's Search Algorithm",
    shortTitle: "Grover's Search",
    category: 'Fundamentals & Primitives',
    difficulty: 'Intermediate',
    time: '30 min',
    aim: 'To simulate Grover’s amplitude amplification algorithm for unstructured database search of N items in O(√N) iterations, analyzing geometric rotations in the 2D state space, oracle phase inversion, and inversion-about-the-mean diffusion.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. The Unstructured Search Problem</h3>
        <p>Given an unsorted database of $N = 2^n$ items and a boolean oracle $f(x)$ where $f(w) = 1$ for a unique marked target $w$ and $f(x) = 0$ for $x \\ne w$. Classically, finding $w$ requires $O(N)$ evaluations on average. Grover’s algorithm solves this in provably optimal $O(\\sqrt{N})$ queries.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Geometric 2D Rotation</h3>
        <p>The system state is confined to a 2D plane spanned by the target state $|w\\rangle$ and the uniform superposition of unmarked states $|s'\\rangle = \\frac{1}{\\sqrt{N-1}} \\sum_{x \\ne w} |x\\rangle$:</p>
        <div class="vlab-math-block">
          |s\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right) |s'\\rangle + \\sin\\left(\\frac{\\theta}{2}\\right) |w\\rangle, \\quad \\sin\\left(\\frac{\\theta}{2}\\right) = \\frac{1}{\\sqrt{N}}
        </div>
        <p>Each Grover iteration $G = D \\cdot R_w$ rotates the state vector toward $|w\\rangle$ by angle $\\theta \\approx 2/\\sqrt{N}$. The optimal number of iterations is $k \\approx \\frac{\\pi}{4} \\sqrt{N}$.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>3. Oracle and Diffusion Operators</h3>
        <p><strong>Phase Oracle:</strong> $R_w = I - 2|w\\rangle\\langle w|$ flips the sign of the target state amplitude.</p>
        <p><strong>Grover Diffusion Operator:</strong> $D = 2|s\\rangle\\langle s| - I$ inverts all amplitudes about their mean.</p>
      </div>
    `,
    pretest: [
      {
        question: 'What is the optimal number of Grover iterations required to find a marked item in a search space of N = 64 items?',
        options: [
          'k ≈ (π/4) √64 = (π/4) · 8 ≈ 6 iterations',
          '64 iterations',
          '32 iterations',
          '1 iteration'
        ],
        correct: 0,
        explanation: 'The optimal iteration count is k ≈ (π/4)√N. For N=64, (π/4)·8 ≈ 6.28, meaning 6 iterations achieve near-100% probability.'
      },
      {
        question: 'What happens if you run Grover’s algorithm for too many iterations (e.g. k >> (π/4)√N)?',
        options: [
          'Over-rotation occurs, causing the target amplitude to decrease back toward zero',
          'The state remains permanently at 100%',
          'The quantum computer catches fire',
          'The search space doubles'
        ],
        correct: 0,
        explanation: 'Because Grover iterations are unitary rotations in a 2D plane, applying iterations beyond optimal rotates the state vector past the target, reducing success probability.'
      },
      {
        question: 'What does the Grover diffusion operator D = 2|s⟩⟨s| - I accomplish mathematically?',
        options: [
          'It inverts each amplitude about the average (mean) amplitude of the register',
          'It deletes all unmarked items from memory',
          'It normalizes the density matrix to zero',
          'It flips qubits from |1⟩ to |0⟩'
        ],
        correct: 0,
        explanation: 'The diffusion operator reflects all amplitudes about their arithmetic mean, turning the negative marked amplitude into a large positive spike.'
      }
    ],
    procedure: [
      'Step 1: Configure search space size N = 2^n (e.g. n = 2 qubits / N = 4 or n = 3 qubits / N = 8).',
      'Step 2: Select the target marked index w (e.g. index 5 = |101⟩).',
      'Step 3: Initialize all qubits into equal superposition |s⟩ = H^⊗n |0⟩.',
      'Step 4: Execute the Phase Oracle R_w to flip the sign of amplitude α_w -> -α_w.',
      'Step 5: Apply the Grover Diffusion operator D = 2|s⟩⟨s| - I to amplify the marked state.',
      'Step 6: Track state vector rotation on the 2D geometric plane and bar chart.',
      'Step 7: Measure the register and verify measurement probability P(w) > 95%.'
    ],
    simulationConfig: {
      type: 'grover',
      qubitOptions: [2, 3],
      defaultQubits: 3,
      defaultTarget: 5,
      steps: [
        { name: 'Superposition Prep', desc: 'Initialize register into equal superposition |s⟩.', hint: 'Each of the 8 states has amplitude 1/√8 ≈ 0.354.' },
        { name: 'Phase Oracle Inversion', desc: 'Flip the sign of target state |w⟩ amplitude.', hint: 'Target state |101⟩ becomes -0.354 while others remain +0.354.' },
        { name: 'Diffusion Operator', desc: 'Invert all amplitudes about their mean value.', hint: 'Target amplitude jumps from negative to > 0.90.' },
        { name: 'Rotation Check', desc: 'Verify angle θ rotation on the 2D state space circle.', hint: 'State vector aligns with target |w⟩.' },
        { name: 'Iterative Convergence', desc: 'Confirm optimal iteration count k = 2 for N = 8.', hint: 'P(target) reaches 94.5%.' },
        { name: 'Measurement Readout', desc: 'Collapse the wave function and verify marked state recovery.', hint: 'Target index 5 is measured with near certainty.' }
      ]
    },
    posttest: [
      {
        question: 'Has it been proven that Grover’s quadratic speedup O(√N) is optimal for unstructured search on quantum computers?',
        options: [
          'Yes, Bennett, Bernstein, Brassard, and Vazirani (BBBV theorem) proved that any quantum search requires Ω(√N) queries',
          'No, polynomial O(log N) algorithms are expected in the future',
          'No, classical search is actually faster',
          'It is only optimal for even numbers'
        ],
        correct: 0,
        explanation: 'The BBBV theorem (1997) proved that Grover’s algorithm achieves the strictly optimal query lower bound Ω(√N) for black-box search.'
      },
      {
        question: 'If an unsorted database contains M multiple marked items out of N total items, what is the modified query complexity?',
        options: [
          'O(√(N/M))',
          'O(N/M)',
          'O(N · M)',
          'O(1)'
        ],
        correct: 0,
        explanation: 'For M marked items, Grover’s algorithm requires k ≈ (π/4)√(N/M) iterations.'
      },
      {
        question: 'What is the geometric angle between the initial uniform superposition |s⟩ and the unmarked subspace |s’⟩ for large N?',
        options: [
          'θ/2 ≈ 1/√N radians',
          'π/2 radians',
          'Zero degrees',
          '45 degrees'
        ],
        correct: 0,
        explanation: 'sin(θ/2) = 1/√N, which for large N implies θ/2 ≈ 1/√N radians.'
      }
    ],
    references: [
      { title: 'A fast quantum mechanical algorithm for database search', authors: 'Grover, Lov K.', journal: 'Proc. 28th Annual ACM STOC, 212–219 (1996)', link: 'https://doi.org/10.1145/237814.237866' },
      { title: 'Tight bounds on quantum searching', authors: 'Boyer, M., Brassard, G., Høyer, P., & Tapp, A.', journal: 'Fortschritte der Physik 46, 493–505 (1998)', link: 'https://doi.org/10.1002/(SICI)1521-3978(199806)46:4/5<493::AID-PROP493>3.0.CO;2-P' }
    ]
  },

  /* ------------------------------------------------------------
     8. QUANTUM NEURAL NETWORKS (QNN)
     ------------------------------------------------------------ */
  {
    id: 'qnn',
    slug: 'qnn',
    number: '08',
    title: 'Quantum Neural Networks (QNN)',
    shortTitle: 'QNN',
    category: 'Quantum Machine Learning',
    difficulty: 'Advanced',
    time: '40 min',
    aim: 'To simulate a Parameterized Quantum Circuit (PQC) acting as a Quantum Neural Network layer, training variational rotation gates via gradient descent to classify non-linear 2D coordinate patterns with forward-backward passes.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. Quantum Artificial Neurons & Variational Circuits</h3>
        <p>A Quantum Neural Network (QNN) constructs trainable neural architectures on quantum registers using Parameterized Quantum Circuits (PQCs). Analogous to classical artificial neural networks with weights and biases, QNNs tune continuous gate rotation angles $\\vec{\\theta} = \\{\\theta_1, \\theta_2, \\dots\\}$:</p>
        <div class="vlab-math-block">
          |\\psi(x, \\vec{\\theta})\\rangle = U(\\vec{\\theta}) \\mathcal{S}(x) |0\\rangle^{\\otimes n}
        </div>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Architecture Layers</h3>
        <ul>
          <li><strong>Input Encoding Layer $\\mathcal{S}(x)$:</strong> Embeds classical vector $x \\in \\mathbb{R}^d$ into qubit states using $R_x(x_i)$ and $R_z(x_i)$ rotations.</li>
          <li><strong>Variational Entangling Layers $W(\\vec{\\theta})$:</strong> Parameterized single-qubit rotations $R_y(\\theta), R_z(\\theta)$ coupled with CNOT or CZ entangling ladders.</li>
          <li><strong>Measurement & Prediction:</strong> Evaluates expectation value $\\hat{y} = \\langle Z_0 \\rangle = \\langle \\psi(x, \\vec{\\theta})| Z_0 |\\psi(x, \\vec{\\theta})\\rangle \\in [-1, +1]$.</li>
        </ul>
      </div>
    `,
    pretest: [
      {
        question: 'What corresponds to the trainable weights of a classical neural network in a Quantum Neural Network (QNN)?',
        options: [
          'The continuous rotation angles θ of parameterized quantum gates',
          'The physical cable lengths in the dilution fridge',
          'The number of qubits in the register',
          'The classical training epochs'
        ],
        correct: 0,
        explanation: 'In a QNN, trainable parameters are the rotation angles θ of single-qubit gates (e.g. Ry(θ), Rz(θ)) inside the variational ansatz.'
      },
      {
        question: 'How is the final classification prediction extracted from a QNN output state?',
        options: [
          'By measuring the expectation value of an observable such as ⟨Z⟩ on a readout qubit',
          'By deleting all qubits',
          'By calculating the determinant of the training set',
          'By taking the Fourier transform of the classical laptop screen'
        ],
        correct: 0,
        explanation: 'The output is mapped to a scalar prediction by measuring expectation values such as ⟨Z_0⟩ ∈ [-1, 1], which serves as the decision logit.'
      },
      {
        question: 'What is the primary method for computing parameter gradients in physical quantum neural hardware?',
        options: [
          'The Parameter-Shift Rule',
          'Backpropagation through quantum registers without measurement',
          'Numerical finite difference with step size 10⁻¹⁵',
          'Classical optical scanning'
        ],
        correct: 0,
        explanation: 'Because quantum state collapse prevents classical backpropagation tape caching, the parameter-shift rule evaluates exact analytical gradients via shifted circuits.'
      }
    ],
    procedure: [
      'Step 1: Choose a classification dataset (e.g. Linearly Separable vs XOR vs Concentric Circles).',
      'Step 2: Configure QNN architecture: number of qubits, encoding strategy, and variational layer depth L.',
      'Step 3: Initialize weights θ randomly near zero to prevent premature barren plateau saturation.',
      'Step 4: Execute forward pass: encode batch sample x, execute PQC, and measure expectation ⟨Z₀⟩.',
      'Step 5: Compute binary cross-entropy or mean squared error loss L(y, ŷ).',
      'Step 6: Compute gradients via the parameter-shift rule and update parameters using Adam / SGD.',
      'Step 7: Plot training loss curve, accuracy progression, and visual decision boundary contour.'
    ],
    simulationConfig: {
      type: 'qnn',
      qubits: 2,
      layers: 2,
      defaultDataset: 'circles',
      steps: [
        { name: 'Feature Encoding', desc: 'Map 2D feature coordinates x = (x₁, x₂) via angle encoding.', hint: 'Applies Ry(x₁) on q0 and Ry(x₂) on q1.' },
        { name: 'Parameterized Ansatz', desc: 'Apply variational rotation layer Ry(θ) followed by entangling CNOT.', hint: 'Entanglement creates quantum correlations between features.' },
        { name: 'Forward Measurement', desc: 'Measure expectation ⟨Z₀⟩ to produce prediction logit.', hint: 'Outputs continuous score in [-1, +1].' },
        { name: 'Loss Evaluation', desc: 'Compute mean squared error loss against ground-truth labels.', hint: 'Calculates MSE = (1/N) ∑ (y_i - ŷ_i)².' },
        { name: 'Gradient Backward Pass', desc: 'Apply parameter-shift rule to evaluate exact ∂L/∂θ.', hint: 'Shifts each angle by ±π/2 to obtain analytical derivative.' },
        { name: 'Weight Update & Decision Boundary', desc: 'Update variational weights and render classification boundary.', hint: 'Accuracy improves across training epochs.' }
      ]
    },
    posttest: [
      {
        question: 'Why cannot classical backpropagation with computational graph caching be directly applied on physical quantum processors?',
        options: [
          'Intermediate quantum states cannot be copied or inspected without measurement collapse (No-Cloning Theorem)',
          'Quantum computers do not support multiplication',
          'Backpropagation only works with sigmoid functions',
          'Quantum gates cannot be represented as matrices'
        ],
        correct: 0,
        explanation: 'Due to the No-Cloning Theorem and wave function collapse upon measurement, intermediate quantum activations cannot be copied or cached during forward passes.'
      },
      {
        question: 'What is the expressibility of a parameterized quantum circuit in QNN theory?',
        options: [
          'The circuit’s ability to generate states exploring the entire Haar-random state space uniformly',
          'The number of lines of code in the simulator',
          'The physical clock speed of the QPU',
          'The size of the hard drive'
        ],
        correct: 0,
        explanation: 'Expressibility quantifies how uniformly a parameterized circuit can explore the unitary or state Hilbert space relative to the uniform Haar measure.'
      },
      {
        question: 'Which strategy helps mitigate barren plateaus when training deep QNN architectures?',
        options: [
          'Layer-by-layer progressive training, local cost functions, and identity-initialized parameters',
          'Using random parameters with massive amplitudes',
          'Avoiding all entanglement gates completely',
          'Running with zero training samples'
        ],
        correct: 0,
        explanation: 'Using local observables (Cerezo et al., 2021), layerwise pretraining, and identity block initializations prevents gradient vanishing.'
      }
    ],
    references: [
      { title: 'Continuous-variable quantum neural networks', authors: 'Killoran, N., Bromley, T. R., Arrazola, J. M., et al.', journal: 'Physical Review Research 1, 033063 (2019)', link: 'https://doi.org/10.1103/PhysRevResearch.1.033063' },
      { title: 'Cost function dependent barren plateaus in shallow parametrized quantum circuits', authors: 'Cerezo, M., Sone, A., Volkoff, T., et al.', journal: 'Nature Communications 12, 1791 (2021)', link: 'https://doi.org/10.1038/s41467-021-21728-w' }
    ]
  },

  /* ------------------------------------------------------------
     9. QUANTUM KERNEL ALIGNMENT (QKA)
     ------------------------------------------------------------ */
  {
    id: 'qka',
    slug: 'qka',
    number: '09',
    title: 'Quantum Kernel Alignment (QKA)',
    shortTitle: 'QKA',
    category: 'Quantum Machine Learning',
    difficulty: 'Expert',
    time: '45 min',
    aim: 'To optimize parameterized quantum kernels to maximize mathematical alignment with target label matrices, optimizing feature map parameters θ via gradient ascent on the centered Frobenius kernel polarization score.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. Distinction: QSVM vs QKA</h3>
        <p>In standard <strong>Quantum Support Vector Machines (QSVM)</strong>, the quantum feature map is fixed a priori (e.g. standard ZZFeatureMap). However, arbitrary fixed quantum kernels frequently fail if the target geometry is misaligned with the natural Hilbert space metric.</p>
        <p><strong>Quantum Kernel Alignment (QKA)</strong> trains the quantum feature map $\\mathcal{U}_{\\Phi}(x, \\vec{\\theta})$ iteratively to maximize alignment between the quantum kernel matrix $\\mathbf{K}_{\\vec{\\theta}}$ and the ideal label kernel matrix $\\mathbf{Y} = y y^T$.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Kernel Alignment Metric</h3>
        <p>The Frobenius inner product alignment $A(\\mathbf{K}, \\mathbf{Y})$ evaluates similarity between kernel matrices:</p>
        <div class="vlab-math-block">
          A(\\mathbf{K}_{\\vec{\\theta}}, \\mathbf{Y}) = \\frac{\\langle \\mathbf{K}_{\\vec{\\theta}}, \\mathbf{Y} \\rangle_F}{\\|\\mathbf{K}_{\\vec{\\theta}}\\|_F \\|\\mathbf{Y}\\|_F} = \\frac{\\sum_{i,j} K_{\\vec{\\theta}}(x_i, x_j) y_i y_j}{\\sqrt{\\sum_{i,j} K_{\\vec{\\theta}}^2(x_i, x_j)} \\sqrt{\\sum_{i,j} Y_{ij}^2}}
        </div>
        <p>QKA maximizes this alignment score $A(\\mathbf{K}_{\\vec{\\theta}}, \\mathbf{Y}) \\in [0, 1]$ via gradient ascent on $\\vec{\\theta}$.</p>
      </div>
    `,
    pretest: [
      {
        question: 'What is the primary conceptual difference between QSVM and Quantum Kernel Alignment (QKA)?',
        options: [
          'QSVM uses a fixed quantum kernel; QKA tunes the quantum kernel parameters to maximize alignment with training labels',
          'QSVM is classical, while QKA is purely analog',
          'QKA cannot classify data',
          'QSVM requires 1,000 qubits while QKA requires 1 qubit'
        ],
        correct: 0,
        explanation: 'QSVM fixes the feature map a priori. QKA optimizes the parameters of the feature map to adapt the kernel to the specific dataset labels.'
      },
      {
        question: 'What does a kernel alignment score of A(K, Y) = 1 indicate?',
        options: [
          'The quantum kernel perfectly matches the ideal label matrix, yielding optimal separability',
          'The kernel has zero variance and fails completely',
          'The quantum state has collapsed',
          'The quantum computer has run out of memory'
        ],
        correct: 0,
        explanation: 'An alignment of 1.0 means the quantum kernel matrix is proportional to yy^T, ensuring complete separation between classes.'
      },
      {
        question: 'Which matrix operation is used to evaluate kernel alignment between K and Y?',
        options: [
          'Frobenius inner product: ⟨K, Y⟩_F = Tr(K^T Y)',
          'Cross-product of 3D vectors',
          'Determinant inversion',
          'QR factorization'
        ],
        correct: 0,
        explanation: 'Kernel alignment is defined as the normalized Frobenius inner product between matrices K and Y.'
      }
    ],
    procedure: [
      'Step 1: Load a binary dataset with complex non-linear boundary characteristics.',
      'Step 2: Construct the ideal target kernel matrix Y_ij = y_i · y_j.',
      'Step 3: Initialize parameterized feature map U_Φ(x, θ) with initial rotation angles θ₀.',
      'Step 4: Compute initial quantum kernel matrix K(θ₀) and baseline alignment score A(K, Y).',
      'Step 5: Compute gradient ∂A/∂θ using parameter-shift rule on pairwise state overlaps.',
      'Step 6: Update kernel parameters θ via gradient ascent: θ_{t+1} = θ_t + η ∇A.',
      'Step 7: Inspect optimized kernel matrix heatmap and verify increased alignment score and improved SVM generalization.'
    ],
    simulationConfig: {
      type: 'qka',
      qubits: 2,
      steps: [
        { name: 'Data & Target Kernel', desc: 'Compute ideal target label matrix Y = y·yᵀ.', hint: 'Y exhibits +1 for same-class pairs and -1 for opposite-class pairs.' },
        { name: 'Initial Kernel Matrix', desc: 'Evaluate unaligned quantum kernel K(θ₀).', hint: 'Baseline alignment is typically low (e.g. A ≈ 0.25 - 0.40).' },
        { name: 'Alignment Scoring', desc: 'Calculate Frobenius normalized alignment score A(K, Y).', hint: 'Quantifies agreement between quantum distance and label boundaries.' },
        { name: 'Gradient Computation', desc: 'Evaluate ∂A/∂θ using parameter-shift rule.', hint: 'Determines parameter updates to maximize kernel polarization.' },
        { name: 'Kernel Optimization', desc: 'Execute gradient ascent steps on kernel parameters θ.', hint: 'Heatmap blocks become crisp and aligned.' },
        { name: 'Optimized Classification', desc: 'Train SVM on the optimized quantum kernel and verify accuracy.', hint: 'Alignment reaches > 0.85; classification accuracy reaches 100%.' }
      ]
    },
    posttest: [
      {
        question: 'Why does optimizing kernel alignment often lead to improved SVM generalization bounds?',
        options: [
          'Higher alignment increases the geometric margin between classes in the quantum Hilbert space',
          'It reduces the number of qubits required to zero',
          'It replaces quantum gates with classical logic gates',
          'It eliminates the need for test datasets'
        ],
        correct: 0,
        explanation: 'Cristianini et al. proved that higher kernel alignment provably bounds and widens the SVM geometric margin, improving generalization.'
      },
      {
        question: 'What is a potential failure mode if QKA overfits the training label matrix Y with too many parameters?',
        options: [
          'The kernel can overfit training noise, memorizing points while losing test generalization',
          'The qubits will heat up',
          'The matrix becomes non-Hermitian',
          'The classical computer runs in reverse'
        ],
        correct: 0,
        explanation: 'Just like classical deep learning, an excessively expressive parameterized quantum kernel can overfit training labels, reducing out-of-sample accuracy.'
      },
      {
        question: 'How are diagonal elements K_ii evaluated in any valid quantum kernel matrix?',
        options: [
          'K_ii = |⟨Φ(x_i)|Φ(x_i)⟩|² = 1 for all normalized quantum states',
          'K_ii = 0',
          'K_ii is random',
          'K_ii = -1'
        ],
        correct: 0,
        explanation: 'Because any normalized quantum state has unit fidelity with itself, all diagonal elements K_ii are identically equal to 1.'
      }
    ],
    references: [
      { title: 'Training Quantum Embedding Kernels on Near-Term Quantum Computers', authors: 'Hubregtsen, T., Pichlmeier, J., Stecher, P., & Bertels, K.', journal: 'Physical Review A 104, 052412 (2021)', link: 'https://doi.org/10.1103/PhysRevA.104.052412' },
      { title: 'On Kernel-Target Alignment', authors: 'Cristianini, N., Shawe-Taylor, J., Elisseeff, A., & Kandola, J.', journal: 'Advances in Neural Information Processing Systems (NIPS) 14 (2001)', link: 'https://papers.nips.cc/paper/2001/hash/c9892a989183de32e976c6f04e700201-Abstract.html' }
    ]
  },

  /* ------------------------------------------------------------
     10. QUANTUM PRINCIPAL COMPONENT ANALYSIS (qPCA)
     ------------------------------------------------------------ */
  {
    id: 'qpca',
    slug: 'qpca',
    number: '10',
    title: 'Quantum Principal Component Analysis (qPCA)',
    shortTitle: 'qPCA',
    category: 'Quantum Machine Learning',
    difficulty: 'Expert',
    time: '45 min',
    aim: 'To simulate Quantum Principal Component Analysis (qPCA) by constructing quantum density matrix representations of covariance data, applying Quantum Phase Estimation to the density matrix ρ, and extracting dominant eigenvalues and principal eigenvectors with exponential speedup.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. Classical PCA vs Quantum PCA</h3>
        <p>Classical Principal Component Analysis (PCA) finds directions of maximum variance for a dataset $\\mathbf{X} \\in \\mathbb{R}^{M \\times N}$ by diagonalizing the sample covariance matrix $\\Sigma = \\frac{1}{M} \\mathbf{X}^T \\mathbf{X}$. The classical computational complexity is $O(N^3)$ or $O(N^2 k)$ for $k$ components.</p>
        <p>Seth Lloyd, Masoud Mohseni, and Patrick Rebentrost (2014) introduced <strong>Quantum PCA (qPCA)</strong>, proving that multiple copies of a quantum state $\\rho$ can be used to simulate $e^{-i\\rho t}$ in time $O(\\log N)$, yielding an exponential speedup in identifying principal components.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Density Matrix Exponentiation</h3>
        <p>Given copies of quantum state $\\rho = \\sum_j \\lambda_j |v_j\\rangle\\langle v_j|$, the swap operator $S$ simulates the density matrix as a Hamiltonian:</p>
        <div class="vlab-math-block">
          \\text{Tr}_1 \\left( e^{-i S \\Delta t} (\\rho \\otimes \\sigma) e^{i S \\Delta t} \\right) = \\sigma - i \\Delta t [\\rho, \\sigma] + O(\\Delta t^2) = e^{-i \\rho \\Delta t} \\sigma e^{i \\rho \\Delta t}
        </div>
        <p>Applying Quantum Phase Estimation using $e^{-i\\rho t}$ decomposes any input state into the eigenbasis $|v_j\\rangle$ while writing eigenvalue $\\lambda_j$ to the register:</p>
        <div class="vlab-math-block">
          \\sum_j c_j |v_j\\rangle |0\\rangle \\xrightarrow{\\text{qPCA}} \\sum_j c_j |v_j\\rangle |\\lambda_j\\rangle
        </div>
      </div>
    `,
    pretest: [
      {
        question: 'What mathematical entity represents the normalized covariance matrix of data in Quantum PCA?',
        options: [
          'A quantum density operator ρ with Tr(ρ) = 1 and ρ ≥ 0',
          'A non-unitary scalar',
          'A classical lookup table',
          'A random vector with infinite length'
        ],
        correct: 0,
        explanation: 'In qPCA, data covariance is represented as a quantum density matrix ρ, whose eigenvalues correspond to principal component variances.'
      },
      {
        question: 'What technique allows qPCA to exponentiate an unknown density matrix e^(-iρt) without classical tomography?',
        options: [
          'Density matrix exponentiation using partial trace over the SWAP operator on multiple copies of ρ',
          'Classical matrix inversion',
          'Brute force trial and error',
          'Direct division by zero'
        ],
        correct: 0,
        explanation: 'Lloyd et al. demonstrated that applying the SWAP operator between copies of state ρ simulates the unitary e^(-iρt) efficiently.'
      },
      {
        question: 'What is the asymptotic runtime scaling of qPCA in terms of feature dimension N?',
        options: [
          'O(log N) — exponential speedup over classical O(N³)',
          'O(N⁴)',
          'O(N!)',
          'Identical to classical O(N³)'
        ],
        correct: 0,
        explanation: 'qPCA operates on quantum states of dimension N using n = log₂ N qubits in time O(log N).'
      }
    ],
    procedure: [
      'Step 1: Prepare synthetic multi-dimensional covariance data with dominant and secondary principal axes.',
      'Step 2: Construct the corresponding 2-qubit density matrix ρ representing the sample covariance.',
      'Step 3: Initialize counting qubits to evaluate eigenvalues via density matrix phase estimation.',
      'Step 4: Execute density matrix exponentiation circuits e^(-iρt).',
      'Step 5: Apply inverse QFT to resolve eigenvalues λ₁ and λ₂.',
      'Step 6: Measure counting register to observe dominant principal component projection.',
      'Step 7: Verify explained variance ratio (λ₁ / (λ₁ + λ₂)) and compare with classical SVD.'
    ],
    simulationConfig: {
      type: 'qpca',
      qubits: 3,
      steps: [
        { name: 'Covariance State Prep', desc: 'Encode 2D covariance data into density operator ρ.', hint: 'Eigenvalues λ₁ = 0.80, λ₂ = 0.20.' },
        { name: 'Density Exponentiation', desc: 'Simulate e^(-iρt) using repeated SWAP gate coupling.', hint: 'Emulates Hamiltonian evolution driven by data itself.' },
        { name: 'Phase Estimation on ρ', desc: 'Apply QPE to extract eigenvalues into counting register.', hint: 'Encodes eigenvalue phases into counting wires.' },
        { name: 'Spectral Inversion', desc: 'Execute inverse QFT to resolve discrete eigenvalue bins.', hint: 'Peaks appear at dominant eigenvalue amplitudes.' },
        { name: 'Principal Component Readout', desc: 'Measure dominant eigenvector and eigenvalue projection.', hint: 'Identifies PC1 direction with 80% explained variance.' },
        { name: 'Dimensionality Reduction', desc: 'Project test states onto principal subspace.', hint: 'Dimensionality reduced while preserving dominant information.' }
      ]
    },
    posttest: [
      {
        question: 'Under what condition does qPCA provide meaningful advantage for data analysis?',
        options: [
          'When data can be loaded efficiently into quantum states and only properties of principal components (not full classical readout) are needed',
          'Only when data has exactly 2 samples',
          'When all eigenvalues are zero',
          'When run on classical laptops without quantum hardware'
        ],
        correct: 0,
        explanation: 'The speedup holds when states can be prepared efficiently (e.g. via qRAM) and subsequent quantum algorithms process the principal state directly.'
      },
      {
        question: 'What is the sum of all eigenvalues of any valid quantum density matrix ρ?',
        options: [
          'Exactly 1 (since Tr(ρ) = 1)',
          'Infinity',
          'Zero',
          '-1'
        ],
        correct: 0,
        explanation: 'By definition, any density operator satisfies Tr(ρ) = ∑ λ_j = 1, corresponding to total probability conservation.'
      },
      {
        question: 'How is the explained variance ratio of the first principal component defined?',
        options: [
          'λ₁ / (∑_j λ_j) = λ₁ / Tr(ρ)',
          'λ₁ · Tr(ρ)',
          '1 - λ₁',
          'λ₁ / N²'
        ],
        correct: 0,
        explanation: 'The explained variance ratio is the fraction of total variance captured by the first component: λ₁ / ∑ λ_j.'
      }
    ],
    references: [
      { title: 'Quantum principal component analysis', authors: 'Lloyd, S., Mohseni, M., & Rebentrost, P.', journal: 'Nature Physics 10, 631–633 (2014)', link: 'https://doi.org/10.1038/nphys3029' },
      { title: 'Quantum Algorithms for Data Analysis', authors: 'Biamonte, J., Wittek, P., Pancotti, N., et al.', journal: 'Nature 549, 195–202 (2017)', link: 'https://doi.org/10.1038/nature23474' }
    ]
  },

  /* ------------------------------------------------------------
     11. HHL ALGORITHM (HARROW-HASSIDIM-LLOYD)
     ------------------------------------------------------------ */
  {
    id: 'hhl',
    slug: 'hhl',
    number: '11',
    title: 'HHL Algorithm (Linear Systems of Equations)',
    shortTitle: 'HHL Algorithm',
    category: 'Quantum Simulation',
    difficulty: 'Expert',
    time: '50 min',
    aim: 'To simulate the Harrow-Hassidim-Lloyd (HHL) algorithm for solving linear systems of equations A|x⟩ = |b⟩, executing phase estimation of matrix A, controlled rotation of an auxiliary qubit proportional to 1/λ, inverse QPE, and post-selection.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. Solving Systems of Linear Equations</h3>
        <p>Given an $N \\times N$ Hermitian matrix $A$ with condition number $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$ and a unit vector $\\vec{b}$, the task is to find $\\vec{x}$ satisfying $A \\vec{x} = \\vec{b}$. Classically, Gaussian elimination requires $O(N^3)$ operations, while the Conjugate Gradient method requires $O(N s \\kappa)$ for $s$-sparse matrices.</p>
        <p>Harrow, Hassidim, and Lloyd (HHL, 2009) demonstrated that quantum computers can prepare a quantum state $|x\\rangle \\propto A^{-1} |b\\rangle$ in time:</p>
        <div class="vlab-math-block">
          O\\left( s^2 \\kappa^2 \\log(N) / \\epsilon \\right)
        </div>
        <p>This achieves an exponential scaling advantage in matrix dimension $N$.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. HHL 4-Stage Architecture</h3>
        <ol>
          <li><strong>State Preparation:</strong> Prepare vector $|b\\rangle = \\sum_j \\beta_j |u_j\\rangle$ in the eigenbasis of $A$.</li>
          <li><strong>Quantum Phase Estimation (QPE):</strong> Use $e^{i A t}$ to write eigenvalues $\\lambda_j$ to a clock register: $\\sum_j \\beta_j |u_j\\rangle |\\lambda_j\\rangle$.</li>
          <li><strong>Controlled Inversion Rotation:</strong> Rotate an auxiliary qubit conditioned on $\\lambda_j$:
            <div class="vlab-math-block">
              \\sum_j \\beta_j |u_j\\rangle |\\lambda_j\\rangle \\left( \\sqrt{1 - \\frac{C^2}{\\lambda_j^2}} |0\\rangle + \\frac{C}{\\lambda_j} |1\\rangle \\right)
            </div>
          </li>
          <li><strong>Uncomputation & Post-Selection:</strong> Apply QPE$^{\\dagger}$ to uncompute the clock register. Measuring the auxiliary qubit in state $|1\\rangle$ post-selects $|x\\rangle = \\sum_j \\frac{\\beta_j}{\\lambda_j} |u_j\\rangle \\propto A^{-1}|b\\rangle$.</li>
        </ol>
      </div>
    `,
    pretest: [
      {
        question: 'What mathematical output does the HHL algorithm produce?',
        options: [
          'A normalized quantum state |x⟩ proportional to A⁻¹|b⟩',
          'A classical printed list of all N numerical values of vector x',
          'The determinant of matrix A only',
          'A diagonal identity matrix'
        ],
        correct: 0,
        explanation: 'HHL prepares the normalized quantum state |x⟩ = A⁻¹|b⟩ / ||A⁻¹|b⟩||. It does not output all N entries classically without full tomography.'
      },
      {
        question: 'What is the role of the auxiliary ancilla qubit in the HHL algorithm?',
        options: [
          'It undergoes controlled rotation by angle arcsin(C / λ) so that measuring |1⟩ post-selects division by eigenvalue λ',
          'It stores the cooling fluid temperature',
          'It is used as a parity checker for bit flips',
          'It counts the number of matrix rows'
        ],
        correct: 0,
        explanation: 'Conditioned on eigenvalue λ, the ancilla rotates to (C/λ)|1⟩ + ... Post-selecting on |1⟩ applies the required 1/λ inversion factor.'
      },
      {
        question: 'What is the condition number κ of a matrix, and how does it affect HHL performance?',
        options: [
          'κ = λ_max / λ_min; higher κ increases runtime quadratically as O(κ²)',
          'κ is the number of qubits; higher κ is always faster',
          'κ is the temperature of the chip',
          'κ is the classical cost of Gaussian elimination'
        ],
        correct: 0,
        explanation: 'The condition number κ = λ_max/λ_min measures matrix ill-conditioning. HHL runtime scales polynomially with κ.'
      }
    ],
    procedure: [
      'Step 1: Choose a 2×2 Hermitian matrix A (e.g. A = [[1.5, 0.5], [0.5, 1.5]] with eigenvalues λ₁ = 1, λ₂ = 2).',
      'Step 2: Choose input vector |b⟩ (e.g. |b⟩ = [1, 0]ᵀ).',
      'Step 3: Prepare state |b⟩ on the target wire.',
      'Step 4: Execute QPE using Hamiltonian simulation of e^(iAt) to extract eigenvalues into clock qubits.',
      'Step 5: Apply controlled Ry(2 arcsin(C/λ)) rotation onto the auxiliary qubit.',
      'Step 6: Apply inverse QPE to return clock qubits to the |00⟩ ground state.',
      'Step 7: Post-select on auxiliary qubit |1⟩ and verify that output state matches classical solution A⁻¹b.'
    ],
    simulationConfig: {
      type: 'hhl',
      qubits: 4,
      defaultMatrix: 'symmetric2x2',
      steps: [
        { name: 'State Prep |b⟩', desc: 'Initialize input register to represent normalized vector |b⟩.', hint: '|b⟩ = |0⟩ corresponds to vector [1, 0]ᵀ.' },
        { name: 'QPE Matrix Decomposition', desc: 'Simulate e^(iAt) to decompose |b⟩ in eigenbasis |u_j⟩ with eigenvalues λ_j.', hint: 'Eigenvalues λ₁ = 1.0 (phase 0.25) and λ₂ = 2.0 (phase 0.50).' },
        { name: 'Controlled 1/λ Rotation', desc: 'Rotate ancilla qubit by angle θ = 2 arcsin(C/λ).', hint: 'Smaller eigenvalues produce larger rotation amplitudes.' },
        { name: 'Clock Uncomputation (QPE†)', desc: 'Run inverse QPE to disentangle clock register.', hint: 'Returns clock register to clean |00⟩ state.' },
        { name: 'Post-Selection Flag', desc: 'Measure auxiliary qubit, conditioning on |1⟩.', hint: 'Post-selection succeeds with probability P(1) = ||C A⁻¹ b||².' },
        { name: 'Solution Verification', desc: 'Verify output amplitudes against exact classical solution x = A⁻¹b.', hint: 'Matches exact normalized solution [0.75, -0.25]ᵀ.' }
      ]
    },
    posttest: [
      {
        question: 'Why is the uncomputation step (QPE†) essential before measuring the auxiliary qubit in HHL?',
        options: [
          'To remove entanglement between the clock register and target state, avoiding phase decoherence upon measurement',
          'To delete the quantum code',
          'To reset the hardware clock',
          'Because quantum computers can only run backwards'
        ],
        correct: 0,
        explanation: 'Without uncomputing QPE, measuring the ancilla leaves the solution entangled with clock qubits, corrupting the fidelity of state |x⟩.'
      },
      {
        question: 'Under what condition does post-selection on the auxiliary qubit succeed with high probability?',
        options: [
          'When constant C is chosen near the minimum eigenvalue C ≈ λ_min',
          'When C is set to infinity',
          'When all matrix entries are zero',
          'When the system has infinite qubits'
        ],
        correct: 0,
        explanation: 'Choosing C ≈ λ_min maximizes the probability of measuring the ancilla in state |1⟩ while ensuring arcsin arguments remain ≤ 1.'
      },
      {
        question: 'What is the "input problem" caveat when discussing HHL speedup in practical applications?',
        options: [
          'Preparing an arbitrary classical N-dimensional vector |b⟩ as a quantum state can take O(N) time without efficient qRAM',
          'HHL only works on matrices with 1 element',
          'Quantum computers cannot accept inputs',
          'The input must always be a secret password'
        ],
        correct: 0,
        explanation: 'If loading classical vector |b⟩ into quantum state amplitudes requires O(N) steps, the exponential speedup over classical algorithms is nullified.'
      }
    ],
    references: [
      { title: 'Quantum algorithm for linear systems of equations', authors: 'Harrow, A. W., Hassidim, A., & Lloyd, S.', journal: 'Physical Review Letters 103, 150502 (2009)', link: 'https://doi.org/10.1103/PhysRevLett.103.150502' },
      { title: 'Experimental realization of quantum algorithm for solving linear systems of equations', authors: 'Cai, X.-D., Weedbrook, C., Su, Z.-E., et al.', journal: 'Physical Review Letters 110, 230501 (2013)', link: 'https://doi.org/10.1103/PhysRevLett.110.230501' }
    ]
  },

  /* ------------------------------------------------------------
     12. DEUTSCH-JOZSA ALGORITHM
     ------------------------------------------------------------ */
  {
    id: 'deutsch-jozsa',
    slug: 'deutsch-jozsa',
    number: '12',
    title: 'Deutsch-Jozsa Algorithm',
    shortTitle: 'Deutsch-Jozsa',
    category: 'Fundamentals & Primitives',
    difficulty: 'Intermediate',
    time: '25 min',
    aim: 'To verify the exponential quantum oracle query advantage of the Deutsch-Jozsa algorithm over deterministic classical algorithms by evaluating black-box Boolean functions f: {0,1}^n → {0,1} in exactly 1 query using quantum interference.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. Problem Statement</h3>
        <p>Given an unknown black-box Boolean function $f: \\{0, 1\\}^n \\to \\{0, 1\\}$ promised to be either:</p>
        <ul>
          <li><strong>Constant:</strong> $f(x)$ yields the same value (always 0 or always 1) for all inputs $x$.</li>
          <li><strong>Balanced:</strong> $f(x) = 0$ for exactly half ($2^{n-1}$) of inputs and $f(x) = 1$ for the other half.</li>
        </ul>
        <p>Classically, in the worst case, deciding with 100% certainty requires evaluating $2^{n-1} + 1$ queries (more than half the search space). The Deutsch-Jozsa algorithm determines the answer in <strong>exactly 1 quantum query</strong>.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Phase Kickback Mechanism</h3>
        <p>Preparing the ancilla qubit in state $|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$, applying the oracle unitary $U_f: |x\\rangle|y\\rangle \\to |x\\rangle|y \\oplus f(x)\\rangle$ induces phase kickback:</p>
        <div class="vlab-math-block">
          U_f |x\\rangle |-\\rangle = (-1)^{f(x)} |x\\rangle |-\\rangle
        </div>
        <p>Applying Hadamard gates $H^{\\otimes n}$ to the input register before and after the oracle produces:</p>
        <div class="vlab-math-block">
          |\\psi_f\\rangle = \\sum_{z=0}^{2^n - 1} \\left( \\frac{1}{2^n} \\sum_{x=0}^{2^n - 1} (-1)^{x \\cdot z + f(x)} \\right) |z\\rangle
        </div>
        <p>For $z = |00\\dots0\\rangle$, the amplitude is $\\frac{1}{2^n} \\sum_x (-1)^{f(x)}$. If $f$ is constant, amplitude is $\\pm 1$ ($100\\%$ probability of measuring all zeros). If $f$ is balanced, positive and negative terms cancel orthogonally to exactly $0$ ($0\\%$ probability of all zeros).</p>
      </div>
    `,
    pretest: [
      {
        question: 'How many queries does a deterministic classical algorithm need in the worst case to determine whether an n-bit function is constant or balanced?',
        options: [
          '2^(n-1) + 1 queries',
          'Exactly 1 query',
          'n queries',
          'Infinite queries'
        ],
        correct: 0,
        explanation: 'In the worst case, a classical algorithm might see 2^(n-1) identical answers and must check one more to confirm if it is balanced or constant.'
      },
      {
        question: 'What measurement result on the input register proves that the function is CONSTANT in the Deutsch-Jozsa algorithm?',
        options: [
          'Measuring the all-zero state |00...0⟩ with 100% probability',
          'Measuring any non-zero state',
          'Measuring state |11...1⟩ only',
          'Measuring nothing'
        ],
        correct: 0,
        explanation: 'For a constant function, constructive interference yields amplitude ±1 on |00...0⟩. Any other measurement proves the function is balanced.'
      },
      {
        question: 'Why must the ancilla qubit be initialized in the state |-⟩ = (|0⟩ - |1⟩)/√2?',
        options: [
          'To generate phase kickback (-1)^f(x) on the input register',
          'To cool the quantum processor',
          'To store the classical output string',
          'To prevent measurement noise'
        ],
        correct: 0,
        explanation: 'Since X|0⟩ - X|1⟩ = |1⟩ - |0⟩ = -(|0⟩ - |1⟩), state |-⟩ is an eigenstate of NOT with eigenvalue (-1)^f(x), kicking the phase into the input register.'
      }
    ],
    procedure: [
      'Step 1: Select the function oracle type: Constant-0, Constant-1, Balanced-Alternating, or Balanced-Parity.',
      'Step 2: Initialize n input qubits to |0⟩ and 1 ancilla qubit to |1⟩.',
      'Step 3: Apply Hadamard gates across all qubits to prepare |+⟩^⊗n and |-⟩.',
      'Step 4: Query the quantum oracle unitary U_f, causing phase kickback.',
      'Step 5: Apply a second layer of Hadamard gates across the n input qubits.',
      'Step 6: Measure the n input qubits in the computational basis.',
      'Step 7: If outcome is |00...0⟩, declare CONSTANT; otherwise declare BALANCED.'
    ],
    simulationConfig: {
      type: 'deutsch-jozsa',
      qubits: 3,
      oracleTypes: ['constant-0', 'constant-1', 'balanced-alternating', 'balanced-parity'],
      defaultOracle: 'balanced-alternating',
      steps: [
        { name: 'Register Initialization', desc: 'Initialize input register to |000⟩ and ancilla to |1⟩.', hint: 'Input state is |000⟩ ⊗ |1⟩.' },
        { name: 'Hadamard Superposition', desc: 'Apply H to all 4 qubits, creating |+⟩^⊗3 ⊗ |-⟩.', hint: 'Input explores all 8 configurations simultaneously.' },
        { name: 'Oracle Evaluation (U_f)', desc: 'Apply oracle U_f, triggering phase kickback (-1)^f(x).', hint: 'Balanced oracle flips phase on exactly half the states.' },
        { name: 'Interference Layer', desc: 'Apply terminal Hadamard layer H^⊗3 to input qubits.', hint: 'Constant phases interfere constructively at |000⟩; balanced phases cancel.' },
        { name: 'Measurement Readout', desc: 'Measure input register in the standard basis.', hint: 'Measuring non-zero (e.g. |001⟩) confirms balanced in 1 query.' },
        { name: 'Advantage Analysis', desc: 'Compare 1 quantum query vs 2^(n-1)+1 classical queries.', hint: 'Demonstrates exact deterministic exponential query speedup.' }
      ]
    },
    posttest: [
      {
        question: 'If a Deutsch-Jozsa simulation with n = 4 input qubits measures state |0100⟩, what is the conclusion?',
        options: [
          'The function is BALANCED',
          'The function is CONSTANT',
          'The simulation was invalid',
          'The function is neither'
        ],
        correct: 0,
        explanation: 'Any non-zero bitstring measurement proves with 100% mathematical certainty that the function is balanced.'
      },
      {
        question: 'Does the Deutsch-Jozsa algorithm provide an exponential advantage over randomized bounded-error classical algorithms (BPP)?',
        options: [
          'No, classical randomized algorithms can sample a few times and decide with high probability in O(1) queries',
          'Yes, even randomized classical algorithms take O(2^n)',
          'Yes, classical computers cannot generate random numbers',
          'Only on Tuesdays'
        ],
        correct: 0,
        explanation: 'Randomized classical algorithms need only k queries to achieve error ≤ 2^(-k). Deutsch-Jozsa’s speedup is exact vs deterministic classical algorithms (P vs EQP).'
      },
      {
        question: 'What quantum phenomenon is the fundamental operating principle of the Deutsch-Jozsa algorithm?',
        options: [
          'Quantum interference of probability amplitudes',
          'Quantum thermal annealing',
          'Gravitational redshift',
          'Continuous quantum cloning'
        ],
        correct: 0,
        explanation: 'Destructive and constructive interference of amplitudes across all computational paths in parallel is what enables 1-query resolution.'
      }
    ],
    references: [
      { title: 'Rapid solution of problems by quantum computation', authors: 'Deutsch, D., & Jozsa, R.', journal: 'Proc. Royal Soc. London A 439, 553–558 (1992)', link: 'https://doi.org/10.1098/rspa.1992.0167' },
      { title: 'Experimental realization of the Deutsch-Jozsa algorithm with nuclear magnetic resonance', authors: 'Chuang, I. L., Vandersypen, L. M., Zhou, X., et al.', journal: 'Nature 393, 143–146 (1998)', link: 'https://doi.org/10.1038/30181' }
    ]
  },

  /* ------------------------------------------------------------
     13. BERNSTEIN-VAZIRANI ALGORITHM
     ------------------------------------------------------------ */
  {
    id: 'bernstein-vazirani',
    slug: 'bernstein-vazirani',
    number: '13',
    title: 'Bernstein-Vazirani Algorithm',
    shortTitle: 'Bernstein-Vazirani',
    category: 'Fundamentals & Primitives',
    difficulty: 'Intermediate',
    time: '25 min',
    aim: 'To reconstruct a hidden binary string s of length n in exactly 1 quantum query using the Bernstein-Vazirani algorithm, evaluating phase kickback and inner product oracle evaluation against classical n-query bounds.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. The Hidden Bitstring Problem</h3>
        <p>Consider an unknown Boolean function defined as the inner product modulo 2 with a secret bitstring $s \\in \\{0, 1\\}^n$:</p>
        <div class="vlab-math-block">
          f_s(x) = s \\cdot x \\pmod 2 = (s_0 x_0 \\oplus s_1 x_1 \\oplus \\dots \\oplus s_{n-1} x_{n-1})
        </div>
        <p>To learn the secret string $s$ classically, one must query the oracle $n$ times using basis inputs $x = 100\\dots0, 010\\dots0, \\dots$ to extract each bit $s_i$ individually. The Bernstein-Vazirani algorithm recovers all $n$ bits simultaneously in <strong>a single quantum query</strong>.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Quantum Interference Synthesis</h3>
        <p>Preparing the ancilla in $|-\\rangle$ produces the phase kickback $(-1)^{s \\cdot x}$ on the uniform superposition state:</p>
        <div class="vlab-math-block">
          |\\psi_1\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_{x=0}^{2^n - 1} (-1)^{s \\cdot x} |x\\rangle
        </div>
        <p>Applying the Hadamard transform $H^{\\otimes n}$ to this state maps it directly to $|s\\rangle$, because $H^{\\otimes n} |x\\rangle = \\frac{1}{\\sqrt{2^n}} \\sum_y (-1)^{x \\cdot y} |y\\rangle$ and:</p>
        <div class="vlab-math-block">
          H^{\\otimes n} \\left( \\frac{1}{\\sqrt{2^n}} \\sum_{x} (-1)^{s \\cdot x} |x\\rangle \\right) = |s\\rangle
        </div>
        <p>Measuring the input register yields the exact secret string $s$ with $100\\%$ probability.</p>
      </div>
    `,
    pretest: [
      {
        question: 'How many queries does a classical algorithm require to determine an n-bit hidden string s in f(x) = s · x mod 2?',
        options: [
          'Exactly n queries',
          'Exactly 1 query',
          '2^n queries',
          'n! queries'
        ],
        correct: 0,
        explanation: 'Each classical evaluation gives 1 bit of information. Since s has n independent bits, exactly n classical queries are required.'
      },
      {
        question: 'How many quantum queries does the Bernstein-Vazirani algorithm require to recover all n bits of s?',
        options: [
          'Exactly 1 query',
          'n queries',
          'n/2 queries',
          '√n queries'
        ],
        correct: 0,
        explanation: 'The Bernstein-Vazirani algorithm determines all n bits of the secret string s in a single quantum query.'
      },
      {
        question: 'What quantum gate layer translates the phase-encoded string state ∑ (-1)^(s·x) |x⟩ into basis state |s⟩?',
        options: [
          'A layer of Hadamard gates H^⊗n across all input qubits',
          'A layer of Pauli-X gates',
          'A continuous measurement gate',
          'A classical copy operator'
        ],
        correct: 0,
        explanation: 'The n-qubit Hadamard transform converts the phase-encoded state directly into computational basis state |s⟩ by constructive interference.'
      }
    ],
    procedure: [
      'Step 1: Choose or generate a secret hidden bitstring s (e.g. s = 101, 110, 011).',
      'Step 2: Initialize n input qubits to |0⟩ and the ancilla qubit to |1⟩.',
      'Step 3: Apply Hadamard gates across all n + 1 qubits.',
      'Step 4: Execute the inner product oracle U_s, where CNOT gates connect wires where s_i = 1 to the ancilla.',
      'Step 5: Apply terminal Hadamard gates across the n input qubits.',
      'Step 6: Measure the input register in the computational basis.',
      'Step 7: Confirm that the measured bitstring matches the hidden secret string s with 100% fidelity.'
    ],
    simulationConfig: {
      type: 'bernstein-vazirani',
      qubits: 3,
      defaultSecret: '101',
      steps: [
        { name: 'Secret Configuration', desc: 'Set secret bitstring s = (s₀, s₁, s₂).', hint: 'Chosen secret: s = 101 (binary).' },
        { name: 'Superposition Prep', desc: 'Apply Hadamard layer to create equal superposition across all inputs.', hint: 'Input state |+⟩^⊗3 explores all 8 bitstrings.' },
        { name: 'Oracle Phase Kickback', desc: 'Apply CNOT gates from wires where s_i = 1 to the ancilla |-⟩.', hint: 'CNOTs on wires 0 and 2 kick phase (-1)^(s·x).' },
        { name: 'Hadamard Inversion', desc: 'Apply terminal Hadamard layer H^⊗3 to all input wires.', hint: 'Constructive interference refocuses all amplitude onto |s⟩.' },
        { name: 'Measurement Readout', desc: 'Measure the input qubits in standard basis.', hint: 'Readout yields exactly 101 with 100% probability.' },
        { name: 'Query Count Comparison', desc: 'Verify 1 quantum query vs n classical queries.', hint: 'Factor of n speedup achieved deterministically.' }
      ]
    },
    posttest: [
      {
        question: 'If the secret bitstring is s = 1101, which input qubits must be connected to the ancilla via CNOT gates in the oracle circuit?',
        options: [
          'Qubits 0, 1, and 3 (the indices where bit is 1)',
          'All 4 qubits',
          'Only qubit 2',
          'No CNOT gates are used'
        ],
        correct: 0,
        explanation: 'The inner product oracle applies CNOT gates from input qubit i to the ancilla for each bit position where s_i = 1.'
      },
      {
        question: 'Why is the Bernstein-Vazirani algorithm theoretically significant even though its speedup is polynomial (1 vs n)?',
        options: [
          'It demonstrated that quantum computers can extract non-local relational information across n dimensions simultaneously',
          'It proved that quantum mechanics violates thermodynamics',
          'It replaced RSA encryption',
          'It was the first algorithm to calculate decimals of pi'
        ],
        correct: 0,
        explanation: 'It established the power of phase kickback and Hadamard interference, serving as a stepping stone toward Shor’s period finding.'
      },
      {
        question: 'What is the probability of measuring any incorrect bitstring s’ ≠ s in an ideal noiseless Bernstein-Vazirani circuit?',
        options: [
          'Exactly 0%',
          '50%',
          '1/2^n',
          '10%'
        ],
        correct: 0,
        explanation: 'In a noiseless circuit, destructive interference completely cancels all amplitudes for any state other than |s⟩, making error strictly 0%.'
      }
    ],
    references: [
      { title: 'Quantum complexity theory', authors: 'Bernstein, E., & Vazirani, U.', journal: 'SIAM Journal on Computing 26, 1411–1473 (1997)', link: 'https://doi.org/10.1137/S0097539796300921' }
    ]
  },

  /* ------------------------------------------------------------
     14. QUANTUM TELEPORTATION
     ------------------------------------------------------------ */
  {
    id: 'quantum-teleportation',
    slug: 'quantum-teleportation',
    number: '14',
    title: 'Quantum Teleportation',
    shortTitle: 'Teleportation',
    category: 'Quantum Information',
    difficulty: 'Intermediate',
    time: '30 min',
    aim: 'To simulate the canonical Bennett et al. (1993) Quantum Teleportation protocol, transmitting an unknown quantum state |ψ⟩ from Alice to Bob using a shared EPR Bell pair, Bell-state measurement, 2 classical bits of communication, and conditional Pauli corrections.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. The Quantum Teleportation Protocol</h3>
        <p>The No-Cloning Theorem forbids creating an identical copy of an arbitrary unknown quantum state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$. However, <strong>Quantum Teleportation</strong> (Bennett et al., 1993) allows transferring the exact state to a distant qubit without physically transmitting the qubit itself, consuming one entangled pair and 2 classical bits.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Protocol Stages</h3>
        <ol>
          <li><strong>EPR Pair Generation:</strong> A Bell pair $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$ is distributed between Alice (qubit 1) and Bob (qubit 2).</li>
          <li><strong>Alice’s Joint Bell Measurement:</strong> Alice performs a CNOT gate from her input qubit 0 ($|\\psi\\rangle$) to qubit 1, applies a Hadamard gate to qubit 0, and measures both in the computational basis, producing 2 classical bits $(m_0, m_1)$.</li>
          <li><strong>Classical Transmission:</strong> Alice sends classical bits $m_0, m_1$ to Bob over a classical channel (governed by the speed of light).</li>
          <li><strong>Bob’s Conditional Pauli Corrections:</strong> Based on the 2 classical bits received, Bob applies $X^{m_1} Z^{m_0}$ to his qubit:
            <table class="vlab-table">
              <thead><tr><th>Alice’s Measurement $(m_0, m_1)$</th><th>Bob’s Pre-Correction State</th><th>Bob’s Correction</th><th>Bob’s Final State</th></tr></thead>
              <tbody>
                <tr><td>$00$</td><td>$\\alpha|0\\rangle + \\beta|1\\rangle$</td><td>$I$ (None)</td><td>$|\\psi\\rangle$</td></tr>
                <tr><td>$01$</td><td>$\\alpha|1\\rangle + \\beta|0\\rangle$</td><td>$X$</td><td>$|\\psi\\rangle$</td></tr>
                <tr><td>$10$</td><td>$\\alpha|0\\rangle - \\beta|1\\rangle$</td><td>$Z$</td><td>$|\\psi\\rangle$</td></tr>
                <tr><td>$11$</td><td>$\\alpha|1\\rangle - \\beta|0\\rangle$</td><td>$X Z$</td><td>$|\\psi\\rangle$</td></tr>
              </tbody>
            </table>
          </li>
        </ol>
      </div>
    `,
    pretest: [
      {
        question: 'Does quantum teleportation transmit information faster than the speed of light?',
        options: [
          'No, because Bob cannot reconstruct the state without Alice’s 2 classical bits, which travel at or below light speed',
          'Yes, teleportation is instantaneous',
          'Only when using optical fibers',
          'Yes, violating special relativity'
        ],
        correct: 0,
        explanation: 'Teleportation requires 2 classical bits transmitted over conventional channels. Without Alice’s classical message, Bob’s local density matrix is maximally mixed (zero information).'
      },
      {
        question: 'What happens to Alice’s original input qubit |ψ⟩ during the teleportation protocol?',
        options: [
          'It is destroyed by Alice’s Bell-state measurement, adhering to the No-Cloning Theorem',
          'It remains an identical duplicate copy of |ψ⟩',
          'It becomes entangled with the earth’s magnetic field',
          'It increases in energy'
        ],
        correct: 0,
        explanation: 'Alice’s measurement collapses her input qubit, destroying the original quantum state so that only one copy exists at Bob’s terminal (No-Cloning Theorem).'
      },
      {
        question: 'If Alice measures m₀ = 1 and m₁ = 0, what gate must Bob apply to recover state |ψ⟩?',
        options: [
          'Pauli-Z gate',
          'Pauli-X gate',
          'Hadamard gate',
          'Identity gate (no correction)'
        ],
        correct: 0,
        explanation: 'When Alice measures (1, 0), Bob holds α|0⟩ - β|1⟩. Applying the Pauli-Z gate flips the negative sign, reconstructing α|0⟩ + β|1⟩.'
      }
    ],
    procedure: [
      'Step 1: Choose Alice’s input state |ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)e^(iφ)|1⟩ using Bloch angles (θ, φ).',
      'Step 2: Prepare the entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 between Alice’s ancilla and Bob’s qubit.',
      'Step 3: Alice performs Bell-state measurement (CNOT from |ψ⟩ to ancilla, followed by Hadamard on |ψ⟩).',
      'Step 4: Alice measures both qubits to obtain 2 classical bits (m₀, m₁).',
      'Step 5: Transmit the 2 classical bits over the classical communication channel to Bob.',
      'Step 6: Bob applies conditional Pauli corrections: X if m₁ = 1, and Z if m₀ = 1.',
      'Step 7: Verify that Bob’s reconstructed Bloch sphere state matches Alice’s initial state with 100% fidelity.'
    ],
    simulationConfig: {
      type: 'teleportation',
      qubits: 3,
      defaultTheta: 1.047, // 60 deg
      defaultPhi: 0.785,  // 45 deg
      steps: [
        { name: 'State Preparation', desc: 'Alice prepares unknown input state |ψ⟩ on qubit 0.', hint: 'Set coordinates using θ and φ sliders.' },
        { name: 'Bell Pair Creation', desc: 'Create entangled Bell pair |Φ⁺⟩ between qubits 1 and 2.', hint: 'Applies H on q1 followed by CNOT from q1 to q2.' },
        { name: 'Alice Bell Measurement', desc: 'Alice applies CNOT(q0 -> q1) and H(q0), then measures.', hint: 'Encodes state information into joint correlations.' },
        { name: 'Classical Transmission', desc: 'Send 2 classical bits (m₀, m₁) across communication link.', hint: '4 possible measurement outcomes (00, 01, 10, 11).' },
        { name: 'Bob Pauli Correction', desc: 'Bob applies conditional gates X^(m₁) Z^(m₀) to qubit 2.', hint: 'Rotates Bob’s qubit into alignment with |ψ⟩.' },
        { name: 'Fidelity Verification', desc: 'Compare Bob’s reconstructed state with Alice’s initial state.', hint: 'Fidelity F = |⟨ψ_initial|ψ_Bob⟩|² = 1.000.' }
      ]
    },
    posttest: [
      {
        question: 'What resources are consumed to teleport 1 qubit of quantum information?',
        options: [
          '1 entangled EPR pair and 2 classical bits',
          '1 classical bit and zero entanglement',
          '100 qubits',
          'Unlimited bandwidth'
        ],
        correct: 0,
        explanation: 'Standard quantum teleportation strictly requires 1 shared ebit (entangled pair) and 2 classical bits of communication.'
      },
      {
        question: 'If Bob does not receive Alice’s classical bits and measures his qubit, what will he observe?',
        options: [
          'A completely random mixed state (density matrix I/2) with zero information about |ψ⟩',
          'The exact state |ψ⟩ immediately',
          'Only state |0⟩',
          'An optical signal'
        ],
        correct: 0,
        explanation: 'Without the classical bits, Bob’s reduced density matrix is the maximally mixed state ρ_Bob = I/2, ensuring causality and relativity are respected.'
      },
      {
        question: 'What is the state fidelity F(ρ₁, ρ₂) between Alice’s input and Bob’s corrected state in an ideal teleportation circuit?',
        options: [
          'F = 1.0 (100% perfect reconstruction)',
          'F = 0.5',
          'F = 0.0',
          'F = 0.707'
        ],
        correct: 0,
        explanation: 'In the absence of decoherence noise, the teleportation protocol guarantees unit fidelity F = 1.0.'
      }
    ],
    references: [
      { title: 'Teleporting an unknown quantum state via dual classical and Einstein-Podolsky-Rosen channels', authors: 'Bennett, C. H., Brassard, G., Crépeau, C., et al.', journal: 'Physical Review Letters 70, 1895–1899 (1993)', link: 'https://doi.org/10.1103/PhysRevLett.70.1895' },
      { title: 'Experimental quantum teleportation', authors: 'Bouwmeester, D., Pan, J.-W., Mattle, K., et al.', journal: 'Nature 390, 575–579 (1997)', link: 'https://doi.org/10.1038/37539' }
    ]
  },

  /* ------------------------------------------------------------
     15. QUANTUM AMPLITUDE ESTIMATION (QAE)
     ------------------------------------------------------------ */
  {
    id: 'qae',
    slug: 'qae',
    number: '15',
    title: 'Quantum Amplitude Estimation (QAE)',
    shortTitle: 'QAE',
    category: 'Quantum Optimization',
    difficulty: 'Expert',
    time: '45 min',
    aim: 'To simulate Quantum Amplitude Estimation (QAE) combining Grover amplitude amplification with Quantum Phase Estimation, estimating target state probability amplitude a with quadratic speedup O(1/ε vs 1/ε²) over classical Monte Carlo methods.',
    theory: `
      <div class="vlab-edu-section">
        <h3>1. The Amplitude Estimation Problem</h3>
        <p>Given a quantum algorithm $\\mathcal{A}$ that acts on state $|0\\rangle$ to produce a superposition:</p>
        <div class="vlab-math-block">
          \\mathcal{A} |0\\rangle = \\sqrt{1 - a} |\\psi_0\\rangle |0\\rangle + \\sqrt{a} |\\psi_1\\rangle |1\\rangle
        </div>
        <p>The objective is to estimate the amplitude parameter $a \\in [0, 1]$ (e.g. financial risk expectation, Monte Carlo integral, or physics transition probability).</p>
      </div>

      <div class="vlab-edu-section">
        <h3>2. Classical Monte Carlo vs Quantum Speedup</h3>
        <p>Classically, estimating probability $a$ with error $\\epsilon$ via random sampling requires $M = O(1/\\epsilon^2)$ trials by the central limit theorem.</p>
        <p>Brassard, Høyer, Mosca, and Tapp (2002) proved that <strong>Quantum Amplitude Estimation (QAE)</strong> achieves error $\\epsilon$ using only:</p>
        <div class="vlab-math-block">
          M = O(1 / \\epsilon) \\; \\text{quantum queries}
        </div>
        <p>This represents a <strong>quadratic speedup</strong> for numerical integration, risk analysis, and derivative pricing.</p>
      </div>

      <div class="vlab-edu-section">
        <h3>3. Grover Operator & Phase Estimation</h3>
        <p>QAE applies Quantum Phase Estimation to the Grover iteration operator $\\mathcal{Q} = -\\mathcal{A} S_0 \\mathcal{A}^\\dagger S_\\chi$, whose eigenvalues are $e^{\\pm i 2\\theta}$ where $a = \\sin^2(\\theta)$. Measuring the phase register produces an estimate $\\tilde{\\theta}$, yielding $\\tilde{a} = \\sin^2(\\tilde{\\theta})$.</p>
      </div>
    `,
    pretest: [
      {
        question: 'What is the speedup of Quantum Amplitude Estimation over classical Monte Carlo sampling for achieving error ε?',
        options: [
          'Quadratic speedup: O(1/ε) quantum queries vs O(1/ε²) classical samples',
          'Exponential speedup: O(log ε)',
          'No speedup',
          'Constant time O(1)'
        ],
        correct: 0,
        explanation: 'Classical Monte Carlo error scales as 1/√M, requiring M = O(1/ε²) samples. QAE scales as O(1/ε), providing a quadratic speedup.'
      },
      {
        question: 'How is the target probability a mathematically extracted from the estimated phase θ̃ in QAE?',
        options: [
          'ã = sin²(θ̃)',
          'ã = θ̃²',
          'ã = cos(θ̃)',
          'ã = 2θ̃'
        ],
        correct: 0,
        explanation: 'The Grover operator rotates by angle 2θ in a 2D plane where the target amplitude is sin(θ), so the estimated probability is ã = sin²(θ̃).'
      },
      {
        question: 'What industry sector actively develops QAE algorithms for real-world quantum advantage?',
        options: [
          'Quantitative finance for portfolio risk analysis (Value-at-Risk) and derivative pricing',
          'Word processing applications',
          'Computer screen manufacturing',
          'Social media text sorting'
        ],
        correct: 0,
        explanation: 'Financial institutions (JPMorgan Chase, Goldman Sachs, etc.) explore QAE to compute Value-at-Risk and price financial options with quadratic speedups.'
      }
    ],
    procedure: [
      'Step 1: Set the target Bernoulli probability a to be estimated (e.g. a = 0.25, 0.50, 0.65).',
      'Step 2: Choose counting register precision m (e.g. m = 3, 4, or 5 qubits).',
      'Step 3: Prepare the state preparation circuit A and Grover operator Q = -A S₀ A† S_χ.',
      'Step 4: Initialize counting qubits in equal superposition and apply controlled-Q^(2^j) powers.',
      'Step 5: Apply inverse Quantum Fourier Transform (QFT†) to the counting register.',
      'Step 6: Measure counting register to observe dominant phase bin y and compute θ̃ = π y / 2^m.',
      'Step 7: Compute estimated probability ã = sin²(θ̃), compare with true a, and calculate classical sample equivalence.'
    ],
    simulationConfig: {
      type: 'qae',
      precisionOptions: [3, 4, 5],
      defaultPrecision: 4,
      defaultA: 0.25,
      steps: [
        { name: 'State Preparation A', desc: 'Initialize quantum operator A creating superposition with target amplitude √a.', hint: 'Prepares state with target probability a = 0.25.' },
        { name: 'Grover Operator Setup', desc: 'Synthesize Grover reflection operator Q = -A S₀ A† S_χ.', hint: 'Eigenvalues of Q are e^(±i 2θ) where a = sin²(θ).' },
        { name: 'Controlled Powers of Q', desc: 'Apply controlled-Q^(2^j) from m counting qubits.', hint: 'Accumulates phase information via phase kickback.' },
        { name: 'QFT† Inversion', desc: 'Apply inverse QFT to resolve phase angle θ̃.', hint: 'Converts geometric phase into sharp peak on counting register.' },
        { name: 'Amplitude Extraction', desc: 'Extract estimate ã = sin²(π y / 2^m) from measured bin y.', hint: 'Measured bin y = 2 -> θ̃ = 2π/16 -> ã = sin²(π/8) ≈ 0.25.' },
        { name: 'Monte Carlo Comparison', desc: 'Compare query efficiency with classical sampling.', hint: 'QAE achieves accuracy equivalent to hundreds of classical samples.' }
      ]
    },
    posttest: [
      {
        question: 'If m = 4 counting qubits are used in QAE, what is the maximum number of Grover operator calls executed?',
        options: [
          '2^m - 1 = 15 applications of operator Q',
          '4 applications',
          '65,536 applications',
          'Zero applications'
        ],
        correct: 0,
        explanation: 'Applying controlled-Q, Q², Q⁴, Q⁸ requires a total of 1 + 2 + 4 + 8 = 15 applications of the Grover operator.'
      },
      {
        question: 'What is Maximum Likelihood Amplitude Estimation (MLAE) developed by Suzuki et al. (2020)?',
        options: [
          'A variant of QAE that eliminates the counting register and QFT, running Grover sequences and fitting via classical maximum likelihood',
          'A machine learning algorithm that only runs on classical GPUs',
          'An algorithm for finding primes',
          'A method to measure voltage'
        ],
        correct: 0,
        explanation: 'MLAE runs Grover sequences without counting qubits or QFT, reducing circuit depth and making amplitude estimation viable on NISQ hardware.'
      },
      {
        question: 'Why does QAE provide a quadratic speedup rather than an exponential speedup?',
        options: [
          'Because the central limit theorem imposes a fundamental quadratic relationship between variance and sample count',
          'Because quantum computers can only double speeds',
          'Because amplitude estimation is classical',
          'Because Grover operator cannot be repeated'
        ],
        correct: 0,
        explanation: 'Heisenberg’s uncertainty relation and quantum Fisher information set a fundamental bound of Δa ≥ O(1/M) on quantum parameter estimation.'
      }
    ],
    references: [
      { title: 'Quantum amplitude amplification and estimation', authors: 'Brassard, G., Høyer, P., Mosca, M., & Tapp, A.', journal: 'Contemporary Mathematics 305, 53–74 (2002)', link: 'https://doi.org/10.1090/conm/305/05215' },
      { title: 'Amplitude Estimation without Phase Estimation', authors: 'Suzuki, Y., Uno, S., Raymond, R., et al.', journal: 'Quantum Information Processing 19, 75 (2020)', link: 'https://doi.org/10.1007/s11128-019-2565-2' }
    ]
  }
];

// Helper to lookup experiment by slug or id
QL.getAlgorithmExperiment = function (slugOrId) {
  if (!slugOrId) return QL.algorithmsVLabData[0];
  const clean = slugOrId.toLowerCase().trim().replace(/^\/algorithms\//, '').replace(/\.html$/, '');
  return QL.algorithmsVLabData.find(exp => exp.id === clean || exp.slug === clean) || QL.algorithmsVLabData[0];
};

// Sync with legacy QL.data.algorithms for homepage / navigation
if (window.QL) {
  QL.data = QL.data || {};
  QL.data.algorithms = QL.algorithmsVLabData.map(exp => ({
    id: exp.id,
    name: exp.shortTitle,
    title: exp.title,
    desc: exp.aim,
    level: exp.difficulty,
    category: exp.category,
    number: exp.number
  }));
}
