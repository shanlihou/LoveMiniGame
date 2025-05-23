import { _decorator, Button, Component, EventHandler, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ToggleButton')
export class ToggleButton extends Component {

    @property(SpriteFrame)
    private normalSpriteFrame: SpriteFrame;

    @property(SpriteFrame)
    private toggleSpriteFrame: SpriteFrame;
 
    private isToggle: boolean = false;

    start() {

    }

    onLoad() {
        let sprite = this.node.getComponent(Sprite);
        sprite.spriteFrame = this.normalSpriteFrame;

        let btn = this.node.getComponent(Button);

        const newEventHandler = new EventHandler();
        newEventHandler.target = this.node;
        newEventHandler.component = 'ToggleButton';
        newEventHandler.handler = 'onClick';
        newEventHandler.customEventData = '';

        btn.clickEvents.push(newEventHandler);

    }

    public onClick() {
        console.log('onclick')
        this.isToggle = !this.isToggle;
        let sprite = this.node.getComponent(Sprite);
        sprite.spriteFrame = this.isToggle ? this.toggleSpriteFrame : this.normalSpriteFrame;
    }

    update(deltaTime: number) {
        
    }
}

