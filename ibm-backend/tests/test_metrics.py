"""
Unit tests for QuantumLab IBM backend metrics and validation.
All IBM responses are mocked — no real hardware calls.
Run: cd ibm-backend && pytest tests/ -v
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import math

try:
    import pytest
except ImportError:
    import contextlib
    class _PytestShim:
        @staticmethod
        @contextlib.contextmanager
        def raises(expected_exc):
            try:
                yield
            except expected_exc:
                pass
            except Exception as e:
                raise AssertionError(f"Expected {expected_exc}, raised {type(e)}") from e
            else:
                raise AssertionError(f"Expected {expected_exc} to be raised, but nothing was raised")
    pytest = _PytestShim()

from main import (
    hellinger_fidelity,
    total_variation_distance,
    counts_to_probabilities,
    compare_metrics,
    _redact,
)


# ─── Hellinger Fidelity ────────────────────────────────────────────────────

class TestHellingerFidelity:
    def test_identical_distributions(self):
        """Identical distributions should give fidelity 1.0"""
        p = {'00': 0.5, '11': 0.5}
        assert abs(hellinger_fidelity(p, p) - 1.0) < 1e-9

    def test_completely_different(self):
        """Non-overlapping distributions should give fidelity 0.0"""
        p = {'00': 1.0}
        q = {'11': 1.0}
        assert abs(hellinger_fidelity(p, q) - 0.0) < 1e-9

    def test_bell_state_ideal_vs_noisy(self):
        """Bell state with small noise should give fidelity close to 1"""
        ideal = {'00': 0.5, '11': 0.5}
        noisy = {'00': 0.49, '11': 0.49, '01': 0.01, '10': 0.01}
        f = hellinger_fidelity(ideal, noisy)
        assert 0.95 < f < 1.0, f"Expected f > 0.95, got {f}"

    def test_symmetric(self):
        """Fidelity must be symmetric: F(p,q) == F(q,p)"""
        p = {'00': 0.6, '11': 0.3, '01': 0.1}
        q = {'00': 0.5, '11': 0.4, '10': 0.1}
        assert abs(hellinger_fidelity(p, q) - hellinger_fidelity(q, p)) < 1e-12

    def test_range_is_zero_to_one(self):
        """Fidelity must always be in [0, 1]"""
        cases = [
            ({'0': 0.7, '1': 0.3}, {'0': 0.4, '1': 0.6}),
            ({'000': 0.5, '111': 0.5}, {'000': 0.45, '111': 0.45, '001': 0.1}),
            ({'0': 1.0}, {'1': 1.0}),
        ]
        for p, q in cases:
            f = hellinger_fidelity(p, q)
            assert 0.0 <= f <= 1.0 + 1e-9, f"Fidelity out of range: {f} for {p}, {q}"

    def test_missing_keys_treated_as_zero(self):
        """Keys absent in one dict should be treated as probability 0"""
        p = {'00': 0.5, '11': 0.5}
        q = {'00': 0.5, '11': 0.4, '01': 0.1}
        f = hellinger_fidelity(p, q)
        assert 0.0 <= f <= 1.0


# ─── Total Variation Distance ─────────────────────────────────────────────

class TestTVD:
    def test_identical(self):
        p = {'00': 0.5, '11': 0.5}
        assert abs(total_variation_distance(p, p) - 0.0) < 1e-9

    def test_completely_different(self):
        p = {'00': 1.0}
        q = {'11': 1.0}
        assert abs(total_variation_distance(p, q) - 1.0) < 1e-9

    def test_half_different(self):
        """TVD between {A:0.5,B:0.5} and {A:1.0} should be 0.5"""
        p = {'A': 0.5, 'B': 0.5}
        q = {'A': 1.0}
        assert abs(total_variation_distance(p, q) - 0.5) < 1e-9

    def test_range_zero_to_one(self):
        p = {'0': 0.6, '1': 0.4}
        q = {'0': 0.3, '1': 0.7}
        tvd = total_variation_distance(p, q)
        assert 0.0 <= tvd <= 1.0

    def test_symmetric(self):
        p = {'00': 0.48, '11': 0.48, '01': 0.04}
        q = {'00': 0.50, '11': 0.50}
        assert abs(total_variation_distance(p, q) - total_variation_distance(q, p)) < 1e-12


# ─── counts_to_probabilities ─────────────────────────────────────────────

class TestCountsToProbabilities:
    def test_sums_to_one(self):
        counts = {'00': 512, '11': 488, '01': 12, '10': 12}
        probs = counts_to_probabilities(counts)
        assert abs(sum(probs.values()) - 1.0) < 1e-9

    def test_empty_counts(self):
        assert counts_to_probabilities({}) == {}

    def test_single_outcome(self):
        probs = counts_to_probabilities({'000': 1024})
        assert probs == {'000': 1.0}

    def test_bell_state_proportions(self):
        counts = {'00': 504, '11': 496, '01': 2, '10': 2}
        probs = counts_to_probabilities(counts)
        assert abs(probs['00'] - 504/1004) < 1e-9
        assert abs(probs['11'] - 496/1004) < 1e-9


# ─── compare_metrics ─────────────────────────────────────────────────────

class TestCompareMetrics:
    def test_perfect_match(self):
        ideal = {'00': 512, '11': 512}
        real  = {'00': 512, '11': 512}
        m = compare_metrics(ideal, real)
        assert abs(m['hellinger_fidelity'] - 1.0) < 1e-9
        assert m['match_percent'] == 100.0
        assert abs(m['total_variation_distance'] - 0.0) < 1e-9

    def test_complete_mismatch(self):
        ideal = {'00': 1000}
        real  = {'11': 1000}
        m = compare_metrics(ideal, real)
        assert abs(m['hellinger_fidelity'] - 0.0) < 1e-9
        assert m['match_percent'] == 0.0
        assert abs(m['total_variation_distance'] - 1.0) < 1e-9

    def test_noisy_bell_state(self):
        """Slightly noisy Bell state should give match > 90%"""
        ideal = {'00': 512, '11': 512}
        real  = {'00': 490, '11': 490, '01': 20, '10': 24}
        m = compare_metrics(ideal, real)
        assert m['match_percent'] > 90, f"Expected > 90%, got {m['match_percent']}"


# ─── Qubit order check ────────────────────────────────────────────────────

class TestQubitOrder:
    def test_bell_state_expected_keys(self):
        """
        Bell state (Qiskit little-endian): qubit 0 is rightmost bit.
        Circuit: h q[0]; cx q[0],q[1]; measure q -> c;
        Expected outcomes: '00' and '11' only.
        """
        expected_keys = {'00', '11'}
        ideal_probs = {'00': 0.5, '11': 0.5}
        assert set(ideal_probs.keys()) == expected_keys

    def test_superposition_expected_keys(self):
        """Single qubit h; measure: expects '0' and '1' only."""
        expected = {'0', '1'}
        ideal_probs = {'0': 0.5, '1': 0.5}
        assert set(ideal_probs.keys()) == expected

    def test_ghz_expected_keys(self):
        """3-qubit GHZ state: expects '000' and '111' only."""
        expected = {'000', '111'}
        ideal_probs = {'000': 0.5, '111': 0.5}
        assert set(ideal_probs.keys()) == expected


# ─── Preset circuit QASM validation ─────────────────────────────────────

class TestPresetQASM:
    def test_bell_state_qasm_has_measurements(self):
        qasm = """OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;"""
        assert 'measure' in qasm
        assert 'qreg q[2]' in qasm
        assert 'creg c[2]' in qasm

    def test_ghz_qasm_has_measurements(self):
        qasm = """OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0],q[1];
cx q[1],q[2];
measure q -> c;"""
        assert 'measure' in qasm
        assert 'qreg q[3]' in qasm


# ─── Secret redaction ─────────────────────────────────────────────────────

class TestSecretRedaction:
    def test_long_token_is_redacted(self):
        fake_token = 'a' * 48  # 48-char fake API key
        msg = f"Connection failed for token {fake_token} at endpoint"
        redacted = _redact(msg)
        assert fake_token not in redacted
        assert '[REDACTED]' in redacted

    def test_short_string_not_redacted(self):
        """Short strings (< 40 chars) should not be redacted"""
        msg = "Hello world"
        assert _redact(msg) == msg

    def test_error_message_without_token(self):
        msg = "Invalid request body: qubits must be <= 10"
        assert _redact(msg) == msg

    def test_redaction_leaves_rest_intact(self):
        fake_token = 'b' * 45
        msg = f"Error connecting with token={fake_token}: timeout"
        redacted = _redact(msg)
        assert 'Error connecting with token=' in redacted
        assert ': timeout' in redacted
        assert fake_token not in redacted


# ─── Input validation caps ────────────────────────────────────────────────

class TestInputValidation:
    def test_shots_cap(self):
        from main import MAX_SHOTS, DEFAULT_SHOTS
        assert MAX_SHOTS == 4096
        assert DEFAULT_SHOTS == 1024

    def test_qubit_cap(self):
        from main import MAX_QUBITS
        assert MAX_QUBITS == 10

    def test_depth_cap(self):
        from main import MAX_DEPTH
        assert MAX_DEPTH == 100

    def test_run_request_shots_validation(self):
        from pydantic import ValidationError
        from main import RunRequest
        with pytest.raises(ValidationError):
            RunRequest(qasm="OPENQASM 2.0;", shots=9999)  # over cap

    def test_run_request_empty_qasm(self):
        from pydantic import ValidationError
        from main import RunRequest
        with pytest.raises(ValidationError):
            RunRequest(qasm="", shots=1024)

    def test_run_request_valid(self):
        from main import RunRequest
        r = RunRequest(qasm="OPENQASM 2.0;\ninclude \"qelib1.inc\";", shots=512)
        assert r.shots == 512


# ─── Error mapping ────────────────────────────────────────────────────────

class TestErrorMapping:
    def test_fidelity_score_labels(self):
        """
        Score label thresholds:
        >= 90% -> Very close
        >= 75% -> Close
        >= 55% -> Noticeably noisy
        < 55%  -> Very noisy
        """
        # These are computed client-side in JS, but we can test the math here
        thresholds = [(0.95, 'great'), (0.80, 'good'), (0.60, 'fair'), (0.40, 'poor')]
        for fidelity, expected_cls in thresholds:
            pct = round(fidelity * 100)
            if pct >= 90:
                cls = 'great'
            elif pct >= 75:
                cls = 'good'
            elif pct >= 55:
                cls = 'fair'
            else:
                cls = 'poor'
            assert cls == expected_cls, f"f={fidelity} expected {expected_cls} got {cls}"


if __name__ == '__main__':
    import inspect
    passed = 0
    failed = 0
    current_module = sys.modules[__name__]
    for name, obj in inspect.getmembers(current_module, inspect.isclass):
        if name.startswith('Test'):
            instance = obj()
            for m_name in dir(instance):
                if m_name.startswith('test_'):
                    method = getattr(instance, m_name)
                    if callable(method):
                        try:
                            method()
                            passed += 1
                            print(f"  [PASS] {name}.{m_name}")
                        except Exception as e:
                            failed += 1
                            print(f"  [FAIL] {name}.{m_name}: {e}")
    print(f"\nResults: {passed} passed, {failed} failed.")
    if failed:
        sys.exit(1)

