/* ============================================================
   QUANTUMLAB – ALGORITHMS MODULE (HOMEPAGE INTEGRATION)
   Renders the 15 Virtual Lab Algorithm Experiments
   ============================================================ */

window.QL = window.QL || {};

QL.renderAlgorithms = function () {
  const track = document.getElementById('algorithms-track');
  if (!track) return;

  const experiments = QL.algorithmsVLabData || (QL.data && QL.data.algorithms) || [];
  if (experiments.length === 0) {
    track.innerHTML = `
      <div style="padding: 2.5rem 1rem; width: 100%; text-align: center; color: var(--text-muted); font-size: 0.95rem;">
        No algorithms available yet.
      </div>
    `;
    return;
  }

  track.innerHTML = experiments.map((exp, i) => `
    <div class="exp-card anim-hidden" data-algo="${exp.id || exp.slug}" id="algo-card-${exp.id || exp.slug}" style="animation-delay:${i * 0.05}s; cursor:pointer;">
      <div style="padding:1.25rem 1.25rem 0.5rem; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--cyan); font-weight:700;">EXP ${exp.number || (i + 1 < 10 ? '0' + (i + 1) : i + 1)}</span>
        <span class="exp-card__badge badge--${((exp.difficulty || exp.level) || 'intermediate').toLowerCase()}">${exp.difficulty || exp.level || 'Virtual Lab'}</span>
      </div>
      <div class="exp-card__body" style="padding-top:0.25rem;">
        <div class="exp-card__name" style="font-size:1.05rem; line-height:1.35; margin-bottom:0.4rem;">${exp.title || exp.name}</div>
        <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:0.6rem;">${exp.category || 'Quantum Algorithm'}</div>
        <div class="exp-card__desc" style="font-size:0.82rem; line-height:1.5; color:var(--text-secondary); display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${exp.aim || exp.desc || ''}</div>
        <div class="exp-card__footer" style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:0.75rem; color:var(--text-muted);">${exp.time || '30 min'}</span>
          <span class="exp-card__explore" style="color:var(--cyan);">
            Enter Lab
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </div>
  `).join('');

  // Click navigates to dedicated Virtual Lab experiment page
  track.querySelectorAll('.exp-card').forEach(card => {
    card.addEventListener('click', () => {
      const algoId = card.dataset.algo;
      window.location.href = `algorithms/${algoId}.html`;
    });
  });

  // Init Carousel if available
  if (typeof QL.initCarousel === 'function') {
    QL.initCarousel('algorithms-track', 'algo-prev', 'algo-next');
  }
};
