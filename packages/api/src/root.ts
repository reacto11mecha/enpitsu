import { authRouter } from "./router/auth";
import { gradeRouter } from "./router/grade";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  grade: gradeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
