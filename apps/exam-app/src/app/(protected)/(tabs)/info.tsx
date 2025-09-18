import { Text, View } from "react-native";
import { Identity } from "@/components/identity";

export default function AboutScreen() {
  return (
    <View>
      <Identity title="Identitas anda" />

      <Text>
        Disini natinya bakalan nampilin soal soal apa aja yang udah disubmit.
        Bakalan ada detail nama soal, kode soal, waktu mulai, waktu selesai,
        durasi.
      </Text>
    </View>
  );
}
