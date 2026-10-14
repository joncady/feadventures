"""Normalize verified original Yen'fay Swordmaster and Aversa Dark Flier source blocks."""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parent.parent
entries=[('yenfay',"Yen'fay",'63524',0,'63397'),('aversa','Aversa','63501',2560,'63358')]
source_dir=root/'asset-library/awakening/commanders';out=root/'public/assets';proof=Image.new('RGBA',(520,850),(32,43,45,255))
meta=json.loads((root/'docs/asset-sources.json').read_text());sources=json.loads((source_dir/'sources.json').read_text())
for index,(key,name,map_id,y,portrait_id) in enumerate(entries):
 im=Image.open(source_dir/(map_id+'.png')).convert('RGBA');atlas=Image.new('RGBA',(200,500))
 for row in range(10):
  for col in range(4):
   source_row=0 if key=='aversa' and row==1 else row
   tile=im.crop((col*32,y+source_row*32,(col+1)*32,y+(source_row+1)*32));tile.putdata([(r,g,b,0 if (r,g,b)==(255,0,255) else a) for r,g,b,a in tile.getdata()]);atlas.paste(tile.resize((50,50),Image.Resampling.NEAREST),(col*50,row*50))
 atlas.save(out/(key+'-animated.png'));crop=(2,298,256,554);portrait=Image.open(source_dir/(portrait_id+'.png')).convert('RGBA').crop(crop);portrait.save(out/(key+'Portrait.png'));proof.alpha_composite(atlas,(index*260,0));proof.alpha_composite(portrait,(index*260,550))
 for id,kind in [(map_id,'map'),(portrait_id,'portrait')]:
  entry={'character':name,'kind':kind,'file':'asset-library/awakening/commanders/'+id+'.png','source':'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/'+id+'/','uploader':'Ploaj','sha256':hashlib.sha256((source_dir/(id+'.png')).read_bytes()).hexdigest(),'status':'Genuine source acquired via site download and visually inspected; normalized runtime asset registered'}
  sources=[s for s in sources if s['file']!=entry['file']];sources.append(entry)
 meta[key+'-animated.png']={'source':'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/'+map_id+'/','uploader':'Ploaj','origin':[0,y],'sourceFrame':[32,32],'outputFrame':[50,50],'processing':'Exact red palette ten rows, magenta-only transparency, no movement flipping; '+('Dark Flier flying block. Source action is a physical weapon swing, so idle frames reused for tome casting.' if key=='aversa' else 'Swordmaster block.')}
 meta[key+'Portrait.png']={'source':'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/'+portrait_id+'/','uploader':'Ploaj','crop':list(crop)}
(root/'docs/playtests/expanded-commanders').mkdir(parents=True,exist_ok=True);proof.save(root/'docs/playtests/expanded-commanders/normalized-proof.png');(source_dir/'sources.json').write_text(json.dumps(sources,indent=2)+'\n');(root/'docs/asset-sources.json').write_text(json.dumps(meta,indent=2)+'\n')
