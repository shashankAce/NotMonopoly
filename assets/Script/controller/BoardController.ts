

import { IPlayerInfo } from "../Config";
import Pawn from "../Pawn";
import { clientEvent } from "../core/ClientEvent";
import { Events, UIEvents } from "../core/EventNames";
import GameEngine from "../core/engine/GameEngine";
import { GameEvents } from "../core/GameEvents";
import LayoutController from "../core/LayoutController";
import Player from "../entity/Player";
import UserTab from "../entity/UserTab";
import Socket from "../socket/Socket";
import { E_Popup } from "./PopupController";
import GPlayer from "../core/engine/GPlayer";
import PopupSale from "../popup/PopupSale";
import GProperty from "../core/engine/GProperty";
const { ccclass } = cc._decorator;

@ccclass
export default class BoardController extends LayoutController implements GameEvents {
    onMoveEnd: Function;
    onGo: Function;
    onRollDouble: Function;
    onUseCard: Function;
    onMortgageProperty: Function;
    onBid: Function;
    onDealProperty: Function;
    onSellProperty: Function;
    onRentPaid: Function;
    onRendReceived: Function;
    onDiceSpin: Function;
    onSentToJail: Function;
    onTakeLoan: Function;
    onMove: Function;
    onChance: Function;
    onCourt: Function;
    myId: string;
    gameEngine: GameEngine
    socketController: Socket;

    protected onLoad(): void {
        this.gameEngine = new GameEngine();
    }

    protected createBoard(jsonAsset: cc.JsonAsset): void {
        super.createBoard(jsonAsset);

        this.registerEvents();
        this.createDice();

        let players = this.getDummyPlayers();
        // TODO: remove getDummyPlayers fn later when real player work is done
        // this.gameEngine.initialize(this.player_array, this.propertyArr);
        this.gameEngine.initialize(players, this.propertyData);
        this.gameEngine.startGame();
    }

    onTurnChange(turnIndex: number) {
        if (!this.gameEngine.isBidActive) {
            this.dice_array[this.getTurnIndex()].setActive(true);
        }
        // TODO: set clicking enabled for only active player
    }

    onBidTurnChange(turnIndex: number) {
        // TODO: display bid turn on bid popup
    }

    private async onSpinDice() {
        let index = Math.floor(this.getTurnIndex() / (this.player_array.length - 1));
        let gPlayer = this.gameEngine.players_arr[this.gameEngine.turnIndex];
        let diceArr = gPlayer.diceValue;

        await this.dice_array[index].spin(diceArr);
        await this.player_array[index].pawn.moveTo(diceArr[0] + diceArr[1]);
        this.arrangePawns();
        clientEvent.dispatchEvent(UIEvents.onMoveEnd);

        // await this.buyProperty();
        // this.turnOver();
    }

    private getActivePlayer() {
        return this.gameEngine.players_arr[this.gameEngine.turnIndex];
    }
    private getTurnIndex() {
        return this.gameEngine.turnIndex;
    }

    private arrangePawns() {

        const positionMap = new Map<string, Player[]>();
        this.player_array.forEach((player) => {
            const positionKey = `${player.pawn.tilePos}`;
            if (!positionMap.has(positionKey)) {
                positionMap.set(positionKey, []);
            }
            positionMap.get(positionKey)!.push(player);
        });

        let distance_bet = 30;
        positionMap.forEach((players_arr) => {

            if (players_arr.length > 1) {

                let index = 0;
                let total_dist = distance_bet * (players_arr.length - 1);
                let negative_dist = -total_dist / 2;

                players_arr.forEach((player) => {
                    let side = Math.floor(player.pawn.tilePos / 9);
                    if (side == 0 || side == 2) {
                        player.pawn.node.x += (negative_dist + distance_bet * index);
                    } else {
                        player.pawn.node.y += (negative_dist + distance_bet * index);
                    }
                    index++;
                });
            } else {
                players_arr[0].pawn.resetPosition();
            }
        });
    }

    private turnOver() {
        clientEvent.dispatchEvent(Events.turnOver);
    }

    private createPlayers(pDataArr: GPlayer[]) {

        pDataArr.forEach((pData, index) => {
            // Creating players
            let player = new Player();
            player.init(pData);
            this.player_array.push(player);

            // Adding player tab icon
            let tab = cc.instantiate(this.userTab);
            player.tab = tab.getComponent(UserTab);
            this.node.addChild(tab);
            player.tab.init(pData.name, pData.balance, player);

            // Adding pawn to each player
            let pawn = cc.instantiate(this.pawn);
            player.pawn = pawn.getComponent(Pawn);
            this.node.addChild(pawn);
            player.pawn.setColor(player.color);
            player.pawn.init();
        });

        this.arrangePawns();
    }

    protected registerEvents(): void {
        // Local Events
        clientEvent.on(UIEvents.ShowStationInfo, this.showStationInfo, this);
        clientEvent.on(UIEvents.ShowCityInfo, this.showCityInfo, this);
        clientEvent.on(UIEvents.HidePopup, this.hidePopup, this);
        // Local Events
        clientEvent.on(Events.onTurnChange, this.onTurnChange, this);
        clientEvent.on(Events.onBidTurnChange, this.onTurnChange, this);
        clientEvent.on(Events.onAddPlayers, this.createPlayers, this);
        clientEvent.on(Events.spinDice, this.onSpinDice, this);
        clientEvent.on(Events.ShowBuyProperty, this.onShowBuyPropertyPopup, this);
        clientEvent.on(Events.onBuyProperty, this.onBuyProperty, this);
        clientEvent.on(Events.onBidActive, this.onBidProperty, this);
    }

    private onShowBuyPropertyPopup(property: GProperty) {
        let data = {
            property: property.data,
            boardController: this,
        }
        this.popupController.showSalePopup(data, false);
    }

    onBuyProperty() {
        let gPlayer = this.gameEngine.players_arr[this.gameEngine.turnIndex];
        // this.player_array[this.getTurnIndex()].tab
        // this.popupController.hidepopup();
    }

    onBidProperty(property: GProperty) {
        let gPlayer = this.gameEngine.players_arr[this.gameEngine.turnIndex];
        if (gPlayer.id != this.myId) {
            let data = {
                property: property.data,
                boardController: this,
            }
            this.popupController.showSalePopup(data, true);
        }
    }

    getDummyPlayers() {
        let playerData = [
            {
                name: "Anshu",
                id: "siofho",
                profileUrl: "www.google.com",
                isBot: false,
                balance: 1500
            },
            {
                name: "Mini",
                id: "asdfhj",
                profileUrl: "www.google.com",
                isBot: false,
                balance: 800
            },
            {
                name: "Ashley",
                id: "0o9ytrd",
                profileUrl: "www.google.com",
                isBot: false,
                balance: 500
            }
        ];
        this.myId = playerData[0].id;
        return playerData;
    }
}