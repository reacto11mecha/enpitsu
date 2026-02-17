import React, {
  useEffect,
  useMemo,
  // useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  // AppState,
  BackHandler,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
// --- Hooks Proteksi ---
import { useKeepAwake } from "expo-keep-awake";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import HtmlContent from "@/components/html-content";
import { ModalUniversal } from "@/components/modal-universal";
import {
  SessionStatus,
  useExamSessionStatus,
} from "@/hooks/useExamSessionStatus";
import { useFullScreen } from "@/hooks/useFullscreen";
import { useHardwareBackPressBlocker } from "@/hooks/useHardwareBackPressBlocker";
import { useStudentAnswerStore } from "@/hooks/useStorage";
import { usePreventScreenCapture } from "@/lib/screen-capture";
import { toast } from "@/lib/sonner";
import { useTRPC } from "@/lib/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { differenceInSeconds } from "date-fns";

// Helper Format Waktu
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export default function TestPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useUnistyles();
  const router = useRouter();
  const trpc = useTRPC();

  // --- AKTIFKAN PROTEKSI ---
  useHardwareBackPressBlocker();
  useFullScreen();
  useKeepAwake();
  usePreventScreenCapture();

  // --- STATE MANAGEMENT ---
  const {
    answers,
    newAnswer,
    updateMultipleChoice,
    updateEssay,
    removeAnswer,
    setDishonestCount,
  } = useStudentAnswerStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSheetOpen, setSheetOpen] = useState(false);

  // State Kecurangan
  const { reason } = useExamSessionStatus();
  const [currentReason, setCurrentReason] =
    useState<SessionStatus["reason"]>("SECURE");
  const [isCheatModalOpen, setCheatModalOpen] = useState(false);

  // Ambil data sesi user
  const currentAnswerSession = answers.find((a) => a.slug === slug);
  const dishonestyCount = currentAnswerSession?.dishonestCount ?? 0;

  // --- API MUTATIONS ---
  const getQuestionMutation = useMutation(
    trpc.exam.getQuestion.mutationOptions({
      onError: (err) => {
        Alert.alert("Gagal Memuat Soal", err.message, [
          {
            text: "Kembali",
            onPress: () => router.replace("/(protected)/(tabs)"),
          },
        ]);
      },
    }),
  );

  const submitMutation = useMutation(
    trpc.exam.submitAnswer.mutationOptions({
      onSuccess: () => {
        if (slug) removeAnswer(slug);
        toast.success("Ujian Selesai", {
          description: "Jawaban anda telah berhasil dikirim.",
        });
        router.replace("/(protected)/(tabs)");
      },
      onError: (err) => {
        toast.error("Gagal Mengirim", { description: err.message });
      },
    }),
  );

  const blocklistMutation = useMutation(
    trpc.exam.storeBlocklist.mutationOptions({ onError: () => {} }),
  );

  // --- LOGIKA DETEKSI KECURANGAN ---
  useEffect(() => {
    if (!currentAnswerSession) return;

    // Jika status berubah dari sebelumnya
    if (reason !== currentReason) {
      // KASUS 1: User Melanggar (Keluar App / Split Screen)
      if (reason !== "SECURE") {
        setCheatModalOpen(true);
        setCurrentReason(reason);
      }

      // KASUS 2: User KEMBALI ke App (Setelah melanggar)
      else if (reason === "SECURE" && currentReason !== "SECURE") {
        const newCount = dishonestyCount + 1;

        // Simpan ke Store
        if (slug) setDishonestCount(slug, newCount);

        // Reset State Lokal
        setCurrentReason("SECURE");
        setCheatModalOpen(false);

        // Lapor ke Server jika sudah > 2
        if (newCount > 2 && getQuestionMutation.data) {
          blocklistMutation.mutate({
            questionId: getQuestionMutation.data.id,
            time: new Date(),
          });
        } else {
          toast.error(`Peringatan Kecurangan (${newCount}/3)`, {
            description: "Dilarang keluar dari aplikasi ujian!",
          });
        }
      }
    }
  }, [reason, currentReason, currentAnswerSession, slug, dishonestyCount]);

  // --- SIDE EFFECTS LAINNYA ---
  useEffect(() => {
    if (slug) getQuestionMutation.mutate({ slug });
  }, [slug]);

  useEffect(() => {
    if (slug && !answers.find((a) => a.slug === slug)) newAnswer(slug);
  }, [slug, answers, newAnswer]);

  const examData = getQuestionMutation.data;

  // Timer Logic
  useEffect(() => {
    if (examData) {
      const calculateTime = () => {
        const diff = differenceInSeconds(
          new Date(examData.endedAt),
          new Date(),
        );
        setTimeLeft(diff > 0 ? diff : 0);
        if (diff <= 0) {
          Alert.alert("Waktu Habis", "Ujian otomatis dikumpulkan.", [
            { text: "OK", onPress: () => handleSubmit(true) },
          ]);
        }
      };
      calculateTime();
      const timer = setInterval(calculateTime, 1000);
      return () => clearInterval(timer);
    }
  }, [examData]);

  // Hardware Back Button Block
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Tahan!", "Anda sedang dalam ujian. Keluar sekarang?", [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          onPress: () => router.replace("/(protected)/(tabs)"),
          style: "destructive",
        },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  // --- DATA PREPARATION ---
  const allQuestions = useMemo(() => {
    if (!examData) return [];
    const pg = examData.multipleChoices.map((q) => ({
      ...q,
      type: "PG" as const,
    }));
    const essay = examData.essays.map((q) => ({
      ...q,
      type: "ESSAY" as const,
    }));
    return [...pg, ...essay];
  }, [examData]);

  const currentQuestion = allQuestions[currentIndex];
  const isLastQuestion = currentIndex === allQuestions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  // --- HANDLERS ---
  const handleNext = () => {
    if (!isLastQuestion) setCurrentIndex((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (!isFirstQuestion) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = (force = false) => {
    if (!currentAnswerSession || !examData) return;
    const doSubmit = () => {
      submitMutation.mutate({
        questionId: examData.id,
        essays: currentAnswerSession.essays,
        multipleChoices: currentAnswerSession.multipleChoices,
        checkIn: currentAnswerSession.checkIn || new Date(),
        submittedAt: new Date(),
      });
    };
    if (force) {
      doSubmit();
      return;
    }
    Alert.alert("Kumpulkan Jawaban?", "Pastikan semua soal telah terisi.", [
      { text: "Batal", style: "cancel" },
      { text: "Kumpulkan", style: "default", onPress: doSubmit },
    ]);
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setSheetOpen(false);
  };

  const getStatusColor = (index: number) => {
    const q = allQuestions[index];
    if (!currentAnswerSession) return theme.colors.surface;
    let isAnswered = false;
    if (q.type === "PG") {
      isAnswered = currentAnswerSession.multipleChoices.some(
        (a) => a.iqid === q.iqid,
      );
    } else {
      const essayAns = currentAnswerSession.essays.find(
        (a) => a.iqid === q.iqid,
      );
      isAnswered = !!essayAns?.answer?.trim();
    }
    if (index === currentIndex) return theme.colors.primary;
    if (isAnswered) return theme.colors.accent;
    return theme.colors.surface;
  };

  if (getQuestionMutation.isPending) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.muted }}>
          Memuat Soal...
        </Text>
      </View>
    );
  }

  if (getQuestionMutation.isError || !examData)
    return <View style={styles.container} />;

  if (dishonestyCount > 2) {
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ gestureEnabled: false, headerShown: false }} />

      {/* HEADER FIXED */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.examTitle} numberOfLines={1}>
            {examData.title}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.replace("/(protected)/(tabs)")}
            style={styles.iconButton}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color={theme.colors.typography}
            />
          </TouchableOpacity>

          {/* INDIKATOR KECURANGAN */}
          <View
            style={[
              styles.warningBadge,
              dishonestyCount > 0
                ? { backgroundColor: theme.colors.error }
                : { backgroundColor: theme.colors.primary },
            ]}
          >
            <Ionicons name="alert-circle" size={16} color="#fff" />
            <Text style={styles.warningText}>{dishonestyCount} / 3</Text>
          </View>

          {/* TIMER */}
          <View
            style={[
              styles.timerContainer,
              timeLeft < 300 && { backgroundColor: theme.colors.error },
            ]}
          >
            <Text
              style={[styles.timerText, timeLeft < 300 && { color: "#fff" }]}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>
      </View>

      {/* MODAL PERINGATAN CURANG (Block Screen) */}
      <ModalUniversal
        visible={isCheatModalOpen}
        onRequestClose={() => {}} // Disable manual close
        title="Peringatan Keamanan!"
        description={`Terdeteksi aktivitas mencurigakan (${reason}). Harap segera kembali ke layar ujian!`}
        footer={
          <View style={{ width: "100%", alignItems: "center" }}>
            <ActivityIndicator size="large" color={theme.colors.error} />
            <Text
              style={{
                marginTop: 10,
                color: theme.colors.error,
                fontWeight: "bold",
              }}
            >
              Menunggu Anda Kembali...
            </Text>
          </View>
        }
      >
        <View style={{ alignItems: "center", padding: 20 }}>
          <Ionicons
            name="eye-off-outline"
            size={64}
            color={theme.colors.error}
          />
        </View>
      </ModalUniversal>

      {/* QUESTION CONTENT */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentQuestion && (
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>
                Soal {currentIndex + 1}{" "}
                <Text
                  style={{ fontWeight: "normal", color: theme.colors.muted }}
                >
                  dari {allQuestions.length}
                </Text>
              </Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      currentQuestion.type === "PG" ? "#E0F2FE" : "#FCE7F3",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color:
                      currentQuestion.type === "PG" ? "#0284C7" : "#DB2777",
                    fontWeight: "bold",
                  }}
                >
                  {currentQuestion.type === "PG" ? "Pilihan Ganda" : "Esai"}
                </Text>
              </View>
            </View>

            <View style={styles.htmlContainer}>
              <HtmlContent
                dom={{ scrollEnabled: false, matchContents: true }}
                html={currentQuestion.question}
                color={theme.colors.typography}
                fontSize={18}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.answerArea}>
              {currentQuestion.type === "PG" ? (
                currentQuestion.options.map((opt, idx) => {
                  const isSelected =
                    currentAnswerSession?.multipleChoices.find(
                      (a) => a.iqid === currentQuestion.iqid,
                    )?.choosedAnswer === opt.order;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.radioOption,
                        isSelected && styles.radioOptionSelected,
                      ]}
                      onPress={() =>
                        updateMultipleChoice(
                          slug!,
                          currentQuestion.iqid,
                          opt.order,
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <HtmlContent
                          dom={{ scrollEnabled: false, matchContents: true }}
                          html={opt.answer}
                          color={theme.colors.typography}
                          fontSize={16}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <TextInput
                  style={styles.essayInput}
                  multiline
                  placeholder="Ketik jawaban anda disini..."
                  placeholderTextColor={theme.colors.muted}
                  value={
                    currentAnswerSession?.essays.find(
                      (a) => a.iqid === currentQuestion.iqid,
                    )?.answer || ""
                  }
                  onChangeText={(val) =>
                    updateEssay(slug!, currentQuestion.iqid, val)
                  }
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FOOTER NAVIGASI */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            isFirstQuestion && styles.navButtonDisabled,
          ]}
          onPress={handlePrev}
          disabled={isFirstQuestion}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={
              isFirstQuestion ? theme.colors.muted : theme.colors.typography
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sheetButton}
          onPress={() => setSheetOpen(true)}
        >
          <View style={styles.gridIcon}>
            <View style={styles.gridDot} />
            <View style={styles.gridDot} />
            <View style={styles.gridDot} />
            <View style={styles.gridDot} />
          </View>
          <Text style={styles.sheetButtonText}>Daftar Soal</Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => handleSubmit(false)}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.finishButtonText}>Selesai</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.typography}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* MODAL GRID SOAL */}
      <ModalUniversal
        visible={isSheetOpen}
        onRequestClose={() => setSheetOpen(false)}
        title="Navigasi Soal"
        description="Pilih nomor untuk melompat."
        footer={
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSheetOpen(false)}
          >
            <Text style={styles.modalCloseText}>Tutup</Text>
          </TouchableOpacity>
        }
      >
        <View style={{ maxHeight: 400 }}>
          <View style={styles.gridContainer}>
            {allQuestions.map((q, idx) => {
              const bgColor = getStatusColor(idx);
              const isSurface = bgColor === theme.colors.surface;
              const textColor = isSurface ? theme.colors.typography : "#fff";
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: bgColor,
                      borderWidth: isSurface ? 1 : 0,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => jumpToQuestion(idx)}
                >
                  <Text style={{ color: textColor, fontWeight: "bold" }}>
                    {idx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ModalUniversal>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 40 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: 2,
    zIndex: 10,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.typography,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerText: {
    fontSize: 14,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
    color: theme.colors.typography,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  warningText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 400,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.typography,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  htmlContainer: {
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 24,
  },
  answerArea: {
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  radioOptionSelected: {
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.muted,
    marginRight: 16,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  essayInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
    textAlignVertical: "top",
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.typography,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    elevation: 10,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.inputBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  sheetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.inputBg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  sheetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.typography,
  },
  gridIcon: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 14,
    height: 14,
    gap: 2,
    justifyContent: "center",
  },
  gridDot: {
    width: 5,
    height: 5,
    backgroundColor: theme.colors.typography,
    borderRadius: 1,
  },
  finishButton: {
    backgroundColor: theme.colors.primary,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingVertical: 16,
  },
  gridItem: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  modalCloseButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCloseText: {
    color: theme.colors.typography,
    fontWeight: "bold",
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
}));
