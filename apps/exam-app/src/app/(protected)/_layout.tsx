import { useState } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/hooks/useStorage";
import { queryClient, TRPCProvider } from "@/lib/trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@enpitsu/api";

export default function ProtectedLayout() {
  const { serverUrl, token } = useAuthStore();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: serverUrl as string,
          headers() {
            const headers = new Map<string, string>();

            headers.set("x-trpc-source", "exam-app");
            headers.set("authorization", `Student ${token}`);

            return Object.fromEntries(headers);
          },
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="test/[slug]" />
        </Stack>
      </TRPCProvider>
    </QueryClientProvider>
  );
}
