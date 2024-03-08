import { clientEvent } from "../../core/ClientEvent";
import { UIEvents } from "../../core/EventNames";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropList extends cc.Component {

    @property(cc.Label)
    prop_name: cc.Label = null;

    @property(cc.Label)
    prop_price: cc.Label = null;

    private index = 0;

    init_prop(index) {
        this.index = index;
    }

    onToggle(event: cc.Toggle) {
        if (event.isChecked) {
            clientEvent.dispatchEvent(UIEvents.onPropSelect, this.index);
        } else {
            clientEvent.dispatchEvent(UIEvents.onPropDeselect, this.index);
        }
    }
}
