import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["./index.ts"],
  watch: ["src/**/*.(ts,tsx)"],
  noExternal: ["@enpitsu/db", "@platejs/math"],
  external: ["@enpitsu/redis"],
  format: ["esm"],
  loader: {
    // Treat .css files as empty text files.
    ".css": "text",
  },
});
