import { _decorator, Component, Node } from 'cc';
import { openPrivacyContract } from '../common/adaptor';
const { ccclass, property } = _decorator;

@ccclass('ClickRich')
export class ClickRich extends Component {
    private resolvePromise: (value: boolean) => void;
    private wxResolve: any = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    setWxResolve(resolve: any) {
        this.wxResolve = resolve;
    }

    show(): Promise<boolean> {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    onPrivacyClicked() {
        console.log("onPrivacyClicked");
        openPrivacyContract();
    }

    onCancel() {
        console.log("onCancel");
        if (this.wxResolve) {
            console.log("onCancel, wxResolve", this.wxResolve);
            this.wxResolve({ event: 'disagree' });
        }
        this.resolvePromise(false);
    }

    onConfirm() {
        console.log("onConfirm");
        if (this.wxResolve) {
            console.log("onConfirm, wxResolve", this.wxResolve);
            this.wxResolve({ event: 'agree' });
        }
        this.resolvePromise(true);
    }
}

