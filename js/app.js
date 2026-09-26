/* ============================================================
   QUANTUMLAB – APP.JS  (main orchestrator)
   ============================================================ */

window.QL = window.QL || {};

/* ============================================================
   EXPERIMENT CARDS
   ============================================================ */
QL.renderExperiments = function () {
  const track = document.getElementById('experiments-track');
  if (!track) return;

  track.innerHTML = QL.data.experiments.map((exp, i) => `
    <div class="exp-card anim-hidden" data-exp="${exp.id}" data-level="${exp.level}" id="exp-card-${exp.id}" style="animation-delay:${i * 0.07}s">
      <div class="exp-card__viz">
        <canvas id="exp-viz-${exp.id}" width="260" height="140"></canvas>
      </div>
      <div class="exp-card__body">
        <div class="exp-card__name">${exp.name}</div>
        <div class="exp-card__desc">${exp.desc}</div>
        <div class="exp-card__footer">
          <span class="exp-card__badge badge--${exp.level.toLowerCase()}">${exp.level}</span>
          <span class="exp-card__explore">
            Explore
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </div>
  `).join('');

  // Init mini visualizations
  QL.data.experiments.forEach(exp => {
    const canvas = document.getElementById(`exp-viz-${exp.id}`);
    if (canvas) QL.ExperimentViz.init(canvas, exp.animType);
  });

  // Dynamic counter on experiments page
  const counterText = document.getElementById('exp-counter-text');
  if (counterText) {
    counterText.textContent = `${QL.data.experiments.length} Experiments Available`;
  }

  // Click handlers — Stern–Gerlach opens its dedicated Virtual Lab
  const inExpDir = window.location.pathname.includes('/experiments/') ||
                   window.location.pathname.endsWith('/experiments');
  const sgRoute = inExpDir ? 'stern-gerlach.html' : 'experiments/stern-gerlach.html';
  const VIRTUAL_LABS = { 'stern-gerlach': sgRoute };

  track.querySelectorAll('.exp-card').forEach(card => {
    card.addEventListener('click', () => {
      const expId = card.dataset.exp;
      if (VIRTUAL_LABS[expId]) {
        window.location.href = VIRTUAL_LABS[expId];
      } else {
        QL.openExpModal(expId);
      }
    });
  });

  QL.initCarousel('experiments-track', 'exp-prev', 'exp-next');

  // Filter handlers
  const filterPills = document.querySelectorAll('#exp-filters .filter-pill');
  if (filterPills.length) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const level = pill.dataset.filter;
        track.querySelectorAll('.exp-card').forEach(card => {
          if (level === 'all' || (card.dataset.level && card.dataset.level.toLowerCase() === level.toLowerCase())) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // View toggle handlers (Grid vs Carousel)
  const btnGrid = document.getElementById('view-grid-btn');
  const btnCarousel = document.getElementById('view-carousel-btn');
  const prevBtn = document.getElementById('exp-prev');
  const nextBtn = document.getElementById('exp-next');

  if (btnGrid && btnCarousel) {
    btnGrid.addEventListener('click', () => {
      btnGrid.classList.add('active');
      btnCarousel.classList.remove('active');
      track.classList.add('is-grid');
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    });

    btnCarousel.addEventListener('click', () => {
      btnCarousel.classList.add('active');
      btnGrid.classList.remove('active');
      track.classList.remove('is-grid');
      if (prevBtn) prevBtn.style.display = '';
      if (nextBtn) nextBtn.style.display = '';
    });
  }
};

/* ============================================================
   EXPERIMENT MODAL
   ============================================================ */
QL.openExpModal = function (expId) {
  const exp = QL.data.experiments.find(e => e.id === expId);
  if (!exp) return;

  const content = document.getElementById('modal-content');
  if (!content) return;

  const steps = exp.steps || exp.guidedSteps || exp.timeline || [];
  const probabilities = exp.probabilities || [
    { label: '|0⟩', pct: 50 },
    { label: '|1⟩', pct: 50 }
  ];
  const circuit = exp.circuit || [];

  content.innerHTML = `
    <div class="exp-modal__header">
      <div style="flex:1">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.3rem">Experiment</div>
        <h2 class="exp-modal__title" id="modal-title">${exp.name}</h2>
        <span class="exp-card__badge badge--${(exp.level || 'beginner').toLowerCase()}" style="margin-top:0.4rem;display:inline-block">${exp.level || 'Beginner'}</span>
      </div>
    </div>

    <div class="exp-modal__viz">
      <canvas id="modal-exp-canvas" width="900" height="200" style="width:100%;height:200px"></canvas>
    </div>

    <div class="exp-modal__desc">${exp.explanation || exp.desc || ''}</div>

    ${steps.length ? `
    <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.5rem">Experiment Steps</div>
    <div class="exp-modal__steps" id="exp-modal-steps">
      ${steps.map((s, i) => `<span class="exp-modal__step ${i === 0 ? 'active' : ''}" data-step="${i}">${s}</span>`).join('')}
    </div>` : ''}

    ${circuit.length ? `
    <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.5rem;margin-top:1.25rem">Quantum Circuit</div>
    <div class="exp-modal__circuit">
      ${circuit.map(line => line
        .replace(/\[([^\]]+)\]/g, '<span class="gate">[$1]</span>')
        .replace(/\[M\]/g, '<span class="meas">[M]</span>')
        .replace(/(q\d+)/g, '<span class="hl">$1</span>')
      ).join('<br>')}
    </div>` : ''}

    <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.6rem;margin-top:1.25rem">Measurement Probabilities</div>
    <div class="prob-bars" id="modal-prob-bars">
      ${probabilities.map(p => `
        <div class="prob-bar__row">
          <span class="prob-bar__label">${p.label}</span>
          <div class="prob-bar__track">
            <div class="prob-bar__fill" style="width:${p.pct}%"></div>
          </div>
          <span class="prob-bar__pct">${p.pct}%</span>
        </div>
      `).join('')}
    </div>

    <div class="exp-modal__ai-hint">
      <span>🤖</span>
      <p>Why did this happen?</p>
      <button onclick="QL.askAI('${exp.name}: ${(exp.explanation || exp.desc || '').replace(/'/g, "\\'")}')">Explain this result</button>
    </div>
  `;

  QL.showModal();

  // Init canvas
  const modalCanvas = document.getElementById('modal-exp-canvas');
  if (modalCanvas) QL.ExperimentViz.init(modalCanvas, exp.animType);

  // Step interactions
  document.querySelectorAll('.exp-modal__step').forEach(step => {
    step.addEventListener('click', () => {
      document.querySelectorAll('.exp-modal__step').forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });
};

/* ============================================================
   CHALLENGES
   ============================================================ */
QL.renderChallenges = function () {
  const track = document.getElementById('challenges-track');
  if (!track) return;

  track.innerHTML = QL.data.challenges.map(ch => `
    <div class="chal-card anim-hidden" data-chal="${ch.id}" id="chal-card-${ch.id}">
      <div class="chal-card__num">Challenge ${ch.num}</div>
      <div class="chal-card__icon">${ch.icon}</div>
      <div class="chal-card__name">${ch.name}</div>
      <div class="chal-card__desc">${ch.desc}</div>
      <div class="chal-card__footer">
        <span class="exp-card__badge badge--${ch.level.toLowerCase()}">${ch.level}</span>
        <span class="chal-card__solve">
          Solve
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    </div>
  `).join('');

  track.querySelectorAll('.chal-card').forEach(card => {
    card.addEventListener('click', () => QL.openChallengeModal(card.dataset.chal));
  });

  QL.initCarousel('challenges-track', 'chal-prev', 'chal-next');
};

QL.openChallengeModal = function (chalId) {
  const ch = QL.data.challenges.find(c => c.id === chalId);
  if (!ch) return;
  const content = document.getElementById('modal-content');
  content.innerHTML = `
    <div style="margin-bottom:1.5rem">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.3rem">Challenge ${ch.num}</div>
      <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.25rem">${ch.name}</h2>
      <span class="exp-card__badge badge--${ch.level.toLowerCase()}">${ch.level}</span>
    </div>
    <div class="chal-modal">
      <div class="chal-modal__desc">${ch.desc}</div>
      <div>
        <div class="chal-modal__goal">Hint</div>
        <div class="chal-modal__hint">💡 ${ch.hint}</div>
      </div>
      <div class="chal-modal__actions">
        <button class="btn btn--primary btn--md" onclick="QL.openLabModal('${ch.labId}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          Open in Lab
        </button>
        <button class="btn btn--ghost btn--md" id="chal-check-btn">Check Solution</button>
        <button class="btn btn--ghost btn--md" onclick="QL.askAI('Help me solve the ${ch.name} challenge')">🤖 Ask AI</button>
      </div>
      <div id="chal-feedback" style="display:none" class="chal-success">
        <span>✓</span>
        <span>Challenge complete! The Bell state |Φ+⟩ = (|00⟩+|11⟩)/√2 was successfully created.</span>
      </div>
    </div>
  `;
  QL.showModal();

  document.getElementById('chal-check-btn')?.addEventListener('click', () => {
    const fb = document.getElementById('chal-feedback');
    if (fb) { fb.style.display = 'flex'; }
  });
};

/* ============================================================
   CAROUSEL
   ============================================================ */
QL.initCarousel = function (trackId, prevId, nextId) {
  const track = document.getElementById(trackId);
  const prev  = document.getElementById(prevId);
  const next  = document.getElementById(nextId);
  if (!track) return;

  const cardWidth = () => {
    const card = track.firstElementChild;
    if (!card) return 280;
    return card.offsetWidth + 20;
  };

  if (prev) prev.addEventListener('click', () => {
    track.scrollBy({ left: -cardWidth() * 2, behavior: 'smooth' });
  });
  if (next) next.addEventListener('click', () => {
    track.scrollBy({ left: cardWidth() * 2, behavior: 'smooth' });
  });
};

/* ============================================================
   MODAL
   ============================================================ */
QL.showModal = function () {
  document.getElementById('modal').classList.add('active');
  document.getElementById('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
};

QL.hideModal = function () {
  document.getElementById('modal').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
};

/* ============================================================
   AI TUTOR
   ============================================================ */
QL.askAI = function (question) {
  // Open panel
  document.getElementById('ai-panel').classList.add('active');

  // Add user message
  addAIMessage(question, 'user');

  // Simulate response
  setTimeout(() => {
    const responses = QL.data.aiResponses.default;
    const reply = responses[Math.floor(Math.random() * responses.length)];
    addAIMessage(reply, 'bot');
  }, 900);
};

function addAIMessage(text, role) {
  const messages = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = `ai-msg ai-msg--${role}`;
  div.innerHTML = `
    <div class="ai-msg__avatar">${role === 'bot' ? '🤖' : '👤'}</div>
    <div class="ai-msg__bubble">${text}</div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */
function initScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.anim-hidden').forEach(el => observer.observe(el));
}

/* ============================================================
   NAV
   ============================================================ */
function initNav() {
  const nav = document.getElementById('main-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);

      // Active link highlighting for hash links
      const sections = ['algorithms', 'learn', 'challenges'];
      let current = '';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) current = id;
      });
      document.querySelectorAll('.nav__link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          link.classList.toggle('active', href === `#${current}`);
        }
      });
    }, { passive: true });
  }

  // Mobile menu
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Handle /experiments navigation for file: protocol
  document.querySelectorAll('a[href="/experiments"], a[href="/experiments/"]').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.location.protocol === 'file:') {
        e.preventDefault();
        const isInExpDir = window.location.pathname.includes('/experiments/') ||
                           window.location.pathname.endsWith('/experiments') ||
                           window.location.pathname.includes('/virtual-labs/');
        window.location.href = isInExpDir ? '../experiments/index.html' : 'experiments/index.html';
      }
    });
  });

  // Handle /virtual-labs navigation for file: protocol
  document.querySelectorAll('a[href="/virtual-labs"], a[href="/virtual-labs/"]').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.location.protocol === 'file:') {
        e.preventDefault();
        const isInSubDir = window.location.pathname.includes('/experiments/') ||
                           window.location.pathname.includes('/virtual-labs/');
        window.location.href = isInSubDir ? '../virtual-labs/index.html' : 'virtual-labs/index.html';
      }
    });
  });

  // Handle root link for file: protocol
  document.querySelectorAll('a[href="/"]').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.location.protocol === 'file:') {
        e.preventDefault();
        const isInSubDir = window.location.pathname.includes('/experiments/') ||
                           window.location.pathname.includes('/virtual-labs/');
        window.location.href = isInSubDir ? '../index.html' : 'index.html';
      }
    });
  });
}

/* ============================================================
   HERO BUTTONS
   ============================================================ */
function initHeroButtons() {
  document.getElementById('start-exploring-btn')?.addEventListener('click', () => {
    const expSec = document.getElementById('experiments');
    if (expSec) {
      expSec.scrollIntoView({ behavior: 'smooth' });
    } else {
      const isFile = window.location.protocol === 'file:';
      const isInExpDir = window.location.pathname.includes('/experiments/') ||
                         window.location.pathname.endsWith('/experiments');
      window.location.href = isFile ? (isInExpDir ? 'index.html' : 'experiments/index.html') : '/experiments';
    }
  });
  document.getElementById('playground-btn')?.addEventListener('click', () => {
    QL.openLabModal('circuit-lab');
  });
}

/* ============================================================
   AI PANEL
   ============================================================ */
function initAIPanel() {
  document.getElementById('ai-tutor-btn')?.addEventListener('click', () => {
    document.getElementById('ai-panel').classList.toggle('active');
  });
  document.getElementById('ai-panel-close')?.addEventListener('click', () => {
    document.getElementById('ai-panel').classList.remove('active');
  });

  const input = document.getElementById('ai-input');
  const send  = document.getElementById('ai-send');

  function sendMessage() {
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    QL.askAI(q);
  }

  send?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}

/* ============================================================
   MODAL CLOSE
   ============================================================ */
function initModalClose() {
  document.getElementById('modal-close')?.addEventListener('click', QL.hideModal);
  document.getElementById('overlay')?.addEventListener('click', QL.hideModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') QL.hideModal(); });
}

/* ============================================================
   PROFILE PANEL (stub)
   ============================================================ */
function initProfile() {
  document.getElementById('profile-btn')?.addEventListener('click', () => {
    QL.askAI('Show me my learning progress and completed experiments.');
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Render all sections (each function guards itself with DOM id checks)
  QL.renderExperiments();
  if (typeof QL.renderLabs === 'function') QL.renderLabs();
  if (typeof QL.renderAlgorithms === 'function') QL.renderAlgorithms();
  if (typeof QL.renderLearn === 'function') QL.renderLearn();
  if (typeof QL.renderChallenges === 'function') QL.renderChallenges();

  // Dynamically update hero stat counts from data
  const heroExpCount = document.getElementById('hero-exp-count');
  if (heroExpCount && QL.data && QL.data.experiments) {
    heroExpCount.textContent = QL.data.experiments.length;
  }
  const heroLabsCount = document.getElementById('hero-labs-count');
  if (heroLabsCount && QL.data && QL.data.labs) {
    heroLabsCount.textContent = QL.data.labs.length;
  }
  const heroAlgoCount = document.getElementById('hero-algo-count');
  if (heroAlgoCount && QL.data && QL.data.algorithms) {
    heroAlgoCount.textContent = QL.data.algorithms.length;
  }

  // Init hero canvas (guards itself if elements missing)
  if (typeof QL.initHeroCanvas === 'function') QL.initHeroCanvas();

  // Init 3D Bloch Sphere (Three.js WebGL)
  if (typeof QL.initBloch3D === 'function') QL.initBloch3D();

  // Init interactions
  initNav();
  initHeroButtons();
  initAIPanel();
  initModalClose();
  initProfile();

  // Scroll animations (after render)
  requestAnimationFrame(() => {
    initScrollObserver();
    // Re-observe any newly added elements
    setTimeout(initScrollObserver, 500);
  });
});
