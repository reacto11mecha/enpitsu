import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, Stack } from "expo-router";
import { useAtom } from "jotai";

import { studentTokenAtom } from "~/utils/atom";

export default function HomeLayout() {
  const [userToken, setToken] = useAtom(studentTokenAtom);

  if (!userToken.token || userToken.token === "")
    return (
      <SafeAreaView className="bg-background">
        <Stack.Screen options={{ headerShown: false }} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ headerShown: true, title: "Beranda" }} />

      <Slot />
    </SafeAreaView>
  );
}
