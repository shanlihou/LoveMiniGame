import { _decorator, assetManager, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('start')
export class start extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }
}

if(typeof wx === 'undefined'){
    console.log("非微信环境");
    director.loadScene("start");
}else{
    console.log("微信环境");
    assetManager.loadBundle("game",(err,bundle)=>{
        console.log("加载bundle1", err);
        console.log("加载bundle2", bundle);
        director.loadScene("start");
    });
}