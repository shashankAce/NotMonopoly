

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastMsg extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    private isTweening = false;

    protected onLoad(): void {
        this.node.opacity = 0;
    }

    show(msg: string) {

        if (this.isTweening) {
            cc.Tween.stopAllByTarget(this.node);
            this.node.opacity = 0;
            this.isTweening = false;
        }

        this.label.string = msg;
        this.isTweening = true;

        cc.tween(this.node)
            .to(0.2, { opacity: 255 }, { easing: "quartOut" })
            .delay(0.4)
            .to(0.2, { opacity: 0 }, { easing: "quartIn" })
            .call(() => {
                this.isTweening = false;
            })
            .start();
    }
}
