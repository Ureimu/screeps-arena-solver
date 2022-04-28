declare module "javascript-lp-solver" {
    function Solve<
        Variables extends string,
        Choices extends string,
        OptimizeVariables extends string,
        MulOpt extends boolean,
        Optimize extends MulOpt extends true ? { [vName in OptimizeVariables]?: "max" | "min" } : OptimizeVariables,
        OpType extends MulOpt extends false ? "max" | "min" : null
    >(
        model: Model<Variables, Choices, OptimizeVariables, MulOpt, Optimize, OpType>
    ): Solution<Variables, Choices, OptimizeVariables, MulOpt>;

    interface Model<
        Variables extends string,
        Choices extends string,
        OptimizeVariables extends string,
        MulOpt extends boolean,
        Optimize extends MulOpt extends true ? { [vName in OptimizeVariables]?: "max" | "min" } : OptimizeVariables,
        OpType extends MulOpt extends false ? "max" | "min" : null // BUG  why I can't use never here? It leads to a error,and although using type instead could solve the problem, there'll be another problem about return data.
    > {
        mulOpt: MulOpt;
        opType: OpType;
        /**
         * 要最优化的变量。
         *
         * @type {Variables}
         * @memberof Model
         */
        optimize: Optimize;

        /**
         * 约束条件。
         *
         * @type {{
         *             [vName in Variables]?: { max?: number; min?: number };
         *         }}
         * @memberof Model
         */
        constraints: {
            [vName in Variables]?: { max?: number; min?: number; equal?: number };
        };
        variables: {
            [cName in Choices]: {
                [vName in Variables | OptimizeVariables]: number;
            };
        };
        /**
         * 取对应number整数倍的变量。
         *
         * @type {{ [vName in Variables]?: number }}
         * @memberof Model
         */
        ints?: { [vName in Variables | OptimizeVariables]?: number };
    }
    type BaseSolution<
        Choices extends string,
        OptimizeVariables extends string,
        MulOpt extends boolean,
        HasVariables extends boolean
    > = {
        /**
         * 是否存在可行解。
         *
         * @type {boolean}
         */
        feasible: boolean;
        /**
         * 结果是否有界。
         *
         * @type {boolean}
         */
        bounded: boolean;
        /**
         * 结果是否为整数。仅在使用ints选项时存在。
         *
         * @type {boolean}
         */
        isIntegral?: boolean;
    } & (HasVariables extends false
        ? MulOpt extends true
            ? { [cName in Choices]: number }
            : { result: number }
        : MulOpt extends false
        ? { result: number } & { [vName in OptimizeVariables]: number }
        : { [vName in Choices /** it's partial in fact */]: number } & { [vName in OptimizeVariables]: number });

    type Solution<
        Variables extends string,
        Choices extends string,
        OptimizeVariables extends string,
        MulOpt extends boolean
    > = MulOpt extends false
        ? BaseSolution<Choices, OptimizeVariables, MulOpt, true>
        : {
              midpoint: BaseSolution<Choices, OptimizeVariables, MulOpt, false>;
              vertices: BaseSolution<Choices, OptimizeVariables, MulOpt, true>[];
              ranges: BaseSolution<Choices, OptimizeVariables, MulOpt, true> extends {
                  [vName in infer M]: infer E;
              }
                  ? {
                        [vName in M]: { max: E; min: E };
                    }
                  : never;
          };
}
