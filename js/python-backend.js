/* ==============================================================
   PYTHON BACKEND INTEGRATION — python-backend.js
   Wires the Code Editor to POST Qiskit/Python code to the
   Flask backend at http://127.0.0.1:5000/api/run and renders
   the real Python compiler results back into the visualizer.
============================================================== */
(function PythonBackendIntegration() {
  "use strict";

  var BACKEND_URL = window.PYTHON_BACKEND_URL || "https://ibm-backend-9uslg4i5h-sushmithar29s-projects.vercel.app";
  var currentLang   = "qasm";
  var backendOnline = false;
  var pyLastResult  = null;
  var pyStepTrace   = [];
  var pyStepPtr     = -1;
  var selectedQubit = 0;

  /* Python preset programs */
  var PY_PRESETS = {
    superpos: "from qiskit import QuantumCircuit\n\n# 1-qubit superposition\nqc = QuantumCircuit(1, 1)\nqc.h(0)           # Hadamard gate creates (|0> + |1>)/sqrt(2)\nqc.measure(0, 0)\n\nprint('Circuit: H gate applied to |0>')\nprint('Expected: 50% |0>, 50% |1>')\n",
    bell:     "from qiskit import QuantumCircuit\n\n# Bell state |Phi+> = (|00> + |11>) / sqrt(2)\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure([0, 1], [0, 1])\n\nprint('Bell Pair: Entangled (|00> + |11>) / sqrt(2)')\n",
    ghz:      "from qiskit import QuantumCircuit\n\n# 3-Qubit Greenberger-Horne-Zeilinger (GHZ) state\nqc = QuantumCircuit(3, 3)\nqc.h(0)\nqc.cx(0, 1)\nqc.cx(0, 2)\nqc.measure([0, 1, 2], [0, 1, 2])\n\nprint('GHZ State: (|000> + |111>) / sqrt(2)')\n",
    grover:   "from qiskit import QuantumCircuit\n\n# Grover search - 2 qubits, target |11>\nqc = QuantumCircuit(2, 2)\n# Step 1: Equal superposition\nqc.h(0); qc.h(1)\n# Step 2: Oracle (marks |11> with negative phase)\nqc.cz(0, 1)\n# Step 3: Diffusion operator\nqc.h(0); qc.h(1)\nqc.x(0); qc.x(1)\nqc.cz(0, 1)\nqc.x(0); qc.x(1)\nqc.h(0); qc.h(1)\nqc.measure([0, 1], [0, 1])\n\nprint(\"Grover's Search - target state |11> amplified!\")\n",
    teleport: "from qiskit import QuantumCircuit\n\n# Quantum Teleportation Protocol\nqc = QuantumCircuit(3, 3)\n# Prepare state on q0 to teleport\nqc.ry(0.9, 0)\n# Create Bell pair between q1 and q2\nqc.h(1)\nqc.cx(1, 2)\n# Bell measurement on q0 and q1\nqc.cx(0, 1)\nqc.h(0)\n# Classical feedforward\nqc.cx(1, 2)\nqc.cz(0, 2)\nqc.measure([0, 1, 2], [0, 1, 2])\n\nprint('Quantum Teleportation: q0 teleported to q2')\n",
    custom:   "from qiskit import QuantumCircuit\n\n# Write your own quantum circuit here!\nqc = QuantumCircuit(2, 2)\n\nqc.h(0)\nqc.x(1)\nqc.cx(0, 1)\n\nqc.measure([0, 1], [0, 1])\n\nprint('Custom circuit compiled and executed successfully!')\n"
  };

  /* ── DOM helpers ── */
  function $(id) { return document.getElementById(id); }

  var statusDot    = $("backend-status-dot");
  var statusText   = $("backend-status-text");
  var textarea     = $("code-textarea");
  var lineNums     = $("code-line-nums");
  var hlLayer      = $("code-highlight-layer");
  var editorTitle  = $("code-editor-title");
  var qasmPresets  = $("code-preset-btns");
  var pyPresetBtns = $("py-preset-btns");
  var editorWrap   = $("code-editor-wrap");
  var pyOutputSec  = $("py-output-section");
  var pyStdoutEl   = $("py-stdout");
  var pyMetaEl     = $("py-output-meta");
  var pyCountsSec  = $("py-counts-section");
  var pyCountsGrid = $("py-counts-grid");
  var stepLog      = $("code-step-log");
  var codeErrBox   = $("code-error-box");
  var codeErrMsg   = $("code-error-msg");
  var codeStDot    = $("code-status-dot");
  var codeStMsg    = $("code-status-msg");
  var svGrid       = $("code-sv-grid");
  var histCanvas   = $("code-hist-canvas");
  var circuitDiag  = $("code-circuit-diagram");

  /* ── 1. BACKEND STATUS POLLING ── */
  function setBackendStatus(state) {
    if (!statusDot || !statusText) return;
    statusDot.className = "backend-status-dot " + state;
    var labels = { online: "Python Online", offline: "Python Offline", checking: "Checking…" };
    statusText.textContent = labels[state] || state;
    backendOnline = (state === "online");
  }

  function pollBackend() {
    setBackendStatus("checking");
    return fetch(BACKEND_URL + "/api/status", { method: "GET", signal: AbortSignal.timeout(3000) })
      .then(function(r) {
        if (r.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      })
      .catch(function() {
        setBackendStatus("offline");
      });
  }

  pollBackend();
  setInterval(pollBackend, 15000);

  /* ── 2. LINE NUMBERS SYNC ── */
  function updateLineNumbers() {
    if (!lineNums || !textarea) return;
    var count = (textarea.value.split("\n")).length;
    var html = "";
    for (var i = 1; i <= count; i++) {
      html += "<div>" + i + "</div>";
    }
    lineNums.innerHTML = html;
  }

  /* ── 3. LANGUAGE SWITCHING ── */
  function setEditorStatus(cls, msg) {
    if (codeStDot) codeStDot.className = "code-status-dot " + (cls || "");
    if (codeStMsg) codeStMsg.textContent = msg;
  }

  function switchLang(lang, keepCode) {
    currentLang = lang;
    window.currentEditorLang = lang;
    document.querySelectorAll(".lang-toggle-btn").forEach(function(b) { b.classList.remove("active"); });
    var activeBtn = document.getElementById("lang-btn-" + lang);
    if (activeBtn) activeBtn.classList.add("active");

    if (hlLayer) {
      hlLayer.style.display = "";
    }

    if (lang === "python") {
      if (editorTitle)  editorTitle.textContent    = "quantum_circuit.py";
      if (qasmPresets)  qasmPresets.style.display  = "none";
      if (pyPresetBtns) pyPresetBtns.style.display = "";
      if (pyOutputSec)  pyOutputSec.style.display  = "";
      if (codeErrBox)   codeErrBox.classList.remove("visible");

      if (textarea) {
        if (!keepCode && (textarea.value.trim() === "" || textarea.value.startsWith("OPENQASM"))) {
          textarea.value = PY_PRESETS.superpos;
        }
        updateLineNumbers();
        if (typeof textarea.dispatchEvent === 'function') {
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      setEditorStatus("", "Python mode — click Run or press Ctrl+Enter");
      if (backendOnline && !keepCode) {
        runPythonCode();
      }
    } else {
      if (editorTitle)  editorTitle.textContent    = "quantum_circuit.qasm";
      if (qasmPresets)  qasmPresets.style.display  = "";
      if (pyPresetBtns) pyPresetBtns.style.display = "none";
      if (pyOutputSec)  pyOutputSec.style.display  = "none";
      setEditorStatus("", "QASM mode — live simulation");
      if (window.refreshCodeEditor) window.refreshCodeEditor();
    }
  }

  window.switchEditorLang = switchLang;
  window.currentEditorLang = currentLang;

  document.querySelectorAll(".lang-toggle-btn").forEach(function(btn) {
    btn.addEventListener("click", function() { switchLang(btn.dataset.lang, false); });
  });

  document.querySelectorAll("[data-py-preset]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      document.querySelectorAll("[data-py-preset]").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var code = PY_PRESETS[btn.dataset.pyPreset];
      if (code && textarea) {
        textarea.value = code;
        updateLineNumbers();
        clearOutput();
        setEditorStatus("", "Ready");
        runPythonCode();
      }
    });
  });

  if (textarea) {
    textarea.addEventListener("input", function() {
      if (currentLang === "python") {
        updateLineNumbers();
      }
    });
  }

  /* ── 4. OUTPUT & VISUAL RENDERERS ── */
  function esc(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function clearOutput() {
    if (pyStdoutEl)   { pyStdoutEl.textContent = ""; pyStdoutEl.classList.remove("has-error"); }
    if (pyMetaEl)     pyMetaEl.textContent = "";
    if (pyCountsSec)  pyCountsSec.style.display = "none";
    if (pyCountsGrid) pyCountsGrid.innerHTML = "";
    if (codeErrBox)   codeErrBox.classList.remove("visible");
    if (stepLog)      stepLog.innerHTML = "";
    pyStepTrace = [];
    pyStepPtr = -1;
  }

  function showError(headline, detail) {
    if (pyStdoutEl) {
      pyStdoutEl.classList.add("has-error");
      pyStdoutEl.textContent = (detail || headline || "Error").trim();
    }
    if (codeErrMsg) codeErrMsg.textContent = headline || "Error";
    if (codeErrBox) codeErrBox.classList.add("visible");
    setEditorStatus("error", "Execution Error");
  }

  function drawPyStateVector(svList, nQ) {
    if (!svGrid || !Array.isArray(svList)) return;
    svGrid.innerHTML = "";
    var dim = Math.min(svList.length, 64);
    for (var i = 0; i < dim; i++) {
      var itemData = svList[i];
      var prob = itemData.prob != null ? itemData.prob : (itemData.mag * itemData.mag);
      var phase = itemData.phase_rad != null ? itemData.phase_rad : 0;
      var h = Math.round(prob * 50);
      var label = itemData.binary || i.toString(2).padStart(nQ, "0");
      var phaseHue = Math.round(((phase + Math.PI) / (2 * Math.PI)) * 360);
      var phaseColor = "hsl(" + phaseHue + ",80%,60%)";

      var item = document.createElement("div");
      item.className = "code-sv-item";
      item.innerHTML =
        '<div class="code-sv-item__label">|' + esc(label) + '⟩</div>' +
        '<div class="code-sv-item__bar-wrap">' +
          '<div class="code-sv-item__bar" style="height:' + h + 'px;background:linear-gradient(to top,#22d3ee,' + phaseColor + ')"></div>' +
        '</div>' +
        '<div class="code-sv-item__phase" style="border-color:' + phaseColor + ';transform:rotate(' + (-phase) + 'rad)"></div>' +
        '<div class="code-sv-item__val">' + (prob * 100).toFixed(1) + '%</div>';
      svGrid.appendChild(item);
    }
  }

  function drawPyHistogram(counts, svList, nQ) {
    if (!histCanvas) return;
    var ctx = histCanvas.getContext("2d");
    var W = histCanvas.width = histCanvas.offsetWidth || 400;
    var H = histCanvas.height = 110;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, W, H);

    var entries = [];
    if (counts && Object.keys(counts).length > 0) {
      var total = Object.values(counts).reduce(function(a, b) { return a + b; }, 0) || 1;
      var dim = Math.min(1 << nQ, 32);
      for (var i = 0; i < dim; i++) {
        var bitStr = i.toString(2).padStart(nQ, "0");
        var cnt = counts[bitStr] || 0;
        entries.push({ label: bitStr, prob: cnt / total });
      }
    } else if (Array.isArray(svList)) {
      var dim = Math.min(svList.length, 32);
      for (var i = 0; i < dim; i++) {
        var it = svList[i];
        entries.push({ label: it.binary || i.toString(2).padStart(nQ, "0"), prob: it.prob || 0 });
      }
    }

    if (entries.length === 0) return;
    var barW = (W - (entries.length + 1) * 3) / entries.length;

    entries.forEach(function(item, idx) {
      var p = item.prob;
      var x = 3 + idx * (barW + 3);
      var bh = p * (H - 24);
      var grd = ctx.createLinearGradient(x, H - 22 - bh, x, H - 22);
      grd.addColorStop(0, "#38bdf8");
      grd.addColorStop(1, "rgba(34,211,238,0.3)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, H - 22 - bh, barW, bh, [2, 2, 0, 0]);
      } else {
        ctx.rect(x, H - 22 - bh, barW, bh);
      }
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = Math.min(9, 80 / entries.length) + "px JetBrains Mono,monospace";
      ctx.textAlign = "center";
      ctx.fillText(item.label, x + barW / 2, H - 6);

      if (p > 0.02) {
        ctx.fillStyle = "#f0f4ff";
        ctx.font = Math.min(8, 72 / entries.length) + "px JetBrains Mono,monospace";
        ctx.fillText(Math.round(p * 100) + "%", x + barW / 2, H - 25 - bh);
      }
    });

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(0, H - 22, W, 1);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Basis states →", 4, H - 7);
  }

  function updateBlochFromPython(blochs, nQ) {
    if (!blochs || blochs.length === 0) return;
    if (selectedQubit >= blochs.length) selectedQubit = 0;
    var b = blochs[selectedQubit] || blochs[0];

    if (window.CodeEditorAPI) {
      window.CodeEditorAPI.setBlochTarget(b.x, b.y, b.z);
      var r00 = 0.5 * (1 + b.z);
      var r11 = 0.5 * (1 - b.z);
      window.CodeEditorAPI.updateHUD({
        q: selectedQubit,
        bx: b.x,
        by: b.y,
        bz: b.z,
        r00: r00,
        r11: r11
      });

      var blochList = blochs.map(function(item, idx) {
        return {
          q: idx,
          bx: item.x,
          by: item.y,
          bz: item.z,
          r00: 0.5 * (1 + item.z),
          r11: 0.5 * (1 - item.z)
        };
      });
      window.CodeEditorAPI.updateQubitPills(nQ, selectedQubit, blochList);
      window.CodeEditorAPI.updateCards(blochList, selectedQubit, [], undefined);
    }
  }

  function renderCircuitDiagram(diagText) {
    if (!circuitDiag) return;
    var existingPre = circuitDiag.querySelector(".py-circuit-pre");
    if (!existingPre) {
      existingPre = document.createElement("pre");
      existingPre.className = "py-circuit-pre";
      existingPre.style.cssText = "font-family:var(--font-mono);font-size:0.75rem;color:#38bdf8;padding:1rem;background:rgba(0,0,0,0.35);border-radius:6px;overflow-x:auto;margin:0;";
      circuitDiag.appendChild(existingPre);
    }
    var canvas = circuitDiag.querySelector("canvas");
    if (diagText && diagText.trim()) {
      existingPre.textContent = diagText;
      existingPre.style.display = "";
      if (canvas) canvas.style.display = "none";
    } else {
      existingPre.style.display = "none";
      if (canvas) canvas.style.display = "";
    }
  }

  function renderResult(data) {
    clearOutput();
    pyLastResult = data;
    var out = [data.stdout, data.stderr].filter(Boolean).join("\n").trim();
    if (pyStdoutEl) pyStdoutEl.textContent = out || "(Execution completed with no printed output)";

    if (pyMetaEl) {
      pyMetaEl.textContent =
        (data.duration_ms != null ? (+data.duration_ms).toFixed(1) : "?") + " ms" +
        " · " + (data.shots || 1024) + " shots" +
        " · " + (data.num_qubits || "?") + " qubits";
    }

    if (data.counts && Object.keys(data.counts).length > 0) {
      var total = Object.values(data.counts).reduce(function(a, b) { return a + b; }, 0) || 1;
      if (pyCountsGrid) {
        pyCountsGrid.innerHTML = "";
        Object.entries(data.counts).sort(function(a, b) { return b[1] - a[1]; }).forEach(function(entry) {
          var state = entry[0], cnt = entry[1];
          var pct = Math.round((cnt / total) * 100);
          var chip = document.createElement("div");
          chip.className = "py-count-chip";
          chip.innerHTML =
            "<span class='py-count-chip__state'>|" + esc(state) + "⟩</span>" +
            "<div class='py-count-chip__bar-wrap'><div class='py-count-chip__bar' style='width:" + pct + "%'></div></div>" +
            "<span class='py-count-chip__val'>" + cnt + " (" + pct + "%)</span>";
          pyCountsGrid.appendChild(chip);
        });
      }
      if (pyCountsSec) pyCountsSec.style.display = "";
    }

    if (Array.isArray(data.steps) && stepLog) {
      pyStepTrace = data.steps;
      stepLog.innerHTML = "";
      data.steps.forEach(function(s, i) {
        var row = document.createElement("div");
        row.className = "step-row step-log-entry";
        row.dataset.stepIdx = i;
        row.innerHTML =
          "<span class='step-num'>" + (i + 1) + ".</span>" +
          "<span class='step-gate'>" + esc(s.gate || s.code || "") + "</span>" +
          "<span class='step-desc'>" + esc(s.explanation || s.code || "") + "</span>";
        row.addEventListener("click", function() {
          applyStep(i);
        });
        stepLog.appendChild(row);
      });
    }

    var nQ = data.num_qubits || 2;
    var lastStep = (data.steps && data.steps.length > 0) ? data.steps[data.steps.length - 1] : null;
    var svToRender = (lastStep && lastStep.statevector) ? lastStep.statevector : data.final_statevector;

    if (svToRender) {
      drawPyStateVector(svToRender, nQ);
      drawPyHistogram(data.counts, svToRender, nQ);
    }
    if (lastStep && lastStep.bloch) {
      updateBlochFromPython(lastStep.bloch, nQ);
    }
    if (data.circuit_diagram) {
      renderCircuitDiagram(data.circuit_diagram);
    }

    setEditorStatus("success", "Done · " + (data.duration_ms != null ? (+data.duration_ms).toFixed(1) : "?") + " ms · " + nQ + " qubit(s)");
  }

  function applyStep(stepIdx) {
    if (!pyStepTrace || stepIdx < 0 || stepIdx >= pyStepTrace.length) return;
    pyStepPtr = stepIdx;
    var step = pyStepTrace[stepIdx];
    var nQ = (pyLastResult && pyLastResult.num_qubits) || 2;

    var rows = stepLog ? stepLog.querySelectorAll(".step-row") : [];
    rows.forEach(function(r, i) {
      r.classList.toggle("active-step", i === stepIdx);
      r.classList.toggle("step-active", i === stepIdx);
    });
    if (rows[stepIdx]) rows[stepIdx].scrollIntoView({ behavior: "smooth", block: "nearest" });

    if (step.statevector) {
      drawPyStateVector(step.statevector, nQ);
      drawPyHistogram(null, step.statevector, nQ);
    }
    if (step.bloch) {
      updateBlochFromPython(step.bloch, nQ);
    }
    setEditorStatus("", "Step " + (stepIdx + 1) + "/" + pyStepTrace.length + " (" + (step.gate || "") + ")");
  }

  /* ── 5. RUN CODE ACTION ── */
  function runPythonCode() {
    if (!textarea) return;
    var code = textarea.value.trim();
    if (!code) return;

    var doRun = function() {
      clearOutput();
      setEditorStatus("running", "Compiling & executing Python…");
      if (editorWrap) editorWrap.classList.add("py-running");
      var runBtn = $("code-run-btn");
      if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = "<svg width='13' height='13' viewBox='0 0 24 24' fill='currentColor'><circle cx='12' cy='12' r='8'/></svg>&nbsp;Running…";
      }

      var resetRunBtn = function() {
        if (editorWrap) editorWrap.classList.remove("py-running");
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.innerHTML = "<svg width='13' height='13' viewBox='0 0 24 24' fill='currentColor'><polygon points='5 3 19 12 5 21 5 3'/></svg>&nbsp;Run";
        }
      };

      fetch(BACKEND_URL + "/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, shots: 1024 }),
        signal: AbortSignal.timeout(25000)
      })
      .then(function(resp) {
        return resp.json().then(function(data) {
          if (!resp.ok && !data.error) data.error = "Server responded with status " + resp.status;
          return data;
        });
      })
      .then(function(data) {
        if (data.success) {
          renderResult(data);
        } else {
          showError(data.error || "Execution failed", data.traceback || data.stderr || data.error || "");
        }
      })
      .catch(function(err) {
        showError("Backend connection error: " + err.message, "Could not reach Python compiler backend at " + BACKEND_URL + "/api/run\n\nTo start the Python backend, launch:\n  run_backend.bat\nor:\n  python backend/server.py");
      })
      .finally(resetRunBtn);
    };

    if (!backendOnline) {
      pollBackend().then(function() {
        if (!backendOnline) {
          if (pyOutputSec) pyOutputSec.style.display = "";
          showError("Python backend offline", "Start the backend server by running:\n\n  run_backend.bat\n\nor:\n  python backend/server.py\n\nBackend URL: " + BACKEND_URL);
        } else {
          doRun();
        }
      });
    } else {
      doRun();
    }
  }

  /* ── 6. BUTTON EVENT INTERCEPTION (Capture Phase) ── */
  var runBtn = $("code-run-btn");
  if (runBtn) {
    runBtn.addEventListener("click", function(e) {
      if (currentLang !== "python") return;
      e.stopImmediatePropagation();
      runPythonCode();
    }, true);
  }

  var stepBtn = $("code-step-btn");
  if (stepBtn) {
    stepBtn.addEventListener("click", function(e) {
      if (currentLang !== "python") return;
      e.stopImmediatePropagation();
      if (!pyStepTrace || pyStepTrace.length === 0) return;
      var nextPtr = Math.min(pyStepPtr + 1, pyStepTrace.length - 1);
      applyStep(nextPtr);
    }, true);
  }

  var resetBtn = $("code-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function(e) {
      if (currentLang !== "python") return;
      e.stopImmediatePropagation();
      if (pyStepTrace && pyStepTrace.length > 0) {
        applyStep(0);
      } else {
        clearOutput();
        setEditorStatus("", "Reset");
      }
    }, true);
  }

  if (textarea) {
    textarea.addEventListener("keydown", function(e) {
      if (!((e.ctrlKey || e.metaKey) && e.key === "Enter") || currentLang !== "python") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      runPythonCode();
    }, true);
  }

})();
