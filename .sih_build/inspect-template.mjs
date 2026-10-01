import fs from 'node:fs/promises';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';
const p = await PresentationFile.importPptx(await FileBlob.load('C:/Users/sushm/Downloads/SIH2026-IDEA-Presentation-Format.pptx'));
await fs.writeFile('template-inspect.ndjson',(await p.inspect({kind:'slide,textbox,shape,image,layout',maxChars:100000})).ndjson);
await fs.writeFile('template-proto.json',JSON.stringify(p.toProto(),null,2));
for (let i=0; i<p.slides.items.length;i++) {
 const s=p.slides.items[i];
 await fs.writeFile(`template-${i+1}.png`,new Uint8Array(await (await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
}
console.log('Template rendered:',p.slides.items.length);
