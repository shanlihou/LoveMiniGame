import { _decorator, assetManager, Component, director, ImageAsset, Node, resources, Sprite, SpriteFrame, UITransform, Vec2, Vec3, Color, Prefab, instantiate, AudioClip } from 'cc';
import { EVENT_TYPE_SCALE_FACE_END, FACE_INIT_SIZE, SAVE_HEAD_NAME, SEX_FEMALE, STORAGE_KEY_NAME, STORAGE_KEY_SAVE_HEAD, STORAGE_KEY_SEX } from '../common/constant';
import { GlobalData } from '../common/globalData';
import { Label, Button } from 'cc';
import { ClickRich } from '../component/ClickRich';
import { AudioMgr } from '../component/AudioMgr';
import { getStorage, setStorage } from '../common/adaptor';
import { Zoom } from '../component/Zoom';
import { isWx } from '../common/utils';
import { DialogCtrl } from '../component/DialogCtrl';
const { ccclass, property } = _decorator;

@ccclass('startScene')
export class startScene extends Component {
    @property(SpriteFrame)
    private faceLine: SpriteFrame = null;

    @property(AudioClip)
    private bgm: AudioClip = null;

    private isSetFace: boolean = false;

    @property({type: [String]})
    private nameList: string[] = [];

    @property(Prefab)
    private privacyDialog: Prefab = null;

    @property(Prefab)
    private editDialog: Prefab = null;

    @property(Sprite)
    private bodyBackgroud: Sprite = null;

    @property(Sprite)
    private bodyBackgroudNoHead: Sprite = null;

    getAddHead() {
      return this.node.getChildByName("head-mask").getChildByName("add-head");
    }

    start() {
      console.log("startScene start");
      AudioMgr.Instance.init(this.bgm);
      director.on(EVENT_TYPE_SCALE_FACE_END, this.onScaleFaceEnd, this);
      let addHead = this.getAddHead();
      GlobalData.instance.facePos = new Vec2(addHead.position.x, addHead.position.y);
      console.log("GlobalData.instance.facePos", GlobalData.instance.facePos);

      if (isWx()) {
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

        wx.showShareMenu({
          menus: ['shareAppMessage', 'shareTimeline']
        })
      }

      this.node.on("onRich", this.onRich, this);
      this.loadName();

      if (!isWx()) {
        let enterEditButton = this.node.getChildByName("enter-edit");
        enterEditButton.active = true;
      }
    }

    onLoad() {
      console.log("startScene onLoad");
      let sex = getStorage(STORAGE_KEY_SEX);
      console.log("startScene onLoad sex", typeof(sex));
      this.onSexReset(Number(sex));

      let isSave = getStorage(STORAGE_KEY_SAVE_HEAD)
      console.log('is save', isSave, typeof(isSave));
      if (isSave && isSave != 'undefined') {
        console.log('load remote image', isSave);
        this.loadRemoteImage(isSave);
      }
    }

    enterEdit() {
      director.loadScene("edit");
    }

    loadName() {
      let nameNode = this.node.getChildByName("name");
      let label = nameNode.getComponent(Label);

      let name = getStorage(STORAGE_KEY_NAME);
      console.log("load name", name);
      if (name) {
        label.string = name;
        return;
      }

      if (label.string === "") {
        let randomIndex = Math.floor(Math.random() * this.nameList.length);
        label.string = this.nameList[randomIndex];
        setStorage(STORAGE_KEY_NAME, label.string);
      }
    }

    setName(name: string) {
      if (name == "") {
        return;
      }

      let nameNode = this.node.getChildByName("name");
      let label = nameNode.getComponent(Label);
      label.string = name;
      setStorage(STORAGE_KEY_NAME, label.string);
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

    saveTempFile(tempFileName: string) {
      // 获取 temp file 的后缀
      const ext = tempFileName.split('.').pop();
      let destPath = `${wx.env.USER_DATA_PATH}/${SAVE_HEAD_NAME}.${ext}`;

      const fs = wx.getFileSystemManager()
      fs.copyFile({
        srcPath: tempFileName, 
        destPath: destPath, 
        success(res) {
          console.log('copy success', res, destPath);
          setStorage(STORAGE_KEY_SAVE_HEAD, destPath);
        },
        fail(res) {
          console.log('copy failed:', res)
        }
      })
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
            that.saveTempFile(tempFilePaths[0]);
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
      if (!isWx()) {
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
      // 获取 spriteFrame 的原始尺寸
      // child.getComponent(UITransform).setContentSize(FACE_INIT_SIZE.x, FACE_INIT_SIZE.y); // 设置节点尺寸
      if (spriteFrame) {
        this.isSetFace = true;
      }

      let zoom = child.getComponent(Zoom);
      zoom.enableZoom = true;
    }

    loadRemoteImage(url: string) {
        assetManager.loadRemote<ImageAsset>(url, (err, imageAsset) => {
            console.log('loadRemoteImage', url, err, imageAsset);
            if (err) {
                console.log(err);
                return;
            }
            this.setSpriteFrameToDisplayPhoto(SpriteFrame.createWithImage(imageAsset));
        });
    }

    async onPressEdit() {
      console.log("onPressEdit");
      const dialog = instantiate(this.editDialog);
      dialog.name = "editDialog";
      this.node.addChild(dialog);
      const dialogCtrl = dialog.getComponent(DialogCtrl);

      let result = await dialogCtrl.show();
      console.log("onPressEdit", result);
      dialog.destroy();

      if (result.name != "") {
        this.setName(result.name);
      }

      setStorage(STORAGE_KEY_SEX, result.sex);
      this.onSexReset(result.sex);
    }

    onSexReset(sex: number) {
      if (sex == SEX_FEMALE) {
        this.bodyBackgroud.spriteFrame = GlobalData.instance.bodyBackFemale;
        this.bodyBackgroudNoHead.spriteFrame = GlobalData.instance.bodyBackNoHeadFemale;
      } else {
        this.bodyBackgroud.spriteFrame = GlobalData.instance.bodyBackMale;
        this.bodyBackgroudNoHead.spriteFrame = GlobalData.instance.bodyBackNoHeadMale;
      }
    }
}

