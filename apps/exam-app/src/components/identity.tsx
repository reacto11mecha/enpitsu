import { useEffect } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useAuthStore } from "@/hooks/useStorage";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

import "@/lib/unistyles";

export function Identity({ title }: { title: string }) {
  const { instanceName } = useAuthStore();
  const trpc = useTRPC();

  const studentQuery = useQuery(trpc.exam.getStudent.queryOptions());

  useEffect(() => {
    if (studentQuery.error) {
      Alert.alert(
        "Gagal mengambil data pribadi",
        `Operasi mengambil data gagal, mohon coba lagi. Error: ${
          studentQuery.error.message === "Failed to fetch"
            ? "Gagal meraih server"
            : studentQuery.error.message
        }`,
      );
    }
  }, [studentQuery.error]);

  const isLoading = studentQuery.isLoading;
  const student = studentQuery.data?.student;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>
          Pastikan identitas anda sudah benar dan sesuai dengan yang tertera
          pada kartu ujian.
        </Text>
      </View>

      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={styles.loadingText.color} />
            <Text style={styles.loadingText}>Memuat data siswa...</Text>
          </View>
        ) : (
          <View style={styles.dataList}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>No Peserta</Text>
              <Text style={styles.dataValue}>
                {student?.participantNumber || "-"}
              </Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Nama</Text>
              <Text style={styles.dataValue}>{student?.name || "-"}</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Kelas</Text>
              <Text style={styles.dataValue}>
                {student?.subgrade?.grade?.label || ""}{" "}
                {student?.subgrade?.label || "-"}
              </Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Ruangan</Text>
              <Text style={styles.dataValue}>{student?.room || "-"}</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Token</Text>
              <Text style={styles.dataValue}>{student?.token || "-"}</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Instansi</Text>
              <Text style={styles.dataValue}>{instanceName || "-"}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
  },
  header: {
    marginBottom: theme.margins.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.typography,
    marginBottom: theme.margins.sm,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: theme.colors.muted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dataList: {
    paddingVertical: 4,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: theme.margins.md,
  },
  dataLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: "500",
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: theme.colors.typography,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.margins.md,
  },
  loadingContainer: {
    padding: theme.margins.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.muted,
  },
}));
