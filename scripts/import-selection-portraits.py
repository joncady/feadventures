"""Extract genuine selected expressions, preserving source pixels and customization hair."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
meta_path=root/'docs/asset-sources.json';meta=json.loads(meta_path.read_text())
# Alert or smiling expressions verified against the original five-column portrait sheets.
columns={'morgan':1,'robin':1,'robin-female':1,'cordelia':1,'lissa':2,'lonqu':1,'miriel':1,'ricken':1,'stahl':1,'sully':1,'tharja':1,'vaike':2}
for c in json.loads((root/'docs/character-imports.json').read_text()):
 key=c['key'];p=Image.open(root/'asset-library/awakening'/(c['portrait']+'.png')).convert('RGBA');x,y,w,h=c['portraitCrop'];col=columns[key]
 sx=x+col*258
 crop=(sx,y,sx+(w-x),h);bust=p.crop(crop)
 if 'portraitOverlay' in c:bust.alpha_composite(p.crop(c['portraitOverlay']))
 if key=='robin-female':
  # Remove the source sheet's blue cell divider, retaining transparent portrait pixels.
  bust.putdata([(r,g,b,0 if (r,g,b)==(102,128,230) else a) for r,g,b,a in bust.getdata()])
 name=key+'PortraitSelected.png';bust.save(root/'public/assets'/name)
 meta[name]={'source':f"https://www.spriters-resource.com/3ds/fireemblemawakening/asset/{c['portrait']}/",'uploader':'Ploaj','crop':list(crop),'overlay':c.get('portraitOverlay'),'purpose':'Genuine selected expression; no expression painting'}
for key,sheet,box in [('sumia','63390',(260,298,514,552)),('virion','63394',(260,330,514,584))]:
 name=key+'PortraitSelected.png';Image.open(root/'asset-library/awakening'/(sheet+'.png')).convert('RGBA').crop(box).save(root/'public/assets'/name)
 meta[name]={'source':f'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/{sheet}/','uploader':'Ploaj','crop':list(box),'purpose':'Genuine selected speaking expression'}
# World goal standard uses the same credited Stronghold source tiles as Black Keep.
p=Image.open(root/'asset-library/map-candidates/compact/stronghold-tileset.png').convert('RGBA');p.crop((272,32,296,64)).save(root/'public/assets/maps/objective-standard.png')
meta['maps/objective-standard.png']={'source':meta['maps/black-keep.png'].get('source','https://feuniverse.us/t/updated-stronghold-tileset/6134') if 'maps/black-keep.png' in meta else 'https://feuniverse.us/t/updated-stronghold-tileset/6134','sourceFile':'asset-library/map-candidates/compact/stronghold-tileset.png','crop':[272,32,296,64],'purpose':'Gold/red objective standard, separate from equipment symbols','credits':'ZoramineFae / N426 / Flasuban / Wan; existing map source credits'}
meta_path.write_text(json.dumps(meta,indent=2)+'\n')
