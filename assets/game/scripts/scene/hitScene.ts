import { _decorator, assetManager, Button, Component, director, EventTouch, ImageAsset, Node, Sprite, SpriteFrame, UITransform, Label, RichText } from 'cc';
import { GlobalData } from '../common/globalData';
import { EVENT_TYPE_HIT_TRIGGER, EVENT_TYPE_TOGGLE_BUTTON_ENABLE, FACE_INIT_SIZE } from '../common/constant';
const { ccclass, property } = _decorator;
import { datas, Hit } from '../data/Hit';

class HitInfo {
    times: number;
    lastHitTime: Date;
}

@ccclass('hitScene')
export class hitScene extends Component {

    private hitType: number = -1;
    private hitMap: Map<number, HitInfo> = new Map();
    private timer: number = 0;
    private msgTimer: number = 0;
    
    start() {
        let child = this.node.getChildByName("add-head");
        if (GlobalData.instance.faceSpriteFrame != null) {
            let sprite = child.getComponent(Sprite);
            sprite.spriteFrame = GlobalData.instance.faceSpriteFrame;
            child.getComponent(UITransform).setContentSize(FACE_INIT_SIZE.x, FACE_INIT_SIZE.y); // 设置节点尺寸
            child.setPosition(GlobalData.instance.facePos.x, GlobalData.instance.facePos.y);
            child.setScale(GlobalData.instance.faceScale, GlobalData.instance.faceScale);
        }
        else {
            child.active = false;
        }

        director.on(EVENT_TYPE_HIT_TRIGGER, this.onHit, this);
        director.on(EVENT_TYPE_TOGGLE_BUTTON_ENABLE, this.onToggleButtonEnable, this);

        this.timer = setInterval(() => {
            this.checkHit();
        }, 1000);
    }

    onDestroy() {
        clearInterval(this.timer);
    }

    checkHit() {
        let curTime = new Date();
        let deleteList: number[] = [];
        for (let [hitType, hitInfo] of this.hitMap) {
            if (curTime.getTime() - hitInfo.lastHitTime.getTime() > 5000) {
                deleteList.push(hitType);
            }
        }

        for (let hitType of deleteList) {
            this.hitMap.delete(hitType);
            this.removeActionByHitType(hitType);
        }
    }

    getStickerNode(sticker: number) {
        let effectNode = this.node.parent.getChildByName("effect");
        let prefix = `${sticker}-`;
        for (let i = 0; i < effectNode.children.length; i++) {
            let child = effectNode.children[i];
            if (child.name.indexOf(prefix) >= 0) {
                return child;
            }
        }

        return null;
    }

    removeActionByHitType(hitType: number) {
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].hitType != hitType) {
                continue;
            }

            if (datas[i].sticker != null) {
                let stickerNode = this.getStickerNode(datas[i].sticker);
                if (stickerNode != null) {
                    stickerNode.active = false;
                }
            }
        }
    }
    
    update(deltaTime: number) {
    }

    onHit(region: number) {
        console.log('onHit', region);
        if (this.hitType == -1) {
            return;
        }

        let nextHitTime = 0;
        if (this.hitMap.has(this.hitType)) {
            let curHitInfo = this.hitMap.get(this.hitType);
            nextHitTime = curHitInfo.times + 1;
        }
        else {
            nextHitTime = 1;
        }

        for (let i = 0; i < datas.length; i++) {
            if (datas[i].hitType != this.hitType) {
                continue;
            }
            if (datas[i].pos.indexOf(region) < 0) {
                continue;
            }
            if (nextHitTime != datas[i].times) {
                continue;
            }
            this.hitMap.set(this.hitType, {
                times: nextHitTime,
                lastHitTime: new Date()
            });
            this.doAction(datas[i]);
            return;
        }
    }

    doAction(action: Hit) {
        console.log('doAction', action.sticker);
        if (action.sticker != null) {
            // 获取当前的父节点
            let stickerNode = this.getStickerNode(action.sticker);
            if (stickerNode != null) {
                stickerNode.active = true;
            }
        }

        // 显示消息气泡
        if (action.msg) {
            this.showMessageBubble(action.msg);
        }
    }

    private showMessageBubble(message: string) {
        let msgNode = this.node.getChildByName("pop-msg");
        let label = msgNode.getComponent(Label);
        label.string = message;
        label.node.active = true;

        if (this.msgTimer) {
            clearTimeout(this.msgTimer);
        }

        this.msgTimer = setTimeout(() => {
            label.node.active = false;
            this.msgTimer = 0;
        }, 2000);
    }

    private showMessageBubbleDeprecated(message: string) {
        // 创建气泡节点
        console.log('showMessageBubble', message);
        const bubbleNode = new Node('message-bubble');
        const label = bubbleNode.addComponent(Label);
        label.string = message;
        label.fontSize = 24;
        label.color.fromHEX('#000000');
        
        // 设置气泡背景
        // const sprite = bubbleNode.addComponent(Sprite);
        // 这里需要设置气泡背景图片，暂时使用默认背景
        
        // 设置气泡位置（在头像上方）
        const headNode = this.node.getChildByName("add-head");
        bubbleNode.setPosition(headNode.position.x, headNode.position.y + 100);
        
        // 添加到场景中
        this.node.addChild(bubbleNode);
        
        // 2秒后自动消失
        this.scheduleOnce(() => {
            bubbleNode.destroy();
        }, 2);
    }

    onToggleButtonEnable(hitType: number, isToggle: boolean) {
        console.log('onToggleButtonEnable', hitType, isToggle);
        this.hitType = isToggle ? hitType : -1;
    }
}