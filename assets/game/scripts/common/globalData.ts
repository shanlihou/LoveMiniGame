// GlobalData.ts（单例类）
import { _decorator, SpriteFrame, Vec2 } from 'cc';
const { ccclass } = _decorator;

@ccclass('GlobalData')
export class GlobalData {
    private static _instance: GlobalData;
    public static get instance() {
        if (!this._instance) this._instance = new GlobalData();
        return this._instance;
    }

    public faceSpriteFrame: SpriteFrame | null = null; // 存储跨场景的 SpriteFrame
    public facePos: Vec2 = new Vec2(0, 0);
    public faceScale: number = 1;

    // init
    public headMale: SpriteFrame = null;
    public headFemale: SpriteFrame = null;
    public bodyWithoutHeadMale: SpriteFrame = null;
    public bodyWithoutHeadFemale: SpriteFrame = null;
}