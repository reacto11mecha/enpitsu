import baseConfig, { restrictEnvAccess } from "@enpitsu/eslint-config/base";
import nextjsConfig from "@enpitsu/eslint-config/nextjs";
import reactConfig from "@enpitsu/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
