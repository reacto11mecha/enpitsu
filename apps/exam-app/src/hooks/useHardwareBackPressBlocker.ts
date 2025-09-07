import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export function useHardwareBackPressBlocker() {
  useFocusEffect(() => {
    const onBackPress = () => {
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
  });
}
