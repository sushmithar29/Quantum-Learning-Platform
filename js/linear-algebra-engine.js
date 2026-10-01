/* ============================================================
   QUANTUMLAB – LINEAR ALGEBRA MATHEMATICAL ENGINE
   Dedicated scientific computation engine for Quantum Linear Algebra:
   Complex arithmetic, matrix addition, multiplication,
   Kronecker / tensor product, matrix-vector multiplication,
   conjugate transpose (dagger), unitarity verification,
   and step-by-step intermediate calculation tracing.
   ============================================================ */

window.QL = window.QL || {};

QL.LinearAlgebraEngine = (function () {
  'use strict';

  /* ------------------------------------------------------------
     1. COMPLEX NUMBER ARITHMETIC
     Represents a + bi with real and imaginary parts
     ------------------------------------------------------------ */
  class Complex {
    constructor(r = 0, i = 0) {
      this.r = Number(r) || 0;
      this.i = Number(i) || 0;
    }

    static from(val) {
      if (val instanceof Complex) return new Complex(val.r, val.i);
      if (typeof val === 'number') return new Complex(val, 0);
      if (typeof val === 'string') return Complex.parse(val);
      if (val && typeof val === 'object') return new Complex(val.r || 0, val.i || 0);
      return new Complex(0, 0);
    }

    static parse(str) {
      if (!str || typeof str !== 'string') return new Complex(0, 0);
      let s = str.trim().toLowerCase().replace(/\s+/g, '');
      if (!s) return new Complex(0, 0);

      // Special cases
      if (s === 'i' || s === '+i') return new Complex(0, 1);
      if (s === '-i') return new Complex(0, -1);
      if (s === '1/sqrt(2)' || s === '1/√2') return new Complex(1 / Math.SQRT2, 0);
      if (s === '-1/sqrt(2)' || s === '-1/√2') return new Complex(-1 / Math.SQRT2, 0);
      if (s === 'i/sqrt(2)' || s === 'i/√2') return new Complex(0, 1 / Math.SQRT2);
      if (s === '-i/sqrt(2)' || s === '-i/√2') return new Complex(0, -1 / Math.SQRT2);

      // Check pure imaginary: e.g. "3i", "-0.5i"
      const pureImgMatch = s.match(/^([+-]?\d*(?:\.\d+)?)i$/);
      if (pureImgMatch) {
        let coef = pureImgMatch[1];
        if (coef === '' || coef === '+') return new Complex(0, 1);
        if (coef === '-') return new Complex(0, -1);
        return new Complex(0, parseFloat(coef));
      }

      // Check full complex: e.g. "2+3i", "1-i", "-0.7+0.7i"
      const compMatch = s.match(/^([+-]?\d*(?:\.\d+)?)([+-]\d*(?:\.\d*)?)i$/);
      if (compMatch) {
        let rVal = parseFloat(compMatch[1]);
        let iStr = compMatch[2];
        let iVal = (iStr === '+' || iStr === '') ? 1 : (iStr === '-' ? -1 : parseFloat(iStr));
        return new Complex(rVal, iVal);
      }

      // Pure real
      let rVal = parseFloat(s);
      return new Complex(isNaN(rVal) ? 0 : rVal, 0);
    }

    add(other) {
      const o = Complex.from(other);
      return new Complex(this.r + o.r, this.i + o.i);
    }

    sub(other) {
      const o = Complex.from(other);
      return new Complex(this.r - o.r, this.i - o.i);
    }

    mul(other) {
      const o = Complex.from(other);
      // (a + bi)(c + di) = (ac - bd) + (ad + bc)i
      return new Complex(
        this.r * o.r - this.i * o.i,
        this.r * o.i + this.i * o.r
      );
    }

    conjugate() {
      return new Complex(this.r, -this.i);
    }

    magnitudeSq() {
      return this.r * this.r + this.i * this.i;
    }

    magnitude() {
      return Math.sqrt(this.magnitudeSq());
    }

    isZero(eps = 1e-6) {
      return Math.abs(this.r) < eps && Math.abs(this.i) < eps;
    }

    equals(other, eps = 1e-5) {
      const o = Complex.from(other);
      return Math.abs(this.r - o.r) < eps && Math.abs(this.i - o.i) < eps;
    }

    format(precision = 3) {
      const eps = 1e-4;
      const rZero = Math.abs(this.r) < eps;
      const iZero = Math.abs(this.i) < eps;

      if (rZero && iZero) return '0';

      const fmtNum = (n) => {
        let fixed = Number(n.toFixed(precision));
        // Check standard quantum fractions: 1/√2 ≈ 0.7071
        if (Math.abs(Math.abs(fixed) - 0.707) < 0.005) {
          return fixed < 0 ? '-1/√2' : '1/√2';
        }
        if (Math.abs(Math.abs(fixed) - 0.5) < 0.005) {
          return fixed < 0 ? '-1/2' : '1/2';
        }
        return fixed.toString();
      };

      if (iZero) return fmtNum(this.r);

      if (rZero) {
        if (Math.abs(this.i - 1) < eps) return 'i';
        if (Math.abs(this.i + 1) < eps) return '-i';
        return `${fmtNum(this.i)}i`;
      }

      const sign = this.i >= 0 ? '+' : '-';
      const absI = Math.abs(this.i);
      const iTerm = Math.abs(absI - 1) < eps ? 'i' : `${fmtNum(absI)}i`;
      return `${fmtNum(this.r)} ${sign} ${iTerm}`;
    }
  }

  /* ------------------------------------------------------------
     2. MATRIX HELPER FUNCTIONS
     ------------------------------------------------------------ */
  function createMatrix(rows, cols, fillVal = 0) {
    const mat = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(Complex.from(fillVal));
      }
      mat.push(row);
    }
    return mat;
  }

  function cloneMatrix(mat) {
    return mat.map(row => row.map(cell => Complex.from(cell)));
  }

  function parseMatrixFromInput(gridData) {
    // gridData is a 2D array of strings or numbers
    return gridData.map(row => row.map(val => Complex.from(val)));
  }

  /* ------------------------------------------------------------
     3. QUANTUM GATE / MATRIX PRESETS
     ------------------------------------------------------------ */
  const PRESETS = {
    identity: {
      name: 'Identity (I)',
      desc: 'Leaves the quantum state completely unchanged. No phase or amplitude shift.',
      matrix: [
        [new Complex(1, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(1, 0)]
      ]
    },
    pauliX: {
      name: 'Pauli-X (NOT / Bit Flip)',
      desc: 'Flips |0⟩ to |1⟩ and |1⟩ to |0⟩. Acts like a classical NOT gate in quantum basis.',
      matrix: [
        [new Complex(0, 0), new Complex(1, 0)],
        [new Complex(1, 0), new Complex(0, 0)]
      ]
    },
    pauliY: {
      name: 'Pauli-Y (Bit & Phase Flip)',
      desc: 'Rotates state with relative complex phase shift. Maps |0⟩ to i|1⟩ and |1⟩ to -i|0⟩.',
      matrix: [
        [new Complex(0, 0), new Complex(0, -1)],
        [new Complex(0, 1), new Complex(0, 0)]
      ]
    },
    pauliZ: {
      name: 'Pauli-Z (Phase Flip)',
      desc: 'Leaves |0⟩ unchanged and inverts the sign of |1⟩ to -|1⟩. Critical for interference.',
      matrix: [
        [new Complex(1, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(-1, 0)]
      ]
    },
    hadamard: {
      name: 'Hadamard (H)',
      desc: 'Transforms computational basis states into balanced superposition states |+⟩ and |-⟩.',
      matrix: [
        [new Complex(1 / Math.SQRT2, 0), new Complex(1 / Math.SQRT2, 0)],
        [new Complex(1 / Math.SQRT2, 0), new Complex(-1 / Math.SQRT2, 0)]
      ]
    },
    phaseS: {
      name: 'Phase Gate (S)',
      desc: 'Adds a π/2 (90°) relative phase shift: maps |1⟩ to i|1⟩.',
      matrix: [
        [new Complex(1, 0), new Complex(0, 0)],
        [new Complex(0, 0), new Complex(0, 1)]
      ]
    }
  };

  const VECTOR_PRESETS = {
    ket0: {
      name: '|0⟩ (Ground / Computational 0)',
      desc: 'Deterministic quantum state with 100% probability of measuring 0.',
      vector: [new Complex(1, 0), new Complex(0, 0)]
    },
    ket1: {
      name: '|1⟩ (Excited / Computational 1)',
      desc: 'Deterministic quantum state with 100% probability of measuring 1.',
      vector: [new Complex(0, 0), new Complex(1, 0)]
    },
    ketPlus: {
      name: '|+⟩ (Equal Superposition)',
      desc: '(|0⟩ + |1⟩)/√2. Measuring in Z-basis gives 50% probability of 0 and 50% of 1.',
      vector: [new Complex(1 / Math.SQRT2, 0), new Complex(1 / Math.SQRT2, 0)]
    },
    ketMinus: {
      name: '|-⟩ (Opposite Superposition)',
      desc: '(|0⟩ - |1⟩)/√2. Equal amplitude with a 180° relative phase shift.',
      vector: [new Complex(1 / Math.SQRT2, 0), new Complex(-1 / Math.SQRT2, 0)]
    }
  };

  /* ------------------------------------------------------------
     4. LINEAR ALGEBRA OPERATIONS
     ------------------------------------------------------------ */

  // Matrix Addition: A + B
  function addMatrices(matA, matB) {
    const rows = matA.length;
    const cols = matA[0].length;
    if (matB.length !== rows || matB[0].length !== cols) {
      throw new Error(`Dimension mismatch: Cannot add ${rows}x${cols} and ${matB.length}x${matB[0].length} matrices.`);
    }

    const result = createMatrix(rows, cols);
    const steps = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = Complex.from(matA[r][c]);
        const b = Complex.from(matB[r][c]);
        const sum = a.add(b);
        result[r][c] = sum;
        steps.push({
          row: r,
          col: c,
          aStr: a.format(),
          bStr: b.format(),
          resStr: sum.format(),
          formula: `${a.format()} + ${b.format()} = ${sum.format()}`
        });
      }
    }

    return { result, steps };
  }

  // Matrix Multiplication: A * B
  function multiplyMatrices(matA, matB) {
    const rowsA = matA.length;
    const colsA = matA[0].length;
    const rowsB = matB.length;
    const colsB = matB[0].length;

    if (colsA !== rowsB) {
      throw new Error(`Incompatible dimensions: Matrix A has ${colsA} columns, but Matrix B has ${rowsB} rows.`);
    }

    const result = createMatrix(rowsA, colsB);
    const steps = [];

    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        let sum = new Complex(0, 0);
        const terms = [];

        for (let k = 0; k < colsA; k++) {
          const a = Complex.from(matA[i][k]);
          const b = Complex.from(matB[k][j]);
          const prod = a.mul(b);
          sum = sum.add(prod);
          terms.push(`(${a.format()} × ${b.format()})`);
        }

        result[i][j] = sum;
        steps.push({
          row: i,
          col: j,
          rowAIndex: i,
          colBIndex: j,
          termsStr: terms.join(' + '),
          resStr: sum.format(),
          formula: `Cell [${i+1},${j+1}]: ${terms.join(' + ')} = ${sum.format()}`
        });
      }
    }

    return { result, steps };
  }

  // Tensor / Kronecker Product: A ⊗ B
  function tensorProduct(matA, matB) {
    const rowsA = matA.length;
    const colsA = matA[0].length;
    const rowsB = matB.length;
    const colsB = matB[0].length;

    const outRows = rowsA * rowsB;
    const outCols = colsA * colsB;
    const result = createMatrix(outRows, outCols);
    const blocks = [];
    const steps = [];

    for (let rA = 0; rA < rowsA; rA++) {
      for (let cA = 0; cA < colsA; cA++) {
        const aVal = Complex.from(matA[rA][cA]);
        const blockCells = [];

        for (let rB = 0; rB < rowsB; rB++) {
          for (let cB = 0; cB < colsB; cB++) {
            const bVal = Complex.from(matB[rB][cB]);
            const prod = aVal.mul(bVal);
            const targetR = rA * rowsB + rB;
            const targetC = cA * colsB + cB;
            result[targetR][targetC] = prod;

            blockCells.push({
              rB, cB, targetR, targetC,
              formula: `${aVal.format()} × ${bVal.format()} = ${prod.format()}`,
              val: prod.format()
            });

            steps.push({
              blockR: rA,
              blockC: cA,
              targetR,
              targetC,
              aStr: aVal.format(),
              bStr: bVal.format(),
              resStr: prod.format()
            });
          }
        }

        blocks.push({
          rA,
          cA,
          scalar: aVal.format(),
          cells: blockCells
        });
      }
    }

    return { result, blocks, steps, outRows, outCols };
  }

  // Matrix-Vector Multiplication: A |ψ⟩
  function matrixVectorMultiply(matA, vec) {
    const rowsA = matA.length;
    const colsA = matA[0].length;
    if (vec.length !== colsA) {
      throw new Error(`Incompatible dimensions: Matrix has ${colsA} columns, but state vector has ${vec.length} components.`);
    }

    const result = [];
    const steps = [];

    for (let i = 0; i < rowsA; i++) {
      let sum = new Complex(0, 0);
      const terms = [];

      for (let j = 0; j < colsA; j++) {
        const a = Complex.from(matA[i][j]);
        const v = Complex.from(vec[j]);
        const prod = a.mul(v);
        sum = sum.add(prod);
        terms.push(`(${a.format()} × ${v.format()})`);
      }

      result.push(sum);
      steps.push({
        row: i,
        termsStr: terms.join(' + '),
        resStr: sum.format(),
        formula: `Row ${i+1}: ${terms.join(' + ')} = ${sum.format()}`
      });
    }

    // Check normalization of resulting vector: sum(|c_i|^2)
    let normSq = 0;
    result.forEach(c => { normSq += c.magnitudeSq(); });
    const isNormalized = Math.abs(normSq - 1.0) < 1e-4;

    return { result, steps, normSq, isNormalized };
  }

  // Conjugate Transpose: U†
  function conjugateTranspose(mat) {
    const rows = mat.length;
    const cols = mat[0].length;
    const dagger = createMatrix(cols, rows);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = Complex.from(mat[r][c]);
        dagger[c][r] = val.conjugate();
      }
    }
    return dagger;
  }

  // Check Unitary: U† * U == I
  function checkUnitary(matU) {
    const rows = matU.length;
    const cols = matU[0].length;
    if (rows !== cols) {
      return {
        isUnitary: false,
        reason: 'A unitary quantum gate must be a square matrix.',
        uDagger: null,
        product: null
      };
    }

    const uDagger = conjugateTranspose(matU);
    const { result: product, steps } = multiplyMatrices(uDagger, matU);

    let isUnitary = true;
    const eps = 1e-4;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = product[r][c];
        const expected = (r === c) ? 1.0 : 0.0;
        if (Math.abs(val.r - expected) > eps || Math.abs(val.i) > eps) {
          isUnitary = false;
        }
      }
    }

    let reason = isUnitary
      ? 'U†U = I. The matrix preserves probability norms (⟨ψ|ψ⟩ = 1) and reversible quantum evolution.'
      : 'U†U ≠ I. The transformation violates unitarity, meaning total probability is not conserved.';

    return {
      isUnitary,
      reason,
      uDagger,
      product,
      steps
    };
  }

  /* ------------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------------ */
  return {
    Complex,
    PRESETS,
    VECTOR_PRESETS,
    createMatrix,
    cloneMatrix,
    parseMatrixFromInput,
    addMatrices,
    multiplyMatrices,
    tensorProduct,
    matrixVectorMultiply,
    conjugateTranspose,
    checkUnitary
  };
})();
