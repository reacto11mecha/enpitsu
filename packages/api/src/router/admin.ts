// import { cache } from "@enpitsu/cache";
import { and, eq, not, schema, sql } from "@enpitsu/db";

// import { TRPCError } from "@trpc/server";
// import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  getPendingUser: adminProcedure.query(({ ctx }) =>
    ctx.db.query.users.findMany({
      where: and(
        sql`${schema.users.emailVerified} IS NULL`,
        not(eq(schema.users.id, ctx.session.user.id)),
      ),
    }),
  ),
});
