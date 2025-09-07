import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";

/**
 * A React hook to enter and exit fullscreen immersive mode on Android.
 * Hides the status bar and navigation bar when the screen is focused,
 * and shows them again when the screen is unfocused.
 */
export function useFullScreen() {
  useFocusEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const enterFullScreen = async () => {
      // Hide the navigation bar
      await NavigationBar.setVisibilityAsync("hidden");
      // Make the navigation bar appear when the user swipes from the edge
      await NavigationBar.setBehaviorAsync("inset-swipe");
      // Hide the status bar
      setStatusBarHidden(true, "fade");
    };

    const exitFullScreen = async () => {
      // Show the navigation bar
      await NavigationBar.setVisibilityAsync("visible");
      // Restore the default behavior
      await NavigationBar.setBehaviorAsync("inset-touch");
      // Show the status bar
      setStatusBarHidden(false, "fade");
    };

    enterFullScreen();

    // The cleanup function is returned from useFocusEffect and runs when the screen is unfocused
    return () => {
      exitFullScreen();
    };
  });
}
