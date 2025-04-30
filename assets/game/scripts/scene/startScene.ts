import { _decorator, assetManager, Component, ImageAsset, Node, Sprite, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('startScene')
export class startScene extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    takePhoto() {
        if (typeof wx === 'undefined') return;  // 非微信环境跳过

        let that = this;
        wx.chooseImage({
            count: 1, // 默认选择一张图片
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机
            success(res) {
              const tempFilePaths = res.tempFilePaths
              // 在这里处理选择的图片，例如显示在页面上
              console.log(tempFilePaths)
              that.loadRemoteImage(tempFilePaths[0]);
            },
            fail(err) {
              console.error('选择图片失败', err)
            },
            complete() {
              console.log('选择图片接口调用完成')
            }
          });



        // const ctx = wx.createCameraContext();
        // ctx.takePhoto({
        //     quality: 'high',
        //     success: (res) => {
        //         const tempFilePath = res.tempImagePath;
        //         // this.previewPhoto(tempFilePath);  // 预览图片
        //         // this.uploadPhoto(tempFilePath);   // 上传图片
        //     },
        //     fail: (err) => console.error('拍照失败:', err)
        // });
    }

    loadRemoteImage(url: string) {
        assetManager.loadRemote<ImageAsset>(url, (err, imageAsset) => {
            if (err) {
                console.log(err);
                return;
            }

            // 创建一个Sprite组件
            let child = this.node.getChildByName("displayPhoto");
            let sprite = child.getComponent(Sprite);
            sprite.spriteFrame = SpriteFrame.createWithImage(imageAsset);
            sprite.sizeMode = Sprite.SizeMode.CUSTOM; // 必须设置为CUSTOM
            child.getComponent(UITransform).setContentSize(100, 100); // 设置节点尺寸
        });
    }
}

