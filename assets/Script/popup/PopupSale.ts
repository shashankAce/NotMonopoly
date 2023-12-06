// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { config } from "../Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSale extends cc.Component {

    @property(cc.Prefab)
    bidPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    stationPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cityPrefab: cc.Prefab = null;

    @property(cc.Node)
    header: cc.Node = null;

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


    protected onLoad(): void {
        for (let index = 0; index < 10; index++) {
            const element = cc.instantiate(this.bidPrefab);
            this.bidContentView.addChild(element);
        }
    }

    onSale(data) {
        this.sale_node.active = true;
        this.sale_buttons.active = true;
        this.auction_node.active = false;
        this.bought_node.active = false;
    }

    onAuction() {
        this.sale_node.active = false;
        this.auction_node.active = true;
        this.bought_node.active = false;
    }

    onBought() {
        this.sale_node.active = true;
        this.sale_buttons.active = false;
        this.auction_node.active = true;
        this.bought_node.active = true;
    }

    onBuyClick() {
        this.onBought();

    }

    onAuctionClick() {
        this.onAuction();

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
}
