import { E_Station_Logo, IProperty, config } from "../Config";
import { clientEvent } from "../core/ClientEvent";
import { Events, UIEvents } from "../core/EventNames";
import { Locals } from "../core/Locals";
import Property from "../core/Property";

const { ccclass, property } = cc._decorator;


@ccclass('StationObj')
export class StationObj {

    @property({
        type: cc.Enum(E_Station_Logo)
    })
    name: E_Station_Logo = E_Station_Logo.METRO;

    @property({
        type: cc.SpriteFrame
    })
    spriteFrame: cc.SpriteFrame = null;
}

@ccclass
export default class Station extends Property {

    @property(cc.Sprite)
    c_image_sprite: cc.Sprite = null;

    @property(StationObj)
    spritesFrames: StationObj[] = [];

    private imageMap: Map<E_Station_Logo, cc.SpriteFrame> = null;

    onLoad() {
        super.onLoad();

        this.pNameLabel.string = this.data.name;
        this.pPriceLabel.string = (Locals.CURRENCY + " ").concat(this.data.price.toString());

        let ind = Object.keys(E_Station_Logo).indexOf(this.data.logo);
        if (ind > -1) {
            let spriteFrame = this.getImage(ind);
            this.c_image_sprite.spriteFrame = spriteFrame;
        } else {
            cc.warn("Error Data- \n", this.data);
        }

        if (this.data.type != "STATION") {
            this.node.getChildByName("click").getComponent(cc.Button).enabled = false;
        }
    }

    setSide(side: number) {
        super.setSide(side);
        if (side == 1 || side == 2) {
            this.c_image_sprite.node.setPosition(-50, 0);
        }
    }

    getImage(name: E_Station_Logo) {
        if (!this.imageMap) {
            this.initImageMap();
        }
        return this.imageMap.get(name);
    }

    initImageMap() {
        this.imageMap = new Map<E_Station_Logo, cc.SpriteFrame>();
        this.spritesFrames.forEach((obj, i) => {
            this.imageMap.set(obj.name, obj.spriteFrame);
        });
    }

    onClick() {
        clientEvent.dispatchEvent(UIEvents.ShowStationInfo, this.data);
    }
}