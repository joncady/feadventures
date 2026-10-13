import {test,expect} from '@playwright/test';

test('deployment companions retain saved growth and equipped physical or magical power before any kill or switch',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>!(document.querySelector('#start') as HTMLButtonElement).disabled);
 const observed=await page.evaluate(async()=>{
  const {game}=await import(String('/src/main.ts'));
  const {newCampaign}=await import(String('/src/game/systems/campaign.ts'));
  const {attackPower}=await import(String('/src/game/systems/progression.ts'));
  const {equippedWeapon}=await import(String('/src/game/data/equipment.ts'));
  const {HERO_PROFILES,PLAYER_SPEED_SCALE}=await import(String('/src/game/data/config.ts'));
  const campaign=newCampaign(['chrom','frederick','miriel']);
  for(const member of campaign.members.slice(1)){
   member.progress.level=4;member.progress.stats={...member.progress.stats,hp:104,str:24,mag:22,speed:13,def:4,res:6};member.health=87;
   member.loadout.items[0].forge=2;
  }
  // Explicit preparation fixture: do not fight, level up, or switch control before observing spawn.
  game.scene.stop('Interface');game.scene.start('Arena',{hero:'chrom',companions:['frederick','miriel'],tactical:true,missionIndex:2,members:campaign.members,gold:campaign.gold});
  const scene:any=game.scene.getScene('Arena');
  return campaign.members.slice(1).map((member:any)=>{
   const ally:any=scene.allies.getChildren().find((unit:any)=>unit.getData('companionHero')===member.hero);
   const weapon=equippedWeapon(member.loadout);
   return {hero:member.hero,actual:{health:ally.getData('health'),maxHealth:ally.getData('maxHealth'),defense:ally.getData('defense'),resistance:ally.getData('resistance'),damage:ally.getData('damage'),speed:ally.getData('speed'),weapon:ally.getData('weapon')},expected:{health:87,maxHealth:104,defense:4,resistance:6,damage:attackPower(member.progress,member.hero,weapon),speed:HERO_PROFILES[member.hero].speed*PLAYER_SPEED_SCALE+6,weapon:weapon.type},kills:scene.kills,controlled:scene.hero};
  });
 });
 expect(observed.map((row:any)=>row.hero)).toEqual(['frederick','miriel']);
 for(const row of observed){expect(row.actual).toEqual(row.expected);expect(row.kills).toBe(0);expect(row.controlled).toBe('chrom');}
});
