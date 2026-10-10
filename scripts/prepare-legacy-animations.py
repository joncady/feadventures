"""Normalize the archived 200x492 ten-row sheets into exact 50px frames."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
assets=root/'public/assets'
metadata=json.loads((root/'docs/asset-sources.json').read_text())
for name in ['chrom','lucina','frederick','enemy1','enemy2','enemy3','enemy4','enemy5']:
    image=Image.open(assets/(name+'.png')).convert('RGBA')
    atlas=Image.new('RGBA',(200,500))
    for row in range(10):
        top=round(row*image.height/10);bottom=round((row+1)*image.height/10)
        atlas.paste(image.crop((0,top,200,bottom)).resize((200,50),Image.Resampling.NEAREST),(0,row*50))
    atlas.save(assets/(name+'-animated.png'))
    metadata[name+'-animated.png']={'original':name+'.png','processing':'Ten exact rows normalized from rounded 49.2px row boundaries to 50px. Idle/action/cardinal/diagonal frames retained. Original assets unchanged.'}
(root/'docs/asset-sources.json').write_text(json.dumps(metadata,indent=2)+'\n')
