/* ============================================================
   QUANTUMLAB – ALGORITHMS MODULE
   Renders algorithm cards + algorithm workspace modal
   ============================================================ */

window.QL = window.QL || {};

QL.renderAlgorithms = function() {
  const track = document.getElementById('algorithms-track');
  if (!track) return;

  track.innerHTML = QL.data.algorithms.map(algo => `
    <div class="algo-card anim-hidden" data-algo="${algo.id}" id="algo-card-${algo.id}">
      <div class="algo-card__circuit">
        ${algo.circuit.map(line => formatCircuitLine(line)).join('<br>')}
      </div>
      <div class="algo-card__name">${algo.name}</div>
      <div class="algo-card__desc">${algo.desc}</div>
      <div class="algo-card__footer">
        <span class="exp-card__badge badge--${algo.level.toLowerCase()}">${algo.level}</span>
        <span class="algo-card__run">
          Run
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </div>
  `).join('');

  // Click navigates to dedicated algorithm explorer page
  track.querySelectorAll('.algo-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `algorithms/${card.dataset.algo}.html`;
    });
  });

  // Carousel
  QL.initCarousel('algorithms-track', 'algo-prev', 'algo-next');
};

function formatCircuitLine(line) {
  return line
    .replace(/\[([^\]]+)\]/g, '<span class="gate">[$1]</span>')
    .replace(/(q\d+|n\d+|q \d+[^\-])/g, '<span class="hl">$1</span>');
}

QL.openAlgoModal = function(algoId) {
  const algo = QL.data.algorithms.find(a => a.id === algoId);
  if (!algo) return;
  const content = document.getElementById('modal-content');
  content.innerHTML = buildAlgoWorkspace(algo);
  QL.showModal();
  initAlgoWorkspace(algo);
};

function buildAlgoWorkspace(algo) {
  const stepsHtml = algo.steps.map((step, i) => `
    <div class="algo-step ${i === 0 ? 'active' : ''}" data-step="${i}">
      <div class="algo-step__num">Step ${i + 1}</div>
      <div class="algo-step__name">${step}</div>
    </div>
  `).join('');

  const circuitHtml = algo.circuit.map(line =>
    `<div class="circuit-display-line">${formatCircuitLine(line)}</div>`
  ).join('');

  return `
    <div style="margin-bottom:1.5rem">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.3rem">Algorithm Workspace</div>
      <h2 style="font-size:1.4rem;font-weight:700;margin-bottom:0.25rem">${algo.name}</h2>
      <p style="font-size:0.88rem;color:var(--text-secondary)">${algo.desc}</p>
    </div>

    <div class="algo-workspace">
      <div>
        <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.6rem">Steps</div>
        <div class="algo-steps" id="algo-steps">${stepsHtml}</div>
      </div>

      <div class="algo-main">
        <div>
          <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.5rem">
            Quantum Circuit
            <span style="color:var(--cyan-light);margin-left:0.5rem" id="active-step-label">Step 1: ${algo.steps[0]}</span>
          </div>
          <div class="algo-circuit-view" id="algo-circuit">${circuitHtml}</div>
        </div>

        <div class="algo-result-panel">
          <div class="algo-result-panel__title">Simulation</div>
          <button class="algo-run-btn" id="algo-run-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Run Algorithm
          </button>
          <div id="algo-result-output" style="display:none">
            <div class="prob-bars" id="algo-prob-bars"></div>
            <div class="state-vector" id="algo-state-vec" style="margin-top:0.75rem;font-size:0.78rem"></div>
          </div>
        </div>

        <div class="exp-modal__ai-hint">
          <span>🤖</span>
          <p>Why does this algorithm achieve quantum speedup?</p>
          <button id="algo-explain-btn">Explain this result</button>
        </div>
      </div>
    </div>
  `;
}

function initAlgoWorkspace(algo) {
  // Step navigation
  document.querySelectorAll('.algo-step').forEach(step => {
    step.addEventListener('click', () => {
      const idx = parseInt(step.dataset.step);
      document.querySelectorAll('.algo-step').forEach(s => s.classList.remove('active'));
      step.classList.add('active');

      const label = document.getElementById('active-step-label');
      if (label) label.textContent = `Step ${idx + 1}: ${algo.steps[idx]}`;

      // Highlight circuit line
      const circuit = document.getElementById('algo-circuit');
      if (circuit) {
        circuit.querySelectorAll('.circuit-display-line').forEach((line, i) => {
          line.style.background = '';
          line.style.borderRadius = '';
          line.style.padding = '';
          line.style.color = '';
        });
        const targetLine = circuit.querySelectorAll('.circuit-display-line')[Math.min(idx, algo.circuit.length - 1)];
        if (targetLine) {
          targetLine.style.background = 'rgba(6,182,212,0.08)';
          targetLine.style.borderRadius = '4px';
          targetLine.style.padding = '2px 4px';
          targetLine.style.color = 'var(--cyan-light)';
        }
      }
    });
  });

  // Run
  const runBtn = document.getElementById('algo-run-btn');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runBtn.textContent = 'Simulating...';
      runBtn.disabled = true;
      setTimeout(() => {
        runBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Done`;
        runBtn.style.background = 'linear-gradient(135deg, #059669, #0891b2)';

        const output = document.getElementById('algo-result-output');
        if (output) output.style.display = 'block';

        const results = getAlgoResults(algo.id);
        const barsEl = document.getElementById('algo-prob-bars');
        if (barsEl) {
          barsEl.innerHTML = results.probs.map(p => `
            <div class="prob-bar__row">
              <span class="prob-bar__label" style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);width:48px">${p.label}</span>
              <div class="prob-bar__track" style="flex:1;height:8px;background:rgba(255,255,255,0.06);border-radius:4px">
                <div class="prob-bar__fill" style="width:${p.pct}%;height:100%;border-radius:4px;background:linear-gradient(90deg,#7c3aed,#06b6d4);transition:width 1s"></div>
              </div>
              <span class="prob-bar__pct" style="font-size:0.72rem;color:var(--text-secondary);width:36px">${p.pct}%</span>
            </div>
          `).join('');
        }

        const stateEl = document.getElementById('algo-state-vec');
        if (stateEl) stateEl.innerHTML = results.stateVec;

        // Auto-advance to final step
        const lastStep = document.querySelector(`.algo-step[data-step="${algo.steps.length - 1}"]`);
        if (lastStep) lastStep.click();

      }, 1200);
    });
  }

  // Explain
  const explainBtn = document.getElementById('algo-explain-btn');
  if (explainBtn) {
    explainBtn.addEventListener('click', () => QL.askAI(`Explain why ${algo.name} achieves quantum speedup`));
  }
}

function getAlgoResults(algoId) {
  const results = {
    'grover': {
      probs: [{ label: '|00⟩', pct: 3 }, { label: '|01⟩', pct: 3 }, { label: '|10⟩', pct: 3 }, { label: '|11⟩', pct: 91 }],
      stateVec: '<div><span class="amp">0.087</span> <span class="basis">|00⟩</span></div><div><span class="amp">0.087</span> <span class="basis">|01⟩</span></div><div><span class="amp">0.087</span> <span class="basis">|10⟩</span></div><div style="color:var(--cyan-light)"><span class="amp" style="color:#22d3ee">0.954</span> <span class="basis">|11⟩</span> ← marked</div>'
    },
    'deutsch-jozsa': {
      probs: [{ label: '|0⟩', pct: 100 }, { label: '|1⟩', pct: 0 }],
      stateVec: '<div style="color:#34d399">Function is <span style="font-weight:700">CONSTANT</span></div><div style="margin-top:0.3rem"><span class="amp">1.000</span> <span class="basis">|0⟩</span></div>'
    },
    'qft': {
      probs: [{ label: '|000⟩', pct: 12 }, { label: '|001⟩', pct: 12 }, { label: '|010⟩', pct: 12 }, { label: '|011⟩', pct: 12 }, { label: '|100⟩', pct: 12 }, { label: '|101⟩', pct: 13 }, { label: '|110⟩', pct: 13 }, { label: '|111⟩', pct: 14 }],
      stateVec: '<div>QFT applied — uniform superposition in frequency basis</div><div style="margin-top:0.3rem"><span class="amp">0.354</span> <span class="basis">|k⟩</span> for each k</div>'
    },
    'default': {
      probs: [{ label: '|0⟩', pct: 50 }, { label: '|1⟩', pct: 50 }],
      stateVec: '<div><span class="amp">0.707</span> <span class="basis">|0⟩</span></div><div><span class="amp">0.707</span> <span class="basis">|1⟩</span></div>'
    }
  };
  return results[algoId] || results['default'];
}
