import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default {
  dialect: "postgresql",
  schema: "./src/_main.ts",
  out: "../db-migrate/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  casing: "snake_case",
  tablesFilter: ["enpitsu_*"],
} satisfies Config;
