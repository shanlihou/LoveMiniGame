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

export const GONG_DE_MAIN_WEIGHTS = [1960, 50, 8, 4, 1];
export const GONG_DE_VALUES = [
    [1, 2, 3, 4, 5],
    [8, 10, 12, 15, 18, 20, 25, 29, 38, 49], 
    [62, 110, 119, 120, 122, 138, 144],
    [169, 172, 180, 199, 200], 
    [250, 1024, 10086]
];

export const STORAGE_KEY_SUM_GONGDE = 'sumGongDe';
export const STORAGE_KEY_TIMES = 'times';
export const STORAGE_KEY_ONCE_MAX_GONGDE = 'onceMaxGongDe';
export const STORAGE_KEY_NAME = 'name';
export const STORAGE_KEY_SEX = 'sex';
export const STORAGE_KEY_SAVE_HEAD = 'saveHead';
export const STORAGE_KEY_FACE_POSX = 'facePosX';
export const STORAGE_KEY_FACE_POSY = 'facePosY';
export const STORAGE_KEY_FACE_SCALE = 'faceScale';
export const STORAGE_KEY_DIY_MSG1 = 'diyMsg1';
export const STORAGE_KEY_DIY_MSG2 = 'diyMsg2';
export const STORAGE_KEY_DIY_MSG3 = 'diyMsg3';
export const FIRST_10086 = 'first10086';


export const SEX_MALE = 0;
export const SEX_FEMALE = 1;

export const SAVE_HEAD_NAME = 'save_head';

export const TOILET_COUNT_MAX = 250;
export const MOBILE_10086 = 10086;