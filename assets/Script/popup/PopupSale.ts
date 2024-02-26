
import { E_PROPERTY_TYPE, GAME_MODE, IProperty, config } from "../Config";
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
    selling_price: cc.Label = null;

    @property(cc.Label)
    buying_player_name: cc.Label = null;

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

    @property(cc.Button)
    bidButton: cc.Button = null;

    @property(cc.Button)
    foldButton: cc.Button = null;

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
        clientEvent.on(Events.onBid, this.onBidListener, this);
        clientEvent.on(Events.onBidTurnChange, this.onBidTurnChange, this);
    }

    onBigListener(data) {
        cc.log(data);
    }

    public setUIOnSale(data) {

        this.boardController = data.boardController;
        this.propertyData = data.property;

        this.sale_node.active = true;
        this.sale_buttons.active = true;
        this.sale_price_label.node.parent.active = true;
        this.auction_node.active = false;
        this.bought_node.active = false;
        this.salePrefabNode.removeAllChildren();

        this.header.string = Locals.SALE;
        this.sale_price_label.string = 'For ' + config.currency + ' ' + this.propertyData.price.toString();


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

    private setUIOnAuction() {
        this.sale_node.active = false;
        this.sale_price_label.node.parent.active = true;
        this.auction_node.active = true;
        this.bought_node.active = false;
    }

    private setUIOnBuy() {
        this.sale_node.active = true;
        this.propertyNode.parent = this.salePrefabNode;
        this.header.string = Locals.BOUGTH;
        this.bought_node.active = true;
        this.sale_price_label.node.parent.active = false;
        this.sale_buttons.active = false;
        this.auction_node.active = false;
    }

    onBuyPropertyListener() {

        this.setUIOnBuy();

        let amount = this.propertyData.price;
        if (this.boardController.gameEngine.isBidActive) {
            amount = this.boardController.gameEngine.bidAmount;
        }

        let turnIndex = this.boardController.gameEngine.turnIndex;
        let gPlayer = this.boardController.gameEngine.players_arr[turnIndex];
        let property = this.boardController.gameEngine.property_map.get(gPlayer.pawnPosition.toString());
        this.buying_player_name.string = property.soldTo.name;

        // this.sale_price_label.string = 'For ' + config.currency + ' ' + amount.toString();
        this.selling_price.node.parent.getComponent(cc.Animation).play('appear');
        this.selling_price.string = config.currency + ' ' + amount.toString();

        this.boardController.updatePlayersBalance();
    }

    onBuyClick() {
        if (this.isEasing)
            return;
        this.isEasing = true;
        this.setUIOnBuy();
        clientEvent.dispatchEvent(UIEvents.onBuyClick);
    }

    onAuctionClick() {
        if (this.isEasing)
            return;
        this.isEasing = true;
        this.auctionPrefabNode.removeAllChildren();
        this.propertyNode.parent = this.auctionPrefabNode;
        this.setUIOnAuction();

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
        this.freezeBidLayout(true);
        clientEvent.dispatchEvent(UIEvents.onUserBid, this.sale_price);
    }

    private onBidTurnChange() {

        let biddingPlayer = this.getBiddingPlayer();
        this.biderName.string = this.getTrucName(biddingPlayer.name) + ' bidding';

        let gPlayer = this.getBiddingPlayer();
        this.available_bal = gPlayer.balance;
        this.priceRange.progress = (this.boardController.gameEngine.bidAmount + 1) / gPlayer.balance;

        let value = this.available_bal * this.priceRange.progress;
        this.sale_price = Math.floor(value);
        this.sale_price_label.string = 'For ' + config.currency + ' ' + this.sale_price.toString();

        if (this.boardController.gameEngine.gameMode == GAME_MODE.ONLINE_MULTIPLAYER) {
            this.freezeBidLayout(true);
        } else if (this.boardController.gameEngine.gameMode == GAME_MODE.LOCAL_MULTIPLAYER) {
            this.freezeBidLayout(false);
        } else if (this.boardController.gameEngine.gameMode == GAME_MODE.SINGLE) {
            this.freezeBidLayout(true);
        }

        if (biddingPlayer.playerId == this.boardController.myId) {
            this.freezeBidLayout(false);
        }
    }

    private freezeBidLayout(forSure: boolean) {
        this.bidButton.interactable = !forSure;
        this.foldButton.interactable = !forSure;
        this.priceRange.enabled = !forSure;
    }

    private onBidListener() {
        // add a row in bid layout
        let bidTurn = this.boardController.gameEngine.bidTurn;
        let gPlayer = this.boardController.gameEngine.players_arr[bidTurn];
        let name = this.getTrucName(gPlayer.name);

        let bidRow = cc.instantiate(this.bidPrefab);
        bidRow.children[0].getComponent(cc.Label).string = name + " " + config.currency + this.sale_price;
        this.bidContentView.addChild(bidRow);
        this.bidContentView.getComponent(cc.Layout).updateLayout();

        this.bidScrollView.scrollToBottom(0.2);
    }

    onFold() {
        clientEvent.dispatchEvent(UIEvents.onUserFold, this.sale_price);
    }

    onSliderUpdate(param: cc.Slider) {
        // cc.log(param.progress);
        let value = this.available_bal * param.progress;
        this.sale_price = Math.floor(value);
        this.sale_price_label.string = 'For ' + config.currency + ' ' + this.sale_price.toString();
    }

    private getBiddingPlayer() {
        return this.boardController.gameEngine.players_arr[this.boardController.gameEngine.bidTurn];
    }

    async hide() {
        this.isEasing = false;
        return super.hide();
    }

    getTrucName(name: string) {
        let tmp = name;
        if (name.length > 10) {
            tmp = name.substring(0, 10);
            tmp += '..';
        }
        return tmp;
    }
}
