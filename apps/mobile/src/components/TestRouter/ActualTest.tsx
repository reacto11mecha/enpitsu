import React from "react";
import {
  AppState,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { Link } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetInfo } from "@react-native-community/netinfo";
import { FlashList } from "@shopify/flash-list";
import { useToastController } from "@tamagui/toast";
import { useSetAtom } from "jotai";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button, H3, Spinner, Text, XStack, YStack } from "tamagui";

import { useCountdown } from "~/hooks/useCountdown";
import { api } from "~/lib/api";
import { studentAnswerAtom } from "~/lib/atom";
import {
  BadInternetAlert,
  DihonestyAlert,
  DishonestyCountAlert,
  GoHomeAlert,
} from "./AllAlert";
import { RenderChoiceQuestion, RenderEssayQuestion } from "./Renderer";
import { formSchema, shuffleArray, useDebounce } from "./utils";
import type {
  TFormSchema,
  TPropsRealTest,
  TPropsWrapper,
  TSubmitAnswerParam,
  TSubmitCheatParam,
} from "./utils";

const RealActualTest = React.memo(function ActualTest({
  data,
  refetch,
  initialData,
  isSubmitLoading,
  submitAnswer,
  currDishonestCount,
  updateDishonestCount,
  submitCheated,
}: TPropsRealTest) {
  usePreventScreenCapture();

  const setStudentAnswers = useSetAtom(studentAnswerAtom);

  const [checkIn] = React.useState(
    initialData.find((d) => d.slug === data.slug)?.checkIn
      ? new Date(
          initialData.find((d) => d.slug === data.slug)!
            .checkIn as unknown as string,
        )
      : new Date(),
  );

  const { isConnected } = useNetInfo();

  const appState = React.useRef(AppState.currentState);

  // Toggle this initial state value for prod and dev
  const canUpdateDishonesty = React.useRef(true);

  const [dishonestyWarning, setDishonestyWarning] = React.useState(false);
  const [badInternetAlert, setBadInternet] = React.useState(false);

  const closeDishonestyAlert = React.useCallback(() => {
    canUpdateDishonesty.current = true;
    setDishonestyWarning(false);
  }, []);
  const closeBadInternet = React.useCallback(() => {
    if (isConnected) {
      canUpdateDishonesty.current = true;
      setBadInternet(false);
    }
  }, [isConnected]);

  const defaultFormValues = React.useMemo(
    () => ({
      multipleChoices: shuffleArray(
        data.multipleChoices.map((d) => {
          const savedAnswer = initialData.find((d) => d.slug === data.slug);

          return {
            ...d,
            options: shuffleArray(d.options),
            choosedAnswer:
              savedAnswer?.multipleChoices.find(
                (choice) => choice.iqid === d.iqid,
              )?.choosedAnswer ?? 0,
          };
        }),
      ),

      essays: shuffleArray(
        data.essays.map((d) => {
          const savedAnswer = initialData.find((d) => d.slug === data.slug);

          return {
            ...d,
            answer:
              savedAnswer?.essays.find((choice) => choice.iqid === d.iqid)
                ?.answer ?? "",
          };
        }),
      ),
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const multipleChoicesField = useFieldArray({
    control: form.control,
    name: "multipleChoices",
  });

  const essaysField = useFieldArray({
    control: form.control,
    name: "essays",
  });

  const { countdown, isEnded } = useCountdown(data.endedAt);

  // Increment dishonesty count up to 3 app changes.
  // The first two will ask kindly to not to cheat on their exam.
  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        canUpdateDishonesty.current
      )
        updateDishonestCount((prev) => {
          const newValue = ++prev;

          if (newValue > 2) {
            canUpdateDishonesty.current = false;
          } else if (newValue < 3) {
            canUpdateDishonesty.current = false;
            setDishonestyWarning(true);
          }

          if (newValue > 0)
            void setStudentAnswers(async (prev) => {
              const original = await prev;
              const currAnswers = original.answers;

              return {
                answers: currAnswers.map((answer) =>
                  answer.slug === data.slug
                    ? { ...answer, dishonestCount: newValue }
                    : answer,
                ),
              };
            });

          if (newValue > 2)
            submitCheated({ questionId: data.id, time: new Date() });

          return newValue;
        });

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track changes of user network status. User can turned on their
  // internet connection and safely continue their exam like normal.
  React.useEffect(() => {
    if (!isConnected && isConnected !== null) {
      canUpdateDishonesty.current = false;
      setBadInternet(true);
    }
  }, [isConnected]);

  const multipleChoiceDebounced = useDebounce(
    (updatedData: { iqid: number; choosedAnswer: number }) => {
      void setStudentAnswers(async (prev) => {
        const original = await prev;
        const currAnswers = original.answers;

        return {
          answers: currAnswers.map((answer) =>
            answer.slug === data.slug
              ? {
                  ...answer,
                  multipleChoices: !answer.multipleChoices.find(
                    (choice) => choice.iqid === updatedData.iqid,
                  )
                    ? [...answer.multipleChoices, updatedData]
                    : answer.multipleChoices.map((choice) =>
                        choice.iqid === updatedData.iqid ? updatedData : choice,
                      ),
                }
              : answer,
          ),
        };
      });
    },
  );

  const essayDebounce = useDebounce(
    (updatedData: { iqid: number; answer: string }) => {
      void setStudentAnswers(async (prev) => {
        const original = await prev;
        const currAnswers = original.answers;

        return {
          answers: currAnswers.map((answer) =>
            answer.slug === data.slug
              ? {
                  ...answer,
                  essays: !answer.essays.find(
                    (choice) => choice.iqid === updatedData.iqid,
                  )
                    ? [...answer.essays, updatedData]
                    : answer.essays.map((essay) =>
                        essay.iqid === updatedData.iqid ? updatedData : essay,
                      ),
                }
              : answer,
          ),
        };
      });
    },
  );

  const onSubmit = (values: TFormSchema) => {
    canUpdateDishonesty.current = false;

    submitAnswer({
      multipleChoices: values.multipleChoices.map((choice) => ({
        iqid: choice.iqid,
        choosedAnswer: choice.choosedAnswer,
      })),
      essays: values.essays.map((essay) => ({
        iqid: essay.iqid,
        answer: essay.answer,
      })),
      questionId: data.id,
      checkIn,
      submittedAt: new Date(),
    });
  };

  if (isEnded)
    return (
      <SafeAreaView>
        <YStack
          h="100%"
          display="flex"
          jc="center"
          ai="center"
          gap={20}
          px={20}
        >
          <H3>Waktu Habis</H3>
          <Text textAlign="center">
            Waktu ulangan sudah selesai, anda tidak bisa mengerjakan soal ini
            lagi.
          </Text>

          <Link href="/" replace asChild>
            <Button variant="outlined">Ke halaman depan</Button>
          </Link>
        </YStack>
      </SafeAreaView>
    );

  return (
    <View>
      <SafeAreaView>
        <DihonestyAlert open={dishonestyWarning} close={closeDishonestyAlert} />

        <BadInternetAlert
          open={badInternetAlert}
          close={closeBadInternet}
          backOnline={isConnected}
        />

        <YStack>
          <XStack
            display="flex"
            justifyContent="center"
            gap={15}
            mt={30}
            mb={10}
          >
            <GoHomeAlert />

            <Button variant="outlined">{countdown}</Button>

            <DishonestyCountAlert dishonestyCount={currDishonestCount} />
          </XStack>
        </YStack>
      </SafeAreaView>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
      >
        <YStack display="flex" mb={100} gap={30} px={20}>
          {multipleChoicesField.fields.length > 0 ? (
            <YStack mt={15} display="flex" gap={20}>
              <H3>Pilihan ganda</H3>

              <YStack minHeight={35}>
                <FlashList
                  data={multipleChoicesField.fields}
                  renderItem={({ index, item }) => (
                    <Controller
                      control={form.control}
                      name={`multipleChoices.${index}.choosedAnswer`}
                      render={({ field }) => (
                        <RenderChoiceQuestion
                          index={index}
                          item={item}
                          disabled={isSubmitLoading}
                          currPick={field.value}
                          updateAnswer={(order: number) => {
                            field.onChange(order);

                            multipleChoiceDebounced({
                              iqid: item.iqid,
                              choosedAnswer: order,
                            });
                          }}
                        />
                      )}
                    />
                  )}
                  estimatedItemSize={40}
                />
              </YStack>
            </YStack>
          ) : null}

          {essaysField.fields.length > 0 ? (
            <YStack mt={15} display="flex" gap={20}>
              <H3>Esai</H3>

              <YStack minHeight={35}>
                <FlashList
                  data={essaysField.fields}
                  renderItem={({ index, item }) => (
                    <Controller
                      control={form.control}
                      name={`essays.${index}.answer` as const}
                      render={({ field }) => (
                        <RenderEssayQuestion
                          item={item}
                          currAnswer={field.value}
                          disabled={isSubmitLoading}
                          index={index}
                          updateAnswer={(answer) => {
                            field.onChange(answer);

                            essayDebounce({
                              iqid: item.iqid,
                              answer,
                            });
                          }}
                        />
                      )}
                    />
                  )}
                  estimatedItemSize={40}
                />
              </YStack>
            </YStack>
          ) : null}

          <XStack>
            <XStack flex={1} />
            <Button
              chromeless
              onPress={form.handleSubmit(onSubmit)}
              disabled={isSubmitLoading}
            >
              {isSubmitLoading ? <Spinner /> : null} SUBMIT
            </Button>
          </XStack>
        </YStack>
      </ScrollView>
    </View>
  );
});

function TestWrapper({ data, refetch, initialData }: TPropsWrapper) {
  useKeepAwake();

  const toast = useToastController();

  const setStudentAnswers = useSetAtom(studentAnswerAtom);

  const blocklistMutation = api.exam.storeBlocklist.useMutation({
    onSuccess() {
      void setStudentAnswers(async (prev) => {
        const original = await prev;
        const currAnswers = original.answers;

        return {
          answers: currAnswers.filter((answer) => answer.slug !== data.slug),
        };
      });
    },
    onError(error) {
      toast.show("Operasi Gagal", {
        message: `Gagal menyimpan status kecurangan. Error: ${error.message}`,
      });
    },
    retry: false,
  });

  const submitAnswerMutation = api.exam.submitAnswer.useMutation({
    onSuccess() {
      void setStudentAnswers(async (prev) => {
        const original = await prev;
        const currAnswers = original.answers;

        return {
          answers: currAnswers.filter((answer) => answer.slug !== data.slug),
        };
      });
    },
    onError(error) {
      toast.show("Operasi Gagal", {
        message: `Gagal menyimpan jawaban. Error: ${error.message}`,
      });
    },
    retry: false,
  });

  const [dishonestyCount, setDishonestyCount] = React.useState(
    initialData.find((d) => d.slug === data.slug)?.dishonestCount ?? 0,
  );

  const isSubmitLoading = React.useMemo(
    () => submitAnswerMutation.isLoading,
    [submitAnswerMutation.isLoading],
  );

  const submitAnswer = React.useCallback(
    (params: TSubmitAnswerParam) => submitAnswerMutation.mutate(params),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const currDishonestCount = React.useMemo(
    () => dishonestyCount,
    [dishonestyCount],
  );
  const updateDishonestCount = React.useCallback(
    (count: React.SetStateAction<number>) => setDishonestyCount(count),
    [],
  );

  const submitCheated = React.useCallback(
    (params: TSubmitCheatParam) => blocklistMutation.mutate(params),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (submitAnswerMutation.isSuccess)
    return (
      <SafeAreaView>
        <YStack
          h="100%"
          display="flex"
          jc="center"
          ai="center"
          gap={20}
          px={20}
        >
          <H3>Berhasil Submit</H3>
          <Text textAlign="center">
            Jawaban berhasil terkirim, anda bisa menunjukan ini ke pengawas
            ruangan bahwa jawaban anda sudah di submit dengan aman. Screenshot
            bukti ini untuk berjaga-jaga.
          </Text>

          <Text>Kode Soal: {data.slug}</Text>

          <Link href="/" replace asChild>
            <Button variant="outlined">Ke halaman depan</Button>
          </Link>
        </YStack>
      </SafeAreaView>
    );

  if (dishonestyCount > 2)
    return (
      <SafeAreaView>
        <YStack
          h="100%"
          display="flex"
          jc="center"
          ai="center"
          gap={20}
          px={20}
        >
          <H3>Anda Melakukan Kecurangan</H3>
          <Text textAlign="center">
            Anda sudah tiga kali beralih dari aplikasi ini,{" "}
            {!blocklistMutation.isLoading && blocklistMutation.isSuccess ? (
              <>
                kami berhasil menyimpan status anda sudah melakukan kecurangan.
                Anda akan terlihat oleh panitia sudah melakukan kecurangan, lain
                kali jangan di ulangi lagi.
              </>
            ) : (
              <>
                {blocklistMutation.isError ? (
                  <>
                    kami gagal menyimpan status kecurangan anda, anda bisa
                    logout untuk me-reset status kecurangan pada browser
                    perangkat anda dan login kembali.
                  </>
                ) : (
                  <>kami sedang menyimpan status kecurangan anda...</>
                )}
              </>
            )}
          </Text>

          <Text>Kode Soal: {data.slug}</Text>

          <Link href="/" replace asChild>
            <Button variant="outlined">Ke halaman depan</Button>
          </Link>
        </YStack>
      </SafeAreaView>
    );

  return (
    <RealActualTest
      data={data}
      refetch={refetch}
      initialData={initialData}
      isSubmitLoading={isSubmitLoading}
      submitAnswer={submitAnswer}
      currDishonestCount={currDishonestCount}
      updateDishonestCount={updateDishonestCount}
      submitCheated={submitCheated}
    />
  );
}

export const ActualTest = React.memo(
  TestWrapper,
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data),
);
