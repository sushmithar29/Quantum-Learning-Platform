/* ============================================================
   QUANTUMLAB – BASICS VIDEO INTERACTION CONTROLLER
   js/basics.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('basics-video');
  const audioBtn = document.getElementById('video-audio-btn');
  const audioIcon = document.getElementById('audio-icon');
  const audioLabel = document.getElementById('audio-label');
  const chapterBtns = document.querySelectorAll('.basics-chapter-btn');
  const speedBtns = document.querySelectorAll('.basics-speed-btn');
  const replayBtn = document.getElementById('btn-replay');
  const fsBtn = document.getElementById('btn-fullscreen');
  const loopBtn = document.getElementById('btn-loop');
  const playPauseBtn = document.getElementById('btn-play-pause');

  if (!video) return;

  // Unmute / Mute Toggle
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      updateAudioState();
    });
  }

  function updateAudioState() {
    if (!audioBtn) return;
    if (video.muted) {
      audioBtn.classList.remove('unmuted');
      audioLabel.textContent = 'Unmute Sound';
      audioIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      `;
    } else {
      audioBtn.classList.add('unmuted');
      audioLabel.textContent = 'Mute Sound';
      audioIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      `;
    }
  }

  // Chapter buttons seeking
  chapterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const time = parseFloat(btn.getAttribute('data-time') || '0');
      video.currentTime = time;
      video.play().catch(() => {});
      updateActiveChapter(time);
    });
  });

  // Track video progress and highlight active chapter
  video.addEventListener('timeupdate', () => {
    updateActiveChapter(video.currentTime);
  });

  function updateActiveChapter(currentTime) {
    let activeBtn = null;
    chapterBtns.forEach(btn => {
      const t = parseFloat(btn.getAttribute('data-time') || '0');
      if (currentTime >= t) {
        activeBtn = btn;
      }
    });

    chapterBtns.forEach(btn => {
      btn.classList.toggle('active', btn === activeBtn);
    });
  }

  // Play / Pause toggle
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      playPauseBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        <span>Pause</span>
      `;
    });

    video.addEventListener('pause', () => {
      playPauseBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5"></polygon></svg>
        <span>Play</span>
      `;
    });
  }

  // Replay
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  }

  // Loop toggle
  if (loopBtn) {
    loopBtn.addEventListener('click', () => {
      video.loop = !video.loop;
      loopBtn.style.color = video.loop ? 'var(--cyan-light)' : 'var(--text-secondary)';
      loopBtn.style.borderColor = video.loop ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.07)';
    });
  }

  // Playback speeds
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.getAttribute('data-speed') || '1');
      video.playbackRate = speed;
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Fullscreen
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      const target = document.querySelector('.basics-video-showcase') || video;
      if (!document.fullscreenElement) {
        if (target.requestFullscreen) {
          target.requestFullscreen();
        } else if (target.webkitRequestFullscreen) {
          target.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    // Ignore if focus is in an input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (video.paused) video.play(); else video.pause();
    } else if (e.key === 'm' || e.key === 'M') {
      video.muted = !video.muted;
      updateAudioState();
    } else if (e.key === 'f' || e.key === 'F') {
      fsBtn?.click();
    } else if (e.key === 'r' || e.key === 'R') {
      replayBtn?.click();
    }
  });

  // Initial state check
  updateAudioState();
});
