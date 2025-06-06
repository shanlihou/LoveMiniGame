import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('BgmButton')
export class BgmButton extends Component {
    @property(SpriteFrame)
    private bgmOn: SpriteFrame = null;
    @property(SpriteFrame)
    private bgmOff: SpriteFrame = null;

    start() {
        console.log("BgmButton start");
    }

    onLoad() {
        console.log("BgmButton onLoad");
        let isPlayBgm = AudioMgr.Instance.isPlay();
        if (isPlayBgm) {
            this.node.getComponent(Sprite).spriteFrame = this.bgmOn;
        }
        else {
            this.node.getComponent(Sprite).spriteFrame = this.bgmOff;
        }

        this.node.on(Node.EventType.TOUCH_START, this.onBgmClick, this);
    }

    onBgmClick() {
        let isPlayBgm = AudioMgr.Instance.onBgmClick();
        if (isPlayBgm) {
            this.node.getComponent(Sprite).spriteFrame = this.bgmOn;
        }
        else {
            this.node.getComponent(Sprite).spriteFrame = this.bgmOff;
        }
    }

    update(deltaTime: number) {
        
    }
}

