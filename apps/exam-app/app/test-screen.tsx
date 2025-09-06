import { Text, View } from "react-native";

import { useExamSessionStatus } from "@/hooks/useExamSessionStatus";

export default function TestScreen() {
    const result = useExamSessionStatus();

    console.log(result)

    return (
        <View>
            <Text>Text of something</Text>
        </View>
    )
}