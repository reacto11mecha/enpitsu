import "@/lib/unistyles";

import type { SessionStatus } from "@/hooks/useExamSessionStatus";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { router } from "expo-router";
import HtmlContent from "@/components/html-content";
import { ModalUniversal } from "@/components/modal-universal";
import { useExamSessionStatus } from "@/hooks/useExamSessionStatus";
import { StudentAnswer, useStudentAnswerStore } from "@/hooks/useStorage";
import { usePreventScreenCapture } from "@/lib/screen-capture";
import { toast } from "@/lib/sonner";
import { Ionicons } from "@expo/vector-icons";
import { differenceInSeconds } from "date-fns";
import { isLocked, startLockTask, stopLockTask } from "proctoring-module";

import type { RouterInputs, RouterOutputs } from "@enpitsu/api";

import { styles } from "./styles";
import { AcceptingModalProps, AlertModalConfig } from "./types";
import { formatTime, shuffleArray } from "./utils";

type Props = {
  examData: RouterOutputs["exam"]["getQuestion"] | undefined;
  currentAnswerSession: StudentAnswer | undefined;
  slug: string;
  dishonestyCount: number;
  submitPending: boolean;
  triggerBlocklist: () => void;
  triggerRefresh: (onSettled: () => void, onSuccess: () => void) => void;
  submitAnswer: (data: RouterInputs["exam"]["submitAnswer"]) => void;
  showAlert: (
    title: string,
    description: string,
    buttons: AlertModalConfig["buttons"],
  ) => void;
} & AcceptingModalProps;

export function ActualTest({
  examData,
  currentAnswerSession,
  slug,
  dishonestyCount,
  submitPending,
  triggerRefresh,
  triggerBlocklist,
  submitAnswer,
  showAlert,
  closeModal,
  modalDescription,
  modalTitle,
  modalVisible,
  modalButtons,
}: Props) {
  const { theme, rt } = useUnistyles();

  usePreventScreenCapture();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Default to true if it's the web environment, otherwise false
  const [isReady, setReady] = useState(Platform.OS === "web");
  const [isPreparing, setIsPreparing] = useState(false);

  const { updateMultipleChoice, updateEssay, setDishonestCount } =
    useStudentAnswerStore();

  const { reason } = useExamSessionStatus(true);
  const [currentReason, setCurrentReason] =
    useState<SessionStatus["reason"]>("SECURE");

  const checkIn = useMemo(
    () =>
      (currentAnswerSession?.checkIn as unknown as string) !== ""
        ? new Date(currentAnswerSession?.checkIn as unknown as string)
        : new Date(),
    [currentAnswerSession?.checkIn],
  );

  useEffect(() => {
    startLockTask();

    return () => {
      stopLockTask();
    };
  }, []);

  useEffect(() => {
    // Abaikan deteksi jika user sedang di layar persiapan/peringatan
    if (!isReady) return;
    if (!currentAnswerSession) return;

    if (reason !== currentReason) {
      if (reason !== "SECURE") {
        setCurrentReason(reason);

        setReady(false);

        // 2. Berikan penalti
        const newCount = dishonestyCount + 1;
        if (slug) setDishonestCount(slug, newCount);

        if (newCount > 2) {
          triggerBlocklist();
        } else {
          toast.error(`Peringatan Kecurangan (${newCount}/3)`, {
            description: "Aktivitas dilarang terdeteksi!",
          });

          if (reason === "UNLOCKED") {
            setTimeout(() => {
              startLockTask();
            }, 500);
          }
        }
      } else if (reason === "SECURE" && currentReason !== "SECURE") {
        // Status kembali aman
        setCurrentReason("SECURE");
      }
    }
  }, [
    reason,
    currentReason,
    currentAnswerSession,
    slug,
    dishonestyCount,
    isReady,
  ]);

  const getReasonText = (r: string) => {
    switch (r) {
      case "UNLOCKED":
        return "Layar tidak disematkan (Screen Pinning dilepas)";
      case "SPLIT_SCREEN":
        return "Layar terbagi (Split Screen) aktif";
      case "OVERLAY":
        return "Aplikasi mengambang (Floating App) terdeteksi";
      case "BACKGROUND":
        return "Keluar dari aplikasi ujian";
      default:
        return "Aktivitas ilegal";
    }
  };

  // --- DATA PREPARATION ---
  const allQuestions = useMemo(() => {
    if (!examData) return [];

    let pgQuestions = examData.multipleChoices.map((q) => ({
      ...q,
      type: "PG" as const,
    }));

    let essayQuestions = examData.essays.map((q) => ({
      ...q,
      type: "ESSAY" as const,
    }));

    if (examData.shuffleQuestion) {
      pgQuestions = shuffleArray(pgQuestions);
      essayQuestions = shuffleArray(essayQuestions);

      pgQuestions = pgQuestions.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));
    }

    return [...pgQuestions, ...essayQuestions];
  }, [examData]);

  const currentQuestion = allQuestions[currentIndex];
  const isLastQuestion = currentIndex === allQuestions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const handleStartTest = () => {
    setIsPreparing(true);

    if (!isLocked()) startLockTask();

    setTimeout(
      () => {
        if (Platform.OS === "android" && !isLocked()) {
          setIsPreparing(false);

          toast.error("Gagal Mengunci Layar", {
            description:
              "Sistem gagal menyematkan layar. Tutup jendela mengambang/split screen, ketuk area kosong di layar ini agar aplikasi fokus, lalu coba lagi.",
          });

          return;
        }

        setReady(true);
        setIsPreparing(false);
      },
      Platform.OS === "web" ? 10 : 3000,
    );
  };

  const handleTimeUp = () => {
    if (submitPending) return;

    toast.info("Waktu Habis", { description: "Ujian otomatis dikumpulkan." });
    handleSubmit(true);
  };

  const handleNext = () => {
    if (!isLastQuestion) setCurrentIndex((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (!isFirstQuestion) setCurrentIndex((prev) => prev - 1);
  };

  const onRefresh = () => {
    if (!slug) return;

    setRefreshing(true);

    triggerRefresh(
      () => setRefreshing(false),
      () => {
        toast.success("Soal Diperbarui", {
          description: "Data ujian berhasil dimuat ulang.",
        });
      },
    );
  };

  const handleSubmit = (force = false) => {
    if (!currentAnswerSession || !examData) return;

    const doSubmit = () => {
      closeModal();

      submitAnswer({
        questionId: examData.id,
        essays: currentAnswerSession.essays,
        multipleChoices: currentAnswerSession.multipleChoices,
        checkIn,
      });
    };

    if (force) {
      doSubmit();
      return;
    }

    const unansweredIndices: number[] = [];

    allQuestions.forEach((q, idx) => {
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

      if (!isAnswered) {
        unansweredIndices.push(idx + 1);
      }
    });

    if (unansweredIndices.length > 0) {
      toast.error("Masih ada soal yang belum dijawab!", {
        description: `Silakan periksa soal nomor: ${unansweredIndices.join(", ")}`,
      });

      setTimeout(() => setSheetOpen(true), 1000);

      return;
    }

    showAlert(
      "Kumpulkan Jawaban?",
      "Pastikan semua soal telah terisi dengan benar sebelum mengumpulkan.",
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: closeModal,
        },
        {
          text: "Kumpulkan",
          style: "default",
          onPress: doSubmit,
        },
      ],
    );
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setSheetOpen(false);
  };

  const getStatusColor = (index: number) => {
    const q = allQuestions[index];
    if (!currentAnswerSession) return theme.colors.error;

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

    if (isAnswered) return theme.colors.primary;

    return theme.colors.error;
  };

  if (!isReady) {
    const isWarning = dishonestyCount > 0;

    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: 24 },
        ]}
      >
        <Ionicons
          name={isWarning ? "warning" : "shield-checkmark"}
          size={80}
          color={isWarning ? theme.colors.error : theme.colors.primary}
        />

        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginTop: 20,
            textAlign: "center",
            color: isWarning ? theme.colors.error : theme.colors.typography,
          }}
        >
          {isWarning
            ? `Peringatan Keamanan (${dishonestyCount}/3)`
            : "Siap Memulai Ujian?"}
        </Text>

        <Text
          style={{
            marginTop: 12,
            textAlign: "center",
            color: theme.colors.muted,
            fontSize: 16,
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          {isWarning
            ? `Sistem mendeteksi adanya aktivitas yang dilarang (${getReasonText(currentReason)}). Jika pelanggaran mencapai 3 kali, Anda akan otomatis didiskualifikasi.`
            : "Sistem keamanan akan mengunci perangkat Anda ke dalam aplikasi ini. Setiap upaya untuk melepas kuncian, membuka layar ganda, atau membuka aplikasi mengambang akan otomatis dihitung sebagai pelanggaran."}
        </Text>

        <TouchableOpacity
          style={[
            styles.finishButton,
            {
              width: "100%",
              opacity: isPreparing ? 0.7 : 1,
              backgroundColor: isWarning
                ? theme.colors.error
                : theme.colors.primary,
            },
            Platform.OS === "web"
              ? {
                  shadowColor: isWarning
                    ? theme.colors.error
                    : theme.colors.primary,
                }
              : {},
          ]}
          onPress={handleStartTest}
          disabled={isPreparing}
        >
          {isPreparing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                styles.finishButtonText,
                {
                  includeFontPadding: false,
                  textAlignVertical: "center",
                },
              ]}
            >
              {isWarning
                ? "Saya Mengerti & Lanjutkan Ujian"
                : "Saya Mengerti & Mulai Ujian"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER FIXED */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.examTitle} numberOfLines={1}>
            {examData!.title}
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

          {examData ? (
            <ExamTimer
              endedAt={examData.endedAt}
              theme={theme}
              onTimeUp={handleTimeUp}
            />
          ) : null}

          {Platform.OS === "web" ? (
            <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
              <Ionicons
                name="refresh-outline"
                size={20}
                color={theme.colors.typography}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* MODAL ALERT CUSTOM (Pengganti Alert.alert) */}
      <ModalUniversal
        visible={modalVisible}
        onRequestClose={closeModal}
        title={modalTitle}
        description={modalDescription}
        footer={
          <View style={styles.modalFooter}>
            {modalButtons?.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={btn.onPress || closeModal}
                style={[
                  styles.modalButton,
                  btn.style === "cancel"
                    ? styles.modalButtonCancel
                    : styles.modalButtonDefault,
                ]}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    btn.style === "cancel" && {
                      color: theme.colors.typography,
                    },
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />

      {/* QUESTION CONTENT */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
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
                theme={rt.themeName === "dark" ? "dark" : "light"}
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
                      disabled={submitPending}
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
                          theme={rt.themeName === "dark" ? "dark" : "light"}
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
                  editable={!submitPending}
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
            {submitPending ? (
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
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: theme.colors.primary,
              }}
            />
            <Text style={{ fontSize: 12, color: theme.colors.typography }}>
              Sudah Dijawab
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: theme.colors.error,
              }}
            />
            <Text style={{ fontSize: 12, color: theme.colors.typography }}>
              Belum Dijawab
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: theme.colors.accent,
                backgroundColor: "transparent",
              }}
            />
            <Text style={{ fontSize: 12, color: theme.colors.typography }}>
              Saat Ini
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ maxHeight: 400 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <View style={styles.gridContainer}>
            {allQuestions.map((q, idx) => {
              const bgColor = getStatusColor(idx);
              const isCurrent = idx === currentIndex;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: bgColor,
                      borderWidth: isCurrent ? 3 : 0,
                      borderColor: isCurrent
                        ? theme.colors.accent
                        : "transparent",
                    },
                  ]}
                  onPress={() => jumpToQuestion(idx)}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                    {idx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </ModalUniversal>
    </View>
  );
}

function ExamTimer({
  endedAt,
  theme,
  onTimeUp,
}: {
  endedAt: string | Date;
  theme: any;
  onTimeUp: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = differenceInSeconds(new Date(endedAt), new Date());
    return diff > 0 ? diff : 0;
  });

  const [alreadySubmitting, setAlreadySubmitting] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    const calculateTime = () => {
      if (!alreadySubmitting) {
        const diff = differenceInSeconds(new Date(endedAt), new Date());
        setTimeLeft(diff > 0 ? diff : 0);
        if (diff <= 0) {
          onTimeUpRef.current();
          setAlreadySubmitting(true);
        }
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endedAt, alreadySubmitting]);

  return (
    <View
      style={[
        styles.timerContainer,
        timeLeft < 300 && { backgroundColor: theme.colors.error },
      ]}
    >
      <Text style={[styles.timerText, timeLeft < 300 && { color: "#fff" }]}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
}
