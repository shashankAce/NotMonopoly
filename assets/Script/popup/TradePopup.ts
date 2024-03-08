import BoardController from "../controller/BoardController";
import { clientEvent } from "../core/ClientEvent";
import { UIEvents } from "../core/EventNames";
import Property from "../core/Property";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TradePopup extends cc.Component {

    @property(cc.Slider)
    priceRange: cc.Slider = null;

    @property(cc.Layout)
    buyViewContent: cc.Layout = null;

    @property(cc.Layout)
    sellViewContent: cc.Layout = null;

    @property(cc.Prefab)
    prop_tab: cc.Prefab = null;

    @property(cc.Label)
    userBalanceLabel: cc.Label = null;

    @property(cc.Label)
    sellingPriceLabel: cc.Label = null;

    @property(cc.Label)
    buyingPriceLabel: cc.Label = null;

    @property(cc.Label)
    deductingPriceLabel: cc.Label = null;



    selectedProperties: Property[] = [];
    private available_bal = 0;
    private boardController: BoardController;

    protected onLoad(): void {
        // let gPlayer = this.boardController.gameEngine.players_arr[this.boardController.gameEngine.turnIndex];
        //   /  this.available_bal = gPlayer.balance;
        clientEvent.on(UIEvents.onPropSelect, this.onPropSelect, this);
        clientEvent.dispatchEvent(UIEvents.onPropSelect, this.onPropDeSelect, this);
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

    private onPropSelect(index) {
        this.selectedProperties.push()
    }

    private onPropDeSelect(index) {

    }

    onOfferTrade() {

    }

    onShowBoard() {

    }

    onCancelTrade() {

    }
}