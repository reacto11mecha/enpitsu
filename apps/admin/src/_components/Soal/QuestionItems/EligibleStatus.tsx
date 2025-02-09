import type { RouterOutputs } from "@enpitsu/api";
import { memo, useMemo, useState } from "react";
import { cn } from "@enpitsu/ui";
import { Button } from "@enpitsu/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@enpitsu/ui/sheet";
import {
  LaptopMinimalCheck,
  Loader2,
  LoaderPinwheel,
  OctagonX,
} from "lucide-react";

interface Props {
  isPending: boolean;
  isError: boolean;
  data: RouterOutputs["question"]["getEligibleStatusFromQuestion"] | undefined;
}

export const EligibleStatus = memo(function EligibleStatus({
  isPending,
  isError,
  data,
}: Props) {
  const [sheetOpened, setOpened] = useState(false);

  const currentStatus = useMemo(() => {
    if (isPending)
      return {
        readable: "Sedang mengambil data status ke server...",
        showReason: false,
      };
    if (isError)
      return {
        readable: "Gagal mengambil data status ke server.",
        showReason: false,
      };

    if (!data)
      return {
        readable: "Status data kosong, mohon menunggu...",
        showReason: false,
      };

    switch (data.eligible) {
      case "ELIGIBLE":
        return {
          readable: "Status aman, peserta dapat mengerjakan soal ini.",
          showReason: false,
        };
      case "PROCESSING":
        return {
          readable: "Sedang dilakukan pengecekan...",
          showReason: false,
        };
      case "NOT_ELIGIBLE":
      default:
        return { readable: "Soal tidak layak dikerjakan.", showReason: true };
    }
  }, [isPending, isError, data]);

  return (
    <div className="w-full md:fixed md:bottom-2 md:right-2 md:w-fit">
      <Sheet
        open={sheetOpened}
        onOpenChange={() => {
          setOpened((prev) => !prev);
        }}
      >
        <SheetTrigger asChild>
          <Button
            variant={isError ? "destructive" : "default"}
            className="h-10 w-full md:w-fit"
          >
            {isPending ? (
              <Loader2 className="!h-7 !w-7 animate-spin" />
            ) : data?.eligible === "NOT_ELIGIBLE" || isError ? (
              <OctagonX
                className={cn(
                  "!h-7 !w-7",
                  !isError && "text-red-500 dark:text-red-700",
                )}
              />
            ) : data?.eligible === "PROCESSING" ? (
              <LoaderPinwheel className="!h-7 !w-7 animate-spin" />
            ) : (
              <LaptopMinimalCheck className="!h-7 !w-7 text-green-500 dark:text-green-700" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Status Kelayakan Pengerjaan Soal</SheetTitle>
            <SheetDescription className="text-justify">
              Soal dapat dikatakan layak untuk dikerjakan oleh peserta apabila
              terdapat soal pilihan ganda atau soal esai atau ada keduanya.
              Setiap soal wajib memiliki pertanyaan dan opsi jawaban. Pada
              bagian ini, anda dapat mengetahui kesalahan yang anda dapat
              perbaiki.
            </SheetDescription>

            <p className="mt-2 text-wrap text-sm">
              Status saat ini: {currentStatus.readable}
            </p>

            {currentStatus.showReason ? (
              <p className="text-pretty text-sm">
                Alasan: {data?.notEligibleReason ?? "N/A"}
              </p>
            ) : null}

            {currentStatus.showReason &&
            data?.detailedNotEligible.length > 0 ? (
              <div className="mt-12 flex max-h-[55vh] flex-col gap-5 overflow-y-auto pb-14">
                {data.detailedNotEligible.some(
                  (detail) => detail.type === "choice",
                ) ? (
                  <div className="space-y-2">
                    <p className="text-wrap text-base">
                      Kesalahan Pada Pilihan Ganda
                    </p>

                    <ul className="list-disc space-y-1.5 pl-5">
                      {data.detailedNotEligible
                        .filter((d) => d.type === "choice")
                        .map((d) => (
                          <li className="text-pretty text-sm" key={d.iqid}>
                            <button
                              className="underline"
                              onClick={() => {
                                const el = document.querySelector(
                                  `#choice-iqid-${d.iqid}`,
                                );

                                if (el) {
                                  setOpened(false);

                                  setTimeout(
                                    () =>
                                      el.scrollIntoView({ behavior: "smooth" }),
                                    585,
                                  );
                                }
                              }}
                            >
                              KE SOAL
                            </button>{" "}
                            | {d.errorMessage}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}

                {data.detailedNotEligible.some(
                  (detail) => detail.type === "essay",
                ) ? (
                  <div className="space-y-2">
                    <p className="text-wrap text-base">Kesalahan Pada Esai</p>

                    <ul className="list-disc space-y-1.5 pl-5">
                      {data.detailedNotEligible
                        .filter((d) => d.type === "essay")
                        .map((d) => (
                          <li className="text-pretty text-sm" key={d.iqid}>
                            <button
                              className="underline"
                              onClick={() => {
                                const el = document.querySelector(
                                  `#essay-iqid-${d.iqid}`,
                                );

                                if (el) {
                                  setOpened(false);

                                  setTimeout(
                                    () =>
                                      el.scrollIntoView({ behavior: "smooth" }),
                                    585,
                                  );
                                }
                              }}
                            >
                              KE SOAL
                            </button>{" "}
                            | {d.errorMessage}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
});
