import { _decorator, Component, SpriteFrame } from "cc";
import { GlobalData } from "../common/globalData";

const { ccclass, property } = _decorator;

@ccclass('InitToGlobalData')
export class InitToGlobalData extends Component {
    @property(SpriteFrame)
    private bodyBackMale: SpriteFrame = null;

    @property(SpriteFrame)
    private bodyBackFemale: SpriteFrame = null;

    @property(SpriteFrame)
    private bodyWithoutHeadMale: SpriteFrame = null;

    @property(SpriteFrame)
    private bodyWithoutHeadFemale: SpriteFrame = null;

    @property(SpriteFrame)
    private bodyBackNoHeadMale: SpriteFrame = null;

    @property(SpriteFrame)
    private bodyBackNoHeadFemale: SpriteFrame = null;

    @property(SpriteFrame)
    private fullBodyMale: SpriteFrame = null;

    @property(SpriteFrame)
    private fullBodyFemale: SpriteFrame = null;

    onLoad() {
        console.log("init global onLoad");
        GlobalData.instance.bodyBackMale = this.bodyBackMale;
        GlobalData.instance.bodyWithoutHeadMale = this.bodyWithoutHeadMale;
        GlobalData.instance.bodyWithoutHeadFemale = this.bodyWithoutHeadFemale;
        GlobalData.instance.bodyBackFemale = this.bodyBackFemale;
        GlobalData.instance.bodyBackNoHeadMale = this.bodyBackNoHeadMale;
        GlobalData.instance.bodyBackNoHeadFemale = this.bodyBackNoHeadFemale;
        GlobalData.instance.fullBodyMale = this.fullBodyMale;
        GlobalData.instance.fullBodyFemale = this.fullBodyFemale;
    }
}