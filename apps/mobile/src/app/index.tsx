import React from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useColorScheme } from "nativewind";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

const Index = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView>
      <View className="flex h-full w-full items-center justify-center">
        <Button title="Toggle theme" onPress={toggleColorScheme} />
        <Text className="dark:text-stone-100">{colorScheme}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Index;
