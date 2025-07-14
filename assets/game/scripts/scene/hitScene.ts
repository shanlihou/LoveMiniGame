import { _decorator, assetManager, Button, Component, director, EventTouch, ImageAsset, Node, Sprite, SpriteFrame, UITransform, Label, RichText, tween, Vec3, AudioSource, Prefab, instantiate, ParticleSystem2D, Tween, UIOpacity } from 'cc';
import { GlobalData } from '../common/globalData';
import { EVENT_TYPE_HIT_TRIGGER, EVENT_TYPE_TOGGLE_BUTTON_ENABLE, FACE_INIT_SIZE, SEX_FEMALE, STORAGE_KEY_DIY_MSG1, STORAGE_KEY_DIY_MSG2, STORAGE_KEY_DIY_MSG3, STORAGE_KEY_FACE_POSX, STORAGE_KEY_FACE_POSY, STORAGE_KEY_FACE_SCALE, STORAGE_KEY_NAME, STORAGE_KEY_SEX } from '../common/constant';
const { ccclass, property } = _decorator;
import { datas, Hit } from '../data/Hit';
import { PlayEffect } from '../component/PlayEffect';
import { getStorage, getStorageNumber, registerShareAppMessage, shareAppMessage } from '../common/adaptor';
import { GongDe } from '../component/GongDe';
import { ActionQueue } from '../component/ActionQueue';
import { ResetConfirmDialog } from '../component/dialog/ResetConfirmDialog';
import { getRandomShareTitle, isWx } from '../common/utils';

class HitInfo {
    times: number;
    lastHitTime: Date;
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

    @property(Label)
    private nameLabel: Label = null;

    @property(Label)
    private msgLabel: Label = null;

    @property(Node)
    private resetNode: Node = null;

    @property(Prefab)
    private resetConfirmDialog: Prefab = null;

    @property(Node)
    private paperMoneyNode: Node = null;

    @property(Label)
    private upSkyLabel: Label = null;

    private hitType: number = -1;
    private hitMap: Map<string, HitInfo> = new Map();
    private msgTimer: number = 0;

    start() {
        let headMask = this.node.getChildByName('head-mask');
        let child = headMask.getChildByName("add-head");
        if (GlobalData.instance.faceSpriteFrame != null) {
            let sprite = child.getComponent(Sprite);
            sprite.spriteFrame = GlobalData.instance.faceSpriteFrame;
            let x = getStorageNumber(STORAGE_KEY_FACE_POSX);
            let y = getStorageNumber(STORAGE_KEY_FACE_POSY);
            child.setPosition(x, y);
            let scale = getStorageNumber(STORAGE_KEY_FACE_SCALE);
            child.setScale(scale, scale);
            console.log('hit scene start', x, y, scale);
        }
        else {
            child.active = false;
        }

        director.on(EVENT_TYPE_HIT_TRIGGER, this.onHit, this);
        director.on(EVENT_TYPE_TOGGLE_BUTTON_ENABLE, this.onToggleButtonEnable, this);
        this.nameLabel.string = getStorage("name");
        this.resetNode.on(Node.EventType.TOUCH_START, this.onPressReset, this);

        registerShareAppMessage();
    }

    onDestroy() {
        if (this.msgTimer) {
            clearTimeout(this.msgTimer);
            this.msgTimer = 0;
        }
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
        if (this.isActionRunning()) {
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
        if (this.isActionRunning()) {
            return;
        }

        let action = this.genToiletAction(true);
        let actionQueue = this.node.getComponent(ActionQueue);
        actionQueue.addAction(action);
    }

    triggerToiletByGongDe() {
        let action = this.genToiletAction(false);
        let actionQueue = this.node.getComponent(ActionQueue);
        actionQueue.addAction(action);
    }

    isActionRunning(): boolean {
        let actionQueue = this.node.getComponent(ActionQueue);
        return actionQueue.isRunning();
    }

    genToiletAction(isClear: boolean) {
        let playEffect = this.node.getComponent(PlayEffect);
        const node = this.node;
        let that = this;

        // 假设有一个节点 node，需要旋转并缩小
        let restorePostion = node.position.clone();
        let restoreScale = node.scale.clone();

        // 旋转动作 (RotateBy)
        const delay = 2.5;
        const originPosition = node.position.clone();
        const rotateAction = tween(node).by(delay, { angle: delay * 864 }); // 1秒内旋转360度

        // 缩放动作 (ScaleTo)
        // 同时执行旋转和缩放（并行动作）
        const moveAction = tween(node).to(delay, { position: new Vec3(0, -300, 0), scale: new Vec3(0.1, 0.1, 1) });

        const backDelay = 1;
        const backRotation = tween(node).by(backDelay, { angle: backDelay * 720 });
        const backMove = tween(node).to(backDelay, { position: originPosition, scale: new Vec3(1, 1, 1) });

        return tween(this.node).call(() => {
                playEffect.playRush();
                if (isClear) {
                    playEffect.playOneShot("willBackChn");
                }
                else {
                    playEffect.playOneShot("willBack");
                    that.showMessageBubble("I will be back");
                }
            })
            .delay(0.5)
            .parallel(rotateAction, moveAction)
            .call(() => {
                if (isClear) {
                    that.clearEffect();
                }
            })
            .delay(1)
            .call(() => {
                playEffect.playRush2();
                if (isClear) {
                    that.showMessageBubble("谁吃得那么辣？");
                }
                else {
                    that.showMessageBubble("冲不走我的，屎我更强大");
                    playEffect.playOneShot("beStrong");
                }
            })
            .parallel(backRotation, backMove).call(() => {
                node.setPosition(restorePostion);
                node.setScale(restoreScale);
            });
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

    getActionMsg(action: Hit): string {
        if (action.diyMsg) {
            let diyMsg = null;
            switch (action.diyMsg) {
                case 1:
                    diyMsg = getStorage(STORAGE_KEY_DIY_MSG1);
                    break;
                case 2:
                    diyMsg = getStorage(STORAGE_KEY_DIY_MSG2);
                    break;
                case 3:
                    diyMsg = getStorage(STORAGE_KEY_DIY_MSG3);
                    break;
            }

            if (diyMsg) {
                return diyMsg;
            }
        }

        return action.msg;
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
        let msg = this.getActionMsg(action);
        if (msg) {
            this.showMessageBubble(msg);
        }
    }

    private showMessageBubble(message: string) {
        this.msgLabel.string = message;
        this.msgLabel.node.active = true;

        if (this.msgTimer) {
            clearTimeout(this.msgTimer);
        }

        let that = this;
        this.msgTimer = setTimeout(() => {
            that.msgLabel.node.active = false;
            that.msgTimer = 0;
        }, 5000);
    }

    onToggleButtonEnable(hitType: number, isToggle: boolean) {
        this.hitType = isToggle ? hitType : -1;
    }

    shake() {
        let action = this.genShakeAction();
        let actionQueue = this.node.getComponent(ActionQueue);
        actionQueue.addAction(action);
    }

    genShakeAction() {
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

        return tween(this.node)
            .parallel(actions[0], actions[1]);
    }

    triggerPaperMoney() {
        let action = this.genPaperMoneyAction();
        let actionQueue = this.node.getComponent(ActionQueue);
        actionQueue.addAction(action);
    }

    triggerGoSkyNoMoney() {
        let action = this.genGoSkyNoMoneyAction();
        let actionQueue = this.node.getComponent(ActionQueue);
        actionQueue.addAction(action);
    }

    genGoSkyNoMoneyAction() {
        const node = this.node;
        const playEffect = this.node.getComponent(PlayEffect);
        return tween(node).call(() => {
                playEffect.playOneShot("shengTian");
            })
            .parallel(this.genGoSkyAction());
    }

    genGoSkyAction() {
        const node = this.node;
        const uiOpacity = node.getComponent(UIOpacity);
        return tween(node).by(3, new Vec3(0, 500, 0), {
                onUpdate: (target, ratio) => {
                    console.log('onUpdate', ratio);
                    uiOpacity.opacity = 255 * (1 - ratio);
                }
            })
            .call(() => {
                uiOpacity.opacity = 255;
                node.position = new Vec3(0, 0, 0);
            });
    }

    genPaperMoneyAction() : Tween<any> {
        this.paperMoneyNode.active = true;
        const paperMoneyNode = this.paperMoneyNode;
        const particleSystem = paperMoneyNode.getComponent(ParticleSystem2D);
        const upSkyLabel = this.upSkyLabel;
        upSkyLabel.node.active = true;
        let name = getStorage(STORAGE_KEY_NAME);
        upSkyLabel.string = `恭送${name}\n一拳升天`
        upSkyLabel.node.setScale(0.1, 0.1);
        const labelAction = tween(upSkyLabel.node).to(0.5, { scale: new Vec3(3, 3, 1) });

        const node = this.node;

        const returnAction = tween(paperMoneyNode).call(() => {
                particleSystem.resetSystem();
            })
            .parallel(labelAction)
            .delay(0.5)
            .parallel(this.genGoSkyAction())
            .call(() => {
                upSkyLabel.node.active = false;
                paperMoneyNode.active = false;
            });

        return returnAction;
    }

    async onPressReset() {
        let parent = this.node.parent;
        if (parent.getChildByName("resetConfirmDialog")) {
            return;
        }

        console.log('onPressReset');
        let dialog = instantiate(this.resetConfirmDialog);
        dialog.name = "resetConfirmDialog";
        this.node.parent.addChild(dialog);
        const dialogCtrl = dialog.getComponent(ResetConfirmDialog);
        let result = await dialogCtrl.show();
        console.log('onPressReset', result);
        dialog.destroy();
        if (result) {
            let gongDe = this.node.getComponent(GongDe);
            gongDe.clearGongDe();
        }
    }

    onClickShare() {
        shareAppMessage();
    }
}