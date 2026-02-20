import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["cli/index.ts"],
    format: ["esm", "cjs"],
    outDir: "dist",
    dts: true,
    clean: true,
  },
  {
    entry: ["cli/cli.ts"],
    outDir: "dist",
    format: ["esm"],
    banner: { js: "#!/usr/bin/env node" },
  },
]);
