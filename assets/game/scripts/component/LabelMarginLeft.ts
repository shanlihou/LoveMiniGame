import { _decorator, Component, Label, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('LabelMarginLeft')
export class LabelMarginLeft extends Component {

    @property(Number)
    private leftPos: number = 0;

    start() {
        const ut = this.node.getComponent(UITransform);
        const posX = this.leftPos + ut.width / 2;
        this.node.setPosition(posX, this.node.position.y);
    }

    setText(text: string) {
        const label = this.node.getComponent(Label);
        label.string = text;

        const ut = this.node.getComponent(UITransform);
        const posX = this.leftPos + ut.width / 2;
        this.node.setPosition(posX, this.node.position.y);
    }
}