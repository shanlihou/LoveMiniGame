import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResetConfirmDialog')
export class ResetConfirmDialog extends Component {
    private resolvePromise: (value: boolean) => void;

    start() {

    }

    show(): Promise<boolean> {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    update(deltaTime: number) {
        
    }

    confirm() {
        console.log('confirm');
        if (this.resolvePromise) {
            this.resolvePromise(true);
        }
    }

    cancel() {
        console.log('cancel');
        if (this.resolvePromise) {
            this.resolvePromise(false);
        }
    }
}

