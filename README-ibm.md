# QuantumLab — IBM Quantum Run Feature

## What this adds

A complete, isolated "Run on IBM Quantum + Real vs Ideal comparison" feature embedded inside `ibm.html`.

**Existing files changed:** Only `ibm.html` — one new `<section id="qibm-run">` added before the footer, plus two `<link>`/`<script>` tags in `<head>`. Nothing else was touched.

**New files:**

| File | Purpose |
|------|---------|
| `styles/ibm-quantum.css` | All UI styles, `.qibm-` prefix |
| `js/ibm-quantum.js` | Full wizard logic, `window.QuantumLabIBM` namespace |
| `ibm-backend/main.py` | FastAPI backend with all endpoints |
| `ibm-backend/requirements.txt` | Pinned Python deps |
| `ibm-backend/Dockerfile` | Container for Render / Cloud Run |
| `ibm-backend/.env.example` | Environment template (never commit `.env`) |
| `ibm-backend/tests/test_metrics.py` | Unit tests (no real hardware) |
| `assets/hardware-replay.json` | Recorded run stub (empty until `record_replay.py` is run) |
| `scripts/record_replay.py` | Owner script to record real runs |
| `README-ibm.md` | This file |

---

## Local development

### 1. Frontend (already running)
```
npx live-server --port=8080 --no-browser
```
Open: http://localhost:8080/ibm.html

The wizard works in **Practice mode** without the backend — click "No account? Try Practice mode".

### 2. IBM Backend
```bash
cd ibm-backend
pip install -r requirements.txt
cp .env.example .env
# edit .env if needed (CORS origins etc.)
python main.py
# Server runs on http://localhost:8001
```

One-command start:
```bash
cd ibm-backend && pip install -q -r requirements.txt && python main.py
```

### 3. Run unit tests
```bash
cd ibm-backend
pytest tests/ -v
```

---

## Deploy to Render (free tier)

1. Push the repo to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set:
   - **Root directory:** `ibm-backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable:
   - `QIBM_CORS_ORIGINS` = `https://your-netlify-app.netlify.app`
5. Copy the Render URL (e.g. `https://qibm-backend.onrender.com`).
6. In `ibm.html`, update the `window.QIBM_API_BASE` value in the `<script>` block.

> **Note:** Render free tier sleeps after 15 min of inactivity. The UI shows a "waking up…" state automatically — it polls `/health` before proceeding.

---

## Deploy to Google Cloud Run

```bash
cd ibm-backend
gcloud run deploy qibm-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars QIBM_CORS_ORIGINS=https://your-site.netlify.app
```

---

## Frontend API URL config

In `ibm.html`, just before `</body>`:
```html
<script>
  window.QIBM_API_BASE = 'https://your-backend.onrender.com';
</script>
<script src="js/ibm-quantum.js"></script>
```
Change the URL to point to your deployed backend. For local dev the default `http://127.0.0.1:8001` is used.

---

## Security summary

| Rule | Implementation |
|------|---------------|
| Key never in localStorage/cookies/URL | Key in JS closure only, cleared on disconnect |
| Key never logged | All log lines pass through `_redact()` on the server |
| Key sent only in header | `X-IBM-Token` header, HTTPS only in production |
| Server never stores key | Local variable per request, discarded after |
| Owner key never used for visitors | `IBM_QUANTUM_API_KEY` read only by `record_replay.py`, never by `main.py` |
| No eval() / innerHTML with external data | DOM built with `textContent` and safe `el()` helper |

---

## IBM SDK & API versions

- `qiskit==1.1.1`
- `qiskit-aer==0.14.2`
- `qiskit-ibm-runtime==0.24.1` — uses `SamplerV2` primitive (job mode)
- Channel: `ibm_quantum` (free open-access tier)
- QASM: OpenQASM 2.0 (parsed with `qiskit.qasm2.loads`)

> **Note:** IBM's API surface changes frequently. If `SamplerV2` or `QiskitRuntimeService` imports fail, update `requirements.txt` to the latest compatible versions and re-check the IBM Runtime docs at https://docs.quantum.ibm.com/api/qiskit-ibm-runtime

---

## Real-hardware test status

`IBM_QUANTUM_API_KEY` was **not** set in the local environment during development.  
The real-hardware path is fully built and tested with mocked IBM responses in `tests/test_metrics.py`.  
End-to-end real hardware testing requires a valid IBM Quantum account.  
To record a replay run: set `IBM_QUANTUM_API_KEY` in `ibm-backend/.env` and run `python scripts/record_replay.py`.

---

## Known limitations

- Free IBM Quantum accounts have limited queue access and monthly QPU seconds.
- Queue wait times on free tier can be 15 min to several hours.
- `SamplerV2` requires `qiskit-ibm-runtime >= 0.21`. Older SDK versions used `Sampler` (V1) with a different API.
- Noise model in Practice mode is a generic depolarizing model, not calibrated to any specific machine.
- The `record_replay.py` script uses `FakeSherbrooke` only as a fallback during unit tests; real runs use the actual least-busy backend.
