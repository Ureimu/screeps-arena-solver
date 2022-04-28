# screeps-arena-solver

A calculator for screeps which could calculate, such as, how many energy points you can profit from mining a source based on the creep body you used and source information.

As there are so many ways to mining a source, you could meet really a lot bugs when using. It will take a lot of time to improve the calculator to stable, and we need your help to find these bugs out. Just feel free to raise any issue.

## Usage

```
npm install screeps-arena-solver
```

## creep tools

1. 各种部件数量，对应的能量消耗。
2. 基本的各种攻击伤害，治疗血量，工作效率， hits 等等常量数据。
3. creep 在不同血量情况下的速度，以及 creep 在受到多大伤害的攻击后会降速。考虑地形。按照 store 有多少东西的情况考虑。
4. 按照给定要求，自动给出最优的 creep 设定。比如限制能量消耗，限制出生时间，限制伤害等常量数据，限制在某种地形带多少东西时速度的最小值，然后取能量消耗的最小值之类的。
