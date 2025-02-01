import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: "../../.env",
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default {
  dialect: "postgresql",
  schema: "./schema",
  out: "../db-migrate/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: ["enpitsu_*"],
} satisfies Config;
