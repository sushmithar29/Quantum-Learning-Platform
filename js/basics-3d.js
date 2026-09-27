/* ============================================================
   QUANTUMLAB â€“ BASICS 3D WEBGL ENGINE  v3.0
   js/basics-3d.js

   v3.0 IMPROVEMENTS:
   - AdditiveBlending on all trail & halo materials â†’ real neon glow
   - Particle radius tripled, double-halo system per particle
   - Trail tubes are 2Ã— thicker with maxed emissive intensity
   - Classical = vivid CYAN (#00f5ff), Quantum dead-ends = MAGENTA (#ff00aa),
     Quantum winning = RED (#ff1050) â€” clearly distinguishable at a glance
   - isMaster flag: only the singleViewer calls sim.tick() (no double-tick in compare)
   - Compare mode: both comparison renderers have their own RAF loops (slave mode)
   ============================================================ */

(function (window) {
  'use strict';

  const THREE = window.THREE;
  if (!THREE) {
    console.error('Three.js must be loaded before basics-3d.js');
    return;
  }

  /* â”€â”€â”€ Colour palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const C = {
    classical : 0x00f5ff,   // bright cyan (classical)
    classEm   : 0x00c8ff,
    quantum   : 0xff00cc,   // hot magenta (dead-end quantum branches)
    quantumEm : 0xcc0099,
    winning   : 0xff1050,   // vivid red (winning quantum branch)
    winningEm : 0xdd0035,
    white     : 0xffffff,
    bg        : 0x020810,
  };

  /* â”€â”€â”€ Additive mesh material (halo / glow) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function addMat(color, opacity) {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: opacity !== undefined ? opacity : 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  /* â”€â”€â”€ Additive standard material (trails) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function trailMat(color, emissive, emissiveIntensity, opacity) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: emissiveIntensity !== undefined ? emissiveIntensity : 3.5,
      roughness: 0.0,
      metalness: 0.05,
      transparent: true,
      opacity: opacity !== undefined ? opacity : 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  /* ===========================================================
     MazeViewerInstance
     Renders one Three.js scene in 'classical', 'quantum', or
     'dynamic' (follows simulation) mode.
     isMaster=true  â†’ calls sim.tick() from this RAF loop.
     isMaster=false â†’ reads sim state only (slave).
  =========================================================== */
  class MazeViewerInstance {
    constructor(containerId, options) {
      options = options || {};
      this.container   = document.getElementById(containerId);
      if (!this.container) return;

      this.mode        = options.forcedMode || 'dynamic';
      this.fixedCamera = options.fixedCamera || null;
      this.enableHover = options.enableHover !== false;
      this.isMaster    = options.isMaster !== false;

      this.sim  = window.BasicsSimulation;
      this.maze = window.QuantumMaze;

      this.scene    = null;
      this.camera   = null;
      this.renderer = null;
      this.controls = null;
      this.raycaster = new THREE.Raycaster();
      this.mouse     = new THREE.Vector2();

      this.mazeGroup      = new THREE.Group();
      this.classicalGroup = new THREE.Group();
      this.quantumGroup   = new THREE.Group();
      this.animTime       = 0;

      this.quantumBranchMeshes = [];

      this.cameraPresets = {
        perspective : { pos: new THREE.Vector3(2.5, 23, 16),     target: new THREE.Vector3(2.5, 0, 0) },
        topdown     : { pos: new THREE.Vector3(1.5, 28, 0.001),  target: new THREE.Vector3(1.5, 0, 0) },
        closeup     : { pos: new THREE.Vector3(-4, 13, 8),       target: new THREE.Vector3(-3, 0, 0)  },
      };

      this.init();
    }

    init() {
      /* Scene */
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(C.bg);
      this.scene.fog = new THREE.FogExp2(C.bg, 0.013);

      /* Camera */
      const w = this.container.clientWidth  || 640;
      const h = this.container.clientHeight || 480;
      this.camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 120);

      const initCam = this.fixedCamera === 'topdown'
        ? this.cameraPresets.topdown
        : this.cameraPresets.perspective;
      this.camera.position.copy(initCam.pos);

      /* Renderer */
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.6;
      this.container.appendChild(this.renderer.domElement);

      /* OrbitControls */
      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.target.copy(initCam.target);
        if (this.fixedCamera === 'topdown') {
          this.controls.maxPolarAngle = 0.001;
          this.controls.minPolarAngle = 0.001;
        } else {
          this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
          this.controls.minDistance   = 6;
          this.controls.maxDistance   = 50;
        }
      }

      this.setupLighting();
      this.buildMazeEnvironment();
      this.buildClassicalObjects();
      this.buildQuantumObjects();

      this.scene.add(this.mazeGroup);
      this.scene.add(this.classicalGroup);
      this.scene.add(this.quantumGroup);

      this.bindEvents();

      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    setupLighting() {
      this.scene.add(new THREE.AmbientLight(0xc8d8ff, 1.2));

      const sun = new THREE.DirectionalLight(0xffffff, 1.6);
      sun.position.set(10, 25, 12);
      sun.castShadow = true;
      sun.shadow.mapSize.setScalar(1024);
      sun.shadow.bias = -0.0005;
      this.scene.add(sun);

      const rimC = new THREE.PointLight(C.classical, 2.0, 50);
      rimC.position.set(-14, 10, -10);
      this.scene.add(rimC);

      const rimQ = new THREE.PointLight(C.winning, 2.0, 50);
      rimQ.position.set(14, 10, 10);
      this.scene.add(rimQ);
    }

    buildMazeEnvironment() {
      const cfg = this.maze.CONFIG;

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 30),
        new THREE.MeshStandardMaterial({ color: cfg.floorColor, roughness: 0.55, metalness: 0.3 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.mazeGroup.add(floor);

      this.mazeGroup.add(new THREE.GridHelper(40, 40, 0x1e2a3a, 0x0f1822));

      const wallMat = new THREE.MeshStandardMaterial({ color: cfg.wallColor, roughness: 0.45, metalness: 0.25 });
      const capMat  = new THREE.MeshStandardMaterial({ color: cfg.wallTopColor, roughness: 0.3, metalness: 0.35 });

      this.maze.WALLS.forEach(function(w) {
        const wm = new THREE.Mesh(new THREE.BoxGeometry(w.sx, cfg.wallHeight, w.sz), wallMat);
        wm.position.set(w.x, cfg.wallHeight / 2, w.z);
        wm.castShadow = true;
        wm.receiveShadow = true;
        this.mazeGroup.add(wm);

        const cm = new THREE.Mesh(new THREE.BoxGeometry(w.sx + 0.04, 0.08, w.sz + 0.04), capMat);
        cm.position.set(w.x, cfg.wallHeight + 0.04, w.z);
        this.mazeGroup.add(cm);
      }.bind(this));

      this.buildEntranceMarker();
      this.buildExitMarker();
    }

    buildEntranceMarker() {
      const g = new THREE.Group();
      g.position.set(-10.2, 0.2, -9.5);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.85, 32),
        new THREE.MeshBasicMaterial({ color: C.classical, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.rotation.x = -Math.PI / 2;
      g.add(ring);

      const arrowMat = new THREE.MeshStandardMaterial({ color: C.classical, emissive: C.classEm, emissiveIntensity: 2.0 });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.4, 16), arrowMat);
      shaft.position.y = 1.4;
      g.add(shaft);

      const head = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.8, 16), arrowMat);
      head.position.y = 0.55;
      head.rotation.x = Math.PI;
      g.add(head);

      this.entranceArrowGroup = g;
      this.mazeGroup.add(g);
    }

    buildExitMarker() {
      const g = new THREE.Group();
      g.position.set(10.2, 0.2, 9.5);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.85, 32),
        new THREE.MeshBasicMaterial({ color: C.winning, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.rotation.x = -Math.PI / 2;
      g.add(ring);

      const arrowMat = new THREE.MeshStandardMaterial({ color: C.winning, emissive: C.winningEm, emissiveIntensity: 2.2 });
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.8, 16), arrowMat);
      head.position.set(0, 0.2, 0.6);
      head.rotation.x = -Math.PI / 2;
      g.add(head);

      this.mazeGroup.add(g);
    }

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
       CLASSICAL: bright CYAN particle + trail
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    buildClassicalObjects() {
      const pts  = this.maze.getPathPoints(this.maze.CLASSICAL_DIRECT);
      const vecs = pts.map(function(p) { return new THREE.Vector3(p.x, 0.25, p.z); });
      this.classicalCurve = new THREE.CatmullRomCurve3(vecs, false, 'catmullrom', 0.15);

      /* Trail tube â€” additive blending = glowing ribbon */
      this.classicalRibbon = new THREE.Mesh(
        new THREE.BufferGeometry(),
        trailMat(C.classical, C.classEm, 4.0, 0.85)
      );
      this.classicalGroup.add(this.classicalRibbon);

      /* Bright centre line */
      this.classicalLine = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: C.white })
      );
      this.classicalGroup.add(this.classicalLine);

      /* Particle: white core */
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 24, 24),
        new THREE.MeshBasicMaterial({ color: C.white })
      );
      /* Inner coloured halo (additive) */
      const halo1 = new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 20, 20),
        addMat(C.classical, 0.88)
      );
      core.add(halo1);
      /* Outer soft glow (additive) */
      const halo2 = new THREE.Mesh(
        new THREE.SphereGeometry(1.90, 16, 16),
        addMat(C.classical, 0.30)
      );
      core.add(halo2);
      /* Point light */
      const pLight = new THREE.PointLight(C.classical, 6.0, 16);
      core.add(pLight);

      this.classicalParticle = core;
      this.classicalHalo1    = halo1;
      this.classicalHalo2    = halo2;
      this.classicalGroup.add(core);

      /* Direction arrows */
      this.classicalArrows = this.createDirectionalArrows(14, C.classical, C.classEm);
      this.classicalGroup.add(this.classicalArrows);
    }

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
       QUANTUM: MAGENTA dead-ends, RED winning branch
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    buildQuantumObjects() {
      var self = this;
      this.maze.QUANTUM_BRANCHES.forEach(function(b) {
        const pts  = self.maze.getPathPoints(b.nodes);
        const vecs = pts.map(function(p) { return new THREE.Vector3(p.x, 0.25, p.z); });
        const curve = new THREE.CatmullRomCurve3(vecs, false, 'catmullrom', 0.12);

        const col   = b.isWinning ? C.winning   : C.quantum;
        const emCol = b.isWinning ? C.winningEm : C.quantumEm;
        const rad   = b.isWinning ? 0.38 : 0.26;

        /* Trail tube */
        const mesh = new THREE.Mesh(
          new THREE.BufferGeometry(),
          trailMat(col, emCol, b.isWinning ? 4.5 : 3.0, b.isWinning ? 0.90 : 0.75)
        );
        mesh.userData = { branch: b };
        self.quantumGroup.add(mesh);

        /* Centre line */
        const coreLine = new THREE.Line(
          new THREE.BufferGeometry(),
          new THREE.LineBasicMaterial({ color: C.white })
        );
        self.quantumGroup.add(coreLine);

        /* Particle core */
        const pCore = new THREE.Mesh(
          new THREE.SphereGeometry(b.isWinning ? 0.60 : 0.44, 20, 20),
          new THREE.MeshBasicMaterial({ color: C.white })
        );
        /* Halo 1 */
        const pH1 = new THREE.Mesh(
          new THREE.SphereGeometry(b.isWinning ? 1.1 : 0.85, 20, 20),
          addMat(col, b.isWinning ? 0.90 : 0.80)
        );
        pCore.add(pH1);
        /* Halo 2 */
        const pH2 = new THREE.Mesh(
          new THREE.SphereGeometry(b.isWinning ? 2.0 : 1.55, 16, 16),
          addMat(col, b.isWinning ? 0.35 : 0.22)
        );
        pCore.add(pH2);
        /* Point light */
        const pLt = new THREE.PointLight(col, b.isWinning ? 5.0 : 3.0, 13);
        pCore.add(pLt);

        self.quantumGroup.add(pCore);

        const arrows = self.createDirectionalArrows(b.isWinning ? 12 : 6, col, emCol);
        self.quantumGroup.add(arrows);

        self.quantumBranchMeshes.push({
          branch : b,
          curve  : curve,
          mesh   : mesh,
          coreLine : coreLine,
          tubeMat : mesh.material,
          particle : pCore,
          halo1 : pH1,
          halo2 : pH2,
          pLight : pLt,
          arrows : arrows,
          radius : rad,
        });
      });
    }

    createDirectionalArrows(count, color, emissive) {
      const g   = new THREE.Group();
      const geo = new THREE.ConeGeometry(0.32, 0.60, 12);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({
        color, emissive, emissiveIntensity: 2.2, roughness: 0.15,
      });
      for (var i = 0; i < count; i++) {
        var m = new THREE.Mesh(geo, mat);
        m.visible = false;
        g.add(m);
      }
      return g;
    }

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
       DYNAMIC PATH EXTRUSION â€” Classical
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    updateClassicalPlayback(progress) {
      const curve = this.classicalCurve;
      if (!curve) return;
      const t = Math.max(0.01, Math.min(1.0, progress));

      /* Head particle */
      this.classicalParticle.position.copy(curve.getPointAt(t));
      this.classicalParticle.visible = true;

      /* Pulse halos */
      const pulse = 1.0 + Math.sin(this.animTime * 10) * 0.20;
      this.classicalHalo1.scale.setScalar(pulse);
      this.classicalHalo2.scale.setScalar(pulse * 1.06);

      /* Rebuild trail tube */
      const steps = Math.max(4, Math.floor(t * 80));
      const sub   = [];
      for (var i = 0; i <= steps; i++) {
        sub.push(curve.getPointAt((i / steps) * t));
      }
      const sc = new THREE.CatmullRomCurve3(sub);
      this.classicalRibbon.geometry.dispose();
      this.classicalRibbon.geometry = new THREE.TubeGeometry(sc, steps, 0.35, 10, false);
      this.classicalLine.geometry.dispose();
      this.classicalLine.geometry = new THREE.BufferGeometry().setFromPoints(sub);

      /* Arrows */
      var arrows = this.classicalArrows.children;
      for (var j = 0; j < arrows.length; j++) {
        var at = (j + 1) / (arrows.length + 1);
        arrows[j].visible = at <= t;
        if (arrows[j].visible) {
          arrows[j].position.copy(curve.getPointAt(at));
          arrows[j].quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            curve.getTangentAt(at).normalize()
          );
        }
      }
    }

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
       DYNAMIC PATH EXTRUSION â€” Quantum
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    updateQuantumPlayback(progress, isMeasured, measuredBranchId) {
      const t = Math.max(0.01, Math.min(1.0, progress));

      for (var bi = 0; bi < this.quantumBranchMeshes.length; bi++) {
        var item = this.quantumBranchMeshes[bi];
        var branch   = item.branch;
        var curve    = item.curve;
        var particle = item.particle;
        var halo1    = item.halo1;
        var halo2    = item.halo2;
        var arrows   = item.arrows;
        var mesh     = item.mesh;
        var coreLine = item.coreLine;
        var tubeMat  = item.tubeMat;
        var radius   = item.radius;

        if (isMeasured) {
          var chosen = branch.id === measuredBranchId;
          tubeMat.opacity           = chosen ? 0.95 : 0.07;
          tubeMat.emissiveIntensity = chosen ? 5.5  : 0.05;
          particle.visible          = chosen;
          arrows.visible            = chosen;
        } else {
          tubeMat.opacity           = 0.60 + branch.amplitude * 0.38;
          tubeMat.emissiveIntensity = 2.5  + branch.amplitude * 2.0;
          particle.visible          = true;
          arrows.visible            = true;
        }

        /* Head particle position */
        particle.position.copy(curve.getPointAt(t));

        /* Pulse halos */
        var pulseFactor = 1.0 + Math.sin(this.animTime * 8 + bi * 0.7) * 0.18;
        if (halo1) halo1.scale.setScalar(pulseFactor);
        if (halo2) halo2.scale.setScalar(pulseFactor * 1.08);

        /* Rebuild trail tube */
        var steps = Math.max(3, Math.floor(t * 60));
        var sub   = [];
        for (var i = 0; i <= steps; i++) {
          sub.push(curve.getPointAt((i / steps) * t));
        }
        var sc = new THREE.CatmullRomCurve3(sub);
        mesh.geometry.dispose();
        mesh.geometry = new THREE.TubeGeometry(sc, steps, radius, 10, false);
        coreLine.geometry.dispose();
        coreLine.geometry = new THREE.BufferGeometry().setFromPoints(sub);

        /* Arrows */
        var arrChildren = arrows.children;
        for (var j = 0; j < arrChildren.length; j++) {
          var at = (j + 1) / (arrChildren.length + 1);
          arrChildren[j].visible = at <= t;
          if (arrChildren[j].visible) {
            arrChildren[j].position.copy(curve.getPointAt(at));
            arrChildren[j].quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              curve.getTangentAt(at).normalize()
            );
          }
        }
      }
    }

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
       Camera preset smooth-fly
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    resize() {
      if (!this.container || !this.renderer || !this.camera) return;
      var w = this.container.clientWidth;
      var h = this.container.clientHeight;
      if (!w || !h) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    setCameraPreset(name) {
      const preset = this.cameraPresets[name];
      if (!preset) return;
      const dur   = 800;
      const start = performance.now();
      const sPos  = this.camera.position.clone();
      const sTgt  = this.controls ? this.controls.target.clone() : new THREE.Vector3();
      const self  = this;
      const fly   = function(now) {
        var p = Math.min(1, (now - start) / dur);
        var e = 0.5 - Math.cos(p * Math.PI) / 2;
        self.camera.position.lerpVectors(sPos, preset.pos, e);
        if (self.controls) {
          self.controls.target.lerpVectors(sTgt, preset.target, e);
          self.controls.update();
        }
        if (p < 1) requestAnimationFrame(fly);
      };
      requestAnimationFrame(fly);
    }

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
       Events
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    bindEvents() {
      window.addEventListener('resize', this.resize.bind(this));

      if (this.enableHover) {
        var self = this;
        this.container.addEventListener('mousemove', function(e) {
          var r = self.container.getBoundingClientRect();
          self.mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
          self.mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
          self.checkHover(e.clientX, e.clientY);
        });
      }
    }

    checkHover(sx, sy) {
      var tip = document.getElementById('scene-tooltip');
      if (!tip) return;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      var meshes = this.quantumBranchMeshes.map(function(m) { return m.mesh; });
      var hits   = this.raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        var b = hits[0].object.userData.branch;
        if (b) {
          tip.style.cssText = 'display:block;left:' + (sx + 15) + 'px;top:' + (sy + 15) + 'px;';
          tip.innerHTML = [
            '<div style="font-weight:700;color:' + (b.isWinning ? '#ff1050' : '#ff00cc') + ';font-size:.85rem">' + b.name + '</div>',
            '<div style="font-size:.75rem;color:#9ba8c4;font-family:monospace;margin-top:2px">',
              'Î± = ' + b.amplitude + ' | P = ' + (b.amplitude * b.amplitude * 100).toFixed(1) + '%',
            '</div>',
            '<div style="font-size:.72rem;color:' + (b.isWinning ? '#10b981' : '#f59e0b') + ';margin-top:3px">',
              (b.isWinning ? 'âœ“ Reaches Exit â€” High Amplitude' : 'âœ— Dead End â€” Destructive Interference'),
            '</div>',
          ].join('');
          return;
        }
      }
      tip.style.display = 'none';
    }

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
       Main RAF loop
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    animate(time) {
      requestAnimationFrame(this.animate);
      this.animTime = time * 0.001;

      /* Only the master drives time forward */
      if (this.isMaster) {
        this.sim.tick(time);
      }

      var state      = this.sim.getState();
      var activeMode = this.mode === 'dynamic' ? state.mode : this.mode;

      if (activeMode === 'classical') {
        this.classicalGroup.visible = true;
        this.quantumGroup.visible   = false;
        this.updateClassicalPlayback(state.progress);

      } else if (activeMode === 'quantum') {
        this.classicalGroup.visible = false;
        this.quantumGroup.visible   = true;
        this.updateQuantumPlayback(state.progress, state.isMeasured, state.measuredBranchId);

      } else if (activeMode === 'compare') {
        this.classicalGroup.visible = true;
        this.quantumGroup.visible   = true;
        this.updateClassicalPlayback(state.progress);
        this.updateQuantumPlayback(state.progress, state.isMeasured, state.measuredBranchId);
      }

      if (this.entranceArrowGroup) {
        this.entranceArrowGroup.position.y = 0.2 + Math.sin(this.animTime * 3) * 0.15;
      }

      if (this.controls) this.controls.update();
      this.renderer.render(this.scene, this.camera);
    }
  } // end MazeViewerInstance


  /* ===========================================================
     QuantumMazeManager
     singleViewer  â€” master (calls sim.tick), mode = 'dynamic'
     classicalViewer / quantumViewer â€” slaves, mode forced
  =========================================================== */
  class QuantumMazeManager {
    constructor() {
      this.singleViewer    = null;
      this.classicalViewer = null;
      this.quantumViewer   = null;
      this.sim = window.BasicsSimulation;

      this.initViewers();
      this.bindSimulationEvents();
    }

    initViewers() {
      if (document.getElementById('maze-viewport-single')) {
        this.singleViewer = new MazeViewerInstance('maze-viewport-single', {
          forcedMode  : 'dynamic',
          enableHover : true,
          isMaster    : true,
        });
      }

      if (document.getElementById('canvas-compare-classical')) {
        this.classicalViewer = new MazeViewerInstance('canvas-compare-classical', {
          forcedMode  : 'classical',
          fixedCamera : 'topdown',
          enableHover : false,
          isMaster    : false,
        });
      }

      if (document.getElementById('canvas-compare-quantum')) {
        this.quantumViewer = new MazeViewerInstance('canvas-compare-quantum', {
          forcedMode  : 'quantum',
          fixedCamera : 'topdown',
          enableHover : true,
          isMaster    : false,
        });
      }
    }

    bindSimulationEvents() {
      var singleWrap  = document.getElementById('maze-viewport-single');
      var compareWrap = document.getElementById('maze-viewport-compare');

      this.sim.onUpdate(function(state) {
        if (state.mode === 'compare') {
          if (singleWrap)  singleWrap.style.display  = 'none';
          if (compareWrap) {
            compareWrap.style.display = 'grid';
            if (this.classicalViewer) this.classicalViewer.resize();
            if (this.quantumViewer)   this.quantumViewer.resize();
          }
        } else {
          if (compareWrap) compareWrap.style.display = 'none';
          if (singleWrap) {
            singleWrap.style.display = 'block';
            if (this.singleViewer) this.singleViewer.resize();
          }
        }
      }.bind(this));
    }

    setCameraPreset(name) {
      if (this.singleViewer) this.singleViewer.setCameraPreset(name);
    }
  }

  window.QuantumMazeManager = QuantumMazeManager;

})(window);

