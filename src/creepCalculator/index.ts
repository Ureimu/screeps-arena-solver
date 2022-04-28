import { CreepOutput, initCreep } from "commons/inits/creep";

export function creepAbility(body: string): CreepOutput {
    return initCreep({ body });
}
