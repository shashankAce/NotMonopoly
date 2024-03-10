import { IPlayerInfo, IProperty } from "../Config";
import Popup from "../core/Popup";
import PopupCity from "../popup/PopupCity";
import PopupRent from "../popup/PopupRent";
import PopupSale from "../popup/PopupSale";
import PopupStation from "../popup/PopupStation";
import TradePopup from "../popup/TradePopup";
import BoardController from "./BoardController";

const { ccclass, property } = cc._decorator;

export enum E_Popup {
    city,
    station,
    sale,
    jail,
    rent,
    loan,
    deal,
    build,
    mortgage,
    redeem,
    trade,
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

    public getCurrentPopup() {
        return this.popupPool[0];
    }

    protected onLoad(): void {
        this.transparent_layer.opacity = 0;
    }

    showBuildPopup() {

    }

    showTradePopup(options: { boardController: BoardController, data: IPlayerInfo }) {
        let pre_popup = this.popupPool.pop();
        if (pre_popup)
            this.node.removeChild(pre_popup.node);

        let prefab = this.getPrefabObj(E_Popup.trade);
        let node = cc.instantiate(prefab);
        this.node.addChild(node);
        //
        let trade_class = node.getComponent(TradePopup);
        trade_class.initialize(options);
        this.popupPool.push(trade_class);
    }

    showSalePopup(data, isBidActive: boolean) {

        let pre_popup = this.popupPool.pop();
        if (pre_popup)
            this.node.removeChild(pre_popup.node);

        let prefab = this.getPrefabObj(E_Popup.sale);
        let node = cc.instantiate(prefab);
        this.node.addChild(node);
        //
        let node_sale = node.getComponent(PopupSale);
        node_sale.setUIOnSale(data);
        this.popupPool.push(node_sale);

        if (isBidActive) {
            node_sale.onAuctionClick();
        }
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

    showRentPaidPopup(user1, user2, rent) {
        let pre_popup = this.popupPool.pop();
        if (pre_popup && pre_popup.popup_type !== E_Popup.station) {
            this.node.removeChild(pre_popup.node);
        }
        //
        let popup_rent: PopupRent;
        let rent_popup = this.getPrefabObj(E_Popup.rent);
        let node = cc.instantiate(rent_popup);
        this.node.addChild(node);
        //
        popup_rent = node.getComponent(PopupRent)
        popup_rent.init(user1, user2, rent);
        this.popupPool.push(popup_rent);
        this.scheduleOnce(() => {
            cc.log("hide called");
            this.hidepopup();
        }, 1);
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
