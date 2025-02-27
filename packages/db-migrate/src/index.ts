import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { env } from "./env";

const sourceDir = new URL("../migrations", import.meta.url);
console.log("launched...");

const connectionString = env.DATABASE_URL;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { casing: "snake_case" });

(async () => {
  console.log("migrating database...");
  await migrate(db, { migrationsFolder: sourceDir.pathname });
  console.log("migrations successful.");
  process.exit(0);
})().catch((e) => {
  // Deal with the fact the chain failed
  console.error("migration failed");
  console.error(e);
  process.exit(1);
});
