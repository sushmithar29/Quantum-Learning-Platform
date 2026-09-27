/* ============================================================
   QUANTUMLAB – BASICS UI CONTROLLER
   js/basics-ui.js
   
   Binds HTML controls, timeline, HUD, and keyboard shortcuts
   to the simulation engine and 3D renderer.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const sim = window.BasicsSimulation;
  if (!sim) {
    console.error('Simulation engine not loaded.');
    return;
  }

  // Initialize 3D scene manager (handles single view & dual-frame compare)
  let mazeManager = null;
  if (window.QuantumMazeManager) {
    mazeManager = new window.QuantumMazeManager();
  }

  // UI Elements
  const modeClassicalBtn = document.getElementById('btn-mode-classical');
  const modeQuantumBtn   = document.getElementById('btn-mode-quantum');
  const modeCompareBtn   = document.getElementById('btn-mode-compare');

  const playPauseBtn     = document.getElementById('btn-play-pause');
  const stepBtn          = document.getElementById('btn-step');
  const resetBtn         = document.getElementById('btn-reset');
  const measureBtn       = document.getElementById('btn-measure');
  const speedBtns        = document.querySelectorAll('.basics-speed-btn');

  const camPerspectiveBtn= document.getElementById('btn-cam-perspective');
  const camTopDownBtn    = document.getElementById('btn-cam-topdown');
  const camCloseupBtn    = document.getElementById('btn-cam-closeup');
  const resetViewBtn     = document.getElementById('btn-reset-view');
  const fullscreenBtn    = document.getElementById('btn-fullscreen');

  const timelineItems    = document.querySelectorAll('.basics-timeline-step');
  const timelineProgress = document.getElementById('timeline-progress-bar');

  // Dynamic HUD overlays
  const hudBadge   = document.getElementById('hud-stage-badge');
  const hudTitle   = document.getElementById('hud-stage-title');
  const hudDesc    = document.getElementById('hud-stage-desc');
  const hudMath    = document.getElementById('hud-stage-math');
  const hudModeTag = document.getElementById('hud-mode-tag');
  const hudToggleBtn = document.getElementById('hud-toggle-btn');
  const hudEl = document.querySelector('.basics-hud');

  hudToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    hudEl?.classList.toggle('minimized');
    hudToggleBtn.textContent = hudEl?.classList.contains('minimized') ? '+' : '−';
  });

  // Mode button handlers
  modeClassicalBtn?.addEventListener('click', () => sim.setMode('classical'));
  modeQuantumBtn?.addEventListener('click',   () => sim.setMode('quantum'));
  modeCompareBtn?.addEventListener('click',   () => sim.setMode('compare'));

  // Play / Pause toggle
  playPauseBtn?.addEventListener('click', () => sim.togglePlay());

  // Step button
  stepBtn?.addEventListener('click', () => sim.step());

  // Reset button
  resetBtn?.addEventListener('click', () => sim.reset());

  // Measure button
  measureBtn?.addEventListener('click', () => sim.measure());

  // Speed selectors
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const spd = parseFloat(btn.getAttribute('data-speed') || '1');
      sim.setSpeed(spd);
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Camera preset handlers
  camPerspectiveBtn?.addEventListener('click', () => {
    mazeManager?.setCameraPreset('perspective');
    updateCamActive(camPerspectiveBtn);
  });

  camTopDownBtn?.addEventListener('click', () => {
    mazeManager?.setCameraPreset('topdown');
    updateCamActive(camTopDownBtn);
  });

  camCloseupBtn?.addEventListener('click', () => {
    mazeManager?.setCameraPreset('closeup');
    updateCamActive(camCloseupBtn);
  });

  resetViewBtn?.addEventListener('click', () => {
    mazeManager?.setCameraPreset('perspective');
    updateCamActive(camPerspectiveBtn);
  });

  function updateCamActive(activeBtn) {
    [camPerspectiveBtn, camTopDownBtn, camCloseupBtn].forEach(b => b?.classList.remove('active'));
    activeBtn?.classList.add('active');
  }

  // Fullscreen
  fullscreenBtn?.addEventListener('click', () => {
    const el = document.getElementById('basics-stage-container') || document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  });

  // Timeline click handlers
  timelineItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      sim.setStage(index + 1);
    });
  });

  // Sync UI with simulation updates
  sim.onUpdate((state) => {
    const { mode, currentStage, stageInfo, isPlaying, progress, isMeasured, measuredBranchId } = state;

    // Mode buttons active state
    modeClassicalBtn?.classList.toggle('active', mode === 'classical');
    modeQuantumBtn?.classList.toggle('active', mode === 'quantum');
    modeCompareBtn?.classList.toggle('active', mode === 'compare');

    // Play/Pause icon & label
    if (playPauseBtn) {
      if (isPlaying) {
        playPauseBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <span>Pause</span>
        `;
      } else {
        playPauseBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Play</span>
        `;
      }
    }

    // Timeline bar & stage highlight
    if (timelineProgress) {
      const pct = Math.min(100, Math.max(0, ((currentStage - 1) / 7) * 100));
      timelineProgress.style.width = `${pct}%`;
    }

    timelineItems.forEach((item, i) => {
      item.classList.toggle('active', i + 1 === currentStage);
      item.classList.toggle('passed', i + 1 < currentStage);
    });

    // HUD Content
    if (hudBadge) hudBadge.textContent = stageInfo.badge;
    if (hudTitle) hudTitle.textContent = stageInfo.title;
    if (hudDesc)  hudDesc.textContent  = stageInfo.desc;
    if (hudMath)  hudMath.textContent  = stageInfo.math;

    if (hudModeTag) {
      hudModeTag.textContent = mode.toUpperCase() + ' MODE';
      hudModeTag.className = `hud-mode-tag hud-mode-tag--${mode}`;
    }

    // Highlight measure button when in quantum mode
    if (measureBtn) {
      if (mode === 'classical') {
        measureBtn.style.opacity = '0.4';
        measureBtn.style.pointerEvents = 'none';
        measureBtn.title = 'Available in Quantum mode';
      } else {
        measureBtn.style.opacity = '1.0';
        measureBtn.style.pointerEvents = 'auto';
        measureBtn.title = 'Collapse quantum state into single observed outcome';
      }
    }
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      sim.togglePlay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      sim.step();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      sim.stepPrev();
    } else if (e.key === 'm' || e.key === 'M') {
      if (sim.mode !== 'classical') sim.measure();
    } else if (e.key === 'r' || e.key === 'R') {
      sim.reset();
    } else if (e.key === 'f' || e.key === 'F') {
      fullscreenBtn?.click();
    }
  });

  // Trigger initial UI update
  sim.notify();
});
