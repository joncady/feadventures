"""Temporary generated XP tick; level-up is imported from the supplied reference."""
import math,struct,wave
from pathlib import Path
for name,duration,notes in [('xp-tick',.055,[880])]:
    rate=22050;data=[]
    for i in range(int(rate*duration)):
        t=i/rate;part=min(len(notes)-1,int(t/duration*len(notes)));local=t%(duration/len(notes));env=math.exp(-local*18)*min(1,local*250)
        data.append(int(11000*env*math.sin(2*math.pi*notes[part]*t)))
    with wave.open(str(Path('public/assets/audio')/(name+'.wav')),'w') as out:
        out.setparams((1,2,rate,0,'NONE','not compressed'));out.writeframes(struct.pack('<'+'h'*len(data),*data))
