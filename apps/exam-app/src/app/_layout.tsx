import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/hooks/useStorage";

import "react-native-reanimated";

export default function RootLayout() {
  const { isLoggedIn } = useAuthStore();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="login" />
          </Stack.Protected>
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
