import { _decorator, Button, Component, director, EventHandler, Node, Sprite, SpriteFrame } from 'cc';
import { EVENT_TYPE_HIT_BUTTON_CLICK } from '../common/constant';
const { ccclass, property } = _decorator;

@ccclass('ToggleButton')
export class ToggleButton extends Component {

    @property(SpriteFrame)
    private normalSpriteFrame: SpriteFrame;

    @property(SpriteFrame)
    private toggleSpriteFrame: SpriteFrame;

    @property()
    private hitType: number = 0;
 
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

        director.on(EVENT_TYPE_HIT_BUTTON_CLICK, this.onHitButtonClick, this);
    }

    onHitButtonClick(hitType: number) {
        if (hitType === this.hitType) {
            this.isToggle = !this.isToggle;
            let sprite = this.node.getComponent(Sprite);
            sprite.spriteFrame = this.isToggle ? this.toggleSpriteFrame : this.normalSpriteFrame;

            director.emit('toggleButtonEnable', this.hitType, this.isToggle);
        }
        else if (this.isToggle) {
            this.isToggle = false;
            let sprite = this.node.getComponent(Sprite);
            sprite.spriteFrame = this.normalSpriteFrame;
        }
    }

    public onClick() {
        
        director.emit(EVENT_TYPE_HIT_BUTTON_CLICK, this.hitType);
    }

    update(deltaTime: number) {
        
    }
}

