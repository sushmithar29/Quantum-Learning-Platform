<h1 align="center">
  <br/>
  ⚛️ QuantumLab
  <br/>
</h1>

<p align="center">
  <strong>An AI-powered, interactive platform for learning quantum computing through simulation, visualization, and real hardware execution.</strong>
  <br/>
  <em>Presented at Smart India Hackathon 2026 (SIH2026)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python" alt="Python 3.11"/>
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Qiskit-1.1.1-6929C4?style=flat-square&logo=ibm" alt="Qiskit"/>
  <img src="https://img.shields.io/badge/qiskit--ibm--runtime-0.24.1-6929C4?style=flat-square&logo=ibm" alt="IBM Runtime"/>
  <img src="https://img.shields.io/badge/Frontend-HTML%20%2F%20CSS%20%2F%20JS-F7DF1E?style=flat-square&logo=javascript" alt="Frontend"/>
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker" alt="Docker"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture & Application Workflow](#-architecture--application-workflow)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Reference](#-api-reference)
- [Quantum Features Guide](#-quantum-features-guide)
- [AI Tutor](#-ai-tutor)
- [Progress Tracking](#-progress-tracking)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🌌 Overview

**QuantumLab** is a full-stack, browser-based quantum computing education platform that bridges the gap between abstract quantum theory and hands-on experimentation. It provides a structured, multi-track learning path ranging from fundamental qubit mechanics through advanced quantum algorithms and real IBM hardware execution.

**The problem it solves:** Quantum computing education is notoriously inaccessible. Traditional resources are either too theoretical (lacking interactivity) or require costly local Qiskit environments. QuantumLab brings the laboratory directly into the browser—no local Python environment required for the learning modules—while also connecting advanced users to real IBM Quantum processors.

> **Note:** QuantumLab was built and presented as part of the **Smart India Hackathon 2026 (SIH2026)** competition.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Structured Learning Tracks** | Six topic-based modules (Basics, Learn, Algorithms, Virtual Labs, Experiments, Hardware) with progressive difficulty |
| **Quantum Circuit Designer** | Full drag-and-drop circuit editor with real-time statevector simulation, OpenQASM 2.0 and Qiskit code editors, Bloch sphere visualization, and circuit export |
| **Code Visualizer** | Browser-based Python/Qiskit IDE with line-by-line AST stepping, statevector tracing, shot histograms, and live circuit diagrams |
| **IBM Quantum Integration** | 6-step guided wizard to connect a personal IBM API key, run OpenQASM circuits on real QPUs via `SamplerV2`, compare ideal vs. real results with Hellinger Fidelity, and poll job status |
| **Practice Mode** | Realistic hardware-noise simulation (depolarizing + 3.5% readout error) without requiring an IBM account |
| **3D Bloch Sphere** | Interactive Canvas-based 3D Bloch sphere visualization with live qubit state representation |
| **Quantum Hardware Explorer** | Interactive visualization of IBM superconducting QPU architecture (dilution refrigerator, Heron heavy-hex topology, microwave control) |
| **Virtual Labs** | Immersive, parameterized environments: Bloch Sphere Lab, Circuit Lab, State Lab, Measurement Lab, Noise Lab, QSVM Lab |
| **Algorithm Visualizations** | Animated step-by-step walkthroughs for 15 quantum algorithms |
| **Experiments** | Six guided experiments including Stern-Gerlach, Bell State Lab, Cavity QED, and more |
| **AI Tutor** | Context-aware in-browser AI tutor accessible on every page via navigation bar |
| **Progress Tracking** | Personalized learning roadmap with multi-plan management, daily scheduling, streak tracking, and activity analytics |

---

## 🛠️ Technology Stack

### Frontend

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic, multi-page application) |
| Styling | Vanilla CSS with custom design system (`styles/main.css` + 16 per-page stylesheets) |
| Scripting | Vanilla JavaScript (ES6+, modular IIFE namespacing under `window.QL`) |
| Fonts | Google Fonts — Inter, JetBrains Mono |
| 3D / Canvas | HTML5 Canvas API, custom Bloch sphere renderer (`js/bloch3d.js`, `js/basics-3d.js`) |

### Python Compiler Backend

| Layer | Technology |
|---|---|
| Framework | Flask (Python 3) |
| Quantum Engine | Custom `QuantumCircuitMock` emulator (`backend/quantum_engine.py`) with NumPy statevector simulation |
| Execution | Python `ast` + sandboxed `exec` — runs user Qiskit/Python code safely |
| Simulation | NumPy-based statevector propagation, shot sampling, Bloch vector tracing |

### IBM Quantum Backend

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 + Uvicorn 0.30 (ASGI) |
| Validation | Pydantic v2 |
| Quantum SDK | `qiskit==1.1.1`, `qiskit-aer==0.14.2`, `qiskit-ibm-runtime==0.24.1` |
| Hardware Primitive | `SamplerV2` (job mode) via `QiskitRuntimeService` |
| Ideal Simulation | `StatevectorSampler` (noiseless) |
| Practice Simulation | Custom depolarizing + 3.5% readout noise model |
| Circuit Format | OpenQASM 2.0 (parsed via `qiskit.qasm2.loads`) |
| Security | Per-request API key via `X-IBM-Token` header; redacting log filter; in-memory per-IP rate limiter |

### Deployment / Infrastructure

| Target | Technology |
|---|---|
| Frontend | Any static host (Netlify, GitHub Pages, Vercel) |
| IBM Backend | Render (free tier), Google Cloud Run (Docker), or Vercel Python runtime |
| Container | Docker (`python:3.11-slim`) |

---

## 🏗️ Architecture & Application Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Frontend)                          │
│                                                                 │
│  index.html → basics.html → learn.html → algorithms.html       │
│  circuit-designer.html → visualizer.html → ibm.html            │
│  hardware.html → virtual-labs/ → experiments/ → progress.html  │
│                                                                 │
│  window.QL (global namespace)                                   │
│  ├── js/app.js            — orchestrator, AI Tutor              │
│  ├── js/data.js           — static experiment/lab/algo data     │
│  ├── js/circuit-designer.js  — drag-and-drop circuit editor     │
│  ├── js/visualizer.js     — wave functions, state visuals       │
│  ├── js/bloch3d.js        — 3D Bloch sphere renderer            │
│  ├── js/python-backend.js — wires code editor to Flask          │
│  ├── js/ibm-quantum.js    — IBM wizard (QuantumLabIBM ns)       │
│  ├── js/progress-store.js — localStorage progress system        │
│  └── js/algorithms-*.js  — algorithm step-by-step visualizers  │
│                               │                │                │
└───────────────────────────────┼────────────────┼────────────────┘
                                │                │
            ┌───────────────────▼──┐  ┌──────────▼──────────────┐
            │   Flask Backend      │  │  FastAPI IBM Backend     │
            │   localhost:5000     │  │  localhost:8001          │
            │                      │  │                          │
            │ GET  /api/status     │  │ GET  /health             │
            │ POST /api/compile    │  │ POST /ibm/connect        │
            │ POST /api/run        │  │ POST /ibm/estimate       │
            │ POST /api/step-trace │  │ POST /ibm/run            │
            │                      │  │ GET  /ibm/job/{id}       │
            │ backend/             │  │ POST /ibm/job/{id}/cancel│
            │  server.py           │  │ POST /ideal/run          │
            │  quantum_engine.py   │  │ POST /practice/run       │
            └──────────────────────┘  │ POST /api/compile        │
                                      │ POST /api/run            │
                                      │ POST /api/step-trace     │
                                      └──────────┬───────────────┘
                                                 │
                                      ┌──────────▼──────────────┐
                                      │   IBM Quantum Cloud      │
                                      │   QiskitRuntimeService   │
                                      │   SamplerV2 (real QPU)   │
                                      └─────────────────────────┘
```

**IBM hardware run data flow:**

1. User enters IBM API key in the wizard (held in JS closure `_apiKey` — never in `localStorage`, cookies, or logs).
2. Each request sends the key via `X-IBM-Token` HTTP header over HTTPS.
3. FastAPI backend authenticates once per request, transpiles the circuit, submits a `SamplerV2` job, and immediately returns `job_id`.
4. Frontend polls `GET /ibm/job/{job_id}` until the job completes.
5. Results are compared against ideal simulation using **Hellinger Fidelity** and **Total Variation Distance**.

---

## 📁 Project Structure

```
quantumlab/
│
├── index.html                       ← Landing page & experiment cards
├── basics.html                      ← Quantum basics modules
├── learn.html                       ← Structured learning landing
├── algorithms.html                  ← Quantum algorithms overview
├── circuit-designer.html            ← Drag-and-drop circuit editor
├── visualizer.html                  ← Code IDE + wave visualization
├── ibm.html                         ← IBM Quantum hub & run wizard
├── hardware.html                    ← Superconducting QPU explorer
├── virtual-labs.html                ← Virtual labs landing
├── experiments.html                 ← Experiments landing
├── progress.html                    ← Personalized learning roadmap
│
├── styles/                          ← CSS design system (17 files)
│   ├── main.css                     ← Global tokens, nav, layout
│   ├── components.css               ← Shared UI components
│   ├── animations.css               ← Global micro-animations
│   ├── circuit-designer.css
│   ├── visualizer.css
│   ├── ibm-quantum.css
│   ├── hardware.css
│   ├── algorithms.css
│   ├── basics.css / learn.css
│   ├── progress.css
│   ├── virtual-labs.css / vlab-workspace.css
│   ├── quantum-noise-lab.css
│   ├── experiment-lab.css
│   └── virtual-lab-environment.css
│
├── js/                              ← JavaScript modules (33 files)
│   ├── app.js                       ← Main orchestrator (window.QL)
│   ├── data.js                      ← Static experiment/lab/algo data
│   ├── circuit-designer.js          ← Full circuit editor engine
│   ├── visualizer.js                ← Quantum state visualizations
│   ├── bloch3d.js                   ← 3D Bloch sphere renderer
│   ├── basics-3d.js / basics-engine.js / basics-simulation.js
│   ├── canvas.js                    ← Canvas drawing utilities
│   ├── python-backend.js            ← Flask backend integration
│   ├── ibm-quantum.js               ← IBM quantum wizard
│   ├── hardware-sim.js              ← Hardware visualization engine
│   ├── labs.js / vlab-workspace.js  ← Virtual labs controller
│   ├── circuit-lab-engine.js / noise-lab-engine.js
│   ├── linear-algebra-engine.js / linear-algebra-ui.js
│   ├── algorithms.js / algorithms-vlab-engine.js
│   ├── algorithms-vlab-data.js / algorithms-vlab-runner.js
│   ├── algorithms-qsvm-sim.js
│   ├── learn.js / learn-landing.js
│   ├── progress-store.js / progress-data.js / progress-ui.js
│   └── vendor/                      ← Third-party libraries
│
├── learn/                           ← Structured lesson sub-pages
│   ├── index.html, bloch-sphere.html, qubits.html
│   ├── superposition.html, entanglement.html
│   ├── measurement.html, linear-algebra.html, braket.html
│
├── algorithms/                      ← 15 algorithm detail pages
│   ├── grover/, shor-factorization/, qft/, vqe/, qaoa/
│   ├── deutsch-jozsa/, bernstein-vazirani/, quantum-teleportation/
│   └── hhl/, qpe/, qsvm/, qnn/, qae/, qka/, qpca/
│
├── virtual-labs/                    ← Interactive lab environments
│   ├── index.html
│   ├── bloch-sphere.html, circuit-lab.html, state-lab.html
│   ├── measurement-lab.html, noise-lab.html, qsvm.html
│
├── experiments/                     ← Guided experiment pages
│   ├── index.html
│   └── stern-gerlach.html
│
├── backend/                         ← Flask Python compiler backend
│   ├── server.py                    ← Flask app + sandbox execution
│   └── quantum_engine.py            ← Qiskit-compatible circuit emulator
│
├── ibm-backend/                     ← FastAPI IBM Quantum backend
│   ├── main.py                      ← FastAPI app + all endpoints
│   ├── quantum_engine.py            ← Quantum engine (shared)
│   ├── requirements.txt             ← Pinned Python dependencies
│   ├── Dockerfile                   ← Docker container definition
│   ├── vercel.json                  ← Vercel deployment config
│   ├── .env.example                 ← Environment variable template
│   └── tests/
│       └── test_metrics.py          ← Unit tests (no real hardware)
│
├── assets/
│   └── hardware-replay.json         ← IBM hardware replay stub
├── images/
│   └── ibm_chandelier_real.jpg      ← IBM dilution refrigerator photo
├── scripts/
│   └── record_replay.py             ← Owner script: record real IBM runs
├── run_backend.bat                  ← Windows one-click Flask starter
├── .gitignore
└── README-ibm.md                    ← IBM feature-specific notes
```

---

## ✅ Prerequisites

| Tool | Minimum Version | Purpose |
|---|---|---|
| Modern browser | Chrome 110+ / Firefox 115+ / Edge 110+ | Run the frontend |
| Python | 3.10+ (3.11 recommended) | Backend services |
| `pip` | Latest | Install Python dependencies |
| Node.js & npm | 18+ *(optional)* | `live-server` for frontend dev |
| Git | Any recent | Clone the repository |
| Docker | 24+ *(optional)* | Containerized IBM backend |

> **IBM Quantum account** *(optional)*: Required only for real QPU execution. Free accounts at [quantum.ibm.com](https://quantum.ibm.com). The platform is **fully functional in simulation mode without an account**.

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/quantumlab.git
cd quantumlab
```

> **Windows users:** If the folder name contains a space (e.g., `e green quanta`), wrap paths in quotes in the terminal.

### 2. Frontend Setup

The frontend is a **static multi-page application** — no build step is needed.

**Option A — Live Server (recommended)**

```bash
# Install once globally
npm install -g live-server

# From project root
live-server --port=8080

# Windows PowerShell alternative
npx live-server --port=8080
```

Open: **http://localhost:8080**

**Option B — Python built-in HTTP server**

```bash
# Windows / macOS / Linux
python -m http.server 8080
```

> ⚠️ Do **not** open HTML files via `file://`. Browser security policies block local `fetch` calls when using the file protocol.

### 3. Python Compiler Backend (Flask)

Powers the **Code Visualizer** (Python/Qiskit IDE). Optional for learning and algorithm modules.

**Windows (one-click):**

```bat
run_backend.bat
```

**All platforms (manual):**

```bash
cd backend

python -m venv venv

# Activate — Windows
venv\Scripts\activate
# Activate — macOS / Linux
source venv/bin/activate

pip install flask numpy
python server.py
```

Server starts at: **http://127.0.0.1:5000**

### 4. IBM Quantum Backend (FastAPI)

Enables real QPU execution, ideal statevector simulation, and practice-mode noise simulation.

```bash
cd ibm-backend

python -m venv venv

# Activate — Windows
venv\Scripts\activate
# Activate — macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

# Copy env template
copy .env.example .env    # Windows
cp .env.example .env      # macOS / Linux

# Edit .env if needed (CORS origins for production)

python main.py
```

Server starts at: **http://127.0.0.1:8001**

**One-liner:**

```bash
cd ibm-backend && pip install -q -r requirements.txt && python main.py
```

---

## 🔐 Environment Variables

All variables are defined in [`ibm-backend/.env.example`](ibm-backend/.env.example). Copy to `.env` and fill in values:

```dotenv
# ── Environment variables for QuantumLab IBM Backend ──────────────────────
# Copy this file to .env and fill in values.
# NEVER commit .env to git.

# CORS: comma-separated allowed frontend origins. Use * for local dev only.
QIBM_CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# Port the server listens on (auto-injected by Render / Cloud Run)
PORT=8001

# DEVELOPMENT ONLY: owner IBM key for record_replay.py
# Never read by the FastAPI app at request time.
# Never serves visitor traffic. Remove or leave empty in production.
IBM_QUANTUM_API_KEY=your_ibm_quantum_api_key_here
```

**Security rules enforced in code:**

| Rule | Implementation |
|---|---|
| Key never in localStorage/cookies/URL | JS closure only; cleared on disconnect or page unload |
| Key never logged | All log lines pass through `_redact()` — 40+ char tokens replaced with `[REDACTED]` |
| Key sent only in header | `X-IBM-Token` header; HTTPS only in production |
| Server never stores key | Local variable per request; discarded immediately after |
| Owner key never serves visitors | `IBM_QUANTUM_API_KEY` read only by `record_replay.py`, never by `main.py` |

---

## ▶️ Running the Application

Open three separate terminal windows:

**Terminal 1 — Frontend**

```bash
# From project root
live-server --port=8080
```

**Terminal 2 — Flask Compiler Backend**

```bash
# Windows
run_backend.bat

# macOS / Linux
cd backend && python server.py
```

**Terminal 3 — IBM FastAPI Backend**

```bash
cd ibm-backend && python main.py
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Flask Compiler API | http://127.0.0.1:5000 |
| IBM FastAPI | http://127.0.0.1:8001 |
| IBM Health Check | http://127.0.0.1:8001/health |

---

## 📡 API Reference

### Flask Compiler Backend — Port 5000

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service info and endpoint list |
| `GET` | `/api/status` | Health check; Python version and feature list |
| `POST` | `/api/compile` | AST-compile Qiskit/Python or validate OpenQASM 2.0; returns gate count, syntax errors |
| `POST` | `/api/run` | Execute Qiskit/Python in sandbox; returns counts, statevector, step trace, circuit diagram, stdout/stderr |
| `POST` | `/api/step-trace` | Alias for `/api/run`; used by the visualizer step-through mode |

**`/api/run` request body:**

```json
{
  "code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2,2)\nqc.h(0)\nqc.cx(0,1)\nqc.measure([0,1],[0,1])",
  "shots": 1024
}
```

**`/api/run` response (success):**

```json
{
  "success": true,
  "duration_ms": 12.4,
  "shots": 1024,
  "counts": { "00": 512, "11": 512 },
  "num_qubits": 2,
  "total_steps": 3,
  "final_statevector": [...],
  "steps": [...],
  "circuit_diagram": "q0 --[H]--*--[M] ...",
  "stdout": "",
  "stderr": ""
}
```

---

### IBM FastAPI Backend — Port 8001

IBM hardware endpoints require the key in the **`X-IBM-Token` request header**.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | None | Root landing; version info |
| `GET` | `/health` | None | Health check; reports `ibm_sdk` availability |
| `POST` | `/ibm/connect` | Required | Validate key; list operational QPU backends with qubit count and queue depth |
| `POST` | `/ibm/estimate` | Optional | Estimate QPU time (seconds) for given qubits / shots / depth |
| `POST` | `/ibm/run` | Required | Transpile and submit OpenQASM to least-busy QPU; returns `job_id` |
| `GET` | `/ibm/job/{job_id}` | Required | Poll job; returns counts, calibration, timestamps on completion |
| `POST` | `/ibm/job/{job_id}/cancel` | Required | Cancel a queued or running job |
| `POST` | `/ideal/run` | None | Noiseless statevector simulation of OpenQASM circuit |
| `POST` | `/practice/run` | None | Noise simulation (3.5% readout error, depolarizing model) |
| `GET` | `/api/status` | None | Python compiler status |
| `POST` | `/api/compile` | None | AST-compile Qiskit/Python code |
| `POST` | `/api/run` | None | Execute Qiskit/Python in sandbox |
| `POST` | `/api/step-trace` | None | Line-by-line step trace |

**Server-enforced hard limits:**

| Limit | Value |
|---|---|
| Max qubits per circuit | 10 |
| Max circuit depth | 100 |
| Max shots | 4,096 |
| Default shots | 1,024 |
| Rate limit (standard) | 20 requests / min / IP |
| Rate limit (real hardware) | 5 requests / min / IP |
| Max QASM size | 50,000 characters |
| Execution timeout | 300 seconds |

**Example — Submit to real QPU:**

```bash
curl -X POST http://localhost:8001/ibm/run \
  -H "Content-Type: application/json" \
  -H "X-IBM-Token: <your-ibm-api-key>" \
  -d '{
    "qasm": "OPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q -> c;",
    "shots": 1024
  }'
```

**Example — Ideal simulation (no key needed):**

```bash
curl -X POST http://localhost:8001/ideal/run \
  -H "Content-Type: application/json" \
  -d '{"qasm": "OPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[1];\ncreg c[1];\nh q[0];\nmeasure q -> c;", "shots": 1024}'
```

---

## 🔬 Quantum Features Guide

### Quantum Circuit Designer

**URL:** `http://localhost:8080/circuit-designer.html`

- **Drag and drop** gates from the palette onto qubit wires.
- Switch between **visual canvas**, **OpenQASM 2.0 editor**, and **Qiskit Python editor**.
- Supported gates: H, X, Y, Z, S, T, S†, T†, CNOT, CZ, SWAP, Toffoli (CCX), RX, RY, RZ, and more.
- Real-time statevector simulation after each gate placement.
- Live **3D Bloch sphere** visualization of current qubit state.
- **Export** circuits as OpenQASM 2.0 or Qiskit Python code.

### Code Visualizer

**URL:** `http://localhost:8080/visualizer.html`

Requires the Flask or IBM FastAPI backend.

1. Select a preset (Superposition, Bell State, GHZ, Grover, Teleportation) or write custom Qiskit/Python or OpenQASM.
2. **Compile** — AST syntax-check.
3. **Run** — executes in sandbox; returns shot histogram, statevector trace, ASCII circuit diagram, Bloch vector evolution.
4. **Step Forward / Backward** — walk through gate applications one at a time.

### IBM Quantum Hardware Integration

**URL:** `http://localhost:8080/ibm.html` → scroll to **Run on Quantum**

Requires IBM FastAPI backend on port 8001.

**6-step wizard:**

| Step | Action |
|---|---|
| 1. Connect | Enter IBM API key (JS closure only). Lists operational QPU backends. |
| 2. Select Machine | Choose a backend or **Best Available** (least-busy auto-select). |
| 3. Select Circuit | Bell State, GHZ, W State, Superposition preset or custom OpenQASM 2.0. |
| 4. Configure | Set shot count (1–4,096); review QPU time estimate. |
| 5. Submit & Monitor | Circuit submitted; real-time job status and queue position. |
| 6. Results | Hellinger Fidelity, Total Variation Distance, ideal-vs-real bar chart. |

**Practice Mode** (no IBM account): Click **"No account? Try Practice mode"** for instant depolarizing noise simulation.

### Virtual Labs

**URL:** `http://localhost:8080/virtual-labs.html`

| Lab | Description |
|---|---|
| **Bloch Sphere Lab** | 3D qubit state manipulation; observe gate effects on Bloch vector |
| **Circuit Lab** | Build and simulate circuits step-by-step in a guided workspace |
| **State Lab** | Arbitrary quantum state preparation and basis changes |
| **Measurement Lab** | Projective measurement, basis selection, wavefunction collapse |
| **Noise Lab** | Tune depolarizing, bit-flip, phase-flip error rates; observe decoherence |
| **QSVM Lab** | Interactive Quantum Support Vector Machine classification |

### Interactive Algorithms

**URL:** `http://localhost:8080/algorithms.html`

15 algorithms, each with conceptual explanation, animated circuit execution, interactive parameter controls, and classical vs. quantum complexity comparison.

| Algorithm | Category |
|---|---|
| Grover's Search | Search |
| Shor's Factorization | Cryptography |
| Quantum Fourier Transform (QFT) | Foundation |
| Variational Quantum Eigensolver (VQE) | Chemistry |
| Quantum Approximate Optimization (QAOA) | Optimization |
| Deutsch-Jozsa | Oracle |
| Bernstein-Vazirani | Oracle |
| Quantum Teleportation | Communication |
| HHL Linear Systems | Linear Algebra |
| Quantum Phase Estimation (QPE) | Foundation |
| Quantum SVM (QSVM) | Machine Learning |
| Quantum Neural Network (QNN) | Machine Learning |
| Quantum Amplitude Estimation (QAE) | Finance |
| Quantum Kernel Alignment (QKA) | Machine Learning |
| Quantum PCA (QPCA) | Machine Learning |

### Experiments

**URL:** `http://localhost:8080/experiments.html`

| Experiment | Level | Description |
|---|---|---|
| **Stern-Gerlach** | Beginner | Silver atom spin quantization in a magnetic field gradient |
| **Bell State Laboratory** | Beginner | Create and verify maximally entangled 2-qubit states |
| **Cavity QED** | Advanced | Jaynes-Cummings — vacuum Rabi oscillations between atom and cavity |
| **Quantum Superposition** | Beginner | Single-qubit gate rotations on the Bloch sphere |
| **Double-Slit** | Beginner | Wave-particle duality interference patterns |
| **Quantum Error Correction** | Intermediate | Stabilizer codes and syndrome measurement |

### Quantum Hardware Explorer

**URL:** `http://localhost:8080/hardware.html`

Interactive animation of IBM superconducting quantum hardware:
- Dilution refrigerator layers with temperature gradients
- Heron heavy-hex qubit topology visualization
- Microwave control signal animation
- Readout resonator and measurement chain
- **Guided Mode** (narrated walkthrough) vs. **Free Exploration** toggle

---

## 🤖 AI Tutor

The **AI Tutor** button is present in the top navigation bar on every page.

- Opens a panel for asking questions about quantum computing and the current module.
- Provides context-aware explanations tailored to the active section.
- Rendered globally via `js/app.js` and attached to the `#ai-tutor-btn` element.

---

## 📈 Progress Tracking

**URL:** `http://localhost:8080/progress.html`

Stored in browser `localStorage` under key `quantumlab_progress_store_v1` — no backend or account required.

- **Multiple learning plans** with custom names and goals
- **Auto-scheduled daily activities** based on plan start date and duration
- **Completion tracking** with timestamps
- **Streak counter** for consecutive days of learning
- **All-time completed activities** log
- Event-driven UI updates via `QL.ProgressStore.on('store_updated', fn)`

---

## 🚢 Deployment

### Frontend — Netlify / Static Host

1. Push project to GitHub.
2. Connect to [Netlify](https://netlify.com), [Vercel](https://vercel.com), or [GitHub Pages](https://pages.github.com).
3. Set **publish directory** to project root (no build step needed).

### IBM Backend — Render (Free Tier)

1. Create a new **Web Service** at [render.com](https://render.com).
2. Settings:
   - **Root directory:** `ibm-backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Environment variable: `QIBM_CORS_ORIGINS=https://your-site.netlify.app`
4. Copy the Render URL; set it in `ibm.html`:

```html
<script>
  window.QIBM_API_BASE = 'https://qibm-backend.onrender.com';
</script>
<script src="js/ibm-quantum.js"></script>
```

> **Free tier note:** Render sleeps after 15 min of inactivity. The wizard shows a "Waking up..." banner while polling `/health`.

### IBM Backend — Google Cloud Run (Docker)

```bash
cd ibm-backend

# Deploy to Cloud Run
gcloud run deploy qibm-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars QIBM_CORS_ORIGINS=https://your-site.netlify.app

# Local Docker test
docker build -t quantumlab-ibm .
docker run -p 8001:8001 \
  -e QIBM_CORS_ORIGINS=http://localhost:8080 \
  quantumlab-ibm
```

### IBM Backend — Vercel

A `vercel.json` is included in `ibm-backend/`:

```bash
cd ibm-backend
vercel --prod
```

> Vercel serverless Python has a 10-second timeout. For real hardware jobs (which can take minutes), use Render or Cloud Run instead.

---

## 🧪 Testing

Unit tests for the IBM backend use mocked responses — no real IBM account required.

```bash
cd ibm-backend

# Dev dependencies are included in requirements.txt
pip install pytest pytest-asyncio httpx

pytest tests/ -v
```

**Coverage in `tests/test_metrics.py`:**

| Function | Scenarios Tested |
|---|---|
| `hellinger_fidelity` | Identical, disjoint, near-identical, Bell state distributions; symmetry |
| `total_variation_distance` | Identical, disjoint, partial-overlap distributions |
| `counts_to_probabilities` | Normalization, empty counts, single-outcome |
| `compare_metrics` | Fidelity + TVD output structure and value ranges |
| `_redact` | API key redaction from log strings |

---

## 🛠️ Troubleshooting

**Frontend shows blank page**
- Serve via HTTP (`live-server` or `python -m http.server`), not `file://`.

**"Python Offline" in the Visualizer**
- Start the Flask backend: `run_backend.bat` (Windows) or `cd backend && python server.py`.
- Check port 5000: `netstat -ano | findstr 5000` (Windows).

**`ImportError: No module named 'qiskit'`**
```bash
cd ibm-backend && pip install -r requirements.txt
```
On Windows with missing C compiler:
```bash
pip install --only-binary :all: qiskit qiskit-aer
```

**HTTP 401 — Invalid IBM Quantum API key**
- Verify key at [quantum.ibm.com](https://quantum.ibm.com) → Account → API Token.
- Use the IBM Quantum key (not an IBM Cloud IAM key).
- Key must be >= 10 characters.

**No QPU backends listed after connecting**
- Free accounts access `ibm-q/open/main`. Leave the instance field blank.
- Check availability: [quantum.ibm.com/services/resources](https://quantum.ibm.com/services/resources).

**Job stuck in queue**
- Free tier queue times can range from 15 min to several hours.
- Use **Practice Mode** for instant noise-simulated results.
- Use the **Cancel Job** button in the wizard.

**CORS errors in browser console**
- Set `QIBM_CORS_ORIGINS` to your exact frontend origin in production (no trailing slash).
- Do not mix `http://` and `https://` origins.

**`qiskit-ibm-runtime` import fails after update**
```bash
pip install --upgrade qiskit-ibm-runtime
```
See [IBM Runtime docs](https://docs.quantum.ibm.com/api/qiskit-ibm-runtime) for the latest `SamplerV2` API.

---

## 🤝 Contributing

1. **Fork** the repository on GitHub.
2. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes.** For the IBM backend, run `pytest tests/ -v` before submitting.
4. **Commit with a descriptive message:**
   ```bash
   git commit -m "feat: add Quantum Error Correction experiment"
   ```
5. **Push and open a Pull Request** against `main`.

**Code style:**
- **Python:** PEP 8; type hints on public functions; no bare `except`; pass all tests.
- **JavaScript:** ES6+; `'use strict'`; `window.QL.*` namespace; avoid `eval()` and `innerHTML` with untrusted data.
- **CSS:** BEM naming (`block__element--modifier`); CSS custom properties for all design tokens.

---

## 📄 License

```
MIT License

Copyright (c) 2026 QuantumLab Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

## 🙏 Acknowledgements

- **IBM Quantum** — open-access quantum platform and `qiskit-ibm-runtime` SDK
- **Qiskit** — open-source quantum computing framework by IBM
- **Google Fonts** — Inter and JetBrains Mono typefaces
- **Smart India Hackathon 2026** — competition platform that motivated this project
- **NumPy** — numerical statevector computation in the Python backend

**References:**

- [IBM Quantum Documentation](https://docs.quantum.ibm.com)
- [Qiskit API Reference](https://docs.quantum.ibm.com/api/qiskit)
- [Qiskit IBM Runtime API](https://docs.quantum.ibm.com/api/qiskit-ibm-runtime)
- [Nielsen & Chuang — Quantum Computation and Quantum Information](https://www.cambridge.org/highereducation/books/quantum-computation-and-quantum-information/01E10196D0A682A6AEFFEA52D53BE9AE)
- [Hellinger Distance — Wikipedia](https://en.wikipedia.org/wiki/Hellinger_distance)

---

<p align="center">Built with ⚛️ by the QuantumLab team &middot; SIH2026</p>
