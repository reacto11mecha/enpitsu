import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtom } from "jotai";
import { useColorScheme } from "nativewind";

import { InsertToken } from "~/components/insert-token";
import { TRPCProvider } from "~/lib/api";
import { studentTokenAtom } from "~/lib/atom";

import "../styles.css";

// This is the main layout of t
const RootLayout = () => {
  const { colorScheme } = useColorScheme();

  const [token] = useAtom(studentTokenAtom);

  if (token === "") return <InsertToken />;

  return (
    <TRPCProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#0c0a09" : "#f5f5f4",
          },
        }}
      />
      <StatusBar />
    </TRPCProvider>
  );
};

export default RootLayout;
