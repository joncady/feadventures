"""Approved source-pixel scene composition. No actors, labels or HUD are rendered.
Geometry is independently authored in chapter JSON and validated against runtime navigation.
"""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).resolve().parent
S=Image.open(ROOT/'asset-library/map-candidates/compact/stronghold-tileset.png').convert('RGBA')
F=Image.open(ROOT/'asset-library/map-candidates/compact/fort-tileset.png').convert('RGBA')
ledger=[]
def tile(sheet,rect,name):
 ledger.append({'name':name,'source':'stronghold-tileset.png' if sheet is S else 'fort-tileset.png','rect':rect})
 return sheet.crop(rect)
grass=tile(S,(352,176,368,192),'grass');water=tile(S,(368,272,384,288),'water');floor=tile(S,(32,272,48,288),'paving center');rough=tile(S,(64,272,80,288),'weathered paving center');edge=tile(S,(432,272,448,288),'water left / quay right');wall=tile(S,(272,144,288,160),'masonry');wallcap=tile(S,(272,128,288,144),'wall cap');steps=tile(S,(240,80,288,128),'stair flight');arch=tile(S,(288,224,336,288),'arched portal');crest=tile(S,(352,16,400,64),'complete dragon floor medallion');tree=tile(F,(0,112,32,144),'tree clump');shrub=tile(S,(384,224,400,256),'complete small shrub');broken=tile(S,(128,128,144,144),'broken masonry');banner=tile(S,(256,32,288,64),'banner');rock=tile(F,(320,160,368,208),'cliff face');fence=tile(F,(400,112,448,128),'fence');house=tile(F,(400,64,448,112),'roofed house')
def paste(im,art,x,y):im.alpha_composite(art,(x,y))
def fill(im,art,rect):
 x,y,w,h=rect
 for yy in range(y,y+h,art.height):
  for xx in range(x,x+w,art.width):paste(im,art,xx,yy)
# Whole authored architectural chunks preserve their original edge/corner logic.
M=Image.open(ROOT/'asset-library/map-candidates/compact/castle-moat.png').convert('RGBA')
H=Image.open(ROOT/'asset-library/map-candidates/compact/royal-great-hall.png').convert('RGBA')
ledger.extend([{'name':'complete gatehouse frontage','source':'castle-moat.png','rect':[48,64,240,144]},{'name':'complete ruined wall corner','source':'royal-great-hall.png','rect':[0,48,80,128]},{'name':'quiet blue floor','source':'royal-great-hall.png','rect':[16,96,32,112]}])
quiet=tile(S,(164,52,172,60),'quiet stone interior, bevel excluded');sand=Image.open(ROOT/'asset-library/map-candidates/plains-preview-map.png').convert('RGBA').crop((64,112,80,128));ledger.append({'name':'beach sand','source':'plains-preview-map.png','rect':[64,112,80,128]})
# Validated four-corner tile families. Diagonal checkerboards are deliberately rejected.
STONE={'1000':(112,256),'0100':(128,256),'0010':(112,272),'0001':(128,272),'0111':(112,288),'1011':(128,288),'1101':(112,304),'1110':(128,304),'1100':(112,320),'0011':(112,336),'1010':(144,320),'0101':(160,320)}
PATH={'1000':(128,96),'0100':(144,96),'0010':(128,112),'0001':(144,112),'0111':(176,112),'1011':(160,112),'1101':(176,96),'1110':(160,96),'1100':(256,128),'0011':(256,144),'1010':(224,144),'0101':(240,144)}
PATH_CENTER=tile(F,(228,128,236,144),'grass-free path center strip')
SHORE={'0111':(352,320),'1011':(368,320),'1101':(352,336),'1110':(368,336),'0001':(416,320),'0010':(432,320),'0100':(480,304),'1000':(496,304),'1100':(448,304),'0011':(448,320)}
def terrain(im,kind,node):
 sheet=F if kind=='path' else S;lookup=PATH if kind=='path' else STONE if kind=='stone' else SHORE
 for y in range(im.height//16):
  for x in range(im.width//16):
   sig=''.join(str(int(node(a,b))) for a,b in [(x,y),(x+1,y),(x,y+1),(x+1,y+1)])
   if sig=='1111':
    if kind!='shore':continue
    # Coherent grass regions, not per-tile random noise.
    art=S.crop((352+16*((x//4+y//3)%2),176,368+16*((x//4+y//3)%2),192))
   elif sig=='0000':
    art=water if kind=='shore' else quiet if kind=='stone' else PATH_CENTER
   else:
    if sig not in lookup:raise ValueError(f'Unsupported {kind} corner pattern {sig} at {x},{y}')
    xx,yy=lookup[sig];art=sheet.crop((xx,yy,xx+16,yy+16));ledger.append({'name':kind+' boundary '+sig,'source':'fort-tileset.png' if sheet is F else 'stronghold-tileset.png','rect':[xx,yy,xx+16,yy+16]})
   fill(im,art,(x*16,y*16,16,16))
def build_coast():
 im=Image.new('RGBA',(640,384));N=Image.open(ROOT/'asset-library/map-candidates/castle-palette.png').convert('RGBA');sea=N.crop((336,80,368,112));ledger.append({'name':'matching N426 cyan open water block','source':'castle-palette.png','rect':[336,80,368,112]});fill(im,grass,(0,0,640,384));fill(im,sea,(0,0,192,384))
 # One authored quay family: vertical retaining wall matches the complete source map.
 for y in range(0,384,16):paste(im,M.crop((32,64,48,80)),176,y)
 # Keep the authored gate/moat/bridge district together, including matched corner geometry.
 # Its 8px water margin aligns the original wall exactly with the continuation at x176.
 paste(im,M.crop((24,0,240,160)),168,64);ledger.extend([{'name':'complete coastal gate district','source':'castle-moat.png','rect':[24,0,240,160]},{'name':'quay retaining wall continuation','source':'castle-moat.png','rect':[32,64,48,80]}])
 # The original wooden bridge now lands on a connected winding approach.
 terrain(im,'path',lambda x,y:not(14<=x<=17 and 13<=y<=21 or 14<=x<=32 and 18<=y<=21 or 28<=x<=31 and 12<=y<=19))
 # A compact staging square at the landing, edged by the validated stone family.
 terrain(im,'stone',lambda x,y:not(13<=x<=19 and 15<=y<=18 or 25<=x<=32 and 9<=y<=14))
 # A single guard-muster yard fills the upper-right, below the minimap.
 # One hut, a railing-defined frontage and two planted beds share a connected spur.
 N=Image.open(ROOT/'asset-library/map-candidates/castle-palette.png').convert('RGBA')
 paste(im,house,416,144)
 rail=N.crop((0,128,64,144));ledger.append({'name':'muster yard ornamental railing','source':'castle-palette.png','rect':[0,128,64,144]})
 paste(im,rail.crop((0,0,48,16)),400,224);paste(im,rail.crop((48,0,64,16)),496,224)
 for xx,yy in [(528,160),(528,192),(384,160)]:paste(im,shrub,xx,yy)
 for x,y in [(432,64),(480,80),(560,160),(528,256),(432,304),(592,288)]:paste(im,tree,x,y)
 # A field hospital / waypoint cluster uses a single existing tent/camp asset later at world scale.
 return im,[{'name':'Authored gate / bridge district','rect':[192,128,160,96]},{'name':'Landing staging square','rect':[208,240,96,48]},{'name':'Town approach','rect':[224,288,288,48]}]
def bastion_base(collapsed=False):
 # Low, complete ruined gatehouse / bastion BASES, not arbitrary tall column stacks.
 B=Image.open(ROOT/'asset-library/map-candidates/compact/barons-castle.png').convert('RGBA')
 a=Image.new('RGBA',(80,80));fill(a,quiet,(0,0,80,32))
 # Plain continuous rear parapet, with true corner blocks rather than pillar capitals.
 fill(a,M.crop((112,64,128,80)),(0,0,80,16))
 paste(a,B.crop((0,0,16,16)),0,0);paste(a,B.crop((96,0,112,16)),64,0)
 paste(a,B.crop((0,16,16,32)),0,16);paste(a,B.crop((96,16,112,32)),64,16)
 if not collapsed:
  paste(a,M.crop((112,64,192,112)),0,32)
 else:
  paste(a,S.crop((0,128,80,160)),0,32);paste(a,S.crop((0,144,80,160)),0,64)
  paste(a,broken,0,0);paste(a,broken,16,64)
 ledger.extend([{'name':'continuous bastion rear cap','source':'castle-moat.png','rect':[112,64,128,80]},{'name':'bastion roof left side','source':'barons-castle.png','rect':[0,16,16,32]},{'name':'bastion roof right side','source':'barons-castle.png','rect':[96,16,112,32]},{'name':'intact bastion front depth','source':'castle-moat.png','rect':[112,64,192,112]},{'name':'collapsed bastion masonry','source':'stronghold-tileset.png','rect':[0,128,80,160]}])
 return a
def build_ruins():
 im=Image.new('RGBA',(512,384))
 for yy in range(24):
  for xx in range(32):
   gx=352+16*((xx//4+yy//3)%2);paste(im,S.crop((gx,176,gx+16,192)),xx*16,yy*16)
 # A dry, single sanctuary court and attached collapsed west wing. No decorative pool.
 terrain(im,'stone',lambda x,y:not(8<=x<=25 and 6<=y<=21 or 6<=x<=12 and 8<=y<=17 or 20<=x<=27 and 15<=y<=22))
 masonry=S.crop((256,64,272,80));cap=S.crop((272,112,304,128))
 fill(im,masonry,(144,104,176,64));fill(im,cap,(144,96,176,16));fill(im,cap,(144,168,176,16))
 # Wing connects physically to the facade; a complete column anchors its back corner.
 fill(im,masonry,(112,144,32,48));paste(im,tile(S,(160,16,176,64),'complete west-wing column'),112,96)
 paste(im,cap,112,176)
 for x,y in [(112,192),(128,192)]:paste(im,broken,x,y)
 for x,y in [(96,176),(96,192),(96,208)]:paste(im,shrub,x,y)
 # One intentional breach, bounded by actual broken source pieces.
 fill(im,quiet,(144,96,32,88));paste(im,broken,160,96);paste(im,broken,160,176)
 guardian1=tile(S,(400,64,432,112),'gray carved guardian relief A');guardian2=tile(S,(432,64,464,112),'gray carved guardian relief B');base=tile(S,(272,112,304,128),'guardian stone foundation')
 for x,art in [(176,guardian1),(272,guardian2)]:paste(im,art,x,112);paste(im,base,x,160)
 paste(im,crest,208,184)
 # Two flanking ruins frame the lower approach with a generous central opening.
 aged=tile(S,(96,240,144,288),'coherent moss / broken-paving footprint')
 paste(im,aged,144,296);paste(im,aged,336,296)
 paste(im,bastion_base(False),144,248);paste(im,bastion_base(True),336,248)
 for xx,yy in [(352,320),(368,328),(384,320)]:paste(im,broken,xx,yy)
 for xx,yy in [(416,288),(416,304)]:paste(im,shrub,xx,yy)

 # Vegetation is grouped against the collapsed wing and outer court, not scattered inside.
 for x,y in [(32,96),(32,144),(432,48),(448,96),(432,304),(32,304)]:paste(im,tree,x,y)
 for x,y in [(400,272),(416,288),(400,304)]:paste(im,shrub,x,y)
 ledger.append({'name':'attached shrine / wing masonry','source':'stronghold-tileset.png','rect':[256,64,272,80]})
 return im,[{'name':'Proposed shrine breach','rect':[144,104,32,64]},{'name':'Central gap 224px (proposed)','rect':[224,248,112,80]},{'name':'Ritual front plaza','rect':[176,184,128,48]}]
