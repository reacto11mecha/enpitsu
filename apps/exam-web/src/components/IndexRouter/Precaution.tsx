import type { RouterOutputs } from "@enpitsu/api";
import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { id } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useIntersectionObserver } from "usehooks-ts";

type TData = RouterOutputs["exam"]["getQuestion"] | undefined;

const PrecautionChildren = ({
  data,
  setScrollBottom,
}: {
  data: TData;
  setScrollBottom: (scrolled: boolean) => void;
}) => {
  const { ref } = useIntersectionObserver({
    threshold: 1,
    onChange: setScrollBottom,
  });

  return (
    <div className="mt-8 max-h-72 w-auto space-y-5 overflow-y-scroll p-2 text-start">
      <div className="space-y-1">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Soal Ujian
        </h4>

        {data ? (
          <ul className="space-y-1.5 text-sm">
            <li>SOAL : {data.title}.</li>
            <li>JUMLAH PG : {data.multipleChoices.length}.</li>
            <li>JUMLAH ESAI : {data.essays.length}.</li>
            <li>
              WAKTU SOAL DIBUKA :{" "}
              {format(data.startedAt, "dd MMMM yyyy 'pukul' kk:mm", {
                locale: id,
              })}
              .
            </li>
            <li>
              WAKTU SOAL DITUTUP :{" "}
              {format(data.endedAt, "dd MMMM yyyy 'pukul' kk:mm", {
                locale: id,
              })}
              .
            </li>
            <li>
              LAMA PENGERJAAN :{" "}
              {formatDuration(
                intervalToDuration({
                  end: data.endedAt,
                  start: data.startedAt,
                }),
                { locale: id },
              )}
              .
            </li>
          </ul>
        ) : null}
      </div>

      <div className="space-y-1">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Perilaku Aplikasi
        </h4>

        <ul className="list-disc space-y-1.5 px-5 text-sm">
          <li>
            Jika sudah menekan tombol <b>"Kerjakan"</b> maka web ini memantau
            aktivitas yang berpotensi mencurigakan.
          </li>
          <li>
            Akan diberikan tiga kali (3) kesempatan untuk berpindah tab, lebih
            dari itu maka otomatis anda dinyatakan curang dan otomatis gugur.
          </li>
          <li>
            Harap hindari perangkat Anda dari layar yang mati (
            <i>screen timed out</i>), karena hal tersebut dapat dianggap sebagai
            tindakan curang.
          </li>
          <li>
            Jika waktu sudah menyentuh waktu selesai, maka anda tidak bisa
            mengumpulkan jawaban anda bagaimanapun caranya.
          </li>
        </ul>
      </div>

      <div className="space-y-1">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          Tata Tertib
        </h4>

        <ol className="list-decimal space-y-0.5 px-5">
          <li>Peserta harus hadir tepat waktu di ruang ujian.</li>
          <li>
            Peserta harus sudah menyiapkan kuota internet sebelum ujian dimulai.
          </li>
          <li>
            Peserta tidak boleh membuka tab lain selain aplikasi ujian ketika
            ujian berlangsung.
          </li>
          <li>
            Peserta harus membawa kartu tanda peserta ulangan dan alat tulis
            yang diperlukan.
          </li>
          <li>
            Peserta tidak boleh membawa alat komunikasi, buku catatan, atau
            barang-barang lain yang tidak diperlukan.
          </li>
          <li>Peserta harus duduk di kursi yang telah ditentukan.</li>
          <li>
            Peserta tidak boleh berbicara, berbisik, atau mengganggu peserta
            lain.
          </li>
          <li>
            Peserta tidak boleh mencontek atau membantu peserta lain mencontek.
          </li>
          <li ref={ref}>
            Peserta yang melanggar tata tertib akan dikenakan sanksi sesuai
            dengan peraturan yang berlaku.
          </li>
        </ol>
      </div>
    </div>
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
    <AlertDialog open={open} onOpenChange={close}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sebelum Mengerjakan,</AlertDialogTitle>
          <AlertDialogDescription>
            Baca keterangan dibawah ini dengan saksama! Scroll sampai bawah
            supaya bisa menekan tombol "Kerjakan".
          </AlertDialogDescription>

          <Separator />
          <PrecautionChildren data={data} setScrollBottom={setScrollBottom} />
          <Separator />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction asChild disabled={!scrolledToBottom}>
            {scrolledToBottom ? (
              <Link to={`/test/${data?.slug}`}>Kerjakan</Link>
            ) : (
              <Button disabled>Kerjakan</Button>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
