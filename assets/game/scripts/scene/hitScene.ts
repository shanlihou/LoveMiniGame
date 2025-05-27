import { _decorator, assetManager, Button, Component, EventTouch, ImageAsset, Node, Sprite, SpriteFrame, UITransform } from 'cc';
import { GlobalData } from '../common/globalData';
import { FACE_INIT_SIZE } from '../common/constant';
const { ccclass, property } = _decorator;
import { datas } from '../data/Hit';

@ccclass('hitScene')
export class hitScene extends Component {

    @property(SpriteFrame)
    private touchSpriteFrame: SpriteFrame;
    
    start() {
        let child = this.node.getChildByName("add-head");
        let sprite = child.getComponent(Sprite);
        sprite.spriteFrame = GlobalData.instance.faceSpriteFrame;
        child.getComponent(UITransform).setContentSize(FACE_INIT_SIZE.x, FACE_INIT_SIZE.y); // 设置节点尺寸
        child.setPosition(GlobalData.instance.facePos.x, GlobalData.instance.facePos.y);
        child.setScale(GlobalData.instance.faceScale, GlobalData.instance.faceScale);

        let hand = this.node.getChildByName("sticker-handleft");
        hand.on(Node.EventType.TOUCH_START, this.onHitPos, this);
    }
    
    update(deltaTime: number) {
        
    }

    onHit(hitEvent: EventTouch, customEventData: number) {
        console.log('onHit', hitEvent.target);
        console.log('customEventData', customEventData);
        // let child = hitEvent.target as Node;
        // let btn = child.getComponent(Button);
        // btn.normalSprite = this.touchSpriteFrame;
    }

    onHitPos(hitEvent: EventTouch) {
        console.log('onHitPos', hitEvent)
    }
}