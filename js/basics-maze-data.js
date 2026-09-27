/* ============================================================
   QUANTUMLAB – BASICS 3D MAZE GRAPH & DATA
   js/basics-maze-data.js
   
   Procedural 3D maze layout modeled directly from the reference video.
   Defines:
   - Outer bounds and wall segments
   - Graph nodes (junctions, corners, dead-ends, exit)
   - Classical sequential search path (including dead-end exploration)
   - Quantum superposition branches with amplitudes & probabilities
   ============================================================ */

(function (window) {
  'use strict';

  // Maze dimensions in world units (centered at origin: X: [-12, 12], Z: [-8, 8])
  const MAZE_CONFIG = {
    width: 24,
    depth: 16,
    wallHeight: 1.8,
    wallThickness: 0.7,
    floorY: 0,
    wallColor: 0x242b3d,       // Deep architectural slate matching reference video
    wallTopColor: 0x3a455e,    // Subtle bevel / rim highlight
    floorColor: 0x090e1a,      // Dark quantum lab floor
    gridColor: 0x131f38,
    classicalColor: 0x2563eb,  // Vivid electric blue (from video)
    classicalGlow: 0x60a5fa,
    quantumBlue: 0x3b82f6,     // Branch exploratory paths
    quantumRed: 0xef4444,      // Winning exit path (from video)
    quantumCyan: 0x06b6d4,     // Superposition glow
    quantumViolet: 0x8b5cf6    // Amplitude pulse
  };

  /**
   * Wall Segments: [x, z, lengthX, lengthZ]
   * Represents thick rectangular walls matching the reference video maze structure.
   */
  const WALLS = [
    // Outer Border (with entrance at top-left X=-10, Z=-8; and exit at bottom-right X=10, Z=8)
    // Top border: left piece and right piece (gap at X: -11 to -9 for entrance)
    { x: -11.5, z: -8, sx: 1.0, sz: 0.7 },
    { x: 1.0, z: -8, sx: 20.0, sz: 0.7 },

    // Bottom border: left piece and right piece (gap at X: 9 to 11 for exit)
    { x: -1.0, z: 8, sx: 20.0, sz: 0.7 },
    { x: 11.5, z: 8, sx: 1.0, sz: 0.7 },

    // Left border (full height)
    { x: -12, z: 0, sx: 0.7, sz: 16.7 },

    // Right border (full height)
    { x: 12, z: 0, sx: 0.7, sz: 16.7 },

    // --- Internal Maze Wall Segments ---
    // Column 1 divider: separates entrance corridor from inner maze
    { x: -8.5, z: -2.0, sx: 0.7, sz: 8.0 },
    { x: -8.5, z: 5.5, sx: 0.7, sz: 3.5 },

    // Section 1: Upper-left dead end hooks
    { x: -6.0, z: -5.0, sx: 4.5, sz: 0.7 },
    { x: -4.0, z: -3.0, sx: 0.7, sz: 3.5 },
    { x: -6.0, z: -1.5, sx: 3.5, sz: 0.7 },

    // Section 2: Lower-left branches
    { x: -6.0, z: 2.0, sx: 4.5, sz: 0.7 },
    { x: -4.0, z: 5.0, sx: 0.7, sz: 4.5 },
    { x: -7.0, z: 4.0, sx: 2.5, sz: 0.7 },

    // Section 3: Central maze spine & corridors
    { x: -1.0, z: -5.5, sx: 0.7, sz: 4.5 },
    { x: 1.5, z: -4.0, sx: 4.5, sz: 0.7 },
    { x: -1.0, z: 0.5, sx: 4.5, sz: 0.7 },
    { x: 1.5, z: 3.0, sx: 0.7, sz: 5.5 },
    { x: -1.0, z: 5.5, sx: 4.5, sz: 0.7 },

    // Section 4: Upper-right branches & switchbacks
    { x: 4.0, z: -6.0, sx: 0.7, sz: 3.5 },
    { x: 6.5, z: -4.0, sx: 4.5, sz: 0.7 },
    { x: 4.0, z: -1.5, sx: 0.7, sz: 4.5 },
    { x: 6.5, z: 0.5, sx: 4.5, sz: 0.7 },

    // Section 5: Lower-right corridors toward exit
    { x: 6.5, z: 5.0, sx: 4.5, sz: 0.7 },
    { x: 9.0, z: 2.5, sx: 0.7, sz: 4.5 },
    { x: 9.0, z: -4.0, sx: 0.7, sz: 4.5 }
  ];

  /**
   * Graph Nodes for path calculation and visualization.
   * Defined with 3D positions [x, 0.15, z] (elevated slightly above floor).
   */
  const NODES = {
    // Entrance
    START:    { id: 'START',    x: -10.2, z: -9.5, type: 'start' },
    N_IN:     { id: 'N_IN',     x: -10.2, z: -6.5, type: 'waypoint' },
    
    // First main bifurcation
    JUNC_1:   { id: 'JUNC_1',   x: -10.2, z: -3.5, type: 'junction', label: '|ψ₁⟩' },
    
    // Branch A (Dead End 1 - upper left loop)
    N_A1:     { id: 'N_A1',     x: -6.5,  z: -3.5, type: 'waypoint' },
    N_A2:     { id: 'N_A2',     x: -6.5,  z: -6.5, type: 'waypoint' },
    DEAD_A:   { id: 'DEAD_A',   x: -2.5,  z: -6.5, type: 'dead_end', label: 'Dead End A' },

    // Main corridor continues down
    JUNC_2:   { id: 'JUNC_2',   x: -10.2, z: 0.5,  type: 'junction', label: '|ψ₂⟩' },

    // Branch B (Dead End 2 - bottom left pocket)
    N_B1:     { id: 'N_B1',     x: -10.2, z: 6.5,  type: 'waypoint' },
    N_B2:     { id: 'N_B2',     x: -6.5,  z: 6.5,  type: 'waypoint' },
    DEAD_B:   { id: 'DEAD_B',   x: -6.5,  z: 3.5,  type: 'dead_end', label: 'Dead End B' },

    // Center crossing
    JUNC_3:   { id: 'JUNC_3',   x: -6.5,  z: 0.5,  type: 'junction', label: '|ψ₃⟩' },
    JUNC_4:   { id: 'JUNC_4',   x: -2.5,  z: 0.5,  type: 'junction', label: '|ψ₄⟩' },

    // Branch C (Dead End 3 - central lower trap)
    N_C1:     { id: 'N_C1',     x: -2.5,  z: 3.5,  type: 'waypoint' },
    N_C2:     { id: 'N_C2',     x: -2.5,  z: 6.5,  type: 'waypoint' },
    DEAD_C:   { id: 'DEAD_C',   x: 0.0,   z: 6.5,  type: 'dead_end', label: 'Dead End C' },

    // Upward through center
    JUNC_5:   { id: 'JUNC_5',   x: -2.5,  z: -2.5, type: 'junction', label: '|ψ₅⟩' },
    
    // Branch D (Dead End 4 - central upper dead end)
    N_D1:     { id: 'N_D1',     x: 0.0,   z: -2.5, type: 'waypoint' },
    DEAD_D:   { id: 'DEAD_D',   x: 0.0,   z: -6.5, type: 'dead_end', label: 'Dead End D' },

    // Forward toward right labyrinth
    JUNC_6:   { id: 'JUNC_6',   x: 2.5,   z: -2.5, type: 'junction', label: '|ψ₆⟩' },
    
    // Branch E (Dead End 5 - upper right pocket)
    N_E1:     { id: 'N_E1',     x: 2.5,   z: -6.5, type: 'waypoint' },
    N_E2:     { id: 'N_E2',     x: 7.5,   z: -6.5, type: 'waypoint' },
    DEAD_E:   { id: 'DEAD_E',   x: 7.5,   z: -2.5, type: 'dead_end', label: 'Dead End E' },

    // Right descent to exit
    JUNC_7:   { id: 'JUNC_7',   x: 2.5,   z: 1.5,  type: 'junction', label: '|ψ₇⟩' },
    JUNC_8:   { id: 'JUNC_8',   x: 5.0,   z: 1.5,  type: 'junction', label: '|ψ₈⟩' },

    // Branch F (Dead End 6 - right middle dead end)
    N_F1:     { id: 'N_F1',     x: 10.2,  z: 1.5,  type: 'waypoint' },
    DEAD_F:   { id: 'DEAD_F',   x: 10.2,  z: -1.5, type: 'dead_end', label: 'Dead End F' },

    // Final corridor leading to exit
    N_EXIT1:  { id: 'N_EXIT1',  x: 5.0,   z: 6.5,  type: 'waypoint' },
    N_EXIT2:  { id: 'N_EXIT2',  x: 10.2,  z: 6.5,  type: 'waypoint' },
    EXIT:     { id: 'EXIT',     x: 10.2,  z: 9.5,  type: 'exit',     label: 'EXIT' }
  };

  /**
   * CLASSICAL PATH SIMULATION
   * Represents the sequential trial-and-error process from the video:
   * 1. Start -> enters maze
   * 2. Tests Branch A (dead end) -> backtracks
   * 3. Tests Branch B (dead end) -> backtracks
   * 4. Tests Branch C (dead end) -> backtracks
   * 5. Finally follows correct route to Exit!
   */
  const CLASSICAL_FULL_TRAVERSAL = [
    // Step 1: Enters maze
    ['START', 'N_IN', 'JUNC_1'],
    // Step 2: Try branch A (Dead End)
    ['JUNC_1', 'N_A1', 'N_A2', 'DEAD_A'],
    // Step 3: Backtrack & proceed down
    ['DEAD_A', 'N_A2', 'N_A1', 'JUNC_1', 'JUNC_2'],
    // Step 4: Try branch B (Dead End)
    ['JUNC_2', 'N_B1', 'N_B2', 'DEAD_B'],
    // Step 5: Backtrack & enter center
    ['DEAD_B', 'N_B2', 'N_B1', 'JUNC_2', 'JUNC_3', 'JUNC_4'],
    // Step 6: Follow spine
    ['JUNC_4', 'JUNC_5', 'JUNC_6'],
    // Step 7: Try branch E (Dead End)
    ['JUNC_6', 'N_E1', 'N_E2', 'DEAD_E'],
    // Step 8: Backtrack to JUNC_6 & descend
    ['DEAD_E', 'N_E2', 'N_E1', 'JUNC_6', 'JUNC_7', 'JUNC_8', 'N_EXIT1', 'N_EXIT2', 'EXIT']
  ];

  // The direct optimal classical route (for quick playback)
  const CLASSICAL_DIRECT_PATH = [
    'START', 'N_IN', 'JUNC_1', 'JUNC_2', 'JUNC_3', 'JUNC_4', 
    'JUNC_5', 'JUNC_6', 'JUNC_7', 'JUNC_8', 'N_EXIT1', 'N_EXIT2', 'EXIT'
  ];

  /**
   * QUANTUM SUPERPOSITION BRANCHES
   * In quantum mode, ALL valid branches explore simultaneously!
   * Each path has an amplitude α (such that ∑ |α|² = 1.0) and wave phase.
   */
  const QUANTUM_BRANCHES = [
    {
      id: 'quantum_winning',
      name: '|Solution Path⟩',
      color: MAZE_CONFIG.quantumRed, // Matches red exit path in video
      isWinning: true,
      amplitude: 0.65,
      phase: 0.0,
      nodes: [
        'START', 'N_IN', 'JUNC_1', 'JUNC_2', 'JUNC_3', 'JUNC_4',
        'JUNC_5', 'JUNC_6', 'JUNC_7', 'JUNC_8', 'N_EXIT1', 'N_EXIT2', 'EXIT'
      ]
    },
    {
      id: 'branch_a',
      name: '|Branch A⟩ (Dead End)',
      color: MAZE_CONFIG.quantumBlue,
      isWinning: false,
      amplitude: 0.35,
      phase: Math.PI / 4,
      nodes: ['START', 'N_IN', 'JUNC_1', 'N_A1', 'N_A2', 'DEAD_A']
    },
    {
      id: 'branch_b',
      name: '|Branch B⟩ (Dead End)',
      color: MAZE_CONFIG.quantumBlue,
      isWinning: false,
      amplitude: 0.30,
      phase: Math.PI / 2,
      nodes: ['START', 'N_IN', 'JUNC_1', 'JUNC_2', 'N_B1', 'N_B2', 'DEAD_B']
    },
    {
      id: 'branch_c',
      name: '|Branch C⟩ (Dead End)',
      color: MAZE_CONFIG.quantumBlue,
      isWinning: false,
      amplitude: 0.25,
      phase: (3 * Math.PI) / 4,
      nodes: ['START', 'N_IN', 'JUNC_1', 'JUNC_2', 'JUNC_3', 'JUNC_4', 'N_C1', 'N_C2', 'DEAD_C']
    },
    {
      id: 'branch_d',
      name: '|Branch D⟩ (Dead End)',
      color: MAZE_CONFIG.quantumBlue,
      isWinning: false,
      amplitude: 0.25,
      phase: Math.PI,
      nodes: ['START', 'N_IN', 'JUNC_1', 'JUNC_2', 'JUNC_3', 'JUNC_4', 'JUNC_5', 'N_D1', 'DEAD_D']
    },
    {
      id: 'branch_e',
      name: '|Branch E⟩ (Dead End)',
      color: MAZE_CONFIG.quantumBlue,
      isWinning: false,
      amplitude: 0.30,
      phase: (5 * Math.PI) / 4,
      nodes: ['START', 'N_IN', 'JUNC_1', 'JUNC_2', 'JUNC_3', 'JUNC_4', 'JUNC_5', 'JUNC_6', 'N_E1', 'N_E2', 'DEAD_E']
    },
    {
      id: 'branch_f',
      name: '|Branch F⟩ (Dead End)',
      color: MAZE_CONFIG.quantumBlue,
      isWinning: false,
      amplitude: 0.28,
      phase: (3 * Math.PI) / 2,
      nodes: ['START', 'N_IN', 'JUNC_1', 'JUNC_2', 'JUNC_3', 'JUNC_4', 'JUNC_5', 'JUNC_6', 'JUNC_7', 'JUNC_8', 'N_F1', 'DEAD_F']
    }
  ];

  // Helper to convert node ID list into flat 3D point array [{x, y, z}, ...]
  function getPathPoints(nodeIds) {
    return nodeIds.map(id => {
      const node = NODES[id];
      if (!node) console.warn('Missing node:', id);
      return { x: node.x, y: 0.18, z: node.z };
    });
  }

  // Export to window namespace
  window.QuantumMaze = {
    CONFIG: MAZE_CONFIG,
    WALLS: WALLS,
    NODES: NODES,
    CLASSICAL_TRAVERSAL: CLASSICAL_FULL_TRAVERSAL,
    CLASSICAL_DIRECT: CLASSICAL_DIRECT_PATH,
    QUANTUM_BRANCHES: QUANTUM_BRANCHES,
    getPathPoints: getPathPoints
  };

})(window);
