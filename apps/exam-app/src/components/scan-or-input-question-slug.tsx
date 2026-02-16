import { useCallback, useState } from "react";
import {
  Button,
  Modal,
  NativeScrollEvent,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
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
  });

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    getQuestionMutation.mutate(values);

  return (
    <View>
      <Text>Masukan kode soal</Text>

      <Text>Kode Soal</Text>
      <Controller
        control={control}
        name="slug"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            editable={!getQuestionMutation.isPending}
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
            }}
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
            placeholder="Masukkan kode soal disini."
          />
        )}
      />
      {errors.slug && (
        <Text style={{ color: "red" }}>{errors.slug.message}</Text>
      )}

      <Button
        title="Kerjakan soal"
        onPress={handleSubmit(onSubmit)}
        disabled={getQuestionMutation.isPending}
      />

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

type TData = RouterOutputs["exam"]["getQuestion"] | undefined;

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
      style={{ maxHeight: 400 }}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) {
          setScrollBottom(true);
        }
      }}
      scrollEventThrottle={400}
    >
      <View>
        <Text>Soal Ujian</Text>

        {data ? (
          <View>
            <Text>• SOAL : {data.title}.</Text>
            <Text>• JUMLAH PG : {data.multipleChoices.length}.</Text>
            <Text>• JUMLAH ESAI : {data.essays.length}.</Text>
            <Text>
              • WAKTU SOAL DIBUKA :{" "}
              {format(new Date(data.startedAt), "dd MMMM yyyy 'pukul' kk:mm", {
                locale: id,
              })}
              .
            </Text>
            <Text>
              • WAKTU SOAL DITUTUP :{" "}
              {format(new Date(data.endedAt), "dd MMMM yyyy 'pukul' kk:mm", {
                locale: id,
              })}
              .
            </Text>
            <Text>
              • LAMA PENGERJAAN :{" "}
              {formatDuration(
                intervalToDuration({
                  end: new Date(data.endedAt),
                  start: new Date(data.startedAt),
                }),
                { locale: id },
              )}
              .
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text>Perilaku Aplikasi</Text>
        <View>
          <Text>
            • Jika sudah menekan tombol "Kerjakan" maka aplikasi ini memantau
            aktivitas yang berpotensi mencurigakan.
          </Text>
          <Text>
            • Akan diberikan tiga kali (3) kesempatan untuk berpindah aplikasi,
            lebih dari itu maka otomatis anda dinyatakan curang dan otomatis
            gugur.
          </Text>
          <Text>
            • Harap hindari perangkat Anda dari layar yang mati (screen timed
            out), karena hal tersebut dapat dianggap sebagai tindakan curang.
          </Text>
          <Text>
            • Jika waktu sudah menyentuh waktu selesai, maka anda tidak bisa
            mengumpulkan jawaban anda bagaimanapun caranya.
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 20, paddingBottom: 20 }}>
        <Text>Tata Tertib</Text>
        <View>
          <Text>1. Peserta harus hadir tepat waktu di ruang ujian.</Text>
          <Text>
            2. Peserta harus sudah menyiapkan kuota internet sebelum ujian
            dimulai.
          </Text>
          <Text>
            3. Peserta tidak boleh membuka aplikasi lain selain aplikasi ujian
            ketika ujian berlangsung.
          </Text>
          <Text>
            4. Peserta harus membawa kartu tanda peserta ulangan dan alat tulis
            yang diperlukan.
          </Text>
          <Text>
            5. Peserta tidak boleh membawa alat komunikasi, buku catatan, atau
            barang-barang lain yang tidak diperlukan.
          </Text>
          <Text>6. Peserta harus duduk di kursi yang telah ditentukan.</Text>
          <Text>
            7. Peserta tidak boleh berbicara, berbisik, atau mengganggu peserta
            lain.
          </Text>
          <Text>
            8. Peserta tidak boleh mencontek atau membantu peserta lain
            mencontek.
          </Text>
          <Text>
            9. Peserta yang melanggar tata tertib akan dikenakan sanksi sesuai
            dengan peraturan yang berlaku.
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

  return (
    <Modal visible={open} animationType="slide" transparent={false}>
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Sebelum Mengerjakan,
        </Text>
        <Text>
          Baca keterangan dibawah ini dengan saksama! Scroll sampai bawah supaya
          bisa menekan tombol "Kerjakan".
        </Text>

        {/* Separator equivalent */}
        <View
          style={{ height: 1, backgroundColor: "#ccc", marginVertical: 10 }}
        />

        <PrecautionChildren data={data} setScrollBottom={setScrollBottom} />

        <View
          style={{ height: 1, backgroundColor: "#ccc", marginVertical: 10 }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <Button
            title="Batal"
            onPress={() => {
              close();
              setScrollBottom(false);
            }}
            color="red"
          />

          {scrolledToBottom ? (
            <Link href={`/test/${data?.slug}`} asChild>
              <Button
                title="Kerjakan"
                onPress={() => {
                  close();
                  setScrollBottom(false);
                }}
              />
            </Link>
          ) : (
            <Button title="Kerjakan" disabled={true} />
          )}
        </View>
      </View>
    </Modal>
  );
};
