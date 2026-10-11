export class VoiceGate {
  private lastAt = -Infinity;
  private rallyAt = new Map<string, number>();
  private protectedUntil = -Infinity;
  accept(hero: string, event: string, now: number, durationMs = 3000): boolean {
    if (event === 'rally') {
      if (now - (this.rallyAt.get(hero) ?? -Infinity) < 20000) return false;
      this.rallyAt.set(hero, now);
      this.protectedUntil = now + durationMs;
    } else {
      if (event !== 'death' && now < this.protectedUntil) return false;
      if (event === 'attack' && now - this.lastAt < 1200) return false;
      if (event === 'death') this.protectedUntil = -Infinity;
    }
    this.lastAt = now;
    return true;
  }
}
