import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Stack } from "expo-router";
import { useAuthStore } from "@/hooks/useStorage";
import { queryClient, TRPCProvider } from "@/lib/trpc";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { UAParser } from "ua-parser-js";

import type { AppRouter } from "@enpitsu/api";

export default function ProtectedWebLayout() {
  useUnistyles();

  const { serverUrl, token } = useAuthStore();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: serverUrl as string,
          headers() {
            const headers = new Map<string, string>();

            headers.set("x-trpc-source", "exam-web");
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
  ) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="google-chrome"
            size={64}
            style={styles.icon}
          />
          <Text style={styles.title}>Browser Tidak Didukung</Text>
          <Text style={styles.message}>
            Aplikasi Enpitsu dirancang khusus untuk berjalan di{" "}
            <Text style={styles.highlight}>Google Chrome</Text>. Mohon ganti
            browser Anda untuk melanjutkan ujian.
          </Text>
        </View>
      </View>
    );
  }

  if (parseInt(browser.major!) < 120) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="alert-decagram"
            size={64}
            style={styles.warningIcon}
          />
          <Text style={styles.title}>Update Diperlukan</Text>
          <Text style={styles.message}>
            Anda sudah menggunakan Google Chrome, namun versinya terlalu lama (
            v{browser.major}). Mohon perbarui ke versi terbaru agar sistem ujian
            berjalan lancar.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="test/[slug]" />
        </Stack>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.margins.lg,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: theme.colors.surface,
    padding: theme.margins.xl,
    borderRadius: theme.radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    // Shadow halus
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  icon: {
    marginBottom: theme.margins.md,
    color: theme.colors.primary,
  },
  warningIcon: {
    marginBottom: theme.margins.lg,
    color: "#f59e0b", // Amber/Warning color
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.typography,
    marginBottom: theme.margins.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: 24,
  },
  highlight: {
    color: theme.colors.typography,
    fontWeight: "700",
  },
}));
