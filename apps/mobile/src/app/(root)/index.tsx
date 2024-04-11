import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { api } from "~/lib/api";

export default function HomePage() {
  const [isCorrect, setCorrect] = useState(false);

  const closeQuestionScan = useCallback(() => setCorrect(false), []);

  const studentQuery = api.exam.getStudent.useQuery(undefined, {
    onError(error) {
      console.log(error);
    },
    onSuccess(data) {
      console.log(data);
    },
  });

  return (
    <View className="flex flex h-screen items-center justify-center">
      <View className="rounded-lg border border dark:border-gray-600 sm:w-[450px]">
        <View className="flex flex-col space-y-1.5 p-6">
          <Text className="text-4xl font-semibold leading-none dark:text-gray-50">
            Sebelum Mengerjakan,
          </Text>
          <Text className="text-muted-foreground text-justify text-2xl text-sm dark:text-gray-200">
            Pastikan identitas anda sudah benar dan sesuai dengan yang tertera
            pada kartu ujian.
          </Text>
        </View>

        <View className="h-2 w-[100%] border dark:border-gray-600" />

        <View className="flex flex-col p-6"></View>
      </View>
    </View>
  );
}
