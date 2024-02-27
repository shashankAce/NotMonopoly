
import { IProperty } from "../Config";
import { E_Popup } from "../controller/PopupController";
import Popup from "../core/Popup";
import PropertyPopup from "./PropertyPopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupCity extends PropertyPopup {

    @property(cc.Node)
    backgroung_color: cc.Node = null;

    @property(cc.Label)
    price: cc.Label = null;

    @property(cc.Label)
    rent: cc.Label = null;

    @property(cc.Label)
    const_cost: cc.Label = null;

    protected onLoad(): void {
        super.onLoad();
        this.reset();

        // this.scheduleOnce(() => {
        //     // this.show();
        // }, 2)
    }

    private reset() {
        this.node.opacity = 0;
    }

    init(data: IProperty) {
        this.popup_type = E_Popup.city;
        this.rent.string = data.rent.toString();
        this.property_name.string = data.name;
        this.price.string = data.price.toString();
        this.mortgage_value.string = (data.price / 2).toString();
        this.const_cost.string = data.build.toString();
        let color = this.getColor(data.index);
        this.backgroung_color.color = color;
    }

    show(easing: boolean) {
        super.show(easing);
    }

    private getColor(index: number) {
        if (index < 4) {
            // green
            return new cc.Color().fromHEX("#22660d");
        } else if (index < 9) {
            // purple
            return new cc.Color().fromHEX("#7b64aa");
        } else if (index < 13) {
            // lightGreen
            return new cc.Color().fromHEX("#90a211");
        } else if (index < 19) {
            // cyan
            return new cc.Color().fromHEX("#087f90");
        } else if (index < 24) {
            // magenta
            return new cc.Color().fromHEX("#a3365c");
        } else if (index < 29) {
            // orange
            return new cc.Color().fromHEX("#ce6744");
        } else if (index < 34) {
            // red
            return new cc.Color().fromHEX("#972024");
        } else if (index < 39) {
            // yellow
            return new cc.Color().fromHEX("#bb8d1f");
        }
    }

}
