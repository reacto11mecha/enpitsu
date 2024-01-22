import React from "react";
import { SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "~/lib/api";
import { useAtom } from "jotai";
import { Spinner, YStack } from "tamagui"
import { studentAnswerAtom } from "~/lib/atom";

const TestPage = () => {
  const [initialAnswer] = useAtom(studentAnswerAtom);

  const { slug } = useLocalSearchParams();

  const questionQuery = api.exam.queryQuestion.useQuery(
    {
      slug: slug as string ?? "",
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  if (questionQuery.isLoading) return (
    <SafeAreaView>
      <YStack h="100%" d="flex" jc="center" ai="center" gap={20} px={20}>
        <Spinner size="large" color="$blue10" />
      </YStack>
    </SafeAreaView>
  )

  if (questionQuery.isLoading) return (
    <SafeAreaView>
      <YStack h="100%" d="flex" jc="center" ai="center" gap={20} px={20}>
        <Spinner size="large" color="$blue10" />
      </YStack>
    </SafeAreaView>
  )


  return <></>;
};

export default TestPage;
