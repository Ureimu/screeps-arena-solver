import { assert } from "chai";
import { creepAbility } from "creepCalculator";
import { OptimizeCreepBody } from "creepCalculator/optimize";

describe("calculator", () => {
    it("should return right number of out", () => {
        console.log(creepAbility("m3c1w2*3c3a5r1*2"));
        const time = Date.now();
        const b = new OptimizeCreepBody({
            optimize: [
                ["rangedAttack", "max"],
                ["total", "min"],
                ["heal", "max"]
            ],
            constraints: {
                fatigueOnSwamp: { equal: 0 },
                energyCost: { max: 2000 },
                total: { min: 0, max: 50 }
            }
        });
        console.log(b.lpResult);
        console.log(Date.now() - time);
        const c = new OptimizeCreepBody({
            optimize: [["rangedAttack", "max"]],
            constraints: {
                heal: { min: 12 },
                fatigueOnSwamp: { max: 0 },
                energyCost: { max: 2000 }
            }
        });
        console.log(c.lpResult);
    });
});
