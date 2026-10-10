import type { Hero } from './config';
import type { TerrainRect } from '../systems/navigation';
import type { Point } from '../systems/rules';
export const BATTLEFIELD = {
  width:1792,height:1088,
  terrain:[[580,170,96,144],[1120,710,96,144],[720,750,192,128],[1000,130,192,128]] as readonly TerrainRect[],
  camps:[
    {name:'Northwest',x:220,y:480,units:['soldier','soldier','archer','mage']},
    {name:'Northeast',x:1510,y:480,units:['knight','knight','archer','mage']},
    {name:'Southwest',x:220,y:900,units:['axeman','axeman','assassin','mage']},
    {name:'Southeast',x:1510,y:900,units:['heavy','soldier','archer','mage']},
  ],
  soldiers:[{x:380,y:490},{x:1370,y:490},{x:380,y:780},{x:1370,y:780}],
};
export function defaultDeployment(party:readonly Hero[]):Partial<Record<Hero,Point>> {
 return Object.fromEntries(party.map((hero,i)=>[hero,{x:800+(i%2)*140,y:450+Math.floor(i/2)*140}]));
}
