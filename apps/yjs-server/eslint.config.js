import baseConfig, { restrictEnvAccess } from "@enpitsu/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["index.ts"],
  },
  ...baseConfig,
  ...restrictEnvAccess,
];
