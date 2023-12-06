export class ActionCheckWin {
    constructor(_indexOrder, _funcExecute) {
        this.indexOrder = _indexOrder;
        this.funcExecute = _funcExecute;
    }
    indexOrder: number
    funcExecute: Function;
}