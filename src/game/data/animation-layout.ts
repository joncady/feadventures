export const MOVEMENT_ROWS = { left:2,right:3,down:4,up:5,'down-left':6,'down-right':7,'up-right':8,'up-left':9 } as const;
// These bow action frames point right in the original sheet. Other action rows point left.
export function actionFlipX(key:string,x:number):boolean { return key === 'archer' || key === 'virion' ? x < 0 : x > 0; }
