import { gradeRouter } from "./router/grade";
import { questionRouter } from "./router/question";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  question: questionRouter,
  grade: gradeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
