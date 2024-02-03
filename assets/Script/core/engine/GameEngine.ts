import { IProperty, IPlayerInfo, config } from "../../Config";
import { ActionCheckWin } from "../ActionCheckWin";
import { clientEvent } from "../ClientEvent";
import { UIEvents, Events } from "../EventNames";
import { GameEvents } from "../GameEvents";
import GPlayer from "./GPlayer";
import GProperty from "./GProperty";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameEngine implements GameEvents {

    private interval: number;
    private initial_bal: number = 1000;
    private maxTurn: number = 0;
    private currentBid = 0;

    public _isBidActive = false;
    public set isBidActive(v: boolean) {
        this._isBidActive = v;
        if (v) clientEvent.dispatchEvent(Events.onBidActive);
    }
    public get isBidActive(): boolean {
        return this._isBidActive;
    }

    private listCheckWin: ActionCheckWin[] = [];

    public players_arr: GPlayer[] = [];
    public property_map: Map<string, GProperty>;
    ///
    private _turnIndex: number = 0;
    public get turnIndex(): number {
        return this._turnIndex;
    }
    private set turnIndex(v: number) {
        this._turnIndex = v;
        this.onTurnChange();
    }
    ///
    constructor() {
        this.registerEvents();
        this.property_map = new Map<string, GProperty>();
    }

    startGame() {
        this.maxTurn = this.players_arr.length - 1;
        this.turnIndex = 0;
    }

    initialize(players: IPlayerInfo[], propertyInfo: IProperty[]) {

        // Creating property map 
        propertyInfo.forEach((value, index) => {
            this.property_map.set(value.index.toString(), new GProperty(value));
        });

        // Creating players 
        if (players.length > 1) {
            players.forEach((data, index) => {
                let gPlayer = new GPlayer();
                gPlayer.id = this.getRandId().toString();
                gPlayer.index = index;
                gPlayer.balance = this.initial_bal;
                gPlayer.init(data);

                this.players_arr.push(gPlayer);
            });

            clientEvent.dispatchEvent(Events.onAddPlayers, this.players_arr);
        } else {
            cc.error('Players array can not be less than 2', players);
        }
    }

    private onDiceClick() {
        let diceArray = [1, 2, 3, 4, 5, 6];
        let randInt1 = this.getRandomInt(diceArray.length);
        let randInt2 = this.getRandomInt(diceArray.length);
        let suffledDiceArr = this.shuffleDice(diceArray);

        let value: number[] = [6, 6];
        // let value: number[] = [];
        // value.push(suffledDiceArr[randInt1]);
        // value.push(suffledDiceArr[randInt2]);
        // // value.push(randInt1);
        // // value.push(randInt2);

        // boradcast dice value to clients
        this.players_arr[this.turnIndex].diceValue = value;
        this.players_arr[this.turnIndex].movePawn();
        clientEvent.dispatchEvent(Events.spinDice);
        // Now wait for client to move
        // Next will be done in onMoveEnd fn
    }

    onMoveEnd() {
        // Event from client when player moves
        let player = this.players_arr[this.turnIndex];
        let property = this.property_map.get(player.pawnPosition.toString());
        if (!property.isSold) {
            if (player.balance > 0) {
                clientEvent.dispatchEvent(Events.ShowBuyProperty, property);
            } else {
                player.isOut = true;
            }
        } else {
            if (player.balance > property.data.rent) {
                player.balance -= property.data.rent;
            } else {
                // show player is broke and out
                player.isOut = true;
                // this.checkIfGameIsOver();
            }
        }
    };

    onBuyProperty() {
        let player = this.players_arr[this.turnIndex];
        let property = this.property_map.get(player.pawnPosition.toString());
        property.isSold = true;
        property.soldTo = player;
        player.balance -= property.data.price;
        clientEvent.dispatchEvent(Events.onBuyProperty);
        this.changeTurn();
    };

    onAuctionProperty(price: number) {
        cc.log(price);
        this.currentBid = price;
        this.isBidActive = true;
        this.changeTurn();
    };

    private checkIfGameIsOver() {
        let players_with_bal = this.players_arr.filter((ply, index) => {
            return !ply.isOut;
        });

        if (players_with_bal.length > 2) {
            // game over and other player wins
        } else if (this.players_arr.length > 2) {

        }
    }


    private shuffleDice(array: number[]) {
        let m = array.length, t, i;
        while (m) {
            // Pick a remaining element
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    private getRandomInt(max: number) {
        //The maximum is inclusive and the minimum is inclusive
        //return Math.floor(Math.random() * (max - min + 1)) + min;
        return Math.floor(Math.random() * max);
    }

    protected getRandId() {
        return Math.floor(Math.random() * 100) + 1;
    }

    private onTurnOver() {
        // Change turn to another player
        this.changeTurn();
    }

    private changeTurn() {
        if (this.turnIndex < this.maxTurn) {
            ++this.turnIndex;
        } else {
            this.turnIndex = 0;
        }
    }

    async onPlayerMoved() {
        for (const iterator of this.listCheckWin) {
            await iterator.funcExecute();
        }
    }

    public addActionCheckWin(actionCheckWin: ActionCheckWin) {
        this.listCheckWin.push(actionCheckWin);
        this.listCheckWin.sort((a, b) => a.indexOrder - b.indexOrder);
    }

    /// done
    registerEvents() {
        clientEvent.on(UIEvents.diceClick, this.onDiceClick, this);
        clientEvent.on(Events.turnOver, this.onTurnOver, this);
        clientEvent.on(UIEvents.onMoveEnd, this.onMoveEnd, this);
        clientEvent.on(UIEvents.onBuyClick, this.onBuyProperty, this);
        clientEvent.on(UIEvents.onUserBid, this.onAuctionProperty, this);
    }

    private startWaitTimer(fncToCall: Function) {
        try {
            this.interval = setInterval(() => {
                fncToCall && fncToCall();
            }, config.waitTime * 1000);
        } catch (error) {
            cc.log(error);
        }
    }

    onRollDouble() {
        clientEvent.dispatchEvent(Events.onRollDouble);
    };

    onUseCard() {
        clientEvent.dispatchEvent(Events.onUseCard);

    };

    /// done
    onTurnChange() {
        clientEvent.dispatchEvent(Events.onTurnChange, this.turnIndex);
    };


    onMortgageProperty() {
        clientEvent.dispatchEvent(Events.onMortgageProperty);

    };

    onBid() {
        clientEvent.dispatchEvent(Events.onBid);

    };
    onDealProperty() {
        clientEvent.dispatchEvent(Events.onDealProperty);

    };
    onSellProperty() {
        clientEvent.dispatchEvent(Events.onSellProperty);

    };
    onRentPaid() {
        clientEvent.dispatchEvent(Events.onRentPaid);

    };
    onRendReceived() {
        clientEvent.dispatchEvent(Events.onRendReceived);

    };
    onDiceSpin() {
        clientEvent.dispatchEvent(Events.onDiceSpin);

    };
    onSentToJail() {
        clientEvent.dispatchEvent(Events.onSentToJail);

    };
    onTakeLoan() {
        clientEvent.dispatchEvent(Events.onTakeLoan);

    };
    onChance() {
        clientEvent.dispatchEvent(Events.onChance);

    };
    onCourt() {
        clientEvent.dispatchEvent(Events.onCourt);

    };
    onGo() {
        clientEvent.dispatchEvent(Events.onGo);

    };
}