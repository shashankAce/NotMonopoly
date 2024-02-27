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

    private _data: IProperty;
    public get data(): IProperty {
        return this._data;
    }

    private _isSold: boolean;
    public set isSold(v: boolean) {
        this._isSold = v;
        this.enableTint(v);
    }
    public get isSold(): boolean {
        return this._isSold;
    }

    protected onLoad(): void {
        this.isSold = false;
    }

    init(p_data: IProperty) {
        this._data = p_data;
    }

    enableTint(enable: boolean) {
        this.node.getChildByName('tint').active = enable;
    }
}