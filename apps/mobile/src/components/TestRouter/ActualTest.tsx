import React from "react";
import {
  AppState,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { usePreventScreenCapture } from "expo-screen-capture";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetInfo } from "@react-native-community/netinfo";
import { FlashList } from "@shopify/flash-list";
import { useToastController } from "@tamagui/toast";
import { useAtom } from "jotai";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button, H3, Spinner, XStack, YStack } from "tamagui";

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
import type { Props, TFormSchema } from "./utils";

function ActualTestConstructor({
  data,
  isRefetching,
  refetch,
  initialData,
}: Props) {
  useKeepAwake();
  usePreventScreenCapture();

  console.log(initialData);

  const [checkIn] = React
    .useState
    // initialData.find((d) => d.slug === data.slug)?.checkIn
    //   ? new Date(
    //       initialData.find((d) => d.slug === data.slug)!
    //         .checkIn as unknown as string,
    //     )
    //   : new Date(),
    ();

  const toast = useToastController();

  const [, setStudentAnswers] = useAtom(studentAnswerAtom);

  const blocklistMutation = api.exam.storeBlocklist.useMutation({
    onSuccess() {
      void setStudentAnswers(async (prev) => {
        const prevAnswer = await prev;

        return prevAnswer.filter((answer) => answer.slug !== data.slug);
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
        const prevAnswer = await prev;

        return prevAnswer.filter((answer) => answer.slug !== data.slug);
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
    // initialData.find((d) => d.slug === data.slug)?.dishonestCount ?? 0,
    0,
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

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      multipleChoices: shuffleArray(
        data.multipleChoices.map((d) => {
          // const savedAnswer = initialData.find((d) => d.slug === data.slug);

          return {
            ...d,
            options: shuffleArray(d.options),
            choosedAnswer: 0,
            // savedAnswer?.multipleChoices.find(
            //   (choice) => choice.iqid === d.iqid,
            // )?.choosedAnswer ?? 0,
          };
        }),
      ),
      essays: shuffleArray(
        data.essays.map((d) => {
          // const savedAnswer = initialData.find((d) => d.slug === data.slug);

          return {
            ...d,
            answer: "",
            // savedAnswer?.essays.find((choice) => choice.iqid === d.iqid)
            // ?.answer ?? "",
          };
        }),
      ),
    },
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

  // Increment dishonesty count up to 3 tab changes.
  // The first two will ask kindly to not to cheat on their exam.
  React.useEffect(() => {
    void setStudentAnswers(async (prev) => {
      const prevAnswer = await prev;

      return !prevAnswer.find((answer) => answer.slug === data.slug)
        ? [
            ...prevAnswer,
            {
              slug: data.slug,
              checkIn,
              dishonestCount: 0,
              multipleChoices: [],
              essays: [],
            },
          ]
        : prevAnswer;
    });

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        canUpdateDishonesty.current
      )
        setDishonestyCount((prev) => {
          const newValue = ++prev;

          if (newValue > 2) {
            canUpdateDishonesty.current = false;
          } else if (newValue < 3) {
            canUpdateDishonesty.current = false;
            setDishonestyWarning(true);
          }

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
        const prevAnswer = await prev;

        return prevAnswer.map((answer) =>
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
        );
      });
    },
  );

  const essayDebounce = useDebounce(
    (updatedData: { iqid: number; answer: string }) => {
      void setStudentAnswers(async (prev) => {
        const prevAnswer = await prev;

        return prevAnswer.map((answer) =>
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
        );
      });
    },
  );

  const updateDishonestAtom = React.useCallback(
    (count: number) => {
      void setStudentAnswers(async (prev) => {
        const prevAnswer = await prev;

        return prevAnswer.map((answer) =>
          answer.slug === data.slug
            ? { ...answer, dishonestCount: count }
            : answer,
        );
      });
    },
    [data.slug, setStudentAnswers],
  );

  React.useEffect(() => {
    updateDishonestAtom(dishonestyCount);

    if (dishonestyCount > 2) {
      blocklistMutation.mutate({ questionId: data.id, time: new Date() });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishonestyCount]);

  const onSubmit = (values: TFormSchema) => {
    canUpdateDishonesty.current = false;

    submitAnswerMutation.mutate({
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

  if (submitAnswerMutation.isSuccess) return <SafeAreaView></SafeAreaView>;

  if (dishonestyCount > 2) return <SafeAreaView></SafeAreaView>;

  if (isEnded) return <SafeAreaView></SafeAreaView>;

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

            <Button>{countdown}</Button>

            <DishonestyCountAlert dishonestyCount={dishonestyCount} />
          </XStack>
        </YStack>
      </SafeAreaView>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <YStack display="flex" mb={100} gap={30} px={20}>
          {multipleChoicesField.fields.length > 0 ? (
            <YStack mt={15} display="flex" gap={20}>
              <H3>Pilihan ganda</H3>

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
                        disabled={submitAnswerMutation.isLoading}
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
          ) : null}

          {essaysField.fields.length > 0 ? (
            <YStack mt={15} display="flex" gap={20}>
              <H3>Esai</H3>

              <YStack>
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
                          disabled={submitAnswerMutation.isLoading}
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
              onPress={form.handleSubmit(onSubmit)}
              disabled={submitAnswerMutation.isLoading}
            >
              {submitAnswerMutation.isLoading ? <Spinner /> : null} Submit
            </Button>
          </XStack>
        </YStack>
      </ScrollView>
    </View>
  );
}

export const ActualTest = React.memo(
  ActualTestConstructor,
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data),
);
