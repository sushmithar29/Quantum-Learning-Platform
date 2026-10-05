/**
 * QuantumLab — IBM Quantum Run Feature
 * Single global namespace: window.QuantumLabIBM
 *
 * Security rules (strictly enforced):
 *  - API key is NEVER stored in localStorage, sessionStorage, cookies, URLs, or logs.
 *  - Key lives only in the closure variable _apiKey (cleared on disconnect).
 *  - Key is sent only via X-IBM-Token request header over HTTPS (or localhost dev).
 *  - All log/error text is redacted via _redact() before any output.
 *  - No eval(), no innerHTML with external data (only textContent / safe DOM builds).
 *  - No third-party scripts are loaded by this module.
 *
 * Qubit ordering note (matches Qiskit convention):
 *  Qiskit uses LITTLE-ENDIAN: qubit 0 is the RIGHTMOST bit in the bitstring.
 *  e.g. a Bell state measures "00" and "11" — both with ~50% probability.
 *  This is explained in the UI and applied identically for ideal and real results.
 */

;(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  // Base URL of the IBM FastAPI backend. Change in production.
  const API_BASE = (function () {
    const stored = window.QIBM_API_BASE;
    if (stored) return stored.replace(/\/$/, '');
    return 'http://127.0.0.1:8001'; // local dev default
  })();

  // ─── SECRET STORE (closure-only, never serialised) ─────────────────────────
  let _apiKey = null;        // cleared on disconnect or page unload
  let _connected = false;
  let _selectedMachine = 'best'; // 'best' or a backend name string
  let _activeJobId = null;
  let _pollTimer = null;
  let _elapsedTimer = null;
  let _elapsedSec = 0;
  let _currentCircuit = null; // { qasm, name, qubits }
  let _idealResult = null;    // { counts, probabilities, provenance }
  let _realResult  = null;    // { counts, probabilities, provenance, job_id, machine }
  let _shots = 1024;
  let _currentStep = 1;       // wizard step 1-6
  let _practiceMode = false;

  /** Redact the API key from any string before logging. */
  function _redact(s) {
    if (!_apiKey) return String(s);
    return String(s).split(_apiKey).join('[REDACTED]');
  }

  // ─── PRESETS ───────────────────────────────────────────────────────────────
  const PRESETS = {
    bell: {
      name: 'Bell State',
      icon: '🔔',
      qubits: 2,
      desc: 'Maximally entangled 2-qubit state. Ideal: 50% |00⟩, 50% |11⟩.',
      ideal_counts: { '00': 0.5, '11': 0.5 },
      qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`
    },
    ghz: {
      name: '3-Qubit GHZ',
      icon: '🌀',
      qubits: 3,
      desc: '3-qubit entangled state. Ideal: 50% |000⟩, 50% |111⟩.',
      ideal_counts: { '000': 0.5, '111': 0.5 },
      qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0],q[1];
cx q[1],q[2];
measure q -> c;`
    },
    superposition: {
      name: 'Superposition',
      icon: '⚛️',
      qubits: 1,
      desc: 'Single qubit in equal superposition. Ideal: 50% |0⟩, 50% |1⟩.',
      ideal_counts: { '0': 0.5, '1': 0.5 },
      qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[1];
creg c[1];
h q[0];
measure q -> c;`
    }
  };

  // ─── LEARN DRAWER CONTENT ──────────────────────────────────────────────────
  const LEARN_CONTENT = {
    shot: '<strong>Shot:</strong> One execution of the circuit from start to finish. We repeat it ' +
          'many times (e.g. 1024×) to build up probability statistics, because quantum measurement ' +
          'is probabilistic — each run may give a different answer.',
    noise: '<strong>Noise:</strong> Unwanted interactions between qubits and their environment. ' +
           'Sources include thermal fluctuations, imperfect gates (gate error ~0.1–1%), and crosstalk ' +
           'between neighbouring qubits. Noise is why real hardware results differ from ideal simulation.',
    queue: '<strong>Queue:</strong> IBM\'s quantum computers are shared globally. Your job waits in ' +
           'a queue behind other users\' jobs. Free accounts may wait minutes to hours. ' +
           'Premium accounts have shorter queues.',
    'ideal-vs-real': '<strong>Ideal vs Real:</strong> An ideal simulation is a perfect mathematical ' +
                     'calculation with no errors. A real quantum computer has physical imperfections — ' +
                     'gate errors, decoherence, and readout errors — that cause small but measurable ' +
                     'differences in the output distribution.',
    'qubit-order': '<strong>Qubit order (Qiskit convention):</strong> Qiskit uses little-endian ' +
                   'ordering — qubit 0 is the <em>rightmost</em> bit in a bitstring. So in a 2-qubit ' +
                   'Bell state, the label "11" means both qubit 0 AND qubit 1 measured |1⟩. ' +
                   'This is the same convention used on both sides of the comparison here.'
  };

  // ─── HISTORY (localStorage — no keys ever stored) ─────────────────────────
  const HISTORY_KEY = 'qibm_run_history_v1';

  function _loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
  }

  function _saveHistory(arr) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, 20))); }
    catch { /* storage full — silently ignore */ }
  }

  function _addHistoryEntry(entry) {
    const arr = _loadHistory();
    arr.unshift(entry);
    _saveHistory(arr);
  }

  // ─── MATH: METRICS ─────────────────────────────────────────────────────────
  /**
   * Hellinger Fidelity between two probability distributions P and Q.
   * Formula: F = (sum_x sqrt(P(x) * Q(x)))^2
   * Range: 0 (completely different) to 1 (identical).
   * Returns value in [0, 1].
   *
   * Reference: Hellinger (1909), used in quantum information as a similarity
   * measure between shot-based distributions.
   */
  function hellingerFidelity(p, q) {
    const allKeys = new Set([...Object.keys(p), ...Object.keys(q)]);
    let sum = 0;
    for (const k of allKeys) {
      const pk = p[k] || 0;
      const qk = q[k] || 0;
      sum += Math.sqrt(pk * qk);
    }
    return sum * sum; // F in [0,1]
  }

  /**
   * Total Variation Distance between two probability distributions P and Q.
   * Formula: TVD = 0.5 * sum_x |P(x) - Q(x)|
   * Range: 0 (identical) to 1 (completely different).
   *
   * Reference: Standard measure in probability theory; TVD = 1 - Fidelity (Bhattacharyya)
   * for classical distributions.
   */
  function totalVariationDistance(p, q) {
    const allKeys = new Set([...Object.keys(p), ...Object.keys(q)]);
    let sum = 0;
    for (const k of allKeys) {
      sum += Math.abs((p[k] || 0) - (q[k] || 0));
    }
    return sum / 2;
  }

  /** Convert raw counts dict to probability distribution (must sum to 1). */
  function countsToProbabilities(counts) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return {};
    const probs = {};
    for (const [k, v] of Object.entries(counts)) {
      probs[k] = v / total;
    }
    return probs;
  }

  /** Score label from fidelity value (0-1). */
  function scoreLabel(f) {
    const pct = Math.round(f * 100);
    if (pct >= 90) return { label: 'Very close', cls: 'great', guide: 'Excellent result — this machine is performing well.' };
    if (pct >= 75) return { label: 'Close', cls: 'good', guide: 'Good result — small noise effects visible.' };
    if (pct >= 55) return { label: 'Noticeably noisy', cls: 'fair', guide: 'Moderate noise — typical for current NISQ hardware.' };
    return { label: 'Very noisy', cls: 'poor', guide: 'High noise — the circuit may be too deep or the machine is busy.' };
  }

  // ─── DOM HELPERS ───────────────────────────────────────────────────────────
  function $$(id) { return document.getElementById(id); }
  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'cls') { e.className = v; }
        else if (k === 'text') { e.textContent = v; }
        else if (k.startsWith('on')) { e.addEventListener(k.slice(2), v); }
        else { e.setAttribute(k, v); }
      }
    }
    for (const c of children) {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c instanceof Node) e.appendChild(c);
    }
    return e;
  }

  // ─── API CALLS (key always in header, never in body/URL/log) ───────────────
  async function _apiFetch(path, opts = {}) {
    const url = API_BASE + path;
    const headers = { 'Content-Type': 'application/json' };
    if (_apiKey) headers['X-IBM-Token'] = _apiKey;  // key only here
    try {
      const resp = await fetch(url, { ...opts, headers: { ...headers, ...opts.headers } });
      const data = await resp.json();
      if (!resp.ok) throw new Error(_redact(data.detail || data.error || 'Server error'));
      return data;
    } catch (err) {
      throw new Error(_redact(err.message));
    }
  }

  // ─── STEP MANAGEMENT ───────────────────────────────────────────────────────
  function _goToStep(n) {
    _currentStep = n;
    // Update progress dots
    document.querySelectorAll('.qibm-step-item').forEach((item, i) => {
      const step = i + 1;
      item.classList.toggle('active', step === n);
      item.classList.toggle('completed', step < n);
    });
    // Show correct panel
    document.querySelectorAll('.qibm-panel').forEach((p, i) => {
      p.classList.toggle('active', i + 1 === n);
    });
    // Scroll into view
    const section = $$('qibm-run');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ─── CIRCUIT SELECTION (Step 1) ────────────────────────────────────────────
  function _initStep1() {
    // Preset buttons
    document.querySelectorAll('[data-qibm-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.qibmPreset;
        const preset = PRESETS[key];
        if (!preset) return;
        _currentCircuit = { qasm: preset.qasm, name: preset.name, qubits: preset.qubits };
        // Update QASM box
        const qbox = $$('qibm-qasm-input');
        if (qbox) qbox.value = preset.qasm;
        document.querySelectorAll('[data-qibm-preset]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        _setStatus1('');
      });
    });

    // Default: Bell state
    const bellBtn = document.querySelector('[data-qibm-preset="bell"]');
    if (bellBtn) bellBtn.click();

    // QASM textarea changes
    const qbox = $$('qibm-qasm-input');
    if (qbox) {
      qbox.addEventListener('input', () => {
        document.querySelectorAll('[data-qibm-preset]').forEach(b => b.classList.remove('selected'));
        _currentCircuit = { qasm: qbox.value.trim(), name: 'Custom', qubits: null };
      });
    }

    $$('qibm-next-1').addEventListener('click', () => {
      const qbox2 = $$('qibm-qasm-input');
      const qasm = (qbox2 ? qbox2.value.trim() : '') || (_currentCircuit && _currentCircuit.qasm) || '';
      if (!qasm) { _setStatus1('Please choose a preset or enter an OpenQASM circuit.', 'error'); return; }
      _currentCircuit = { ..._currentCircuit, qasm };
      _goToStep(2);
    });
  }

  function _setStatus1(msg, type) {
    const el2 = $$('qibm-status-1');
    if (!el2) return;
    el2.textContent = msg;
    el2.className = 'qibm-alert' + (type ? ' qibm-alert--' + type : ' qibm-alert--info');
    el2.style.display = msg ? '' : 'none';
  }

  // ─── CONNECT IBM (Step 2) ──────────────────────────────────────────────────
  function _initStep2() {
    $$('qibm-back-1').addEventListener('click', () => _goToStep(1));
    $$('qibm-connect-btn').addEventListener('click', _doConnect);
    $$('qibm-practice-btn').addEventListener('click', _doPractice);
    $$('qibm-disconnect-btn').addEventListener('click', _doDisconnect);

    // Replay button (only shown if hardware-replay.json has data)
    const replayBtn = $$('qibm-replay-btn');
    if (replayBtn) replayBtn.addEventListener('click', _doReplay);

    // Allow Enter key in key input
    $$('qibm-key-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') _doConnect();
    });
  }

  async function _doConnect() {
    const keyRaw = ($$('qibm-key-input').value || '').trim();
    if (!keyRaw || keyRaw.length < 10) {
      _setStatus2('Please paste your IBM Quantum API key.', 'error'); return;
    }
    _apiKey = keyRaw;
    // Immediately clear the input so the key is not visible in the DOM
    $$('qibm-key-input').value = '';
    _setStatus2('Connecting to IBM Quantum…', 'info');
    $$('qibm-connect-btn').disabled = true;

    try {
      const data = await _apiFetch('/ibm/connect', {
        method: 'POST',
        body: JSON.stringify({ instance: '' })
      });
      _connected = true;
      _practiceMode = false;
      _setStatus2('Connected! Found ' + data.backends.length + ' available machines.', 'success');
      // Store backends for step 3
      window._qibmBackends = data.backends;
      setTimeout(() => { _goToStep(3); _initStep3(); }, 700);
    } catch (err) {
      _apiKey = null; // discard on failure
      _connected = false;
      _setStatus2('Connection failed: ' + err.message, 'error');
      $$('qibm-connect-btn').disabled = false;
    }
  }

  function _doPractice() {
    _apiKey = null;
    _connected = false;
    _practiceMode = true;
    window._qibmBackends = [{ name: 'Practice Simulator', qubits: 127, status: 'online', is_simulated: true }];
    _goToStep(3);
    _initStep3();
  }

  function _doDisconnect() {
    _apiKey = null;
    _connected = false;
    _practiceMode = false;
    $$('qibm-key-input').value = '';
    _setStatus2('Disconnected. Your key has been cleared from memory.', 'warn');
  }

  async function _doReplay() {
    try {
      const resp = await fetch('assets/hardware-replay.json');
      const data = await resp.json();
      if (!data || !data.runs || !data.runs.length) throw new Error('No replay data available.');
      const run = data.runs[0]; // use first recorded run
      _idealResult = run.ideal;
      _realResult  = { ...run.real, provenance: 'replay' };
      _goToStep(6);
      _renderCompare();
    } catch (err) {
      _setStatus2('Replay unavailable: ' + err.message, 'error');
    }
  }

  function _setStatus2(msg, type) {
    const el2 = $$('qibm-status-2');
    if (!el2) return;
    el2.textContent = msg;
    el2.className = 'qibm-alert qibm-alert--' + (type || 'info');
    el2.style.display = '';
  }

  // ─── CHOOSE MACHINE (Step 3) ───────────────────────────────────────────────
  function _initStep3() {
    $$('qibm-back-2').addEventListener('click', () => _goToStep(2));
    $$('qibm-next-3').addEventListener('click', () => {
      _goToStep(4);
      _initStep4();
    });

    const backends = window._qibmBackends || [];
    const list = $$('qibm-machine-list');
    if (!list) return;
    list.innerHTML = '';

    // "Best available" option
    const best = el('div', { cls: 'qibm-machine-item selected', role: 'radio', 'aria-checked': 'true', tabindex: '0' });
    best.appendChild(el('div', {}, el('div', { cls: 'qibm-machine-name', text: 'Best available (recommended)' }), el('div', { cls: 'qibm-machine-meta', text: 'Automatically selects the least busy suitable machine.' })));
    const bestSt = el('span', { cls: 'qibm-machine-status qibm-machine-status--online', text: 'Auto' });
    best.appendChild(bestSt);
    best.addEventListener('click', () => {
      _selectedMachine = 'best';
      list.querySelectorAll('.qibm-machine-item').forEach(i => { i.classList.remove('selected'); i.setAttribute('aria-checked', 'false'); });
      best.classList.add('selected'); best.setAttribute('aria-checked', 'true');
    });
    list.appendChild(best);

    backends.forEach(b => {
      if (b.is_simulated) return; // practice mode: show practice only
      const item = el('div', { cls: 'qibm-machine-item', role: 'radio', 'aria-checked': 'false', tabindex: '0' });
      const stCls = b.status === 'online' ? 'online' : b.status === 'busy' ? 'busy' : 'offline';
      const stTxt = b.status === 'online' ? 'Online' : b.status === 'busy' ? 'Busy' : 'Offline';
      item.appendChild(el('div', {},
        el('div', { cls: 'qibm-machine-name', text: b.name }),
        el('div', { cls: 'qibm-machine-meta', text: b.qubits + ' qubits · ' + (b.queue_length != null ? b.queue_length + ' jobs in queue' : 'queue unknown') })
      ));
      item.appendChild(el('span', { cls: 'qibm-machine-status qibm-machine-status--' + stCls, text: stTxt }));
      item.addEventListener('click', () => {
        _selectedMachine = b.name;
        list.querySelectorAll('.qibm-machine-item').forEach(i => { i.classList.remove('selected'); i.setAttribute('aria-checked', 'false'); });
        item.classList.add('selected'); item.setAttribute('aria-checked', 'true');
      });
      list.appendChild(item);
    });

    if (_practiceMode) {
      const pItem = el('div', { cls: 'qibm-machine-item selected' });
      pItem.appendChild(el('div', {},
        el('div', { cls: 'qibm-machine-name', text: 'Practice Simulator' }),
        el('div', { cls: 'qibm-machine-meta', text: 'Simulated noise — not real hardware. No account needed.' })
      ));
      pItem.appendChild(el('span', { cls: 'qibm-machine-status qibm-machine-status--busy', text: 'Practice' }));
      list.appendChild(pItem);
      _selectedMachine = 'practice';
    }
  }

  // ─── REVIEW (Step 4) ───────────────────────────────────────────────────────
  function _initStep4() {
    $$('qibm-back-3').addEventListener('click', () => _goToStep(3));

    // Count qubits from QASM (rough)
    let qubits = (_currentCircuit && _currentCircuit.qubits) || _parseQasmQubits(_currentCircuit.qasm);

    const rangeEl = $$('qibm-shots-range');
    if (rangeEl) {
      rangeEl.value = _shots;
      rangeEl.addEventListener('input', () => {
        _shots = parseInt(rangeEl.value);
        const sv = $$('qibm-shots-val');
        if (sv) sv.textContent = _shots;
      });
    }
    const sv = $$('qibm-shots-val');
    if (sv) sv.textContent = _shots;

    // Fill summary
    _fillSummary(qubits);

    // Estimate
    _doEstimate(qubits);

    $$('qibm-run-btn').addEventListener('click', _doRun);
  }

  function _parseQasmQubits(qasm) {
    if (!qasm) return 2;
    const m = qasm.match(/qreg\s+\w+\[(\d+)\]/);
    return m ? parseInt(m[1]) : 2;
  }

  function _fillSummary(qubits) {
    const machine = _practiceMode ? 'Practice Simulator' : (_selectedMachine === 'best' ? 'Best available' : _selectedMachine);
    const items = {
      'qibm-sum-qubits'  : String(qubits),
      'qibm-sum-shots'   : String(_shots),
      'qibm-sum-machine' : machine,
      'qibm-sum-circuit' : (_currentCircuit && _currentCircuit.name) || 'Custom'
    };
    for (const [id, val] of Object.entries(items)) {
      const el2 = $$(id);
      if (el2) el2.textContent = val;
    }
  }

  async function _doEstimate(qubits) {
    const estimateEl = $$('qibm-estimate-text');
    if (!estimateEl) return;
    if (_practiceMode) {
      estimateEl.textContent = 'Practice mode: runs instantly in the browser, uses no IBM credits.';
      return;
    }
    estimateEl.textContent = 'Calculating estimate…';
    try {
      const data = await _apiFetch('/ibm/estimate', {
        method: 'POST',
        body: JSON.stringify({ qubits, shots: _shots, depth: 5 })
      });
      let txt = '';
      if (data.estimated_seconds != null) txt += 'Estimated QPU time: ~' + data.estimated_seconds + 's. ';
      if (data.free_time_warning) txt += data.free_time_warning;
      estimateEl.textContent = txt || 'Estimate ready.';
    } catch { estimateEl.textContent = 'Estimate unavailable (backend offline).'; }
  }

  // ─── RUN (Step 5 + 6) ─────────────────────────────────────────────────────
  async function _doRun() {
    if (!_currentCircuit || !_currentCircuit.qasm) { return; }
    _goToStep(5);
    _initStep5();

    // First, get ideal result
    _updateTrackerMsg('Computing ideal simulation…');
    try {
      const idealData = await _apiFetch('/ideal/run', {
        method: 'POST',
        body: JSON.stringify({ qasm: _currentCircuit.qasm, shots: _shots })
      });
      _idealResult = {
        counts: idealData.counts,
        probabilities: idealData.probabilities,
        provenance: 'ideal'
      };
    } catch (err) {
      _showError5('Ideal simulation failed: ' + err.message); return;
    }

    if (_practiceMode) {
      _updateTrackerMsg('Running with simulated noise…');
      try {
        const practData = await _apiFetch('/practice/run', {
          method: 'POST',
          body: JSON.stringify({ qasm: _currentCircuit.qasm, shots: _shots })
        });
        _realResult = {
          counts: practData.counts,
          probabilities: practData.probabilities,
          provenance: 'practice',
          machine: 'Practice Simulator'
        };
        _clearTrackerTimers();
        _goToStep(6);
        _renderCompare();
      } catch (err) {
        _showError5('Practice simulation failed: ' + err.message);
      }
      return;
    }

    // Real hardware path
    _updateTrackerMsg('Submitting job to IBM Quantum…');
    try {
      const runData = await _apiFetch('/ibm/run', {
        method: 'POST',
        body: JSON.stringify({
          qasm: _currentCircuit.qasm,
          shots: _shots,
          backend: _selectedMachine === 'best' ? null : _selectedMachine
        })
      });
      _activeJobId = runData.job_id;
      $$('qibm-job-id-display').textContent = 'Job ID: ' + _activeJobId;
      $$('qibm-job-id-display').style.display = '';
      _pollJob(_activeJobId);
    } catch (err) {
      _showError5(err.message);
    }
  }

  function _initStep5() {
    _elapsedSec = 0;
    _clearTrackerTimers();
    _elapsedTimer = setInterval(() => {
      _elapsedSec++;
      const et = $$('qibm-elapsed');
      if (et) et.textContent = 'Elapsed: ' + _elapsedSec + 's';
    }, 1000);

    const cancelBtn = $$('qibm-cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = async () => {
        if (!_activeJobId) return;
        cancelBtn.disabled = true;
        try {
          await _apiFetch('/ibm/job/' + encodeURIComponent(_activeJobId) + '/cancel', { method: 'POST' });
          _clearTrackerTimers();
          _showError5('Job cancelled.');
        } catch (err) {
          _showError5('Cancel failed: ' + err.message);
        }
      };
    }
  }

  function _updateTrackerMsg(msg) {
    const el2 = $$('qibm-tracker-msg');
    if (el2) el2.textContent = msg;
    // ARIA live region
    const lr = $$('qibm-live-region');
    if (lr) lr.textContent = msg;
  }

  function _showError5(msg) {
    _clearTrackerTimers();
    const anim = $$('qibm-tracker-anim');
    if (anim) { anim.style.borderTopColor = '#f87171'; anim.style.animationPlayState = 'paused'; }
    _updateTrackerMsg('Error: ' + msg);
    const meta = $$('qibm-tracker-meta');
    if (meta) meta.textContent = 'You can go back and try again.';
    const backBtn = $$('qibm-back-5');
    if (backBtn) backBtn.style.display = '';
  }

  function _pollJob(jobId) {
    _updateTrackerMsg('In line… checking status…');
    _pollTimer = setInterval(async () => {
      try {
        const data = await _apiFetch('/ibm/job/' + encodeURIComponent(jobId));
        const s = data.status;
        if (s === 'queued') {
          _updateTrackerMsg('In line' + (data.queue_position ? ' (position ' + data.queue_position + ')' : '') + '…');
        } else if (s === 'running') {
          _updateTrackerMsg('Running on the quantum computer…');
        } else if (s === 'done') {
          _clearTrackerTimers();
          _realResult = {
            counts: data.counts,
            probabilities: countsToProbabilities(data.counts),
            provenance: 'real',
            job_id: jobId,
            machine: data.machine,
            finished_at: data.finished_at,
            calibration: data.calibration
          };
          _addHistoryEntry({
            job_id: jobId,
            machine: data.machine,
            date: new Date().toISOString(),
            circuit: (_currentCircuit && _currentCircuit.name) || 'Custom',
            counts: data.counts
          });
          _goToStep(6);
          _renderCompare();
        } else if (s === 'failed') {
          _clearTrackerTimers();
          _showError5('Job failed on IBM hardware. Try a different machine or smaller circuit.');
        } else if (s === 'cancelled') {
          _clearTrackerTimers();
          _showError5('Job was cancelled.');
        }
      } catch (err) {
        _updateTrackerMsg('Checking status… (' + err.message + ')');
      }
    }, 4000);
  }

  function _clearTrackerTimers() {
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
    if (_elapsedTimer) { clearInterval(_elapsedTimer); _elapsedTimer = null; }
  }

  // ─── COMPARE (Step 6) ─────────────────────────────────────────────────────
  function _renderCompare() {
    if (!_idealResult || !_realResult) return;

    const idP = _idealResult.probabilities || countsToProbabilities(_idealResult.counts || {});
    const reP = _realResult.probabilities  || countsToProbabilities(_realResult.counts  || {});

    // Draw histograms
    _drawHistogram('qibm-hist-ideal', idP, '#22c55e');
    _drawHistogram('qibm-hist-real', reP, '#3b82f6');

    // Provenance labels
    _setProvenance('qibm-prov-ideal', 'ideal', 'Ideal (simulated)');
    const provReal = _realResult.provenance === 'replay'
      ? ('replay', 'Recorded real run · job ' + (_realResult.job_id || 'N/A'))
      : _realResult.provenance === 'practice'
      ? ('practice', 'Simulated noise (not real hardware)')
      : ('real', 'Real hardware: ' + (_realResult.machine || '?') + ' · job ' + (_realResult.job_id || 'N/A'));
    const provCls = _realResult.provenance === 'replay' ? 'replay'
                  : _realResult.provenance === 'practice' ? 'practice' : 'real';
    _setProvenance('qibm-prov-real', provCls, provReal[1] || provReal);

    // Metrics
    const fidelity = hellingerFidelity(idP, reP);
    const tvd = totalVariationDistance(idP, reP);
    const pct = Math.round(fidelity * 100);
    const info = scoreLabel(fidelity);

    const scoreEl = $$('qibm-gauge-score');
    if (scoreEl) {
      scoreEl.textContent = pct + '%';
      scoreEl.className = 'qibm-gauge-score qibm-gauge-score--' + info.cls;
    }
    const meaningEl = $$('qibm-gauge-meaning');
    if (meaningEl) meaningEl.textContent = info.label;
    const guideEl = $$('qibm-gauge-guide');
    if (guideEl) guideEl.textContent = info.guide + ' (TVD: ' + tvd.toFixed(3) + ')';

    // Job metadata
    if (_realResult.job_id) {
      const jmeta = $$('qibm-result-meta');
      if (jmeta) {
        jmeta.innerHTML = '';
        const chips = [
          _realResult.machine && ('Machine: ' + _realResult.machine),
          _realResult.job_id && ('Job: ' + _realResult.job_id),
          _realResult.finished_at && ('Completed: ' + new Date(_realResult.finished_at).toLocaleString())
        ].filter(Boolean);
        chips.forEach(t => {
          const c = el('span', { cls: 'qibm-job-chip', text: t });
          jmeta.appendChild(c);
        });
      }
    }

    // Unexpected outcomes
    _renderUnexpected(idP, reP);

    // Noise explanation
    _renderNoisePanel(fidelity, tvd, _realResult.calibration);

    // What to try
    _renderTryNext(fidelity);

    // History panel
    _renderHistory();
  }

  function _setProvenance(elId, cls, text) {
    const e = $$(elId);
    if (!e) return;
    e.textContent = text;
    e.className = 'qibm-provenance qibm-provenance--' + cls;
  }

  function _drawHistogram(canvasId, probs, color) {
    const canvas = $$(canvasId);
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || canvas.width || 300;
    const H = canvas.height || 200;
    canvas.width = W;
    ctx.clearRect(0, 0, W, H);

    const keys = Object.keys(probs).sort();
    if (!keys.length) return;
    const maxP = Math.max(...Object.values(probs), 0.01);
    const barW = Math.max(8, Math.floor((W - 40) / keys.length) - 4);
    const gap   = Math.floor((W - 40 - barW * keys.length) / (keys.length + 1));
    const padB  = 36, padT = 10;
    const chartH = H - padB - padT;

    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(30, padT, W - 34, chartH);

    keys.forEach((k, i) => {
      const p = probs[k] || 0;
      const bH = Math.round((p / maxP) * chartH);
      const x = 34 + i * (barW + gap) + gap;
      const y = padT + chartH - bH;

      // Bar
      ctx.fillStyle = color + 'cc';
      ctx.fillRect(x, y, barW, bH);

      // Percentage text inside bar
      if (bH > 18) {
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(p * 100) + '%', x + barW / 2, y + 14);
      }

      // Key label below
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(k, x + barW / 2, H - 8);

      // Pattern fill for colorblind safety (diagonal hatch)
      if (barW >= 14 && bH >= 8) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        for (let d = -bH; d < barW; d += 6) {
          ctx.beginPath();
          ctx.moveTo(x + Math.max(0, d), y);
          ctx.lineTo(x + Math.min(barW, d + bH), y + Math.min(bH, barW - d));
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    // Y-axis label
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.translate(12, padT + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Probability', 0, 0);
    ctx.restore();
  }

  function _renderUnexpected(idealP, realP) {
    const wrap = $$('qibm-unexpected-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    const unexpected = Object.entries(realP).filter(([k, v]) => {
      return v > 0.02 && (idealP[k] || 0) < 0.01;
    });
    if (!unexpected.length) {
      wrap.appendChild(el('span', { cls: 'qibm-alert qibm-alert--success' },
        '✓ No significant unexpected outcomes — the distribution matches well.'));
      return;
    }
    const title = el('p', { cls: 'qibm-noise-title' }, '⚠ Unexpected outcomes (appear in real, not ideal):');
    wrap.appendChild(title);
    const list = el('div', { cls: 'qibm-unexpected-list' });
    unexpected.forEach(([k, v]) => {
      list.appendChild(el('span', { cls: 'qibm-unexpected-chip', text: '|' + k + '⟩ ' + Math.round(v * 100) + '%' }));
    });
    wrap.appendChild(list);
  }

  function _renderNoisePanel(fidelity, tvd, calibration) {
    const panel = $$('qibm-noise-list');
    if (!panel) return;
    panel.innerHTML = '';

    const noiseItems = [
      { icon: '1', text: '<strong>Gate errors:</strong> Every quantum gate has a small probability of acting incorrectly. ' +
        (calibration && calibration.median_cx_error ? 'This machine\'s median 2-qubit gate error is ' + (calibration.median_cx_error * 100).toFixed(2) + '%.' : 'Typical CNOT (CX) gate error is 0.1–1%.') },
      { icon: '2', text: '<strong>Readout errors:</strong> When a qubit is measured, the detector sometimes records the wrong value. ' +
        (calibration && calibration.median_readout_error ? 'Median readout error here: ' + (calibration.median_readout_error * 100).toFixed(2) + '%.' : 'Typical readout error is 1–5%.') },
      { icon: '3', text: '<strong>Decoherence:</strong> Qubits lose their quantum state over time (T1 = amplitude damping, T2 = phase damping). ' +
        'Longer circuits are more affected. If the circuit takes longer than the qubit\'s T2 time, results degrade significantly.' },
      { icon: '4', text: '<strong>Crosstalk:</strong> Neighbouring qubits can inadvertently influence each other when gates are applied in parallel.' }
    ];

    noiseItems.forEach(item => {
      const row = el('div', { cls: 'qibm-noise-item' });
      const bullet = el('span', { cls: 'qibm-noise-bullet', text: item.icon });
      const textEl = el('span');
      textEl.innerHTML = item.text; // safe — no external data
      row.appendChild(bullet);
      row.appendChild(textEl);
      panel.appendChild(row);
    });
  }

  function _renderTryNext(fidelity) {
    const el2 = $$('qibm-try-list');
    if (!el2) return;
    el2.innerHTML = '';
    const tips = fidelity < 0.75 ? [
      'Try fewer shots (e.g. 512) to reduce wait time, or more shots (2048) for a smoother distribution.',
      'Choose a less busy machine — queue length affects result quality indirectly.',
      'Try a shallower circuit (fewer gates) to reduce decoherence.',
      'Compare a GHZ state vs Bell state — the 3-qubit circuit should show more noise.'
    ] : [
      'Increase shots to 4096 for an even smoother histogram.',
      'Try the GHZ 3-qubit circuit to see more pronounced noise effects.',
      'Try a different machine and compare results.',
      'Try Predict-then-Run: write down your prediction before running!'
    ];
    tips.forEach(t => {
      const li = el('li', {}, t);
      el2.appendChild(li);
    });
  }

  function _renderHistory() {
    const wrap = $$('qibm-history-list');
    if (!wrap) return;
    wrap.innerHTML = '';
    const history = _loadHistory();
    if (!history.length) {
      wrap.appendChild(el('p', { cls: 'qibm-history-empty', text: 'No saved runs yet. Real hardware runs are saved automatically.' }));
      return;
    }
    history.forEach((run, idx) => {
      const item = el('div', { cls: 'qibm-history-item' });
      item.appendChild(el('div', {},
        el('div', { cls: 'qibm-history-machine', text: run.machine || 'Unknown' }),
        el('div', { cls: 'qibm-history-date', text: run.circuit + ' · ' + new Date(run.date).toLocaleDateString() })
      ));
      const actions = el('div', { cls: 'qibm-history-actions' });

      // Export run card
      const exportBtn = el('button', { cls: 'qibm-btn qibm-btn--sm qibm-btn--outline', text: 'Export' });
      exportBtn.addEventListener('click', () => _exportRunCard(run));
      actions.appendChild(exportBtn);

      // Delete
      const delBtn = el('button', { cls: 'qibm-btn qibm-btn--sm qibm-btn--danger', text: 'Delete' });
      delBtn.addEventListener('click', () => {
        const arr = _loadHistory();
        arr.splice(idx, 1);
        _saveHistory(arr);
        _renderHistory();
      });
      actions.appendChild(delBtn);

      item.appendChild(actions);
      wrap.appendChild(item);
    });
  }

  function _exportRunCard(run) {
    const md = [
      '# QuantumLab Hardware Run Card',
      '',
      '**Circuit:** ' + (run.circuit || 'Unknown'),
      '**Machine:** ' + (run.machine || 'Unknown'),
      '**Job ID:** ' + (run.job_id || 'N/A'),
      '**Date:** ' + new Date(run.date).toLocaleString(),
      '',
      '## Counts',
      Object.entries(run.counts || {}).map(([k, v]) => '- |' + k + '⟩: ' + v).join('\n'),
    ].join('\n');

    const payload = JSON.stringify({ json: run, markdown: md }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: 'qibm-run-' + (run.job_id || 'card') + '.json' });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── LEARN DRAWER ─────────────────────────────────────────────────────────
  function _initLearnDrawer() {
    let activeDrawer = null;
    document.querySelectorAll('[data-qibm-learn]').forEach(pill => {
      pill.addEventListener('click', () => {
        const key = pill.dataset.qibmLearn;
        const drawer = $$('qibm-learn-drawer');
        if (!drawer) return;
        if (activeDrawer === key && drawer.classList.contains('open')) {
          drawer.classList.remove('open');
          activeDrawer = null;
          return;
        }
        drawer.innerHTML = LEARN_CONTENT[key] || '';
        drawer.classList.add('open');
        activeDrawer = key;
      });
    });
  }

  // ─── REPLAY DATA CHECK ─────────────────────────────────────────────────────
  async function _checkReplayData() {
    try {
      const resp = await fetch('assets/hardware-replay.json');
      if (!resp.ok) throw new Error('not found');
      const data = await resp.json();
      if (data && data.runs && data.runs.length) {
        const btn = $$('qibm-replay-btn');
        if (btn) btn.style.display = '';
      }
    } catch { /* no replay data — keep button hidden */ }
  }

  // ─── INIT ──────────────────────────────────────────────────────────────────
  function init() {
    if (!$$('qibm-run')) return; // only run on ibm.html
    _goToStep(1);
    _initStep1();
    _initStep2();
    _initLearnDrawer();
    _checkReplayData();

    // Back button on step 5
    const back5 = $$('qibm-back-5');
    if (back5) {
      back5.style.display = 'none';
      back5.addEventListener('click', () => {
        _clearTrackerTimers();
        _goToStep(4);
      });
    }

    // Start over on step 6
    const restart = $$('qibm-restart-btn');
    if (restart) restart.addEventListener('click', () => {
      _idealResult = null;
      _realResult  = null;
      _activeJobId = null;
      _goToStep(1);
    });

    // Clear key from memory on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        _apiKey = null; // discard in-memory key when tab is hidden
      }
    });
  }

  // Expose minimal public API
  window.QuantumLabIBM = {
    init,
    // Expose pure math for unit testing
    hellingerFidelity,
    totalVariationDistance,
    countsToProbabilities,
    scoreLabel,
    PRESETS
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
