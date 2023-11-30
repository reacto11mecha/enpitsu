import { drizzle } from "drizzle-orm/postgres-js";
import { Pool } from "pg";

import * as auth from "./schema/auth";
import * as post from "./schema/post";

export const schema = { ...auth, ...post };

export { myPgTable as tableCreator } from "./schema/_table";

export * from "drizzle-orm";

const pool = new Pool({
  connectionString: (process.env as { DATABASE_URL: string }).DATABASE_URL,
});

export const db = drizzle(pool, {
  schema,
});
