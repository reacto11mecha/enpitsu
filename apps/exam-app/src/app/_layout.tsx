import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/hooks/useStorage";
import { Toaster } from "@/lib/sonner";

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
        <Toaster position="top-center" />
        {/* <Toaster
                    position="top-center"
                    duration={3000}
                    swipeToDismissDirection="up"
                    visibleToasts={4}
                    closeButton
                    autoWiggleOnUpdate="toast-change"
                    theme="system"
                    // icons={{
                    //     error: <Text>💥</Text>,
                    //     loading: <Text>🔄</Text>,
                    // }}
                    toastOptions={{
                        actionButtonStyle: {
                            paddingHorizontal: 20,
                        },
                    }}
                    pauseWhenPageIsHidden
                /> */}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
