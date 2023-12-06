// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { config, tilePos } from "./Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Pawn extends cc.Component {

    private color: cc.Color;
    private speed = 0.15;
    private tile_index = 0;
    private toMovePosArr: cc.Vec2[] = [];

    init() {
        this.reset();
    }

    public get tilePos(): number {
        return this.tile_index;
    }

    resetPosition(){
        const pos = tilePos[this.tile_index];
        this.node.setPosition(new cc.Vec2(pos.x, pos.y));
    }

    reset() {
        this.tile_index = 29;
        const pos = tilePos[this.tile_index];
        this.node.setPosition(new cc.Vec2(pos.x, pos.y));
    }

    async moveTo(distance_count: number) {

        return new Promise((resolve: Function) => {

            this.toMovePosArr = [];

            // let extra_mile_count = 0
            let tile_dist = distance_count + this.tile_index;


            for (let index = this.tile_index + 1; index <= tile_dist; index++) {
                if (index >= tilePos.length) {
                    tile_dist -= tilePos.length;
                    index = 0;
                }
                const pos = tilePos[index];
                this.toMovePosArr.push(new cc.Vec2(pos.x, pos.y));
            }

            this.tile_index = tile_dist;
            this.tweenPosition(resolve);
            console.log('TileIndex', this.tile_index);

        });
    }

    async gotoTile(tile_num: number) {
        // TODO: Set code for direct goto tile incase of socket
    }

    private tweenPosition(callbacks: Function) {
        return new Promise((resolve: Function) => {
            let actionArr = [];
            let duration = this.speed;
            for (var i = 0; i < this.toMovePosArr.length; i++) {
                actionArr.push(cc.moveTo(duration, this.toMovePosArr[i]));
                /*actionArr.push(cc.sequence(cc.spawn(cc.moveTo(duration, posArr[i]),
                 cc.scaleTo(duration, 1.2, 1.2)), cc.scaleTo(duration / 3, 1, 1)));*/
            }
            actionArr.push(cc.callFunc(function () {
                cc.log('Pawn moved to destination');
                // this.move_end();
                callbacks && callbacks();
            }, this));

            this.node.runAction(cc.sequence(actionArr));
        });

    }

    public setColor(color: cc.Color) {
        this.color = color;
        this.node.color = color;
    }
}