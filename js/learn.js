/* ============================================================
   QUANTUMLAB – LEARN MODULE
   Renders learn categories, topics, and visual lesson modals
   ============================================================ */

window.QL = window.QL || {};

QL.renderLearn = function() {
  const container = document.getElementById('learn-categories');
  if (!container) return;

  container.innerHTML = QL.data.learn.map(cat => `
    <div class="learn-cat anim-hidden" id="learn-cat-${cat.id}">
      <div class="learn-cat__header" data-cat="${cat.id}">
        <div class="learn-cat__icon ${cat.iconClass}">${cat.icon}</div>
        <span class="learn-cat__title">${cat.name}</span>
        <span class="learn-cat__count">${cat.topics.length} topics</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cat-chevron" style="transition:transform 0.25s;flex-shrink:0"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="learn-cat__topics" id="topics-${cat.id}">
        ${cat.topics.map(topic => `
          <div class="learn-topic" data-topic="${topic.id}" data-cat="${cat.id}">
            <span class="learn-topic__dot ${cat.dotClass}"></span>
            <span class="learn-topic__name">${topic.name}</span>
            <span class="learn-topic__arrow">→</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Category toggle (collapsible)
  container.querySelectorAll('.learn-cat__header').forEach(header => {
    header.addEventListener('click', () => {
      const catId = header.dataset.cat;
      const topicsEl = document.getElementById(`topics-${catId}`);
      const chevron = header.querySelector('.cat-chevron');
      const isOpen = topicsEl.style.display !== 'none';
      topicsEl.style.display = isOpen ? 'none' : 'block';
      if (chevron) chevron.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0)';
    });
  });

  // Topic click
  container.querySelectorAll('.learn-topic').forEach(topic => {
    topic.addEventListener('click', () => QL.openLesson(topic.dataset.topic, topic.dataset.cat));
  });
};

QL.openLesson = function(topicId, catId) {
  const cat = QL.data.learn.find(c => c.id === catId);
  const topic = cat ? cat.topics.find(t => t.id === topicId) : null;
  const lessonData = QL.data.lessonContent[topicId];

  const content = document.getElementById('modal-content');
  content.innerHTML = buildLessonContent(topic, lessonData, topicId);
  QL.showModal();

  if (topicId === 'superposition' || topicId === 'qubits' || topicId === 'entanglement') {
    initLessonCanvas(topicId);
  }
};

function buildLessonContent(topic, lessonData, topicId) {
  if (!lessonData) {
    return buildGenericLesson(topic, topicId);
  }

  const stepsHtml = lessonData.steps.map((step, i) => `
    <div class="lesson-step anim-hidden">
      <div class="lesson-step__num">${i + 1}</div>
      <div class="lesson-step__title">${step.title}</div>
      <div class="lesson-step__body">${step.body}</div>
      ${step.viz ? buildStepViz(step.viz, i, topicId) : ''}
    </div>
  `).join('');

  return `
    <div style="margin-bottom:1.5rem">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.3rem">Visual Lesson</div>
      <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.25rem">${lessonData.title}</h2>
      <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
        <span class="exp-card__badge badge--beginner">Interactive</span>
        <span class="exp-card__badge" style="background:rgba(6,182,212,0.1);color:var(--cyan-light);border:1px solid rgba(6,182,212,0.2)">Visual</span>
      </div>
    </div>
    <div class="lesson-flow">${stepsHtml}</div>
    <div class="lesson-challenge" style="margin-top:1.5rem">
      <div class="lesson-challenge__title">
        <span>🏆</span> Mini Challenge
      </div>
      <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:0.75rem">Ready to test your understanding?</p>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn btn--primary btn--sm" onclick="QL.openLabModal('circuit-lab')">Try in Circuit Lab</button>
        <button class="btn btn--ghost btn--sm" onclick="QL.askAI('Explain ${lessonData.title}')">🤖 Ask AI Tutor</button>
      </div>
    </div>
  `;
}

function buildStepViz(viz, idx, topicId) {
  if (viz === 'challenge') {
    return `
      <div class="lesson-step__viz">
        <div style="text-align:center">
          <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.75rem">Try this in the lab →</div>
          <button class="btn btn--primary btn--sm" onclick="QL.openLabModal('circuit-lab')">Open Circuit Lab</button>
        </div>
      </div>
    `;
  }
  if (viz === 'bloch') {
    return `
      <div class="lesson-step__viz" style="min-height:180px">
        <canvas id="lesson-bloch-${idx}" width="180" height="180"></canvas>
      </div>
    `;
  }
  return `
    <div class="lesson-step__viz">
      <div class="lesson-eq">${viz.split('\n').map(l => `<div>${l}</div>`).join('')}</div>
    </div>
  `;
}

function buildGenericLesson(topic, topicId) {
  const genericContent = {
    gates: { desc: 'Quantum gates are unitary operations that transform qubit states. Unlike classical gates, all quantum gates are reversible.', eq: '|ψ⟩ → U|ψ⟩\n\nH: |0⟩ → |+⟩\nX: |0⟩ → |1⟩\nZ: |+⟩ → |-⟩' },
    circuits: { desc: 'Quantum circuits are sequences of gates applied to qubits. They define the computation and can be composed to build algorithms.', eq: 'q0 ──[H]──●──[M]\nq1 ────[X]──[M]' },
    measurement: { desc: 'Measurement projects a qubit from superposition to a definite state. The probability of each outcome is given by the amplitude squared.', eq: 'Measure |ψ⟩ = α|0⟩ + β|1⟩\n\nP(0) = |α|²\nP(1) = |β|²' },
    'rotation-gates': { desc: 'Rotation gates rotate the qubit state around an axis of the Bloch sphere by an angle θ.', eq: 'Rx(θ)|0⟩ → cos(θ/2)|0⟩ - i·sin(θ/2)|1⟩\nRy(θ)|0⟩ → cos(θ/2)|0⟩ + sin(θ/2)|1⟩' },
    'controlled-gates': { desc: 'Controlled gates apply an operation on a target qubit only when the control qubit is |1⟩. CNOT is the most common example.', eq: 'CNOT:\n|00⟩ → |00⟩\n|01⟩ → |01⟩\n|10⟩ → |11⟩\n|11⟩ → |10⟩' },
  };

  const content = genericContent[topicId] || {
    desc: 'An interactive visual lesson for this topic is coming soon. Explore the related experiments and labs to build your intuition.',
    eq: '|ψ⟩ = α|0⟩ + β|1⟩'
  };

  return `
    <div style="margin-bottom:1.5rem">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.3rem">Visual Lesson</div>
      <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.25rem">${topic ? topic.name : 'Lesson'}</h2>
    </div>
    <div class="lesson-flow">
      <div class="lesson-step">
        <div class="lesson-step__num">1</div>
        <div class="lesson-step__title">Concept</div>
        <div class="lesson-step__body">${content.desc}</div>
      </div>
      <div class="lesson-step">
        <div class="lesson-step__num">2</div>
        <div class="lesson-step__title">Mathematical Foundation</div>
        <div class="lesson-step__body">The quantum state is represented in Dirac notation. Here's the key expression:</div>
        <div class="lesson-step__viz">
          <div class="lesson-eq">${content.eq.split('\n').map(l => `<div>${l}</div>`).join('')}</div>
        </div>
      </div>
      <div class="lesson-step">
        <div class="lesson-step__num">3</div>
        <div class="lesson-step__title">Try It Yourself</div>
        <div class="lesson-step__body">Experiment in the virtual labs to build intuition.</div>
        <div class="lesson-step__viz">
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
            <button class="btn btn--primary btn--sm" onclick="QL.openLabModal('circuit-lab')">Open Circuit Lab</button>
            <button class="btn btn--cyan btn--sm" onclick="QL.openLabModal('bloch-sphere')">Open Bloch Lab</button>
          </div>
        </div>
      </div>
    </div>
    <div class="exp-modal__ai-hint" style="margin-top:1.5rem">
      <span>🤖</span>
      <p>Have questions about this concept?</p>
      <button onclick="QL.askAI('Explain ${topic ? topic.name : topicId} in quantum computing')">Ask AI Tutor</button>
    </div>
  `;
}

function initLessonCanvas(topicId) {
  // Find and initialize Bloch sphere canvases in lesson
  document.querySelectorAll('[id^="lesson-bloch-"]').forEach(canvas => {
    QL.BlochSphere(canvas, { animate: true });
  });
}
