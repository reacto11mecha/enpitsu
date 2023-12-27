import type { AppRouter } from "@enpitsu/api";
import { createTRPCReact } from "@trpc/react-query";

export const api = createTRPCReact<AppRouter>();
