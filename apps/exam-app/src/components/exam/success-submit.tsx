import "@/lib/unistyles";

import { Text, TouchableOpacity, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import type { SuccessSubmitProps } from "./types";
import { styles } from "./styles";

export function SuccessSubmit(props: SuccessSubmitProps) {
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, styles.center, { padding: 20 }]}>
      <Ionicons
        name="checkmark-circle"
        size={80}
        color={theme.colors.primary}
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: theme.colors.primary,
          marginTop: 16,
          marginBottom: 24,
        }}
      >
        Ujian Selesai
      </Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={{ color: theme.colors.muted }}>Kode Soal</Text>
          <Text style={{ color: theme.colors.typography, fontWeight: "bold" }}>
            {props.slug}
          </Text>
        </View>
        <View style={styles.dividerSuccess} />
        <View style={styles.infoRow}>
          <Text style={{ color: theme.colors.muted }}>Nama Soal</Text>
          <Text
            style={{
              color: theme.colors.typography,
              fontWeight: "bold",
              maxWidth: "60%",
              textAlign: "right",
            }}
          >
            {props.title}
          </Text>
        </View>

        <View style={styles.dividerSuccess} />

        <View style={styles.infoRow}>
          <Text style={{ color: theme.colors.muted }}>Mulai Mengerjakan</Text>
          <Text style={{ color: theme.colors.typography, fontWeight: "bold" }}>
            {props.checkIn.toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Text>
        </View>

        <View style={styles.dividerSuccess} />

        <View style={styles.infoRow}>
          <Text style={{ color: theme.colors.muted }}>Waktu Submit</Text>
          <Text style={{ color: theme.colors.typography, fontWeight: "bold" }}>
            {props.submittedAt.toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Text>
        </View>
      </View>

      <View style={styles.screenshotAlert}>
        <Ionicons name="camera" size={24} color={theme.colors.muted} />
        <Text
          style={{
            flex: 1,
            color: theme.colors.muted,
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          Mohon{" "}
          <Text style={{ fontWeight: "bold" }}>tangkap layar (screenshot)</Text>{" "}
          halaman ini sebagai bukti sah bahwa Anda telah menyelesaikan ujian.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.buttonPrimary,
          { marginTop: 32, width: "100%", alignItems: "center" },
        ]}
        onPress={() => router.replace("/(protected)/(tabs)")}
      >
        <Text style={styles.buttonText}>Kembali ke Beranda</Text>
      </TouchableOpacity>
    </View>
  );
}
