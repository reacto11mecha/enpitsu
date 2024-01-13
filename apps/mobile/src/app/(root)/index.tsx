import React from "react";
import { SafeAreaView, ToastAndroid } from "react-native";
import { Link, Stack } from "expo-router";
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

import { api } from "~/lib/api";
import { studentTokenAtom } from "~/lib/atom";

const Index = () => {
  const [token] = useAtom(studentTokenAtom);
  const studentQuery = api.exam.getStudent.useQuery(undefined, {
    onError(error) {
      if (error.data?.code === "UNAUTHORIZED" && token === "") {
        ToastAndroid.showWithGravity(
          "Mohon isi token anda!",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
    },
  });

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
                  {studentQuery.isError ? (
                    <></>
                  ) : (
                    <>
                      {studentQuery.isLoading ? (
                        <Spinner size="large" />
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
                            <XStack gap={3}>
                              <Link href="/settings/" asChild>
                                <Button>Pengaturan</Button>
                              </Link>
                              <Button>Ya, sudah benar</Button>
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
