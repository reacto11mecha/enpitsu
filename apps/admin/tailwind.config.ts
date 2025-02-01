import type { Config } from "tailwindcss";
import baseConfig from "@enpitsu/tailwind-config/web";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [...baseConfig.content],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", ...fontFamily.sans],
      },
    },
  },
} satisfies Config;
