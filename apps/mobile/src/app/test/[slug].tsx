import { memo, useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useAtom } from "jotai";
import { ArrowLeft, RefreshCw } from "lucide-react-native";

import { ActualTest } from "~/components/TestRouter/ActualTest";
import { api } from "~/lib/api";
import { studentAnswerAtom } from "~/lib/atom";

const TestPage = () => {
  const [initialAnswer, setStudentAnswers] = useAtom(studentAnswerAtom);

  const [iconAssets] = useAssets([require("../../../assets/icon.png")]);

  const [rendererAssets] = useAssets([
    require("@enpitsu/native-renderer/dist/index.html"),
  ]);

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

  const actualInitialAnswer = useMemo(
    () => initialAnswer?.answers.find((answer) => answer.slug === slug),
    [initialAnswer, slug],
  );

  const refetchQuestion = useCallback(
    () =>
      void apiUtils.exam.queryQuestion.invalidate({
        slug: (slug as string) ?? "",
      }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (questionQuery.isError)
    return (
      <View className="flex h-screen w-screen flex-col items-center justify-center gap-8 p-3">
        <View className="flex flex-col items-center gap-3 text-center">
          <Text className="text-center font-[IBMPlex] text-3xl font-semibold tracking-tight text-red-600 first:mt-0 dark:text-red-500">
            Terjadi Kesalahan
          </Text>
          <Text className="text-center text-lg/8 dark:text-stone-100">
            {questionQuery.error.message}
          </Text>
        </View>

        <Text className="text-stone-900/80 dark:text-stone-50/80">
          Kode soal: {slug}
        </Text>

        <Pressable
          className="flex h-[45] w-24 items-center justify-center rounded-lg border border-none bg-stone-900 text-stone-900 dark:border-stone-700 dark:bg-transparent disabled:dark:bg-stone-400"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        >
          <ArrowLeft color="#EAEAEA" size={30} />
        </Pressable>
      </View>
    );

  if (
    questionQuery.isLoading ||
    questionQuery.isRefetching ||
    !actualInitialAnswer ||
    !rendererAssets
  )
    return (
      <View className="flex h-screen items-center justify-center">
        <View>
          {iconAssets ? (
            <Image
              source={iconAssets[0]!.uri}
              style={{ borderRadius: 20, width: 190, height: 190 }}
            />
          ) : null}
        </View>

        <View className="mt-10 animate-spin">
          <RefreshCw color="#15803D" size={40} />
        </View>
      </View>
    );

  return (
    <ActualTest
      data={questionQuery.data}
      initialData={actualInitialAnswer}
      refetch={refetchQuestion}
      webviewAsset={rendererAssets[0]}
    />
  );
};

export default memo(TestPage);
