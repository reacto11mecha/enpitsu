import type { Config } from "tailwindcss";

import baseConfig from "@enpitsu/tailwind-config";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
