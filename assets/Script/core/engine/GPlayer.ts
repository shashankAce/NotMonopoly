import { IPlayerInfo, PlayerColor } from "../../Config";

export default class GPlayer {
    private _name: string;
    private _id: string;
    public index: number;
    //
    public balance: number;
    public pawnPosition: number;
    public tabActive: boolean;
    //
    private _data: IPlayerInfo;
    public color: cc.Color;
    public diceValue: number[];

    public defaultPawnPosition = 29;
    public tileCount = 40;

    // means this player is broke
    public isOut = false;
    public isFold = false;

    public get data(): IPlayerInfo {
        return this._data;
    }

    public get name(): string {
        return this._name;
    }

    public set name(v: string) {
        this._name = v;
    }

    public get id(): string {
        return this._id;
    }

    public set id(v: string) {
        this._id = v;
    }

    movePawn() {
        let distance_count = this.diceValue[0] + this.diceValue[1];
        let tile_dist = distance_count + this.pawnPosition;
        if (tile_dist > this.tileCount) {
            this.pawnPosition = tile_dist - this.tileCount;
            return;
        }
        this.pawnPosition = tile_dist;
    }

    init(data: IPlayerInfo) {
        this._data = data;
        this.name = data.name;
        this.balance = data.balance;
        this.color = PlayerColor[this.index];
        this.pawnPosition = this.defaultPawnPosition;
    }
}