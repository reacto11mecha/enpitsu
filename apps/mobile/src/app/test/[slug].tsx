import { memo, useCallback } from "react";
import { View } from "react-native";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useAtom } from "jotai";
import { RefreshCw } from "lucide-react-native";

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

  const refetchQuestion = useCallback(
    () =>
      void apiUtils.exam.queryQuestion.invalidate({
        slug: (slug as string) ?? "",
      }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (questionQuery.isError) return <View></View>;

  if (questionQuery.isLoading || questionQuery.isRefetching || !rendererAssets)
    return (
      <View className="flex h-screen items-center justify-center">
        {iconAssets ? (
          <View>
            <Image
              width={190}
              height={190}
              source={iconAssets[0]}
              style={{ borderRadius: 20 }}
            />
          </View>
        ) : null}

        <View className="mt-10 animate-spin">
          <RefreshCw color="#15803D" size={40} />
        </View>
      </View>
    );

  return (
    <ActualTest
      data={questionQuery.data}
      initialData={initialAnswer.answers}
      refetch={refetchQuestion}
      webviewAsset={rendererAssets[0]}
    />
  );
};

export default memo(TestPage);
