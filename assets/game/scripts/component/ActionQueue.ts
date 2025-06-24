import { _decorator, Component, Tween } from 'cc';
const { ccclass, property } = _decorator;

enum ActionState {
    IDLE,
    RUNNING,
}

@ccclass('ActionQueue')
export class ActionQueue extends Component {

    actions: Tween<any>[] = [];

    state: ActionState = ActionState.IDLE;

    start() {
    }

    public isRunning(): boolean {
        return this.state === ActionState.RUNNING;
    }

    update(deltaTime: number) {
        this.doAction();
    }

    addAction(action: Tween<any>) {
        action.call(() => {
            this.state = ActionState.IDLE;
            this.doAction();
        });

        this.actions.push(action);
        this.doAction();
    }

    doAction() {
        if (this.state === ActionState.RUNNING) {
            return;
        }

        if (this.actions.length === 0) {
            return;
        }

        const action = this.actions.shift();
        this.state = ActionState.RUNNING;
        action.start();
    }
}