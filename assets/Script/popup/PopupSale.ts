
import { E_PROPERTY_TYPE, IProperty, config } from "../Config";
import BoardController from "../controller/BoardController";
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

    @property(cc.Node)
    auction_node: cc.Node = null;

    @property(cc.Node)
    auctionPrefabNode: cc.Node = null;

    @property(cc.Node)
    sale_buttons: cc.Node = null;

    @property(cc.Node)
    bought_node: cc.Node = null;

    @property(cc.Label)
    biderName: cc.Label = null;

    @property(cc.Label)
    bid_price_label: cc.Label = null;

    @property(cc.ScrollView)
    bidScrollView: cc.ScrollView = null;

    @property(cc.Node)
    bidContentView: cc.Node = null;

    @property(cc.Slider)
    priceRange: cc.Slider = null;

    private sale_price = 0;
    private available_bal = 0;

    private isEasing = false;
    private propertyNode: cc.Node = null;

    private boardController: BoardController;
    private propertyData: IProperty;

    protected onLoad(): void {
        for (let index = 0; index < 10; index++) {
            const element = cc.instantiate(this.bidPrefab);
            this.bidContentView.addChild(element);
        }
        clientEvent.on(Events.onBid, this.onBidListener);
    }

    onBigListener(data) {
        cc.log(data);
    }

    onSale(data) {

        this.boardController = data.boardController;
        this.propertyData = data.property;

        this.sale_node.active = true;
        this.sale_buttons.active = true;
        this.auction_node.active = false;
        this.bought_node.active = false;
        this.salePrefabNode.removeAllChildren();

        this.header.string = Locals.SALE;

        if (data.property.type == E_PROPERTY_TYPE.CITY) {
            this.propertyNode = cc.instantiate(this.cityPrefab);
            this.salePrefabNode.addChild(this.propertyNode);
            let popup_city = this.propertyNode.getComponent(PopupCity);
            popup_city.init(data.property);
            popup_city.show(false);

        } else if (data.property.type == E_PROPERTY_TYPE.STATION) {
            this.propertyNode = cc.instantiate(this.stationPrefab);
            this.salePrefabNode.addChild(this.propertyNode);
            let popup_station = this.propertyNode.getComponent(PopupStation);
            popup_station.init(data.property);
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
        this.auctionPrefabNode.removeAllChildren();
        this.propertyNode.parent = this.auctionPrefabNode;
        this.onAuction();

        let turnIndex = this.boardController.gameEngine.turnIndex;
        let gPlayer = this.boardController.gameEngine.players_arr[turnIndex];

        this.biderName.string = this.getTrucName(gPlayer.name) + ' bidding';
        this.bidContentView.removeAllChildren(true);

        this.available_bal = gPlayer.balance;
        this.priceRange.progress = this.propertyData.price / gPlayer.balance;

        this.sale_price = this.propertyData.price;
        this.sale_price_label.string = this.sale_price.toString();
    }

    onBidClick() {
        this.priceRange.enabled = false;

        let turnIndex = this.boardController.gameEngine.turnIndex;
        let gPlayer = this.boardController.gameEngine.players_arr[turnIndex];
        let name = this.getTrucName(gPlayer.name);

        let bidNode = cc.instantiate(this.bidPrefab);
        bidNode.children[0].getComponent(cc.Label).string = name + " " + this.sale_price;
        this.bidContentView.addChild(bidNode);
        this.bidContentView.getComponent(cc.Layout).updateLayout();
        clientEvent.dispatchEvent(UIEvents.onUserBid, this.sale_price);
    }

    onBidListener(user) {

    }

    onFold(){
        clientEvent.dispatchEvent(UIEvents.onUserBid, this.sale_price);
    }

    onSliderUpdate(param: cc.Slider) {
        console.log(param.progress);
        let value = this.available_bal * param.progress;
        this.sale_price = Math.floor(value);
        this.sale_price_label.string = 'For ' + config.currency + ' ' + this.sale_price.toString();
    }

    async hide() {
        this.isEasing = false;
        return super.hide();
    }

    getTrucName(name: string) {
        let tmp = '';
        if (name.length > 10) {
            tmp = name.substring(0, 10);
            tmp += '..';
        }
        return tmp;
    }
}
