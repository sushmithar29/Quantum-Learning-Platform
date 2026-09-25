/* ============================================================
   QUANTUMLAB – LABS (Virtual Labs rendering + modals)
   ============================================================ */

window.QL = window.QL || {};

QL.renderLabs = function() {
  const grid = document.getElementById('labs-grid');
  if (!grid) return;

  const experiments = (window.QL && QL.virtualLabExperiments) ? QL.virtualLabExperiments : (QL.data && QL.data.labs ? QL.data.labs.map((l, i) => ({
    id: l.id,
    number: `0${i + 1}`,
    title: l.name,
    desc: l.desc,
    concept: l.tags.join(' • '),
    category: 'Quantum Physics & Simulation',
    difficulty: i === 3 ? 'Advanced' : (i === 1 ? 'Beginner' : 'Intermediate'),
    duration: '30 mins',
    status: 'Interactive',
    color: l.color || '#7c3aed',
    route: l.id === 'circuit-lab' ? 'circuit-lab.html' : null
  })) : []);

  const isInVlabFolder = window.location.pathname.includes('/virtual-labs/') || window.location.pathname.endsWith('/virtual-labs');

  grid.className = 'vlabs-exp-index';
  grid.innerHTML = experiments.map(exp => {
    let diffClass = 'intermediate';
    if (exp.difficulty && exp.difficulty.toLowerCase().includes('begin')) diffClass = 'beginner';
    if (exp.difficulty && exp.difficulty.toLowerCase().includes('adv')) diffClass = 'advanced';

    // Route calculation
    let openLink = '#';
    let isExternalLink = false;
    const labPageMap = {
      'circuit-lab': 'circuit-lab.html',
      'bloch-sphere': 'bloch-sphere.html',
      'measurement-lab': 'measurement-lab.html',
      'noise-lab': 'noise-lab.html',
      'state-lab': 'state-lab.html'
    };
    if (labPageMap[exp.id]) {
      openLink = isInVlabFolder ? labPageMap[exp.id] : `virtual-labs/${labPageMap[exp.id]}`;
      isExternalLink = true;
    } else if (exp.id === 'stern-gerlach') {
      openLink = isInVlabFolder ? '../experiments/stern-gerlach.html' : 'experiments/stern-gerlach.html';
      isExternalLink = true;
    }

    return `
      <article class="vlabs-exp-item" id="exp-item-${exp.id}" style="--item-color:${exp.color || '#7c3aed'}">
        <div class="vlabs-exp-num">${exp.number}</div>
        
        <div class="vlabs-exp-body">
          <div class="vlabs-exp-meta">
            <span class="vlabs-exp-category">${exp.category || 'Quantum Computing'}</span>
            <span class="vlabs-exp-badge-diff ${diffClass}">${exp.difficulty || 'Intermediate'}</span>
            <span class="vlabs-exp-duration">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${exp.duration || '30 mins'}
            </span>
            <span style="font-size:0.7rem;font-family:var(--font-mono);color:#34d399;display:inline-flex;align-items:center;gap:0.3rem">
              <span style="width:6px;height:6px;border-radius:50%;background:#34d399;box-shadow:0 0 6px #059669"></span>
              ${exp.status || 'Available'}
            </span>
          </div>

          <h3 class="vlabs-exp-title">${exp.title}</h3>
          <p class="vlabs-exp-desc">${exp.desc}</p>

          <div class="vlabs-exp-concept">
            <span style="color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em">Concept:</span>
            <span>${exp.concept || (exp.tags ? exp.tags.join(' • ') : 'Quantum Mechanics')}</span>
          </div>
        </div>

        <div class="vlabs-exp-actions">
          ${isExternalLink ? `
            <a href="${openLink}" class="vlabs-open-exp-btn" id="open-exp-${exp.id}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Open Lab
            </a>
          ` : `
            <button class="vlabs-open-exp-btn" data-modal-lab="${exp.id}" id="open-exp-${exp.id}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Open Lab
            </button>
          `}
          <button class="vlabs-quick-btn" data-modal-lab="${exp.id}" title="Launch Quick Modal Simulation">
            ⚡ Quick Modal
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Click handlers for modal buttons
  grid.querySelectorAll('[data-modal-lab]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const labId = el.dataset.modalLab;
      if (typeof QL.openLabModal === 'function') {
        QL.openLabModal(labId);
      }
    });
  });
};


function labPreviewSVG(lab) {
  const svgs = {
    'circuit-lab': `
      <svg viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        <style>
          .qwire{stroke:rgba(255,255,255,0.15);stroke-width:1;fill:none}
          .gate{rx:4;fill:rgba(124,58,237,0.3);stroke:rgba(124,58,237,0.6);stroke-width:1}
          .gatel{fill:#a78bfa;font:bold 11px monospace}
          .qlbl{fill:rgba(6,182,212,0.8);font:11px monospace}
        </style>
        <line class="qwire" x1="30" y1="35" x2="230" y2="35"/>
        <line class="qwire" x1="30" y1="65" x2="230" y2="65"/>
        <line class="qwire" x1="30" y1="95" x2="230" y2="95"/>
        <text class="qlbl" x="8" y="39">q0</text>
        <text class="qlbl" x="8" y="69">q1</text>
        <text class="qlbl" x="8" y="99">q2</text>
        <rect class="gate" x="55" y="24" width="22" height="22"/>
        <text class="gatel" x="60" y="39">H</text>
        <rect class="gate" x="105" y="24" width="22" height="22"/>
        <text class="gatel" x="108" y="39">X</text>
        <rect class="gate" x="155" y="24" width="22" height="22"/>
        <text class="gatel" x="160" y="39">Z</text>
        <line stroke="rgba(124,58,237,0.5)" stroke-width="1" x1="116" y1="46" x2="116" y2="65"/>
        <circle cx="116" cy="65" r="5" fill="rgba(124,58,237,0.8)" stroke="#a78bfa" stroke-width="1"/>
        <rect class="gate" x="105" y="54" width="22" height="22"/>
        <text class="gatel" x="110" y="69">X</text>
        <rect fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.4)" stroke-width="1" rx="4" x="200" y="24" width="22" height="22"/>
        <text fill="#fbbf24" font="bold 10px monospace" x="204" y="39" style="font:bold 10px monospace">M</text>
        <rect fill="rgba(251,191,36,0.15)" stroke="rgba(251,191,36,0.4)" stroke-width="1" rx="4" x="200" y="54" width="22" height="22"/>
        <text fill="#fbbf24" x="204" y="69" style="font:bold 10px monospace">M</text>
      </svg>`,
    'bloch-sphere': `
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        <circle cx="60" cy="60" r="48" stroke="rgba(124,58,237,0.3)" stroke-width="1" fill="rgba(11,18,33,0.6)"/>
        <ellipse cx="60" cy="60" rx="48" ry="10" stroke="rgba(124,58,237,0.2)" stroke-width="0.8" fill="none"/>
        <ellipse cx="60" cy="60" rx="10" ry="48" stroke="rgba(6,182,212,0.15)" stroke-width="0.8" fill="none"/>
        <line x1="60" y1="12" x2="60" y2="108" stroke="rgba(6,182,212,0.2)" stroke-width="0.8" stroke-dasharray="3,4"/>
        <line x1="12" y1="60" x2="108" y2="60" stroke="rgba(167,139,250,0.2)" stroke-width="0.8" stroke-dasharray="3,4"/>
        <text x="62" y="16" fill="rgba(34,211,238,0.8)" style="font:10px monospace">|0⟩</text>
        <text x="62" y="108" fill="rgba(34,211,238,0.8)" style="font:10px monospace">|1⟩</text>
        <line x1="60" y1="60" x2="85" y2="30" stroke="url(#bg)" stroke-width="2.5"/>
        <defs><linearGradient id="bg" x1="60" y1="60" x2="85" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
        <circle cx="85" cy="30" r="5" fill="#22d3ee"/>
        <text x="90" y="28" fill="rgba(167,139,250,0.9)" style="font:bold 10px monospace">|ψ⟩</text>
      </svg>`,
    'measurement-lab': `
      <svg viewBox="0 0 260 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        <style>.bar{rx:3;opacity:0.85}</style>
        <rect class="bar" x="20" y="40" width="30" height="45" fill="rgba(124,58,237,0.6)" stroke="rgba(124,58,237,0.8)" stroke-width="1"/>
        <rect class="bar" x="60" y="20" width="30" height="65" fill="rgba(6,182,212,0.6)" stroke="rgba(6,182,212,0.8)" stroke-width="1"/>
        <rect class="bar" x="100" y="50" width="30" height="35" fill="rgba(167,139,250,0.6)" stroke="rgba(167,139,250,0.8)" stroke-width="1"/>
        <rect class="bar" x="140" y="30" width="30" height="55" fill="rgba(6,182,212,0.4)" stroke="rgba(6,182,212,0.6)" stroke-width="1"/>
        <rect class="bar" x="180" y="55" width="30" height="30" fill="rgba(124,58,237,0.4)" stroke="rgba(124,58,237,0.6)" stroke-width="1"/>
        <line x1="10" y1="85" x2="250" y2="85" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        <text x="28" y="97" fill="rgba(255,255,255,0.4)" style="font:9px monospace">|00⟩</text>
        <text x="68" y="97" fill="rgba(255,255,255,0.4)" style="font:9px monospace">|01⟩</text>
        <text x="108" y="97" fill="rgba(255,255,255,0.4)" style="font:9px monospace">|10⟩</text>
        <text x="148" y="97" fill="rgba(255,255,255,0.4)" style="font:9px monospace">|11⟩</text>
      </svg>`,
    'noise-lab': `
      <svg viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        <text x="40" y="18" fill="rgba(52,211,153,0.7)" style="font:bold 9px monospace">IDEAL</text>
        <circle cx="65" cy="60" r="35" stroke="rgba(52,211,153,0.25)" stroke-width="1" fill="rgba(11,18,33,0.5)"/>
        <ellipse cx="65" cy="60" rx="35" ry="7" stroke="rgba(52,211,153,0.15)" stroke-width="0.8" fill="none"/>
        <line x1="65" y1="25" x2="85" y2="38" stroke="rgba(52,211,153,0.8)" stroke-width="2.5"/>
        <circle cx="85" cy="38" r="4" fill="#34d399"/>
        <text x="148" y="18" fill="rgba(248,113,113,0.7)" style="font:bold 9px monospace">NOISY</text>
        <circle cx="185" cy="60" r="35" stroke="rgba(225,29,72,0.25)" stroke-width="1" fill="rgba(11,18,33,0.5)"/>
        <ellipse cx="185" cy="60" rx="35" ry="7" stroke="rgba(225,29,72,0.15)" stroke-width="0.8" fill="none"/>
        <line x1="185" y1="25" x2="200" y2="48" stroke="rgba(248,113,113,0.5)" stroke-width="2"/>
        <circle cx="200" cy="48" r="3" fill="rgba(248,113,113,0.6)"/>
        <circle cx="178" cy="44" r="2" fill="rgba(248,113,113,0.3)"/>
        <circle cx="195" cy="58" r="2" fill="rgba(248,113,113,0.3)"/>
        <line x1="128" y1="55" x2="142" y2="55" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        <polygon points="142,51 150,55 142,59" fill="rgba(255,255,255,0.2)"/>
      </svg>`,
    'state-lab': `
      <svg viewBox="0 0 260 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        <text x="10" y="22" fill="rgba(167,139,250,0.8)" style="font:bold 12px monospace">|ψ⟩ = α|0⟩ + β|1⟩</text>
        <rect x="10" y="35" width="100" height="18" rx="4" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.2)" stroke-width="1"/>
        <rect x="10" y="35" width="72" height="18" rx="4" fill="rgba(124,58,237,0.35)"/>
        <text x="15" y="48" fill="rgba(167,139,250,0.9)" style="font:10px monospace">α: 0.71</text>
        <text x="118" y="48" fill="rgba(255,255,255,0.4)" style="font:9px monospace">P(0)=50%</text>
        <rect x="10" y="62" width="100" height="18" rx="4" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.2)" stroke-width="1"/>
        <rect x="10" y="62" width="72" height="18" rx="4" fill="rgba(6,182,212,0.25)"/>
        <text x="15" y="75" fill="rgba(34,211,238,0.9)" style="font:10px monospace">β: 0.71</text>
        <text x="118" y="75" fill="rgba(255,255,255,0.4)" style="font:9px monospace">P(1)=50%</text>
        <circle cx="215" cy="55" r="30" stroke="rgba(124,58,237,0.3)" stroke-width="1" fill="rgba(11,18,33,0.5)"/>
        <line x1="215" y1="25" x2="228" y2="38" stroke="url(#sg)" stroke-width="2"/>
        <defs><linearGradient id="sg" x1="215" y1="25" x2="228" y2="38"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
        <circle cx="228" cy="38" r="4" fill="#22d3ee"/>
      </svg>`
  };
  return svgs[lab.id] || '';
}

function animateLabPreview(container, lab) {
  // Subtle pulse animation on the preview
  let opacity = 0.85;
  let dir = -1;
  function pulse() {
    opacity += dir * 0.003;
    if (opacity <= 0.6) dir = 1;
    if (opacity >= 0.95) dir = -1;
    container.style.opacity = opacity;
    requestAnimationFrame(pulse);
  }
  pulse();
}

/* ---- LAB MODAL CONTENT ---- */
QL.openLabModal = function(labId) {
  const lab = QL.data.labs.find(l => l.id === labId);
  if (!lab) return;
  const content = document.getElementById('modal-content');
  content.innerHTML = buildLabModal(lab);
  QL.showModal();
  QL.initLabInteractions(labId);
};

function buildLabModal(lab) {
  const builders = {
    'circuit-lab': buildCircuitLab,
    'bloch-sphere': buildBlochLab,
    'measurement-lab': buildMeasurementLab,
    'noise-lab': buildNoiseLab,
    'state-lab': buildStateLab
  };
  const builder = builders[lab.id] || buildCircuitLab;
  return `
    <div style="margin-bottom:1.5rem">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.3rem">Virtual Lab</div>
      <h2 style="font-size:1.5rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:0.25rem">${lab.name}</h2>
      <p style="font-size:0.88rem;color:var(--text-secondary)">${lab.desc}</p>
    </div>
    ${builder(lab)}
    <div class="exp-modal__ai-hint" style="margin-top:1.5rem">
      <span>🤖</span>
      <p>Need help with this simulation?</p>
      <button onclick="QL.askAI('Explain ${lab.name}')">Ask about this lab</button>
    </div>
  `;
}

function buildCircuitLab(lab) {
  return `
    <div class="circuit-builder">
      <div class="gate-panel">
        <div class="gate-panel__label">Gates</div>
        ${['H','X','Y','Z','S','T','CNOT','SWAP'].map(g =>
          `<button class="gate-btn" data-gate="${g}" draggable="true">${g}</button>`
        ).join('')}
        <div style="margin-top:0.75rem;border-top:1px solid rgba(255,255,255,0.06);padding-top:0.6rem">
          <button class="gate-btn" id="add-qubit-btn" style="color:var(--cyan-light);border-color:rgba(6,182,212,0.3)">+ Qubit</button>
          <button class="gate-btn" id="clear-circuit-btn" style="color:var(--text-muted);margin-top:0.3rem">Clear</button>
        </div>
      </div>
      <div>
        <div class="circuit-canvas-wrap" id="circuit-canvas">
          <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.75rem">Circuit</div>
          <div id="circuit-lines">
            ${buildCircuitLine('q0', ['H', null, 'M'])}
            ${buildCircuitLine('q1', [null, 'X', 'M'])}
          </div>
          <div style="margin-top:0.75rem;display:flex;gap:0.5rem;align-items:center">
            <button class="algo-run-btn" id="run-circuit-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Run Simulation
            </button>
            <span style="font-size:0.72rem;color:var(--text-muted)" id="circuit-status">Ready</span>
          </div>
        </div>
        <div class="result-grid" id="circuit-results" style="display:none">
          <div class="result-card">
            <div class="result-card__title">Probability</div>
            <div class="prob-bars" id="circuit-prob-bars"></div>
          </div>
          <div class="result-card">
            <div class="result-card__title">State Vector</div>
            <div class="state-vector" id="circuit-state-vec">
              <div><span class="amp">0.707</span> <span class="basis">|00⟩</span></div>
              <div><span class="amp">0.000</span> <span class="basis">|01⟩</span></div>
              <div><span class="amp">0.000</span> <span class="basis">|10⟩</span></div>
              <div><span class="amp">0.707</span> <span class="basis">|11⟩</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildCircuitLine(qbit, gates) {
  const gateEls = gates.map(g => {
    if (!g) return `<span style="display:inline-block;width:32px;height:1px;background:rgba(255,255,255,0.12)"></span>`;
    if (g === 'M') return `<span class="circuit-gate circuit-gate--meas" title="Measure">M</span>`;
    return `<span class="circuit-gate" title="${g} gate">${g}</span>`;
  }).join('');
  return `
    <div class="circuit-line" style="margin-bottom:0.75rem">
      <span class="qbit">${qbit}</span>
      <span style="margin-left:0.35rem;margin-right:0.35rem;font-size:0.7rem;color:var(--text-muted)">──</span>
      ${gateEls}
      <div class="wire"></div>
    </div>
  `;
}

function buildBlochLab(lab) {
  return `
    <div class="bloch-wrap">
      <div class="bloch-controls">
        <div>
          <div class="bloch-control__label">Rotations</div>
          ${[
            { id: 'rx', name: 'X rotation (θ)', min: 0, max: 314, val: 45 },
            { id: 'ry', name: 'Y rotation', min: 0, max: 314, val: 0 },
            { id: 'rz', name: 'Z rotation (φ)', min: 0, max: 628, val: 90 }
          ].map(s => `
            <div class="slider-wrap">
              <div class="slider-row">
                <span class="slider-name">${s.name}</span>
                <span class="slider-val" id="${s.id}-val">${s.val}°</span>
              </div>
              <input type="range" class="range-input" id="${s.id}-slider" min="${s.min}" max="${s.max}" value="${s.val}" />
            </div>
          `).join('')}
        </div>
        <div>
          <div class="bloch-control__label" style="margin-top:0.75rem">Apply Gate</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.35rem">
            ${['H','X','Y','Z','S','T'].map(g =>
              `<button class="gate-btn bloch-gate-btn" style="width:auto;padding:0.3rem 0.6rem" data-gate="${g}">${g}</button>`
            ).join('')}
          </div>
        </div>
        <div style="margin-top:0.75rem">
          <div class="bloch-control__label">State</div>
          <div class="state-vector" id="bloch-state-vec" style="font-size:0.75rem">
            <div><span class="amp">0.707</span> <span class="basis">|0⟩</span></div>
            <div><span class="amp">0.707</span> <span class="basis">|1⟩</span></div>
          </div>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1rem">
        <canvas id="bloch-lab-canvas" width="280" height="280" style="max-width:100%"></canvas>
        <div class="prob-bars" style="width:100%;max-width:260px" id="bloch-probs">
          <div class="prob-bar__row">
            <span class="prob-bar__label">|0⟩</span>
            <div class="prob-bar__track"><div class="prob-bar__fill" id="bloch-p0" style="width:50%"></div></div>
            <span class="prob-bar__pct" id="bloch-p0-txt">50%</span>
          </div>
          <div class="prob-bar__row">
            <span class="prob-bar__label">|1⟩</span>
            <div class="prob-bar__track"><div class="prob-bar__fill" id="bloch-p1" style="width:50%;background:linear-gradient(90deg,#06b6d4,#7c3aed)"></div></div>
            <span class="prob-bar__pct" id="bloch-p1-txt">50%</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildMeasurementLab(lab) {
  return `
    <div class="meas-lab">
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <div>
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.5rem">Measurement Basis</div>
          <div class="meas-basis-btns">
            <button class="basis-btn active" data-basis="Z">Z</button>
            <button class="basis-btn" data-basis="X">X</button>
            <button class="basis-btn" data-basis="Y">Y</button>
          </div>
        </div>
        <div>
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.5rem">Qubit State</div>
          <div class="meas-basis-btns">
            ${['|0⟩','|1⟩','|+⟩','|-⟩'].map((s,i) =>
              `<button class="basis-btn ${i===2?'active':''}" data-state="${s}">${s}</button>`
            ).join('')}
          </div>
        </div>
      </div>
      <div>
        <div class="shots-row">
          <span class="shots-label">Shots:</span>
          <input type="range" id="shots-slider" min="10" max="1000" value="100" class="range-input" style="flex:1" />
          <span class="shots-val" id="shots-val">100</span>
        </div>
      </div>
      <div>
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.75rem">Results</div>
        <div class="meas-results" id="meas-results">
          <div class="prob-bar__row">
            <span class="prob-bar__label">|0⟩</span>
            <div class="prob-bar__track"><div class="prob-bar__fill" id="meas-p0" style="width:50%"></div></div>
            <span class="prob-bar__pct" id="meas-p0-txt">50%</span>
          </div>
          <div class="prob-bar__row">
            <span class="prob-bar__label">|1⟩</span>
            <div class="prob-bar__track"><div class="prob-bar__fill" id="meas-p1" style="width:50%;background:linear-gradient(90deg,#06b6d4,#7c3aed)"></div></div>
            <span class="prob-bar__pct" id="meas-p1-txt">50%</span>
          </div>
        </div>
        <button class="algo-run-btn" id="run-meas-btn" style="margin-top:1rem">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Measure
        </button>
      </div>
      <div style="margin-top:0.5rem">
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.5rem">Measurement History</div>
        <div id="meas-history" style="display:flex;flex-wrap:wrap;gap:3px;max-height:60px;overflow-y:auto"></div>
      </div>
    </div>
  `;
}

function buildNoiseLab(lab) {
  const noises = [
    { id: 'bit-flip', name: 'Bit Flip', val: 0 },
    { id: 'phase-flip', name: 'Phase Flip', val: 0 },
    { id: 'depolarizing', name: 'Depolarizing', val: 0 },
    { id: 'amp-damping', name: 'Amplitude Damping', val: 0 }
  ];
  return `
    <div class="noise-lab">
      <div class="noise-controls">
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.5rem">Noise Parameters</div>
        ${noises.map(n => `
          <div class="noise-control">
            <div class="noise-control__name">
              ${n.name}
              <span class="noise-control__val" id="${n.id}-val">0%</span>
            </div>
            <input type="range" id="${n.id}-slider" min="0" max="100" value="0" class="range-input"/>
          </div>
        `).join('')}
        <button class="algo-run-btn" id="apply-noise-btn" style="margin-top:0.5rem;width:100%;justify-content:center">Apply Noise</button>
      </div>
      <div>
        <div class="noise-compare">
          <div class="noise-panel">
            <div class="noise-panel__label">Without Noise</div>
            <canvas id="noise-ideal-canvas" width="160" height="160"></canvas>
            <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:0.5rem">Fidelity: <span style="color:#34d399" id="ideal-fid">1.00</span></div>
          </div>
          <div class="noise-panel">
            <div class="noise-panel__label">With Noise</div>
            <canvas id="noise-noisy-canvas" width="160" height="160"></canvas>
            <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:0.5rem">Fidelity: <span style="color:#f87171" id="noisy-fid">1.00</span></div>
          </div>
        </div>
        <div class="result-card" style="margin-top:1rem">
          <div class="result-card__title">Effect on State</div>
          <div class="prob-bars" id="noise-probs">
            <div class="prob-bar__row">
              <span class="prob-bar__label">|0⟩</span>
              <div class="prob-bar__track"><div class="prob-bar__fill" id="noise-p0" style="width:70%"></div></div>
              <span class="prob-bar__pct" id="noise-p0-txt">70%</span>
            </div>
            <div class="prob-bar__row">
              <span class="prob-bar__label">|1⟩</span>
              <div class="prob-bar__track"><div class="prob-bar__fill" id="noise-p1" style="width:30%;background:linear-gradient(90deg,#06b6d4,#7c3aed)"></div></div>
              <span class="prob-bar__pct" id="noise-p1-txt">30%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildStateLab(lab) {
  const states = [
    { ket: '|0⟩', a0: '1', a1: '0', p0: 100, p1: 0 },
    { ket: '|1⟩', a0: '0', a1: '1', p0: 0, p1: 100 },
    { ket: '|+⟩', a0: '1/√2', a1: '1/√2', p0: 50, p1: 50 },
    { ket: '|-⟩', a0: '1/√2', a1: '-1/√2', p0: 50, p1: 50 },
    { ket: '|i⟩', a0: '1/√2', a1: 'i/√2', p0: 50, p1: 50 }
  ];
  return `
    <div class="state-explorer">
      <div class="state-selector">
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.5rem">Select State</div>
        ${states.map((s,i) => `
          <div class="state-btn ${i===2?'active':''}" data-state-idx="${i}" data-p0="${s.p0}" data-p1="${s.p1}">
            <span class="state-btn__ket">${s.ket}</span>
            <span class="state-btn__label">α=${s.a0}, β=${s.a1}</span>
          </div>
        `).join('')}
        <div style="margin-top:0.75rem;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted)">Custom Phase</div>
        <div class="slider-wrap">
          <div class="slider-row">
            <span class="slider-name">θ (polar angle)</span>
            <span class="slider-val" id="state-theta-val">90°</span>
          </div>
          <input type="range" id="state-theta-slider" min="0" max="180" value="90" class="range-input" />
        </div>
        <div class="slider-wrap">
          <div class="slider-row">
            <span class="slider-name">φ (azimuth)</span>
            <span class="slider-val" id="state-phi-val">0°</span>
          </div>
          <input type="range" id="state-phi-slider" min="0" max="360" value="0" class="range-input" />
        </div>
      </div>
      <div class="state-info">
        <canvas id="state-bloch-canvas" width="240" height="240" style="max-width:100%"></canvas>
        <div class="state-amp-grid">
          <div class="amp-card">
            <div class="amp-card__ket">|0⟩</div>
            <div class="amp-card__val" id="state-a0">1/√2</div>
            <div class="amp-card__prob" id="state-p0">P = 50%</div>
          </div>
          <div class="amp-card">
            <div class="amp-card__ket">|1⟩</div>
            <div class="amp-card__val" id="state-a1">1/√2</div>
            <div class="amp-card__prob" id="state-p1">P = 50%</div>
          </div>
        </div>
        <div class="prob-bars" id="state-probs">
          <div class="prob-bar__row">
            <span class="prob-bar__label">|0⟩</span>
            <div class="prob-bar__track"><div class="prob-bar__fill" id="state-bar-p0" style="width:50%"></div></div>
            <span class="prob-bar__pct" id="state-bar-p0-txt">50%</span>
          </div>
          <div class="prob-bar__row">
            <span class="prob-bar__label">|1⟩</span>
            <div class="prob-bar__track"><div class="prob-bar__fill" id="state-bar-p1" style="width:50%;background:linear-gradient(90deg,#06b6d4,#7c3aed)"></div></div>
            <span class="prob-bar__pct" id="state-bar-p1-txt">50%</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ---- LAB INTERACTIONS ---- */
QL.initLabInteractions = function(labId) {
  if (labId === 'circuit-lab') initCircuitLab();
  if (labId === 'bloch-sphere') initBlochLab();
  if (labId === 'measurement-lab') initMeasurementLab();
  if (labId === 'noise-lab') initNoiseLab();
  if (labId === 'state-lab') initStateLab();
};

function initCircuitLab() {
  const runBtn = document.getElementById('run-circuit-btn');
  const clearBtn = document.getElementById('clear-circuit-btn');
  const addQubitBtn = document.getElementById('add-qubit-btn');
  const status = document.getElementById('circuit-status');
  const results = document.getElementById('circuit-results');

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      status.textContent = 'Simulating...';
      status.style.color = 'var(--cyan-light)';
      setTimeout(() => {
        status.textContent = 'Done ✓';
        status.style.color = '#34d399';
        results.style.display = 'grid';
        const bars = document.getElementById('circuit-prob-bars');
        bars.innerHTML = [
          { label: '|00⟩', pct: 50 }, { label: '|01⟩', pct: 0 },
          { label: '|10⟩', pct: 0 }, { label: '|11⟩', pct: 50 }
        ].map(b => `
          <div class="prob-bar__row">
            <span class="prob-bar__label" style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted);width:40px">${b.label}</span>
            <div class="prob-bar__track" style="flex:1;height:8px;background:rgba(255,255,255,0.06);border-radius:4px">
              <div class="prob-bar__fill" style="width:${b.pct}%;height:100%;border-radius:4px;background:linear-gradient(90deg,#7c3aed,#06b6d4);transition:width 1s"></div>
            </div>
            <span class="prob-bar__pct" style="font-size:0.72rem;color:var(--text-secondary);width:36px">${b.pct}%</span>
          </div>
        `).join('');
      }, 800);
    });
  }

  if (addQubitBtn) {
    let qubitCount = 2;
    addQubitBtn.addEventListener('click', () => {
      if (qubitCount >= 4) return;
      qubitCount++;
      const lines = document.getElementById('circuit-lines');
      const newLine = document.createElement('div');
      newLine.innerHTML = buildCircuitLine(`q${qubitCount-1}`, [null, null, 'M']);
      lines.appendChild(newLine.firstElementChild);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const lines = document.getElementById('circuit-lines');
      lines.innerHTML = buildCircuitLine('q0', [null, null, 'M']) + buildCircuitLine('q1', [null, null, 'M']);
      if (results) results.style.display = 'none';
      if (status) { status.textContent = 'Cleared'; status.style.color = 'var(--text-muted)'; }
    });
  }
}

function initBlochLab() {
  const canvas = document.getElementById('bloch-lab-canvas');
  if (!canvas) return;
  const sphere = QL.BlochSphere(canvas, { animate: false });
  let theta = Math.PI / 4, phi = 0;

  const rxSlider = document.getElementById('rx-slider');
  const rzSlider = document.getElementById('rz-slider');

  function updateSphere() {
    sphere.setAngles(theta, phi);
    const p0 = Math.round(Math.cos(theta/2) ** 2 * 100);
    const p1 = 100 - p0;
    document.getElementById('bloch-p0').style.width = p0 + '%';
    document.getElementById('bloch-p1').style.width = p1 + '%';
    document.getElementById('bloch-p0-txt').textContent = p0 + '%';
    document.getElementById('bloch-p1-txt').textContent = p1 + '%';
  }

  if (rxSlider) rxSlider.addEventListener('input', e => {
    theta = (e.target.value / 100) * Math.PI / 2;
    document.getElementById('rx-val').textContent = e.target.value + '°';
    updateSphere();
  });
  if (rzSlider) rzSlider.addEventListener('input', e => {
    phi = (e.target.value / 100) * Math.PI;
    document.getElementById('rz-val').textContent = e.target.value + '°';
    updateSphere();
  });

  document.querySelectorAll('.bloch-gate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gate = btn.dataset.gate;
      if (gate === 'H') { theta = Math.PI/2; phi = 0; }
      if (gate === 'X') theta = Math.PI - theta;
      if (gate === 'Y') { theta = Math.PI - theta; phi += Math.PI; }
      if (gate === 'Z') phi += Math.PI;
      if (gate === 'S') phi += Math.PI / 2;
      if (gate === 'T') phi += Math.PI / 4;
      updateSphere();
    });
  });

  // Draw initial
  sphere.setAngles(theta, phi);
  // Start animation loop for bloch
  let raf2;
  function animTick() {
    sphere.setAngles(theta, phi);
    raf2 = requestAnimationFrame(animTick);
  }
  animTick();
}

function initMeasurementLab() {
  const stateProbs = { '|0⟩': [100,0], '|1⟩': [0,100], '|+⟩': [50,50], '|-⟩': [50,50] };
  let currentState = '|+⟩';
  let shots = 100;
  let history = [];

  document.querySelectorAll('[data-state]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-state]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentState = btn.dataset.state;
    });
  });

  document.querySelectorAll('.basis-btn[data-basis]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.basis-btn[data-basis]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const shotsSlider = document.getElementById('shots-slider');
  if (shotsSlider) shotsSlider.addEventListener('input', e => {
    shots = parseInt(e.target.value);
    document.getElementById('shots-val').textContent = shots;
  });

  const runBtn = document.getElementById('run-meas-btn');
  if (runBtn) runBtn.addEventListener('click', () => {
    const probs = stateProbs[currentState] || [50, 50];
    let count0 = 0;
    const newHistory = [];
    for (let i = 0; i < shots; i++) {
      const outcome = Math.random() * 100 < probs[0] ? 0 : 1;
      if (outcome === 0) count0++;
      newHistory.push(outcome);
    }
    history = [...history, ...newHistory].slice(-200);
    const p0 = Math.round(count0 / shots * 100);
    const p1 = 100 - p0;
    document.getElementById('meas-p0').style.width = p0 + '%';
    document.getElementById('meas-p1').style.width = p1 + '%';
    document.getElementById('meas-p0-txt').textContent = p0 + '%';
    document.getElementById('meas-p1-txt').textContent = p1 + '%';

    const histEl = document.getElementById('meas-history');
    if (histEl) {
      histEl.innerHTML = history.map(h =>
        `<span style="width:10px;height:10px;border-radius:2px;background:${h===0?'rgba(124,58,237,0.6)':'rgba(6,182,212,0.6)'};display:inline-block" title="${h}"></span>`
      ).join('');
    }
  });
}

function initNoiseLab() {
  ['bit-flip','phase-flip','depolarizing','amp-damping'].forEach(id => {
    const slider = document.getElementById(`${id}-slider`);
    if (slider) slider.addEventListener('input', e => {
      document.getElementById(`${id}-val`).textContent = e.target.value + '%';
    });
  });

  const applyBtn = document.getElementById('apply-noise-btn');
  if (applyBtn) applyBtn.addEventListener('click', () => {
    const bf = parseInt(document.getElementById('bit-flip-slider')?.value || 0);
    const pf = parseInt(document.getElementById('phase-flip-slider')?.value || 0);
    const dp = parseInt(document.getElementById('depolarizing-slider')?.value || 0);
    const ad = parseInt(document.getElementById('amp-damping-slider')?.value || 0);
    const totalNoise = (bf + pf + dp + ad) / 4;
    const fidelity = Math.max(0, 1 - totalNoise / 150).toFixed(2);

    document.getElementById('noisy-fid').textContent = fidelity;
    const p0 = Math.round(70 - totalNoise * 0.3 + Math.random() * 5);
    const p1 = 100 - p0;
    document.getElementById('noise-p0').style.width = p0 + '%';
    document.getElementById('noise-p1').style.width = p1 + '%';
    document.getElementById('noise-p0-txt').textContent = p0 + '%';
    document.getElementById('noise-p1-txt').textContent = p1 + '%';

    // Draw both Bloch spheres
    const idealCanvas = document.getElementById('noise-ideal-canvas');
    const noisyCanvas = document.getElementById('noise-noisy-canvas');
    if (idealCanvas) QL.BlochSphere(idealCanvas, { animate: false, theta: Math.PI/4, phi: 0 });
    if (noisyCanvas) {
      const noisyTheta = Math.PI/4 + (totalNoise / 100) * 0.8;
      QL.BlochSphere(noisyCanvas, { animate: false, theta: noisyTheta, phi: (totalNoise/100) * Math.PI });
    }
  });
}

function initStateLab() {
  let theta = Math.PI / 2, phi = 0;
  const canvas = document.getElementById('state-bloch-canvas');
  let sphere = canvas ? QL.BlochSphere(canvas, { animate: false }) : null;

  function updateDisplay(p0, p1) {
    document.getElementById('state-bar-p0').style.width = p0 + '%';
    document.getElementById('state-bar-p1').style.width = p1 + '%';
    document.getElementById('state-bar-p0-txt').textContent = p0 + '%';
    document.getElementById('state-bar-p1-txt').textContent = p1 + '%';
    document.getElementById('state-p0').textContent = 'P = ' + p0 + '%';
    document.getElementById('state-p1').textContent = 'P = ' + p1 + '%';
    if (sphere) sphere.setAngles(theta, phi);
  }

  document.querySelectorAll('.state-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.state-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p0 = parseInt(btn.dataset.p0), p1 = parseInt(btn.dataset.p1);
      theta = Math.acos(1 - 2 * p1 / 100);
      updateDisplay(p0, p1);
    });
  });

  const thetaSlider = document.getElementById('state-theta-slider');
  const phiSlider = document.getElementById('state-phi-slider');

  if (thetaSlider) thetaSlider.addEventListener('input', e => {
    theta = (e.target.value / 180) * Math.PI;
    document.getElementById('state-theta-val').textContent = e.target.value + '°';
    const p0 = Math.round(Math.cos(theta/2)**2 * 100);
    updateDisplay(p0, 100-p0);
  });
  if (phiSlider) phiSlider.addEventListener('input', e => {
    phi = (e.target.value / 360) * 2 * Math.PI;
    document.getElementById('state-phi-val').textContent = e.target.value + '°';
    if (sphere) sphere.setAngles(theta, phi);
  });

  updateDisplay(50, 50);
}
