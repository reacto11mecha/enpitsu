import type { Plugin } from "esbuild";
import { defineConfig } from "tsup";

const ignoreCssPlugin: Plugin = {
  name: "ignore-css",
  setup(build) {
    // Intercept any path that ends with .css
    build.onResolve({ filter: /\.css$/ }, (args) => {
      // Mark it with a special namespace
      return { path: args.path, namespace: "ignore-css" };
    });

    // Load files in the 'ignore-css' namespace
    build.onLoad({ filter: /.*/, namespace: "ignore-css" }, () => {
      // Return empty contents for them
      return { contents: "", loader: "text" };
    });
  },
};

export default defineConfig({
  clean: true,
  entry: ["./src/index.ts"],
  noExternal: ["@enpitsu/db", "@enpitsu/redis"],
  external: ["ioredis"],
  esbuildPlugins: [ignoreCssPlugin],
  format: ["esm"],
});
