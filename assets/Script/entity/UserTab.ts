// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserTab extends cc.Component {


    @property(cc.Label)
    pName: cc.Label = null;

    @property(cc.Label)
    pBalance: cc.Label = null;

    @property(cc.Sprite)
    pPawn: cc.Sprite = null;

    @property(cc.Node)
    colorNode: cc.Node = null;

    @property(cc.Node)
    tint: cc.Node = null;

    protected onLoad(): void {
        this.tint.active = false;
    }

    init(name: string, balance: number, player: Player) {
        this.pName.string = name;
        this.pBalance.string = balance.toString();
        this.pPawn.node.color = player.color;
        this.colorNode.color = player.color;
        this.tint.active = false;
    }

    public deactivate(bool: boolean) {
        this.tint.active = bool;
    }
}