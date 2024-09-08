import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import process from "node:process"

export default {
  input: "./src/extension.ts",
  output: {
    dir: "./dist",
    format: "cjs",
    sourcemap: process.env.NODE_ENV === "development",
    exports: "named"
  },
  external: ["vscode"],
  plugins: [
    nodeResolve(),
    commonjs({ extensions: [".ts"] }),
    typescript({
      tsconfig: "./tsconfig.json"
    })
  ]
}
