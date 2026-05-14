import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["./src/index.ts"],
  watch: ["src/**/*.(ts,tsx)"],
  format: ["esm"],
});
