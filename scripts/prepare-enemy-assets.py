"""Extract selected red generic map-sprite blocks; gameplay class names are our loadouts."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
image=Image.open(root/'asset-library/awakening/64153.png').convert('RGBA')
metadata=json.loads((root/'docs/asset-sources.json').read_text())
for name,x,y in [('mage',0,7168),('axeman',384,1536)]:
    out=Image.new('RGBA',(200,500))
    for row in range(10):
        for col in range(4):
            tile=image.crop((x+col*32,y+row*32,x+(col+1)*32,y+(row+1)*32))
            tile.putdata([(r,g,b,0 if (r,g,b)==(255,0,255) else a) for r,g,b,a in tile.getdata()])
            out.paste(tile.resize((50,50),Image.Resampling.NEAREST),(col*50,row*50))
    file=name+'-animated.png';out.save(root/'public/assets'/file)
    metadata[file]={'source':'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/64153/','uploader':'Ploaj','originalSize':list(image.size),'origin':[x,y],'sourceFrame':[32,32],'outputFrame':[50,50],'palette':'red','processing':'Exact magenta transparency; ten rows: idle, action, left, right, down, up, down-left, down-right, up-right, up-left. Class assignment is the game loadout.'}
(root/'docs/asset-sources.json').write_text(json.dumps(metadata,indent=2)+'\n')
