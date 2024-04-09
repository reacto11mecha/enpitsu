import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, Stack } from "expo-router";
import { useAtomValue } from "jotai";

import { FirstTimeNoToken } from "~/components/insert-token";
import { studentTokenAtom } from "~/lib/atom";

export default function HomeLayout() {
  const userToken = useAtomValue(studentTokenAtom);

  if (!userToken.token || userToken.token === "")
    return (
      <>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-background"
        >
          <Stack.Screen options={{ headerShown: false }} />

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <FirstTimeNoToken />
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </>
    );

  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ headerShown: true, title: "Beranda" }} />

      <Slot />
    </SafeAreaView>
  );
}
