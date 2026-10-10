from PIL import Image
from pathlib import Path
import json,shutil,sys
root=Path('public/assets');src=Path(sys.argv[1]) # Directory containing 486162, 486149, 63519 and 63390 PNG downloads.
for n,name in [('486162','weapon-icons'),('486149','item-icons')]:shutil.copy(src/(n+'.png'),root/(name+'.png'))
# Pegasus frames are 32px wide × 35px tall, unlike the ground-unit grid.
im=Image.open(src/'63519.png').convert('RGBA');out=Image.new('RGBA',(200,550))
for row in range(10):
 for col in range(4):
  tile=im.crop((128+col*32,512+row*35,160+col*32,547+row*35))
  tile.putdata([(r,g,b,0 if (r,g,b)==(255,0,255) else a) for r,g,b,a in tile.getdata()])
  out.paste(tile.resize((50,55),Image.Resampling.NEAREST),(col*50,row*55))
out.save(root/'sumia.png')
# First neutral bust on the portrait sheet.
Image.open(src/'63390.png').crop((2,298,256,552)).save(root/'sumiaPortrait.png')
im=Image.open(src/'486162.png')
for name,col in [('sword',8),('lance',9),('axe',10),('bow',11),('tome',12)]:im.crop((col*16,0,col*16+16,16)).save(root/('weapon-'+name+'.png'))
p=Path('docs/asset-sources.json');data=json.loads(p.read_text());data.update({'weapon-icons.png':{'source':'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/486162/','uploader':'Venus_Pisces','originalSize':[256,64],'frames':'16px grid; first row sword 8, lance 9, axe 10, bow 11, tome 12; individual weapon PNGs retain transparency'},'item-icons.png':{'source':'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/486149/','uploader':'Venus_Pisces','originalSize':[256,256],'purpose':'Retained original sheet for future equipment selection'},'sumia.png':{'source':'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63519/','uploader':'Ploaj','originalSize':[384,4096],'crop':[128,512,256,862],'processing':'Blue Pegasus class block; magenta transparency; 32x35px Pegasus frames scaled to 50x55px nearest-neighbor; ten directional rows, original shadows retained'},'sumiaPortrait.png':{'source':'https://www.spriters-resource.com/3ds/fireemblemawakening/asset/63390/','uploader':'Ploaj','crop':[2,298,256,552]}});p.write_text(json.dumps(data,indent=2)+'\n')
