"""Compose an open 1792×1088 world at the existing 2× pixel scale.
Ground/roads/trees: FE8 Plains with Big Bridges by WAve (see saved credits).
Forts: the project's original map2.png. Terrain bounds live in battlefield.ts.
"""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
legacy=Image.open(root/'public/assets/map2.png').convert('RGB')
source=Image.open(root/'asset-library/map-candidates/plains-preview-map.png').convert('RGB')
canvas=Image.new('RGB',(896,544))
grass=source.crop((64,80,80,96))
road=source.crop((64,112,80,128))
forest=source.crop((0,128,16,144))
for y in range(0,544,16):
 for x in range(0,896,16):canvas.paste(grass,(x,y))
for y in [232,448]:
 for x in range(0,896,16):canvas.paste(road,(x,y))
for x in [104,752]:
 for y in range(0,544,16):canvas.paste(road,(x,y))
fort=legacy.crop((8,14,56,86))
for x,y in [(290,85),(560,355)]:canvas.paste(fort,(x,y))
for ox,oy in [(360,375),(500,65)]:
 for y in range(0,64,16):
  for x in range(0,96,16):canvas.paste(forest,(ox+x,oy+y))
canvas.save(root/'public/assets/battlefield.png')
