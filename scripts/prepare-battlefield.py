"""Compact siege courtyard. FE8 castle tiles by N426, plains by WAve.
See asset-library/map-candidates/*credits.txt. Source pixels stay at 2x scale.
Destructible walls are runtime sprites so breached defenses disappear.
"""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
source=Image.open(root/'asset-library/map-candidates/plains-preview-map.png').convert('RGB')
castle=Image.open(root/'asset-library/map-candidates/castle-palette.png').convert('RGB')
canvas=Image.new('RGB',(640,448))
grass=source.crop((64,80,80,96));road=source.crop((64,112,80,128))
floor=castle.crop((128,224,144,240))
for y in range(0,448,16):
 for x in range(0,640,16):canvas.paste(grass,(x,y))
for y in range(208,240,16):
 for x in range(0,640,16):canvas.paste(road,(x,y))
for x in range(304,336,16):
 for y in range(0,448,16):canvas.paste(road,(x,y))
for y in range(128,320,16):
 for x in range(192,448,16):canvas.paste(floor,(x,y))
canvas.save(root/'public/assets/battlefield.png')
castle.crop((320,176,336,192)).resize((32,32),Image.Resampling.NEAREST).save(root/'public/assets/siege-wall.png')
