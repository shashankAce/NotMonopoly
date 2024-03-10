import { IPlayerInfo, IProperty, config } from "../Config";
import BoardController from "../controller/BoardController";
import { clientEvent } from "../core/ClientEvent";
import { Events, UIEvents } from "../core/EventNames";
import { Locals } from "../core/Locals";
import Popup from "../core/Popup";
import Property from "../core/Property";
import Player from "../entity/Player";
import PropList from "./trade/PropList";

const { ccclass, property } = cc._decorator;

enum E_TRADE {
    NONE,
    SELL,
    BUY
}

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
    sendMoneyLabel: cc.Label = null;

    @property(cc.Label)
    askMoneyLabel: cc.Label = null;

    @property(cc.Node)
    sendMoneyHighlight: cc.Node = null;

    @property(cc.Node)
    askMoneyHighlight: cc.Node = null;

    @property(cc.Label)
    deductingPriceLabel: cc.Label = null;

    private sellPropPrice = 0;
    private buyPropPrice = 0;

    private sellingProp: IProperty[] = [];
    private buyingProp: IProperty[] = [];

    private boardController: BoardController;
    private tradeFrom: IPlayerInfo = null;
    private tradeTo: IPlayerInfo = null;
    private userBalance = 0;
    private tradeTypePick: E_TRADE = E_TRADE.NONE;

    protected onLoad(): void {
        // let gPlayer = this.boardController.gameEngine.players_arr[this.boardController.gameEngine.turnIndex];
        //   /  this.available_bal = gPlayer.balance;
    }

    initialize(options: { boardController: BoardController, data: IPlayerInfo }) {

        this.boardController = options.boardController;
        this.tradeTo = options.data;
        this.tradeFrom = this.boardController.getActivePlayer().data;

        this.header.string = this.tradeFrom.name;
        this.offeredTo.string = this.tradeTo.name;

        this.sendMoneyLabel.string = "0";
        this.askMoneyLabel.string = "0";

        this.userBalance = this.boardController.getActivePlayer().balance;
        this.userBalanceLabel.string = this.userBalance.toString();

        this.deductingPriceLabel.string = "0";

        this.sendMoneyHighlight.opacity = 0;
        this.askMoneyHighlight.opacity = 0;


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
                    prop_tab.init_prop(prop, this.onSellingPropSelect.bind(this));
                    prop_tab.toggle.uncheck();
                });
            }
            if (oppnentProp.length) {
                oppnentProp.forEach((prop, index) => {
                    const node = cc.instantiate(this.prop_tab);
                    const prop_tab: PropList = node.getComponent(PropList);
                    this.buyViewContent.node.addChild(node);
                    prop_tab.init_prop(prop, this.onBuyingPropSelect.bind(this));
                    prop_tab.toggle.uncheck();
                });
            }
        }
    }

    onSliderUpdate(param: cc.Slider) {
        if (this.tradeTypePick == E_TRADE.SELL) {

            this.sellPropPrice = Math.floor(this.userBalance * param.progress);
            this.askMoneyLabel.string = Locals.CURRENCY + ' ' + this.sellPropPrice.toString();

            this.deductingPriceLabel.string = "+" + Locals.CURRENCY + " " + this.sellPropPrice;
            this.deductingPriceLabel.node.color = cc.Color.GREEN;

        } else if (this.tradeTypePick == E_TRADE.BUY) {

            this.buyPropPrice = Math.floor(this.userBalance * param.progress);
            this.sendMoneyLabel.string = Locals.CURRENCY + ' ' + this.buyPropPrice.toString();

            this.deductingPriceLabel.string = "-" + Locals.CURRENCY + " " + this.buyPropPrice;
            this.deductingPriceLabel.node.color = cc.Color.RED;
        }
    }

    private setSliderProgress(tradePrice: number) {
        this.priceRange.progress = tradePrice / this.userBalance;
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

    private onSellingPropSelect(proplist: PropList, isChecked: boolean) {
        isChecked && this.sellingProp.push(proplist.data);
        if (!isChecked) {
            let ind = this.sellingProp.findIndex(value => value.index == proplist.data.index);
            this.sellingProp.splice(ind, 1);
        }

        this.sellPropPrice = 0;
        this.sellingProp.forEach(prop => {
            // this.sellPropPrice += prop.price * prop.build;
            this.sellPropPrice += prop.price;
        });
        this.askMoneyLabel.string = this.sellPropPrice.toString();

        if (this.sellingProp.length == 0) {
            // this.unselectAllTrade();
            if (this.tradeTypePick == E_TRADE.SELL) {
                this.setSliderProgress(0);
                this.deductingPriceLabel.string = "+" + Locals.CURRENCY + this.sellPropPrice;
                this.deductingPriceLabel.node.color = cc.Color.GREEN;
            }
        } else {
            if (this.tradeTypePick == E_TRADE.SELL) {
                this.setSliderProgress(this.sellPropPrice);
                this.deductingPriceLabel.string = "+" + Locals.CURRENCY + this.sellPropPrice;
                this.deductingPriceLabel.node.color = cc.Color.GREEN;
            }
        }
    }

    private onBuyingPropSelect(proplist: PropList, isChecked: boolean) {
        isChecked && this.buyingProp.push(proplist.data);
        if (!isChecked) {
            let ind = this.buyingProp.findIndex(value => value.index == proplist.data.index);
            this.buyingProp.splice(ind, 1);
        }
        this.buyPropPrice = 0;
        this.buyingProp.forEach(prop => {
            // this.buyPropPrice += prop.price * prop.build;
            this.buyPropPrice += prop.price;
        });
        this.sendMoneyLabel.string = this.buyPropPrice.toString();

        if (this.buyingProp.length == 0) {
            // this.unselectAllTrade();
            if (this.tradeTypePick == E_TRADE.BUY) {
                this.setSliderProgress(0);
                this.deductingPriceLabel.string = "-" + Locals.CURRENCY + this.buyPropPrice;
                this.deductingPriceLabel.node.color = cc.Color.RED;
            }
        } else {
            if (this.tradeTypePick == E_TRADE.BUY) {
                this.setSliderProgress(this.buyPropPrice);
                this.deductingPriceLabel.string = "-" + Locals.CURRENCY + this.buyPropPrice;
                this.deductingPriceLabel.node.color = cc.Color.RED;
            }
        }

    }

    onSendBtnClick() {
        if (this.buyingProp.length) {
            cc.Tween.stopAllByTarget(this.askMoneyHighlight);
            cc.Tween.stopAllByTarget(this.sendMoneyHighlight);

            this.askMoneyHighlight.opacity = 0;
            this.highlightNode(this.sendMoneyHighlight);

            this.setSliderProgress(this.buyPropPrice);
            this.tradeTypePick = E_TRADE.BUY;

            this.deductingPriceLabel.string = "-" + Locals.CURRENCY + this.buyPropPrice;
            this.deductingPriceLabel.node.color = cc.Color.RED;

        } else {
            clientEvent.dispatchEvent(Events.onToastMsg, Locals.TRADE_BUY_SELL_ERROR);
        }
    }

    onAskBtnClick() {
        if (this.sellingProp.length) {
            cc.Tween.stopAllByTarget(this.askMoneyHighlight);
            cc.Tween.stopAllByTarget(this.sendMoneyHighlight);

            this.sendMoneyHighlight.opacity = 0;
            this.highlightNode(this.askMoneyHighlight);

            this.setSliderProgress(this.sellPropPrice);
            this.tradeTypePick = E_TRADE.SELL;

            this.deductingPriceLabel.string = "-" + Locals.CURRENCY + this.sellPropPrice;
            this.deductingPriceLabel.node.color = cc.Color.RED;
        } else {
            clientEvent.dispatchEvent(Events.onToastMsg, Locals.TRADE_BUY_SELL_ERROR);
        }
    }

    unselectAllTrade() {
        cc.Tween.stopAllByTarget(this.askMoneyHighlight);
        cc.Tween.stopAllByTarget(this.sendMoneyHighlight);
        this.sendMoneyHighlight.opacity = 0;
        this.askMoneyHighlight.opacity = 0;
    }

    private highlightNode(node: cc.Node) {
        let tween = cc.tween(node)
            .to(0.2, { opacity: 0 })
            .to(0.2, { opacity: 255 });
        cc.tween(node).repeatForever(tween).start();
    }
}