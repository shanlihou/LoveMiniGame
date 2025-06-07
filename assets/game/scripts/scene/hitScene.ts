import { _decorator, assetManager, Button, Component, director, EventTouch, ImageAsset, Node, Sprite, SpriteFrame, UITransform, Label, RichText, tween, Vec3, AudioSource } from 'cc';
import { GlobalData } from '../common/globalData';
import { EVENT_TYPE_HIT_TRIGGER, EVENT_TYPE_TOGGLE_BUTTON_ENABLE, FACE_INIT_SIZE } from '../common/constant';
const { ccclass, property } = _decorator;
import { datas, Hit } from '../data/Hit';
import { PlayEffect } from '../component/PlayEffect';
import { getStorage } from '../common/adaptor';

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
    private isPushToilet: boolean = false;
    
    start() {
        let headMask = this.node.getChildByName('head-mask');
        let child = headMask.getChildByName("add-head");
        if (GlobalData.instance.faceSpriteFrame != null) {
            let sprite = child.getComponent(Sprite);
            sprite.spriteFrame = GlobalData.instance.faceSpriteFrame;
            // child.getComponent(UITransform).setContentSize(FACE_INIT_SIZE.x, FACE_INIT_SIZE.y); // 设置节点尺寸
            // let x = GlobalData.instance.facePos.x - headMask.position.x;
            // let y = GlobalData.instance.facePos.y - headMask.position.y;
            let x = GlobalData.instance.facePos.x;
            let y = GlobalData.instance.facePos.y;
            child.setPosition(x, y);
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

        this.setName();
    }

    setName() {
        let nameNode = this.node.parent.getChildByName("name-label");
        let label = nameNode.getComponent(Label);
        label.string = getStorage("name");
    }

    onDestroy() {
        clearInterval(this.timer);
    }

    checkHit() {
        // let curTime = new Date();
        // let deleteList: number[] = [];
        // for (let [hitType, hitInfo] of this.hitMap) {
        //     if (curTime.getTime() - hitInfo.lastHitTime.getTime() > 5000) {
        //         deleteList.push(hitType);
        //     }
        // }

        // for (let hitType of deleteList) {
        //     this.hitMap.delete(hitType);
        //     this.removeActionByHitType(hitType);
        // }
    }

    getStickerNode(sticker: number) {
        let effectNode = this.node.getChildByName("effect");
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
        if (this.isPushToilet) {
            return;
        }

        if (this.hitType == -1) {
            return;
        }

        let playEffect = this.node.getComponent(PlayEffect);
        playEffect.playHitEffect(this.hitType - 1);

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

    toiletClick() {
        console.log('toilet click')
        if (this.isPushToilet) {
            return;
        }

        this.isPushToilet = true;
        if (this.msgTimer) {
            clearTimeout(this.msgTimer);
            this.msgTimer = 0;
        }

        let playEffect = this.node.getComponent(PlayEffect);
        playEffect.playRush();
        
        // 假设有一个节点 node，需要旋转并缩小
        const node = this.node;
        let restorePostion = node.position.clone();
        let restoreScale = node.scale.clone();


        // 旋转动作 (RotateBy)
        const delay = 3;
        const originPosition = node.position.clone();
        const rotateAction = tween(node).by(delay, { angle: delay * 720 }); // 1秒内旋转360度

        // 缩放动作 (ScaleTo)
        // 同时执行旋转和缩放（并行动作）
        const moveAction = tween(node).to(delay, { position: new Vec3(0, -300, 0), scale: new Vec3(0.1, 0.1, 1)});

        const spawnAction = tween(node).parallel(rotateAction, moveAction).call(() => {
            this.clearEffect();
        });

        const backDelay = 1;
        const backRotation = tween(node).by(backDelay, { angle: backDelay * 720 });
        const backMove = tween(node).to(backDelay, { position: originPosition, scale: new Vec3(1, 1, 1) });
        spawnAction.delay(1).parallel(backRotation, backMove).call(() => {
            node.setPosition(restorePostion);
            node.setScale(restoreScale);
            this.isPushToilet = false;
        });
        // 执行动作
        spawnAction.start();
    }

    backStart() {
        director.loadScene("start");
    }

    clearEffect() {
        this.hitMap.clear();
        let effectNode = this.node.getChildByName("effect");
        for (let i = 0; i < effectNode.children.length; i++) {
            let child = effectNode.children[i];
            child.active = false;
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

        if (action.music != null) {
            let playEffect = this.node.getComponent(PlayEffect);
            playEffect.playActionEffect(action.music - 1);
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