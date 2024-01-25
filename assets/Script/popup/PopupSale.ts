
import { E_PROPERTY_TYPE, IProperty, config } from "../Config";
import { clientEvent } from "../core/ClientEvent";
import { Events, UIEvents } from "../core/EventNames";
import { Locals } from "../core/Locals";
import Popup from "../core/Popup";
import PopupCity from "./PopupCity";
import PopupStation from "./PopupStation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSale extends Popup {

    @property(cc.Prefab)
    bidPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    stationPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cityPrefab: cc.Prefab = null;

    @property(cc.Label)
    header: cc.Label = null;

    @property(cc.Node)
    salePrefabNode: cc.Node = null;

    @property(cc.Node)
    sale_node: cc.Node = null;

    @property(cc.Label)
    sale_price_label: cc.Label = null;

    @property(cc.Label)
    bid_price_label: cc.Label = null;

    @property(cc.Node)
    auction_node: cc.Node = null;

    @property(cc.Node)
    sale_buttons: cc.Node = null;

    @property(cc.Node)
    bought_node: cc.Node = null;

    @property(cc.ScrollView)
    bidScrollView: cc.ScrollView = null;

    @property(cc.Node)
    bidContentView: cc.Node = null;


    private sale_price = 0;
    private available_bal = 0;

    private isEasing = false;

    protected onLoad(): void {
        for (let index = 0; index < 10; index++) {
            const element = cc.instantiate(this.bidPrefab);
            this.bidContentView.addChild(element);
        }
    }

    onSale(data: IProperty) {
        this.sale_node.active = true;
        this.sale_buttons.active = true;
        this.auction_node.active = false;
        this.bought_node.active = false;
        this.salePrefabNode.removeAllChildren();

        this.header.string = Locals.SALE;

        if (data.type == E_PROPERTY_TYPE.CITY) {
            let city_node = cc.instantiate(this.cityPrefab);
            this.salePrefabNode.addChild(city_node);
            let popup_city = city_node.getComponent(PopupCity)
            popup_city.init(data);
            popup_city.show(false);

        } else if (data.type == E_PROPERTY_TYPE.STATION) {
            let station_node = cc.instantiate(this.stationPrefab);
            this.salePrefabNode.addChild(station_node);
            let popup_station = station_node.getComponent(PopupStation)
            popup_station.init(data);
            popup_station.show(false);
        }
    }

    private onAuction() {
        this.sale_node.active = false;
        this.auction_node.active = true;
        this.bought_node.active = false;
    }

    private onBuy() {
        this.sale_node.active = true;
        this.sale_buttons.active = false;
        this.auction_node.active = true;
        this.bought_node.active = true;
    }

    onBuyClick() {
        if (this.isEasing)
            return;
        this.isEasing = true;
        this.onBuy();
        clientEvent.dispatchEvent(UIEvents.onBuyClick);
    }

    onAuctionClick() {
        if (this.isEasing)
            return;
        this.isEasing = true;
        this.onAuction();
        // clientEvent.dispatchEvent(UIEvents.onAuction);
    }

    onBidClick() {

    }

    onBidListener(user) {

    }

    onSliderUpdate(param: cc.Slider) {
        console.log(param.progress);
        let value = this.available_bal * param.progress;
        this.sale_price_label.string = 'For ' + config.currency + ' ' + value.toString();
    }

    async hide() {
        this.isEasing = false;
        return super.hide();
    }
}
