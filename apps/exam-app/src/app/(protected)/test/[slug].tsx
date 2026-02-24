import type { AlertModalConfig } from "@/components/exam/types";
import React, { useEffect, useMemo, useState } from "react";
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
import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Disqualification } from "@/components/exam/disqualification";
import { ErrorStatus, LoadingStatus } from "@/components/exam/status-interface";
import { styles } from "@/components/exam/styles";
import { SuccessSubmit } from "@/components/exam/success-submit";
import { formatTime, shuffleArray } from "@/components/exam/utils";
import HtmlContent from "@/components/html-content";
import { ModalUniversal } from "@/components/modal-universal";
import {
  SessionStatus,
  useExamSessionStatus,
} from "@/hooks/useExamSessionStatus";
import { useFullScreen } from "@/hooks/useFullscreen";
import { useHardwareBackPressBlocker } from "@/hooks/useHardwareBackPressBlocker";
import {
  useStudentAnswerStore,
  useStudentSubmitHistory,
} from "@/hooks/useStorage";
import { usePreventScreenCapture } from "@/lib/screen-capture";
import { toast } from "@/lib/sonner";
import { useTRPC } from "@/lib/trpc";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { differenceInSeconds } from "date-fns";

export default function TestPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useUnistyles();

  const router = useRouter();
  const trpc = useTRPC();

  useHardwareBackPressBlocker();
  useFullScreen();
  useKeepAwake();
  usePreventScreenCapture();

  const {
    answers,
    newAnswer,
    updateMultipleChoice,
    updateEssay,
    removeAnswer,
    setDishonestCount,
  } = useStudentAnswerStore();
  const { addHistory } = useStudentSubmitHistory();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [alertModal, setAlertModal] = useState<AlertModalConfig>({
    visible: false,
    title: "",
    description: "",
    buttons: [],
  });

  const showAlert = (
    title: string,
    description: string,
    buttons: AlertModalConfig["buttons"] = [{ text: "OK" }],
  ) => {
    setAlertModal({
      visible: true,
      title,
      description,
      buttons,
    });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, visible: false }));
  };

  const { reason } = useExamSessionStatus();
  const [currentReason, setCurrentReason] =
    useState<SessionStatus["reason"]>("SECURE");
  const [isCheatModalOpen, setCheatModalOpen] = useState(false);

  const currentAnswerSession = answers.find((a) => a.slug === slug);
  const dishonestyCount = currentAnswerSession?.dishonestCount ?? 0;
  const checkIn = useMemo(
    () =>
      (currentAnswerSession?.checkIn as unknown as string) !== ""
        ? new Date(currentAnswerSession?.checkIn as unknown as string)
        : new Date(),
    [currentAnswerSession?.checkIn],
  );

  const getQuestionMutation = useMutation(
    trpc.exam.getQuestion.mutationOptions({
      onError: (err) => {
        showAlert("Gagal Memuat Soal", err.message, [
          {
            text: "Kembali",
            style: "default",
            onPress: () => router.replace("/(protected)/(tabs)"),
          },
        ]);
      },
    }),
  );

  const submitMutation = useMutation(
    trpc.exam.submitAnswer.mutationOptions({
      onSuccess: (data) => {
        if (slug) removeAnswer(slug);

        toast.success("Ujian Selesai", {
          description: "Jawaban anda telah berhasil dikirim.",
        });

        addHistory({
          ...data,
          questionId: examData!.id,
          title: examData!.title,
          slug: examData!.slug,
        });
      },
      onError: (err) => {
        toast.error("Gagal Mengirim", { description: err.message });
      },
    }),
  );

  const blocklistMutation = useMutation(
    trpc.exam.storeBlocklist.mutationOptions({
      onError: () => {},
      onSuccess() {
        if (slug) removeAnswer(slug);
      },
    }),
  );

  useEffect(() => {
    if (!currentAnswerSession) return;

    if (reason !== currentReason) {
      if (reason !== "SECURE") {
        setCheatModalOpen(true);
        setCurrentReason(reason);
      } else if (reason === "SECURE" && currentReason !== "SECURE") {
        const newCount = dishonestyCount + 1;
        if (slug) setDishonestCount(slug, newCount);
        setCurrentReason("SECURE");
        setCheatModalOpen(false);

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
          if (!alertModal.visible) {
            showAlert("Waktu Habis", "Ujian otomatis dikumpulkan.", [
              {
                text: "OK",
                style: "default",
                onPress: () => handleSubmit(true),
              },
            ]);
          }
        }
      };
      calculateTime();
      const timer = setInterval(calculateTime, 1000);
      return () => clearInterval(timer);
    }
  }, [examData]);

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

  // --- HANDLERS ---
  const handleNext = () => {
    if (!isLastQuestion) setCurrentIndex((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (!isFirstQuestion) setCurrentIndex((prev) => prev - 1);
  };

  const onRefresh = () => {
    if (!slug) return;
    setRefreshing(true);
    getQuestionMutation.mutate(
      { slug },
      {
        onSettled: () => setRefreshing(false),
        onSuccess: () => {
          toast.success("Soal Diperbarui", {
            description: "Data ujian berhasil dimuat ulang.",
          });
        },
      },
    );
  };

  const handleSubmit = (force = false) => {
    if (!currentAnswerSession || !examData) return;

    const doSubmit = () => {
      closeAlert();

      submitMutation.mutate({
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

    // GANTI ALERT: Konfirmasi Submit
    showAlert(
      "Kumpulkan Jawaban?",
      "Pastikan semua soal telah terisi dengan benar sebelum mengumpulkan.",
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: closeAlert,
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

  // --- RENDERING ---

  // 1. Loading
  if (getQuestionMutation.isPending) {
    return (
      <LoadingStatus
        modalVisible={alertModal.visible}
        closeModal={closeAlert}
        modalTitle={alertModal.title}
        modalDescription={alertModal.description}
        modalButtons={alertModal.buttons}
      />
    );
  }

  // 2. Error / No Data (Ditangani oleh Alert Modal di atas, tapi return view kosong biar tidak crash)
  if (getQuestionMutation.isError || !examData) {
    return (
      <ErrorStatus
        closeModal={closeAlert}
        modalTitle={alertModal.title}
        modalDescription={alertModal.description}
        modalButtons={alertModal.buttons}
      />
    );
  }

  // 3. Sukses Submit
  if (submitMutation.isSuccess && examData) {
    return (
      <SuccessSubmit
        slug={slug}
        title={examData.title}
        checkIn={submitMutation.data.checkIn}
        submittedAt={submitMutation.data.submittedAt}
      />
    );
  }

  // 4. Diskualifikasi
  if (dishonestyCount > 2) {
    return <Disqualification />;
  }

  // 5. Main Exam View
  return (
    <View style={styles.container}>
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

      {/* MODAL PERINGATAN CURANG (Block Screen) */}
      <ModalUniversal
        visible={isCheatModalOpen}
        onRequestClose={() => {}}
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

      {/* MODAL ALERT CUSTOM (Pengganti Alert.alert) */}
      <ModalUniversal
        visible={alertModal.visible}
        onRequestClose={closeAlert}
        title={alertModal.title}
        description={alertModal.description}
        footer={
          <View style={styles.modalFooter}>
            {alertModal.buttons?.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={btn.onPress || closeAlert}
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
