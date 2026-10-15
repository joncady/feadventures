import {AUTHORED_MAP_ART} from './map-art/generated';
import type {MapDefinition} from './maps';
/** Reviewed runtime batch. Other authored profiles remain preview-only until route QA. */
const INTEGRATED = new Set<string>(['east-road','village-watch','plegian-gate','village','valm-landing','castle-defense','chonsin-pass','conqueror-hall','grimleal-approach','dark-castle']);
export function authoredMapGeometry(id:string,original:MapDefinition):Partial<MapDefinition> {
 const art=AUTHORED_MAP_ART.find(value=>value.id===id);
 if(!art||!INTEGRATED.has(id))return {};
 const a=art.anchors;
 const geometry:Partial<MapDefinition>={width:art.width,height:art.height,backgroundKey:`mission-expanded-${id}`,backgroundPath:`maps/expanded/${id}.png`,chunks:[{id:`expanded-${id}`,source:`public/assets/maps/expanded/${id}.png`,sourceRect:[0,0,art.width,art.height],position:{x:0,y:0},scale:1,terrain:art.solids,sockets:[]}],terrain:art.solids,courtyard:{left:a.deployment[0],top:a.deployment[1],right:a.deployment[2],bottom:a.deployment[3]},heroCamp:{...original.heroCamp,x:a.heroCamp[0],y:a.heroCamp[1]},objective:{...original.objective,x:a.objective[0],y:a.objective[1]},spawnEntries:a.spawnEntries.map(([x,y])=>({x,y})),camps:original.camps.map((camp,index)=>({...camp,x:a.camps[index][0],y:a.camps[index][1]})),siegeWalls:original.siegeWalls};
 if('siegeWalls' in a)geometry.siegeWalls=a.siegeWalls.map(w=>({name:w.name,rect:[...w.rect],health:w.health}));
 if('soldiers' in a)geometry.soldiers=a.soldiers.map(([x,y])=>({x,y}));
 if('advanceGates' in a)geometry.advanceGates=a.advanceGates.map(gate=>({...gate}));
 return geometry;
}
