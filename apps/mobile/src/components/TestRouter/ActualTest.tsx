import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { WebView } from "react-native-webview";
import { useKeepAwake } from "expo-keep-awake";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import { Home } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { useAtom } from "jotai";
import { useFieldArray, useForm } from "react-hook-form";
import {
  AlertDialog,
  // RadioGroup,
  Button,
  Card,
  H3,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { api } from "~/lib/api";
import { studentAnswerAtom } from "~/lib/atom";
import {
  formSchema,
  shuffleArray,
  // useDebounce
} from "./utils";
import type { Props, TFormSchema } from "./utils";

function ActualTestConstructor({ data, initialData }: Props) {
  useKeepAwake();

  // const [checkIn] = React.useState(
  //   initialData.find((d) => d.slug === data.slug)?.checkIn
  //     ? new Date(
  //       initialData.find((d) => d.slug === data.slug)!
  //         .checkIn as unknown as string,
  //     )
  //     : new Date(),
  // );

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
                  <Card elevate size="$4" bordered mt={index > 0 ? 15 : 0}>
                    <Card.Header padded>
                      <WebView source={{ html: item.question }} />
                      {/* <Paragraph theme="alt2">Now available</Paragraph> */}
                    </Card.Header>
                    <Card.Footer padded>
                      {/* <XStack flex={1} /> */}
                      {/* <Button borderRadius="$10">Purchase</Button> */}
                    </Card.Footer>
                  </Card>
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
            <Button>Submit</Button>
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
