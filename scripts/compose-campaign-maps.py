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
# Existing authored Royal Great Hall layout; original native pixels enlarged at exact 4x.
hall=Image.open(root/'asset-library/map-candidates/compact/royal-great-hall.png').convert('RGB')
c=Image.new('RGB',(640,448));floor=hall.crop((32,112,48,128));fill(c,floor,(0,0,640,448))
c.paste(hall.resize((480,320),Image.Resampling.NEAREST),(80,64))
c.resize((1280,896),Image.Resampling.NEAREST).save(out/'dark-castle.png')
# Camp is a source village/fort structure rather than locally drawn graphics.
fort.crop((400,64,448,112)).resize((64,64),Image.Resampling.NEAREST).save(out/'camp-building.png')
# Gold uses the actual Awakening inventory/system icon.
icons=Image.open(root/'public/assets/weapon-icons.png').convert('RGBA')
icons.crop((32,16,48,32)).save(out/'gold-icon.png')

# Source flame icon on Stronghold sheet; remove only its dark background, retain source flame pixels.
flame=strong.crop((272,0,288,16)).convert('RGBA')
for y in range(16):
 for x in range(16):
  r,g,b,a=flame.getpixel((x,y))
  if not (r>g*1.12 and r>b*1.8 and r>100):flame.putpixel((x,y),(r,g,b,0))
flame.save(out/'fire-bolt.png')
