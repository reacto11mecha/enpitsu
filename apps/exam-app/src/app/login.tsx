import type { AdminResponse } from "@/hooks/useStorage";
import { useMemo, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { fetch } from "expo/fetch";
import { useAuthStore } from "@/hooks/useStorage";
import { toast } from "@/lib/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface HonResponse {
  data: {
    name: string;
    npsn: number;
    origin: string;
  };
}

type HonEssence = HonResponse["data"];

const getSchoolData = async (npsn: number) => {
  const url = new URL(process.env.EXPO_PUBLIC_NPSN_SRV_URL!);
  const res = await fetch(`${url.origin}/school/${npsn}`, {
    headers: { Accept: "application/json" },
  });

  if (res.ok) {
    const { data } = (await res.json()) as HonResponse;

    return data;
  } else {
    const { message: description } = (await res.json()) as { message: string };
    toast.error("Gagal mengambil data instansi", { description });
  }

  return null;
};

const getSchoolSettings = async (origin: string) => {
  const res = await fetch(`${origin}/api/settings`, {
    headers: { Accept: "application/json" },
  });

  if (res.ok) {
    const data = (await res.json()) as AdminResponse;

    return data;
  } else {
    toast.error("Gagal mengambil data pengatura sekolah", {
      description: "Mohon ulangi prosesnya sekali lagi.",
    });
  }

  return null;
};

const getInstanceFormSchema = z.object({
  instance: z.number(),
});

export default function LoginScreen() {
  const [honEssence, setHonEssence] = useState<HonEssence | null>(null);
  const [settingsState, setSettingState] = useState<AdminResponse | null>(null);

  if (!honEssence || !settingsState)
    return (
      <GetSchoolInfo
        honEssenceSetter={setHonEssence}
        settingsResponseSetter={setSettingState}
      />
    );

  return <ActualLogin honEssence={honEssence} settingsState={settingsState} />;
}

function GetSchoolInfo({
  honEssenceSetter,
  settingsResponseSetter,
}: {
  honEssenceSetter: (arg: HonEssence) => void;
  settingsResponseSetter: (arg: AdminResponse) => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getInstanceFormSchema),
  });

  async function onSubmit(values: z.infer<typeof getInstanceFormSchema>) {
    const schoolData = await getSchoolData(values.instance);

    if (schoolData) {
      honEssenceSetter(schoolData);

      const schoolSettings = await getSchoolSettings(schoolData.origin);

      if (schoolSettings) {
        settingsResponseSetter(schoolSettings);
      }
    }
  }

  return (
    <View>
      <Text>えんぴつ | enpitsu</Text>

      <Text>
        Selamat datang di aplikasi enpitsu. Untuk login, terlebih dahulu
        memasukan nomor instansi sekolah (NPSN) untuk melanjutkan ke tahap
        berikutnya.
      </Text>

      <View>
        <Text>Nomor Instansi</Text>
        <Controller
          control={control}
          name="instance"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              editable={!isSubmitting}
              style={{
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              onBlur={onBlur}
              onChangeText={(val) => onChange(val ? parseInt(val, 10) : "")}
              value={String(value ?? "")}
              placeholder="Masukkan kode instansi disini."
              keyboardType="numeric"
            />
          )}
        />
        <Text
          style={{
            marginBottom: 10,
          }}
        >
          Masukkan NPSN sekolah.
        </Text>
        {errors.instance && (
          <Text
            style={{
              color: "red",
              marginBottom: 10,
            }}
          >
            {errors.instance.message}
          </Text>
        )}

        <Button
          title="Ambil Data Sekolah"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}

function ActualLogin({
  honEssence,
  settingsState,
}: {
  honEssence: HonEssence;
  settingsState: AdminResponse;
}) {
  const { logIn } = useAuthStore();

  const formSchema = useMemo(() => {
    const validator = (txt: string) => {
      try {
        return new RegExp(
          settingsState.tokenSource,
          settingsState.tokenFlags,
        ).test(txt);
      } catch (_: any) {
        return false;
      }
    };

    return z.object({
      token: z
        .string()
        .min(1, {
          message: "Token wajib di isi!",
        })
        .min(settingsState.minimalTokenLength, {
          message: `Panjang token minimal ${settingsState.minimalTokenLength} karakter!`,
        })
        .max(settingsState.maximalTokenLength, {
          message: `Panjang token tidak boleh dari ${settingsState.maximalTokenLength} karakter!`,
        })
        .refine(validator, { message: "Format token tidak sesuai!" }),
    });
  }, [settingsState]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    logIn({
      instanceName: honEssence.name,
      npsn: honEssence.npsn,
      serverUrl: `${honEssence.origin}/api/trpc`,
      token: values.token,
      ...settingsState,
    });
  }

  return (
    <View>
      <Text>えんぴつ | Login</Text>

      <Text>
        Data sekolah berhasil didapatkan, masukkan token untuk melanjutkan
        proses login.
      </Text>

      <View>
        <Text>Nomor Instansi</Text>
        <TextInput
          editable={false}
          style={{
            opacity: 0.79,
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 10,
            paddingHorizontal: 10,
          }}
          value={String(honEssence.npsn)}
        />

        <Text>Nama Instansi</Text>
        <TextInput
          editable={false}
          style={{
            opacity: 0.79,
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 10,
            paddingHorizontal: 10,
          }}
          value={String(honEssence.name)}
        />

        <Text>Token</Text>
        <Controller
          control={control}
          name="token"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              editable={!isSubmitting}
              style={{
                height: 40,
                opacity: isSubmitting ? 0.5 : 1,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              onBlur={onBlur}
              onChangeText={onChange}
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
