import { _decorator, Component, EditBox, Label, Node, Toggle } from 'cc';
import { SEX_FEMALE, SEX_MALE, STORAGE_KEY_DIY_MSG1, STORAGE_KEY_DIY_MSG2, STORAGE_KEY_DIY_MSG3, STORAGE_KEY_NAME, STORAGE_KEY_SEX } from '../common/constant';
import { getStorage, getStorageString } from '../common/adaptor';
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

    @property(Toggle)
    private toggleFemale: Toggle = null;

    private resolvePromise: (value: DialogResult) => void;

    onLoad() {
        this.editName.string = getStorageString(STORAGE_KEY_NAME);
        let sex = getStorage(STORAGE_KEY_SEX);
        if (sex == SEX_MALE) {
            this.toggleMale.isChecked = true;
            this.toggleFemale.isChecked = false;
        }
        else {
            this.toggleMale.isChecked = false;
            this.toggleFemale.isChecked = true;
        }

        this.editDiyMsg1.string = getStorageString(STORAGE_KEY_DIY_MSG1);
        this.editDiyMsg2.string = getStorageString(STORAGE_KEY_DIY_MSG2);
        this.editDiyMsg3.string = getStorageString(STORAGE_KEY_DIY_MSG3);
    }

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