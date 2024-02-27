import { clientEvent } from "../core/ClientEvent";
import { UIEvents } from "../core/EventNames";
import Property from "../core/Property";

const { ccclass, property } = cc._decorator;

@ccclass
export default class City extends Property {

    onLoad() {
        super.onLoad();
        this.pNameLabel.string = this.data.name;
        this.pPriceLabel.string = String(this.data.price);
    }

    onClick() {
        clientEvent.dispatchEvent(UIEvents.ShowCityInfo, this.data);
    }

}