import type { AppRouter } from "@enpitsu/api";
import { lazy, Suspense, useCallback, useState } from "react";
import enpitsuLogo from "@/icon.png";
import { studentTokenAtom } from "@/lib/atom";
import IndexRoute from "@/routes/IndexRoute";
import { TRPCProvider } from "@/utils/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useAtomCallback } from "jotai/utils";
import { RefreshCw } from "lucide-react";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import superjson from "superjson";

import { env } from "./env";

const SetToken = lazy(() => import("@/components/set-token"));
const TestRoute = lazy(() => import("./routes/TestRoute"));

const router = createHashRouter([
  {
    path: "/",
    element: <IndexRoute />,
  },
  {
    path: "test",
    element: <Navigate to="/" replace={true} />,
  },
  {
    path: "test/:slug",
    element: (
      <Suspense
        fallback={
          <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
            <img src={enpitsuLogo} className="w-28 rounded-lg" />
            <RefreshCw size={35} className="animate-spin" />
          </div>
        }
      >
        <TestRoute />
      </Suspense>
    ),
  },
  {
    path: "settings",
    element: (
      <Suspense
        fallback={
          <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
            <img src={enpitsuLogo} className="w-28 rounded-lg" />
            <RefreshCw size={35} className="animate-spin" />
          </div>
        }
      >
        <SetToken />
      </Suspense>
    ),
  },
]);

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function App() {
  const getHeaders = useAtomCallback(
    useCallback((get) => {
      const userToken = get(studentTokenAtom);

      const headers = new Map<string, string>();

      headers.set("x-trpc-source", "exam-web");
      headers.set("authorization", `Student ${userToken}`);

      return Object.fromEntries(headers);
    }, []),
  );

  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: env.VITE_TRPC_URL,
          headers: getHeaders,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <RouterProvider router={router} />
      </TRPCProvider>
    </QueryClientProvider>
  );
}
