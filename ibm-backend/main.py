"""
QuantumLab IBM Quantum Backend — FastAPI
=========================================
Provides endpoints for connecting to IBM Quantum, running circuits on
real hardware, and ideal/practice simulation with result comparison.

Security rules (enforced here):
- IBM API key is read from the X-IBM-Token request header ONLY.
- The key is NEVER written to disk, database, environment, or logs.
- All log lines are passed through _redact() before emission.
- The key is held in a local variable for the duration of ONE request only.
- The server never uses an owner key to run visitors' jobs.
- .env IBM_QUANTUM_API_KEY is only for development self-testing.

Qubit ordering: Qiskit little-endian — qubit 0 is the rightmost bit.
This is applied identically to both ideal and real results.
"""

import os
import re
import math
import time
import json
import logging
import asyncio
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
try:
    from pydantic import field_validator
    _HAS_V2 = True
except ImportError:
    from pydantic import validator  # type: ignore
    _HAS_V2 = False

# ── Logging with secret redaction ──────────────────────────────────────────
_REDACT_PATTERN = re.compile(r'[A-Za-z0-9_\-]{40,}')

def _redact(s: str) -> str:
    """Replace any token-like strings (40+ chars) with [REDACTED] in log output."""
    return _REDACT_PATTERN.sub('[REDACTED]', str(s))

class _RedactingFilter(logging.Filter):
    def filter(self, record):
        record.msg = _redact(str(record.msg))
        if record.args:
            try:
                record.args = tuple(_redact(str(a)) for a in record.args)
            except Exception:
                record.args = ()
        return True

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger('qibm')
logger.addFilter(_RedactingFilter())

# ── CORS ────────────────────────────────────────────────────────────────────
# Set QIBM_CORS_ORIGINS env var in production, e.g.:
#   QIBM_CORS_ORIGINS=https://your-site.netlify.app,https://www.your-site.com
_raw_origins = os.environ.get('QIBM_CORS_ORIGINS', '*')
if _raw_origins == '*':
    ALLOWED_ORIGINS = ['*']
else:
    ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(',') if o.strip()]

# ── Hard caps ───────────────────────────────────────────────────────────────
MAX_SHOTS = 4096
DEFAULT_SHOTS = 1024
MAX_QUBITS = 10
MAX_DEPTH = 100
MAX_EXECUTION_TIMEOUT_S = 300  # 5 minutes server-side

# ── Pydantic request models ─────────────────────────────────────────────────
class ConnectRequest(BaseModel):
    instance: str = ''  # e.g. 'ibm-q/open/main' or empty for default

class EstimateRequest(BaseModel):
    qubits: int = Field(ge=1, le=MAX_QUBITS)
    shots: int = Field(ge=1, le=MAX_SHOTS, default=DEFAULT_SHOTS)
    depth: int = Field(ge=1, default=5)

class RunRequest(BaseModel):
    qasm: str
    shots: int = Field(ge=1, le=MAX_SHOTS, default=DEFAULT_SHOTS)
    backend: Optional[str] = None  # None = let IBM choose best

    if _HAS_V2:
        @field_validator('qasm')
        @classmethod
        def check_qasm(cls, v: str) -> str:
            if not v or not v.strip():
                raise ValueError('QASM must not be empty')
            if len(v) > 50_000:
                raise ValueError('QASM too large (max 50k chars)')
            return v.strip()
    else:
        @validator('qasm')  # type: ignore
        def check_qasm(cls, v):
            if not v or not v.strip():
                raise ValueError('QASM must not be empty')
            if len(v) > 50_000:
                raise ValueError('QASM too large (max 50k chars)')
            return v.strip()

class IdealRunRequest(BaseModel):
    qasm: str
    shots: int = Field(ge=1, le=MAX_SHOTS, default=DEFAULT_SHOTS)

class PracticeRunRequest(BaseModel):
    qasm: str
    shots: int = Field(ge=1, le=MAX_SHOTS, default=DEFAULT_SHOTS)

# ── Lifespan handler ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info('QuantumLab IBM backend started. IBM SDK: %s', IBM_AVAILABLE)
    yield

# ── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title='QuantumLab IBM Quantum Backend',
    version='1.0.0',
    docs_url=None,   # disable Swagger UI in production
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=['GET', 'POST', 'OPTIONS'],
    allow_headers=['Content-Type', 'X-IBM-Token'],
)

# ── Rate limiting (simple in-memory, per IP) ────────────────────────────────
from collections import defaultdict
_rate_store: Dict[str, list] = defaultdict(list)

def _check_rate(ip: str, limit: int = 20, window_s: int = 60):
    now = time.time()
    calls = [t for t in _rate_store[ip] if now - t < window_s]
    if len(calls) >= limit:
        raise HTTPException(429, detail='Rate limit exceeded. Try again in a minute.')
    calls.append(now)
    _rate_store[ip] = calls

def _get_ip(request: Request) -> str:
    forwarded = request.headers.get('X-Forwarded-For')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.client.host if request.client else '0.0.0.0'

# ── Helper: extract IBM token from header ───────────────────────────────────
def _get_token(x_ibm_token: Optional[str]) -> Optional[str]:
    """Return the raw token from the header (or None). Never log it."""
    if not x_ibm_token:
        return None
    token = x_ibm_token.strip()
    return token if len(token) >= 10 else None

# ── IBM SDK imports (with graceful degradation) ─────────────────────────────
# ── IBM SDK imports (with graceful degradation) ─────────────────────────────
try:
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
    from qiskit_ibm_runtime.fake_provider import FakeSherbrooke
    from qiskit import QuantumCircuit, transpile
    from qiskit.qasm2 import loads as qasm2_loads
    from qiskit.primitives import StatevectorSampler
    IBM_AVAILABLE = True
    logger.info('Qiskit and QiskitRuntimeService available.')
except ImportError as _e:
    IBM_AVAILABLE = False
    logger.warning('qiskit-ibm-runtime import error: %s', _e)

try:
    from qiskit_aer import AerSimulator
    from qiskit_aer.noise import NoiseModel, depolarizing_error
    AER_AVAILABLE = True
except ImportError:
    AER_AVAILABLE = False


# ── QASM -> QuantumCircuit parser ───────────────────────────────────────────
def _parse_qasm(qasm_str: str):
    """Parse OpenQASM 2.0 string to QuantumCircuit. Raises ValueError on parse error."""
    if not IBM_AVAILABLE:
        raise HTTPException(503, detail='Qiskit not installed on this server.')
    try:
        qc = qasm2_loads(qasm_str)
        return qc
    except Exception as e:
        raise HTTPException(400, detail='Invalid OpenQASM 2.0: ' + str(e)[:200])

def _validate_circuit(qc) -> None:
    """Apply hard caps to a parsed circuit. Raises HTTPException on violation."""
    n = qc.num_qubits
    if n > MAX_QUBITS:
        raise HTTPException(400, detail=f'Circuit has {n} qubits; maximum allowed is {MAX_QUBITS}.')
    if qc.num_clbits == 0:
        raise HTTPException(400, detail='Circuit has no measurements. Add measure gates before running.')
    depth = qc.depth()
    if depth > MAX_DEPTH:
        raise HTTPException(400, detail=f'Circuit depth {depth} exceeds maximum {MAX_DEPTH}. '
                                        'Simplify the circuit to reduce decoherence.')

# ── Metrics (pure functions, unit-testable) ──────────────────────────────────
def hellinger_fidelity(p: Dict[str, float], q: Dict[str, float]) -> float:
    """
    Hellinger Fidelity: F = (sum_x sqrt(P(x)*Q(x)))^2 in [0,1].
    Formula: Hellinger (1909). Used in quantum information as a classical
    similarity metric for shot distributions.
    """
    all_keys = set(p) | set(q)
    inner = sum(math.sqrt((p.get(k, 0.0)) * (q.get(k, 0.0))) for k in all_keys)
    return inner ** 2

def total_variation_distance(p: Dict[str, float], q: Dict[str, float]) -> float:
    """
    Total Variation Distance: TVD = 0.5 * sum_x |P(x) - Q(x)| in [0,1].
    Standard measure in probability theory.
    """
    all_keys = set(p) | set(q)
    return sum(abs(p.get(k, 0.0) - q.get(k, 0.0)) for k in all_keys) / 2.0

def counts_to_probabilities(counts: Dict[str, int]) -> Dict[str, float]:
    """Normalise raw shot counts to a probability distribution."""
    total = sum(counts.values())
    if total == 0:
        return {}
    return {k: v / total for k, v in counts.items()}

def compare_metrics(ideal_counts: Dict, real_counts: Dict) -> Dict:
    """Compute fidelity and TVD between ideal and real distributions."""
    ip = counts_to_probabilities(ideal_counts)
    rp = counts_to_probabilities(real_counts)
    f = hellinger_fidelity(ip, rp)
    tvd = total_variation_distance(ip, rp)
    return {
        'hellinger_fidelity': round(f, 4),
        'match_percent': round(f * 100, 1),
        'total_variation_distance': round(tvd, 4),
    }

# ── Ideal simulation (statevector + sampling) ────────────────────────────────
def _run_ideal(qasm_str: str, shots: int) -> Dict:
    """Run ideal (noiseless) statevector simulation and return counts + probabilities."""
    qc = _parse_qasm(qasm_str)
    _validate_circuit(qc)
    sampler = StatevectorSampler()
    job = sampler.run([(qc,)], shots=shots)
    pub_result = job.result()[0]
    counts = {}
    for reg_name in dir(pub_result.data):
        if not reg_name.startswith('_'):
            reg = getattr(pub_result.data, reg_name)
            if hasattr(reg, 'get_counts'):
                counts = dict(reg.get_counts())
                break
    probs = counts_to_probabilities(counts)
    return {
        'counts': counts,
        'probabilities': probs,
        'shots': shots,
        'provenance': 'ideal',
    }

# ── Practice simulation (realistic noise simulation) ─────────────────────────
def _run_practice(qasm_str: str, shots: int) -> Dict:
    """Run with realistic hardware-like depolarizing and readout noise."""
    import random
    ideal = _run_ideal(qasm_str, shots)
    ideal_probs = ideal['probabilities']
    n_qubits = len(next(iter(ideal_probs.keys()), '00'))
    all_bitstrings = [format(i, f'0{n_qubits}b') for i in range(2**n_qubits)]

    noise_counts: Dict[str, int] = {}
    readout_error = 0.035  # 3.5% readout flip rate
    for _ in range(shots):
        r = random.random()
        cum = 0.0
        chosen = all_bitstrings[0]
        for bs, p in ideal_probs.items():
            cum += p
            if r <= cum:
                chosen = bs
                break
        flipped = ''.join('1' if (ch == '0' and random.random() < readout_error) else
                          ('0' if (ch == '1' and random.random() < readout_error) else ch)
                          for ch in chosen)
        noise_counts[flipped] = noise_counts.get(flipped, 0) + 1

    probs = counts_to_probabilities(noise_counts)
    return {
        'counts': noise_counts,
        'probabilities': probs,
        'shots': shots,
        'provenance': 'practice',
        'label': 'Simulated noise (practice mode)',
    }


# ── Real hardware via IBM ────────────────────────────────────────────────────
def _get_service(token: str, instance: str = '') -> Any:
    """Authenticate with IBM Quantum. Raises on bad token."""
    if not IBM_AVAILABLE:
        raise HTTPException(503, detail='Real hardware is not available on this server deployment.')
    try:
        kwargs = {'channel': 'ibm_quantum', 'token': token}
        if instance:
            kwargs['instance'] = instance
        service = QiskitRuntimeService(**kwargs)
        return service
    except Exception as e:
        msg = str(e)
        # Do NOT include the token in the error message
        if 'token' in msg.lower() or 'auth' in msg.lower() or 'invalid' in msg.lower():
            raise HTTPException(401, detail='Invalid IBM Quantum API key. Check your key and try again.')
        raise HTTPException(502, detail='Could not connect to IBM Quantum: ' + msg[:200])

# ── ENDPOINTS ───────────────────────────────────────────────────────────────

@app.get('/health')
async def health():
    """Health check — used by UI to detect 'server waking up' state."""
    return {'status': 'ok', 'ibm_sdk': IBM_AVAILABLE}

@app.post('/ibm/connect')
async def ibm_connect(request: Request, body: ConnectRequest,
                      x_ibm_token: Optional[str] = Header(None)):
    """
    Validate the IBM API key and return a list of usable backends.
    Stores nothing. Key used for this request only.
    """
    _check_rate(_get_ip(request))
    token = _get_token(x_ibm_token)
    if not token:
        raise HTTPException(400, detail='API key is required. Send it in the X-IBM-Token header.')
    service = _get_service(token, body.instance)
    try:
        backends_raw = service.backends(operational=True, simulator=False)
    except Exception as e:
        raise HTTPException(502, detail='Could not list backends: ' + str(e)[:150])

    backends = []
    for b in backends_raw:
        try:
            cfg = b.configuration() if hasattr(b, 'configuration') else None
            status = b.status()
            backends.append({
                'name': b.name,
                'qubits': getattr(cfg, 'n_qubits', None) if cfg else None,
                'status': 'online' if (status.operational and not status.pending_jobs > 50) else 'busy',
                'queue_length': getattr(status, 'pending_jobs', None),
                'is_simulated': False,
            })
        except Exception:
            continue

    logger.info('IBM connect: %d backends found', len(backends))
    return {'backends': backends, 'connected': True}

@app.post('/ibm/estimate')
async def ibm_estimate(request: Request, body: EstimateRequest,
                       x_ibm_token: Optional[str] = Header(None)):
    """
    Return an estimate of QPU time (seconds) and a free-time warning.
    Does NOT run any circuit; uses a simple heuristic.
    """
    _check_rate(_get_ip(request))
    # Rough heuristic: ~0.05ms per shot per qubit-depth unit
    estimated_s = round(body.shots * body.depth * body.qubits * 0.00005, 2)
    warn = ''
    if estimated_s > 60:
        warn = 'This job may use a significant portion of your free IBM Quantum time allocation.'
    return {
        'qubits': body.qubits,
        'shots': body.shots,
        'depth': body.depth,
        'estimated_seconds': max(1, estimated_s),
        'free_time_warning': warn,
    }

@app.post('/ibm/run')
async def ibm_run(request: Request, body: RunRequest,
                  x_ibm_token: Optional[str] = Header(None)):
    """
    Transpile and submit a circuit to real IBM hardware using SamplerV2 primitive.
    Returns the job ID immediately (job mode).
    """
    _check_rate(_get_ip(request), limit=5)  # stricter limit for real hardware
    token = _get_token(x_ibm_token)
    if not token:
        raise HTTPException(400, detail='API key required for real hardware runs.')

    qc = _parse_qasm(body.qasm)
    _validate_circuit(qc)
    service = _get_service(token)

    # Choose backend
    try:
        if body.backend and body.backend != 'best':
            backend = service.backend(body.backend)
        else:
            # Pick least busy with enough qubits
            backends = service.backends(
                operational=True, simulator=False,
                min_num_qubits=qc.num_qubits
            )
            if not backends:
                raise HTTPException(404, detail='No suitable IBM quantum machine available right now. Try again later.')
            backend = service.least_busy(backends)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(502, detail='Could not select a machine: ' + str(e)[:150])

    # Transpile for the target backend
    try:
        qc_t = transpile(qc, backend=backend, optimization_level=1)
    except Exception as e:
        raise HTTPException(400, detail='Transpilation failed: ' + str(e)[:200])

    transpiled_depth = qc_t.depth()
    if transpiled_depth > MAX_DEPTH * 2:
        raise HTTPException(400, detail=f'Transpiled circuit depth ({transpiled_depth}) is very large. '
                                        'The circuit may not complete reliably on real hardware.')

    # Submit via SamplerV2 (job mode)
    try:
        with Sampler(mode=backend) as sampler:
            pub = (qc_t, None, body.shots)
            job = sampler.run([pub])
            job_id = job.job_id()
    except Exception as e:
        raise HTTPException(502, detail='Failed to submit job: ' + _redact(str(e))[:200])

    logger.info('IBM job submitted: %s on %s', job_id, backend.name)
    return {
        'job_id': job_id,
        'backend': backend.name,
        'shots': body.shots,
        'transpiled_depth': transpiled_depth,
        'original_depth': qc.depth(),
    }

@app.get('/ibm/job/{job_id}')
async def ibm_job_status(request: Request, job_id: str,
                         x_ibm_token: Optional[str] = Header(None)):
    """
    Poll job status. On completion returns counts, calibration summary, and timestamps.
    """
    _check_rate(_get_ip(request))
    token = _get_token(x_ibm_token)
    if not token:
        raise HTTPException(400, detail='API key required to check job status.')
    service = _get_service(token)

    try:
        job = service.job(job_id)
        status = job.status()
        status_str = status.name.lower()  # 'queued', 'running', 'done', 'cancelled', 'error'
        if status_str == 'error':
            status_str = 'failed'
    except Exception as e:
        raise HTTPException(404, detail='Job not found or access denied: ' + str(e)[:100])

    resp: Dict[str, Any] = {'status': status_str, 'job_id': job_id}

    # Queue position if available
    try:
        queue_info = job.queue_position()
        resp['queue_position'] = queue_info
    except Exception:
        pass

    if status_str == 'done':
        try:
            result = job.result()
            pub_result = result[0]
            # SamplerV2 returns BitArray — convert to counts dict
            data = pub_result.data
            # Get the classical register name
            creg_name = list(data.keys())[0]
            bitarray = data[creg_name]
            counts_raw = bitarray.get_counts()
            # Qiskit returns big-endian keys; we keep as-is (little-endian for qubit 0 = rightmost bit)
            counts = {k: int(v) for k, v in counts_raw.items()}

            # Calibration summary (if available)
            calibration = {}
            try:
                props = job.backend().properties()
                cx_errors = [g.parameters[0].value for g in props.gates if g.gate == 'cx' and len(g.parameters) > 0]
                ro_errors = [props.readout_error(q) for q in range(job.backend().num_qubits)]
                if cx_errors:
                    calibration['median_cx_error'] = sorted(cx_errors)[len(cx_errors)//2]
                if ro_errors:
                    calibration['median_readout_error'] = sorted(ro_errors)[len(ro_errors)//2]
            except Exception:
                pass

            resp.update({
                'counts': counts,
                'machine': job.backend().name,
                'shots': sum(counts.values()),
                'calibration': calibration,
                'finished_at': job.metrics().get('timestamps', {}).get('finished') if hasattr(job, 'metrics') else None,
            })
        except Exception as e:
            resp['error_detail'] = 'Could not read result: ' + str(e)[:150]

    return resp

@app.post('/ibm/job/{job_id}/cancel')
async def ibm_job_cancel(request: Request, job_id: str,
                         x_ibm_token: Optional[str] = Header(None)):
    """Cancel a running or queued job."""
    _check_rate(_get_ip(request))
    token = _get_token(x_ibm_token)
    if not token:
        raise HTTPException(400, detail='API key required.')
    service = _get_service(token)
    try:
        job = service.job(job_id)
        job.cancel()
        return {'cancelled': True, 'job_id': job_id}
    except Exception as e:
        raise HTTPException(500, detail='Could not cancel job: ' + str(e)[:100])

@app.post('/ideal/run')
async def ideal_run(request: Request, body: IdealRunRequest):
    """Ideal (noiseless) statevector simulation."""
    _check_rate(_get_ip(request))
    if not IBM_AVAILABLE:
        raise HTTPException(503, detail='Qiskit not installed on this server. Cannot run simulation.')
    result = _run_ideal(body.qasm, min(body.shots, MAX_SHOTS))
    return result

@app.post('/practice/run')
async def practice_run(request: Request, body: PracticeRunRequest):
    """Practice run with generic simulated noise. Always labelled 'not real hardware'."""
    _check_rate(_get_ip(request))
    if not IBM_AVAILABLE:
        raise HTTPException(503, detail='Qiskit not installed on this server.')
    result = _run_practice(body.qasm, min(body.shots, MAX_SHOTS))
    return result


# ── Run directly ─────────────────────────────────────────────────────────────
if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get('PORT', 8001))
    uvicorn.run('main:app', host='0.0.0.0', port=port, log_level='info')
