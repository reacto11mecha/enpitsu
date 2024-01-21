import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  useToastState,
} from "@tamagui/toast";
import { TamaguiProvider, Theme, YStack } from "tamagui";

import { TRPCProvider } from "~/lib/api";
import config from "../../tamagui.config";

SplashScreen.preventAutoHideAsync();

const CurrentToast = () => {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 2, y: 20 }}
      y={30}
      opacity={1}
      display="flex"
      justifyContent="center"
      scale={1}
      animation="100ms"
      viewportName={currentToast.viewportName}
    >
      <YStack>
        <Toast.Title textAlign="center">{currentToast.title}</Toast.Title>
        {!!currentToast.message && (
          <Toast.Description textAlign="center">
            {currentToast.message}
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  );
};

const RootLayout = () => {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),

    SpaceMono_400Regular,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TRPCProvider>
      <TamaguiProvider config={config}>
        <Theme name={colorScheme}>
          <ThemeProvider
            value={colorScheme === "light" ? DefaultTheme : DarkTheme}
          >
            <ToastProvider duration={10_000}>
              <CurrentToast />

              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />

              <ToastViewport flexDirection="column" left={0} right={0} />
            </ToastProvider>
          </ThemeProvider>
        </Theme>
      </TamaguiProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
