import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { Identity } from "@/components/identity";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";

// --- Mock Data ---
const HISTORY_DATA = [
  {
    id: "1",
    title: "Penilaian Akhir Semester Ganjil 2024 - Matematika Wajib",
    slug: "PAS-MTK-2024",
    startedAt: new Date("2024-12-02T07:30:00"),
    endedAt: new Date("2024-12-02T09:00:00"),
  },
  {
    id: "2",
    title: "Ulangan Harian Bab 3 - Fisika Dasar",
    slug: "UH-FIS-03",
    startedAt: new Date("2024-11-25T10:00:00"),
    endedAt: new Date("2024-11-25T11:30:00"),
  },
  {
    id: "3",
    title: "Kuis Biologi - Sistem Pernapasan",
    slug: "QUIZ-BIO-05",
    startedAt: new Date("2024-11-20T13:00:00"),
    endedAt: new Date("2024-11-20T13:45:00"),
  },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Identity title="Identitas Anda" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riwayat Ujian</Text>

          {HISTORY_DATA.length > 0 ? (
            <View style={styles.listContainer}>
              {HISTORY_DATA.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.slug}</Text>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.cardContent}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Mulai</Text>
                      <Text style={styles.infoValue}>
                        {format(item.startedAt, "dd MMMM yyyy, HH:mm", {
                          locale: id,
                        })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Selesai</Text>
                      <Text style={styles.infoValue}>
                        {format(item.endedAt, "dd MMMM yyyy, HH:mm", {
                          locale: id,
                        })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Durasi</Text>
                      <Text style={styles.infoValue}>
                        {formatDuration(
                          intervalToDuration({
                            start: item.startedAt,
                            end: item.endedAt,
                          }),
                          { locale: id, format: ["hours", "minutes"] },
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
    </SafeAreaView>
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
