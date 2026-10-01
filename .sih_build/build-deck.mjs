import fs from 'node:fs/promises';
import path from 'node:path';
import {Presentation, PresentationFile, FileBlob} from '@oai/artifact-tool';
import sharp from 'sharp';

const root = 'C:/Users/sushm/OneDrive/Desktop/e green quanta';
const source = 'C:/Users/sushm/Downloads/SIH2026-IDEA-Presentation-Format.pptx';
const build = path.join(root,'.sih_build');
const imported = await PresentationFile.importPptx(await FileBlob.load(source));
const proto = imported.toProto();
proto.slides = proto.slides.slice(0,6);
const textOf = e => (e.paragraphs??[]).flatMap(p=>(p.runs??[]).map(r=>r.text??'')).join('');
for (let i=1;i<6;i++) {
  const slide=proto.slides[i];
  slide.elements = slide.elements.filter(e => e.name!=='TextBox 8' && e.type!==7 && !e.name?.startsWith('Oval') && e.placeholderType!=='ftr');
}
const p = Presentation.load(proto);
const C={blue:'#214F86', ink:'#182A3A', muted:'#536574', light:'#EDF4FA', line:'#C5D7E7', green:'#177641'};
function text(slide,name,str,x,y,w,h,size=28,bold=false,color=C.ink,family='Arial') {
 const t=slide.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 t.text=str;
 t.text.style={typeface:family,fontSize:size,bold,color,alignment:'left',verticalAlignment:'top',autoFit:'none',wrap:'square',insets:{left:0,right:0,top:0,bottom:0}};
 return t;
}
function heading(s,str,y=150){return text(s,'Content heading',str,56,y,1165,74,32,true,C.blue);}
function sub(s,str,x,y,w){return text(s,str,str,x,y,w,38,26,true,C.blue);}
function table(s,name,values,x,y,w,heights,widths,size=25){
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values});
 t.styleOptions={headerRow:true,bandedRows:false};
 t.borders.assign({fill:C.line,width:1,style:'solid'});
 for(let r=0;r<values.length;r++){
  t.rows[r].height=heights[r];
  for(let c=0;c<values[r].length;c++){
   const cell=t.getCell(r,c); cell.fill=r===0?C.blue:'#FFFFFF';
   cell.text.style={typeface:'Arial',fontSize:size,bold:r===0,color:r===0?'#FFFFFF':C.ink,autoFit:'none',verticalAlignment:'middle',insets:{left:12,right:12,top:7,bottom:7}};
  }
 }
 return t;
}
function node(s,title,body,x,y,w,h){
 const a=s.shapes.add({name:title,geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:C.light,line:{fill:C.line,width:1.2}});
 text(s,title+' title',title,x+14,y+13,w-28,35,27,true,C.blue);
 text(s,title+' detail',body,x+14,y+57,w-28,h-65,24);
 return a;
}
function connect(s,a,b){s.shapes.connect(a,b,{kind:'straight',fromSide:'right',toSide:'left',line:{fill:C.blue,width:2},tail:{type:'triangle',width:'sm',length:'sm'}});}

for(let i=1;i<6;i++){
 const s=p.slides.items[i];
 const title=s.shapes.items.find(x=>x.name==='Title 1'||x.name?.startsWith('Title'));
 if(i===1){title.text='QUANTUMLAB'; title.position={left:190,top:25,width:820,height:85}; title.text.style={typeface:'Times New Roman',fontSize:48,bold:true,color:'#000000',alignment:'center',autoFit:'none',insets:{left:0,right:0,top:0,bottom:0}};}
 const oval=s.shapes.add({name:'QuantumLab template team marker',geometry:'ellipse',position:{left:34.62,top:26.48,width:131.43,height:84.76},fill:'#FFFFFF',line:{fill:'#8064A2',width:2.2}});
 oval.text='Quantum\nLab';oval.text.style={typeface:'Arial',fontSize:20,bold:true,color:C.blue,alignment:'center',verticalAlignment:'middle',autoFit:'none',insets:{left:0,right:0,top:0,bottom:0}};
 s.images.add({blob:await fs.readFile(path.join(build,'image2.png')),contentType:'image/png',alt:'Smart India Hackathon 2026 logo from supplied template',fit:'contain',position:{left:1026.78,top:0.16,width:236.2,height:111.53}});
 const footer=text(s,'Template footer','@SIH Idea submission- Template',488,678,336.38,28,14,false,'#FFFFFF');
 footer.text.alignment='center';
}

// Slide 2: one product promise, its educational problem and its differentiator.
{
const s=p.slides.items[1];
heading(s,'AI-guided quantum learning, grounded in circuit results');
sub(s,'The learning problem',56,226,554);
text(s,'Problem','Abstract concepts and fragmented tools make independent practice difficult.',56,268,540,98,28);
sub(s,'Proposed solution',56,370,554);
text(s,'Solution','Lessons, visual/code circuits, simulation and assessment in one browser workflow.',56,412,540,102,28);
sub(s,'Distinctive learning loop',56,522,554);
text(s,'Differentiator','Circuit-aware hints diagnose mistakes. An unaided challenge checks understanding.',56,564,550,84,27);
const img=path.join(build,'product-demo.png');
try{
 const b=await sharp(await fs.readFile(img)).extract({left:0,top:0,width:1704,height:740}).png().toBuffer();
 s.images.add({blob:b,contentType:'image/png',alt:'Actual QuantumLab browser prototype showing a Bell circuit; screenshot cropped to circuit controls',fit:'contain',position:{left:652,top:226,width:570,height:249}});
 text(s,'Bell expected probability','Bell example: P(00) = P(11) = 50%\nIdeal probabilities before sampling',654,496,567,70,25,false,C.blue);
}catch{
 text(s,'Bell example title','Example learning task: Bell entanglement',654,228,562,62,27,true,C.blue);
 text(s,'Bell workflow','1  Predict the two-qubit outcomes\n2  Build H + controlled-X\n3  Inspect the joint state\n4  Explain and solve a new challenge',654,310,562,210,28);
}
text(s,'Prototype status','Browser prototype available\nAI tutoring and SDK adapters are planned',654,580,567,67,23,false,C.muted);
s.speakerNotes.textFrame.setText(`QuantumLab is a proposed integrated quantum education platform with an existing browser prototype. Target the introductory college laboratory first, then offer more advanced paths for researchers and professionals. A learner predicts a Bell circuit outcome, builds it, examines the result, receives a targeted hint after an error, and solves a new challenge independently.\nThe planned platform combines structured lessons, visual and code-based circuit design, multiple simulators, state visualization, assessments, personal recommendations and instructor analytics. The novelty hypothesis is circuit-aware diagnosis linked to assessed learning. Visual circuit building itself is established. IBM Quantum Composer already supports drag-and-drop circuits, visualizations and code generation.\nPrototype evidence: visualizer.html; js/visualizer.js (drag/drop and an OpenQASM subset); js/circuit-lab-engine.js; js/progress-store.js. The current AI widget uses canned responses in js/app.js. No implemented SDK adapters or instructor dashboard were found. Do not present planned AI as live.\nSource: https://quantum.cloud.ibm.com/docs/en/guides/composer\nScreenshot, if present: local QuantumLab browser prototype.`);
}

// Slide 3: editable system and AI verification diagrams.
{
const s=p.slides.items[2];
heading(s,'Proposed architecture and verified AI assistance');
const a=node(s,'Workspace','Visual builder + code\nJavaScript / Three.js',56,232,264,166);
const b=node(s,'API + validation','Python / FastAPI\nShared circuit model',350,232,264,166);
const c=node(s,'Simulators','Aer + Cirq first\nIsolated workers',644,232,264,166);
const d=node(s,'Results','States + Bloch views\nProgress dashboards',938,232,286,166);
connect(s,a,b);connect(s,b,c);connect(s,c,d);
sub(s,'AI tutor: simulator checks for supported circuit fixes',56,420,1168);
const e=node(s,'Context','Circuit, error and\nreviewed lesson sources',56,468,350,126);
const f=node(s,'Guidance','Cited explanation, code\nor debugging suggestion',453,468,350,126);
const g=node(s,'Verification','Check the fix, then select\na task by concept mastery',850,468,374,126);
connect(s,e,f);connect(s,f,g);
text(s,'Architecture extensions','Later: PennyLane variational learning and qBraid provider access / conversion',56,619,1168,35,22,false,C.muted);
s.speakerNotes.textFrame.setText(`This is the proposed target architecture. The existing implementation is a static JavaScript application with local simulation.\nMaintain a documented gate subset in a shared circuit representation so the visual editor and code view stay synchronized. Arbitrary Python cannot reliably round-trip into a circuit builder. FastAPI validates circuit size and supported instructions. Workers run Qiskit Aer and Cirq initially, and normalize qubit ordering, gate conventions and result schemas. Use deterministic reference circuits to compare exact states up to global phase and distributions within shot tolerance. Queue larger jobs and isolate execution with CPU/memory/time limits and restricted network access.\nThe AI tutor retrieves reviewed course material and official SDK documentation, observes the actual circuit and error, and proposes explanations, code or fixes. Verify candidate fixes through deterministic simulator checks, cite lesson sources, and disclose failed checks. Use limited hint levels and a final unaided task to assess learning. Planned recommendations use observed concept mastery. PostgreSQL stores minimal learner progress with role-based instructor access.\nVisualizations: ideal statevector, measurement probabilities, sampled counts, density matrices where supported and reduced single-qubit Bloch states. A Bell pair has maximally mixed single-qubit reduced states, so individual Bloch spheres do not represent the full entanglement.\nSDK sources: https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html ; https://quantumai.google/cirq/simulate/simulation ; https://docs.pennylane.ai/en/stable/development/guide/architecture.html ; https://docs.qbraid.com/sdk/user-guide/transpiler ; https://qbraid.com/runtime`);
}

// Slide 4: present maturity honestly and show the main engineering controls.
{
const s=p.slides.items[3];
heading(s,'Working browser core with a staged integration plan');
sub(s,'Prototype available',56,232,450);
text(s,'Current scope','Visual circuits + QASM subset\nState and noise exploration\nQuizzes + local progress',56,277,470,135,27);
sub(s,'Next delivery',56,430,450);
text(s,'Next scope','Aer/Cirq adapters, grounded tutor,\naccounts and instructor dashboard',56,475,476,100,27);
table(s,'Engineering risks',[
 ['Challenge','Response'],
 ['Incorrect AI guidance','Cited lessons + simulator checks'],
 ['SDK inconsistencies','Gate subset + bit-order parity tests'],
 ['Compute and code risk','Isolated workers + quotas + queue']
],568,230,656,[56,96,96,96],[235,421],25);
text(s,'Viability','Viability: open-source SDKs and shared campus hosting. Quotas cap AI and simulation costs.',56,607,1168,51,24,false,C.blue);
s.speakerNotes.textFrame.setText(`The browser prototype demonstrates the core interaction but is not yet a production platform. Current evidence: js/visualizer.js (drag-and-drop, OpenQASM subset), js/circuit-lab-engine.js (small statevector circuits), js/noise-lab-engine.js (single-qubit Bloch channels), js/algorithms-vlab-runner.js (quizzes), js/progress-store.js (local persistence).\nStage 1: harden circuit semantics and reference tests. The current parser does not fully implement measurement collapse/reset and needs controlled-gate validation. Integrate Aer and Cirq, shared result conventions and isolated execution. Stage 2: retrieval-grounded tutor, candidate-fix verification, learner accounts and an instructor dashboard. Stage 3: PennyLane, qBraid, shared assignments and collaborative review. These are proposed milestones, not completed integrations.\nProposed interactive service envelope: up to 8 qubits, 100 gates and 1,024 shots. Benchmark p95 latency below 2 seconds only after specifying machine, warm workers and concurrency. Larger circuits use a queue. General statevector memory grows as 2^n and density-matrix storage as 4^n.\nViability hypothesis: reuse open-source SDKs and campus infrastructure. Track AI tokens, worker-seconds and support effort per completed lab before pricing. Cache reviewed explanations and enforce usage budgets. Do not claim zero operating cost. Faculty onboarding, accessibility, retention limits and content review are required before a classroom pilot.`);
}

// Slide 5: outcomes and transparent pilot success criteria.
{
const s=p.slides.items[4];
heading(s,'A practical digital lab for quantum education');
sub(s,'Students',56,232,508);
text(s,'Student benefit','Guided practice: qubits, Bell states, teleportation and Grover search.',56,274,508,100,28);
sub(s,'Faculty and institutions',56,382,508);
text(s,'Faculty benefit','Assign coding challenges, track concept mastery and reuse modular labs.',56,424,508,100,28);
sub(s,'India’s quantum workforce',56,536,508);
text(s,'India benefit','Support hands-on learning alongside emerging quantum curricula.',56,578,508,72,27);
sub(s,'Proposed pilot targets',630,232,592);
text(s,'Pilot size','60 learners, 2 classes, 4 weeks',630,274,592,41,27,false,C.muted);
table(s,'Pilot targets',[
 ['Target','Measure'],
 ['≥80%','Lab completion'],
 ['+20 points','Mean concept-test gain\n(percentage points)'],
 ['≤10 min','Median time to first\ncorrect Bell circuit']
],630,321,594,[48,64,82,82],[189,405],25);
text(s,'Pilot disclaimer','Proposed targets, measured with activity logs\nand unaided concept tests',630,609,594,52,20,false,C.muted);
s.speakerNotes.textFrame.setText(`These are proposed pilot success criteria, not achieved results. Recruit 60 learners across two introductory classes for four weeks after institutional consent. Use matched unaided concept tests before and after the pilot, and report the sample, completion rate, score distribution and uncertainty. If feasible, compare against the institution's current teaching workflow to distinguish platform effect from ordinary practice.\nTarget 1: at least 80% complete the defined lab set. Target 2: mean unaided concept score improves by at least 20 percentage points. Target 3: median time from opening the Bell task to first correct circuit is 10 minutes or less. Record help usage and repeat attempts. The final challenge should require a new circuit or explanation without AI hints.\nBenefits are hypotheses to validate: easier access to small-circuit practice, reusable faculty assignments, more visible concept gaps and reduced local setup effort. Real hardware access is an optional future extension, subject to provider access and queues.\nPolicy context: DST and AICTE announced an undergraduate quantum technologies minor that combines theory and practical learning. QuantumLab can complement this educational direction. No government endorsement or partnership is claimed.\nSource: https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum`);
}

// Slide 6: source-backed engineering and honest differentiation.
{
const s=p.slides.items[5];
heading(s,'Official references and design foundations');
const refs=[
 ['IBM Quantum Composer','Existing visual circuits and state views','https://quantum.cloud.ibm.com/docs/en/guides/composer'],
 ['Qiskit Aer','Ideal and noisy circuit simulation','https://qiskit.github.io/qiskit-aer/tutorials/1_aersimulator.html'],
 ['Google Cirq','Independent simulator and adapter checks','https://quantumai.google/cirq/simulate/simulation'],
 ['PennyLane','Differentiable and variational workflows','https://docs.pennylane.ai/en/stable/development/guide/architecture.html'],
 ['qBraid SDK / Runtime','Framework conversion and provider jobs','https://docs.qbraid.com/sdk/user-guide/transpiler'],
 ['DST + AICTE curriculum','Quantum education and laboratory context','https://dst.gov.in/dst-along-aicte-announces-undergraduate-courses-quantum']
];
const t=table(s,'Research references',[['Reference (click to open)','How it informs QuantumLab'],...refs.map(r=>r.slice(0,2))],56,228,1168,[52,52,52,52,52,52,52],[405,763],25);
for(let i=0;i<refs.length;i++){const cell=t.getCell(i+1,0);cell.text.get(refs[i][0]).link={uri:refs[i][2],isExternal:true};cell.text.style={color:C.blue};}
text(s,'Research synthesis','Differentiation to validate: circuit-aware tutoring linked to independent skill assessment',56,617,1168,39,23,true,C.blue);
s.speakerNotes.textFrame.setText(`Official sources checked 29 September 2026.\n${refs.map((r,i)=>`${i+1}. ${r[0]}: ${r[2]}\n   Design use: ${r[1]}.`).join('\n')}\nqBraid runtime reference: https://qbraid.com/runtime\nDensity matrices and reduced states: https://learning.quantum.ibm.com/course/general-formulation-of-quantum-information/density-matrices\n\nThe claimed differentiator is a product and pedagogy hypothesis. Visual circuit design, code generation and quantum state visualizations already exist in established tools. QuantumLab's proposed contribution combines circuit-aware explanations, simulator-checked hints, independent assessment, personalized next steps and faculty progress evidence in one classroom workflow. Validate learning outcomes and usability through the proposed pilot.\nLocal prototype source: visualizer.html; js/visualizer.js; js/circuit-lab-engine.js; js/algorithms-vlab-runner.js; js/progress-store.js. Existing promotional slides and hardcoded algorithm performance numbers are not evidence of educational impact or quantum advantage.`);
}

await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
await fs.writeFile(path.join(build,'candidate-inspect.ndjson'),(await p.inspect({kind:'slide,textbox,shape,table,image,notes',maxChars:150000})).ndjson);
for(let i=0;i<6;i++){
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});
 await fs.writeFile(path.join(build,`draft-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));
}
console.log('Authored six-slide candidate with editable content and speaker notes.');
process.exit(0);
