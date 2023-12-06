

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
const { ccclass } = cc._decorator;

@ccclass
export default class BoardController extends LayoutController implements GameEvents {
    onMoveEnd: Function;
    onGo: Function;
    onRollDouble: Function;
    onUseCard: Function;
    onBuyProperty: Function;
    onMortgageProperty: Function;
    onAuctionProperty: Function;
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

    gameEngine: GameEngine
    socketController: Socket;

    protected onLoad(): void {
        this.gameEngine = new GameEngine();
    }

    protected createBoard(jsonAsset: cc.JsonAsset): void {
        super.createBoard(jsonAsset);

        this.registerEvents();
        this.createDice();

        // this.gameEngine.init(this.player_array, this.propertyArr);

        let players = this.getDummyPlayers();
        this.gameEngine.initialize(players, this.propertyData);
        this.gameEngine.startGame();
    }

    onTurnChange(turnIndex: number) {
        this.currentTurn = turnIndex;
        this.dice_array[this.currentTurn].setActive(true);
    }

    private async onSpinDice(dice_values: number[]) {

        let index = Math.floor(this.currentTurn / (this.player_array.length - 1));
        await this.dice_array[index].spin(dice_values);
        await this.player_array[index].pawn.moveTo(dice_values[0] + dice_values[1]);
        this.arrangePawns();
        clientEvent.dispatchEvent(Events.onMoveEnd);

        // await this.buyProperty();
        // this.turnOver();
    }

    async buyProperty() {
        return new Promise((resolve: Function) => {
            this.popupController.showPopup(E_Popup.sale);
        });
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
        super.registerEvents();
        clientEvent.on(Events.ShowStationInfo, this.showStationInfo, this);
        clientEvent.on(Events.ShowCityInfo, this.showCityInfo, this);
        clientEvent.on(Events.HidePopup, this.hidePopup, this);
        clientEvent.on(Events.onTurnChange, this.onTurnChange, this);
        clientEvent.on(Events.onAddPlayers, this.createPlayers, this);
        //
        clientEvent.on(UIEvents.spinDice, this.onSpinDice, this);
    }


    getDummyPlayers() {
        let playerData = [
            {
                name: "Anshu",
                id: 0,
                profileUrl: "www.google.com",
                isBot: false
            },
            {
                name: "Mini",
                id: 0,
                profileUrl: "www.google.com",
                isBot: false
            }
        ];
        return playerData;
    }
}