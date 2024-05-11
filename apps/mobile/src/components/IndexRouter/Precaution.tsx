import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { InView, IOScrollView } from "react-native-intersection-observer";
import { Link } from "expo-router";
import type { RouterOutputs } from "@enpitsu/api";
import { FlashList } from "@shopify/flash-list";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";

type TData = RouterOutputs["exam"]["getQuestion"] | undefined;

function Separator({ additionalClass }: { additionalClass: string }) {
  return (
    <View
      className={`h-1 w-[390px] border-t border-stone-300 dark:border-stone-700 ${additionalClass}`}
    />
  );
}

const appBehaviour = [
  {
    label:
      'Jika sudah menekan tombol "Kerjakan" maka aplikasi ini memantau aktivitas yang berpotensi mencurigakan.',
  },
  {
    label:
      "Akan diberikan tiga (3) kali kesempatan untuk berpindah aplikasi, lebih dari itu maka otomatis anda dinyatakan curang dan otomatis gugur.",
  },
  {
    label:
      "Jika waktu sudah menyentuh waktu selesai, maka anda tidak bisa mengumpulkan jawaban anda bagaimanapun caranya.",
  },
];

const codeOfConduct = [
  { label: "Peserta harus hadir tepat waktu di ruang ujian." },
  {
    label:
      "Peserta harus sudah menyiapkan kuota internet sebelum ujian dimulai.",
  },
  {
    label:
      "Peserta tidak boleh membuka tab lain selain aplikasi ujian ketika ujian berlangsung.",
  },
  {
    label:
      "Peserta harus membawa kartu tanda peserta ulangan dan alat tulis yang diperlukan.",
  },
  {
    label:
      "Peserta tidak boleh membawa alat komunikasi, buku catatan, atau barang-barang lain yang tidak diperlukan.",
  },
  { label: "Peserta harus duduk di kursi yang telah ditentukan." },
  {
    label:
      "Peserta tidak boleh berbicara, berbisik, atau mengganggu peserta lain.",
  },
  {
    label:
      "Peserta tidak boleh mencontek atau membantu peserta lain mencontek.",
  },
  {
    label:
      "Peserta yang melanggar tata tertib akan dikenakan sanksi sesuai dengan peraturan yang berlaku.",
  },
];

const PrecautionChildren = ({
  data,
  setScrollBottom,
}: {
  data: NonNullable<TData>;
  setScrollBottom: (scrolled: boolean) => void;
}) => {
  const questionIdentity = useMemo(
    () => [
      {
        title: "SOAL",
        label: data.title,
      },
      {
        title: "JUMLAH PG",
        label: data.multipleChoices.length,
      },
      { title: "JUMLAH ESAI", label: data.essays.length },
      {
        title: "WAKTU SOAL DIBUKA",
        label: format(data.startedAt, "dd MMMM yyyy 'pukul' kk:mm", {
          locale: id,
        }),
      },
      {
        title: "WAKTU SOAL DITUTUP",
        label: format(data.endedAt, "dd MMMM yyyy 'pukul' kk:mm", {
          locale: id,
        }),
      },
      {
        title: "LAMA PENGERJAAN",
        label: formatDuration(
          intervalToDuration({
            end: data.endedAt,
            start: data.startedAt,
          }),
          { locale: id },
        ),
      },
    ],
    [data],
  );

  return (
    <IOScrollView>
      <ScrollView className="w-full py-5">
        <View>
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            Soal Ujian
          </Text>

          <View className="mt-2">
            {questionIdentity.map((question) => (
              <Text
                className="text-[16px]/8 text-stone-900 dark:text-stone-50"
                key={question.title}
              >
                {question.title}: <Text>{question.label}.</Text>
              </Text>
            ))}
          </View>
        </View>

        <View className="mt-7">
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            Perilaku Aplikasi
          </Text>

          <View>
            {appBehaviour.map((item, index) => (
              <Text
                className="mt-2 text-[15px]/loose text-stone-900 dark:text-stone-50"
                key={index}
              >
                <Text className="font-bold">{index + 1}</Text>. {item.label}
              </Text>
            ))}
          </View>
        </View>

        <View className="mt-7">
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            Tata Tertib
          </Text>

          <View style={{ minHeight: 250 }}>
            <FlashList
              data={codeOfConduct}
              renderItem={({ item, index }) => (
                <InView
                  onChange={(inView: boolean) => {
                    if (index === 8) {
                      setScrollBottom(inView);
                    }
                  }}
                >
                  <Text className="mt-2 text-[15px]/loose text-stone-900 dark:text-stone-50">
                    <Text className="font-bold">{index + 1}</Text>. {item.label}
                  </Text>
                </InView>
              )}
              estimatedItemSize={10}
            />
          </View>
        </View>
      </ScrollView>
    </IOScrollView>
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
    <Modal
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      visible={open}
      onRequestClose={close}
    >
      <View className="mt-8 flex h-screen items-center items-center justify-between bg-stone-50 p-3 py-10 dark:bg-stone-900">
        <View>
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            Sebelum Mengerjakan,
          </Text>
          <Text className="mt-1 text-stone-900/70 dark:text-stone-50/70">
            Baca keterangan dibawah ini dengan saksama! Scroll sampai bawah
            supaya bisa menekan tombol "Kerjakan".
          </Text>

          <Separator additionalClass="mt-5" />
        </View>

        {data ? (
          <PrecautionChildren data={data} setScrollBottom={setScrollBottom} />
        ) : null}

        <View>
          <Separator additionalClass="mb-5" />

          <View className="flex flex-row justify-end gap-2">
            <Pressable
              className="flex h-[45] w-20 items-center justify-center rounded-lg border border-stone-300 dark:border-stone-700"
              onPress={close}
            >
              <Text className="text-center text-stone-900 dark:text-slate-50">
                Batal
              </Text>
            </Pressable>

            {data ? (
              <Link
                replace
                asChild
                href={{
                  pathname: "/test/[slug]",
                  params: { slug: data.slug },
                }}
              >
                <Pressable
                  className="flex h-[45] w-24 items-center justify-center rounded-lg bg-stone-900 disabled:bg-stone-600 dark:bg-stone-100 disabled:dark:bg-stone-400"
                  disabled={!scrolledToBottom}
                >
                  <Text className="text-center text-slate-50 dark:text-stone-900">
                    Kerjakan
                  </Text>
                </Pressable>
              </Link>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};
