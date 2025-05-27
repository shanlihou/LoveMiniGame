import { _decorator, Component, director, EventTouch, gfx, Node, PolygonCollider2D, Sprite, SpriteFrame, UI, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HitTrigger')
export class HitTrigger extends Component {
    private textureBuffer: Uint8Array;
    private texWidth: number;
    private texHeight: number;

    start() {
        this.textureBuffer = this.getBufferView();
        // 隐藏当前 spriteFrame
        const sprite = this.node.getComponent(Sprite);
        // sprite.enabled = false;
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    getBufferView() :Uint8Array {
        // 1. 获取纹理数据
        const sprite = this.node.getComponent(Sprite);
        const spriteFrame = sprite.spriteFrame;
        const texture = spriteFrame.getGFXTexture();
        const uit = this.node.getComponent(UITransform);
        this.texWidth = texture.width;
        this.texHeight = texture.height;

        const buffView = [];
        const regions = [];
        const region0 = new gfx.BufferTextureCopy();
        region0.texOffset.x = 0;
        region0.texOffset.y = 0;
        region0.texExtent.width = this.texWidth;
        region0.texExtent.height = this.texHeight;
        regions.push(region0);

        
        const buffer = new Uint8Array(this.texWidth * this.texHeight * 4);
        buffView.push(buffer);
        director.root?.device.copyTextureToBuffers(texture, buffView, regions);
        return buffer;
    }

    onTouchStart(touchEvent: EventTouch) {
        // let collider = this.node.getComponent(PolygonCollider2D);
        // 使用 getUILocation() 方法获取触摸点位置
        const touches = touchEvent.getTouches();
        const touchPos = touches[0].getUILocation();
        
        const sprite = this.node.getComponent(Sprite);
        const spriteFrame = sprite.spriteFrame;
        const texture = spriteFrame.getGFXTexture();
        // 将触摸点坐标转换为节点本地坐标
        let uit = this.node.getComponent(UITransform);
        const localPos = uit.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        console.log('localPos :', localPos);
        // 计算在纹理中的像素坐标
        let pixelX = localPos.x + uit.width / 2;
        let pixelY = uit.height / 2 - localPos.y;

        pixelX = Math.floor(pixelX / uit.width * this.texWidth);
        pixelY = Math.floor(pixelY / uit.height * this.texHeight);

        // 确保坐标在纹理范围内
        if (pixelX >= 0 && pixelX < this.texWidth && pixelY >= 0 && pixelY < this.texHeight) {
            // 计算在buffer中的索引位置
            const idx = (pixelY * this.texWidth + pixelX) * 4;
            console.log(`idx is ${idx}, buffer len is ${this.textureBuffer.length}, pixelX is ${pixelX}, pixelY is ${pixelY}`);
            
            // 获取RGBA值
            const r = this.textureBuffer[idx];
            const g = this.textureBuffer[idx + 1]; 
            const b = this.textureBuffer[idx + 2];
            const a = this.textureBuffer[idx + 3];

            console.log(`触摸位置像素值: R:${r} G:${g} B:${b} A:${a}`);
            if (r == 255 && g == 255 && b == 255 && a == 0) {
                console.log('hit false');
            }
            else {
                console.log('hit true');
            }
        }
    }

    update(deltaTime: number) {
    }
}

