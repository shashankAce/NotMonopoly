import { E_Popup } from "../controller/PopupController";
import { clientEvent } from "./ClientEvent";
import { UIEvents } from "./EventNames";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Popup extends cc.Component {

    @property(cc.Node)
    closeBtn: cc.Node = null;

    // FOR ERROR MSG
    @property(cc.Boolean)
    public isErrorPopup: boolean = false;
    @property({
        type: cc.Label,
        visible() {
            return this.isErrorPopup
        },
    })
    public msgLabel: cc.Label = null;
    // FOR ERROR MSG

    public popup_type: E_Popup = null;
    protected isActive = false;

    show(easing: boolean) {

        if (easing) {
            
            this.node.active = true;
            this.node.opacity = 0;
            this.node.scale = 1;

            let animation = this.node.getComponent(cc.Animation);
            let appear_state = animation.getAnimationState('appear')
            let hide_state = animation.getAnimationState('hide')
            if (!appear_state.isPlaying && !hide_state.isPlaying) {
                this.showAnimation();
            }
        } else {
            this.node.active = true;
            this.node.opacity = 255;
            this.node.scale = 1;
        }
    }

    onClose() {
        clientEvent.dispatchEvent(UIEvents.HidePopup);
    }

    async hide() {
        return new Promise((resolve: Function) => {
            let animation = this.node.getComponent(cc.Animation);
            animation.on('finished', () => {
                resolve();
            });
            animation.play('hide');
            this.isActive = false;
        });
    }

    protected showAnimation() {
        let animation = this.node.getComponent(cc.Animation);
        animation.play('appear');
        this.isActive = true;
    }

    onShowComplete() {
        cc.log('onShowComplete');
    }

    onHideComplete() {

    }

    setCloseBtnVisibility(isVisible: boolean) {
        this.closeBtn.active = isVisible;
    }
}