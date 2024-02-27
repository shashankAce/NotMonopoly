import { IProperty } from "../Config";
import Player from "../entity/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Property extends cc.Component {

    @property(cc.Label)
    pNameLabel: cc.Label = null;

    @property(cc.Label)
    pPriceLabel: cc.Label = null;

    @property(cc.Node)
    sold_tint: cc.Node = null;

    @property(cc.Node)
    userIcon: cc.Node = null;

    private _data: IProperty;
    public get data(): IProperty {
        return this._data;
    }

    private _isSold: boolean;
    public set isSold(v: boolean) {
        this._isSold = v;
        this.enableTint(v);
        this.enableUserIcon(v);
    }
    public soldTo: Player = null;

    public get isSold(): boolean {
        return this._isSold;
    }

    protected onLoad(): void {
        this.isSold = false;
        this.userIcon.active = true;
    }

    init(p_data: IProperty) {
        this._data = p_data;
    }

    setSide(side: number) {
        // return;
        if (side == 1 || side == 2) {
            // Top and Right
            this.userIcon.angle = 90;
            this.userIcon.setPosition(-110, 0);
        } else {
            // Below and Left
            this.userIcon.angle = -90;
            this.userIcon.setPosition(110, 0);
        }
    }

    private enableTint(enable: boolean) {
        this.node.getChildByName('tint').active = enable;
    }

    private enableUserIcon(enabled: boolean) {
        this.userIcon.active = enabled;
        if (enabled)
            this.userIcon.color = this.soldTo.color;
    }
}