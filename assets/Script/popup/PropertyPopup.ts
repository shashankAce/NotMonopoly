import Popup from "../core/Popup";
const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertyPopup extends Popup {

    @property(cc.Label)
    property_name: cc.Label = null;

    @property(cc.Label)
    mortgage_value: cc.Label = null;

    @property(cc.Node)
    building_lvl: cc.Node[] = [];
}