import { Button, Text, View } from "react-native";
import { fetch } from "expo/fetch";
import { useAuthStore } from "@/hooks/useStorage";
import { toast } from "@/lib/sonner";

interface Response {
  data: {
    name: string;
    npsn: number;
    uri: string;
  };
}

export default function LoginScreen() {
  const { logIn } = useAuthStore();

  return (
    <View>
      <Text>Login screen</Text>
      <Button
        title="Simulasi login"
        onPress={async () => {
          const dummyNpsn = 31011102;

          const getSchoolData = async (npsn: number) => {
            const url = new URL(process.env.EXPO_PUBLIC_NPSN_SRV_URL!);
            const res = await fetch(`${url.origin}/api/school/${npsn}`, {
              headers: { Accept: "application/json" },
            });

            if (res.ok) {
              const { data } = (await res.json()) as Response;

              return data;
            }

            return null;
          };

          const data = await getSchoolData(dummyNpsn);

          if (data) {
            toast.success("Berhasil login!");

            logIn({
              instanceName: data.name,
              npsn: data.npsn,
              serverUrl: data.uri,
              token: "AXS-415",
            });
          }
        }}
      />
    </View>
  );
}
