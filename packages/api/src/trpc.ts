/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { auth } from "@enpitsu/auth";
import type { Session } from "@enpitsu/auth";
import { cache } from "@enpitsu/cache";
import { db, preparedGetStudent } from "@enpitsu/db";
import { validateId } from "@enpitsu/token-generator";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

const getStudent = async (token: string) =>
  await preparedGetStudent.execute({ token });

export type TStudent = NonNullable<Awaited<ReturnType<typeof getStudent>>>;

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
interface CreateContextOptions {
  session: Session | null;
  studentToken: string | null;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    studentToken: opts.studentToken,
    session: opts.session,
    db,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: {
  req?: Request;
  auth: Session | null;
}) => {
  const session = opts.auth ?? (await auth());
  const source = opts.req?.headers.get("x-trpc-source") ?? "unknown";

  const studentToken =
    opts.req?.headers.get("authorization")?.split("Student")?.at(1)?.trim() ??
    null;

  console.log(
    ">>> tRPC Request from",
    source,
    "by",
    session?.user ?? studentToken,
  );

  return createInnerTRPCContext({
    session,
    studentToken,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserIsAuthedAsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  } else if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAuthedAsAdmin);

const enforceUserIsStudent = t.middleware(async ({ ctx, next }) => {
  if (!ctx.studentToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!validateId(ctx.studentToken)) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }

  try {
    const cachedStudentInfo = await cache.get(
      `student-trpc-token-${ctx.studentToken}`,
    );

    if (cachedStudentInfo)
      return next({
        ctx: {
          ...ctx,
          student: JSON.parse(cachedStudentInfo) as TStudent,
        },
      });
  } catch (_) {
    console.error(
      JSON.stringify({
        time: Date.now().valueOf(),
        msg: "Failed to get cached student data, fallback to database request",
        studentToken: ctx.studentToken,
      }),
    );
  }

  const studentInfo = await getStudent(ctx.studentToken);

  if (!studentInfo) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Peserta ujian tidak dapat ditemukan.",
    });
  }

  try {
    await cache.set(
      `student-trpc-token-${ctx.studentToken}`,
      JSON.stringify(studentInfo),
      "EX",
      10 * 60,
    );
  } catch (_) {
    console.error(
      JSON.stringify({
        time: Date.now().valueOf(),
        msg: "Failed to set cache student data, continuing without writing cache",
        studentToken: ctx.studentToken,
      }),
    );
  }

  return next({
    ctx: {
      ...ctx,
      student: studentInfo,
    },
  });
});

export const studentProcedure = t.procedure.use(enforceUserIsStudent);
