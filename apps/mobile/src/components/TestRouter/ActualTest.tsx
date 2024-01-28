import React from "react";
import { AppState, SafeAreaView, ScrollView, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import { router } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNetInfo } from "@react-native-community/netinfo";
import { FlashList } from "@shopify/flash-list";
import { Home } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { useAtom } from "jotai";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  AlertDialog,
  Button,
  H3,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { api } from "~/lib/api";
import { studentAnswerAtom } from "~/lib/atom";
import { RenderChoiceQuestion } from "./Renderer";
import { formSchema, shuffleArray, useDebounce } from "./utils";
import type { Props, TFormSchema } from "./utils";

function ActualTestConstructor({ data, initialData }: Props) {
  useKeepAwake();
  usePreventScreenCapture();

  const [checkIn] = React.useState(
    initialData.find((d) => d.slug === data.slug)?.checkIn
      ? new Date(
          initialData.find((d) => d.slug === data.slug)!
            .checkIn as unknown as string,
        )
      : new Date(),
  );

  const toast = useToastController();

  const [studentAnswers, setStudentAnswers] = useAtom(studentAnswerAtom);

  const blocklistMutation = api.exam.storeBlocklist.useMutation({
    onSuccess() {
      setStudentAnswers(
        studentAnswers.filter((answer) => answer.slug !== data.slug),
      );
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
      setStudentAnswers(
        studentAnswers.filter((answer) => answer.slug !== data.slug),
      );
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

  const { isConnected } = useNetInfo();

  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(
    appState.current,
  );

  // Toggle this initial state value for prod and dev
  const canUpdateDishonesty = React.useRef(true);

  console.log("canUpdateDishonesty", canUpdateDishonesty);

  const [dishonestyWarning, setDishonestyWarning] = React.useState(false);
  const [badInternetAlert, setBadInternet] = React.useState(false);

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  // Increment dishonesty count up to 3 tab changes.
  // The first two will ask kindly to not to cheat on their exam.
  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        canUpdateDishonesty.current
      )
        setDishonestyCount((prev) => {
          console.log("visible now");
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
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Track changes of user network status. User can turned on their
  // internet connection and safely continue their exam like normal.
  React.useEffect(() => {
    if (!isConnected) {
      canUpdateDishonesty.current = false;
      setBadInternet(true);
    }
  }, [isConnected]);

  const multipleChoiceDebounced = useDebounce(
    (updatedData: { iqid: number; choosedAnswer: number }) => {
      setStudentAnswers((prev) =>
        prev.map((answer) =>
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
      );
    },
  );

  const updateDishonestAtom = React.useCallback(
    (count: number) => {
      setStudentAnswers((prev) =>
        prev.map((answer) =>
          answer.slug === data.slug
            ? { ...answer, dishonestCount: count }
            : answer,
        ),
      );
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

  return (
    <View>
      <SafeAreaView>
        <YStack>
          <XStack
            display="flex"
            justifyContent="center"
            gap={15}
            mt={30}
            mb={10}
          >
            <AlertDialog>
              <AlertDialog.Trigger asChild>
                <Button icon={<Home size={20} />} />
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay
                  key="overlay"
                  animation="quick"
                  opacity={0.5}
                  enterStyle={{ opacity: 0 }}
                  exitStyle={{ opacity: 0 }}
                />
                <AlertDialog.Content
                  bordered
                  elevate
                  key="content"
                  animation={[
                    "quick",
                    {
                      opacity: {
                        overshootClamping: true,
                      },
                    },
                  ]}
                  enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                  exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                  x={0}
                  scale={1}
                  opacity={1}
                  y={0}
                >
                  <YStack space>
                    <AlertDialog.Title>Kembali ke beranda?</AlertDialog.Title>
                    <AlertDialog.Description>
                      Anda saat ini sedang mengerjakan soal. Jika anda kembali
                      maka semua jawaban dan status kecurangan masih tetap
                      tersimpan.
                    </AlertDialog.Description>

                    <XStack justifyContent="flex-end" space="$2">
                      <AlertDialog.Cancel asChild>
                        <Button>Batal</Button>
                      </AlertDialog.Cancel>

                      <Button onPress={() => router.replace("/")}>
                        Kembali
                      </Button>
                    </XStack>
                  </YStack>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog>

            <Button>22:18:21</Button>

            <AlertDialog>
              <AlertDialog.Trigger asChild>
                <Button>
                  <Text>{dishonestyCount}</Text>
                </Button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay
                  key="overlay"
                  animation="quick"
                  opacity={0.5}
                  enterStyle={{ opacity: 0 }}
                  exitStyle={{ opacity: 0 }}
                />
                <AlertDialog.Content
                  bordered
                  elevate
                  key="content"
                  animation={[
                    "quick",
                    {
                      opacity: {
                        overshootClamping: true,
                      },
                    },
                  ]}
                  enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                  exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                  x={0}
                  scale={1}
                  opacity={1}
                  y={0}
                >
                  <YStack space>
                    <AlertDialog.Title>Jumlah kecurangan</AlertDialog.Title>
                    <AlertDialog.Description>
                      Anda saat ini melakukan {dishonestyCount} kecurangan,
                      lebih dari dua (2) kecurangan maka anda akan dinyatakan
                      melakukan kecurangan.
                    </AlertDialog.Description>

                    <XStack justifyContent="flex-end" space="$2">
                      <AlertDialog.Cancel asChild>
                        <Button>Tutup</Button>
                      </AlertDialog.Cancel>
                    </XStack>
                  </YStack>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog>
          </XStack>
        </YStack>
      </SafeAreaView>

      <ScrollView>
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

              <YStack></YStack>
            </YStack>
          ) : null}

          <XStack>
            <XStack flex={1} />
            <Button onPress={form.handleSubmit(onSubmit)}>Submit</Button>
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
