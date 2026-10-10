"""Generate distinct temporary weapon effects until source clips are auditioned."""
from pathlib import Path
import math, random, struct, wave
out = Path(__file__).resolve().parent.parent / 'public/assets/audio'
random.seed(17)
for name, duration in [('axe-impact', .30), ('lance-thrust', .18), ('fire-cast', .48)]:
    rate = 22050; samples = []; previous = 0
    for i in range(int(rate * duration)):
        t = i / rate; u = t / duration; noise = random.uniform(-1, 1)
        previous = previous * .8 + noise * .2
        if name == 'axe-impact':
            value = (.75 * previous + .25 * math.sin(2 * math.pi * (90 * t - 65 * t * t))) * math.exp(-u * 5)
        elif name == 'lance-thrust':
            value = (.35 * noise + .25 * math.sin(2 * math.pi * 1100 * t)) * math.sin(math.pi * u) ** 2 * math.exp(-u * 4)
        else:
            value = (.25 * noise + .35 * math.sin(2 * math.pi * (380 * t + 500 * t * t)) + .2 * math.sin(2 * math.pi * 760 * t)) * math.sin(math.pi * u) ** 2
        samples.append(struct.pack('<h', int(max(-1, min(1, value)) * 22000)))
    with wave.open(str(out / (name + '.wav')), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(b''.join(samples))
