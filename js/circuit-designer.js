/* ============================================================
   QUANTUMLAB – QUANTUM CIRCUIT DESIGNER
   window.QuantumLabDesigner  (single global)
   Vanilla JS, no backend, no eval(), no innerHTML with user input
   Qubit order: Qiskit convention — qubit 0 = least significant bit
   State labels: |q(n-1)…q1 q0⟩
   ============================================================ */
(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // 1.  COMPLEX-NUMBER HELPERS
  // ══════════════════════════════════════════════════════════
  function C(re, im) { return { re: re || 0, im: im || 0 }; }
  function cAdd(a, b) { return { re: a.re + b.re, im: a.im + b.im }; }
  function cMul(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }
  function cAbs(a) { return Math.sqrt(a.re * a.re + a.im * a.im); }
  function cAbs2(a) { return a.re * a.re + a.im * a.im; }
  function cPhase(a) { return Math.atan2(a.im, a.re); }
  function cScale(a, s) { return { re: a.re * s, im: a.im * s }; }
  function cConj(a) { return { re: a.re, im: -a.im }; }

  const IS2 = 1 / Math.SQRT2;
  const PI = Math.PI;

  // ══════════════════════════════════════════════════════════
  // 2.  SAFE EXPRESSION PARSER  (no eval)
  // ══════════════════════════════════════════════════════════
  function parseExpr(str) {
    // Tokenize & evaluate a safe numeric expression with pi, e, sqrt, sin, cos
    const s = String(str).trim()
      .replace(/\bpi\b/g, '(' + PI + ')')
      .replace(/\be\b/g, '(' + Math.E + ')');
    try { return safeEval(s); }
    catch (_) { return NaN; }
  }
  function safeEval(expr) {
    // Recursive descent: +- then */ then unary then atom
    let pos = 0;
    const ch = () => expr[pos] || '';
    const skip = () => { while (expr[pos] === ' ') pos++; };
    function parseAddSub() {
      let left = parseMulDiv();
      skip();
      while (ch() === '+' || ch() === '-') {
        const op = ch(); pos++;
        const right = parseMulDiv();
        left = op === '+' ? left + right : left - right;
        skip();
      }
      return left;
    }
    function parseMulDiv() {
      let left = parsePow();
      skip();
      while (ch() === '*' || ch() === '/') {
        const op = ch(); pos++;
        const right = parsePow();
        left = op === '*' ? left * right : left / right;
        skip();
      }
      return left;
    }
    function parsePow() {
      let base = parseUnary();
      skip();
      if (ch() === '^') { pos++; base = Math.pow(base, parsePow()); }
      return base;
    }
    function parseUnary() {
      skip();
      if (ch() === '-') { pos++; return -parseUnary(); }
      if (ch() === '+') { pos++; return +parseUnary(); }
      return parseAtom();
    }
    function parseAtom() {
      skip();
      if (ch() === '(') {
        pos++;
        const val = parseAddSub();
        if (ch() === ')') pos++;
        return val;
      }
      // Function calls: sqrt, sin, cos, tan, abs, log
      const fnMatch = expr.slice(pos).match(/^(sqrt|sin|cos|tan|abs|log)\(/);
      if (fnMatch) {
        pos += fnMatch[0].length;
        const arg = parseAddSub();
        if (ch() === ')') pos++;
        const fn = fnMatch[1];
        const fns = { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, abs: Math.abs, log: Math.log };
        return fns[fn](arg);
      }
      // Number
      const numMatch = expr.slice(pos).match(/^[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/);
      if (numMatch) { pos += numMatch[0].length; return parseFloat(numMatch[0]); }
      throw new Error('parse error at: ' + expr.slice(pos));
    }
    const result = parseAddSub();
    if (pos !== expr.length) throw new Error('trailing chars');
    return result;
  }

  // ══════════════════════════════════════════════════════════
  // 3.  GATE DEFINITIONS
  // ══════════════════════════════════════════════════════════
  const GATE_DEFS = {
    I:   { label: 'I', name: 'Identity', group: 'single', matrix2: [[C(1,0),C(0,0)],[C(0,0),C(1,0)]], desc: 'Does nothing — useful as placeholder.' },
    X:   { label: 'X', name: 'Pauli-X', group: 'single', matrix2: [[C(0,0),C(1,0)],[C(1,0),C(0,0)]], desc: 'Bit-flip: |0⟩↔|1⟩, like a NOT gate.' },
    Y:   { label: 'Y', name: 'Pauli-Y', group: 'single', matrix2: [[C(0,0),C(0,-1)],[C(0,1),C(0,0)]], desc: 'Bit and phase flip.' },
    Z:   { label: 'Z', name: 'Pauli-Z', group: 'single', matrix2: [[C(1,0),C(0,0)],[C(0,0),C(-1,0)]], desc: 'Phase flip: leaves |0⟩, flips phase of |1⟩.' },
    H:   { label: 'H', name: 'Hadamard', group: 'single', matrix2: [[C(IS2,0),C(IS2,0)],[C(IS2,0),C(-IS2,0)]], desc: 'Creates superposition: |0⟩→|+⟩, |1⟩→|−⟩.' },
    S:   { label: 'S', name: 'S Gate', group: 'single', matrix2: [[C(1,0),C(0,0)],[C(0,0),C(0,1)]], desc: 'Phase gate: adds i to |1⟩ amplitude.' },
    Sdg: { label: 'S†', name: 'S† Gate', group: 'single', matrix2: [[C(1,0),C(0,0)],[C(0,0),C(0,-1)]], desc: 'Inverse of S gate.' },
    T:   { label: 'T', name: 'T Gate', group: 'single', matrix2: [[C(1,0),C(0,0)],[C(0,0),C(IS2,IS2)]], desc: 'T gate: adds e^{iπ/4} to |1⟩.' },
    Tdg: { label: 'T†', name: 'T† Gate', group: 'single', matrix2: [[C(1,0),C(0,0)],[C(0,0),C(IS2,-IS2)]], desc: 'Inverse of T gate.' },
    SX:  { label: '√X', name: '√X Gate', group: 'single', matrix2: [[C(0.5,0.5),C(0.5,-0.5)],[C(0.5,-0.5),C(0.5,0.5)]], desc: 'Square root of X.' },
    Rx:  { label: 'Rx', name: 'Rx(θ)', group: 'param', params: ['theta'], desc: 'Rotation around X axis by angle θ.' },
    Ry:  { label: 'Ry', name: 'Ry(θ)', group: 'param', params: ['theta'], desc: 'Rotation around Y axis by angle θ.' },
    Rz:  { label: 'Rz', name: 'Rz(θ)', group: 'param', params: ['theta'], desc: 'Rotation around Z axis by angle θ.' },
    P:   { label: 'P', name: 'Phase(λ)', group: 'param', params: ['lambda'], desc: 'Phase gate: e^{iλ} on |1⟩.' },
    U3:  { label: 'U3', name: 'U3(θ,φ,λ)', group: 'param', params: ['theta','phi','lambda'], desc: 'Universal single-qubit unitary.' },
    CNOT:{ label: 'CX', name: 'CNOT', group: 'two', twoQubit: true, desc: 'Controlled-X: flips target if control=1.' },
    CZ:  { label: 'CZ', name: 'CZ', group: 'two', twoQubit: true, desc: 'Controlled-Z: adds -1 if both qubits=1.' },
    CY:  { label: 'CY', name: 'CY', group: 'two', twoQubit: true, desc: 'Controlled-Y.' },
    CH:  { label: 'CH', name: 'CH', group: 'two', twoQubit: true, desc: 'Controlled-Hadamard.' },
    SWAP:{ label: 'SWAP', name: 'SWAP', group: 'two', twoQubit: true, desc: 'Swaps two qubit states.' },
    CPhase:{ label: 'CP', name: 'CPhase(λ)', group: 'two', twoQubit: true, params: ['lambda'], desc: 'Controlled phase rotation.' },
    CRz: { label: 'CRz', name: 'CRz(θ)', group: 'two', twoQubit: true, params: ['theta'], desc: 'Controlled-Rz rotation.' },
    CCX: { label: 'CCX', name: 'Toffoli', group: 'three', threeQubit: true, desc: 'Toffoli gate: flips target if both controls=1.' },
    CSWAP:{ label: 'CSWAP', name: 'Fredkin', group: 'three', threeQubit: true, desc: 'Fredkin: controlled swap.' },
    M:   { label: 'M', name: 'Measure', group: 'misc', desc: 'Measure qubit onto classical bit.' },
    RESET:{ label: 'RST', name: 'Reset', group: 'misc', desc: 'Reset qubit to |0⟩.' },
    BARRIER:{ label: '|', name: 'Barrier', group: 'misc', desc: 'Visual separator / compiler barrier.' },
  };

  // Gate colour by group
  const GATE_COLORS = {
    single: { fill: '#1e3a5f', stroke: '#06b6d4', text: '#67e8f9' },
    param:  { fill: '#3b2100', stroke: '#d97706', text: '#fbbf24' },
    two:    { fill: '#2d1b69', stroke: '#7c3aed', text: '#c4b5fd' },
    three:  { fill: '#4c0519', stroke: '#e11d48', text: '#fda4af' },
    misc:   { fill: '#0f2922', stroke: '#0d9488', text: '#2dd4bf' },
  };

  // ══════════════════════════════════════════════════════════
  // 4.  CIRCUIT MODEL  (single source of truth)
  // ══════════════════════════════════════════════════════════
  // model: { numQubits, numClbits, steps }
  // step: { id, gate, targets[qubit idx], controls[], params:{} }

  let model = { numQubits: 2, numClbits: 2, steps: [] };

  // Undo/redo stack
  const undoStack = [];  // array of JSON strings
  const redoStack = [];
  const MAX_UNDO = 100;

  function snapshotModel() {
    return JSON.stringify(model);
  }
  function pushUndo() {
    undoStack.push(snapshotModel());
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack.length = 0;
    updateUndoButtons();
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshotModel());
    model = JSON.parse(undoStack.pop());
    afterModelChange(false);
    updateUndoButtons();
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshotModel());
    model = JSON.parse(redoStack.pop());
    afterModelChange(false);
    updateUndoButtons();
  }
  function updateUndoButtons() {
    const u = document.getElementById('qcd-undo');
    const r = document.getElementById('qcd-redo');
    if (u) u.disabled = undoStack.length === 0;
    if (r) r.disabled = redoStack.length === 0;
  }

  // ══════════════════════════════════════════════════════════
  // 5.  STATEVECTOR SIMULATOR
  // ══════════════════════════════════════════════════════════
  function makeZeroState(n) {
    const size = 1 << n;
    const sv = new Array(size).fill(null).map(() => C(0, 0));
    sv[0] = C(1, 0);
    return sv;
  }

  function gate1QMatrix(gate, params) {
    const d = GATE_DEFS[gate];
    if (d && d.matrix2) return d.matrix2;
    // Parametric
    const th = params && params.theta !== undefined ? parseExpr(params.theta) : 0;
    const ph = params && params.phi !== undefined ? parseExpr(params.phi) : 0;
    const lm = params && params.lambda !== undefined ? parseExpr(params.lambda) : 0;
    switch (gate) {
      case 'Rx': return [
        [C(Math.cos(th/2),0), C(0,-Math.sin(th/2))],
        [C(0,-Math.sin(th/2)), C(Math.cos(th/2),0)]
      ];
      case 'Ry': return [
        [C(Math.cos(th/2),0), C(-Math.sin(th/2),0)],
        [C(Math.sin(th/2),0), C(Math.cos(th/2),0)]
      ];
      case 'Rz': return [
        [C(Math.cos(th/2),-Math.sin(th/2)), C(0,0)],
        [C(0,0), C(Math.cos(th/2),Math.sin(th/2))]
      ];
      case 'P': return [
        [C(1,0), C(0,0)],
        [C(0,0), C(Math.cos(lm),Math.sin(lm))]
      ];
      case 'U3': {
        const ct = Math.cos(th/2), st = Math.sin(th/2);
        return [
          [C(ct,0), C(-Math.cos(lm)*st,-Math.sin(lm)*st)],
          [C(Math.cos(ph)*st,Math.sin(ph)*st), C(Math.cos(ph+lm)*ct,Math.sin(ph+lm)*ct)]
        ];
      }
      default: return [[C(1,0),C(0,0)],[C(0,0),C(1,0)]]; // I
    }
  }

  function applyGate1Q(sv, n, qubit, mat) {
    const size = 1 << n;
    const out = sv.slice();
    for (let i = 0; i < size; i++) {
      const bit = (i >> qubit) & 1;
      if (bit === 0) {
        const j = i | (1 << qubit);
        const a = sv[i], b = sv[j];
        out[i] = cAdd(cMul(mat[0][0], a), cMul(mat[0][1], b));
        out[j] = cAdd(cMul(mat[1][0], a), cMul(mat[1][1], b));
      }
    }
    return out;
  }

  function applyControlled1Q(sv, n, ctrl, tgt, mat) {
    const size = 1 << n;
    const out = sv.slice();
    for (let i = 0; i < size; i++) {
      if (!((i >> ctrl) & 1)) continue;
      const bit = (i >> tgt) & 1;
      if (bit === 0) {
        const j = i | (1 << tgt);
        const a = sv[i], b = sv[j];
        out[i] = cAdd(cMul(mat[0][0], a), cMul(mat[0][1], b));
        out[j] = cAdd(cMul(mat[1][0], a), cMul(mat[1][1], b));
      }
    }
    return out;
  }

  function applySWAP(sv, n, q0, q1) {
    const size = 1 << n;
    const out = sv.slice();
    for (let i = 0; i < size; i++) {
      const b0 = (i >> q0) & 1, b1 = (i >> q1) & 1;
      if (b0 !== b1) {
        const j = i ^ (1 << q0) ^ (1 << q1);
        if (i < j) { out[i] = sv[j]; out[j] = sv[i]; }
      }
    }
    return out;
  }

  function applyCCX(sv, n, c0, c1, tgt) {
    const size = 1 << n;
    const out = sv.slice();
    for (let i = 0; i < size; i++) {
      if (!((i >> c0) & 1) || !((i >> c1) & 1)) continue;
      const bit = (i >> tgt) & 1;
      if (bit === 0) {
        const j = i | (1 << tgt);
        const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
      }
    }
    return out;
  }

  function applyCSWAP(sv, n, ctrl, q0, q1) {
    const size = 1 << n;
    const out = sv.slice();
    for (let i = 0; i < size; i++) {
      if (!((i >> ctrl) & 1)) continue;
      const b0 = (i >> q0) & 1, b1 = (i >> q1) & 1;
      if (b0 !== b1) {
        const j = i ^ (1 << q0) ^ (1 << q1);
        if (i < j) { out[i] = sv[j]; out[j] = sv[i]; }
      }
    }
    return out;
  }

  function applyMeasureCollapse(sv, n, qubit) {
    // Probabilistic collapse, returns new sv
    let p0 = 0;
    const size = 1 << n;
    for (let i = 0; i < size; i++) {
      if (!((i >> qubit) & 1)) p0 += cAbs2(sv[i]);
    }
    const outcome = Math.random() < p0 ? 0 : 1;
    const norm = outcome === 0 ? Math.sqrt(p0) : Math.sqrt(1 - p0);
    const out = sv.map((amp, i) => {
      const bit = (i >> qubit) & 1;
      if (bit !== outcome) return C(0, 0);
      return norm > 1e-12 ? cScale(amp, 1 / norm) : C(0, 0);
    });
    return { sv: out, outcome };
  }

  function simulateModel(mdl, upToStep) {
    const n = mdl.numQubits;
    let sv = makeZeroState(n);
    const measureOutcomes = {};
    const steps = upToStep !== undefined ? mdl.steps.slice(0, upToStep + 1) : mdl.steps;
    for (const step of steps) {
      const g = step.gate;
      const tgt = step.targets[0];
      const ctrl = step.controls && step.controls[0];
      const p = step.params || {};
      if (g === 'BARRIER') continue;
      if (g === 'M') {
        const r = applyMeasureCollapse(sv, n, tgt);
        sv = r.sv; measureOutcomes[tgt] = r.outcome;
        continue;
      }
      if (g === 'RESET') {
        // If qubit is |1⟩ with some prob, flip it
        const r = applyMeasureCollapse(sv, n, tgt);
        sv = r.sv;
        if (r.outcome === 1) sv = applyGate1Q(sv, n, tgt, GATE_DEFS.X.matrix2);
        continue;
      }
      // Two-qubit gates
      if (g === 'SWAP') { sv = applySWAP(sv, n, tgt, step.targets[1]); continue; }
      if (g === 'CCX')  { sv = applyCCX(sv, n, step.controls[0], step.controls[1], tgt); continue; }
      if (g === 'CSWAP'){ sv = applyCSWAP(sv, n, step.controls[0], tgt, step.targets[1]); continue; }
      if (g === 'CZ' || g === 'CNOT' || g === 'CY' || g === 'CH' || g === 'CPhase' || g === 'CRz') {
        let mat;
        if (g === 'CNOT') mat = GATE_DEFS.X.matrix2;
        else if (g === 'CZ') mat = GATE_DEFS.Z.matrix2;
        else if (g === 'CY') mat = GATE_DEFS.Y.matrix2;
        else if (g === 'CH') mat = GATE_DEFS.H.matrix2;
        else if (g === 'CPhase') mat = gate1QMatrix('P', p);
        else if (g === 'CRz') mat = gate1QMatrix('Rz', p);
        sv = applyControlled1Q(sv, n, ctrl, tgt, mat);
        continue;
      }
      // Single-qubit
      const mat = gate1QMatrix(g, p);
      sv = applyGate1Q(sv, n, tgt, mat);
    }
    return { sv, measureOutcomes };
  }

  // Bloch vector for single qubit (partial trace)
  function qubitBlochVector(sv, n, q) {
    const size = 1 << n;
    // density matrix ρ = Tr_rest(|ψ⟩⟨ψ|) — 2x2
    let r00 = C(0,0), r01 = C(0,0), r10 = C(0,0), r11 = C(0,0);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const bi = (i >> q) & 1, bj = (j >> q) & 1;
        // Mask out qubit q
        const maskedI = i & ~(1 << q), maskedJ = j & ~(1 << q);
        if (maskedI !== maskedJ) continue;
        const val = cMul(sv[i], cConj(sv[j]));
        if (bi === 0 && bj === 0) r00 = cAdd(r00, val);
        else if (bi === 0 && bj === 1) r01 = cAdd(r01, val);
        else if (bi === 1 && bj === 0) r10 = cAdd(r10, val);
        else r11 = cAdd(r11, val);
      }
    }
    // Bloch: x=2Re(ρ01), y=2Im(ρ10), z=ρ00-ρ11
    return {
      x: 2 * r01.re,
      y: 2 * r10.im,
      z: r00.re - r11.re,
      purity: r00.re * r00.re + r11.re * r11.re + 2 * cAbs2(r01)
    };
  }

  // ══════════════════════════════════════════════════════════
  // 6.  SHOT SIMULATION
  // ══════════════════════════════════════════════════════════
  function runShots(sv, numShots) {
    const n = sv.length;
    const bits = Math.round(Math.log2(n));
    const probs = sv.map(a => cAbs2(a));
    // Cumulative
    const cum = [];
    let acc = 0;
    for (const p of probs) { acc += p; cum.push(acc); }
    const counts = new Array(n).fill(0);
    for (let s = 0; s < numShots; s++) {
      const r = Math.random();
      let lo = 0, hi = n - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < r) lo = mid + 1; else hi = mid;
      }
      counts[lo]++;
    }
    return counts;
  }

  // ══════════════════════════════════════════════════════════
  // 7.  METRICS
  // ══════════════════════════════════════════════════════════
  function computeMetrics(mdl) {
    const n = mdl.numQubits;
    // Depth: per-qubit time, max
    const qubitTime = new Array(n).fill(0);
    let gateCount = 0, twoQCount = 0, tCount = 0;
    for (const step of mdl.steps) {
      const g = step.gate;
      if (g === 'BARRIER' || g === 'M' || g === 'RESET') continue;
      gateCount++;
      if (g === 'T' || g === 'Tdg') tCount++;
      const qubits = [...(step.targets || []), ...(step.controls || [])];
      const t = Math.max(...qubits.map(q => qubitTime[q])) + 1;
      qubits.forEach(q => { qubitTime[q] = t; });
      if (qubits.length >= 2) twoQCount++;
    }
    return { depth: Math.max(0, ...qubitTime), gateCount, twoQCount, tCount };
  }

  // ══════════════════════════════════════════════════════════
  // 8.  CODE GENERATION
  // ══════════════════════════════════════════════════════════
  function modelToQASM(mdl) {
    const n = mdl.numQubits, m = mdl.numClbits;
    const lines = [
      '// QuantumLab Circuit Designer',
      '// Qubit order: Qiskit convention — qubit 0 = least-significant bit',
      '// State labels: |q' + (n-1) + '…q1 q0⟩',
      'OPENQASM 2.0;',
      'include "qelib1.inc";',
      `qreg q[${n}];`,
      `creg c[${m}];`,
      ''
    ];
    for (const step of mdl.steps) {
      const g = step.gate;
      const t = step.targets, ctrl = step.controls || [];
      const p = step.params || {};
      const pStr = (keys) => '(' + keys.map(k => p[k] !== undefined ? p[k] : '0').join(',') + ')';
      switch (g) {
        case 'I': lines.push(`id q[${t[0]}];`); break;
        case 'X': lines.push(`x q[${t[0]}];`); break;
        case 'Y': lines.push(`y q[${t[0]}];`); break;
        case 'Z': lines.push(`z q[${t[0]}];`); break;
        case 'H': lines.push(`h q[${t[0]}];`); break;
        case 'S': lines.push(`s q[${t[0]}];`); break;
        case 'Sdg': lines.push(`sdg q[${t[0]}];`); break;
        case 'T': lines.push(`t q[${t[0]}];`); break;
        case 'Tdg': lines.push(`tdg q[${t[0]}];`); break;
        case 'SX': lines.push(`sx q[${t[0]}];`); break;
        case 'Rx': lines.push(`rx${pStr(['theta'])} q[${t[0]}];`); break;
        case 'Ry': lines.push(`ry${pStr(['theta'])} q[${t[0]}];`); break;
        case 'Rz': lines.push(`rz${pStr(['theta'])} q[${t[0]}];`); break;
        case 'P': lines.push(`p${pStr(['lambda'])} q[${t[0]}];`); break;
        case 'U3': lines.push(`u3${pStr(['theta','phi','lambda'])} q[${t[0]}];`); break;
        case 'CNOT': lines.push(`cx q[${ctrl[0]}], q[${t[0]}];`); break;
        case 'CZ': lines.push(`cz q[${ctrl[0]}], q[${t[0]}];`); break;
        case 'CY': lines.push(`cy q[${ctrl[0]}], q[${t[0]}];`); break;
        case 'CH': lines.push(`ch q[${ctrl[0]}], q[${t[0]}];`); break;
        case 'SWAP': lines.push(`swap q[${t[0]}], q[${t[1]}];`); break;
        case 'CPhase': lines.push(`cp${pStr(['lambda'])} q[${ctrl[0]}], q[${t[0]}];`); break;
        case 'CRz': lines.push(`crz${pStr(['theta'])} q[${ctrl[0]}], q[${t[0]}];`); break;
        case 'CCX': lines.push(`ccx q[${ctrl[0]}], q[${ctrl[1]}], q[${t[0]}];`); break;
        case 'CSWAP': lines.push(`cswap q[${ctrl[0]}], q[${t[0]}], q[${t[1]}];`); break;
        case 'M': lines.push(`measure q[${t[0]}] -> c[${t[0] < m ? t[0] : 0}];`); break;
        case 'RESET': lines.push(`reset q[${t[0]}];`); break;
        case 'BARRIER': lines.push(`barrier q;`); break;
        default: lines.push(`// unknown gate: ${g}`);
      }
    }
    return lines.join('\n');
  }

  function modelToQiskit(mdl) {
    const n = mdl.numQubits, m = mdl.numClbits;
    const lines = [
      '# QuantumLab Circuit Designer — Qiskit export',
      '# Qubit order: qubit 0 = least-significant bit',
      '# State labels: |q' + (n-1) + '…q1 q0⟩',
      'from qiskit import QuantumCircuit',
      'import numpy as np',
      '',
      `qc = QuantumCircuit(${n}, ${m})`,
      ''
    ];
    const pv = (p, k) => p[k] !== undefined ? p[k].replace(/\bpi\b/g, 'np.pi') : '0';
    for (const step of mdl.steps) {
      const g = step.gate, t = step.targets, ctrl = step.controls || [], p = step.params || {};
      switch (g) {
        case 'I': lines.push(`qc.id(${t[0]})`); break;
        case 'X': lines.push(`qc.x(${t[0]})`); break;
        case 'Y': lines.push(`qc.y(${t[0]})`); break;
        case 'Z': lines.push(`qc.z(${t[0]})`); break;
        case 'H': lines.push(`qc.h(${t[0]})`); break;
        case 'S': lines.push(`qc.s(${t[0]})`); break;
        case 'Sdg': lines.push(`qc.sdg(${t[0]})`); break;
        case 'T': lines.push(`qc.t(${t[0]})`); break;
        case 'Tdg': lines.push(`qc.tdg(${t[0]})`); break;
        case 'SX': lines.push(`qc.sx(${t[0]})`); break;
        case 'Rx': lines.push(`qc.rx(${pv(p,'theta')}, ${t[0]})`); break;
        case 'Ry': lines.push(`qc.ry(${pv(p,'theta')}, ${t[0]})`); break;
        case 'Rz': lines.push(`qc.rz(${pv(p,'theta')}, ${t[0]})`); break;
        case 'P': lines.push(`qc.p(${pv(p,'lambda')}, ${t[0]})`); break;
        case 'U3': lines.push(`qc.u(${pv(p,'theta')}, ${pv(p,'phi')}, ${pv(p,'lambda')}, ${t[0]})`); break;
        case 'CNOT': lines.push(`qc.cx(${ctrl[0]}, ${t[0]})`); break;
        case 'CZ': lines.push(`qc.cz(${ctrl[0]}, ${t[0]})`); break;
        case 'CY': lines.push(`qc.cy(${ctrl[0]}, ${t[0]})`); break;
        case 'CH': lines.push(`qc.ch(${ctrl[0]}, ${t[0]})`); break;
        case 'SWAP': lines.push(`qc.swap(${t[0]}, ${t[1]})`); break;
        case 'CPhase': lines.push(`qc.cp(${pv(p,'lambda')}, ${ctrl[0]}, ${t[0]})`); break;
        case 'CRz': lines.push(`qc.crz(${pv(p,'theta')}, ${ctrl[0]}, ${t[0]})`); break;
        case 'CCX': lines.push(`qc.ccx(${ctrl[0]}, ${ctrl[1]}, ${t[0]})`); break;
        case 'CSWAP': lines.push(`qc.cswap(${ctrl[0]}, ${t[0]}, ${t[1]})`); break;
        case 'M': lines.push(`qc.measure(${t[0]}, ${t[0] < m ? t[0] : 0})`); break;
        case 'RESET': lines.push(`qc.reset(${t[0]})`); break;
        case 'BARRIER': lines.push('qc.barrier()'); break;
        default: lines.push(`# unknown gate: ${g}`);
      }
    }
    lines.push('', 'print(qc.draw(output="text"))');
    return lines.join('\n');
  }

  function modelToCirq(mdl) {
    const n = mdl.numQubits;
    const lines = [
      '# QuantumLab — Cirq export (read-only)',
      '# Qubit 0 = least-significant bit',
      'import cirq',
      'import numpy as np',
      '',
      `qubits = cirq.LineQubit.range(${n})`,
      `q = {i: qubits[i] for i in range(${n})}`,
      '',
      'circuit = cirq.Circuit()'
    ];
    for (const step of mdl.steps) {
      const g = step.gate, t = step.targets, ctrl = step.controls || [], p = step.params || {};
      const th = p.theta || '0', lm = p.lambda || '0';
      const piv = (s) => s.replace(/\bpi\b/g,'np.pi');
      switch (g) {
        case 'X': lines.push(`circuit.append(cirq.X(q[${t[0]}]))`); break;
        case 'Y': lines.push(`circuit.append(cirq.Y(q[${t[0]}]))`); break;
        case 'Z': lines.push(`circuit.append(cirq.Z(q[${t[0]}]))`); break;
        case 'H': lines.push(`circuit.append(cirq.H(q[${t[0]}]))`); break;
        case 'S': lines.push(`circuit.append(cirq.S(q[${t[0]}]))`); break;
        case 'T': lines.push(`circuit.append(cirq.T(q[${t[0]}]))`); break;
        case 'Rx': lines.push(`circuit.append(cirq.rx(${piv(th)})(q[${t[0]}]))`); break;
        case 'Ry': lines.push(`circuit.append(cirq.ry(${piv(th)})(q[${t[0]}]))`); break;
        case 'Rz': lines.push(`circuit.append(cirq.rz(${piv(th)})(q[${t[0]}]))`); break;
        case 'CNOT': lines.push(`circuit.append(cirq.CNOT(q[${ctrl[0]}], q[${t[0]}]))`); break;
        case 'CZ': lines.push(`circuit.append(cirq.CZ(q[${ctrl[0]}], q[${t[0]}]))`); break;
        case 'SWAP': lines.push(`circuit.append(cirq.SWAP(q[${t[0]}], q[${t[1]}]))`); break;
        case 'CCX': lines.push(`circuit.append(cirq.CCX(q[${ctrl[0]}], q[${ctrl[1]}], q[${t[0]}]))`); break;
        case 'M': lines.push(`circuit.append(cirq.measure(q[${t[0]}], key='c${t[0]}'))`); break;
        case 'BARRIER': lines.push('# barrier (no direct Cirq equivalent)'); break;
        default: lines.push(`# ${g} not directly mapped to Cirq`);
      }
    }
    lines.push('', 'print(circuit)');
    return lines.join('\n');
  }

  function modelToPennyLane(mdl) {
    const n = mdl.numQubits;
    const lines = [
      '# QuantumLab — PennyLane export (read-only)',
      'import pennylane as qml',
      'import numpy as np',
      '',
      `dev = qml.device("default.qubit", wires=${n})`,
      '',
      '@qml.qnode(dev)',
      'def circuit():'
    ];
    if (mdl.steps.length === 0) lines.push('    pass');
    for (const step of mdl.steps) {
      const g = step.gate, t = step.targets, ctrl = step.controls || [], p = step.params || {};
      const piv = (s) => (s||'0').replace(/\bpi\b/g,'np.pi');
      switch (g) {
        case 'X': lines.push(`    qml.PauliX(wires=${t[0]})`); break;
        case 'Y': lines.push(`    qml.PauliY(wires=${t[0]})`); break;
        case 'Z': lines.push(`    qml.PauliZ(wires=${t[0]})`); break;
        case 'H': lines.push(`    qml.Hadamard(wires=${t[0]})`); break;
        case 'S': lines.push(`    qml.S(wires=${t[0]})`); break;
        case 'T': lines.push(`    qml.T(wires=${t[0]})`); break;
        case 'Rx': lines.push(`    qml.RX(${piv(p.theta)}, wires=${t[0]})`); break;
        case 'Ry': lines.push(`    qml.RY(${piv(p.theta)}, wires=${t[0]})`); break;
        case 'Rz': lines.push(`    qml.RZ(${piv(p.theta)}, wires=${t[0]})`); break;
        case 'CNOT': lines.push(`    qml.CNOT(wires=[${ctrl[0]}, ${t[0]}])`); break;
        case 'CZ': lines.push(`    qml.CZ(wires=[${ctrl[0]}, ${t[0]}])`); break;
        case 'SWAP': lines.push(`    qml.SWAP(wires=[${t[0]}, ${t[1]}])`); break;
        case 'CCX': lines.push(`    qml.Toffoli(wires=[${ctrl[0]}, ${ctrl[1]}, ${t[0]}])`); break;
        case 'M': lines.push(`    # measure wire ${t[0]}`); break;
        default: lines.push(`    # ${g}`);
      }
    }
    lines.push(`    return qml.state()`, '', 'print(circuit())');
    return lines.join('\n');
  }

  // ══════════════════════════════════════════════════════════
  // 9.  QASM PARSER  (editable — two-way sync)
  // ══════════════════════════════════════════════════════════
  function parseQASM(code) {
    const errors = [];
    const newModel = { numQubits: 0, numClbits: 0, steps: [] };
    let stepId = 0;
    for (let [lineNum, rawLine] of code.split('\n').entries()) {
      let line = rawLine.replace(/\/\/.*$/, '').trim();
      if (!line) continue;
      if (line.startsWith('OPENQASM') || line.startsWith('include')) continue;
      const mQreg = line.match(/^qreg\s+(\w+)\s*\[(\d+)\]\s*;/);
      if (mQreg) { newModel.numQubits = parseInt(mQreg[2]); continue; }
      const mCreg = line.match(/^creg\s+(\w+)\s*\[(\d+)\]\s*;/);
      if (mCreg) { newModel.numClbits = parseInt(mCreg[2]); continue; }
      if (line === 'barrier q;' || line.startsWith('barrier')) {
        newModel.steps.push({ id: stepId++, gate: 'BARRIER', targets: [], controls: [], params: {} });
        continue;
      }
      // Measure
      const mMeas = line.match(/^measure\s+\w+\[(\d+)\]\s*->\s*\w+\[(\d+)\]\s*;/);
      if (mMeas) {
        newModel.steps.push({ id: stepId++, gate: 'M', targets: [parseInt(mMeas[1])], controls: [], params: {} });
        continue;
      }
      // Reset
      const mReset = line.match(/^reset\s+\w+\[(\d+)\]\s*;/);
      if (mReset) {
        newModel.steps.push({ id: stepId++, gate: 'RESET', targets: [parseInt(mReset[1])], controls: [], params: {} });
        continue;
      }
      // 2-qubit with params: cp, crz
      const m2p = line.match(/^(cp|crz)\(([^)]+)\)\s+\w+\[(\d+)\]\s*,\s*\w+\[(\d+)\]\s*;/);
      if (m2p) {
        const gmap = { cp: 'CPhase', crz: 'CRz' };
        const pname = m2p[1] === 'cp' ? 'lambda' : 'theta';
        newModel.steps.push({ id: stepId++, gate: gmap[m2p[1]], targets: [parseInt(m2p[4])], controls: [parseInt(m2p[3])], params: { [pname]: m2p[2].trim() } });
        continue;
      }
      // 2-qubit gates
      const m2q = line.match(/^(cx|cz|cy|ch|swap|ccx|cswap)\s+(.*);/);
      if (m2q) {
        const gmap = { cx:'CNOT',cz:'CZ',cy:'CY',ch:'CH',swap:'SWAP',ccx:'CCX',cswap:'CSWAP' };
        const args = m2q[2].split(',').map(s => parseInt(s.match(/\[(\d+)\]/)[1]));
        let gate = gmap[m2q[1]];
        let targets, controls;
        if (gate === 'SWAP') { targets = [args[0], args[1]]; controls = []; }
        else if (gate === 'CCX') { controls = [args[0], args[1]]; targets = [args[2]]; }
        else if (gate === 'CSWAP') { controls = [args[0]]; targets = [args[1], args[2]]; }
        else { controls = [args[0]]; targets = [args[1]]; }
        newModel.steps.push({ id: stepId++, gate, targets, controls, params: {} });
        continue;
      }
      // 1-qubit with params: rx, ry, rz, p, u3/u
      const m1p = line.match(/^(rx|ry|rz|p|u3|u)\(([^)]+)\)\s+\w+\[(\d+)\]\s*;/);
      if (m1p) {
        const gmap = { rx:'Rx', ry:'Ry', rz:'Rz', p:'P', u3:'U3', u:'U3' };
        const gate = gmap[m1p[1]];
        const pvals = m1p[2].split(',').map(s => s.trim());
        let params = {};
        if (gate === 'U3') { params = { theta: pvals[0]||'0', phi: pvals[1]||'0', lambda: pvals[2]||'0' }; }
        else if (gate === 'P') params = { lambda: pvals[0]||'0' };
        else params = { theta: pvals[0]||'0' };
        newModel.steps.push({ id: stepId++, gate, targets: [parseInt(m1p[3])], controls: [], params });
        continue;
      }
      // 1-qubit simple gates
      const m1q = line.match(/^(id|x|y|z|h|s|sdg|t|tdg|sx)\s+\w+\[(\d+)\]\s*;/);
      if (m1q) {
        const gmap = { id:'I',x:'X',y:'Y',z:'Z',h:'H',s:'S',sdg:'Sdg',t:'T',tdg:'Tdg',sx:'SX' };
        newModel.steps.push({ id: stepId++, gate: gmap[m1q[1]], targets: [parseInt(m1q[2])], controls: [], params: {} });
        continue;
      }
      if (line !== ';') {
        errors.push({ line: lineNum + 1, msg: 'Unrecognised statement: ' + rawLine.trim().slice(0, 60) });
      }
    }
    if (newModel.numQubits < 1) newModel.numQubits = 2;
    if (newModel.numClbits < 1) newModel.numClbits = newModel.numQubits;
    return { model: newModel, errors };
  }

  // ══════════════════════════════════════════════════════════
  // 10.  QISKIT PARSER  (safe subset — two-way sync)
  // ══════════════════════════════════════════════════════════
  function parseQiskit(code) {
    const errors = [];
    let numQubits = 0, numClbits = 0, steps = [];
    let stepId = 0;
    for (let [lineNum, rawLine] of code.split('\n').entries()) {
      const line = rawLine.replace(/#.*$/, '').trim();
      if (!line) continue;
      if (line.startsWith('from ') || line.startsWith('import ') || line.startsWith('print')) continue;
      // QuantumCircuit(n,m)
      const mQC = line.match(/QuantumCircuit\((\d+)(?:,\s*(\d+))?\)/);
      if (mQC) { numQubits = parseInt(mQC[1]); numClbits = mQC[2] ? parseInt(mQC[2]) : numQubits; continue; }
      // qc.gate(args)
      const mCall = line.match(/qc\.(\w+)\(([^)]*)\)/);
      if (!mCall) { if (line && !line.startsWith('qc =')) errors.push({ line: lineNum+1, msg: 'Unsupported: ' + rawLine.trim().slice(0,50) }); continue; }
      const method = mCall[1];
      const rawArgs = mCall[2].split(',').map(s => s.trim());
      const parseArg = (s) => { const n = parseFloat(s); return isNaN(n) ? s : n; };
      const intArgs = rawArgs.map(s => parseInt(s)).filter(n => !isNaN(n));
      const floatArgs = rawArgs.filter(s => !isNaN(parseFloat(s))).map(s => s.replace('np.pi','pi'));
      switch (method) {
        case 'id': steps.push({ id:stepId++, gate:'I', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'x':  steps.push({ id:stepId++, gate:'X', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'y':  steps.push({ id:stepId++, gate:'Y', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'z':  steps.push({ id:stepId++, gate:'Z', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'h':  steps.push({ id:stepId++, gate:'H', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 's':  steps.push({ id:stepId++, gate:'S', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'sdg':steps.push({ id:stepId++, gate:'Sdg',targets:[intArgs[0]], controls:[], params:{} }); break;
        case 't':  steps.push({ id:stepId++, gate:'T', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'tdg':steps.push({ id:stepId++, gate:'Tdg',targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'sx': steps.push({ id:stepId++, gate:'SX',targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'rx': steps.push({ id:stepId++, gate:'Rx', targets:[intArgs[intArgs.length-1]], controls:[], params:{theta: floatArgs[0]||'0'} }); break;
        case 'ry': steps.push({ id:stepId++, gate:'Ry', targets:[intArgs[intArgs.length-1]], controls:[], params:{theta: floatArgs[0]||'0'} }); break;
        case 'rz': steps.push({ id:stepId++, gate:'Rz', targets:[intArgs[intArgs.length-1]], controls:[], params:{theta: floatArgs[0]||'0'} }); break;
        case 'p':  steps.push({ id:stepId++, gate:'P',  targets:[intArgs[intArgs.length-1]], controls:[], params:{lambda: floatArgs[0]||'0'} }); break;
        case 'u':  case 'u3': steps.push({ id:stepId++, gate:'U3', targets:[intArgs[intArgs.length-1]], controls:[], params:{theta:floatArgs[0]||'0',phi:floatArgs[1]||'0',lambda:floatArgs[2]||'0'} }); break;
        case 'cx': steps.push({ id:stepId++, gate:'CNOT', targets:[intArgs[1]], controls:[intArgs[0]], params:{} }); break;
        case 'cz': steps.push({ id:stepId++, gate:'CZ',   targets:[intArgs[1]], controls:[intArgs[0]], params:{} }); break;
        case 'cy': steps.push({ id:stepId++, gate:'CY',   targets:[intArgs[1]], controls:[intArgs[0]], params:{} }); break;
        case 'ch': steps.push({ id:stepId++, gate:'CH',   targets:[intArgs[1]], controls:[intArgs[0]], params:{} }); break;
        case 'swap': steps.push({ id:stepId++, gate:'SWAP', targets:[intArgs[0],intArgs[1]], controls:[], params:{} }); break;
        case 'cp':  steps.push({ id:stepId++, gate:'CPhase', targets:[intArgs[intArgs.length-1]], controls:[intArgs[intArgs.length-2]], params:{lambda:floatArgs[0]||'0'} }); break;
        case 'crz': steps.push({ id:stepId++, gate:'CRz',   targets:[intArgs[intArgs.length-1]], controls:[intArgs[intArgs.length-2]], params:{theta:floatArgs[0]||'0'} }); break;
        case 'ccx': steps.push({ id:stepId++, gate:'CCX',  targets:[intArgs[2]], controls:[intArgs[0],intArgs[1]], params:{} }); break;
        case 'cswap': steps.push({ id:stepId++, gate:'CSWAP', targets:[intArgs[1],intArgs[2]], controls:[intArgs[0]], params:{} }); break;
        case 'measure': steps.push({ id:stepId++, gate:'M', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'reset': steps.push({ id:stepId++, gate:'RESET', targets:[intArgs[0]], controls:[], params:{} }); break;
        case 'barrier': steps.push({ id:stepId++, gate:'BARRIER', targets:[], controls:[], params:{} }); break;
        default: errors.push({ line: lineNum+1, msg: `Unsupported qc.${method}() call` });
      }
    }
    if (numQubits < 1) numQubits = 2;
    if (numClbits < 1) numClbits = numQubits;
    return { model: { numQubits, numClbits, steps }, errors };
  }

  // ══════════════════════════════════════════════════════════
  // 11.  TEMPLATES
  // ══════════════════════════════════════════════════════════
  const TEMPLATES = [
    {
      name: 'Bell State (Φ⁺)', qubits: 2, clbits: 2,
      goal: 'Create maximally entangled pair: (|00⟩+|11⟩)/√2',
      note: 'Foundational to quantum teleportation and superdense coding.',
      steps: [
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'CNOT', targets:[1], controls:[0], params:{} },
      ]
    },
    {
      name: 'GHZ State', qubits: 3, clbits: 3,
      goal: 'Create 3-qubit entanglement: (|000⟩+|111⟩)/√2',
      note: 'Showcases multi-party entanglement and GHZ paradox.',
      steps: [
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'CNOT', targets:[1], controls:[0], params:{} },
        { gate:'CNOT', targets:[2], controls:[0], params:{} },
      ]
    },
    {
      name: 'Superposition', qubits: 2, clbits: 2,
      goal: 'Put both qubits into equal superposition.',
      note: 'H on every qubit gives a uniform probability distribution.',
      steps: [
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
      ]
    },
    {
      name: 'Superdense Coding', qubits: 2, clbits: 2,
      goal: 'Encode 2 classical bits using 1 qubit (send "11").',
      note: 'Alice applies X then Z to her entangled qubit.',
      steps: [
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'CNOT', targets:[1], controls:[0], params:{} },
        { gate:'Z', targets:[0], controls:[], params:{} },
        { gate:'X', targets:[0], controls:[], params:{} },
        { gate:'CNOT', targets:[1], controls:[0], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
      ]
    },
    {
      name: 'Teleportation', qubits: 3, clbits: 3,
      goal: 'Teleport qubit 0 state to qubit 2.',
      note: 'Uses Bell measurement and classical correction.',
      steps: [
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'CNOT', targets:[2], controls:[1], params:{} },
        { gate:'CNOT', targets:[1], controls:[0], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'M', targets:[0], controls:[], params:{} },
        { gate:'M', targets:[1], controls:[], params:{} },
      ]
    },
    {
      name: 'Deutsch-Jozsa', qubits: 3, clbits: 3,
      goal: 'Determine if f is constant or balanced in ONE query.',
      note: 'First quantum algorithm with exponential speedup.',
      steps: [
        { gate:'X', targets:[2], controls:[], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'H', targets:[2], controls:[], params:{} },
        { gate:'CNOT', targets:[2], controls:[0], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'M', targets:[0], controls:[], params:{} },
        { gate:'M', targets:[1], controls:[], params:{} },
      ]
    },
    {
      name: 'Bernstein-Vazirani', qubits: 3, clbits: 3,
      goal: 'Find hidden bitstring s=11 in one query.',
      note: 'Demonstrates quantum parallelism for linear functions.',
      steps: [
        { gate:'X', targets:[2], controls:[], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'H', targets:[2], controls:[], params:{} },
        { gate:'CNOT', targets:[2], controls:[0], params:{} },
        { gate:'CNOT', targets:[2], controls:[1], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'M', targets:[0], controls:[], params:{} },
        { gate:'M', targets:[1], controls:[], params:{} },
      ]
    },
    {
      name: 'Grover (2-qubit)', qubits: 2, clbits: 2,
      goal: 'Search marked state |11⟩ in √N queries.',
      note: 'Quadratic speedup over classical search.',
      steps: [
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'CZ', targets:[1], controls:[0], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'X', targets:[0], controls:[], params:{} },
        { gate:'X', targets:[1], controls:[], params:{} },
        { gate:'CZ', targets:[1], controls:[0], params:{} },
        { gate:'X', targets:[0], controls:[], params:{} },
        { gate:'X', targets:[1], controls:[], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
      ]
    },
    {
      name: 'Grover (3-qubit)', qubits: 3, clbits: 3,
      goal: 'Search marked state |111⟩ among 8 states.',
      note: 'One Grover iteration shown; needs ~2.2 for 3 qubits.',
      steps: [
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'H', targets:[2], controls:[], params:{} },
        { gate:'CCX', targets:[2], controls:[0,1], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'X', targets:[0], controls:[], params:{} },
        { gate:'X', targets:[1], controls:[], params:{} },
        { gate:'CCX', targets:[2], controls:[0,1], params:{} },
        { gate:'X', targets:[0], controls:[], params:{} },
        { gate:'X', targets:[1], controls:[], params:{} },
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'H', targets:[1], controls:[], params:{} },
      ]
    },
    {
      name: '3-Qubit QFT', qubits: 3, clbits: 3,
      goal: 'Quantum Fourier Transform on 3 qubits.',
      note: 'Core subroutine for Shor\'s algorithm and phase estimation.',
      steps: [
        { gate:'H', targets:[0], controls:[], params:{} },
        { gate:'CPhase', targets:[0], controls:[1], params:{lambda:'pi/2'} },
        { gate:'CPhase', targets:[0], controls:[2], params:{lambda:'pi/4'} },
        { gate:'H', targets:[1], controls:[], params:{} },
        { gate:'CPhase', targets:[1], controls:[2], params:{lambda:'pi/2'} },
        { gate:'H', targets:[2], controls:[], params:{} },
        { gate:'SWAP', targets:[0,2], controls:[], params:{} },
      ]
    },
    {
      name: 'Random Circuit', qubits: 3, clbits: 3,
      goal: 'Benchmark simulation with random gates.',
      note: 'Used for quantum supremacy experiments.',
      steps: [] // generated dynamically
    }
  ];

  function generateRandomCircuit(n, depth) {
    const gates1 = ['H','X','Y','Z','S','T','Rx','Ry','Rz'];
    const steps = [];
    let id = 0;
    for (let d = 0; d < depth; d++) {
      for (let q = 0; q < n; q++) {
        if (Math.random() < 0.3 && q + 1 < n) {
          steps.push({ id: id++, gate:'CNOT', targets:[q+1], controls:[q], params:{} });
          q++;
        } else {
          const g = gates1[Math.floor(Math.random() * gates1.length)];
          const params = g === 'Rx'||g==='Ry'||g==='Rz' ? { theta: (Math.random()*2*PI).toFixed(4) } : {};
          steps.push({ id: id++, gate:g, targets:[q], controls:[], params });
        }
      }
    }
    return steps;
  }

  // ══════════════════════════════════════════════════════════
  // 12.  SYNTAX HIGHLIGHTER
  // ══════════════════════════════════════════════════════════
  function highlightQASM(code) {
    const keywords = /\b(OPENQASM|include|qreg|creg|gate|opaque|if|measure|reset|barrier)\b/g;
    const gates = /\b(h|x|y|z|s|sdg|t|tdg|sx|rx|ry|rz|p|u3|u|cx|cz|cy|ch|swap|ccx|cswap|cp|crz|id)\b/g;
    const numbers = /\b(\d+\.?\d*)\b/g;
    const comments = /(\/\/.*?)$/gm;
    const strings = /(".*?")/g;
    // Build safe HTML using a simple token-based approach
    let result = code;
    // Process in order (comments last to prevent double-escaping)
    const spans = [];
    let i = 0;
    const chars = result.split('');
    // Simple pass: just replace token patterns
    result = result
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    result = result
      .replace(/(\/\/.*?)(\n|$)/g, '<span class="qcd-tok-comment">$1</span>$2')
      .replace(/\b(OPENQASM|include|qreg|creg|gate|opaque|if|measure|reset|barrier)\b/g, '<span class="qcd-tok-keyword">$1</span>')
      .replace(/\b(h|x|y|z|s|sdg|t|tdg|sx|rx|ry|rz|p|u3|u|cx|cz|cy|ch|swap|ccx|cswap|cp|crz|id)(?=\s|\(|\[)/g, '<span class="qcd-tok-gate">$1</span>')
      .replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/g, '<span class="qcd-tok-number">$1</span>')
      .replace(/\b(q|c|qreg|creg)(?=\[)/g, '<span class="qcd-tok-register">$1</span>')
      .replace(/\b(pi)\b/g, '<span class="qcd-tok-param">$1</span>');
    return result;
  }

  function highlightQiskit(code) {
    let result = code
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    result = result
      .replace(/(#.*?)(\n|$)/g, '<span class="qcd-tok-comment">$1</span>$2')
      .replace(/\b(from|import|def|return|if|else|for|in|print)\b/g, '<span class="qcd-tok-keyword">$1</span>')
      .replace(/\b(QuantumCircuit|qml|cirq|np)\b/g, '<span class="qcd-tok-register">$1</span>')
      .replace(/\bqc\.([\w]+)/g, 'qc.<span class="qcd-tok-gate">$1</span>')
      .replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/g, '<span class="qcd-tok-number">$1</span>')
      .replace(/\b(np\.pi|pi)\b/g, '<span class="qcd-tok-param">$1</span>');
    return result;
  }

  // ══════════════════════════════════════════════════════════
  // 13.  AUTOSAVE / LOAD
  // ══════════════════════════════════════════════════════════
  const AUTOSAVE_KEY = 'qcd_circuit_v1';
  function autosave() {
    try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(model)); } catch (_) {}
  }
  function autoload() {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return false;
      const m = JSON.parse(raw);
      if (m && m.numQubits && Array.isArray(m.steps)) {
        model = m;
        return true;
      }
    } catch (_) {}
    return false;
  }

  // ══════════════════════════════════════════════════════════
  // 14.  SHARE LINK  (URL hash — validated, never injected)
  // ══════════════════════════════════════════════════════════
  function encodeShareLink() {
    const json = JSON.stringify(model);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return window.location.href.split('#')[0] + '#qcd=' + b64;
  }
  function decodeShareLink(hash) {
    if (!hash || !hash.startsWith('#qcd=')) return null;
    try {
      const b64 = hash.slice(5);
      const json = decodeURIComponent(escape(atob(b64)));
      const m = JSON.parse(json);
      if (!m || typeof m.numQubits !== 'number' || !Array.isArray(m.steps)) return null;
      // Validate all steps
      for (const s of m.steps) {
        if (typeof s.gate !== 'string' || !GATE_DEFS[s.gate]) return null;
        if (!Array.isArray(s.targets) || !Array.isArray(s.controls)) return null;
      }
      m.numQubits = Math.max(1, Math.min(10, m.numQubits));
      m.numClbits = Math.max(1, Math.min(10, m.numClbits || m.numQubits));
      return m;
    } catch (_) { return null; }
  }

  // ══════════════════════════════════════════════════════════
  // 15.  SVG CIRCUIT RENDERER
  // ══════════════════════════════════════════════════════════
  const CELL_W = 56, CELL_H = 52, LABEL_W = 60, MARG_TOP = 20, MEAS_W = 30;
  let numCols = 20; // visible columns (minimum)
  let selectedStep = null;
  let playheadStep = -1;

  function svgStepCount() {
    return Math.max(numCols, model.steps.length + 4);
  }

  function renderSVG() {
    const svg = document.getElementById('qcd-svg-circuit');
    if (!svg) return;
    const n = model.numQubits;
    const cols = svgStepCount();
    const W = LABEL_W + cols * CELL_W + MEAS_W;
    const H = MARG_TOP + n * CELL_H + 20;
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // Clear
    while (svg.firstChild) svg.removeChild(svg.lastChild);

    // ── Wires ──
    for (let q = 0; q < n; q++) {
      const y = MARG_TOP + q * CELL_H + CELL_H / 2;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', LABEL_W);
      line.setAttribute('x2', LABEL_W + cols * CELL_W);
      line.setAttribute('y1', y); line.setAttribute('y2', y);
      line.setAttribute('class', 'qcd-wire');
      svg.appendChild(line);
      // Label
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', LABEL_W - 6);
      txt.setAttribute('y', y + 4);
      txt.setAttribute('text-anchor', 'end');
      txt.setAttribute('class', 'qcd-qubit-label');
      txt.textContent = `|q${q}⟩`;
      svg.appendChild(txt);
    }

    // ── Drop zones (click-to-place) ──
    for (let q = 0; q < n; q++) {
      for (let col = 0; col < cols; col++) {
        const x = LABEL_W + col * CELL_W;
        const y = MARG_TOP + q * CELL_H;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x + 2); rect.setAttribute('y', y + 2);
        rect.setAttribute('width', CELL_W - 4); rect.setAttribute('height', CELL_H - 4);
        rect.setAttribute('class', 'qcd-drop-zone');
        rect.setAttribute('data-col', col); rect.setAttribute('data-q', q);
        rect.setAttribute('tabindex', '0');
        rect.setAttribute('aria-label', `Column ${col+1}, qubit ${q}`);
        rect.addEventListener('click', onDropZoneClick);
        rect.addEventListener('keydown', onDropZoneKey);
        svg.appendChild(rect);
      }
    }

    // ── Playhead ──
    if (playheadStep >= 0) {
      const x = LABEL_W + (playheadStep + 1) * CELL_W - CELL_W * 0.1;
      const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineEl.setAttribute('x1', x); lineEl.setAttribute('x2', x);
      lineEl.setAttribute('y1', MARG_TOP); lineEl.setAttribute('y2', H - 10);
      lineEl.setAttribute('class', 'qcd-step-playhead');
      svg.appendChild(lineEl);
    }

    // ── Gates (place by column = step index) ──
    // Assign each step a column
    const colAssign = assignColumns(model.steps, n);

    for (let si = 0; si < model.steps.length; si++) {
      const step = model.steps[si];
      const col = colAssign[si];
      renderGateInSVG(svg, step, col, si);
    }
  }

  function assignColumns(steps, n) {
    // Greedy: place each step in the earliest column not occupied by its qubits
    const qubitCol = new Array(n).fill(0);
    return steps.map(step => {
      const qubits = [...(step.targets||[]), ...(step.controls||[])];
      if (!qubits.length) return 0;
      const earliest = Math.max(...qubits.map(q => qubitCol[q]));
      qubits.forEach(q => { qubitCol[q] = earliest + 1; });
      return earliest;
    });
  }

  function renderGateInSVG(svg, step, col, si) {
    const g = step.gate;
    const def = GATE_DEFS[g] || GATE_DEFS.I;
    const colors = GATE_COLORS[def.group] || GATE_COLORS.single;
    const tgt = step.targets[0];
    const ctrl = step.controls && step.controls[0];

    const cx = LABEL_W + col * CELL_W + CELL_W / 2;
    const cy = MARG_TOP + tgt * CELL_H + CELL_H / 2;
    const isSelected = selectedStep === si;

    if (g === 'BARRIER') {
      const topY = MARG_TOP;
      const botY = MARG_TOP + (step.targets.length || 1) * CELL_H;
      const lineEl = document.createElementNS('http://www.w3.org/2000/svg','line');
      lineEl.setAttribute('x1', cx); lineEl.setAttribute('x2', cx);
      lineEl.setAttribute('y1', topY); lineEl.setAttribute('y2', botY);
      lineEl.setAttribute('class', 'qcd-barrier-line');
      svg.appendChild(lineEl);
      return;
    }

    // Control dot + connector line for 2-qubit gates
    if (ctrl !== undefined && ctrl !== null) {
      const ctrlY = MARG_TOP + ctrl * CELL_H + CELL_H / 2;
      const connLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      connLine.setAttribute('x1', cx); connLine.setAttribute('x2', cx);
      connLine.setAttribute('y1', Math.min(cy, ctrlY));
      connLine.setAttribute('y2', Math.max(cy, ctrlY));
      connLine.setAttribute('class', 'qcd-ctrl-line');
      svg.appendChild(connLine);
      // Control dot
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', cx); dot.setAttribute('cy', ctrlY);
      dot.setAttribute('r', 5); dot.setAttribute('class', 'qcd-ctrl-dot');
      svg.appendChild(dot);
    }

    // For CCX: two control dots
    if (g === 'CCX' || g === 'CSWAP') {
      const ctrls = step.controls || [];
      for (const cq of ctrls) {
        const ctrlY = MARG_TOP + cq * CELL_H + CELL_H / 2;
        const connLine = document.createElementNS('http://www.w3.org/2000/svg','line');
        connLine.setAttribute('x1', cx); connLine.setAttribute('x2', cx);
        const tgt2Y = MARG_TOP + step.targets[0] * CELL_H + CELL_H / 2;
        connLine.setAttribute('y1', Math.min(ctrlY, tgt2Y));
        connLine.setAttribute('y2', Math.max(ctrlY, tgt2Y));
        connLine.setAttribute('class', 'qcd-ctrl-line');
        svg.appendChild(connLine);
        const dot = document.createElementNS('http://www.w3.org/2000/svg','circle');
        dot.setAttribute('cx', cx); dot.setAttribute('cy', ctrlY);
        dot.setAttribute('r', 5); dot.setAttribute('class', 'qcd-ctrl-dot');
        svg.appendChild(dot);
      }
    }

    // SWAP X marks
    if (g === 'SWAP' && step.targets[1] !== undefined) {
      const tgt2Y = MARG_TOP + step.targets[1] * CELL_H + CELL_H / 2;
      const connLine = document.createElementNS('http://www.w3.org/2000/svg','line');
      connLine.setAttribute('x1', cx); connLine.setAttribute('x2', cx);
      connLine.setAttribute('y1', Math.min(cy, tgt2Y)); connLine.setAttribute('y2', Math.max(cy, tgt2Y));
      connLine.setAttribute('class', 'qcd-ctrl-line');
      svg.appendChild(connLine);
      drawSwapX(svg, cx, tgt2Y, colors, si);
    }

    // Main gate box (or special shapes)
    if (g === 'M') {
      drawMeasureGate(svg, cx, cy, isSelected, si);
    } else if (g === 'RESET') {
      drawResetGate(svg, cx, cy, isSelected, si);
    } else {
      drawBoxGate(svg, cx, cy, def.label, colors, isSelected, si, step);
    }
  }

  function drawBoxGate(svg, cx, cy, label, colors, isSelected, si, step) {
    const W = 40, H = 32;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', cx - W/2); rect.setAttribute('y', cy - H/2);
    rect.setAttribute('width', W); rect.setAttribute('height', H);
    rect.setAttribute('rx', 4);
    rect.setAttribute('fill', colors.fill);
    rect.setAttribute('stroke', isSelected ? '#fff' : colors.stroke);
    rect.setAttribute('stroke-width', isSelected ? 2 : 1.5);
    rect.style.cursor = 'pointer';
    rect.addEventListener('click', (e) => { e.stopPropagation(); selectStep(si); });
    rect.addEventListener('dblclick', (e) => { e.stopPropagation(); openParamPopover(si, e); });
    svg.appendChild(rect);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', cx); txt.setAttribute('y', cy);
    txt.setAttribute('class', 'qcd-gate-text');
    txt.setAttribute('fill', colors.text);
    txt.setAttribute('font-size', label.length > 3 ? '9' : '11');
    txt.textContent = label;
    txt.style.pointerEvents = 'none';
    svg.appendChild(txt);
  }

  function drawMeasureGate(svg, cx, cy, isSelected, si) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', cx-20); rect.setAttribute('y', cy-16);
    rect.setAttribute('width', 40); rect.setAttribute('height', 32);
    rect.setAttribute('rx', 4);
    rect.setAttribute('fill', '#0f2922');
    rect.setAttribute('stroke', isSelected ? '#fff' : '#0d9488');
    rect.setAttribute('stroke-width', isSelected ? 2 : 1.5);
    rect.style.cursor = 'pointer';
    rect.addEventListener('click', (e) => { e.stopPropagation(); selectStep(si); });
    svg.appendChild(rect);
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('d', `M ${cx-9} ${cy+4} A 9 9 0 0 1 ${cx+9} ${cy+4}`);
    arc.setAttribute('class', 'qcd-measure-arc');
    svg.appendChild(arc);
    const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needle.setAttribute('x1', cx); needle.setAttribute('y1', cy+4);
    needle.setAttribute('x2', cx+7); needle.setAttribute('y2', cy-6);
    needle.setAttribute('stroke', '#0d9488'); needle.setAttribute('stroke-width', 1.5);
    svg.appendChild(needle);
  }

  function drawResetGate(svg, cx, cy, isSelected, si) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', cx-20); rect.setAttribute('y', cy-16);
    rect.setAttribute('width', 40); rect.setAttribute('height', 32);
    rect.setAttribute('rx', 4);
    rect.setAttribute('fill', '#1e1b2e');
    rect.setAttribute('stroke', isSelected ? '#fff' : '#7c3aed');
    rect.setAttribute('stroke-width', isSelected ? 2 : 1.5);
    rect.style.cursor = 'pointer';
    rect.addEventListener('click', (e) => { e.stopPropagation(); selectStep(si); });
    svg.appendChild(rect);
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', cx); txt.setAttribute('y', cy);
    txt.setAttribute('class', 'qcd-gate-text');
    txt.setAttribute('fill', '#c4b5fd'); txt.setAttribute('font-size', '10');
    txt.textContent = '|0⟩';
    txt.style.pointerEvents = 'none';
    svg.appendChild(txt);
  }

  function drawSwapX(svg, cx, cy, colors, si) {
    const d = 7;
    const lines = [
      [cx-d, cy-d, cx+d, cy+d],
      [cx+d, cy-d, cx-d, cy+d]
    ];
    for (const [x1,y1,x2,y2] of lines) {
      const l = document.createElementNS('http://www.w3.org/2000/svg','line');
      l.setAttribute('x1',x1); l.setAttribute('y1',y1);
      l.setAttribute('x2',x2); l.setAttribute('y2',y2);
      l.setAttribute('stroke', colors.stroke); l.setAttribute('stroke-width', 2);
      l.style.cursor = 'pointer';
      l.addEventListener('click', (e) => { e.stopPropagation(); selectStep(si); });
      svg.appendChild(l);
    }
  }

  // ══════════════════════════════════════════════════════════
  // 16.  INTERACTION HANDLERS
  // ══════════════════════════════════════════════════════════
  let pendingGateKey = null; // gate being placed via click-to-place
  let dragGate = null;       // currently dragged gate key
  let dragEl = null;         // ghost element

  function selectStep(si) {
    selectedStep = si === selectedStep ? null : si;
    renderSVG();
    updateStatusBar();
  }

  function onDropZoneClick(e) {
    const col = parseInt(e.currentTarget.getAttribute('data-col'));
    const q = parseInt(e.currentTarget.getAttribute('data-q'));
    if (pendingGateKey) {
      placeGate(pendingGateKey, col, q);
      pendingGateKey = null;
      document.querySelectorAll('.qcd-gate-chip').forEach(c => c.classList.remove('active'));
    } else if (selectedStep !== null) {
      // Move selected gate
    }
  }

  function onDropZoneKey(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDropZoneClick(e); }
  }

  function placeGate(gateKey, col, qubit) {
    const def = GATE_DEFS[gateKey];
    if (!def) return;
    pushUndo();
    let step;
    if (def.twoQubit) {
      const ctrl = qubit > 0 ? qubit - 1 : qubit + 1;
      step = { id: Date.now(), gate: gateKey, targets: [qubit], controls: [ctrl], params: {} };
    } else if (def.threeQubit) {
      const n = model.numQubits;
      const c0 = qubit > 0 ? qubit - 1 : 0;
      const c1 = Math.min(n-1, qubit+1);
      step = { id: Date.now(), gate: gateKey, targets: [qubit], controls: [c0, c1], params: {} };
    } else {
      step = { id: Date.now(), gate: gateKey, targets: [qubit], controls: [], params: {} };
    }
    // Insert at col position (greedy)
    model.steps.push(step);
    afterModelChange(true);
    // Open param popover if parametric
    if (def.params && def.params.length) {
      const si = model.steps.length - 1;
      setTimeout(() => openParamPopoverById(si), 50);
    }
  }

  function deleteSelected() {
    if (selectedStep === null) return;
    pushUndo();
    model.steps.splice(selectedStep, 1);
    selectedStep = null;
    afterModelChange(true);
  }

  function clearCircuit() {
    pushUndo();
    model.steps = [];
    selectedStep = null;
    playheadStep = -1;
    afterModelChange(true);
  }

  // ── Drag-and-drop from palette ──
  function setupDragDrop() {
    const chips = document.querySelectorAll('.qcd-gate-chip');
    chips.forEach(chip => {
      chip.addEventListener('dragstart', (e) => {
        dragGate = chip.dataset.gate;
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', dragGate);
        chip.style.opacity = '0.5';
        createDragGhost(dragGate);
      });
      chip.addEventListener('dragend', () => {
        chip.style.opacity = '';
        removeDragGhost();
        dragGate = null;
      });
      chip.addEventListener('click', () => {
        if (pendingGateKey === chip.dataset.gate) {
          pendingGateKey = null;
          chip.classList.remove('active');
        } else {
          pendingGateKey = chip.dataset.gate;
          document.querySelectorAll('.qcd-gate-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          showToast(`Click a wire slot to place ${GATE_DEFS[chip.dataset.gate]?.name || chip.dataset.gate}`);
        }
      });
    });

    const canvas = document.getElementById('qcd-canvas-wrap');
    if (canvas) {
      canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        updateGhostPos(e.clientX, e.clientY);
        highlightDropZone(e.clientX, e.clientY);
      });
      canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const gate = e.dataTransfer.getData('text/plain');
        if (!gate || !GATE_DEFS[gate]) return;
        const { col, q } = getColQFromEvent(e);
        if (col >= 0 && q >= 0) placeGate(gate, col, q);
        clearDropHighlights();
      });
      canvas.addEventListener('dragleave', clearDropHighlights);
    }
  }

  function createDragGhost(gateKey) {
    dragEl = document.createElement('div');
    dragEl.className = 'qcd-drag-ghost';
    dragEl.textContent = GATE_DEFS[gateKey]?.label || gateKey;
    document.body.appendChild(dragEl);
  }
  function removeDragGhost() {
    if (dragEl) { dragEl.remove(); dragEl = null; }
  }
  function updateGhostPos(x, y) {
    if (dragEl) { dragEl.style.left = x + 'px'; dragEl.style.top = y + 'px'; }
  }
  function getColQFromEvent(e) {
    const svg = document.getElementById('qcd-svg-circuit');
    if (!svg) return { col: -1, q: -1 };
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const col = Math.floor((x - LABEL_W) / CELL_W);
    const q = Math.floor((y - MARG_TOP) / CELL_H);
    if (col < 0 || q < 0 || q >= model.numQubits) return { col: -1, q: -1 };
    return { col, q };
  }
  function highlightDropZone(clientX, clientY) {
    clearDropHighlights();
    const { col, q } = getColQFromEvent({ clientX, clientY });
    if (col < 0) return;
    const zone = document.querySelector(`[data-col="${col}"][data-q="${q}"]`);
    if (zone) zone.classList.add('highlight');
  }
  function clearDropHighlights() {
    document.querySelectorAll('.qcd-drop-zone.highlight').forEach(el => el.classList.remove('highlight'));
  }

  // ══════════════════════════════════════════════════════════
  // 17.  PARAMETER POPOVER
  // ══════════════════════════════════════════════════════════
  function openParamPopover(si, event) {
    const step = model.steps[si];
    if (!step) return;
    const def = GATE_DEFS[step.gate];
    if (!def || !def.params || !def.params.length) return;
    openParamPopoverById(si, event ? { clientX: event.clientX, clientY: event.clientY } : null);
  }

  function openParamPopoverById(si, pos) {
    const step = model.steps[si];
    if (!step) return;
    const def = GATE_DEFS[step.gate];
    if (!def || !def.params) return;
    const popover = document.getElementById('qcd-popover');
    if (!popover) return;
    popover.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'qcd-popover__title';
    title.textContent = `${def.name} — Parameters`;
    popover.appendChild(title);
    const fields = {};
    for (const paramKey of def.params) {
      const field = document.createElement('div');
      field.className = 'qcd-popover__field';
      const label = document.createElement('label');
      label.className = 'qcd-popover__label';
      label.textContent = paramKey + ' (accepts pi, pi/4, etc.)';
      const input = document.createElement('input');
      input.type = 'text'; input.className = 'qcd-popover__input';
      input.value = step.params[paramKey] || '0';
      input.setAttribute('aria-label', paramKey);
      fields[paramKey] = input;
      const errMsg = document.createElement('div');
      errMsg.className = 'qcd-popover__error';
      input.addEventListener('input', () => {
        const val = parseExpr(input.value);
        errMsg.textContent = isNaN(val) ? 'Invalid expression' : '';
      });
      field.appendChild(label); field.appendChild(input); field.appendChild(errMsg);
      popover.appendChild(field);
    }
    const actions = document.createElement('div');
    actions.className = 'qcd-popover__actions';
    const applyBtn = document.createElement('button');
    applyBtn.className = 'qcd-btn qcd-btn--primary qcd-btn--sm';
    applyBtn.textContent = 'Apply';
    applyBtn.addEventListener('click', () => {
      let valid = true;
      for (const [k, inp] of Object.entries(fields)) {
        if (isNaN(parseExpr(inp.value))) { valid = false; break; }
      }
      if (!valid) return;
      pushUndo();
      for (const [k, inp] of Object.entries(fields)) step.params[k] = inp.value;
      closePopover();
      afterModelChange(true);
    });
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'qcd-btn qcd-btn--sm';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closePopover);
    actions.appendChild(applyBtn); actions.appendChild(cancelBtn);
    popover.appendChild(actions);
    // Position
    if (pos) {
      popover.style.left = (pos.clientX + 12) + 'px';
      popover.style.top = pos.clientY + 'px';
    } else {
      popover.style.left = '50%'; popover.style.top = '30%';
    }
    popover.classList.add('visible');
    const firstInput = popover.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function closePopover() {
    const p = document.getElementById('qcd-popover');
    if (p) p.classList.remove('visible');
  }

  // ══════════════════════════════════════════════════════════
  // 18.  RESULTS PANEL
  // ══════════════════════════════════════════════════════════
  let simResult = null;
  let shotCounts = null;
  let ampSortKey = 'state';
  let ampSortDir = 1;
  let hideZero = false;

  function runSimulation() {
    const n = model.numQubits;
    let upTo = playheadStep >= 0 ? playheadStep : undefined;
    const { sv } = simulateModel(model, upTo);
    simResult = sv;
    updateAmpTable(sv, n);
    updateBlochPanel(sv, n);
    updateMetricsPanel();
  }

  function runShots1024() {
    if (!simResult) return;
    const shots = parseInt(document.getElementById('qcd-shot-count')?.value || '1024');
    const { sv } = simulateModel(model);
    shotCounts = runShots(sv, shots);
    updateHistogram(sv, shotCounts, model.numQubits);
  }

  function updateAmpTable(sv, n) {
    const tbody = document.getElementById('qcd-amp-tbody');
    if (!tbody) return;
    const rows = sv.map((amp, i) => ({
      i, label: toBinaryLabel(i, n), mag: cAbs(amp), phase: cPhase(amp), prob: cAbs2(amp)
    }));
    if (hideZero) rows.filter(r => r.mag > 1e-9);
    rows.sort((a,b) => {
      const sign = ampSortDir;
      if (ampSortKey === 'state') return sign * (a.i - b.i);
      if (ampSortKey === 'mag') return sign * (b.mag - a.mag);
      if (ampSortKey === 'prob') return sign * (b.prob - a.prob);
      return 0;
    });
    while (tbody.firstChild) tbody.removeChild(tbody.lastChild);
    for (const r of rows) {
      if (hideZero && r.mag < 1e-9) continue;
      const tr = document.createElement('tr');
      const phaseColor = phaseToColor(r.phase);
      const cells = [
        `<td class="qcd-tok-register">|${r.label}⟩</td>`,
        `<td>${r.mag.toFixed(4)}</td>`,
        `<td><span class="qcd-phase-dot" style="background:${phaseColor}" title="${(r.phase * 180 / PI).toFixed(1)}°"></span> ${(r.phase * 180 / PI).toFixed(1)}°</td>`,
        `<td><div class="qcd-amp-bar-wrap"><div class="qcd-amp-bar" style="width:${(r.prob*100).toFixed(1)}%;background:${phaseColor}"></div></div></td>`,
        `<td>${(r.prob * 100).toFixed(2)}%</td>`
      ];
      tr.innerHTML = cells.join('');
      tbody.appendChild(tr);
    }
  }

  function toBinaryLabel(i, n) {
    // Qiskit: q(n-1)…q0, so bit n-1 is MSB of label
    return i.toString(2).padStart(n, '0').split('').reverse().join('');
  }

  function phaseToColor(phase) {
    const hue = ((phase / (2 * PI)) * 360 + 360) % 360;
    return `hsl(${hue.toFixed(0)},80%,55%)`;
  }

  function updateHistogram(sv, counts, n) {
    const canvas = document.getElementById('qcd-histogram-canvas');
    if (!canvas) return;
    const size = sv.length;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || 280, H = 150;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    const maxCount = Math.max(...counts, 1);
    const maxProb = Math.max(...sv.map(a => cAbs2(a)), 1e-9);
    const barW = Math.max(2, (W - 20) / size - 2);
    const pad = 10;
    for (let i = 0; i < size; i++) {
      const x = pad + i * ((W - pad * 2) / size);
      const prob = cAbs2(sv[i]);
      const count = counts ? counts[i] : 0;
      // Expected prob overlay
      const expH = (prob / maxProb) * (H - 30);
      ctx.fillStyle = 'rgba(124,58,237,0.2)';
      ctx.fillRect(x, H - 20 - expH, barW, expH);
      // Shot bar
      if (counts) {
        const cH = (count / maxCount) * (H - 30);
        const hue = (i / size) * 270;
        ctx.fillStyle = `hsl(${hue},75%,55%)`;
        ctx.fillRect(x, H - 20 - cH, barW * 0.7, cH);
      }
      // Label
      if (size <= 16) {
        ctx.fillStyle = 'rgba(155,168,196,0.8)';
        ctx.font = `${Math.min(9, barW)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(toBinaryLabel(i, n), x + barW / 2, H - 4);
      }
    }
    // X-axis
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(pad, H - 20); ctx.lineTo(W - pad, H - 20); ctx.stroke();
    const meta = document.getElementById('qcd-hist-meta');
    if (meta && counts) {
      const total = counts.reduce((a,b)=>a+b,0);
      meta.textContent = `${total} shots   |   violet = expected prob, colour = counts`;
    }
  }

  function updateBlochPanel(sv, n) {
    const row = document.getElementById('qcd-bloch-row');
    if (!row) return;
    while (row.firstChild) row.removeChild(row.lastChild);
    for (let q = 0; q < n; q++) {
      const bv = qubitBlochVector(sv, n, q);
      const card = document.createElement('div');
      card.className = 'qcd-bloch-card';
      const canvasEl = document.createElement('canvas');
      canvasEl.className = 'qcd-bloch-canvas';
      canvasEl.width = 80; canvasEl.height = 80;
      canvasEl.setAttribute('aria-label', `Bloch sphere for qubit ${q}`);
      card.appendChild(canvasEl);
      const label = document.createElement('div');
      label.className = 'qcd-bloch-label';
      label.textContent = `q${q}`;
      card.appendChild(label);
      if (bv.purity < 0.95) {
        const badge = document.createElement('div');
        badge.className = 'qcd-bloch-mixed-badge';
        badge.textContent = 'Mixed';
        card.appendChild(badge);
      }
      row.appendChild(card);
      drawBloch2D(canvasEl, bv);
    }
  }

  function drawBloch2D(canvas, bv) {
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 4;
    // Sphere
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.stroke();
    // Equator
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.25, 0, 0, 2 * PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
    // Axes labels
    ctx.fillStyle = 'rgba(155,168,196,0.6)'; ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', cx, cy - r - 2);
    ctx.fillText('|1⟩', cx, cy + r + 8);
    // Bloch vector
    const len = Math.sqrt(bv.x*bv.x + bv.y*bv.y + bv.z*bv.z);
    if (len < 0.01) {
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 2*PI);
      ctx.fillStyle = '#d97706'; ctx.fill();
      return;
    }
    // Project onto 2D (simple x-z projection)
    const px = cx + bv.x * r * 0.8;
    const py = cy - bv.z * r * 0.8;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 3, 0, 2*PI);
    ctx.fillStyle = '#22d3ee'; ctx.fill();
  }

  function updateMetricsPanel() {
    const m = computeMetrics(model);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('qcd-metric-depth', m.depth);
    set('qcd-metric-gates', m.gateCount);
    set('qcd-metric-2q', m.twoQCount);
    set('qcd-metric-tcount', m.tCount);
  }

  function updateStatusBar() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('qcd-status-qubits', model.numQubits + 'Q');
    set('qcd-status-steps', model.steps.length + ' gates');
    set('qcd-status-selected', selectedStep !== null ? `Gate: ${model.steps[selectedStep]?.gate}` : '');
  }

  // ══════════════════════════════════════════════════════════
  // 19.  CODE EDITOR SYNC
  // ══════════════════════════════════════════════════════════
  let codeTab = 'qasm'; // qasm | qiskit | cirq | pennylane
  let codeDebounceTimer = null;
  let lastValidModel = null;

  function switchCodeTab(tab) {
    codeTab = tab;
    document.querySelectorAll('.qcd-code-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const isEditable = tab === 'qasm' || tab === 'qiskit';
    const ta = document.getElementById('qcd-code-textarea');
    if (ta) ta.readOnly = !isEditable;
    const roMsg = document.getElementById('qcd-code-readonly-msg');
    if (roMsg) roMsg.style.display = isEditable ? 'none' : 'block';
    syncCodeFromModel();
    const errBanner = document.getElementById('qcd-code-error');
    if (errBanner) { errBanner.classList.remove('visible'); }
  }

  function syncCodeFromModel() {
    const ta = document.getElementById('qcd-code-textarea');
    if (!ta) return;
    let code = '';
    if (codeTab === 'qasm') code = modelToQASM(model);
    else if (codeTab === 'qiskit') code = modelToQiskit(model);
    else if (codeTab === 'cirq') code = modelToCirq(model);
    else code = modelToPennyLane(model);
    ta.value = code;
    updateLineNumbers(code);
  }

  function updateLineNumbers(code) {
    const lnEl = document.getElementById('qcd-line-numbers');
    if (!lnEl) return;
    const lines = code.split('\n').length;
    const html = [];
    for (let i = 1; i <= lines; i++) html.push(`<span>${i}</span>`);
    lnEl.innerHTML = html.join('');
  }

  function onCodeInput() {
    clearTimeout(codeDebounceTimer);
    const ta = document.getElementById('qcd-code-textarea');
    if (!ta) return;
    updateLineNumbers(ta.value);
    codeDebounceTimer = setTimeout(() => {
      const code = ta.value;
      let result;
      if (codeTab === 'qasm') result = parseQASM(code);
      else if (codeTab === 'qiskit') result = parseQiskit(code);
      else return;
      const errBanner = document.getElementById('qcd-code-error');
      if (result.errors.length > 0) {
        const e = result.errors[0];
        if (errBanner) { errBanner.textContent = `Line ${e.line}: ${e.msg}`; errBanner.classList.add('visible'); }
        // Keep last valid
      } else {
        if (errBanner) errBanner.classList.remove('visible');
        pushUndo();
        model = result.model;
        lastValidModel = JSON.parse(JSON.stringify(model));
        afterModelChange(false); // don't re-sync code (avoid loop)
      }
    }, 300);
  }

  // ══════════════════════════════════════════════════════════
  // 19B. BACKEND COMPILER, RUNNER & STEP-BY-STEP VISUALIZER
  // ══════════════════════════════════════════════════════════
  const BACKEND_URL = 'http://127.0.0.1:5000';
  let backendConnected = false;
  let backendChecked = false;
  let currentMainView = 'canvas'; // 'canvas' | 'code'

  // Step-by-Step Code Visualizer State
  let visualizeMode = false;
  let visSteps = [];
  let currentVisStep = 0;
  let visPlaying = false;
  let visTimer = null;

  function switchMainView(view) {
    currentMainView = view;
    const canvasWrap = document.getElementById('qcd-canvas-wrap');
    const codeArea = document.getElementById('qcd-code-area');
    const btnCanvas = document.getElementById('qcd-view-canvas');
    const btnCode = document.getElementById('qcd-view-code');

    if (view === 'code') {
      if (canvasWrap) canvasWrap.style.display = 'none';
      if (codeArea) codeArea.style.display = 'flex';
      if (btnCanvas) { btnCanvas.classList.remove('qcd-btn--active'); btnCanvas.setAttribute('aria-pressed', 'false'); }
      if (btnCode) { btnCode.classList.add('qcd-btn--active'); btnCode.setAttribute('aria-pressed', 'true'); }
      syncCodeFromModel();
      if (!backendChecked) checkBackendStatus();
    } else {
      if (visualizeMode) exitVisualizeCode();
      if (codeArea) codeArea.style.display = 'none';
      if (canvasWrap) canvasWrap.style.display = 'block';
      if (btnCode) { btnCode.classList.remove('qcd-btn--active'); btnCode.setAttribute('aria-pressed', 'false'); }
      if (btnCanvas) { btnCanvas.classList.add('qcd-btn--active'); btnCanvas.setAttribute('aria-pressed', 'true'); }
      renderSVG();
    }
  }

  // ── Terminal Management ──
  function termLog(msg, type = 'info') {
    const codeEl = document.getElementById('qcd-terminal-code');
    if (!codeEl) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const line = document.createElement('div');
    
    let prefix = `[${timeStr}] `;
    if (type === 'info') line.className = 'qcd-term-line--info';
    else if (type === 'success') line.className = 'qcd-term-line--success';
    else if (type === 'warn') line.className = 'qcd-term-line--warn';
    else if (type === 'error') line.className = 'qcd-term-line--error';
    else if (type === 'out') { line.className = 'qcd-term-line--out'; prefix = ''; }
    else line.className = 'qcd-term-line--dim';

    line.textContent = prefix + msg;
    codeEl.appendChild(line);
    const body = document.getElementById('qcd-terminal-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function termClear() {
    const codeEl = document.getElementById('qcd-terminal-code');
    if (codeEl) codeEl.innerHTML = '';
    termLog('Terminal cleared. QuantumLab compiler ready.', 'dim');
    setTermBadge('Ready', 'info');
  }

  function setTermBadge(text, type = 'info') {
    const b = document.getElementById('qcd-terminal-badge');
    if (!b) return;
    b.textContent = text;
    b.className = 'qcd-terminal__badge ' + (type === 'success' ? 'success' : type === 'error' ? 'error' : '');
  }

  function toggleTerminal() {
    const term = document.getElementById('qcd-terminal');
    const btn = document.getElementById('qcd-terminal-toggle');
    if (!term) return;
    term.classList.toggle('collapsed');
    if (btn) btn.textContent = term.classList.contains('collapsed') ? '▼' : '▲';
  }

  // ── Backend Status Checker ──
  async function checkBackendStatus() {
    backendChecked = true;
    const dot = document.getElementById('qcd-backend-dot');
    const label = document.getElementById('qcd-backend-label');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${BACKEND_URL}/api/status`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        backendConnected = true;
        if (dot) dot.className = 'qcd-backend-dot connected';
        if (label) label.textContent = `Python ${data.python_version || '3.14'} Backend (Connected)`;
        termLog(`Connected to QuantumLab Python Backend on ${BACKEND_URL}`, 'success');
        termLog(`Compiler: ${data.compiler || 'Python 3.14 (AST + NumPy Sim)'}`, 'dim');
        setTermBadge('Connected', 'success');
        return;
      }
    } catch (_) {
      // Backend not running
    }
    backendConnected = false;
    if (dot) dot.className = 'qcd-backend-dot browser';
    if (label) label.textContent = 'In-Browser Compiler';
    termLog(`In-Browser Quantum Compiler active. (Tip: Run 'run_backend.bat' for native Python 3.14 execution)`, 'dim');
  }

  // ── Code Compilation ──
  async function compileCode() {
    const ta = document.getElementById('qcd-code-textarea');
    if (!ta) return;
    const code = ta.value;
    const errBanner = document.getElementById('qcd-code-error');

    termLog(`Compiling ${codeTab.toUpperCase()} code...`, 'info');
    setTermBadge('Compiling...', 'info');

    // 1. If backend connected and in Qiskit tab
    if (backendConnected && codeTab === 'qiskit') {
      try {
        const res = await fetch(`${BACKEND_URL}/api/compile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language: 'qiskit' })
        });
        const data = await res.json();
        if (data.success) {
          if (errBanner) errBanner.classList.remove('visible');
          termLog(`[COMPILER] ${data.message} (${data.duration_ms}ms)`, 'success');
          termLog(`Detected ${data.stats.detected_gates} gates across ${data.stats.estimated_qubits} qubits.`, 'info');
          setTermBadge('Compiled', 'success');
          // Parse into model to keep canvas synchronized
          const parsed = parseQiskit(code);
          if (parsed.errors.length === 0) {
            model = parsed.model;
            afterModelChange(false);
          }
          showToast('Python / Qiskit code compiled successfully');
          return;
        } else {
          if (errBanner) {
            errBanner.textContent = data.error;
            errBanner.classList.add('visible');
          }
          termLog(`[SYNTAX ERROR] Line ${data.lineno || '?'}: ${data.error}`, 'error');
          if (data.text) termLog(`  > ${data.text}`, 'dim');
          setTermBadge('Syntax Error', 'error');
          return;
        }
      } catch (err) {
        termLog(`Backend communication error: ${err.message}. Falling back to in-browser compiler.`, 'warn');
      }
    }

    // 2. Client-Side Parser Fallback
    let result;
    if (codeTab === 'qasm') result = parseQASM(code);
    else if (codeTab === 'qiskit') result = parseQiskit(code);
    else {
      termLog(`${codeTab.toUpperCase()} is currently in read-only visual mode.`, 'warn');
      return;
    }

    if (result.errors.length > 0) {
      const e = result.errors[0];
      if (errBanner) {
        errBanner.textContent = `Line ${e.line}: ${e.msg}`;
        errBanner.classList.add('visible');
      }
      termLog(`[PARSER ERROR] Line ${e.line}: ${e.msg}`, 'error');
      setTermBadge('Error', 'error');
    } else {
      if (errBanner) errBanner.classList.remove('visible');
      pushUndo();
      model = result.model;
      afterModelChange(false);
      termLog(`Compilation Successful: Circuit built with ${model.steps.length} gates on ${model.numQubits} qubits.`, 'success');
      setTermBadge('Compiled', 'success');
      showToast('Code compiled successfully');
    }
  }

  // ── Code Runner ──
  async function runCode() {
    const ta = document.getElementById('qcd-code-textarea');
    if (!ta) return;
    const code = ta.value;

    termLog('Starting quantum execution...', 'info');
    setTermBadge('Running...', 'info');

    // 1. If backend connected and in Qiskit tab
    if (backendConnected && codeTab === 'qiskit') {
      try {
        const res = await fetch(`${BACKEND_URL}/api/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, shots: 1024 })
        });
        const data = await res.json();
        if (data.success) {
          // Output stdout if printed in Python
          if (data.stdout && data.stdout.trim()) {
            termLog('--- Standard Output ---', 'dim');
            data.stdout.trim().split('\n').forEach(line => termLog(line, 'out'));
            termLog('-----------------------', 'dim');
          }
          termLog(`Execution completed in ${data.duration_ms}ms with ${data.shots} shots.`, 'success');
          termLog(`Total steps: ${data.total_steps} | Qubits: ${data.num_qubits}`, 'info');

          // Store steps for visualizer
          visSteps = data.steps || [];

          // Update shots and simulation results
          shotCounts = data.counts || {};
          const { sv } = simulateModel(model);
          updateHistogram(sv, shotCounts, model.numQubits);
          runSimulation();
          setTermBadge('Complete', 'success');
          showToast(`Executed ${data.shots} shots successfully`);
          return;
        } else {
          termLog(`Execution failed: ${data.error}`, 'error');
          if (data.traceback) termLog(data.traceback, 'dim');
          setTermBadge('Error', 'error');
          return;
        }
      } catch (err) {
        termLog(`Backend error: ${err.message}. Running client-side simulation.`, 'warn');
      }
    }

    // 2. Client-Side Runner Fallback
    await compileCode();
    const { sv } = simulateModel(model);
    shotCounts = runShots(sv, 1024);
    updateHistogram(sv, shotCounts, model.numQubits);
    runSimulation();
    termLog(`Simulation completed. Calculated statevector amplitudes across ${1 << model.numQubits} computational basis states.`, 'success');
    termLog(`Executed 1024 stochastic measurement shots.`, 'info');
    setTermBadge('Success', 'success');
    showToast('Circuit simulated successfully (1024 shots)');
  }

  // ── Step-by-Step Code Visualizer ──
  function getStepExplanation(gate, targets, controls, params) {
    const tStr = targets.map(t => `Qubit ${t}`).join(', ');
    const cStr = controls.map(c => `Qubit ${c}`).join(', ');
    if (gate === 'H') return `Hadamard gate applied to ${tStr}. Creates equal superposition (|0⟩ + |1⟩)/√2.`;
    if (gate === 'X') return `Pauli-X (NOT) gate on ${tStr}. Flips computational basis |0⟩ ↔ |1⟩.`;
    if (gate === 'Y') return `Pauli-Y gate on ${tStr}. Combined bit-flip and phase-flip.`;
    if (gate === 'Z') return `Pauli-Z gate on ${tStr}. Inverts relative phase of |1⟩ component.`;
    if (gate === 'S') return `S phase gate (√Z) on ${tStr}. Adds imaginary phase factor i to |1⟩.`;
    if (gate === 'T') return `T gate (π/8) on ${tStr}. Adds e^(iπ/4) phase rotation to |1⟩.`;
    if (gate === 'CNOT') return `Controlled-NOT on target ${tStr} with control ${cStr}. Entangles qubits when control is in superposition.`;
    if (gate === 'CZ') return `Controlled-Z gate between ${cStr} and ${tStr}. Adds −1 phase only when both qubits are |11⟩.`;
    if (gate === 'SWAP') return `SWAP gate exchanging quantum states of ${cStr} and ${tStr}.`;
    if (gate === 'CCX') return `Toffoli (CCX) gate on target ${tStr} controlled by ${cStr}. Reversible quantum AND gate.`;
    if (gate === 'Rx' || gate === 'Ry' || gate === 'Rz') return `Continuous rotation ${gate}(${params.theta || 'θ'}) on ${tStr}.`;
    if (gate === 'Measure') return `Measurement on ${tStr}. Collapses quantum state to classical bit.`;
    return `Applied ${gate} operation on ${tStr}.`;
  }

  async function toggleVisualizeCode() {
    if (visualizeMode) {
      exitVisualizeCode();
      return;
    }

    termLog('Preparing step-by-step code visualization...', 'info');
    setTermBadge('Visualizing', 'info');

    // Ensure model is up to date
    await compileCode();

    // 1. Build step trace data (either from backend or generated client-side)
    visSteps = [];
    const ta = document.getElementById('qcd-code-textarea');
    const codeLines = ta ? ta.value.split('\n') : [];

    // Step 0: Ground state
    const dim = 1 << model.numQubits;
    let initialSv = [];
    for (let i = 0; i < dim; i++) initialSv.push(i === 0 ? C(1, 0) : C(0, 0));

    visSteps.push({
      stepIndex: 0,
      lineno: 1,
      code: codeTab === 'qiskit' ? `qc = QuantumCircuit(${model.numQubits}, ${model.numClbits})` : `qreg q[${model.numQubits}];`,
      gate: 'Init',
      explanation: `All ${model.numQubits} qubits initialized in standard computational ground state |0...0⟩.`,
      sv: initialSv,
      partialSteps: []
    });

    // Compute sequential intermediate states
    for (let i = 0; i < model.steps.length; i++) {
      const partial = model.steps.slice(0, i + 1);
      const partialModel = { numQubits: model.numQubits, numClbits: model.numClbits, steps: partial };
      const { sv } = simulateModel(partialModel);
      const st = model.steps[i];
      
      // Match code line
      let matchedLine = i + 2;
      for (let l = 0; l < codeLines.length; l++) {
        const lineStr = codeLines[l].toLowerCase();
        if (lineStr.includes(st.gate.toLowerCase()) || (st.gate === 'CNOT' && lineStr.includes('cx'))) {
          matchedLine = l + 1;
        }
      }

      visSteps.push({
        stepIndex: i + 1,
        lineno: matchedLine,
        code: codeLines[matchedLine - 1]?.trim() || `${st.gate} gate on Q${st.targets[0]}`,
        gate: st.gate,
        targets: st.targets,
        controls: st.controls || [],
        explanation: getStepExplanation(st.gate, st.targets, st.controls || [], st.params || {}),
        sv,
        partialSteps: partial
      });
    }

    // Activate Visualizer Bar
    visualizeMode = true;
    const stepperBar = document.getElementById('qcd-vis-stepper-bar');
    const visBtn = document.getElementById('qcd-code-visualize');
    const slider = document.getElementById('qcd-vis-slider');

    if (stepperBar) stepperBar.style.display = 'flex';
    if (visBtn) visBtn.classList.add('active');
    if (slider) {
      slider.max = visSteps.length - 1;
      slider.value = 0;
    }

    goToVisStep(0);
    termLog(`Step Visualizer loaded with ${visSteps.length} execution states. Use stepper controls or Play.`, 'success');
  }

  function goToVisStep(stepIdx) {
    if (!visualizeMode || visSteps.length === 0) return;
    currentVisStep = Math.max(0, Math.min(stepIdx, visSteps.length - 1));
    const step = visSteps[currentVisStep];
    if (!step) return;

    // Update Stepper UI
    const slider = document.getElementById('qcd-vis-slider');
    const counter = document.getElementById('qcd-vis-counter');
    const instEl = document.getElementById('qcd-vis-instruction');
    const explEl = document.getElementById('qcd-vis-expl');

    if (slider) slider.value = currentVisStep;
    if (counter) counter.textContent = `Step ${currentVisStep} / ${visSteps.length - 1} (Line ${step.lineno})`;
    if (instEl) {
      instEl.innerHTML = `<span class="qcd-badge-step">${step.gate}</span> <span class="qcd-badge-lineno">Line ${step.lineno}</span> <code>${step.code}</code>`;
    }
    if (explEl) explEl.textContent = step.explanation;

    // Highlight active line in code editor
    highlightEditorLine(step.lineno);

    // Sync Results Panel to this intermediate state
    simResult = step.sv;
    updateAmpTable(step.sv, model.numQubits);
    updateBlochPanel(step.sv, model.numQubits);

    // Sync playhead on circuit canvas
    playheadStep = currentVisStep === 0 ? -1 : currentVisStep - 1;
    renderSVG();

    termLog(`[STEP ${currentVisStep}] Line ${step.lineno}: ${step.code} -> ${step.gate}`, 'dim');
  }

  function highlightEditorLine(lineno) {
    const ta = document.getElementById('qcd-code-textarea');
    const marker = document.getElementById('qcd-active-line-marker');
    const lineNumbers = document.querySelectorAll('#qcd-line-numbers span');

    // Highlight line number
    lineNumbers.forEach((span, idx) => {
      span.classList.toggle('qcd-line-active', idx + 1 === lineno);
    });

    if (!ta || !marker) return;
    // Calculate line height
    const computed = window.getComputedStyle(ta);
    const lineHeight = parseFloat(computed.lineHeight) || 20;
    const paddingTop = parseFloat(computed.paddingTop) || 10;
    const topPos = paddingTop + (lineno - 1) * lineHeight;

    marker.style.top = topPos + 'px';
    marker.style.height = lineHeight + 'px';
    marker.classList.add('visible');

    // Scroll textarea to keep line in view
    if (topPos < ta.scrollTop || topPos > ta.scrollTop + ta.clientHeight - 40) {
      ta.scrollTop = Math.max(0, topPos - ta.clientHeight / 2);
    }
  }

  function playVisSteps() {
    visPlaying = !visPlaying;
    const btn = document.getElementById('qcd-vis-play');
    if (btn) btn.textContent = visPlaying ? '⏸ Pause' : '▶ Play';

    if (visPlaying) {
      if (currentVisStep >= visSteps.length - 1) currentVisStep = -1;
      visTimer = setInterval(() => {
        if (currentVisStep >= visSteps.length - 1) {
          clearInterval(visTimer);
          visPlaying = false;
          if (btn) btn.textContent = '▶ Play';
          return;
        }
        goToVisStep(currentVisStep + 1);
      }, 950);
    } else {
      clearInterval(visTimer);
    }
  }

  function exitVisualizeCode() {
    visualizeMode = false;
    visPlaying = false;
    clearInterval(visTimer);

    const stepperBar = document.getElementById('qcd-vis-stepper-bar');
    const visBtn = document.getElementById('qcd-code-visualize');
    const marker = document.getElementById('qcd-active-line-marker');
    const playBtn = document.getElementById('qcd-vis-play');

    if (stepperBar) stepperBar.style.display = 'none';
    if (visBtn) visBtn.classList.remove('active');
    if (marker) marker.classList.remove('visible');
    if (playBtn) playBtn.textContent = '▶ Play';

    document.querySelectorAll('#qcd-line-numbers span').forEach(s => s.classList.remove('qcd-line-active'));

    // Reset circuit view to full
    playheadStep = -1;
    runSimulation();
    renderSVG();
    setTermBadge('Ready', 'info');
    termLog('Exited step-by-step visualizer. Restored full circuit view.', 'dim');
  }

  // ══════════════════════════════════════════════════════════
  // 20.  QUBIT COUNT CONTROLS
  // ══════════════════════════════════════════════════════════
  function addQubit() {
    if (model.numQubits >= 10) return;
    pushUndo();
    model.numQubits++;
    model.numClbits = model.numQubits;
    afterModelChange(true);
  }
  function removeQubit() {
    if (model.numQubits <= 1) return;
    pushUndo();
    const q = model.numQubits - 1;
    // Remove steps involving this qubit
    model.steps = model.steps.filter(s =>
      !s.targets.includes(q) && !(s.controls && s.controls.includes(q))
    );
    model.numQubits--;
    model.numClbits = model.numQubits;
    afterModelChange(true);
  }

  // ══════════════════════════════════════════════════════════
  // 21.  PLAYHEAD
  // ══════════════════════════════════════════════════════════
  let playheadPlaying = false;
  let playheadTimer = null;

  function setPlayhead(step) {
    playheadStep = step;
    const slider = document.getElementById('qcd-playhead-slider');
    if (slider) slider.value = step;
    const counter = document.getElementById('qcd-step-counter');
    if (counter) counter.textContent = step < 0 ? 'Full' : `Step ${step+1}/${model.steps.length}`;
    runSimulation();
    renderSVG();
  }

  function playheadPlay() {
    if (model.steps.length === 0) return;
    playheadPlaying = !playheadPlaying;
    const btn = document.getElementById('qcd-play-btn');
    if (btn) btn.textContent = playheadPlaying ? '⏸' : '▶';
    if (playheadPlaying) {
      let cur = playheadStep < 0 ? 0 : playheadStep + 1;
      if (cur >= model.steps.length) cur = 0;
      setPlayhead(cur);
      playheadTimer = setInterval(() => {
        cur++;
        if (cur >= model.steps.length) { clearInterval(playheadTimer); playheadPlaying = false; if (btn) btn.textContent = '▶'; }
        else setPlayhead(cur);
      }, 700);
    } else {
      clearInterval(playheadTimer);
    }
  }

  // ══════════════════════════════════════════════════════════
  // 22.  EXPORT / IMPORT
  // ══════════════════════════════════════════════════════════
  function exportJSON() {
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'circuit.json');
  }
  function exportQASM() {
    const blob = new Blob([modelToQASM(model)], { type: 'text/plain' });
    downloadBlob(blob, 'circuit.qasm');
  }
  function exportSVG() {
    const svg = document.getElementById('qcd-svg-circuit');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    downloadBlob(blob, 'circuit.svg');
  }
  function exportPNG() {
    const svg = document.getElementById('qcd-svg-circuit');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const w = parseInt(svg.getAttribute('width')), h = parseInt(svg.getAttribute('height'));
    const img = new Image();
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * 2; canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2); ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => downloadBlob(blob, 'circuit.png'));
    };
    img.src = url;
  }
  function exportCSV() {
    if (!shotCounts) return;
    const n = model.numQubits;
    const rows = ['state,count,probability'];
    shotCounts.forEach((c, i) => {
      const prob = simResult ? cAbs2(simResult[i]).toFixed(6) : '';
      rows.push(`${toBinaryLabel(i,n)},${c},${prob}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    downloadBlob(blob, 'histogram.csv');
  }
  function importJSON() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const m = JSON.parse(ev.target.result);
          if (!m || typeof m.numQubits !== 'number' || !Array.isArray(m.steps)) throw new Error();
          // Validate steps
          for (const s of m.steps) {
            if (typeof s.gate !== 'string' || !GATE_DEFS[s.gate]) throw new Error('Unknown gate: ' + s.gate);
          }
          pushUndo(); model = m; afterModelChange(true);
        } catch (err) { showToast('Invalid JSON file: ' + err.message); }
      };
      reader.readAsText(file);
    };
    inp.click();
  }
  function importQASM() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.qasm';
    inp.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const { model: m, errors } = parseQASM(ev.target.result);
        if (errors.length) { showToast('Parse errors: ' + errors[0].msg); return; }
        pushUndo(); model = m; afterModelChange(true);
      };
      reader.readAsText(file);
    };
    inp.click();
  }
  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function copyShareLink() {
    const link = encodeShareLink();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => showToast('Share link copied!'));
    } else {
      showToast('Copy this URL: ' + link.slice(-30) + '…');
    }
  }

  // ══════════════════════════════════════════════════════════
  // 23.  TOAST
  // ══════════════════════════════════════════════════════════
  function showToast(msg) {
    const t = document.getElementById('qcd-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('visible');
    setTimeout(() => t.classList.remove('visible'), 2800);
  }

  // ══════════════════════════════════════════════════════════
  // 24.  TEMPLATE LIBRARY MODAL
  // ══════════════════════════════════════════════════════════
  function openTemplateModal() {
    const overlay = document.getElementById('qcd-template-overlay');
    const grid = document.getElementById('qcd-template-grid');
    if (!overlay || !grid) return;
    while (grid.firstChild) grid.removeChild(grid.lastChild);
    for (let ti = 0; ti < TEMPLATES.length; ti++) {
      const t = TEMPLATES[ti];
      const card = document.createElement('div');
      card.className = 'qcd-template-card';
      const name = document.createElement('div'); name.className = 'qcd-template-card__name'; name.textContent = t.name;
      const meta = document.createElement('div'); meta.className = 'qcd-template-card__meta'; meta.textContent = `${t.qubits} qubits`;
      const note = document.createElement('div'); note.className = 'qcd-template-card__note'; note.textContent = t.goal;
      card.appendChild(name); card.appendChild(meta); card.appendChild(note);
      card.addEventListener('click', () => {
        pushUndo();
        if (t.name === 'Random Circuit') {
          model = { numQubits: t.qubits, numClbits: t.clbits, steps: generateRandomCircuit(t.qubits, 5).map((s,i)=>({...s,id:i})) };
        } else {
          model = { numQubits: t.qubits, numClbits: t.clbits, steps: t.steps.map((s,i)=>({...s,id:i})) };
        }
        afterModelChange(true);
        overlay.classList.remove('visible');
      });
      grid.appendChild(card);
    }
    overlay.classList.add('visible');
  }

  // ══════════════════════════════════════════════════════════
  // 25.  FIRST-VISIT TOUR
  // ══════════════════════════════════════════════════════════
  const TOUR_STEPS = [
    { target: '#qcd-palette', title: 'Gate Palette', body: 'Drag gates onto the circuit canvas, or click a chip then click a wire slot. Search gates by name.' },
    { target: '#qcd-svg-circuit', title: 'Circuit Canvas', body: 'Wires represent qubits. Drop zones appear in each column. Double-click a parametric gate to set angles.' },
    { target: '#qcd-results', title: 'Results Panel', body: 'State vector, histogram, Bloch spheres, and metrics update live after every change.' },
    { target: '#qcd-code-area', title: 'Code Editor', body: 'Type OpenQASM or Qiskit Python — changes sync instantly to the canvas. Cirq and PennyLane are generated read-only.' },
    { target: '#qcd-toolbar', title: 'Toolbar', body: 'Undo/Redo, templates, save/load, export SVG/PNG/QASM/JSON, and share links.' },
  ];
  let tourStep = 0;
  let tourActive = false;

  function startTour() {
    tourActive = true; tourStep = 0;
    showTourStep(0);
  }
  function showTourStep(i) {
    const tip = document.getElementById('qcd-tour-tip');
    if (!tip) return;
    if (i >= TOUR_STEPS.length) { endTour(); return; }
    const step = TOUR_STEPS[i];
    tip.querySelector('.qcd-tour-tip__title').textContent = step.title;
    tip.querySelector('.qcd-tour-tip__body').textContent = step.body;
    tip.querySelector('.qcd-tour-tip__count').textContent = `${i+1} / ${TOUR_STEPS.length}`;
    tip.classList.add('visible');
    // Position near target
    const el = document.querySelector(step.target);
    if (el) {
      const r = el.getBoundingClientRect();
      tip.style.top = (r.bottom + 10) + 'px';
      tip.style.left = Math.min(r.left, window.innerWidth - 320) + 'px';
    } else {
      tip.style.top = '100px'; tip.style.left = '300px';
    }
  }
  function endTour() {
    tourActive = false;
    const tip = document.getElementById('qcd-tour-tip');
    if (tip) tip.classList.remove('visible');
    localStorage.setItem('qcd_tour_done', '1');
  }

  // ══════════════════════════════════════════════════════════
  // 26.  KEYBOARD SHORTCUTS MODAL
  // ══════════════════════════════════════════════════════════
  function openShortcutsModal() {
    const overlay = document.getElementById('qcd-shortcuts-overlay');
    if (overlay) overlay.classList.add('visible');
  }

  // ══════════════════════════════════════════════════════════
  // 27.  AFTER-MODEL-CHANGE  (hub)
  // ══════════════════════════════════════════════════════════
  function afterModelChange(syncCode) {
    autosave();
    renderSVG();
    runSimulation();
    updateStatusBar();
    updateUndoButtons();
    const slider = document.getElementById('qcd-playhead-slider');
    if (slider) { slider.max = Math.max(0, model.steps.length - 1); }
    const cnt = document.getElementById('qcd-qubit-count');
    if (cnt) cnt.textContent = model.numQubits;
    if (syncCode) syncCodeFromModel();
  }

  // ══════════════════════════════════════════════════════════
  // 28.  PALETTE SEARCH
  // ══════════════════════════════════════════════════════════
  function filterPalette(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.qcd-gate-chip').forEach(chip => {
      const name = (chip.dataset.gate || '') + (chip.querySelector('.qcd-gate-chip__name')?.textContent || '');
      chip.style.display = (!q || name.toLowerCase().includes(q)) ? '' : 'none';
    });
  }

  // ══════════════════════════════════════════════════════════
  // 29.  CLIPBOARD (cut/copy/paste)
  // ══════════════════════════════════════════════════════════
  let clipboard = null;
  function copySelected() {
    if (selectedStep === null) return;
    clipboard = JSON.parse(JSON.stringify(model.steps[selectedStep]));
    showToast('Copied gate');
  }
  function pasteGate() {
    if (!clipboard) return;
    pushUndo();
    const step = JSON.parse(JSON.stringify(clipboard));
    step.id = Date.now();
    model.steps.push(step);
    afterModelChange(true);
  }
  function cutSelected() {
    copySelected(); deleteSelected();
  }

  // ══════════════════════════════════════════════════════════
  // 30.  UNIT TESTS  (run in console: window.QuantumLabDesigner.runTests())
  // ══════════════════════════════════════════════════════════
  function runTests() {
    const results = [];
    const assert = (name, cond) => { results.push({ name, pass: cond }); if (!cond) console.warn('FAIL:', name); };

    // Bell state
    const bell = {
      numQubits: 2, numClbits: 2,
      steps: [
        { id:0, gate:'H', targets:[0], controls:[], params:{} },
        { id:1, gate:'CNOT', targets:[1], controls:[0], params:{} },
      ]
    };
    const { sv: bellSv } = simulateModel(bell);
    assert('Bell: |00⟩ amplitude = 1/√2', Math.abs(cAbs(bellSv[0]) - IS2) < 1e-9);
    assert('Bell: |11⟩ amplitude = 1/√2', Math.abs(cAbs(bellSv[3]) - IS2) < 1e-9);
    assert('Bell: |01⟩ amplitude = 0', cAbs(bellSv[1]) < 1e-9);
    assert('Bell: |10⟩ amplitude = 0', cAbs(bellSv[2]) < 1e-9);

    // GHZ state
    const ghz = {
      numQubits: 3, numClbits: 3,
      steps: [
        { id:0, gate:'H', targets:[0], controls:[], params:{} },
        { id:1, gate:'CNOT', targets:[1], controls:[0], params:{} },
        { id:2, gate:'CNOT', targets:[2], controls:[0], params:{} },
      ]
    };
    const { sv: ghzSv } = simulateModel(ghz);
    assert('GHZ: |000⟩ = 1/√2', Math.abs(cAbs(ghzSv[0]) - IS2) < 1e-9);
    assert('GHZ: |111⟩ = 1/√2', Math.abs(cAbs(ghzSv[7]) - IS2) < 1e-9);
    const ghzNorm = ghzSv.reduce((s, a) => s + cAbs2(a), 0);
    assert('GHZ: normalised', Math.abs(ghzNorm - 1) < 1e-9);

    // H·H = I
    const hh = {
      numQubits: 1, numClbits: 1,
      steps: [
        { id:0, gate:'H', targets:[0], controls:[], params:{} },
        { id:1, gate:'H', targets:[0], controls:[], params:{} },
      ]
    };
    const { sv: hhSv } = simulateModel(hh);
    assert('H·H = I: |0⟩ stays |0⟩', Math.abs(cAbs(hhSv[0]) - 1) < 1e-9);
    assert('H·H = I: |1⟩ amplitude = 0', cAbs(hhSv[1]) < 1e-9);

    // Normalisation after Rx(pi/3)
    const rx = {
      numQubits: 1, numClbits: 1,
      steps: [{ id:0, gate:'Rx', targets:[0], controls:[], params:{ theta:'pi/3' } }]
    };
    const { sv: rxSv } = simulateModel(rx);
    const rxNorm = rxSv.reduce((s, a) => s + cAbs2(a), 0);
    assert('Rx(pi/3): normalised', Math.abs(rxNorm - 1) < 1e-9);

    // Qubit order: X on q0 should give |1⟩ in index 1 (bit 0 = LSB)
    const xq0 = {
      numQubits: 2, numClbits: 2,
      steps: [{ id:0, gate:'X', targets:[0], controls:[], params:{} }]
    };
    const { sv: xSv } = simulateModel(xq0);
    assert('Qubit order: X on q0 → index 1', Math.abs(cAbs(xSv[1]) - 1) < 1e-9);

    // QASM round-trip (10 random circuits)
    let rtPassed = 0;
    for (let t = 0; t < 10; t++) {
      const rnd = { numQubits: 2, numClbits: 2, steps: generateRandomCircuit(2, 3).map((s,i)=>({...s,id:i})) };
      // Filter out parametric for simplicity
      rnd.steps = rnd.steps.filter(s => !GATE_DEFS[s.gate]?.params);
      const qasm = modelToQASM(rnd);
      const { model: rt, errors } = parseQASM(qasm);
      if (errors.length === 0 && rt.steps.length === rnd.steps.length) rtPassed++;
    }
    assert('QASM round-trip 10 random circuits', rtPassed >= 8);

    // Qiskit round-trip
    let qkPassed = 0;
    for (let t = 0; t < 10; t++) {
      const rnd = { numQubits: 2, numClbits: 2, steps: generateRandomCircuit(2, 3).map((s,i)=>({...s,id:i})) };
      rnd.steps = rnd.steps.filter(s => !GATE_DEFS[s.gate]?.params);
      const qk = modelToQiskit(rnd);
      const { model: rt, errors } = parseQiskit(qk);
      if (errors.length === 0 && rt.steps.length === rnd.steps.length) qkPassed++;
    }
    assert('Qiskit round-trip 10 random circuits', qkPassed >= 8);

    // QFT 3-qubit: state should be normalised
    const qft = { numQubits: 3, numClbits: 3, steps: TEMPLATES.find(t=>t.name.includes('QFT')).steps.map((s,i)=>({...s,id:i})) };
    const { sv: qftSv } = simulateModel(qft);
    const qftNorm = qftSv.reduce((s, a) => s + cAbs2(a), 0);
    assert('QFT 3-qubit: normalised', Math.abs(qftNorm - 1) < 1e-9);

    const passed = results.filter(r => r.pass).length;
    console.log(`%c[QuantumLabDesigner Tests] ${passed}/${results.length} passed`, passed === results.length ? 'color:#22d3ee' : 'color:#e11d48');
    results.forEach(r => console.log(`  ${r.pass ? '✅' : '❌'} ${r.name}`));
    return results;
  }

  // ══════════════════════════════════════════════════════════
  // 31.  MAIN INIT
  // ══════════════════════════════════════════════════════════
  function init() {
    // Load from URL hash first, then localStorage
    const hashModel = decodeShareLink(window.location.hash);
    if (hashModel) { model = hashModel; window.history.replaceState(null, '', window.location.pathname); }
    else autoload();
    if (!model.steps) model.steps = [];

    // Initial render
    afterModelChange(true);
    setupDragDrop();

    // ── Keyboard shortcuts ──
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) { e.preventDefault(); redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedStep !== null) { e.preventDefault(); deleteSelected(); } }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === 'c') copySelected();
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === 'v') pasteGate();
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase() === 'x') cutSelected();
      if (e.key === 'Escape') { pendingGateKey = null; document.querySelectorAll('.qcd-gate-chip').forEach(c=>c.classList.remove('active')); closePopover(); selectedStep=null; renderSVG(); }
    });

    // ── Toolbar buttons ──
    const wire = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    wire('qcd-undo', undo);
    wire('qcd-redo', redo);
    wire('qcd-add-qubit', addQubit);
    wire('qcd-remove-qubit', removeQubit);
    wire('qcd-clear', clearCircuit);
    wire('qcd-delete-gate', deleteSelected);
    wire('qcd-templates-btn', openTemplateModal);
    wire('qcd-shortcuts-btn', openShortcutsModal);
    wire('qcd-export-json', exportJSON);
    wire('qcd-export-qasm', exportQASM);
    wire('qcd-export-svg', exportSVG);
    wire('qcd-export-png', exportPNG);
    wire('qcd-export-csv', exportCSV);
    wire('qcd-import-json', importJSON);
    wire('qcd-import-qasm', importQASM);
    wire('qcd-share-link', copyShareLink);
    wire('qcd-run-shots', () => { runShots1024(); switchResultsTab('hist'); });
    wire('qcd-play-btn', playheadPlay);
    wire('qcd-step-fwd', () => { const s = Math.min(playheadStep+1, model.steps.length-1); setPlayhead(s); });
    wire('qcd-step-back', () => { const s = Math.max(playheadStep-1, -1); setPlayhead(s); });
    wire('qcd-step-reset', () => { playheadStep = -1; setPlayhead(-1); });
    wire('qcd-tour-btn', startTour);
    wire('qcd-tour-next', () => { tourStep++; showTourStep(tourStep); });
    wire('qcd-tour-skip', endTour);

    // Playhead slider
    const slider = document.getElementById('qcd-playhead-slider');
    if (slider) {
      slider.max = model.steps.length - 1;
      slider.addEventListener('input', () => setPlayhead(parseInt(slider.value)));
    }

    // Results tab switching
    document.querySelectorAll('.qcd-results-tab').forEach(tab => {
      tab.addEventListener('click', () => switchResultsTab(tab.dataset.panel));
    });

    // Code tabs
    document.querySelectorAll('.qcd-code-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchCodeTab(btn.dataset.tab));
    });

    // Code textarea
    const ta = document.getElementById('qcd-code-textarea');
    if (ta) {
      ta.addEventListener('input', onCodeInput);
      ta.addEventListener('scroll', () => {
        const lnEl = document.getElementById('qcd-line-numbers');
        if (lnEl) lnEl.scrollTop = ta.scrollTop;
      });
    }

    // Palette search
    const search = document.getElementById('qcd-palette-search');
    if (search) search.addEventListener('input', () => filterPalette(search.value));

    // Gate tooltip on hover
    document.querySelectorAll('.qcd-gate-chip').forEach(chip => {
      chip.addEventListener('mouseenter', (e) => showGateTooltip(chip.dataset.gate, e));
      chip.addEventListener('mouseleave', hideTooltip);
    });

    // Amp table sort
    document.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const k = th.dataset.sort;
        if (ampSortKey === k) ampSortDir *= -1; else { ampSortKey = k; ampSortDir = 1; }
        if (simResult) updateAmpTable(simResult, model.numQubits);
      });
    });

    // Hide-zero toggle
    const hz = document.getElementById('qcd-hide-zero');
    if (hz) hz.addEventListener('change', () => { hideZero = hz.checked; if (simResult) updateAmpTable(simResult, model.numQubits); });

    // Modal closes
    document.querySelectorAll('.qcd-modal__close, .qcd-modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          const overlay = el.closest('.qcd-modal-overlay') || el.parentElement?.querySelector('.qcd-modal-overlay') || document.querySelectorAll('.qcd-modal-overlay');
          document.querySelectorAll('.qcd-modal-overlay').forEach(o => o.classList.remove('visible'));
        }
      });
    });

    // Popover close on outside click
    document.addEventListener('click', (e) => {
      const pop = document.getElementById('qcd-popover');
      if (pop && pop.classList.contains('visible') && !pop.contains(e.target)) closePopover();
    });

    // Start tour on first visit
    if (!localStorage.getItem('qcd_tour_done')) {
      setTimeout(startTour, 1000);
    }

    console.log('%c[QuantumLabDesigner] Ready. Run window.QuantumLabDesigner.runTests() to verify.', 'color:#06b6d4;font-weight:700');
  }

  function showGateTooltip(gateKey, e) {
    const def = GATE_DEFS[gateKey];
    if (!def) return;
    const tip = document.getElementById('qcd-gate-tooltip');
    if (!tip) return;
    tip.querySelector('.qcd-tooltip__name').textContent = def.name;
    tip.querySelector('.qcd-tooltip__desc').textContent = def.desc;
    const matEl = tip.querySelector('.qcd-tooltip__matrix');
    if (def.matrix2) {
      const m = def.matrix2;
      matEl.textContent = `[${m[0].map(c=>(c.re!==0||c.im!==0)?formatC(c):'0').join(' ')}]\n[${m[1].map(c=>(c.re!==0||c.im!==0)?formatC(c):'0').join(' ')}]`;
    } else matEl.textContent = '(parametric)';
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top = (e.clientY - 10) + 'px';
    tip.classList.add('visible');
  }
  function hideTooltip() {
    const tip = document.getElementById('qcd-gate-tooltip');
    if (tip) tip.classList.remove('visible');
  }
  function formatC(c) {
    if (Math.abs(c.im) < 1e-9) return c.re.toFixed(3);
    if (Math.abs(c.re) < 1e-9) return c.im.toFixed(3) + 'i';
    return `${c.re.toFixed(2)}${c.im>=0?'+':''}${c.im.toFixed(2)}i`;
  }

  function switchResultsTab(panel) {
    document.querySelectorAll('.qcd-results-tab').forEach(t => t.classList.toggle('active', t.dataset.panel === panel));
    document.querySelectorAll('.qcd-results-panel').forEach(p => p.classList.toggle('active', p.id === 'qcd-panel-' + panel));
    if (panel === 'hist' && simResult) {
      const { sv } = simulateModel(model);
      if (!shotCounts) shotCounts = runShots(sv, 1024);
      updateHistogram(sv, shotCounts, model.numQubits);
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.QuantumLabDesigner = {
    getModel: () => JSON.parse(JSON.stringify(model)),
    loadModel: (m) => { pushUndo(); model = m; afterModelChange(true); },
    runTests,
    undo, redo,
    exportQASM: () => modelToQASM(model),
    exportQiskit: () => modelToQiskit(model),
    parseQASM,
    parseQiskit,
    simulate: () => simulateModel(model),
    runShots: (n) => { const {sv} = simulateModel(model); return runShots(sv, n); },
    TEMPLATES,
  };
})();
