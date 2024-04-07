import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";

import "../globals.css";

import { useColorScheme } from "nativewind";

import { TRPCProvider } from "~/lib/api";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { colorScheme } = useColorScheme();

  const [loaded] = useFonts({
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
      {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f472b6",
          },
          contentStyle: {
            backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
          },
        }}
      />
      <StatusBar />
    </TRPCProvider>
  );
};

export default RootLayout;
