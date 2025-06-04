import { _decorator, assetManager, Component, director, ImageAsset, Node, resources, Sprite, SpriteFrame, UITransform, Vec2, Vec3, Color } from 'cc';
import { EVENT_TYPE_SCALE_FACE_END, FACE_INIT_SIZE } from '../common/constant';
import { GlobalData } from '../common/globalData';
import { Label, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('startScene')
export class startScene extends Component {
    @property(SpriteFrame)
    private faceLine: SpriteFrame = null;

    private isSetFace: boolean = false;

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

    openPrivacyWindow() {
      // 创建弹窗节点
      const dialog = new Node('PrivacyDialog');
      dialog.parent = this.node;
      
      // 创建背景遮罩
      const mask = new Node('Mask');
      mask.parent = dialog;
      const maskSprite = mask.addComponent(Sprite);
      maskSprite.color = new Color(0, 0, 0, 180);
      const maskTransform = mask.getComponent(UITransform);
      maskTransform.setContentSize(720, 1280); // 设置遮罩大小
      
      // 创建弹窗面板
      const panel = new Node('Panel');
      panel.parent = dialog;
      const panelSprite = panel.addComponent(Sprite);
      panelSprite.color = new Color(255, 255, 255, 255);
      const panelTransform = panel.getComponent(UITransform);
      panelTransform.setContentSize(600, 450);
      
      // 创建圆角背景
      const bg = new Node('Background');
      bg.parent = panel;
      const bgSprite = bg.addComponent(Sprite);
      bgSprite.color = new Color(255, 255, 255, 255);
      const bgTransform = bg.getComponent(UITransform);
      bgTransform.setContentSize(580, 430);
      
      // 创建标题背景
      const titleBg = new Node('TitleBg');
      titleBg.parent = panel;
      const titleBgSprite = titleBg.addComponent(Sprite);
      titleBgSprite.color = new Color(66, 133, 244, 255);
      const titleBgTransform = titleBg.getComponent(UITransform);
      titleBgTransform.setContentSize(580, 80);
      titleBg.position = new Vec3(0, 175, 0);
      
      // 创建标题
      const title = new Node('Title');
      title.parent = titleBg;
      const titleLabel = title.addComponent(Label);
      titleLabel.string = '隐私政策提示';
      titleLabel.fontSize = 36;
      titleLabel.color = new Color(255, 255, 255, 255);
      titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
      titleLabel.verticalAlign = Label.VerticalAlign.CENTER;
      
      // 创建内容文本
      const content = new Node('Content');
      content.parent = panel;
      const contentLabel = content.addComponent(Label);
      contentLabel.string = '我们需要获取您的头像信息用于游戏体验，是否同意？';
      contentLabel.fontSize = 32;
      contentLabel.color = new Color(51, 51, 51, 255);
      contentLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
      contentLabel.verticalAlign = Label.VerticalAlign.CENTER;
      contentLabel.overflow = Label.Overflow.SHRINK;
      content.position = new Vec3(0, 50, 0);
      
      // 创建按钮容器
      const buttonContainer = new Node('ButtonContainer');
      buttonContainer.parent = panel;
      buttonContainer.position = new Vec3(0, -120, 0);
      
      // 创建确定按钮
      const confirmBtn = new Node('ConfirmBtn');
      confirmBtn.parent = buttonContainer;
      const confirmBtnSprite = confirmBtn.addComponent(Sprite);
      confirmBtnSprite.color = new Color(76, 175, 80, 255);
      const confirmBtnTransform = confirmBtn.getComponent(UITransform);
      confirmBtnTransform.setContentSize(220, 90);
      confirmBtn.position = new Vec3(-130, 0, 0);
      
      const confirmLabel = new Node('Label');
      confirmLabel.parent = confirmBtn;
      const confirmText = confirmLabel.addComponent(Label);
      confirmText.string = '确定';
      confirmText.fontSize = 32;
      confirmText.color = new Color(255, 255, 255, 255);
      confirmText.horizontalAlign = Label.HorizontalAlign.CENTER;
      confirmText.verticalAlign = Label.VerticalAlign.CENTER;
      
      // 创建取消按钮
      const cancelBtn = new Node('CancelBtn');
      cancelBtn.parent = buttonContainer;
      const cancelBtnSprite = cancelBtn.addComponent(Sprite);
      cancelBtnSprite.color = new Color(244, 67, 54, 255);
      const cancelBtnTransform = cancelBtn.getComponent(UITransform);
      cancelBtnTransform.setContentSize(220, 90);
      cancelBtn.position = new Vec3(130, 0, 0);
      
      const cancelLabel = new Node('Label');
      cancelLabel.parent = cancelBtn;
      const cancelText = cancelLabel.addComponent(Label);
      cancelText.string = '取消';
      cancelText.fontSize = 32;
      cancelText.color = new Color(255, 255, 255, 255);
      cancelText.horizontalAlign = Label.HorizontalAlign.CENTER;
      cancelText.verticalAlign = Label.VerticalAlign.CENTER;
      
      // 添加按钮点击事件
      const button = confirmBtn.addComponent(Button);
      button.node.on(Node.EventType.TOUCH_END, () => {
        dialog.destroy();
        this.takePhotoWxPrivacy();
      });
      
      const cancelButton = cancelBtn.addComponent(Button);
      cancelButton.node.on(Node.EventType.TOUCH_END, () => {
        dialog.destroy();
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
        // this.takePhotoWxPrivacy();
        // this.openPrivacyContract();
        this.openPrivacyWindow();
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

