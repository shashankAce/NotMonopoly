import { PROPERTY_COLOR } from "../Config";
import { clientEvent } from "../core/ClientEvent";
import { UIEvents } from "../core/EventNames";
import Property from "../core/Property";

const { ccclass, property } = cc._decorator;

@ccclass
export default class City extends Property {

    @property(cc.Node)
    tileNode: cc.Node = null;

    @property(cc.Node)
    tileColorNode: cc.Node = null;

    onLoad() {
        super.onLoad();
        this.pNameLabel.string = this.data.name;
        this.pPriceLabel.string = String(this.data.price);
        this.tileColorNode.color = new cc.Color().fromHEX(PROPERTY_COLOR[this.data.group]);
    }

    setSide(side: number) {
        super.setSide(side);
        if (side == 1 || side == 2) {
            // Top and Right
            // this.userIcon.angle = 90;
            this.tileColorNode.setPosition(0, 75);
        }
    }

    onClick() {
        clientEvent.dispatchEvent(UIEvents.ShowCityInfo, this.data);
    }

}