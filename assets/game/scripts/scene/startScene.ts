import { _decorator, assetManager, Component, director, ImageAsset, Node, resources, Sprite, SpriteFrame, UITransform, Vec2, Vec3, Color, Prefab, instantiate } from 'cc';
import { EVENT_TYPE_SCALE_FACE_END, FACE_INIT_SIZE } from '../common/constant';
import { GlobalData } from '../common/globalData';
import { Label, Button } from 'cc';
import { ClickRich } from '../component/ClickRich';
const { ccclass, property } = _decorator;

@ccclass('startScene')
export class startScene extends Component {
    @property(SpriteFrame)
    private faceLine: SpriteFrame = null;

    private isSetFace: boolean = false;

    @property(Prefab)
    private privacyDialog: Prefab = null;

    getAddHead() {
      return this.node.getChildByName("head-mask").getChildByName("add-head");
    }

    start() {
      director.on(EVENT_TYPE_SCALE_FACE_END, this.onScaleFaceEnd, this);
      let addHead = this.getAddHead();
      GlobalData.instance.facePos = new Vec2(addHead.position.x, addHead.position.y);
      console.log("GlobalData.instance.facePos", GlobalData.instance.facePos);

      if (typeof wx !== 'undefined') {
        wx.onNeedPrivacyAuthorization(resolve => {
          // ------ 自定义设置逻辑 ------ 
          // TODO：开发者弹出自定义的隐私弹窗（如果是勾选样式，开发者应在此实现自动唤出隐私勾选页面）
          // 页面展示给用户时，开发者调用 resolve({ event: 'exposureAuthorization' }) 告知平台隐私弹窗页面已曝光
          // 用户表示同意后，开发者调用 resolve({ event: 'agree' }) 告知平台用户已经同意，resolve要求用户有过点击行为。
          // 用户表示拒绝后，开发者调用 resolve({ event: 'disagree' }) 告知平台用户已经拒绝，resolve要求用户有过点击行为。
          // 是否需要控制间隔以及间隔时间，开发者可以自行实现
          // 勾选样式应以用户确认按钮的点击为准，无需每次勾选都上报
          // 如果需要主动弹窗见wx.requirePrivacyAuthorize
          console.log("onNeedPrivacyAuthorization");
          resolve({ event: 'agree' });
        });   
      }

      this.node.on("onRich", this.onRich, this);
    }


    update(deltaTime: number) {
        
    }

    onScaleFaceEnd(pos: Vec2, scale: number) {
      console.log("onScaleFaceEnd", pos, scale);
      GlobalData.instance.facePos = pos;
      GlobalData.instance.faceScale = scale;
    }

    enterMain() {
      console.log("enterMain");
      assetManager.loadBundle("game",(err,bundle)=>{
          console.log("加载bundle1", err);
          console.log("加载bundle2", bundle);
          if (this.isSetFace) {
            GlobalData.instance.faceSpriteFrame = this.faceLine;
          }
          director.loadScene("main");
      });
    }

    takePhotoInWx() {
      let that = this;
      console.log("takePhotoInWx");
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

    openPrivacyContract() {
      wx.openPrivacyContract({
        success: () => {
          console.log("openPrivacyContract success");
        }, // 打开成功
        fail: () => {
          console.log("openPrivacyContract fail");
        }, // 打开失败
        complete: () => {
          console.log("openPrivacyContract complete");
        }
      })
    }
    

    takePhotoWxPrivacy() {
      wx.requirePrivacyAuthorize({
        success: res => {
        // 进入success回调说明用户已同意隐私政策
        // TODO：非标准API的方式处理用户个人信息
          console.log("takePhotoWxPrivacy success", res);
          this.takePhotoInWx();
        },
        fail: () => {
        // 进入fail回调说明用户拒绝隐私政策
        // 游戏需要放弃处理用户个人信息，同时不要阻断游戏主流程
          console.log("takePhotoWxPrivacy fail");
        },
        complete() {
          console.log("takePhotoWxPrivacy complete");
        }
      })
    }

    loadPrivacyDialog() {
      if (this.node.getChildByName("privacyDialog")) {
        return;
      }

      const dialog = instantiate(this.privacyDialog);
      dialog.name = "privacyDialog";
      this.node.addChild(dialog);
      dialog.getChildByName("rich").getComponent(ClickRich).clickEvent = this.node;
    }

    destroyPrivacyDialog() {
      const dialog = this.node.getChildByName("privacyDialog");
      if (dialog) {
        dialog.destroy();
      }
    }

    takePhotoDebug() {
      console.log("takePhotoDebug");
      // 这里加载本地测试图片
      console.log("this.faceLine", this.faceLine);
      this.setSpriteFrameToDisplayPhoto(this.faceLine);
    }

    onRich(event: string) {
      console.log("onRich", event);
      if (event === "rich") {
        this.openPrivacyContract();
      } else if (event === "cancel") {
        this.destroyPrivacyDialog();
      } else if (event === "confirm") {
        this.destroyPrivacyDialog();
        this.takePhotoWxPrivacy();
      }
    }

    takePhoto() {
      if (typeof wx === 'undefined') {
        this.loadPrivacyDialog();
        // this.takePhotoDebug();
      } else {
        // this.takePhotoWxPrivacy();
        // this.openPrivacyContract();
        // this.openPrivacyWindow();
        this.loadPrivacyDialog();
      }
    }

    setSpriteFrameToDisplayPhoto(spriteFrame: SpriteFrame) {
      let child = this.getAddHead();
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

