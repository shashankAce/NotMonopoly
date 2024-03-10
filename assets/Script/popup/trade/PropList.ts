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

    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    public data: IProperty = null;
    private callback: Function;

    init_prop(prop: Property, cb: Function) {
        this.data = prop.data;
        this.prop_name.string = prop.data.name;
        this.prop_price.string = String(prop.data.price);
        this.callback = cb;
    }

    onToggle(event: cc.Toggle) {
        this.callback && this.callback(this, event.isChecked);
    }
}
