import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  NativeScrollEvent,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Link } from "expo-router";
import { toast } from "@/lib/sonner";
import { useTRPC } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import { Controller, useForm } from "react-hook-form";
import slugify from "slugify";
import { z } from "zod";

import type { RouterOutputs } from "@enpitsu/api";

type TData = RouterOutputs["exam"]["getQuestion"] | undefined;

const formSchema = z.object({
  slug: z
    .string()
    .min(1, { message: "Kode soal wajib di isi!" })
    .min(4, { message: "Kode soal minimal memiliki panjang 4 karakter" }),
});

export function ScanOrInputQuestionSlug() {
  const [isPrecautionOpen, setOpen] = useState(false);

  const trpc = useTRPC();
  const getQuestionMutation = useMutation(
    trpc.exam.getQuestion.mutationOptions({
      onSuccess() {
        setOpen(true);
      },
      onError(error) {
        toast.error("Gagal mengambil data soal", {
          description: error.message,
        });
      },
    }),
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    Keyboard.dismiss();
    getQuestionMutation.mutate(values);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kode Soal</Text>
        <Controller
          control={control}
          name="slug"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              editable={!getQuestionMutation.isPending}
              style={[
                styles.input,
                errors.slug ? styles.inputError : undefined,
              ]}
              onBlur={onBlur}
              onChangeText={(val) =>
                onChange(
                  slugify(val, {
                    trim: false,
                    strict: true,
                    remove: /[*+~.()'"!:@]/g,
                  }).toUpperCase(),
                )
              }
              value={value}
              placeholder="Masukkan kode soal"
              // Note: placeholderTextColor isn't style, so we can't use styles.placeholder directly here
              // unless we extract the color string from the theme elsewhere.
              // For simplicity, we assume a static muted color or use inline theme access if needed.
              placeholderTextColor="#a1a1aa"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          )}
        />
        {errors.slug && (
          <Text style={styles.errorText}>{errors.slug.message}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          getQuestionMutation.isPending ? styles.buttonDisabled : undefined,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={getQuestionMutation.isPending}
        activeOpacity={0.8}
      >
        {getQuestionMutation.isPending ? (
          <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
        ) : null}
        <Text style={styles.primaryButtonText}>Kerjakan Soal</Text>
      </TouchableOpacity>

      <Precaution
        data={getQuestionMutation.data}
        open={isPrecautionOpen}
        close={() => {
          setOpen(false);
          getQuestionMutation.reset();
        }}
      />
    </View>
  );
}

const PrecautionChildren = ({
  data,
  setScrollBottom,
}: {
  data: TData;
  setScrollBottom: (scrolled: boolean) => void;
}) => {
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  return (
    <ScrollView
      style={styles.modalScroll}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) {
          setScrollBottom(true);
        }
      }}
      scrollEventThrottle={400}
      showsVerticalScrollIndicator={true}
      persistentScrollbar={true}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soal Ujian</Text>
        {data ? (
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• SOAL: {data.title}</Text>
            <Text style={styles.listItem}>
              • JUMLAH PG: {data.multipleChoices.length}
            </Text>
            <Text style={styles.listItem}>
              • JUMLAH ESAI: {data.essays.length}
            </Text>
            <Text style={styles.listItem}>
              • DIBUKA:{" "}
              {format(new Date(data.startedAt), "dd MMM yyyy HH:mm", {
                locale: id,
              })}
            </Text>
            <Text style={styles.listItem}>
              • DITUTUP:{" "}
              {format(new Date(data.endedAt), "dd MMM yyyy HH:mm", {
                locale: id,
              })}
            </Text>
            <Text style={styles.listItem}>
              • DURASI:{" "}
              {formatDuration(
                intervalToDuration({
                  end: new Date(data.endedAt),
                  start: new Date(data.startedAt),
                }),
                { locale: id },
              )}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perilaku Aplikasi</Text>
        <View style={styles.listContainer}>
          <Text style={styles.listItem}>
            • Jika sudah menekan tombol "Kerjakan" maka aplikasi ini memantau
            aktivitas yang berpotensi mencurigakan.
          </Text>
          <Text style={styles.listItem}>
            • Akan diberikan tiga kali (3) kesempatan untuk berpindah aplikasi,
            lebih dari itu maka otomatis anda dinyatakan curang dan otomatis
            gugur.
          </Text>
          <Text style={styles.listItem}>
            • Harap hindari perangkat Anda dari layar yang mati (screen timed
            out).
          </Text>
          <Text style={styles.listItem}>
            • Jika waktu sudah menyentuh waktu selesai, maka anda tidak bisa
            mengumpulkan jawaban anda bagaimanapun caranya.
          </Text>
        </View>
      </View>

      <View style={[styles.section, { paddingBottom: 20 }]}>
        <Text style={styles.sectionTitle}>Tata Tertib</Text>
        <View style={styles.listContainer}>
          <Text style={styles.listItem}>
            1. Peserta harus hadir tepat waktu di ruang ujian.
          </Text>
          <Text style={styles.listItem}>
            2. Peserta harus sudah menyiapkan kuota internet sebelum ujian
            dimulai.
          </Text>
          <Text style={styles.listItem}>
            3. Peserta tidak boleh membuka aplikasi lain selain aplikasi ujian.
          </Text>
          <Text style={styles.listItem}>
            4. Peserta harus membawa kartu tanda peserta ulangan.
          </Text>
          <Text style={styles.listItem}>
            5. Peserta tidak boleh membawa alat komunikasi atau buku catatan.
          </Text>
          <Text style={styles.listItem}>
            6. Peserta harus duduk di kursi yang telah ditentukan.
          </Text>
          <Text style={styles.listItem}>
            7. Peserta tidak boleh berbicara atau mengganggu peserta lain.
          </Text>
          <Text style={styles.listItem}>8. Peserta tidak boleh mencontek.</Text>
          <Text style={styles.listItem}>
            9. Peserta yang melanggar tata tertib akan dikenakan sanksi.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export const Precaution = ({
  data,
  open,
  close,
}: {
  data: TData;
  open: boolean;
  close: () => void;
}) => {
  const [scrolledToBottom, setScroll] = useState(false);

  const setScrollBottom = useCallback(
    (scrolled: boolean) => setScroll(scrolled),
    [],
  );

  const handleClose = () => {
    close();
    setScrollBottom(false);
  };

  return (
    <Modal
      visible={open}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlayBackground} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sebelum Mengerjakan</Text>
            <Text style={styles.modalDescription}>
              Baca keterangan dibawah ini dengan saksama! Scroll sampai bawah
              supaya bisa menekan tombol "Kerjakan".
            </Text>
          </View>

          <View style={styles.separator} />

          <PrecautionChildren data={data} setScrollBottom={setScrollBottom} />

          <View style={styles.separator} />

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>

            {scrolledToBottom ? (
              <Link href={`/test/${data?.slug}`} replace asChild>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>Kerjakan</Text>
                </TouchableOpacity>
              </Link>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.buttonDisabled]}
                disabled={true}
                activeOpacity={1}
              >
                <Text style={styles.actionButtonText}>Kerjakan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
  },
  formGroup: {
    marginBottom: theme.margins.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: theme.margins.sm,
    color: theme.colors.typography,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.margins.md,
    fontSize: 16,
    backgroundColor: theme.colors.inputBg,
    color: theme.colors.typography,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.error,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: theme.margins.lg,
  },
  modalOverlayBackground: {
    // Standard StyleSheet.absoluteFillObject can be used,
    // but if you want Unistyles specific you can define it manually
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  modalHeader: {
    padding: theme.margins.lg,
    paddingBottom: theme.margins.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.typography,
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: "100%",
  },
  modalScroll: {
    paddingHorizontal: theme.margins.lg,
  },
  section: {
    marginTop: theme.margins.md,
    marginBottom: theme.margins.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.typography,
    marginBottom: theme.margins.sm,
  },
  listContainer: {
    gap: 4,
  },
  listItem: {
    fontSize: 14,
    color: theme.colors.typography,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: theme.margins.md,
    gap: 12,
    backgroundColor: theme.colors.background,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.typography,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
}));
