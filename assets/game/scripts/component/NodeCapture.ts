import { _decorator, Camera, Component, ImageAsset, Node, RenderTexture, Sprite, SpriteFrame, Texture2D } from 'cc';
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
    x: number = 0;
    @property(Number)
    y: number = 0;
    @property(Number)
    w: number = 0;
    @property(Number)
    h: number = 0;

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
        // 获取屏幕宽高
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        renderTex.reset({
            width: screenWidth,
            height: screenHeight,
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
        const pixels = new Uint8Array(this.w * this.h * 4);
        this._renderTex.readPixels(this.x, this.y, this.w, this.h, pixels);
        genEmoji(pixels, this.w, this.h);
    }
}

