import { IProperty } from "../Config";
import Popup from "../core/Popup";
import PopupCity from "../popup/PopupCity";
import PopupSale from "../popup/PopupSale";
import PopupStation from "../popup/PopupStation";

const { ccclass, property } = cc._decorator;

export enum E_Popup {
    city,
    station,
    sale,
    jail,
    rent,
    loan,
    deal,
}


@ccclass('PopupObj')
class PopupObj {
    @property({ type: cc.Enum(E_Popup) })
    type: E_Popup.city = E_Popup.city;

    @property({ type: cc.Prefab })
    prefab: cc.Prefab = null;
}

@ccclass
export default class PopupController extends cc.Component {

    @property(PopupObj)
    popupPrefabs: PopupObj[] = [];

    @property(cc.Node)
    transparent_layer: cc.Node = null;

    private prefabMap: Map<E_Popup, cc.Prefab> = null;
    private popupPool: Popup[] = [];

    protected onLoad(): void {
        this.transparent_layer.opacity = 0;
    }

    showSalePopup(data) {

        let pre_popup = this.popupPool.pop();
        if (pre_popup)
            this.node.removeChild(pre_popup.node);

        let prefab = this.getPrefabObj(E_Popup.sale);
        let node = cc.instantiate(prefab);
        this.node.addChild(node);
        //
        let node_sale = node.getComponent(PopupSale);
        node_sale.onSale(data);
        this.popupPool.push(node_sale);

        // node_sale.show(true);
    }

    showCityPopup(data: IProperty) {

        let pre_popup = this.popupPool.pop();
        if (pre_popup && pre_popup.popup_type !== E_Popup.city) {
            this.node.removeChild(pre_popup.node);
        }

        let popup_city: PopupCity;

        if (pre_popup && pre_popup.popup_type == E_Popup.city) {
            popup_city = pre_popup.getComponent(PopupCity)
            popup_city.init(data);
            popup_city.show(false);

        } else {
            let city_popup = this.getPrefabObj(E_Popup.city);
            let node = cc.instantiate(city_popup);
            this.node.addChild(node);
            //
            popup_city = node.getComponent(PopupCity)
            popup_city.init(data);
            popup_city.show(true);
        }

        // Adding to pool
        this.popupPool.push(popup_city);
    }

    showStationPopup(data: IProperty) {
        let pre_popup = this.popupPool.pop();
        if (pre_popup && pre_popup.popup_type !== E_Popup.station) {
            this.node.removeChild(pre_popup.node);
        }

        let popup_station: PopupStation;

        if (pre_popup && pre_popup.popup_type == E_Popup.station) {
            popup_station = pre_popup.getComponent(PopupStation)
            popup_station.init(data);
            popup_station.show(false);

        } else {
            let station_popup = this.getPrefabObj(E_Popup.station);
            let node = cc.instantiate(station_popup);
            this.node.addChild(node);
            //
            popup_station = node.getComponent(PopupStation)
            popup_station.init(data);
            popup_station.show(true);
        }

        // Adding to pool
        this.popupPool.push(popup_station);
    }

    async hidepopup() {
        let pre_popup = this.popupPool.pop();
        if (pre_popup) {
            await pre_popup.hide();
            this.node.removeChild(pre_popup.node);
        }
    }

    getPrefabObj(type: E_Popup) {
        if (!this.prefabMap) {
            this.initMaps();
        }
        return this.prefabMap.get(type);
    }

    initMaps() {
        this.prefabMap = new Map<E_Popup, cc.Prefab>();
        this.popupPrefabs.forEach((obj, i) => {
            this.prefabMap.set(obj.type, obj.prefab);
        });
    }

}
