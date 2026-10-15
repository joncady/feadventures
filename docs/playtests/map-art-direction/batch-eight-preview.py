"""Independent secondary-artist previews; no runtime/shared manifest writes."""
from pathlib import Path
import json
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent/'secondary';OUT.mkdir(exist_ok=True)
ids=['east-road','village-watch','plegian-gate','village','castle-defense','chonsin-pass','conqueror-hall','dark-castle']
ledger=[]
for id in ids:
 p=ROOT/'src/game/data/map-art/chapters'/f'{id}.json'
 if not p.exists():continue
 d=json.loads(p.read_text());c=Image.new('RGB',(d['width'],d['height']))
 for n,l in enumerate(d['layers']):
  src=Image.open(ROOT/l['source']).convert('RGB');sx,sy,sw,sh=l['crop'];x,y,w,h=l['rect']
  assert sx>=0 and sy>=0 and sx+sw<=src.width and sy+sh<=src.height,(id,n,'crop')
  tile=src.crop((sx,sy,sx+sw,sy+sh)).resize((sw*2,sh*2),Image.Resampling.NEAREST)
  assert x>=0 and y>=0 and x+w<=c.width and y+h<=c.height,(id,n,'bounds')
  if l['mode']=='stamp':assert (w,h)==tile.size,(id,n,'stretch');c.paste(tile,(x,y))
  else:
   for ty in range(y,y+h,tile.height):
    for tx in range(x,x+w,tile.width):c.paste(tile.crop((0,0,min(tile.width,x+w-tx),min(tile.height,y+h-ty))),(tx,ty))
  ledger.append(dict(chapter=id,index=n,**l))
 c.save(OUT/f'{id}.png');print(id,len(d['layers']),len(d['solids']))
(OUT/'source-crop-ledger.json').write_text(json.dumps(ledger,indent=2)+'\n')
# Scale proof uses actual runtime 50px frames. This is a composition preview, not gameplay.
for id,coords,cam in [('plegian-gate',[(448,496),(400,544),(496,544),(448,576)],(0,64)),('chonsin-pass',[(416,208),(384,240),(448,240),(480,208)],(64,0))]:
 im=Image.open(OUT/f'{id}.png').convert('RGBA')
 for key,(x,y) in zip(['chrom','frederick','lissa','ricken'],coords):
  srcpath=ROOT/f'public/assets/{key}-animated.png';src=Image.open(srcpath if srcpath.exists() else ROOT/f'public/assets/{key}.png').convert('RGBA');im.alpha_composite(src.crop((0,0,50,50)),(x-25,y-40))
 for key,x,y in [('axeman',coords[0][0]+112,coords[0][1]-40),('mage',coords[0][0]+160,coords[0][1]+16)]:
  srcpath=ROOT/f'public/assets/{key}-animated.png';src=Image.open(srcpath if srcpath.exists() else ROOT/f'public/assets/{key}.png').convert('RGBA');im.alpha_composite(src.crop((0,0,50,50)),(x-25,y-40))
 x,y=cam;im.crop((x,y,x+896,y+544)).save(OUT/f'{id}-actors-camera.png')
