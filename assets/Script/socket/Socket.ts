import { GameEvents } from "../core/GameEvents";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Socket extends cc.Component implements GameEvents {
    turnIndex: number;
    maxTurn: number;
    diceValue: number[];
    onRollDouble: Function;
    onUseCard: Function;
    registerEvents: Function;
    switchTurn: Function;
    onTurnChange: Function;
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
    onGo: Function;


    @property hostname = "localhost";
    @property port = 2567;
    @property useSSL = false;

    client!: Colyseus.Client;
    room!: Colyseus.Room;

    protected start() {
        this.init();
    }

    init() {

        // Instantiate Colyseus Client
        // connects into (ws|wss)://hostname[:port]
        let url = `${this.useSSL ? "wss" : "ws"}://${this.hostname}${([443, 80].includes(this.port) || this.useSSL) ? "" : `:${this.port}`}`;
        // @ts-ignore
        this.client = new Colyseus.Client(url);

        // Connect into the room
        // this.connect();
    }

    async connect() {
        try {
            this.room = await this.client.joinOrCreate("my_room");

            console.log("joined successfully!");
            console.log("user's sessionId:", this.room.sessionId);

            this.room.onStateChange((state) => {
                console.log("onStateChange: ", state);
            });

            this.room.onLeave((code) => {
                console.log("onLeave:", code);
            });

        } catch (e) {
            console.error(e);
        }
    }
}
