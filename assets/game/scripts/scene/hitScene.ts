import { _decorator, assetManager, Button, Component, director, EventTouch, ImageAsset, Node, Sprite, SpriteFrame, UITransform, Label, RichText, tween, Vec3, AudioSource } from 'cc';
import { GlobalData } from '../common/globalData';
import { EVENT_TYPE_HIT_TRIGGER, EVENT_TYPE_TOGGLE_BUTTON_ENABLE, FACE_INIT_SIZE, SEX_FEMALE, STORAGE_KEY_SEX } from '../common/constant';
const { ccclass, property } = _decorator;
import { datas, Hit } from '../data/Hit';
import { PlayEffect } from '../component/PlayEffect';
import { getStorage } from '../common/adaptor';
import { GongDe } from '../component/GongDe';

class HitInfo {
    times: number;
    lastHitTime: Date;
}

enum HitState {
    NORMAL,
    TOILET,
    SHAKING
}

@ccclass('hitScene')
export class hitScene extends Component {
    @property(Node)
    private backgroundNode: Node = null;

    @property(Node)
    private regisonNode: Node = null;

    @property(Sprite)
    private bodyNoHead: Sprite = null;

    @property(Sprite)
    private fullBody: Sprite = null;

    private hitType: number = -1;
    private hitMap: Map<string, HitInfo> = new Map();
    private timer: number = 0;
    private msgTimer: number = 0;
    private hitState: HitState = HitState.NORMAL;

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

    onLoad() {
        let sex = Number(getStorage(STORAGE_KEY_SEX));
        if (sex == SEX_FEMALE) {
            this.bodyNoHead.spriteFrame = GlobalData.instance.bodyWithoutHeadFemale;
            this.fullBody.spriteFrame = GlobalData.instance.fullBodyFemale;
        } else {
            this.bodyNoHead.spriteFrame = GlobalData.instance.bodyWithoutHeadMale;
            this.fullBody.spriteFrame = GlobalData.instance.fullBodyMale;
        }

        this.regisonNode.active = true;
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

    getHitKey(hitType: number, region: number) {
        return `${hitType}-${region}`;
    }

    onHit(region: number) {
        console.log('onHit', region);
        if (this.hitState != HitState.NORMAL) {
            return;
        }

        if (this.hitType == -1) {
            return;
        }

        let playEffect = this.node.getComponent(PlayEffect);
        playEffect.playHitEffect(this.hitType - 1);

        let nextHitTime = 0;
        let hitKey = this.getHitKey(this.hitType, region);
        if (this.hitMap.has(hitKey)) {
            let curHitInfo = this.hitMap.get(hitKey);
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
            this.doAction(datas[i]);
            break;
        }
        this.hitMap.set(hitKey, {
            times: nextHitTime,
            lastHitTime: new Date()
        });

        this.shake();

        let gongDe = this.node.getComponent(GongDe);
        gongDe.onHitTriggerGongDe();
    }

    toiletClick() {
        console.log('toilet click')
        if (this.hitState != HitState.NORMAL) {
            return;
        }

        this.hitState = HitState.TOILET;
        if (this.msgTimer) {
            clearTimeout(this.msgTimer);
            this.msgTimer = 0;
        }
        let msgNode = this.node.getChildByName("pop-msg");
        msgNode.active = false;

        let playEffect = this.node.getComponent(PlayEffect);
        playEffect.playRush();
        
        // 假设有一个节点 node，需要旋转并缩小
        const node = this.node;
        let restorePostion = node.position.clone();
        let restoreScale = node.scale.clone();


        // 旋转动作 (RotateBy)
        const delay = 2.5;
        const originPosition = node.position.clone();
        const rotateAction = tween(node).by(delay, { angle: delay * 864}); // 1秒内旋转360度

        // 缩放动作 (ScaleTo)
        // 同时执行旋转和缩放（并行动作）
        const moveAction = tween(node).to(delay, { position: new Vec3(0, -300, 0), scale: new Vec3(0.1, 0.1, 1)});

        const spawnAction = tween(node).delay(0.5).parallel(rotateAction, moveAction).call(() => {
            this.clearEffect();
        });

        const backDelay = 1;
        const backRotation = tween(node).by(backDelay, { angle: backDelay * 720 });
        const backMove = tween(node).to(backDelay, { position: originPosition, scale: new Vec3(1, 1, 1) });
        spawnAction.delay(1).call(() => {
            playEffect.playRush2();
        }).parallel(backRotation, backMove).call(() => {
            node.setPosition(restorePostion);
            node.setScale(restoreScale);
            this.hitState = HitState.NORMAL;
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
        }, 5000);
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

    shake() {
        this.hitState = HitState.SHAKING;
        let nodes = [this.backgroundNode, this.node];
        let actions = [];
        let delay = 0.05;
        for (let node of nodes) {
            let act = tween(node)
            .to(delay, { position: new Vec3(10, 0, 0) })
            .to(delay, { position: new Vec3(-10, -10, 0) })
            .to(delay, { position: new Vec3(-10, 10, 0) })
            .to(delay, { position: new Vec3(10, -10, 0) })
            .to(delay, { position: new Vec3(0, 10, 0) })
            actions.push(act);
        }

        tween(this.node)
            .parallel(actions[0], actions[1])
            .call(() => {
                this.hitState = HitState.NORMAL;
            })
            .start();
    }
}