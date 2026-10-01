/* ============================================================
   QUANTUMLAB – PROGRESS UI CONTROLLER
   Full implementation of the personalized quantum learning
   roadmap, progress dashboard, interactive modal systems,
   and daily study tracking.
   ============================================================ */

window.QL = window.QL || {};

(function() {
  const Store = QL.ProgressStore;

  // DOM Elements cache
  let elements = {};
  let editingPlanId = null;

  // Modal form temporary state
  let modalConfig = {
    name: 'Quantum Foundations & Algorithms',
    topicIds: [],
    pace: 'steady',
    dailyStudyTimeMinutes: 60,
    studyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startDateStr: new Date().toISOString().split('T')[0]
  };

  /* ------------------------------------------------------------
     1. TOAST SYSTEM
     ------------------------------------------------------------ */
  function showToast(message, type = 'success') {
    let container = document.getElementById('ql-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ql-toast-container';
      container.className = 'ql-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `ql-toast ql-toast--${type}`;

    let icon = '✓';
    if (type === 'info') icon = 'ℹ';
    if (type === 'warn') icon = '⏸';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 320);
    }, 3800);
  }

  /* ------------------------------------------------------------
     2. AMBIENT BACKGROUND CANVAS
     ------------------------------------------------------------ */
  function initHeroCanvas() {
    const canvas = document.getElementById('progress-hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 200),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle interconnecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 90) * 0.15})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particle dots
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    }
    render();
  }

  /* ------------------------------------------------------------
     3. RENDER MAIN PROGRESS DASHBOARD
     ------------------------------------------------------------ */
  function renderDashboard() {
    const store = Store.getStore();
    const activePlan = Store.getActivePlan();

    // 1. Top Status Area
    renderStatusStrip(store, activePlan);

    // 2. Plans Bar (Multiple Plans Switcher)
    renderPlansBar(store, activePlan);

    // 3. Main Content: Active Plan vs Empty State
    const mainCol = document.getElementById('progress-main-col');
    if (!activePlan) {
      renderEmptyState(mainCol);
    } else {
      renderActivePlan(mainCol, activePlan);
      renderDailyRoadmap(mainCol, activePlan);
    }

    // 4. Right Sidebar
    renderSidebar(store, activePlan);
  }

  /* ── 3.1 Status Strip ── */
  function renderStatusStrip(store, activePlan) {
    const streakEl = document.getElementById('stat-streak-val');
    const planNameEl = document.getElementById('stat-plan-val');
    const dayEl = document.getElementById('stat-day-val');
    const progEl = document.getElementById('stat-prog-val');

    if (streakEl) {
      const streak = store.streak || 0;
      streakEl.innerHTML = `<span>🔥 ${streak}</span> <span class="progress-status-sub">${streak === 1 ? 'DAY' : 'DAYS'}</span>`;
    }

    if (planNameEl) {
      planNameEl.textContent = activePlan ? activePlan.name : 'No Active Plan';
    }

    if (dayEl) {
      if (activePlan) {
        dayEl.innerHTML = `<span>DAY ${activePlan.currentDayNumber}</span> <span class="progress-status-sub">/ ${activePlan.days.length}</span>`;
      } else {
        dayEl.textContent = '—';
      }
    }

    if (progEl) {
      if (activePlan && activePlan.totalActivities > 0) {
        const pct = Math.round((activePlan.completedActivities / activePlan.totalActivities) * 100);
        progEl.innerHTML = `<span>${pct}%</span> <span class="progress-status-sub">(${activePlan.completedActivities}/${activePlan.totalActivities})</span>`;
      } else {
        progEl.textContent = '0%';
      }
    }
  }

  /* ── 3.2 Plans Switcher Bar ── */
  function renderPlansBar(store, activePlan) {
    const bar = document.getElementById('progress-plans-bar');
    if (!bar) return;

    bar.innerHTML = '';

    // "+ New Plan" button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'plan-tab-btn-add';
    addBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      + New Plan
    `;
    addBtn.addEventListener('click', () => openRoadmapModal(null));
    bar.appendChild(addBtn);

    // Each plan card
    store.plans.forEach(p => {
      const card = document.createElement('div');
      const isActive = activePlan && activePlan.id === p.id;
      card.className = `plan-tab-card ${isActive ? 'active' : ''}`;

      let badgeClass = 'plan-tab-badge--active';
      let badgeLabel = 'ACTIVE';
      if (p.status === 'paused') {
        badgeClass = 'plan-tab-badge--paused';
        badgeLabel = 'PAUSED';
      } else if (p.status === 'completed') {
        badgeClass = 'plan-tab-badge--completed';
        badgeLabel = 'COMPLETED';
      }

      const pct = p.totalActivities > 0 ? Math.round((p.completedActivities / p.totalActivities) * 100) : 0;

      card.innerHTML = `
        <span>${escapeHtml(p.name)}</span>
        <span class="plan-tab-badge ${badgeClass}">${badgeLabel}</span>
        <span style="font-family:var(--font-mono);font-size:0.75rem;opacity:0.7;">${pct}%</span>
      `;

      card.addEventListener('click', () => {
        Store.setActivePlan(p.id);
        renderDashboard();
      });

      bar.appendChild(card);
    });
  }

  /* ── 3.3 Empty State ── */
  function renderEmptyState(container) {
    container.innerHTML = `
      <div class="progress-empty-state">
        <div class="empty-icon-wrap">⚛</div>
        <h2 class="empty-title">START YOUR QUANTUM JOURNEY</h2>
        <p class="empty-desc">
          Create a personalized roadmap tailored to the quantum topics you want to master.
          Choose your pace, daily study time, and let QuantumLab guide you day by day.
        </p>
        <button type="button" class="btn-ql-primary" id="btn-empty-create" style="padding:14px 28px;font-size:0.95rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Build My Quantum Journey
        </button>
      </div>
    `;

    document.getElementById('btn-empty-create').addEventListener('click', () => openRoadmapModal(null));
  }

  /* ── 3.4 Active Plan Card ── */
  function renderActivePlan(container, plan) {
    const pct = plan.totalActivities > 0 ? Math.round((plan.completedActivities / plan.totalActivities) * 100) : 0;
    const isPaused = plan.status === 'paused';

    const card = document.createElement('div');
    card.className = 'active-plan-card';
    card.innerHTML = `
      <div class="active-plan-header">
        <div class="active-plan-title-wrap">
          <div class="active-plan-meta">
            <span class="active-plan-tag">YOUR QUANTUM ROADMAP</span>
            <span class="active-plan-level-pill">${escapeHtml(plan.level || 'Intermediate')}</span>
            <span class="active-plan-level-pill" style="background:rgba(56,189,248,0.12);color:#38bdf8;border-color:rgba(56,189,248,0.3);text-transform:capitalize;">${plan.pace} Pace</span>
          </div>
          <h2 class="active-plan-name">${escapeHtml(plan.name)}</h2>
        </div>

        <div class="active-plan-actions">
          <button type="button" class="plan-btn plan-btn--pause" id="btn-plan-pause">
            ${isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button type="button" class="plan-btn" id="btn-plan-edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button type="button" class="plan-btn plan-btn--delete" id="btn-plan-delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
          </button>
        </div>
      </div>

      <div class="active-plan-progress-wrap">
        <div class="active-plan-progress-info">
          <span class="active-plan-progress-text">
            Day ${plan.currentDayNumber} of ${plan.days.length} &bull; ${plan.completedActivities} of ${plan.totalActivities} activities completed
          </span>
          <span class="active-plan-progress-pct">${pct}%</span>
        </div>
        <div class="active-plan-progress-bar">
          <div class="active-plan-progress-fill" style="width: ${pct}%;"></div>
        </div>
      </div>

      <div class="active-plan-footer">
        <div>Started: <strong>${plan.formattedStartDate || 'Today'}</strong></div>
        <div>Target Completion: <strong>${plan.formattedEndDate || '—'}</strong></div>
        <div>Schedule: <strong>${plan.studyDays ? plan.studyDays.join(', ') : 'Daily'} (${plan.dailyStudyTimeMinutes} min/day)</strong></div>
      </div>
    `;

    container.innerHTML = '';
    container.appendChild(card);

    // Bind plan actions
    card.querySelector('#btn-plan-pause').addEventListener('click', () => {
      Store.togglePausePlan(plan.id);
      showToast(isPaused ? '▶ Plan resumed' : '⏸ Plan paused', 'info');
      renderDashboard();
    });

    card.querySelector('#btn-plan-edit').addEventListener('click', () => {
      openRoadmapModal(plan.id);
    });

    card.querySelector('#btn-plan-delete').addEventListener('click', () => {
      openDeleteConfirmModal(plan.id);
    });
  }

  /* ── 3.5 Daily Roadmap Section ── */
  function renderDailyRoadmap(container, plan) {
    const section = document.createElement('div');
    section.className = 'roadmap-section';

    section.innerHTML = `
      <div class="roadmap-header">
        <h3 class="roadmap-title">
          <span>DAILY LEARNING ROADMAP</span>
          <span class="roadmap-badge">${plan.days.length} Days</span>
        </h3>
        <span style="font-size:0.8rem;color:var(--text-muted);font-family:var(--font-mono);">Click day to expand activities</span>
      </div>
      <div id="roadmap-days-list" style="display:flex;flex-direction:column;gap:14px;"></div>
    `;

    container.appendChild(section);
    const daysList = section.querySelector('#roadmap-days-list');

    plan.days.forEach(day => {
      const dayCard = document.createElement('div');
      const isCurrent = day.dayNumber === plan.currentDayNumber;
      const isCompleted = day.completed;
      const isExpanded = isCurrent; // Auto-expand current day by default

      dayCard.className = `day-card ${isCurrent ? 'current-day' : ''} ${isCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`;
      dayCard.id = `day-card-${day.dayNumber}`;

      const completedInDay = day.activities.filter(a => a.status === 'completed').length;
      const totalInDay = day.activities.length;
      const dayPct = totalInDay > 0 ? Math.round((completedInDay / totalInDay) * 100) : 0;

      // Header
      dayCard.innerHTML = `
        <div class="day-card-header" onclick="QL.ProgressUI.toggleDayCard(${day.dayNumber})">
          <div class="day-card-left">
            <div class="day-number-badge">
              <span>DAY</span>
              <span>${day.dayNumber}</span>
            </div>
            <div class="day-card-info">
              <div class="day-card-title">
                <span>${escapeHtml(day.formattedDate)} &bull; ${day.dayOfWeek}</span>
                ${isCurrent ? '<span style="font-size:0.68rem;padding:2px 8px;border-radius:10px;background:rgba(56,189,248,0.15);color:#38bdf8;font-family:var(--font-mono);">TODAY</span>' : ''}
              </div>
              <div class="day-date-label">
                ${totalInDay} activities &bull; ${day.estimatedMinutes} minutes total
              </div>
            </div>
          </div>

          <div class="day-card-right">
            <div class="day-card-stats">
              <span class="day-time-pill">⏱ ${day.estimatedMinutes}m</span>
              <span class="day-status-pill ${isCompleted ? 'day-status-pill--complete' : 'day-status-pill--progress'}">
                ${isCompleted ? '✓ Complete' : `${completedInDay} / ${totalInDay} (${dayPct}%)`}
              </span>
            </div>
            <svg class="day-toggle-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div class="day-activities-wrap">
          <table class="day-activities-table">
            <thead>
              <tr>
                <th style="width:36px;">STATUS</th>
                <th>ACTIVITY</th>
                <th>TYPE</th>
                <th>DIFFICULTY</th>
                <th>TIME</th>
                <th style="text-align:right;">ACTION</th>
              </tr>
            </thead>
            <tbody>
              ${day.activities.map(act => renderActivityTableRow(plan.id, day.dayNumber, act)).join('')}
            </tbody>
          </table>

          ${isCompleted ? `
            <div class="day-complete-banner">
              <span>🎉 Great job! You have completed all scheduled activities for Day ${day.dayNumber}.</span>
              ${day.dayNumber < plan.days.length ? `
                <button type="button" onclick="QL.ProgressUI.startNextDay('${plan.id}')">Start Next Day →</button>
              ` : '<span>All Roadmap Days Complete!</span>'}
            </div>
          ` : `
            <div class="day-card-footer">
              <span style="font-size:0.75rem;color:var(--text-muted);">Complete all activities to advance to the next day</span>
              <button type="button" class="btn-ql-ghost" onclick="QL.ProgressUI.openDailyModal('${plan.id}', ${day.dayNumber})" style="padding:6px 14px;font-size:0.78rem;">
                Open Day View
              </button>
            </div>
          `}
        </div>
      `;

      daysList.appendChild(dayCard);
    });
  }

  function renderActivityTableRow(planId, dayNumber, act) {
    const isDone = act.status === 'completed';
    const typeClass = (act.type || 'LEARN').toLowerCase().replace(/\s+/g, '-');
    const diffClass = (act.difficulty || 'beginner').toLowerCase();

    return `
      <tr class="day-activity-row">
        <td>
          <button type="button" class="act-check-btn ${isDone ? 'checked' : ''}"
            onclick="QL.ProgressUI.toggleActivity('${planId}', ${dayNumber}, '${act.id}')"
            title="${isDone ? 'Mark Incomplete' : 'Mark Completed'}">
            ✓
          </button>
        </td>
        <td>
          <div style="font-weight:700;color:#fff;">${escapeHtml(act.title)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(act.desc || '')}</div>
        </td>
        <td>
          <span class="type-badge type-badge--${typeClass}">${act.type}</span>
        </td>
        <td>
          <span class="diff-badge diff-badge--${diffClass}">${act.difficulty}</span>
        </td>
        <td>
          <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-secondary);">${act.estimatedMinutes}m</span>
        </td>
        <td style="text-align:right;">
          <a href="${act.route || '#'}" class="act-open-link" target="_self">
            Launch
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </td>
      </tr>
    `;
  }

  /* ── 3.6 Right Progress Sidebar ── */
  function renderSidebar(store, activePlan) {
    const sidebar = document.getElementById('progress-sidebar');
    if (!sidebar) return;

    const totalPct = activePlan && activePlan.totalActivities > 0
      ? Math.round((activePlan.completedActivities / activePlan.totalActivities) * 100)
      : 0;

    // SVG arc stroke calculation (circumference = 2 * PI * r = 2 * 3.14159 * 60 ≈ 377)
    const strokeDashoffset = Math.round(377 - (377 * totalPct / 100));

    // Dynamic category breakdown from store
    const catStats = Store.getCategoryStats();

    sidebar.innerHTML = `
      <div class="sidebar-card">
        <div class="sidebar-title-wrap">
          <div class="sidebar-title">${totalPct >= 100 ? 'Mastery Achieved!' : totalPct > 0 ? 'Keep Building Momentum!' : "Let's Get Started!"}</div>
          <div class="sidebar-subtitle">QuantumLab Overall Progress</div>
        </div>

        <!-- Circular Progress Gauge -->
        <div class="progress-gauge-wrap">
          <div class="gauge-svg-container">
            <svg class="gauge-svg" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#38bdf8" />
                  <stop offset="50%" stop-color="#818cf8" />
                  <stop offset="100%" stop-color="#34d399" />
                </linearGradient>
              </defs>
              <circle class="gauge-bg" cx="70" cy="70" r="60"></circle>
              <circle class="gauge-arc" id="sidebar-gauge-arc" cx="70" cy="70" r="60" style="stroke-dashoffset: ${strokeDashoffset};"></circle>
            </svg>
            <div class="gauge-text">
              <span class="gauge-pct" id="sidebar-gauge-pct">${totalPct}%</span>
              <span class="gauge-label">Total Progress</span>
            </div>
          </div>
          <span class="gauge-sub">${activePlan ? `${activePlan.completedActivities} of ${activePlan.totalActivities} activities` : '0 activities'}</span>
        </div>

        <!-- Category Progress Bars -->
        <div class="category-progress-list">
          <div style="font-family:var(--font-mono);font-size:0.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">
            TOPIC BREAKDOWN
          </div>
          ${catStats.map(cat => `
            <div class="cat-prog-item">
              <div class="cat-prog-header">
                <span class="cat-prog-name">${escapeHtml(cat.label)}</span>
                <span class="cat-prog-count">${cat.completed} / ${cat.total} (${cat.percentage}%)</span>
              </div>
              <div class="cat-prog-bar">
                <div class="cat-prog-fill" style="width: ${cat.percentage}%; background: ${cat.color};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Motivation / Momentum Card -->
      <div class="momentum-card">
        <div class="momentum-icon">⚡</div>
        <div>
          <div class="momentum-title">Quantum Momentum</div>
          <div class="momentum-desc">
            ${store.streak > 0 ? `You're on a ${store.streak}-day streak! Keep up the daily quantum experiments.` : 'Complete Day 1 activities to ignite your daily learning streak!'}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------
     4. ROADMAP CONFIGURATION MODAL
     ------------------------------------------------------------ */
  function openRoadmapModal(planId = null) {
    editingPlanId = planId;
    const isEditing = Boolean(planId);

    if (isEditing) {
      const plan = Store.getAllPlans().find(p => p.id === planId);
      if (plan) {
        modalConfig = {
          name: plan.name,
          topicIds: [...plan.topicIds],
          pace: plan.pace,
          dailyStudyTimeMinutes: plan.dailyStudyTimeMinutes,
          studyDays: [...plan.studyDays],
          startDateStr: plan.startDate
        };
      }
    } else {
      // Default initial selection: select foundations by default
      const defaultTopics = QL.progressTopicsRegistry[0].topics.map(t => t.id);
      modalConfig = {
        name: 'Quantum Foundations & Algorithms',
        topicIds: defaultTopics,
        pace: 'steady',
        dailyStudyTimeMinutes: 60,
        studyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        startDateStr: new Date().toISOString().split('T')[0]
      };
    }

    renderRoadmapModalContent(isEditing);
    const modalBackdrop = document.getElementById('modal-roadmap-backdrop');
    if (modalBackdrop) modalBackdrop.classList.add('open');
    updateLivePlanPreview();
  }

  function closeRoadmapModal() {
    const modalBackdrop = document.getElementById('modal-roadmap-backdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('open');
  }

  function renderRoadmapModalContent(isEditing) {
    const body = document.getElementById('modal-roadmap-body');
    const headerTitle = document.getElementById('modal-roadmap-title');
    const submitBtn = document.getElementById('btn-modal-submit');

    if (headerTitle) {
      headerTitle.textContent = isEditing ? 'Edit Quantum Roadmap' : 'Set Quantum Roadmap';
    }
    if (submitBtn) {
      submitBtn.textContent = isEditing ? 'Save Plan Changes' : 'Start Your Quantum Journey';
    }

    body.innerHTML = `
      <!-- Step 1: Selected Topics -->
      <div class="modal-form-section">
        <div class="modal-section-header">
          <span class="modal-section-title">
            <span>1</span> SELECT QUANTUM TOPICS
          </span>
          <div style="display:flex;align-items:center;gap:10px;">
            <button type="button" class="btn-ql-ghost" id="btn-select-all-topics" style="padding:4px 10px;font-size:0.72rem;">Select All</button>
            <span class="modal-section-badge" id="modal-selected-topics-count">0 topics selected</span>
          </div>
        </div>
        <div id="modal-topics-container"></div>
      </div>

      <!-- Step 2: Learning Pace -->
      <div class="modal-form-section">
        <div class="modal-section-header">
          <span class="modal-section-title">
            <span>2</span> SELECT LEARNING PACE
          </span>
        </div>
        <div class="pace-cards-grid">
          <div class="pace-card ${modalConfig.pace === 'scratch' ? 'selected' : ''}" onclick="QL.ProgressUI.setModalPace('scratch')">
            <div class="pace-card-header"><span class="pace-card-icon">🌱</span><span class="pace-card-name">From Scratch</span></div>
            <span class="pace-card-desc">Build from absolute zero with extra foundational reviews.</span>
          </div>
          <div class="pace-card ${modalConfig.pace === 'steady' ? 'selected' : ''}" onclick="QL.ProgressUI.setModalPace('steady')">
            <div class="pace-card-header"><span class="pace-card-icon">🎯</span><span class="pace-card-name">Steady</span></div>
            <span class="pace-card-desc">Balanced progression step by step with interactive labs.</span>
          </div>
          <div class="pace-card ${modalConfig.pace === 'fast' ? 'selected' : ''}" onclick="QL.ProgressUI.setModalPace('fast')">
            <div class="pace-card-header"><span class="pace-card-icon">⚡</span><span class="pace-card-name">Fast Track</span></div>
            <span class="pace-card-desc">Move through fundamentals quickly directly to circuits.</span>
          </div>
          <div class="pace-card ${modalConfig.pace === 'intensive' ? 'selected' : ''}" onclick="QL.ProgressUI.setModalPace('intensive')">
            <div class="pace-card-header"><span class="pace-card-icon">🚀</span><span class="pace-card-name">Intensive</span></div>
            <span class="pace-card-desc">High-density curriculum covering complex algorithms.</span>
          </div>
        </div>
      </div>

      <!-- Step 3: Daily Study Time -->
      <div class="modal-form-section">
        <div class="modal-section-header">
          <span class="modal-section-title">
            <span>3</span> HOW MUCH TIME CAN YOU DEDICATE EACH DAY?
          </span>
        </div>
        <div class="study-time-grid">
          <button type="button" class="time-btn ${modalConfig.dailyStudyTimeMinutes === 30 ? 'selected' : ''}" onclick="QL.ProgressUI.setModalDailyTime(30)">
            <span>30 MIN</span>
            <span class="time-btn-est" id="est-time-30">~40 days</span>
          </button>
          <button type="button" class="time-btn ${modalConfig.dailyStudyTimeMinutes === 60 ? 'selected' : ''}" onclick="QL.ProgressUI.setModalDailyTime(60)">
            <span>1 HOUR</span>
            <span class="time-btn-est" id="est-time-60">~20 days</span>
          </button>
          <button type="button" class="time-btn ${modalConfig.dailyStudyTimeMinutes === 120 ? 'selected' : ''}" onclick="QL.ProgressUI.setModalDailyTime(120)">
            <span>2 HOURS</span>
            <span class="time-btn-est" id="est-time-120">~10 days</span>
          </button>
          <button type="button" class="time-btn ${modalConfig.dailyStudyTimeMinutes === 240 ? 'selected' : ''}" onclick="QL.ProgressUI.setModalDailyTime(240)">
            <span>4 HOURS</span>
            <span class="time-btn-est" id="est-time-240">~5 days</span>
          </button>
          <button type="button" class="time-btn ${modalConfig.dailyStudyTimeMinutes === 360 ? 'selected' : ''}" onclick="QL.ProgressUI.setModalDailyTime(360)">
            <span>6 HOURS</span>
            <span class="time-btn-est" id="est-time-360">~3 days</span>
          </button>
          <button type="button" class="time-btn ${[30, 60, 120, 240, 360].indexOf(modalConfig.dailyStudyTimeMinutes) === -1 ? 'selected' : ''}" onclick="QL.ProgressUI.setModalDailyTime('custom')">
            <span>CUSTOM</span>
            <span class="time-btn-est">Adjust time</span>
          </button>
        </div>
        <div class="custom-time-row ${[30, 60, 120, 240, 360].indexOf(modalConfig.dailyStudyTimeMinutes) === -1 ? 'visible' : ''}" id="custom-time-row">
          <span style="font-size:0.8rem;color:var(--text-secondary);">Study time per day:</span>
          <select class="custom-time-select" id="custom-time-select" onchange="QL.ProgressUI.setModalDailyTime(parseInt(this.value))">
            <option value="45" ${modalConfig.dailyStudyTimeMinutes === 45 ? 'selected' : ''}>45 min</option>
            <option value="90" ${modalConfig.dailyStudyTimeMinutes === 90 ? 'selected' : ''}>1.5 hours</option>
            <option value="180" ${modalConfig.dailyStudyTimeMinutes === 180 ? 'selected' : ''}>3 hours</option>
            <option value="300" ${modalConfig.dailyStudyTimeMinutes === 300 ? 'selected' : ''}>5 hours</option>
          </select>
        </div>
      </div>

      <!-- Step 4: Study Days -->
      <div class="modal-form-section">
        <div class="modal-section-header">
          <span class="modal-section-title">
            <span>4</span> WHICH DAYS DO YOU WANT TO STUDY?
          </span>
          <span class="study-days-summary" id="modal-days-count">${modalConfig.studyDays.length} days/week</span>
        </div>
        <div class="study-days-row">
          ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `
            <button type="button" class="day-pill-btn ${modalConfig.studyDays.includes(day) ? 'selected' : ''}" onclick="QL.ProgressUI.toggleModalStudyDay('${day}')">
              ${day}
            </button>
          `).join('')}
        </div>
        <div class="study-days-summary" id="modal-rest-days-text"></div>
      </div>

      <!-- Step 5: Start Date -->
      <div class="modal-form-section">
        <div class="modal-section-header">
          <span class="modal-section-title">
            <span>5</span> SELECT START DATE
          </span>
        </div>
        <input type="date" class="start-date-input" id="modal-start-date" value="${modalConfig.startDateStr}" onchange="QL.ProgressUI.setModalStartDate(this.value)" />
      </div>

      <!-- Live Plan Preview Card -->
      <div class="modal-plan-preview-card">
        <div class="preview-card-header">
          <span class="preview-card-title">YOUR GENERATED QUANTUM PLAN</span>
          <span style="font-family:var(--font-mono);font-size:0.75rem;color:#a78bfa;" id="preview-pace-label">Steady Pace</span>
        </div>
        <div class="preview-stats-grid">
          <div class="preview-stat-box">
            <span class="preview-stat-k">Total Activities</span>
            <span class="preview-stat-v" id="preview-stat-activities">0</span>
          </div>
          <div class="preview-stat-box">
            <span class="preview-stat-k">Study Time</span>
            <span class="preview-stat-v" id="preview-stat-time">1 hour/day</span>
          </div>
          <div class="preview-stat-box">
            <span class="preview-stat-k">Duration</span>
            <span class="preview-stat-v" id="preview-stat-duration">0 days</span>
          </div>
          <div class="preview-stat-box">
            <span class="preview-stat-k">Starts</span>
            <span class="preview-stat-v" id="preview-stat-starts">Today</span>
          </div>
          <div class="preview-stat-box">
            <span class="preview-stat-k">Estimated End</span>
            <span class="preview-stat-v" id="preview-stat-ends">—</span>
          </div>
        </div>
      </div>
    `;

    // Render topics grouped by category
    const topicsContainer = body.querySelector('#modal-topics-container');
    QL.progressTopicsRegistry.forEach(cat => {
      const group = document.createElement('div');
      group.className = 'topic-category-group';
      group.innerHTML = `
        <div class="topic-category-name">
          <span>${cat.icon}</span>
          <span>${cat.category}</span>
        </div>
        <div class="topic-pills-grid">
          ${cat.topics.map(t => {
            const isSelected = modalConfig.topicIds.includes(t.id);
            return `
              <div class="topic-checkbox-card ${isSelected ? 'selected' : ''}" onclick="QL.ProgressUI.toggleModalTopic('${t.id}')" id="topic-card-${t.id}">
                <div class="topic-custom-check">✓</div>
                <div class="topic-card-body">
                  <span class="topic-card-title">${escapeHtml(t.name)}</span>
                  <span class="topic-card-count">${t.activities.length} activities &bull; ${t.level}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      topicsContainer.appendChild(group);
    });

    // Select all button
    body.querySelector('#btn-select-all-topics').addEventListener('click', () => {
      const allIds = [];
      QL.progressTopicsRegistry.forEach(c => c.topics.forEach(t => allIds.push(t.id)));
      if (modalConfig.topicIds.length === allIds.length) {
        modalConfig.topicIds = [];
      } else {
        modalConfig.topicIds = allIds;
      }
      renderRoadmapModalContent(isEditing);
      updateLivePlanPreview();
    });
  }

  function updateLivePlanPreview() {
    // Update count badge
    const badge = document.getElementById('modal-selected-topics-count');
    if (badge) {
      badge.textContent = `${modalConfig.topicIds.length} topics selected`;
    }

    // Update rest days text
    const restEl = document.getElementById('modal-rest-days-text');
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const restDays = allDays.filter(d => !modalConfig.studyDays.includes(d));
    if (restEl) {
      restEl.textContent = restDays.length > 0 ? `Rest Days: ${restDays.join(', ')}` : 'No rest days (7 days/week)';
    }

    const preview = Store.calculatePreview(modalConfig);

    const actEl = document.getElementById('preview-stat-activities');
    const timeEl = document.getElementById('preview-stat-time');
    const durEl = document.getElementById('preview-stat-duration');
    const startsEl = document.getElementById('preview-stat-starts');
    const endsEl = document.getElementById('preview-stat-ends');
    const paceEl = document.getElementById('preview-pace-label');

    if (actEl) actEl.textContent = preview.totalActivities;
    if (timeEl) timeEl.textContent = preview.dailyTimeStr;
    if (durEl) durEl.textContent = `${preview.durationDays} study days`;
    if (startsEl) startsEl.textContent = preview.startDateStr;
    if (endsEl) endsEl.textContent = preview.endDateStr;
    if (paceEl) paceEl.textContent = `${modalConfig.pace.charAt(0).toUpperCase() + modalConfig.pace.slice(1)} Pace &bull; ${preview.level}`;
  }

  function submitRoadmapModal() {
    if (modalConfig.topicIds.length === 0) {
      showToast('Please select at least one quantum topic.', 'warn');
      return;
    }
    if (modalConfig.studyDays.length === 0) {
      showToast('Please select at least one study day per week.', 'warn');
      return;
    }

    if (editingPlanId) {
      const updated = Store.updatePlanConfig(editingPlanId, modalConfig);
      if (updated) {
        showToast('✓ Plan updated successfully!', 'success');
        closeRoadmapModal();
        renderDashboard();
      }
    } else {
      const created = Store.createPlan(modalConfig);
      if (created) {
        showToast('✓ Plan ready. Time to make progress!', 'success');
        closeRoadmapModal();
        renderDashboard();
      }
    }
  }

  /* ------------------------------------------------------------
     5. DAILY ACTIVITY MODAL (Section 32-36)
     ------------------------------------------------------------ */
  function openDailyModal(planId, dayNumber) {
    const store = Store.getStore();
    const plan = store.plans.find(p => p.id === planId);
    if (!plan) return;

    const day = plan.days.find(d => d.dayNumber === dayNumber);
    if (!day) return;

    const modalBackdrop = document.getElementById('modal-daily-backdrop');
    const titleEl = document.getElementById('modal-daily-title');
    const descEl = document.getElementById('modal-daily-desc');
    const bodyEl = document.getElementById('modal-daily-body');

    if (titleEl) titleEl.textContent = `${day.formattedDate} — Day ${day.dayNumber}`;
    if (descEl) descEl.textContent = `Complete your ${day.activities.length} scheduled quantum activities (${day.estimatedMinutes} mins)`;

    const completedCount = day.activities.filter(a => a.status === 'completed').length;
    const totalCount = day.activities.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;">
          <span style="color:var(--text-secondary);">DAY PROGRESS</span>
          <span style="font-family:var(--font-mono);font-weight:700;color:#38bdf8;">${completedCount} / ${totalCount} (${pct}%)</span>
        </div>
        <div class="active-plan-progress-bar">
          <div class="active-plan-progress-fill" style="width: ${pct}%;"></div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;">
        ${day.activities.map(act => {
          const isDone = act.status === 'completed';
          const typeClass = (act.type || 'LEARN').toLowerCase().replace(/\s+/g, '-');
          return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:12px;background:rgba(14,23,50,0.6);border:1px solid rgba(255,255,255,0.06);gap:14px;">
              <div style="display:flex;align-items:center;gap:14px;">
                <button type="button" class="act-check-btn ${isDone ? 'checked' : ''}"
                  onclick="QL.ProgressUI.toggleActivityInModal('${planId}', ${dayNumber}, '${act.id}')">
                  ✓
                </button>
                <div>
                  <div style="font-weight:700;color:#fff;font-size:0.9rem;">${escapeHtml(act.title)}</div>
                  <div style="font-size:0.74rem;color:var(--text-muted);display:flex;align-items:center;gap:8px;margin-top:2px;">
                    <span class="type-badge type-badge--${typeClass}">${act.type}</span>
                    <span>&bull;</span>
                    <span class="diff-badge diff-badge--${act.difficulty.toLowerCase()}">${act.difficulty}</span>
                    <span>&bull;</span>
                    <span style="font-family:var(--font-mono);">${act.estimatedMinutes}m</span>
                  </div>
                </div>
              </div>
              <a href="${act.route}" class="act-open-link" target="_self">Launch →</a>
            </div>
          `;
        }).join('')}
      </div>

      ${day.completed ? `
        <div class="day-complete-banner" style="margin-top:24px;">
          <span>🎉 Great job! You've completed all activities for this day.</span>
          ${dayNumber < plan.days.length ? `
            <button type="button" onclick="QL.ProgressUI.startNextDay('${plan.id}');QL.ProgressUI.closeDailyModal();">Start Next Day →</button>
          ` : '<span>Plan Complete!</span>'}
        </div>
      ` : ''}
    `;

    modalBackdrop.classList.add('open');
  }

  function closeDailyModal() {
    const modalBackdrop = document.getElementById('modal-daily-backdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('open');
  }

  /* ------------------------------------------------------------
     6. DELETE CONFIRMATION MODAL
     ------------------------------------------------------------ */
  let planToDelete = null;

  function openDeleteConfirmModal(planId) {
    planToDelete = planId;
    const modalBackdrop = document.getElementById('modal-delete-backdrop');
    if (modalBackdrop) modalBackdrop.classList.add('open');
  }

  function closeDeleteConfirmModal() {
    planToDelete = null;
    const modalBackdrop = document.getElementById('modal-delete-backdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('open');
  }

  function confirmDeletePlan() {
    if (planToDelete) {
      Store.deletePlan(planToDelete);
      showToast('Plan deleted.', 'info');
      closeDeleteConfirmModal();
      renderDashboard();
    }
  }

  /* ------------------------------------------------------------
     7. HELPER FUNCTIONS
     ------------------------------------------------------------ */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------
     8. PUBLIC INTERACTION DISPATCHER
     ------------------------------------------------------------ */
  window.QL.ProgressUI = {
    init: function() {
      initHeroCanvas();

      // Hook modal close buttons
      const closeRoadmap = document.getElementById('btn-close-roadmap-modal');
      const cancelRoadmap = document.getElementById('btn-modal-cancel');
      const submitRoadmap = document.getElementById('btn-modal-submit');
      if (closeRoadmap) closeRoadmap.addEventListener('click', closeRoadmapModal);
      if (cancelRoadmap) cancelRoadmap.addEventListener('click', closeRoadmapModal);
      if (submitRoadmap) submitRoadmap.addEventListener('click', submitRoadmapModal);

      const closeDaily = document.getElementById('btn-close-daily-modal');
      if (closeDaily) closeDaily.addEventListener('click', closeDailyModal);

      const closeDelete = document.getElementById('btn-close-delete-modal');
      const cancelDelete = document.getElementById('btn-cancel-delete');
      const confirmDelete = document.getElementById('btn-confirm-delete');
      if (closeDelete) closeDelete.addEventListener('click', closeDeleteConfirmModal);
      if (cancelDelete) cancelDelete.addEventListener('click', closeDeleteConfirmModal);
      if (confirmDelete) confirmDelete.addEventListener('click', confirmDeletePlan);

      // Hero CTA
      const heroCta = document.getElementById('btn-hero-create-plan');
      if (heroCta) heroCta.addEventListener('click', () => openRoadmapModal(null));

      // Listen for reactive store changes
      Store.on('store_updated', () => {
        // Can re-render sidebar stats or status if open
      });

      renderDashboard();
    },

    toggleDayCard: function(dayNumber) {
      const card = document.getElementById(`day-card-${dayNumber}`);
      if (card) card.classList.toggle('expanded');
    },

    toggleActivity: function(planId, dayNumber, activityId) {
      const result = Store.toggleActivityStatus(planId, dayNumber, activityId);
      if (result) {
        if (result.dayJustCompleted) {
          showToast(`🎉 Day ${dayNumber} completed! Keep the momentum!`, 'success');
        } else if (result.activity.status === 'completed') {
          showToast('✓ Activity completed', 'success');
        }
        renderDashboard();
      }
    },

    toggleActivityInModal: function(planId, dayNumber, activityId) {
      QL.ProgressUI.toggleActivity(planId, dayNumber, activityId);
      openDailyModal(planId, dayNumber);
    },

    startNextDay: function(planId) {
      Store.startNextDay(planId);
      showToast('Next day unlocked. Ready to learn!', 'info');
      renderDashboard();
    },

    openDailyModal: openDailyModal,
    closeDailyModal: closeDailyModal,

    // Modal Builder Bindings
    toggleModalTopic: function(topicId) {
      const idx = modalConfig.topicIds.indexOf(topicId);
      if (idx === -1) modalConfig.topicIds.push(topicId);
      else modalConfig.topicIds.splice(idx, 1);

      const card = document.getElementById(`topic-card-${topicId}`);
      if (card) card.classList.toggle('selected');

      updateLivePlanPreview();
    },

    setModalPace: function(pace) {
      modalConfig.pace = pace;
      document.querySelectorAll('.pace-card').forEach(el => el.classList.remove('selected'));
      event.currentTarget.classList.add('selected');
      updateLivePlanPreview();
    },

    setModalDailyTime: function(mins) {
      if (mins === 'custom') {
        const row = document.getElementById('custom-time-row');
        if (row) row.classList.add('visible');
        const sel = document.getElementById('custom-time-select');
        modalConfig.dailyStudyTimeMinutes = parseInt(sel.value, 10) || 45;
      } else {
        const row = document.getElementById('custom-time-row');
        if (row) row.classList.remove('visible');
        modalConfig.dailyStudyTimeMinutes = mins;
      }

      document.querySelectorAll('.time-btn').forEach(el => el.classList.remove('selected'));
      if (event && event.currentTarget) event.currentTarget.classList.add('selected');
      updateLivePlanPreview();
    },

    toggleModalStudyDay: function(day) {
      const idx = modalConfig.studyDays.indexOf(day);
      if (idx === -1) modalConfig.studyDays.push(day);
      else modalConfig.studyDays.splice(idx, 1);

      if (event && event.currentTarget) event.currentTarget.classList.toggle('selected');
      const countEl = document.getElementById('modal-days-count');
      if (countEl) countEl.textContent = `${modalConfig.studyDays.length} days/week`;

      updateLivePlanPreview();
    },

    setModalStartDate: function(dateStr) {
      modalConfig.startDateStr = dateStr;
      updateLivePlanPreview();
    }
  };

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    QL.ProgressUI.init();
  });
})();
