#!/usr/bin/env python3
"""
scripts/record_replay.py
========================
OWNER-ONLY script: runs the preset circuits on a real IBM machine
using the local .env key and writes assets/hardware-replay.json.

Usage (from repo root):
    python scripts/record_replay.py

The script reads IBM_QUANTUM_API_KEY from ibm-backend/.env or
the shell environment. It will NEVER run as part of the website.
Results are written to assets/hardware-replay.json and committed.

IMPORTANT: Never commit ibm-backend/.env or your .env to git.
"""

import os, sys, json, math, time
from pathlib import Path

# Load .env from ibm-backend/.env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / 'ibm-backend' / '.env'
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded .env from {env_path}")
except ImportError:
    pass  # python-dotenv not required if key is in shell env

API_KEY = os.environ.get('IBM_QUANTUM_API_KEY', '').strip()
if not API_KEY:
    sys.exit(
        "ERROR: IBM_QUANTUM_API_KEY is not set.\n"
        "Set it in ibm-backend/.env or export it in your shell.\n"
        "This script is for owner use only — never for site visitors."
    )

try:
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
    from qiskit import QuantumCircuit, transpile
    from qiskit.qasm2 import loads as qasm2_loads
    from qiskit_aer import AerSimulator
except ImportError:
    sys.exit("Install qiskit-ibm-runtime and qiskit-aer first:\n  pip install -r ibm-backend/requirements.txt")

# Preset circuits
PRESETS = {
    'bell': {
        'name': 'Bell State',
        'qasm': """OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;"""
    },
}

SHOTS = 1024
OUTPUT = Path(__file__).parent.parent / 'assets' / 'hardware-replay.json'


def run_ideal(qasm_str: str, shots: int) -> dict:
    """Run ideal statevector simulation."""
    qc = qasm2_loads(qasm_str)
    sim = AerSimulator(method='statevector')
    qc_t = transpile(qc, sim)
    result = sim.run(qc_t, shots=shots).result()
    counts = dict(result.get_counts())
    total = sum(counts.values())
    probs = {k: v / total for k, v in counts.items()}
    return {'counts': counts, 'probabilities': probs, 'provenance': 'ideal'}


def run_real(service, qasm_str: str, shots: int, preset_name: str) -> dict:
    """Run on least-busy real IBM machine. Returns full result dict."""
    qc = qasm2_loads(qasm_str)
    backends = service.backends(operational=True, simulator=False, min_num_qubits=qc.num_qubits)
    if not backends:
        raise RuntimeError('No suitable IBM machine available.')
    backend = service.least_busy(backends)
    print(f"  Using backend: {backend.name}")

    qc_t = transpile(qc, backend=backend, optimization_level=1)
    print(f"  Transpiled depth: {qc_t.depth()}")

    with Sampler(mode=backend) as sampler:
        pub = (qc_t, None, shots)
        job = sampler.run([pub])
        job_id = job.job_id()
        print(f"  Job submitted: {job_id}")
        print(f"  Waiting for result (may take several minutes)...")
        result = job.result()

    pub_result = result[0]
    data = pub_result.data
    creg_name = list(data.keys())[0]
    counts_raw = data[creg_name].get_counts()
    counts = {k: int(v) for k, v in counts_raw.items()}
    total = sum(counts.values())
    probs = {k: v / total for k, v in counts.items()}

    # Calibration summary
    calibration = {}
    try:
        props = backend.properties()
        cx_errs = [g.parameters[0].value for g in props.gates if g.gate == 'cx' and g.parameters]
        ro_errs = [props.readout_error(q) for q in range(backend.num_qubits)]
        if cx_errs:
            calibration['median_cx_error'] = sorted(cx_errs)[len(cx_errs) // 2]
        if ro_errs:
            calibration['median_readout_error'] = sorted(ro_errs)[len(ro_errs) // 2]
    except Exception as e:
        print(f"  Warning: could not get calibration: {e}")

    return {
        'counts': counts,
        'probabilities': probs,
        'provenance': 'real',
        'job_id': job_id,
        'machine': backend.name,
        'shots': shots,
        'finished_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'calibration': calibration,
    }


def main():
    print("Authenticating with IBM Quantum...")
    service = QiskitRuntimeService(channel='ibm_quantum', token=API_KEY)
    print("Connected.\n")

    runs = []
    for key, preset in PRESETS.items():
        print(f"Recording preset: {preset['name']}")
        try:
            print("  Running ideal simulation...")
            ideal = run_ideal(preset['qasm'], SHOTS)
            print("  Running on real hardware (this may take minutes)...")
            real = run_real(service, preset['qasm'], SHOTS, preset['name'])
            runs.append({
                'preset': key,
                'name': preset['name'],
                'date': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                'ideal': ideal,
                'real': real,
            })
            print(f"  Job ID: {real['job_id']}")
            print(f"  Counts: {real['counts']}\n")
        except Exception as e:
            print(f"  FAILED: {e}\n")

    output = {'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'runs': runs}
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(output, indent=2))
    print(f"Written to {OUTPUT}")
    print(f"Recorded {len(runs)} run(s).")
    if not runs:
        print("No runs were recorded. The replay option will stay hidden.")


if __name__ == '__main__':
    main()
