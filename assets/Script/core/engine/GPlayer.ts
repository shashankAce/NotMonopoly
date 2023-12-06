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

    init(data: IPlayerInfo) {
        this._data = data;
        this.name = data.name;
        this.color = PlayerColor[this.index];
    }
}