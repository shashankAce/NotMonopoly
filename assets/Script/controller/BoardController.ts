

import { GAME_MODE, PROPERTY_COUNT } from "../Config";
import Pawn from "../Pawn";
import { clientEvent } from "../core/ClientEvent";
import { Events, UIEvents } from "../core/EventNames";
import GameEngine from "../core/engine/GameEngine";
import { GameEvents } from "../core/GameEvents";
import LayoutController from "../core/LayoutController";
import Player from "../entity/Player";
import UserTab from "../entity/UserTab";
import Socket from "../socket/Socket";
import GPlayer from "../core/engine/GPlayer";
import PopupSale from "../popup/PopupSale";
import GProperty from "../core/engine/GProperty";
import Property from "../core/Property";
import { Locals } from "../core/Locals";
const { ccclass } = cc._decorator;

@ccclass
export default class BoardController extends LayoutController implements GameEvents {
    onMoveEnd: Function;
    onGo: Function;
    onRollDouble: Function;
    onUseCard: Function;
    onMortgageProperty: Function;
    onBid: Function;
    onSellProperty: Function;
    onDiceSpin: Function;
    onSentToJail: Function;
    onTakeLoan: Function;
    onMove: Function;
    onChance: Function;
    onCourt: Function;
    myId: string;
    gameEngine: GameEngine;
    socketController: Socket;

    protected onLoad(): void {
        super.onLoad();
        this.gameEngine = new GameEngine();
    }

    protected createBoard(jsonAsset: cc.JsonAsset): void {
        super.createBoard(jsonAsset);

        this.registerEvents();
        this.createDice();

        let players = this.getDummyPlayers();
        // TODO: remove getDummyPlayers fn later when real player work is done
        // this.gameEngine.initialize(this.player_array, this.propertyArr);
        this.gameEngine.initialize(players, this.propertyData, GAME_MODE.LOCAL_MULTIPLAYER);
        this.gameEngine.startGame();
    }

    onTurnChange(turnIndex: number) {
        cc.log("On turn change", ': From server');
        if (!this.gameEngine.isBidActive) {
            let turnIndex = this.getTurnIndex();
            if (turnIndex == 0 || turnIndex == 3)
                turnIndex = 0;
            else {
                turnIndex = 1;
            }
            this.dice_array[turnIndex].setActive(true);
            this.player_array.forEach((player, index) => {
                player.tab.deactivate(this.getTurnIndex() != index);
            });
        }
        // TODO: set clicking enabled for only active player
        this.updatePlayersBalance();
    }

    public updatePlayersBalance() {
        let player_array = this.player_array;
        this.gameEngine.players_arr.forEach((player, index) => {
            if (player.playerId == player_array[index].playerId) {
                player_array[index].tab.updateBalance(player.balance);
            }
        });
    }

    onBidTurnChange(turnIndex: number) {
        cc.log("On bid turn change", ': From server');
        this.gameEngine.players_arr.forEach((player, index) => {
            if (player.isFold == true) {
                this.player_array[index].tab.deactivate(true);
            }
        });
    }

    private async onSpinDice() {
        cc.log("On Spin Dice ", ': From server');
        this.gameEngine.diceCheatValue = [];

        let gPlayer = this.gameEngine.players_arr[this.gameEngine.turnIndex];
        let diceArr = gPlayer.diceValue;

        let diceIndex = this.getTurnIndex();
        if (diceIndex == 0 || diceIndex == 3)
            diceIndex = 0;
        else {
            diceIndex = 1;
        }
        await this.dice_array[diceIndex].spin(diceArr);
        await this.player_array[this.gameEngine.turnIndex].pawn.moveTo(diceArr[0] + diceArr[1]);
        this.arrangePawns();
        clientEvent.dispatchEvent(UIEvents.onMoveEnd);

        // await this.buyProperty();
        // this.turnOver();
    }

    public getActivePlayer() {
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

    private onShowBuyPropertyPopup(property: GProperty) {
        let data = {
            property: property.data,
            boardController: this,
        }
        this.popupController.showSalePopup(data, false);
    }

    async onBuyProperty() {

        // Updating UI
        let player = this.getActivePlayer();
        cc.log("On buy property by -> ", player.name);

        let property = this.property_map.get(player.pawnPosition.toString());
        let gProperty = this.gameEngine.property_map.get(player.pawnPosition.toString());
        property.soldTo = this.getLocalPlayerById(gProperty.soldTo.playerId);
        property.isSold = true;
        // Updating UI

        let popup = this.popupController.getCurrentPopup() as PopupSale;
        await popup.onBuyPropertyListener().then(() => {
            this.scheduleOnce(() => {
                this.popupController.hidepopup();
            }, 1);
        });
    }

    onRentPaid() {
        let player = this.getActivePlayer();
        let property = this.gameEngine.property_map.get(player.pawnPosition.toString());
        this.popupController.showRentPaidPopup(player, property.soldTo, property.rent);
        cc.log("On paid rent", player.name, " -> ", property.soldTo.name, property.rent);
    }

    onBidProperty(property: GProperty) {
        let gPlayer = this.gameEngine.players_arr[this.gameEngine.turnIndex];
        cc.log("On bid property by ", gPlayer.name);

        if (gPlayer.playerId != this.myId) {
            let data = {
                property: property.data,
                boardController: this,
            }
            this.popupController.showSalePopup(data, true);
        }
    }

    onTradeProperty() {

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
                isBot: true,
                balance: 800
            },
            {
                name: "Ashley",
                id: "0o9ytrd",
                profileUrl: "www.google.com",
                isBot: true,
                balance: 500
            }
        ];
        this.myId = playerData[0].id;
        return playerData;
    }

    onCheatSubmit() {
        this.gameEngine.diceCheatValue = this.cheatController.getValue();
    }

    onBuildClick() {

        let pCount = {};
        let player = this.getActivePlayer();
        this.property_map.forEach((property, index) => {
            if (property.isSold && property.soldTo.playerId == player.playerId) {
                if (!pCount[property.data.group]) {
                    pCount[property.data.group] = [];
                }
                pCount[property.data.group].push(property);
            }
        });

        let eligible_prop_group = null;

        let keys = Object.keys(pCount);
        keys.forEach((key, index) => {
            if (pCount[key].length == PROPERTY_COUNT[key]) {
                eligible_prop_group = key;
            }
        });

        if (eligible_prop_group) {
            // TODO
            // highlight the properties eligible
            this.popupController.showBuildPopup();
        } else {
            this.showErrorMsg(Locals.BUILD_ERROR);
        }
    }

    onMortgageClick() {

    }

    onRedeemClick() {

    }

    async onTradeClick() {
        return new Promise((resolve: Function, reject: Function) => {

            this.tradeOptionsLayout.parent.active = true;
            if (this.tradeOptionsTween) {
                resolve();
                return;
            }

            let pos = this.tradeOptionsLayout.position;
            let tweenPos = 0;
            if (pos.y == 0) {
                tweenPos = 465;
            }

            if (tweenPos == 0) {
                this.tradeOptionsLayout.children.forEach((options, index) => {
                    if (index < this.gameEngine.players_arr.length) {
                        let player = this.gameEngine.players_arr[index];
                        if (player.playerId != this.myId) {
                            options.color = player.color;
                            options.getChildByName('pName').getComponent(cc.Label).string = player.name;
                            options.getChildByName('pawn').color = player.color;
                            options.active = true;
                        } else {
                            options.active = false;
                        }
                    } else {
                        options.active = false;
                    }
                });
            }

            this.tradeOptionsTween = cc.tween(this.tradeOptionsLayout)
                .to(0.2, { y: tweenPos })
                // .delay(0.3)
                .delay(0.1)
                .call(() => {
                    this.tradeOptionsTween = null;
                    resolve();
                })
                .start();

        });
    }

    async onTradeOptionPick(event, param) {
        await this.onTradeClick();

        let playerProp: Property[] = [];
        let oppnentProp: Property[] = [];

        let tradeTo = this.gameEngine.players_arr[Number(param)];
        this.property_map.forEach((property, index) => {
            if (property.isSold) {
                if (property.soldTo.playerId == tradeTo.playerId) {
                    oppnentProp.push(property);
                } else if (property.soldTo.playerId == this.myId) {
                    playerProp.push(property);
                }
            }
        });

        if (playerProp.length || oppnentProp.length) {
            let data = {
                data: tradeTo.data,
                boardController: this,
            }
            this.popupController.showTradePopup(data);
        } else {
            this.showErrorMsg(Locals.TRADE_ERROR);
        }
    }

    protected registerEvents(): void {
        // Local Events
        clientEvent.on(UIEvents.ShowStationInfo, this.showStationInfo, this);
        clientEvent.on(UIEvents.ShowCityInfo, this.showCityInfo, this);
        clientEvent.on(UIEvents.HidePopup, this.hidePopup, this);
        // Local Events
        clientEvent.on(Events.onTurnChange, this.onTurnChange, this);
        clientEvent.on(Events.onAddPlayers, this.createPlayers, this);
        clientEvent.on(Events.spinDice, this.onSpinDice, this);
        clientEvent.on(Events.ShowBuyProperty, this.onShowBuyPropertyPopup, this);
        clientEvent.on(Events.onBidActive, this.onBidProperty, this);
        clientEvent.on(Events.onBidTurnChange, this.onBidTurnChange, this);
        clientEvent.on(Events.onBuyProperty, this.onBuyProperty, this);
        clientEvent.on(Events.onRentPaid, this.onRentPaid, this);
        clientEvent.on(Events.onTradeProperty, this.onTradeProperty, this);
    }
}