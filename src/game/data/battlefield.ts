import type { Hero } from './config';
import type { TerrainRect } from '../systems/navigation';
import type { Point } from '../systems/rules';
export const BATTLEFIELD = {
  width:1280,height:896,
  soldierCount:4,gridSize:64,heroCamp:{x:640,y:448,health:600},
  companionBehavior:'hold' as 'hold'|'follow',companionRadius:240,
  courtyard:{left:384,top:256,right:896,bottom:640},
  // Two defensive barricades per side leave a 128px entrance at each midpoint.
  siegeWalls:[
    {name:'North west',rect:[352,224,224,32] as TerrainRect,health:320},
    {name:'North east',rect:[704,224,224,32] as TerrainRect,health:320},
    {name:'East north',rect:[896,256,32,128] as TerrainRect,health:320},
    {name:'East south',rect:[896,512,32,128] as TerrainRect,health:320},
    {name:'South west',rect:[352,640,224,32] as TerrainRect,health:320},
    {name:'South east',rect:[704,640,224,32] as TerrainRect,health:320},
    {name:'West north',rect:[352,256,32,128] as TerrainRect,health:320},
    {name:'West south',rect:[352,512,32,128] as TerrainRect,health:320},
  ],
  terrain:[] as readonly TerrainRect[],
  camps:[
    {name:'Northwest',x:100,y:120,units:['soldier','soldier','archer','mage']},
    {name:'Northeast',x:1180,y:120,units:['knight','knight','archer','mage']},
    {name:'Southwest',x:100,y:776,units:['axeman','axeman','assassin','mage']},
    {name:'Southeast',x:1180,y:776,units:['heavy','soldier','archer','mage']},
  ],
  soldiers:[{x:416,y:288},{x:864,y:288},{x:416,y:608},{x:864,y:608},{x:544,y:288},{x:736,y:288},{x:544,y:608},{x:736,y:608}],
};
export function insideCastle(point:Point):boolean {const c=BATTLEFIELD.courtyard;return point.x>=c.left+20&&point.x<=c.right-20&&point.y>=c.top+20&&point.y<=c.bottom-20;}
export function defaultDeployment(party:readonly Hero[]):Partial<Record<Hero,Point>> {
 return Object.fromEntries(party.map((hero,i)=>[hero,{x:480+(i%2)*128,y:352+Math.floor(i/2)*192}]));
}
