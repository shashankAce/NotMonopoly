
import { IConfig, IProperty, tilePos } from "../Config";
import PopupController from "../controller/PopupController";
import { clientEvent } from "../core/ClientEvent";
import City from "../entity/City";
import Corner from "../entity/Corner";
import Dice from "../entity/Dice";
import Player from "../entity/Player";
import Station from "../entity/Station";
import { Events } from "./EventNames";
import Property from "./Property";

const DicePos = [-610, 610];

const { ccclass, property } = cc._decorator;

@ccclass
export default class LayoutController extends cc.Component {

    @property(cc.Prefab)
    city: cc.Prefab = null;

    @property(cc.Prefab)
    station: cc.Prefab = null;

    @property(cc.Prefab)
    corner: cc.Prefab = null;

    @property(cc.Prefab)
    pawn: cc.Prefab = null;

    @property(cc.Prefab)
    userTab: cc.Prefab = null;

    @property(cc.Prefab)
    dice_tab: cc.Prefab = null;

    @property(cc.Prefab)
    salePopup: cc.Prefab = null;

    @property(cc.Prefab)
    jailPopup: cc.Prefab = null;

    @property(cc.Prefab)
    paidRent: cc.Prefab = null;

    @property(cc.Prefab)
    loanPopup: cc.Prefab = null;

    @property(cc.Node)
    city_layer: cc.Node = null;

    @property(PopupController)
    popupController: PopupController = null;

    protected boardData: IConfig;

    protected player_array: Player[] = [];
    protected dice_array: Dice[] = [];
    protected propertyArr: Property[] = [];
    protected propertyData: IProperty[] = [];

    start() {

        // cc.assetManager.loadRemote(Config.gameCfgUrl, {type: 'png'}, function () {
        //     // Use texture to create sprite frame
        // });

        // cc.resources.load('cityConfig', (err, jsonAsset) => {
        //     this.boardData = jsonAsset.json;
        //     this.createCities(jsonAsset.json);
        // });

        cc.resources.load('cityConfig', (err, jsonAsset: cc.JsonAsset) => {
            this.createBoard(jsonAsset);
        });
    }

    protected createBoard(jsonAsset: cc.JsonAsset) {
        this.boardData = jsonAsset.json;
        this.drawCities(jsonAsset.json);
        this.drawCorners(jsonAsset.json);
        this.drawStations(jsonAsset.json);
        this.drawIndex();
    }

    protected createDice() {
        for (let index = 0; index < 2; index++) {
            const element = cc.instantiate(this.dice_tab);
            this.node.addChild(element);
            element.setPosition(cc.v2(0, DicePos[index]));
            this.dice_array.push(element.getComponent(Dice));
            this.dice_array[index].setActive(false);
        }
    }

    protected drawIndex() {
        for (let index = 0; index < tilePos.length; index++) {
            let pos = new cc.Vec2(tilePos[index].x, tilePos[index].y);

            let ind_node = new cc.Node();
            ind_node.addComponent(cc.Label).string = (index).toString();
            ind_node.getComponent(cc.Label).fontSize = 50;
            ind_node.setPosition(new cc.Vec2(pos.x, pos.y));
            ind_node.color = cc.Color.RED;

            this.city_layer.addChild(ind_node);
        }
    }

    protected drawCities(json: IConfig) {

        let sideTiles = 10;
        let city_node: City;
        let data: IProperty;
        for (let index = 0; index < json.cities.length; index++) {

            data = json.cities[index];

            let side = Math.floor(data.index / sideTiles);
            let pos = new cc.Vec2(tilePos[data.index].x, tilePos[data.index].y);

            let rotation = 0;
            if (side == 1 || side == 3) {
                rotation = 90;
            }

            city_node = cc.instantiate(this.city).getComponent(City);
            city_node.node.setPosition(new cc.Vec2(pos.x, pos.y));
            city_node.node.angle = rotation;
            city_node.init(data);
            this.city_layer.addChild(city_node.node);
            this.propertyArr.push(city_node);
            this.propertyData.push(data);
        }
    }

    protected drawStations(json: IConfig) {

        let sideTiles = 10;
        let city_node: Station;
        let data: IProperty;
        for (let index = 0; index < json.station.length; index++) {

            data = json.station[index];

            let side = Math.floor(data.index / sideTiles);
            let pos = new cc.Vec2(tilePos[data.index].x, tilePos[data.index].y);

            let rotation = 0;
            if (side == 1 || side == 3) {
                rotation = 90;
            }

            city_node = cc.instantiate(this.station).getComponent(Station);
            city_node.node.setPosition(new cc.Vec2(pos.x, pos.y));
            city_node.node.angle = rotation;
            city_node.init(data);
            this.city_layer.addChild(city_node.node);
            this.propertyArr.push(city_node);
            this.propertyData.push(data);
        }
    }

    protected drawCorners(json: IConfig) {

        let city_node: Corner;
        let data: IProperty;
        for (let index = 0; index < json.corner.length; index++) {

            data = json.corner[index];
            let pos = new cc.Vec2(tilePos[data.index].x, tilePos[data.index].y);
            let rotation = 0;

            city_node = cc.instantiate(this.corner).getComponent(Corner);
            city_node.node.setPosition(new cc.Vec2(pos.x, pos.y));
            city_node.node.angle = rotation;
            city_node.init(data);
            this.city_layer.addChild(city_node.node);
            this.propertyArr.push(city_node);
            this.propertyData.push(data);
        }
    }

    protected hidePopup() {
        this.popupController.hidepopup();
    }

    protected showStationInfo(data) {
        console.log(data);
        this.popupController.showStationPopup(data);
    }

    protected showCityInfo(data) {
        console.log(data);
        this.popupController.showCityPopup(data);
    }
}