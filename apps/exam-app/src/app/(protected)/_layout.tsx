import { Stack } from "expo-router";

export default function ProtectedWebLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="test/[slug]" />
    </Stack>
  );
}
