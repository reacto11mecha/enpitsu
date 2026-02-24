import "@/lib/unistyles";

import { Text, TouchableOpacity, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./styles";

export function Disqualification() {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, styles.center, { padding: 20 }]}>
      <Ionicons name="warning" size={80} color={theme.colors.error} />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: theme.colors.error,
          marginTop: 16,
        }}
      >
        Didiskualifikasi
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: theme.colors.typography,
          marginVertical: 12,
          fontSize: 16,
        }}
      >
        Anda terdeteksi melakukan kecurangan sebanyak 3 kali. Ujian anda
        otomatis dihentikan.
      </Text>
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.replace("/(protected)/(tabs)")}
      >
        <Text style={styles.buttonText}>Kembali ke Beranda</Text>
      </TouchableOpacity>
    </View>
  );
}
