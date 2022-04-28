对于要优化的变量为多个的时候，人们会对结果产生疑惑。

事实上，solver 会给出一个 midPoint 作为结果，而该结果仅当全部子问题的结果相同时才为最优结果。

一般情况下，返回的子问题的结果都不相同。而子问题列表对应于你输入的每一个优化值（即 optimize 的键值对）。

子问题会按照你给定的顺序，将每个条件依次作为最优先考虑优化的变量，其次再将其他变量在不影响最优先考虑优化的变量的条件下进行最优化。

这个结果在实际问题中很有用。
比如，看下面的代码：

```ts
const b = new OptimizeCreepBody({
    optimize: { rangedAttack: "max", hits: "min", heal: "max" },
    constraints: {
        fatigueOnSwamp: { equal: 0 },
        energyCost: { max: 2000 }
    }
});
```

你希望在能量消耗为 2000 的前提下，找一个一体机，具有最大的奶量和攻击力。

可是事实上，对于一个线性优化问题，几乎总是不存在这样的解，能够同时满足这三个条件，除非他们之间是线性相关的。

我们来看返回的结果：

```ts
b.result = {
    midpoint: {
        feasible: false,
        result: -0,
        bounded: true,
        "part:move": 15,
        "part:ranged_attack": 1.66666667,
        "part:attack": -0.66666667,
        "part:heal": 2
    },
    vertices: [
        {
            bounded: true,
            isIntegral: true,
            "part:ranged_attack": 5,
            "part:move": 25,
            rangedAttack: 50,
            hits: 3000,
            heal: 0,
            "part:heal": 0,
            "part:attack": 0,
            "part:carry": 0,
            "part:tough": 0,
            "part:work": 0
        },
        {
            bounded: true,
            isIntegral: true,
            rangedAttack: 0,
            hits: 0,
            heal: 0,
            "part:ranged_attack": 0,
            "part:move": 0,
            "part:heal": 0,
            "part:attack": 0,
            "part:carry": 0,
            "part:tough": 0,
            "part:work": 0
        },
        {
            bounded: true,
            isIntegral: true,
            "part:heal": 4,
            "part:move": 20,
            rangedAttack: 0,
            hits: 2400,
            heal: 48,
            "part:ranged_attack": 0,
            "part:attack": 0,
            "part:carry": 0,
            "part:tough": 0,
            "part:work": 0
        }
    ],
    ranges: {
        bounded: { min: true, max: true },
        isIntegral: { min: true, max: true },
        "part:ranged_attack": { min: 0, max: 5 },
        "part:move": { min: 0, max: 25 },
        rangedAttack: { min: 0, max: 50 },
        hits: { min: 0, max: 3000 },
        heal: { min: 0, max: 48 },
        "part:heal": { min: 0, max: 4 }
    }
};
```

这时，我们的代码给出的结果中，midPoint 的结果就几乎总是无效的。而
