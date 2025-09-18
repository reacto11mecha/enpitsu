import { useEffect } from "react";
import { Alert, Text, View } from "react-native";
import { useAuthStore } from "@/hooks/useStorage";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function Identity({ title }: { title: string }) {
  const { instanceName } = useAuthStore();
  const trpc = useTRPC();

  const studentQuery = useQuery(trpc.exam.getStudent.queryOptions());

  useEffect(() => {
    if (studentQuery.error) {
      Alert.alert(
        "Gagal mengambil data pribadi",
        `Operasi mengambil data gagal, mohon coba lagi. Error: ${
          studentQuery.error.message === "Failed to fetch"
            ? "Gagal meraih server"
            : studentQuery.error.message
        }`,
      );
    }
  }, [studentQuery.error]);

  return (
    <View>
      <Text>{title}</Text>
      <Text>
        Pastikan identitas anda sudah benar dan sesuai dengan yang tertera pada
        kartu ujian.
      </Text>

      <Text>No Peserta: {studentQuery.data?.student.participantNumber}</Text>
      <Text>Nama: {studentQuery.data?.student.name}</Text>
      <Text>
        Kelas: {studentQuery.data?.student.subgrade.grade.label}{" "}
        {studentQuery.data?.student.subgrade.label}
      </Text>
      <Text>Ruangan: {studentQuery.data?.student.room}</Text>
      <Text>Token: {studentQuery.data?.student.token}</Text>
      <Text>Instansi: {instanceName}</Text>
    </View>
  );
}
