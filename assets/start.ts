import { _decorator, assetManager, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

const DURATION = 5;

@ccclass('start')
export class start extends Component {
    private duration: number = 0;

    start() {
        console.log("start");
        this.duration = DURATION;
    }

    update(deltaTime: number) {
        this.duration += deltaTime;
        if (this.duration > DURATION) {
            console.log("update", this.duration);
            this.duration = 0;

            this.loadScene();
        }
        else {
            // console.log("update", this.duration);
        }
    }

    loadScene() {
        if(typeof wx === 'undefined'){
            console.log("非微信环境");
        }else{
            console.log("微信环境");
        }
        // 这里打印出当前场景名称
        assetManager.loadBundle("game",(err,bundle)=>{
            console.log("加载bundle1", err);
            console.log("加载bundle2", bundle);
            bundle.loadScene(
                "start",
                function(err,scene){
                    console.log("on launched", err, scene);
                    director.runScene(scene);
                }
            );
        });       
    }
}
