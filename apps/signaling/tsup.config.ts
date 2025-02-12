import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  noExternal: ["@enpitsu/db", "lodash"],
  // noExternal: ["@enpitsu/db", "@enpitsu/redis"],
  // external: ["ioredis"],
  format: ["esm"],
});
