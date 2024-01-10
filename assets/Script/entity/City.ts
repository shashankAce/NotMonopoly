import { IProperty } from "../Config";
import { clientEvent } from "../core/ClientEvent";
import { Events } from "../core/EventNames";
import Property from "../core/Property";

const { ccclass, property } = cc._decorator;

@ccclass
export default class City extends Property {

    onLoad() {
        this.pNameLabel.string = this.data.name;
        this.pPriceLabel.string = String(this.data.price);
    }

    onClick() {
        clientEvent.dispatchEvent(Events.ShowCityInfo, this.data);
    }

}