"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LaptopMinimalCheck,
  Loader2,
  LoaderPinwheel,
  OctagonX,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/react";

interface Props {
  questionId: number;
}

const DEFAULT_FETCH_TIME = 3000;

export const EligibleStatus = memo(function EligibleStatus({
  questionId,
}: Props) {
  const [eligibleRefetchInterval, setERI] = useState(DEFAULT_FETCH_TIME);
  const [sheetOpened, setOpened] = useState(false);

  const trpc = useTRPC();

  const eligibleQuestionStatus = useQuery(
    trpc.question.getEligibleStatusFromQuestion.queryOptions(
      { questionId },
      {
        refetchOnWindowFocus: false,
        refetchInterval: eligibleRefetchInterval,
      },
    ),
  );

  useEffect(() => {
    if (eligibleQuestionStatus.data) {
      if (
        eligibleRefetchInterval === 0 &&
        eligibleQuestionStatus.data.eligible === "PROCESSING"
      )
        setERI(5000);
      else if (
        eligibleRefetchInterval === 5000 &&
        eligibleQuestionStatus.data.eligible === "ELIGIBLE"
      )
        setERI(DEFAULT_FETCH_TIME);
    }
  }, [eligibleQuestionStatus.data, eligibleRefetchInterval]);

  const currentStatus = useMemo(() => {
    if (eligibleQuestionStatus.isPending)
      return {
        readable: "Sedang mengambil data status ke server...",
        showReason: false,
      };
    if (eligibleQuestionStatus.isError)
      return {
        readable: "Gagal mengambil data status ke server.",
        showReason: false,
      };

    if (!eligibleQuestionStatus.data)
      return {
        readable: "Status data kosong, mohon menunggu...",
        showReason: false,
      };

    switch (eligibleQuestionStatus.data.eligible) {
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
  }, [eligibleQuestionStatus]);

  return (
    <div className="w-full md:fixed md:right-2 md:bottom-2 md:w-fit">
      <Sheet
        open={sheetOpened}
        onOpenChange={() => {
          setOpened((prev) => !prev);
        }}
      >
        <SheetTrigger asChild>
          <Button
            variant={eligibleQuestionStatus.isError ? "destructive" : "default"}
            className="h-10 w-full md:w-fit"
          >
            {eligibleQuestionStatus.isPending ? (
              <Loader2 className="!h-7 !w-7 animate-spin" />
            ) : eligibleQuestionStatus.data?.eligible === "NOT_ELIGIBLE" ||
              eligibleQuestionStatus.isError ? (
              <OctagonX
                className={cn(
                  "!h-7 !w-7",
                  !eligibleQuestionStatus.isError &&
                    "text-red-500 dark:text-red-700",
                )}
              />
            ) : eligibleQuestionStatus.data?.eligible === "PROCESSING" ? (
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

            <p className="mt-2 text-sm text-wrap">
              Status saat ini: {currentStatus.readable}
            </p>

            {currentStatus.showReason ? (
              <p className="text-sm text-pretty">
                Alasan:{" "}
                {eligibleQuestionStatus.data?.notEligibleReason ?? "N/A"}
              </p>
            ) : null}

            {currentStatus.showReason &&
            eligibleQuestionStatus.data?.detailedNotEligible ? (
              <div className="mt-12 flex max-h-[55vh] flex-col gap-5 overflow-y-auto pb-14">
                {eligibleQuestionStatus.data.detailedNotEligible.some(
                  (detail) => detail.type === "choice",
                ) ? (
                  <div className="space-y-2">
                    <p className="text-base text-wrap">
                      Kesalahan Pada Pilihan Ganda
                    </p>

                    <ul className="list-disc space-y-1.5 pl-5">
                      {eligibleQuestionStatus.data.detailedNotEligible
                        .filter((d) => d.type === "choice")
                        .map((d) => (
                          <li className="text-sm text-pretty" key={d.iqid}>
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

                {eligibleQuestionStatus.data.detailedNotEligible.some(
                  (detail) => detail.type === "essay",
                ) ? (
                  <div className="space-y-2">
                    <p className="text-base text-wrap">Kesalahan Pada Esai</p>

                    <ul className="list-disc space-y-1.5 pl-5">
                      {eligibleQuestionStatus.data.detailedNotEligible
                        .filter((d) => d.type === "essay")
                        .map((d) => (
                          <li className="text-sm text-pretty" key={d.iqid}>
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
