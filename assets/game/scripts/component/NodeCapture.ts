import { _decorator, Camera, Component, Node, RenderTexture, Sprite, SpriteFrame } from 'cc';
import { uint8ArrayToBase64 } from '../common/utils';
import { genEmoji } from '../common/adaptor';
const { ccclass, property } = _decorator;

@ccclass('NodeCapture')
export class NodeCapture extends Component {


    @property(Sprite)
    sprite: Sprite = null;
    @property(Camera)
    camera: Camera = null;
    @property(Number)
    rate: Number = 1;

    protected _renderTex: RenderTexture = null;

    start () {
        const spriteframe = this.sprite.spriteFrame;
        const sp = new SpriteFrame();
        sp.reset({
            originalSize: spriteframe.getOriginalSize(),
            rect: spriteframe.getRect(),
            offset: spriteframe.getOffset(),
            isRotate: spriteframe.isRotated(),
            borderTop: spriteframe.insetTop,
            borderLeft: spriteframe.insetLeft,
            borderBottom: spriteframe.insetBottom,
            borderRight: spriteframe.insetRight,
        });

        const renderTex = this._renderTex = new RenderTexture();
        renderTex.reset({
            width: 256,
            height: 256,
            // colorFormat: RenderTexture.PixelFormat.RGBA8888,
            // depthStencilFormat: RenderTexture.DepthStencilFormat.DEPTH_24_STENCIL_8
        });
        this.camera.targetTexture = renderTex;
        sp.texture = renderTex;
        this.sprite.spriteFrame = sp;
    }

    update(deltaTime: number) {
        
    }

    genEmoji() {
        genEmoji(this._renderTex, this.rate as number);
    }
}

