import { IPlayerInfo, IProperty } from "../Config";
import BoardController from "../controller/BoardController";
import { clientEvent } from "../core/ClientEvent";
import { UIEvents } from "../core/EventNames";
import Popup from "../core/Popup";
import Property from "../core/Property";
import Player from "../entity/Player";
import PropList from "./trade/PropList";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TradePopup extends Popup {

    @property(cc.Node)
    container: cc.Node = null;

    @property(cc.Slider)
    priceRange: cc.Slider = null;

    @property(cc.Layout)
    buyViewContent: cc.Layout = null;

    @property(cc.Layout)
    sellViewContent: cc.Layout = null;

    @property(cc.Prefab)
    prop_tab: cc.Prefab = null;

    @property(cc.Label)
    header: cc.Label = null;

    @property(cc.Label)
    offeredTo: cc.Label = null;

    @property(cc.Label)
    userBalanceLabel: cc.Label = null;

    @property(cc.Label)
    sellingPriceLabel: cc.Label = null;

    @property(cc.Label)
    buyingPriceLabel: cc.Label = null;

    @property(cc.Label)
    deductingPriceLabel: cc.Label = null;

    selectedProperties: IProperty[] = [];

    private boardController: BoardController;
    private tradeFrom: IPlayerInfo = null;
    private tradeTo: IPlayerInfo = null;
    private opponentIndex = 0;

    protected onLoad(): void {
        // let gPlayer = this.boardController.gameEngine.players_arr[this.boardController.gameEngine.turnIndex];
        //   /  this.available_bal = gPlayer.balance;
        clientEvent.on(UIEvents.onPropSelect, this.onPropSelect, this);
        clientEvent.dispatchEvent(UIEvents.onPropSelect, this.onPropDeSelect, this);
    }

    initialize(options) {
        
        this.boardController = options.boardController;
        this.tradeTo = options.data;
        this.tradeFrom = this.boardController.getActivePlayer().data;

        this.header.string = this.tradeFrom.name;
        this.offeredTo.string = this.tradeTo.name;

        this.userBalanceLabel.string = this.boardController.getActivePlayer().balance.toString();

        let playerProp: Property[] = [];
        let oppnentProp: Property[] = [];

        this.sellViewContent.node.removeAllChildren();
        this.buyViewContent.node.removeAllChildren();

        this.boardController.property_map.forEach((property, index) => {
            if (property.isSold) {
                if (property.soldTo.playerId == this.tradeFrom.id) {
                    playerProp.push(property);
                } else if (property.soldTo.playerId == this.tradeTo.id) {
                    oppnentProp.push(property);
                }
            }
        });

        if (playerProp.length || oppnentProp.length) {
            if (playerProp.length) {
                playerProp.forEach((prop, index) => {
                    const node = cc.instantiate(this.prop_tab);
                    const prop_tab: PropList = node.getComponent(PropList);
                    this.sellViewContent.node.addChild(node);
                    prop_tab.init_prop(prop);
                });
            }
            if (oppnentProp.length) {
                oppnentProp.forEach((prop, index) => {
                    const node = cc.instantiate(this.prop_tab);
                    const prop_tab: PropList = node.getComponent(PropList);
                    this.buyViewContent.node.addChild(node);
                    prop_tab.init_prop(prop);
                });
            }
        }
    }

    onSliderUpdate(param: cc.Slider) {
        cc.log(param.progress);

        // let value = this.available_bal * param.progress;
        // this.sale_price = Math.floor(value);
        // this.sale_price_label.string = 'For ' + config.currency + ' ' + this.sale_price.toString();
    }

    setSliderProgress(tradePrice: number, totalbalance: number) {
        this.priceRange.progress = tradePrice / totalbalance;
    }

    private onPropSelect(prop_tab: PropList) {
        this.selectedProperties.push(prop_tab.data);
    }

    private onPropDeSelect(prop_tab: PropList) {

    }

    onOfferTrade() {
        clientEvent.dispatchEvent(UIEvents.onUserTrade, null);
    }

    onShowBoard() {
        let tweenOpacity = 50;
        if (this.container.opacity > tweenOpacity && this.container.opacity < 255) {
            return;
        }
        if (this.container.opacity < 255) {
            tweenOpacity = 255;
        }
        cc.tween(this.container)
            .to(0.2, { opacity: tweenOpacity })
            .call(() => {
                this.container.opacity = tweenOpacity;
            })
            .start();
    }

    onCancelTrade() {
        this.hide();
    }
}