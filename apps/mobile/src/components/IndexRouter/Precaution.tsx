import { useCallback, useMemo, useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";
// import { InView, IOScrollView } from "react-native-intersection-observer";
// import { Link } from "expo-router";
import type { RouterOutputs } from "@enpitsu/api";
// import { FlashList } from "@shopify/flash-list";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";

type TData = RouterOutputs["exam"]["getQuestion"] | undefined;

const _appBehaviour = [
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

const _codeOfConduct = [
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

const _PrecautionChildren = ({
  data,
}: {
  data: NonNullable<TData>;
  setScrollBottom: (scrolled: boolean) => void;
}) => {
  const _questionIdentity = useMemo(
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

  return <></>;
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

  console.log(data, open);

  const _setScrollBottom = useCallback(
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
      <View className="items-center bg-gray-50 p-16">
        <Text>somethign</Text>
      </View>
    </Modal>
  );
};
