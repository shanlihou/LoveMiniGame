import { _decorator, Component, Node } from 'cc';
import { openPrivacyContract } from '../common/adaptor';
const { ccclass, property } = _decorator;

@ccclass('ClickRich')
export class ClickRich extends Component {
    private resolvePromise: (value: boolean) => void;

    start() {

    }

    update(deltaTime: number) {
        
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
        this.resolvePromise(false);
    }

    onConfirm() {
        console.log("onConfirm");
        this.resolvePromise(true);
    }
}

