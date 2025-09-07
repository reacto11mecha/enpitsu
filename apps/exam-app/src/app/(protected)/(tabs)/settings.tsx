import { Button, Text, View } from "react-native";
import { useAuthStore } from "@/hooks/useStorage";

export default function SettingsScreen() {
  const { logOut } = useAuthStore();
  return (
    <View>
      <Text>Something</Text>
      <Button title="Logout" onPress={logOut} />
    </View>
  );
}
