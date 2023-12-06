import { IProperty } from "../Config";
import Player from "../entity/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Property extends cc.Component {

    @property(cc.Label)
    pNameLabel: cc.Label = null;

    @property(cc.Label)
    pPriceLabel: cc.Label = null;

    private _data: IProperty;

    public get data(): IProperty {
        return this._data;
    }

    protected isSold: boolean;
    protected soldTo: Player;
    protected isMortgage: boolean;
    protected buildLevel: number;

    init(p_data: IProperty) {
        this._data = p_data;
    }
}