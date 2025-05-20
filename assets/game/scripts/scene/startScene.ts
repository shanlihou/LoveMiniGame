import { _decorator, assetManager, Component, director, ImageAsset, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('startScene')
export class startScene extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    enterMain() {
      console.log("enterMain");
      assetManager.loadBundle("game",(err,bundle)=>{
          console.log("加载bundle1", err);
          console.log("加载bundle2", bundle);
          director.loadScene("main");
      });
    }

    takePhotoInWx() {
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
    }

    takePhotoDebug() {
      console.log("takePhotoDebug");
      // 这里加载本地测试图片
      resources.load('face-line', SpriteFrame, (err, spriteFrame) => {
        
        if (err) {
            console.error(err);
            return;
        }
        this.setSpriteFrameToDisplayPhoto(spriteFrame);
    });
    }

    takePhoto() {
      if (typeof wx === 'undefined') {
        this.takePhotoDebug();
      } else {
        this.takePhotoInWx();
      }
    }

    setSpriteFrameToDisplayPhoto(spriteFrame: SpriteFrame) {
      let child = this.node.getChildByName("displayPhoto");
      let sprite = child.getComponent(Sprite);
      sprite.spriteFrame = spriteFrame;
      sprite.sizeMode = Sprite.SizeMode.CUSTOM; // 必须设置为CUSTOM
      child.getComponent(UITransform).setContentSize(100, 100); // 设置节点尺寸
    }

    loadRemoteImage(url: string) {
        assetManager.loadRemote<ImageAsset>(url, (err, imageAsset) => {
            if (err) {
                console.log(err);
                return;
            }
            this.setSpriteFrameToDisplayPhoto(SpriteFrame.createWithImage(imageAsset));
        });
    }
}

