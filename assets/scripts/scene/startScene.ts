import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('startScene')
export class startScene extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    takePhoto() {
        if (typeof wx === 'undefined') return;  // 非微信环境跳过

        let camera =wx.createCamera({
            x: 0,
            y: 0,
           width: 500,
            height: 500,
            flash: "off",
            size: "medium",
            //devicePosition:"front",
            success: function () {
                console.log("摄像头打开成功");
            },
            fail: function (res) {
                console.log(res);
                console.log("摄像头打开失败");
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

}

