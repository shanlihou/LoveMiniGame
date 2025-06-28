import { _decorator, Component, EventTouch, Input, input, Node, Vec2, Vec3, Touch, director } from 'cc';
import { EVENT_TYPE_SCALE_FACE_END } from '../common/constant';
const { ccclass, property } = _decorator;

@ccclass('Zoom')
export class Zoom extends Component {

    @property(Boolean)
    public enableZoom: boolean = false;

    private startDistance: number = 0;
    private startScale: number = 1;
    private minScale: number = 0.5;  // 最小缩放比例
    private maxScale: number = 10;    // 最大缩放比例

    // 单指移动相关变量
    private lastTouchPos: Vec2 = new Vec2();
    private lastTouchNum = 0;
    private maxDis = 0;

    start() {
        // 多点触摸默认开启，无需特别设置
    }

    update(deltaTime: number) {
        
    }

    onLoad() {
        // 开启多点触摸
        // input.setMultiTouchEnabled(true);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        // 移除监听
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    
    // 计算两点间距离
    private getDistance(touch1: Touch, touch2: Touch): number {
        const dx = touch1.getUILocation().x - touch2.getUILocation().x;
        const dy = touch1.getUILocation().y - touch2.getUILocation().y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 触摸开始
    private onTouchStart(event: EventTouch) {
        if (!this.enableZoom) {
            return;
        }

        const touches = event.getTouches();
        console.log("onTouchStart", touches.length);
        this.startWithTouches(touches);
    }

    private startWithTouches(touches: Touch[]) {
        if (touches.length >= 2) {
            this.startDistance = this.getDistance(touches[0], touches[1]);
            this.startScale = this.node.scale.x;
        } else if (touches.length === 1) {
            const location = touches[0].getUILocation();
            this.lastTouchPos.set(location.x, location.y);
        }
        this.lastTouchNum = touches.length;
    }

    private moveByTouch(touches: Touch[]) {
        if (touches.length >= 2) {
            // 计算当前两指距离
            const currentDistance = this.getDistance(touches[0], touches[1]);
            if (this.startDistance === 0) {
                this.startDistance = currentDistance;
                this.startScale = this.node.scale.x;
            }
            else {
                // 计算缩放比例
                let scale = this.startScale * (currentDistance / this.startDistance);
                
                // 限制缩放范围
                scale = Math.max(this.minScale, Math.min(scale, this.maxScale));
                
                // 应用缩放
                this.node.setScale(scale, scale);
            }
        } else if (touches.length === 1) {
            // 单指移动

            const location = touches[0].getUILocation();
            const currentPos = new Vec2(location.x, location.y);
            const delta = new Vec2(
                currentPos.x - this.lastTouchPos.x,
                currentPos.y - this.lastTouchPos.y
            );

            let dis = (delta.x * delta.x + delta.y * delta.y);
            if (dis > this.maxDis) {
                this.maxDis = dis;
                console.log("maxDis", this.maxDis);
            }
            
            // 更新节点位置
            const currentPos3D = this.node.position;
            this.node.setPosition(
                currentPos3D.x + delta.x,
                currentPos3D.y + delta.y,
                currentPos3D.z
            );
            
            // 更新上一次触摸位置
            this.lastTouchPos.set(currentPos.x, currentPos.y);
        }
    }

    private onTouchMove(event: EventTouch) {
        if (!this.enableZoom) {
            return;
        }

        const touches = event.getTouches();
        if (touches.length === this.lastTouchNum) {
            this.moveByTouch(touches);
        }
        else {
            this.startWithTouches(touches);
        }
    }

    // 触摸结束
    private onTouchEnd(event: EventTouch) {
        if (!this.enableZoom) {
            return;
        }
        
        const touches = event.getTouches();
        console.log("onTouchEnd", touches.length);
        if (touches.length === this.lastTouchNum) {
            this.moveByTouch(touches);
        }

        director.emit(EVENT_TYPE_SCALE_FACE_END, this.node.position, this.node.scale.x);
        
    }
}

