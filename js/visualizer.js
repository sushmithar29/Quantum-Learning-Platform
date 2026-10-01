/* ============================================================
   QUANTUMLAB – VISUALIZER ENGINE
   All 6 interactive panels:
   1. Wave Function   2. Circuit States  3. Entanglement
   4. Interference    5. Qubit Ensemble  6. QFT
   ============================================================ */

'use strict';

/* ── NAV SCROLL ── */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn) menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
});

/* ══════════════════════════════════════════════════════════════
   TAB SWITCHING
══════════════════════════════════════════════════════════════ */
const tabs = document.querySelectorAll('.viz-tab');
const panels = document.querySelectorAll('.viz-panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.panel;
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected','true');
    const panel = document.getElementById('panel-' + target);
    if (panel) panel.classList.add('active');
    // re-draw canvases on tab activation
    if (target === 'interference') setTimeout(drawInterferencePattern, 100);
    if (target === 'fourier') setTimeout(() => { generateSignal(); runQFT(); }, 100);
    if (target === 'circuit') setTimeout(updateStateVector, 100);
    if (target === 'ensemble') { ensembleInit(); setTimeout(() => { if (ensembleBloch3D) ensembleBloch3D.resize(); }, 80); ensembleAnimate(); }
    if (target === 'entangle') {
      if (typeof window.resizeEntangleBloch === 'function') window.resizeEntangleBloch();
      if (typeof window.drawEntangleLink === 'function') window.drawEntangleLink();
    }
    if (target === 'code') setTimeout(() => { if (typeof window.refreshCodeEditor === 'function') window.refreshCodeEditor(); }, 80);
  });
});

/* ══════════════════════════════════════════════════════════════
   HERO CANVAS — Particle field
══════════════════════════════════════════════════════════════ */
(function heroCanvas() {
  const canvas = document.getElementById('viz-hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const n = Math.floor(W * H / 8000);
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        hue: Math.random() > 0.5 ? 265 : 195,
        alpha: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0,0,W,H);
    t += 0.006;
    particles.forEach(p => {
      p.x += p.vx + Math.sin(t + p.phase) * 0.15;
      p.y += p.vy + Math.cos(t + p.phase) * 0.15;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const a = p.alpha * (0.7 + 0.3 * Math.sin(t * 2 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue},80%,65%,${a})`;
      ctx.fill();
    });
    // Wave lines
    ctx.lineWidth = 1;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.globalAlpha = 0.08 + j * 0.04;
      const amp = 30 + j * 15;
      const freq = 0.006 + j * 0.003;
      for (let x = 0; x <= W; x += 2) {
        const y = H * 0.5 + amp * Math.sin(x * freq + t + j);
        x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.strokeStyle = j === 0 ? '#7c3aed' : j === 1 ? '#06b6d4' : '#9d5af7';
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();

/* ══════════════════════════════════════════════════════════════
   PANEL 1 — WAVE FUNCTION VISUALIZER
══════════════════════════════════════════════════════════════ */
(function WavePanel() {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  let animating = true;
  let t = 0;
  let raf;

  let params = { type: 'gaussian', energy: 2, k: 3, sigma: 0.15, speed: 1 };
  let x0 = 0.3; // center of gaussian
  let measured = false;
  let measureX = 0;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight || 360;
    canvas.height = H;
  }

  function gaussian(x) {
    const dx = x - x0;
    return Math.exp(-dx*dx / (2 * params.sigma * params.sigma));
  }

  function compute(x) {
    const { type, energy, k } = params;
    let re = 0, im = 0;
    switch(type) {
      case 'gaussian': {
        const env = gaussian(x);
        re = env * Math.cos(k * x * 20 - t);
        im = env * Math.sin(k * x * 20 - t);
        break;
      }
      case 'plane': {
        re = Math.cos(k * x * 20 - t) * 0.6;
        im = Math.sin(k * x * 20 - t) * 0.6;
        break;
      }
      case 'superposition': {
        re = 0.5 * Math.cos(k * x * 20 - t) + 0.5 * Math.cos(energy * x * 18 - t * 1.3);
        im = 0.5 * Math.sin(k * x * 20 - t) + 0.5 * Math.sin(energy * x * 18 - t * 1.3);
        break;
      }
      case 'well': {
        re = Math.sin(energy * Math.PI * x) * Math.cos(t * energy * 0.4);
        im = Math.sin(energy * Math.PI * x) * Math.sin(t * energy * 0.4);
        break;
      }
    }
    return { re, im, prob: re*re + im*im };
  }

  function draw() {
    resize();
    ctx.clearRect(0,0,W,H);

    // Background glow
    const grd = ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,'rgba(5,8,18,0)');
    grd.addColorStop(0.5,'rgba(124,58,237,0.03)');
    grd.addColorStop(1,'rgba(5,8,18,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,W,H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let gy = 0; gy <= 4; gy++) {
      const y = H * gy / 4;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }

    // Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

    const N = W;
    const amp = H * 0.28;

    if (measured) {
      // Collapsed wave — delta at measureX
      const mx = measureX * W;
      const sigC = 0.02;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = i / N;
        const dx = x - measureX;
        const y = H/2 - amp * 1.2 * Math.exp(-dx*dx/(2*sigC*sigC));
        i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
      }
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(245,158,11,0.1)';
      ctx.lineTo(N, H/2); ctx.lineTo(0, H/2); ctx.fill();
      // Collapse flash
      ctx.beginPath();
      ctx.arc(mx, H/2 - amp * 1.2, 6, 0, Math.PI*2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      return;
    }

    // Real part
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = i / N;
      const { re } = compute(x);
      const py = H/2 - re * amp;
      i === 0 ? ctx.moveTo(i, py) : ctx.lineTo(i, py);
    }
    ctx.strokeStyle = 'rgba(124,58,237,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Imaginary part
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = i / N;
      const { im } = compute(x);
      const py = H/2 - im * amp;
      i === 0 ? ctx.moveTo(i, py) : ctx.lineTo(i, py);
    }
    ctx.strokeStyle = 'rgba(6,182,212,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Probability density (filled)
    ctx.beginPath();
    ctx.moveTo(0, H/2);
    for (let i = 0; i < N; i++) {
      const x = i / N;
      const { prob } = compute(x);
      const py = H/2 - prob * amp * 1.2;
      ctx.lineTo(i, py);
    }
    ctx.lineTo(N, H/2);
    ctx.closePath();
    const grd2 = ctx.createLinearGradient(0, H/2 - amp, 0, H/2);
    grd2.addColorStop(0, 'rgba(245,158,11,0.4)');
    grd2.addColorStop(1, 'rgba(245,158,11,0)');
    ctx.fillStyle = grd2;
    ctx.fill();
    // Outline
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = i / N;
      const { prob } = compute(x);
      const py = H/2 - prob * amp * 1.2;
      i === 0 ? ctx.moveTo(i, py) : ctx.lineTo(i, py);
    }
    ctx.strokeStyle = 'rgba(245,158,11,0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Update stats
    const sigma = params.sigma;
    document.getElementById('wave-stat-pos').textContent = x0.toFixed(2);
    document.getElementById('wave-stat-mom').textContent = params.k.toFixed(2);
    document.getElementById('wave-stat-dx').textContent = sigma.toFixed(3);
    document.getElementById('wave-stat-dp').textContent = (0.5 / sigma).toFixed(3);
    document.getElementById('wave-hup').textContent = `\u0394x\u00B7\u0394p = ${(sigma * 0.5 / sigma).toFixed(3)} \u2265 \u0127/2 = 0.500`;

    if (params.type === 'gaussian') {
      x0 += 0.0004 * params.speed * params.k;
      if (x0 > 1.1) x0 = -0.1;
    }
  }

  function loop() {
    if (!animating) return;
    t += 0.04 * params.speed;
    draw();
    raf = requestAnimationFrame(loop);
  }

  // Controls
  function wireSlider(id, valId, key, fmt) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      params[key] = parseFloat(el.value);
      if (valId) document.getElementById(valId).textContent = fmt(params[key]);
    });
  }

  wireSlider('wave-energy', 'wave-energy-val', 'energy', v => `n = ${v}`);
  wireSlider('wave-k', 'wave-k-val', 'k', v => `k = ${v.toFixed(1)}`);
  wireSlider('wave-sigma', 'wave-sigma-val', 'sigma', v => `\u03C3 = ${v.toFixed(2)}`);
  wireSlider('wave-speed', 'wave-speed-val', 'speed', v => `${v.toFixed(1)}\u00D7`);

  document.querySelectorAll('#wave-type-group .viz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#wave-type-group .viz-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      params.type = btn.dataset.type;
      measured = false;
      x0 = 0.3;
    });
  });

  const playBtn = document.getElementById('wave-play-btn');
  const playLabel = document.getElementById('wave-play-label');
  if (playBtn) playBtn.addEventListener('click', () => {
    animating = !animating;
    playLabel.textContent = animating ? 'Pause' : 'Play';
    if (animating) loop();
  });

  const resetBtn = document.getElementById('wave-reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    t = 0; x0 = 0.3; measured = false; animating = true;
    playLabel.textContent = 'Pause';
    loop();
  });

  const measureBtn = document.getElementById('wave-measure-btn');
  if (measureBtn) measureBtn.addEventListener('click', () => {
    // Collapse to probabilistic position
    animating = false;
    playLabel.textContent = 'Play';
    const vals = [];
    for (let i = 0; i < 500; i++) {
      const x = i / 500;
      const { prob } = compute(x);
      vals.push(prob);
    }
    const total = vals.reduce((a,b) => a+b, 0);
    let rand = Math.random() * total, cum = 0;
    measureX = 0.5;
    for (let i = 0; i < vals.length; i++) {
      cum += vals[i];
      if (cum >= rand) { measureX = i / vals.length; break; }
    }
    measured = true;
    cancelAnimationFrame(raf);
    draw();
  });

  loop();
})();

/* ══════════════════════════════════════════════════════════════
   PANEL 2 — CIRCUIT STATE VISUALIZER
══════════════════════════════════════════════════════════════ */
(function CircuitPanel() {
  // State
  const initStates = [0, 0, 0]; // 0=|0>, 1=|1>, 2=|+>
  const circuit = [[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]];
  let stepIndex = -1;

  // Complex math helpers
  function add(a, b) { return [a[0]+b[0], a[1]+b[1]]; }
  function scale(a, s) { return [a[0]*s, a[1]*s]; }
  function mul(a, b) { return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; }
  const r2 = 1/Math.sqrt(2);

  // Gate matrices (2x2 complex, row-major)
  const GATES = {
    H: [[r2,0],[r2,0],[r2,0],[-r2,0]],
    X: [[0,0],[1,0],[1,0],[0,0]],
    Y: [[0,0],[0,-1],[0,1],[0,0]],
    Z: [[1,0],[0,0],[0,0],[-1,0]],
    S: [[1,0],[0,0],[0,0],[0,1]],
    T: [[1,0],[0,0],[0,0],[r2,r2]]
  };

  function applyGate(state, gateKey, qubitIdx, nQubits) {
    const G = GATES[gateKey];
    if (!G) return state;
    const dim = 1 << nQubits;
    const out = Array(dim).fill(null).map(() => [0,0]);
    for (let i = 0; i < dim; i++) {
      const bit = (i >> (nQubits - 1 - qubitIdx)) & 1;
      for (let b = 0; b < 2; b++) {
        const Gel = G[bit * 2 + b];
        const jBit = (i & ~(1 << (nQubits - 1 - qubitIdx))) | (b << (nQubits - 1 - qubitIdx));
        out[i] = add(out[i], mul(Gel, state[jBit]));
      }
    }
    return out;
  }

  function applyCNOT(state, ctrl, tgt, nQubits) {
    const dim = 1 << nQubits;
    const out = state.map(a => [...a]);
    for (let i = 0; i < dim; i++) {
      const cBit = (i >> (nQubits - 1 - ctrl)) & 1;
      if (cBit === 1) {
        const j = i ^ (1 << (nQubits - 1 - tgt));
        [out[i], out[j]] = [state[j].slice(), state[i].slice()];
      }
    }
    return out;
  }

  function initState() {
    const states = initStates.map(s => {
      if (s === 0) return [[1,0],[0,0]];
      if (s === 1) return [[0,0],[1,0]];
      return [[r2,0],[r2,0]]; // |+>
    });
    const dim = 8;
    let sv = Array(dim).fill(null).map(() => [0,0]);
    for (let i = 0; i < dim; i++) {
      const b0 = (i >> 2) & 1, b1 = (i >> 1) & 1, b2 = i & 1;
      sv[i] = mul(mul(states[0][b0], states[1][b1]), states[2][b2]);
    }
    return sv;
  }

  function runCircuit(upToSlot) {
    let sv = initState();
    for (let slot = 0; slot <= upToSlot; slot++) {
      for (let wire = 0; wire < 3; wire++) {
        const g = circuit[wire][slot];
        if (!g) continue;
        if (g === 'CNOT') {
          const ctrl = wire, tgt = wire + 1 < 3 ? wire + 1 : wire - 1;
          sv = applyCNOT(sv, ctrl, tgt, 3);
        } else {
          sv = applyGate(sv, g, wire, 3);
        }
      }
    }
    return sv;
  }

  function updateStateVector(sv) {
    if (!sv) { sv = runCircuit(4); }
    const grid = document.getElementById('svd-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const bases = ['|000\u27E9','|001\u27E9','|010\u27E9','|011\u27E9','|100\u27E9','|101\u27E9','|110\u27E9','|111\u27E9'];
    sv.forEach((amp, i) => {
      const prob = amp[0]*amp[0] + amp[1]*amp[1];
      const h = Math.round(prob * 60);
      const item = document.createElement('div');
      item.className = 'svd-item';
      item.innerHTML = `<div class="svd-item__label">${bases[i]}</div>
        <div class="svd-item__bar-wrap"><div class="svd-item__bar" style="height:${h}px"></div></div>
        <div class="svd-item__val">${(prob*100).toFixed(1)}%</div>`;
      grid.appendChild(item);
    });
    drawHistogram(sv);
  }

  function drawHistogram(sv) {
    const canvas = document.getElementById('histogram-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth || 400;
    const H = canvas.height = 120;
    ctx.clearRect(0,0,W,H);
    const n = 8;
    const barW = (W - (n+1) * 4) / n;
    const labels = ['000','001','010','011','100','101','110','111'];
    const colors = ['#7c3aed','#8b5cf6','#06b6d4','#0ea5e9','#7c3aed','#8b5cf6','#06b6d4','#0ea5e9'];
    sv.forEach((amp, i) => {
      const prob = amp[0]*amp[0] + amp[1]*amp[1];
      const x = 4 + i * (barW + 4);
      const bh = prob * (H - 30);
      ctx.fillStyle = colors[i];
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.roundRect(x, H - 25 - bh, barW, bh, [3,3,0,0]);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#9ba8c4';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW/2, H - 8);
      if (prob > 0.01) {
        ctx.fillStyle = '#f0f4ff';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`${(prob*100).toFixed(0)}%`, x + barW/2, H - 28 - bh);
      }
    });
  }

  // Drag and drop
  let dragGate = null;
  document.querySelectorAll('.circuit-gate-chip[draggable]').forEach(chip => {
    chip.addEventListener('dragstart', e => { dragGate = chip.dataset.gate; e.dataTransfer.effectAllowed = 'copy'; });
    chip.addEventListener('dragend', () => dragGate = null);
  });
  document.querySelectorAll('.circuit-drop-zone').forEach(dz => {
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', e => {
      e.preventDefault();
      dz.classList.remove('drag-over');
      if (!dragGate) return;
      const wire = parseInt(dz.dataset.wire), slot = parseInt(dz.dataset.slot);
      circuit[wire][slot] = dragGate;
      renderDropZone(dz, dragGate, wire, slot);
      updateStateVector();
    });
    dz.addEventListener('click', () => {
      // Click to remove
      const wire = parseInt(dz.dataset.wire), slot = parseInt(dz.dataset.slot);
      if (circuit[wire][slot]) {
        circuit[wire][slot] = null;
        dz.innerHTML = '';
        updateStateVector();
      }
    });
  });

  function renderDropZone(dz, gate, wire, slot) {
    dz.innerHTML = `<div class="placed-gate" title="${gate} gate — click to remove">
      ${gate}
      <span class="remove-gate">✕</span>
    </div>`;
  }

  // Initial state buttons
  document.querySelectorAll('[data-qubit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = parseInt(btn.dataset.qubit);
      const s = btn.dataset.state;
      initStates[q] = s === '0' ? 0 : s === '1' ? 1 : 2;
      document.querySelectorAll(`[data-qubit="${q}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateStateVector();
    });
  });

  // Action buttons
  document.getElementById('circuit-run-btn')?.addEventListener('click', () => {
    const sv = runCircuit(4);
    updateStateVector(sv);
  });
  document.getElementById('circuit-step-btn')?.addEventListener('click', () => {
    stepIndex = (stepIndex + 1) % 5;
    const sv = runCircuit(stepIndex);
    updateStateVector(sv);
  });
  document.getElementById('circuit-clear-btn')?.addEventListener('click', () => {
    for (let w = 0; w < 3; w++) for (let s = 0; s < 5; s++) circuit[w][s] = null;
    document.querySelectorAll('.circuit-drop-zone').forEach(dz => dz.innerHTML = '');
    updateStateVector();
  });
  document.getElementById('circuit-measure-btn')?.addEventListener('click', () => {
    const sv = runCircuit(4);
    const probs = sv.map(a => a[0]*a[0] + a[1]*a[1]);
    const total = probs.reduce((a,b) => a+b, 0);
    let rand = Math.random() * total, cum = 0, outcome = 0;
    for (let i = 0; i < probs.length; i++) { cum += probs[i]; if (cum >= rand) { outcome = i; break; } }
    const bases = ['000','001','010','011','100','101','110','111'];
    const box = document.getElementById('circuit-result-box');
    document.getElementById('crb-outcome').textContent = `|${bases[outcome]}\u27E9`;
    document.getElementById('crb-prob').textContent = `P = ${(probs[outcome]*100).toFixed(1)}%`;
    box.style.display = 'block';
    box.style.animation = 'none'; box.offsetHeight; box.style.animation = 'panel-in 0.3s ease';
  });

  // Presets
  const PRESETS = {
    bell: [[['H',null,null,null,null],['CNOT',null,null,null,null],[null,null,null,null,null]]],
    ghz:  [[['H',null,null,null,null],['CNOT',null,null,null,null],[null,'CNOT',null,null,null]]],
    qft:  [[['H',null,null,null,null],[null,'S',null,null,null],[null,null,'T',null,null]]],
    grover:[[['H',null,null,null,null],[null,'X','H',null,null],[null,null,'CNOT',null,null]]]
  };
  ['bell','ghz','qft','grover'].forEach(key => {
    document.getElementById('preset-' + key)?.addEventListener('click', () => {
      for (let w = 0; w < 3; w++) for (let s = 0; s < 5; s++) circuit[w][s] = null;
      document.querySelectorAll('.circuit-drop-zone').forEach(dz => dz.innerHTML = '');
      const preset = PRESETS[key][0];
      preset.forEach((row, w) => row.forEach((g, s) => {
        if (g) {
          circuit[w][s] = g;
          const dz = document.getElementById(`dz-${w}-${s}`);
          if (dz) renderDropZone(dz, g, w, s);
        }
      }));
      const sv = runCircuit(4);
      updateStateVector(sv);
    });
  });

  updateStateVector();
})();

/* ══════════════════════════════════════════════════════════════
   PANEL 3 — ENTANGLEMENT VISUALIZER
══════════════════════════════════════════════════════════════ */
(function EntanglePanel() {
  let bellState = 'phi+';
  let aliceMeasured = false, aliceResult = null, bobMeasured = false, bobResult = null;
  let trial = 0;
  let linkAnim = 0, linkAnimating = false;

  let aliceBloch3D = null;
  let bobBloch3D = null;

  function createEntangleBloch3D(options) {
    if (typeof THREE === 'undefined') return null;

    const {
      mountId,
      themeColor,
      autoRotBtnId,
      resetCamBtnId
    } = options;

    const container = document.getElementById(mountId);
    if (!container) return null;
    container.innerHTML = '';

    const w = container.offsetWidth || 340;
    const h = container.offsetHeight || 290;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    const DEFAULT_CAM = new THREE.Vector3(2.5, 1.8, 3.2);
    camera.position.copy(DEFAULT_CAM);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.4;
    controls.maxDistance = 7.5;
    controls.enablePan = false;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dl1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dl1.position.set(4, 6, 4);
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(themeColor, 0.8);
    dl2.position.set(-4, -2, -3);
    scene.add(dl2);

    const blochGroup = new THREE.Group();
    scene.add(blochGroup);
    const R = 1.75;

    // Glass sphere shell
    const shellMat = new THREE.MeshPhongMaterial({
      color: 0x0a1628,
      emissive: 0x050d18,
      specular: themeColor,
      shininess: 80,
      transparent: true,
      opacity: 0.46,
      side: THREE.FrontSide,
      depthWrite: false
    });
    blochGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R, 36, 26), shellMat));

    // Darker back shell for depth
    blochGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.992, 26, 18),
      new THREE.MeshBasicMaterial({ color: 0x020712, transparent: true, opacity: 0.62, side: THREE.BackSide, depthWrite: false })
    ));

    // Rings helper
    function makeRing(radius, yPos, color, opacity) {
      const pts = [];
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, yPos, Math.sin(a) * radius));
      }
      return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }

    // Equator
    blochGroup.add(makeRing(R, 0, themeColor, 0.95));

    // Latitude rings
    [30, -30, 60, -60].forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      const y = Math.sin(rad) * R;
      const rL = Math.cos(rad) * R;
      blochGroup.add(makeRing(rL, y, 0x64748b, Math.abs(deg) === 30 ? 0.35 : 0.20));
    });

    // Great circles (meridians)
    function makeMeridian(normalVec, color, opacity) {
      const pts = [];
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normalVec.clone().normalize());
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        const v = new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R);
        v.applyQuaternion(q);
        pts.push(v);
      }
      return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }
    blochGroup.add(makeMeridian(new THREE.Vector3(0, 0, 1), 0x6366f1, 0.40));
    blochGroup.add(makeMeridian(new THREE.Vector3(1, 0, 0), themeColor, 0.45));

    // 3D Axes
    const AX = R * 1.30;
    function makeLine(a, b, color, opacity) {
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([a, b]),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }
    function makeCone(pos, dir, color) {
      const L = 0.18;
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.045, L, 12), new THREE.MeshBasicMaterial({ color }));
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      m.position.copy(pos.clone().sub(dir.clone().multiplyScalar(L * 0.5)));
      return m;
    }

    // Z axis (|0>, |1>)
    blochGroup.add(makeLine(new THREE.Vector3(0, -AX, 0), new THREE.Vector3(0, AX, 0), 0x38bdf8, 0.90));
    blochGroup.add(makeCone(new THREE.Vector3(0, AX, 0), new THREE.Vector3(0, 1, 0), 0x38bdf8));
    blochGroup.add(makeCone(new THREE.Vector3(0, -AX, 0), new THREE.Vector3(0, -1, 0), 0x38bdf8));

    // X axis (|+>, |->)
    blochGroup.add(makeLine(new THREE.Vector3(-AX, 0, 0), new THREE.Vector3(AX, 0, 0), 0xf87171, 0.85));
    blochGroup.add(makeCone(new THREE.Vector3(AX, 0, 0), new THREE.Vector3(1, 0, 0), 0xf87171));
    blochGroup.add(makeCone(new THREE.Vector3(-AX, 0, 0), new THREE.Vector3(-1, 0, 0), 0xf87171));

    // Y axis (|+i>, |-i>)
    blochGroup.add(makeLine(new THREE.Vector3(0, 0, -AX), new THREE.Vector3(0, 0, AX), 0x34d399, 0.85));
    blochGroup.add(makeCone(new THREE.Vector3(0, 0, AX), new THREE.Vector3(0, 0, 1), 0x34d399));
    blochGroup.add(makeCone(new THREE.Vector3(0, 0, -AX), new THREE.Vector3(0, 0, -1), 0x34d399));

    // Sprite billboard labels
    function makeLabel(text, hexColor, fsize = 44) {
      const cw = 256, ch = 128;
      const cvs = document.createElement('canvas');
      cvs.width = cw; cvs.height = ch;
      const cctx = cvs.getContext('2d');
      const col = '#' + hexColor.toString(16).padStart(6, '0');
      cctx.shadowColor = col; cctx.shadowBlur = 14;
      cctx.font = `bold ${fsize}px "JetBrains Mono",monospace`;
      cctx.fillStyle = col;
      cctx.textAlign = 'center'; cctx.textBaseline = 'middle';
      cctx.fillText(text, cw / 2, ch / 2);
      const tex = new THREE.CanvasTexture(cvs);
      tex.minFilter = THREE.LinearFilter;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      spr.scale.set(0.66, 0.33, 1);
      return spr;
    }

    const LBL_OFF = 0.25;
    const l0 = makeLabel('|0\u27E9', 0x38bdf8, 48); l0.position.set(0, AX + LBL_OFF, 0); blochGroup.add(l0);
    const l1 = makeLabel('|1\u27E9', 0x38bdf8, 48); l1.position.set(0, -AX - LBL_OFF, 0); blochGroup.add(l1);
    const lP = makeLabel('|+\u27E9', 0xf87171, 44); lP.position.set(AX + LBL_OFF, 0, 0); blochGroup.add(lP);
    const lM = makeLabel('|-\u27E9', 0xf87171, 44); lM.position.set(-AX - LBL_OFF, 0, 0); blochGroup.add(lM);
    const lYp = makeLabel('|+i\u27E9', 0x34d399, 44); lYp.position.set(0, 0, AX + LBL_OFF); blochGroup.add(lYp);
    const lYm = makeLabel('|-i\u27E9', 0x34d399, 44); lYm.position.set(0, 0, -AX - LBL_OFF); blochGroup.add(lYm);

    // ENTANGLED SUPERPOSITION CORE INDICATORS
    // Pulsing wireframe core sphere at origin (maximally mixed state r = 0)
    const coreGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: themeColor,
      transparent: true,
      opacity: 0.85,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    blochGroup.add(coreMesh);

    // Rotating equator superposition ring
    const auraRing = makeRing(R * 0.58, 0, themeColor, 0.5);
    blochGroup.add(auraRing);

    // Ghost arrows pointing toward |0> and |1> while entangled
    const ghostGroup = new THREE.Group();
    blochGroup.add(ghostGroup);

    function makeGhostArrow(dirY, col) {
      const g = new THREE.Group();
      const line = makeLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, dirY * R * 0.72, 0), col, 0.35);
      const cone = makeCone(new THREE.Vector3(0, dirY * R * 0.72, 0), new THREE.Vector3(0, dirY, 0), col);
      cone.material.transparent = true;
      cone.material.opacity = 0.45;
      g.add(line, cone);
      return g;
    }
    const ghostUp = makeGhostArrow(1, 0x38bdf8);
    const ghostDown = makeGhostArrow(-1, 0x38bdf8);
    ghostGroup.add(ghostUp, ghostDown);

    // ACTIVE COLLAPSED STATE VECTOR GROUP
    const vecGroup = new THREE.Group();
    blochGroup.add(vecGroup);

    // Pivot ball at origin
    vecGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 16, 16),
      new THREE.MeshBasicMaterial({ color: themeColor })
    ));

    // Vector shaft cylinder
    const HEAD = 0.28;
    const shaftGeo = new THREE.CylinderGeometry(0.034, 0.034, 1, 16);
    shaftGeo.translate(0, 0.5, 0);
    const shaftMesh = new THREE.Mesh(shaftGeo, new THREE.MeshBasicMaterial({ color: themeColor }));
    vecGroup.add(shaftMesh);

    // Vector arrowhead cone
    const headMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.082, HEAD, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    vecGroup.add(headMesh);

    // Projection dotted line & dot
    const projGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const projMat = new THREE.LineDashedMaterial({ color: themeColor, dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.65 });
    const projLine = new THREE.Line(projGeo, projMat);
    blochGroup.add(projLine);

    const projDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 12),
      new THREE.MeshBasicMaterial({ color: themeColor, transparent: true, opacity: 0.85 })
    );
    blochGroup.add(projDot);

    let isAutoRotating = false;
    let isEntangled = true;
    let animTime = 0;
    let curV = new THREE.Vector3(0, 0.001, 0);
    let tgtV = new THREE.Vector3(0, 0.001, 0);

    function animate() {
      requestAnimationFrame(animate);
      animTime += 0.03;

      if (isAutoRotating) {
        blochGroup.rotation.y += 0.006;
      }

      if (isEntangled) {
        const pulse = 1 + 0.22 * Math.sin(animTime * 2.5);
        coreMesh.scale.set(pulse, pulse, pulse);
        coreMesh.rotation.y += 0.015;
        coreMesh.rotation.x += 0.008;
        auraRing.rotation.y += 0.02;
        coreMesh.visible = true;
        auraRing.visible = true;
        ghostGroup.visible = true;
        projLine.visible = false;
        projDot.visible = false;
      } else {
        coreMesh.visible = false;
        auraRing.visible = false;
        ghostGroup.visible = false;
        projLine.visible = true;
        projDot.visible = true;
      }

      curV.lerp(tgtV, 0.12);
      const len = curV.length();

      if (len < 0.06) {
        shaftMesh.visible = false;
        headMesh.visible = false;
        projLine.visible = false;
        projDot.visible = false;
      } else {
        shaftMesh.visible = true;
        headMesh.visible = true;
        const shaftL = Math.max(0.001, len - HEAD);
        shaftMesh.scale.set(1, shaftL, 1);
        headMesh.position.set(0, shaftL + HEAD * 0.5, 0);

        const dir = curV.clone().normalize();
        vecGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        if (projLine.visible) {
          const pBottom = new THREE.Vector3(curV.x, 0, curV.z);
          projLine.geometry.setFromPoints([curV, pBottom]);
          projLine.computeLineDistances();
          projDot.position.copy(pBottom);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function resize() {
      const wNew = container.offsetWidth || 340;
      const hNew = container.offsetHeight || 290;
      if (!wNew || !hNew) return;
      camera.aspect = wNew / hNew;
      camera.updateProjectionMatrix();
      renderer.setSize(wNew, hNew);
    }
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(container);

    const rotBtn = document.getElementById(autoRotBtnId);
    if (rotBtn) {
      rotBtn.addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;
        rotBtn.classList.toggle('active', isAutoRotating);
      });
    }

    const resetCamBtn = document.getElementById(resetCamBtnId);
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        camera.position.copy(DEFAULT_CAM);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        blochGroup.rotation.set(0, 0, 0);
      });
    }

    return {
      R,
      collapse(result) {
        isEntangled = false;
        // In quantum notation: |0> is +Z (top pole, +Y in Three.js), |1> is -Z (bottom pole, -Y in Three.js)
        const targetY = result === 0 ? R : -R;
        tgtV.set(0, targetY, 0);
      },
      resetEntangled() {
        isEntangled = true;
        tgtV.set(0, 0.001, 0);
      },
      resize
    };
  }

  function initEntangleBlochs() {
    if (!aliceBloch3D) {
      aliceBloch3D = createEntangleBloch3D({
        mountId: 'alice-bloch-webgl-mount',
        themeColor: 0xa855f7,
        autoRotBtnId: 'btn-alice-bloch-autorotate',
        resetCamBtnId: 'btn-alice-bloch-reset-cam'
      });
    }
    if (!bobBloch3D) {
      bobBloch3D = createEntangleBloch3D({
        mountId: 'bob-bloch-webgl-mount',
        themeColor: 0x06b6d4,
        autoRotBtnId: 'btn-bob-bloch-autorotate',
        resetCamBtnId: 'btn-bob-bloch-reset-cam'
      });
    }
  }

  window.resizeEntangleBloch = function() {
    initEntangleBlochs();
    if (aliceBloch3D) aliceBloch3D.resize();
    if (bobBloch3D) bobBloch3D.resize();
  };

  function updateAliceHUD(measured, result) {
    const badge = document.getElementById('alice-hud-state-badge');
    const coords = document.getElementById('alice-hud-coords');
    const angles = document.getElementById('alice-hud-angles');
    const state = document.getElementById('alice-hud-state');
    const fill0 = document.getElementById('alice-prob-fill-0');
    const fill1 = document.getElementById('alice-prob-fill-1');
    const pct0 = document.getElementById('alice-prob-pct-0');
    const pct1 = document.getElementById('alice-prob-pct-1');
    const bottomState = document.getElementById('alice-state');

    if (!measured || result === null) {
      if (badge) {
        badge.textContent = 'Entangled (Mixed)';
        badge.style.color = '#c084fc';
        badge.style.background = 'rgba(192,132,252,0.12)';
        badge.style.borderColor = 'rgba(192,132,252,0.3)';
      }
      if (coords) coords.textContent = 'r: (0.00, 0.00, 0.00)';
      if (angles) angles.textContent = '\u03B8: \u2014 \u00B7 \u03C6: \u2014';
      if (state) state.textContent = '|\u03C8_A\u27E9 = (|0\u27E9 + |1\u27E9)/\u221A2 (Mixed)';
      if (bottomState) bottomState.textContent = '|\u03C8_A\u27E9 = ? (Entangled)';
      if (fill0) fill0.style.width = '50%';
      if (fill1) fill1.style.width = '50%';
      if (pct0) pct0.textContent = '50%';
      if (pct1) pct1.textContent = '50%';
    } else {
      if (badge) {
        badge.textContent = 'Collapsed (Pure)';
        badge.style.color = '#34d399';
        badge.style.background = 'rgba(52,211,153,0.12)';
        badge.style.borderColor = 'rgba(52,211,153,0.3)';
      }
      const rz = result === 0 ? '1.00' : '-1.00';
      const theta = result === 0 ? '0.0\u00B0' : '180.0\u00B0';
      if (coords) coords.textContent = `r: (0.00, 0.00, ${rz})`;
      if (angles) angles.textContent = `\u03B8: ${theta} \u00B7 \u03C6: 0.0\u00B0`;
      if (state) state.textContent = `|\u03C8_A\u27E9 = |${result}\u27E9 (${result === 0 ? 'spin-up' : 'spin-down'})`;
      if (bottomState) bottomState.textContent = `|\u03C8_A\u27E9 = |${result}\u27E9`;
      if (fill0) fill0.style.width = result === 0 ? '100%' : '0%';
      if (fill1) fill1.style.width = result === 0 ? '0%' : '100%';
      if (pct0) pct0.textContent = result === 0 ? '100%' : '0%';
      if (pct1) pct1.textContent = result === 0 ? '0%' : '100%';
    }
  }

  function updateBobHUD(measured, result) {
    const badge = document.getElementById('bob-hud-state-badge');
    const coords = document.getElementById('bob-hud-coords');
    const angles = document.getElementById('bob-hud-angles');
    const state = document.getElementById('bob-hud-state');
    const fill0 = document.getElementById('bob-prob-fill-0');
    const fill1 = document.getElementById('bob-prob-fill-1');
    const pct0 = document.getElementById('bob-prob-pct-0');
    const pct1 = document.getElementById('bob-prob-pct-1');
    const bottomState = document.getElementById('bob-state');

    if (!measured || result === null) {
      if (badge) {
        badge.textContent = 'Entangled (Mixed)';
        badge.style.color = '#22d3ee';
        badge.style.background = 'rgba(34,211,238,0.12)';
        badge.style.borderColor = 'rgba(34,211,238,0.3)';
      }
      if (coords) coords.textContent = 'r: (0.00, 0.00, 0.00)';
      if (angles) angles.textContent = '\u03B8: \u2014 \u00B7 \u03C6: \u2014';
      if (state) state.textContent = '|\u03C8_B\u27E9 = (|0\u27E9 + |1\u27E9)/\u221A2 (Mixed)';
      if (bottomState) bottomState.textContent = '|\u03C8_B\u27E9 = ? (Entangled)';
      if (fill0) fill0.style.width = '50%';
      if (fill1) fill1.style.width = '50%';
      if (pct0) pct0.textContent = '50%';
      if (pct1) pct1.textContent = '50%';
    } else {
      if (badge) {
        badge.textContent = 'Collapsed (Pure)';
        badge.style.color = '#34d399';
        badge.style.background = 'rgba(52,211,153,0.12)';
        badge.style.borderColor = 'rgba(52,211,153,0.3)';
      }
      const rz = result === 0 ? '1.00' : '-1.00';
      const theta = result === 0 ? '0.0\u00B0' : '180.0\u00B0';
      if (coords) coords.textContent = `r: (0.00, 0.00, ${rz})`;
      if (angles) angles.textContent = `\u03B8: ${theta} \u00B7 \u03C6: 0.0\u00B0`;
      if (state) state.textContent = `|\u03C8_B\u27E9 = |${result}\u27E9 (${result === 0 ? 'spin-up' : 'spin-down'})`;
      if (bottomState) bottomState.textContent = `|\u03C8_B\u27E9 = |${result}\u27E9`;
      if (fill0) fill0.style.width = result === 0 ? '100%' : '0%';
      if (fill1) fill1.style.width = result === 0 ? '0%' : '100%';
      if (pct0) pct0.textContent = result === 0 ? '100%' : '0%';
      if (pct1) pct1.textContent = result === 0 ? '0%' : '100%';
    }
  }

  function getCorrelation() {
    // phi+: same, phi-: same, psi+: opposite, psi-: opposite
    return bellState === 'phi+' || bellState === 'phi-' ? 'same' : 'opposite';
  }

  function measureAlice() {
    if (aliceMeasured && bobMeasured) return;
    initEntangleBlochs();

    if (!aliceMeasured) {
      aliceResult = Math.random() < 0.5 ? 0 : 1;
      aliceMeasured = true;
    }

    if (aliceBloch3D) aliceBloch3D.collapse(aliceResult);
    const aliceResEl = document.getElementById('alice-result');
    if (aliceResEl) {
      aliceResEl.className = `eqc-result result-${aliceResult}`;
      aliceResEl.textContent = aliceResult === 0 ? '|0\u27E9 (spin-up)' : '|1\u27E9 (spin-down)';
    }
    updateAliceHUD(true, aliceResult);

    // Spooky action at a distance: collapse entangled partner Bob
    if (!bobMeasured) {
      const corr = getCorrelation();
      bobResult = corr === 'same' ? aliceResult : 1 - aliceResult;
      bobMeasured = true;
      if (bobBloch3D) bobBloch3D.collapse(bobResult);
      const bobResEl = document.getElementById('bob-result');
      if (bobResEl) {
        bobResEl.className = `eqc-result result-${bobResult}`;
        bobResEl.textContent = bobResult === 0 ? '|0\u27E9 (spin-up)' : '|1\u27E9 (spin-down)';
      }
      updateBobHUD(true, bobResult);
    }

    checkCorrelation();
    flashLink();
  }

  function measureBob() {
    if (bobMeasured && aliceMeasured) return;
    initEntangleBlochs();

    if (!bobMeasured) {
      bobResult = Math.random() < 0.5 ? 0 : 1;
      bobMeasured = true;
    }

    if (bobBloch3D) bobBloch3D.collapse(bobResult);
    const bobResEl = document.getElementById('bob-result');
    if (bobResEl) {
      bobResEl.className = `eqc-result result-${bobResult}`;
      bobResEl.textContent = bobResult === 0 ? '|0\u27E9 (spin-up)' : '|1\u27E9 (spin-down)';
    }
    updateBobHUD(true, bobResult);

    // Spooky action at a distance: collapse entangled partner Alice
    if (!aliceMeasured) {
      const corr = getCorrelation();
      aliceResult = corr === 'same' ? bobResult : 1 - bobResult;
      aliceMeasured = true;
      if (aliceBloch3D) aliceBloch3D.collapse(aliceResult);
      const aliceResEl = document.getElementById('alice-result');
      if (aliceResEl) {
        aliceResEl.className = `eqc-result result-${aliceResult}`;
        aliceResEl.textContent = aliceResult === 0 ? '|0\u27E9 (spin-up)' : '|1\u27E9 (spin-down)';
      }
      updateAliceHUD(true, aliceResult);
    }

    checkCorrelation();
    flashLink();
  }

  function checkCorrelation() {
    if (!aliceMeasured || !bobMeasured) return;
    trial++;
    const corr = getCorrelation();
    const actualCorr = corr === 'same' ? (aliceResult === bobResult) : (aliceResult !== bobResult);
    addHistoryRow(trial, aliceResult, bobResult, actualCorr);
  }

  function addHistoryRow(t, a, b, corr) {
    const grid = document.getElementById('entangle-history-grid');
    if (!grid) return;
    const row = document.createElement('div');
    row.className = 'ehg-row';
    row.innerHTML = `<span>#${t}</span><span>|${a}\u27E9</span><span>|${b}\u27E9</span><span class="${corr ? 'ehg-yes' : 'ehg-no'}">${corr ? '\u2713 Yes' : '\u2715 No'}</span>`;
    grid.appendChild(row);
    grid.scrollTop = grid.scrollHeight;
  }

  function drawEntangleLink() {
    const canvas = document.getElementById('entangle-link-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const t = linkAnim;

    // Draw quantum channel (wiggling line)
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const y = H/2 + 12 * Math.sin(x * 0.08 + t);
      x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    const grd = ctx.createLinearGradient(0,0,W,0);
    grd.addColorStop(0,'#7c3aed');
    grd.addColorStop(0.5,'#06b6d4');
    grd.addColorStop(1,'#7c3aed');
    ctx.strokeStyle = grd;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Particles flying along
    for (let i = 0; i < 3; i++) {
      const px = ((t * 30 + i * (W/3)) % W);
      const py = H/2 + 12 * Math.sin(px * 0.08 + t);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI*2);
      const alpha = Math.sin(t * 3 + i) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(6,182,212,${alpha})`;
      ctx.fill();
    }

    if (linkAnimating) linkAnim += 0.06;
  }
  window.drawEntangleLink = drawEntangleLink;

  function flashLink() {
    linkAnimating = true;
    let count = 0;
    const interval = setInterval(() => {
      drawEntangleLink();
      count++;
      if (count > 60) { linkAnimating = false; clearInterval(interval); }
    }, 16);
  }

  function resetEntanglement() {
    aliceMeasured = false; aliceResult = null;
    bobMeasured = false; bobResult = null;
    const aRes = document.getElementById('alice-result');
    if (aRes) { aRes.className = 'eqc-result'; aRes.textContent = ''; }
    const bRes = document.getElementById('bob-result');
    if (bRes) { bRes.className = 'eqc-result'; bRes.textContent = ''; }

    updateAliceHUD(false, null);
    updateBobHUD(false, null);

    if (aliceBloch3D) aliceBloch3D.resetEntangled();
    if (bobBloch3D) bobBloch3D.resetEntangled();
    drawEntangleLink();
  }

  // Reset/re-entangle
  document.getElementById('entangle-reset-btn')?.addEventListener('click', resetEntanglement);
  document.getElementById('alice-measure-btn')?.addEventListener('click', measureAlice);
  document.getElementById('bob-measure-btn')?.addEventListener('click', measureBob);

  document.querySelectorAll('#bell-state-group .viz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#bell-state-group .viz-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bellState = btn.dataset.bell;
      const corrText = (bellState === 'phi+' || bellState === 'phi-') ? 'Correlated: same outcomes' : 'Anti-correlated: opposite outcomes';
      const label = document.getElementById('entangle-correlation-label');
      if (label) label.textContent = corrText;
      resetEntanglement();
    });
  });

  // Initialize
  setTimeout(() => {
    initEntangleBlochs();
    updateAliceHUD(false, null);
    updateBobHUD(false, null);
    drawEntangleLink();
  }, 100);
})();

/* ══════════════════════════════════════════════════════════════
   PANEL 4 — INTERFERENCE VISUALIZER
══════════════════════════════════════════════════════════════ */
(function InterferencePanel() {
  const canvas = document.getElementById('interference-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  let slitWidth = 0.12, slitSep = 0.25, wavelength = 0.08;
  let particleCount = 800, observed = false;
  let fired = 0;
  let dots = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth || 700;
    H = canvas.height = canvas.offsetHeight || 400;
  }

  function intensity(y) {
    // Double-slit diffraction + interference
    const norm_y = (y - H/2) / H;
    const d = slitSep;
    const a = slitWidth;
    const lam = wavelength;
    const sinT = norm_y * 0.8;
    const phase_inter = Math.PI * d * sinT / lam;
    const phase_diff  = Math.PI * a * sinT / lam;
    const inter = Math.pow(Math.cos(phase_inter), 2);
    const diff  = phase_diff === 0 ? 1 : Math.pow(Math.sin(phase_diff) / phase_diff, 2);
    return inter * diff;
  }

  function singleSlit(y) {
    const norm_y = (y - H/2) / H;
    const a = slitWidth;
    const lam = wavelength;
    const sinT = norm_y;
    const arg = Math.PI * a * sinT / lam;
    return arg === 0 ? 1 : Math.pow(Math.sin(arg) / arg, 2);
  }

  function drawBackground() {
    resize();
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#050812';
    ctx.fillRect(0,0,W,H);

    // Intensity pattern (glow)
    for (let y = 0; y < H; y += 2) {
      const I = observed ? singleSlit(y) : intensity(y);
      const r = observed ? 245 : 6;
      const g = observed ? 158 : 182;
      const b = observed ? 11 : 212;
      ctx.fillStyle = `rgba(${r},${g},${b},${I * 0.3})`;
      ctx.fillRect(W * 0.65, y, W * 0.35, 2);
    }

    // Draw barrier + slits
    const bx = W * 0.38;
    ctx.fillStyle = '#1a2035';
    ctx.fillRect(bx, 0, 8, H);
    // Slits
    const slitH = slitWidth * H * 0.8;
    const sep = slitSep * H * 0.5;
    ctx.fillStyle = '#050812';
    ctx.fillRect(bx, H/2 - sep - slitH/2, 8, slitH);
    ctx.fillRect(bx, H/2 + sep - slitH/2, 8, slitH);
    // Slit glow
    const grd = ctx.createLinearGradient(bx,0,bx+40,0);
    grd.addColorStop(0, 'rgba(6,182,212,0.3)');
    grd.addColorStop(1, 'rgba(6,182,212,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(bx, H/2 - sep - slitH/2, 40, slitH);
    ctx.fillRect(bx, H/2 + sep - slitH/2, 40, slitH);

    // Source
    ctx.beginPath();
    ctx.arc(W * 0.1, H/2, 6, 0, Math.PI*2);
    ctx.fillStyle = '#7c3aed';
    ctx.fill();
    ctx.shadowColor = '#7c3aed'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;

    // Beam lines
    ctx.strokeStyle = 'rgba(124,58,237,0.2)'; ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(W*0.1, H/2); ctx.lineTo(bx, H/2); ctx.stroke();
    ctx.setLineDash([]);

    // Screen
    ctx.fillStyle = '#1a2035';
    ctx.fillRect(W - 4, 0, 4, H);
  }

  function fireParticles() {
    if (!canvas.offsetParent && canvas.offsetParent !== null) return;
    drawBackground();
    const bx = W * 0.38;
    const screenX = W - 20;
    const slitH = slitWidth * H * 0.8;
    const sep = slitSep * H * 0.5;

    // Add particles with quantum probability
    for (let i = 0; i < Math.min(particleCount, 2000); i++) {
      // Choose which slit
      const slit = Math.random() < 0.5 ? -1 : 1;
      const slitY = H/2 + slit * H * slitSep * 0.5;

      let finalY;
      if (observed) {
        // Classical: gaussian spread from each slit
        finalY = slitY + (Math.random() - 0.5) * H * slitWidth * 2;
      } else {
        // Quantum: rejection sampling from intensity
        let tries = 0;
        do {
          finalY = Math.random() * H;
          tries++;
        } while (Math.random() > intensity(finalY) && tries < 100);
      }

      dots.push({
        x: screenX - Math.random() * 12,
        y: finalY,
        alpha: 0.6 + Math.random() * 0.4,
        r: Math.random() * 1.5 + 0.5,
        color: observed ? '#f59e0b' : '#06b6d4'
      });
    }
    fired += particleCount;
    document.getElementById('particles-fired').textContent = fired;
  }

  function render() {
    drawBackground();
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = d.color.replace(')', `,${d.alpha})`).replace('rgb(', 'rgba(');
      ctx.fillStyle = d.color;
      ctx.globalAlpha = d.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    updateStats();
  }

  function updateStats() {
    const spacing = Math.round((wavelength / slitSep) * H * 50);
    document.getElementById('fringe-spacing').textContent = `${spacing} px`;
    document.getElementById('fringe-visibility').textContent = observed ? '0%' : '98%';
  }

  // Sliders
  function wireSlider2(id, valId, key) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      if (key === 'slitWidth') slitWidth = parseFloat(el.value);
      if (key === 'slitSep') slitSep = parseFloat(el.value);
      if (key === 'wavelength') wavelength = parseFloat(el.value);
      if (key === 'particleCount') particleCount = parseInt(el.value);
      document.getElementById(valId).textContent = el.value;
      dots = []; fired = 0; document.getElementById('particles-fired').textContent = '0';
      render();
    });
  }
  wireSlider2('slit-width','slit-width-val','slitWidth');
  wireSlider2('slit-sep','slit-sep-val','slitSep');
  wireSlider2('wavelength','wavelength-val','wavelength');
  wireSlider2('particle-count','particle-count-val','particleCount');

  document.querySelectorAll('#particle-type-group .viz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#particle-type-group .viz-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dots = []; fired = 0; document.getElementById('particles-fired').textContent = '0';
      render();
    });
  });

  const obs = document.getElementById('observer-toggle');
  const badge = document.getElementById('observer-badge');
  const obsLabel = document.getElementById('obs-label');
  obs?.addEventListener('change', () => {
    observed = obs.checked;
    badge.dataset.active = observed;
    obsLabel.textContent = `Observer: ${observed ? 'ON' : 'OFF'}`;
    dots = []; fired = 0; document.getElementById('particles-fired').textContent = '0';
    render();
  });

  document.getElementById('interference-fire-btn')?.addEventListener('click', () => {
    fireParticles();
    render();
  });
  document.getElementById('interference-clear-btn')?.addEventListener('click', () => {
    dots = []; fired = 0; document.getElementById('particles-fired').textContent = '0';
    drawBackground();
  });

  drawBackground();
  updateStats();
})();

/* ══════════════════════════════════════════════════════════════
   PANEL 5 — QUBIT ENSEMBLE (Three.js 3D Bloch Studio + Array)
══════════════════════════════════════════════════════════════ */
let ensembleQubits = [];
let ensembleN = 8;
let ensembleAnimMode = 'static';
let ensembleRaf;
let ensembleT = 0;
let selectedEnsembleIdx = 0;
let ensembleBloch3D = null;
let isEnsAutoRotating = false;

function initEnsembleBloch3D() {
  const container = document.getElementById('ensemble-bloch-webgl-mount');
  if (!container || typeof THREE === 'undefined') return;

  container.innerHTML = '';
  const W = container.offsetWidth || 340;
  const H = container.offsetHeight || 330;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const DEFAULT_CAM = new THREE.Vector3(3.6, 2.4, 4.4);
  const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 100);
  camera.position.copy(DEFAULT_CAM);
  camera.lookAt(0, 0, 0);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2.6;
  controls.maxDistance = 8.0;

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1.15));
  const dl1 = new THREE.DirectionalLight(0xa78bfa, 1.2);
  dl1.position.set(4, 7, 5);
  scene.add(dl1);
  const dl2 = new THREE.DirectionalLight(0x22d3ee, 0.9);
  dl2.position.set(-5, -3, -4);
  scene.add(dl2);

  const blochGroup = new THREE.Group();
  scene.add(blochGroup);
  const R = 1.85;

  // Glass sphere shell
  const shellMat = new THREE.MeshPhongMaterial({
    color: 0x091e3e,
    emissive: 0x040d1a,
    specular: 0x38bdf8,
    shininess: 70,
    transparent: true,
    opacity: 0.45,
    side: THREE.FrontSide,
    depthWrite: false
  });
  blochGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R, 40, 28), shellMat));

  // Darker back shell
  blochGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.992, 28, 20),
    new THREE.MeshBasicMaterial({ color: 0x020712, transparent: true, opacity: 0.60, side: THREE.BackSide, depthWrite: false })
  ));

  // Rings helper
  function makeRing(radius, yPos, color, opacity) {
    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, yPos, Math.sin(a) * radius));
    }
    return new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
  }

  // Equator (cyan)
  blochGroup.add(makeRing(R, 0, 0x22d3ee, 0.95));

  // Latitude rings (+-30, +-60 deg)
  [30, -30, 60, -60].forEach(deg => {
    const rad = (deg * Math.PI) / 180;
    const y = Math.sin(rad) * R;
    const rL = Math.cos(rad) * R;
    blochGroup.add(makeRing(rL, y, 0xa855f7, Math.abs(deg) === 30 ? 0.40 : 0.22));
  });

  // Great circles (meridians)
  function makeMeridian(normalVec, color, opacity) {
    const pts = [];
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normalVec.clone().normalize());
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const v = new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R);
      v.applyQuaternion(q);
      pts.push(v);
    }
    return new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
  }
  blochGroup.add(makeMeridian(new THREE.Vector3(0, 0, 1), 0x6366f1, 0.45)); // X-Z meridian
  blochGroup.add(makeMeridian(new THREE.Vector3(1, 0, 0), 0x8b5cf6, 0.40)); // Y-Z meridian

  // Axes
  const AX = R * 1.32;
  function makeLine(a, b, color, opacity) {
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([a, b]),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
  }
  function makeCone(pos, dir, color) {
    const L = 0.20;
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.048, L, 12), new THREE.MeshBasicMaterial({ color }));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    m.position.copy(pos.clone().sub(dir.clone().multiplyScalar(L * 0.5)));
    return m;
  }

  // Z axis (|0>, |1>)
  blochGroup.add(makeLine(new THREE.Vector3(0, -AX, 0), new THREE.Vector3(0, AX, 0), 0x38bdf8, 0.90));
  blochGroup.add(makeCone(new THREE.Vector3(0, AX, 0), new THREE.Vector3(0, 1, 0), 0x38bdf8));
  blochGroup.add(makeCone(new THREE.Vector3(0, -AX, 0), new THREE.Vector3(0, -1, 0), 0x38bdf8));

  // X axis (|+>, |->)
  blochGroup.add(makeLine(new THREE.Vector3(-AX, 0, 0), new THREE.Vector3(AX, 0, 0), 0xf87171, 0.90));
  blochGroup.add(makeCone(new THREE.Vector3(AX, 0, 0), new THREE.Vector3(1, 0, 0), 0xf87171));
  blochGroup.add(makeCone(new THREE.Vector3(-AX, 0, 0), new THREE.Vector3(-1, 0, 0), 0xf87171));

  // Y axis (|+i>, |-i>)
  blochGroup.add(makeLine(new THREE.Vector3(0, 0, -AX), new THREE.Vector3(0, 0, AX), 0x34d399, 0.90));
  blochGroup.add(makeCone(new THREE.Vector3(0, 0, AX), new THREE.Vector3(0, 0, 1), 0x34d399));
  blochGroup.add(makeCone(new THREE.Vector3(0, 0, -AX), new THREE.Vector3(0, 0, -1), 0x34d399));

  // Sprite Labels
  function makeLabel(text, hexColor, fsize = 44) {
    const cw = 256, ch = 128;
    const cvs = document.createElement('canvas');
    cvs.width = cw; cvs.height = ch;
    const cctx = cvs.getContext('2d');
    const col = '#' + hexColor.toString(16).padStart(6, '0');
    cctx.shadowColor = col; cctx.shadowBlur = 16;
    cctx.font = `bold ${fsize}px "JetBrains Mono",monospace`;
    cctx.fillStyle = col;
    cctx.textAlign = 'center'; cctx.textBaseline = 'middle';
    cctx.fillText(text, cw / 2, ch / 2);
    const tex = new THREE.CanvasTexture(cvs);
    tex.minFilter = THREE.LinearFilter;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    spr.scale.set(0.68, 0.34, 1);
    return spr;
  }

  const LBL_OFF = 0.26;
  const l0 = makeLabel('|0\u27E9', 0x38bdf8, 48); l0.position.set(0, AX + LBL_OFF, 0); blochGroup.add(l0);
  const l1 = makeLabel('|1\u27E9', 0x38bdf8, 48); l1.position.set(0, -AX - LBL_OFF, 0); blochGroup.add(l1);
  const lP = makeLabel('|+\u27E9', 0xf87171, 44); lP.position.set(AX + LBL_OFF, 0, 0); blochGroup.add(lP);
  const lM = makeLabel('|-\u27E9', 0xf87171, 44); lM.position.set(-AX - LBL_OFF, 0, 0); blochGroup.add(lM);
  const lYp = makeLabel('|+i\u27E9', 0x34d399, 44); lYp.position.set(0, 0, AX + LBL_OFF); blochGroup.add(lYp);
  const lYm = makeLabel('|-i\u27E9', 0x34d399, 44); lYm.position.set(0, 0, -AX - LBL_OFF); blochGroup.add(lYm);

  // Vector group
  const vecGroup = new THREE.Group();
  blochGroup.add(vecGroup);

  vecGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee })
  ));

  const HEAD = 0.28;
  const shaftGeo = new THREE.CylinderGeometry(0.032, 0.032, 1, 16);
  shaftGeo.translate(0, 0.5, 0);
  const shaftMesh = new THREE.Mesh(shaftGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
  vecGroup.add(shaftMesh);

  const headMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.082, HEAD, 16),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
  );
  vecGroup.add(headMesh);

  const tipDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
  );
  vecGroup.add(tipDot);

  const psiLbl = makeLabel('|\u03C8\u27E9', 0x22d3ee, 46);
  vecGroup.add(psiLbl);

  // Equatorial projection line & disc
  const projGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
  const projLine = new THREE.Line(projGeo, new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.08, gapSize: 0.05, transparent: true, opacity: 0.6 }));
  blochGroup.add(projLine);

  const projDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.7 })
  );
  blochGroup.add(projDot);

  // Interpolation state
  let curV = new THREE.Vector3(0, R, 0);
  let tgtV = new THREE.Vector3(0, R, 0);

  function animate() {
    requestAnimationFrame(animate);

    if (isEnsAutoRotating) {
      blochGroup.rotation.y += 0.006;
    }

    curV.lerp(tgtV, 0.15);

    const len = curV.length();
    if (len < 0.001) {
      vecGroup.visible = false;
      projLine.visible = false;
      projDot.visible = false;
    } else {
      vecGroup.visible = true;
      const dir = curV.clone().normalize();

      shaftMesh.position.set(0, 0, 0);
      shaftMesh.scale.set(1, Math.max(0.01, len - HEAD), 1);
      shaftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

      headMesh.position.copy(curV.clone().sub(dir.clone().multiplyScalar(HEAD * 0.5)));
      headMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

      tipDot.position.copy(curV);
      psiLbl.position.copy(curV.clone().add(dir.clone().multiplyScalar(0.28)));

      projLine.visible = Math.abs(curV.y) > 0.05;
      projDot.visible = Math.abs(curV.y) > 0.05;
      if (projLine.visible) {
        const pBottom = new THREE.Vector3(curV.x, 0, curV.z);
        projLine.geometry.setFromPoints([curV, pBottom]);
        projLine.computeLineDistances();
        projDot.position.copy(pBottom);
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  function resize() {
    const w = container.offsetWidth || 340;
    const h = container.offsetHeight || 330;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(container);

  const rotBtn = document.getElementById('btn-ens-bloch-autorotate');
  if (rotBtn) {
    rotBtn.addEventListener('click', () => {
      isEnsAutoRotating = !isEnsAutoRotating;
      rotBtn.classList.toggle('active', isEnsAutoRotating);
    });
  }

  const resetCamBtn = document.getElementById('btn-ens-bloch-reset-cam');
  if (resetCamBtn) {
    resetCamBtn.addEventListener('click', () => {
      camera.position.copy(DEFAULT_CAM);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      blochGroup.rotation.set(0, 0, 0);
    });
  }

  ensembleBloch3D = {
    R,
    setTarget(rx, ry, rz) {
      tgtV.set(rx * R, rz * R, ry * R);
    },
    snapTo(rx, ry, rz) {
      tgtV.set(rx * R, rz * R, ry * R);
      curV.copy(tgtV);
    },
    resize
  };
}

function updateEnsemble3DFromQubit(i) {
  if (!ensembleQubits[i]) return;
  const q = ensembleQubits[i];
  const rx = Math.sin(q.theta) * Math.cos(q.phi);
  const ry = Math.sin(q.theta) * Math.sin(q.phi);
  const rz = Math.cos(q.theta);

  if (!ensembleBloch3D) {
    initEnsembleBloch3D();
  }
  if (ensembleBloch3D) {
    ensembleBloch3D.setTarget(rx, ry, rz);
  }

  // Update HUD
  const hudQubit = document.getElementById('ens-hud-qubit');
  const targetBadge = document.getElementById('ensemble-target-badge');
  const hudCoords = document.getElementById('ens-hud-coords');
  const hudAngles = document.getElementById('ens-hud-angles');
  const hudState = document.getElementById('ens-hud-state');
  const fill0 = document.getElementById('ens-prob-fill-0');
  const fill1 = document.getElementById('ens-prob-fill-1');
  const pct0 = document.getElementById('ens-prob-pct-0');
  const pct1 = document.getElementById('ens-prob-pct-1');

  if (hudQubit) hudQubit.textContent = `|q${i}\u27E9`;
  if (targetBadge) targetBadge.textContent = `Inspecting |q${i}\u27E9`;
  if (hudCoords) hudCoords.textContent = `r: (${rx.toFixed(2)}, ${ry.toFixed(2)}, ${rz.toFixed(2)})`;

  const degTheta = (q.theta * 180 / Math.PI);
  let degPhi = ((q.phi * 180 / Math.PI) % 360);
  if (degPhi < 0) degPhi += 360;
  if (hudAngles) hudAngles.textContent = `\u03B8: ${degTheta.toFixed(1)}\u00B0 \u00B7 \u03C6: ${degPhi.toFixed(1)}\u00B0`;

  if (hudState) {
    const a = Math.cos(q.theta / 2);
    const b = Math.sin(q.theta / 2);
    hudState.textContent = `|\u03C8\u27E9 = ${a.toFixed(3)}|0\u27E9 + ${b.toFixed(3)}e^(${degPhi.toFixed(0)}\u00B0)|1\u27E9`;
  }

  const p0 = Math.max(0, Math.min(100, (Math.cos(q.theta / 2) ** 2) * 100));
  const p1 = Math.max(0, Math.min(100, 100 - p0));
  if (fill0) fill0.style.width = `${p0.toFixed(1)}%`;
  if (fill1) fill1.style.width = `${p1.toFixed(1)}%`;
  if (pct0) pct0.textContent = `${p0.toFixed(0)}%`;
  if (pct1) pct1.textContent = `${p1.toFixed(0)}%`;
}

function ensembleInit() {
  const grid = document.getElementById('ensemble-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ensembleQubits = [];

  const countLabel = document.getElementById('ens-active-count-label');
  if (countLabel) countLabel.textContent = `${ensembleN} Qubits in Synchronized Array`;

  if (selectedEnsembleIdx >= ensembleN) selectedEnsembleIdx = 0;

  for (let i = 0; i < ensembleN; i++) {
    ensembleQubits.push({ theta: 0, phi: 0 });
    const card = document.createElement('div');
    card.className = `ensemble-sphere-card ${i === selectedEnsembleIdx ? 'selected' : ''}`;
    card.id = `esc-card-${i}`;
    card.title = `Click to inspect |q${i}\u27E9 in 3D`;

    const label = document.createElement('div');
    label.className = 'esc-label'; label.textContent = `|q${i}\u27E9`;

    const canvas = document.createElement('canvas');
    canvas.width = 90; canvas.height = 90;
    canvas.className = 'esc-canvas';
    canvas.id = `esc-canvas-${i}`;

    const state = document.createElement('div');
    state.className = 'esc-state'; state.id = `esc-state-${i}`; state.textContent = 'P(0)=100%';

    card.append(label, canvas, state);
    card.addEventListener('click', () => {
      selectedEnsembleIdx = i;
      document.querySelectorAll('.ensemble-sphere-card').forEach((c, idx) => {
        c.classList.toggle('selected', idx === i);
      });
      updateEnsemble3DFromQubit(i);
    });
    grid.appendChild(card);
  }

  if (!ensembleBloch3D) {
    initEnsembleBloch3D();
  }
  updateEnsemble3DFromQubit(selectedEnsembleIdx);
  updateDensityMatrix();
}

function drawEnsembleSphere(i) {
  const canvas = document.getElementById(`esc-canvas-${i}`);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const q = ensembleQubits[i];
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 8;

  ctx.clearRect(0, 0, W, H);

  // Radial Sphere background
  const grd = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 2, cx, cy, R);
  grd.addColorStop(0, 'rgba(34,211,238,0.12)');
  grd.addColorStop(0.65, 'rgba(124,58,237,0.06)');
  grd.addColorStop(1, 'rgba(5,9,20,0.92)');
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = grd; ctx.fill();
  ctx.strokeStyle = i === selectedEnsembleIdx ? 'rgba(34,211,238,0.5)' : 'rgba(124,58,237,0.3)';
  ctx.lineWidth = 1; ctx.stroke();

  // Equator ellipse
  ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.28, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.8; ctx.stroke();

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();

  // Bloch vector projection (2D)
  const sx = Math.sin(q.theta) * Math.cos(q.phi);
  const sy = Math.sin(q.theta) * Math.sin(q.phi);
  const sz = Math.cos(q.theta);
  const arrowX = cx + sx * R * 0.82;
  const arrowY = cy - sz * R * 0.82;

  // Arrow
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(arrowX, arrowY);
  const clr = Math.abs(sz) > 0.85 ? (sz > 0 ? '#38bdf8' : '#fb7185') : '#22d3ee';
  ctx.strokeStyle = clr; ctx.lineWidth = 2.2; ctx.stroke();

  // Arrowhead
  const ang = Math.atan2(arrowY - cy, arrowX - cx);
  const aLen = 6;
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY);
  ctx.lineTo(arrowX - aLen * Math.cos(ang - 0.4), arrowY - aLen * Math.sin(ang - 0.4));
  ctx.lineTo(arrowX - aLen * Math.cos(ang + 0.4), arrowY - aLen * Math.sin(ang + 0.4));
  ctx.closePath(); ctx.fillStyle = clr; ctx.fill();

  // Dot at origin
  ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = clr; ctx.fill();

  // Axis labels
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '7px JetBrains Mono,monospace'; ctx.textAlign = 'center';
  ctx.fillText('|0\u27E9', cx, cy - R - 2); ctx.fillText('|1\u27E9', cx, cy + R + 7);

  // State label
  const prob0 = Math.cos(q.theta / 2) ** 2;
  const sl = document.getElementById(`esc-state-${i}`);
  if (sl) sl.textContent = `P(0)=${(prob0 * 100).toFixed(0)}%`;
}

function ensembleAnimateFrame() {
  ensembleT += 0.02;
  ensembleQubits.forEach((q, i) => {
    if (ensembleAnimMode === 'precession') {
      q.phi += 0.04 + i * 0.005;
    } else if (ensembleAnimMode === 'random') {
      q.theta += (Math.random() - 0.5) * 0.04;
      q.phi += (Math.random() - 0.5) * 0.04;
      q.theta = Math.max(0, Math.min(Math.PI, q.theta));
    }
    drawEnsembleSphere(i);
  });
  updateEnsemble3DFromQubit(selectedEnsembleIdx);
  updateDensityMatrix();
  if (ensembleAnimMode !== 'static') ensembleRaf = requestAnimationFrame(ensembleAnimateFrame);
}

function ensembleAnimate() {
  cancelAnimationFrame(ensembleRaf);
  ensembleQubits.forEach((q, i) => drawEnsembleSphere(i));
  updateEnsemble3DFromQubit(selectedEnsembleIdx);
  if (ensembleAnimMode !== 'static') ensembleRaf = requestAnimationFrame(ensembleAnimateFrame);
}

function applyGateToEnsemble(gate) {
  const r2 = 1 / Math.sqrt(2);
  ensembleQubits.forEach(q => {
    const ct = Math.cos(q.theta / 2), st = Math.sin(q.theta / 2);
    const cp = Math.cos(q.phi), sp = Math.sin(q.phi);
    let a = [ct, 0], b = [st * cp, st * sp];
    let na, nb;
    if (gate === 'H') {
      na = [r2 * (a[0] + b[0]), r2 * (a[1] + b[1])];
      nb = [r2 * (a[0] - b[0]), r2 * (a[1] - b[1])];
    } else if (gate === 'X') { na = b; nb = a; }
    else if (gate === 'Y') { na = [-b[1], b[0]]; nb = [a[1], -a[0]]; }
    else if (gate === 'Z') { na = a; nb = [-b[0], -b[1]]; }
    else if (gate === 'S') { na = a; nb = [-b[1], b[0]]; }
    else if (gate === 'T') { na = a; const c = r2, s = r2; nb = [b[0] * c - b[1] * s, b[0] * s + b[1] * c]; }
    else { na = a; nb = b; }
    const r0 = Math.sqrt(na[0] ** 2 + na[1] ** 2), r1 = Math.sqrt(nb[0] ** 2 + nb[1] ** 2);
    q.theta = 2 * Math.atan2(r1, r0);
    q.phi = Math.atan2(nb[1], nb[0]) - Math.atan2(na[1], na[0]);
  });
  updateDensityMatrix();
  ensembleAnimate();
}

function updateDensityMatrix() {
  const dm = document.getElementById('dm-grid');
  if (!dm) return;
  dm.innerHTML = '';
  let r00 = 0, r11 = 0;
  ensembleQubits.forEach(q => {
    r00 += Math.cos(q.theta / 2) ** 2;
    r11 += Math.sin(q.theta / 2) ** 2;
  });
  r00 /= ensembleN; r11 /= ensembleN;
  const cells = [`${r00.toFixed(2)}`, `${r11.toFixed(2)}`, `${r11.toFixed(2)}`, `${r00.toFixed(2)}`];
  cells.forEach(c => { const d = document.createElement('div'); d.className = 'dm-cell'; d.textContent = c; dm.appendChild(d); });
}

// Wire ensemble controls
document.querySelectorAll('#qubit-count-group .viz-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#qubit-count-group .viz-choice').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ensembleN = parseInt(btn.dataset.n);
    if (selectedEnsembleIdx >= ensembleN) selectedEnsembleIdx = 0;
    ensembleInit(); ensembleAnimate();
  });
});
document.querySelectorAll('#ensemble-gate-grid .viz-btn').forEach(btn => {
  btn.addEventListener('click', () => applyGateToEnsemble(btn.dataset.gate));
});
['rx', 'ry', 'rz'].forEach(axis => {
  document.getElementById(`ens-${axis}-btn`)?.addEventListener('click', () => {
    const theta = parseFloat(document.getElementById('ens-theta').value);
    ensembleQubits.forEach(q => {
      if (axis === 'rx') q.theta += theta % (2 * Math.PI);
      if (axis === 'ry') q.theta = (q.theta + theta) % Math.PI;
      if (axis === 'rz') q.phi += theta;
    });
    updateDensityMatrix(); ensembleAnimate();
  });
});
document.getElementById('ens-theta')?.addEventListener('input', function() {
  const v = parseFloat(this.value);
  const f = v / Math.PI;
  document.getElementById('ens-theta-val').textContent = `${f.toFixed(2)}\u03C0`;
});
document.querySelectorAll('#ens-anim-group .viz-choice').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#ens-anim-group .viz-choice').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ensembleAnimMode = btn.dataset.anim;
    cancelAnimationFrame(ensembleRaf);
    ensembleAnimate();
  });
});
document.getElementById('ensemble-reset-btn')?.addEventListener('click', () => {
  ensembleQubits.forEach(q => { q.theta = 0; q.phi = 0; });
  updateDensityMatrix(); ensembleAnimate();
});
document.getElementById('ensemble-random-btn')?.addEventListener('click', () => {
  ensembleQubits.forEach(q => {
    q.theta = Math.random() * Math.PI;
    q.phi = Math.random() * 2 * Math.PI;
  });
  updateDensityMatrix(); ensembleAnimate();
});

ensembleInit();

/* ══════════════════════════════════════════════════════════════
   PANEL 6 — QUANTUM FOURIER TRANSFORM
══════════════════════════════════════════════════════════════ */
(function FourierPanel() {
  let N = 16; // 2^n samples
  let nQubits = 4;
  let freq = 3;
  let signalType = 'sinusoid';
  let inputSignal = [];
  let dftResult = [];
  let qftResult = [];
  let isDrawing = false;

  function generateSignal() {
    N = Math.pow(2, nQubits);
    inputSignal = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      let v = 0;
      switch(signalType) {
        case 'sinusoid': v = Math.sin(2*Math.PI*freq*t); break;
        case 'square': v = Math.sign(Math.sin(2*Math.PI*freq*t)); break;
        case 'sawtooth': v = 2*(t*freq - Math.floor(0.5 + t*freq)); break;
        case 'gaussian': v = Math.exp(-Math.pow(t-0.5,2)/(2*0.08*0.08)); break;
        case 'random': v = Math.random()*2-1; break;
      }
      inputSignal.push(v);
    }
    drawInputSignal();
  }

  function drawInputSignal() {
    const canvas = document.getElementById('fourier-input-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth || 500;
    const H = canvas.height = 160;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0,0,W,H);

    // Grid
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    for (let g = 0; g <= 4; g++) { const y=H*g/4; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Center line
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();

    // Signal
    const amp = H * 0.38;
    ctx.beginPath();
    inputSignal.forEach((v, i) => {
      const x = (i / (N-1)) * W;
      const y = H/2 - v * amp;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    const grd = ctx.createLinearGradient(0,0,W,0);
    grd.addColorStop(0,'#7c3aed'); grd.addColorStop(0.5,'#06b6d4'); grd.addColorStop(1,'#7c3aed');
    ctx.strokeStyle = grd; ctx.lineWidth = 2; ctx.stroke();

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, H/2);
    inputSignal.forEach((v, i) => { const x=(i/(N-1))*W; ctx.lineTo(x, H/2-v*amp); });
    ctx.lineTo(W, H/2); ctx.closePath();
    const fillGrd = ctx.createLinearGradient(0,0,0,H);
    fillGrd.addColorStop(0,'rgba(124,58,237,0.2)'); fillGrd.addColorStop(1,'rgba(124,58,237,0)');
    ctx.fillStyle=fillGrd; ctx.fill();
  }

  function dft(x) {
    const n = x.length;
    return Array.from({length:n}, (_,k) => {
      let re=0, im=0;
      for (let t=0; t<n; t++) {
        const ang = 2*Math.PI*k*t/n;
        re += x[t]*Math.cos(ang);
        im -= x[t]*Math.sin(ang);
      }
      return Math.sqrt(re*re+im*im)/n;
    });
  }

  function qft_approx(x) {
    // Simplified QFT (same result as DFT for visualization, but we show O(n^2) gates)
    return dft(x);
  }

  function runQFT() {
    if (inputSignal.length === 0) generateSignal();
    dftResult = dft(inputSignal);
    qftResult = qft_approx(inputSignal);
    drawSpectrum('dft-canvas', dftResult, '#7c3aed', '#9d5af7');
    drawSpectrum('qft-canvas', qftResult, '#06b6d4', '#22d3ee');
    updateFourierStats();
  }

  function drawSpectrum(canvasId, data, clr1, clr2) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth || 250;
    const H = canvas.height = 130;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(0,0,W,H);

    const half = Math.ceil(data.length/2);
    const maxV = Math.max(...data.slice(0,half), 0.001);
    const barW = (W - half * 2) / half;

    data.slice(0,half).forEach((v, i) => {
      const x = i * (barW + 2) + 1;
      const bh = (v/maxV) * (H-20);
      const grd = ctx.createLinearGradient(x,H-20-bh,x,H-20);
      grd.addColorStop(0,clr2); grd.addColorStop(1,clr1+'80');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.roundRect(x, H-20-bh, barW, bh, [2,2,0,0]);
      ctx.fill();
    });

    // Freq axis
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(0,H-20,W,1);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px JetBrains Mono,monospace'; ctx.textAlign='center';
    ctx.fillText('Frequency →',W/2,H-5);
  }

  function updateFourierStats() {
    const classOps = N * Math.log2(N);
    const quantOps = nQubits * nQubits;
    const speedup = (classOps / quantOps).toFixed(1);
    document.getElementById('classical-ops').textContent = `${classOps.toFixed(0)}`;
    document.getElementById('quantum-ops').textContent = `${quantOps}`;
    document.getElementById('speedup-factor').textContent = `${speedup}\u00D7`;
    document.getElementById('fsc-speedup').textContent = `${speedup}\u00D7`;
    document.getElementById('fourier-qubits-val').textContent = `n=${nQubits}, N=${N}`;
  }

  // Sliders
  document.getElementById('fourier-freq')?.addEventListener('input', function() {
    freq = parseInt(this.value);
    document.getElementById('fourier-freq-val').textContent = `${freq} Hz`;
    generateSignal(); runQFT();
  });
  document.getElementById('fourier-qubits')?.addEventListener('input', function() {
    nQubits = parseInt(this.value);
    N = Math.pow(2, nQubits);
    document.getElementById('fourier-qubits-val').textContent = `n=${nQubits}, N=${N}`;
    generateSignal(); runQFT();
  });

  document.querySelectorAll('#signal-preset-group .viz-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#signal-preset-group .viz-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      signalType = btn.dataset.sig;
      generateSignal(); runQFT();
    });
  });

  document.getElementById('fourier-run-btn')?.addEventListener('click', () => { generateSignal(); runQFT(); });

  // Mouse draw on input canvas
  const ic = document.getElementById('fourier-input-canvas');
  if (ic) {
    ic.addEventListener('mousedown', () => isDrawing = true);
    ic.addEventListener('mouseup', () => { isDrawing = false; runQFT(); });
    ic.addEventListener('mousemove', e => {
      if (!isDrawing) return;
      const rect = ic.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const idx = Math.floor(x * N);
      if (idx >= 0 && idx < N) {
        inputSignal[idx] = -(y * 2 - 1);
        drawInputSignal();
      }
    });
  }

  document.getElementById('fourier-animate-btn')?.addEventListener('click', () => {
    // Animate the QFT butterfly passes
    let pass = 0;
    const passes = nQubits;
    const iv = setInterval(() => {
      const frac = pass / passes;
      const partial = inputSignal.map((v,i) => v * Math.cos(Math.PI * frac * i/N));
      const pd = dft(partial);
      drawSpectrum('qft-canvas', pd, '#06b6d4', '#22d3ee');
      pass++;
      if (pass > passes) { clearInterval(iv); drawSpectrum('qft-canvas', qftResult, '#06b6d4', '#22d3ee'); }
    }, 200);
  });

  generateSignal();
  runQFT();
})();

/* ══════════════════════════════════════════════════════════════
   PANEL 7 — QASM LIVE CODE EDITOR
   Full OpenQASM 2.0 simulator with:
   - Syntax highlighting
   - Bloch sphere per qubit (live update)
   - Circuit diagram
   - State vector amplitude + phase bars
   - Measurement histogram
   - Step-through execution log
══════════════════════════════════════════════════════════════ */
(function CodeEditorPanel() {

  /* ─── QASM PRESET PROGRAMS ─── */
  const PRESETS = {
    superpos: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[1];
creg c[1];
// Apply Hadamard gate to create superposition
h q[0];
// Measure: 50% |0>, 50% |1>
measure q[0] -> c[0];`,

    bell: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
// Bell state |Phi+>: (|00> + |11>) / sqrt(2)
h q[0];
cx q[0], q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];`,

    ghz: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
// GHZ state: (|000> + |111>) / sqrt(2)
h q[0];
cx q[0], q[1];
cx q[0], q[2];
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];`,

    qft: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
// Quantum Fourier Transform on 3 qubits
h q[0];
cp(pi/2) q[1], q[0];
cp(pi/4) q[2], q[0];
h q[1];
cp(pi/2) q[2], q[1];
h q[2];
// Swap
swap q[0], q[2];
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];`,

    deutsch: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[1];
// Deutsch-Jozsa Algorithm
// Oracle: balanced function f(x) = x
x q[1];
h q[0];
h q[1];
cx q[0], q[1];
h q[0];
// Measure query register
// 0 => constant, 1 => balanced
measure q[0] -> c[0];`,

    grover: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
// Grover's Algorithm (2 qubits, target |11>)
h q[0];
h q[1];
// Oracle: marks |11>
cz q[0], q[1];
// Diffusion operator
h q[0];
h q[1];
x q[0];
x q[1];
cz q[0], q[1];
x q[0];
x q[1];
h q[0];
h q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];`,

    teleport: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
// Quantum Teleportation
// q[0] = qubit to teleport (|+> state)
// q[1], q[2] = Bell pair
h q[0];
// Create Bell pair
h q[1];
cx q[1], q[2];
// Bell measurement
cx q[0], q[1];
h q[0];
measure q[0] -> c[0];
measure q[1] -> c[1];
// Corrections (classically controlled)
cx q[1], q[2];
cz q[0], q[2];
measure q[2] -> c[2];`
  };

  /* ─── COMPLEX MATH ─── */
  const C = {
    add: (a,b) => [a[0]+b[0], a[1]+b[1]],
    mul: (a,b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]],
    abs2: (a)  => a[0]*a[0]+a[1]*a[1],
    abs:  (a)  => Math.sqrt(a[0]*a[0]+a[1]*a[1]),
    phase:(a)  => Math.atan2(a[1],a[0]),
    scale:(a,s)=> [a[0]*s, a[1]*s],
    exp:  (phi)=> [Math.cos(phi), Math.sin(phi)] // e^(i*phi)
  };
  const R2 = 1/Math.sqrt(2);

  /* ─── GATE DEFINITIONS ─── */
  function makeGate2x2(a,b,c,d) { return [a,b,c,d]; } // row-major [a b; c d]
  const GATE_MAT = {
    h:   makeGate2x2([R2,0],[R2,0],[R2,0],[-R2,0]),
    x:   makeGate2x2([0,0],[1,0],[1,0],[0,0]),
    y:   makeGate2x2([0,0],[0,-1],[0,1],[0,0]),
    z:   makeGate2x2([1,0],[0,0],[0,0],[-1,0]),
    s:   makeGate2x2([1,0],[0,0],[0,0],[0,1]),
    sdg: makeGate2x2([1,0],[0,0],[0,0],[0,-1]),
    t:   makeGate2x2([1,0],[0,0],[0,0],[R2,R2]),
    tdg: makeGate2x2([1,0],[0,0],[0,0],[R2,-R2]),
    id:  makeGate2x2([1,0],[0,0],[0,0],[1,0]),
  };
  function gateRx(theta) { const c=[Math.cos(theta/2),0],si=[0,-Math.sin(theta/2)]; return makeGate2x2(c,si,si,c); }
  function gateRy(theta) { const c=[Math.cos(theta/2),0],s=[Math.sin(theta/2),0]; return makeGate2x2(c,C.scale(s,-1),s,c); }
  function gateRz(theta) { return makeGate2x2(C.exp(-theta/2),[0,0],[0,0],C.exp(theta/2)); }
  function gateP(theta)  { return makeGate2x2([1,0],[0,0],[0,0],C.exp(theta)); }

  /* ─── STATEVECTOR OPS ─── */
  function svZero(n) {
    const sv = Array(1<<n).fill(null).map(()=>[0,0]);
    sv[0] = [1,0];
    return sv;
  }

  function applyGate1(sv, mat, qubitIdx, nQ) {
    const dim = 1<<nQ;
    const out = sv.map(a=>[...a]);
    for (let i=0; i<dim; i++) {
      const b = (i>>(nQ-1-qubitIdx))&1;
      const j = i^(1<<(nQ-1-qubitIdx)); // flip bit
      if (b===0) {
        out[i] = C.add(C.mul(mat[0],sv[i]), C.mul(mat[1],sv[j]));
        out[j] = C.add(C.mul(mat[2],sv[i]), C.mul(mat[3],sv[j]));
      }
    }
    return out;
  }

  function applyCX(sv, ctrl, tgt, nQ) {
    const dim = 1<<nQ;
    const out = sv.map(a=>[...a]);
    for (let i=0; i<dim; i++) {
      const cBit = (i>>(nQ-1-ctrl))&1;
      if (cBit===1) {
        const j = i^(1<<(nQ-1-tgt));
        if (i<j) { [out[i],out[j]] = [[...sv[j]],[...sv[i]]]; }
      }
    }
    return out;
  }

  function applyCZ(sv, q0, q1, nQ) {
    const dim = 1<<nQ;
    const out = sv.map(a=>[...a]);
    for (let i=0; i<dim; i++) {
      const b0=(i>>(nQ-1-q0))&1, b1=(i>>(nQ-1-q1))&1;
      if (b0===1 && b1===1) out[i] = C.scale(sv[i],-1);
    }
    return out;
  }

  function applySwap(sv, q0, q1, nQ) {
    sv = applyCX(sv,q0,q1,nQ);
    sv = applyCX(sv,q1,q0,nQ);
    sv = applyCX(sv,q0,q1,nQ);
    return sv;
  }

  function applyCCX(sv, a, b, tgt, nQ) {
    const dim = 1<<nQ;
    const out = sv.map(x=>[...x]);
    for (let i=0; i<dim; i++) {
      const ba=(i>>(nQ-1-a))&1, bb=(i>>(nQ-1-b))&1;
      if (ba===1 && bb===1) {
        const j = i^(1<<(nQ-1-tgt));
        if (i<j) { [out[i],out[j]] = [[...sv[j]],[...sv[i]]]; }
      }
    }
    return out;
  }

  function applyCP(sv, theta, ctrl, tgt, nQ) {
    const dim = 1<<nQ;
    const out = sv.map(a=>[...a]);
    const phase = C.exp(theta);
    for (let i=0; i<dim; i++) {
      const cBit=(i>>(nQ-1-ctrl))&1, tBit=(i>>(nQ-1-tgt))&1;
      if (cBit===1 && tBit===1) out[i] = C.mul(phase, sv[i]);
    }
    return out;
  }

  /* ─── QASM PARSER ─── */
  function parseQASM(src) {
    const lines = src.split('\n');
    const ops = [];
    let nQ = 0, nC = 0;
    const qregNames = {}, cregNames = {};
    const errors = [];

    function parseQubit(tok) {
      // handles q[0], q1[0], etc.
      const m = tok.trim().match(/^(\w+)\[(\d+)\]$/);
      if (!m) { errors.push(`Invalid qubit: ${tok}`); return -1; }
      const base = qregNames[m[1]];
      if (base === undefined) { errors.push(`Unknown qreg: ${m[1]}`); return -1; }
      return base + parseInt(m[2]);
    }

    function parseAngle(s) {
      // parse expressions like pi/2, 3*pi/4, 0.785, etc.
      try {
        const safe = s.replace(/pi/g,'Math.PI');
        return Function('"use strict";return ('+safe+')')();
      } catch(e) { errors.push(`Bad angle: ${s}`); return 0; }
    }

    let lineNum = 0;
    for (const rawLine of lines) {
      lineNum++;
      const line = rawLine.replace(/\/\/.*/,'').trim();
      if (!line || line.startsWith('OPENQASM') || line.startsWith('include')) continue;

      // qreg
      let m = line.match(/^qreg\s+(\w+)\[(\d+)\]\s*;?$/);
      if (m) { qregNames[m[1]] = nQ; nQ += parseInt(m[2]); continue; }

      // creg
      m = line.match(/^creg\s+(\w+)\[(\d+)\]\s*;?$/);
      if (m) { cregNames[m[1]] = nC; nC += parseInt(m[2]); continue; }

      // measure q[i] -> c[j]
      m = line.match(/^measure\s+(\w+\[\d+\])\s*->\s*(\w+\[\d+\])\s*;?$/);
      if (m) {
        const qi = parseQubit(m[1]);
        ops.push({ op:'measure', qi, line:lineNum, src:line }); continue;
      }

      // rx/ry/rz/p/cp with angle param: gate(angle) q[i] or gate(angle) q[i],q[j]
      m = line.match(/^(rx|ry|rz|p|cp|u1)\s*\(([^)]+)\)\s+(.+?)\s*;?$/i);
      if (m) {
        const gate = m[1].toLowerCase();
        const angle = parseAngle(m[2]);
        const qargs = m[3].split(',').map(parseQubit);
        ops.push({ op:gate, angle, qargs, line:lineNum, src:line }); continue;
      }

      // 2-qubit gates: cx, cz, swap, cp
      m = line.match(/^(cx|cz|swap|ch)\s+(\w+\[\d+\])\s*,\s*(\w+\[\d+\])\s*;?$/i);
      if (m) {
        const gate = m[1].toLowerCase();
        const q0 = parseQubit(m[2]), q1 = parseQubit(m[3]);
        ops.push({ op:gate, q0, q1, line:lineNum, src:line }); continue;
      }

      // 3-qubit: ccx/toffoli
      m = line.match(/^(ccx|toffoli)\s+(\w+\[\d+\])\s*,\s*(\w+\[\d+\])\s*,\s*(\w+\[\d+\])\s*;?$/i);
      if (m) {
        const q0=parseQubit(m[2]),q1=parseQubit(m[3]),q2=parseQubit(m[4]);
        ops.push({ op:'ccx', q0, q1, q2, line:lineNum, src:line }); continue;
      }

      // 1-qubit gates: h x y z s sdg t tdg id
      m = line.match(/^(h|x|y|z|s|sdg|t|tdg|id|sx|sxdg)\s+(\w+\[\d+\])\s*;?$/i);
      if (m) {
        const gate = m[1].toLowerCase();
        const qi = parseQubit(m[2]);
        ops.push({ op:gate, qi, line:lineNum, src:line }); continue;
      }

      // blank or known ignore lines
      if (line.match(/^(barrier|reset)\s/i)) continue;

      if (line.length > 0) errors.push(`Line ${lineNum}: Unrecognized: ${line}`);
    }

    return { nQ: Math.max(nQ,1), nC, ops, errors };
  }

  /* ─── SIMULATOR ─── */
  function simulate(parsed, upToStep) {
    const { nQ, ops } = parsed;
    let sv = svZero(nQ);
    const log = [];
    const limit = upToStep !== undefined ? Math.min(upToStep, ops.length) : ops.length;

    for (let i=0; i<limit; i++) {
      const op = ops[i];
      let desc = '';
      try {
        switch(op.op) {
          case 'h':   sv = applyGate1(sv, GATE_MAT.h,   op.qi, nQ); desc=`Hadamard on q[${op.qi}]`; break;
          case 'x':   sv = applyGate1(sv, GATE_MAT.x,   op.qi, nQ); desc=`Pauli-X on q[${op.qi}]`; break;
          case 'y':   sv = applyGate1(sv, GATE_MAT.y,   op.qi, nQ); desc=`Pauli-Y on q[${op.qi}]`; break;
          case 'z':   sv = applyGate1(sv, GATE_MAT.z,   op.qi, nQ); desc=`Pauli-Z on q[${op.qi}]`; break;
          case 's':   sv = applyGate1(sv, GATE_MAT.s,   op.qi, nQ); desc=`S-gate on q[${op.qi}]`; break;
          case 'sdg': sv = applyGate1(sv, GATE_MAT.sdg, op.qi, nQ); desc=`S\u2020-gate on q[${op.qi}]`; break;
          case 't':   sv = applyGate1(sv, GATE_MAT.t,   op.qi, nQ); desc=`T-gate on q[${op.qi}]`; break;
          case 'tdg': sv = applyGate1(sv, GATE_MAT.tdg, op.qi, nQ); desc=`T\u2020-gate on q[${op.qi}]`; break;
          case 'id':  desc=`Identity on q[${op.qi}]`; break;
          case 'rx':  sv = applyGate1(sv, gateRx(op.angle||0), op.qargs[0], nQ); desc=`Rx(${(op.angle||0).toFixed(3)}) on q[${op.qargs[0]}]`; break;
          case 'ry':  sv = applyGate1(sv, gateRy(op.angle||0), op.qargs[0], nQ); desc=`Ry(${(op.angle||0).toFixed(3)}) on q[${op.qargs[0]}]`; break;
          case 'rz':  sv = applyGate1(sv, gateRz(op.angle||0), op.qargs[0], nQ); desc=`Rz(${(op.angle||0).toFixed(3)}) on q[${op.qargs[0]}]`; break;
          case 'p':
          case 'u1':  sv = applyGate1(sv, gateP(op.angle||0),  op.qargs?op.qargs[0]:op.qi, nQ); desc=`P(${(op.angle||0).toFixed(3)}) on q[${op.qargs?op.qargs[0]:op.qi}]`; break;
          case 'cx':  sv = applyCX(sv, op.q0, op.q1, nQ);  desc=`CNOT ctrl=q[${op.q0}] tgt=q[${op.q1}]`; break;
          case 'cz':  sv = applyCZ(sv, op.q0, op.q1, nQ);  desc=`CZ q[${op.q0}], q[${op.q1}]`; break;
          case 'ch':  sv = applyGate1(sv, GATE_MAT.h, op.q1, nQ); desc=`CH q[${op.q0}],q[${op.q1}]`; break;
          case 'swap':sv = applySwap(sv,op.q0,op.q1,nQ);   desc=`SWAP q[${op.q0}], q[${op.q1}]`; break;
          case 'cp':  sv = applyCP(sv, op.angle||Math.PI/2, op.qargs[0], op.qargs[1], nQ); desc=`CP(${(op.angle||0).toFixed(3)}) q[${op.qargs[0]}],q[${op.qargs[1]}]`; break;
          case 'ccx': sv = applyCCX(sv,op.q0,op.q1,op.q2,nQ); desc=`Toffoli q[${op.q0}],q[${op.q1}]\u2192q[${op.q2}]`; break;
          case 'measure': {
            const probs = sv.map(C.abs2);
            const total = probs.reduce((a,b)=>a+b,0);
            const p0 = probs.reduce((acc,p,idx)=>acc+((idx>>(nQ-1-op.qi)&1)?0:p),0)/total;
            desc=`Measure q[${op.qi}] \u2192 P(0)=${(p0*100).toFixed(1)}%`;
            break;
          }
        }
      } catch(e) { desc = `Error: ${e.message}`; }

      // calc max prob basis state
      const probs = sv.map(C.abs2);
      const maxIdx = probs.indexOf(Math.max(...probs));
      const pct = (probs[maxIdx]*100).toFixed(1);
      log.push({ step:i+1, gate:op.op.toUpperCase(), desc, src:op.src, pct, line:op.line });
    }

    return { sv, log, nQ };
  }

  /* ─── QUBIT BLOCH VECTOR ─── */
  function qubitBloch(sv, nQ, q) {
    // reduced density matrix of qubit q
    const dim = 1<<nQ;
    let r00=[0,0], r01=[0,0], r10=[0,0], r11=[0,0];
    for (let i=0; i<dim; i++) {
      const bi = (i>>(nQ-1-q))&1;
      for (let j=0; j<dim; j++) {
        const bj = (j>>(nQ-1-q))&1;
        // check all other bits match
        const mask = ~(1<<(nQ-1-q)) & (dim-1);
        if ((i&mask) !== (j&mask)) continue;
        const prod = C.mul(sv[i], [sv[j][0],-sv[j][1]]); // sv[i]*conj(sv[j])
        if (bi===0 && bj===0) r00=C.add(r00,prod);
        if (bi===0 && bj===1) r01=C.add(r01,prod);
        if (bi===1 && bj===0) r10=C.add(r10,prod);
        if (bi===1 && bj===1) r11=C.add(r11,prod);
      }
    }
    // Bloch vector: (2Re(r01), -2Im(r01), r00-r11)
    const bx = 2 * r01[0], by = -2 * r01[1], bz = r00[0] - r11[0];
    return { bx, by, bz, r00: r00[0], r11: r11[0] };
  }

  /* ─── DRAW BLOCH SPHERE ─── */
  function drawCodeBloch(canvas, bx, by, bz, qubitIdx, measured) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2, R = Math.min(W,H)/2 - 8;
    ctx.clearRect(0,0,W,H);

    // Sphere fill
    const grd = ctx.createRadialGradient(cx-R*0.3,cy-R*0.3,2,cx,cy,R);
    grd.addColorStop(0,'rgba(34,211,238,0.06)');
    grd.addColorStop(0.7,'rgba(124,58,237,0.04)');
    grd.addColorStop(1,'rgba(5,8,18,0.95)');
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.fillStyle=grd; ctx.fill();
    ctx.strokeStyle='rgba(34,211,238,0.2)'; ctx.lineWidth=1; ctx.stroke();

    // Equator
    ctx.beginPath(); ctx.ellipse(cx,cy,R,R*0.28,0,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=0.8; ctx.stroke();

    // Meridians
    ctx.setLineDash([2,4]);
    ctx.beginPath(); ctx.ellipse(cx,cy,R*0.28,R,0,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=0.8; ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(cx,cy-R); ctx.lineTo(cx,cy+R); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy); ctx.stroke();

    // Axis labels
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='8px JetBrains Mono,monospace'; ctx.textAlign='center';
    ctx.fillText('|0\u27E9',cx,cy-R-4); ctx.fillText('|1\u27E9',cx,cy+R+10);
    ctx.textAlign='right'; ctx.fillText('|+\u27E9',cx-R-3,cy+3);
    ctx.textAlign='left';  ctx.fillText('|-\u27E9',cx+R+3,cy+3);
    ctx.textAlign='center';

    // Bloch vector (project 3D -> 2D: x_screen = cx+bx*R, y_screen = cy-bz*R)
    const ax = cx + bx * R * 0.85;
    const ay = cy - bz * R * 0.85;
    const mag = Math.sqrt(bx*bx+by*by+bz*bz);

    // Glow effect when vector has magnitude
    if (mag > 0.05) {
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
    }

    // Arrow line
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ax,ay);
    const hue = measured ? '#f59e0b' : (mag > 0.95 ? '#22d3ee' : '#c4b5fd');
    ctx.strokeStyle = hue; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.shadowBlur = 0;

    // Arrowhead
    const ang = Math.atan2(ay-cy,ax-cx);
    const aLen = 7;
    ctx.beginPath();
    ctx.moveTo(ax,ay);
    ctx.lineTo(ax-aLen*Math.cos(ang-0.4), ay-aLen*Math.sin(ang-0.4));
    ctx.lineTo(ax-aLen*Math.cos(ang+0.4), ay-aLen*Math.sin(ang+0.4));
    ctx.closePath(); ctx.fillStyle=hue; ctx.fill();

    // Dot at origin
    ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fillStyle=hue; ctx.fill();

    // Phase arc (xy projection)
    if (Math.abs(by) > 0.05 || Math.abs(bx) > 0.05) {
      ctx.beginPath();
      ctx.arc(cx,cy, R*0.4, 0, Math.atan2(-by,-bx)+Math.PI, false);
      ctx.strokeStyle='rgba(251,146,60,0.5)'; ctx.lineWidth=1; ctx.stroke();
    }
  }

  /* ─── DRAW CIRCUIT DIAGRAM ─── */
  function drawCircuitDiagram(canvas, parsed, activeStep) {
    const { nQ, ops } = parsed;
    const ctx = canvas.getContext('2d');
    const lineH = 44, pad = 20, labelW = 40, gateW = 40, gateGap = 8;
    const nOps = ops.length;
    const W = canvas.width = Math.max(labelW + nOps*(gateW+gateGap) + 60, 400);
    const H = canvas.height = nQ * lineH + pad*2;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(0,0,W,H);

    const wireY = (q) => pad + q*lineH + lineH/2;

    // Wires
    for (let q=0; q<nQ; q++) {
      const y = wireY(q);
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(labelW,y); ctx.lineTo(W-20,y); ctx.stroke();
      ctx.fillStyle='#9ba8c4'; ctx.font='11px JetBrains Mono,monospace'; ctx.textAlign='right';
      ctx.fillText(`|q${q}\u27E9`,labelW-4,y+4);
    }

    // Gates
    ops.forEach((op, i) => {
      const x = labelW + i*(gateW+gateGap) + gateGap;
      const isActive = i === activeStep;
      const isDone = activeStep !== undefined ? i < activeStep : true;

      function drawGateBox(qidx, label, color) {
        const y = wireY(qidx);
        const gx = x, gy = y-14, gw=gateW, gh=28;
        // Glow if active
        if (isActive) {
          ctx.shadowColor = color; ctx.shadowBlur = 12;
        }
        ctx.fillStyle = isDone ? `${color}30` : `${color}18`;
        ctx.strokeStyle = isActive ? color : `${color}80`;
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(gx,gy,gw,gh,[5]); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = isActive ? '#fff' : (isDone ? color : '#9ba8c4');
        ctx.font = `${Math.min(12, 32/label.length)}px JetBrains Mono,monospace`;
        ctx.textAlign='center'; ctx.fillText(label, gx+gw/2, gy+17);
      }

      function drawControlLine(q0, q1) {
        const y0=wireY(q0), y1=wireY(q1), xc=x+gateW/2;
        ctx.strokeStyle=isActive?'#22d3ee':'rgba(34,211,238,0.5)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(xc,y0); ctx.lineTo(xc,y1); ctx.stroke();
        ctx.beginPath(); ctx.arc(xc,y0,4,0,Math.PI*2);
        ctx.fillStyle=isActive?'#22d3ee':'rgba(34,211,238,0.6)'; ctx.fill();
      }

      const gateColors = { h:'#c4b5fd',x:'#22d3ee',y:'#34d399',z:'#fb7185',s:'#fbbf24',t:'#fb923c',sdg:'#fbbf24',tdg:'#fb923c',cx:'#22d3ee',cz:'#06b6d4',swap:'#34d399',rx:'#c4b5fd',ry:'#34d399',rz:'#fbbf24',measure:'#fbbf24',ccx:'#22d3ee',cp:'#06b6d4',p:'#fb923c',u1:'#fb923c',id:'#9ba8c4' };
      const clr = gateColors[op.op] || '#9ba8c4';

      if (op.op==='cx') { drawGateBox(op.q1,'⊕',clr); drawControlLine(op.q0,op.q1); }
      else if (op.op==='cz') { drawGateBox(op.q0,'●',clr); drawControlLine(op.q0,op.q1); drawGateBox(op.q1,'Z',clr); }
      else if (op.op==='swap') { drawGateBox(op.q0,'✕',clr); drawGateBox(op.q1,'✕',clr); drawControlLine(op.q0,op.q1); }
      else if (op.op==='ccx') { drawGateBox(op.q2,'⊕',clr); drawControlLine(op.q0,op.q2); drawControlLine(op.q1,op.q2); }
      else if (op.op==='cp') { drawGateBox(op.qargs[0],'●',clr); drawControlLine(op.qargs[0],op.qargs[1]); drawGateBox(op.qargs[1],'P',clr); }
      else if (op.op==='measure') { drawGateBox(op.qi,'M',clr); }
      else if (op.qi !== undefined) { drawGateBox(op.qi, op.op.toUpperCase().slice(0,3), clr); }
      else if (op.qargs) { op.qargs.forEach(qi => drawGateBox(qi, op.op.toUpperCase().slice(0,3), clr)); }
    });

    // Step indicator
    if (activeStep !== undefined && activeStep < ops.length) {
      const sx = labelW + activeStep*(gateW+gateGap) + gateGap + gateW/2;
      ctx.fillStyle='rgba(34,211,238,0.8)';
      ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText('▼', sx, H-5);
    }
  }

  /* ─── DRAW STATE VECTOR ─── */
  function drawStateVector(container, sv, nQ) {
    if (!container) return;
    container.innerHTML = '';
    const dim = Math.min(1<<nQ, 64); // cap at 64 states for display
    for (let i=0; i<dim; i++) {
      const prob = C.abs2(sv[i]);
      const phase = C.phase(sv[i]);
      const h = Math.round(prob * 50);
      const label = i.toString(2).padStart(nQ,'0');
      const item = document.createElement('div');
      item.className = 'code-sv-item';
      // Phase color
      const phaseHue = Math.round(((phase + Math.PI) / (2*Math.PI)) * 360);
      const phaseColor = `hsl(${phaseHue},80%,60%)`;
      item.innerHTML = `
        <div class="code-sv-item__label">|${label}\u27E9</div>
        <div class="code-sv-item__bar-wrap">
          <div class="code-sv-item__bar" style="height:${h}px;background:linear-gradient(to top,#22d3ee,${phaseColor})"></div>
        </div>
        <div class="code-sv-item__phase" style="border-color:${phaseColor};transform:rotate(${-phase}rad)"></div>
        <div class="code-sv-item__val">${(prob*100).toFixed(1)}%</div>`;
      container.appendChild(item);
    }
  }

  /* ─── DRAW HISTOGRAM ─── */
  function drawCodeHistogram(canvas, sv, nQ) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth || 400;
    const H = canvas.height = 110;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(0,0,W,H);
    const dim = Math.min(1<<nQ, 32);
    const probs = Array.from({length:dim},(_,i)=>C.abs2(sv[i]));
    const barW = (W - (dim+1)*3) / dim;
    probs.forEach((p,i) => {
      const x = 3 + i*(barW+3);
      const bh = p*(H-24);
      const label = i.toString(2).padStart(nQ,'0');
      const phase = C.phase(sv[i]);
      const phaseHue = Math.round(((phase+Math.PI)/(2*Math.PI))*360);
      const grd = ctx.createLinearGradient(x,H-22-bh,x,H-22);
      grd.addColorStop(0,`hsl(${phaseHue},80%,65%)`);
      grd.addColorStop(1,'rgba(34,211,238,0.3)');
      ctx.fillStyle=grd;
      ctx.beginPath(); ctx.roundRect(x,H-22-bh,barW,bh,[2,2,0,0]); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font=`${Math.min(9,80/dim)}px JetBrains Mono,monospace`; ctx.textAlign='center';
      ctx.fillText(label, x+barW/2, H-6);
      if (p>0.02) {
        ctx.fillStyle='#f0f4ff'; ctx.font=`${Math.min(8,72/dim)}px JetBrains Mono,monospace`;
        ctx.fillText(`${(p*100).toFixed(0)}%`,x+barW/2,H-25-bh);
      }
    });
    ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(0,H-22,W,1);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='8px sans-serif'; ctx.textAlign='left';
    ctx.fillText('Basis states \u2192',4,H-7);
  }

  /* ─── SYNTAX HIGHLIGHTER (Single-pass safe tokenizer) ─── */
  function highlightQASM(code) {
    const esc = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return esc.replace(
      /(\/\/[^\n]*)|("[^"]*")|(\b(?:OPENQASM|include|qreg|creg|measure|barrier|reset|gate|if)\b)|(\b(?:h|x|y|z|s|t|sdg|tdg|id|sx|sxdg|cx|cz|cy|ch|swap|ccx|toffoli|rx|ry|rz|p|u1|u2|u3|cp|cu|rxx|rzz|ecr)\b)|(\b\d+\.?\d*(?:e[+-]?\d+)?\b)|(-&gt;|;|,|\[|\])/gi,
      (match, comment, str, kw, gate, num, op) => {
        if (comment) return `<span class="tok-comment">${comment}</span>`;
        if (str) return `<span class="tok-str">${str}</span>`;
        if (kw) return `<span class="tok-kw">${kw}</span>`;
        if (gate) return `<span class="tok-gate">${gate}</span>`;
        if (num) return `<span class="tok-num">${num}</span>`;
        if (op) return `<span class="tok-op">${op}</span>`;
        return match;
      }
    );
  }

  /* ─── UPDATE LINE NUMBERS ─── */
  function updateLineNums(code, container) {
    if (!container) return;
    const lines = code.split('\n').length;
    container.textContent = Array.from({length:lines},(_,i)=>i+1).join('\n');
  }

  /* ─── THREE.JS 3D BLOCH SPHERE STUDIO ─── */
  let bloch3D = null;
  let selectedQubit = 0;
  let isAutoRotating = false;

  function initCodeBloch3D() {
    const container = document.getElementById('code-bloch-webgl-mount');
    if (!container || typeof THREE === 'undefined') return;

    container.innerHTML = '';
    const W = container.offsetWidth || 340;
    const H = container.offsetHeight || 330;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const DEFAULT_CAM = new THREE.Vector3(3.6, 2.4, 4.4);
    const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 100);
    camera.position.copy(DEFAULT_CAM);
    camera.lookAt(0, 0, 0);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.6;
    controls.maxDistance = 8.0;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const dl1 = new THREE.DirectionalLight(0xa78bfa, 1.2);
    dl1.position.set(4, 7, 5);
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0x22d3ee, 0.9);
    dl2.position.set(-5, -3, -4);
    scene.add(dl2);

    const blochGroup = new THREE.Group();
    scene.add(blochGroup);
    const R = 1.85;

    // Translucent glass sphere shell
    const shellMat = new THREE.MeshPhongMaterial({
      color: 0x091e3e,
      emissive: 0x040d1a,
      specular: 0x38bdf8,
      shininess: 70,
      transparent: true,
      opacity: 0.45,
      side: THREE.FrontSide,
      depthWrite: false
    });
    blochGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R, 40, 28), shellMat));

    // Darker back shell
    blochGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.992, 28, 20),
      new THREE.MeshBasicMaterial({ color: 0x020712, transparent: true, opacity: 0.60, side: THREE.BackSide, depthWrite: false })
    ));

    // Ring helper
    function makeRing(radius, yPos, color, opacity) {
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, yPos, Math.sin(a) * radius));
      }
      return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }

    // Equator (cyan)
    blochGroup.add(makeRing(R, 0, 0x22d3ee, 0.95));

    // Latitude rings (+-30, +-60 deg)
    [30, -30, 60, -60].forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      const y = Math.sin(rad) * R;
      const rL = Math.cos(rad) * R;
      blochGroup.add(makeRing(rL, y, 0xa855f7, Math.abs(deg) === 30 ? 0.40 : 0.22));
    });

    // Great circles (meridians)
    function makeMeridian(normalVec, color, opacity) {
      const pts = [];
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normalVec.clone().normalize());
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        const v = new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R);
        v.applyQuaternion(q);
        pts.push(v);
      }
      return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }
    blochGroup.add(makeMeridian(new THREE.Vector3(0, 0, 1), 0x6366f1, 0.45)); // X-Z meridian
    blochGroup.add(makeMeridian(new THREE.Vector3(1, 0, 0), 0x8b5cf6, 0.40)); // Y-Z meridian

    // Axes
    const AX = R * 1.32;
    function makeLine(a, b, color, opacity) {
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([a, b]),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }
    function makeCone(pos, dir, color) {
      const L = 0.20;
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.048, L, 12), new THREE.MeshBasicMaterial({ color }));
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      m.position.copy(pos.clone().sub(dir.clone().normalize().multiplyScalar(L * 0.5)));
      return m;
    }

    // Z axis (vertical in Three.js -> |0>, |1>)
    blochGroup.add(makeLine(new THREE.Vector3(0, -AX, 0), new THREE.Vector3(0, AX, 0), 0x38bdf8, 0.90));
    blochGroup.add(makeCone(new THREE.Vector3(0, AX, 0), new THREE.Vector3(0, 1, 0), 0x38bdf8));
    blochGroup.add(makeCone(new THREE.Vector3(0, -AX, 0), new THREE.Vector3(0, -1, 0), 0x38bdf8));

    // X axis (Three.js X -> |+>, |->)
    blochGroup.add(makeLine(new THREE.Vector3(-AX, 0, 0), new THREE.Vector3(AX, 0, 0), 0xf87171, 0.90));
    blochGroup.add(makeCone(new THREE.Vector3(AX, 0, 0), new THREE.Vector3(1, 0, 0), 0xf87171));
    blochGroup.add(makeCone(new THREE.Vector3(-AX, 0, 0), new THREE.Vector3(-1, 0, 0), 0xf87171));

    // Y axis (Three.js Z -> |+i>, |-i>)
    blochGroup.add(makeLine(new THREE.Vector3(0, 0, -AX), new THREE.Vector3(0, 0, AX), 0x34d399, 0.90));
    blochGroup.add(makeCone(new THREE.Vector3(0, 0, AX), new THREE.Vector3(0, 0, 1), 0x34d399));
    blochGroup.add(makeCone(new THREE.Vector3(0, 0, -AX), new THREE.Vector3(0, 0, -1), 0x34d399));

    // Sprite Labels
    function makeLabel(text, hexColor, fsize = 44) {
      const cw = 256, ch = 128;
      const cvs = document.createElement('canvas');
      cvs.width = cw; cvs.height = ch;
      const cctx = cvs.getContext('2d');
      const col = '#' + hexColor.toString(16).padStart(6, '0');
      cctx.shadowColor = col; cctx.shadowBlur = 16;
      cctx.font = `bold ${fsize}px "JetBrains Mono",monospace`;
      cctx.fillStyle = col;
      cctx.textAlign = 'center'; cctx.textBaseline = 'middle';
      cctx.fillText(text, cw / 2, ch / 2);
      const tex = new THREE.CanvasTexture(cvs);
      tex.minFilter = THREE.LinearFilter;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      spr.scale.set(0.68, 0.34, 1);
      return spr;
    }

    const LBL_OFF = 0.26;
    const l0 = makeLabel('|0\u27E9', 0x38bdf8, 48); l0.position.set(0, AX + LBL_OFF, 0); blochGroup.add(l0);
    const l1 = makeLabel('|1\u27E9', 0x38bdf8, 48); l1.position.set(0, -AX - LBL_OFF, 0); blochGroup.add(l1);
    const lP = makeLabel('|+\u27E9', 0xf87171, 44); lP.position.set(AX + LBL_OFF, 0, 0); blochGroup.add(lP);
    const lM = makeLabel('|-\u27E9', 0xf87171, 44); lM.position.set(-AX - LBL_OFF, 0, 0); blochGroup.add(lM);
    const lYp = makeLabel('|+i\u27E9', 0x34d399, 44); lYp.position.set(0, 0, AX + LBL_OFF); blochGroup.add(lYp);
    const lYm = makeLabel('|-i\u27E9', 0x34d399, 44); lYm.position.set(0, 0, -AX - LBL_OFF); blochGroup.add(lYm);

    // Vector group
    const vecGroup = new THREE.Group();
    blochGroup.add(vecGroup);

    vecGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    ));

    const HEAD = 0.28;
    const shaftGeo = new THREE.CylinderGeometry(0.032, 0.032, 1, 16);
    shaftGeo.translate(0, 0.5, 0);
    const shaftMesh = new THREE.Mesh(shaftGeo, new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
    vecGroup.add(shaftMesh);

    const headMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.082, HEAD, 16),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
    );
    vecGroup.add(headMesh);

    const tipDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
    );
    vecGroup.add(tipDot);

    const psiLbl = makeLabel('|\u03C8\u27E9', 0x22d3ee, 46);
    vecGroup.add(psiLbl);

    // Equatorial projection line & disc
    const projGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
    const projLine = new THREE.Line(projGeo, new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.08, gapSize: 0.05, transparent: true, opacity: 0.6 }));
    blochGroup.add(projLine);

    const projDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.7 })
    );
    blochGroup.add(projDot);

    // Interpolation state
    let curV = new THREE.Vector3(0, R, 0);
    let tgtV = new THREE.Vector3(0, R, 0);

    function animate() {
      requestAnimationFrame(animate);

      if (isAutoRotating) {
        blochGroup.rotation.y += 0.006;
      }

      curV.lerp(tgtV, 0.15);

      const len = curV.length();
      if (len < 0.001) {
        vecGroup.visible = false;
        projLine.visible = false;
        projDot.visible = false;
      } else {
        vecGroup.visible = true;
        const dir = curV.clone().normalize();

        shaftMesh.position.set(0, 0, 0);
        shaftMesh.scale.set(1, Math.max(0.01, len - HEAD), 1);
        shaftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        headMesh.position.copy(curV.clone().sub(dir.clone().multiplyScalar(HEAD * 0.5)));
        headMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        tipDot.position.copy(curV);
        psiLbl.position.copy(curV.clone().add(dir.clone().multiplyScalar(0.28)));

        // Update projection down to equator (y = 0)
        projLine.visible = Math.abs(curV.y) > 0.05;
        projDot.visible = Math.abs(curV.y) > 0.05;
        if (projLine.visible) {
          const pBottom = new THREE.Vector3(curV.x, 0, curV.z);
          projLine.geometry.setFromPoints([curV, pBottom]);
          projLine.computeLineDistances();
          projDot.position.copy(pBottom);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function resize() {
      const w = container.offsetWidth || 340;
      const h = container.offsetHeight || 330;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(container);

    const rotBtn = document.getElementById('btn-bloch-autorotate');
    if (rotBtn) {
      rotBtn.addEventListener('click', () => {
        isAutoRotating = !isAutoRotating;
        rotBtn.classList.toggle('active', isAutoRotating);
      });
    }

    const resetCamBtn = document.getElementById('btn-bloch-reset-cam');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        camera.position.copy(DEFAULT_CAM);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        blochGroup.rotation.set(0, 0, 0);
      });
    }

    bloch3D = {
      R,
      setTarget(rx, ry, rz) {
        tgtV.set(rx * R, rz * R, ry * R);
      },
      snapTo(rx, ry, rz) {
        tgtV.set(rx * R, rz * R, ry * R);
        curV.copy(tgtV);
      },
      resize
    };
  }

  function updateBlochHUD(data) {
    if (!data) return;
    const { q, bx, by, bz, r00, r11 } = data;
    const len = Math.sqrt(bx*bx + by*by + bz*bz);
    const pure = len > 0.92;

    const hudQubit = document.getElementById('bloch-hud-qubit');
    const hudPure = document.getElementById('bloch-hud-pure');
    const hudCoords = document.getElementById('bloch-hud-coords');
    const hudAngles = document.getElementById('bloch-hud-angles');
    const hudState = document.getElementById('bloch-hud-state');
    const fill0 = document.getElementById('hud-prob-fill-0');
    const fill1 = document.getElementById('hud-prob-fill-1');
    const pct0 = document.getElementById('hud-prob-pct-0');
    const pct1 = document.getElementById('hud-prob-pct-1');

    if (hudQubit) hudQubit.textContent = `q[${q}]`;
    if (hudPure) {
      if (pure) {
        hudPure.textContent = 'Pure State';
        hudPure.style.color = '#34d399';
        hudPure.style.borderColor = 'rgba(52,211,153,0.3)';
        hudPure.style.background = 'rgba(52,211,153,0.12)';
      } else {
        hudPure.textContent = len < 0.1 ? 'Entangled (Mixed)' : `Mixed (|r|=${len.toFixed(2)})`;
        hudPure.style.color = '#f59e0b';
        hudPure.style.borderColor = 'rgba(245,158,11,0.3)';
        hudPure.style.background = 'rgba(245,158,11,0.12)';
      }
    }
    if (hudCoords) hudCoords.textContent = `r: (${bx.toFixed(2)}, ${by.toFixed(2)}, ${bz.toFixed(2)})`;

    const theta = Math.acos(Math.max(-1, Math.min(1, len > 0.001 ? bz / len : 1))) * (180 / Math.PI);
    let phi = Math.atan2(by, bx) * (180 / Math.PI);
    if (phi < 0) phi += 360;
    if (hudAngles) hudAngles.textContent = `\u03B8: ${theta.toFixed(1)}\u00B0 \u00B7 \u03C6: ${phi.toFixed(1)}\u00B0`;

    if (hudState) {
      const a = Math.cos((theta * Math.PI) / 360);
      const b = Math.sin((theta * Math.PI) / 360);
      hudState.textContent = `|\u03C8\u27E9 = ${a.toFixed(3)}|0\u27E9 + ${b.toFixed(3)}e^(${phi.toFixed(0)}\u00B0)|1\u27E9`;
    }

    const p0 = Math.max(0, Math.min(100, r00 * 100));
    const p1 = Math.max(0, Math.min(100, r11 * 100));
    if (fill0) fill0.style.width = `${p0.toFixed(1)}%`;
    if (fill1) fill1.style.width = `${p1.toFixed(1)}%`;
    if (pct0) pct0.textContent = `${p0.toFixed(0)}%`;
    if (pct1) pct1.textContent = `${p1.toFixed(0)}%`;
  }

  function updateQubitPills(nQ, activeQ, blochList) {
    const container = document.getElementById('code-bloch-qubit-pills');
    if (!container) return;
    container.innerHTML = '';
    if (nQ <= 1) return;

    for (let q = 0; q < nQ; q++) {
      const btn = document.createElement('button');
      btn.className = `bloch-qubit-pill ${q === activeQ ? 'active' : ''}`;
      btn.textContent = `q[${q}]`;
      btn.title = `View qubit ${q} on 3D Bloch sphere`;
      btn.addEventListener('click', () => {
        selectedQubit = q;
        const qData = blochList[q];
        if (bloch3D && qData) bloch3D.setTarget(qData.bx, qData.by, qData.bz);
        updateBlochHUD(qData);
        updateQubitPills(nQ, selectedQubit, blochList);
        document.querySelectorAll('.code-bloch-card').forEach((c, idx) => {
          c.classList.toggle('active', idx === q);
          const b = c.querySelector('.code-bloch-card__badge');
          if (b) b.textContent = idx === q ? '3D Active' : 'View 3D \u2192';
        });
      });
      container.appendChild(btn);
    }
  }

  function updateMultiQubitCards(blochList, activeQ, log, step) {
    const row = document.getElementById('code-bloch-row');
    if (!row) return;
    row.innerHTML = '';
    if (blochList.length <= 1) {
      row.style.display = 'none';
      return;
    }
    row.style.display = 'flex';

    blochList.forEach(({ q, bx, by, bz, r00, r11 }) => {
      const card = document.createElement('div');
      card.className = `code-bloch-card ${q === activeQ ? 'active' : ''}`;
      card.title = `Click to view q[${q}] in 3D`;

      const left = document.createElement('div');
      left.className = 'code-bloch-card__left';
      const lbl = document.createElement('div');
      lbl.className = 'code-bloch-label';
      lbl.textContent = `q[${q}]`;
      const stt = document.createElement('div');
      stt.className = 'code-bloch-state';
      stt.textContent = `P(0)=${(r00*100).toFixed(0)}% P(1)=${(r11*100).toFixed(0)}%`;
      left.append(lbl, stt);

      const cnv = document.createElement('canvas');
      cnv.width = 44; cnv.height = 44;
      cnv.className = 'code-bloch-canvas';

      const badge = document.createElement('span');
      badge.className = 'code-bloch-card__badge';
      badge.textContent = q === activeQ ? '3D Active' : 'View 3D \u2192';

      card.append(cnv, left, badge);
      row.appendChild(card);

      const measured = log.some(l => l.gate === 'MEASURE' && l.desc.includes(`q[${q}]`) && (step === undefined || l.step <= step));
      drawCodeBloch(cnv, bx, by, bz, q, measured);

      card.addEventListener('click', () => {
        selectedQubit = q;
        if (bloch3D) bloch3D.setTarget(bx, by, bz);
        updateBlochHUD({ q, bx, by, bz, r00, r11 });
        updateQubitPills(blochList.length, selectedQubit, blochList);
        document.querySelectorAll('.code-bloch-card').forEach((c, idx) => {
          c.classList.toggle('active', idx === q);
          const b = c.querySelector('.code-bloch-card__badge');
          if (b) b.textContent = idx === q ? '3D Active' : 'View 3D \u2192';
        });
      });
    });
  }

  /* ─── RENDER ALL VISUALS ─── */
  let currentParsed = null;
  let currentStep = undefined;

  function renderVisuals(parsed, step) {
    currentParsed = parsed;
    currentStep = step;
    const { nQ, errors } = parsed;
    const { sv, log } = simulate(parsed, step);

    // Error display
    const errBox = document.getElementById('code-error-box');
    const errMsg = document.getElementById('code-error-msg');
    const statusDot = document.getElementById('code-status-dot');
    const statusMsg = document.getElementById('code-status-msg');
    if (errors.length > 0) {
      errBox.classList.add('visible');
      errMsg.textContent = errors.join(' | ');
      statusDot.className = 'code-status-dot error';
      statusMsg.textContent = `${errors.length} error(s)`;
    } else {
      errBox.classList.remove('visible');
      statusDot.className = 'code-status-dot';
      statusMsg.textContent = step !== undefined
        ? `Step ${step+1}/${parsed.ops.length}`
        : `${parsed.ops.length} gate(s) \u2022 ${nQ} qubit(s) \u2022 OK`;
    }

    // ── Bloch Spheres (3D Three.js + Multi-cards) ──
    const blochList = [];
    for (let q = 0; q < nQ; q++) {
      blochList.push({ q, ...qubitBloch(sv, nQ, q) });
    }

    if (selectedQubit >= nQ) selectedQubit = 0;
    const curQData = blochList[selectedQubit] || { bx: 0, by: 0, bz: 1, r00: 1, r11: 0, q: 0 };

    if (!bloch3D) {
      initCodeBloch3D();
    }
    if (bloch3D) {
      bloch3D.setTarget(curQData.bx, curQData.by, curQData.bz);
    }

    updateBlochHUD(curQData);
    updateQubitPills(nQ, selectedQubit, blochList);
    updateMultiQubitCards(blochList, selectedQubit, log, step);

    // ── Circuit diagram ──
    const circCanvas = document.getElementById('code-circuit-canvas');
    if (circCanvas) drawCircuitDiagram(circCanvas, parsed, step !== undefined ? step : undefined);

    // ── State vector ──
    drawStateVector(document.getElementById('code-sv-grid'), sv, nQ);

    // ── Histogram ──
    drawCodeHistogram(document.getElementById('code-hist-canvas'), sv, nQ);

    // ── Step log ──
    const logContainer = document.getElementById('code-step-log');
    if (logContainer) {
      logContainer.innerHTML = '';
      log.forEach(entry => {
        const row = document.createElement('div');
        const isActive = step !== undefined && entry.step-1 === step;
        row.className = `step-log-entry ${isActive?'step-active':'step-done'}`;
        row.innerHTML = `<span class="step-num">${entry.step}.</span>
          <span class="step-gate">${entry.gate}</span>
          <span class="step-desc">${entry.desc}</span>
          <span class="step-prob">${entry.pct}%</span>`;
        logContainer.appendChild(row);
      });
      if (step !== undefined && step < log.length) {
        logContainer.children[step]?.scrollIntoView({block:'nearest'});
      }
    }
  }

  /* ─── DEBOUNCED UPDATE ─── */
  let debounceTimer;
  function scheduleUpdate(code) {
    clearTimeout(debounceTimer);
    const statusDot = document.getElementById('code-status-dot');
    if (statusDot) statusDot.className = 'code-status-dot running';
    debounceTimer = setTimeout(() => {
      try {
        const parsed = parseQASM(code);
        renderVisuals(parsed, currentStep);
      } catch(e) {
        const errMsg = document.getElementById('code-error-msg');
        const errBox = document.getElementById('code-error-box');
        if (errMsg) errMsg.textContent = `Fatal: ${e.message}`;
        if (errBox) errBox.classList.add('visible');
      }
    }, 180);
  }

  /* ─── WIRE UP TEXTAREA ─── */
  const textarea = document.getElementById('code-textarea');
  const highlightLayer = document.getElementById('code-highlight-layer');
  const lineNums = document.getElementById('code-line-nums');

  function syncEditor(code) {
    if (highlightLayer) highlightLayer.innerHTML = highlightQASM(code);
    updateLineNums(code, lineNums);
    // Sync scroll
    if (highlightLayer && textarea) {
      highlightLayer.scrollTop = textarea.scrollTop;
      highlightLayer.scrollLeft = textarea.scrollLeft;
    }
    if (lineNums && textarea) {
      lineNums.scrollTop = textarea.scrollTop;
    }
  }

  if (textarea) {
    textarea.addEventListener('input', () => {
      syncEditor(textarea.value);
      currentStep = undefined;
      scheduleUpdate(textarea.value);
    });
    textarea.addEventListener('scroll', () => {
      if (highlightLayer) {
        highlightLayer.scrollTop = textarea.scrollTop;
        highlightLayer.scrollLeft = textarea.scrollLeft;
      }
      if (lineNums) {
        lineNums.scrollTop = textarea.scrollTop;
      }
    });
    // Tab key support
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart, end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0,start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start+2;
        syncEditor(textarea.value);
        scheduleUpdate(textarea.value);
      }
      // Ctrl+Enter = run
      if ((e.ctrlKey||e.metaKey) && e.key==='Enter') {
        e.preventDefault();
        currentStep = undefined;
        scheduleUpdate(textarea.value);
      }
    });
  }

  /* ─── ACTION BUTTONS ─── */
  document.getElementById('code-run-btn')?.addEventListener('click', () => {
    currentStep = undefined;
    if (textarea) scheduleUpdate(textarea.value);
  });

  let stepPtr = -1;
  document.getElementById('code-step-btn')?.addEventListener('click', () => {
    if (!currentParsed) return;
    stepPtr = Math.min(stepPtr+1, currentParsed.ops.length-1);
    currentStep = stepPtr;
    renderVisuals(currentParsed, currentStep);
  });

  document.getElementById('code-reset-btn')?.addEventListener('click', () => {
    stepPtr = -1; currentStep = undefined;
    if (currentParsed) renderVisuals(currentParsed, undefined);
  });

  document.getElementById('code-copy-btn')?.addEventListener('click', () => {
    if (textarea) navigator.clipboard?.writeText(textarea.value).then(()=>{
      const btn = document.getElementById('code-copy-btn');
      if (btn) { btn.textContent='Copied!'; setTimeout(()=>btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy',1500); }
    });
  });

  /* ─── PRESET BUTTONS ─── */
  document.querySelectorAll('.code-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.code-preset-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const code = PRESETS[btn.dataset.preset];
      if (code && textarea) {
        textarea.value = code;
        syncEditor(code);
        stepPtr = -1; currentStep = undefined;
        scheduleUpdate(code);
      }
    });
  });

  /* ─── INIT with default preset ─── */
  const defaultCode = PRESETS.superpos;
  if (textarea) {
    textarea.value = defaultCode;
    syncEditor(defaultCode);
    const parsed = parseQASM(defaultCode);
    renderVisuals(parsed, undefined);
  }

  window.refreshCodeEditor = function() {
    if (bloch3D) bloch3D.resize();
    if (textarea) {
      const code = textarea.value;
      syncEditor(code);
      const parsed = parseQASM(code);
      renderVisuals(parsed, currentStep);
    }
  };

})();

