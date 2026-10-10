"""Extract the verified roster in docs/character-imports.json; requires Pillow.
Usage: python scripts/import-characters.py [directory of original numbered PNGs]
Default originals: asset-library/awakening. No network requests are performed.
"""
import json, sys
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'asset-library' / 'awakening'
assets = root / 'public' / 'assets'
metadata_path = root / 'docs' / 'asset-sources.json'
metadata = json.loads(metadata_path.read_text())
for character in json.loads((root / 'docs' / 'character-imports.json').read_text()):
    key = character['key']
    image = Image.open(source / (character['map'] + '.png')).convert('RGBA')
    x, y = character['origin']; width, height = character['sourceFrame']
    fw, fh = character['outputFrame']
    assert image.width >= x + width * 4 and image.height >= y + height * 10
    atlas = Image.new('RGBA', (fw * 4, fh * 10))
    for row in range(10):
        for col in range(4):
            tile = image.crop((x + col * width, y + row * height, x + (col + 1) * width, y + (row + 1) * height))
            tile.putdata([(r,g,b,0 if (r,g,b)==(255,0,255) else a) for r,g,b,a in tile.getdata()])
            atlas.paste(tile.resize((fw, fh), Image.Resampling.NEAREST), (col * fw, row * fh))
    atlas.save(assets / (key + '.png'))
    portrait = Image.open(source / (character['portrait'] + '.png')).convert('RGBA')
    bust = portrait.crop(character['portraitCrop'])
    if 'portraitOverlay' in character:
        bust.alpha_composite(portrait.crop(character['portraitOverlay']))
    bust.save(assets / (key + 'Portrait.png'))
    metadata[key + '.png'] = dict(source=f"https://www.spriters-resource.com/3ds/fireemblemawakening/asset/{character['map']}/", uploader='Ploaj', originalSize=list(image.size), origin=[x,y], sourceFrame=[width,height], outputFrame=[fw,fh], processing='Blue palette, exact magenta transparency; ten rows: idle, action, left, right, down, up, down-right, down-left, up-right, up-left')
    metadata[key + 'Portrait.png'] = dict(source=f"https://www.spriters-resource.com/3ds/fireemblemawakening/asset/{character['portrait']}/", uploader='Ploaj', crop=character['portraitCrop'], overlay=character.get('portraitOverlay'))
metadata_path.write_text(json.dumps(metadata,indent=2)+'\n')
