"""Focused neighbor-correct source-tile tests; no runtime assets are modified."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,shutil
P=Path(__file__).resolve().parent;R=P.parents[2]
for name in ['coastal-landing','grimleal-ruins']:
 for view in ['desktop','phone','full','routes']:
  src=P/f'{name}-{view}.png';dst=P/f'{name}-rev3-{view}.png'
  if src.exists() and not dst.exists():shutil.copyfile(src,dst)
S=Image.open(R/'asset-library/map-candidates/compact/stronghold-tileset.png').convert('RGB');F=Image.open(R/'asset-library/map-candidates/compact/fort-tileset.png').convert('RGB')
# Keys are terrain at the tile's four CORNERS: TL, TR, BL, BR. 1=grass/land.
stone={'1000':(112,256),'0100':(128,256),'0010':(112,272),'0001':(128,272),'0111':(112,288),'1011':(128,288),'1101':(112,304),'1110':(128,304),'1100':(112,320),'0011':(112,336),'1010':(144,320),'0101':(160,320)}
path={'1000':(128,96),'0100':(144,96),'0010':(128,112),'0001':(144,112),'0111':(176,112),'1011':(160,112),'1101':(176,96),'1110':(160,96),'1100':(256,128),'0011':(256,144),'1010':(224,144),'0101':(240,144)}
# Shore is deliberately restricted to supported sloping banks, NOT a complete autotile kit.
shore={'0111':(352,320),'1011':(368,320),'1101':(352,336),'1110':(368,336),'0001':(416,320),'0010':(432,320),'0100':(480,304),'1000':(496,304),'1100':(448,304),'0011':(448,320)}
records=[]
def crop(im,xy):x,y=xy;return im.crop((x,y,x+16,y+16))
def build(kind):
 w,h=12,8;out=Image.new('RGB',(w*16,h*16));before=out.copy();sheet=F if kind=='path' else S;lookup=path if kind=='path' else shore if kind=='shore' else stone
 def land(x,y):
  if kind=='shore':return x>=abs(y-4)+3
  if kind=='path':return not(3<=y<=5 or (7<=x<=9 and 1<=y<=5))
  # Grass intrusion creates a real concave corner instead of a rectangular slab.
  return not(2<=x<=10 and 1<=y<=7 and not(x<5 and y>4))
 missing=[]
 for y in range(h):
  for x in range(w):
   sig=''.join(str(int(land(a,b)))for a,b in [(x,y),(x+1,y),(x,y+1),(x+1,y+1)])
   grass=crop(F,(64+(x//3%2)*16,80)) if kind=='path' else crop(S,(352+(x//3%2)*16,176))
   floor=crop(F,(224+(x//3%2)*16,128)) if kind=='path' else crop(S,(368,272)) if kind=='shore' else crop(S,[(16,272),(32,272),(48,272),(64,272)][(x//3+y//2)%4])
   if kind=='stone':
    floor=Image.new('RGB',(16,16));center=S.crop((164,52,172,60))
    for yy in [0,8]:
     for xx in [0,8]:floor.paste(center,(xx,yy))
   if kind=='path':
    # Narrow-path source has grass fringes. Use its two genuine center strips,
    # retaining native source pixels rather than repeating the fringe as interior.
    floor=Image.new('RGB',(16,16))
    for half,xx in enumerate([228,244]):floor.paste(F.crop((xx,128,xx+8,144)),(half*8,0))
   # Before: binary rectangle-like hard change using the original repeated materials.
   before.paste(grass if land(x,y) else floor,(x*16,y*16))
   if sig=='1111':art=grass
   elif sig=='0000':art=floor
   elif sig in lookup:
    xy=lookup[sig];art=crop(sheet,xy);records.append({'proof':kind,'corners':sig,'source':'fort-tileset.png' if kind=='path' else 'stronghold-tileset.png','rect':[xy[0],xy[1],xy[0]+16,xy[1]+16]})
   else:missing.append(sig);art=grass if land(x,y) else floor
   out.paste(art,(x*16,y*16))
 return before.resize((384,256),Image.Resampling.NEAREST),out.resize((384,256),Image.Resampling.NEAREST),sorted(set(missing))
font=ImageFont.truetype(str(R/'public/assets/FE.otf'),18);board=Image.new('RGB',(816,948),'#132d33');d=ImageDraw.Draw(board)
for j,(kind,title)in enumerate([('stone','Grass / stone · concave court'),('path','Grass / path · joined bend'),('shore','Natural bank · supported sloping inlet')]):
 before,after,missing=build(kind);y=j*316;d.text((16,y+8),title,fill='#eee3be',font=font);d.text((16,y+34),'Before: hard boundary',fill='#a6bbb5',font=font);d.text((416,y+34),'After: source edge/corner tiles',fill='#a6bbb5',font=font);board.paste(before,(16,y+58));board.paste(after,(416,y+58));before.save(P/f'transition-{kind}-before.png');after.save(P/f'transition-{kind}-after.png');print(kind,'unsupported masks',missing)
board.save(P/'transition-proofs.png');(P/'transition-source-crops.json').write_text(json.dumps(records,indent=2))
