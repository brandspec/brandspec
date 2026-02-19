import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["cli/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
  },
  {
    entry: ["cli/cli.ts"],
    format: ["esm"],
    banner: { js: "#!/usr/bin/env node" },
  },
]);
