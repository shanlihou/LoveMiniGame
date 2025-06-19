import { _decorator, Component, EditBox, Label, Node, Toggle } from 'cc';
import { SEX_FEMALE, SEX_MALE } from '../common/constant';
const { ccclass, property } = _decorator;

class DialogResult {
    public name: string;
    public sex: number;
    public diyMsg1: string;
    public diyMsg2: string;
    public diyMsg3: string;

    constructor(name: string, sex: number, diyMsg1: string, diyMsg2: string, diyMsg3: string) {
        this.name = name;
        this.sex = sex;
        this.diyMsg1 = diyMsg1;
        this.diyMsg2 = diyMsg2;
        this.diyMsg3 = diyMsg3;
    }
}

@ccclass
export class DialogCtrl extends Component {
    @property(EditBox)
    private editName: EditBox = null;

    @property(EditBox)
    private editDiyMsg1: EditBox = null;

    @property(EditBox)
    private editDiyMsg2: EditBox = null;

    @property(EditBox)
    private editDiyMsg3: EditBox = null;

    @property(Toggle)
    private toggleMale: Toggle = null;

    private resolvePromise: (value: DialogResult) => void;

    show(): Promise<DialogResult> {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    getResult() {
        return new DialogResult(
            this.editName.string,
            this.toggleMale.isChecked ? SEX_MALE : SEX_FEMALE,
            this.editDiyMsg1.string,
            this.editDiyMsg2.string,
            this.editDiyMsg3.string
        );
    }

    onConfirm() {
        if (this.resolvePromise) {
            this.resolvePromise(this.getResult());
        }
    }
}