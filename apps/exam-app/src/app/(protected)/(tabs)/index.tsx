import { Button, Text, View } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View>
      <Text>Home screen</Text>

      <Link
        href={{
          pathname: "/(protected)/test/[slug]",
          params: {
            slug: "TEST-SLUG",
          },
        }}
        replace
        asChild
      >
        <Button title="Utiwi ulangan" />
      </Link>
    </View>
  );
}
