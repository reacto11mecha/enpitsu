import { Button, Text, TextInput, View } from "react-native";
import { fetch } from "expo/fetch";
import { useAuthStore } from "@/hooks/useStorage";
import { toast } from "@/lib/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { validateId } from "@enpitsu/token-generator";

interface Response {
  data: {
    name: string;
    npsn: number;
    uri: string;
  };
}

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

const formSchema = z.object({
  instance: z.number(),
  token: z
    .string()
    .min(1, {
      message: "Nomor peserta wajib di isi!",
    })
    .min(13, { message: "Panjang nomor peserta wajib 13 karakter!" })
    .max(14, { message: "Panjang nomor peserta tidak boleh dari 14 karakter!" })
    .refine(validateId, { message: "Format token tidak sesuai!" }),
});

export default function LoginScreen() {
  const { logIn } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = await getSchoolData(values.instance);

    if (data) {
      logIn({
        instanceName: data.name,
        npsn: data.npsn,
        serverUrl: data.uri,
        token: values.token,
      });
    } else {
      toast.error("Instansi tidak dapat ditemukan", {
        description: "Mohon periksa kembali nomor yang anda masukkan.",
      });
    }
  }

  return (
    <View>
      <Text>えんぴつ | Login</Text>
      <View>
        <Text>Nomor Instansi</Text>
        <Controller
          control={control}
          name="instance"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              onBlur={onBlur}
              onChangeText={(val) =>
                !isSubmitting && onChange(val ? parseInt(val, 10) : "")
              }
              value={String(value ?? "")}
              placeholder="Masukkan kode instansi disini."
              keyboardType="numeric"
            />
          )}
        />
        {errors.instance && (
          <Text style={{ color: "red" }}>{errors.instance.message}</Text>
        )}

        <Text>Nomor Peserta</Text>
        <Controller
          control={control}
          name="token"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              onBlur={onBlur}
              onChangeText={!isSubmitting ? onChange : () => {}}
              value={value}
              placeholder="Masukkan token ujianmu"
            />
          )}
        />
        {errors.token && (
          <Text style={{ color: "red" }}>{errors.token.message}</Text>
        )}

        <Button
          title="Submit"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}
