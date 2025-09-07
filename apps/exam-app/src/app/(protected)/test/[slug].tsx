import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { Link } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import {
  SessionStatus,
  useExamSessionStatus,
} from "@/hooks/useExamSessionStatus";
import { useFullScreen } from "@/hooks/useFullscreen";
import { useHardwareBackPressBlocker } from "@/hooks/useHardwareBackPressBlocker";

export default function TestScreen() {
  useHardwareBackPressBlocker();
  useFullScreen();
  useKeepAwake();
  usePreventScreenCapture();

  const { reason } = useExamSessionStatus();

  const [dishonestCount, setDishonestCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [userReady] = useState(true);
  const [currentReason, setCurrentReason] =
    useState<SessionStatus["reason"]>("SECURE");

  useEffect(() => {
    if (!limitReached || !userReady) {
      switch (reason) {
        case "SECURE": {
          // Back to secure state
          if (currentReason !== "SECURE") {
            let newCount = 0;
            setDishonestCount((prev) => {
              newCount = prev + 1;

              if (newCount === 5) {
                setLimitReached(true);

                return newCount;
              }

              return newCount;
            });

            setCurrentReason("SECURE");

            if (newCount < 5) alert("anda curang!");
          }

          break;
        }

        case "OVERLAY":
        case "SPLIT_SCREEN":
        case "BACKGROUND": {
          setCurrentReason(reason);

          break;
        }
      }
    }
  }, [reason, currentReason, limitReached, userReady]);

  return (
    <View>
      <Text>Current reason: {currentReason}</Text>
      <Text>Dishonest count: {dishonestCount}</Text>

      <Link href={"/"} replace>
        Sudah beres ulangan
      </Link>
    </View>
  );
}
