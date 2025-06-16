import { _decorator, Component } from 'cc';
import { GONG_DE_MAIN_WEIGHTS, GONG_DE_VALUES, STORAGE_KEY_ONCE_MAX_GONGDE, STORAGE_KEY_SUM_GONGDE, STORAGE_KEY_TIMES } from '../common/constant';
import { randomWeighted } from '../common/utils';
import { getStorage, setStorage } from '../common/adaptor';

const { ccclass, property } = _decorator;

@ccclass('GongDe')
export class GongDe extends Component {
    private sumGongDe = 0;
    private times = 0;
    private onceMaxGongDe = 0;

    @property(Label)
    private sumGongDeLabel: Label = null;

    @property(Label)
    private timesLabel: Label = null;

    @property(Label)
    private onceMaxGongDeLabel: Label = null;

    start() {
    }

    showGongDeMsg(gongDe: number) {
        const newNode = new Node('gongDeMsg');
        
        // 2. 添加Label组件并设置文本
        const label = newNode.addComponent(Label);
        label.string = "Hello Cocos!";
        label.fontSize = 40;
        label.color = new Color(255, 255, 255); // 白色文字
        
        // 3. 添加UIOpacity组件控制透明度
        newNode.addComponent(UIOpacity);
        
        // 4. 将新节点添加到当前节点下
        this.node.addChild(newNode);
        
        // 5. 设置初始位置（屏幕顶部）
        newNode.setPosition(0, 500);
        
        // 6. 执行动画
        this.playAnimation(newNode);
    }

    playAnimation(newNode: Node) {
        // 初始状态：完全透明
        targetNode.getComponent(UIOpacity).opacity = 0;
        
        // 使用Tween实现动画
        tween(targetNode)
            // 第一阶段：1秒内渐显并下移
            .to(1, {
                position: new Vec3(0, 200, 0),  // 移动到中间位置
                opacity: 255                    // 完全不透明
            }, { easing: 'sineOut' })           // 缓动效果：先快后慢
            
            // 第二阶段：1秒后继续下移并渐隐
            .to(1, {
                position: new Vec3(0, -100, 0), // 移动到底部
                opacity: 0                      // 完全透明
            }, { easing: 'sineIn' })            // 缓动效果：先慢后快
            .call(() => {
                newNode.destroy();
            })
            .start();                           // 开始动画
    }

    onLoad() {
        this.sumGongDe = getStorage(STORAGE_KEY_SUM_GONGDE);
        this.times = getStorage(STORAGE_KEY_TIMES);
        this.onceMaxGongDe = getStorage(STORAGE_KEY_ONCE_MAX_GONGDE);

        this.sumGongDeLabel.string = (- this.sumGongDe).toString();
        this.timesLabel.string = this.times.toString();
        this.onceMaxGongDeLabel.string = (- this.onceMaxGongDe).toString();
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

        this.sumGongDeLabel.string = (- this.sumGongDe).toString();
        this.timesLabel.string = this.times.toString();
        this.onceMaxGongDeLabel.string = (- this.onceMaxGongDe).toString();

        setStorage(STORAGE_KEY_SUM_GONGDE, this.sumGongDe);
        setStorage(STORAGE_KEY_TIMES, this.times);
        setStorage(STORAGE_KEY_ONCE_MAX_GONGDE, this.onceMaxGongDe);
    }

    update(deltaTime: number) {}
}