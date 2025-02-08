import type { Config } from "tailwindcss";
import baseConfig from "@enpitsu/tailwind-config/web";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [...baseConfig.content, "../../packages/ui/src/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
