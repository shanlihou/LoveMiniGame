import { _decorator, Component, SpriteFrame } from "cc";
import { GlobalData } from "../common/globalData";

const { ccclass, property } = _decorator;

@ccclass('InitToGlobalData')
export class InitToGlobalData extends Component {
    @property(SpriteFrame)
    private headMale: SpriteFrame = null;

    @property(SpriteFrame)
    private headFemale: SpriteFrame = null;

    @property(SpriteFrame)
    private bodyWithoutHeadMale: SpriteFrame = null;

    @property(SpriteFrame)
    private bodyWithoutHeadFemale: SpriteFrame = null;

    onLoad() {
        GlobalData.instance.headMale = this.headMale;
        GlobalData.instance.headFemale = this.headFemale;
        GlobalData.instance.bodyWithoutHeadMale = this.bodyWithoutHeadMale;
        GlobalData.instance.bodyWithoutHeadFemale = this.bodyWithoutHeadFemale;
    }
}