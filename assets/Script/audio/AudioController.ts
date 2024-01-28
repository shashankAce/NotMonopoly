import Utils from "../Utils";

const { ccclass, property } = cc._decorator;

const FADE_IN_DURATION = 0.2;
const FADE_OUT_DURATION = 4;
const SFX_FADE_OUT_DURATION = 1;
const LOCAL_SOUND_CONFIG_KEY = 'isSoundOn';


@ccclass
export class AudioController extends cc.Component {

    public static inst: AudioController = null;

    @property({ type: cc.AudioClip })
    bgmMain: cc.AudioClip = null;

    assetsConfig = null;
    isSoundOn: boolean = true;
    AudioClips = cc.Enum({})
    curVoiceInGameIdx = 0;
    private _ambienceSFXID: number = null;

    //debug
    currentBGMMainFreespinID: number = -1;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (AudioController.inst) {
            console.error("Too many Sound Managers");
            return;
        }

        AudioController.inst = this;

        this.isSoundOn = this.getSavedSoundConfig();
    }

    start() {
    }

    public updateAssetsConfig(data) {
        this.assetsConfig = data;

        //load remote sounds
        this.assetsConfig.forEach(asset => {
            cc.assetManager.loadRemote(asset.file.presignedUrl, { ext: '.mp3' }, (err, audioClip: cc.AudioClip) => {
                if (err) {
                    cc.log("Cannot load asset from remote " + asset.code as string);
                    cc.error(err);
                }
            });
        });
    }

    public isSoundPlaying(ID: number) {
        var state = cc.audioEngine.getState(ID);
        if (state == cc.audioEngine.AudioState.PLAYING) {
            return true;
        }
        return false;
    }

    public isMusicPlaying() {
        return cc.audioEngine.isMusicPlaying();
    }

    public stopMusic() {
        cc.audioEngine.stopMusic();
    }

    public pauseMusic() {
        cc.audioEngine.pauseMusic();
        //pause ambience sfx if any
        // this.pauseSFXAmbience();
    }

    public resumeMusic() {
        if (this.isSoundOn) {
            cc.audioEngine.resumeMusic();
            //resume ambience sfx if Main BGM is playing
            // this.resumeSFXAmbience();
        }
    }

    public fadeInMusic(duration: number = null) {
        if (!this.isSoundOn) {
            return;
        }
        if (duration == null) {
            duration = FADE_IN_DURATION;
        }
        this.unscheduleAllCallbacks();
        let volume = 0;
        cc.audioEngine.setMusicVolume(volume);
        const fadeInFn = function (dt) {
            volume += dt / FADE_IN_DURATION;
            if (volume > 1) {
                cc.audioEngine.setMusicVolume(1);
                this.unschedule(fadeInFn);
            } else {
                cc.audioEngine.setMusicVolume(volume);
            }
        };
        this.schedule(fadeInFn, 0);
    }

    public fadeOutMusic(duration: number = null) {
        if (!this.isSoundOn) {
            return;
        }
        if (duration == null) {
            duration = FADE_OUT_DURATION;
        }
        this.unscheduleAllCallbacks();
        let volume = 1;
        cc.audioEngine.setMusicVolume(volume);
        const fadeOutFn = function (dt) {
            volume -= dt / FADE_OUT_DURATION;
            if (volume < 0) {
                cc.audioEngine.setMusicVolume(0);
                this.unschedule(fadeOutFn);
            } else {
                cc.audioEngine.setMusicVolume(volume);
            }
        };
        this.schedule(fadeOutFn, 0);
    }

    public fadeOutSFX(sfxID: number, duration: number = null) {
        if (!this.isSoundOn || !sfxID) {
            return;
        }
        if (duration == null) {
            duration = SFX_FADE_OUT_DURATION;
        }
        let volume = cc.audioEngine.getVolume(sfxID);
        if (volume <= 0) {
            return;
        }
        let objTween = { startVal: volume };
        cc.Tween.stopAllByTarget(objTween);
        cc.tween(objTween)
            .to(duration, { startVal: 0 }, {
                progress: (start, end, current, ratio) => {
                    cc.audioEngine.setVolume(sfxID, current);
                    return start + (end - start) * ratio;
                }
            })
            .call(() => {
                cc.audioEngine.stop(sfxID);
                cc.audioEngine.setVolume(sfxID, 1);
            })
            .start();
    }

    _playSFX(clip: cc.AudioClip, volume: number, loop: boolean) {
        let id = null;

        if (this.isSoundOn && clip != null) {
            id = cc.audioEngine.playEffect(clip, loop || false);
            cc.audioEngine.setVolume(id, volume)
        }
        return id;
    }

    public playSound(audioEnum: number, volume?: number, loop?: boolean) {
        if (!volume || volume > 1) volume = 1;
        if (volume < 0) volume = 0;
        let clip = this[Utils.enumToString(this.AudioClips, audioEnum)];
        if (Array.isArray(this[Utils.enumToString(this.AudioClips, audioEnum)])) {
            clip = Utils.randomArr(this[Utils.enumToString(this.AudioClips, audioEnum)])
        }
        return this._playSFX(clip, volume, loop)
    }

    public stopSound(audioId) {
        cc.audioEngine.stopEffect(audioId);
    }

    public setVolume(audioId: number, volume: number) {
        if (volume < 0) volume = 0;
        cc.audioEngine.setVolume(audioId, volume);
    }

    public playMusic(musicClip: cc.AudioClip, volume?: number) {
        this.stopMusic();
        if (!this.isSoundOn) return;
        cc.audioEngine.playMusic(musicClip, true);
        if (volume && volume >= 0 && volume <= 1)
            cc.audioEngine.setMusicVolume(volume);
    }

    public playSoundWithClip(soundClip: cc.AudioClip, volume?: number, loop?: boolean) {
        if (!volume || volume > 1) volume = 1;
        if (volume < 0) volume = 0;
        return this._playSFX(soundClip, volume, loop);
    }

    public toggleSoundSettings() {
        this.isSoundOn = !this.isSoundOn;
        this.saveSoundConfig(this.isSoundOn);
        if (!this.isSoundOn) {
            this.pauseMusic();
        }
        else {
            this.resumeMusic();
        }
    }

    public playSFXJackpotIntro() {
        // return this.playSoundWithClip(this.sfxJackpotIntro);
    }

    public getSavedSoundConfig(): boolean {
        const saved_value = cc.sys.localStorage.getItem(LOCAL_SOUND_CONFIG_KEY);
        return saved_value == 'true' || saved_value == true || saved_value == null || saved_value == undefined;
    }
    public saveSoundConfig(value: boolean) {
        cc.sys.localStorage.setItem(LOCAL_SOUND_CONFIG_KEY, value);
    }
}
