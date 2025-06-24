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
        let x = Math.round(this.x * this._renderTex.width);
        let y = Math.round(this.y * this._renderTex.height);

        let w = Math.round(this.w * this._renderTex.width);
        let h = Math.round(this.h * this._renderTex.height);

        console.log('genEmoji', x, y, w, h);

        const pixels = new Uint8Array(w * h * 4);
        console.log('genEmoji2', x, y, w, h);
        
        // In Cocos Creator, readPixels coordinates start from bottom-left
        // We need to convert from top-left to bottom-left coordinate system
        const readY = this._renderTex.height - y - h;
        this._renderTex.readPixels(x, readY, w, h, pixels);
        console.log('genEmoji3', x, readY, w, h);

        genEmoji(pixels, w, h);
    }
}

