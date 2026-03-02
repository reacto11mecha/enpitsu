import type { AlertModalConfig } from "@/components/exam/types";
import React, { useEffect, useState } from "react";
import { useUnistyles } from "react-native-unistyles";
import { useKeepAwake } from "expo-keep-awake";
import { router, useLocalSearchParams } from "expo-router";
import { ActualTest } from "@/components/exam/actual-test";
import { Disqualification } from "@/components/exam/disqualification";
import { ErrorStatus, LoadingStatus } from "@/components/exam/status-interface";
import { SuccessSubmit } from "@/components/exam/success-submit";
import { useFullScreen } from "@/hooks/useFullscreen";
import { useHardwareBackPressBlocker } from "@/hooks/useHardwareBackPressBlocker";
import {
  useStudentAnswerStore,
  useStudentSubmitHistory,
} from "@/hooks/useStorage";
import { toast } from "@/lib/sonner";
import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";

import type { RouterInputs, RouterOutputs } from "@enpitsu/api";

export default function TestPage() {
  useUnistyles();

  const { slug } = useLocalSearchParams<{ slug: string }>();

  const trpc = useTRPC();

  useHardwareBackPressBlocker();
  useFullScreen();
  useKeepAwake();

  const [examData, setExamData] = useState<
    RouterOutputs["exam"]["getQuestion"] | undefined
  >(undefined);
  const [canUpdateDishonestyCount, setCanUpdateDishonestyCount] =
    useState(true);
  const [dishonestyCount, setDishonestyCount] = useState(0);

  const { answers, newAnswer, removeAnswer } = useStudentAnswerStore();
  const { addHistory } = useStudentSubmitHistory();

  const currentAnswerSession = answers.find((a) => a.slug === slug);

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
        setCanUpdateDishonestyCount(false);
        setDishonestyCount(3);

        if (slug) removeAnswer(slug);
      },
    }),
  );

  useEffect(() => {
    if (slug) getQuestionMutation.mutate({ slug });
  }, [slug]);

  useEffect(() => {
    if (slug && !answers.find((a) => a.slug === slug)) newAnswer(slug);
  }, [slug, answers, newAnswer]);

  useEffect(() => {
    if (currentAnswerSession) {
      const currentCount = currentAnswerSession.dishonestCount ?? 0;

      if (canUpdateDishonestyCount) {
        setDishonestyCount(currentCount);
      }
    }
  }, [currentAnswerSession, canUpdateDishonestyCount]);

  useEffect(() => {
    if (getQuestionMutation.data) {
      setExamData(getQuestionMutation.data);
    }
  }, [getQuestionMutation.data]);

  const triggerBlocklist = () => {
    if (examData && currentAnswerSession) {
      blocklistMutation.mutate({
        questionId: examData.id,
        time: new Date(),
        activityLog: currentAnswerSession.dishonestLog,
      });
    }
  };
  const triggerRefresh = (onSettled: () => void, onSuccess: () => void) => {
    getQuestionMutation.mutate(
      { slug },
      {
        onSettled,
        onSuccess,
      },
    );
  };
  const submitAnswer = (data: RouterInputs["exam"]["submitAnswer"]) =>
    submitMutation.mutate(data);

  // 1. Loading
  if (getQuestionMutation.isPending && !examData) {
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
  if (!examData) {
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
  if (blocklistMutation.isPending || dishonestyCount > 2) {
    return <Disqualification />;
  }

  // 5. Main Exam View
  return (
    <ActualTest
      examData={examData}
      currentAnswerSession={currentAnswerSession}
      slug={slug}
      dishonestyCount={dishonestyCount}
      submitPending={submitMutation.isPending}
      triggerRefresh={triggerRefresh}
      triggerBlocklist={triggerBlocklist}
      submitAnswer={submitAnswer}
      showAlert={showAlert}
      modalVisible={alertModal.visible}
      closeModal={closeAlert}
      modalTitle={alertModal.title}
      modalDescription={alertModal.description}
      modalButtons={alertModal.buttons}
    />
  );
}
