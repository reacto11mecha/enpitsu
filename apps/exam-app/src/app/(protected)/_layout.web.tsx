import { useMemo, useState } from "react";
import { Text } from "react-native";
import { Stack } from "expo-router";
import { useAuthStore } from "@/hooks/useStorage";
import { queryClient, TRPCProvider } from "@/lib/trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { UAParser } from "ua-parser-js";

import type { AppRouter } from "@enpitsu/api";

export default function ProtectedWebLayout() {
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

  const { browser, device } = useMemo(() => {
    const parser = new UAParser();

    const browser = parser.getBrowser();
    const device = parser.getDevice();

    return { browser, device };
  }, []);

  if (
    (!device.type && browser.name !== "Chrome") ||
    ((device.type === "mobile" || device.type === "tablet") &&
      browser.name !== "Mobile Chrome")
  )
    return <Text>Anda harus menggunakan google chrome</Text>;

  if (parseInt(browser.major!) < 140)
    return (
      <Text>
        Anda sudah menggunakan google chrome, namun belum versi terbaru. Mohon
        perbarui chrome anda ke versi terbaru agar bisa menggunakan enpitsu.
      </Text>
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
