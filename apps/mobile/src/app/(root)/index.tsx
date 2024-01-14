import React from "react";
import { SafeAreaView, ToastAndroid } from "react-native";
import { Link, Stack } from "expo-router";
import { Settings as SettingsIcon } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import {
  Button,
  Card,
  H3,
  Paragraph,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { ScanOrInputQuestionSlug } from "~/components/IndexRouter/ScanOrInputQuestionSlug";
import { api } from "~/lib/api";
import { studentTokenAtom } from "~/lib/atom";

const getState = (statusCode: string) => {
  switch (statusCode) {
    case "NOT_FOUND":
    default:
      return "Mohon perbaiki token anda di halaman pengaturan.";
  }
};

const Index = () => {
  const [token] = useAtom(studentTokenAtom);

  const [isCorrect, setCorrect] = React.useState(false);

  const closeQuestionScan = React.useCallback(() => setCorrect(false), []);

  const studentQuery = api.exam.getStudent.useQuery(undefined, {
    onError(error) {
      if (error.data?.code === "UNAUTHORIZED" && token === "") {
        ToastAndroid.showWithGravity(
          "Mohon isi token anda!",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }

      setCorrect(false);
    },
  });

  if (!studentQuery.isError && isCorrect)
    return <ScanOrInputQuestionSlug closeScanner={closeQuestionScan} />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <SafeAreaView>
        <YStack h="100%" d="flex" jc="center" px={20}>
          <Card elevate>
            <Card.Header>
              <YStack gap={10}>
                <YStack>
                  <H3>Sebelum Mengerjakan,</H3>

                  <Paragraph>
                    Pastikan identitas anda sudah benar dan sesuai dengan yang
                    tertera pada kartu ujian.
                  </Paragraph>
                </YStack>

                <YStack>
                  {studentQuery.isRefetching || studentQuery.isLoading ? (
                    <Spinner size="large" />
                  ) : (
                    <>
                      {studentQuery.isError ? (
                        <YStack gap={10}>
                          <Text color="red">
                            Terjadi kesalahan, {studentQuery.error.message}{" "}
                            {getState(studentQuery.error.data!.code)}
                          </Text>
                          <YStack>
                            <Link href="/settings/" asChild>
                              <Button icon={<SettingsIcon size={20} />} />
                            </Link>
                          </YStack>
                        </YStack>
                      ) : (
                        <YStack gap={10}>
                          <YStack>
                            <XStack gap={5}>
                              <Text fontWeight="bold">No Peserta:</Text>
                              <Text fontFamily={"SpaceMono_400Regular"}>
                                {studentQuery.data.student.participantNumber}
                              </Text>
                            </XStack>
                            <XStack gap={5}>
                              <Text fontWeight="bold">Nama:</Text>
                              <Text>{studentQuery.data.student.name}</Text>
                            </XStack>
                            <XStack gap={5}>
                              <Text fontWeight="bold">Kelas:</Text>
                              <Text>
                                {studentQuery.data.student.subgrade.grade.label}{" "}
                                {studentQuery.data.student.subgrade.label}
                              </Text>
                            </XStack>
                            <XStack gap={5}>
                              <Text fontWeight="bold">Ruangan:</Text>
                              <Text>{studentQuery.data.student.room}</Text>
                            </XStack>
                            <XStack gap={5}>
                              <Text fontWeight="bold">Token:</Text>
                              <Text fontFamily={"SpaceMono_400Regular"}>
                                {studentQuery.data.student.token}
                              </Text>
                            </XStack>
                          </YStack>
                          <YStack>
                            <XStack gap={3} w="100%">
                              <Link href="/settings/" asChild>
                                <Button
                                  icon={<SettingsIcon size={20} />}
                                  w="15%"
                                />
                              </Link>
                              <Button w="85%" onPress={() => setCorrect(true)}>
                                Ya, sudah benar
                              </Button>
                            </XStack>
                          </YStack>
                        </YStack>
                      )}
                    </>
                  )}
                </YStack>
              </YStack>
            </Card.Header>
          </Card>
        </YStack>
      </SafeAreaView>
    </>
  );
};

export default Index;
