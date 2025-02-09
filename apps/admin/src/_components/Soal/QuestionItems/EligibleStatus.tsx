import type { RouterOutputs } from "@enpitsu/api";
import { memo } from "react";
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
  data: RouterOutputs["question"]["getEligibleStatusFromQuestion"];
}

export const EligibleStatus = memo(function EligibleStatus({
  isPending,
  isError,
  data,
}: Props) {
  return (
    <div className="w-full md:fixed md:bottom-2 md:right-2 md:w-fit">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant={isError ? "destructive" : ""}
            className="w-full md:w-fit"
          >
            {isPending ? (
              <Loader2 className="h-24 w-24 animate-spin" />
            ) : data.eligible === "NOT_ELIGIBLE" || isError ? (
              <OctagonX
                className={cn("h-24 w-24", !isError && "text-red-500")}
              />
            ) : data.eligible === "PROCESSING" ? (
              <LoaderPinwheel className="h-24 w-24 animate-spin" />
            ) : (
              <LaptopMinimalCheck className="h-24 w-24" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Status Kelayakan Pengerjaan Soal</SheetTitle>
            <SheetDescription>
              Soal dapat dikatakan layak untuk dikerjakan oleh peserta apabila
              terdapat soal pilihan ganda atau soal esai atau ada keduanya.
              Setiap soal wajib memiliki pertanyaan dan opsi jawaban. Pada
              bagian ini, anda dapat mengetahui kesalahan yang anda dapat
              perbaiki.
            </SheetDescription>

            <p className="mt-2">Status: LOADING</p>

            <pre>{JSON.stringify(data, null, 2)}</pre>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
});
