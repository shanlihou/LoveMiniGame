import { _decorator, Button, Color, Component, director, EventHandler, Node, Sprite, SpriteFrame } from 'cc';
import { COLOR_GRAY, COLOR_WHITE, EVENT_TYPE_HIT_BUTTON_CLICK, EVENT_TYPE_TOGGLE_BUTTON_ENABLE } from '../common/constant';
const { ccclass, property } = _decorator;

@ccclass('ToggleButton')
export class ToggleButton extends Component {
    @property()
    private hitType: number = 0;
 
    private isToggle: boolean = false;

    start() {

    }

    onLoad() {
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
            if (this.isToggle) {
                sprite.color = COLOR_GRAY;
            }
            else {
                sprite.color = COLOR_WHITE;
            }

            director.emit(EVENT_TYPE_TOGGLE_BUTTON_ENABLE, this.hitType, this.isToggle);
        }
        else if (this.isToggle) {
            this.isToggle = false;
            let sprite = this.node.getComponent(Sprite);
            sprite.color = COLOR_WHITE;
        }
    }

    public onClick() {
        director.emit(EVENT_TYPE_HIT_BUTTON_CLICK, this.hitType);
    }

    update(deltaTime: number) {
        
    }
}

