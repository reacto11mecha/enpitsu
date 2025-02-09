import type { RouterOutputs } from "@enpitsu/api";
import { memo, useMemo } from "react";
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
  const currentStatus = useMemo(() => {
    if (isPending)
      return { readable: "Sedang mengambil data status ke server..." };
    if (isError) return { readable: "Gagal mengambil data status ke server." };

    if (!data) return { readable: "Status data kosong, mohon menunggu..." };

    switch (data.eligible) {
      case "ELIGIBLE":
        return { readable: "Status aman, peserta dapat mengerjakan soal ini" };
      case "PROCESSING":
        return { readable: "Sedang dilakukan pengecekan..." };
      case "NOT_ELIGIBLE":
      default:
        return { readable: "Soal tidak layak dikerjakan" };
    }
  }, [isPending, isError, data]);

  return (
    <div className="w-full md:fixed md:bottom-2 md:right-2 md:w-fit">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant={isError ? "destructive" : "default"}
            className="w-full md:w-fit"
          >
            {isPending ? (
              <Loader2 className="h-24 w-24 animate-spin" />
            ) : data?.eligible === "NOT_ELIGIBLE" || isError ? (
              <OctagonX
                className={cn("h-24 w-24", !isError && "text-red-500")}
              />
            ) : data?.eligible === "PROCESSING" ? (
              <LoaderPinwheel className="h-24 w-24 animate-spin" />
            ) : (
              <LaptopMinimalCheck className="h-24 w-24 text-green-500" />
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
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
});
