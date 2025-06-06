import { _decorator, AudioClip, AudioSource, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioMgr')
export class AudioMgr {
    private static instance: AudioMgr;
    private isInit: boolean = false;
    private isPlayBgm: boolean = true;

    public static get Instance(): AudioMgr {
        if (!AudioMgr.instance) {
            AudioMgr.instance = new AudioMgr();
        }
        return AudioMgr.instance;
    }

    private audioSource: AudioSource;

    constructor() {
        let audioNode = new Node("Audio");
        audioNode.name = '_AudioMgr_';
        director.getScene().addChild(audioNode);
        director.addPersistRootNode(audioNode);

        this.audioSource = audioNode.addComponent(AudioSource);

        this.audioSource.loop = true;
        this.audioSource.playOnAwake = false;
    }

    public isPlay(): boolean {
        return this.isPlayBgm;
    }

    public init(audioClip: AudioClip) {
        if (!this.isInit) {
            console.log("AudioMgr init");
            this.audioSource.clip = audioClip;
            this.audioSource.volume = 0.5;
            this.audioSource.play();
            this.isInit = true;
        }
    }

    public onBgmClick() : boolean { 
        this.isPlayBgm = !this.isPlayBgm;
        console.log("AudioMgr onBgmClick", this.isPlayBgm);
        if (this.isPlayBgm) {
            this.audioSource.play();
        }
        else {
            this.audioSource.pause();
        }
        return this.isPlayBgm;
    }
}

