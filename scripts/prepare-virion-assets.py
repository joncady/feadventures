"""Reproduce extracted assets: python prepare-virion-assets.py MAP_PNG PORTRAIT_PNG (requires Pillow)."""
import sys
from pathlib import Path
from PIL import Image
output = Path(__file__).resolve().parent.parent / 'public' / 'assets'
source = Image.open(sys.argv[1]).convert('RGBA')
assert source.size == (384, 4608)
sheet = source.crop((128, 0, 256, 320))
sheet.putdata([(r, g, b, 0) if (r, g, b) == (255, 0, 255) else (r, g, b, a) for r, g, b, a in sheet.getdata()])
atlas = Image.new('RGBA', (200, 500))
for row in range(10):
    for column in range(4):
        tile = sheet.crop((column * 32, row * 32, (column + 1) * 32, (row + 1) * 32))
        atlas.paste(tile.resize((50, 50), Image.Resampling.NEAREST), (column * 50, row * 50))
atlas.save(output / 'virion.png')
portrait = Image.open(sys.argv[2]).convert('RGBA')
assert portrait.size == (1292, 756)
portrait.crop((2, 330, 256, 584)).save(output / 'virionPortrait.png')
