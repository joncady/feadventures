"""Normalize exact named Awakening red-palette sheets; no generated artwork."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
sources=root/'asset-library/awakening/commanders'; assets=root/'public/assets'
meta_path=root/'docs/asset-sources.json';meta=json.loads(meta_path.read_text())
entries=[('gangrel','63479',0,'63343',(2,330,256,586)),('walhart','64151',1024,'63395',(2,298,256,554)),('validar','63603',0,'63393',(2,282,256,538))]
proof=Image.new('RGBA',(800,1500),(32,43,45,255))
for index,(key,map_id,y,portrait_id,crop) in enumerate(entries):
 source=Image.open(sources/(map_id+'.png')).convert('RGBA');atlas=Image.new('RGBA',(200,500))
 for row in range(10):
  for col in range(4):
   source_row=0 if key=='validar' and row==1 else row
   tile=source.crop((col*32,y+source_row*32,(col+1)*32,y+(source_row+1)*32))
   tile.putdata([(r,g,b,0 if (r,g,b)==(255,0,255) else a) for r,g,b,a in tile.getdata()])
   atlas.paste(tile.resize((50,50),Image.Resampling.NEAREST),(col*50,row*50))
 atlas.save(assets/(key+'-animated.png'))
 bust=Image.open(sources/(portrait_id+'.png')).convert('RGBA').crop(crop);bust.save(assets/(key+'Portrait.png'))
 proof.alpha_composite(atlas,(index*260,0));proof.alpha_composite(bust,(index*260,550))
 meta[key+'-animated.png']={'source':f'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/{map_id}/','uploader':'Ploaj','origin':[0,y],'sourceFrame':[32,32],'outputFrame':[50,50],'processing':'Red palette, exact magenta transparency; ten unflipped idle/action/cardinal/diagonal rows. Walhart uses mounted armored Conqueror block at y1024. Validar source action row contains shadows only; idle artwork reused during telegraphed cast instead of invisible action.'}
 meta[key+'Portrait.png']={'source':f'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/{portrait_id}/','uploader':'Ploaj','crop':list(crop)}
proof.save(root/'docs/playtests/commander-assets/normalized-proof.png');meta_path.write_text(json.dumps(meta,indent=2)+'\n')
