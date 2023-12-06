export const config = {
    gameCfgUrl: "",
    tileWidth: 84,
    currency: "₹",
    waitTime: 10
}

export const TabPosition = [
    cc.v2(-370, -627), // left
    cc.v2(-370, 600),  // left_top
    cc.v2(370, 600),   // right_top
    cc.v2(370, -627),   // right
]

export const PlayerColor = [
    new cc.Color().fromHEX("#28bf0a"), // green
    new cc.Color().fromHEX("#a61a05"), // red
    new cc.Color().fromHEX("#a8770c"), // yellow
    new cc.Color().fromHEX("#13209c"), // blue
]

export const TileColors = {
    green: [0, 1, 3],
    purple: [6, 8],
    yellow: [10, 12],
    cyan: [15, 17, 18],
    magenta: [20, 22, 23],
    orange: [25, 27, 28],
    red: [30, 32, 33],
    gold: [35, 36, 38],
}

export interface IPlayerInfo {
    name: string;
    id: number;
    profileUrl: string;
    isBot: boolean;
    index: number;
}

export const tilePos = [
    //left
    { x: -477, y: -346 },
    { x: -477, y: -262 },
    { x: -477, y: -178 },
    { x: -477, y: -88 },
    { x: -477, y: 0 },
    { x: -477, y: 84 },
    { x: -477, y: 168 },
    { x: -477, y: 262 },
    { x: -477, y: 346 },
    { x: -477, y: 450 },
    // top
    { x: -338, y: 477 },
    { x: -254, y: 477 },
    { x: -170, y: 477 },
    { x: -86, y: 477 },
    { x: 0, y: 477 },
    { x: 86, y: 477 },
    { x: 172, y: 477 },
    { x: 257, y: 477 },
    { x: 342, y: 477 },
    { x: 437, y: 477 },
    // right
    { x: 450, y: 346 },
    { x: 450, y: 262 },
    { x: 450, y: 168 },
    { x: 450, y: 84 },
    { x: 450, y: 0 },
    { x: 450, y: -88 },
    { x: 450, y: -178 },
    { x: 450, y: -262 },
    { x: 450, y: -346 },
    { x: 450, y: -450 },
    // bottom
    { x: 342, y: -477 },
    { x: 257, y: -477 },
    { x: 172, y: -477 },
    { x: 86, y: -477 },
    { x: 0, y: -477 },
    { x: -86, y: -477 },
    { x: -170, y: -477 },
    { x: -254, y: -477 },
    { x: -338, y: -477 },
    { x: -450, y: -477 },
]
// export enum E_TILE_TYPE {
//     CITY = "CITY",
//     STATION = "STATION",
//     CORNER = "CORNER",
//     UTIL = "UTIL",
//     CHANCE = "CHANCE",
//     CHEST = "CHEST",
// }

// export enum E_SPECIAL {
//     TAX = "TAX",
//     SPIN = "SPIN",
//     CHEST = "CHEST",
//     CHANCE = "CHANCE",
//     //
//     PARKING = "PARKING",
//     JAIL = "JAIL",
//     COURT = "COURT",
//     GO = "GO"
// }

export enum E_Corners {
    PARKING,
    JAIL,
    COURT,
    GO
}

export enum E_Station_Logo {
    METRO,
    WATER,
    POST_OFFICE,
    ELECTRIC,
    PETROL,
    CHANCE,
    CHEST,
    SPIN,
    TAX,
}

export interface IConfig {
    cities: IProperty[],
    station: IProperty[],
    corner: IProperty[]
}

export interface IProperty {
    name: string;
    price: number;
    rent: number;
    house: number[];
    build: number;
    type: string;
    //
    logo: string;
    index: number;
}
// export interface ICities {
//     name: string;
//     price: number;
//     rent: number;
//     house: number[];
//     build: number;
//     type: string;
//     index: number;
// }
// export interface IStation {
//     name: string;
//     price: number;
//     logo: string;
//     rent: number;
//     type: string;
//     index: number;
// }
// export interface ICorners {
//     name: string;
//     type: string;
//     index: number;
// }
// export interface IUtil {
//     name: string;
//     price: number;
//     rent: number;
//     type: string;
//     index: number;
// }
// /// reward type
// export interface IChance {
//     msg: string;
//     credit: number;
//     move: number;
// }
// export interface IChest {
//     name: string;
//     price: number;
//     build: number;
// }