import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as auth from "./schema/auth";
import * as grade from "./schema/grade";
import * as question from "./schema/question";

export const schema = { ...auth, ...grade, ...question };

export { myPgTable as tableCreator } from "./schema/_table";

export * from "drizzle-orm";

export const db = drizzle(postgres(process.env.DATABASE_URL!), {
  schema,
});
