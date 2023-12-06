import { IPlayerInfo, PlayerColor, TabPosition } from "../Config";
import Pawn from "../Pawn";
import UserTab from "./UserTab";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player {
    private _name: string;
    private _id: string;
    private _tab: UserTab;
    private _pawn: Pawn;
    //
    //
    private data: IPlayerInfo
    public color: cc.Color;


    public set pawn(v: Pawn) {
        this._pawn = v;
    }
    public get pawn(): Pawn {
        return this._pawn;
    }


    public set tab(v: UserTab) {
        this._tab = v;

        if (this.data) {
            this._tab.node.setPosition(TabPosition[this.data.index]);
        } else {
            cc.warn("Player data not initialized");
        }
    }

    public get tab(): UserTab {
        return this._tab;
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
        this.data = data;
        this.color = PlayerColor[data.index];
    }
}