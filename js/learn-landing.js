/* ============================================================
   QUANTUMLAB – LEARN LANDING PAGE & CONCEPT PREVIEWS
   Manages interactive concept card previews for the 7 core
   quantum learning modules:
   01: Quantum Linear Algebra (Matrix & Vector)
   02: Qubits (|0⟩ ↔ |1⟩)
   03: Superposition (|0⟩ + |1⟩)
   04: Bra-Ket Notation (|ψ⟩, ⟨ψ|)
   05: Entanglement (Bell correlated pairs)
   06: Bloch Sphere (Geometric 3D state)
   07: Quantum Measurement (Born rule collapse)
   ============================================================ */

window.QL = window.QL || {};

QL.LearnLanding = (function () {
  'use strict';

  function init() {
    initCard01Canvas();
    initCard02Canvas();
    initCard03Canvas();
    initCard04Canvas();
    initCard05Canvas();
    initCard06Canvas();
    initCard07Canvas();
  }

  /* ------------------------------------------------------------
     CARD 01: LINEAR ALGEBRA PREVIEW (Matrix × Vector → State)
     ------------------------------------------------------------ */
  function initCard01Canvas() {
    const canvas = document.getElementById('preview-canvas-01');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      t += 0.03;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const cx = w * 0.45;
      const cy = h * 0.5;

      // Draw Matrix Box [ H ]
      const pulse = Math.sin(t) * 0.15 + 0.85;
      ctx.save();
      ctx.translate(cx - 90, cy);

      // Matrix Brackets
      ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
      ctx.lineWidth = 2.5;
      // Left bracket
      ctx.beginPath();
      ctx.moveTo(-45, -35); ctx.lineTo(-55, -35); ctx.lineTo(-55, 35); ctx.lineTo(-45, 35);
      ctx.stroke();
      // Right bracket
      ctx.beginPath();
      ctx.moveTo(45, -35); ctx.lineTo(55, -35); ctx.lineTo(55, 35); ctx.lineTo(45, 35);
      ctx.stroke();

      // Matrix Elements
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f0f4ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1/√2', -22, -16);
      ctx.fillText('1/√2', 22, -16);
      ctx.fillText('1/√2', -22, 16);
      ctx.fillText('-1/√2', 22, 16);

      // Label below
      ctx.font = '700 9px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.fillText('GATE MATRIX U', 0, 48);
      ctx.restore();

      // Multiplication Dot
      ctx.font = '700 16px "Inter", sans-serif';
      ctx.fillStyle = 'var(--learn-cyan, #06b6d4)';
      ctx.textAlign = 'center';
      ctx.fillText('×', cx - 18, cy);

      // Vector Box [ |0⟩ ]
      ctx.save();
      ctx.translate(cx + 40, cy);
      ctx.strokeStyle = `rgba(167, 139, 250, ${pulse})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-18, -35); ctx.lineTo(-26, -35); ctx.lineTo(-26, 35); ctx.lineTo(-18, 35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(18, -35); ctx.lineTo(26, -35); ctx.lineTo(26, 35); ctx.lineTo(18, 35);
      ctx.stroke();

      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#a78bfa';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1', 0, -16);
      ctx.fillText('0', 0, 16);

      ctx.font = '700 9px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(167, 139, 250, 0.7)';
      ctx.fillText('STATE |ψ⟩', 0, 48);
      ctx.restore();

      // Arrow
      ctx.font = '700 18px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('→', cx + 90, cy);

      // Transformed State Result |+⟩
      ctx.save();
      ctx.translate(cx + 140, cy);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('|+⟩', 0, 0);

      ctx.font = '700 9px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(52, 211, 153, 0.8)';
      ctx.fillText('NEW STATE |ψ\'⟩', 0, 48);
      ctx.restore();

      // Flowing energy particle along arrow
      const flowProgress = (t * 0.4) % 1;
      const partX = (cx + 40) + flowProgress * 100;
      ctx.beginPath();
      ctx.arc(partX, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------
     CARD 02: QUBITS PREVIEW (|0⟩ ↔ |1⟩ Flip)
     ------------------------------------------------------------ */
  function initCard02Canvas() {
    const canvas = document.getElementById('preview-canvas-02');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      t += 0.025;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;

      // Draw bit level indicators
      const flipPhase = Math.sin(t);
      const isOne = flipPhase > 0;
      const p1 = (flipPhase + 1) / 2; // 0 to 1

      // Track arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing active arc
      ctx.strokeStyle = isOne ? '#a855f7' : '#06b6d4';
      ctx.lineWidth = 4;
      ctx.shadowColor = isOne ? '#a855f7' : '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 40, -Math.PI / 2, -Math.PI / 2 + p1 * Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Ket text in center
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isOne ? '|1⟩' : '|0⟩', cx, cy);

      // Probabilities
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`P(|0⟩): ${((1 - p1) * 100).toFixed(0)}%   P(|1⟩): ${(p1 * 100).toFixed(0)}%`, cx, cy + 55);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------
     CARD 03: SUPERPOSITION PREVIEW (|0⟩ + |1⟩ Wave Interference)
     ------------------------------------------------------------ */
  function initCard03Canvas() {
    const canvas = document.getElementById('preview-canvas-03');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      t += 0.035;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cy = h * 0.5;

      // Draw two interfering sine waves
      ctx.lineWidth = 2;

      // Wave 1: |0⟩
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = cy + Math.sin(x * 0.05 + t) * 18;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Wave 2: |1⟩
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = cy + Math.sin(x * 0.05 - t) * 18;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Sum Wave (Superposition |+⟩)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y1 = Math.sin(x * 0.05 + t) * 14;
        const y2 = Math.sin(x * 0.05 - t) * 14;
        const y = cy + (y1 + y2) * 0.8;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Formula badge
      ctx.fillStyle = 'rgba(10, 16, 34, 0.8)';
      ctx.fillRect(w * 0.5 - 75, h - 34, 150, 22);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(w * 0.5 - 75, h - 34, 150, 22);

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('|ψ⟩ = α|0⟩ + β|1⟩', w * 0.5, h - 23);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------
     CARD 04: BRA-KET NOTATION (|ψ⟩, ⟨ψ|, ⟨φ|ψ⟩)
     ------------------------------------------------------------ */
  function initCard04Canvas() {
    const canvas = document.getElementById('preview-canvas-04');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      t += 0.03;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5 - 10;

      const glow = Math.sin(t) * 0.2 + 0.8;

      // Ket |ψ⟩ (Column vector representation)
      ctx.save();
      ctx.translate(cx - 65, cy);
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText('|ψ⟩', 0, -8);
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('Ket (Column)', 0, 14);
      ctx.restore();

      // Dot inner product symbol
      ctx.font = '700 18px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('·', cx, cy - 8);

      // Bra ⟨φ| (Row vector representation)
      ctx.save();
      ctx.translate(cx + 65, cy);
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillStyle = '#c084fc';
      ctx.textAlign = 'center';
      ctx.fillText('⟨φ|', 0, -8);
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('Bra (Row)', 0, 14);
      ctx.restore();

      // Inner Product result below
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(52, 211, 153, ${glow})`;
      ctx.textAlign = 'center';
      ctx.fillText('⟨φ|ψ⟩ = ∑ cᵢ* dᵢ', cx, h - 22);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------
     CARD 05: ENTANGLEMENT PREVIEW (Correlated Two-Qubit Pair)
     ------------------------------------------------------------ */
  function initCard05Canvas() {
    const canvas = document.getElementById('preview-canvas-05');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      t += 0.04;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cy = h * 0.5;
      const q1X = w * 0.28;
      const q2X = w * 0.72;

      // Connecting Entanglement Beam with waves
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.beginPath();
      for (let x = q1X; x <= q2X; x += 3) {
        const wave = Math.sin((x - q1X) * 0.08 - t * 2) * 8;
        if (x === q1X) ctx.moveTo(x, cy + wave);
        else ctx.lineTo(x, cy + wave);
      }
      ctx.stroke();

      // Qubit A
      ctx.fillStyle = '#7c3aed';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(q1X, cy, 18, 0, Math.PI * 2);
      ctx.fill();

      // Qubit B
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.arc(q2X, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Qubit labels
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('q₀', q1X, cy);
      ctx.fillText('q₁', q2X, cy);

      // Bell state formula
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('|Φ⁺⟩ = (|00⟩ + |11⟩)/√2', w * 0.5, h - 18);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------
     CARD 06: BLOCH SPHERE PREVIEW (Geometric 3D representation)
     ------------------------------------------------------------ */
  function initCard06Canvas() {
    const canvas = document.getElementById('preview-canvas-06');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      t += 0.025;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5 - 6;
      const r = 44;

      // Outer Sphere Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Equator Ellipse
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Z Axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r - 8); ctx.lineTo(cx, cy + r + 8);
      ctx.stroke();

      // State Vector Arrow (Precessing around sphere)
      const theta = 0.8;
      const phi = t;
      const vx = cx + r * Math.sin(theta) * Math.cos(phi);
      const vy = cy - r * Math.cos(theta) + r * 0.25 * Math.sin(theta) * Math.sin(phi);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(vx, vy);
      ctx.stroke();

      // Arrow tip dot
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(vx, vy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pole labels
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('|0⟩', cx, cy - r - 12);
      ctx.fillText('|1⟩', cx, cy + r + 18);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------
     CARD 07: MEASUREMENT PREVIEW (State Collapse & Detector)
     ------------------------------------------------------------ */
  function initCard07Canvas() {
    const canvas = document.getElementById('preview-canvas-07');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    function draw() {
      t += 0.03;
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cy = h * 0.5;
      const cx = w * 0.5;

      // Incoming state wave
      const phase = (t * 60) % w;

      // Meter / Detector icon in center
      ctx.fillStyle = 'rgba(16, 26, 52, 0.9)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 28, cy - 24, 56, 48, 8);
      ctx.fill();
      ctx.stroke();

      // Measurement arc inside meter
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy + 12, 20, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Meter needle oscillating/collapsing
      const needleAngle = Math.PI * 1.5 + Math.sin(t * 3) * 0.4;
      const nx = cx + Math.cos(needleAngle) * 18;
      const ny = (cy + 12) + Math.sin(needleAngle) * 18;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 12);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      // Collapsed outcome text
      const outcome = Math.sin(t) > 0 ? 'Outcome: 0' : 'Outcome: 1';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'center';
      ctx.fillText(outcome, cx, h - 16);

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  return {
    init
  };
})();
