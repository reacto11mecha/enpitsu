import { useState } from "react";
import { SetToken } from "@/components/set-token";
import { studentTokenAtom } from "@/lib/atom";
import { IndexRoute } from "@/routes/IndexRoute";
import { api } from "@/utils/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useAtom } from "jotai";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import superjson from "superjson";

import { env } from "./env";
import { TestRoute } from "./routes/TestRoute";

const router = createBrowserRouter([
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
    element: <TestRoute />,
  },
  {
    path: "settings",
    element: <SetToken />,
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
