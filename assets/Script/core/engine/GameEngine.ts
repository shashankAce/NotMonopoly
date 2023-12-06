import { IProperty, IPlayerInfo, config } from "../../Config";
import { ActionCheckWin } from "../ActionCheckWin";
import { clientEvent } from "../ClientEvent";
import { UIEvents, Events } from "../EventNames";
import { GameEvents } from "../GameEvents";
import GPlayer from "./GPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameEngine implements GameEvents {

    private interval;
    private _turnIndex: number = 0;
    private initial_bal: number = 1000;
    private maxTurn: number = 0;
    private players_arr: GPlayer[] = [];
    private listCheckWin: ActionCheckWin[] = [];

    private property_map: Map<string, IProperty>;

    constructor() {
        this.registerEvents();
        this.property_map = new Map<string, IProperty>();
    }

    private get turnIndex(): number {
        return this._turnIndex;
    }

    private set turnIndex(v: number) {
        this._turnIndex = v;
        this.onTurnChange();
    }

    startGame() {
        this.maxTurn = this.players_arr.length - 1;
        this.turnIndex = 0;
    }

    initialize(players: IPlayerInfo[], propertyInfo: IProperty[]) {

        // Creating property map 
        propertyInfo.forEach((value, index) => {
            this.property_map.set(value.index.toString(), value);
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

        let value: number[] = [];
        value.push(suffledDiceArr[randInt1]);
        value.push(suffledDiceArr[randInt2]);
        // value.push(randInt1);
        // value.push(randInt2);
        // this.players_arr[this.turnIndex].pawn.tilePos
        clientEvent.dispatchEvent(UIEvents.spinDice, value);
    }

    onMoveEnd() {
        // Event from client when player moves 

        clientEvent.dispatchEvent(Events.ShowBuyProperty);
    };


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
        clientEvent.on(Events.onMoveEnd, this.onMoveEnd, this);
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
        clientEvent.dispatchEvent(Events.onTurnChange, this._turnIndex);

    };
    onBuyProperty() {
        clientEvent.dispatchEvent(Events.onBuyProperty);

    };
    onMortgageProperty() {
        clientEvent.dispatchEvent(Events.onMortgageProperty);

    };
    onAuctionProperty() {
        clientEvent.dispatchEvent(Events.onAuctionProperty);

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