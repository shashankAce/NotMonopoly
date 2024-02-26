// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { config } from "../Config";
import Popup from "../core/Popup";
import Player from "../entity/Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupRent extends Popup {

    @property(cc.Label)
    header: cc.Label = null;

    @property(cc.Label)
    rent: cc.Label = null;

    @property(cc.Label)
    user1_label: cc.Label = null;

    @property(cc.Label)
    user2_label: cc.Label = null;

    init(user1: Player, user2: Player, rent: number) {

        this.user1_label.string = user1.name;
        this.user2_label.string = user2.name;

        this.rent.string = config.currency + " " + rent.toString();
    }

}
