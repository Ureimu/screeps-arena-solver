import {
    ATTACK_POWER,
    BUILD_POWER,
    HARVEST_POWER,
    HEAL_POWER,
    RANGED_ATTACK_POWER,
    RANGED_HEAL_POWER,
    CARRY_CAPACITY,
    BodyPartConstant,
    BODYPARTS_ALL
} from "commons/constants";
import { bodyTools } from "utils/tools";

export const CreepAbilityConstantsList: (keyof CreepOutput["ability"])[] = [
    "attack",
    "build",
    "harvest",
    "heal",
    "rangedMassAttack1",
    "rangedMassAttack2",
    "rangedMassAttack3",
    "rangedHeal",
    "rangedAttack",
    "capacity"
];
export const CreepAbilityPartBaseNum: {
    [name in keyof CreepOutput["ability"]]: { type: BodyPartConstant; num: number };
} = {
    attack: { type: "attack", num: ATTACK_POWER },
    build: { type: "work", num: BUILD_POWER },
    harvest: { type: "work", num: HARVEST_POWER },
    heal: { type: "heal", num: HEAL_POWER },
    rangedMassAttack1: { type: "ranged_attack", num: 10 },
    rangedMassAttack2: { type: "ranged_attack", num: 4 },
    rangedMassAttack3: { type: "ranged_attack", num: 1 },
    rangedAttack: { type: "ranged_attack", num: RANGED_ATTACK_POWER },
    rangedHeal: { type: "heal", num: RANGED_HEAL_POWER },
    capacity: { type: "carry", num: CARRY_CAPACITY }
};

export const fatigueByPart: { [name in BodyPartConstant]: number } = {
    attack: 2,
    ranged_attack: 2,
    tough: 2,
    heal: 2,
    move: -2,
    carry: 2,
    work: 2
};

export function initCreep(...[creep]: [CreepInput]): CreepOutput {
    const creepBody: Partial<CreepOutput["body"]> = {};
    BODYPARTS_ALL.forEach(bodyName => {
        creepBody[bodyName] = bodyTools.getNum(creep.body, [bodyName]);
    });
    creepBody.total = bodyTools.getNum(creep.body);
    const creepBodyPartsList = bodyTools.compile(creep.body);
    if (!partialCreepBody(creepBody)) throw Error("partialCreepBody");
    const countTiredPart = creepBody.total - creepBody.move - creepBody.carry;
    const countTiredPartLoaded = creepBody.total - creepBody.move;
    const terrainCost = {
        plain: 2,
        swamp: 10
    };
    const tiredPartValue = {
        noLoad: countTiredPart ? countTiredPart / (creepBody.move * 2) : 1 / (creepBody.move * 2),
        fullLoad: countTiredPartLoaded ? countTiredPartLoaded / (creepBody.move * 2) : 1 / (creepBody.move * 2)
    };
    const hitsMax = creepBody.total * 100;
    const hitsPerPart = 100;
    const capacityPerCarryPart = 50;
    const emptyAbility: Partial<CreepOutput["ability"]> = {};
    Object.entries(CreepAbilityPartBaseNum).forEach(([k, v]) => {
        emptyAbility[k as keyof CreepOutput["ability"]] = creepBody[v.type] * v.num;
    });
    const ability = emptyAbility as CreepOutput["ability"];
    return {
        body: creepBody,
        energyCost: {
            spawnCreep: bodyTools.getEnergyCost(creep.body),
            build: creepBody.work,
            repair: creepBody.work,
            upgrade: creepBody.work
        },
        hitsMax,
        moveTimePerStep: {
            noLoad: {
                onPlain: Math.ceil(tiredPartValue.noLoad * terrainCost.plain),
                onSwamp: Math.ceil(tiredPartValue.noLoad * terrainCost.swamp)
            },
            fullLoad: {
                onPlain: Math.ceil(tiredPartValue.fullLoad * terrainCost.plain),
                onSwamp: Math.ceil(tiredPartValue.fullLoad * terrainCost.swamp)
            },
            actual(loads, hits, terrain) {
                const firstIndexOfActiveParts = Math.floor((hitsMax - hits) / hitsPerPart);
                const activeBody = bodyTools.getBodyStr(
                    creepBodyPartsList.slice(firstIndexOfActiveParts, creepBodyPartsList.length)
                );
                const carryFatiguePartNum = Math.ceil(loads / capacityPerCarryPart);
                const moveNum = bodyTools.getNum(activeBody, ["move"]);
                const faActNum = bodyTools.getNum(activeBody, ["tough"]);
                const faNum = bodyTools.getNum(creep.body, ["attack", "heal", "ranged_attack", "work"]);
                const fatiguePartNum = faActNum + faNum + carryFatiguePartNum;
                const fatiguePowerHere = terrainCost[terrain];
                return Math.ceil((fatiguePartNum * fatiguePowerHere) / (moveNum * 2));
            }
        },

        ability
    };
}

function partialCreepBody(creepBody: Partial<CreepOutput["body"]>): creepBody is CreepOutput["body"] {
    return BODYPARTS_ALL.every(name => {
        return creepBody[name] || creepBody[name] === 0;
    });
}

interface CreepInput {
    body: string;
}

export interface CreepOutput {
    /**
     * 身体配件数量
     *
     * @type {({ [name in BodyPartConstant | "total"]: number })}
     * @memberof CreepOutput
     */
    body: { [name in BodyPartConstant | "total"]: number };
    /**
     * 能量消耗
     *
     * @type {{ spawnCreep: number }}
     * @memberof CreepOutput
     */
    energyCost: { spawnCreep: number; repair: number; upgrade: number; build: number };
    /**
     * 最大血量。
     *
     * @type {number}
     * @memberof CreepOutput
     */
    hitsMax: number;
    /**
     * 移动速度
     *
     * @type {number}
     * @memberof harvester
     */
    moveTimePerStep: {
        noLoad: {
            onPlain: number;
            onSwamp: number;
        };
        fullLoad: {
            onPlain: number;
            onSwamp: number;
        };
        actual(loads: number, hits: number, terrain: "plain" | "swamp"): number;
    };
    /**
     * creep能力值
     *
     * @memberof CreepOutput
     */
    ability: {
        attack: number;
        build: number;
        harvest: number;
        heal: number;
        rangedMassAttack1: number;
        rangedMassAttack2: number;
        rangedMassAttack3: number;
        rangedHeal: number;
        rangedAttack: number;
        capacity: number;
    };
}
