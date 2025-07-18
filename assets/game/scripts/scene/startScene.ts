import { _decorator, assetManager, Component, director, ImageAsset, Node, resources, Sprite, SpriteFrame, UITransform, Vec2, Vec3, Color, Prefab, instantiate, AudioClip, Toggle } from 'cc';
import { EVENT_TYPE_SCALE_FACE_END, FACE_INIT_SIZE, SAVE_HEAD_NAME, SEX_FEMALE, SEX_MALE, STORAGE_KEY_DIY_MSG1, STORAGE_KEY_DIY_MSG2, STORAGE_KEY_DIY_MSG3, STORAGE_KEY_FACE_POSX, STORAGE_KEY_FACE_POSY, STORAGE_KEY_FACE_SCALE, STORAGE_KEY_NAME, STORAGE_KEY_SAVE_HEAD, STORAGE_KEY_SEX } from '../common/constant';
import { GlobalData } from '../common/globalData';
import { Label, Button } from 'cc';
import { ClickRich } from '../component/ClickRich';
import { AudioMgr } from '../component/AudioMgr';
import { getSetting, getStorage, getStorageNumber, getWriteAuth, initPrivacAuth, registerShareAppMessage, saveTempFile, setStorage, shareAppMessage, takePhotoInWx, takePhotoWxPrivacy } from '../common/adaptor';
import { Zoom } from '../component/Zoom';
import { isWx } from '../common/utils';
import { DialogCtrl } from '../component/dialog/DialogCtrl';
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

    @property(Node)
    private addHead: Node = null;

    @property(Toggle)
    private toggleMale: Toggle = null;

    @property(Toggle)
    private toggleFemale: Toggle = null;

    start() {
      console.log("startScene start");
      AudioMgr.Instance.init(this.bgm);
      director.on(EVENT_TYPE_SCALE_FACE_END, this.onScaleFaceEnd, this);

      this.initPrivacAuth();

      this.loadName();

      if (!isWx()) {
        let enterEditButton = this.node.getChildByName("enter-edit");
        enterEditButton.active = true;
      }

      registerShareAppMessage();
    }

    initPrivacAuth() {
      if (!isWx()) {
          return;
      }

      wx.onNeedPrivacyAuthorization(async (resolve) => {
          console.log("onNeedPrivacyAuthorization, before");
          resolve({ event: 'exposureAuthorization' })
          let ret = await this.loadPrivacyDialog(resolve);
          console.log("onNeedPrivacyAuthorization", ret);
          // if (ret) {
          //   resolve({ event: 'agree' });
          // } else {
          //   resolve({ event: 'disagree' });
          // }
      });

      wx.showShareMenu({
          menus: ['shareAppMessage', 'shareTimeline']
      })
    }

    onLoad() {
      console.log("startScene onLoad");
      let sex = getStorage(STORAGE_KEY_SEX);
      console.log("startScene onLoad sex", typeof(sex));
      this.onSexReset(Number(sex));

      if (sex == SEX_MALE) {
        this.toggleMale.isChecked = true;
        this.toggleFemale.isChecked = false;
      }
      else {
        this.toggleMale.isChecked = false;
        this.toggleFemale.isChecked = true;
      }

      this.loadSaveHead();
    }

    async loadSaveHead() {
      let isSave = getStorage(STORAGE_KEY_SAVE_HEAD)
      console.log('is save', isSave, typeof(isSave));
      if (isSave && isSave != 'undefined') {
        console.log('load remote image', isSave);
        let spriteFrame = await this.loadRemoteImage(isSave);
        if (spriteFrame) {
          this.setSpriteFrameToDisplayPhoto(spriteFrame);
          let x = getStorageNumber(STORAGE_KEY_FACE_POSX);
          let y = getStorageNumber(STORAGE_KEY_FACE_POSY);
          let scale = getStorageNumber(STORAGE_KEY_FACE_SCALE);

          console.log("load save head", x, y, scale);

          this.addHead.setPosition(x, y);
          this.addHead.setScale(scale, scale);
        }
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
      setStorage(STORAGE_KEY_FACE_POSX, pos.x);
      setStorage(STORAGE_KEY_FACE_POSY, pos.y);
      setStorage(STORAGE_KEY_FACE_SCALE, scale);
    }

    enterMain() {
      console.log("enterMain");
      let x = this.addHead.position.x;
      let y = this.addHead.position.y;
      this.onScaleFaceEnd(new Vec2(x, y), this.addHead.scale.x);
      assetManager.loadBundle("game",(err,bundle)=>{
          console.log("加载bundle1", err);
          console.log("加载bundle2", bundle);
          if (this.isSetFace) {
            GlobalData.instance.faceSpriteFrame = this.faceLine;
          }
          director.loadScene("main");
      });
    }

    async loadPrivacyDialog(resolve: any): Promise<boolean> {
      if (this.node.getChildByName("privacyDialog")) {
        return false;
      }

      const dialog = instantiate(this.privacyDialog);
      dialog.name = "privacyDialog";
      this.node.parent.addChild(dialog);
      let rich = dialog.getChildByName("rich").getComponent(ClickRich);
      rich.setWxResolve(resolve);
      let result = await rich.show();
      dialog.destroy();
      return result;
    }

    async takePhoto() {
      if (!isWx()) {
        this.setSpriteFrameToDisplayPhoto(this.faceLine);
        return;
      }
    
      // let setting = await getSetting();
      // console.log('setting', setting);

      // if (!(await this.loadPrivacyDialog())) {
      //   return;
      // }

      // if (!(await getWriteAuth())) {
      //   return;
      // }

      if (!(await takePhotoWxPrivacy())) {
        console.error("takePhotoWxPrivacy failed");
        return;
      }

      let tempFileName = await takePhotoInWx();
      if (!tempFileName) {
        console.error("takePhoto failed");
        return;
      }

      let destPath = await saveTempFile(tempFileName);
      if (!destPath) {
        console.error("saveTempFile failed");
        return;
      }
      console.log("saveTempFile result", destPath);

      setStorage(STORAGE_KEY_SAVE_HEAD, destPath);

      let spriteFrame = await this.loadRemoteImage(tempFileName);
      if (!spriteFrame) {
        console.error("loadRemoteImage failed");
        return;
      }

      console.log("takePhoto success", tempFileName, destPath, spriteFrame);
      this.setSpriteFrameToDisplayPhoto(spriteFrame);

      this.addHead.setPosition(0, 0);
      this.addHead.setScale(1, 1);
      this.onScaleFaceEnd(new Vec2(0, 0), 1);
    }

    setSpriteFrameToDisplayPhoto(spriteFrame: SpriteFrame) {
      let sprite = this.addHead.getComponent(Sprite);
      sprite.spriteFrame = spriteFrame;
      this.faceLine = spriteFrame;
      sprite.sizeMode = Sprite.SizeMode.CUSTOM; // 必须设置为CUSTOM
      let uit = this.addHead.getComponent(UITransform);
      uit.setContentSize(spriteFrame.width, spriteFrame.height);
      if (spriteFrame) {
        this.isSetFace = true;
      }

      let zoom = this.addHead.getComponent(Zoom);
      zoom.enableZoom = true;
    }

    loadRemoteImage(url: string): Promise<SpriteFrame | null> {
      return new Promise((resolve, reject) => {
        assetManager.loadRemote<ImageAsset>(url, (err, imageAsset) => {
            console.log('loadRemoteImage', url, err, imageAsset);
            if (err) {
                console.log(err);
                resolve(null);
                return;
            }
            resolve(SpriteFrame.createWithImage(imageAsset));
        });
      })
    }

    async onPressEdit() {
      console.log("onPressEdit");
      const dialog = instantiate(this.editDialog);
      dialog.name = "editDialog";
      this.node.parent.addChild(dialog);
      const dialogCtrl = dialog.getComponent(DialogCtrl);

      let result = await dialogCtrl.show();
      console.log("onPressEdit", result);
      dialog.destroy();

      if (result.name != "") {
        this.setName(result.name);
      }

      setStorage(STORAGE_KEY_SEX, result.sex);
      this.onSexReset(result.sex);

      setStorage(STORAGE_KEY_DIY_MSG1, result.diyMsg1);
      setStorage(STORAGE_KEY_DIY_MSG2, result.diyMsg2);
      setStorage(STORAGE_KEY_DIY_MSG3, result.diyMsg3);
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

    onClickShare() {
      shareAppMessage();
    }

    sexCheck(event: Toggle, customEventData: string){
      console.log("sexCheck", event.isChecked);
      let sex = SEX_FEMALE;
      if (event.isChecked) {
        sex = SEX_MALE;
      }
      else {
        sex = SEX_FEMALE;
      }
      setStorage(STORAGE_KEY_SEX, sex);
      this.onSexReset(sex);
    }
}

