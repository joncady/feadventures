"""Compose authored ten-chapter additions from credited source pixels only.
Shared geometry: src/game/data/expansion-layouts.ts. Credits and source URLs:
asset-library/map-candidates/compact/sources.json and plains-credits.txt.
"""
from pathlib import Path
import json
from PIL import Image

root=Path(__file__).resolve().parent.parent
out=root/'public/assets/maps';out.mkdir(exist_ok=True)
manifest=(root/'src/game/data/expansion-layouts.ts').read_text().split('EXPANSION_LAYOUTS = ',1)[1].split(' as const',1)[0]
layouts=json.loads(manifest)
plains=Image.open(root/'asset-library/map-candidates/plains-preview-map.png').convert('RGB')
fort=Image.open(root/'asset-library/map-candidates/compact/fort-tileset.png').convert('RGB')
strong=Image.open(root/'asset-library/map-candidates/compact/stronghold-tileset.png').convert('RGB')
grass=plains.crop((64,80,80,96));road=plains.crop((64,112,80,128));water=plains.crop((80,32,96,48))
forest=fort.crop((0,112,64,176));house=fort.crop((400,64,448,112))
floor=strong.crop((0,272,16,288));wall=strong.crop((16,144,32,160));carpet=strong.crop((64,48,80,64))
def fill(canvas,tile,rect):
 x,y,w,h=rect
 for ty in range(y,y+h,tile.height):
  for tx in range(x,x+w,tile.width):
   canvas.paste(tile.crop((0,0,min(tile.width,x+w-tx),min(tile.height,y+h-ty))),(tx,ty))
for layout in layouts:
 stone=layout['style']=='stone'
 canvas=Image.new('RGB',(layout['width']//2,layout['height']//2))
 fill(canvas,floor if stone else grass,[0,0,canvas.width,canvas.height])
 for rect in layout['roads']:fill(canvas,road,[v//2 for v in rect])
 for rect in layout['carpet']:fill(canvas,carpet,[v//2 for v in rect])
 for chunk in layout['chunks']:
  px=chunk['position']['x'];py=chunk['position']['y']
  for x,y,w,h in chunk['terrain']:
   fill(canvas,wall if stone else water if layout['style']=='landing' else forest,[(px+x)//2,(py+y)//2,w//2,h//2])
 # House source pixels overwrite precisely the same blocked footprint.
 for x,y,w,h in layout['houses']:canvas.paste(house.resize((w//2,h//2),Image.Resampling.NEAREST),(x//2,y//2))
 if layout['throne']:
  x,y=layout['throne'];canvas.paste(strong.crop((32,0,48,32)),(x//2,y//2))
 full=canvas.resize((layout['width'],layout['height']),Image.Resampling.NEAREST)
 full.save(out/(layout['id']+'.png'))
 for chunk in layout['chunks']:
  x=chunk['position']['x'];y=chunk['position']['y'];_,_,w,h=chunk['sourceRect']
  full.crop((x,y,x+w,y+h)).save(root/chunk['source'])
 print(layout['id'],full.size)
