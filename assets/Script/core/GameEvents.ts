export interface GameEvents {

    onRollDouble: Function;
    onUseCard: Function;
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
    onMoveEnd: Function;
    onChance: Function;
    onCourt: Function;
    onGo: Function;
}