import { _decorator, Component, EventTouch, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PinchZoom')
export class PinchZoom extends Component {
    private startDistance: number = 0;
    private startScale: number = 1;
    private minScale: number = 0.5;  // 最小缩放比例
    private maxScale: number = 3;    // 最大缩放比例


    start() {

    }

    update(deltaTime: number) {
        
    }

    onLoad() {
        // 开启多点触摸
        // input.setMultiTouchEnabled(true);
        
        // 监听触摸事件
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        // 移除监听
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    
    // 计算两点间距离
    private getDistance(touch1: Touch, touch2: Touch): number {
        // const dx = touch1.getLocationX() - touch2.getLocationX();
        // const dy = touch1.getLocationY() - touch2.getLocationY();
        // return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 触摸开始
    private onTouchStart(event: EventTouch) {
        const touches = event.getTouches();
        if (touches.length >= 2) {
            // this.startDistance = this.getDistance(touches[0], touches[1]);
            this.startScale = this.node.scale.x;
        }
    }
    
    // 触摸移动
    private onTouchMove(event: EventTouch) {
        const touches = event.getTouches();
        if (touches.length >= 2) {
            // 计算当前两指距离
            // const currentDistance = this.getDistance(touches[0], touches[1]);
            
            // // 计算缩放比例
            // let scale = this.startScale * (currentDistance / this.startDistance);
            
            // // 限制缩放范围
            // scale = Math.max(this.minScale, Math.min(scale, this.maxScale));
            
            // // 应用缩放
            // this.node.setScale(scale, scale);
        }
    }
    
    // 触摸结束
    private onTouchEnd(event: EventTouch) {
        const touches = event.getTouches();
        if (touches.length < 2) {
            this.startDistance = 0;
        }
    }
}