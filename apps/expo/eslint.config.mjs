import baseConfig from "@enpitsu/eslint-config/base";
import reactConfig from "@enpitsu/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
