import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const root='C:/Users/sushm/OneDrive/Desktop/e green quanta';
const skill='C:/Users/sushm/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.11814/skills/presentations';
const source='C:/Users/sushm/Downloads/SIH2026-IDEA-Presentation-Format.pptx';
process.env.RUNTIME_NODE_MODULES='C:/Users/sushm/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const final=path.join(root,'output/QuantumLab_SIH2026_Presentation.pptx');
const result=await finalizePresentation({
 workspaceDir:root,candidatePath:path.join(root,'.sih_build/candidate.pptx'),finalPath:final,
 pythonExecutable:'C:/Users/sushm/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 explicitTotalSlideCount:6,
 requiredNativeTableOwnerSlides:[4,5,6],requiredNativeChartOwnerSlides:[],
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','4','--require-native-table-slide','5','--require-native-table-slide','6'],
 fontPolicy:{basis:'reference',families:['Arial','Times New Roman','Calibri','Garamond','TradeGothic'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},
 verifyArtifactToolImport:true,
 receiptPath:path.join(root,'.sih_build/final-validation-v3.json')
});
console.log(JSON.stringify(result));
const p=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<6;i++){
 const data=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});
 await fs.writeFile(path.join(root,`.sih_build/final-${i+1}.png`),new Uint8Array(await data.arrayBuffer()));
}
console.log('Final deck reimported and all slides rendered.');
process.exit(0);
