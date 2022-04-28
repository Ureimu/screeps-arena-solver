"use strict";

import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";

export default {
    input: "src/index.ts",
    output: {
        dir: "dist/",
        format: "esm",
        entryFileNames: "[name].mjs",
        sourcemap: false,
        preserveModules: true,
        preserveModulesRoot: "src",
    },

    plugins: [
        clear({ targets: ["dist"] }),
        resolve({ rootDir: "src" }),
        commonjs(),
        typescript({ tsconfig: "./tsconfig.json",useTsconfigDeclarationDir: false})
    ]
}

