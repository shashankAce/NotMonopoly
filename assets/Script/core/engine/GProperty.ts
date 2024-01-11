import { E_PROPERTY_TYPE, IProperty } from "../../Config";
import GPlayer from "./GPlayer";

export default class GProperty {
    public isSold: boolean = false;
    public isMortgage: boolean = false;
    public soldTo: GPlayer = null;
    //
    private _rent: number = 0;
    public get rent(): number {
        if (this.buildings > 0)
            this._rent = this.data.house[this.buildings - 1]
        else
            this._rent = this.data.rent;
        return this._rent;
    }

    public buildings: number = 0;
    public maxBuilding = 5;
    public type: E_PROPERTY_TYPE;
    public isBuildAllowed = false;

    ///
    private _data: IProperty;
    public get data(): IProperty {
        return this._data;
    }
    public set data(v: IProperty) {
        this._data = v;
    }

    constructor(data: IProperty) {
        this._data = data;
    }

    public build() {
        if (this.data.type == E_PROPERTY_TYPE.CITY) {
            this.buildings++;
        }
    }

    public unbuild() {
        if (this.data.type == E_PROPERTY_TYPE.CITY)
            this.buildings--;
    }

    public sell(player: GPlayer) {
        this.soldTo = player;
        this.buildings = 0;
    }
}