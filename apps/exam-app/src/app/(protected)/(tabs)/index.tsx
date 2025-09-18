import { useState } from "react";
import { Pressable, Text, View } from "react-native";
// import { Link } from "expo-router";
import { Identity } from "@/components/identity";
import { ScanOrInputQuestionSlug } from "@/components/scan-or-input-question-slug";

export default function HomeScreen() {
  const [isCorrect, setCorrect] = useState(false);
  return (
    <View>
      <Text>Home screen</Text>

      <Identity title="Sebelum mengerjakan," />

      {!isCorrect ? (
        <View style={{ paddingRight: 15, paddingLeft: 15 }}>
          <Pressable
            onPress={() => setCorrect(true)}
            style={{
              backgroundColor: "aquamarine",
              marginTop: 20,
              borderRadius: 20,
            }}
          >
            <Text style={{ textAlign: "center" }}>Ya, sudah benar</Text>
          </Pressable>
        </View>
      ) : (
        <ScanOrInputQuestionSlug />
      )}
    </View>
  );
}
