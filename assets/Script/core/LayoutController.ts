
import CheatController from "../CheatController";
import { BUTTON_ID, BUTTON_STATE, IConfig, IProperty, tilePos } from "../Config";
import PopupController from "../controller/PopupController";
import { clientEvent } from "../core/ClientEvent";
import City from "../entity/City";
import Corner from "../entity/Corner";
import Dice from "../entity/Dice";
import Player from "../entity/Player";
import Station from "../entity/Station";
import { Events, HUDEvents } from "./EventNames";
import Property from "./Property";

const DicePos = [-610, 610];

const { ccclass, property } = cc._decorator;

@ccclass('ButtonObject')
export class ButtonObject {

    @property({
        type: cc.Enum(BUTTON_ID)
    })
    name: BUTTON_ID = BUTTON_ID.MENU;

    @property(cc.Node)
    button: cc.Node = null;

    isEnabled = false;
}

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

    @property(cc.Node)
    highlight_layer: cc.Node = null;

    @property(PopupController)
    popupController: PopupController = null;

    @property(CheatController)
    cheatController: CheatController = null;

    protected boardData: IConfig;

    protected player_array: Player[] = [];
    protected dice_array: Dice[] = [];
    // protected propertyArr: Property[] = [];
    protected propertyData: IProperty[] = [];

    public property_map: Map<string, Property>;

    @property(ButtonObject)
    hudButtons: ButtonObject[] = [];

    public state: BUTTON_STATE = BUTTON_STATE.CLOSED;
    start() {

        // cc.assetManager.loadRemote(Config.gameCfgUrl, {type: 'png'}, function () {
        //     // Use texture to create sprite frame
        // });

        // cc.resources.load('cityConfig', (err, jsonAsset) => {
        //     this.boardData = jsonAsset.json;
        //     this.createCities(jsonAsset.json);
        // });

        this.property_map = new Map<string, Property>();
        cc.resources.load('cityConfig', (err, jsonAsset: cc.JsonAsset) => {
            this.createBoard(jsonAsset);
        });
    }

    protected createBoard(jsonAsset: cc.JsonAsset) {
        this.boardData = jsonAsset.json;
        this.drawCities(jsonAsset.json);
        this.drawCorners(jsonAsset.json);
        this.drawStations(jsonAsset.json);
        // this.drawPropertyIndex();
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

    protected drawPropertyIndex() {
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
        let city_class: City;
        let data: IProperty;
        for (let index = 0; index < json.cities.length; index++) {

            data = json.cities[index];

            let side = Math.floor(data.index / sideTiles);
            let pos = new cc.Vec2(tilePos[data.index].x, tilePos[data.index].y);

            let rotation = 0;
            if (side == 1 || side == 3) {
                rotation = 90;
            }

            city_class = cc.instantiate(this.city).getComponent(City);
            city_class.node.setPosition(new cc.Vec2(pos.x, pos.y));
            city_class.node.angle = rotation;
            city_class.init(data);
            city_class.setSide(side);
            this.city_layer.addChild(city_class.node);
            ///
            this.property_map.set(data.index.toString(), city_class);
            this.propertyData.push(data);
        }
    }

    protected drawStations(json: IConfig) {

        let sideTiles = 10;
        let station_class: Station;
        let data: IProperty;
        for (let index = 0; index < json.station.length; index++) {

            data = json.station[index];

            let side = Math.floor(data.index / sideTiles);
            let pos = new cc.Vec2(tilePos[data.index].x, tilePos[data.index].y);

            let rotation = 0;
            if (side == 1 || side == 3) {
                rotation = 90;
            }

            station_class = cc.instantiate(this.station).getComponent(Station);
            station_class.node.setPosition(new cc.Vec2(pos.x, pos.y));
            station_class.node.angle = rotation;
            station_class.init(data);
            station_class.setSide(side);
            this.city_layer.addChild(station_class.node);
            ///
            this.property_map.set(data.index.toString(), station_class);
            this.propertyData.push(data);
        }
    }

    protected drawCorners(json: IConfig) {

        let corner_class: Corner;
        let data: IProperty;
        for (let index = 0; index < json.corner.length; index++) {

            data = json.corner[index];
            let pos = new cc.Vec2(tilePos[data.index].x, tilePos[data.index].y);
            let rotation = 0;

            corner_class = cc.instantiate(this.corner).getComponent(Corner);
            corner_class.node.setPosition(new cc.Vec2(pos.x, pos.y));
            corner_class.node.angle = rotation;
            corner_class.init(data);
            this.city_layer.addChild(corner_class.node);
            ///
            this.property_map.set(data.index.toString(), corner_class);
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

    protected getLocalPlayerById(id: string) {
        return this.player_array.find((player) => player.playerId == id);
    }

    disableHudButtons(bool: boolean) {
        this.hudButtons.forEach(element => {
            if (!element.isEnabled) {
                element.button.getComponent(cc.Button).interactable = !bool;
            }
        });
    }
}