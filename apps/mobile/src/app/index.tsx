import React from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

const Index = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView>
      <View className="flex h-full w-full items-center justify-center"></View>
    </SafeAreaView>
  );
};

export default Index;
