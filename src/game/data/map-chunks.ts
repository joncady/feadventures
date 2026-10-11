import type {TerrainRect} from '../systems/navigation';
import type {Point} from '../systems/rules';
/** An authored room/route. Pixel crops use existing, credited artwork; no generated art. */
export interface MapChunk {id:string; source:string; sourceRect:readonly[number,number,number,number]; position:Point; scale:number; terrain:readonly TerrainRect[]; sockets:readonly {id:string;side:'north'|'east'|'south'|'west';position:Point}[];}
export interface ChunkLayout {width:number;height:number;chunks:readonly MapChunk[];}
export function assembleTerrain(layout:ChunkLayout):TerrainRect[]{return layout.chunks.flatMap(chunk=>chunk.terrain.map(([x,y,w,h])=>[chunk.position.x+x*chunk.scale,chunk.position.y+y*chunk.scale,w*chunk.scale,h*chunk.scale] as TerrainRect));}
export function validateLayout(layout:ChunkLayout):string[]{const errors:string[]=[];const ids=new Set<string>();for(const c of layout.chunks){if(ids.has(c.id))errors.push(`Duplicate chunk ${c.id}`);ids.add(c.id);if(c.scale<=0)errors.push(`Invalid scale ${c.id}`);const [, ,w,h]=c.sourceRect;if(c.position.x<0||c.position.y<0||c.position.x+w*c.scale>layout.width||c.position.y+h*c.scale>layout.height)errors.push(`Chunk outside map ${c.id}`);}return errors;}
/** Place a room so one of its entrance sockets meets an existing room's exit. */
export function connectChunk(anchor:MapChunk,exitId:string,next:MapChunk,entranceId:string):MapChunk {
 const exit=anchor.sockets.find(s=>s.id===exitId);const entrance=next.sockets.find(s=>s.id===entranceId);
 if(!exit||!entrance)throw new Error('Unknown connection socket');
 const opposite={north:'south',east:'west',south:'north',west:'east'} as const;
 if(opposite[exit.side]!==entrance.side)throw new Error('Sockets must face each other');
 return {...next,position:{x:anchor.position.x+exit.position.x*anchor.scale-entrance.position.x*next.scale,y:anchor.position.y+exit.position.y*anchor.scale-entrance.position.y*next.scale}};
}
