import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: ["./src/index.ts"],
  noExternal: ["@enpitsu/db", "@enpitsu/redis"],
  external: ["ioredis"],
  format: ["esm"],
});
