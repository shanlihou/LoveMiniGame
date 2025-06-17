import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

class DialogResult {
    public name: string;
    public sex: number;
    public diyMsg1: string;
    public diyMsg2: string;
    public diyMsg3: string;
}

@ccclass
export class DialogCtrl extends Component {

    private resolvePromise: (value: DialogResult) => void;

    show(): Promise<DialogResult> {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    getResult() {
        return new DialogResult(

        );
    }

    onConfirm() {
        if (this.resolvePromise) {
            this.resolvePromise(this.getResult());
        }
    }
}