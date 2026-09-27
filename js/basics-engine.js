/* ============================================================
   QUANTUMLAB – BASICS 3D ENGINE  (Part 1/2)
   basics-engine.js
   ============================================================ */
'use strict';

window.QLBasics = (function () {

  /* ── SIMULATION STATE (single source of truth) ── */
  const SIM = {
    scene:0, theta:0.0001, phi:0, alpha:1, beta:0, p0:1, p1:0,
    bitValue:0, measured:false, measResult:null, measHistory:[],
    entangled:false, entMeasA:null, entMeasB:null,
    guided:true, playing:false, guidedTimer:null,
  };
  function updateProbs(){SIM.p0=Math.pow(Math.cos(SIM.theta/2),2);SIM.p1=Math.pow(Math.sin(SIM.theta/2),2);SIM.alpha=Math.cos(SIM.theta/2);SIM.beta=Math.sin(SIM.theta/2);}

  /* ── THREE.JS GLOBALS ── */
  let renderer,scene3,camera,controls3;
  let blochRenderer,blochScene,blochCamera,blochControls;
  const R=2.0;
  let bitMesh0,bitMesh1,bitParticle,bitTrailMesh;
  let stateParticles=[],supWaveLines=[],supMesh;
  let entMeshA,entMeshB,entLink;
  let compQuantumGroup;
  let bShaft,bHead,bTip,bPsiLbl,bProjGeo,bFootDot,bThetaArcGeo,bPhiArcGeo,bThetaLbl,bPhiLbl;
  let bTheta=0.0001,bPhi=0,bAnimRaf=null,bUserActive=false;
  let measGroup,bitGroup,qubitGroup,supGroup,entGroup,compGroup;
  let camAnimRaf=null;

  /* ── HELPERS ── */
  function makeRingLine(r,y,color,opacity){const pts=[];for(let i=0;i<=128;i++){const a=(i/128)*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));}return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity}));}
  function makeLine3(a,b,color,opacity){return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color,transparent:true,opacity}));}
  function makeGreatCircle3(normalVec,color,opacity){const pts=[],q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),normalVec.clone().normalize());for(let i=0;i<=128;i++){const a=(i/128)*Math.PI*2,v=new THREE.Vector3(Math.cos(a)*R,0,Math.sin(a)*R);v.applyQuaternion(q);pts.push(v);}return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity}));}
  function makeSprite(text,hexColor,x,y,z,scale){const cw=256,ch=128,cvs=document.createElement('canvas');cvs.width=cw;cvs.height=ch;const ctx=cvs.getContext('2d'),col='#'+hexColor.toString(16).padStart(6,'0');ctx.shadowColor=col;ctx.shadowBlur=14;ctx.font='bold 32px "JetBrains Mono",monospace';ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,cw/2,ch/2);const tex=new THREE.CanvasTexture(cvs);tex.minFilter=THREE.LinearFilter;const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));spr.scale.set(scale*1.2,scale*0.6,1);spr.position.set(x,y,z);return spr;}

  /* ── BUILD SCENE OBJECTS ── */
  function buildAll(){
    /* particle field */
    const N=280,pos=new Float32Array(N*3);for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*32;pos[i*3+1]=(Math.random()-.5)*18;pos[i*3+2]=(Math.random()-.5)*22;}const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(pos,3));scene3.add(new THREE.Points(fg,new THREE.PointsMaterial({color:0x1e3a5f,size:0.055,transparent:true,opacity:0.4})));

    /* ── SCENE 01: CLASSICAL BIT ── */
    bitGroup=new THREE.Group();scene3.add(bitGroup);
    bitGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,7,12),new THREE.MeshBasicMaterial({color:0x1e3a5f,transparent:true,opacity:0.45})));
    bitMesh0=new THREE.Mesh(new THREE.SphereGeometry(0.45,32,32),new THREE.MeshPhongMaterial({color:0x06b6d4,emissive:0x0891b2}));bitMesh0.position.y=3.2;bitGroup.add(bitMesh0);
    bitMesh1=new THREE.Mesh(new THREE.SphereGeometry(0.45,32,32),new THREE.MeshPhongMaterial({color:0x7c3aed,emissive:0x4c1d95}));bitMesh1.position.y=-3.2;bitGroup.add(bitMesh1);
    bitParticle=new THREE.Mesh(new THREE.SphereGeometry(0.30,24,24),new THREE.MeshPhongMaterial({color:0xf0f4ff,emissive:0xc4b5fd}));bitParticle.position.y=3.2;bitGroup.add(bitParticle);
    const rg=new THREE.RingGeometry(0.55,0.65,32);const rm=new THREE.MeshBasicMaterial({color:0x06b6d4,side:THREE.DoubleSide,transparent:true,opacity:0.5});bitTrailMesh=new THREE.Mesh(rg,rm);bitTrailMesh.rotation.x=Math.PI/2;bitTrailMesh.position.y=3.2;bitGroup.add(bitTrailMesh);
    bitGroup.add(makeSprite('0',0x22d3ee,0,4.1,0,0.8));bitGroup.add(makeSprite('1',0xa78bfa,0,-4.1,0,0.8));bitGroup.add(makeSprite('CLASSICAL BIT',0x4d5a7a,0,0,0,0.6));
    bitGroup.visible=false;

    /* ── SCENE 02: QUBIT ── */
    qubitGroup=new THREE.Group();scene3.add(qubitGroup);
    qubitGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.4,48,32),new THREE.MeshPhongMaterial({color:0x060a18,emissive:0x0e1a3a,transparent:true,opacity:0.4})));
    qubitGroup.add(makeRingLine(1.4,0,0x22d3ee,0.9));
    for(let i=0;i<80;i++){const th=Math.random()*Math.PI,ph=Math.random()*Math.PI*2,r=1.4+(Math.random()-.5)*.5;const p=new THREE.Mesh(new THREE.SphereGeometry(0.03+Math.random()*.02,8,8),new THREE.MeshBasicMaterial({color:Math.random()>.5?0x22d3ee:0xa78bfa,transparent:true,opacity:.3+Math.random()*.5}));p.position.set(r*Math.sin(th)*Math.cos(ph),r*Math.cos(th),r*Math.sin(th)*Math.sin(ph));p.userData={baseR:r,th,phOff:ph,speed:.0004+Math.random()*.0008,t:0};stateParticles.push(p);qubitGroup.add(p);}
    qubitGroup.add(makeSprite('|0⟩',0x22d3ee,0,1.9,0,0.7));qubitGroup.add(makeSprite('|1⟩',0xa78bfa,0,-1.9,0,0.7));
    qubitGroup.visible=false;

    /* ── SCENE 03+04: SUPERPOSITION / BRA-KET ── */
    supGroup=new THREE.Group();scene3.add(supGroup);
    supMesh=new THREE.Mesh(new THREE.SphereGeometry(0.65,32,32),new THREE.MeshPhongMaterial({color:0x7c3aed,emissive:0x4c1d95,transparent:true,opacity:0.8}));supGroup.add(supMesh);
    for(let i=0;i<6;i++){const line=makeRingLine(1.2+i*.5,0,i%2===0?0x22d3ee:0xa78bfa,.08+i*.04);line.userData={idx:i};supWaveLines.push(line);supGroup.add(line);}
    const mkBar=(color,x)=>{const g=new THREE.CylinderGeometry(0.08,0.08,1,16);const m=new THREE.MeshPhongMaterial({color,transparent:true,opacity:.8});const msh=new THREE.Mesh(g,m);msh.position.x=x;return msh;};
    supGroup.userData.bar0=mkBar(0x22d3ee,-1.8);supGroup.userData.bar1=mkBar(0xa78bfa,1.8);supGroup.add(supGroup.userData.bar0);supGroup.add(supGroup.userData.bar1);
    supGroup.add(makeSprite('α|0⟩',0x22d3ee,-1.8,0,0,.65));supGroup.add(makeSprite('β|1⟩',0xa78bfa,1.8,0,0,.65));
    supGroup.visible=false;

    /* ── SCENE 06: MEASUREMENT ── */
    measGroup=new THREE.Group();scene3.add(measGroup);
    const mc=new THREE.Mesh(new THREE.SphereGeometry(0.7,32,32),new THREE.MeshPhongMaterial({color:0x0891b2,emissive:0x0c4a6e,transparent:true,opacity:.85}));measGroup.userData.core=mc;measGroup.add(mc);
    const waveRings=[];for(let i=0;i<4;i++){const l=makeRingLine(0.8+i*.6,0,0x22d3ee,.05+i*.03);waveRings.push(l);measGroup.add(l);}measGroup.userData.waveRings=waveRings;
    measGroup.visible=false;

    /* ── SCENE 07: ENTANGLEMENT ── */
    entGroup=new THREE.Group();scene3.add(entGroup);
    entMeshA=new THREE.Mesh(new THREE.SphereGeometry(0.6,32,32),new THREE.MeshPhongMaterial({color:0x06b6d4,emissive:0x075985}));entMeshA.position.x=-3.8;entGroup.add(entMeshA);
    entMeshB=new THREE.Mesh(new THREE.SphereGeometry(0.6,32,32),new THREE.MeshPhongMaterial({color:0x7c3aed,emissive:0x4c1d95}));entMeshB.position.x=3.8;entGroup.add(entMeshB);
    const epts=[];for(let i=0;i<=80;i++){const t=(i/80)*2-1;epts.push(new THREE.Vector3(t*3.8,0,0));}entLink=new THREE.Line(new THREE.BufferGeometry().setFromPoints(epts),new THREE.LineBasicMaterial({color:0xa78bfa,transparent:true,opacity:.55}));entGroup.add(entLink);
    entGroup.add(makeSprite('Qubit A',0x22d3ee,-3.8,1.3,0,.65));entGroup.add(makeSprite('Qubit B',0xa78bfa,3.8,1.3,0,.65));
    entGroup.visible=false;

    /* ── SCENE 08: COMPARISON ── */
    compGroup=new THREE.Group();scene3.add(compGroup);
    const cClassG=new THREE.Group();const cb=new THREE.Mesh(new THREE.SphereGeometry(0.55,32,32),new THREE.MeshPhongMaterial({color:0xf87171,emissive:0x991b1b}));cb.position.x=-4.5;cClassG.add(cb);cClassG.add(makeSprite('0 or 1',0xf87171,-4.5,1.3,0,.7));cClassG.add(makeSprite('CLASSICAL',0x9ba8c4,-4.5,-1.5,0,.55));compGroup.add(cClassG);
    compQuantumGroup=new THREE.Group();const qb=new THREE.Mesh(new THREE.SphereGeometry(0.55,32,32),new THREE.MeshPhongMaterial({color:0xa78bfa,emissive:0x6d28d9,transparent:true,opacity:.85}));qb.position.set(0,0,0);compQuantumGroup.add(qb);for(let i=0;i<3;i++)compQuantumGroup.add(makeRingLine(.75+i*.22,0,0x7c3aed,.15+i*.1));compQuantumGroup.position.x=4.5;compQuantumGroup.add(makeSprite('α|0⟩+β|1⟩',0xa78bfa,0,1.3,0,.6));compQuantumGroup.add(makeSprite('QUANTUM',0x9ba8c4,0,-1.5,0,.55));compGroup.add(compQuantumGroup);
    compGroup.add(makeLine3(new THREE.Vector3(0,-5,0),new THREE.Vector3(0,5,0),0x1e3a5f,.35));
    compGroup.visible=false;
  }

  /* ── BLOCH SPHERE EMBED ── */
  function initBlochEmbed(){
    const el=document.getElementById('basics-bloch-container'),wr=document.getElementById('basics-bloch-wrap');if(!el||!wr)return;
    const W=wr.offsetWidth||300,H=wr.offsetHeight||200;
    blochRenderer=new THREE.WebGLRenderer({antialias:true,alpha:false});blochRenderer.setSize(W,H);blochRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));blochRenderer.setClearColor(0x060a18,1);el.appendChild(blochRenderer.domElement);
    blochScene=new THREE.Scene();blochCamera=new THREE.PerspectiveCamera(40,W/H,.1,50);blochCamera.position.set(3.5,2.5,4.2);blochCamera.lookAt(0,0,0);
    blochControls=new THREE.OrbitControls(blochCamera,blochRenderer.domElement);blochControls.enableDamping=true;blochControls.dampingFactor=.07;blochControls.enablePan=false;blochControls.minDistance=3;blochControls.maxDistance=8;
    blochControls.addEventListener('start',()=>{bUserActive=true;});blochControls.addEventListener('end',()=>{setTimeout(()=>{bUserActive=false;},2000);});
    blochScene.add(new THREE.AmbientLight(0xffffff,1.1));const bDl=new THREE.DirectionalLight(0xa78bfa,.9);bDl.position.set(4,6,5);blochScene.add(bDl);
    const bg=new THREE.Group();blochScene.add(bg);
    bg.add(new THREE.Mesh(new THREE.SphereGeometry(R,48,32),new THREE.MeshPhongMaterial({color:0x0a1a3a,emissive:0x061228,transparent:true,opacity:.5,side:THREE.FrontSide,depthWrite:false})));
    bg.add(new THREE.Mesh(new THREE.SphereGeometry(R*.995,32,24),new THREE.MeshBasicMaterial({color:0x030810,transparent:true,opacity:.65,side:THREE.BackSide,depthWrite:false})));
    bg.add(makeRingLine(R,0,0x22d3ee,.9));bg.add(makeGreatCircle3(new THREE.Vector3(0,1,0),0x7c3aed,.55));bg.add(makeGreatCircle3(new THREE.Vector3(1,0,0),0x4f46e5,.4));
    [30,-30,60,-60].forEach(d=>{const rad=(d*Math.PI)/180,y2=Math.sin(rad)*R,rL=Math.cos(rad)*R;bg.add(makeRingLine(rL,y2,0x6d28d9,Math.abs(d)===30?.4:.25));});
    const AX=R*1.3;bg.add(makeLine3(new THREE.Vector3(0,-AX,0),new THREE.Vector3(0,AX,0),0x38bdf8,.9));bg.add(makeLine3(new THREE.Vector3(-AX,0,0),new THREE.Vector3(AX,0,0),0xf87171,.9));bg.add(makeLine3(new THREE.Vector3(0,0,-AX),new THREE.Vector3(0,0,AX),0x34d399,.9));
    bg.add(makeSprite('|0⟩',0xe0f2fe,0,R+.32,0,.55));bg.add(makeSprite('|1⟩',0xe0f2fe,0,-R-.32,0,.55));bg.add(makeSprite('|+⟩',0xc4b5fd,R+.32,0,0,.48));bg.add(makeSprite('|-⟩',0xc4b5fd,-R-.32,0,0,.48));
    const vecG=new THREE.Group();blochScene.add(vecG);
    vecG.add(new THREE.Mesh(new THREE.SphereGeometry(.07,16,16),new THREE.MeshBasicMaterial({color:0x22d3ee})));
    const sGeo=new THREE.CylinderGeometry(.028,.028,1,12);sGeo.translate(0,.5,0);bShaft=new THREE.Mesh(sGeo,new THREE.MeshBasicMaterial({color:0x22d3ee}));vecG.add(bShaft);
    bHead=new THREE.Mesh(new THREE.ConeGeometry(.07,.24,14),new THREE.MeshBasicMaterial({color:0x67e8f9}));vecG.add(bHead);
    bTip=new THREE.Mesh(new THREE.SphereGeometry(.07,14,14),new THREE.MeshBasicMaterial({color:0x67e8f9,transparent:true,opacity:.9}));vecG.add(bTip);
    bPsiLbl=makeSprite('|ψ⟩',0x38bdf8,0,0,0,.5);vecG.add(bPsiLbl);
    bProjGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);vecG.add(new THREE.Line(bProjGeo,new THREE.LineBasicMaterial({color:0x67e8f9,transparent:true,opacity:.38})));
    bFootDot=new THREE.Mesh(new THREE.SphereGeometry(.04,10,10),new THREE.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:.6}));vecG.add(bFootDot);
    bThetaArcGeo=new THREE.BufferGeometry();blochScene.add(new THREE.Line(bThetaArcGeo,new THREE.LineBasicMaterial({color:0xfbbf24,transparent:true,opacity:.88})));
    bThetaLbl=makeSprite('θ',0xfbbf24,0,0,0,.38);blochScene.add(bThetaLbl);
    bPhiArcGeo=new THREE.BufferGeometry();blochScene.add(new THREE.Line(bPhiArcGeo,new THREE.LineBasicMaterial({color:0xa78bfa,transparent:true,opacity:.88})));
    bPhiLbl=makeSprite('φ',0xa78bfa,0,0,0,.38);blochScene.add(bPhiLbl);
    updateBlochVector();blochLoop();
    if(window.ResizeObserver)new ResizeObserver(()=>{const w=wr.offsetWidth,h=wr.offsetHeight;if(!w||!h)return;blochCamera.aspect=w/h;blochCamera.updateProjectionMatrix();blochRenderer.setSize(w,h);}).observe(wr);
  }

  function stateVecB(th,ph){return new THREE.Vector3(R*Math.sin(th)*Math.cos(ph),R*Math.cos(th),R*Math.sin(th)*Math.sin(ph));}
  function updateBlochVector(){
    if(!bShaft)return;
    const tip=stateVecB(bTheta,bPhi),len=tip.length(),dir=tip.clone().normalize(),HEAD=.24;
    bShaft.scale.set(1,Math.max(.01,len-HEAD),1);bShaft.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
    bHead.position.copy(tip.clone().sub(dir.clone().multiplyScalar(HEAD*.5)));bHead.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
    bTip.position.copy(tip);bPsiLbl.position.copy(tip.clone().add(dir.clone().multiplyScalar(.3)));
    const foot=new THREE.Vector3(tip.x,0,tip.z);bProjGeo.setFromPoints([new THREE.Vector3(),foot,tip]);bFootDot.position.copy(foot);
    const tPts=[],tR=R*.5;for(let i=0;i<=48;i++){const t=(i/48)*bTheta;tPts.push(new THREE.Vector3(tR*Math.sin(t)*Math.cos(bPhi),tR*Math.cos(t),tR*Math.sin(t)*Math.sin(bPhi)));}bThetaArcGeo.setFromPoints(tPts);
    const tM=bTheta/2,tLR=R*.68;bThetaLbl.position.set(tLR*Math.sin(tM)*Math.cos(bPhi),tLR*Math.cos(tM),tLR*Math.sin(tM)*Math.sin(bPhi));
    const pPts=[],pR=R*.42,nPh=((bPhi%(Math.PI*2))+Math.PI*2)%(Math.PI*2),sw=nPh>Math.PI?nPh-Math.PI*2:nPh;
    for(let i=0;i<=48;i++){const p=(i/48)*sw;pPts.push(new THREE.Vector3(pR*Math.cos(p),0,pR*Math.sin(p)));}bPhiArcGeo.setFromPoints(pPts);
    const pM=sw/2,pLR=R*.58;bPhiLbl.position.set(pLR*Math.cos(pM),.16,pLR*Math.sin(pM));
    SIM.theta=bTheta;SIM.phi=bPhi;updateProbs();syncProbsUI();
  }
  function blochAnimTo(toTh,toPh,ms){
    if(bAnimRaf)cancelAnimationFrame(bAnimRaf);ms=ms||540;const frTh=bTheta,frPh=bPhi;let dPh=toPh-frPh;while(dPh>Math.PI)dPh-=Math.PI*2;while(dPh<-Math.PI)dPh+=Math.PI*2;const t0=performance.now();
    function step(now){const prog=Math.min(1,(now-t0)/ms),ease=1-Math.pow(1-prog,3);bTheta=frTh+(toTh-frTh)*ease;bPhi=frPh+dPh*ease;updateBlochVector();if(prog<1)bAnimRaf=requestAnimationFrame(step);else{bTheta=toTh;bPhi=toPh;updateBlochVector();bAnimRaf=null;}}
    bAnimRaf=requestAnimationFrame(step);
  }
  function blochLoop(){requestAnimationFrame(blochLoop);if(!bUserActive&&!bAnimRaf){bPhi=(bPhi+.0018)%(Math.PI*2);updateBlochVector();}blochControls.update();blochRenderer.render(blochScene,blochCamera);}

  /* ── CAMERA ── */
  const CAM_PRESETS=[[0,3,10],[0,1.5,6],[0,2,8],[0,2,7],[3.5,2,5],[0,1,8],[0,2,12],[0,2,14]];
  function animateCamTo(posArr,ms){
    if(camAnimRaf)cancelAnimationFrame(camAnimRaf);ms=ms||800;const fp=camera.position.clone(),tp=new THREE.Vector3(...posArr),fl=controls3.target.clone(),tl=new THREE.Vector3(0,0,0),t0=performance.now();
    function step(now){const prog=Math.min(1,(now-t0)/ms),ease=1-Math.pow(1-prog,3);camera.position.lerpVectors(fp,tp,ease);controls3.target.lerpVectors(fl,tl,ease);controls3.update();if(prog<1)camAnimRaf=requestAnimationFrame(step);else{camera.position.copy(tp);controls3.target.copy(tl);camAnimRaf=null;}}
    camAnimRaf=requestAnimationFrame(step);
  }

  /* ── SCENE MANAGEMENT ── */
  const SCENES=[{l:'Bit',i:'🔵'},{l:'Qubit',i:'⚛'},{l:'Superposition',i:'〰'},{l:'Bra-Ket',i:'⟨⟩'},{l:'Bloch',i:'🌐'},{l:'Measurement',i:'📡'},{l:'Entanglement',i:'🔗'},{l:'Comparison',i:'⚡'}];
  const SMETA=[
    {num:'Scene 01',title:'Classical Bit',desc:'Classical information is represented as a definite state: 0 or 1. The bit has exactly one value at any time.',math:'bit ∈ {0, 1}'},
    {num:'Scene 02',title:'The Qubit',desc:'A qubit is a quantum two-level system described by a state vector in a 2D complex Hilbert space. Unlike a classical bit, it is not simply 0 or 1.',math:'|ψ⟩ ∈ ℂ²'},
    {num:'Scene 03',title:'Superposition',desc:'A qubit can exist in a linear combination of basis states, described by probability amplitudes α and β satisfying |α|²+|β|²=1.',math:'|ψ⟩ = α|0⟩ + β|1⟩'},
    {num:'Scene 04',title:'Bra-Ket Notation',desc:'Dirac notation: |ψ⟩ is a "ket" (column vector). ⟨ψ| is a "bra" (row vector). The inner product ⟨ψ|ψ⟩=1 for normalised states.',math:'⟨ψ|ψ⟩ = |α|²+|β|² = 1'},
    {num:'Scene 05',title:'Bloch Sphere',desc:'Every single-qubit pure state maps to a unique point on the unit sphere. |0⟩ is the north pole, |1⟩ the south pole.',math:'|ψ⟩=cos(θ/2)|0⟩+e^{iφ}sin(θ/2)|1⟩'},
    {num:'Scene 06',title:'Measurement',desc:'Measuring collapses the quantum state to a classical outcome. The result is probabilistic: P(0)=|α|², P(1)=|β|².',math:'P(0)=|α|²,  P(1)=|β|²'},
    {num:'Scene 07',title:'Entanglement',desc:'Two qubits can be entangled: measuring one instantly determines the correlated outcome of the other. This does NOT allow faster-than-light communication.',math:'|Φ⁺⟩ = (|00⟩+|11⟩)/√2'},
    {num:'Scene 08',title:'Classical vs Quantum',desc:'Classical computers process definite bits through logic gates. Quantum computers exploit superposition, entanglement, and interference for certain computational advantages.',math:''},
  ];
  const sceneGrpMap=[()=>bitGroup,()=>qubitGroup,()=>supGroup,()=>supGroup,()=>null,()=>measGroup,()=>entGroup,()=>compGroup];

  function goToScene(idx,animate){
    idx=Math.max(0,Math.min(7,idx));animate=animate!==false;
    [bitGroup,qubitGroup,supGroup,measGroup,entGroup,compGroup].forEach(g=>{if(g)g.visible=false;});
    document.querySelectorAll('.basics-panel__section').forEach(el=>el.style.display='none');
    SIM.scene=idx;
    const g=sceneGrpMap[idx]();if(g)g.visible=true;
    if(animate)animateCamTo(CAM_PRESETS[idx],800);else{camera.position.set(...CAM_PRESETS[idx]);controls3.target.set(0,0,0);}
    const meta=SMETA[idx],ov=document.getElementById('scene-overlay');
    ov.classList.remove('visible');
    setTimeout(()=>{document.getElementById('scene-num').textContent=meta.num;document.getElementById('scene-title').textContent=meta.title;document.getElementById('scene-desc').textContent=meta.desc;const me=document.getElementById('scene-math');me.textContent=meta.math;me.classList.toggle('visible',!!meta.math);ov.classList.add('visible');},animate?350:50);
    const pids=['panel-bit','panel-qubit','panel-superpos','panel-braket','panel-bloch','panel-measure','panel-entangle','panel-compare'];const pe=document.getElementById(pids[idx]);if(pe)pe.style.display='';
    document.querySelectorAll('.timeline-stage').forEach((el,i)=>{el.classList.toggle('active',i===idx);el.classList.toggle('visited',i<idx);});
    if(idx===1||idx===4||idx===3)blochAnimTo(SIM.theta||.0001,SIM.phi||0,600);
    if(idx===3)updateBraKetDisplay();
    if(idx===5){SIM.measured=false;document.querySelectorAll('.collapse-result').forEach(e=>e.remove());}
    if(idx===6){SIM.entMeasA=null;SIM.entMeasB=null;updateEntangleUI();}
  }

  /* ── MAIN LOOP ── */
  function mainLoop(){
    requestAnimationFrame(mainLoop);const t=performance.now()/1000;
    if(SIM.scene===0&&bitGroup&&bitGroup.visible){const sc=1+.08*Math.sin(t*3);if(SIM.bitValue===0){bitMesh0.scale.setScalar(sc);bitMesh1.scale.setScalar(1);}else{bitMesh1.scale.setScalar(sc);bitMesh0.scale.setScalar(1);}bitTrailMesh.material.opacity=.35+.3*Math.sin(t*2.5);}
    if(SIM.scene===1&&qubitGroup&&qubitGroup.visible){qubitGroup.rotation.y+=.005;stateParticles.forEach(p=>{p.userData.t+=p.userData.speed*60;const ph2=p.userData.phOff+p.userData.t;p.position.set(p.userData.baseR*Math.sin(p.userData.th)*Math.cos(ph2),p.userData.baseR*Math.cos(p.userData.th),p.userData.baseR*Math.sin(p.userData.th)*Math.sin(ph2));p.material.opacity=.2+.5*Math.abs(Math.sin(t*1.5+p.userData.t));});}
    if((SIM.scene===2||SIM.scene===3)&&supGroup&&supGroup.visible){supGroup.rotation.y+=.005;const sc=1+.12*Math.sin(t*2.2);supMesh.scale.setScalar(sc);supWaveLines.forEach((l,i)=>{l.material.opacity=.05+.18*Math.abs(Math.sin(t*1.5+i*.6))*Math.max(SIM.p0,SIM.p1);});const b0=supGroup.userData.bar0,b1=supGroup.userData.bar1;if(b0&&b1){b0.scale.y=Math.max(.01,SIM.p0*3.5);b1.scale.y=Math.max(.01,SIM.p1*3.5);b0.position.y=(SIM.p0*3.5)/2-1.75;b1.position.y=(SIM.p1*3.5)/2-1.75;b0.material.opacity=.3+SIM.p0*.6;b1.material.opacity=.3+SIM.p1*.6;}}
    if(SIM.scene===5&&measGroup&&measGroup.visible&&!SIM.measured){const mc=measGroup.userData.core;if(mc){mc.scale.setScalar(1+.1*Math.sin(t*3.5));}const wr=measGroup.userData.waveRings;if(wr)wr.forEach((l,i)=>{l.material.opacity=.03+.1*Math.abs(Math.sin(t*2+i*.7))*SIM.p0;});}
    if(SIM.scene===6&&entGroup&&entGroup.visible){const ph2=t*2;const pa=[];for(let i=0;i<=80;i++){const tt=(i/80)*2-1;pa.push(new THREE.Vector3(tt*3.8,Math.sin(tt*Math.PI+ph2)*.45,0));}entLink.geometry.setFromPoints(pa);entLink.material.opacity=.35+.3*Math.sin(t*3);entMeshA.material.emissiveIntensity=.5+.4*Math.sin(t*2);entMeshB.material.emissiveIntensity=.5+.4*Math.sin(t*2+Math.PI);}
    if(SIM.scene===7&&compGroup&&compGroup.visible)if(compQuantumGroup)compQuantumGroup.rotation.y+=.007;
    controls3.update();renderer.render(scene3,camera);
  }

  /* ── UI SYNC ── */
  function syncProbsUI(){
    const p0p=Math.round(SIM.p0*100),p1p=100-p0p;
    document.querySelectorAll('.prob-val-0').forEach(e=>e.textContent=p0p+'%');
    document.querySelectorAll('.prob-val-1').forEach(e=>e.textContent=p1p+'%');
    document.querySelectorAll('.prob-bar-0').forEach(e=>e.style.width=p0p+'%');
    document.querySelectorAll('.prob-bar-1').forEach(e=>e.style.width=p1p+'%');
    const ae=document.getElementById('alpha-val'),be=document.getElementById('beta-val');
    if(ae)ae.textContent=SIM.alpha.toFixed(3);if(be)be.textContent=SIM.beta.toFixed(3);
    updateBraKetDisplay();updateHistogramUI();
    document.querySelectorAll('.theta-slider').forEach(s=>s.value=SIM.theta);
  }
  function updateBraKetDisplay(){const el=document.getElementById('braket-eq');if(!el)return;el.innerHTML=`<span class="ket">|ψ⟩</span> = <span class="alpha">${SIM.alpha.toFixed(3)}</span><span class="ket">|0⟩</span> + <span class="beta">${SIM.beta.toFixed(3)}</span><span class="ket">|1⟩</span>`;}
  function updateHistogramUI(){const N=SIM.measHistory.length;if(!N)return;const n0=SIM.measHistory.filter(r=>r===0).length,n1=N-n0;document.querySelectorAll('.hist-bar-0').forEach(e=>e.style.width=Math.round(n0/N*100)+'%');document.querySelectorAll('.hist-bar-1').forEach(e=>e.style.width=Math.round(n1/N*100)+'%');document.querySelectorAll('.hist-val-0').forEach(e=>e.textContent=n0);document.querySelectorAll('.hist-val-1').forEach(e=>e.textContent=n1);const tc=document.getElementById('meas-total');if(tc)tc.textContent=N;}
  function updateEntangleUI(){const stA=document.getElementById('ent-state-a'),stB=document.getElementById('ent-state-b');if(stA)stA.textContent=SIM.entMeasA===null?'|⊗⟩':(SIM.entMeasA===0?'|0⟩':'|1⟩');if(stB)stB.textContent=SIM.entMeasB===null?'|⊗⟩':(SIM.entMeasB===0?'|0⟩':'|1⟩');if(stA)stA.style.color=SIM.entMeasA===null?'':(SIM.entMeasA===0?'var(--cyan)':'var(--violet-light)');if(stB)stB.style.color=SIM.entMeasB===null?'':(SIM.entMeasB===0?'var(--cyan)':'var(--violet-light)');}

  /* ── BIT ANIMATION ── */
  let bitAnimRaf=null;
  function animateBitTo(target){if(bitAnimRaf)cancelAnimationFrame(bitAnimRaf);const from=bitParticle.position.y,to=target===0?3.2:-3.2,t0=performance.now();function step(now){const prog=Math.min(1,(now-t0)/700),ease=1-Math.pow(1-prog,3);bitParticle.position.y=from+(to-from)*ease;bitTrailMesh.position.y=bitParticle.position.y;if(prog<1)bitAnimRaf=requestAnimationFrame(step);else{bitAnimRaf=null;SIM.bitValue=target;bitTrailMesh.material.color.set(target===0?0x06b6d4:0x7c3aed);}}bitAnimRaf=requestAnimationFrame(step);}

  /* ── MEASUREMENT ── */
  function doMeasure(){
    const r=Math.random()<SIM.p0?0:1;SIM.measResult=r;SIM.measured=true;SIM.measHistory.push(r);
    if(r===0)bTheta=.0001;else bTheta=Math.PI-.0001;SIM.theta=bTheta;updateProbs();blochAnimTo(bTheta,bPhi,400);
    const st=document.getElementById('basics-3d-stage');const old=st&&st.querySelector('.collapse-result');if(old)old.remove();
    if(st){const el=document.createElement('div');el.className='collapse-result collapse-result--'+(r===0?'zero':'one');el.textContent=r===0?'|0⟩':'|1⟩';st.style.position='relative';st.appendChild(el);setTimeout(()=>{if(el.parentNode)el.remove();},2500);}
    const hl=document.getElementById('meas-hist-list');if(hl){const row=document.createElement('div');row.className='meas-result';row.innerHTML=`<span class="meas-result__run">#${SIM.measHistory.length}</span><span class="meas-result__val meas-result__val--${r===0?'zero':'one'}">${r===0?'|0⟩':'|1⟩'}</span>`;hl.prepend(row);}
    syncProbsUI();
  }
  function doMeasureEnt(){const r=Math.random()<.5?0:1;SIM.entMeasA=r;SIM.entMeasB=r;updateEntangleUI();[entMeshA,entMeshB].forEach((m,i)=>{m.material.color.set(r===0?0x22d3ee:0xa78bfa);m.material.emissive.set(r===0?0x0891b2:0x7c3aed);});entLink.material.opacity=1;setTimeout(()=>{entLink.material.opacity=.55;},600);}

  /* ── GUIDED MODE ── */
  const GUIDED_DELAYS=[5000,5000,6000,5000,6500,5500,6000,0];
  function startGuided(){SIM.playing=true;const btn=document.getElementById('pb-play');if(btn)btn.textContent='⏸';guidedStep();}
  function guidedStep(){if(!SIM.playing||SIM.scene>=7)return void(SIM.playing=false,document.getElementById('pb-play')&&(document.getElementById('pb-play').textContent='▶'));SIM.guidedTimer=setTimeout(()=>{if(!SIM.playing)return;goToScene(SIM.scene+1);guidedStep();},GUIDED_DELAYS[SIM.scene]);}
  function stopGuided(){SIM.playing=false;if(SIM.guidedTimer){clearTimeout(SIM.guidedTimer);SIM.guidedTimer=null;}const btn=document.getElementById('pb-play');if(btn)btn.textContent='▶';}

  /* ── RESIZE ── */
  function resizeAll(){const st=document.getElementById('basics-3d-stage');if(!st||!renderer)return;const w=st.offsetWidth,h=st.offsetHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}

  /* ── INIT ── */
  function init(){
    const stageEl=document.getElementById('basics-3d-stage');if(!stageEl)return;
    if(typeof THREE==='undefined'){console.error('[QLBasics] Three.js not found');return;}
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setClearColor(0x050812,1);stageEl.appendChild(renderer.domElement);
    scene3=new THREE.Scene();scene3.fog=new THREE.Fog(0x050812,22,65);
    camera=new THREE.PerspectiveCamera(38,stageEl.offsetWidth/stageEl.offsetHeight,.1,120);camera.position.set(0,3,10);camera.lookAt(0,0,0);
    controls3=new THREE.OrbitControls(camera,renderer.domElement);controls3.enableDamping=true;controls3.dampingFactor=.06;controls3.enablePan=false;controls3.minDistance=3;controls3.maxDistance=20;controls3.rotateSpeed=.6;
    scene3.add(new THREE.AmbientLight(0xffffff,.9));const dl1=new THREE.DirectionalLight(0xa78bfa,1.2);dl1.position.set(5,8,6);scene3.add(dl1);const dl2=new THREE.DirectionalLight(0x22d3ee,.7);dl2.position.set(-6,-4,-5);scene3.add(dl2);
    buildAll();initBlochEmbed();resizeAll();window.addEventListener('resize',resizeAll);
    mainLoop();bindUI();goToScene(0,false);
  }

  /* ── BIND UI ── */
  function bindUI(){
    document.querySelectorAll('.timeline-stage').forEach((el,i)=>{el.addEventListener('click',()=>{stopGuided();goToScene(i);});});
    const pbPlay=document.getElementById('pb-play'),pbPrev=document.getElementById('pb-prev'),pbNext=document.getElementById('pb-next'),pbRst=document.getElementById('pb-restart');
    if(pbPlay)pbPlay.addEventListener('click',()=>{if(SIM.playing)stopGuided();else startGuided();});
    if(pbPrev)pbPrev.addEventListener('click',()=>{stopGuided();goToScene(SIM.scene-1);});
    if(pbNext)pbNext.addEventListener('click',()=>{stopGuided();goToScene(SIM.scene+1);});
    if(pbRst) pbRst.addEventListener('click', ()=>{stopGuided();goToScene(0);});
    const gBtn=document.getElementById('btn-guided'),eBtn=document.getElementById('btn-explore');
    if(gBtn)gBtn.addEventListener('click',()=>{SIM.guided=true;gBtn.classList.add('active');if(eBtn)eBtn.classList.remove('active');});
    if(eBtn)eBtn.addEventListener('click',()=>{SIM.guided=false;stopGuided();eBtn.classList.add('active');if(gBtn)gBtn.classList.remove('active');});
    const fsBtn=document.getElementById('btn-fullscreen'),fsExit=document.getElementById('fs-exit');
    if(fsBtn)fsBtn.addEventListener('click',()=>{document.body.classList.toggle('fullscreen');setTimeout(resizeAll,200);});
    if(fsExit)fsExit.addEventListener('click',()=>{document.body.classList.remove('fullscreen');setTimeout(resizeAll,200);});
    const rvBtn=document.getElementById('btn-reset-view');if(rvBtn)rvBtn.addEventListener('click',()=>animateCamTo(CAM_PRESETS[SIM.scene],600));
    const b0=document.getElementById('bit-set-0'),b1=document.getElementById('bit-set-1');
    if(b0)b0.addEventListener('click',()=>animateBitTo(0));if(b1)b1.addEventListener('click',()=>animateBitTo(1));
    document.querySelectorAll('.theta-slider').forEach(sl=>{sl.addEventListener('input',e=>{bTheta=parseFloat(e.target.value);SIM.theta=bTheta;updateProbs();updateBlochVector();syncProbsUI();document.querySelectorAll('.theta-slider').forEach(s=>s.value=bTheta);});});
    document.querySelectorAll('.phi-slider').forEach(sl=>{sl.addEventListener('input',e=>{bPhi=parseFloat(e.target.value);SIM.phi=bPhi;updateBlochVector();syncProbsUI();document.querySelectorAll('.phi-slider').forEach(s=>s.value=bPhi);});});
    document.querySelectorAll('[data-bloch]').forEach(btn=>{btn.addEventListener('click',()=>{const p=btn.dataset.bloch;if(p==='|0⟩')blochAnimTo(.0001,0,550);else if(p==='|1⟩')blochAnimTo(Math.PI-.0001,0,550);else if(p==='|+⟩')blochAnimTo(Math.PI/2,0,550);else if(p==='|-⟩')blochAnimTo(Math.PI/2,Math.PI,550);else if(p==='|+i⟩')blochAnimTo(Math.PI/2,Math.PI/2,550);else if(p==='|-i⟩')blochAnimTo(Math.PI/2,1.5*Math.PI,550);});});
    const brRst=document.getElementById('bloch-reset');if(brRst)brRst.addEventListener('click',()=>blochAnimTo(Math.PI/3,Math.PI/4,550));
    document.querySelectorAll('.btn-measure').forEach(btn=>btn.addEventListener('click',doMeasure));
    const r10=document.getElementById('btn-meas-10');if(r10)r10.addEventListener('click',()=>{for(let i=0;i<10;i++)setTimeout(doMeasure,i*130);});
    const r100=document.getElementById('btn-meas-100');if(r100)r100.addEventListener('click',()=>{for(let i=0;i<100;i++)setTimeout(doMeasure,i*25);});
    const rhst=document.getElementById('btn-hist-reset');if(rhst)rhst.addEventListener('click',()=>{SIM.measHistory=[];SIM.measured=false;const hl=document.getElementById('meas-hist-list');if(hl)hl.innerHTML='';syncProbsUI();});
    const meA=document.getElementById('btn-meas-ent-a');if(meA)meA.addEventListener('click',doMeasureEnt);
    const erRst=document.getElementById('btn-ent-reset');if(erRst)erRst.addEventListener('click',()=>{SIM.entMeasA=null;SIM.entMeasB=null;[entMeshA,entMeshB].forEach((m,i)=>{m.material.color.set(i===0?0x06b6d4:0x7c3aed);m.material.emissive.set(i===0?0x075985:0x4c1d95);});updateEntangleUI();});
    document.querySelectorAll('.why-btn').forEach(btn=>{btn.addEventListener('click',()=>{const p=document.getElementById(btn.dataset.why);if(p)p.classList.add('open');});});
    document.querySelectorAll('.why-popup__close').forEach(btn=>{btn.addEventListener('click',()=>btn.closest('.why-popup').classList.remove('open'));});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGuided();});
  }

  return{init,goToScene,SIM};
})();

document.addEventListener('DOMContentLoaded',()=>{if(typeof THREE!=='undefined')QLBasics.init();});
