import { _decorator, Camera, Component, Node, RenderTexture, Sprite, SpriteFrame } from 'cc';
import { uint8ArrayToBase64 } from '../common/utils';
const { ccclass, property } = _decorator;

@ccclass('NodeCapture')
export class NodeCapture extends Component {


    @property(Sprite)
    sprite: Sprite = null;
    @property(Camera)
    camera: Camera = null;

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
        if (wx == undefined) {
            return;
        }

        const pixelBuff = this._renderTex.readPixels();

        const canvas = wx.createCanvas();
        canvas.width = this._renderTex.width;  // 图片宽度
        canvas.height = this._renderTex.height; // 图片高度
        const ctx = canvas.getContext('2d');

        // 创建 ImageData 并填充像素
        const imageData = ctx.createImageData(this._renderTex.width, this._renderTex.height);
        imageData.data.set(pixelBuff); // 填入 Uint8Array 数据
        ctx.putImageData(imageData, 0, 0);

        const tempFilePath = canvas.toTempFilePathSync({
            fileType: 'png',
            quality: 1, // 质量 0-1
            destWidth: this._renderTex.width,
            destHeight: this._renderTex.height
          });

        console.log('tempFilePath', tempFilePath);

        wx.authorize({
            scope: 'scope.writePhotosAlbum',   // 需要获取相册权限
            success: (res)=>{     
                // 将截图保存到相册中
                wx.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success: (res)=>{
                        console.log('图片保存成功', res);
                        wx.showToast({
                            title: '图片保存成功',
                            icon: 'success',
                            duration: 2000
                        });
                    },
                    fail: (res)=>{
                        console.log(res);
                        console.log('图片保存失败');
                    }
                });
            },
            fail: (res)=>{
                console.log('授权失败');
            }
        });
    }

    genEmoji2() {
        if (wx == undefined) {
            return;
        }
        const pixelBuff = this._renderTex.readPixels();
        // Convert ArrayBuffer to base64 string
        const bytes = new Uint8Array(pixelBuff);
        const base64 = uint8ArrayToBase64(bytes);
        const base64Data = `data:image/png;base64,${base64}`;

        console.log('base64Data', base64Data);

        wx.authorize({
            scope: 'scope.writePhotosAlbum',   // 需要获取相册权限
            success: (res)=>{     
                // 将截图保存到相册中
                wx.saveImageToPhotosAlbum({
                    filePath: base64Data,
                    success: (res)=>{
                        console.log('图片保存成功', res);
                        wx.showToast({
                            title: '图片保存成功',
                            icon: 'success',
                            duration: 2000
                        });
                    },
                    fail: (res)=>{
                        console.log(res);
                        console.log('图片保存失败');
                    }
                });
            },
     
            fail: (res)=>{
                console.log('授权失败');
            }
        });
    }
}

