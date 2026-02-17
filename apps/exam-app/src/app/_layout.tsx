import "@/lib/unistyles";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useUnistyles } from "react-native-unistyles";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/hooks/useStorage";

import "react-native-reanimated";

import { Toaster } from "@/lib/sonner";

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore();
  const { theme } = useUnistyles();

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
            headerShown: false,
          }}
        >
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(protected)" />
          </Stack.Protected>
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="login" />
          </Stack.Protected>
        </Stack>
        <Toaster />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
