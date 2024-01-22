import { lazy, Suspense, useState } from "react";
import { studentTokenAtom } from "@/lib/atom";
import IndexRoute from "@/routes/IndexRoute";
import { api } from "@/utils/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useAtom } from "jotai";
import { RefreshCw } from "lucide-react";
import {
  createHashRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
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
          <div className="flex h-screen w-screen items-center justify-center">
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
          <div className="flex h-screen w-screen items-center justify-center">
            <RefreshCw size={35} className="animate-spin" />
          </div>
        }
      >
        <SetToken />
      </Suspense>
    ),
  },
]);

export default function App() {
  const [token] = useAtom(studentTokenAtom);

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: env.VITE_TRPC_URL,
          async headers() {
            return {
              authorization: `Student ${token}`,
            };
          },
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
