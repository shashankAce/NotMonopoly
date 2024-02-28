// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class CheatController extends cc.Component {

    @property(cc.Label)
    first: cc.Label = null;

    @property(cc.Label)
    second: cc.Label = null;

    private value = [1, 1];

    isSubmit = false;

    protected onLoad(): void {
        this.updateUI();
    }

    protected updateUI() {
        this.first.string = this.value[0].toString();
        this.second.string = this.value[1].toString();
    }

    firstClick() {
        this.value[0]++;
        if (this.value[0] > 6)
            this.value[0] = 0;
        this.updateUI();
    }

    secClick() {
        this.value[1]++;
        if (this.value[1] > 6)
            this.value[1] = 1;
        this.updateUI();
    }

    getValue() {
        return [Number(this.first.string), Number(this.second.string)];
    }
}