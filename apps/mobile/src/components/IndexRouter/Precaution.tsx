import React from "react";
import { ScrollView, View } from "react-native";
import { InView, IOScrollView } from "react-native-intersection-observer";
import { Link } from "expo-router";
import type { RouterOutputs } from "@enpitsu/api";
import { FlashList } from "@shopify/flash-list";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import {
  AlertDialog,
  Button,
  H4,
  Paragraph,
  Separator,
  Text,
  XStack,
  YStack,
} from "tamagui";

type TData = RouterOutputs["exam"]["getQuestion"] | undefined;

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
  const questionIdentity = React.useMemo(
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
    <YStack w="100%" h={250}>
      <IOScrollView>
        <ScrollView style={{ flex: 1 }}>
          <YStack gap={20}>
            <YStack gap={5}>
              <H4>Soal Ujian</H4>

              <YStack>
                {questionIdentity.map((question) => (
                  <Text fontWeight="bold" key={question.title}>
                    {question.title}: <Text>{question.label}.</Text>
                  </Text>
                ))}
              </YStack>
            </YStack>

            <YStack gap={5}>
              <H4>Perilaku Aplikasi</H4>

              <YStack>
                {appBehaviour.map((item, index) => (
                  <Paragraph key={index}>
                    <Text fontWeight="bold">{index + 1}</Text>. {item.label}
                  </Paragraph>
                ))}
              </YStack>
            </YStack>

            <YStack gap={5}>
              <H4>Tata Tertib</H4>

              <YStack minHeight={10}>
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
                      <Paragraph>
                        <Text fontWeight="bold">{index + 1}</Text>. {item.label}
                      </Paragraph>
                    </InView>
                  )}
                  estimatedItemSize={10}
                />
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      </IOScrollView>
    </YStack>
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
  const [scrolledToBottom, setScroll] = React.useState(false);

  const setScrollBottom = React.useCallback(
    (scrolled: boolean) => setScroll(scrolled),
    [],
  );

  return (
    <AlertDialog open={open} onOpenChange={close}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          <YStack space>
            <AlertDialog.Title>Sebelum Mengerjakan,</AlertDialog.Title>
            <AlertDialog.Description>
              Baca keterangan dibawah ini dengan saksama! Scroll sampai bawah{" "}
              {/*eslint-disable-next-line react/no-unescaped-entities */}
              supaya bisa menekan tombol "Kerjakan".
            </AlertDialog.Description>

            <Separator />

            {data ? (
              <PrecautionChildren
                data={data}
                setScrollBottom={setScrollBottom}
              />
            ) : null}

            <Separator />

            <XStack justifyContent="flex-end" space="$2">
              <AlertDialog.Cancel asChild>
                <Button>Batal</Button>
              </AlertDialog.Cancel>

              {data ? (
                <Link
                  replace
                  asChild
                  href={{
                    pathname: "/test/[slug]",
                    params: { slug: data.slug },
                  }}
                >
                  <Button disabled={!scrolledToBottom} onPress={close}>
                    Kerjakan
                  </Button>
                </Link>
              ) : null}
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};
