/** Shared sourced-art placement and collision; composition script reads this JSON literal. */
export const VILLAGE_LAYOUT = {
 "width":1024,"height":704,
 "forest":[[0,0,448,128],[576,0,448,128],[0,576,448,128],[576,576,448,128],[0,256,128,192],[896,256,128,192]],
 "houses":[[240,176,96,96],[688,176,96,96],[240,432,96,96],[688,432,96,96]],
 "roads":[[352,256,320,192],[0,304,1024,96],[464,0,96,704],[128,144,768,48],[128,512,768,48]]
} as const;
