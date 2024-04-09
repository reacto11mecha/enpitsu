import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { IBMPlexMono_400Regular } from "@expo-google-fonts/ibm-plex-mono";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";

import "../globals.css";

import { useColorScheme } from "nativewind";

import { TRPCProvider } from "~/lib/api";

void SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { colorScheme } = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: SpaceMono_400Regular,
    IBMPlex: IBMPlexMono_400Regular,
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
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
            backgroundColor: "#15803D",
          },
          headerTitleStyle: {
            color: "#EAEAEA",
          },
          contentStyle: {
            backgroundColor: colorScheme == "dark" ? "#09090B" : "#e7e5e4",
          },
        }}
      />
      <StatusBar />
    </TRPCProvider>
  );
};

export default RootLayout;
