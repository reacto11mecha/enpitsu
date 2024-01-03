import React from "react";
import { Button, SafeAreaView, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

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
