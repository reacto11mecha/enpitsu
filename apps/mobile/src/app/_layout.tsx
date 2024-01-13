import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtom } from "jotai";
import { TamaguiProvider } from "tamagui";

import { InsertToken } from "~/components/insert-token";
import { TRPCProvider } from "~/lib/api";
import { studentTokenAtom } from "~/lib/atom";
import config from "../../tamagui.config";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [token] = useAtom(studentTokenAtom);

  const [loaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (token === "")
    return (
      <TamaguiProvider config={config}>
        <InsertToken />
      </TamaguiProvider>
    );

  return (
    <TRPCProvider>
      <TamaguiProvider config={config}>
        <StatusBar style="dark" />
        <Slot />
      </TamaguiProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
