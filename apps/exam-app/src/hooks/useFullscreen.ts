import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden } from "expo-status-bar";

export function useFullScreen() {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const enableFullScreen = async () => {
      try {
        setStatusBarHidden(true, "none");

        await NavigationBar.setBehaviorAsync("overlay-swipe");

        await NavigationBar.setVisibilityAsync("hidden");
      } catch (e) {
        console.error("Failed to enable fullscreen", e);
      }
    };

    const disableFullScreen = async () => {
      try {
        setStatusBarHidden(false, "fade");

        await NavigationBar.setVisibilityAsync("visible");
        await NavigationBar.setBehaviorAsync("inset-touch");
      } catch (e) {
        console.error("Failed to disable fullscreen", e);
      }
    };

    enableFullScreen();

    const subscription = NavigationBar.addVisibilityListener(
      ({ visibility }) => {
        if (visibility === "visible") {
          setTimeout(() => {
            enableFullScreen();
          }, 3000);
        }
      },
    );

    return () => {
      subscription.remove();
      disableFullScreen();
    };
  }, []);
}
