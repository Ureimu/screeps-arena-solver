import { BodyPartConstant, BODYPARTS_ALL, BODYPART_COST, WalkableTerrainType } from "commons/constants";
import { CreepAbilityConstantsList, CreepAbilityPartBaseNum, CreepOutput, fatigueByPart } from "commons/inits/creep";
import _ from "lodash";
import * as solver from "javascript-lp-solver";
export const choicesList: CreepConstraints[] = [
    "part:attack",
    "part:carry",
    "part:heal",
    "part:move",
    "part:ranged_attack",
    "part:tough",
    "part:work"
];
export interface OptimizeCreepBodyModel<
    OptimizeVariables extends CreepVariables | CreepConstraints,
    Variables extends CreepVariables | CreepConstraints
> {
    /**
     * 要最优化的变量。
     *
     * @type {Variables}
     * @memberof Model
     */
    optimize: [OptimizeVariables, "max" | "min"][];
    /**
     * 约束条件。
     */
    constraints: {
        [vName in Variables]?: { max?: number; min?: number; equal?: number };
    };
    /**
     * 取对应number整数倍的变量。
     *
     * @type {{ [vName in Variables]?: number }}
     * @memberof Model
     */
    ints?: { [vName in Variables | OptimizeVariables]?: number };
}
// TODO 写total不能超过50和每个部件要大于0小于50
export class OptimizeCreepBody<
    Variables extends CreepVariables | CreepConstraints,
    OptimizeVariables extends CreepVariables | CreepConstraints
> {
    public fullModelResult: solver.Solution<Variables, CreepConstraints, OptimizeVariables, true>;
    public lpResult: solver.Solution<Variables, CreepConstraints, OptimizeVariables, true>["vertices"][0];
    public constructor(public model: OptimizeCreepBodyModel<OptimizeVariables, Variables>) {
        type OpType = null;
        type Optimize = { [vName in OptimizeVariables]?: "max" | "min" };
        type ModelType = solver.Model<Variables, CreepConstraints, OptimizeVariables, true, Optimize, OpType>;
        type AllVariables = Variables | OptimizeVariables;
        const variablesSet = new Set(Object.keys(model.constraints) as AllVariables[]);
        const optimize = _.zipObject(model.optimize);
        if (typeof model.optimize === "string") {
            variablesSet.add(model.optimize as AllVariables);
        } else {
            (Object.keys(_.zipObject(model.optimize)) as AllVariables[]).forEach(i => variablesSet.add(i));
        }
        const variablesList: AllVariables[] = Array.from(variablesSet);
        const partialVariables: Partial<ModelType["variables"]> = {};
        const ints: ModelType["ints"] = {};
        const choicesSetHere: Set<CreepConstraints> = new Set(choicesList);
        variablesList.forEach(value => {
            if (CreepAbilityConstantsList.includes(value as keyof CreepOutput["ability"])) {
                const nValue = value as keyof CreepOutput["ability"];
                const abilityBaseNum = CreepAbilityPartBaseNum[nValue];
                choicesSetHere.add(`part:${abilityBaseNum.type}`);
            }
        });
        choicesSetHere.forEach(partName => {
            const part = partName.split(":")[1] as BodyPartConstant;
            const data: Partial<ModelType["variables"][typeof partName]> = {};
            variablesList.forEach(value => {
                if (value === "energyCost") {
                    data[value] = BODYPART_COST[part];
                }
                if (value === "hits") {
                    data[value] = 100;
                }
                if (value === "total") {
                    data[value] = 1;
                }
                if (value.startsWith("fatigue")) {
                    if (value.endsWith("Plain") || part === "move") {
                        data[value] = fatigueByPart[part];
                    } else if (value.endsWith("Swamp")) {
                        data[value] = fatigueByPart[part] * 5;
                    }
                }
                if (CreepAbilityConstantsList.includes(value as keyof CreepOutput["ability"])) {
                    const nValue = value as keyof CreepOutput["ability"];
                    const abilityBaseNum = CreepAbilityPartBaseNum[nValue];
                    if (abilityBaseNum.type === part) {
                        data[value] = abilityBaseNum.num;
                    } else {
                        data[value] = 0;
                    }
                }

                data[partName as typeof value] = 1;
                ints[partName as typeof value] = 1;
            });
            partialVariables[partName] = data as ModelType["variables"][typeof partName];
        });
        const variables = partialVariables as ModelType["variables"];
        const fullModel: ModelType = {
            variables,
            mulOpt: true,
            opType: null,
            constraints: model.constraints,
            optimize,
            ints
        }; // do not access this after being solved since this object has been changed by solver.
        console.log("fullModel:");
        console.log(fullModel);
        this.fullModelResult = solver.Solve(fullModel);
        this.fullModelResult.vertices.forEach(i => {
            choicesList.forEach(part => {
                if (!i[part]) {
                    i[part] = 0;
                }
            });
        });
        choicesList.forEach(part => {
            if (!this.fullModelResult.midpoint[part]) {
                this.fullModelResult.midpoint[part] = 0;
            }
        });
        this.lpResult = this.fullModelResult.vertices.reduce((p, n) => {
            for (const data of this.model.optimize) {
                const [value, direction] = data;
                if (direction === "max") {
                    if (p[value] < n[value]) {
                        return n;
                    } else if (p[value] > n[value]) {
                        return p;
                    }
                    continue;
                } else {
                    if (p[value] > n[value]) {
                        return n;
                    } else if (p[value] < n[value]) {
                        return p;
                    }
                    continue;
                }
            }
            return p;
        }, this.fullModelResult.vertices[0]);
    }

    public getBody(maxHitsBeforeUnderSpeed: boolean): string {
        const total = choicesList.reduce((sum, part) => {
            sum += this.lpResult[part];
            return sum;
        }, 0);
        const bodyData = _.clone(this.lpResult);
        for (let index = 0; index < total; index++) {
            choicesList.some(part => {
                if (bodyData[part] === 0) return false;
                if ((["part:attack"] as CreepConstraints[]).includes(part)) {
                    bodyData[part] -= 1;
                    return true;
                }
                return false;
            });
        }
        return "";
    }
}
export type CreepPartOrderVariables = "speed" | "hitsBeforeUnderSpeed";
export type CreepVariables =
    | "energyCost"
    | "hits"
    | "total"
    | `fatigueOn${Capitalize<WalkableTerrainType>}`
    | keyof CreepOutput["ability"];
export type CreepConstraints = `part:${BodyPartConstant}`;
