import { Color, Vec2 } from "cc";

export const HIT_TYPE_PINCH = 1;
export const HIT_TYPE_POKE = 2;
export const HIT_TYPE_POKE_DOUBLE = 3;
export const HIT_TYPE_FIST = 4;
export const HIT_TYPE_SLAP = 5;

export const HIT_POS_LEFT_FACE = 1;
export const HIT_POS_RIGHT_FACE = 2;
export const HIT_POS_NOSE = 3;
export const HIT_POS_MOUTH = 4;
export const HIT_POS_FOREHEAD = 5;
export const HIT_POS_CHIN = 6;
export const HIT_POS_BODY = 7;
export const HIT_POS_HAIR = 8;
export const HIT_POS_LEFT_EYE = 9;
export const HIT_POS_RIGHT_EYE = 10;


export const EVENT_TYPE_SCALE_FACE_END = 1;
export const EVENT_TYPE_HIT_BUTTON_CLICK = 2;
export const EVENT_TYPE_TOGGLE_BUTTON_ENABLE = 3;
export const EVENT_TYPE_HIT_TRIGGER = 4;

export const FACE_INIT_SIZE = new Vec2(800, 800);

export const COLOR_GRAY = new Color('#6d6d6d');
export const COLOR_WHITE = new Color('#FFFFFF');