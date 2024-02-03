import React from "react";
import { SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAtom } from "jotai";
import { Spinner, YStack } from "tamagui";

import { ActualTest } from "~/components/TestRouter/ActualTest";
import { api } from "~/lib/api";
import { studentAnswerAtom } from "~/lib/atom";

const TestPage = () => {
  const [initialAnswer] = useAtom(studentAnswerAtom);

  const { slug } = useLocalSearchParams();

  const questionQuery = api.exam.queryQuestion.useQuery(
    {
      slug: (slug as string) ?? "",
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  console.log(questionQuery.isRefetching);

  const refetchQuestion = React.useCallback(
    () => questionQuery.refetch(),
    [questionQuery],
  );

  if (questionQuery.isLoading)
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
          <Spinner size="large" color="$blue10" />
        </YStack>
      </SafeAreaView>
    );

  if (questionQuery.isLoading)
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
          <Spinner size="large" color="$blue10" />
        </YStack>
      </SafeAreaView>
    );

  return (
    <ActualTest
      data={questionQuery.data!}
      isRefetching={questionQuery.isRefetching}
      refetch={refetchQuestion}
      initialData={initialAnswer}
    />
  );
};

export default TestPage;
