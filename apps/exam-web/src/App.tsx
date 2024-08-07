import { lazy, Suspense, useCallback, useState } from "react";
import enpitsuLogo from "@/icon.png";
import { studentTokenAtom } from "@/lib/atom";
import IndexRoute from "@/routes/IndexRoute";
import { api } from "@/utils/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
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

export default function App({ serverUrl }: { serverUrl: string }) {
  const getHeaders = useAtomCallback(
    useCallback((get) => {
      const userToken = get(studentTokenAtom);

      const headers = new Map<string, string>();

      headers.set("x-trpc-source", "exam-web");
      headers.set("authorization", `Student ${userToken}`);

      return Object.fromEntries(headers);
    }, []),
  );

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: serverUrl,
          headers: getHeaders,
        }),
      ],
      transformer: superjson,
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </api.Provider>
  );
}
