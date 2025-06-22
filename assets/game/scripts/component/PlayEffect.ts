import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayEffect')
export class PlayEffect extends Component {
    @property(AudioClip)
    private rush: AudioClip = null;

    @property(AudioClip)
    private rush2: AudioClip = null;

    @property(AudioClip)
    private muyu: AudioClip = null;

    @property({ type: [AudioClip]})
    private hitEffectList: AudioClip[] = [];

    @property({ type: [AudioClip]})
    private actionEffectList: AudioClip[] = [];

    start() {

    }

    update(deltaTime: number) {
        
    }

    public playMuyu() {
        let audioSource = this.node.getComponent(AudioSource);
        audioSource.playOneShot(this.muyu);
    }

    public playRush() {
        let audioSource = this.node.getComponent(AudioSource);
        audioSource.playOneShot(this.rush);
    }

    public playRush2() {
        let audioSource = this.node.getComponent(AudioSource);
        audioSource.playOneShot(this.rush2);
    }

    public playHitEffect(index: number) {
        let audioSource = this.node.getComponent(AudioSource);
        audioSource.playOneShot(this.hitEffectList[index]);
    }

    public playActionEffect(index: number) {
        if (index < 0 || index >= this.actionEffectList.length) {
            return;
        }

        let audioSource = this.node.getComponent(AudioSource);
        audioSource.playOneShot(this.actionEffectList[index]);
    }
}

