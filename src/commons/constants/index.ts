export const CARRY_CAPACITY = 50;
export const HARVEST_POWER = 2;
export const REPAIR_POWER = 100;
export const BUILD_POWER = 5;
export const ATTACK_POWER = 30;
export const RANGED_ATTACK_POWER = 10;
export const HEAL_POWER = 12;
export const RANGED_HEAL_POWER = 4;
export const BODYPARTS_ALL: BodyPartConstant[] = ["attack", "carry", "heal", "move", "ranged_attack", "work", "tough"];
export type BodyPartConstant = "move" | "carry" | "work" | "heal" | "ranged_attack" | "attack" | "tough";
export const BODYPART_COST = {
    move: 50,
    work: 100,
    carry: 50,
    attack: 80,
    ranged_attack: 150,
    heal: 250,
    claim: 400,
    tough: 10
};
export type WalkableTerrainType = "plain" | "swamp";
