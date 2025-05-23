import { _decorator, assetManager, Component, director, ImageAsset, Node, resources, Sprite, SpriteFrame, UITransform, Vec2 } from 'cc';
import { EVENT_TYPE_SCALE_FACE_END, FACE_INIT_SIZE } from '../common/constant';
import { GlobalData } from '../common/globalData';
const { ccclass, property } = _decorator;

@ccclass('startScene')
export class startScene extends Component {
    @property(SpriteFrame)
    private faceLine: SpriteFrame = null;

    private isSetFace: boolean = false;

    start() {
      director.on(EVENT_TYPE_SCALE_FACE_END, this.onScaleFaceEnd, this);
    }

    update(deltaTime: number) {
        
    }

    onScaleFaceEnd(pos: Vec2, scale: number) {
      console.log("onScaleFaceEnd", pos, scale);
      GlobalData.instance.facePos = pos;
      GlobalData.instance.faceScale = scale;
    }

    enterMain() {
      if (!this.isSetFace) {
        console.log("未设置人脸");
        return;
      }

      console.log("enterMain");
      assetManager.loadBundle("game",(err,bundle)=>{
          console.log("加载bundle1", err);
          console.log("加载bundle2", bundle);
          GlobalData.instance.faceSpriteFrame = this.faceLine;
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
      console.log("this.faceLine", this.faceLine);
      this.setSpriteFrameToDisplayPhoto(this.faceLine);
    }

    takePhoto() {
      if (typeof wx === 'undefined') {
        this.takePhotoDebug();
      } else {
        this.takePhotoInWx();
      }
    }

    setSpriteFrameToDisplayPhoto(spriteFrame: SpriteFrame) {
      let child = this.node.getChildByName("add-head");
      let sprite = child.getComponent(Sprite);
      sprite.spriteFrame = spriteFrame;
      this.faceLine = spriteFrame;
      sprite.sizeMode = Sprite.SizeMode.CUSTOM; // 必须设置为CUSTOM
      child.getComponent(UITransform).setContentSize(FACE_INIT_SIZE.x, FACE_INIT_SIZE.y); // 设置节点尺寸
      if (spriteFrame) {
        this.isSetFace = true;
      }
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

