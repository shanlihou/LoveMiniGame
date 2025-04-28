import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('main')
export class main extends Component {
    state = 0;
    start() {

    }

    update(deltaTime: number) {
        
    }

    onClickBeat() {
        if (this.state != 0) {
            return;
        }
        this.state = 1;
        let handleft = this.node.getChildByName('handleft');

        console.log('onClickBeat', handleft);
        let pos = handleft.getPosition();
        handleft.setPosition(0, 0, 0);
        // tween(handleft)
        //     .to(0.5, { position: new Vec3(0, 0, 0) })
        //     .call(() => {
        //         console.log('onClickBeat2', handleft);
        //         handleft.setPosition(pos);
        //         this.state = 0;
        //     })
        //     .start();
    }
}

