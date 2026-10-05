"""
QuantumLab Python Backend - Quantum Execution & Tracing Engine
Emulates Qiskit QuantumCircuit operations, generates statevector transitions,
and produces step-by-step trace data for the Code Visualizer.
"""

import sys
import io
import math
import numpy as np

# Complex helper constants
IS2 = 1.0 / math.sqrt(2.0)
PI = math.pi

class QuantumCircuitMock:
    """
    Lightweight Qiskit-compatible QuantumCircuit emulator.
    Records instructions, tracks line numbers, and executes statevector simulation.
    """
    def __init__(self, num_qubits=2, num_clbits=None, *args, **kwargs):
        if hasattr(num_qubits, 'size'):
            num_qubits = num_qubits.size
        if num_clbits is not None and hasattr(num_clbits, 'size'):
            num_clbits = num_clbits.size
        self.num_qubits = int(num_qubits)
        self.num_clbits = int(num_clbits) if num_clbits is not None else int(num_qubits)
        self.instructions = []
        self._history = []

    def _record(self, gate_name, targets, controls=None, params=None, label=None):
        if controls is None:
            controls = []
        if params is None:
            params = {}
        
        # Flatten and sanitize targets
        flat_targets = []
        for t in targets:
            if hasattr(t, '__iter__') and not isinstance(t, (str, bytes)):
                flat_targets.extend(int(ti) for ti in t)
            else:
                flat_targets.append(int(t))

        # Flatten and sanitize controls
        flat_controls = []
        for c in controls:
            if hasattr(c, '__iter__') and not isinstance(c, (str, bytes)):
                flat_controls.extend(int(ci) for ci in c)
            else:
                flat_controls.append(int(c))

        # Get caller line number
        lineno = None
        try:
            frame = sys._getframe(2)
            lineno = frame.f_lineno
        except Exception:
            lineno = len(self.instructions) + 1

        instr = {
            "id": len(self.instructions),
            "gate": gate_name,
            "targets": flat_targets,
            "controls": flat_controls,
            "params": params,
            "label": label or gate_name,
            "lineno": lineno
        }
        self.instructions.append(instr)
        return self

    def _apply_single(self, gate_name, q, params=None):
        """Applies single-qubit gate, broadcasting across a list or iterable if provided."""
        if hasattr(q, '__iter__') and not isinstance(q, (str, bytes)):
            for qi in q:
                self._record(gate_name, [int(qi)], params=params)
            return self
        return self._record(gate_name, [int(q)], params=params)

    def _apply_two(self, gate_name, control, target, params=None):
        """Applies two-qubit gate with support for lists/iterables."""
        if hasattr(control, '__iter__') and hasattr(target, '__iter__'):
            c_list = list(control)
            t_list = list(target)
            if len(c_list) == len(t_list):
                for ci, ti in zip(c_list, t_list):
                    self._record(gate_name, [int(ti)], controls=[int(ci)], params=params)
                return self
        c_val = int(control[0]) if hasattr(control, '__iter__') and not isinstance(control, (str, bytes)) else int(control)
        t_val = int(target[0]) if hasattr(target, '__iter__') and not isinstance(target, (str, bytes)) else int(target)
        return self._record(gate_name, [t_val], controls=[c_val], params=params)

    # Single-qubit gates (with list/iterable broadcasting support)
    def h(self, q): return self._apply_single("H", q)
    def x(self, q): return self._apply_single("X", q)
    def y(self, q): return self._apply_single("Y", q)
    def z(self, q): return self._apply_single("Z", q)
    def s(self, q): return self._apply_single("S", q)
    def sdg(self, q): return self._apply_single("Sdg", q)
    def t(self, q): return self._apply_single("T", q)
    def tdg(self, q): return self._apply_single("Tdg", q)
    def sx(self, q): return self._apply_single("SX", q)
    def id(self, q): return self._apply_single("I", q)

    # Parametric rotations
    def rx(self, theta, q): return self._apply_single("Rx", q, params={"theta": str(theta)})
    def ry(self, theta, q): return self._apply_single("Ry", q, params={"theta": str(theta)})
    def rz(self, theta, q): return self._apply_single("Rz", q, params={"theta": str(theta)})
    def p(self, lam, q): return self._apply_single("P", q, params={"lambda": str(lam)})
    def u(self, theta, phi, lam, q): return self._apply_single("U3", q, params={"theta": str(theta), "phi": str(phi), "lambda": str(lam)})
    def u3(self, theta, phi, lam, q): return self.u(theta, phi, lam, q)

    # Two-qubit gates
    def cx(self, control, target): return self._apply_two("CNOT", control, target)
    def cnot(self, control, target): return self.cx(control, target)
    def cz(self, control, target): return self._apply_two("CZ", control, target)
    def cy(self, control, target): return self._apply_two("CY", control, target)
    def ch(self, control, target): return self._apply_two("CH", control, target)
    def swap(self, q1, q2): return self._apply_two("SWAP", q1, q2)
    def cp(self, theta, control, target): return self._apply_two("CPhase", control, target, params={"lambda": str(theta)})
    def crz(self, theta, control, target): return self._apply_two("CRz", control, target, params={"theta": str(theta)})

    # Multi-qubit gates
    def ccx(self, c1, c2, target):
        c1_val = int(c1[0]) if hasattr(c1, '__iter__') and not isinstance(c1, (str, bytes)) else int(c1)
        c2_val = int(c2[0]) if hasattr(c2, '__iter__') and not isinstance(c2, (str, bytes)) else int(c2)
        t_val = int(target[0]) if hasattr(target, '__iter__') and not isinstance(target, (str, bytes)) else int(target)
        return self._record("CCX", [t_val], controls=[c1_val, c2_val])
    def toffoli(self, c1, c2, target): return self.ccx(c1, c2, target)
    def cswap(self, control, t1, t2):
        c_val = int(control[0]) if hasattr(control, '__iter__') and not isinstance(control, (str, bytes)) else int(control)
        t1_val = int(t1[0]) if hasattr(t1, '__iter__') and not isinstance(t1, (str, bytes)) else int(t1)
        t2_val = int(t2[0]) if hasattr(t2, '__iter__') and not isinstance(t2, (str, bytes)) else int(t2)
        return self._record("CSWAP", [t1_val, t2_val], controls=[c_val])
    def fredkin(self, control, t1, t2): return self.cswap(control, t1, t2)

    # Measurement and controls
    def measure(self, q, c=None, *args, **kwargs):
        if hasattr(q, '__iter__') and not isinstance(q, (str, bytes)):
            q_list = list(q)
            c_list = list(c) if hasattr(c, '__iter__') and not isinstance(c, (str, bytes)) else list(range(len(q_list)))
            for qi, ci in zip(q_list, c_list):
                self._record("Measure", [int(qi)], params={"clbit": int(ci)})
            return self
        clbit = int(c) if c is not None else int(q)
        return self._record("Measure", [int(q)], params={"clbit": clbit})

    def measure_all(self, inplace=True, add_bits=True, *args, **kwargs):
        if add_bits and self.num_clbits < self.num_qubits:
            self.num_clbits = self.num_qubits
        for i in range(self.num_qubits):
            self.measure(i, i)
        return self

    def barrier(self, *qubits, **kwargs):
        targets = list(qubits) if qubits else list(range(self.num_qubits))
        return self._record("Barrier", targets)

    def draw(self, output='text', *args, **kwargs):
        # Return text representation
        lines = []
        for i in range(self.num_qubits):
            wire = f"q_{i}: |0>─"
            for step in self.instructions:
                if i in step["targets"]:
                    wire += f"[{step['gate']}]─"
                elif i in step["controls"]:
                    wire += "─●──"
                else:
                    wire += "────"
            lines.append(wire)
        return "\n".join(lines)

    def __str__(self):
        return self.draw()

    def __repr__(self):
        return f"QuantumCircuit({self.num_qubits}, {self.num_clbits})"


# Matrix definitions for simulator
SINGLE_MATRICES = {
    "I": np.array([[1, 0], [0, 1]], dtype=complex),
    "X": np.array([[0, 1], [1, 0]], dtype=complex),
    "Y": np.array([[0, -1j], [1j, 0]], dtype=complex),
    "Z": np.array([[1, 0], [0, -1]], dtype=complex),
    "H": np.array([[IS2, IS2], [IS2, -IS2]], dtype=complex),
    "S": np.array([[1, 0], [0, 1j]], dtype=complex),
    "Sdg": np.array([[1, 0], [0, -1j]], dtype=complex),
    "T": np.array([[1, 0], [0, np.exp(1j * PI / 4.0)]], dtype=complex),
    "Tdg": np.array([[1, 0], [0, np.exp(-1j * PI / 4.0)]], dtype=complex),
    "SX": 0.5 * np.array([[1 + 1j, 1 - 1j], [1 - 1j, 1 + 1j]], dtype=complex),
}

def parse_angle(val_str):
    if isinstance(val_str, (int, float)):
        return float(val_str)
    s = str(val_str).strip().lower()
    s = s.replace('pi', str(math.pi)).replace('e', str(math.e))
    try:
        # safe evaluation of mathematical expression
        allowed = set('0123456789.+-*/() ')
        if all(ch in allowed for ch in s):
            return float(eval(s, {"__builtins__": None}, {}))
    except Exception:
        pass
    return 0.0

def get_single_matrix(gate, params):
    if gate in SINGLE_MATRICES:
        return SINGLE_MATRICES[gate]
    if gate == "Rx":
        th = parse_angle(params.get("theta", 0))
        c = math.cos(th / 2.0)
        s = math.sin(th / 2.0)
        return np.array([[c, -1j * s], [-1j * s, c]], dtype=complex)
    if gate == "Ry":
        th = parse_angle(params.get("theta", 0))
        c = math.cos(th / 2.0)
        s = math.sin(th / 2.0)
        return np.array([[c, -s], [s, c]], dtype=complex)
    if gate == "Rz":
        th = parse_angle(params.get("theta", 0))
        return np.array([[np.exp(-1j * th / 2.0), 0], [0, np.exp(1j * th / 2.0)]], dtype=complex)
    if gate == "P":
        lam = parse_angle(params.get("lambda", 0))
        return np.array([[1, 0], [0, np.exp(1j * lam)]], dtype=complex)
    if gate == "U3":
        th = parse_angle(params.get("theta", 0))
        ph = parse_angle(params.get("phi", 0))
        lam = parse_angle(params.get("lambda", 0))
        return np.array([
            [math.cos(th/2.0), -np.exp(1j * lam) * math.sin(th/2.0)],
            [np.exp(1j * ph) * math.sin(th/2.0), np.exp(1j * (ph + lam)) * math.cos(th/2.0)]
        ], dtype=complex)
    return SINGLE_MATRICES["I"]

def simulate_step(sv, num_qubits, instr):
    """
    Applies instruction to statevector sv using Qiskit ordering convention:
    qubit 0 is least significant bit (index bit 0).
    """
    dim = 1 << num_qubits
    gate = instr["gate"]
    targets = instr.get("targets", [])
    controls = instr.get("controls", [])
    params = instr.get("params", {})

    if gate in ("Barrier", "Measure"):
        return sv.copy()

    # Single qubit gate (uncontrolled)
    if len(targets) == 1 and len(controls) == 0:
        q = targets[0]
        mat = get_single_matrix(gate, params)
        new_sv = sv.copy()
        bit_val = 1 << q
        for i in range(dim):
            if (i & bit_val) == 0:
                j = i | bit_val
                a = sv[i]
                b = sv[j]
                new_sv[i] = mat[0, 0] * a + mat[0, 1] * b
                new_sv[j] = mat[1, 0] * a + mat[1, 1] * b
        return new_sv

    # Controlled single-qubit gate (e.g. CNOT, CZ, CY, CH, CPhase, CRz)
    if len(targets) == 1 and len(controls) == 1:
        c_bit = 1 << controls[0]
        t_bit = 1 << targets[0]

        mat = SINGLE_MATRICES["X"]
        if gate == "CNOT": mat = SINGLE_MATRICES["X"]
        elif gate == "CZ": mat = SINGLE_MATRICES["Z"]
        elif gate == "CY": mat = SINGLE_MATRICES["Y"]
        elif gate == "CH": mat = SINGLE_MATRICES["H"]
        elif gate == "CPhase":
            lam = parse_angle(params.get("lambda", 0))
            mat = np.array([[1, 0], [0, np.exp(1j * lam)]], dtype=complex)
        elif gate == "CRz":
            th = parse_angle(params.get("theta", 0))
            mat = np.array([[np.exp(-1j*th/2), 0], [0, np.exp(1j*th/2)]], dtype=complex)

        new_sv = sv.copy()
        for i in range(dim):
            # Check all controls are 1 and target bit is 0
            if (i & c_bit) != 0 and (i & t_bit) == 0:
                j = i | t_bit
                a = sv[i]
                b = sv[j]
                new_sv[i] = mat[0, 0] * a + mat[0, 1] * b
                new_sv[j] = mat[1, 0] * a + mat[1, 1] * b
        return new_sv

    # SWAP gate
    if gate == "SWAP" and (len(controls) == 1 or len(targets) == 2):
        q1 = controls[0] if controls else targets[0]
        q2 = targets[0] if controls else targets[1]
        b1 = 1 << q1
        b2 = 1 << q2
        new_sv = sv.copy()
        for i in range(dim):
            has1 = bool(i & b1)
            has2 = bool(i & b2)
            if has1 != has2 and not has2:
                j = (i & ~b1) | b2
                new_sv[i], new_sv[j] = sv[j], sv[i]
        return new_sv

    # Toffoli (CCX) gate
    if gate in ("CCX", "Toffoli") and len(controls) == 2 and len(targets) == 1:
        c1_bit = 1 << controls[0]
        c2_bit = 1 << controls[1]
        t_bit = 1 << targets[0]
        new_sv = sv.copy()
        for i in range(dim):
            if (i & c1_bit) != 0 and (i & c2_bit) != 0 and (i & t_bit) == 0:
                j = i | t_bit
                new_sv[i], new_sv[j] = sv[j], sv[i]
        return new_sv

    # CSWAP (Fredkin) gate
    if gate in ("CSWAP", "Fredkin") and len(controls) == 1 and len(targets) == 2:
        c_bit = 1 << controls[0]
        b1 = 1 << targets[0]
        b2 = 1 << targets[1]
        new_sv = sv.copy()
        for i in range(dim):
            if (i & c_bit) != 0:
                has1 = bool(i & b1)
                has2 = bool(i & b2)
                if has1 != has2 and not has2:
                    j = (i & ~b1) | b2
                    new_sv[i], new_sv[j] = sv[j], sv[i]
        return new_sv

    return sv.copy()


def format_explanation(step, num_qubits):
    """
    Generates rich, pedagogical quantum explanations for code visualization.
    """
    gate = step["gate"]
    targets = step.get("targets", [])
    controls = step.get("controls", [])
    t_str = ", ".join(f"Qubit {t}" for t in targets)
    c_str = ", ".join(f"Qubit {c}" for c in controls)

    if gate == "H":
        return f"Hadamard gate on {t_str}. Maps basis |0⟩ to equal superposition |+⟩ = (|0⟩+|1⟩)/√2 and |1⟩ to |−⟩ = (|0⟩−|1⟩)/√2."
    if gate == "X":
        return f"Pauli-X (NOT) on {t_str}. Flips |0⟩ ↔ |1⟩, reversing the qubit computational state."
    if gate == "Y":
        return f"Pauli-Y on {t_str}. Bit-flip and phase-flip combined: maps |0⟩ → i|1⟩ and |1⟩ → −i|0⟩."
    if gate == "Z":
        return f"Pauli-Z (Phase-Flip) on {t_str}. Leaves |0⟩ unchanged and applies a π phase shift to |1⟩ → −|1⟩."
    if gate == "S":
        return f"S gate (√Z) on {t_str}. Adds an imaginary phase factor e^(iπ/2) = i to the |1⟩ component."
    if gate == "Sdg":
        return f"S† (conjugate transpose of S) on {t_str}. Subtracts an imaginary phase factor −i from the |1⟩ component."
    if gate == "T":
        return f"T gate (π/8 gate) on {t_str}. Applies an e^(iπ/4) phase rotation to |1⟩. Crucial for fault-tolerant universal quantum computation."
    if gate == "Tdg":
        return f"T† gate on {t_str}. Applies an e^(−iπ/4) phase rotation to |1⟩."
    if gate == "CNOT":
        return f"Controlled-NOT on target {t_str} conditioned on control {c_str}. Inverts the target qubit if and only if the control qubit is in |1⟩, generating quantum entanglement."
    if gate == "CZ":
        return f"Controlled-Z gate between {c_str} and {t_str}. Applies a −1 phase shift only when both qubits are simultaneously in state |11⟩."
    if gate == "SWAP":
        return f"SWAP gate exchanging quantum amplitudes between {c_str} and {t_str} without measuring."
    if gate == "CCX":
        return f"Toffoli (CCX) gate on target {t_str} controlled by {c_str}. Universal reversible 3-qubit gate acting as a quantum AND operator."
    if gate == "Rx":
        th = step.get("params", {}).get("theta", "θ")
        return f"Rotation Rx({th}) on {t_str}. Rotates the statevector around the Bloch X-axis."
    if gate == "Ry":
        th = step.get("params", {}).get("theta", "θ")
        return f"Rotation Ry({th}) on {t_str}. Rotates the statevector around the Bloch Y-axis."
    if gate == "Rz":
        th = step.get("params", {}).get("theta", "θ")
        return f"Rotation Rz({th}) on {t_str}. Rotates relative phase around the Bloch Z-axis."
    if gate == "Measure":
        return f"Measurement of {t_str}. Collapses quantum superposition into a classical bit value."
    if gate == "Barrier":
        return "Quantum barrier. Prevents compiler gate reordering and synchronization optimizations across this boundary."
    return f"Applied {gate} operation on {t_str}."


def compute_bloch_vectors(sv, num_qubits):
    """
    Computes per-qubit Bloch coordinates (x, y, z) and purity from statevector.
    """
    blochs = []
    dim = 1 << num_qubits
    for q in range(num_qubits):
        bit = 1 << q
        # Reduced density matrix components
        rho00 = 0.0
        rho11 = 0.0
        rho01 = 0.0 + 0.0j
        for i in range(dim):
            if (i & bit) == 0:
                j = i | bit
                ai = sv[i]
                aj = sv[j]
                rho00 += (ai * ai.conjugate()).real
                rho11 += (aj * aj.conjugate()).real
                rho01 += ai * aj.conjugate()
        
        # Pauli expectations
        # <X> = 2 * Re(rho01), <Y> = 2 * Im(rho01), <Z> = rho00 - rho11
        bx = 2.0 * rho01.real
        by = -2.0 * rho01.imag
        bz = rho00 - rho11
        purity = math.sqrt(bx*bx + by*by + bz*bz)
        theta = math.acos(max(-1.0, min(1.0, bz)))
        phi = math.atan2(by, bx)
        if phi < 0:
            phi += 2 * math.pi

        blochs.append({
            "qubit": q,
            "x": round(float(bx), 4),
            "y": round(float(by), 4),
            "z": round(float(bz), 4),
            "purity": round(float(purity), 4),
            "theta_deg": round(math.degrees(theta), 1),
            "phi_deg": round(math.degrees(phi), 1),
            "is_pure": purity >= 0.999
        })
    return blochs


def trace_circuit(circuit, shots=1024):
    """
    Simulates circuit step-by-step and returns detailed snapshot for every instruction.
    """
    num_qubits = circuit.num_qubits
    dim = 1 << num_qubits

    # Initialize in ground state |0...0>
    current_sv = np.zeros(dim, dtype=complex)
    current_sv[0] = 1.0 + 0.0j

    # Initial step 0 (Ground State)
    def serialize_sv(vec):
        res = []
        for i, amp in enumerate(vec):
            # Format state label in Qiskit order |q_{n-1}...q_0>
            bstr = format(i, f'0{num_qubits}b')
            mag = float(abs(amp))
            prob = float(mag * mag)
            phase = float(math.atan2(amp.imag, amp.real))
            res.append({
                "index": i,
                "label": f"|{bstr}⟩",
                "binary": bstr,
                "real": round(float(amp.real), 5),
                "imag": round(float(amp.imag), 5),
                "mag": round(mag, 5),
                "phase_rad": round(phase, 4),
                "phase_deg": round(math.degrees(phase), 1),
                "prob": round(prob, 5)
            })
        return res

    steps_data = []
    # Step 0: Initial state
    steps_data.append({
        "step_index": 0,
        "lineno": 1,
        "code": f"qc = QuantumCircuit({num_qubits}, {circuit.num_clbits})",
        "gate": "Init",
        "targets": list(range(num_qubits)),
        "controls": [],
        "explanation": f"Initial state: All {num_qubits} qubits initialized in ground state |00...0⟩.",
        "statevector": serialize_sv(current_sv),
        "bloch": compute_bloch_vectors(current_sv, num_qubits)
    })

    # Step by step simulation
    for idx, instr in enumerate(circuit.instructions):
        current_sv = simulate_step(current_sv, num_qubits, instr)
        explanation = format_explanation(instr, num_qubits)
        
        # Build readable python code line for this step
        gate = instr["gate"]
        targets = instr["targets"]
        controls = instr["controls"]
        params = instr.get("params", {})
        
        if controls:
            if gate == "CNOT": code_repr = f"qc.cx({controls[0]}, {targets[0]})"
            elif gate == "CZ": code_repr = f"qc.cz({controls[0]}, {targets[0]})"
            elif gate == "SWAP": code_repr = f"qc.swap({controls[0]}, {targets[0]})"
            elif gate == "CCX": code_repr = f"qc.ccx({controls[0]}, {controls[1]}, {targets[0]})"
            elif gate == "CPhase": code_repr = f"qc.cp({params.get('lambda', 'pi')}, {controls[0]}, {targets[0]})"
            else: code_repr = f"qc.{gate.lower()}({controls[0]}, {targets[0]})"
        elif params:
            param_vals = ", ".join(f"{v}" for v in params.values())
            code_repr = f"qc.{gate.lower()}({param_vals}, {targets[0]})"
        elif gate == "Measure":
            code_repr = f"qc.measure({targets[0]}, {params.get('clbit', targets[0])})"
        elif gate == "Barrier":
            code_repr = f"qc.barrier()"
        else:
            code_repr = f"qc.{gate.lower()}({targets[0]})"

        steps_data.append({
            "step_index": idx + 1,
            "lineno": instr.get("lineno", idx + 2),
            "code": code_repr,
            "gate": gate,
            "targets": targets,
            "controls": controls,
            "params": params,
            "explanation": explanation,
            "statevector": serialize_sv(current_sv),
            "bloch": compute_bloch_vectors(current_sv, num_qubits)
        })

    # Shot simulation from final statevector
    probs = np.array([abs(c)**2 for c in current_sv], dtype=float)
    p_sum = np.sum(probs)
    if p_sum > 0:
        probs = probs / p_sum
    else:
        probs = np.ones(dim, dtype=float) / dim
    # Sample outcomes
    samples = np.random.choice(dim, size=shots, p=probs)
    counts = {}
    for outcome in samples:
        bstr = format(int(outcome), f'0{num_qubits}b')
        counts[bstr] = counts.get(bstr, 0) + 1

    return {
        "num_qubits": num_qubits,
        "num_clbits": circuit.num_clbits,
        "total_steps": len(circuit.instructions),
        "steps": steps_data,
        "final_statevector": serialize_sv(current_sv),
        "counts": counts,
        "shots": shots,
        "circuit_diagram": circuit.draw()
    }
