import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, Stack } from "expo-router";

export default function TestLayout() {
  return (
    <SafeAreaView>
      <Stack.Screen options={{ headerShown: false }} />

      <Slot />
    </SafeAreaView>
  );
}
