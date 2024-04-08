import { memo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useAtom } from "jotai";

// import { ActualTest } from "~/components/TestRouter/ActualTest";
import { api } from "~/lib/api";
import { studentAnswerAtom } from "~/lib/atom";

const TestPage = () => {
  const [_initialAnswer, setStudentAnswers] = useAtom(studentAnswerAtom);

  const { slug } = useLocalSearchParams();

  const apiUtils = api.useUtils();
  const questionQuery = api.exam.queryQuestion.useQuery(
    {
      slug: (slug as string) ?? "",
    },
    {
      onSuccess() {
        // @ts-expect-error idk why, weird
        void setStudentAnswers(async (prev) => {
          const original = await prev;
          const currAnswers = original.answers;

          return {
            answers: !currAnswers.find((answer) => answer.slug === slug)
              ? [
                  ...currAnswers,
                  {
                    slug,
                    checkIn: new Date(),
                    dishonestCount: 0,
                    multipleChoices: [],
                    essays: [],
                  },
                ]
              : currAnswers,
          };
        });
      },
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  const _refetchQuestion = useCallback(
    () =>
      void apiUtils.exam.queryQuestion.invalidate({
        slug: (slug as string) ?? "",
      }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (questionQuery.isError) return <SafeAreaView></SafeAreaView>;

  if (questionQuery.isLoading || questionQuery.isRefetching)
    return <SafeAreaView></SafeAreaView>;

  return <SafeAreaView></SafeAreaView>;
};

export default memo(TestPage);
