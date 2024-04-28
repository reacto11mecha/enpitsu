import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ScanOrInputQuestionSlug } from "~/components/IndexRouter/ScanOrInputQuestionSlug";
import { api } from "~/lib/api";

function LoadingComponent() {
  return <View></View>;
}

function Separator() {
  return (
    <View className="h-1 w-[390px] border-t border-stone-300 dark:border-stone-700" />
  );
}

export default function HomePage() {
  const [isCorrect, setCorrect] = useState(false);

  const closeQuestionScan = useCallback(() => setCorrect(false), []);

  const studentQuery = api.exam.getStudent.useQuery(undefined, {
    onError(error) {
      console.log(error);
    },
  });

  if (!studentQuery.isError && isCorrect)
    return <ScanOrInputQuestionSlug closeScanner={closeQuestionScan} />;

  return (
    <View className="flex h-screen items-center justify-center p-3">
      <View className="-translate-y-16 rounded-lg border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-transparent sm:w-[450px]">
        <View className="flex flex-col p-6">
          <Text className="text-2xl font-semibold leading-none dark:text-gray-50">
            Sebelum Mengerjakan,
          </Text>
          <Text className="mt-1.5 text-justify text-xl dark:text-gray-100">
            Pastikan identitas anda sudah benar dan sesuai dengan yang tertera
            pada kartu ujian.
          </Text>
        </View>

        <Separator />

        <View className="flex flex-col gap-2 p-6">
          {!studentQuery.isLoading &&
          studentQuery.data &&
          studentQuery.data.student ? (
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Text className="dark:text-gray-50">No Peserta</Text>
                <Text className="px-1 dark:text-gray-50">:</Text>
              </View>
              <Text className="dark:text-gray-50">
                {studentQuery.data.student.participantNumber}
              </Text>
            </View>
          ) : (
            <LoadingComponent />
          )}

          {!studentQuery.isLoading &&
          studentQuery.data &&
          studentQuery.data.student ? (
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Text className="dark:text-gray-50">Nama</Text>
                <Text className="px-1 dark:text-gray-50">:</Text>
              </View>
              <Text className="dark:text-gray-50">
                {studentQuery.data.student.name}
              </Text>
            </View>
          ) : (
            <LoadingComponent />
          )}

          {!studentQuery.isLoading &&
          studentQuery.data &&
          studentQuery.data.student ? (
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Text className="dark:text-gray-50">Kelas</Text>
                <Text className="px-1 dark:text-gray-50">:</Text>
              </View>
              <Text className="dark:text-gray-50">
                {studentQuery.data.student.subgrade.grade.label}{" "}
                {studentQuery.data.student.subgrade.label}
              </Text>
            </View>
          ) : (
            <LoadingComponent />
          )}

          {!studentQuery.isLoading &&
          studentQuery.data &&
          studentQuery.data.student ? (
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Text className="dark:text-gray-50">Ruangan</Text>
                <Text className="px-1 dark:text-gray-50">:</Text>
              </View>
              <Text className="dark:text-gray-50">
                {studentQuery.data.student.room}
              </Text>
            </View>
          ) : (
            <LoadingComponent />
          )}

          {!studentQuery.isLoading &&
          studentQuery.data &&
          studentQuery.data.student ? (
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Text className="dark:text-gray-50">Token</Text>
                <Text className="px-1 dark:text-gray-50">:</Text>
              </View>
              <Text className="font-[IBMPlex] dark:text-gray-50">
                {studentQuery.data.student.token}
              </Text>
            </View>
          ) : (
            <LoadingComponent />
          )}
        </View>

        <Separator />

        <View className="flex flex-row p-6">
          <Pressable
            className="w-full rounded-lg bg-stone-900 p-2 dark:bg-stone-100"
            disabled={!studentQuery.data || studentQuery.isError}
            onPress={() => setCorrect(true)}
          >
            <Text className="text-center text-slate-50 dark:text-slate-800">
              Ya, sudah benar
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
