import { useMemo } from "react";
import { Text } from "react-native";
import { Stack } from "expo-router";
import { UAParser } from "ua-parser-js";

export default function ProtectedWebLayout() {
  const { browser, device } = useMemo(() => {
    const parser = new UAParser();

    const browser = parser.getBrowser();
    const device = parser.getDevice();

    return { browser, device };
  }, []);

  if (
    (!device.type && browser.name !== "Chrome") ||
    ((device.type === "mobile" || device.type === "tablet") &&
      browser.name !== "Mobile Chrome")
  )
    return <Text>Anda harus menggunakan google chrome</Text>;

  if (parseInt(browser.major!) < 140)
    return (
      <Text>
        Anda sudah menggunakan google chrome, namun belum versi terbaru. Mohon
        perbarui chrome anda ke versi terbaru agar bisa menggunakan enpitsu.
      </Text>
    );

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="test/[slug]" />
    </Stack>
  );
}
