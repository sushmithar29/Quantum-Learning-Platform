from pathlib import Path
from io import BytesIO
from PIL import Image
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

build=Path(__file__).resolve().parent
source=build/'native-export.pdf'
reader=PdfReader(source)
writer=PdfWriter()
overlay_readers=[]
overlay_buffers=[]
for i,page in enumerate(reader.pages,1):
    if i>1:
        im=Image.open(build/f'final-{i}.png')
        buf=BytesIO()
        c=canvas.Canvas(buf,pagesize=(960,540))
        # Preserve native body text and diagrams. Restore the three template regions
        # from the verified final slide render where PowerPoint omits imported art.
        for left,top,right,bottom in [(0,0,273,178),(1540,0,1920,174),(729,1007,1248,1060)]:
            crop=im.crop((left,top,right,bottom))
            c.drawImage(ImageReader(crop),left/2,(1080-bottom)/2,width=(right-left)/2,height=(bottom-top)/2)
        c.save();buf.seek(0)
        overlay_buffers.append(buf)
        overlay_reader=PdfReader(buf)
        overlay_readers.append(overlay_reader)
        page.merge_page(overlay_reader.pages[0])
    writer.add_page(page)
with (build/'branded-export.pdf').open('wb') as f:writer.write(f)
print('Restored template branding on all content pages; native body text retained.')
