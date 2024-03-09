import { IProperty } from "../../Config";
import { clientEvent } from "../../core/ClientEvent";
import { UIEvents } from "../../core/EventNames";
import Property from "../../core/Property";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropList extends cc.Component {

    @property(cc.Label)
    prop_name: cc.Label = null;

    @property(cc.Label)
    prop_price: cc.Label = null;

    public data: IProperty = null;

    init_prop(prop: Property) {
        this.data = prop.data;
        this.prop_name.string = prop.data.name;
        this.prop_price.string = String(prop.data.price);
    }

    onToggle(event: cc.Toggle) {
        if (event.isChecked) {
            clientEvent.dispatchEvent(UIEvents.onPropSelect, this);
        } else {
            clientEvent.dispatchEvent(UIEvents.onPropDeselect, this);
        }
    }
}
