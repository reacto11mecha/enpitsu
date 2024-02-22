import React from "react";
// import Constants from "expo-constants";
import type { AppRouter } from "@enpitsu/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useAtomCallback } from "jotai/utils";
import superjson from "superjson";

import { studentTokenAtom } from "~/lib/atom";

/**
 * A set of typesafe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@enpitsu/api";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
const getBaseUrl = () => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */

  return "https://admin-osn.rmecha.my.id";

  // const debuggerHost = Constants.expoConfig?.hostUri;
  // const localhost = debuggerHost?.split(":")[0];

  // if (!localhost) {
  //   // return "https://turbo.t3.gg";
  //   throw new Error(
  //     "Failed to get localhost. Please point to your production server.",
  //   );
  // }
  // return `http://${localhost}:3000`;
};

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */

export function TRPCProvider(props: { children: React.ReactNode }) {
  const getHeaders = useAtomCallback(
    React.useCallback((get) => {
      const userToken = get(studentTokenAtom);

      const headers = new Map<string, string>();

      headers.set("x-trpc-source", "expo-react");

      headers.set(
        "authorization",

        // @ts-expect-error weird value from the storage when using useAtomCallback
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Student ${userToken.value?.token ?? userToken.token}`,
      );

      return Object.fromEntries(headers);
    }, []),
  );

  const [queryClient] = React.useState(() => new QueryClient());
  const trpcClient = React.useMemo(
    () =>
      api.createClient({
        transformer: superjson,
        links: [
          httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            headers: getHeaders,
          }),
        ],
      }),
    [getHeaders],
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}
