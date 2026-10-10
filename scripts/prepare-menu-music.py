"""Original temporary quiet menu loop. Not a ripped Awakening track."""
import math,struct,wave
from pathlib import Path
rate=22050;duration=16;data=[]
chords=[(261.63,329.63,392),(220,261.63,329.63),(174.61,220,261.63),(196,246.94,293.66)]
for i in range(rate*duration):
 t=i/rate;chord=chords[int(t/4)%4];local=t%.5;note=chord[int(t/.5)%3];env=math.exp(-local*6)*min(1,local*100)
 lead=.11*env*(math.sin(2*math.pi*note*t)+.25*math.sin(4*math.pi*note*t))
 pad=.015*sum(math.sin(2*math.pi*n*t) for n in chord)*math.sin(math.pi*(t%4)/4)**2
 data.append(int(max(-1,min(1,lead+pad))*32767))
with wave.open(str(Path('public/assets/audio/menu-theme.wav')),'w') as out:
 out.setparams((1,2,rate,0,'NONE','not compressed'));out.writeframes(struct.pack('<'+'h'*len(data),*data))
