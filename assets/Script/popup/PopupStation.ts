
import { IProperty } from "../Config";
import { E_Popup } from "../controller/PopupController";
import Popup from "../core/Popup";
import PropertyPopup from "./PropertyPopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupStation extends PropertyPopup {

    @property(cc.Label)
    regular_price: cc.Label = null;

    protected onLoad(): void {
        super.onLoad();
        this.reset();
    }

    private reset() {
        this.node.opacity = 0;
    }

    init(data: IProperty) {
        this.popup_type = E_Popup.station;
        this.property_name.string = data.name;
        this.regular_price.string = data.price.toString();
        this.mortgage_value.string = (data.price / 2).toString();
    }

    show(easing: boolean) {
        super.show(easing);
    }
}