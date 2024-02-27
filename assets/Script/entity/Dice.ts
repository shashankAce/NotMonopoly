// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../core/ClientEvent";
import { UIEvents } from "../core/EventNames";

const anim_speed = 1;
const tile_w = 106.5;

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dice extends cc.Component {

    @property(cc.SpriteFrame)
    diceSprite: cc.SpriteFrame = null;

    @property(cc.Node)
    arrow_node: cc.Node = null;

    @property(cc.Node)
    disable_node: cc.Node = null;

    @property(cc.Node)
    dice_arr: cc.Node[] = [];

    private isPressed = false;

    protected onLoad(): void {
        let sf = this.diceSprite.clone();
        sf.setRect(cc.rect(tile_w * 5, 0, tile_w, tile_w));
        this.dice_arr[0].getComponent(cc.Sprite).spriteFrame = sf;

        let sf2 = this.diceSprite.clone();
        sf2.setRect(cc.rect(tile_w * 1, 0, tile_w, tile_w));
        this.dice_arr[1].getComponent(cc.Sprite).spriteFrame = sf2;
    }

    public setActive(bool: boolean) {
        if (bool) {
            this.disable_node.active = false;
            this.node.opacity = 255;
            this.isPressed = false;
            this.arrow_node.stopAllActions();
            this.glow(true);
        } else {
            this.disable_node.active = true;
            this.node.opacity = 100;
            this.isPressed = true;
            this.glow(false);
        }
    }

    private glow(bool: boolean) {
        if (bool) {
            let tween_time = 0.2;
            let tween = cc.tween()
                .to(tween_time, { opacity: 0 })
                .to(tween_time, { opacity: 255 })

            cc.tween(this.arrow_node).repeatForever(tween).start();
        } else {
            this.arrow_node.stopAllActions();
            this.arrow_node.opacity = 0;
        }
    }

    public async spin(value: number[]) {
        return new Promise((resolve: Function) => {
            this.glow(false);
            cc.log('Spin value - ', value);
            let animation = this.getSpinAnimation(value[0], this.dice_arr[0]);
            let animation2 = this.getSpinAnimation(value[1], this.dice_arr[1]);

            animation.play('spin_dice').speed = anim_speed;
            animation2.play('spin_dice').speed = anim_speed;

            let degree = -360 * 2;

            for (let index = 0; index < this.dice_arr.length; index++) {
                const element = this.dice_arr[index];
                cc.tween(element).by(0.8, { angle: degree * Math.pow(-1, index + 1) }).start();
            }

            animation.on('finished', () => {
                this.setActive(false);
                resolve();
            });
        });
    }

    private getSpinAnimation(dice_num: number, dice: cc.Node) {

        let animation = dice.getComponent(cc.Animation);

        let frames = [];
        for (var i = 0; i < 6; i++) {
            let sf = this.diceSprite.clone();
            sf.setRect(cc.rect(tile_w * i, 0, tile_w, tile_w));
            frames.push(sf);
        }

        let sf = this.diceSprite.clone();
        sf.setRect(cc.rect(tile_w * dice_num - tile_w, 0, tile_w, tile_w));
        frames.push(sf);

        var clip = cc.AnimationClip.createWithSpriteFrames(frames, frames.length);
        clip.name = "spin_dice";
        clip.wrapMode = cc.WrapMode.Default;

        // Adds frame event
        // clip.events.push({
        //     frame: 1,               // The exactly time in second. It will trigger event at 1s in this example.
        //     func: "frameEvent",     // Callback function name
        //     params: ["hello"]    // Callback parameters
        // });
        animation.addClip(clip);
        return animation;
    }

    onClick() {
        if (this.isPressed)
            return;
        cc.log('Dice pressed on client');
        this.isPressed = true;
        clientEvent.dispatchEvent(UIEvents.diceClick);
    }
}