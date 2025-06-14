import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EditBox')
export class EditBox extends Component {
    @property(Number)
    private boxSize: number = 0;

    start() {

    }

    onLoad() {
        let backDown = this.node.getChildByName("back-down");
        let backUp = this.node.getChildByName("back-up");
        let edit = this.node.getChildByName("edit");

        let utEdit = edit.getComponent(UITransform);

        backUp.getComponent(UITransform).setContentSize(utEdit.width, utEdit.height);

        backDown.getComponent(UITransform).setContentSize(utEdit.width + this.boxSize, utEdit.height + this.boxSize);
    }

    update(deltaTime: number) {
        
    }
}

