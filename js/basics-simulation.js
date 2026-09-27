/* ============================================================
   QUANTUMLAB – BASICS SIMULATION ENGINE
   js/basics-simulation.js
   
   Deterministic simulation state engine separating logic from 3D rendering.
   Manages:
   - Modes: 'classical' | 'quantum' | 'compare'
   - Stages: 1 through 8 (timeline & step-by-step)
   - Continuous normalized progress (0.0 -> 1.0)
   - Quantum superposition amplitudes, wave phases, and Born-rule measurement
   - Playback timing, stepping, pausing, and event dispatching
   ============================================================ */

(function (window) {
  'use strict';

  const STAGES = [
    {
      id: 1,
      name: 'Input',
      mode: 'classical',
      badge: 'Step 1 of 8',
      title: 'Initial State |START⟩',
      desc: 'Computational problem initialized: Find the exit through the labyrinth space.',
      math: '|ψ₀⟩ = |START⟩'
    },
    {
      id: 2,
      name: 'Classical Path',
      mode: 'classical',
      badge: 'Step 2 of 8',
      title: 'Deterministic Sequential Search',
      desc: 'Classical computation follows ONE definite route at a time. If it encounters a dead end, it must backtrack and re-evaluate.',
      math: 'x(t) ∈ {Path₁}'
    },
    {
      id: 3,
      name: 'Quantum State',
      mode: 'quantum',
      badge: 'Step 3 of 8',
      title: 'Transformation into Quantum Representation',
      desc: 'The single classical route dissolves into a continuum of computational basis states.',
      math: '|ψ⟩ = α₁|Path₁⟩ + α₂|Path₂⟩ + ...'
    },
    {
      id: 4,
      name: 'Branching',
      mode: 'quantum',
      badge: 'Step 4 of 8',
      title: 'Simultaneous Multi-Path Propagation',
      desc: 'At each bifurcation, quantum coherence distributes amplitude across all available corridors concurrently.',
      math: 'H|0⟩ = (|0⟩ + |1⟩)/√2'
    },
    {
      id: 5,
      name: 'Superposition',
      mode: 'quantum',
      badge: 'Step 5 of 8',
      title: 'Global Superposition of Trajectories',
      desc: 'All 7 distinct trajectories exist simultaneously within the quantum register with specific complex probability amplitudes.',
      math: '|ψ⟩ = ∑ᵢ αᵢ|Pathᵢ⟩,  ∑|αᵢ|² = 1'
    },
    {
      id: 6,
      name: 'Interference',
      mode: 'quantum',
      badge: 'Step 6 of 8',
      title: 'Interference & Amplitude Amplification',
      desc: 'Destructive interference suppresses dead-end paths, while constructive interference amplifies the exit trajectory.',
      math: 'P(Exit) = |∑ₖ Aₖ|²'
    },
    {
      id: 7,
      name: 'Measurement',
      mode: 'quantum',
      badge: 'Step 7 of 8',
      title: 'Wavefunction Collapse',
      desc: 'Observing the system collapses the superposition into a single observed classical outcome according to the Born Rule.',
      math: '|ψ⟩ ⟶ |Outcome⟩'
    },
    {
      id: 8,
      name: 'Result',
      mode: 'compare',
      badge: 'Step 8 of 8',
      title: 'Final Comparison & Speedup',
      desc: 'Classical search required O(N) sequential iterations; quantum superposition explored the entire solution space simultaneously.',
      math: 'T_quantum ≪ T_classical'
    }
  ];

  class QuantumBasicsSimulation {
    constructor() {
      this.mode = 'classical';          // 'classical' | 'quantum' | 'compare'
      this.currentStage = 2;            // 1 to 8
      this.isPlaying = true;
      this.speed = 1.0;                 // 0.5 to 2.0
      this.progress = 0.0;              // 0.0 to 1.0
      this.isMeasured = false;
      this.measuredBranchId = null;
      this.listeners = [];

      // Timing constants
      this.durationSeconds = 8.0;       // Duration of full run at 1x
      this.lastTimestamp = performance.now();
    }

    onUpdate(callback) {
      this.listeners.push(callback);
    }

    notify() {
      const state = this.getState();
      for (let i = 0; i < this.listeners.length; i++) {
        this.listeners[i](state);
      }
    }

    getState() {
      const stageInfo = STAGES[this.currentStage - 1] || STAGES[0];
      return {
        mode: this.mode,
        currentStage: this.currentStage,
        stageInfo: stageInfo,
        isPlaying: this.isPlaying,
        speed: this.speed,
        progress: this.progress,
        isMeasured: this.isMeasured,
        measuredBranchId: this.measuredBranchId
      };
    }

    setMode(mode) {
      if (this.mode === mode) return;
      this.mode = mode;
      if (mode === 'classical') {
        this.currentStage = 2;
        this.isMeasured = false;
      } else if (mode === 'quantum') {
        this.currentStage = 5;
        this.isMeasured = false;
      } else if (mode === 'compare') {
        this.currentStage = 8;
      }
      this.progress = 0.0;
      this.notify();
    }

    setStage(stageNum) {
      stageNum = Math.max(1, Math.min(8, stageNum));
      this.currentStage = stageNum;
      const stage = STAGES[stageNum - 1];
      this.mode = stage.mode;

      if (stageNum === 1) {
        this.progress = 0.05;
        this.isMeasured = false;
      } else if (stageNum === 2) {
        this.progress = 0.4;
        this.isMeasured = false;
      } else if (stageNum === 3) {
        this.progress = 0.2;
        this.isMeasured = false;
      } else if (stageNum === 4) {
        this.progress = 0.45;
        this.isMeasured = false;
      } else if (stageNum === 5) {
        this.progress = 0.7;
        this.isMeasured = false;
      } else if (stageNum === 6) {
        this.progress = 0.9;
        this.isMeasured = false;
      } else if (stageNum === 7) {
        this.measure();
      } else if (stageNum === 8) {
        this.progress = 1.0;
      }

      this.notify();
    }

    play() {
      this.isPlaying = true;
      this.lastTimestamp = performance.now();
      this.notify();
    }

    pause() {
      this.isPlaying = false;
      this.notify();
    }

    togglePlay() {
      if (this.isPlaying) this.pause(); else this.play();
    }

    reset() {
      this.progress = 0.0;
      this.isMeasured = false;
      this.measuredBranchId = null;
      this.lastTimestamp = performance.now();
      this.notify();
    }

    setSpeed(speedVal) {
      this.speed = Math.max(0.25, Math.min(3.0, speedVal));
      this.notify();
    }

    step() {
      this.pause();
      let nextStage = this.currentStage + 1;
      if (nextStage > 8) nextStage = 1;
      this.setStage(nextStage);
    }

    stepPrev() {
      this.pause();
      let prevStage = this.currentStage - 1;
      if (prevStage < 1) prevStage = 8;
      this.setStage(prevStage);
    }

    measure() {
      this.isMeasured = true;
      // In quantum computing, constructive interference makes the solution state overwhelmingly probable
      const branches = window.QuantumMaze.QUANTUM_BRANCHES;
      // Weighted random pick (Born rule):
      const rand = Math.random();
      if (rand < 0.88) {
        // High fidelity amplification of solution
        this.measuredBranchId = 'quantum_winning';
      } else {
        const deadEnds = branches.filter(b => !b.isWinning);
        const pick = deadEnds[Math.floor(Math.random() * deadEnds.length)];
        this.measuredBranchId = pick.id;
      }

      this.currentStage = 7;
      this.notify();
    }

    tick(time) {
      if (!this.isPlaying) {
        this.lastTimestamp = time;
        return;
      }

      const delta = (time - this.lastTimestamp) / 1000;
      this.lastTimestamp = time;

      // Advance progress
      const deltaProgress = (delta * this.speed) / this.durationSeconds;
      this.progress += deltaProgress;

      if (this.progress >= 1.0) {
        this.progress = 0.0;
        // Loop or transition
        if (this.isMeasured) {
          this.isMeasured = false;
          this.measuredBranchId = null;
        }
      }

      // Auto update stage based on progress when in full run
      if (this.mode === 'classical') {
        this.currentStage = this.progress < 0.2 ? 1 : 2;
      } else if (this.mode === 'quantum') {
        if (this.progress < 0.15) this.currentStage = 3;
        else if (this.progress < 0.45) this.currentStage = 4;
        else if (this.progress < 0.75) this.currentStage = 5;
        else if (this.progress < 0.95) this.currentStage = 6;
        else this.currentStage = 7;
      } else if (this.mode === 'compare') {
        this.currentStage = 8;
      }

      this.notify();
    }
  }

  window.BasicsSimulation = new QuantumBasicsSimulation();
  window.BasicsStages = STAGES;

})(window);
