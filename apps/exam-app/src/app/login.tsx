import type { AdminResponse } from "@/hooks/useStorage";
import type { TextInputProps } from "react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { fetch } from "expo/fetch";
import { useAuthStore } from "@/hooks/useStorage";
import { toast } from "@/lib/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface HonResponse {
  data: { name: string; npsn: number; origin: string };
}
type HonEssence = HonResponse["data"];

const api = {
  async getSchoolData(npsn: number): Promise<HonEssence | null> {
    try {
      // bug dari expo
      // environment yang bersifat public dan di inline harus di bongkar dulu dan disimpar ke dalam variabel.
      // ga tau apakah ini dari bug expo beneran atau compiler di laptop gw yang trippin.
      const srvUrl = process.env.EXPO_PUBLIC_NPSN_SRV_URL;

      const url = new URL(srvUrl!);
      const res = await fetch(`${url.origin}/school/${npsn}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { message: string };
        throw new Error(errorData.message || "Gagal mengambil data instansi");
      }

      const json = (await res.json()) as HonResponse;
      return json.data;
    } catch (err: any) {
      toast.error("Operasi Gagal", { description: err.message });
      return null;
    }
  },
  async getSettings(origin: string): Promise<AdminResponse | null> {
    try {
      const res = await fetch(`${origin}/api/settings`, {
        headers: { Accept: "application/json" },
      });
      return res.ok ? ((await res.json()) as AdminResponse) : null;
    } catch {
      toast.error("Operasi Gagal", {
        description: "Gagal memuat pengaturan sekolah.",
      });
      return null;
    }
  },
};

const BrandingHeader = () => (
  <View style={styles.headerContainer}>
    <View style={styles.logoBox}>
      <View style={styles.logoStripe} />
      <View style={styles.logoTriangle}>
        <Text style={styles.logoText}>鉛筆</Text>
      </View>
    </View>
    <View>
      <Text style={styles.brandTitle}>enpitsu</Text>
      <View style={styles.brandDivider} />
    </View>
  </View>
);

interface StyledInputProps extends TextInputProps {
  label: string;
  error?: string | boolean;
}

const StyledInput = ({ label, error, ...props }: StyledInputProps) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>

    <TextInput
      style={[
        styles.input,
        error && styles.inputError,
        props.editable === false && styles.disabledInput,
      ]}
      placeholderTextColor={styles.inputPlaceholder?.color || "#9ca3af"}
      {...props}
    />

    {typeof error === "string" && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export default function LoginScreen() {
  const [honEssence, setHonEssence] = useState<HonEssence | null>(null);
  const [settings, setSettings] = useState<AdminResponse | null>(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="default" />
      <View style={styles.card}>
        <BrandingHeader />
        {!honEssence || !settings ? (
          <GetSchoolInfo
            onComplete={(h, s) => {
              setHonEssence(h);
              setSettings(s);
            }}
          />
        ) : (
          <ActualLogin honEssence={honEssence} settings={settings} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function GetSchoolInfo({
  onComplete,
}: {
  onComplete: (h: HonEssence, s: AdminResponse) => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        instance: z.number({ invalid_type_error: "NPSN harus berupa angka" }),
      }),
    ),
  });

  const onSubmit = async (v: { instance: number }) => {
    const school = await api.getSchoolData(v.instance);
    if (school) {
      const sett = await api.getSettings(school.origin);
      if (sett) onComplete(school, sett);
    }
  };

  return (
    <View>
      <Text style={styles.stepTitle}>Cari Instansi</Text>
      <Text style={styles.stepDesc}>
        Masukkan NPSN sekolah untuk mencari data sekolah anda terlebih dahulu.
      </Text>

      <Controller
        control={control}
        name="instance"
        render={({ field: { onChange, onBlur, value } }) => (
          <StyledInput
            label="Nomor Pokok Sekolah Nasional"
            placeholder="Contoh: 10203040"
            keyboardType="numeric"
            onBlur={onBlur}
            onChangeText={(v: string) => onChange(v ? parseInt(v, 10) : "")}
            value={value?.toString()}
            error={errors.instance?.message}
            editable={!isSubmitting}
            onSubmitEditing={handleSubmit(onSubmit)}
            returnKeyType="go"
          />
        )}
      />

      <TouchableOpacity
        style={[styles.btn, styles.primaryBtn]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.btnText, { color: "#fff" }]}>Periksa Data</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function ActualLogin({
  honEssence,
  settings,
}: {
  honEssence: HonEssence;
  settings: AdminResponse;
}) {
  const { logIn } = useAuthStore();

  const dynamicSchema = useMemo(
    () =>
      z.object({
        token: z
          .string()
          .min(1, "Token wajib diisi")
          .min(
            settings.minimalTokenLength,
            `Minimal ${settings.minimalTokenLength} karakter`,
          )
          .max(
            settings.maximalTokenLength,
            `Maksimal ${settings.maximalTokenLength} karakter`,
          )
          .refine((val) => {
            try {
              return new RegExp(settings.tokenSource, settings.tokenFlags).test(
                val,
              );
            } catch {
              return false;
            }
          }, "Format token tidak valid"),
      }),
    [settings],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(dynamicSchema),
  });

  const onSubmit = (v: { token: string }) => {
    logIn({
      instanceName: honEssence.name,
      npsn: honEssence.npsn,
      serverUrl: `${honEssence.origin}/api/trpc`,
      token: v.token,
      ...settings,
    });
  };

  return (
    <View>
      <Text style={styles.stepTitle}>Masukkan Token</Text>
      <Text style={styles.stepDescSecondStep}>
        Data sekolah berhasil ditemukan! Mohon untuk memasukkan token akses yang
        tertera pada kartu ujian.
      </Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{honEssence.name}</Text>
      </View>

      <Controller
        control={control}
        name="token"
        render={({ field: { onChange, onBlur, value } }) => (
          <StyledInput
            label="Token Akses"
            placeholder="Masukkan token ujian"
            autoCapitalize="characters"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.token?.message}
            editable={!isSubmitting}
            onSubmitEditing={handleSubmit(onSubmit)}
            returnKeyType="go"
          />
        )}
      />

      <TouchableOpacity
        style={[styles.btn, styles.secondaryBtn]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.secondaryBtnText}>Masuk ke Aplikasi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    padding: theme.margins.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.margins.xl,
    borderRadius: theme.radius.lg,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },

  // --- Branding ---
  headerContainer: { alignItems: "center", marginBottom: theme.margins.xl },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: theme.radius.sm,
    marginBottom: theme.margins.sm,
  },
  logoStripe: {
    width: 200,
    height: 20,
    backgroundColor: "#F5F231",
    transform: [{ rotate: "-45deg" }],
    position: "absolute",
  },
  logoTriangle: {
    width: 40,
    height: 40,
    backgroundColor: "#3C3B39",
    transform: [{ rotate: "45deg" }],
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    transform: [{ rotate: "-45deg" }],
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.typography,
    letterSpacing: -1,
    textAlign: "center",
  },
  brandDivider: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.accent,
    marginTop: 4,
    borderRadius: 2,
    alignSelf: "center",
  },

  // --- Typography ---
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.typography,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.margins.lg,
  },
  stepDescSecondStep: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.margins.md,
  },

  // --- Inputs ---
  inputWrapper: { marginBottom: theme.margins.md },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.muted,
    marginBottom: theme.margins.sm,
    textTransform: "uppercase",
  },
  input: {
    height: 52,
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.margins.md,
    fontSize: 16,
    color: theme.colors.typography,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  // Use muted color for placeholder, ensuring it's readable on inputBg
  inputPlaceholder: { color: theme.colors.muted },
  inputError: { borderColor: theme.colors.error, borderWidth: 1.5 },
  disabledInput: { opacity: 0.5 },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

  // --- Buttons ---
  btn: {
    height: 56,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.margins.sm,
  },
  primaryBtn: { backgroundColor: theme.colors.primary },
  secondaryBtn: { backgroundColor: theme.colors.typography },

  btnText: {
    color: theme.colors.background,
    fontWeight: "800",
    fontSize: 16,
  },

  // --- Badge ---
  badge: {
    backgroundColor: theme.colors.inputBg,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    alignSelf: "flex-start",
    paddingHorizontal: theme.margins.md,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    marginBottom: theme.margins.md,
  },
  badgeText: { color: theme.colors.primary, fontSize: 12, fontWeight: "700" },

  secondaryBtnText: {
    // In Light Mode: Button is Dark -> Text is Light
    // In Dark Mode: Button is White -> Text is Dark
    color: theme.colors.background,
    fontWeight: "800",
    fontSize: 16,
  },
}));
