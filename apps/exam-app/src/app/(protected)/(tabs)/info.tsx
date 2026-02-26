import { ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Identity } from "@/components/identity";
import { useStudentSubmitHistory } from "@/hooks/useStorage";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";

export default function AboutScreen() {
  useUnistyles();

  const { questions } = useStudentSubmitHistory();

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Identity title="Identitas Anda" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riwayat Ujian</Text>

          {questions.length > 0 ? (
            <View style={styles.listContainer}>
              {questions.map((item) => (
                <View key={item.questionId} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.slug}</Text>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.cardContent}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Waktu Mulai</Text>
                      <Text style={styles.infoValue}>
                        {format(item.checkIn, "dd MMMM yyyy, HH:mm:ss", {
                          locale: id,
                        })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Waktu Selesai</Text>
                      <Text style={styles.infoValue}>
                        {format(item.submittedAt, "dd MMMM yyyy, HH:mm:ss", {
                          locale: id,
                        })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Durasi Pengerjaan</Text>
                      <Text style={styles.infoValue}>
                        {formatDuration(
                          intervalToDuration({
                            start: new Date(item.checkIn),
                            end: new Date(item.submittedAt),
                          }),
                          {
                            locale: id,
                            format: ["hours", "minutes", "seconds"],
                          },
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>
                Belum ada riwayat ditampilkan
              </Text>
              <Text style={styles.placeholderText}>
                Halaman ini nantinya akan menampilkan daftar soal yang telah
                Anda kerjakan, lengkap dengan detail nama soal, kode soal, waktu
                mulai, waktu selesai, dan durasi pengerjaan.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.margins.lg,
    paddingBottom: theme.margins.xl,
  },
  section: {
    marginBottom: theme.margins.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.typography,
    marginBottom: theme.margins.md,
    letterSpacing: -0.5,
  },
  // List Styles
  listContainer: {
    gap: theme.margins.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.margins.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: theme.margins.sm,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.typography,
    lineHeight: 22,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.typography,
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.margins.sm,
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.typography,
    fontWeight: "500",
  },
  // Placeholder Styles
  placeholderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    padding: theme.margins.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.typography,
    marginBottom: theme.margins.sm,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: 22,
  },
}));
