import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ClickRich')
export class ClickRich extends Component {
    @property(Node)
    public clickEvent: Node = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    onPrivacyClicked() {
        console.log("onPrivacyClicked");
        this.clickEvent.emit("onRich", "rich");
    }

    onCancel() {
        console.log("onCancel");
        this.clickEvent.emit("onRich", "cancel");
    }

    onConfirm() {
        console.log("onConfirm");
        this.clickEvent.emit("onRich", "confirm");
    }
}

