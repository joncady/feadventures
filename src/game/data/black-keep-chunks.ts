import type {MapChunk} from './map-chunks';
/** Stronghold source tiles are 16px, composed at 2× like Bandit Road and Village Watch.
 * The same chunk terrain rectangles drive both sourced wall placement and collision. */
export const BLACK_KEEP_CHUNKS = [
 {"id":"throne-room","source":"public/assets/maps/black-keep-throne.png","sourceRect":[0,0,1024,256],"position":{"x":0,"y":0},"scale":1,"terrain":[[0,0,1024,32],[0,32,32,224],[992,32,32,224],[288,96,64,64],[672,96,64,64]],"sockets":[{"id":"south","side":"south","position":{"x":512,"y":256}}]},
 {"id":"guard-hall","source":"public/assets/maps/black-keep-hall.png","sourceRect":[0,0,1024,256],"position":{"x":0,"y":256},"scale":1,"terrain":[[0,0,32,256],[992,0,32,256],[32,0,320,32],[672,0,320,32],[256,96,64,64],[704,96,64,64]],"sockets":[{"id":"north","side":"north","position":{"x":512,"y":0}},{"id":"south","side":"south","position":{"x":512,"y":256}}]},
 {"id":"entry-hall","source":"public/assets/maps/black-keep-entry.png","sourceRect":[0,0,1024,256],"position":{"x":0,"y":512},"scale":1,"terrain":[[0,0,32,256],[992,0,32,256],[32,0,320,32],[672,0,320,32],[0,224,1024,32]],"sockets":[{"id":"north","side":"north","position":{"x":512,"y":0}}]}
] as const satisfies readonly MapChunk[];
