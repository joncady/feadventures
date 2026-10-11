"""Compose credited source pixels only. No painted/generated replacement artwork.
WAve Plains; N426 Castle; RandomWizard Royal Great Hall; ZoramineFae/Flasuban Fort.
Sources/terms: asset-library/map-candidates/compact/sources.json + *credits.txt.
"""
from pathlib import Path
import json
from PIL import Image
root=Path(__file__).resolve().parent.parent
out=root/'public/assets/maps';out.mkdir(exist_ok=True)
plains=Image.open(root/'asset-library/map-candidates/plains-preview-map.png').convert('RGB')
fort=Image.open(root/'asset-library/map-candidates/compact/fort-tileset.png').convert('RGB')
strong=Image.open(root/'asset-library/map-candidates/compact/stronghold-tileset.png').convert('RGB')
grass=plains.crop((64,80,80,96));road=plains.crop((64,112,80,128))
def fill(canvas,tile,box):
 for y in range(box[1],box[3],16):
  for x in range(box[0],box[2],16):canvas.paste(tile,(x,y))
def base():
 c=Image.new('RGB',(640,448));fill(c,grass,(0,0,640,448));return c
# Tight east-west woodland corridor: credited source forest pixels follow the exact collision manifest.
manifest=(root/'src/game/data/east-road-chunks.ts').read_text().split('= ',1)[1].split(' as const;',1)[0]
chunks=json.loads(manifest)
c=Image.new('RGB',(640,272));fill(c,grass,(0,0,640,272));fill(c,road,(0,96,640,176))
trees=fort.crop((0,112,64,176))
for chunk in chunks:
 for tx,ty,tw,th in chunk['terrain']:
  box=((chunk['position']['x']+tx)//2,(chunk['position']['y']+ty)//2,tw//2,th//2)
  forest=Image.new('RGB',(box[2],box[3]))
  for fy in range(0,box[3],64):
   for fx in range(0,box[2],64):forest.paste(trees,(fx,fy))
  c.paste(forest,(box[0],box[1]))
road_full=c.resize((1280,544),Image.Resampling.NEAREST)
assembled=Image.new('RGB',(1280,544))
for chunk in chunks:
 x=chunk['position']['x'];y=chunk['position']['y'];_,_,w,h=chunk['sourceRect']
 pixels=road_full.crop((x,y,x+w,y+h));pixels.save(root/chunk['source']);assembled.paste(pixels,(x,y))
assembled.save(out/'east-road.png')
# Compact defended village: four close approach lanes, source houses and forest boundaries.
village=json.loads((root/'src/game/data/village-layout.ts').read_text().split('= ',1)[1].split(' as const;',1)[0])
c=Image.new('RGB',(village['width']//2,village['height']//2));fill(c,grass,(0,0,c.width,c.height))
for x,y,w,h in village['roads']:fill(c,road,(x//2,y//2,(x+w)//2,(y+h)//2))
for x,y,w,h in village['forest']:
 forest=Image.new('RGB',(w//2,h//2))
 for fy in range(0,h//2,64):
  for fx in range(0,w//2,64):forest.paste(trees,(fx,fy))
 c.paste(forest,(x//2,y//2))
house=fort.crop((400,64,448,112))
for x,y,w,h in village['houses']:c.paste(house.resize((w//2,h//2),Image.Resampling.NEAREST),(x//2,y//2))
c.resize((village['width'],village['height']),Image.Resampling.NEAREST).save(out/'village.png')
Image.open(root/'public/assets/battlefield.png').resize((1280,896),Image.Resampling.NEAREST).save(out/'castle-defense.png')
# Black Keep: compose native 16px Stronghold building blocks at 2×, never resize a whole map.
manifest=(root/'src/game/data/black-keep-chunks.ts').read_text().split('= ',1)[1].split(' as const',1)[0]
keep_chunks=json.loads(manifest)
floor=strong.crop((0,272,16,288))
brick=strong.crop((16,144,32,160))
carpet=strong.crop((64,48,80,64))
keep=Image.new('RGB',(1024,768))
for chunk in keep_chunks:
 _,_,w,h=chunk['sourceRect']; room=Image.new('RGB',(w//2,h//2))
 fill(room,floor,(0,0,w//2,h//2))
 fill(room,carpet,(224,0,288,h//2))
 for x,y,rw,rh in chunk['terrain']:fill(room,brick,(x//2,y//2,(x+rw)//2,(y+rh)//2))
 # Source trim/columns emphasize the central doorway without introducing invisible barriers.
 column=strong.crop((96,0,112,32))
 for x,y,rw,rh in chunk['terrain']:
  if rw==64 and rh==64:room.paste(column,(x//2+8,y//2))
 if chunk['id']=='throne-room':
  throne=strong.crop((32,0,48,32));room.paste(throne,(248,16))
 pixels=room.resize((w,h),Image.Resampling.NEAREST)
 pixels.save(root/chunk['source']);keep.paste(pixels,(chunk['position']['x'],chunk['position']['y']))
keep.save(out/'dark-castle.png')
# Camp is a source village/fort structure rather than locally drawn graphics.
fort.crop((400,64,448,112)).resize((64,64),Image.Resampling.NEAREST).save(out/'camp-building.png')
# Gold uses the actual Awakening inventory/system icon.
icons=Image.open(root/'public/assets/item-icons.png').convert('RGBA')
gold=icons.crop((96,176,112,192))
for y in range(16):
 for x in range(16):
  if gold.getpixel((x,y))[:3]==(255,0,255):gold.putpixel((x,y),(255,0,255,0))
gold.save(out/'gold-icon.png')

# Source flame icon on Stronghold sheet; remove only its dark background, retain source flame pixels.
flame=strong.crop((272,0,288,16)).convert('RGBA')
for y in range(16):
 for x in range(16):
  r,g,b,a=flame.getpixel((x,y))
  if not (r>g*1.12 and r>b*1.8 and r>100):flame.putpixel((x,y),(r,g,b,0))
flame.save(out/'fire-bolt.png')
