import { _decorator, Color, Component, instantiate, Label, Node, Prefab, tween, UIOpacity, Vec3} from 'cc';
import { GONG_DE_MAIN_WEIGHTS, GONG_DE_VALUES, STORAGE_KEY_ONCE_MAX_GONGDE, STORAGE_KEY_SUM_GONGDE, STORAGE_KEY_TIMES, TOILET_COUNT_MAX } from '../common/constant';
import { randomWeighted } from '../common/utils';
import { getStorage, getStorageNumber, setStorage } from '../common/adaptor';
import { LabelMarginLeft } from './LabelMarginLeft';
import { PlayEffect } from './PlayEffect';
import { hitScene } from '../scene/hitScene';

const { ccclass, property } = _decorator;

@ccclass('GongDe')
export class GongDe extends Component {
    private sumGongDe: number = 0;
    private times: number = 0;
    private onceMaxGongDe: number = 0;

    private toiletCount: number = 0;

    @property(Label)
    private sumGongDeLabel: Label = null;

    @property(Label)
    private timesLabel: Label = null;

    @property(Label)
    private onceMaxGongDeLabel: Label = null;

    @property(Prefab)
    private gongDePrefab: Prefab = null;

    start() {
    }
    showGongDeMsg(gongDe: number) {
        // Create a new node for gongde message
        const newNode = instantiate(this.gongDePrefab);
        
        // Add Label component and set text
        const label = newNode.getComponent(Label);
        label.string = `功德 - ${gongDe}`;
        
        // 3. 添加UIOpacity组件控制透明度
        // 4. 将新节点添加到当前节点下
        this.node.parent.addChild(newNode);
        
        // 5. 设置初始位置（屏幕顶部）
        
        // 6. 执行动画
        this.playAnimation(newNode, label);
    }

    playAnimation(newNode: Node, label: Label) {
        // 初始状态：完全透明
        // newNode.getComponent(UIOpacity).opacity = 0;
        // 使用Tween实现动画
        let start = 380;
        let end = 740;
        newNode.setPosition(0, start);
        let alpha = 200;
        let r = label.color.r;
        let g = label.color.g;
        let b = label.color.b;
        tween(newNode)
            // 第一阶段：1秒内渐显并下移
            .to(1, {
                position: new Vec3(0, (end + start) / 2, 0),  // 移动到中间位置
                // opacity: 255                    // 完全不透明
            }, 
            { 
                easing: 'sineOut',
                onUpdate: (target, ratio) => {
                    label.color = new Color(r, g, b, alpha * ratio);
                }
            })           // 缓动效果：先快后慢
            // 第二阶段：1秒后继续下移并渐隐
            .to(1, {
                position: new Vec3(0, end, 0), // 移动到底部
                // opacity: 0                      // 完全透明
            }, 
            { 
                easing: 'sineIn',
                onUpdate: (target, ratio) => {
                    label.color = new Color(r, g, b, alpha * (1 - ratio));
                }
            })            // 缓动效果：先慢后快
            .call(() => {
                newNode.destroy();
            })
            .start();                           // 开始动画
    }

    setLabelNodeStr(label: Label, text: string) {
        let lml = label.node.getComponent(LabelMarginLeft);
        lml.setText(text);
    }

    onLoad() {
        this.sumGongDe = getStorageNumber(STORAGE_KEY_SUM_GONGDE);
        this.times = getStorageNumber(STORAGE_KEY_TIMES);
        this.onceMaxGongDe = getStorageNumber(STORAGE_KEY_ONCE_MAX_GONGDE);

        this.setLabelNodeStr(this.sumGongDeLabel, (- this.sumGongDe).toString());
        this.setLabelNodeStr(this.timesLabel, this.times.toString());
        this.setLabelNodeStr(this.onceMaxGongDeLabel, this.onceMaxGongDe.toString());
    }

    randomGongDe() : number{
        const randomIdx = randomWeighted(GONG_DE_MAIN_WEIGHTS);
        const gongDe = GONG_DE_VALUES[randomIdx];
        return gongDe[Math.floor(Math.random() * gongDe.length)];
    }

    onHitTriggerGongDe() {
        const gongDe = this.randomGongDe();
        console.log(gongDe);

        this.sumGongDe += gongDe;
        this.times++;
        this.onceMaxGongDe = Math.max(this.onceMaxGongDe, gongDe);

        this.setLabelNodeStr(this.sumGongDeLabel, (- this.sumGongDe).toString());
        this.setLabelNodeStr(this.timesLabel, this.times.toString());
        this.setLabelNodeStr(this.onceMaxGongDeLabel, this.onceMaxGongDe.toString());

        setStorage(STORAGE_KEY_SUM_GONGDE, this.sumGongDe);
        setStorage(STORAGE_KEY_TIMES, this.times);
        setStorage(STORAGE_KEY_ONCE_MAX_GONGDE, this.onceMaxGongDe);

        this.showGongDeMsg(gongDe);

        if (gongDe >= 50) {
            this.node.getComponent(PlayEffect).playMuyu();
        }

        this.toiletCount += gongDe;
        if (this.toiletCount >= TOILET_COUNT_MAX) {
            this.node.getComponent(hitScene).triggerToiletByGongDe();
            this.toiletCount = 0;
        }
        else {
            this.node.getComponent(hitScene).triggerPaperMoney();
        }
    }

    clearGongDe() {
        this.sumGongDe = 0;
        this.times = 0;
        this.onceMaxGongDe = 0;
        this.toiletCount = 0;
        this.setLabelNodeStr(this.sumGongDeLabel, (- this.sumGongDe).toString());
        this.setLabelNodeStr(this.timesLabel, this.times.toString());
        this.setLabelNodeStr(this.onceMaxGongDeLabel, this.onceMaxGongDe.toString());

        setStorage(STORAGE_KEY_SUM_GONGDE, this.sumGongDe);
        setStorage(STORAGE_KEY_TIMES, this.times);
        setStorage(STORAGE_KEY_ONCE_MAX_GONGDE, this.onceMaxGongDe);
    }

    update(deltaTime: number) {}
}