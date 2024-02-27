import { E_Corners } from "../Config";
import Property from "../core/Property";

const { ccclass, property } = cc._decorator;

@ccclass('CornerObj')
export class CornerObj {

    @property({
        type: cc.Enum(E_Corners)
    })
    name: E_Corners = E_Corners.PARKING;

    @property({
        type: cc.SpriteFrame
    })
    spriteFrame: cc.SpriteFrame = null;
}

@ccclass
export default class Corner extends Property {

    @property(cc.Sprite)
    c_image: cc.Sprite = null;

    @property(CornerObj)
    spritesFrames: CornerObj[] = [];

    onLoad() {
        this.pNameLabel.string = this.data.name;
        let ind = Object.keys(E_Corners).indexOf(this.data.name);
        this.c_image.spriteFrame = this.spritesFrames[ind].spriteFrame;
    }
}