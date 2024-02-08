import React from "react";
import { SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { Spinner, YStack } from "tamagui";

import { ActualTest } from "~/components/TestRouter/ActualTest";
import { api } from "~/lib/api";
import { studentAnswerAtom } from "~/lib/atom";

const TestPage = () => {
  const initialAnswer = useAtomValue(studentAnswerAtom);

  const { slug } = useLocalSearchParams();

  const apiUtils = api.useUtils();
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

  const refetchQuestion = React.useCallback(
    () =>
      void apiUtils.exam.queryQuestion.invalidate({
        slug: (slug as string) ?? "",
      }),
    [],
  );

  if (questionQuery.isLoading || questionQuery.isRefetching)
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
      initialData={initialAnswer.answers}
      refetch={refetchQuestion}
    />
  );
};

export default React.memo(TestPage);
